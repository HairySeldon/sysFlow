var se = Object.defineProperty;
var ne = (i, g, n) => g in i ? se(i, g, { enumerable: !0, configurable: !0, writable: !0, value: n }) : i[g] = n;
var St = (i, g, n) => ne(i, typeof g != "symbol" ? g + "" : g, n);
import { useState as et, useRef as Ct, useCallback as M, useEffect as Dt, useMemo as Ce } from "react";
import { jsxs as $, jsx as N, Fragment as Et } from "react/jsx-runtime";
function ie(i, g, n, s) {
  const I = (r) => {
    const c = n.find(
      (C) => C.sourceId === g && C.sourcePortId === r || C.targetId === g && C.targetPortId === r
    );
    if (!c) return null;
    const l = c.sourceId === g ? c.targetId : c.sourceId, o = s[l];
    return o ? { x: o.x + o.width / 2, y: o.y + o.height / 2 } : null;
  };
  ["left", "right"].forEach((r) => {
    i[r].sort((c, l) => {
      var h, a;
      const o = ((h = I(c.id)) == null ? void 0 : h.y) ?? 0, C = ((a = I(l.id)) == null ? void 0 : a.y) ?? 0;
      return o - C;
    });
  }), ["top", "bottom"].forEach((r) => {
    i[r].sort((c, l) => {
      var h, a;
      const o = ((h = I(c.id)) == null ? void 0 : h.x) ?? 0, C = ((a = I(l.id)) == null ? void 0 : a.x) ?? 0;
      return o - C;
    });
  });
}
function de(i, g, n, s, I, r) {
  if (!I || !r)
    return n ? "left" : "right";
  const c = s.find(
    (a) => n ? a.targetId === i && a.targetPortId === g : a.sourceId === i && a.sourcePortId === g
  );
  if (!c) return n ? "left" : "right";
  const l = n ? c.sourceId : c.targetId, o = I[l];
  if (!o) return n ? "left" : "right";
  const C = o.x + o.width / 2 - (r.x + r.width / 2), h = o.y + o.height / 2 - (r.y + r.height / 2);
  return Math.abs(C) > Math.abs(h) ? C > 0 ? "right" : "left" : h > 0 ? "bottom" : "top";
}
function Nt(i, g, n = "LR", s, I) {
  const r = /* @__PURE__ */ new Map();
  if (!i || !g || !i.ports || i.ports.length === 0)
    return r;
  const c = (I == null ? void 0 : I.direction) || n, l = c === "TB" || c === "BT", o = (I == null ? void 0 : I.mode) || (l ? "strict-flow" : "perimeter-optimized"), C = s ? Array.isArray(s) ? s : Object.values(s) : [], h = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, a = new Set(
    C.filter((b) => b.targetId === i.id).map((b) => b.targetPortId)
  );
  new Set(
    C.filter((b) => b.sourceId === i.id).map((b) => b.sourcePortId)
  ), i.ports.forEach((b) => {
    let y = b.side || "auto";
    if (y !== "auto") {
      h[y].push(b);
      return;
    }
    if (o === "strict-flow") {
      const A = a.has(b.id) || b.label.toLowerCase().includes("in");
      switch (c) {
        case "BT":
          y = A ? "bottom" : "top";
          break;
        case "TB":
          y = A ? "top" : "bottom";
          break;
        case "RL":
          y = A ? "right" : "left";
          break;
        case "LR":
        default:
          y = A ? "left" : "right";
          break;
      }
    } else
      y = de(
        i.id,
        b.id,
        a.has(b.id),
        C,
        I == null ? void 0 : I.nodeLayouts,
        g
      );
    h[y].push(b);
  }), o === "perimeter-optimized" && (I != null && I.nodeLayouts) && ie(h, i.id, C, I.nodeLayouts);
  const f = (b, y) => {
    const A = b.length;
    b.forEach((e, t) => {
      let d = 0, w = 0;
      y === "left" || y === "right" ? (w = g.height / (A + 1) * (t + 1), d = y === "left" ? 0 : g.width) : (d = g.width / (A + 1) * (t + 1), w = y === "top" ? 0 : g.height), r.set(e.id, {
        portId: e.id,
        side: y,
        localX: d,
        localY: w,
        worldX: g.x + d,
        worldY: g.y + w
      });
    });
  };
  return f(h.left, "left"), f(h.right, "right"), f(h.top, "top"), f(h.bottom, "bottom"), r;
}
function ce(i) {
  const g = {}, n = (s) => {
    var r;
    const I = i.nodes[s];
    return new Set(((r = I == null ? void 0 : I.ports) == null ? void 0 : r.map((c) => c.id)) || []);
  };
  for (const [s, I] of Object.entries(i.edges)) {
    const r = n(I.sourceId), c = n(I.targetId), l = r.has(I.sourcePortId), o = c.has(I.targetPortId);
    l && o && (g[s] = I);
  }
  return {
    ...i,
    edges: g
  };
}
class re {
  static decouple(g, n) {
    const s = /* @__PURE__ */ new Map();
    for (const C of n)
      s.set(C, /* @__PURE__ */ new Set());
    const I = Object.values(g.edges);
    for (const C of I)
      n.has(C.sourceId) && n.has(C.targetId) && s.get(C.sourceId).add(C.targetId);
    const r = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), o = (C) => {
      r.add(C), c.add(C);
      const h = Array.from(s.get(C) || []);
      for (const a of h)
        r.has(a) ? c.has(a) && (s.get(C).delete(a), s.get(a).add(C), l.add(`${C}->${a}`)) : o(a);
      c.delete(C);
    };
    for (const C of n)
      r.has(C) || o(C);
    return {
      adjList: s,
      reversedEdges: l,
      allEntityIds: Array.from(n)
    };
  }
}
class le {
  static assignLayers(g, n) {
    const s = /* @__PURE__ */ new Map();
    for (const o of g)
      s.set(o, 0);
    for (const [, o] of n.entries())
      for (const C of o)
        s.set(C, (s.get(C) || 0) + 1);
    const I = /* @__PURE__ */ new Map(), r = [];
    for (const o of g)
      (s.get(o) || 0) === 0 && (I.set(o, 0), r.push(o));
    const c = /* @__PURE__ */ new Set();
    for (; r.length > 0; ) {
      const o = r.shift();
      c.add(o);
      const C = I.get(o) || 0, h = n.get(o) || /* @__PURE__ */ new Set();
      for (const a of h) {
        const f = I.get(a) ?? 0;
        I.set(a, Math.max(f, C + 1)), s.set(a, (s.get(a) || 1) - 1), s.get(a) === 0 && r.push(a);
      }
    }
    for (const o of g)
      I.has(o) || I.set(o, 0);
    const l = /* @__PURE__ */ new Map();
    for (const [o, C] of I.entries())
      l.has(C) || l.set(C, []), l.get(C).push(o);
    return l;
  }
}
class nt {
  static minimizeCrossings(g, n, s = 4, I) {
    const r = Array.from(g.keys()).sort((o, C) => o - C);
    if (r.length <= 1) return g;
    const c = /* @__PURE__ */ new Map();
    for (const [o, C] of n.entries())
      for (const h of C)
        c.has(h) || c.set(h, /* @__PURE__ */ new Set()), c.get(h).add(o);
    const l = /* @__PURE__ */ new Map();
    for (const [o, C] of g.entries())
      l.set(o, [...C]);
    for (let o = 0; o < s; o++) {
      for (let C = 1; C < r.length; C++) {
        const h = l.get(r[C - 1]), a = l.get(r[C]), f = /* @__PURE__ */ new Map();
        h.forEach((b, y) => f.set(b, y)), nt.sortLayerNodes(a, c, f, I);
      }
      for (let C = r.length - 2; C >= 0; C--) {
        const h = l.get(r[C + 1]), a = l.get(r[C]), f = /* @__PURE__ */ new Map();
        h.forEach((b, y) => f.set(b, y)), nt.sortLayerNodes(a, n, f, I);
      }
    }
    return l;
  }
  static sortLayerNodes(g, n, s, I) {
    var C, h, a;
    if (!I || Object.keys(I.containers).length === 0) {
      g.sort((f, b) => {
        const y = nt.getBarycenter(f, n, s), A = nt.getBarycenter(b, n, s);
        return y - A;
      });
      return;
    }
    const r = /* @__PURE__ */ new Map();
    for (const f of g)
      r.set(f, nt.getBarycenter(f, n, s));
    const c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
    for (const f of g) {
      const b = r.get(f) ?? 0;
      let y = ((C = I.nodes[f]) == null ? void 0 : C.parentId) ?? ((h = I.containers[f]) == null ? void 0 : h.parentId);
      for (; y; )
        c.set(y, (c.get(y) || 0) + b), l.set(y, (l.get(y) || 0) + 1), y = (a = I.containers[y]) == null ? void 0 : a.parentId;
    }
    const o = (f) => {
      if (I.containers[f]) {
        const b = l.get(f) || 0;
        return b === 0 ? 0 : (c.get(f) || 0) / b;
      }
      return r.get(f) ?? 0;
    };
    g.sort((f, b) => {
      const y = nt.getAncestorPath(f, I), A = nt.getAncestorPath(b, I);
      let e = 0;
      for (; e < y.length && e < A.length && y[e] === A[e]; )
        e++;
      const t = y[e] ?? f, d = A[e] ?? b, w = o(t) - o(d);
      return Math.abs(w) > 1e-5 ? w : t.localeCompare(d);
    });
  }
  static getAncestorPath(g, n) {
    var r, c, l;
    const s = [g];
    let I = ((r = n.nodes[g]) == null ? void 0 : r.parentId) ?? ((c = n.containers[g]) == null ? void 0 : c.parentId);
    for (; I; )
      s.unshift(I), I = (l = n.containers[I]) == null ? void 0 : l.parentId;
    return s;
  }
  static getBarycenter(g, n, s) {
    const I = n.get(g);
    if (!I || I.size === 0) return 0;
    let r = 0, c = 0;
    for (const l of I)
      s.has(l) && (r += s.get(l), c++);
    return c === 0 ? 0 : r / c;
  }
}
const st = 32, Pt = 24, ut = 22, rt = 18, lt = 38, wt = 210, Ht = 36, Ae = 180, ae = 54, Wt = 260, Xt = 160;
class It {
  static assignCoordinates(g, n, s, I = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const r = I.direction ?? "TB", c = r === "TB" || r === "BT", l = r === "BT" || r === "RL", o = I.aspectRatio ?? 1.55, C = Object.keys(g.containers).length, h = I.mode && I.mode !== "auto" ? I.mode : C > 0 ? "concurrent" : "flow", a = {}, f = {}, b = (y) => {
      var t, d, w, B, S;
      const A = !!g.containers[y], e = !!((t = g.containers[y]) != null && t.collapsed);
      return A && e ? { width: wt, height: Ht } : A && !e ? {
        width: ((d = s.get(y)) == null ? void 0 : d.width) || Wt,
        height: ((w = s.get(y)) == null ? void 0 : w.height) || Xt
      } : {
        width: ((B = s.get(y)) == null ? void 0 : B.width) || Ae,
        height: ((S = s.get(y)) == null ? void 0 : S.height) || ae
      };
    };
    return h === "concurrent" ? It.layoutConcurrentHierarchy(
      g,
      b,
      o,
      a,
      f
    ) : It.layoutFlowTree(
      g,
      n,
      b,
      c,
      l,
      I,
      a,
      f
    ), It.assignDynamicPortSides(g, a, f), { nodes: a, containers: f };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(g, n, s, I, r) {
    var y;
    const c = /* @__PURE__ */ new Map();
    for (const [A, e] of Object.entries(g.nodes)) {
      const t = e.parentId ?? null;
      c.has(t) || c.set(t, []), c.get(t).push(A);
    }
    for (const [A, e] of Object.entries(g.containers)) {
      const t = e.parentId ?? null;
      c.has(t) || c.set(t, []), c.get(t).push(A);
    }
    const l = It.getContainerDepths(g), o = Object.keys(g.containers).sort(
      (A, e) => (l.get(e) || 0) - (l.get(A) || 0)
    ), C = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
    for (const A of o) {
      if (!!((y = g.containers[A]) != null && y.collapsed)) {
        C.set(A, {
          width: wt,
          height: Ht
        });
        continue;
      }
      const t = c.get(A) || [];
      if (t.length === 0) {
        C.set(A, {
          width: wt,
          height: lt + rt * 2
        });
        continue;
      }
      const d = t.map((m) => {
        const p = C.has(m) ? C.get(m) : n(m);
        return { id: m, width: p.width, height: p.height };
      }), w = It.findBestTightPacking(d, s);
      for (const m of w.boxes)
        h.set(m.id, m);
      const B = Math.max(w.width + ut * 2, wt), S = w.height + lt + rt * 2;
      C.set(A, { width: B, height: S });
    }
    const a = c.get(null) || [];
    let f = [];
    if (a.length > 0) {
      const A = a.map((t) => {
        const d = C.get(t) || n(t);
        return { id: t, width: d.width, height: d.height };
      });
      f = It.findBestTightPacking(A, s).boxes.map((t) => ({
        ...t,
        localX: t.localX + 60,
        localY: t.localY + 60
      }));
    }
    const b = (A, e, t, d, w) => {
      var m;
      const B = !!g.containers[A], S = { id: A, x: e, y: t, width: d, height: w };
      if (B) {
        if (r[A] = S, (m = g.containers[A]) != null && m.collapsed) return;
        const p = e + ut, H = t + lt + rt, W = c.get(A) || [];
        for (const P of W) {
          const L = h.get(P);
          L && b(
            P,
            p + L.localX,
            H + L.localY,
            L.width,
            L.height
          );
        }
      } else
        I[A] = S;
    };
    for (const A of f)
      b(A.id, A.localX, A.localY, A.width, A.height);
  }
  static findBestTightPacking(g, n) {
    if (g.length === 1)
      return {
        width: g[0].width,
        height: g[0].height,
        boxes: [{ id: g[0].id, localX: 0, localY: 0, width: g[0].width, height: g[0].height }],
        score: 0
      };
    const s = g.reduce((a, f) => a + f.width * f.height, 0), I = Math.max(...g.map((a) => a.width)), r = [...g].sort((a, f) => f.width - a.width), c = /* @__PURE__ */ new Set(), l = g.reduce((a, f) => a + f.width, 0) + (g.length - 1) * st;
    c.add(l), c.add(I);
    const o = Math.max(I, Math.sqrt(s * n));
    c.add(o), c.add(o * 0.85), c.add(o * 1.15);
    const C = Math.min(g.length, 6);
    for (let a = 2; a <= C; a++) {
      let f = 0;
      for (let b = 0; b < a && b < r.length; b++)
        f += r[b].width;
      f += (a - 1) * st, f >= I && c.add(f);
    }
    let h = null;
    for (const a of c) {
      const f = It.simulateSkylinePacking(g, a), b = f.width * f.height, y = Math.max(0, b - s), A = f.width / Math.max(1, f.height), e = Math.abs(Math.log(A / n)), t = y / s * 2 + e * 0.25;
      f.score = t, (!h || t < h.score) && (h = f);
    }
    return h;
  }
  static simulateSkylinePacking(g, n) {
    const s = [...g].sort((o, C) => C.height - o.height), I = [{ x: 0, width: n, y: 0 }], r = [];
    for (const o of s) {
      let C = 1 / 0, h = -1;
      for (let t = 0; t < I.length; t++) {
        if (I[t].x + o.width > n) continue;
        let w = 0, B = 0;
        for (let S = t; S < I.length && B < o.width; S++)
          w = Math.max(w, I[S].y), B += I[S].width;
        w < C && (C = w, h = t);
      }
      if (h === -1) {
        const t = Math.max(...I.map((w) => w.y)), d = t === 0 ? 0 : t + Pt;
        r.push({
          id: o.id,
          localX: 0,
          localY: d,
          width: o.width,
          height: o.height
        }), I.length = 0, I.push({ x: 0, width: o.width + st, y: d + o.height }), n > o.width + st && I.push({
          x: o.width + st,
          width: n - (o.width + st),
          y: 0
        });
        continue;
      }
      const a = I[h].x, f = C === 0 ? 0 : C + Pt;
      r.push({
        id: o.id,
        localX: a,
        localY: f,
        width: o.width,
        height: o.height
      });
      const b = o.width + st, y = f + o.height, A = { x: a, width: b, y }, e = [];
      for (const t of I)
        t.x + t.width <= a || t.x >= a + b ? e.push(t) : (t.x < a && e.push({ x: t.x, width: a - t.x, y: t.y }), t.x + t.width > a + b && e.push({
          x: a + b,
          width: t.x + t.width - (a + b),
          y: t.y
        }));
      e.push(A), e.sort((t, d) => t.x - d.x), I.length = 0, I.push(...e);
    }
    const c = Math.max(...r.map((o) => o.localX + o.width), 0), l = Math.max(...r.map((o) => o.localY + o.height), 0);
    return { width: c, height: l, boxes: r, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE WITH COMPOUND CONTAINER SUPPORT
  // ===========================================================================
  static layoutFlowTree(g, n, s, I, r, c, l, o) {
    var Q;
    const C = Array.from(n.keys()).sort((G, D) => G - D), h = /* @__PURE__ */ new Map();
    let a = 80;
    const f = I ? lt + rt * 2 : ut * 2, b = (I ? Pt * 1.5 : st * 1.5) + f, y = I ? st : Pt, A = r ? [...C].reverse() : [...C];
    for (const G of A) {
      const D = n.get(G) || [];
      let u = 0;
      for (const k of D) {
        const E = s(k), Z = I ? E.height : E.width;
        u = Math.max(u, Z);
      }
      h.set(G, a), a += u + b;
    }
    const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
    for (const G of Object.values(g.edges))
      e.has(G.targetId) || e.set(G.targetId, []), e.get(G.targetId).push(G.sourceId), t.has(G.sourceId) || t.set(G.sourceId, []), t.get(G.sourceId).push(G.targetId);
    const d = /* @__PURE__ */ new Map(), w = (G) => {
      var D, u;
      return ((D = g.nodes[G]) == null ? void 0 : D.parentId) ?? ((u = g.containers[G]) == null ? void 0 : u.parentId) ?? null;
    };
    for (const G of C) {
      const D = n.get(G) || [];
      let u = -1 / 0, k;
      for (const E of D) {
        const Z = s(E), J = I ? Z.width : Z.height, T = e.get(E) || [], z = w(E);
        let U = y;
        k !== void 0 && k !== z && (U = y + (I ? ut * 2 : lt + rt * 2));
        let R = null;
        if (T.length > 0) {
          const it = T.map((dt) => {
            const ht = d.get(dt);
            if (ht === void 0) return null;
            const pt = s(dt);
            return ht + (I ? pt.width : pt.height) / 2;
          }).filter((dt) => dt !== null);
          it.length > 0 && (R = it.reduce((dt, ht) => dt + ht, 0) / it.length);
        }
        let _ = R !== null ? R - J / 2 : 80;
        _ < u + U && (_ = u === -1 / 0 ? 80 : u + U), d.set(E, _), u = _ + J, k = z;
      }
    }
    for (let G = C.length - 1; G >= 0; G--) {
      const D = C[G], u = n.get(D) || [];
      for (const Z of u) {
        const J = t.get(Z) || [];
        if (J.length === 0) continue;
        const T = J.map((z) => {
          const U = d.get(z);
          if (U === void 0) return null;
          const R = s(z);
          return U + (I ? R.width : R.height) / 2;
        }).filter((z) => z !== null);
        if (T.length > 0) {
          const z = T.reduce((_, it) => _ + it, 0) / T.length, U = s(Z), R = I ? U.width : U.height;
          d.set(Z, z - R / 2);
        }
      }
      let k = -1 / 0, E;
      for (const Z of u) {
        const J = s(Z), T = I ? J.width : J.height, z = w(Z);
        let U = y;
        E !== void 0 && E !== z && (U = y + (I ? ut * 2 : lt + rt * 2));
        let R = d.get(Z) ?? 80;
        R < k + U && (R = k + U, d.set(Z, R)), k = R + T, E = z;
      }
    }
    let B = 1 / 0;
    for (const G of d.values()) B = Math.min(B, G);
    const S = B < 80 ? 80 - B : 0;
    for (const G of C) {
      const D = n.get(G) || [], u = h.get(G) || 80;
      for (const k of D) {
        const E = s(k), Z = (d.get(k) ?? 80) + S, z = { id: k, x: I ? Z : u, y: I ? u : Z, width: E.width, height: E.height };
        g.containers[k] ? o[k] = z : l[k] = z;
      }
    }
    const m = It.getContainerDepths(g), p = Object.keys(g.containers).sort(
      (G, D) => (m.get(D) || 0) - (m.get(G) || 0)
    ), H = /* @__PURE__ */ new Map();
    for (const [G, D] of Object.entries(g.nodes))
      D.parentId && (H.has(D.parentId) || H.set(D.parentId, []), H.get(D.parentId).push(G));
    for (const [G, D] of Object.entries(g.containers))
      D.parentId && (H.has(D.parentId) || H.set(D.parentId, []), H.get(D.parentId).push(G));
    for (const G of p) {
      if ((Q = g.containers[G]) != null && Q.collapsed) {
        o[G] || (o[G] = {
          id: G,
          x: 80,
          y: 80,
          width: wt,
          height: Ht
        });
        continue;
      }
      const D = H.get(G) || [], u = [];
      for (const k of D) {
        const E = l[k] || o[k];
        E && u.push(E);
      }
      if (u.length === 0)
        o[G] || (o[G] = {
          id: G,
          x: 80,
          y: 80,
          width: Wt,
          height: Xt
        });
      else {
        let k = 1 / 0, E = -1 / 0, Z = 1 / 0, J = -1 / 0;
        for (const _ of u)
          k = Math.min(k, _.x), E = Math.max(E, _.x + _.width), Z = Math.min(Z, _.y), J = Math.max(J, _.y + _.height);
        const T = Math.max(E - k + ut * 2, wt), z = J - Z + lt + rt * 2, U = k - ut, R = Z - lt - rt;
        o[G] = { id: G, x: U, y: R, width: T, height: z };
      }
    }
    let W = 1 / 0, P = 1 / 0;
    for (const G of [...Object.values(l), ...Object.values(o)])
      W = Math.min(W, G.x), P = Math.min(P, G.y);
    const L = 60, X = W < L ? L - W : 0, V = P < L ? L - P : 0;
    if (X !== 0 || V !== 0) {
      for (const G of Object.values(l))
        G.x += X, G.y += V;
      for (const G of Object.values(o))
        G.x += X, G.y += V;
    }
  }
  static assignDynamicPortSides(g, n, s) {
    var r, c;
    const I = (l) => n[l] || s[l];
    for (const l of Object.values(g.edges)) {
      const o = I(l.sourceId), C = I(l.targetId);
      if (!o || !C) continue;
      const h = g.nodes[l.sourceId] || g.containers[l.sourceId], a = g.nodes[l.targetId] || g.containers[l.targetId], f = C.x + C.width / 2 - (o.x + o.width / 2), b = C.y + C.height / 2 - (o.y + o.height / 2), y = Math.abs(f) > Math.abs(b) * 1.25, A = (r = h == null ? void 0 : h.ports) == null ? void 0 : r.find((t) => t.id === l.sourcePortId);
      A && (!A.side || A.side === "auto") && (y ? A.side = f >= 0 ? "right" : "left" : A.side = b >= 0 ? "bottom" : "top");
      const e = (c = a == null ? void 0 : a.ports) == null ? void 0 : c.find((t) => t.id === l.targetPortId);
      e && (!e.side || e.side === "auto") && (y ? e.side = f >= 0 ? "left" : "right" : e.side = b >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(g) {
    const n = /* @__PURE__ */ new Map(), s = (I) => {
      var l;
      if (n.has(I)) return n.get(I);
      const r = (l = g.containers[I]) == null ? void 0 : l.parentId;
      if (!r || !g.containers[r])
        return n.set(I, 0), 0;
      const c = 1 + s(r);
      return n.set(I, c), c;
    };
    for (const I of Object.keys(g.containers))
      s(I);
    return n;
  }
}
function Vt(i, g, n) {
  var r, c;
  let s = i, I = null;
  for (; s; )
    n.has(s) && (I = s), s = ((r = g.nodes[s]) == null ? void 0 : r.parentId) ?? ((c = g.containers[s]) == null ? void 0 : c.parentId) ?? void 0;
  return I ?? i;
}
class ue {
  async execute(g, n, s) {
    const I = Object.values(g.containers), r = Object.values(g.nodes), c = new Set(
      I.filter((y) => !!y.collapsed).map((y) => y.id)
    ), l = (y) => {
      var e;
      let A = y;
      for (; A; ) {
        if (c.has(A)) return !0;
        A = (e = g.containers[A]) == null ? void 0 : e.parentId;
      }
      return !1;
    }, o = /* @__PURE__ */ new Set();
    for (const [y, A] of Object.entries(g.nodes))
      l(A.parentId) || o.add(y);
    for (const [y, A] of Object.entries(g.containers))
      A.collapsed ? l(A.parentId) || o.add(y) : !(r.some((t) => t.parentId === y) || I.some((t) => t.parentId === y)) && !l(A.parentId) && o.add(y);
    const C = {};
    for (const [y, A] of Object.entries(g.edges)) {
      const e = Vt(A.sourceId, g, c), t = Vt(A.targetId, g, c);
      e !== t && o.has(e) && o.has(t) && (C[y] = {
        ...A,
        sourceId: e,
        targetId: t
      });
    }
    const h = {
      ...g,
      edges: C
    }, a = re.decouple(h, o), f = le.assignLayers(a.allEntityIds, a.adjList), b = nt.minimizeCrossings(f, a.adjList, 4, h);
    return It.assignCoordinates(h, b, n, s);
  }
}
const Mt = "Y2xhc3MgY3QgewogIHN0YXRpYyBkZWNvdXBsZShlLCBmKSB7CiAgICBjb25zdCBjID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgcyBvZiBmKQogICAgICBjLnNldChzLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgIGNvbnN0IHQgPSBPYmplY3QudmFsdWVzKGUuZWRnZXMpOwogICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgIGYuaGFzKHMuc291cmNlSWQpICYmIGYuaGFzKHMudGFyZ2V0SWQpICYmIGMuZ2V0KHMuc291cmNlSWQpLmFkZChzLnRhcmdldElkKTsKICAgIGNvbnN0IGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIG4gPSAocykgPT4gewogICAgICBkLmFkZChzKSwgaC5hZGQocyk7CiAgICAgIGNvbnN0IHkgPSBBcnJheS5mcm9tKGMuZ2V0KHMpIHx8IFtdKTsKICAgICAgZm9yIChjb25zdCBpIG9mIHkpCiAgICAgICAgZC5oYXMoaSkgPyBoLmhhcyhpKSAmJiAoYy5nZXQocykuZGVsZXRlKGkpLCBjLmdldChpKS5hZGQocyksIGwuYWRkKGAke3N9LT4ke2l9YCkpIDogbihpKTsKICAgICAgaC5kZWxldGUocyk7CiAgICB9OwogICAgZm9yIChjb25zdCBzIG9mIGYpCiAgICAgIGQuaGFzKHMpIHx8IG4ocyk7CiAgICByZXR1cm4gewogICAgICBhZGpMaXN0OiBjLAogICAgICByZXZlcnNlZEVkZ2VzOiBsLAogICAgICBhbGxFbnRpdHlJZHM6IEFycmF5LmZyb20oZikKICAgIH07CiAgfQp9CmNsYXNzIGl0IHsKICBzdGF0aWMgYXNzaWduTGF5ZXJzKGUsIGYpIHsKICAgIGNvbnN0IGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBuIG9mIGUpCiAgICAgIGMuc2V0KG4sIDApOwogICAgZm9yIChjb25zdCBbLCBuXSBvZiBmLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIG4pCiAgICAgICAgYy5zZXQocywgKGMuZ2V0KHMpIHx8IDApICsgMSk7CiAgICBjb25zdCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgZCA9IFtdOwogICAgZm9yIChjb25zdCBuIG9mIGUpCiAgICAgIChjLmdldChuKSB8fCAwKSA9PT0gMCAmJiAodC5zZXQobiwgMCksIGQucHVzaChuKSk7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyBkLmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBuID0gZC5zaGlmdCgpOwogICAgICBoLmFkZChuKTsKICAgICAgY29uc3QgcyA9IHQuZ2V0KG4pIHx8IDAsIHkgPSBmLmdldChuKSB8fCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICBmb3IgKGNvbnN0IGkgb2YgeSkgewogICAgICAgIGNvbnN0IHIgPSB0LmdldChpKSA/PyAwOwogICAgICAgIHQuc2V0KGksIE1hdGgubWF4KHIsIHMgKyAxKSksIGMuc2V0KGksIChjLmdldChpKSB8fCAxKSAtIDEpLCBjLmdldChpKSA9PT0gMCAmJiBkLnB1c2goaSk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgbiBvZiBlKQogICAgICB0LmhhcyhuKSB8fCB0LnNldChuLCAwKTsKICAgIGNvbnN0IGwgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbbiwgc10gb2YgdC5lbnRyaWVzKCkpCiAgICAgIGwuaGFzKHMpIHx8IGwuc2V0KHMsIFtdKSwgbC5nZXQocykucHVzaChuKTsKICAgIHJldHVybiBsOwogIH0KfQpjbGFzcyBHIHsKICBzdGF0aWMgbWluaW1pemVDcm9zc2luZ3MoZSwgZiwgYyA9IDQsIHQpIHsKICAgIGNvbnN0IGQgPSBBcnJheS5mcm9tKGUua2V5cygpKS5zb3J0KChuLCBzKSA9PiBuIC0gcyk7CiAgICBpZiAoZC5sZW5ndGggPD0gMSkgcmV0dXJuIGU7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW24sIHNdIG9mIGYuZW50cmllcygpKQogICAgICBmb3IgKGNvbnN0IHkgb2YgcykKICAgICAgICBoLmhhcyh5KSB8fCBoLnNldCh5LCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKSwgaC5nZXQoeSkuYWRkKG4pOwogICAgY29uc3QgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtuLCBzXSBvZiBlLmVudHJpZXMoKSkKICAgICAgbC5zZXQobiwgWy4uLnNdKTsKICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYzsgbisrKSB7CiAgICAgIGZvciAobGV0IHMgPSAxOyBzIDwgZC5sZW5ndGg7IHMrKykgewogICAgICAgIGNvbnN0IHkgPSBsLmdldChkW3MgLSAxXSksIGkgPSBsLmdldChkW3NdKSwgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgICAgeS5mb3JFYWNoKChwLCBnKSA9PiByLnNldChwLCBnKSksIEcuc29ydExheWVyTm9kZXMoaSwgaCwgciwgdCk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgcyA9IGQubGVuZ3RoIC0gMjsgcyA+PSAwOyBzLS0pIHsKICAgICAgICBjb25zdCB5ID0gbC5nZXQoZFtzICsgMV0pLCBpID0gbC5nZXQoZFtzXSksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHkuZm9yRWFjaCgocCwgZykgPT4gci5zZXQocCwgZykpLCBHLnNvcnRMYXllck5vZGVzKGksIGYsIHIsIHQpOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gbDsKICB9CiAgc3RhdGljIHNvcnRMYXllck5vZGVzKGUsIGYsIGMsIHQpIHsKICAgIHZhciBzLCB5LCBpOwogICAgaWYgKCF0IHx8IE9iamVjdC5rZXlzKHQuY29udGFpbmVycykubGVuZ3RoID09PSAwKSB7CiAgICAgIGUuc29ydCgociwgcCkgPT4gewogICAgICAgIGNvbnN0IGcgPSBHLmdldEJhcnljZW50ZXIociwgZiwgYyksIGEgPSBHLmdldEJhcnljZW50ZXIocCwgZiwgYyk7CiAgICAgICAgcmV0dXJuIGcgLSBhOwogICAgICB9KTsKICAgICAgcmV0dXJuOwogICAgfQogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IHIgb2YgZSkKICAgICAgZC5zZXQociwgRy5nZXRCYXJ5Y2VudGVyKHIsIGYsIGMpKTsKICAgIGNvbnN0IGggPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBsID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgciBvZiBlKSB7CiAgICAgIGNvbnN0IHAgPSBkLmdldChyKSA/PyAwOwogICAgICBsZXQgZyA9ICgocyA9IHQubm9kZXNbcl0pID09IG51bGwgPyB2b2lkIDAgOiBzLnBhcmVudElkKSA/PyAoKHkgPSB0LmNvbnRhaW5lcnNbcl0pID09IG51bGwgPyB2b2lkIDAgOiB5LnBhcmVudElkKTsKICAgICAgZm9yICg7IGc7ICkKICAgICAgICBoLnNldChnLCAoaC5nZXQoZykgfHwgMCkgKyBwKSwgbC5zZXQoZywgKGwuZ2V0KGcpIHx8IDApICsgMSksIGcgPSAoaSA9IHQuY29udGFpbmVyc1tnXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGkucGFyZW50SWQ7CiAgICB9CiAgICBjb25zdCBuID0gKHIpID0+IHsKICAgICAgaWYgKHQuY29udGFpbmVyc1tyXSkgewogICAgICAgIGNvbnN0IHAgPSBsLmdldChyKSB8fCAwOwogICAgICAgIHJldHVybiBwID09PSAwID8gMCA6IChoLmdldChyKSB8fCAwKSAvIHA7CiAgICAgIH0KICAgICAgcmV0dXJuIGQuZ2V0KHIpID8/IDA7CiAgICB9OwogICAgZS5zb3J0KChyLCBwKSA9PiB7CiAgICAgIGNvbnN0IGcgPSBHLmdldEFuY2VzdG9yUGF0aChyLCB0KSwgYSA9IEcuZ2V0QW5jZXN0b3JQYXRoKHAsIHQpOwogICAgICBsZXQgdyA9IDA7CiAgICAgIGZvciAoOyB3IDwgZy5sZW5ndGggJiYgdyA8IGEubGVuZ3RoICYmIGdbd10gPT09IGFbd107ICkKICAgICAgICB3Kys7CiAgICAgIGNvbnN0IG8gPSBnW3ddID8/IHIsIEkgPSBhW3ddID8/IHAsIE0gPSBuKG8pIC0gbihJKTsKICAgICAgcmV0dXJuIE1hdGguYWJzKE0pID4gMWUtNSA/IE0gOiBvLmxvY2FsZUNvbXBhcmUoSSk7CiAgICB9KTsKICB9CiAgc3RhdGljIGdldEFuY2VzdG9yUGF0aChlLCBmKSB7CiAgICB2YXIgZCwgaCwgbDsKICAgIGNvbnN0IGMgPSBbZV07CiAgICBsZXQgdCA9ICgoZCA9IGYubm9kZXNbZV0pID09IG51bGwgPyB2b2lkIDAgOiBkLnBhcmVudElkKSA/PyAoKGggPSBmLmNvbnRhaW5lcnNbZV0pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKTsKICAgIGZvciAoOyB0OyApCiAgICAgIGMudW5zaGlmdCh0KSwgdCA9IChsID0gZi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogbC5wYXJlbnRJZDsKICAgIHJldHVybiBjOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihlLCBmLCBjKSB7CiAgICBjb25zdCB0ID0gZi5nZXQoZSk7CiAgICBpZiAoIXQgfHwgdC5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBkID0gMCwgaCA9IDA7CiAgICBmb3IgKGNvbnN0IGwgb2YgdCkKICAgICAgYy5oYXMobCkgJiYgKGQgKz0gYy5nZXQobCksIGgrKyk7CiAgICByZXR1cm4gaCA9PT0gMCA/IDAgOiBkIC8gaDsKICB9Cn0KY29uc3QgayA9IDMyLCBRID0gMjQsIF8gPSAyMiwgUiA9IDE4LCBXID0gMzgsICQgPSAyMTAsIFYgPSAzNiwgcnQgPSAxODAsIGF0ID0gNTQsIG50ID0gMjYwLCBzdCA9IDE2MDsKY2xhc3MgWSB7CiAgc3RhdGljIGFzc2lnbkNvb3JkaW5hdGVzKGUsIGYsIGMsIHQgPSB7IGRpcmVjdGlvbjogIlRCIiwgbW9kZTogImF1dG8iLCBhc3BlY3RSYXRpbzogMS41NSB9KSB7CiAgICBjb25zdCBkID0gdC5kaXJlY3Rpb24gPz8gIlRCIiwgaCA9IGQgPT09ICJUQiIgfHwgZCA9PT0gIkJUIiwgbCA9IGQgPT09ICJCVCIgfHwgZCA9PT0gIlJMIiwgbiA9IHQuYXNwZWN0UmF0aW8gPz8gMS41NSwgcyA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykubGVuZ3RoLCB5ID0gdC5tb2RlICYmIHQubW9kZSAhPT0gImF1dG8iID8gdC5tb2RlIDogcyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIsIGkgPSB7fSwgciA9IHt9LCBwID0gKGcpID0+IHsKICAgICAgdmFyIG8sIEksIE0sIEUsIFM7CiAgICAgIGNvbnN0IGEgPSAhIWUuY29udGFpbmVyc1tnXSwgdyA9ICEhKChvID0gZS5jb250YWluZXJzW2ddKSAhPSBudWxsICYmIG8uY29sbGFwc2VkKTsKICAgICAgcmV0dXJuIGEgJiYgdyA/IHsgd2lkdGg6ICQsIGhlaWdodDogViB9IDogYSAmJiAhdyA/IHsKICAgICAgICB3aWR0aDogKChJID0gYy5nZXQoZykpID09IG51bGwgPyB2b2lkIDAgOiBJLndpZHRoKSB8fCBudCwKICAgICAgICBoZWlnaHQ6ICgoTSA9IGMuZ2V0KGcpKSA9PSBudWxsID8gdm9pZCAwIDogTS5oZWlnaHQpIHx8IHN0CiAgICAgIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoRSA9IGMuZ2V0KGcpKSA9PSBudWxsID8gdm9pZCAwIDogRS53aWR0aCkgfHwgcnQsCiAgICAgICAgaGVpZ2h0OiAoKFMgPSBjLmdldChnKSkgPT0gbnVsbCA/IHZvaWQgMCA6IFMuaGVpZ2h0KSB8fCBhdAogICAgICB9OwogICAgfTsKICAgIHJldHVybiB5ID09PSAiY29uY3VycmVudCIgPyBZLmxheW91dENvbmN1cnJlbnRIaWVyYXJjaHkoCiAgICAgIGUsCiAgICAgIHAsCiAgICAgIG4sCiAgICAgIGksCiAgICAgIHIKICAgICkgOiBZLmxheW91dEZsb3dUcmVlKAogICAgICBlLAogICAgICBmLAogICAgICBwLAogICAgICBoLAogICAgICBsLAogICAgICB0LAogICAgICBpLAogICAgICByCiAgICApLCBZLmFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgaSwgciksIHsgbm9kZXM6IGksIGNvbnRhaW5lcnM6IHIgfTsKICB9CiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgLy8gQ09OQ1VSUkVOVCBDT01QT1VORCBQQUNLSU5HIFdJVEggU0tZTElORSAyRCBCSU4gUEFDS0lORwogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KGUsIGYsIGMsIHQsIGQpIHsKICAgIHZhciBnOwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFthLCB3XSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCBvID0gdy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBoLmhhcyhvKSB8fCBoLnNldChvLCBbXSksIGguZ2V0KG8pLnB1c2goYSk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFthLCB3XSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IG8gPSB3LnBhcmVudElkID8/IG51bGw7CiAgICAgIGguaGFzKG8pIHx8IGguc2V0KG8sIFtdKSwgaC5nZXQobykucHVzaChhKTsKICAgIH0KICAgIGNvbnN0IGwgPSBZLmdldENvbnRhaW5lckRlcHRocyhlKSwgbiA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKGEsIHcpID0+IChsLmdldCh3KSB8fCAwKSAtIChsLmdldChhKSB8fCAwKQogICAgKSwgcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBhIG9mIG4pIHsKICAgICAgaWYgKCEhKChnID0gZS5jb250YWluZXJzW2FdKSAhPSBudWxsICYmIGcuY29sbGFwc2VkKSkgewogICAgICAgIHMuc2V0KGEsIHsKICAgICAgICAgIHdpZHRoOiAkLAogICAgICAgICAgaGVpZ2h0OiBWCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgbyA9IGguZ2V0KGEpIHx8IFtdOwogICAgICBpZiAoby5sZW5ndGggPT09IDApIHsKICAgICAgICBzLnNldChhLCB7CiAgICAgICAgICB3aWR0aDogJCwKICAgICAgICAgIGhlaWdodDogVyArIFIgKiAyCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgSSA9IG8ubWFwKChBKSA9PiB7CiAgICAgICAgY29uc3QgRiA9IHMuaGFzKEEpID8gcy5nZXQoQSkgOiBmKEEpOwogICAgICAgIHJldHVybiB7IGlkOiBBLCB3aWR0aDogRi53aWR0aCwgaGVpZ2h0OiBGLmhlaWdodCB9OwogICAgICB9KSwgTSA9IFkuZmluZEJlc3RUaWdodFBhY2tpbmcoSSwgYyk7CiAgICAgIGZvciAoY29uc3QgQSBvZiBNLmJveGVzKQogICAgICAgIHkuc2V0KEEuaWQsIEEpOwogICAgICBjb25zdCBFID0gTWF0aC5tYXgoTS53aWR0aCArIF8gKiAyLCAkKSwgUyA9IE0uaGVpZ2h0ICsgVyArIFIgKiAyOwogICAgICBzLnNldChhLCB7IHdpZHRoOiBFLCBoZWlnaHQ6IFMgfSk7CiAgICB9CiAgICBjb25zdCBpID0gaC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgciA9IFtdOwogICAgaWYgKGkubGVuZ3RoID4gMCkgewogICAgICBjb25zdCBhID0gaS5tYXAoKG8pID0+IHsKICAgICAgICBjb25zdCBJID0gcy5nZXQobykgfHwgZihvKTsKICAgICAgICByZXR1cm4geyBpZDogbywgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgfSk7CiAgICAgIHIgPSBZLmZpbmRCZXN0VGlnaHRQYWNraW5nKGEsIGMpLmJveGVzLm1hcCgobykgPT4gKHsKICAgICAgICAuLi5vLAogICAgICAgIGxvY2FsWDogby5sb2NhbFggKyA2MCwKICAgICAgICBsb2NhbFk6IG8ubG9jYWxZICsgNjAKICAgICAgfSkpOwogICAgfQogICAgY29uc3QgcCA9IChhLCB3LCBvLCBJLCBNKSA9PiB7CiAgICAgIHZhciBBOwogICAgICBjb25zdCBFID0gISFlLmNvbnRhaW5lcnNbYV0sIFMgPSB7IGlkOiBhLCB4OiB3LCB5OiBvLCB3aWR0aDogSSwgaGVpZ2h0OiBNIH07CiAgICAgIGlmIChFKSB7CiAgICAgICAgaWYgKGRbYV0gPSBTLCAoQSA9IGUuY29udGFpbmVyc1thXSkgIT0gbnVsbCAmJiBBLmNvbGxhcHNlZCkgcmV0dXJuOwogICAgICAgIGNvbnN0IEYgPSB3ICsgXywgSCA9IG8gKyBXICsgUiwgVSA9IGguZ2V0KGEpIHx8IFtdOwogICAgICAgIGZvciAoY29uc3QgTCBvZiBVKSB7CiAgICAgICAgICBjb25zdCBCID0geS5nZXQoTCk7CiAgICAgICAgICBCICYmIHAoCiAgICAgICAgICAgIEwsCiAgICAgICAgICAgIEYgKyBCLmxvY2FsWCwKICAgICAgICAgICAgSCArIEIubG9jYWxZLAogICAgICAgICAgICBCLndpZHRoLAogICAgICAgICAgICBCLmhlaWdodAogICAgICAgICAgKTsKICAgICAgICB9CiAgICAgIH0gZWxzZQogICAgICAgIHRbYV0gPSBTOwogICAgfTsKICAgIGZvciAoY29uc3QgYSBvZiByKQogICAgICBwKGEuaWQsIGEubG9jYWxYLCBhLmxvY2FsWSwgYS53aWR0aCwgYS5oZWlnaHQpOwogIH0KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcoZSwgZikgewogICAgaWYgKGUubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBlWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogZVswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBlWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IGVbMF0ud2lkdGgsIGhlaWdodDogZVswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IGMgPSBlLnJlZHVjZSgoaSwgcikgPT4gaSArIHIud2lkdGggKiByLmhlaWdodCwgMCksIHQgPSBNYXRoLm1heCguLi5lLm1hcCgoaSkgPT4gaS53aWR0aCkpLCBkID0gWy4uLmVdLnNvcnQoKGksIHIpID0+IHIud2lkdGggLSBpLndpZHRoKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGwgPSBlLnJlZHVjZSgoaSwgcikgPT4gaSArIHIud2lkdGgsIDApICsgKGUubGVuZ3RoIC0gMSkgKiBrOwogICAgaC5hZGQobCksIGguYWRkKHQpOwogICAgY29uc3QgbiA9IE1hdGgubWF4KHQsIE1hdGguc3FydChjICogZikpOwogICAgaC5hZGQobiksIGguYWRkKG4gKiAwLjg1KSwgaC5hZGQobiAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKGUubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IGkgPSAyOyBpIDw9IHM7IGkrKykgewogICAgICBsZXQgciA9IDA7CiAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgaSAmJiBwIDwgZC5sZW5ndGg7IHArKykKICAgICAgICByICs9IGRbcF0ud2lkdGg7CiAgICAgIHIgKz0gKGkgLSAxKSAqIGssIHIgPj0gdCAmJiBoLmFkZChyKTsKICAgIH0KICAgIGxldCB5ID0gbnVsbDsKICAgIGZvciAoY29uc3QgaSBvZiBoKSB7CiAgICAgIGNvbnN0IHIgPSBZLnNpbXVsYXRlU2t5bGluZVBhY2tpbmcoZSwgaSksIHAgPSByLndpZHRoICogci5oZWlnaHQsIGcgPSBNYXRoLm1heCgwLCBwIC0gYyksIGEgPSByLndpZHRoIC8gTWF0aC5tYXgoMSwgci5oZWlnaHQpLCB3ID0gTWF0aC5hYnMoTWF0aC5sb2coYSAvIGYpKSwgbyA9IGcgLyBjICogMiArIHcgKiAwLjI1OwogICAgICByLnNjb3JlID0gbywgKCF5IHx8IG8gPCB5LnNjb3JlKSAmJiAoeSA9IHIpOwogICAgfQogICAgcmV0dXJuIHk7CiAgfQogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGYpIHsKICAgIGNvbnN0IGMgPSBbLi4uZV0uc29ydCgobiwgcykgPT4gcy5oZWlnaHQgLSBuLmhlaWdodCksIHQgPSBbeyB4OiAwLCB3aWR0aDogZiwgeTogMCB9XSwgZCA9IFtdOwogICAgZm9yIChjb25zdCBuIG9mIGMpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCBvID0gMDsgbyA8IHQubGVuZ3RoOyBvKyspIHsKICAgICAgICBpZiAodFtvXS54ICsgbi53aWR0aCA+IGYpIGNvbnRpbnVlOwogICAgICAgIGxldCBNID0gMCwgRSA9IDA7CiAgICAgICAgZm9yIChsZXQgUyA9IG87IFMgPCB0Lmxlbmd0aCAmJiBFIDwgbi53aWR0aDsgUysrKQogICAgICAgICAgTSA9IE1hdGgubWF4KE0sIHRbU10ueSksIEUgKz0gdFtTXS53aWR0aDsKICAgICAgICBNIDwgcyAmJiAocyA9IE0sIHkgPSBvKTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCBvID0gTWF0aC5tYXgoLi4udC5tYXAoKE0pID0+IE0ueSkpLCBJID0gbyA9PT0gMCA/IDAgOiBvICsgUTsKICAgICAgICBkLnB1c2goewogICAgICAgICAgaWQ6IG4uaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IEksCiAgICAgICAgICB3aWR0aDogbi53aWR0aCwKICAgICAgICAgIGhlaWdodDogbi5oZWlnaHQKICAgICAgICB9KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goeyB4OiAwLCB3aWR0aDogbi53aWR0aCArIGssIHk6IEkgKyBuLmhlaWdodCB9KSwgZiA+IG4ud2lkdGggKyBrICYmIHQucHVzaCh7CiAgICAgICAgICB4OiBuLndpZHRoICsgaywKICAgICAgICAgIHdpZHRoOiBmIC0gKG4ud2lkdGggKyBrKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBpID0gdFt5XS54LCByID0gcyA9PT0gMCA/IDAgOiBzICsgUTsKICAgICAgZC5wdXNoKHsKICAgICAgICBpZDogbi5pZCwKICAgICAgICBsb2NhbFg6IGksCiAgICAgICAgbG9jYWxZOiByLAogICAgICAgIHdpZHRoOiBuLndpZHRoLAogICAgICAgIGhlaWdodDogbi5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IHAgPSBuLndpZHRoICsgaywgZyA9IHIgKyBuLmhlaWdodCwgYSA9IHsgeDogaSwgd2lkdGg6IHAsIHk6IGcgfSwgdyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG8gb2YgdCkKICAgICAgICBvLnggKyBvLndpZHRoIDw9IGkgfHwgby54ID49IGkgKyBwID8gdy5wdXNoKG8pIDogKG8ueCA8IGkgJiYgdy5wdXNoKHsgeDogby54LCB3aWR0aDogaSAtIG8ueCwgeTogby55IH0pLCBvLnggKyBvLndpZHRoID4gaSArIHAgJiYgdy5wdXNoKHsKICAgICAgICAgIHg6IGkgKyBwLAogICAgICAgICAgd2lkdGg6IG8ueCArIG8ud2lkdGggLSAoaSArIHApLAogICAgICAgICAgeTogby55CiAgICAgICAgfSkpOwogICAgICB3LnB1c2goYSksIHcuc29ydCgobywgSSkgPT4gby54IC0gSS54KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goLi4udyk7CiAgICB9CiAgICBjb25zdCBoID0gTWF0aC5tYXgoLi4uZC5tYXAoKG4pID0+IG4ubG9jYWxYICsgbi53aWR0aCksIDApLCBsID0gTWF0aC5tYXgoLi4uZC5tYXAoKG4pID0+IG4ubG9jYWxZICsgbi5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBoLCBoZWlnaHQ6IGwsIGJveGVzOiBkLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgV0lUSCBDT01QT1VORCBDT05UQUlORVIgU1VQUE9SVAogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRGbG93VHJlZShlLCBmLCBjLCB0LCBkLCBoLCBsLCBuKSB7CiAgICB2YXIgdHQ7CiAgICBjb25zdCBzID0gQXJyYXkuZnJvbShmLmtleXMoKSkuc29ydCgodSwgeCkgPT4gdSAtIHgpLCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGxldCBpID0gODA7CiAgICBjb25zdCByID0gdCA/IFcgKyBSICogMiA6IF8gKiAyLCBwID0gKHQgPyBRICogMS41IDogayAqIDEuNSkgKyByLCBnID0gdCA/IGsgOiBRLCBhID0gZCA/IFsuLi5zXS5yZXZlcnNlKCkgOiBbLi4uc107CiAgICBmb3IgKGNvbnN0IHUgb2YgYSkgewogICAgICBjb25zdCB4ID0gZi5nZXQodSkgfHwgW107CiAgICAgIGxldCBPID0gMDsKICAgICAgZm9yIChjb25zdCBtIG9mIHgpIHsKICAgICAgICBjb25zdCBiID0gYyhtKSwgUCA9IHQgPyBiLmhlaWdodCA6IGIud2lkdGg7CiAgICAgICAgTyA9IE1hdGgubWF4KE8sIFApOwogICAgICB9CiAgICAgIHkuc2V0KHUsIGkpLCBpICs9IE8gKyBwOwogICAgfQogICAgY29uc3QgdyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCB1IG9mIE9iamVjdC52YWx1ZXMoZS5lZGdlcykpCiAgICAgIHcuaGFzKHUudGFyZ2V0SWQpIHx8IHcuc2V0KHUudGFyZ2V0SWQsIFtdKSwgdy5nZXQodS50YXJnZXRJZCkucHVzaCh1LnNvdXJjZUlkKSwgby5oYXModS5zb3VyY2VJZCkgfHwgby5zZXQodS5zb3VyY2VJZCwgW10pLCBvLmdldCh1LnNvdXJjZUlkKS5wdXNoKHUudGFyZ2V0SWQpOwogICAgY29uc3QgSSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIE0gPSAodSkgPT4gewogICAgICB2YXIgeCwgTzsKICAgICAgcmV0dXJuICgoeCA9IGUubm9kZXNbdV0pID09IG51bGwgPyB2b2lkIDAgOiB4LnBhcmVudElkKSA/PyAoKE8gPSBlLmNvbnRhaW5lcnNbdV0pID09IG51bGwgPyB2b2lkIDAgOiBPLnBhcmVudElkKSA/PyBudWxsOwogICAgfTsKICAgIGZvciAoY29uc3QgdSBvZiBzKSB7CiAgICAgIGNvbnN0IHggPSBmLmdldCh1KSB8fCBbXTsKICAgICAgbGV0IE8gPSAtMSAvIDAsIG07CiAgICAgIGZvciAoY29uc3QgYiBvZiB4KSB7CiAgICAgICAgY29uc3QgUCA9IGMoYiksIE4gPSB0ID8gUC53aWR0aCA6IFAuaGVpZ2h0LCBEID0gdy5nZXQoYikgfHwgW10sIHYgPSBNKGIpOwogICAgICAgIGxldCBDID0gZzsKICAgICAgICBtICE9PSB2b2lkIDAgJiYgbSAhPT0gdiAmJiAoQyA9IGcgKyAodCA/IF8gKiAyIDogVyArIFIgKiAyKSk7CiAgICAgICAgbGV0IFQgPSBudWxsOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEogPSBELm1hcCgocSkgPT4gewogICAgICAgICAgICBjb25zdCBLID0gSS5nZXQocSk7CiAgICAgICAgICAgIGlmIChLID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBldCA9IGMocSk7CiAgICAgICAgICAgIHJldHVybiBLICsgKHQgPyBldC53aWR0aCA6IGV0LmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChxKSA9PiBxICE9PSBudWxsKTsKICAgICAgICAgIEoubGVuZ3RoID4gMCAmJiAoVCA9IEoucmVkdWNlKChxLCBLKSA9PiBxICsgSywgMCkgLyBKLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBqID0gVCAhPT0gbnVsbCA/IFQgLSBOIC8gMiA6IDgwOwogICAgICAgIGogPCBPICsgQyAmJiAoaiA9IE8gPT09IC0xIC8gMCA/IDgwIDogTyArIEMpLCBJLnNldChiLCBqKSwgTyA9IGogKyBOLCBtID0gdjsKICAgICAgfQogICAgfQogICAgZm9yIChsZXQgdSA9IHMubGVuZ3RoIC0gMTsgdSA+PSAwOyB1LS0pIHsKICAgICAgY29uc3QgeCA9IHNbdV0sIE8gPSBmLmdldCh4KSB8fCBbXTsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBOID0gby5nZXQoUCkgfHwgW107CiAgICAgICAgaWYgKE4ubGVuZ3RoID09PSAwKSBjb250aW51ZTsKICAgICAgICBjb25zdCBEID0gTi5tYXAoKHYpID0+IHsKICAgICAgICAgIGNvbnN0IEMgPSBJLmdldCh2KTsKICAgICAgICAgIGlmIChDID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgY29uc3QgVCA9IGModik7CiAgICAgICAgICByZXR1cm4gQyArICh0ID8gVC53aWR0aCA6IFQuaGVpZ2h0KSAvIDI7CiAgICAgICAgfSkuZmlsdGVyKCh2KSA9PiB2ICE9PSBudWxsKTsKICAgICAgICBpZiAoRC5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCB2ID0gRC5yZWR1Y2UoKGosIEopID0+IGogKyBKLCAwKSAvIEQubGVuZ3RoLCBDID0gYyhQKSwgVCA9IHQgPyBDLndpZHRoIDogQy5oZWlnaHQ7CiAgICAgICAgICBJLnNldChQLCB2IC0gVCAvIDIpOwogICAgICAgIH0KICAgICAgfQogICAgICBsZXQgbSA9IC0xIC8gMCwgYjsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBOID0gYyhQKSwgRCA9IHQgPyBOLndpZHRoIDogTi5oZWlnaHQsIHYgPSBNKFApOwogICAgICAgIGxldCBDID0gZzsKICAgICAgICBiICE9PSB2b2lkIDAgJiYgYiAhPT0gdiAmJiAoQyA9IGcgKyAodCA/IF8gKiAyIDogVyArIFIgKiAyKSk7CiAgICAgICAgbGV0IFQgPSBJLmdldChQKSA/PyA4MDsKICAgICAgICBUIDwgbSArIEMgJiYgKFQgPSBtICsgQywgSS5zZXQoUCwgVCkpLCBtID0gVCArIEQsIGIgPSB2OwogICAgICB9CiAgICB9CiAgICBsZXQgRSA9IDEgLyAwOwogICAgZm9yIChjb25zdCB1IG9mIEkudmFsdWVzKCkpIEUgPSBNYXRoLm1pbihFLCB1KTsKICAgIGNvbnN0IFMgPSBFIDwgODAgPyA4MCAtIEUgOiAwOwogICAgZm9yIChjb25zdCB1IG9mIHMpIHsKICAgICAgY29uc3QgeCA9IGYuZ2V0KHUpIHx8IFtdLCBPID0geS5nZXQodSkgfHwgODA7CiAgICAgIGZvciAoY29uc3QgbSBvZiB4KSB7CiAgICAgICAgY29uc3QgYiA9IGMobSksIFAgPSAoSS5nZXQobSkgPz8gODApICsgUywgdiA9IHsgaWQ6IG0sIHg6IHQgPyBQIDogTywgeTogdCA/IE8gOiBQLCB3aWR0aDogYi53aWR0aCwgaGVpZ2h0OiBiLmhlaWdodCB9OwogICAgICAgIGUuY29udGFpbmVyc1ttXSA/IG5bbV0gPSB2IDogbFttXSA9IHY7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IEEgPSBZLmdldENvbnRhaW5lckRlcHRocyhlKSwgRiA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHUsIHgpID0+IChBLmdldCh4KSB8fCAwKSAtIChBLmdldCh1KSB8fCAwKQogICAgKSwgSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt1LCB4XSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkKICAgICAgeC5wYXJlbnRJZCAmJiAoSC5oYXMoeC5wYXJlbnRJZCkgfHwgSC5zZXQoeC5wYXJlbnRJZCwgW10pLCBILmdldCh4LnBhcmVudElkKS5wdXNoKHUpKTsKICAgIGZvciAoY29uc3QgW3UsIHhdIG9mIE9iamVjdC5lbnRyaWVzKGUuY29udGFpbmVycykpCiAgICAgIHgucGFyZW50SWQgJiYgKEguaGFzKHgucGFyZW50SWQpIHx8IEguc2V0KHgucGFyZW50SWQsIFtdKSwgSC5nZXQoeC5wYXJlbnRJZCkucHVzaCh1KSk7CiAgICBmb3IgKGNvbnN0IHUgb2YgRikgewogICAgICBpZiAoKHR0ID0gZS5jb250YWluZXJzW3VdKSAhPSBudWxsICYmIHR0LmNvbGxhcHNlZCkgewogICAgICAgIG5bdV0gfHwgKG5bdV0gPSB7CiAgICAgICAgICBpZDogdSwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogJCwKICAgICAgICAgIGhlaWdodDogVgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHggPSBILmdldCh1KSB8fCBbXSwgTyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG0gb2YgeCkgewogICAgICAgIGNvbnN0IGIgPSBsW21dIHx8IG5bbV07CiAgICAgICAgYiAmJiBPLnB1c2goYik7CiAgICAgIH0KICAgICAgaWYgKE8ubGVuZ3RoID09PSAwKQogICAgICAgIG5bdV0gfHwgKG5bdV0gPSB7CiAgICAgICAgICBpZDogdSwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogbnQsCiAgICAgICAgICBoZWlnaHQ6IHN0CiAgICAgICAgfSk7CiAgICAgIGVsc2UgewogICAgICAgIGxldCBtID0gMSAvIDAsIGIgPSAtMSAvIDAsIFAgPSAxIC8gMCwgTiA9IC0xIC8gMDsKICAgICAgICBmb3IgKGNvbnN0IGogb2YgTykKICAgICAgICAgIG0gPSBNYXRoLm1pbihtLCBqLngpLCBiID0gTWF0aC5tYXgoYiwgai54ICsgai53aWR0aCksIFAgPSBNYXRoLm1pbihQLCBqLnkpLCBOID0gTWF0aC5tYXgoTiwgai55ICsgai5oZWlnaHQpOwogICAgICAgIGNvbnN0IEQgPSBNYXRoLm1heChiIC0gbSArIF8gKiAyLCAkKSwgdiA9IE4gLSBQICsgVyArIFIgKiAyLCBDID0gbSAtIF8sIFQgPSBQIC0gVyAtIFI7CiAgICAgICAgblt1XSA9IHsgaWQ6IHUsIHg6IEMsIHk6IFQsIHdpZHRoOiBELCBoZWlnaHQ6IHYgfTsKICAgICAgfQogICAgfQogICAgbGV0IFUgPSAxIC8gMCwgTCA9IDEgLyAwOwogICAgZm9yIChjb25zdCB1IG9mIFsuLi5PYmplY3QudmFsdWVzKGwpLCAuLi5PYmplY3QudmFsdWVzKG4pXSkKICAgICAgVSA9IE1hdGgubWluKFUsIHUueCksIEwgPSBNYXRoLm1pbihMLCB1LnkpOwogICAgY29uc3QgQiA9IDYwLCBaID0gVSA8IEIgPyBCIC0gVSA6IDAsIHogPSBMIDwgQiA/IEIgLSBMIDogMDsKICAgIGlmIChaICE9PSAwIHx8IHogIT09IDApIHsKICAgICAgZm9yIChjb25zdCB1IG9mIE9iamVjdC52YWx1ZXMobCkpCiAgICAgICAgdS54ICs9IFosIHUueSArPSB6OwogICAgICBmb3IgKGNvbnN0IHUgb2YgT2JqZWN0LnZhbHVlcyhuKSkKICAgICAgICB1LnggKz0gWiwgdS55ICs9IHo7CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIGYsIGMpIHsKICAgIHZhciBkLCBoOwogICAgY29uc3QgdCA9IChsKSA9PiBmW2xdIHx8IGNbbF07CiAgICBmb3IgKGNvbnN0IGwgb2YgT2JqZWN0LnZhbHVlcyhlLmVkZ2VzKSkgewogICAgICBjb25zdCBuID0gdChsLnNvdXJjZUlkKSwgcyA9IHQobC50YXJnZXRJZCk7CiAgICAgIGlmICghbiB8fCAhcykgY29udGludWU7CiAgICAgIGNvbnN0IHkgPSBlLm5vZGVzW2wuc291cmNlSWRdIHx8IGUuY29udGFpbmVyc1tsLnNvdXJjZUlkXSwgaSA9IGUubm9kZXNbbC50YXJnZXRJZF0gfHwgZS5jb250YWluZXJzW2wudGFyZ2V0SWRdLCByID0gcy54ICsgcy53aWR0aCAvIDIgLSAobi54ICsgbi53aWR0aCAvIDIpLCBwID0gcy55ICsgcy5oZWlnaHQgLyAyIC0gKG4ueSArIG4uaGVpZ2h0IC8gMiksIGcgPSBNYXRoLmFicyhyKSA+IE1hdGguYWJzKHApICogMS4yNSwgYSA9IChkID0geSA9PSBudWxsID8gdm9pZCAwIDogeS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGQuZmluZCgobykgPT4gby5pZCA9PT0gbC5zb3VyY2VQb3J0SWQpOwogICAgICBhICYmICghYS5zaWRlIHx8IGEuc2lkZSA9PT0gImF1dG8iKSAmJiAoZyA/IGEuc2lkZSA9IHIgPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiBhLnNpZGUgPSBwID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgdyA9IChoID0gaSA9PSBudWxsID8gdm9pZCAwIDogaS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGguZmluZCgobykgPT4gby5pZCA9PT0gbC50YXJnZXRQb3J0SWQpOwogICAgICB3ICYmICghdy5zaWRlIHx8IHcuc2lkZSA9PT0gImF1dG8iKSAmJiAoZyA/IHcuc2lkZSA9IHIgPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiB3LnNpZGUgPSBwID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhlKSB7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYyA9ICh0KSA9PiB7CiAgICAgIHZhciBsOwogICAgICBpZiAoZi5oYXModCkpIHJldHVybiBmLmdldCh0KTsKICAgICAgY29uc3QgZCA9IChsID0gZS5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogbC5wYXJlbnRJZDsKICAgICAgaWYgKCFkIHx8ICFlLmNvbnRhaW5lcnNbZF0pCiAgICAgICAgcmV0dXJuIGYuc2V0KHQsIDApLCAwOwogICAgICBjb25zdCBoID0gMSArIGMoZCk7CiAgICAgIHJldHVybiBmLnNldCh0LCBoKSwgaDsKICAgIH07CiAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmtleXMoZS5jb250YWluZXJzKSkKICAgICAgYyh0KTsKICAgIHJldHVybiBmOwogIH0KfQpmdW5jdGlvbiBvdChYLCBlLCBmKSB7CiAgdmFyIGQsIGg7CiAgbGV0IGMgPSBYLCB0ID0gbnVsbDsKICBmb3IgKDsgYzsgKQogICAgZi5oYXMoYykgJiYgKHQgPSBjKSwgYyA9ICgoZCA9IGUubm9kZXNbY10pID09IG51bGwgPyB2b2lkIDAgOiBkLnBhcmVudElkKSA/PyAoKGggPSBlLmNvbnRhaW5lcnNbY10pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIHQgPz8gWDsKfQpjbGFzcyBkdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBmLCBjKSB7CiAgICBjb25zdCB0ID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCBkID0gT2JqZWN0LnZhbHVlcyhlLm5vZGVzKSwgaCA9IG5ldyBTZXQoCiAgICAgIHQuZmlsdGVyKChnKSA9PiAhIWcuY29sbGFwc2VkKS5tYXAoKGcpID0+IGcuaWQpCiAgICApLCBsID0gKGcpID0+IHsKICAgICAgdmFyIHc7CiAgICAgIGxldCBhID0gZzsKICAgICAgZm9yICg7IGE7ICkgewogICAgICAgIGlmIChoLmhhcyhhKSkgcmV0dXJuICEwOwogICAgICAgIGEgPSAodyA9IGUuY29udGFpbmVyc1thXSkgPT0gbnVsbCA/IHZvaWQgMCA6IHcucGFyZW50SWQ7CiAgICAgIH0KICAgICAgcmV0dXJuICExOwogICAgfSwgbiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IFtnLCBhXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkKICAgICAgbChhLnBhcmVudElkKSB8fCBuLmFkZChnKTsKICAgIGZvciAoY29uc3QgW2csIGFdIG9mIE9iamVjdC5lbnRyaWVzKGUuY29udGFpbmVycykpCiAgICAgIGEuY29sbGFwc2VkID8gbChhLnBhcmVudElkKSB8fCBuLmFkZChnKSA6ICEoZC5zb21lKChvKSA9PiBvLnBhcmVudElkID09PSBnKSB8fCB0LnNvbWUoKG8pID0+IG8ucGFyZW50SWQgPT09IGcpKSAmJiAhbChhLnBhcmVudElkKSAmJiBuLmFkZChnKTsKICAgIGNvbnN0IHMgPSB7fTsKICAgIGZvciAoY29uc3QgW2csIGFdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHcgPSBvdChhLnNvdXJjZUlkLCBlLCBoKSwgbyA9IG90KGEudGFyZ2V0SWQsIGUsIGgpOwogICAgICB3ICE9PSBvICYmIG4uaGFzKHcpICYmIG4uaGFzKG8pICYmIChzW2ddID0gewogICAgICAgIC4uLmEsCiAgICAgICAgc291cmNlSWQ6IHcsCiAgICAgICAgdGFyZ2V0SWQ6IG8KICAgICAgfSk7CiAgICB9CiAgICBjb25zdCB5ID0gewogICAgICAuLi5lLAogICAgICBlZGdlczogcwogICAgfSwgaSA9IGN0LmRlY291cGxlKHksIG4pLCByID0gaXQuYXNzaWduTGF5ZXJzKGkuYWxsRW50aXR5SWRzLCBpLmFkakxpc3QpLCBwID0gRy5taW5pbWl6ZUNyb3NzaW5ncyhyLCBpLmFkakxpc3QsIDQsIHkpOwogICAgcmV0dXJuIFkuYXNzaWduQ29vcmRpbmF0ZXMoeSwgcCwgZiwgYyk7CiAgfQp9CmNvbnN0IGh0ID0gbmV3IGR0KCk7CnNlbGYub25tZXNzYWdlID0gYXN5bmMgKFgpID0+IHsKICBjb25zdCB7IGlkOiBlLCBncmFwaDogZiwgbWVhc3VyZW1lbnRzOiBjLCBvcHRpb25zOiB0IH0gPSBYLmRhdGE7CiAgdHJ5IHsKICAgIGNvbnN0IGQgPSBuZXcgTWFwKGMpLCBoID0gYXdhaXQgaHQuZXhlY3V0ZShmLCBkLCB0KTsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITAsIGxheW91dDogaCB9KTsKICB9IGNhdGNoIChkKSB7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IGUsIHN1Y2Nlc3M6ICExLCBlcnJvcjogZC5tZXNzYWdlIH0pOwogIH0KfTsK", he = (i) => Uint8Array.from(atob(i), (g) => g.charCodeAt(0)), Qt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", he(Mt)], { type: "text/javascript;charset=utf-8" });
function ye(i) {
  let g;
  try {
    if (g = Qt && (self.URL || self.webkitURL).createObjectURL(Qt), !g) throw "";
    const n = new Worker(g, {
      type: "module",
      name: i == null ? void 0 : i.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(g);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Mt,
      {
        type: "module",
        name: i == null ? void 0 : i.name
      }
    );
  }
}
class Be {
  constructor() {
    St(this, "worker", null);
    St(this, "pendingRequests", /* @__PURE__ */ new Map());
    St(this, "fallbackEngine", new ue());
    if (typeof Worker < "u")
      try {
        this.worker = new ye(), this.worker.onmessage = (g) => {
          const { id: n, success: s, layout: I, error: r } = g.data, c = this.pendingRequests.get(n);
          c && (this.pendingRequests.delete(n), s ? c.resolve(I) : c.reject(new Error(r)));
        }, this.worker.onerror = (g) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", g);
        };
      } catch (g) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", g), this.worker = null;
      }
  }
  execute(g, n, s) {
    return this.worker ? new Promise((I, r) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: I, reject: r });
      const l = Array.from(n.entries());
      this.worker.postMessage({
        id: c,
        graph: g,
        measurements: l,
        options: s
      });
    }) : this.fallbackEngine.execute(g, n, s);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class fe {
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: n, hoveredEntity: s, graph: I } = g;
    return s && s.id === n.id ? null : s && I.containers[s.id] ? n.parentId === s.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: n.id,
        newParentId: s.id
      }
    } : !s && n.parentId !== null && n.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: n.id,
        newParentId: null
      }
    } : null;
  }
}
class De {
  constructor() {
    // Distance threshold (in world coordinates) required to trigger extraction
    St(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: n, hoveredEdge: s, hoveredEntity: I, cursorWorld: r, startWorldPos: c, graph: l } = g;
    if (I && l.containers[I.id])
      return I.id !== n.id && n.parentId !== I.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: n.id,
          newParentId: I.id
        }
      } : null;
    if (!I && !s) {
      const C = Object.values(l.edges).filter(
        (a) => a.targetId === n.id
      ), h = Object.values(l.edges).filter(
        (a) => a.sourceId === n.id
      );
      if (C.length === 1 && h.length === 1 && C[0].sourceId !== h[0].targetId && Math.hypot(
        r.x - c.x,
        r.y - c.y
      ) >= this.dragOffThreshold)
        return {
          type: "NODE_EXTRACT",
          payload: {
            nodeId: n.id,
            incomingEdgeId: C[0].id,
            outgoingEdgeId: h[0].id
          }
        };
      if (n.parentId !== null && n.parentId !== void 0)
        return {
          type: "ENTITY_REPARENT",
          payload: {
            entityId: n.id,
            newParentId: null
          }
        };
    }
    const o = (C) => {
      const h = l.nodes[C.id] || C;
      if (!h.ports || h.ports.length === 0) return "";
      const a = Object.values(l.edges).find((y) => y.targetId === C.id);
      if (a) {
        const y = h.ports.find((A) => A.id === a.targetPortId);
        if (y) return y.id;
      }
      const f = new Set(
        Object.values(l.edges).filter((y) => y.sourceId === C.id).map((y) => y.sourcePortId)
      ), b = h.ports.find((y) => !f.has(y.id));
      return b ? b.id : h.ports[0].id;
    };
    if (s)
      return s.sourceId === n.id || s.targetId === n.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: s.id,
          newSourceId: s.sourceId,
          newTargetId: n.id,
          newTargetPortId: o(n)
        }
      };
    if (I && I.id !== n.id && l.nodes[I.id]) {
      const C = Object.values(l.edges).find(
        (h) => h.targetId === I.id && h.sourceId !== n.id
      );
      if (C)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: C.id,
            newSourceId: C.sourceId,
            newTargetId: n.id,
            newTargetPortId: o(n)
          }
        };
    }
    return null;
  }
}
function we(i, g = { min: 0.15, max: 3 }) {
  const [n, s] = et({ x: 80, y: 80, zoom: 1 }), I = Ct(!1), r = Ct({ x: 0, y: 0 }), c = M(
    (A, e) => {
      if (!i.current) return { x: A, y: e };
      const t = i.current.getBoundingClientRect();
      return {
        x: (A - t.left - n.x) / n.zoom,
        y: (e - t.top - n.y) / n.zoom
      };
    },
    [n, i]
  ), l = M(
    (A) => {
      if (!i.current) return;
      const e = [
        ...Object.values(A.nodes),
        ...Object.values(A.containers)
      ];
      if (e.length === 0) {
        s({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, d = 1 / 0, w = -1 / 0, B = -1 / 0;
      for (const Q of e)
        t = Math.min(t, Q.x), d = Math.min(d, Q.y), w = Math.max(w, Q.x + Q.width), B = Math.max(B, Q.y + Q.height);
      const S = i.current.getBoundingClientRect(), m = 80, p = Math.max(w - t, 100), H = Math.max(B - d, 100), W = (S.width - m * 2) / p, P = (S.height - m * 2) / H, L = Math.min(
        Math.max(Math.min(W, P), g.min),
        Math.min(g.max, 1.25)
      ), X = (S.width - p * L) / 2 - t * L, V = (S.height - H * L) / 2 - d * L;
      s({
        x: X,
        y: V,
        zoom: L
      });
    },
    [i, g]
  ), o = M(
    (A) => {
      if (A.preventDefault(), !!i.current)
        if (A.ctrlKey || A.metaKey) {
          const e = i.current.getBoundingClientRect(), t = A.clientX - e.left, d = A.clientY - e.top, w = A.deltaY < 0 ? 1.08 : 0.92, B = Math.min(Math.max(n.zoom * w, g.min), g.max), S = t - (t - n.x) * (B / n.zoom), m = d - (d - n.y) * (B / n.zoom);
          s({ x: S, y: m, zoom: B });
        } else
          s((e) => ({
            ...e,
            x: e.x - A.deltaX,
            y: e.y - A.deltaY
          }));
    },
    [n, g, i]
  ), C = M(
    (A, e) => {
      I.current = !0, r.current = { x: A - n.x, y: e - n.y };
    },
    [n]
  ), h = M((A, e) => {
    I.current && s((t) => ({
      ...t,
      x: A - r.current.x,
      y: e - r.current.y
    }));
  }, []), a = M(() => {
    I.current = !1;
  }, []), f = M(() => {
    s({ x: 80, y: 80, zoom: 1 });
  }, []), b = M(() => {
    s((A) => ({
      ...A,
      zoom: Math.min(A.zoom * 1.2, g.max)
    }));
  }, [g]), y = M(() => {
    s((A) => ({
      ...A,
      zoom: Math.max(A.zoom / 1.2, g.min)
    }));
  }, [g]);
  return {
    transform: n,
    setTransform: s,
    screenToWorld: c,
    onWheel: o,
    startPan: C,
    updatePan: h,
    endPan: a,
    resetTransform: f,
    zoomIn: b,
    zoomOut: y,
    zoomToFit: l,
    isPanning: I
  };
}
function be(i) {
  const [g, n] = et(
    /* @__PURE__ */ new Map()
  );
  Ct(/* @__PURE__ */ new Map());
  const s = Ct(/* @__PURE__ */ new Map()), I = M((r, c) => {
    c ? s.current.set(r, c) : s.current.delete(r);
  }, []);
  return Dt(() => {
    const r = new ResizeObserver((c) => {
      let l = !1;
      const o = new Map(g);
      for (const C of c) {
        const h = C.target.getAttribute("data-sysflow-measure-id");
        if (!h) continue;
        const a = Math.ceil(C.contentRect.width), f = Math.ceil(C.contentRect.height), b = o.get(h);
        (!b || b.width !== a || b.height !== f) && (o.set(h, { width: a, height: f }), l = !0);
      }
      l && n(o);
    });
    return s.current.forEach((c) => r.observe(c)), () => {
      r.disconnect();
    };
  }, [i]), { measurements: g, registerMeasureElement: I };
}
function me(i, g, n, s, I) {
  const [r, c] = et(null), [l, o] = et(null), C = Ct(null), h = Ct(null), a = M(
    (e, t) => {
      let d = null, w = 1 / 0;
      for (const [B, S] of Object.entries(g.containers))
        if (B !== t && e.x >= S.x && e.x <= S.x + S.width && e.y >= S.y && e.y <= S.y + S.height) {
          const m = S.width * S.height;
          m < w && (w = m, d = i.containers[B] || null);
        }
      if (d) return d;
      for (const [B, S] of Object.entries(g.nodes))
        if (B !== t && e.x >= S.x && e.x <= S.x + S.width && e.y >= S.y && e.y <= S.y + S.height)
          return i.nodes[B] || null;
      return null;
    },
    [g, i]
  ), f = M(
    (e, t) => {
      let d = null, w = 45;
      for (const B of Object.values(i.edges)) {
        if (B.sourceId === t || B.targetId === t) continue;
        const S = g.nodes[B.sourceId] || g.containers[B.sourceId], m = g.nodes[B.targetId] || g.containers[B.targetId];
        if (!S || !m) continue;
        const p = S.x + S.width, H = S.y + S.height / 2, W = m.x, P = m.y + m.height / 2;
        for (let L = 0; L <= 10; L++) {
          const X = L / 10, V = (1 - X) * p + X * W, Q = (1 - X) * H + X * P, G = Math.hypot(e.x - V, e.y - Q);
          G < w && (w = G, d = B);
        }
      }
      return d;
    },
    [g, i]
  ), b = M(
    (e, t) => {
      if (t.stopPropagation(), n.canDrag && !n.canDrag(e, i))
        return;
      const d = s(t.clientX, t.clientY);
      c({
        draggedEntity: e,
        ghostPosition: d,
        startPosition: d
      });
    },
    [i, n, s]
  ), y = M(
    (e) => {
      if (!r) return;
      const t = s(e.clientX, e.clientY), d = a(t, r.draggedEntity.id), w = f(t, r.draggedEntity.id);
      C.current = d, h.current = w, d && i.containers[d.id] ? o(d.id) : o(null);
      const B = n.onDragMove ? n.onDragMove({
        draggedEntity: r.draggedEntity,
        cursorWorld: t,
        startWorldPos: r.startPosition,
        hoveredEntity: d,
        hoveredEdge: w,
        graph: i,
        layout: g
      }) : t;
      B && c((S) => S ? { ...S, ghostPosition: B } : null);
    },
    [r, s, n, i, g, a, f]
  ), A = M(
    (e) => {
      if (!r) return;
      const t = s(e.clientX, e.clientY), d = a(t, r.draggedEntity.id), w = f(t, r.draggedEntity.id), B = n.onDragEnd({
        draggedEntity: r.draggedEntity,
        cursorWorld: t,
        startWorldPos: r.startPosition,
        hoveredEntity: d,
        hoveredEdge: w,
        graph: i,
        layout: g
      });
      B && I(B), c(null), o(null), C.current = null, h.current = null;
    },
    [r, s, n, i, g, a, f, I]
  );
  return {
    dragState: r,
    hoveredContainerId: l,
    handlePointerDown: b,
    handlePointerMove: y,
    handlePointerUp: A
  };
}
function Ee(i) {
  const [g, n] = et([i]), [s, I] = et(0), [r, c] = et(null), l = g[s], o = M((e) => {
    const t = ce(e);
    n((d) => [...d.slice(0, s + 1), t]), I((d) => d + 1);
  }, [s]), C = M(() => {
    s > 0 && I((e) => e - 1);
  }, [s]), h = M(() => {
    s < g.length - 1 && I((e) => e + 1);
  }, [s, g.length]), a = M((e) => {
    var d, w, B, S;
    const t = g[s];
    if (e.type === "ENTITY_REPARENT") {
      const { entityId: m, newParentId: p } = e.payload, H = {
        ...t,
        nodes: { ...t.nodes },
        containers: { ...t.containers }
      };
      H.nodes[m] ? H.nodes[m] = { ...H.nodes[m], parentId: p } : H.containers[m] && (H.containers[m] = { ...H.containers[m], parentId: p }), o(H);
    } else if (e.type === "EDGE_SPLIT_INSERT_NODE") {
      const { edge: m, direction: p, suggestedNewNodeId: H, suggestedNewEdge1Id: W, suggestedNewEdge2Id: P } = e.payload, L = t.edges[m.id];
      if (!L) return;
      const X = p === "BT", V = p === "TB", Q = `p_in_${Date.now()}`, G = `p_out_${Date.now()}`;
      let D = "left", u = "right";
      X ? (D = "bottom", u = "top") : V ? (D = "top", u = "bottom") : p === "RL" && (D = "right", u = "left");
      const k = t.nodes[L.sourceId], E = {
        id: H,
        label: `Node ${Object.keys(t.nodes).length + 1}`,
        type: (k == null ? void 0 : k.type) || "FlowTask",
        parentId: (k == null ? void 0 : k.parentId) ?? null,
        ports: [
          { id: Q, label: "in", side: D },
          { id: G, label: "out", side: u }
        ]
      }, Z = {
        id: W,
        sourceId: L.sourceId,
        sourcePortId: L.sourcePortId,
        targetId: H,
        targetPortId: Q
      }, J = {
        id: P,
        sourceId: H,
        sourcePortId: G,
        targetId: L.targetId,
        targetPortId: L.targetPortId
      }, T = { ...t.edges };
      delete T[L.id], T[W] = Z, T[P] = J, o({
        ...t,
        nodes: { ...t.nodes, [H]: E },
        edges: T
      });
    } else if (e.type === "NODE_EXTRACT") {
      const { nodeId: m, incomingEdgeId: p, outgoingEdgeId: H } = e.payload, W = t.edges[p], P = t.edges[H];
      if (!W || !P) return;
      const L = { ...t.edges };
      L[p] = {
        ...W,
        targetId: P.targetId,
        targetPortId: P.targetPortId
      }, delete L[H], o({
        ...t,
        edges: L
      });
    } else if (e.type === "NODE_ADD_CONNECTED") {
      const { sourceNode: m, position: p, direction: H, suggestedNewNodeId: W, suggestedNewEdgeId: P } = e.payload, L = H === "BT", X = `p_in_${Date.now()}`, V = `p_out_${Date.now()}`, Q = {
        id: W,
        label: `Node ${Object.keys(t.nodes).length + 1}`,
        type: m.type,
        ports: [
          { id: X, label: "in", side: L ? "bottom" : "top" },
          { id: V, label: "out", side: L ? "top" : "bottom" }
        ]
      }, G = m.ports.find((E) => E.label === "in") || m.ports[0], D = m.ports.find((E) => E.label === "out") || m.ports[m.ports.length - 1];
      let u;
      L && p === "bottom" || !L && p === "top" ? u = {
        id: P,
        sourceId: W,
        sourcePortId: V,
        targetId: m.id,
        targetPortId: (G == null ? void 0 : G.id) || "in"
      } : u = {
        id: P,
        sourceId: m.id,
        sourcePortId: (D == null ? void 0 : D.id) || "out",
        targetId: W,
        targetPortId: X
      }, o({
        ...t,
        nodes: { ...t.nodes, [W]: Q },
        edges: { ...t.edges, [P]: u }
      });
    } else if (e.type === "CONTAINER_TOGGLE_COLLAPSE") {
      const { containerId: m, collapsed: p } = e.payload;
      t.containers[m] && o({
        ...t,
        containers: {
          ...t.containers,
          [m]: { ...t.containers[m], collapsed: p }
        }
      });
    } else if (e.type === "EDGE_CREATE") {
      const m = e.payload.id || `E_${Date.now()}`;
      o({
        ...t,
        edges: {
          ...t.edges,
          [m]: { id: m, ...e.payload.edge }
        }
      });
    } else if (e.type === "EDGE_DELETE") {
      const m = { ...t.edges };
      delete m[e.payload.edgeId], o({ ...t, edges: m });
    } else if (e.type === "EDGE_REWIRE") {
      const { edgeId: m, newTargetId: p } = e.payload;
      if (!p || !t.edges[m]) return;
      const H = p, W = t.edges[m], P = W.targetId, L = Object.values(t.edges).find((u) => u.targetId === H), X = Object.values(t.edges).find((u) => u.sourceId === H), V = { ...t.edges };
      L && X && (V[L.id] = { ...L, targetId: X.targetId, targetPortId: X.targetPortId }, delete V[X.id]);
      const Q = ((w = (d = t.nodes[H]) == null ? void 0 : d.ports[0]) == null ? void 0 : w.id) || "p_in", G = ((S = (B = t.nodes[H]) == null ? void 0 : B.ports.find((u) => u.id !== Q)) == null ? void 0 : S.id) || Q;
      V[m] = {
        ...W,
        targetId: H,
        targetPortId: Q
      };
      const D = `REWIRE_${Date.now()}`;
      V[D] = {
        id: D,
        sourceId: H,
        sourcePortId: G,
        targetId: P,
        targetPortId: W.targetPortId
      }, o({ ...t, edges: V });
    }
  }, [g, s, o]), f = M((e) => {
    const t = l.nodes[e] || l.containers[e];
    t && c({ entity: JSON.parse(JSON.stringify(t)), isCut: !1 });
  }, [l]), b = M((e) => {
    const t = l.nodes[e] || l.containers[e];
    if (t) {
      c({ entity: JSON.parse(JSON.stringify(t)), isCut: !0 });
      const d = { ...l.nodes }, w = { ...l.containers };
      delete d[e], delete w[e], o({ ...l, nodes: d, containers: w });
    }
  }, [l, o]), y = M(() => {
    if (!r) return;
    const e = r.entity, t = `${e.id}_copy_${Date.now().toString().slice(-4)}`, d = { ...e, id: t, label: `${e.label} (Copy)` };
    "collapsed" in d ? o({
      ...l,
      containers: { ...l.containers, [t]: d }
    }) : o({
      ...l,
      nodes: { ...l.nodes, [t]: d }
    });
  }, [r, l, o]), A = M((e) => {
    if (e.length === 0) return;
    const t = { ...l.nodes }, d = { ...l.containers }, w = { ...l.edges };
    for (const B of e)
      delete t[B], delete d[B], delete w[B];
    o({
      ...l,
      nodes: t,
      containers: d,
      edges: w
    });
  }, [l, o]);
  return {
    graph: l,
    setGraphDirect: o,
    applyAction: a,
    undo: C,
    redo: h,
    copyEntity: f,
    cutEntity: b,
    pasteEntity: y,
    deleteSelection: A,
    canUndo: s > 0,
    canRedo: s < g.length - 1
  };
}
const Ge = ({
  graph: i,
  registerMeasureElement: g,
  nodeTypes: n,
  containerTypes: s
}) => {
  const I = Object.values(i.nodes), r = Object.values(i.containers);
  return /* @__PURE__ */ $("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((c) => {
      const l = c.type ? n == null ? void 0 : n[c.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ N(l, { node: c, selected: !1 }) : /* @__PURE__ */ $("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ N("div", { style: { fontWeight: 600 }, children: c.label }),
            c.ports.length > 0 && /* @__PURE__ */ $("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              c.ports.map((o) => o.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${c.id}`
      );
    }),
    r.map((c) => {
      const l = c.type ? s == null ? void 0 : s[c.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ N(l, { container: c, selected: !1 }) : /* @__PURE__ */ N("div", { className: "sysflow-container-header", children: c.label })
        },
        `measure-container-${c.id}`
      );
    })
  ] });
}, Ke = ({
  graph: i,
  layout: g,
  selectedIds: n,
  direction: s = "TB",
  showArrows: I = !0,
  routing: r = "auto",
  portOptions: c,
  enableEdgeQuickAdd: l = !0,
  onEdgeClick: o,
  onInsertNodeOnEdge: C
}) => {
  const [h, a] = et(null), f = r === "step" || r === "auto" && (s === "LR" || s === "RL"), b = (e, t, d) => {
    var V, Q, G, D;
    let w = e, B = null;
    for ((V = i.containers[e]) != null && V.collapsed && (B = i.containers[e]); w; ) {
      const u = ((Q = i.nodes[w]) == null ? void 0 : Q.parentId) ?? ((G = i.containers[w]) == null ? void 0 : G.parentId) ?? null;
      u && ((D = i.containers[u]) != null && D.collapsed) && (B = i.containers[u]), w = u;
    }
    if (B) {
      const u = g.containers[B.id];
      if (!u)
        return { x: 0, y: 0, side: d ? "right" : "left", valid: !1, entityId: B.id };
      let k, E, Z;
      return s === "TB" ? (k = d ? "bottom" : "top", E = u.x + u.width / 2, Z = d ? u.y + u.height : u.y) : s === "BT" ? (k = d ? "top" : "bottom", E = u.x + u.width / 2, Z = d ? u.y : u.y + u.height) : s === "RL" ? (k = d ? "left" : "right", E = d ? u.x : u.x + u.width, Z = u.y + u.height / 2) : (k = d ? "right" : "left", E = d ? u.x + u.width : u.x, Z = u.y + u.height / 2), { x: E, y: Z, side: k, valid: !0, entityId: B.id };
    }
    if (!!i.containers[e]) {
      const u = g.containers[e];
      if (!u) return { x: 0, y: 0, side: d ? "right" : "left", valid: !1, entityId: e };
      let k, E, Z;
      return s === "TB" ? (k = u.x + u.width / 2, E = d ? u.y + u.height : u.y, Z = d ? "bottom" : "top") : s === "BT" ? (k = u.x + u.width / 2, E = d ? u.y : u.y + u.height, Z = d ? "top" : "bottom") : s === "RL" ? (k = d ? u.x : u.x + u.width, E = u.y + u.height / 2, Z = d ? "left" : "right") : (k = d ? u.x + u.width : u.x, E = u.y + u.height / 2, Z = d ? "right" : "left"), { x: k, y: E, side: Z, valid: !0, entityId: e };
    }
    const m = i.nodes[e], p = g.nodes[e];
    if (!m || !p)
      return { x: 0, y: 0, side: d ? "right" : "left", valid: !1, entityId: e };
    const W = Nt(
      m,
      p,
      s,
      i.edges,
      c
    ).get(t);
    if (W)
      return { x: W.worldX, y: W.worldY, side: W.side, valid: !0, entityId: e };
    let P, L, X;
    return s === "TB" ? (P = p.x + p.width / 2, L = d ? p.y + p.height : p.y, X = d ? "bottom" : "top") : s === "BT" ? (P = p.x + p.width / 2, L = d ? p.y : p.y + p.height, X = d ? "top" : "bottom") : s === "RL" ? (P = d ? p.x : p.x + p.width, L = p.y + p.height / 2, X = d ? "left" : "right") : (P = d ? p.x + p.width : p.x, L = p.y + p.height / 2, X = d ? "right" : "left"), { x: P, y: L, side: X, valid: !0, entityId: e };
  }, y = (e, t) => {
    const d = (e.x + t.x) / 2, w = (e.y + t.y) / 2;
    if (e.side === "right" && t.side === "left") {
      if (t.x >= e.x + 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${d} ${e.y} L ${d} ${t.y} L ${t.x} ${t.y}`,
          center: { x: d, y: w }
        };
      {
        const B = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x + 20} ${e.y} L ${e.x + 20} ${B} L ${t.x - 20} ${B} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: d, y: B }
        };
      }
    }
    if (e.side === "left" && t.side === "right") {
      if (t.x <= e.x - 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${d} ${e.y} L ${d} ${t.y} L ${t.x} ${t.y}`,
          center: { x: d, y: w }
        };
      {
        const B = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x - 20} ${e.y} L ${e.x - 20} ${B} L ${t.x + 20} ${B} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: d, y: B }
        };
      }
    }
    if (e.side === "bottom" && t.side === "top") {
      if (t.y >= e.y + 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${w} L ${t.x} ${w} L ${t.x} ${t.y}`,
          center: { x: d, y: w }
        };
      {
        const B = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y + 20} L ${B} ${e.y + 20} L ${B} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: B, y: w }
        };
      }
    }
    if (e.side === "top" && t.side === "bottom") {
      if (t.y <= e.y - 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${w} L ${t.x} ${w} L ${t.x} ${t.y}`,
          center: { x: d, y: w }
        };
      {
        const B = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y - 20} L ${B} ${e.y - 20} L ${B} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: B, y: w }
        };
      }
    }
    return {
      pathStr: `M ${e.x} ${e.y} L ${d} ${e.y} L ${d} ${t.y} L ${t.x} ${t.y}`,
      center: { x: d, y: w }
    };
  }, A = (e, t) => {
    const d = t.x - e.x, w = t.y - e.y;
    let B = e.x, S = e.y, m = t.x, p = t.y;
    if (e.side === "bottom" && t.side === "top")
      if (w > 0) {
        const P = Math.min(28, w * 0.4);
        S = e.y + Math.max(P, w * 0.5), p = t.y - Math.max(P, w * 0.5);
      } else {
        const P = d >= 0 ? 1 : -1, L = Math.max(40, Math.abs(d) * 0.2);
        B = e.x + L * P, S = e.y + 40, m = t.x + L * P, p = t.y - 40;
      }
    else if (e.side === "top" && t.side === "bottom")
      if (w < 0) {
        const P = Math.min(28, Math.abs(w) * 0.4);
        S = e.y - Math.max(P, Math.abs(w) * 0.5), p = t.y + Math.max(P, Math.abs(w) * 0.5);
      } else {
        const P = d >= 0 ? 1 : -1, L = Math.max(40, Math.abs(d) * 0.2);
        B = e.x + L * P, S = e.y - 40, m = t.x + L * P, p = t.y + 40;
      }
    else if (e.side === "right" && t.side === "left")
      d > 0 ? (B = e.x + d * 0.5, m = t.x - d * 0.5) : (B = e.x + 50, S = e.y - 50, m = t.x - 50, p = t.y - 50);
    else if (e.side === "left" && t.side === "right")
      d < 0 ? (B = e.x + d * 0.5, m = t.x - d * 0.5) : (B = e.x - 50, S = e.y - 50, m = t.x + 50, p = t.y - 50);
    else {
      const P = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, L = P[e.side] || { x: 0, y: 1 }, X = P[t.side] || { x: 0, y: -1 }, V = Math.min(60, Math.hypot(d, w) * 0.35);
      B = e.x + L.x * V, S = e.y + L.y * V, m = t.x + X.x * V, p = t.y + X.y * V;
    }
    const H = 0.125 * e.x + 0.375 * B + 0.375 * m + 0.125 * t.x, W = 0.125 * e.y + 0.375 * S + 0.375 * p + 0.125 * t.y;
    return {
      pathStr: `M ${e.x} ${e.y} C ${B} ${S} ${m} ${p} ${t.x} ${t.y}`,
      center: { x: H, y: W }
    };
  };
  return /* @__PURE__ */ $("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ $("defs", { children: [
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
    Object.values(i.edges).map((e) => {
      const t = b(e.sourceId, e.sourcePortId, !0), d = b(e.targetId, e.targetPortId, !1);
      if (!t.valid || !d.valid || t.entityId === d.entityId) return null;
      const w = n.includes(e.id), B = h === e.id, { pathStr: S, center: m } = f ? y(t, d) : A(t, d);
      return /* @__PURE__ */ $(
        "g",
        {
          onMouseEnter: () => a(e.id),
          onMouseLeave: () => a(null),
          children: [
            /* @__PURE__ */ N(
              "path",
              {
                d: S,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (p) => {
                  p.stopPropagation(), o == null || o(e.id);
                }
              }
            ),
            /* @__PURE__ */ N(
              "path",
              {
                d: S,
                fill: "none",
                stroke: w ? "var(--sysflow-edge-selected)" : B ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: w ? 2.5 : B ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: I ? w ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            l && B && C && /* @__PURE__ */ N("g", { transform: `translate(${m.x}, ${m.y})`, children: /* @__PURE__ */ $(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (p) => {
                  p.preventDefault(), p.stopPropagation(), C(e);
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
}, Se = ({
  entity: i,
  layout: g,
  direction: n = "LR",
  edges: s,
  portOptions: I,
  onPortPointerDown: r,
  onPortPointerUp: c
}) => {
  if (!i.ports || i.ports.length === 0)
    return null;
  const l = Nt(
    i,
    g,
    n,
    s,
    I
  );
  return /* @__PURE__ */ N(Et, { children: i.ports.map((o) => {
    const C = l.get(o.id);
    return C ? /* @__PURE__ */ N(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${C.side}`,
        style: {
          position: "absolute",
          left: `${C.localX}px`,
          top: `${C.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${o.label} (${C.side})`,
        onPointerDown: (h) => {
          h.stopPropagation(), r == null || r(i.id, o.id, !0, h);
        },
        onPointerUp: (h) => {
          h.stopPropagation(), c == null || c(i.id, o.id, !1);
        }
      },
      o.id
    ) : null;
  }) });
}, pe = ({
  node: i,
  layout: g,
  selected: n = !1,
  direction: s = "LR",
  edges: I,
  portOptions: r,
  enableQuickAdd: c = !1,
  onAddConnectedNode: l,
  onPointerDown: o,
  onMouseEnter: C,
  onMouseLeave: h,
  onClick: a,
  onPortPointerDown: f,
  onPortPointerUp: b,
  customRenderer: y
}) => {
  const [A, e] = et(!1);
  return /* @__PURE__ */ $(
    "div",
    {
      className: `sysflow-node ${n ? "sysflow-selected" : ""} ${i.className || ""}`,
      style: {
        transform: `translate(${g.x}px, ${g.y}px)`,
        width: `${g.width}px`,
        height: `${g.height}px`
      },
      onPointerDown: (t) => o == null ? void 0 : o(i, t),
      onMouseEnter: () => {
        e(!0), C == null || C(i.id);
      },
      onMouseLeave: () => {
        e(!1), h == null || h(i.id);
      },
      onClick: a,
      children: [
        c && A && /* @__PURE__ */ $(Et, { children: [
          /* @__PURE__ */ N("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ N("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        c && A && l && /* @__PURE__ */ N(
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
              t.preventDefault(), t.stopPropagation(), l(i, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ N(
          Se,
          {
            entity: i,
            layout: g,
            direction: s,
            edges: I,
            portOptions: r,
            onPortPointerDown: f,
            onPortPointerUp: b
          }
        ),
        y ? /* @__PURE__ */ N(y, { node: i, selected: n }) : /* @__PURE__ */ $("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ N("div", { style: { fontWeight: 600, fontSize: "13px" }, children: i.label }),
          i.ports.length > 0 && /* @__PURE__ */ $("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            i.ports.length,
            " Port",
            i.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        c && A && l && /* @__PURE__ */ N(
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
              t.preventDefault(), t.stopPropagation(), l(i, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Le = ({
  container: i,
  layout: g,
  selected: n,
  isHovered: s = !1,
  hasChildren: I = !1,
  onToggleCollapse: r,
  onPointerDown: c,
  onMouseEnter: l,
  onMouseLeave: o,
  onClick: C,
  customRenderer: h
}) => /* @__PURE__ */ N(
  "div",
  {
    className: `sysflow-container ${n ? "sysflow-selected" : ""} ${s ? "sysflow-hovered" : ""} ${i.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (a) => c(i, a),
    onMouseEnter: l,
    onMouseLeave: o,
    onClick: C,
    children: h ? /* @__PURE__ */ N(h, { container: i, selected: n }) : /* @__PURE__ */ $(Et, { children: [
      /* @__PURE__ */ $("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ N("span", { className: "sysflow-container-title", title: i.label, children: i.label }),
        /* @__PURE__ */ N(
          "button",
          {
            className: "sysflow-collapse-btn",
            onClick: (a) => {
              a.stopPropagation(), r(i.id, !i.collapsed);
            },
            children: i.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !i.collapsed && !I && /* @__PURE__ */ N("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Ze = new fe(), Ne = ({
  graph: i,
  onChange: g,
  layoutEngine: n,
  interactionStrategy: s = Ze,
  direction: I = "TB",
  layoutOptions: r,
  portPlacementMode: c,
  routing: l,
  showEdgeArrows: o = !0,
  nodeTypes: C,
  containerTypes: h,
  zoomBounds: a,
  className: f = "",
  selectedIds: b = [],
  theme: y = "dark",
  enableQuickAdd: A,
  enableEdgeQuickAdd: e
}) => {
  var Yt, vt;
  const t = Ct(null), d = Ct(null);
  !n && !d.current && (d.current = new Be());
  const w = n || d.current, {
    transform: B,
    screenToWorld: S,
    onWheel: m,
    startPan: p,
    updatePan: H,
    endPan: W,
    resetTransform: P,
    zoomIn: L,
    zoomOut: X,
    zoomToFit: V,
    isPanning: Q
  } = we(t, a), { measurements: G, registerMeasureElement: D } = be(i), [u, k] = et({ nodes: {}, containers: {} }), E = Ce(() => ({
    direction: I,
    mode: c ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: u.nodes
  }), [I, c, u.nodes]), [Z, J] = et(null), [T, z] = et(null), U = Ct(!1), {
    dragState: R,
    hoveredContainerId: _,
    handlePointerDown: it,
    handlePointerMove: dt,
    handlePointerUp: ht
  } = me(i, u, s, S, g);
  Dt(() => {
    const K = (x) => {
      if (x.target instanceof HTMLInputElement || x.target instanceof HTMLTextAreaElement)
        return;
      if (x.key === "Escape") {
        x.preventDefault(), z(null), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (x.code === "Space" && (U.current = !0), x.key.toLowerCase() === "f" && !x.ctrlKey && !x.metaKey) {
        x.preventDefault(), V(u);
        return;
      }
      if ((x.ctrlKey || x.metaKey) && x.key.toLowerCase() === "a") {
        x.preventDefault();
        const j = [
          ...Object.keys(i.nodes),
          ...Object.keys(i.containers)
        ];
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: j } });
        return;
      }
      const Y = Object.keys(i.nodes);
      if (Y.length !== 0) {
        if (x.key === "Tab") {
          x.preventDefault();
          const j = b.length > 0 ? Y.indexOf(b[0]) : -1;
          let F;
          x.shiftKey ? F = j <= 0 ? Y.length - 1 : j - 1 : F = (j + 1) % Y.length, g({ type: "SELECTION_CHANGE", payload: { selectedIds: [Y[F]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(x.key)) {
          x.preventDefault();
          const j = b[0] || Y[0], F = u.nodes[j] || u.containers[j];
          if (!F) return;
          const gt = {
            x: F.x + F.width / 2,
            y: F.y + F.height / 2
          };
          let O = null, At = 1 / 0;
          for (const yt of Y) {
            if (yt === j) continue;
            const ct = u.nodes[yt];
            if (!ct) continue;
            const bt = {
              x: ct.x + ct.width / 2,
              y: ct.y + ct.height / 2
            }, Bt = bt.x - gt.x, at = bt.y - gt.y;
            let ot = !1;
            if (x.key === "ArrowRight" && Bt > 20 && (ot = !0), x.key === "ArrowLeft" && Bt < -20 && (ot = !0), x.key === "ArrowDown" && at > 20 && (ot = !0), x.key === "ArrowUp" && at < -20 && (ot = !0), ot) {
              const q = Math.hypot(Bt, at);
              q < At && (At = q, O = yt);
            }
          }
          O && g({ type: "SELECTION_CHANGE", payload: { selectedIds: [O] } });
        }
      }
    }, v = (x) => {
      x.code === "Space" && (U.current = !1);
    };
    return window.addEventListener("keydown", K), window.addEventListener("keyup", v), () => {
      window.removeEventListener("keydown", K), window.removeEventListener("keyup", v);
    };
  }, [i, u, b, V, g]), Dt(() => {
    let K = !1, v = 16 / 9;
    if (t.current) {
      const Y = t.current.getBoundingClientRect();
      Y.width > 0 && Y.height > 0 && (v = Y.width / Y.height);
    }
    const x = {
      direction: I,
      aspectRatio: v,
      ...r
    };
    return w.execute(i, G, x).then((Y) => {
      K || k(Y);
    }), () => {
      K = !0;
    };
  }, [i, G, w, I, r]);
  const pt = (K, v, x, Y) => {
    const j = i.nodes[K] || i.containers[K], F = u.nodes[K] || u.containers[K];
    if (!j || !F) return;
    const O = Nt(
      j,
      F,
      I,
      i.edges,
      E
    ).get(v), At = O ? { x: O.worldX, y: O.worldY } : { x: F.x + F.width, y: F.y + F.height / 2 };
    J({
      sourceId: K,
      sourcePortId: v,
      startWorldPos: At,
      currentWorldPos: S(Y.clientX, Y.clientY)
    });
  }, Rt = (K, v, x) => {
    var Y, j, F, gt, O, At, yt, ct, bt, Bt;
    if (Z && Z.sourceId !== K) {
      const at = i.nodes[Z.sourceId] || i.containers[Z.sourceId], ot = i.nodes[K] || i.containers[K], q = (Y = at == null ? void 0 : at.ports) == null ? void 0 : Y.find((ft) => ft.id === Z.sourcePortId), tt = (j = ot == null ? void 0 : ot.ports) == null ? void 0 : j.find((ft) => ft.id === v);
      let mt = Z.sourceId, Lt = Z.sourcePortId, Gt = K, Zt = v;
      const qt = ((F = q == null ? void 0 : q.label) == null ? void 0 : F.toLowerCase().includes("in")) || (q == null ? void 0 : q.side) === (I === "BT" ? "bottom" : "top"), te = ((gt = q == null ? void 0 : q.label) == null ? void 0 : gt.toLowerCase().includes("out")) || (q == null ? void 0 : q.side) === (I === "BT" ? "top" : "bottom"), ee = ((O = tt == null ? void 0 : tt.label) == null ? void 0 : O.toLowerCase().includes("in")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "bottom" : "top"), ge = ((At = tt == null ? void 0 : tt.label) == null ? void 0 : At.toLowerCase().includes("out")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "top" : "bottom");
      if (qt && ge)
        mt = K, Lt = v, Gt = Z.sourceId, Zt = Z.sourcePortId;
      else if (te && ee)
        mt = Z.sourceId, Lt = Z.sourcePortId, Gt = K, Zt = v;
      else if (u.nodes[Z.sourceId] && u.nodes[K]) {
        const ft = u.nodes[Z.sourceId], Tt = u.nodes[K], Ie = I === "BT" && ft.y < Tt.y, oe = I === "TB" && ft.y > Tt.y;
        if (Ie || oe) {
          mt = K, Gt = Z.sourceId;
          const kt = i.nodes[mt], xt = i.nodes[Gt];
          Lt = ((ct = (yt = kt == null ? void 0 : kt.ports) == null ? void 0 : yt.find((Kt) => Kt.label.includes("out") || Kt.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : ct.id) || v, Zt = ((Bt = (bt = xt == null ? void 0 : xt.ports) == null ? void 0 : bt.find((Kt) => Kt.label.includes("in") || Kt.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : Bt.id) || Z.sourcePortId;
        }
      }
      g({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: mt,
            sourcePortId: Lt,
            targetId: Gt,
            targetPortId: Zt
          }
        }
      });
    }
    J(null);
  }, Ot = (K) => {
    if (K.button === 1 || U.current) {
      p(K.clientX, K.clientY);
      return;
    }
    const v = K.target, x = v === t.current || v.classList.contains("sysflow-viewport") || v.classList.contains("sysflow-dom-layer") || v.tagName.toLowerCase() === "svg";
    if (K.button === 0 && x) {
      K.currentTarget.setPointerCapture(K.pointerId);
      const Y = S(K.clientX, K.clientY);
      z({
        startX: Y.x,
        startY: Y.y,
        currentX: Y.x,
        currentY: Y.y
      }), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Ft = (K) => {
    if (Q.current)
      H(K.clientX, K.clientY);
    else if (T) {
      const v = S(K.clientX, K.clientY);
      z((x) => x ? { ...x, currentX: v.x, currentY: v.y } : null);
    } else R ? dt(K) : Z && J(
      (v) => v ? { ...v, currentWorldPos: S(K.clientX, K.clientY) } : null
    );
  }, zt = (K) => {
    if (K.currentTarget.hasPointerCapture(K.pointerId) && K.currentTarget.releasePointerCapture(K.pointerId), Q.current && W(), T) {
      const v = Math.min(T.startX, T.currentX), x = Math.min(T.startY, T.currentY), Y = Math.max(T.startX, T.currentX), j = Math.max(T.startY, T.currentY);
      if (Y - v > 4 || j - x > 4) {
        const F = [];
        for (const [gt, O] of Object.entries(u.nodes))
          O.x < Y && O.x + O.width > v && O.y < j && O.y + O.height > x && F.push(gt);
        for (const [gt, O] of Object.entries(u.containers))
          O.x < Y && O.x + O.width > v && O.y < j && O.y + O.height > x && F.push(gt);
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: F } });
      }
      z(null);
    }
    R && ht(K), Z && J(null);
  }, jt = A ?? (r == null ? void 0 : r.mode) === "flow", Jt = M(
    (K, v) => {
      const x = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, Y = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: K,
          position: v,
          direction: I,
          suggestedNewNodeId: x,
          suggestedNewEdgeId: Y
        }
      });
    },
    [I, g]
  ), Ut = e ?? A ?? (r == null ? void 0 : r.mode) === "flow", $t = M(
    (K) => {
      const v = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, x = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, Y = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: K,
          direction: I,
          suggestedNewNodeId: v,
          suggestedNewEdge1Id: x,
          suggestedNewEdge2Id: Y
        }
      }), g({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [v] }
      });
    },
    [I, g]
  ), _t = Object.values(i.containers);
  return /* @__PURE__ */ $(
    "div",
    {
      ref: t,
      className: `sysflow-canvas ${y === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${f}`,
      "data-theme": y,
      onWheel: m,
      onPointerDown: Ot,
      onPointerMove: Ft,
      onPointerUp: zt,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ N(
          Ge,
          {
            graph: i,
            registerMeasureElement: D,
            nodeTypes: C,
            containerTypes: h
          }
        ),
        /* @__PURE__ */ $("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ N("button", { onClick: L, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ N("button", { onClick: X, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ $("button", { onClick: P, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(B.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ $(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${B.x}px, ${B.y}px) scale(${B.zoom})`
            },
            children: [
              T && /* @__PURE__ */ N(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(T.startX, T.currentX)}px`,
                    top: `${Math.min(T.startY, T.currentY)}px`,
                    width: `${Math.abs(T.currentX - T.startX)}px`,
                    height: `${Math.abs(T.currentY - T.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              Z && /* @__PURE__ */ N("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ N(
                "line",
                {
                  x1: Z.startWorldPos.x,
                  y1: Z.startWorldPos.y,
                  x2: Z.currentWorldPos.x,
                  y2: Z.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ N("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: _t.map((K) => {
                const v = u.containers[K.id];
                if (!v) return null;
                const x = Object.values(i.nodes).some((Y) => Y.parentId === K.id) || Object.values(i.containers).some((Y) => Y.parentId === K.id);
                return /* @__PURE__ */ N(
                  Le,
                  {
                    container: K,
                    layout: v,
                    selected: b.includes(K.id),
                    isHovered: _ === K.id,
                    hasChildren: x,
                    customRenderer: K.type ? h == null ? void 0 : h[K.type] : void 0,
                    onToggleCollapse: (Y, j) => g({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: Y, collapsed: j }
                    }),
                    onPointerDown: it,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (Y) => {
                      Y.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [K.id] } });
                    }
                  },
                  K.id
                );
              }) }),
              /* @__PURE__ */ N(
                Ke,
                {
                  graph: i,
                  layout: u,
                  selectedIds: b,
                  direction: I,
                  showArrows: o,
                  routing: l,
                  portOptions: E,
                  enableEdgeQuickAdd: Ut,
                  onInsertNodeOnEdge: $t,
                  onEdgeClick: (K) => g({ type: "SELECTION_CHANGE", payload: { selectedIds: [K] } })
                }
              ),
              /* @__PURE__ */ N("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(i.nodes).map((K) => {
                const v = u.nodes[K.id];
                return v ? /* @__PURE__ */ N(
                  pe,
                  {
                    node: K,
                    layout: v,
                    direction: I,
                    edges: i.edges,
                    portOptions: E,
                    selected: b.includes(K.id),
                    customRenderer: K.type ? C == null ? void 0 : C[K.type] : void 0,
                    enableQuickAdd: jt,
                    onAddConnectedNode: Jt,
                    onPointerDown: it,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (x) => {
                      x.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [K.id] } });
                    },
                    onPortPointerDown: pt,
                    onPortPointerUp: Rt
                  },
                  K.id
                ) : null;
              }) }),
              R && /* @__PURE__ */ N(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${R.ghostPosition.x}px, ${R.ghostPosition.y}px)`,
                    width: `${((Yt = G.get(R.draggedEntity.id)) == null ? void 0 : Yt.width) || 200}px`,
                    height: `${((vt = G.get(R.draggedEntity.id)) == null ? void 0 : vt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ N("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: R.draggedEntity.label })
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
  De as EdgeRewireStrategy,
  Le as GraphContainer,
  Ke as GraphEdgeLayer,
  pe as GraphNode,
  Se as GraphPortLayer,
  fe as ReparentStrategy,
  ue as SugiyamaEngine,
  Ne as SysFlowCanvas,
  Be as WorkerBridge,
  Nt as computeEntityPortLocations,
  ce as pruneDanglingEdges,
  Vt as resolveEffectiveEntityId,
  we as useCanvasTransform,
  me as useDragGesture,
  Ee as useGraphHistory,
  be as useMeasurement
};
