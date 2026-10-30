var ue = Object.defineProperty;
var he = (o, e, g) => e in o ? ue(o, e, { enumerable: !0, configurable: !0, writable: !0, value: g }) : o[e] = g;
var Bt = (o, e, g) => he(o, typeof e != "symbol" ? e + "" : e, g);
import { useState as gt, useRef as dt, useCallback as z, useEffect as Et, useMemo as fe } from "react";
import { jsxs as tt, jsx as v, Fragment as Zt } from "react/jsx-runtime";
function ye(o, e, g, c) {
  const r = (C) => {
    const a = g.find(
      (m) => m.sourceId === e && m.sourcePortId === C || m.targetId === e && m.targetPortId === C
    );
    if (!a) return null;
    const l = a.sourceId === e ? a.targetId : a.sourceId, I = c[l];
    return I ? { x: I.x + I.width / 2, y: I.y + I.height / 2 } : null;
  };
  ["left", "right"].forEach((C) => {
    o[C].sort((a, l) => {
      var B, u;
      const I = ((B = r(a.id)) == null ? void 0 : B.y) ?? 0, m = ((u = r(l.id)) == null ? void 0 : u.y) ?? 0;
      return I - m;
    });
  }), ["top", "bottom"].forEach((C) => {
    o[C].sort((a, l) => {
      var B, u;
      const I = ((B = r(a.id)) == null ? void 0 : B.x) ?? 0, m = ((u = r(l.id)) == null ? void 0 : u.x) ?? 0;
      return I - m;
    });
  });
}
function we(o, e, g, c, r, C) {
  if (!r || !C)
    return g ? "left" : "right";
  const a = c.find(
    (u) => g ? u.targetId === o && u.targetPortId === e : u.sourceId === o && u.sourcePortId === e
  );
  if (!a) return g ? "left" : "right";
  const l = g ? a.sourceId : a.targetId, I = r[l];
  if (!I) return g ? "left" : "right";
  const m = I.x + I.width / 2 - (C.x + C.width / 2), B = I.y + I.height / 2 - (C.y + C.height / 2);
  return Math.abs(m) > Math.abs(B) ? m > 0 ? "right" : "left" : B > 0 ? "bottom" : "top";
}
function kt(o, e, g = "LR", c, r) {
  const C = /* @__PURE__ */ new Map();
  if (!o || !e || !o.ports || o.ports.length === 0)
    return C;
  const a = (r == null ? void 0 : r.direction) || g, l = a === "TB" || a === "BT", I = (r == null ? void 0 : r.mode) || (l ? "strict-flow" : "perimeter-optimized"), m = c ? Array.isArray(c) ? c : Object.values(c) : [], B = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, u = new Set(
    m.filter((G) => G.targetId === o.id).map((G) => G.targetPortId)
  );
  new Set(
    m.filter((G) => G.sourceId === o.id).map((G) => G.sourcePortId)
  ), o.ports.forEach((G) => {
    let Z = G.side || "auto";
    if (Z !== "auto") {
      B[Z].push(G);
      return;
    }
    if (I === "strict-flow") {
      const x = u.has(G.id) || G.label.toLowerCase().includes("in");
      switch (a) {
        case "BT":
          Z = x ? "bottom" : "top";
          break;
        case "TB":
          Z = x ? "top" : "bottom";
          break;
        case "RL":
          Z = x ? "right" : "left";
          break;
        case "LR":
        default:
          Z = x ? "left" : "right";
          break;
      }
    } else
      Z = we(
        o.id,
        G.id,
        u.has(G.id),
        m,
        r == null ? void 0 : r.nodeLayouts,
        e
      );
    B[Z].push(G);
  }), I === "perimeter-optimized" && (r != null && r.nodeLayouts) && ye(B, o.id, m, r.nodeLayouts);
  const p = (G, Z) => {
    const x = G.length;
    G.forEach((n, t) => {
      let s = 0, i = 0;
      Z === "left" || Z === "right" ? (i = e.height / (x + 1) * (t + 1), s = Z === "left" ? 0 : e.width) : (s = e.width / (x + 1) * (t + 1), i = Z === "top" ? 0 : e.height), C.set(n.id, {
        portId: n.id,
        side: Z,
        localX: s,
        localY: i,
        worldX: e.x + s,
        worldY: e.y + i
      });
    });
  };
  return p(B.left, "left"), p(B.right, "right"), p(B.top, "top"), p(B.bottom, "bottom"), C;
}
function Mt(o) {
  const e = {}, g = (c) => {
    var C;
    const r = o.nodes[c];
    return new Set(((C = r == null ? void 0 : r.ports) == null ? void 0 : C.map((a) => a.id)) || []);
  };
  for (const [c, r] of Object.entries(o.edges)) {
    const C = g(r.sourceId), a = g(r.targetId), l = C.has(r.sourcePortId), I = a.has(r.targetPortId);
    l && I && (e[c] = r);
  }
  return {
    ...o,
    edges: e
  };
}
class Be {
  static assignDynamicPortSides(e, g, c) {
    var C, a;
    const r = (l) => g[l] || c[l];
    for (const l of Object.values(e.edges)) {
      const I = r(l.sourceId), m = r(l.targetId);
      if (!I || !m) continue;
      const B = e.nodes[l.sourceId] || e.containers[l.sourceId], u = e.nodes[l.targetId] || e.containers[l.targetId], p = m.x + m.width / 2 - (I.x + I.width / 2), G = m.y + m.height / 2 - (I.y + I.height / 2), Z = Math.abs(p) > Math.abs(G) * 1.25, x = (C = B == null ? void 0 : B.ports) == null ? void 0 : C.find((t) => t.id === l.sourcePortId);
      x && (!x.side || x.side === "auto") && (Z ? x.side = p >= 0 ? "right" : "left" : x.side = G >= 0 ? "bottom" : "top");
      const n = (a = u == null ? void 0 : u.ports) == null ? void 0 : a.find((t) => t.id === l.targetPortId);
      n && (!n.side || n.side === "auto") && (Z ? n.side = p >= 0 ? "left" : "right" : n.side = G >= 0 ? "top" : "bottom");
    }
  }
}
const Rt = 22, Tt = 18, Xt = 38, Kt = 210, Ot = 36, be = 180, me = 54, Vt = 260, Qt = 160;
class Ht {
  static execute(e, g, c) {
    var n;
    const r = {}, C = {}, a = (t) => {
      var d, h, L, S, N;
      const s = !!e.containers[t], i = !!((d = e.containers[t]) != null && d.collapsed);
      return s && i ? { width: Kt, height: Ot } : s && !i ? {
        width: ((h = c.get(t)) == null ? void 0 : h.width) || Vt,
        height: ((L = c.get(t)) == null ? void 0 : L.height) || Qt
      } : {
        width: ((S = c.get(t)) == null ? void 0 : S.width) || be,
        height: ((N = c.get(t)) == null ? void 0 : N.height) || me
      };
    }, l = /* @__PURE__ */ new Map();
    for (const [t, s] of Object.entries(e.nodes)) {
      const i = s.parentId ?? null;
      l.has(i) || l.set(i, []), l.get(i).push(t);
    }
    for (const [t, s] of Object.entries(e.containers)) {
      const i = s.parentId ?? null;
      l.has(i) || l.set(i, []), l.get(i).push(t);
    }
    const I = Ht.getContainerDepths(e), m = Object.keys(e.containers).sort(
      (t, s) => (I.get(s) || 0) - (I.get(t) || 0)
    ), B = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), p = (t) => B.has(t) ? B.get(t) : a(t);
    for (const t of m) {
      if (!!((n = e.containers[t]) != null && n.collapsed)) {
        B.set(t, {
          width: Kt,
          height: Ot
        });
        continue;
      }
      const i = l.get(t) || [];
      if (i.length === 0) {
        B.set(t, {
          width: Vt,
          height: Qt
        });
        continue;
      }
      const d = g.arrange(t, i, e, p);
      for (const S of d.boxes)
        u.set(S.id, S);
      const h = Math.max(d.width + Rt * 2, Kt), L = d.height + Xt + Tt * 2;
      B.set(t, { width: h, height: L });
    }
    const G = l.get(null) || [];
    let Z = [];
    G.length > 0 && (Z = g.arrange(null, G, e, p).boxes.map((s) => ({
      ...s,
      localX: s.localX + 60,
      localY: s.localY + 60
    })));
    const x = (t, s, i, d, h) => {
      var N;
      const L = !!e.containers[t], S = { id: t, x: s, y: i, width: d, height: h };
      if (L) {
        if (C[t] = S, (N = e.containers[t]) != null && N.collapsed) return;
        const F = s + Rt, T = i + Xt + Tt, f = l.get(t) || [];
        for (const A of f) {
          const y = u.get(A);
          y && x(
            A,
            F + y.localX,
            T + y.localY,
            y.width,
            y.height
          );
        }
      } else
        r[t] = S;
    };
    for (const t of Z)
      x(t.id, t.localX, t.localY, t.width, t.height);
    return Be.assignDynamicPortSides(e, r, C), { nodes: r, containers: C };
  }
  static getContainerDepths(e) {
    const g = /* @__PURE__ */ new Map(), c = (r) => {
      var l;
      if (g.has(r)) return g.get(r);
      const C = (l = e.containers[r]) == null ? void 0 : l.parentId;
      if (!C || !e.containers[C])
        return g.set(r, 0), 0;
      const a = 1 + c(C);
      return g.set(r, a), a;
    };
    for (const r of Object.keys(e.containers))
      c(r);
    return g;
  }
}
const xe = 70, xt = 28;
class pe {
  constructor(e = {}) {
    this.options = e;
  }
  arrange(e, g, c, r) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = this.options.direction ?? "TB", a = C === "TB" || C === "BT", l = C === "BT" || C === "RL", I = new Set(g), m = [], B = /* @__PURE__ */ new Set();
    for (const A of Object.values(c.edges)) {
      const y = this.resolveToDirectChild(A.sourceId, I, c), K = this.resolveToDirectChild(A.targetId, I, c);
      if (y && K && y !== K) {
        const Y = `${y}->${K}`;
        B.has(Y) || (B.add(Y), m.push({ sourceId: y, targetId: K }));
      }
    }
    const u = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
    for (const A of g)
      u.set(A, 0), p.set(A, []), G.set(A, []);
    for (const A of m)
      p.get(A.sourceId).push(A.targetId), G.get(A.targetId).push(A.sourceId), u.set(A.targetId, (u.get(A.targetId) || 0) + 1);
    const Z = /* @__PURE__ */ new Map(), x = g.filter((A) => (u.get(A) || 0) === 0);
    for (const A of x) Z.set(A, 0);
    const n = /* @__PURE__ */ new Set();
    for (; x.length > 0; ) {
      const A = x.shift();
      n.add(A);
      const y = Z.get(A);
      for (const K of p.get(A)) {
        const Y = Math.max(Z.get(K) || 0, y + 1);
        Z.set(K, Y), u.set(K, u.get(K) - 1), u.get(K) === 0 && x.push(K);
      }
    }
    for (const A of g)
      n.has(A) || Z.set(A, 0);
    const t = /* @__PURE__ */ new Map();
    for (const [A, y] of Z.entries())
      t.has(y) || t.set(y, []), t.get(y).push(A);
    const s = Array.from(t.keys()).sort((A, y) => A - y), i = l ? [...s].reverse() : s, d = /* @__PURE__ */ new Map(), h = (A) => {
      const y = r(A);
      return a ? y.width : y.height;
    };
    for (const A of s) {
      const y = t.get(A) || [];
      let K = -1 / 0;
      for (const Y of y) {
        const H = h(Y), b = G.get(Y) || [];
        let D = null;
        if (b.length > 0) {
          const W = b.map((_) => {
            const R = d.get(_);
            return R === void 0 ? null : R + h(_) / 2;
          }).filter((_) => _ !== null);
          W.length > 0 && (D = W.reduce((_, R) => _ + R, 0) / W.length);
        }
        let M = D !== null ? D - H / 2 : 0;
        M < K + xt && (M = K === -1 / 0 ? 0 : K + xt), d.set(Y, M), K = M + H;
      }
    }
    for (let A = s.length - 1; A >= 0; A--) {
      const y = s[A], K = t.get(y) || [];
      for (const H of K) {
        const b = p.get(H) || [];
        if (b.length === 0) continue;
        const D = b.map((M) => {
          const W = d.get(M);
          return W === void 0 ? null : W + h(M) / 2;
        }).filter((M) => M !== null);
        if (D.length > 0) {
          const M = D.reduce((_, R) => _ + R, 0) / D.length, W = h(H);
          d.set(H, M - W / 2);
        }
      }
      let Y = -1 / 0;
      for (const H of K) {
        const b = h(H);
        let D = d.get(H) ?? 0;
        D < Y + xt && (D = Y === -1 / 0 ? 0 : Y + xt, d.set(H, D)), Y = D + b;
      }
    }
    let L = 1 / 0;
    for (const A of d.values())
      L = Math.min(L, A);
    const S = L < 0 ? -L : 0, N = [];
    let F = 0;
    for (const A of i) {
      const y = t.get(A);
      let K = 0;
      for (const Y of y) {
        const H = r(Y), b = a ? H.height : H.width, D = (d.get(Y) ?? 0) + S, M = a ? D : F, W = a ? F : D;
        N.push({ id: Y, localX: M, localY: W, width: H.width, height: H.height }), K = Math.max(K, b);
      }
      F += K + xe;
    }
    const T = Math.max(...N.map((A) => A.localX + A.width), 0), f = Math.max(...N.map((A) => A.localY + A.height), 0);
    return { width: T, height: f, boxes: N };
  }
  resolveToDirectChild(e, g, c) {
    var C, a;
    let r = e;
    for (; r; ) {
      if (g.has(r)) return r;
      r = ((C = c.nodes[r]) == null ? void 0 : C.parentId) ?? ((a = c.containers[r]) == null ? void 0 : a.parentId) ?? null;
    }
    return null;
  }
}
const lt = 32, zt = 24;
class Ge {
  constructor(e = 1.55) {
    this.targetAspect = e;
  }
  arrange(e, g, c, r) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = g.map((l) => {
      const I = r(l);
      return { id: l, width: I.width, height: I.height };
    }), a = this.findBestTightPacking(C, this.targetAspect);
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
    const c = e.reduce((u, p) => u + p.width * p.height, 0), r = Math.max(...e.map((u) => u.width)), C = [...e].sort((u, p) => p.width - u.width), a = /* @__PURE__ */ new Set(), l = e.reduce((u, p) => u + p.width, 0) + (e.length - 1) * lt;
    a.add(l), a.add(r);
    const I = Math.max(r, Math.sqrt(c * g));
    a.add(I), a.add(I * 0.85), a.add(I * 1.15);
    const m = Math.min(e.length, 6);
    for (let u = 2; u <= m; u++) {
      let p = 0;
      for (let G = 0; G < u && G < C.length; G++)
        p += C[G].width;
      p += (u - 1) * lt, p >= r && a.add(p);
    }
    let B = null;
    for (const u of a) {
      const p = this.simulateSkylinePacking(e, u), G = p.width * p.height, Z = Math.max(0, G - c), x = p.width / Math.max(1, p.height), n = Math.abs(Math.log(x / g)), t = Z / c * 2 + n * 0.25;
      p.score = t, (!B || t < B.score) && (B = p);
    }
    return B;
  }
  simulateSkylinePacking(e, g) {
    const c = [...e].sort((I, m) => m.height - I.height), r = [{ x: 0, width: g, y: 0 }], C = [];
    for (const I of c) {
      let m = 1 / 0, B = -1;
      for (let t = 0; t < r.length; t++) {
        if (r[t].x + I.width > g) continue;
        let i = 0, d = 0;
        for (let h = t; h < r.length && d < I.width; h++)
          i = Math.max(i, r[h].y), d += r[h].width;
        i < m && (m = i, B = t);
      }
      if (B === -1) {
        const t = Math.max(...r.map((i) => i.y)), s = t === 0 ? 0 : t + zt;
        C.push({ id: I.id, localX: 0, localY: s, width: I.width, height: I.height }), r.length = 0, r.push({ x: 0, width: I.width + lt, y: s + I.height }), g > I.width + lt && r.push({
          x: I.width + lt,
          width: g - (I.width + lt),
          y: 0
        });
        continue;
      }
      const u = r[B].x, p = m === 0 ? 0 : m + zt;
      C.push({ id: I.id, localX: u, localY: p, width: I.width, height: I.height });
      const G = I.width + lt, Z = p + I.height, x = { x: u, width: G, y: Z }, n = [];
      for (const t of r)
        t.x + t.width <= u || t.x >= u + G ? n.push(t) : (t.x < u && n.push({ x: t.x, width: u - t.x, y: t.y }), t.x + t.width > u + G && n.push({
          x: u + G,
          width: t.x + t.width - (u + G),
          y: t.y
        }));
      n.push(x), n.sort((t, s) => t.x - s.x), r.length = 0, r.push(...n);
    }
    const a = Math.max(...C.map((I) => I.localX + I.width), 0), l = Math.max(...C.map((I) => I.localY + I.height), 0);
    return { width: a, height: l, boxes: C, score: 0 };
  }
}
function Ft(o, e, g) {
  var C, a;
  let c = o, r = null;
  for (; c; )
    g.has(c) && (r = c), c = ((C = e.nodes[c]) == null ? void 0 : C.parentId) ?? ((a = e.containers[c]) == null ? void 0 : a.parentId) ?? void 0;
  return r ?? o;
}
class Se {
  async execute(e, g, c) {
    const r = Object.values(e.containers), C = new Set(
      r.filter((u) => !!u.collapsed).map((u) => u.id)
    ), a = {};
    for (const [u, p] of Object.entries(e.edges)) {
      const G = Ft(p.sourceId, e, C), Z = Ft(p.targetId, e, C);
      G !== Z && (a[u] = {
        ...p,
        sourceId: G,
        targetId: Z
      });
    }
    const l = {
      ...e,
      edges: a
    }, I = Object.keys(e.containers).length, B = (c != null && c.mode && c.mode !== "auto" ? c.mode : I > 0 ? "concurrent" : "flow") === "concurrent" ? new Ge((c == null ? void 0 : c.aspectRatio) ?? 1.55) : new pe(c);
    return Ht.execute(l, B, g);
  }
}
const $t = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", Le = (o) => Uint8Array.from(atob(o), (e) => e.charCodeAt(0)), jt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Le($t)], { type: "text/javascript;charset=utf-8" });
function Ke(o) {
  let e;
  try {
    if (e = jt && (self.URL || self.webkitURL).createObjectURL(jt), !e) throw "";
    const g = new Worker(e, {
      type: "module",
      name: o == null ? void 0 : o.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + $t,
      {
        type: "module",
        name: o == null ? void 0 : o.name
      }
    );
  }
}
class Ee {
  constructor() {
    Bt(this, "worker", null);
    Bt(this, "pendingRequests", /* @__PURE__ */ new Map());
    Bt(this, "fallbackEngine", new Se());
    if (typeof Worker < "u")
      try {
        this.worker = new Ke(), this.worker.onmessage = (e) => {
          const { id: g, success: c, layout: r, error: C } = e.data, a = this.pendingRequests.get(g);
          a && (this.pendingRequests.delete(g), c ? a.resolve(r) : a.reject(new Error(C)));
        }, this.worker.onerror = (e) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", e);
        };
      } catch (e) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", e), this.worker = null;
      }
  }
  execute(e, g, c) {
    return this.worker ? new Promise((r, C) => {
      const a = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(a, { resolve: r, reject: C });
      const l = Array.from(g.entries());
      this.worker.postMessage({
        id: a,
        graph: e,
        measurements: l,
        options: c
      });
    }) : this.fallbackEngine.execute(e, g, c);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class Ze {
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
class ze {
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
    const { draggedEntity: g, hoveredEdge: c, hoveredEntity: r, cursorWorld: C, startWorldPos: a, graph: l } = e, I = Math.hypot(
      C.x - a.x,
      C.y - a.y
    );
    if (r && l.containers[r.id])
      return r.id !== g.id && g.parentId !== r.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: r.id
        }
      } : null;
    if (!r && !c) {
      const B = Object.values(l.edges).filter(
        (p) => p.targetId === g.id
      ), u = Object.values(l.edges).filter(
        (p) => p.sourceId === g.id
      );
      return B.length === 1 && u.length === 1 && B[0].sourceId !== u[0].targetId && I >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: B[0].id,
          outgoingEdgeId: u[0].id
        }
      } : I >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const m = (B) => {
      const u = l.nodes[B.id] || B;
      if (!u.ports || u.ports.length === 0) return "";
      const p = Object.values(l.edges).find((x) => x.targetId === B.id);
      if (p) {
        const x = u.ports.find((n) => n.id === p.targetPortId);
        if (x) return x.id;
      }
      const G = new Set(
        Object.values(l.edges).filter((x) => x.sourceId === B.id).map((x) => x.sourcePortId)
      ), Z = u.ports.find((x) => !G.has(x.id));
      return Z ? Z.id : u.ports[0].id;
    };
    if (c)
      return c.sourceId === g.id || c.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: c.id,
          newSourceId: c.sourceId,
          newTargetId: g.id,
          newTargetPortId: m(g)
        }
      };
    if (r && r.id !== g.id && l.nodes[r.id]) {
      const B = Object.values(l.edges).find(
        (u) => u.targetId === r.id && u.sourceId !== g.id
      );
      if (B)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: B.id,
            newSourceId: B.sourceId,
            newTargetId: g.id,
            newTargetPortId: m(g)
          }
        };
    }
    return null;
  }
}
function ke(o, e = { min: 0.15, max: 3 }) {
  const [g, c] = gt({ x: 80, y: 80, zoom: 1 }), r = dt(!1), C = dt({ x: 0, y: 0 }), a = z(
    (x, n) => {
      if (!o.current) return { x, y: n };
      const t = o.current.getBoundingClientRect();
      return {
        x: (x - t.left - g.x) / g.zoom,
        y: (n - t.top - g.y) / g.zoom
      };
    },
    [g, o]
  ), l = z(
    (x) => {
      if (!o.current) return;
      const n = [
        ...Object.values(x.nodes),
        ...Object.values(x.containers)
      ];
      if (n.length === 0) {
        c({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, s = 1 / 0, i = -1 / 0, d = -1 / 0;
      for (const K of n)
        t = Math.min(t, K.x), s = Math.min(s, K.y), i = Math.max(i, K.x + K.width), d = Math.max(d, K.y + K.height);
      const h = o.current.getBoundingClientRect(), L = 80, S = Math.max(i - t, 100), N = Math.max(d - s, 100), F = (h.width - L * 2) / S, T = (h.height - L * 2) / N, f = Math.min(
        Math.max(Math.min(F, T), e.min),
        Math.min(e.max, 1.25)
      ), A = (h.width - S * f) / 2 - t * f, y = (h.height - N * f) / 2 - s * f;
      c({
        x: A,
        y,
        zoom: f
      });
    },
    [o, e]
  ), I = z(
    (x) => {
      if (x.preventDefault(), !!o.current)
        if (x.ctrlKey || x.metaKey) {
          const n = o.current.getBoundingClientRect(), t = x.clientX - n.left, s = x.clientY - n.top, i = x.deltaY < 0 ? 1.08 : 0.92, d = Math.min(Math.max(g.zoom * i, e.min), e.max), h = t - (t - g.x) * (d / g.zoom), L = s - (s - g.y) * (d / g.zoom);
          c({ x: h, y: L, zoom: d });
        } else
          c((n) => ({
            ...n,
            x: n.x - x.deltaX,
            y: n.y - x.deltaY
          }));
    },
    [g, e, o]
  ), m = z(
    (x, n) => {
      r.current = !0, C.current = { x: x - g.x, y: n - g.y };
    },
    [g]
  ), B = z((x, n) => {
    r.current && c((t) => ({
      ...t,
      x: x - C.current.x,
      y: n - C.current.y
    }));
  }, []), u = z(() => {
    r.current = !1;
  }, []), p = z(() => {
    c({ x: 80, y: 80, zoom: 1 });
  }, []), G = z(() => {
    c((x) => ({
      ...x,
      zoom: Math.min(x.zoom * 1.2, e.max)
    }));
  }, [e]), Z = z(() => {
    c((x) => ({
      ...x,
      zoom: Math.max(x.zoom / 1.2, e.min)
    }));
  }, [e]);
  return {
    transform: g,
    setTransform: c,
    screenToWorld: a,
    onWheel: I,
    startPan: m,
    updatePan: B,
    endPan: u,
    resetTransform: p,
    zoomIn: G,
    zoomOut: Z,
    zoomToFit: l,
    isPanning: r
  };
}
function He(o) {
  const [e, g] = gt(
    /* @__PURE__ */ new Map()
  );
  dt(/* @__PURE__ */ new Map());
  const c = dt(/* @__PURE__ */ new Map()), r = z((C, a) => {
    a ? c.current.set(C, a) : c.current.delete(C);
  }, []);
  return Et(() => {
    const C = new ResizeObserver((a) => {
      let l = !1;
      const I = new Map(e);
      for (const m of a) {
        const B = m.target.getAttribute("data-sysflow-measure-id");
        if (!B) continue;
        const u = Math.ceil(m.contentRect.width), p = Math.ceil(m.contentRect.height), G = I.get(B);
        (!G || G.width !== u || G.height !== p) && (I.set(B, { width: u, height: p }), l = !0);
      }
      l && g(I);
    });
    return c.current.forEach((a) => C.observe(a)), () => {
      C.disconnect();
    };
  }, [o]), { measurements: e, registerMeasureElement: r };
}
function De(o, e, g, c, r) {
  const [C, a] = gt(null), [l, I] = gt(null), m = dt(null), B = dt(null), u = z(
    (n, t) => {
      let s = null, i = 1 / 0;
      for (const [d, h] of Object.entries(e.containers))
        if (d !== t && n.x >= h.x && n.x <= h.x + h.width && n.y >= h.y && n.y <= h.y + h.height) {
          const L = h.width * h.height;
          L < i && (i = L, s = o.containers[d] || null);
        }
      if (s) return s;
      for (const [d, h] of Object.entries(e.nodes))
        if (d !== t && n.x >= h.x && n.x <= h.x + h.width && n.y >= h.y && n.y <= h.y + h.height)
          return o.nodes[d] || null;
      return null;
    },
    [e, o]
  ), p = z(
    (n, t) => {
      let s = null, i = 45;
      for (const d of Object.values(o.edges)) {
        if (d.sourceId === t || d.targetId === t) continue;
        const h = e.nodes[d.sourceId] || e.containers[d.sourceId], L = e.nodes[d.targetId] || e.containers[d.targetId];
        if (!h || !L) continue;
        const S = h.x + h.width, N = h.y + h.height / 2, F = L.x, T = L.y + L.height / 2;
        for (let f = 0; f <= 10; f++) {
          const A = f / 10, y = (1 - A) * S + A * F, K = (1 - A) * N + A * T, Y = Math.hypot(n.x - y, n.y - K);
          Y < i && (i = Y, s = d);
        }
      }
      return s;
    },
    [e, o]
  ), G = z(
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
  ), Z = z(
    (n) => {
      if (!C) return;
      const t = c(n.clientX, n.clientY), s = u(t, C.draggedEntity.id), i = p(t, C.draggedEntity.id);
      m.current = s, B.current = i, s && o.containers[s.id] ? I(s.id) : I(null);
      const d = g.onDragMove ? g.onDragMove({
        draggedEntity: C.draggedEntity,
        cursorWorld: t,
        startWorldPos: C.startPosition,
        hoveredEntity: s,
        hoveredEdge: i,
        graph: o,
        layout: e
      }) : t;
      d && a((h) => h ? { ...h, ghostPosition: d } : null);
    },
    [C, c, g, o, e, u, p]
  ), x = z(
    (n) => {
      if (!C) return;
      const t = c(n.clientX, n.clientY), s = u(t, C.draggedEntity.id), i = p(t, C.draggedEntity.id), d = g.onDragEnd({
        draggedEntity: C.draggedEntity,
        cursorWorld: t,
        startWorldPos: C.startPosition,
        hoveredEntity: s,
        hoveredEdge: i,
        graph: o,
        layout: e
      });
      d && r(d), a(null), I(null), m.current = null, B.current = null;
    },
    [C, c, g, o, e, u, p, r]
  );
  return {
    dragState: C,
    hoveredContainerId: l,
    handlePointerDown: G,
    handlePointerMove: Z,
    handlePointerUp: x
  };
}
function Pe(o, e) {
  const g = [], c = [], r = [], C = [], a = [];
  for (const [l, I] of Object.entries(e.nodes))
    o.nodes[l] ? o.nodes[l] !== I && c.push(I) : g.push(I);
  for (const l of Object.keys(o.nodes))
    e.nodes[l] || r.push(l);
  for (const [l, I] of Object.entries(e.edges))
    o.edges[l] || C.push(I);
  for (const [l, I] of Object.entries(o.edges))
    e.edges[l] || a.push(I);
  return { createdNodes: g, updatedNodes: c, deletedNodes: r, createdEdges: C, deletedEdges: a };
}
function ve(o) {
  return o.createdNodes.length > 0 || o.updatedNodes.length > 0 || o.deletedNodes.length > 0 || o.createdEdges.length > 0 || o.deletedEdges.length > 0;
}
function Fe(o, e) {
  const [g, c] = gt({
    history: [o],
    index: 0
  }), [r, C] = gt(null), a = dt(e);
  a.current = e;
  const l = g.history[g.index] ?? g.history[0] ?? o, I = z((s) => {
    var d;
    const i = Mt(s);
    if ((d = a.current) != null && d.onMutate) {
      const h = Pe(l, i);
      ve(h) && a.current.onMutate(h);
    }
    c((h) => {
      const L = h.history.slice(0, h.index + 1);
      return {
        history: [...L, i],
        index: L.length
      };
    });
  }, [l]), m = z((s) => {
    const i = Mt(s);
    c({
      history: [i],
      index: 0
    });
  }, []), B = z(() => {
    c((s) => ({
      ...s,
      index: Math.max(0, s.index - 1)
    }));
  }, []), u = z(() => {
    c((s) => ({
      ...s,
      index: Math.min(s.history.length - 1, s.index + 1)
    }));
  }, []), p = z(
    (s) => {
      var S;
      if (!s || s.length === 0) return;
      let i = s;
      if ((S = a.current) != null && S.canDelete) {
        const N = a.current.canDelete(s);
        if (typeof N == "boolean") {
          if (!N) return;
        } else Array.isArray(N) && (i = N);
      }
      if (i.length === 0) return;
      const d = { ...l.nodes }, h = { ...l.containers }, L = { ...l.edges };
      for (const N of i)
        delete d[N], delete h[N], delete L[N];
      I({
        ...l,
        nodes: d,
        containers: h,
        edges: L
      });
    },
    [l, I]
  ), G = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (s) => {
    const i = Math.random() * 16 | 0;
    return (s === "x" ? i : i & 3 | 8).toString(16);
  }), Z = z(
    (s) => {
      var h, L, S, N, F, T;
      const i = l, d = a.current;
      if (s.type === "ENTITY_REPARENT") {
        const { entityId: f, newParentId: A } = s.payload, y = {
          ...i,
          nodes: { ...i.nodes },
          containers: { ...i.containers }
        };
        y.nodes[f] ? y.nodes[f] = { ...y.nodes[f], parentId: A } : y.containers[f] && (y.containers[f] = { ...y.containers[f], parentId: A }), I(y);
      } else if (s.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: f, direction: A, suggestedNewNodeId: y, suggestedNewEdge1Id: K, suggestedNewEdge2Id: Y } = s.payload, H = i.edges[f.id];
        if (!H) return;
        const b = i.nodes[H.sourceId];
        if (d != null && d.canConnect && (!d.canConnect(H.sourceId, y) || !d.canConnect(y, H.targetId)))
          return;
        const D = A === "BT", M = A === "TB", W = `p_in_${Date.now()}`, _ = `p_out_${Date.now() + 1}`;
        let R = "left", $ = "right";
        D ? (R = "bottom", $ = "top") : M ? (R = "top", $ = "bottom") : A === "RL" && (R = "right", $ = "left");
        const O = (h = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : h.call(d, {
          edge: H,
          direction: A,
          suggestedType: (b == null ? void 0 : b.type) || "FlowTask"
        }), X = {
          id: (O == null ? void 0 : O.id) || y,
          label: (O == null ? void 0 : O.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (O == null ? void 0 : O.type) || (b == null ? void 0 : b.type) || "FlowTask",
          parentId: (O == null ? void 0 : O.parentId) ?? (b == null ? void 0 : b.parentId) ?? null,
          ports: (O == null ? void 0 : O.ports) || [
            { id: W, label: "in", side: R },
            { id: _, label: "out", side: $ }
          ],
          data: (O == null ? void 0 : O.data) || {},
          ...O
        }, Ct = X.ports.find((et) => et.label.toLowerCase().includes("in")) || X.ports.find((et) => et.side === (D ? "bottom" : "top")) || X.ports[0], rt = X.ports.find((et) => et.label.toLowerCase().includes("out")) || X.ports.find((et) => et.side === (D ? "top" : "bottom")) || X.ports[X.ports.length - 1], V = Ct ? Ct.id : W, It = rt ? rt.id : _, j = {
          id: K,
          sourceId: H.sourceId,
          sourcePortId: H.sourcePortId,
          targetId: X.id,
          targetPortId: V
        }, q = {
          id: Y,
          sourceId: X.id,
          sourcePortId: It,
          targetId: H.targetId,
          targetPortId: H.targetPortId
        }, ct = { ...i.edges };
        delete ct[H.id], ct[K] = j, ct[Y] = q, I({
          ...i,
          nodes: { ...i.nodes, [X.id]: X },
          edges: ct
        });
      } else if (s.type === "NODE_EXTRACT") {
        const { incomingEdgeId: f, outgoingEdgeId: A } = s.payload, y = i.edges[f], K = i.edges[A];
        if (!y || !K || d != null && d.canConnect && !d.canConnect(y.sourceId, K.targetId))
          return;
        const Y = { ...i.edges };
        Y[f] = {
          ...y,
          targetId: K.targetId,
          targetPortId: K.targetPortId
        }, delete Y[A], I({
          ...i,
          edges: Y
        });
      } else if (s.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: f, position: A, direction: y, suggestedNewNodeId: K, suggestedNewEdgeId: Y } = s.payload, H = y === "BT", b = `p_in_${Date.now()}`, D = `p_out_${Date.now() + 1}`, M = H && A === "bottom" || !H && A === "top", W = M ? K : f.id, _ = M ? f.id : K;
        if (d != null && d.canConnect && !d.canConnect(W, _))
          return;
        const R = (L = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : L.call(d, {
          sourceNode: f,
          position: A,
          direction: y,
          suggestedType: f.type
        }), $ = {
          id: (R == null ? void 0 : R.id) || K,
          label: (R == null ? void 0 : R.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (R == null ? void 0 : R.type) || f.type,
          ports: (R == null ? void 0 : R.ports) || [
            { id: b, label: "in", side: H ? "bottom" : "top" },
            { id: D, label: "out", side: H ? "top" : "bottom" }
          ],
          data: (R == null ? void 0 : R.data) || {},
          parentId: (R == null ? void 0 : R.parentId) ?? (f == null ? void 0 : f.parentId) ?? null,
          ...R
        }, O = $.ports.find((q) => q.label.toLowerCase().includes("in")) || $.ports.find((q) => q.side === (H ? "bottom" : "top")) || $.ports[0], X = $.ports.find((q) => q.label.toLowerCase().includes("out")) || $.ports.find((q) => q.side === (H ? "top" : "bottom")) || $.ports[$.ports.length - 1], Ct = O ? O.id : b, rt = X ? X.id : D, V = f.ports.find((q) => q.label === "in") || f.ports[0], It = f.ports.find((q) => q.label === "out") || f.ports[f.ports.length - 1];
        let j;
        M ? j = {
          id: Y,
          sourceId: $.id,
          sourcePortId: rt,
          targetId: f.id,
          targetPortId: (V == null ? void 0 : V.id) || "in"
        } : j = {
          id: Y,
          sourceId: f.id,
          sourcePortId: (It == null ? void 0 : It.id) || "out",
          targetId: $.id,
          targetPortId: Ct
        }, I({
          ...i,
          nodes: { ...i.nodes, [$.id]: $ },
          edges: { ...i.edges, [Y]: j }
        });
      } else if (s.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: f, collapsed: A } = s.payload;
        i.containers[f] && I({
          ...i,
          containers: {
            ...i.containers,
            [f]: { ...i.containers[f], collapsed: A }
          }
        });
      } else if (s.type === "NODE_UPDATE") {
        const { id: f, updates: A } = s.payload;
        i.nodes[f] && I({
          ...i,
          nodes: {
            ...i.nodes,
            [f]: { ...i.nodes[f], ...A }
          }
        });
      } else if (s.type === "EDGE_CREATE") {
        const f = s.payload.edge, A = f.sourceId, y = f.targetId, K = f.sourcePortId, Y = f.targetPortId;
        if (d != null && d.canConnect && !d.canConnect(A, y, K, Y))
          return;
        const H = s.payload.id || f.id || G();
        I({
          ...i,
          edges: {
            ...i.edges,
            [H]: { id: H, ...f }
          }
        });
      } else if (s.type === "EDGE_DELETE") {
        const f = s.payload.edgeId || s.payload.id, A = { ...i.edges };
        delete A[f], I({ ...i, edges: A });
      } else if (s.type === "EDGE_REWIRE") {
        const { edgeId: f, newTargetId: A } = s.payload;
        if (!A || !i.edges[f]) return;
        const y = A, K = i.edges[f], Y = K.sourceId, H = K.targetId;
        if (y === Y || y === H) return;
        const b = Object.values(i.edges).find((O) => O.targetId === y), D = Object.values(i.edges).find((O) => O.sourceId === y), M = b && D && b.sourceId !== D.targetId;
        if (d != null && d.canConnect && (M && !d.canConnect(b.sourceId, D.targetId) || !d.canConnect(Y, y) || !d.canConnect(y, H)))
          return;
        const W = { ...i.edges };
        M ? (W[b.id] = {
          ...b,
          targetId: D.targetId,
          targetPortId: D.targetPortId
        }, delete W[D.id]) : (b && delete W[b.id], D && delete W[D.id]);
        const _ = ((N = (S = i.nodes[y]) == null ? void 0 : S.ports[0]) == null ? void 0 : N.id) || "p_in", R = ((T = (F = i.nodes[y]) == null ? void 0 : F.ports.find((O) => O.id !== _)) == null ? void 0 : T.id) || _;
        W[f] = {
          ...K,
          targetId: y,
          targetPortId: _
        };
        const $ = G();
        W[$] = {
          id: $,
          sourceId: y,
          sourcePortId: R,
          targetId: H,
          targetPortId: K.targetPortId
        }, I({ ...i, edges: W });
      } else {
        const f = s;
        if (f.type === "NODE_DELETE" || f.type === "DELETE_SELECTION" || f.type === "SELECTION_DELETE") {
          const A = f.payload || {}, y = [];
          A.nodeId && y.push(A.nodeId), A.id && y.push(A.id), Array.isArray(A.selectedIds) && y.push(...A.selectedIds), Array.isArray(A.ids) && y.push(...A.ids), p(y);
        }
      }
    },
    [l, I, p]
  ), x = z(
    (s) => {
      const i = l.nodes[s] || l.containers[s];
      i && C({ entity: JSON.parse(JSON.stringify(i)), isCut: !1 });
    },
    [l]
  ), n = z(
    (s) => {
      const i = l.nodes[s] || l.containers[s];
      if (i) {
        C({ entity: JSON.parse(JSON.stringify(i)), isCut: !0 });
        const d = { ...l.nodes }, h = { ...l.containers };
        delete d[s], delete h[s], I({ ...l, nodes: d, containers: h });
      }
    },
    [l, I]
  ), t = z(() => {
    if (!r) return;
    const s = r.entity, i = `${s.id}_copy_${Date.now().toString().slice(-4)}`, d = { ...s, id: i, label: `${s.label} (Copy)` };
    "collapsed" in d ? I({
      ...l,
      containers: { ...l.containers, [i]: d }
    }) : I({
      ...l,
      nodes: { ...l.nodes, [i]: d }
    });
  }, [r, l, I]);
  return {
    graph: l,
    setGraphDirect: m,
    applyAction: Z,
    undo: B,
    redo: u,
    copyEntity: x,
    cutEntity: n,
    pasteEntity: t,
    deleteSelection: p,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Ye = ({
  graph: o,
  registerMeasureElement: e,
  nodeTypes: g,
  containerTypes: c
}) => {
  const r = Object.values(o.nodes), C = Object.values(o.containers);
  return /* @__PURE__ */ tt("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    r.map((a) => {
      const l = a.type ? g == null ? void 0 : g[a.type] : null;
      return /* @__PURE__ */ v(
        "div",
        {
          ref: (I) => e(a.id, I),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ v(l, { node: a, selected: !1 }) : /* @__PURE__ */ tt("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ v("div", { style: { fontWeight: 600 }, children: a.label }),
            a.ports.length > 0 && /* @__PURE__ */ tt("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              a.ports.map((I) => I.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${a.id}`
      );
    }),
    C.map((a) => {
      const l = a.type ? c == null ? void 0 : c[a.type] : null;
      return /* @__PURE__ */ v(
        "div",
        {
          ref: (I) => e(a.id, I),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ v(l, { container: a, selected: !1 }) : /* @__PURE__ */ v("div", { className: "sysflow-container-header", children: a.label })
        },
        `measure-container-${a.id}`
      );
    })
  ] });
}, Ne = ({
  graph: o,
  layout: e,
  selectedIds: g,
  direction: c = "TB",
  showArrows: r = !0,
  routing: C = "auto",
  portOptions: a,
  enableEdgeQuickAdd: l = !0,
  onEdgeClick: I,
  onInsertNodeOnEdge: m
}) => {
  const [B, u] = gt(null), p = C === "step" || C === "auto" && (c === "LR" || c === "RL"), G = (n, t, s) => {
    var y, K, Y, H;
    let i = n, d = null;
    for ((y = o.containers[n]) != null && y.collapsed && (d = o.containers[n]); i; ) {
      const b = ((K = o.nodes[i]) == null ? void 0 : K.parentId) ?? ((Y = o.containers[i]) == null ? void 0 : Y.parentId) ?? null;
      b && ((H = o.containers[b]) != null && H.collapsed) && (d = o.containers[b]), i = b;
    }
    if (d) {
      const b = e.containers[d.id];
      if (!b)
        return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: d.id };
      let D, M, W;
      return c === "TB" ? (D = s ? "bottom" : "top", M = b.x + b.width / 2, W = s ? b.y + b.height : b.y) : c === "BT" ? (D = s ? "top" : "bottom", M = b.x + b.width / 2, W = s ? b.y : b.y + b.height) : c === "RL" ? (D = s ? "left" : "right", M = s ? b.x : b.x + b.width, W = b.y + b.height / 2) : (D = s ? "right" : "left", M = s ? b.x + b.width : b.x, W = b.y + b.height / 2), { x: M, y: W, side: D, valid: !0, entityId: d.id };
    }
    if (!!o.containers[n]) {
      const b = e.containers[n];
      if (!b) return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
      let D, M, W;
      return c === "TB" ? (D = b.x + b.width / 2, M = s ? b.y + b.height : b.y, W = s ? "bottom" : "top") : c === "BT" ? (D = b.x + b.width / 2, M = s ? b.y : b.y + b.height, W = s ? "top" : "bottom") : c === "RL" ? (D = s ? b.x : b.x + b.width, M = b.y + b.height / 2, W = s ? "left" : "right") : (D = s ? b.x + b.width : b.x, M = b.y + b.height / 2, W = s ? "right" : "left"), { x: D, y: M, side: W, valid: !0, entityId: n };
    }
    const L = o.nodes[n], S = e.nodes[n];
    if (!L || !S)
      return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
    const F = kt(
      L,
      S,
      c,
      o.edges,
      a
    ).get(t);
    if (F)
      return { x: F.worldX, y: F.worldY, side: F.side, valid: !0, entityId: n };
    let T, f, A;
    return c === "TB" ? (T = S.x + S.width / 2, f = s ? S.y + S.height : S.y, A = s ? "bottom" : "top") : c === "BT" ? (T = S.x + S.width / 2, f = s ? S.y : S.y + S.height, A = s ? "top" : "bottom") : c === "RL" ? (T = s ? S.x : S.x + S.width, f = S.y + S.height / 2, A = s ? "left" : "right") : (T = s ? S.x + S.width : S.x, f = S.y + S.height / 2, A = s ? "right" : "left"), { x: T, y: f, side: A, valid: !0, entityId: n };
  }, Z = (n, t) => {
    const s = (n.x + t.x) / 2, i = (n.y + t.y) / 2;
    if (n.side === "right" && t.side === "left") {
      if (t.x >= n.x + 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: i }
        };
      {
        const d = t.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x + 20} ${n.y} L ${n.x + 20} ${d} L ${t.x - 20} ${d} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      }
    }
    if (n.side === "left" && t.side === "right") {
      if (t.x <= n.x - 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: i }
        };
      {
        const d = t.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x - 20} ${n.y} L ${n.x - 20} ${d} L ${t.x + 20} ${d} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      }
    }
    if (n.side === "bottom" && t.side === "top") {
      if (t.y >= n.y + 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${i} L ${t.x} ${i} L ${t.x} ${t.y}`,
          center: { x: s, y: i }
        };
      {
        const d = t.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y + 20} L ${d} ${n.y + 20} L ${d} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: d, y: i }
        };
      }
    }
    if (n.side === "top" && t.side === "bottom") {
      if (t.y <= n.y - 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${i} L ${t.x} ${i} L ${t.x} ${t.y}`,
          center: { x: s, y: i }
        };
      {
        const d = t.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y - 20} L ${d} ${n.y - 20} L ${d} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: d, y: i }
        };
      }
    }
    return {
      pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
      center: { x: s, y: i }
    };
  }, x = (n, t) => {
    const s = t.x - n.x, i = t.y - n.y;
    let d = n.x, h = n.y, L = t.x, S = t.y;
    if (n.side === "bottom" && t.side === "top")
      if (i > 0) {
        const T = Math.min(28, i * 0.4);
        h = n.y + Math.max(T, i * 0.5), S = t.y - Math.max(T, i * 0.5);
      } else {
        const T = s >= 0 ? 1 : -1, f = Math.max(40, Math.abs(s) * 0.2);
        d = n.x + f * T, h = n.y + 40, L = t.x + f * T, S = t.y - 40;
      }
    else if (n.side === "top" && t.side === "bottom")
      if (i < 0) {
        const T = Math.min(28, Math.abs(i) * 0.4);
        h = n.y - Math.max(T, Math.abs(i) * 0.5), S = t.y + Math.max(T, Math.abs(i) * 0.5);
      } else {
        const T = s >= 0 ? 1 : -1, f = Math.max(40, Math.abs(s) * 0.2);
        d = n.x + f * T, h = n.y - 40, L = t.x + f * T, S = t.y + 40;
      }
    else if (n.side === "right" && t.side === "left")
      s > 0 ? (d = n.x + s * 0.5, L = t.x - s * 0.5) : (d = n.x + 50, h = n.y - 50, L = t.x - 50, S = t.y - 50);
    else if (n.side === "left" && t.side === "right")
      s < 0 ? (d = n.x + s * 0.5, L = t.x - s * 0.5) : (d = n.x - 50, h = n.y - 50, L = t.x + 50, S = t.y - 50);
    else {
      const T = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, f = T[n.side] || { x: 0, y: 1 }, A = T[t.side] || { x: 0, y: -1 }, y = Math.min(60, Math.hypot(s, i) * 0.35);
      d = n.x + f.x * y, h = n.y + f.y * y, L = t.x + A.x * y, S = t.y + A.y * y;
    }
    const N = 0.125 * n.x + 0.375 * d + 0.375 * L + 0.125 * t.x, F = 0.125 * n.y + 0.375 * h + 0.375 * S + 0.125 * t.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${d} ${h} ${L} ${S} ${t.x} ${t.y}`,
      center: { x: N, y: F }
    };
  };
  return /* @__PURE__ */ tt("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ tt("defs", { children: [
      /* @__PURE__ */ v(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ v("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ v(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ v("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(o.edges).map((n) => {
      const t = G(n.sourceId, n.sourcePortId, !0), s = G(n.targetId, n.targetPortId, !1);
      if (!t.valid || !s.valid || t.entityId === s.entityId) return null;
      const i = g.includes(n.id), d = B === n.id, { pathStr: h, center: L } = p ? Z(t, s) : x(t, s);
      return /* @__PURE__ */ tt(
        "g",
        {
          onMouseEnter: () => u(n.id),
          onMouseLeave: () => u(null),
          children: [
            /* @__PURE__ */ v(
              "path",
              {
                d: h,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (S) => {
                  S.stopPropagation(), I == null || I(n.id);
                }
              }
            ),
            /* @__PURE__ */ v(
              "path",
              {
                d: h,
                fill: "none",
                stroke: i ? "var(--sysflow-edge-selected)" : d ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: i ? 2.5 : d ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: r ? i ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            l && d && m && /* @__PURE__ */ v("g", { transform: `translate(${L.x}, ${L.y})`, children: /* @__PURE__ */ tt(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (S) => {
                  S.preventDefault(), S.stopPropagation(), m(n);
                },
                children: [
                  /* @__PURE__ */ v("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ v(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ v(
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
}, We = ({
  entity: o,
  layout: e,
  direction: g = "LR",
  edges: c,
  portOptions: r,
  onPortPointerDown: C,
  onPortPointerUp: a
}) => {
  if (!o.ports || o.ports.length === 0)
    return null;
  const l = kt(
    o,
    e,
    g,
    c,
    r
  );
  return /* @__PURE__ */ v(Zt, { children: o.ports.map((I) => {
    const m = l.get(I.id);
    return m ? /* @__PURE__ */ v(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${m.side}`,
        style: {
          position: "absolute",
          left: `${m.localX}px`,
          top: `${m.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${I.label} (${m.side})`,
        onPointerDown: (B) => {
          B.stopPropagation(), C == null || C(o.id, I.id, !0, B);
        },
        onPointerUp: (B) => {
          B.stopPropagation(), a == null || a(o.id, I.id, !1);
        }
      },
      I.id
    ) : null;
  }) });
}, Me = ({
  node: o,
  layout: e,
  selected: g = !1,
  direction: c = "LR",
  edges: r,
  portOptions: C,
  enableQuickAdd: a = !1,
  onAddConnectedNode: l,
  onPointerDown: I,
  onMouseEnter: m,
  onMouseLeave: B,
  onClick: u,
  onPortPointerDown: p,
  onPortPointerUp: G,
  customRenderer: Z
}) => {
  const [x, n] = gt(!1);
  return /* @__PURE__ */ tt(
    "div",
    {
      className: `sysflow-node ${g ? "sysflow-selected" : ""} ${o.className || ""}`,
      style: {
        transform: `translate(${e.x}px, ${e.y}px)`,
        width: `${e.width}px`,
        height: `${e.height}px`
      },
      onPointerDown: (t) => I == null ? void 0 : I(o, t),
      onMouseEnter: () => {
        n(!0), m == null || m(o.id);
      },
      onMouseLeave: () => {
        n(!1), B == null || B(o.id);
      },
      onClick: u,
      children: [
        a && x && /* @__PURE__ */ tt(Zt, { children: [
          /* @__PURE__ */ v("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ v("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        a && x && l && /* @__PURE__ */ v(
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
              t.preventDefault(), t.stopPropagation(), l(o, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ v(
          We,
          {
            entity: o,
            layout: e,
            direction: c,
            edges: r,
            portOptions: C,
            onPortPointerDown: p,
            onPortPointerUp: G
          }
        ),
        Z ? /* @__PURE__ */ v(Z, { node: o, selected: g }) : /* @__PURE__ */ tt("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ v("div", { style: { fontWeight: 600, fontSize: "13px" }, children: o.label }),
          o.ports.length > 0 && /* @__PURE__ */ tt("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            o.ports.length,
            " Port",
            o.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        a && x && l && /* @__PURE__ */ v(
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
              t.preventDefault(), t.stopPropagation(), l(o, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Re = ({
  container: o,
  layout: e,
  selected: g,
  isHovered: c = !1,
  hasChildren: r = !1,
  onToggleCollapse: C,
  onPointerDown: a,
  onMouseEnter: l,
  onMouseLeave: I,
  onClick: m,
  customRenderer: B
}) => /* @__PURE__ */ v(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${c ? "sysflow-hovered" : ""} ${o.className || ""}`,
    style: {
      transform: `translate(${e.x}px, ${e.y}px)`,
      width: `${e.width}px`,
      height: `${e.height}px`
    },
    onPointerDown: (u) => a(o, u),
    onMouseEnter: l,
    onMouseLeave: I,
    onClick: m,
    children: B ? /* @__PURE__ */ v(B, { container: o, selected: g }) : /* @__PURE__ */ tt(Zt, { children: [
      /* @__PURE__ */ tt("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ v("span", { className: "sysflow-container-title", title: o.label, children: o.label }),
        /* @__PURE__ */ v(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (u) => u.stopPropagation(),
            onPointerUp: (u) => u.stopPropagation(),
            onClick: (u) => {
              u.stopPropagation(), C(o.id, !o.collapsed);
            },
            children: o.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !o.collapsed && !r && /* @__PURE__ */ v("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Te = new Ze(), je = ({
  graph: o,
  onChange: e,
  history: g,
  enableShortcuts: c = !0,
  onNodeClick: r,
  onEdgeClick: C,
  layoutEngine: a,
  interactionStrategy: l = Te,
  direction: I = "TB",
  layoutOptions: m,
  portPlacementMode: B,
  routing: u,
  showEdgeArrows: p = !0,
  nodeTypes: G,
  containerTypes: Z,
  zoomBounds: x,
  className: n = "",
  selectedIds: t = [],
  theme: s = "dark",
  enableQuickAdd: i,
  enableEdgeQuickAdd: d,
  onNodeCreate: h,
  onEdgeCreate: L,
  onNodeDelete: S,
  onEdgeDelete: N
}) => {
  var Pt, vt;
  const F = dt(null), T = dt(null);
  !a && !T.current && (T.current = new Ee());
  const f = a || T.current, {
    transform: A,
    screenToWorld: y,
    onWheel: K,
    startPan: Y,
    updatePan: H,
    endPan: b,
    resetTransform: D,
    zoomIn: M,
    zoomOut: W,
    zoomToFit: _,
    isPanning: R
  } = ke(F, x), { measurements: $, registerMeasureElement: O } = He(o), [X, Ct] = gt({ nodes: {}, containers: {} }), rt = fe(() => ({
    direction: I,
    mode: B ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: X.nodes
  }), [I, B, X.nodes]), [V, It] = gt(null), [j, q] = gt(null), ct = dt(!1), {
    dragState: et,
    hoveredContainerId: Ut,
    handlePointerDown: Dt,
    handlePointerMove: Jt,
    handlePointerUp: _t
  } = De(o, X, l, y, e);
  Et(() => {
    const w = (E) => {
      var it, J, at;
      if (E.target instanceof HTMLInputElement || E.target instanceof HTMLTextAreaElement || E.target instanceof HTMLElement && E.target.isContentEditable)
        return;
      const P = E.ctrlKey || E.metaKey, Q = E.key.toLowerCase();
      if (E.key === "Delete" || E.key === "Backspace") {
        if (E.preventDefault(), t.length > 0) {
          if (S || N)
            for (const nt of t)
              o.nodes[nt] ? S == null || S(nt) : o.edges[nt] && (N == null || N(nt));
          g != null && g.deleteSelection && g.deleteSelection(t), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        }
        return;
      }
      if (c !== !1 && g) {
        if (P && Q === "z") {
          E.preventDefault(), E.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (P && Q === "y") {
          E.preventDefault(), g.redo();
          return;
        }
        if (P && Q === "c" && t[0]) {
          E.preventDefault(), (it = g.copyEntity) == null || it.call(g, t[0]);
          return;
        }
        if (P && Q === "x" && t[0]) {
          E.preventDefault(), (J = g.cutEntity) == null || J.call(g, t[0]);
          return;
        }
        if (P && Q === "v") {
          E.preventDefault(), (at = g.pasteEntity) == null || at.call(g);
          return;
        }
      }
      if (E.key === "Escape") {
        E.preventDefault(), q(null), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (E.code === "Space" && (ct.current = !0), E.key.toLowerCase() === "f" && !P) {
        E.preventDefault(), _(X);
        return;
      }
      if (P && Q === "a") {
        E.preventDefault();
        const nt = [
          ...Object.keys(o.nodes),
          ...Object.keys(o.containers)
        ];
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: nt } });
        return;
      }
      const U = Object.keys(o.nodes);
      if (U.length !== 0 && E.key === "Tab") {
        E.preventDefault();
        const nt = t.length > 0 ? U.indexOf(t[0]) : -1;
        let At;
        E.shiftKey ? At = nt <= 0 ? U.length - 1 : nt - 1 : At = (nt + 1) % U.length, e({ type: "SELECTION_CHANGE", payload: { selectedIds: [U[At]] } });
        return;
      }
    }, k = (E) => {
      E.code === "Space" && (ct.current = !1);
    };
    return window.addEventListener("keydown", w), window.addEventListener("keyup", k), () => {
      window.removeEventListener("keydown", w), window.removeEventListener("keyup", k);
    };
  }, [o, X, t, _, e, g, c, S, N]);
  const qt = z(
    (w, k) => {
      const E = ht(), P = ht(), Q = I === "BT", U = Q && k === "bottom" || !Q && k === "top";
      h && L ? (h({
        id: E,
        type: w.type || "FlowTask",
        label: `New ${w.type || "Task"}`,
        parentId: w.parentId ?? null
      }), U ? L(E, w.id, P) : L(w.id, E, P)) : e({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: w,
          position: k,
          direction: I,
          suggestedNewNodeId: E,
          suggestedNewEdgeId: P
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [E] }
      });
    },
    [I, e, h, L]
  ), te = z(
    (w) => {
      const k = ht(), E = ht(), P = ht(), Q = o.nodes[w.sourceId], U = (Q == null ? void 0 : Q.type) || "FlowTask";
      h && L && N ? (N(w.id), h({
        id: k,
        type: U,
        label: `New ${U}`,
        parentId: (Q == null ? void 0 : Q.parentId) ?? null
      }), L(w.sourceId, k, E), L(k, w.targetId, P)) : e({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: w,
          direction: I,
          suggestedNewNodeId: k,
          suggestedNewEdge1Id: E,
          suggestedNewEdge2Id: P
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [k] }
      });
    },
    [I, o.nodes, e, h, L, N]
  );
  Et(() => {
    let w = !1, k = 16 / 9;
    if (F.current) {
      const P = F.current.getBoundingClientRect();
      P.width > 0 && P.height > 0 && (k = P.width / P.height);
    }
    const E = {
      direction: I,
      aspectRatio: k,
      ...m
    };
    return f.execute(o, $, E).then((P) => {
      w || Ct(P);
    }), () => {
      w = !0;
    };
  }, [o, $, f, I, m]);
  const ee = (w, k, E, P) => {
    const Q = o.nodes[w] || o.containers[w], U = X.nodes[w] || X.containers[w];
    if (!Q || !U) return;
    const J = kt(
      Q,
      U,
      I,
      o.edges,
      rt
    ).get(k), at = J ? { x: J.worldX, y: J.worldY } : { x: U.x + U.width, y: U.y + U.height / 2 };
    It({
      sourceId: w,
      sourcePortId: k,
      startWorldPos: at,
      currentWorldPos: y(P.clientX, P.clientY)
    });
  }, ne = (w, k, E) => {
    var P, Q, U, it, J, at, nt, At, Yt, Nt;
    if (V && V.sourceId !== w) {
      const pt = o.nodes[V.sourceId] || o.containers[V.sourceId], Gt = o.nodes[w] || o.containers[w], st = (P = pt == null ? void 0 : pt.ports) == null ? void 0 : P.find((ut) => ut.id === V.sourcePortId), ot = (Q = Gt == null ? void 0 : Gt.ports) == null ? void 0 : Q.find((ut) => ut.id === k);
      let ft = V.sourceId, bt = V.sourcePortId, yt = w, mt = k;
      const re = ((U = st == null ? void 0 : st.label) == null ? void 0 : U.toLowerCase().includes("in")) || (st == null ? void 0 : st.side) === (I === "BT" ? "bottom" : "top"), ce = ((it = st == null ? void 0 : st.label) == null ? void 0 : it.toLowerCase().includes("out")) || (st == null ? void 0 : st.side) === (I === "BT" ? "top" : "bottom"), ae = ((J = ot == null ? void 0 : ot.label) == null ? void 0 : J.toLowerCase().includes("in")) || (ot == null ? void 0 : ot.side) === (I === "BT" ? "bottom" : "top"), le = ((at = ot == null ? void 0 : ot.label) == null ? void 0 : at.toLowerCase().includes("out")) || (ot == null ? void 0 : ot.side) === (I === "BT" ? "top" : "bottom");
      if (re && le)
        ft = w, bt = k, yt = V.sourceId, mt = V.sourcePortId;
      else if (ce && ae)
        ft = V.sourceId, bt = V.sourcePortId, yt = w, mt = k;
      else if (X.nodes[V.sourceId] && X.nodes[w]) {
        const ut = X.nodes[V.sourceId], Wt = X.nodes[w], Ce = I === "BT" && ut.y < Wt.y, Ae = I === "TB" && ut.y > Wt.y;
        if (Ce || Ae) {
          ft = w, yt = V.sourceId;
          const St = o.nodes[ft], Lt = o.nodes[yt];
          bt = ((At = (nt = St == null ? void 0 : St.ports) == null ? void 0 : nt.find((wt) => wt.label.includes("out") || wt.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : At.id) || k, mt = ((Nt = (Yt = Lt == null ? void 0 : Lt.ports) == null ? void 0 : Yt.find((wt) => wt.label.includes("in") || wt.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : Nt.id) || V.sourcePortId;
        }
      }
      e({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: ft,
            sourcePortId: bt,
            targetId: yt,
            targetPortId: mt
          }
        }
      });
    }
    It(null);
  }, se = (w) => {
    if (w.button === 1 || ct.current) {
      Y(w.clientX, w.clientY);
      return;
    }
    const k = w.target, E = k === F.current || k.classList.contains("sysflow-viewport") || k.classList.contains("sysflow-dom-layer") || k.tagName.toLowerCase() === "svg";
    if (w.button === 0 && E) {
      w.currentTarget.setPointerCapture(w.pointerId);
      const P = y(w.clientX, w.clientY);
      q({
        startX: P.x,
        startY: P.y,
        currentX: P.x,
        currentY: P.y
      }), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, oe = (w) => {
    if (R.current)
      H(w.clientX, w.clientY);
    else if (j) {
      const k = y(w.clientX, w.clientY);
      q((E) => E ? { ...E, currentX: k.x, currentY: k.y } : null);
    } else et ? Jt(w) : V && It(
      (k) => k ? { ...k, currentWorldPos: y(w.clientX, w.clientY) } : null
    );
  }, ge = (w) => {
    if (w.currentTarget.hasPointerCapture(w.pointerId) && w.currentTarget.releasePointerCapture(w.pointerId), R.current && b(), j) {
      const k = Math.min(j.startX, j.currentX), E = Math.min(j.startY, j.currentY), P = Math.max(j.startX, j.currentX), Q = Math.max(j.startY, j.currentY);
      if (P - k > 4 || Q - E > 4) {
        const U = [];
        for (const [it, J] of Object.entries(X.nodes))
          J.x < P && J.x + J.width > k && J.y < Q && J.y + J.height > E && U.push(it);
        for (const [it, J] of Object.entries(X.containers))
          J.x < P && J.x + J.width > k && J.y < Q && J.y + J.height > E && U.push(it);
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: U } });
      }
      q(null);
    }
    et && _t(w), V && It(null);
  }, Ie = i ?? (m == null ? void 0 : m.mode) === "flow", ht = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (w) => {
    const k = Math.random() * 16 | 0;
    return (w === "x" ? k : k & 3 | 8).toString(16);
  }), ie = d ?? i ?? (m == null ? void 0 : m.mode) === "flow", de = Object.values(o.containers);
  return /* @__PURE__ */ tt(
    "div",
    {
      ref: F,
      className: `sysflow-canvas ${s === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${n}`,
      "data-theme": s,
      onWheel: K,
      onPointerDown: se,
      onPointerMove: oe,
      onPointerUp: ge,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ v(
          Ye,
          {
            graph: o,
            registerMeasureElement: O,
            nodeTypes: G,
            containerTypes: Z
          }
        ),
        /* @__PURE__ */ tt("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ v("button", { onClick: M, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ v("button", { onClick: W, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ tt("button", { onClick: D, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(A.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ tt(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${A.x}px, ${A.y}px) scale(${A.zoom})`
            },
            children: [
              j && /* @__PURE__ */ v(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(j.startX, j.currentX)}px`,
                    top: `${Math.min(j.startY, j.currentY)}px`,
                    width: `${Math.abs(j.currentX - j.startX)}px`,
                    height: `${Math.abs(j.currentY - j.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              V && /* @__PURE__ */ v("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ v(
                "line",
                {
                  x1: V.startWorldPos.x,
                  y1: V.startWorldPos.y,
                  x2: V.currentWorldPos.x,
                  y2: V.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ v("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: de.map((w) => {
                const k = X.containers[w.id];
                if (!k) return null;
                const E = Object.values(o.nodes).some((P) => P.parentId === w.id) || Object.values(o.containers).some((P) => P.parentId === w.id);
                return /* @__PURE__ */ v(
                  Re,
                  {
                    container: w,
                    layout: k,
                    selected: t.includes(w.id),
                    isHovered: Ut === w.id,
                    hasChildren: E,
                    customRenderer: w.type ? Z == null ? void 0 : Z[w.type] : void 0,
                    onToggleCollapse: (P, Q) => e({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: P, collapsed: Q }
                    }),
                    onPointerDown: Dt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (P) => {
                      P.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [w.id] } });
                    }
                  },
                  w.id
                );
              }) }),
              /* @__PURE__ */ v(
                Ne,
                {
                  graph: o,
                  layout: X,
                  selectedIds: t,
                  direction: I,
                  showArrows: p,
                  routing: u,
                  portOptions: rt,
                  enableEdgeQuickAdd: ie,
                  onInsertNodeOnEdge: te,
                  onEdgeClick: (w) => e({ type: "SELECTION_CHANGE", payload: { selectedIds: [w] } })
                }
              ),
              /* @__PURE__ */ v("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(o.nodes).map((w) => {
                const k = X.nodes[w.id];
                return k ? /* @__PURE__ */ v(
                  Me,
                  {
                    node: w,
                    layout: k,
                    direction: I,
                    edges: o.edges,
                    portOptions: rt,
                    selected: t.includes(w.id),
                    customRenderer: w.type ? G == null ? void 0 : G[w.type] : void 0,
                    enableQuickAdd: Ie,
                    onAddConnectedNode: qt,
                    onPointerDown: Dt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (E) => {
                      E.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [w.id] } }), r == null || r(w.id, w);
                    },
                    onPortPointerDown: ee,
                    onPortPointerUp: ne
                  },
                  w.id
                ) : null;
              }) }),
              et && /* @__PURE__ */ v(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${et.ghostPosition.x}px, ${et.ghostPosition.y}px)`,
                    width: `${((Pt = $.get(et.draggedEntity.id)) == null ? void 0 : Pt.width) || 200}px`,
                    height: `${((vt = $.get(et.draggedEntity.id)) == null ? void 0 : vt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ v("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: et.draggedEntity.label })
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
  ze as EdgeRewireStrategy,
  Re as GraphContainer,
  Ne as GraphEdgeLayer,
  Me as GraphNode,
  We as GraphPortLayer,
  Ze as ReparentStrategy,
  Se as SugiyamaEngine,
  je as SysFlowCanvas,
  Ee as WorkerBridge,
  kt as computeEntityPortLocations,
  Mt as pruneDanglingEdges,
  Ft as resolveEffectiveEntityId,
  ke as useCanvasTransform,
  De as useDragGesture,
  Fe as useGraphHistory,
  He as useMeasurement
};
