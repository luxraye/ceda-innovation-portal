"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DISTRICT_COORDS } from "@/lib/geo";

export type GlobeDistrict = { name: string; count: number };

const HQ: [number, number] = DISTRICT_COORDS.Gaborone;
const FOCUS: [number, number] = [-22.3, 24.4]; // centre of Botswana

function toXYZ(lat: number, lng: number, r = 1) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const DOT_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(world.xyz);
    vec3 toCam = normalize(cameraPosition - world.xyz);
    float facing = dot(n, toCam);
    vFade = smoothstep(0.0, 0.35, facing);
    float twinkle = 0.85 + 0.15 * sin(uTime * 1.6 + aSeed * 40.0);
    vColor = aColor * twinkle;
    vec4 mv = viewMatrix * world;
    gl_PointSize = aSize * uPixelRatio * (3.2 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const DOT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.32, d) * vFade;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const RISE_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    float t = fract(uTime * (0.05 + aSeed * 0.05) + aSeed * 7.0);
    vec3 n = normalize(position);
    vec3 p = position + n * (t * 0.42);
    vAlpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.55, 1.0, t));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.0 + aSeed * 3.0) * uPixelRatio * (3.2 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const RISE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(1.0, 0.82, 0.62, a);
  }
`;

const ARC_VERT = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ARC_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  varying float vT;
  void main() {
    float head = fract(uTime * 0.28 + uOffset);
    float d = head - vT;
    float trail = smoothstep(0.35, 0.0, d) * step(0.0, d);
    float base = 0.12;
    float a = base + trail * 0.95;
    vec3 col = mix(vec3(0.85, 0.29, 0.08), vec3(1.0, 0.92, 0.78), trail);
    gl_FragColor = vec4(col, a);
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const ATMO_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Back faces only: strongest at the planet's edge, fading to the outer rim.
    float i = clamp(-dot(vNormal, vView), 0.0, 1.0);
    float glow = pow(clamp(i / 0.57, 0.0, 1.0), 9.0);
    gl_FragColor = vec4(0.94, 0.38, 0.13, glow * 0.75);
  }
`;

type Props = {
  districts: GlobeDistrict[];
  className?: string;
};

