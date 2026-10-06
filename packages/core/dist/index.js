var Ft = Object.defineProperty;
var jt = (d, g, C) => g in d ? Ft(d, g, { enumerable: !0, configurable: !0, writable: !0, value: C }) : d[g] = C;
var At = (d, g, C) => jt(d, typeof g != "symbol" ? g + "" : g, C);
import { useState as j, useRef as _, useCallback as D, useEffect as Kt, useMemo as zt } from "react";
import { jsxs as O, jsx as T, Fragment as Jt } from "react/jsx-runtime";
function Ut(d, g, C, i) {
  const s = (l) => {
    const c = C.find(
      (a) => a.sourceId === g && a.sourcePortId === l || a.targetId === g && a.targetPortId === l
    );
    if (!c) return null;
    const r = c.sourceId === g ? c.targetId : c.sourceId, o = i[r];
    return o ? { x: o.x + o.width / 2, y: o.y + o.height / 2 } : null;
  };
  ["left", "right"].forEach((l) => {
    d[l].sort((c, r) => {
      var B, u;
      const o = ((B = s(c.id)) == null ? void 0 : B.y) ?? 0, a = ((u = s(r.id)) == null ? void 0 : u.y) ?? 0;
      return o - a;
    });
  }), ["top", "bottom"].forEach((l) => {
    d[l].sort((c, r) => {
      var B, u;
      const o = ((B = s(c.id)) == null ? void 0 : B.x) ?? 0, a = ((u = s(r.id)) == null ? void 0 : u.x) ?? 0;
      return o - a;
    });
  });
}
function qt(d, g, C, i, s, l) {
  if (!s || !l)
    return C ? "left" : "right";
  const c = i.find(
    (u) => C ? u.targetId === d && u.targetPortId === g : u.sourceId === d && u.sourcePortId === g
  );
  if (!c) return C ? "left" : "right";
  const r = C ? c.sourceId : c.targetId, o = s[r];
  if (!o) return C ? "left" : "right";
  const a = o.x + o.width / 2 - (l.x + l.width / 2), B = o.y + o.height / 2 - (l.y + l.height / 2);
  return Math.abs(a) > Math.abs(B) ? a > 0 ? "right" : "left" : B > 0 ? "bottom" : "top";
}
function Zt(d, g, C = "LR", i, s) {
  const l = /* @__PURE__ */ new Map();
  if (!d || !g || !d.ports || d.ports.length === 0)
    return l;
  const c = (s == null ? void 0 : s.direction) || C, r = c === "TB" || c === "BT", o = (s == null ? void 0 : s.mode) || (r ? "strict-flow" : "perimeter-optimized"), a = i ? Array.isArray(i) ? i : Object.values(i) : [], B = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, u = new Set(
    a.filter((e) => e.targetId === d.id).map((e) => e.targetPortId)
  );
  new Set(
    a.filter((e) => e.sourceId === d.id).map((e) => e.sourcePortId)
  ), d.ports.forEach((e) => {
    let y = e.side || "auto";
    if (y !== "auto") {
      B[y].push(e);
      return;
    }
    if (o === "strict-flow") {
      const A = u.has(e.id) || e.label.toLowerCase().includes("in");
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
      y = qt(
        d.id,
        e.id,
        u.has(e.id),
        a,
        s == null ? void 0 : s.nodeLayouts,
        g
      );
    B[y].push(e);
  }), o === "perimeter-optimized" && (s != null && s.nodeLayouts) && Ut(B, d.id, a, s.nodeLayouts);
  const t = (e, y) => {
    const A = e.length;
    e.forEach((n, I) => {
      let b = 0, h = 0;
      y === "left" || y === "right" ? (h = g.height / (A + 1) * (I + 1), b = y === "left" ? 0 : g.width) : (b = g.width / (A + 1) * (I + 1), h = y === "top" ? 0 : g.height), l.set(n.id, {
        portId: n.id,
        side: y,
        localX: b,
        localY: h,
        worldX: g.x + b,
        worldY: g.y + h
      });
    });
  };
  return t(B.left, "left"), t(B.right, "right"), t(B.top, "top"), t(B.bottom, "bottom"), l;
}
function _t(d) {
  const g = {}, C = (i) => {
    var l;
    const s = d.nodes[i];
    return new Set(((l = s == null ? void 0 : s.ports) == null ? void 0 : l.map((c) => c.id)) || []);
  };
  for (const [i, s] of Object.entries(d.edges)) {
    const l = C(s.sourceId), c = C(s.targetId), r = l.has(s.sourcePortId), o = c.has(s.targetPortId);
    r && o && (g[i] = s);
  }
  return {
    ...d,
    edges: g
  };
}
class te {
  static decouple(g, C) {
    const i = /* @__PURE__ */ new Map();
    for (const a of C)
      i.set(a, /* @__PURE__ */ new Set());
    const s = Object.values(g.edges);
    for (const a of s)
      C.has(a.sourceId) && C.has(a.targetId) && i.get(a.sourceId).add(a.targetId);
    const l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), o = (a) => {
      l.add(a), c.add(a);
      const B = Array.from(i.get(a) || []);
      for (const u of B)
        l.has(u) ? c.has(u) && (i.get(a).delete(u), i.get(u).add(a), r.add(`${a}->${u}`)) : o(u);
      c.delete(a);
    };
    for (const a of C)
      l.has(a) || o(a);
    return {
      adjList: i,
      reversedEdges: r,
      allEntityIds: Array.from(C)
    };
  }
}
class ee {
  static assignLayers(g, C) {
    const i = /* @__PURE__ */ new Map();
    for (const o of g)
      i.set(o, 0);
    for (const [, o] of C.entries())
      for (const a of o)
        i.set(a, (i.get(a) || 0) + 1);
    const s = /* @__PURE__ */ new Map(), l = [];
    for (const o of g)
      (i.get(o) || 0) === 0 && (s.set(o, 0), l.push(o));
    const c = /* @__PURE__ */ new Set();
    for (; l.length > 0; ) {
      const o = l.shift();
      c.add(o);
      const a = s.get(o) || 0, B = C.get(o) || /* @__PURE__ */ new Set();
      for (const u of B) {
        const t = s.get(u) ?? 0;
        s.set(u, Math.max(t, a + 1)), i.set(u, (i.get(u) || 1) - 1), i.get(u) === 0 && l.push(u);
      }
    }
    for (const o of g)
      s.has(o) || s.set(o, 0);
    const r = /* @__PURE__ */ new Map();
    for (const [o, a] of s.entries())
      r.has(a) || r.set(a, []), r.get(a).push(o);
    return r;
  }
}
class it {
  static minimizeCrossings(g, C, i = 4) {
    const s = Array.from(g.keys()).sort((r, o) => r - o);
    if (s.length <= 1) return g;
    const l = /* @__PURE__ */ new Map();
    for (const [r, o] of C.entries())
      for (const a of o)
        l.has(a) || l.set(a, /* @__PURE__ */ new Set()), l.get(a).add(r);
    const c = /* @__PURE__ */ new Map();
    for (const [r, o] of g.entries())
      c.set(r, [...o]);
    for (let r = 0; r < i; r++) {
      for (let o = 1; o < s.length; o++) {
        const a = c.get(s[o - 1]), B = c.get(s[o]), u = /* @__PURE__ */ new Map();
        a.forEach((t, e) => u.set(t, e)), B.sort((t, e) => {
          const y = it.getBarycenter(t, l, u), A = it.getBarycenter(e, l, u);
          return y - A;
        });
      }
      for (let o = s.length - 2; o >= 0; o--) {
        const a = c.get(s[o + 1]), B = c.get(s[o]), u = /* @__PURE__ */ new Map();
        a.forEach((t, e) => u.set(t, e)), B.sort((t, e) => {
          const y = it.getBarycenter(t, C, u), A = it.getBarycenter(e, C, u);
          return y - A;
        });
      }
    }
    return c;
  }
  static getBarycenter(g, C, i) {
    const s = C.get(g);
    if (!s || s.size === 0) return 0;
    let l = 0, c = 0;
    for (const r of s)
      i.has(r) && (l += i.get(r), c++);
    return c === 0 ? 0 : l / c;
  }
}
const U = 32, yt = 24, Pt = 22, Gt = 18, mt = 38, ht = 210, pt = 36, ge = 180, oe = 54;
class q {
  static assignCoordinates(g, C, i, s = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const l = s.direction ?? "TB", c = l === "TB" || l === "BT", r = l === "BT" || l === "RL", o = s.aspectRatio ?? 1.55, a = Object.keys(g.containers).length, B = s.mode && s.mode !== "auto" ? s.mode : a > 0 ? "concurrent" : "flow", u = {}, t = {}, e = (y) => {
      var I, b, h;
      const A = !!g.containers[y], n = !!((I = g.containers[y]) != null && I.collapsed);
      return A && n ? { width: ht, height: pt } : {
        width: ((b = i.get(y)) == null ? void 0 : b.width) || ge,
        height: ((h = i.get(y)) == null ? void 0 : h.height) || oe
      };
    };
    return B === "concurrent" ? q.layoutConcurrentHierarchy(
      g,
      e,
      o,
      u,
      t
    ) : q.layoutFlowTree(
      g,
      C,
      e,
      c,
      r,
      u,
      t
    ), q.assignDynamicPortSides(g, u, t), { nodes: u, containers: t };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(g, C, i, s, l) {
    var y;
    const c = /* @__PURE__ */ new Map();
    for (const [A, n] of Object.entries(g.nodes)) {
      const I = n.parentId ?? null;
      c.has(I) || c.set(I, []), c.get(I).push(A);
    }
    for (const [A, n] of Object.entries(g.containers)) {
      const I = n.parentId ?? null;
      c.has(I) || c.set(I, []), c.get(I).push(A);
    }
    const r = q.getContainerDepths(g), o = Object.keys(g.containers).sort(
      (A, n) => (r.get(n) || 0) - (r.get(A) || 0)
    ), a = /* @__PURE__ */ new Map(), B = /* @__PURE__ */ new Map();
    for (const A of o) {
      if (!!((y = g.containers[A]) != null && y.collapsed)) {
        a.set(A, {
          width: ht,
          height: pt
        });
        continue;
      }
      const I = c.get(A) || [];
      if (I.length === 0) {
        a.set(A, {
          width: ht,
          height: mt + Gt * 2
        });
        continue;
      }
      const b = I.map((w) => {
        const L = a.has(w) ? a.get(w) : C(w);
        return { id: w, width: L.width, height: L.height };
      }), h = q.findBestTightPacking(b, i);
      for (const w of h.boxes)
        B.set(w.id, w);
      const m = Math.max(h.width + Pt * 2, ht), f = h.height + mt + Gt * 2;
      a.set(A, { width: m, height: f });
    }
    const u = c.get(null) || [];
    let t = [];
    if (u.length > 0) {
      const A = u.map((I) => {
        const b = a.get(I) || C(I);
        return { id: I, width: b.width, height: b.height };
      });
      t = q.findBestTightPacking(A, i).boxes.map((I) => ({
        ...I,
        localX: I.localX + 60,
        localY: I.localY + 60
      }));
    }
    const e = (A, n, I, b, h) => {
      var w;
      const m = !!g.containers[A], f = { id: A, x: n, y: I, width: b, height: h };
      if (m) {
        if (l[A] = f, (w = g.containers[A]) != null && w.collapsed) return;
        const L = n + Pt, Z = I + mt + Gt, X = c.get(A) || [];
        for (const H of X) {
          const x = B.get(H);
          x && e(
            H,
            L + x.localX,
            Z + x.localY,
            x.width,
            x.height
          );
        }
      } else
        s[A] = f;
    };
    for (const A of t)
      e(A.id, A.localX, A.localY, A.width, A.height);
  }
  /**
   * Evaluates multiple candidate bounding widths using 2D skyline bin packing
   * and picks the configuration that minimizes empty space while respecting targetAspect.
   */
  static findBestTightPacking(g, C) {
    if (g.length === 1)
      return {
        width: g[0].width,
        height: g[0].height,
        boxes: [{ id: g[0].id, localX: 0, localY: 0, width: g[0].width, height: g[0].height }],
        score: 0
      };
    const i = g.reduce((u, t) => u + t.width * t.height, 0), s = Math.max(...g.map((u) => u.width)), l = [...g].sort((u, t) => t.width - u.width), c = /* @__PURE__ */ new Set(), r = g.reduce((u, t) => u + t.width, 0) + (g.length - 1) * U;
    c.add(r), c.add(s);
    const o = Math.max(s, Math.sqrt(i * C));
    c.add(o), c.add(o * 0.85), c.add(o * 1.15);
    const a = Math.min(g.length, 6);
    for (let u = 2; u <= a; u++) {
      let t = 0;
      for (let e = 0; e < u && e < l.length; e++)
        t += l[e].width;
      t += (u - 1) * U, t >= s && c.add(t);
    }
    let B = null;
    for (const u of c) {
      const t = q.simulateSkylinePacking(g, u), e = t.width * t.height, y = Math.max(0, e - i), A = t.width / Math.max(1, t.height), n = Math.abs(Math.log(A / C)), I = y / i * 2 + n * 0.25;
      t.score = I, (!B || I < B.score) && (B = t);
    }
    return B;
  }
  /**
   * Bottom-Left Skyline 2D Bin Packing:
   * Sorts items descending by height (First-Fit Decreasing) and packs into the lowest
   * available height valley, preventing tall items from locking the vertical baseline.
   */
  static simulateSkylinePacking(g, C) {
    const i = [...g].sort((o, a) => a.height - o.height), s = [{ x: 0, width: C, y: 0 }], l = [];
    for (const o of i) {
      let a = 1 / 0, B = -1;
      for (let I = 0; I < s.length; I++) {
        if (s[I].x + o.width > C) continue;
        let h = 0, m = 0;
        for (let f = I; f < s.length && m < o.width; f++)
          h = Math.max(h, s[f].y), m += s[f].width;
        h < a && (a = h, B = I);
      }
      if (B === -1) {
        const I = Math.max(...s.map((h) => h.y)), b = I === 0 ? 0 : I + yt;
        l.push({
          id: o.id,
          localX: 0,
          localY: b,
          width: o.width,
          height: o.height
        }), s.length = 0, s.push({ x: 0, width: o.width + U, y: b + o.height }), C > o.width + U && s.push({
          x: o.width + U,
          width: C - (o.width + U),
          y: 0
        });
        continue;
      }
      const u = s[B].x, t = a === 0 ? 0 : a + yt;
      l.push({
        id: o.id,
        localX: u,
        localY: t,
        width: o.width,
        height: o.height
      });
      const e = o.width + U, y = t + o.height, A = { x: u, width: e, y }, n = [];
      for (const I of s)
        I.x + I.width <= u || I.x >= u + e ? n.push(I) : (I.x < u && n.push({ x: I.x, width: u - I.x, y: I.y }), I.x + I.width > u + e && n.push({
          x: u + e,
          width: I.x + I.width - (u + e),
          y: I.y
        }));
      n.push(A), n.sort((I, b) => I.x - b.x), s.length = 0, s.push(...n);
    }
    const c = Math.max(...l.map((o) => o.localX + o.width), 0), r = Math.max(...l.map((o) => o.localY + o.height), 0);
    return { width: c, height: r, boxes: l, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE SYMMETRICAL CENTERING (DEMO 2)
  // ===========================================================================
  static layoutFlowTree(g, C, i, s, l, c, r) {
    const o = Array.from(C.keys()).sort((h, m) => h - m), a = /* @__PURE__ */ new Map();
    let B = 80;
    const u = s ? yt * 1.5 : U * 1.5, t = s ? U : yt, e = l ? [...o].reverse() : [...o];
    for (const h of e) {
      const m = C.get(h) || [];
      let f = 0;
      for (const w of m) {
        const L = i(w), Z = s ? L.height : L.width;
        f = Math.max(f, Z);
      }
      a.set(h, B), B += f + u;
    }
    const y = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map();
    for (const h of Object.values(g.edges))
      y.has(h.targetId) || y.set(h.targetId, []), y.get(h.targetId).push(h.sourceId), A.has(h.sourceId) || A.set(h.sourceId, []), A.get(h.sourceId).push(h.targetId);
    const n = /* @__PURE__ */ new Map();
    for (const h of o) {
      const m = C.get(h) || [];
      let f = -1 / 0;
      for (const w of m) {
        const L = i(w), Z = s ? L.width : L.height, X = y.get(w) || [];
        let H = null;
        if (X.length > 0) {
          const W = X.map((G) => {
            const p = n.get(G);
            if (p === void 0) return null;
            const k = i(G);
            return p + (s ? k.width : k.height) / 2;
          }).filter((G) => G !== null);
          W.length > 0 && (H = W.reduce((G, p) => G + p, 0) / W.length);
        }
        let x = H !== null ? H - Z / 2 : 80;
        x < f + t && (x = f === -1 / 0 ? 80 : f + t), n.set(w, x), f = x + Z;
      }
    }
    for (let h = o.length - 1; h >= 0; h--) {
      const m = o[h], f = C.get(m) || [];
      for (const L of f) {
        const Z = A.get(L) || [];
        if (Z.length === 0) continue;
        const X = Z.map((H) => {
          const x = n.get(H);
          if (x === void 0) return null;
          const W = i(H);
          return x + (s ? W.width : W.height) / 2;
        }).filter((H) => H !== null);
        if (X.length > 0) {
          const H = X.reduce((G, p) => G + p, 0) / X.length, x = i(L), W = s ? x.width : x.height;
          n.set(L, H - W / 2);
        }
      }
      let w = -1 / 0;
      for (const L of f) {
        const Z = i(L), X = s ? Z.width : Z.height;
        let H = n.get(L) ?? 80;
        H < w + t && (H = w + t, n.set(L, H)), w = H + X;
      }
    }
    let I = 1 / 0;
    for (const h of n.values()) I = Math.min(I, h);
    const b = I < 80 ? 80 - I : 0;
    for (const h of o) {
      const m = C.get(h) || [], f = a.get(h) || 80;
      for (const w of m) {
        const L = i(w), Z = (n.get(w) ?? 80) + b, x = { id: w, x: s ? Z : f, y: s ? f : Z, width: L.width, height: L.height };
        g.containers[w] ? r[w] = x : c[w] = x;
      }
    }
  }
  static assignDynamicPortSides(g, C, i) {
    var l, c;
    const s = (r) => C[r] || i[r];
    for (const r of Object.values(g.edges)) {
      const o = s(r.sourceId), a = s(r.targetId);
      if (!o || !a) continue;
      const B = g.nodes[r.sourceId] || g.containers[r.sourceId], u = g.nodes[r.targetId] || g.containers[r.targetId], t = a.x + a.width / 2 - (o.x + o.width / 2), e = a.y + a.height / 2 - (o.y + o.height / 2), y = Math.abs(t) > Math.abs(e) * 1.25, A = (l = B == null ? void 0 : B.ports) == null ? void 0 : l.find((I) => I.id === r.sourcePortId);
      A && (!A.side || A.side === "auto") && (y ? A.side = t >= 0 ? "right" : "left" : A.side = e >= 0 ? "bottom" : "top");
      const n = (c = u == null ? void 0 : u.ports) == null ? void 0 : c.find((I) => I.id === r.targetPortId);
      n && (!n.side || n.side === "auto") && (y ? n.side = t >= 0 ? "left" : "right" : n.side = e >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(g) {
    const C = /* @__PURE__ */ new Map(), i = (s) => {
      var r;
      if (C.has(s)) return C.get(s);
      const l = (r = g.containers[s]) == null ? void 0 : r.parentId;
      if (!l || !g.containers[l])
        return C.set(s, 0), 0;
      const c = 1 + i(l);
      return C.set(s, c), c;
    };
    for (const s of Object.keys(g.containers))
      i(s);
    return C;
  }
}
class se {
  async execute(g, C, i) {
    const s = Object.values(g.containers), l = Object.values(g.nodes), c = new Set(
      s.filter((t) => !!t.collapsed).map((t) => t.id)
    ), r = (t) => {
      var y;
      let e = t;
      for (; e; ) {
        if (c.has(e)) return !0;
        e = (y = g.containers[e]) == null ? void 0 : y.parentId;
      }
      return !1;
    }, o = /* @__PURE__ */ new Set();
    for (const [t, e] of Object.entries(g.nodes))
      r(e.parentId) || o.add(t);
    for (const [t, e] of Object.entries(g.containers)) {
      const y = e;
      y.collapsed ? r(y.parentId) || o.add(t) : !(l.some((n) => n.parentId === t) || s.some((n) => n.parentId === t)) && !r(y.parentId) && o.add(t);
    }
    const a = te.decouple(g, o), B = ee.assignLayers(a.allEntityIds, a.adjList), u = it.minimizeCrossings(B, a.adjList, 4);
    return q.assignCoordinates(g, u, C, i);
  }
}
const Yt = "Y2xhc3MgWCB7CiAgc3RhdGljIGRlY291cGxlKG4sIGYpIHsKICAgIGNvbnN0IGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBzIG9mIGYpCiAgICAgIGQuc2V0KHMsIC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkpOwogICAgY29uc3QgZSA9IE9iamVjdC52YWx1ZXMobi5lZGdlcyk7CiAgICBmb3IgKGNvbnN0IHMgb2YgZSkKICAgICAgZi5oYXMocy5zb3VyY2VJZCkgJiYgZi5oYXMocy50YXJnZXRJZCkgJiYgZC5nZXQocy5zb3VyY2VJZCkuYWRkKHMudGFyZ2V0SWQpOwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBhID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgdCA9IChzKSA9PiB7CiAgICAgIGguYWRkKHMpLCByLmFkZChzKTsKICAgICAgY29uc3QgeSA9IEFycmF5LmZyb20oZC5nZXQocykgfHwgW10pOwogICAgICBmb3IgKGNvbnN0IG8gb2YgeSkKICAgICAgICBoLmhhcyhvKSA/IHIuaGFzKG8pICYmIChkLmdldChzKS5kZWxldGUobyksIGQuZ2V0KG8pLmFkZChzKSwgYS5hZGQoYCR7c30tPiR7b31gKSkgOiB0KG8pOwogICAgICByLmRlbGV0ZShzKTsKICAgIH07CiAgICBmb3IgKGNvbnN0IHMgb2YgZikKICAgICAgaC5oYXMocykgfHwgdChzKTsKICAgIHJldHVybiB7CiAgICAgIGFkakxpc3Q6IGQsCiAgICAgIHJldmVyc2VkRWRnZXM6IGEsCiAgICAgIGFsbEVudGl0eUlkczogQXJyYXkuZnJvbShmKQogICAgfTsKICB9Cn0KY2xhc3MgRyB7CiAgc3RhdGljIGFzc2lnbkxheWVycyhuLCBmKSB7CiAgICBjb25zdCBkID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgdCBvZiBuKQogICAgICBkLnNldCh0LCAwKTsKICAgIGZvciAoY29uc3QgWywgdF0gb2YgZi5lbnRyaWVzKCkpCiAgICAgIGZvciAoY29uc3QgcyBvZiB0KQogICAgICAgIGQuc2V0KHMsIChkLmdldChzKSB8fCAwKSArIDEpOwogICAgY29uc3QgZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGggPSBbXTsKICAgIGZvciAoY29uc3QgdCBvZiBuKQogICAgICAoZC5nZXQodCkgfHwgMCkgPT09IDAgJiYgKGUuc2V0KHQsIDApLCBoLnB1c2godCkpOwogICAgY29uc3QgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKDsgaC5sZW5ndGggPiAwOyApIHsKICAgICAgY29uc3QgdCA9IGguc2hpZnQoKTsKICAgICAgci5hZGQodCk7CiAgICAgIGNvbnN0IHMgPSBlLmdldCh0KSB8fCAwLCB5ID0gZi5nZXQodCkgfHwgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgICAgZm9yIChjb25zdCBvIG9mIHkpIHsKICAgICAgICBjb25zdCBjID0gZS5nZXQobykgPz8gMDsKICAgICAgICBlLnNldChvLCBNYXRoLm1heChjLCBzICsgMSkpLCBkLnNldChvLCAoZC5nZXQobykgfHwgMSkgLSAxKSwgZC5nZXQobykgPT09IDAgJiYgaC5wdXNoKG8pOwogICAgICB9CiAgICB9CiAgICBmb3IgKGNvbnN0IHQgb2YgbikKICAgICAgZS5oYXModCkgfHwgZS5zZXQodCwgMCk7CiAgICBjb25zdCBhID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW3QsIHNdIG9mIGUuZW50cmllcygpKQogICAgICBhLmhhcyhzKSB8fCBhLnNldChzLCBbXSksIGEuZ2V0KHMpLnB1c2godCk7CiAgICByZXR1cm4gYTsKICB9Cn0KY2xhc3MgQSB7CiAgc3RhdGljIG1pbmltaXplQ3Jvc3NpbmdzKG4sIGYsIGQgPSA0KSB7CiAgICBjb25zdCBlID0gQXJyYXkuZnJvbShuLmtleXMoKSkuc29ydCgoYSwgdCkgPT4gYSAtIHQpOwogICAgaWYgKGUubGVuZ3RoIDw9IDEpIHJldHVybiBuOwogICAgY29uc3QgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFthLCB0XSBvZiBmLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgICAgaC5oYXMocykgfHwgaC5zZXQocywgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSksIGguZ2V0KHMpLmFkZChhKTsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbYSwgdF0gb2Ygbi5lbnRyaWVzKCkpCiAgICAgIHIuc2V0KGEsIFsuLi50XSk7CiAgICBmb3IgKGxldCBhID0gMDsgYSA8IGQ7IGErKykgewogICAgICBmb3IgKGxldCB0ID0gMTsgdCA8IGUubGVuZ3RoOyB0KyspIHsKICAgICAgICBjb25zdCBzID0gci5nZXQoZVt0IC0gMV0pLCB5ID0gci5nZXQoZVt0XSksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHMuZm9yRWFjaCgoYywgZykgPT4gby5zZXQoYywgZykpLCB5LnNvcnQoKGMsIGcpID0+IHsKICAgICAgICAgIGNvbnN0IHAgPSBBLmdldEJhcnljZW50ZXIoYywgaCwgbyksIGwgPSBBLmdldEJhcnljZW50ZXIoZywgaCwgbyk7CiAgICAgICAgICByZXR1cm4gcCAtIGw7CiAgICAgICAgfSk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgdCA9IGUubGVuZ3RoIC0gMjsgdCA+PSAwOyB0LS0pIHsKICAgICAgICBjb25zdCBzID0gci5nZXQoZVt0ICsgMV0pLCB5ID0gci5nZXQoZVt0XSksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHMuZm9yRWFjaCgoYywgZykgPT4gby5zZXQoYywgZykpLCB5LnNvcnQoKGMsIGcpID0+IHsKICAgICAgICAgIGNvbnN0IHAgPSBBLmdldEJhcnljZW50ZXIoYywgZiwgbyksIGwgPSBBLmdldEJhcnljZW50ZXIoZywgZiwgbyk7CiAgICAgICAgICByZXR1cm4gcCAtIGw7CiAgICAgICAgfSk7CiAgICAgIH0KICAgIH0KICAgIHJldHVybiByOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihuLCBmLCBkKSB7CiAgICBjb25zdCBlID0gZi5nZXQobik7CiAgICBpZiAoIWUgfHwgZS5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBoID0gMCwgciA9IDA7CiAgICBmb3IgKGNvbnN0IGEgb2YgZSkKICAgICAgZC5oYXMoYSkgJiYgKGggKz0gZC5nZXQoYSksIHIrKyk7CiAgICByZXR1cm4gciA9PT0gMCA/IDAgOiBoIC8gcjsKICB9Cn0KY29uc3QgVCA9IDMyLCBFID0gMjQsIFIgPSAyMiwgSCA9IDE4LCBqID0gMzgsIGsgPSAyMTAsIFcgPSAzNiwgRiA9IDE4MCwgXyA9IDU0OwpjbGFzcyBEIHsKICBzdGF0aWMgYXNzaWduQ29vcmRpbmF0ZXMobiwgZiwgZCwgZSA9IHsgZGlyZWN0aW9uOiAiVEIiLCBtb2RlOiAiYXV0byIsIGFzcGVjdFJhdGlvOiAxLjU1IH0pIHsKICAgIGNvbnN0IGggPSBlLmRpcmVjdGlvbiA/PyAiVEIiLCByID0gaCA9PT0gIlRCIiB8fCBoID09PSAiQlQiLCBhID0gaCA9PT0gIkJUIiB8fCBoID09PSAiUkwiLCB0ID0gZS5hc3BlY3RSYXRpbyA/PyAxLjU1LCBzID0gT2JqZWN0LmtleXMobi5jb250YWluZXJzKS5sZW5ndGgsIHkgPSBlLm1vZGUgJiYgZS5tb2RlICE9PSAiYXV0byIgPyBlLm1vZGUgOiBzID4gMCA/ICJjb25jdXJyZW50IiA6ICJmbG93IiwgbyA9IHt9LCBjID0ge30sIGcgPSAocCkgPT4gewogICAgICB2YXIgaSwgTywgdzsKICAgICAgY29uc3QgbCA9ICEhbi5jb250YWluZXJzW3BdLCB1ID0gISEoKGkgPSBuLmNvbnRhaW5lcnNbcF0pICE9IG51bGwgJiYgaS5jb2xsYXBzZWQpOwogICAgICByZXR1cm4gbCAmJiB1ID8geyB3aWR0aDogaywgaGVpZ2h0OiBXIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoTyA9IGQuZ2V0KHApKSA9PSBudWxsID8gdm9pZCAwIDogTy53aWR0aCkgfHwgRiwKICAgICAgICBoZWlnaHQ6ICgodyA9IGQuZ2V0KHApKSA9PSBudWxsID8gdm9pZCAwIDogdy5oZWlnaHQpIHx8IF8KICAgICAgfTsKICAgIH07CiAgICByZXR1cm4geSA9PT0gImNvbmN1cnJlbnQiID8gRC5sYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KAogICAgICBuLAogICAgICBnLAogICAgICB0LAogICAgICBvLAogICAgICBjCiAgICApIDogRC5sYXlvdXRGbG93VHJlZSgKICAgICAgbiwKICAgICAgZiwKICAgICAgZywKICAgICAgciwKICAgICAgYSwKICAgICAgbywKICAgICAgYwogICAgKSwgRC5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIG8sIGMpLCB7IG5vZGVzOiBvLCBjb250YWluZXJzOiBjIH07CiAgfQogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIC8vIENPTkNVUlJFTlQgQ09NUE9VTkQgUEFDS0lORyBXSVRIIFNLWUxJTkUgMkQgQklOIFBBQ0tJTkcKICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICBzdGF0aWMgbGF5b3V0Q29uY3VycmVudEhpZXJhcmNoeShuLCBmLCBkLCBlLCBoKSB7CiAgICB2YXIgcDsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbbCwgdV0gb2YgT2JqZWN0LmVudHJpZXMobi5ub2RlcykpIHsKICAgICAgY29uc3QgaSA9IHUucGFyZW50SWQgPz8gbnVsbDsKICAgICAgci5oYXMoaSkgfHwgci5zZXQoaSwgW10pLCByLmdldChpKS5wdXNoKGwpOwogICAgfQogICAgZm9yIChjb25zdCBbbCwgdV0gb2YgT2JqZWN0LmVudHJpZXMobi5jb250YWluZXJzKSkgewogICAgICBjb25zdCBpID0gdS5wYXJlbnRJZCA/PyBudWxsOwogICAgICByLmhhcyhpKSB8fCByLnNldChpLCBbXSksIHIuZ2V0KGkpLnB1c2gobCk7CiAgICB9CiAgICBjb25zdCBhID0gRC5nZXRDb250YWluZXJEZXB0aHMobiksIHQgPSBPYmplY3Qua2V5cyhuLmNvbnRhaW5lcnMpLnNvcnQoCiAgICAgIChsLCB1KSA9PiAoYS5nZXQodSkgfHwgMCkgLSAoYS5nZXQobCkgfHwgMCkKICAgICksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgbCBvZiB0KSB7CiAgICAgIGlmICghISgocCA9IG4uY29udGFpbmVyc1tsXSkgIT0gbnVsbCAmJiBwLmNvbGxhcHNlZCkpIHsKICAgICAgICBzLnNldChsLCB7CiAgICAgICAgICB3aWR0aDogaywKICAgICAgICAgIGhlaWdodDogVwogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IGkgPSByLmdldChsKSB8fCBbXTsKICAgICAgaWYgKGkubGVuZ3RoID09PSAwKSB7CiAgICAgICAgcy5zZXQobCwgewogICAgICAgICAgd2lkdGg6IGssCiAgICAgICAgICBoZWlnaHQ6IGogKyBIICogMgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IE8gPSBpLm1hcCgobSkgPT4gewogICAgICAgIGNvbnN0IEkgPSBzLmhhcyhtKSA/IHMuZ2V0KG0pIDogZihtKTsKICAgICAgICByZXR1cm4geyBpZDogbSwgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgfSksIHcgPSBELmZpbmRCZXN0VGlnaHRQYWNraW5nKE8sIGQpOwogICAgICBmb3IgKGNvbnN0IG0gb2Ygdy5ib3hlcykKICAgICAgICB5LnNldChtLmlkLCBtKTsKICAgICAgY29uc3QgQyA9IE1hdGgubWF4KHcud2lkdGggKyBSICogMiwgayksIHggPSB3LmhlaWdodCArIGogKyBIICogMjsKICAgICAgcy5zZXQobCwgeyB3aWR0aDogQywgaGVpZ2h0OiB4IH0pOwogICAgfQogICAgY29uc3QgbyA9IHIuZ2V0KG51bGwpIHx8IFtdOwogICAgbGV0IGMgPSBbXTsKICAgIGlmIChvLmxlbmd0aCA+IDApIHsKICAgICAgY29uc3QgbCA9IG8ubWFwKChpKSA9PiB7CiAgICAgICAgY29uc3QgTyA9IHMuZ2V0KGkpIHx8IGYoaSk7CiAgICAgICAgcmV0dXJuIHsgaWQ6IGksIHdpZHRoOiBPLndpZHRoLCBoZWlnaHQ6IE8uaGVpZ2h0IH07CiAgICAgIH0pOwogICAgICBjID0gRC5maW5kQmVzdFRpZ2h0UGFja2luZyhsLCBkKS5ib3hlcy5tYXAoKGkpID0+ICh7CiAgICAgICAgLi4uaSwKICAgICAgICBsb2NhbFg6IGkubG9jYWxYICsgNjAsCiAgICAgICAgbG9jYWxZOiBpLmxvY2FsWSArIDYwCiAgICAgIH0pKTsKICAgIH0KICAgIGNvbnN0IGcgPSAobCwgdSwgaSwgTywgdykgPT4gewogICAgICB2YXIgbTsKICAgICAgY29uc3QgQyA9ICEhbi5jb250YWluZXJzW2xdLCB4ID0geyBpZDogbCwgeDogdSwgeTogaSwgd2lkdGg6IE8sIGhlaWdodDogdyB9OwogICAgICBpZiAoQykgewogICAgICAgIGlmIChoW2xdID0geCwgKG0gPSBuLmNvbnRhaW5lcnNbbF0pICE9IG51bGwgJiYgbS5jb2xsYXBzZWQpIHJldHVybjsKICAgICAgICBjb25zdCBJID0gdSArIFIsIFAgPSBpICsgaiArIEgsIFMgPSByLmdldChsKSB8fCBbXTsKICAgICAgICBmb3IgKGNvbnN0IE0gb2YgUykgewogICAgICAgICAgY29uc3QgYiA9IHkuZ2V0KE0pOwogICAgICAgICAgYiAmJiBnKAogICAgICAgICAgICBNLAogICAgICAgICAgICBJICsgYi5sb2NhbFgsCiAgICAgICAgICAgIFAgKyBiLmxvY2FsWSwKICAgICAgICAgICAgYi53aWR0aCwKICAgICAgICAgICAgYi5oZWlnaHQKICAgICAgICAgICk7CiAgICAgICAgfQogICAgICB9IGVsc2UKICAgICAgICBlW2xdID0geDsKICAgIH07CiAgICBmb3IgKGNvbnN0IGwgb2YgYykKICAgICAgZyhsLmlkLCBsLmxvY2FsWCwgbC5sb2NhbFksIGwud2lkdGgsIGwuaGVpZ2h0KTsKICB9CiAgLyoqCiAgICogRXZhbHVhdGVzIG11bHRpcGxlIGNhbmRpZGF0ZSBib3VuZGluZyB3aWR0aHMgdXNpbmcgMkQgc2t5bGluZSBiaW4gcGFja2luZwogICAqIGFuZCBwaWNrcyB0aGUgY29uZmlndXJhdGlvbiB0aGF0IG1pbmltaXplcyBlbXB0eSBzcGFjZSB3aGlsZSByZXNwZWN0aW5nIHRhcmdldEFzcGVjdC4KICAgKi8KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcobiwgZikgewogICAgaWYgKG4ubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBuWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogblswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBuWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IG5bMF0ud2lkdGgsIGhlaWdodDogblswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IGQgPSBuLnJlZHVjZSgobywgYykgPT4gbyArIGMud2lkdGggKiBjLmhlaWdodCwgMCksIGUgPSBNYXRoLm1heCguLi5uLm1hcCgobykgPT4gby53aWR0aCkpLCBoID0gWy4uLm5dLnNvcnQoKG8sIGMpID0+IGMud2lkdGggLSBvLndpZHRoKSwgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGEgPSBuLnJlZHVjZSgobywgYykgPT4gbyArIGMud2lkdGgsIDApICsgKG4ubGVuZ3RoIC0gMSkgKiBUOwogICAgci5hZGQoYSksIHIuYWRkKGUpOwogICAgY29uc3QgdCA9IE1hdGgubWF4KGUsIE1hdGguc3FydChkICogZikpOwogICAgci5hZGQodCksIHIuYWRkKHQgKiAwLjg1KSwgci5hZGQodCAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKG4ubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IG8gPSAyOyBvIDw9IHM7IG8rKykgewogICAgICBsZXQgYyA9IDA7CiAgICAgIGZvciAobGV0IGcgPSAwOyBnIDwgbyAmJiBnIDwgaC5sZW5ndGg7IGcrKykKICAgICAgICBjICs9IGhbZ10ud2lkdGg7CiAgICAgIGMgKz0gKG8gLSAxKSAqIFQsIGMgPj0gZSAmJiByLmFkZChjKTsKICAgIH0KICAgIGxldCB5ID0gbnVsbDsKICAgIGZvciAoY29uc3QgbyBvZiByKSB7CiAgICAgIGNvbnN0IGMgPSBELnNpbXVsYXRlU2t5bGluZVBhY2tpbmcobiwgbyksIGcgPSBjLndpZHRoICogYy5oZWlnaHQsIHAgPSBNYXRoLm1heCgwLCBnIC0gZCksIGwgPSBjLndpZHRoIC8gTWF0aC5tYXgoMSwgYy5oZWlnaHQpLCB1ID0gTWF0aC5hYnMoTWF0aC5sb2cobCAvIGYpKSwgaSA9IHAgLyBkICogMiArIHUgKiAwLjI1OwogICAgICBjLnNjb3JlID0gaSwgKCF5IHx8IGkgPCB5LnNjb3JlKSAmJiAoeSA9IGMpOwogICAgfQogICAgcmV0dXJuIHk7CiAgfQogIC8qKgogICAqIEJvdHRvbS1MZWZ0IFNreWxpbmUgMkQgQmluIFBhY2tpbmc6CiAgICogU29ydHMgaXRlbXMgZGVzY2VuZGluZyBieSBoZWlnaHQgKEZpcnN0LUZpdCBEZWNyZWFzaW5nKSBhbmQgcGFja3MgaW50byB0aGUgbG93ZXN0CiAgICogYXZhaWxhYmxlIGhlaWdodCB2YWxsZXksIHByZXZlbnRpbmcgdGFsbCBpdGVtcyBmcm9tIGxvY2tpbmcgdGhlIHZlcnRpY2FsIGJhc2VsaW5lLgogICAqLwogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKG4sIGYpIHsKICAgIGNvbnN0IGQgPSBbLi4ubl0uc29ydCgodCwgcykgPT4gcy5oZWlnaHQgLSB0LmhlaWdodCksIGUgPSBbeyB4OiAwLCB3aWR0aDogZiwgeTogMCB9XSwgaCA9IFtdOwogICAgZm9yIChjb25zdCB0IG9mIGQpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgeSA9IC0xOwogICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGUubGVuZ3RoOyBpKyspIHsKICAgICAgICBpZiAoZVtpXS54ICsgdC53aWR0aCA+IGYpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgQyA9IDA7CiAgICAgICAgZm9yIChsZXQgeCA9IGk7IHggPCBlLmxlbmd0aCAmJiBDIDwgdC53aWR0aDsgeCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIGVbeF0ueSksIEMgKz0gZVt4XS53aWR0aDsKICAgICAgICB3IDwgcyAmJiAocyA9IHcsIHkgPSBpKTsKICAgICAgfQogICAgICBpZiAoeSA9PT0gLTEpIHsKICAgICAgICBjb25zdCBpID0gTWF0aC5tYXgoLi4uZS5tYXAoKHcpID0+IHcueSkpLCBPID0gaSA9PT0gMCA/IDAgOiBpICsgRTsKICAgICAgICBoLnB1c2goewogICAgICAgICAgaWQ6IHQuaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IE8sCiAgICAgICAgICB3aWR0aDogdC53aWR0aCwKICAgICAgICAgIGhlaWdodDogdC5oZWlnaHQKICAgICAgICB9KSwgZS5sZW5ndGggPSAwLCBlLnB1c2goeyB4OiAwLCB3aWR0aDogdC53aWR0aCArIFQsIHk6IE8gKyB0LmhlaWdodCB9KSwgZiA+IHQud2lkdGggKyBUICYmIGUucHVzaCh7CiAgICAgICAgICB4OiB0LndpZHRoICsgVCwKICAgICAgICAgIHdpZHRoOiBmIC0gKHQud2lkdGggKyBUKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBvID0gZVt5XS54LCBjID0gcyA9PT0gMCA/IDAgOiBzICsgRTsKICAgICAgaC5wdXNoKHsKICAgICAgICBpZDogdC5pZCwKICAgICAgICBsb2NhbFg6IG8sCiAgICAgICAgbG9jYWxZOiBjLAogICAgICAgIHdpZHRoOiB0LndpZHRoLAogICAgICAgIGhlaWdodDogdC5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IGcgPSB0LndpZHRoICsgVCwgcCA9IGMgKyB0LmhlaWdodCwgbCA9IHsgeDogbywgd2lkdGg6IGcsIHk6IHAgfSwgdSA9IFtdOwogICAgICBmb3IgKGNvbnN0IGkgb2YgZSkKICAgICAgICBpLnggKyBpLndpZHRoIDw9IG8gfHwgaS54ID49IG8gKyBnID8gdS5wdXNoKGkpIDogKGkueCA8IG8gJiYgdS5wdXNoKHsgeDogaS54LCB3aWR0aDogbyAtIGkueCwgeTogaS55IH0pLCBpLnggKyBpLndpZHRoID4gbyArIGcgJiYgdS5wdXNoKHsKICAgICAgICAgIHg6IG8gKyBnLAogICAgICAgICAgd2lkdGg6IGkueCArIGkud2lkdGggLSAobyArIGcpLAogICAgICAgICAgeTogaS55CiAgICAgICAgfSkpOwogICAgICB1LnB1c2gobCksIHUuc29ydCgoaSwgTykgPT4gaS54IC0gTy54KSwgZS5sZW5ndGggPSAwLCBlLnB1c2goLi4udSk7CiAgICB9CiAgICBjb25zdCByID0gTWF0aC5tYXgoLi4uaC5tYXAoKHQpID0+IHQubG9jYWxYICsgdC53aWR0aCksIDApLCBhID0gTWF0aC5tYXgoLi4uaC5tYXAoKHQpID0+IHQubG9jYWxZICsgdC5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiByLCBoZWlnaHQ6IGEsIGJveGVzOiBoLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgU1lNTUVUUklDQUwgQ0VOVEVSSU5HIChERU1PIDIpCiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgc3RhdGljIGxheW91dEZsb3dUcmVlKG4sIGYsIGQsIGUsIGgsIHIsIGEpIHsKICAgIGNvbnN0IHQgPSBBcnJheS5mcm9tKGYua2V5cygpKS5zb3J0KCh3LCBDKSA9PiB3IC0gQyksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgbGV0IHkgPSA4MDsKICAgIGNvbnN0IG8gPSBlID8gRSAqIDEuNSA6IFQgKiAxLjUsIGMgPSBlID8gVCA6IEUsIGcgPSBoID8gWy4uLnRdLnJldmVyc2UoKSA6IFsuLi50XTsKICAgIGZvciAoY29uc3QgdyBvZiBnKSB7CiAgICAgIGNvbnN0IEMgPSBmLmdldCh3KSB8fCBbXTsKICAgICAgbGV0IHggPSAwOwogICAgICBmb3IgKGNvbnN0IG0gb2YgQykgewogICAgICAgIGNvbnN0IEkgPSBkKG0pLCBQID0gZSA/IEkuaGVpZ2h0IDogSS53aWR0aDsKICAgICAgICB4ID0gTWF0aC5tYXgoeCwgUCk7CiAgICAgIH0KICAgICAgcy5zZXQodywgeSksIHkgKz0geCArIG87CiAgICB9CiAgICBjb25zdCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IHcgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkKICAgICAgcC5oYXMody50YXJnZXRJZCkgfHwgcC5zZXQody50YXJnZXRJZCwgW10pLCBwLmdldCh3LnRhcmdldElkKS5wdXNoKHcuc291cmNlSWQpLCBsLmhhcyh3LnNvdXJjZUlkKSB8fCBsLnNldCh3LnNvdXJjZUlkLCBbXSksIGwuZ2V0KHcuc291cmNlSWQpLnB1c2gody50YXJnZXRJZCk7CiAgICBjb25zdCB1ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgdyBvZiB0KSB7CiAgICAgIGNvbnN0IEMgPSBmLmdldCh3KSB8fCBbXTsKICAgICAgbGV0IHggPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgbSBvZiBDKSB7CiAgICAgICAgY29uc3QgSSA9IGQobSksIFAgPSBlID8gSS53aWR0aCA6IEkuaGVpZ2h0LCBTID0gcC5nZXQobSkgfHwgW107CiAgICAgICAgbGV0IE0gPSBudWxsOwogICAgICAgIGlmIChTLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEIgPSBTLm1hcCgoTCkgPT4gewogICAgICAgICAgICBjb25zdCBOID0gdS5nZXQoTCk7CiAgICAgICAgICAgIGlmIChOID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBZID0gZChMKTsKICAgICAgICAgICAgcmV0dXJuIE4gKyAoZSA/IFkud2lkdGggOiBZLmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChMKSA9PiBMICE9PSBudWxsKTsKICAgICAgICAgIEIubGVuZ3RoID4gMCAmJiAoTSA9IEIucmVkdWNlKChMLCBOKSA9PiBMICsgTiwgMCkgLyBCLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBiID0gTSAhPT0gbnVsbCA/IE0gLSBQIC8gMiA6IDgwOwogICAgICAgIGIgPCB4ICsgYyAmJiAoYiA9IHggPT09IC0xIC8gMCA/IDgwIDogeCArIGMpLCB1LnNldChtLCBiKSwgeCA9IGIgKyBQOwogICAgICB9CiAgICB9CiAgICBmb3IgKGxldCB3ID0gdC5sZW5ndGggLSAxOyB3ID49IDA7IHctLSkgewogICAgICBjb25zdCBDID0gdFt3XSwgeCA9IGYuZ2V0KEMpIHx8IFtdOwogICAgICBmb3IgKGNvbnN0IEkgb2YgeCkgewogICAgICAgIGNvbnN0IFAgPSBsLmdldChJKSB8fCBbXTsKICAgICAgICBpZiAoUC5sZW5ndGggPT09IDApIGNvbnRpbnVlOwogICAgICAgIGNvbnN0IFMgPSBQLm1hcCgoTSkgPT4gewogICAgICAgICAgY29uc3QgYiA9IHUuZ2V0KE0pOwogICAgICAgICAgaWYgKGIgPT09IHZvaWQgMCkgcmV0dXJuIG51bGw7CiAgICAgICAgICBjb25zdCBCID0gZChNKTsKICAgICAgICAgIHJldHVybiBiICsgKGUgPyBCLndpZHRoIDogQi5oZWlnaHQpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKE0pID0+IE0gIT09IG51bGwpOwogICAgICAgIGlmIChTLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IE0gPSBTLnJlZHVjZSgoTCwgTikgPT4gTCArIE4sIDApIC8gUy5sZW5ndGgsIGIgPSBkKEkpLCBCID0gZSA/IGIud2lkdGggOiBiLmhlaWdodDsKICAgICAgICAgIHUuc2V0KEksIE0gLSBCIC8gMik7CiAgICAgICAgfQogICAgICB9CiAgICAgIGxldCBtID0gLTEgLyAwOwogICAgICBmb3IgKGNvbnN0IEkgb2YgeCkgewogICAgICAgIGNvbnN0IFAgPSBkKEkpLCBTID0gZSA/IFAud2lkdGggOiBQLmhlaWdodDsKICAgICAgICBsZXQgTSA9IHUuZ2V0KEkpID8/IDgwOwogICAgICAgIE0gPCBtICsgYyAmJiAoTSA9IG0gKyBjLCB1LnNldChJLCBNKSksIG0gPSBNICsgUzsKICAgICAgfQogICAgfQogICAgbGV0IGkgPSAxIC8gMDsKICAgIGZvciAoY29uc3QgdyBvZiB1LnZhbHVlcygpKSBpID0gTWF0aC5taW4oaSwgdyk7CiAgICBjb25zdCBPID0gaSA8IDgwID8gODAgLSBpIDogMDsKICAgIGZvciAoY29uc3QgdyBvZiB0KSB7CiAgICAgIGNvbnN0IEMgPSBmLmdldCh3KSB8fCBbXSwgeCA9IHMuZ2V0KHcpIHx8IDgwOwogICAgICBmb3IgKGNvbnN0IG0gb2YgQykgewogICAgICAgIGNvbnN0IEkgPSBkKG0pLCBQID0gKHUuZ2V0KG0pID8/IDgwKSArIE8sIGIgPSB7IGlkOiBtLCB4OiBlID8gUCA6IHgsIHk6IGUgPyB4IDogUCwgd2lkdGg6IEkud2lkdGgsIGhlaWdodDogSS5oZWlnaHQgfTsKICAgICAgICBuLmNvbnRhaW5lcnNbbV0gPyBhW21dID0gYiA6IHJbbV0gPSBiOwogICAgICB9CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIGYsIGQpIHsKICAgIHZhciBoLCByOwogICAgY29uc3QgZSA9IChhKSA9PiBmW2FdIHx8IGRbYV07CiAgICBmb3IgKGNvbnN0IGEgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkgewogICAgICBjb25zdCB0ID0gZShhLnNvdXJjZUlkKSwgcyA9IGUoYS50YXJnZXRJZCk7CiAgICAgIGlmICghdCB8fCAhcykgY29udGludWU7CiAgICAgIGNvbnN0IHkgPSBuLm5vZGVzW2Euc291cmNlSWRdIHx8IG4uY29udGFpbmVyc1thLnNvdXJjZUlkXSwgbyA9IG4ubm9kZXNbYS50YXJnZXRJZF0gfHwgbi5jb250YWluZXJzW2EudGFyZ2V0SWRdLCBjID0gcy54ICsgcy53aWR0aCAvIDIgLSAodC54ICsgdC53aWR0aCAvIDIpLCBnID0gcy55ICsgcy5oZWlnaHQgLyAyIC0gKHQueSArIHQuaGVpZ2h0IC8gMiksIHAgPSBNYXRoLmFicyhjKSA+IE1hdGguYWJzKGcpICogMS4yNSwgbCA9IChoID0geSA9PSBudWxsID8gdm9pZCAwIDogeS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGguZmluZCgoaSkgPT4gaS5pZCA9PT0gYS5zb3VyY2VQb3J0SWQpOwogICAgICBsICYmICghbC5zaWRlIHx8IGwuc2lkZSA9PT0gImF1dG8iKSAmJiAocCA/IGwuc2lkZSA9IGMgPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiBsLnNpZGUgPSBnID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgdSA9IChyID0gbyA9PSBudWxsID8gdm9pZCAwIDogby5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IHIuZmluZCgoaSkgPT4gaS5pZCA9PT0gYS50YXJnZXRQb3J0SWQpOwogICAgICB1ICYmICghdS5zaWRlIHx8IHUuc2lkZSA9PT0gImF1dG8iKSAmJiAocCA/IHUuc2lkZSA9IGMgPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiB1LnNpZGUgPSBnID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhuKSB7CiAgICBjb25zdCBmID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgZCA9IChlKSA9PiB7CiAgICAgIHZhciBhOwogICAgICBpZiAoZi5oYXMoZSkpIHJldHVybiBmLmdldChlKTsKICAgICAgY29uc3QgaCA9IChhID0gbi5jb250YWluZXJzW2VdKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZDsKICAgICAgaWYgKCFoIHx8ICFuLmNvbnRhaW5lcnNbaF0pCiAgICAgICAgcmV0dXJuIGYuc2V0KGUsIDApLCAwOwogICAgICBjb25zdCByID0gMSArIGQoaCk7CiAgICAgIHJldHVybiBmLnNldChlLCByKSwgcjsKICAgIH07CiAgICBmb3IgKGNvbnN0IGUgb2YgT2JqZWN0LmtleXMobi5jb250YWluZXJzKSkKICAgICAgZChlKTsKICAgIHJldHVybiBmOwogIH0KfQpjbGFzcyBVIHsKICBhc3luYyBleGVjdXRlKG4sIGYsIGQpIHsKICAgIGNvbnN0IGUgPSBPYmplY3QudmFsdWVzKG4uY29udGFpbmVycyksIGggPSBPYmplY3QudmFsdWVzKG4ubm9kZXMpLCByID0gbmV3IFNldCgKICAgICAgZS5maWx0ZXIoKGMpID0+ICEhYy5jb2xsYXBzZWQpLm1hcCgoYykgPT4gYy5pZCkKICAgICksIGEgPSAoYykgPT4gewogICAgICB2YXIgcDsKICAgICAgbGV0IGcgPSBjOwogICAgICBmb3IgKDsgZzsgKSB7CiAgICAgICAgaWYgKHIuaGFzKGcpKSByZXR1cm4gITA7CiAgICAgICAgZyA9IChwID0gbi5jb250YWluZXJzW2ddKSA9PSBudWxsID8gdm9pZCAwIDogcC5wYXJlbnRJZDsKICAgICAgfQogICAgICByZXR1cm4gITE7CiAgICB9LCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgW2MsIGddIG9mIE9iamVjdC5lbnRyaWVzKG4ubm9kZXMpKQogICAgICBhKGcucGFyZW50SWQpIHx8IHQuYWRkKGMpOwogICAgZm9yIChjb25zdCBbYywgZ10gb2YgT2JqZWN0LmVudHJpZXMobi5jb250YWluZXJzKSkgewogICAgICBjb25zdCBwID0gZzsKICAgICAgcC5jb2xsYXBzZWQgPyBhKHAucGFyZW50SWQpIHx8IHQuYWRkKGMpIDogIShoLnNvbWUoKHUpID0+IHUucGFyZW50SWQgPT09IGMpIHx8IGUuc29tZSgodSkgPT4gdS5wYXJlbnRJZCA9PT0gYykpICYmICFhKHAucGFyZW50SWQpICYmIHQuYWRkKGMpOwogICAgfQogICAgY29uc3QgcyA9IFguZGVjb3VwbGUobiwgdCksIHkgPSBHLmFzc2lnbkxheWVycyhzLmFsbEVudGl0eUlkcywgcy5hZGpMaXN0KSwgbyA9IEEubWluaW1pemVDcm9zc2luZ3MoeSwgcy5hZGpMaXN0LCA0KTsKICAgIHJldHVybiBELmFzc2lnbkNvb3JkaW5hdGVzKG4sIG8sIGYsIGQpOwogIH0KfQpjb25zdCBxID0gbmV3IFUoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAodikgPT4gewogIGNvbnN0IHsgaWQ6IG4sIGdyYXBoOiBmLCBtZWFzdXJlbWVudHM6IGQsIG9wdGlvbnM6IGUgfSA9IHYuZGF0YTsKICB0cnkgewogICAgY29uc3QgaCA9IG5ldyBNYXAoZCksIHIgPSBhd2FpdCBxLmV4ZWN1dGUoZiwgaCwgZSk7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IG4sIHN1Y2Nlc3M6ICEwLCBsYXlvdXQ6IHIgfSk7CiAgfSBjYXRjaCAoaCkgewogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBuLCBzdWNjZXNzOiAhMSwgZXJyb3I6IGgubWVzc2FnZSB9KTsKICB9Cn07Cg==", ne = (d) => Uint8Array.from(atob(d), (g) => g.charCodeAt(0)), Tt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", ne(Yt)], { type: "text/javascript;charset=utf-8" });
function Ie(d) {
  let g;
  try {
    if (g = Tt && (self.URL || self.webkitURL).createObjectURL(Tt), !g) throw "";
    const C = new Worker(g, {
      type: "module",
      name: d == null ? void 0 : d.name
    });
    return C.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(g);
    }), C;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Yt,
      {
        type: "module",
        name: d == null ? void 0 : d.name
      }
    );
  }
}
class ie {
  constructor() {
    At(this, "worker", null);
    At(this, "pendingRequests", /* @__PURE__ */ new Map());
    At(this, "fallbackEngine", new se());
    if (typeof Worker < "u")
      try {
        this.worker = new Ie(), this.worker.onmessage = (g) => {
          const { id: C, success: i, layout: s, error: l } = g.data, c = this.pendingRequests.get(C);
          c && (this.pendingRequests.delete(C), i ? c.resolve(s) : c.reject(new Error(l)));
        }, this.worker.onerror = (g) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", g);
        };
      } catch (g) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", g), this.worker = null;
      }
  }
  execute(g, C, i) {
    return this.worker ? new Promise((s, l) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: s, reject: l });
      const r = Array.from(C.entries());
      this.worker.postMessage({
        id: c,
        graph: g,
        measurements: r,
        options: i
      });
    }) : this.fallbackEngine.execute(g, C, i);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class Ce {
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: C, hoveredEntity: i, graph: s } = g;
    return i && i.id === C.id ? null : i && s.containers[i.id] ? C.parentId === i.id ? null : {
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
class Ge {
  onDragEnd(g) {
    const { draggedEntity: C, hoveredEdge: i, hoveredEntity: s, graph: l } = g, c = (r) => {
      const o = l.nodes[r.id] || r;
      if (!o.ports || o.ports.length === 0) return "";
      const a = Object.values(l.edges).find((t) => t.targetId === r.id);
      if (a) {
        const t = o.ports.find((e) => e.id === a.targetPortId);
        if (t) return t.id;
      }
      const B = new Set(
        Object.values(l.edges).filter((t) => t.sourceId === r.id).map((t) => t.sourcePortId)
      ), u = o.ports.find((t) => !B.has(t.id));
      return u ? u.id : o.ports[0].id;
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
    if (s && s.id !== C.id) {
      const r = Object.values(l.edges).find(
        (o) => o.targetId === s.id && o.sourceId !== C.id
      );
      if (r)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: r.id,
            newSourceId: r.sourceId,
            newTargetId: C.id,
            newTargetPortId: c(C)
          }
        };
    }
    return null;
  }
}
function de(d, g = { min: 0.15, max: 3 }) {
  const [C, i] = j({ x: 80, y: 80, zoom: 1 }), s = _(!1), l = _({ x: 0, y: 0 }), c = D(
    (A, n) => {
      if (!d.current) return { x: A, y: n };
      const I = d.current.getBoundingClientRect();
      return {
        x: (A - I.left - C.x) / C.zoom,
        y: (n - I.top - C.y) / C.zoom
      };
    },
    [C, d]
  ), r = D(
    (A) => {
      if (!d.current) return;
      const n = [
        ...Object.values(A.nodes),
        ...Object.values(A.containers)
      ];
      if (n.length === 0) {
        i({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let I = 1 / 0, b = 1 / 0, h = -1 / 0, m = -1 / 0;
      for (const p of n)
        I = Math.min(I, p.x), b = Math.min(b, p.y), h = Math.max(h, p.x + p.width), m = Math.max(m, p.y + p.height);
      const f = d.current.getBoundingClientRect(), w = 80, L = Math.max(h - I, 100), Z = Math.max(m - b, 100), X = (f.width - w * 2) / L, H = (f.height - w * 2) / Z, x = Math.min(
        Math.max(Math.min(X, H), g.min),
        Math.min(g.max, 1.25)
      ), W = (f.width - L * x) / 2 - I * x, G = (f.height - Z * x) / 2 - b * x;
      i({
        x: W,
        y: G,
        zoom: x
      });
    },
    [d, g]
  ), o = D(
    (A) => {
      if (A.preventDefault(), !!d.current)
        if (A.ctrlKey || A.metaKey) {
          const n = d.current.getBoundingClientRect(), I = A.clientX - n.left, b = A.clientY - n.top, h = A.deltaY < 0 ? 1.08 : 0.92, m = Math.min(Math.max(C.zoom * h, g.min), g.max), f = I - (I - C.x) * (m / C.zoom), w = b - (b - C.y) * (m / C.zoom);
          i({ x: f, y: w, zoom: m });
        } else
          i((n) => ({
            ...n,
            x: n.x - A.deltaX,
            y: n.y - A.deltaY
          }));
    },
    [C, g, d]
  ), a = D(
    (A, n) => {
      s.current = !0, l.current = { x: A - C.x, y: n - C.y };
    },
    [C]
  ), B = D((A, n) => {
    s.current && i((I) => ({
      ...I,
      x: A - l.current.x,
      y: n - l.current.y
    }));
  }, []), u = D(() => {
    s.current = !1;
  }, []), t = D(() => {
    i({ x: 80, y: 80, zoom: 1 });
  }, []), e = D(() => {
    i((A) => ({
      ...A,
      zoom: Math.min(A.zoom * 1.2, g.max)
    }));
  }, [g]), y = D(() => {
    i((A) => ({
      ...A,
      zoom: Math.max(A.zoom / 1.2, g.min)
    }));
  }, [g]);
  return {
    transform: C,
    setTransform: i,
    screenToWorld: c,
    onWheel: o,
    startPan: a,
    updatePan: B,
    endPan: u,
    resetTransform: t,
    zoomIn: e,
    zoomOut: y,
    zoomToFit: r,
    isPanning: s
  };
}
function ce(d) {
  const [g, C] = j(
    /* @__PURE__ */ new Map()
  );
  _(/* @__PURE__ */ new Map());
  const i = _(/* @__PURE__ */ new Map()), s = D((l, c) => {
    c ? i.current.set(l, c) : i.current.delete(l);
  }, []);
  return Kt(() => {
    const l = new ResizeObserver((c) => {
      let r = !1;
      const o = new Map(g);
      for (const a of c) {
        const B = a.target.getAttribute("data-sysflow-measure-id");
        if (!B) continue;
        const u = Math.ceil(a.contentRect.width), t = Math.ceil(a.contentRect.height), e = o.get(B);
        (!e || e.width !== u || e.height !== t) && (o.set(B, { width: u, height: t }), r = !0);
      }
      r && C(o);
    });
    return i.current.forEach((c) => l.observe(c)), () => {
      l.disconnect();
    };
  }, [d]), { measurements: g, registerMeasureElement: s };
}
function re(d, g, C, i, s) {
  const [l, c] = j(null), [r, o] = j(null), a = _(null), B = _(null), u = D(
    (n, I) => {
      let b = null, h = 1 / 0;
      for (const [m, f] of Object.entries(g.containers))
        if (m !== I && n.x >= f.x && n.x <= f.x + f.width && n.y >= f.y && n.y <= f.y + f.height) {
          const w = f.width * f.height;
          w < h && (h = w, b = d.containers[m] || null);
        }
      if (b) return b;
      for (const [m, f] of Object.entries(g.nodes))
        if (m !== I && n.x >= f.x && n.x <= f.x + f.width && n.y >= f.y && n.y <= f.y + f.height)
          return d.nodes[m] || null;
      return null;
    },
    [g, d]
  ), t = D(
    (n, I) => {
      let b = null, h = 45;
      for (const m of Object.values(d.edges)) {
        if (m.sourceId === I || m.targetId === I) continue;
        const f = g.nodes[m.sourceId] || g.containers[m.sourceId], w = g.nodes[m.targetId] || g.containers[m.targetId];
        if (!f || !w) continue;
        const L = f.x + f.width, Z = f.y + f.height / 2, X = w.x, H = w.y + w.height / 2;
        for (let x = 0; x <= 10; x++) {
          const W = x / 10, G = (1 - W) * L + W * X, p = (1 - W) * Z + W * H, k = Math.hypot(n.x - G, n.y - p);
          k < h && (h = k, b = m);
        }
      }
      return b;
    },
    [g, d]
  ), e = D(
    (n, I) => {
      if (I.stopPropagation(), C.canDrag && !C.canDrag(n, d))
        return;
      const b = i(I.clientX, I.clientY);
      c({
        draggedEntity: n,
        ghostPosition: b
      });
    },
    [d, C, i]
  ), y = D(
    (n) => {
      if (!l) return;
      const I = i(n.clientX, n.clientY), b = u(I, l.draggedEntity.id), h = t(I, l.draggedEntity.id);
      a.current = b, B.current = h, b && d.containers[b.id] ? o(b.id) : o(null);
      const m = C.onDragMove ? C.onDragMove({
        draggedEntity: l.draggedEntity,
        cursorWorld: I,
        hoveredEntity: b,
        hoveredEdge: h,
        graph: d
      }) : I;
      m && c((f) => f ? { ...f, ghostPosition: m } : null);
    },
    [l, i, C, d, u, t]
  ), A = D(
    (n) => {
      if (!l) return;
      const I = i(n.clientX, n.clientY), b = u(I, l.draggedEntity.id), h = t(I, l.draggedEntity.id), m = C.onDragEnd({
        draggedEntity: l.draggedEntity,
        cursorWorld: I,
        hoveredEntity: b,
        hoveredEdge: h,
        graph: d
      });
      m && s(m), c(null), o(null), a.current = null, B.current = null;
    },
    [l, i, C, d, u, t, s]
  );
  return {
    dragState: l,
    hoveredContainerId: r,
    handlePointerDown: e,
    handlePointerMove: y,
    handlePointerUp: A
  };
}
function me(d) {
  const [g, C] = j([d]), [i, s] = j(0), [l, c] = j(null), r = g[i], o = D((n) => {
    const I = _t(n);
    C((b) => [...b.slice(0, i + 1), I]), s((b) => b + 1);
  }, [i]), a = D(() => {
    i > 0 && s((n) => n - 1);
  }, [i]), B = D(() => {
    i < g.length - 1 && s((n) => n + 1);
  }, [i, g.length]), u = D((n) => {
    var b, h, m, f;
    const I = g[i];
    if (n.type === "ENTITY_REPARENT") {
      const { entityId: w, newParentId: L } = n.payload, Z = {
        ...I,
        nodes: { ...I.nodes },
        containers: { ...I.containers }
      };
      Z.nodes[w] ? Z.nodes[w] = { ...Z.nodes[w], parentId: L } : Z.containers[w] && (Z.containers[w] = { ...Z.containers[w], parentId: L }), o(Z);
    } else if (n.type === "CONTAINER_TOGGLE_COLLAPSE") {
      const { containerId: w, collapsed: L } = n.payload;
      I.containers[w] && o({
        ...I,
        containers: {
          ...I.containers,
          [w]: { ...I.containers[w], collapsed: L }
        }
      });
    } else if (n.type === "EDGE_CREATE") {
      const w = n.payload.id || `E_${Date.now()}`;
      o({
        ...I,
        edges: {
          ...I.edges,
          [w]: { id: w, ...n.payload.edge }
        }
      });
    } else if (n.type === "EDGE_DELETE") {
      const w = { ...I.edges };
      delete w[n.payload.edgeId], o({ ...I, edges: w });
    } else if (n.type === "EDGE_REWIRE") {
      const { edgeId: w, newTargetId: L } = n.payload;
      if (!L || !I.edges[w]) return;
      const Z = L, X = I.edges[w], H = X.targetId, x = Object.values(I.edges).find((z) => z.targetId === Z), W = Object.values(I.edges).find((z) => z.sourceId === Z), G = { ...I.edges };
      x && W && (G[x.id] = { ...x, targetId: W.targetId, targetPortId: W.targetPortId }, delete G[W.id]);
      const p = ((h = (b = I.nodes[Z]) == null ? void 0 : b.ports[0]) == null ? void 0 : h.id) || "p_in", k = ((f = (m = I.nodes[Z]) == null ? void 0 : m.ports.find((z) => z.id !== p)) == null ? void 0 : f.id) || p;
      G[w] = {
        ...X,
        targetId: Z,
        targetPortId: p
      };
      const V = `REWIRE_${Date.now()}`;
      G[V] = {
        id: V,
        sourceId: Z,
        sourcePortId: k,
        targetId: H,
        targetPortId: X.targetPortId
      }, o({ ...I, edges: G });
    }
  }, [g, i, o]), t = D((n) => {
    const I = r.nodes[n] || r.containers[n];
    I && c({ entity: JSON.parse(JSON.stringify(I)), isCut: !1 });
  }, [r]), e = D((n) => {
    const I = r.nodes[n] || r.containers[n];
    if (I) {
      c({ entity: JSON.parse(JSON.stringify(I)), isCut: !0 });
      const b = { ...r.nodes }, h = { ...r.containers };
      delete b[n], delete h[n], o({ ...r, nodes: b, containers: h });
    }
  }, [r, o]), y = D(() => {
    if (!l) return;
    const n = l.entity, I = `${n.id}_copy_${Date.now().toString().slice(-4)}`, b = { ...n, id: I, label: `${n.label} (Copy)` };
    "collapsed" in b ? o({
      ...r,
      containers: { ...r.containers, [I]: b }
    }) : o({
      ...r,
      nodes: { ...r.nodes, [I]: b }
    });
  }, [l, r, o]), A = D((n) => {
    if (n.length === 0) return;
    const I = { ...r.nodes }, b = { ...r.containers }, h = { ...r.edges };
    for (const m of n)
      delete I[m], delete b[m], delete h[m];
    o({
      ...r,
      nodes: I,
      containers: b,
      edges: h
    });
  }, [r, o]);
  return {
    graph: r,
    setGraphDirect: o,
    applyAction: u,
    undo: a,
    redo: B,
    copyEntity: t,
    cutEntity: e,
    pasteEntity: y,
    deleteSelection: A,
    canUndo: i > 0,
    canRedo: i < g.length - 1
  };
}
const le = ({
  graph: d,
  registerMeasureElement: g,
  nodeTypes: C,
  containerTypes: i
}) => {
  const s = Object.values(d.nodes), l = Object.values(d.containers);
  return /* @__PURE__ */ O("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    s.map((c) => {
      const r = c.type ? C == null ? void 0 : C[c.type] : null;
      return /* @__PURE__ */ T(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: r ? /* @__PURE__ */ T(r, { node: c, selected: !1 }) : /* @__PURE__ */ O("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ T("div", { style: { fontWeight: 600 }, children: c.label }),
            c.ports.length > 0 && /* @__PURE__ */ O("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              c.ports.map((o) => o.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${c.id}`
      );
    }),
    l.map((c) => {
      const r = c.type ? i == null ? void 0 : i[c.type] : null;
      return /* @__PURE__ */ T(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: r ? /* @__PURE__ */ T(r, { container: c, selected: !1 }) : /* @__PURE__ */ T("div", { className: "sysflow-container-header", children: c.label })
        },
        `measure-container-${c.id}`
      );
    })
  ] });
}, ae = ({
  graph: d,
  layout: g,
  selectedIds: C,
  direction: i = "TB",
  showArrows: s = !0,
  routing: l = "auto",
  portOptions: c,
  onEdgeClick: r
}) => {
  const o = l === "step" || l === "auto" && (i === "LR" || i === "RL"), a = (t, e, y) => {
    var X, H, x, W;
    let A = t, n = null;
    for ((X = d.containers[t]) != null && X.collapsed && (n = d.containers[t]); A; ) {
      const G = ((H = d.nodes[A]) == null ? void 0 : H.parentId) ?? ((x = d.containers[A]) == null ? void 0 : x.parentId) ?? null;
      G && ((W = d.containers[G]) != null && W.collapsed) && (n = d.containers[G]), A = G;
    }
    if (n) {
      const G = g.containers[n.id];
      if (!G)
        return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: n.id };
      let p, k, V;
      return i === "TB" ? (p = y ? "bottom" : "top", k = G.x + G.width / 2, V = y ? G.y + G.height : G.y) : i === "BT" ? (p = y ? "top" : "bottom", k = G.x + G.width / 2, V = y ? G.y : G.y + G.height) : i === "RL" ? (p = y ? "left" : "right", k = y ? G.x : G.x + G.width, V = G.y + G.height / 2) : (p = y ? "right" : "left", k = y ? G.x + G.width : G.x, V = G.y + G.height / 2), { x: k, y: V, side: p, valid: !0, entityId: n.id };
    }
    if (!!d.containers[t]) {
      const G = g.containers[t];
      if (!G) return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: t };
      let p, k, V;
      return i === "TB" ? (p = G.x + G.width / 2, k = y ? G.y + G.height : G.y, V = y ? "bottom" : "top") : i === "BT" ? (p = G.x + G.width / 2, k = y ? G.y : G.y + G.height, V = y ? "top" : "bottom") : i === "RL" ? (p = y ? G.x : G.x + G.width, k = G.y + G.height / 2, V = y ? "left" : "right") : (p = y ? G.x + G.width : G.x, k = G.y + G.height / 2, V = y ? "right" : "left"), { x: p, y: k, side: V, valid: !0, entityId: t };
    }
    const b = d.nodes[t], h = g.nodes[t];
    if (!b || !h)
      return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: t };
    const f = Zt(
      b,
      h,
      i,
      d.edges,
      c
    ).get(e);
    if (f)
      return { x: f.worldX, y: f.worldY, side: f.side, valid: !0, entityId: t };
    let w, L, Z;
    return i === "TB" ? (w = h.x + h.width / 2, L = y ? h.y + h.height : h.y, Z = y ? "bottom" : "top") : i === "BT" ? (w = h.x + h.width / 2, L = y ? h.y : h.y + h.height, Z = y ? "top" : "bottom") : i === "RL" ? (w = y ? h.x : h.x + h.width, L = h.y + h.height / 2, Z = y ? "left" : "right") : (w = y ? h.x + h.width : h.x, L = h.y + h.height / 2, Z = y ? "right" : "left"), { x: w, y: L, side: Z, valid: !0, entityId: t };
  }, B = (t, e) => {
    const y = (t.x + e.x) / 2, A = (t.y + e.y) / 2;
    if (t.side === "right" && e.side === "left") {
      if (e.x >= t.x + 20)
        return `M ${t.x} ${t.y} L ${y} ${t.y} L ${y} ${e.y} L ${e.x} ${e.y}`;
      {
        const n = e.y >= t.y ? t.y - 40 : t.y + 40;
        return `M ${t.x} ${t.y} L ${t.x + 20} ${t.y} L ${t.x + 20} ${n} L ${e.x - 20} ${n} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`;
      }
    }
    if (t.side === "left" && e.side === "right") {
      if (e.x <= t.x - 20)
        return `M ${t.x} ${t.y} L ${y} ${t.y} L ${y} ${e.y} L ${e.x} ${e.y}`;
      {
        const n = e.y >= t.y ? t.y - 40 : t.y + 40;
        return `M ${t.x} ${t.y} L ${t.x - 20} ${t.y} L ${t.x - 20} ${n} L ${e.x + 20} ${n} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`;
      }
    }
    if (t.side === "bottom" && e.side === "top") {
      if (e.y >= t.y + 16)
        return `M ${t.x} ${t.y} L ${t.x} ${A} L ${e.x} ${A} L ${e.x} ${e.y}`;
      {
        const n = e.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${n} ${t.y + 20} L ${n} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`;
      }
    }
    if (t.side === "top" && e.side === "bottom") {
      if (e.y <= t.y - 16)
        return `M ${t.x} ${t.y} L ${t.x} ${A} L ${e.x} ${A} L ${e.x} ${e.y}`;
      {
        const n = e.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y - 20} L ${n} ${t.y - 20} L ${n} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`;
      }
    }
    return `M ${t.x} ${t.y} L ${y} ${t.y} L ${y} ${e.y} L ${e.x} ${e.y}`;
  }, u = (t, e) => {
    const y = e.x - t.x, A = e.y - t.y;
    if (t.side === "bottom" && e.side === "top")
      if (A > 0) {
        const m = Math.min(28, A * 0.4), f = t.y + Math.max(m, A * 0.5), w = e.y - Math.max(m, A * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${f} ${e.x} ${w} ${e.x} ${e.y}`;
      } else {
        const m = y >= 0 ? 1 : -1, f = Math.max(40, Math.abs(y) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + f * m} ${t.y + 40} ${e.x + f * m} ${e.y - 40} ${e.x} ${e.y}`;
      }
    if (t.side === "top" && e.side === "bottom")
      if (A < 0) {
        const m = Math.min(28, Math.abs(A) * 0.4), f = t.y - Math.max(m, Math.abs(A) * 0.5), w = e.y + Math.max(m, Math.abs(A) * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${f} ${e.x} ${w} ${e.x} ${e.y}`;
      } else {
        const m = y >= 0 ? 1 : -1, f = Math.max(40, Math.abs(y) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + f * m} ${t.y - 40} ${e.x + f * m} ${e.y + 40} ${e.x} ${e.y}`;
      }
    if (t.side === "right" && e.side === "left")
      if (y > 0) {
        const m = t.x + y * 0.5, f = e.x - y * 0.5;
        return `M ${t.x} ${t.y} C ${m} ${t.y} ${f} ${e.y} ${e.x} ${e.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x + 50} ${t.y - 50} ${e.x - 50} ${e.y - 50} ${e.x} ${e.y}`;
    if (t.side === "left" && e.side === "right")
      if (y < 0) {
        const m = t.x + y * 0.5, f = e.x - y * 0.5;
        return `M ${t.x} ${t.y} C ${m} ${t.y} ${f} ${e.y} ${e.x} ${e.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x - 50} ${t.y - 50} ${e.x + 50} ${e.y - 50} ${e.x} ${e.y}`;
    const n = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      top: { x: 0, y: -1 },
      bottom: { x: 0, y: 1 }
    }, I = n[t.side] || { x: 0, y: 1 }, b = n[e.side] || { x: 0, y: -1 }, h = Math.min(60, Math.hypot(y, A) * 0.35);
    return `M ${t.x} ${t.y} C ${t.x + I.x * h} ${t.y + I.y * h} ${e.x + b.x * h} ${e.y + b.y * h} ${e.x} ${e.y}`;
  };
  return /* @__PURE__ */ O("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ O("defs", { children: [
      /* @__PURE__ */ T(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ T("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ T(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ T("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(d.edges).map((t) => {
      const e = a(t.sourceId, t.sourcePortId, !0), y = a(t.targetId, t.targetPortId, !1);
      if (!e.valid || !y.valid || e.entityId === y.entityId) return null;
      const A = C.includes(t.id), n = o ? B(e, y) : u(e, y);
      return /* @__PURE__ */ O("g", { style: { pointerEvents: "stroke" }, children: [
        /* @__PURE__ */ T(
          "path",
          {
            d: n,
            fill: "none",
            stroke: "transparent",
            strokeWidth: 14,
            onClick: (I) => {
              I.stopPropagation(), r == null || r(t.id);
            },
            style: { cursor: "pointer" }
          }
        ),
        /* @__PURE__ */ T(
          "path",
          {
            d: n,
            fill: "none",
            stroke: A ? "var(--sysflow-edge-selected)" : "var(--sysflow-edge-stroke)",
            strokeWidth: A ? 2.5 : 1.75,
            strokeLinejoin: "round",
            strokeLinecap: "round",
            markerEnd: s ? A ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
          }
        )
      ] }, t.id);
    })
  ] });
}, Ae = ({
  entity: d,
  layout: g,
  direction: C = "LR",
  edges: i,
  portOptions: s,
  onPortPointerDown: l,
  onPortPointerUp: c
}) => {
  if (!d.ports || d.ports.length === 0)
    return null;
  const r = Zt(
    d,
    g,
    C,
    i,
    s
  );
  return /* @__PURE__ */ T(Jt, { children: d.ports.map((o) => {
    const a = r.get(o.id);
    return a ? /* @__PURE__ */ T(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${a.side}`,
        style: {
          position: "absolute",
          left: `${a.localX}px`,
          top: `${a.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${o.label} (${a.side})`,
        onPointerDown: (B) => {
          B.stopPropagation(), l == null || l(d.id, o.id, !0, B);
        },
        onPointerUp: (B) => {
          B.stopPropagation(), c == null || c(d.id, o.id, !1);
        }
      },
      o.id
    ) : null;
  }) });
}, ye = ({
  node: d,
  layout: g,
  selected: C = !1,
  direction: i = "LR",
  edges: s,
  portOptions: l,
  onPointerDown: c,
  onMouseEnter: r,
  onMouseLeave: o,
  onClick: a,
  onPortPointerDown: B,
  onPortPointerUp: u,
  customRenderer: t
}) => /* @__PURE__ */ O(
  "div",
  {
    className: `sysflow-node ${C ? "sysflow-selected" : ""} ${d.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (e) => c == null ? void 0 : c(d, e),
    onMouseEnter: () => r == null ? void 0 : r(d.id),
    onMouseLeave: () => o == null ? void 0 : o(d.id),
    onClick: a,
    children: [
      /* @__PURE__ */ T(
        Ae,
        {
          entity: d,
          layout: g,
          direction: i,
          edges: s,
          portOptions: l,
          onPortPointerDown: B,
          onPortPointerUp: u
        }
      ),
      t ? /* @__PURE__ */ T(t, { node: d, selected: C }) : /* @__PURE__ */ O("div", { style: { padding: "10px 14px" }, children: [
        /* @__PURE__ */ T("div", { style: { fontWeight: 600, fontSize: "13px" }, children: d.label }),
        d.ports.length > 0 && /* @__PURE__ */ O("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
          d.ports.length,
          " Port",
          d.ports.length > 1 ? "s" : ""
        ] })
      ] })
    ]
  }
), he = ({
  container: d,
  layout: g,
  selected: C,
  isHovered: i = !1,
  onToggleCollapse: s,
  onPointerDown: l,
  onMouseEnter: c,
  onMouseLeave: r,
  onClick: o,
  customRenderer: a
}) => /* @__PURE__ */ T(
  "div",
  {
    className: `sysflow-container ${C ? "sysflow-selected" : ""} ${i ? "sysflow-hovered" : ""} ${d.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (B) => l(d, B),
    onMouseEnter: c,
    onMouseLeave: r,
    onClick: o,
    children: a ? /* @__PURE__ */ T(a, { container: d, selected: C }) : /* @__PURE__ */ O("div", { className: "sysflow-container-header", children: [
      /* @__PURE__ */ T(
        "span",
        {
          className: "sysflow-container-title",
          title: d.label,
          children: d.label
        }
      ),
      /* @__PURE__ */ T(
        "button",
        {
          className: "sysflow-collapse-btn",
          onClick: (B) => {
            B.stopPropagation(), s(d.id, !d.collapsed);
          },
          children: d.collapsed ? "Expand ⊞" : "Collapse ⊟"
        }
      )
    ] })
  }
), ue = new Ce(), Ke = ({
  graph: d,
  onChange: g,
  layoutEngine: C,
  interactionStrategy: i = ue,
  direction: s = "TB",
  layoutOptions: l,
  portPlacementMode: c,
  routing: r,
  showEdgeArrows: o = !0,
  nodeTypes: a,
  containerTypes: B,
  zoomBounds: u,
  className: t = "",
  selectedIds: e = [],
  theme: y = "dark"
}) => {
  var Lt, xt;
  const A = _(null), n = _(null);
  !C && !n.current && (n.current = new ie());
  const I = C || n.current, {
    transform: b,
    screenToWorld: h,
    onWheel: m,
    startPan: f,
    updatePan: w,
    endPan: L,
    resetTransform: Z,
    zoomIn: X,
    zoomOut: H,
    zoomToFit: x,
    isPanning: W
  } = de(A, u), { measurements: G, registerMeasureElement: p } = ce(d), [k, V] = j({ nodes: {}, containers: {} }), z = zt(() => ({
    direction: s,
    mode: c ?? (s === "TB" || s === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: k.nodes
  }), [s, c, k.nodes]), [E, ct] = j(null), [M, rt] = j(null), ut = _(!1), {
    dragState: tt,
    hoveredContainerId: Ht,
    handlePointerDown: St,
    handlePointerMove: Wt,
    handlePointerUp: Xt
  } = re(d, k, i, h, g);
  Kt(() => {
    const K = (S) => {
      if (S.target instanceof HTMLInputElement || S.target instanceof HTMLTextAreaElement)
        return;
      if (S.key === "Escape") {
        S.preventDefault(), rt(null), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (S.code === "Space" && (ut.current = !0), S.key.toLowerCase() === "f" && !S.ctrlKey && !S.metaKey) {
        S.preventDefault(), x(k);
        return;
      }
      if ((S.ctrlKey || S.metaKey) && S.key.toLowerCase() === "a") {
        S.preventDefault();
        const Q = [
          ...Object.keys(d.nodes),
          ...Object.keys(d.containers)
        ];
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: Q } });
        return;
      }
      const Y = Object.keys(d.nodes);
      if (Y.length !== 0) {
        if (S.key === "Tab") {
          S.preventDefault();
          const Q = e.length > 0 ? Y.indexOf(e[0]) : -1;
          let v;
          S.shiftKey ? v = Q <= 0 ? Y.length - 1 : Q - 1 : v = (Q + 1) % Y.length, g({ type: "SELECTION_CHANGE", payload: { selectedIds: [Y[v]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(S.key)) {
          S.preventDefault();
          const Q = e[0] || Y[0], v = k.nodes[Q] || k.containers[Q];
          if (!v) return;
          const F = {
            x: v.x + v.width / 2,
            y: v.y + v.height / 2
          };
          let N = null, gt = 1 / 0;
          for (const st of Y) {
            if (st === Q) continue;
            const et = k.nodes[st];
            if (!et) continue;
            const Ct = {
              x: et.x + et.width / 2,
              y: et.y + et.height / 2
            }, nt = Ct.x - F.x, ot = Ct.y - F.y;
            let J = !1;
            if (S.key === "ArrowRight" && nt > 20 && (J = !0), S.key === "ArrowLeft" && nt < -20 && (J = !0), S.key === "ArrowDown" && ot > 20 && (J = !0), S.key === "ArrowUp" && ot < -20 && (J = !0), J) {
              const R = Math.hypot(nt, ot);
              R < gt && (gt = R, N = st);
            }
          }
          N && g({ type: "SELECTION_CHANGE", payload: { selectedIds: [N] } });
        }
      }
    }, P = (S) => {
      S.code === "Space" && (ut.current = !1);
    };
    return window.addEventListener("keydown", K), window.addEventListener("keyup", P), () => {
      window.removeEventListener("keydown", K), window.removeEventListener("keyup", P);
    };
  }, [d, k, e, x, g]), Kt(() => {
    let K = !1, P = 16 / 9;
    if (A.current) {
      const Y = A.current.getBoundingClientRect();
      Y.width > 0 && Y.height > 0 && (P = Y.width / Y.height);
    }
    const S = {
      direction: s,
      aspectRatio: P,
      ...l
    };
    return I.execute(d, G, S).then((Y) => {
      K || V(Y);
    }), () => {
      K = !0;
    };
  }, [d, G, I, s, l]);
  const Nt = (K, P, S, Y) => {
    const Q = d.nodes[K] || d.containers[K], v = k.nodes[K] || k.containers[K];
    if (!Q || !v) return;
    const N = Zt(
      Q,
      v,
      s,
      d.edges,
      z
    ).get(P), gt = N ? { x: N.worldX, y: N.worldY } : { x: v.x + v.width, y: v.y + v.height / 2 };
    ct({
      sourceId: K,
      sourcePortId: P,
      startWorldPos: gt,
      currentWorldPos: h(Y.clientX, Y.clientY)
    });
  }, vt = (K, P, S) => {
    var Y, Q, v, F, N, gt, st, et, Ct, nt;
    if (E && E.sourceId !== K) {
      const ot = d.nodes[E.sourceId] || d.containers[E.sourceId], J = d.nodes[K] || d.containers[K], R = (Y = ot == null ? void 0 : ot.ports) == null ? void 0 : Y.find((It) => It.id === E.sourcePortId), $ = (Q = J == null ? void 0 : J.ports) == null ? void 0 : Q.find((It) => It.id === P);
      let lt = E.sourceId, ft = E.sourcePortId, at = K, Bt = P;
      const Vt = ((v = R == null ? void 0 : R.label) == null ? void 0 : v.toLowerCase().includes("in")) || (R == null ? void 0 : R.side) === (s === "BT" ? "bottom" : "top");
      (F = R == null ? void 0 : R.label) != null && F.toLowerCase().includes("out") || (R == null || R.side), (N = $ == null ? void 0 : $.label) != null && N.toLowerCase().includes("in") || ($ == null || $.side);
      const Rt = ((gt = $ == null ? void 0 : $.label) == null ? void 0 : gt.toLowerCase().includes("out")) || ($ == null ? void 0 : $.side) === (s === "BT" ? "top" : "bottom");
      if (Vt && Rt)
        lt = K, ft = P, at = E.sourceId, Bt = E.sourcePortId;
      else if (k.nodes[E.sourceId] && k.nodes[K]) {
        const It = k.nodes[E.sourceId], kt = k.nodes[K], Ot = s === "BT" && It.y < kt.y, $t = s === "TB" && It.y > kt.y;
        if (Ot || $t) {
          lt = K, at = E.sourceId;
          const bt = d.nodes[lt], wt = d.nodes[at];
          ft = ((et = (st = bt == null ? void 0 : bt.ports) == null ? void 0 : st.find((dt) => dt.label.includes("out") || dt.side === (s === "BT" ? "top" : "bottom"))) == null ? void 0 : et.id) || P, Bt = ((nt = (Ct = wt == null ? void 0 : wt.ports) == null ? void 0 : Ct.find((dt) => dt.label.includes("in") || dt.side === (s === "BT" ? "bottom" : "top"))) == null ? void 0 : nt.id) || E.sourcePortId;
        }
      }
      g({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: lt,
            sourcePortId: ft,
            targetId: at,
            targetPortId: Bt
          }
        }
      });
    }
    ct(null);
  }, Dt = (K) => {
    if (K.button === 1 || ut.current) {
      f(K.clientX, K.clientY);
      return;
    }
    const P = K.target, S = P === A.current || P.classList.contains("sysflow-viewport") || P.classList.contains("sysflow-dom-layer") || P.tagName.toLowerCase() === "svg";
    if (K.button === 0 && S) {
      K.currentTarget.setPointerCapture(K.pointerId);
      const Y = h(K.clientX, K.clientY);
      rt({
        startX: Y.x,
        startY: Y.y,
        currentX: Y.x,
        currentY: Y.y
      }), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Et = (K) => {
    if (W.current)
      w(K.clientX, K.clientY);
    else if (M) {
      const P = h(K.clientX, K.clientY);
      rt((S) => S ? { ...S, currentX: P.x, currentY: P.y } : null);
    } else tt ? Wt(K) : E && ct(
      (P) => P ? { ...P, currentWorldPos: h(K.clientX, K.clientY) } : null
    );
  }, Mt = (K) => {
    if (K.currentTarget.hasPointerCapture(K.pointerId) && K.currentTarget.releasePointerCapture(K.pointerId), W.current && L(), M) {
      const P = Math.min(M.startX, M.currentX), S = Math.min(M.startY, M.currentY), Y = Math.max(M.startX, M.currentX), Q = Math.max(M.startY, M.currentY);
      if (Y - P > 4 || Q - S > 4) {
        const v = [];
        for (const [F, N] of Object.entries(k.nodes))
          N.x < Y && N.x + N.width > P && N.y < Q && N.y + N.height > S && v.push(F);
        for (const [F, N] of Object.entries(k.containers))
          N.x < Y && N.x + N.width > P && N.y < Q && N.y + N.height > S && v.push(F);
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: v } });
      }
      rt(null);
    }
    tt && Xt(K), E && ct(null);
  }, Qt = Object.values(d.containers);
  return /* @__PURE__ */ O(
    "div",
    {
      ref: A,
      className: `sysflow-canvas ${y === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${t}`,
      "data-theme": y,
      onWheel: m,
      onPointerDown: Dt,
      onPointerMove: Et,
      onPointerUp: Mt,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ T(
          le,
          {
            graph: d,
            registerMeasureElement: p,
            nodeTypes: a,
            containerTypes: B
          }
        ),
        /* @__PURE__ */ O("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ T("button", { onClick: X, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ T("button", { onClick: H, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ O("button", { onClick: Z, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(b.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ O(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${b.x}px, ${b.y}px) scale(${b.zoom})`
            },
            children: [
              M && /* @__PURE__ */ T(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(M.startX, M.currentX)}px`,
                    top: `${Math.min(M.startY, M.currentY)}px`,
                    width: `${Math.abs(M.currentX - M.startX)}px`,
                    height: `${Math.abs(M.currentY - M.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              /* @__PURE__ */ T(
                ae,
                {
                  graph: d,
                  layout: k,
                  selectedIds: e,
                  direction: s,
                  showArrows: o,
                  routing: r,
                  portOptions: z,
                  onEdgeClick: (K) => g({ type: "SELECTION_CHANGE", payload: { selectedIds: [K] } })
                }
              ),
              E && /* @__PURE__ */ T("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ T(
                "line",
                {
                  x1: E.startWorldPos.x,
                  y1: E.startWorldPos.y,
                  x2: E.currentWorldPos.x,
                  y2: E.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ O("div", { className: "sysflow-dom-layer", children: [
                Qt.map((K) => {
                  const P = k.containers[K.id];
                  return P ? /* @__PURE__ */ T(
                    he,
                    {
                      container: K,
                      layout: P,
                      selected: e.includes(K.id),
                      isHovered: Ht === K.id,
                      customRenderer: K.type ? B == null ? void 0 : B[K.type] : void 0,
                      onToggleCollapse: (S, Y) => g({
                        type: "CONTAINER_TOGGLE_COLLAPSE",
                        payload: { containerId: S, collapsed: Y }
                      }),
                      onPointerDown: St,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (S) => {
                        S.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [K.id] } });
                      }
                    },
                    K.id
                  ) : null;
                }),
                Object.values(d.nodes).map((K) => {
                  const P = k.nodes[K.id];
                  return P ? /* @__PURE__ */ T(
                    ye,
                    {
                      node: K,
                      layout: P,
                      direction: s,
                      edges: d.edges,
                      portOptions: z,
                      selected: e.includes(K.id),
                      customRenderer: K.type ? a == null ? void 0 : a[K.type] : void 0,
                      onPointerDown: St,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (S) => {
                        S.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [K.id] } });
                      },
                      onPortPointerDown: Nt,
                      onPortPointerUp: vt
                    },
                    K.id
                  ) : null;
                })
              ] }),
              tt && /* @__PURE__ */ T(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${tt.ghostPosition.x}px, ${tt.ghostPosition.y}px)`,
                    width: `${((Lt = G.get(tt.draggedEntity.id)) == null ? void 0 : Lt.width) || 200}px`,
                    height: `${((xt = G.get(tt.draggedEntity.id)) == null ? void 0 : xt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ T("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: tt.draggedEntity.label })
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
  Ge as EdgeRewireStrategy,
  he as GraphContainer,
  ae as GraphEdgeLayer,
  ye as GraphNode,
  Ae as GraphPortLayer,
  Ce as ReparentStrategy,
  se as SugiyamaEngine,
  Ke as SysFlowCanvas,
  ie as WorkerBridge,
  Zt as computeEntityPortLocations,
  _t as pruneDanglingEdges,
  de as useCanvasTransform,
  re as useDragGesture,
  me as useGraphHistory,
  ce as useMeasurement
};
