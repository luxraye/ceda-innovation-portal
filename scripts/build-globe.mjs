// Builds the dotted-globe point cloud used on the landing page.
// Run once with: node scripts/build-globe.mjs  (the output JSON is committed)
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const read = (f) => JSON.parse(readFileSync(`node_modules/world-atlas/${f}`, "utf8"));
const landTopo = read("land-50m.json");
const countries = read("countries-50m.json");
const land = feature(landTopo, landTopo.objects.land);
const bw = feature(countries, countries.objects.countries).features.find((f) => f.id === "072");

function polygons(geom) {
  const list = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  return list.map((rings) => {
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const [x, y] of rings[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { rings, x0, x1, y0, y1 };
  });
}
function inRing(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function contains(polys, x, y) {
  for (const p of polys) {
    if (x < p.x0 || x > p.x1 || y < p.y0 || y > p.y1) continue;
    if (inRing(p.rings[0], x, y) && !p.rings.slice(1).some((h) => inRing(h, x, y))) return true;
  }
  return false;
}
const landPolys = land.features ? land.features.flatMap((f) => polygons(f.geometry)) : polygons(land.geometry);
const bwPolys = polygons(bw.geometry);

const N = 60000;
const golden = Math.PI * (3 - Math.sqrt(5));
const world = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const lat = (Math.asin(y) * 180) / Math.PI;
  if (lat < -58) continue;
  const lng = ((((golden * i * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (contains(bwPolys, lng, lat)) continue;
  if (contains(landPolys, lng, lat)) world.push(+lng.toFixed(2), +lat.toFixed(2));
}
const b = bwPolys[0];
const botswana = [];
const step = 0.3;
for (let lat = b.y0; lat <= b.y1; lat += step)
  for (let lng = b.x0; lng <= b.x1; lng += step / Math.cos((lat * Math.PI) / 180))
    if (contains(bwPolys, lng, lat)) botswana.push(+lng.toFixed(2), +lat.toFixed(2));

writeFileSync("public/globe-points.json", JSON.stringify({ world, botswana }));
console.log("world", world.length / 2, "botswana", botswana.length / 2);