export function Globe({ districts, className }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    const pr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Orientation: tilt group (x) holds a spin group (y) so Botswana faces the camera.
    const tilt = new THREE.Group();
    const spin = new THREE.Group();
    tilt.add(spin);
    scene.add(tilt);
    const f = toXYZ(FOCUS[0], FOCUS[1]);
    const baseY = -Math.atan2(f.x, f.z);
    const zAfter = Math.hypot(f.x, f.z);
    const baseX = Math.atan2(f.y, zAfter);
    spin.rotation.y = baseY;
    tilt.rotation.x = baseX;

    const uniforms = { uTime: { value: 0 }, uPixelRatio: { value: pr } };
    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

    // Occluder: hides the far side of the dot cloud.
    const core = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.995, 64, 64)),
      track(new THREE.MeshBasicMaterial({ color: 0x170f0b })),
    );
    spin.add(core);

    // Atmosphere rim.
    const atmo = new THREE.Mesh(
      track(new THREE.SphereGeometry(1.22, 64, 64)),
      track(
        new THREE.ShaderMaterial({
          vertexShader: ATMO_VERT,
          fragmentShader: ATMO_FRAG,
          side: THREE.BackSide,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    atmo.scale.setScalar(1.0);
    tilt.add(atmo);

    // Background stars.
    {
      const n = 600;
      const pos = new Float32Array(n * 3);
      const size = new Float32Array(n);
      const color = new Float32Array(n * 3);
      const seed = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(14 + Math.random() * 10);
        pos.set([v.x, v.y, v.z], i * 3);
        size[i] = 1 + Math.random() * 2.2;
        const c = 0.45 + Math.random() * 0.4;
        color.set([c, c * 0.9, c * 0.8], i * 3);
        seed[i] = Math.random();
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      const m = track(
        new THREE.ShaderMaterial({
          vertexShader: DOT_VERT.replace("vFade = smoothstep(0.0, 0.35, facing);", "vFade = 0.7;"),
          fragmentShader: DOT_FRAG,
          uniforms,
          transparent: true,
          depthWrite: false,
        }),
      );
      scene.add(new THREE.Points(g, m));
    }

    const arcMats: THREE.ShaderMaterial[] = [];

    fetch("/globe-points.json")
      .then((r) => r.json())
      .then((data: { world: number[]; botswana: number[] }) => {
        if (disposed) return;
        const total = data.world.length / 2 + data.botswana.length / 2;
        const pos = new Float32Array(total * 3);
        const size = new Float32Array(total);
        const color = new Float32Array(total * 3);
        const seed = new Float32Array(total);
        let k = 0;
        const push = (lng: number, lat: number, s: number, c: [number, number, number]) => {
          const v = toXYZ(lat, lng, 1.001);
          pos.set([v.x, v.y, v.z], k * 3);
          size[k] = s;
          color.set(c, k * 3);
          seed[k] = Math.random();
          k++;
        };
        for (let i = 0; i < data.world.length; i += 2) {
          const lng = data.world[i];
          const lat = data.world[i + 1];
          // Africa a touch brighter than the rest of the world.
          const africa = lat < 37 && lat > -36 && lng > -18 && lng < 52;
          const b = africa ? 0.85 : 0.55;
          push(lng, lat, africa ? 2.6 : 2.3, [b * 1.0, b * 0.72, b * 0.5]);
        }
        for (let i = 0; i < data.botswana.length; i += 2) push(data.botswana[i], data.botswana[i + 1], 3.0, [1.0, 0.45, 0.14]);

        const g = track(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
        g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
        g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
        const m = track(
          new THREE.ShaderMaterial({ vertexShader: DOT_VERT, fragmentShader: DOT_FRAG, uniforms, transparent: true, depthWrite: false }),
        );
        spin.add(new THREE.Points(g, m));

        // Ideas rising from Botswana into the sky.
        const rn = 140;
        const rpos = new Float32Array(rn * 3);
        const rseed = new Float32Array(rn);
        const bwCount = data.botswana.length / 2;
        for (let i = 0; i < rn; i++) {
          const j = Math.floor(Math.random() * bwCount) * 2;
          const v = toXYZ(data.botswana[j + 1], data.botswana[j], 1.002);
          rpos.set([v.x, v.y, v.z], i * 3);
          rseed[i] = Math.random();
        }
        const rg = track(new THREE.BufferGeometry());
        rg.setAttribute("position", new THREE.BufferAttribute(rpos, 3));
        rg.setAttribute("aSeed", new THREE.BufferAttribute(rseed, 1));
        const rm = track(
          new THREE.ShaderMaterial({
            vertexShader: RISE_VERT,
            fragmentShader: RISE_FRAG,
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        spin.add(new THREE.Points(rg, rm));
        setReady(true);
      })
      .catch(() => setReady(true));

    // District pins and arcs into CEDA HQ.
    const hq = toXYZ(HQ[0], HQ[1], 1.002);
    const max = Math.max(1, ...districts.map((d) => d.count));
    districts.forEach((d, idx) => {
      const ll = DISTRICT_COORDS[d.name];
      if (!ll || d.count === 0) return;
      const base = toXYZ(ll[0], ll[1], 1.002);
      const h = 0.04 + (d.count / max) * 0.16;
      const tip = base.clone().normalize().multiplyScalar(1.002 + h);
      const beamGeo = track(new THREE.BufferGeometry().setFromPoints([base, tip]));
      beamGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array([0, 1]), 1));
      const beamMat = track(
        new THREE.ShaderMaterial({
          vertexShader: ARC_VERT,
          fragmentShader: /* glsl */ `varying float vT; void main(){ gl_FragColor = vec4(mix(vec3(0.98,0.73,0.23), vec3(0.85,0.29,0.08), vT), (1.0 - vT) * 0.95); }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      spin.add(new THREE.Line(beamGeo, beamMat));
      const capGeo = track(new THREE.BufferGeometry().setFromPoints([base]));
      capGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([6 + (d.count / max) * 6]), 1));
      capGeo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array([1.0, 0.85, 0.55]), 3));
      capGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array([Math.random()]), 1));
      spin.add(
        new THREE.Points(
          capGeo,
          track(new THREE.ShaderMaterial({ vertexShader: DOT_VERT, fragmentShader: DOT_FRAG, uniforms, transparent: true, depthWrite: false })),
        ),
      );

      if (d.name === "Gaborone" || base.distanceTo(hq) < 0.01) return;
      const mid = base.clone().add(hq).multiplyScalar(0.5);
      const dist = base.distanceTo(hq);
      mid.normalize().multiplyScalar(1.002 + dist * 0.55);
      const curve = new THREE.QuadraticBezierCurve3(base, mid, hq);
      const pts = curve.getPoints(48);
      const arcGeo = track(new THREE.BufferGeometry().setFromPoints(pts));
      arcGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(pts.map((_, i) => i / (pts.length - 1))), 1));
      const arcMat = track(
        new THREE.ShaderMaterial({
          vertexShader: ARC_VERT,
          fragmentShader: ARC_FRAG,
          uniforms: { uTime: uniforms.uTime, uOffset: { value: (idx * 0.137) % 1 } },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      arcMats.push(arcMat);
      spin.add(new THREE.Line(arcGeo, arcMat));
    });

    // HQ marker ring.
    const ringGeo = track(new THREE.RingGeometry(0.012, 0.016, 48));
    const ringMat = track(new THREE.MeshBasicMaterial({ color: 0xf8a018, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(hq.clone().multiplyScalar(1.001));
    ring.lookAt(hq.clone().multiplyScalar(2));
    spin.add(ring);
    const hqDot = new THREE.Mesh(track(new THREE.CircleGeometry(0.007, 24)), track(new THREE.MeshBasicMaterial({ color: 0xf8a018 })));
    hqDot.position.copy(hq.clone().multiplyScalar(1.0015));
    hqDot.lookAt(hq.clone().multiplyScalar(2));
    spin.add(hqDot);

    // Size and interaction.
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const clock = new THREE.Clock();
    const intro = { t: 0 };
    const tmp = new THREE.Vector3();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      uniforms.uTime.value = reduced ? 3 : t;
      intro.t = Math.min(1, intro.t + dt / 2.6);
      const ease = 1 - Math.pow(1 - intro.t, 4);
      camera.position.z = 8.5 - ease * 3.4;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const drift = reduced ? 0 : Math.sin(t * 0.12) * 0.12;
      spin.rotation.y = baseY + drift + pointer.x * 0.12 - (1 - ease) * 0.9;
      tilt.rotation.x = baseX + pointer.y * 0.06;
      ring.scale.setScalar(1 + ((t * 0.6) % 1) * 2.2);
      ringMat.opacity = 1 - ((t * 0.6) % 1);
      renderer.render(scene, camera);

      if (label.current) {
        tmp.copy(hq);
        spin.localToWorld(tmp);
        const facing = tmp.clone().normalize().dot(camera.position.clone().sub(tmp).normalize());
        tmp.project(camera);
        const x = (tmp.x * 0.5 + 0.5) * el.clientWidth;
        const y = (-tmp.y * 0.5 + 0.5) * el.clientHeight;
        label.current.style.transform = `translate(${x}px, ${y}px)`;
        label.current.style.opacity = String(Math.max(0, Math.min(1, (facing - 0.2) * 3)) * ease);
      }
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [districts]);

  return (
    <div className={className} aria-hidden="true">
      <div ref={mount} className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} />
      <div ref={label} className="pointer-events-none absolute top-0 left-0 opacity-0 will-change-transform">
        <div className="-translate-y-1/2 pl-5">
          <div className="flex items-center gap-2 rounded-full bg-navy-950/70 py-1 pr-3 pl-1 ring-1 ring-white/15 backdrop-blur">
            <span className="h-4 w-4 rounded-full bg-gold-400/20 ring-1 ring-gold-400/60" />
            <span className="font-mono text-[10.5px] tracking-wider text-white/80 uppercase">Gaborone · CEDA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
