var oe = Object.defineProperty;
var se = (d, g, s) => g in d ? oe(d, g, { enumerable: !0, configurable: !0, writable: !0, value: s }) : d[g] = s;
var Kt = (d, g, s) => se(d, typeof g != "symbol" ? g + "" : g, s);
import { useState as et, useRef as Ct, useCallback as M, useEffect as Et, useMemo as ne } from "react";
import { jsxs as U, jsx as N, Fragment as Yt } from "react/jsx-runtime";
function Ce(d, g, s, n) {
  const I = (c) => {
    const r = s.find(
      (C) => C.sourceId === g && C.sourcePortId === c || C.targetId === g && C.targetPortId === c
    );
    if (!r) return null;
    const l = r.sourceId === g ? r.targetId : r.sourceId, o = n[l];
    return o ? { x: o.x + o.width / 2, y: o.y + o.height / 2 } : null;
  };
  ["left", "right"].forEach((c) => {
    d[c].sort((r, l) => {
      var h, A;
      const o = ((h = I(r.id)) == null ? void 0 : h.y) ?? 0, C = ((A = I(l.id)) == null ? void 0 : A.y) ?? 0;
      return o - C;
    });
  }), ["top", "bottom"].forEach((c) => {
    d[c].sort((r, l) => {
      var h, A;
      const o = ((h = I(r.id)) == null ? void 0 : h.x) ?? 0, C = ((A = I(l.id)) == null ? void 0 : A.x) ?? 0;
      return o - C;
    });
  });
}
function ie(d, g, s, n, I, c) {
  if (!I || !c)
    return s ? "left" : "right";
  const r = n.find(
    (A) => s ? A.targetId === d && A.targetPortId === g : A.sourceId === d && A.sourcePortId === g
  );
  if (!r) return s ? "left" : "right";
  const l = s ? r.sourceId : r.targetId, o = I[l];
  if (!o) return s ? "left" : "right";
  const C = o.x + o.width / 2 - (c.x + c.width / 2), h = o.y + o.height / 2 - (c.y + c.height / 2);
  return Math.abs(C) > Math.abs(h) ? C > 0 ? "right" : "left" : h > 0 ? "bottom" : "top";
}
function Dt(d, g, s = "LR", n, I) {
  const c = /* @__PURE__ */ new Map();
  if (!d || !g || !d.ports || d.ports.length === 0)
    return c;
  const r = (I == null ? void 0 : I.direction) || s, l = r === "TB" || r === "BT", o = (I == null ? void 0 : I.mode) || (l ? "strict-flow" : "perimeter-optimized"), C = n ? Array.isArray(n) ? n : Object.values(n) : [], h = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, A = new Set(
    C.filter((B) => B.targetId === d.id).map((B) => B.targetPortId)
  );
  new Set(
    C.filter((B) => B.sourceId === d.id).map((B) => B.sourcePortId)
  ), d.ports.forEach((B) => {
    let w = B.side || "auto";
    if (w !== "auto") {
      h[w].push(B);
      return;
    }
    if (o === "strict-flow") {
      const y = A.has(B.id) || B.label.toLowerCase().includes("in");
      switch (r) {
        case "BT":
          w = y ? "bottom" : "top";
          break;
        case "TB":
          w = y ? "top" : "bottom";
          break;
        case "RL":
          w = y ? "right" : "left";
          break;
        case "LR":
        default:
          w = y ? "left" : "right";
          break;
      }
    } else
      w = ie(
        d.id,
        B.id,
        A.has(B.id),
        C,
        I == null ? void 0 : I.nodeLayouts,
        g
      );
    h[w].push(B);
  }), o === "perimeter-optimized" && (I != null && I.nodeLayouts) && Ce(h, d.id, C, I.nodeLayouts);
  const u = (B, w) => {
    const y = B.length;
    B.forEach((e, t) => {
      let i = 0, b = 0;
      w === "left" || w === "right" ? (b = g.height / (y + 1) * (t + 1), i = w === "left" ? 0 : g.width) : (i = g.width / (y + 1) * (t + 1), b = w === "top" ? 0 : g.height), c.set(e.id, {
        portId: e.id,
        side: w,
        localX: i,
        localY: b,
        worldX: g.x + i,
        worldY: g.y + b
      });
    });
  };
  return u(h.left, "left"), u(h.right, "right"), u(h.top, "top"), u(h.bottom, "bottom"), c;
}
function de(d) {
  const g = {}, s = (n) => {
    var c;
    const I = d.nodes[n];
    return new Set(((c = I == null ? void 0 : I.ports) == null ? void 0 : c.map((r) => r.id)) || []);
  };
  for (const [n, I] of Object.entries(d.edges)) {
    const c = s(I.sourceId), r = s(I.targetId), l = c.has(I.sourcePortId), o = r.has(I.targetPortId);
    l && o && (g[n] = I);
  }
  return {
    ...d,
    edges: g
  };
}
class ce {
  static decouple(g, s) {
    const n = /* @__PURE__ */ new Map();
    for (const C of s)
      n.set(C, /* @__PURE__ */ new Set());
    const I = Object.values(g.edges);
    for (const C of I)
      s.has(C.sourceId) && s.has(C.targetId) && n.get(C.sourceId).add(C.targetId);
    const c = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), o = (C) => {
      c.add(C), r.add(C);
      const h = Array.from(n.get(C) || []);
      for (const A of h)
        c.has(A) ? r.has(A) && (n.get(C).delete(A), n.get(A).add(C), l.add(`${C}->${A}`)) : o(A);
      r.delete(C);
    };
    for (const C of s)
      c.has(C) || o(C);
    return {
      adjList: n,
      reversedEdges: l,
      allEntityIds: Array.from(s)
    };
  }
}
class re {
  static assignLayers(g, s) {
    const n = /* @__PURE__ */ new Map();
    for (const o of g)
      n.set(o, 0);
    for (const [, o] of s.entries())
      for (const C of o)
        n.set(C, (n.get(C) || 0) + 1);
    const I = /* @__PURE__ */ new Map(), c = [];
    for (const o of g)
      (n.get(o) || 0) === 0 && (I.set(o, 0), c.push(o));
    const r = /* @__PURE__ */ new Set();
    for (; c.length > 0; ) {
      const o = c.shift();
      r.add(o);
      const C = I.get(o) || 0, h = s.get(o) || /* @__PURE__ */ new Set();
      for (const A of h) {
        const u = I.get(A) ?? 0;
        I.set(A, Math.max(u, C + 1)), n.set(A, (n.get(A) || 1) - 1), n.get(A) === 0 && c.push(A);
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
  static minimizeCrossings(g, s, n = 4, I) {
    const c = Array.from(g.keys()).sort((o, C) => o - C);
    if (c.length <= 1) return g;
    const r = /* @__PURE__ */ new Map();
    for (const [o, C] of s.entries())
      for (const h of C)
        r.has(h) || r.set(h, /* @__PURE__ */ new Set()), r.get(h).add(o);
    const l = /* @__PURE__ */ new Map();
    for (const [o, C] of g.entries())
      l.set(o, [...C]);
    for (let o = 0; o < n; o++) {
      for (let C = 1; C < c.length; C++) {
        const h = l.get(c[C - 1]), A = l.get(c[C]), u = /* @__PURE__ */ new Map();
        h.forEach((B, w) => u.set(B, w)), nt.sortLayerNodes(A, r, u, I);
      }
      for (let C = c.length - 2; C >= 0; C--) {
        const h = l.get(c[C + 1]), A = l.get(c[C]), u = /* @__PURE__ */ new Map();
        h.forEach((B, w) => u.set(B, w)), nt.sortLayerNodes(A, s, u, I);
      }
    }
    return l;
  }
  static sortLayerNodes(g, s, n, I) {
    var C, h, A;
    if (!I || Object.keys(I.containers).length === 0) {
      g.sort((u, B) => {
        const w = nt.getBarycenter(u, s, n), y = nt.getBarycenter(B, s, n);
        return w - y;
      });
      return;
    }
    const c = /* @__PURE__ */ new Map();
    for (const u of g)
      c.set(u, nt.getBarycenter(u, s, n));
    const r = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
    for (const u of g) {
      const B = c.get(u) ?? 0;
      let w = ((C = I.nodes[u]) == null ? void 0 : C.parentId) ?? ((h = I.containers[u]) == null ? void 0 : h.parentId);
      for (; w; )
        r.set(w, (r.get(w) || 0) + B), l.set(w, (l.get(w) || 0) + 1), w = (A = I.containers[w]) == null ? void 0 : A.parentId;
    }
    const o = (u) => {
      if (I.containers[u]) {
        const B = l.get(u) || 0;
        return B === 0 ? 0 : (r.get(u) || 0) / B;
      }
      return c.get(u) ?? 0;
    };
    g.sort((u, B) => {
      const w = nt.getAncestorPath(u, I), y = nt.getAncestorPath(B, I);
      let e = 0;
      for (; e < w.length && e < y.length && w[e] === y[e]; )
        e++;
      const t = w[e] ?? u, i = y[e] ?? B, b = o(t) - o(i);
      return Math.abs(b) > 1e-5 ? b : t.localeCompare(i);
    });
  }
  static getAncestorPath(g, s) {
    var c, r, l;
    const n = [g];
    let I = ((c = s.nodes[g]) == null ? void 0 : c.parentId) ?? ((r = s.containers[g]) == null ? void 0 : r.parentId);
    for (; I; )
      n.unshift(I), I = (l = s.containers[I]) == null ? void 0 : l.parentId;
    return n;
  }
  static getBarycenter(g, s, n) {
    const I = s.get(g);
    if (!I || I.size === 0) return 0;
    let c = 0, r = 0;
    for (const l of I)
      n.has(l) && (c += n.get(l), r++);
    return r === 0 ? 0 : c / r;
  }
}
const st = 32, Pt = 24, ut = 22, rt = 18, lt = 38, wt = 210, Ht = 36, le = 180, Ae = 54, Wt = 260, Xt = 160;
class It {
  static assignCoordinates(g, s, n, I = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const c = I.direction ?? "TB", r = c === "TB" || c === "BT", l = c === "BT" || c === "RL", o = I.aspectRatio ?? 1.55, C = Object.keys(g.containers).length, h = I.mode && I.mode !== "auto" ? I.mode : C > 0 ? "concurrent" : "flow", A = {}, u = {}, B = (w) => {
      var t, i, b, f, K;
      const y = !!g.containers[w], e = !!((t = g.containers[w]) != null && t.collapsed);
      return y && e ? { width: wt, height: Ht } : y && !e ? {
        width: ((i = n.get(w)) == null ? void 0 : i.width) || Wt,
        height: ((b = n.get(w)) == null ? void 0 : b.height) || Xt
      } : {
        width: ((f = n.get(w)) == null ? void 0 : f.width) || le,
        height: ((K = n.get(w)) == null ? void 0 : K.height) || Ae
      };
    };
    return h === "concurrent" ? It.layoutConcurrentHierarchy(
      g,
      B,
      o,
      A,
      u
    ) : It.layoutFlowTree(
      g,
      s,
      B,
      r,
      l,
      I,
      A,
      u
    ), It.assignDynamicPortSides(g, A, u), { nodes: A, containers: u };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(g, s, n, I, c) {
    var w;
    const r = /* @__PURE__ */ new Map();
    for (const [y, e] of Object.entries(g.nodes)) {
      const t = e.parentId ?? null;
      r.has(t) || r.set(t, []), r.get(t).push(y);
    }
    for (const [y, e] of Object.entries(g.containers)) {
      const t = e.parentId ?? null;
      r.has(t) || r.set(t, []), r.get(t).push(y);
    }
    const l = It.getContainerDepths(g), o = Object.keys(g.containers).sort(
      (y, e) => (l.get(e) || 0) - (l.get(y) || 0)
    ), C = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
    for (const y of o) {
      if (!!((w = g.containers[y]) != null && w.collapsed)) {
        C.set(y, {
          width: wt,
          height: Ht
        });
        continue;
      }
      const t = r.get(y) || [];
      if (t.length === 0) {
        C.set(y, {
          width: wt,
          height: lt + rt * 2
        });
        continue;
      }
      const i = t.map((m) => {
        const p = C.has(m) ? C.get(m) : s(m);
        return { id: m, width: p.width, height: p.height };
      }), b = It.findBestTightPacking(i, n);
      for (const m of b.boxes)
        h.set(m.id, m);
      const f = Math.max(b.width + ut * 2, wt), K = b.height + lt + rt * 2;
      C.set(y, { width: f, height: K });
    }
    const A = r.get(null) || [];
    let u = [];
    if (A.length > 0) {
      const y = A.map((t) => {
        const i = C.get(t) || s(t);
        return { id: t, width: i.width, height: i.height };
      });
      u = It.findBestTightPacking(y, n).boxes.map((t) => ({
        ...t,
        localX: t.localX + 60,
        localY: t.localY + 60
      }));
    }
    const B = (y, e, t, i, b) => {
      var m;
      const f = !!g.containers[y], K = { id: y, x: e, y: t, width: i, height: b };
      if (f) {
        if (c[y] = K, (m = g.containers[y]) != null && m.collapsed) return;
        const p = e + ut, H = t + lt + rt, W = r.get(y) || [];
        for (const P of W) {
          const Z = h.get(P);
          Z && B(
            P,
            p + Z.localX,
            H + Z.localY,
            Z.width,
            Z.height
          );
        }
      } else
        I[y] = K;
    };
    for (const y of u)
      B(y.id, y.localX, y.localY, y.width, y.height);
  }
  static findBestTightPacking(g, s) {
    if (g.length === 1)
      return {
        width: g[0].width,
        height: g[0].height,
        boxes: [{ id: g[0].id, localX: 0, localY: 0, width: g[0].width, height: g[0].height }],
        score: 0
      };
    const n = g.reduce((A, u) => A + u.width * u.height, 0), I = Math.max(...g.map((A) => A.width)), c = [...g].sort((A, u) => u.width - A.width), r = /* @__PURE__ */ new Set(), l = g.reduce((A, u) => A + u.width, 0) + (g.length - 1) * st;
    r.add(l), r.add(I);
    const o = Math.max(I, Math.sqrt(n * s));
    r.add(o), r.add(o * 0.85), r.add(o * 1.15);
    const C = Math.min(g.length, 6);
    for (let A = 2; A <= C; A++) {
      let u = 0;
      for (let B = 0; B < A && B < c.length; B++)
        u += c[B].width;
      u += (A - 1) * st, u >= I && r.add(u);
    }
    let h = null;
    for (const A of r) {
      const u = It.simulateSkylinePacking(g, A), B = u.width * u.height, w = Math.max(0, B - n), y = u.width / Math.max(1, u.height), e = Math.abs(Math.log(y / s)), t = w / n * 2 + e * 0.25;
      u.score = t, (!h || t < h.score) && (h = u);
    }
    return h;
  }
  static simulateSkylinePacking(g, s) {
    const n = [...g].sort((o, C) => C.height - o.height), I = [{ x: 0, width: s, y: 0 }], c = [];
    for (const o of n) {
      let C = 1 / 0, h = -1;
      for (let t = 0; t < I.length; t++) {
        if (I[t].x + o.width > s) continue;
        let b = 0, f = 0;
        for (let K = t; K < I.length && f < o.width; K++)
          b = Math.max(b, I[K].y), f += I[K].width;
        b < C && (C = b, h = t);
      }
      if (h === -1) {
        const t = Math.max(...I.map((b) => b.y)), i = t === 0 ? 0 : t + Pt;
        c.push({
          id: o.id,
          localX: 0,
          localY: i,
          width: o.width,
          height: o.height
        }), I.length = 0, I.push({ x: 0, width: o.width + st, y: i + o.height }), s > o.width + st && I.push({
          x: o.width + st,
          width: s - (o.width + st),
          y: 0
        });
        continue;
      }
      const A = I[h].x, u = C === 0 ? 0 : C + Pt;
      c.push({
        id: o.id,
        localX: A,
        localY: u,
        width: o.width,
        height: o.height
      });
      const B = o.width + st, w = u + o.height, y = { x: A, width: B, y: w }, e = [];
      for (const t of I)
        t.x + t.width <= A || t.x >= A + B ? e.push(t) : (t.x < A && e.push({ x: t.x, width: A - t.x, y: t.y }), t.x + t.width > A + B && e.push({
          x: A + B,
          width: t.x + t.width - (A + B),
          y: t.y
        }));
      e.push(y), e.sort((t, i) => t.x - i.x), I.length = 0, I.push(...e);
    }
    const r = Math.max(...c.map((o) => o.localX + o.width), 0), l = Math.max(...c.map((o) => o.localY + o.height), 0);
    return { width: r, height: l, boxes: c, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE WITH COMPOUND CONTAINER SUPPORT
  // ===========================================================================
  static layoutFlowTree(g, s, n, I, c, r, l, o) {
    var Q;
    const C = Array.from(s.keys()).sort((S, E) => S - E), h = /* @__PURE__ */ new Map();
    let A = 80;
    const u = I ? lt + rt * 2 : ut * 2, B = (I ? Pt * 1.5 : st * 1.5) + u, w = I ? st : Pt, y = c ? [...C].reverse() : [...C];
    for (const S of y) {
      const E = s.get(S) || [];
      let a = 0;
      for (const k of E) {
        const Y = n(k), L = I ? Y.height : Y.width;
        a = Math.max(a, L);
      }
      h.set(S, A), A += a + B;
    }
    const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
    for (const S of Object.values(g.edges))
      e.has(S.targetId) || e.set(S.targetId, []), e.get(S.targetId).push(S.sourceId), t.has(S.sourceId) || t.set(S.sourceId, []), t.get(S.sourceId).push(S.targetId);
    const i = /* @__PURE__ */ new Map(), b = (S) => {
      var E, a;
      return ((E = g.nodes[S]) == null ? void 0 : E.parentId) ?? ((a = g.containers[S]) == null ? void 0 : a.parentId) ?? null;
    };
    for (const S of C) {
      const E = s.get(S) || [];
      let a = -1 / 0, k;
      for (const Y of E) {
        const L = n(Y), J = I ? L.width : L.height, v = e.get(Y) || [], z = b(Y);
        let $ = w;
        k !== void 0 && k !== z && ($ = w + (I ? ut * 2 : lt + rt * 2));
        let R = null;
        if (v.length > 0) {
          const it = v.map((dt) => {
            const ht = i.get(dt);
            if (ht === void 0) return null;
            const pt = n(dt);
            return ht + (I ? pt.width : pt.height) / 2;
          }).filter((dt) => dt !== null);
          it.length > 0 && (R = it.reduce((dt, ht) => dt + ht, 0) / it.length);
        }
        let _ = R !== null ? R - J / 2 : 80;
        _ < a + $ && (_ = a === -1 / 0 ? 80 : a + $), i.set(Y, _), a = _ + J, k = z;
      }
    }
    for (let S = C.length - 1; S >= 0; S--) {
      const E = C[S], a = s.get(E) || [];
      for (const L of a) {
        const J = t.get(L) || [];
        if (J.length === 0) continue;
        const v = J.map((z) => {
          const $ = i.get(z);
          if ($ === void 0) return null;
          const R = n(z);
          return $ + (I ? R.width : R.height) / 2;
        }).filter((z) => z !== null);
        if (v.length > 0) {
          const z = v.reduce((_, it) => _ + it, 0) / v.length, $ = n(L), R = I ? $.width : $.height;
          i.set(L, z - R / 2);
        }
      }
      let k = -1 / 0, Y;
      for (const L of a) {
        const J = n(L), v = I ? J.width : J.height, z = b(L);
        let $ = w;
        Y !== void 0 && Y !== z && ($ = w + (I ? ut * 2 : lt + rt * 2));
        let R = i.get(L) ?? 80;
        R < k + $ && (R = k + $, i.set(L, R)), k = R + v, Y = z;
      }
    }
    let f = 1 / 0;
    for (const S of i.values()) f = Math.min(f, S);
    const K = f < 80 ? 80 - f : 0;
    for (const S of C) {
      const E = s.get(S) || [], a = h.get(S) || 80;
      for (const k of E) {
        const Y = n(k), L = (i.get(k) ?? 80) + K, z = { id: k, x: I ? L : a, y: I ? a : L, width: Y.width, height: Y.height };
        g.containers[k] ? o[k] = z : l[k] = z;
      }
    }
    const m = It.getContainerDepths(g), p = Object.keys(g.containers).sort(
      (S, E) => (m.get(E) || 0) - (m.get(S) || 0)
    ), H = /* @__PURE__ */ new Map();
    for (const [S, E] of Object.entries(g.nodes))
      E.parentId && (H.has(E.parentId) || H.set(E.parentId, []), H.get(E.parentId).push(S));
    for (const [S, E] of Object.entries(g.containers))
      E.parentId && (H.has(E.parentId) || H.set(E.parentId, []), H.get(E.parentId).push(S));
    for (const S of p) {
      if ((Q = g.containers[S]) != null && Q.collapsed) {
        o[S] || (o[S] = {
          id: S,
          x: 80,
          y: 80,
          width: wt,
          height: Ht
        });
        continue;
      }
      const E = H.get(S) || [], a = [];
      for (const k of E) {
        const Y = l[k] || o[k];
        Y && a.push(Y);
      }
      if (a.length === 0)
        o[S] || (o[S] = {
          id: S,
          x: 80,
          y: 80,
          width: Wt,
          height: Xt
        });
      else {
        let k = 1 / 0, Y = -1 / 0, L = 1 / 0, J = -1 / 0;
        for (const _ of a)
          k = Math.min(k, _.x), Y = Math.max(Y, _.x + _.width), L = Math.min(L, _.y), J = Math.max(J, _.y + _.height);
        const v = Math.max(Y - k + ut * 2, wt), z = J - L + lt + rt * 2, $ = k - ut, R = L - lt - rt;
        o[S] = { id: S, x: $, y: R, width: v, height: z };
      }
    }
    let W = 1 / 0, P = 1 / 0;
    for (const S of [...Object.values(l), ...Object.values(o)])
      W = Math.min(W, S.x), P = Math.min(P, S.y);
    const Z = 60, X = W < Z ? Z - W : 0, V = P < Z ? Z - P : 0;
    if (X !== 0 || V !== 0) {
      for (const S of Object.values(l))
        S.x += X, S.y += V;
      for (const S of Object.values(o))
        S.x += X, S.y += V;
    }
  }
  static assignDynamicPortSides(g, s, n) {
    var c, r;
    const I = (l) => s[l] || n[l];
    for (const l of Object.values(g.edges)) {
      const o = I(l.sourceId), C = I(l.targetId);
      if (!o || !C) continue;
      const h = g.nodes[l.sourceId] || g.containers[l.sourceId], A = g.nodes[l.targetId] || g.containers[l.targetId], u = C.x + C.width / 2 - (o.x + o.width / 2), B = C.y + C.height / 2 - (o.y + o.height / 2), w = Math.abs(u) > Math.abs(B) * 1.25, y = (c = h == null ? void 0 : h.ports) == null ? void 0 : c.find((t) => t.id === l.sourcePortId);
      y && (!y.side || y.side === "auto") && (w ? y.side = u >= 0 ? "right" : "left" : y.side = B >= 0 ? "bottom" : "top");
      const e = (r = A == null ? void 0 : A.ports) == null ? void 0 : r.find((t) => t.id === l.targetPortId);
      e && (!e.side || e.side === "auto") && (w ? e.side = u >= 0 ? "left" : "right" : e.side = B >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(g) {
    const s = /* @__PURE__ */ new Map(), n = (I) => {
      var l;
      if (s.has(I)) return s.get(I);
      const c = (l = g.containers[I]) == null ? void 0 : l.parentId;
      if (!c || !g.containers[c])
        return s.set(I, 0), 0;
      const r = 1 + n(c);
      return s.set(I, r), r;
    };
    for (const I of Object.keys(g.containers))
      n(I);
    return s;
  }
}
class ae {
  async execute(g, s, n) {
    const I = Object.values(g.containers), c = Object.values(g.nodes), r = new Set(
      I.filter((u) => !!u.collapsed).map((u) => u.id)
    ), l = (u) => {
      var w;
      let B = u;
      for (; B; ) {
        if (r.has(B)) return !0;
        B = (w = g.containers[B]) == null ? void 0 : w.parentId;
      }
      return !1;
    }, o = /* @__PURE__ */ new Set();
    for (const [u, B] of Object.entries(g.nodes))
      l(B.parentId) || o.add(u);
    for (const [u, B] of Object.entries(g.containers)) {
      const w = B;
      w.collapsed ? l(w.parentId) || o.add(u) : !(c.some((e) => e.parentId === u) || I.some((e) => e.parentId === u)) && !l(w.parentId) && o.add(u);
    }
    const C = ce.decouple(g, o), h = re.assignLayers(C.allEntityIds, C.adjList), A = nt.minimizeCrossings(h, C.adjList, 4, g);
    return It.assignCoordinates(g, A, s, n);
  }
}
const Qt = "Y2xhc3Mgb3QgewogIHN0YXRpYyBkZWNvdXBsZShuLCBmKSB7CiAgICBjb25zdCByID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgcyBvZiBmKQogICAgICByLnNldChzLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgIGNvbnN0IHQgPSBPYmplY3QudmFsdWVzKG4uZWRnZXMpOwogICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgIGYuaGFzKHMuc291cmNlSWQpICYmIGYuaGFzKHMudGFyZ2V0SWQpICYmIHIuZ2V0KHMuc291cmNlSWQpLmFkZChzLnRhcmdldElkKTsKICAgIGNvbnN0IGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGUgPSAocykgPT4gewogICAgICBhLmFkZChzKSwgaC5hZGQocyk7CiAgICAgIGNvbnN0IHkgPSBBcnJheS5mcm9tKHIuZ2V0KHMpIHx8IFtdKTsKICAgICAgZm9yIChjb25zdCBpIG9mIHkpCiAgICAgICAgYS5oYXMoaSkgPyBoLmhhcyhpKSAmJiAoci5nZXQocykuZGVsZXRlKGkpLCByLmdldChpKS5hZGQocyksIGQuYWRkKGAke3N9LT4ke2l9YCkpIDogZShpKTsKICAgICAgaC5kZWxldGUocyk7CiAgICB9OwogICAgZm9yIChjb25zdCBzIG9mIGYpCiAgICAgIGEuaGFzKHMpIHx8IGUocyk7CiAgICByZXR1cm4gewogICAgICBhZGpMaXN0OiByLAogICAgICByZXZlcnNlZEVkZ2VzOiBkLAogICAgICBhbGxFbnRpdHlJZHM6IEFycmF5LmZyb20oZikKICAgIH07CiAgfQp9CmNsYXNzIGN0IHsKICBzdGF0aWMgYXNzaWduTGF5ZXJzKG4sIGYpIHsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgIHIuc2V0KGUsIDApOwogICAgZm9yIChjb25zdCBbLCBlXSBvZiBmLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIGUpCiAgICAgICAgci5zZXQocywgKHIuZ2V0KHMpIHx8IDApICsgMSk7CiAgICBjb25zdCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYSA9IFtdOwogICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgIChyLmdldChlKSB8fCAwKSA9PT0gMCAmJiAodC5zZXQoZSwgMCksIGEucHVzaChlKSk7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyBhLmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBlID0gYS5zaGlmdCgpOwogICAgICBoLmFkZChlKTsKICAgICAgY29uc3QgcyA9IHQuZ2V0KGUpIHx8IDAsIHkgPSBmLmdldChlKSB8fCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICBmb3IgKGNvbnN0IGkgb2YgeSkgewogICAgICAgIGNvbnN0IG8gPSB0LmdldChpKSA/PyAwOwogICAgICAgIHQuc2V0KGksIE1hdGgubWF4KG8sIHMgKyAxKSksIHIuc2V0KGksIChyLmdldChpKSB8fCAxKSAtIDEpLCByLmdldChpKSA9PT0gMCAmJiBhLnB1c2goaSk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgZSBvZiBuKQogICAgICB0LmhhcyhlKSB8fCB0LnNldChlLCAwKTsKICAgIGNvbnN0IGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbZSwgc10gb2YgdC5lbnRyaWVzKCkpCiAgICAgIGQuaGFzKHMpIHx8IGQuc2V0KHMsIFtdKSwgZC5nZXQocykucHVzaChlKTsKICAgIHJldHVybiBkOwogIH0KfQpjbGFzcyBSIHsKICBzdGF0aWMgbWluaW1pemVDcm9zc2luZ3MobiwgZiwgciA9IDQsIHQpIHsKICAgIGNvbnN0IGEgPSBBcnJheS5mcm9tKG4ua2V5cygpKS5zb3J0KChlLCBzKSA9PiBlIC0gcyk7CiAgICBpZiAoYS5sZW5ndGggPD0gMSkgcmV0dXJuIG47CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW2UsIHNdIG9mIGYuZW50cmllcygpKQogICAgICBmb3IgKGNvbnN0IHkgb2YgcykKICAgICAgICBoLmhhcyh5KSB8fCBoLnNldCh5LCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKSwgaC5nZXQoeSkuYWRkKGUpOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtlLCBzXSBvZiBuLmVudHJpZXMoKSkKICAgICAgZC5zZXQoZSwgWy4uLnNdKTsKICAgIGZvciAobGV0IGUgPSAwOyBlIDwgcjsgZSsrKSB7CiAgICAgIGZvciAobGV0IHMgPSAxOyBzIDwgYS5sZW5ndGg7IHMrKykgewogICAgICAgIGNvbnN0IHkgPSBkLmdldChhW3MgLSAxXSksIGkgPSBkLmdldChhW3NdKSwgbyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgICAgeS5mb3JFYWNoKCh1LCB3KSA9PiBvLnNldCh1LCB3KSksIFIuc29ydExheWVyTm9kZXMoaSwgaCwgbywgdCk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgcyA9IGEubGVuZ3RoIC0gMjsgcyA+PSAwOyBzLS0pIHsKICAgICAgICBjb25zdCB5ID0gZC5nZXQoYVtzICsgMV0pLCBpID0gZC5nZXQoYVtzXSksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHkuZm9yRWFjaCgodSwgdykgPT4gby5zZXQodSwgdykpLCBSLnNvcnRMYXllck5vZGVzKGksIGYsIG8sIHQpOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gZDsKICB9CiAgc3RhdGljIHNvcnRMYXllck5vZGVzKG4sIGYsIHIsIHQpIHsKICAgIHZhciBzLCB5LCBpOwogICAgaWYgKCF0IHx8IE9iamVjdC5rZXlzKHQuY29udGFpbmVycykubGVuZ3RoID09PSAwKSB7CiAgICAgIG4uc29ydCgobywgdSkgPT4gewogICAgICAgIGNvbnN0IHcgPSBSLmdldEJhcnljZW50ZXIobywgZiwgciksIGcgPSBSLmdldEJhcnljZW50ZXIodSwgZiwgcik7CiAgICAgICAgcmV0dXJuIHcgLSBnOwogICAgICB9KTsKICAgICAgcmV0dXJuOwogICAgfQogICAgY29uc3QgYSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgbikKICAgICAgYS5zZXQobywgUi5nZXRCYXJ5Y2VudGVyKG8sIGYsIHIpKTsKICAgIGNvbnN0IGggPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBkID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgbyBvZiBuKSB7CiAgICAgIGNvbnN0IHUgPSBhLmdldChvKSA/PyAwOwogICAgICBsZXQgdyA9ICgocyA9IHQubm9kZXNbb10pID09IG51bGwgPyB2b2lkIDAgOiBzLnBhcmVudElkKSA/PyAoKHkgPSB0LmNvbnRhaW5lcnNbb10pID09IG51bGwgPyB2b2lkIDAgOiB5LnBhcmVudElkKTsKICAgICAgZm9yICg7IHc7ICkKICAgICAgICBoLnNldCh3LCAoaC5nZXQodykgfHwgMCkgKyB1KSwgZC5zZXQodywgKGQuZ2V0KHcpIHx8IDApICsgMSksIHcgPSAoaSA9IHQuY29udGFpbmVyc1t3XSkgPT0gbnVsbCA/IHZvaWQgMCA6IGkucGFyZW50SWQ7CiAgICB9CiAgICBjb25zdCBlID0gKG8pID0+IHsKICAgICAgaWYgKHQuY29udGFpbmVyc1tvXSkgewogICAgICAgIGNvbnN0IHUgPSBkLmdldChvKSB8fCAwOwogICAgICAgIHJldHVybiB1ID09PSAwID8gMCA6IChoLmdldChvKSB8fCAwKSAvIHU7CiAgICAgIH0KICAgICAgcmV0dXJuIGEuZ2V0KG8pID8/IDA7CiAgICB9OwogICAgbi5zb3J0KChvLCB1KSA9PiB7CiAgICAgIGNvbnN0IHcgPSBSLmdldEFuY2VzdG9yUGF0aChvLCB0KSwgZyA9IFIuZ2V0QW5jZXN0b3JQYXRoKHUsIHQpOwogICAgICBsZXQgcCA9IDA7CiAgICAgIGZvciAoOyBwIDwgdy5sZW5ndGggJiYgcCA8IGcubGVuZ3RoICYmIHdbcF0gPT09IGdbcF07ICkKICAgICAgICBwKys7CiAgICAgIGNvbnN0IGMgPSB3W3BdID8/IG8sIEkgPSBnW3BdID8/IHUsIE0gPSBlKGMpIC0gZShJKTsKICAgICAgcmV0dXJuIE1hdGguYWJzKE0pID4gMWUtNSA/IE0gOiBjLmxvY2FsZUNvbXBhcmUoSSk7CiAgICB9KTsKICB9CiAgc3RhdGljIGdldEFuY2VzdG9yUGF0aChuLCBmKSB7CiAgICB2YXIgYSwgaCwgZDsKICAgIGNvbnN0IHIgPSBbbl07CiAgICBsZXQgdCA9ICgoYSA9IGYubm9kZXNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyAoKGggPSBmLmNvbnRhaW5lcnNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKTsKICAgIGZvciAoOyB0OyApCiAgICAgIHIudW5zaGlmdCh0KSwgdCA9IChkID0gZi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogZC5wYXJlbnRJZDsKICAgIHJldHVybiByOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihuLCBmLCByKSB7CiAgICBjb25zdCB0ID0gZi5nZXQobik7CiAgICBpZiAoIXQgfHwgdC5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBhID0gMCwgaCA9IDA7CiAgICBmb3IgKGNvbnN0IGQgb2YgdCkKICAgICAgci5oYXMoZCkgJiYgKGEgKz0gci5nZXQoZCksIGgrKyk7CiAgICByZXR1cm4gaCA9PT0gMCA/IDAgOiBhIC8gaDsKICB9Cn0KY29uc3QgayA9IDMyLCBRID0gMjQsIEwgPSAyMiwgRyA9IDE4LCBXID0gMzgsIHEgPSAyMTAsIFYgPSAzNiwgaXQgPSAxODAsIHJ0ID0gNTQsIG50ID0gMjYwLCBzdCA9IDE2MDsKY2xhc3MgWSB7CiAgc3RhdGljIGFzc2lnbkNvb3JkaW5hdGVzKG4sIGYsIHIsIHQgPSB7IGRpcmVjdGlvbjogIlRCIiwgbW9kZTogImF1dG8iLCBhc3BlY3RSYXRpbzogMS41NSB9KSB7CiAgICBjb25zdCBhID0gdC5kaXJlY3Rpb24gPz8gIlRCIiwgaCA9IGEgPT09ICJUQiIgfHwgYSA9PT0gIkJUIiwgZCA9IGEgPT09ICJCVCIgfHwgYSA9PT0gIlJMIiwgZSA9IHQuYXNwZWN0UmF0aW8gPz8gMS41NSwgcyA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykubGVuZ3RoLCB5ID0gdC5tb2RlICYmIHQubW9kZSAhPT0gImF1dG8iID8gdC5tb2RlIDogcyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIsIGkgPSB7fSwgbyA9IHt9LCB1ID0gKHcpID0+IHsKICAgICAgdmFyIGMsIEksIE0sIE4sIEE7CiAgICAgIGNvbnN0IGcgPSAhIW4uY29udGFpbmVyc1t3XSwgcCA9ICEhKChjID0gbi5jb250YWluZXJzW3ddKSAhPSBudWxsICYmIGMuY29sbGFwc2VkKTsKICAgICAgcmV0dXJuIGcgJiYgcCA/IHsgd2lkdGg6IHEsIGhlaWdodDogViB9IDogZyAmJiAhcCA/IHsKICAgICAgICB3aWR0aDogKChJID0gci5nZXQodykpID09IG51bGwgPyB2b2lkIDAgOiBJLndpZHRoKSB8fCBudCwKICAgICAgICBoZWlnaHQ6ICgoTSA9IHIuZ2V0KHcpKSA9PSBudWxsID8gdm9pZCAwIDogTS5oZWlnaHQpIHx8IHN0CiAgICAgIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoTiA9IHIuZ2V0KHcpKSA9PSBudWxsID8gdm9pZCAwIDogTi53aWR0aCkgfHwgaXQsCiAgICAgICAgaGVpZ2h0OiAoKEEgPSByLmdldCh3KSkgPT0gbnVsbCA/IHZvaWQgMCA6IEEuaGVpZ2h0KSB8fCBydAogICAgICB9OwogICAgfTsKICAgIHJldHVybiB5ID09PSAiY29uY3VycmVudCIgPyBZLmxheW91dENvbmN1cnJlbnRIaWVyYXJjaHkoCiAgICAgIG4sCiAgICAgIHUsCiAgICAgIGUsCiAgICAgIGksCiAgICAgIG8KICAgICkgOiBZLmxheW91dEZsb3dUcmVlKAogICAgICBuLAogICAgICBmLAogICAgICB1LAogICAgICBoLAogICAgICBkLAogICAgICB0LAogICAgICBpLAogICAgICBvCiAgICApLCBZLmFzc2lnbkR5bmFtaWNQb3J0U2lkZXMobiwgaSwgbyksIHsgbm9kZXM6IGksIGNvbnRhaW5lcnM6IG8gfTsKICB9CiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgLy8gQ09OQ1VSUkVOVCBDT01QT1VORCBQQUNLSU5HIFdJVEggU0tZTElORSAyRCBCSU4gUEFDS0lORwogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KG4sIGYsIHIsIHQsIGEpIHsKICAgIHZhciB3OwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtnLCBwXSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkgewogICAgICBjb25zdCBjID0gcC5wYXJlbnRJZCA/PyBudWxsOwogICAgICBoLmhhcyhjKSB8fCBoLnNldChjLCBbXSksIGguZ2V0KGMpLnB1c2goZyk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFtnLCBwXSBvZiBPYmplY3QuZW50cmllcyhuLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IGMgPSBwLnBhcmVudElkID8/IG51bGw7CiAgICAgIGguaGFzKGMpIHx8IGguc2V0KGMsIFtdKSwgaC5nZXQoYykucHVzaChnKTsKICAgIH0KICAgIGNvbnN0IGQgPSBZLmdldENvbnRhaW5lckRlcHRocyhuKSwgZSA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykuc29ydCgKICAgICAgKGcsIHApID0+IChkLmdldChwKSB8fCAwKSAtIChkLmdldChnKSB8fCAwKQogICAgKSwgcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBnIG9mIGUpIHsKICAgICAgaWYgKCEhKCh3ID0gbi5jb250YWluZXJzW2ddKSAhPSBudWxsICYmIHcuY29sbGFwc2VkKSkgewogICAgICAgIHMuc2V0KGcsIHsKICAgICAgICAgIHdpZHRoOiBxLAogICAgICAgICAgaGVpZ2h0OiBWCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgYyA9IGguZ2V0KGcpIHx8IFtdOwogICAgICBpZiAoYy5sZW5ndGggPT09IDApIHsKICAgICAgICBzLnNldChnLCB7CiAgICAgICAgICB3aWR0aDogcSwKICAgICAgICAgIGhlaWdodDogVyArIEcgKiAyCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgSSA9IGMubWFwKChTKSA9PiB7CiAgICAgICAgY29uc3QgXyA9IHMuaGFzKFMpID8gcy5nZXQoUykgOiBmKFMpOwogICAgICAgIHJldHVybiB7IGlkOiBTLCB3aWR0aDogXy53aWR0aCwgaGVpZ2h0OiBfLmhlaWdodCB9OwogICAgICB9KSwgTSA9IFkuZmluZEJlc3RUaWdodFBhY2tpbmcoSSwgcik7CiAgICAgIGZvciAoY29uc3QgUyBvZiBNLmJveGVzKQogICAgICAgIHkuc2V0KFMuaWQsIFMpOwogICAgICBjb25zdCBOID0gTWF0aC5tYXgoTS53aWR0aCArIEwgKiAyLCBxKSwgQSA9IE0uaGVpZ2h0ICsgVyArIEcgKiAyOwogICAgICBzLnNldChnLCB7IHdpZHRoOiBOLCBoZWlnaHQ6IEEgfSk7CiAgICB9CiAgICBjb25zdCBpID0gaC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgbyA9IFtdOwogICAgaWYgKGkubGVuZ3RoID4gMCkgewogICAgICBjb25zdCBnID0gaS5tYXAoKGMpID0+IHsKICAgICAgICBjb25zdCBJID0gcy5nZXQoYykgfHwgZihjKTsKICAgICAgICByZXR1cm4geyBpZDogYywgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgfSk7CiAgICAgIG8gPSBZLmZpbmRCZXN0VGlnaHRQYWNraW5nKGcsIHIpLmJveGVzLm1hcCgoYykgPT4gKHsKICAgICAgICAuLi5jLAogICAgICAgIGxvY2FsWDogYy5sb2NhbFggKyA2MCwKICAgICAgICBsb2NhbFk6IGMubG9jYWxZICsgNjAKICAgICAgfSkpOwogICAgfQogICAgY29uc3QgdSA9IChnLCBwLCBjLCBJLCBNKSA9PiB7CiAgICAgIHZhciBTOwogICAgICBjb25zdCBOID0gISFuLmNvbnRhaW5lcnNbZ10sIEEgPSB7IGlkOiBnLCB4OiBwLCB5OiBjLCB3aWR0aDogSSwgaGVpZ2h0OiBNIH07CiAgICAgIGlmIChOKSB7CiAgICAgICAgaWYgKGFbZ10gPSBBLCAoUyA9IG4uY29udGFpbmVyc1tnXSkgIT0gbnVsbCAmJiBTLmNvbGxhcHNlZCkgcmV0dXJuOwogICAgICAgIGNvbnN0IF8gPSBwICsgTCwgSCA9IGMgKyBXICsgRywgRiA9IGguZ2V0KGcpIHx8IFtdOwogICAgICAgIGZvciAoY29uc3QgWCBvZiBGKSB7CiAgICAgICAgICBjb25zdCBCID0geS5nZXQoWCk7CiAgICAgICAgICBCICYmIHUoCiAgICAgICAgICAgIFgsCiAgICAgICAgICAgIF8gKyBCLmxvY2FsWCwKICAgICAgICAgICAgSCArIEIubG9jYWxZLAogICAgICAgICAgICBCLndpZHRoLAogICAgICAgICAgICBCLmhlaWdodAogICAgICAgICAgKTsKICAgICAgICB9CiAgICAgIH0gZWxzZQogICAgICAgIHRbZ10gPSBBOwogICAgfTsKICAgIGZvciAoY29uc3QgZyBvZiBvKQogICAgICB1KGcuaWQsIGcubG9jYWxYLCBnLmxvY2FsWSwgZy53aWR0aCwgZy5oZWlnaHQpOwogIH0KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcobiwgZikgewogICAgaWYgKG4ubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBuWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogblswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBuWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IG5bMF0ud2lkdGgsIGhlaWdodDogblswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IHIgPSBuLnJlZHVjZSgoaSwgbykgPT4gaSArIG8ud2lkdGggKiBvLmhlaWdodCwgMCksIHQgPSBNYXRoLm1heCguLi5uLm1hcCgoaSkgPT4gaS53aWR0aCkpLCBhID0gWy4uLm5dLnNvcnQoKGksIG8pID0+IG8ud2lkdGggLSBpLndpZHRoKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGQgPSBuLnJlZHVjZSgoaSwgbykgPT4gaSArIG8ud2lkdGgsIDApICsgKG4ubGVuZ3RoIC0gMSkgKiBrOwogICAgaC5hZGQoZCksIGguYWRkKHQpOwogICAgY29uc3QgZSA9IE1hdGgubWF4KHQsIE1hdGguc3FydChyICogZikpOwogICAgaC5hZGQoZSksIGguYWRkKGUgKiAwLjg1KSwgaC5hZGQoZSAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKG4ubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IGkgPSAyOyBpIDw9IHM7IGkrKykgewogICAgICBsZXQgbyA9IDA7CiAgICAgIGZvciAobGV0IHUgPSAwOyB1IDwgaSAmJiB1IDwgYS5sZW5ndGg7IHUrKykKICAgICAgICBvICs9IGFbdV0ud2lkdGg7CiAgICAgIG8gKz0gKGkgLSAxKSAqIGssIG8gPj0gdCAmJiBoLmFkZChvKTsKICAgIH0KICAgIGxldCB5ID0gbnVsbDsKICAgIGZvciAoY29uc3QgaSBvZiBoKSB7CiAgICAgIGNvbnN0IG8gPSBZLnNpbXVsYXRlU2t5bGluZVBhY2tpbmcobiwgaSksIHUgPSBvLndpZHRoICogby5oZWlnaHQsIHcgPSBNYXRoLm1heCgwLCB1IC0gciksIGcgPSBvLndpZHRoIC8gTWF0aC5tYXgoMSwgby5oZWlnaHQpLCBwID0gTWF0aC5hYnMoTWF0aC5sb2coZyAvIGYpKSwgYyA9IHcgLyByICogMiArIHAgKiAwLjI1OwogICAgICBvLnNjb3JlID0gYywgKCF5IHx8IGMgPCB5LnNjb3JlKSAmJiAoeSA9IG8pOwogICAgfQogICAgcmV0dXJuIHk7CiAgfQogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKG4sIGYpIHsKICAgIGNvbnN0IHIgPSBbLi4ubl0uc29ydCgoZSwgcykgPT4gcy5oZWlnaHQgLSBlLmhlaWdodCksIHQgPSBbeyB4OiAwLCB3aWR0aDogZiwgeTogMCB9XSwgYSA9IFtdOwogICAgZm9yIChjb25zdCBlIG9mIHIpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHQubGVuZ3RoOyBjKyspIHsKICAgICAgICBpZiAodFtjXS54ICsgZS53aWR0aCA+IGYpIGNvbnRpbnVlOwogICAgICAgIGxldCBNID0gMCwgTiA9IDA7CiAgICAgICAgZm9yIChsZXQgQSA9IGM7IEEgPCB0Lmxlbmd0aCAmJiBOIDwgZS53aWR0aDsgQSsrKQogICAgICAgICAgTSA9IE1hdGgubWF4KE0sIHRbQV0ueSksIE4gKz0gdFtBXS53aWR0aDsKICAgICAgICBNIDwgcyAmJiAocyA9IE0sIHkgPSBjKTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCBjID0gTWF0aC5tYXgoLi4udC5tYXAoKE0pID0+IE0ueSkpLCBJID0gYyA9PT0gMCA/IDAgOiBjICsgUTsKICAgICAgICBhLnB1c2goewogICAgICAgICAgaWQ6IGUuaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IEksCiAgICAgICAgICB3aWR0aDogZS53aWR0aCwKICAgICAgICAgIGhlaWdodDogZS5oZWlnaHQKICAgICAgICB9KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goeyB4OiAwLCB3aWR0aDogZS53aWR0aCArIGssIHk6IEkgKyBlLmhlaWdodCB9KSwgZiA+IGUud2lkdGggKyBrICYmIHQucHVzaCh7CiAgICAgICAgICB4OiBlLndpZHRoICsgaywKICAgICAgICAgIHdpZHRoOiBmIC0gKGUud2lkdGggKyBrKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBpID0gdFt5XS54LCBvID0gcyA9PT0gMCA/IDAgOiBzICsgUTsKICAgICAgYS5wdXNoKHsKICAgICAgICBpZDogZS5pZCwKICAgICAgICBsb2NhbFg6IGksCiAgICAgICAgbG9jYWxZOiBvLAogICAgICAgIHdpZHRoOiBlLndpZHRoLAogICAgICAgIGhlaWdodDogZS5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IHUgPSBlLndpZHRoICsgaywgdyA9IG8gKyBlLmhlaWdodCwgZyA9IHsgeDogaSwgd2lkdGg6IHUsIHk6IHcgfSwgcCA9IFtdOwogICAgICBmb3IgKGNvbnN0IGMgb2YgdCkKICAgICAgICBjLnggKyBjLndpZHRoIDw9IGkgfHwgYy54ID49IGkgKyB1ID8gcC5wdXNoKGMpIDogKGMueCA8IGkgJiYgcC5wdXNoKHsgeDogYy54LCB3aWR0aDogaSAtIGMueCwgeTogYy55IH0pLCBjLnggKyBjLndpZHRoID4gaSArIHUgJiYgcC5wdXNoKHsKICAgICAgICAgIHg6IGkgKyB1LAogICAgICAgICAgd2lkdGg6IGMueCArIGMud2lkdGggLSAoaSArIHUpLAogICAgICAgICAgeTogYy55CiAgICAgICAgfSkpOwogICAgICBwLnB1c2goZyksIHAuc29ydCgoYywgSSkgPT4gYy54IC0gSS54KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goLi4ucCk7CiAgICB9CiAgICBjb25zdCBoID0gTWF0aC5tYXgoLi4uYS5tYXAoKGUpID0+IGUubG9jYWxYICsgZS53aWR0aCksIDApLCBkID0gTWF0aC5tYXgoLi4uYS5tYXAoKGUpID0+IGUubG9jYWxZICsgZS5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBoLCBoZWlnaHQ6IGQsIGJveGVzOiBhLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgV0lUSCBDT01QT1VORCBDT05UQUlORVIgU1VQUE9SVAogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRGbG93VHJlZShuLCBmLCByLCB0LCBhLCBoLCBkLCBlKSB7CiAgICB2YXIgdHQ7CiAgICBjb25zdCBzID0gQXJyYXkuZnJvbShmLmtleXMoKSkuc29ydCgobCwgeCkgPT4gbCAtIHgpLCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGxldCBpID0gODA7CiAgICBjb25zdCBvID0gdCA/IFcgKyBHICogMiA6IEwgKiAyLCB1ID0gKHQgPyBRICogMS41IDogayAqIDEuNSkgKyBvLCB3ID0gdCA/IGsgOiBRLCBnID0gYSA/IFsuLi5zXS5yZXZlcnNlKCkgOiBbLi4uc107CiAgICBmb3IgKGNvbnN0IGwgb2YgZykgewogICAgICBjb25zdCB4ID0gZi5nZXQobCkgfHwgW107CiAgICAgIGxldCBPID0gMDsKICAgICAgZm9yIChjb25zdCBtIG9mIHgpIHsKICAgICAgICBjb25zdCBiID0gcihtKSwgUCA9IHQgPyBiLmhlaWdodCA6IGIud2lkdGg7CiAgICAgICAgTyA9IE1hdGgubWF4KE8sIFApOwogICAgICB9CiAgICAgIHkuc2V0KGwsIGkpLCBpICs9IE8gKyB1OwogICAgfQogICAgY29uc3QgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBsIG9mIE9iamVjdC52YWx1ZXMobi5lZGdlcykpCiAgICAgIHAuaGFzKGwudGFyZ2V0SWQpIHx8IHAuc2V0KGwudGFyZ2V0SWQsIFtdKSwgcC5nZXQobC50YXJnZXRJZCkucHVzaChsLnNvdXJjZUlkKSwgYy5oYXMobC5zb3VyY2VJZCkgfHwgYy5zZXQobC5zb3VyY2VJZCwgW10pLCBjLmdldChsLnNvdXJjZUlkKS5wdXNoKGwudGFyZ2V0SWQpOwogICAgY29uc3QgSSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIE0gPSAobCkgPT4gewogICAgICB2YXIgeCwgTzsKICAgICAgcmV0dXJuICgoeCA9IG4ubm9kZXNbbF0pID09IG51bGwgPyB2b2lkIDAgOiB4LnBhcmVudElkKSA/PyAoKE8gPSBuLmNvbnRhaW5lcnNbbF0pID09IG51bGwgPyB2b2lkIDAgOiBPLnBhcmVudElkKSA/PyBudWxsOwogICAgfTsKICAgIGZvciAoY29uc3QgbCBvZiBzKSB7CiAgICAgIGNvbnN0IHggPSBmLmdldChsKSB8fCBbXTsKICAgICAgbGV0IE8gPSAtMSAvIDAsIG07CiAgICAgIGZvciAoY29uc3QgYiBvZiB4KSB7CiAgICAgICAgY29uc3QgUCA9IHIoYiksIGogPSB0ID8gUC53aWR0aCA6IFAuaGVpZ2h0LCBFID0gcC5nZXQoYikgfHwgW10sIEMgPSBNKGIpOwogICAgICAgIGxldCBUID0gdzsKICAgICAgICBtICE9PSB2b2lkIDAgJiYgbSAhPT0gQyAmJiAoVCA9IHcgKyAodCA/IEwgKiAyIDogVyArIEcgKiAyKSk7CiAgICAgICAgbGV0IHYgPSBudWxsOwogICAgICAgIGlmIChFLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0ICQgPSBFLm1hcCgoVSkgPT4gewogICAgICAgICAgICBjb25zdCBLID0gSS5nZXQoVSk7CiAgICAgICAgICAgIGlmIChLID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBldCA9IHIoVSk7CiAgICAgICAgICAgIHJldHVybiBLICsgKHQgPyBldC53aWR0aCA6IGV0LmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChVKSA9PiBVICE9PSBudWxsKTsKICAgICAgICAgICQubGVuZ3RoID4gMCAmJiAodiA9ICQucmVkdWNlKChVLCBLKSA9PiBVICsgSywgMCkgLyAkLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBEID0gdiAhPT0gbnVsbCA/IHYgLSBqIC8gMiA6IDgwOwogICAgICAgIEQgPCBPICsgVCAmJiAoRCA9IE8gPT09IC0xIC8gMCA/IDgwIDogTyArIFQpLCBJLnNldChiLCBEKSwgTyA9IEQgKyBqLCBtID0gQzsKICAgICAgfQogICAgfQogICAgZm9yIChsZXQgbCA9IHMubGVuZ3RoIC0gMTsgbCA+PSAwOyBsLS0pIHsKICAgICAgY29uc3QgeCA9IHNbbF0sIE8gPSBmLmdldCh4KSB8fCBbXTsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBqID0gYy5nZXQoUCkgfHwgW107CiAgICAgICAgaWYgKGoubGVuZ3RoID09PSAwKSBjb250aW51ZTsKICAgICAgICBjb25zdCBFID0gai5tYXAoKEMpID0+IHsKICAgICAgICAgIGNvbnN0IFQgPSBJLmdldChDKTsKICAgICAgICAgIGlmIChUID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgY29uc3QgdiA9IHIoQyk7CiAgICAgICAgICByZXR1cm4gVCArICh0ID8gdi53aWR0aCA6IHYuaGVpZ2h0KSAvIDI7CiAgICAgICAgfSkuZmlsdGVyKChDKSA9PiBDICE9PSBudWxsKTsKICAgICAgICBpZiAoRS5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBDID0gRS5yZWR1Y2UoKEQsICQpID0+IEQgKyAkLCAwKSAvIEUubGVuZ3RoLCBUID0gcihQKSwgdiA9IHQgPyBULndpZHRoIDogVC5oZWlnaHQ7CiAgICAgICAgICBJLnNldChQLCBDIC0gdiAvIDIpOwogICAgICAgIH0KICAgICAgfQogICAgICBsZXQgbSA9IC0xIC8gMCwgYjsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBqID0gcihQKSwgRSA9IHQgPyBqLndpZHRoIDogai5oZWlnaHQsIEMgPSBNKFApOwogICAgICAgIGxldCBUID0gdzsKICAgICAgICBiICE9PSB2b2lkIDAgJiYgYiAhPT0gQyAmJiAoVCA9IHcgKyAodCA/IEwgKiAyIDogVyArIEcgKiAyKSk7CiAgICAgICAgbGV0IHYgPSBJLmdldChQKSA/PyA4MDsKICAgICAgICB2IDwgbSArIFQgJiYgKHYgPSBtICsgVCwgSS5zZXQoUCwgdikpLCBtID0gdiArIEUsIGIgPSBDOwogICAgICB9CiAgICB9CiAgICBsZXQgTiA9IDEgLyAwOwogICAgZm9yIChjb25zdCBsIG9mIEkudmFsdWVzKCkpIE4gPSBNYXRoLm1pbihOLCBsKTsKICAgIGNvbnN0IEEgPSBOIDwgODAgPyA4MCAtIE4gOiAwOwogICAgZm9yIChjb25zdCBsIG9mIHMpIHsKICAgICAgY29uc3QgeCA9IGYuZ2V0KGwpIHx8IFtdLCBPID0geS5nZXQobCkgfHwgODA7CiAgICAgIGZvciAoY29uc3QgbSBvZiB4KSB7CiAgICAgICAgY29uc3QgYiA9IHIobSksIFAgPSAoSS5nZXQobSkgPz8gODApICsgQSwgQyA9IHsgaWQ6IG0sIHg6IHQgPyBQIDogTywgeTogdCA/IE8gOiBQLCB3aWR0aDogYi53aWR0aCwgaGVpZ2h0OiBiLmhlaWdodCB9OwogICAgICAgIG4uY29udGFpbmVyc1ttXSA/IGVbbV0gPSBDIDogZFttXSA9IEM7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IFMgPSBZLmdldENvbnRhaW5lckRlcHRocyhuKSwgXyA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykuc29ydCgKICAgICAgKGwsIHgpID0+IChTLmdldCh4KSB8fCAwKSAtIChTLmdldChsKSB8fCAwKQogICAgKSwgSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtsLCB4XSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkKICAgICAgeC5wYXJlbnRJZCAmJiAoSC5oYXMoeC5wYXJlbnRJZCkgfHwgSC5zZXQoeC5wYXJlbnRJZCwgW10pLCBILmdldCh4LnBhcmVudElkKS5wdXNoKGwpKTsKICAgIGZvciAoY29uc3QgW2wsIHhdIG9mIE9iamVjdC5lbnRyaWVzKG4uY29udGFpbmVycykpCiAgICAgIHgucGFyZW50SWQgJiYgKEguaGFzKHgucGFyZW50SWQpIHx8IEguc2V0KHgucGFyZW50SWQsIFtdKSwgSC5nZXQoeC5wYXJlbnRJZCkucHVzaChsKSk7CiAgICBmb3IgKGNvbnN0IGwgb2YgXykgewogICAgICBpZiAoKHR0ID0gbi5jb250YWluZXJzW2xdKSAhPSBudWxsICYmIHR0LmNvbGxhcHNlZCkgewogICAgICAgIGVbbF0gfHwgKGVbbF0gPSB7CiAgICAgICAgICBpZDogbCwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogcSwKICAgICAgICAgIGhlaWdodDogVgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHggPSBILmdldChsKSB8fCBbXSwgTyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG0gb2YgeCkgewogICAgICAgIGNvbnN0IGIgPSBkW21dIHx8IGVbbV07CiAgICAgICAgYiAmJiBPLnB1c2goYik7CiAgICAgIH0KICAgICAgaWYgKE8ubGVuZ3RoID09PSAwKQogICAgICAgIGVbbF0gfHwgKGVbbF0gPSB7CiAgICAgICAgICBpZDogbCwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogbnQsCiAgICAgICAgICBoZWlnaHQ6IHN0CiAgICAgICAgfSk7CiAgICAgIGVsc2UgewogICAgICAgIGxldCBtID0gMSAvIDAsIGIgPSAtMSAvIDAsIFAgPSAxIC8gMCwgaiA9IC0xIC8gMDsKICAgICAgICBmb3IgKGNvbnN0IEQgb2YgTykKICAgICAgICAgIG0gPSBNYXRoLm1pbihtLCBELngpLCBiID0gTWF0aC5tYXgoYiwgRC54ICsgRC53aWR0aCksIFAgPSBNYXRoLm1pbihQLCBELnkpLCBqID0gTWF0aC5tYXgoaiwgRC55ICsgRC5oZWlnaHQpOwogICAgICAgIGNvbnN0IEUgPSBNYXRoLm1heChiIC0gbSArIEwgKiAyLCBxKSwgQyA9IGogLSBQICsgVyArIEcgKiAyLCBUID0gbSAtIEwsIHYgPSBQIC0gVyAtIEc7CiAgICAgICAgZVtsXSA9IHsgaWQ6IGwsIHg6IFQsIHk6IHYsIHdpZHRoOiBFLCBoZWlnaHQ6IEMgfTsKICAgICAgfQogICAgfQogICAgbGV0IEYgPSAxIC8gMCwgWCA9IDEgLyAwOwogICAgZm9yIChjb25zdCBsIG9mIFsuLi5PYmplY3QudmFsdWVzKGQpLCAuLi5PYmplY3QudmFsdWVzKGUpXSkKICAgICAgRiA9IE1hdGgubWluKEYsIGwueCksIFggPSBNYXRoLm1pbihYLCBsLnkpOwogICAgY29uc3QgQiA9IDYwLCBaID0gRiA8IEIgPyBCIC0gRiA6IDAsIHogPSBYIDwgQiA/IEIgLSBYIDogMDsKICAgIGlmIChaICE9PSAwIHx8IHogIT09IDApIHsKICAgICAgZm9yIChjb25zdCBsIG9mIE9iamVjdC52YWx1ZXMoZCkpCiAgICAgICAgbC54ICs9IFosIGwueSArPSB6OwogICAgICBmb3IgKGNvbnN0IGwgb2YgT2JqZWN0LnZhbHVlcyhlKSkKICAgICAgICBsLnggKz0gWiwgbC55ICs9IHo7CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIGYsIHIpIHsKICAgIHZhciBhLCBoOwogICAgY29uc3QgdCA9IChkKSA9PiBmW2RdIHx8IHJbZF07CiAgICBmb3IgKGNvbnN0IGQgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkgewogICAgICBjb25zdCBlID0gdChkLnNvdXJjZUlkKSwgcyA9IHQoZC50YXJnZXRJZCk7CiAgICAgIGlmICghZSB8fCAhcykgY29udGludWU7CiAgICAgIGNvbnN0IHkgPSBuLm5vZGVzW2Quc291cmNlSWRdIHx8IG4uY29udGFpbmVyc1tkLnNvdXJjZUlkXSwgaSA9IG4ubm9kZXNbZC50YXJnZXRJZF0gfHwgbi5jb250YWluZXJzW2QudGFyZ2V0SWRdLCBvID0gcy54ICsgcy53aWR0aCAvIDIgLSAoZS54ICsgZS53aWR0aCAvIDIpLCB1ID0gcy55ICsgcy5oZWlnaHQgLyAyIC0gKGUueSArIGUuaGVpZ2h0IC8gMiksIHcgPSBNYXRoLmFicyhvKSA+IE1hdGguYWJzKHUpICogMS4yNSwgZyA9IChhID0geSA9PSBudWxsID8gdm9pZCAwIDogeS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGEuZmluZCgoYykgPT4gYy5pZCA9PT0gZC5zb3VyY2VQb3J0SWQpOwogICAgICBnICYmICghZy5zaWRlIHx8IGcuc2lkZSA9PT0gImF1dG8iKSAmJiAodyA/IGcuc2lkZSA9IG8gPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiBnLnNpZGUgPSB1ID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgcCA9IChoID0gaSA9PSBudWxsID8gdm9pZCAwIDogaS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGguZmluZCgoYykgPT4gYy5pZCA9PT0gZC50YXJnZXRQb3J0SWQpOwogICAgICBwICYmICghcC5zaWRlIHx8IHAuc2lkZSA9PT0gImF1dG8iKSAmJiAodyA/IHAuc2lkZSA9IG8gPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiBwLnNpZGUgPSB1ID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhuKSB7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgciA9ICh0KSA9PiB7CiAgICAgIHZhciBkOwogICAgICBpZiAoZi5oYXModCkpIHJldHVybiBmLmdldCh0KTsKICAgICAgY29uc3QgYSA9IChkID0gbi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogZC5wYXJlbnRJZDsKICAgICAgaWYgKCFhIHx8ICFuLmNvbnRhaW5lcnNbYV0pCiAgICAgICAgcmV0dXJuIGYuc2V0KHQsIDApLCAwOwogICAgICBjb25zdCBoID0gMSArIHIoYSk7CiAgICAgIHJldHVybiBmLnNldCh0LCBoKSwgaDsKICAgIH07CiAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmtleXMobi5jb250YWluZXJzKSkKICAgICAgcih0KTsKICAgIHJldHVybiBmOwogIH0KfQpjbGFzcyBhdCB7CiAgYXN5bmMgZXhlY3V0ZShuLCBmLCByKSB7CiAgICBjb25zdCB0ID0gT2JqZWN0LnZhbHVlcyhuLmNvbnRhaW5lcnMpLCBhID0gT2JqZWN0LnZhbHVlcyhuLm5vZGVzKSwgaCA9IG5ldyBTZXQoCiAgICAgIHQuZmlsdGVyKChvKSA9PiAhIW8uY29sbGFwc2VkKS5tYXAoKG8pID0+IG8uaWQpCiAgICApLCBkID0gKG8pID0+IHsKICAgICAgdmFyIHc7CiAgICAgIGxldCB1ID0gbzsKICAgICAgZm9yICg7IHU7ICkgewogICAgICAgIGlmIChoLmhhcyh1KSkgcmV0dXJuICEwOwogICAgICAgIHUgPSAodyA9IG4uY29udGFpbmVyc1t1XSkgPT0gbnVsbCA/IHZvaWQgMCA6IHcucGFyZW50SWQ7CiAgICAgIH0KICAgICAgcmV0dXJuICExOwogICAgfSwgZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IFtvLCB1XSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkKICAgICAgZCh1LnBhcmVudElkKSB8fCBlLmFkZChvKTsKICAgIGZvciAoY29uc3QgW28sIHVdIG9mIE9iamVjdC5lbnRyaWVzKG4uY29udGFpbmVycykpIHsKICAgICAgY29uc3QgdyA9IHU7CiAgICAgIHcuY29sbGFwc2VkID8gZCh3LnBhcmVudElkKSB8fCBlLmFkZChvKSA6ICEoYS5zb21lKChwKSA9PiBwLnBhcmVudElkID09PSBvKSB8fCB0LnNvbWUoKHApID0+IHAucGFyZW50SWQgPT09IG8pKSAmJiAhZCh3LnBhcmVudElkKSAmJiBlLmFkZChvKTsKICAgIH0KICAgIGNvbnN0IHMgPSBvdC5kZWNvdXBsZShuLCBlKSwgeSA9IGN0LmFzc2lnbkxheWVycyhzLmFsbEVudGl0eUlkcywgcy5hZGpMaXN0KSwgaSA9IFIubWluaW1pemVDcm9zc2luZ3MoeSwgcy5hZGpMaXN0LCA0LCBuKTsKICAgIHJldHVybiBZLmFzc2lnbkNvb3JkaW5hdGVzKG4sIGksIGYsIHIpOwogIH0KfQpjb25zdCBkdCA9IG5ldyBhdCgpOwpzZWxmLm9ubWVzc2FnZSA9IGFzeW5jIChKKSA9PiB7CiAgY29uc3QgeyBpZDogbiwgZ3JhcGg6IGYsIG1lYXN1cmVtZW50czogciwgb3B0aW9uczogdCB9ID0gSi5kYXRhOwogIHRyeSB7CiAgICBjb25zdCBhID0gbmV3IE1hcChyKSwgaCA9IGF3YWl0IGR0LmV4ZWN1dGUoZiwgYSwgdCk7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IG4sIHN1Y2Nlc3M6ICEwLCBsYXlvdXQ6IGggfSk7CiAgfSBjYXRjaCAoYSkgewogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBuLCBzdWNjZXNzOiAhMSwgZXJyb3I6IGEubWVzc2FnZSB9KTsKICB9Cn07Cg==", ue = (d) => Uint8Array.from(atob(d), (g) => g.charCodeAt(0)), Vt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", ue(Qt)], { type: "text/javascript;charset=utf-8" });
function he(d) {
  let g;
  try {
    if (g = Vt && (self.URL || self.webkitURL).createObjectURL(Vt), !g) throw "";
    const s = new Worker(g, {
      type: "module",
      name: d == null ? void 0 : d.name
    });
    return s.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(g);
    }), s;
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
class ye {
  constructor() {
    Kt(this, "worker", null);
    Kt(this, "pendingRequests", /* @__PURE__ */ new Map());
    Kt(this, "fallbackEngine", new ae());
    if (typeof Worker < "u")
      try {
        this.worker = new he(), this.worker.onmessage = (g) => {
          const { id: s, success: n, layout: I, error: c } = g.data, r = this.pendingRequests.get(s);
          r && (this.pendingRequests.delete(s), n ? r.resolve(I) : r.reject(new Error(c)));
        }, this.worker.onerror = (g) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", g);
        };
      } catch (g) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", g), this.worker = null;
      }
  }
  execute(g, s, n) {
    return this.worker ? new Promise((I, c) => {
      const r = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(r, { resolve: I, reject: c });
      const l = Array.from(s.entries());
      this.worker.postMessage({
        id: r,
        graph: g,
        measurements: l,
        options: n
      });
    }) : this.fallbackEngine.execute(g, s, n);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class Be {
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: s, hoveredEntity: n, graph: I } = g;
    return n && n.id === s.id ? null : n && I.containers[n.id] ? s.parentId === n.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: s.id,
        newParentId: n.id
      }
    } : !n && s.parentId !== null && s.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: s.id,
        newParentId: null
      }
    } : null;
  }
}
class He {
  constructor() {
    // Distance threshold (in world coordinates) required to trigger extraction
    Kt(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: s, hoveredEdge: n, hoveredEntity: I, cursorWorld: c, startWorldPos: r, graph: l } = g;
    if (I && l.containers[I.id])
      return I.id !== s.id && s.parentId !== I.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: s.id,
          newParentId: I.id
        }
      } : null;
    if (!I && !n) {
      const C = Object.values(l.edges).filter(
        (A) => A.targetId === s.id
      ), h = Object.values(l.edges).filter(
        (A) => A.sourceId === s.id
      );
      if (C.length === 1 && h.length === 1 && C[0].sourceId !== h[0].targetId && Math.hypot(
        c.x - r.x,
        c.y - r.y
      ) >= this.dragOffThreshold)
        return {
          type: "NODE_EXTRACT",
          payload: {
            nodeId: s.id,
            incomingEdgeId: C[0].id,
            outgoingEdgeId: h[0].id
          }
        };
      if (s.parentId !== null && s.parentId !== void 0)
        return {
          type: "ENTITY_REPARENT",
          payload: {
            entityId: s.id,
            newParentId: null
          }
        };
    }
    const o = (C) => {
      const h = l.nodes[C.id] || C;
      if (!h.ports || h.ports.length === 0) return "";
      const A = Object.values(l.edges).find((w) => w.targetId === C.id);
      if (A) {
        const w = h.ports.find((y) => y.id === A.targetPortId);
        if (w) return w.id;
      }
      const u = new Set(
        Object.values(l.edges).filter((w) => w.sourceId === C.id).map((w) => w.sourcePortId)
      ), B = h.ports.find((w) => !u.has(w.id));
      return B ? B.id : h.ports[0].id;
    };
    if (n)
      return n.sourceId === s.id || n.targetId === s.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: n.id,
          newSourceId: n.sourceId,
          newTargetId: s.id,
          newTargetPortId: o(s)
        }
      };
    if (I && I.id !== s.id && l.nodes[I.id]) {
      const C = Object.values(l.edges).find(
        (h) => h.targetId === I.id && h.sourceId !== s.id
      );
      if (C)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: C.id,
            newSourceId: C.sourceId,
            newTargetId: s.id,
            newTargetPortId: o(s)
          }
        };
    }
    return null;
  }
}
function fe(d, g = { min: 0.15, max: 3 }) {
  const [s, n] = et({ x: 80, y: 80, zoom: 1 }), I = Ct(!1), c = Ct({ x: 0, y: 0 }), r = M(
    (y, e) => {
      if (!d.current) return { x: y, y: e };
      const t = d.current.getBoundingClientRect();
      return {
        x: (y - t.left - s.x) / s.zoom,
        y: (e - t.top - s.y) / s.zoom
      };
    },
    [s, d]
  ), l = M(
    (y) => {
      if (!d.current) return;
      const e = [
        ...Object.values(y.nodes),
        ...Object.values(y.containers)
      ];
      if (e.length === 0) {
        n({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, i = 1 / 0, b = -1 / 0, f = -1 / 0;
      for (const Q of e)
        t = Math.min(t, Q.x), i = Math.min(i, Q.y), b = Math.max(b, Q.x + Q.width), f = Math.max(f, Q.y + Q.height);
      const K = d.current.getBoundingClientRect(), m = 80, p = Math.max(b - t, 100), H = Math.max(f - i, 100), W = (K.width - m * 2) / p, P = (K.height - m * 2) / H, Z = Math.min(
        Math.max(Math.min(W, P), g.min),
        Math.min(g.max, 1.25)
      ), X = (K.width - p * Z) / 2 - t * Z, V = (K.height - H * Z) / 2 - i * Z;
      n({
        x: X,
        y: V,
        zoom: Z
      });
    },
    [d, g]
  ), o = M(
    (y) => {
      if (y.preventDefault(), !!d.current)
        if (y.ctrlKey || y.metaKey) {
          const e = d.current.getBoundingClientRect(), t = y.clientX - e.left, i = y.clientY - e.top, b = y.deltaY < 0 ? 1.08 : 0.92, f = Math.min(Math.max(s.zoom * b, g.min), g.max), K = t - (t - s.x) * (f / s.zoom), m = i - (i - s.y) * (f / s.zoom);
          n({ x: K, y: m, zoom: f });
        } else
          n((e) => ({
            ...e,
            x: e.x - y.deltaX,
            y: e.y - y.deltaY
          }));
    },
    [s, g, d]
  ), C = M(
    (y, e) => {
      I.current = !0, c.current = { x: y - s.x, y: e - s.y };
    },
    [s]
  ), h = M((y, e) => {
    I.current && n((t) => ({
      ...t,
      x: y - c.current.x,
      y: e - c.current.y
    }));
  }, []), A = M(() => {
    I.current = !1;
  }, []), u = M(() => {
    n({ x: 80, y: 80, zoom: 1 });
  }, []), B = M(() => {
    n((y) => ({
      ...y,
      zoom: Math.min(y.zoom * 1.2, g.max)
    }));
  }, [g]), w = M(() => {
    n((y) => ({
      ...y,
      zoom: Math.max(y.zoom / 1.2, g.min)
    }));
  }, [g]);
  return {
    transform: s,
    setTransform: n,
    screenToWorld: r,
    onWheel: o,
    startPan: C,
    updatePan: h,
    endPan: A,
    resetTransform: u,
    zoomIn: B,
    zoomOut: w,
    zoomToFit: l,
    isPanning: I
  };
}
function we(d) {
  const [g, s] = et(
    /* @__PURE__ */ new Map()
  );
  Ct(/* @__PURE__ */ new Map());
  const n = Ct(/* @__PURE__ */ new Map()), I = M((c, r) => {
    r ? n.current.set(c, r) : n.current.delete(c);
  }, []);
  return Et(() => {
    const c = new ResizeObserver((r) => {
      let l = !1;
      const o = new Map(g);
      for (const C of r) {
        const h = C.target.getAttribute("data-sysflow-measure-id");
        if (!h) continue;
        const A = Math.ceil(C.contentRect.width), u = Math.ceil(C.contentRect.height), B = o.get(h);
        (!B || B.width !== A || B.height !== u) && (o.set(h, { width: A, height: u }), l = !0);
      }
      l && s(o);
    });
    return n.current.forEach((r) => c.observe(r)), () => {
      c.disconnect();
    };
  }, [d]), { measurements: g, registerMeasureElement: I };
}
function be(d, g, s, n, I) {
  const [c, r] = et(null), [l, o] = et(null), C = Ct(null), h = Ct(null), A = M(
    (e, t) => {
      let i = null, b = 1 / 0;
      for (const [f, K] of Object.entries(g.containers))
        if (f !== t && e.x >= K.x && e.x <= K.x + K.width && e.y >= K.y && e.y <= K.y + K.height) {
          const m = K.width * K.height;
          m < b && (b = m, i = d.containers[f] || null);
        }
      if (i) return i;
      for (const [f, K] of Object.entries(g.nodes))
        if (f !== t && e.x >= K.x && e.x <= K.x + K.width && e.y >= K.y && e.y <= K.y + K.height)
          return d.nodes[f] || null;
      return null;
    },
    [g, d]
  ), u = M(
    (e, t) => {
      let i = null, b = 45;
      for (const f of Object.values(d.edges)) {
        if (f.sourceId === t || f.targetId === t) continue;
        const K = g.nodes[f.sourceId] || g.containers[f.sourceId], m = g.nodes[f.targetId] || g.containers[f.targetId];
        if (!K || !m) continue;
        const p = K.x + K.width, H = K.y + K.height / 2, W = m.x, P = m.y + m.height / 2;
        for (let Z = 0; Z <= 10; Z++) {
          const X = Z / 10, V = (1 - X) * p + X * W, Q = (1 - X) * H + X * P, S = Math.hypot(e.x - V, e.y - Q);
          S < b && (b = S, i = f);
        }
      }
      return i;
    },
    [g, d]
  ), B = M(
    (e, t) => {
      if (t.stopPropagation(), s.canDrag && !s.canDrag(e, d))
        return;
      const i = n(t.clientX, t.clientY);
      r({
        draggedEntity: e,
        ghostPosition: i,
        startPosition: i
      });
    },
    [d, s, n]
  ), w = M(
    (e) => {
      if (!c) return;
      const t = n(e.clientX, e.clientY), i = A(t, c.draggedEntity.id), b = u(t, c.draggedEntity.id);
      C.current = i, h.current = b, i && d.containers[i.id] ? o(i.id) : o(null);
      const f = s.onDragMove ? s.onDragMove({
        draggedEntity: c.draggedEntity,
        cursorWorld: t,
        startWorldPos: c.startPosition,
        hoveredEntity: i,
        hoveredEdge: b,
        graph: d,
        layout: g
      }) : t;
      f && r((K) => K ? { ...K, ghostPosition: f } : null);
    },
    [c, n, s, d, g, A, u]
  ), y = M(
    (e) => {
      if (!c) return;
      const t = n(e.clientX, e.clientY), i = A(t, c.draggedEntity.id), b = u(t, c.draggedEntity.id), f = s.onDragEnd({
        draggedEntity: c.draggedEntity,
        cursorWorld: t,
        startWorldPos: c.startPosition,
        hoveredEntity: i,
        hoveredEdge: b,
        graph: d,
        layout: g
      });
      f && I(f), r(null), o(null), C.current = null, h.current = null;
    },
    [c, n, s, d, g, A, u, I]
  );
  return {
    dragState: c,
    hoveredContainerId: l,
    handlePointerDown: B,
    handlePointerMove: w,
    handlePointerUp: y
  };
}
function Ee(d) {
  const [g, s] = et([d]), [n, I] = et(0), [c, r] = et(null), l = g[n], o = M((e) => {
    const t = de(e);
    s((i) => [...i.slice(0, n + 1), t]), I((i) => i + 1);
  }, [n]), C = M(() => {
    n > 0 && I((e) => e - 1);
  }, [n]), h = M(() => {
    n < g.length - 1 && I((e) => e + 1);
  }, [n, g.length]), A = M((e) => {
    var i, b, f, K;
    const t = g[n];
    if (e.type === "ENTITY_REPARENT") {
      const { entityId: m, newParentId: p } = e.payload, H = {
        ...t,
        nodes: { ...t.nodes },
        containers: { ...t.containers }
      };
      H.nodes[m] ? H.nodes[m] = { ...H.nodes[m], parentId: p } : H.containers[m] && (H.containers[m] = { ...H.containers[m], parentId: p }), o(H);
    } else if (e.type === "EDGE_SPLIT_INSERT_NODE") {
      const { edge: m, direction: p, suggestedNewNodeId: H, suggestedNewEdge1Id: W, suggestedNewEdge2Id: P } = e.payload, Z = t.edges[m.id];
      if (!Z) return;
      const X = p === "BT", V = p === "TB", Q = `p_in_${Date.now()}`, S = `p_out_${Date.now()}`;
      let E = "left", a = "right";
      X ? (E = "bottom", a = "top") : V ? (E = "top", a = "bottom") : p === "RL" && (E = "right", a = "left");
      const k = t.nodes[Z.sourceId], Y = {
        id: H,
        label: `Node ${Object.keys(t.nodes).length + 1}`,
        type: (k == null ? void 0 : k.type) || "FlowTask",
        parentId: (k == null ? void 0 : k.parentId) ?? null,
        ports: [
          { id: Q, label: "in", side: E },
          { id: S, label: "out", side: a }
        ]
      }, L = {
        id: W,
        sourceId: Z.sourceId,
        sourcePortId: Z.sourcePortId,
        targetId: H,
        targetPortId: Q
      }, J = {
        id: P,
        sourceId: H,
        sourcePortId: S,
        targetId: Z.targetId,
        targetPortId: Z.targetPortId
      }, v = { ...t.edges };
      delete v[Z.id], v[W] = L, v[P] = J, o({
        ...t,
        nodes: { ...t.nodes, [H]: Y },
        edges: v
      });
    } else if (e.type === "NODE_EXTRACT") {
      const { nodeId: m, incomingEdgeId: p, outgoingEdgeId: H } = e.payload, W = t.edges[p], P = t.edges[H];
      if (!W || !P) return;
      const Z = { ...t.edges };
      Z[p] = {
        ...W,
        targetId: P.targetId,
        targetPortId: P.targetPortId
      }, delete Z[H], o({
        ...t,
        edges: Z
      });
    } else if (e.type === "NODE_ADD_CONNECTED") {
      const { sourceNode: m, position: p, direction: H, suggestedNewNodeId: W, suggestedNewEdgeId: P } = e.payload, Z = H === "BT", X = `p_in_${Date.now()}`, V = `p_out_${Date.now()}`, Q = {
        id: W,
        label: `Node ${Object.keys(t.nodes).length + 1}`,
        type: m.type,
        ports: [
          { id: X, label: "in", side: Z ? "bottom" : "top" },
          { id: V, label: "out", side: Z ? "top" : "bottom" }
        ]
      }, S = m.ports.find((Y) => Y.label === "in") || m.ports[0], E = m.ports.find((Y) => Y.label === "out") || m.ports[m.ports.length - 1];
      let a;
      Z && p === "bottom" || !Z && p === "top" ? a = {
        id: P,
        sourceId: W,
        sourcePortId: V,
        targetId: m.id,
        targetPortId: (S == null ? void 0 : S.id) || "in"
      } : a = {
        id: P,
        sourceId: m.id,
        sourcePortId: (E == null ? void 0 : E.id) || "out",
        targetId: W,
        targetPortId: X
      }, o({
        ...t,
        nodes: { ...t.nodes, [W]: Q },
        edges: { ...t.edges, [P]: a }
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
      const H = p, W = t.edges[m], P = W.targetId, Z = Object.values(t.edges).find((a) => a.targetId === H), X = Object.values(t.edges).find((a) => a.sourceId === H), V = { ...t.edges };
      Z && X && (V[Z.id] = { ...Z, targetId: X.targetId, targetPortId: X.targetPortId }, delete V[X.id]);
      const Q = ((b = (i = t.nodes[H]) == null ? void 0 : i.ports[0]) == null ? void 0 : b.id) || "p_in", S = ((K = (f = t.nodes[H]) == null ? void 0 : f.ports.find((a) => a.id !== Q)) == null ? void 0 : K.id) || Q;
      V[m] = {
        ...W,
        targetId: H,
        targetPortId: Q
      };
      const E = `REWIRE_${Date.now()}`;
      V[E] = {
        id: E,
        sourceId: H,
        sourcePortId: S,
        targetId: P,
        targetPortId: W.targetPortId
      }, o({ ...t, edges: V });
    }
  }, [g, n, o]), u = M((e) => {
    const t = l.nodes[e] || l.containers[e];
    t && r({ entity: JSON.parse(JSON.stringify(t)), isCut: !1 });
  }, [l]), B = M((e) => {
    const t = l.nodes[e] || l.containers[e];
    if (t) {
      r({ entity: JSON.parse(JSON.stringify(t)), isCut: !0 });
      const i = { ...l.nodes }, b = { ...l.containers };
      delete i[e], delete b[e], o({ ...l, nodes: i, containers: b });
    }
  }, [l, o]), w = M(() => {
    if (!c) return;
    const e = c.entity, t = `${e.id}_copy_${Date.now().toString().slice(-4)}`, i = { ...e, id: t, label: `${e.label} (Copy)` };
    "collapsed" in i ? o({
      ...l,
      containers: { ...l.containers, [t]: i }
    }) : o({
      ...l,
      nodes: { ...l.nodes, [t]: i }
    });
  }, [c, l, o]), y = M((e) => {
    if (e.length === 0) return;
    const t = { ...l.nodes }, i = { ...l.containers }, b = { ...l.edges };
    for (const f of e)
      delete t[f], delete i[f], delete b[f];
    o({
      ...l,
      nodes: t,
      containers: i,
      edges: b
    });
  }, [l, o]);
  return {
    graph: l,
    setGraphDirect: o,
    applyAction: A,
    undo: C,
    redo: h,
    copyEntity: u,
    cutEntity: B,
    pasteEntity: w,
    deleteSelection: y,
    canUndo: n > 0,
    canRedo: n < g.length - 1
  };
}
const me = ({
  graph: d,
  registerMeasureElement: g,
  nodeTypes: s,
  containerTypes: n
}) => {
  const I = Object.values(d.nodes), c = Object.values(d.containers);
  return /* @__PURE__ */ U("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((r) => {
      const l = r.type ? s == null ? void 0 : s[r.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (o) => g(r.id, o),
          "data-sysflow-measure-id": r.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ N(l, { node: r, selected: !1 }) : /* @__PURE__ */ U("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ N("div", { style: { fontWeight: 600 }, children: r.label }),
            r.ports.length > 0 && /* @__PURE__ */ U("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              r.ports.map((o) => o.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${r.id}`
      );
    }),
    c.map((r) => {
      const l = r.type ? n == null ? void 0 : n[r.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (o) => g(r.id, o),
          "data-sysflow-measure-id": r.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ N(l, { container: r, selected: !1 }) : /* @__PURE__ */ N("div", { className: "sysflow-container-header", children: r.label })
        },
        `measure-container-${r.id}`
      );
    })
  ] });
}, Se = ({
  graph: d,
  layout: g,
  selectedIds: s,
  direction: n = "TB",
  showArrows: I = !0,
  routing: c = "auto",
  portOptions: r,
  enableEdgeQuickAdd: l = !0,
  onEdgeClick: o,
  onInsertNodeOnEdge: C
}) => {
  const [h, A] = et(null), u = c === "step" || c === "auto" && (n === "LR" || n === "RL"), B = (e, t, i) => {
    var V, Q, S, E;
    let b = e, f = null;
    for ((V = d.containers[e]) != null && V.collapsed && (f = d.containers[e]); b; ) {
      const a = ((Q = d.nodes[b]) == null ? void 0 : Q.parentId) ?? ((S = d.containers[b]) == null ? void 0 : S.parentId) ?? null;
      a && ((E = d.containers[a]) != null && E.collapsed) && (f = d.containers[a]), b = a;
    }
    if (f) {
      const a = g.containers[f.id];
      if (!a)
        return { x: 0, y: 0, side: i ? "right" : "left", valid: !1, entityId: f.id };
      let k, Y, L;
      return n === "TB" ? (k = i ? "bottom" : "top", Y = a.x + a.width / 2, L = i ? a.y + a.height : a.y) : n === "BT" ? (k = i ? "top" : "bottom", Y = a.x + a.width / 2, L = i ? a.y : a.y + a.height) : n === "RL" ? (k = i ? "left" : "right", Y = i ? a.x : a.x + a.width, L = a.y + a.height / 2) : (k = i ? "right" : "left", Y = i ? a.x + a.width : a.x, L = a.y + a.height / 2), { x: Y, y: L, side: k, valid: !0, entityId: f.id };
    }
    if (!!d.containers[e]) {
      const a = g.containers[e];
      if (!a) return { x: 0, y: 0, side: i ? "right" : "left", valid: !1, entityId: e };
      let k, Y, L;
      return n === "TB" ? (k = a.x + a.width / 2, Y = i ? a.y + a.height : a.y, L = i ? "bottom" : "top") : n === "BT" ? (k = a.x + a.width / 2, Y = i ? a.y : a.y + a.height, L = i ? "top" : "bottom") : n === "RL" ? (k = i ? a.x : a.x + a.width, Y = a.y + a.height / 2, L = i ? "left" : "right") : (k = i ? a.x + a.width : a.x, Y = a.y + a.height / 2, L = i ? "right" : "left"), { x: k, y: Y, side: L, valid: !0, entityId: e };
    }
    const m = d.nodes[e], p = g.nodes[e];
    if (!m || !p)
      return { x: 0, y: 0, side: i ? "right" : "left", valid: !1, entityId: e };
    const W = Dt(
      m,
      p,
      n,
      d.edges,
      r
    ).get(t);
    if (W)
      return { x: W.worldX, y: W.worldY, side: W.side, valid: !0, entityId: e };
    let P, Z, X;
    return n === "TB" ? (P = p.x + p.width / 2, Z = i ? p.y + p.height : p.y, X = i ? "bottom" : "top") : n === "BT" ? (P = p.x + p.width / 2, Z = i ? p.y : p.y + p.height, X = i ? "top" : "bottom") : n === "RL" ? (P = i ? p.x : p.x + p.width, Z = p.y + p.height / 2, X = i ? "left" : "right") : (P = i ? p.x + p.width : p.x, Z = p.y + p.height / 2, X = i ? "right" : "left"), { x: P, y: Z, side: X, valid: !0, entityId: e };
  }, w = (e, t) => {
    const i = (e.x + t.x) / 2, b = (e.y + t.y) / 2;
    if (e.side === "right" && t.side === "left") {
      if (t.x >= e.x + 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${i} ${e.y} L ${i} ${t.y} L ${t.x} ${t.y}`,
          center: { x: i, y: b }
        };
      {
        const f = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x + 20} ${e.y} L ${e.x + 20} ${f} L ${t.x - 20} ${f} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: i, y: f }
        };
      }
    }
    if (e.side === "left" && t.side === "right") {
      if (t.x <= e.x - 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${i} ${e.y} L ${i} ${t.y} L ${t.x} ${t.y}`,
          center: { x: i, y: b }
        };
      {
        const f = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x - 20} ${e.y} L ${e.x - 20} ${f} L ${t.x + 20} ${f} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: i, y: f }
        };
      }
    }
    if (e.side === "bottom" && t.side === "top") {
      if (t.y >= e.y + 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${b} L ${t.x} ${b} L ${t.x} ${t.y}`,
          center: { x: i, y: b }
        };
      {
        const f = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y + 20} L ${f} ${e.y + 20} L ${f} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: f, y: b }
        };
      }
    }
    if (e.side === "top" && t.side === "bottom") {
      if (t.y <= e.y - 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${b} L ${t.x} ${b} L ${t.x} ${t.y}`,
          center: { x: i, y: b }
        };
      {
        const f = t.x >= e.x ? e.x + 50 : e.x - 50;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${e.y - 20} L ${f} ${e.y - 20} L ${f} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: f, y: b }
        };
      }
    }
    return {
      pathStr: `M ${e.x} ${e.y} L ${i} ${e.y} L ${i} ${t.y} L ${t.x} ${t.y}`,
      center: { x: i, y: b }
    };
  }, y = (e, t) => {
    const i = t.x - e.x, b = t.y - e.y;
    let f = e.x, K = e.y, m = t.x, p = t.y;
    if (e.side === "bottom" && t.side === "top")
      if (b > 0) {
        const P = Math.min(28, b * 0.4);
        K = e.y + Math.max(P, b * 0.5), p = t.y - Math.max(P, b * 0.5);
      } else {
        const P = i >= 0 ? 1 : -1, Z = Math.max(40, Math.abs(i) * 0.2);
        f = e.x + Z * P, K = e.y + 40, m = t.x + Z * P, p = t.y - 40;
      }
    else if (e.side === "top" && t.side === "bottom")
      if (b < 0) {
        const P = Math.min(28, Math.abs(b) * 0.4);
        K = e.y - Math.max(P, Math.abs(b) * 0.5), p = t.y + Math.max(P, Math.abs(b) * 0.5);
      } else {
        const P = i >= 0 ? 1 : -1, Z = Math.max(40, Math.abs(i) * 0.2);
        f = e.x + Z * P, K = e.y - 40, m = t.x + Z * P, p = t.y + 40;
      }
    else if (e.side === "right" && t.side === "left")
      i > 0 ? (f = e.x + i * 0.5, m = t.x - i * 0.5) : (f = e.x + 50, K = e.y - 50, m = t.x - 50, p = t.y - 50);
    else if (e.side === "left" && t.side === "right")
      i < 0 ? (f = e.x + i * 0.5, m = t.x - i * 0.5) : (f = e.x - 50, K = e.y - 50, m = t.x + 50, p = t.y - 50);
    else {
      const P = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, Z = P[e.side] || { x: 0, y: 1 }, X = P[t.side] || { x: 0, y: -1 }, V = Math.min(60, Math.hypot(i, b) * 0.35);
      f = e.x + Z.x * V, K = e.y + Z.y * V, m = t.x + X.x * V, p = t.y + X.y * V;
    }
    const H = 0.125 * e.x + 0.375 * f + 0.375 * m + 0.125 * t.x, W = 0.125 * e.y + 0.375 * K + 0.375 * p + 0.125 * t.y;
    return {
      pathStr: `M ${e.x} ${e.y} C ${f} ${K} ${m} ${p} ${t.x} ${t.y}`,
      center: { x: H, y: W }
    };
  };
  return /* @__PURE__ */ U("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ U("defs", { children: [
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
    Object.values(d.edges).map((e) => {
      const t = B(e.sourceId, e.sourcePortId, !0), i = B(e.targetId, e.targetPortId, !1);
      if (!t.valid || !i.valid || t.entityId === i.entityId) return null;
      const b = s.includes(e.id), f = h === e.id, { pathStr: K, center: m } = u ? w(t, i) : y(t, i);
      return /* @__PURE__ */ U(
        "g",
        {
          onMouseEnter: () => A(e.id),
          onMouseLeave: () => A(null),
          children: [
            /* @__PURE__ */ N(
              "path",
              {
                d: K,
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
                d: K,
                fill: "none",
                stroke: b ? "var(--sysflow-edge-selected)" : f ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: b ? 2.5 : f ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: I ? b ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            l && f && C && /* @__PURE__ */ N("g", { transform: `translate(${m.x}, ${m.y})`, children: /* @__PURE__ */ U(
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
}, Ge = ({
  entity: d,
  layout: g,
  direction: s = "LR",
  edges: n,
  portOptions: I,
  onPortPointerDown: c,
  onPortPointerUp: r
}) => {
  if (!d.ports || d.ports.length === 0)
    return null;
  const l = Dt(
    d,
    g,
    s,
    n,
    I
  );
  return /* @__PURE__ */ N(Yt, { children: d.ports.map((o) => {
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
          h.stopPropagation(), c == null || c(d.id, o.id, !0, h);
        },
        onPointerUp: (h) => {
          h.stopPropagation(), r == null || r(d.id, o.id, !1);
        }
      },
      o.id
    ) : null;
  }) });
}, Ke = ({
  node: d,
  layout: g,
  selected: s = !1,
  direction: n = "LR",
  edges: I,
  portOptions: c,
  enableQuickAdd: r = !1,
  onAddConnectedNode: l,
  onPointerDown: o,
  onMouseEnter: C,
  onMouseLeave: h,
  onClick: A,
  onPortPointerDown: u,
  onPortPointerUp: B,
  customRenderer: w
}) => {
  const [y, e] = et(!1);
  return /* @__PURE__ */ U(
    "div",
    {
      className: `sysflow-node ${s ? "sysflow-selected" : ""} ${d.className || ""}`,
      style: {
        transform: `translate(${g.x}px, ${g.y}px)`,
        width: `${g.width}px`,
        height: `${g.height}px`
      },
      onPointerDown: (t) => o == null ? void 0 : o(d, t),
      onMouseEnter: () => {
        e(!0), C == null || C(d.id);
      },
      onMouseLeave: () => {
        e(!1), h == null || h(d.id);
      },
      onClick: A,
      children: [
        r && y && /* @__PURE__ */ U(Yt, { children: [
          /* @__PURE__ */ N("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ N("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        r && y && l && /* @__PURE__ */ N(
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
              t.preventDefault(), t.stopPropagation(), l(d, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ N(
          Ge,
          {
            entity: d,
            layout: g,
            direction: n,
            edges: I,
            portOptions: c,
            onPortPointerDown: u,
            onPortPointerUp: B
          }
        ),
        w ? /* @__PURE__ */ N(w, { node: d, selected: s }) : /* @__PURE__ */ U("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ N("div", { style: { fontWeight: 600, fontSize: "13px" }, children: d.label }),
          d.ports.length > 0 && /* @__PURE__ */ U("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            d.ports.length,
            " Port",
            d.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        r && y && l && /* @__PURE__ */ N(
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
              t.preventDefault(), t.stopPropagation(), l(d, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, pe = ({
  container: d,
  layout: g,
  selected: s,
  isHovered: n = !1,
  hasChildren: I = !1,
  onToggleCollapse: c,
  onPointerDown: r,
  onMouseEnter: l,
  onMouseLeave: o,
  onClick: C,
  customRenderer: h
}) => /* @__PURE__ */ N(
  "div",
  {
    className: `sysflow-container ${s ? "sysflow-selected" : ""} ${n ? "sysflow-hovered" : ""} ${d.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (A) => r(d, A),
    onMouseEnter: l,
    onMouseLeave: o,
    onClick: C,
    children: h ? /* @__PURE__ */ N(h, { container: d, selected: s }) : /* @__PURE__ */ U(Yt, { children: [
      /* @__PURE__ */ U("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ N("span", { className: "sysflow-container-title", title: d.label, children: d.label }),
        /* @__PURE__ */ N(
          "button",
          {
            className: "sysflow-collapse-btn",
            onClick: (A) => {
              A.stopPropagation(), c(d.id, !d.collapsed);
            },
            children: d.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !d.collapsed && !I && /* @__PURE__ */ N("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Ze = new Be(), Ye = ({
  graph: d,
  onChange: g,
  layoutEngine: s,
  interactionStrategy: n = Ze,
  direction: I = "TB",
  layoutOptions: c,
  portPlacementMode: r,
  routing: l,
  showEdgeArrows: o = !0,
  nodeTypes: C,
  containerTypes: h,
  zoomBounds: A,
  className: u = "",
  selectedIds: B = [],
  theme: w = "dark",
  enableQuickAdd: y,
  enableEdgeQuickAdd: e
}) => {
  var Nt, Tt;
  const t = Ct(null), i = Ct(null);
  !s && !i.current && (i.current = new ye());
  const b = s || i.current, {
    transform: f,
    screenToWorld: K,
    onWheel: m,
    startPan: p,
    updatePan: H,
    endPan: W,
    resetTransform: P,
    zoomIn: Z,
    zoomOut: X,
    zoomToFit: V,
    isPanning: Q
  } = fe(t, A), { measurements: S, registerMeasureElement: E } = we(d), [a, k] = et({ nodes: {}, containers: {} }), Y = ne(() => ({
    direction: I,
    mode: r ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: a.nodes
  }), [I, r, a.nodes]), [L, J] = et(null), [v, z] = et(null), $ = Ct(!1), {
    dragState: R,
    hoveredContainerId: _,
    handlePointerDown: it,
    handlePointerMove: dt,
    handlePointerUp: ht
  } = be(d, a, n, K, g);
  Et(() => {
    const G = (x) => {
      if (x.target instanceof HTMLInputElement || x.target instanceof HTMLTextAreaElement)
        return;
      if (x.key === "Escape") {
        x.preventDefault(), z(null), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (x.code === "Space" && ($.current = !0), x.key.toLowerCase() === "f" && !x.ctrlKey && !x.metaKey) {
        x.preventDefault(), V(a);
        return;
      }
      if ((x.ctrlKey || x.metaKey) && x.key.toLowerCase() === "a") {
        x.preventDefault();
        const j = [
          ...Object.keys(d.nodes),
          ...Object.keys(d.containers)
        ];
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: j } });
        return;
      }
      const D = Object.keys(d.nodes);
      if (D.length !== 0) {
        if (x.key === "Tab") {
          x.preventDefault();
          const j = B.length > 0 ? D.indexOf(B[0]) : -1;
          let F;
          x.shiftKey ? F = j <= 0 ? D.length - 1 : j - 1 : F = (j + 1) % D.length, g({ type: "SELECTION_CHANGE", payload: { selectedIds: [D[F]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(x.key)) {
          x.preventDefault();
          const j = B[0] || D[0], F = a.nodes[j] || a.containers[j];
          if (!F) return;
          const gt = {
            x: F.x + F.width / 2,
            y: F.y + F.height / 2
          };
          let O = null, At = 1 / 0;
          for (const yt of D) {
            if (yt === j) continue;
            const ct = a.nodes[yt];
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
    }, T = (x) => {
      x.code === "Space" && ($.current = !1);
    };
    return window.addEventListener("keydown", G), window.addEventListener("keyup", T), () => {
      window.removeEventListener("keydown", G), window.removeEventListener("keyup", T);
    };
  }, [d, a, B, V, g]), Et(() => {
    let G = !1, T = 16 / 9;
    if (t.current) {
      const D = t.current.getBoundingClientRect();
      D.width > 0 && D.height > 0 && (T = D.width / D.height);
    }
    const x = {
      direction: I,
      aspectRatio: T,
      ...c
    };
    return b.execute(d, S, x).then((D) => {
      G || k(D);
    }), () => {
      G = !0;
    };
  }, [d, S, b, I, c]);
  const pt = (G, T, x, D) => {
    const j = d.nodes[G] || d.containers[G], F = a.nodes[G] || a.containers[G];
    if (!j || !F) return;
    const O = Dt(
      j,
      F,
      I,
      d.edges,
      Y
    ).get(T), At = O ? { x: O.worldX, y: O.worldY } : { x: F.x + F.width, y: F.y + F.height / 2 };
    J({
      sourceId: G,
      sourcePortId: T,
      startWorldPos: At,
      currentWorldPos: K(D.clientX, D.clientY)
    });
  }, Mt = (G, T, x) => {
    var D, j, F, gt, O, At, yt, ct, bt, Bt;
    if (L && L.sourceId !== G) {
      const at = d.nodes[L.sourceId] || d.containers[L.sourceId], ot = d.nodes[G] || d.containers[G], q = (D = at == null ? void 0 : at.ports) == null ? void 0 : D.find((ft) => ft.id === L.sourcePortId), tt = (j = ot == null ? void 0 : ot.ports) == null ? void 0 : j.find((ft) => ft.id === T);
      let mt = L.sourceId, Zt = L.sourcePortId, St = G, Lt = T;
      const _t = ((F = q == null ? void 0 : q.label) == null ? void 0 : F.toLowerCase().includes("in")) || (q == null ? void 0 : q.side) === (I === "BT" ? "bottom" : "top"), qt = ((gt = q == null ? void 0 : q.label) == null ? void 0 : gt.toLowerCase().includes("out")) || (q == null ? void 0 : q.side) === (I === "BT" ? "top" : "bottom"), te = ((O = tt == null ? void 0 : tt.label) == null ? void 0 : O.toLowerCase().includes("in")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "bottom" : "top"), ee = ((At = tt == null ? void 0 : tt.label) == null ? void 0 : At.toLowerCase().includes("out")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "top" : "bottom");
      if (_t && ee)
        mt = G, Zt = T, St = L.sourceId, Lt = L.sourcePortId;
      else if (qt && te)
        mt = L.sourceId, Zt = L.sourcePortId, St = G, Lt = T;
      else if (a.nodes[L.sourceId] && a.nodes[G]) {
        const ft = a.nodes[L.sourceId], vt = a.nodes[G], ge = I === "BT" && ft.y < vt.y, Ie = I === "TB" && ft.y > vt.y;
        if (ge || Ie) {
          mt = G, St = L.sourceId;
          const kt = d.nodes[mt], xt = d.nodes[St];
          Zt = ((ct = (yt = kt == null ? void 0 : kt.ports) == null ? void 0 : yt.find((Gt) => Gt.label.includes("out") || Gt.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : ct.id) || T, Lt = ((Bt = (bt = xt == null ? void 0 : xt.ports) == null ? void 0 : bt.find((Gt) => Gt.label.includes("in") || Gt.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : Bt.id) || L.sourcePortId;
        }
      }
      g({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: mt,
            sourcePortId: Zt,
            targetId: St,
            targetPortId: Lt
          }
        }
      });
    }
    J(null);
  }, Rt = (G) => {
    if (G.button === 1 || $.current) {
      p(G.clientX, G.clientY);
      return;
    }
    const T = G.target, x = T === t.current || T.classList.contains("sysflow-viewport") || T.classList.contains("sysflow-dom-layer") || T.tagName.toLowerCase() === "svg";
    if (G.button === 0 && x) {
      G.currentTarget.setPointerCapture(G.pointerId);
      const D = K(G.clientX, G.clientY);
      z({
        startX: D.x,
        startY: D.y,
        currentX: D.x,
        currentY: D.y
      }), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Ot = (G) => {
    if (Q.current)
      H(G.clientX, G.clientY);
    else if (v) {
      const T = K(G.clientX, G.clientY);
      z((x) => x ? { ...x, currentX: T.x, currentY: T.y } : null);
    } else R ? dt(G) : L && J(
      (T) => T ? { ...T, currentWorldPos: K(G.clientX, G.clientY) } : null
    );
  }, Ft = (G) => {
    if (G.currentTarget.hasPointerCapture(G.pointerId) && G.currentTarget.releasePointerCapture(G.pointerId), Q.current && W(), v) {
      const T = Math.min(v.startX, v.currentX), x = Math.min(v.startY, v.currentY), D = Math.max(v.startX, v.currentX), j = Math.max(v.startY, v.currentY);
      if (D - T > 4 || j - x > 4) {
        const F = [];
        for (const [gt, O] of Object.entries(a.nodes))
          O.x < D && O.x + O.width > T && O.y < j && O.y + O.height > x && F.push(gt);
        for (const [gt, O] of Object.entries(a.containers))
          O.x < D && O.x + O.width > T && O.y < j && O.y + O.height > x && F.push(gt);
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: F } });
      }
      z(null);
    }
    R && ht(G), L && J(null);
  }, zt = y ?? (c == null ? void 0 : c.mode) === "flow", jt = M(
    (G, T) => {
      const x = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, D = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: G,
          position: T,
          direction: I,
          suggestedNewNodeId: x,
          suggestedNewEdgeId: D
        }
      });
    },
    [I, g]
  ), Jt = e ?? y ?? (c == null ? void 0 : c.mode) === "flow", $t = M(
    (G) => {
      const T = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, x = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, D = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: G,
          direction: I,
          suggestedNewNodeId: T,
          suggestedNewEdge1Id: x,
          suggestedNewEdge2Id: D
        }
      }), g({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [T] }
      });
    },
    [I, g]
  ), Ut = Object.values(d.containers);
  return /* @__PURE__ */ U(
    "div",
    {
      ref: t,
      className: `sysflow-canvas ${w === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${u}`,
      "data-theme": w,
      onWheel: m,
      onPointerDown: Rt,
      onPointerMove: Ot,
      onPointerUp: Ft,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ N(
          me,
          {
            graph: d,
            registerMeasureElement: E,
            nodeTypes: C,
            containerTypes: h
          }
        ),
        /* @__PURE__ */ U("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ N("button", { onClick: Z, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ N("button", { onClick: X, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ U("button", { onClick: P, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(f.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ U(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${f.x}px, ${f.y}px) scale(${f.zoom})`
            },
            children: [
              v && /* @__PURE__ */ N(
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
              /* @__PURE__ */ N(
                Se,
                {
                  graph: d,
                  layout: a,
                  selectedIds: B,
                  direction: I,
                  showArrows: o,
                  routing: l,
                  portOptions: Y,
                  enableEdgeQuickAdd: Jt,
                  onInsertNodeOnEdge: $t,
                  onEdgeClick: (G) => g({ type: "SELECTION_CHANGE", payload: { selectedIds: [G] } })
                }
              ),
              L && /* @__PURE__ */ N("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ N(
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
              /* @__PURE__ */ U("div", { className: "sysflow-dom-layer", children: [
                Ut.map((G) => {
                  const T = a.containers[G.id];
                  if (!T) return null;
                  const x = Object.values(d.nodes).some((D) => D.parentId === G.id) || Object.values(d.containers).some((D) => D.parentId === G.id);
                  return /* @__PURE__ */ N(
                    pe,
                    {
                      container: G,
                      layout: T,
                      selected: B.includes(G.id),
                      isHovered: _ === G.id,
                      hasChildren: x,
                      customRenderer: G.type ? h == null ? void 0 : h[G.type] : void 0,
                      onToggleCollapse: (D, j) => g({
                        type: "CONTAINER_TOGGLE_COLLAPSE",
                        payload: { containerId: D, collapsed: j }
                      }),
                      onPointerDown: it,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (D) => {
                        D.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                      }
                    },
                    G.id
                  );
                }),
                Object.values(d.nodes).map((G) => {
                  const T = a.nodes[G.id];
                  return T ? /* @__PURE__ */ N(
                    Ke,
                    {
                      node: G,
                      layout: T,
                      direction: I,
                      edges: d.edges,
                      portOptions: Y,
                      selected: B.includes(G.id),
                      customRenderer: G.type ? C == null ? void 0 : C[G.type] : void 0,
                      enableQuickAdd: zt,
                      onAddConnectedNode: jt,
                      onPointerDown: it,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (x) => {
                        x.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                      },
                      onPortPointerDown: pt,
                      onPortPointerUp: Mt
                    },
                    G.id
                  ) : null;
                })
              ] }),
              R && /* @__PURE__ */ N(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${R.ghostPosition.x}px, ${R.ghostPosition.y}px)`,
                    width: `${((Nt = S.get(R.draggedEntity.id)) == null ? void 0 : Nt.width) || 200}px`,
                    height: `${((Tt = S.get(R.draggedEntity.id)) == null ? void 0 : Tt.height) || 64}px`
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
  He as EdgeRewireStrategy,
  pe as GraphContainer,
  Se as GraphEdgeLayer,
  Ke as GraphNode,
  Ge as GraphPortLayer,
  Be as ReparentStrategy,
  ae as SugiyamaEngine,
  Ye as SysFlowCanvas,
  ye as WorkerBridge,
  Dt as computeEntityPortLocations,
  de as pruneDanglingEdges,
  fe as useCanvasTransform,
  be as useDragGesture,
  Ee as useGraphHistory,
  we as useMeasurement
};
