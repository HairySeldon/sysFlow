var we = Object.defineProperty;
var Be = (s, n, g) => n in s ? we(s, n, { enumerable: !0, configurable: !0, writable: !0, value: g }) : s[n] = g;
var St = (s, n, g) => Be(s, typeof n != "symbol" ? n + "" : n, g);
import { useState as it, useRef as rt, useCallback as z, useEffect as vt, useMemo as Nt } from "react";
import { jsxs as _, jsx as W, Fragment as Mt } from "react/jsx-runtime";
function be(s, n, g, r) {
  const d = (u) => {
    const C = g.find(
      (L) => L.sourceId === n && L.sourcePortId === u || L.targetId === n && L.targetPortId === u
    );
    if (!C) return null;
    const I = C.sourceId === n ? C.targetId : C.sourceId, l = r[I];
    return l ? { x: l.x + l.width / 2, y: l.y + l.height / 2 } : null;
  };
  ["left", "right"].forEach((u) => {
    s[u].sort((C, I) => {
      var f, A;
      const l = ((f = d(C.id)) == null ? void 0 : f.y) ?? 0, L = ((A = d(I.id)) == null ? void 0 : A.y) ?? 0;
      return l - L;
    });
  }), ["top", "bottom"].forEach((u) => {
    s[u].sort((C, I) => {
      var f, A;
      const l = ((f = d(C.id)) == null ? void 0 : f.x) ?? 0, L = ((A = d(I.id)) == null ? void 0 : A.x) ?? 0;
      return l - L;
    });
  });
}
function me(s, n, g, r, d, u) {
  if (!d || !u)
    return g ? "left" : "right";
  const C = r.find(
    (A) => g ? A.targetId === s && A.targetPortId === n : A.sourceId === s && A.sourcePortId === n
  );
  if (!C) return g ? "left" : "right";
  const I = g ? C.sourceId : C.targetId, l = d[I];
  if (!l) return g ? "left" : "right";
  const L = l.x + l.width / 2 - (u.x + u.width / 2), f = l.y + l.height / 2 - (u.y + u.height / 2);
  return Math.abs(L) > Math.abs(f) ? L > 0 ? "right" : "left" : f > 0 ? "bottom" : "top";
}
function Lt(s, n, g = "LR", r, d) {
  const u = /* @__PURE__ */ new Map();
  if (!s || !n || !s.ports || s.ports.length === 0)
    return u;
  const C = (d == null ? void 0 : d.direction) || g, I = C === "TB" || C === "BT", l = (d == null ? void 0 : d.mode) || (I ? "strict-flow" : "perimeter-optimized"), L = r ? Array.isArray(r) ? r : Object.values(r) : [], f = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, A = new Set(
    L.filter((B) => B.targetId === s.id).map((B) => B.targetPortId)
  );
  new Set(
    L.filter((B) => B.sourceId === s.id).map((B) => B.sourcePortId)
  ), s.ports.forEach((B) => {
    let P = B.side || "auto";
    if (P !== "auto") {
      f[P].push(B);
      return;
    }
    if (l === "strict-flow") {
      const x = A.has(B.id) || B.label.toLowerCase().includes("in");
      switch (C) {
        case "BT":
          P = x ? "bottom" : "top";
          break;
        case "TB":
          P = x ? "top" : "bottom";
          break;
        case "RL":
          P = x ? "right" : "left";
          break;
        case "LR":
        default:
          P = x ? "left" : "right";
          break;
      }
    } else
      P = me(
        s.id,
        B.id,
        A.has(B.id),
        L,
        d == null ? void 0 : d.nodeLayouts,
        n
      );
    f[P].push(B);
  }), l === "perimeter-optimized" && (d != null && d.nodeLayouts) && be(f, s.id, L, d.nodeLayouts);
  const m = (B, P) => {
    const x = B.length;
    B.forEach((e, t) => {
      let o = 0, i = 0;
      P === "left" || P === "right" ? (i = n.height / (x + 1) * (t + 1), o = P === "left" ? 0 : n.width) : (o = n.width / (x + 1) * (t + 1), i = P === "top" ? 0 : n.height), u.set(e.id, {
        portId: e.id,
        side: P,
        localX: o,
        localY: i,
        worldX: n.x + o,
        worldY: n.y + i
      });
    });
  };
  return m(f.left, "left"), m(f.right, "right"), m(f.top, "top"), m(f.bottom, "bottom"), u;
}
function zt(s) {
  const n = {}, g = (r) => {
    var u;
    const d = s.nodes[r];
    return new Set(((u = d == null ? void 0 : d.ports) == null ? void 0 : u.map((C) => C.id)) || []);
  };
  for (const [r, d] of Object.entries(s.edges)) {
    const u = g(d.sourceId), C = g(d.targetId), I = u.has(d.sourcePortId), l = C.has(d.targetPortId);
    I && l && (n[r] = d);
  }
  return {
    ...s,
    edges: n
  };
}
class pe {
  static assignDynamicPortSides(n, g, r) {
    var u, C;
    const d = (I) => g[I] || r[I];
    for (const I of Object.values(n.edges)) {
      const l = d(I.sourceId), L = d(I.targetId);
      if (!l || !L) continue;
      const f = n.nodes[I.sourceId] || n.containers[I.sourceId], A = n.nodes[I.targetId] || n.containers[I.targetId], m = L.x + L.width / 2 - (l.x + l.width / 2), B = L.y + L.height / 2 - (l.y + l.height / 2), P = Math.abs(m) > Math.abs(B) * 1.25, x = (u = f == null ? void 0 : f.ports) == null ? void 0 : u.find((t) => t.id === I.sourcePortId);
      x && (!x.side || x.side === "auto") && (P ? x.side = m >= 0 ? "right" : "left" : x.side = B >= 0 ? "bottom" : "top");
      const e = (C = A == null ? void 0 : A.ports) == null ? void 0 : C.find((t) => t.id === I.targetPortId);
      e && (!e.side || e.side === "auto") && (P ? e.side = m >= 0 ? "left" : "right" : e.side = B >= 0 ? "top" : "bottom");
    }
  }
}
const Ft = 22, $t = 18, jt = 38, Wt = 210, Ut = 36, xe = 180, Ge = 54, Jt = 260, _t = 160;
class Rt {
  static execute(n, g, r) {
    var e;
    const d = {}, u = {}, C = (t) => {
      var c, b, Y, K, y;
      const o = !!n.containers[t], i = !!((c = n.containers[t]) != null && c.collapsed);
      return o && i ? { width: Wt, height: Ut } : o && !i ? {
        width: ((b = r.get(t)) == null ? void 0 : b.width) || Jt,
        height: ((Y = r.get(t)) == null ? void 0 : Y.height) || _t
      } : {
        width: ((K = r.get(t)) == null ? void 0 : K.width) || xe,
        height: ((y = r.get(t)) == null ? void 0 : y.height) || Ge
      };
    }, I = /* @__PURE__ */ new Map();
    for (const [t, o] of Object.entries(n.nodes)) {
      const i = o.parentId ?? null;
      I.has(i) || I.set(i, []), I.get(i).push(t);
    }
    for (const [t, o] of Object.entries(n.containers)) {
      const i = o.parentId ?? null;
      I.has(i) || I.set(i, []), I.get(i).push(t);
    }
    const l = Rt.getContainerDepths(n), L = Object.keys(n.containers).sort(
      (t, o) => (l.get(o) || 0) - (l.get(t) || 0)
    ), f = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), m = (t) => f.has(t) ? f.get(t) : C(t);
    for (const t of L) {
      if (!!((e = n.containers[t]) != null && e.collapsed)) {
        f.set(t, {
          width: Wt,
          height: Ut
        });
        continue;
      }
      const i = I.get(t) || [];
      if (i.length === 0) {
        f.set(t, {
          width: Jt,
          height: _t
        });
        continue;
      }
      const c = g.arrange(t, i, n, m);
      for (const K of c.boxes)
        A.set(K.id, K);
      const b = Math.max(c.width + Ft * 2, Wt), Y = c.height + jt + $t * 2;
      f.set(t, { width: b, height: Y });
    }
    const B = I.get(null) || [];
    let P = [];
    B.length > 0 && (P = g.arrange(null, B, n, m).boxes.map((o) => ({
      ...o,
      localX: o.localX + 60,
      localY: o.localY + 60
    })));
    const x = (t, o, i, c, b) => {
      var y;
      const Y = !!n.containers[t], K = { id: t, x: o, y: i, width: c, height: b };
      if (Y) {
        if (u[t] = K, (y = n.containers[t]) != null && y.collapsed) return;
        const D = o + Ft, E = i + jt + $t, h = I.get(t) || [];
        for (const G of h) {
          const p = A.get(G);
          p && x(
            G,
            D + p.localX,
            E + p.localY,
            p.width,
            p.height
          );
        }
      } else
        d[t] = K;
    };
    for (const t of P)
      x(t.id, t.localX, t.localY, t.width, t.height);
    return pe.assignDynamicPortSides(n, d, u), { nodes: d, containers: u };
  }
  static getContainerDepths(n) {
    const g = /* @__PURE__ */ new Map(), r = (d) => {
      var I;
      if (g.has(d)) return g.get(d);
      const u = (I = n.containers[d]) == null ? void 0 : I.parentId;
      if (!u || !n.containers[u])
        return g.set(d, 0), 0;
      const C = 1 + r(u);
      return g.set(d, C), C;
    };
    for (const d of Object.keys(n.containers))
      r(d);
    return g;
  }
}
const Se = 70, Dt = 28;
class Le {
  constructor(n = {}) {
    this.options = n;
  }
  arrange(n, g, r, d) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const u = this.options.direction ?? "TB", C = u === "TB" || u === "BT", I = u === "BT" || u === "RL", l = new Set(g), L = [], f = /* @__PURE__ */ new Set();
    for (const h of Object.values(r.edges)) {
      const G = this.resolveToDirectChild(h.sourceId, l, r), p = this.resolveToDirectChild(h.targetId, l, r);
      if (G && p && G !== p) {
        const v = `${G}->${p}`;
        f.has(v) || (f.add(v), L.push({ sourceId: G, targetId: p }));
      }
    }
    const A = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), B = /* @__PURE__ */ new Map(), P = /* @__PURE__ */ new Map();
    for (const h of g)
      A.set(h, 0), m.set(h, 0), B.set(h, []), P.set(h, []);
    for (const h of L)
      B.get(h.sourceId).push(h.targetId), P.get(h.targetId).push(h.sourceId), A.set(h.targetId, (A.get(h.targetId) || 0) + 1), m.set(h.sourceId, (m.get(h.sourceId) || 0) + 1);
    const x = /* @__PURE__ */ new Map();
    if (I) {
      const h = /* @__PURE__ */ new Map(), G = g.filter((Z) => (m.get(Z) || 0) === 0);
      for (const Z of G) h.set(Z, 0);
      const p = /* @__PURE__ */ new Set();
      for (; G.length > 0; ) {
        const Z = G.shift();
        p.add(Z);
        const X = h.get(Z);
        for (const w of P.get(Z)) {
          const R = Math.max(h.get(w) || 0, X + 1);
          h.set(w, R), m.set(w, m.get(w) - 1), m.get(w) === 0 && G.push(w);
        }
      }
      let v = 0;
      for (const Z of h.values())
        v = Math.max(v, Z);
      for (const Z of g) {
        const X = p.has(Z) ? h.get(Z) : v;
        x.set(Z, v - X);
      }
    } else {
      const h = g.filter((p) => (A.get(p) || 0) === 0);
      for (const p of h) x.set(p, 0);
      const G = /* @__PURE__ */ new Set();
      for (; h.length > 0; ) {
        const p = h.shift();
        G.add(p);
        const v = x.get(p);
        for (const Z of B.get(p)) {
          const X = Math.max(x.get(Z) || 0, v + 1);
          x.set(Z, X), A.set(Z, A.get(Z) - 1), A.get(Z) === 0 && h.push(Z);
        }
      }
      for (const p of g)
        G.has(p) || x.set(p, 0);
    }
    const e = /* @__PURE__ */ new Map();
    for (const [h, G] of x.entries())
      e.has(G) || e.set(G, []), e.get(G).push(h);
    const t = Array.from(e.keys()).sort((h, G) => h - G), o = I ? [...t].reverse() : t, i = /* @__PURE__ */ new Map(), c = (h) => {
      const G = d(h);
      return C ? G.width : G.height;
    };
    for (const h of t) {
      const G = e.get(h) || [];
      G.sort((v, Z) => {
        var O, V;
        const X = (((O = P.get(v)) == null ? void 0 : O.length) || 0) > 0 ? 0 : 1, w = (((V = P.get(Z)) == null ? void 0 : V.length) || 0) > 0 ? 0 : 1;
        if (X !== w) return X - w;
        const R = this.getAvgNeighborPos(P.get(v) || [], i, c), N = this.getAvgNeighborPos(P.get(Z) || [], i, c);
        return R !== null && N !== null && R !== N ? R - N : 0;
      });
      let p = -1 / 0;
      for (const v of G) {
        const Z = c(v), X = P.get(v) || [], w = this.getAvgNeighborPos(X, i, c);
        let R = w !== null ? w - Z / 2 : 0;
        R < p + Dt && (R = p === -1 / 0 ? 0 : p + Dt), i.set(v, R), p = R + Z;
      }
    }
    for (let h = t.length - 1; h >= 0; h--) {
      const G = t[h], p = e.get(G) || [];
      for (const Z of p) {
        const X = B.get(Z) || [];
        if (X.length === 0) continue;
        const w = this.getAvgNeighborPos(X, i, c);
        if (w !== null) {
          const R = c(Z);
          i.set(Z, w - R / 2);
        }
      }
      let v = -1 / 0;
      for (const Z of p) {
        const X = c(Z);
        let w = i.get(Z) ?? 0;
        w < v + Dt && (w = v === -1 / 0 ? 0 : v + Dt, i.set(Z, w)), v = w + X;
      }
    }
    let b = 1 / 0;
    for (const h of i.values())
      b = Math.min(b, h);
    const Y = Number.isFinite(b) && b !== 0 ? -b : 0, K = [];
    let y = 0;
    for (const h of o) {
      const G = e.get(h);
      let p = 0;
      for (const v of G) {
        const Z = d(v), X = C ? Z.height : Z.width, w = (i.get(v) ?? 0) + Y, R = C ? w : y, N = C ? y : w;
        K.push({ id: v, localX: R, localY: N, width: Z.width, height: Z.height }), p = Math.max(p, X);
      }
      y += p + Se;
    }
    const D = Math.max(...K.map((h) => h.localX + h.width), 0), E = Math.max(...K.map((h) => h.localY + h.height), 0);
    return { width: D, height: E, boxes: K };
  }
  getAvgNeighborPos(n, g, r) {
    if (n.length === 0) return null;
    const d = n.map((u) => {
      const C = g.get(u);
      return C === void 0 ? null : C + r(u) / 2;
    }).filter((u) => u !== null);
    return d.length === 0 ? null : d.reduce((u, C) => u + C, 0) / d.length;
  }
  resolveToDirectChild(n, g, r) {
    var u, C;
    let d = n;
    for (; d; ) {
      if (g.has(d)) return d;
      d = ((u = r.nodes[d]) == null ? void 0 : u.parentId) ?? ((C = r.containers[d]) == null ? void 0 : C.parentId) ?? null;
    }
    return null;
  }
}
const yt = 32, qt = 24;
class Ke {
  constructor(n = 1.55) {
    this.targetAspect = n;
  }
  arrange(n, g, r, d) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const u = g.map((I) => {
      const l = d(I);
      return { id: I, width: l.width, height: l.height };
    }), C = this.findBestTightPacking(u, this.targetAspect);
    return { width: C.width, height: C.height, boxes: C.boxes };
  }
  findBestTightPacking(n, g) {
    if (n.length === 1)
      return {
        width: n[0].width,
        height: n[0].height,
        boxes: [{ id: n[0].id, localX: 0, localY: 0, width: n[0].width, height: n[0].height }],
        score: 0
      };
    const r = n.reduce((A, m) => A + m.width * m.height, 0), d = Math.max(...n.map((A) => A.width)), u = [...n].sort((A, m) => m.width - A.width), C = /* @__PURE__ */ new Set(), I = n.reduce((A, m) => A + m.width, 0) + (n.length - 1) * yt;
    C.add(I), C.add(d);
    const l = Math.max(d, Math.sqrt(r * g));
    C.add(l), C.add(l * 0.85), C.add(l * 1.15);
    const L = Math.min(n.length, 6);
    for (let A = 2; A <= L; A++) {
      let m = 0;
      for (let B = 0; B < A && B < u.length; B++)
        m += u[B].width;
      m += (A - 1) * yt, m >= d && C.add(m);
    }
    let f = null;
    for (const A of C) {
      const m = this.simulateSkylinePacking(n, A), B = m.width * m.height, P = Math.max(0, B - r), x = m.width / Math.max(1, m.height), e = Math.abs(Math.log(x / g)), t = P / r * 2 + e * 0.25;
      m.score = t, (!f || t < f.score) && (f = m);
    }
    return f;
  }
  simulateSkylinePacking(n, g) {
    const r = [...n].sort((l, L) => L.height - l.height), d = [{ x: 0, width: g, y: 0 }], u = [];
    for (const l of r) {
      let L = 1 / 0, f = -1;
      for (let t = 0; t < d.length; t++) {
        if (d[t].x + l.width > g) continue;
        let i = 0, c = 0;
        for (let b = t; b < d.length && c < l.width; b++)
          i = Math.max(i, d[b].y), c += d[b].width;
        i < L && (L = i, f = t);
      }
      if (f === -1) {
        const t = Math.max(...d.map((i) => i.y)), o = t === 0 ? 0 : t + qt;
        u.push({ id: l.id, localX: 0, localY: o, width: l.width, height: l.height }), d.length = 0, d.push({ x: 0, width: l.width + yt, y: o + l.height }), g > l.width + yt && d.push({
          x: l.width + yt,
          width: g - (l.width + yt),
          y: 0
        });
        continue;
      }
      const A = d[f].x, m = L === 0 ? 0 : L + qt;
      u.push({ id: l.id, localX: A, localY: m, width: l.width, height: l.height });
      const B = l.width + yt, P = m + l.height, x = { x: A, width: B, y: P }, e = [];
      for (const t of d)
        t.x + t.width <= A || t.x >= A + B ? e.push(t) : (t.x < A && e.push({ x: t.x, width: A - t.x, y: t.y }), t.x + t.width > A + B && e.push({
          x: A + B,
          width: t.x + t.width - (A + B),
          y: t.y
        }));
      e.push(x), e.sort((t, o) => t.x - o.x), d.length = 0, d.push(...e);
    }
    const C = Math.max(...u.map((l) => l.localX + l.width), 0), I = Math.max(...u.map((l) => l.localY + l.height), 0);
    return { width: C, height: I, boxes: u, score: 0 };
  }
}
function te(s, n, g) {
  var u, C;
  let r = s, d = null;
  for (; r; )
    g.has(r) && (d = r), r = ((u = n.nodes[r]) == null ? void 0 : u.parentId) ?? ((C = n.containers[r]) == null ? void 0 : C.parentId) ?? void 0;
  return d ?? s;
}
class Ee {
  async execute(n, g, r) {
    const d = Object.values(n.containers), u = new Set(
      d.filter((A) => !!A.collapsed).map((A) => A.id)
    ), C = {};
    for (const [A, m] of Object.entries(n.edges)) {
      const B = te(m.sourceId, n, u), P = te(m.targetId, n, u);
      B !== P && (C[A] = {
        ...m,
        sourceId: B,
        targetId: P
      });
    }
    const I = {
      ...n,
      edges: C
    }, l = Object.keys(n.containers).length, f = (r != null && r.mode && r.mode !== "auto" ? r.mode : l > 0 ? "concurrent" : "flow") === "concurrent" ? new Ke((r == null ? void 0 : r.aspectRatio) ?? 1.55) : new Le(r);
    return Rt.execute(I, f, g);
  }
}
const ne = "Y2xhc3MgViB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgYykgewogICAgdmFyIHMsIGE7CiAgICBjb25zdCBuID0gKGcpID0+IGRbZ10gfHwgY1tnXTsKICAgIGZvciAoY29uc3QgZyBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHIgPSBuKGcuc291cmNlSWQpLCBBID0gbihnLnRhcmdldElkKTsKICAgICAgaWYgKCFyIHx8ICFBKSBjb250aW51ZTsKICAgICAgY29uc3QgeSA9IGUubm9kZXNbZy5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2cuc291cmNlSWRdLCBpID0gZS5ub2Rlc1tnLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbZy50YXJnZXRJZF0sIGggPSBBLnggKyBBLndpZHRoIC8gMiAtIChyLnggKyByLndpZHRoIC8gMiksIHggPSBBLnkgKyBBLmhlaWdodCAvIDIgLSAoci55ICsgci5oZWlnaHQgLyAyKSwgdiA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnMoeCkgKiAxLjI1LCBDID0gKHMgPSB5ID09IG51bGwgPyB2b2lkIDAgOiB5LnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogcy5maW5kKCh0KSA9PiB0LmlkID09PSBnLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmICh2ID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHggPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBwID0gKGEgPSBpID09IG51bGwgPyB2b2lkIDAgOiBpLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBnLnRhcmdldFBvcnRJZCk7CiAgICAgIHAgJiYgKCFwLnNpZGUgfHwgcC5zaWRlID09PSAiYXV0byIpICYmICh2ID8gcC5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IHAuc2lkZSA9IHggPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBqID0gMjIsIEwgPSAxOCwgRiA9IDM4LCBSID0gMjEwLCBxID0gMzYsIEogPSAxODAsIFEgPSA1NCwgVSA9IDI2MCwgSyA9IDE2MDsKY2xhc3MgVyB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgYykgewogICAgdmFyIHA7CiAgICBjb25zdCBuID0ge30sIHMgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciBQLCBiLCBTLCBULCBOOwogICAgICBjb25zdCBtID0gISFlLmNvbnRhaW5lcnNbdF0sIHUgPSAhISgoUCA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiBQLmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBtICYmIHUgPyB7IHdpZHRoOiBSLCBoZWlnaHQ6IHEgfSA6IG0gJiYgIXUgPyB7CiAgICAgICAgd2lkdGg6ICgoYiA9IGMuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogYi53aWR0aCkgfHwgVSwKICAgICAgICBoZWlnaHQ6ICgoUyA9IGMuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUy5oZWlnaHQpIHx8IEsKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChUID0gYy5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBULndpZHRoKSB8fCBKLAogICAgICAgIGhlaWdodDogKChOID0gYy5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBOLmhlaWdodCkgfHwgUQogICAgICB9OwogICAgfSwgZyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBtXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB1ID0gbS5wYXJlbnRJZCA/PyBudWxsOwogICAgICBnLmhhcyh1KSB8fCBnLnNldCh1LCBbXSksIGcuZ2V0KHUpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBtXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHUgPSBtLnBhcmVudElkID8/IG51bGw7CiAgICAgIGcuaGFzKHUpIHx8IGcuc2V0KHUsIFtdKSwgZy5nZXQodSkucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IHIgPSBXLmdldENvbnRhaW5lckRlcHRocyhlKSwgQSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIG0pID0+IChyLmdldChtKSB8fCAwKSAtIChyLmdldCh0KSB8fCAwKQogICAgKSwgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHkuaGFzKHQpID8geS5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEEpIHsKICAgICAgaWYgKCEhKChwID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIHAuY29sbGFwc2VkKSkgewogICAgICAgIHkuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBSLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdSA9IGcuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAodS5sZW5ndGggPT09IDApIHsKICAgICAgICB5LnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogVSwKICAgICAgICAgIGhlaWdodDogSwogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IFAgPSBkLmFycmFuZ2UodCwgdSwgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgVCBvZiBQLmJveGVzKQogICAgICAgIGkuc2V0KFQuaWQsIFQpOwogICAgICBjb25zdCBiID0gTWF0aC5tYXgoUC53aWR0aCArIGogKiAyLCBSKSwgUyA9IFAuaGVpZ2h0ICsgRiArIEwgKiAyOwogICAgICB5LnNldCh0LCB7IHdpZHRoOiBiLCBoZWlnaHQ6IFMgfSk7CiAgICB9CiAgICBjb25zdCB4ID0gZy5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgdiA9IFtdOwogICAgeC5sZW5ndGggPiAwICYmICh2ID0gZC5hcnJhbmdlKG51bGwsIHgsIGUsIGgpLmJveGVzLm1hcCgobSkgPT4gKHsKICAgICAgLi4ubSwKICAgICAgbG9jYWxYOiBtLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IG0ubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIG0sIHUsIFAsIGIpID0+IHsKICAgICAgdmFyIE47CiAgICAgIGNvbnN0IFMgPSAhIWUuY29udGFpbmVyc1t0XSwgVCA9IHsgaWQ6IHQsIHg6IG0sIHk6IHUsIHdpZHRoOiBQLCBoZWlnaHQ6IGIgfTsKICAgICAgaWYgKFMpIHsKICAgICAgICBpZiAoc1t0XSA9IFQsIChOID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE4uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IG0gKyBqLCBCID0gdSArIEYgKyBMLCBvID0gZy5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCB3IG9mIG8pIHsKICAgICAgICAgIGNvbnN0IGYgPSBpLmdldCh3KTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgdywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBCICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IFQ7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIHYpCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gVi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHMpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiBzIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGMgPSAobikgPT4gewogICAgICB2YXIgZzsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHMgPSAoZyA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGcucGFyZW50SWQ7CiAgICAgIGlmICghcyB8fCAhZS5jb250YWluZXJzW3NdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBjKHMpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGMobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgWiA9IDcwLCBZID0gMjg7CmNsYXNzIHR0IHsKICBjb25zdHJ1Y3RvcihlID0ge30pIHsKICAgIHRoaXMub3B0aW9ucyA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgYywgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHMgPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID8/ICJUQiIsIGEgPSBzID09PSAiVEIiIHx8IHMgPT09ICJCVCIsIGcgPSBzID09PSAiQlQiIHx8IHMgPT09ICJSTCIsIHIgPSBuZXcgU2V0KGQpLCBBID0gW10sIHkgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yIChjb25zdCBvIG9mIE9iamVjdC52YWx1ZXMoYy5lZGdlcykpIHsKICAgICAgY29uc3QgdyA9IHRoaXMucmVzb2x2ZVRvRGlyZWN0Q2hpbGQoby5zb3VyY2VJZCwgciwgYyksIGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8udGFyZ2V0SWQsIHIsIGMpOwogICAgICBpZiAodyAmJiBmICYmIHcgIT09IGYpIHsKICAgICAgICBjb25zdCBJID0gYCR7d30tPiR7Zn1gOwogICAgICAgIHkuaGFzKEkpIHx8ICh5LmFkZChJKSwgQS5wdXNoKHsgc291cmNlSWQ6IHcsIHRhcmdldElkOiBmIH0pKTsKICAgICAgfQogICAgfQogICAgY29uc3QgaSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGggPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCB4ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgaS5zZXQobywgMCksIGguc2V0KG8sIDApLCB4LnNldChvLCBbXSksIHYuc2V0KG8sIFtdKTsKICAgIGZvciAoY29uc3QgbyBvZiBBKQogICAgICB4LmdldChvLnNvdXJjZUlkKS5wdXNoKG8udGFyZ2V0SWQpLCB2LmdldChvLnRhcmdldElkKS5wdXNoKG8uc291cmNlSWQpLCBpLnNldChvLnRhcmdldElkLCAoaS5nZXQoby50YXJnZXRJZCkgfHwgMCkgKyAxKSwgaC5zZXQoby5zb3VyY2VJZCwgKGguZ2V0KG8uc291cmNlSWQpIHx8IDApICsgMSk7CiAgICBjb25zdCBDID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGlmIChnKSB7CiAgICAgIGNvbnN0IG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCB3ID0gZC5maWx0ZXIoKGwpID0+IChoLmdldChsKSB8fCAwKSA9PT0gMCk7CiAgICAgIGZvciAoY29uc3QgbCBvZiB3KSBvLnNldChsLCAwKTsKICAgICAgY29uc3QgZiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICAgIGZvciAoOyB3Lmxlbmd0aCA+IDA7ICkgewogICAgICAgIGNvbnN0IGwgPSB3LnNoaWZ0KCk7CiAgICAgICAgZi5hZGQobCk7CiAgICAgICAgY29uc3QgRCA9IG8uZ2V0KGwpOwogICAgICAgIGZvciAoY29uc3QgTSBvZiB2LmdldChsKSkgewogICAgICAgICAgY29uc3QgRSA9IE1hdGgubWF4KG8uZ2V0KE0pIHx8IDAsIEQgKyAxKTsKICAgICAgICAgIG8uc2V0KE0sIEUpLCBoLnNldChNLCBoLmdldChNKSAtIDEpLCBoLmdldChNKSA9PT0gMCAmJiB3LnB1c2goTSk7CiAgICAgICAgfQogICAgICB9CiAgICAgIGxldCBJID0gMDsKICAgICAgZm9yIChjb25zdCBsIG9mIG8udmFsdWVzKCkpCiAgICAgICAgSSA9IE1hdGgubWF4KEksIGwpOwogICAgICBmb3IgKGNvbnN0IGwgb2YgZCkgewogICAgICAgIGNvbnN0IEQgPSBmLmhhcyhsKSA/IG8uZ2V0KGwpIDogSTsKICAgICAgICBDLnNldChsLCBJIC0gRCk7CiAgICAgIH0KICAgIH0gZWxzZSB7CiAgICAgIGNvbnN0IG8gPSBkLmZpbHRlcigoZikgPT4gKGkuZ2V0KGYpIHx8IDApID09PSAwKTsKICAgICAgZm9yIChjb25zdCBmIG9mIG8pIEMuc2V0KGYsIDApOwogICAgICBjb25zdCB3ID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgICAgZm9yICg7IG8ubGVuZ3RoID4gMDsgKSB7CiAgICAgICAgY29uc3QgZiA9IG8uc2hpZnQoKTsKICAgICAgICB3LmFkZChmKTsKICAgICAgICBjb25zdCBJID0gQy5nZXQoZik7CiAgICAgICAgZm9yIChjb25zdCBsIG9mIHguZ2V0KGYpKSB7CiAgICAgICAgICBjb25zdCBEID0gTWF0aC5tYXgoQy5nZXQobCkgfHwgMCwgSSArIDEpOwogICAgICAgICAgQy5zZXQobCwgRCksIGkuc2V0KGwsIGkuZ2V0KGwpIC0gMSksIGkuZ2V0KGwpID09PSAwICYmIG8ucHVzaChsKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgZm9yIChjb25zdCBmIG9mIGQpCiAgICAgICAgdy5oYXMoZikgfHwgQy5zZXQoZiwgMCk7CiAgICB9CiAgICBjb25zdCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW28sIHddIG9mIEMuZW50cmllcygpKQogICAgICBwLmhhcyh3KSB8fCBwLnNldCh3LCBbXSksIHAuZ2V0KHcpLnB1c2gobyk7CiAgICBjb25zdCB0ID0gQXJyYXkuZnJvbShwLmtleXMoKSkuc29ydCgobywgdykgPT4gbyAtIHcpLCBtID0gZyA/IFsuLi50XS5yZXZlcnNlKCkgOiB0LCB1ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgUCA9IChvKSA9PiB7CiAgICAgIGNvbnN0IHcgPSBuKG8pOwogICAgICByZXR1cm4gYSA/IHcud2lkdGggOiB3LmhlaWdodDsKICAgIH07CiAgICBmb3IgKGNvbnN0IG8gb2YgdCkgewogICAgICBjb25zdCB3ID0gcC5nZXQobykgfHwgW107CiAgICAgIHcuc29ydCgoSSwgbCkgPT4gewogICAgICAgIHZhciBYLCBHOwogICAgICAgIGNvbnN0IEQgPSAoKChYID0gdi5nZXQoSSkpID09IG51bGwgPyB2b2lkIDAgOiBYLmxlbmd0aCkgfHwgMCkgPiAwID8gMCA6IDEsIE0gPSAoKChHID0gdi5nZXQobCkpID09IG51bGwgPyB2b2lkIDAgOiBHLmxlbmd0aCkgfHwgMCkgPiAwID8gMCA6IDE7CiAgICAgICAgaWYgKEQgIT09IE0pIHJldHVybiBEIC0gTTsKICAgICAgICBjb25zdCBFID0gdGhpcy5nZXRBdmdOZWlnaGJvclBvcyh2LmdldChJKSB8fCBbXSwgdSwgUCksIGsgPSB0aGlzLmdldEF2Z05laWdoYm9yUG9zKHYuZ2V0KGwpIHx8IFtdLCB1LCBQKTsKICAgICAgICByZXR1cm4gRSAhPT0gbnVsbCAmJiBrICE9PSBudWxsICYmIEUgIT09IGsgPyBFIC0gayA6IDA7CiAgICAgIH0pOwogICAgICBsZXQgZiA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCBJIG9mIHcpIHsKICAgICAgICBjb25zdCBsID0gUChJKSwgRCA9IHYuZ2V0KEkpIHx8IFtdLCBNID0gdGhpcy5nZXRBdmdOZWlnaGJvclBvcyhELCB1LCBQKTsKICAgICAgICBsZXQgRSA9IE0gIT09IG51bGwgPyBNIC0gbCAvIDIgOiAwOwogICAgICAgIEUgPCBmICsgWSAmJiAoRSA9IGYgPT09IC0xIC8gMCA/IDAgOiBmICsgWSksIHUuc2V0KEksIEUpLCBmID0gRSArIGw7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSB0Lmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IHcgPSB0W29dLCBmID0gcC5nZXQodykgfHwgW107CiAgICAgIGZvciAoY29uc3QgbCBvZiBmKSB7CiAgICAgICAgY29uc3QgRCA9IHguZ2V0KGwpIHx8IFtdOwogICAgICAgIGlmIChELmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgTSA9IHRoaXMuZ2V0QXZnTmVpZ2hib3JQb3MoRCwgdSwgUCk7CiAgICAgICAgaWYgKE0gIT09IG51bGwpIHsKICAgICAgICAgIGNvbnN0IEUgPSBQKGwpOwogICAgICAgICAgdS5zZXQobCwgTSAtIEUgLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IEkgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgbCBvZiBmKSB7CiAgICAgICAgY29uc3QgRCA9IFAobCk7CiAgICAgICAgbGV0IE0gPSB1LmdldChsKSA/PyAwOwogICAgICAgIE0gPCBJICsgWSAmJiAoTSA9IEkgPT09IC0xIC8gMCA/IDAgOiBJICsgWSwgdS5zZXQobCwgTSkpLCBJID0gTSArIEQ7CiAgICAgIH0KICAgIH0KICAgIGxldCBiID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdS52YWx1ZXMoKSkKICAgICAgYiA9IE1hdGgubWluKGIsIG8pOwogICAgY29uc3QgUyA9IE51bWJlci5pc0Zpbml0ZShiKSAmJiBiICE9PSAwID8gLWIgOiAwLCBUID0gW107CiAgICBsZXQgTiA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgbSkgewogICAgICBjb25zdCB3ID0gcC5nZXQobyk7CiAgICAgIGxldCBmID0gMDsKICAgICAgZm9yIChjb25zdCBJIG9mIHcpIHsKICAgICAgICBjb25zdCBsID0gbihJKSwgRCA9IGEgPyBsLmhlaWdodCA6IGwud2lkdGgsIE0gPSAodS5nZXQoSSkgPz8gMCkgKyBTLCBFID0gYSA/IE0gOiBOLCBrID0gYSA/IE4gOiBNOwogICAgICAgIFQucHVzaCh7IGlkOiBJLCBsb2NhbFg6IEUsIGxvY2FsWTogaywgd2lkdGg6IGwud2lkdGgsIGhlaWdodDogbC5oZWlnaHQgfSksIGYgPSBNYXRoLm1heChmLCBEKTsKICAgICAgfQogICAgICBOICs9IGYgKyBaOwogICAgfQogICAgY29uc3QgSCA9IE1hdGgubWF4KC4uLlQubWFwKChvKSA9PiBvLmxvY2FsWCArIG8ud2lkdGgpLCAwKSwgQiA9IE1hdGgubWF4KC4uLlQubWFwKChvKSA9PiBvLmxvY2FsWSArIG8uaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogSCwgaGVpZ2h0OiBCLCBib3hlczogVCB9OwogIH0KICBnZXRBdmdOZWlnaGJvclBvcyhlLCBkLCBjKSB7CiAgICBpZiAoZS5sZW5ndGggPT09IDApIHJldHVybiBudWxsOwogICAgY29uc3QgbiA9IGUubWFwKChzKSA9PiB7CiAgICAgIGNvbnN0IGEgPSBkLmdldChzKTsKICAgICAgcmV0dXJuIGEgPT09IHZvaWQgMCA/IG51bGwgOiBhICsgYyhzKSAvIDI7CiAgICB9KS5maWx0ZXIoKHMpID0+IHMgIT09IG51bGwpOwogICAgcmV0dXJuIG4ubGVuZ3RoID09PSAwID8gbnVsbCA6IG4ucmVkdWNlKChzLCBhKSA9PiBzICsgYSwgMCkgLyBuLmxlbmd0aDsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgYykgewogICAgdmFyIHMsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHMgPSBjLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogcy5wYXJlbnRJZCkgPz8gKChhID0gYy5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBfID0gMzIsICQgPSAyNDsKY2xhc3MgZXQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgYywgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHMgPSBkLm1hcCgoZykgPT4gewogICAgICBjb25zdCByID0gbihnKTsKICAgICAgcmV0dXJuIHsgaWQ6IGcsIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcocywgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBjID0gZS5yZWR1Y2UoKGksIGgpID0+IGkgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKGkpID0+IGkud2lkdGgpKSwgcyA9IFsuLi5lXS5zb3J0KChpLCBoKSA9PiBoLndpZHRoIC0gaS53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBnID0gZS5yZWR1Y2UoKGksIGgpID0+IGkgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogXzsKICAgIGEuYWRkKGcpLCBhLmFkZChuKTsKICAgIGNvbnN0IHIgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoYyAqIGQpKTsKICAgIGEuYWRkKHIpLCBhLmFkZChyICogMC44NSksIGEuYWRkKHIgKiAxLjE1KTsKICAgIGNvbnN0IEEgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBpID0gMjsgaSA8PSBBOyBpKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGkgJiYgeCA8IHMubGVuZ3RoOyB4KyspCiAgICAgICAgaCArPSBzW3hdLndpZHRoOwogICAgICBoICs9IChpIC0gMSkgKiBfLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgeSA9IG51bGw7CiAgICBmb3IgKGNvbnN0IGkgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGkpLCB4ID0gaC53aWR0aCAqIGguaGVpZ2h0LCB2ID0gTWF0aC5tYXgoMCwgeCAtIGMpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgcCA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSB2IC8gYyAqIDIgKyBwICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICgheSB8fCB0IDwgeS5zY29yZSkgJiYgKHkgPSBoKTsKICAgIH0KICAgIHJldHVybiB5OwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGMgPSBbLi4uZV0uc29ydCgociwgQSkgPT4gQS5oZWlnaHQgLSByLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgcyA9IFtdOwogICAgZm9yIChjb25zdCByIG9mIGMpIHsKICAgICAgbGV0IEEgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgci53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB1ID0gMCwgUCA9IDA7CiAgICAgICAgZm9yIChsZXQgYiA9IHQ7IGIgPCBuLmxlbmd0aCAmJiBQIDwgci53aWR0aDsgYisrKQogICAgICAgICAgdSA9IE1hdGgubWF4KHUsIG5bYl0ueSksIFAgKz0gbltiXS53aWR0aDsKICAgICAgICB1IDwgQSAmJiAoQSA9IHUsIHkgPSB0KTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHUpID0+IHUueSkpLCBtID0gdCA9PT0gMCA/IDAgOiB0ICsgJDsKICAgICAgICBzLnB1c2goeyBpZDogci5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IG0sIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiByLndpZHRoICsgXywgeTogbSArIHIuaGVpZ2h0IH0pLCBkID4gci53aWR0aCArIF8gJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IHIud2lkdGggKyBfLAogICAgICAgICAgd2lkdGg6IGQgLSAoci53aWR0aCArIF8pLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IGkgPSBuW3ldLngsIGggPSBBID09PSAwID8gMCA6IEEgKyAkOwogICAgICBzLnB1c2goeyBpZDogci5pZCwgbG9jYWxYOiBpLCBsb2NhbFk6IGgsIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH0pOwogICAgICBjb25zdCB4ID0gci53aWR0aCArIF8sIHYgPSBoICsgci5oZWlnaHQsIEMgPSB7IHg6IGksIHdpZHRoOiB4LCB5OiB2IH0sIHAgPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBpIHx8IHQueCA+PSBpICsgeCA/IHAucHVzaCh0KSA6ICh0LnggPCBpICYmIHAucHVzaCh7IHg6IHQueCwgd2lkdGg6IGkgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IGkgKyB4ICYmIHAucHVzaCh7CiAgICAgICAgICB4OiBpICsgeCwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKGkgKyB4KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgcC5wdXNoKEMpLCBwLnNvcnQoKHQsIG0pID0+IHQueCAtIG0ueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLnApOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnMubWFwKChyKSA9PiByLmxvY2FsWCArIHIud2lkdGgpLCAwKSwgZyA9IE1hdGgubWF4KC4uLnMubWFwKChyKSA9PiByLmxvY2FsWSArIHIuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBnLCBib3hlczogcywgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24geihPLCBlLCBkKSB7CiAgdmFyIHMsIGE7CiAgbGV0IGMgPSBPLCBuID0gbnVsbDsKICBmb3IgKDsgYzsgKQogICAgZC5oYXMoYykgJiYgKG4gPSBjKSwgYyA9ICgocyA9IGUubm9kZXNbY10pID09IG51bGwgPyB2b2lkIDAgOiBzLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbY10pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gTzsKfQpjbGFzcyBudCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBjKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCBzID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKGkpID0+ICEhaS5jb2xsYXBzZWQpLm1hcCgoaSkgPT4gaS5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW2ksIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHggPSB6KGguc291cmNlSWQsIGUsIHMpLCB2ID0geihoLnRhcmdldElkLCBlLCBzKTsKICAgICAgeCAhPT0gdiAmJiAoYVtpXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB4LAogICAgICAgIHRhcmdldElkOiB2CiAgICAgIH0pOwogICAgfQogICAgY29uc3QgZyA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIHIgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgeSA9IChjICE9IG51bGwgJiYgYy5tb2RlICYmIGMubW9kZSAhPT0gImF1dG8iID8gYy5tb2RlIDogciA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgZXQoKGMgPT0gbnVsbCA/IHZvaWQgMCA6IGMuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IHR0KGMpOwogICAgcmV0dXJuIFcuZXhlY3V0ZShnLCB5LCBkKTsKICB9Cn0KY29uc3Qgb3QgPSBuZXcgbnQoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoTykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGMsIG9wdGlvbnM6IG4gfSA9IE8uZGF0YTsKICB0cnkgewogICAgY29uc3QgcyA9IG5ldyBNYXAoYyksIGEgPSBhd2FpdCBvdC5leGVjdXRlKGQsIHMsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHMpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiBzLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", Ze = (s) => Uint8Array.from(atob(s), (n) => n.charCodeAt(0)), ee = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Ze(ne)], { type: "text/javascript;charset=utf-8" });
function ke(s) {
  let n;
  try {
    if (n = ee && (self.URL || self.webkitURL).createObjectURL(ee), !n) throw "";
    const g = new Worker(n, {
      type: "module",
      name: s == null ? void 0 : s.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(n);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + ne,
      {
        type: "module",
        name: s == null ? void 0 : s.name
      }
    );
  }
}
class He {
  constructor() {
    St(this, "worker", null);
    St(this, "pendingRequests", /* @__PURE__ */ new Map());
    St(this, "fallbackEngine", new Ee());
    if (typeof Worker < "u")
      try {
        this.worker = new ke(), this.worker.onmessage = (n) => {
          const { id: g, success: r, layout: d, error: u } = n.data, C = this.pendingRequests.get(g);
          C && (this.pendingRequests.delete(g), r ? C.resolve(d) : C.reject(new Error(u)));
        }, this.worker.onerror = (n) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", n);
        };
      } catch (n) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", n), this.worker = null;
      }
  }
  execute(n, g, r) {
    return this.worker ? new Promise((d, u) => {
      const C = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(C, { resolve: d, reject: u });
      const I = Array.from(g.entries());
      this.worker.postMessage({
        id: C,
        graph: n,
        measurements: I,
        options: r
      });
    }) : this.fallbackEngine.execute(n, g, r);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class De {
  canDrag() {
    return !0;
  }
  onDragMove(n) {
    return n.cursorWorld;
  }
  onDragEnd(n) {
    const { draggedEntity: g, hoveredEntity: r, graph: d } = n;
    return r && r.id === g.id ? null : r && d.containers[r.id] ? g.parentId === r.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: r.id
      }
    } : !r && g.parentId !== null && g.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: null
      }
    } : null;
  }
}
class Ue {
  constructor() {
    St(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(n) {
    return n.cursorWorld;
  }
  onDragEnd(n) {
    const { draggedEntity: g, hoveredEdge: r, hoveredEntity: d, cursorWorld: u, startWorldPos: C, graph: I } = n, l = Math.hypot(
      u.x - C.x,
      u.y - C.y
    );
    if (d && I.containers[d.id])
      return d.id !== g.id && g.parentId !== d.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: d.id
        }
      } : null;
    if (!d && !r) {
      const f = Object.values(I.edges).filter(
        (m) => m.targetId === g.id
      ), A = Object.values(I.edges).filter(
        (m) => m.sourceId === g.id
      );
      return f.length === 1 && A.length === 1 && f[0].sourceId !== A[0].targetId && l >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: f[0].id,
          outgoingEdgeId: A[0].id
        }
      } : l >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const L = (f) => {
      const A = I.nodes[f.id] || f;
      if (!A.ports || A.ports.length === 0) return "";
      const m = Object.values(I.edges).find((x) => x.targetId === f.id);
      if (m) {
        const x = A.ports.find((e) => e.id === m.targetPortId);
        if (x) return x.id;
      }
      const B = new Set(
        Object.values(I.edges).filter((x) => x.sourceId === f.id).map((x) => x.sourcePortId)
      ), P = A.ports.find((x) => !B.has(x.id));
      return P ? P.id : A.ports[0].id;
    };
    if (r)
      return r.sourceId === g.id || r.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: r.id,
          newSourceId: r.sourceId,
          newTargetId: g.id,
          newTargetPortId: L(g)
        }
      };
    if (d && d.id !== g.id && I.nodes[d.id]) {
      const f = Object.values(I.edges).find(
        (A) => A.targetId === d.id && A.sourceId !== g.id
      );
      if (f)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: f.id,
            newSourceId: f.sourceId,
            newTargetId: g.id,
            newTargetPortId: L(g)
          }
        };
    }
    return null;
  }
}
function ve(s, n = { min: 0.15, max: 3 }) {
  const [g, r] = it({ x: 80, y: 80, zoom: 1 }), d = rt(!1), u = rt({ x: 0, y: 0 }), C = z(
    (x, e) => {
      if (!s.current) return { x, y: e };
      const t = s.current.getBoundingClientRect();
      return {
        x: (x - t.left - g.x) / g.zoom,
        y: (e - t.top - g.y) / g.zoom
      };
    },
    [g, s]
  ), I = z(
    (x) => {
      if (!s.current) return;
      const e = [
        ...Object.values(x.nodes),
        ...Object.values(x.containers)
      ];
      if (e.length === 0) {
        r({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, o = 1 / 0, i = -1 / 0, c = -1 / 0;
      for (const v of e)
        t = Math.min(t, v.x), o = Math.min(o, v.y), i = Math.max(i, v.x + v.width), c = Math.max(c, v.y + v.height);
      const b = s.current.getBoundingClientRect(), Y = 80, K = Math.max(i - t, 100), y = Math.max(c - o, 100), D = (b.width - Y * 2) / K, E = (b.height - Y * 2) / y, h = Math.min(
        Math.max(Math.min(D, E), n.min),
        Math.min(n.max, 1.25)
      ), G = (b.width - K * h) / 2 - t * h, p = (b.height - y * h) / 2 - o * h;
      r({
        x: G,
        y: p,
        zoom: h
      });
    },
    [s, n]
  ), l = z(
    (x) => {
      if (x.preventDefault(), !!s.current)
        if (x.ctrlKey || x.metaKey) {
          const e = s.current.getBoundingClientRect(), t = x.clientX - e.left, o = x.clientY - e.top, i = x.deltaY < 0 ? 1.08 : 0.92, c = Math.min(Math.max(g.zoom * i, n.min), n.max), b = t - (t - g.x) * (c / g.zoom), Y = o - (o - g.y) * (c / g.zoom);
          r({ x: b, y: Y, zoom: c });
        } else
          r((e) => ({
            ...e,
            x: e.x - x.deltaX,
            y: e.y - x.deltaY
          }));
    },
    [g, n, s]
  ), L = z(
    (x, e) => {
      d.current = !0, u.current = { x: x - g.x, y: e - g.y };
    },
    [g]
  ), f = z((x, e) => {
    d.current && r((t) => ({
      ...t,
      x: x - u.current.x,
      y: e - u.current.y
    }));
  }, []), A = z(() => {
    d.current = !1;
  }, []), m = z(() => {
    r({ x: 80, y: 80, zoom: 1 });
  }, []), B = z(() => {
    r((x) => ({
      ...x,
      zoom: Math.min(x.zoom * 1.2, n.max)
    }));
  }, [n]), P = z(() => {
    r((x) => ({
      ...x,
      zoom: Math.max(x.zoom / 1.2, n.min)
    }));
  }, [n]);
  return {
    transform: g,
    setTransform: r,
    screenToWorld: C,
    onWheel: l,
    startPan: L,
    updatePan: f,
    endPan: A,
    resetTransform: m,
    zoomIn: B,
    zoomOut: P,
    zoomToFit: I,
    isPanning: d
  };
}
function Pe(s) {
  const [n, g] = it(
    /* @__PURE__ */ new Map()
  );
  rt(/* @__PURE__ */ new Map());
  const r = rt(/* @__PURE__ */ new Map()), d = z((u, C) => {
    C ? r.current.set(u, C) : r.current.delete(u);
  }, []);
  return vt(() => {
    const u = new ResizeObserver((C) => {
      let I = !1;
      const l = new Map(n);
      for (const L of C) {
        const f = L.target.getAttribute("data-sysflow-measure-id");
        if (!f) continue;
        const A = Math.ceil(L.contentRect.width), m = Math.ceil(L.contentRect.height), B = l.get(f);
        (!B || B.width !== A || B.height !== m) && (l.set(f, { width: A, height: m }), I = !0);
      }
      I && g(l);
    });
    return r.current.forEach((C) => u.observe(C)), () => {
      u.disconnect();
    };
  }, [s]), { measurements: n, registerMeasureElement: d };
}
function Ye(s, n, g, r, d) {
  const [u, C] = it(null), [I, l] = it(null), L = rt(null), f = rt(null), A = z(
    (e, t) => {
      let o = null, i = 1 / 0;
      for (const [c, b] of Object.entries(n.containers))
        if (c !== t && e.x >= b.x && e.x <= b.x + b.width && e.y >= b.y && e.y <= b.y + b.height) {
          const Y = b.width * b.height;
          Y < i && (i = Y, o = s.containers[c] || null);
        }
      if (o) return o;
      for (const [c, b] of Object.entries(n.nodes))
        if (c !== t && e.x >= b.x && e.x <= b.x + b.width && e.y >= b.y && e.y <= b.y + b.height)
          return s.nodes[c] || null;
      return null;
    },
    [n, s]
  ), m = z(
    (e, t) => {
      let o = null, i = 45;
      for (const c of Object.values(s.edges)) {
        if (c.sourceId === t || c.targetId === t) continue;
        const b = n.nodes[c.sourceId] || n.containers[c.sourceId], Y = n.nodes[c.targetId] || n.containers[c.targetId];
        if (!b || !Y) continue;
        const K = b.x + b.width, y = b.y + b.height / 2, D = Y.x, E = Y.y + Y.height / 2;
        for (let h = 0; h <= 10; h++) {
          const G = h / 10, p = (1 - G) * K + G * D, v = (1 - G) * y + G * E, Z = Math.hypot(e.x - p, e.y - v);
          Z < i && (i = Z, o = c);
        }
      }
      return o;
    },
    [n, s]
  ), B = z(
    (e, t) => {
      if (t.stopPropagation(), g.canDrag && !g.canDrag(e, s))
        return;
      const o = r(t.clientX, t.clientY);
      C({
        draggedEntity: e,
        ghostPosition: o,
        startPosition: o
      });
    },
    [s, g, r]
  ), P = z(
    (e) => {
      if (!u) return;
      const t = r(e.clientX, e.clientY), o = A(t, u.draggedEntity.id), i = m(t, u.draggedEntity.id);
      L.current = o, f.current = i, o && s.containers[o.id] ? l(o.id) : l(null);
      const c = g.onDragMove ? g.onDragMove({
        draggedEntity: u.draggedEntity,
        cursorWorld: t,
        startWorldPos: u.startPosition,
        hoveredEntity: o,
        hoveredEdge: i,
        graph: s,
        layout: n
      }) : t;
      c && C((b) => b ? { ...b, ghostPosition: c } : null);
    },
    [u, r, g, s, n, A, m]
  ), x = z(
    (e) => {
      if (!u) return;
      const t = r(e.clientX, e.clientY), o = A(t, u.draggedEntity.id), i = m(t, u.draggedEntity.id), c = g.onDragEnd({
        draggedEntity: u.draggedEntity,
        cursorWorld: t,
        startWorldPos: u.startPosition,
        hoveredEntity: o,
        hoveredEdge: i,
        graph: s,
        layout: n
      });
      c && d(c), C(null), l(null), L.current = null, f.current = null;
    },
    [u, r, g, s, n, A, m, d]
  );
  return {
    dragState: u,
    hoveredContainerId: I,
    handlePointerDown: B,
    handlePointerMove: P,
    handlePointerUp: x
  };
}
function Ne(s, n) {
  const g = [], r = [], d = [], u = [], C = [], I = [], l = [], L = [];
  for (const [f, A] of Object.entries(n.nodes))
    s.nodes[f] ? s.nodes[f] !== A && r.push(A) : g.push(A);
  for (const f of Object.keys(s.nodes))
    n.nodes[f] || d.push(f);
  for (const [f, A] of Object.entries(n.containers))
    s.containers[f] ? s.containers[f] !== A && C.push(A) : u.push(A);
  for (const f of Object.keys(s.containers))
    n.containers[f] || I.push(f);
  for (const [f, A] of Object.entries(n.edges))
    s.edges[f] || l.push(A);
  for (const [f, A] of Object.entries(s.edges))
    n.edges[f] || L.push(A);
  return {
    createdNodes: g,
    updatedNodes: r,
    deletedNodes: d,
    createdContainers: u,
    updatedContainers: C,
    deletedContainers: I,
    createdEdges: l,
    deletedEdges: L
  };
}
function We(s) {
  return s.createdNodes.length > 0 || s.updatedNodes.length > 0 || s.deletedNodes.length > 0 || s.deletedContainers && s.deletedContainers.length > 0 || s.createdEdges.length > 0 || s.deletedEdges.length > 0;
}
function Je(s, n) {
  const [g, r] = it({
    history: [s],
    index: 0
  }), [d, u] = it(null), C = rt(n);
  C.current = n;
  const I = g.history[g.index] ?? g.history[0] ?? s, l = z((o) => {
    var c;
    const i = zt(o);
    if ((c = C.current) != null && c.onMutate) {
      const b = Ne(I, i);
      We(b) && C.current.onMutate(b);
    }
    r((b) => {
      const Y = b.history.slice(0, b.index + 1);
      return {
        history: [...Y, i],
        index: Y.length
      };
    });
  }, [I]), L = z((o) => {
    const i = zt(o);
    r({
      history: [i],
      index: 0
    });
  }, []), f = z(() => {
    r((o) => ({
      ...o,
      index: Math.max(0, o.index - 1)
    }));
  }, []), A = z(() => {
    r((o) => ({
      ...o,
      index: Math.min(o.history.length - 1, o.index + 1)
    }));
  }, []), m = z(
    (o) => {
      var K;
      if (!o || o.length === 0) return;
      let i = o;
      if ((K = C.current) != null && K.canDelete) {
        const y = C.current.canDelete(o);
        if (typeof y == "boolean") {
          if (!y) return;
        } else Array.isArray(y) && (i = y);
      }
      if (i.length === 0) return;
      const c = { ...I.nodes }, b = { ...I.containers }, Y = { ...I.edges };
      for (const y of i)
        delete c[y], delete b[y], delete Y[y];
      l({
        ...I,
        nodes: c,
        containers: b,
        edges: Y
      });
    },
    [I, l]
  ), B = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (o) => {
    const i = Math.random() * 16 | 0;
    return (o === "x" ? i : i & 3 | 8).toString(16);
  }), P = z(
    (o) => {
      var b, Y, K;
      const i = I, c = C.current;
      if (o.type === "ENTITY_REPARENT") {
        const { entityId: y, newParentId: D } = o.payload, E = {
          ...i,
          nodes: { ...i.nodes },
          containers: { ...i.containers }
        };
        E.nodes[y] ? E.nodes[y] = { ...E.nodes[y], parentId: D } : E.containers[y] && (E.containers[y] = { ...E.containers[y], parentId: D }), l(E);
      } else if (o.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: y, direction: D, suggestedNewNodeId: E, suggestedNewEdge1Id: h, suggestedNewEdge2Id: G } = o.payload, p = i.edges[y.id];
        if (!p) return;
        const v = i.nodes[p.sourceId];
        if (c != null && c.canConnect && (!c.canConnect(p.sourceId, E) || !c.canConnect(E, p.targetId)))
          return;
        const Z = D === "BT", X = D === "TB", w = `p_in_${Date.now()}`, R = `p_out_${Date.now() + 1}`;
        let N = "left", O = "right";
        Z ? (N = "bottom", O = "top") : X ? (N = "top", O = "bottom") : D === "RL" && (N = "right", O = "left");
        const V = (b = c == null ? void 0 : c.createNodeEntity) == null ? void 0 : b.call(c, {
          edge: p,
          direction: D,
          suggestedType: (v == null ? void 0 : v.type) || "FlowTask"
        }), q = {
          id: (V == null ? void 0 : V.id) || E,
          label: (V == null ? void 0 : V.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (V == null ? void 0 : V.type) || (v == null ? void 0 : v.type) || "FlowTask",
          parentId: (V == null ? void 0 : V.parentId) ?? (v == null ? void 0 : v.parentId) ?? null,
          ports: (V == null ? void 0 : V.ports) || [
            { id: w, label: "in", side: N },
            { id: R, label: "out", side: O }
          ],
          data: (V == null ? void 0 : V.data) || {},
          ...V
        }, at = q.ports.find((tt) => tt.label.toLowerCase().includes("in")) || q.ports.find((tt) => tt.side === (Z ? "bottom" : "top")) || q.ports[0], ct = q.ports.find((tt) => tt.label.toLowerCase().includes("out")) || q.ports.find((tt) => tt.side === (Z ? "top" : "bottom")) || q.ports[q.ports.length - 1], Ct = at ? at.id : w, F = ct ? ct.id : R, gt = {
          id: h,
          sourceId: p.sourceId,
          sourcePortId: p.sourcePortId,
          targetId: q.id,
          targetPortId: Ct
        }, bt = {
          id: G,
          sourceId: q.id,
          sourcePortId: F,
          targetId: p.targetId,
          targetPortId: p.targetPortId
        }, T = { ...i.edges };
        delete T[p.id], T[h] = gt, T[G] = bt, l({
          ...i,
          nodes: { ...i.nodes, [q.id]: q },
          edges: T
        });
      } else if (o.type === "NODE_EXTRACT") {
        const { incomingEdgeId: y, outgoingEdgeId: D } = o.payload, E = i.edges[y], h = i.edges[D];
        if (!E || !h || c != null && c.canConnect && !c.canConnect(E.sourceId, h.targetId))
          return;
        const G = { ...i.edges };
        delete G[y], delete G[D];
        const p = B();
        G[p] = {
          id: p,
          sourceId: E.sourceId,
          sourcePortId: E.sourcePortId,
          targetId: h.targetId,
          targetPortId: h.targetPortId
        }, l({
          ...i,
          edges: G
        });
      } else if (o.type === "NODE_ADD_CONNECTED") {
        const {
          sourceNode: y,
          position: D,
          portId: E,
          direction: h,
          suggestedNewNodeId: G,
          suggestedNewEdgeId: p
        } = o.payload, v = h === "BT", Z = h === "TB", X = h === "RL", w = v ? "bottom" : Z ? "top" : X ? "right" : "left", R = v ? "top" : Z ? "bottom" : X ? "left" : "right", N = `p_in_${Date.now()}`, O = `p_out_${Date.now() + 1}`, V = E ? y.ports.find((nt) => nt.id === E) : void 0, q = ((Y = V == null ? void 0 : V.label) == null ? void 0 : Y.toLowerCase()) || "", at = q === "in" || q.startsWith("in_") || q.endsWith("_in"), ct = q === "out" || q.startsWith("out_") || q.endsWith("_out"), F = at ? !0 : ct ? !1 : v && D === "bottom" || Z && D === "top" || !v && !Z && !X && D === "left" || X && D === "right", gt = F ? G : y.id, bt = F ? y.id : G;
        if (c != null && c.canConnect && !c.canConnect(gt, bt))
          return;
        const T = (K = c == null ? void 0 : c.createNodeEntity) == null ? void 0 : K.call(c, {
          sourceNode: y,
          position: D,
          direction: h,
          suggestedType: y.type
        }), tt = {
          id: (T == null ? void 0 : T.id) || G,
          label: (T == null ? void 0 : T.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (T == null ? void 0 : T.type) || y.type,
          ports: (T == null ? void 0 : T.ports) || [
            { id: N, label: "in", side: w },
            { id: O, label: "out", side: R }
          ],
          data: (T == null ? void 0 : T.data) || {},
          parentId: (T == null ? void 0 : T.parentId) ?? (y == null ? void 0 : y.parentId) ?? null,
          ...T
        }, Kt = tt.ports.find((nt) => nt.label.toLowerCase().includes("in")) || tt.ports.find((nt) => nt.side === w) || tt.ports[0], Et = tt.ports.find((nt) => nt.label.toLowerCase().includes("out")) || tt.ports.find((nt) => nt.side === R) || tt.ports[tt.ports.length - 1], j = Kt ? Kt.id : N, wt = Et ? Et.id : O, J = V || y.ports.find((nt) => nt.label.toLowerCase() === "in") || y.ports[0], At = V || y.ports.find((nt) => nt.label.toLowerCase() === "out") || y.ports[y.ports.length - 1], mt = F ? {
          id: p,
          sourceId: tt.id,
          sourcePortId: wt,
          targetId: y.id,
          targetPortId: (J == null ? void 0 : J.id) || "in"
        } : {
          id: p,
          sourceId: y.id,
          sourcePortId: (At == null ? void 0 : At.id) || "out",
          targetId: tt.id,
          targetPortId: j
        };
        l({
          ...i,
          nodes: { ...i.nodes, [tt.id]: tt },
          edges: { ...i.edges, [p]: mt }
        });
      } else if (o.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: y, collapsed: D } = o.payload;
        i.containers[y] && l({
          ...i,
          containers: {
            ...i.containers,
            [y]: { ...i.containers[y], collapsed: D }
          }
        });
      } else if (o.type === "NODE_UPDATE") {
        const { id: y, updates: D } = o.payload;
        i.nodes[y] && l({
          ...i,
          nodes: {
            ...i.nodes,
            [y]: { ...i.nodes[y], ...D }
          }
        });
      } else if (o.type === "EDGE_CREATE") {
        const y = o.payload.edge, D = y.sourceId, E = y.targetId, h = y.sourcePortId, G = y.targetPortId;
        if (c != null && c.canConnect && !c.canConnect(D, E, h, G))
          return;
        const p = o.payload.id || y.id || B();
        l({
          ...i,
          edges: {
            ...i.edges,
            [p]: { id: p, ...y }
          }
        });
      } else if (o.type === "EDGE_DELETE") {
        const y = o.payload.edgeId || o.payload.id, D = { ...i.edges };
        delete D[y], l({ ...i, edges: D });
      } else if (o.type === "EDGE_REWIRE") {
        const { edgeId: y, newTargetId: D, newTargetPortId: E } = o.payload;
        if (!D || !i.edges[y]) return;
        const h = D, G = i.edges[y], p = G.sourceId, v = G.targetId;
        if (h === p || h === v) return;
        const Z = Object.values(i.edges).find((F) => F.targetId === h), X = Object.values(i.edges).find((F) => F.sourceId === h), w = Z && X && Z.sourceId !== X.targetId;
        if (c != null && c.canConnect && (w && !c.canConnect(Z.sourceId, X.targetId) || !c.canConnect(p, h) || !c.canConnect(h, v)))
          return;
        const R = { ...i.edges };
        if (w) {
          delete R[Z.id], delete R[X.id];
          const F = B();
          R[F] = {
            id: F,
            sourceId: Z.sourceId,
            sourcePortId: Z.sourcePortId,
            targetId: X.targetId,
            targetPortId: X.targetPortId
          };
        } else
          Z && delete R[Z.id], X && delete R[X.id];
        const N = i.nodes[h], O = E && (N == null ? void 0 : N.ports.find((F) => F.id === E)) || (N == null ? void 0 : N.ports.find((F) => {
          var gt;
          return (gt = F.label) == null ? void 0 : gt.toLowerCase().includes("in");
        })) || (N == null ? void 0 : N.ports.find((F) => F.side === "bottom")) || (N == null ? void 0 : N.ports[0]), V = (N == null ? void 0 : N.ports.find((F) => {
          var gt;
          return F.id !== (O == null ? void 0 : O.id) && ((gt = F.label) == null ? void 0 : gt.toLowerCase().includes("out"));
        })) || (N == null ? void 0 : N.ports.find((F) => F.id !== (O == null ? void 0 : O.id) && F.side === "top")) || (N == null ? void 0 : N.ports.find((F) => F.id !== (O == null ? void 0 : O.id))) || O, q = (O == null ? void 0 : O.id) || "p_in", at = (V == null ? void 0 : V.id) || "p_out";
        delete R[y];
        const ct = B();
        R[ct] = {
          id: ct,
          sourceId: p,
          sourcePortId: G.sourcePortId,
          targetId: h,
          targetPortId: q
        };
        const Ct = B();
        R[Ct] = {
          id: Ct,
          sourceId: h,
          sourcePortId: at,
          targetId: v,
          targetPortId: G.targetPortId
        }, l({ ...i, edges: R });
      } else {
        const y = o;
        if (y.type === "NODE_DELETE" || y.type === "DELETE_SELECTION" || y.type === "SELECTION_DELETE") {
          const D = y.payload || {}, E = [];
          D.nodeId && E.push(D.nodeId), D.id && E.push(D.id), Array.isArray(D.selectedIds) && E.push(...D.selectedIds), Array.isArray(D.ids) && E.push(...D.ids), m(E);
        }
      }
    },
    [I, l, m]
  ), x = z(
    (o) => {
      const i = I.nodes[o] || I.containers[o];
      i && u({ entity: JSON.parse(JSON.stringify(i)), isCut: !1 });
    },
    [I]
  ), e = z(
    (o) => {
      const i = I.nodes[o] || I.containers[o];
      if (i) {
        u({ entity: JSON.parse(JSON.stringify(i)), isCut: !0 });
        const c = { ...I.nodes }, b = { ...I.containers };
        delete c[o], delete b[o], l({ ...I, nodes: c, containers: b });
      }
    },
    [I, l]
  ), t = z(() => {
    if (!d) return;
    const o = d.entity, i = `${o.id}_copy_${Date.now().toString().slice(-4)}`, c = { ...o, id: i, label: `${o.label} (Copy)` };
    "collapsed" in c ? l({
      ...I,
      containers: { ...I.containers, [i]: c }
    }) : l({
      ...I,
      nodes: { ...I.nodes, [i]: c }
    });
  }, [d, I, l]);
  return {
    graph: I,
    setGraphDirect: L,
    applyAction: P,
    undo: f,
    redo: A,
    copyEntity: x,
    cutEntity: e,
    pasteEntity: t,
    deleteSelection: m,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Me = ({
  graph: s,
  registerMeasureElement: n,
  nodeTypes: g,
  containerTypes: r
}) => {
  const d = Object.values(s.nodes), u = Object.values(s.containers);
  return /* @__PURE__ */ _("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    d.map((C) => {
      const I = C.type ? g == null ? void 0 : g[C.type] : null;
      return /* @__PURE__ */ W(
        "div",
        {
          ref: (l) => n(C.id, l),
          "data-sysflow-measure-id": C.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: I ? /* @__PURE__ */ W(I, { node: C, selected: !1 }) : /* @__PURE__ */ _("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ W("div", { style: { fontWeight: 600 }, children: C.label }),
            C.ports.length > 0 && /* @__PURE__ */ _("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              C.ports.map((l) => l.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${C.id}`
      );
    }),
    u.map((C) => {
      const I = C.type ? r == null ? void 0 : r[C.type] : null;
      return /* @__PURE__ */ W(
        "div",
        {
          ref: (l) => n(C.id, l),
          "data-sysflow-measure-id": C.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: I ? /* @__PURE__ */ W(I, { container: C, selected: !1 }) : /* @__PURE__ */ W("div", { className: "sysflow-container-header", children: C.label })
        },
        `measure-container-${C.id}`
      );
    })
  ] });
}, Re = ({
  graph: s,
  layout: n,
  selectedIds: g,
  direction: r = "TB",
  showArrows: d = !0,
  routing: u = "auto",
  portOptions: C,
  enableEdgeQuickAdd: I = !0,
  onEdgeClick: l,
  onInsertNodeOnEdge: L
}) => {
  const [f, A] = it(null), m = u === "step" || u === "auto" && (r === "LR" || r === "RL"), B = (e, t, o) => {
    var p, v, Z, X;
    let i = e, c = null;
    for ((p = s.containers[e]) != null && p.collapsed && (c = s.containers[e]); i; ) {
      const w = ((v = s.nodes[i]) == null ? void 0 : v.parentId) ?? ((Z = s.containers[i]) == null ? void 0 : Z.parentId) ?? null;
      w && ((X = s.containers[w]) != null && X.collapsed) && (c = s.containers[w]), i = w;
    }
    if (c) {
      const w = n.containers[c.id];
      if (!w)
        return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: c.id };
      let R, N, O;
      return r === "TB" ? (R = o ? "bottom" : "top", N = w.x + w.width / 2, O = o ? w.y + w.height : w.y) : r === "BT" ? (R = o ? "top" : "bottom", N = w.x + w.width / 2, O = o ? w.y : w.y + w.height) : r === "RL" ? (R = o ? "left" : "right", N = o ? w.x : w.x + w.width, O = w.y + w.height / 2) : (R = o ? "right" : "left", N = o ? w.x + w.width : w.x, O = w.y + w.height / 2), { x: N, y: O, side: R, valid: !0, entityId: c.id };
    }
    if (!!s.containers[e]) {
      const w = n.containers[e];
      if (!w) return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: e };
      let R, N, O;
      return r === "TB" ? (R = w.x + w.width / 2, N = o ? w.y + w.height : w.y, O = o ? "bottom" : "top") : r === "BT" ? (R = w.x + w.width / 2, N = o ? w.y : w.y + w.height, O = o ? "top" : "bottom") : r === "RL" ? (R = o ? w.x : w.x + w.width, N = w.y + w.height / 2, O = o ? "left" : "right") : (R = o ? w.x + w.width : w.x, N = w.y + w.height / 2, O = o ? "right" : "left"), { x: R, y: N, side: O, valid: !0, entityId: e };
    }
    const Y = s.nodes[e], K = n.nodes[e];
    if (!Y || !K)
      return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: e };
    const D = Lt(
      Y,
      K,
      r,
      s.edges,
      C
    ).get(t);
    if (D)
      return { x: D.worldX, y: D.worldY, side: D.side, valid: !0, entityId: e };
    let E, h, G;
    return r === "TB" ? (E = K.x + K.width / 2, h = o ? K.y + K.height : K.y, G = o ? "bottom" : "top") : r === "BT" ? (E = K.x + K.width / 2, h = o ? K.y : K.y + K.height, G = o ? "top" : "bottom") : r === "RL" ? (E = o ? K.x : K.x + K.width, h = K.y + K.height / 2, G = o ? "left" : "right") : (E = o ? K.x + K.width : K.x, h = K.y + K.height / 2, G = o ? "right" : "left"), { x: E, y: h, side: G, valid: !0, entityId: e };
  }, P = (e, t) => {
    const o = (e.x + t.x) / 2, i = (e.y + t.y) / 2;
    if (e.side === "right" && t.side === "left") {
      if (t.x >= e.x + 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${o} ${e.y} L ${o} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: i }
        };
      {
        const c = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x + 20} ${e.y} L ${e.x + 20} ${c} L ${t.x - 20} ${c} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: c }
        };
      }
    }
    if (e.side === "left" && t.side === "right") {
      if (t.x <= e.x - 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${o} ${e.y} L ${o} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: i }
        };
      {
        const c = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x - 20} ${e.y} L ${e.x - 20} ${c} L ${t.x + 20} ${c} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: c }
        };
      }
    }
    if (e.side === "bottom" && t.side === "top") {
      if (t.y >= e.y + 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${i} L ${t.x} ${i} L ${t.x} ${t.y}`,
          center: { x: o, y: i }
        };
      {
        const c = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y + 20} L ${c} ${e.y + 20} L ${c} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: c, y: i }
        };
      }
    }
    if (e.side === "top" && t.side === "bottom") {
      if (t.y <= e.y - 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${i} L ${t.x} ${i} L ${t.x} ${t.y}`,
          center: { x: o, y: i }
        };
      {
        const c = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y - 20} L ${c} ${e.y - 20} L ${c} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: c, y: i }
        };
      }
    }
    return {
      pathStr: `M ${e.x} ${e.y} L ${o} ${e.y} L ${o} ${t.y} L ${t.x} ${t.y}`,
      center: { x: o, y: i }
    };
  }, x = (e, t) => {
    const o = t.x - e.x, i = t.y - e.y;
    let c = e.x, b = e.y, Y = t.x, K = t.y;
    if (e.side === "bottom" && t.side === "top")
      if (i > 0) {
        const E = Math.min(28, i * 0.4);
        b = e.y + Math.max(E, i * 0.5), K = t.y - Math.max(E, i * 0.5);
      } else {
        const E = o >= 0 ? 1 : -1, h = Math.max(40, Math.abs(o) * 0.2);
        c = e.x + h * E, b = e.y + 40, Y = t.x + h * E, K = t.y - 40;
      }
    else if (e.side === "top" && t.side === "bottom")
      if (i < 0) {
        const E = Math.min(28, Math.abs(i) * 0.4);
        b = e.y - Math.max(E, Math.abs(i) * 0.5), K = t.y + Math.max(E, Math.abs(i) * 0.5);
      } else {
        const E = o >= 0 ? 1 : -1, h = Math.max(40, Math.abs(o) * 0.2);
        c = e.x + h * E, b = e.y - 40, Y = t.x + h * E, K = t.y + 40;
      }
    else if (e.side === "right" && t.side === "left")
      o > 0 ? (c = e.x + o * 0.5, Y = t.x - o * 0.5) : (c = e.x + 50, b = e.y - 50, Y = t.x - 50, K = t.y - 50);
    else if (e.side === "left" && t.side === "right")
      o < 0 ? (c = e.x + o * 0.5, Y = t.x - o * 0.5) : (c = e.x - 50, b = e.y - 50, Y = t.x + 50, K = t.y - 50);
    else {
      const E = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, h = E[e.side] || { x: 0, y: 1 }, G = E[t.side] || { x: 0, y: -1 }, p = Math.min(60, Math.hypot(o, i) * 0.35);
      c = e.x + h.x * p, b = e.y + h.y * p, Y = t.x + G.x * p, K = t.y + G.y * p;
    }
    const y = 0.125 * e.x + 0.375 * c + 0.375 * Y + 0.125 * t.x, D = 0.125 * e.y + 0.375 * b + 0.375 * K + 0.125 * t.y;
    return {
      pathStr: `M ${e.x} ${e.y} C ${c} ${b} ${Y} ${K} ${t.x} ${t.y}`,
      center: { x: y, y: D }
    };
  };
  return /* @__PURE__ */ _("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ _("defs", { children: [
      /* @__PURE__ */ W(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ W("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ W(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ W("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(s.edges).map((e) => {
      const t = B(e.sourceId, e.sourcePortId, !0), o = B(e.targetId, e.targetPortId, !1);
      if (!t.valid || !o.valid || t.entityId === o.entityId) return null;
      const i = g.includes(e.id), c = f === e.id, { pathStr: b, center: Y } = m ? P(t, o) : x(t, o);
      return /* @__PURE__ */ _(
        "g",
        {
          onMouseEnter: () => A(e.id),
          onMouseLeave: () => A(null),
          children: [
            /* @__PURE__ */ W(
              "path",
              {
                d: b,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (K) => {
                  K.stopPropagation(), l == null || l(e.id);
                }
              }
            ),
            /* @__PURE__ */ W(
              "path",
              {
                d: b,
                fill: "none",
                stroke: i ? "var(--sysflow-edge-selected)" : c ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: i ? 2.5 : c ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: d ? i ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            I && c && L && /* @__PURE__ */ W("g", { transform: `translate(${Y.x}, ${Y.y})`, children: /* @__PURE__ */ _(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (K) => {
                  K.preventDefault(), K.stopPropagation(), L(e);
                },
                children: [
                  /* @__PURE__ */ W("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ W(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ W(
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
        e.id
      );
    })
  ] });
}, Xe = ({
  entity: s,
  layout: n,
  direction: g = "LR",
  edges: r,
  portOptions: d,
  enableQuickAdd: u = !1,
  onAddConnectedNode: C
}) => {
  const [I, l] = it(null);
  if (!s.ports || s.ports.length === 0)
    return null;
  const L = Lt(
    s,
    n,
    g,
    r,
    d
  );
  return /* @__PURE__ */ W(Mt, { children: s.ports.map((f) => {
    const A = L.get(f.id);
    if (!A) return null;
    const m = I === f.id;
    return /* @__PURE__ */ _(
      "div",
      {
        className: "sysflow-port-hit-area",
        style: {
          left: `${A.localX}px`,
          top: `${A.localY}px`
        },
        title: `${f.label} (${A.side})`,
        onMouseEnter: () => l(f.id),
        onMouseLeave: () => l((B) => B === f.id ? null : B),
        children: [
          /* @__PURE__ */ W("div", { className: `sysflow-port-anchor sysflow-port-${A.side}` }),
          u && m && C && /* @__PURE__ */ W(
            "button",
            {
              type: "button",
              className: "sysflow-port-quick-add-btn",
              title: `Add connected node on "${f.label}"`,
              onPointerDown: (B) => B.stopPropagation(),
              onPointerUp: (B) => B.stopPropagation(),
              onClick: (B) => {
                B.preventDefault(), B.stopPropagation(), C(s, f.id, A.side);
              },
              children: "+"
            }
          )
        ]
      },
      f.id
    );
  }) });
}, Te = ({
  node: s,
  layout: n,
  selected: g = !1,
  isDrawingEdge: r = !1,
  isDrawingSource: d = !1,
  direction: u = "LR",
  edges: C,
  portOptions: I,
  enableQuickAdd: l = !1,
  onAddConnectedNode: L,
  onPointerDown: f,
  onMouseEnter: A,
  onMouseLeave: m,
  onClick: B,
  customRenderer: P
}) => /* @__PURE__ */ _(
  "div",
  {
    className: `sysflow-node ${g ? "sysflow-selected" : ""} ${d ? "sysflow-drawing-source" : ""} ${s.className || ""}`,
    style: {
      transform: `translate(${n.x}px, ${n.y}px)`,
      width: `${n.width}px`,
      height: `${n.height}px`
    },
    onPointerDown: (x) => {
      if (r) {
        x.stopPropagation();
        return;
      }
      f == null || f(s, x);
    },
    onMouseEnter: () => A == null ? void 0 : A(s.id),
    onMouseLeave: () => m == null ? void 0 : m(s.id),
    onClick: B,
    children: [
      /* @__PURE__ */ W(
        Xe,
        {
          entity: s,
          layout: n,
          direction: u,
          edges: C,
          portOptions: I,
          enableQuickAdd: l && !r,
          onAddConnectedNode: L
        }
      ),
      P ? /* @__PURE__ */ W(P, { node: s, selected: g }) : /* @__PURE__ */ _("div", { style: { padding: "10px 14px" }, children: [
        /* @__PURE__ */ W("div", { style: { fontWeight: 600, fontSize: "13px" }, children: s.label }),
        s.ports.length > 0 && /* @__PURE__ */ _("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
          s.ports.length,
          " Port",
          s.ports.length > 1 ? "s" : ""
        ] })
      ] })
    ]
  }
), Oe = ({
  container: s,
  layout: n,
  selected: g,
  isHovered: r = !1,
  hasChildren: d = !1,
  onToggleCollapse: u,
  onPointerDown: C,
  onMouseEnter: I,
  onMouseLeave: l,
  onClick: L,
  customRenderer: f
}) => /* @__PURE__ */ W(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${r ? "sysflow-hovered" : ""} ${s.className || ""}`,
    style: {
      transform: `translate(${n.x}px, ${n.y}px)`,
      width: `${n.width}px`,
      height: `${n.height}px`
    },
    onPointerDown: (A) => C(s, A),
    onMouseEnter: I,
    onMouseLeave: l,
    onClick: L,
    children: f ? /* @__PURE__ */ W(
      f,
      {
        container: s,
        selected: g,
        hasChildren: d,
        onToggleCollapse: u
      }
    ) : /* @__PURE__ */ _(Mt, { children: [
      /* @__PURE__ */ _("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ W("span", { className: "sysflow-container-title", title: s.label, children: s.label }),
        /* @__PURE__ */ W(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (A) => A.stopPropagation(),
            onPointerUp: (A) => A.stopPropagation(),
            onClick: (A) => {
              A.stopPropagation(), u(s.id, !s.collapsed);
            },
            children: s.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !s.collapsed && !d && /* @__PURE__ */ W("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Qe = {
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
function Ve(s) {
  if (!s) return {};
  const n = {};
  for (const [g, r] of Object.entries(s))
    if (r !== void 0) {
      const d = Qe[g] || `--sysflow-${g.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      n[d] = r;
    }
  return n;
}
const ze = new De(), _e = ({
  graph: s,
  onChange: n,
  history: g,
  enableShortcuts: r = !0,
  onNodeClick: d,
  layoutEngine: u,
  interactionStrategy: C = ze,
  direction: I = "TB",
  layoutOptions: l,
  portPlacementMode: L,
  routing: f,
  showEdgeArrows: A = !0,
  nodeTypes: m,
  containerTypes: B,
  zoomBounds: P,
  className: x = "",
  selectedIds: e = [],
  theme: t = "dark",
  themeTokens: o,
  style: i,
  enableQuickAdd: c,
  enableEdgeQuickAdd: b,
  isDrawingEdge: Y,
  onDrawingEdgeChange: K,
  onNodeCreate: y,
  onEdgeCreate: D,
  onNodeDelete: E,
  onContainerDelete: h,
  onEdgeDelete: G
}) => {
  var Ot, Qt, Vt;
  const p = rt(null), v = rt(null);
  !u && !v.current && (v.current = new He());
  const Z = u || v.current, {
    transform: X,
    screenToWorld: w,
    onWheel: R,
    startPan: N,
    updatePan: O,
    endPan: V,
    resetTransform: q,
    zoomIn: at,
    zoomOut: ct,
    zoomToFit: Ct,
    isPanning: F
  } = ve(p, P), { measurements: gt, registerMeasureElement: bt } = Pe(s), [T, tt] = it({ nodes: {}, containers: {} }), [Kt, Et] = it(!1), j = Y ?? Kt, wt = z(
    (a) => {
      Y === void 0 && Et(a), K == null || K(a);
    },
    [Y, K]
  ), [J, At] = it(null), [mt, nt] = it(null), [U, lt] = it(null);
  vt(() => {
    j || (At(null), nt(null), lt(null));
  }, [j]);
  const ht = Nt(
    () => ({
      direction: I,
      mode: L ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
      nodeLayouts: T.nodes
    }),
    [I, L, T.nodes]
  ), Xt = (l == null ? void 0 : l.mode) === "flow" || L === "strict-flow", [ot, Zt] = it(null), kt = rt(null), Pt = rt(!1), {
    dragState: ut,
    hoveredContainerId: oe,
    handlePointerDown: Tt,
    handlePointerMove: se,
    handlePointerUp: ge
  } = Ye(s, T, C, w, n), pt = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (a) => {
    const k = Math.random() * 16 | 0;
    return (a === "x" ? k : k & 3 | 8).toString(16);
  }), Ht = z(
    (a, k) => {
      if (!a.ports || a.ports.length === 0) return [];
      if (!Xt)
        return a.ports;
      const M = k === "source" ? I === "BT" ? "top" : I === "TB" ? "bottom" : I === "LR" ? "right" : "left" : I === "BT" ? "bottom" : I === "TB" ? "top" : I === "LR" ? "left" : "right", $ = T.nodes[a.id], et = $ ? Lt(
        a,
        $,
        I,
        s.edges,
        ht
      ) : null;
      return a.ports.filter((st) => {
        var It;
        return (((It = et == null ? void 0 : et.get(st.id)) == null ? void 0 : It.side) ?? st.side) === M;
      });
    },
    [Xt, I, T.nodes, s.edges, ht]
  ), Yt = z(
    (a, k, S, H, M) => {
      if (a === S) return;
      const $ = `${a}:${k}->${S}:${H}`;
      M != null && M.has($) || Object.values(s.edges).some(
        (st) => st.sourceId === a && st.sourcePortId === k && st.targetId === S && st.targetPortId === H
      ) || (M == null || M.add($), n({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: a,
            sourcePortId: k,
            targetId: S,
            targetPortId: H
          }
        }
      }));
    },
    [s.edges, n]
  ), ft = z(() => {
    At(null), nt(null), lt(null), wt(!1);
  }, [wt]), xt = z(
    (a, k, S = /* @__PURE__ */ new Set()) => {
      for (let H = 0; H < k.length; H++) {
        const M = k[H];
        if (M === a.nodeId) continue;
        const $ = s.nodes[M];
        if (!$) continue;
        const et = Ht($, "destination");
        if (et.length !== 0)
          if (et.length === 1)
            Yt(
              a.nodeId,
              a.portId,
              $.id,
              et[0].id,
              S
            );
          else {
            lt({
              role: "destination",
              node: $,
              candidatePorts: et,
              source: a,
              remainingDestNodeIds: k.slice(H + 1)
            });
            return;
          }
      }
      ft();
    },
    [s.nodes, Ht, Yt, ft]
  ), Gt = Nt(() => {
    if (!J) return null;
    const a = s.nodes[J.nodeId], k = T.nodes[J.nodeId];
    if (!a || !k) return null;
    const H = Lt(
      a,
      k,
      I,
      s.edges,
      ht
    ).get(J.portId);
    return H ? { x: H.worldX, y: H.worldY } : {
      x: k.x + k.width / 2,
      y: k.y + k.height / 2
    };
  }, [J, s.nodes, s.edges, T.nodes, I, ht]), ie = z(
    (a, k, S) => {
      if (!U) {
        if (!J) {
          const H = Ht(a, "source");
          if (H.length === 0) return;
          H.length === 1 ? (At({ nodeId: a.id, portId: H[0].id }), nt(w(k, S))) : lt({
            role: "source",
            node: a,
            candidatePorts: H
          });
          return;
        }
        a.id !== J.nodeId && xt(J, [a.id]);
      }
    },
    [
      U,
      J,
      Ht,
      w,
      xt
    ]
  ), de = (a) => {
    if (U) {
      if (U.role === "source") {
        const k = {
          nodeId: U.node.id,
          portId: a.id
        }, S = T.nodes[U.node.id];
        if (S) {
          const M = Lt(
            U.node,
            S,
            I,
            s.edges,
            ht
          ).get(a.id);
          M && nt({ x: M.worldX, y: M.worldY });
        }
        At(k), lt(null);
      } else if (U.role === "destination" && U.source) {
        const k = U.source, S = U.remainingDestNodeIds || [];
        Yt(k.nodeId, k.portId, U.node.id, a.id), lt(null), S.length > 0 ? xt(k, S) : ft();
      }
    }
  };
  vt(() => {
    const a = (S) => {
      var et, st, dt, It;
      if (S.target instanceof HTMLInputElement || S.target instanceof HTMLTextAreaElement || S.target instanceof HTMLSelectElement || S.target instanceof HTMLElement && S.target.isContentEditable)
        return;
      const H = S.ctrlKey || S.metaKey, M = S.key.toLowerCase();
      if (S.key === "Escape") {
        S.preventDefault(), Zt(null), kt.current = null, (j || U || J) && ft(), n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (r !== !1 && !H && !S.altKey && M === "e") {
        S.preventDefault(), j ? ft() : wt(!0);
        return;
      }
      if (S.key === "Delete" || S.key === "Backspace") {
        if (j) return;
        if (S.preventDefault(), e.length > 0) {
          if (E || G || h)
            for (const Q of e)
              s.nodes[Q] ? E == null || E(Q) : s.containers[Q] ? (et = h || E) == null || et(Q) : s.edges[Q] && (G == null || G(Q));
          g != null && g.deleteSelection && g.deleteSelection(e), n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        }
        return;
      }
      if (r !== !1 && g) {
        if (H && M === "z") {
          S.preventDefault(), S.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (H && M === "y") {
          S.preventDefault(), g.redo();
          return;
        }
        if (H && M === "c" && e[0]) {
          S.preventDefault(), (st = g.copyEntity) == null || st.call(g, e[0]);
          return;
        }
        if (H && M === "x" && e[0]) {
          S.preventDefault(), (dt = g.cutEntity) == null || dt.call(g, e[0]);
          return;
        }
        if (H && M === "v") {
          S.preventDefault(), (It = g.pasteEntity) == null || It.call(g);
          return;
        }
      }
      if (S.code === "Space" && (Pt.current = !0), M === "f" && !H) {
        S.preventDefault(), Ct(T);
        return;
      }
      if (H && M === "a" && !j) {
        S.preventDefault();
        const Q = [
          ...Object.keys(s.nodes),
          ...Object.keys(s.containers)
        ];
        n({ type: "SELECTION_CHANGE", payload: { selectedIds: Q } });
        return;
      }
      const $ = Object.keys(s.nodes);
      if (!($.length === 0 || j) && S.key === "Tab") {
        S.preventDefault();
        const Q = e.length > 0 ? $.indexOf(e[0]) : -1;
        let Bt;
        S.shiftKey ? Bt = Q <= 0 ? $.length - 1 : Q - 1 : Bt = (Q + 1) % $.length, n({ type: "SELECTION_CHANGE", payload: { selectedIds: [$[Bt]] } });
      }
    }, k = (S) => {
      S.code === "Space" && (Pt.current = !1);
    };
    return window.addEventListener("keydown", a), window.addEventListener("keyup", k), () => {
      window.removeEventListener("keydown", a), window.removeEventListener("keyup", k);
    };
  }, [
    s,
    T,
    e,
    Ct,
    n,
    g,
    r,
    E,
    h,
    G,
    j,
    U,
    J,
    wt,
    ft
  ]);
  const Ie = z(
    (a, k, S) => {
      var Bt;
      const H = pt(), M = pt(), $ = a.ports.find((ye) => ye.id === k), et = ((Bt = $ == null ? void 0 : $.label) == null ? void 0 : Bt.toLowerCase()) || "", st = et === "in" || et.startsWith("in_") || et.endsWith("_in"), dt = et === "out" || et.startsWith("out_") || et.endsWith("_out"), Q = st ? !0 : dt ? !1 : I === "BT" && S === "bottom" || I === "TB" && S === "top" || I === "LR" && S === "left" || I === "RL" && S === "right";
      y && D ? (y({
        id: H,
        type: a.type || "FlowTask",
        label: `New ${a.type || "Task"}`,
        parentId: a.parentId ?? null
      }), Q ? D(H, a.id, M) : D(a.id, H, M)) : n({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: a,
          position: S,
          portId: k,
          direction: I,
          suggestedNewNodeId: H,
          suggestedNewEdgeId: M
        }
      }), n({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [H] }
      });
    },
    [I, n, y, D]
  ), re = z(
    (a) => {
      const k = pt(), S = pt(), H = pt(), M = s.nodes[a.sourceId], $ = (M == null ? void 0 : M.type) || "FlowTask";
      y && D && G ? (G(a.id), y({
        id: k,
        type: $,
        label: `New ${$}`,
        parentId: (M == null ? void 0 : M.parentId) ?? null
      }), D(a.sourceId, k, S), D(k, a.targetId, H)) : n({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: a,
          direction: I,
          suggestedNewNodeId: k,
          suggestedNewEdge1Id: S,
          suggestedNewEdge2Id: H
        }
      }), n({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [k] }
      });
    },
    [I, s.nodes, n, y, D, G]
  );
  vt(() => {
    let a = !1, k = 16 / 9;
    if (p.current) {
      const H = p.current.getBoundingClientRect();
      H.width > 0 && H.height > 0 && (k = H.width / H.height);
    }
    const S = {
      direction: I,
      aspectRatio: k,
      ...l
    };
    return Z.execute(s, gt, S).then((H) => {
      a || tt(H);
    }), () => {
      a = !0;
    };
  }, [s, gt, Z, I, l]);
  const ce = (a) => {
    if (a.button === 1 || Pt.current) {
      N(a.clientX, a.clientY);
      return;
    }
    const k = a.target, S = k === p.current || k.classList.contains("sysflow-viewport") || k.classList.contains("sysflow-dom-layer") || k.tagName.toLowerCase() === "svg";
    if (a.button === 0 && S) {
      a.currentTarget.setPointerCapture(a.pointerId);
      const H = w(a.clientX, a.clientY);
      kt.current = { x: a.clientX, y: a.clientY }, Zt({
        startX: H.x,
        startY: H.y,
        currentX: H.x,
        currentY: H.y
      }), j || n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, le = (a) => {
    if (j && J && nt(w(a.clientX, a.clientY)), F.current)
      O(a.clientX, a.clientY);
    else if (ot) {
      const k = w(a.clientX, a.clientY);
      Zt(
        (S) => S ? { ...S, currentX: k.x, currentY: k.y } : null
      );
    } else !j && ut && se(a);
  }, ae = (a) => {
    if (a.currentTarget.hasPointerCapture(a.pointerId) && a.currentTarget.releasePointerCapture(a.pointerId), F.current && V(), ot) {
      const k = Math.min(ot.startX, ot.currentX), S = Math.min(ot.startY, ot.currentY), H = Math.max(ot.startX, ot.currentX), M = Math.max(ot.startY, ot.currentY), $ = kt.current, st = ($ ? Math.hypot(a.clientX - $.x, a.clientY - $.y) : 0) > 5 || H - k > 4 || M - S > 4;
      if (j) {
        if (!st)
          ft(), n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        else if (J) {
          const dt = [];
          for (const [It, Q] of Object.entries(T.nodes))
            It !== J.nodeId && Q.x < H && Q.x + Q.width > k && Q.y < M && Q.y + Q.height > S && dt.push(It);
          dt.length > 0 && xt(J, dt);
        }
      } else if (st) {
        const dt = [];
        for (const [It, Q] of Object.entries(T.nodes))
          Q.x < H && Q.x + Q.width > k && Q.y < M && Q.y + Q.height > S && dt.push(It);
        for (const [It, Q] of Object.entries(T.containers))
          Q.x < H && Q.x + Q.width > k && Q.y < M && Q.y + Q.height > S && dt.push(It);
        n({ type: "SELECTION_CHANGE", payload: { selectedIds: dt } });
      }
      Zt(null), kt.current = null;
    }
    !j && ut && ge(a);
  }, Ce = c ?? (l == null ? void 0 : l.mode) === "flow", Ae = (b ?? c ?? (l == null ? void 0 : l.mode) === "flow") && !j, ue = Object.values(s.containers), he = t === "light" ? "sysflow-theme-light" : "sysflow-theme-dark", fe = Nt(() => ({
    outline: "none",
    ...Ve(o),
    ...i
  }), [o, i]);
  return /* @__PURE__ */ _(
    "div",
    {
      ref: p,
      className: `sysflow-canvas ${he} ${j ? "sysflow-drawing-edge" : ""} ${x}`,
      "data-theme": t,
      style: fe,
      onWheel: R,
      onPointerDown: ce,
      onPointerMove: le,
      onPointerUp: ae,
      tabIndex: 0,
      children: [
        /* @__PURE__ */ W(
          Me,
          {
            graph: s,
            registerMeasureElement: bt,
            nodeTypes: m,
            containerTypes: B
          }
        ),
        j && /* @__PURE__ */ W(
          "div",
          {
            className: "sysflow-drawing-banner",
            onPointerDown: (a) => a.stopPropagation(),
            children: /* @__PURE__ */ W("span", { children: J ? `Source: "${((Ot = s.nodes[J.nodeId]) == null ? void 0 : Ot.label) || J.nodeId}" — Click destination node or drag marquee to connect (Esc to cancel)` : "Edge Drawing Mode — Click a source node (Esc or click background to exit)" })
          }
        ),
        /* @__PURE__ */ _(
          "div",
          {
            className: "sysflow-controls-panel",
            onPointerDown: (a) => a.stopPropagation(),
            children: [
              /* @__PURE__ */ W("button", { onClick: at, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
              /* @__PURE__ */ W("button", { onClick: ct, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
              /* @__PURE__ */ _(
                "button",
                {
                  onClick: q,
                  className: "sysflow-control-btn",
                  title: "Reset Zoom (0)",
                  children: [
                    Math.round(X.zoom * 100),
                    "%"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ _(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${X.x}px, ${X.y}px) scale(${X.zoom})`
            },
            children: [
              ot && /* @__PURE__ */ W(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(ot.startX, ot.currentX)}px`,
                    top: `${Math.min(ot.startY, ot.currentY)}px`,
                    width: `${Math.abs(ot.currentX - ot.startX)}px`,
                    height: `${Math.abs(ot.currentY - ot.startY)}px`,
                    backgroundColor: "color-mix(in srgb, var(--sysflow-node-selected, #aa9460) 15%, transparent)",
                    border: "1px dashed var(--sysflow-node-selected, #aa9460)",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              j && Gt && mt && /* @__PURE__ */ _("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none", zIndex: 80 }, children: [
                /* @__PURE__ */ W(
                  "line",
                  {
                    x1: Gt.x,
                    y1: Gt.y,
                    x2: mt.x,
                    y2: mt.y,
                    stroke: "var(--sysflow-edge-selected, #38bdf8)",
                    strokeWidth: 2,
                    strokeDasharray: "6 4"
                  }
                ),
                /* @__PURE__ */ W(
                  "circle",
                  {
                    cx: Gt.x,
                    cy: Gt.y,
                    r: 4,
                    fill: "var(--sysflow-edge-selected, #38bdf8)"
                  }
                )
              ] }),
              /* @__PURE__ */ W(
                "div",
                {
                  className: "sysflow-containers-layer",
                  style: { position: "absolute", zIndex: 1, pointerEvents: "none" },
                  children: ue.map((a) => {
                    const k = T.containers[a.id];
                    if (!k) return null;
                    const S = Object.values(s.nodes).some((H) => H.parentId === a.id) || Object.values(s.containers).some((H) => H.parentId === a.id);
                    return /* @__PURE__ */ W(
                      Oe,
                      {
                        container: a,
                        layout: k,
                        selected: e.includes(a.id),
                        isHovered: oe === a.id,
                        hasChildren: S,
                        customRenderer: a.type ? B == null ? void 0 : B[a.type] : void 0,
                        onToggleCollapse: (H, M) => {
                          j || n({
                            type: "CONTAINER_TOGGLE_COLLAPSE",
                            payload: { containerId: H, collapsed: M }
                          });
                        },
                        onPointerDown: (H, M) => {
                          if (j) {
                            M.stopPropagation();
                            return;
                          }
                          Tt(H, M);
                        },
                        onMouseEnter: () => {
                        },
                        onMouseLeave: () => {
                        },
                        onClick: (H) => {
                          H.stopPropagation(), !j && n({
                            type: "SELECTION_CHANGE",
                            payload: { selectedIds: [a.id] }
                          });
                        }
                      },
                      a.id
                    );
                  })
                }
              ),
              /* @__PURE__ */ W(
                Re,
                {
                  graph: s,
                  layout: T,
                  selectedIds: e,
                  direction: I,
                  showArrows: A,
                  routing: f,
                  portOptions: ht,
                  enableEdgeQuickAdd: Ae,
                  onInsertNodeOnEdge: re,
                  onEdgeClick: (a) => {
                    j || n({ type: "SELECTION_CHANGE", payload: { selectedIds: [a] } });
                  }
                }
              ),
              /* @__PURE__ */ W(
                "div",
                {
                  className: "sysflow-nodes-layer",
                  style: { position: "absolute", zIndex: 10, pointerEvents: "none" },
                  children: Object.values(s.nodes).map((a) => {
                    const k = T.nodes[a.id];
                    return k ? /* @__PURE__ */ W(
                      Te,
                      {
                        node: a,
                        layout: k,
                        direction: I,
                        edges: s.edges,
                        portOptions: ht,
                        selected: e.includes(a.id),
                        isDrawingEdge: j,
                        isDrawingSource: (J == null ? void 0 : J.nodeId) === a.id,
                        customRenderer: a.type ? m == null ? void 0 : m[a.type] : void 0,
                        enableQuickAdd: Ce,
                        onAddConnectedNode: Ie,
                        onPointerDown: Tt,
                        onMouseEnter: () => {
                        },
                        onMouseLeave: () => {
                        },
                        onClick: (S) => {
                          if (S.stopPropagation(), j) {
                            ie(a, S.clientX, S.clientY);
                            return;
                          }
                          n({
                            type: "SELECTION_CHANGE",
                            payload: { selectedIds: [a.id] }
                          }), d == null || d(a.id, a);
                        }
                      },
                      a.id
                    ) : null;
                  })
                }
              ),
              !j && ut && /* @__PURE__ */ W(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ut.ghostPosition.x}px, ${ut.ghostPosition.y}px)`,
                    width: `${((Qt = gt.get(ut.draggedEntity.id)) == null ? void 0 : Qt.width) || 200}px`,
                    height: `${((Vt = gt.get(ut.draggedEntity.id)) == null ? void 0 : Vt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ W("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ut.draggedEntity.label })
                }
              )
            ]
          }
        ),
        U && /* @__PURE__ */ W(
          "div",
          {
            className: "sysflow-port-modal-backdrop",
            onPointerDown: (a) => a.stopPropagation(),
            onClick: (a) => {
              a.stopPropagation(), lt(null);
            },
            children: /* @__PURE__ */ _(
              "div",
              {
                className: "sysflow-port-modal",
                onClick: (a) => a.stopPropagation(),
                children: [
                  /* @__PURE__ */ _("div", { className: "sysflow-port-modal-header", children: [
                    /* @__PURE__ */ W("h4", { style: { margin: 0, fontSize: 15 }, children: U.role === "source" ? "Select Source Port" : "Select Destination Port" }),
                    /* @__PURE__ */ _("span", { style: { fontSize: 12, color: "var(--sysflow-node-subtext)" }, children: [
                      "Node: ",
                      /* @__PURE__ */ W("strong", { children: U.node.label }),
                      U.remainingDestNodeIds && U.remainingDestNodeIds.length > 0 && /* @__PURE__ */ _(Mt, { children: [
                        " (",
                        U.remainingDestNodeIds.length,
                        " more queued)"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ W("div", { className: "sysflow-port-modal-list", children: U.candidatePorts.map((a) => {
                    var k;
                    return /* @__PURE__ */ _(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-port-modal-option",
                        onClick: () => de(a),
                        children: [
                          /* @__PURE__ */ W("span", { style: { fontWeight: 600 }, children: a.label }),
                          /* @__PURE__ */ _("span", { style: { fontSize: 11, opacity: 0.7 }, children: [
                            a.side ? `side: ${a.side}` : a.id,
                            (k = a.data) != null && k.busWidth ? ` • ${String(a.data.busWidth)}` : ""
                          ] })
                        ]
                      },
                      a.id
                    );
                  }) }),
                  /* @__PURE__ */ _("div", { className: "sysflow-port-modal-footer", children: [
                    U.role === "destination" && U.remainingDestNodeIds && U.remainingDestNodeIds.length > 0 && /* @__PURE__ */ W(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-control-btn",
                        onClick: () => {
                          const a = U.source, k = U.remainingDestNodeIds;
                          lt(null), xt(a, k);
                        },
                        children: "Skip Node"
                      }
                    ),
                    /* @__PURE__ */ W(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-control-btn",
                        onClick: () => lt(null),
                        children: "Cancel"
                      }
                    )
                  ] })
                ]
              }
            )
          }
        )
      ]
    }
  );
};
export {
  Ue as EdgeRewireStrategy,
  Oe as GraphContainer,
  Re as GraphEdgeLayer,
  Te as GraphNode,
  Xe as GraphPortLayer,
  De as ReparentStrategy,
  Ee as SugiyamaEngine,
  _e as SysFlowCanvas,
  He as WorkerBridge,
  Lt as computeEntityPortLocations,
  zt as pruneDanglingEdges,
  te as resolveEffectiveEntityId,
  Ve as themeTokensToStyle,
  ve as useCanvasTransform,
  Ye as useDragGesture,
  Je as useGraphHistory,
  Pe as useMeasurement
};
