var we = Object.defineProperty;
var Be = (s, n, g) => n in s ? we(s, n, { enumerable: !0, configurable: !0, writable: !0, value: g }) : s[n] = g;
var xt = (s, n, g) => Be(s, typeof n != "symbol" ? n + "" : n, g);
import { useState as It, useRef as rt, useCallback as z, useEffect as Pt, useMemo as Nt } from "react";
import { jsxs as _, jsx as N, Fragment as Mt } from "react/jsx-runtime";
function be(s, n, g, i) {
  const d = (h) => {
    const C = g.find(
      (S) => S.sourceId === n && S.sourcePortId === h || S.targetId === n && S.targetPortId === h
    );
    if (!C) return null;
    const r = C.sourceId === n ? C.targetId : C.sourceId, c = i[r];
    return c ? { x: c.x + c.width / 2, y: c.y + c.height / 2 } : null;
  };
  ["left", "right"].forEach((h) => {
    s[h].sort((C, r) => {
      var u, l;
      const c = ((u = d(C.id)) == null ? void 0 : u.y) ?? 0, S = ((l = d(r.id)) == null ? void 0 : l.y) ?? 0;
      return c - S;
    });
  }), ["top", "bottom"].forEach((h) => {
    s[h].sort((C, r) => {
      var u, l;
      const c = ((u = d(C.id)) == null ? void 0 : u.x) ?? 0, S = ((l = d(r.id)) == null ? void 0 : l.x) ?? 0;
      return c - S;
    });
  });
}
function me(s, n, g, i, d, h) {
  if (!d || !h)
    return g ? "left" : "right";
  const C = i.find(
    (l) => g ? l.targetId === s && l.targetPortId === n : l.sourceId === s && l.sourcePortId === n
  );
  if (!C) return g ? "left" : "right";
  const r = g ? C.sourceId : C.targetId, c = d[r];
  if (!c) return g ? "left" : "right";
  const S = c.x + c.width / 2 - (h.x + h.width / 2), u = c.y + c.height / 2 - (h.y + h.height / 2);
  return Math.abs(S) > Math.abs(u) ? S > 0 ? "right" : "left" : u > 0 ? "bottom" : "top";
}
function Kt(s, n, g = "LR", i, d) {
  const h = /* @__PURE__ */ new Map();
  if (!s || !n || !s.ports || s.ports.length === 0)
    return h;
  const C = (d == null ? void 0 : d.direction) || g, r = C === "TB" || C === "BT", c = (d == null ? void 0 : d.mode) || (r ? "strict-flow" : "perimeter-optimized"), S = i ? Array.isArray(i) ? i : Object.values(i) : [], u = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, l = new Set(
    S.filter((w) => w.targetId === s.id).map((w) => w.targetPortId)
  );
  new Set(
    S.filter((w) => w.sourceId === s.id).map((w) => w.sourcePortId)
  ), s.ports.forEach((w) => {
    let E = w.side || "auto";
    if (E !== "auto") {
      u[E].push(w);
      return;
    }
    if (c === "strict-flow") {
      const B = l.has(w.id) || w.label.toLowerCase().includes("in");
      switch (C) {
        case "BT":
          E = B ? "bottom" : "top";
          break;
        case "TB":
          E = B ? "top" : "bottom";
          break;
        case "RL":
          E = B ? "right" : "left";
          break;
        case "LR":
        default:
          E = B ? "left" : "right";
          break;
      }
    } else
      E = me(
        s.id,
        w.id,
        l.has(w.id),
        S,
        d == null ? void 0 : d.nodeLayouts,
        n
      );
    u[E].push(w);
  }), c === "perimeter-optimized" && (d != null && d.nodeLayouts) && be(u, s.id, S, d.nodeLayouts);
  const y = (w, E) => {
    const B = w.length;
    w.forEach((e, t) => {
      let o = 0, I = 0;
      E === "left" || E === "right" ? (I = n.height / (B + 1) * (t + 1), o = E === "left" ? 0 : n.width) : (o = n.width / (B + 1) * (t + 1), I = E === "top" ? 0 : n.height), h.set(e.id, {
        portId: e.id,
        side: E,
        localX: o,
        localY: I,
        worldX: n.x + o,
        worldY: n.y + I
      });
    });
  };
  return y(u.left, "left"), y(u.right, "right"), y(u.top, "top"), y(u.bottom, "bottom"), h;
}
function zt(s) {
  const n = {}, g = (i) => {
    var h;
    const d = s.nodes[i];
    return new Set(((h = d == null ? void 0 : d.ports) == null ? void 0 : h.map((C) => C.id)) || []);
  };
  for (const [i, d] of Object.entries(s.edges)) {
    const h = g(d.sourceId), C = g(d.targetId), r = h.has(d.sourcePortId), c = C.has(d.targetPortId);
    r && c && (n[i] = d);
  }
  return {
    ...s,
    edges: n
  };
}
class Ge {
  static assignDynamicPortSides(n, g, i) {
    var h, C;
    const d = (r) => g[r] || i[r];
    for (const r of Object.values(n.edges)) {
      const c = d(r.sourceId), S = d(r.targetId);
      if (!c || !S) continue;
      const u = n.nodes[r.sourceId] || n.containers[r.sourceId], l = n.nodes[r.targetId] || n.containers[r.targetId], y = S.x + S.width / 2 - (c.x + c.width / 2), w = S.y + S.height / 2 - (c.y + c.height / 2), E = Math.abs(y) > Math.abs(w) * 1.25, B = (h = u == null ? void 0 : u.ports) == null ? void 0 : h.find((t) => t.id === r.sourcePortId);
      B && (!B.side || B.side === "auto") && (E ? B.side = y >= 0 ? "right" : "left" : B.side = w >= 0 ? "bottom" : "top");
      const e = (C = l == null ? void 0 : l.ports) == null ? void 0 : C.find((t) => t.id === r.targetPortId);
      e && (!e.side || e.side === "auto") && (E ? e.side = y >= 0 ? "left" : "right" : e.side = w >= 0 ? "top" : "bottom");
    }
  }
}
const Ft = 22, jt = 18, $t = 38, Wt = 210, Jt = 36, pe = 180, Se = 54, Ut = 260, _t = 160;
class Rt {
  static execute(n, g, i) {
    var e;
    const d = {}, h = {}, C = (t) => {
      var a, G, Y, x, m;
      const o = !!n.containers[t], I = !!((a = n.containers[t]) != null && a.collapsed);
      return o && I ? { width: Wt, height: Jt } : o && !I ? {
        width: ((G = i.get(t)) == null ? void 0 : G.width) || Ut,
        height: ((Y = i.get(t)) == null ? void 0 : Y.height) || _t
      } : {
        width: ((x = i.get(t)) == null ? void 0 : x.width) || pe,
        height: ((m = i.get(t)) == null ? void 0 : m.height) || Se
      };
    }, r = /* @__PURE__ */ new Map();
    for (const [t, o] of Object.entries(n.nodes)) {
      const I = o.parentId ?? null;
      r.has(I) || r.set(I, []), r.get(I).push(t);
    }
    for (const [t, o] of Object.entries(n.containers)) {
      const I = o.parentId ?? null;
      r.has(I) || r.set(I, []), r.get(I).push(t);
    }
    const c = Rt.getContainerDepths(n), S = Object.keys(n.containers).sort(
      (t, o) => (c.get(o) || 0) - (c.get(t) || 0)
    ), u = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), y = (t) => u.has(t) ? u.get(t) : C(t);
    for (const t of S) {
      if (!!((e = n.containers[t]) != null && e.collapsed)) {
        u.set(t, {
          width: Wt,
          height: Jt
        });
        continue;
      }
      const I = r.get(t) || [];
      if (I.length === 0) {
        u.set(t, {
          width: Ut,
          height: _t
        });
        continue;
      }
      const a = g.arrange(t, I, n, y);
      for (const x of a.boxes)
        l.set(x.id, x);
      const G = Math.max(a.width + Ft * 2, Wt), Y = a.height + $t + jt * 2;
      u.set(t, { width: G, height: Y });
    }
    const w = r.get(null) || [];
    let E = [];
    w.length > 0 && (E = g.arrange(null, w, n, y).boxes.map((o) => ({
      ...o,
      localX: o.localX + 60,
      localY: o.localY + 60
    })));
    const B = (t, o, I, a, G) => {
      var m;
      const Y = !!n.containers[t], x = { id: t, x: o, y: I, width: a, height: G };
      if (Y) {
        if (h[t] = x, (m = n.containers[t]) != null && m.collapsed) return;
        const H = o + Ft, K = I + $t + jt, D = r.get(t) || [];
        for (const W of D) {
          const f = l.get(W);
          f && B(
            W,
            H + f.localX,
            K + f.localY,
            f.width,
            f.height
          );
        }
      } else
        d[t] = x;
    };
    for (const t of E)
      B(t.id, t.localX, t.localY, t.width, t.height);
    return Ge.assignDynamicPortSides(n, d, h), { nodes: d, containers: h };
  }
  static getContainerDepths(n) {
    const g = /* @__PURE__ */ new Map(), i = (d) => {
      var r;
      if (g.has(d)) return g.get(d);
      const h = (r = n.containers[d]) == null ? void 0 : r.parentId;
      if (!h || !n.containers[h])
        return g.set(d, 0), 0;
      const C = 1 + i(h);
      return g.set(d, C), C;
    };
    for (const d of Object.keys(n.containers))
      i(d);
    return g;
  }
}
const xe = 70, Dt = 28, Ke = 2;
class Le {
  constructor(n = {}) {
    this.options = n;
  }
  arrange(n, g, i, d) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const h = this.options.direction ?? "TB", C = h === "TB" || h === "BT", r = h === "BT" || h === "RL", c = new Set(g), S = [], u = /* @__PURE__ */ new Set();
    for (const f of Object.values(i.edges)) {
      const L = this.resolveToDirectChild(f.sourceId, c, i), P = this.resolveToDirectChild(f.targetId, c, i);
      if (L && P && L !== P) {
        const X = `${L}->${P}`;
        u.has(X) || (u.add(X), S.push({ sourceId: L, targetId: P }));
      }
    }
    const l = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map();
    for (const f of g)
      l.set(f, 0), y.set(f, 0), w.set(f, []), E.set(f, []);
    for (const f of S)
      w.get(f.sourceId).push(f.targetId), E.get(f.targetId).push(f.sourceId), l.set(f.targetId, (l.get(f.targetId) || 0) + 1), y.set(f.sourceId, (y.get(f.sourceId) || 0) + 1);
    const B = /* @__PURE__ */ new Map();
    if (r) {
      const f = /* @__PURE__ */ new Map(), L = g.filter((b) => (y.get(b) || 0) === 0);
      for (const b of L) f.set(b, 0);
      const P = /* @__PURE__ */ new Set();
      for (; L.length > 0; ) {
        const b = L.shift();
        P.add(b);
        const V = f.get(b);
        for (const v of E.get(b)) {
          const T = Math.max(f.get(v) || 0, V + 1);
          f.set(v, T), y.set(v, y.get(v) - 1), y.get(v) === 0 && L.push(v);
        }
      }
      let X = 0;
      for (const b of f.values())
        X = Math.max(X, b);
      for (const b of g) {
        const V = P.has(b) ? f.get(b) : X;
        B.set(b, X - V);
      }
    } else {
      const f = g.filter((P) => (l.get(P) || 0) === 0);
      for (const P of f) B.set(P, 0);
      const L = /* @__PURE__ */ new Set();
      for (; f.length > 0; ) {
        const P = f.shift();
        L.add(P);
        const X = B.get(P);
        for (const b of w.get(P)) {
          const V = Math.max(B.get(b) || 0, X + 1);
          B.set(b, V), l.set(b, l.get(b) - 1), l.get(b) === 0 && f.push(b);
        }
      }
      for (const P of g)
        L.has(P) || B.set(P, 0);
    }
    const e = /* @__PURE__ */ new Map();
    for (const [f, L] of B.entries())
      e.has(L) || e.set(L, []), e.get(L).push(f);
    const t = Array.from(e.keys()).sort((f, L) => f - L), o = r ? [...t].reverse() : t, I = /* @__PURE__ */ new Map(), a = (f) => {
      const L = d(f);
      return C ? L.width : L.height;
    }, G = (f) => {
      const L = B.get(f);
      return (E.get(f) || []).filter((P) => B.get(P) !== L);
    }, Y = (f) => {
      const L = B.get(f);
      return (w.get(f) || []).filter((P) => B.get(P) !== L);
    };
    for (let f = 0; f < Ke; f++) {
      for (const L of t)
        this.alignLayer(
          e.get(L) || [],
          G,
          I,
          a,
          f === 0
        );
      for (let L = t.length - 1; L >= 0; L--) {
        const P = t[L];
        this.alignLayer(
          e.get(P) || [],
          Y,
          I,
          a,
          !1
        );
      }
    }
    let x = 1 / 0;
    for (const f of I.values())
      x = Math.min(x, f);
    const m = Number.isFinite(x) && x !== 0 ? -x : 0, H = [];
    let K = 0;
    for (const f of o) {
      const L = e.get(f);
      let P = 0;
      for (const X of L) {
        const b = d(X), V = C ? b.height : b.width, v = (I.get(X) ?? 0) + m, T = C ? v : K, Q = C ? K : v;
        H.push({ id: X, localX: T, localY: Q, width: b.width, height: b.height }), P = Math.max(P, V);
      }
      K += P + xe;
    }
    const D = Math.max(...H.map((f) => f.localX + f.width), 0), W = Math.max(...H.map((f) => f.localY + f.height), 0);
    return { width: D, height: W, boxes: H };
  }
  alignLayer(n, g, i, d, h) {
    if (n.length === 0) return;
    const C = /* @__PURE__ */ new Map();
    for (const u of n)
      C.set(u, this.getAvgNeighborPos(g(u), i, d));
    n.sort((u, l) => {
      const y = C.get(u) ?? null, w = C.get(l) ?? null;
      if (h) {
        const o = y !== null ? 0 : 1, I = w !== null ? 0 : 1;
        if (o !== I) return o - I;
      }
      const E = i.get(u), B = i.get(l), e = y ?? (E !== void 0 ? E + d(u) / 2 : 0), t = w ?? (B !== void 0 ? B + d(l) / 2 : 0);
      return e !== t ? e - t : E !== void 0 && B !== void 0 && E !== B ? E - B : 0;
    });
    const r = (u, l) => {
      let y = 0, w = 0, E = 0;
      for (let e = 0; e < u.length; e++) {
        const t = u[e];
        e > 0 && (y += Dt);
        const o = y + t.breadth / 2;
        t.idealCenter !== null && (w += t.idealCenter - o, E++), y += t.breadth;
      }
      const B = E > 0 ? w / E : l;
      return { items: u, totalBreadth: y, start: B };
    }, c = [];
    let S = -1 / 0;
    for (const u of n) {
      const l = d(u), y = C.get(u) ?? null;
      let w;
      y !== null ? w = y - l / 2 : !h && i.has(u) ? w = i.get(u) : w = S === -1 / 0 ? 0 : S + Dt;
      let E = {
        items: [{ id: u, breadth: l, idealCenter: y }],
        totalBreadth: l,
        start: w
      };
      for (; c.length > 0; ) {
        const B = c[c.length - 1];
        if (B.start + B.totalBreadth + Dt <= E.start + 1e-6)
          break;
        c.pop(), E = r([...B.items, ...E.items], B.start);
      }
      c.push(E), S = E.start + E.totalBreadth;
    }
    for (const u of c) {
      let l = u.start;
      for (const y of u.items)
        i.set(y.id, l), l += y.breadth + Dt;
    }
  }
  getAvgNeighborPos(n, g, i) {
    if (n.length === 0) return null;
    const d = n.map((h) => {
      const C = g.get(h);
      return C === void 0 ? null : C + i(h) / 2;
    }).filter((h) => h !== null);
    return d.length === 0 ? null : d.reduce((h, C) => h + C, 0) / d.length;
  }
  resolveToDirectChild(n, g, i) {
    var h, C;
    let d = n;
    for (; d; ) {
      if (g.has(d)) return d;
      d = ((h = i.nodes[d]) == null ? void 0 : h.parentId) ?? ((C = i.containers[d]) == null ? void 0 : C.parentId) ?? null;
    }
    return null;
  }
}
const yt = 32, qt = 24;
class Ze {
  constructor(n = 1.55) {
    this.targetAspect = n;
  }
  arrange(n, g, i, d) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const h = g.map((r) => {
      const c = d(r);
      return { id: r, width: c.width, height: c.height };
    }), C = this.findBestTightPacking(h, this.targetAspect);
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
    const i = n.reduce((l, y) => l + y.width * y.height, 0), d = Math.max(...n.map((l) => l.width)), h = [...n].sort((l, y) => y.width - l.width), C = /* @__PURE__ */ new Set(), r = n.reduce((l, y) => l + y.width, 0) + (n.length - 1) * yt;
    C.add(r), C.add(d);
    const c = Math.max(d, Math.sqrt(i * g));
    C.add(c), C.add(c * 0.85), C.add(c * 1.15);
    const S = Math.min(n.length, 6);
    for (let l = 2; l <= S; l++) {
      let y = 0;
      for (let w = 0; w < l && w < h.length; w++)
        y += h[w].width;
      y += (l - 1) * yt, y >= d && C.add(y);
    }
    let u = null;
    for (const l of C) {
      const y = this.simulateSkylinePacking(n, l), w = y.width * y.height, E = Math.max(0, w - i), B = y.width / Math.max(1, y.height), e = Math.abs(Math.log(B / g)), t = E / i * 2 + e * 0.25;
      y.score = t, (!u || t < u.score) && (u = y);
    }
    return u;
  }
  simulateSkylinePacking(n, g) {
    const i = [...n].sort((c, S) => S.height - c.height), d = [{ x: 0, width: g, y: 0 }], h = [];
    for (const c of i) {
      let S = 1 / 0, u = -1;
      for (let t = 0; t < d.length; t++) {
        if (d[t].x + c.width > g) continue;
        let I = 0, a = 0;
        for (let G = t; G < d.length && a < c.width; G++)
          I = Math.max(I, d[G].y), a += d[G].width;
        I < S && (S = I, u = t);
      }
      if (u === -1) {
        const t = Math.max(...d.map((I) => I.y)), o = t === 0 ? 0 : t + qt;
        h.push({ id: c.id, localX: 0, localY: o, width: c.width, height: c.height }), d.length = 0, d.push({ x: 0, width: c.width + yt, y: o + c.height }), g > c.width + yt && d.push({
          x: c.width + yt,
          width: g - (c.width + yt),
          y: 0
        });
        continue;
      }
      const l = d[u].x, y = S === 0 ? 0 : S + qt;
      h.push({ id: c.id, localX: l, localY: y, width: c.width, height: c.height });
      const w = c.width + yt, E = y + c.height, B = { x: l, width: w, y: E }, e = [];
      for (const t of d)
        t.x + t.width <= l || t.x >= l + w ? e.push(t) : (t.x < l && e.push({ x: t.x, width: l - t.x, y: t.y }), t.x + t.width > l + w && e.push({
          x: l + w,
          width: t.x + t.width - (l + w),
          y: t.y
        }));
      e.push(B), e.sort((t, o) => t.x - o.x), d.length = 0, d.push(...e);
    }
    const C = Math.max(...h.map((c) => c.localX + c.width), 0), r = Math.max(...h.map((c) => c.localY + c.height), 0);
    return { width: C, height: r, boxes: h, score: 0 };
  }
}
function te(s, n, g) {
  var h, C;
  let i = s, d = null;
  for (; i; )
    g.has(i) && (d = i), i = ((h = n.nodes[i]) == null ? void 0 : h.parentId) ?? ((C = n.containers[i]) == null ? void 0 : C.parentId) ?? void 0;
  return d ?? s;
}
class Ee {
  async execute(n, g, i) {
    const d = Object.values(n.containers), h = new Set(
      d.filter((l) => !!l.collapsed).map((l) => l.id)
    ), C = {};
    for (const [l, y] of Object.entries(n.edges)) {
      const w = te(y.sourceId, n, h), E = te(y.targetId, n, h);
      w !== E && (C[l] = {
        ...y,
        sourceId: w,
        targetId: E
      });
    }
    const r = {
      ...n,
      edges: C
    }, c = Object.keys(n.containers).length, u = (i != null && i.mode && i.mode !== "auto" ? i.mode : c > 0 ? "concurrent" : "flow") === "concurrent" ? new Ze((i == null ? void 0 : i.aspectRatio) ?? 1.55) : new Le(i);
    return Rt.execute(r, u, g);
  }
}
const ne = "Y2xhc3MgViB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIGEsIGw7CiAgICBjb25zdCBuID0gKGcpID0+IGRbZ10gfHwgaVtnXTsKICAgIGZvciAoY29uc3QgZyBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHIgPSBuKGcuc291cmNlSWQpLCBDID0gbihnLnRhcmdldElkKTsKICAgICAgaWYgKCFyIHx8ICFDKSBjb250aW51ZTsKICAgICAgY29uc3QgaCA9IGUubm9kZXNbZy5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2cuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tnLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbZy50YXJnZXRJZF0sIGMgPSBDLnggKyBDLndpZHRoIC8gMiAtIChyLnggKyByLndpZHRoIC8gMiksIGYgPSBDLnkgKyBDLmhlaWdodCAvIDIgLSAoci55ICsgci5oZWlnaHQgLyAyKSwgdyA9IE1hdGguYWJzKGMpID4gTWF0aC5hYnMoZikgKiAxLjI1LCB1ID0gKGEgPSBoID09IG51bGwgPyB2b2lkIDAgOiBoLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBnLnNvdXJjZVBvcnRJZCk7CiAgICAgIHUgJiYgKCF1LnNpZGUgfHwgdS5zaWRlID09PSAiYXV0byIpICYmICh3ID8gdS5zaWRlID0gYyA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IHUuc2lkZSA9IGYgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBwID0gKGwgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogbC5maW5kKCh0KSA9PiB0LmlkID09PSBnLnRhcmdldFBvcnRJZCk7CiAgICAgIHAgJiYgKCFwLnNpZGUgfHwgcC5zaWRlID09PSAiYXV0byIpICYmICh3ID8gcC5zaWRlID0gYyA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IHAuc2lkZSA9IGYgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBYID0gMjIsIEcgPSAxOCwgaiA9IDM4LCBMID0gMjEwLCBGID0gMzYsIEogPSAxODAsIFEgPSA1NCwgSyA9IDI2MCwgcSA9IDE2MDsKY2xhc3MgVyB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIHA7CiAgICBjb25zdCBuID0ge30sIGEgPSB7fSwgbCA9ICh0KSA9PiB7CiAgICAgIHZhciB2LCBBLCBULCBiLCBQOwogICAgICBjb25zdCBJID0gISFlLmNvbnRhaW5lcnNbdF0sIG0gPSAhISgodiA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB2LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBJICYmIG0gPyB7IHdpZHRoOiBMLCBoZWlnaHQ6IEYgfSA6IEkgJiYgIW0gPyB7CiAgICAgICAgd2lkdGg6ICgoQSA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogQS53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8IHEKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBKLAogICAgICAgIGhlaWdodDogKChQID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBQLmhlaWdodCkgfHwgUQogICAgICB9OwogICAgfSwgZyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBJXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCBtID0gSS5wYXJlbnRJZCA/PyBudWxsOwogICAgICBnLmhhcyhtKSB8fCBnLnNldChtLCBbXSksIGcuZ2V0KG0pLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBJXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IG0gPSBJLnBhcmVudElkID8/IG51bGw7CiAgICAgIGcuaGFzKG0pIHx8IGcuc2V0KG0sIFtdKSwgZy5nZXQobSkucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IHIgPSBXLmdldENvbnRhaW5lckRlcHRocyhlKSwgQyA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIEkpID0+IChyLmdldChJKSB8fCAwKSAtIChyLmdldCh0KSB8fCAwKQogICAgKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBjID0gKHQpID0+IGguaGFzKHQpID8gaC5nZXQodCkgOiBsKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEMpIHsKICAgICAgaWYgKCEhKChwID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIHAuY29sbGFwc2VkKSkgewogICAgICAgIGguc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBMLAogICAgICAgICAgaGVpZ2h0OiBGCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgbSA9IGcuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAobS5sZW5ndGggPT09IDApIHsKICAgICAgICBoLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogcQogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHYgPSBkLmFycmFuZ2UodCwgbSwgZSwgYyk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB2LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBBID0gTWF0aC5tYXgodi53aWR0aCArIFggKiAyLCBMKSwgVCA9IHYuaGVpZ2h0ICsgaiArIEcgKiAyOwogICAgICBoLnNldCh0LCB7IHdpZHRoOiBBLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCBmID0gZy5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgdyA9IFtdOwogICAgZi5sZW5ndGggPiAwICYmICh3ID0gZC5hcnJhbmdlKG51bGwsIGYsIGUsIGMpLmJveGVzLm1hcCgoSSkgPT4gKHsKICAgICAgLi4uSSwKICAgICAgbG9jYWxYOiBJLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IEkubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCB1ID0gKHQsIEksIG0sIHYsIEEpID0+IHsKICAgICAgdmFyIFA7CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IEksIHk6IG0sIHdpZHRoOiB2LCBoZWlnaHQ6IEEgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoYVt0XSA9IGIsIChQID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIFAuY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgXyA9IEkgKyBYLCBOID0gbSArIGogKyBHLCBIID0gZy5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBCIG9mIEgpIHsKICAgICAgICAgIGNvbnN0IG8gPSBzLmdldChCKTsKICAgICAgICAgIG8gJiYgdSgKICAgICAgICAgICAgQiwKICAgICAgICAgICAgXyArIG8ubG9jYWxYLAogICAgICAgICAgICBOICsgby5sb2NhbFksCiAgICAgICAgICAgIG8ud2lkdGgsCiAgICAgICAgICAgIG8uaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIHcpCiAgICAgIHUodC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gVi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIGEpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiBhIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgZzsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IGEgPSAoZyA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGcucGFyZW50SWQ7CiAgICAgIGlmICghYSB8fCAhZS5jb250YWluZXJzW2FdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgbCA9IDEgKyBpKGEpOwogICAgICByZXR1cm4gZC5zZXQobiwgbCksIGw7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgWiA9IDcwLCBZID0gMjgsIHR0ID0gMjsKY2xhc3MgZXQgewogIGNvbnN0cnVjdG9yKGUgPSB7fSkgewogICAgdGhpcy5vcHRpb25zID0gZTsKICB9CiAgYXJyYW5nZShlLCBkLCBpLCBuKSB7CiAgICBpZiAoZC5sZW5ndGggPT09IDApCiAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIGJveGVzOiBbXSB9OwogICAgY29uc3QgYSA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPz8gIlRCIiwgbCA9IGEgPT09ICJUQiIgfHwgYSA9PT0gIkJUIiwgZyA9IGEgPT09ICJCVCIgfHwgYSA9PT0gIlJMIiwgciA9IG5ldyBTZXQoZCksIEMgPSBbXSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgT2JqZWN0LnZhbHVlcyhpLmVkZ2VzKSkgewogICAgICBjb25zdCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnNvdXJjZUlkLCByLCBpKSwgTSA9IHRoaXMucmVzb2x2ZVRvRGlyZWN0Q2hpbGQoby50YXJnZXRJZCwgciwgaSk7CiAgICAgIGlmICh4ICYmIE0gJiYgeCAhPT0gTSkgewogICAgICAgIGNvbnN0IEQgPSBgJHt4fS0+JHtNfWA7CiAgICAgICAgaC5oYXMoRCkgfHwgKGguYWRkKEQpLCBDLnB1c2goeyBzb3VyY2VJZDogeCwgdGFyZ2V0SWQ6IE0gfSkpOwogICAgICB9CiAgICB9CiAgICBjb25zdCBzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGYgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCB3ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgbyBvZiBkKQogICAgICBzLnNldChvLCAwKSwgYy5zZXQobywgMCksIGYuc2V0KG8sIFtdKSwgdy5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEMpCiAgICAgIGYuZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHcuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpLCBjLnNldChvLnNvdXJjZUlkLCAoYy5nZXQoby5zb3VyY2VJZCkgfHwgMCkgKyAxKTsKICAgIGNvbnN0IHUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgaWYgKGcpIHsKICAgICAgY29uc3QgbyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHggPSBkLmZpbHRlcigoeSkgPT4gKGMuZ2V0KHkpIHx8IDApID09PSAwKTsKICAgICAgZm9yIChjb25zdCB5IG9mIHgpIG8uc2V0KHksIDApOwogICAgICBjb25zdCBNID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgICAgZm9yICg7IHgubGVuZ3RoID4gMDsgKSB7CiAgICAgICAgY29uc3QgeSA9IHguc2hpZnQoKTsKICAgICAgICBNLmFkZCh5KTsKICAgICAgICBjb25zdCBrID0gby5nZXQoeSk7CiAgICAgICAgZm9yIChjb25zdCBFIG9mIHcuZ2V0KHkpKSB7CiAgICAgICAgICBjb25zdCBSID0gTWF0aC5tYXgoby5nZXQoRSkgfHwgMCwgayArIDEpOwogICAgICAgICAgby5zZXQoRSwgUiksIGMuc2V0KEUsIGMuZ2V0KEUpIC0gMSksIGMuZ2V0KEUpID09PSAwICYmIHgucHVzaChFKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IEQgPSAwOwogICAgICBmb3IgKGNvbnN0IHkgb2Ygby52YWx1ZXMoKSkKICAgICAgICBEID0gTWF0aC5tYXgoRCwgeSk7CiAgICAgIGZvciAoY29uc3QgeSBvZiBkKSB7CiAgICAgICAgY29uc3QgayA9IE0uaGFzKHkpID8gby5nZXQoeSkgOiBEOwogICAgICAgIHUuc2V0KHksIEQgLSBrKTsKICAgICAgfQogICAgfSBlbHNlIHsKICAgICAgY29uc3QgbyA9IGQuZmlsdGVyKChNKSA9PiAocy5nZXQoTSkgfHwgMCkgPT09IDApOwogICAgICBmb3IgKGNvbnN0IE0gb2YgbykgdS5zZXQoTSwgMCk7CiAgICAgIGNvbnN0IHggPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICBmb3IgKDsgby5sZW5ndGggPiAwOyApIHsKICAgICAgICBjb25zdCBNID0gby5zaGlmdCgpOwogICAgICAgIHguYWRkKE0pOwogICAgICAgIGNvbnN0IEQgPSB1LmdldChNKTsKICAgICAgICBmb3IgKGNvbnN0IHkgb2YgZi5nZXQoTSkpIHsKICAgICAgICAgIGNvbnN0IGsgPSBNYXRoLm1heCh1LmdldCh5KSB8fCAwLCBEICsgMSk7CiAgICAgICAgICB1LnNldCh5LCBrKSwgcy5zZXQoeSwgcy5nZXQoeSkgLSAxKSwgcy5nZXQoeSkgPT09IDAgJiYgby5wdXNoKHkpOwogICAgICAgIH0KICAgICAgfQogICAgICBmb3IgKGNvbnN0IE0gb2YgZCkKICAgICAgICB4LmhhcyhNKSB8fCB1LnNldChNLCAwKTsKICAgIH0KICAgIGNvbnN0IHAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbbywgeF0gb2YgdS5lbnRyaWVzKCkpCiAgICAgIHAuaGFzKHgpIHx8IHAuc2V0KHgsIFtdKSwgcC5nZXQoeCkucHVzaChvKTsKICAgIGNvbnN0IHQgPSBBcnJheS5mcm9tKHAua2V5cygpKS5zb3J0KChvLCB4KSA9PiBvIC0geCksIEkgPSBnID8gWy4uLnRdLnJldmVyc2UoKSA6IHQsIG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCB2ID0gKG8pID0+IHsKICAgICAgY29uc3QgeCA9IG4obyk7CiAgICAgIHJldHVybiBsID8geC53aWR0aCA6IHguaGVpZ2h0OwogICAgfSwgQSA9IChvKSA9PiB7CiAgICAgIGNvbnN0IHggPSB1LmdldChvKTsKICAgICAgcmV0dXJuICh3LmdldChvKSB8fCBbXSkuZmlsdGVyKChNKSA9PiB1LmdldChNKSAhPT0geCk7CiAgICB9LCBUID0gKG8pID0+IHsKICAgICAgY29uc3QgeCA9IHUuZ2V0KG8pOwogICAgICByZXR1cm4gKGYuZ2V0KG8pIHx8IFtdKS5maWx0ZXIoKE0pID0+IHUuZ2V0KE0pICE9PSB4KTsKICAgIH07CiAgICBmb3IgKGxldCBvID0gMDsgbyA8IHR0OyBvKyspIHsKICAgICAgZm9yIChjb25zdCB4IG9mIHQpCiAgICAgICAgdGhpcy5hbGlnbkxheWVyKAogICAgICAgICAgcC5nZXQoeCkgfHwgW10sCiAgICAgICAgICBBLAogICAgICAgICAgbSwKICAgICAgICAgIHYsCiAgICAgICAgICBvID09PSAwCiAgICAgICAgKTsKICAgICAgZm9yIChsZXQgeCA9IHQubGVuZ3RoIC0gMTsgeCA+PSAwOyB4LS0pIHsKICAgICAgICBjb25zdCBNID0gdFt4XTsKICAgICAgICB0aGlzLmFsaWduTGF5ZXIoCiAgICAgICAgICBwLmdldChNKSB8fCBbXSwKICAgICAgICAgIFQsCiAgICAgICAgICBtLAogICAgICAgICAgdiwKICAgICAgICAgICExCiAgICAgICAgKTsKICAgICAgfQogICAgfQogICAgbGV0IGIgPSAxIC8gMDsKICAgIGZvciAoY29uc3QgbyBvZiBtLnZhbHVlcygpKQogICAgICBiID0gTWF0aC5taW4oYiwgbyk7CiAgICBjb25zdCBQID0gTnVtYmVyLmlzRmluaXRlKGIpICYmIGIgIT09IDAgPyAtYiA6IDAsIF8gPSBbXTsKICAgIGxldCBOID0gMDsKICAgIGZvciAoY29uc3QgbyBvZiBJKSB7CiAgICAgIGNvbnN0IHggPSBwLmdldChvKTsKICAgICAgbGV0IE0gPSAwOwogICAgICBmb3IgKGNvbnN0IEQgb2YgeCkgewogICAgICAgIGNvbnN0IHkgPSBuKEQpLCBrID0gbCA/IHkuaGVpZ2h0IDogeS53aWR0aCwgRSA9IChtLmdldChEKSA/PyAwKSArIFAsIFIgPSBsID8gRSA6IE4sIHogPSBsID8gTiA6IEU7CiAgICAgICAgXy5wdXNoKHsgaWQ6IEQsIGxvY2FsWDogUiwgbG9jYWxZOiB6LCB3aWR0aDogeS53aWR0aCwgaGVpZ2h0OiB5LmhlaWdodCB9KSwgTSA9IE1hdGgubWF4KE0sIGspOwogICAgICB9CiAgICAgIE4gKz0gTSArIFo7CiAgICB9CiAgICBjb25zdCBIID0gTWF0aC5tYXgoLi4uXy5tYXAoKG8pID0+IG8ubG9jYWxYICsgby53aWR0aCksIDApLCBCID0gTWF0aC5tYXgoLi4uXy5tYXAoKG8pID0+IG8ubG9jYWxZICsgby5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBILCBoZWlnaHQ6IEIsIGJveGVzOiBfIH07CiAgfQogIGFsaWduTGF5ZXIoZSwgZCwgaSwgbiwgYSkgewogICAgaWYgKGUubGVuZ3RoID09PSAwKSByZXR1cm47CiAgICBjb25zdCBsID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgaCBvZiBlKQogICAgICBsLnNldChoLCB0aGlzLmdldEF2Z05laWdoYm9yUG9zKGQoaCksIGksIG4pKTsKICAgIGUuc29ydCgoaCwgcykgPT4gewogICAgICBjb25zdCBjID0gbC5nZXQoaCkgPz8gbnVsbCwgZiA9IGwuZ2V0KHMpID8/IG51bGw7CiAgICAgIGlmIChhKSB7CiAgICAgICAgY29uc3QgSSA9IGMgIT09IG51bGwgPyAwIDogMSwgbSA9IGYgIT09IG51bGwgPyAwIDogMTsKICAgICAgICBpZiAoSSAhPT0gbSkgcmV0dXJuIEkgLSBtOwogICAgICB9CiAgICAgIGNvbnN0IHcgPSBpLmdldChoKSwgdSA9IGkuZ2V0KHMpLCBwID0gYyA/PyAodyAhPT0gdm9pZCAwID8gdyArIG4oaCkgLyAyIDogMCksIHQgPSBmID8/ICh1ICE9PSB2b2lkIDAgPyB1ICsgbihzKSAvIDIgOiAwKTsKICAgICAgcmV0dXJuIHAgIT09IHQgPyBwIC0gdCA6IHcgIT09IHZvaWQgMCAmJiB1ICE9PSB2b2lkIDAgJiYgdyAhPT0gdSA/IHcgLSB1IDogMDsKICAgIH0pOwogICAgY29uc3QgZyA9IChoLCBzKSA9PiB7CiAgICAgIGxldCBjID0gMCwgZiA9IDAsIHcgPSAwOwogICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGgubGVuZ3RoOyBwKyspIHsKICAgICAgICBjb25zdCB0ID0gaFtwXTsKICAgICAgICBwID4gMCAmJiAoYyArPSBZKTsKICAgICAgICBjb25zdCBJID0gYyArIHQuYnJlYWR0aCAvIDI7CiAgICAgICAgdC5pZGVhbENlbnRlciAhPT0gbnVsbCAmJiAoZiArPSB0LmlkZWFsQ2VudGVyIC0gSSwgdysrKSwgYyArPSB0LmJyZWFkdGg7CiAgICAgIH0KICAgICAgY29uc3QgdSA9IHcgPiAwID8gZiAvIHcgOiBzOwogICAgICByZXR1cm4geyBpdGVtczogaCwgdG90YWxCcmVhZHRoOiBjLCBzdGFydDogdSB9OwogICAgfSwgciA9IFtdOwogICAgbGV0IEMgPSAtMSAvIDA7CiAgICBmb3IgKGNvbnN0IGggb2YgZSkgewogICAgICBjb25zdCBzID0gbihoKSwgYyA9IGwuZ2V0KGgpID8/IG51bGw7CiAgICAgIGxldCBmOwogICAgICBjICE9PSBudWxsID8gZiA9IGMgLSBzIC8gMiA6ICFhICYmIGkuaGFzKGgpID8gZiA9IGkuZ2V0KGgpIDogZiA9IEMgPT09IC0xIC8gMCA/IDAgOiBDICsgWTsKICAgICAgbGV0IHcgPSB7CiAgICAgICAgaXRlbXM6IFt7IGlkOiBoLCBicmVhZHRoOiBzLCBpZGVhbENlbnRlcjogYyB9XSwKICAgICAgICB0b3RhbEJyZWFkdGg6IHMsCiAgICAgICAgc3RhcnQ6IGYKICAgICAgfTsKICAgICAgZm9yICg7IHIubGVuZ3RoID4gMDsgKSB7CiAgICAgICAgY29uc3QgdSA9IHJbci5sZW5ndGggLSAxXTsKICAgICAgICBpZiAodS5zdGFydCArIHUudG90YWxCcmVhZHRoICsgWSA8PSB3LnN0YXJ0ICsgMWUtNikKICAgICAgICAgIGJyZWFrOwogICAgICAgIHIucG9wKCksIHcgPSBnKFsuLi51Lml0ZW1zLCAuLi53Lml0ZW1zXSwgdS5zdGFydCk7CiAgICAgIH0KICAgICAgci5wdXNoKHcpLCBDID0gdy5zdGFydCArIHcudG90YWxCcmVhZHRoOwogICAgfQogICAgZm9yIChjb25zdCBoIG9mIHIpIHsKICAgICAgbGV0IHMgPSBoLnN0YXJ0OwogICAgICBmb3IgKGNvbnN0IGMgb2YgaC5pdGVtcykKICAgICAgICBpLnNldChjLmlkLCBzKSwgcyArPSBjLmJyZWFkdGggKyBZOwogICAgfQogIH0KICBnZXRBdmdOZWlnaGJvclBvcyhlLCBkLCBpKSB7CiAgICBpZiAoZS5sZW5ndGggPT09IDApIHJldHVybiBudWxsOwogICAgY29uc3QgbiA9IGUubWFwKChhKSA9PiB7CiAgICAgIGNvbnN0IGwgPSBkLmdldChhKTsKICAgICAgcmV0dXJuIGwgPT09IHZvaWQgMCA/IG51bGwgOiBsICsgaShhKSAvIDI7CiAgICB9KS5maWx0ZXIoKGEpID0+IGEgIT09IG51bGwpOwogICAgcmV0dXJuIG4ubGVuZ3RoID09PSAwID8gbnVsbCA6IG4ucmVkdWNlKChhLCBsKSA9PiBhICsgbCwgMCkgLyBuLmxlbmd0aDsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIGEsIGw7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKGEgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gKChsID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogbC5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBPID0gMzIsIFUgPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IGEgPSBkLm1hcCgoZykgPT4gewogICAgICBjb25zdCByID0gbihnKTsKICAgICAgcmV0dXJuIHsgaWQ6IGcsIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH07CiAgICB9KSwgbCA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcoYSwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGwud2lkdGgsIGhlaWdodDogbC5oZWlnaHQsIGJveGVzOiBsLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGMpID0+IHMgKyBjLndpZHRoICogYy5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgYSA9IFsuLi5lXS5zb3J0KChzLCBjKSA9PiBjLndpZHRoIC0gcy53aWR0aCksIGwgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBnID0gZS5yZWR1Y2UoKHMsIGMpID0+IHMgKyBjLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogTzsKICAgIGwuYWRkKGcpLCBsLmFkZChuKTsKICAgIGNvbnN0IHIgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGwuYWRkKHIpLCBsLmFkZChyICogMC44NSksIGwuYWRkKHIgKiAxLjE1KTsKICAgIGNvbnN0IEMgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBDOyBzKyspIHsKICAgICAgbGV0IGMgPSAwOwogICAgICBmb3IgKGxldCBmID0gMDsgZiA8IHMgJiYgZiA8IGEubGVuZ3RoOyBmKyspCiAgICAgICAgYyArPSBhW2ZdLndpZHRoOwogICAgICBjICs9IChzIC0gMSkgKiBPLCBjID49IG4gJiYgbC5hZGQoYyk7CiAgICB9CiAgICBsZXQgaCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgbCkgewogICAgICBjb25zdCBjID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCBmID0gYy53aWR0aCAqIGMuaGVpZ2h0LCB3ID0gTWF0aC5tYXgoMCwgZiAtIGkpLCB1ID0gYy53aWR0aCAvIE1hdGgubWF4KDEsIGMuaGVpZ2h0KSwgcCA9IE1hdGguYWJzKE1hdGgubG9nKHUgLyBkKSksIHQgPSB3IC8gaSAqIDIgKyBwICogMC4yNTsKICAgICAgYy5zY29yZSA9IHQsICghaCB8fCB0IDwgaC5zY29yZSkgJiYgKGggPSBjKTsKICAgIH0KICAgIHJldHVybiBoOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgociwgQykgPT4gQy5oZWlnaHQgLSByLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgYSA9IFtdOwogICAgZm9yIChjb25zdCByIG9mIGkpIHsKICAgICAgbGV0IEMgPSAxIC8gMCwgaCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgci53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCBtID0gMCwgdiA9IDA7CiAgICAgICAgZm9yIChsZXQgQSA9IHQ7IEEgPCBuLmxlbmd0aCAmJiB2IDwgci53aWR0aDsgQSsrKQogICAgICAgICAgbSA9IE1hdGgubWF4KG0sIG5bQV0ueSksIHYgKz0gbltBXS53aWR0aDsKICAgICAgICBtIDwgQyAmJiAoQyA9IG0sIGggPSB0KTsKICAgICAgfQogICAgICBpZiAoaCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKG0pID0+IG0ueSkpLCBJID0gdCA9PT0gMCA/IDAgOiB0ICsgVTsKICAgICAgICBhLnB1c2goeyBpZDogci5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IEksIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiByLndpZHRoICsgTywgeTogSSArIHIuaGVpZ2h0IH0pLCBkID4gci53aWR0aCArIE8gJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IHIud2lkdGggKyBPLAogICAgICAgICAgd2lkdGg6IGQgLSAoci53aWR0aCArIE8pLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW2hdLngsIGMgPSBDID09PSAwID8gMCA6IEMgKyBVOwogICAgICBhLnB1c2goeyBpZDogci5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGMsIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH0pOwogICAgICBjb25zdCBmID0gci53aWR0aCArIE8sIHcgPSBjICsgci5oZWlnaHQsIHUgPSB7IHg6IHMsIHdpZHRoOiBmLCB5OiB3IH0sIHAgPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgZiA/IHAucHVzaCh0KSA6ICh0LnggPCBzICYmIHAucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyBmICYmIHAucHVzaCh7CiAgICAgICAgICB4OiBzICsgZiwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyBmKSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgcC5wdXNoKHUpLCBwLnNvcnQoKHQsIEkpID0+IHQueCAtIEkueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLnApOwogICAgfQogICAgY29uc3QgbCA9IE1hdGgubWF4KC4uLmEubWFwKChyKSA9PiByLmxvY2FsWCArIHIud2lkdGgpLCAwKSwgZyA9IE1hdGgubWF4KC4uLmEubWFwKChyKSA9PiByLmxvY2FsWSArIHIuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogbCwgaGVpZ2h0OiBnLCBib3hlczogYSwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gJChTLCBlLCBkKSB7CiAgdmFyIGEsIGw7CiAgbGV0IGkgPSBTLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgoYSA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyAoKGwgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBsLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gUzsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCBhID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGwgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGNdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSAkKGMuc291cmNlSWQsIGUsIGEpLCB3ID0gJChjLnRhcmdldElkLCBlLCBhKTsKICAgICAgZiAhPT0gdyAmJiAobFtzXSA9IHsKICAgICAgICAuLi5jLAogICAgICAgIHNvdXJjZUlkOiBmLAogICAgICAgIHRhcmdldElkOiB3CiAgICAgIH0pOwogICAgfQogICAgY29uc3QgZyA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGwKICAgIH0sIHIgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgaCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogciA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIFcuZXhlY3V0ZShnLCBoLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoUykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IFMuZGF0YTsKICB0cnkgewogICAgY29uc3QgYSA9IG5ldyBNYXAoaSksIGwgPSBhd2FpdCBzdC5leGVjdXRlKGQsIGEsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBsIH0pOwogIH0gY2F0Y2ggKGEpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiBhLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", He = (s) => Uint8Array.from(atob(s), (n) => n.charCodeAt(0)), ee = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", He(ne)], { type: "text/javascript;charset=utf-8" });
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
class De {
  constructor() {
    xt(this, "worker", null);
    xt(this, "pendingRequests", /* @__PURE__ */ new Map());
    xt(this, "fallbackEngine", new Ee());
    if (typeof Worker < "u")
      try {
        this.worker = new ke(), this.worker.onmessage = (n) => {
          const { id: g, success: i, layout: d, error: h } = n.data, C = this.pendingRequests.get(g);
          C && (this.pendingRequests.delete(g), i ? C.resolve(d) : C.reject(new Error(h)));
        }, this.worker.onerror = (n) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", n);
        };
      } catch (n) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", n), this.worker = null;
      }
  }
  execute(n, g, i) {
    return this.worker ? new Promise((d, h) => {
      const C = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(C, { resolve: d, reject: h });
      const r = Array.from(g.entries());
      this.worker.postMessage({
        id: C,
        graph: n,
        measurements: r,
        options: i
      });
    }) : this.fallbackEngine.execute(n, g, i);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class Pe {
  canDrag() {
    return !0;
  }
  onDragMove(n) {
    return n.cursorWorld;
  }
  onDragEnd(n) {
    const { draggedEntity: g, hoveredEntity: i, graph: d } = n;
    return i && i.id === g.id ? null : i && d.containers[i.id] ? g.parentId === i.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: i.id
      }
    } : !i && g.parentId !== null && g.parentId !== void 0 ? {
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
    xt(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(n) {
    return n.cursorWorld;
  }
  onDragEnd(n) {
    const { draggedEntity: g, hoveredEdge: i, hoveredEntity: d, cursorWorld: h, startWorldPos: C, graph: r } = n, c = Math.hypot(
      h.x - C.x,
      h.y - C.y
    );
    if (d && r.containers[d.id])
      return d.id !== g.id && g.parentId !== d.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: d.id
        }
      } : null;
    if (!d && !i) {
      const u = Object.values(r.edges).filter(
        (y) => y.targetId === g.id
      ), l = Object.values(r.edges).filter(
        (y) => y.sourceId === g.id
      );
      return u.length === 1 && l.length === 1 && u[0].sourceId !== l[0].targetId && c >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: u[0].id,
          outgoingEdgeId: l[0].id
        }
      } : c >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const S = (u) => {
      const l = r.nodes[u.id] || u;
      if (!l.ports || l.ports.length === 0) return "";
      const y = Object.values(r.edges).find((B) => B.targetId === u.id);
      if (y) {
        const B = l.ports.find((e) => e.id === y.targetPortId);
        if (B) return B.id;
      }
      const w = new Set(
        Object.values(r.edges).filter((B) => B.sourceId === u.id).map((B) => B.sourcePortId)
      ), E = l.ports.find((B) => !w.has(B.id));
      return E ? E.id : l.ports[0].id;
    };
    if (i)
      return i.sourceId === g.id || i.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: i.id,
          newSourceId: i.sourceId,
          newTargetId: g.id,
          newTargetPortId: S(g)
        }
      };
    if (d && d.id !== g.id && r.nodes[d.id]) {
      const u = Object.values(r.edges).find(
        (l) => l.targetId === d.id && l.sourceId !== g.id
      );
      if (u)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: u.id,
            newSourceId: u.sourceId,
            newTargetId: g.id,
            newTargetPortId: S(g)
          }
        };
    }
    return null;
  }
}
function ve(s, n = { min: 0.15, max: 3 }) {
  const [g, i] = It({ x: 80, y: 80, zoom: 1 }), d = rt(!1), h = rt({ x: 0, y: 0 }), C = z(
    (B, e) => {
      if (!s.current) return { x: B, y: e };
      const t = s.current.getBoundingClientRect();
      return {
        x: (B - t.left - g.x) / g.zoom,
        y: (e - t.top - g.y) / g.zoom
      };
    },
    [g, s]
  ), r = z(
    (B) => {
      if (!s.current) return;
      const e = [
        ...Object.values(B.nodes),
        ...Object.values(B.containers)
      ];
      if (e.length === 0) {
        i({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, o = 1 / 0, I = -1 / 0, a = -1 / 0;
      for (const L of e)
        t = Math.min(t, L.x), o = Math.min(o, L.y), I = Math.max(I, L.x + L.width), a = Math.max(a, L.y + L.height);
      const G = s.current.getBoundingClientRect(), Y = 80, x = Math.max(I - t, 100), m = Math.max(a - o, 100), H = (G.width - Y * 2) / x, K = (G.height - Y * 2) / m, D = Math.min(
        Math.max(Math.min(H, K), n.min),
        Math.min(n.max, 1.25)
      ), W = (G.width - x * D) / 2 - t * D, f = (G.height - m * D) / 2 - o * D;
      i({
        x: W,
        y: f,
        zoom: D
      });
    },
    [s, n]
  ), c = z(
    (B) => {
      if (B.preventDefault(), !!s.current)
        if (B.ctrlKey || B.metaKey) {
          const e = s.current.getBoundingClientRect(), t = B.clientX - e.left, o = B.clientY - e.top, I = B.deltaY < 0 ? 1.08 : 0.92, a = Math.min(Math.max(g.zoom * I, n.min), n.max), G = t - (t - g.x) * (a / g.zoom), Y = o - (o - g.y) * (a / g.zoom);
          i({ x: G, y: Y, zoom: a });
        } else
          i((e) => ({
            ...e,
            x: e.x - B.deltaX,
            y: e.y - B.deltaY
          }));
    },
    [g, n, s]
  ), S = z(
    (B, e) => {
      d.current = !0, h.current = { x: B - g.x, y: e - g.y };
    },
    [g]
  ), u = z((B, e) => {
    d.current && i((t) => ({
      ...t,
      x: B - h.current.x,
      y: e - h.current.y
    }));
  }, []), l = z(() => {
    d.current = !1;
  }, []), y = z(() => {
    i({ x: 80, y: 80, zoom: 1 });
  }, []), w = z(() => {
    i((B) => ({
      ...B,
      zoom: Math.min(B.zoom * 1.2, n.max)
    }));
  }, [n]), E = z(() => {
    i((B) => ({
      ...B,
      zoom: Math.max(B.zoom / 1.2, n.min)
    }));
  }, [n]);
  return {
    transform: g,
    setTransform: i,
    screenToWorld: C,
    onWheel: c,
    startPan: S,
    updatePan: u,
    endPan: l,
    resetTransform: y,
    zoomIn: w,
    zoomOut: E,
    zoomToFit: r,
    isPanning: d
  };
}
function Ye(s) {
  const [n, g] = It(
    /* @__PURE__ */ new Map()
  );
  rt(/* @__PURE__ */ new Map());
  const i = rt(/* @__PURE__ */ new Map()), d = z((h, C) => {
    C ? i.current.set(h, C) : i.current.delete(h);
  }, []);
  return Pt(() => {
    const h = new ResizeObserver((C) => {
      let r = !1;
      const c = new Map(n);
      for (const S of C) {
        const u = S.target.getAttribute("data-sysflow-measure-id");
        if (!u) continue;
        const l = Math.ceil(S.contentRect.width), y = Math.ceil(S.contentRect.height), w = c.get(u);
        (!w || w.width !== l || w.height !== y) && (c.set(u, { width: l, height: y }), r = !0);
      }
      r && g(c);
    });
    return i.current.forEach((C) => h.observe(C)), () => {
      h.disconnect();
    };
  }, [s]), { measurements: n, registerMeasureElement: d };
}
function Ne(s, n, g, i, d) {
  const [h, C] = It(null), [r, c] = It(null), S = rt(null), u = rt(null), l = z(
    (e, t) => {
      let o = null, I = 1 / 0;
      for (const [a, G] of Object.entries(n.containers))
        if (a !== t && e.x >= G.x && e.x <= G.x + G.width && e.y >= G.y && e.y <= G.y + G.height) {
          const Y = G.width * G.height;
          Y < I && (I = Y, o = s.containers[a] || null);
        }
      if (o) return o;
      for (const [a, G] of Object.entries(n.nodes))
        if (a !== t && e.x >= G.x && e.x <= G.x + G.width && e.y >= G.y && e.y <= G.y + G.height)
          return s.nodes[a] || null;
      return null;
    },
    [n, s]
  ), y = z(
    (e, t) => {
      let o = null, I = 45;
      for (const a of Object.values(s.edges)) {
        if (a.sourceId === t || a.targetId === t) continue;
        const G = n.nodes[a.sourceId] || n.containers[a.sourceId], Y = n.nodes[a.targetId] || n.containers[a.targetId];
        if (!G || !Y) continue;
        const x = G.x + G.width, m = G.y + G.height / 2, H = Y.x, K = Y.y + Y.height / 2;
        for (let D = 0; D <= 10; D++) {
          const W = D / 10, f = (1 - W) * x + W * H, L = (1 - W) * m + W * K, P = Math.hypot(e.x - f, e.y - L);
          P < I && (I = P, o = a);
        }
      }
      return o;
    },
    [n, s]
  ), w = z(
    (e, t) => {
      if (t.stopPropagation(), g.canDrag && !g.canDrag(e, s))
        return;
      const o = i(t.clientX, t.clientY);
      C({
        draggedEntity: e,
        ghostPosition: o,
        startPosition: o
      });
    },
    [s, g, i]
  ), E = z(
    (e) => {
      if (!h) return;
      const t = i(e.clientX, e.clientY), o = l(t, h.draggedEntity.id), I = y(t, h.draggedEntity.id);
      S.current = o, u.current = I, o && s.containers[o.id] ? c(o.id) : c(null);
      const a = g.onDragMove ? g.onDragMove({
        draggedEntity: h.draggedEntity,
        cursorWorld: t,
        startWorldPos: h.startPosition,
        hoveredEntity: o,
        hoveredEdge: I,
        graph: s,
        layout: n
      }) : t;
      a && C((G) => G ? { ...G, ghostPosition: a } : null);
    },
    [h, i, g, s, n, l, y]
  ), B = z(
    (e) => {
      if (!h) return;
      const t = i(e.clientX, e.clientY), o = l(t, h.draggedEntity.id), I = y(t, h.draggedEntity.id), a = g.onDragEnd({
        draggedEntity: h.draggedEntity,
        cursorWorld: t,
        startWorldPos: h.startPosition,
        hoveredEntity: o,
        hoveredEdge: I,
        graph: s,
        layout: n
      });
      a && d(a), C(null), c(null), S.current = null, u.current = null;
    },
    [h, i, g, s, n, l, y, d]
  );
  return {
    dragState: h,
    hoveredContainerId: r,
    handlePointerDown: w,
    handlePointerMove: E,
    handlePointerUp: B
  };
}
function We(s, n) {
  const g = [], i = [], d = [], h = [], C = [], r = [], c = [], S = [];
  for (const [u, l] of Object.entries(n.nodes))
    s.nodes[u] ? s.nodes[u] !== l && i.push(l) : g.push(l);
  for (const u of Object.keys(s.nodes))
    n.nodes[u] || d.push(u);
  for (const [u, l] of Object.entries(n.containers))
    s.containers[u] ? s.containers[u] !== l && C.push(l) : h.push(l);
  for (const u of Object.keys(s.containers))
    n.containers[u] || r.push(u);
  for (const [u, l] of Object.entries(n.edges))
    s.edges[u] || c.push(l);
  for (const [u, l] of Object.entries(s.edges))
    n.edges[u] || S.push(l);
  return {
    createdNodes: g,
    updatedNodes: i,
    deletedNodes: d,
    createdContainers: h,
    updatedContainers: C,
    deletedContainers: r,
    createdEdges: c,
    deletedEdges: S
  };
}
function Me(s) {
  return s.createdNodes.length > 0 || s.updatedNodes.length > 0 || s.deletedNodes.length > 0 || s.deletedContainers && s.deletedContainers.length > 0 || s.createdEdges.length > 0 || s.deletedEdges.length > 0;
}
function _e(s, n) {
  const [g, i] = It({
    history: [s],
    index: 0
  }), [d, h] = It(null), C = rt(n);
  C.current = n;
  const r = g.history[g.index] ?? g.history[0] ?? s, c = z((o) => {
    var a;
    const I = zt(o);
    if ((a = C.current) != null && a.onMutate) {
      const G = We(r, I);
      Me(G) && C.current.onMutate(G);
    }
    i((G) => {
      const Y = G.history.slice(0, G.index + 1);
      return {
        history: [...Y, I],
        index: Y.length
      };
    });
  }, [r]), S = z((o) => {
    const I = zt(o);
    i({
      history: [I],
      index: 0
    });
  }, []), u = z(() => {
    i((o) => ({
      ...o,
      index: Math.max(0, o.index - 1)
    }));
  }, []), l = z(() => {
    i((o) => ({
      ...o,
      index: Math.min(o.history.length - 1, o.index + 1)
    }));
  }, []), y = z(
    (o) => {
      var x;
      if (!o || o.length === 0) return;
      let I = o;
      if ((x = C.current) != null && x.canDelete) {
        const m = C.current.canDelete(o);
        if (typeof m == "boolean") {
          if (!m) return;
        } else Array.isArray(m) && (I = m);
      }
      if (I.length === 0) return;
      const a = { ...r.nodes }, G = { ...r.containers }, Y = { ...r.edges };
      for (const m of I)
        delete a[m], delete G[m], delete Y[m];
      c({
        ...r,
        nodes: a,
        containers: G,
        edges: Y
      });
    },
    [r, c]
  ), w = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (o) => {
    const I = Math.random() * 16 | 0;
    return (o === "x" ? I : I & 3 | 8).toString(16);
  }), E = z(
    (o) => {
      var G, Y, x;
      const I = r, a = C.current;
      if (o.type === "ENTITY_REPARENT") {
        const { entityId: m, newParentId: H } = o.payload, K = {
          ...I,
          nodes: { ...I.nodes },
          containers: { ...I.containers }
        };
        K.nodes[m] ? K.nodes[m] = { ...K.nodes[m], parentId: H } : K.containers[m] && (K.containers[m] = { ...K.containers[m], parentId: H }), c(K);
      } else if (o.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: m, direction: H, suggestedNewNodeId: K, suggestedNewEdge1Id: D, suggestedNewEdge2Id: W } = o.payload, f = I.edges[m.id];
        if (!f) return;
        const L = I.nodes[f.sourceId];
        if (a != null && a.canConnect && (!a.canConnect(f.sourceId, K) || !a.canConnect(K, f.targetId)))
          return;
        const P = H === "BT", X = H === "TB", b = `p_in_${Date.now()}`, V = `p_out_${Date.now() + 1}`;
        let v = "left", T = "right";
        P ? (v = "bottom", T = "top") : X ? (v = "top", T = "bottom") : H === "RL" && (v = "right", T = "left");
        const Q = (G = a == null ? void 0 : a.createNodeEntity) == null ? void 0 : G.call(a, {
          edge: f,
          direction: H,
          suggestedType: (L == null ? void 0 : L.type) || "FlowTask"
        }), q = {
          id: (Q == null ? void 0 : Q.id) || K,
          label: (Q == null ? void 0 : Q.label) || `Node ${Object.keys(I.nodes).length + 1}`,
          type: (Q == null ? void 0 : Q.type) || (L == null ? void 0 : L.type) || "FlowTask",
          parentId: (Q == null ? void 0 : Q.parentId) ?? (L == null ? void 0 : L.parentId) ?? null,
          ports: (Q == null ? void 0 : Q.ports) || [
            { id: b, label: "in", side: v },
            { id: V, label: "out", side: T }
          ],
          data: (Q == null ? void 0 : Q.data) || {},
          ...Q
        }, at = q.ports.find((tt) => tt.label.toLowerCase().includes("in")) || q.ports.find((tt) => tt.side === (P ? "bottom" : "top")) || q.ports[0], ct = q.ports.find((tt) => tt.label.toLowerCase().includes("out")) || q.ports.find((tt) => tt.side === (P ? "top" : "bottom")) || q.ports[q.ports.length - 1], Ct = at ? at.id : b, F = ct ? ct.id : V, gt = {
          id: D,
          sourceId: f.sourceId,
          sourcePortId: f.sourcePortId,
          targetId: q.id,
          targetPortId: Ct
        }, bt = {
          id: W,
          sourceId: q.id,
          sourcePortId: F,
          targetId: f.targetId,
          targetPortId: f.targetPortId
        }, R = { ...I.edges };
        delete R[f.id], R[D] = gt, R[W] = bt, c({
          ...I,
          nodes: { ...I.nodes, [q.id]: q },
          edges: R
        });
      } else if (o.type === "NODE_EXTRACT") {
        const { incomingEdgeId: m, outgoingEdgeId: H } = o.payload, K = I.edges[m], D = I.edges[H];
        if (!K || !D || a != null && a.canConnect && !a.canConnect(K.sourceId, D.targetId))
          return;
        const W = { ...I.edges };
        delete W[m], delete W[H];
        const f = w();
        W[f] = {
          id: f,
          sourceId: K.sourceId,
          sourcePortId: K.sourcePortId,
          targetId: D.targetId,
          targetPortId: D.targetPortId
        }, c({
          ...I,
          edges: W
        });
      } else if (o.type === "NODE_ADD_CONNECTED") {
        const {
          sourceNode: m,
          position: H,
          portId: K,
          direction: D,
          suggestedNewNodeId: W,
          suggestedNewEdgeId: f
        } = o.payload, L = D === "BT", P = D === "TB", X = D === "RL", b = L ? "bottom" : P ? "top" : X ? "right" : "left", V = L ? "top" : P ? "bottom" : X ? "left" : "right", v = `p_in_${Date.now()}`, T = `p_out_${Date.now() + 1}`, Q = K ? m.ports.find((nt) => nt.id === K) : void 0, q = ((Y = Q == null ? void 0 : Q.label) == null ? void 0 : Y.toLowerCase()) || "", at = q === "in" || q.startsWith("in_") || q.endsWith("_in"), ct = q === "out" || q.startsWith("out_") || q.endsWith("_out"), F = at ? !0 : ct ? !1 : L && H === "bottom" || P && H === "top" || !L && !P && !X && H === "left" || X && H === "right", gt = F ? W : m.id, bt = F ? m.id : W;
        if (a != null && a.canConnect && !a.canConnect(gt, bt))
          return;
        const R = (x = a == null ? void 0 : a.createNodeEntity) == null ? void 0 : x.call(a, {
          sourceNode: m,
          position: H,
          direction: D,
          suggestedType: m.type
        }), tt = {
          id: (R == null ? void 0 : R.id) || W,
          label: (R == null ? void 0 : R.label) || `Node ${Object.keys(I.nodes).length + 1}`,
          type: (R == null ? void 0 : R.type) || m.type,
          ports: (R == null ? void 0 : R.ports) || [
            { id: v, label: "in", side: b },
            { id: T, label: "out", side: V }
          ],
          data: (R == null ? void 0 : R.data) || {},
          parentId: (R == null ? void 0 : R.parentId) ?? (m == null ? void 0 : m.parentId) ?? null,
          ...R
        }, Lt = tt.ports.find((nt) => nt.label.toLowerCase().includes("in")) || tt.ports.find((nt) => nt.side === b) || tt.ports[0], Zt = tt.ports.find((nt) => nt.label.toLowerCase().includes("out")) || tt.ports.find((nt) => nt.side === V) || tt.ports[tt.ports.length - 1], $ = Lt ? Lt.id : v, wt = Zt ? Zt.id : T, U = Q || m.ports.find((nt) => nt.label.toLowerCase() === "in") || m.ports[0], At = Q || m.ports.find((nt) => nt.label.toLowerCase() === "out") || m.ports[m.ports.length - 1], mt = F ? {
          id: f,
          sourceId: tt.id,
          sourcePortId: wt,
          targetId: m.id,
          targetPortId: (U == null ? void 0 : U.id) || "in"
        } : {
          id: f,
          sourceId: m.id,
          sourcePortId: (At == null ? void 0 : At.id) || "out",
          targetId: tt.id,
          targetPortId: $
        };
        c({
          ...I,
          nodes: { ...I.nodes, [tt.id]: tt },
          edges: { ...I.edges, [f]: mt }
        });
      } else if (o.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: m, collapsed: H } = o.payload;
        I.containers[m] && c({
          ...I,
          containers: {
            ...I.containers,
            [m]: { ...I.containers[m], collapsed: H }
          }
        });
      } else if (o.type === "NODE_UPDATE") {
        const { id: m, updates: H } = o.payload;
        I.nodes[m] && c({
          ...I,
          nodes: {
            ...I.nodes,
            [m]: { ...I.nodes[m], ...H }
          }
        });
      } else if (o.type === "EDGE_CREATE") {
        const m = o.payload.edge, H = m.sourceId, K = m.targetId, D = m.sourcePortId, W = m.targetPortId;
        if (a != null && a.canConnect && !a.canConnect(H, K, D, W))
          return;
        const f = o.payload.id || m.id || w();
        c({
          ...I,
          edges: {
            ...I.edges,
            [f]: { id: f, ...m }
          }
        });
      } else if (o.type === "EDGE_DELETE") {
        const m = o.payload.edgeId || o.payload.id, H = { ...I.edges };
        delete H[m], c({ ...I, edges: H });
      } else if (o.type === "EDGE_REWIRE") {
        const { edgeId: m, newTargetId: H, newTargetPortId: K } = o.payload;
        if (!H || !I.edges[m]) return;
        const D = H, W = I.edges[m], f = W.sourceId, L = W.targetId;
        if (D === f || D === L) return;
        const P = Object.values(I.edges).find((F) => F.targetId === D), X = Object.values(I.edges).find((F) => F.sourceId === D), b = P && X && P.sourceId !== X.targetId;
        if (a != null && a.canConnect && (b && !a.canConnect(P.sourceId, X.targetId) || !a.canConnect(f, D) || !a.canConnect(D, L)))
          return;
        const V = { ...I.edges };
        if (b) {
          delete V[P.id], delete V[X.id];
          const F = w();
          V[F] = {
            id: F,
            sourceId: P.sourceId,
            sourcePortId: P.sourcePortId,
            targetId: X.targetId,
            targetPortId: X.targetPortId
          };
        } else
          P && delete V[P.id], X && delete V[X.id];
        const v = I.nodes[D], T = K && (v == null ? void 0 : v.ports.find((F) => F.id === K)) || (v == null ? void 0 : v.ports.find((F) => {
          var gt;
          return (gt = F.label) == null ? void 0 : gt.toLowerCase().includes("in");
        })) || (v == null ? void 0 : v.ports.find((F) => F.side === "bottom")) || (v == null ? void 0 : v.ports[0]), Q = (v == null ? void 0 : v.ports.find((F) => {
          var gt;
          return F.id !== (T == null ? void 0 : T.id) && ((gt = F.label) == null ? void 0 : gt.toLowerCase().includes("out"));
        })) || (v == null ? void 0 : v.ports.find((F) => F.id !== (T == null ? void 0 : T.id) && F.side === "top")) || (v == null ? void 0 : v.ports.find((F) => F.id !== (T == null ? void 0 : T.id))) || T, q = (T == null ? void 0 : T.id) || "p_in", at = (Q == null ? void 0 : Q.id) || "p_out";
        delete V[m];
        const ct = w();
        V[ct] = {
          id: ct,
          sourceId: f,
          sourcePortId: W.sourcePortId,
          targetId: D,
          targetPortId: q
        };
        const Ct = w();
        V[Ct] = {
          id: Ct,
          sourceId: D,
          sourcePortId: at,
          targetId: L,
          targetPortId: W.targetPortId
        }, c({ ...I, edges: V });
      } else {
        const m = o;
        if (m.type === "NODE_DELETE" || m.type === "DELETE_SELECTION" || m.type === "SELECTION_DELETE") {
          const H = m.payload || {}, K = [];
          H.nodeId && K.push(H.nodeId), H.id && K.push(H.id), Array.isArray(H.selectedIds) && K.push(...H.selectedIds), Array.isArray(H.ids) && K.push(...H.ids), y(K);
        }
      }
    },
    [r, c, y]
  ), B = z(
    (o) => {
      const I = r.nodes[o] || r.containers[o];
      I && h({ entity: JSON.parse(JSON.stringify(I)), isCut: !1 });
    },
    [r]
  ), e = z(
    (o) => {
      const I = r.nodes[o] || r.containers[o];
      if (I) {
        h({ entity: JSON.parse(JSON.stringify(I)), isCut: !0 });
        const a = { ...r.nodes }, G = { ...r.containers };
        delete a[o], delete G[o], c({ ...r, nodes: a, containers: G });
      }
    },
    [r, c]
  ), t = z(() => {
    if (!d) return;
    const o = d.entity, I = `${o.id}_copy_${Date.now().toString().slice(-4)}`, a = { ...o, id: I, label: `${o.label} (Copy)` };
    "collapsed" in a ? c({
      ...r,
      containers: { ...r.containers, [I]: a }
    }) : c({
      ...r,
      nodes: { ...r.nodes, [I]: a }
    });
  }, [d, r, c]);
  return {
    graph: r,
    setGraphDirect: S,
    applyAction: E,
    undo: u,
    redo: l,
    copyEntity: B,
    cutEntity: e,
    pasteEntity: t,
    deleteSelection: y,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Re = ({
  graph: s,
  registerMeasureElement: n,
  nodeTypes: g,
  containerTypes: i
}) => {
  const d = Object.values(s.nodes), h = Object.values(s.containers);
  return /* @__PURE__ */ _("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    d.map((C) => {
      const r = C.type ? g == null ? void 0 : g[C.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (c) => n(C.id, c),
          "data-sysflow-measure-id": C.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: r ? /* @__PURE__ */ N(r, { node: C, selected: !1 }) : /* @__PURE__ */ _("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ N("div", { style: { fontWeight: 600 }, children: C.label }),
            C.ports.length > 0 && /* @__PURE__ */ _("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              C.ports.map((c) => c.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${C.id}`
      );
    }),
    h.map((C) => {
      const r = C.type ? i == null ? void 0 : i[C.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (c) => n(C.id, c),
          "data-sysflow-measure-id": C.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: r ? /* @__PURE__ */ N(r, { container: C, selected: !1 }) : /* @__PURE__ */ N("div", { className: "sysflow-container-header", children: C.label })
        },
        `measure-container-${C.id}`
      );
    })
  ] });
}, Te = ({
  graph: s,
  layout: n,
  selectedIds: g,
  direction: i = "TB",
  showArrows: d = !0,
  routing: h = "auto",
  portOptions: C,
  enableEdgeQuickAdd: r = !0,
  onEdgeClick: c,
  onInsertNodeOnEdge: S
}) => {
  const [u, l] = It(null), y = h === "step" || h === "auto" && (i === "LR" || i === "RL"), w = (e, t, o) => {
    var f, L, P, X;
    let I = e, a = null;
    for ((f = s.containers[e]) != null && f.collapsed && (a = s.containers[e]); I; ) {
      const b = ((L = s.nodes[I]) == null ? void 0 : L.parentId) ?? ((P = s.containers[I]) == null ? void 0 : P.parentId) ?? null;
      b && ((X = s.containers[b]) != null && X.collapsed) && (a = s.containers[b]), I = b;
    }
    if (a) {
      const b = n.containers[a.id];
      if (!b)
        return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: a.id };
      let V, v, T;
      return i === "TB" ? (V = o ? "bottom" : "top", v = b.x + b.width / 2, T = o ? b.y + b.height : b.y) : i === "BT" ? (V = o ? "top" : "bottom", v = b.x + b.width / 2, T = o ? b.y : b.y + b.height) : i === "RL" ? (V = o ? "left" : "right", v = o ? b.x : b.x + b.width, T = b.y + b.height / 2) : (V = o ? "right" : "left", v = o ? b.x + b.width : b.x, T = b.y + b.height / 2), { x: v, y: T, side: V, valid: !0, entityId: a.id };
    }
    if (!!s.containers[e]) {
      const b = n.containers[e];
      if (!b) return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: e };
      let V, v, T;
      return i === "TB" ? (V = b.x + b.width / 2, v = o ? b.y + b.height : b.y, T = o ? "bottom" : "top") : i === "BT" ? (V = b.x + b.width / 2, v = o ? b.y : b.y + b.height, T = o ? "top" : "bottom") : i === "RL" ? (V = o ? b.x : b.x + b.width, v = b.y + b.height / 2, T = o ? "left" : "right") : (V = o ? b.x + b.width : b.x, v = b.y + b.height / 2, T = o ? "right" : "left"), { x: V, y: v, side: T, valid: !0, entityId: e };
    }
    const Y = s.nodes[e], x = n.nodes[e];
    if (!Y || !x)
      return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: e };
    const H = Kt(
      Y,
      x,
      i,
      s.edges,
      C
    ).get(t);
    if (H)
      return { x: H.worldX, y: H.worldY, side: H.side, valid: !0, entityId: e };
    let K, D, W;
    return i === "TB" ? (K = x.x + x.width / 2, D = o ? x.y + x.height : x.y, W = o ? "bottom" : "top") : i === "BT" ? (K = x.x + x.width / 2, D = o ? x.y : x.y + x.height, W = o ? "top" : "bottom") : i === "RL" ? (K = o ? x.x : x.x + x.width, D = x.y + x.height / 2, W = o ? "left" : "right") : (K = o ? x.x + x.width : x.x, D = x.y + x.height / 2, W = o ? "right" : "left"), { x: K, y: D, side: W, valid: !0, entityId: e };
  }, E = (e, t) => {
    const o = (e.x + t.x) / 2, I = (e.y + t.y) / 2;
    if (e.side === "right" && t.side === "left") {
      if (t.x >= e.x + 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${o} ${e.y} L ${o} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: I }
        };
      {
        const a = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x + 20} ${e.y} L ${e.x + 20} ${a} L ${t.x - 20} ${a} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: a }
        };
      }
    }
    if (e.side === "left" && t.side === "right") {
      if (t.x <= e.x - 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${o} ${e.y} L ${o} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: I }
        };
      {
        const a = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x - 20} ${e.y} L ${e.x - 20} ${a} L ${t.x + 20} ${a} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: o, y: a }
        };
      }
    }
    if (e.side === "bottom" && t.side === "top") {
      if (t.y >= e.y + 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${I} L ${t.x} ${I} L ${t.x} ${t.y}`,
          center: { x: o, y: I }
        };
      {
        const a = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y + 20} L ${a} ${e.y + 20} L ${a} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: a, y: I }
        };
      }
    }
    if (e.side === "top" && t.side === "bottom") {
      if (t.y <= e.y - 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${I} L ${t.x} ${I} L ${t.x} ${t.y}`,
          center: { x: o, y: I }
        };
      {
        const a = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y - 20} L ${a} ${e.y - 20} L ${a} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: a, y: I }
        };
      }
    }
    return {
      pathStr: `M ${e.x} ${e.y} L ${o} ${e.y} L ${o} ${t.y} L ${t.x} ${t.y}`,
      center: { x: o, y: I }
    };
  }, B = (e, t) => {
    const o = t.x - e.x, I = t.y - e.y;
    let a = e.x, G = e.y, Y = t.x, x = t.y;
    if (e.side === "bottom" && t.side === "top")
      if (I > 0) {
        const K = Math.min(28, I * 0.4);
        G = e.y + Math.max(K, I * 0.5), x = t.y - Math.max(K, I * 0.5);
      } else {
        const K = o >= 0 ? 1 : -1, D = Math.max(40, Math.abs(o) * 0.2);
        a = e.x + D * K, G = e.y + 40, Y = t.x + D * K, x = t.y - 40;
      }
    else if (e.side === "top" && t.side === "bottom")
      if (I < 0) {
        const K = Math.min(28, Math.abs(I) * 0.4);
        G = e.y - Math.max(K, Math.abs(I) * 0.5), x = t.y + Math.max(K, Math.abs(I) * 0.5);
      } else {
        const K = o >= 0 ? 1 : -1, D = Math.max(40, Math.abs(o) * 0.2);
        a = e.x + D * K, G = e.y - 40, Y = t.x + D * K, x = t.y + 40;
      }
    else if (e.side === "right" && t.side === "left")
      o > 0 ? (a = e.x + o * 0.5, Y = t.x - o * 0.5) : (a = e.x + 50, G = e.y - 50, Y = t.x - 50, x = t.y - 50);
    else if (e.side === "left" && t.side === "right")
      o < 0 ? (a = e.x + o * 0.5, Y = t.x - o * 0.5) : (a = e.x - 50, G = e.y - 50, Y = t.x + 50, x = t.y - 50);
    else {
      const K = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, D = K[e.side] || { x: 0, y: 1 }, W = K[t.side] || { x: 0, y: -1 }, f = Math.min(60, Math.hypot(o, I) * 0.35);
      a = e.x + D.x * f, G = e.y + D.y * f, Y = t.x + W.x * f, x = t.y + W.y * f;
    }
    const m = 0.125 * e.x + 0.375 * a + 0.375 * Y + 0.125 * t.x, H = 0.125 * e.y + 0.375 * G + 0.375 * x + 0.125 * t.y;
    return {
      pathStr: `M ${e.x} ${e.y} C ${a} ${G} ${Y} ${x} ${t.x} ${t.y}`,
      center: { x: m, y: H }
    };
  };
  return /* @__PURE__ */ _("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ _("defs", { children: [
      /* @__PURE__ */ N(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ N("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ N(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ N("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(s.edges).map((e) => {
      const t = w(e.sourceId, e.sourcePortId, !0), o = w(e.targetId, e.targetPortId, !1);
      if (!t.valid || !o.valid || t.entityId === o.entityId) return null;
      const I = g.includes(e.id), a = u === e.id, { pathStr: G, center: Y } = y ? E(t, o) : B(t, o);
      return /* @__PURE__ */ _(
        "g",
        {
          onMouseEnter: () => l(e.id),
          onMouseLeave: () => l(null),
          children: [
            /* @__PURE__ */ N(
              "path",
              {
                d: G,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (x) => {
                  x.stopPropagation(), c == null || c(e.id);
                }
              }
            ),
            /* @__PURE__ */ N(
              "path",
              {
                d: G,
                fill: "none",
                stroke: I ? "var(--sysflow-edge-selected)" : a ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: I ? 2.5 : a ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: d ? I ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            r && a && S && /* @__PURE__ */ N("g", { transform: `translate(${Y.x}, ${Y.y})`, children: /* @__PURE__ */ _(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (x) => {
                  x.preventDefault(), x.stopPropagation(), S(e);
                },
                children: [
                  /* @__PURE__ */ N("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ N(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ N(
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
  edges: i,
  portOptions: d,
  enableQuickAdd: h = !1,
  onAddConnectedNode: C
}) => {
  const [r, c] = It(null);
  if (!s.ports || s.ports.length === 0)
    return null;
  const S = Kt(
    s,
    n,
    g,
    i,
    d
  );
  return /* @__PURE__ */ N(Mt, { children: s.ports.map((u) => {
    const l = S.get(u.id);
    if (!l) return null;
    const y = r === u.id;
    return /* @__PURE__ */ _(
      "div",
      {
        className: "sysflow-port-hit-area",
        style: {
          left: `${l.localX}px`,
          top: `${l.localY}px`
        },
        title: `${u.label} (${l.side})`,
        onMouseEnter: () => c(u.id),
        onMouseLeave: () => c((w) => w === u.id ? null : w),
        children: [
          /* @__PURE__ */ N("div", { className: `sysflow-port-anchor sysflow-port-${l.side}` }),
          h && y && C && /* @__PURE__ */ N(
            "button",
            {
              type: "button",
              className: "sysflow-port-quick-add-btn",
              title: `Add connected node on "${u.label}"`,
              onPointerDown: (w) => w.stopPropagation(),
              onPointerUp: (w) => w.stopPropagation(),
              onClick: (w) => {
                w.preventDefault(), w.stopPropagation(), C(s, u.id, l.side);
              },
              children: "+"
            }
          )
        ]
      },
      u.id
    );
  }) });
}, Ve = ({
  node: s,
  layout: n,
  selected: g = !1,
  isDrawingEdge: i = !1,
  isDrawingSource: d = !1,
  direction: h = "LR",
  edges: C,
  portOptions: r,
  enableQuickAdd: c = !1,
  onAddConnectedNode: S,
  onPointerDown: u,
  onMouseEnter: l,
  onMouseLeave: y,
  onClick: w,
  customRenderer: E
}) => /* @__PURE__ */ _(
  "div",
  {
    className: `sysflow-node ${g ? "sysflow-selected" : ""} ${d ? "sysflow-drawing-source" : ""} ${s.className || ""}`,
    style: {
      transform: `translate(${n.x}px, ${n.y}px)`,
      width: `${n.width}px`,
      height: `${n.height}px`
    },
    onPointerDown: (B) => {
      if (i) {
        B.stopPropagation();
        return;
      }
      u == null || u(s, B);
    },
    onMouseEnter: () => l == null ? void 0 : l(s.id),
    onMouseLeave: () => y == null ? void 0 : y(s.id),
    onClick: w,
    children: [
      /* @__PURE__ */ N(
        Xe,
        {
          entity: s,
          layout: n,
          direction: h,
          edges: C,
          portOptions: r,
          enableQuickAdd: c && !i,
          onAddConnectedNode: S
        }
      ),
      E ? /* @__PURE__ */ N(E, { node: s, selected: g }) : /* @__PURE__ */ _("div", { style: { padding: "10px 14px" }, children: [
        /* @__PURE__ */ N("div", { style: { fontWeight: 600, fontSize: "13px" }, children: s.label }),
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
  isHovered: i = !1,
  hasChildren: d = !1,
  onToggleCollapse: h,
  onPointerDown: C,
  onMouseEnter: r,
  onMouseLeave: c,
  onClick: S,
  customRenderer: u
}) => /* @__PURE__ */ N(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${i ? "sysflow-hovered" : ""} ${s.className || ""}`,
    style: {
      transform: `translate(${n.x}px, ${n.y}px)`,
      width: `${n.width}px`,
      height: `${n.height}px`
    },
    onPointerDown: (l) => C(s, l),
    onMouseEnter: r,
    onMouseLeave: c,
    onClick: S,
    children: u ? /* @__PURE__ */ N(
      u,
      {
        container: s,
        selected: g,
        hasChildren: d,
        onToggleCollapse: h
      }
    ) : /* @__PURE__ */ _(Mt, { children: [
      /* @__PURE__ */ _("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ N("span", { className: "sysflow-container-title", title: s.label, children: s.label }),
        /* @__PURE__ */ N(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (l) => l.stopPropagation(),
            onPointerUp: (l) => l.stopPropagation(),
            onClick: (l) => {
              l.stopPropagation(), h(s.id, !s.collapsed);
            },
            children: s.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !s.collapsed && !d && /* @__PURE__ */ N("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
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
function ze(s) {
  if (!s) return {};
  const n = {};
  for (const [g, i] of Object.entries(s))
    if (i !== void 0) {
      const d = Qe[g] || `--sysflow-${g.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      n[d] = i;
    }
  return n;
}
const Fe = new Pe(), qe = ({
  graph: s,
  onChange: n,
  history: g,
  enableShortcuts: i = !0,
  onNodeClick: d,
  layoutEngine: h,
  interactionStrategy: C = Fe,
  direction: r = "TB",
  layoutOptions: c,
  portPlacementMode: S,
  routing: u,
  showEdgeArrows: l = !0,
  nodeTypes: y,
  containerTypes: w,
  zoomBounds: E,
  className: B = "",
  selectedIds: e = [],
  theme: t = "dark",
  themeTokens: o,
  style: I,
  enableQuickAdd: a,
  enableEdgeQuickAdd: G,
  isDrawingEdge: Y,
  onDrawingEdgeChange: x,
  onNodeCreate: m,
  onEdgeCreate: H,
  onNodeDelete: K,
  onContainerDelete: D,
  onEdgeDelete: W
}) => {
  var Vt, Ot, Qt;
  const f = rt(null), L = rt(null);
  !h && !L.current && (L.current = new De());
  const P = h || L.current, {
    transform: X,
    screenToWorld: b,
    onWheel: V,
    startPan: v,
    updatePan: T,
    endPan: Q,
    resetTransform: q,
    zoomIn: at,
    zoomOut: ct,
    zoomToFit: Ct,
    isPanning: F
  } = ve(f, E), { measurements: gt, registerMeasureElement: bt } = Ye(s), [R, tt] = It({ nodes: {}, containers: {} }), [Lt, Zt] = It(!1), $ = Y ?? Lt, wt = z(
    (A) => {
      Y === void 0 && Zt(A), x == null || x(A);
    },
    [Y, x]
  ), [U, At] = It(null), [mt, nt] = It(null), [J, lt] = It(null);
  Pt(() => {
    $ || (At(null), nt(null), lt(null));
  }, [$]);
  const ht = Nt(
    () => ({
      direction: r,
      mode: S ?? (r === "TB" || r === "BT" ? "strict-flow" : "perimeter-optimized"),
      nodeLayouts: R.nodes
    }),
    [r, S, R.nodes]
  ), Tt = (c == null ? void 0 : c.mode) === "flow" || S === "strict-flow", [ot, Et] = It(null), Ht = rt(null), vt = rt(!1), {
    dragState: ut,
    hoveredContainerId: oe,
    handlePointerDown: Xt,
    handlePointerMove: se,
    handlePointerUp: ge
  } = Ne(s, R, C, b, n), Gt = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (A) => {
    const Z = Math.random() * 16 | 0;
    return (A === "x" ? Z : Z & 3 | 8).toString(16);
  }), kt = z(
    (A, Z) => {
      if (!A.ports || A.ports.length === 0) return [];
      if (!Tt)
        return A.ports;
      const M = Z === "source" ? r === "BT" ? "top" : r === "TB" ? "bottom" : r === "LR" ? "right" : "left" : r === "BT" ? "bottom" : r === "TB" ? "top" : r === "LR" ? "left" : "right", j = R.nodes[A.id], et = j ? Kt(
        A,
        j,
        r,
        s.edges,
        ht
      ) : null;
      return A.ports.filter((st) => {
        var dt;
        return (((dt = et == null ? void 0 : et.get(st.id)) == null ? void 0 : dt.side) ?? st.side) === M;
      });
    },
    [Tt, r, R.nodes, s.edges, ht]
  ), Yt = z(
    (A, Z, p, k, M) => {
      if (A === p) return;
      const j = `${A}:${Z}->${p}:${k}`;
      M != null && M.has(j) || Object.values(s.edges).some(
        (st) => st.sourceId === A && st.sourcePortId === Z && st.targetId === p && st.targetPortId === k
      ) || (M == null || M.add(j), n({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: A,
            sourcePortId: Z,
            targetId: p,
            targetPortId: k
          }
        }
      }));
    },
    [s.edges, n]
  ), ft = z(() => {
    At(null), nt(null), lt(null), wt(!1);
  }, [wt]), pt = z(
    (A, Z, p = /* @__PURE__ */ new Set()) => {
      for (let k = 0; k < Z.length; k++) {
        const M = Z[k];
        if (M === A.nodeId) continue;
        const j = s.nodes[M];
        if (!j) continue;
        const et = kt(j, "destination");
        if (et.length !== 0)
          if (et.length === 1)
            Yt(
              A.nodeId,
              A.portId,
              j.id,
              et[0].id,
              p
            );
          else {
            lt({
              role: "destination",
              node: j,
              candidatePorts: et,
              source: A,
              remainingDestNodeIds: Z.slice(k + 1)
            });
            return;
          }
      }
      ft();
    },
    [s.nodes, kt, Yt, ft]
  ), St = Nt(() => {
    if (!U) return null;
    const A = s.nodes[U.nodeId], Z = R.nodes[U.nodeId];
    if (!A || !Z) return null;
    const k = Kt(
      A,
      Z,
      r,
      s.edges,
      ht
    ).get(U.portId);
    return k ? { x: k.worldX, y: k.worldY } : {
      x: Z.x + Z.width / 2,
      y: Z.y + Z.height / 2
    };
  }, [U, s.nodes, s.edges, R.nodes, r, ht]), Ie = z(
    (A, Z, p) => {
      if (!J) {
        if (!U) {
          const k = kt(A, "source");
          if (k.length === 0) return;
          k.length === 1 ? (At({ nodeId: A.id, portId: k[0].id }), nt(b(Z, p))) : lt({
            role: "source",
            node: A,
            candidatePorts: k
          });
          return;
        }
        A.id !== U.nodeId && pt(U, [A.id]);
      }
    },
    [
      J,
      U,
      kt,
      b,
      pt
    ]
  ), ie = (A) => {
    if (J) {
      if (J.role === "source") {
        const Z = {
          nodeId: J.node.id,
          portId: A.id
        }, p = R.nodes[J.node.id];
        if (p) {
          const M = Kt(
            J.node,
            p,
            r,
            s.edges,
            ht
          ).get(A.id);
          M && nt({ x: M.worldX, y: M.worldY });
        }
        At(Z), lt(null);
      } else if (J.role === "destination" && J.source) {
        const Z = J.source, p = J.remainingDestNodeIds || [];
        Yt(Z.nodeId, Z.portId, J.node.id, A.id), lt(null), p.length > 0 ? pt(Z, p) : ft();
      }
    }
  };
  Pt(() => {
    const A = (p) => {
      var et, st, it, dt;
      if (p.target instanceof HTMLInputElement || p.target instanceof HTMLTextAreaElement || p.target instanceof HTMLSelectElement || p.target instanceof HTMLElement && p.target.isContentEditable)
        return;
      const k = p.ctrlKey || p.metaKey, M = p.key.toLowerCase();
      if (p.key === "Escape") {
        p.preventDefault(), Et(null), Ht.current = null, ($ || J || U) && ft(), n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (i !== !1 && !k && !p.altKey && M === "e") {
        p.preventDefault(), $ ? ft() : wt(!0);
        return;
      }
      if (p.key === "Delete" || p.key === "Backspace") {
        if ($) return;
        if (p.preventDefault(), e.length > 0) {
          if (K || W || D)
            for (const O of e)
              s.nodes[O] ? K == null || K(O) : s.containers[O] ? (et = D || K) == null || et(O) : s.edges[O] && (W == null || W(O));
          g != null && g.deleteSelection && g.deleteSelection(e), n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        }
        return;
      }
      if (i !== !1 && g) {
        if (k && M === "z") {
          p.preventDefault(), p.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (k && M === "y") {
          p.preventDefault(), g.redo();
          return;
        }
        if (k && M === "c" && e[0]) {
          p.preventDefault(), (st = g.copyEntity) == null || st.call(g, e[0]);
          return;
        }
        if (k && M === "x" && e[0]) {
          p.preventDefault(), (it = g.cutEntity) == null || it.call(g, e[0]);
          return;
        }
        if (k && M === "v") {
          p.preventDefault(), (dt = g.pasteEntity) == null || dt.call(g);
          return;
        }
      }
      if (p.code === "Space" && (vt.current = !0), M === "f" && !k) {
        p.preventDefault(), Ct(R);
        return;
      }
      if (k && M === "a" && !$) {
        p.preventDefault();
        const O = [
          ...Object.keys(s.nodes),
          ...Object.keys(s.containers)
        ];
        n({ type: "SELECTION_CHANGE", payload: { selectedIds: O } });
        return;
      }
      const j = Object.keys(s.nodes);
      if (!(j.length === 0 || $) && p.key === "Tab") {
        p.preventDefault();
        const O = e.length > 0 ? j.indexOf(e[0]) : -1;
        let Bt;
        p.shiftKey ? Bt = O <= 0 ? j.length - 1 : O - 1 : Bt = (O + 1) % j.length, n({ type: "SELECTION_CHANGE", payload: { selectedIds: [j[Bt]] } });
      }
    }, Z = (p) => {
      p.code === "Space" && (vt.current = !1);
    };
    return window.addEventListener("keydown", A), window.addEventListener("keyup", Z), () => {
      window.removeEventListener("keydown", A), window.removeEventListener("keyup", Z);
    };
  }, [
    s,
    R,
    e,
    Ct,
    n,
    g,
    i,
    K,
    D,
    W,
    $,
    J,
    U,
    wt,
    ft
  ]);
  const de = z(
    (A, Z, p) => {
      var Bt;
      const k = Gt(), M = Gt(), j = A.ports.find((ye) => ye.id === Z), et = ((Bt = j == null ? void 0 : j.label) == null ? void 0 : Bt.toLowerCase()) || "", st = et === "in" || et.startsWith("in_") || et.endsWith("_in"), it = et === "out" || et.startsWith("out_") || et.endsWith("_out"), O = st ? !0 : it ? !1 : r === "BT" && p === "bottom" || r === "TB" && p === "top" || r === "LR" && p === "left" || r === "RL" && p === "right";
      m && H ? (m({
        id: k,
        type: A.type || "FlowTask",
        label: `New ${A.type || "Task"}`,
        parentId: A.parentId ?? null
      }), O ? H(k, A.id, M) : H(A.id, k, M)) : n({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: A,
          position: p,
          portId: Z,
          direction: r,
          suggestedNewNodeId: k,
          suggestedNewEdgeId: M
        }
      }), n({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [k] }
      });
    },
    [r, n, m, H]
  ), re = z(
    (A) => {
      const Z = Gt(), p = Gt(), k = Gt(), M = s.nodes[A.sourceId], j = (M == null ? void 0 : M.type) || "FlowTask";
      m && H && W ? (W(A.id), m({
        id: Z,
        type: j,
        label: `New ${j}`,
        parentId: (M == null ? void 0 : M.parentId) ?? null
      }), H(A.sourceId, Z, p), H(Z, A.targetId, k)) : n({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: A,
          direction: r,
          suggestedNewNodeId: Z,
          suggestedNewEdge1Id: p,
          suggestedNewEdge2Id: k
        }
      }), n({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [Z] }
      });
    },
    [r, s.nodes, n, m, H, W]
  );
  Pt(() => {
    let A = !1, Z = 16 / 9;
    if (f.current) {
      const k = f.current.getBoundingClientRect();
      k.width > 0 && k.height > 0 && (Z = k.width / k.height);
    }
    const p = {
      direction: r,
      aspectRatio: Z,
      ...c
    };
    return P.execute(s, gt, p).then((k) => {
      A || tt(k);
    }), () => {
      A = !0;
    };
  }, [s, gt, P, r, c]);
  const ce = (A) => {
    if (A.button === 1 || vt.current) {
      v(A.clientX, A.clientY);
      return;
    }
    const Z = A.target, p = Z === f.current || Z.classList.contains("sysflow-viewport") || Z.classList.contains("sysflow-dom-layer") || Z.tagName.toLowerCase() === "svg";
    if (A.button === 0 && p) {
      A.currentTarget.setPointerCapture(A.pointerId);
      const k = b(A.clientX, A.clientY);
      Ht.current = { x: A.clientX, y: A.clientY }, Et({
        startX: k.x,
        startY: k.y,
        currentX: k.x,
        currentY: k.y
      }), $ || n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, le = (A) => {
    if ($ && U && nt(b(A.clientX, A.clientY)), F.current)
      T(A.clientX, A.clientY);
    else if (ot) {
      const Z = b(A.clientX, A.clientY);
      Et(
        (p) => p ? { ...p, currentX: Z.x, currentY: Z.y } : null
      );
    } else !$ && ut && se(A);
  }, ae = (A) => {
    if (A.currentTarget.hasPointerCapture(A.pointerId) && A.currentTarget.releasePointerCapture(A.pointerId), F.current && Q(), ot) {
      const Z = Math.min(ot.startX, ot.currentX), p = Math.min(ot.startY, ot.currentY), k = Math.max(ot.startX, ot.currentX), M = Math.max(ot.startY, ot.currentY), j = Ht.current, st = (j ? Math.hypot(A.clientX - j.x, A.clientY - j.y) : 0) > 5 || k - Z > 4 || M - p > 4;
      if ($) {
        if (!st)
          ft(), n({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        else if (U) {
          const it = [];
          for (const [dt, O] of Object.entries(R.nodes))
            dt !== U.nodeId && O.x < k && O.x + O.width > Z && O.y < M && O.y + O.height > p && it.push(dt);
          it.length > 0 && pt(U, it);
        }
      } else if (st) {
        const it = [];
        for (const [dt, O] of Object.entries(R.nodes))
          O.x < k && O.x + O.width > Z && O.y < M && O.y + O.height > p && it.push(dt);
        for (const [dt, O] of Object.entries(R.containers))
          O.x < k && O.x + O.width > Z && O.y < M && O.y + O.height > p && it.push(dt);
        n({ type: "SELECTION_CHANGE", payload: { selectedIds: it } });
      }
      Et(null), Ht.current = null;
    }
    !$ && ut && ge(A);
  }, Ce = a ?? (c == null ? void 0 : c.mode) === "flow", Ae = (G ?? a ?? (c == null ? void 0 : c.mode) === "flow") && !$, ue = Object.values(s.containers), he = t === "light" ? "sysflow-theme-light" : "sysflow-theme-dark", fe = Nt(() => ({
    outline: "none",
    ...ze(o),
    ...I
  }), [o, I]);
  return /* @__PURE__ */ _(
    "div",
    {
      ref: f,
      className: `sysflow-canvas ${he} ${$ ? "sysflow-drawing-edge" : ""} ${B}`,
      "data-theme": t,
      style: fe,
      onWheel: V,
      onPointerDown: ce,
      onPointerMove: le,
      onPointerUp: ae,
      tabIndex: 0,
      children: [
        /* @__PURE__ */ N(
          Re,
          {
            graph: s,
            registerMeasureElement: bt,
            nodeTypes: y,
            containerTypes: w
          }
        ),
        $ && /* @__PURE__ */ N(
          "div",
          {
            className: "sysflow-drawing-banner",
            onPointerDown: (A) => A.stopPropagation(),
            children: /* @__PURE__ */ N("span", { children: U ? `Source: "${((Vt = s.nodes[U.nodeId]) == null ? void 0 : Vt.label) || U.nodeId}" — Click destination node or drag marquee to connect (Esc to cancel)` : "Edge Drawing Mode — Click a source node (Esc or click background to exit)" })
          }
        ),
        /* @__PURE__ */ _(
          "div",
          {
            className: "sysflow-controls-panel",
            onPointerDown: (A) => A.stopPropagation(),
            children: [
              /* @__PURE__ */ N("button", { onClick: at, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
              /* @__PURE__ */ N("button", { onClick: ct, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
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
              ot && /* @__PURE__ */ N(
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
              $ && St && mt && /* @__PURE__ */ _("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none", zIndex: 80 }, children: [
                /* @__PURE__ */ N(
                  "line",
                  {
                    x1: St.x,
                    y1: St.y,
                    x2: mt.x,
                    y2: mt.y,
                    stroke: "var(--sysflow-edge-selected, #38bdf8)",
                    strokeWidth: 2,
                    strokeDasharray: "6 4"
                  }
                ),
                /* @__PURE__ */ N(
                  "circle",
                  {
                    cx: St.x,
                    cy: St.y,
                    r: 4,
                    fill: "var(--sysflow-edge-selected, #38bdf8)"
                  }
                )
              ] }),
              /* @__PURE__ */ N(
                "div",
                {
                  className: "sysflow-containers-layer",
                  style: { position: "absolute", zIndex: 1, pointerEvents: "none" },
                  children: ue.map((A) => {
                    const Z = R.containers[A.id];
                    if (!Z) return null;
                    const p = Object.values(s.nodes).some((k) => k.parentId === A.id) || Object.values(s.containers).some((k) => k.parentId === A.id);
                    return /* @__PURE__ */ N(
                      Oe,
                      {
                        container: A,
                        layout: Z,
                        selected: e.includes(A.id),
                        isHovered: oe === A.id,
                        hasChildren: p,
                        customRenderer: A.type ? w == null ? void 0 : w[A.type] : void 0,
                        onToggleCollapse: (k, M) => {
                          $ || n({
                            type: "CONTAINER_TOGGLE_COLLAPSE",
                            payload: { containerId: k, collapsed: M }
                          });
                        },
                        onPointerDown: (k, M) => {
                          if ($) {
                            M.stopPropagation();
                            return;
                          }
                          Xt(k, M);
                        },
                        onMouseEnter: () => {
                        },
                        onMouseLeave: () => {
                        },
                        onClick: (k) => {
                          k.stopPropagation(), !$ && n({
                            type: "SELECTION_CHANGE",
                            payload: { selectedIds: [A.id] }
                          });
                        }
                      },
                      A.id
                    );
                  })
                }
              ),
              /* @__PURE__ */ N(
                Te,
                {
                  graph: s,
                  layout: R,
                  selectedIds: e,
                  direction: r,
                  showArrows: l,
                  routing: u,
                  portOptions: ht,
                  enableEdgeQuickAdd: Ae,
                  onInsertNodeOnEdge: re,
                  onEdgeClick: (A) => {
                    $ || n({ type: "SELECTION_CHANGE", payload: { selectedIds: [A] } });
                  }
                }
              ),
              /* @__PURE__ */ N(
                "div",
                {
                  className: "sysflow-nodes-layer",
                  style: { position: "absolute", zIndex: 10, pointerEvents: "none" },
                  children: Object.values(s.nodes).map((A) => {
                    const Z = R.nodes[A.id];
                    return Z ? /* @__PURE__ */ N(
                      Ve,
                      {
                        node: A,
                        layout: Z,
                        direction: r,
                        edges: s.edges,
                        portOptions: ht,
                        selected: e.includes(A.id),
                        isDrawingEdge: $,
                        isDrawingSource: (U == null ? void 0 : U.nodeId) === A.id,
                        customRenderer: A.type ? y == null ? void 0 : y[A.type] : void 0,
                        enableQuickAdd: Ce,
                        onAddConnectedNode: de,
                        onPointerDown: Xt,
                        onMouseEnter: () => {
                        },
                        onMouseLeave: () => {
                        },
                        onClick: (p) => {
                          if (p.stopPropagation(), $) {
                            Ie(A, p.clientX, p.clientY);
                            return;
                          }
                          n({
                            type: "SELECTION_CHANGE",
                            payload: { selectedIds: [A.id] }
                          }), d == null || d(A.id, A);
                        }
                      },
                      A.id
                    ) : null;
                  })
                }
              ),
              !$ && ut && /* @__PURE__ */ N(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ut.ghostPosition.x}px, ${ut.ghostPosition.y}px)`,
                    width: `${((Ot = gt.get(ut.draggedEntity.id)) == null ? void 0 : Ot.width) || 200}px`,
                    height: `${((Qt = gt.get(ut.draggedEntity.id)) == null ? void 0 : Qt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ N("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ut.draggedEntity.label })
                }
              )
            ]
          }
        ),
        J && /* @__PURE__ */ N(
          "div",
          {
            className: "sysflow-port-modal-backdrop",
            onPointerDown: (A) => A.stopPropagation(),
            onClick: (A) => {
              A.stopPropagation(), lt(null);
            },
            children: /* @__PURE__ */ _(
              "div",
              {
                className: "sysflow-port-modal",
                onClick: (A) => A.stopPropagation(),
                children: [
                  /* @__PURE__ */ _("div", { className: "sysflow-port-modal-header", children: [
                    /* @__PURE__ */ N("h4", { style: { margin: 0, fontSize: 15 }, children: J.role === "source" ? "Select Source Port" : "Select Destination Port" }),
                    /* @__PURE__ */ _("span", { style: { fontSize: 12, color: "var(--sysflow-node-subtext)" }, children: [
                      "Node: ",
                      /* @__PURE__ */ N("strong", { children: J.node.label }),
                      J.remainingDestNodeIds && J.remainingDestNodeIds.length > 0 && /* @__PURE__ */ _(Mt, { children: [
                        " (",
                        J.remainingDestNodeIds.length,
                        " more queued)"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ N("div", { className: "sysflow-port-modal-list", children: J.candidatePorts.map((A) => {
                    var Z;
                    return /* @__PURE__ */ _(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-port-modal-option",
                        onClick: () => ie(A),
                        children: [
                          /* @__PURE__ */ N("span", { style: { fontWeight: 600 }, children: A.label }),
                          /* @__PURE__ */ _("span", { style: { fontSize: 11, opacity: 0.7 }, children: [
                            A.side ? `side: ${A.side}` : A.id,
                            (Z = A.data) != null && Z.busWidth ? ` • ${String(A.data.busWidth)}` : ""
                          ] })
                        ]
                      },
                      A.id
                    );
                  }) }),
                  /* @__PURE__ */ _("div", { className: "sysflow-port-modal-footer", children: [
                    J.role === "destination" && J.remainingDestNodeIds && J.remainingDestNodeIds.length > 0 && /* @__PURE__ */ N(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-control-btn",
                        onClick: () => {
                          const A = J.source, Z = J.remainingDestNodeIds;
                          lt(null), pt(A, Z);
                        },
                        children: "Skip Node"
                      }
                    ),
                    /* @__PURE__ */ N(
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
  Te as GraphEdgeLayer,
  Ve as GraphNode,
  Xe as GraphPortLayer,
  Pe as ReparentStrategy,
  Ee as SugiyamaEngine,
  qe as SysFlowCanvas,
  De as WorkerBridge,
  Kt as computeEntityPortLocations,
  zt as pruneDanglingEdges,
  te as resolveEffectiveEntityId,
  ze as themeTokensToStyle,
  ve as useCanvasTransform,
  Ne as useDragGesture,
  _e as useGraphHistory,
  Ye as useMeasurement
};
