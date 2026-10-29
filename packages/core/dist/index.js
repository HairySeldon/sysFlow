var ue = Object.defineProperty;
var he = (o, e, g) => e in o ? ue(o, e, { enumerable: !0, configurable: !0, writable: !0, value: g }) : o[e] = g;
var xt = (o, e, g) => he(o, typeof e != "symbol" ? e + "" : e, g);
import { useState as ot, useRef as it, useCallback as F, useEffect as Dt, useMemo as fe } from "react";
import { jsxs as tt, jsx as v, Fragment as Ht } from "react/jsx-runtime";
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
      var w, u;
      const I = ((w = r(a.id)) == null ? void 0 : w.y) ?? 0, m = ((u = r(l.id)) == null ? void 0 : u.y) ?? 0;
      return I - m;
    });
  }), ["top", "bottom"].forEach((C) => {
    o[C].sort((a, l) => {
      var w, u;
      const I = ((w = r(a.id)) == null ? void 0 : w.x) ?? 0, m = ((u = r(l.id)) == null ? void 0 : u.x) ?? 0;
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
  const m = I.x + I.width / 2 - (C.x + C.width / 2), w = I.y + I.height / 2 - (C.y + C.height / 2);
  return Math.abs(m) > Math.abs(w) ? m > 0 ? "right" : "left" : w > 0 ? "bottom" : "top";
}
function Pt(o, e, g = "LR", c, r) {
  const C = /* @__PURE__ */ new Map();
  if (!o || !e || !o.ports || o.ports.length === 0)
    return C;
  const a = (r == null ? void 0 : r.direction) || g, l = a === "TB" || a === "BT", I = (r == null ? void 0 : r.mode) || (l ? "strict-flow" : "perimeter-optimized"), m = c ? Array.isArray(c) ? c : Object.values(c) : [], w = {
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
      w[Z].push(G);
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
    w[Z].push(G);
  }), I === "perimeter-optimized" && (r != null && r.nodeLayouts) && ye(w, o.id, m, r.nodeLayouts);
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
  return p(w.left, "left"), p(w.right, "right"), p(w.top, "top"), p(w.bottom, "bottom"), C;
}
function Rt(o) {
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
      const w = e.nodes[l.sourceId] || e.containers[l.sourceId], u = e.nodes[l.targetId] || e.containers[l.targetId], p = m.x + m.width / 2 - (I.x + I.width / 2), G = m.y + m.height / 2 - (I.y + I.height / 2), Z = Math.abs(p) > Math.abs(G) * 1.25, x = (C = w == null ? void 0 : w.ports) == null ? void 0 : C.find((t) => t.id === l.sourcePortId);
      x && (!x.side || x.side === "auto") && (Z ? x.side = p >= 0 ? "right" : "left" : x.side = G >= 0 ? "bottom" : "top");
      const n = (a = u == null ? void 0 : u.ports) == null ? void 0 : a.find((t) => t.id === l.targetPortId);
      n && (!n.side || n.side === "auto") && (Z ? n.side = p >= 0 ? "left" : "right" : n.side = G >= 0 ? "top" : "bottom");
    }
  }
}
const Tt = 22, Xt = 18, Ot = 38, kt = 210, Vt = 36, be = 180, me = 54, Qt = 260, zt = 160;
class vt {
  static execute(e, g, c) {
    var n;
    const r = {}, C = {}, a = (t) => {
      var d, h, K, S, T;
      const s = !!e.containers[t], i = !!((d = e.containers[t]) != null && d.collapsed);
      return s && i ? { width: kt, height: Vt } : s && !i ? {
        width: ((h = c.get(t)) == null ? void 0 : h.width) || Qt,
        height: ((K = c.get(t)) == null ? void 0 : K.height) || zt
      } : {
        width: ((S = c.get(t)) == null ? void 0 : S.width) || be,
        height: ((T = c.get(t)) == null ? void 0 : T.height) || me
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
    const I = vt.getContainerDepths(e), m = Object.keys(e.containers).sort(
      (t, s) => (I.get(s) || 0) - (I.get(t) || 0)
    ), w = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), p = (t) => w.has(t) ? w.get(t) : a(t);
    for (const t of m) {
      if (!!((n = e.containers[t]) != null && n.collapsed)) {
        w.set(t, {
          width: kt,
          height: Vt
        });
        continue;
      }
      const i = l.get(t) || [];
      if (i.length === 0) {
        w.set(t, {
          width: Qt,
          height: zt
        });
        continue;
      }
      const d = g.arrange(t, i, e, p);
      for (const S of d.boxes)
        u.set(S.id, S);
      const h = Math.max(d.width + Tt * 2, kt), K = d.height + Ot + Xt * 2;
      w.set(t, { width: h, height: K });
    }
    const G = l.get(null) || [];
    let Z = [];
    G.length > 0 && (Z = g.arrange(null, G, e, p).boxes.map((s) => ({
      ...s,
      localX: s.localX + 60,
      localY: s.localY + 60
    })));
    const x = (t, s, i, d, h) => {
      var T;
      const K = !!e.containers[t], S = { id: t, x: s, y: i, width: d, height: h };
      if (K) {
        if (C[t] = S, (T = e.containers[t]) != null && T.collapsed) return;
        const j = s + Tt, R = i + Ot + Xt, B = l.get(t) || [];
        for (const A of B) {
          const f = u.get(A);
          f && x(
            A,
            j + f.localX,
            R + f.localY,
            f.width,
            f.height
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
const xe = 70, Lt = 28;
class pe {
  constructor(e = {}) {
    this.options = e;
  }
  arrange(e, g, c, r) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = this.options.direction ?? "TB", a = C === "TB" || C === "BT", l = C === "BT" || C === "RL", I = new Set(g), m = [], w = /* @__PURE__ */ new Set();
    for (const A of Object.values(c.edges)) {
      const f = this.resolveToDirectChild(A.sourceId, I, c), E = this.resolveToDirectChild(A.targetId, I, c);
      if (f && E && f !== E) {
        const Y = `${f}->${E}`;
        w.has(Y) || (w.add(Y), m.push({ sourceId: f, targetId: E }));
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
      const f = Z.get(A);
      for (const E of p.get(A)) {
        const Y = Math.max(Z.get(E) || 0, f + 1);
        Z.set(E, Y), u.set(E, u.get(E) - 1), u.get(E) === 0 && x.push(E);
      }
    }
    for (const A of g)
      n.has(A) || Z.set(A, 0);
    const t = /* @__PURE__ */ new Map();
    for (const [A, f] of Z.entries())
      t.has(f) || t.set(f, []), t.get(f).push(A);
    const s = Array.from(t.keys()).sort((A, f) => A - f), i = l ? [...s].reverse() : s, d = /* @__PURE__ */ new Map(), h = (A) => {
      const f = r(A);
      return a ? f.width : f.height;
    };
    for (const A of s) {
      const f = t.get(A) || [];
      let E = -1 / 0;
      for (const Y of f) {
        const H = h(Y), b = G.get(Y) || [];
        let P = null;
        if (b.length > 0) {
          const N = b.map((U) => {
            const M = d.get(U);
            return M === void 0 ? null : M + h(U) / 2;
          }).filter((U) => U !== null);
          N.length > 0 && (P = N.reduce((U, M) => U + M, 0) / N.length);
        }
        let W = P !== null ? P - H / 2 : 0;
        W < E + Lt && (W = E === -1 / 0 ? 0 : E + Lt), d.set(Y, W), E = W + H;
      }
    }
    for (let A = s.length - 1; A >= 0; A--) {
      const f = s[A], E = t.get(f) || [];
      for (const H of E) {
        const b = p.get(H) || [];
        if (b.length === 0) continue;
        const P = b.map((W) => {
          const N = d.get(W);
          return N === void 0 ? null : N + h(W) / 2;
        }).filter((W) => W !== null);
        if (P.length > 0) {
          const W = P.reduce((U, M) => U + M, 0) / P.length, N = h(H);
          d.set(H, W - N / 2);
        }
      }
      let Y = -1 / 0;
      for (const H of E) {
        const b = h(H);
        let P = d.get(H) ?? 0;
        P < Y + Lt && (P = Y === -1 / 0 ? 0 : Y + Lt, d.set(H, P)), Y = P + b;
      }
    }
    let K = 1 / 0;
    for (const A of d.values())
      K = Math.min(K, A);
    const S = K < 0 ? -K : 0, T = [];
    let j = 0;
    for (const A of i) {
      const f = t.get(A);
      let E = 0;
      for (const Y of f) {
        const H = r(Y), b = a ? H.height : H.width, P = (d.get(Y) ?? 0) + S, W = a ? P : j, N = a ? j : P;
        T.push({ id: Y, localX: W, localY: N, width: H.width, height: H.height }), E = Math.max(E, b);
      }
      j += E + xe;
    }
    const R = Math.max(...T.map((A) => A.localX + A.width), 0), B = Math.max(...T.map((A) => A.localY + A.height), 0);
    return { width: R, height: B, boxes: T };
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
const ht = 32, Ft = 24;
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
    const c = e.reduce((u, p) => u + p.width * p.height, 0), r = Math.max(...e.map((u) => u.width)), C = [...e].sort((u, p) => p.width - u.width), a = /* @__PURE__ */ new Set(), l = e.reduce((u, p) => u + p.width, 0) + (e.length - 1) * ht;
    a.add(l), a.add(r);
    const I = Math.max(r, Math.sqrt(c * g));
    a.add(I), a.add(I * 0.85), a.add(I * 1.15);
    const m = Math.min(e.length, 6);
    for (let u = 2; u <= m; u++) {
      let p = 0;
      for (let G = 0; G < u && G < C.length; G++)
        p += C[G].width;
      p += (u - 1) * ht, p >= r && a.add(p);
    }
    let w = null;
    for (const u of a) {
      const p = this.simulateSkylinePacking(e, u), G = p.width * p.height, Z = Math.max(0, G - c), x = p.width / Math.max(1, p.height), n = Math.abs(Math.log(x / g)), t = Z / c * 2 + n * 0.25;
      p.score = t, (!w || t < w.score) && (w = p);
    }
    return w;
  }
  simulateSkylinePacking(e, g) {
    const c = [...e].sort((I, m) => m.height - I.height), r = [{ x: 0, width: g, y: 0 }], C = [];
    for (const I of c) {
      let m = 1 / 0, w = -1;
      for (let t = 0; t < r.length; t++) {
        if (r[t].x + I.width > g) continue;
        let i = 0, d = 0;
        for (let h = t; h < r.length && d < I.width; h++)
          i = Math.max(i, r[h].y), d += r[h].width;
        i < m && (m = i, w = t);
      }
      if (w === -1) {
        const t = Math.max(...r.map((i) => i.y)), s = t === 0 ? 0 : t + Ft;
        C.push({ id: I.id, localX: 0, localY: s, width: I.width, height: I.height }), r.length = 0, r.push({ x: 0, width: I.width + ht, y: s + I.height }), g > I.width + ht && r.push({
          x: I.width + ht,
          width: g - (I.width + ht),
          y: 0
        });
        continue;
      }
      const u = r[w].x, p = m === 0 ? 0 : m + Ft;
      C.push({ id: I.id, localX: u, localY: p, width: I.width, height: I.height });
      const G = I.width + ht, Z = p + I.height, x = { x: u, width: G, y: Z }, n = [];
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
function jt(o, e, g) {
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
      const G = jt(p.sourceId, e, C), Z = jt(p.targetId, e, C);
      G !== Z && (a[u] = {
        ...p,
        sourceId: G,
        targetId: Z
      });
    }
    const l = {
      ...e,
      edges: a
    }, I = Object.keys(e.containers).length, w = (c != null && c.mode && c.mode !== "auto" ? c.mode : I > 0 ? "concurrent" : "flow") === "concurrent" ? new Ge((c == null ? void 0 : c.aspectRatio) ?? 1.55) : new pe(c);
    return vt.execute(l, w, g);
  }
}
const Ut = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", Le = (o) => Uint8Array.from(atob(o), (e) => e.charCodeAt(0)), $t = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Le(Ut)], { type: "text/javascript;charset=utf-8" });
function Ke(o) {
  let e;
  try {
    if (e = $t && (self.URL || self.webkitURL).createObjectURL($t), !e) throw "";
    const g = new Worker(e, {
      type: "module",
      name: o == null ? void 0 : o.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Ut,
      {
        type: "module",
        name: o == null ? void 0 : o.name
      }
    );
  }
}
class Ee {
  constructor() {
    xt(this, "worker", null);
    xt(this, "pendingRequests", /* @__PURE__ */ new Map());
    xt(this, "fallbackEngine", new Se());
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
    xt(this, "dragOffThreshold", 60);
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
      const w = Object.values(l.edges).filter(
        (p) => p.targetId === g.id
      ), u = Object.values(l.edges).filter(
        (p) => p.sourceId === g.id
      );
      return w.length === 1 && u.length === 1 && w[0].sourceId !== u[0].targetId && I >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: w[0].id,
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
    const m = (w) => {
      const u = l.nodes[w.id] || w;
      if (!u.ports || u.ports.length === 0) return "";
      const p = Object.values(l.edges).find((x) => x.targetId === w.id);
      if (p) {
        const x = u.ports.find((n) => n.id === p.targetPortId);
        if (x) return x.id;
      }
      const G = new Set(
        Object.values(l.edges).filter((x) => x.sourceId === w.id).map((x) => x.sourcePortId)
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
      const w = Object.values(l.edges).find(
        (u) => u.targetId === r.id && u.sourceId !== g.id
      );
      if (w)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: w.id,
            newSourceId: w.sourceId,
            newTargetId: g.id,
            newTargetPortId: m(g)
          }
        };
    }
    return null;
  }
}
function ke(o, e = { min: 0.15, max: 3 }) {
  const [g, c] = ot({ x: 80, y: 80, zoom: 1 }), r = it(!1), C = it({ x: 0, y: 0 }), a = F(
    (x, n) => {
      if (!o.current) return { x, y: n };
      const t = o.current.getBoundingClientRect();
      return {
        x: (x - t.left - g.x) / g.zoom,
        y: (n - t.top - g.y) / g.zoom
      };
    },
    [g, o]
  ), l = F(
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
      for (const E of n)
        t = Math.min(t, E.x), s = Math.min(s, E.y), i = Math.max(i, E.x + E.width), d = Math.max(d, E.y + E.height);
      const h = o.current.getBoundingClientRect(), K = 80, S = Math.max(i - t, 100), T = Math.max(d - s, 100), j = (h.width - K * 2) / S, R = (h.height - K * 2) / T, B = Math.min(
        Math.max(Math.min(j, R), e.min),
        Math.min(e.max, 1.25)
      ), A = (h.width - S * B) / 2 - t * B, f = (h.height - T * B) / 2 - s * B;
      c({
        x: A,
        y: f,
        zoom: B
      });
    },
    [o, e]
  ), I = F(
    (x) => {
      if (x.preventDefault(), !!o.current)
        if (x.ctrlKey || x.metaKey) {
          const n = o.current.getBoundingClientRect(), t = x.clientX - n.left, s = x.clientY - n.top, i = x.deltaY < 0 ? 1.08 : 0.92, d = Math.min(Math.max(g.zoom * i, e.min), e.max), h = t - (t - g.x) * (d / g.zoom), K = s - (s - g.y) * (d / g.zoom);
          c({ x: h, y: K, zoom: d });
        } else
          c((n) => ({
            ...n,
            x: n.x - x.deltaX,
            y: n.y - x.deltaY
          }));
    },
    [g, e, o]
  ), m = F(
    (x, n) => {
      r.current = !0, C.current = { x: x - g.x, y: n - g.y };
    },
    [g]
  ), w = F((x, n) => {
    r.current && c((t) => ({
      ...t,
      x: x - C.current.x,
      y: n - C.current.y
    }));
  }, []), u = F(() => {
    r.current = !1;
  }, []), p = F(() => {
    c({ x: 80, y: 80, zoom: 1 });
  }, []), G = F(() => {
    c((x) => ({
      ...x,
      zoom: Math.min(x.zoom * 1.2, e.max)
    }));
  }, [e]), Z = F(() => {
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
    updatePan: w,
    endPan: u,
    resetTransform: p,
    zoomIn: G,
    zoomOut: Z,
    zoomToFit: l,
    isPanning: r
  };
}
function De(o) {
  const [e, g] = ot(
    /* @__PURE__ */ new Map()
  );
  it(/* @__PURE__ */ new Map());
  const c = it(/* @__PURE__ */ new Map()), r = F((C, a) => {
    a ? c.current.set(C, a) : c.current.delete(C);
  }, []);
  return Dt(() => {
    const C = new ResizeObserver((a) => {
      let l = !1;
      const I = new Map(e);
      for (const m of a) {
        const w = m.target.getAttribute("data-sysflow-measure-id");
        if (!w) continue;
        const u = Math.ceil(m.contentRect.width), p = Math.ceil(m.contentRect.height), G = I.get(w);
        (!G || G.width !== u || G.height !== p) && (I.set(w, { width: u, height: p }), l = !0);
      }
      l && g(I);
    });
    return c.current.forEach((a) => C.observe(a)), () => {
      C.disconnect();
    };
  }, [o]), { measurements: e, registerMeasureElement: r };
}
function He(o, e, g, c, r) {
  const [C, a] = ot(null), [l, I] = ot(null), m = it(null), w = it(null), u = F(
    (n, t) => {
      let s = null, i = 1 / 0;
      for (const [d, h] of Object.entries(e.containers))
        if (d !== t && n.x >= h.x && n.x <= h.x + h.width && n.y >= h.y && n.y <= h.y + h.height) {
          const K = h.width * h.height;
          K < i && (i = K, s = o.containers[d] || null);
        }
      if (s) return s;
      for (const [d, h] of Object.entries(e.nodes))
        if (d !== t && n.x >= h.x && n.x <= h.x + h.width && n.y >= h.y && n.y <= h.y + h.height)
          return o.nodes[d] || null;
      return null;
    },
    [e, o]
  ), p = F(
    (n, t) => {
      let s = null, i = 45;
      for (const d of Object.values(o.edges)) {
        if (d.sourceId === t || d.targetId === t) continue;
        const h = e.nodes[d.sourceId] || e.containers[d.sourceId], K = e.nodes[d.targetId] || e.containers[d.targetId];
        if (!h || !K) continue;
        const S = h.x + h.width, T = h.y + h.height / 2, j = K.x, R = K.y + K.height / 2;
        for (let B = 0; B <= 10; B++) {
          const A = B / 10, f = (1 - A) * S + A * j, E = (1 - A) * T + A * R, Y = Math.hypot(n.x - f, n.y - E);
          Y < i && (i = Y, s = d);
        }
      }
      return s;
    },
    [e, o]
  ), G = F(
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
  ), Z = F(
    (n) => {
      if (!C) return;
      const t = c(n.clientX, n.clientY), s = u(t, C.draggedEntity.id), i = p(t, C.draggedEntity.id);
      m.current = s, w.current = i, s && o.containers[s.id] ? I(s.id) : I(null);
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
  ), x = F(
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
      d && r(d), a(null), I(null), m.current = null, w.current = null;
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
  const [g, c] = ot({
    history: [o],
    index: 0
  }), [r, C] = ot(null), a = it(e);
  a.current = e;
  const l = g.history[g.index] ?? g.history[0] ?? o, I = F((s) => {
    var d;
    const i = Rt(s);
    if ((d = a.current) != null && d.onMutate) {
      const h = Pe(l, i);
      ve(h) && a.current.onMutate(h);
    }
    c((h) => {
      const K = h.history.slice(0, h.index + 1);
      return {
        history: [...K, i],
        index: K.length
      };
    });
  }, [l]), m = F((s) => {
    const i = Rt(s);
    c({
      history: [i],
      index: 0
    });
  }, []), w = F(() => {
    c((s) => ({
      ...s,
      index: Math.max(0, s.index - 1)
    }));
  }, []), u = F(() => {
    c((s) => ({
      ...s,
      index: Math.min(s.history.length - 1, s.index + 1)
    }));
  }, []), p = F(
    (s) => {
      var S;
      if (!s || s.length === 0) return;
      let i = s;
      if ((S = a.current) != null && S.canDelete) {
        const T = a.current.canDelete(s);
        if (typeof T == "boolean") {
          if (!T) return;
        } else Array.isArray(T) && (i = T);
      }
      if (i.length === 0) return;
      const d = { ...l.nodes }, h = { ...l.containers }, K = { ...l.edges };
      for (const T of i)
        delete d[T], delete h[T], delete K[T];
      I({
        ...l,
        nodes: d,
        containers: h,
        edges: K
      });
    },
    [l, I]
  ), G = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (s) => {
    const i = Math.random() * 16 | 0;
    return (s === "x" ? i : i & 3 | 8).toString(16);
  }), Z = F(
    (s) => {
      var h, K, S, T, j, R;
      const i = l, d = a.current;
      if (s.type === "ENTITY_REPARENT") {
        const { entityId: B, newParentId: A } = s.payload, f = {
          ...i,
          nodes: { ...i.nodes },
          containers: { ...i.containers }
        };
        f.nodes[B] ? f.nodes[B] = { ...f.nodes[B], parentId: A } : f.containers[B] && (f.containers[B] = { ...f.containers[B], parentId: A }), I(f);
      } else if (s.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: B, direction: A, suggestedNewNodeId: f, suggestedNewEdge1Id: E, suggestedNewEdge2Id: Y } = s.payload, H = i.edges[B.id];
        if (!H) return;
        const b = i.nodes[H.sourceId];
        if (d != null && d.canConnect && (!d.canConnect(H.sourceId, f) || !d.canConnect(f, H.targetId)))
          return;
        const P = A === "BT", W = A === "TB", N = `p_in_${Date.now()}`, U = `p_out_${Date.now()}`;
        let M = "left", q = "right";
        P ? (M = "bottom", q = "top") : W ? (M = "top", q = "bottom") : A === "RL" && (M = "right", q = "left");
        const X = (h = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : h.call(d, {
          edge: H,
          direction: A,
          suggestedType: (b == null ? void 0 : b.type) || "FlowTask"
        }), O = {
          id: (X == null ? void 0 : X.id) || f,
          label: (X == null ? void 0 : X.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (X == null ? void 0 : X.type) || (b == null ? void 0 : b.type) || "FlowTask",
          parentId: (X == null ? void 0 : X.parentId) ?? (b == null ? void 0 : b.parentId) ?? null,
          ports: (X == null ? void 0 : X.ports) || [
            { id: N, label: "in", side: M },
            { id: U, label: "out", side: q }
          ],
          data: (X == null ? void 0 : X.data) || {},
          ...X
        }, Ct = {
          id: E,
          sourceId: H.sourceId,
          sourcePortId: H.sourcePortId,
          targetId: O.id,
          targetPortId: N
        }, dt = {
          id: Y,
          sourceId: O.id,
          sourcePortId: U,
          targetId: H.targetId,
          targetPortId: H.targetPortId
        }, Q = { ...i.edges };
        delete Q[H.id], Q[E] = Ct, Q[Y] = dt, I({
          ...i,
          nodes: { ...i.nodes, [O.id]: O },
          edges: Q
        });
      } else if (s.type === "NODE_EXTRACT") {
        const { incomingEdgeId: B, outgoingEdgeId: A } = s.payload, f = i.edges[B], E = i.edges[A];
        if (!f || !E || d != null && d.canConnect && !d.canConnect(f.sourceId, E.targetId))
          return;
        const Y = { ...i.edges };
        Y[B] = {
          ...f,
          targetId: E.targetId,
          targetPortId: E.targetPortId
        }, delete Y[A], I({
          ...i,
          edges: Y
        });
      } else if (s.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: B, position: A, direction: f, suggestedNewNodeId: E, suggestedNewEdgeId: Y } = s.payload, H = f === "BT", b = `p_in_${Date.now()}`, P = `p_out_${Date.now()}`, W = H && A === "bottom" || !H && A === "top", N = W ? E : B.id, U = W ? B.id : E;
        if (d != null && d.canConnect && !d.canConnect(N, U))
          return;
        const M = (K = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : K.call(d, {
          sourceNode: B,
          position: A,
          direction: f,
          suggestedType: B.type
        }), q = {
          id: (M == null ? void 0 : M.id) || E,
          label: (M == null ? void 0 : M.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (M == null ? void 0 : M.type) || B.type,
          ports: (M == null ? void 0 : M.ports) || [
            { id: b, label: "in", side: H ? "bottom" : "top" },
            { id: P, label: "out", side: H ? "top" : "bottom" }
          ],
          data: (M == null ? void 0 : M.data) || {},
          parentId: (M == null ? void 0 : M.parentId) ?? (B == null ? void 0 : B.parentId) ?? null,
          ...M
        }, X = B.ports.find((dt) => dt.label === "in") || B.ports[0], O = B.ports.find((dt) => dt.label === "out") || B.ports[B.ports.length - 1];
        let Ct;
        W ? Ct = {
          id: Y,
          sourceId: q.id,
          sourcePortId: P,
          targetId: B.id,
          targetPortId: (X == null ? void 0 : X.id) || "in"
        } : Ct = {
          id: Y,
          sourceId: B.id,
          sourcePortId: (O == null ? void 0 : O.id) || "out",
          targetId: q.id,
          targetPortId: b
        }, I({
          ...i,
          nodes: { ...i.nodes, [q.id]: q },
          edges: { ...i.edges, [Y]: Ct }
        });
      } else if (s.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: B, collapsed: A } = s.payload;
        i.containers[B] && I({
          ...i,
          containers: {
            ...i.containers,
            [B]: { ...i.containers[B], collapsed: A }
          }
        });
      } else if (s.type === "EDGE_CREATE") {
        const B = s.payload.edge, A = B.sourceId, f = B.targetId, E = B.sourcePortId, Y = B.targetPortId;
        if (d != null && d.canConnect && !d.canConnect(A, f, E, Y))
          return;
        const H = s.payload.id || B.id || G();
        I({
          ...i,
          edges: {
            ...i.edges,
            [H]: { id: H, ...B }
          }
        });
      } else if (s.type === "EDGE_DELETE") {
        const B = s.payload.edgeId || s.payload.id, A = { ...i.edges };
        delete A[B], I({ ...i, edges: A });
      } else if (s.type === "EDGE_REWIRE") {
        const { edgeId: B, newTargetId: A } = s.payload;
        if (!A || !i.edges[B]) return;
        const f = A, E = i.edges[B], Y = E.sourceId, H = E.targetId;
        if (f === Y || f === H) return;
        const b = Object.values(i.edges).find((X) => X.targetId === f), P = Object.values(i.edges).find((X) => X.sourceId === f), W = b && P && b.sourceId !== P.targetId;
        if (d != null && d.canConnect && (W && !d.canConnect(b.sourceId, P.targetId) || !d.canConnect(Y, f) || !d.canConnect(f, H)))
          return;
        const N = { ...i.edges };
        W ? (N[b.id] = {
          ...b,
          targetId: P.targetId,
          targetPortId: P.targetPortId
        }, delete N[P.id]) : (b && delete N[b.id], P && delete N[P.id]);
        const U = ((T = (S = i.nodes[f]) == null ? void 0 : S.ports[0]) == null ? void 0 : T.id) || "p_in", M = ((R = (j = i.nodes[f]) == null ? void 0 : j.ports.find((X) => X.id !== U)) == null ? void 0 : R.id) || U;
        N[B] = {
          ...E,
          targetId: f,
          targetPortId: U
        };
        const q = G();
        N[q] = {
          id: q,
          sourceId: f,
          sourcePortId: M,
          targetId: H,
          targetPortId: E.targetPortId
        }, I({ ...i, edges: N });
      } else {
        const B = s;
        if (B.type === "NODE_DELETE" || B.type === "DELETE_SELECTION" || B.type === "SELECTION_DELETE") {
          const A = B.payload || {}, f = [];
          A.nodeId && f.push(A.nodeId), A.id && f.push(A.id), Array.isArray(A.selectedIds) && f.push(...A.selectedIds), Array.isArray(A.ids) && f.push(...A.ids), p(f);
        }
      }
    },
    [l, I, p]
  ), x = F(
    (s) => {
      const i = l.nodes[s] || l.containers[s];
      i && C({ entity: JSON.parse(JSON.stringify(i)), isCut: !1 });
    },
    [l]
  ), n = F(
    (s) => {
      const i = l.nodes[s] || l.containers[s];
      if (i) {
        C({ entity: JSON.parse(JSON.stringify(i)), isCut: !0 });
        const d = { ...l.nodes }, h = { ...l.containers };
        delete d[s], delete h[s], I({ ...l, nodes: d, containers: h });
      }
    },
    [l, I]
  ), t = F(() => {
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
    undo: w,
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
  const [w, u] = ot(null), p = C === "step" || C === "auto" && (c === "LR" || c === "RL"), G = (n, t, s) => {
    var f, E, Y, H;
    let i = n, d = null;
    for ((f = o.containers[n]) != null && f.collapsed && (d = o.containers[n]); i; ) {
      const b = ((E = o.nodes[i]) == null ? void 0 : E.parentId) ?? ((Y = o.containers[i]) == null ? void 0 : Y.parentId) ?? null;
      b && ((H = o.containers[b]) != null && H.collapsed) && (d = o.containers[b]), i = b;
    }
    if (d) {
      const b = e.containers[d.id];
      if (!b)
        return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: d.id };
      let P, W, N;
      return c === "TB" ? (P = s ? "bottom" : "top", W = b.x + b.width / 2, N = s ? b.y + b.height : b.y) : c === "BT" ? (P = s ? "top" : "bottom", W = b.x + b.width / 2, N = s ? b.y : b.y + b.height) : c === "RL" ? (P = s ? "left" : "right", W = s ? b.x : b.x + b.width, N = b.y + b.height / 2) : (P = s ? "right" : "left", W = s ? b.x + b.width : b.x, N = b.y + b.height / 2), { x: W, y: N, side: P, valid: !0, entityId: d.id };
    }
    if (!!o.containers[n]) {
      const b = e.containers[n];
      if (!b) return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
      let P, W, N;
      return c === "TB" ? (P = b.x + b.width / 2, W = s ? b.y + b.height : b.y, N = s ? "bottom" : "top") : c === "BT" ? (P = b.x + b.width / 2, W = s ? b.y : b.y + b.height, N = s ? "top" : "bottom") : c === "RL" ? (P = s ? b.x : b.x + b.width, W = b.y + b.height / 2, N = s ? "left" : "right") : (P = s ? b.x + b.width : b.x, W = b.y + b.height / 2, N = s ? "right" : "left"), { x: P, y: W, side: N, valid: !0, entityId: n };
    }
    const K = o.nodes[n], S = e.nodes[n];
    if (!K || !S)
      return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
    const j = Pt(
      K,
      S,
      c,
      o.edges,
      a
    ).get(t);
    if (j)
      return { x: j.worldX, y: j.worldY, side: j.side, valid: !0, entityId: n };
    let R, B, A;
    return c === "TB" ? (R = S.x + S.width / 2, B = s ? S.y + S.height : S.y, A = s ? "bottom" : "top") : c === "BT" ? (R = S.x + S.width / 2, B = s ? S.y : S.y + S.height, A = s ? "top" : "bottom") : c === "RL" ? (R = s ? S.x : S.x + S.width, B = S.y + S.height / 2, A = s ? "left" : "right") : (R = s ? S.x + S.width : S.x, B = S.y + S.height / 2, A = s ? "right" : "left"), { x: R, y: B, side: A, valid: !0, entityId: n };
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
    let d = n.x, h = n.y, K = t.x, S = t.y;
    if (n.side === "bottom" && t.side === "top")
      if (i > 0) {
        const R = Math.min(28, i * 0.4);
        h = n.y + Math.max(R, i * 0.5), S = t.y - Math.max(R, i * 0.5);
      } else {
        const R = s >= 0 ? 1 : -1, B = Math.max(40, Math.abs(s) * 0.2);
        d = n.x + B * R, h = n.y + 40, K = t.x + B * R, S = t.y - 40;
      }
    else if (n.side === "top" && t.side === "bottom")
      if (i < 0) {
        const R = Math.min(28, Math.abs(i) * 0.4);
        h = n.y - Math.max(R, Math.abs(i) * 0.5), S = t.y + Math.max(R, Math.abs(i) * 0.5);
      } else {
        const R = s >= 0 ? 1 : -1, B = Math.max(40, Math.abs(s) * 0.2);
        d = n.x + B * R, h = n.y - 40, K = t.x + B * R, S = t.y + 40;
      }
    else if (n.side === "right" && t.side === "left")
      s > 0 ? (d = n.x + s * 0.5, K = t.x - s * 0.5) : (d = n.x + 50, h = n.y - 50, K = t.x - 50, S = t.y - 50);
    else if (n.side === "left" && t.side === "right")
      s < 0 ? (d = n.x + s * 0.5, K = t.x - s * 0.5) : (d = n.x - 50, h = n.y - 50, K = t.x + 50, S = t.y - 50);
    else {
      const R = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, B = R[n.side] || { x: 0, y: 1 }, A = R[t.side] || { x: 0, y: -1 }, f = Math.min(60, Math.hypot(s, i) * 0.35);
      d = n.x + B.x * f, h = n.y + B.y * f, K = t.x + A.x * f, S = t.y + A.y * f;
    }
    const T = 0.125 * n.x + 0.375 * d + 0.375 * K + 0.125 * t.x, j = 0.125 * n.y + 0.375 * h + 0.375 * S + 0.125 * t.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${d} ${h} ${K} ${S} ${t.x} ${t.y}`,
      center: { x: T, y: j }
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
      const i = g.includes(n.id), d = w === n.id, { pathStr: h, center: K } = p ? Z(t, s) : x(t, s);
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
            l && d && m && /* @__PURE__ */ v("g", { transform: `translate(${K.x}, ${K.y})`, children: /* @__PURE__ */ tt(
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
  const l = Pt(
    o,
    e,
    g,
    c,
    r
  );
  return /* @__PURE__ */ v(Ht, { children: o.ports.map((I) => {
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
        onPointerDown: (w) => {
          w.stopPropagation(), C == null || C(o.id, I.id, !0, w);
        },
        onPointerUp: (w) => {
          w.stopPropagation(), a == null || a(o.id, I.id, !1);
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
  onMouseLeave: w,
  onClick: u,
  onPortPointerDown: p,
  onPortPointerUp: G,
  customRenderer: Z
}) => {
  const [x, n] = ot(!1);
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
        n(!1), w == null || w(o.id);
      },
      onClick: u,
      children: [
        a && x && /* @__PURE__ */ tt(Ht, { children: [
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
  customRenderer: w
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
    children: w ? /* @__PURE__ */ v(w, { container: o, selected: g }) : /* @__PURE__ */ tt(Ht, { children: [
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
  portPlacementMode: w,
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
  onEdgeCreate: K,
  onNodeDelete: S,
  onEdgeDelete: T
}) => {
  var Nt, Wt;
  const j = it(null), R = it(null);
  !a && !R.current && (R.current = new Ee());
  const B = a || R.current, {
    transform: A,
    screenToWorld: f,
    onWheel: E,
    startPan: Y,
    updatePan: H,
    endPan: b,
    resetTransform: P,
    zoomIn: W,
    zoomOut: N,
    zoomToFit: U,
    isPanning: M
  } = ke(j, x), { measurements: q, registerMeasureElement: X } = De(o), [O, Ct] = ot({ nodes: {}, containers: {} }), dt = fe(() => ({
    direction: I,
    mode: w ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: O.nodes
  }), [I, w, O.nodes]), [Q, pt] = ot(null), [J, Gt] = ot(null), Kt = it(!1), {
    dragState: ct,
    hoveredContainerId: Jt,
    handlePointerDown: Yt,
    handlePointerMove: _t,
    handlePointerUp: qt
  } = He(o, O, l, f, e);
  Dt(() => {
    const y = (L) => {
      var gt, $, At, Bt;
      if (L.target instanceof HTMLInputElement || L.target instanceof HTMLTextAreaElement || L.target instanceof HTMLElement && L.target.isContentEditable)
        return;
      const D = L.ctrlKey || L.metaKey, V = L.key.toLowerCase();
      if (c !== !1 && g) {
        if (D && V === "z") {
          L.preventDefault(), L.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (D && V === "y") {
          L.preventDefault(), g.redo();
          return;
        }
        if (D && V === "c" && t[0]) {
          L.preventDefault(), (gt = g.copyEntity) == null || gt.call(g, t[0]);
          return;
        }
        if (D && V === "x" && t[0]) {
          L.preventDefault(), ($ = g.cutEntity) == null || $.call(g, t[0]);
          return;
        }
        if (D && V === "v") {
          L.preventDefault(), (At = g.pasteEntity) == null || At.call(g);
          return;
        }
        if (L.key === "Delete" || L.key === "Backspace") {
          L.preventDefault(), (Bt = g.deleteSelection) == null || Bt.call(g, t), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
          return;
        }
      }
      if (L.key === "Escape") {
        L.preventDefault(), Gt(null), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (L.code === "Space" && (Kt.current = !0), L.key.toLowerCase() === "f" && !D) {
        L.preventDefault(), U(O);
        return;
      }
      if (D && V === "a") {
        L.preventDefault();
        const nt = [
          ...Object.keys(o.nodes),
          ...Object.keys(o.containers)
        ];
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: nt } });
        return;
      }
      const z = Object.keys(o.nodes);
      if (z.length !== 0) {
        if (L.key === "Tab") {
          L.preventDefault();
          const nt = t.length > 0 ? z.indexOf(t[0]) : -1;
          let st;
          L.shiftKey ? st = nt <= 0 ? z.length - 1 : nt - 1 : st = (nt + 1) % z.length, e({ type: "SELECTION_CHANGE", payload: { selectedIds: [z[st]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(L.key)) {
          L.preventDefault();
          const nt = t[0] || z[0], st = O.nodes[nt] || O.containers[nt];
          if (!st) return;
          const bt = {
            x: st.x + st.width / 2,
            y: st.y + st.height / 2
          };
          let ut = null, ft = 1 / 0;
          for (const et of z) {
            if (et === nt) continue;
            const _ = O.nodes[et];
            if (!_) continue;
            const at = {
              x: _.x + _.width / 2,
              y: _.y + _.height / 2
            }, lt = at.x - bt.x, rt = at.y - bt.y;
            let It = !1;
            if (L.key === "ArrowRight" && lt > 20 && (It = !0), L.key === "ArrowLeft" && lt < -20 && (It = !0), L.key === "ArrowDown" && rt > 20 && (It = !0), L.key === "ArrowUp" && rt < -20 && (It = !0), It) {
              const St = Math.hypot(lt, rt);
              St < ft && (ft = St, ut = et);
            }
          }
          ut && e({ type: "SELECTION_CHANGE", payload: { selectedIds: [ut] } });
        }
      }
    }, k = (L) => {
      L.code === "Space" && (Kt.current = !1);
    };
    return window.addEventListener("keydown", y), window.addEventListener("keyup", k), () => {
      window.removeEventListener("keydown", y), window.removeEventListener("keyup", k);
    };
  }, [o, O, t, U, e]), Dt(() => {
    let y = !1, k = 16 / 9;
    if (j.current) {
      const D = j.current.getBoundingClientRect();
      D.width > 0 && D.height > 0 && (k = D.width / D.height);
    }
    const L = {
      direction: I,
      aspectRatio: k,
      ...m
    };
    return B.execute(o, q, L).then((D) => {
      y || Ct(D);
    }), () => {
      y = !0;
    };
  }, [o, q, B, I, m]);
  const te = (y, k, L, D) => {
    const V = o.nodes[y] || o.containers[y], z = O.nodes[y] || O.containers[y];
    if (!V || !z) return;
    const $ = Pt(
      V,
      z,
      I,
      o.edges,
      dt
    ).get(k), At = $ ? { x: $.worldX, y: $.worldY } : { x: z.x + z.width, y: z.y + z.height / 2 };
    pt({
      sourceId: y,
      sourcePortId: k,
      startWorldPos: At,
      currentWorldPos: f(D.clientX, D.clientY)
    });
  }, ee = (y, k, L) => {
    var D, V, z, gt, $, At, Bt, nt, st, bt;
    if (Q && Q.sourceId !== y) {
      const ut = o.nodes[Q.sourceId] || o.containers[Q.sourceId], ft = o.nodes[y] || o.containers[y], et = (D = ut == null ? void 0 : ut.ports) == null ? void 0 : D.find((yt) => yt.id === Q.sourcePortId), _ = (V = ft == null ? void 0 : ft.ports) == null ? void 0 : V.find((yt) => yt.id === k);
      let at = Q.sourceId, lt = Q.sourcePortId, rt = y, It = k;
      const St = ((z = et == null ? void 0 : et.label) == null ? void 0 : z.toLowerCase().includes("in")) || (et == null ? void 0 : et.side) === (I === "BT" ? "bottom" : "top"), ce = ((gt = et == null ? void 0 : et.label) == null ? void 0 : gt.toLowerCase().includes("out")) || (et == null ? void 0 : et.side) === (I === "BT" ? "top" : "bottom"), ae = (($ = _ == null ? void 0 : _.label) == null ? void 0 : $.toLowerCase().includes("in")) || (_ == null ? void 0 : _.side) === (I === "BT" ? "bottom" : "top"), le = ((At = _ == null ? void 0 : _.label) == null ? void 0 : At.toLowerCase().includes("out")) || (_ == null ? void 0 : _.side) === (I === "BT" ? "top" : "bottom");
      if (St && le)
        at = y, lt = k, rt = Q.sourceId, It = Q.sourcePortId;
      else if (ce && ae)
        at = Q.sourceId, lt = Q.sourcePortId, rt = y, It = k;
      else if (O.nodes[Q.sourceId] && O.nodes[y]) {
        const yt = O.nodes[Q.sourceId], Mt = O.nodes[y], Ce = I === "BT" && yt.y < Mt.y, Ae = I === "TB" && yt.y > Mt.y;
        if (Ce || Ae) {
          at = y, rt = Q.sourceId;
          const Et = o.nodes[at], Zt = o.nodes[rt];
          lt = ((nt = (Bt = Et == null ? void 0 : Et.ports) == null ? void 0 : Bt.find((mt) => mt.label.includes("out") || mt.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : nt.id) || k, It = ((bt = (st = Zt == null ? void 0 : Zt.ports) == null ? void 0 : st.find((mt) => mt.label.includes("in") || mt.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : bt.id) || Q.sourcePortId;
        }
      }
      e({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: at,
            sourcePortId: lt,
            targetId: rt,
            targetPortId: It
          }
        }
      });
    }
    pt(null);
  }, ne = (y) => {
    if (y.button === 1 || Kt.current) {
      Y(y.clientX, y.clientY);
      return;
    }
    const k = y.target, L = k === j.current || k.classList.contains("sysflow-viewport") || k.classList.contains("sysflow-dom-layer") || k.tagName.toLowerCase() === "svg";
    if (y.button === 0 && L) {
      y.currentTarget.setPointerCapture(y.pointerId);
      const D = f(y.clientX, y.clientY);
      Gt({
        startX: D.x,
        startY: D.y,
        currentX: D.x,
        currentY: D.y
      }), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, se = (y) => {
    if (M.current)
      H(y.clientX, y.clientY);
    else if (J) {
      const k = f(y.clientX, y.clientY);
      Gt((L) => L ? { ...L, currentX: k.x, currentY: k.y } : null);
    } else ct ? _t(y) : Q && pt(
      (k) => k ? { ...k, currentWorldPos: f(y.clientX, y.clientY) } : null
    );
  }, oe = (y) => {
    if (y.currentTarget.hasPointerCapture(y.pointerId) && y.currentTarget.releasePointerCapture(y.pointerId), M.current && b(), J) {
      const k = Math.min(J.startX, J.currentX), L = Math.min(J.startY, J.currentY), D = Math.max(J.startX, J.currentX), V = Math.max(J.startY, J.currentY);
      if (D - k > 4 || V - L > 4) {
        const z = [];
        for (const [gt, $] of Object.entries(O.nodes))
          $.x < D && $.x + $.width > k && $.y < V && $.y + $.height > L && z.push(gt);
        for (const [gt, $] of Object.entries(O.containers))
          $.x < D && $.x + $.width > k && $.y < V && $.y + $.height > L && z.push(gt);
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: z } });
      }
      Gt(null);
    }
    ct && qt(y), Q && pt(null);
  }, ge = i ?? (m == null ? void 0 : m.mode) === "flow", wt = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (y) => {
    const k = Math.random() * 16 | 0;
    return (y === "x" ? k : k & 3 | 8).toString(16);
  }), Ie = d ?? i ?? (m == null ? void 0 : m.mode) === "flow", ie = F(
    (y, k) => {
      const L = wt(), D = wt(), V = I === "BT", z = V && k === "bottom" || !V && k === "top";
      h && h({
        id: L,
        type: y.type || "task",
        label: `New ${y.type || "task"}`,
        parentId: y.parentId ?? null
      }), K && (z ? K(L, y.id, D) : K(y.id, L, D)), e({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: y,
          position: k,
          direction: I,
          suggestedNewNodeId: L,
          suggestedNewEdgeId: D
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [L] }
      });
    },
    [I, e, h, K]
  ), de = F(
    (y) => {
      const k = wt(), L = wt(), D = wt(), V = o.nodes[y.sourceId], z = (V == null ? void 0 : V.type) || "task";
      T && T(y.id), h && h({
        id: k,
        type: z,
        label: `New ${z}`,
        parentId: (V == null ? void 0 : V.parentId) ?? null
      }), K && (K(y.sourceId, k, L), K(k, y.targetId, D)), e({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: y,
          direction: I,
          suggestedNewNodeId: k,
          suggestedNewEdge1Id: L,
          suggestedNewEdge2Id: D
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [k] }
      });
    },
    [I, o.nodes, e, h, K, T]
  ), re = Object.values(o.containers);
  return /* @__PURE__ */ tt(
    "div",
    {
      ref: j,
      className: `sysflow-canvas ${s === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${n}`,
      "data-theme": s,
      onWheel: E,
      onPointerDown: ne,
      onPointerMove: se,
      onPointerUp: oe,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ v(
          Ye,
          {
            graph: o,
            registerMeasureElement: X,
            nodeTypes: G,
            containerTypes: Z
          }
        ),
        /* @__PURE__ */ tt("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ v("button", { onClick: W, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ v("button", { onClick: N, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ tt("button", { onClick: P, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
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
              J && /* @__PURE__ */ v(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(J.startX, J.currentX)}px`,
                    top: `${Math.min(J.startY, J.currentY)}px`,
                    width: `${Math.abs(J.currentX - J.startX)}px`,
                    height: `${Math.abs(J.currentY - J.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              Q && /* @__PURE__ */ v("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ v(
                "line",
                {
                  x1: Q.startWorldPos.x,
                  y1: Q.startWorldPos.y,
                  x2: Q.currentWorldPos.x,
                  y2: Q.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ v("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: re.map((y) => {
                const k = O.containers[y.id];
                if (!k) return null;
                const L = Object.values(o.nodes).some((D) => D.parentId === y.id) || Object.values(o.containers).some((D) => D.parentId === y.id);
                return /* @__PURE__ */ v(
                  Re,
                  {
                    container: y,
                    layout: k,
                    selected: t.includes(y.id),
                    isHovered: Jt === y.id,
                    hasChildren: L,
                    customRenderer: y.type ? Z == null ? void 0 : Z[y.type] : void 0,
                    onToggleCollapse: (D, V) => e({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: D, collapsed: V }
                    }),
                    onPointerDown: Yt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (D) => {
                      D.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [y.id] } });
                    }
                  },
                  y.id
                );
              }) }),
              /* @__PURE__ */ v(
                Ne,
                {
                  graph: o,
                  layout: O,
                  selectedIds: t,
                  direction: I,
                  showArrows: p,
                  routing: u,
                  portOptions: dt,
                  enableEdgeQuickAdd: Ie,
                  onInsertNodeOnEdge: de,
                  onEdgeClick: (y) => e({ type: "SELECTION_CHANGE", payload: { selectedIds: [y] } })
                }
              ),
              /* @__PURE__ */ v("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(o.nodes).map((y) => {
                const k = O.nodes[y.id];
                return k ? /* @__PURE__ */ v(
                  Me,
                  {
                    node: y,
                    layout: k,
                    direction: I,
                    edges: o.edges,
                    portOptions: dt,
                    selected: t.includes(y.id),
                    customRenderer: y.type ? G == null ? void 0 : G[y.type] : void 0,
                    enableQuickAdd: ge,
                    onAddConnectedNode: ie,
                    onPointerDown: Yt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (L) => {
                      L.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [y.id] } }), r == null || r(y.id, y);
                    },
                    onPortPointerDown: te,
                    onPortPointerUp: ee
                  },
                  y.id
                ) : null;
              }) }),
              ct && /* @__PURE__ */ v(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ct.ghostPosition.x}px, ${ct.ghostPosition.y}px)`,
                    width: `${((Nt = q.get(ct.draggedEntity.id)) == null ? void 0 : Nt.width) || 200}px`,
                    height: `${((Wt = q.get(ct.draggedEntity.id)) == null ? void 0 : Wt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ v("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ct.draggedEntity.label })
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
  Pt as computeEntityPortLocations,
  Rt as pruneDanglingEdges,
  jt as resolveEffectiveEntityId,
  ke as useCanvasTransform,
  He as useDragGesture,
  Fe as useGraphHistory,
  De as useMeasurement
};
