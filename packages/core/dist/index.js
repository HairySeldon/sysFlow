var Ft = Object.defineProperty;
var zt = (d, g, i) => g in d ? Ft(d, g, { enumerable: !0, configurable: !0, writable: !0, value: i }) : d[g] = i;
var At = (d, g, i) => zt(d, typeof g != "symbol" ? g + "" : g, i);
import { useState as z, useRef as _, useCallback as D, useEffect as Zt, useMemo as jt } from "react";
import { jsxs as O, jsx as T, Fragment as Jt } from "react/jsx-runtime";
function Ut(d, g, i, C) {
  const s = (r) => {
    const c = i.find(
      (l) => l.sourceId === g && l.sourcePortId === r || l.targetId === g && l.targetPortId === r
    );
    if (!c) return null;
    const A = c.sourceId === g ? c.targetId : c.sourceId, o = C[A];
    return o ? { x: o.x + o.width / 2, y: o.y + o.height / 2 } : null;
  };
  ["left", "right"].forEach((r) => {
    d[r].sort((c, A) => {
      var f, h;
      const o = ((f = s(c.id)) == null ? void 0 : f.y) ?? 0, l = ((h = s(A.id)) == null ? void 0 : h.y) ?? 0;
      return o - l;
    });
  }), ["top", "bottom"].forEach((r) => {
    d[r].sort((c, A) => {
      var f, h;
      const o = ((f = s(c.id)) == null ? void 0 : f.x) ?? 0, l = ((h = s(A.id)) == null ? void 0 : h.x) ?? 0;
      return o - l;
    });
  });
}
function qt(d, g, i, C, s, r) {
  if (!s || !r)
    return i ? "left" : "right";
  const c = C.find(
    (h) => i ? h.targetId === d && h.targetPortId === g : h.sourceId === d && h.sourcePortId === g
  );
  if (!c) return i ? "left" : "right";
  const A = i ? c.sourceId : c.targetId, o = s[A];
  if (!o) return i ? "left" : "right";
  const l = o.x + o.width / 2 - (r.x + r.width / 2), f = o.y + o.height / 2 - (r.y + r.height / 2);
  return Math.abs(l) > Math.abs(f) ? l > 0 ? "right" : "left" : f > 0 ? "bottom" : "top";
}
function Kt(d, g, i = "LR", C, s) {
  const r = /* @__PURE__ */ new Map();
  if (!d || !g || !d.ports || d.ports.length === 0)
    return r;
  const c = (s == null ? void 0 : s.direction) || i, A = c === "TB" || c === "BT", o = (s == null ? void 0 : s.mode) || (A ? "strict-flow" : "perimeter-optimized"), l = C ? Array.isArray(C) ? C : Object.values(C) : [], f = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, h = new Set(
    l.filter((e) => e.targetId === d.id).map((e) => e.targetPortId)
  );
  new Set(
    l.filter((e) => e.sourceId === d.id).map((e) => e.sourcePortId)
  ), d.ports.forEach((e) => {
    let y = e.side || "auto";
    if (y !== "auto") {
      f[y].push(e);
      return;
    }
    if (o === "strict-flow") {
      const a = h.has(e.id) || e.label.toLowerCase().includes("in");
      switch (c) {
        case "BT":
          y = a ? "bottom" : "top";
          break;
        case "TB":
          y = a ? "top" : "bottom";
          break;
        case "RL":
          y = a ? "right" : "left";
          break;
        case "LR":
        default:
          y = a ? "left" : "right";
          break;
      }
    } else
      y = qt(
        d.id,
        e.id,
        h.has(e.id),
        l,
        s == null ? void 0 : s.nodeLayouts,
        g
      );
    f[y].push(e);
  }), o === "perimeter-optimized" && (s != null && s.nodeLayouts) && Ut(f, d.id, l, s.nodeLayouts);
  const t = (e, y) => {
    const a = e.length;
    e.forEach((n, I) => {
      let b = 0, u = 0;
      y === "left" || y === "right" ? (u = g.height / (a + 1) * (I + 1), b = y === "left" ? 0 : g.width) : (b = g.width / (a + 1) * (I + 1), u = y === "top" ? 0 : g.height), r.set(n.id, {
        portId: n.id,
        side: y,
        localX: b,
        localY: u,
        worldX: g.x + b,
        worldY: g.y + u
      });
    });
  };
  return t(f.left, "left"), t(f.right, "right"), t(f.top, "top"), t(f.bottom, "bottom"), r;
}
function _t(d) {
  const g = {}, i = (C) => {
    var r;
    const s = d.nodes[C];
    return new Set(((r = s == null ? void 0 : s.ports) == null ? void 0 : r.map((c) => c.id)) || []);
  };
  for (const [C, s] of Object.entries(d.edges)) {
    const r = i(s.sourceId), c = i(s.targetId), A = r.has(s.sourcePortId), o = c.has(s.targetPortId);
    A && o && (g[C] = s);
  }
  return {
    ...d,
    edges: g
  };
}
class te {
  static decouple(g, i) {
    const C = /* @__PURE__ */ new Map();
    for (const l of i)
      C.set(l, /* @__PURE__ */ new Set());
    const s = Object.values(g.edges);
    for (const l of s)
      i.has(l.sourceId) && i.has(l.targetId) && C.get(l.sourceId).add(l.targetId);
    const r = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Set(), o = (l) => {
      r.add(l), c.add(l);
      const f = Array.from(C.get(l) || []);
      for (const h of f)
        r.has(h) ? c.has(h) && (C.get(l).delete(h), C.get(h).add(l), A.add(`${l}->${h}`)) : o(h);
      c.delete(l);
    };
    for (const l of i)
      r.has(l) || o(l);
    return {
      adjList: C,
      reversedEdges: A,
      allEntityIds: Array.from(i)
    };
  }
}
class ee {
  static assignLayers(g, i) {
    const C = /* @__PURE__ */ new Map();
    for (const o of g)
      C.set(o, 0);
    for (const [, o] of i.entries())
      for (const l of o)
        C.set(l, (C.get(l) || 0) + 1);
    const s = /* @__PURE__ */ new Map(), r = [];
    for (const o of g)
      (C.get(o) || 0) === 0 && (s.set(o, 0), r.push(o));
    const c = /* @__PURE__ */ new Set();
    for (; r.length > 0; ) {
      const o = r.shift();
      c.add(o);
      const l = s.get(o) || 0, f = i.get(o) || /* @__PURE__ */ new Set();
      for (const h of f) {
        const t = s.get(h) ?? 0;
        s.set(h, Math.max(t, l + 1)), C.set(h, (C.get(h) || 1) - 1), C.get(h) === 0 && r.push(h);
      }
    }
    for (const o of g)
      s.has(o) || s.set(o, 0);
    const A = /* @__PURE__ */ new Map();
    for (const [o, l] of s.entries())
      A.has(l) || A.set(l, []), A.get(l).push(o);
    return A;
  }
}
class Ct {
  static minimizeCrossings(g, i, C = 4) {
    const s = Array.from(g.keys()).sort((A, o) => A - o);
    if (s.length <= 1) return g;
    const r = /* @__PURE__ */ new Map();
    for (const [A, o] of i.entries())
      for (const l of o)
        r.has(l) || r.set(l, /* @__PURE__ */ new Set()), r.get(l).add(A);
    const c = /* @__PURE__ */ new Map();
    for (const [A, o] of g.entries())
      c.set(A, [...o]);
    for (let A = 0; A < C; A++) {
      for (let o = 1; o < s.length; o++) {
        const l = c.get(s[o - 1]), f = c.get(s[o]), h = /* @__PURE__ */ new Map();
        l.forEach((t, e) => h.set(t, e)), f.sort((t, e) => {
          const y = Ct.getBarycenter(t, r, h), a = Ct.getBarycenter(e, r, h);
          return y - a;
        });
      }
      for (let o = s.length - 2; o >= 0; o--) {
        const l = c.get(s[o + 1]), f = c.get(s[o]), h = /* @__PURE__ */ new Map();
        l.forEach((t, e) => h.set(t, e)), f.sort((t, e) => {
          const y = Ct.getBarycenter(t, i, h), a = Ct.getBarycenter(e, i, h);
          return y - a;
        });
      }
    }
    return c;
  }
  static getBarycenter(g, i, C) {
    const s = i.get(g);
    if (!s || s.size === 0) return 0;
    let r = 0, c = 0;
    for (const A of s)
      C.has(A) && (r += C.get(A), c++);
    return c === 0 ? 0 : r / c;
  }
}
const U = 32, yt = 24, Pt = 22, Gt = 18, mt = 38, ut = 210, pt = 36, ge = 180, oe = 54;
class q {
  static assignCoordinates(g, i, C, s = { direction: "TB", mode: "auto", aspectRatio: 1.55 }) {
    const r = s.direction ?? "TB", c = r === "TB" || r === "BT", A = r === "BT" || r === "RL", o = s.aspectRatio ?? 1.55, l = Object.keys(g.containers).length, f = s.mode && s.mode !== "auto" ? s.mode : l > 0 ? "concurrent" : "flow", h = {}, t = {}, e = (y) => {
      var I, b, u;
      const a = !!g.containers[y], n = !!((I = g.containers[y]) != null && I.collapsed);
      return a && n ? { width: ut, height: pt } : {
        width: ((b = C.get(y)) == null ? void 0 : b.width) || ge,
        height: ((u = C.get(y)) == null ? void 0 : u.height) || oe
      };
    };
    return f === "concurrent" ? q.layoutConcurrentHierarchy(
      g,
      e,
      o,
      h,
      t
    ) : q.layoutFlowTree(
      g,
      i,
      e,
      c,
      A,
      h,
      t
    ), q.assignDynamicPortSides(g, h, t, c), { nodes: h, containers: t };
  }
  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
  // ===========================================================================
  static layoutConcurrentHierarchy(g, i, C, s, r) {
    var y;
    const c = /* @__PURE__ */ new Map();
    for (const [a, n] of Object.entries(g.nodes)) {
      const I = n.parentId ?? null;
      c.has(I) || c.set(I, []), c.get(I).push(a);
    }
    for (const [a, n] of Object.entries(g.containers)) {
      const I = n.parentId ?? null;
      c.has(I) || c.set(I, []), c.get(I).push(a);
    }
    const A = q.getContainerDepths(g), o = Object.keys(g.containers).sort(
      (a, n) => (A.get(n) || 0) - (A.get(a) || 0)
    ), l = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
    for (const a of o) {
      if (!!((y = g.containers[a]) != null && y.collapsed)) {
        l.set(a, {
          width: ut,
          height: pt
        });
        continue;
      }
      const I = c.get(a) || [];
      if (I.length === 0) {
        l.set(a, {
          width: ut,
          height: mt + Gt * 2
        });
        continue;
      }
      const b = I.map((w) => {
        const L = l.has(w) ? l.get(w) : i(w);
        return { id: w, width: L.width, height: L.height };
      }), u = q.findBestTightPacking(b, C);
      for (const w of u.boxes)
        f.set(w.id, w);
      const m = Math.max(u.width + Pt * 2, ut), B = u.height + mt + Gt * 2;
      l.set(a, { width: m, height: B });
    }
    const h = c.get(null) || [];
    let t = [];
    if (h.length > 0) {
      const a = h.map((I) => {
        const b = l.get(I) || i(I);
        return { id: I, width: b.width, height: b.height };
      });
      t = q.findBestTightPacking(a, C).boxes.map((I) => ({
        ...I,
        localX: I.localX + 60,
        localY: I.localY + 60
      }));
    }
    const e = (a, n, I, b, u) => {
      var w;
      const m = !!g.containers[a], B = { id: a, x: n, y: I, width: b, height: u };
      if (m) {
        if (r[a] = B, (w = g.containers[a]) != null && w.collapsed) return;
        const L = n + Pt, K = I + mt + Gt, v = c.get(a) || [];
        for (const H of v) {
          const x = f.get(H);
          x && e(
            H,
            L + x.localX,
            K + x.localY,
            x.width,
            x.height
          );
        }
      } else
        s[a] = B;
    };
    for (const a of t)
      e(a.id, a.localX, a.localY, a.width, a.height);
  }
  /**
   * Evaluates multiple candidate bounding widths using 2D skyline bin packing
   * and picks the configuration that minimizes empty space while respecting targetAspect.
   */
  static findBestTightPacking(g, i) {
    if (g.length === 1)
      return {
        width: g[0].width,
        height: g[0].height,
        boxes: [{ id: g[0].id, localX: 0, localY: 0, width: g[0].width, height: g[0].height }],
        score: 0
      };
    const C = g.reduce((h, t) => h + t.width * t.height, 0), s = Math.max(...g.map((h) => h.width)), r = [...g].sort((h, t) => t.width - h.width), c = /* @__PURE__ */ new Set(), A = g.reduce((h, t) => h + t.width, 0) + (g.length - 1) * U;
    c.add(A), c.add(s);
    const o = Math.max(s, Math.sqrt(C * i));
    c.add(o), c.add(o * 0.85), c.add(o * 1.15);
    const l = Math.min(g.length, 6);
    for (let h = 2; h <= l; h++) {
      let t = 0;
      for (let e = 0; e < h && e < r.length; e++)
        t += r[e].width;
      t += (h - 1) * U, t >= s && c.add(t);
    }
    let f = null;
    for (const h of c) {
      const t = q.simulateSkylinePacking(g, h), e = t.width * t.height, y = Math.max(0, e - C), a = t.width / Math.max(1, t.height), n = Math.abs(Math.log(a / i)), I = y / C * 2 + n * 0.25;
      t.score = I, (!f || I < f.score) && (f = t);
    }
    return f;
  }
  /**
   * Bottom-Left Skyline 2D Bin Packing:
   * Sorts items descending by height (First-Fit Decreasing) and packs into the lowest
   * available height valley, preventing tall items from locking the vertical baseline.
   */
  static simulateSkylinePacking(g, i) {
    const C = [...g].sort((o, l) => l.height - o.height), s = [{ x: 0, width: i, y: 0 }], r = [];
    for (const o of C) {
      let l = 1 / 0, f = -1;
      for (let I = 0; I < s.length; I++) {
        if (s[I].x + o.width > i) continue;
        let u = 0, m = 0;
        for (let B = I; B < s.length && m < o.width; B++)
          u = Math.max(u, s[B].y), m += s[B].width;
        u < l && (l = u, f = I);
      }
      if (f === -1) {
        const I = Math.max(...s.map((u) => u.y)), b = I === 0 ? 0 : I + yt;
        r.push({
          id: o.id,
          localX: 0,
          localY: b,
          width: o.width,
          height: o.height
        }), s.length = 0, s.push({ x: 0, width: o.width + U, y: b + o.height }), i > o.width + U && s.push({
          x: o.width + U,
          width: i - (o.width + U),
          y: 0
        });
        continue;
      }
      const h = s[f].x, t = l === 0 ? 0 : l + yt;
      r.push({
        id: o.id,
        localX: h,
        localY: t,
        width: o.width,
        height: o.height
      });
      const e = o.width + U, y = t + o.height, a = { x: h, width: e, y }, n = [];
      for (const I of s)
        I.x + I.width <= h || I.x >= h + e ? n.push(I) : (I.x < h && n.push({ x: I.x, width: h - I.x, y: I.y }), I.x + I.width > h + e && n.push({
          x: h + e,
          width: I.x + I.width - (h + e),
          y: I.y
        }));
      n.push(a), n.sort((I, b) => I.x - b.x), s.length = 0, s.push(...n);
    }
    const c = Math.max(...r.map((o) => o.localX + o.width), 0), A = Math.max(...r.map((o) => o.localY + o.height), 0);
    return { width: c, height: A, boxes: r, score: 0 };
  }
  // ===========================================================================
  // FLOW TREE SYMMETRICAL CENTERING (DEMO 2)
  // ===========================================================================
  static layoutFlowTree(g, i, C, s, r, c, A) {
    const o = Array.from(i.keys()).sort((u, m) => u - m), l = /* @__PURE__ */ new Map();
    let f = 80;
    const h = s ? yt * 1.5 : U * 1.5, t = s ? U : yt, e = r ? [...o].reverse() : [...o];
    for (const u of e) {
      const m = i.get(u) || [];
      let B = 0;
      for (const w of m) {
        const L = C(w), K = s ? L.height : L.width;
        B = Math.max(B, K);
      }
      l.set(u, f), f += B + h;
    }
    const y = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
    for (const u of Object.values(g.edges))
      y.has(u.targetId) || y.set(u.targetId, []), y.get(u.targetId).push(u.sourceId), a.has(u.sourceId) || a.set(u.sourceId, []), a.get(u.sourceId).push(u.targetId);
    const n = /* @__PURE__ */ new Map();
    for (const u of o) {
      const m = i.get(u) || [];
      let B = -1 / 0;
      for (const w of m) {
        const L = C(w), K = s ? L.width : L.height, v = y.get(w) || [];
        let H = null;
        if (v.length > 0) {
          const W = v.map((G) => {
            const p = n.get(G);
            if (p === void 0) return null;
            const k = C(G);
            return p + (s ? k.width : k.height) / 2;
          }).filter((G) => G !== null);
          W.length > 0 && (H = W.reduce((G, p) => G + p, 0) / W.length);
        }
        let x = H !== null ? H - K / 2 : 80;
        x < B + t && (x = B === -1 / 0 ? 80 : B + t), n.set(w, x), B = x + K;
      }
    }
    for (let u = o.length - 1; u >= 0; u--) {
      const m = o[u], B = i.get(m) || [];
      for (const L of B) {
        const K = a.get(L) || [];
        if (K.length === 0) continue;
        const v = K.map((H) => {
          const x = n.get(H);
          if (x === void 0) return null;
          const W = C(H);
          return x + (s ? W.width : W.height) / 2;
        }).filter((H) => H !== null);
        if (v.length > 0) {
          const H = v.reduce((G, p) => G + p, 0) / v.length, x = C(L), W = s ? x.width : x.height;
          n.set(L, H - W / 2);
        }
      }
      let w = -1 / 0;
      for (const L of B) {
        const K = C(L), v = s ? K.width : K.height;
        let H = n.get(L) ?? 80;
        H < w + t && (H = w + t, n.set(L, H)), w = H + v;
      }
    }
    let I = 1 / 0;
    for (const u of n.values()) I = Math.min(I, u);
    const b = I < 80 ? 80 - I : 0;
    for (const u of o) {
      const m = i.get(u) || [], B = l.get(u) || 80;
      for (const w of m) {
        const L = C(w), K = (n.get(w) ?? 80) + b, x = { id: w, x: s ? K : B, y: s ? B : K, width: L.width, height: L.height };
        g.containers[w] ? A[w] = x : c[w] = x;
      }
    }
  }
  static assignDynamicPortSides(g, i, C, s) {
    var c, A;
    const r = (o) => i[o] || C[o];
    for (const o of Object.values(g.edges)) {
      const l = r(o.sourceId), f = r(o.targetId);
      if (!l || !f) continue;
      const h = g.nodes[o.sourceId] || g.containers[o.sourceId], t = g.nodes[o.targetId] || g.containers[o.targetId], e = f.x + f.width / 2 - (l.x + l.width / 2), y = f.y + f.height / 2 - (l.y + l.height / 2), a = Math.abs(e) > Math.abs(y) * 1.25, n = (c = h == null ? void 0 : h.ports) == null ? void 0 : c.find((b) => b.id === o.sourcePortId);
      n && (!n.side || n.side === "auto") && (a ? n.side = e >= 0 ? "right" : "left" : n.side = y >= 0 ? "bottom" : "top");
      const I = (A = t == null ? void 0 : t.ports) == null ? void 0 : A.find((b) => b.id === o.targetPortId);
      I && (!I.side || I.side === "auto") && (a ? I.side = e >= 0 ? "left" : "right" : I.side = y >= 0 ? "top" : "bottom");
    }
  }
  static getContainerDepths(g) {
    const i = /* @__PURE__ */ new Map(), C = (s) => {
      var A;
      if (i.has(s)) return i.get(s);
      const r = (A = g.containers[s]) == null ? void 0 : A.parentId;
      if (!r || !g.containers[r])
        return i.set(s, 0), 0;
      const c = 1 + C(r);
      return i.set(s, c), c;
    };
    for (const s of Object.keys(g.containers))
      C(s);
    return i;
  }
}
class se {
  async execute(g, i, C) {
    const s = Object.values(g.containers), r = Object.values(g.nodes), c = new Set(
      s.filter((t) => !!t.collapsed).map((t) => t.id)
    ), A = (t) => {
      var y;
      let e = t;
      for (; e; ) {
        if (c.has(e)) return !0;
        e = (y = g.containers[e]) == null ? void 0 : y.parentId;
      }
      return !1;
    }, o = /* @__PURE__ */ new Set();
    for (const [t, e] of Object.entries(g.nodes))
      A(e.parentId) || o.add(t);
    for (const [t, e] of Object.entries(g.containers)) {
      const y = e;
      y.collapsed ? A(y.parentId) || o.add(t) : !(r.some((n) => n.parentId === t) || s.some((n) => n.parentId === t)) && !A(y.parentId) && o.add(t);
    }
    const l = te.decouple(g, o), f = ee.assignLayers(l.allEntityIds, l.adjList), h = Ct.minimizeCrossings(f, l.adjList, 4);
    return q.assignCoordinates(g, h, i, C);
  }
}
const Yt = "Y2xhc3MgWCB7CiAgc3RhdGljIGRlY291cGxlKG4sIGgpIHsKICAgIGNvbnN0IGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBzIG9mIGgpCiAgICAgIGEuc2V0KHMsIC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkpOwogICAgY29uc3QgZSA9IE9iamVjdC52YWx1ZXMobi5lZGdlcyk7CiAgICBmb3IgKGNvbnN0IHMgb2YgZSkKICAgICAgaC5oYXMocy5zb3VyY2VJZCkgJiYgaC5oYXMocy50YXJnZXRJZCkgJiYgYS5nZXQocy5zb3VyY2VJZCkuYWRkKHMudGFyZ2V0SWQpOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBnID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgdCA9IChzKSA9PiB7CiAgICAgIGQuYWRkKHMpLCByLmFkZChzKTsKICAgICAgY29uc3QgcCA9IEFycmF5LmZyb20oYS5nZXQocykgfHwgW10pOwogICAgICBmb3IgKGNvbnN0IGMgb2YgcCkKICAgICAgICBkLmhhcyhjKSA/IHIuaGFzKGMpICYmIChhLmdldChzKS5kZWxldGUoYyksIGEuZ2V0KGMpLmFkZChzKSwgZy5hZGQoYCR7c30tPiR7Y31gKSkgOiB0KGMpOwogICAgICByLmRlbGV0ZShzKTsKICAgIH07CiAgICBmb3IgKGNvbnN0IHMgb2YgaCkKICAgICAgZC5oYXMocykgfHwgdChzKTsKICAgIHJldHVybiB7CiAgICAgIGFkakxpc3Q6IGEsCiAgICAgIHJldmVyc2VkRWRnZXM6IGcsCiAgICAgIGFsbEVudGl0eUlkczogQXJyYXkuZnJvbShoKQogICAgfTsKICB9Cn0KY2xhc3MgRyB7CiAgc3RhdGljIGFzc2lnbkxheWVycyhuLCBoKSB7CiAgICBjb25zdCBhID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgdCBvZiBuKQogICAgICBhLnNldCh0LCAwKTsKICAgIGZvciAoY29uc3QgWywgdF0gb2YgaC5lbnRyaWVzKCkpCiAgICAgIGZvciAoY29uc3QgcyBvZiB0KQogICAgICAgIGEuc2V0KHMsIChhLmdldChzKSB8fCAwKSArIDEpOwogICAgY29uc3QgZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGQgPSBbXTsKICAgIGZvciAoY29uc3QgdCBvZiBuKQogICAgICAoYS5nZXQodCkgfHwgMCkgPT09IDAgJiYgKGUuc2V0KHQsIDApLCBkLnB1c2godCkpOwogICAgY29uc3QgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKDsgZC5sZW5ndGggPiAwOyApIHsKICAgICAgY29uc3QgdCA9IGQuc2hpZnQoKTsKICAgICAgci5hZGQodCk7CiAgICAgIGNvbnN0IHMgPSBlLmdldCh0KSB8fCAwLCBwID0gaC5nZXQodCkgfHwgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgICAgZm9yIChjb25zdCBjIG9mIHApIHsKICAgICAgICBjb25zdCBpID0gZS5nZXQoYykgPz8gMDsKICAgICAgICBlLnNldChjLCBNYXRoLm1heChpLCBzICsgMSkpLCBhLnNldChjLCAoYS5nZXQoYykgfHwgMSkgLSAxKSwgYS5nZXQoYykgPT09IDAgJiYgZC5wdXNoKGMpOwogICAgICB9CiAgICB9CiAgICBmb3IgKGNvbnN0IHQgb2YgbikKICAgICAgZS5oYXModCkgfHwgZS5zZXQodCwgMCk7CiAgICBjb25zdCBnID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgW3QsIHNdIG9mIGUuZW50cmllcygpKQogICAgICBnLmhhcyhzKSB8fCBnLnNldChzLCBbXSksIGcuZ2V0KHMpLnB1c2godCk7CiAgICByZXR1cm4gZzsKICB9Cn0KY2xhc3MgQSB7CiAgc3RhdGljIG1pbmltaXplQ3Jvc3NpbmdzKG4sIGgsIGEgPSA0KSB7CiAgICBjb25zdCBlID0gQXJyYXkuZnJvbShuLmtleXMoKSkuc29ydCgoZywgdCkgPT4gZyAtIHQpOwogICAgaWYgKGUubGVuZ3RoIDw9IDEpIHJldHVybiBuOwogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtnLCB0XSBvZiBoLmVudHJpZXMoKSkKICAgICAgZm9yIChjb25zdCBzIG9mIHQpCiAgICAgICAgZC5oYXMocykgfHwgZC5zZXQocywgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSksIGQuZ2V0KHMpLmFkZChnKTsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbZywgdF0gb2Ygbi5lbnRyaWVzKCkpCiAgICAgIHIuc2V0KGcsIFsuLi50XSk7CiAgICBmb3IgKGxldCBnID0gMDsgZyA8IGE7IGcrKykgewogICAgICBmb3IgKGxldCB0ID0gMTsgdCA8IGUubGVuZ3RoOyB0KyspIHsKICAgICAgICBjb25zdCBzID0gci5nZXQoZVt0IC0gMV0pLCBwID0gci5nZXQoZVt0XSksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHMuZm9yRWFjaCgoaSwgZikgPT4gYy5zZXQoaSwgZikpLCBwLnNvcnQoKGksIGYpID0+IHsKICAgICAgICAgIGNvbnN0IHkgPSBBLmdldEJhcnljZW50ZXIoaSwgZCwgYyksIGwgPSBBLmdldEJhcnljZW50ZXIoZiwgZCwgYyk7CiAgICAgICAgICByZXR1cm4geSAtIGw7CiAgICAgICAgfSk7CiAgICAgIH0KICAgICAgZm9yIChsZXQgdCA9IGUubGVuZ3RoIC0gMjsgdCA+PSAwOyB0LS0pIHsKICAgICAgICBjb25zdCBzID0gci5nZXQoZVt0ICsgMV0pLCBwID0gci5nZXQoZVt0XSksIGMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICAgIHMuZm9yRWFjaCgoaSwgZikgPT4gYy5zZXQoaSwgZikpLCBwLnNvcnQoKGksIGYpID0+IHsKICAgICAgICAgIGNvbnN0IHkgPSBBLmdldEJhcnljZW50ZXIoaSwgaCwgYyksIGwgPSBBLmdldEJhcnljZW50ZXIoZiwgaCwgYyk7CiAgICAgICAgICByZXR1cm4geSAtIGw7CiAgICAgICAgfSk7CiAgICAgIH0KICAgIH0KICAgIHJldHVybiByOwogIH0KICBzdGF0aWMgZ2V0QmFyeWNlbnRlcihuLCBoLCBhKSB7CiAgICBjb25zdCBlID0gaC5nZXQobik7CiAgICBpZiAoIWUgfHwgZS5zaXplID09PSAwKSByZXR1cm4gMDsKICAgIGxldCBkID0gMCwgciA9IDA7CiAgICBmb3IgKGNvbnN0IGcgb2YgZSkKICAgICAgYS5oYXMoZykgJiYgKGQgKz0gYS5nZXQoZyksIHIrKyk7CiAgICByZXR1cm4gciA9PT0gMCA/IDAgOiBkIC8gcjsKICB9Cn0KY29uc3QgVCA9IDMyLCBFID0gMjQsIFIgPSAyMiwgSCA9IDE4LCBqID0gMzgsIGsgPSAyMTAsIFcgPSAzNiwgRiA9IDE4MCwgXyA9IDU0OwpjbGFzcyBEIHsKICBzdGF0aWMgYXNzaWduQ29vcmRpbmF0ZXMobiwgaCwgYSwgZSA9IHsgZGlyZWN0aW9uOiAiVEIiLCBtb2RlOiAiYXV0byIsIGFzcGVjdFJhdGlvOiAxLjU1IH0pIHsKICAgIGNvbnN0IGQgPSBlLmRpcmVjdGlvbiA/PyAiVEIiLCByID0gZCA9PT0gIlRCIiB8fCBkID09PSAiQlQiLCBnID0gZCA9PT0gIkJUIiB8fCBkID09PSAiUkwiLCB0ID0gZS5hc3BlY3RSYXRpbyA/PyAxLjU1LCBzID0gT2JqZWN0LmtleXMobi5jb250YWluZXJzKS5sZW5ndGgsIHAgPSBlLm1vZGUgJiYgZS5tb2RlICE9PSAiYXV0byIgPyBlLm1vZGUgOiBzID4gMCA/ICJjb25jdXJyZW50IiA6ICJmbG93IiwgYyA9IHt9LCBpID0ge30sIGYgPSAoeSkgPT4gewogICAgICB2YXIgbywgSSwgdzsKICAgICAgY29uc3QgbCA9ICEhbi5jb250YWluZXJzW3ldLCB1ID0gISEoKG8gPSBuLmNvbnRhaW5lcnNbeV0pICE9IG51bGwgJiYgby5jb2xsYXBzZWQpOwogICAgICByZXR1cm4gbCAmJiB1ID8geyB3aWR0aDogaywgaGVpZ2h0OiBXIH0gOiB7CiAgICAgICAgd2lkdGg6ICgoSSA9IGEuZ2V0KHkpKSA9PSBudWxsID8gdm9pZCAwIDogSS53aWR0aCkgfHwgRiwKICAgICAgICBoZWlnaHQ6ICgodyA9IGEuZ2V0KHkpKSA9PSBudWxsID8gdm9pZCAwIDogdy5oZWlnaHQpIHx8IF8KICAgICAgfTsKICAgIH07CiAgICByZXR1cm4gcCA9PT0gImNvbmN1cnJlbnQiID8gRC5sYXlvdXRDb25jdXJyZW50SGllcmFyY2h5KAogICAgICBuLAogICAgICBmLAogICAgICB0LAogICAgICBjLAogICAgICBpCiAgICApIDogRC5sYXlvdXRGbG93VHJlZSgKICAgICAgbiwKICAgICAgaCwKICAgICAgZiwKICAgICAgciwKICAgICAgZywKICAgICAgYywKICAgICAgaQogICAgKSwgRC5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIGMsIGksIHIpLCB7IG5vZGVzOiBjLCBjb250YWluZXJzOiBpIH07CiAgfQogIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogIC8vIENPTkNVUlJFTlQgQ09NUE9VTkQgUEFDS0lORyBXSVRIIFNLWUxJTkUgMkQgQklOIFBBQ0tJTkcKICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICBzdGF0aWMgbGF5b3V0Q29uY3VycmVudEhpZXJhcmNoeShuLCBoLCBhLCBlLCBkKSB7CiAgICB2YXIgeTsKICAgIGNvbnN0IHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbbCwgdV0gb2YgT2JqZWN0LmVudHJpZXMobi5ub2RlcykpIHsKICAgICAgY29uc3QgbyA9IHUucGFyZW50SWQgPz8gbnVsbDsKICAgICAgci5oYXMobykgfHwgci5zZXQobywgW10pLCByLmdldChvKS5wdXNoKGwpOwogICAgfQogICAgZm9yIChjb25zdCBbbCwgdV0gb2YgT2JqZWN0LmVudHJpZXMobi5jb250YWluZXJzKSkgewogICAgICBjb25zdCBvID0gdS5wYXJlbnRJZCA/PyBudWxsOwogICAgICByLmhhcyhvKSB8fCByLnNldChvLCBbXSksIHIuZ2V0KG8pLnB1c2gobCk7CiAgICB9CiAgICBjb25zdCBnID0gRC5nZXRDb250YWluZXJEZXB0aHMobiksIHQgPSBPYmplY3Qua2V5cyhuLmNvbnRhaW5lcnMpLnNvcnQoCiAgICAgIChsLCB1KSA9PiAoZy5nZXQodSkgfHwgMCkgLSAoZy5nZXQobCkgfHwgMCkKICAgICksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgbCBvZiB0KSB7CiAgICAgIGlmICghISgoeSA9IG4uY29udGFpbmVyc1tsXSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCkpIHsKICAgICAgICBzLnNldChsLCB7CiAgICAgICAgICB3aWR0aDogaywKICAgICAgICAgIGhlaWdodDogVwogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IG8gPSByLmdldChsKSB8fCBbXTsKICAgICAgaWYgKG8ubGVuZ3RoID09PSAwKSB7CiAgICAgICAgcy5zZXQobCwgewogICAgICAgICAgd2lkdGg6IGssCiAgICAgICAgICBoZWlnaHQ6IGogKyBIICogMgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IEkgPSBvLm1hcCgobSkgPT4gewogICAgICAgIGNvbnN0IE0gPSBzLmhhcyhtKSA/IHMuZ2V0KG0pIDogaChtKTsKICAgICAgICByZXR1cm4geyBpZDogbSwgd2lkdGg6IE0ud2lkdGgsIGhlaWdodDogTS5oZWlnaHQgfTsKICAgICAgfSksIHcgPSBELmZpbmRCZXN0VGlnaHRQYWNraW5nKEksIGEpOwogICAgICBmb3IgKGNvbnN0IG0gb2Ygdy5ib3hlcykKICAgICAgICBwLnNldChtLmlkLCBtKTsKICAgICAgY29uc3QgQyA9IE1hdGgubWF4KHcud2lkdGggKyBSICogMiwgayksIHggPSB3LmhlaWdodCArIGogKyBIICogMjsKICAgICAgcy5zZXQobCwgeyB3aWR0aDogQywgaGVpZ2h0OiB4IH0pOwogICAgfQogICAgY29uc3QgYyA9IHIuZ2V0KG51bGwpIHx8IFtdOwogICAgbGV0IGkgPSBbXTsKICAgIGlmIChjLmxlbmd0aCA+IDApIHsKICAgICAgY29uc3QgbCA9IGMubWFwKChvKSA9PiB7CiAgICAgICAgY29uc3QgSSA9IHMuZ2V0KG8pIHx8IGgobyk7CiAgICAgICAgcmV0dXJuIHsgaWQ6IG8sIHdpZHRoOiBJLndpZHRoLCBoZWlnaHQ6IEkuaGVpZ2h0IH07CiAgICAgIH0pOwogICAgICBpID0gRC5maW5kQmVzdFRpZ2h0UGFja2luZyhsLCBhKS5ib3hlcy5tYXAoKG8pID0+ICh7CiAgICAgICAgLi4ubywKICAgICAgICBsb2NhbFg6IG8ubG9jYWxYICsgNjAsCiAgICAgICAgbG9jYWxZOiBvLmxvY2FsWSArIDYwCiAgICAgIH0pKTsKICAgIH0KICAgIGNvbnN0IGYgPSAobCwgdSwgbywgSSwgdykgPT4gewogICAgICB2YXIgbTsKICAgICAgY29uc3QgQyA9ICEhbi5jb250YWluZXJzW2xdLCB4ID0geyBpZDogbCwgeDogdSwgeTogbywgd2lkdGg6IEksIGhlaWdodDogdyB9OwogICAgICBpZiAoQykgewogICAgICAgIGlmIChkW2xdID0geCwgKG0gPSBuLmNvbnRhaW5lcnNbbF0pICE9IG51bGwgJiYgbS5jb2xsYXBzZWQpIHJldHVybjsKICAgICAgICBjb25zdCBNID0gdSArIFIsIFAgPSBvICsgaiArIEgsIFMgPSByLmdldChsKSB8fCBbXTsKICAgICAgICBmb3IgKGNvbnN0IGIgb2YgUykgewogICAgICAgICAgY29uc3QgTyA9IHAuZ2V0KGIpOwogICAgICAgICAgTyAmJiBmKAogICAgICAgICAgICBiLAogICAgICAgICAgICBNICsgTy5sb2NhbFgsCiAgICAgICAgICAgIFAgKyBPLmxvY2FsWSwKICAgICAgICAgICAgTy53aWR0aCwKICAgICAgICAgICAgTy5oZWlnaHQKICAgICAgICAgICk7CiAgICAgICAgfQogICAgICB9IGVsc2UKICAgICAgICBlW2xdID0geDsKICAgIH07CiAgICBmb3IgKGNvbnN0IGwgb2YgaSkKICAgICAgZihsLmlkLCBsLmxvY2FsWCwgbC5sb2NhbFksIGwud2lkdGgsIGwuaGVpZ2h0KTsKICB9CiAgLyoqCiAgICogRXZhbHVhdGVzIG11bHRpcGxlIGNhbmRpZGF0ZSBib3VuZGluZyB3aWR0aHMgdXNpbmcgMkQgc2t5bGluZSBiaW4gcGFja2luZwogICAqIGFuZCBwaWNrcyB0aGUgY29uZmlndXJhdGlvbiB0aGF0IG1pbmltaXplcyBlbXB0eSBzcGFjZSB3aGlsZSByZXNwZWN0aW5nIHRhcmdldEFzcGVjdC4KICAgKi8KICBzdGF0aWMgZmluZEJlc3RUaWdodFBhY2tpbmcobiwgaCkgewogICAgaWYgKG4ubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBuWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogblswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBuWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IG5bMF0ud2lkdGgsIGhlaWdodDogblswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IGEgPSBuLnJlZHVjZSgoYywgaSkgPT4gYyArIGkud2lkdGggKiBpLmhlaWdodCwgMCksIGUgPSBNYXRoLm1heCguLi5uLm1hcCgoYykgPT4gYy53aWR0aCkpLCBkID0gWy4uLm5dLnNvcnQoKGMsIGkpID0+IGkud2lkdGggLSBjLndpZHRoKSwgciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGcgPSBuLnJlZHVjZSgoYywgaSkgPT4gYyArIGkud2lkdGgsIDApICsgKG4ubGVuZ3RoIC0gMSkgKiBUOwogICAgci5hZGQoZyksIHIuYWRkKGUpOwogICAgY29uc3QgdCA9IE1hdGgubWF4KGUsIE1hdGguc3FydChhICogaCkpOwogICAgci5hZGQodCksIHIuYWRkKHQgKiAwLjg1KSwgci5hZGQodCAqIDEuMTUpOwogICAgY29uc3QgcyA9IE1hdGgubWluKG4ubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IGMgPSAyOyBjIDw9IHM7IGMrKykgewogICAgICBsZXQgaSA9IDA7CiAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgYyAmJiBmIDwgZC5sZW5ndGg7IGYrKykKICAgICAgICBpICs9IGRbZl0ud2lkdGg7CiAgICAgIGkgKz0gKGMgLSAxKSAqIFQsIGkgPj0gZSAmJiByLmFkZChpKTsKICAgIH0KICAgIGxldCBwID0gbnVsbDsKICAgIGZvciAoY29uc3QgYyBvZiByKSB7CiAgICAgIGNvbnN0IGkgPSBELnNpbXVsYXRlU2t5bGluZVBhY2tpbmcobiwgYyksIGYgPSBpLndpZHRoICogaS5oZWlnaHQsIHkgPSBNYXRoLm1heCgwLCBmIC0gYSksIGwgPSBpLndpZHRoIC8gTWF0aC5tYXgoMSwgaS5oZWlnaHQpLCB1ID0gTWF0aC5hYnMoTWF0aC5sb2cobCAvIGgpKSwgbyA9IHkgLyBhICogMiArIHUgKiAwLjI1OwogICAgICBpLnNjb3JlID0gbywgKCFwIHx8IG8gPCBwLnNjb3JlKSAmJiAocCA9IGkpOwogICAgfQogICAgcmV0dXJuIHA7CiAgfQogIC8qKgogICAqIEJvdHRvbS1MZWZ0IFNreWxpbmUgMkQgQmluIFBhY2tpbmc6CiAgICogU29ydHMgaXRlbXMgZGVzY2VuZGluZyBieSBoZWlnaHQgKEZpcnN0LUZpdCBEZWNyZWFzaW5nKSBhbmQgcGFja3MgaW50byB0aGUgbG93ZXN0CiAgICogYXZhaWxhYmxlIGhlaWdodCB2YWxsZXksIHByZXZlbnRpbmcgdGFsbCBpdGVtcyBmcm9tIGxvY2tpbmcgdGhlIHZlcnRpY2FsIGJhc2VsaW5lLgogICAqLwogIHN0YXRpYyBzaW11bGF0ZVNreWxpbmVQYWNraW5nKG4sIGgpIHsKICAgIGNvbnN0IGEgPSBbLi4ubl0uc29ydCgodCwgcykgPT4gcy5oZWlnaHQgLSB0LmhlaWdodCksIGUgPSBbeyB4OiAwLCB3aWR0aDogaCwgeTogMCB9XSwgZCA9IFtdOwogICAgZm9yIChjb25zdCB0IG9mIGEpIHsKICAgICAgbGV0IHMgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCBvID0gMDsgbyA8IGUubGVuZ3RoOyBvKyspIHsKICAgICAgICBpZiAoZVtvXS54ICsgdC53aWR0aCA+IGgpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgQyA9IDA7CiAgICAgICAgZm9yIChsZXQgeCA9IG87IHggPCBlLmxlbmd0aCAmJiBDIDwgdC53aWR0aDsgeCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIGVbeF0ueSksIEMgKz0gZVt4XS53aWR0aDsKICAgICAgICB3IDwgcyAmJiAocyA9IHcsIHAgPSBvKTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCBvID0gTWF0aC5tYXgoLi4uZS5tYXAoKHcpID0+IHcueSkpLCBJID0gbyA9PT0gMCA/IDAgOiBvICsgRTsKICAgICAgICBkLnB1c2goewogICAgICAgICAgaWQ6IHQuaWQsCiAgICAgICAgICBsb2NhbFg6IDAsCiAgICAgICAgICBsb2NhbFk6IEksCiAgICAgICAgICB3aWR0aDogdC53aWR0aCwKICAgICAgICAgIGhlaWdodDogdC5oZWlnaHQKICAgICAgICB9KSwgZS5sZW5ndGggPSAwLCBlLnB1c2goeyB4OiAwLCB3aWR0aDogdC53aWR0aCArIFQsIHk6IEkgKyB0LmhlaWdodCB9KSwgaCA+IHQud2lkdGggKyBUICYmIGUucHVzaCh7CiAgICAgICAgICB4OiB0LndpZHRoICsgVCwKICAgICAgICAgIHdpZHRoOiBoIC0gKHQud2lkdGggKyBUKSwKICAgICAgICAgIHk6IDAKICAgICAgICB9KTsKICAgICAgICBjb250aW51ZTsKICAgICAgfQogICAgICBjb25zdCBjID0gZVtwXS54LCBpID0gcyA9PT0gMCA/IDAgOiBzICsgRTsKICAgICAgZC5wdXNoKHsKICAgICAgICBpZDogdC5pZCwKICAgICAgICBsb2NhbFg6IGMsCiAgICAgICAgbG9jYWxZOiBpLAogICAgICAgIHdpZHRoOiB0LndpZHRoLAogICAgICAgIGhlaWdodDogdC5oZWlnaHQKICAgICAgfSk7CiAgICAgIGNvbnN0IGYgPSB0LndpZHRoICsgVCwgeSA9IGkgKyB0LmhlaWdodCwgbCA9IHsgeDogYywgd2lkdGg6IGYsIHkgfSwgdSA9IFtdOwogICAgICBmb3IgKGNvbnN0IG8gb2YgZSkKICAgICAgICBvLnggKyBvLndpZHRoIDw9IGMgfHwgby54ID49IGMgKyBmID8gdS5wdXNoKG8pIDogKG8ueCA8IGMgJiYgdS5wdXNoKHsgeDogby54LCB3aWR0aDogYyAtIG8ueCwgeTogby55IH0pLCBvLnggKyBvLndpZHRoID4gYyArIGYgJiYgdS5wdXNoKHsKICAgICAgICAgIHg6IGMgKyBmLAogICAgICAgICAgd2lkdGg6IG8ueCArIG8ud2lkdGggLSAoYyArIGYpLAogICAgICAgICAgeTogby55CiAgICAgICAgfSkpOwogICAgICB1LnB1c2gobCksIHUuc29ydCgobywgSSkgPT4gby54IC0gSS54KSwgZS5sZW5ndGggPSAwLCBlLnB1c2goLi4udSk7CiAgICB9CiAgICBjb25zdCByID0gTWF0aC5tYXgoLi4uZC5tYXAoKHQpID0+IHQubG9jYWxYICsgdC53aWR0aCksIDApLCBnID0gTWF0aC5tYXgoLi4uZC5tYXAoKHQpID0+IHQubG9jYWxZICsgdC5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiByLCBoZWlnaHQ6IGcsIGJveGVzOiBkLCBzY29yZTogMCB9OwogIH0KICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAvLyBGTE9XIFRSRUUgU1lNTUVUUklDQUwgQ0VOVEVSSU5HIChERU1PIDIpCiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgc3RhdGljIGxheW91dEZsb3dUcmVlKG4sIGgsIGEsIGUsIGQsIHIsIGcpIHsKICAgIGNvbnN0IHQgPSBBcnJheS5mcm9tKGgua2V5cygpKS5zb3J0KCh3LCBDKSA9PiB3IC0gQyksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgbGV0IHAgPSA4MDsKICAgIGNvbnN0IGMgPSBlID8gRSAqIDEuNSA6IFQgKiAxLjUsIGkgPSBlID8gVCA6IEUsIGYgPSBkID8gWy4uLnRdLnJldmVyc2UoKSA6IFsuLi50XTsKICAgIGZvciAoY29uc3QgdyBvZiBmKSB7CiAgICAgIGNvbnN0IEMgPSBoLmdldCh3KSB8fCBbXTsKICAgICAgbGV0IHggPSAwOwogICAgICBmb3IgKGNvbnN0IG0gb2YgQykgewogICAgICAgIGNvbnN0IE0gPSBhKG0pLCBQID0gZSA/IE0uaGVpZ2h0IDogTS53aWR0aDsKICAgICAgICB4ID0gTWF0aC5tYXgoeCwgUCk7CiAgICAgIH0KICAgICAgcy5zZXQodywgcCksIHAgKz0geCArIGM7CiAgICB9CiAgICBjb25zdCB5ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IHcgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkKICAgICAgeS5oYXMody50YXJnZXRJZCkgfHwgeS5zZXQody50YXJnZXRJZCwgW10pLCB5LmdldCh3LnRhcmdldElkKS5wdXNoKHcuc291cmNlSWQpLCBsLmhhcyh3LnNvdXJjZUlkKSB8fCBsLnNldCh3LnNvdXJjZUlkLCBbXSksIGwuZ2V0KHcuc291cmNlSWQpLnB1c2gody50YXJnZXRJZCk7CiAgICBjb25zdCB1ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIGZvciAoY29uc3QgdyBvZiB0KSB7CiAgICAgIGNvbnN0IEMgPSBoLmdldCh3KSB8fCBbXTsKICAgICAgbGV0IHggPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgbSBvZiBDKSB7CiAgICAgICAgY29uc3QgTSA9IGEobSksIFAgPSBlID8gTS53aWR0aCA6IE0uaGVpZ2h0LCBTID0geS5nZXQobSkgfHwgW107CiAgICAgICAgbGV0IGIgPSBudWxsOwogICAgICAgIGlmIChTLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEIgPSBTLm1hcCgoTCkgPT4gewogICAgICAgICAgICBjb25zdCBOID0gdS5nZXQoTCk7CiAgICAgICAgICAgIGlmIChOID09PSB2b2lkIDApIHJldHVybiBudWxsOwogICAgICAgICAgICBjb25zdCBZID0gYShMKTsKICAgICAgICAgICAgcmV0dXJuIE4gKyAoZSA/IFkud2lkdGggOiBZLmhlaWdodCkgLyAyOwogICAgICAgICAgfSkuZmlsdGVyKChMKSA9PiBMICE9PSBudWxsKTsKICAgICAgICAgIEIubGVuZ3RoID4gMCAmJiAoYiA9IEIucmVkdWNlKChMLCBOKSA9PiBMICsgTiwgMCkgLyBCLmxlbmd0aCk7CiAgICAgICAgfQogICAgICAgIGxldCBPID0gYiAhPT0gbnVsbCA/IGIgLSBQIC8gMiA6IDgwOwogICAgICAgIE8gPCB4ICsgaSAmJiAoTyA9IHggPT09IC0xIC8gMCA/IDgwIDogeCArIGkpLCB1LnNldChtLCBPKSwgeCA9IE8gKyBQOwogICAgICB9CiAgICB9CiAgICBmb3IgKGxldCB3ID0gdC5sZW5ndGggLSAxOyB3ID49IDA7IHctLSkgewogICAgICBjb25zdCBDID0gdFt3XSwgeCA9IGguZ2V0KEMpIHx8IFtdOwogICAgICBmb3IgKGNvbnN0IE0gb2YgeCkgewogICAgICAgIGNvbnN0IFAgPSBsLmdldChNKSB8fCBbXTsKICAgICAgICBpZiAoUC5sZW5ndGggPT09IDApIGNvbnRpbnVlOwogICAgICAgIGNvbnN0IFMgPSBQLm1hcCgoYikgPT4gewogICAgICAgICAgY29uc3QgTyA9IHUuZ2V0KGIpOwogICAgICAgICAgaWYgKE8gPT09IHZvaWQgMCkgcmV0dXJuIG51bGw7CiAgICAgICAgICBjb25zdCBCID0gYShiKTsKICAgICAgICAgIHJldHVybiBPICsgKGUgPyBCLndpZHRoIDogQi5oZWlnaHQpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKGIpID0+IGIgIT09IG51bGwpOwogICAgICAgIGlmIChTLmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IGIgPSBTLnJlZHVjZSgoTCwgTikgPT4gTCArIE4sIDApIC8gUy5sZW5ndGgsIE8gPSBhKE0pLCBCID0gZSA/IE8ud2lkdGggOiBPLmhlaWdodDsKICAgICAgICAgIHUuc2V0KE0sIGIgLSBCIC8gMik7CiAgICAgICAgfQogICAgICB9CiAgICAgIGxldCBtID0gLTEgLyAwOwogICAgICBmb3IgKGNvbnN0IE0gb2YgeCkgewogICAgICAgIGNvbnN0IFAgPSBhKE0pLCBTID0gZSA/IFAud2lkdGggOiBQLmhlaWdodDsKICAgICAgICBsZXQgYiA9IHUuZ2V0KE0pID8/IDgwOwogICAgICAgIGIgPCBtICsgaSAmJiAoYiA9IG0gKyBpLCB1LnNldChNLCBiKSksIG0gPSBiICsgUzsKICAgICAgfQogICAgfQogICAgbGV0IG8gPSAxIC8gMDsKICAgIGZvciAoY29uc3QgdyBvZiB1LnZhbHVlcygpKSBvID0gTWF0aC5taW4obywgdyk7CiAgICBjb25zdCBJID0gbyA8IDgwID8gODAgLSBvIDogMDsKICAgIGZvciAoY29uc3QgdyBvZiB0KSB7CiAgICAgIGNvbnN0IEMgPSBoLmdldCh3KSB8fCBbXSwgeCA9IHMuZ2V0KHcpIHx8IDgwOwogICAgICBmb3IgKGNvbnN0IG0gb2YgQykgewogICAgICAgIGNvbnN0IE0gPSBhKG0pLCBQID0gKHUuZ2V0KG0pID8/IDgwKSArIEksIE8gPSB7IGlkOiBtLCB4OiBlID8gUCA6IHgsIHk6IGUgPyB4IDogUCwgd2lkdGg6IE0ud2lkdGgsIGhlaWdodDogTS5oZWlnaHQgfTsKICAgICAgICBuLmNvbnRhaW5lcnNbbV0gPyBnW21dID0gTyA6IHJbbV0gPSBPOwogICAgICB9CiAgICB9CiAgfQogIHN0YXRpYyBhc3NpZ25EeW5hbWljUG9ydFNpZGVzKG4sIGgsIGEsIGUpIHsKICAgIHZhciByLCBnOwogICAgY29uc3QgZCA9ICh0KSA9PiBoW3RdIHx8IGFbdF07CiAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LnZhbHVlcyhuLmVkZ2VzKSkgewogICAgICBjb25zdCBzID0gZCh0LnNvdXJjZUlkKSwgcCA9IGQodC50YXJnZXRJZCk7CiAgICAgIGlmICghcyB8fCAhcCkgY29udGludWU7CiAgICAgIGNvbnN0IGMgPSBuLm5vZGVzW3Quc291cmNlSWRdIHx8IG4uY29udGFpbmVyc1t0LnNvdXJjZUlkXSwgaSA9IG4ubm9kZXNbdC50YXJnZXRJZF0gfHwgbi5jb250YWluZXJzW3QudGFyZ2V0SWRdLCBmID0gcC54ICsgcC53aWR0aCAvIDIgLSAocy54ICsgcy53aWR0aCAvIDIpLCB5ID0gcC55ICsgcC5oZWlnaHQgLyAyIC0gKHMueSArIHMuaGVpZ2h0IC8gMiksIGwgPSBNYXRoLmFicyhmKSA+IE1hdGguYWJzKHkpICogMS4yNSwgdSA9IChyID0gYyA9PSBudWxsID8gdm9pZCAwIDogYy5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IHIuZmluZCgoSSkgPT4gSS5pZCA9PT0gdC5zb3VyY2VQb3J0SWQpOwogICAgICB1ICYmICghdS5zaWRlIHx8IHUuc2lkZSA9PT0gImF1dG8iKSAmJiAobCA/IHUuc2lkZSA9IGYgPj0gMCA/ICJyaWdodCIgOiAibGVmdCIgOiB1LnNpZGUgPSB5ID49IDAgPyAiYm90dG9tIiA6ICJ0b3AiKTsKICAgICAgY29uc3QgbyA9IChnID0gaSA9PSBudWxsID8gdm9pZCAwIDogaS5wb3J0cykgPT0gbnVsbCA/IHZvaWQgMCA6IGcuZmluZCgoSSkgPT4gSS5pZCA9PT0gdC50YXJnZXRQb3J0SWQpOwogICAgICBvICYmICghby5zaWRlIHx8IG8uc2lkZSA9PT0gImF1dG8iKSAmJiAobCA/IG8uc2lkZSA9IGYgPj0gMCA/ICJsZWZ0IiA6ICJyaWdodCIgOiBvLnNpZGUgPSB5ID49IDAgPyAidG9wIiA6ICJib3R0b20iKTsKICAgIH0KICB9CiAgc3RhdGljIGdldENvbnRhaW5lckRlcHRocyhuKSB7CiAgICBjb25zdCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgYSA9IChlKSA9PiB7CiAgICAgIHZhciBnOwogICAgICBpZiAoaC5oYXMoZSkpIHJldHVybiBoLmdldChlKTsKICAgICAgY29uc3QgZCA9IChnID0gbi5jb250YWluZXJzW2VdKSA9PSBudWxsID8gdm9pZCAwIDogZy5wYXJlbnRJZDsKICAgICAgaWYgKCFkIHx8ICFuLmNvbnRhaW5lcnNbZF0pCiAgICAgICAgcmV0dXJuIGguc2V0KGUsIDApLCAwOwogICAgICBjb25zdCByID0gMSArIGEoZCk7CiAgICAgIHJldHVybiBoLnNldChlLCByKSwgcjsKICAgIH07CiAgICBmb3IgKGNvbnN0IGUgb2YgT2JqZWN0LmtleXMobi5jb250YWluZXJzKSkKICAgICAgYShlKTsKICAgIHJldHVybiBoOwogIH0KfQpjbGFzcyBVIHsKICBhc3luYyBleGVjdXRlKG4sIGgsIGEpIHsKICAgIGNvbnN0IGUgPSBPYmplY3QudmFsdWVzKG4uY29udGFpbmVycyksIGQgPSBPYmplY3QudmFsdWVzKG4ubm9kZXMpLCByID0gbmV3IFNldCgKICAgICAgZS5maWx0ZXIoKGkpID0+ICEhaS5jb2xsYXBzZWQpLm1hcCgoaSkgPT4gaS5pZCkKICAgICksIGcgPSAoaSkgPT4gewogICAgICB2YXIgeTsKICAgICAgbGV0IGYgPSBpOwogICAgICBmb3IgKDsgZjsgKSB7CiAgICAgICAgaWYgKHIuaGFzKGYpKSByZXR1cm4gITA7CiAgICAgICAgZiA9ICh5ID0gbi5jb250YWluZXJzW2ZdKSA9PSBudWxsID8gdm9pZCAwIDogeS5wYXJlbnRJZDsKICAgICAgfQogICAgICByZXR1cm4gITE7CiAgICB9LCB0ID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgW2ksIGZdIG9mIE9iamVjdC5lbnRyaWVzKG4ubm9kZXMpKQogICAgICBnKGYucGFyZW50SWQpIHx8IHQuYWRkKGkpOwogICAgZm9yIChjb25zdCBbaSwgZl0gb2YgT2JqZWN0LmVudHJpZXMobi5jb250YWluZXJzKSkgewogICAgICBjb25zdCB5ID0gZjsKICAgICAgeS5jb2xsYXBzZWQgPyBnKHkucGFyZW50SWQpIHx8IHQuYWRkKGkpIDogIShkLnNvbWUoKHUpID0+IHUucGFyZW50SWQgPT09IGkpIHx8IGUuc29tZSgodSkgPT4gdS5wYXJlbnRJZCA9PT0gaSkpICYmICFnKHkucGFyZW50SWQpICYmIHQuYWRkKGkpOwogICAgfQogICAgY29uc3QgcyA9IFguZGVjb3VwbGUobiwgdCksIHAgPSBHLmFzc2lnbkxheWVycyhzLmFsbEVudGl0eUlkcywgcy5hZGpMaXN0KSwgYyA9IEEubWluaW1pemVDcm9zc2luZ3MocCwgcy5hZGpMaXN0LCA0KTsKICAgIHJldHVybiBELmFzc2lnbkNvb3JkaW5hdGVzKG4sIGMsIGgsIGEpOwogIH0KfQpjb25zdCBxID0gbmV3IFUoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAodikgPT4gewogIGNvbnN0IHsgaWQ6IG4sIGdyYXBoOiBoLCBtZWFzdXJlbWVudHM6IGEsIG9wdGlvbnM6IGUgfSA9IHYuZGF0YTsKICB0cnkgewogICAgY29uc3QgZCA9IG5ldyBNYXAoYSksIHIgPSBhd2FpdCBxLmV4ZWN1dGUoaCwgZCwgZSk7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IG4sIHN1Y2Nlc3M6ICEwLCBsYXlvdXQ6IHIgfSk7CiAgfSBjYXRjaCAoZCkgewogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBuLCBzdWNjZXNzOiAhMSwgZXJyb3I6IGQubWVzc2FnZSB9KTsKICB9Cn07Cg==", ne = (d) => Uint8Array.from(atob(d), (g) => g.charCodeAt(0)), Tt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", ne(Yt)], { type: "text/javascript;charset=utf-8" });
function Ie(d) {
  let g;
  try {
    if (g = Tt && (self.URL || self.webkitURL).createObjectURL(Tt), !g) throw "";
    const i = new Worker(g, {
      type: "module",
      name: d == null ? void 0 : d.name
    });
    return i.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(g);
    }), i;
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
class Ce {
  constructor() {
    At(this, "worker", null);
    At(this, "pendingRequests", /* @__PURE__ */ new Map());
    At(this, "fallbackEngine", new se());
    if (typeof Worker < "u")
      try {
        this.worker = new Ie(), this.worker.onmessage = (g) => {
          const { id: i, success: C, layout: s, error: r } = g.data, c = this.pendingRequests.get(i);
          c && (this.pendingRequests.delete(i), C ? c.resolve(s) : c.reject(new Error(r)));
        }, this.worker.onerror = (g) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", g);
        };
      } catch (g) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", g), this.worker = null;
      }
  }
  execute(g, i, C) {
    return this.worker ? new Promise((s, r) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: s, reject: r });
      const A = Array.from(i.entries());
      this.worker.postMessage({
        id: c,
        graph: g,
        measurements: A,
        options: C
      });
    }) : this.fallbackEngine.execute(g, i, C);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class ie {
  canDrag() {
    return !0;
  }
  onDragMove(g) {
    return g.cursorWorld;
  }
  onDragEnd(g) {
    const { draggedEntity: i, hoveredEntity: C, graph: s } = g;
    return C && C.id === i.id ? null : C && s.containers[C.id] ? i.parentId === C.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: i.id,
        newParentId: C.id
      }
    } : !C && i.parentId !== null && i.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: i.id,
        newParentId: null
      }
    } : null;
  }
}
class Ge {
  onDragEnd(g) {
    const { draggedEntity: i, hoveredEdge: C, hoveredEntity: s, graph: r } = g, c = (A) => {
      const o = r.nodes[A.id] || A;
      if (!o.ports || o.ports.length === 0) return "";
      const l = Object.values(r.edges).find((t) => t.targetId === A.id);
      if (l) {
        const t = o.ports.find((e) => e.id === l.targetPortId);
        if (t) return t.id;
      }
      const f = new Set(
        Object.values(r.edges).filter((t) => t.sourceId === A.id).map((t) => t.sourcePortId)
      ), h = o.ports.find((t) => !f.has(t.id));
      return h ? h.id : o.ports[0].id;
    };
    if (C)
      return C.sourceId === i.id || C.targetId === i.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: C.id,
          newSourceId: C.sourceId,
          newTargetId: i.id,
          newTargetPortId: c(i)
        }
      };
    if (s && s.id !== i.id) {
      const A = Object.values(r.edges).find(
        (o) => o.targetId === s.id && o.sourceId !== i.id
      );
      if (A)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: A.id,
            newSourceId: A.sourceId,
            newTargetId: i.id,
            newTargetPortId: c(i)
          }
        };
    }
    return null;
  }
}
function de(d, g = { min: 0.15, max: 3 }) {
  const [i, C] = z({ x: 80, y: 80, zoom: 1 }), s = _(!1), r = _({ x: 0, y: 0 }), c = D(
    (a, n) => {
      if (!d.current) return { x: a, y: n };
      const I = d.current.getBoundingClientRect();
      return {
        x: (a - I.left - i.x) / i.zoom,
        y: (n - I.top - i.y) / i.zoom
      };
    },
    [i, d]
  ), A = D(
    (a) => {
      if (!d.current) return;
      const n = [
        ...Object.values(a.nodes),
        ...Object.values(a.containers)
      ];
      if (n.length === 0) {
        C({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let I = 1 / 0, b = 1 / 0, u = -1 / 0, m = -1 / 0;
      for (const p of n)
        I = Math.min(I, p.x), b = Math.min(b, p.y), u = Math.max(u, p.x + p.width), m = Math.max(m, p.y + p.height);
      const B = d.current.getBoundingClientRect(), w = 80, L = Math.max(u - I, 100), K = Math.max(m - b, 100), v = (B.width - w * 2) / L, H = (B.height - w * 2) / K, x = Math.min(
        Math.max(Math.min(v, H), g.min),
        Math.min(g.max, 1.25)
      ), W = (B.width - L * x) / 2 - I * x, G = (B.height - K * x) / 2 - b * x;
      C({
        x: W,
        y: G,
        zoom: x
      });
    },
    [d, g]
  ), o = D(
    (a) => {
      if (a.preventDefault(), !!d.current)
        if (a.ctrlKey || a.metaKey) {
          const n = d.current.getBoundingClientRect(), I = a.clientX - n.left, b = a.clientY - n.top, u = a.deltaY < 0 ? 1.08 : 0.92, m = Math.min(Math.max(i.zoom * u, g.min), g.max), B = I - (I - i.x) * (m / i.zoom), w = b - (b - i.y) * (m / i.zoom);
          C({ x: B, y: w, zoom: m });
        } else
          C((n) => ({
            ...n,
            x: n.x - a.deltaX,
            y: n.y - a.deltaY
          }));
    },
    [i, g, d]
  ), l = D(
    (a, n) => {
      s.current = !0, r.current = { x: a - i.x, y: n - i.y };
    },
    [i]
  ), f = D((a, n) => {
    s.current && C((I) => ({
      ...I,
      x: a - r.current.x,
      y: n - r.current.y
    }));
  }, []), h = D(() => {
    s.current = !1;
  }, []), t = D(() => {
    C({ x: 80, y: 80, zoom: 1 });
  }, []), e = D(() => {
    C((a) => ({
      ...a,
      zoom: Math.min(a.zoom * 1.2, g.max)
    }));
  }, [g]), y = D(() => {
    C((a) => ({
      ...a,
      zoom: Math.max(a.zoom / 1.2, g.min)
    }));
  }, [g]);
  return {
    transform: i,
    setTransform: C,
    screenToWorld: c,
    onWheel: o,
    startPan: l,
    updatePan: f,
    endPan: h,
    resetTransform: t,
    zoomIn: e,
    zoomOut: y,
    zoomToFit: A,
    isPanning: s
  };
}
function ce(d) {
  const [g, i] = z(
    /* @__PURE__ */ new Map()
  );
  _(/* @__PURE__ */ new Map());
  const C = _(/* @__PURE__ */ new Map()), s = D((r, c) => {
    c ? C.current.set(r, c) : C.current.delete(r);
  }, []);
  return Zt(() => {
    const r = new ResizeObserver((c) => {
      let A = !1;
      const o = new Map(g);
      for (const l of c) {
        const f = l.target.getAttribute("data-sysflow-measure-id");
        if (!f) continue;
        const h = Math.ceil(l.contentRect.width), t = Math.ceil(l.contentRect.height), e = o.get(f);
        (!e || e.width !== h || e.height !== t) && (o.set(f, { width: h, height: t }), A = !0);
      }
      A && i(o);
    });
    return C.current.forEach((c) => r.observe(c)), () => {
      r.disconnect();
    };
  }, [d]), { measurements: g, registerMeasureElement: s };
}
function re(d, g, i, C, s) {
  const [r, c] = z(null), [A, o] = z(null), l = _(null), f = _(null), h = D(
    (n, I) => {
      let b = null, u = 1 / 0;
      for (const [m, B] of Object.entries(g.containers))
        if (m !== I && n.x >= B.x && n.x <= B.x + B.width && n.y >= B.y && n.y <= B.y + B.height) {
          const w = B.width * B.height;
          w < u && (u = w, b = d.containers[m] || null);
        }
      if (b) return b;
      for (const [m, B] of Object.entries(g.nodes))
        if (m !== I && n.x >= B.x && n.x <= B.x + B.width && n.y >= B.y && n.y <= B.y + B.height)
          return d.nodes[m] || null;
      return null;
    },
    [g, d]
  ), t = D(
    (n, I) => {
      let b = null, u = 45;
      for (const m of Object.values(d.edges)) {
        if (m.sourceId === I || m.targetId === I) continue;
        const B = g.nodes[m.sourceId] || g.containers[m.sourceId], w = g.nodes[m.targetId] || g.containers[m.targetId];
        if (!B || !w) continue;
        const L = B.x + B.width, K = B.y + B.height / 2, v = w.x, H = w.y + w.height / 2;
        for (let x = 0; x <= 10; x++) {
          const W = x / 10, G = (1 - W) * L + W * v, p = (1 - W) * K + W * H, k = Math.hypot(n.x - G, n.y - p);
          k < u && (u = k, b = m);
        }
      }
      return b;
    },
    [g, d]
  ), e = D(
    (n, I) => {
      if (I.stopPropagation(), i.canDrag && !i.canDrag(n, d))
        return;
      const b = C(I.clientX, I.clientY);
      c({
        draggedEntity: n,
        ghostPosition: b
      });
    },
    [d, i, C]
  ), y = D(
    (n) => {
      if (!r) return;
      const I = C(n.clientX, n.clientY), b = h(I, r.draggedEntity.id), u = t(I, r.draggedEntity.id);
      l.current = b, f.current = u, b && d.containers[b.id] ? o(b.id) : o(null);
      const m = i.onDragMove ? i.onDragMove({
        draggedEntity: r.draggedEntity,
        cursorWorld: I,
        hoveredEntity: b,
        hoveredEdge: u,
        graph: d
      }) : I;
      m && c((B) => B ? { ...B, ghostPosition: m } : null);
    },
    [r, C, i, d, h, t]
  ), a = D(
    (n) => {
      if (!r) return;
      const I = C(n.clientX, n.clientY), b = h(I, r.draggedEntity.id), u = t(I, r.draggedEntity.id), m = i.onDragEnd({
        draggedEntity: r.draggedEntity,
        cursorWorld: I,
        hoveredEntity: b,
        hoveredEdge: u,
        graph: d
      });
      m && s(m), c(null), o(null), l.current = null, f.current = null;
    },
    [r, C, i, d, h, t, s]
  );
  return {
    dragState: r,
    hoveredContainerId: A,
    handlePointerDown: e,
    handlePointerMove: y,
    handlePointerUp: a
  };
}
function me(d) {
  const [g, i] = z([d]), [C, s] = z(0), [r, c] = z(null), A = g[C], o = D((n) => {
    const I = _t(n);
    i((b) => [...b.slice(0, C + 1), I]), s((b) => b + 1);
  }, [C]), l = D(() => {
    C > 0 && s((n) => n - 1);
  }, [C]), f = D(() => {
    C < g.length - 1 && s((n) => n + 1);
  }, [C, g.length]), h = D((n) => {
    var b, u, m, B;
    const I = g[C];
    if (n.type === "ENTITY_REPARENT") {
      const { entityId: w, newParentId: L } = n.payload, K = {
        ...I,
        nodes: { ...I.nodes },
        containers: { ...I.containers }
      };
      K.nodes[w] ? K.nodes[w] = { ...K.nodes[w], parentId: L } : K.containers[w] && (K.containers[w] = { ...K.containers[w], parentId: L }), o(K);
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
      const K = L, v = I.edges[w], H = v.targetId, x = Object.values(I.edges).find((j) => j.targetId === K), W = Object.values(I.edges).find((j) => j.sourceId === K), G = { ...I.edges };
      x && W && (G[x.id] = { ...x, targetId: W.targetId, targetPortId: W.targetPortId }, delete G[W.id]);
      const p = ((u = (b = I.nodes[K]) == null ? void 0 : b.ports[0]) == null ? void 0 : u.id) || "p_in", k = ((B = (m = I.nodes[K]) == null ? void 0 : m.ports.find((j) => j.id !== p)) == null ? void 0 : B.id) || p;
      G[w] = {
        ...v,
        targetId: K,
        targetPortId: p
      };
      const Q = `REWIRE_${Date.now()}`;
      G[Q] = {
        id: Q,
        sourceId: K,
        sourcePortId: k,
        targetId: H,
        targetPortId: v.targetPortId
      }, o({ ...I, edges: G });
    }
  }, [g, C, o]), t = D((n) => {
    const I = A.nodes[n] || A.containers[n];
    I && c({ entity: JSON.parse(JSON.stringify(I)), isCut: !1 });
  }, [A]), e = D((n) => {
    const I = A.nodes[n] || A.containers[n];
    if (I) {
      c({ entity: JSON.parse(JSON.stringify(I)), isCut: !0 });
      const b = { ...A.nodes }, u = { ...A.containers };
      delete b[n], delete u[n], o({ ...A, nodes: b, containers: u });
    }
  }, [A, o]), y = D(() => {
    if (!r) return;
    const n = r.entity, I = `${n.id}_copy_${Date.now().toString().slice(-4)}`, b = { ...n, id: I, label: `${n.label} (Copy)` };
    "collapsed" in b ? o({
      ...A,
      containers: { ...A.containers, [I]: b }
    }) : o({
      ...A,
      nodes: { ...A.nodes, [I]: b }
    });
  }, [r, A, o]), a = D((n) => {
    if (n.length === 0) return;
    const I = { ...A.nodes }, b = { ...A.containers }, u = { ...A.edges };
    for (const m of n)
      delete I[m], delete b[m], delete u[m];
    o({
      ...A,
      nodes: I,
      containers: b,
      edges: u
    });
  }, [A, o]);
  return {
    graph: A,
    setGraphDirect: o,
    applyAction: h,
    undo: l,
    redo: f,
    copyEntity: t,
    cutEntity: e,
    pasteEntity: y,
    deleteSelection: a,
    canUndo: C > 0,
    canRedo: C < g.length - 1
  };
}
const le = ({
  graph: d,
  registerMeasureElement: g,
  nodeTypes: i,
  containerTypes: C
}) => {
  const s = Object.values(d.nodes), r = Object.values(d.containers);
  return /* @__PURE__ */ O("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    s.map((c) => {
      const A = c.type ? i == null ? void 0 : i[c.type] : null;
      return /* @__PURE__ */ T(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: A ? /* @__PURE__ */ T(A, { node: c, selected: !1 }) : /* @__PURE__ */ O("div", { style: { padding: "12px 16px" }, children: [
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
    r.map((c) => {
      const A = c.type ? C == null ? void 0 : C[c.type] : null;
      return /* @__PURE__ */ T(
        "div",
        {
          ref: (o) => g(c.id, o),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: A ? /* @__PURE__ */ T(A, { container: c, selected: !1 }) : /* @__PURE__ */ T("div", { className: "sysflow-container-header", children: c.label })
        },
        `measure-container-${c.id}`
      );
    })
  ] });
}, ae = ({
  graph: d,
  layout: g,
  selectedIds: i,
  direction: C = "TB",
  showArrows: s = !0,
  routing: r = "auto",
  portOptions: c,
  onEdgeClick: A
}) => {
  const o = r === "step" || r === "auto" && (C === "LR" || C === "RL"), l = (t, e, y) => {
    var v, H, x, W;
    let a = t, n = null;
    for ((v = d.containers[t]) != null && v.collapsed && (n = d.containers[t]); a; ) {
      const G = ((H = d.nodes[a]) == null ? void 0 : H.parentId) ?? ((x = d.containers[a]) == null ? void 0 : x.parentId) ?? null;
      G && ((W = d.containers[G]) != null && W.collapsed) && (n = d.containers[G]), a = G;
    }
    if (n) {
      const G = g.containers[n.id];
      if (!G)
        return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: n.id };
      let p, k, Q;
      return C === "TB" ? (p = y ? "bottom" : "top", k = G.x + G.width / 2, Q = y ? G.y + G.height : G.y) : C === "BT" ? (p = y ? "top" : "bottom", k = G.x + G.width / 2, Q = y ? G.y : G.y + G.height) : C === "RL" ? (p = y ? "left" : "right", k = y ? G.x : G.x + G.width, Q = G.y + G.height / 2) : (p = y ? "right" : "left", k = y ? G.x + G.width : G.x, Q = G.y + G.height / 2), { x: k, y: Q, side: p, valid: !0, entityId: n.id };
    }
    if (!!d.containers[t]) {
      const G = g.containers[t];
      if (!G) return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: t };
      let p, k, Q;
      return C === "TB" ? (p = G.x + G.width / 2, k = y ? G.y + G.height : G.y, Q = y ? "bottom" : "top") : C === "BT" ? (p = G.x + G.width / 2, k = y ? G.y : G.y + G.height, Q = y ? "top" : "bottom") : C === "RL" ? (p = y ? G.x : G.x + G.width, k = G.y + G.height / 2, Q = y ? "left" : "right") : (p = y ? G.x + G.width : G.x, k = G.y + G.height / 2, Q = y ? "right" : "left"), { x: p, y: k, side: Q, valid: !0, entityId: t };
    }
    const b = d.nodes[t], u = g.nodes[t];
    if (!b || !u)
      return { x: 0, y: 0, side: y ? "right" : "left", valid: !1, entityId: t };
    const B = Kt(
      b,
      u,
      C,
      d.edges,
      c
    ).get(e);
    if (B)
      return { x: B.worldX, y: B.worldY, side: B.side, valid: !0, entityId: t };
    let w, L, K;
    return C === "TB" ? (w = u.x + u.width / 2, L = y ? u.y + u.height : u.y, K = y ? "bottom" : "top") : C === "BT" ? (w = u.x + u.width / 2, L = y ? u.y : u.y + u.height, K = y ? "top" : "bottom") : C === "RL" ? (w = y ? u.x : u.x + u.width, L = u.y + u.height / 2, K = y ? "left" : "right") : (w = y ? u.x + u.width : u.x, L = u.y + u.height / 2, K = y ? "right" : "left"), { x: w, y: L, side: K, valid: !0, entityId: t };
  }, f = (t, e) => {
    const y = (t.x + e.x) / 2, a = (t.y + e.y) / 2;
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
        return `M ${t.x} ${t.y} L ${t.x} ${a} L ${e.x} ${a} L ${e.x} ${e.y}`;
      {
        const n = e.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${n} ${t.y + 20} L ${n} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`;
      }
    }
    if (t.side === "top" && e.side === "bottom") {
      if (e.y <= t.y - 16)
        return `M ${t.x} ${t.y} L ${t.x} ${a} L ${e.x} ${a} L ${e.x} ${e.y}`;
      {
        const n = e.x >= t.x ? t.x + 50 : t.x - 50;
        return `M ${t.x} ${t.y} L ${t.x} ${t.y - 20} L ${n} ${t.y - 20} L ${n} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`;
      }
    }
    return `M ${t.x} ${t.y} L ${y} ${t.y} L ${y} ${e.y} L ${e.x} ${e.y}`;
  }, h = (t, e) => {
    const y = e.x - t.x, a = e.y - t.y;
    if (t.side === "bottom" && e.side === "top")
      if (a > 0) {
        const m = Math.min(28, a * 0.4), B = t.y + Math.max(m, a * 0.5), w = e.y - Math.max(m, a * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${B} ${e.x} ${w} ${e.x} ${e.y}`;
      } else {
        const m = y >= 0 ? 1 : -1, B = Math.max(40, Math.abs(y) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + B * m} ${t.y + 40} ${e.x + B * m} ${e.y - 40} ${e.x} ${e.y}`;
      }
    if (t.side === "top" && e.side === "bottom")
      if (a < 0) {
        const m = Math.min(28, Math.abs(a) * 0.4), B = t.y - Math.max(m, Math.abs(a) * 0.5), w = e.y + Math.max(m, Math.abs(a) * 0.5);
        return `M ${t.x} ${t.y} C ${t.x} ${B} ${e.x} ${w} ${e.x} ${e.y}`;
      } else {
        const m = y >= 0 ? 1 : -1, B = Math.max(40, Math.abs(y) * 0.2);
        return `M ${t.x} ${t.y} C ${t.x + B * m} ${t.y - 40} ${e.x + B * m} ${e.y + 40} ${e.x} ${e.y}`;
      }
    if (t.side === "right" && e.side === "left")
      if (y > 0) {
        const m = t.x + y * 0.5, B = e.x - y * 0.5;
        return `M ${t.x} ${t.y} C ${m} ${t.y} ${B} ${e.y} ${e.x} ${e.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x + 50} ${t.y - 50} ${e.x - 50} ${e.y - 50} ${e.x} ${e.y}`;
    if (t.side === "left" && e.side === "right")
      if (y < 0) {
        const m = t.x + y * 0.5, B = e.x - y * 0.5;
        return `M ${t.x} ${t.y} C ${m} ${t.y} ${B} ${e.y} ${e.x} ${e.y}`;
      } else
        return `M ${t.x} ${t.y} C ${t.x - 50} ${t.y - 50} ${e.x + 50} ${e.y - 50} ${e.x} ${e.y}`;
    const n = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      top: { x: 0, y: -1 },
      bottom: { x: 0, y: 1 }
    }, I = n[t.side] || { x: 0, y: 1 }, b = n[e.side] || { x: 0, y: -1 }, u = Math.min(60, Math.hypot(y, a) * 0.35);
    return `M ${t.x} ${t.y} C ${t.x + I.x * u} ${t.y + I.y * u} ${e.x + b.x * u} ${e.y + b.y * u} ${e.x} ${e.y}`;
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
      const e = l(t.sourceId, t.sourcePortId, !0), y = l(t.targetId, t.targetPortId, !1);
      if (!e.valid || !y.valid || e.entityId === y.entityId) return null;
      const a = i.includes(t.id), n = o ? f(e, y) : h(e, y);
      return /* @__PURE__ */ O("g", { style: { pointerEvents: "stroke" }, children: [
        /* @__PURE__ */ T(
          "path",
          {
            d: n,
            fill: "none",
            stroke: "transparent",
            strokeWidth: 14,
            onClick: (I) => {
              I.stopPropagation(), A == null || A(t.id);
            },
            style: { cursor: "pointer" }
          }
        ),
        /* @__PURE__ */ T(
          "path",
          {
            d: n,
            fill: "none",
            stroke: a ? "var(--sysflow-edge-selected)" : "var(--sysflow-edge-stroke)",
            strokeWidth: a ? 2.5 : 1.75,
            strokeLinejoin: "round",
            strokeLinecap: "round",
            markerEnd: s ? a ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
          }
        )
      ] }, t.id);
    })
  ] });
}, Ae = ({
  entity: d,
  layout: g,
  direction: i = "LR",
  edges: C,
  portOptions: s,
  onPortPointerDown: r,
  onPortPointerUp: c
}) => {
  if (!d.ports || d.ports.length === 0)
    return null;
  const A = Kt(
    d,
    g,
    i,
    C,
    s
  );
  return /* @__PURE__ */ T(Jt, { children: d.ports.map((o) => {
    const l = A.get(o.id);
    return l ? /* @__PURE__ */ T(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${l.side}`,
        style: {
          position: "absolute",
          left: `${l.localX}px`,
          top: `${l.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${o.label} (${l.side})`,
        onPointerDown: (f) => {
          f.stopPropagation(), r == null || r(d.id, o.id, !0, f);
        },
        onPointerUp: (f) => {
          f.stopPropagation(), c == null || c(d.id, o.id, !1);
        }
      },
      o.id
    ) : null;
  }) });
}, ye = ({
  node: d,
  layout: g,
  selected: i = !1,
  direction: C = "LR",
  edges: s,
  portOptions: r,
  onPointerDown: c,
  onMouseEnter: A,
  onMouseLeave: o,
  onClick: l,
  onPortPointerDown: f,
  onPortPointerUp: h,
  customRenderer: t
}) => /* @__PURE__ */ O(
  "div",
  {
    className: `sysflow-node ${i ? "sysflow-selected" : ""} ${d.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (e) => c == null ? void 0 : c(d, e),
    onMouseEnter: () => A == null ? void 0 : A(d.id),
    onMouseLeave: () => o == null ? void 0 : o(d.id),
    onClick: l,
    children: [
      /* @__PURE__ */ T(
        Ae,
        {
          entity: d,
          layout: g,
          direction: C,
          edges: s,
          portOptions: r,
          onPortPointerDown: f,
          onPortPointerUp: h
        }
      ),
      t ? /* @__PURE__ */ T(t, { node: d, selected: i }) : /* @__PURE__ */ O("div", { style: { padding: "10px 14px" }, children: [
        /* @__PURE__ */ T("div", { style: { fontWeight: 600, fontSize: "13px" }, children: d.label }),
        d.ports.length > 0 && /* @__PURE__ */ O("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
          d.ports.length,
          " Port",
          d.ports.length > 1 ? "s" : ""
        ] })
      ] })
    ]
  }
), ue = ({
  container: d,
  layout: g,
  selected: i,
  isHovered: C = !1,
  onToggleCollapse: s,
  onPointerDown: r,
  onMouseEnter: c,
  onMouseLeave: A,
  onClick: o,
  customRenderer: l
}) => /* @__PURE__ */ T(
  "div",
  {
    className: `sysflow-container ${i ? "sysflow-selected" : ""} ${C ? "sysflow-hovered" : ""} ${d.className || ""}`,
    style: {
      transform: `translate(${g.x}px, ${g.y}px)`,
      width: `${g.width}px`,
      height: `${g.height}px`
    },
    onPointerDown: (f) => r(d, f),
    onMouseEnter: c,
    onMouseLeave: A,
    onClick: o,
    children: l ? /* @__PURE__ */ T(l, { container: d, selected: i }) : /* @__PURE__ */ O("div", { className: "sysflow-container-header", children: [
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
          onClick: (f) => {
            f.stopPropagation(), s(d.id, !d.collapsed);
          },
          children: d.collapsed ? "Expand ⊞" : "Collapse ⊟"
        }
      )
    ] })
  }
), he = new ie(), Ze = ({
  graph: d,
  onChange: g,
  layoutEngine: i,
  interactionStrategy: C = he,
  direction: s = "TB",
  layoutOptions: r,
  portPlacementMode: c,
  routing: A,
  showEdgeArrows: o = !0,
  nodeTypes: l,
  containerTypes: f,
  zoomBounds: h,
  className: t = "",
  selectedIds: e = [],
  theme: y = "dark"
}) => {
  var Lt, xt;
  const a = _(null), n = _(null);
  !i && !n.current && (n.current = new Ce());
  const I = i || n.current, {
    transform: b,
    screenToWorld: u,
    onWheel: m,
    startPan: B,
    updatePan: w,
    endPan: L,
    resetTransform: K,
    zoomIn: v,
    zoomOut: H,
    zoomToFit: x,
    isPanning: W
  } = de(a, h), { measurements: G, registerMeasureElement: p } = ce(d), [k, Q] = z({ nodes: {}, containers: {} }), j = jt(() => ({
    direction: s,
    mode: c ?? (s === "TB" || s === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: k.nodes
  }), [s, c, k.nodes]), [E, ct] = z(null), [M, rt] = z(null), ht = _(!1), {
    dragState: tt,
    hoveredContainerId: Ht,
    handlePointerDown: St,
    handlePointerMove: Wt,
    handlePointerUp: vt
  } = re(d, k, C, u, g);
  Zt(() => {
    const Z = (S) => {
      if (S.target instanceof HTMLInputElement || S.target instanceof HTMLTextAreaElement)
        return;
      if (S.key === "Escape") {
        S.preventDefault(), rt(null), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (S.code === "Space" && (ht.current = !0), S.key.toLowerCase() === "f" && !S.ctrlKey && !S.metaKey) {
        S.preventDefault(), x(k);
        return;
      }
      if ((S.ctrlKey || S.metaKey) && S.key.toLowerCase() === "a") {
        S.preventDefault();
        const V = [
          ...Object.keys(d.nodes),
          ...Object.keys(d.containers)
        ];
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: V } });
        return;
      }
      const Y = Object.keys(d.nodes);
      if (Y.length !== 0) {
        if (S.key === "Tab") {
          S.preventDefault();
          const V = e.length > 0 ? Y.indexOf(e[0]) : -1;
          let N;
          S.shiftKey ? N = V <= 0 ? Y.length - 1 : V - 1 : N = (V + 1) % Y.length, g({ type: "SELECTION_CHANGE", payload: { selectedIds: [Y[N]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(S.key)) {
          S.preventDefault();
          const V = e[0] || Y[0], N = k.nodes[V] || k.containers[V];
          if (!N) return;
          const F = {
            x: N.x + N.width / 2,
            y: N.y + N.height / 2
          };
          let X = null, gt = 1 / 0;
          for (const st of Y) {
            if (st === V) continue;
            const et = k.nodes[st];
            if (!et) continue;
            const it = {
              x: et.x + et.width / 2,
              y: et.y + et.height / 2
            }, nt = it.x - F.x, ot = it.y - F.y;
            let J = !1;
            if (S.key === "ArrowRight" && nt > 20 && (J = !0), S.key === "ArrowLeft" && nt < -20 && (J = !0), S.key === "ArrowDown" && ot > 20 && (J = !0), S.key === "ArrowUp" && ot < -20 && (J = !0), J) {
              const R = Math.hypot(nt, ot);
              R < gt && (gt = R, X = st);
            }
          }
          X && g({ type: "SELECTION_CHANGE", payload: { selectedIds: [X] } });
        }
      }
    }, P = (S) => {
      S.code === "Space" && (ht.current = !1);
    };
    return window.addEventListener("keydown", Z), window.addEventListener("keyup", P), () => {
      window.removeEventListener("keydown", Z), window.removeEventListener("keyup", P);
    };
  }, [d, k, e, x, g]), Zt(() => {
    let Z = !1, P = 16 / 9;
    if (a.current) {
      const Y = a.current.getBoundingClientRect();
      Y.width > 0 && Y.height > 0 && (P = Y.width / Y.height);
    }
    const S = {
      direction: s,
      aspectRatio: P,
      ...r
    };
    return I.execute(d, G, S).then((Y) => {
      Z || Q(Y);
    }), () => {
      Z = !0;
    };
  }, [d, G, I, s, r]);
  const Xt = (Z, P, S, Y) => {
    const V = d.nodes[Z] || d.containers[Z], N = k.nodes[Z] || k.containers[Z];
    if (!V || !N) return;
    const X = Kt(
      V,
      N,
      s,
      d.edges,
      j
    ).get(P), gt = X ? { x: X.worldX, y: X.worldY } : { x: N.x + N.width, y: N.y + N.height / 2 };
    ct({
      sourceId: Z,
      sourcePortId: P,
      startWorldPos: gt,
      currentWorldPos: u(Y.clientX, Y.clientY)
    });
  }, Nt = (Z, P, S) => {
    var Y, V, N, F, X, gt, st, et, it, nt;
    if (E && E.sourceId !== Z) {
      const ot = d.nodes[E.sourceId] || d.containers[E.sourceId], J = d.nodes[Z] || d.containers[Z], R = (Y = ot == null ? void 0 : ot.ports) == null ? void 0 : Y.find((It) => It.id === E.sourcePortId), $ = (V = J == null ? void 0 : J.ports) == null ? void 0 : V.find((It) => It.id === P);
      let lt = E.sourceId, ft = E.sourcePortId, at = Z, Bt = P;
      const Qt = ((N = R == null ? void 0 : R.label) == null ? void 0 : N.toLowerCase().includes("in")) || (R == null ? void 0 : R.side) === (s === "BT" ? "bottom" : "top");
      (F = R == null ? void 0 : R.label) != null && F.toLowerCase().includes("out") || (R == null || R.side), (X = $ == null ? void 0 : $.label) != null && X.toLowerCase().includes("in") || ($ == null || $.side);
      const Rt = ((gt = $ == null ? void 0 : $.label) == null ? void 0 : gt.toLowerCase().includes("out")) || ($ == null ? void 0 : $.side) === (s === "BT" ? "top" : "bottom");
      if (Qt && Rt)
        lt = Z, ft = P, at = E.sourceId, Bt = E.sourcePortId;
      else if (k.nodes[E.sourceId] && k.nodes[Z]) {
        const It = k.nodes[E.sourceId], kt = k.nodes[Z], Ot = s === "BT" && It.y < kt.y, $t = s === "TB" && It.y > kt.y;
        if (Ot || $t) {
          lt = Z, at = E.sourceId;
          const bt = d.nodes[lt], wt = d.nodes[at];
          ft = ((et = (st = bt == null ? void 0 : bt.ports) == null ? void 0 : st.find((dt) => dt.label.includes("out") || dt.side === (s === "BT" ? "top" : "bottom"))) == null ? void 0 : et.id) || P, Bt = ((nt = (it = wt == null ? void 0 : wt.ports) == null ? void 0 : it.find((dt) => dt.label.includes("in") || dt.side === (s === "BT" ? "bottom" : "top"))) == null ? void 0 : nt.id) || E.sourcePortId;
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
  }, Dt = (Z) => {
    if (Z.button === 1 || ht.current) {
      B(Z.clientX, Z.clientY);
      return;
    }
    const P = Z.target, S = P === a.current || P.classList.contains("sysflow-viewport") || P.classList.contains("sysflow-dom-layer") || P.tagName.toLowerCase() === "svg";
    if (Z.button === 0 && S) {
      Z.currentTarget.setPointerCapture(Z.pointerId);
      const Y = u(Z.clientX, Z.clientY);
      rt({
        startX: Y.x,
        startY: Y.y,
        currentX: Y.x,
        currentY: Y.y
      }), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Et = (Z) => {
    if (W.current)
      w(Z.clientX, Z.clientY);
    else if (M) {
      const P = u(Z.clientX, Z.clientY);
      rt((S) => S ? { ...S, currentX: P.x, currentY: P.y } : null);
    } else tt ? Wt(Z) : E && ct(
      (P) => P ? { ...P, currentWorldPos: u(Z.clientX, Z.clientY) } : null
    );
  }, Mt = (Z) => {
    if (Z.currentTarget.hasPointerCapture(Z.pointerId) && Z.currentTarget.releasePointerCapture(Z.pointerId), W.current && L(), M) {
      const P = Math.min(M.startX, M.currentX), S = Math.min(M.startY, M.currentY), Y = Math.max(M.startX, M.currentX), V = Math.max(M.startY, M.currentY);
      if (Y - P > 4 || V - S > 4) {
        const N = [];
        for (const [F, X] of Object.entries(k.nodes))
          X.x < Y && X.x + X.width > P && X.y < V && X.y + X.height > S && N.push(F);
        for (const [F, X] of Object.entries(k.containers))
          X.x < Y && X.x + X.width > P && X.y < V && X.y + X.height > S && N.push(F);
        g({ type: "SELECTION_CHANGE", payload: { selectedIds: N } });
      }
      rt(null);
    }
    tt && vt(Z), E && ct(null);
  }, Vt = Object.values(d.containers);
  return /* @__PURE__ */ O(
    "div",
    {
      ref: a,
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
            nodeTypes: l,
            containerTypes: f
          }
        ),
        /* @__PURE__ */ O("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ T("button", { onClick: v, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ T("button", { onClick: H, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ O("button", { onClick: K, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
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
                  routing: A,
                  portOptions: j,
                  onEdgeClick: (Z) => g({ type: "SELECTION_CHANGE", payload: { selectedIds: [Z] } })
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
                Vt.map((Z) => {
                  const P = k.containers[Z.id];
                  return P ? /* @__PURE__ */ T(
                    ue,
                    {
                      container: Z,
                      layout: P,
                      selected: e.includes(Z.id),
                      isHovered: Ht === Z.id,
                      customRenderer: Z.type ? f == null ? void 0 : f[Z.type] : void 0,
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
                        S.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [Z.id] } });
                      }
                    },
                    Z.id
                  ) : null;
                }),
                Object.values(d.nodes).map((Z) => {
                  const P = k.nodes[Z.id];
                  return P ? /* @__PURE__ */ T(
                    ye,
                    {
                      node: Z,
                      layout: P,
                      direction: s,
                      edges: d.edges,
                      portOptions: j,
                      selected: e.includes(Z.id),
                      customRenderer: Z.type ? l == null ? void 0 : l[Z.type] : void 0,
                      onPointerDown: St,
                      onMouseEnter: () => {
                      },
                      onMouseLeave: () => {
                      },
                      onClick: (S) => {
                        S.stopPropagation(), g({ type: "SELECTION_CHANGE", payload: { selectedIds: [Z.id] } });
                      },
                      onPortPointerDown: Xt,
                      onPortPointerUp: Nt
                    },
                    Z.id
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
  ue as GraphContainer,
  ae as GraphEdgeLayer,
  ye as GraphNode,
  Ae as GraphPortLayer,
  ie as ReparentStrategy,
  se as SugiyamaEngine,
  Ze as SysFlowCanvas,
  Ce as WorkerBridge,
  Kt as computeEntityPortLocations,
  _t as pruneDanglingEdges,
  de as useCanvasTransform,
  re as useDragGesture,
  me as useGraphHistory,
  ce as useMeasurement
};
