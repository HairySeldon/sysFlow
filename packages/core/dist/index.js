var oe = Object.defineProperty;
var se = (i, g, s) => g in i ? oe(i, g, { enumerable: !0, configurable: !0, writable: !0, value: s }) : i[g] = s;
var Lt = (i, g, s) => se(i, typeof g != "symbol" ? g + "" : g, s);
import { useState as et, useRef as Ct, useCallback as M, useEffect as Yt, useMemo as ne } from "react";
import { jsxs as U, jsx as N, Fragment as Et } from "react/jsx-runtime";
function Ce(i, g, s, n) {
  const I = (d) => {
    const c = s.find(
      (r) => r.sourceId === g && r.sourcePortId === d || r.targetId === g && r.targetPortId === d
    );
    if (!c) return null;
    const l = c.sourceId === g ? c.targetId : c.sourceId, o = n[l];
    return o ? { x: o.x + o.width / 2, y: o.y + o.height / 2 } : null;
  };
  ["left", "right"].forEach((d) => {
    i[d].sort((c, l) => {
      var f, u;
      const o = ((f = I(c.id)) == null ? void 0 : f.y) ?? 0, r = ((u = I(l.id)) == null ? void 0 : u.y) ?? 0;
      return o - r;
    });
  }), ["top", "bottom"].forEach((d) => {
    i[d].sort((c, l) => {
      var f, u;
      const o = ((f = I(c.id)) == null ? void 0 : f.x) ?? 0, r = ((u = I(l.id)) == null ? void 0 : u.x) ?? 0;
      return o - r;
    });
  });
}
function ie(i, g, s, n, I, d) {
  if (!I || !d)
    return s ? "left" : "right";
  const c = n.find(
    (u) => s ? u.targetId === i && u.targetPortId === g : u.sourceId === i && u.sourcePortId === g
  );
  if (!c) return s ? "left" : "right";
  const l = s ? c.sourceId : c.targetId, o = I[l];
  if (!o) return s ? "left" : "right";
  const r = o.x + o.width / 2 - (d.x + d.width / 2), f = o.y + o.height / 2 - (d.y + d.height / 2);
  return Math.abs(r) > Math.abs(f) ? r > 0 ? "right" : "left" : f > 0 ? "bottom" : "top";
}
function Dt(i, g, s = "LR", n, I) {
  const d = /* @__PURE__ */ new Map();
  if (!i || !g || !i.ports || i.ports.length === 0)
    return d;
  const c = (I == null ? void 0 : I.direction) || s, l = c === "TB" || c === "BT", o = (I == null ? void 0 : I.mode) || (l ? "strict-flow" : "perimeter-optimized"), r = n ? Array.isArray(n) ? n : Object.values(n) : [], f = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, u = new Set(
    r.filter((y) => y.targetId === i.id).map((y) => y.targetPortId)
  );
  new Set(
    r.filter((y) => y.sourceId === i.id).map((y) => y.sourcePortId)
  ), i.ports.forEach((y) => {
    let b = y.side || "auto";
    if (b !== "auto") {
      f[b].push(y);
      return;
    }
    if (o === "strict-flow") {
      const h = u.has(y.id) || y.label.toLowerCase().includes("in");
      switch (c) {
        case "BT":
          b = h ? "bottom" : "top";
          break;
        case "TB":
          b = h ? "top" : "bottom";
          break;
        case "RL":
          b = h ? "right" : "left";
          break;
        case "LR":
        default:
          b = h ? "left" : "right";
          break;
      }
    } else
      b = ie(
        i.id,
        y.id,
        u.has(y.id),
        r,
        I == null ? void 0 : I.nodeLayouts,
        g
      );
    f[b].push(y);
  }), o === "perimeter-optimized" && (I != null && I.nodeLayouts) && Ce(f, i.id, r, I.nodeLayouts);
  const A = (y, b) => {
    const h = y.length;
    y.forEach((e, t) => {
      let C = 0, w = 0;
      b === "left" || b === "right" ? (w = g.height / (h + 1) * (t + 1), C = b === "left" ? 0 : g.width) : (C = g.width / (h + 1) * (t + 1), w = b === "top" ? 0 : g.height), d.set(e.id, {
        portId: e.id,
        side: b,
        localX: C,
        localY: w,
        worldX: g.x + C,
        worldY: g.y + w
      });
    });
  };
  return A(f.left, "left"), A(f.right, "right"), A(f.top, "top"), A(f.bottom, "bottom"), d;
}
function de(i) {
  const g = {}, s = (n) => {
    var d;
    const I = i.nodes[n];
    return new Set(((d = I == null ? void 0 : I.ports) == null ? void 0 : d.map((c) => c.id)) || []);
  };
  for (const [n, I] of Object.entries(i.edges)) {
    const d = s(I.sourceId), c = s(I.targetId), l = d.has(I.sourcePortId), o = c.has(I.targetPortId);
    l && o && (g[n] = I);
  }
  return {
    ...i,
    edges: g
  };
}
class ce {
  static decouple(g, s) {
    const n = /* @__PURE__ */ new Map();
    for (const r of s)
      n.set(r, /* @__PURE__ */ new Set());
    const I = Object.values(g.edges);
    for (const r of I)
      s.has(r.sourceId) && s.has(r.targetId) && n.get(r.sourceId).add(r.targetId);
    const d = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), o = (r) => {
      d.add(r), c.add(r);
      const f = Array.from(n.get(r) || []);
      for (const u of f)
        d.has(u) ? c.has(u) && (n.get(r).delete(u), n.get(u).add(r), l.add(`${r}->${u}`)) : o(u);
      c.delete(r);
    };
    for (const r of s)
      d.has(r) || o(r);
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
      for (const r of o)
        n.set(r, (n.get(r) || 0) + 1);
    const I = /* @__PURE__ */ new Map(), d = [];
    for (const o of g)
      (n.get(o) || 0) === 0 && (I.set(o, 0), d.push(o));
    const c = /* @__PURE__ */ new Set();
    for (; d.length > 0; ) {
      const o = d.shift();
      c.add(o);
      const r = I.get(o) || 0, f = s.get(o) || /* @__PURE__ */ new Set();
      for (const u of f) {
        const A = I.get(u) ?? 0;
        I.set(u, Math.max(A, r + 1)), n.set(u, (n.get(u) || 1) - 1), n.get(u) === 0 && d.push(u);
      }
    }
    for (const o of g)
      I.has(o) || I.set(o, 0);
    const l = /* @__PURE__ */ new Map();
    for (const [o, r] of I.entries())
      l.has(r) || l.set(r, []), l.get(r).push(o);
    return l;
  }
}
class nt {
  static minimizeCrossings(g, s, n = 4, I) {
    const d = Array.from(g.keys()).sort((o, r) => o - r);
    if (d.length <= 1) return g;
    const c = /* @__PURE__ */ new Map();
    for (const [o, r] of s.entries())
      for (const f of r)
        c.has(f) || c.set(f, /* @__PURE__ */ new Set()), c.get(f).add(o);
    const l = /* @__PURE__ */ new Map();
    for (const [o, r] of g.entries())
      l.set(o, [...r]);
    for (let o = 0; o < n; o++) {
      for (let r = 1; r < d.length; r++) {
        const f = l.get(d[r - 1]), u = l.get(d[r]), A = /* @__PURE__ */ new Map();
        f.forEach((y, b) => A.set(y, b)), nt.sortLayerNodes(u, c, A, I);
      }
      for (let r = d.length - 2; r >= 0; r--) {
        const f = l.get(d[r + 1]), u = l.get(d[r]), A = /* @__PURE__ */ new Map();
        f.forEach((y, b) => A.set(y, b)), nt.sortLayerNodes(u, s, A, I);
      }
    }
    return l;
  }
  static sortLayerNodes(g, s, n, I) {
    var r, f, u;
    if (!I || Object.keys(I.containers).length === 0) {
      g.sort((A, y) => {
        const b = nt.getBarycenter(A, s, n), h = nt.getBarycenter(y, s, n);
        return b - h;
      });
      return;
    }
    const d = /* @__PURE__ */ new Map();
    for (const A of g)
      d.set(A, nt.getBarycenter(A, s, n));
    const c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
    for (const A of g) {
      const y = d.get(A) ?? 0;
      let b = ((r = I.nodes[A]) == null ? void 0 : r.parentId) ?? ((f = I.containers[A]) == null ? void 0 : f.parentId);
      for (; b; )
        c.set(b, (c.get(b) || 0) + y), l.set(b, (l.get(b) || 0) + 1), b = (u = I.containers[b]) == null ? void 0 : u.parentId;
    }
    const o = (A) => {
      if (I.containers[A]) {
        const y = l.get(A) || 0;
        return y === 0 ? 0 : (c.get(A) || 0) / y;
      }
      return d.get(A) ?? 0;
    };
    g.sort((A, y) => {
      const b = nt.getAncestorPath(A, I), h = nt.getAncestorPath(y, I);
      let e = 0;
      for (; e < b.length && e < h.length && b[e] === h[e]; )
        e++;
      const t = b[e] ?? A, C = h[e] ?? y, w = o(t) - o(C);
      return Math.abs(w) > 1e-5 ? w : t.localeCompare(C);
    });
  }
  static getAncestorPath(g, s) {
    var d, c, l;
    const n = [g];
    let I = ((d = s.nodes[g]) == null ? void 0 : d.parentId) ?? ((c = s.containers[g]) == null ? void 0 : c.parentId);
    for (; I; )
      n.unshift(I), I = (l = s.containers[I]) == null ? void 0 : l.parentId;
    return n;
  }
  static getBarycenter(g, s, n) {
    const I = s.get(g);
    if (!I || I.size === 0) return 0;
    let d = 0, c = 0;
    for (const l of I)
      n.has(l) && (d += n.get(l), c++);
    return c === 0 ? 0 : d / c;
  }
}
const st = 32, Pt = 24, ut = 22, rt = 18, lt = 38, wt = 210, Ht = 36, le = 180, Ae = 54, Wt = 260, Xt = 160;
class It {
  static assignCoordinates(g, s, n, I = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const d = I.direction ?? "TB", c = d === "TB" || d === "BT", l = d === "BT" || d === "RL", o = I.aspectRatio ?? 1.55, r = Object.keys(g.containers).length, f = I.mode && I.mode !== "auto" ? I.mode : r > 0 ? "concurrent" : "flow", u = {}, A = {}, y = (b) => {
      var t, C, w, B, K;
      const h = !!g.containers[b], e = !!((t = g.containers[b]) != null && t.collapsed);
      return h && e ? { width: wt, height: Ht } : h && !e ? {
        width: ((C = n.get(b)) == null ? void 0 : C.width) || Wt,
        height: ((w = n.get(b)) == null ? void 0 : w.height) || Xt
      } : {
        width: ((B = n.get(b)) == null ? void 0 : B.width) || le,
        height: ((K = n.get(b)) == null ? void 0 : K.height) || Ae
      };
    };
    return f === "concurrent" ? It.layoutConcurrentHierarchy(
      g,
      y,
      o,
      u,
      A
    ) : It.layoutFlowTree(
      g,
      s,
      y,
      c,
      l,
      I,
      u,
      A
    ), It.assignDynamicPortSides(g, u, A), { nodes: u, containers: A };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(g, s, n, I, d) {
    var b;
    const c = /* @__PURE__ */ new Map();
    for (const [h, e] of Object.entries(g.nodes)) {
      const t = e.parentId ?? null;
      c.has(t) || c.set(t, []), c.get(t).push(h);
    }
    for (const [h, e] of Object.entries(g.containers)) {
      const t = e.parentId ?? null;
      c.has(t) || c.set(t, []), c.get(t).push(h);
    }
    const l = It.getContainerDepths(g), o = Object.keys(g.containers).sort(
      (h, e) => (l.get(e) || 0) - (l.get(h) || 0)
    ), r = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
    for (const h of o) {
      if (!!((b = g.containers[h]) != null && b.collapsed)) {
        r.set(h, {
          width: wt,
          height: Ht
        });
        continue;
      }
      const t = c.get(h) || [];
      if (t.length === 0) {
        r.set(h, {
          width: wt,
          height: lt + rt * 2
        });
        continue;
      }
      const C = t.map((m) => {
        const p = r.has(m) ? r.get(m) : s(m);
        return { id: m, width: p.width, height: p.height };
      }), w = It.findBestTightPacking(C, n);
      for (const m of w.boxes)
        f.set(m.id, m);
      const B = Math.max(w.width + ut * 2, wt), K = w.height + lt + rt * 2;
      r.set(h, { width: B, height: K });
    }
    const u = c.get(null) || [];
    let A = [];
    if (u.length > 0) {
      const h = u.map((t) => {
        const C = r.get(t) || s(t);
        return { id: t, width: C.width, height: C.height };
      });
      A = It.findBestTightPacking(h, n).boxes.map((t) => ({
        ...t,
        localX: t.localX + 60,
        localY: t.localY + 60
      }));
    }
    const y = (h, e, t, C, w) => {
      var m;
      const B = !!g.containers[h], K = { id: h, x: e, y: t, width: C, height: w };
      if (B) {
        if (d[h] = K, (m = g.containers[h]) != null && m.collapsed) return;
        const p = e + ut, E = t + lt + rt, W = c.get(h) || [];
        for (const x of W) {
          const L = f.get(x);
          L && y(
            x,
            p + L.localX,
            E + L.localY,
            L.width,
            L.height
          );
        }
      } else
        I[h] = K;
    };
    for (const h of A)
      y(h.id, h.localX, h.localY, h.width, h.height);
  }
  static findBestTightPacking(g, s) {
    if (g.length === 1)
      return {
        width: g[0].width,
        height: g[0].height,
        boxes: [{ id: g[0].id, localX: 0, localY: 0, width: g[0].width, height: g[0].height }],
        score: 0
      };
    const n = g.reduce((u, A) => u + A.width * A.height, 0), I = Math.max(...g.map((u) => u.width)), d = [...g].sort((u, A) => A.width - u.width), c = /* @__PURE__ */ new Set(), l = g.reduce((u, A) => u + A.width, 0) + (g.length - 1) * st;
    c.add(l), c.add(I);
    const o = Math.max(I, Math.sqrt(n * s));
    c.add(o), c.add(o * 0.85), c.add(o * 1.15);
    const r = Math.min(g.length, 6);
    for (let u = 2; u <= r; u++) {
      let A = 0;
      for (let y = 0; y < u && y < d.length; y++)
        A += d[y].width;
      A += (u - 1) * st, A >= I && c.add(A);
    }
    let f = null;
    for (const u of c) {
      const A = It.simulateSkylinePacking(g, u), y = A.width * A.height, b = Math.max(0, y - n), h = A.width / Math.max(1, A.height), e = Math.abs(Math.log(h / s)), t = b / n * 2 + e * 0.25;
      A.score = t, (!f || t < f.score) && (f = A);
    }
    return f;
  }
  static simulateSkylinePacking(g, s) {
    const n = [...g].sort((o, r) => r.height - o.height), I = [{ x: 0, width: s, y: 0 }], d = [];
    for (const o of n) {
      let r = 1 / 0, f = -1;
      for (let t = 0; t < I.length; t++) {
        if (I[t].x + o.width > s) continue;
        let w = 0, B = 0;
        for (let K = t; K < I.length && B < o.width; K++)
          w = Math.max(w, I[K].y), B += I[K].width;
        w < r && (r = w, f = t);
      }
      if (f === -1) {
        const t = Math.max(...I.map((w) => w.y)), C = t === 0 ? 0 : t + Pt;
        d.push({
          id: o.id,
          localX: 0,
          localY: C,
          width: o.width,
          height: o.height
        }), I.length = 0, I.push({ x: 0, width: o.width + st, y: C + o.height }), s > o.width + st && I.push({
          x: o.width + st,
          width: s - (o.width + st),
          y: 0
        });
        continue;
      }
      const u = I[f].x, A = r === 0 ? 0 : r + Pt;
      d.push({
        id: o.id,
        localX: u,
        localY: A,
        width: o.width,
        height: o.height
      });
      const y = o.width + st, b = A + o.height, h = { x: u, width: y, y: b }, e = [];
      for (const t of I)
        t.x + t.width <= u || t.x >= u + y ? e.push(t) : (t.x < u && e.push({ x: t.x, width: u - t.x, y: t.y }), t.x + t.width > u + y && e.push({
          x: u + y,
          width: t.x + t.width - (u + y),
          y: t.y
        }));
      e.push(h), e.sort((t, C) => t.x - C.x), I.length = 0, I.push(...e);
    }
    const c = Math.max(...d.map((o) => o.localX + o.width), 0), l = Math.max(...d.map((o) => o.localY + o.height), 0);
    return { width: c, height: l, boxes: d, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE WITH COMPOUND CONTAINER SUPPORT
  // ===========================================================================
  static layoutFlowTree(g, s, n, I, d, c, l, o) {
    var Q;
    const r = Array.from(s.keys()).sort((S, H) => S - H), f = /* @__PURE__ */ new Map();
    let u = 80;
    const A = I ? lt + rt * 2 : ut * 2, y = (I ? Pt * 1.5 : st * 1.5) + A, b = I ? st : Pt, h = d ? [...r].reverse() : [...r];
    for (const S of h) {
      const H = s.get(S) || [];
      let a = 0;
      for (const P of H) {
        const Y = n(P), Z = I ? Y.height : Y.width;
        a = Math.max(a, Z);
      }
      f.set(S, u), u += a + y;
    }
    const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
    for (const S of Object.values(g.edges))
      e.has(S.targetId) || e.set(S.targetId, []), e.get(S.targetId).push(S.sourceId), t.has(S.sourceId) || t.set(S.sourceId, []), t.get(S.sourceId).push(S.targetId);
    const C = /* @__PURE__ */ new Map(), w = (S) => {
      var H, a;
      return ((H = g.nodes[S]) == null ? void 0 : H.parentId) ?? ((a = g.containers[S]) == null ? void 0 : a.parentId) ?? null;
    };
    for (const S of r) {
      const H = s.get(S) || [];
      let a = -1 / 0, P;
      for (const Y of H) {
        const Z = n(Y), J = I ? Z.width : Z.height, v = e.get(Y) || [], z = w(Y);
        let $ = b;
        P !== void 0 && P !== z && ($ = b + (I ? ut * 2 : lt + rt * 2));
        let R = null;
        if (v.length > 0) {
          const it = v.map((dt) => {
            const ht = C.get(dt);
            if (ht === void 0) return null;
            const Kt = n(dt);
            return ht + (I ? Kt.width : Kt.height) / 2;
          }).filter((dt) => dt !== null);
          it.length > 0 && (R = it.reduce((dt, ht) => dt + ht, 0) / it.length);
        }
        let _ = R !== null ? R - J / 2 : 80;
        _ < a + $ && (_ = a === -1 / 0 ? 80 : a + $), C.set(Y, _), a = _ + J, P = z;
      }
    }
    for (let S = r.length - 1; S >= 0; S--) {
      const H = r[S], a = s.get(H) || [];
      for (const Z of a) {
        const J = t.get(Z) || [];
        if (J.length === 0) continue;
        const v = J.map((z) => {
          const $ = C.get(z);
          if ($ === void 0) return null;
          const R = n(z);
          return $ + (I ? R.width : R.height) / 2;
        }).filter((z) => z !== null);
        if (v.length > 0) {
          const z = v.reduce((_, it) => _ + it, 0) / v.length, $ = n(Z), R = I ? $.width : $.height;
          C.set(Z, z - R / 2);
        }
      }
      let P = -1 / 0, Y;
      for (const Z of a) {
        const J = n(Z), v = I ? J.width : J.height, z = w(Z);
        let $ = b;
        Y !== void 0 && Y !== z && ($ = b + (I ? ut * 2 : lt + rt * 2));
        let R = C.get(Z) ?? 80;
        R < P + $ && (R = P + $, C.set(Z, R)), P = R + v, Y = z;
      }
    }
    let B = 1 / 0;
    for (const S of C.values()) B = Math.min(B, S);
    const K = B < 80 ? 80 - B : 0;
    for (const S of r) {
      const H = s.get(S) || [], a = f.get(S) || 80;
      for (const P of H) {
        const Y = n(P), Z = (C.get(P) ?? 80) + K, z = { id: P, x: I ? Z : a, y: I ? a : Z, width: Y.width, height: Y.height };
        g.containers[P] ? o[P] = z : l[P] = z;
      }
    }
    const m = It.getContainerDepths(g), p = Object.keys(g.containers).sort(
      (S, H) => (m.get(H) || 0) - (m.get(S) || 0)
    ), E = /* @__PURE__ */ new Map();
    for (const [S, H] of Object.entries(g.nodes))
      H.parentId && (E.has(H.parentId) || E.set(H.parentId, []), E.get(H.parentId).push(S));
    for (const [S, H] of Object.entries(g.containers))
      H.parentId && (E.has(H.parentId) || E.set(H.parentId, []), E.get(H.parentId).push(S));
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
      const H = E.get(S) || [], a = [];
      for (const P of H) {
        const Y = l[P] || o[P];
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
        let P = 1 / 0, Y = -1 / 0, Z = 1 / 0, J = -1 / 0;
        for (const _ of a)
          P = Math.min(P, _.x), Y = Math.max(Y, _.x + _.width), Z = Math.min(Z, _.y), J = Math.max(J, _.y + _.height);
        const v = Math.max(Y - P + ut * 2, wt), z = J - Z + lt + rt * 2, $ = P - ut, R = Z - lt - rt;
        o[S] = { id: S, x: $, y: R, width: v, height: z };
      }
    }
    let W = 1 / 0, x = 1 / 0;
    for (const S of [...Object.values(l), ...Object.values(o)])
      W = Math.min(W, S.x), x = Math.min(x, S.y);
    const L = 60, X = W < L ? L - W : 0, V = x < L ? L - x : 0;
    if (X !== 0 || V !== 0) {
      for (const S of Object.values(l))
        S.x += X, S.y += V;
      for (const S of Object.values(o))
        S.x += X, S.y += V;
    }
  }
  static assignDynamicPortSides(g, s, n) {
    var d, c;
    const I = (l) => s[l] || n[l];
    for (const l of Object.values(g.edges)) {
      const o = I(l.sourceId), r = I(l.targetId);
      if (!o || !r) continue;
      const f = g.nodes[l.sourceId] || g.containers[l.sourceId], u = g.nodes[l.targetId] || g.containers[l.targetId], A = r.x + r.width / 2 - (o.x + o.width / 2), y = r.y + r.height / 2 - (o.y + o.height / 2), b = Math.abs(A) > Math.abs(y) * 1.25, h = (d = f == null ? void 0 : f.ports) == null ? void 0 : d.find((t) => t.id === l.sourcePortId);
      h && (!h.side || h.side === "auto") && (b ? h.side = A >= 0 ? "right" : "left" : h.side = y >= 0 ? "bottom" : "top");
      const e = (c = u == null ? void 0 : u.ports) == null ? void 0 : c.find((t) => t.id === l.targetPortId);
      e && (!e.side || e.side === "auto") && (b ? e.side = A >= 0 ? "left" : "right" : e.side = y >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(g) {
    const s = /* @__PURE__ */ new Map(), n = (I) => {
      var l;
      if (s.has(I)) return s.get(I);
      const d = (l = g.containers[I]) == null ? void 0 : l.parentId;
      if (!d || !g.containers[d])
        return s.set(I, 0), 0;
      const c = 1 + n(d);
      return s.set(I, c), c;
    };
    for (const I of Object.keys(g.containers))
      n(I);
    return s;
  }
}
class ae {
  async execute(g, s, n) {
    const I = Object.values(g.containers), d = Object.values(g.nodes), c = new Set(
      I.filter((A) => !!A.collapsed).map((A) => A.id)
    ), l = (A) => {
      var b;
      let y = A;
      for (; y; ) {
        if (c.has(y)) return !0;
        y = (b = g.containers[y]) == null ? void 0 : b.parentId;
      }
      return !1;
    }, o = /* @__PURE__ */ new Set();
    for (const [A, y] of Object.entries(g.nodes))
      l(y.parentId) || o.add(A);
    for (const [A, y] of Object.entries(g.containers)) {
      const b = y;
      b.collapsed ? l(b.parentId) || o.add(A) : !(d.some((e) => e.parentId === A) || I.some((e) => e.parentId === A)) && !l(b.parentId) && o.add(A);
    }
    const r = ce.decouple(g, o), f = re.assignLayers(r.allEntityIds, r.adjList), u = nt.minimizeCrossings(f, r.adjList, 4, g);
    return It.assignCoordinates(g, u, s, n);
  }
}
const Qt = "Y2xhc3Mgb3QgewogIHN0YXRpYyBkZWNvdXBsZShuLCBmKSB7CiAgICBjb25zdCByID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgcyBvZiBmKQogICAgICByLnNldChzLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgIGNvbnN0IHQgPSBPYmplY3QudmFsdWVzKG4uZWRnZXMpOwogICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgIGYuaGFzKHMuc291cmNlSWQpICYmIGYuaGFzKHMudGFyZ2V0SWQpICYmIHIuZ2V0KHMuc291cmNlSWQpLmFkZChzLnRhcmdldElkKTsKICAgIGNvbnN0IGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGUgPSAocykgPT4gewogICAgICBhLmFkZChzKSwgaC5hZGQocyk7CiAgICAgIGNvbnN0IHkgPSBBcnJheS5mcm9tKHIuZ2V0KHMpIHx8IFtdKTsKICAgICAgZm9yIChjb25zdCBpIG9mIHkpCiAgICAgICAgYS5oYXMoaSkgPyBoLmhhcyhpKSAmJiAoci5nZXQocykuZGVsZXRlKGkpLCByLmdldChpKS5hZGQocyksIGQuYWRkKGAke3N9LT4ke2l9YCkpIDogZShpKTsKICAgICAgaC5kZWxldGUocyk7CiAgICB9OwogICAgZm9yIChjb25zdCBzIG9mIGYpCiAgICAgIGEuaGFzKHMpIHx8IGUocyk7CiAgICByZXR1cm4gewogICAgICBhZGpMaXN0OiByLAogICAgICByZXZlcnNlZEVkZ2VzOiBkLAogICAgICBhbGxFbnRpdHlJZHM6IEFycmF5LmZyb20oZikKICAgIH07CiAgfQp9CmNsYXNzIGN0IHsKICBzdGF0aWMgYXNzaWduTGF5ZXJzKG4sIGYpIHsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgIHIuc2V0KGUsIDApOwogICAgZm9yIChjb25zdCBbLCBlXSBvZiBmLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIGUpCiAgICAgICAgci5zZXQocywgKHIuZ2V0KHMpIHx8IDApICsgMSk7CiAgICBjb25zdCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYSA9IFtdOwogICAgZm9yIChjb25zdCBlIG9mIG4pCiAgICAgIChyLmdldChlKSB8fCAwKSA9PT0gMCAmJiAodC5zZXQoZSwgMCksIGEucHVzaChlKSk7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyBhLmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBlID0gYS5zaGlmdCgpOwogICAgICBoLmFkZChlKTsKICAgICAgY29uc3QgcyA9IHQuZ2V0KGUpIHx8IDAsIHkgPSBmLmdldChlKSB8fCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICBmb3IgKGNvbnN0IGkgb2YgeSkgewogICAgICAgIGNvbnN0IG8gPSB0LmdldChpKSA/PyAwOwogICAgICAgIHQuc2V0KGksIE1hdGgubWF4KG8sIHMgKyAxKSksIHIuc2V0KGksIChyLmdldChpKSB8fCAxKSAtIDEpLCByLmdldChpKSA9PT0gMCAmJiBhLnB1c2goaSk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgZSBvZiBuKQogICAgICB0LmhhcyhlKSB8fCB0LnNldChlLCAwKTsKICAgIGNvbnN0IGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbZSwgc10gb2YgdC5lbnRyaWVzKCkpCiAgICAgIGQuaGFzKHMpIHx8IGQuc2V0KHMsIFtdKSwgZC5nZXQocykucHVzaChlKTsKICAgIHJldHVybiBkOwogIH0KfQpjbGFzcyBSIHsKICBzdGF0aWMgbWluaW1pemVDcm9zc2luZ3MobiwgZiwgciA9IDQsIHQpIHsKICAgIGNvbnN0IGEgPSBBcnJheS5mcm9tKG4ua2V5cygpKS5zb3J0KChlLCBzKSA9PiBlIC0gcyk7CiAgICBpZiAoYS5sZW5ndGggPD0gMSkgcmV0dXJuIG47CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW2UsIHNdIG9mIGYuZW50cmllcygpKQogICAgICBmb3IgKGNvbnN0IHkgb2YgcykKICAgICAgICBoLmhhcyh5KSB8fCBoLnNldCh5LCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKSwgaC5nZXQoeSkuYWRkKGUpOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtlLCBzXSBvZiBuLmVudHJpZXMoKSkKICAgICAgZC5zZXQoZSwgWy4uLnNdKTsKICAgIGZvciAobGV0IGUgPSAwOyBlIDwgcjsgZSsrKSB7CiAgICAgIGZvciAobGV0IHMgPSAxOyBzIDwgYS5sZW5ndGg7IHMrKykgewogICAgICAgIGNvbnN0IHkgPSBkLmdldChhW3MgLSAxXSksIGkgPSBkLmdldChhW3NdKSwgbyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgICAgeS5mb3JFYWNoKCh1LCB3KSA9PiBvLnNldCh1LCB3KSksIFIuc29ydExheWVyTm9kZXMoaSwgaCwgbywgdCk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgcyA9IGEubGVuZ3RoIC0gMjsgcyA+PSAwOyBzLS0pIHsKICAgICAgICBjb25zdCB5ID0gZC5nZXQoYVtzICsgMV0pLCBpID0gZC5nZXQoYVtzXSksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHkuZm9yRWFjaCgodSwgdykgPT4gby5zZXQodSwgdykpLCBSLnNvcnRMYXllck5vZGVzKGksIGYsIG8sIHQpOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gZDsKICB9CiAgc3RhdGljIHNvcnRMYXllck5vZGVzKG4sIGYsIHIsIHQpIHsKICAgIHZhciBzLCB5LCBpOwogICAgaWYgKCF0IHx8IE9iamVjdC5rZXlzKHQuY29udGFpbmVycykubGVuZ3RoID09PSAwKSB7CiAgICAgIG4uc29ydCgobywgdSkgPT4gewogICAgICAgIGNvbnN0IHcgPSBSLmdldEJhcnljZW50ZXIobywgZiwgciksIGcgPSBSLmdldEJhcnljZW50ZXIodSwgZiwgcik7CiAgICAgICAgcmV0dXJuIHcgLSBnOwogICAgICB9KTsKICAgICAgcmV0dXJuOwogICAgfQogICAgY29uc3QgYSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgbikKICAgICAgYS5zZXQobywgUi5nZXRCYXJ5Y2VudGVyKG8sIGYsIHIpKTsKICAgIGNvbnN0IGggPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBkID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgbyBvZiBuKSB7CiAgICAgIGNvbnN0IHUgPSBhLmdldChvKSA/PyAwOwogICAgICBsZXQgdyA9ICgocyA9IHQubm9kZXNbb10pID09IG51bGwgPyB2b2lkIDAgOiBzLnBhcmVudElkKSA/PyAoKHkgPSB0LmNvbnRhaW5lcnNbb10pID09IG51bGwgPyB2b2lkIDAgOiB5LnBhcmVudElkKTsKICAgICAgZm9yICg7IHc7ICkKICAgICAgICBoLnNldCh3LCAoaC5nZXQodykgfHwgMCkgKyB1KSwgZC5zZXQodywgKGQuZ2V0KHcpIHx8IDApICsgMSksIHcgPSAoaSA9IHQuY29udGFpbmVyc1t3XSkgPT0gbnVsbCA/IHZvaWQgMCA6IGkucGFyZW50SWQ7CiAgICB9CiAgICBjb25zdCBlID0gKG8pID0+IHsKICAgICAgaWYgKHQuY29udGFpbmVyc1tvXSkgewogICAgICAgIGNvbnN0IHUgPSBkLmdldChvKSB8fCAwOwogICAgICAgIHJldHVybiB1ID09PSAwID8gMCA6IChoLmdldChvKSB8fCAwKSAvIHU7CiAgICAgIH0KICAgICAgcmV0dXJuIGEuZ2V0KG8pID8/IDA7CiAgICB9OwogICAgbi5zb3J0KChvLCB1KSA9PiB7CiAgICAgIGNvbnN0IHcgPSBSLmdldEFuY2VzdG9yUGF0aChvLCB0KSwgZyA9IFIuZ2V0QW5jZXN0b3JQYXRoKHUsIHQpOwogICAgICBsZXQgcCA9IDA7CiAgICAgIGZvciAoOyBwIDwgdy5sZW5ndGggJiYgcCA8IGcubGVuZ3RoICYmIHdbcF0gPT09IGdbcF07ICkKICAgICAgICBwKys7CiAgICAgIGNvbnN0IGMgPSB3W3BdID8/IG8sIEkgPSBnW3BdID8/IHUsIE0gPSBlKGMpIC0gZShJKTsKICAgICAgcmV0dXJuIE1hdGguYWJzKE0pID4gMWUtNSA/IE0gOiBjLmxvY2FsZUNvbXBhcmUoSSk7CiAgICB9KTsKICB9CiAgc3RhdGljIGdldEFuY2VzdG9yUGF0aChuLCBmKSB7CiAgICB2YXIgYSwgaCwgZDsKICAgIGNvbnN0IHIgPSBbbl07CiAgICBsZXQgdCA9ICgoYSA9IGYubm9kZXNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyAoKGggPSBmLmNvbnRhaW5lcnNbbl0pID09IG51bGwgPyB2b2lkIDAgOiBoLnBhcmVudElkKTsKICAgIGZvciAoOyB0OyApCiAgICAgIHIudW5zaGlmdCh0KSwgdCA9IChkID0gZi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogZC5wYXJlbnRJZDsKICAgIHJldHVybiByOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihuLCBmLCByKSB7CiAgICBjb25zdCB0ID0gZi5nZXQobik7CiAgICBpZiAoIXQgfHwgdC5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBhID0gMCwgaCA9IDA7CiAgICBmb3IgKGNvbnN0IGQgb2YgdCkKICAgICAgci5oYXMoZCkgJiYgKGEgKz0gci5nZXQoZCksIGgrKyk7CiAgICByZXR1cm4gaCA9PT0gMCA/IDAgOiBhIC8gaDsKICB9Cn0KY29uc3QgayA9IDMyLCBRID0gMjQsIEwgPSAyMiwgRyA9IDE4LCBXID0gMzgsIHEgPSAyMTAsIFYgPSAzNiwgaXQgPSAxODAsIHJ0ID0gNTQsIG50ID0gMjYwLCBzdCA9IDE2MDsKY2xhc3MgWSB7CiAgc3RhdGljIGFzc2lnbkNvb3JkaW5hdGVzKG4sIGYsIHIsIHQgPSB7IGRpcmVjdGlvbjogIlRCIiwgbW9kZTogImF1dG8iLCBhc3BlY3RSYXRpbzogMS41NSB9KSB7CiAgICBjb25zdCBhID0gdC5kaXJlY3Rpb24gPz8gIlRCIiwgaCA9IGEgPT09ICJUQiIgfHwgYSA9PT0gIkJUIiwgZCA9IGEgPT09ICJCVCIgfHwgYSA9PT0gIlJMIiwgZSA9IHQuYXNwZWN0UmF0aW8gPz8gMS41NSwgcyA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykubGVuZ3RoLCB5ID0gdC5tb2RlICYmIHQubW9kZSAhPT0gImF1dG8iID8gdC5tb2RlIDogcyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIsIGkgPSB7fSwgbyA9IHt9LCB1ID0gKHcpID0+IHsKICAgICAgdmFyIGMsIEksIE0sIE4sIEE7CiAgICAgIGNvbnN0IGcgPSAhIW4uY29udGFpbmVyc1t3XSwgcCA9ICEhKChjID0gbi5jb250YWluZXJzW3ddKSAhPSBudWxsICYmIGMuY29sbGFwc2VkKTsKICAgICAgcmV0dXJuIGcgJiYgcCA/IHsgd2lkdGg6IHEsIGhlaWdodDogViB9IDogZyAmJiAhcCA/IHsKICAgICAgICB3aWR0aDogKChJID0gci5nZXQodykpID09IG51bGwgPyB2b2lkIDAgOiBJLndpZHRoKSB8fCBudCwKICAgICAgICBoZWlnaHQ6ICgoTSA9IHIuZ2V0KHcpKSA9PSBudWxsID8gdm9pZCAwIDogTS5oZWlnaHQpIHx8IHN0CiAgICAgIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoTiA9IHIuZ2V0KHcpKSA9PSBudWxsID8gdm9pZCAwIDogTi53aWR0aCkgfHwgaXQsCiAgICAgICAgaGVpZ2h0OiAoKEEgPSByLmdldCh3KSkgPT0gbnVsbCA/IHZvaWQgMCA6IEEuaGVpZ2h0KSB8fCBydAogICAgICB9OwogICAgfTsKICAgIHJldHVybiB5ID09PSAiY29uY3VycmVudCIgPyBZLmxheW91dENvbmN1cnJlbnRIaWVyYXJjaHkoCiAgICAgIG4sCiAgICAgIHUsCiAgICAgIGUsCiAgICAgIGksCiAgICAgIG8KICAgICkgOiBZLmxheW91dEZsb3dUcmVlKAogICAgICBuLAogICAgICBmLAogICAgICB1LAogICAgICBoLAogICAgICBkLAogICAgICB0LAogICAgICBpLAogICAgICBvCiAgICApLCBZLmFzc2lnbkR5bmFtaWNQb3J0U2lkZXMobiwgaSwgbyksIHsgbm9kZXM6IGksIGNvbnRhaW5lcnM6IG8gfTsKICB9CiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgLy8gQ09OQ1VSUkVOVCBDT01QT1VORCBQQUNLSU5HIFdJVEggU0tZTElORSAyRCBCSU4gUEFDS0lORwogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KG4sIGYsIHIsIHQsIGEpIHsKICAgIHZhciB3OwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtnLCBwXSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkgewogICAgICBjb25zdCBjID0gcC5wYXJlbnRJZCA/PyBudWxsOwogICAgICBoLmhhcyhjKSB8fCBoLnNldChjLCBbXSksIGguZ2V0KGMpLnB1c2goZyk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFtnLCBwXSBvZiBPYmplY3QuZW50cmllcyhuLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IGMgPSBwLnBhcmVudElkID8/IG51bGw7CiAgICAgIGguaGFzKGMpIHx8IGguc2V0KGMsIFtdKSwgaC5nZXQoYykucHVzaChnKTsKICAgIH0KICAgIGNvbnN0IGQgPSBZLmdldENvbnRhaW5lckRlcHRocyhuKSwgZSA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykuc29ydCgKICAgICAgKGcsIHApID0+IChkLmdldChwKSB8fCAwKSAtIChkLmdldChnKSB8fCAwKQogICAgKSwgcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBnIG9mIGUpIHsKICAgICAgaWYgKCEhKCh3ID0gbi5jb250YWluZXJzW2ddKSAhPSBudWxsICYmIHcuY29sbGFwc2VkKSkgewogICAgICAgIHMuc2V0KGcsIHsKICAgICAgICAgIHdpZHRoOiBxLAogICAgICAgICAgaGVpZ2h0OiBWCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgYyA9IGguZ2V0KGcpIHx8IFtdOwogICAgICBpZiAoYy5sZW5ndGggPT09IDApIHsKICAgICAgICBzLnNldChnLCB7CiAgICAgICAgICB3aWR0aDogcSwKICAgICAgICAgIGhlaWdodDogVyArIEcgKiAyCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgSSA9IGMubWFwKChTKSA9PiB7CiAgICAgICAgY29uc3QgXyA9IHMuaGFzKFMpID8gcy5nZXQoUykgOiBmKFMpOwogICAgICAgIHJldHVybiB7IGlkOiBTLCB3aWR0aDogXy53aWR0aCwgaGVpZ2h0OiBfLmhlaWdodCB9OwogICAgICB9KSwgTSA9IFkuZmluZEJlc3RUaWdodFBhY2tpbmcoSSwgcik7CiAgICAgIGZvciAoY29uc3QgUyBvZiBNLmJveGVzKQogICAgICAgIHkuc2V0KFMuaWQsIFMpOwogICAgICBjb25zdCBOID0gTWF0aC5tYXgoTS53aWR0aCArIEwgKiAyLCBxKSwgQSA9IE0uaGVpZ2h0ICsgVyArIEcgKiAyOwogICAgICBzLnNldChnLCB7IHdpZHRoOiBOLCBoZWlnaHQ6IEEgfSk7CiAgICB9CiAgICBjb25zdCBpID0gaC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgbyA9IFtdOwogICAgaWYgKGkubGVuZ3RoID4gMCkgewogICAgICBjb25zdCBnID0gaS5tYXAoKGMpID0+IHsKICAgICAgICBjb25zdCBJID0gcy5nZXQoYykgfHwgZihjKTsKICAgICAgICByZXR1cm4geyBpZDogYywgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgfSk7CiAgICAgIG8gPSBZLmZpbmRCZXN0VGlnaHRQYWNraW5nKGcsIHIpLmJveGVzLm1hcCgoYykgPT4gKHsKICAgICAgICAuLi5jLAogICAgICAgIGxvY2FsWDogYy5sb2NhbFggKyA2MCwKICAgICAgICBsb2NhbFk6IGMubG9jYWxZICsgNjAKICAgICAgfSkpOwogICAgfQogICAgY29uc3QgdSA9IChnLCBwLCBjLCBJLCBNKSA9PiB7CiAgICAgIHZhciBTOwogICAgICBjb25zdCBOID0gISFuLmNvbnRhaW5lcnNbZ10sIEEgPSB7IGlkOiBnLCB4OiBwLCB5OiBjLCB3aWR0aDogSSwgaGVpZ2h0OiBNIH07CiAgICAgIGlmIChOKSB7CiAgICAgICAgaWYgKGFbZ10gPSBBLCAoUyA9IG4uY29udGFpbmVyc1tnXSkgIT0gbnVsbCAmJiBTLmNvbGxhcHNlZCkgcmV0dXJuOwogICAgICAgIGNvbnN0IF8gPSBwICsgTCwgSCA9IGMgKyBXICsgRywgRiA9IGguZ2V0KGcpIHx8IFtdOwogICAgICAgIGZvciAoY29uc3QgWCBvZiBGKSB7CiAgICAgICAgICBjb25zdCBCID0geS5nZXQoWCk7CiAgICAgICAgICBCICYmIHUoCiAgICAgICAgICAgIFgsCiAgICAgICAgICAgIF8gKyBCLmxvY2FsWCwKICAgICAgICAgICAgSCArIEIubG9jYWxZLAogICAgICAgICAgICBCLndpZHRoLAogICAgICAgICAgICBCLmhlaWdodAogICAgICAgICAgKTsKICAgICAgICB9CiAgICAgIH0gZWxzZQogICAgICAgIHRbZ10gPSBBOwogICAgfTsKICAgIGZvciAoY29uc3QgZyBvZiBvKQogICAgICB1KGcuaWQsIGcubG9jYWxYLCBnLmxvY2FsWSwgZy53aWR0aCwgZy5oZWlnaHQpOwogIH0KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcobiwgZikgewogICAgaWYgKG4ubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBuWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogblswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBuWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IG5bMF0ud2lkdGgsIGhlaWdodDogblswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IHIgPSBuLnJlZHVjZSgoaSwgbykgPT4gaSArIG8ud2lkdGggKiBvLmhlaWdodCwgMCksIHQgPSBNYXRoLm1heCguLi5uLm1hcCgoaSkgPT4gaS53aWR0aCkpLCBhID0gWy4uLm5dLnNvcnQoKGksIG8pID0+IG8ud2lkdGggLSBpLndpZHRoKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGQgPSBuLnJlZHVjZSgoaSwgbykgPT4gaSArIG8ud2lkdGgsIDApICsgKG4ubGVuZ3RoIC0gMSkgKiBrOwogICAgaC5hZGQoZCksIGguYWRkKHQpOwogICAgY29uc3QgZSA9IE1hdGgubWF4KHQsIE1hdGguc3FydChyICogZikpOwogICAgaC5hZGQoZSksIGguYWRkKGUgKiAwLjg1KSwgaC5hZGQoZSAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKG4ubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IGkgPSAyOyBpIDw9IHM7IGkrKykgewogICAgICBsZXQgbyA9IDA7CiAgICAgIGZvciAobGV0IHUgPSAwOyB1IDwgaSAmJiB1IDwgYS5sZW5ndGg7IHUrKykKICAgICAgICBvICs9IGFbdV0ud2lkdGg7CiAgICAgIG8gKz0gKGkgLSAxKSAqIGssIG8gPj0gdCAmJiBoLmFkZChvKTsKICAgIH0KICAgIGxldCB5ID0gbnVsbDsKICAgIGZvciAoY29uc3QgaSBvZiBoKSB7CiAgICAgIGNvbnN0IG8gPSBZLnNpbXVsYXRlU2t5bGluZVBhY2tpbmcobiwgaSksIHUgPSBvLndpZHRoICogby5oZWlnaHQsIHcgPSBNYXRoLm1heCgwLCB1IC0gciksIGcgPSBvLndpZHRoIC8gTWF0aC5tYXgoMSwgby5oZWlnaHQpLCBwID0gTWF0aC5hYnMoTWF0aC5sb2coZyAvIGYpKSwgYyA9IHcgLyByICogMiArIHAgKiAwLjI1OwogICAgICBvLnNjb3JlID0gYywgKCF5IHx8IGMgPCB5LnNjb3JlKSAmJiAoeSA9IG8pOwogICAgfQogICAgcmV0dXJuIHk7CiAgfQogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKG4sIGYpIHsKICAgIGNvbnN0IHIgPSBbLi4ubl0uc29ydCgoZSwgcykgPT4gcy5oZWlnaHQgLSBlLmhlaWdodCksIHQgPSBbeyB4OiAwLCB3aWR0aDogZiwgeTogMCB9XSwgYSA9IFtdOwogICAgZm9yIChjb25zdCBlIG9mIHIpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHQubGVuZ3RoOyBjKyspIHsKICAgICAgICBpZiAodFtjXS54ICsgZS53aWR0aCA+IGYpIGNvbnRpbnVlOwogICAgICAgIGxldCBNID0gMCwgTiA9IDA7CiAgICAgICAgZm9yIChsZXQgQSA9IGM7IEEgPCB0Lmxlbmd0aCAmJiBOIDwgZS53aWR0aDsgQSsrKQogICAgICAgICAgTSA9IE1hdGgubWF4KE0sIHRbQV0ueSksIE4gKz0gdFtBXS53aWR0aDsKICAgICAgICBNIDwgcyAmJiAocyA9IE0sIHkgPSBjKTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCBjID0gTWF0aC5tYXgoLi4udC5tYXAoKE0pID0+IE0ueSkpLCBJID0gYyA9PT0gMCA/IDAgOiBjICsgUTsKICAgICAgICBhLnB1c2goewogICAgICAgICAgaWQ6IGUuaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IEksCiAgICAgICAgICB3aWR0aDogZS53aWR0aCwKICAgICAgICAgIGhlaWdodDogZS5oZWlnaHQKICAgICAgICB9KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goeyB4OiAwLCB3aWR0aDogZS53aWR0aCArIGssIHk6IEkgKyBlLmhlaWdodCB9KSwgZiA+IGUud2lkdGggKyBrICYmIHQucHVzaCh7CiAgICAgICAgICB4OiBlLndpZHRoICsgaywKICAgICAgICAgIHdpZHRoOiBmIC0gKGUud2lkdGggKyBrKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBpID0gdFt5XS54LCBvID0gcyA9PT0gMCA/IDAgOiBzICsgUTsKICAgICAgYS5wdXNoKHsKICAgICAgICBpZDogZS5pZCwKICAgICAgICBsb2NhbFg6IGksCiAgICAgICAgbG9jYWxZOiBvLAogICAgICAgIHdpZHRoOiBlLndpZHRoLAogICAgICAgIGhlaWdodDogZS5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IHUgPSBlLndpZHRoICsgaywgdyA9IG8gKyBlLmhlaWdodCwgZyA9IHsgeDogaSwgd2lkdGg6IHUsIHk6IHcgfSwgcCA9IFtdOwogICAgICBmb3IgKGNvbnN0IGMgb2YgdCkKICAgICAgICBjLnggKyBjLndpZHRoIDw9IGkgfHwgYy54ID49IGkgKyB1ID8gcC5wdXNoKGMpIDogKGMueCA8IGkgJiYgcC5wdXNoKHsgeDogYy54LCB3aWR0aDogaSAtIGMueCwgeTogYy55IH0pLCBjLnggKyBjLndpZHRoID4gaSArIHUgJiYgcC5wdXNoKHsKICAgICAgICAgIHg6IGkgKyB1LAogICAgICAgICAgd2lkdGg6IGMueCArIGMud2lkdGggLSAoaSArIHUpLAogICAgICAgICAgeTogYy55CiAgICAgICAgfSkpOwogICAgICBwLnB1c2goZyksIHAuc29ydCgoYywgSSkgPT4gYy54IC0gSS54KSwgdC5sZW5ndGggPSAwLCB0LnB1c2goLi4ucCk7CiAgICB9CiAgICBjb25zdCBoID0gTWF0aC5tYXgoLi4uYS5tYXAoKGUpID0+IGUubG9jYWxYICsgZS53aWR0aCksIDApLCBkID0gTWF0aC5tYXgoLi4uYS5tYXAoKGUpID0+IGUubG9jYWxZICsgZS5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBoLCBoZWlnaHQ6IGQsIGJveGVzOiBhLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgV0lUSCBDT01QT1VORCBDT05UQUlORVIgU1VQUE9SVAogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIHN0YXRpYyBsYXlvdXRGbG93VHJlZShuLCBmLCByLCB0LCBhLCBoLCBkLCBlKSB7CiAgICB2YXIgdHQ7CiAgICBjb25zdCBzID0gQXJyYXkuZnJvbShmLmtleXMoKSkuc29ydCgobCwgeCkgPT4gbCAtIHgpLCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGxldCBpID0gODA7CiAgICBjb25zdCBvID0gdCA/IFcgKyBHICogMiA6IEwgKiAyLCB1ID0gKHQgPyBRICogMS41IDogayAqIDEuNSkgKyBvLCB3ID0gdCA/IGsgOiBRLCBnID0gYSA/IFsuLi5zXS5yZXZlcnNlKCkgOiBbLi4uc107CiAgICBmb3IgKGNvbnN0IGwgb2YgZykgewogICAgICBjb25zdCB4ID0gZi5nZXQobCkgfHwgW107CiAgICAgIGxldCBPID0gMDsKICAgICAgZm9yIChjb25zdCBtIG9mIHgpIHsKICAgICAgICBjb25zdCBiID0gcihtKSwgUCA9IHQgPyBiLmhlaWdodCA6IGIud2lkdGg7CiAgICAgICAgTyA9IE1hdGgubWF4KE8sIFApOwogICAgICB9CiAgICAgIHkuc2V0KGwsIGkpLCBpICs9IE8gKyB1OwogICAgfQogICAgY29uc3QgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBsIG9mIE9iamVjdC52YWx1ZXMobi5lZGdlcykpCiAgICAgIHAuaGFzKGwudGFyZ2V0SWQpIHx8IHAuc2V0KGwudGFyZ2V0SWQsIFtdKSwgcC5nZXQobC50YXJnZXRJZCkucHVzaChsLnNvdXJjZUlkKSwgYy5oYXMobC5zb3VyY2VJZCkgfHwgYy5zZXQobC5zb3VyY2VJZCwgW10pLCBjLmdldChsLnNvdXJjZUlkKS5wdXNoKGwudGFyZ2V0SWQpOwogICAgY29uc3QgSSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIE0gPSAobCkgPT4gewogICAgICB2YXIgeCwgTzsKICAgICAgcmV0dXJuICgoeCA9IG4ubm9kZXNbbF0pID09IG51bGwgPyB2b2lkIDAgOiB4LnBhcmVudElkKSA/PyAoKE8gPSBuLmNvbnRhaW5lcnNbbF0pID09IG51bGwgPyB2b2lkIDAgOiBPLnBhcmVudElkKSA/PyBudWxsOwogICAgfTsKICAgIGZvciAoY29uc3QgbCBvZiBzKSB7CiAgICAgIGNvbnN0IHggPSBmLmdldChsKSB8fCBbXTsKICAgICAgbGV0IE8gPSAtMSAvIDAsIG07CiAgICAgIGZvciAoY29uc3QgYiBvZiB4KSB7CiAgICAgICAgY29uc3QgUCA9IHIoYiksIGogPSB0ID8gUC53aWR0aCA6IFAuaGVpZ2h0LCBFID0gcC5nZXQoYikgfHwgW10sIEMgPSBNKGIpOwogICAgICAgIGxldCBUID0gdzsKICAgICAgICBtICE9PSB2b2lkIDAgJiYgbSAhPT0gQyAmJiAoVCA9IHcgKyAodCA/IEwgKiAyIDogVyArIEcgKiAyKSk7CiAgICAgICAgbGV0IHYgPSBudWxsOwogICAgICAgIGlmIChFLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0ICQgPSBFLm1hcCgoVSkgPT4gewogICAgICAgICAgICBjb25zdCBLID0gSS5nZXQoVSk7CiAgICAgICAgICAgIGlmIChLID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBldCA9IHIoVSk7CiAgICAgICAgICAgIHJldHVybiBLICsgKHQgPyBldC53aWR0aCA6IGV0LmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChVKSA9PiBVICE9PSBudWxsKTsKICAgICAgICAgICQubGVuZ3RoID4gMCAmJiAodiA9ICQucmVkdWNlKChVLCBLKSA9PiBVICsgSywgMCkgLyAkLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBEID0gdiAhPT0gbnVsbCA/IHYgLSBqIC8gMiA6IDgwOwogICAgICAgIEQgPCBPICsgVCAmJiAoRCA9IE8gPT09IC0xIC8gMCA/IDgwIDogTyArIFQpLCBJLnNldChiLCBEKSwgTyA9IEQgKyBqLCBtID0gQzsKICAgICAgfQogICAgfQogICAgZm9yIChsZXQgbCA9IHMubGVuZ3RoIC0gMTsgbCA+PSAwOyBsLS0pIHsKICAgICAgY29uc3QgeCA9IHNbbF0sIE8gPSBmLmdldCh4KSB8fCBbXTsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBqID0gYy5nZXQoUCkgfHwgW107CiAgICAgICAgaWYgKGoubGVuZ3RoID09PSAwKSBjb250aW51ZTsKICAgICAgICBjb25zdCBFID0gai5tYXAoKEMpID0+IHsKICAgICAgICAgIGNvbnN0IFQgPSBJLmdldChDKTsKICAgICAgICAgIGlmIChUID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgY29uc3QgdiA9IHIoQyk7CiAgICAgICAgICByZXR1cm4gVCArICh0ID8gdi53aWR0aCA6IHYuaGVpZ2h0KSAvIDI7CiAgICAgICAgfSkuZmlsdGVyKChDKSA9PiBDICE9PSBudWxsKTsKICAgICAgICBpZiAoRS5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBDID0gRS5yZWR1Y2UoKEQsICQpID0+IEQgKyAkLCAwKSAvIEUubGVuZ3RoLCBUID0gcihQKSwgdiA9IHQgPyBULndpZHRoIDogVC5oZWlnaHQ7CiAgICAgICAgICBJLnNldChQLCBDIC0gdiAvIDIpOwogICAgICAgIH0KICAgICAgfQogICAgICBsZXQgbSA9IC0xIC8gMCwgYjsKICAgICAgZm9yIChjb25zdCBQIG9mIE8pIHsKICAgICAgICBjb25zdCBqID0gcihQKSwgRSA9IHQgPyBqLndpZHRoIDogai5oZWlnaHQsIEMgPSBNKFApOwogICAgICAgIGxldCBUID0gdzsKICAgICAgICBiICE9PSB2b2lkIDAgJiYgYiAhPT0gQyAmJiAoVCA9IHcgKyAodCA/IEwgKiAyIDogVyArIEcgKiAyKSk7CiAgICAgICAgbGV0IHYgPSBJLmdldChQKSA/PyA4MDsKICAgICAgICB2IDwgbSArIFQgJiYgKHYgPSBtICsgVCwgSS5zZXQoUCwgdikpLCBtID0gdiArIEUsIGIgPSBDOwogICAgICB9CiAgICB9CiAgICBsZXQgTiA9IDEgLyAwOwogICAgZm9yIChjb25zdCBsIG9mIEkudmFsdWVzKCkpIE4gPSBNYXRoLm1pbihOLCBsKTsKICAgIGNvbnN0IEEgPSBOIDwgODAgPyA4MCAtIE4gOiAwOwogICAgZm9yIChjb25zdCBsIG9mIHMpIHsKICAgICAgY29uc3QgeCA9IGYuZ2V0KGwpIHx8IFtdLCBPID0geS5nZXQobCkgfHwgODA7CiAgICAgIGZvciAoY29uc3QgbSBvZiB4KSB7CiAgICAgICAgY29uc3QgYiA9IHIobSksIFAgPSAoSS5nZXQobSkgPz8gODApICsgQSwgQyA9IHsgaWQ6IG0sIHg6IHQgPyBQIDogTywgeTogdCA/IE8gOiBQLCB3aWR0aDogYi53aWR0aCwgaGVpZ2h0OiBiLmhlaWdodCB9OwogICAgICAgIG4uY29udGFpbmVyc1ttXSA/IGVbbV0gPSBDIDogZFttXSA9IEM7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IFMgPSBZLmdldENvbnRhaW5lckRlcHRocyhuKSwgXyA9IE9iamVjdC5rZXlzKG4uY29udGFpbmVycykuc29ydCgKICAgICAgKGwsIHgpID0+IChTLmdldCh4KSB8fCAwKSAtIChTLmdldChsKSB8fCAwKQogICAgKSwgSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtsLCB4XSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkKICAgICAgeC5wYXJlbnRJZCAmJiAoSC5oYXMoeC5wYXJlbnRJZCkgfHwgSC5zZXQoeC5wYXJlbnRJZCwgW10pLCBILmdldCh4LnBhcmVudElkKS5wdXNoKGwpKTsKICAgIGZvciAoY29uc3QgW2wsIHhdIG9mIE9iamVjdC5lbnRyaWVzKG4uY29udGFpbmVycykpCiAgICAgIHgucGFyZW50SWQgJiYgKEguaGFzKHgucGFyZW50SWQpIHx8IEguc2V0KHgucGFyZW50SWQsIFtdKSwgSC5nZXQoeC5wYXJlbnRJZCkucHVzaChsKSk7CiAgICBmb3IgKGNvbnN0IGwgb2YgXykgewogICAgICBpZiAoKHR0ID0gbi5jb250YWluZXJzW2xdKSAhPSBudWxsICYmIHR0LmNvbGxhcHNlZCkgewogICAgICAgIGVbbF0gfHwgKGVbbF0gPSB7CiAgICAgICAgICBpZDogbCwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogcSwKICAgICAgICAgIGhlaWdodDogVgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHggPSBILmdldChsKSB8fCBbXSwgTyA9IFtdOwogICAgICBmb3IgKGNvbnN0IG0gb2YgeCkgewogICAgICAgIGNvbnN0IGIgPSBkW21dIHx8IGVbbV07CiAgICAgICAgYiAmJiBPLnB1c2goYik7CiAgICAgIH0KICAgICAgaWYgKE8ubGVuZ3RoID09PSAwKQogICAgICAgIGVbbF0gfHwgKGVbbF0gPSB7CiAgICAgICAgICBpZDogbCwKICAgICAgICAgIHg6IDgwLAogICAgICAgICAgeTogODAsCiAgICAgICAgICB3aWR0aDogbnQsCiAgICAgICAgICBoZWlnaHQ6IHN0CiAgICAgICAgfSk7CiAgICAgIGVsc2UgewogICAgICAgIGxldCBtID0gMSAvIDAsIGIgPSAtMSAvIDAsIFAgPSAxIC8gMCwgaiA9IC0xIC8gMDsKICAgICAgICBmb3IgKGNvbnN0IEQgb2YgTykKICAgICAgICAgIG0gPSBNYXRoLm1pbihtLCBELngpLCBiID0gTWF0aC5tYXgoYiwgRC54ICsgRC53aWR0aCksIFAgPSBNYXRoLm1pbihQLCBELnkpLCBqID0gTWF0aC5tYXgoaiwgRC55ICsgRC5oZWlnaHQpOwogICAgICAgIGNvbnN0IEUgPSBNYXRoLm1heChiIC0gbSArIEwgKiAyLCBxKSwgQyA9IGogLSBQICsgVyArIEcgKiAyLCBUID0gbSAtIEwsIHYgPSBQIC0gVyAtIEc7CiAgICAgICAgZVtsXSA9IHsgaWQ6IGwsIHg6IFQsIHk6IHYsIHdpZHRoOiBFLCBoZWlnaHQ6IEMgfTsKICAgICAgfQogICAgfQogICAgbGV0IEYgPSAxIC8gMCwgWCA9IDEgLyAwOwogICAgZm9yIChjb25zdCBsIG9mIFsuLi5PYmplY3QudmFsdWVzKGQpLCAuLi5PYmplY3QudmFsdWVzKGUpXSkKICAgICAgRiA9IE1hdGgubWluKEYsIGwueCksIFggPSBNYXRoLm1pbihYLCBsLnkpOwogICAgY29uc3QgQiA9IDYwLCBaID0gRiA8IEIgPyBCIC0gRiA6IDAsIHogPSBYIDwgQiA/IEIgLSBYIDogMDsKICAgIGlmIChaICE9PSAwIHx8IHogIT09IDApIHsKICAgICAgZm9yIChjb25zdCBsIG9mIE9iamVjdC52YWx1ZXMoZCkpCiAgICAgICAgbC54ICs9IFosIGwueSArPSB6OwogICAgICBmb3IgKGNvbnN0IGwgb2YgT2JqZWN0LnZhbHVlcyhlKSkKICAgICAgICBsLnggKz0gWiwgbC55ICs9IHo7CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIGYsIHIpIHsKICAgIHZhciBhLCBoOwogICAgY29uc3QgdCA9IChkKSA9PiBmW2RdIHx8IHJbZF07CiAgICBmb3IgKGNvbnN0IGQgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkgewogICAgICBjb25zdCBlID0gdChkLnNvdXJjZUlkKSwgcyA9IHQoZC50YXJnZXRJZCk7CiAgICAgIGlmICghZSB8fCAhcykgY29udGludWU7CiAgICAgIGNvbnN0IHkgPSBuLm5vZGVzW2Quc291cmNlSWRdIHx8IG4uY29udGFpbmVyc1tkLnNvdXJjZUlkXSwgaSA9IG4ubm9kZXNbZC50YXJnZXRJZF0gfHwgbi5jb250YWluZXJzW2QudGFyZ2V0SWRdLCBvID0gcy54ICsgcy53aWR0aCAvIDIgLSAoZS54ICsgZS53aWR0aCAvIDIpLCB1ID0gcy55ICsgcy5oZWlnaHQgLyAyIC0gKGUueSArIGUuaGVpZ2h0IC8gMiksIHcgPSBNYXRoLmFicyhvKSA+IE1hdGguYWJzKHUpICogMS4yNSwgZyA9IChhID0geSA9PSBudWxsID8gdm9pZCAwIDogeS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGEuZmluZCgoYykgPT4gYy5pZCA9PT0gZC5zb3VyY2VQb3J0SWQpOwogICAgICBnICYmICghZy5zaWRlIHx8IGcuc2lkZSA9PT0gImF1dG8iKSAmJiAodyA/IGcuc2lkZSA9IG8gPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiBnLnNpZGUgPSB1ID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgcCA9IChoID0gaSA9PSBudWxsID8gdm9pZCAwIDogaS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGguZmluZCgoYykgPT4gYy5pZCA9PT0gZC50YXJnZXRQb3J0SWQpOwogICAgICBwICYmICghcC5zaWRlIHx8IHAuc2lkZSA9PT0gImF1dG8iKSAmJiAodyA/IHAuc2lkZSA9IG8gPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiBwLnNpZGUgPSB1ID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhuKSB7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgciA9ICh0KSA9PiB7CiAgICAgIHZhciBkOwogICAgICBpZiAoZi5oYXModCkpIHJldHVybiBmLmdldCh0KTsKICAgICAgY29uc3QgYSA9IChkID0gbi5jb250YWluZXJzW3RdKSA9PSBudWxsID8gdm9pZCAwIDogZC5wYXJlbnRJZDsKICAgICAgaWYgKCFhIHx8ICFuLmNvbnRhaW5lcnNbYV0pCiAgICAgICAgcmV0dXJuIGYuc2V0KHQsIDApLCAwOwogICAgICBjb25zdCBoID0gMSArIHIoYSk7CiAgICAgIHJldHVybiBmLnNldCh0LCBoKSwgaDsKICAgIH07CiAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmtleXMobi5jb250YWluZXJzKSkKICAgICAgcih0KTsKICAgIHJldHVybiBmOwogIH0KfQpjbGFzcyBhdCB7CiAgYXN5bmMgZXhlY3V0ZShuLCBmLCByKSB7CiAgICBjb25zdCB0ID0gT2JqZWN0LnZhbHVlcyhuLmNvbnRhaW5lcnMpLCBhID0gT2JqZWN0LnZhbHVlcyhuLm5vZGVzKSwgaCA9IG5ldyBTZXQoCiAgICAgIHQuZmlsdGVyKChvKSA9PiAhIW8uY29sbGFwc2VkKS5tYXAoKG8pID0+IG8uaWQpCiAgICApLCBkID0gKG8pID0+IHsKICAgICAgdmFyIHc7CiAgICAgIGxldCB1ID0gbzsKICAgICAgZm9yICg7IHU7ICkgewogICAgICAgIGlmIChoLmhhcyh1KSkgcmV0dXJuICEwOwogICAgICAgIHUgPSAodyA9IG4uY29udGFpbmVyc1t1XSkgPT0gbnVsbCA/IHZvaWQgMCA6IHcucGFyZW50SWQ7CiAgICAgIH0KICAgICAgcmV0dXJuICExOwogICAgfSwgZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IFtvLCB1XSBvZiBPYmplY3QuZW50cmllcyhuLm5vZGVzKSkKICAgICAgZCh1LnBhcmVudElkKSB8fCBlLmFkZChvKTsKICAgIGZvciAoY29uc3QgW28sIHVdIG9mIE9iamVjdC5lbnRyaWVzKG4uY29udGFpbmVycykpIHsKICAgICAgY29uc3QgdyA9IHU7CiAgICAgIHcuY29sbGFwc2VkID8gZCh3LnBhcmVudElkKSB8fCBlLmFkZChvKSA6ICEoYS5zb21lKChwKSA9PiBwLnBhcmVudElkID09PSBvKSB8fCB0LnNvbWUoKHApID0+IHAucGFyZW50SWQgPT09IG8pKSAmJiAhZCh3LnBhcmVudElkKSAmJiBlLmFkZChvKTsKICAgIH0KICAgIGNvbnN0IHMgPSBvdC5kZWNvdXBsZShuLCBlKSwgeSA9IGN0LmFzc2lnbkxheWVycyhzLmFsbEVudGl0eUlkcywgcy5hZGpMaXN0KSwgaSA9IFIubWluaW1pemVDcm9zc2luZ3MoeSwgcy5hZGpMaXN0LCA0LCBuKTsKICAgIHJldHVybiBZLmFzc2lnbkNvb3JkaW5hdGVzKG4sIGksIGYsIHIpOwogIH0KfQpjb25zdCBkdCA9IG5ldyBhdCgpOwpzZWxmLm9ubWVzc2FnZSA9IGFzeW5jIChKKSA9PiB7CiAgY29uc3QgeyBpZDogbiwgZ3JhcGg6IGYsIG1lYXN1cmVtZW50czogciwgb3B0aW9uczogdCB9ID0gSi5kYXRhOwogIHRyeSB7CiAgICBjb25zdCBhID0gbmV3IE1hcChyKSwgaCA9IGF3YWl0IGR0LmV4ZWN1dGUoZiwgYSwgdCk7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IG4sIHN1Y2Nlc3M6ICEwLCBsYXlvdXQ6IGggfSk7CiAgfSBjYXRjaCAoYSkgewogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBuLCBzdWNjZXNzOiAhMSwgZXJyb3I6IGEubWVzc2FnZSB9KTsKICB9Cn07Cg==", ue = (i) => Uint8Array.from(atob(i), (g) => g.charCodeAt(0)), Vt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", ue(Qt)], { type: "text/javascript;charset=utf-8" });
function he(i) {
  let g;
  try {
    if (g = Vt && (self.URL || self.webkitURL).createObjectURL(Vt), !g) throw "";
    const s = new Worker(g, {
      type: "module",
      name: i == null ? void 0 : i.name
    });
    return s.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(g);
    }), s;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Qt,
      {
        type: "module",
        name: i == null ? void 0 : i.name
      }
    );
  }
}
class ye {
  constructor() {
    Lt(this, "worker", null);
    Lt(this, "pendingRequests", /* @__PURE__ */ new Map());
    Lt(this, "fallbackEngine", new ae());
    if (typeof Worker < "u")
      try {
        this.worker = new he(), this.worker.onmessage = (g) => {
          const { id: s, success: n, layout: I, error: d } = g.data, c = this.pendingRequests.get(s);
          c && (this.pendingRequests.delete(s), n ? c.resolve(I) : c.reject(new Error(d)));
        }, this.worker.onerror = (g) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", g);
        };
      } catch (g) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", g), this.worker = null;
      }
  }
  execute(g, s, n) {
    return this.worker ? new Promise((I, d) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: I, reject: d });
      const l = Array.from(s.entries());
      this.worker.postMessage({
        id: c,
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
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: s, hoveredEdge: n, hoveredEntity: I, graph: d } = g;
    if (I && d.containers[I.id])
      return I.id !== s.id && s.parentId !== I.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: s.id,
          newParentId: I.id
        }
      } : null;
    if (!I && !n && s.parentId !== null && s.parentId !== void 0)
      return {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: s.id,
          newParentId: null
        }
      };
    const c = (l) => {
      const o = d.nodes[l.id] || l;
      if (!o.ports || o.ports.length === 0) return "";
      const r = Object.values(d.edges).find((A) => A.targetId === l.id);
      if (r) {
        const A = o.ports.find((y) => y.id === r.targetPortId);
        if (A) return A.id;
      }
      const f = new Set(
        Object.values(d.edges).filter((A) => A.sourceId === l.id).map((A) => A.sourcePortId)
      ), u = o.ports.find((A) => !f.has(A.id));
      return u ? u.id : o.ports[0].id;
    };
    if (n)
      return n.sourceId === s.id || n.targetId === s.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: n.id,
          newSourceId: n.sourceId,
          newTargetId: s.id,
          newTargetPortId: c(s)
        }
      };
    if (I && I.id !== s.id && d.nodes[I.id]) {
      const l = Object.values(d.edges).find(
        (o) => o.targetId === I.id && o.sourceId !== s.id
      );
      if (l)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: l.id,
            newSourceId: l.sourceId,
            newTargetId: s.id,
            newTargetPortId: c(s)
          }
        };
    }
    return null;
  }
}
function fe(i, g = { min: 0.15, max: 3 }) {
  const [s, n] = et({ x: 80, y: 80, zoom: 1 }), I = Ct(!1), d = Ct({ x: 0, y: 0 }), c = M(
    (h, e) => {
      if (!i.current) return { x: h, y: e };
      const t = i.current.getBoundingClientRect();
      return {
        x: (h - t.left - s.x) / s.zoom,
        y: (e - t.top - s.y) / s.zoom
      };
    },
    [s, i]
  ), l = M(
    (h) => {
      if (!i.current) return;
      const e = [
        ...Object.values(h.nodes),
        ...Object.values(h.containers)
      ];
      if (e.length === 0) {
        n({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, C = 1 / 0, w = -1 / 0, B = -1 / 0;
      for (const Q of e)
        t = Math.min(t, Q.x), C = Math.min(C, Q.y), w = Math.max(w, Q.x + Q.width), B = Math.max(B, Q.y + Q.height);
      const K = i.current.getBoundingClientRect(), m = 80, p = Math.max(w - t, 100), E = Math.max(B - C, 100), W = (K.width - m * 2) / p, x = (K.height - m * 2) / E, L = Math.min(
        Math.max(Math.min(W, x), g.min),
        Math.min(g.max, 1.25)
      ), X = (K.width - p * L) / 2 - t * L, V = (K.height - E * L) / 2 - C * L;
      n({
        x: X,
        y: V,
        zoom: L
      });
    },
    [i, g]
  ), o = M(
    (h) => {
      if (h.preventDefault(), !!i.current)
        if (h.ctrlKey || h.metaKey) {
          const e = i.current.getBoundingClientRect(), t = h.clientX - e.left, C = h.clientY - e.top, w = h.deltaY < 0 ? 1.08 : 0.92, B = Math.min(Math.max(s.zoom * w, g.min), g.max), K = t - (t - s.x) * (B / s.zoom), m = C - (C - s.y) * (B / s.zoom);
          n({ x: K, y: m, zoom: B });
        } else
          n((e) => ({
            ...e,
            x: e.x - h.deltaX,
            y: e.y - h.deltaY
          }));
    },
    [s, g, i]
  ), r = M(
    (h, e) => {
      I.current = !0, d.current = { x: h - s.x, y: e - s.y };
    },
    [s]
  ), f = M((h, e) => {
    I.current && n((t) => ({
      ...t,
      x: h - d.current.x,
      y: e - d.current.y
    }));
  }, []), u = M(() => {
    I.current = !1;
  }, []), A = M(() => {
    n({ x: 80, y: 80, zoom: 1 });
  }, []), y = M(() => {
    n((h) => ({
      ...h,
      zoom: Math.min(h.zoom * 1.2, g.max)
    }));
  }, [g]), b = M(() => {
    n((h) => ({
      ...h,
      zoom: Math.max(h.zoom / 1.2, g.min)
    }));
  }, [g]);
  return {
    transform: s,
    setTransform: n,
    screenToWorld: c,
    onWheel: o,
    startPan: r,
    updatePan: f,
    endPan: u,
    resetTransform: A,
    zoomIn: y,
    zoomOut: b,
    zoomToFit: l,
    isPanning: I
  };
}
function we(i) {
  const [g, s] = et(
    /* @__PURE__ */ new Map()
  );
  Ct(/* @__PURE__ */ new Map());
  const n = Ct(/* @__PURE__ */ new Map()), I = M((d, c) => {
    c ? n.current.set(d, c) : n.current.delete(d);
  }, []);
  return Yt(() => {
    const d = new ResizeObserver((c) => {
      let l = !1;
      const o = new Map(g);
      for (const r of c) {
        const f = r.target.getAttribute("data-sysflow-measure-id");
        if (!f) continue;
        const u = Math.ceil(r.contentRect.width), A = Math.ceil(r.contentRect.height), y = o.get(f);
        (!y || y.width !== u || y.height !== A) && (o.set(f, { width: u, height: A }), l = !0);
      }
      l && s(o);
    });
    return n.current.forEach((c) => d.observe(c)), () => {
      d.disconnect();
    };
  }, [i]), { measurements: g, registerMeasureElement: I };
}
function be(i, g, s, n, I) {
  const [d, c] = et(null), [l, o] = et(null), r = Ct(null), f = Ct(null), u = M(
    (e, t) => {
      let C = null, w = 1 / 0;
      for (const [B, K] of Object.entries(g.containers))
        if (B !== t && e.x >= K.x && e.x <= K.x + K.width && e.y >= K.y && e.y <= K.y + K.height) {
          const m = K.width * K.height;
          m < w && (w = m, C = i.containers[B] || null);
        }
      if (C) return C;
      for (const [B, K] of Object.entries(g.nodes))
        if (B !== t && e.x >= K.x && e.x <= K.x + K.width && e.y >= K.y && e.y <= K.y + K.height)
          return i.nodes[B] || null;
      return null;
    },
    [g, i]
  ), A = M(
    (e, t) => {
      let C = null, w = 45;
      for (const B of Object.values(i.edges)) {
        if (B.sourceId === t || B.targetId === t) continue;
        const K = g.nodes[B.sourceId] || g.containers[B.sourceId], m = g.nodes[B.targetId] || g.containers[B.targetId];
        if (!K || !m) continue;
        const p = K.x + K.width, E = K.y + K.height / 2, W = m.x, x = m.y + m.height / 2;
        for (let L = 0; L <= 10; L++) {
          const X = L / 10, V = (1 - X) * p + X * W, Q = (1 - X) * E + X * x, S = Math.hypot(e.x - V, e.y - Q);
          S < w && (w = S, C = B);
        }
      }
      return C;
    },
    [g, i]
  ), y = M(
    (e, t) => {
      if (t.stopPropagation(), s.canDrag && !s.canDrag(e, i))
        return;
      const C = n(t.clientX, t.clientY);
      c({
        draggedEntity: e,
        ghostPosition: C
      });
    },
    [i, s, n]
  ), b = M(
    (e) => {
      if (!d) return;
      const t = n(e.clientX, e.clientY), C = u(t, d.draggedEntity.id), w = A(t, d.draggedEntity.id);
      r.current = C, f.current = w, C && i.containers[C.id] ? o(C.id) : o(null);
      const B = s.onDragMove ? s.onDragMove({
        draggedEntity: d.draggedEntity,
        cursorWorld: t,
        hoveredEntity: C,
        hoveredEdge: w,
        graph: i
      }) : t;
      B && c((K) => K ? { ...K, ghostPosition: B } : null);
    },
    [d, n, s, i, u, A]
  ), h = M(
    (e) => {
      if (!d) return;
      const t = n(e.clientX, e.clientY), C = u(t, d.draggedEntity.id), w = A(t, d.draggedEntity.id), B = s.onDragEnd({
        draggedEntity: d.draggedEntity,
        cursorWorld: t,
        hoveredEntity: C,
        hoveredEdge: w,
        graph: i
      });
      B && I(B), c(null), o(null), r.current = null, f.current = null;
    },
    [d, n, s, i, u, A, I]
  );
  return {
    dragState: d,
    hoveredContainerId: l,
    handlePointerDown: y,
    handlePointerMove: b,
    handlePointerUp: h
  };
}
function Ye(i) {
  const [g, s] = et([i]), [n, I] = et(0), [d, c] = et(null), l = g[n], o = M((e) => {
    const t = de(e);
    s((C) => [...C.slice(0, n + 1), t]), I((C) => C + 1);
  }, [n]), r = M(() => {
    n > 0 && I((e) => e - 1);
  }, [n]), f = M(() => {
    n < g.length - 1 && I((e) => e + 1);
  }, [n, g.length]), u = M((e) => {
    var C, w, B, K;
    const t = g[n];
    if (e.type === "ENTITY_REPARENT") {
      const { entityId: m, newParentId: p } = e.payload, E = {
        ...t,
        nodes: { ...t.nodes },
        containers: { ...t.containers }
      };
      E.nodes[m] ? E.nodes[m] = { ...E.nodes[m], parentId: p } : E.containers[m] && (E.containers[m] = { ...E.containers[m], parentId: p }), o(E);
    } else if (e.type === "EDGE_SPLIT_INSERT_NODE") {
      const { edge: m, direction: p, suggestedNewNodeId: E, suggestedNewEdge1Id: W, suggestedNewEdge2Id: x } = e.payload, L = t.edges[m.id];
      if (!L) return;
      const X = p === "BT", V = p === "TB", Q = `p_in_${Date.now()}`, S = `p_out_${Date.now()}`;
      let H = "left", a = "right";
      X ? (H = "bottom", a = "top") : V ? (H = "top", a = "bottom") : p === "RL" && (H = "right", a = "left");
      const P = t.nodes[L.sourceId], Y = {
        id: E,
        label: `Node ${Object.keys(t.nodes).length + 1}`,
        type: (P == null ? void 0 : P.type) || "FlowTask",
        parentId: (P == null ? void 0 : P.parentId) ?? null,
        ports: [
          { id: Q, label: "in", side: H },
          { id: S, label: "out", side: a }
        ]
      }, Z = {
        id: W,
        sourceId: L.sourceId,
        sourcePortId: L.sourcePortId,
        targetId: E,
        targetPortId: Q
      }, J = {
        id: x,
        sourceId: E,
        sourcePortId: S,
        targetId: L.targetId,
        targetPortId: L.targetPortId
      }, v = { ...t.edges };
      delete v[L.id], v[W] = Z, v[x] = J, o({
        ...t,
        nodes: { ...t.nodes, [E]: Y },
        edges: v
      });
    } else if (e.type === "NODE_ADD_CONNECTED") {
      const { sourceNode: m, position: p, direction: E, suggestedNewNodeId: W, suggestedNewEdgeId: x } = e.payload, L = E === "BT", X = `p_in_${Date.now()}`, V = `p_out_${Date.now()}`, Q = {
        id: W,
        label: `Node ${Object.keys(t.nodes).length + 1}`,
        type: m.type,
        ports: [
          { id: X, label: "in", side: L ? "bottom" : "top" },
          { id: V, label: "out", side: L ? "top" : "bottom" }
        ]
      }, S = m.ports.find((Y) => Y.label === "in") || m.ports[0], H = m.ports.find((Y) => Y.label === "out") || m.ports[m.ports.length - 1];
      let a;
      L && p === "bottom" || !L && p === "top" ? a = {
        id: x,
        sourceId: W,
        sourcePortId: V,
        targetId: m.id,
        targetPortId: (S == null ? void 0 : S.id) || "in"
      } : a = {
        id: x,
        sourceId: m.id,
        sourcePortId: (H == null ? void 0 : H.id) || "out",
        targetId: W,
        targetPortId: X
      }, o({
        ...t,
        nodes: { ...t.nodes, [W]: Q },
        edges: { ...t.edges, [x]: a }
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
      const E = p, W = t.edges[m], x = W.targetId, L = Object.values(t.edges).find((a) => a.targetId === E), X = Object.values(t.edges).find((a) => a.sourceId === E), V = { ...t.edges };
      L && X && (V[L.id] = { ...L, targetId: X.targetId, targetPortId: X.targetPortId }, delete V[X.id]);
      const Q = ((w = (C = t.nodes[E]) == null ? void 0 : C.ports[0]) == null ? void 0 : w.id) || "p_in", S = ((K = (B = t.nodes[E]) == null ? void 0 : B.ports.find((a) => a.id !== Q)) == null ? void 0 : K.id) || Q;
      V[m] = {
        ...W,
        targetId: E,
        targetPortId: Q
      };
      const H = `REWIRE_${Date.now()}`;
      V[H] = {
        id: H,
        sourceId: E,
        sourcePortId: S,
        targetId: x,
        targetPortId: W.targetPortId
      }, o({ ...t, edges: V });
    }
  }, [g, n, o]), A = M((e) => {
    const t = l.nodes[e] || l.containers[e];
    t && c({ entity: JSON.parse(JSON.stringify(t)), isCut: !1 });
  }, [l]), y = M((e) => {
    const t = l.nodes[e] || l.containers[e];
    if (t) {
      c({ entity: JSON.parse(JSON.stringify(t)), isCut: !0 });
      const C = { ...l.nodes }, w = { ...l.containers };
      delete C[e], delete w[e], o({ ...l, nodes: C, containers: w });
    }
  }, [l, o]), b = M(() => {
    if (!d) return;
    const e = d.entity, t = `${e.id}_copy_${Date.now().toString().slice(-4)}`, C = { ...e, id: t, label: `${e.label} (Copy)` };
    "collapsed" in C ? o({
      ...l,
      containers: { ...l.containers, [t]: C }
    }) : o({
      ...l,
      nodes: { ...l.nodes, [t]: C }
    });
  }, [d, l, o]), h = M((e) => {
    if (e.length === 0) return;
    const t = { ...l.nodes }, C = { ...l.containers }, w = { ...l.edges };
    for (const B of e)
      delete t[B], delete C[B], delete w[B];
    o({
      ...l,
      nodes: t,
      containers: C,
      edges: w
    });
  }, [l, o]);
  return {
    graph: l,
    setGraphDirect: o,
    applyAction: u,
    undo: r,
    redo: f,
    copyEntity: A,
    cutEntity: y,
    pasteEntity: b,
    deleteSelection: h,
    canUndo: n > 0,
    canRedo: n < g.length - 1
  };
}
const me = ({
  graph: i,
  registerMeasureElement: g,
  nodeTypes: s,
  containerTypes: n
}) => {
  const I = Object.values(i.nodes), d = Object.values(i.containers);
  return /* @__PURE__ */ U("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((c) => {
      const l = c.type ? s == null ? void 0 : s[c.type] : null;
      return /* @__PURE__ */ N(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ N(l, { node: c, selected: !1 }) : /* @__PURE__ */ U("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ N("div", { style: { fontWeight: 600 }, children: c.label }),
            c.ports.length > 0 && /* @__PURE__ */ U("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              c.ports.map((o) => o.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${c.id}`
      );
    }),
    d.map((c) => {
      const l = c.type ? n == null ? void 0 : n[c.type] : null;
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
}, Se = ({
  graph: i,
  layout: g,
  selectedIds: s,
  direction: n = "TB",
  showArrows: I = !0,
  routing: d = "auto",
  portOptions: c,
  enableEdgeQuickAdd: l = !0,
  onEdgeClick: o,
  onInsertNodeOnEdge: r
}) => {
  const [f, u] = et(null), A = d === "step" || d === "auto" && (n === "LR" || n === "RL"), y = (e, t, C) => {
    var V, Q, S, H;
    let w = e, B = null;
    for ((V = i.containers[e]) != null && V.collapsed && (B = i.containers[e]); w; ) {
      const a = ((Q = i.nodes[w]) == null ? void 0 : Q.parentId) ?? ((S = i.containers[w]) == null ? void 0 : S.parentId) ?? null;
      a && ((H = i.containers[a]) != null && H.collapsed) && (B = i.containers[a]), w = a;
    }
    if (B) {
      const a = g.containers[B.id];
      if (!a)
        return { x: 0, y: 0, side: C ? "right" : "left", valid: !1, entityId: B.id };
      let P, Y, Z;
      return n === "TB" ? (P = C ? "bottom" : "top", Y = a.x + a.width / 2, Z = C ? a.y + a.height : a.y) : n === "BT" ? (P = C ? "top" : "bottom", Y = a.x + a.width / 2, Z = C ? a.y : a.y + a.height) : n === "RL" ? (P = C ? "left" : "right", Y = C ? a.x : a.x + a.width, Z = a.y + a.height / 2) : (P = C ? "right" : "left", Y = C ? a.x + a.width : a.x, Z = a.y + a.height / 2), { x: Y, y: Z, side: P, valid: !0, entityId: B.id };
    }
    if (!!i.containers[e]) {
      const a = g.containers[e];
      if (!a) return { x: 0, y: 0, side: C ? "right" : "left", valid: !1, entityId: e };
      let P, Y, Z;
      return n === "TB" ? (P = a.x + a.width / 2, Y = C ? a.y + a.height : a.y, Z = C ? "bottom" : "top") : n === "BT" ? (P = a.x + a.width / 2, Y = C ? a.y : a.y + a.height, Z = C ? "top" : "bottom") : n === "RL" ? (P = C ? a.x : a.x + a.width, Y = a.y + a.height / 2, Z = C ? "left" : "right") : (P = C ? a.x + a.width : a.x, Y = a.y + a.height / 2, Z = C ? "right" : "left"), { x: P, y: Y, side: Z, valid: !0, entityId: e };
    }
    const m = i.nodes[e], p = g.nodes[e];
    if (!m || !p)
      return { x: 0, y: 0, side: C ? "right" : "left", valid: !1, entityId: e };
    const W = Dt(
      m,
      p,
      n,
      i.edges,
      c
    ).get(t);
    if (W)
      return { x: W.worldX, y: W.worldY, side: W.side, valid: !0, entityId: e };
    let x, L, X;
    return n === "TB" ? (x = p.x + p.width / 2, L = C ? p.y + p.height : p.y, X = C ? "bottom" : "top") : n === "BT" ? (x = p.x + p.width / 2, L = C ? p.y : p.y + p.height, X = C ? "top" : "bottom") : n === "RL" ? (x = C ? p.x : p.x + p.width, L = p.y + p.height / 2, X = C ? "left" : "right") : (x = C ? p.x + p.width : p.x, L = p.y + p.height / 2, X = C ? "right" : "left"), { x, y: L, side: X, valid: !0, entityId: e };
  }, b = (e, t) => {
    const C = (e.x + t.x) / 2, w = (e.y + t.y) / 2;
    if (e.side === "right" && t.side === "left") {
      if (t.x >= e.x + 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${C} ${e.y} L ${C} ${t.y} L ${t.x} ${t.y}`,
          center: { x: C, y: w }
        };
      {
        const B = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x + 20} ${e.y} L ${e.x + 20} ${B} L ${t.x - 20} ${B} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: C, y: B }
        };
      }
    }
    if (e.side === "left" && t.side === "right") {
      if (t.x <= e.x - 20)
        return {
          pathStr: `M ${e.x} ${e.y} L ${C} ${e.y} L ${C} ${t.y} L ${t.x} ${t.y}`,
          center: { x: C, y: w }
        };
      {
        const B = t.y >= e.y ? e.y - 40 : e.y + 40;
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x - 20} ${e.y} L ${e.x - 20} ${B} L ${t.x + 20} ${B} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: C, y: B }
        };
      }
    }
    if (e.side === "bottom" && t.side === "top") {
      if (t.y >= e.y + 16)
        return {
          pathStr: `M ${e.x} ${e.y} L ${e.x} ${w} L ${t.x} ${w} L ${t.x} ${t.y}`,
          center: { x: C, y: w }
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
          center: { x: C, y: w }
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
      pathStr: `M ${e.x} ${e.y} L ${C} ${e.y} L ${C} ${t.y} L ${t.x} ${t.y}`,
      center: { x: C, y: w }
    };
  }, h = (e, t) => {
    const C = t.x - e.x, w = t.y - e.y;
    let B = e.x, K = e.y, m = t.x, p = t.y;
    if (e.side === "bottom" && t.side === "top")
      if (w > 0) {
        const x = Math.min(28, w * 0.4);
        K = e.y + Math.max(x, w * 0.5), p = t.y - Math.max(x, w * 0.5);
      } else {
        const x = C >= 0 ? 1 : -1, L = Math.max(40, Math.abs(C) * 0.2);
        B = e.x + L * x, K = e.y + 40, m = t.x + L * x, p = t.y - 40;
      }
    else if (e.side === "top" && t.side === "bottom")
      if (w < 0) {
        const x = Math.min(28, Math.abs(w) * 0.4);
        K = e.y - Math.max(x, Math.abs(w) * 0.5), p = t.y + Math.max(x, Math.abs(w) * 0.5);
      } else {
        const x = C >= 0 ? 1 : -1, L = Math.max(40, Math.abs(C) * 0.2);
        B = e.x + L * x, K = e.y - 40, m = t.x + L * x, p = t.y + 40;
      }
    else if (e.side === "right" && t.side === "left")
      C > 0 ? (B = e.x + C * 0.5, m = t.x - C * 0.5) : (B = e.x + 50, K = e.y - 50, m = t.x - 50, p = t.y - 50);
    else if (e.side === "left" && t.side === "right")
      C < 0 ? (B = e.x + C * 0.5, m = t.x - C * 0.5) : (B = e.x - 50, K = e.y - 50, m = t.x + 50, p = t.y - 50);
    else {
      const x = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, L = x[e.side] || { x: 0, y: 1 }, X = x[t.side] || { x: 0, y: -1 }, V = Math.min(60, Math.hypot(C, w) * 0.35);
      B = e.x + L.x * V, K = e.y + L.y * V, m = t.x + X.x * V, p = t.y + X.y * V;
    }
    const E = 0.125 * e.x + 0.375 * B + 0.375 * m + 0.125 * t.x, W = 0.125 * e.y + 0.375 * K + 0.375 * p + 0.125 * t.y;
    return {
      pathStr: `M ${e.x} ${e.y} C ${B} ${K} ${m} ${p} ${t.x} ${t.y}`,
      center: { x: E, y: W }
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
    Object.values(i.edges).map((e) => {
      const t = y(e.sourceId, e.sourcePortId, !0), C = y(e.targetId, e.targetPortId, !1);
      if (!t.valid || !C.valid || t.entityId === C.entityId) return null;
      const w = s.includes(e.id), B = f === e.id, { pathStr: K, center: m } = A ? b(t, C) : h(t, C);
      return /* @__PURE__ */ U(
        "g",
        {
          onMouseEnter: () => u(e.id),
          onMouseLeave: () => u(null),
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
                stroke: w ? "var(--sysflow-edge-selected)" : B ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: w ? 2.5 : B ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: I ? w ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            l && B && r && /* @__PURE__ */ N("g", { transform: `translate(${m.x}, ${m.y})`, children: /* @__PURE__ */ U(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (p) => {
                  p.preventDefault(), p.stopPropagation(), r(e);
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
  entity: i,
  layout: g,
  direction: s = "LR",
  edges: n,
  portOptions: I,
  onPortPointerDown: d,
  onPortPointerUp: c
}) => {
  if (!i.ports || i.ports.length === 0)
    return null;
  const l = Dt(
    i,
    g,
    s,
    n,
    I
  );
  return /* @__PURE__ */ N(Et, { children: i.ports.map((o) => {
    const r = l.get(o.id);
    return r ? /* @__PURE__ */ N(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${r.side}`,
        style: {
          position: "absolute",
          left: `${r.localX}px`,
          top: `${r.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${o.label} (${r.side})`,
        onPointerDown: (f) => {
          f.stopPropagation(), d == null || d(i.id, o.id, !0, f);
        },
        onPointerUp: (f) => {
          f.stopPropagation(), c == null || c(i.id, o.id, !1);
        }
      },
      o.id
    ) : null;
  }) });
}, Ke = ({
  node: i,
  layout: g,
  selected: s = !1,
  direction: n = "LR",
  edges: I,
  portOptions: d,
  enableQuickAdd: c = !1,
  onAddConnectedNode: l,
  onPointerDown: o,
  onMouseEnter: r,
  onMouseLeave: f,
  onClick: u,
  onPortPointerDown: A,
  onPortPointerUp: y,
  customRenderer: b
}) => {
  const [h, e] = et(!1);
  return /* @__PURE__ */ U(
    "div",
    {
      className: `sysflow-node ${s ? "sysflow-selected" : ""} ${i.className || ""}`,
      style: {
        transform: `translate(${g.x}px, ${g.y}px)`,
        width: `${g.width}px`,
        height: `${g.height}px`
      },
      onPointerDown: (t) => o == null ? void 0 : o(i, t),
      onMouseEnter: () => {
        e(!0), r == null || r(i.id);
      },
      onMouseLeave: () => {
        e(!1), f == null || f(i.id);
      },
      onClick: u,
      children: [
        c && h && /* @__PURE__ */ U(Et, { children: [
          /* @__PURE__ */ N("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ N("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        c && h && l && /* @__PURE__ */ N(
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
          Ge,
          {
            entity: i,
            layout: g,
            direction: n,
            edges: I,
            portOptions: d,
            onPortPointerDown: A,
            onPortPointerUp: y
          }
        ),
        b ? /* @__PURE__ */ N(b, { node: i, selected: s }) : /* @__PURE__ */ U("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ N("div", { style: { fontWeight: 600, fontSize: "13px" }, children: i.label }),
          i.ports.length > 0 && /* @__PURE__ */ U("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            i.ports.length,
            " Port",
            i.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        c && h && l && /* @__PURE__ */ N(
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
}, pe = ({
  container: i,
  layout: g,
  selected: s,
  isHovered: n = !1,
  hasChildren: I = !1,
  onToggleCollapse: d,
  onPointerDown: c,
  onMouseEnter: l,
  onMouseLeave: o,
  onClick: r,
  customRenderer: f
}) => /* @__PURE__ */ N(
  "div",
  {
    className: `sysflow-container ${s ? "sysflow-selected" : ""} ${n ? "sysflow-hovered" : ""} ${i.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (u) => c(i, u),
    onMouseEnter: l,
    onMouseLeave: o,
    onClick: r,
    children: f ? /* @__PURE__ */ N(f, { container: i, selected: s }) : /* @__PURE__ */ U(Et, { children: [
      /* @__PURE__ */ U("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ N("span", { className: "sysflow-container-title", title: i.label, children: i.label }),
        /* @__PURE__ */ N(
          "button",
          {
            className: "sysflow-collapse-btn",
            onClick: (u) => {
              u.stopPropagation(), d(i.id, !i.collapsed);
            },
            children: i.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !i.collapsed && !I && /* @__PURE__ */ N("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Ze = new Be(), Ee = ({
  graph: i,
  onChange: g,
  layoutEngine: s,
  interactionStrategy: n = Ze,
  direction: I = "TB",
  layoutOptions: d,
  portPlacementMode: c,
  routing: l,
  showEdgeArrows: o = !0,
  nodeTypes: r,
  containerTypes: f,
  zoomBounds: u,
  className: A = "",
  selectedIds: y = [],
  theme: b = "dark",
  enableQuickAdd: h,
  enableEdgeQuickAdd: e
}) => {
  var Nt, Tt;
  const t = Ct(null), C = Ct(null);
  !s && !C.current && (C.current = new ye());
  const w = s || C.current, {
    transform: B,
    screenToWorld: K,
    onWheel: m,
    startPan: p,
    updatePan: E,
    endPan: W,
    resetTransform: x,
    zoomIn: L,
    zoomOut: X,
    zoomToFit: V,
    isPanning: Q
  } = fe(t, u), { measurements: S, registerMeasureElement: H } = we(i), [a, P] = et({ nodes: {}, containers: {} }), Y = ne(() => ({
    direction: I,
    mode: c ?? (I === "TB" || I === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: a.nodes
  }), [I, c, a.nodes]), [Z, J] = et(null), [v, z] = et(null), $ = Ct(!1), {
    dragState: R,
    hoveredContainerId: _,
    handlePointerDown: it,
    handlePointerMove: dt,
    handlePointerUp: ht
  } = be(i, a, n, K, g);
  Yt(() => {
    const G = (k) => {
      if (k.target instanceof HTMLInputElement || k.target instanceof HTMLTextAreaElement)
        return;
      if (k.key === "Escape") {
        k.preventDefault(), z(null), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (k.code === "Space" && ($.current = !0), k.key.toLowerCase() === "f" && !k.ctrlKey && !k.metaKey) {
        k.preventDefault(), V(a);
        return;
      }
      if ((k.ctrlKey || k.metaKey) && k.key.toLowerCase() === "a") {
        k.preventDefault();
        const j = [
          ...Object.keys(i.nodes),
          ...Object.keys(i.containers)
        ];
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: j } });
        return;
      }
      const D = Object.keys(i.nodes);
      if (D.length !== 0) {
        if (k.key === "Tab") {
          k.preventDefault();
          const j = y.length > 0 ? D.indexOf(y[0]) : -1;
          let F;
          k.shiftKey ? F = j <= 0 ? D.length - 1 : j - 1 : F = (j + 1) % D.length, g({ type: "SELECTION_CHANGE", payload: { selectedIds: [D[F]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k.key)) {
          k.preventDefault();
          const j = y[0] || D[0], F = a.nodes[j] || a.containers[j];
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
            if (k.key === "ArrowRight" && Bt > 20 && (ot = !0), k.key === "ArrowLeft" && Bt < -20 && (ot = !0), k.key === "ArrowDown" && at > 20 && (ot = !0), k.key === "ArrowUp" && at < -20 && (ot = !0), ot) {
              const q = Math.hypot(Bt, at);
              q < At && (At = q, O = yt);
            }
          }
          O && g({ type: "SELECTION_CHANGE", payload: { selectedIds: [O] } });
        }
      }
    }, T = (k) => {
      k.code === "Space" && ($.current = !1);
    };
    return window.addEventListener("keydown", G), window.addEventListener("keyup", T), () => {
      window.removeEventListener("keydown", G), window.removeEventListener("keyup", T);
    };
  }, [i, a, y, V, g]), Yt(() => {
    let G = !1, T = 16 / 9;
    if (t.current) {
      const D = t.current.getBoundingClientRect();
      D.width > 0 && D.height > 0 && (T = D.width / D.height);
    }
    const k = {
      direction: I,
      aspectRatio: T,
      ...d
    };
    return w.execute(i, S, k).then((D) => {
      G || P(D);
    }), () => {
      G = !0;
    };
  }, [i, S, w, I, d]);
  const Kt = (G, T, k, D) => {
    const j = i.nodes[G] || i.containers[G], F = a.nodes[G] || a.containers[G];
    if (!j || !F) return;
    const O = Dt(
      j,
      F,
      I,
      i.edges,
      Y
    ).get(T), At = O ? { x: O.worldX, y: O.worldY } : { x: F.x + F.width, y: F.y + F.height / 2 };
    J({
      sourceId: G,
      sourcePortId: T,
      startWorldPos: At,
      currentWorldPos: K(D.clientX, D.clientY)
    });
  }, Mt = (G, T, k) => {
    var D, j, F, gt, O, At, yt, ct, bt, Bt;
    if (Z && Z.sourceId !== G) {
      const at = i.nodes[Z.sourceId] || i.containers[Z.sourceId], ot = i.nodes[G] || i.containers[G], q = (D = at == null ? void 0 : at.ports) == null ? void 0 : D.find((ft) => ft.id === Z.sourcePortId), tt = (j = ot == null ? void 0 : ot.ports) == null ? void 0 : j.find((ft) => ft.id === T);
      let mt = Z.sourceId, pt = Z.sourcePortId, St = G, Zt = T;
      const _t = ((F = q == null ? void 0 : q.label) == null ? void 0 : F.toLowerCase().includes("in")) || (q == null ? void 0 : q.side) === (I === "BT" ? "bottom" : "top"), qt = ((gt = q == null ? void 0 : q.label) == null ? void 0 : gt.toLowerCase().includes("out")) || (q == null ? void 0 : q.side) === (I === "BT" ? "top" : "bottom"), te = ((O = tt == null ? void 0 : tt.label) == null ? void 0 : O.toLowerCase().includes("in")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "bottom" : "top"), ee = ((At = tt == null ? void 0 : tt.label) == null ? void 0 : At.toLowerCase().includes("out")) || (tt == null ? void 0 : tt.side) === (I === "BT" ? "top" : "bottom");
      if (_t && ee)
        mt = G, pt = T, St = Z.sourceId, Zt = Z.sourcePortId;
      else if (qt && te)
        mt = Z.sourceId, pt = Z.sourcePortId, St = G, Zt = T;
      else if (a.nodes[Z.sourceId] && a.nodes[G]) {
        const ft = a.nodes[Z.sourceId], vt = a.nodes[G], ge = I === "BT" && ft.y < vt.y, Ie = I === "TB" && ft.y > vt.y;
        if (ge || Ie) {
          mt = G, St = Z.sourceId;
          const kt = i.nodes[mt], xt = i.nodes[St];
          pt = ((ct = (yt = kt == null ? void 0 : kt.ports) == null ? void 0 : yt.find((Gt) => Gt.label.includes("out") || Gt.side === (I === "BT" ? "top" : "bottom"))) == null ? void 0 : ct.id) || T, Zt = ((Bt = (bt = xt == null ? void 0 : xt.ports) == null ? void 0 : bt.find((Gt) => Gt.label.includes("in") || Gt.side === (I === "BT" ? "bottom" : "top"))) == null ? void 0 : Bt.id) || Z.sourcePortId;
        }
      }
      g({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: mt,
            sourcePortId: pt,
            targetId: St,
            targetPortId: Zt
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
    const T = G.target, k = T === t.current || T.classList.contains("sysflow-viewport") || T.classList.contains("sysflow-dom-layer") || T.tagName.toLowerCase() === "svg";
    if (G.button === 0 && k) {
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
      E(G.clientX, G.clientY);
    else if (v) {
      const T = K(G.clientX, G.clientY);
      z((k) => k ? { ...k, currentX: T.x, currentY: T.y } : null);
    } else R ? dt(G) : Z && J(
      (T) => T ? { ...T, currentWorldPos: K(G.clientX, G.clientY) } : null
    );
  }, Ft = (G) => {
    if (G.currentTarget.hasPointerCapture(G.pointerId) && G.currentTarget.releasePointerCapture(G.pointerId), Q.current && W(), v) {
      const T = Math.min(v.startX, v.currentX), k = Math.min(v.startY, v.currentY), D = Math.max(v.startX, v.currentX), j = Math.max(v.startY, v.currentY);
      if (D - T > 4 || j - k > 4) {
        const F = [];
        for (const [gt, O] of Object.entries(a.nodes))
          O.x < D && O.x + O.width > T && O.y < j && O.y + O.height > k && F.push(gt);
        for (const [gt, O] of Object.entries(a.containers))
          O.x < D && O.x + O.width > T && O.y < j && O.y + O.height > k && F.push(gt);
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: F } });
      }
      z(null);
    }
    R && ht(G), Z && J(null);
  }, zt = h ?? (d == null ? void 0 : d.mode) === "flow", jt = M(
    (G, T) => {
      const k = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, D = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: G,
          position: T,
          direction: I,
          suggestedNewNodeId: k,
          suggestedNewEdgeId: D
        }
      });
    },
    [I, g]
  ), Jt = e ?? h ?? (d == null ? void 0 : d.mode) === "flow", $t = M(
    (G) => {
      const T = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, k = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, D = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      g({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: G,
          direction: I,
          suggestedNewNodeId: T,
          suggestedNewEdge1Id: k,
          suggestedNewEdge2Id: D
        }
      }), g({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [T] }
      });
    },
    [I, g]
  ), Ut = Object.values(i.containers);
  return /* @__PURE__ */ U(
    "div",
    {
      ref: t,
      className: `sysflow-canvas ${b === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${A}`,
      "data-theme": b,
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
            graph: i,
            registerMeasureElement: H,
            nodeTypes: r,
            containerTypes: f
          }
        ),
        /* @__PURE__ */ U("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ N("button", { onClick: L, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ N("button", { onClick: X, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ U("button", { onClick: x, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(B.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ U(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${B.x}px, ${B.y}px) scale(${B.zoom})`
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
                  graph: i,
                  layout: a,
                  selectedIds: y,
                  direction: I,
                  showArrows: o,
                  routing: l,
                  portOptions: Y,
                  enableEdgeQuickAdd: Jt,
                  onInsertNodeOnEdge: $t,
                  onEdgeClick: (G) => g({ type: "SELECTION_CHANGE", payload: { selectedIds: [G] } })
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
              /* @__PURE__ */ U("div", { className: "sysflow-dom-layer", children: [
                Ut.map((G) => {
                  const T = a.containers[G.id];
                  if (!T) return null;
                  const k = Object.values(i.nodes).some((D) => D.parentId === G.id) || Object.values(i.containers).some((D) => D.parentId === G.id);
                  return /* @__PURE__ */ N(
                    pe,
                    {
                      container: G,
                      layout: T,
                      selected: y.includes(G.id),
                      isHovered: _ === G.id,
                      hasChildren: k,
                      customRenderer: G.type ? f == null ? void 0 : f[G.type] : void 0,
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
                Object.values(i.nodes).map((G) => {
                  const T = a.nodes[G.id];
                  return T ? /* @__PURE__ */ N(
                    Ke,
                    {
                      node: G,
                      layout: T,
                      direction: I,
                      edges: i.edges,
                      portOptions: Y,
                      selected: y.includes(G.id),
                      customRenderer: G.type ? r == null ? void 0 : r[G.type] : void 0,
                      enableQuickAdd: zt,
                      onAddConnectedNode: jt,
                      onPointerDown: it,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (k) => {
                        k.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                      },
                      onPortPointerDown: Kt,
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
  Ee as SysFlowCanvas,
  ye as WorkerBridge,
  Dt as computeEntityPortLocations,
  de as pruneDanglingEdges,
  fe as useCanvasTransform,
  be as useDragGesture,
  Ye as useGraphHistory,
  we as useMeasurement
};
