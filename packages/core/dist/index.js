var ee = Object.defineProperty;
var ge = (d, e, C) => e in d ? ee(d, e, { enumerable: !0, configurable: !0, writable: !0, value: C }) : d[e] = C;
var Pt = (d, e, C) => ge(d, typeof e != "symbol" ? e + "" : e, C);
import { useState as et, useRef as Ct, useCallback as R, useEffect as Yt, useMemo as Ie } from "react";
import { jsxs as J, jsx as H, Fragment as Dt } from "react/jsx-runtime";
function oe(d, e, C, i) {
  const I = (r) => {
    const c = C.find(
      (A) => A.sourceId === e && A.sourcePortId === r || A.targetId === e && A.targetPortId === r
    );
    if (!c) return null;
    const l = c.sourceId === e ? c.targetId : c.sourceId, s = i[l];
    return s ? { x: s.x + s.width / 2, y: s.y + s.height / 2 } : null;
  };
  ["left", "right"].forEach((r) => {
    d[r].sort((c, l) => {
      var y, h;
      const s = ((y = I(c.id)) == null ? void 0 : y.y) ?? 0, A = ((h = I(l.id)) == null ? void 0 : h.y) ?? 0;
      return s - A;
    });
  }), ["top", "bottom"].forEach((r) => {
    d[r].sort((c, l) => {
      var y, h;
      const s = ((y = I(c.id)) == null ? void 0 : y.x) ?? 0, A = ((h = I(l.id)) == null ? void 0 : h.x) ?? 0;
      return s - A;
    });
  });
}
function se(d, e, C, i, I, r) {
  if (!I || !r)
    return C ? "left" : "right";
  const c = i.find(
    (h) => C ? h.targetId === d && h.targetPortId === e : h.sourceId === d && h.sourcePortId === e
  );
  if (!c) return C ? "left" : "right";
  const l = C ? c.sourceId : c.targetId, s = I[l];
  if (!s) return C ? "left" : "right";
  const A = s.x + s.width / 2 - (r.x + r.width / 2), y = s.y + s.height / 2 - (r.y + r.height / 2);
  return Math.abs(A) > Math.abs(y) ? A > 0 ? "right" : "left" : y > 0 ? "bottom" : "top";
}
function Tt(d, e, C = "LR", i, I) {
  const r = /* @__PURE__ */ new Map();
  if (!d || !e || !d.ports || d.ports.length === 0)
    return r;
  const c = (I == null ? void 0 : I.direction) || C, l = c === "TB" || c === "BT", s = (I == null ? void 0 : I.mode) || (l ? "strict-flow" : "perimeter-optimized"), A = i ? Array.isArray(i) ? i : Object.values(i) : [], y = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, h = new Set(
    A.filter((g) => g.targetId === d.id).map((g) => g.targetPortId)
  );
  new Set(
    A.filter((g) => g.sourceId === d.id).map((g) => g.sourcePortId)
  ), d.ports.forEach((g) => {
    let a = g.side || "auto";
    if (a !== "auto") {
      y[a].push(g);
      return;
    }
    if (s === "strict-flow") {
      const u = h.has(g.id) || g.label.toLowerCase().includes("in");
      switch (c) {
        case "BT":
          a = u ? "bottom" : "top";
          break;
        case "TB":
          a = u ? "top" : "bottom";
          break;
        case "RL":
          a = u ? "right" : "left";
          break;
        case "LR":
        default:
          a = u ? "left" : "right";
          break;
      }
    } else
      a = se(
        d.id,
        g.id,
        h.has(g.id),
        A,
        I == null ? void 0 : I.nodeLayouts,
        e
      );
    y[a].push(g);
  }), s === "perimeter-optimized" && (I != null && I.nodeLayouts) && oe(y, d.id, A, I.nodeLayouts);
  const t = (g, a) => {
    const u = g.length;
    g.forEach((n, o) => {
      let f = 0, B = 0;
      a === "left" || a === "right" ? (B = e.height / (u + 1) * (o + 1), f = a === "left" ? 0 : e.width) : (f = e.width / (u + 1) * (o + 1), B = a === "top" ? 0 : e.height), r.set(n.id, {
        portId: n.id,
        side: a,
        localX: f,
        localY: B,
        worldX: e.x + f,
        worldY: e.y + B
      });
    });
  };
  return t(y.left, "left"), t(y.right, "right"), t(y.top, "top"), t(y.bottom, "bottom"), r;
}
function ne(d) {
  const e = {}, C = (i) => {
    var r;
    const I = d.nodes[i];
    return new Set(((r = I == null ? void 0 : I.ports) == null ? void 0 : r.map((c) => c.id)) || []);
  };
  for (const [i, I] of Object.entries(d.edges)) {
    const r = C(I.sourceId), c = C(I.targetId), l = r.has(I.sourcePortId), s = c.has(I.targetPortId);
    l && s && (e[i] = I);
  }
  return {
    ...d,
    edges: e
  };
}
class Ce {
  static decouple(e, C) {
    const i = /* @__PURE__ */ new Map();
    for (const A of C)
      i.set(A, /* @__PURE__ */ new Set());
    const I = Object.values(e.edges);
    for (const A of I)
      C.has(A.sourceId) && C.has(A.targetId) && i.get(A.sourceId).add(A.targetId);
    const r = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), s = (A) => {
      r.add(A), c.add(A);
      const y = Array.from(i.get(A) || []);
      for (const h of y)
        r.has(h) ? c.has(h) && (i.get(A).delete(h), i.get(h).add(A), l.add(`${A}->${h}`)) : s(h);
      c.delete(A);
    };
    for (const A of C)
      r.has(A) || s(A);
    return {
      adjList: i,
      reversedEdges: l,
      allEntityIds: Array.from(C)
    };
  }
}
class ie {
  static assignLayers(e, C) {
    const i = /* @__PURE__ */ new Map();
    for (const s of e)
      i.set(s, 0);
    for (const [, s] of C.entries())
      for (const A of s)
        i.set(A, (i.get(A) || 0) + 1);
    const I = /* @__PURE__ */ new Map(), r = [];
    for (const s of e)
      (i.get(s) || 0) === 0 && (I.set(s, 0), r.push(s));
    const c = /* @__PURE__ */ new Set();
    for (; r.length > 0; ) {
      const s = r.shift();
      c.add(s);
      const A = I.get(s) || 0, y = C.get(s) || /* @__PURE__ */ new Set();
      for (const h of y) {
        const t = I.get(h) ?? 0;
        I.set(h, Math.max(t, A + 1)), i.set(h, (i.get(h) || 1) - 1), i.get(h) === 0 && r.push(h);
      }
    }
    for (const s of e)
      I.has(s) || I.set(s, 0);
    const l = /* @__PURE__ */ new Map();
    for (const [s, A] of I.entries())
      l.has(A) || l.set(A, []), l.get(A).push(s);
    return l;
  }
}
class nt {
  static minimizeCrossings(e, C, i = 4, I) {
    const r = Array.from(e.keys()).sort((s, A) => s - A);
    if (r.length <= 1) return e;
    const c = /* @__PURE__ */ new Map();
    for (const [s, A] of C.entries())
      for (const y of A)
        c.has(y) || c.set(y, /* @__PURE__ */ new Set()), c.get(y).add(s);
    const l = /* @__PURE__ */ new Map();
    for (const [s, A] of e.entries())
      l.set(s, [...A]);
    for (let s = 0; s < i; s++) {
      for (let A = 1; A < r.length; A++) {
        const y = l.get(r[A - 1]), h = l.get(r[A]), t = /* @__PURE__ */ new Map();
        y.forEach((g, a) => t.set(g, a)), nt.sortLayerNodes(h, c, t, I);
      }
      for (let A = r.length - 2; A >= 0; A--) {
        const y = l.get(r[A + 1]), h = l.get(r[A]), t = /* @__PURE__ */ new Map();
        y.forEach((g, a) => t.set(g, a)), nt.sortLayerNodes(h, C, t, I);
      }
    }
    return l;
  }
  static sortLayerNodes(e, C, i, I) {
    var A, y, h;
    if (!I || Object.keys(I.containers).length === 0) {
      e.sort((t, g) => {
        const a = nt.getBarycenter(t, C, i), u = nt.getBarycenter(g, C, i);
        return a - u;
      });
      return;
    }
    const r = /* @__PURE__ */ new Map();
    for (const t of e)
      r.set(t, nt.getBarycenter(t, C, i));
    const c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
    for (const t of e) {
      const g = r.get(t) ?? 0;
      let a = ((A = I.nodes[t]) == null ? void 0 : A.parentId) ?? ((y = I.containers[t]) == null ? void 0 : y.parentId);
      for (; a; )
        c.set(a, (c.get(a) || 0) + g), l.set(a, (l.get(a) || 0) + 1), a = (h = I.containers[a]) == null ? void 0 : h.parentId;
    }
    const s = (t) => {
      if (I.containers[t]) {
        const g = l.get(t) || 0;
        return g === 0 ? 0 : (c.get(t) || 0) / g;
      }
      return r.get(t) ?? 0;
    };
    e.sort((t, g) => {
      const a = nt.getAncestorPath(t, I), u = nt.getAncestorPath(g, I);
      let n = 0;
      for (; n < a.length && n < u.length && a[n] === u[n]; )
        n++;
      const o = a[n] ?? t, f = u[n] ?? g, B = s(o) - s(f);
      return Math.abs(B) > 1e-5 ? B : o.localeCompare(f);
    });
  }
  static getAncestorPath(e, C) {
    var r, c, l;
    const i = [e];
    let I = ((r = C.nodes[e]) == null ? void 0 : r.parentId) ?? ((c = C.containers[e]) == null ? void 0 : c.parentId);
    for (; I; )
      i.unshift(I), I = (l = C.containers[I]) == null ? void 0 : l.parentId;
    return i;
  }
  static getBarycenter(e, C, i) {
    const I = C.get(e);
    if (!I || I.size === 0) return 0;
    let r = 0, c = 0;
    for (const l of I)
      i.has(l) && (r += i.get(l), c++);
    return c === 0 ? 0 : r / c;
  }
}
const st = 32, kt = 24, ut = 22, ct = 18, rt = 38, wt = 210, Ht = 36, de = 180, ce = 54, Wt = 260, Xt = 160;
class It {
  static assignCoordinates(e, C, i, I = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const r = I.direction ?? "TB", c = r === "TB" || r === "BT", l = r === "BT" || r === "RL", s = I.aspectRatio ?? 1.55, A = Object.keys(e.containers).length, y = I.mode && I.mode !== "auto" ? I.mode : A > 0 ? "concurrent" : "flow", h = {}, t = {}, g = (a) => {
      var o, f, B, b, m;
      const u = !!e.containers[a], n = !!((o = e.containers[a]) != null && o.collapsed);
      return u && n ? { width: wt, height: Ht } : u && !n ? {
        width: ((f = i.get(a)) == null ? void 0 : f.width) || Wt,
        height: ((B = i.get(a)) == null ? void 0 : B.height) || Xt
      } : {
        width: ((b = i.get(a)) == null ? void 0 : b.width) || de,
        height: ((m = i.get(a)) == null ? void 0 : m.height) || ce
      };
    };
    return y === "concurrent" ? It.layoutConcurrentHierarchy(
      e,
      g,
      s,
      h,
      t
    ) : It.layoutFlowTree(
      e,
      C,
      g,
      c,
      l,
      I,
      h,
      t
    ), It.assignDynamicPortSides(e, h, t), { nodes: h, containers: t };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(e, C, i, I, r) {
    var a;
    const c = /* @__PURE__ */ new Map();
    for (const [u, n] of Object.entries(e.nodes)) {
      const o = n.parentId ?? null;
      c.has(o) || c.set(o, []), c.get(o).push(u);
    }
    for (const [u, n] of Object.entries(e.containers)) {
      const o = n.parentId ?? null;
      c.has(o) || c.set(o, []), c.get(o).push(u);
    }
    const l = It.getContainerDepths(e), s = Object.keys(e.containers).sort(
      (u, n) => (l.get(n) || 0) - (l.get(u) || 0)
    ), A = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map();
    for (const u of s) {
      if (!!((a = e.containers[u]) != null && a.collapsed)) {
        A.set(u, {
          width: wt,
          height: Ht
        });
        continue;
      }
      const o = c.get(u) || [];
      if (o.length === 0) {
        A.set(u, {
          width: wt,
          height: rt + ct * 2
        });
        continue;
      }
      const f = o.map((G) => {
        const N = A.has(G) ? A.get(G) : C(G);
        return { id: G, width: N.width, height: N.height };
      }), B = It.findBestTightPacking(f, i);
      for (const G of B.boxes)
        y.set(G.id, G);
      const b = Math.max(B.width + ut * 2, wt), m = B.height + rt + ct * 2;
      A.set(u, { width: b, height: m });
    }
    const h = c.get(null) || [];
    let t = [];
    if (h.length > 0) {
      const u = h.map((o) => {
        const f = A.get(o) || C(o);
        return { id: o, width: f.width, height: f.height };
      });
      t = It.findBestTightPacking(u, i).boxes.map((o) => ({
        ...o,
        localX: o.localX + 60,
        localY: o.localY + 60
      }));
    }
    const g = (u, n, o, f, B) => {
      var G;
      const b = !!e.containers[u], m = { id: u, x: n, y: o, width: f, height: B };
      if (b) {
        if (r[u] = m, (G = e.containers[u]) != null && G.collapsed) return;
        const N = n + ut, k = o + rt + ct, X = c.get(u) || [];
        for (const F of X) {
          const Y = y.get(F);
          Y && g(
            F,
            N + Y.localX,
            k + Y.localY,
            Y.width,
            Y.height
          );
        }
      } else
        I[u] = m;
    };
    for (const u of t)
      g(u.id, u.localX, u.localY, u.width, u.height);
  }
  static findBestTightPacking(e, C) {
    if (e.length === 1)
      return {
        width: e[0].width,
        height: e[0].height,
        boxes: [{ id: e[0].id, localX: 0, localY: 0, width: e[0].width, height: e[0].height }],
        score: 0
      };
    const i = e.reduce((h, t) => h + t.width * t.height, 0), I = Math.max(...e.map((h) => h.width)), r = [...e].sort((h, t) => t.width - h.width), c = /* @__PURE__ */ new Set(), l = e.reduce((h, t) => h + t.width, 0) + (e.length - 1) * st;
    c.add(l), c.add(I);
    const s = Math.max(I, Math.sqrt(i * C));
    c.add(s), c.add(s * 0.85), c.add(s * 1.15);
    const A = Math.min(e.length, 6);
    for (let h = 2; h <= A; h++) {
      let t = 0;
      for (let g = 0; g < h && g < r.length; g++)
        t += r[g].width;
      t += (h - 1) * st, t >= I && c.add(t);
    }
    let y = null;
    for (const h of c) {
      const t = It.simulateSkylinePacking(e, h), g = t.width * t.height, a = Math.max(0, g - i), u = t.width / Math.max(1, t.height), n = Math.abs(Math.log(u / C)), o = a / i * 2 + n * 0.25;
      t.score = o, (!y || o < y.score) && (y = t);
    }
    return y;
  }
  static simulateSkylinePacking(e, C) {
    const i = [...e].sort((s, A) => A.height - s.height), I = [{ x: 0, width: C, y: 0 }], r = [];
    for (const s of i) {
      let A = 1 / 0, y = -1;
      for (let o = 0; o < I.length; o++) {
        if (I[o].x + s.width > C) continue;
        let B = 0, b = 0;
        for (let m = o; m < I.length && b < s.width; m++)
          B = Math.max(B, I[m].y), b += I[m].width;
        B < A && (A = B, y = o);
      }
      if (y === -1) {
        const o = Math.max(...I.map((B) => B.y)), f = o === 0 ? 0 : o + kt;
        r.push({
          id: s.id,
          localX: 0,
          localY: f,
          width: s.width,
          height: s.height
        }), I.length = 0, I.push({ x: 0, width: s.width + st, y: f + s.height }), C > s.width + st && I.push({
          x: s.width + st,
          width: C - (s.width + st),
          y: 0
        });
        continue;
      }
      const h = I[y].x, t = A === 0 ? 0 : A + kt;
      r.push({
        id: s.id,
        localX: h,
        localY: t,
        width: s.width,
        height: s.height
      });
      const g = s.width + st, a = t + s.height, u = { x: h, width: g, y: a }, n = [];
      for (const o of I)
        o.x + o.width <= h || o.x >= h + g ? n.push(o) : (o.x < h && n.push({ x: o.x, width: h - o.x, y: o.y }), o.x + o.width > h + g && n.push({
          x: h + g,
          width: o.x + o.width - (h + g),
          y: o.y
        }));
      n.push(u), n.sort((o, f) => o.x - f.x), I.length = 0, I.push(...n);
    }
    const c = Math.max(...r.map((s) => s.localX + s.width), 0), l = Math.max(...r.map((s) => s.localY + s.height), 0);
    return { width: c, height: l, boxes: r, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE WITH COMPOUND CONTAINER SUPPORT
  // ===========================================================================
  static layoutFlowTree(e, C, i, I, r, c, l, s) {
    var D;
    const A = Array.from(C.keys()).sort((w, Z) => w - Z), y = /* @__PURE__ */ new Map();
    let h = 80;
    const t = I ? rt + ct * 2 : ut * 2, g = (I ? kt * 1.5 : st * 1.5) + t, a = I ? st : kt, u = r ? [...A].reverse() : [...A];
    for (const w of u) {
      const Z = C.get(w) || [];
      let T = 0;
      for (const E of Z) {
        const L = i(E), W = I ? L.height : L.width;
        T = Math.max(T, W);
      }
      y.set(w, h), h += T + g;
    }
    const n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
    for (const w of Object.values(e.edges))
      n.has(w.targetId) || n.set(w.targetId, []), n.get(w.targetId).push(w.sourceId), o.has(w.sourceId) || o.set(w.sourceId, []), o.get(w.sourceId).push(w.targetId);
    const f = /* @__PURE__ */ new Map(), B = (w) => {
      var Z, T;
      return ((Z = e.nodes[w]) == null ? void 0 : Z.parentId) ?? ((T = e.containers[w]) == null ? void 0 : T.parentId) ?? null;
    };
    for (const w of A) {
      const Z = C.get(w) || [];
      let T = -1 / 0, E;
      for (const L of Z) {
        const W = i(L), v = I ? W.width : W.height, U = n.get(L) || [], z = B(L);
        let Q = a;
        E !== void 0 && E !== z && (Q = a + (I ? ut * 2 : rt + ct * 2));
        let j = null;
        if (U.length > 0) {
          const At = U.map((it) => {
            const ht = f.get(it);
            if (ht === void 0) return null;
            const Kt = i(it);
            return ht + (I ? Kt.width : Kt.height) / 2;
          }).filter((it) => it !== null);
          At.length > 0 && (j = At.reduce((it, ht) => it + ht, 0) / At.length);
        }
        let q = j !== null ? j - v / 2 : 80;
        q < T + Q && (q = T === -1 / 0 ? 80 : T + Q), f.set(L, q), T = q + v, E = z;
      }
    }
    for (let w = A.length - 1; w >= 0; w--) {
      const Z = A[w], T = C.get(Z) || [];
      for (const W of T) {
        const v = o.get(W) || [];
        if (v.length === 0) continue;
        const U = v.map((z) => {
          const Q = f.get(z);
          if (Q === void 0) return null;
          const j = i(z);
          return Q + (I ? j.width : j.height) / 2;
        }).filter((z) => z !== null);
        if (U.length > 0) {
          const z = U.reduce((q, At) => q + At, 0) / U.length, Q = i(W), j = I ? Q.width : Q.height;
          f.set(W, z - j / 2);
        }
      }
      let E = -1 / 0, L;
      for (const W of T) {
        const v = i(W), U = I ? v.width : v.height, z = B(W);
        let Q = a;
        L !== void 0 && L !== z && (Q = a + (I ? ut * 2 : rt + ct * 2));
        let j = f.get(W) ?? 80;
        j < E + Q && (j = E + Q, f.set(W, j)), E = j + U, L = z;
      }
    }
    let b = 1 / 0;
    for (const w of f.values()) b = Math.min(b, w);
    const m = b < 80 ? 80 - b : 0;
    for (const w of A) {
      const Z = C.get(w) || [], T = y.get(w) || 80;
      for (const E of Z) {
        const L = i(E), W = (f.get(E) ?? 80) + m, z = { id: E, x: I ? W : T, y: I ? T : W, width: L.width, height: L.height };
        e.containers[E] ? s[E] = z : l[E] = z;
      }
    }
    const G = It.getContainerDepths(e), N = Object.keys(e.containers).sort(
      (w, Z) => (G.get(Z) || 0) - (G.get(w) || 0)
    ), k = /* @__PURE__ */ new Map();
    for (const [w, Z] of Object.entries(e.nodes))
      Z.parentId && (k.has(Z.parentId) || k.set(Z.parentId, []), k.get(Z.parentId).push(w));
    for (const [w, Z] of Object.entries(e.containers))
      Z.parentId && (k.has(Z.parentId) || k.set(Z.parentId, []), k.get(Z.parentId).push(w));
    for (const w of N) {
      if ((D = e.containers[w]) != null && D.collapsed) {
        s[w] || (s[w] = {
          id: w,
          x: 80,
          y: 80,
          width: wt,
          height: Ht
        });
        continue;
      }
      const Z = k.get(w) || [], T = [];
      for (const E of Z) {
        const L = l[E] || s[E];
        L && T.push(L);
      }
      if (T.length === 0)
        s[w] || (s[w] = {
          id: w,
          x: 80,
          y: 80,
          width: Wt,
          height: Xt
        });
      else {
        let E = 1 / 0, L = -1 / 0, W = 1 / 0, v = -1 / 0;
        for (const q of T)
          E = Math.min(E, q.x), L = Math.max(L, q.x + q.width), W = Math.min(W, q.y), v = Math.max(v, q.y + q.height);
        const U = Math.max(L - E + ut * 2, wt), z = v - W + rt + ct * 2, Q = E - ut, j = W - rt - ct;
        s[w] = { id: w, x: Q, y: j, width: U, height: z };
      }
    }
    let X = 1 / 0, F = 1 / 0;
    for (const w of [...Object.values(l), ...Object.values(s)])
      X = Math.min(X, w.x), F = Math.min(F, w.y);
    const Y = 60, V = X < Y ? Y - X : 0, S = F < Y ? Y - F : 0;
    if (V !== 0 || S !== 0) {
      for (const w of Object.values(l))
        w.x += V, w.y += S;
      for (const w of Object.values(s))
        w.x += V, w.y += S;
    }
  }
  static assignDynamicPortSides(e, C, i) {
    var r, c;
    const I = (l) => C[l] || i[l];
    for (const l of Object.values(e.edges)) {
      const s = I(l.sourceId), A = I(l.targetId);
      if (!s || !A) continue;
      const y = e.nodes[l.sourceId] || e.containers[l.sourceId], h = e.nodes[l.targetId] || e.containers[l.targetId], t = A.x + A.width / 2 - (s.x + s.width / 2), g = A.y + A.height / 2 - (s.y + s.height / 2), a = Math.abs(t) > Math.abs(g) * 1.25, u = (r = y == null ? void 0 : y.ports) == null ? void 0 : r.find((o) => o.id === l.sourcePortId);
      u && (!u.side || u.side === "auto") && (a ? u.side = t >= 0 ? "right" : "left" : u.side = g >= 0 ? "bottom" : "top");
      const n = (c = h == null ? void 0 : h.ports) == null ? void 0 : c.find((o) => o.id === l.targetPortId);
      n && (!n.side || n.side === "auto") && (a ? n.side = t >= 0 ? "left" : "right" : n.side = g >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(e) {
    const C = /* @__PURE__ */ new Map(), i = (I) => {
      var l;
      if (C.has(I)) return C.get(I);
      const r = (l = e.containers[I]) == null ? void 0 : l.parentId;
      if (!r || !e.containers[r])
        return C.set(I, 0), 0;
      const c = 1 + i(r);
      return C.set(I, c), c;
    };
    for (const I of Object.keys(e.containers))
      i(I);
    return C;
  }
}
class re {
  async execute(e, C, i) {
    const I = Object.values(e.containers), r = Object.values(e.nodes), c = new Set(
      I.filter((t) => !!t.collapsed).map((t) => t.id)
    ), l = (t) => {
      var a;
      let g = t;
      for (; g; ) {
        if (c.has(g)) return !0;
        g = (a = e.containers[g]) == null ? void 0 : a.parentId;
      }
      return !1;
    }, s = /* @__PURE__ */ new Set();
    for (const [t, g] of Object.entries(e.nodes))
      l(g.parentId) || s.add(t);
    for (const [t, g] of Object.entries(e.containers)) {
      const a = g;
      a.collapsed ? l(a.parentId) || s.add(t) : !(r.some((n) => n.parentId === t) || I.some((n) => n.parentId === t)) && !l(a.parentId) && s.add(t);
    }
    const A = Ce.decouple(e, s), y = ie.assignLayers(A.allEntityIds, A.adjList), h = nt.minimizeCrossings(y, A.adjList, 4, e);
    return It.assignCoordinates(e, h, C, i);
  }
}
const Qt = "Y2xhc3Mgb3QgewogIHN0YXRpYyBkZWNvdXBsZShuLCBmKSB7CiAgICBjb25zdCByID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgcyBvZiBmKQogICAgICByLnNldChzLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgIGNvbnN0IHQgPSBPYmplY3QudmFsdWVzKG4uZWRnZXMpOwogICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgIGYuaGFzKHMuc291cmNlSWQpICYmIGYuaGFzKHMudGFyZ2V0SWQpICYmIHIuZ2V0KHMuc291cmNlSWQpLmFkZChzLnRhcmdldElkKTsKICAgIGNvbnN0IGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGUgPSAocykgPT4gewogICAgICBhLmFkZChzKSwgaC5hZGQocyk7CiAgICAgIGNvbnN0IHkgPSBBcnJheS5mcm9tKHIuZ2V0KHMpIHx8IFtdKTsKICAgICAgZm9yIChjb25zdCBpIG9mIHkpCiAgICAgICAgYS5oYXMoaSkgPyBoLmhhcyhpKSAmJiAoci5nZXQocykuZGVsZXRlKGkpLCByLmdldChpKS5hZGQocyksIGQuYWRkKGAke3N9LT4ke2l9YCkpIDogZShpKTsKICAgICAgaC5kZWxldGUocyk7CiAgICB9OwogICAgZm9yIChjb25zdCBzIG9mIGYpCiAgICAgIGEuaGFzKHMpIHx8IGUocyk7CiAgICByZXR1cm4gewogICAgICBhZGpMaXN0OiByLAogICAgICByZXZlcnNlZEVkZ2VzOiBkLAogICAgICBhbGxFbnRpdHlJZHM6IEFycmF5LmZyb20oZikKICAgIH07CiAgfQp9CmNsYXNzIGN0IHsKICBzdGF0aWMgYXNzaWduTGF5ZXJzKG4sIGYpIHsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgIHIuc2V0KGUsIDApOwogICAgZm9yIChjb25zdCBbLCBlXSBvZiBmLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIGUpCiAgICAgICAgci5zZXQocywgKHIuZ2V0KHMpIHx8IDApICsgMSk7CiAgICBjb25zdCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYSA9IFtdOwogICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgIChyLmdldChlKSB8fCAwKSA9PT0gMCAmJiAodC5zZXQoZSwgMCksIGEucHVzaChlKSk7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyBhLmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBlID0gYS5zaGlmdCgpOwogICAgICBoLmFkZChlKTsKICAgICAgY29uc3QgcyA9IHQuZ2V0KGUpIHx8IDAsIHkgPSBmLmdldChlKSB8fCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICBmb3IgKGNvbnN0IGkgb2YgeSkgewogICAgICAgIGNvbnN0IG8gPSB0LmdldChpKSA/PyAwOwogICAgICAgIHQuc2V0KGksIE1hdGgubWF4KG8sIHMgKyAxKSksIHIuc2V0KGksIChyLmdldChpKSB8fCAxKSAtIDEpLCByLmdldChpKSA9PT0gMCAmJiBhLnB1c2goaSk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgZSBvZiBuKQogICAgICB0LmhhcyhlKSB8fCB0LnNldChlLCAwKTsKICAgIGNvbnN0IGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbZSwgc10gb2YgdC5lbnRyaWVzKCkpCiAgICAgIGQuaGFzKHMpIHx8IGQuc2V0KHMsIFtdKSwgZC5nZXQocykucHVzaChlKTsKICAgIHJldHVybiBkOwogIH0KfQpjbGFzcyBSIHsKICBzdGF0aWMgbWluaW1pemVDcm9zc2luZ3MobiwgZiwgciA9IDQsIHQpIHsKICAgIGNvbnN0IGEgPSBBcnJheS5mcm9tKG4ua2V5cygpKS5zb3J0KChlLCBzKSA9PiBlIC0gcyk7CiAgICBpZiAoYS5sZW5ndGggPD0gMSkgcmV0dXJuIG47CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW2UsIHNdIG9mIGYuZW50cmllcygpKQogICAgICBmb3IgKGNvbnN0IHkgb2YgcykKICAgICAgICBoLmhhcyh5KSB8fCBoLnNldCh5LCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKSwgaC5nZXQoeSkuYWRkKGUpOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtlLCBzXSBvZiBuLmVudHJpZXMoKSkKICAgICAgZC5zZXQoZSwgWy4uLnNdKTsKICAgIGZvciAobGV0IGUgPSAwOyBlIDwgcjsgZSsrKSB7CiAgICAgIGZvciAobGV0IHMgPSAxOyBzIDwgYS5sZW5ndGg7IHMrKykgewogICAgICAgIGNvbnN0IHkgPSBkLmdldChhW3MgLSAxXSksIGkgPSBkLmdldChhW3NdKSwgbyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgICAgeS5mb3JFYWNoKCh1LCB3KSA9PiBvLnNldCh1LCB3KSksIFIuc29ydExheWVyTm9kZXMoaSwgaCwgbywgdCk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgcyA9IGEubGVuZ3RoIC0gMjsgcyA+PSAwOyBzLS0pIHsKICAgICAgICBjb25zdCB5ID0gZC5nZXQoYVtzICsgMV0pLCBpID0gZC5nZXQoYVtzXSksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHkuZm9yRWFjaCgodSwgdykgPT4gby5zZXQodSwgdykpLCBSLnNvcnRMYXllck5vZGVzKGksIGYsIG8sIHQpOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gZDsKICB9CiAgc3RhdGljIHNvcnRMYXllck5vZGVzKG4sIGYsIHIsIHQpIHsKICAgIHZhciBzLCB5LCBpOwogICAgaWYgKCF0IHx8IE9iamVjdC5rZXlzKHQuY29udGFpbmVycykubGVuZ3RoID09PSAwKSB7CiAgICAgIG4uc29ydCgobywgdSkgPT4gewogICAgICAgIGNvbnN0IHcgPSBSLmdldEJhcnljZW50ZXIobywgZiwgciksIGcgPSBSLmdldEJhcnljZW50ZXIodSwgZiwgcik7CiAgICAgICAgcmV0dXJuIHcgLSBnOwogICAgICB9KTsKICAgICAgcmV0dXJuOwogICAgfQogICAgY29uc3QgYSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgbikKICAgICAgYS5zZXQobywgUi5nZXRCYXJ5Y2VudGVyKG8sIGYsIHIpKTsKICAgIGNvbnN0IGggPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBkID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgbyBvZiBuKSB7CiAgICAgIGNvbnN0IHUgPSBhLmdldChvKSA/PyAwOwogICAgICBsZXQgdyA9ICgocyA9IHQubm9kZXNbb10pID09IG51bGwgPyB2b2lkIDAgOiBzLnBhcmVudElkKSA/PyAoKHkgPSB0LmNvbnRhaW5lcnNbb10pID09IG51bGwgPyB2b2lkIDAgOiB5LnBhcmVudElkKTsKICAgICAgZm9yICg7IHc7ICkKICAgICAgICBoLnNldCh3LCAoaC5nZXQodykgfHwgMCkgKyB1KSwgZC5zZXQodywgKGQuZ2V0KHcpIHx8IDApICsgMSksIHcgPSAoaSA9IHQuY29udGFpbmVyc1t3XSkgPT0gbnVsbCA/IHZvaWQgMCA6IGkucGFyZW50SWQ7CiAgICB9CiAgICBjb25zdCBlID0gKG8pID0+IHsKICAgICAgaWYgKHQuY29udGFpbmVyc1tvXSkgewogICAgICAgIGNvbnN0IHUgPSBkLmdldChvKSB8fCAwOwogICAgICAgIHJldHVybiB1ID09PSAwID8gMCA6IChoLmdldChvKSB8fCAwKSAvIHU7CiAgICAgIH0KICAgICAgcmV0dXJuIGEuZ2V0KG8pID8/IDA7CiAgICB9OwogICAgbi5zb3J0KChvLCB1KSA9PiB7CiAgICAgIGNvbnN0IHcgPSBSLmdldEFuY2VzdG9yUGF0aChvLCB0KSwgZyA9IFIuZ2V0QW5jZXN0b3JQYXRoKHUsIHQpOwogICAgICBsZXQgcCA9IDA7CiAgICAgIGZvciAoOyBwIDwgdy5sZW5ndGggJiYgcCA8IGcubGVuZ3RoICYmIHdbcF0gPT09IGdbcF07ICkKICAgICAgICBwKys7CiAgICAgIGNvbnN0IGMgPSB3W3BdID8/IG8sIEkgPSBnW3BdID8/IHUsIE0gPSBlKGMpIC0gZShJKTsKICAgICAgcmV0dXJuIE1hdGguYWJzKE0pID4gMWUtNSA/IE0gOiBjLmxvY2FsZUNvbXBhcmUoSSk7CiAgICB9KTsKICB9CiAgc3RhdGljIGdldEFuY2VzdG9yUGF0aChuLCBmKSB7CiAgICB2YXIgYSwgaCwgZDsKICAgIGNvbnN0IHIgPSBbbl07CiAgICBsZXQgdCA9ICgoYSA9IGYubm9kZXNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyAoKGggPSBmLmNvbnRhaW5lcnNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKTsKICAgIGZvciAoOyB0OyApCiAgICAgIHIudW5zaGlmdCh0KSwgdCA9IChkID0gZi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogZC5wYXJlbnRJZDsKICAgIHJldHVybiByOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihuLCBmLCByKSB7CiAgICBjb25zdCB0ID0gZi5nZXQobik7CiAgICBpZiAoIXQgfHwgdC5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBhID0gMCwgaCA9IDA7CiAgICBmb3IgKGNvbnN0IGQgb2YgdCkKICAgICAgci5oYXMoZCkgJiYgKGEgKz0gci5nZXQoZCksIGgrKyk7CiAgICByZXR1cm4gaCA9PT0gMCA/IDAgOiBhIC8gaDsKICB9Cn0KY29uc3QgayA9IDMyLCBRID0gMjQsIEwgPSAyMiwgRyA9IDE4LCBXID0gMzgsIHEgPSAyMTAsIFYgPSAzNiwgaXQgPSAxODAsIHJ0ID0gNTQsIG50ID0gMjYwLCBzdCA9IDE2MDsKY2xhc3MgWSB7CiAgc3RhdGljIGFzc2lnbkNvb3JkaW5hdGVzKG4sIGYsIHIsIHQgPSB7IGRpcmVjdGlvbjogIlRCIiwgbW9kZTogImF1dG8iLCBhc3BlY3RSYXRpbzogMS41NSB9KSB7CiAgICBjb25zdCBhID0gdC5kaXJlY3Rpb24gPz8gIlRCIiwgaCA9IGEgPT09ICJUQiIgfHwgYSA9PT0gIkJUIiwgZCA9IGEgPT09ICJCVCIgfHwgYSA9PT0gIlJMIiwgZSA9IHQuYXNwZWN0UmF0aW8gPz8gMS41NSwgcyA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykubGVuZ3RoLCB5ID0gdC5tb2RlICYmIHQubW9kZSAhPT0gImF1dG8iID8gdC5tb2RlIDogcyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIsIGkgPSB7fSwgbyA9IHt9LCB1ID0gKHcpID0+IHsKICAgICAgdmFyIGMsIEksIE0sIE4sIEE7CiAgICAgIGNvbnN0IGcgPSAhIW4uY29udGFpbmVyc1t3XSwgcCA9ICEhKChjID0gbi5jb250YWluZXJzW3ddKSAhPSBudWxsICYmIGMuY29sbGFwc2VkKTsKICAgICAgcmV0dXJuIGcgJiYgcCA/IHsgd2lkdGg6IHEsIGhlaWdodDogViB9IDogZyAmJiAhcCA/IHsKICAgICAgICB3aWR0aDogKChJID0gci5nZXQodykpID09IG51bGwgPyB2b2lkIDAgOiBJLndpZHRoKSB8fCBudCwKICAgICAgICBoZWlnaHQ6ICgoTSA9IHIuZ2V0KHcpKSA9PSBudWxsID8gdm9pZCAwIDogTS5oZWlnaHQpIHx8IHN0CiAgICAgIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoTiA9IHIuZ2V0KHcpKSA9PSBudWxsID8gdm9pZCAwIDogTi53aWR0aCkgfHwgaXQsCiAgICAgICAgaGVpZ2h0OiAoKEEgPSByLmdldCh3KSkgPT0gbnVsbCA/IHZvaWQgMCA6IEEuaGVpZ2h0KSB8fCBydAogICAgICB9OwogICAgfTsKICAgIHJldHVybiB5ID09PSAiY29uY3VycmVudCIgPyBZLmxheW91dENvbmN1cnJlbnRIaWVyYXJjaHkoCiAgICAgIG4sCiAgICAgIHUsCiAgICAgIGUsCiAgICAgIGksCiAgICAgIG8KICAgICkgOiBZLmxheW91dEZsb3dUcmVlKAogICAgICBuLAogICAgICBmLAogICAgICB1LAogICAgICBoLAogICAgICBkLAogICAgICB0LAogICAgICBpLAogICAgICBvCiAgICApLCBZLmFzc2lnbkR5bmFtaWNQb3J0U2lkZXMobiwgaSwgbyksIHsgbm9kZXM6IGksIGNvbnRhaW5lcnM6IG8gfTsKICB9CiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgLy8gQ09OQ1VSUkVOVCBDT01QT1VORCBQQUNLSU5HIFdJVEggU0tZTElORSAyRCBCSU4gUEFDS0lORwogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KG4sIGYsIHIsIHQsIGEpIHsKICAgIHZhciB3OwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtnLCBwXSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkgewogICAgICBjb25zdCBjID0gcC5wYXJlbnRJZCA/PyBudWxsOwogICAgICBoLmhhcyhjKSB8fCBoLnNldChjLCBbXSksIGguZ2V0KGMpLnB1c2goZyk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFtnLCBwXSBvZiBPYmplY3QuZW50cmllcyhuLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IGMgPSBwLnBhcmVudElkID8/IG51bGw7CiAgICAgIGguaGFzKGMpIHx8IGguc2V0KGMsIFtdKSwgaC5nZXQoYykucHVzaChnKTsKICAgIH0KICAgIGNvbnN0IGQgPSBZLmdldENvbnRhaW5lckRlcHRocyhuKSwgZSA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykuc29ydCgKICAgICAgKGcsIHApID0+IChkLmdldChwKSB8fCAwKSAtIChkLmdldChnKSB8fCAwKQogICAgKSwgcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBnIG9mIGUpIHsKICAgICAgaWYgKCEhKCh3ID0gbi5jb250YWluZXJzW2ddKSAhPSBudWxsICYmIHcuY29sbGFwc2VkKSkgewogICAgICAgIHMuc2V0KGcsIHsKICAgICAgICAgIHdpZHRoOiBxLAogICAgICAgICAgaGVpZ2h0OiBWCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgYyA9IGguZ2V0KGcpIHx8IFtdOwogICAgICBpZiAoYy5sZW5ndGggPT09IDApIHsKICAgICAgICBzLnNldChnLCB7CiAgICAgICAgICB3aWR0aDogcSwKICAgICAgICAgIGhlaWdodDogVyArIEcgKiAyCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgSSA9IGMubWFwKChTKSA9PiB7CiAgICAgICAgY29uc3QgXyA9IHMuaGFzKFMpID8gcy5nZXQoUykgOiBmKFMpOwogICAgICAgIHJldHVybiB7IGlkOiBTLCB3aWR0aDogXy53aWR0aCwgaGVpZ2h0OiBfLmhlaWdodCB9OwogICAgICB9KSwgTSA9IFkuZmluZEJlc3RUaWdodFBhY2tpbmcoSSwgcik7CiAgICAgIGZvciAoY29uc3QgUyBvZiBNLmJveGVzKQogICAgICAgIHkuc2V0KFMuaWQsIFMpOwogICAgICBjb25zdCBOID0gTWF0aC5tYXgoTS53aWR0aCArIEwgKiAyLCBxKSwgQSA9IE0uaGVpZ2h0ICsgVyArIEcgKiAyOwogICAgICBzLnNldChnLCB7IHdpZHRoOiBOLCBoZWlnaHQ6IEEgfSk7CiAgICB9CiAgICBjb25zdCBpID0gaC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgbyA9IFtdOwogICAgaWYgKGkubGVuZ3RoID4gMCkgewogICAgICBjb25zdCBnID0gaS5tYXAoKGMpID0+IHsKICAgICAgICBjb25zdCBJID0gcy5nZXQoYykgfHwgZihjKTsKICAgICAgICByZXR1cm4geyBpZDogYywgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgfSk7CiAgICAgIG8gPSBZLmZpbmRCZXN0VGlnaHRQYWNraW5nKGcsIHIpLmJveGVzLm1hcCgoYykgPT4gKHsKICAgICAgICAuLi5jLAogICAgICAgIGxvY2FsWDogYy5sb2NhbFggKyA2MCwKICAgICAgICBsb2NhbFk6IGMubG9jYWxZICsgNjAKICAgICAgfSkpOwogICAgfQogICAgY29uc3QgdSA9IChnLCBwLCBjLCBJLCBNKSA9PiB7CiAgICAgIHZhciBTOwogICAgICBjb25zdCBOID0gISFuLmNvbnRhaW5lcnNbZ10sIEEgPSB7IGlkOiBnLCB4OiBwLCB5OiBjLCB3aWR0aDogSSwgaGVpZ2h0OiBNIH07CiAgICAgIGlmIChOKSB7CiAgICAgICAgaWYgKGFbZ10gPSBBLCAoUyA9IG4uY29udGFpbmVyc1tnXSkgIT0gbnVsbCAmJiBTLmNvbGxhcHNlZCkgcmV0dXJuOwogICAgICAgIGNvbnN0IF8gPSBwICsgTCwgSCA9IGMgKyBXICsgRywgRiA9IGguZ2V0KGcpIHx8IFtdOwogICAgICAgIGZvciAoY29uc3QgWCBvZiBGKSB7CiAgICAgICAgICBjb25zdCBCID0geS5nZXQoWCk7CiAgICAgICAgICBCICYmIHUoCiAgICAgICAgICAgIFgsCiAgICAgICAgICAgIF8gKyBCLmxvY2FsWCwKICAgICAgICAgICAgSCArIEIubG9jYWxZLAogICAgICAgICAgICBCLndpZHRoLAogICAgICAgICAgICBCLmhlaWdodAogICAgICAgICAgKTsKICAgICAgICB9CiAgICAgIH0gZWxzZQogICAgICAgIHRbZ10gPSBBOwogICAgfTsKICAgIGZvciAoY29uc3QgZyBvZiBvKQogICAgICB1KGcuaWQsIGcubG9jYWxYLCBnLmxvY2FsWSwgZy53aWR0aCwgZy5oZWlnaHQpOwogIH0KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcobiwgZikgewogICAgaWYgKG4ubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBuWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogblswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBuWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IG5bMF0ud2lkdGgsIGhlaWdodDogblswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IHIgPSBuLnJlZHVjZSgoaSwgbykgPT4gaSArIG8ud2lkdGggKiBvLmhlaWdodCwgMCksIHQgPSBNYXRoLm1heCguLi5uLm1hcCgoaSkgPT4gaS53aWR0aCkpLCBhID0gWy4uLm5dLnNvcnQoKGksIG8pID0+IG8ud2lkdGggLSBpLndpZHRoKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGQgPSBuLnJlZHVjZSgoaSwgbykgPT4gaSArIG8ud2lkdGgsIDApICsgKG4ubGVuZ3RoIC0gMSkgKiBrOwogICAgaC5hZGQoZCksIGguYWRkKHQpOwogICAgY29uc3QgZSA9IE1hdGgubWF4KHQsIE1hdGguc3FydChyICogZikpOwogICAgaC5hZGQoZSksIGguYWRkKGUgKiAwLjg1KSwgaC5hZGQoZSAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKG4ubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IGkgPSAyOyBpIDw9IHM7IGkrKykgewogICAgICBsZXQgbyA9IDA7CiAgICAgIGZvciAobGV0IHUgPSAwOyB1IDwgaSAmJiB1IDwgYS5sZW5ndGg7IHUrKykKICAgICAgICBvICs9IGFbdV0ud2lkdGg7CiAgICAgIG8gKz0gKGkgLSAxKSAqIGssIG8gPj0gdCAmJiBoLmFkZChvKTsKICAgIH0KICAgIGxldCB5ID0gbnVsbDsKICAgIGZvciAoY29uc3QgaSBvZiBoKSB7CiAgICAgIGNvbnN0IG8gPSBZLnNpbXVsYXRlU2t5bGluZVBhY2tpbmcobiwgaSksIHUgPSBvLndpZHRoICogby5oZWlnaHQsIHcgPSBNYXRoLm1heCgwLCB1IC0gciksIGcgPSBvLndpZHRoIC8gTWF0aC5tYXgoMSwgby5oZWlnaHQpLCBwID0gTWF0aC5hYnMoTWF0aC5sb2coZyAvIGYpKSwgYyA9IHcgLyByICogMiArIHAgKiAwLjI1OwogICAgICBvLnNjb3JlID0gYywgKCF5IHx8IGMgPCB5LnNjb3JlKSAmJiAoeSA9IG8pOwogICAgfQogICAgcmV0dXJuIHk7CiAgfQogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKG4sIGYpIHsKICAgIGNvbnN0IHIgPSBbLi4ubl0uc29ydCgoZSwgcykgPT4gcy5oZWlnaHQgLSBlLmhlaWdodCksIHQgPSBbeyB4OiAwLCB3aWR0aDogZiwgeTogMCB9XSwgYSA9IFtdOwogICAgZm9yIChjb25zdCBlIG9mIHIpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHQubGVuZ3RoOyBjKyspIHsKICAgICAgICBpZiAodFtjXS54ICsgZS53aWR0aCA+IGYpIGNvbnRpbnVlOwogICAgICAgIGxldCBNID0gMCwgTiA9IDA7CiAgICAgICAgZm9yIChsZXQgQSA9IGM7IEEgPCB0Lmxlbmd0aCAmJiBOIDwgZS53aWR0aDsgQSsrKQogICAgICAgICAgTSA9IE1hdGgubWF4KE0sIHRbQV0ueSksIE4gKz0gdFtBXS53aWR0aDsKICAgICAgICBNIDwgcyAmJiAocyA9IE0sIHkgPSBjKTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCBjID0gTWF0aC5tYXgoLi4udC5tYXAoKE0pID0+IE0ueSkpLCBJID0gYyA9PT0gMCA/IDAgOiBjICsgUTsKICAgICAgICBhLnB1c2goewogICAgICAgICAgaWQ6IGUuaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IEksCiAgICAgICAgICB3aWR0aDogZS53aWR0aCwKICAgICAgICAgIGhlaWdodDogZS5oZWlnaHQKICAgICAgICB9KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goeyB4OiAwLCB3aWR0aDogZS53aWR0aCArIGssIHk6IEkgKyBlLmhlaWdodCB9KSwgZiA+IGUud2lkdGggKyBrICYmIHQucHVzaCh7CiAgICAgICAgICB4OiBlLndpZHRoICsgaywKICAgICAgICAgIHdpZHRoOiBmIC0gKGUud2lkdGggKyBrKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBpID0gdFt5XS54LCBvID0gcyA9PT0gMCA/IDAgOiBzICsgUTsKICAgICAgYS5wdXNoKHsKICAgICAgICBpZDogZS5pZCwKICAgICAgICBsb2NhbFg6IGksCiAgICAgICAgbG9jYWxZOiBvLAogICAgICAgIHdpZHRoOiBlLndpZHRoLAogICAgICAgIGhlaWdodDogZS5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IHUgPSBlLndpZHRoICsgaywgdyA9IG8gKyBlLmhlaWdodCwgZyA9IHsgeDogaSwgd2lkdGg6IHUsIHk6IHcgfSwgcCA9IFtdOwogICAgICBmb3IgKGNvbnN0IGMgb2YgdCkKICAgICAgICBjLnggKyBjLndpZHRoIDw9IGkgfHwgYy54ID49IGkgKyB1ID8gcC5wdXNoKGMpIDogKGMueCA8IGkgJiYgcC5wdXNoKHsgeDogYy54LCB3aWR0aDogaSAtIGMueCwgeTogYy55IH0pLCBjLnggKyBjLndpZHRoID4gaSArIHUgJiYgcC5wdXNoKHsKICAgICAgICAgIHg6IGkgKyB1LAogICAgICAgICAgd2lkdGg6IGMueCArIGMud2lkdGggLSAoaSArIHUpLAogICAgICAgICAgeTogYy55CiAgICAgICAgfSkpOwogICAgICBwLnB1c2goZyksIHAuc29ydCgoYywgSSkgPT4gYy54IC0gSS54KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goLi4ucCk7CiAgICB9CiAgICBjb25zdCBoID0gTWF0aC5tYXgoLi4uYS5tYXAoKGUpID0+IGUubG9jYWxYICsgZS53aWR0aCksIDApLCBkID0gTWF0aC5tYXgoLi4uYS5tYXAoKGUpID0+IGUubG9jYWxZICsgZS5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBoLCBoZWlnaHQ6IGQsIGJveGVzOiBhLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgV0lUSCBDT01QT1VORCBDT05UQUlORVIgU1VQUE9SVAogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRGbG93VHJlZShuLCBmLCByLCB0LCBhLCBoLCBkLCBlKSB7CiAgICB2YXIgdHQ7CiAgICBjb25zdCBzID0gQXJyYXkuZnJvbShmLmtleXMoKSkuc29ydCgobCwgeCkgPT4gbCAtIHgpLCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGxldCBpID0gODA7CiAgICBjb25zdCBvID0gdCA/IFcgKyBHICogMiA6IEwgKiAyLCB1ID0gKHQgPyBRICogMS41IDogayAqIDEuNSkgKyBvLCB3ID0gdCA/IGsgOiBRLCBnID0gYSA/IFsuLi5zXS5yZXZlcnNlKCkgOiBbLi4uc107CiAgICBmb3IgKGNvbnN0IGwgb2YgZykgewogICAgICBjb25zdCB4ID0gZi5nZXQobCkgfHwgW107CiAgICAgIGxldCBPID0gMDsKICAgICAgZm9yIChjb25zdCBtIG9mIHgpIHsKICAgICAgICBjb25zdCBiID0gcihtKSwgUCA9IHQgPyBiLmhlaWdodCA6IGIud2lkdGg7CiAgICAgICAgTyA9IE1hdGgubWF4KE8sIFApOwogICAgICB9CiAgICAgIHkuc2V0KGwsIGkpLCBpICs9IE8gKyB1OwogICAgfQogICAgY29uc3QgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBsIG9mIE9iamVjdC52YWx1ZXMobi5lZGdlcykpCiAgICAgIHAuaGFzKGwudGFyZ2V0SWQpIHx8IHAuc2V0KGwudGFyZ2V0SWQsIFtdKSwgcC5nZXQobC50YXJnZXRJZCkucHVzaChsLnNvdXJjZUlkKSwgYy5oYXMobC5zb3VyY2VJZCkgfHwgYy5zZXQobC5zb3VyY2VJZCwgW10pLCBjLmdldChsLnNvdXJjZUlkKS5wdXNoKGwudGFyZ2V0SWQpOwogICAgY29uc3QgSSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIE0gPSAobCkgPT4gewogICAgICB2YXIgeCwgTzsKICAgICAgcmV0dXJuICgoeCA9IG4ubm9kZXNbbF0pID09IG51bGwgPyB2b2lkIDAgOiB4LnBhcmVudElkKSA/PyAoKE8gPSBuLmNvbnRhaW5lcnNbbF0pID09IG51bGwgPyB2b2lkIDAgOiBPLnBhcmVudElkKSA/PyBudWxsOwogICAgfTsKICAgIGZvciAoY29uc3QgbCBvZiBzKSB7CiAgICAgIGNvbnN0IHggPSBmLmdldChsKSB8fCBbXTsKICAgICAgbGV0IE8gPSAtMSAvIDAsIG07CiAgICAgIGZvciAoY29uc3QgYiBvZiB4KSB7CiAgICAgICAgY29uc3QgUCA9IHIoYiksIGogPSB0ID8gUC53aWR0aCA6IFAuaGVpZ2h0LCBFID0gcC5nZXQoYikgfHwgW10sIEMgPSBNKGIpOwogICAgICAgIGxldCBUID0gdzsKICAgICAgICBtICE9PSB2b2lkIDAgJiYgbSAhPT0gQyAmJiAoVCA9IHcgKyAodCA/IEwgKiAyIDogVyArIEcgKiAyKSk7CiAgICAgICAgbGV0IHYgPSBudWxsOwogICAgICAgIGlmIChFLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0ICQgPSBFLm1hcCgoVSkgPT4gewogICAgICAgICAgICBjb25zdCBLID0gSS5nZXQoVSk7CiAgICAgICAgICAgIGlmIChLID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBldCA9IHIoVSk7CiAgICAgICAgICAgIHJldHVybiBLICsgKHQgPyBldC53aWR0aCA6IGV0LmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChVKSA9PiBVICE9PSBudWxsKTsKICAgICAgICAgICQubGVuZ3RoID4gMCAmJiAodiA9ICQucmVkdWNlKChVLCBLKSA9PiBVICsgSywgMCkgLyAkLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBEID0gdiAhPT0gbnVsbCA/IHYgLSBqIC8gMiA6IDgwOwogICAgICAgIEQgPCBPICsgVCAmJiAoRCA9IE8gPT09IC0xIC8gMCA/IDgwIDogTyArIFQpLCBJLnNldChiLCBEKSwgTyA9IEQgKyBqLCBtID0gQzsKICAgICAgfQogICAgfQogICAgZm9yIChsZXQgbCA9IHMubGVuZ3RoIC0gMTsgbCA+PSAwOyBsLS0pIHsKICAgICAgY29uc3QgeCA9IHNbbF0sIE8gPSBmLmdldCh4KSB8fCBbXTsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBqID0gYy5nZXQoUCkgfHwgW107CiAgICAgICAgaWYgKGoubGVuZ3RoID09PSAwKSBjb250aW51ZTsKICAgICAgICBjb25zdCBFID0gai5tYXAoKEMpID0+IHsKICAgICAgICAgIGNvbnN0IFQgPSBJLmdldChDKTsKICAgICAgICAgIGlmIChUID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgY29uc3QgdiA9IHIoQyk7CiAgICAgICAgICByZXR1cm4gVCArICh0ID8gdi53aWR0aCA6IHYuaGVpZ2h0KSAvIDI7CiAgICAgICAgfSkuZmlsdGVyKChDKSA9PiBDICE9PSBudWxsKTsKICAgICAgICBpZiAoRS5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBDID0gRS5yZWR1Y2UoKEQsICQpID0+IEQgKyAkLCAwKSAvIEUubGVuZ3RoLCBUID0gcihQKSwgdiA9IHQgPyBULndpZHRoIDogVC5oZWlnaHQ7CiAgICAgICAgICBJLnNldChQLCBDIC0gdiAvIDIpOwogICAgICAgIH0KICAgICAgfQogICAgICBsZXQgbSA9IC0xIC8gMCwgYjsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBqID0gcihQKSwgRSA9IHQgPyBqLndpZHRoIDogai5oZWlnaHQsIEMgPSBNKFApOwogICAgICAgIGxldCBUID0gdzsKICAgICAgICBiICE9PSB2b2lkIDAgJiYgYiAhPT0gQyAmJiAoVCA9IHcgKyAodCA/IEwgKiAyIDogVyArIEcgKiAyKSk7CiAgICAgICAgbGV0IHYgPSBJLmdldChQKSA/PyA4MDsKICAgICAgICB2IDwgbSArIFQgJiYgKHYgPSBtICsgVCwgSS5zZXQoUCwgdikpLCBtID0gdiArIEUsIGIgPSBDOwogICAgICB9CiAgICB9CiAgICBsZXQgTiA9IDEgLyAwOwogICAgZm9yIChjb25zdCBsIG9mIEkudmFsdWVzKCkpIE4gPSBNYXRoLm1pbihOLCBsKTsKICAgIGNvbnN0IEEgPSBOIDwgODAgPyA4MCAtIE4gOiAwOwogICAgZm9yIChjb25zdCBsIG9mIHMpIHsKICAgICAgY29uc3QgeCA9IGYuZ2V0KGwpIHx8IFtdLCBPID0geS5nZXQobCkgfHwgODA7CiAgICAgIGZvciAoY29uc3QgbSBvZiB4KSB7CiAgICAgICAgY29uc3QgYiA9IHIobSksIFAgPSAoSS5nZXQobSkgPz8gODApICsgQSwgQyA9IHsgaWQ6IG0sIHg6IHQgPyBQIDogTywgeTogdCA/IE8gOiBQLCB3aWR0aDogYi53aWR0aCwgaGVpZ2h0OiBiLmhlaWdodCB9OwogICAgICAgIG4uY29udGFpbmVyc1ttXSA/IGVbbV0gPSBDIDogZFttXSA9IEM7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IFMgPSBZLmdldENvbnRhaW5lckRlcHRocyhuKSwgXyA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykuc29ydCgKICAgICAgKGwsIHgpID0+IChTLmdldCh4KSB8fCAwKSAtIChTLmdldChsKSB8fCAwKQogICAgKSwgSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtsLCB4XSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkKICAgICAgeC5wYXJlbnRJZCAmJiAoSC5oYXMoeC5wYXJlbnRJZCkgfHwgSC5zZXQoeC5wYXJlbnRJZCwgW10pLCBILmdldCh4LnBhcmVudElkKS5wdXNoKGwpKTsKICAgIGZvciAoY29uc3QgW2wsIHhdIG9mIE9iamVjdC5lbnRyaWVzKG4uY29udGFpbmVycykpCiAgICAgIHgucGFyZW50SWQgJiYgKEguaGFzKHgucGFyZW50SWQpIHx8IEguc2V0KHgucGFyZW50SWQsIFtdKSwgSC5nZXQoeC5wYXJlbnRJZCkucHVzaChsKSk7CiAgICBmb3IgKGNvbnN0IGwgb2YgXykgewogICAgICBpZiAoKHR0ID0gbi5jb250YWluZXJzW2xdKSAhPSBudWxsICYmIHR0LmNvbGxhcHNlZCkgewogICAgICAgIGVbbF0gfHwgKGVbbF0gPSB7CiAgICAgICAgICBpZDogbCwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogcSwKICAgICAgICAgIGhlaWdodDogVgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHggPSBILmdldChsKSB8fCBbXSwgTyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG0gb2YgeCkgewogICAgICAgIGNvbnN0IGIgPSBkW21dIHx8IGVbbV07CiAgICAgICAgYiAmJiBPLnB1c2goYik7CiAgICAgIH0KICAgICAgaWYgKE8ubGVuZ3RoID09PSAwKQogICAgICAgIGVbbF0gfHwgKGVbbF0gPSB7CiAgICAgICAgICBpZDogbCwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogbnQsCiAgICAgICAgICBoZWlnaHQ6IHN0CiAgICAgICAgfSk7CiAgICAgIGVsc2UgewogICAgICAgIGxldCBtID0gMSAvIDAsIGIgPSAtMSAvIDAsIFAgPSAxIC8gMCwgaiA9IC0xIC8gMDsKICAgICAgICBmb3IgKGNvbnN0IEQgb2YgTykKICAgICAgICAgIG0gPSBNYXRoLm1pbihtLCBELngpLCBiID0gTWF0aC5tYXgoYiwgRC54ICsgRC53aWR0aCksIFAgPSBNYXRoLm1pbihQLCBELnkpLCBqID0gTWF0aC5tYXgoaiwgRC55ICsgRC5oZWlnaHQpOwogICAgICAgIGNvbnN0IEUgPSBNYXRoLm1heChiIC0gbSArIEwgKiAyLCBxKSwgQyA9IGogLSBQICsgVyArIEcgKiAyLCBUID0gbSAtIEwsIHYgPSBQIC0gVyAtIEc7CiAgICAgICAgZVtsXSA9IHsgaWQ6IGwsIHg6IFQsIHk6IHYsIHdpZHRoOiBFLCBoZWlnaHQ6IEMgfTsKICAgICAgfQogICAgfQogICAgbGV0IEYgPSAxIC8gMCwgWCA9IDEgLyAwOwogICAgZm9yIChjb25zdCBsIG9mIFsuLi5PYmplY3QudmFsdWVzKGQpLCAuLi5PYmplY3QudmFsdWVzKGUpXSkKICAgICAgRiA9IE1hdGgubWluKEYsIGwueCksIFggPSBNYXRoLm1pbihYLCBsLnkpOwogICAgY29uc3QgQiA9IDYwLCBaID0gRiA8IEIgPyBCIC0gRiA6IDAsIHogPSBYIDwgQiA/IEIgLSBYIDogMDsKICAgIGlmIChaICE9PSAwIHx8IHogIT09IDApIHsKICAgICAgZm9yIChjb25zdCBsIG9mIE9iamVjdC52YWx1ZXMoZCkpCiAgICAgICAgbC54ICs9IFosIGwueSArPSB6OwogICAgICBmb3IgKGNvbnN0IGwgb2YgT2JqZWN0LnZhbHVlcyhlKSkKICAgICAgICBsLnggKz0gWiwgbC55ICs9IHo7CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIGYsIHIpIHsKICAgIHZhciBhLCBoOwogICAgY29uc3QgdCA9IChkKSA9PiBmW2RdIHx8IHJbZF07CiAgICBmb3IgKGNvbnN0IGQgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkgewogICAgICBjb25zdCBlID0gdChkLnNvdXJjZUlkKSwgcyA9IHQoZC50YXJnZXRJZCk7CiAgICAgIGlmICghZSB8fCAhcykgY29udGludWU7CiAgICAgIGNvbnN0IHkgPSBuLm5vZGVzW2Quc291cmNlSWRdIHx8IG4uY29udGFpbmVyc1tkLnNvdXJjZUlkXSwgaSA9IG4ubm9kZXNbZC50YXJnZXRJZF0gfHwgbi5jb250YWluZXJzW2QudGFyZ2V0SWRdLCBvID0gcy54ICsgcy53aWR0aCAvIDIgLSAoZS54ICsgZS53aWR0aCAvIDIpLCB1ID0gcy55ICsgcy5oZWlnaHQgLyAyIC0gKGUueSArIGUuaGVpZ2h0IC8gMiksIHcgPSBNYXRoLmFicyhvKSA+IE1hdGguYWJzKHUpICogMS4yNSwgZyA9IChhID0geSA9PSBudWxsID8gdm9pZCAwIDogeS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGEuZmluZCgoYykgPT4gYy5pZCA9PT0gZC5zb3VyY2VQb3J0SWQpOwogICAgICBnICYmICghZy5zaWRlIHx8IGcuc2lkZSA9PT0gImF1dG8iKSAmJiAodyA/IGcuc2lkZSA9IG8gPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiBnLnNpZGUgPSB1ID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgcCA9IChoID0gaSA9PSBudWxsID8gdm9pZCAwIDogaS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGguZmluZCgoYykgPT4gYy5pZCA9PT0gZC50YXJnZXRQb3J0SWQpOwogICAgICBwICYmICghcC5zaWRlIHx8IHAuc2lkZSA9PT0gImF1dG8iKSAmJiAodyA/IHAuc2lkZSA9IG8gPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiBwLnNpZGUgPSB1ID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhuKSB7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgciA9ICh0KSA9PiB7CiAgICAgIHZhciBkOwogICAgICBpZiAoZi5oYXModCkpIHJldHVybiBmLmdldCh0KTsKICAgICAgY29uc3QgYSA9IChkID0gbi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogZC5wYXJlbnRJZDsKICAgICAgaWYgKCFhIHx8ICFuLmNvbnRhaW5lcnNbYV0pCiAgICAgICAgcmV0dXJuIGYuc2V0KHQsIDApLCAwOwogICAgICBjb25zdCBoID0gMSArIHIoYSk7CiAgICAgIHJldHVybiBmLnNldCh0LCBoKSwgaDsKICAgIH07CiAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmtleXMobi5jb250YWluZXJzKSkKICAgICAgcih0KTsKICAgIHJldHVybiBmOwogIH0KfQpjbGFzcyBhdCB7CiAgYXN5bmMgZXhlY3V0ZShuLCBmLCByKSB7CiAgICBjb25zdCB0ID0gT2JqZWN0LnZhbHVlcyhuLmNvbnRhaW5lcnMpLCBhID0gT2JqZWN0LnZhbHVlcyhuLm5vZGVzKSwgaCA9IG5ldyBTZXQoCiAgICAgIHQuZmlsdGVyKChvKSA9PiAhIW8uY29sbGFwc2VkKS5tYXAoKG8pID0+IG8uaWQpCiAgICApLCBkID0gKG8pID0+IHsKICAgICAgdmFyIHc7CiAgICAgIGxldCB1ID0gbzsKICAgICAgZm9yICg7IHU7ICkgewogICAgICAgIGlmIChoLmhhcyh1KSkgcmV0dXJuICEwOwogICAgICAgIHUgPSAodyA9IG4uY29udGFpbmVyc1t1XSkgPT0gbnVsbCA/IHZvaWQgMCA6IHcucGFyZW50SWQ7CiAgICAgIH0KICAgICAgcmV0dXJuICExOwogICAgfSwgZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IFtvLCB1XSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkKICAgICAgZCh1LnBhcmVudElkKSB8fCBlLmFkZChvKTsKICAgIGZvciAoY29uc3QgW28sIHVdIG9mIE9iamVjdC5lbnRyaWVzKG4uY29udGFpbmVycykpIHsKICAgICAgY29uc3QgdyA9IHU7CiAgICAgIHcuY29sbGFwc2VkID8gZCh3LnBhcmVudElkKSB8fCBlLmFkZChvKSA6ICEoYS5zb21lKChwKSA9PiBwLnBhcmVudElkID09PSBvKSB8fCB0LnNvbWUoKHApID0+IHAucGFyZW50SWQgPT09IG8pKSAmJiAhZCh3LnBhcmVudElkKSAmJiBlLmFkZChvKTsKICAgIH0KICAgIGNvbnN0IHMgPSBvdC5kZWNvdXBsZShuLCBlKSwgeSA9IGN0LmFzc2lnbkxheWVycyhzLmFsbEVudGl0eUlkcywgcy5hZGpMaXN0KSwgaSA9IFIubWluaW1pemVDcm9zc2luZ3MoeSwgcy5hZGpMaXN0LCA0LCBuKTsKICAgIHJldHVybiBZLmFzc2lnbkNvb3JkaW5hdGVzKG4sIGksIGYsIHIpOwogIH0KfQpjb25zdCBkdCA9IG5ldyBhdCgpOwpzZWxmLm9ubWVzc2FnZSA9IGFzeW5jIChKKSA9PiB7CiAgY29uc3QgeyBpZDogbiwgZ3JhcGg6IGYsIG1lYXN1cmVtZW50czogciwgb3B0aW9uczogdCB9ID0gSi5kYXRhOwogIHRyeSB7CiAgICBjb25zdCBhID0gbmV3IE1hcChyKSwgaCA9IGF3YWl0IGR0LmV4ZWN1dGUoZiwgYSwgdCk7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IG4sIHN1Y2Nlc3M6ICEwLCBsYXlvdXQ6IGggfSk7CiAgfSBjYXRjaCAoYSkgewogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBuLCBzdWNjZXNzOiAhMSwgZXJyb3I6IGEubWVzc2FnZSB9KTsKICB9Cn07Cg==", Ae = (d) => Uint8Array.from(atob(d), (e) => e.charCodeAt(0)), Vt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Ae(Qt)], { type: "text/javascript;charset=utf-8" });
function le(d) {
  let e;
  try {
    if (e = Vt && (self.URL || self.webkitURL).createObjectURL(Vt), !e) throw "";
    const C = new Worker(e, {
      type: "module",
      name: d == null ? void 0 : d.name
    });
    return C.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), C;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Qt,
      {
        type: "module",
        name: d == null ? void 0 : d.name
      }
    );
  }
}
class ae {
  constructor() {
    Pt(this, "worker", null);
    Pt(this, "pendingRequests", /* @__PURE__ */ new Map());
    Pt(this, "fallbackEngine", new re());
    if (typeof Worker < "u")
      try {
        this.worker = new le(), this.worker.onmessage = (e) => {
          const { id: C, success: i, layout: I, error: r } = e.data, c = this.pendingRequests.get(C);
          c && (this.pendingRequests.delete(C), i ? c.resolve(I) : c.reject(new Error(r)));
        }, this.worker.onerror = (e) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", e);
        };
      } catch (e) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", e), this.worker = null;
      }
  }
  execute(e, C, i) {
    return this.worker ? new Promise((I, r) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: I, reject: r });
      const l = Array.from(C.entries());
      this.worker.postMessage({
        id: c,
        graph: e,
        measurements: l,
        options: i
      });
    }) : this.fallbackEngine.execute(e, C, i);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class ue {
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: C, hoveredEntity: i, graph: I } = e;
    return i && i.id === C.id ? null : i && I.containers[i.id] ? C.parentId === i.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: C.id,
        newParentId: i.id
      }
    } : !i && C.parentId !== null && C.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: C.id,
        newParentId: null
      }
    } : null;
  }
}
class ke {
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: C, hoveredEdge: i, hoveredEntity: I, graph: r } = e;
    if (I && r.containers[I.id])
      return I.id !== C.id && C.parentId !== I.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: C.id,
          newParentId: I.id
        }
      } : null;
    if (!I && !i && C.parentId !== null && C.parentId !== void 0)
      return {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: C.id,
          newParentId: null
        }
      };
    const c = (l) => {
      const s = r.nodes[l.id] || l;
      if (!s.ports || s.ports.length === 0) return "";
      const A = Object.values(r.edges).find((t) => t.targetId === l.id);
      if (A) {
        const t = s.ports.find((g) => g.id === A.targetPortId);
        if (t) return t.id;
      }
      const y = new Set(
        Object.values(r.edges).filter((t) => t.sourceId === l.id).map((t) => t.sourcePortId)
      ), h = s.ports.find((t) => !y.has(t.id));
      return h ? h.id : s.ports[0].id;
    };
    if (i)
      return i.sourceId === C.id || i.targetId === C.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: i.id,
          newSourceId: i.sourceId,
          newTargetId: C.id,
          newTargetPortId: c(C)
        }
      };
    if (I && I.id !== C.id && r.nodes[I.id]) {
      const l = Object.values(r.edges).find(
        (s) => s.targetId === I.id && s.sourceId !== C.id
      );
      if (l)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: l.id,
            newSourceId: l.sourceId,
            newTargetId: C.id,
            newTargetPortId: c(C)
          }
        };
    }
    return null;
  }
}
function he(d, e = { min: 0.15, max: 3 }) {
  const [C, i] = et({ x: 80, y: 80, zoom: 1 }), I = Ct(!1), r = Ct({ x: 0, y: 0 }), c = R(
    (u, n) => {
      if (!d.current) return { x: u, y: n };
      const o = d.current.getBoundingClientRect();
      return {
        x: (u - o.left - C.x) / C.zoom,
        y: (n - o.top - C.y) / C.zoom
      };
    },
    [C, d]
  ), l = R(
    (u) => {
      if (!d.current) return;
      const n = [
        ...Object.values(u.nodes),
        ...Object.values(u.containers)
      ];
      if (n.length === 0) {
        i({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let o = 1 / 0, f = 1 / 0, B = -1 / 0, b = -1 / 0;
      for (const D of n)
        o = Math.min(o, D.x), f = Math.min(f, D.y), B = Math.max(B, D.x + D.width), b = Math.max(b, D.y + D.height);
      const m = d.current.getBoundingClientRect(), G = 80, N = Math.max(B - o, 100), k = Math.max(b - f, 100), X = (m.width - G * 2) / N, F = (m.height - G * 2) / k, Y = Math.min(
        Math.max(Math.min(X, F), e.min),
        Math.min(e.max, 1.25)
      ), V = (m.width - N * Y) / 2 - o * Y, S = (m.height - k * Y) / 2 - f * Y;
      i({
        x: V,
        y: S,
        zoom: Y
      });
    },
    [d, e]
  ), s = R(
    (u) => {
      if (u.preventDefault(), !!d.current)
        if (u.ctrlKey || u.metaKey) {
          const n = d.current.getBoundingClientRect(), o = u.clientX - n.left, f = u.clientY - n.top, B = u.deltaY < 0 ? 1.08 : 0.92, b = Math.min(Math.max(C.zoom * B, e.min), e.max), m = o - (o - C.x) * (b / C.zoom), G = f - (f - C.y) * (b / C.zoom);
          i({ x: m, y: G, zoom: b });
        } else
          i((n) => ({
            ...n,
            x: n.x - u.deltaX,
            y: n.y - u.deltaY
          }));
    },
    [C, e, d]
  ), A = R(
    (u, n) => {
      I.current = !0, r.current = { x: u - C.x, y: n - C.y };
    },
    [C]
  ), y = R((u, n) => {
    I.current && i((o) => ({
      ...o,
      x: u - r.current.x,
      y: n - r.current.y
    }));
  }, []), h = R(() => {
    I.current = !1;
  }, []), t = R(() => {
    i({ x: 80, y: 80, zoom: 1 });
  }, []), g = R(() => {
    i((u) => ({
      ...u,
      zoom: Math.min(u.zoom * 1.2, e.max)
    }));
  }, [e]), a = R(() => {
    i((u) => ({
      ...u,
      zoom: Math.max(u.zoom / 1.2, e.min)
    }));
  }, [e]);
  return {
    transform: C,
    setTransform: i,
    screenToWorld: c,
    onWheel: s,
    startPan: A,
    updatePan: y,
    endPan: h,
    resetTransform: t,
    zoomIn: g,
    zoomOut: a,
    zoomToFit: l,
    isPanning: I
  };
}
function ye(d) {
  const [e, C] = et(
    /* @__PURE__ */ new Map()
  );
  Ct(/* @__PURE__ */ new Map());
  const i = Ct(/* @__PURE__ */ new Map()), I = R((r, c) => {
    c ? i.current.set(r, c) : i.current.delete(r);
  }, []);
  return Yt(() => {
    const r = new ResizeObserver((c) => {
      let l = !1;
      const s = new Map(e);
      for (const A of c) {
        const y = A.target.getAttribute("data-sysflow-measure-id");
        if (!y) continue;
        const h = Math.ceil(A.contentRect.width), t = Math.ceil(A.contentRect.height), g = s.get(y);
        (!g || g.width !== h || g.height !== t) && (s.set(y, { width: h, height: t }), l = !0);
      }
      l && C(s);
    });
    return i.current.forEach((c) => r.observe(c)), () => {
      r.disconnect();
    };
  }, [d]), { measurements: e, registerMeasureElement: I };
}
function Be(d, e, C, i, I) {
  const [r, c] = et(null), [l, s] = et(null), A = Ct(null), y = Ct(null), h = R(
    (n, o) => {
      let f = null, B = 1 / 0;
      for (const [b, m] of Object.entries(e.containers))
        if (b !== o && n.x >= m.x && n.x <= m.x + m.width && n.y >= m.y && n.y <= m.y + m.height) {
          const G = m.width * m.height;
          G < B && (B = G, f = d.containers[b] || null);
        }
      if (f) return f;
      for (const [b, m] of Object.entries(e.nodes))
        if (b !== o && n.x >= m.x && n.x <= m.x + m.width && n.y >= m.y && n.y <= m.y + m.height)
          return d.nodes[b] || null;
      return null;
    },
    [e, d]
  ), t = R(
    (n, o) => {
      let f = null, B = 45;
      for (const b of Object.values(d.edges)) {
        if (b.sourceId === o || b.targetId === o) continue;
        const m = e.nodes[b.sourceId] || e.containers[b.sourceId], G = e.nodes[b.targetId] || e.containers[b.targetId];
        if (!m || !G) continue;
        const N = m.x + m.width, k = m.y + m.height / 2, X = G.x, F = G.y + G.height / 2;
        for (let Y = 0; Y <= 10; Y++) {
          const V = Y / 10, S = (1 - V) * N + V * X, D = (1 - V) * k + V * F, w = Math.hypot(n.x - S, n.y - D);
          w < B && (B = w, f = b);
        }
      }
      return f;
    },
    [e, d]
  ), g = R(
    (n, o) => {
      if (o.stopPropagation(), C.canDrag && !C.canDrag(n, d))
        return;
      const f = i(o.clientX, o.clientY);
      c({
        draggedEntity: n,
        ghostPosition: f
      });
    },
    [d, C, i]
  ), a = R(
    (n) => {
      if (!r) return;
      const o = i(n.clientX, n.clientY), f = h(o, r.draggedEntity.id), B = t(o, r.draggedEntity.id);
      A.current = f, y.current = B, f && d.containers[f.id] ? s(f.id) : s(null);
      const b = C.onDragMove ? C.onDragMove({
        draggedEntity: r.draggedEntity,
        cursorWorld: o,
        hoveredEntity: f,
        hoveredEdge: B,
        graph: d
      }) : o;
      b && c((m) => m ? { ...m, ghostPosition: b } : null);
    },
    [r, i, C, d, h, t]
  ), u = R(
    (n) => {
      if (!r) return;
      const o = i(n.clientX, n.clientY), f = h(o, r.draggedEntity.id), B = t(o, r.draggedEntity.id), b = C.onDragEnd({
        draggedEntity: r.draggedEntity,
        cursorWorld: o,
        hoveredEntity: f,
        hoveredEdge: B,
        graph: d
      });
      b && I(b), c(null), s(null), A.current = null, y.current = null;
    },
    [r, i, C, d, h, t, I]
  );
  return {
    dragState: r,
    hoveredContainerId: l,
    handlePointerDown: g,
    handlePointerMove: a,
    handlePointerUp: u
  };
}
function pe(d) {
  const [e, C] = et([d]), [i, I] = et(0), [r, c] = et(null), l = e[i], s = R((n) => {
    const o = ne(n);
    C((f) => [...f.slice(0, i + 1), o]), I((f) => f + 1);
  }, [i]), A = R(() => {
    i > 0 && I((n) => n - 1);
  }, [i]), y = R(() => {
    i < e.length - 1 && I((n) => n + 1);
  }, [i, e.length]), h = R((n) => {
    var f, B, b, m;
    const o = e[i];
    if (n.type === "ENTITY_REPARENT") {
      const { entityId: G, newParentId: N } = n.payload, k = {
        ...o,
        nodes: { ...o.nodes },
        containers: { ...o.containers }
      };
      k.nodes[G] ? k.nodes[G] = { ...k.nodes[G], parentId: N } : k.containers[G] && (k.containers[G] = { ...k.containers[G], parentId: N }), s(k);
    } else if (n.type === "NODE_ADD_CONNECTED") {
      const { sourceNode: G, position: N, direction: k, suggestedNewNodeId: X, suggestedNewEdgeId: F } = n.payload, Y = k === "BT", V = `p_in_${Date.now()}`, S = `p_out_${Date.now()}`, D = {
        id: X,
        label: `Node ${Object.keys(o.nodes).length + 1}`,
        type: G.type,
        ports: [
          { id: V, label: "in", side: Y ? "bottom" : "top" },
          { id: S, label: "out", side: Y ? "top" : "bottom" }
        ]
      }, w = G.ports.find((L) => L.label === "in") || G.ports[0], Z = G.ports.find((L) => L.label === "out") || G.ports[G.ports.length - 1];
      let T;
      Y && N === "bottom" || !Y && N === "top" ? T = {
        id: F,
        sourceId: X,
        sourcePortId: S,
        targetId: G.id,
        targetPortId: (w == null ? void 0 : w.id) || "in"
      } : T = {
        id: F,
        sourceId: G.id,
        sourcePortId: (Z == null ? void 0 : Z.id) || "out",
        targetId: X,
        targetPortId: V
      }, s({
        ...o,
        nodes: { ...o.nodes, [X]: D },
        edges: { ...o.edges, [F]: T }
      });
    } else if (n.type === "CONTAINER_TOGGLE_COLLAPSE") {
      const { containerId: G, collapsed: N } = n.payload;
      o.containers[G] && s({
        ...o,
        containers: {
          ...o.containers,
          [G]: { ...o.containers[G], collapsed: N }
        }
      });
    } else if (n.type === "EDGE_CREATE") {
      const G = n.payload.id || `E_${Date.now()}`;
      s({
        ...o,
        edges: {
          ...o.edges,
          [G]: { id: G, ...n.payload.edge }
        }
      });
    } else if (n.type === "EDGE_DELETE") {
      const G = { ...o.edges };
      delete G[n.payload.edgeId], s({ ...o, edges: G });
    } else if (n.type === "EDGE_REWIRE") {
      const { edgeId: G, newTargetId: N } = n.payload;
      if (!N || !o.edges[G]) return;
      const k = N, X = o.edges[G], F = X.targetId, Y = Object.values(o.edges).find((T) => T.targetId === k), V = Object.values(o.edges).find((T) => T.sourceId === k), S = { ...o.edges };
      Y && V && (S[Y.id] = { ...Y, targetId: V.targetId, targetPortId: V.targetPortId }, delete S[V.id]);
      const D = ((B = (f = o.nodes[k]) == null ? void 0 : f.ports[0]) == null ? void 0 : B.id) || "p_in", w = ((m = (b = o.nodes[k]) == null ? void 0 : b.ports.find((T) => T.id !== D)) == null ? void 0 : m.id) || D;
      S[G] = {
        ...X,
        targetId: k,
        targetPortId: D
      };
      const Z = `REWIRE_${Date.now()}`;
      S[Z] = {
        id: Z,
        sourceId: k,
        sourcePortId: w,
        targetId: F,
        targetPortId: X.targetPortId
      }, s({ ...o, edges: S });
    }
  }, [e, i, s]), t = R((n) => {
    const o = l.nodes[n] || l.containers[n];
    o && c({ entity: JSON.parse(JSON.stringify(o)), isCut: !1 });
  }, [l]), g = R((n) => {
    const o = l.nodes[n] || l.containers[n];
    if (o) {
      c({ entity: JSON.parse(JSON.stringify(o)), isCut: !0 });
      const f = { ...l.nodes }, B = { ...l.containers };
      delete f[n], delete B[n], s({ ...l, nodes: f, containers: B });
    }
  }, [l, s]), a = R(() => {
    if (!r) return;
    const n = r.entity, o = `${n.id}_copy_${Date.now().toString().slice(-4)}`, f = { ...n, id: o, label: `${n.label} (Copy)` };
    "collapsed" in f ? s({
      ...l,
      containers: { ...l.containers, [o]: f }
    }) : s({
      ...l,
      nodes: { ...l.nodes, [o]: f }
    });
  }, [r, l, s]), u = R((n) => {
    if (n.length === 0) return;
    const o = { ...l.nodes }, f = { ...l.containers }, B = { ...l.edges };
    for (const b of n)
      delete o[b], delete f[b], delete B[b];
    s({
      ...l,
      nodes: o,
      containers: f,
      edges: B
    });
  }, [l, s]);
  return {
    graph: l,
    setGraphDirect: s,
    applyAction: h,
    undo: A,
    redo: y,
    copyEntity: t,
    cutEntity: g,
    pasteEntity: a,
    deleteSelection: u,
    canUndo: i > 0,
    canRedo: i < e.length - 1
  };
}
const fe = ({
  graph: d,
  registerMeasureElement: e,
  nodeTypes: C,
  containerTypes: i
}) => {
  const I = Object.values(d.nodes), r = Object.values(d.containers);
  return /* @__PURE__ */ J("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((c) => {
      const l = c.type ? C == null ? void 0 : C[c.type] : null;
      return /* @__PURE__ */ H(
        "div",
        {
          ref: (s) => e(c.id, s),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ H(l, { node: c, selected: !1 }) : /* @__PURE__ */ J("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ H("div", { style: { fontWeight: 600 }, children: c.label }),
            c.ports.length > 0 && /* @__PURE__ */ J("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              c.ports.map((s) => s.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${c.id}`
      );
    }),
    r.map((c) => {
      const l = c.type ? i == null ? void 0 : i[c.type] : null;
      return /* @__PURE__ */ H(
        "div",
        {
          ref: (s) => e(c.id, s),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ H(l, { container: c, selected: !1 }) : /* @__PURE__ */ H("div", { className: "sysflow-container-header", children: c.label })
        },
        `measure-container-${c.id}`
      );
    })
  ] });
}, we = ({
  graph: d,
  layout: e,
  selectedIds: C,
  direction: i = "TB",
  showArrows: I = !0,
  routing: r = "auto",
  portOptions: c,
  onEdgeClick: l
}) => {
  const s = r === "step" || r === "auto" && (i === "LR" || i === "RL"), A = (t, g, a) => {
    var X, F, Y, V;
    let u = t, n = null;
    for ((X = d.containers[t]) != null && X.collapsed && (n = d.containers[t]); u; ) {
      const S = ((F = d.nodes[u]) == null ? void 0 : F.parentId) ?? ((Y = d.containers[u]) == null ? void 0 : Y.parentId) ?? null;
      S && ((V = d.containers[S]) != null && V.collapsed) && (n = d.containers[S]), u = S;
    }
    if (n) {
      const S = e.containers[n.id];
      if (!S)
        return { x: 0, y: 0, side: a ? "right" : "left", valid: !1, entityId: n.id };
      let D, w, Z;
      return i === "TB" ? (D = a ? "bottom" : "top", w = S.x + S.width / 2, Z = a ? S.y + S.height : S.y) : i === "BT" ? (D = a ? "top" : "bottom", w = S.x + S.width / 2, Z = a ? S.y : S.y + S.height) : i === "RL" ? (D = a ? "left" : "right", w = a ? S.x : S.x + S.width, Z = S.y + S.height / 2) : (D = a ? "right" : "left", w = a ? S.x + S.width : S.x, Z = S.y + S.height / 2), { x: w, y: Z, side: D, valid: !0, entityId: n.id };
    }
    if (!!d.containers[t]) {
      const S = e.containers[t];
      if (!S) return { x: 0, y: 0, side: a ? "right" : "left", valid: !1, entityId: t };
      let D, w, Z;
      return i === "TB" ? (D = S.x + S.width / 2, w = a ? S.y + S.height : S.y, Z = a ? "bottom" : "top") : i === "BT" ? (D = S.x + S.width / 2, w = a ? S.y : S.y + S.height, Z = a ? "top" : "bottom") : i === "RL" ? (D = a ? S.x : S.x + S.width, w = S.y + S.height / 2, Z = a ? "left" : "right") : (D = a ? S.x + S.width : S.x, w = S.y + S.height / 2, Z = a ? "right" : "left"), { x: D, y: w, side: Z, valid: !0, entityId: t };
    }
    const f = d.nodes[t], B = e.nodes[t];
    if (!f || !B)
      return { x: 0, y: 0, side: a ? "right" : "left", valid: !1, entityId: t };
    const m = Tt(
      f,
      B,
      i,
      d.edges,
      c
    ).get(g);
    if (m)
      return { x: m.worldX, y: m.worldY, side: m.side, valid: !0, entityId: t };
    let G, N, k;
    return i === "TB" ? (G = B.x + B.width / 2, N = a ? B.y + B.height : B.y, k = a ? "bottom" : "top") : i === "BT" ? (G = B.x + B.width / 2, N = a ? B.y : B.y + B.height, k = a ? "top" : "bottom") : i === "RL" ? (G = a ? B.x : B.x + B.width, N = B.y + B.height / 2, k = a ? "left" : "right") : (G = a ? B.x + B.width : B.x, N = B.y + B.height / 2, k = a ? "right" : "left"), { x: G, y: N, side: k, valid: !0, entityId: t };
  }, y = (t, g) => {
    const a = (t.x + g.x) / 2, u = (t.y + g.y) / 2;
    if (t.side === "right" && g.side === "left") {
      if (g.x >= t.x + 20)
        return `M ${t.x} ${t.y} L ${a} ${t.y} L ${a} ${g.y} L ${g.x} ${g.y}`;
      {
        const n = g.y >= t.y ? t.y - 40 : t.y + 40;
        return `M ${t.x} ${t.y} L ${t.x + 20} ${t.y} L ${t.x + 20} ${n} L ${g.x - 20} ${n} L ${g.x - 20} ${g.y} L ${g.x} ${g.y}`;
      }
    }
    if (t.side === "left" && g.side === "right") {
      if (g.x <= t.x - 20)
        return `M ${t.x} ${t.y} L ${a} ${t.y} L ${a} ${g.y} L ${g.x} ${g.y}`;
      {
        const n = g.y >= t.y ? t.y - 40 : t.y + 40;
        return `M ${t.x} ${t.y} L ${t.x - 20} ${t.y} L ${t.x - 20} ${n} L ${g.x + 20} ${n} L ${g.x + 20} ${g.y} L ${g.x} ${g.y}`;
      }
    }
    if (t.side === "bottom" && g.side === "top") {
      if (g.y >= t.y + 16)
        return `M ${t.x} ${t.y} L ${t.x} ${u} L ${g.x} ${u} L ${g.x} ${g.y}`;
      {
        const n = g.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${n} ${t.y + 20} L ${n} ${g.y - 20} L ${g.x} ${g.y - 20} L ${g.x} ${g.y}`;
      }
    }
    if (t.side === "top" && g.side === "bottom") {
      if (g.y <= t.y - 16)
        return `M ${t.x} ${t.y} L ${t.x} ${u} L ${g.x} ${u} L ${g.x} ${g.y}`;
      {
        const n = g.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y - 20} L ${n} ${t.y - 20} L ${n} ${g.y + 20} L ${g.x} ${g.y + 20} L ${g.x} ${g.y}`;
      }
    }
    return `M ${t.x} ${t.y} L ${a} ${t.y} L ${a} ${g.y} L ${g.x} ${g.y}`;
  }, h = (t, g) => {
    const a = g.x - t.x, u = g.y - t.y;
    if (t.side === "bottom" && g.side === "top")
      if (u > 0) {
        const b = Math.min(28, u * 0.4), m = t.y + Math.max(b, u * 0.5), G = g.y - Math.max(b, u * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${m} ${g.x} ${G} ${g.x} ${g.y}`;
      } else {
        const b = a >= 0 ? 1 : -1, m = Math.max(40, Math.abs(a) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + m * b} ${t.y + 40} ${g.x + m * b} ${g.y - 40} ${g.x} ${g.y}`;
      }
    if (t.side === "top" && g.side === "bottom")
      if (u < 0) {
        const b = Math.min(28, Math.abs(u) * 0.4), m = t.y - Math.max(b, Math.abs(u) * 0.5), G = g.y + Math.max(b, Math.abs(u) * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${m} ${g.x} ${G} ${g.x} ${g.y}`;
      } else {
        const b = a >= 0 ? 1 : -1, m = Math.max(40, Math.abs(a) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + m * b} ${t.y - 40} ${g.x + m * b} ${g.y + 40} ${g.x} ${g.y}`;
      }
    if (t.side === "right" && g.side === "left")
      if (a > 0) {
        const b = t.x + a * 0.5, m = g.x - a * 0.5;
        return `M ${t.x} ${t.y} C ${b} ${t.y} ${m} ${g.y} ${g.x} ${g.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x + 50} ${t.y - 50} ${g.x - 50} ${g.y - 50} ${g.x} ${g.y}`;
    if (t.side === "left" && g.side === "right")
      if (a < 0) {
        const b = t.x + a * 0.5, m = g.x - a * 0.5;
        return `M ${t.x} ${t.y} C ${b} ${t.y} ${m} ${g.y} ${g.x} ${g.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x - 50} ${t.y - 50} ${g.x + 50} ${g.y - 50} ${g.x} ${g.y}`;
    const n = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      top: { x: 0, y: -1 },
      bottom: { x: 0, y: 1 }
    }, o = n[t.side] || { x: 0, y: 1 }, f = n[g.side] || { x: 0, y: -1 }, B = Math.min(60, Math.hypot(a, u) * 0.35);
    return `M ${t.x} ${t.y} C ${t.x + o.x * B} ${t.y + o.y * B} ${g.x + f.x * B} ${g.y + f.y * B} ${g.x} ${g.y}`;
  };
  return /* @__PURE__ */ J("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ J("defs", { children: [
      /* @__PURE__ */ H(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ H("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ H(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ H("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(d.edges).map((t) => {
      const g = A(t.sourceId, t.sourcePortId, !0), a = A(t.targetId, t.targetPortId, !1);
      if (!g.valid || !a.valid || g.entityId === a.entityId) return null;
      const u = C.includes(t.id), n = s ? y(g, a) : h(g, a);
      return /* @__PURE__ */ J("g", { style: { pointerEvents: "stroke" }, children: [
        /* @__PURE__ */ H(
          "path",
          {
            d: n,
            fill: "none",
            stroke: "transparent",
            strokeWidth: 14,
            onClick: (o) => {
              o.stopPropagation(), l == null || l(t.id);
            },
            style: { cursor: "pointer" }
          }
        ),
        /* @__PURE__ */ H(
          "path",
          {
            d: n,
            fill: "none",
            stroke: u ? "var(--sysflow-edge-selected)" : "var(--sysflow-edge-stroke)",
            strokeWidth: u ? 2.5 : 1.75,
            strokeLinejoin: "round",
            strokeLinecap: "round",
            markerEnd: I ? u ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
          }
        )
      ] }, t.id);
    })
  ] });
}, be = ({
  entity: d,
  layout: e,
  direction: C = "LR",
  edges: i,
  portOptions: I,
  onPortPointerDown: r,
  onPortPointerUp: c
}) => {
  if (!d.ports || d.ports.length === 0)
    return null;
  const l = Tt(
    d,
    e,
    C,
    i,
    I
  );
  return /* @__PURE__ */ H(Dt, { children: d.ports.map((s) => {
    const A = l.get(s.id);
    return A ? /* @__PURE__ */ H(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${A.side}`,
        style: {
          position: "absolute",
          left: `${A.localX}px`,
          top: `${A.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${s.label} (${A.side})`,
        onPointerDown: (y) => {
          y.stopPropagation(), r == null || r(d.id, s.id, !0, y);
        },
        onPointerUp: (y) => {
          y.stopPropagation(), c == null || c(d.id, s.id, !1);
        }
      },
      s.id
    ) : null;
  }) });
}, me = ({
  node: d,
  layout: e,
  selected: C = !1,
  direction: i = "LR",
  edges: I,
  portOptions: r,
  enableQuickAdd: c = !1,
  onAddConnectedNode: l,
  onPointerDown: s,
  onMouseEnter: A,
  onMouseLeave: y,
  onClick: h,
  onPortPointerDown: t,
  onPortPointerUp: g,
  customRenderer: a
}) => {
  const [u, n] = et(!1);
  return /* @__PURE__ */ J(
    "div",
    {
      className: `sysflow-node ${C ? "sysflow-selected" : ""} ${d.className || ""}`,
      style: {
        transform: `translate(${e.x}px, ${e.y}px)`,
        width: `${e.width}px`,
        height: `${e.height}px`
      },
      onPointerDown: (o) => s == null ? void 0 : s(d, o),
      onMouseEnter: () => {
        n(!0), A == null || A(d.id);
      },
      onMouseLeave: () => {
        n(!1), y == null || y(d.id);
      },
      onClick: h,
      children: [
        c && u && /* @__PURE__ */ J(Dt, { children: [
          /* @__PURE__ */ H("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ H("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        c && u && l && /* @__PURE__ */ H(
          "button",
          {
            type: "button",
            className: "sysflow-quick-add-btn sysflow-quick-add-top",
            title: "Add connected node above",
            onPointerDown: (o) => {
              o.stopPropagation();
            },
            onPointerUp: (o) => {
              o.stopPropagation();
            },
            onClick: (o) => {
              o.preventDefault(), o.stopPropagation(), l(d, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ H(
          be,
          {
            entity: d,
            layout: e,
            direction: i,
            edges: I,
            portOptions: r,
            onPortPointerDown: t,
            onPortPointerUp: g
          }
        ),
        a ? /* @__PURE__ */ H(a, { node: d, selected: C }) : /* @__PURE__ */ J("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ H("div", { style: { fontWeight: 600, fontSize: "13px" }, children: d.label }),
          d.ports.length > 0 && /* @__PURE__ */ J("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            d.ports.length,
            " Port",
            d.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        c && u && l && /* @__PURE__ */ H(
          "button",
          {
            className: "sysflow-quick-add-btn sysflow-quick-add-bottom",
            title: "Add connected node below",
            onPointerDown: (o) => {
              o.stopPropagation();
            },
            onPointerUp: (o) => {
              o.stopPropagation();
            },
            onClick: (o) => {
              o.preventDefault(), o.stopPropagation(), l(d, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Ge = ({
  container: d,
  layout: e,
  selected: C,
  isHovered: i = !1,
  hasChildren: I = !1,
  onToggleCollapse: r,
  onPointerDown: c,
  onMouseEnter: l,
  onMouseLeave: s,
  onClick: A,
  customRenderer: y
}) => /* @__PURE__ */ H(
  "div",
  {
    className: `sysflow-container ${C ? "sysflow-selected" : ""} ${i ? "sysflow-hovered" : ""} ${d.className || ""}`,
    style: {
      transform: `translate(${e.x}px, ${e.y}px)`,
      width: `${e.width}px`,
      height: `${e.height}px`
    },
    onPointerDown: (h) => c(d, h),
    onMouseEnter: l,
    onMouseLeave: s,
    onClick: A,
    children: y ? /* @__PURE__ */ H(y, { container: d, selected: C }) : /* @__PURE__ */ J(Dt, { children: [
      /* @__PURE__ */ J("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ H("span", { className: "sysflow-container-title", title: d.label, children: d.label }),
        /* @__PURE__ */ H(
          "button",
          {
            className: "sysflow-collapse-btn",
            onClick: (h) => {
              h.stopPropagation(), r(d.id, !d.collapsed);
            },
            children: d.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !d.collapsed && !I && /* @__PURE__ */ H("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Se = new ue(), xe = ({
  graph: d,
  onChange: e,
  layoutEngine: C,
  interactionStrategy: i = Se,
  direction: I = "TB",
  layoutOptions: r,
  portPlacementMode: c,
  routing: l,
  showEdgeArrows: s = !0,
  nodeTypes: A,
  containerTypes: y,
  zoomBounds: h,
  className: t = "",
  selectedIds: g = [],
  theme: a = "dark",
  enableQuickAdd: u
}) => {
  var vt, Nt;
  const n = Ct(null), o = Ct(null);
  !C && !o.current && (o.current = new ae());
  const f = C || o.current, {
    transform: B,
    screenToWorld: b,
    onWheel: m,
    startPan: G,
    updatePan: N,
    endPan: k,
    resetTransform: X,
    zoomIn: F,
    zoomOut: Y,
    zoomToFit: V,
    isPanning: S
  } = he(n, h), { measurements: D, registerMeasureElement: w } = ye(d), [Z, T] = et({ nodes: {}, containers: {} }), E = Ie(() => ({
    direction: I,
    mode: c ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: Z.nodes
  }), [I, c, Z.nodes]), [L, W] = et(null), [v, U] = et(null), z = Ct(!1), {
    dragState: Q,
    hoveredContainerId: j,
    handlePointerDown: q,
    handlePointerMove: At,
    handlePointerUp: it
  } = Be(d, Z, i, b, e);
  Yt(() => {
    const K = (P) => {
      if (P.target instanceof HTMLInputElement || P.target instanceof HTMLTextAreaElement)
        return;
      if (P.key === "Escape") {
        P.preventDefault(), U(null), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (P.code === "Space" && (z.current = !0), P.key.toLowerCase() === "f" && !P.ctrlKey && !P.metaKey) {
        P.preventDefault(), V(Z);
        return;
      }
      if ((P.ctrlKey || P.metaKey) && P.key.toLowerCase() === "a") {
        P.preventDefault();
        const $ = [
          ...Object.keys(d.nodes),
          ...Object.keys(d.containers)
        ];
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: $ } });
        return;
      }
      const p = Object.keys(d.nodes);
      if (p.length !== 0) {
        if (P.key === "Tab") {
          P.preventDefault();
          const $ = g.length > 0 ? p.indexOf(g[0]) : -1;
          let O;
          P.shiftKey ? O = $ <= 0 ? p.length - 1 : $ - 1 : O = ($ + 1) % p.length, e({ type: "SELECTION_CHANGE", payload: { selectedIds: [p[O]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(P.key)) {
          P.preventDefault();
          const $ = g[0] || p[0], O = Z.nodes[$] || Z.containers[$];
          if (!O) return;
          const gt = {
            x: O.x + O.width / 2,
            y: O.y + O.height / 2
          };
          let M = null, lt = 1 / 0;
          for (const yt of p) {
            if (yt === $) continue;
            const dt = Z.nodes[yt];
            if (!dt) continue;
            const bt = {
              x: dt.x + dt.width / 2,
              y: dt.y + dt.height / 2
            }, Bt = bt.x - gt.x, at = bt.y - gt.y;
            let ot = !1;
            if (P.key === "ArrowRight" && Bt > 20 && (ot = !0), P.key === "ArrowLeft" && Bt < -20 && (ot = !0), P.key === "ArrowDown" && at > 20 && (ot = !0), P.key === "ArrowUp" && at < -20 && (ot = !0), ot) {
              const _ = Math.hypot(Bt, at);
              _ < lt && (lt = _, M = yt);
            }
          }
          M && e({ type: "SELECTION_CHANGE", payload: { selectedIds: [M] } });
        }
      }
    }, x = (P) => {
      P.code === "Space" && (z.current = !1);
    };
    return window.addEventListener("keydown", K), window.addEventListener("keyup", x), () => {
      window.removeEventListener("keydown", K), window.removeEventListener("keyup", x);
    };
  }, [d, Z, g, V, e]), Yt(() => {
    let K = !1, x = 16 / 9;
    if (n.current) {
      const p = n.current.getBoundingClientRect();
      p.width > 0 && p.height > 0 && (x = p.width / p.height);
    }
    const P = {
      direction: I,
      aspectRatio: x,
      ...r
    };
    return f.execute(d, D, P).then((p) => {
      K || T(p);
    }), () => {
      K = !0;
    };
  }, [d, D, f, I, r]);
  const ht = (K, x, P, p) => {
    const $ = d.nodes[K] || d.containers[K], O = Z.nodes[K] || Z.containers[K];
    if (!$ || !O) return;
    const M = Tt(
      $,
      O,
      I,
      d.edges,
      E
    ).get(x), lt = M ? { x: M.worldX, y: M.worldY } : { x: O.x + O.width, y: O.y + O.height / 2 };
    W({
      sourceId: K,
      sourcePortId: x,
      startWorldPos: lt,
      currentWorldPos: b(p.clientX, p.clientY)
    });
  }, Kt = (K, x, P) => {
    var p, $, O, gt, M, lt, yt, dt, bt, Bt;
    if (L && L.sourceId !== K) {
      const at = d.nodes[L.sourceId] || d.containers[L.sourceId], ot = d.nodes[K] || d.containers[K], _ = (p = at == null ? void 0 : at.ports) == null ? void 0 : p.find((ft) => ft.id === L.sourcePortId), tt = ($ = ot == null ? void 0 : ot.ports) == null ? void 0 : $.find((ft) => ft.id === x);
      let mt = L.sourceId, Zt = L.sourcePortId, Gt = K, Lt = x;
      const jt = ((O = _ == null ? void 0 : _.label) == null ? void 0 : O.toLowerCase().includes("in")) || (_ == null ? void 0 : _.side) === (I === "BT" ? "bottom" : "top"), Jt = ((gt = _ == null ? void 0 : _.label) == null ? void 0 : gt.toLowerCase().includes("out")) || (_ == null ? void 0 : _.side) === (I === "BT" ? "top" : "bottom"), Ut = ((M = tt == null ? void 0 : tt.label) == null ? void 0 : M.toLowerCase().includes("in")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "bottom" : "top"), qt = ((lt = tt == null ? void 0 : tt.label) == null ? void 0 : lt.toLowerCase().includes("out")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "top" : "bottom");
      if (jt && qt)
        mt = K, Zt = x, Gt = L.sourceId, Lt = L.sourcePortId;
      else if (Jt && Ut)
        mt = L.sourceId, Zt = L.sourcePortId, Gt = K, Lt = x;
      else if (Z.nodes[L.sourceId] && Z.nodes[K]) {
        const ft = Z.nodes[L.sourceId], Et = Z.nodes[K], _t = I === "BT" && ft.y < Et.y, te = I === "TB" && ft.y > Et.y;
        if (_t || te) {
          mt = K, Gt = L.sourceId;
          const pt = d.nodes[mt], xt = d.nodes[Gt];
          Zt = ((dt = (yt = pt == null ? void 0 : pt.ports) == null ? void 0 : yt.find((St) => St.label.includes("out") || St.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : dt.id) || x, Lt = ((Bt = (bt = xt == null ? void 0 : xt.ports) == null ? void 0 : bt.find((St) => St.label.includes("in") || St.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : Bt.id) || L.sourcePortId;
        }
      }
      e({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: mt,
            sourcePortId: Zt,
            targetId: Gt,
            targetPortId: Lt
          }
        }
      });
    }
    W(null);
  }, Mt = (K) => {
    if (K.button === 1 || z.current) {
      G(K.clientX, K.clientY);
      return;
    }
    const x = K.target, P = x === n.current || x.classList.contains("sysflow-viewport") || x.classList.contains("sysflow-dom-layer") || x.tagName.toLowerCase() === "svg";
    if (K.button === 0 && P) {
      K.currentTarget.setPointerCapture(K.pointerId);
      const p = b(K.clientX, K.clientY);
      U({
        startX: p.x,
        startY: p.y,
        currentX: p.x,
        currentY: p.y
      }), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Rt = (K) => {
    if (S.current)
      N(K.clientX, K.clientY);
    else if (v) {
      const x = b(K.clientX, K.clientY);
      U((P) => P ? { ...P, currentX: x.x, currentY: x.y } : null);
    } else Q ? At(K) : L && W(
      (x) => x ? { ...x, currentWorldPos: b(K.clientX, K.clientY) } : null
    );
  }, Ot = (K) => {
    if (K.currentTarget.hasPointerCapture(K.pointerId) && K.currentTarget.releasePointerCapture(K.pointerId), S.current && k(), v) {
      const x = Math.min(v.startX, v.currentX), P = Math.min(v.startY, v.currentY), p = Math.max(v.startX, v.currentX), $ = Math.max(v.startY, v.currentY);
      if (p - x > 4 || $ - P > 4) {
        const O = [];
        for (const [gt, M] of Object.entries(Z.nodes))
          M.x < p && M.x + M.width > x && M.y < $ && M.y + M.height > P && O.push(gt);
        for (const [gt, M] of Object.entries(Z.containers))
          M.x < p && M.x + M.width > x && M.y < $ && M.y + M.height > P && O.push(gt);
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: O } });
      }
      U(null);
    }
    Q && it(K), L && W(null);
  }, Ft = u ?? (r == null ? void 0 : r.mode) === "flow", zt = R(
    (K, x) => {
      const P = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, p = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      e({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: K,
          position: x,
          direction: I,
          suggestedNewNodeId: P,
          suggestedNewEdgeId: p
        }
      });
    },
    [I, e]
  ), $t = Object.values(d.containers);
  return /* @__PURE__ */ J(
    "div",
    {
      ref: n,
      className: `sysflow-canvas ${a === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${t}`,
      "data-theme": a,
      onWheel: m,
      onPointerDown: Mt,
      onPointerMove: Rt,
      onPointerUp: Ot,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ H(
          fe,
          {
            graph: d,
            registerMeasureElement: w,
            nodeTypes: A,
            containerTypes: y
          }
        ),
        /* @__PURE__ */ J("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ H("button", { onClick: F, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ H("button", { onClick: Y, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ J("button", { onClick: X, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(B.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ J(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${B.x}px, ${B.y}px) scale(${B.zoom})`
            },
            children: [
              v && /* @__PURE__ */ H(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(v.startX, v.currentX)}px`,
                    top: `${Math.min(v.startY, v.currentY)}px`,
                    width: `${Math.abs(v.currentX - v.startX)}px`,
                    height: `${Math.abs(v.currentY - v.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              /* @__PURE__ */ H(
                we,
                {
                  graph: d,
                  layout: Z,
                  selectedIds: g,
                  direction: I,
                  showArrows: s,
                  routing: l,
                  portOptions: E,
                  onEdgeClick: (K) => e({ type: "SELECTION_CHANGE", payload: { selectedIds: [K] } })
                }
              ),
              L && /* @__PURE__ */ H("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ H(
                "line",
                {
                  x1: L.startWorldPos.x,
                  y1: L.startWorldPos.y,
                  x2: L.currentWorldPos.x,
                  y2: L.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ J("div", { className: "sysflow-dom-layer", children: [
                $t.map((K) => {
                  const x = Z.containers[K.id];
                  if (!x) return null;
                  const P = Object.values(d.nodes).some((p) => p.parentId === K.id) || Object.values(d.containers).some((p) => p.parentId === K.id);
                  return /* @__PURE__ */ H(
                    Ge,
                    {
                      container: K,
                      layout: x,
                      selected: g.includes(K.id),
                      isHovered: j === K.id,
                      hasChildren: P,
                      customRenderer: K.type ? y == null ? void 0 : y[K.type] : void 0,
                      onToggleCollapse: (p, $) => e({
                        type: "CONTAINER_TOGGLE_COLLAPSE",
                        payload: { containerId: p, collapsed: $ }
                      }),
                      onPointerDown: q,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (p) => {
                        p.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [K.id] } });
                      }
                    },
                    K.id
                  );
                }),
                Object.values(d.nodes).map((K) => {
                  const x = Z.nodes[K.id];
                  return x ? /* @__PURE__ */ H(
                    me,
                    {
                      node: K,
                      layout: x,
                      direction: I,
                      edges: d.edges,
                      portOptions: E,
                      selected: g.includes(K.id),
                      customRenderer: K.type ? A == null ? void 0 : A[K.type] : void 0,
                      enableQuickAdd: Ft,
                      onAddConnectedNode: zt,
                      onPointerDown: q,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (P) => {
                        P.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [K.id] } });
                      },
                      onPortPointerDown: ht,
                      onPortPointerUp: Kt
                    },
                    K.id
                  ) : null;
                })
              ] }),
              Q && /* @__PURE__ */ H(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${Q.ghostPosition.x}px, ${Q.ghostPosition.y}px)`,
                    width: `${((vt = D.get(Q.draggedEntity.id)) == null ? void 0 : vt.width) || 200}px`,
                    height: `${((Nt = D.get(Q.draggedEntity.id)) == null ? void 0 : Nt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ H("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: Q.draggedEntity.label })
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
  ke as EdgeRewireStrategy,
  Ge as GraphContainer,
  we as GraphEdgeLayer,
  me as GraphNode,
  be as GraphPortLayer,
  ue as ReparentStrategy,
  re as SugiyamaEngine,
  xe as SysFlowCanvas,
  ae as WorkerBridge,
  Tt as computeEntityPortLocations,
  ne as pruneDanglingEdges,
  he as useCanvasTransform,
  Be as useDragGesture,
  pe as useGraphHistory,
  ye as useMeasurement
};
