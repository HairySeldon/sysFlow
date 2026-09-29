var Ht = Object.defineProperty;
var Wt = (r, e, n) => e in r ? Ht(r, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : r[e] = n;
var It = (r, e, n) => Wt(r, typeof e != "symbol" ? e + "" : e, n);
import { useState as O, useRef as J, useCallback as v, useEffect as lt, useMemo as vt } from "react";
import { jsxs as V, jsx as L, Fragment as Et } from "react/jsx-runtime";
function Tt(r, e, n, C) {
  const I = (l) => {
    const c = n.find(
      (d) => d.sourceId === e && d.sourcePortId === l || d.targetId === e && d.targetPortId === l
    );
    if (!c) return null;
    const a = c.sourceId === e ? c.targetId : c.sourceId, g = C[a];
    return g ? { x: g.x + g.width / 2, y: g.y + g.height / 2 } : null;
  };
  ["left", "right"].forEach((l) => {
    r[l].sort((c, a) => {
      var f, u;
      const g = ((f = I(c.id)) == null ? void 0 : f.y) ?? 0, d = ((u = I(a.id)) == null ? void 0 : u.y) ?? 0;
      return g - d;
    });
  }), ["top", "bottom"].forEach((l) => {
    r[l].sort((c, a) => {
      var f, u;
      const g = ((f = I(c.id)) == null ? void 0 : f.x) ?? 0, d = ((u = I(a.id)) == null ? void 0 : u.x) ?? 0;
      return g - d;
    });
  });
}
function Xt(r, e, n, C, I, l) {
  if (!I || !l)
    return n ? "left" : "right";
  const c = C.find(
    (u) => n ? u.targetId === r && u.targetPortId === e : u.sourceId === r && u.sourcePortId === e
  );
  if (!c) return n ? "left" : "right";
  const a = n ? c.sourceId : c.targetId, g = I[a];
  if (!g) return n ? "left" : "right";
  const d = g.x + g.width / 2 - (l.x + l.width / 2), f = g.y + g.height / 2 - (l.y + l.height / 2);
  return Math.abs(d) > Math.abs(f) ? d > 0 ? "right" : "left" : f > 0 ? "bottom" : "top";
}
function At(r, e, n = "LR", C, I) {
  const l = /* @__PURE__ */ new Map();
  if (!r || !e || !r.ports || r.ports.length === 0)
    return l;
  const c = (I == null ? void 0 : I.direction) || n, a = (I == null ? void 0 : I.mode) || (c === "TB" ? "strict-flow" : "perimeter-optimized"), g = C ? Array.isArray(C) ? C : Object.values(C) : [], d = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, f = new Set(
    g.filter((t) => t.targetId === r.id).map((t) => t.targetPortId)
  );
  new Set(
    g.filter((t) => t.sourceId === r.id).map((t) => t.sourcePortId)
  ), r.ports.forEach((t) => {
    let s = t.side || "auto";
    if (s !== "auto") {
      d[s].push(t);
      return;
    }
    if (a === "strict-flow") {
      const y = f.has(t.id) || t.label.toLowerCase().includes("in");
      c === "TB" ? s = y ? "bottom" : "top" : s = y ? "left" : "right";
    } else
      s = Xt(
        r.id,
        t.id,
        f.has(t.id),
        g,
        I == null ? void 0 : I.nodeLayouts,
        e
      );
    d[s].push(t);
  }), a === "perimeter-optimized" && (I != null && I.nodeLayouts) && Tt(d, r.id, g, I.nodeLayouts);
  const u = (t, s) => {
    const y = t.length;
    t.forEach((A, i) => {
      let o = 0, h = 0;
      s === "left" || s === "right" ? (h = e.height / (y + 1) * (i + 1), o = s === "left" ? 0 : e.width) : (o = e.width / (y + 1) * (i + 1), h = s === "top" ? 0 : e.height), l.set(A.id, {
        portId: A.id,
        side: s,
        localX: o,
        localY: h,
        worldX: e.x + o,
        worldY: e.y + h
      });
    });
  };
  return u(d.left, "left"), u(d.right, "right"), u(d.top, "top"), u(d.bottom, "bottom"), l;
}
function Dt(r) {
  const e = {}, n = (C) => {
    var l;
    const I = r.nodes[C];
    return new Set(((l = I == null ? void 0 : I.ports) == null ? void 0 : l.map((c) => c.id)) || []);
  };
  for (const [C, I] of Object.entries(r.edges)) {
    const l = n(I.sourceId), c = n(I.targetId), a = l.has(I.sourcePortId), g = c.has(I.targetPortId);
    a && g && (e[C] = I);
  }
  return {
    ...r,
    edges: e
  };
}
class Nt {
  static decouple(e, n) {
    const C = /* @__PURE__ */ new Map();
    for (const d of n)
      C.set(d, /* @__PURE__ */ new Set());
    const I = Object.values(e.edges);
    for (const d of I)
      n.has(d.sourceId) && n.has(d.targetId) && C.get(d.sourceId).add(d.targetId);
    const l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), g = (d) => {
      l.add(d), c.add(d);
      const f = Array.from(C.get(d) || []);
      for (const u of f)
        l.has(u) ? c.has(u) && (C.get(d).delete(u), C.get(u).add(d), a.add(`${d}->${u}`)) : g(u);
      c.delete(d);
    };
    for (const d of n)
      l.has(d) || g(d);
    return {
      adjList: C,
      reversedEdges: a,
      allEntityIds: Array.from(n)
    };
  }
}
class Mt {
  static assignLayers(e, n) {
    const C = /* @__PURE__ */ new Map();
    for (const g of e)
      C.set(g, 0);
    for (const [, g] of n.entries())
      for (const d of g)
        C.set(d, (C.get(d) || 0) + 1);
    const I = /* @__PURE__ */ new Map(), l = [];
    for (const g of e)
      (C.get(g) || 0) === 0 && (I.set(g, 0), l.push(g));
    const c = /* @__PURE__ */ new Set();
    for (; l.length > 0; ) {
      const g = l.shift();
      c.add(g);
      const d = I.get(g) || 0, f = n.get(g) || /* @__PURE__ */ new Set();
      for (const u of f) {
        const t = I.get(u) ?? 0;
        I.set(u, Math.max(t, d + 1)), C.set(u, (C.get(u) || 1) - 1), C.get(u) === 0 && l.push(u);
      }
    }
    for (const g of e)
      I.has(g) || I.set(g, 0);
    const a = /* @__PURE__ */ new Map();
    for (const [g, d] of I.entries())
      a.has(d) || a.set(d, []), a.get(d).push(g);
    return a;
  }
}
class q {
  static minimizeCrossings(e, n, C = 4) {
    const I = Array.from(e.keys()).sort((a, g) => a - g);
    if (I.length <= 1) return e;
    const l = /* @__PURE__ */ new Map();
    for (const [a, g] of n.entries())
      for (const d of g)
        l.has(d) || l.set(d, /* @__PURE__ */ new Set()), l.get(d).add(a);
    const c = /* @__PURE__ */ new Map();
    for (const [a, g] of e.entries())
      c.set(a, [...g]);
    for (let a = 0; a < C; a++) {
      for (let g = 1; g < I.length; g++) {
        const d = c.get(I[g - 1]), f = c.get(I[g]), u = /* @__PURE__ */ new Map();
        d.forEach((t, s) => u.set(t, s)), f.sort((t, s) => {
          const y = q.getBarycenter(t, l, u), A = q.getBarycenter(s, l, u);
          return y - A;
        });
      }
      for (let g = I.length - 2; g >= 0; g--) {
        const d = c.get(I[g + 1]), f = c.get(I[g]), u = /* @__PURE__ */ new Map();
        d.forEach((t, s) => u.set(t, s)), f.sort((t, s) => {
          const y = q.getBarycenter(t, n, u), A = q.getBarycenter(s, n, u);
          return y - A;
        });
      }
    }
    return c;
  }
  static getBarycenter(e, n, C) {
    const I = n.get(e);
    if (!I || I.size === 0) return 0;
    let l = 0, c = 0;
    for (const a of I)
      C.has(a) && (l += C.get(a), c++);
    return c === 0 ? 0 : l / c;
  }
}
const F = 32, st = 24, wt = 22, dt = 18, at = 38, nt = 210, bt = 36, Vt = 180, Rt = 54;
class j {
  static assignCoordinates(e, n, C, I = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const l = I.direction === "TB", c = I.aspectRatio ?? 1.55, a = Object.keys(e.containers).length, g = I.mode && I.mode !== "auto" ? I.mode : a > 0 ? "concurrent" : "flow", d = {}, f = {}, u = (t) => {
      var A, i, o;
      const s = !!e.containers[t], y = !!((A = e.containers[t]) != null && A.collapsed);
      return s && y ? { width: nt, height: bt } : {
        width: ((i = C.get(t)) == null ? void 0 : i.width) || Vt,
        height: ((o = C.get(t)) == null ? void 0 : o.height) || Rt
      };
    };
    return g === "concurrent" ? j.layoutConcurrentHierarchy(
      e,
      u,
      c,
      d,
      f
    ) : j.layoutFlowTree(
      e,
      n,
      u,
      l,
      d,
      f
    ), j.assignDynamicPortSides(e, d, f, l), { nodes: d, containers: f };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(e, n, C, I, l) {
    var y;
    const c = /* @__PURE__ */ new Map();
    for (const [A, i] of Object.entries(e.nodes)) {
      const o = i.parentId ?? null;
      c.has(o) || c.set(o, []), c.get(o).push(A);
    }
    for (const [A, i] of Object.entries(e.containers)) {
      const o = i.parentId ?? null;
      c.has(o) || c.set(o, []), c.get(o).push(A);
    }
    const a = j.getContainerDepths(e), g = Object.keys(e.containers).sort(
      (A, i) => (a.get(i) || 0) - (a.get(A) || 0)
    ), d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
    for (const A of g) {
      if (!!((y = e.containers[A]) != null && y.collapsed)) {
        d.set(A, {
          width: nt,
          height: bt
        });
        continue;
      }
      const o = c.get(A) || [];
      if (o.length === 0) {
        d.set(A, {
          width: nt,
          height: at + dt * 2
        });
        continue;
      }
      const h = o.map((m) => {
        const P = d.has(m) ? d.get(m) : n(m);
        return { id: m, width: P.width, height: P.height };
      }), B = j.findBestTightPacking(h, C);
      for (const m of B.boxes)
        f.set(m.id, m);
      const b = Math.max(B.width + wt * 2, nt), w = B.height + at + dt * 2;
      d.set(A, { width: b, height: w });
    }
    const u = c.get(null) || [];
    let t = [];
    if (u.length > 0) {
      const A = u.map((o) => {
        const h = d.get(o) || n(o);
        return { id: o, width: h.width, height: h.height };
      });
      t = j.findBestTightPacking(A, C).boxes.map((o) => ({
        ...o,
        localX: o.localX + 60,
        localY: o.localY + 60
      }));
    }
    const s = (A, i, o, h, B) => {
      var m;
      const b = !!e.containers[A], w = { id: A, x: i, y: o, width: h, height: B };
      if (b) {
        if (l[A] = w, (m = e.containers[A]) != null && m.collapsed) return;
        const P = i + wt, K = o + at + dt, Y = c.get(A) || [];
        for (const E of Y) {
          const Z = f.get(E);
          Z && s(
            E,
            P + Z.localX,
            K + Z.localY,
            Z.width,
            Z.height
          );
        }
      } else
        I[A] = w;
    };
    for (const A of t)
      s(A.id, A.localX, A.localY, A.width, A.height);
  }
  /**
   * Evaluates multiple candidate bounding widths using 2D skyline bin packing
   * and picks the configuration that minimizes empty space while respecting targetAspect.
   */
  static findBestTightPacking(e, n) {
    if (e.length === 1)
      return {
        width: e[0].width,
        height: e[0].height,
        boxes: [{ id: e[0].id, localX: 0, localY: 0, width: e[0].width, height: e[0].height }],
        score: 0
      };
    const C = e.reduce((u, t) => u + t.width * t.height, 0), I = Math.max(...e.map((u) => u.width)), l = [...e].sort((u, t) => t.width - u.width), c = /* @__PURE__ */ new Set(), a = e.reduce((u, t) => u + t.width, 0) + (e.length - 1) * F;
    c.add(a), c.add(I);
    const g = Math.max(I, Math.sqrt(C * n));
    c.add(g), c.add(g * 0.85), c.add(g * 1.15);
    const d = Math.min(e.length, 6);
    for (let u = 2; u <= d; u++) {
      let t = 0;
      for (let s = 0; s < u && s < l.length; s++)
        t += l[s].width;
      t += (u - 1) * F, t >= I && c.add(t);
    }
    let f = null;
    for (const u of c) {
      const t = j.simulateSkylinePacking(e, u), s = t.width * t.height, y = Math.max(0, s - C), A = t.width / Math.max(1, t.height), i = Math.abs(Math.log(A / n)), o = y / C * 2 + i * 0.25;
      t.score = o, (!f || o < f.score) && (f = t);
    }
    return f;
  }
  /**
   * Bottom-Left Skyline 2D Bin Packing:
   * Sorts items descending by height (First-Fit Decreasing) and packs into the lowest
   * available height valley, preventing tall items from locking the vertical baseline.
   */
  static simulateSkylinePacking(e, n) {
    const C = [...e].sort((g, d) => d.height - g.height), I = [{ x: 0, width: n, y: 0 }], l = [];
    for (const g of C) {
      let d = 1 / 0, f = -1;
      for (let o = 0; o < I.length; o++) {
        if (I[o].x + g.width > n) continue;
        let B = 0, b = 0;
        for (let w = o; w < I.length && b < g.width; w++)
          B = Math.max(B, I[w].y), b += I[w].width;
        B < d && (d = B, f = o);
      }
      if (f === -1) {
        const o = Math.max(...I.map((B) => B.y)), h = o === 0 ? 0 : o + st;
        l.push({
          id: g.id,
          localX: 0,
          localY: h,
          width: g.width,
          height: g.height
        }), I.length = 0, I.push({ x: 0, width: g.width + F, y: h + g.height }), n > g.width + F && I.push({
          x: g.width + F,
          width: n - (g.width + F),
          y: 0
        });
        continue;
      }
      const u = I[f].x, t = d === 0 ? 0 : d + st;
      l.push({
        id: g.id,
        localX: u,
        localY: t,
        width: g.width,
        height: g.height
      });
      const s = g.width + F, y = t + g.height, A = { x: u, width: s, y }, i = [];
      for (const o of I)
        o.x + o.width <= u || o.x >= u + s ? i.push(o) : (o.x < u && i.push({ x: o.x, width: u - o.x, y: o.y }), o.x + o.width > u + s && i.push({
          x: u + s,
          width: o.x + o.width - (u + s),
          y: o.y
        }));
      i.push(A), i.sort((o, h) => o.x - h.x), I.length = 0, I.push(...i);
    }
    const c = Math.max(...l.map((g) => g.localX + g.width), 0), a = Math.max(...l.map((g) => g.localY + g.height), 0);
    return { width: c, height: a, boxes: l, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE SYMMETRICAL CENTERING (DEMO 2)
  // ===========================================================================
  static layoutFlowTree(e, n, C, I, l, c) {
    const a = Array.from(n.keys()).sort((o, h) => o - h), g = /* @__PURE__ */ new Map();
    let d = 80;
    const f = I ? st * 1.5 : F * 1.5, u = I ? F : st;
    for (const o of a) {
      const h = n.get(o) || [];
      let B = 0;
      for (const b of h) {
        const w = C(b), m = I ? w.height : w.width;
        B = Math.max(B, m);
      }
      g.set(o, d), d += B + f;
    }
    const t = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
    for (const o of Object.values(e.edges))
      t.has(o.targetId) || t.set(o.targetId, []), t.get(o.targetId).push(o.sourceId), s.has(o.sourceId) || s.set(o.sourceId, []), s.get(o.sourceId).push(o.targetId);
    const y = /* @__PURE__ */ new Map();
    for (const o of a) {
      const h = n.get(o) || [];
      let B = -1 / 0;
      for (const b of h) {
        const w = C(b), m = I ? w.width : w.height, P = t.get(b) || [];
        let K = null;
        if (P.length > 0) {
          const E = P.map((Z) => {
            const W = y.get(Z);
            if (W === void 0) return null;
            const S = C(Z);
            return W + (I ? S.width : S.height) / 2;
          }).filter((Z) => Z !== null);
          E.length > 0 && (K = E.reduce((Z, W) => Z + W, 0) / E.length);
        }
        let Y = K !== null ? K - m / 2 : 80;
        Y < B + u && (Y = B === -1 / 0 ? 80 : B + u), y.set(b, Y), B = Y + m;
      }
    }
    for (let o = a.length - 1; o >= 0; o--) {
      const h = a[o], B = n.get(h) || [];
      for (const w of B) {
        const m = s.get(w) || [];
        if (m.length === 0) continue;
        const P = m.map((K) => {
          const Y = y.get(K);
          if (Y === void 0) return null;
          const E = C(K);
          return Y + (I ? E.width : E.height) / 2;
        }).filter((K) => K !== null);
        if (P.length > 0) {
          const K = P.reduce((Z, W) => Z + W, 0) / P.length, Y = C(w), E = I ? Y.width : Y.height;
          y.set(w, K - E / 2);
        }
      }
      let b = -1 / 0;
      for (const w of B) {
        const m = C(w), P = I ? m.width : m.height;
        let K = y.get(w) ?? 80;
        K < b + u && (K = b + u, y.set(w, K)), b = K + P;
      }
    }
    let A = 1 / 0;
    for (const o of y.values()) A = Math.min(A, o);
    const i = A < 80 ? 80 - A : 0;
    for (const o of a) {
      const h = n.get(o) || [], B = g.get(o) || 80;
      for (const b of h) {
        const w = C(b), m = (y.get(b) ?? 80) + i, Y = { id: b, x: I ? m : B, y: I ? B : m, width: w.width, height: w.height };
        e.containers[b] ? c[b] = Y : l[b] = Y;
      }
    }
  }
  static assignDynamicPortSides(e, n, C, I) {
    var c, a;
    const l = (g) => n[g] || C[g];
    for (const g of Object.values(e.edges)) {
      const d = l(g.sourceId), f = l(g.targetId);
      if (!d || !f) continue;
      const u = e.nodes[g.sourceId] || e.containers[g.sourceId], t = e.nodes[g.targetId] || e.containers[g.targetId], s = f.x + f.width / 2 - (d.x + d.width / 2), y = f.y + f.height / 2 - (d.y + d.height / 2), A = Math.abs(s) > Math.abs(y) * 1.25, i = (c = u == null ? void 0 : u.ports) == null ? void 0 : c.find((h) => h.id === g.sourcePortId);
      i && (!i.side || i.side === "auto") && (A ? i.side = s >= 0 ? "right" : "left" : i.side = y >= 0 ? "bottom" : "top");
      const o = (a = t == null ? void 0 : t.ports) == null ? void 0 : a.find((h) => h.id === g.targetPortId);
      o && (!o.side || o.side === "auto") && (A ? o.side = s >= 0 ? "left" : "right" : o.side = y >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(e) {
    const n = /* @__PURE__ */ new Map(), C = (I) => {
      var a;
      if (n.has(I)) return n.get(I);
      const l = (a = e.containers[I]) == null ? void 0 : a.parentId;
      if (!l || !e.containers[l])
        return n.set(I, 0), 0;
      const c = 1 + C(l);
      return n.set(I, c), c;
    };
    for (const I of Object.keys(e.containers))
      C(I);
    return n;
  }
}
class Qt {
  async execute(e, n, C) {
    const I = Object.values(e.containers), l = Object.values(e.nodes), c = new Set(
      I.filter((t) => !!t.collapsed).map((t) => t.id)
    ), a = (t) => {
      var y;
      let s = t;
      for (; s; ) {
        if (c.has(s)) return !0;
        s = (y = e.containers[s]) == null ? void 0 : y.parentId;
      }
      return !1;
    }, g = /* @__PURE__ */ new Set();
    for (const [t, s] of Object.entries(e.nodes))
      a(s.parentId) || g.add(t);
    for (const [t, s] of Object.entries(e.containers)) {
      const y = s;
      y.collapsed ? a(y.parentId) || g.add(t) : !(l.some((i) => i.parentId === t) || I.some((i) => i.parentId === t)) && !a(y.parentId) && g.add(t);
    }
    const d = Nt.decouple(e, g), f = Mt.assignLayers(d.allEntityIds, d.adjList), u = q.minimizeCrossings(f, d.adjList, 4);
    return j.assignCoordinates(e, u, n, C);
  }
}
const Gt = "Y2xhc3MgWCB7CiAgc3RhdGljIGRlY291cGxlKG8sIGwpIHsKICAgIGNvbnN0IGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBzIG9mIGwpCiAgICAgIGEuc2V0KHMsIC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkpOwogICAgY29uc3QgbiA9IE9iamVjdC52YWx1ZXMoby5lZGdlcyk7CiAgICBmb3IgKGNvbnN0IHMgb2YgbikKICAgICAgbC5oYXMocy5zb3VyY2VJZCkgJiYgbC5oYXMocy50YXJnZXRJZCkgJiYgYS5nZXQocy5zb3VyY2VJZCkuYWRkKHMudGFyZ2V0SWQpOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgdCA9IChzKSA9PiB7CiAgICAgIGQuYWRkKHMpLCByLmFkZChzKTsKICAgICAgY29uc3QgdSA9IEFycmF5LmZyb20oYS5nZXQocykgfHwgW10pOwogICAgICBmb3IgKGNvbnN0IGMgb2YgdSkKICAgICAgICBkLmhhcyhjKSA/IHIuaGFzKGMpICYmIChhLmdldChzKS5kZWxldGUoYyksIGEuZ2V0KGMpLmFkZChzKSwgZi5hZGQoYCR7c30tPiR7Y31gKSkgOiB0KGMpOwogICAgICByLmRlbGV0ZShzKTsKICAgIH07CiAgICBmb3IgKGNvbnN0IHMgb2YgbCkKICAgICAgZC5oYXMocykgfHwgdChzKTsKICAgIHJldHVybiB7CiAgICAgIGFkakxpc3Q6IGEsCiAgICAgIHJldmVyc2VkRWRnZXM6IGYsCiAgICAgIGFsbEVudGl0eUlkczogQXJyYXkuZnJvbShsKQogICAgfTsKICB9Cn0KY2xhc3MgQiB7CiAgc3RhdGljIGFzc2lnbkxheWVycyhvLCBsKSB7CiAgICBjb25zdCBhID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgdCBvZiBvKQogICAgICBhLnNldCh0LCAwKTsKICAgIGZvciAoY29uc3QgWywgdF0gb2YgbC5lbnRyaWVzKCkpCiAgICAgIGZvciAoY29uc3QgcyBvZiB0KQogICAgICAgIGEuc2V0KHMsIChhLmdldChzKSB8fCAwKSArIDEpOwogICAgY29uc3QgbiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGQgPSBbXTsKICAgIGZvciAoY29uc3QgdCBvZiBvKQogICAgICAoYS5nZXQodCkgfHwgMCkgPT09IDAgJiYgKG4uc2V0KHQsIDApLCBkLnB1c2godCkpOwogICAgY29uc3QgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKDsgZC5sZW5ndGggPiAwOyApIHsKICAgICAgY29uc3QgdCA9IGQuc2hpZnQoKTsKICAgICAgci5hZGQodCk7CiAgICAgIGNvbnN0IHMgPSBuLmdldCh0KSB8fCAwLCB1ID0gbC5nZXQodCkgfHwgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgICAgZm9yIChjb25zdCBjIG9mIHUpIHsKICAgICAgICBjb25zdCBpID0gbi5nZXQoYykgPz8gMDsKICAgICAgICBuLnNldChjLCBNYXRoLm1heChpLCBzICsgMSkpLCBhLnNldChjLCAoYS5nZXQoYykgfHwgMSkgLSAxKSwgYS5nZXQoYykgPT09IDAgJiYgZC5wdXNoKGMpOwogICAgICB9CiAgICB9CiAgICBmb3IgKGNvbnN0IHQgb2YgbykKICAgICAgbi5oYXModCkgfHwgbi5zZXQodCwgMCk7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW3QsIHNdIG9mIG4uZW50cmllcygpKQogICAgICBmLmhhcyhzKSB8fCBmLnNldChzLCBbXSksIGYuZ2V0KHMpLnB1c2godCk7CiAgICByZXR1cm4gZjsKICB9Cn0KY2xhc3MgQSB7CiAgc3RhdGljIG1pbmltaXplQ3Jvc3NpbmdzKG8sIGwsIGEgPSA0KSB7CiAgICBjb25zdCBuID0gQXJyYXkuZnJvbShvLmtleXMoKSkuc29ydCgoZiwgdCkgPT4gZiAtIHQpOwogICAgaWYgKG4ubGVuZ3RoIDw9IDEpIHJldHVybiBvOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtmLCB0XSBvZiBsLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgICAgZC5oYXMocykgfHwgZC5zZXQocywgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSksIGQuZ2V0KHMpLmFkZChmKTsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbZiwgdF0gb2Ygby5lbnRyaWVzKCkpCiAgICAgIHIuc2V0KGYsIFsuLi50XSk7CiAgICBmb3IgKGxldCBmID0gMDsgZiA8IGE7IGYrKykgewogICAgICBmb3IgKGxldCB0ID0gMTsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBjb25zdCBzID0gci5nZXQoblt0IC0gMV0pLCB1ID0gci5nZXQoblt0XSksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHMuZm9yRWFjaCgoaSwgZykgPT4gYy5zZXQoaSwgZykpLCB1LnNvcnQoKGksIGcpID0+IHsKICAgICAgICAgIGNvbnN0IHAgPSBBLmdldEJhcnljZW50ZXIoaSwgZCwgYyksIGggPSBBLmdldEJhcnljZW50ZXIoZywgZCwgYyk7CiAgICAgICAgICByZXR1cm4gcCAtIGg7CiAgICAgICAgfSk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgdCA9IG4ubGVuZ3RoIC0gMjsgdCA+PSAwOyB0LS0pIHsKICAgICAgICBjb25zdCBzID0gci5nZXQoblt0ICsgMV0pLCB1ID0gci5nZXQoblt0XSksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHMuZm9yRWFjaCgoaSwgZykgPT4gYy5zZXQoaSwgZykpLCB1LnNvcnQoKGksIGcpID0+IHsKICAgICAgICAgIGNvbnN0IHAgPSBBLmdldEJhcnljZW50ZXIoaSwgbCwgYyksIGggPSBBLmdldEJhcnljZW50ZXIoZywgbCwgYyk7CiAgICAgICAgICByZXR1cm4gcCAtIGg7CiAgICAgICAgfSk7CiAgICAgIH0KICAgIH0KICAgIHJldHVybiByOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihvLCBsLCBhKSB7CiAgICBjb25zdCBuID0gbC5nZXQobyk7CiAgICBpZiAoIW4gfHwgbi5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBkID0gMCwgciA9IDA7CiAgICBmb3IgKGNvbnN0IGYgb2YgbikKICAgICAgYS5oYXMoZikgJiYgKGQgKz0gYS5nZXQoZiksIHIrKyk7CiAgICByZXR1cm4gciA9PT0gMCA/IDAgOiBkIC8gcjsKICB9Cn0KY29uc3QgRCA9IDMyLCBrID0gMjQsIFQgPSAyMiwgSCA9IDE4LCBqID0gMzgsIHYgPSAyMTAsIFcgPSAzNiwgRyA9IDE4MCwgUiA9IDU0OwpjbGFzcyBMIHsKICBzdGF0aWMgYXNzaWduQ29vcmRpbmF0ZXMobywgbCwgYSwgbiA9IHsgZGlyZWN0aW9uOiAiVEIiLCBtb2RlOiAiYXV0byIsIGFzcGVjdFJhdGlvOiAxLjU1IH0pIHsKICAgIGNvbnN0IGQgPSBuLmRpcmVjdGlvbiA9PT0gIlRCIiwgciA9IG4uYXNwZWN0UmF0aW8gPz8gMS41NSwgZiA9IE9iamVjdC5rZXlzKG8uY29udGFpbmVycykubGVuZ3RoLCB0ID0gbi5tb2RlICYmIG4ubW9kZSAhPT0gImF1dG8iID8gbi5tb2RlIDogZiA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIsIHMgPSB7fSwgdSA9IHt9LCBjID0gKGkpID0+IHsKICAgICAgdmFyIGgsIHcsIGU7CiAgICAgIGNvbnN0IGcgPSAhIW8uY29udGFpbmVyc1tpXSwgcCA9ICEhKChoID0gby5jb250YWluZXJzW2ldKSAhPSBudWxsICYmIGguY29sbGFwc2VkKTsKICAgICAgcmV0dXJuIGcgJiYgcCA/IHsgd2lkdGg6IHYsIGhlaWdodDogVyB9IDogewogICAgICAgIHdpZHRoOiAoKHcgPSBhLmdldChpKSkgPT0gbnVsbCA/IHZvaWQgMCA6IHcud2lkdGgpIHx8IEcsCiAgICAgICAgaGVpZ2h0OiAoKGUgPSBhLmdldChpKSkgPT0gbnVsbCA/IHZvaWQgMCA6IGUuaGVpZ2h0KSB8fCBSCiAgICAgIH07CiAgICB9OwogICAgcmV0dXJuIHQgPT09ICJjb25jdXJyZW50IiA/IEwubGF5b3V0Q29uY3VycmVudEhpZXJhcmNoeSgKICAgICAgbywKICAgICAgYywKICAgICAgciwKICAgICAgcywKICAgICAgdQogICAgKSA6IEwubGF5b3V0Rmxvd1RyZWUoCiAgICAgIG8sCiAgICAgIGwsCiAgICAgIGMsCiAgICAgIGQsCiAgICAgIHMsCiAgICAgIHUKICAgICksIEwuYXNzaWduRHluYW1pY1BvcnRTaWRlcyhvLCBzLCB1LCBkKSwgeyBub2RlczogcywgY29udGFpbmVyczogdSB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBDT05DVVJSRU5UIENPTVBPVU5EIFBBQ0tJTkcgV0lUSCBTS1lMSU5FIDJEIEJJTiBQQUNLSU5HCiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgc3RhdGljIGxheW91dENvbmN1cnJlbnRIaWVyYXJjaHkobywgbCwgYSwgbiwgZCkgewogICAgdmFyIHA7CiAgICBjb25zdCByID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW2gsIHddIG9mIE9iamVjdC5lbnRyaWVzKG8ubm9kZXMpKSB7CiAgICAgIGNvbnN0IGUgPSB3LnBhcmVudElkID8/IG51bGw7CiAgICAgIHIuaGFzKGUpIHx8IHIuc2V0KGUsIFtdKSwgci5nZXQoZSkucHVzaChoKTsKICAgIH0KICAgIGZvciAoY29uc3QgW2gsIHddIG9mIE9iamVjdC5lbnRyaWVzKG8uY29udGFpbmVycykpIHsKICAgICAgY29uc3QgZSA9IHcucGFyZW50SWQgPz8gbnVsbDsKICAgICAgci5oYXMoZSkgfHwgci5zZXQoZSwgW10pLCByLmdldChlKS5wdXNoKGgpOwogICAgfQogICAgY29uc3QgZiA9IEwuZ2V0Q29udGFpbmVyRGVwdGhzKG8pLCB0ID0gT2JqZWN0LmtleXMoby5jb250YWluZXJzKS5zb3J0KAogICAgICAoaCwgdykgPT4gKGYuZ2V0KHcpIHx8IDApIC0gKGYuZ2V0KGgpIHx8IDApCiAgICApLCBzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IGggb2YgdCkgewogICAgICBpZiAoISEoKHAgPSBvLmNvbnRhaW5lcnNbaF0pICE9IG51bGwgJiYgcC5jb2xsYXBzZWQpKSB7CiAgICAgICAgcy5zZXQoaCwgewogICAgICAgICAgd2lkdGg6IHYsCiAgICAgICAgICBoZWlnaHQ6IFcKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBlID0gci5nZXQoaCkgfHwgW107CiAgICAgIGlmIChlLmxlbmd0aCA9PT0gMCkgewogICAgICAgIHMuc2V0KGgsIHsKICAgICAgICAgIHdpZHRoOiB2LAogICAgICAgICAgaGVpZ2h0OiBqICsgSCAqIDIKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBtID0gZS5tYXAoKEkpID0+IHsKICAgICAgICBjb25zdCBDID0gcy5oYXMoSSkgPyBzLmdldChJKSA6IGwoSSk7CiAgICAgICAgcmV0dXJuIHsgaWQ6IEksIHdpZHRoOiBDLndpZHRoLCBoZWlnaHQ6IEMuaGVpZ2h0IH07CiAgICAgIH0pLCB5ID0gTC5maW5kQmVzdFRpZ2h0UGFja2luZyhtLCBhKTsKICAgICAgZm9yIChjb25zdCBJIG9mIHkuYm94ZXMpCiAgICAgICAgdS5zZXQoSS5pZCwgSSk7CiAgICAgIGNvbnN0IE0gPSBNYXRoLm1heCh5LndpZHRoICsgVCAqIDIsIHYpLCB4ID0geS5oZWlnaHQgKyBqICsgSCAqIDI7CiAgICAgIHMuc2V0KGgsIHsgd2lkdGg6IE0sIGhlaWdodDogeCB9KTsKICAgIH0KICAgIGNvbnN0IGMgPSByLmdldChudWxsKSB8fCBbXTsKICAgIGxldCBpID0gW107CiAgICBpZiAoYy5sZW5ndGggPiAwKSB7CiAgICAgIGNvbnN0IGggPSBjLm1hcCgoZSkgPT4gewogICAgICAgIGNvbnN0IG0gPSBzLmdldChlKSB8fCBsKGUpOwogICAgICAgIHJldHVybiB7IGlkOiBlLCB3aWR0aDogbS53aWR0aCwgaGVpZ2h0OiBtLmhlaWdodCB9OwogICAgICB9KTsKICAgICAgaSA9IEwuZmluZEJlc3RUaWdodFBhY2tpbmcoaCwgYSkuYm94ZXMubWFwKChlKSA9PiAoewogICAgICAgIC4uLmUsCiAgICAgICAgbG9jYWxYOiBlLmxvY2FsWCArIDYwLAogICAgICAgIGxvY2FsWTogZS5sb2NhbFkgKyA2MAogICAgICB9KSk7CiAgICB9CiAgICBjb25zdCBnID0gKGgsIHcsIGUsIG0sIHkpID0+IHsKICAgICAgdmFyIEk7CiAgICAgIGNvbnN0IE0gPSAhIW8uY29udGFpbmVyc1toXSwgeCA9IHsgaWQ6IGgsIHg6IHcsIHk6IGUsIHdpZHRoOiBtLCBoZWlnaHQ6IHkgfTsKICAgICAgaWYgKE0pIHsKICAgICAgICBpZiAoZFtoXSA9IHgsIChJID0gby5jb250YWluZXJzW2hdKSAhPSBudWxsICYmIEkuY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgQyA9IHcgKyBULCBiID0gZSArIGogKyBILCBPID0gci5nZXQoaCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBTIG9mIE8pIHsKICAgICAgICAgIGNvbnN0IFAgPSB1LmdldChTKTsKICAgICAgICAgIFAgJiYgZygKICAgICAgICAgICAgUywKICAgICAgICAgICAgQyArIFAubG9jYWxYLAogICAgICAgICAgICBiICsgUC5sb2NhbFksCiAgICAgICAgICAgIFAud2lkdGgsCiAgICAgICAgICAgIFAuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgbltoXSA9IHg7CiAgICB9OwogICAgZm9yIChjb25zdCBoIG9mIGkpCiAgICAgIGcoaC5pZCwgaC5sb2NhbFgsIGgubG9jYWxZLCBoLndpZHRoLCBoLmhlaWdodCk7CiAgfQogIC8qKgogICAqIEV2YWx1YXRlcyBtdWx0aXBsZSBjYW5kaWRhdGUgYm91bmRpbmcgd2lkdGhzIHVzaW5nIDJEIHNreWxpbmUgYmluIHBhY2tpbmcKICAgKiBhbmQgcGlja3MgdGhlIGNvbmZpZ3VyYXRpb24gdGhhdCBtaW5pbWl6ZXMgZW1wdHkgc3BhY2Ugd2hpbGUgcmVzcGVjdGluZyB0YXJnZXRBc3BlY3QuCiAgICovCiAgc3RhdGljIGZpbmRCZXN0VGlnaHRQYWNraW5nKG8sIGwpIHsKICAgIGlmIChvLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogb1swXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IG9bMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogb1swXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBvWzBdLndpZHRoLCBoZWlnaHQ6IG9bMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBhID0gby5yZWR1Y2UoKGMsIGkpID0+IGMgKyBpLndpZHRoICogaS5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uby5tYXAoKGMpID0+IGMud2lkdGgpKSwgZCA9IFsuLi5vXS5zb3J0KChjLCBpKSA9PiBpLndpZHRoIC0gYy53aWR0aCksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBmID0gby5yZWR1Y2UoKGMsIGkpID0+IGMgKyBpLndpZHRoLCAwKSArIChvLmxlbmd0aCAtIDEpICogRDsKICAgIHIuYWRkKGYpLCByLmFkZChuKTsKICAgIGNvbnN0IHQgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoYSAqIGwpKTsKICAgIHIuYWRkKHQpLCByLmFkZCh0ICogMC44NSksIHIuYWRkKHQgKiAxLjE1KTsKICAgIGNvbnN0IHMgPSBNYXRoLm1pbihvLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBjID0gMjsgYyA8PSBzOyBjKyspIHsKICAgICAgbGV0IGkgPSAwOwogICAgICBmb3IgKGxldCBnID0gMDsgZyA8IGMgJiYgZyA8IGQubGVuZ3RoOyBnKyspCiAgICAgICAgaSArPSBkW2ddLndpZHRoOwogICAgICBpICs9IChjIC0gMSkgKiBELCBpID49IG4gJiYgci5hZGQoaSk7CiAgICB9CiAgICBsZXQgdSA9IG51bGw7CiAgICBmb3IgKGNvbnN0IGMgb2YgcikgewogICAgICBjb25zdCBpID0gTC5zaW11bGF0ZVNreWxpbmVQYWNraW5nKG8sIGMpLCBnID0gaS53aWR0aCAqIGkuaGVpZ2h0LCBwID0gTWF0aC5tYXgoMCwgZyAtIGEpLCBoID0gaS53aWR0aCAvIE1hdGgubWF4KDEsIGkuaGVpZ2h0KSwgdyA9IE1hdGguYWJzKE1hdGgubG9nKGggLyBsKSksIGUgPSBwIC8gYSAqIDIgKyB3ICogMC4yNTsKICAgICAgaS5zY29yZSA9IGUsICghdSB8fCBlIDwgdS5zY29yZSkgJiYgKHUgPSBpKTsKICAgIH0KICAgIHJldHVybiB1OwogIH0KICAvKioKICAgKiBCb3R0b20tTGVmdCBTa3lsaW5lIDJEIEJpbiBQYWNraW5nOgogICAqIFNvcnRzIGl0ZW1zIGRlc2NlbmRpbmcgYnkgaGVpZ2h0IChGaXJzdC1GaXQgRGVjcmVhc2luZykgYW5kIHBhY2tzIGludG8gdGhlIGxvd2VzdAogICAqIGF2YWlsYWJsZSBoZWlnaHQgdmFsbGV5LCBwcmV2ZW50aW5nIHRhbGwgaXRlbXMgZnJvbSBsb2NraW5nIHRoZSB2ZXJ0aWNhbCBiYXNlbGluZS4KICAgKi8KICBzdGF0aWMgc2ltdWxhdGVTa3lsaW5lUGFja2luZyhvLCBsKSB7CiAgICBjb25zdCBhID0gWy4uLm9dLnNvcnQoKHQsIHMpID0+IHMuaGVpZ2h0IC0gdC5oZWlnaHQpLCBuID0gW3sgeDogMCwgd2lkdGg6IGwsIHk6IDAgfV0sIGQgPSBbXTsKICAgIGZvciAoY29uc3QgdCBvZiBhKSB7CiAgICAgIGxldCBzID0gMSAvIDAsIHUgPSAtMTsKICAgICAgZm9yIChsZXQgZSA9IDA7IGUgPCBuLmxlbmd0aDsgZSsrKSB7CiAgICAgICAgaWYgKG5bZV0ueCArIHQud2lkdGggPiBsKSBjb250aW51ZTsKICAgICAgICBsZXQgeSA9IDAsIE0gPSAwOwogICAgICAgIGZvciAobGV0IHggPSBlOyB4IDwgbi5sZW5ndGggJiYgTSA8IHQud2lkdGg7IHgrKykKICAgICAgICAgIHkgPSBNYXRoLm1heCh5LCBuW3hdLnkpLCBNICs9IG5beF0ud2lkdGg7CiAgICAgICAgeSA8IHMgJiYgKHMgPSB5LCB1ID0gZSk7CiAgICAgIH0KICAgICAgaWYgKHUgPT09IC0xKSB7CiAgICAgICAgY29uc3QgZSA9IE1hdGgubWF4KC4uLm4ubWFwKCh5KSA9PiB5LnkpKSwgbSA9IGUgPT09IDAgPyAwIDogZSArIGs7CiAgICAgICAgZC5wdXNoKHsKICAgICAgICAgIGlkOiB0LmlkLAogICAgICAgICAgbG9jYWxYOiAwLAogICAgICAgICAgbG9jYWxZOiBtLAogICAgICAgICAgd2lkdGg6IHQud2lkdGgsCiAgICAgICAgICBoZWlnaHQ6IHQuaGVpZ2h0CiAgICAgICAgfSksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKHsgeDogMCwgd2lkdGg6IHQud2lkdGggKyBELCB5OiBtICsgdC5oZWlnaHQgfSksIGwgPiB0LndpZHRoICsgRCAmJiBuLnB1c2goewogICAgICAgICAgeDogdC53aWR0aCArIEQsCiAgICAgICAgICB3aWR0aDogbCAtICh0LndpZHRoICsgRCksCiAgICAgICAgICB5OiAwCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgYyA9IG5bdV0ueCwgaSA9IHMgPT09IDAgPyAwIDogcyArIGs7CiAgICAgIGQucHVzaCh7CiAgICAgICAgaWQ6IHQuaWQsCiAgICAgICAgbG9jYWxYOiBjLAogICAgICAgIGxvY2FsWTogaSwKICAgICAgICB3aWR0aDogdC53aWR0aCwKICAgICAgICBoZWlnaHQ6IHQuaGVpZ2h0CiAgICAgIH0pOwogICAgICBjb25zdCBnID0gdC53aWR0aCArIEQsIHAgPSBpICsgdC5oZWlnaHQsIGggPSB7IHg6IGMsIHdpZHRoOiBnLCB5OiBwIH0sIHcgPSBbXTsKICAgICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgICAgZS54ICsgZS53aWR0aCA8PSBjIHx8IGUueCA+PSBjICsgZyA/IHcucHVzaChlKSA6IChlLnggPCBjICYmIHcucHVzaCh7IHg6IGUueCwgd2lkdGg6IGMgLSBlLngsIHk6IGUueSB9KSwgZS54ICsgZS53aWR0aCA+IGMgKyBnICYmIHcucHVzaCh7CiAgICAgICAgICB4OiBjICsgZywKICAgICAgICAgIHdpZHRoOiBlLnggKyBlLndpZHRoIC0gKGMgKyBnKSwKICAgICAgICAgIHk6IGUueQogICAgICAgIH0pKTsKICAgICAgdy5wdXNoKGgpLCB3LnNvcnQoKGUsIG0pID0+IGUueCAtIG0ueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLncpOwogICAgfQogICAgY29uc3QgciA9IE1hdGgubWF4KC4uLmQubWFwKCh0KSA9PiB0LmxvY2FsWCArIHQud2lkdGgpLCAwKSwgZiA9IE1hdGgubWF4KC4uLmQubWFwKCh0KSA9PiB0LmxvY2FsWSArIHQuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogciwgaGVpZ2h0OiBmLCBib3hlczogZCwgc2NvcmU6IDAgfTsKICB9CiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgLy8gRkxPVyBUUkVFIFNZTU1FVFJJQ0FMIENFTlRFUklORyAoREVNTyAyKQogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRGbG93VHJlZShvLCBsLCBhLCBuLCBkLCByKSB7CiAgICBjb25zdCBmID0gQXJyYXkuZnJvbShsLmtleXMoKSkuc29ydCgoZSwgbSkgPT4gZSAtIG0pLCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGxldCBzID0gODA7CiAgICBjb25zdCB1ID0gbiA/IGsgKiAxLjUgOiBEICogMS41LCBjID0gbiA/IEQgOiBrOwogICAgZm9yIChjb25zdCBlIG9mIGYpIHsKICAgICAgY29uc3QgbSA9IGwuZ2V0KGUpIHx8IFtdOwogICAgICBsZXQgeSA9IDA7CiAgICAgIGZvciAoY29uc3QgTSBvZiBtKSB7CiAgICAgICAgY29uc3QgeCA9IGEoTSksIEkgPSBuID8geC5oZWlnaHQgOiB4LndpZHRoOwogICAgICAgIHkgPSBNYXRoLm1heCh5LCBJKTsKICAgICAgfQogICAgICB0LnNldChlLCBzKSwgcyArPSB5ICsgdTsKICAgIH0KICAgIGNvbnN0IGkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBnID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgZSBvZiBPYmplY3QudmFsdWVzKG8uZWRnZXMpKQogICAgICBpLmhhcyhlLnRhcmdldElkKSB8fCBpLnNldChlLnRhcmdldElkLCBbXSksIGkuZ2V0KGUudGFyZ2V0SWQpLnB1c2goZS5zb3VyY2VJZCksIGcuaGFzKGUuc291cmNlSWQpIHx8IGcuc2V0KGUuc291cmNlSWQsIFtdKSwgZy5nZXQoZS5zb3VyY2VJZCkucHVzaChlLnRhcmdldElkKTsKICAgIGNvbnN0IHAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBlIG9mIGYpIHsKICAgICAgY29uc3QgbSA9IGwuZ2V0KGUpIHx8IFtdOwogICAgICBsZXQgeSA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCBNIG9mIG0pIHsKICAgICAgICBjb25zdCB4ID0gYShNKSwgSSA9IG4gPyB4LndpZHRoIDogeC5oZWlnaHQsIEMgPSBpLmdldChNKSB8fCBbXTsKICAgICAgICBsZXQgYiA9IG51bGw7CiAgICAgICAgaWYgKEMubGVuZ3RoID4gMCkgewogICAgICAgICAgY29uc3QgUyA9IEMubWFwKChQKSA9PiB7CiAgICAgICAgICAgIGNvbnN0IE4gPSBwLmdldChQKTsKICAgICAgICAgICAgaWYgKE4gPT09IHZvaWQgMCkgcmV0dXJuIG51bGw7CiAgICAgICAgICAgIGNvbnN0IFkgPSBhKFApOwogICAgICAgICAgICByZXR1cm4gTiArIChuID8gWS53aWR0aCA6IFkuaGVpZ2h0KSAvIDI7CiAgICAgICAgICB9KS5maWx0ZXIoKFApID0+IFAgIT09IG51bGwpOwogICAgICAgICAgUy5sZW5ndGggPiAwICYmIChiID0gUy5yZWR1Y2UoKFAsIE4pID0+IFAgKyBOLCAwKSAvIFMubGVuZ3RoKTsKICAgICAgICB9CiAgICAgICAgbGV0IE8gPSBiICE9PSBudWxsID8gYiAtIEkgLyAyIDogODA7CiAgICAgICAgTyA8IHkgKyBjICYmIChPID0geSA9PT0gLTEgLyAwID8gODAgOiB5ICsgYyksIHAuc2V0KE0sIE8pLCB5ID0gTyArIEk7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IGUgPSBmLmxlbmd0aCAtIDE7IGUgPj0gMDsgZS0tKSB7CiAgICAgIGNvbnN0IG0gPSBmW2VdLCB5ID0gbC5nZXQobSkgfHwgW107CiAgICAgIGZvciAoY29uc3QgeCBvZiB5KSB7CiAgICAgICAgY29uc3QgSSA9IGcuZ2V0KHgpIHx8IFtdOwogICAgICAgIGlmIChJLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgQyA9IEkubWFwKChiKSA9PiB7CiAgICAgICAgICBjb25zdCBPID0gcC5nZXQoYik7CiAgICAgICAgICBpZiAoTyA9PT0gdm9pZCAwKSByZXR1cm4gbnVsbDsKICAgICAgICAgIGNvbnN0IFMgPSBhKGIpOwogICAgICAgICAgcmV0dXJuIE8gKyAobiA/IFMud2lkdGggOiBTLmhlaWdodCkgLyAyOwogICAgICAgIH0pLmZpbHRlcigoYikgPT4gYiAhPT0gbnVsbCk7CiAgICAgICAgaWYgKEMubGVuZ3RoID4gMCkgewogICAgICAgICAgY29uc3QgYiA9IEMucmVkdWNlKChQLCBOKSA9PiBQICsgTiwgMCkgLyBDLmxlbmd0aCwgTyA9IGEoeCksIFMgPSBuID8gTy53aWR0aCA6IE8uaGVpZ2h0OwogICAgICAgICAgcC5zZXQoeCwgYiAtIFMgLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IE0gPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgeCBvZiB5KSB7CiAgICAgICAgY29uc3QgSSA9IGEoeCksIEMgPSBuID8gSS53aWR0aCA6IEkuaGVpZ2h0OwogICAgICAgIGxldCBiID0gcC5nZXQoeCkgPz8gODA7CiAgICAgICAgYiA8IE0gKyBjICYmIChiID0gTSArIGMsIHAuc2V0KHgsIGIpKSwgTSA9IGIgKyBDOwogICAgICB9CiAgICB9CiAgICBsZXQgaCA9IDEgLyAwOwogICAgZm9yIChjb25zdCBlIG9mIHAudmFsdWVzKCkpIGggPSBNYXRoLm1pbihoLCBlKTsKICAgIGNvbnN0IHcgPSBoIDwgODAgPyA4MCAtIGggOiAwOwogICAgZm9yIChjb25zdCBlIG9mIGYpIHsKICAgICAgY29uc3QgbSA9IGwuZ2V0KGUpIHx8IFtdLCB5ID0gdC5nZXQoZSkgfHwgODA7CiAgICAgIGZvciAoY29uc3QgTSBvZiBtKSB7CiAgICAgICAgY29uc3QgeCA9IGEoTSksIEkgPSAocC5nZXQoTSkgPz8gODApICsgdywgTyA9IHsgaWQ6IE0sIHg6IG4gPyBJIDogeSwgeTogbiA/IHkgOiBJLCB3aWR0aDogeC53aWR0aCwgaGVpZ2h0OiB4LmhlaWdodCB9OwogICAgICAgIG8uY29udGFpbmVyc1tNXSA/IHJbTV0gPSBPIDogZFtNXSA9IE87CiAgICAgIH0KICAgIH0KICB9CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMobywgbCwgYSwgbikgewogICAgdmFyIHIsIGY7CiAgICBjb25zdCBkID0gKHQpID0+IGxbdF0gfHwgYVt0XTsKICAgIGZvciAoY29uc3QgdCBvZiBPYmplY3QudmFsdWVzKG8uZWRnZXMpKSB7CiAgICAgIGNvbnN0IHMgPSBkKHQuc291cmNlSWQpLCB1ID0gZCh0LnRhcmdldElkKTsKICAgICAgaWYgKCFzIHx8ICF1KSBjb250aW51ZTsKICAgICAgY29uc3QgYyA9IG8ubm9kZXNbdC5zb3VyY2VJZF0gfHwgby5jb250YWluZXJzW3Quc291cmNlSWRdLCBpID0gby5ub2Rlc1t0LnRhcmdldElkXSB8fCBvLmNvbnRhaW5lcnNbdC50YXJnZXRJZF0sIGcgPSB1LnggKyB1LndpZHRoIC8gMiAtIChzLnggKyBzLndpZHRoIC8gMiksIHAgPSB1LnkgKyB1LmhlaWdodCAvIDIgLSAocy55ICsgcy5oZWlnaHQgLyAyKSwgaCA9IE1hdGguYWJzKGcpID4gTWF0aC5hYnMocCkgKiAxLjI1LCB3ID0gKHIgPSBjID09IG51bGwgPyB2b2lkIDAgOiBjLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKChtKSA9PiBtLmlkID09PSB0LnNvdXJjZVBvcnRJZCk7CiAgICAgIHcgJiYgKCF3LnNpZGUgfHwgdy5zaWRlID09PSAiYXV0byIpICYmIChoID8gdy5zaWRlID0gZyA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IHcuc2lkZSA9IHAgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBlID0gKGYgPSBpID09IG51bGwgPyB2b2lkIDAgOiBpLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogZi5maW5kKChtKSA9PiBtLmlkID09PSB0LnRhcmdldFBvcnRJZCk7CiAgICAgIGUgJiYgKCFlLnNpZGUgfHwgZS5zaWRlID09PSAiYXV0byIpICYmIChoID8gZS5zaWRlID0gZyA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IGUuc2lkZSA9IHAgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KICBzdGF0aWMgZ2V0Q29udGFpbmVyRGVwdGhzKG8pIHsKICAgIGNvbnN0IGwgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBhID0gKG4pID0+IHsKICAgICAgdmFyIGY7CiAgICAgIGlmIChsLmhhcyhuKSkgcmV0dXJuIGwuZ2V0KG4pOwogICAgICBjb25zdCBkID0gKGYgPSBvLmNvbnRhaW5lcnNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBmLnBhcmVudElkOwogICAgICBpZiAoIWQgfHwgIW8uY29udGFpbmVyc1tkXSkKICAgICAgICByZXR1cm4gbC5zZXQobiwgMCksIDA7CiAgICAgIGNvbnN0IHIgPSAxICsgYShkKTsKICAgICAgcmV0dXJuIGwuc2V0KG4sIHIpLCByOwogICAgfTsKICAgIGZvciAoY29uc3QgbiBvZiBPYmplY3Qua2V5cyhvLmNvbnRhaW5lcnMpKQogICAgICBhKG4pOwogICAgcmV0dXJuIGw7CiAgfQp9CmNsYXNzIEYgewogIGFzeW5jIGV4ZWN1dGUobywgbCwgYSkgewogICAgY29uc3QgbiA9IE9iamVjdC52YWx1ZXMoby5jb250YWluZXJzKSwgZCA9IE9iamVjdC52YWx1ZXMoby5ub2RlcyksIHIgPSBuZXcgU2V0KAogICAgICBuLmZpbHRlcigoaSkgPT4gISFpLmNvbGxhcHNlZCkubWFwKChpKSA9PiBpLmlkKQogICAgKSwgZiA9IChpKSA9PiB7CiAgICAgIHZhciBwOwogICAgICBsZXQgZyA9IGk7CiAgICAgIGZvciAoOyBnOyApIHsKICAgICAgICBpZiAoci5oYXMoZykpIHJldHVybiAhMDsKICAgICAgICBnID0gKHAgPSBvLmNvbnRhaW5lcnNbZ10pID09IG51bGwgPyB2b2lkIDAgOiBwLnBhcmVudElkOwogICAgICB9CiAgICAgIHJldHVybiAhMTsKICAgIH0sIHQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yIChjb25zdCBbaSwgZ10gb2YgT2JqZWN0LmVudHJpZXMoby5ub2RlcykpCiAgICAgIGYoZy5wYXJlbnRJZCkgfHwgdC5hZGQoaSk7CiAgICBmb3IgKGNvbnN0IFtpLCBnXSBvZiBPYmplY3QuZW50cmllcyhvLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHAgPSBnOwogICAgICBwLmNvbGxhcHNlZCA/IGYocC5wYXJlbnRJZCkgfHwgdC5hZGQoaSkgOiAhKGQuc29tZSgodykgPT4gdy5wYXJlbnRJZCA9PT0gaSkgfHwgbi5zb21lKCh3KSA9PiB3LnBhcmVudElkID09PSBpKSkgJiYgIWYocC5wYXJlbnRJZCkgJiYgdC5hZGQoaSk7CiAgICB9CiAgICBjb25zdCBzID0gWC5kZWNvdXBsZShvLCB0KSwgdSA9IEIuYXNzaWduTGF5ZXJzKHMuYWxsRW50aXR5SWRzLCBzLmFkakxpc3QpLCBjID0gQS5taW5pbWl6ZUNyb3NzaW5ncyh1LCBzLmFkakxpc3QsIDQpOwogICAgcmV0dXJuIEwuYXNzaWduQ29vcmRpbmF0ZXMobywgYywgbCwgYSk7CiAgfQp9CmNvbnN0IF8gPSBuZXcgRigpOwpzZWxmLm9ubWVzc2FnZSA9IGFzeW5jIChFKSA9PiB7CiAgY29uc3QgeyBpZDogbywgZ3JhcGg6IGwsIG1lYXN1cmVtZW50czogYSwgb3B0aW9uczogbiB9ID0gRS5kYXRhOwogIHRyeSB7CiAgICBjb25zdCBkID0gbmV3IE1hcChhKSwgciA9IGF3YWl0IF8uZXhlY3V0ZShsLCBkLCBuKTsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogbywgc3VjY2VzczogITAsIGxheW91dDogciB9KTsKICB9IGNhdGNoIChkKSB7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IG8sIHN1Y2Nlc3M6ICExLCBlcnJvcjogZC5tZXNzYWdlIH0pOwogIH0KfTsK", Ot = (r) => Uint8Array.from(atob(r), (e) => e.charCodeAt(0)), mt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Ot(Gt)], { type: "text/javascript;charset=utf-8" });
function zt(r) {
  let e;
  try {
    if (e = mt && (self.URL || self.webkitURL).createObjectURL(mt), !e) throw "";
    const n = new Worker(e, {
      type: "module",
      name: r == null ? void 0 : r.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Gt,
      {
        type: "module",
        name: r == null ? void 0 : r.name
      }
    );
  }
}
class Ft {
  constructor() {
    It(this, "worker", null);
    It(this, "pendingRequests", /* @__PURE__ */ new Map());
    It(this, "fallbackEngine", new Qt());
    if (typeof Worker < "u")
      try {
        this.worker = new zt(), this.worker.onmessage = (e) => {
          const { id: n, success: C, layout: I, error: l } = e.data, c = this.pendingRequests.get(n);
          c && (this.pendingRequests.delete(n), C ? c.resolve(I) : c.reject(new Error(l)));
        }, this.worker.onerror = (e) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", e);
        };
      } catch (e) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", e), this.worker = null;
      }
  }
  execute(e, n, C) {
    return this.worker ? new Promise((I, l) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: I, reject: l });
      const a = Array.from(n.entries());
      this.worker.postMessage({
        id: c,
        graph: e,
        measurements: a,
        options: C
      });
    }) : this.fallbackEngine.execute(e, n, C);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class jt {
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: n, hoveredEntity: C, graph: I } = e;
    return C && C.id === n.id ? null : C && I.containers[C.id] ? n.parentId === C.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: n.id,
        newParentId: C.id
      }
    } : !C && n.parentId !== null && n.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: n.id,
        newParentId: null
      }
    } : null;
  }
}
class Ce {
  onDragEnd(e) {
    const { draggedEntity: n, hoveredEdge: C, hoveredEntity: I, graph: l } = e, c = (a) => {
      const g = l.nodes[a.id] || a;
      if (!g.ports || g.ports.length === 0) return "";
      const d = Object.values(l.edges).find((t) => t.targetId === a.id);
      if (d) {
        const t = g.ports.find((s) => s.id === d.targetPortId);
        if (t) return t.id;
      }
      const f = new Set(
        Object.values(l.edges).filter((t) => t.sourceId === a.id).map((t) => t.sourcePortId)
      ), u = g.ports.find((t) => !f.has(t.id));
      return u ? u.id : g.ports[0].id;
    };
    if (C)
      return C.sourceId === n.id || C.targetId === n.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: C.id,
          newSourceId: C.sourceId,
          newTargetId: n.id,
          newTargetPortId: c(n)
        }
      };
    if (I && I.id !== n.id) {
      const a = Object.values(l.edges).find(
        (g) => g.targetId === I.id && g.sourceId !== n.id
      );
      if (a)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: a.id,
            newSourceId: a.sourceId,
            newTargetId: n.id,
            newTargetPortId: c(n)
          }
        };
    }
    return null;
  }
}
function Jt(r, e = { min: 0.15, max: 3 }) {
  const [n, C] = O({ x: 80, y: 80, zoom: 1 }), I = J(!1), l = J({ x: 0, y: 0 }), c = v(
    (A, i) => {
      if (!r.current) return { x: A, y: i };
      const o = r.current.getBoundingClientRect();
      return {
        x: (A - o.left - n.x) / n.zoom,
        y: (i - o.top - n.y) / n.zoom
      };
    },
    [n, r]
  ), a = v(
    (A) => {
      if (!r.current) return;
      const i = [
        ...Object.values(A.nodes),
        ...Object.values(A.containers)
      ];
      if (i.length === 0) {
        C({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let o = 1 / 0, h = 1 / 0, B = -1 / 0, b = -1 / 0;
      for (const X of i)
        o = Math.min(o, X.x), h = Math.min(h, X.y), B = Math.max(B, X.x + X.width), b = Math.max(b, X.y + X.height);
      const w = r.current.getBoundingClientRect(), m = 80, P = Math.max(B - o, 100), K = Math.max(b - h, 100), Y = (w.width - m * 2) / P, E = (w.height - m * 2) / K, Z = Math.min(
        Math.max(Math.min(Y, E), e.min),
        Math.min(e.max, 1.25)
      ), W = (w.width - P * Z) / 2 - o * Z, S = (w.height - K * Z) / 2 - h * Z;
      C({
        x: W,
        y: S,
        zoom: Z
      });
    },
    [r, e]
  ), g = v(
    (A) => {
      if (A.preventDefault(), !!r.current)
        if (A.ctrlKey || A.metaKey) {
          const i = r.current.getBoundingClientRect(), o = A.clientX - i.left, h = A.clientY - i.top, B = A.deltaY < 0 ? 1.08 : 0.92, b = Math.min(Math.max(n.zoom * B, e.min), e.max), w = o - (o - n.x) * (b / n.zoom), m = h - (h - n.y) * (b / n.zoom);
          C({ x: w, y: m, zoom: b });
        } else
          C((i) => ({
            ...i,
            x: i.x - A.deltaX,
            y: i.y - A.deltaY
          }));
    },
    [n, e, r]
  ), d = v(
    (A, i) => {
      I.current = !0, l.current = { x: A - n.x, y: i - n.y };
    },
    [n]
  ), f = v((A, i) => {
    I.current && C((o) => ({
      ...o,
      x: A - l.current.x,
      y: i - l.current.y
    }));
  }, []), u = v(() => {
    I.current = !1;
  }, []), t = v(() => {
    C({ x: 80, y: 80, zoom: 1 });
  }, []), s = v(() => {
    C((A) => ({
      ...A,
      zoom: Math.min(A.zoom * 1.2, e.max)
    }));
  }, [e]), y = v(() => {
    C((A) => ({
      ...A,
      zoom: Math.max(A.zoom / 1.2, e.min)
    }));
  }, [e]);
  return {
    transform: n,
    setTransform: C,
    screenToWorld: c,
    onWheel: g,
    startPan: d,
    updatePan: f,
    endPan: u,
    resetTransform: t,
    zoomIn: s,
    zoomOut: y,
    zoomToFit: a,
    isPanning: I
  };
}
function $t(r) {
  const [e, n] = O(
    /* @__PURE__ */ new Map()
  );
  J(/* @__PURE__ */ new Map());
  const C = J(/* @__PURE__ */ new Map()), I = v((l, c) => {
    c ? C.current.set(l, c) : C.current.delete(l);
  }, []);
  return lt(() => {
    const l = new ResizeObserver((c) => {
      let a = !1;
      const g = new Map(e);
      for (const d of c) {
        const f = d.target.getAttribute("data-sysflow-measure-id");
        if (!f) continue;
        const u = Math.ceil(d.contentRect.width), t = Math.ceil(d.contentRect.height), s = g.get(f);
        (!s || s.width !== u || s.height !== t) && (g.set(f, { width: u, height: t }), a = !0);
      }
      a && n(g);
    });
    return C.current.forEach((c) => l.observe(c)), () => {
      l.disconnect();
    };
  }, [r]), { measurements: e, registerMeasureElement: I };
}
function Ut(r, e, n, C, I) {
  const [l, c] = O(null), [a, g] = O(null), d = J(null), f = J(null), u = v(
    (i, o) => {
      let h = null, B = 1 / 0;
      for (const [b, w] of Object.entries(e.containers))
        if (b !== o && i.x >= w.x && i.x <= w.x + w.width && i.y >= w.y && i.y <= w.y + w.height) {
          const m = w.width * w.height;
          m < B && (B = m, h = r.containers[b] || null);
        }
      if (h) return h;
      for (const [b, w] of Object.entries(e.nodes))
        if (b !== o && i.x >= w.x && i.x <= w.x + w.width && i.y >= w.y && i.y <= w.y + w.height)
          return r.nodes[b] || null;
      return null;
    },
    [e, r]
  ), t = v(
    (i, o) => {
      let h = null, B = 45;
      for (const b of Object.values(r.edges)) {
        if (b.sourceId === o || b.targetId === o) continue;
        const w = e.nodes[b.sourceId] || e.containers[b.sourceId], m = e.nodes[b.targetId] || e.containers[b.targetId];
        if (!w || !m) continue;
        const P = w.x + w.width, K = w.y + w.height / 2, Y = m.x, E = m.y + m.height / 2;
        for (let Z = 0; Z <= 10; Z++) {
          const W = Z / 10, S = (1 - W) * P + W * Y, X = (1 - W) * K + W * E, H = Math.hypot(i.x - S, i.y - X);
          H < B && (B = H, h = b);
        }
      }
      return h;
    },
    [e, r]
  ), s = v(
    (i, o) => {
      if (o.stopPropagation(), n.canDrag && !n.canDrag(i, r))
        return;
      const h = C(o.clientX, o.clientY);
      c({
        draggedEntity: i,
        ghostPosition: h
      });
    },
    [r, n, C]
  ), y = v(
    (i) => {
      if (!l) return;
      const o = C(i.clientX, i.clientY), h = u(o, l.draggedEntity.id), B = t(o, l.draggedEntity.id);
      d.current = h, f.current = B, h && r.containers[h.id] ? g(h.id) : g(null);
      const b = n.onDragMove ? n.onDragMove({
        draggedEntity: l.draggedEntity,
        cursorWorld: o,
        hoveredEntity: h,
        hoveredEdge: B,
        graph: r
      }) : o;
      b && c((w) => w ? { ...w, ghostPosition: b } : null);
    },
    [l, C, n, r, u, t]
  ), A = v(
    (i) => {
      if (!l) return;
      const o = C(i.clientX, i.clientY), h = u(o, l.draggedEntity.id), B = t(o, l.draggedEntity.id), b = n.onDragEnd({
        draggedEntity: l.draggedEntity,
        cursorWorld: o,
        hoveredEntity: h,
        hoveredEdge: B,
        graph: r
      });
      b && I(b), c(null), g(null), d.current = null, f.current = null;
    },
    [l, C, n, r, u, t, I]
  );
  return {
    dragState: l,
    hoveredContainerId: a,
    handlePointerDown: s,
    handlePointerMove: y,
    handlePointerUp: A
  };
}
function ce(r) {
  const [e, n] = O([r]), [C, I] = O(0), [l, c] = O(null), a = e[C], g = v((i) => {
    const o = Dt(i);
    n((h) => [...h.slice(0, C + 1), o]), I((h) => h + 1);
  }, [C]), d = v(() => {
    C > 0 && I((i) => i - 1);
  }, [C]), f = v(() => {
    C < e.length - 1 && I((i) => i + 1);
  }, [C, e.length]), u = v((i) => {
    var h, B, b, w;
    const o = e[C];
    if (i.type === "ENTITY_REPARENT") {
      const { entityId: m, newParentId: P } = i.payload, K = {
        ...o,
        nodes: { ...o.nodes },
        containers: { ...o.containers }
      };
      K.nodes[m] ? K.nodes[m] = { ...K.nodes[m], parentId: P } : K.containers[m] && (K.containers[m] = { ...K.containers[m], parentId: P }), g(K);
    } else if (i.type === "CONTAINER_TOGGLE_COLLAPSE") {
      const { containerId: m, collapsed: P } = i.payload;
      o.containers[m] && g({
        ...o,
        containers: {
          ...o.containers,
          [m]: { ...o.containers[m], collapsed: P }
        }
      });
    } else if (i.type === "EDGE_CREATE") {
      const m = i.payload.id || `E_${Date.now()}`;
      g({
        ...o,
        edges: {
          ...o.edges,
          [m]: { id: m, ...i.payload.edge }
        }
      });
    } else if (i.type === "EDGE_DELETE") {
      const m = { ...o.edges };
      delete m[i.payload.edgeId], g({ ...o, edges: m });
    } else if (i.type === "EDGE_REWIRE") {
      const { edgeId: m, newTargetId: P } = i.payload;
      if (!P || !o.edges[m]) return;
      const K = P, Y = o.edges[m], E = Y.targetId, Z = Object.values(o.edges).find((z) => z.targetId === K), W = Object.values(o.edges).find((z) => z.sourceId === K), S = { ...o.edges };
      Z && W && (S[Z.id] = { ...Z, targetId: W.targetId, targetPortId: W.targetPortId }, delete S[W.id]);
      const X = ((B = (h = o.nodes[K]) == null ? void 0 : h.ports[0]) == null ? void 0 : B.id) || "p_in", H = ((w = (b = o.nodes[K]) == null ? void 0 : b.ports.find((z) => z.id !== X)) == null ? void 0 : w.id) || X;
      S[m] = {
        ...Y,
        targetId: K,
        targetPortId: X
      };
      const Q = `REWIRE_${Date.now()}`;
      S[Q] = {
        id: Q,
        sourceId: K,
        sourcePortId: H,
        targetId: E,
        targetPortId: Y.targetPortId
      }, g({ ...o, edges: S });
    }
  }, [e, C, g]), t = v((i) => {
    const o = a.nodes[i] || a.containers[i];
    o && c({ entity: JSON.parse(JSON.stringify(o)), isCut: !1 });
  }, [a]), s = v((i) => {
    const o = a.nodes[i] || a.containers[i];
    if (o) {
      c({ entity: JSON.parse(JSON.stringify(o)), isCut: !0 });
      const h = { ...a.nodes }, B = { ...a.containers };
      delete h[i], delete B[i], g({ ...a, nodes: h, containers: B });
    }
  }, [a, g]), y = v(() => {
    if (!l) return;
    const i = l.entity, o = `${i.id}_copy_${Date.now().toString().slice(-4)}`, h = { ...i, id: o, label: `${i.label} (Copy)` };
    "collapsed" in h ? g({
      ...a,
      containers: { ...a.containers, [o]: h }
    }) : g({
      ...a,
      nodes: { ...a.nodes, [o]: h }
    });
  }, [l, a, g]), A = v((i) => {
    if (i.length === 0) return;
    const o = { ...a.nodes }, h = { ...a.containers }, B = { ...a.edges };
    for (const b of i)
      delete o[b], delete h[b], delete B[b];
    g({
      ...a,
      nodes: o,
      containers: h,
      edges: B
    });
  }, [a, g]);
  return {
    graph: a,
    setGraphDirect: g,
    applyAction: u,
    undo: d,
    redo: f,
    copyEntity: t,
    cutEntity: s,
    pasteEntity: y,
    deleteSelection: A,
    canUndo: C > 0,
    canRedo: C < e.length - 1
  };
}
const qt = ({
  graph: r,
  registerMeasureElement: e,
  nodeTypes: n,
  containerTypes: C
}) => {
  const I = Object.values(r.nodes), l = Object.values(r.containers);
  return /* @__PURE__ */ V("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((c) => {
      const a = c.type ? n == null ? void 0 : n[c.type] : null;
      return /* @__PURE__ */ L(
        "div",
        {
          ref: (g) => e(c.id, g),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: a ? /* @__PURE__ */ L(a, { node: c, selected: !1 }) : /* @__PURE__ */ V("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ L("div", { style: { fontWeight: 600 }, children: c.label }),
            c.ports.length > 0 && /* @__PURE__ */ V("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              c.ports.map((g) => g.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${c.id}`
      );
    }),
    l.map((c) => {
      const a = c.type ? C == null ? void 0 : C[c.type] : null;
      return /* @__PURE__ */ L(
        "div",
        {
          ref: (g) => e(c.id, g),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: a ? /* @__PURE__ */ L(a, { container: c, selected: !1 }) : /* @__PURE__ */ L("div", { className: "sysflow-container-header", children: c.label })
        },
        `measure-container-${c.id}`
      );
    })
  ] });
}, _t = ({
  graph: r,
  layout: e,
  selectedIds: n,
  direction: C = "TB",
  showArrows: I = !0,
  routing: l = "auto",
  portOptions: c,
  onEdgeClick: a
}) => {
  const g = l === "step" || l === "auto" && C === "LR", d = (t, s, y) => {
    var Y, E, Z, W;
    let A = t, i = null;
    for ((Y = r.containers[t]) != null && Y.collapsed && (i = r.containers[t]); A; ) {
      const S = ((E = r.nodes[A]) == null ? void 0 : E.parentId) ?? ((Z = r.containers[A]) == null ? void 0 : Z.parentId) ?? null;
      S && ((W = r.containers[S]) != null && W.collapsed) && (i = r.containers[S]), A = S;
    }
    if (i) {
      const S = e.containers[i.id];
      if (!S) return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: i.id };
      const X = C === "TB" ? y ? "bottom" : "top" : y ? "right" : "left", H = y ? S.x + S.width : S.x, Q = S.y + S.height / 2;
      return { x: H, y: Q, side: X, valid: !0, entityId: i.id };
    }
    if (!!r.containers[t]) {
      const S = e.containers[t];
      if (!S) return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: t };
      let X, H, Q;
      return C === "TB" ? (X = S.x + S.width / 2, H = y ? S.y + S.height : S.y, Q = y ? "bottom" : "top") : (X = y ? S.x + S.width : S.x, H = S.y + S.height / 2, Q = y ? "right" : "left"), { x: X, y: H, side: Q, valid: !0, entityId: t };
    }
    const h = r.nodes[t], B = e.nodes[t];
    if (!h || !B)
      return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: t };
    const w = At(
      h,
      B,
      C,
      r.edges,
      c
    ).get(s);
    if (w)
      return { x: w.worldX, y: w.worldY, side: w.side, valid: !0, entityId: t };
    let m, P, K;
    return C === "TB" ? (m = B.x + B.width / 2, P = y ? B.y + B.height : B.y, K = y ? "bottom" : "top") : (m = y ? B.x + B.width : B.x, P = B.y + B.height / 2, K = y ? "right" : "left"), { x: m, y: P, side: K, valid: !0, entityId: t };
  }, f = (t, s) => {
    const y = (t.x + s.x) / 2, A = (t.y + s.y) / 2;
    if (t.side === "right" && s.side === "left") {
      if (s.x >= t.x + 20)
        return `M ${t.x} ${t.y} L ${y} ${t.y} L ${y} ${s.y} L ${s.x} ${s.y}`;
      {
        const i = s.y >= t.y ? t.y - 40 : t.y + 40;
        return `M ${t.x} ${t.y} L ${t.x + 20} ${t.y} L ${t.x + 20} ${i} L ${s.x - 20} ${i} L ${s.x - 20} ${s.y} L ${s.x} ${s.y}`;
      }
    }
    if (t.side === "bottom" && s.side === "top") {
      if (s.y >= t.y + 16)
        return `M ${t.x} ${t.y} L ${t.x} ${A} L ${s.x} ${A} L ${s.x} ${s.y}`;
      {
        const i = s.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${i} ${t.y + 20} L ${i} ${s.y - 20} L ${s.x} ${s.y - 20} L ${s.x} ${s.y}`;
      }
    }
    return `M ${t.x} ${t.y} L ${y} ${t.y} L ${y} ${s.y} L ${s.x} ${s.y}`;
  }, u = (t, s) => {
    const y = s.x - t.x, A = s.y - t.y;
    if (t.side === "bottom" && s.side === "top")
      if (A > 0) {
        const b = Math.min(28, A * 0.4), w = t.y + Math.max(b, A * 0.5), m = s.y - Math.max(b, A * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${w} ${s.x} ${m} ${s.x} ${s.y}`;
      } else {
        const b = y >= 0 ? 1 : -1, w = Math.max(40, Math.abs(y) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + w * b} ${t.y + 40} ${s.x + w * b} ${s.y - 40} ${s.x} ${s.y}`;
      }
    if (t.side === "right" && s.side === "left")
      if (y > 0) {
        const b = t.x + y * 0.5, w = s.x - y * 0.5;
        return `M ${t.x} ${t.y} C ${b} ${t.y} ${w} ${s.y} ${s.x} ${s.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x + 50} ${t.y - 50} ${s.x - 50} ${s.y - 50} ${s.x} ${s.y}`;
    const i = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      top: { x: 0, y: -1 },
      bottom: { x: 0, y: 1 }
    }, o = i[t.side] || { x: 0, y: 1 }, h = i[s.side] || { x: 0, y: -1 }, B = Math.min(60, Math.hypot(y, A) * 0.35);
    return `M ${t.x} ${t.y} C ${t.x + o.x * B} ${t.y + o.y * B} ${s.x + h.x * B} ${s.y + h.y * B} ${s.x} ${s.y}`;
  };
  return /* @__PURE__ */ V("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ V("defs", { children: [
      /* @__PURE__ */ L(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ L("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ L(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ L("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(r.edges).map((t) => {
      const s = d(t.sourceId, t.sourcePortId, !0), y = d(t.targetId, t.targetPortId, !1);
      if (!s.valid || !y.valid || s.entityId === y.entityId) return null;
      const A = n.includes(t.id), i = g ? f(s, y) : u(s, y);
      return /* @__PURE__ */ V("g", { style: { pointerEvents: "stroke" }, children: [
        /* @__PURE__ */ L(
          "path",
          {
            d: i,
            fill: "none",
            stroke: "transparent",
            strokeWidth: 14,
            onClick: (o) => {
              o.stopPropagation(), a == null || a(t.id);
            },
            style: { cursor: "pointer" }
          }
        ),
        /* @__PURE__ */ L(
          "path",
          {
            d: i,
            fill: "none",
            stroke: A ? "var(--sysflow-edge-selected)" : "var(--sysflow-edge-stroke)",
            strokeWidth: A ? 2.5 : 1.75,
            strokeLinejoin: "round",
            strokeLinecap: "round",
            markerEnd: I ? A ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
          }
        )
      ] }, t.id);
    })
  ] });
}, te = ({
  entity: r,
  layout: e,
  direction: n = "LR",
  edges: C,
  portOptions: I,
  onPortPointerDown: l,
  onPortPointerUp: c
}) => {
  if (!r.ports || r.ports.length === 0)
    return null;
  const a = At(
    r,
    e,
    n,
    C,
    I
  );
  return /* @__PURE__ */ L(Et, { children: r.ports.map((g) => {
    const d = a.get(g.id);
    return d ? /* @__PURE__ */ L(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${d.side}`,
        style: {
          position: "absolute",
          left: `${d.localX}px`,
          top: `${d.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${g.label} (${d.side})`,
        onPointerDown: (f) => {
          f.stopPropagation(), l == null || l(r.id, g.id, !0, f);
        },
        onPointerUp: (f) => {
          f.stopPropagation(), c == null || c(r.id, g.id, !1);
        }
      },
      g.id
    ) : null;
  }) });
}, ee = ({
  node: r,
  layout: e,
  selected: n = !1,
  direction: C = "LR",
  edges: I,
  portOptions: l,
  onPointerDown: c,
  onMouseEnter: a,
  onMouseLeave: g,
  onClick: d,
  onPortPointerDown: f,
  onPortPointerUp: u,
  customRenderer: t
}) => /* @__PURE__ */ V(
  "div",
  {
    className: `sysflow-node ${n ? "sysflow-selected" : ""} ${r.className || ""}`,
    style: {
      transform: `translate(${e.x}px, ${e.y}px)`,
      width: `${e.width}px`,
      height: `${e.height}px`
    },
    onPointerDown: (s) => c == null ? void 0 : c(r, s),
    onMouseEnter: () => a == null ? void 0 : a(r.id),
    onMouseLeave: () => g == null ? void 0 : g(r.id),
    onClick: d,
    children: [
      /* @__PURE__ */ L(
        te,
        {
          entity: r,
          layout: e,
          direction: C,
          edges: I,
          portOptions: l,
          onPortPointerDown: f,
          onPortPointerUp: u
        }
      ),
      t ? /* @__PURE__ */ L(t, { node: r, selected: n }) : /* @__PURE__ */ V("div", { style: { padding: "10px 14px" }, children: [
        /* @__PURE__ */ L("div", { style: { fontWeight: 600, fontSize: "13px" }, children: r.label }),
        r.ports.length > 0 && /* @__PURE__ */ V("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
          r.ports.length,
          " Port",
          r.ports.length > 1 ? "s" : ""
        ] })
      ] })
    ]
  }
), ge = ({
  container: r,
  layout: e,
  selected: n,
  isHovered: C = !1,
  onToggleCollapse: I,
  onPointerDown: l,
  onMouseEnter: c,
  onMouseLeave: a,
  onClick: g,
  customRenderer: d
}) => /* @__PURE__ */ L(
  "div",
  {
    className: `sysflow-container ${n ? "sysflow-selected" : ""} ${C ? "sysflow-hovered" : ""} ${r.className || ""}`,
    style: {
      transform: `translate(${e.x}px, ${e.y}px)`,
      width: `${e.width}px`,
      height: `${e.height}px`
    },
    onPointerDown: (f) => l(r, f),
    onMouseEnter: c,
    onMouseLeave: a,
    onClick: g,
    children: d ? /* @__PURE__ */ L(d, { container: r, selected: n }) : /* @__PURE__ */ V("div", { className: "sysflow-container-header", children: [
      /* @__PURE__ */ L(
        "span",
        {
          className: "sysflow-container-title",
          title: r.label,
          children: r.label
        }
      ),
      /* @__PURE__ */ L(
        "button",
        {
          className: "sysflow-collapse-btn",
          onClick: (f) => {
            f.stopPropagation(), I(r.id, !r.collapsed);
          },
          children: r.collapsed ? "Expand ⊞" : "Collapse ⊟"
        }
      )
    ] })
  }
), oe = new jt(), re = ({
  graph: r,
  onChange: e,
  layoutEngine: n,
  interactionStrategy: C = oe,
  direction: I = "TB",
  layoutOptions: l,
  portPlacementMode: c,
  routing: a,
  showEdgeArrows: g = !0,
  nodeTypes: d,
  containerTypes: f,
  zoomBounds: u,
  className: t = "",
  selectedIds: s = [],
  theme: y = "dark"
}) => {
  var ht, yt;
  const A = J(null), i = J(null);
  !n && !i.current && (i.current = new Ft());
  const o = n || i.current, {
    transform: h,
    screenToWorld: B,
    onWheel: b,
    startPan: w,
    updatePan: m,
    endPan: P,
    resetTransform: K,
    zoomIn: Y,
    zoomOut: E,
    zoomToFit: Z,
    isPanning: W
  } = Jt(A, u), { measurements: S, registerMeasureElement: X } = $t(r), [H, Q] = O({ nodes: {}, containers: {} }), z = vt(() => ({
    direction: I,
    mode: c ?? (I === "TB" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: H.nodes
  }), [I, c, H.nodes]), [R, et] = O(null), [N, gt] = O(null), it = J(!1), {
    dragState: $,
    hoveredContainerId: Kt,
    handlePointerDown: ut,
    handlePointerMove: pt,
    handlePointerUp: St
  } = Ut(r, H, C, B, e);
  lt(() => {
    const G = (p) => {
      if (p.target instanceof HTMLInputElement || p.target instanceof HTMLTextAreaElement)
        return;
      if (p.key === "Escape") {
        p.preventDefault(), gt(null), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (p.code === "Space" && (it.current = !0), p.key.toLowerCase() === "f" && !p.ctrlKey && !p.metaKey) {
        p.preventDefault(), Z(H);
        return;
      }
      if ((p.ctrlKey || p.metaKey) && p.key.toLowerCase() === "a") {
        p.preventDefault();
        const M = [
          ...Object.keys(r.nodes),
          ...Object.keys(r.containers)
        ];
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: M } });
        return;
      }
      const x = Object.keys(r.nodes);
      if (x.length !== 0) {
        if (p.key === "Tab") {
          p.preventDefault();
          const M = s.length > 0 ? x.indexOf(s[0]) : -1;
          let D;
          p.shiftKey ? D = M <= 0 ? x.length - 1 : M - 1 : D = (M + 1) % x.length, e({ type: "SELECTION_CHANGE", payload: { selectedIds: [x[D]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(p.key)) {
          p.preventDefault();
          const M = s[0] || x[0], D = H.nodes[M] || H.containers[M];
          if (!D) return;
          const U = {
            x: D.x + D.width / 2,
            y: D.y + D.height / 2
          };
          let T = null, ot = 1 / 0;
          for (const Ct of x) {
            if (Ct === M) continue;
            const _ = H.nodes[Ct];
            if (!_) continue;
            const ft = {
              x: _.x + _.width / 2,
              y: _.y + _.height / 2
            }, ct = ft.x - U.x, rt = ft.y - U.y;
            let tt = !1;
            if (p.key === "ArrowRight" && ct > 20 && (tt = !0), p.key === "ArrowLeft" && ct < -20 && (tt = !0), p.key === "ArrowDown" && rt > 20 && (tt = !0), p.key === "ArrowUp" && rt < -20 && (tt = !0), tt) {
              const Bt = Math.hypot(ct, rt);
              Bt < ot && (ot = Bt, T = Ct);
            }
          }
          T && e({ type: "SELECTION_CHANGE", payload: { selectedIds: [T] } });
        }
      }
    }, k = (p) => {
      p.code === "Space" && (it.current = !1);
    };
    return window.addEventListener("keydown", G), window.addEventListener("keyup", k), () => {
      window.removeEventListener("keydown", G), window.removeEventListener("keyup", k);
    };
  }, [r, H, s, Z, e]), lt(() => {
    let G = !1, k = 16 / 9;
    if (A.current) {
      const x = A.current.getBoundingClientRect();
      x.width > 0 && x.height > 0 && (k = x.width / x.height);
    }
    const p = {
      direction: I,
      aspectRatio: k,
      ...l
    };
    return o.execute(r, S, p).then((x) => {
      G || Q(x);
    }), () => {
      G = !0;
    };
  }, [r, S, o, I, l]);
  const Zt = (G, k, p, x) => {
    const M = r.nodes[G] || r.containers[G], D = H.nodes[G] || H.containers[G];
    if (!M || !D) return;
    const T = At(
      M,
      D,
      I,
      r.edges,
      z
    ).get(k), ot = T ? { x: T.worldX, y: T.worldY } : { x: D.x + D.width, y: D.y + D.height / 2 };
    et({
      sourceId: G,
      sourcePortId: k,
      startWorldPos: ot,
      currentWorldPos: B(x.clientX, x.clientY)
    });
  }, Pt = (G, k, p) => {
    R && !p && R.sourceId !== G && e({
      type: "EDGE_CREATE",
      payload: {
        edge: {
          sourceId: R.sourceId,
          sourcePortId: R.sourcePortId,
          targetId: G,
          targetPortId: k
        }
      }
    }), et(null);
  }, Lt = (G) => {
    if (G.button === 1 || it.current) {
      w(G.clientX, G.clientY);
      return;
    }
    const k = G.target, p = k === A.current || k.classList.contains("sysflow-viewport") || k.classList.contains("sysflow-dom-layer") || k.tagName.toLowerCase() === "svg";
    if (G.button === 0 && p) {
      G.currentTarget.setPointerCapture(G.pointerId);
      const x = B(G.clientX, G.clientY);
      gt({
        startX: x.x,
        startY: x.y,
        currentX: x.x,
        currentY: x.y
      }), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, kt = (G) => {
    if (W.current)
      m(G.clientX, G.clientY);
    else if (N) {
      const k = B(G.clientX, G.clientY);
      gt((p) => p ? { ...p, currentX: k.x, currentY: k.y } : null);
    } else $ ? pt(G) : R && et(
      (k) => k ? { ...k, currentWorldPos: B(G.clientX, G.clientY) } : null
    );
  }, Yt = (G) => {
    if (G.currentTarget.hasPointerCapture(G.pointerId) && G.currentTarget.releasePointerCapture(G.pointerId), W.current && P(), N) {
      const k = Math.min(N.startX, N.currentX), p = Math.min(N.startY, N.currentY), x = Math.max(N.startX, N.currentX), M = Math.max(N.startY, N.currentY);
      if (x - k > 4 || M - p > 4) {
        const D = [];
        for (const [U, T] of Object.entries(H.nodes))
          T.x < x && T.x + T.width > k && T.y < M && T.y + T.height > p && D.push(U);
        for (const [U, T] of Object.entries(H.containers))
          T.x < x && T.x + T.width > k && T.y < M && T.y + T.height > p && D.push(U);
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: D } });
      }
      gt(null);
    }
    $ && St(G), R && et(null);
  }, xt = Object.values(r.containers);
  return /* @__PURE__ */ V(
    "div",
    {
      ref: A,
      className: `sysflow-canvas ${y === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${t}`,
      "data-theme": y,
      onWheel: b,
      onPointerDown: Lt,
      onPointerMove: kt,
      onPointerUp: Yt,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ L(
          qt,
          {
            graph: r,
            registerMeasureElement: X,
            nodeTypes: d,
            containerTypes: f
          }
        ),
        /* @__PURE__ */ V("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ L("button", { onClick: Y, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ L("button", { onClick: E, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ V("button", { onClick: K, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(h.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ V(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${h.x}px, ${h.y}px) scale(${h.zoom})`
            },
            children: [
              N && /* @__PURE__ */ L(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(N.startX, N.currentX)}px`,
                    top: `${Math.min(N.startY, N.currentY)}px`,
                    width: `${Math.abs(N.currentX - N.startX)}px`,
                    height: `${Math.abs(N.currentY - N.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              /* @__PURE__ */ L(
                _t,
                {
                  graph: r,
                  layout: H,
                  selectedIds: s,
                  direction: I,
                  showArrows: g,
                  routing: a,
                  portOptions: z,
                  onEdgeClick: (G) => e({ type: "SELECTION_CHANGE", payload: { selectedIds: [G] } })
                }
              ),
              R && /* @__PURE__ */ L("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ L(
                "line",
                {
                  x1: R.startWorldPos.x,
                  y1: R.startWorldPos.y,
                  x2: R.currentWorldPos.x,
                  y2: R.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ V("div", { className: "sysflow-dom-layer", children: [
                xt.map((G) => {
                  const k = H.containers[G.id];
                  return k ? /* @__PURE__ */ L(
                    ge,
                    {
                      container: G,
                      layout: k,
                      selected: s.includes(G.id),
                      isHovered: Kt === G.id,
                      customRenderer: G.type ? f == null ? void 0 : f[G.type] : void 0,
                      onToggleCollapse: (p, x) => e({
                        type: "CONTAINER_TOGGLE_COLLAPSE",
                        payload: { containerId: p, collapsed: x }
                      }),
                      onPointerDown: ut,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (p) => {
                        p.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                      }
                    },
                    G.id
                  ) : null;
                }),
                Object.values(r.nodes).map((G) => {
                  const k = H.nodes[G.id];
                  return k ? /* @__PURE__ */ L(
                    ee,
                    {
                      node: G,
                      layout: k,
                      direction: I,
                      edges: r.edges,
                      portOptions: z,
                      selected: s.includes(G.id),
                      customRenderer: G.type ? d == null ? void 0 : d[G.type] : void 0,
                      onPointerDown: ut,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (p) => {
                        p.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                      },
                      onPortPointerDown: Zt,
                      onPortPointerUp: Pt
                    },
                    G.id
                  ) : null;
                })
              ] }),
              $ && /* @__PURE__ */ L(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${$.ghostPosition.x}px, ${$.ghostPosition.y}px)`,
                    width: `${((ht = S.get($.draggedEntity.id)) == null ? void 0 : ht.width) || 200}px`,
                    height: `${((yt = S.get($.draggedEntity.id)) == null ? void 0 : yt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ L("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: $.draggedEntity.label })
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
  Ce as EdgeRewireStrategy,
  ge as GraphContainer,
  _t as GraphEdgeLayer,
  ee as GraphNode,
  te as GraphPortLayer,
  jt as ReparentStrategy,
  Qt as SugiyamaEngine,
  re as SysFlowCanvas,
  Ft as WorkerBridge,
  At as computeEntityPortLocations,
  Dt as pruneDanglingEdges,
  Jt as useCanvasTransform,
  Ut as useDragGesture,
  ce as useGraphHistory,
  $t as useMeasurement
};
