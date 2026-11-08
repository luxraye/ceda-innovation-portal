(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });

  // node_modules/sql.js/dist/sql-wasm.js
  var require_sql_wasm = __commonJS({
    "node_modules/sql.js/dist/sql-wasm.js"(exports, module) {
      var initSqlJsPromise = void 0;
      var initSqlJs2 = function(moduleConfig) {
        if (initSqlJsPromise) {
          return initSqlJsPromise;
        }
        initSqlJsPromise = new Promise(function(resolveModule, reject) {
          var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
          var originalOnAbortFunction = Module["onAbort"];
          Module["onAbort"] = function(errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction) {
              originalOnAbortFunction(errorThatCausedAbort);
            }
          };
          Module["postRun"] = Module["postRun"] || [];
          Module["postRun"].push(function() {
            resolveModule(Module);
          });
          module = void 0;
          var f;
          f || (f = typeof Module != "undefined" ? Module : {});
          var aa = "object" == typeof window, ba = "function" == typeof importScripts, ca = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node;
          "use strict";
          f.onRuntimeInitialized = function() {
            function a(g, l) {
              switch (typeof l) {
                case "boolean":
                  fc(g, l ? 1 : 0);
                  break;
                case "number":
                  gc(g, l);
                  break;
                case "string":
                  hc(g, l, -1, -1);
                  break;
                case "object":
                  if (null === l) ib(g);
                  else if (null != l.length) {
                    var n = da(l, ea);
                    ic(g, n, l.length, -1);
                    fa(n);
                  } else xa(g, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
                  break;
                default:
                  ib(g);
              }
            }
            function b(g, l) {
              for (var n = [], t = 0; t < g; t += 1) {
                var w = m(l + 4 * t, "i32"), A = jc(w);
                if (1 === A || 2 === A) w = kc(w);
                else if (3 === A) w = lc(w);
                else if (4 === A) {
                  A = w;
                  w = mc(A);
                  A = nc(A);
                  for (var N = new Uint8Array(w), M = 0; M < w; M += 1) N[M] = p[A + M];
                  w = N;
                } else w = null;
                n.push(w);
              }
              return n;
            }
            function c(g, l) {
              this.Ka = g;
              this.db = l;
              this.Ia = 1;
              this.eb = [];
            }
            function d(g, l) {
              this.db = l;
              l = ha(g) + 1;
              this.Xa = ia(l);
              if (null === this.Xa) throw Error("Unable to allocate memory for the SQL string");
              q(g, u, this.Xa, l);
              this.cb = this.Xa;
              this.Ta = this.hb = null;
            }
            function e(g) {
              this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
              if (null != g) {
                var l = this.filename, n = "/", t = l;
                n && (n = "string" == typeof n ? n : ja(n), t = l ? x(n + "/" + l) : n);
                l = ka(true, true);
                t = la(t, (void 0 !== l ? l : 438) & 4095 | 32768, 0);
                if (g) {
                  if ("string" == typeof g) {
                    n = Array(g.length);
                    for (var w = 0, A = g.length; w < A; ++w) n[w] = g.charCodeAt(w);
                    g = n;
                  }
                  ma(t, l | 146);
                  n = na(t, 577);
                  oa(n, g, 0, g.length, 0);
                  pa(n);
                  ma(t, l);
                }
              }
              this.handleError(r(this.filename, h));
              this.db = m(h, "i32");
              lb(this.db);
              this.Ya = {};
              this.Ma = {};
            }
            var h = y(4), k = f.cwrap, r = k("sqlite3_open", "number", ["string", "number"]), z = k("sqlite3_close_v2", "number", ["number"]), v = k("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), E = k(
              "sqlite3_changes",
              "number",
              ["number"]
            ), H = k("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), mb = k("sqlite3_sql", "string", ["number"]), oc = k("sqlite3_normalized_sql", "string", ["number"]), nb = k("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), pc = k("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), ob = k("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), qc = k("sqlite3_bind_double", "number", ["number", "number", "number"]), rc = k("sqlite3_bind_int", "number", ["number", "number", "number"]), sc = k("sqlite3_bind_parameter_index", "number", ["number", "string"]), tc = k("sqlite3_step", "number", ["number"]), uc = k("sqlite3_errmsg", "string", ["number"]), vc = k("sqlite3_column_count", "number", ["number"]), wc = k("sqlite3_data_count", "number", ["number"]), xc = k("sqlite3_column_double", "number", ["number", "number"]), pb = k("sqlite3_column_text", "string", ["number", "number"]), yc = k("sqlite3_column_blob", "number", ["number", "number"]), zc = k(
              "sqlite3_column_bytes",
              "number",
              ["number", "number"]
            ), Ac = k("sqlite3_column_type", "number", ["number", "number"]), Bc = k("sqlite3_column_name", "string", ["number", "number"]), Cc = k("sqlite3_reset", "number", ["number"]), Dc = k("sqlite3_clear_bindings", "number", ["number"]), Ec = k("sqlite3_finalize", "number", ["number"]), qb = k("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), jc = k("sqlite3_value_type", "number", ["number"]), mc = k("sqlite3_value_bytes", "number", ["number"]), lc = k(
              "sqlite3_value_text",
              "string",
              ["number"]
            ), nc = k("sqlite3_value_blob", "number", ["number"]), kc = k("sqlite3_value_double", "number", ["number"]), gc = k("sqlite3_result_double", "", ["number", "number"]), ib = k("sqlite3_result_null", "", ["number"]), hc = k("sqlite3_result_text", "", ["number", "string", "number", "number"]), ic = k("sqlite3_result_blob", "", ["number", "number", "number", "number"]), fc = k("sqlite3_result_int", "", ["number", "number"]), xa = k("sqlite3_result_error", "", ["number", "string", "number"]), rb = k(
              "sqlite3_aggregate_context",
              "number",
              ["number", "number"]
            ), lb = k("RegisterExtensionFunctions", "number", ["number"]);
            c.prototype.bind = function(g) {
              if (!this.Ka) throw "Statement closed";
              this.reset();
              return Array.isArray(g) ? this.vb(g) : null != g && "object" === typeof g ? this.wb(g) : true;
            };
            c.prototype.step = function() {
              if (!this.Ka) throw "Statement closed";
              this.Ia = 1;
              var g = tc(this.Ka);
              switch (g) {
                case 100:
                  return true;
                case 101:
                  return false;
                default:
                  throw this.db.handleError(g);
              }
            };
            c.prototype.qb = function(g) {
              null == g && (g = this.Ia, this.Ia += 1);
              return xc(this.Ka, g);
            };
            c.prototype.zb = function(g) {
              null == g && (g = this.Ia, this.Ia += 1);
              g = pb(this.Ka, g);
              if ("function" !== typeof BigInt) throw Error("BigInt is not supported");
              return BigInt(g);
            };
            c.prototype.Ab = function(g) {
              null == g && (g = this.Ia, this.Ia += 1);
              return pb(this.Ka, g);
            };
            c.prototype.getBlob = function(g) {
              null == g && (g = this.Ia, this.Ia += 1);
              var l = zc(this.Ka, g);
              g = yc(this.Ka, g);
              for (var n = new Uint8Array(l), t = 0; t < l; t += 1) n[t] = p[g + t];
              return n;
            };
            c.prototype.get = function(g, l) {
              l = l || {};
              null != g && this.bind(g) && this.step();
              g = [];
              for (var n = wc(this.Ka), t = 0; t < n; t += 1) switch (Ac(this.Ka, t)) {
                case 1:
                  var w = l.useBigInt ? this.zb(t) : this.qb(t);
                  g.push(w);
                  break;
                case 2:
                  g.push(this.qb(t));
                  break;
                case 3:
                  g.push(this.Ab(t));
                  break;
                case 4:
                  g.push(this.getBlob(t));
                  break;
                default:
                  g.push(null);
              }
              return g;
            };
            c.prototype.getColumnNames = function() {
              for (var g = [], l = vc(this.Ka), n = 0; n < l; n += 1) g.push(Bc(this.Ka, n));
              return g;
            };
            c.prototype.getAsObject = function(g, l) {
              g = this.get(g, l);
              l = this.getColumnNames();
              for (var n = {}, t = 0; t < l.length; t += 1) n[l[t]] = g[t];
              return n;
            };
            c.prototype.getSQL = function() {
              return mb(this.Ka);
            };
            c.prototype.getNormalizedSQL = function() {
              return oc(this.Ka);
            };
            c.prototype.run = function(g) {
              null != g && this.bind(g);
              this.step();
              return this.reset();
            };
            c.prototype.mb = function(g, l) {
              null == l && (l = this.Ia, this.Ia += 1);
              g = qa(g);
              var n = da(g, ea);
              this.eb.push(n);
              this.db.handleError(pc(this.Ka, l, n, g.length - 1, 0));
            };
            c.prototype.ub = function(g, l) {
              null == l && (l = this.Ia, this.Ia += 1);
              var n = da(g, ea);
              this.eb.push(n);
              this.db.handleError(ob(this.Ka, l, n, g.length, 0));
            };
            c.prototype.lb = function(g, l) {
              null == l && (l = this.Ia, this.Ia += 1);
              this.db.handleError((g === (g | 0) ? rc : qc)(this.Ka, l, g));
            };
            c.prototype.xb = function(g) {
              null == g && (g = this.Ia, this.Ia += 1);
              ob(this.Ka, g, 0, 0, 0);
            };
            c.prototype.nb = function(g, l) {
              null == l && (l = this.Ia, this.Ia += 1);
              switch (typeof g) {
                case "string":
                  this.mb(g, l);
                  return;
                case "number":
                  this.lb(g, l);
                  return;
                case "bigint":
                  this.mb(g.toString(), l);
                  return;
                case "boolean":
                  this.lb(g + 0, l);
                  return;
                case "object":
                  if (null === g) {
                    this.xb(l);
                    return;
                  }
                  if (null != g.length) {
                    this.ub(g, l);
                    return;
                  }
              }
              throw "Wrong API use : tried to bind a value of an unknown type (" + g + ").";
            };
            c.prototype.wb = function(g) {
              var l = this;
              Object.keys(g).forEach(function(n) {
                var t = sc(l.Ka, n);
                0 !== t && l.nb(g[n], t);
              });
              return true;
            };
            c.prototype.vb = function(g) {
              for (var l = 0; l < g.length; l += 1) this.nb(g[l], l + 1);
              return true;
            };
            c.prototype.reset = function() {
              this.freemem();
              return 0 === Dc(this.Ka) && 0 === Cc(this.Ka);
            };
            c.prototype.freemem = function() {
              for (var g; void 0 !== (g = this.eb.pop()); ) fa(g);
            };
            c.prototype.free = function() {
              this.freemem();
              var g = 0 === Ec(this.Ka);
              delete this.db.Ya[this.Ka];
              this.Ka = 0;
              return g;
            };
            d.prototype.next = function() {
              if (null === this.Xa) return { done: true };
              null !== this.Ta && (this.Ta.free(), this.Ta = null);
              if (!this.db.db) throw this.fb(), Error("Database closed");
              var g = ra(), l = y(4);
              sa(h);
              sa(l);
              try {
                this.db.handleError(nb(this.db.db, this.cb, -1, h, l));
                this.cb = m(l, "i32");
                var n = m(h, "i32");
                if (0 === n) return this.fb(), { done: true };
                this.Ta = new c(n, this.db);
                this.db.Ya[n] = this.Ta;
                return { value: this.Ta, done: false };
              } catch (t) {
                throw this.hb = ta(this.cb), this.fb(), t;
              } finally {
                ua(g);
              }
            };
            d.prototype.fb = function() {
              fa(this.Xa);
              this.Xa = null;
            };
            d.prototype.getRemainingSQL = function() {
              return null !== this.hb ? this.hb : ta(this.cb);
            };
            "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d.prototype[Symbol.iterator] = function() {
              return this;
            });
            e.prototype.run = function(g, l) {
              if (!this.db) throw "Database closed";
              if (l) {
                g = this.prepare(g, l);
                try {
                  g.step();
                } finally {
                  g.free();
                }
              } else this.handleError(v(this.db, g, 0, 0, h));
              return this;
            };
            e.prototype.exec = function(g, l, n) {
              if (!this.db) throw "Database closed";
              var t = ra(), w = null;
              try {
                var A = va(g), N = y(4);
                for (g = []; 0 !== m(A, "i8"); ) {
                  sa(h);
                  sa(N);
                  this.handleError(nb(
                    this.db,
                    A,
                    -1,
                    h,
                    N
                  ));
                  var M = m(h, "i32");
                  A = m(N, "i32");
                  if (0 !== M) {
                    var K = null;
                    w = new c(M, this);
                    for (null != l && w.bind(l); w.step(); ) null === K && (K = { columns: w.getColumnNames(), values: [] }, g.push(K)), K.values.push(w.get(null, n));
                    w.free();
                  }
                }
                return g;
              } catch (O) {
                throw w && w.free(), O;
              } finally {
                ua(t);
              }
            };
            e.prototype.each = function(g, l, n, t, w) {
              "function" === typeof l && (t = n, n = l, l = void 0);
              g = this.prepare(g, l);
              try {
                for (; g.step(); ) n(g.getAsObject(null, w));
              } finally {
                g.free();
              }
              if ("function" === typeof t) return t();
            };
            e.prototype.prepare = function(g, l) {
              sa(h);
              this.handleError(H(this.db, g, -1, h, 0));
              g = m(h, "i32");
              if (0 === g) throw "Nothing to prepare";
              var n = new c(g, this);
              null != l && n.bind(l);
              return this.Ya[g] = n;
            };
            e.prototype.iterateStatements = function(g) {
              return new d(g, this);
            };
            e.prototype["export"] = function() {
              Object.values(this.Ya).forEach(function(l) {
                l.free();
              });
              Object.values(this.Ma).forEach(wa);
              this.Ma = {};
              this.handleError(z(this.db));
              var g = ya(this.filename);
              this.handleError(r(this.filename, h));
              this.db = m(h, "i32");
              lb(this.db);
              return g;
            };
            e.prototype.close = function() {
              null !== this.db && (Object.values(this.Ya).forEach(function(g) {
                g.free();
              }), Object.values(this.Ma).forEach(wa), this.Ma = {}, this.handleError(z(this.db)), za("/" + this.filename), this.db = null);
            };
            e.prototype.handleError = function(g) {
              if (0 === g) return null;
              g = uc(this.db);
              throw Error(g);
            };
            e.prototype.getRowsModified = function() {
              return E(this.db);
            };
            e.prototype.create_function = function(g, l) {
              Object.prototype.hasOwnProperty.call(this.Ma, g) && (wa(this.Ma[g]), delete this.Ma[g]);
              var n = Aa(function(t, w, A) {
                w = b(w, A);
                try {
                  var N = l.apply(
                    null,
                    w
                  );
                } catch (M) {
                  xa(t, M, -1);
                  return;
                }
                a(t, N);
              }, "viii");
              this.Ma[g] = n;
              this.handleError(qb(this.db, g, l.length, 1, 0, n, 0, 0, 0));
              return this;
            };
            e.prototype.create_aggregate = function(g, l) {
              var n = l.init || function() {
                return null;
              }, t = l.finalize || function(K) {
                return K;
              }, w = l.step;
              if (!w) throw "An aggregate function must have a step function in " + g;
              var A = {};
              Object.hasOwnProperty.call(this.Ma, g) && (wa(this.Ma[g]), delete this.Ma[g]);
              l = g + "__finalize";
              Object.hasOwnProperty.call(this.Ma, l) && (wa(this.Ma[l]), delete this.Ma[l]);
              var N = Aa(function(K, O, Ra) {
                var Y = rb(K, 1);
                Object.hasOwnProperty.call(A, Y) || (A[Y] = n());
                O = b(O, Ra);
                O = [A[Y]].concat(O);
                try {
                  A[Y] = w.apply(null, O);
                } catch (Gc) {
                  delete A[Y], xa(K, Gc, -1);
                }
              }, "viii"), M = Aa(function(K) {
                var O = rb(K, 1);
                try {
                  var Ra = t(A[O]);
                } catch (Y) {
                  delete A[O];
                  xa(K, Y, -1);
                  return;
                }
                a(K, Ra);
                delete A[O];
              }, "vi");
              this.Ma[g] = N;
              this.Ma[l] = M;
              this.handleError(qb(this.db, g, w.length - 1, 1, 0, 0, N, M, 0));
              return this;
            };
            f.Database = e;
          };
          var Ba = Object.assign({}, f), Ca = "./this.program", B = "", Da, Ea;
          if (ca) {
            var fs = __require("fs"), Fa = __require("path");
            B = __dirname + "/";
            Ea = (a) => {
              a = Ga(a) ? new URL(a) : Fa.normalize(a);
              return fs.readFileSync(a);
            };
            Da = (a) => {
              a = Ga(a) ? new URL(a) : Fa.normalize(a);
              return new Promise((b, c) => {
                fs.readFile(a, void 0, (d, e) => {
                  d ? c(d) : b(e.buffer);
                });
              });
            };
            !f.thisProgram && 1 < process.argv.length && (Ca = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            "undefined" != typeof module && (module.exports = f);
          } else if (aa || ba) ba ? B = self.location.href : "undefined" != typeof document && document.currentScript && (B = document.currentScript.src), B = B.startsWith("blob:") ? "" : B.substr(0, B.replace(/[?#].*/, "").lastIndexOf("/") + 1), ba && (Ea = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), Da = (a) => Ga(a) ? new Promise((b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              (200 == d.status || 0 == d.status && d.response) && c(d.response);
              b(d.status);
            };
            d.onerror = b;
            d.send(null);
          }) : fetch(a, { credentials: "same-origin" }).then((b) => b.ok ? b.arrayBuffer() : Promise.reject(Error(b.status + " : " + b.url)));
          var Ha = f.print || console.log.bind(console), C = f.printErr || console.error.bind(console);
          Object.assign(f, Ba);
          Ba = null;
          f.thisProgram && (Ca = f.thisProgram);
          var Ia;
          f.wasmBinary && (Ia = f.wasmBinary);
          var Ja, Ka = false, p, u, La, D, F, Ma, Na;
          function Oa() {
            var a = Ja.buffer;
            f.HEAP8 = p = new Int8Array(a);
            f.HEAP16 = La = new Int16Array(a);
            f.HEAPU8 = u = new Uint8Array(a);
            f.HEAPU16 = new Uint16Array(a);
            f.HEAP32 = D = new Int32Array(a);
            f.HEAPU32 = F = new Uint32Array(a);
            f.HEAPF32 = Ma = new Float32Array(a);
            f.HEAPF64 = Na = new Float64Array(a);
          }
          var Pa = [], Qa = [], Sa = [];
          function Ta() {
            var a = f.preRun.shift();
            Pa.unshift(a);
          }
          var Ua = 0, Va = null, Wa = null;
          function G(a) {
            f.onAbort?.(a);
            a = "Aborted(" + a + ")";
            C(a);
            Ka = true;
            throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          }
          var Xa = (a) => a.startsWith("data:application/octet-stream;base64,"), Ga = (a) => a.startsWith("file://"), Ya;
          function Za(a) {
            if (a == Ya && Ia) return new Uint8Array(Ia);
            if (Ea) return Ea(a);
            throw "both async and sync fetching of the wasm failed";
          }
          function $a(a) {
            return Ia ? Promise.resolve().then(() => Za(a)) : Da(a).then((b) => new Uint8Array(b), () => Za(a));
          }
          function ab(a, b, c) {
            return $a(a).then((d) => WebAssembly.instantiate(d, b)).then(c, (d) => {
              C(`failed to asynchronously prepare wasm: ${d}`);
              G(d);
            });
          }
          function bb(a, b) {
            var c = Ya;
            Ia || "function" != typeof WebAssembly.instantiateStreaming || Xa(c) || Ga(c) || ca || "function" != typeof fetch ? ab(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
              C(`wasm streaming compile failed: ${e}`);
              C("falling back to ArrayBuffer instantiation");
              return ab(c, a, b);
            }));
          }
          var I, J, cb = (a) => {
            for (; 0 < a.length; ) a.shift()(f);
          };
          function m(a, b = "i8") {
            b.endsWith("*") && (b = "*");
            switch (b) {
              case "i1":
                return p[a];
              case "i8":
                return p[a];
              case "i16":
                return La[a >> 1];
              case "i32":
                return D[a >> 2];
              case "i64":
                G("to do getValue(i64) use WASM_BIGINT");
              case "float":
                return Ma[a >> 2];
              case "double":
                return Na[a >> 3];
              case "*":
                return F[a >> 2];
              default:
                G(`invalid type for getValue: ${b}`);
            }
          }
          function sa(a) {
            var b = "i32";
            b.endsWith("*") && (b = "*");
            switch (b) {
              case "i1":
                p[a] = 0;
                break;
              case "i8":
                p[a] = 0;
                break;
              case "i16":
                La[a >> 1] = 0;
                break;
              case "i32":
                D[a >> 2] = 0;
                break;
              case "i64":
                G("to do setValue(i64) use WASM_BIGINT");
              case "float":
                Ma[a >> 2] = 0;
                break;
              case "double":
                Na[a >> 3] = 0;
                break;
              case "*":
                F[a >> 2] = 0;
                break;
              default:
                G(`invalid type for setValue: ${b}`);
            }
          }
          var db = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, L = (a, b, c) => {
            var d = b + c;
            for (c = b; a[c] && !(c >= d); ) ++c;
            if (16 < c - b && a.buffer && db) return db.decode(a.subarray(b, c));
            for (d = ""; b < c; ) {
              var e = a[b++];
              if (e & 128) {
                var h = a[b++] & 63;
                if (192 == (e & 224)) d += String.fromCharCode((e & 31) << 6 | h);
                else {
                  var k = a[b++] & 63;
                  e = 224 == (e & 240) ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                }
              } else d += String.fromCharCode(e);
            }
            return d;
          }, ta = (a, b) => a ? L(u, a, b) : "", eb = (a, b) => {
            for (var c = 0, d = a.length - 1; 0 <= d; d--) {
              var e = a[d];
              "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
            }
            if (b) for (; c; c--) a.unshift("..");
            return a;
          }, x = (a) => {
            var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
            (a = eb(a.split("/").filter((d) => !!d), !b).join("/")) || b || (a = ".");
            a && c && (a += "/");
            return (b ? "/" : "") + a;
          }, fb = (a) => {
            var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
            a = b[0];
            b = b[1];
            if (!a && !b) return ".";
            b && (b = b.substr(0, b.length - 1));
            return a + b;
          }, gb = (a) => {
            if ("/" === a) return "/";
            a = x(a);
            a = a.replace(/\/$/, "");
            var b = a.lastIndexOf("/");
            return -1 === b ? a : a.substr(b + 1);
          }, hb = () => {
            if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) return (c) => crypto.getRandomValues(c);
            if (ca) try {
              var a = __require("crypto");
              if (a.randomFillSync) return (c) => a.randomFillSync(c);
              var b = a.randomBytes;
              return (c) => (c.set(b(c.byteLength)), c);
            } catch (c) {
            }
            G("initRandomDevice");
          }, jb = (a) => (jb = hb())(a), kb = (...a) => {
            for (var b = "", c = false, d = a.length - 1; -1 <= d && !c; d--) {
              c = 0 <= d ? a[d] : "/";
              if ("string" != typeof c) throw new TypeError("Arguments to path.resolve must be strings");
              if (!c) return "";
              b = c + "/" + b;
              c = "/" === c.charAt(0);
            }
            b = eb(b.split("/").filter((e) => !!e), !c).join("/");
            return (c ? "/" : "") + b || ".";
          }, sb = [], ha = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, q = (a, b, c, d) => {
            if (!(0 < d)) return 0;
            var e = c;
            d = c + d - 1;
            for (var h = 0; h < a.length; ++h) {
              var k = a.charCodeAt(h);
              if (55296 <= k && 57343 >= k) {
                var r = a.charCodeAt(++h);
                k = 65536 + ((k & 1023) << 10) | r & 1023;
              }
              if (127 >= k) {
                if (c >= d) break;
                b[c++] = k;
              } else {
                if (2047 >= k) {
                  if (c + 1 >= d) break;
                  b[c++] = 192 | k >> 6;
                } else {
                  if (65535 >= k) {
                    if (c + 2 >= d) break;
                    b[c++] = 224 | k >> 12;
                  } else {
                    if (c + 3 >= d) break;
                    b[c++] = 240 | k >> 18;
                    b[c++] = 128 | k >> 12 & 63;
                  }
                  b[c++] = 128 | k >> 6 & 63;
                }
                b[c++] = 128 | k & 63;
              }
            }
            b[c] = 0;
            return c - e;
          };
          function qa(a, b) {
            var c = Array(ha(a) + 1);
            a = q(a, c, 0, c.length);
            b && (c.length = a);
            return c;
          }
          var tb = [];
          function ub(a, b) {
            tb[a] = { input: [], output: [], Wa: b };
            vb(a, wb);
          }
          var wb = { open(a) {
            var b = tb[a.node.rdev];
            if (!b) throw new P(43);
            a.tty = b;
            a.seekable = false;
          }, close(a) {
            a.tty.Wa.fsync(a.tty);
          }, fsync(a) {
            a.tty.Wa.fsync(a.tty);
          }, read(a, b, c, d) {
            if (!a.tty || !a.tty.Wa.rb) throw new P(60);
            for (var e = 0, h = 0; h < d; h++) {
              try {
                var k = a.tty.Wa.rb(a.tty);
              } catch (r) {
                throw new P(29);
              }
              if (void 0 === k && 0 === e) throw new P(6);
              if (null === k || void 0 === k) break;
              e++;
              b[c + h] = k;
            }
            e && (a.node.timestamp = Date.now());
            return e;
          }, write(a, b, c, d) {
            if (!a.tty || !a.tty.Wa.ib) throw new P(60);
            try {
              for (var e = 0; e < d; e++) a.tty.Wa.ib(a.tty, b[c + e]);
            } catch (h) {
              throw new P(29);
            }
            d && (a.node.timestamp = Date.now());
            return e;
          } }, xb = { rb() {
            a: {
              if (!sb.length) {
                var a = null;
                if (ca) {
                  var b = Buffer.alloc(256), c = 0, d = process.stdin.fd;
                  try {
                    c = fs.readSync(d, b, 0, 256);
                  } catch (e) {
                    if (e.toString().includes("EOF")) c = 0;
                    else throw e;
                  }
                  0 < c && (a = b.slice(0, c).toString("utf-8"));
                } else "undefined" != typeof window && "function" == typeof window.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
                if (!a) {
                  a = null;
                  break a;
                }
                sb = qa(a, true);
              }
              a = sb.shift();
            }
            return a;
          }, ib(a, b) {
            null === b || 10 === b ? (Ha(L(
              a.output,
              0
            )), a.output = []) : 0 != b && a.output.push(b);
          }, fsync(a) {
            a.output && 0 < a.output.length && (Ha(L(a.output, 0)), a.output = []);
          }, Lb() {
            return { Gb: 25856, Ib: 5, Fb: 191, Hb: 35387, Eb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
          }, Mb() {
            return 0;
          }, Nb() {
            return [24, 80];
          } }, yb = { ib(a, b) {
            null === b || 10 === b ? (C(L(a.output, 0)), a.output = []) : 0 != b && a.output.push(b);
          }, fsync(a) {
            a.output && 0 < a.output.length && (C(L(a.output, 0)), a.output = []);
          } };
          function zb(a, b) {
            var c = a.Ha ? a.Ha.length : 0;
            c >= b || (b = Math.max(b, c * (1048576 > c ? 2 : 1.125) >>> 0), 0 != c && (b = Math.max(b, 256)), c = a.Ha, a.Ha = new Uint8Array(b), 0 < a.La && a.Ha.set(c.subarray(0, a.La), 0));
          }
          var Q = {
            Pa: null,
            Qa() {
              return Q.createNode(null, "/", 16895, 0);
            },
            createNode(a, b, c, d) {
              if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new P(63);
              Q.Pa || (Q.Pa = { dir: { node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na, lookup: Q.Fa.lookup, $a: Q.Fa.$a, rename: Q.Fa.rename, unlink: Q.Fa.unlink, rmdir: Q.Fa.rmdir, readdir: Q.Fa.readdir, symlink: Q.Fa.symlink }, stream: { Sa: Q.Ga.Sa } }, file: { node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na }, stream: { Sa: Q.Ga.Sa, read: Q.Ga.read, write: Q.Ga.write, kb: Q.Ga.kb, ab: Q.Ga.ab, bb: Q.Ga.bb } }, link: {
                node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na, readlink: Q.Fa.readlink },
                stream: {}
              }, ob: { node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na }, stream: Ab } });
              c = Bb(a, b, c, d);
              R(c.mode) ? (c.Fa = Q.Pa.dir.node, c.Ga = Q.Pa.dir.stream, c.Ha = {}) : 32768 === (c.mode & 61440) ? (c.Fa = Q.Pa.file.node, c.Ga = Q.Pa.file.stream, c.La = 0, c.Ha = null) : 40960 === (c.mode & 61440) ? (c.Fa = Q.Pa.link.node, c.Ga = Q.Pa.link.stream) : 8192 === (c.mode & 61440) && (c.Fa = Q.Pa.ob.node, c.Ga = Q.Pa.ob.stream);
              c.timestamp = Date.now();
              a && (a.Ha[b] = c, a.timestamp = c.timestamp);
              return c;
            },
            Kb(a) {
              return a.Ha ? a.Ha.subarray ? a.Ha.subarray(0, a.La) : new Uint8Array(a.Ha) : new Uint8Array(0);
            },
            Fa: { Oa(a) {
              var b = {};
              b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
              b.ino = a.id;
              b.mode = a.mode;
              b.nlink = 1;
              b.uid = 0;
              b.gid = 0;
              b.rdev = a.rdev;
              R(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.La : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
              b.atime = new Date(a.timestamp);
              b.mtime = new Date(a.timestamp);
              b.ctime = new Date(a.timestamp);
              b.yb = 4096;
              b.blocks = Math.ceil(b.size / b.yb);
              return b;
            }, Na(a, b) {
              void 0 !== b.mode && (a.mode = b.mode);
              void 0 !== b.timestamp && (a.timestamp = b.timestamp);
              if (void 0 !== b.size && (b = b.size, a.La != b)) if (0 == b) a.Ha = null, a.La = 0;
              else {
                var c = a.Ha;
                a.Ha = new Uint8Array(b);
                c && a.Ha.set(c.subarray(0, Math.min(b, a.La)));
                a.La = b;
              }
            }, lookup() {
              throw Cb[44];
            }, $a(a, b, c, d) {
              return Q.createNode(a, b, c, d);
            }, rename(a, b, c) {
              if (R(a.mode)) {
                try {
                  var d = Db(b, c);
                } catch (h) {
                }
                if (d) for (var e in d.Ha) throw new P(55);
              }
              delete a.parent.Ha[a.name];
              a.parent.timestamp = Date.now();
              a.name = c;
              b.Ha[c] = a;
              b.timestamp = a.parent.timestamp;
            }, unlink(a, b) {
              delete a.Ha[b];
              a.timestamp = Date.now();
            }, rmdir(a, b) {
              var c = Db(a, b), d;
              for (d in c.Ha) throw new P(55);
              delete a.Ha[b];
              a.timestamp = Date.now();
            }, readdir(a) {
              var b = [".", ".."], c;
              for (c of Object.keys(a.Ha)) b.push(c);
              return b;
            }, symlink(a, b, c) {
              a = Q.createNode(a, b, 41471, 0);
              a.link = c;
              return a;
            }, readlink(a) {
              if (40960 !== (a.mode & 61440)) throw new P(28);
              return a.link;
            } },
            Ga: {
              read(a, b, c, d, e) {
                var h = a.node.Ha;
                if (e >= a.node.La) return 0;
                a = Math.min(a.node.La - e, d);
                if (8 < a && h.subarray) b.set(h.subarray(e, e + a), c);
                else for (d = 0; d < a; d++) b[c + d] = h[e + d];
                return a;
              },
              write(a, b, c, d, e, h) {
                b.buffer === p.buffer && (h = false);
                if (!d) return 0;
                a = a.node;
                a.timestamp = Date.now();
                if (b.subarray && (!a.Ha || a.Ha.subarray)) {
                  if (h) return a.Ha = b.subarray(c, c + d), a.La = d;
                  if (0 === a.La && 0 === e) return a.Ha = b.slice(c, c + d), a.La = d;
                  if (e + d <= a.La) return a.Ha.set(b.subarray(c, c + d), e), d;
                }
                zb(a, e + d);
                if (a.Ha.subarray && b.subarray) a.Ha.set(b.subarray(c, c + d), e);
                else for (h = 0; h < d; h++) a.Ha[e + h] = b[c + h];
                a.La = Math.max(a.La, e + d);
                return d;
              },
              Sa(a, b, c) {
                1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.La);
                if (0 > b) throw new P(28);
                return b;
              },
              kb(a, b, c) {
                zb(a.node, b + c);
                a.node.La = Math.max(a.node.La, b + c);
              },
              ab(a, b, c, d, e) {
                if (32768 !== (a.node.mode & 61440)) throw new P(43);
                a = a.node.Ha;
                if (e & 2 || a.buffer !== p.buffer) {
                  if (0 < c || c + b < a.length) a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
                  c = true;
                  b = 65536 * Math.ceil(b / 65536);
                  (e = Eb(65536, b)) ? (u.fill(0, e, e + b), b = e) : b = 0;
                  if (!b) throw new P(48);
                  p.set(a, b);
                } else c = false, b = a.byteOffset;
                return { Cb: b, tb: c };
              },
              bb(a, b, c, d) {
                Q.Ga.write(a, b, 0, d, c, false);
                return 0;
              }
            }
          }, ka = (a, b) => {
            var c = 0;
            a && (c |= 365);
            b && (c |= 146);
            return c;
          }, Fb = null, Gb = {}, Hb = [], Ib = 1, S = null, Jb = true, P = class {
            constructor(a) {
              this.name = "ErrnoError";
              this.Ja = a;
            }
          }, Cb = {}, Kb = class {
            constructor() {
              this.Za = {};
              this.node = null;
            }
            get flags() {
              return this.Za.flags;
            }
            set flags(a) {
              this.Za.flags = a;
            }
            get position() {
              return this.Za.position;
            }
            set position(a) {
              this.Za.position = a;
            }
          }, Lb = class {
            constructor(a, b, c, d) {
              a || (a = this);
              this.parent = a;
              this.Qa = a.Qa;
              this.Ua = null;
              this.id = Ib++;
              this.name = b;
              this.mode = c;
              this.Fa = {};
              this.Ga = {};
              this.rdev = d;
            }
            get read() {
              return 365 === (this.mode & 365);
            }
            set read(a) {
              a ? this.mode |= 365 : this.mode &= -366;
            }
            get write() {
              return 146 === (this.mode & 146);
            }
            set write(a) {
              a ? this.mode |= 146 : this.mode &= -147;
            }
          };
          function T(a, b = {}) {
            a = kb(a);
            if (!a) return { path: "", node: null };
            b = Object.assign({ pb: true, jb: 0 }, b);
            if (8 < b.jb) throw new P(32);
            a = a.split("/").filter((k) => !!k);
            for (var c = Fb, d = "/", e = 0; e < a.length; e++) {
              var h = e === a.length - 1;
              if (h && b.parent) break;
              c = Db(c, a[e]);
              d = x(d + "/" + a[e]);
              c.Ua && (!h || h && b.pb) && (c = c.Ua.root);
              if (!h || b.Ra) {
                for (h = 0; 40960 === (c.mode & 61440); ) if (c = Mb(d), d = kb(fb(d), c), c = T(d, { jb: b.jb + 1 }).node, 40 < h++) throw new P(32);
              }
            }
            return { path: d, node: c };
          }
          function ja(a) {
            for (var b; ; ) {
              if (a === a.parent) return a = a.Qa.sb, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
              b = b ? `${a.name}/${b}` : a.name;
              a = a.parent;
            }
          }
          function Nb(a, b) {
            for (var c = 0, d = 0; d < b.length; d++) c = (c << 5) - c + b.charCodeAt(d) | 0;
            return (a + c >>> 0) % S.length;
          }
          function Ob(a) {
            var b = Nb(a.parent.id, a.name);
            if (S[b] === a) S[b] = a.Va;
            else for (b = S[b]; b; ) {
              if (b.Va === a) {
                b.Va = a.Va;
                break;
              }
              b = b.Va;
            }
          }
          function Db(a, b) {
            var c = R(a.mode) ? (c = Pb(a, "x")) ? c : a.Fa.lookup ? 0 : 2 : 54;
            if (c) throw new P(c);
            for (c = S[Nb(a.id, b)]; c; c = c.Va) {
              var d = c.name;
              if (c.parent.id === a.id && d === b) return c;
            }
            return a.Fa.lookup(a, b);
          }
          function Bb(a, b, c, d) {
            a = new Lb(a, b, c, d);
            b = Nb(a.parent.id, a.name);
            a.Va = S[b];
            return S[b] = a;
          }
          function R(a) {
            return 16384 === (a & 61440);
          }
          function Qb(a) {
            var b = ["r", "w", "rw"][a & 3];
            a & 512 && (b += "w");
            return b;
          }
          function Pb(a, b) {
            if (Jb) return 0;
            if (!b.includes("r") || a.mode & 292) {
              if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) return 2;
            } else return 2;
            return 0;
          }
          function Rb(a, b) {
            try {
              return Db(a, b), 20;
            } catch (c) {
            }
            return Pb(a, "wx");
          }
          function Sb(a, b, c) {
            try {
              var d = Db(a, b);
            } catch (e) {
              return e.Ja;
            }
            if (a = Pb(a, "wx")) return a;
            if (c) {
              if (!R(d.mode)) return 54;
              if (d === d.parent || "/" === ja(d)) return 10;
            } else if (R(d.mode)) return 31;
            return 0;
          }
          function U(a) {
            a = Hb[a];
            if (!a) throw new P(8);
            return a;
          }
          function Tb(a, b = -1) {
            a = Object.assign(new Kb(), a);
            if (-1 == b) a: {
              for (b = 0; 4096 >= b; b++) if (!Hb[b]) break a;
              throw new P(33);
            }
            a.fd = b;
            return Hb[b] = a;
          }
          function Ub(a, b = -1) {
            a = Tb(a, b);
            a.Ga?.Jb?.(a);
            return a;
          }
          var Ab = { open(a) {
            a.Ga = Gb[a.node.rdev].Ga;
            a.Ga.open?.(a);
          }, Sa() {
            throw new P(70);
          } };
          function vb(a, b) {
            Gb[a] = { Ga: b };
          }
          function Vb(a, b) {
            var c = "/" === b;
            if (c && Fb) throw new P(10);
            if (!c && b) {
              var d = T(b, { pb: false });
              b = d.path;
              d = d.node;
              if (d.Ua) throw new P(10);
              if (!R(d.mode)) throw new P(54);
            }
            b = { type: a, Ob: {}, sb: b, Bb: [] };
            a = a.Qa(b);
            a.Qa = b;
            b.root = a;
            c ? Fb = a : d && (d.Ua = b, d.Qa && d.Qa.Bb.push(b));
          }
          function la(a, b, c) {
            var d = T(a, { parent: true }).node;
            a = gb(a);
            if (!a || "." === a || ".." === a) throw new P(28);
            var e = Rb(d, a);
            if (e) throw new P(e);
            if (!d.Fa.$a) throw new P(63);
            return d.Fa.$a(d, a, b, c);
          }
          function V(a, b) {
            return la(a, (void 0 !== b ? b : 511) & 1023 | 16384, 0);
          }
          function Wb(a, b, c) {
            "undefined" == typeof c && (c = b, b = 438);
            la(a, b | 8192, c);
          }
          function Xb(a, b) {
            if (!kb(a)) throw new P(44);
            var c = T(b, { parent: true }).node;
            if (!c) throw new P(44);
            b = gb(b);
            var d = Rb(c, b);
            if (d) throw new P(d);
            if (!c.Fa.symlink) throw new P(63);
            c.Fa.symlink(c, b, a);
          }
          function Yb(a) {
            var b = T(a, { parent: true }).node;
            a = gb(a);
            var c = Db(b, a), d = Sb(b, a, true);
            if (d) throw new P(d);
            if (!b.Fa.rmdir) throw new P(63);
            if (c.Ua) throw new P(10);
            b.Fa.rmdir(b, a);
            Ob(c);
          }
          function za(a) {
            var b = T(a, { parent: true }).node;
            if (!b) throw new P(44);
            a = gb(a);
            var c = Db(b, a), d = Sb(b, a, false);
            if (d) throw new P(d);
            if (!b.Fa.unlink) throw new P(63);
            if (c.Ua) throw new P(10);
            b.Fa.unlink(b, a);
            Ob(c);
          }
          function Mb(a) {
            a = T(a).node;
            if (!a) throw new P(44);
            if (!a.Fa.readlink) throw new P(28);
            return kb(ja(a.parent), a.Fa.readlink(a));
          }
          function Zb(a, b) {
            a = T(a, { Ra: !b }).node;
            if (!a) throw new P(44);
            if (!a.Fa.Oa) throw new P(63);
            return a.Fa.Oa(a);
          }
          function $b(a) {
            return Zb(a, true);
          }
          function ma(a, b) {
            a = "string" == typeof a ? T(a, { Ra: true }).node : a;
            if (!a.Fa.Na) throw new P(63);
            a.Fa.Na(a, { mode: b & 4095 | a.mode & -4096, timestamp: Date.now() });
          }
          function ac(a, b) {
            if (0 > b) throw new P(28);
            a = "string" == typeof a ? T(a, { Ra: true }).node : a;
            if (!a.Fa.Na) throw new P(63);
            if (R(a.mode)) throw new P(31);
            if (32768 !== (a.mode & 61440)) throw new P(28);
            var c = Pb(a, "w");
            if (c) throw new P(c);
            a.Fa.Na(a, { size: b, timestamp: Date.now() });
          }
          function na(a, b, c) {
            if ("" === a) throw new P(44);
            if ("string" == typeof b) {
              var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
              if ("undefined" == typeof d) throw Error(`Unknown file open mode: ${b}`);
              b = d;
            }
            c = b & 64 ? ("undefined" == typeof c ? 438 : c) & 4095 | 32768 : 0;
            if ("object" == typeof a) var e = a;
            else {
              a = x(a);
              try {
                e = T(a, { Ra: !(b & 131072) }).node;
              } catch (h) {
              }
            }
            d = false;
            if (b & 64) if (e) {
              if (b & 128) throw new P(20);
            } else e = la(a, c, 0), d = true;
            if (!e) throw new P(44);
            8192 === (e.mode & 61440) && (b &= -513);
            if (b & 65536 && !R(e.mode)) throw new P(54);
            if (!d && (c = e ? 40960 === (e.mode & 61440) ? 32 : R(e.mode) && ("r" !== Qb(b) || b & 512) ? 31 : Pb(e, Qb(b)) : 44)) throw new P(c);
            b & 512 && !d && ac(e, 0);
            b &= -131713;
            e = Tb({ node: e, path: ja(e), flags: b, seekable: true, position: 0, Ga: e.Ga, Db: [], error: false });
            e.Ga.open && e.Ga.open(e);
            !f.logReadFiles || b & 1 || (bc || (bc = {}), a in bc || (bc[a] = 1));
            return e;
          }
          function pa(a) {
            if (null === a.fd) throw new P(8);
            a.gb && (a.gb = null);
            try {
              a.Ga.close && a.Ga.close(a);
            } catch (b) {
              throw b;
            } finally {
              Hb[a.fd] = null;
            }
            a.fd = null;
          }
          function cc(a, b, c) {
            if (null === a.fd) throw new P(8);
            if (!a.seekable || !a.Ga.Sa) throw new P(70);
            if (0 != c && 1 != c && 2 != c) throw new P(28);
            a.position = a.Ga.Sa(a, b, c);
            a.Db = [];
          }
          function dc(a, b, c, d, e) {
            if (0 > d || 0 > e) throw new P(28);
            if (null === a.fd) throw new P(8);
            if (1 === (a.flags & 2097155)) throw new P(8);
            if (R(a.node.mode)) throw new P(31);
            if (!a.Ga.read) throw new P(28);
            var h = "undefined" != typeof e;
            if (!h) e = a.position;
            else if (!a.seekable) throw new P(70);
            b = a.Ga.read(a, b, c, d, e);
            h || (a.position += b);
            return b;
          }
          function oa(a, b, c, d, e) {
            if (0 > d || 0 > e) throw new P(28);
            if (null === a.fd) throw new P(8);
            if (0 === (a.flags & 2097155)) throw new P(8);
            if (R(a.node.mode)) throw new P(31);
            if (!a.Ga.write) throw new P(28);
            a.seekable && a.flags & 1024 && cc(a, 0, 2);
            var h = "undefined" != typeof e;
            if (!h) e = a.position;
            else if (!a.seekable) throw new P(70);
            b = a.Ga.write(a, b, c, d, e, void 0);
            h || (a.position += b);
            return b;
          }
          function ya(a) {
            var b = "binary";
            if ("utf8" !== b && "binary" !== b) throw Error(`Invalid encoding type "${b}"`);
            var c;
            var d = na(a, d || 0);
            a = Zb(a).size;
            var e = new Uint8Array(a);
            dc(d, e, 0, a, 0);
            "utf8" === b ? c = L(e, 0) : "binary" === b && (c = e);
            pa(d);
            return c;
          }
          var ec;
          function Fc(a, b, c) {
            a = x("/dev/" + a);
            var d = ka(!!b, !!c);
            Hc || (Hc = 64);
            var e = Hc++ << 8 | 0;
            vb(e, { open(h) {
              h.seekable = false;
            }, close() {
              c?.buffer?.length && c(10);
            }, read(h, k, r, z) {
              for (var v = 0, E = 0; E < z; E++) {
                try {
                  var H = b();
                } catch (mb) {
                  throw new P(29);
                }
                if (void 0 === H && 0 === v) throw new P(6);
                if (null === H || void 0 === H) break;
                v++;
                k[r + E] = H;
              }
              v && (h.node.timestamp = Date.now());
              return v;
            }, write(h, k, r, z) {
              for (var v = 0; v < z; v++) try {
                c(k[r + v]);
              } catch (E) {
                throw new P(29);
              }
              z && (h.node.timestamp = Date.now());
              return v;
            } });
            Wb(a, d, e);
          }
          var Hc, W = {}, bc;
          function Ic(a, b, c) {
            if ("/" === b.charAt(0)) return b;
            a = -100 === a ? "/" : U(a).path;
            if (0 == b.length) {
              if (!c) throw new P(44);
              return a;
            }
            return x(a + "/" + b);
          }
          function Jc(a, b, c) {
            a = a(b);
            D[c >> 2] = a.dev;
            D[c + 4 >> 2] = a.mode;
            F[c + 8 >> 2] = a.nlink;
            D[c + 12 >> 2] = a.uid;
            D[c + 16 >> 2] = a.gid;
            D[c + 20 >> 2] = a.rdev;
            J = [a.size >>> 0, (I = a.size, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
            D[c + 24 >> 2] = J[0];
            D[c + 28 >> 2] = J[1];
            D[c + 32 >> 2] = 4096;
            D[c + 36 >> 2] = a.blocks;
            b = a.atime.getTime();
            var d = a.mtime.getTime(), e = a.ctime.getTime();
            J = [Math.floor(b / 1e3) >>> 0, (I = Math.floor(b / 1e3), 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
            D[c + 40 >> 2] = J[0];
            D[c + 44 >> 2] = J[1];
            F[c + 48 >> 2] = b % 1e3 * 1e3;
            J = [Math.floor(d / 1e3) >>> 0, (I = Math.floor(d / 1e3), 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
            D[c + 56 >> 2] = J[0];
            D[c + 60 >> 2] = J[1];
            F[c + 64 >> 2] = d % 1e3 * 1e3;
            J = [Math.floor(e / 1e3) >>> 0, (I = Math.floor(e / 1e3), 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
            D[c + 72 >> 2] = J[0];
            D[c + 76 >> 2] = J[1];
            F[c + 80 >> 2] = e % 1e3 * 1e3;
            J = [a.ino >>> 0, (I = a.ino, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
            D[c + 88 >> 2] = J[0];
            D[c + 92 >> 2] = J[1];
            return 0;
          }
          var Kc = void 0;
          function Lc() {
            var a = D[+Kc >> 2];
            Kc += 4;
            return a;
          }
          var Mc = (a, b) => b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN, Nc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Oc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Pc = {}, Rc = () => {
            if (!Qc) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: Ca || "./this.program" }, b;
              for (b in Pc) void 0 === Pc[b] ? delete a[b] : a[b] = Pc[b];
              var c = [];
              for (b in a) c.push(`${b}=${a[b]}`);
              Qc = c;
            }
            return Qc;
          }, Qc, va = (a) => {
            var b = ha(a) + 1, c = y(b);
            q(a, u, c, b);
            return c;
          }, Sc = (a, b, c, d) => {
            var e = { string: (v) => {
              var E = 0;
              null !== v && void 0 !== v && 0 !== v && (E = va(v));
              return E;
            }, array: (v) => {
              var E = y(v.length);
              p.set(v, E);
              return E;
            } };
            a = f["_" + a];
            var h = [], k = 0;
            if (d) for (var r = 0; r < d.length; r++) {
              var z = e[c[r]];
              z ? (0 === k && (k = ra()), h[r] = z(d[r])) : h[r] = d[r];
            }
            c = a(...h);
            return c = function(v) {
              0 !== k && ua(k);
              return "string" === b ? v ? L(u, v) : "" : "boolean" === b ? !!v : v;
            }(c);
          }, ea = 0, da = (a, b) => {
            b = 1 == b ? y(a.length) : ia(a.length);
            a.subarray || a.slice || (a = new Uint8Array(a));
            u.set(
              a,
              b
            );
            return b;
          }, Tc, Uc = [], X, wa = (a) => {
            Tc.delete(X.get(a));
            X.set(a, null);
            Uc.push(a);
          }, Aa = (a, b) => {
            if (!Tc) {
              Tc = /* @__PURE__ */ new WeakMap();
              var c = X.length;
              if (Tc) for (var d = 0; d < 0 + c; d++) {
                var e = X.get(d);
                e && Tc.set(e, d);
              }
            }
            if (c = Tc.get(a) || 0) return c;
            if (Uc.length) c = Uc.pop();
            else {
              try {
                X.grow(1);
              } catch (r) {
                if (!(r instanceof RangeError)) throw r;
                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
              }
              c = X.length - 1;
            }
            try {
              X.set(c, a);
            } catch (r) {
              if (!(r instanceof TypeError)) throw r;
              if ("function" == typeof WebAssembly.Function) {
                d = WebAssembly.Function;
                e = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
                for (var h = { parameters: [], results: "v" == b[0] ? [] : [e[b[0]]] }, k = 1; k < b.length; ++k) h.parameters.push(e[b[k]]);
                b = new d(h, a);
              } else {
                d = [1];
                e = b.slice(0, 1);
                b = b.slice(1);
                h = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
                d.push(96);
                k = b.length;
                128 > k ? d.push(k) : d.push(k % 128 | 128, k >> 7);
                for (k = 0; k < b.length; ++k) d.push(h[b[k]]);
                "v" == e ? d.push(0) : d.push(1, h[e]);
                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
                e = d.length;
                128 > e ? b.push(e) : b.push(e % 128 | 128, e >> 7);
                b.push(...d);
                b.push(
                  2,
                  7,
                  1,
                  1,
                  101,
                  1,
                  102,
                  0,
                  0,
                  7,
                  5,
                  1,
                  1,
                  102,
                  0,
                  0
                );
                b = new WebAssembly.Module(new Uint8Array(b));
                b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
              }
              X.set(c, b);
            }
            Tc.set(a, c);
            return c;
          };
          [44].forEach((a) => {
            Cb[a] = new P(a);
            Cb[a].stack = "<generic error, no stack>";
          });
          S = Array(4096);
          Vb(Q, "/");
          V("/tmp");
          V("/home");
          V("/home/web_user");
          (function() {
            V("/dev");
            vb(259, { read: () => 0, write: (d, e, h, k) => k });
            Wb("/dev/null", 259);
            ub(1280, xb);
            ub(1536, yb);
            Wb("/dev/tty", 1280);
            Wb("/dev/tty1", 1536);
            var a = new Uint8Array(1024), b = 0, c = () => {
              0 === b && (b = jb(a).byteLength);
              return a[--b];
            };
            Fc("random", c);
            Fc("urandom", c);
            V("/dev/shm");
            V("/dev/shm/tmp");
          })();
          (function() {
            V("/proc");
            var a = V("/proc/self");
            V("/proc/self/fd");
            Vb({ Qa() {
              var b = Bb(a, "fd", 16895, 73);
              b.Fa = { lookup(c, d) {
                var e = U(+d);
                c = { parent: null, Qa: { sb: "fake" }, Fa: { readlink: () => e.path } };
                return c.parent = c;
              } };
              return b;
            } }, "/proc/self/fd");
          })();
          var Vc = {
            a: (a, b, c, d) => {
              G(`Assertion failed: ${a ? L(u, a) : ""}, at: ` + [b ? b ? L(u, b) : "" : "unknown filename", c, d ? d ? L(u, d) : "" : "unknown function"]);
            },
            h: function(a, b) {
              try {
                return a = a ? L(u, a) : "", ma(a, b), 0;
              } catch (c) {
                if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
                return -c.Ja;
              }
            },
            H: function(a, b, c) {
              try {
                b = b ? L(u, b) : "";
                b = Ic(a, b);
                if (c & -8) return -28;
                var d = T(b, { Ra: true }).node;
                if (!d) return -44;
                a = "";
                c & 4 && (a += "r");
                c & 2 && (a += "w");
                c & 1 && (a += "x");
                return a && Pb(d, a) ? -2 : 0;
              } catch (e) {
                if ("undefined" == typeof W || "ErrnoError" !== e.name) throw e;
                return -e.Ja;
              }
            },
            i: function(a, b) {
              try {
                var c = U(a);
                ma(c.node, b);
                return 0;
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return -d.Ja;
              }
            },
            g: function(a) {
              try {
                var b = U(a).node;
                var c = "string" == typeof b ? T(b, { Ra: true }).node : b;
                if (!c.Fa.Na) throw new P(63);
                c.Fa.Na(c, { timestamp: Date.now() });
                return 0;
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return -d.Ja;
              }
            },
            b: function(a, b, c) {
              Kc = c;
              try {
                var d = U(a);
                switch (b) {
                  case 0:
                    var e = Lc();
                    if (0 > e) break;
                    for (; Hb[e]; ) e++;
                    return Ub(d, e).fd;
                  case 1:
                  case 2:
                    return 0;
                  case 3:
                    return d.flags;
                  case 4:
                    return e = Lc(), d.flags |= e, 0;
                  case 12:
                    return e = Lc(), La[e + 0 >> 1] = 2, 0;
                  case 13:
                  case 14:
                    return 0;
                }
                return -28;
              } catch (h) {
                if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
                return -h.Ja;
              }
            },
            f: function(a, b) {
              try {
                var c = U(a);
                return Jc(Zb, c.path, b);
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return -d.Ja;
              }
            },
            n: function(a, b, c) {
              b = Mc(b, c);
              try {
                if (isNaN(b)) return 61;
                var d = U(a);
                if (0 === (d.flags & 2097155)) throw new P(28);
                ac(d.node, b);
                return 0;
              } catch (e) {
                if ("undefined" == typeof W || "ErrnoError" !== e.name) throw e;
                return -e.Ja;
              }
            },
            C: function(a, b) {
              try {
                if (0 === b) return -28;
                var c = ha("/") + 1;
                if (b < c) return -68;
                q("/", u, a, b);
                return c;
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return -d.Ja;
              }
            },
            F: function(a, b) {
              try {
                return a = a ? L(u, a) : "", Jc($b, a, b);
              } catch (c) {
                if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
                return -c.Ja;
              }
            },
            z: function(a, b, c) {
              try {
                return b = b ? L(u, b) : "", b = Ic(a, b), b = x(b), "/" === b[b.length - 1] && (b = b.substr(0, b.length - 1)), V(b, c), 0;
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return -d.Ja;
              }
            },
            E: function(a, b, c, d) {
              try {
                b = b ? L(u, b) : "";
                var e = d & 256;
                b = Ic(a, b, d & 4096);
                return Jc(e ? $b : Zb, b, c);
              } catch (h) {
                if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
                return -h.Ja;
              }
            },
            x: function(a, b, c, d) {
              Kc = d;
              try {
                b = b ? L(u, b) : "";
                b = Ic(a, b);
                var e = d ? Lc() : 0;
                return na(b, c, e).fd;
              } catch (h) {
                if ("undefined" == typeof W || "ErrnoError" !== h.name) throw h;
                return -h.Ja;
              }
            },
            v: function(a, b, c, d) {
              try {
                b = b ? L(u, b) : "";
                b = Ic(a, b);
                if (0 >= d) return -28;
                var e = Mb(b), h = Math.min(d, ha(e)), k = p[c + h];
                q(e, u, c, d + 1);
                p[c + h] = k;
                return h;
              } catch (r) {
                if ("undefined" == typeof W || "ErrnoError" !== r.name) throw r;
                return -r.Ja;
              }
            },
            u: function(a) {
              try {
                return a = a ? L(u, a) : "", Yb(a), 0;
              } catch (b) {
                if ("undefined" == typeof W || "ErrnoError" !== b.name) throw b;
                return -b.Ja;
              }
            },
            G: function(a, b) {
              try {
                return a = a ? L(u, a) : "", Jc(Zb, a, b);
              } catch (c) {
                if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
                return -c.Ja;
              }
            },
            r: function(a, b, c) {
              try {
                return b = b ? L(u, b) : "", b = Ic(a, b), 0 === c ? za(b) : 512 === c ? Yb(b) : G("Invalid flags passed to unlinkat"), 0;
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return -d.Ja;
              }
            },
            q: function(a, b, c) {
              try {
                b = b ? L(u, b) : "";
                b = Ic(a, b, true);
                if (c) {
                  var d = F[c >> 2] + 4294967296 * D[c + 4 >> 2], e = D[c + 8 >> 2];
                  h = 1e3 * d + e / 1e6;
                  c += 16;
                  d = F[c >> 2] + 4294967296 * D[c + 4 >> 2];
                  e = D[c + 8 >> 2];
                  k = 1e3 * d + e / 1e6;
                } else var h = Date.now(), k = h;
                a = h;
                var r = T(b, { Ra: true }).node;
                r.Fa.Na(r, { timestamp: Math.max(a, k) });
                return 0;
              } catch (z) {
                if ("undefined" == typeof W || "ErrnoError" !== z.name) throw z;
                return -z.Ja;
              }
            },
            l: function(a, b, c) {
              a = new Date(1e3 * Mc(a, b));
              D[c >> 2] = a.getSeconds();
              D[c + 4 >> 2] = a.getMinutes();
              D[c + 8 >> 2] = a.getHours();
              D[c + 12 >> 2] = a.getDate();
              D[c + 16 >> 2] = a.getMonth();
              D[c + 20 >> 2] = a.getFullYear() - 1900;
              D[c + 24 >> 2] = a.getDay();
              b = a.getFullYear();
              D[c + 28 >> 2] = (0 !== b % 4 || 0 === b % 100 && 0 !== b % 400 ? Oc : Nc)[a.getMonth()] + a.getDate() - 1 | 0;
              D[c + 36 >> 2] = -(60 * a.getTimezoneOffset());
              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
              D[c + 32 >> 2] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
            },
            j: function(a, b, c, d, e, h, k, r) {
              e = Mc(e, h);
              try {
                if (isNaN(e)) return 61;
                var z = U(d);
                if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (z.flags & 2097155)) throw new P(2);
                if (1 === (z.flags & 2097155)) throw new P(2);
                if (!z.Ga.ab) throw new P(43);
                var v = z.Ga.ab(z, a, e, b, c);
                var E = v.Cb;
                D[k >> 2] = v.tb;
                F[r >> 2] = E;
                return 0;
              } catch (H) {
                if ("undefined" == typeof W || "ErrnoError" !== H.name) throw H;
                return -H.Ja;
              }
            },
            k: function(a, b, c, d, e, h, k) {
              h = Mc(h, k);
              try {
                var r = U(e);
                if (c & 2) {
                  if (32768 !== (r.node.mode & 61440)) throw new P(43);
                  if (!(d & 2)) {
                    var z = u.slice(a, a + b);
                    r.Ga.bb && r.Ga.bb(r, z, h, b, d);
                  }
                }
              } catch (v) {
                if ("undefined" == typeof W || "ErrnoError" !== v.name) throw v;
                return -v.Ja;
              }
            },
            y: (a, b, c, d) => {
              var e = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(e, 0, 1).getTimezoneOffset();
              e = new Date(e, 6, 1).getTimezoneOffset();
              F[a >> 2] = 60 * Math.max(h, e);
              D[b >> 2] = Number(h != e);
              b = (k) => {
                var r = Math.abs(k);
                return `UTC${0 <= k ? "-" : "+"}${String(Math.floor(r / 60)).padStart(2, "0")}${String(r % 60).padStart(2, "0")}`;
              };
              a = b(h);
              b = b(e);
              e < h ? (q(a, u, c, 17), q(b, u, d, 17)) : (q(a, u, d, 17), q(b, u, c, 17));
            },
            d: () => Date.now(),
            s: () => 2147483648,
            c: () => performance.now(),
            o: (a) => {
              var b = u.length;
              a >>>= 0;
              if (2147483648 < a) return false;
              for (var c = 1; 4 >= c; c *= 2) {
                var d = b * (1 + 0.2 / c);
                d = Math.min(d, a + 100663296);
                var e = Math;
                d = Math.max(a, d);
                a: {
                  e = (e.min.call(e, 2147483648, d + (65536 - d % 65536) % 65536) - Ja.buffer.byteLength + 65535) / 65536;
                  try {
                    Ja.grow(e);
                    Oa();
                    var h = 1;
                    break a;
                  } catch (k) {
                  }
                  h = void 0;
                }
                if (h) return true;
              }
              return false;
            },
            A: (a, b) => {
              var c = 0;
              Rc().forEach((d, e) => {
                var h = b + c;
                e = F[a + 4 * e >> 2] = h;
                for (h = 0; h < d.length; ++h) p[e++] = d.charCodeAt(h);
                p[e] = 0;
                c += d.length + 1;
              });
              return 0;
            },
            B: (a, b) => {
              var c = Rc();
              F[a >> 2] = c.length;
              var d = 0;
              c.forEach((e) => d += e.length + 1);
              F[b >> 2] = d;
              return 0;
            },
            e: function(a) {
              try {
                var b = U(a);
                pa(b);
                return 0;
              } catch (c) {
                if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
                return c.Ja;
              }
            },
            p: function(a, b) {
              try {
                var c = U(a);
                p[b] = c.tty ? 2 : R(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
                La[b + 2 >> 1] = 0;
                J = [0, (I = 0, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
                D[b + 8 >> 2] = J[0];
                D[b + 12 >> 2] = J[1];
                J = [0, (I = 0, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
                D[b + 16 >> 2] = J[0];
                D[b + 20 >> 2] = J[1];
                return 0;
              } catch (d) {
                if ("undefined" == typeof W || "ErrnoError" !== d.name) throw d;
                return d.Ja;
              }
            },
            w: function(a, b, c, d) {
              try {
                a: {
                  var e = U(a);
                  a = b;
                  for (var h, k = b = 0; k < c; k++) {
                    var r = F[a >> 2], z = F[a + 4 >> 2];
                    a += 8;
                    var v = dc(e, p, r, z, h);
                    if (0 > v) {
                      var E = -1;
                      break a;
                    }
                    b += v;
                    if (v < z) break;
                    "undefined" != typeof h && (h += v);
                  }
                  E = b;
                }
                F[d >> 2] = E;
                return 0;
              } catch (H) {
                if ("undefined" == typeof W || "ErrnoError" !== H.name) throw H;
                return H.Ja;
              }
            },
            m: function(a, b, c, d, e) {
              b = Mc(b, c);
              try {
                if (isNaN(b)) return 61;
                var h = U(a);
                cc(h, b, d);
                J = [h.position >>> 0, (I = h.position, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
                D[e >> 2] = J[0];
                D[e + 4 >> 2] = J[1];
                h.gb && 0 === b && 0 === d && (h.gb = null);
                return 0;
              } catch (k) {
                if ("undefined" == typeof W || "ErrnoError" !== k.name) throw k;
                return k.Ja;
              }
            },
            D: function(a) {
              try {
                var b = U(a);
                return b.Ga?.fsync ? b.Ga.fsync(b) : 0;
              } catch (c) {
                if ("undefined" == typeof W || "ErrnoError" !== c.name) throw c;
                return c.Ja;
              }
            },
            t: function(a, b, c, d) {
              try {
                a: {
                  var e = U(a);
                  a = b;
                  for (var h, k = b = 0; k < c; k++) {
                    var r = F[a >> 2], z = F[a + 4 >> 2];
                    a += 8;
                    var v = oa(e, p, r, z, h);
                    if (0 > v) {
                      var E = -1;
                      break a;
                    }
                    b += v;
                    "undefined" != typeof h && (h += v);
                  }
                  E = b;
                }
                F[d >> 2] = E;
                return 0;
              } catch (H) {
                if ("undefined" == typeof W || "ErrnoError" !== H.name) throw H;
                return H.Ja;
              }
            }
          }, Z = function() {
            function a(c) {
              Z = c.exports;
              Ja = Z.I;
              Oa();
              X = Z.K;
              Qa.unshift(Z.J);
              Ua--;
              f.monitorRunDependencies?.(Ua);
              0 == Ua && (null !== Va && (clearInterval(Va), Va = null), Wa && (c = Wa, Wa = null, c()));
              return Z;
            }
            var b = { a: Vc };
            Ua++;
            f.monitorRunDependencies?.(Ua);
            if (f.instantiateWasm) try {
              return f.instantiateWasm(b, a);
            } catch (c) {
              return C(`Module.instantiateWasm callback failed with error: ${c}`), false;
            }
            Ya || (Ya = Xa("sql-wasm.wasm") ? "sql-wasm.wasm" : f.locateFile ? f.locateFile(
              "sql-wasm.wasm",
              B
            ) : B + "sql-wasm.wasm");
            bb(b, function(c) {
              a(c.instance);
            });
            return {};
          }();
          f._sqlite3_free = (a) => (f._sqlite3_free = Z.L)(a);
          f._sqlite3_value_text = (a) => (f._sqlite3_value_text = Z.M)(a);
          f._sqlite3_prepare_v2 = (a, b, c, d, e) => (f._sqlite3_prepare_v2 = Z.N)(a, b, c, d, e);
          f._sqlite3_step = (a) => (f._sqlite3_step = Z.O)(a);
          f._sqlite3_reset = (a) => (f._sqlite3_reset = Z.P)(a);
          f._sqlite3_exec = (a, b, c, d, e) => (f._sqlite3_exec = Z.Q)(a, b, c, d, e);
          f._sqlite3_finalize = (a) => (f._sqlite3_finalize = Z.R)(a);
          f._sqlite3_column_name = (a, b) => (f._sqlite3_column_name = Z.S)(a, b);
          f._sqlite3_column_text = (a, b) => (f._sqlite3_column_text = Z.T)(a, b);
          f._sqlite3_column_type = (a, b) => (f._sqlite3_column_type = Z.U)(a, b);
          f._sqlite3_errmsg = (a) => (f._sqlite3_errmsg = Z.V)(a);
          f._sqlite3_clear_bindings = (a) => (f._sqlite3_clear_bindings = Z.W)(a);
          f._sqlite3_value_blob = (a) => (f._sqlite3_value_blob = Z.X)(a);
          f._sqlite3_value_bytes = (a) => (f._sqlite3_value_bytes = Z.Y)(a);
          f._sqlite3_value_double = (a) => (f._sqlite3_value_double = Z.Z)(a);
          f._sqlite3_value_int = (a) => (f._sqlite3_value_int = Z._)(a);
          f._sqlite3_value_type = (a) => (f._sqlite3_value_type = Z.$)(a);
          f._sqlite3_result_blob = (a, b, c, d) => (f._sqlite3_result_blob = Z.aa)(a, b, c, d);
          f._sqlite3_result_double = (a, b) => (f._sqlite3_result_double = Z.ba)(a, b);
          f._sqlite3_result_error = (a, b, c) => (f._sqlite3_result_error = Z.ca)(a, b, c);
          f._sqlite3_result_int = (a, b) => (f._sqlite3_result_int = Z.da)(a, b);
          f._sqlite3_result_int64 = (a, b, c) => (f._sqlite3_result_int64 = Z.ea)(a, b, c);
          f._sqlite3_result_null = (a) => (f._sqlite3_result_null = Z.fa)(a);
          f._sqlite3_result_text = (a, b, c, d) => (f._sqlite3_result_text = Z.ga)(a, b, c, d);
          f._sqlite3_aggregate_context = (a, b) => (f._sqlite3_aggregate_context = Z.ha)(a, b);
          f._sqlite3_column_count = (a) => (f._sqlite3_column_count = Z.ia)(a);
          f._sqlite3_data_count = (a) => (f._sqlite3_data_count = Z.ja)(a);
          f._sqlite3_column_blob = (a, b) => (f._sqlite3_column_blob = Z.ka)(a, b);
          f._sqlite3_column_bytes = (a, b) => (f._sqlite3_column_bytes = Z.la)(a, b);
          f._sqlite3_column_double = (a, b) => (f._sqlite3_column_double = Z.ma)(a, b);
          f._sqlite3_bind_blob = (a, b, c, d, e) => (f._sqlite3_bind_blob = Z.na)(a, b, c, d, e);
          f._sqlite3_bind_double = (a, b, c) => (f._sqlite3_bind_double = Z.oa)(a, b, c);
          f._sqlite3_bind_int = (a, b, c) => (f._sqlite3_bind_int = Z.pa)(a, b, c);
          f._sqlite3_bind_text = (a, b, c, d, e) => (f._sqlite3_bind_text = Z.qa)(a, b, c, d, e);
          f._sqlite3_bind_parameter_index = (a, b) => (f._sqlite3_bind_parameter_index = Z.ra)(a, b);
          f._sqlite3_sql = (a) => (f._sqlite3_sql = Z.sa)(a);
          f._sqlite3_normalized_sql = (a) => (f._sqlite3_normalized_sql = Z.ta)(a);
          f._sqlite3_changes = (a) => (f._sqlite3_changes = Z.ua)(a);
          f._sqlite3_close_v2 = (a) => (f._sqlite3_close_v2 = Z.va)(a);
          f._sqlite3_create_function_v2 = (a, b, c, d, e, h, k, r, z) => (f._sqlite3_create_function_v2 = Z.wa)(a, b, c, d, e, h, k, r, z);
          f._sqlite3_open = (a, b) => (f._sqlite3_open = Z.xa)(a, b);
          var ia = f._malloc = (a) => (ia = f._malloc = Z.ya)(a), fa = f._free = (a) => (fa = f._free = Z.za)(a);
          f._RegisterExtensionFunctions = (a) => (f._RegisterExtensionFunctions = Z.Aa)(a);
          var Eb = (a, b) => (Eb = Z.Ba)(a, b), ua = (a) => (ua = Z.Ca)(a), y = (a) => (y = Z.Da)(a), ra = () => (ra = Z.Ea)();
          f.stackSave = () => ra();
          f.stackRestore = (a) => ua(a);
          f.stackAlloc = (a) => y(a);
          f.cwrap = (a, b, c, d) => {
            var e = !c || c.every((h) => "number" === h || "boolean" === h);
            return "string" !== b && e && !d ? f["_" + a] : (...h) => Sc(a, b, c, h);
          };
          f.addFunction = Aa;
          f.removeFunction = wa;
          f.UTF8ToString = ta;
          f.ALLOC_NORMAL = ea;
          f.allocate = da;
          f.allocateUTF8OnStack = va;
          var Wc;
          Wa = function Xc() {
            Wc || Yc();
            Wc || (Wa = Xc);
          };
          function Yc() {
            function a() {
              if (!Wc && (Wc = true, f.calledRun = true, !Ka)) {
                f.noFSInit || ec || (ec = true, f.stdin = f.stdin, f.stdout = f.stdout, f.stderr = f.stderr, f.stdin ? Fc("stdin", f.stdin) : Xb("/dev/tty", "/dev/stdin"), f.stdout ? Fc("stdout", null, f.stdout) : Xb("/dev/tty", "/dev/stdout"), f.stderr ? Fc("stderr", null, f.stderr) : Xb("/dev/tty1", "/dev/stderr"), na("/dev/stdin", 0), na("/dev/stdout", 1), na("/dev/stderr", 1));
                Jb = false;
                cb(Qa);
                f.onRuntimeInitialized?.();
                if (f.postRun) for ("function" == typeof f.postRun && (f.postRun = [f.postRun]); f.postRun.length; ) {
                  var b = f.postRun.shift();
                  Sa.unshift(b);
                }
                cb(Sa);
              }
            }
            if (!(0 < Ua)) {
              if (f.preRun) for ("function" == typeof f.preRun && (f.preRun = [f.preRun]); f.preRun.length; ) Ta();
              cb(Pa);
              0 < Ua || (f.setStatus ? (f.setStatus("Running..."), setTimeout(function() {
                setTimeout(function() {
                  f.setStatus("");
                }, 1);
                a();
              }, 1)) : a());
            }
          }
          if (f.preInit) for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length; ) f.preInit.pop()();
          Yc();
          return Module;
        });
        return initSqlJsPromise;
      };
      if (typeof exports === "object" && typeof module === "object") {
        module.exports = initSqlJs2;
        module.exports.default = initSqlJs2;
      } else if (typeof define === "function" && define["amd"]) {
        define([], function() {
          return initSqlJs2;
        });
      } else if (typeof exports === "object") {
        exports["Module"] = initSqlJs2;
      }
    }
  });

  // ../../../preview-tools/genspark/entry.ts
  var import_sql = __toESM(require_sql_wasm());

  // node_modules/hono/dist/request/constants.js
  var GET_MATCH_RESULT = Symbol();

  // node_modules/hono/dist/utils/buffer.js
  var bufferToFormData = (arrayBuffer, contentType) => {
    return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
  };

  // node_modules/hono/dist/utils/body.js
  var MAX_NESTED_OBJECTS = 1e4;
  var isRawRequest = (request) => "headers" in request;
  var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
    const { all = false, dot = false } = options;
    const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
    if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
      all,
      dot
    });
    return {};
  };
  async function parseFormData(request, options) {
    if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
    const headers = isRawRequest(request) ? request.headers : request.raw.headers;
    const arrayBuffer = await request.arrayBuffer();
    const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
    if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
    const formData = await formDataPromise;
    if (formData) return convertFormDataToBodyData(formData, options);
    return {};
  }
  function convertFormDataToBodyData(formData, options) {
    const form = /* @__PURE__ */ Object.create(null);
    const nestingState = { count: 0 };
    formData.forEach((value, key) => {
      if (!(options.all || key.endsWith("[]"))) form[key] = value;
      else handleParsingAllValues(form, key, value);
    });
    if (options.dot) Object.entries(form).forEach(([key, value]) => {
      if (key.includes(".")) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
    return form;
  }
  var handleParsingAllValues = (form, key, value) => {
    if (form[key] !== void 0) {
      if (Array.isArray(form[key])) form[key].push(value);
      else form[key] = [form[key], value];
    } else if (!key.endsWith("[]")) form[key] = value;
    else form[key] = [value];
  };
  var handleParsingNestedValues = (form, key, value, state) => {
    if (/(?:^|\.)__proto__\./.test(key)) return;
    let nestedForm = form;
    const keys = key.split(".", 34);
    if (keys.length > 33) throwNestingLimitExceeded();
    keys.forEach((key2, index) => {
      if (index === keys.length - 1) nestedForm[key2] = value;
      else {
        if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
          if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
          nestedForm[key2] = /* @__PURE__ */ Object.create(null);
        }
        nestedForm = nestedForm[key2];
      }
    });
  };
  var throwNestingLimitExceeded = () => {
    throw new Error("Nesting limit exceeded");
  };

  // node_modules/hono/dist/utils/url.js
  var splitPath = (path) => {
    const paths = path.split("/");
    if (paths[0] === "") paths.shift();
    return paths;
  };
  var splitRoutingPath = (routePath) => {
    const { groups, path } = extractGroupsFromPath(routePath);
    const paths = splitPath(path);
    return replaceGroupMarks(paths, groups);
  };
  var extractGroupsFromPath = (path) => {
    const groups = [];
    path = path.replace(/\{[^}]+\}/g, (match2, index) => {
      const mark = `@${index}`;
      groups.push([mark, match2]);
      return mark;
    });
    return {
      groups,
      path
    };
  };
  var replaceGroupMarks = (paths, groups) => {
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
    return paths;
  };
  var patternCache = {};
  var getPattern = (label, next) => {
    if (label === "*") return "*";
    const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (match2) {
      const cacheKey = `${label}#${next}`;
      if (!patternCache[cacheKey]) {
        if (match2[2]) patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
          cacheKey,
          match2[1],
          new RegExp(`^${match2[2]}(?=/${next})`)
        ] : [
          label,
          match2[1],
          new RegExp(`^${match2[2]}$`)
        ];
        else patternCache[cacheKey] = [
          label,
          match2[1],
          true
        ];
      }
      return patternCache[cacheKey];
    }
    return null;
  };
  var tryDecode = (str, decoder) => {
    try {
      return decoder(str);
    } catch {
      return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
        try {
          return decoder(match2);
        } catch {
          return match2;
        }
      });
    }
  };
  var tryDecodeURI = (str) => tryDecode(str, decodeURI);
  var getPath = (request) => {
    const url = request.url;
    const start = url.indexOf("/", url.indexOf(":") + 4);
    let i = start;
    for (; i < url.length; i++) {
      const charCode = url.charCodeAt(i);
      if (charCode === 37) {
        const queryIndex = url.indexOf("?", i);
        const hashIndex = url.indexOf("#", i);
        const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
        const path = url.slice(start, end);
        return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
      } else if (charCode === 63 || charCode === 35) break;
    }
    return url.slice(start, i);
  };
  var getPathNoStrict = (request) => {
    const result = getPath(request);
    return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
  };
  var mergePath = (base, sub, ...rest) => {
    if (rest.length) sub = mergePath(sub, ...rest);
    return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
  };
  var checkOptionalParameter = (path) => {
    if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
    const segments = path.split("/");
    const results = [];
    let basePath = "";
    segments.forEach((segment) => {
      if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
      else if (/\:/.test(segment)) {
        if (segment.charCodeAt(segment.length - 1) === 63) {
          if (results.length === 0 && basePath === "") results.push("/");
          else results.push(basePath);
          const optionalSegment = segment.slice(0, -1);
          basePath += "/" + optionalSegment;
          results.push(basePath);
        } else basePath += "/" + segment;
      }
    });
    return results.filter((v, i, a) => a.indexOf(v) === i);
  };
  var tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
  var _decodeURI = (value) => {
    if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
    return tryDecodeURIComponent(value);
  };
  var _getQueryParam = (url, key, multiple) => {
    const hashIndex = url.indexOf("#", 8);
    if (hashIndex !== -1) url = url.slice(0, hashIndex);
    let encoded;
    if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
      const queryIndex = url.indexOf("?", 8);
      let keyIndex2 = queryIndex;
      if (keyIndex2 === -1) return;
      if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
      while (keyIndex2 !== -1) {
        const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
        if (trailingKeyCode === 61 || trailingKeyCode === 38 || isNaN(trailingKeyCode)) {
          if (keyIndex2 > queryIndex && /(?:^|&)[^=&]*[%+]/.test(url.slice(queryIndex + 1, keyIndex2))) break;
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          }
          return "";
        }
        keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
      }
      encoded = /[%+]/.test(url);
      if (!encoded) return;
    }
    const results = /* @__PURE__ */ Object.create(null);
    encoded ?? (encoded = /[%+]/.test(url));
    let keyIndex = url.indexOf("?", 8);
    while (keyIndex !== -1) {
      const nextKeyIndex = url.indexOf("&", keyIndex + 1);
      let valueIndex = url.indexOf("=", keyIndex);
      if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
      let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
      if (encoded) name = _decodeURI(name);
      keyIndex = nextKeyIndex;
      if (name === "") continue;
      let value;
      if (valueIndex === -1) value = "";
      else {
        value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
        if (encoded) value = _decodeURI(value);
      }
      if (multiple) {
        if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
        results[name].push(value);
      } else results[name] ?? (results[name] = value);
    }
    return key ? results[key] : results;
  };
  var getQueryParam = _getQueryParam;
  var getQueryParams = (url, key) => {
    return _getQueryParam(url, key, true);
  };
  var decodeURIComponent_ = decodeURIComponent;

  // node_modules/hono/dist/request.js
  var _validatedData, _matchResult, _HonoRequest_instances, getDecodedParam_fn, getAllDecodedParams_fn, getParamValue_fn, _cachedBody, _a;
  var HonoRequest = (_a = class {
    constructor(request, path = "/", matchResult = [[]]) {
      __privateAdd(this, _HonoRequest_instances);
      /**
      * `.raw` can get the raw Request object.
      *
      * @see {@link https://hono.dev/docs/api/request#raw}
      *
      * @example
      * ```ts
      * // For Cloudflare Workers
      * app.post('/', async (c) => {
      *   const metadata = c.req.raw.cf?.hostMetadata?
      *   ...
      * })
      * ```
      */
      __publicField(this, "raw");
      __privateAdd(this, _validatedData);
      __privateAdd(this, _matchResult);
      __publicField(this, "routeIndex", 0);
      /**
      * `.path` can get the pathname of the request.
      *
      * @see {@link https://hono.dev/docs/api/request#path}
      *
      * @example
      * ```ts
      * app.get('/about/me', (c) => {
      *   const pathname = c.req.path // `/about/me`
      * })
      * ```
      */
      __publicField(this, "path");
      __publicField(this, "bodyCache", {});
      __privateAdd(this, _cachedBody, (key) => {
        const { bodyCache, raw: raw2 } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) return cachedBody;
        for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
          if (anyCachedKey === "json") body = JSON.stringify(body);
          const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
          return new Response(body, { headers: contentType ? { "Content-Type": contentType } : void 0 })[key]();
        });
        return bodyCache[key] = raw2[key]();
      });
      this.raw = request;
      this.path = path;
      __privateSet(this, _matchResult, matchResult);
    }
    param(key) {
      return key ? __privateMethod(this, _HonoRequest_instances, getDecodedParam_fn).call(this, key) : __privateMethod(this, _HonoRequest_instances, getAllDecodedParams_fn).call(this);
    }
    query(key) {
      return getQueryParam(this.url, key);
    }
    queries(key) {
      return getQueryParams(this.url, key);
    }
    header(name) {
      if (name) return this.raw.headers.get(name) ?? void 0;
      const headerData = /* @__PURE__ */ Object.create(null);
      this.raw.headers.forEach((value, key) => {
        headerData[key] = value;
      });
      return headerData;
    }
    async parseBody(options) {
      return parseBody(this, options);
    }
    /**
    * `.json()` can parse Request body of type `application/json`
    *
    * @see {@link https://hono.dev/docs/api/request#json}
    *
    * @example
    * ```ts
    * app.post('/entry', async (c) => {
    *   const body = await c.req.json()
    * })
    * ```
    */
    json() {
      return __privateGet(this, _cachedBody).call(this, "text").then((text) => JSON.parse(text));
    }
    /**
    * `.text()` can parse Request body of type `text/plain`
    *
    * @see {@link https://hono.dev/docs/api/request#text}
    *
    * @example
    * ```ts
    * app.post('/entry', async (c) => {
    *   const body = await c.req.text()
    * })
    * ```
    */
    text() {
      return __privateGet(this, _cachedBody).call(this, "text");
    }
    /**
    * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
    *
    * @see {@link https://hono.dev/docs/api/request#arraybuffer}
    *
    * @example
    * ```ts
    * app.post('/entry', async (c) => {
    *   const body = await c.req.arrayBuffer()
    * })
    * ```
    */
    arrayBuffer() {
      return __privateGet(this, _cachedBody).call(this, "arrayBuffer");
    }
    /**
    * `.bytes()` parses the request body as a `Uint8Array`.
    *
    * @see {@link https://hono.dev/docs/api/request#bytes}
    *
    * @example
    * ```ts
    * app.post('/entry', async (c) => {
    *   const body = await c.req.bytes()
    * })
    * ```
    */
    bytes() {
      return __privateGet(this, _cachedBody).call(this, "arrayBuffer").then((buffer) => new Uint8Array(buffer));
    }
    /**
    * Parses the request body as a `Blob`.
    * @example
    * ```ts
    * app.post('/entry', async (c) => {
    *   const body = await c.req.blob();
    * });
    * ```
    * @see https://hono.dev/docs/api/request#blob
    */
    blob() {
      return __privateGet(this, _cachedBody).call(this, "blob");
    }
    /**
    * Parses the request body as `FormData`.
    * @example
    * ```ts
    * app.post('/entry', async (c) => {
    *   const body = await c.req.formData();
    * });
    * ```
    * @see https://hono.dev/docs/api/request#formdata
    */
    formData() {
      return __privateGet(this, _cachedBody).call(this, "formData");
    }
    /**
    * Adds validated data to the request.
    *
    * @param target - The target of the validation.
    * @param data - The validated data to add.
    */
    addValidatedData(target, data) {
      (__privateGet(this, _validatedData) ?? __privateSet(this, _validatedData, {}))[target] = data;
    }
    valid(target) {
      return __privateGet(this, _validatedData)?.[target];
    }
    /**
    * `.url` can get the request url strings.
    *
    * @see {@link https://hono.dev/docs/api/request#url}
    *
    * @example
    * ```ts
    * app.get('/about/me', (c) => {
    *   const url = c.req.url // `http://localhost:8787/about/me`
    *   ...
    * })
    * ```
    */
    get url() {
      return this.raw.url;
    }
    /**
    * `.method` can get the method name of the request.
    *
    * @see {@link https://hono.dev/docs/api/request#method}
    *
    * @example
    * ```ts
    * app.get('/about/me', (c) => {
    *   const method = c.req.method // `GET`
    * })
    * ```
    */
    get method() {
      return this.raw.method;
    }
    get [GET_MATCH_RESULT]() {
      return __privateGet(this, _matchResult);
    }
    /**
    * `.matchedRoutes` can return a matched route in the handler
    *
    * @deprecated
    *
    * Use matchedRoutes helper defined in "hono/route" instead.
    *
    * @see {@link https://hono.dev/docs/api/request#matchedroutes}
    *
    * @example
    * ```ts
    * app.use('*', async function logger(c, next) {
    *   await next()
    *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
    *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
    *     console.log(
    *       method,
    *       ' ',
    *       path,
    *       ' '.repeat(Math.max(10 - path.length, 0)),
    *       name,
    *       i === c.req.routeIndex ? '<- respond from here' : ''
    *     )
    *   })
    * })
    * ```
    */
    get matchedRoutes() {
      return __privateGet(this, _matchResult)[0].map(([[, route]]) => route);
    }
    /**
    * `.routePath` can retrieve the path registered within the handler
    *
    * @deprecated
    *
    * Use routePath helper defined in "hono/route" instead.
    *
    * @see {@link https://hono.dev/docs/api/request#routepath}
    *
    * @example
    * ```ts
    * app.get('/posts/:id', (c) => {
    *   return c.json({ path: c.req.routePath })
    * })
    * ```
    */
    get routePath() {
      return __privateGet(this, _matchResult)[0].map(([[, route]]) => route)[this.routeIndex].path;
    }
  }, _validatedData = new WeakMap(), _matchResult = new WeakMap(), _HonoRequest_instances = new WeakSet(), getDecodedParam_fn = function(key) {
    const paramKey = __privateGet(this, _matchResult)[0][this.routeIndex]?.[1][key];
    const param = __privateMethod(this, _HonoRequest_instances, getParamValue_fn).call(this, paramKey);
    return param && tryDecodeURIComponent(param);
  }, getAllDecodedParams_fn = function() {
    const decoded = {};
    const keys = Object.keys(__privateGet(this, _matchResult)[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = __privateMethod(this, _HonoRequest_instances, getParamValue_fn).call(this, __privateGet(this, _matchResult)[0][this.routeIndex][1][key]);
      if (value !== void 0) decoded[key] = tryDecodeURIComponent(value);
    }
    return decoded;
  }, getParamValue_fn = function(paramKey) {
    return __privateGet(this, _matchResult)[1] ? __privateGet(this, _matchResult)[1][paramKey] : paramKey;
  }, _cachedBody = new WeakMap(), _a);

  // node_modules/hono/dist/utils/html.js
  var HtmlEscapedCallbackPhase = {
    Stringify: 1,
    BeforeStream: 2,
    Stream: 3
  };
  var raw = (value, callbacks) => {
    const escapedString = new String(value);
    escapedString.isEscaped = true;
    escapedString.callbacks = callbacks;
    return escapedString;
  };
  var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
    if (typeof str === "object" && !(str instanceof String)) {
      if (!(str instanceof Promise)) str = str.toString();
      if (str instanceof Promise) str = await str;
    }
    const callbacks = str.callbacks;
    if (!callbacks?.length) return Promise.resolve(str);
    if (buffer) buffer[0] += str;
    else buffer = [str];
    const resStr = Promise.all(callbacks.map((c) => c({
      phase,
      buffer,
      context
    }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
    if (preserveCallbacks) return raw(await resStr, callbacks);
    else return resStr;
  };

  // node_modules/hono/dist/context.js
  var TEXT_PLAIN = "text/plain; charset=UTF-8";
  var setDefaultContentType = (contentType, headers) => {
    return {
      "Content-Type": contentType,
      ...headers
    };
  };
  var createResponseInstance = (body, init) => new Response(body, init);
  var _rawRequest, _req, _var, _status, _executionCtx, _res, _layout, _renderer, _notFoundHandler, _preparedHeaders, _matchResult2, _path, _Context_instances, newResponse_fn, _a2;
  var Context = (_a2 = class {
    /**
    * Creates an instance of the Context class.
    *
    * @param req - The Request object.
    * @param options - Optional configuration options for the context.
    */
    constructor(req, options) {
      __privateAdd(this, _Context_instances);
      __privateAdd(this, _rawRequest);
      __privateAdd(this, _req);
      /**
      * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
      *
      * @see {@link https://hono.dev/docs/api/context#env}
      *
      * @example
      * ```ts
      * // Environment object for Cloudflare Workers
      * app.get('*', async c => {
      *   const counter = c.env.COUNTER
      * })
      * ```
      */
      __publicField(this, "env", {});
      __privateAdd(this, _var);
      __publicField(this, "finalized", false);
      /**
      * `.error` can get the error object from the middleware if the Handler throws an error.
      *
      * @see {@link https://hono.dev/docs/api/context#error}
      *
      * @example
      * ```ts
      * app.use('*', async (c, next) => {
      *   await next()
      *   if (c.error) {
      *     // do something...
      *   }
      * })
      * ```
      */
      __publicField(this, "error");
      __privateAdd(this, _status);
      __privateAdd(this, _executionCtx);
      __privateAdd(this, _res);
      __privateAdd(this, _layout);
      __privateAdd(this, _renderer);
      __privateAdd(this, _notFoundHandler);
      __privateAdd(this, _preparedHeaders);
      __privateAdd(this, _matchResult2);
      __privateAdd(this, _path);
      /**
      * `.render()` can create a response within a layout.
      *
      * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
      *
      * @example
      * ```ts
      * app.get('/', (c) => {
      *   return c.render('Hello!')
      * })
      * ```
      */
      __publicField(this, "render", (...args) => {
        __privateGet(this, _renderer) ?? __privateSet(this, _renderer, (content) => this.html(content));
        return __privateGet(this, _renderer).call(this, ...args);
      });
      /**
      * Sets the layout for the response.
      *
      * @param layout - The layout to set.
      * @returns The layout function.
      */
      __publicField(this, "setLayout", (layout) => __privateSet(this, _layout, layout));
      /**
      * Gets the current layout for the response.
      *
      * @returns The current layout function.
      */
      __publicField(this, "getLayout", () => __privateGet(this, _layout));
      /**
      * `.setRenderer()` can set the layout in the custom middleware.
      *
      * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
      *
      * @example
      * ```tsx
      * app.use('*', async (c, next) => {
      *   c.setRenderer((content) => {
      *     return c.html(
      *       <html>
      *         <body>
      *           <p>{content}</p>
      *         </body>
      *       </html>
      *     )
      *   })
      *   await next()
      * })
      * ```
      */
      __publicField(this, "setRenderer", (renderer) => {
        __privateSet(this, _renderer, renderer);
      });
      /**
      * `.header()` can set headers.
      *
      * @see {@link https://hono.dev/docs/api/context#header}
      *
      * @example
      * ```ts
      * app.get('/welcome', (c) => {
      *   // Set headers
      *   c.header('X-Message', 'Hello!')
      *   c.header('Content-Type', 'text/plain')
      *
      *   // Append multiple headers using the append option (e.g. Vary)
      *   c.header('Vary', 'Accept-Encoding', { append: true })
      *   c.header('Vary', 'User-Agent', { append: true })
      *
      *   return c.body('Thank you for coming')
      * })
      * ```
      */
      __publicField(this, "header", (name, value, options) => {
        if (this.finalized) __privateSet(this, _res, createResponseInstance(__privateGet(this, _res).body, __privateGet(this, _res)));
        const headers = __privateGet(this, _res) ? __privateGet(this, _res).headers : __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, new Headers());
        if (value === void 0) headers.delete(name);
        else if (options?.append) headers.append(name, value);
        else headers.set(name, value);
      });
      __publicField(this, "status", (status) => {
        __privateSet(this, _status, status);
      });
      /**
      * `.set()` can set the value specified by the key.
      *
      * @see {@link https://hono.dev/docs/api/context#set-get}
      *
      * @example
      * ```ts
      * app.use('*', async (c, next) => {
      *   c.set('message', 'Hono is hot!!')
      *   await next()
      * })
      * ```
      */
      __publicField(this, "set", (key, value) => {
        __privateGet(this, _var) ?? __privateSet(this, _var, /* @__PURE__ */ new Map());
        __privateGet(this, _var).set(key, value);
      });
      /**
      * `.get()` can use the value specified by the key.
      *
      * @see {@link https://hono.dev/docs/api/context#set-get}
      *
      * @example
      * ```ts
      * app.get('/', (c) => {
      *   const message = c.get('message')
      *   return c.text(`The message is "${message}"`)
      * })
      * ```
      */
      __publicField(this, "get", (key) => {
        return __privateGet(this, _var) ? __privateGet(this, _var).get(key) : void 0;
      });
      __publicField(this, "newResponse", (...args) => __privateMethod(this, _Context_instances, newResponse_fn).call(this, ...args));
      /**
      * `.body()` can return the HTTP response.
      * You can set headers with `.header()` and set HTTP status code with `.status`.
      * This can also be set in `.text()`, `.json()` and so on.
      *
      * @see {@link https://hono.dev/docs/api/context#body}
      *
      * @example
      * ```ts
      * app.get('/welcome', (c) => {
      *   // Set headers
      *   c.header('X-Message', 'Hello!')
      *   c.header('Content-Type', 'text/plain')
      *   // Set HTTP status code
      *   c.status(201)
      *
      *   // Return the response body
      *   return c.body('Thank you for coming')
      * })
      * ```
      */
      __publicField(this, "body", (data, arg, headers) => __privateMethod(this, _Context_instances, newResponse_fn).call(this, data, arg, headers));
      /**
      * `.text()` can render text as `Content-Type:text/plain`.
      *
      * @see {@link https://hono.dev/docs/api/context#text}
      *
      * @example
      * ```ts
      * app.get('/say', (c) => {
      *   return c.text('Hello!')
      * })
      * ```
      */
      __publicField(this, "text", (text, arg, headers) => {
        return !__privateGet(this, _preparedHeaders) && !__privateGet(this, _status) && !arg && !headers && !this.finalized ? new Response(text) : __privateMethod(this, _Context_instances, newResponse_fn).call(this, text, arg, setDefaultContentType(TEXT_PLAIN, headers));
      });
      /**
      * `.json()` can render JSON as `Content-Type:application/json`.
      *
      * @see {@link https://hono.dev/docs/api/context#json}
      *
      * @example
      * ```ts
      * app.get('/api', (c) => {
      *   return c.json({ message: 'Hello!' })
      * })
      * ```
      */
      __publicField(this, "json", (object, arg, headers) => {
        return __privateMethod(this, _Context_instances, newResponse_fn).call(this, JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
      });
      __publicField(this, "html", (html, arg, headers) => {
        const res = (html2) => __privateMethod(this, _Context_instances, newResponse_fn).call(this, html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
        return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
      });
      /**
      * `.redirect()` can Redirect, default status code is 302.
      *
      * @see {@link https://hono.dev/docs/api/context#redirect}
      *
      * @example
      * ```ts
      * app.get('/redirect', (c) => {
      *   return c.redirect('/')
      * })
      * app.get('/redirect-permanently', (c) => {
      *   return c.redirect('/', 301)
      * })
      * ```
      */
      __publicField(this, "redirect", (location2, status) => {
        const locationString = String(location2);
        this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
        return this.newResponse(null, status ?? 302);
      });
      /**
      * `.notFound()` can return the Not Found Response.
      *
      * @see {@link https://hono.dev/docs/api/context#notfound}
      *
      * @example
      * ```ts
      * app.get('/notfound', (c) => {
      *   return c.notFound()
      * })
      * ```
      */
      __publicField(this, "notFound", () => {
        __privateGet(this, _notFoundHandler) ?? __privateSet(this, _notFoundHandler, () => createResponseInstance());
        return __privateGet(this, _notFoundHandler).call(this, this);
      });
      __privateSet(this, _rawRequest, req);
      if (options) {
        __privateSet(this, _executionCtx, options.executionCtx);
        this.env = options.env;
        __privateSet(this, _notFoundHandler, options.notFoundHandler);
        __privateSet(this, _path, options.path);
        __privateSet(this, _matchResult2, options.matchResult);
      }
    }
    /**
    * `.req` is the instance of {@link HonoRequest}.
    */
    get req() {
      __privateGet(this, _req) ?? __privateSet(this, _req, new HonoRequest(__privateGet(this, _rawRequest), __privateGet(this, _path), __privateGet(this, _matchResult2)));
      return __privateGet(this, _req);
    }
    /**
    * @see {@link https://hono.dev/docs/api/context#event}
    * The FetchEvent associated with the current request.
    *
    * @throws Will throw an error if the context does not have a FetchEvent.
    */
    get event() {
      if (__privateGet(this, _executionCtx) && "respondWith" in __privateGet(this, _executionCtx)) return __privateGet(this, _executionCtx);
      else throw Error("This context has no FetchEvent");
    }
    /**
    * @see {@link https://hono.dev/docs/api/context#executionctx}
    * The ExecutionContext associated with the current request.
    *
    * @throws Will throw an error if the context does not have an ExecutionContext.
    */
    get executionCtx() {
      if (__privateGet(this, _executionCtx)) return __privateGet(this, _executionCtx);
      else throw Error("This context has no ExecutionContext");
    }
    /**
    * @see {@link https://hono.dev/docs/api/context#res}
    * The Response object for the current request.
    */
    get res() {
      return __privateGet(this, _res) || __privateSet(this, _res, createResponseInstance(null, { headers: __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, new Headers()) }));
    }
    /**
    * Sets the Response object for the current request.
    *
    * @param _res - The Response object to set.
    */
    set res(_res2) {
      if (__privateGet(this, _res) && _res2) {
        _res2 = createResponseInstance(_res2.body, _res2);
        for (const [k, v] of __privateGet(this, _res).headers.entries()) {
          if (k === "content-type") continue;
          if (k === "set-cookie") {
            const cookies = __privateGet(this, _res).headers.getSetCookie();
            _res2.headers.delete("set-cookie");
            for (const cookie of cookies) _res2.headers.append("set-cookie", cookie);
          } else _res2.headers.set(k, v);
        }
      }
      __privateSet(this, _res, _res2);
      this.finalized = true;
    }
    /**
    * `.var` can access the value of a variable.
    *
    * @see {@link https://hono.dev/docs/api/context#var}
    *
    * @example
    * ```ts
    * const result = c.var.client.oneMethod()
    * ```
    */
    get var() {
      if (!__privateGet(this, _var)) return {};
      return Object.fromEntries(__privateGet(this, _var));
    }
  }, _rawRequest = new WeakMap(), _req = new WeakMap(), _var = new WeakMap(), _status = new WeakMap(), _executionCtx = new WeakMap(), _res = new WeakMap(), _layout = new WeakMap(), _renderer = new WeakMap(), _notFoundHandler = new WeakMap(), _preparedHeaders = new WeakMap(), _matchResult2 = new WeakMap(), _path = new WeakMap(), _Context_instances = new WeakSet(), newResponse_fn = function(data, arg, headers) {
    let responseHeaders = __privateGet(this, _res) ? new Headers(__privateGet(this, _res).headers) : __privateGet(this, _preparedHeaders);
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ?? (responseHeaders = new Headers());
      for (const [key, value] of new Headers(arg.headers)) if (key === "set-cookie") responseHeaders.append(key, value);
      else responseHeaders.set(key, value);
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) if (++count > 1 || typeof headers[k] !== "string") {
          responseHeaders = new Headers();
          break;
        }
      }
      if (responseHeaders) for (const k in headers) {
        const v = headers[k];
        if (typeof v === "string") responseHeaders.set(k, v);
        else {
          responseHeaders.delete(k);
          for (const v2 of v) responseHeaders.append(k, v2);
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? __privateGet(this, _status);
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }, _a2);

  // node_modules/hono/dist/compose.js
  var compose = (middleware, onError, onNotFound) => {
    return (context, next) => {
      let index = -1;
      return dispatch(0);
      async function dispatch(i) {
        if (i <= index) throw new Error("next() called multiple times");
        index = i;
        let res;
        let isError = false;
        let handler;
        if (middleware[i]) {
          handler = middleware[i][0][0];
          context.req.routeIndex = i;
        } else handler = i === middleware.length && next || void 0;
        if (handler) try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else throw err;
        }
        else if (context.finalized === false && onNotFound) res = await onNotFound(context);
        if (res && (context.finalized === false || isError)) context.res = res;
        return context;
      }
    };
  };

  // node_modules/hono/dist/router.js
  var METHODS = [
    "get",
    "post",
    "put",
    "delete",
    "options",
    "patch",
    "query"
  ];
  var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
  var UnsupportedPathError = class extends Error {
  };

  // node_modules/hono/dist/utils/constants.js
  var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

  // node_modules/hono/dist/hono-base.js
  var notFoundHandler = (c) => {
    return c.text("404 Not Found", 404);
  };
  var errorHandler = (err, c) => {
    if ("getResponse" in err) {
      const res = err.getResponse();
      return c.newResponse(res.body, res);
    }
    console.error(err);
    return c.text("Internal Server Error", 500);
  };
  var _path2, _Hono_instances, clone_fn, _notFoundHandler2, addRoute_fn, handleError_fn, dispatch_fn, _a3;
  var Hono = (_a3 = class {
    constructor(options = {}) {
      __privateAdd(this, _Hono_instances);
      __publicField(this, "get");
      __publicField(this, "post");
      __publicField(this, "put");
      __publicField(this, "delete");
      __publicField(this, "options");
      __publicField(this, "patch");
      __publicField(this, "query");
      __publicField(this, "all");
      __publicField(this, "on");
      __publicField(this, "use");
      __publicField(this, "router");
      __publicField(this, "getPath");
      __publicField(this, "_basePath", "/");
      __privateAdd(this, _path2, "/");
      __publicField(this, "routes", []);
      __privateAdd(this, _notFoundHandler2, notFoundHandler);
      __publicField(this, "errorHandler", errorHandler);
      /**
      * `.onError()` handles an error and returns a customized Response.
      *
      * @see {@link https://hono.dev/docs/api/hono#error-handling}
      *
      * @param {ErrorHandler} handler - request Handler for error
      * @returns {Hono} changed Hono instance
      *
      * @example
      * ```ts
      * app.onError((err, c) => {
      *   console.error(`${err}`)
      *   return c.text('Custom Error Message', 500)
      * })
      * ```
      */
      __publicField(this, "onError", (handler) => {
        this.errorHandler = handler;
        return this;
      });
      /**
      * `.notFound()` allows you to customize a Not Found Response.
      *
      * @see {@link https://hono.dev/docs/api/hono#not-found}
      *
      * @param {NotFoundHandler} handler - request handler for not-found
      * @returns {Hono} changed Hono instance
      *
      * @example
      * ```ts
      * app.notFound((c) => {
      *   return c.text('Custom 404 Message', 404)
      * })
      * ```
      */
      __publicField(this, "notFound", (handler) => {
        __privateSet(this, _notFoundHandler2, handler);
        return this;
      });
      /**
      * `.fetch()` will be entry point of your app.
      *
      * @see {@link https://hono.dev/docs/api/hono#fetch}
      *
      * @param {Request} request - request Object of request
      * @param {Env} env - env Object
      * @param {ExecutionContext} executionCtx - context of execution
      * @returns {Response | Promise<Response>} response of request
      *
      */
      __publicField(this, "fetch", (request, ...rest) => {
        return __privateMethod(this, _Hono_instances, dispatch_fn).call(this, request, rest[1], rest[0], request.method);
      });
      /**
      * `.request()` is a useful method for testing.
      * You can pass a URL or pathname to send a GET request.
      * app will return a Response object.
      * ```ts
      * test('GET /hello is ok', async () => {
      *   const res = await app.request('/hello')
      *   expect(res.status).toBe(200)
      * })
      * ```
      * @see https://hono.dev/docs/api/hono#request
      */
      __publicField(this, "request", (input, requestInit, Env, executionCtx) => {
        if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
        input = input.toString();
        return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
      });
      /**
      * `.fire()` automatically adds a global fetch event listener.
      * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
      * @deprecated
      * Use `fire` from `hono/service-worker` instead.
      * ```ts
      * import { Hono } from 'hono'
      * import { fire } from 'hono/service-worker'
      *
      * const app = new Hono()
      * // ...
      * fire(app)
      * ```
      * @see https://hono.dev/docs/api/hono#fire
      * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
      * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
      */
      __publicField(this, "fire", () => {
        addEventListener("fetch", (event) => {
          event.respondWith(__privateMethod(this, _Hono_instances, dispatch_fn).call(this, event.request, event, void 0, event.request.method));
        });
      });
      [...METHODS, "all"].forEach((method) => {
        this[method] = (args1, ...args) => {
          const methodName = method.toUpperCase();
          if (typeof args1 === "string") __privateSet(this, _path2, args1);
          else __privateMethod(this, _Hono_instances, addRoute_fn).call(this, methodName, __privateGet(this, _path2), args1);
          args.forEach((handler) => {
            __privateMethod(this, _Hono_instances, addRoute_fn).call(this, methodName, __privateGet(this, _path2), handler);
          });
          return this;
        };
      });
      this.on = (method, path, ...handlers) => {
        for (const p of [path].flat()) {
          __privateSet(this, _path2, p);
          for (const m of [method].flat()) {
            const methodName = m.toUpperCase();
            for (const handler of handlers) __privateMethod(this, _Hono_instances, addRoute_fn).call(this, methodName, __privateGet(this, _path2), handler);
          }
        }
        return this;
      };
      this.use = (arg1, ...handlers) => {
        if (typeof arg1 === "string") __privateSet(this, _path2, arg1);
        else {
          __privateSet(this, _path2, "*");
          handlers.unshift(arg1);
        }
        handlers.forEach((handler) => {
          __privateMethod(this, _Hono_instances, addRoute_fn).call(this, "ALL", __privateGet(this, _path2), handler);
        });
        return this;
      };
      const { strict, ...optionsWithoutStrict } = options;
      Object.assign(this, optionsWithoutStrict);
      this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
    }
    /**
    * `.route()` allows grouping other Hono instance in routes.
    *
    * @see {@link https://hono.dev/docs/api/routing#grouping}
    *
    * @param {string} path - base Path
    * @param {Hono} app - other Hono instance
    * @returns {Hono} routed Hono instance
    *
    * @example
    * ```ts
    * const app = new Hono()
    * const app2 = new Hono()
    *
    * app2.get("/user", (c) => c.text("user"))
    * app.route("/api", app2) // GET /api/user
    * ```
    */
    route(path, app2) {
      const subApp = this.basePath(path);
      app2.routes.map((r) => {
        var _a10;
        let handler;
        if (app2.errorHandler === errorHandler) handler = r.handler;
        else {
          handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
          handler[COMPOSED_HANDLER] = r.handler;
        }
        __privateMethod(_a10 = subApp, _Hono_instances, addRoute_fn).call(_a10, r.method, r.path, handler, r.basePath);
      });
      return this;
    }
    /**
    * `.basePath()` allows base paths to be specified.
    *
    * @see {@link https://hono.dev/docs/api/routing#base-path}
    *
    * @param {string} path - base Path
    * @returns {Hono} changed Hono instance
    *
    * @example
    * ```ts
    * const api = new Hono().basePath('/api')
    * ```
    */
    basePath(path) {
      const subApp = __privateMethod(this, _Hono_instances, clone_fn).call(this);
      subApp._basePath = mergePath(this._basePath, path);
      return subApp;
    }
    /**
    * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
    *
    * @deprecated Use `mount()` from `hono/mount` instead. `.mount()` will be removed in v5.
    *
    * @see {@link https://hono.dev/docs/api/hono#mount}
    *
    * @param {string} path - base Path
    * @param {Function} applicationHandler - other Request Handler
    * @param {MountOptions} [options] - options of `.mount()`
    * @returns {Hono} mounted Hono instance
    *
    * @example
    * ```ts
    * import { Router as IttyRouter } from 'itty-router'
    * import { Hono } from 'hono'
    * // Create itty-router application
    * const ittyRouter = IttyRouter()
    * // GET /itty-router/hello
    * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
    *
    * const app = new Hono()
    * app.mount('/itty-router', ittyRouter.handle)
    * ```
    *
    * @example
    * ```ts
    * const app = new Hono()
    * // Send the request to another application without modification.
    * app.mount('/app', anotherApp, {
    *   replaceRequest: (req) => req,
    * })
    * ```
    */
    mount(path, applicationHandler, options) {
      let replaceRequest;
      let optionHandler;
      if (options) {
        if (typeof options === "function") optionHandler = options;
        else {
          optionHandler = options.optionHandler;
          if (options.replaceRequest === false) replaceRequest = (request) => request;
          else replaceRequest = options.replaceRequest;
        }
      }
      const getOptions = optionHandler ? (c) => {
        const options2 = optionHandler(c);
        return Array.isArray(options2) ? options2 : [options2];
      } : (c) => {
        let executionContext = void 0;
        try {
          executionContext = c.executionCtx;
        } catch {
        }
        return [c.env, executionContext];
      };
      replaceRequest || (replaceRequest = (() => {
        const mergedPath = mergePath(this._basePath, path);
        const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
        return (request) => {
          const url = new URL(request.url);
          url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
          return new Request(url, request);
        };
      })());
      const handler = async (c, next) => {
        const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
        if (res) return res;
        await next();
      };
      __privateMethod(this, _Hono_instances, addRoute_fn).call(this, "ALL", mergePath(path, "*"), handler);
      return this;
    }
  }, _path2 = new WeakMap(), _Hono_instances = new WeakSet(), clone_fn = function() {
    const clone = new _a3({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    __privateSet(clone, _notFoundHandler2, __privateGet(this, _notFoundHandler2));
    clone.routes = this.routes;
    return clone;
  }, _notFoundHandler2 = new WeakMap(), addRoute_fn = function(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }, handleError_fn = function(err, c) {
    if (err instanceof Error) return this.errorHandler(err, c);
    throw err;
  }, dispatch_fn = function(request, executionCtx, env, method) {
    if (method === "HEAD") return (async () => new Response(null, await __privateMethod(this, _Hono_instances, dispatch_fn).call(this, request, executionCtx, env, "GET")))();
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: __privateGet(this, _notFoundHandler2)
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await __privateGet(this, _notFoundHandler2).call(this, c);
        });
      } catch (err) {
        return __privateMethod(this, _Hono_instances, handleError_fn).call(this, err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : __privateGet(this, _notFoundHandler2).call(this, c))).catch((err) => __privateMethod(this, _Hono_instances, handleError_fn).call(this, err, c)) : res ?? __privateGet(this, _notFoundHandler2).call(this, c);
    }
    const composed = compose(matchResult[0], this.errorHandler, __privateGet(this, _notFoundHandler2));
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        return context.res;
      } catch (err) {
        return __privateMethod(this, _Hono_instances, handleError_fn).call(this, err, c);
      }
    })();
  }, _a3);

  // node_modules/hono/dist/router/utils.js
  var createNullObject = () => /* @__PURE__ */ Object.create(null);

  // node_modules/hono/dist/router/reg-exp-router/matcher.js
  var emptyParam = [];
  function match(method, path) {
    const matchers = this.buildAllMatchers();
    const match2 = (method2, path2) => {
      const matcher = matchers[method2] || matchers["ALL"];
      const staticMatch = matcher[2][path2];
      if (staticMatch) return staticMatch;
      const match3 = path2.match(matcher[0]);
      if (!match3) return [[], emptyParam];
      const index = match3.indexOf("", 1);
      return [matcher[1][index], match3];
    };
    this.match = match2;
    return match2(method, path);
  }

  // node_modules/hono/dist/router/reg-exp-router/node.js
  var LABEL_REG_EXP_STR = "[^/]+";
  var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
  var PATH_ERROR = Symbol();
  var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
  function compareKey(a, b) {
    if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
    if (b.length === 1) return 1;
    if (a === ".*" || a === "(?:|/.*)") return b === "(?:|/.*)" ? -1 : 1;
    else if (b === ".*" || b === "(?:|/.*)") return -1;
    if (a === "[^/]+") return 1;
    else if (b === "[^/]+") return -1;
    return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
  }
  var _index, _varIndex, _children, _a4;
  var Node = (_a4 = class {
    constructor() {
      __privateAdd(this, _index);
      __privateAdd(this, _varIndex);
      __privateAdd(this, _children, createNullObject());
    }
    insert(tokens, index, paramMap, context, isStatic) {
      let node = this;
      for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
          "",
          "",
          ".*"
        ] : [
          "",
          "",
          LABEL_REG_EXP_STR
        ] : null : token === "/*" ? [
          "",
          "",
          TAIL_WILDCARD_REG_EXP_STR
        ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
        let nextNode;
        if (pattern) {
          const name = pattern[1];
          let regexpStr = pattern[2] || "[^/]+";
          if (name && pattern[2]) {
            if (regexpStr === ".*") throw PATH_ERROR;
            regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
            if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
            if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) throw PATH_ERROR;
          }
          nextNode = __privateGet(node, _children)[regexpStr];
          if (!nextNode) {
            if (regexpStr !== ".*" && regexpStr !== "(?:|/.*)") {
              for (const k in __privateGet(node, _children)) if ((regexpStr.length > 1 || k.length > 1) && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
            }
            nextNode = __privateGet(node, _children)[regexpStr] = new _a4();
          }
          if (name !== "") {
            __privateGet(nextNode, _varIndex) ?? __privateSet(nextNode, _varIndex, context.varIndex++);
            paramMap.push([name, __privateGet(nextNode, _varIndex)]);
          }
        } else {
          nextNode = __privateGet(node, _children)[token];
          if (!nextNode) {
            for (const k in __privateGet(node, _children)) if (k.length > 1 && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
            nextNode = __privateGet(node, _children)[token] = new _a4();
          }
        }
        node = nextNode;
      }
      if (__privateGet(node, _index) !== void 0) throw PATH_ERROR;
      __privateSet(node, _index, isStatic ? -1 : index);
    }
    buildRegExpStr() {
      const strList = Object.keys(__privateGet(this, _children)).sort(compareKey).map((k) => {
        const c = __privateGet(this, _children)[k];
        const childStr = c.buildRegExpStr();
        return childStr === "" ? "" : (typeof __privateGet(c, _varIndex) === "number" ? `(${k})@${__privateGet(c, _varIndex)}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
      }).filter(Boolean);
      if (typeof __privateGet(this, _index) === "number" && __privateGet(this, _index) !== -1) strList.unshift(`#${__privateGet(this, _index)}`);
      if (strList.length === 0) return "";
      if (strList.length === 1) return strList[0];
      return "(?:" + strList.join("|") + ")";
    }
  }, _index = new WeakMap(), _varIndex = new WeakMap(), _children = new WeakMap(), _a4);

  // node_modules/hono/dist/router/reg-exp-router/trie.js
  var _context, _root, _index2, _a5;
  var Trie = (_a5 = class {
    constructor() {
      __privateAdd(this, _context, { varIndex: 0 });
      __privateAdd(this, _root, new Node());
      __privateAdd(this, _index2, 0);
      __publicField(this, "paths", createNullObject());
    }
    insert(path, isStatic) {
      if (isStatic) {
        __privateGet(this, _root).insert(path.split(""), 0, [], __privateGet(this, _context), true);
        return;
      }
      const paramAssoc = [];
      const groups = [];
      let markedPath = path;
      for (let i = 0; ; ) {
        let replaced = false;
        markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
          const mark = `@\\${i}`;
          groups[i] = [mark, m];
          i++;
          replaced = true;
          return mark;
        });
        if (!replaced) break;
      }
      const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
      __privateGet(this, _root).insert(tokens, __privateGet(this, _index2), paramAssoc, __privateGet(this, _context), false);
      this.paths[path] = [__privateWrapper(this, _index2)._++, paramAssoc];
    }
    buildRegExp() {
      let regexp = __privateGet(this, _root).buildRegExpStr();
      if (regexp === "") return [
        /^$/,
        [],
        []
      ];
      let captureIndex = 0;
      const indexReplacementMap = [];
      const paramReplacementMap = [];
      regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
        if (handlerIndex !== void 0) {
          indexReplacementMap[++captureIndex] = Number(handlerIndex);
          return "$()";
        }
        if (paramIndex !== void 0) {
          paramReplacementMap[Number(paramIndex)] = ++captureIndex;
          return "";
        }
        return "";
      });
      return [
        new RegExp(`^${regexp}`),
        indexReplacementMap,
        paramReplacementMap
      ];
    }
  }, _context = new WeakMap(), _root = new WeakMap(), _index2 = new WeakMap(), _a5);

  // node_modules/hono/dist/router/reg-exp-router/router.js
  var wildcardRegExpCache = createNullObject();
  function buildWildcardRegExp(path) {
    return wildcardRegExpCache[path] ?? (wildcardRegExpCache[path] = new RegExp(`^${path.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g, (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ".*" : `/:${LABEL_REG_EXP_STR}`)}$`));
  }
  function findMiddleware(middleware, path) {
    for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) if (buildWildcardRegExp(k).test(path)) return [...middleware[k]];
  }
  var _middleware, _routes, _tries, _RegExpRouter_instances, insertPath_fn, buildMatcher_fn, _a6;
  var RegExpRouter = (_a6 = class {
    constructor() {
      __privateAdd(this, _RegExpRouter_instances);
      __publicField(this, "name", "RegExpRouter");
      __privateAdd(this, _middleware);
      __privateAdd(this, _routes);
      __privateAdd(this, _tries);
      __publicField(this, "match", match);
      __privateSet(this, _middleware, { ["ALL"]: createNullObject() });
      __privateSet(this, _routes, { ["ALL"]: createNullObject() });
      __privateSet(this, _tries, { ["ALL"]: new Trie() });
    }
    add(method, path, handler) {
      const middleware = __privateGet(this, _middleware);
      const routes = __privateGet(this, _routes);
      if (!middleware) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
      if (!middleware[method]) {
        __privateGet(this, _tries)[method] = new Trie();
        for (const handlerMap of [middleware, routes]) {
          handlerMap[method] = createNullObject();
          for (const p in handlerMap["ALL"]) {
            handlerMap[method][p] = [...handlerMap["ALL"][p]];
            __privateMethod(this, _RegExpRouter_instances, insertPath_fn).call(this, method, p);
          }
        }
      }
      if (path === "/*") path = "*";
      const methods = method === "ALL" ? Object.keys(middleware) : [method];
      if (/\*$/.test(path)) {
        const re = buildWildcardRegExp(path);
        for (const m of methods) if (!middleware[m][path]) {
          __privateMethod(this, _RegExpRouter_instances, insertPath_fn).call(this, m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware["ALL"], path) || [];
        }
        for (const handlerMap of [middleware, routes]) for (const m of methods) for (const p in handlerMap[m]) re.test(p) && handlerMap[m][p].push([handler, path]);
        return;
      }
      const paths = checkOptionalParameter(path) || [path];
      for (const path2 of paths) for (const m of methods) {
        if (!routes[m][path2]) {
          __privateMethod(this, _RegExpRouter_instances, insertPath_fn).call(this, m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware["ALL"], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
    buildAllMatchers() {
      const matchers = createNullObject();
      for (const method of Object.keys(__privateGet(this, _routes))) matchers[method] = __privateMethod(this, _RegExpRouter_instances, buildMatcher_fn).call(this, method);
      __privateSet(this, _middleware, __privateSet(this, _routes, __privateSet(this, _tries, void 0)));
      wildcardRegExpCache = createNullObject();
      return matchers;
    }
  }, _middleware = new WeakMap(), _routes = new WeakMap(), _tries = new WeakMap(), _RegExpRouter_instances = new WeakSet(), insertPath_fn = function(method, path) {
    try {
      __privateGet(this, _tries)[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }, buildMatcher_fn = function(method) {
    const middleware = __privateGet(this, _middleware)[method];
    const routes = __privateGet(this, _routes)[method];
    const trie = __privateGet(this, _tries)[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) for (const path in r) {
      const handlers = r[path];
      const pathData = trie.paths[path];
      if (!pathData) {
        staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
        continue;
      }
      handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [h, trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
        map[key] = paramReplacementMap[pathData[1][i][1]];
        return map;
      }, createNullObject())]);
    }
    return [
      regexp,
      indexReplacementMap.map((i) => handlerData[i]),
      staticMap
    ];
  }, _a6);

  // node_modules/hono/dist/router/smart-router/router.js
  var _routers, _routes2, _a7;
  var SmartRouter = (_a7 = class {
    constructor(init) {
      __publicField(this, "name", "SmartRouter");
      __privateAdd(this, _routers, []);
      __privateAdd(this, _routes2, []);
      __privateSet(this, _routers, init.routers);
    }
    add(method, path, handler) {
      if (!__privateGet(this, _routes2)) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
      __privateGet(this, _routes2).push([
        method,
        path,
        handler
      ]);
    }
    match(method, path) {
      if (!__privateGet(this, _routes2)) throw new Error("Fatal error");
      const routers = __privateGet(this, _routers);
      const routes = __privateGet(this, _routes2);
      const len = routers.length;
      let i = 0;
      let res;
      for (; i < len; i++) {
        const router = routers[i];
        try {
          for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
          res = router.match(method, path);
        } catch (e) {
          if (e instanceof UnsupportedPathError) continue;
          throw e;
        }
        this.match = router.match.bind(router);
        __privateSet(this, _routers, [router]);
        __privateSet(this, _routes2, void 0);
        break;
      }
      if (i === len) throw new Error("Fatal error");
      this.name = `SmartRouter + ${this.activeRouter.name}`;
      return res;
    }
    get activeRouter() {
      if (__privateGet(this, _routes2) || __privateGet(this, _routers).length !== 1) throw new Error("No active router has been determined yet.");
      return __privateGet(this, _routers)[0];
    }
  }, _routers = new WeakMap(), _routes2 = new WeakMap(), _a7);

  // node_modules/hono/dist/router/trie-router/node.js
  var emptyParams = createNullObject();
  var order = 0;
  var _methods, _children2, _patterns, _pattern, _params, _Node_instances, pushHandlerSets_fn, _a8;
  var Node2 = (_a8 = class {
    constructor() {
      __privateAdd(this, _Node_instances);
      __privateAdd(this, _methods, []);
      __privateAdd(this, _children2, createNullObject());
      __privateAdd(this, _patterns, []);
      __privateAdd(this, _pattern);
      __privateAdd(this, _params, emptyParams);
    }
    insert(method, path, handler) {
      var _a10;
      let curNode = this;
      const parts = splitRoutingPath(path);
      const possibleKeys = /* @__PURE__ */ new Set();
      let i = 0;
      for (const p of parts) {
        const nextP = parts[++i];
        const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
        const isParam = Array.isArray(pattern);
        const key = isParam ? pattern[0] : pattern || p;
        const child = (_a10 = __privateGet(curNode, _children2))[key] || (_a10[key] = new _a8());
        if (pattern && !__privateGet(child, _pattern)) {
          __privateSet(child, _pattern, pattern);
          __privateGet(curNode, _patterns).push(child);
        }
        curNode = child;
        if (isParam) possibleKeys.add(pattern[1]);
      }
      __privateGet(curNode, _methods).push({ [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      } });
    }
    search(method, path) {
      const handlerSets = [];
      __privateSet(this, _params, emptyParams);
      let curNodes = [this];
      const parts = splitPath(path);
      const curNodesQueue = [];
      const len = parts.length;
      let partOffsets = null;
      for (let i = 0; i < len; i++) {
        const part = parts[i];
        const isLast = i === len - 1;
        const tempNodes = [];
        for (let j = 0, len2 = curNodes.length; j < len2; j++) {
          const node = curNodes[j];
          const nextNode = __privateGet(node, _children2)[part];
          if (nextNode) {
            __privateSet(nextNode, _params, __privateGet(node, _params));
            if (isLast) {
              if (__privateGet(nextNode, _children2)["*"]) __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, __privateGet(nextNode, _children2)["*"], method, __privateGet(node, _params));
              __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, nextNode, method, __privateGet(node, _params));
            } else tempNodes.push(nextNode);
          }
          for (const child of __privateGet(node, _patterns)) {
            const pattern = __privateGet(child, _pattern);
            const params = __privateGet(node, _params) === emptyParams ? {} : { ...__privateGet(node, _params) };
            if (typeof pattern === "string") {
              if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
                __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, child, method, __privateGet(node, _params));
                if (pattern === "*") {
                  __privateSet(child, _params, params);
                  tempNodes.push(child);
                }
              }
              continue;
            }
            const [, name, matcher] = pattern;
            if (!part && matcher === true) continue;
            if (matcher !== true) {
              if (!partOffsets) {
                partOffsets = [];
                let offset = path[0] === "/" ? 1 : 0;
                for (let p = 0; p < len; p++) {
                  partOffsets[p] = offset;
                  offset += parts[p].length + 1;
                }
              }
              const restPathString = path.slice(partOffsets[i]);
              const m = matcher.exec(restPathString);
              if (m) {
                if (!Object.hasOwn(params, name)) params[name] = m[0];
                __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, child, method, __privateGet(node, _params), params);
                if (m[0].length === restPathString.length && __privateGet(child, _children2)["*"]) __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, __privateGet(child, _children2)["*"], method, __privateGet(node, _params), params);
                for (const _ in __privateGet(child, _children2)) {
                  __privateSet(child, _params, params);
                  const componentCount = m[0].match(/\//g)?.length ?? 0;
                  (curNodesQueue[componentCount] || (curNodesQueue[componentCount] = [])).push(child);
                  break;
                }
                continue;
              }
            }
            if (matcher === true || matcher.test(part)) {
              if (!Object.hasOwn(params, name)) params[name] = part;
              if (isLast) {
                __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, child, method, params, __privateGet(node, _params));
                if (__privateGet(child, _children2)["*"]) __privateMethod(this, _Node_instances, pushHandlerSets_fn).call(this, handlerSets, __privateGet(child, _children2)["*"], method, params, __privateGet(node, _params));
              } else {
                __privateSet(child, _params, params);
                tempNodes.push(child);
              }
            }
          }
        }
        const shifted = curNodesQueue.shift();
        curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
      }
      if (handlerSets[1]) handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
      return [handlerSets.map(({ handler, params }) => [handler, params])];
    }
  }, _methods = new WeakMap(), _children2 = new WeakMap(), _patterns = new WeakMap(), _pattern = new WeakMap(), _params = new WeakMap(), _Node_instances = new WeakSet(), pushHandlerSets_fn = function(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = __privateGet(node, _methods).length; i < len; i++) {
      const m = __privateGet(node, _methods)[i];
      const handlerSet = m[method] || m["ALL"];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }, _a8);

  // node_modules/hono/dist/router/trie-router/router.js
  var _node, _a9;
  var TrieRouter = (_a9 = class {
    constructor() {
      __publicField(this, "name", "TrieRouter");
      __privateAdd(this, _node, new Node2());
    }
    add(method, path, handler) {
      for (const result of checkOptionalParameter(path) || [path]) __privateGet(this, _node).insert(method, result, handler);
    }
    match(method, path) {
      return __privateGet(this, _node).search(method, path);
    }
  }, _node = new WeakMap(), _a9);

  // node_modules/hono/dist/hono.js
  var Hono2 = class extends Hono {
    /**
    * Creates an instance of the Hono class.
    *
    * @param options - Optional configuration options for the Hono instance.
    */
    constructor(options = {}) {
      super(options);
      this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
    }
  };

  // node_modules/hono/dist/middleware/cors/index.js
  var cors = (options) => {
    const opts = {
      origin: "*",
      allowMethods: [
        "GET",
        "HEAD",
        "PUT",
        "POST",
        "DELETE",
        "PATCH",
        "QUERY"
      ],
      allowHeaders: [],
      exposeHeaders: [],
      ...options
    };
    const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
    const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
    const findAllowOrigin = ((optsOrigin) => {
      if (typeof optsOrigin === "string") {
        if (optsOrigin === "*") return () => optsOrigin;
        else return (origin) => optsOrigin === origin ? origin : null;
      } else if (typeof optsOrigin === "function") return optsOrigin;
      else return (origin) => optsOrigin.includes(origin) ? origin : null;
    })(opts.origin);
    const findAllowMethods = ((optsAllowMethods) => {
      if (typeof optsAllowMethods === "function") return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
      else if (Array.isArray(optsAllowMethods)) {
        const methodsStr = optsAllowMethods.join(",");
        return () => methodsStr;
      } else return () => "";
    })(opts.allowMethods);
    return async function cors2(c, next) {
      function set(key, value) {
        c.res.headers.set(key, value);
      }
      const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
      if (allowOrigin) set("Access-Control-Allow-Origin", allowOrigin);
      if (opts.credentials) set("Access-Control-Allow-Credentials", "true");
      if (exposeHeadersStr) set("Access-Control-Expose-Headers", exposeHeadersStr);
      if (c.req.method === "OPTIONS") {
        if (opts.origin !== "*") c.res.headers.append("Vary", "Origin");
        if (opts.maxAge != null) set("Access-Control-Max-Age", opts.maxAge.toString());
        const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
        if (allowMethods) set("Access-Control-Allow-Methods", allowMethods);
        let headersStr = allowHeadersStr;
        if (!headersStr) {
          const requestHeaders = c.req.header("Access-Control-Request-Headers");
          if (requestHeaders) headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
        }
        if (headersStr) {
          set("Access-Control-Allow-Headers", headersStr);
          c.res.headers.append("Vary", "Access-Control-Request-Headers");
        }
        c.res.headers.delete("Content-Length");
        c.res.headers.delete("Content-Type");
        return new Response(null, {
          headers: c.res.headers,
          status: 204,
          statusText: "No Content"
        });
      }
      await next();
      if (opts.origin !== "*") c.header("Vary", "Origin", { append: true });
    };
  };

  // ../../../preview-tools/genspark/stub-cf.js
  var serveStatic = () => async (c, next) => next();

  // src/lib/core.ts
  var enc = new TextEncoder();
  function randomHex(bytes = 16) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function hashPassword(password, salt) {
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: enc.encode(salt), iterations: 1e5, hash: "SHA-256" },
      key,
      256
    );
    return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let out = 0;
    for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return out === 0;
  }
  var SESSION_TTL_HOURS = 12;
  function getToken(c) {
    const auth2 = c.req.header("Authorization");
    if (auth2?.startsWith("Bearer ")) return auth2.slice(7);
    const cookie = c.req.header("Cookie") || "";
    const m = cookie.match(/(?:^|;\s*)ceda_session=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  async function userFromToken(db, token) {
    if (!token) return null;
    const row = await db.prepare(
      `SELECT u.id, u.email, u.name, u.role, u.organisation, u.district, u.expertise, u.phone
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1`
    ).bind(token).first();
    return row || null;
  }
  var requireAuth = async (c, next) => {
    const user = await userFromToken(c.env.DB, getToken(c));
    if (!user) return c.json({ error: "Authentication required" }, 401);
    c.set("user", user);
    await next();
  };
  var requireRole = (...roles) => {
    return async (c, next) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Authentication required" }, 401);
      if (!roles.includes(user.role)) {
        return c.json({ error: `Forbidden: requires role ${roles.join(" or ")}` }, 403);
      }
      await next();
    };
  };
  var isStaff = (u) => ["evaluator", "adjudicator", "admin"].includes(u.role);
  var isAdjudicatorOrAdmin = (u) => ["adjudicator", "admin"].includes(u.role);
  async function audit(db, actorId, action, entityType, entityId, meta, ip) {
    await db.prepare(`INSERT INTO audit_log (actor_id, action, entity_type, entity_id, meta, ip) VALUES (?,?,?,?,?,?)`).bind(actorId, action, entityType || null, entityId ?? null, meta ? JSON.stringify(meta) : null, ip || null).run();
  }
  async function notify(db, userId, type, title, body, link) {
    await db.prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,?,?,?,?)`).bind(userId, type, title, body || null, link || null).run();
  }
  async function notifyRole(db, role, type, title, body, link) {
    const { results } = await db.prepare(`SELECT id FROM users WHERE role = ? AND is_active = 1`).bind(role).all();
    for (const r of results) await notify(db, r.id, type, title, body, link);
  }
  function clientIp(c) {
    return c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || null;
  }
  function sanitize(s, max = 5e3) {
    if (s === void 0 || s === null) return null;
    const str = String(s).trim();
    return str.length ? str.slice(0, max) : null;
  }
  async function nextRefCode(db) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const row = await db.prepare(`SELECT COUNT(*) AS n FROM ideas`).first();
    const n = (row?.n || 0) + 1;
    return `CEDA-${year}-${String(n).padStart(4, "0")}`;
  }
  async function addHistory(db, ideaId, from, to, roundId, actorId, note) {
    await db.prepare(`INSERT INTO idea_stage_history (idea_id, from_stage, to_stage, round_id, actor_id, note) VALUES (?,?,?,?,?,?)`).bind(ideaId, from, to, roundId, actorId, note || null).run();
  }
  async function computeWeightedScore(db, assignmentId) {
    const row = await db.prepare(
      `SELECT SUM(s.score * c.weight) AS num, SUM(c.max_score * c.weight) AS den
       FROM scores s JOIN criteria c ON c.id = s.criterion_id
       WHERE s.assignment_id = ?`
    ).bind(assignmentId).first();
    if (!row || !row.den) return null;
    return Math.round((row.num || 0) / row.den * 1e3) / 10;
  }

  // src/routes/auth.ts
  var auth = new Hono2();
  function sessionCookie(token, maxAgeSeconds) {
    return `ceda_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
  }
  auth.post("/register", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const email = sanitize(body.email, 200)?.toLowerCase();
    const password = String(body.password || "");
    const name = sanitize(body.name, 120);
    const organisation = sanitize(body.organisation, 200);
    const district = sanitize(body.district, 100);
    const phone = sanitize(body.phone, 40);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: "A valid email is required" }, 400);
    if (!name) return c.json({ error: "Full name is required" }, 400);
    if (password.length < 8) return c.json({ error: "Password must be at least 8 characters" }, 400);
    if (!body.consent) return c.json({ error: "You must accept the Data Protection notice" }, 400);
    const exists = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
    if (exists) return c.json({ error: "An account with this email already exists" }, 409);
    const salt = randomHex(16);
    const hash = await hashPassword(password, salt);
    const res = await c.env.DB.prepare(
      `INSERT INTO users (email, password_hash, salt, name, role, organisation, district, phone) VALUES (?,?,?,?,'submitter',?,?,?)`
    ).bind(email, hash, salt, name, organisation, district, phone).run();
    const userId = Number(res.meta.last_row_id);
    await audit(c.env.DB, userId, "auth.register", "user", userId, { email }, clientIp(c));
    const token = randomHex(32);
    const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1e3).toISOString();
    await c.env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, user_agent) VALUES (?,?,?,?)`).bind(token, userId, expires, c.req.header("User-Agent") || null).run();
    const user = await userFromToken(c.env.DB, token);
    c.header("Set-Cookie", sessionCookie(token, SESSION_TTL_HOURS * 3600));
    return c.json({ token, user }, 201);
  });
  auth.post("/login", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const email = sanitize(body.email, 200)?.toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return c.json({ error: "Email and password are required" }, 400);
    const row = await c.env.DB.prepare(`SELECT id, password_hash, salt, is_active FROM users WHERE email = ?`).bind(email).first();
    const candidate = await hashPassword(password, row?.salt || "nosalt");
    if (!row || !row.is_active || !timingSafeEqual(candidate, row.password_hash)) {
      await audit(c.env.DB, row?.id || null, "auth.login_failed", "user", row?.id || null, { email }, clientIp(c));
      return c.json({ error: "Invalid email or password" }, 401);
    }
    const token = randomHex(32);
    const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1e3).toISOString();
    await c.env.DB.batch([
      c.env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, user_agent) VALUES (?,?,?,?)`).bind(
        token,
        row.id,
        expires,
        c.req.header("User-Agent") || null
      ),
      c.env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).bind(row.id),
      c.env.DB.prepare(`DELETE FROM sessions WHERE expires_at < datetime('now')`)
    ]);
    await audit(c.env.DB, row.id, "auth.login", "user", row.id, null, clientIp(c));
    const user = await userFromToken(c.env.DB, token);
    c.header("Set-Cookie", sessionCookie(token, SESSION_TTL_HOURS * 3600));
    return c.json({ token, user });
  });
  auth.post("/logout", async (c) => {
    const token = getToken(c);
    if (token) await c.env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
    c.header("Set-Cookie", sessionCookie("", 0));
    return c.json({ ok: true });
  });
  auth.get("/me", requireAuth, async (c) => {
    const user = c.get("user");
    const unread = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0`).bind(user.id).first();
    return c.json({ user, unread: unread?.n || 0 });
  });
  auth.put("/profile", requireAuth, async (c) => {
    const user = c.get("user");
    const body = await c.req.json().catch(() => ({}));
    const name = sanitize(body.name, 120) || user.name;
    const organisation = sanitize(body.organisation, 200);
    const district = sanitize(body.district, 100);
    const phone = sanitize(body.phone, 40);
    const expertise = sanitize(body.expertise, 300);
    await c.env.DB.prepare(`UPDATE users SET name=?, organisation=?, district=?, phone=?, expertise=? WHERE id=?`).bind(name, organisation, district, phone, expertise, user.id).run();
    await audit(c.env.DB, user.id, "profile.update", "user", user.id);
    return c.json({ ok: true });
  });
  auth.put("/password", requireAuth, async (c) => {
    const user = c.get("user");
    const body = await c.req.json().catch(() => ({}));
    const current = String(body.current || "");
    const next = String(body.next || "");
    if (next.length < 8) return c.json({ error: "New password must be at least 8 characters" }, 400);
    const row = await c.env.DB.prepare(`SELECT password_hash, salt FROM users WHERE id = ?`).bind(user.id).first();
    if (!row || !timingSafeEqual(await hashPassword(current, row.salt), row.password_hash)) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }
    const salt = randomHex(16);
    const hash = await hashPassword(next, salt);
    await c.env.DB.prepare(`UPDATE users SET password_hash=?, salt=? WHERE id=?`).bind(hash, salt, user.id).run();
    await audit(c.env.DB, user.id, "auth.password_change", "user", user.id);
    return c.json({ ok: true });
  });
  var auth_default = auth;

  // src/routes/ideas.ts
  var ideas = new Hono2();
  ideas.use("*", requireAuth);
  var IDEA_FIELDS = [
    "title",
    "summary",
    "problem",
    "solution",
    "target_beneficiaries",
    "impact",
    "business_model",
    "timeline",
    "team_description",
    "district",
    "tags"
  ];
  function pickPayload(body) {
    const p = {};
    for (const f of IDEA_FIELDS) p[f] = sanitize(body[f], f === "title" ? 200 : 6e3);
    p.budget_estimate = body.budget_estimate !== void 0 && body.budget_estimate !== "" ? Number(body.budget_estimate) : null;
    p.category_id = body.category_id ? Number(body.category_id) : null;
    p.is_confidential = body.is_confidential === false || body.is_confidential === 0 ? 0 : 1;
    return p;
  }
  function validateForSubmission(p) {
    const errs = [];
    if (!p.title || String(p.title).length < 5) errs.push("Title must be at least 5 characters");
    if (!p.summary || String(p.summary).length < 30) errs.push("Summary must be at least 30 characters");
    if (!p.problem) errs.push("Problem statement is required");
    if (!p.solution) errs.push("Proposed solution is required");
    if (!p.target_beneficiaries) errs.push("Target beneficiaries are required");
    if (!p.impact) errs.push("Expected impact is required");
    if (!p.business_model) errs.push("Business model is required");
    if (!p.team_description) errs.push("Team description is required");
    if (!p.category_id) errs.push("Please choose a category");
    if (p.budget_estimate !== null && (isNaN(p.budget_estimate) || p.budget_estimate < 0)) errs.push("Budget must be a positive number");
    return errs;
  }
  function maskIdea(idea, viewerRole) {
    if (viewerRole === "evaluator" && idea.blind_review) {
      const { submitter_name, submitter_email, submitter_org, team_description, ...rest } = idea;
      return { ...rest, submitter_name: "Anonymised (blind review)", team_description: "[Hidden during blind review]" };
    }
    return idea;
  }
  async function canAccessIdea(c, ideaId) {
    const user = c.get("user");
    const idea = await c.env.DB.prepare(
      `SELECT i.*, u.name AS submitter_name, u.email AS submitter_email, u.organisation AS submitter_org,
            cat.name AS category_name, r.name AS round_name, r.slug AS round_slug, r.blind_review, r.stage_order
     FROM ideas i
     JOIN users u ON u.id = i.submitter_id
     LEFT JOIN categories cat ON cat.id = i.category_id
     LEFT JOIN rounds r ON r.id = i.current_round_id
     WHERE i.id = ?`
    ).bind(ideaId).first();
    if (!idea) return { idea: null, allowed: false };
    if (user.role === "admin" || user.role === "adjudicator") return { idea, allowed: true };
    if (user.id === idea.submitter_id) return { idea, allowed: true };
    if (user.role === "evaluator") {
      const a = await c.env.DB.prepare(`SELECT id FROM assignments WHERE idea_id = ? AND evaluator_id = ?`).bind(ideaId, user.id).first();
      return { idea, allowed: !!a };
    }
    return { idea, allowed: false };
  }
  ideas.get("/", async (c) => {
    const user = c.get("user");
    const q = c.req.query();
    const where = [];
    const params = [];
    if (user.role === "submitter") {
      where.push("i.submitter_id = ?");
      params.push(user.id);
    } else if (user.role === "evaluator") {
      where.push("i.id IN (SELECT idea_id FROM assignments WHERE evaluator_id = ?)");
      params.push(user.id);
    } else {
      where.push(`i.stage != 'draft'`);
    }
    if (q.stage) {
      where.push("i.stage = ?");
      params.push(q.stage);
    }
    if (q.category_id) {
      where.push("i.category_id = ?");
      params.push(Number(q.category_id));
    }
    if (q.round_id) {
      where.push("i.current_round_id = ?");
      params.push(Number(q.round_id));
    }
    if (q.search) {
      where.push("(i.title LIKE ? OR i.summary LIKE ? OR i.ref_code LIKE ? OR i.tags LIKE ?)");
      const s = `%${q.search}%`;
      params.push(s, s, s, s);
    }
    const sql = `
    SELECT i.id, i.ref_code, i.title, i.summary, i.stage, i.version, i.district, i.tags, i.budget_estimate,
           i.created_at, i.updated_at, i.submitted_at, i.category_id, i.current_round_id,
           cat.name AS category_name, cat.icon AS category_icon,
           r.name AS round_name, r.stage_order, r.blind_review,
           u.name AS submitter_name, u.organisation AS submitter_org,
           (SELECT COUNT(*) FROM assignments a WHERE a.idea_id = i.id AND a.round_id = i.current_round_id) AS assignments_total,
           (SELECT COUNT(*) FROM assignments a WHERE a.idea_id = i.id AND a.round_id = i.current_round_id AND a.status='completed') AS assignments_done,
           (SELECT ROUND(AVG(a.weighted_score),1) FROM assignments a WHERE a.idea_id = i.id AND a.round_id = i.current_round_id AND a.status='completed') AS avg_score,
           (SELECT COUNT(*) FROM feedback f WHERE f.idea_id = i.id AND (f.visibility='submitter' OR ? != 'submitter')) AS feedback_count
    FROM ideas i
    LEFT JOIN categories cat ON cat.id = i.category_id
    LEFT JOIN rounds r ON r.id = i.current_round_id
    JOIN users u ON u.id = i.submitter_id
    WHERE ${where.join(" AND ")}
    ORDER BY i.updated_at DESC
    LIMIT 500`;
    const { results } = await c.env.DB.prepare(sql).bind(user.role, ...params).all();
    return c.json({ ideas: results.map((i) => maskIdea(i, user.role)) });
  });
  ideas.post("/", async (c) => {
    const user = c.get("user");
    if (user.role !== "submitter" && user.role !== "admin") return c.json({ error: "Only submitters can create ideas" }, 403);
    const open = await c.env.DB.prepare(`SELECT value FROM settings WHERE key='submission_open'`).first();
    if (open?.value === "0") return c.json({ error: "Submissions are currently closed" }, 400);
    const body = await c.req.json().catch(() => ({}));
    const p = pickPayload(body);
    const submit = body.submit === true;
    if (!p.title) return c.json({ error: "Title is required" }, 400);
    if (submit) {
      const errs = validateForSubmission(p);
      if (errs.length) return c.json({ error: "Validation failed", details: errs }, 400);
    }
    const ref = await nextRefCode(c.env.DB);
    const firstRound = await c.env.DB.prepare(`SELECT id FROM rounds WHERE status='open' ORDER BY stage_order LIMIT 1`).first();
    const stage = submit ? "submitted" : "draft";
    const res = await c.env.DB.prepare(
      `INSERT INTO ideas (ref_code, title, summary, problem, solution, target_beneficiaries, impact, business_model,
       budget_estimate, timeline, team_description, district, tags, category_id, submitter_id, stage, current_round_id,
       is_confidential, submitted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ${submit ? "datetime('now')" : "NULL"})`
    ).bind(
      ref,
      p.title,
      p.summary || "",
      p.problem,
      p.solution,
      p.target_beneficiaries,
      p.impact,
      p.business_model,
      p.budget_estimate,
      p.timeline,
      p.team_description,
      p.district,
      p.tags,
      p.category_id,
      user.id,
      stage,
      submit ? firstRound?.id || null : null,
      p.is_confidential
    ).run();
    const id = Number(res.meta.last_row_id);
    await c.env.DB.prepare(`INSERT INTO idea_versions (idea_id, version, payload, change_note, created_by) VALUES (?,?,?,?,?)`).bind(id, 1, JSON.stringify(p), submit ? "Initial submission" : "Draft created", user.id).run();
    await addHistory(c.env.DB, id, null, stage, submit ? firstRound?.id || null : null, user.id, submit ? "Submitted via portal" : "Draft created");
    await audit(c.env.DB, user.id, submit ? "idea.submit" : "idea.draft", "idea", id, { ref }, clientIp(c));
    if (submit) {
      await notify(c.env.DB, user.id, "stage", "Submission received", `${ref} "${p.title}" has been received and is awaiting screening.`, `/app#/ideas/${id}`);
      await notifyRole(c.env.DB, "admin", "new_idea", "New idea submitted", `${ref} "${p.title}" awaits evaluator assignment.`, `/app#/ideas/${id}`);
    }
    return c.json({ id, ref_code: ref, stage }, 201);
  });
  ideas.get("/:id", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const { idea, allowed } = await canAccessIdea(c, id);
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (!allowed) return c.json({ error: "Forbidden" }, 403);
    const db = c.env.DB;
    const [history, versions, attachments, feedback, decisions, assignments] = await Promise.all([
      db.prepare(
        `SELECT h.*, u.name AS actor_name, r.name AS round_name FROM idea_stage_history h
         LEFT JOIN users u ON u.id = h.actor_id LEFT JOIN rounds r ON r.id = h.round_id
         WHERE h.idea_id = ? ORDER BY h.created_at ASC, h.id ASC`
      ).bind(id).all(),
      db.prepare(`SELECT id, version, change_note, created_at FROM idea_versions WHERE idea_id = ? ORDER BY version DESC`).bind(id).all(),
      db.prepare(`SELECT * FROM idea_attachments WHERE idea_id = ? ORDER BY created_at`).bind(id).all(),
      db.prepare(
        `SELECT f.*, u.name AS author_name, u.role AS author_role FROM feedback f JOIN users u ON u.id = f.author_id
         WHERE f.idea_id = ? ${user.role === "submitter" ? "AND f.visibility = 'submitter'" : ""} ORDER BY f.created_at ASC`
      ).bind(id).all(),
      isStaff(user) ? db.prepare(
        `SELECT d.*, u.name AS decided_by_name, r.name AS round_name FROM decisions d JOIN users u ON u.id = d.decided_by
             LEFT JOIN rounds r ON r.id = d.round_id WHERE d.idea_id = ? ORDER BY d.created_at DESC`
      ).bind(id).all() : db.prepare(
        `SELECT d.id, d.decision, d.rationale, d.created_at, r.name AS round_name FROM decisions d
             LEFT JOIN rounds r ON r.id = d.round_id WHERE d.idea_id = ? ORDER BY d.created_at DESC`
      ).bind(id).all(),
      isAdjudicatorOrAdmin(user) ? db.prepare(
        `SELECT a.*, u.name AS evaluator_name, r.name AS round_name FROM assignments a JOIN users u ON u.id = a.evaluator_id
             JOIN rounds r ON r.id = a.round_id WHERE a.idea_id = ? ORDER BY a.round_id, a.assigned_at`
      ).bind(id).all() : user.role === "evaluator" ? db.prepare(
        `SELECT a.*, r.name AS round_name FROM assignments a JOIN rounds r ON r.id = a.round_id
               WHERE a.idea_id = ? AND a.evaluator_id = ?`
      ).bind(id, user.id).all() : Promise.resolve({ results: [] })
    ]);
    let scores = [];
    if (isAdjudicatorOrAdmin(user) && assignments.results.length) {
      const ids = assignments.results.map((a) => a.id);
      const { results } = await db.prepare(
        `SELECT s.*, c.name AS criterion_name, c.weight, c.max_score FROM scores s JOIN criteria c ON c.id = s.criterion_id
         WHERE s.assignment_id IN (${ids.map(() => "?").join(",")})`
      ).bind(...ids).all();
      scores = results;
    }
    const agg = await db.prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS done,
              ROUND(AVG(CASE WHEN status='completed' THEN weighted_score END),1) AS avg_score,
              SUM(CASE WHEN recommendation='advance' THEN 1 ELSE 0 END) AS rec_advance,
              SUM(CASE WHEN recommendation='revise' THEN 1 ELSE 0 END) AS rec_revise,
              SUM(CASE WHEN recommendation='reject' THEN 1 ELSE 0 END) AS rec_reject
       FROM assignments WHERE idea_id = ? AND round_id = ?`
    ).bind(id, idea.current_round_id || 0).first();
    const rounds = await db.prepare(`SELECT id, name, slug, stage_order, pass_threshold FROM rounds ORDER BY stage_order`).all();
    const settings = await db.prepare(`SELECT key, value FROM settings`).all();
    return c.json({
      idea: maskIdea(idea, user.role),
      history: history.results,
      versions: versions.results,
      attachments: attachments.results,
      feedback: feedback.results,
      decisions: decisions.results,
      assignments: assignments.results,
      scores,
      aggregate: agg,
      rounds: rounds.results,
      settings: Object.fromEntries(settings.results.map((s) => [s.key, s.value]))
    });
  });
  ideas.put("/:id", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (idea.submitter_id !== user.id && user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
    if (!["draft", "revision_requested"].includes(idea.stage)) return c.json({ error: `Idea cannot be edited while ${idea.stage.replace("_", " ")}` }, 400);
    const body = await c.req.json().catch(() => ({}));
    const p = pickPayload(body);
    const submit = body.submit === true;
    if (submit) {
      const errs = validateForSubmission(p);
      if (errs.length) return c.json({ error: "Validation failed", details: errs }, 400);
    }
    if (submit && idea.stage === "revision_requested") {
      const max = await c.env.DB.prepare(`SELECT value FROM settings WHERE key='max_resubmissions'`).first();
      const limit = Number(max?.value || 2);
      if (idea.version - 1 >= limit) return c.json({ error: `Maximum of ${limit} resubmissions reached` }, 400);
    }
    const newVersion = submit ? idea.version + 1 : idea.version;
    const nextStage = submit ? "submitted" : idea.stage;
    const firstRound = await c.env.DB.prepare(`SELECT id FROM rounds WHERE status='open' ORDER BY stage_order LIMIT 1`).first();
    const roundId = submit ? idea.current_round_id || firstRound?.id || null : idea.current_round_id;
    await c.env.DB.prepare(
      `UPDATE ideas SET title=?, summary=?, problem=?, solution=?, target_beneficiaries=?, impact=?, business_model=?,
       budget_estimate=?, timeline=?, team_description=?, district=?, tags=?, category_id=?, is_confidential=?,
       version=?, stage=?, current_round_id=?, updated_at=datetime('now'),
       submitted_at = CASE WHEN ? = 1 THEN datetime('now') ELSE submitted_at END
     WHERE id=?`
    ).bind(
      p.title,
      p.summary || "",
      p.problem,
      p.solution,
      p.target_beneficiaries,
      p.impact,
      p.business_model,
      p.budget_estimate,
      p.timeline,
      p.team_description,
      p.district,
      p.tags,
      p.category_id,
      p.is_confidential,
      newVersion,
      nextStage,
      roundId,
      submit ? 1 : 0,
      id
    ).run();
    if (submit) {
      const note = sanitize(body.change_note, 1e3) || (idea.stage === "draft" ? "Initial submission" : "Resubmitted after revision request");
      await c.env.DB.prepare(`INSERT INTO idea_versions (idea_id, version, payload, change_note, created_by) VALUES (?,?,?,?,?)`).bind(id, newVersion, JSON.stringify(p), note, user.id).run();
      await addHistory(c.env.DB, id, idea.stage, "submitted", roundId, user.id, note);
      await audit(c.env.DB, user.id, idea.stage === "draft" ? "idea.submit" : "idea.resubmit", "idea", id, { version: newVersion }, clientIp(c));
      await notify(c.env.DB, user.id, "stage", idea.stage === "draft" ? "Submission received" : "Resubmission received", `${idea.ref_code} v${newVersion} is now awaiting review.`, `/app#/ideas/${id}`);
      await notifyRole(c.env.DB, "admin", "new_idea", idea.stage === "draft" ? "New idea submitted" : "Idea resubmitted", `${idea.ref_code} v${newVersion} "${p.title}"`, `/app#/ideas/${id}`);
      await notifyRole(c.env.DB, "adjudicator", "new_idea", idea.stage === "draft" ? "New idea submitted" : "Idea resubmitted", `${idea.ref_code} v${newVersion} "${p.title}"`, `/app#/ideas/${id}`);
    } else {
      await audit(c.env.DB, user.id, "idea.update", "idea", id, null, clientIp(c));
    }
    return c.json({ ok: true, stage: nextStage, version: newVersion });
  });
  ideas.post("/:id/withdraw", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (idea.submitter_id !== user.id && user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
    if (["awarded", "rejected", "withdrawn"].includes(idea.stage)) return c.json({ error: "Idea is already closed" }, 400);
    await c.env.DB.prepare(`UPDATE ideas SET stage='withdrawn', updated_at=datetime('now'), decided_at=datetime('now') WHERE id=?`).bind(id).run();
    await addHistory(c.env.DB, id, idea.stage, "withdrawn", idea.current_round_id, user.id, "Withdrawn by submitter");
    await audit(c.env.DB, user.id, "idea.withdraw", "idea", id);
    return c.json({ ok: true });
  });
  ideas.delete("/:id", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (idea.submitter_id !== user.id && user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
    if (idea.stage !== "draft") return c.json({ error: "Only drafts can be deleted" }, 400);
    await c.env.DB.prepare(`DELETE FROM ideas WHERE id=?`).bind(id).run();
    await audit(c.env.DB, user.id, "idea.delete", "idea", id);
    return c.json({ ok: true });
  });
  ideas.get("/:id/versions/:v", async (c) => {
    const id = Number(c.req.param("id"));
    const v = Number(c.req.param("v"));
    const { idea, allowed } = await canAccessIdea(c, id);
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (!allowed) return c.json({ error: "Forbidden" }, 403);
    const row = await c.env.DB.prepare(`SELECT * FROM idea_versions WHERE idea_id=? AND version=?`).bind(id, v).first();
    if (!row) return c.json({ error: "Version not found" }, 404);
    return c.json({ version: { ...row, payload: JSON.parse(row.payload) } });
  });
  ideas.post("/:id/attachments", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (idea.submitter_id !== user.id && user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
    const body = await c.req.json().catch(() => ({}));
    const filename = sanitize(body.filename, 200);
    const url = sanitize(body.url, 1e3);
    if (!filename || !url || !/^https?:\/\//.test(url)) return c.json({ error: "A name and a valid https URL are required" }, 400);
    const res = await c.env.DB.prepare(`INSERT INTO idea_attachments (idea_id, filename, url, kind) VALUES (?,?,?,?)`).bind(id, filename, url, sanitize(body.kind, 40) || "link").run();
    await audit(c.env.DB, user.id, "attachment.add", "idea", id, { filename });
    return c.json({ id: res.meta.last_row_id }, 201);
  });
  ideas.delete("/:id/attachments/:aid", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (idea.submitter_id !== user.id && user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
    await c.env.DB.prepare(`DELETE FROM idea_attachments WHERE id=? AND idea_id=?`).bind(Number(c.req.param("aid")), id).run();
    return c.json({ ok: true });
  });
  ideas.post("/:id/feedback", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const { idea, allowed } = await canAccessIdea(c, id);
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (!allowed) return c.json({ error: "Forbidden" }, 403);
    const body = await c.req.json().catch(() => ({}));
    const text = sanitize(body.body, 4e3);
    if (!text) return c.json({ error: "Feedback body is required" }, 400);
    let visibility = body.visibility === "internal" ? "internal" : "submitter";
    if (user.role === "submitter") visibility = "submitter";
    const parentId = body.parent_id ? Number(body.parent_id) : null;
    const res = await c.env.DB.prepare(`INSERT INTO feedback (idea_id, author_id, body, visibility, parent_id) VALUES (?,?,?,?,?)`).bind(id, user.id, text, visibility, parentId).run();
    await audit(c.env.DB, user.id, "feedback.add", "idea", id, { visibility });
    if (visibility === "submitter" && user.id !== idea.submitter_id) {
      await notify(c.env.DB, idea.submitter_id, "feedback", "New feedback on your idea", `${idea.ref_code}: ${text.slice(0, 120)}`, `/app#/ideas/${id}`);
    } else if (user.id === idea.submitter_id) {
      const { results } = await c.env.DB.prepare(
        `SELECT DISTINCT author_id AS id FROM feedback WHERE idea_id = ? AND author_id != ?
       UNION SELECT DISTINCT evaluator_id FROM assignments WHERE idea_id = ?
       UNION SELECT DISTINCT decided_by FROM decisions WHERE idea_id = ?`
      ).bind(id, user.id, id, id).all();
      for (const r of results) await notify(c.env.DB, r.id, "feedback", "Submitter replied", `${idea.ref_code}: ${text.slice(0, 120)}`, `/app#/ideas/${id}`);
    }
    return c.json({ id: res.meta.last_row_id }, 201);
  });
  var ideas_default = ideas;

  // src/routes/evaluation.ts
  var ev = new Hono2();
  ev.use("*", requireAuth);
  ev.get("/rounds", async (c) => {
    const { results: rounds } = await c.env.DB.prepare(`SELECT * FROM rounds ORDER BY stage_order`).all();
    const { results: criteria } = await c.env.DB.prepare(`SELECT * FROM criteria ORDER BY round_id, sort_order`).all();
    return c.json({
      rounds: rounds.map((r) => ({ ...r, criteria: criteria.filter((cr) => cr.round_id === r.id) }))
    });
  });
  ev.post("/rounds", requireRole("admin"), async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const name = sanitize(b.name, 120);
    if (!name) return c.json({ error: "Round name is required" }, 400);
    const slug = (sanitize(b.slug, 60) || name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const maxOrder = await c.env.DB.prepare(`SELECT COALESCE(MAX(stage_order),0) AS m FROM rounds`).first();
    const res = await c.env.DB.prepare(
      `INSERT INTO rounds (name, slug, stage_order, description, min_evaluators, pass_threshold, blind_review, status) VALUES (?,?,?,?,?,?,?,?)`
    ).bind(
      name,
      slug,
      Number(b.stage_order) || (maxOrder?.m || 0) + 1,
      sanitize(b.description, 1e3),
      Number(b.min_evaluators) || 2,
      Number(b.pass_threshold) || 60,
      b.blind_review === false ? 0 : 1,
      b.status === "closed" ? "closed" : "open"
    ).run();
    await audit(c.env.DB, c.get("user").id, "round.create", "round", Number(res.meta.last_row_id));
    return c.json({ id: res.meta.last_row_id }, 201);
  });
  ev.put("/rounds/:id", requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => ({}));
    const r = await c.env.DB.prepare(`SELECT * FROM rounds WHERE id=?`).bind(id).first();
    if (!r) return c.json({ error: "Round not found" }, 404);
    await c.env.DB.prepare(
      `UPDATE rounds SET name=?, description=?, min_evaluators=?, pass_threshold=?, blind_review=?, status=?, stage_order=? WHERE id=?`
    ).bind(
      sanitize(b.name, 120) || r.name,
      b.description !== void 0 ? sanitize(b.description, 1e3) : r.description,
      Number(b.min_evaluators) || r.min_evaluators,
      b.pass_threshold !== void 0 ? Number(b.pass_threshold) : r.pass_threshold,
      b.blind_review !== void 0 ? b.blind_review ? 1 : 0 : r.blind_review,
      b.status === "closed" || b.status === "open" ? b.status : r.status,
      Number(b.stage_order) || r.stage_order,
      id
    ).run();
    await audit(c.env.DB, c.get("user").id, "round.update", "round", id);
    return c.json({ ok: true });
  });
  ev.post("/rounds/:id/criteria", requireRole("admin"), async (c) => {
    const roundId = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => ({}));
    const name = sanitize(b.name, 120);
    if (!name) return c.json({ error: "Criterion name is required" }, 400);
    const maxOrder = await c.env.DB.prepare(`SELECT COALESCE(MAX(sort_order),0) AS m FROM criteria WHERE round_id=?`).bind(roundId).first();
    const res = await c.env.DB.prepare(`INSERT INTO criteria (round_id, name, description, weight, max_score, sort_order) VALUES (?,?,?,?,?,?)`).bind(roundId, name, sanitize(b.description, 500), Number(b.weight) || 1, Number(b.max_score) || 10, (maxOrder?.m || 0) + 1).run();
    await audit(c.env.DB, c.get("user").id, "criterion.create", "criterion", Number(res.meta.last_row_id), { roundId });
    return c.json({ id: res.meta.last_row_id }, 201);
  });
  ev.put("/criteria/:id", requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => ({}));
    const cr = await c.env.DB.prepare(`SELECT * FROM criteria WHERE id=?`).bind(id).first();
    if (!cr) return c.json({ error: "Criterion not found" }, 404);
    await c.env.DB.prepare(`UPDATE criteria SET name=?, description=?, weight=?, max_score=?, sort_order=? WHERE id=?`).bind(
      sanitize(b.name, 120) || cr.name,
      b.description !== void 0 ? sanitize(b.description, 500) : cr.description,
      Number(b.weight) || cr.weight,
      Number(b.max_score) || cr.max_score,
      Number(b.sort_order) || cr.sort_order,
      id
    ).run();
    return c.json({ ok: true });
  });
  ev.delete("/criteria/:id", requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    const used = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM scores WHERE criterion_id=?`).bind(id).first();
    if (used?.n) return c.json({ error: "Criterion has scores and cannot be deleted" }, 400);
    await c.env.DB.prepare(`DELETE FROM criteria WHERE id=?`).bind(id).run();
    return c.json({ ok: true });
  });
  ev.get("/assignments", async (c) => {
    const user = c.get("user");
    const q = c.req.query();
    const where = [];
    const params = [];
    if (user.role === "evaluator") {
      where.push("a.evaluator_id = ?");
      params.push(user.id);
    } else if (user.role === "submitter") {
      return c.json({ error: "Forbidden" }, 403);
    }
    if (q.status) {
      where.push("a.status = ?");
      params.push(q.status);
    }
    if (q.round_id) {
      where.push("a.round_id = ?");
      params.push(Number(q.round_id));
    }
    const sql = `
    SELECT a.*, i.ref_code, i.title, i.summary, i.stage, i.category_id, cat.name AS category_name, cat.icon AS category_icon,
           r.name AS round_name, r.blind_review, u.name AS evaluator_name,
           CASE WHEN r.blind_review = 1 AND ? = 'evaluator' THEN 'Anonymised' ELSE s.name END AS submitter_name
    FROM assignments a
    JOIN ideas i ON i.id = a.idea_id
    JOIN rounds r ON r.id = a.round_id
    JOIN users u ON u.id = a.evaluator_id
    JOIN users s ON s.id = i.submitter_id
    LEFT JOIN categories cat ON cat.id = i.category_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY CASE a.status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, a.assigned_at DESC`;
    const { results } = await c.env.DB.prepare(sql).bind(user.role, ...params).all();
    return c.json({ assignments: results });
  });
  ev.post("/assignments", requireRole("admin", "adjudicator"), async (c) => {
    const user = c.get("user");
    const b = await c.req.json().catch(() => ({}));
    const ideaId = Number(b.idea_id);
    const roundId = Number(b.round_id);
    const evaluatorIds = Array.isArray(b.evaluator_ids) ? b.evaluator_ids.map(Number) : [Number(b.evaluator_id)];
    const dueAt = sanitize(b.due_at, 40);
    if (!ideaId || !roundId || !evaluatorIds.filter(Boolean).length) return c.json({ error: "idea_id, round_id and evaluator_ids are required" }, 400);
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id=?`).bind(ideaId).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (["draft", "withdrawn", "rejected", "awarded"].includes(idea.stage)) return c.json({ error: `Cannot assign an idea in stage ${idea.stage}` }, 400);
    const round = await c.env.DB.prepare(`SELECT * FROM rounds WHERE id=?`).bind(roundId).first();
    if (!round) return c.json({ error: "Round not found" }, 404);
    const created = [];
    for (const evId of evaluatorIds) {
      const evaluator = await c.env.DB.prepare(`SELECT id, name, role FROM users WHERE id=? AND is_active=1`).bind(evId).first();
      if (!evaluator || !["evaluator", "adjudicator", "admin"].includes(evaluator.role)) continue;
      if (evaluator.id === idea.submitter_id) continue;
      const res = await c.env.DB.prepare(
        `INSERT OR IGNORE INTO assignments (idea_id, round_id, evaluator_id, assigned_by, due_at) VALUES (?,?,?,?,?)`
      ).bind(ideaId, roundId, evId, user.id, dueAt).run();
      if (res.meta.changes) {
        created.push(Number(res.meta.last_row_id));
        await notify(c.env.DB, evId, "assignment", "New evaluation assigned", `You have been assigned ${idea.ref_code} for ${round.name}.`, `/app#/evaluate/${res.meta.last_row_id}`);
        await audit(c.env.DB, user.id, "assignment.create", "assignment", Number(res.meta.last_row_id), { ideaId, evId, roundId }, clientIp(c));
      }
    }
    if (created.length && (idea.stage === "submitted" || idea.current_round_id !== roundId)) {
      await c.env.DB.prepare(`UPDATE ideas SET stage='under_review', current_round_id=?, updated_at=datetime('now') WHERE id=?`).bind(roundId, ideaId).run();
      await addHistory(c.env.DB, ideaId, idea.stage, "under_review", roundId, user.id, `Assigned to ${created.length} evaluator(s) for ${round.name}`);
      await notify(c.env.DB, idea.submitter_id, "stage", "Your idea is under review", `${idea.ref_code} is now being evaluated in ${round.name}.`, `/app#/ideas/${ideaId}`);
    }
    return c.json({ created: created.length, ids: created }, 201);
  });
  ev.delete("/assignments/:id", requireRole("admin", "adjudicator"), async (c) => {
    const id = Number(c.req.param("id"));
    const a = await c.env.DB.prepare(`SELECT * FROM assignments WHERE id=?`).bind(id).first();
    if (!a) return c.json({ error: "Assignment not found" }, 404);
    if (a.status === "completed") return c.json({ error: "Completed assignments cannot be removed" }, 400);
    await c.env.DB.prepare(`DELETE FROM assignments WHERE id=?`).bind(id).run();
    await audit(c.env.DB, c.get("user").id, "assignment.delete", "assignment", id);
    return c.json({ ok: true });
  });
  ev.get("/assignments/:id", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const a = await c.env.DB.prepare(
      `SELECT a.*, r.name AS round_name, r.blind_review, r.pass_threshold, u.name AS evaluator_name
     FROM assignments a JOIN rounds r ON r.id = a.round_id JOIN users u ON u.id = a.evaluator_id WHERE a.id=?`
    ).bind(id).first();
    if (!a) return c.json({ error: "Assignment not found" }, 404);
    if (user.role === "evaluator" && a.evaluator_id !== user.id) return c.json({ error: "Forbidden" }, 403);
    if (user.role === "submitter") return c.json({ error: "Forbidden" }, 403);
    const idea = await c.env.DB.prepare(
      `SELECT i.*, cat.name AS category_name, u.name AS submitter_name, u.organisation AS submitter_org
     FROM ideas i LEFT JOIN categories cat ON cat.id=i.category_id JOIN users u ON u.id=i.submitter_id WHERE i.id=?`
    ).bind(a.idea_id).first();
    if (a.blind_review && user.role === "evaluator") {
      idea.submitter_name = "Anonymised (blind review)";
      idea.submitter_org = null;
      idea.team_description = "[Hidden during blind review]";
    }
    const { results: criteria } = await c.env.DB.prepare(`SELECT * FROM criteria WHERE round_id=? ORDER BY sort_order`).bind(a.round_id).all();
    const { results: scores } = await c.env.DB.prepare(`SELECT * FROM scores WHERE assignment_id=?`).bind(id).all();
    const { results: attachments } = await c.env.DB.prepare(`SELECT * FROM idea_attachments WHERE idea_id=?`).bind(a.idea_id).all();
    const { results: feedback } = await c.env.DB.prepare(
      `SELECT f.*, u.name AS author_name, u.role AS author_role FROM feedback f JOIN users u ON u.id=f.author_id WHERE f.idea_id=? ORDER BY f.created_at`
    ).bind(a.idea_id).all();
    if (a.status === "pending" && a.evaluator_id === user.id) {
      await c.env.DB.prepare(`UPDATE assignments SET status='in_progress' WHERE id=?`).bind(id).run();
      a.status = "in_progress";
    }
    return c.json({ assignment: a, idea, criteria, scores, attachments, feedback });
  });
  ev.put("/assignments/:id", async (c) => {
    const user = c.get("user");
    const id = Number(c.req.param("id"));
    const a = await c.env.DB.prepare(`SELECT a.*, r.name AS round_name, r.min_evaluators, r.pass_threshold FROM assignments a JOIN rounds r ON r.id=a.round_id WHERE a.id=?`).bind(id).first();
    if (!a) return c.json({ error: "Assignment not found" }, 404);
    if (a.evaluator_id !== user.id && user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
    if (a.status === "completed") return c.json({ error: "This evaluation has already been submitted" }, 400);
    const b = await c.req.json().catch(() => ({}));
    const submit = b.submit === true;
    const scores = Array.isArray(b.scores) ? b.scores : [];
    const { results: criteria } = await c.env.DB.prepare(`SELECT * FROM criteria WHERE round_id=?`).bind(a.round_id).all();
    const stmts = [];
    for (const s of scores) {
      const cr = criteria.find((x) => x.id === Number(s.criterion_id));
      if (!cr) continue;
      const val = Number(s.score);
      if (isNaN(val) || val < 0 || val > cr.max_score) return c.json({ error: `Score for "${cr.name}" must be between 0 and ${cr.max_score}` }, 400);
      stmts.push(
        c.env.DB.prepare(
          `INSERT INTO scores (assignment_id, criterion_id, score, comment) VALUES (?,?,?,?)
         ON CONFLICT(assignment_id, criterion_id) DO UPDATE SET score=excluded.score, comment=excluded.comment`
        ).bind(id, cr.id, val, sanitize(s.comment, 1e3))
      );
    }
    if (submit) {
      const scoredIds = new Set(scores.map((s) => Number(s.criterion_id)));
      const missing = criteria.filter((cr) => !scoredIds.has(cr.id));
      if (missing.length) return c.json({ error: `All criteria must be scored. Missing: ${missing.map((m) => m.name).join(", ")}` }, 400);
      if (!["advance", "revise", "reject"].includes(b.recommendation)) return c.json({ error: "A recommendation (advance / revise / reject) is required" }, 400);
      if (!sanitize(b.overall_comment, 4e3)) return c.json({ error: "An overall comment is required to help the submitter improve" }, 400);
    }
    if (stmts.length) await c.env.DB.batch(stmts);
    const weighted = await computeWeightedScore(c.env.DB, id);
    await c.env.DB.prepare(
      `UPDATE assignments SET status=?, recommendation=?, overall_comment=?, conflict_note=?, weighted_score=?,
       completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END WHERE id=?`
    ).bind(
      submit ? "completed" : "in_progress",
      submit ? b.recommendation : sanitize(b.recommendation, 20),
      sanitize(b.overall_comment, 4e3),
      sanitize(b.conflict_note, 1e3),
      weighted,
      submit ? 1 : 0,
      id
    ).run();
    await audit(c.env.DB, user.id, submit ? "evaluation.submit" : "evaluation.save", "assignment", id, { weighted }, clientIp(c));
    if (submit) {
      const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id=?`).bind(a.idea_id).first();
      if (b.share_comment !== false) {
        await c.env.DB.prepare(`INSERT INTO feedback (idea_id, author_id, body, visibility) VALUES (?,?,?,?)`).bind(a.idea_id, user.id, `[${a.round_name} evaluator feedback] ${sanitize(b.overall_comment, 4e3)}`, "submitter").run();
        await notify(c.env.DB, idea.submitter_id, "feedback", "New evaluator feedback", `${idea.ref_code}: an evaluator has shared feedback on your idea.`, `/app#/ideas/${a.idea_id}`);
      }
      const agg = await c.env.DB.prepare(
        `SELECT COUNT(*) AS done, ROUND(AVG(weighted_score),1) AS avg FROM assignments WHERE idea_id=? AND round_id=? AND status='completed'`
      ).bind(a.idea_id, a.round_id).first();
      if (agg.done >= a.min_evaluators) {
        const { results: adj } = await c.env.DB.prepare(`SELECT id FROM users WHERE role IN ('adjudicator','admin') AND is_active=1`).all();
        for (const u of adj) {
          await notify(c.env.DB, u.id, "quorum", "Ready for adjudication", `${idea.ref_code} has ${agg.done} completed evaluations (avg ${agg.avg}%) in ${a.round_name}.`, `/app#/ideas/${a.idea_id}`);
        }
      }
    }
    return c.json({ ok: true, weighted_score: weighted, status: submit ? "completed" : "in_progress" });
  });
  ev.get("/queue", requireRole("admin", "adjudicator"), async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT i.id, i.ref_code, i.title, i.stage, i.version, i.current_round_id, i.submitted_at, i.updated_at,
            cat.name AS category_name, r.name AS round_name, r.min_evaluators, r.pass_threshold, r.stage_order,
            u.name AS submitter_name,
            (SELECT COUNT(*) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS assigned,
            (SELECT COUNT(*) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id AND a.status='completed') AS completed,
            (SELECT ROUND(AVG(weighted_score),1) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id AND a.status='completed') AS avg_score,
            (SELECT SUM(CASE WHEN recommendation='advance' THEN 1 ELSE 0 END) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS rec_advance,
            (SELECT SUM(CASE WHEN recommendation='revise' THEN 1 ELSE 0 END) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS rec_revise,
            (SELECT SUM(CASE WHEN recommendation='reject' THEN 1 ELSE 0 END) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS rec_reject
     FROM ideas i
     LEFT JOIN categories cat ON cat.id=i.category_id
     LEFT JOIN rounds r ON r.id=i.current_round_id
     JOIN users u ON u.id=i.submitter_id
     WHERE i.stage IN ('submitted','under_review','approved')
     ORDER BY CASE WHEN i.stage='under_review' THEN 0 WHEN i.stage='submitted' THEN 1 ELSE 2 END, i.updated_at DESC`
    ).all();
    return c.json({ queue: results });
  });
  ev.post("/decisions", requireRole("admin", "adjudicator"), async (c) => {
    const user = c.get("user");
    const b = await c.req.json().catch(() => ({}));
    const ideaId = Number(b.idea_id);
    const decision = String(b.decision);
    const rationale = sanitize(b.rationale, 4e3);
    if (!ideaId || !["advance", "revise", "reject", "approve", "award"].includes(decision)) return c.json({ error: "idea_id and a valid decision are required" }, 400);
    if (!rationale) return c.json({ error: "A rationale is required for transparency" }, 400);
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id=?`).bind(ideaId).first();
    if (!idea) return c.json({ error: "Idea not found" }, 404);
    if (["draft", "withdrawn", "rejected", "awarded"].includes(idea.stage)) return c.json({ error: `Idea in stage ${idea.stage} cannot receive a decision` }, 400);
    const agg = await c.env.DB.prepare(`SELECT ROUND(AVG(weighted_score),1) AS avg FROM assignments WHERE idea_id=? AND round_id=? AND status='completed'`).bind(ideaId, idea.current_round_id || 0).first();
    const { results: rounds } = await c.env.DB.prepare(`SELECT * FROM rounds ORDER BY stage_order`).all();
    const currentRound = rounds.find((r) => r.id === idea.current_round_id) || rounds[0];
    const nextRound = rounds.find((r) => r.stage_order > (currentRound?.stage_order || 0));
    let newStage = idea.stage;
    let newRoundId = idea.current_round_id;
    let title = "";
    let body = "";
    switch (decision) {
      case "advance":
        if (nextRound) {
          newStage = "submitted";
          newRoundId = nextRound.id;
          title = `Advanced to ${nextRound.name}`;
          body = `${idea.ref_code} has progressed to ${nextRound.name}.`;
        } else {
          newStage = "approved";
          title = "Idea approved";
          body = `${idea.ref_code} has completed all evaluation rounds and is approved.`;
        }
        break;
      case "revise":
        newStage = "revision_requested";
        title = "Revision requested";
        body = `${idea.ref_code}: please review the feedback and resubmit.`;
        break;
      case "reject":
        newStage = "rejected";
        title = "Decision: not selected";
        body = `${idea.ref_code} was not selected to proceed. See the rationale for constructive feedback.`;
        break;
      case "approve":
        newStage = "approved";
        newRoundId = rounds[rounds.length - 1]?.id || idea.current_round_id;
        title = "Idea approved";
        body = `${idea.ref_code} has been approved by the adjudication panel.`;
        break;
      case "award":
        newStage = "awarded";
        title = "Congratulations - Awarded!";
        body = `${idea.ref_code} has been selected for award. CEDA will contact you with next steps.`;
        break;
    }
    const res = await c.env.DB.prepare(`INSERT INTO decisions (idea_id, round_id, decided_by, decision, rationale, aggregate_score) VALUES (?,?,?,?,?,?)`).bind(ideaId, idea.current_round_id, user.id, decision, rationale, agg?.avg ?? null).run();
    await c.env.DB.prepare(
      `UPDATE ideas SET stage=?, current_round_id=?, updated_at=datetime('now'),
       decided_at = CASE WHEN ? IN ('rejected','awarded','approved') THEN datetime('now') ELSE decided_at END WHERE id=?`
    ).bind(newStage, newRoundId, newStage, ideaId).run();
    await addHistory(c.env.DB, ideaId, idea.stage, newStage, newRoundId, user.id, `${decision}: ${rationale.slice(0, 200)}`);
    await c.env.DB.prepare(`INSERT INTO feedback (idea_id, author_id, body, visibility) VALUES (?,?,?,?)`).bind(ideaId, user.id, `[Panel decision: ${decision.toUpperCase()}] ${rationale}`, "submitter").run();
    await notify(c.env.DB, idea.submitter_id, "decision", title, body, `/app#/ideas/${ideaId}`);
    await audit(c.env.DB, user.id, "decision.create", "decision", Number(res.meta.last_row_id), { ideaId, decision, newStage }, clientIp(c));
    return c.json({ id: res.meta.last_row_id, stage: newStage, round_id: newRoundId }, 201);
  });
  var evaluation_default = ev;

  // src/routes/admin.ts
  var admin = new Hono2();
  admin.use("*", requireAuth);
  admin.get("/categories", async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT cat.*, (SELECT COUNT(*) FROM ideas i WHERE i.category_id = cat.id AND i.stage != 'draft') AS idea_count FROM categories cat ORDER BY name`
    ).all();
    return c.json({ categories: results });
  });
  admin.get("/settings", async (c) => {
    const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all();
    return c.json({ settings: Object.fromEntries(results.map((r) => [r.key, r.value])) });
  });
  admin.get("/evaluators", requireRole("admin", "adjudicator"), async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT u.id, u.name, u.email, u.role, u.expertise, u.organisation,
            (SELECT COUNT(*) FROM assignments a WHERE a.evaluator_id = u.id AND a.status IN ('pending','in_progress')) AS open_assignments,
            (SELECT COUNT(*) FROM assignments a WHERE a.evaluator_id = u.id AND a.status='completed') AS completed_assignments
     FROM users u WHERE u.role IN ('evaluator','adjudicator') AND u.is_active = 1 ORDER BY u.name`
    ).all();
    return c.json({ evaluators: results });
  });
  admin.post("/categories", requireRole("admin"), async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const name = sanitize(b.name, 120);
    if (!name) return c.json({ error: "Name is required" }, 400);
    const res = await c.env.DB.prepare(`INSERT INTO categories (name, description, strategic_priority, icon) VALUES (?,?,?,?)`).bind(name, sanitize(b.description, 500), sanitize(b.strategic_priority, 200), sanitize(b.icon, 60) || "fa-lightbulb").run();
    await audit(c.env.DB, c.get("user").id, "category.create", "category", Number(res.meta.last_row_id));
    return c.json({ id: res.meta.last_row_id }, 201);
  });
  admin.put("/categories/:id", requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => ({}));
    const cat = await c.env.DB.prepare(`SELECT * FROM categories WHERE id=?`).bind(id).first();
    if (!cat) return c.json({ error: "Not found" }, 404);
    await c.env.DB.prepare(`UPDATE categories SET name=?, description=?, strategic_priority=?, icon=?, is_active=? WHERE id=?`).bind(
      sanitize(b.name, 120) || cat.name,
      b.description !== void 0 ? sanitize(b.description, 500) : cat.description,
      b.strategic_priority !== void 0 ? sanitize(b.strategic_priority, 200) : cat.strategic_priority,
      sanitize(b.icon, 60) || cat.icon,
      b.is_active !== void 0 ? b.is_active ? 1 : 0 : cat.is_active,
      id
    ).run();
    return c.json({ ok: true });
  });
  admin.put("/settings", requireRole("admin"), async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const allowed = ["programme_name", "submission_open", "submission_deadline", "contact_email", "max_resubmissions"];
    const stmts = [];
    for (const k of allowed) {
      if (b[k] !== void 0) {
        stmts.push(c.env.DB.prepare(`INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(k, String(b[k])));
      }
    }
    if (stmts.length) await c.env.DB.batch(stmts);
    await audit(c.env.DB, c.get("user").id, "settings.update", "settings", null, b);
    return c.json({ ok: true });
  });
  admin.get("/users", requireRole("admin"), async (c) => {
    const q = c.req.query();
    const where = [];
    const params = [];
    if (q.role) {
      where.push("role = ?");
      params.push(q.role);
    }
    if (q.search) {
      where.push("(name LIKE ? OR email LIKE ? OR organisation LIKE ?)");
      params.push(`%${q.search}%`, `%${q.search}%`, `%${q.search}%`);
    }
    const { results } = await c.env.DB.prepare(
      `SELECT id, email, name, role, organisation, district, expertise, is_active, created_at, last_login_at,
            (SELECT COUNT(*) FROM ideas i WHERE i.submitter_id = users.id) AS idea_count,
            (SELECT COUNT(*) FROM assignments a WHERE a.evaluator_id = users.id) AS assignment_count
     FROM users ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 500`
    ).bind(...params).all();
    return c.json({ users: results });
  });
  admin.post("/users", requireRole("admin"), async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const email = sanitize(b.email, 200)?.toLowerCase();
    const name = sanitize(b.name, 120);
    const role = ["submitter", "evaluator", "adjudicator", "admin"].includes(b.role) ? b.role : "evaluator";
    const password = String(b.password || "");
    if (!email || !name) return c.json({ error: "Email and name are required" }, 400);
    if (password.length < 8) return c.json({ error: "Temporary password must be at least 8 characters" }, 400);
    const exists = await c.env.DB.prepare(`SELECT id FROM users WHERE email=?`).bind(email).first();
    if (exists) return c.json({ error: "Email already in use" }, 409);
    const salt = randomHex(16);
    const hash = await hashPassword(password, salt);
    const res = await c.env.DB.prepare(
      `INSERT INTO users (email, password_hash, salt, name, role, organisation, district, expertise) VALUES (?,?,?,?,?,?,?,?)`
    ).bind(email, hash, salt, name, role, sanitize(b.organisation, 200), sanitize(b.district, 100), sanitize(b.expertise, 300)).run();
    const id = Number(res.meta.last_row_id);
    await audit(c.env.DB, c.get("user").id, "user.create", "user", id, { role }, clientIp(c));
    await notify(c.env.DB, id, "welcome", "Welcome to the CEDA Innovation Portal", `Your ${role} account has been created. Please change your password in Profile.`, "/app#/profile");
    return c.json({ id }, 201);
  });
  admin.put("/users/:id", requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    const me = c.get("user");
    const b = await c.req.json().catch(() => ({}));
    const u = await c.env.DB.prepare(`SELECT * FROM users WHERE id=?`).bind(id).first();
    if (!u) return c.json({ error: "User not found" }, 404);
    const role = ["submitter", "evaluator", "adjudicator", "admin"].includes(b.role) ? b.role : u.role;
    const isActive = b.is_active !== void 0 ? b.is_active ? 1 : 0 : u.is_active;
    if (id === me.id && (role !== "admin" || !isActive)) return c.json({ error: "You cannot demote or deactivate your own account" }, 400);
    await c.env.DB.prepare(`UPDATE users SET name=?, role=?, organisation=?, district=?, expertise=?, is_active=? WHERE id=?`).bind(
      sanitize(b.name, 120) || u.name,
      role,
      b.organisation !== void 0 ? sanitize(b.organisation, 200) : u.organisation,
      b.district !== void 0 ? sanitize(b.district, 100) : u.district,
      b.expertise !== void 0 ? sanitize(b.expertise, 300) : u.expertise,
      isActive,
      id
    ).run();
    if (b.password && String(b.password).length >= 8) {
      const salt = randomHex(16);
      const hash = await hashPassword(String(b.password), salt);
      await c.env.DB.prepare(`UPDATE users SET password_hash=?, salt=? WHERE id=?`).bind(hash, salt, id).run();
      await c.env.DB.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id).run();
    }
    if (!isActive) await c.env.DB.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id).run();
    await audit(c.env.DB, me.id, "user.update", "user", id, { role, isActive }, clientIp(c));
    return c.json({ ok: true });
  });
  admin.get("/analytics", requireRole("admin", "adjudicator", "evaluator"), async (c) => {
    const db = c.env.DB;
    const [byStage, byCategory, byRound, byDistrict, timeline, evaluators, kpis, recent, scoreDist] = await Promise.all([
      db.prepare(`SELECT stage, COUNT(*) AS n FROM ideas GROUP BY stage`).all(),
      db.prepare(
        `SELECT cat.name, cat.icon, COUNT(i.id) AS n, ROUND(AVG(a.weighted_score),1) AS avg_score
         FROM categories cat LEFT JOIN ideas i ON i.category_id = cat.id AND i.stage != 'draft'
         LEFT JOIN assignments a ON a.idea_id = i.id AND a.status='completed'
         GROUP BY cat.id ORDER BY n DESC`
      ).all(),
      db.prepare(
        `SELECT r.name, r.stage_order, COUNT(i.id) AS n FROM rounds r LEFT JOIN ideas i ON i.current_round_id = r.id AND i.stage IN ('submitted','under_review','revision_requested')
         GROUP BY r.id ORDER BY r.stage_order`
      ).all(),
      db.prepare(`SELECT COALESCE(district,'Unspecified') AS district, COUNT(*) AS n FROM ideas WHERE stage != 'draft' GROUP BY district ORDER BY n DESC LIMIT 10`).all(),
      db.prepare(`SELECT DATE(submitted_at) AS day, COUNT(*) AS n FROM ideas WHERE submitted_at IS NOT NULL GROUP BY day ORDER BY day`).all(),
      db.prepare(
        `SELECT u.name, COUNT(a.id) AS total, SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END) AS completed,
                ROUND(AVG(CASE WHEN a.status='completed' THEN a.weighted_score END),1) AS avg_score
         FROM users u LEFT JOIN assignments a ON a.evaluator_id = u.id WHERE u.role IN ('evaluator','adjudicator') AND u.is_active=1
         GROUP BY u.id ORDER BY total DESC`
      ).all(),
      db.prepare(
        `SELECT
           (SELECT COUNT(*) FROM ideas WHERE stage != 'draft') AS total_submissions,
           (SELECT COUNT(*) FROM ideas WHERE stage IN ('submitted','under_review')) AS in_pipeline,
           (SELECT COUNT(*) FROM ideas WHERE stage = 'revision_requested') AS awaiting_revision,
           (SELECT COUNT(*) FROM ideas WHERE stage IN ('approved','awarded')) AS approved,
           (SELECT COUNT(*) FROM ideas WHERE stage = 'rejected') AS rejected,
           (SELECT COUNT(*) FROM users WHERE role='submitter') AS submitters,
           (SELECT COUNT(*) FROM users WHERE role IN ('evaluator','adjudicator')) AS evaluators,
           (SELECT COUNT(*) FROM assignments WHERE status IN ('pending','in_progress')) AS open_assignments,
           (SELECT COUNT(*) FROM assignments WHERE status = 'completed') AS completed_assignments,
           (SELECT ROUND(AVG(weighted_score),1) FROM assignments WHERE status='completed') AS avg_score,
           (SELECT COALESCE(SUM(budget_estimate),0) FROM ideas WHERE stage != 'draft') AS total_budget_requested,
           (SELECT COUNT(*) FROM feedback) AS feedback_items,
           (SELECT ROUND(AVG((julianday(completed_at) - julianday(assigned_at)) * 24),1) FROM assignments WHERE status='completed' AND completed_at IS NOT NULL) AS avg_turnaround_hours`
      ).first(),
      db.prepare(
        `SELECT l.action, l.entity_type, l.entity_id, l.created_at, u.name AS actor_name, l.meta
         FROM audit_log l LEFT JOIN users u ON u.id = l.actor_id ORDER BY l.created_at DESC, l.id DESC LIMIT 15`
      ).all(),
      db.prepare(
        `SELECT CASE WHEN weighted_score >= 80 THEN '80-100' WHEN weighted_score >= 60 THEN '60-79' WHEN weighted_score >= 40 THEN '40-59' ELSE '0-39' END AS bucket, COUNT(*) AS n
         FROM assignments WHERE status='completed' GROUP BY bucket`
      ).all()
    ]);
    const leaderboard = await db.prepare(
      `SELECT i.id, i.ref_code, i.title, i.stage, cat.name AS category_name, ROUND(AVG(a.weighted_score),1) AS avg_score, COUNT(a.id) AS evaluations
       FROM ideas i JOIN assignments a ON a.idea_id = i.id AND a.status='completed' LEFT JOIN categories cat ON cat.id=i.category_id
       WHERE i.stage NOT IN ('draft','withdrawn') GROUP BY i.id ORDER BY avg_score DESC LIMIT 10`
    ).all();
    return c.json({
      kpis,
      by_stage: byStage.results,
      by_category: byCategory.results,
      by_round: byRound.results,
      by_district: byDistrict.results,
      timeline: timeline.results,
      evaluators: evaluators.results,
      recent_activity: recent.results,
      score_distribution: scoreDist.results,
      leaderboard: leaderboard.results
    });
  });
  admin.get("/audit", requireRole("admin"), async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT l.*, u.name AS actor_name, u.email AS actor_email FROM audit_log l LEFT JOIN users u ON u.id = l.actor_id ORDER BY l.created_at DESC, l.id DESC LIMIT 300`
    ).all();
    return c.json({ audit: results });
  });
  function toCsv(rows) {
    if (!rows.length) return "";
    const cols = Object.keys(rows[0]);
    const esc = (v) => {
      if (v === null || v === void 0) return "";
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [cols.join(","), ...rows.map((r) => cols.map((col) => esc(r[col])).join(","))].join("\n");
  }
  admin.get("/reports/:type", requireRole("admin", "adjudicator"), async (c) => {
    const type = c.req.param("type");
    let rows = [];
    if (type === "ideas") {
      rows = (await c.env.DB.prepare(
        `SELECT i.ref_code, i.title, i.stage, i.version, cat.name AS category, r.name AS current_round, i.district, i.budget_estimate,
                u.name AS submitter, u.email AS submitter_email, u.organisation,
                (SELECT ROUND(AVG(weighted_score),1) FROM assignments a WHERE a.idea_id=i.id AND a.status='completed') AS avg_score,
                (SELECT COUNT(*) FROM assignments a WHERE a.idea_id=i.id AND a.status='completed') AS evaluations,
                i.submitted_at, i.updated_at
         FROM ideas i LEFT JOIN categories cat ON cat.id=i.category_id LEFT JOIN rounds r ON r.id=i.current_round_id JOIN users u ON u.id=i.submitter_id
         WHERE i.stage != 'draft' ORDER BY i.ref_code`
      ).all()).results;
    } else if (type === "scores") {
      rows = (await c.env.DB.prepare(
        `SELECT i.ref_code, i.title, r.name AS round, u.name AS evaluator, cr.name AS criterion, cr.weight, cr.max_score, s.score, s.comment,
                a.weighted_score, a.recommendation, a.completed_at
         FROM scores s JOIN assignments a ON a.id=s.assignment_id JOIN ideas i ON i.id=a.idea_id JOIN rounds r ON r.id=a.round_id
         JOIN users u ON u.id=a.evaluator_id JOIN criteria cr ON cr.id=s.criterion_id ORDER BY i.ref_code, r.stage_order, u.name, cr.sort_order`
      ).all()).results;
    } else if (type === "decisions") {
      rows = (await c.env.DB.prepare(
        `SELECT i.ref_code, i.title, r.name AS round, d.decision, d.aggregate_score, d.rationale, u.name AS decided_by, d.created_at
         FROM decisions d JOIN ideas i ON i.id=d.idea_id LEFT JOIN rounds r ON r.id=d.round_id JOIN users u ON u.id=d.decided_by ORDER BY d.created_at DESC`
      ).all()).results;
    } else if (type === "evaluators") {
      rows = (await c.env.DB.prepare(
        `SELECT u.name, u.email, u.expertise, COUNT(a.id) AS assigned, SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END) AS completed,
                ROUND(AVG(CASE WHEN a.status='completed' THEN a.weighted_score END),1) AS avg_score
         FROM users u LEFT JOIN assignments a ON a.evaluator_id=u.id WHERE u.role IN ('evaluator','adjudicator') GROUP BY u.id ORDER BY u.name`
      ).all()).results;
    } else {
      return c.json({ error: "Unknown report. Use ideas | scores | decisions | evaluators" }, 400);
    }
    await audit(c.env.DB, c.get("user").id, "report.export", "report", null, { type });
    if (c.req.query("format") === "json") return c.json({ rows });
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ceda-${type}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`
      }
    });
  });
  admin.get("/notifications", async (c) => {
    const user = c.get("user");
    const { results } = await c.env.DB.prepare(`SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC, id DESC LIMIT 50`).bind(user.id).all();
    const unread = results.filter((n) => !n.is_read).length;
    return c.json({ notifications: results, unread });
  });
  admin.post("/notifications/read", async (c) => {
    const user = c.get("user");
    const b = await c.req.json().catch(() => ({}));
    if (Array.isArray(b.ids) && b.ids.length) {
      await c.env.DB.prepare(`UPDATE notifications SET is_read=1 WHERE user_id=? AND id IN (${b.ids.map(() => "?").join(",")})`).bind(user.id, ...b.ids.map(Number)).run();
    } else {
      await c.env.DB.prepare(`UPDATE notifications SET is_read=1 WHERE user_id=?`).bind(user.id).run();
    }
    return c.json({ ok: true });
  });
  var admin_default = admin;

  // src/pages.ts
  var HEAD = (title) => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="CEDA Innovation Portal - submit, evaluate and track innovative ideas from Botswana's citizen entrepreneurs.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23c2410c'/><path d='M20 60 Q50 20 80 60 Z' fill='%23fbbf24'/></svg>">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = { theme: { extend: { colors: {
      brand: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
      sand: { 50:'#fdfbf7',100:'#f8f3ea',200:'#efe4d1' },
      ink: { 900:'#1b1917', 800:'#2a2623', 700:'#44403c' }
    }, fontFamily: { sans: ['Inter','ui-sans-serif','system-ui','sans-serif'] } } } }
  <\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="/static/styles.css" rel="stylesheet">
`;
  var landingPage = () => `<!DOCTYPE html>
<html lang="en">
<head>${HEAD("CEDA Innovation Portal | #KaeKapaKae")}</head>
<body class="bg-sand-50 text-ink-900 font-sans antialiased">
<header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-sand-200">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
    <a href="/" class="flex items-center gap-3">
      <span class="brand-mark"><i class="fas fa-mountain-sun"></i></span>
      <span class="leading-tight"><span class="block font-extrabold tracking-tight text-lg">CEDA Innovation Portal</span><span class="block text-xs text-ink-700/70 -mt-0.5">Finance \xB7 Develop \xB7 Sustain</span></span>
    </a>
    <div class="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700">
      <a href="#how-it-works" class="hover:text-brand-700">How it works</a>
      <a href="#categories" class="hover:text-brand-700">Focus areas</a>
      <a href="#eligibility" class="hover:text-brand-700">Eligibility</a>
      <a href="#timeline" class="hover:text-brand-700">Timeline</a>
    </div>
    <div class="flex items-center gap-2">
      <a href="/app#/login" class="btn-ghost">Sign in</a>
      <a href="/app#/register" class="btn-primary">Submit an idea</a>
    </div>
  </nav>
</header>

<main>
  <section id="hero-section" class="relative overflow-hidden text-white bg-ink-900 min-h-[calc(100svh-4rem)] flex items-center">
    <div class="hero-slides" aria-hidden="true">
      <div class="hero-slide is-active" style="background-image:url('/static/img/okavango.webp')" data-caption="Okavango Delta \xB7 North-West"></div>
      <div class="hero-slide" style="background-image:url('/static/img/city-aerial.webp')" data-caption="Gaborone \xB7 South-East"></div>
      <div class="hero-slide" style="background-image:url('/static/img/farmer-field.webp')" data-caption="Agribusiness &amp; food security"></div>
      <div class="hero-slide" style="background-image:url('/static/img/delta-aerial.webp')" data-caption="Okavango Delta from the air"></div>
    </div>
    <div class="hero-scrim" aria-hidden="true"></div>
    <div class="hero-grain" aria-hidden="true"></div>
    <div class="absolute bottom-6 left-0 right-0 z-10 hidden md:block">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 text-xs text-white/70">
        <span id="hero-caption" class="font-semibold tracking-wider uppercase"><i class="fas fa-location-dot text-amber-300 mr-1.5"></i>Okavango Delta \xB7 North-West</span>
        <span class="flex gap-1.5 ml-auto" id="hero-dots">${[0, 1, 2, 3].map((i) => `<button class="hero-dot${i === 0 ? " is-active" : ""}" data-slide="${i}" aria-label="Show photo ${i + 1}"></button>`).join("")}</span>
      </div>
    </div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p class="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6"><i class="fas fa-bolt text-amber-300"></i> #KaeKapaKae \xB7 Innovation Hackathon 2026</p>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">Turn bold ideas into <span class="text-amber-300">funded ventures</span>.</h1>
        <p class="mt-6 text-lg text-white/80 max-w-xl">A single, transparent platform where Batswana entrepreneurs submit innovative ideas and CEDA evaluates, nurtures and funds them - from first draft to award.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="/app#/register" class="btn-primary-lg">Start your submission <i class="fas fa-arrow-right ml-2"></i></a>
          <a href="/app#/login" class="btn-outline-lg">Evaluator / Admin login</a>
        </div>
        <dl id="public-stats" class="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Submissions</dt><dd class="text-3xl font-extrabold" data-stat="submissions">\u2014</dd></div>
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Innovators</dt><dd class="text-3xl font-extrabold" data-stat="innovators">\u2014</dd></div>
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Focus areas</dt><dd class="text-3xl font-extrabold" data-stat="categories">\u2014</dd></div>
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Approved</dt><dd class="text-3xl font-extrabold" data-stat="approved">\u2014</dd></div>
        </dl>
      </div>
      <aside class="hidden lg:block relative" style="perspective:1200px">
        <figure class="hero-founder" aria-hidden="true"><img src="/static/img/founder-laptop.webp" alt="" loading="eager"><figcaption><strong>Youth-led</strong><span>Founders aged 18 to 35</span></figcaption></figure>
        <div class="glass-card p-6 tilt" data-tilt>
          <div class="flex items-center justify-between text-sm"><span class="font-semibold">CEDA-2026-0001 \xB7 Smart Irrigation Network</span><span class="chip chip-amber">Under review</span></div>
          <ol class="mt-5 space-y-3 text-sm">
            <li class="flex items-center gap-3"><span class="step-dot done"><i class="fas fa-check"></i></span><span>Submitted</span><span class="ml-auto text-white/60">06 Nov</span></li>
            <li class="flex items-center gap-3"><span class="step-dot done"><i class="fas fa-check"></i></span><span>Eligibility screening</span><span class="ml-auto text-white/60">Passed \xB7 71%</span></li>
            <li class="flex items-center gap-3"><span class="step-dot active"><i class="fas fa-magnifying-glass"></i></span><span>Technical &amp; business review</span><span class="ml-auto text-white/60">1 of 2 evaluators</span></li>
            <li class="flex items-center gap-3 opacity-60"><span class="step-dot"></span><span>Investment committee pitch</span></li>
            <li class="flex items-center gap-3 opacity-60"><span class="step-dot"></span><span>Award</span></li>
          </ol>
          <div class="mt-5 rounded-xl bg-white/10 p-4 text-sm"><i class="fas fa-comment-dots text-amber-300 mr-2"></i><span class="text-white/90">"Strong agronomic grounding and credible pilot data. Hardware supply chain needs a second vendor."</span><span class="block text-xs text-white/50 mt-1">Evaluator feedback \xB7 shared with submitter</span></div>
        </div>
      </aside>
    </div>
  </section>

  <div class="marquee bg-brand-700 text-white" aria-label="Districts the portal reaches">
    <div class="marquee-track">${[0, 1].map(() => ["Gaborone", "Francistown", "Maun", "Serowe", "Kasane", "Palapye", "Molepolole", "Kanye", "Lobatse", "Selebi-Phikwe", "Ghanzi", "Tsabong", "Mahalapye", "Jwaneng"].map((d) => `<span><i class="fas fa-location-dot"></i>${d}</span>`).join("")).join("")}</div>
  </div>

  <section id="people" class="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
    <header class="max-w-2xl reveal"><p class="section-kicker">Who it's for</p><h2 class="section-title">The people building Botswana's next industries</h2><p class="section-lead">Makers, farmers, engineers and founders, aged 18 to 35, in every district. Hover a story to see where their idea could go.</p></header>
    <div class="story-strip mt-10 reveal">
      ${[
    ["farmer-field.webp", "Agribusiness", "Climate-smart farming", "Drip irrigation and soil sensors that cut water use by a third."],
    ["maker-sewing.webp", "Manufacturing", "Local production", "Turning imported goods into made-in-Botswana products and jobs."],
    ["engineer.webp", "Digital & fintech", "Software for everyone", "Mobile money, USSD and apps that work on any phone."],
    ["solar-rural.webp", "Green energy", "Power off the grid", "Pay-as-you-go solar for villages the grid has not reached."],
    ["team-laptop.webp", "Youth teams", "Founders, together", "Majority youth-owned companies with a plan to scale."]
  ].map(
    ([img, k, t, d]) => `<article class="story" tabindex="0"><img src="/static/img/${img}" alt="${t}" loading="lazy"><div class="story-body"><span class="story-kicker">${k}</span><h3>${t}</h3><p>${d}</p></div></article>`
  ).join("")}
    </div>
  </section>

  <section id="how-it-works" class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
    <header class="max-w-2xl"><p class="section-kicker">How it works</p><h2 class="section-title">A multi-level workflow built for fairness and speed</h2><p class="section-lead">Every idea moves through configurable evaluation rounds with weighted criteria, blind review, quorum rules and documented panel decisions.</p></header>
    <ol class="mt-12 grid md:grid-cols-4 gap-6">
      ${[
    ["fa-pen-to-square", "1. Submit", "Guided wizard with auto-save drafts, mandatory fields, supporting document links and a Data Protection consent."],
    ["fa-shield-halved", "2. Screen", "Eligibility screening confirms citizen ownership, youth leadership and strategic fit with CEDA priorities."],
    ["fa-scale-balanced", "3. Evaluate", "Sector experts score weighted criteria independently. Blind review hides identities; scores aggregate automatically."],
    ["fa-award", "4. Decide & award", "Adjudicators advance, request revisions or award with a written rationale. Submitters see every step in real time."]
  ].map(
    ([i, t, d]) => `<li class="feature-card"><span class="feature-icon"><i class="fas ${i}"></i></span><h3 class="font-bold text-lg mt-4">${t}</h3><p class="text-ink-700/80 text-sm mt-2">${d}</p></li>`
  ).join("")}
    </ol>
  </section>

  <section id="platform-features" class="bg-white border-y border-sand-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p class="section-kicker">Platform capabilities</p>
        <h2 class="section-title">Everything the guidelines ask for - and the details that make it work</h2>
        <ul class="mt-8 space-y-4">
          ${[
    ["Role-based access control", "Submitter, Evaluator, Adjudicator and Administrator roles with granular permissions and full audit trail."],
    ["Real-time status tracking", "Live stage tracker, in-app notifications and feedback threads keep innovators informed at every step."],
    ["Configurable evaluation", "Admins define rounds, weighted criteria, pass thresholds, quorum and blind-review per round - no code changes."],
    ["Analytics & reporting", "Dashboards for pipeline, categories, districts, evaluator workload and score distribution. One-click CSV exports."],
    ["Data protection by design", "PBKDF2 password hashing, session expiry, confidentiality flags and compliance with Botswana\u2019s Data Protection Act, 2024."],
    ["Modular & scalable", "Edge-deployed API on Cloudflare with D1 SQLite, ready for file storage (R2), SSO and external integrations."]
  ].map(
    ([t, d]) => `<li class="flex gap-4"><span class="check-icon"><i class="fas fa-check"></i></span><div><h3 class="font-semibold">${t}</h3><p class="text-sm text-ink-700/80">${d}</p></div></li>`
  ).join("")}
        </ul>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="stat-tile"><i class="fas fa-users-gear"></i><strong>4 roles</strong><span>Submitter \xB7 Evaluator \xB7 Adjudicator \xB7 Admin</span></div>
        <div class="stat-tile"><i class="fas fa-layer-group"></i><strong>3 rounds</strong><span>Screening \xB7 Technical review \xB7 Pitch</span></div>
        <div class="stat-tile"><i class="fas fa-sliders"></i><strong>12 criteria</strong><span>Weighted and fully configurable</span></div>
        <div class="stat-tile"><i class="fas fa-clipboard-check"></i><strong>100% audited</strong><span>Every action logged with actor and time</span></div>
      </div>
    </div>
  </section>

  <section id="categories" class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
    <header class="max-w-2xl"><p class="section-kicker">Focus areas</p><h2 class="section-title">Aligned with CEDA\u2019s strategic priorities</h2></header>
    <div id="category-grid" class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"></div>
  </section>

  <section id="eligibility" class="relative overflow-hidden bg-ink-900 text-white">
    <div class="parallax-bg" style="background-image:url('/static/img/city-aerial.webp')" data-parallax aria-hidden="true"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/60" aria-hidden="true"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 grid lg:grid-cols-3 gap-10">
      <div><p class="section-kicker text-amber-300">Eligibility</p><h2 class="text-3xl font-extrabold tracking-tight">Who can apply</h2><p class="mt-4 text-white/70">Per the CEDA Innovation Platform Competition Guidelines.</p></div>
      <ul class="lg:col-span-2 grid sm:grid-cols-2 gap-5 text-sm">
        ${[
    ["fa-id-card", "Motswana youth citizen (18-35) with a registered company"],
    ["fa-chart-pie", "Youth shareholding above 50%; citizen-owned company"],
    ["fa-file-lines", "Complete application with a technical proposal"],
    ["fa-language", "Submissions in English; every question answered"],
    ["fa-hand-holding-dollar", "No application fee"],
    ["fa-people-group", "Team: Front-end & Back-end developers, UI/UX, DevOps, Business/Technical analysts"]
  ].map(([i, t]) => `<li class="flex gap-3 rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm reveal"><i class="fas ${i} text-amber-300 mt-0.5"></i><span>${t}</span></li>`).join("")}
      </ul>
    </div>
  </section>

  <section id="timeline" class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
    <header class="max-w-2xl"><p class="section-kicker">Timeline</p><h2 class="section-title">Key dates</h2></header>
    <ol class="mt-10 grid md:grid-cols-3 gap-6">
      <li class="timeline-card"><span class="date">6 Nov 2026</span><h3>Applications open</h3><p>Portal opens for submissions and team registration.</p></li>
      <li class="timeline-card"><span class="date">10 Nov 2026</span><h3>Applications close</h3><p>Submissions lock at 23:59. Late entries cannot be accepted.</p></li>
      <li class="timeline-card"><span class="date">11 Nov 2026</span><h3>Shortlist announced</h3><p>Successful applicants are contacted. Stay tuned for pitch invitations.</p></li>
    </ol>
    <div class="mt-10 rounded-2xl bg-brand-50 border border-brand-200 p-6 flex flex-col md:flex-row md:items-center gap-4">
      <i class="fas fa-shield-heart text-3xl text-brand-700"></i>
      <p class="text-sm text-ink-700"><strong>Data protection.</strong> The Innovation Platform complies with Botswana\u2019s Data Protection Act, 2024. Participants\u2019 personal data is collected and processed lawfully, used only for specified purposes, protected against unauthorised access or disclosure, and retained only for as long as necessary.</p>
      <a href="/app#/register" class="btn-primary whitespace-nowrap md:ml-auto">Apply now</a>
    </div>
  </section>
</main>

<footer class="border-t border-sand-200 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-700/70">
    <p>\xA9 2026 Citizen Entrepreneurial Development Agency \xB7 <a class="hover:text-brand-700" href="https://www.ceda.co.bw" target="_blank" rel="noopener">www.ceda.co.bw</a></p>
    <p>Secondary submissions: <a class="text-brand-700 font-medium" href="mailto:hackathon@bih.co.bw">hackathon@bih.co.bw</a></p>
  </div>
</footer>

<script src="/static/landing.js"><\/script>
</body>
</html>`;
  var appShell = () => `<!DOCTYPE html>
<html lang="en">
<head>${HEAD("CEDA Innovation Portal \xB7 Workspace")}
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js"><\/script>
</head>
<body class="bg-sand-50 text-ink-900 font-sans antialiased">
  <div id="app" class="min-h-screen"></div>
  <div id="toast-root" class="fixed bottom-4 right-4 z-[100] space-y-2"></div>
  <div id="modal-root"></div>
  <script src="/static/app.js"><\/script>
</body>
</html>`;

  // src/index.tsx
  var app = new Hono2();
  app.use("/api/*", cors());
  app.use("/static/*", serveStatic({ root: "./public" }));
  app.use("*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "SAMEORIGIN");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  });
  app.get("/api/health", async (c) => {
    try {
      const row = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
      return c.json({ status: "ok", db: "connected", users: row?.n ?? 0, time: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (e) {
      return c.json({ status: "degraded", db: "unavailable", error: e.message }, 503);
    }
  });
  app.get("/api/public/stats", async (c) => {
    const row = await c.env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM ideas WHERE stage != 'draft') AS submissions,
            (SELECT COUNT(*) FROM users WHERE role='submitter') AS innovators,
            (SELECT COUNT(*) FROM categories WHERE is_active=1) AS categories,
            (SELECT COUNT(*) FROM ideas WHERE stage IN ('approved','awarded')) AS approved`
    ).first();
    const { results: cats } = await c.env.DB.prepare(`SELECT name, description, icon FROM categories WHERE is_active=1 ORDER BY name`).all();
    const { results: settings } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all();
    return c.json({ stats: row, categories: cats, settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
  });
  app.route("/api/auth", auth_default);
  app.route("/api/ideas", ideas_default);
  app.route("/api/evaluation", evaluation_default);
  app.route("/api", admin_default);
  app.notFound((c) => {
    if (c.req.path.startsWith("/api/")) return c.json({ error: "Not found" }, 404);
    return c.html(landingPage(), 404);
  });
  app.onError((err, c) => {
    console.error(err);
    if (c.req.path.startsWith("/api/")) return c.json({ error: "Internal server error", detail: err.message }, 500);
    return c.text("Internal server error", 500);
  });
  app.get("/", (c) => c.html(landingPage()));
  app.get("/app", (c) => c.html(appShell()));
  var src_default = app;

  // migrations/0001_initial_schema.sql
  var initial_schema_default = "-- CEDA Innovation Portal - Initial schema\nPRAGMA foreign_keys = ON;\n\n-- Users & authentication -----------------------------------------------------\nCREATE TABLE IF NOT EXISTS users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  email TEXT UNIQUE NOT NULL,\n  password_hash TEXT NOT NULL,\n  salt TEXT NOT NULL,\n  name TEXT NOT NULL,\n  role TEXT NOT NULL CHECK (role IN ('submitter','evaluator','adjudicator','admin')),\n  organisation TEXT,\n  phone TEXT,\n  district TEXT,\n  expertise TEXT,\n  is_active INTEGER NOT NULL DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  last_login_at DATETIME\n);\nCREATE INDEX IF NOT EXISTS idx_users_role ON users(role);\n\nCREATE TABLE IF NOT EXISTS sessions (\n  token TEXT PRIMARY KEY,\n  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  expires_at DATETIME NOT NULL,\n  user_agent TEXT\n);\nCREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);\n\n-- Programme configuration ----------------------------------------------------\nCREATE TABLE IF NOT EXISTS categories (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  description TEXT,\n  strategic_priority TEXT,\n  icon TEXT DEFAULT 'fa-lightbulb',\n  is_active INTEGER NOT NULL DEFAULT 1\n);\n\nCREATE TABLE IF NOT EXISTS rounds (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  slug TEXT UNIQUE NOT NULL,\n  stage_order INTEGER NOT NULL,\n  description TEXT,\n  min_evaluators INTEGER NOT NULL DEFAULT 2,\n  pass_threshold REAL NOT NULL DEFAULT 60,\n  blind_review INTEGER NOT NULL DEFAULT 1,\n  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),\n  starts_at DATETIME,\n  ends_at DATETIME\n);\n\nCREATE TABLE IF NOT EXISTS criteria (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  description TEXT,\n  weight REAL NOT NULL DEFAULT 1,\n  max_score INTEGER NOT NULL DEFAULT 10,\n  sort_order INTEGER NOT NULL DEFAULT 0\n);\nCREATE INDEX IF NOT EXISTS idx_criteria_round ON criteria(round_id);\n\nCREATE TABLE IF NOT EXISTS settings (\n  key TEXT PRIMARY KEY,\n  value TEXT\n);\n\n-- Ideas ----------------------------------------------------------------------\nCREATE TABLE IF NOT EXISTS ideas (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  ref_code TEXT UNIQUE NOT NULL,\n  title TEXT NOT NULL,\n  summary TEXT NOT NULL,\n  problem TEXT,\n  solution TEXT,\n  target_beneficiaries TEXT,\n  impact TEXT,\n  business_model TEXT,\n  budget_estimate REAL,\n  timeline TEXT,\n  team_description TEXT,\n  district TEXT,\n  tags TEXT,\n  category_id INTEGER REFERENCES categories(id),\n  submitter_id INTEGER NOT NULL REFERENCES users(id),\n  stage TEXT NOT NULL DEFAULT 'draft'\n    CHECK (stage IN ('draft','submitted','under_review','revision_requested','approved','awarded','rejected','withdrawn')),\n  current_round_id INTEGER REFERENCES rounds(id),\n  is_confidential INTEGER NOT NULL DEFAULT 1,\n  version INTEGER NOT NULL DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  submitted_at DATETIME,\n  decided_at DATETIME\n);\nCREATE INDEX IF NOT EXISTS idx_ideas_submitter ON ideas(submitter_id);\nCREATE INDEX IF NOT EXISTS idx_ideas_stage ON ideas(stage);\nCREATE INDEX IF NOT EXISTS idx_ideas_round ON ideas(current_round_id);\nCREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category_id);\n\nCREATE TABLE IF NOT EXISTS idea_versions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,\n  version INTEGER NOT NULL,\n  payload TEXT NOT NULL,\n  change_note TEXT,\n  created_by INTEGER REFERENCES users(id),\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_versions_idea ON idea_versions(idea_id);\n\nCREATE TABLE IF NOT EXISTS idea_attachments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,\n  filename TEXT NOT NULL,\n  url TEXT NOT NULL,\n  kind TEXT DEFAULT 'link',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE IF NOT EXISTS idea_stage_history (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,\n  from_stage TEXT,\n  to_stage TEXT NOT NULL,\n  round_id INTEGER REFERENCES rounds(id),\n  actor_id INTEGER REFERENCES users(id),\n  note TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_history_idea ON idea_stage_history(idea_id);\n\n-- Evaluation -----------------------------------------------------------------\nCREATE TABLE IF NOT EXISTS assignments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,\n  round_id INTEGER NOT NULL REFERENCES rounds(id),\n  evaluator_id INTEGER NOT NULL REFERENCES users(id),\n  assigned_by INTEGER REFERENCES users(id),\n  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','declined')),\n  recommendation TEXT CHECK (recommendation IN ('advance','revise','reject')),\n  overall_comment TEXT,\n  conflict_note TEXT,\n  weighted_score REAL,\n  due_at DATETIME,\n  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  completed_at DATETIME,\n  UNIQUE (idea_id, round_id, evaluator_id)\n);\nCREATE INDEX IF NOT EXISTS idx_assignments_evaluator ON assignments(evaluator_id);\nCREATE INDEX IF NOT EXISTS idx_assignments_idea ON assignments(idea_id);\n\nCREATE TABLE IF NOT EXISTS scores (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,\n  criterion_id INTEGER NOT NULL REFERENCES criteria(id),\n  score REAL NOT NULL,\n  comment TEXT,\n  UNIQUE (assignment_id, criterion_id)\n);\n\nCREATE TABLE IF NOT EXISTS decisions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,\n  round_id INTEGER REFERENCES rounds(id),\n  decided_by INTEGER NOT NULL REFERENCES users(id),\n  decision TEXT NOT NULL CHECK (decision IN ('advance','revise','reject','approve','award')),\n  rationale TEXT,\n  aggregate_score REAL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_decisions_idea ON decisions(idea_id);\n\n-- Feedback / collaboration ---------------------------------------------------\nCREATE TABLE IF NOT EXISTS feedback (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,\n  author_id INTEGER NOT NULL REFERENCES users(id),\n  body TEXT NOT NULL,\n  visibility TEXT NOT NULL DEFAULT 'submitter' CHECK (visibility IN ('submitter','internal')),\n  parent_id INTEGER REFERENCES feedback(id) ON DELETE CASCADE,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_feedback_idea ON feedback(idea_id);\n\nCREATE TABLE IF NOT EXISTS notifications (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  type TEXT NOT NULL,\n  title TEXT NOT NULL,\n  body TEXT,\n  link TEXT,\n  is_read INTEGER NOT NULL DEFAULT 0,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);\n\nCREATE TABLE IF NOT EXISTS audit_log (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  actor_id INTEGER REFERENCES users(id),\n  action TEXT NOT NULL,\n  entity_type TEXT,\n  entity_id INTEGER,\n  meta TEXT,\n  ip TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\nCREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);\n";

  // seed.sql
  var seed_default = `-- Demo seed data for CEDA Innovation Portal
-- All demo accounts use password: Demo@2026

INSERT OR IGNORE INTO users (id, email, password_hash, salt, name, role, organisation, district, expertise) VALUES
  (1, 'admin@ceda.co.bw',      'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Naledi Moagi',   'admin',       'CEDA Innovation Strategy Office', 'Gaborone', 'Programme Management'),
  (2, 'adjudicator@ceda.co.bw','e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Dr. Kago Sebina','adjudicator', 'CEDA Investment Committee',       'Gaborone', 'Venture Finance'),
  (3, 'evaluator1@ceda.co.bw', 'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Tumelo Rakgomo', 'evaluator',   'CEDA Business Advisory',          'Francistown', 'Agribusiness, Operations'),
  (4, 'evaluator2@ceda.co.bw', 'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Lesego Phiri',   'evaluator',   'Botswana Digital & Innovation Hub','Gaborone', 'Software, Fintech'),
  (5, 'evaluator3@ceda.co.bw', 'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Mpho Dintwe',    'evaluator',   'CEDA Credit Risk',                'Maun', 'Finance, Risk, Tourism'),
  (6, 'thabo@youthventures.bw','e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Thabo Kgosi',    'submitter',   'Youth Ventures (Pty) Ltd',        'Palapye', NULL),
  (7, 'amantle@agritech.bw',   'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Amantle Seretse','submitter',   'Pula AgriTech',                   'Serowe', NULL),
  (8, 'kabelo@solarpay.bw',    'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Kabelo Motswana','submitter',   'SolarPay Botswana',               'Maun', NULL);

INSERT OR IGNORE INTO categories (id, name, description, strategic_priority, icon) VALUES
  (1, 'Agribusiness & Food Security', 'Value chains, climate-smart farming, agro-processing', 'Economic diversification', 'fa-seedling'),
  (2, 'Digital & Fintech', 'Payments, SME digitisation, inclusive finance', 'Digital transformation', 'fa-microchip'),
  (3, 'Green Energy & Climate', 'Renewables, water, circular economy', 'Sustainable development', 'fa-solar-panel'),
  (4, 'Tourism & Creative Economy', 'Experiences, crafts, media and heritage', 'Tourism diversification', 'fa-camera-retro'),
  (5, 'Health & Social Innovation', 'Access to care, education, community services', 'Inclusive growth', 'fa-heart-pulse'),
  (6, 'Manufacturing & Mining Services', 'Local beneficiation, supply chain, industrial services', 'Citizen economic empowerment', 'fa-industry');

INSERT OR IGNORE INTO rounds (id, name, slug, stage_order, description, min_evaluators, pass_threshold, blind_review, status) VALUES
  (1, 'Eligibility Screening', 'screening', 1, 'Confirms completeness, citizen ownership and strategic fit.', 1, 60, 1, 'open'),
  (2, 'Technical & Business Review', 'technical', 2, 'Deep-dive scoring by sector experts on feasibility, impact and scalability.', 2, 65, 1, 'open'),
  (3, 'Investment Committee Pitch', 'pitch', 3, 'Final adjudication after live pitch and due diligence.', 2, 70, 0, 'open');

INSERT OR IGNORE INTO criteria (id, round_id, name, description, weight, max_score, sort_order) VALUES
  (1, 1, 'Completeness', 'All mandatory fields answered with sufficient detail', 1, 10, 1),
  (2, 1, 'Eligibility', 'Citizen-owned (>50%), youth-led, Botswana-based', 2, 10, 2),
  (3, 1, 'Strategic Alignment', 'Fit with CEDA mandate and national development priorities', 2, 10, 3),
  (4, 2, 'Innovation & Originality', 'Novelty of the solution relative to existing alternatives', 2, 10, 1),
  (5, 2, 'Market Viability', 'Evidence of demand, customers and revenue model', 3, 10, 2),
  (6, 2, 'Technical Feasibility', 'Realism of the technical approach and delivery plan', 2, 10, 3),
  (7, 2, 'Socio-economic Impact', 'Jobs, inclusion and community benefit', 2, 10, 4),
  (8, 2, 'Scalability', 'Potential to grow nationally and regionally', 1, 10, 5),
  (9, 3, 'Team Capability', 'Skills, commitment and track record of the founding team', 3, 10, 1),
  (10, 3, 'Financial Sustainability', 'Unit economics, funding ask and path to profitability', 3, 10, 2),
  (11, 3, 'Pitch Quality & Clarity', 'Ability to communicate and defend the proposition', 1, 10, 3),
  (12, 3, 'Risk Management', 'Awareness of risks and mitigation strategies', 2, 10, 4);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('programme_name', 'CEDA Innovation Portal Hackathon 2026'),
  ('submission_open', '1'),
  ('submission_deadline', '2026-11-10T23:59:00'),
  ('contact_email', 'hackathon@bih.co.bw'),
  ('max_resubmissions', '2');

-- Sample ideas across the workflow ------------------------------------------
INSERT OR IGNORE INTO ideas (id, ref_code, title, summary, problem, solution, target_beneficiaries, impact, business_model, budget_estimate, timeline, team_description, district, tags, category_id, submitter_id, stage, current_round_id, version, submitted_at) VALUES
  (1, 'CEDA-2026-0001', 'Pula AgriTech Smart Irrigation Network',
   'Low-cost IoT soil sensors and a USSD/WhatsApp advisory service that cut smallholder water use by 40% while increasing yields.',
   'Smallholder farmers in the Central District lose up to 35% of crop value annually to irregular rainfall and inefficient irrigation. Weather advisories are generic and do not reach farmers without smartphones.',
   'Solar-powered soil moisture sensors (BWP 350 each) relay data over GSM to a cloud platform. Farmers receive irrigation instructions via USSD and WhatsApp in Setswana. Cooperatives access dashboards for planning.',
   '1,200 smallholder farmers in Serowe, Palapye and Mahalapye in year one; cooperatives and the Ministry of Agriculture.',
   '40% water saving, 25% yield increase, 60 green jobs for youth technicians, reduced import dependency on vegetables.',
   'Hardware sold at cost; BWP 45/month advisory subscription; cooperative dashboard licences; data partnerships with insurers.',
   850000, '12 months: 3 months pilot (100 farms), 6 months scale-up, 3 months commercialisation.',
   'Amantle Seretse (CEO, agronomist), Oarabile Tau (CTO, embedded systems), Boitumelo Nkwe (community mobilisation). 100% citizen-owned.',
   'Serowe', 'iot,agriculture,climate', 1, 7, 'under_review', 2, 2, '2026-11-06 09:12:00'),
  (2, 'CEDA-2026-0002', 'SolarPay: Pay-as-you-go Solar for Off-grid Villages',
   'Mobile-money-enabled solar home systems with remote lock technology making clean energy affordable for 15,000 off-grid households.',
   'Over 15,000 households in Ngamiland and Kgalagadi remain off-grid, spending BWP 200+/month on paraffin and candles with health and fire risks.',
   'Solar home kits (lighting, phone charging, radio, TV) financed over 18 months through Orange Money / MyZaka micro-payments. GSM-enabled controllers lock units if payments lapse, reducing default risk.',
   'Off-grid rural households, informal traders needing refrigeration, village schools and clinics.',
   'Clean energy access for 15,000 households, 120 youth sales agents, BWP 30m in avoided paraffin spend over 5 years.',
   'Asset-financing margin on kits, carbon credits, agent commissions, after-sales maintenance plans.',
   2400000, '18 months with phased district rollout starting in Maun.',
   'Kabelo Motswana (CEO), Neo Sebego (COO, ex-BPC), Gorata Mokgethi (CFO). 70% citizen-owned, youth founders.',
   'Maun', 'energy,fintech,rural', 3, 8, 'under_review', 2, 1, '2026-11-06 11:40:00'),
  (3, 'CEDA-2026-0003', 'Kgotla Konnect: Digital Village Marketplace',
   'A bilingual marketplace and logistics app connecting village producers directly with urban buyers and tourism lodges.',
   'Rural artisans and food producers lack market access; middlemen capture 50-60% of the retail value.',
   'Progressive web app with Setswana/English UI, WhatsApp ordering, consolidated bus-courier logistics and mobile money escrow.',
   'Rural artisans, horticulture producers, safari lodges and urban consumers.',
   '300 producers onboarded in year one, 35% income increase for producers, 20 youth logistics jobs.',
   '8% transaction commission, premium listings, logistics margin.',
   620000, '9 months to MVP and pilot in the Chobe-Ngamiland corridor.',
   'Thabo Kgosi (founder, product), Refilwe Dube (logistics), Karabo Mothibi (developer). 100% citizen-owned.',
   'Palapye', 'marketplace,tourism,logistics', 4, 6, 'revision_requested', 1, 1, '2026-11-06 14:05:00'),
  (4, 'CEDA-2026-0004', 'MmaBana Mobile Clinic Scheduler',
   'Scheduling and triage system for mobile health clinics serving remote settlements, with SMS reminders for mothers and infants.',
   'Mobile clinics in remote settlements operate on paper schedules; missed immunisation appointments exceed 30%.',
   'Offline-first tablet app for nurses, SMS reminders to caregivers, and dashboards for District Health Management Teams.',
   'Caregivers, infants, mobile clinic teams, DHMTs in Kgalagadi and Ghanzi.',
   'Immunisation coverage up 20 points, reduced travel costs for families, better planning data for MoH.',
   'SaaS licence to district health teams and NGOs; donor grants for rollout.',
   480000, '12 months including MoH integration.',
   'Thabo Kgosi (product lead), Dr. Lorato Sento (clinical advisor), Tshepo Rantsho (developer).',
   'Ghanzi', 'health,mobile,offline', 5, 6, 'submitted', 1, 1, '2026-11-07 08:20:00'),
  (5, 'CEDA-2026-0005', 'Morula Beneficiation Micro-factory',
   'Community-owned micro-factory producing cold-pressed morula oil and cosmetics for export.',
   'Morula fruit is harvested by thousands of rural women but sold raw at low prices; value-addition happens abroad.',
   'Containerised processing unit with solar power, cold-press extraction, quality lab and export-grade packaging.',
   'Women harvesters in Kweneng West, cosmetics retailers, export buyers.',
   '400 harvesters with doubled income, 25 factory jobs, BWP 6m export revenue by year three.',
   'B2B oil sales, retail cosmetics brand, contract processing.',
   1900000, '15 months from procurement to first export shipment.',
   'Amantle Seretse (chair), Dineo Marumo (operations), Onalenna Segwai (chemist). 100% citizen-owned cooperative.',
   'Letlhakeng', 'manufacturing,export,women', 6, 7, 'approved', 3, 1, '2026-11-05 10:00:00'),
  (6, 'CEDA-2026-0006', 'EduBot Setswana Literacy Tutor',
   'AI-powered WhatsApp tutor for early-grade Setswana and English reading with voice feedback.',
   'Early-grade reading outcomes remain low; parents in rural areas lack resources to support literacy at home.',
   'Conversational tutor on WhatsApp using speech recognition for pronunciation feedback and gamified daily lessons.',
   'Learners aged 5-9, parents, primary schools.',
   '10,000 learners reached in year one; measurable reading gains.',
   'Freemium model with school licences and sponsorship.',
   350000, '8 months to pilot in 20 schools.',
   'Kabelo Motswana (founder), Tebogo Mosweu (education specialist).',
   'Gaborone', 'edtech,ai,literacy', 5, 8, 'draft', NULL, 1, NULL);

INSERT OR IGNORE INTO idea_versions (idea_id, version, payload, change_note, created_by) VALUES
  (1, 1, '{"title":"Pula AgriTech Smart Irrigation Network","summary":"Initial submission"}', 'Initial submission', 7),
  (1, 2, '{"title":"Pula AgriTech Smart Irrigation Network","summary":"Added cooperative dashboard revenue line and pilot data"}', 'Addressed screening feedback on revenue model', 7),
  (2, 1, '{"title":"SolarPay"}', 'Initial submission', 8),
  (3, 1, '{"title":"Kgotla Konnect"}', 'Initial submission', 6),
  (4, 1, '{"title":"MmaBana"}', 'Initial submission', 6),
  (5, 1, '{"title":"Morula Beneficiation Micro-factory"}', 'Initial submission', 7);

INSERT OR IGNORE INTO idea_stage_history (idea_id, from_stage, to_stage, round_id, actor_id, note) VALUES
  (1, 'draft', 'submitted', 1, 7, 'Submitted via portal'),
  (1, 'submitted', 'under_review', 1, 1, 'Assigned for screening'),
  (1, 'under_review', 'revision_requested', 1, 2, 'Clarify revenue model'),
  (1, 'revision_requested', 'submitted', 1, 7, 'Resubmitted v2'),
  (1, 'submitted', 'under_review', 2, 1, 'Advanced to technical review'),
  (2, 'draft', 'submitted', 1, 8, 'Submitted via portal'),
  (2, 'submitted', 'under_review', 2, 1, 'Advanced to technical review'),
  (3, 'draft', 'submitted', 1, 6, 'Submitted via portal'),
  (3, 'submitted', 'under_review', 1, 1, 'Assigned for screening'),
  (3, 'under_review', 'revision_requested', 1, 2, 'Logistics costs missing'),
  (4, 'draft', 'submitted', 1, 6, 'Submitted via portal'),
  (5, 'draft', 'submitted', 1, 7, 'Submitted via portal'),
  (5, 'submitted', 'under_review', 2, 1, 'Advanced to technical review'),
  (5, 'under_review', 'approved', 3, 2, 'Recommended for investment committee');

-- Assignments & scores
INSERT OR IGNORE INTO assignments (id, idea_id, round_id, evaluator_id, assigned_by, status, recommendation, overall_comment, weighted_score, completed_at, assigned_at) VALUES
  (1, 1, 2, 3, 1, 'completed', 'advance', 'Strong agronomic grounding and credible pilot data. Hardware supply chain needs a second vendor.', 78.0, '2026-11-06 16:00:00', '2026-11-04 09:00:00'),
  (2, 1, 2, 4, 1, 'in_progress', NULL, NULL, NULL, NULL, '2026-11-04 09:00:00'),
  (3, 2, 2, 4, 1, 'completed', 'advance', 'Proven PAYG model regionally; team has utility experience. Default-risk assumptions should be stress-tested.', 82.0, '2026-11-06 17:30:00', '2026-11-04 10:00:00'),
  (4, 2, 2, 5, 1, 'pending', NULL, NULL, NULL, NULL, '2026-11-05 10:00:00'),
  (5, 3, 1, 3, 1, 'completed', 'revise', 'Eligible and aligned, but the logistics cost model is incomplete.', 58.0, '2026-11-06 15:00:00', '2026-11-05 08:30:00'),
  (6, 5, 2, 3, 1, 'completed', 'advance', 'Excellent beneficiation story with export letters of intent.', 86.0, '2026-11-05 15:00:00', '2026-11-03 09:00:00'),
  (7, 5, 2, 5, 1, 'completed', 'advance', 'Financials are conservative and well-evidenced.', 84.0, '2026-11-05 16:00:00', '2026-11-03 09:00:00');

INSERT OR IGNORE INTO scores (assignment_id, criterion_id, score, comment) VALUES
  (1, 4, 8, 'Novel USSD delivery for low-smartphone areas'), (1, 5, 7, 'Subscription willingness needs more evidence'), (1, 6, 8, NULL), (1, 7, 9, 'Strong job creation'), (1, 8, 7, NULL),
  (3, 4, 7, NULL), (3, 5, 9, 'Clear demand and payment data'), (3, 6, 8, NULL), (3, 7, 9, NULL), (3, 8, 8, NULL),
  (5, 1, 6, 'Logistics costs missing'), (5, 2, 7, NULL), (5, 3, 5, NULL),
  (6, 4, 8, NULL), (6, 5, 9, NULL), (6, 6, 8, NULL), (6, 7, 9, NULL), (6, 8, 9, NULL),
  (7, 4, 8, NULL), (7, 5, 9, NULL), (7, 6, 8, NULL), (7, 7, 8, NULL), (7, 8, 9, NULL);

INSERT OR IGNORE INTO decisions (idea_id, round_id, decided_by, decision, rationale, aggregate_score) VALUES
  (1, 1, 2, 'revise', 'Revenue model needs clarification before technical review.', 62),
  (1, 1, 2, 'advance', 'Revised submission addresses concerns. Advance to technical review.', 71),
  (3, 1, 2, 'revise', 'Please add a costed logistics model and letters of intent from lodges.', 58),
  (5, 2, 2, 'approve', 'Unanimous recommendation to the Investment Committee.', 85);

INSERT OR IGNORE INTO feedback (idea_id, author_id, body, visibility) VALUES
  (1, 2, 'Thank you for the submission. Please clarify how the BWP 45/month subscription was validated with farmers.', 'submitter'),
  (1, 7, 'We ran a willingness-to-pay survey with 180 farmers in Serowe; 72% indicated they would pay BWP 40-60. Added to v2.', 'submitter'),
  (1, 3, 'Internal note: consider pairing with the Ministry of Agriculture extension officers for distribution.', 'internal'),
  (3, 2, 'Your logistics model is missing cost assumptions for the bus-courier network. Please provide a per-kg cost and partner letters.', 'submitter'),
  (5, 2, 'Congratulations - your idea has been recommended to the Investment Committee. Prepare a 10-minute pitch.', 'submitter');

INSERT OR IGNORE INTO notifications (user_id, type, title, body, link) VALUES
  (7, 'stage', 'Idea advanced to Technical Review', 'CEDA-2026-0001 is now under technical and business review.', '/app#/ideas/1'),
  (6, 'feedback', 'Revision requested', 'An adjudicator has requested changes to CEDA-2026-0003.', '/app#/ideas/3'),
  (4, 'assignment', 'New evaluation assigned', 'You have been assigned CEDA-2026-0001 for Technical Review.', '/app#/evaluate/2'),
  (5, 'assignment', 'New evaluation assigned', 'You have been assigned CEDA-2026-0002 for Technical Review.', '/app#/evaluate/4'),
  (7, 'decision', 'Recommended to Investment Committee', 'CEDA-2026-0005 has been approved for the final pitch round.', '/app#/ideas/5');

INSERT OR IGNORE INTO audit_log (actor_id, action, entity_type, entity_id, meta) VALUES
  (7, 'idea.submit', 'idea', 1, '{"ref":"CEDA-2026-0001"}'),
  (1, 'assignment.create', 'assignment', 1, '{"idea_id":1,"evaluator_id":3}'),
  (2, 'decision.create', 'decision', 1, '{"idea_id":1,"decision":"revise"}'),
  (7, 'idea.resubmit', 'idea', 1, '{"version":2}'),
  (2, 'decision.create', 'decision', 4, '{"idea_id":5,"decision":"approve"}');
`;

  // ../../../preview-tools/genspark/entry.ts
  var KEY = "ceda_genspark_preview_db_v1";
  function toParams(a) {
    return a.map((v) => v === void 0 ? null : typeof v === "boolean" ? v ? 1 : 0 : v);
  }
  function makeD1(db, onWrite) {
    const exec = (sql, params) => {
      const st = db.prepare(sql);
      st.bind(toParams(params));
      const rows = [];
      while (st.step()) rows.push(st.getAsObject());
      st.free();
      return rows;
    };
    class Stmt {
      constructor(sql, params = []) {
        this.sql = sql;
        this.params = params;
      }
      bind(...p) {
        return new Stmt(this.sql, p);
      }
      async first(col) {
        const r = exec(this.sql, this.params)[0] ?? null;
        return col && r ? r[col] : r;
      }
      async all() {
        const results = exec(this.sql, this.params);
        return { results, success: true, meta: {} };
      }
      async raw() {
        return exec(this.sql, this.params).map((r) => Object.values(r));
      }
      async run() {
        const results = exec(this.sql, this.params);
        const last = db.exec("SELECT last_insert_rowid() AS id, changes() AS c")[0].values[0];
        onWrite();
        return { results, success: true, meta: { last_row_id: last[0], changes: last[1] } };
      }
    }
    return {
      prepare: (sql) => new Stmt(sql),
      batch: async (stmts) => {
        const out = [];
        for (const s of stmts) out.push(await s.run());
        return out;
      },
      exec: async (sql) => {
        db.exec(sql);
        onWrite();
        return { count: 1, duration: 0 };
      }
    };
  }
  var ready = (async () => {
    const SQL = await (0, import_sql.default)({ locateFile: () => "/ceda-innovation-portal/genspark/static/sql-wasm.wasm" });
    let db;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) db = new SQL.Database(Uint8Array.from(atob(saved), (c) => c.charCodeAt(0)));
    } catch {
    }
    if (!db) {
      db = new SQL.Database();
      db.exec(initial_schema_default);
      db.exec(seed_default);
    }
    let t;
    const persist = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        try {
          const bytes = db.export();
          let s = "";
          for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
          localStorage.setItem(KEY, btoa(s));
        } catch {
        }
      }, 300);
    };
    return makeD1(db, persist);
  })();
  var realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    let p = url.pathname;
    if (p.startsWith("/ceda-innovation-portal/genspark/")) p = p.slice("/ceda-innovation-portal/genspark".length);
    if (url.origin === location.origin && p.startsWith("/api/")) {
      const DB = await ready;
      const req = new Request("http://preview.local" + p + url.search, {
        method: init?.method || "GET",
        headers: init?.headers,
        body: init?.body
      });
      return src_default.fetch(req, { DB }, { waitUntil() {
      }, passThroughOnException() {
      } });
    }
    return realFetch(input, init);
  };
  window.__resetPreviewDb = () => {
    localStorage.removeItem(KEY);
    location.reload();
  };
})();
