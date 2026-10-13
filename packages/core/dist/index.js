var ie = Object.defineProperty;
var de = (n, o, g) => o in n ? ie(n, o, { enumerable: !0, configurable: !0, writable: !0, value: g }) : n[o] = g;
var Ct = (n, o, g) => de(n, typeof o != "symbol" ? o + "" : o, g);
import { useState as J, useRef as tt, useCallback as R, useEffect as bt, useMemo as re } from "react";
import { jsxs as $, jsx as H, Fragment as mt } from "react/jsx-runtime";
function Ie(n, o, g, I) {
  const s = (i) => {
    const r = g.find(
      (b) => b.sourceId === o && b.sourcePortId === i || b.targetId === o && b.targetPortId === i
    );
    if (!r) return null;
    const u = r.sourceId === o ? r.targetId : r.sourceId, a = I[u];
    return a ? { x: a.x + a.width / 2, y: a.y + a.height / 2 } : null;
  };
  ["left", "right"].forEach((i) => {
    n[i].sort((r, u) => {
      var y, C;
      const a = ((y = s(r.id)) == null ? void 0 : y.y) ?? 0, b = ((C = s(u.id)) == null ? void 0 : C.y) ?? 0;
      return a - b;
    });
  }), ["top", "bottom"].forEach((i) => {
    n[i].sort((r, u) => {
      var y, C;
      const a = ((y = s(r.id)) == null ? void 0 : y.x) ?? 0, b = ((C = s(u.id)) == null ? void 0 : C.x) ?? 0;
      return a - b;
    });
  });
}
function ce(n, o, g, I, s, i) {
  if (!s || !i)
    return g ? "left" : "right";
  const r = I.find(
    (C) => g ? C.targetId === n && C.targetPortId === o : C.sourceId === n && C.sourcePortId === o
  );
  if (!r) return g ? "left" : "right";
  const u = g ? r.sourceId : r.targetId, a = s[u];
  if (!a) return g ? "left" : "right";
  const b = a.x + a.width / 2 - (i.x + i.width / 2), y = a.y + a.height / 2 - (i.y + i.height / 2);
  return Math.abs(b) > Math.abs(y) ? b > 0 ? "right" : "left" : y > 0 ? "bottom" : "top";
}
function Gt(n, o, g = "LR", I, s) {
  const i = /* @__PURE__ */ new Map();
  if (!n || !o || !n.ports || n.ports.length === 0)
    return i;
  const r = (s == null ? void 0 : s.direction) || g, u = r === "TB" || r === "BT", a = (s == null ? void 0 : s.mode) || (u ? "strict-flow" : "perimeter-optimized"), b = I ? Array.isArray(I) ? I : Object.values(I) : [], y = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, C = new Set(
    b.filter((B) => B.targetId === n.id).map((B) => B.targetPortId)
  );
  new Set(
    b.filter((B) => B.sourceId === n.id).map((B) => B.sourcePortId)
  ), n.ports.forEach((B) => {
    let K = B.side || "auto";
    if (K !== "auto") {
      y[K].push(B);
      return;
    }
    if (a === "strict-flow") {
      const c = C.has(B.id) || B.label.toLowerCase().includes("in");
      switch (r) {
        case "BT":
          K = c ? "bottom" : "top";
          break;
        case "TB":
          K = c ? "top" : "bottom";
          break;
        case "RL":
          K = c ? "right" : "left";
          break;
        case "LR":
        default:
          K = c ? "left" : "right";
          break;
      }
    } else
      K = ce(
        n.id,
        B.id,
        C.has(B.id),
        b,
        s == null ? void 0 : s.nodeLayouts,
        o
      );
    y[K].push(B);
  }), a === "perimeter-optimized" && (s != null && s.nodeLayouts) && Ie(y, n.id, b, s.nodeLayouts);
  const G = (B, K) => {
    const c = B.length;
    B.forEach((t, e) => {
      let d = 0, h = 0;
      K === "left" || K === "right" ? (h = o.height / (c + 1) * (e + 1), d = K === "left" ? 0 : o.width) : (d = o.width / (c + 1) * (e + 1), h = K === "top" ? 0 : o.height), i.set(t.id, {
        portId: t.id,
        side: K,
        localX: d,
        localY: h,
        worldX: o.x + d,
        worldY: o.y + h
      });
    });
  };
  return G(y.left, "left"), G(y.right, "right"), G(y.top, "top"), G(y.bottom, "bottom"), i;
}
function Zt(n) {
  const o = {}, g = (I) => {
    var i;
    const s = n.nodes[I];
    return new Set(((i = s == null ? void 0 : s.ports) == null ? void 0 : i.map((r) => r.id)) || []);
  };
  for (const [I, s] of Object.entries(n.edges)) {
    const i = g(s.sourceId), r = g(s.targetId), u = i.has(s.sourcePortId), a = r.has(s.targetPortId);
    u && a && (o[I] = s);
  }
  return {
    ...n,
    edges: o
  };
}
class ae {
  static assignDynamicPortSides(o, g, I) {
    var i, r;
    const s = (u) => g[u] || I[u];
    for (const u of Object.values(o.edges)) {
      const a = s(u.sourceId), b = s(u.targetId);
      if (!a || !b) continue;
      const y = o.nodes[u.sourceId] || o.containers[u.sourceId], C = o.nodes[u.targetId] || o.containers[u.targetId], G = b.x + b.width / 2 - (a.x + a.width / 2), B = b.y + b.height / 2 - (a.y + a.height / 2), K = Math.abs(G) > Math.abs(B) * 1.25, c = (i = y == null ? void 0 : y.ports) == null ? void 0 : i.find((e) => e.id === u.sourcePortId);
      c && (!c.side || c.side === "auto") && (K ? c.side = G >= 0 ? "right" : "left" : c.side = B >= 0 ? "bottom" : "top");
      const t = (r = C == null ? void 0 : C.ports) == null ? void 0 : r.find((e) => e.id === u.targetPortId);
      t && (!t.side || t.side === "auto") && (K ? t.side = G >= 0 ? "left" : "right" : t.side = B >= 0 ? "top" : "bottom");
    }
  }
}
const Et = 22, Ht = 18, kt = 38, Bt = 210, Dt = 36, le = 180, Ce = 54, Pt = 260, Nt = 160;
class pt {
  static execute(o, g, I) {
    var t;
    const s = {}, i = {}, r = (e) => {
      var A, l, L, f, v;
      const d = !!o.containers[e], h = !!((A = o.containers[e]) != null && A.collapsed);
      return d && h ? { width: Bt, height: Dt } : d && !h ? {
        width: ((l = I.get(e)) == null ? void 0 : l.width) || Pt,
        height: ((L = I.get(e)) == null ? void 0 : L.height) || Nt
      } : {
        width: ((f = I.get(e)) == null ? void 0 : f.width) || le,
        height: ((v = I.get(e)) == null ? void 0 : v.height) || Ce
      };
    }, u = /* @__PURE__ */ new Map();
    for (const [e, d] of Object.entries(o.nodes)) {
      const h = d.parentId ?? null;
      u.has(h) || u.set(h, []), u.get(h).push(e);
    }
    for (const [e, d] of Object.entries(o.containers)) {
      const h = d.parentId ?? null;
      u.has(h) || u.set(h, []), u.get(h).push(e);
    }
    const a = pt.getContainerDepths(o), b = Object.keys(o.containers).sort(
      (e, d) => (a.get(d) || 0) - (a.get(e) || 0)
    ), y = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), G = (e) => y.has(e) ? y.get(e) : r(e);
    for (const e of b) {
      if (!!((t = o.containers[e]) != null && t.collapsed)) {
        y.set(e, {
          width: Bt,
          height: Dt
        });
        continue;
      }
      const h = u.get(e) || [];
      if (h.length === 0) {
        y.set(e, {
          width: Pt,
          height: Nt
        });
        continue;
      }
      const A = g.arrange(e, h, o, G);
      for (const f of A.boxes)
        C.set(f.id, f);
      const l = Math.max(A.width + Et * 2, Bt), L = A.height + kt + Ht * 2;
      y.set(e, { width: l, height: L });
    }
    const B = u.get(null) || [];
    let K = [];
    B.length > 0 && (K = g.arrange(null, B, o, G).boxes.map((d) => ({
      ...d,
      localX: d.localX + 60,
      localY: d.localY + 60
    })));
    const c = (e, d, h, A, l) => {
      var v;
      const L = !!o.containers[e], f = { id: e, x: d, y: h, width: A, height: l };
      if (L) {
        if (i[e] = f, (v = o.containers[e]) != null && v.collapsed) return;
        const p = d + Et, x = h + kt + Ht, S = u.get(e) || [];
        for (const E of S) {
          const P = C.get(E);
          P && c(
            E,
            p + P.localX,
            x + P.localY,
            P.width,
            P.height
          );
        }
      } else
        s[e] = f;
    };
    for (const e of K)
      c(e.id, e.localX, e.localY, e.width, e.height);
    return ae.assignDynamicPortSides(o, s, i), { nodes: s, containers: i };
  }
  static getContainerDepths(o) {
    const g = /* @__PURE__ */ new Map(), I = (s) => {
      var u;
      if (g.has(s)) return g.get(s);
      const i = (u = o.containers[s]) == null ? void 0 : u.parentId;
      if (!i || !o.containers[i])
        return g.set(s, 0), 0;
      const r = 1 + I(i);
      return g.set(s, r), r;
    };
    for (const s of Object.keys(o.containers))
      I(s);
    return g;
  }
}
const he = 36, vt = 28;
class Ae {
  constructor(o = {}) {
    this.options = o;
  }
  arrange(o, g, I, s) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const i = this.options.direction ?? "TB", r = i === "TB" || i === "BT", u = i === "BT" || i === "RL", a = new Set(g), b = [], y = /* @__PURE__ */ new Set();
    for (const p of Object.values(I.edges)) {
      const x = this.resolveToDirectChild(p.sourceId, a, I), S = this.resolveToDirectChild(p.targetId, a, I);
      if (x && S && x !== S) {
        const E = `${x}->${S}`;
        y.has(E) || (y.add(E), b.push({ sourceId: x, targetId: S }));
      }
    }
    const C = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
    for (const p of g)
      C.set(p, 0), G.set(p, []);
    for (const p of b)
      G.get(p.sourceId).push(p.targetId), C.set(p.targetId, (C.get(p.targetId) || 0) + 1);
    const B = /* @__PURE__ */ new Map(), K = g.filter((p) => (C.get(p) || 0) === 0);
    for (const p of K) B.set(p, 0);
    const c = /* @__PURE__ */ new Set();
    for (; K.length > 0; ) {
      const p = K.shift();
      c.add(p);
      const x = B.get(p);
      for (const S of G.get(p)) {
        const E = Math.max(B.get(S) || 0, x + 1);
        B.set(S, E), C.set(S, C.get(S) - 1), C.get(S) === 0 && K.push(S);
      }
    }
    for (const p of g)
      c.has(p) || B.set(p, 0);
    const t = /* @__PURE__ */ new Map();
    for (const [p, x] of B.entries())
      t.has(x) || t.set(x, []), t.get(x).push(p);
    const e = Array.from(t.keys()).sort((p, x) => p - x), d = u ? [...e].reverse() : e, h = /* @__PURE__ */ new Map();
    let A = 0;
    for (const p of d) {
      const x = t.get(p);
      let S = 0;
      for (let E = 0; E < x.length; E++) {
        const P = s(x[E]), W = r ? P.width : P.height;
        S += W + (E > 0 ? vt : 0);
      }
      h.set(p, S), A = Math.max(A, S);
    }
    const l = [];
    let L = 0;
    for (const p of d) {
      const x = t.get(p);
      let S = 0;
      const E = h.get(p) || 0;
      let P = Math.max(0, (A - E) / 2);
      for (const W of x) {
        const Y = s(W), T = r ? Y.height : Y.width, w = r ? Y.width : Y.height, O = r ? P : L, Q = r ? L : P;
        l.push({ id: W, localX: O, localY: Q, width: Y.width, height: Y.height }), P += w + vt, S = Math.max(S, T);
      }
      L += S + he;
    }
    const f = Math.max(...l.map((p) => p.localX + p.width), 0), v = Math.max(...l.map((p) => p.localY + p.height), 0);
    return { width: f, height: v, boxes: l };
  }
  /**
   * Ascends the entity hierarchy to locate the direct child in this scope
   * that owns or is the target entity.
   */
  resolveToDirectChild(o, g, I) {
    var i, r;
    let s = o;
    for (; s; ) {
      if (g.has(s)) return s;
      s = ((i = I.nodes[s]) == null ? void 0 : i.parentId) ?? ((r = I.containers[s]) == null ? void 0 : r.parentId) ?? null;
    }
    return null;
  }
}
const gt = 32, Yt = 24;
class ue {
  constructor(o = 1.55) {
    this.targetAspect = o;
  }
  arrange(o, g, I, s) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const i = g.map((u) => {
      const a = s(u);
      return { id: u, width: a.width, height: a.height };
    }), r = this.findBestTightPacking(i, this.targetAspect);
    return { width: r.width, height: r.height, boxes: r.boxes };
  }
  findBestTightPacking(o, g) {
    if (o.length === 1)
      return {
        width: o[0].width,
        height: o[0].height,
        boxes: [{ id: o[0].id, localX: 0, localY: 0, width: o[0].width, height: o[0].height }],
        score: 0
      };
    const I = o.reduce((C, G) => C + G.width * G.height, 0), s = Math.max(...o.map((C) => C.width)), i = [...o].sort((C, G) => G.width - C.width), r = /* @__PURE__ */ new Set(), u = o.reduce((C, G) => C + G.width, 0) + (o.length - 1) * gt;
    r.add(u), r.add(s);
    const a = Math.max(s, Math.sqrt(I * g));
    r.add(a), r.add(a * 0.85), r.add(a * 1.15);
    const b = Math.min(o.length, 6);
    for (let C = 2; C <= b; C++) {
      let G = 0;
      for (let B = 0; B < C && B < i.length; B++)
        G += i[B].width;
      G += (C - 1) * gt, G >= s && r.add(G);
    }
    let y = null;
    for (const C of r) {
      const G = this.simulateSkylinePacking(o, C), B = G.width * G.height, K = Math.max(0, B - I), c = G.width / Math.max(1, G.height), t = Math.abs(Math.log(c / g)), e = K / I * 2 + t * 0.25;
      G.score = e, (!y || e < y.score) && (y = G);
    }
    return y;
  }
  simulateSkylinePacking(o, g) {
    const I = [...o].sort((a, b) => b.height - a.height), s = [{ x: 0, width: g, y: 0 }], i = [];
    for (const a of I) {
      let b = 1 / 0, y = -1;
      for (let e = 0; e < s.length; e++) {
        if (s[e].x + a.width > g) continue;
        let h = 0, A = 0;
        for (let l = e; l < s.length && A < a.width; l++)
          h = Math.max(h, s[l].y), A += s[l].width;
        h < b && (b = h, y = e);
      }
      if (y === -1) {
        const e = Math.max(...s.map((h) => h.y)), d = e === 0 ? 0 : e + Yt;
        i.push({ id: a.id, localX: 0, localY: d, width: a.width, height: a.height }), s.length = 0, s.push({ x: 0, width: a.width + gt, y: d + a.height }), g > a.width + gt && s.push({
          x: a.width + gt,
          width: g - (a.width + gt),
          y: 0
        });
        continue;
      }
      const C = s[y].x, G = b === 0 ? 0 : b + Yt;
      i.push({ id: a.id, localX: C, localY: G, width: a.width, height: a.height });
      const B = a.width + gt, K = G + a.height, c = { x: C, width: B, y: K }, t = [];
      for (const e of s)
        e.x + e.width <= C || e.x >= C + B ? t.push(e) : (e.x < C && t.push({ x: e.x, width: C - e.x, y: e.y }), e.x + e.width > C + B && t.push({
          x: C + B,
          width: e.x + e.width - (C + B),
          y: e.y
        }));
      t.push(c), t.sort((e, d) => e.x - d.x), s.length = 0, s.push(...t);
    }
    const r = Math.max(...i.map((a) => a.localX + a.width), 0), u = Math.max(...i.map((a) => a.localY + a.height), 0);
    return { width: r, height: u, boxes: i, score: 0 };
  }
}
function Wt(n, o, g) {
  var i, r;
  let I = n, s = null;
  for (; I; )
    g.has(I) && (s = I), I = ((i = o.nodes[I]) == null ? void 0 : i.parentId) ?? ((r = o.containers[I]) == null ? void 0 : r.parentId) ?? void 0;
  return s ?? n;
}
class ye {
  async execute(o, g, I) {
    const s = Object.values(o.containers), i = new Set(
      s.filter((C) => !!C.collapsed).map((C) => C.id)
    ), r = {};
    for (const [C, G] of Object.entries(o.edges)) {
      const B = Wt(G.sourceId, o, i), K = Wt(G.targetId, o, i);
      B !== K && (r[C] = {
        ...G,
        sourceId: B,
        targetId: K
      });
    }
    const u = {
      ...o,
      edges: r
    }, a = Object.keys(o.containers).length, y = (I != null && I.mode && I.mode !== "auto" ? I.mode : a > 0 ? "concurrent" : "flow") === "concurrent" ? new ue((I == null ? void 0 : I.aspectRatio) ?? 1.55) : new Ae(I);
    return pt.execute(u, y, g);
  }
}
const Mt = "Y2xhc3MgJCB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgYykgewogICAgdmFyIGksIHI7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgY1tsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFzIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgeCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBvID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChzLnggKyBzLndpZHRoIC8gMiksIGcgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAocy55ICsgcy5oZWlnaHQgLyAyKSwgeSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnMoZykgKiAxLjI1LCBDID0gKGkgPSB4ID09IG51bGwgPyB2b2lkIDAgOiB4LnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogaS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmICh5ID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IGcgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCB3ID0gKHIgPSBvID09IG51bGwgPyB2b2lkIDAgOiBvLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIHcgJiYgKCF3LnNpZGUgfHwgdy5zaWRlID09PSAiYXV0byIpICYmICh5ID8gdy5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IHcuc2lkZSA9IGcgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBCID0gMjIsIE4gPSAxOCwgSCA9IDM4LCBrID0gMjEwLCBSID0gMzYsIHogPSAxODAsIFYgPSA1NCwgVyA9IDI2MCwgWCA9IDE2MDsKY2xhc3MgWSB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgYykgewogICAgdmFyIHc7CiAgICBjb25zdCBuID0ge30sIGkgPSB7fSwgciA9ICh0KSA9PiB7CiAgICAgIHZhciBBLCBNLCBQLCBiLCB2OwogICAgICBjb25zdCB1ID0gISFlLmNvbnRhaW5lcnNbdF0sIGYgPSAhISgoQSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiBBLmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiB1ICYmIGYgPyB7IHdpZHRoOiBrLCBoZWlnaHQ6IFIgfSA6IHUgJiYgIWYgPyB7CiAgICAgICAgd2lkdGg6ICgoTSA9IGMuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogTS53aWR0aCkgfHwgVywKICAgICAgICBoZWlnaHQ6ICgoUCA9IGMuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC5oZWlnaHQpIHx8IFgKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gYy5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCB6LAogICAgICAgIGhlaWdodDogKCh2ID0gYy5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiB2LmhlaWdodCkgfHwgVgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCB1XSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCBmID0gdS5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyhmKSB8fCBsLnNldChmLCBbXSksIGwuZ2V0KGYpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCB1XSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IGYgPSB1LnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKGYpIHx8IGwuc2V0KGYsIFtdKSwgbC5nZXQoZikucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IHMgPSBZLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIHUpID0+IChzLmdldCh1KSB8fCAwKSAtIChzLmdldCh0KSB8fCAwKQogICAgKSwgeCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHguaGFzKHQpID8geC5nZXQodCkgOiByKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKCh3ID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIHcuY29sbGFwc2VkKSkgewogICAgICAgIHguc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBrLAogICAgICAgICAgaGVpZ2h0OiBSCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgZiA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAoZi5sZW5ndGggPT09IDApIHsKICAgICAgICB4LnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogVywKICAgICAgICAgIGhlaWdodDogWAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IEEgPSBkLmFycmFuZ2UodCwgZiwgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiBBLmJveGVzKQogICAgICAgIG8uc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBNID0gTWF0aC5tYXgoQS53aWR0aCArIEIgKiAyLCBrKSwgUCA9IEEuaGVpZ2h0ICsgSCArIE4gKiAyOwogICAgICB4LnNldCh0LCB7IHdpZHRoOiBNLCBoZWlnaHQ6IFAgfSk7CiAgICB9CiAgICBjb25zdCBnID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgeSA9IFtdOwogICAgZy5sZW5ndGggPiAwICYmICh5ID0gZC5hcnJhbmdlKG51bGwsIGcsIGUsIGgpLmJveGVzLm1hcCgodSkgPT4gKHsKICAgICAgLi4udSwKICAgICAgbG9jYWxYOiB1LmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IHUubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIHUsIGYsIEEsIE0pID0+IHsKICAgICAgdmFyIHY7CiAgICAgIGNvbnN0IFAgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IHUsIHk6IGYsIHdpZHRoOiBBLCBoZWlnaHQ6IE0gfTsKICAgICAgaWYgKFApIHsKICAgICAgICBpZiAoaVt0XSA9IGIsICh2ID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIHYuY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgYSA9IHUgKyBCLCBtID0gZiArIEggKyBOLCBwID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBUIG9mIHApIHsKICAgICAgICAgIGNvbnN0IEQgPSBvLmdldChUKTsKICAgICAgICAgIEQgJiYgQygKICAgICAgICAgICAgVCwKICAgICAgICAgICAgYSArIEQubG9jYWxYLAogICAgICAgICAgICBtICsgRC5sb2NhbFksCiAgICAgICAgICAgIEQud2lkdGgsCiAgICAgICAgICAgIEQuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIHkpCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gJC5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIGkpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiBpIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGMgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IGkgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghaSB8fCAhZS5jb250YWluZXJzW2ldKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgciA9IDEgKyBjKGkpOwogICAgICByZXR1cm4gZC5zZXQobiwgciksIHI7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGMobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgSiA9IDM2LCBHID0gMjg7CmNsYXNzIFEgewogIGNvbnN0cnVjdG9yKGUgPSB7fSkgewogICAgdGhpcy5vcHRpb25zID0gZTsKICB9CiAgYXJyYW5nZShlLCBkLCBjLCBuKSB7CiAgICBpZiAoZC5sZW5ndGggPT09IDApCiAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIGJveGVzOiBbXSB9OwogICAgY29uc3QgaSA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPz8gIlRCIiwgciA9IGkgPT09ICJUQiIgfHwgaSA9PT0gIkJUIiwgbCA9IGkgPT09ICJCVCIgfHwgaSA9PT0gIlJMIiwgcyA9IG5ldyBTZXQoZCksIEkgPSBbXSwgeCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICBmb3IgKGNvbnN0IGEgb2YgT2JqZWN0LnZhbHVlcyhjLmVkZ2VzKSkgewogICAgICBjb25zdCBtID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChhLnNvdXJjZUlkLCBzLCBjKSwgcCA9IHRoaXMucmVzb2x2ZVRvRGlyZWN0Q2hpbGQoYS50YXJnZXRJZCwgcywgYyk7CiAgICAgIGlmIChtICYmIHAgJiYgbSAhPT0gcCkgewogICAgICAgIGNvbnN0IFQgPSBgJHttfS0+JHtwfWA7CiAgICAgICAgeC5oYXMoVCkgfHwgKHguYWRkKFQpLCBJLnB1c2goeyBzb3VyY2VJZDogbSwgdGFyZ2V0SWQ6IHAgfSkpOwogICAgICB9CiAgICB9CiAgICBjb25zdCBvID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IGEgb2YgZCkKICAgICAgby5zZXQoYSwgMCksIGguc2V0KGEsIFtdKTsKICAgIGZvciAoY29uc3QgYSBvZiBJKQogICAgICBoLmdldChhLnNvdXJjZUlkKS5wdXNoKGEudGFyZ2V0SWQpLCBvLnNldChhLnRhcmdldElkLCAoby5nZXQoYS50YXJnZXRJZCkgfHwgMCkgKyAxKTsKICAgIGNvbnN0IGcgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCB5ID0gZC5maWx0ZXIoKGEpID0+IChvLmdldChhKSB8fCAwKSA9PT0gMCk7CiAgICBmb3IgKGNvbnN0IGEgb2YgeSkgZy5zZXQoYSwgMCk7CiAgICBjb25zdCBDID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyB5Lmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBhID0geS5zaGlmdCgpOwogICAgICBDLmFkZChhKTsKICAgICAgY29uc3QgbSA9IGcuZ2V0KGEpOwogICAgICBmb3IgKGNvbnN0IHAgb2YgaC5nZXQoYSkpIHsKICAgICAgICBjb25zdCBUID0gTWF0aC5tYXgoZy5nZXQocCkgfHwgMCwgbSArIDEpOwogICAgICAgIGcuc2V0KHAsIFQpLCBvLnNldChwLCBvLmdldChwKSAtIDEpLCBvLmdldChwKSA9PT0gMCAmJiB5LnB1c2gocCk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgYSBvZiBkKQogICAgICBDLmhhcyhhKSB8fCBnLnNldChhLCAwKTsKICAgIGNvbnN0IHcgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbYSwgbV0gb2YgZy5lbnRyaWVzKCkpCiAgICAgIHcuaGFzKG0pIHx8IHcuc2V0KG0sIFtdKSwgdy5nZXQobSkucHVzaChhKTsKICAgIGNvbnN0IHQgPSBBcnJheS5mcm9tKHcua2V5cygpKS5zb3J0KChhLCBtKSA9PiBhIC0gbSksIHUgPSBsID8gWy4uLnRdLnJldmVyc2UoKSA6IHQsIGYgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgbGV0IEEgPSAwOwogICAgZm9yIChjb25zdCBhIG9mIHUpIHsKICAgICAgY29uc3QgbSA9IHcuZ2V0KGEpOwogICAgICBsZXQgcCA9IDA7CiAgICAgIGZvciAobGV0IFQgPSAwOyBUIDwgbS5sZW5ndGg7IFQrKykgewogICAgICAgIGNvbnN0IEQgPSBuKG1bVF0pLCBfID0gciA/IEQud2lkdGggOiBELmhlaWdodDsKICAgICAgICBwICs9IF8gKyAoVCA+IDAgPyBHIDogMCk7CiAgICAgIH0KICAgICAgZi5zZXQoYSwgcCksIEEgPSBNYXRoLm1heChBLCBwKTsKICAgIH0KICAgIGNvbnN0IE0gPSBbXTsKICAgIGxldCBQID0gMDsKICAgIGZvciAoY29uc3QgYSBvZiB1KSB7CiAgICAgIGNvbnN0IG0gPSB3LmdldChhKTsKICAgICAgbGV0IHAgPSAwOwogICAgICBjb25zdCBUID0gZi5nZXQoYSkgfHwgMDsKICAgICAgbGV0IEQgPSBNYXRoLm1heCgwLCAoQSAtIFQpIC8gMik7CiAgICAgIGZvciAoY29uc3QgXyBvZiBtKSB7CiAgICAgICAgY29uc3QgUyA9IG4oXyksIEYgPSByID8gUy5oZWlnaHQgOiBTLndpZHRoLCBVID0gciA/IFMud2lkdGggOiBTLmhlaWdodCwgcSA9IHIgPyBEIDogUCwgSyA9IHIgPyBQIDogRDsKICAgICAgICBNLnB1c2goeyBpZDogXywgbG9jYWxYOiBxLCBsb2NhbFk6IEssIHdpZHRoOiBTLndpZHRoLCBoZWlnaHQ6IFMuaGVpZ2h0IH0pLCBEICs9IFUgKyBHLCBwID0gTWF0aC5tYXgocCwgRik7CiAgICAgIH0KICAgICAgUCArPSBwICsgSjsKICAgIH0KICAgIGNvbnN0IGIgPSBNYXRoLm1heCguLi5NLm1hcCgoYSkgPT4gYS5sb2NhbFggKyBhLndpZHRoKSwgMCksIHYgPSBNYXRoLm1heCguLi5NLm1hcCgoYSkgPT4gYS5sb2NhbFkgKyBhLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IGIsIGhlaWdodDogdiwgYm94ZXM6IE0gfTsKICB9CiAgLyoqCiAgICogQXNjZW5kcyB0aGUgZW50aXR5IGhpZXJhcmNoeSB0byBsb2NhdGUgdGhlIGRpcmVjdCBjaGlsZCBpbiB0aGlzIHNjb3BlCiAgICogdGhhdCBvd25zIG9yIGlzIHRoZSB0YXJnZXQgZW50aXR5LgogICAqLwogIHJlc29sdmVUb0RpcmVjdENoaWxkKGUsIGQsIGMpIHsKICAgIHZhciBpLCByOwogICAgbGV0IG4gPSBlOwogICAgZm9yICg7IG47ICkgewogICAgICBpZiAoZC5oYXMobikpIHJldHVybiBuOwogICAgICBuID0gKChpID0gYy5ub2Rlc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGkucGFyZW50SWQpID8/ICgociA9IGMuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IHIucGFyZW50SWQpID8/IG51bGw7CiAgICB9CiAgICByZXR1cm4gbnVsbDsKICB9Cn0KY29uc3QgTyA9IDMyLCBqID0gMjQ7CmNsYXNzIFogewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgYywgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IGkgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBzID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBzLndpZHRoLCBoZWlnaHQ6IHMuaGVpZ2h0IH07CiAgICB9KSwgciA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcoaSwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IHIud2lkdGgsIGhlaWdodDogci5oZWlnaHQsIGJveGVzOiByLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBjID0gZS5yZWR1Y2UoKG8sIGgpID0+IG8gKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKG8pID0+IG8ud2lkdGgpKSwgaSA9IFsuLi5lXS5zb3J0KChvLCBoKSA9PiBoLndpZHRoIC0gby53aWR0aCksIHIgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKG8sIGgpID0+IG8gKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogTzsKICAgIHIuYWRkKGwpLCByLmFkZChuKTsKICAgIGNvbnN0IHMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoYyAqIGQpKTsKICAgIHIuYWRkKHMpLCByLmFkZChzICogMC44NSksIHIuYWRkKHMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBvID0gMjsgbyA8PSBJOyBvKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCBnID0gMDsgZyA8IG8gJiYgZyA8IGkubGVuZ3RoOyBnKyspCiAgICAgICAgaCArPSBpW2ddLndpZHRoOwogICAgICBoICs9IChvIC0gMSkgKiBPLCBoID49IG4gJiYgci5hZGQoaCk7CiAgICB9CiAgICBsZXQgeCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IG8gb2YgcikgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIG8pLCBnID0gaC53aWR0aCAqIGguaGVpZ2h0LCB5ID0gTWF0aC5tYXgoMCwgZyAtIGMpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgdyA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSB5IC8gYyAqIDIgKyB3ICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICgheCB8fCB0IDwgeC5zY29yZSkgJiYgKHggPSBoKTsKICAgIH0KICAgIHJldHVybiB4OwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGMgPSBbLi4uZV0uc29ydCgocywgSSkgPT4gSS5oZWlnaHQgLSBzLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgaSA9IFtdOwogICAgZm9yIChjb25zdCBzIG9mIGMpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgeCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgcy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCBmID0gMCwgQSA9IDA7CiAgICAgICAgZm9yIChsZXQgTSA9IHQ7IE0gPCBuLmxlbmd0aCAmJiBBIDwgcy53aWR0aDsgTSsrKQogICAgICAgICAgZiA9IE1hdGgubWF4KGYsIG5bTV0ueSksIEEgKz0gbltNXS53aWR0aDsKICAgICAgICBmIDwgSSAmJiAoSSA9IGYsIHggPSB0KTsKICAgICAgfQogICAgICBpZiAoeCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKGYpID0+IGYueSkpLCB1ID0gdCA9PT0gMCA/IDAgOiB0ICsgajsKICAgICAgICBpLnB1c2goeyBpZDogcy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IHUsIHdpZHRoOiBzLndpZHRoLCBoZWlnaHQ6IHMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBzLndpZHRoICsgTywgeTogdSArIHMuaGVpZ2h0IH0pLCBkID4gcy53aWR0aCArIE8gJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IHMud2lkdGggKyBPLAogICAgICAgICAgd2lkdGg6IGQgLSAocy53aWR0aCArIE8pLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IG8gPSBuW3hdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyBqOwogICAgICBpLnB1c2goeyBpZDogcy5pZCwgbG9jYWxYOiBvLCBsb2NhbFk6IGgsIHdpZHRoOiBzLndpZHRoLCBoZWlnaHQ6IHMuaGVpZ2h0IH0pOwogICAgICBjb25zdCBnID0gcy53aWR0aCArIE8sIHkgPSBoICsgcy5oZWlnaHQsIEMgPSB7IHg6IG8sIHdpZHRoOiBnLCB5IH0sIHcgPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBvIHx8IHQueCA+PSBvICsgZyA/IHcucHVzaCh0KSA6ICh0LnggPCBvICYmIHcucHVzaCh7IHg6IHQueCwgd2lkdGg6IG8gLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IG8gKyBnICYmIHcucHVzaCh7CiAgICAgICAgICB4OiBvICsgZywKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKG8gKyBnKSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgdy5wdXNoKEMpLCB3LnNvcnQoKHQsIHUpID0+IHQueCAtIHUueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLncpOwogICAgfQogICAgY29uc3QgciA9IE1hdGgubWF4KC4uLmkubWFwKChzKSA9PiBzLmxvY2FsWCArIHMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLmkubWFwKChzKSA9PiBzLmxvY2FsWSArIHMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogciwgaGVpZ2h0OiBsLCBib3hlczogaSwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gTChFLCBlLCBkKSB7CiAgdmFyIGksIHI7CiAgbGV0IGMgPSBFLCBuID0gbnVsbDsKICBmb3IgKDsgYzsgKQogICAgZC5oYXMoYykgJiYgKG4gPSBjKSwgYyA9ICgoaSA9IGUubm9kZXNbY10pID09IG51bGwgPyB2b2lkIDAgOiBpLnBhcmVudElkKSA/PyAoKHIgPSBlLmNvbnRhaW5lcnNbY10pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gRTsKfQpjbGFzcyB0dCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBjKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCBpID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKG8pID0+ICEhby5jb2xsYXBzZWQpLm1hcCgobykgPT4gby5pZCkKICAgICksIHIgPSB7fTsKICAgIGZvciAoY29uc3QgW28sIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGcgPSBMKGguc291cmNlSWQsIGUsIGkpLCB5ID0gTChoLnRhcmdldElkLCBlLCBpKTsKICAgICAgZyAhPT0geSAmJiAocltvXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiBnLAogICAgICAgIHRhcmdldElkOiB5CiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IHIKICAgIH0sIHMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgeCA9IChjICE9IG51bGwgJiYgYy5tb2RlICYmIGMubW9kZSAhPT0gImF1dG8iID8gYy5tb2RlIDogcyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgWigoYyA9PSBudWxsID8gdm9pZCAwIDogYy5hc3BlY3RSYXRpbykgPz8gMS41NSkgOiBuZXcgUShjKTsKICAgIHJldHVybiBZLmV4ZWN1dGUobCwgeCwgZCk7CiAgfQp9CmNvbnN0IGV0ID0gbmV3IHR0KCk7CnNlbGYub25tZXNzYWdlID0gYXN5bmMgKEUpID0+IHsKICBjb25zdCB7IGlkOiBlLCBncmFwaDogZCwgbWVhc3VyZW1lbnRzOiBjLCBvcHRpb25zOiBuIH0gPSBFLmRhdGE7CiAgdHJ5IHsKICAgIGNvbnN0IGkgPSBuZXcgTWFwKGMpLCByID0gYXdhaXQgZXQuZXhlY3V0ZShkLCBpLCBuKTsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITAsIGxheW91dDogciB9KTsKICB9IGNhdGNoIChpKSB7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IGUsIHN1Y2Nlc3M6ICExLCBlcnJvcjogaS5tZXNzYWdlIH0pOwogIH0KfTsK", fe = (n) => Uint8Array.from(atob(n), (o) => o.charCodeAt(0)), Rt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", fe(Mt)], { type: "text/javascript;charset=utf-8" });
function we(n) {
  let o;
  try {
    if (o = Rt && (self.URL || self.webkitURL).createObjectURL(Rt), !o) throw "";
    const g = new Worker(o, {
      type: "module",
      name: n == null ? void 0 : n.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(o);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Mt,
      {
        type: "module",
        name: n == null ? void 0 : n.name
      }
    );
  }
}
class Be {
  constructor() {
    Ct(this, "worker", null);
    Ct(this, "pendingRequests", /* @__PURE__ */ new Map());
    Ct(this, "fallbackEngine", new ye());
    if (typeof Worker < "u")
      try {
        this.worker = new we(), this.worker.onmessage = (o) => {
          const { id: g, success: I, layout: s, error: i } = o.data, r = this.pendingRequests.get(g);
          r && (this.pendingRequests.delete(g), I ? r.resolve(s) : r.reject(new Error(i)));
        }, this.worker.onerror = (o) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", o);
        };
      } catch (o) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", o), this.worker = null;
      }
  }
  execute(o, g, I) {
    return this.worker ? new Promise((s, i) => {
      const r = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(r, { resolve: s, reject: i });
      const u = Array.from(g.entries());
      this.worker.postMessage({
        id: r,
        graph: o,
        measurements: u,
        options: I
      });
    }) : this.fallbackEngine.execute(o, g, I);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class be {
  canDrag() {
    return !0;
  }
  onDragMove(o) {
    return o.cursorWorld;
  }
  onDragEnd(o) {
    const { draggedEntity: g, hoveredEntity: I, graph: s } = o;
    return I && I.id === g.id ? null : I && s.containers[I.id] ? g.parentId === I.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: I.id
      }
    } : !I && g.parentId !== null && g.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: null
      }
    } : null;
  }
}
class Ne {
  constructor() {
    Ct(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(o) {
    return o.cursorWorld;
  }
  onDragEnd(o) {
    const { draggedEntity: g, hoveredEdge: I, hoveredEntity: s, cursorWorld: i, startWorldPos: r, graph: u } = o, a = Math.hypot(
      i.x - r.x,
      i.y - r.y
    );
    if (s && u.containers[s.id])
      return s.id !== g.id && g.parentId !== s.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: s.id
        }
      } : null;
    if (!s && !I) {
      const y = Object.values(u.edges).filter(
        (G) => G.targetId === g.id
      ), C = Object.values(u.edges).filter(
        (G) => G.sourceId === g.id
      );
      return y.length === 1 && C.length === 1 && y[0].sourceId !== C[0].targetId && a >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: y[0].id,
          outgoingEdgeId: C[0].id
        }
      } : a >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const b = (y) => {
      const C = u.nodes[y.id] || y;
      if (!C.ports || C.ports.length === 0) return "";
      const G = Object.values(u.edges).find((c) => c.targetId === y.id);
      if (G) {
        const c = C.ports.find((t) => t.id === G.targetPortId);
        if (c) return c.id;
      }
      const B = new Set(
        Object.values(u.edges).filter((c) => c.sourceId === y.id).map((c) => c.sourcePortId)
      ), K = C.ports.find((c) => !B.has(c.id));
      return K ? K.id : C.ports[0].id;
    };
    if (I)
      return I.sourceId === g.id || I.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: I.id,
          newSourceId: I.sourceId,
          newTargetId: g.id,
          newTargetPortId: b(g)
        }
      };
    if (s && s.id !== g.id && u.nodes[s.id]) {
      const y = Object.values(u.edges).find(
        (C) => C.targetId === s.id && C.sourceId !== g.id
      );
      if (y)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: y.id,
            newSourceId: y.sourceId,
            newTargetId: g.id,
            newTargetPortId: b(g)
          }
        };
    }
    return null;
  }
}
function me(n, o = { min: 0.15, max: 3 }) {
  const [g, I] = J({ x: 80, y: 80, zoom: 1 }), s = tt(!1), i = tt({ x: 0, y: 0 }), r = R(
    (c, t) => {
      if (!n.current) return { x: c, y: t };
      const e = n.current.getBoundingClientRect();
      return {
        x: (c - e.left - g.x) / g.zoom,
        y: (t - e.top - g.y) / g.zoom
      };
    },
    [g, n]
  ), u = R(
    (c) => {
      if (!n.current) return;
      const t = [
        ...Object.values(c.nodes),
        ...Object.values(c.containers)
      ];
      if (t.length === 0) {
        I({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let e = 1 / 0, d = 1 / 0, h = -1 / 0, A = -1 / 0;
      for (const W of t)
        e = Math.min(e, W.x), d = Math.min(d, W.y), h = Math.max(h, W.x + W.width), A = Math.max(A, W.y + W.height);
      const l = n.current.getBoundingClientRect(), L = 80, f = Math.max(h - e, 100), v = Math.max(A - d, 100), p = (l.width - L * 2) / f, x = (l.height - L * 2) / v, S = Math.min(
        Math.max(Math.min(p, x), o.min),
        Math.min(o.max, 1.25)
      ), E = (l.width - f * S) / 2 - e * S, P = (l.height - v * S) / 2 - d * S;
      I({
        x: E,
        y: P,
        zoom: S
      });
    },
    [n, o]
  ), a = R(
    (c) => {
      if (c.preventDefault(), !!n.current)
        if (c.ctrlKey || c.metaKey) {
          const t = n.current.getBoundingClientRect(), e = c.clientX - t.left, d = c.clientY - t.top, h = c.deltaY < 0 ? 1.08 : 0.92, A = Math.min(Math.max(g.zoom * h, o.min), o.max), l = e - (e - g.x) * (A / g.zoom), L = d - (d - g.y) * (A / g.zoom);
          I({ x: l, y: L, zoom: A });
        } else
          I((t) => ({
            ...t,
            x: t.x - c.deltaX,
            y: t.y - c.deltaY
          }));
    },
    [g, o, n]
  ), b = R(
    (c, t) => {
      s.current = !0, i.current = { x: c - g.x, y: t - g.y };
    },
    [g]
  ), y = R((c, t) => {
    s.current && I((e) => ({
      ...e,
      x: c - i.current.x,
      y: t - i.current.y
    }));
  }, []), C = R(() => {
    s.current = !1;
  }, []), G = R(() => {
    I({ x: 80, y: 80, zoom: 1 });
  }, []), B = R(() => {
    I((c) => ({
      ...c,
      zoom: Math.min(c.zoom * 1.2, o.max)
    }));
  }, [o]), K = R(() => {
    I((c) => ({
      ...c,
      zoom: Math.max(c.zoom / 1.2, o.min)
    }));
  }, [o]);
  return {
    transform: g,
    setTransform: I,
    screenToWorld: r,
    onWheel: a,
    startPan: b,
    updatePan: y,
    endPan: C,
    resetTransform: G,
    zoomIn: B,
    zoomOut: K,
    zoomToFit: u,
    isPanning: s
  };
}
function Ge(n) {
  const [o, g] = J(
    /* @__PURE__ */ new Map()
  );
  tt(/* @__PURE__ */ new Map());
  const I = tt(/* @__PURE__ */ new Map()), s = R((i, r) => {
    r ? I.current.set(i, r) : I.current.delete(i);
  }, []);
  return bt(() => {
    const i = new ResizeObserver((r) => {
      let u = !1;
      const a = new Map(o);
      for (const b of r) {
        const y = b.target.getAttribute("data-sysflow-measure-id");
        if (!y) continue;
        const C = Math.ceil(b.contentRect.width), G = Math.ceil(b.contentRect.height), B = a.get(y);
        (!B || B.width !== C || B.height !== G) && (a.set(y, { width: C, height: G }), u = !0);
      }
      u && g(a);
    });
    return I.current.forEach((r) => i.observe(r)), () => {
      i.disconnect();
    };
  }, [n]), { measurements: o, registerMeasureElement: s };
}
function pe(n, o, g, I, s) {
  const [i, r] = J(null), [u, a] = J(null), b = tt(null), y = tt(null), C = R(
    (t, e) => {
      let d = null, h = 1 / 0;
      for (const [A, l] of Object.entries(o.containers))
        if (A !== e && t.x >= l.x && t.x <= l.x + l.width && t.y >= l.y && t.y <= l.y + l.height) {
          const L = l.width * l.height;
          L < h && (h = L, d = n.containers[A] || null);
        }
      if (d) return d;
      for (const [A, l] of Object.entries(o.nodes))
        if (A !== e && t.x >= l.x && t.x <= l.x + l.width && t.y >= l.y && t.y <= l.y + l.height)
          return n.nodes[A] || null;
      return null;
    },
    [o, n]
  ), G = R(
    (t, e) => {
      let d = null, h = 45;
      for (const A of Object.values(n.edges)) {
        if (A.sourceId === e || A.targetId === e) continue;
        const l = o.nodes[A.sourceId] || o.containers[A.sourceId], L = o.nodes[A.targetId] || o.containers[A.targetId];
        if (!l || !L) continue;
        const f = l.x + l.width, v = l.y + l.height / 2, p = L.x, x = L.y + L.height / 2;
        for (let S = 0; S <= 10; S++) {
          const E = S / 10, P = (1 - E) * f + E * p, W = (1 - E) * v + E * x, Y = Math.hypot(t.x - P, t.y - W);
          Y < h && (h = Y, d = A);
        }
      }
      return d;
    },
    [o, n]
  ), B = R(
    (t, e) => {
      if (e.stopPropagation(), g.canDrag && !g.canDrag(t, n))
        return;
      const d = I(e.clientX, e.clientY);
      r({
        draggedEntity: t,
        ghostPosition: d,
        startPosition: d
      });
    },
    [n, g, I]
  ), K = R(
    (t) => {
      if (!i) return;
      const e = I(t.clientX, t.clientY), d = C(e, i.draggedEntity.id), h = G(e, i.draggedEntity.id);
      b.current = d, y.current = h, d && n.containers[d.id] ? a(d.id) : a(null);
      const A = g.onDragMove ? g.onDragMove({
        draggedEntity: i.draggedEntity,
        cursorWorld: e,
        startWorldPos: i.startPosition,
        hoveredEntity: d,
        hoveredEdge: h,
        graph: n,
        layout: o
      }) : e;
      A && r((l) => l ? { ...l, ghostPosition: A } : null);
    },
    [i, I, g, n, o, C, G]
  ), c = R(
    (t) => {
      if (!i) return;
      const e = I(t.clientX, t.clientY), d = C(e, i.draggedEntity.id), h = G(e, i.draggedEntity.id), A = g.onDragEnd({
        draggedEntity: i.draggedEntity,
        cursorWorld: e,
        startWorldPos: i.startPosition,
        hoveredEntity: d,
        hoveredEdge: h,
        graph: n,
        layout: o
      });
      A && s(A), r(null), a(null), b.current = null, y.current = null;
    },
    [i, I, g, n, o, C, G, s]
  );
  return {
    dragState: i,
    hoveredContainerId: u,
    handlePointerDown: B,
    handlePointerMove: K,
    handlePointerUp: c
  };
}
function ve(n) {
  const [o, g] = J({
    history: [n],
    index: 0
  }), [I, s] = J(null), i = o.history[o.index] ?? o.history[0] ?? n, r = R((c) => {
    const t = Zt(c);
    g((e) => {
      const d = e.history.slice(0, e.index + 1);
      return {
        history: [...d, t],
        index: d.length
      };
    });
  }, []), u = R((c) => {
    const t = Zt(c);
    g({
      history: [t],
      index: 0
    });
  }, []), a = R(() => {
    g((c) => ({
      ...c,
      index: Math.max(0, c.index - 1)
    }));
  }, []), b = R(() => {
    g((c) => ({
      ...c,
      index: Math.min(c.history.length - 1, c.index + 1)
    }));
  }, []), y = R(
    (c) => {
      var e, d, h, A;
      const t = i;
      if (c.type === "ENTITY_REPARENT") {
        const { entityId: l, newParentId: L } = c.payload, f = {
          ...t,
          nodes: { ...t.nodes },
          containers: { ...t.containers }
        };
        f.nodes[l] ? f.nodes[l] = { ...f.nodes[l], parentId: L } : f.containers[l] && (f.containers[l] = { ...f.containers[l], parentId: L }), r(f);
      } else if (c.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: l, direction: L, suggestedNewNodeId: f, suggestedNewEdge1Id: v, suggestedNewEdge2Id: p } = c.payload, x = t.edges[l.id];
        if (!x) return;
        const S = L === "BT", E = L === "TB", P = `p_in_${Date.now()}`, W = `p_out_${Date.now()}`;
        let Y = "left", T = "right";
        S ? (Y = "bottom", T = "top") : E ? (Y = "top", T = "bottom") : L === "RL" && (Y = "right", T = "left");
        const w = t.nodes[x.sourceId], O = {
          id: f,
          label: `Node ${Object.keys(t.nodes).length + 1}`,
          type: (w == null ? void 0 : w.type) || "FlowTask",
          parentId: (w == null ? void 0 : w.parentId) ?? null,
          ports: [
            { id: P, label: "in", side: Y },
            { id: W, label: "out", side: T }
          ]
        }, Q = {
          id: v,
          sourceId: x.sourceId,
          sourcePortId: x.sourcePortId,
          targetId: f,
          targetPortId: P
        }, N = {
          id: p,
          sourceId: f,
          sourcePortId: W,
          targetId: x.targetId,
          targetPortId: x.targetPortId
        }, _ = { ...t.edges };
        delete _[x.id], _[v] = Q, _[p] = N, r({
          ...t,
          nodes: { ...t.nodes, [f]: O },
          edges: _
        });
      } else if (c.type === "NODE_EXTRACT") {
        const { incomingEdgeId: l, outgoingEdgeId: L } = c.payload, f = t.edges[l], v = t.edges[L];
        if (!f || !v) return;
        const p = { ...t.edges };
        p[l] = {
          ...f,
          targetId: v.targetId,
          targetPortId: v.targetPortId
        }, delete p[L], r({
          ...t,
          edges: p
        });
      } else if (c.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: l, position: L, direction: f, suggestedNewNodeId: v, suggestedNewEdgeId: p } = c.payload, x = f === "BT", S = `p_in_${Date.now()}`, E = `p_out_${Date.now()}`, P = {
          id: v,
          label: `Node ${Object.keys(t.nodes).length + 1}`,
          type: l.type,
          ports: [
            { id: S, label: "in", side: x ? "bottom" : "top" },
            { id: E, label: "out", side: x ? "top" : "bottom" }
          ]
        }, W = l.ports.find((O) => O.label === "in") || l.ports[0], Y = l.ports.find((O) => O.label === "out") || l.ports[l.ports.length - 1];
        let T;
        x && L === "bottom" || !x && L === "top" ? T = {
          id: p,
          sourceId: v,
          sourcePortId: E,
          targetId: l.id,
          targetPortId: (W == null ? void 0 : W.id) || "in"
        } : T = {
          id: p,
          sourceId: l.id,
          sourcePortId: (Y == null ? void 0 : Y.id) || "out",
          targetId: v,
          targetPortId: S
        }, r({
          ...t,
          nodes: { ...t.nodes, [v]: P },
          edges: { ...t.edges, [p]: T }
        });
      } else if (c.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: l, collapsed: L } = c.payload;
        t.containers[l] && r({
          ...t,
          containers: {
            ...t.containers,
            [l]: { ...t.containers[l], collapsed: L }
          }
        });
      } else if (c.type === "EDGE_CREATE") {
        const l = c.payload.id || `E_${Date.now()}`;
        r({
          ...t,
          edges: {
            ...t.edges,
            [l]: { id: l, ...c.payload.edge }
          }
        });
      } else if (c.type === "EDGE_DELETE") {
        const l = { ...t.edges };
        delete l[c.payload.edgeId], r({ ...t, edges: l });
      } else if (c.type === "EDGE_REWIRE") {
        const { edgeId: l, newTargetId: L } = c.payload;
        if (!L || !t.edges[l]) return;
        const f = L, v = t.edges[l], p = v.targetId, x = Object.values(t.edges).find((T) => T.targetId === f), S = Object.values(t.edges).find((T) => T.sourceId === f), E = { ...t.edges };
        x && S && (E[x.id] = {
          ...x,
          targetId: S.targetId,
          targetPortId: S.targetPortId
        }, delete E[S.id]);
        const P = ((d = (e = t.nodes[f]) == null ? void 0 : e.ports[0]) == null ? void 0 : d.id) || "p_in", W = ((A = (h = t.nodes[f]) == null ? void 0 : h.ports.find((T) => T.id !== P)) == null ? void 0 : A.id) || P;
        E[l] = {
          ...v,
          targetId: f,
          targetPortId: P
        };
        const Y = `REWIRE_${Date.now()}`;
        E[Y] = {
          id: Y,
          sourceId: f,
          sourcePortId: W,
          targetId: p,
          targetPortId: v.targetPortId
        }, r({ ...t, edges: E });
      }
    },
    [i, r]
  ), C = R(
    (c) => {
      const t = i.nodes[c] || i.containers[c];
      t && s({ entity: JSON.parse(JSON.stringify(t)), isCut: !1 });
    },
    [i]
  ), G = R(
    (c) => {
      const t = i.nodes[c] || i.containers[c];
      if (t) {
        s({ entity: JSON.parse(JSON.stringify(t)), isCut: !0 });
        const e = { ...i.nodes }, d = { ...i.containers };
        delete e[c], delete d[c], r({ ...i, nodes: e, containers: d });
      }
    },
    [i, r]
  ), B = R(() => {
    if (!I) return;
    const c = I.entity, t = `${c.id}_copy_${Date.now().toString().slice(-4)}`, e = { ...c, id: t, label: `${c.label} (Copy)` };
    "collapsed" in e ? r({
      ...i,
      containers: { ...i.containers, [t]: e }
    }) : r({
      ...i,
      nodes: { ...i.nodes, [t]: e }
    });
  }, [I, i, r]), K = R(
    (c) => {
      if (c.length === 0) return;
      const t = { ...i.nodes }, e = { ...i.containers }, d = { ...i.edges };
      for (const h of c)
        delete t[h], delete e[h], delete d[h];
      r({
        ...i,
        nodes: t,
        containers: e,
        edges: d
      });
    },
    [i, r]
  );
  return {
    graph: i,
    setGraphDirect: u,
    applyAction: y,
    undo: a,
    redo: b,
    copyEntity: C,
    cutEntity: G,
    pasteEntity: B,
    deleteSelection: K,
    canUndo: o.index > 0,
    canRedo: o.index < o.history.length - 1
  };
}
const xe = ({
  graph: n,
  registerMeasureElement: o,
  nodeTypes: g,
  containerTypes: I
}) => {
  const s = Object.values(n.nodes), i = Object.values(n.containers);
  return /* @__PURE__ */ $("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    s.map((r) => {
      const u = r.type ? g == null ? void 0 : g[r.type] : null;
      return /* @__PURE__ */ H(
        "div",
        {
          ref: (a) => o(r.id, a),
          "data-sysflow-measure-id": r.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: u ? /* @__PURE__ */ H(u, { node: r, selected: !1 }) : /* @__PURE__ */ $("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ H("div", { style: { fontWeight: 600 }, children: r.label }),
            r.ports.length > 0 && /* @__PURE__ */ $("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              r.ports.map((a) => a.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${r.id}`
      );
    }),
    i.map((r) => {
      const u = r.type ? I == null ? void 0 : I[r.type] : null;
      return /* @__PURE__ */ H(
        "div",
        {
          ref: (a) => o(r.id, a),
          "data-sysflow-measure-id": r.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: u ? /* @__PURE__ */ H(u, { container: r, selected: !1 }) : /* @__PURE__ */ H("div", { className: "sysflow-container-header", children: r.label })
        },
        `measure-container-${r.id}`
      );
    })
  ] });
}, Le = ({
  graph: n,
  layout: o,
  selectedIds: g,
  direction: I = "TB",
  showArrows: s = !0,
  routing: i = "auto",
  portOptions: r,
  enableEdgeQuickAdd: u = !0,
  onEdgeClick: a,
  onInsertNodeOnEdge: b
}) => {
  const [y, C] = J(null), G = i === "step" || i === "auto" && (I === "LR" || I === "RL"), B = (t, e, d) => {
    var P, W, Y, T;
    let h = t, A = null;
    for ((P = n.containers[t]) != null && P.collapsed && (A = n.containers[t]); h; ) {
      const w = ((W = n.nodes[h]) == null ? void 0 : W.parentId) ?? ((Y = n.containers[h]) == null ? void 0 : Y.parentId) ?? null;
      w && ((T = n.containers[w]) != null && T.collapsed) && (A = n.containers[w]), h = w;
    }
    if (A) {
      const w = o.containers[A.id];
      if (!w)
        return { x: 0, y: 0, side: d ? "right" : "left", valid: !1, entityId: A.id };
      let O, Q, N;
      return I === "TB" ? (O = d ? "bottom" : "top", Q = w.x + w.width / 2, N = d ? w.y + w.height : w.y) : I === "BT" ? (O = d ? "top" : "bottom", Q = w.x + w.width / 2, N = d ? w.y : w.y + w.height) : I === "RL" ? (O = d ? "left" : "right", Q = d ? w.x : w.x + w.width, N = w.y + w.height / 2) : (O = d ? "right" : "left", Q = d ? w.x + w.width : w.x, N = w.y + w.height / 2), { x: Q, y: N, side: O, valid: !0, entityId: A.id };
    }
    if (!!n.containers[t]) {
      const w = o.containers[t];
      if (!w) return { x: 0, y: 0, side: d ? "right" : "left", valid: !1, entityId: t };
      let O, Q, N;
      return I === "TB" ? (O = w.x + w.width / 2, Q = d ? w.y + w.height : w.y, N = d ? "bottom" : "top") : I === "BT" ? (O = w.x + w.width / 2, Q = d ? w.y : w.y + w.height, N = d ? "top" : "bottom") : I === "RL" ? (O = d ? w.x : w.x + w.width, Q = w.y + w.height / 2, N = d ? "left" : "right") : (O = d ? w.x + w.width : w.x, Q = w.y + w.height / 2, N = d ? "right" : "left"), { x: O, y: Q, side: N, valid: !0, entityId: t };
    }
    const L = n.nodes[t], f = o.nodes[t];
    if (!L || !f)
      return { x: 0, y: 0, side: d ? "right" : "left", valid: !1, entityId: t };
    const p = Gt(
      L,
      f,
      I,
      n.edges,
      r
    ).get(e);
    if (p)
      return { x: p.worldX, y: p.worldY, side: p.side, valid: !0, entityId: t };
    let x, S, E;
    return I === "TB" ? (x = f.x + f.width / 2, S = d ? f.y + f.height : f.y, E = d ? "bottom" : "top") : I === "BT" ? (x = f.x + f.width / 2, S = d ? f.y : f.y + f.height, E = d ? "top" : "bottom") : I === "RL" ? (x = d ? f.x : f.x + f.width, S = f.y + f.height / 2, E = d ? "left" : "right") : (x = d ? f.x + f.width : f.x, S = f.y + f.height / 2, E = d ? "right" : "left"), { x, y: S, side: E, valid: !0, entityId: t };
  }, K = (t, e) => {
    const d = (t.x + e.x) / 2, h = (t.y + e.y) / 2;
    if (t.side === "right" && e.side === "left") {
      if (e.x >= t.x + 20)
        return {
          pathStr: `M ${t.x} ${t.y} L ${d} ${t.y} L ${d} ${e.y} L ${e.x} ${e.y}`,
          center: { x: d, y: h }
        };
      {
        const A = e.y >= t.y ? t.y - 40 : t.y + 40;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x + 20} ${t.y} L ${t.x + 20} ${A} L ${e.x - 20} ${A} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: d, y: A }
        };
      }
    }
    if (t.side === "left" && e.side === "right") {
      if (e.x <= t.x - 20)
        return {
          pathStr: `M ${t.x} ${t.y} L ${d} ${t.y} L ${d} ${e.y} L ${e.x} ${e.y}`,
          center: { x: d, y: h }
        };
      {
        const A = e.y >= t.y ? t.y - 40 : t.y + 40;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x - 20} ${t.y} L ${t.x - 20} ${A} L ${e.x + 20} ${A} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: d, y: A }
        };
      }
    }
    if (t.side === "bottom" && e.side === "top") {
      if (e.y >= t.y + 16)
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${h} L ${e.x} ${h} L ${e.x} ${e.y}`,
          center: { x: d, y: h }
        };
      {
        const A = e.x >= t.x ? t.x + 50 : t.x - 50;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${A} ${t.y + 20} L ${A} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`,
          center: { x: A, y: h }
        };
      }
    }
    if (t.side === "top" && e.side === "bottom") {
      if (e.y <= t.y - 16)
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${h} L ${e.x} ${h} L ${e.x} ${e.y}`,
          center: { x: d, y: h }
        };
      {
        const A = e.x >= t.x ? t.x + 50 : t.x - 50;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${t.y - 20} L ${A} ${t.y - 20} L ${A} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`,
          center: { x: A, y: h }
        };
      }
    }
    return {
      pathStr: `M ${t.x} ${t.y} L ${d} ${t.y} L ${d} ${e.y} L ${e.x} ${e.y}`,
      center: { x: d, y: h }
    };
  }, c = (t, e) => {
    const d = e.x - t.x, h = e.y - t.y;
    let A = t.x, l = t.y, L = e.x, f = e.y;
    if (t.side === "bottom" && e.side === "top")
      if (h > 0) {
        const x = Math.min(28, h * 0.4);
        l = t.y + Math.max(x, h * 0.5), f = e.y - Math.max(x, h * 0.5);
      } else {
        const x = d >= 0 ? 1 : -1, S = Math.max(40, Math.abs(d) * 0.2);
        A = t.x + S * x, l = t.y + 40, L = e.x + S * x, f = e.y - 40;
      }
    else if (t.side === "top" && e.side === "bottom")
      if (h < 0) {
        const x = Math.min(28, Math.abs(h) * 0.4);
        l = t.y - Math.max(x, Math.abs(h) * 0.5), f = e.y + Math.max(x, Math.abs(h) * 0.5);
      } else {
        const x = d >= 0 ? 1 : -1, S = Math.max(40, Math.abs(d) * 0.2);
        A = t.x + S * x, l = t.y - 40, L = e.x + S * x, f = e.y + 40;
      }
    else if (t.side === "right" && e.side === "left")
      d > 0 ? (A = t.x + d * 0.5, L = e.x - d * 0.5) : (A = t.x + 50, l = t.y - 50, L = e.x - 50, f = e.y - 50);
    else if (t.side === "left" && e.side === "right")
      d < 0 ? (A = t.x + d * 0.5, L = e.x - d * 0.5) : (A = t.x - 50, l = t.y - 50, L = e.x + 50, f = e.y - 50);
    else {
      const x = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, S = x[t.side] || { x: 0, y: 1 }, E = x[e.side] || { x: 0, y: -1 }, P = Math.min(60, Math.hypot(d, h) * 0.35);
      A = t.x + S.x * P, l = t.y + S.y * P, L = e.x + E.x * P, f = e.y + E.y * P;
    }
    const v = 0.125 * t.x + 0.375 * A + 0.375 * L + 0.125 * e.x, p = 0.125 * t.y + 0.375 * l + 0.375 * f + 0.125 * e.y;
    return {
      pathStr: `M ${t.x} ${t.y} C ${A} ${l} ${L} ${f} ${e.x} ${e.y}`,
      center: { x: v, y: p }
    };
  };
  return /* @__PURE__ */ $("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ $("defs", { children: [
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
    Object.values(n.edges).map((t) => {
      const e = B(t.sourceId, t.sourcePortId, !0), d = B(t.targetId, t.targetPortId, !1);
      if (!e.valid || !d.valid || e.entityId === d.entityId) return null;
      const h = g.includes(t.id), A = y === t.id, { pathStr: l, center: L } = G ? K(e, d) : c(e, d);
      return /* @__PURE__ */ $(
        "g",
        {
          onMouseEnter: () => C(t.id),
          onMouseLeave: () => C(null),
          children: [
            /* @__PURE__ */ H(
              "path",
              {
                d: l,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (f) => {
                  f.stopPropagation(), a == null || a(t.id);
                }
              }
            ),
            /* @__PURE__ */ H(
              "path",
              {
                d: l,
                fill: "none",
                stroke: h ? "var(--sysflow-edge-selected)" : A ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: h ? 2.5 : A ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: s ? h ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            u && A && b && /* @__PURE__ */ H("g", { transform: `translate(${L.x}, ${L.y})`, children: /* @__PURE__ */ $(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (f) => {
                  f.preventDefault(), f.stopPropagation(), b(t);
                },
                children: [
                  /* @__PURE__ */ H("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ H(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ H(
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
  entity: n,
  layout: o,
  direction: g = "LR",
  edges: I,
  portOptions: s,
  onPortPointerDown: i,
  onPortPointerUp: r
}) => {
  if (!n.ports || n.ports.length === 0)
    return null;
  const u = Gt(
    n,
    o,
    g,
    I,
    s
  );
  return /* @__PURE__ */ H(mt, { children: n.ports.map((a) => {
    const b = u.get(a.id);
    return b ? /* @__PURE__ */ H(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${b.side}`,
        style: {
          position: "absolute",
          left: `${b.localX}px`,
          top: `${b.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${a.label} (${b.side})`,
        onPointerDown: (y) => {
          y.stopPropagation(), i == null || i(n.id, a.id, !0, y);
        },
        onPointerUp: (y) => {
          y.stopPropagation(), r == null || r(n.id, a.id, !1);
        }
      },
      a.id
    ) : null;
  }) });
}, Ke = ({
  node: n,
  layout: o,
  selected: g = !1,
  direction: I = "LR",
  edges: s,
  portOptions: i,
  enableQuickAdd: r = !1,
  onAddConnectedNode: u,
  onPointerDown: a,
  onMouseEnter: b,
  onMouseLeave: y,
  onClick: C,
  onPortPointerDown: G,
  onPortPointerUp: B,
  customRenderer: K
}) => {
  const [c, t] = J(!1);
  return /* @__PURE__ */ $(
    "div",
    {
      className: `sysflow-node ${g ? "sysflow-selected" : ""} ${n.className || ""}`,
      style: {
        transform: `translate(${o.x}px, ${o.y}px)`,
        width: `${o.width}px`,
        height: `${o.height}px`
      },
      onPointerDown: (e) => a == null ? void 0 : a(n, e),
      onMouseEnter: () => {
        t(!0), b == null || b(n.id);
      },
      onMouseLeave: () => {
        t(!1), y == null || y(n.id);
      },
      onClick: C,
      children: [
        r && c && /* @__PURE__ */ $(mt, { children: [
          /* @__PURE__ */ H("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ H("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        r && c && u && /* @__PURE__ */ H(
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
              e.preventDefault(), e.stopPropagation(), u(n, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ H(
          Se,
          {
            entity: n,
            layout: o,
            direction: I,
            edges: s,
            portOptions: i,
            onPortPointerDown: G,
            onPortPointerUp: B
          }
        ),
        K ? /* @__PURE__ */ H(K, { node: n, selected: g }) : /* @__PURE__ */ $("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ H("div", { style: { fontWeight: 600, fontSize: "13px" }, children: n.label }),
          n.ports.length > 0 && /* @__PURE__ */ $("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            n.ports.length,
            " Port",
            n.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        r && c && u && /* @__PURE__ */ H(
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
              e.preventDefault(), e.stopPropagation(), u(n, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Ze = ({
  container: n,
  layout: o,
  selected: g,
  isHovered: I = !1,
  hasChildren: s = !1,
  onToggleCollapse: i,
  onPointerDown: r,
  onMouseEnter: u,
  onMouseLeave: a,
  onClick: b,
  customRenderer: y
}) => /* @__PURE__ */ H(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${I ? "sysflow-hovered" : ""} ${n.className || ""}`,
    style: {
      transform: `translate(${o.x}px, ${o.y}px)`,
      width: `${o.width}px`,
      height: `${o.height}px`
    },
    onPointerDown: (C) => r(n, C),
    onMouseEnter: u,
    onMouseLeave: a,
    onClick: b,
    children: y ? /* @__PURE__ */ H(y, { container: n, selected: g }) : /* @__PURE__ */ $(mt, { children: [
      /* @__PURE__ */ $("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ H("span", { className: "sysflow-container-title", title: n.label, children: n.label }),
        /* @__PURE__ */ H(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (C) => C.stopPropagation(),
            onPointerUp: (C) => C.stopPropagation(),
            onClick: (C) => {
              C.stopPropagation(), i(n.id, !n.collapsed);
            },
            children: n.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !n.collapsed && !s && /* @__PURE__ */ H("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Ee = new be(), Ye = ({
  graph: n,
  onChange: o,
  layoutEngine: g,
  interactionStrategy: I = Ee,
  direction: s = "TB",
  layoutOptions: i,
  portPlacementMode: r,
  routing: u,
  showEdgeArrows: a = !0,
  nodeTypes: b,
  containerTypes: y,
  zoomBounds: C,
  className: G = "",
  selectedIds: B = [],
  theme: K = "dark",
  enableQuickAdd: c,
  enableEdgeQuickAdd: t
}) => {
  var Lt, St;
  const e = tt(null), d = tt(null);
  !g && !d.current && (d.current = new Be());
  const h = g || d.current, {
    transform: A,
    screenToWorld: l,
    onWheel: L,
    startPan: f,
    updatePan: v,
    endPan: p,
    resetTransform: x,
    zoomIn: S,
    zoomOut: E,
    zoomToFit: P,
    isPanning: W
  } = me(e, C), { measurements: Y, registerMeasureElement: T } = Ge(n), [w, O] = J({ nodes: {}, containers: {} }), Q = re(() => ({
    direction: s,
    mode: r ?? (s === "TB" || s === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: w.nodes
  }), [s, r, w.nodes]), [N, _] = J(null), [z, ht] = J(null), yt = tt(!1), {
    dragState: et,
    hoveredContainerId: Xt,
    handlePointerDown: xt,
    handlePointerMove: Tt,
    handlePointerUp: Ot
  } = pe(n, w, I, l, o);
  bt(() => {
    const m = (Z) => {
      if (Z.target instanceof HTMLInputElement || Z.target instanceof HTMLTextAreaElement)
        return;
      if (Z.key === "Escape") {
        Z.preventDefault(), ht(null), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (Z.code === "Space" && (yt.current = !0), Z.key.toLowerCase() === "f" && !Z.ctrlKey && !Z.metaKey) {
        Z.preventDefault(), P(w);
        return;
      }
      if ((Z.ctrlKey || Z.metaKey) && Z.key.toLowerCase() === "a") {
        Z.preventDefault();
        const V = [
          ...Object.keys(n.nodes),
          ...Object.keys(n.containers)
        ];
        o({ type: "SELECTION_CHANGE", payload: { selectedIds: V } });
        return;
      }
      const k = Object.keys(n.nodes);
      if (k.length !== 0) {
        if (Z.key === "Tab") {
          Z.preventDefault();
          const V = B.length > 0 ? k.indexOf(B[0]) : -1;
          let X;
          Z.shiftKey ? X = V <= 0 ? k.length - 1 : V - 1 : X = (V + 1) % k.length, o({ type: "SELECTION_CHANGE", payload: { selectedIds: [k[X]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(Z.key)) {
          Z.preventDefault();
          const V = B[0] || k[0], X = w.nodes[V] || w.containers[V];
          if (!X) return;
          const U = {
            x: X.x + X.width / 2,
            y: X.y + X.height / 2
          };
          let M = null, st = 1 / 0;
          for (const it of k) {
            if (it === V) continue;
            const ot = w.nodes[it];
            if (!ot) continue;
            const It = {
              x: ot.x + ot.width / 2,
              y: ot.y + ot.height / 2
            }, dt = It.x - U.x, nt = It.y - U.y;
            let q = !1;
            if (Z.key === "ArrowRight" && dt > 20 && (q = !0), Z.key === "ArrowLeft" && dt < -20 && (q = !0), Z.key === "ArrowDown" && nt > 20 && (q = !0), Z.key === "ArrowUp" && nt < -20 && (q = !0), q) {
              const F = Math.hypot(dt, nt);
              F < st && (st = F, M = it);
            }
          }
          M && o({ type: "SELECTION_CHANGE", payload: { selectedIds: [M] } });
        }
      }
    }, D = (Z) => {
      Z.code === "Space" && (yt.current = !1);
    };
    return window.addEventListener("keydown", m), window.addEventListener("keyup", D), () => {
      window.removeEventListener("keydown", m), window.removeEventListener("keyup", D);
    };
  }, [n, w, B, P, o]), bt(() => {
    let m = !1, D = 16 / 9;
    if (e.current) {
      const k = e.current.getBoundingClientRect();
      k.width > 0 && k.height > 0 && (D = k.width / k.height);
    }
    const Z = {
      direction: s,
      aspectRatio: D,
      ...i
    };
    return h.execute(n, Y, Z).then((k) => {
      m || O(k);
    }), () => {
      m = !0;
    };
  }, [n, Y, h, s, i]);
  const Vt = (m, D, Z, k) => {
    const V = n.nodes[m] || n.containers[m], X = w.nodes[m] || w.containers[m];
    if (!V || !X) return;
    const M = Gt(
      V,
      X,
      s,
      n.edges,
      Q
    ).get(D), st = M ? { x: M.worldX, y: M.worldY } : { x: X.x + X.width, y: X.y + X.height / 2 };
    _({
      sourceId: m,
      sourcePortId: D,
      startWorldPos: st,
      currentWorldPos: l(k.clientX, k.clientY)
    });
  }, Qt = (m, D, Z) => {
    var k, V, X, U, M, st, it, ot, It, dt;
    if (N && N.sourceId !== m) {
      const nt = n.nodes[N.sourceId] || n.containers[N.sourceId], q = n.nodes[m] || n.containers[m], F = (k = nt == null ? void 0 : nt.ports) == null ? void 0 : k.find((rt) => rt.id === N.sourcePortId), j = (V = q == null ? void 0 : q.ports) == null ? void 0 : V.find((rt) => rt.id === D);
      let ct = N.sourceId, At = N.sourcePortId, at = m, ut = D;
      const te = ((X = F == null ? void 0 : F.label) == null ? void 0 : X.toLowerCase().includes("in")) || (F == null ? void 0 : F.side) === (s === "BT" ? "bottom" : "top"), ee = ((U = F == null ? void 0 : F.label) == null ? void 0 : U.toLowerCase().includes("out")) || (F == null ? void 0 : F.side) === (s === "BT" ? "top" : "bottom"), oe = ((M = j == null ? void 0 : j.label) == null ? void 0 : M.toLowerCase().includes("in")) || (j == null ? void 0 : j.side) === (s === "BT" ? "bottom" : "top"), se = ((st = j == null ? void 0 : j.label) == null ? void 0 : st.toLowerCase().includes("out")) || (j == null ? void 0 : j.side) === (s === "BT" ? "top" : "bottom");
      if (te && se)
        ct = m, At = D, at = N.sourceId, ut = N.sourcePortId;
      else if (ee && oe)
        ct = N.sourceId, At = N.sourcePortId, at = m, ut = D;
      else if (w.nodes[N.sourceId] && w.nodes[m]) {
        const rt = w.nodes[N.sourceId], Kt = w.nodes[m], ne = s === "BT" && rt.y < Kt.y, ge = s === "TB" && rt.y > Kt.y;
        if (ne || ge) {
          ct = m, at = N.sourceId;
          const ft = n.nodes[ct], wt = n.nodes[at];
          At = ((ot = (it = ft == null ? void 0 : ft.ports) == null ? void 0 : it.find((lt) => lt.label.includes("out") || lt.side === (s === "BT" ? "top" : "bottom"))) == null ? void 0 : ot.id) || D, ut = ((dt = (It = wt == null ? void 0 : wt.ports) == null ? void 0 : It.find((lt) => lt.label.includes("in") || lt.side === (s === "BT" ? "bottom" : "top"))) == null ? void 0 : dt.id) || N.sourcePortId;
        }
      }
      o({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: ct,
            sourcePortId: At,
            targetId: at,
            targetPortId: ut
          }
        }
      });
    }
    _(null);
  }, zt = (m) => {
    if (m.button === 1 || yt.current) {
      f(m.clientX, m.clientY);
      return;
    }
    const D = m.target, Z = D === e.current || D.classList.contains("sysflow-viewport") || D.classList.contains("sysflow-dom-layer") || D.tagName.toLowerCase() === "svg";
    if (m.button === 0 && Z) {
      m.currentTarget.setPointerCapture(m.pointerId);
      const k = l(m.clientX, m.clientY);
      ht({
        startX: k.x,
        startY: k.y,
        currentX: k.x,
        currentY: k.y
      }), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, $t = (m) => {
    if (W.current)
      v(m.clientX, m.clientY);
    else if (z) {
      const D = l(m.clientX, m.clientY);
      ht((Z) => Z ? { ...Z, currentX: D.x, currentY: D.y } : null);
    } else et ? Tt(m) : N && _(
      (D) => D ? { ...D, currentWorldPos: l(m.clientX, m.clientY) } : null
    );
  }, Ft = (m) => {
    if (m.currentTarget.hasPointerCapture(m.pointerId) && m.currentTarget.releasePointerCapture(m.pointerId), W.current && p(), z) {
      const D = Math.min(z.startX, z.currentX), Z = Math.min(z.startY, z.currentY), k = Math.max(z.startX, z.currentX), V = Math.max(z.startY, z.currentY);
      if (k - D > 4 || V - Z > 4) {
        const X = [];
        for (const [U, M] of Object.entries(w.nodes))
          M.x < k && M.x + M.width > D && M.y < V && M.y + M.height > Z && X.push(U);
        for (const [U, M] of Object.entries(w.containers))
          M.x < k && M.x + M.width > D && M.y < V && M.y + M.height > Z && X.push(U);
        o({ type: "SELECTION_CHANGE", payload: { selectedIds: X } });
      }
      ht(null);
    }
    et && Ot(m), N && _(null);
  }, jt = c ?? (i == null ? void 0 : i.mode) === "flow", Jt = R(
    (m, D) => {
      const Z = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, k = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      o({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: m,
          position: D,
          direction: s,
          suggestedNewNodeId: Z,
          suggestedNewEdgeId: k
        }
      });
    },
    [s, o]
  ), Ut = t ?? c ?? (i == null ? void 0 : i.mode) === "flow", _t = R(
    (m) => {
      const D = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, Z = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, k = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      o({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: m,
          direction: s,
          suggestedNewNodeId: D,
          suggestedNewEdge1Id: Z,
          suggestedNewEdge2Id: k
        }
      }), o({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [D] }
      });
    },
    [s, o]
  ), qt = Object.values(n.containers);
  return /* @__PURE__ */ $(
    "div",
    {
      ref: e,
      className: `sysflow-canvas ${K === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${G}`,
      "data-theme": K,
      onWheel: L,
      onPointerDown: zt,
      onPointerMove: $t,
      onPointerUp: Ft,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ H(
          xe,
          {
            graph: n,
            registerMeasureElement: T,
            nodeTypes: b,
            containerTypes: y
          }
        ),
        /* @__PURE__ */ $("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ H("button", { onClick: S, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ H("button", { onClick: E, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ $("button", { onClick: x, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(A.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ $(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${A.x}px, ${A.y}px) scale(${A.zoom})`
            },
            children: [
              z && /* @__PURE__ */ H(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(z.startX, z.currentX)}px`,
                    top: `${Math.min(z.startY, z.currentY)}px`,
                    width: `${Math.abs(z.currentX - z.startX)}px`,
                    height: `${Math.abs(z.currentY - z.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              N && /* @__PURE__ */ H("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ H(
                "line",
                {
                  x1: N.startWorldPos.x,
                  y1: N.startWorldPos.y,
                  x2: N.currentWorldPos.x,
                  y2: N.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ H("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: qt.map((m) => {
                const D = w.containers[m.id];
                if (!D) return null;
                const Z = Object.values(n.nodes).some((k) => k.parentId === m.id) || Object.values(n.containers).some((k) => k.parentId === m.id);
                return /* @__PURE__ */ H(
                  Ze,
                  {
                    container: m,
                    layout: D,
                    selected: B.includes(m.id),
                    isHovered: Xt === m.id,
                    hasChildren: Z,
                    customRenderer: m.type ? y == null ? void 0 : y[m.type] : void 0,
                    onToggleCollapse: (k, V) => o({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: k, collapsed: V }
                    }),
                    onPointerDown: xt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (k) => {
                      k.stopPropagation(), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [m.id] } });
                    }
                  },
                  m.id
                );
              }) }),
              /* @__PURE__ */ H(
                Le,
                {
                  graph: n,
                  layout: w,
                  selectedIds: B,
                  direction: s,
                  showArrows: a,
                  routing: u,
                  portOptions: Q,
                  enableEdgeQuickAdd: Ut,
                  onInsertNodeOnEdge: _t,
                  onEdgeClick: (m) => o({ type: "SELECTION_CHANGE", payload: { selectedIds: [m] } })
                }
              ),
              /* @__PURE__ */ H("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(n.nodes).map((m) => {
                const D = w.nodes[m.id];
                return D ? /* @__PURE__ */ H(
                  Ke,
                  {
                    node: m,
                    layout: D,
                    direction: s,
                    edges: n.edges,
                    portOptions: Q,
                    selected: B.includes(m.id),
                    customRenderer: m.type ? b == null ? void 0 : b[m.type] : void 0,
                    enableQuickAdd: jt,
                    onAddConnectedNode: Jt,
                    onPointerDown: xt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (Z) => {
                      Z.stopPropagation(), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [m.id] } });
                    },
                    onPortPointerDown: Vt,
                    onPortPointerUp: Qt
                  },
                  m.id
                ) : null;
              }) }),
              et && /* @__PURE__ */ H(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${et.ghostPosition.x}px, ${et.ghostPosition.y}px)`,
                    width: `${((Lt = Y.get(et.draggedEntity.id)) == null ? void 0 : Lt.width) || 200}px`,
                    height: `${((St = Y.get(et.draggedEntity.id)) == null ? void 0 : St.height) || 64}px`
                  },
                  children: /* @__PURE__ */ H("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: et.draggedEntity.label })
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
  Ne as EdgeRewireStrategy,
  Ze as GraphContainer,
  Le as GraphEdgeLayer,
  Ke as GraphNode,
  Se as GraphPortLayer,
  be as ReparentStrategy,
  ye as SugiyamaEngine,
  Ye as SysFlowCanvas,
  Be as WorkerBridge,
  Gt as computeEntityPortLocations,
  Zt as pruneDanglingEdges,
  Wt as resolveEffectiveEntityId,
  me as useCanvasTransform,
  pe as useDragGesture,
  ve as useGraphHistory,
  Ge as useMeasurement
};
