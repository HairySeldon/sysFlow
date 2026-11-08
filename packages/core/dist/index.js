var be = Object.defineProperty;
var me = (o, e, g) => e in o ? be(o, e, { enumerable: !0, configurable: !0, writable: !0, value: g }) : o[e] = g;
var Bt = (o, e, g) => me(o, typeof e != "symbol" ? e + "" : e, g);
import { useState as gt, useRef as dt, useCallback as Q, useEffect as Dt, useMemo as Xt } from "react";
import { jsxs as J, jsx as R, Fragment as Pt } from "react/jsx-runtime";
function pe(o, e, g, c) {
  const r = (u) => {
    const a = g.find(
      (B) => B.sourceId === e && B.sourcePortId === u || B.targetId === e && B.targetPortId === u
    );
    if (!a) return null;
    const C = a.sourceId === e ? a.targetId : a.sourceId, i = c[C];
    return i ? { x: i.x + i.width / 2, y: i.y + i.height / 2 } : null;
  };
  ["left", "right"].forEach((u) => {
    o[u].sort((a, C) => {
      var f, A;
      const i = ((f = r(a.id)) == null ? void 0 : f.y) ?? 0, B = ((A = r(C.id)) == null ? void 0 : A.y) ?? 0;
      return i - B;
    });
  }), ["top", "bottom"].forEach((u) => {
    o[u].sort((a, C) => {
      var f, A;
      const i = ((f = r(a.id)) == null ? void 0 : f.x) ?? 0, B = ((A = r(C.id)) == null ? void 0 : A.x) ?? 0;
      return i - B;
    });
  });
}
function xe(o, e, g, c, r, u) {
  if (!r || !u)
    return g ? "left" : "right";
  const a = c.find(
    (A) => g ? A.targetId === o && A.targetPortId === e : A.sourceId === o && A.sourcePortId === e
  );
  if (!a) return g ? "left" : "right";
  const C = g ? a.sourceId : a.targetId, i = r[C];
  if (!i) return g ? "left" : "right";
  const B = i.x + i.width / 2 - (u.x + u.width / 2), f = i.y + i.height / 2 - (u.y + u.height / 2);
  return Math.abs(B) > Math.abs(f) ? B > 0 ? "right" : "left" : f > 0 ? "bottom" : "top";
}
function vt(o, e, g = "LR", c, r) {
  const u = /* @__PURE__ */ new Map();
  if (!o || !e || !o.ports || o.ports.length === 0)
    return u;
  const a = (r == null ? void 0 : r.direction) || g, C = a === "TB" || a === "BT", i = (r == null ? void 0 : r.mode) || (C ? "strict-flow" : "perimeter-optimized"), B = c ? Array.isArray(c) ? c : Object.values(c) : [], f = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, A = new Set(
    B.filter((G) => G.targetId === o.id).map((G) => G.targetPortId)
  );
  new Set(
    B.filter((G) => G.sourceId === o.id).map((G) => G.sourcePortId)
  ), o.ports.forEach((G) => {
    let P = G.side || "auto";
    if (P !== "auto") {
      f[P].push(G);
      return;
    }
    if (i === "strict-flow") {
      const p = A.has(G.id) || G.label.toLowerCase().includes("in");
      switch (a) {
        case "BT":
          P = p ? "bottom" : "top";
          break;
        case "TB":
          P = p ? "top" : "bottom";
          break;
        case "RL":
          P = p ? "right" : "left";
          break;
        case "LR":
        default:
          P = p ? "left" : "right";
          break;
      }
    } else
      P = xe(
        o.id,
        G.id,
        A.has(G.id),
        B,
        r == null ? void 0 : r.nodeLayouts,
        e
      );
    f[P].push(G);
  }), i === "perimeter-optimized" && (r != null && r.nodeLayouts) && pe(f, o.id, B, r.nodeLayouts);
  const S = (G, P) => {
    const p = G.length;
    G.forEach((n, t) => {
      let s = 0, d = 0;
      P === "left" || P === "right" ? (d = e.height / (p + 1) * (t + 1), s = P === "left" ? 0 : e.width) : (s = e.width / (p + 1) * (t + 1), d = P === "top" ? 0 : e.height), u.set(n.id, {
        portId: n.id,
        side: P,
        localX: s,
        localY: d,
        worldX: e.x + s,
        worldY: e.y + d
      });
    });
  };
  return S(f.left, "left"), S(f.right, "right"), S(f.top, "top"), S(f.bottom, "bottom"), u;
}
function Ot(o) {
  const e = {}, g = (c) => {
    var u;
    const r = o.nodes[c];
    return new Set(((u = r == null ? void 0 : r.ports) == null ? void 0 : u.map((a) => a.id)) || []);
  };
  for (const [c, r] of Object.entries(o.edges)) {
    const u = g(r.sourceId), a = g(r.targetId), C = u.has(r.sourcePortId), i = a.has(r.targetPortId);
    C && i && (e[c] = r);
  }
  return {
    ...o,
    edges: e
  };
}
class Ge {
  static assignDynamicPortSides(e, g, c) {
    var u, a;
    const r = (C) => g[C] || c[C];
    for (const C of Object.values(e.edges)) {
      const i = r(C.sourceId), B = r(C.targetId);
      if (!i || !B) continue;
      const f = e.nodes[C.sourceId] || e.containers[C.sourceId], A = e.nodes[C.targetId] || e.containers[C.targetId], S = B.x + B.width / 2 - (i.x + i.width / 2), G = B.y + B.height / 2 - (i.y + i.height / 2), P = Math.abs(S) > Math.abs(G) * 1.25, p = (u = f == null ? void 0 : f.ports) == null ? void 0 : u.find((t) => t.id === C.sourcePortId);
      p && (!p.side || p.side === "auto") && (P ? p.side = S >= 0 ? "right" : "left" : p.side = G >= 0 ? "bottom" : "top");
      const n = (a = A == null ? void 0 : A.ports) == null ? void 0 : a.find((t) => t.id === C.targetPortId);
      n && (!n.side || n.side === "auto") && (P ? n.side = S >= 0 ? "left" : "right" : n.side = G >= 0 ? "top" : "bottom");
    }
  }
}
const Vt = 22, Qt = 18, zt = 38, Ht = 210, Ft = 36, Se = 180, Le = 54, jt = 260, $t = 160;
class Yt {
  static execute(e, g, c) {
    var n;
    const r = {}, u = {}, a = (t) => {
      var I, w, v, l, x;
      const s = !!e.containers[t], d = !!((I = e.containers[t]) != null && I.collapsed);
      return s && d ? { width: Ht, height: Ft } : s && !d ? {
        width: ((w = c.get(t)) == null ? void 0 : w.width) || jt,
        height: ((v = c.get(t)) == null ? void 0 : v.height) || $t
      } : {
        width: ((l = c.get(t)) == null ? void 0 : l.width) || Se,
        height: ((x = c.get(t)) == null ? void 0 : x.height) || Le
      };
    }, C = /* @__PURE__ */ new Map();
    for (const [t, s] of Object.entries(e.nodes)) {
      const d = s.parentId ?? null;
      C.has(d) || C.set(d, []), C.get(d).push(t);
    }
    for (const [t, s] of Object.entries(e.containers)) {
      const d = s.parentId ?? null;
      C.has(d) || C.set(d, []), C.get(d).push(t);
    }
    const i = Yt.getContainerDepths(e), B = Object.keys(e.containers).sort(
      (t, s) => (i.get(s) || 0) - (i.get(t) || 0)
    ), f = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), S = (t) => f.has(t) ? f.get(t) : a(t);
    for (const t of B) {
      if (!!((n = e.containers[t]) != null && n.collapsed)) {
        f.set(t, {
          width: Ht,
          height: Ft
        });
        continue;
      }
      const d = C.get(t) || [];
      if (d.length === 0) {
        f.set(t, {
          width: jt,
          height: $t
        });
        continue;
      }
      const I = g.arrange(t, d, e, S);
      for (const l of I.boxes)
        A.set(l.id, l);
      const w = Math.max(I.width + Vt * 2, Ht), v = I.height + zt + Qt * 2;
      f.set(t, { width: w, height: v });
    }
    const G = C.get(null) || [];
    let P = [];
    G.length > 0 && (P = g.arrange(null, G, e, S).boxes.map((s) => ({
      ...s,
      localX: s.localX + 60,
      localY: s.localY + 60
    })));
    const p = (t, s, d, I, w) => {
      var x;
      const v = !!e.containers[t], l = { id: t, x: s, y: d, width: I, height: w };
      if (v) {
        if (u[t] = l, (x = e.containers[t]) != null && x.collapsed) return;
        const k = s + Vt, Z = d + zt + Qt, E = C.get(t) || [];
        for (const h of E) {
          const L = A.get(h);
          L && p(
            h,
            k + L.localX,
            Z + L.localY,
            L.width,
            L.height
          );
        }
      } else
        r[t] = l;
    };
    for (const t of P)
      p(t.id, t.localX, t.localY, t.width, t.height);
    return Ge.assignDynamicPortSides(e, r, u), { nodes: r, containers: u };
  }
  static getContainerDepths(e) {
    const g = /* @__PURE__ */ new Map(), c = (r) => {
      var C;
      if (g.has(r)) return g.get(r);
      const u = (C = e.containers[r]) == null ? void 0 : C.parentId;
      if (!u || !e.containers[u])
        return g.set(r, 0), 0;
      const a = 1 + c(u);
      return g.set(r, a), a;
    };
    for (const r of Object.keys(e.containers))
      c(r);
    return g;
  }
}
const Ke = 70, Gt = 28;
class Ee {
  constructor(e = {}) {
    this.options = e;
  }
  arrange(e, g, c, r) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const u = this.options.direction ?? "TB", a = u === "TB" || u === "BT", C = u === "BT" || u === "RL", i = new Set(g), B = [], f = /* @__PURE__ */ new Set();
    for (const h of Object.values(c.edges)) {
      const L = this.resolveToDirectChild(h.sourceId, i, c), H = this.resolveToDirectChild(h.targetId, i, c);
      if (L && H && L !== H) {
        const M = `${L}->${H}`;
        f.has(M) || (f.add(M), B.push({ sourceId: L, targetId: H }));
      }
    }
    const A = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
    for (const h of g)
      A.set(h, 0), S.set(h, []), G.set(h, []);
    for (const h of B)
      S.get(h.sourceId).push(h.targetId), G.get(h.targetId).push(h.sourceId), A.set(h.targetId, (A.get(h.targetId) || 0) + 1);
    const P = /* @__PURE__ */ new Map(), p = g.filter((h) => (A.get(h) || 0) === 0);
    for (const h of p) P.set(h, 0);
    const n = /* @__PURE__ */ new Set();
    for (; p.length > 0; ) {
      const h = p.shift();
      n.add(h);
      const L = P.get(h);
      for (const H of S.get(h)) {
        const M = Math.max(P.get(H) || 0, L + 1);
        P.set(H, M), A.set(H, A.get(H) - 1), A.get(H) === 0 && p.push(H);
      }
    }
    for (const h of g)
      n.has(h) || P.set(h, 0);
    const t = /* @__PURE__ */ new Map();
    for (const [h, L] of P.entries())
      t.has(L) || t.set(L, []), t.get(L).push(h);
    const s = Array.from(t.keys()).sort((h, L) => h - L), d = C ? [...s].reverse() : s, I = /* @__PURE__ */ new Map(), w = (h) => {
      const L = r(h);
      return a ? L.width : L.height;
    };
    for (const h of s) {
      const L = t.get(h) || [];
      let H = -1 / 0;
      for (const M of L) {
        const T = w(M), m = G.get(M) || [];
        let b = null;
        if (m.length > 0) {
          const Y = m.map((V) => {
            const q = I.get(V);
            return q === void 0 ? null : q + w(V) / 2;
          }).filter((V) => V !== null);
          Y.length > 0 && (b = Y.reduce((V, q) => V + q, 0) / Y.length);
        }
        let K = b !== null ? b - T / 2 : 0;
        K < H + Gt && (K = H === -1 / 0 ? 0 : H + Gt), I.set(M, K), H = K + T;
      }
    }
    for (let h = s.length - 1; h >= 0; h--) {
      const L = s[h], H = t.get(L) || [];
      for (const T of H) {
        const m = S.get(T) || [];
        if (m.length === 0) continue;
        const b = m.map((K) => {
          const Y = I.get(K);
          return Y === void 0 ? null : Y + w(K) / 2;
        }).filter((K) => K !== null);
        if (b.length > 0) {
          const K = b.reduce((V, q) => V + q, 0) / b.length, Y = w(T);
          I.set(T, K - Y / 2);
        }
      }
      let M = -1 / 0;
      for (const T of H) {
        const m = w(T);
        let b = I.get(T) ?? 0;
        b < M + Gt && (b = M === -1 / 0 ? 0 : M + Gt, I.set(T, b)), M = b + m;
      }
    }
    let v = 1 / 0;
    for (const h of I.values())
      v = Math.min(v, h);
    const l = v < 0 ? -v : 0, x = [];
    let k = 0;
    for (const h of d) {
      const L = t.get(h);
      let H = 0;
      for (const M of L) {
        const T = r(M), m = a ? T.height : T.width, b = (I.get(M) ?? 0) + l, K = a ? b : k, Y = a ? k : b;
        x.push({ id: M, localX: K, localY: Y, width: T.width, height: T.height }), H = Math.max(H, m);
      }
      k += H + Ke;
    }
    const Z = Math.max(...x.map((h) => h.localX + h.width), 0), E = Math.max(...x.map((h) => h.localY + h.height), 0);
    return { width: Z, height: E, boxes: x };
  }
  resolveToDirectChild(e, g, c) {
    var u, a;
    let r = e;
    for (; r; ) {
      if (g.has(r)) return r;
      r = ((u = c.nodes[r]) == null ? void 0 : u.parentId) ?? ((a = c.containers[r]) == null ? void 0 : a.parentId) ?? null;
    }
    return null;
  }
}
const lt = 32, Ut = 24;
class Ze {
  constructor(e = 1.55) {
    this.targetAspect = e;
  }
  arrange(e, g, c, r) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const u = g.map((C) => {
      const i = r(C);
      return { id: C, width: i.width, height: i.height };
    }), a = this.findBestTightPacking(u, this.targetAspect);
    return { width: a.width, height: a.height, boxes: a.boxes };
  }
  findBestTightPacking(e, g) {
    if (e.length === 1)
      return {
        width: e[0].width,
        height: e[0].height,
        boxes: [{ id: e[0].id, localX: 0, localY: 0, width: e[0].width, height: e[0].height }],
        score: 0
      };
    const c = e.reduce((A, S) => A + S.width * S.height, 0), r = Math.max(...e.map((A) => A.width)), u = [...e].sort((A, S) => S.width - A.width), a = /* @__PURE__ */ new Set(), C = e.reduce((A, S) => A + S.width, 0) + (e.length - 1) * lt;
    a.add(C), a.add(r);
    const i = Math.max(r, Math.sqrt(c * g));
    a.add(i), a.add(i * 0.85), a.add(i * 1.15);
    const B = Math.min(e.length, 6);
    for (let A = 2; A <= B; A++) {
      let S = 0;
      for (let G = 0; G < A && G < u.length; G++)
        S += u[G].width;
      S += (A - 1) * lt, S >= r && a.add(S);
    }
    let f = null;
    for (const A of a) {
      const S = this.simulateSkylinePacking(e, A), G = S.width * S.height, P = Math.max(0, G - c), p = S.width / Math.max(1, S.height), n = Math.abs(Math.log(p / g)), t = P / c * 2 + n * 0.25;
      S.score = t, (!f || t < f.score) && (f = S);
    }
    return f;
  }
  simulateSkylinePacking(e, g) {
    const c = [...e].sort((i, B) => B.height - i.height), r = [{ x: 0, width: g, y: 0 }], u = [];
    for (const i of c) {
      let B = 1 / 0, f = -1;
      for (let t = 0; t < r.length; t++) {
        if (r[t].x + i.width > g) continue;
        let d = 0, I = 0;
        for (let w = t; w < r.length && I < i.width; w++)
          d = Math.max(d, r[w].y), I += r[w].width;
        d < B && (B = d, f = t);
      }
      if (f === -1) {
        const t = Math.max(...r.map((d) => d.y)), s = t === 0 ? 0 : t + Ut;
        u.push({ id: i.id, localX: 0, localY: s, width: i.width, height: i.height }), r.length = 0, r.push({ x: 0, width: i.width + lt, y: s + i.height }), g > i.width + lt && r.push({
          x: i.width + lt,
          width: g - (i.width + lt),
          y: 0
        });
        continue;
      }
      const A = r[f].x, S = B === 0 ? 0 : B + Ut;
      u.push({ id: i.id, localX: A, localY: S, width: i.width, height: i.height });
      const G = i.width + lt, P = S + i.height, p = { x: A, width: G, y: P }, n = [];
      for (const t of r)
        t.x + t.width <= A || t.x >= A + G ? n.push(t) : (t.x < A && n.push({ x: t.x, width: A - t.x, y: t.y }), t.x + t.width > A + G && n.push({
          x: A + G,
          width: t.x + t.width - (A + G),
          y: t.y
        }));
      n.push(p), n.sort((t, s) => t.x - s.x), r.length = 0, r.push(...n);
    }
    const a = Math.max(...u.map((i) => i.localX + i.width), 0), C = Math.max(...u.map((i) => i.localY + i.height), 0);
    return { width: a, height: C, boxes: u, score: 0 };
  }
}
function Jt(o, e, g) {
  var u, a;
  let c = o, r = null;
  for (; c; )
    g.has(c) && (r = c), c = ((u = e.nodes[c]) == null ? void 0 : u.parentId) ?? ((a = e.containers[c]) == null ? void 0 : a.parentId) ?? void 0;
  return r ?? o;
}
class ke {
  async execute(e, g, c) {
    const r = Object.values(e.containers), u = new Set(
      r.filter((A) => !!A.collapsed).map((A) => A.id)
    ), a = {};
    for (const [A, S] of Object.entries(e.edges)) {
      const G = Jt(S.sourceId, e, u), P = Jt(S.targetId, e, u);
      G !== P && (a[A] = {
        ...S,
        sourceId: G,
        targetId: P
      });
    }
    const C = {
      ...e,
      edges: a
    }, i = Object.keys(e.containers).length, f = (c != null && c.mode && c.mode !== "auto" ? c.mode : i > 0 ? "concurrent" : "flow") === "concurrent" ? new Ze((c == null ? void 0 : c.aspectRatio) ?? 1.55) : new Ee(c);
    return Yt.execute(C, f, g);
  }
}
const qt = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", He = (o) => Uint8Array.from(atob(o), (e) => e.charCodeAt(0)), _t = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", He(qt)], { type: "text/javascript;charset=utf-8" });
function De(o) {
  let e;
  try {
    if (e = _t && (self.URL || self.webkitURL).createObjectURL(_t), !e) throw "";
    const g = new Worker(e, {
      type: "module",
      name: o == null ? void 0 : o.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + qt,
      {
        type: "module",
        name: o == null ? void 0 : o.name
      }
    );
  }
}
class Pe {
  constructor() {
    Bt(this, "worker", null);
    Bt(this, "pendingRequests", /* @__PURE__ */ new Map());
    Bt(this, "fallbackEngine", new ke());
    if (typeof Worker < "u")
      try {
        this.worker = new De(), this.worker.onmessage = (e) => {
          const { id: g, success: c, layout: r, error: u } = e.data, a = this.pendingRequests.get(g);
          a && (this.pendingRequests.delete(g), c ? a.resolve(r) : a.reject(new Error(u)));
        }, this.worker.onerror = (e) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", e);
        };
      } catch (e) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", e), this.worker = null;
      }
  }
  execute(e, g, c) {
    return this.worker ? new Promise((r, u) => {
      const a = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(a, { resolve: r, reject: u });
      const C = Array.from(g.entries());
      this.worker.postMessage({
        id: a,
        graph: e,
        measurements: C,
        options: c
      });
    }) : this.fallbackEngine.execute(e, g, c);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class ve {
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: g, hoveredEntity: c, graph: r } = e;
    return c && c.id === g.id ? null : c && r.containers[c.id] ? g.parentId === c.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: c.id
      }
    } : !c && g.parentId !== null && g.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: null
      }
    } : null;
  }
}
class _e {
  constructor() {
    Bt(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: g, hoveredEdge: c, hoveredEntity: r, cursorWorld: u, startWorldPos: a, graph: C } = e, i = Math.hypot(
      u.x - a.x,
      u.y - a.y
    );
    if (r && C.containers[r.id])
      return r.id !== g.id && g.parentId !== r.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: r.id
        }
      } : null;
    if (!r && !c) {
      const f = Object.values(C.edges).filter(
        (S) => S.targetId === g.id
      ), A = Object.values(C.edges).filter(
        (S) => S.sourceId === g.id
      );
      return f.length === 1 && A.length === 1 && f[0].sourceId !== A[0].targetId && i >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: f[0].id,
          outgoingEdgeId: A[0].id
        }
      } : i >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const B = (f) => {
      const A = C.nodes[f.id] || f;
      if (!A.ports || A.ports.length === 0) return "";
      const S = Object.values(C.edges).find((p) => p.targetId === f.id);
      if (S) {
        const p = A.ports.find((n) => n.id === S.targetPortId);
        if (p) return p.id;
      }
      const G = new Set(
        Object.values(C.edges).filter((p) => p.sourceId === f.id).map((p) => p.sourcePortId)
      ), P = A.ports.find((p) => !G.has(p.id));
      return P ? P.id : A.ports[0].id;
    };
    if (c)
      return c.sourceId === g.id || c.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: c.id,
          newSourceId: c.sourceId,
          newTargetId: g.id,
          newTargetPortId: B(g)
        }
      };
    if (r && r.id !== g.id && C.nodes[r.id]) {
      const f = Object.values(C.edges).find(
        (A) => A.targetId === r.id && A.sourceId !== g.id
      );
      if (f)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: f.id,
            newSourceId: f.sourceId,
            newTargetId: g.id,
            newTargetPortId: B(g)
          }
        };
    }
    return null;
  }
}
function Ye(o, e = { min: 0.15, max: 3 }) {
  const [g, c] = gt({ x: 80, y: 80, zoom: 1 }), r = dt(!1), u = dt({ x: 0, y: 0 }), a = Q(
    (p, n) => {
      if (!o.current) return { x: p, y: n };
      const t = o.current.getBoundingClientRect();
      return {
        x: (p - t.left - g.x) / g.zoom,
        y: (n - t.top - g.y) / g.zoom
      };
    },
    [g, o]
  ), C = Q(
    (p) => {
      if (!o.current) return;
      const n = [
        ...Object.values(p.nodes),
        ...Object.values(p.containers)
      ];
      if (n.length === 0) {
        c({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, s = 1 / 0, d = -1 / 0, I = -1 / 0;
      for (const H of n)
        t = Math.min(t, H.x), s = Math.min(s, H.y), d = Math.max(d, H.x + H.width), I = Math.max(I, H.y + H.height);
      const w = o.current.getBoundingClientRect(), v = 80, l = Math.max(d - t, 100), x = Math.max(I - s, 100), k = (w.width - v * 2) / l, Z = (w.height - v * 2) / x, E = Math.min(
        Math.max(Math.min(k, Z), e.min),
        Math.min(e.max, 1.25)
      ), h = (w.width - l * E) / 2 - t * E, L = (w.height - x * E) / 2 - s * E;
      c({
        x: h,
        y: L,
        zoom: E
      });
    },
    [o, e]
  ), i = Q(
    (p) => {
      if (p.preventDefault(), !!o.current)
        if (p.ctrlKey || p.metaKey) {
          const n = o.current.getBoundingClientRect(), t = p.clientX - n.left, s = p.clientY - n.top, d = p.deltaY < 0 ? 1.08 : 0.92, I = Math.min(Math.max(g.zoom * d, e.min), e.max), w = t - (t - g.x) * (I / g.zoom), v = s - (s - g.y) * (I / g.zoom);
          c({ x: w, y: v, zoom: I });
        } else
          c((n) => ({
            ...n,
            x: n.x - p.deltaX,
            y: n.y - p.deltaY
          }));
    },
    [g, e, o]
  ), B = Q(
    (p, n) => {
      r.current = !0, u.current = { x: p - g.x, y: n - g.y };
    },
    [g]
  ), f = Q((p, n) => {
    r.current && c((t) => ({
      ...t,
      x: p - u.current.x,
      y: n - u.current.y
    }));
  }, []), A = Q(() => {
    r.current = !1;
  }, []), S = Q(() => {
    c({ x: 80, y: 80, zoom: 1 });
  }, []), G = Q(() => {
    c((p) => ({
      ...p,
      zoom: Math.min(p.zoom * 1.2, e.max)
    }));
  }, [e]), P = Q(() => {
    c((p) => ({
      ...p,
      zoom: Math.max(p.zoom / 1.2, e.min)
    }));
  }, [e]);
  return {
    transform: g,
    setTransform: c,
    screenToWorld: a,
    onWheel: i,
    startPan: B,
    updatePan: f,
    endPan: A,
    resetTransform: S,
    zoomIn: G,
    zoomOut: P,
    zoomToFit: C,
    isPanning: r
  };
}
function We(o) {
  const [e, g] = gt(
    /* @__PURE__ */ new Map()
  );
  dt(/* @__PURE__ */ new Map());
  const c = dt(/* @__PURE__ */ new Map()), r = Q((u, a) => {
    a ? c.current.set(u, a) : c.current.delete(u);
  }, []);
  return Dt(() => {
    const u = new ResizeObserver((a) => {
      let C = !1;
      const i = new Map(e);
      for (const B of a) {
        const f = B.target.getAttribute("data-sysflow-measure-id");
        if (!f) continue;
        const A = Math.ceil(B.contentRect.width), S = Math.ceil(B.contentRect.height), G = i.get(f);
        (!G || G.width !== A || G.height !== S) && (i.set(f, { width: A, height: S }), C = !0);
      }
      C && g(i);
    });
    return c.current.forEach((a) => u.observe(a)), () => {
      u.disconnect();
    };
  }, [o]), { measurements: e, registerMeasureElement: r };
}
function Ne(o, e, g, c, r) {
  const [u, a] = gt(null), [C, i] = gt(null), B = dt(null), f = dt(null), A = Q(
    (n, t) => {
      let s = null, d = 1 / 0;
      for (const [I, w] of Object.entries(e.containers))
        if (I !== t && n.x >= w.x && n.x <= w.x + w.width && n.y >= w.y && n.y <= w.y + w.height) {
          const v = w.width * w.height;
          v < d && (d = v, s = o.containers[I] || null);
        }
      if (s) return s;
      for (const [I, w] of Object.entries(e.nodes))
        if (I !== t && n.x >= w.x && n.x <= w.x + w.width && n.y >= w.y && n.y <= w.y + w.height)
          return o.nodes[I] || null;
      return null;
    },
    [e, o]
  ), S = Q(
    (n, t) => {
      let s = null, d = 45;
      for (const I of Object.values(o.edges)) {
        if (I.sourceId === t || I.targetId === t) continue;
        const w = e.nodes[I.sourceId] || e.containers[I.sourceId], v = e.nodes[I.targetId] || e.containers[I.targetId];
        if (!w || !v) continue;
        const l = w.x + w.width, x = w.y + w.height / 2, k = v.x, Z = v.y + v.height / 2;
        for (let E = 0; E <= 10; E++) {
          const h = E / 10, L = (1 - h) * l + h * k, H = (1 - h) * x + h * Z, M = Math.hypot(n.x - L, n.y - H);
          M < d && (d = M, s = I);
        }
      }
      return s;
    },
    [e, o]
  ), G = Q(
    (n, t) => {
      if (t.stopPropagation(), g.canDrag && !g.canDrag(n, o))
        return;
      const s = c(t.clientX, t.clientY);
      a({
        draggedEntity: n,
        ghostPosition: s,
        startPosition: s
      });
    },
    [o, g, c]
  ), P = Q(
    (n) => {
      if (!u) return;
      const t = c(n.clientX, n.clientY), s = A(t, u.draggedEntity.id), d = S(t, u.draggedEntity.id);
      B.current = s, f.current = d, s && o.containers[s.id] ? i(s.id) : i(null);
      const I = g.onDragMove ? g.onDragMove({
        draggedEntity: u.draggedEntity,
        cursorWorld: t,
        startWorldPos: u.startPosition,
        hoveredEntity: s,
        hoveredEdge: d,
        graph: o,
        layout: e
      }) : t;
      I && a((w) => w ? { ...w, ghostPosition: I } : null);
    },
    [u, c, g, o, e, A, S]
  ), p = Q(
    (n) => {
      if (!u) return;
      const t = c(n.clientX, n.clientY), s = A(t, u.draggedEntity.id), d = S(t, u.draggedEntity.id), I = g.onDragEnd({
        draggedEntity: u.draggedEntity,
        cursorWorld: t,
        startWorldPos: u.startPosition,
        hoveredEntity: s,
        hoveredEdge: d,
        graph: o,
        layout: e
      });
      I && r(I), a(null), i(null), B.current = null, f.current = null;
    },
    [u, c, g, o, e, A, S, r]
  );
  return {
    dragState: u,
    hoveredContainerId: C,
    handlePointerDown: G,
    handlePointerMove: P,
    handlePointerUp: p
  };
}
function Me(o, e) {
  const g = [], c = [], r = [], u = [], a = [], C = [], i = [], B = [];
  for (const [f, A] of Object.entries(e.nodes))
    o.nodes[f] ? o.nodes[f] !== A && c.push(A) : g.push(A);
  for (const f of Object.keys(o.nodes))
    e.nodes[f] || r.push(f);
  for (const [f, A] of Object.entries(e.containers))
    o.containers[f] ? o.containers[f] !== A && a.push(A) : u.push(A);
  for (const f of Object.keys(o.containers))
    e.containers[f] || C.push(f);
  for (const [f, A] of Object.entries(e.edges))
    o.edges[f] || i.push(A);
  for (const [f, A] of Object.entries(o.edges))
    e.edges[f] || B.push(A);
  return {
    createdNodes: g,
    updatedNodes: c,
    deletedNodes: r,
    createdContainers: u,
    updatedContainers: a,
    deletedContainers: C,
    createdEdges: i,
    deletedEdges: B
  };
}
function Re(o) {
  return o.createdNodes.length > 0 || o.updatedNodes.length > 0 || o.deletedNodes.length > 0 || o.deletedContainers && o.deletedContainers.length > 0 || o.createdEdges.length > 0 || o.deletedEdges.length > 0;
}
function qe(o, e) {
  const [g, c] = gt({
    history: [o],
    index: 0
  }), [r, u] = gt(null), a = dt(e);
  a.current = e;
  const C = g.history[g.index] ?? g.history[0] ?? o, i = Q((s) => {
    var I;
    const d = Ot(s);
    if ((I = a.current) != null && I.onMutate) {
      const w = Me(C, d);
      Re(w) && a.current.onMutate(w);
    }
    c((w) => {
      const v = w.history.slice(0, w.index + 1);
      return {
        history: [...v, d],
        index: v.length
      };
    });
  }, [C]), B = Q((s) => {
    const d = Ot(s);
    c({
      history: [d],
      index: 0
    });
  }, []), f = Q(() => {
    c((s) => ({
      ...s,
      index: Math.max(0, s.index - 1)
    }));
  }, []), A = Q(() => {
    c((s) => ({
      ...s,
      index: Math.min(s.history.length - 1, s.index + 1)
    }));
  }, []), S = Q(
    (s) => {
      var l;
      if (!s || s.length === 0) return;
      let d = s;
      if ((l = a.current) != null && l.canDelete) {
        const x = a.current.canDelete(s);
        if (typeof x == "boolean") {
          if (!x) return;
        } else Array.isArray(x) && (d = x);
      }
      if (d.length === 0) return;
      const I = { ...C.nodes }, w = { ...C.containers }, v = { ...C.edges };
      for (const x of d)
        delete I[x], delete w[x], delete v[x];
      i({
        ...C,
        nodes: I,
        containers: w,
        edges: v
      });
    },
    [C, i]
  ), G = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (s) => {
    const d = Math.random() * 16 | 0;
    return (s === "x" ? d : d & 3 | 8).toString(16);
  }), P = Q(
    (s) => {
      var w, v;
      const d = C, I = a.current;
      if (s.type === "ENTITY_REPARENT") {
        const { entityId: l, newParentId: x } = s.payload, k = {
          ...d,
          nodes: { ...d.nodes },
          containers: { ...d.containers }
        };
        k.nodes[l] ? k.nodes[l] = { ...k.nodes[l], parentId: x } : k.containers[l] && (k.containers[l] = { ...k.containers[l], parentId: x }), i(k);
      } else if (s.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: l, direction: x, suggestedNewNodeId: k, suggestedNewEdge1Id: Z, suggestedNewEdge2Id: E } = s.payload, h = d.edges[l.id];
        if (!h) return;
        const L = d.nodes[h.sourceId];
        if (I != null && I.canConnect && (!I.canConnect(h.sourceId, k) || !I.canConnect(k, h.targetId)))
          return;
        const H = x === "BT", M = x === "TB", T = `p_in_${Date.now()}`, m = `p_out_${Date.now() + 1}`;
        let b = "left", K = "right";
        H ? (b = "bottom", K = "top") : M ? (b = "top", K = "bottom") : x === "RL" && (b = "right", K = "left");
        const Y = (w = I == null ? void 0 : I.createNodeEntity) == null ? void 0 : w.call(I, {
          edge: h,
          direction: x,
          suggestedType: (L == null ? void 0 : L.type) || "FlowTask"
        }), V = {
          id: (Y == null ? void 0 : Y.id) || k,
          label: (Y == null ? void 0 : Y.label) || `Node ${Object.keys(d.nodes).length + 1}`,
          type: (Y == null ? void 0 : Y.type) || (L == null ? void 0 : L.type) || "FlowTask",
          parentId: (Y == null ? void 0 : Y.parentId) ?? (L == null ? void 0 : L.parentId) ?? null,
          ports: (Y == null ? void 0 : Y.ports) || [
            { id: T, label: "in", side: b },
            { id: m, label: "out", side: K }
          ],
          data: (Y == null ? void 0 : Y.data) || {},
          ...Y
        }, q = V.ports.find((rt) => rt.label.toLowerCase().includes("in")) || V.ports.find((rt) => rt.side === (H ? "bottom" : "top")) || V.ports[0], It = V.ports.find((rt) => rt.label.toLowerCase().includes("out")) || V.ports.find((rt) => rt.side === (H ? "top" : "bottom")) || V.ports[V.ports.length - 1], ot = q ? q.id : T, X = It ? It.id : m, _ = {
          id: Z,
          sourceId: h.sourceId,
          sourcePortId: h.sourcePortId,
          targetId: V.id,
          targetPortId: ot
        }, tt = {
          id: E,
          sourceId: V.id,
          sourcePortId: X,
          targetId: h.targetId,
          targetPortId: h.targetPortId
        }, $ = { ...d.edges };
        delete $[h.id], $[Z] = _, $[E] = tt, i({
          ...d,
          nodes: { ...d.nodes, [V.id]: V },
          edges: $
        });
      } else if (s.type === "NODE_EXTRACT") {
        const { incomingEdgeId: l, outgoingEdgeId: x } = s.payload, k = d.edges[l], Z = d.edges[x];
        if (!k || !Z || I != null && I.canConnect && !I.canConnect(k.sourceId, Z.targetId))
          return;
        const E = { ...d.edges };
        delete E[l], delete E[x];
        const h = G();
        E[h] = {
          id: h,
          sourceId: k.sourceId,
          sourcePortId: k.sourcePortId,
          targetId: Z.targetId,
          targetPortId: Z.targetPortId
        }, i({
          ...d,
          edges: E
        });
      } else if (s.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: l, position: x, direction: k, suggestedNewNodeId: Z, suggestedNewEdgeId: E } = s.payload, h = k === "BT", L = `p_in_${Date.now()}`, H = `p_out_${Date.now() + 1}`, M = h && x === "bottom" || !h && x === "top", T = M ? Z : l.id, m = M ? l.id : Z;
        if (I != null && I.canConnect && !I.canConnect(T, m))
          return;
        const b = (v = I == null ? void 0 : I.createNodeEntity) == null ? void 0 : v.call(I, {
          sourceNode: l,
          position: x,
          direction: k,
          suggestedType: l.type
        }), K = {
          id: (b == null ? void 0 : b.id) || Z,
          label: (b == null ? void 0 : b.label) || `Node ${Object.keys(d.nodes).length + 1}`,
          type: (b == null ? void 0 : b.type) || l.type,
          ports: (b == null ? void 0 : b.ports) || [
            { id: L, label: "in", side: h ? "bottom" : "top" },
            { id: H, label: "out", side: h ? "top" : "bottom" }
          ],
          data: (b == null ? void 0 : b.data) || {},
          parentId: (b == null ? void 0 : b.parentId) ?? (l == null ? void 0 : l.parentId) ?? null,
          ...b
        }, Y = K.ports.find((tt) => tt.label.toLowerCase().includes("in")) || K.ports.find((tt) => tt.side === (h ? "bottom" : "top")) || K.ports[0], V = K.ports.find((tt) => tt.label.toLowerCase().includes("out")) || K.ports.find((tt) => tt.side === (h ? "top" : "bottom")) || K.ports[K.ports.length - 1], q = Y ? Y.id : L, It = V ? V.id : H, ot = l.ports.find((tt) => tt.label === "in") || l.ports[0], X = l.ports.find((tt) => tt.label === "out") || l.ports[l.ports.length - 1];
        let _;
        M ? _ = {
          id: E,
          sourceId: K.id,
          sourcePortId: It,
          targetId: l.id,
          targetPortId: (ot == null ? void 0 : ot.id) || "in"
        } : _ = {
          id: E,
          sourceId: l.id,
          sourcePortId: (X == null ? void 0 : X.id) || "out",
          targetId: K.id,
          targetPortId: q
        }, i({
          ...d,
          nodes: { ...d.nodes, [K.id]: K },
          edges: { ...d.edges, [E]: _ }
        });
      } else if (s.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: l, collapsed: x } = s.payload;
        d.containers[l] && i({
          ...d,
          containers: {
            ...d.containers,
            [l]: { ...d.containers[l], collapsed: x }
          }
        });
      } else if (s.type === "NODE_UPDATE") {
        const { id: l, updates: x } = s.payload;
        d.nodes[l] && i({
          ...d,
          nodes: {
            ...d.nodes,
            [l]: { ...d.nodes[l], ...x }
          }
        });
      } else if (s.type === "EDGE_CREATE") {
        const l = s.payload.edge, x = l.sourceId, k = l.targetId, Z = l.sourcePortId, E = l.targetPortId;
        if (I != null && I.canConnect && !I.canConnect(x, k, Z, E))
          return;
        const h = s.payload.id || l.id || G();
        i({
          ...d,
          edges: {
            ...d.edges,
            [h]: { id: h, ...l }
          }
        });
      } else if (s.type === "EDGE_DELETE") {
        const l = s.payload.edgeId || s.payload.id, x = { ...d.edges };
        delete x[l], i({ ...d, edges: x });
      } else if (s.type === "EDGE_REWIRE") {
        const { edgeId: l, newTargetId: x, newTargetPortId: k } = s.payload;
        if (!x || !d.edges[l]) return;
        const Z = x, E = d.edges[l], h = E.sourceId, L = E.targetId;
        if (Z === h || Z === L) return;
        const H = Object.values(d.edges).find((X) => X.targetId === Z), M = Object.values(d.edges).find((X) => X.sourceId === Z), T = H && M && H.sourceId !== M.targetId;
        if (I != null && I.canConnect && (T && !I.canConnect(H.sourceId, M.targetId) || !I.canConnect(h, Z) || !I.canConnect(Z, L)))
          return;
        const m = { ...d.edges };
        if (T) {
          delete m[H.id], delete m[M.id];
          const X = G();
          m[X] = {
            id: X,
            sourceId: H.sourceId,
            sourcePortId: H.sourcePortId,
            targetId: M.targetId,
            targetPortId: M.targetPortId
          };
        } else
          H && delete m[H.id], M && delete m[M.id];
        const b = d.nodes[Z], K = k && (b == null ? void 0 : b.ports.find((X) => X.id === k)) || (b == null ? void 0 : b.ports.find((X) => {
          var _;
          return (_ = X.label) == null ? void 0 : _.toLowerCase().includes("in");
        })) || (b == null ? void 0 : b.ports.find((X) => X.side === "bottom")) || (b == null ? void 0 : b.ports[0]), Y = (b == null ? void 0 : b.ports.find((X) => {
          var _;
          return X.id !== (K == null ? void 0 : K.id) && ((_ = X.label) == null ? void 0 : _.toLowerCase().includes("out"));
        })) || (b == null ? void 0 : b.ports.find((X) => X.id !== (K == null ? void 0 : K.id) && X.side === "top")) || (b == null ? void 0 : b.ports.find((X) => X.id !== (K == null ? void 0 : K.id))) || K, V = (K == null ? void 0 : K.id) || "p_in", q = (Y == null ? void 0 : Y.id) || "p_out";
        delete m[l];
        const It = G();
        m[It] = {
          id: It,
          sourceId: h,
          sourcePortId: E.sourcePortId,
          targetId: Z,
          targetPortId: V
        };
        const ot = G();
        m[ot] = {
          id: ot,
          sourceId: Z,
          sourcePortId: q,
          targetId: L,
          targetPortId: E.targetPortId
        }, i({ ...d, edges: m });
      } else {
        const l = s;
        if (l.type === "NODE_DELETE" || l.type === "DELETE_SELECTION" || l.type === "SELECTION_DELETE") {
          const x = l.payload || {}, k = [];
          x.nodeId && k.push(x.nodeId), x.id && k.push(x.id), Array.isArray(x.selectedIds) && k.push(...x.selectedIds), Array.isArray(x.ids) && k.push(...x.ids), S(k);
        }
      }
    },
    [C, i, S]
  ), p = Q(
    (s) => {
      const d = C.nodes[s] || C.containers[s];
      d && u({ entity: JSON.parse(JSON.stringify(d)), isCut: !1 });
    },
    [C]
  ), n = Q(
    (s) => {
      const d = C.nodes[s] || C.containers[s];
      if (d) {
        u({ entity: JSON.parse(JSON.stringify(d)), isCut: !0 });
        const I = { ...C.nodes }, w = { ...C.containers };
        delete I[s], delete w[s], i({ ...C, nodes: I, containers: w });
      }
    },
    [C, i]
  ), t = Q(() => {
    if (!r) return;
    const s = r.entity, d = `${s.id}_copy_${Date.now().toString().slice(-4)}`, I = { ...s, id: d, label: `${s.label} (Copy)` };
    "collapsed" in I ? i({
      ...C,
      containers: { ...C.containers, [d]: I }
    }) : i({
      ...C,
      nodes: { ...C.nodes, [d]: I }
    });
  }, [r, C, i]);
  return {
    graph: C,
    setGraphDirect: B,
    applyAction: P,
    undo: f,
    redo: A,
    copyEntity: p,
    cutEntity: n,
    pasteEntity: t,
    deleteSelection: S,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Te = ({
  graph: o,
  registerMeasureElement: e,
  nodeTypes: g,
  containerTypes: c
}) => {
  const r = Object.values(o.nodes), u = Object.values(o.containers);
  return /* @__PURE__ */ J("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    r.map((a) => {
      const C = a.type ? g == null ? void 0 : g[a.type] : null;
      return /* @__PURE__ */ R(
        "div",
        {
          ref: (i) => e(a.id, i),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: C ? /* @__PURE__ */ R(C, { node: a, selected: !1 }) : /* @__PURE__ */ J("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ R("div", { style: { fontWeight: 600 }, children: a.label }),
            a.ports.length > 0 && /* @__PURE__ */ J("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              a.ports.map((i) => i.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${a.id}`
      );
    }),
    u.map((a) => {
      const C = a.type ? c == null ? void 0 : c[a.type] : null;
      return /* @__PURE__ */ R(
        "div",
        {
          ref: (i) => e(a.id, i),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: C ? /* @__PURE__ */ R(C, { container: a, selected: !1 }) : /* @__PURE__ */ R("div", { className: "sysflow-container-header", children: a.label })
        },
        `measure-container-${a.id}`
      );
    })
  ] });
}, Xe = ({
  graph: o,
  layout: e,
  selectedIds: g,
  direction: c = "TB",
  showArrows: r = !0,
  routing: u = "auto",
  portOptions: a,
  enableEdgeQuickAdd: C = !0,
  onEdgeClick: i,
  onInsertNodeOnEdge: B
}) => {
  const [f, A] = gt(null), S = u === "step" || u === "auto" && (c === "LR" || c === "RL"), G = (n, t, s) => {
    var L, H, M, T;
    let d = n, I = null;
    for ((L = o.containers[n]) != null && L.collapsed && (I = o.containers[n]); d; ) {
      const m = ((H = o.nodes[d]) == null ? void 0 : H.parentId) ?? ((M = o.containers[d]) == null ? void 0 : M.parentId) ?? null;
      m && ((T = o.containers[m]) != null && T.collapsed) && (I = o.containers[m]), d = m;
    }
    if (I) {
      const m = e.containers[I.id];
      if (!m)
        return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: I.id };
      let b, K, Y;
      return c === "TB" ? (b = s ? "bottom" : "top", K = m.x + m.width / 2, Y = s ? m.y + m.height : m.y) : c === "BT" ? (b = s ? "top" : "bottom", K = m.x + m.width / 2, Y = s ? m.y : m.y + m.height) : c === "RL" ? (b = s ? "left" : "right", K = s ? m.x : m.x + m.width, Y = m.y + m.height / 2) : (b = s ? "right" : "left", K = s ? m.x + m.width : m.x, Y = m.y + m.height / 2), { x: K, y: Y, side: b, valid: !0, entityId: I.id };
    }
    if (!!o.containers[n]) {
      const m = e.containers[n];
      if (!m) return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
      let b, K, Y;
      return c === "TB" ? (b = m.x + m.width / 2, K = s ? m.y + m.height : m.y, Y = s ? "bottom" : "top") : c === "BT" ? (b = m.x + m.width / 2, K = s ? m.y : m.y + m.height, Y = s ? "top" : "bottom") : c === "RL" ? (b = s ? m.x : m.x + m.width, K = m.y + m.height / 2, Y = s ? "left" : "right") : (b = s ? m.x + m.width : m.x, K = m.y + m.height / 2, Y = s ? "right" : "left"), { x: b, y: K, side: Y, valid: !0, entityId: n };
    }
    const v = o.nodes[n], l = e.nodes[n];
    if (!v || !l)
      return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
    const k = vt(
      v,
      l,
      c,
      o.edges,
      a
    ).get(t);
    if (k)
      return { x: k.worldX, y: k.worldY, side: k.side, valid: !0, entityId: n };
    let Z, E, h;
    return c === "TB" ? (Z = l.x + l.width / 2, E = s ? l.y + l.height : l.y, h = s ? "bottom" : "top") : c === "BT" ? (Z = l.x + l.width / 2, E = s ? l.y : l.y + l.height, h = s ? "top" : "bottom") : c === "RL" ? (Z = s ? l.x : l.x + l.width, E = l.y + l.height / 2, h = s ? "left" : "right") : (Z = s ? l.x + l.width : l.x, E = l.y + l.height / 2, h = s ? "right" : "left"), { x: Z, y: E, side: h, valid: !0, entityId: n };
  }, P = (n, t) => {
    const s = (n.x + t.x) / 2, d = (n.y + t.y) / 2;
    if (n.side === "right" && t.side === "left") {
      if (t.x >= n.x + 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x + 20} ${n.y} L ${n.x + 20} ${I} L ${t.x - 20} ${I} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: I }
        };
      }
    }
    if (n.side === "left" && t.side === "right") {
      if (t.x <= n.x - 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x - 20} ${n.y} L ${n.x - 20} ${I} L ${t.x + 20} ${I} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: I }
        };
      }
    }
    if (n.side === "bottom" && t.side === "top") {
      if (t.y >= n.y + 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${d} L ${t.x} ${d} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y + 20} L ${I} ${n.y + 20} L ${I} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: I, y: d }
        };
      }
    }
    if (n.side === "top" && t.side === "bottom") {
      if (t.y <= n.y - 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${d} L ${t.x} ${d} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y - 20} L ${I} ${n.y - 20} L ${I} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: I, y: d }
        };
      }
    }
    return {
      pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
      center: { x: s, y: d }
    };
  }, p = (n, t) => {
    const s = t.x - n.x, d = t.y - n.y;
    let I = n.x, w = n.y, v = t.x, l = t.y;
    if (n.side === "bottom" && t.side === "top")
      if (d > 0) {
        const Z = Math.min(28, d * 0.4);
        w = n.y + Math.max(Z, d * 0.5), l = t.y - Math.max(Z, d * 0.5);
      } else {
        const Z = s >= 0 ? 1 : -1, E = Math.max(40, Math.abs(s) * 0.2);
        I = n.x + E * Z, w = n.y + 40, v = t.x + E * Z, l = t.y - 40;
      }
    else if (n.side === "top" && t.side === "bottom")
      if (d < 0) {
        const Z = Math.min(28, Math.abs(d) * 0.4);
        w = n.y - Math.max(Z, Math.abs(d) * 0.5), l = t.y + Math.max(Z, Math.abs(d) * 0.5);
      } else {
        const Z = s >= 0 ? 1 : -1, E = Math.max(40, Math.abs(s) * 0.2);
        I = n.x + E * Z, w = n.y - 40, v = t.x + E * Z, l = t.y + 40;
      }
    else if (n.side === "right" && t.side === "left")
      s > 0 ? (I = n.x + s * 0.5, v = t.x - s * 0.5) : (I = n.x + 50, w = n.y - 50, v = t.x - 50, l = t.y - 50);
    else if (n.side === "left" && t.side === "right")
      s < 0 ? (I = n.x + s * 0.5, v = t.x - s * 0.5) : (I = n.x - 50, w = n.y - 50, v = t.x + 50, l = t.y - 50);
    else {
      const Z = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, E = Z[n.side] || { x: 0, y: 1 }, h = Z[t.side] || { x: 0, y: -1 }, L = Math.min(60, Math.hypot(s, d) * 0.35);
      I = n.x + E.x * L, w = n.y + E.y * L, v = t.x + h.x * L, l = t.y + h.y * L;
    }
    const x = 0.125 * n.x + 0.375 * I + 0.375 * v + 0.125 * t.x, k = 0.125 * n.y + 0.375 * w + 0.375 * l + 0.125 * t.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${I} ${w} ${v} ${l} ${t.x} ${t.y}`,
      center: { x, y: k }
    };
  };
  return /* @__PURE__ */ J("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ J("defs", { children: [
      /* @__PURE__ */ R(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ R("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ R(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ R("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(o.edges).map((n) => {
      const t = G(n.sourceId, n.sourcePortId, !0), s = G(n.targetId, n.targetPortId, !1);
      if (!t.valid || !s.valid || t.entityId === s.entityId) return null;
      const d = g.includes(n.id), I = f === n.id, { pathStr: w, center: v } = S ? P(t, s) : p(t, s);
      return /* @__PURE__ */ J(
        "g",
        {
          onMouseEnter: () => A(n.id),
          onMouseLeave: () => A(null),
          children: [
            /* @__PURE__ */ R(
              "path",
              {
                d: w,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (l) => {
                  l.stopPropagation(), i == null || i(n.id);
                }
              }
            ),
            /* @__PURE__ */ R(
              "path",
              {
                d: w,
                fill: "none",
                stroke: d ? "var(--sysflow-edge-selected)" : I ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: d ? 2.5 : I ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: r ? d ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            C && I && B && /* @__PURE__ */ R("g", { transform: `translate(${v.x}, ${v.y})`, children: /* @__PURE__ */ J(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (l) => {
                  l.preventDefault(), l.stopPropagation(), B(n);
                },
                children: [
                  /* @__PURE__ */ R("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ R(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ R(
                    "text",
                    {
                      x: 0,
                      y: 0,
                      textAnchor: "middle",
                      dominantBaseline: "central",
                      fill: "#ffffff",
                      fontSize: 14,
                      fontWeight: "bold",
                      style: { userSelect: "none", pointerEvents: "none" },
                      children: "+"
                    }
                  )
                ]
              }
            ) })
          ]
        },
        n.id
      );
    })
  ] });
}, Oe = ({
  entity: o,
  layout: e,
  direction: g = "LR",
  edges: c,
  portOptions: r,
  onPortPointerDown: u,
  onPortPointerUp: a
}) => {
  if (!o.ports || o.ports.length === 0)
    return null;
  const C = vt(
    o,
    e,
    g,
    c,
    r
  );
  return /* @__PURE__ */ R(Pt, { children: o.ports.map((i) => {
    const B = C.get(i.id);
    return B ? /* @__PURE__ */ R(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${B.side}`,
        style: {
          position: "absolute",
          left: `${B.localX}px`,
          top: `${B.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${i.label} (${B.side})`,
        onPointerDown: (f) => {
          f.stopPropagation(), u == null || u(o.id, i.id, !0, f);
        },
        onPointerUp: (f) => {
          f.stopPropagation(), a == null || a(o.id, i.id, !1);
        }
      },
      i.id
    ) : null;
  }) });
}, Ve = ({
  node: o,
  layout: e,
  selected: g = !1,
  direction: c = "LR",
  edges: r,
  portOptions: u,
  enableQuickAdd: a = !1,
  onAddConnectedNode: C,
  onPointerDown: i,
  onMouseEnter: B,
  onMouseLeave: f,
  onClick: A,
  onPortPointerDown: S,
  onPortPointerUp: G,
  customRenderer: P
}) => {
  const [p, n] = gt(!1);
  return /* @__PURE__ */ J(
    "div",
    {
      className: `sysflow-node ${g ? "sysflow-selected" : ""} ${o.className || ""}`,
      style: {
        transform: `translate(${e.x}px, ${e.y}px)`,
        width: `${e.width}px`,
        height: `${e.height}px`
      },
      onPointerDown: (t) => i == null ? void 0 : i(o, t),
      onMouseEnter: () => {
        n(!0), B == null || B(o.id);
      },
      onMouseLeave: () => {
        n(!1), f == null || f(o.id);
      },
      onClick: A,
      children: [
        a && p && /* @__PURE__ */ J(Pt, { children: [
          /* @__PURE__ */ R("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ R("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        a && p && C && /* @__PURE__ */ R(
          "button",
          {
            type: "button",
            className: "sysflow-quick-add-btn sysflow-quick-add-top",
            title: "Add connected node above",
            onPointerDown: (t) => {
              t.stopPropagation();
            },
            onPointerUp: (t) => {
              t.stopPropagation();
            },
            onClick: (t) => {
              t.preventDefault(), t.stopPropagation(), C(o, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ R(
          Oe,
          {
            entity: o,
            layout: e,
            direction: c,
            edges: r,
            portOptions: u,
            onPortPointerDown: S,
            onPortPointerUp: G
          }
        ),
        P ? /* @__PURE__ */ R(P, { node: o, selected: g }) : /* @__PURE__ */ J("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ R("div", { style: { fontWeight: 600, fontSize: "13px" }, children: o.label }),
          o.ports.length > 0 && /* @__PURE__ */ J("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            o.ports.length,
            " Port",
            o.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        a && p && C && /* @__PURE__ */ R(
          "button",
          {
            className: "sysflow-quick-add-btn sysflow-quick-add-bottom",
            title: "Add connected node below",
            onPointerDown: (t) => {
              t.stopPropagation();
            },
            onPointerUp: (t) => {
              t.stopPropagation();
            },
            onClick: (t) => {
              t.preventDefault(), t.stopPropagation(), C(o, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Qe = ({
  container: o,
  layout: e,
  selected: g,
  isHovered: c = !1,
  hasChildren: r = !1,
  onToggleCollapse: u,
  onPointerDown: a,
  onMouseEnter: C,
  onMouseLeave: i,
  onClick: B,
  customRenderer: f
}) => /* @__PURE__ */ R(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${c ? "sysflow-hovered" : ""} ${o.className || ""}`,
    style: {
      transform: `translate(${e.x}px, ${e.y}px)`,
      width: `${e.width}px`,
      height: `${e.height}px`
    },
    onPointerDown: (A) => a(o, A),
    onMouseEnter: C,
    onMouseLeave: i,
    onClick: B,
    children: f ? /* @__PURE__ */ R(
      f,
      {
        container: o,
        selected: g,
        hasChildren: r,
        onToggleCollapse: u
      }
    ) : /* @__PURE__ */ J(Pt, { children: [
      /* @__PURE__ */ J("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ R("span", { className: "sysflow-container-title", title: o.label, children: o.label }),
        /* @__PURE__ */ R(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (A) => A.stopPropagation(),
            onPointerUp: (A) => A.stopPropagation(),
            onClick: (A) => {
              A.stopPropagation(), u(o.id, !o.collapsed);
            },
            children: o.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !o.collapsed && !r && /* @__PURE__ */ R("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), ze = {
  bg: "--sysflow-bg",
  grid: "--sysflow-grid",
  nodeBg: "--sysflow-node-bg",
  nodeBorder: "--sysflow-node-border",
  nodeSelected: "--sysflow-node-selected",
  nodeText: "--sysflow-node-text",
  nodeSubtext: "--sysflow-node-subtext",
  containerBg: "--sysflow-container-bg",
  containerHeaderBg: "--sysflow-container-header-bg",
  containerBorder: "--sysflow-container-border",
  containerHover: "--sysflow-container-hover",
  edgeStroke: "--sysflow-edge-stroke",
  edgeSelected: "--sysflow-edge-selected",
  portBg: "--sysflow-port-bg",
  portHover: "--sysflow-port-hover",
  panelBg: "--sysflow-panel-bg",
  panelBorder: "--sysflow-panel-border",
  panelBtnBg: "--sysflow-panel-btn-bg",
  panelBtnHover: "--sysflow-panel-btn-hover",
  panelBtnText: "--sysflow-panel-btn-text",
  shadow: "--sysflow-shadow"
};
function Fe(o) {
  if (!o) return {};
  const e = {};
  for (const [g, c] of Object.entries(o))
    if (c !== void 0) {
      const r = ze[g] || `--sysflow-${g.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      e[r] = c;
    }
  return e;
}
const je = new ve(), tn = ({
  graph: o,
  onChange: e,
  history: g,
  enableShortcuts: c = !0,
  onNodeClick: r,
  onEdgeClick: u,
  layoutEngine: a,
  interactionStrategy: C = je,
  direction: i = "TB",
  layoutOptions: B,
  portPlacementMode: f,
  routing: A,
  showEdgeArrows: S = !0,
  nodeTypes: G,
  containerTypes: P,
  zoomBounds: p,
  className: n = "",
  selectedIds: t = [],
  theme: s = "dark",
  themeTokens: d,
  style: I,
  enableQuickAdd: w,
  enableEdgeQuickAdd: v,
  onNodeCreate: l,
  onEdgeCreate: x,
  onNodeDelete: k,
  onContainerDelete: Z,
  onEdgeDelete: E
}) => {
  var Nt, Mt;
  const h = dt(null), L = dt(null);
  !a && !L.current && (L.current = new Pe());
  const H = a || L.current, {
    transform: M,
    screenToWorld: T,
    onWheel: m,
    startPan: b,
    updatePan: K,
    endPan: Y,
    resetTransform: V,
    zoomIn: q,
    zoomOut: It,
    zoomToFit: ot,
    isPanning: X
  } = Ye(h, p), { measurements: _, registerMeasureElement: tt } = We(o), [$, rt] = gt({ nodes: {}, containers: {} }), St = Xt(() => ({
    direction: i,
    mode: f ?? (i === "TB" || i === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: $.nodes
  }), [i, f, $.nodes]), [j, bt] = gt(null), [U, mt] = gt(null), Lt = dt(!1), {
    dragState: ct,
    hoveredContainerId: te,
    handlePointerDown: Wt,
    handlePointerMove: ee,
    handlePointerUp: ne
  } = Ne(o, $, C, T, e);
  Dt(() => {
    const y = (D) => {
      var it, F, at, ht;
      if (D.target instanceof HTMLInputElement || D.target instanceof HTMLTextAreaElement || D.target instanceof HTMLElement && D.target.isContentEditable)
        return;
      const N = D.ctrlKey || D.metaKey, O = D.key.toLowerCase();
      if (D.key === "Delete" || D.key === "Backspace") {
        if (D.preventDefault(), t.length > 0) {
          if (k || E || Z)
            for (const et of t)
              o.nodes[et] ? k == null || k(et) : o.containers[et] ? (it = Z || k) == null || it(et) : o.edges[et] && (E == null || E(et));
          g != null && g.deleteSelection && g.deleteSelection(t), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        }
        return;
      }
      if (c !== !1 && g) {
        if (N && O === "z") {
          D.preventDefault(), D.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (N && O === "y") {
          D.preventDefault(), g.redo();
          return;
        }
        if (N && O === "c" && t[0]) {
          D.preventDefault(), (F = g.copyEntity) == null || F.call(g, t[0]);
          return;
        }
        if (N && O === "x" && t[0]) {
          D.preventDefault(), (at = g.cutEntity) == null || at.call(g, t[0]);
          return;
        }
        if (N && O === "v") {
          D.preventDefault(), (ht = g.pasteEntity) == null || ht.call(g);
          return;
        }
      }
      if (D.key === "Escape") {
        D.preventDefault(), mt(null), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (D.code === "Space" && (Lt.current = !0), D.key.toLowerCase() === "f" && !N) {
        D.preventDefault(), ot($);
        return;
      }
      if (N && O === "a") {
        D.preventDefault();
        const et = [
          ...Object.keys(o.nodes),
          ...Object.keys(o.containers)
        ];
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: et } });
        return;
      }
      const z = Object.keys(o.nodes);
      if (z.length !== 0 && D.key === "Tab") {
        D.preventDefault();
        const et = t.length > 0 ? z.indexOf(t[0]) : -1;
        let Ct;
        D.shiftKey ? Ct = et <= 0 ? z.length - 1 : et - 1 : Ct = (et + 1) % z.length, e({ type: "SELECTION_CHANGE", payload: { selectedIds: [z[Ct]] } });
        return;
      }
    }, W = (D) => {
      D.code === "Space" && (Lt.current = !1);
    };
    return window.addEventListener("keydown", y), window.addEventListener("keyup", W), () => {
      window.removeEventListener("keydown", y), window.removeEventListener("keyup", W);
    };
  }, [o, $, t, ot, e, g, c, k, E]);
  const se = Q(
    (y, W) => {
      const D = ut(), N = ut(), O = i === "BT", z = O && W === "bottom" || !O && W === "top";
      l && x ? (l({
        id: D,
        type: y.type || "FlowTask",
        label: `New ${y.type || "Task"}`,
        parentId: y.parentId ?? null
      }), z ? x(D, y.id, N) : x(y.id, D, N)) : e({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: y,
          position: W,
          direction: i,
          suggestedNewNodeId: D,
          suggestedNewEdgeId: N
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [D] }
      });
    },
    [i, e, l, x]
  ), oe = Q(
    (y) => {
      const W = ut(), D = ut(), N = ut(), O = o.nodes[y.sourceId], z = (O == null ? void 0 : O.type) || "FlowTask";
      l && x && E ? (E(y.id), l({
        id: W,
        type: z,
        label: `New ${z}`,
        parentId: (O == null ? void 0 : O.parentId) ?? null
      }), x(y.sourceId, W, D), x(W, y.targetId, N)) : e({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: y,
          direction: i,
          suggestedNewNodeId: W,
          suggestedNewEdge1Id: D,
          suggestedNewEdge2Id: N
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [W] }
      });
    },
    [i, o.nodes, e, l, x, E]
  );
  Dt(() => {
    let y = !1, W = 16 / 9;
    if (h.current) {
      const N = h.current.getBoundingClientRect();
      N.width > 0 && N.height > 0 && (W = N.width / N.height);
    }
    const D = {
      direction: i,
      aspectRatio: W,
      ...B
    };
    return H.execute(o, _, D).then((N) => {
      y || rt(N);
    }), () => {
      y = !0;
    };
  }, [o, _, H, i, B]);
  const ge = (y, W, D, N) => {
    const O = o.nodes[y] || o.containers[y], z = $.nodes[y] || $.containers[y];
    if (!O || !z) return;
    const F = vt(
      O,
      z,
      i,
      o.edges,
      St
    ).get(W), at = F ? { x: F.worldX, y: F.worldY } : { x: z.x + z.width, y: z.y + z.height / 2 };
    bt({
      sourceId: y,
      sourcePortId: W,
      startWorldPos: at,
      currentWorldPos: T(N.clientX, N.clientY)
    });
  }, ie = (y, W, D) => {
    var N, O, z, it, F, at, ht, et, Ct, Rt;
    if (j && j.sourceId !== y) {
      const Kt = o.nodes[j.sourceId] || o.containers[j.sourceId], Et = o.nodes[y] || o.containers[y], nt = (N = Kt == null ? void 0 : Kt.ports) == null ? void 0 : N.find((At) => At.id === j.sourcePortId), st = (O = Et == null ? void 0 : Et.ports) == null ? void 0 : O.find((At) => At.id === W);
      let ft = j.sourceId, pt = j.sourcePortId, yt = y, xt = W;
      const ue = ((z = nt == null ? void 0 : nt.label) == null ? void 0 : z.toLowerCase().includes("in")) || (nt == null ? void 0 : nt.side) === (i === "BT" ? "bottom" : "top"), he = ((it = nt == null ? void 0 : nt.label) == null ? void 0 : it.toLowerCase().includes("out")) || (nt == null ? void 0 : nt.side) === (i === "BT" ? "top" : "bottom"), fe = ((F = st == null ? void 0 : st.label) == null ? void 0 : F.toLowerCase().includes("in")) || (st == null ? void 0 : st.side) === (i === "BT" ? "bottom" : "top"), ye = ((at = st == null ? void 0 : st.label) == null ? void 0 : at.toLowerCase().includes("out")) || (st == null ? void 0 : st.side) === (i === "BT" ? "top" : "bottom");
      if (ue && ye)
        ft = y, pt = W, yt = j.sourceId, xt = j.sourcePortId;
      else if (he && fe)
        ft = j.sourceId, pt = j.sourcePortId, yt = y, xt = W;
      else if ($.nodes[j.sourceId] && $.nodes[y]) {
        const At = $.nodes[j.sourceId], Tt = $.nodes[y], we = i === "BT" && At.y < Tt.y, Be = i === "TB" && At.y > Tt.y;
        if (we || Be) {
          ft = y, yt = j.sourceId;
          const Zt = o.nodes[ft], kt = o.nodes[yt];
          pt = ((et = (ht = Zt == null ? void 0 : Zt.ports) == null ? void 0 : ht.find((wt) => wt.label.includes("out") || wt.side === (i === "BT" ? "top" : "bottom"))) == null ? void 0 : et.id) || W, xt = ((Rt = (Ct = kt == null ? void 0 : kt.ports) == null ? void 0 : Ct.find((wt) => wt.label.includes("in") || wt.side === (i === "BT" ? "bottom" : "top"))) == null ? void 0 : Rt.id) || j.sourcePortId;
        }
      }
      e({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: ft,
            sourcePortId: pt,
            targetId: yt,
            targetPortId: xt
          }
        }
      });
    }
    bt(null);
  }, de = (y) => {
    if (y.button === 1 || Lt.current) {
      b(y.clientX, y.clientY);
      return;
    }
    const W = y.target, D = W === h.current || W.classList.contains("sysflow-viewport") || W.classList.contains("sysflow-dom-layer") || W.tagName.toLowerCase() === "svg";
    if (y.button === 0 && D) {
      y.currentTarget.setPointerCapture(y.pointerId);
      const N = T(y.clientX, y.clientY);
      mt({
        startX: N.x,
        startY: N.y,
        currentX: N.x,
        currentY: N.y
      }), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Ie = (y) => {
    if (X.current)
      K(y.clientX, y.clientY);
    else if (U) {
      const W = T(y.clientX, y.clientY);
      mt((D) => D ? { ...D, currentX: W.x, currentY: W.y } : null);
    } else ct ? ee(y) : j && bt(
      (W) => W ? { ...W, currentWorldPos: T(y.clientX, y.clientY) } : null
    );
  }, re = (y) => {
    if (y.currentTarget.hasPointerCapture(y.pointerId) && y.currentTarget.releasePointerCapture(y.pointerId), X.current && Y(), U) {
      const W = Math.min(U.startX, U.currentX), D = Math.min(U.startY, U.currentY), N = Math.max(U.startX, U.currentX), O = Math.max(U.startY, U.currentY);
      if (N - W > 4 || O - D > 4) {
        const z = [];
        for (const [it, F] of Object.entries($.nodes))
          F.x < N && F.x + F.width > W && F.y < O && F.y + F.height > D && z.push(it);
        for (const [it, F] of Object.entries($.containers))
          F.x < N && F.x + F.width > W && F.y < O && F.y + F.height > D && z.push(it);
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: z } });
      }
      mt(null);
    }
    ct && ne(y), j && bt(null);
  }, ce = w ?? (B == null ? void 0 : B.mode) === "flow", ut = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (y) => {
    const W = Math.random() * 16 | 0;
    return (y === "x" ? W : W & 3 | 8).toString(16);
  }), ae = v ?? w ?? (B == null ? void 0 : B.mode) === "flow", le = Object.values(o.containers), Ce = s === "light" ? "sysflow-theme-light" : "sysflow-theme-dark", Ae = Xt(() => ({
    outline: "none",
    ...Fe(d),
    ...I
  }), [d, I]);
  return /* @__PURE__ */ J(
    "div",
    {
      ref: h,
      className: `sysflow-canvas ${Ce} ${n}`,
      "data-theme": s,
      style: Ae,
      onWheel: m,
      onPointerDown: de,
      onPointerMove: Ie,
      onPointerUp: re,
      tabIndex: 0,
      children: [
        /* @__PURE__ */ R(
          Te,
          {
            graph: o,
            registerMeasureElement: tt,
            nodeTypes: G,
            containerTypes: P
          }
        ),
        /* @__PURE__ */ J("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ R("button", { onClick: q, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ R("button", { onClick: It, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ J("button", { onClick: V, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(M.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ J(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${M.x}px, ${M.y}px) scale(${M.zoom})`
            },
            children: [
              U && /* @__PURE__ */ R(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(U.startX, U.currentX)}px`,
                    top: `${Math.min(U.startY, U.currentY)}px`,
                    width: `${Math.abs(U.currentX - U.startX)}px`,
                    height: `${Math.abs(U.currentY - U.startY)}px`,
                    backgroundColor: "color-mix(in srgb, var(--sysflow-node-selected, #aa9460) 15%, transparent)",
                    border: "1px dashed var(--sysflow-node-selected, #aa9460)",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              j && /* @__PURE__ */ R("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ R(
                "line",
                {
                  x1: j.startWorldPos.x,
                  y1: j.startWorldPos.y,
                  x2: j.currentWorldPos.x,
                  y2: j.currentWorldPos.y,
                  stroke: "var(--sysflow-edge-selected, #aa9460)",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ R("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: le.map((y) => {
                const W = $.containers[y.id];
                if (!W) return null;
                const D = Object.values(o.nodes).some((N) => N.parentId === y.id) || Object.values(o.containers).some((N) => N.parentId === y.id);
                return /* @__PURE__ */ R(
                  Qe,
                  {
                    container: y,
                    layout: W,
                    selected: t.includes(y.id),
                    isHovered: te === y.id,
                    hasChildren: D,
                    customRenderer: y.type ? P == null ? void 0 : P[y.type] : void 0,
                    onToggleCollapse: (N, O) => e({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: N, collapsed: O }
                    }),
                    onPointerDown: Wt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (N) => {
                      N.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [y.id] } });
                    }
                  },
                  y.id
                );
              }) }),
              /* @__PURE__ */ R(
                Xe,
                {
                  graph: o,
                  layout: $,
                  selectedIds: t,
                  direction: i,
                  showArrows: S,
                  routing: A,
                  portOptions: St,
                  enableEdgeQuickAdd: ae,
                  onInsertNodeOnEdge: oe,
                  onEdgeClick: (y) => e({ type: "SELECTION_CHANGE", payload: { selectedIds: [y] } })
                }
              ),
              /* @__PURE__ */ R("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(o.nodes).map((y) => {
                const W = $.nodes[y.id];
                return W ? /* @__PURE__ */ R(
                  Ve,
                  {
                    node: y,
                    layout: W,
                    direction: i,
                    edges: o.edges,
                    portOptions: St,
                    selected: t.includes(y.id),
                    customRenderer: y.type ? G == null ? void 0 : G[y.type] : void 0,
                    enableQuickAdd: ce,
                    onAddConnectedNode: se,
                    onPointerDown: Wt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (D) => {
                      D.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [y.id] } }), r == null || r(y.id, y);
                    },
                    onPortPointerDown: ge,
                    onPortPointerUp: ie
                  },
                  y.id
                ) : null;
              }) }),
              ct && /* @__PURE__ */ R(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ct.ghostPosition.x}px, ${ct.ghostPosition.y}px)`,
                    width: `${((Nt = _.get(ct.draggedEntity.id)) == null ? void 0 : Nt.width) || 200}px`,
                    height: `${((Mt = _.get(ct.draggedEntity.id)) == null ? void 0 : Mt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ R("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ct.draggedEntity.label })
                }
              )
            ]
          }
        )
      ]
    }
  );
};
export {
  _e as EdgeRewireStrategy,
  Qe as GraphContainer,
  Xe as GraphEdgeLayer,
  Ve as GraphNode,
  Oe as GraphPortLayer,
  ve as ReparentStrategy,
  ke as SugiyamaEngine,
  tn as SysFlowCanvas,
  Pe as WorkerBridge,
  vt as computeEntityPortLocations,
  Ot as pruneDanglingEdges,
  Jt as resolveEffectiveEntityId,
  Fe as themeTokensToStyle,
  Ye as useCanvasTransform,
  Ne as useDragGesture,
  qe as useGraphHistory,
  We as useMeasurement
};
