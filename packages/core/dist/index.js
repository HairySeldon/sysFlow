var ne = Object.defineProperty;
var Ce = (r, g, o) => g in r ? ne(r, g, { enumerable: !0, configurable: !0, writable: !0, value: o }) : r[g] = o;
var St = (r, g, o) => Ce(r, typeof g != "symbol" ? g + "" : g, o);
import { useState as et, useRef as Ct, useCallback as M, useEffect as Dt, useMemo as ie } from "react";
import { jsxs as $, jsx as D, Fragment as Et } from "react/jsx-runtime";
function de(r, g, o, d) {
  const I = (s) => {
    const C = o.find(
      (c) => c.sourceId === g && c.sourcePortId === s || c.targetId === g && c.targetPortId === s
    );
    if (!C) return null;
    const a = C.sourceId === g ? C.targetId : C.sourceId, i = d[a];
    return i ? { x: i.x + i.width / 2, y: i.y + i.height / 2 } : null;
  };
  ["left", "right"].forEach((s) => {
    r[s].sort((C, a) => {
      var h, A;
      const i = ((h = I(C.id)) == null ? void 0 : h.y) ?? 0, c = ((A = I(a.id)) == null ? void 0 : A.y) ?? 0;
      return i - c;
    });
  }), ["top", "bottom"].forEach((s) => {
    r[s].sort((C, a) => {
      var h, A;
      const i = ((h = I(C.id)) == null ? void 0 : h.x) ?? 0, c = ((A = I(a.id)) == null ? void 0 : A.x) ?? 0;
      return i - c;
    });
  });
}
function ce(r, g, o, d, I, s) {
  if (!I || !s)
    return o ? "left" : "right";
  const C = d.find(
    (A) => o ? A.targetId === r && A.targetPortId === g : A.sourceId === r && A.sourcePortId === g
  );
  if (!C) return o ? "left" : "right";
  const a = o ? C.sourceId : C.targetId, i = I[a];
  if (!i) return o ? "left" : "right";
  const c = i.x + i.width / 2 - (s.x + s.width / 2), h = i.y + i.height / 2 - (s.y + s.height / 2);
  return Math.abs(c) > Math.abs(h) ? c > 0 ? "right" : "left" : h > 0 ? "bottom" : "top";
}
function Nt(r, g, o = "LR", d, I) {
  const s = /* @__PURE__ */ new Map();
  if (!r || !g || !r.ports || r.ports.length === 0)
    return s;
  const C = (I == null ? void 0 : I.direction) || o, a = C === "TB" || C === "BT", i = (I == null ? void 0 : I.mode) || (a ? "strict-flow" : "perimeter-optimized"), c = d ? Array.isArray(d) ? d : Object.values(d) : [], h = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, A = new Set(
    c.filter((b) => b.targetId === r.id).map((b) => b.targetPortId)
  );
  new Set(
    c.filter((b) => b.sourceId === r.id).map((b) => b.sourcePortId)
  ), r.ports.forEach((b) => {
    let B = b.side || "auto";
    if (B !== "auto") {
      h[B].push(b);
      return;
    }
    if (i === "strict-flow") {
      const n = A.has(b.id) || b.label.toLowerCase().includes("in");
      switch (C) {
        case "BT":
          B = n ? "bottom" : "top";
          break;
        case "TB":
          B = n ? "top" : "bottom";
          break;
        case "RL":
          B = n ? "right" : "left";
          break;
        case "LR":
        default:
          B = n ? "left" : "right";
          break;
      }
    } else
      B = ce(
        r.id,
        b.id,
        A.has(b.id),
        c,
        I == null ? void 0 : I.nodeLayouts,
        g
      );
    h[B].push(b);
  }), i === "perimeter-optimized" && (I != null && I.nodeLayouts) && de(h, r.id, c, I.nodeLayouts);
  const f = (b, B) => {
    const n = b.length;
    b.forEach((t, e) => {
      let l = 0, m = 0;
      B === "left" || B === "right" ? (m = g.height / (n + 1) * (e + 1), l = B === "left" ? 0 : g.width) : (l = g.width / (n + 1) * (e + 1), m = B === "top" ? 0 : g.height), s.set(t.id, {
        portId: t.id,
        side: B,
        localX: l,
        localY: m,
        worldX: g.x + l,
        worldY: g.y + m
      });
    });
  };
  return f(h.left, "left"), f(h.right, "right"), f(h.top, "top"), f(h.bottom, "bottom"), s;
}
function Wt(r) {
  const g = {}, o = (d) => {
    var s;
    const I = r.nodes[d];
    return new Set(((s = I == null ? void 0 : I.ports) == null ? void 0 : s.map((C) => C.id)) || []);
  };
  for (const [d, I] of Object.entries(r.edges)) {
    const s = o(I.sourceId), C = o(I.targetId), a = s.has(I.sourcePortId), i = C.has(I.targetPortId);
    a && i && (g[d] = I);
  }
  return {
    ...r,
    edges: g
  };
}
class re {
  static decouple(g, o) {
    const d = /* @__PURE__ */ new Map();
    for (const c of o)
      d.set(c, /* @__PURE__ */ new Set());
    const I = Object.values(g.edges);
    for (const c of I)
      o.has(c.sourceId) && o.has(c.targetId) && d.get(c.sourceId).add(c.targetId);
    const s = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), i = (c) => {
      s.add(c), C.add(c);
      const h = Array.from(d.get(c) || []);
      for (const A of h)
        s.has(A) ? C.has(A) && (d.get(c).delete(A), d.get(A).add(c), a.add(`${c}->${A}`)) : i(A);
      C.delete(c);
    };
    for (const c of o)
      s.has(c) || i(c);
    return {
      adjList: d,
      reversedEdges: a,
      allEntityIds: Array.from(o)
    };
  }
}
class le {
  static assignLayers(g, o) {
    const d = /* @__PURE__ */ new Map();
    for (const i of g)
      d.set(i, 0);
    for (const [, i] of o.entries())
      for (const c of i)
        d.set(c, (d.get(c) || 0) + 1);
    const I = /* @__PURE__ */ new Map(), s = [];
    for (const i of g)
      (d.get(i) || 0) === 0 && (I.set(i, 0), s.push(i));
    const C = /* @__PURE__ */ new Set();
    for (; s.length > 0; ) {
      const i = s.shift();
      C.add(i);
      const c = I.get(i) || 0, h = o.get(i) || /* @__PURE__ */ new Set();
      for (const A of h) {
        const f = I.get(A) ?? 0;
        I.set(A, Math.max(f, c + 1)), d.set(A, (d.get(A) || 1) - 1), d.get(A) === 0 && s.push(A);
      }
    }
    for (const i of g)
      I.has(i) || I.set(i, 0);
    const a = /* @__PURE__ */ new Map();
    for (const [i, c] of I.entries())
      a.has(c) || a.set(c, []), a.get(c).push(i);
    return a;
  }
}
class nt {
  static minimizeCrossings(g, o, d = 4, I) {
    const s = Array.from(g.keys()).sort((i, c) => i - c);
    if (s.length <= 1) return g;
    const C = /* @__PURE__ */ new Map();
    for (const [i, c] of o.entries())
      for (const h of c)
        C.has(h) || C.set(h, /* @__PURE__ */ new Set()), C.get(h).add(i);
    const a = /* @__PURE__ */ new Map();
    for (const [i, c] of g.entries())
      a.set(i, [...c]);
    for (let i = 0; i < d; i++) {
      for (let c = 1; c < s.length; c++) {
        const h = a.get(s[c - 1]), A = a.get(s[c]), f = /* @__PURE__ */ new Map();
        h.forEach((b, B) => f.set(b, B)), nt.sortLayerNodes(A, C, f, I);
      }
      for (let c = s.length - 2; c >= 0; c--) {
        const h = a.get(s[c + 1]), A = a.get(s[c]), f = /* @__PURE__ */ new Map();
        h.forEach((b, B) => f.set(b, B)), nt.sortLayerNodes(A, o, f, I);
      }
    }
    return a;
  }
  static sortLayerNodes(g, o, d, I) {
    var c, h, A;
    if (!I || Object.keys(I.containers).length === 0) {
      g.sort((f, b) => {
        const B = nt.getBarycenter(f, o, d), n = nt.getBarycenter(b, o, d);
        return B - n;
      });
      return;
    }
    const s = /* @__PURE__ */ new Map();
    for (const f of g)
      s.set(f, nt.getBarycenter(f, o, d));
    const C = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
    for (const f of g) {
      const b = s.get(f) ?? 0;
      let B = ((c = I.nodes[f]) == null ? void 0 : c.parentId) ?? ((h = I.containers[f]) == null ? void 0 : h.parentId);
      for (; B; )
        C.set(B, (C.get(B) || 0) + b), a.set(B, (a.get(B) || 0) + 1), B = (A = I.containers[B]) == null ? void 0 : A.parentId;
    }
    const i = (f) => {
      if (I.containers[f]) {
        const b = a.get(f) || 0;
        return b === 0 ? 0 : (C.get(f) || 0) / b;
      }
      return s.get(f) ?? 0;
    };
    g.sort((f, b) => {
      const B = nt.getAncestorPath(f, I), n = nt.getAncestorPath(b, I);
      let t = 0;
      for (; t < B.length && t < n.length && B[t] === n[t]; )
        t++;
      const e = B[t] ?? f, l = n[t] ?? b, m = i(e) - i(l);
      return Math.abs(m) > 1e-5 ? m : e.localeCompare(l);
    });
  }
  static getAncestorPath(g, o) {
    var s, C, a;
    const d = [g];
    let I = ((s = o.nodes[g]) == null ? void 0 : s.parentId) ?? ((C = o.containers[g]) == null ? void 0 : C.parentId);
    for (; I; )
      d.unshift(I), I = (a = o.containers[I]) == null ? void 0 : a.parentId;
    return d;
  }
  static getBarycenter(g, o, d) {
    const I = o.get(g);
    if (!I || I.size === 0) return 0;
    let s = 0, C = 0;
    for (const a of I)
      d.has(a) && (s += d.get(a), C++);
    return C === 0 ? 0 : s / C;
  }
}
const st = 32, Pt = 24, ut = 22, rt = 18, lt = 38, wt = 210, Ht = 36, Ae = 180, ae = 54, Xt = 260, Vt = 160;
class It {
  static assignCoordinates(g, o, d, I = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const s = I.direction ?? "TB", C = s === "TB" || s === "BT", a = s === "BT" || s === "RL", i = I.aspectRatio ?? 1.55, c = Object.keys(g.containers).length, h = I.mode && I.mode !== "auto" ? I.mode : c > 0 ? "concurrent" : "flow", A = {}, f = {}, b = (B) => {
      var e, l, m, w, u;
      const n = !!g.containers[B], t = !!((e = g.containers[B]) != null && e.collapsed);
      return n && t ? { width: wt, height: Ht } : n && !t ? {
        width: ((l = d.get(B)) == null ? void 0 : l.width) || Xt,
        height: ((m = d.get(B)) == null ? void 0 : m.height) || Vt
      } : {
        width: ((w = d.get(B)) == null ? void 0 : w.width) || Ae,
        height: ((u = d.get(B)) == null ? void 0 : u.height) || ae
      };
    };
    return h === "concurrent" ? It.layoutConcurrentHierarchy(
      g,
      b,
      i,
      A,
      f
    ) : It.layoutFlowTree(
      g,
      o,
      b,
      C,
      a,
      I,
      A,
      f
    ), It.assignDynamicPortSides(g, A, f), { nodes: A, containers: f };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(g, o, d, I, s) {
    var B;
    const C = /* @__PURE__ */ new Map();
    for (const [n, t] of Object.entries(g.nodes)) {
      const e = t.parentId ?? null;
      C.has(e) || C.set(e, []), C.get(e).push(n);
    }
    for (const [n, t] of Object.entries(g.containers)) {
      const e = t.parentId ?? null;
      C.has(e) || C.set(e, []), C.get(e).push(n);
    }
    const a = It.getContainerDepths(g), i = Object.keys(g.containers).sort(
      (n, t) => (a.get(t) || 0) - (a.get(n) || 0)
    ), c = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
    for (const n of i) {
      if (!!((B = g.containers[n]) != null && B.collapsed)) {
        c.set(n, {
          width: wt,
          height: Ht
        });
        continue;
      }
      const e = C.get(n) || [];
      if (e.length === 0) {
        c.set(n, {
          width: wt,
          height: lt + rt * 2
        });
        continue;
      }
      const l = e.map((p) => {
        const G = c.has(p) ? c.get(p) : o(p);
        return { id: p, width: G.width, height: G.height };
      }), m = It.findBestTightPacking(l, d);
      for (const p of m.boxes)
        h.set(p.id, p);
      const w = Math.max(m.width + ut * 2, wt), u = m.height + lt + rt * 2;
      c.set(n, { width: w, height: u });
    }
    const A = C.get(null) || [];
    let f = [];
    if (A.length > 0) {
      const n = A.map((e) => {
        const l = c.get(e) || o(e);
        return { id: e, width: l.width, height: l.height };
      });
      f = It.findBestTightPacking(n, d).boxes.map((e) => ({
        ...e,
        localX: e.localX + 60,
        localY: e.localY + 60
      }));
    }
    const b = (n, t, e, l, m) => {
      var p;
      const w = !!g.containers[n], u = { id: n, x: t, y: e, width: l, height: m };
      if (w) {
        if (s[n] = u, (p = g.containers[n]) != null && p.collapsed) return;
        const G = t + ut, v = e + lt + rt, T = C.get(n) || [];
        for (const Z of T) {
          const P = h.get(Z);
          P && b(
            Z,
            G + P.localX,
            v + P.localY,
            P.width,
            P.height
          );
        }
      } else
        I[n] = u;
    };
    for (const n of f)
      b(n.id, n.localX, n.localY, n.width, n.height);
  }
  static findBestTightPacking(g, o) {
    if (g.length === 1)
      return {
        width: g[0].width,
        height: g[0].height,
        boxes: [{ id: g[0].id, localX: 0, localY: 0, width: g[0].width, height: g[0].height }],
        score: 0
      };
    const d = g.reduce((A, f) => A + f.width * f.height, 0), I = Math.max(...g.map((A) => A.width)), s = [...g].sort((A, f) => f.width - A.width), C = /* @__PURE__ */ new Set(), a = g.reduce((A, f) => A + f.width, 0) + (g.length - 1) * st;
    C.add(a), C.add(I);
    const i = Math.max(I, Math.sqrt(d * o));
    C.add(i), C.add(i * 0.85), C.add(i * 1.15);
    const c = Math.min(g.length, 6);
    for (let A = 2; A <= c; A++) {
      let f = 0;
      for (let b = 0; b < A && b < s.length; b++)
        f += s[b].width;
      f += (A - 1) * st, f >= I && C.add(f);
    }
    let h = null;
    for (const A of C) {
      const f = It.simulateSkylinePacking(g, A), b = f.width * f.height, B = Math.max(0, b - d), n = f.width / Math.max(1, f.height), t = Math.abs(Math.log(n / o)), e = B / d * 2 + t * 0.25;
      f.score = e, (!h || e < h.score) && (h = f);
    }
    return h;
  }
  static simulateSkylinePacking(g, o) {
    const d = [...g].sort((i, c) => c.height - i.height), I = [{ x: 0, width: o, y: 0 }], s = [];
    for (const i of d) {
      let c = 1 / 0, h = -1;
      for (let e = 0; e < I.length; e++) {
        if (I[e].x + i.width > o) continue;
        let m = 0, w = 0;
        for (let u = e; u < I.length && w < i.width; u++)
          m = Math.max(m, I[u].y), w += I[u].width;
        m < c && (c = m, h = e);
      }
      if (h === -1) {
        const e = Math.max(...I.map((m) => m.y)), l = e === 0 ? 0 : e + Pt;
        s.push({
          id: i.id,
          localX: 0,
          localY: l,
          width: i.width,
          height: i.height
        }), I.length = 0, I.push({ x: 0, width: i.width + st, y: l + i.height }), o > i.width + st && I.push({
          x: i.width + st,
          width: o - (i.width + st),
          y: 0
        });
        continue;
      }
      const A = I[h].x, f = c === 0 ? 0 : c + Pt;
      s.push({
        id: i.id,
        localX: A,
        localY: f,
        width: i.width,
        height: i.height
      });
      const b = i.width + st, B = f + i.height, n = { x: A, width: b, y: B }, t = [];
      for (const e of I)
        e.x + e.width <= A || e.x >= A + b ? t.push(e) : (e.x < A && t.push({ x: e.x, width: A - e.x, y: e.y }), e.x + e.width > A + b && t.push({
          x: A + b,
          width: e.x + e.width - (A + b),
          y: e.y
        }));
      t.push(n), t.sort((e, l) => e.x - l.x), I.length = 0, I.push(...t);
    }
    const C = Math.max(...s.map((i) => i.localX + i.width), 0), a = Math.max(...s.map((i) => i.localY + i.height), 0);
    return { width: C, height: a, boxes: s, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE WITH COMPOUND CONTAINER SUPPORT
  // ===========================================================================
  static layoutFlowTree(g, o, d, I, s, C, a, i) {
    var Q;
    const c = Array.from(o.keys()).sort((K, k) => K - k), h = /* @__PURE__ */ new Map();
    let A = 80;
    const f = I ? lt + rt * 2 : ut * 2, b = (I ? Pt * 1.5 : st * 1.5) + f, B = I ? st : Pt, n = s ? [...c].reverse() : [...c];
    for (const K of n) {
      const k = o.get(K) || [];
      let y = 0;
      for (const H of k) {
        const Y = d(H), L = I ? Y.height : Y.width;
        y = Math.max(y, L);
      }
      h.set(K, A), A += y + b;
    }
    const t = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
    for (const K of Object.values(g.edges))
      t.has(K.targetId) || t.set(K.targetId, []), t.get(K.targetId).push(K.sourceId), e.has(K.sourceId) || e.set(K.sourceId, []), e.get(K.sourceId).push(K.targetId);
    const l = /* @__PURE__ */ new Map(), m = (K) => {
      var k, y;
      return ((k = g.nodes[K]) == null ? void 0 : k.parentId) ?? ((y = g.containers[K]) == null ? void 0 : y.parentId) ?? null;
    };
    for (const K of c) {
      const k = o.get(K) || [];
      let y = -1 / 0, H;
      for (const Y of k) {
        const L = d(Y), F = I ? L.width : L.height, X = t.get(Y) || [], j = m(Y);
        let U = B;
        H !== void 0 && H !== j && (U = B + (I ? ut * 2 : lt + rt * 2));
        let R = null;
        if (X.length > 0) {
          const it = X.map((dt) => {
            const ht = l.get(dt);
            if (ht === void 0) return null;
            const pt = d(dt);
            return ht + (I ? pt.width : pt.height) / 2;
          }).filter((dt) => dt !== null);
          it.length > 0 && (R = it.reduce((dt, ht) => dt + ht, 0) / it.length);
        }
        let _ = R !== null ? R - F / 2 : 80;
        _ < y + U && (_ = y === -1 / 0 ? 80 : y + U), l.set(Y, _), y = _ + F, H = j;
      }
    }
    for (let K = c.length - 1; K >= 0; K--) {
      const k = c[K], y = o.get(k) || [];
      for (const L of y) {
        const F = e.get(L) || [];
        if (F.length === 0) continue;
        const X = F.map((j) => {
          const U = l.get(j);
          if (U === void 0) return null;
          const R = d(j);
          return U + (I ? R.width : R.height) / 2;
        }).filter((j) => j !== null);
        if (X.length > 0) {
          const j = X.reduce((_, it) => _ + it, 0) / X.length, U = d(L), R = I ? U.width : U.height;
          l.set(L, j - R / 2);
        }
      }
      let H = -1 / 0, Y;
      for (const L of y) {
        const F = d(L), X = I ? F.width : F.height, j = m(L);
        let U = B;
        Y !== void 0 && Y !== j && (U = B + (I ? ut * 2 : lt + rt * 2));
        let R = l.get(L) ?? 80;
        R < H + U && (R = H + U, l.set(L, R)), H = R + X, Y = j;
      }
    }
    let w = 1 / 0;
    for (const K of l.values()) w = Math.min(w, K);
    const u = w < 80 ? 80 - w : 0;
    for (const K of c) {
      const k = o.get(K) || [], y = h.get(K) || 80;
      for (const H of k) {
        const Y = d(H), L = (l.get(H) ?? 80) + u, j = { id: H, x: I ? L : y, y: I ? y : L, width: Y.width, height: Y.height };
        g.containers[H] ? i[H] = j : a[H] = j;
      }
    }
    const p = It.getContainerDepths(g), G = Object.keys(g.containers).sort(
      (K, k) => (p.get(k) || 0) - (p.get(K) || 0)
    ), v = /* @__PURE__ */ new Map();
    for (const [K, k] of Object.entries(g.nodes))
      k.parentId && (v.has(k.parentId) || v.set(k.parentId, []), v.get(k.parentId).push(K));
    for (const [K, k] of Object.entries(g.containers))
      k.parentId && (v.has(k.parentId) || v.set(k.parentId, []), v.get(k.parentId).push(K));
    for (const K of G) {
      if ((Q = g.containers[K]) != null && Q.collapsed) {
        i[K] || (i[K] = {
          id: K,
          x: 80,
          y: 80,
          width: wt,
          height: Ht
        });
        continue;
      }
      const k = v.get(K) || [], y = [];
      for (const H of k) {
        const Y = a[H] || i[H];
        Y && y.push(Y);
      }
      if (y.length === 0)
        i[K] || (i[K] = {
          id: K,
          x: 80,
          y: 80,
          width: Xt,
          height: Vt
        });
      else {
        let H = 1 / 0, Y = -1 / 0, L = 1 / 0, F = -1 / 0;
        for (const _ of y)
          H = Math.min(H, _.x), Y = Math.max(Y, _.x + _.width), L = Math.min(L, _.y), F = Math.max(F, _.y + _.height);
        const X = Math.max(Y - H + ut * 2, wt), j = F - L + lt + rt * 2, U = H - ut, R = L - lt - rt;
        i[K] = { id: K, x: U, y: R, width: X, height: j };
      }
    }
    let T = 1 / 0, Z = 1 / 0;
    for (const K of [...Object.values(a), ...Object.values(i)])
      T = Math.min(T, K.x), Z = Math.min(Z, K.y);
    const P = 60, W = T < P ? P - T : 0, V = Z < P ? P - Z : 0;
    if (W !== 0 || V !== 0) {
      for (const K of Object.values(a))
        K.x += W, K.y += V;
      for (const K of Object.values(i))
        K.x += W, K.y += V;
    }
  }
  static assignDynamicPortSides(g, o, d) {
    var s, C;
    const I = (a) => o[a] || d[a];
    for (const a of Object.values(g.edges)) {
      const i = I(a.sourceId), c = I(a.targetId);
      if (!i || !c) continue;
      const h = g.nodes[a.sourceId] || g.containers[a.sourceId], A = g.nodes[a.targetId] || g.containers[a.targetId], f = c.x + c.width / 2 - (i.x + i.width / 2), b = c.y + c.height / 2 - (i.y + i.height / 2), B = Math.abs(f) > Math.abs(b) * 1.25, n = (s = h == null ? void 0 : h.ports) == null ? void 0 : s.find((e) => e.id === a.sourcePortId);
      n && (!n.side || n.side === "auto") && (B ? n.side = f >= 0 ? "right" : "left" : n.side = b >= 0 ? "bottom" : "top");
      const t = (C = A == null ? void 0 : A.ports) == null ? void 0 : C.find((e) => e.id === a.targetPortId);
      t && (!t.side || t.side === "auto") && (B ? t.side = f >= 0 ? "left" : "right" : t.side = b >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(g) {
    const o = /* @__PURE__ */ new Map(), d = (I) => {
      var a;
      if (o.has(I)) return o.get(I);
      const s = (a = g.containers[I]) == null ? void 0 : a.parentId;
      if (!s || !g.containers[s])
        return o.set(I, 0), 0;
      const C = 1 + d(s);
      return o.set(I, C), C;
    };
    for (const I of Object.keys(g.containers))
      d(I);
    return o;
  }
}
function Qt(r, g, o) {
  var s, C;
  let d = r, I = null;
  for (; d; )
    o.has(d) && (I = d), d = ((s = g.nodes[d]) == null ? void 0 : s.parentId) ?? ((C = g.containers[d]) == null ? void 0 : C.parentId) ?? void 0;
  return I ?? r;
}
class ue {
  async execute(g, o, d) {
    const I = Object.values(g.containers), s = Object.values(g.nodes), C = new Set(
      I.filter((B) => !!B.collapsed).map((B) => B.id)
    ), a = (B) => {
      var t;
      let n = B;
      for (; n; ) {
        if (C.has(n)) return !0;
        n = (t = g.containers[n]) == null ? void 0 : t.parentId;
      }
      return !1;
    }, i = /* @__PURE__ */ new Set();
    for (const [B, n] of Object.entries(g.nodes))
      a(n.parentId) || i.add(B);
    for (const [B, n] of Object.entries(g.containers))
      n.collapsed ? a(n.parentId) || i.add(B) : !(s.some((e) => e.parentId === B) || I.some((e) => e.parentId === B)) && !a(n.parentId) && i.add(B);
    const c = {};
    for (const [B, n] of Object.entries(g.edges)) {
      const t = Qt(n.sourceId, g, C), e = Qt(n.targetId, g, C);
      t !== e && i.has(t) && i.has(e) && (c[B] = {
        ...n,
        sourceId: t,
        targetId: e
      });
    }
    const h = {
      ...g,
      edges: c
    }, A = re.decouple(h, i), f = le.assignLayers(A.allEntityIds, A.adjList), b = nt.minimizeCrossings(f, A.adjList, 4, h);
    return It.assignCoordinates(h, b, o, d);
  }
}
const Rt = "Y2xhc3MgY3QgewogIHN0YXRpYyBkZWNvdXBsZShlLCBmKSB7CiAgICBjb25zdCBjID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgcyBvZiBmKQogICAgICBjLnNldChzLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgIGNvbnN0IHQgPSBPYmplY3QudmFsdWVzKGUuZWRnZXMpOwogICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgIGYuaGFzKHMuc291cmNlSWQpICYmIGYuaGFzKHMudGFyZ2V0SWQpICYmIGMuZ2V0KHMuc291cmNlSWQpLmFkZChzLnRhcmdldElkKTsKICAgIGNvbnN0IGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIG4gPSAocykgPT4gewogICAgICBkLmFkZChzKSwgaC5hZGQocyk7CiAgICAgIGNvbnN0IHkgPSBBcnJheS5mcm9tKGMuZ2V0KHMpIHx8IFtdKTsKICAgICAgZm9yIChjb25zdCBpIG9mIHkpCiAgICAgICAgZC5oYXMoaSkgPyBoLmhhcyhpKSAmJiAoYy5nZXQocykuZGVsZXRlKGkpLCBjLmdldChpKS5hZGQocyksIGwuYWRkKGAke3N9LT4ke2l9YCkpIDogbihpKTsKICAgICAgaC5kZWxldGUocyk7CiAgICB9OwogICAgZm9yIChjb25zdCBzIG9mIGYpCiAgICAgIGQuaGFzKHMpIHx8IG4ocyk7CiAgICByZXR1cm4gewogICAgICBhZGpMaXN0OiBjLAogICAgICByZXZlcnNlZEVkZ2VzOiBsLAogICAgICBhbGxFbnRpdHlJZHM6IEFycmF5LmZyb20oZikKICAgIH07CiAgfQp9CmNsYXNzIGl0IHsKICBzdGF0aWMgYXNzaWduTGF5ZXJzKGUsIGYpIHsKICAgIGNvbnN0IGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBuIG9mIGUpCiAgICAgIGMuc2V0KG4sIDApOwogICAgZm9yIChjb25zdCBbLCBuXSBvZiBmLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIG4pCiAgICAgICAgYy5zZXQocywgKGMuZ2V0KHMpIHx8IDApICsgMSk7CiAgICBjb25zdCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgZCA9IFtdOwogICAgZm9yIChjb25zdCBuIG9mIGUpCiAgICAgIChjLmdldChuKSB8fCAwKSA9PT0gMCAmJiAodC5zZXQobiwgMCksIGQucHVzaChuKSk7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyBkLmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBuID0gZC5zaGlmdCgpOwogICAgICBoLmFkZChuKTsKICAgICAgY29uc3QgcyA9IHQuZ2V0KG4pIHx8IDAsIHkgPSBmLmdldChuKSB8fCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICBmb3IgKGNvbnN0IGkgb2YgeSkgewogICAgICAgIGNvbnN0IHIgPSB0LmdldChpKSA/PyAwOwogICAgICAgIHQuc2V0KGksIE1hdGgubWF4KHIsIHMgKyAxKSksIGMuc2V0KGksIChjLmdldChpKSB8fCAxKSAtIDEpLCBjLmdldChpKSA9PT0gMCAmJiBkLnB1c2goaSk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgbiBvZiBlKQogICAgICB0LmhhcyhuKSB8fCB0LnNldChuLCAwKTsKICAgIGNvbnN0IGwgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbbiwgc10gb2YgdC5lbnRyaWVzKCkpCiAgICAgIGwuaGFzKHMpIHx8IGwuc2V0KHMsIFtdKSwgbC5nZXQocykucHVzaChuKTsKICAgIHJldHVybiBsOwogIH0KfQpjbGFzcyBHIHsKICBzdGF0aWMgbWluaW1pemVDcm9zc2luZ3MoZSwgZiwgYyA9IDQsIHQpIHsKICAgIGNvbnN0IGQgPSBBcnJheS5mcm9tKGUua2V5cygpKS5zb3J0KChuLCBzKSA9PiBuIC0gcyk7CiAgICBpZiAoZC5sZW5ndGggPD0gMSkgcmV0dXJuIGU7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW24sIHNdIG9mIGYuZW50cmllcygpKQogICAgICBmb3IgKGNvbnN0IHkgb2YgcykKICAgICAgICBoLmhhcyh5KSB8fCBoLnNldCh5LCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKSwgaC5nZXQoeSkuYWRkKG4pOwogICAgY29uc3QgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtuLCBzXSBvZiBlLmVudHJpZXMoKSkKICAgICAgbC5zZXQobiwgWy4uLnNdKTsKICAgIGZvciAobGV0IG4gPSAwOyBuIDwgYzsgbisrKSB7CiAgICAgIGZvciAobGV0IHMgPSAxOyBzIDwgZC5sZW5ndGg7IHMrKykgewogICAgICAgIGNvbnN0IHkgPSBsLmdldChkW3MgLSAxXSksIGkgPSBsLmdldChkW3NdKSwgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgICAgeS5mb3JFYWNoKChwLCBnKSA9PiByLnNldChwLCBnKSksIEcuc29ydExheWVyTm9kZXMoaSwgaCwgciwgdCk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgcyA9IGQubGVuZ3RoIC0gMjsgcyA+PSAwOyBzLS0pIHsKICAgICAgICBjb25zdCB5ID0gbC5nZXQoZFtzICsgMV0pLCBpID0gbC5nZXQoZFtzXSksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHkuZm9yRWFjaCgocCwgZykgPT4gci5zZXQocCwgZykpLCBHLnNvcnRMYXllck5vZGVzKGksIGYsIHIsIHQpOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gbDsKICB9CiAgc3RhdGljIHNvcnRMYXllck5vZGVzKGUsIGYsIGMsIHQpIHsKICAgIHZhciBzLCB5LCBpOwogICAgaWYgKCF0IHx8IE9iamVjdC5rZXlzKHQuY29udGFpbmVycykubGVuZ3RoID09PSAwKSB7CiAgICAgIGUuc29ydCgociwgcCkgPT4gewogICAgICAgIGNvbnN0IGcgPSBHLmdldEJhcnljZW50ZXIociwgZiwgYyksIGEgPSBHLmdldEJhcnljZW50ZXIocCwgZiwgYyk7CiAgICAgICAgcmV0dXJuIGcgLSBhOwogICAgICB9KTsKICAgICAgcmV0dXJuOwogICAgfQogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IHIgb2YgZSkKICAgICAgZC5zZXQociwgRy5nZXRCYXJ5Y2VudGVyKHIsIGYsIGMpKTsKICAgIGNvbnN0IGggPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBsID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgciBvZiBlKSB7CiAgICAgIGNvbnN0IHAgPSBkLmdldChyKSA/PyAwOwogICAgICBsZXQgZyA9ICgocyA9IHQubm9kZXNbcl0pID09IG51bGwgPyB2b2lkIDAgOiBzLnBhcmVudElkKSA/PyAoKHkgPSB0LmNvbnRhaW5lcnNbcl0pID09IG51bGwgPyB2b2lkIDAgOiB5LnBhcmVudElkKTsKICAgICAgZm9yICg7IGc7ICkKICAgICAgICBoLnNldChnLCAoaC5nZXQoZykgfHwgMCkgKyBwKSwgbC5zZXQoZywgKGwuZ2V0KGcpIHx8IDApICsgMSksIGcgPSAoaSA9IHQuY29udGFpbmVyc1tnXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGkucGFyZW50SWQ7CiAgICB9CiAgICBjb25zdCBuID0gKHIpID0+IHsKICAgICAgaWYgKHQuY29udGFpbmVyc1tyXSkgewogICAgICAgIGNvbnN0IHAgPSBsLmdldChyKSB8fCAwOwogICAgICAgIHJldHVybiBwID09PSAwID8gMCA6IChoLmdldChyKSB8fCAwKSAvIHA7CiAgICAgIH0KICAgICAgcmV0dXJuIGQuZ2V0KHIpID8/IDA7CiAgICB9OwogICAgZS5zb3J0KChyLCBwKSA9PiB7CiAgICAgIGNvbnN0IGcgPSBHLmdldEFuY2VzdG9yUGF0aChyLCB0KSwgYSA9IEcuZ2V0QW5jZXN0b3JQYXRoKHAsIHQpOwogICAgICBsZXQgdyA9IDA7CiAgICAgIGZvciAoOyB3IDwgZy5sZW5ndGggJiYgdyA8IGEubGVuZ3RoICYmIGdbd10gPT09IGFbd107ICkKICAgICAgICB3Kys7CiAgICAgIGNvbnN0IG8gPSBnW3ddID8/IHIsIEkgPSBhW3ddID8/IHAsIE0gPSBuKG8pIC0gbihJKTsKICAgICAgcmV0dXJuIE1hdGguYWJzKE0pID4gMWUtNSA/IE0gOiBvLmxvY2FsZUNvbXBhcmUoSSk7CiAgICB9KTsKICB9CiAgc3RhdGljIGdldEFuY2VzdG9yUGF0aChlLCBmKSB7CiAgICB2YXIgZCwgaCwgbDsKICAgIGNvbnN0IGMgPSBbZV07CiAgICBsZXQgdCA9ICgoZCA9IGYubm9kZXNbZV0pID09IG51bGwgPyB2b2lkIDAgOiBkLnBhcmVudElkKSA/PyAoKGggPSBmLmNvbnRhaW5lcnNbZV0pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKTsKICAgIGZvciAoOyB0OyApCiAgICAgIGMudW5zaGlmdCh0KSwgdCA9IChsID0gZi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogbC5wYXJlbnRJZDsKICAgIHJldHVybiBjOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihlLCBmLCBjKSB7CiAgICBjb25zdCB0ID0gZi5nZXQoZSk7CiAgICBpZiAoIXQgfHwgdC5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBkID0gMCwgaCA9IDA7CiAgICBmb3IgKGNvbnN0IGwgb2YgdCkKICAgICAgYy5oYXMobCkgJiYgKGQgKz0gYy5nZXQobCksIGgrKyk7CiAgICByZXR1cm4gaCA9PT0gMCA/IDAgOiBkIC8gaDsKICB9Cn0KY29uc3QgayA9IDMyLCBRID0gMjQsIF8gPSAyMiwgUiA9IDE4LCBXID0gMzgsICQgPSAyMTAsIFYgPSAzNiwgcnQgPSAxODAsIGF0ID0gNTQsIG50ID0gMjYwLCBzdCA9IDE2MDsKY2xhc3MgWSB7CiAgc3RhdGljIGFzc2lnbkNvb3JkaW5hdGVzKGUsIGYsIGMsIHQgPSB7IGRpcmVjdGlvbjogIlRCIiwgbW9kZTogImF1dG8iLCBhc3BlY3RSYXRpbzogMS41NSB9KSB7CiAgICBjb25zdCBkID0gdC5kaXJlY3Rpb24gPz8gIlRCIiwgaCA9IGQgPT09ICJUQiIgfHwgZCA9PT0gIkJUIiwgbCA9IGQgPT09ICJCVCIgfHwgZCA9PT0gIlJMIiwgbiA9IHQuYXNwZWN0UmF0aW8gPz8gMS41NSwgcyA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykubGVuZ3RoLCB5ID0gdC5tb2RlICYmIHQubW9kZSAhPT0gImF1dG8iID8gdC5tb2RlIDogcyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIsIGkgPSB7fSwgciA9IHt9LCBwID0gKGcpID0+IHsKICAgICAgdmFyIG8sIEksIE0sIEUsIFM7CiAgICAgIGNvbnN0IGEgPSAhIWUuY29udGFpbmVyc1tnXSwgdyA9ICEhKChvID0gZS5jb250YWluZXJzW2ddKSAhPSBudWxsICYmIG8uY29sbGFwc2VkKTsKICAgICAgcmV0dXJuIGEgJiYgdyA/IHsgd2lkdGg6ICQsIGhlaWdodDogViB9IDogYSAmJiAhdyA/IHsKICAgICAgICB3aWR0aDogKChJID0gYy5nZXQoZykpID09IG51bGwgPyB2b2lkIDAgOiBJLndpZHRoKSB8fCBudCwKICAgICAgICBoZWlnaHQ6ICgoTSA9IGMuZ2V0KGcpKSA9PSBudWxsID8gdm9pZCAwIDogTS5oZWlnaHQpIHx8IHN0CiAgICAgIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoRSA9IGMuZ2V0KGcpKSA9PSBudWxsID8gdm9pZCAwIDogRS53aWR0aCkgfHwgcnQsCiAgICAgICAgaGVpZ2h0OiAoKFMgPSBjLmdldChnKSkgPT0gbnVsbCA/IHZvaWQgMCA6IFMuaGVpZ2h0KSB8fCBhdAogICAgICB9OwogICAgfTsKICAgIHJldHVybiB5ID09PSAiY29uY3VycmVudCIgPyBZLmxheW91dENvbmN1cnJlbnRIaWVyYXJjaHkoCiAgICAgIGUsCiAgICAgIHAsCiAgICAgIG4sCiAgICAgIGksCiAgICAgIHIKICAgICkgOiBZLmxheW91dEZsb3dUcmVlKAogICAgICBlLAogICAgICBmLAogICAgICBwLAogICAgICBoLAogICAgICBsLAogICAgICB0LAogICAgICBpLAogICAgICByCiAgICApLCBZLmFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgaSwgciksIHsgbm9kZXM6IGksIGNvbnRhaW5lcnM6IHIgfTsKICB9CiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgLy8gQ09OQ1VSUkVOVCBDT01QT1VORCBQQUNLSU5HIFdJVEggU0tZTElORSAyRCBCSU4gUEFDS0lORwogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KGUsIGYsIGMsIHQsIGQpIHsKICAgIHZhciBnOwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFthLCB3XSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCBvID0gdy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBoLmhhcyhvKSB8fCBoLnNldChvLCBbXSksIGguZ2V0KG8pLnB1c2goYSk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFthLCB3XSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IG8gPSB3LnBhcmVudElkID8/IG51bGw7CiAgICAgIGguaGFzKG8pIHx8IGguc2V0KG8sIFtdKSwgaC5nZXQobykucHVzaChhKTsKICAgIH0KICAgIGNvbnN0IGwgPSBZLmdldENvbnRhaW5lckRlcHRocyhlKSwgbiA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKGEsIHcpID0+IChsLmdldCh3KSB8fCAwKSAtIChsLmdldChhKSB8fCAwKQogICAgKSwgcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBhIG9mIG4pIHsKICAgICAgaWYgKCEhKChnID0gZS5jb250YWluZXJzW2FdKSAhPSBudWxsICYmIGcuY29sbGFwc2VkKSkgewogICAgICAgIHMuc2V0KGEsIHsKICAgICAgICAgIHdpZHRoOiAkLAogICAgICAgICAgaGVpZ2h0OiBWCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgbyA9IGguZ2V0KGEpIHx8IFtdOwogICAgICBpZiAoby5sZW5ndGggPT09IDApIHsKICAgICAgICBzLnNldChhLCB7CiAgICAgICAgICB3aWR0aDogJCwKICAgICAgICAgIGhlaWdodDogVyArIFIgKiAyCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgSSA9IG8ubWFwKChBKSA9PiB7CiAgICAgICAgY29uc3QgRiA9IHMuaGFzKEEpID8gcy5nZXQoQSkgOiBmKEEpOwogICAgICAgIHJldHVybiB7IGlkOiBBLCB3aWR0aDogRi53aWR0aCwgaGVpZ2h0OiBGLmhlaWdodCB9OwogICAgICB9KSwgTSA9IFkuZmluZEJlc3RUaWdodFBhY2tpbmcoSSwgYyk7CiAgICAgIGZvciAoY29uc3QgQSBvZiBNLmJveGVzKQogICAgICAgIHkuc2V0KEEuaWQsIEEpOwogICAgICBjb25zdCBFID0gTWF0aC5tYXgoTS53aWR0aCArIF8gKiAyLCAkKSwgUyA9IE0uaGVpZ2h0ICsgVyArIFIgKiAyOwogICAgICBzLnNldChhLCB7IHdpZHRoOiBFLCBoZWlnaHQ6IFMgfSk7CiAgICB9CiAgICBjb25zdCBpID0gaC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgciA9IFtdOwogICAgaWYgKGkubGVuZ3RoID4gMCkgewogICAgICBjb25zdCBhID0gaS5tYXAoKG8pID0+IHsKICAgICAgICBjb25zdCBJID0gcy5nZXQobykgfHwgZihvKTsKICAgICAgICByZXR1cm4geyBpZDogbywgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgfSk7CiAgICAgIHIgPSBZLmZpbmRCZXN0VGlnaHRQYWNraW5nKGEsIGMpLmJveGVzLm1hcCgobykgPT4gKHsKICAgICAgICAuLi5vLAogICAgICAgIGxvY2FsWDogby5sb2NhbFggKyA2MCwKICAgICAgICBsb2NhbFk6IG8ubG9jYWxZICsgNjAKICAgICAgfSkpOwogICAgfQogICAgY29uc3QgcCA9IChhLCB3LCBvLCBJLCBNKSA9PiB7CiAgICAgIHZhciBBOwogICAgICBjb25zdCBFID0gISFlLmNvbnRhaW5lcnNbYV0sIFMgPSB7IGlkOiBhLCB4OiB3LCB5OiBvLCB3aWR0aDogSSwgaGVpZ2h0OiBNIH07CiAgICAgIGlmIChFKSB7CiAgICAgICAgaWYgKGRbYV0gPSBTLCAoQSA9IGUuY29udGFpbmVyc1thXSkgIT0gbnVsbCAmJiBBLmNvbGxhcHNlZCkgcmV0dXJuOwogICAgICAgIGNvbnN0IEYgPSB3ICsgXywgSCA9IG8gKyBXICsgUiwgVSA9IGguZ2V0KGEpIHx8IFtdOwogICAgICAgIGZvciAoY29uc3QgTCBvZiBVKSB7CiAgICAgICAgICBjb25zdCBCID0geS5nZXQoTCk7CiAgICAgICAgICBCICYmIHAoCiAgICAgICAgICAgIEwsCiAgICAgICAgICAgIEYgKyBCLmxvY2FsWCwKICAgICAgICAgICAgSCArIEIubG9jYWxZLAogICAgICAgICAgICBCLndpZHRoLAogICAgICAgICAgICBCLmhlaWdodAogICAgICAgICAgKTsKICAgICAgICB9CiAgICAgIH0gZWxzZQogICAgICAgIHRbYV0gPSBTOwogICAgfTsKICAgIGZvciAoY29uc3QgYSBvZiByKQogICAgICBwKGEuaWQsIGEubG9jYWxYLCBhLmxvY2FsWSwgYS53aWR0aCwgYS5oZWlnaHQpOwogIH0KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcoZSwgZikgewogICAgaWYgKGUubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBlWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogZVswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBlWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IGVbMF0ud2lkdGgsIGhlaWdodDogZVswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IGMgPSBlLnJlZHVjZSgoaSwgcikgPT4gaSArIHIud2lkdGggKiByLmhlaWdodCwgMCksIHQgPSBNYXRoLm1heCguLi5lLm1hcCgoaSkgPT4gaS53aWR0aCkpLCBkID0gWy4uLmVdLnNvcnQoKGksIHIpID0+IHIud2lkdGggLSBpLndpZHRoKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGwgPSBlLnJlZHVjZSgoaSwgcikgPT4gaSArIHIud2lkdGgsIDApICsgKGUubGVuZ3RoIC0gMSkgKiBrOwogICAgaC5hZGQobCksIGguYWRkKHQpOwogICAgY29uc3QgbiA9IE1hdGgubWF4KHQsIE1hdGguc3FydChjICogZikpOwogICAgaC5hZGQobiksIGguYWRkKG4gKiAwLjg1KSwgaC5hZGQobiAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKGUubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IGkgPSAyOyBpIDw9IHM7IGkrKykgewogICAgICBsZXQgciA9IDA7CiAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgaSAmJiBwIDwgZC5sZW5ndGg7IHArKykKICAgICAgICByICs9IGRbcF0ud2lkdGg7CiAgICAgIHIgKz0gKGkgLSAxKSAqIGssIHIgPj0gdCAmJiBoLmFkZChyKTsKICAgIH0KICAgIGxldCB5ID0gbnVsbDsKICAgIGZvciAoY29uc3QgaSBvZiBoKSB7CiAgICAgIGNvbnN0IHIgPSBZLnNpbXVsYXRlU2t5bGluZVBhY2tpbmcoZSwgaSksIHAgPSByLndpZHRoICogci5oZWlnaHQsIGcgPSBNYXRoLm1heCgwLCBwIC0gYyksIGEgPSByLndpZHRoIC8gTWF0aC5tYXgoMSwgci5oZWlnaHQpLCB3ID0gTWF0aC5hYnMoTWF0aC5sb2coYSAvIGYpKSwgbyA9IGcgLyBjICogMiArIHcgKiAwLjI1OwogICAgICByLnNjb3JlID0gbywgKCF5IHx8IG8gPCB5LnNjb3JlKSAmJiAoeSA9IHIpOwogICAgfQogICAgcmV0dXJuIHk7CiAgfQogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGYpIHsKICAgIGNvbnN0IGMgPSBbLi4uZV0uc29ydCgobiwgcykgPT4gcy5oZWlnaHQgLSBuLmhlaWdodCksIHQgPSBbeyB4OiAwLCB3aWR0aDogZiwgeTogMCB9XSwgZCA9IFtdOwogICAgZm9yIChjb25zdCBuIG9mIGMpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCBvID0gMDsgbyA8IHQubGVuZ3RoOyBvKyspIHsKICAgICAgICBpZiAodFtvXS54ICsgbi53aWR0aCA+IGYpIGNvbnRpbnVlOwogICAgICAgIGxldCBNID0gMCwgRSA9IDA7CiAgICAgICAgZm9yIChsZXQgUyA9IG87IFMgPCB0Lmxlbmd0aCAmJiBFIDwgbi53aWR0aDsgUysrKQogICAgICAgICAgTSA9IE1hdGgubWF4KE0sIHRbU10ueSksIEUgKz0gdFtTXS53aWR0aDsKICAgICAgICBNIDwgcyAmJiAocyA9IE0sIHkgPSBvKTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCBvID0gTWF0aC5tYXgoLi4udC5tYXAoKE0pID0+IE0ueSkpLCBJID0gbyA9PT0gMCA/IDAgOiBvICsgUTsKICAgICAgICBkLnB1c2goewogICAgICAgICAgaWQ6IG4uaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IEksCiAgICAgICAgICB3aWR0aDogbi53aWR0aCwKICAgICAgICAgIGhlaWdodDogbi5oZWlnaHQKICAgICAgICB9KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goeyB4OiAwLCB3aWR0aDogbi53aWR0aCArIGssIHk6IEkgKyBuLmhlaWdodCB9KSwgZiA+IG4ud2lkdGggKyBrICYmIHQucHVzaCh7CiAgICAgICAgICB4OiBuLndpZHRoICsgaywKICAgICAgICAgIHdpZHRoOiBmIC0gKG4ud2lkdGggKyBrKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBpID0gdFt5XS54LCByID0gcyA9PT0gMCA/IDAgOiBzICsgUTsKICAgICAgZC5wdXNoKHsKICAgICAgICBpZDogbi5pZCwKICAgICAgICBsb2NhbFg6IGksCiAgICAgICAgbG9jYWxZOiByLAogICAgICAgIHdpZHRoOiBuLndpZHRoLAogICAgICAgIGhlaWdodDogbi5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IHAgPSBuLndpZHRoICsgaywgZyA9IHIgKyBuLmhlaWdodCwgYSA9IHsgeDogaSwgd2lkdGg6IHAsIHk6IGcgfSwgdyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG8gb2YgdCkKICAgICAgICBvLnggKyBvLndpZHRoIDw9IGkgfHwgby54ID49IGkgKyBwID8gdy5wdXNoKG8pIDogKG8ueCA8IGkgJiYgdy5wdXNoKHsgeDogby54LCB3aWR0aDogaSAtIG8ueCwgeTogby55IH0pLCBvLnggKyBvLndpZHRoID4gaSArIHAgJiYgdy5wdXNoKHsKICAgICAgICAgIHg6IGkgKyBwLAogICAgICAgICAgd2lkdGg6IG8ueCArIG8ud2lkdGggLSAoaSArIHApLAogICAgICAgICAgeTogby55CiAgICAgICAgfSkpOwogICAgICB3LnB1c2goYSksIHcuc29ydCgobywgSSkgPT4gby54IC0gSS54KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goLi4udyk7CiAgICB9CiAgICBjb25zdCBoID0gTWF0aC5tYXgoLi4uZC5tYXAoKG4pID0+IG4ubG9jYWxYICsgbi53aWR0aCksIDApLCBsID0gTWF0aC5tYXgoLi4uZC5tYXAoKG4pID0+IG4ubG9jYWxZICsgbi5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBoLCBoZWlnaHQ6IGwsIGJveGVzOiBkLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgV0lUSCBDT01QT1VORCBDT05UQUlORVIgU1VQUE9SVAogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRGbG93VHJlZShlLCBmLCBjLCB0LCBkLCBoLCBsLCBuKSB7CiAgICB2YXIgdHQ7CiAgICBjb25zdCBzID0gQXJyYXkuZnJvbShmLmtleXMoKSkuc29ydCgodSwgeCkgPT4gdSAtIHgpLCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGxldCBpID0gODA7CiAgICBjb25zdCByID0gdCA/IFcgKyBSICogMiA6IF8gKiAyLCBwID0gKHQgPyBRICogMS41IDogayAqIDEuNSkgKyByLCBnID0gdCA/IGsgOiBRLCBhID0gZCA/IFsuLi5zXS5yZXZlcnNlKCkgOiBbLi4uc107CiAgICBmb3IgKGNvbnN0IHUgb2YgYSkgewogICAgICBjb25zdCB4ID0gZi5nZXQodSkgfHwgW107CiAgICAgIGxldCBPID0gMDsKICAgICAgZm9yIChjb25zdCBtIG9mIHgpIHsKICAgICAgICBjb25zdCBiID0gYyhtKSwgUCA9IHQgPyBiLmhlaWdodCA6IGIud2lkdGg7CiAgICAgICAgTyA9IE1hdGgubWF4KE8sIFApOwogICAgICB9CiAgICAgIHkuc2V0KHUsIGkpLCBpICs9IE8gKyBwOwogICAgfQogICAgY29uc3QgdyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCB1IG9mIE9iamVjdC52YWx1ZXMoZS5lZGdlcykpCiAgICAgIHcuaGFzKHUudGFyZ2V0SWQpIHx8IHcuc2V0KHUudGFyZ2V0SWQsIFtdKSwgdy5nZXQodS50YXJnZXRJZCkucHVzaCh1LnNvdXJjZUlkKSwgby5oYXModS5zb3VyY2VJZCkgfHwgby5zZXQodS5zb3VyY2VJZCwgW10pLCBvLmdldCh1LnNvdXJjZUlkKS5wdXNoKHUudGFyZ2V0SWQpOwogICAgY29uc3QgSSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIE0gPSAodSkgPT4gewogICAgICB2YXIgeCwgTzsKICAgICAgcmV0dXJuICgoeCA9IGUubm9kZXNbdV0pID09IG51bGwgPyB2b2lkIDAgOiB4LnBhcmVudElkKSA/PyAoKE8gPSBlLmNvbnRhaW5lcnNbdV0pID09IG51bGwgPyB2b2lkIDAgOiBPLnBhcmVudElkKSA/PyBudWxsOwogICAgfTsKICAgIGZvciAoY29uc3QgdSBvZiBzKSB7CiAgICAgIGNvbnN0IHggPSBmLmdldCh1KSB8fCBbXTsKICAgICAgbGV0IE8gPSAtMSAvIDAsIG07CiAgICAgIGZvciAoY29uc3QgYiBvZiB4KSB7CiAgICAgICAgY29uc3QgUCA9IGMoYiksIE4gPSB0ID8gUC53aWR0aCA6IFAuaGVpZ2h0LCBEID0gdy5nZXQoYikgfHwgW10sIHYgPSBNKGIpOwogICAgICAgIGxldCBDID0gZzsKICAgICAgICBtICE9PSB2b2lkIDAgJiYgbSAhPT0gdiAmJiAoQyA9IGcgKyAodCA/IF8gKiAyIDogVyArIFIgKiAyKSk7CiAgICAgICAgbGV0IFQgPSBudWxsOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEogPSBELm1hcCgocSkgPT4gewogICAgICAgICAgICBjb25zdCBLID0gSS5nZXQocSk7CiAgICAgICAgICAgIGlmIChLID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBldCA9IGMocSk7CiAgICAgICAgICAgIHJldHVybiBLICsgKHQgPyBldC53aWR0aCA6IGV0LmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChxKSA9PiBxICE9PSBudWxsKTsKICAgICAgICAgIEoubGVuZ3RoID4gMCAmJiAoVCA9IEoucmVkdWNlKChxLCBLKSA9PiBxICsgSywgMCkgLyBKLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBqID0gVCAhPT0gbnVsbCA/IFQgLSBOIC8gMiA6IDgwOwogICAgICAgIGogPCBPICsgQyAmJiAoaiA9IE8gPT09IC0xIC8gMCA/IDgwIDogTyArIEMpLCBJLnNldChiLCBqKSwgTyA9IGogKyBOLCBtID0gdjsKICAgICAgfQogICAgfQogICAgZm9yIChsZXQgdSA9IHMubGVuZ3RoIC0gMTsgdSA+PSAwOyB1LS0pIHsKICAgICAgY29uc3QgeCA9IHNbdV0sIE8gPSBmLmdldCh4KSB8fCBbXTsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBOID0gby5nZXQoUCkgfHwgW107CiAgICAgICAgaWYgKE4ubGVuZ3RoID09PSAwKSBjb250aW51ZTsKICAgICAgICBjb25zdCBEID0gTi5tYXAoKHYpID0+IHsKICAgICAgICAgIGNvbnN0IEMgPSBJLmdldCh2KTsKICAgICAgICAgIGlmIChDID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgY29uc3QgVCA9IGModik7CiAgICAgICAgICByZXR1cm4gQyArICh0ID8gVC53aWR0aCA6IFQuaGVpZ2h0KSAvIDI7CiAgICAgICAgfSkuZmlsdGVyKCh2KSA9PiB2ICE9PSBudWxsKTsKICAgICAgICBpZiAoRC5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCB2ID0gRC5yZWR1Y2UoKGosIEopID0+IGogKyBKLCAwKSAvIEQubGVuZ3RoLCBDID0gYyhQKSwgVCA9IHQgPyBDLndpZHRoIDogQy5oZWlnaHQ7CiAgICAgICAgICBJLnNldChQLCB2IC0gVCAvIDIpOwogICAgICAgIH0KICAgICAgfQogICAgICBsZXQgbSA9IC0xIC8gMCwgYjsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBOID0gYyhQKSwgRCA9IHQgPyBOLndpZHRoIDogTi5oZWlnaHQsIHYgPSBNKFApOwogICAgICAgIGxldCBDID0gZzsKICAgICAgICBiICE9PSB2b2lkIDAgJiYgYiAhPT0gdiAmJiAoQyA9IGcgKyAodCA/IF8gKiAyIDogVyArIFIgKiAyKSk7CiAgICAgICAgbGV0IFQgPSBJLmdldChQKSA/PyA4MDsKICAgICAgICBUIDwgbSArIEMgJiYgKFQgPSBtICsgQywgSS5zZXQoUCwgVCkpLCBtID0gVCArIEQsIGIgPSB2OwogICAgICB9CiAgICB9CiAgICBsZXQgRSA9IDEgLyAwOwogICAgZm9yIChjb25zdCB1IG9mIEkudmFsdWVzKCkpIEUgPSBNYXRoLm1pbihFLCB1KTsKICAgIGNvbnN0IFMgPSBFIDwgODAgPyA4MCAtIEUgOiAwOwogICAgZm9yIChjb25zdCB1IG9mIHMpIHsKICAgICAgY29uc3QgeCA9IGYuZ2V0KHUpIHx8IFtdLCBPID0geS5nZXQodSkgfHwgODA7CiAgICAgIGZvciAoY29uc3QgbSBvZiB4KSB7CiAgICAgICAgY29uc3QgYiA9IGMobSksIFAgPSAoSS5nZXQobSkgPz8gODApICsgUywgdiA9IHsgaWQ6IG0sIHg6IHQgPyBQIDogTywgeTogdCA/IE8gOiBQLCB3aWR0aDogYi53aWR0aCwgaGVpZ2h0OiBiLmhlaWdodCB9OwogICAgICAgIGUuY29udGFpbmVyc1ttXSA/IG5bbV0gPSB2IDogbFttXSA9IHY7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IEEgPSBZLmdldENvbnRhaW5lckRlcHRocyhlKSwgRiA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHUsIHgpID0+IChBLmdldCh4KSB8fCAwKSAtIChBLmdldCh1KSB8fCAwKQogICAgKSwgSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt1LCB4XSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkKICAgICAgeC5wYXJlbnRJZCAmJiAoSC5oYXMoeC5wYXJlbnRJZCkgfHwgSC5zZXQoeC5wYXJlbnRJZCwgW10pLCBILmdldCh4LnBhcmVudElkKS5wdXNoKHUpKTsKICAgIGZvciAoY29uc3QgW3UsIHhdIG9mIE9iamVjdC5lbnRyaWVzKGUuY29udGFpbmVycykpCiAgICAgIHgucGFyZW50SWQgJiYgKEguaGFzKHgucGFyZW50SWQpIHx8IEguc2V0KHgucGFyZW50SWQsIFtdKSwgSC5nZXQoeC5wYXJlbnRJZCkucHVzaCh1KSk7CiAgICBmb3IgKGNvbnN0IHUgb2YgRikgewogICAgICBpZiAoKHR0ID0gZS5jb250YWluZXJzW3VdKSAhPSBudWxsICYmIHR0LmNvbGxhcHNlZCkgewogICAgICAgIG5bdV0gfHwgKG5bdV0gPSB7CiAgICAgICAgICBpZDogdSwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogJCwKICAgICAgICAgIGhlaWdodDogVgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHggPSBILmdldCh1KSB8fCBbXSwgTyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG0gb2YgeCkgewogICAgICAgIGNvbnN0IGIgPSBsW21dIHx8IG5bbV07CiAgICAgICAgYiAmJiBPLnB1c2goYik7CiAgICAgIH0KICAgICAgaWYgKE8ubGVuZ3RoID09PSAwKQogICAgICAgIG5bdV0gfHwgKG5bdV0gPSB7CiAgICAgICAgICBpZDogdSwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogbnQsCiAgICAgICAgICBoZWlnaHQ6IHN0CiAgICAgICAgfSk7CiAgICAgIGVsc2UgewogICAgICAgIGxldCBtID0gMSAvIDAsIGIgPSAtMSAvIDAsIFAgPSAxIC8gMCwgTiA9IC0xIC8gMDsKICAgICAgICBmb3IgKGNvbnN0IGogb2YgTykKICAgICAgICAgIG0gPSBNYXRoLm1pbihtLCBqLngpLCBiID0gTWF0aC5tYXgoYiwgai54ICsgai53aWR0aCksIFAgPSBNYXRoLm1pbihQLCBqLnkpLCBOID0gTWF0aC5tYXgoTiwgai55ICsgai5oZWlnaHQpOwogICAgICAgIGNvbnN0IEQgPSBNYXRoLm1heChiIC0gbSArIF8gKiAyLCAkKSwgdiA9IE4gLSBQICsgVyArIFIgKiAyLCBDID0gbSAtIF8sIFQgPSBQIC0gVyAtIFI7CiAgICAgICAgblt1XSA9IHsgaWQ6IHUsIHg6IEMsIHk6IFQsIHdpZHRoOiBELCBoZWlnaHQ6IHYgfTsKICAgICAgfQogICAgfQogICAgbGV0IFUgPSAxIC8gMCwgTCA9IDEgLyAwOwogICAgZm9yIChjb25zdCB1IG9mIFsuLi5PYmplY3QudmFsdWVzKGwpLCAuLi5PYmplY3QudmFsdWVzKG4pXSkKICAgICAgVSA9IE1hdGgubWluKFUsIHUueCksIEwgPSBNYXRoLm1pbihMLCB1LnkpOwogICAgY29uc3QgQiA9IDYwLCBaID0gVSA8IEIgPyBCIC0gVSA6IDAsIHogPSBMIDwgQiA/IEIgLSBMIDogMDsKICAgIGlmIChaICE9PSAwIHx8IHogIT09IDApIHsKICAgICAgZm9yIChjb25zdCB1IG9mIE9iamVjdC52YWx1ZXMobCkpCiAgICAgICAgdS54ICs9IFosIHUueSArPSB6OwogICAgICBmb3IgKGNvbnN0IHUgb2YgT2JqZWN0LnZhbHVlcyhuKSkKICAgICAgICB1LnggKz0gWiwgdS55ICs9IHo7CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIGYsIGMpIHsKICAgIHZhciBkLCBoOwogICAgY29uc3QgdCA9IChsKSA9PiBmW2xdIHx8IGNbbF07CiAgICBmb3IgKGNvbnN0IGwgb2YgT2JqZWN0LnZhbHVlcyhlLmVkZ2VzKSkgewogICAgICBjb25zdCBuID0gdChsLnNvdXJjZUlkKSwgcyA9IHQobC50YXJnZXRJZCk7CiAgICAgIGlmICghbiB8fCAhcykgY29udGludWU7CiAgICAgIGNvbnN0IHkgPSBlLm5vZGVzW2wuc291cmNlSWRdIHx8IGUuY29udGFpbmVyc1tsLnNvdXJjZUlkXSwgaSA9IGUubm9kZXNbbC50YXJnZXRJZF0gfHwgZS5jb250YWluZXJzW2wudGFyZ2V0SWRdLCByID0gcy54ICsgcy53aWR0aCAvIDIgLSAobi54ICsgbi53aWR0aCAvIDIpLCBwID0gcy55ICsgcy5oZWlnaHQgLyAyIC0gKG4ueSArIG4uaGVpZ2h0IC8gMiksIGcgPSBNYXRoLmFicyhyKSA+IE1hdGguYWJzKHApICogMS4yNSwgYSA9IChkID0geSA9PSBudWxsID8gdm9pZCAwIDogeS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGQuZmluZCgobykgPT4gby5pZCA9PT0gbC5zb3VyY2VQb3J0SWQpOwogICAgICBhICYmICghYS5zaWRlIHx8IGEuc2lkZSA9PT0gImF1dG8iKSAmJiAoZyA/IGEuc2lkZSA9IHIgPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiBhLnNpZGUgPSBwID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgdyA9IChoID0gaSA9PSBudWxsID8gdm9pZCAwIDogaS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGguZmluZCgobykgPT4gby5pZCA9PT0gbC50YXJnZXRQb3J0SWQpOwogICAgICB3ICYmICghdy5zaWRlIHx8IHcuc2lkZSA9PT0gImF1dG8iKSAmJiAoZyA/IHcuc2lkZSA9IHIgPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiB3LnNpZGUgPSBwID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhlKSB7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYyA9ICh0KSA9PiB7CiAgICAgIHZhciBsOwogICAgICBpZiAoZi5oYXModCkpIHJldHVybiBmLmdldCh0KTsKICAgICAgY29uc3QgZCA9IChsID0gZS5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogbC5wYXJlbnRJZDsKICAgICAgaWYgKCFkIHx8ICFlLmNvbnRhaW5lcnNbZF0pCiAgICAgICAgcmV0dXJuIGYuc2V0KHQsIDApLCAwOwogICAgICBjb25zdCBoID0gMSArIGMoZCk7CiAgICAgIHJldHVybiBmLnNldCh0LCBoKSwgaDsKICAgIH07CiAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmtleXMoZS5jb250YWluZXJzKSkKICAgICAgYyh0KTsKICAgIHJldHVybiBmOwogIH0KfQpmdW5jdGlvbiBvdChYLCBlLCBmKSB7CiAgdmFyIGQsIGg7CiAgbGV0IGMgPSBYLCB0ID0gbnVsbDsKICBmb3IgKDsgYzsgKQogICAgZi5oYXMoYykgJiYgKHQgPSBjKSwgYyA9ICgoZCA9IGUubm9kZXNbY10pID09IG51bGwgPyB2b2lkIDAgOiBkLnBhcmVudElkKSA/PyAoKGggPSBlLmNvbnRhaW5lcnNbY10pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIHQgPz8gWDsKfQpjbGFzcyBkdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBmLCBjKSB7CiAgICBjb25zdCB0ID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCBkID0gT2JqZWN0LnZhbHVlcyhlLm5vZGVzKSwgaCA9IG5ldyBTZXQoCiAgICAgIHQuZmlsdGVyKChnKSA9PiAhIWcuY29sbGFwc2VkKS5tYXAoKGcpID0+IGcuaWQpCiAgICApLCBsID0gKGcpID0+IHsKICAgICAgdmFyIHc7CiAgICAgIGxldCBhID0gZzsKICAgICAgZm9yICg7IGE7ICkgewogICAgICAgIGlmIChoLmhhcyhhKSkgcmV0dXJuICEwOwogICAgICAgIGEgPSAodyA9IGUuY29udGFpbmVyc1thXSkgPT0gbnVsbCA/IHZvaWQgMCA6IHcucGFyZW50SWQ7CiAgICAgIH0KICAgICAgcmV0dXJuICExOwogICAgfSwgbiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IFtnLCBhXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkKICAgICAgbChhLnBhcmVudElkKSB8fCBuLmFkZChnKTsKICAgIGZvciAoY29uc3QgW2csIGFdIG9mIE9iamVjdC5lbnRyaWVzKGUuY29udGFpbmVycykpCiAgICAgIGEuY29sbGFwc2VkID8gbChhLnBhcmVudElkKSB8fCBuLmFkZChnKSA6ICEoZC5zb21lKChvKSA9PiBvLnBhcmVudElkID09PSBnKSB8fCB0LnNvbWUoKG8pID0+IG8ucGFyZW50SWQgPT09IGcpKSAmJiAhbChhLnBhcmVudElkKSAmJiBuLmFkZChnKTsKICAgIGNvbnN0IHMgPSB7fTsKICAgIGZvciAoY29uc3QgW2csIGFdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHcgPSBvdChhLnNvdXJjZUlkLCBlLCBoKSwgbyA9IG90KGEudGFyZ2V0SWQsIGUsIGgpOwogICAgICB3ICE9PSBvICYmIG4uaGFzKHcpICYmIG4uaGFzKG8pICYmIChzW2ddID0gewogICAgICAgIC4uLmEsCiAgICAgICAgc291cmNlSWQ6IHcsCiAgICAgICAgdGFyZ2V0SWQ6IG8KICAgICAgfSk7CiAgICB9CiAgICBjb25zdCB5ID0gewogICAgICAuLi5lLAogICAgICBlZGdlczogcwogICAgfSwgaSA9IGN0LmRlY291cGxlKHksIG4pLCByID0gaXQuYXNzaWduTGF5ZXJzKGkuYWxsRW50aXR5SWRzLCBpLmFkakxpc3QpLCBwID0gRy5taW5pbWl6ZUNyb3NzaW5ncyhyLCBpLmFkakxpc3QsIDQsIHkpOwogICAgcmV0dXJuIFkuYXNzaWduQ29vcmRpbmF0ZXMoeSwgcCwgZiwgYyk7CiAgfQp9CmNvbnN0IGh0ID0gbmV3IGR0KCk7CnNlbGYub25tZXNzYWdlID0gYXN5bmMgKFgpID0+IHsKICBjb25zdCB7IGlkOiBlLCBncmFwaDogZiwgbWVhc3VyZW1lbnRzOiBjLCBvcHRpb25zOiB0IH0gPSBYLmRhdGE7CiAgdHJ5IHsKICAgIGNvbnN0IGQgPSBuZXcgTWFwKGMpLCBoID0gYXdhaXQgaHQuZXhlY3V0ZShmLCBkLCB0KTsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITAsIGxheW91dDogaCB9KTsKICB9IGNhdGNoIChkKSB7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IGUsIHN1Y2Nlc3M6ICExLCBlcnJvcjogZC5tZXNzYWdlIH0pOwogIH0KfTsK", he = (r) => Uint8Array.from(atob(r), (g) => g.charCodeAt(0)), Mt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", he(Rt)], { type: "text/javascript;charset=utf-8" });
function ye(r) {
  let g;
  try {
    if (g = Mt && (self.URL || self.webkitURL).createObjectURL(Mt), !g) throw "";
    const o = new Worker(g, {
      type: "module",
      name: r == null ? void 0 : r.name
    });
    return o.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(g);
    }), o;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Rt,
      {
        type: "module",
        name: r == null ? void 0 : r.name
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
          const { id: o, success: d, layout: I, error: s } = g.data, C = this.pendingRequests.get(o);
          C && (this.pendingRequests.delete(o), d ? C.resolve(I) : C.reject(new Error(s)));
        }, this.worker.onerror = (g) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", g);
        };
      } catch (g) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", g), this.worker = null;
      }
  }
  execute(g, o, d) {
    return this.worker ? new Promise((I, s) => {
      const C = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(C, { resolve: I, reject: s });
      const a = Array.from(o.entries());
      this.worker.postMessage({
        id: C,
        graph: g,
        measurements: a,
        options: d
      });
    }) : this.fallbackEngine.execute(g, o, d);
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
    const { draggedEntity: o, hoveredEntity: d, graph: I } = g;
    return d && d.id === o.id ? null : d && I.containers[d.id] ? o.parentId === d.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: o.id,
        newParentId: d.id
      }
    } : !d && o.parentId !== null && o.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: o.id,
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
    const { draggedEntity: o, hoveredEdge: d, hoveredEntity: I, cursorWorld: s, startWorldPos: C, graph: a } = g;
    if (I && a.containers[I.id])
      return I.id !== o.id && o.parentId !== I.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: o.id,
          newParentId: I.id
        }
      } : null;
    if (!I && !d) {
      const c = Object.values(a.edges).filter(
        (A) => A.targetId === o.id
      ), h = Object.values(a.edges).filter(
        (A) => A.sourceId === o.id
      );
      if (c.length === 1 && h.length === 1 && c[0].sourceId !== h[0].targetId && Math.hypot(
        s.x - C.x,
        s.y - C.y
      ) >= this.dragOffThreshold)
        return {
          type: "NODE_EXTRACT",
          payload: {
            nodeId: o.id,
            incomingEdgeId: c[0].id,
            outgoingEdgeId: h[0].id
          }
        };
      if (o.parentId !== null && o.parentId !== void 0)
        return {
          type: "ENTITY_REPARENT",
          payload: {
            entityId: o.id,
            newParentId: null
          }
        };
    }
    const i = (c) => {
      const h = a.nodes[c.id] || c;
      if (!h.ports || h.ports.length === 0) return "";
      const A = Object.values(a.edges).find((B) => B.targetId === c.id);
      if (A) {
        const B = h.ports.find((n) => n.id === A.targetPortId);
        if (B) return B.id;
      }
      const f = new Set(
        Object.values(a.edges).filter((B) => B.sourceId === c.id).map((B) => B.sourcePortId)
      ), b = h.ports.find((B) => !f.has(B.id));
      return b ? b.id : h.ports[0].id;
    };
    if (d)
      return d.sourceId === o.id || d.targetId === o.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: d.id,
          newSourceId: d.sourceId,
          newTargetId: o.id,
          newTargetPortId: i(o)
        }
      };
    if (I && I.id !== o.id && a.nodes[I.id]) {
      const c = Object.values(a.edges).find(
        (h) => h.targetId === I.id && h.sourceId !== o.id
      );
      if (c)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: c.id,
            newSourceId: c.sourceId,
            newTargetId: o.id,
            newTargetPortId: i(o)
          }
        };
    }
    return null;
  }
}
function we(r, g = { min: 0.15, max: 3 }) {
  const [o, d] = et({ x: 80, y: 80, zoom: 1 }), I = Ct(!1), s = Ct({ x: 0, y: 0 }), C = M(
    (n, t) => {
      if (!r.current) return { x: n, y: t };
      const e = r.current.getBoundingClientRect();
      return {
        x: (n - e.left - o.x) / o.zoom,
        y: (t - e.top - o.y) / o.zoom
      };
    },
    [o, r]
  ), a = M(
    (n) => {
      if (!r.current) return;
      const t = [
        ...Object.values(n.nodes),
        ...Object.values(n.containers)
      ];
      if (t.length === 0) {
        d({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let e = 1 / 0, l = 1 / 0, m = -1 / 0, w = -1 / 0;
      for (const Q of t)
        e = Math.min(e, Q.x), l = Math.min(l, Q.y), m = Math.max(m, Q.x + Q.width), w = Math.max(w, Q.y + Q.height);
      const u = r.current.getBoundingClientRect(), p = 80, G = Math.max(m - e, 100), v = Math.max(w - l, 100), T = (u.width - p * 2) / G, Z = (u.height - p * 2) / v, P = Math.min(
        Math.max(Math.min(T, Z), g.min),
        Math.min(g.max, 1.25)
      ), W = (u.width - G * P) / 2 - e * P, V = (u.height - v * P) / 2 - l * P;
      d({
        x: W,
        y: V,
        zoom: P
      });
    },
    [r, g]
  ), i = M(
    (n) => {
      if (n.preventDefault(), !!r.current)
        if (n.ctrlKey || n.metaKey) {
          const t = r.current.getBoundingClientRect(), e = n.clientX - t.left, l = n.clientY - t.top, m = n.deltaY < 0 ? 1.08 : 0.92, w = Math.min(Math.max(o.zoom * m, g.min), g.max), u = e - (e - o.x) * (w / o.zoom), p = l - (l - o.y) * (w / o.zoom);
          d({ x: u, y: p, zoom: w });
        } else
          d((t) => ({
            ...t,
            x: t.x - n.deltaX,
            y: t.y - n.deltaY
          }));
    },
    [o, g, r]
  ), c = M(
    (n, t) => {
      I.current = !0, s.current = { x: n - o.x, y: t - o.y };
    },
    [o]
  ), h = M((n, t) => {
    I.current && d((e) => ({
      ...e,
      x: n - s.current.x,
      y: t - s.current.y
    }));
  }, []), A = M(() => {
    I.current = !1;
  }, []), f = M(() => {
    d({ x: 80, y: 80, zoom: 1 });
  }, []), b = M(() => {
    d((n) => ({
      ...n,
      zoom: Math.min(n.zoom * 1.2, g.max)
    }));
  }, [g]), B = M(() => {
    d((n) => ({
      ...n,
      zoom: Math.max(n.zoom / 1.2, g.min)
    }));
  }, [g]);
  return {
    transform: o,
    setTransform: d,
    screenToWorld: C,
    onWheel: i,
    startPan: c,
    updatePan: h,
    endPan: A,
    resetTransform: f,
    zoomIn: b,
    zoomOut: B,
    zoomToFit: a,
    isPanning: I
  };
}
function be(r) {
  const [g, o] = et(
    /* @__PURE__ */ new Map()
  );
  Ct(/* @__PURE__ */ new Map());
  const d = Ct(/* @__PURE__ */ new Map()), I = M((s, C) => {
    C ? d.current.set(s, C) : d.current.delete(s);
  }, []);
  return Dt(() => {
    const s = new ResizeObserver((C) => {
      let a = !1;
      const i = new Map(g);
      for (const c of C) {
        const h = c.target.getAttribute("data-sysflow-measure-id");
        if (!h) continue;
        const A = Math.ceil(c.contentRect.width), f = Math.ceil(c.contentRect.height), b = i.get(h);
        (!b || b.width !== A || b.height !== f) && (i.set(h, { width: A, height: f }), a = !0);
      }
      a && o(i);
    });
    return d.current.forEach((C) => s.observe(C)), () => {
      s.disconnect();
    };
  }, [r]), { measurements: g, registerMeasureElement: I };
}
function me(r, g, o, d, I) {
  const [s, C] = et(null), [a, i] = et(null), c = Ct(null), h = Ct(null), A = M(
    (t, e) => {
      let l = null, m = 1 / 0;
      for (const [w, u] of Object.entries(g.containers))
        if (w !== e && t.x >= u.x && t.x <= u.x + u.width && t.y >= u.y && t.y <= u.y + u.height) {
          const p = u.width * u.height;
          p < m && (m = p, l = r.containers[w] || null);
        }
      if (l) return l;
      for (const [w, u] of Object.entries(g.nodes))
        if (w !== e && t.x >= u.x && t.x <= u.x + u.width && t.y >= u.y && t.y <= u.y + u.height)
          return r.nodes[w] || null;
      return null;
    },
    [g, r]
  ), f = M(
    (t, e) => {
      let l = null, m = 45;
      for (const w of Object.values(r.edges)) {
        if (w.sourceId === e || w.targetId === e) continue;
        const u = g.nodes[w.sourceId] || g.containers[w.sourceId], p = g.nodes[w.targetId] || g.containers[w.targetId];
        if (!u || !p) continue;
        const G = u.x + u.width, v = u.y + u.height / 2, T = p.x, Z = p.y + p.height / 2;
        for (let P = 0; P <= 10; P++) {
          const W = P / 10, V = (1 - W) * G + W * T, Q = (1 - W) * v + W * Z, K = Math.hypot(t.x - V, t.y - Q);
          K < m && (m = K, l = w);
        }
      }
      return l;
    },
    [g, r]
  ), b = M(
    (t, e) => {
      if (e.stopPropagation(), o.canDrag && !o.canDrag(t, r))
        return;
      const l = d(e.clientX, e.clientY);
      C({
        draggedEntity: t,
        ghostPosition: l,
        startPosition: l
      });
    },
    [r, o, d]
  ), B = M(
    (t) => {
      if (!s) return;
      const e = d(t.clientX, t.clientY), l = A(e, s.draggedEntity.id), m = f(e, s.draggedEntity.id);
      c.current = l, h.current = m, l && r.containers[l.id] ? i(l.id) : i(null);
      const w = o.onDragMove ? o.onDragMove({
        draggedEntity: s.draggedEntity,
        cursorWorld: e,
        startWorldPos: s.startPosition,
        hoveredEntity: l,
        hoveredEdge: m,
        graph: r,
        layout: g
      }) : e;
      w && C((u) => u ? { ...u, ghostPosition: w } : null);
    },
    [s, d, o, r, g, A, f]
  ), n = M(
    (t) => {
      if (!s) return;
      const e = d(t.clientX, t.clientY), l = A(e, s.draggedEntity.id), m = f(e, s.draggedEntity.id), w = o.onDragEnd({
        draggedEntity: s.draggedEntity,
        cursorWorld: e,
        startWorldPos: s.startPosition,
        hoveredEntity: l,
        hoveredEdge: m,
        graph: r,
        layout: g
      });
      w && I(w), C(null), i(null), c.current = null, h.current = null;
    },
    [s, d, o, r, g, A, f, I]
  );
  return {
    dragState: s,
    hoveredContainerId: a,
    handlePointerDown: b,
    handlePointerMove: B,
    handlePointerUp: n
  };
}
function Ee(r) {
  const [g, o] = et({
    history: [r],
    index: 0
  }), [d, I] = et(null), s = g.history[g.index] ?? g.history[0] ?? r, C = M((n) => {
    const t = Wt(n);
    o((e) => {
      const l = e.history.slice(0, e.index + 1);
      return {
        history: [...l, t],
        index: l.length
      };
    });
  }, []), a = M((n) => {
    const t = Wt(n);
    o({
      history: [t],
      index: 0
    });
  }, []), i = M(() => {
    o((n) => ({
      ...n,
      index: Math.max(0, n.index - 1)
    }));
  }, []), c = M(() => {
    o((n) => ({
      ...n,
      index: Math.min(n.history.length - 1, n.index + 1)
    }));
  }, []), h = M(
    (n) => {
      var e, l, m, w;
      const t = s;
      if (n.type === "ENTITY_REPARENT") {
        const { entityId: u, newParentId: p } = n.payload, G = {
          ...t,
          nodes: { ...t.nodes },
          containers: { ...t.containers }
        };
        G.nodes[u] ? G.nodes[u] = { ...G.nodes[u], parentId: p } : G.containers[u] && (G.containers[u] = { ...G.containers[u], parentId: p }), C(G);
      } else if (n.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: u, direction: p, suggestedNewNodeId: G, suggestedNewEdge1Id: v, suggestedNewEdge2Id: T } = n.payload, Z = t.edges[u.id];
        if (!Z) return;
        const P = p === "BT", W = p === "TB", V = `p_in_${Date.now()}`, Q = `p_out_${Date.now()}`;
        let K = "left", k = "right";
        P ? (K = "bottom", k = "top") : W ? (K = "top", k = "bottom") : p === "RL" && (K = "right", k = "left");
        const y = t.nodes[Z.sourceId], H = {
          id: G,
          label: `Node ${Object.keys(t.nodes).length + 1}`,
          type: (y == null ? void 0 : y.type) || "FlowTask",
          parentId: (y == null ? void 0 : y.parentId) ?? null,
          ports: [
            { id: V, label: "in", side: K },
            { id: Q, label: "out", side: k }
          ]
        }, Y = {
          id: v,
          sourceId: Z.sourceId,
          sourcePortId: Z.sourcePortId,
          targetId: G,
          targetPortId: V
        }, L = {
          id: T,
          sourceId: G,
          sourcePortId: Q,
          targetId: Z.targetId,
          targetPortId: Z.targetPortId
        }, F = { ...t.edges };
        delete F[Z.id], F[v] = Y, F[T] = L, C({
          ...t,
          nodes: { ...t.nodes, [G]: H },
          edges: F
        });
      } else if (n.type === "NODE_EXTRACT") {
        const { incomingEdgeId: u, outgoingEdgeId: p } = n.payload, G = t.edges[u], v = t.edges[p];
        if (!G || !v) return;
        const T = { ...t.edges };
        T[u] = {
          ...G,
          targetId: v.targetId,
          targetPortId: v.targetPortId
        }, delete T[p], C({
          ...t,
          edges: T
        });
      } else if (n.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: u, position: p, direction: G, suggestedNewNodeId: v, suggestedNewEdgeId: T } = n.payload, Z = G === "BT", P = `p_in_${Date.now()}`, W = `p_out_${Date.now()}`, V = {
          id: v,
          label: `Node ${Object.keys(t.nodes).length + 1}`,
          type: u.type,
          ports: [
            { id: P, label: "in", side: Z ? "bottom" : "top" },
            { id: W, label: "out", side: Z ? "top" : "bottom" }
          ]
        }, Q = u.ports.find((H) => H.label === "in") || u.ports[0], K = u.ports.find((H) => H.label === "out") || u.ports[u.ports.length - 1];
        let k;
        Z && p === "bottom" || !Z && p === "top" ? k = {
          id: T,
          sourceId: v,
          sourcePortId: W,
          targetId: u.id,
          targetPortId: (Q == null ? void 0 : Q.id) || "in"
        } : k = {
          id: T,
          sourceId: u.id,
          sourcePortId: (K == null ? void 0 : K.id) || "out",
          targetId: v,
          targetPortId: P
        }, C({
          ...t,
          nodes: { ...t.nodes, [v]: V },
          edges: { ...t.edges, [T]: k }
        });
      } else if (n.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: u, collapsed: p } = n.payload;
        t.containers[u] && C({
          ...t,
          containers: {
            ...t.containers,
            [u]: { ...t.containers[u], collapsed: p }
          }
        });
      } else if (n.type === "EDGE_CREATE") {
        const u = n.payload.id || `E_${Date.now()}`;
        C({
          ...t,
          edges: {
            ...t.edges,
            [u]: { id: u, ...n.payload.edge }
          }
        });
      } else if (n.type === "EDGE_DELETE") {
        const u = { ...t.edges };
        delete u[n.payload.edgeId], C({ ...t, edges: u });
      } else if (n.type === "EDGE_REWIRE") {
        const { edgeId: u, newTargetId: p } = n.payload;
        if (!p || !t.edges[u]) return;
        const G = p, v = t.edges[u], T = v.targetId, Z = Object.values(t.edges).find((k) => k.targetId === G), P = Object.values(t.edges).find((k) => k.sourceId === G), W = { ...t.edges };
        Z && P && (W[Z.id] = {
          ...Z,
          targetId: P.targetId,
          targetPortId: P.targetPortId
        }, delete W[P.id]);
        const V = ((l = (e = t.nodes[G]) == null ? void 0 : e.ports[0]) == null ? void 0 : l.id) || "p_in", Q = ((w = (m = t.nodes[G]) == null ? void 0 : m.ports.find((k) => k.id !== V)) == null ? void 0 : w.id) || V;
        W[u] = {
          ...v,
          targetId: G,
          targetPortId: V
        };
        const K = `REWIRE_${Date.now()}`;
        W[K] = {
          id: K,
          sourceId: G,
          sourcePortId: Q,
          targetId: T,
          targetPortId: v.targetPortId
        }, C({ ...t, edges: W });
      }
    },
    [s, C]
  ), A = M(
    (n) => {
      const t = s.nodes[n] || s.containers[n];
      t && I({ entity: JSON.parse(JSON.stringify(t)), isCut: !1 });
    },
    [s]
  ), f = M(
    (n) => {
      const t = s.nodes[n] || s.containers[n];
      if (t) {
        I({ entity: JSON.parse(JSON.stringify(t)), isCut: !0 });
        const e = { ...s.nodes }, l = { ...s.containers };
        delete e[n], delete l[n], C({ ...s, nodes: e, containers: l });
      }
    },
    [s, C]
  ), b = M(() => {
    if (!d) return;
    const n = d.entity, t = `${n.id}_copy_${Date.now().toString().slice(-4)}`, e = { ...n, id: t, label: `${n.label} (Copy)` };
    "collapsed" in e ? C({
      ...s,
      containers: { ...s.containers, [t]: e }
    }) : C({
      ...s,
      nodes: { ...s.nodes, [t]: e }
    });
  }, [d, s, C]), B = M(
    (n) => {
      if (n.length === 0) return;
      const t = { ...s.nodes }, e = { ...s.containers }, l = { ...s.edges };
      for (const m of n)
        delete t[m], delete e[m], delete l[m];
      C({
        ...s,
        nodes: t,
        containers: e,
        edges: l
      });
    },
    [s, C]
  );
  return {
    graph: s,
    setGraphDirect: a,
    applyAction: h,
    undo: i,
    redo: c,
    copyEntity: A,
    cutEntity: f,
    pasteEntity: b,
    deleteSelection: B,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Ge = ({
  graph: r,
  registerMeasureElement: g,
  nodeTypes: o,
  containerTypes: d
}) => {
  const I = Object.values(r.nodes), s = Object.values(r.containers);
  return /* @__PURE__ */ $("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((C) => {
      const a = C.type ? o == null ? void 0 : o[C.type] : null;
      return /* @__PURE__ */ D(
        "div",
        {
          ref: (i) => g(C.id, i),
          "data-sysflow-measure-id": C.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: a ? /* @__PURE__ */ D(a, { node: C, selected: !1 }) : /* @__PURE__ */ $("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ D("div", { style: { fontWeight: 600 }, children: C.label }),
            C.ports.length > 0 && /* @__PURE__ */ $("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              C.ports.map((i) => i.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${C.id}`
      );
    }),
    s.map((C) => {
      const a = C.type ? d == null ? void 0 : d[C.type] : null;
      return /* @__PURE__ */ D(
        "div",
        {
          ref: (i) => g(C.id, i),
          "data-sysflow-measure-id": C.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: a ? /* @__PURE__ */ D(a, { container: C, selected: !1 }) : /* @__PURE__ */ D("div", { className: "sysflow-container-header", children: C.label })
        },
        `measure-container-${C.id}`
      );
    })
  ] });
}, Ke = ({
  graph: r,
  layout: g,
  selectedIds: o,
  direction: d = "TB",
  showArrows: I = !0,
  routing: s = "auto",
  portOptions: C,
  enableEdgeQuickAdd: a = !0,
  onEdgeClick: i,
  onInsertNodeOnEdge: c
}) => {
  const [h, A] = et(null), f = s === "step" || s === "auto" && (d === "LR" || d === "RL"), b = (t, e, l) => {
    var V, Q, K, k;
    let m = t, w = null;
    for ((V = r.containers[t]) != null && V.collapsed && (w = r.containers[t]); m; ) {
      const y = ((Q = r.nodes[m]) == null ? void 0 : Q.parentId) ?? ((K = r.containers[m]) == null ? void 0 : K.parentId) ?? null;
      y && ((k = r.containers[y]) != null && k.collapsed) && (w = r.containers[y]), m = y;
    }
    if (w) {
      const y = g.containers[w.id];
      if (!y)
        return { x: 0, y: 0, side: l ? "right" : "left", valid: !1, entityId: w.id };
      let H, Y, L;
      return d === "TB" ? (H = l ? "bottom" : "top", Y = y.x + y.width / 2, L = l ? y.y + y.height : y.y) : d === "BT" ? (H = l ? "top" : "bottom", Y = y.x + y.width / 2, L = l ? y.y : y.y + y.height) : d === "RL" ? (H = l ? "left" : "right", Y = l ? y.x : y.x + y.width, L = y.y + y.height / 2) : (H = l ? "right" : "left", Y = l ? y.x + y.width : y.x, L = y.y + y.height / 2), { x: Y, y: L, side: H, valid: !0, entityId: w.id };
    }
    if (!!r.containers[t]) {
      const y = g.containers[t];
      if (!y) return { x: 0, y: 0, side: l ? "right" : "left", valid: !1, entityId: t };
      let H, Y, L;
      return d === "TB" ? (H = y.x + y.width / 2, Y = l ? y.y + y.height : y.y, L = l ? "bottom" : "top") : d === "BT" ? (H = y.x + y.width / 2, Y = l ? y.y : y.y + y.height, L = l ? "top" : "bottom") : d === "RL" ? (H = l ? y.x : y.x + y.width, Y = y.y + y.height / 2, L = l ? "left" : "right") : (H = l ? y.x + y.width : y.x, Y = y.y + y.height / 2, L = l ? "right" : "left"), { x: H, y: Y, side: L, valid: !0, entityId: t };
    }
    const p = r.nodes[t], G = g.nodes[t];
    if (!p || !G)
      return { x: 0, y: 0, side: l ? "right" : "left", valid: !1, entityId: t };
    const T = Nt(
      p,
      G,
      d,
      r.edges,
      C
    ).get(e);
    if (T)
      return { x: T.worldX, y: T.worldY, side: T.side, valid: !0, entityId: t };
    let Z, P, W;
    return d === "TB" ? (Z = G.x + G.width / 2, P = l ? G.y + G.height : G.y, W = l ? "bottom" : "top") : d === "BT" ? (Z = G.x + G.width / 2, P = l ? G.y : G.y + G.height, W = l ? "top" : "bottom") : d === "RL" ? (Z = l ? G.x : G.x + G.width, P = G.y + G.height / 2, W = l ? "left" : "right") : (Z = l ? G.x + G.width : G.x, P = G.y + G.height / 2, W = l ? "right" : "left"), { x: Z, y: P, side: W, valid: !0, entityId: t };
  }, B = (t, e) => {
    const l = (t.x + e.x) / 2, m = (t.y + e.y) / 2;
    if (t.side === "right" && e.side === "left") {
      if (e.x >= t.x + 20)
        return {
          pathStr: `M ${t.x} ${t.y} L ${l} ${t.y} L ${l} ${e.y} L ${e.x} ${e.y}`,
          center: { x: l, y: m }
        };
      {
        const w = e.y >= t.y ? t.y - 40 : t.y + 40;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x + 20} ${t.y} L ${t.x + 20} ${w} L ${e.x - 20} ${w} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: l, y: w }
        };
      }
    }
    if (t.side === "left" && e.side === "right") {
      if (e.x <= t.x - 20)
        return {
          pathStr: `M ${t.x} ${t.y} L ${l} ${t.y} L ${l} ${e.y} L ${e.x} ${e.y}`,
          center: { x: l, y: m }
        };
      {
        const w = e.y >= t.y ? t.y - 40 : t.y + 40;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x - 20} ${t.y} L ${t.x - 20} ${w} L ${e.x + 20} ${w} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: l, y: w }
        };
      }
    }
    if (t.side === "bottom" && e.side === "top") {
      if (e.y >= t.y + 16)
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${m} L ${e.x} ${m} L ${e.x} ${e.y}`,
          center: { x: l, y: m }
        };
      {
        const w = e.x >= t.x ? t.x + 50 : t.x - 50;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${w} ${t.y + 20} L ${w} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`,
          center: { x: w, y: m }
        };
      }
    }
    if (t.side === "top" && e.side === "bottom") {
      if (e.y <= t.y - 16)
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${m} L ${e.x} ${m} L ${e.x} ${e.y}`,
          center: { x: l, y: m }
        };
      {
        const w = e.x >= t.x ? t.x + 50 : t.x - 50;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${t.y - 20} L ${w} ${t.y - 20} L ${w} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`,
          center: { x: w, y: m }
        };
      }
    }
    return {
      pathStr: `M ${t.x} ${t.y} L ${l} ${t.y} L ${l} ${e.y} L ${e.x} ${e.y}`,
      center: { x: l, y: m }
    };
  }, n = (t, e) => {
    const l = e.x - t.x, m = e.y - t.y;
    let w = t.x, u = t.y, p = e.x, G = e.y;
    if (t.side === "bottom" && e.side === "top")
      if (m > 0) {
        const Z = Math.min(28, m * 0.4);
        u = t.y + Math.max(Z, m * 0.5), G = e.y - Math.max(Z, m * 0.5);
      } else {
        const Z = l >= 0 ? 1 : -1, P = Math.max(40, Math.abs(l) * 0.2);
        w = t.x + P * Z, u = t.y + 40, p = e.x + P * Z, G = e.y - 40;
      }
    else if (t.side === "top" && e.side === "bottom")
      if (m < 0) {
        const Z = Math.min(28, Math.abs(m) * 0.4);
        u = t.y - Math.max(Z, Math.abs(m) * 0.5), G = e.y + Math.max(Z, Math.abs(m) * 0.5);
      } else {
        const Z = l >= 0 ? 1 : -1, P = Math.max(40, Math.abs(l) * 0.2);
        w = t.x + P * Z, u = t.y - 40, p = e.x + P * Z, G = e.y + 40;
      }
    else if (t.side === "right" && e.side === "left")
      l > 0 ? (w = t.x + l * 0.5, p = e.x - l * 0.5) : (w = t.x + 50, u = t.y - 50, p = e.x - 50, G = e.y - 50);
    else if (t.side === "left" && e.side === "right")
      l < 0 ? (w = t.x + l * 0.5, p = e.x - l * 0.5) : (w = t.x - 50, u = t.y - 50, p = e.x + 50, G = e.y - 50);
    else {
      const Z = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, P = Z[t.side] || { x: 0, y: 1 }, W = Z[e.side] || { x: 0, y: -1 }, V = Math.min(60, Math.hypot(l, m) * 0.35);
      w = t.x + P.x * V, u = t.y + P.y * V, p = e.x + W.x * V, G = e.y + W.y * V;
    }
    const v = 0.125 * t.x + 0.375 * w + 0.375 * p + 0.125 * e.x, T = 0.125 * t.y + 0.375 * u + 0.375 * G + 0.125 * e.y;
    return {
      pathStr: `M ${t.x} ${t.y} C ${w} ${u} ${p} ${G} ${e.x} ${e.y}`,
      center: { x: v, y: T }
    };
  };
  return /* @__PURE__ */ $("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ $("defs", { children: [
      /* @__PURE__ */ D(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ D("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ D(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ D("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(r.edges).map((t) => {
      const e = b(t.sourceId, t.sourcePortId, !0), l = b(t.targetId, t.targetPortId, !1);
      if (!e.valid || !l.valid || e.entityId === l.entityId) return null;
      const m = o.includes(t.id), w = h === t.id, { pathStr: u, center: p } = f ? B(e, l) : n(e, l);
      return /* @__PURE__ */ $(
        "g",
        {
          onMouseEnter: () => A(t.id),
          onMouseLeave: () => A(null),
          children: [
            /* @__PURE__ */ D(
              "path",
              {
                d: u,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (G) => {
                  G.stopPropagation(), i == null || i(t.id);
                }
              }
            ),
            /* @__PURE__ */ D(
              "path",
              {
                d: u,
                fill: "none",
                stroke: m ? "var(--sysflow-edge-selected)" : w ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: m ? 2.5 : w ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: I ? m ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            a && w && c && /* @__PURE__ */ D("g", { transform: `translate(${p.x}, ${p.y})`, children: /* @__PURE__ */ $(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (G) => {
                  G.preventDefault(), G.stopPropagation(), c(t);
                },
                children: [
                  /* @__PURE__ */ D("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ D(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ D(
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
        t.id
      );
    })
  ] });
}, Se = ({
  entity: r,
  layout: g,
  direction: o = "LR",
  edges: d,
  portOptions: I,
  onPortPointerDown: s,
  onPortPointerUp: C
}) => {
  if (!r.ports || r.ports.length === 0)
    return null;
  const a = Nt(
    r,
    g,
    o,
    d,
    I
  );
  return /* @__PURE__ */ D(Et, { children: r.ports.map((i) => {
    const c = a.get(i.id);
    return c ? /* @__PURE__ */ D(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${c.side}`,
        style: {
          position: "absolute",
          left: `${c.localX}px`,
          top: `${c.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${i.label} (${c.side})`,
        onPointerDown: (h) => {
          h.stopPropagation(), s == null || s(r.id, i.id, !0, h);
        },
        onPointerUp: (h) => {
          h.stopPropagation(), C == null || C(r.id, i.id, !1);
        }
      },
      i.id
    ) : null;
  }) });
}, pe = ({
  node: r,
  layout: g,
  selected: o = !1,
  direction: d = "LR",
  edges: I,
  portOptions: s,
  enableQuickAdd: C = !1,
  onAddConnectedNode: a,
  onPointerDown: i,
  onMouseEnter: c,
  onMouseLeave: h,
  onClick: A,
  onPortPointerDown: f,
  onPortPointerUp: b,
  customRenderer: B
}) => {
  const [n, t] = et(!1);
  return /* @__PURE__ */ $(
    "div",
    {
      className: `sysflow-node ${o ? "sysflow-selected" : ""} ${r.className || ""}`,
      style: {
        transform: `translate(${g.x}px, ${g.y}px)`,
        width: `${g.width}px`,
        height: `${g.height}px`
      },
      onPointerDown: (e) => i == null ? void 0 : i(r, e),
      onMouseEnter: () => {
        t(!0), c == null || c(r.id);
      },
      onMouseLeave: () => {
        t(!1), h == null || h(r.id);
      },
      onClick: A,
      children: [
        C && n && /* @__PURE__ */ $(Et, { children: [
          /* @__PURE__ */ D("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ D("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        C && n && a && /* @__PURE__ */ D(
          "button",
          {
            type: "button",
            className: "sysflow-quick-add-btn sysflow-quick-add-top",
            title: "Add connected node above",
            onPointerDown: (e) => {
              e.stopPropagation();
            },
            onPointerUp: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.preventDefault(), e.stopPropagation(), a(r, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ D(
          Se,
          {
            entity: r,
            layout: g,
            direction: d,
            edges: I,
            portOptions: s,
            onPortPointerDown: f,
            onPortPointerUp: b
          }
        ),
        B ? /* @__PURE__ */ D(B, { node: r, selected: o }) : /* @__PURE__ */ $("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ D("div", { style: { fontWeight: 600, fontSize: "13px" }, children: r.label }),
          r.ports.length > 0 && /* @__PURE__ */ $("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            r.ports.length,
            " Port",
            r.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        C && n && a && /* @__PURE__ */ D(
          "button",
          {
            className: "sysflow-quick-add-btn sysflow-quick-add-bottom",
            title: "Add connected node below",
            onPointerDown: (e) => {
              e.stopPropagation();
            },
            onPointerUp: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.preventDefault(), e.stopPropagation(), a(r, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Le = ({
  container: r,
  layout: g,
  selected: o,
  isHovered: d = !1,
  hasChildren: I = !1,
  onToggleCollapse: s,
  onPointerDown: C,
  onMouseEnter: a,
  onMouseLeave: i,
  onClick: c,
  customRenderer: h
}) => /* @__PURE__ */ D(
  "div",
  {
    className: `sysflow-container ${o ? "sysflow-selected" : ""} ${d ? "sysflow-hovered" : ""} ${r.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (A) => C(r, A),
    onMouseEnter: a,
    onMouseLeave: i,
    onClick: c,
    children: h ? /* @__PURE__ */ D(h, { container: r, selected: o }) : /* @__PURE__ */ $(Et, { children: [
      /* @__PURE__ */ $("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ D("span", { className: "sysflow-container-title", title: r.label, children: r.label }),
        /* @__PURE__ */ D(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (A) => A.stopPropagation(),
            onPointerUp: (A) => A.stopPropagation(),
            onClick: (A) => {
              A.stopPropagation(), s(r.id, !r.collapsed);
            },
            children: r.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !r.collapsed && !I && /* @__PURE__ */ D("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Ze = new fe(), Ne = ({
  graph: r,
  onChange: g,
  layoutEngine: o,
  interactionStrategy: d = Ze,
  direction: I = "TB",
  layoutOptions: s,
  portPlacementMode: C,
  routing: a,
  showEdgeArrows: i = !0,
  nodeTypes: c,
  containerTypes: h,
  zoomBounds: A,
  className: f = "",
  selectedIds: b = [],
  theme: B = "dark",
  enableQuickAdd: n,
  enableEdgeQuickAdd: t
}) => {
  var Yt, vt;
  const e = Ct(null), l = Ct(null);
  !o && !l.current && (l.current = new Be());
  const m = o || l.current, {
    transform: w,
    screenToWorld: u,
    onWheel: p,
    startPan: G,
    updatePan: v,
    endPan: T,
    resetTransform: Z,
    zoomIn: P,
    zoomOut: W,
    zoomToFit: V,
    isPanning: Q
  } = we(e, A), { measurements: K, registerMeasureElement: k } = be(r), [y, H] = et({ nodes: {}, containers: {} }), Y = ie(() => ({
    direction: I,
    mode: C ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: y.nodes
  }), [I, C, y.nodes]), [L, F] = et(null), [X, j] = et(null), U = Ct(!1), {
    dragState: R,
    hoveredContainerId: _,
    handlePointerDown: it,
    handlePointerMove: dt,
    handlePointerUp: ht
  } = me(r, y, d, u, g);
  Dt(() => {
    const S = (x) => {
      if (x.target instanceof HTMLInputElement || x.target instanceof HTMLTextAreaElement)
        return;
      if (x.key === "Escape") {
        x.preventDefault(), j(null), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (x.code === "Space" && (U.current = !0), x.key.toLowerCase() === "f" && !x.ctrlKey && !x.metaKey) {
        x.preventDefault(), V(y);
        return;
      }
      if ((x.ctrlKey || x.metaKey) && x.key.toLowerCase() === "a") {
        x.preventDefault();
        const J = [
          ...Object.keys(r.nodes),
          ...Object.keys(r.containers)
        ];
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: J } });
        return;
      }
      const E = Object.keys(r.nodes);
      if (E.length !== 0) {
        if (x.key === "Tab") {
          x.preventDefault();
          const J = b.length > 0 ? E.indexOf(b[0]) : -1;
          let z;
          x.shiftKey ? z = J <= 0 ? E.length - 1 : J - 1 : z = (J + 1) % E.length, g({ type: "SELECTION_CHANGE", payload: { selectedIds: [E[z]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(x.key)) {
          x.preventDefault();
          const J = b[0] || E[0], z = y.nodes[J] || y.containers[J];
          if (!z) return;
          const gt = {
            x: z.x + z.width / 2,
            y: z.y + z.height / 2
          };
          let O = null, At = 1 / 0;
          for (const yt of E) {
            if (yt === J) continue;
            const ct = y.nodes[yt];
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
    }, N = (x) => {
      x.code === "Space" && (U.current = !1);
    };
    return window.addEventListener("keydown", S), window.addEventListener("keyup", N), () => {
      window.removeEventListener("keydown", S), window.removeEventListener("keyup", N);
    };
  }, [r, y, b, V, g]), Dt(() => {
    let S = !1, N = 16 / 9;
    if (e.current) {
      const E = e.current.getBoundingClientRect();
      E.width > 0 && E.height > 0 && (N = E.width / E.height);
    }
    const x = {
      direction: I,
      aspectRatio: N,
      ...s
    };
    return m.execute(r, K, x).then((E) => {
      S || H(E);
    }), () => {
      S = !0;
    };
  }, [r, K, m, I, s]);
  const pt = (S, N, x, E) => {
    const J = r.nodes[S] || r.containers[S], z = y.nodes[S] || y.containers[S];
    if (!J || !z) return;
    const O = Nt(
      J,
      z,
      I,
      r.edges,
      Y
    ).get(N), At = O ? { x: O.worldX, y: O.worldY } : { x: z.x + z.width, y: z.y + z.height / 2 };
    F({
      sourceId: S,
      sourcePortId: N,
      startWorldPos: At,
      currentWorldPos: u(E.clientX, E.clientY)
    });
  }, Ot = (S, N, x) => {
    var E, J, z, gt, O, At, yt, ct, bt, Bt;
    if (L && L.sourceId !== S) {
      const at = r.nodes[L.sourceId] || r.containers[L.sourceId], ot = r.nodes[S] || r.containers[S], q = (E = at == null ? void 0 : at.ports) == null ? void 0 : E.find((ft) => ft.id === L.sourcePortId), tt = (J = ot == null ? void 0 : ot.ports) == null ? void 0 : J.find((ft) => ft.id === N);
      let mt = L.sourceId, Lt = L.sourcePortId, Gt = S, Zt = N;
      const te = ((z = q == null ? void 0 : q.label) == null ? void 0 : z.toLowerCase().includes("in")) || (q == null ? void 0 : q.side) === (I === "BT" ? "bottom" : "top"), ee = ((gt = q == null ? void 0 : q.label) == null ? void 0 : gt.toLowerCase().includes("out")) || (q == null ? void 0 : q.side) === (I === "BT" ? "top" : "bottom"), ge = ((O = tt == null ? void 0 : tt.label) == null ? void 0 : O.toLowerCase().includes("in")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "bottom" : "top"), Ie = ((At = tt == null ? void 0 : tt.label) == null ? void 0 : At.toLowerCase().includes("out")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "top" : "bottom");
      if (te && Ie)
        mt = S, Lt = N, Gt = L.sourceId, Zt = L.sourcePortId;
      else if (ee && ge)
        mt = L.sourceId, Lt = L.sourcePortId, Gt = S, Zt = N;
      else if (y.nodes[L.sourceId] && y.nodes[S]) {
        const ft = y.nodes[L.sourceId], Tt = y.nodes[S], oe = I === "BT" && ft.y < Tt.y, se = I === "TB" && ft.y > Tt.y;
        if (oe || se) {
          mt = S, Gt = L.sourceId;
          const kt = r.nodes[mt], xt = r.nodes[Gt];
          Lt = ((ct = (yt = kt == null ? void 0 : kt.ports) == null ? void 0 : yt.find((Kt) => Kt.label.includes("out") || Kt.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : ct.id) || N, Zt = ((Bt = (bt = xt == null ? void 0 : xt.ports) == null ? void 0 : bt.find((Kt) => Kt.label.includes("in") || Kt.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : Bt.id) || L.sourcePortId;
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
    F(null);
  }, Ft = (S) => {
    if (S.button === 1 || U.current) {
      G(S.clientX, S.clientY);
      return;
    }
    const N = S.target, x = N === e.current || N.classList.contains("sysflow-viewport") || N.classList.contains("sysflow-dom-layer") || N.tagName.toLowerCase() === "svg";
    if (S.button === 0 && x) {
      S.currentTarget.setPointerCapture(S.pointerId);
      const E = u(S.clientX, S.clientY);
      j({
        startX: E.x,
        startY: E.y,
        currentX: E.x,
        currentY: E.y
      }), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, zt = (S) => {
    if (Q.current)
      v(S.clientX, S.clientY);
    else if (X) {
      const N = u(S.clientX, S.clientY);
      j((x) => x ? { ...x, currentX: N.x, currentY: N.y } : null);
    } else R ? dt(S) : L && F(
      (N) => N ? { ...N, currentWorldPos: u(S.clientX, S.clientY) } : null
    );
  }, jt = (S) => {
    if (S.currentTarget.hasPointerCapture(S.pointerId) && S.currentTarget.releasePointerCapture(S.pointerId), Q.current && T(), X) {
      const N = Math.min(X.startX, X.currentX), x = Math.min(X.startY, X.currentY), E = Math.max(X.startX, X.currentX), J = Math.max(X.startY, X.currentY);
      if (E - N > 4 || J - x > 4) {
        const z = [];
        for (const [gt, O] of Object.entries(y.nodes))
          O.x < E && O.x + O.width > N && O.y < J && O.y + O.height > x && z.push(gt);
        for (const [gt, O] of Object.entries(y.containers))
          O.x < E && O.x + O.width > N && O.y < J && O.y + O.height > x && z.push(gt);
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: z } });
      }
      j(null);
    }
    R && ht(S), L && F(null);
  }, Jt = n ?? (s == null ? void 0 : s.mode) === "flow", Ut = M(
    (S, N) => {
      const x = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, E = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: S,
          position: N,
          direction: I,
          suggestedNewNodeId: x,
          suggestedNewEdgeId: E
        }
      });
    },
    [I, g]
  ), $t = t ?? n ?? (s == null ? void 0 : s.mode) === "flow", _t = M(
    (S) => {
      const N = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, x = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, E = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: S,
          direction: I,
          suggestedNewNodeId: N,
          suggestedNewEdge1Id: x,
          suggestedNewEdge2Id: E
        }
      }), g({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [N] }
      });
    },
    [I, g]
  ), qt = Object.values(r.containers);
  return /* @__PURE__ */ $(
    "div",
    {
      ref: e,
      className: `sysflow-canvas ${B === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${f}`,
      "data-theme": B,
      onWheel: p,
      onPointerDown: Ft,
      onPointerMove: zt,
      onPointerUp: jt,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ D(
          Ge,
          {
            graph: r,
            registerMeasureElement: k,
            nodeTypes: c,
            containerTypes: h
          }
        ),
        /* @__PURE__ */ $("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ D("button", { onClick: P, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ D("button", { onClick: W, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ $("button", { onClick: Z, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(w.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ $(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${w.x}px, ${w.y}px) scale(${w.zoom})`
            },
            children: [
              X && /* @__PURE__ */ D(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(X.startX, X.currentX)}px`,
                    top: `${Math.min(X.startY, X.currentY)}px`,
                    width: `${Math.abs(X.currentX - X.startX)}px`,
                    height: `${Math.abs(X.currentY - X.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              L && /* @__PURE__ */ D("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ D(
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
              /* @__PURE__ */ D("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: qt.map((S) => {
                const N = y.containers[S.id];
                if (!N) return null;
                const x = Object.values(r.nodes).some((E) => E.parentId === S.id) || Object.values(r.containers).some((E) => E.parentId === S.id);
                return /* @__PURE__ */ D(
                  Le,
                  {
                    container: S,
                    layout: N,
                    selected: b.includes(S.id),
                    isHovered: _ === S.id,
                    hasChildren: x,
                    customRenderer: S.type ? h == null ? void 0 : h[S.type] : void 0,
                    onToggleCollapse: (E, J) => g({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: E, collapsed: J }
                    }),
                    onPointerDown: it,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (E) => {
                      E.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [S.id] } });
                    }
                  },
                  S.id
                );
              }) }),
              /* @__PURE__ */ D(
                Ke,
                {
                  graph: r,
                  layout: y,
                  selectedIds: b,
                  direction: I,
                  showArrows: i,
                  routing: a,
                  portOptions: Y,
                  enableEdgeQuickAdd: $t,
                  onInsertNodeOnEdge: _t,
                  onEdgeClick: (S) => g({ type: "SELECTION_CHANGE", payload: { selectedIds: [S] } })
                }
              ),
              /* @__PURE__ */ D("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(r.nodes).map((S) => {
                const N = y.nodes[S.id];
                return N ? /* @__PURE__ */ D(
                  pe,
                  {
                    node: S,
                    layout: N,
                    direction: I,
                    edges: r.edges,
                    portOptions: Y,
                    selected: b.includes(S.id),
                    customRenderer: S.type ? c == null ? void 0 : c[S.type] : void 0,
                    enableQuickAdd: Jt,
                    onAddConnectedNode: Ut,
                    onPointerDown: it,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (x) => {
                      x.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [S.id] } });
                    },
                    onPortPointerDown: pt,
                    onPortPointerUp: Ot
                  },
                  S.id
                ) : null;
              }) }),
              R && /* @__PURE__ */ D(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${R.ghostPosition.x}px, ${R.ghostPosition.y}px)`,
                    width: `${((Yt = K.get(R.draggedEntity.id)) == null ? void 0 : Yt.width) || 200}px`,
                    height: `${((vt = K.get(R.draggedEntity.id)) == null ? void 0 : vt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ D("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: R.draggedEntity.label })
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
  Wt as pruneDanglingEdges,
  Qt as resolveEffectiveEntityId,
  we as useCanvasTransform,
  me as useDragGesture,
  Ee as useGraphHistory,
  be as useMeasurement
};
