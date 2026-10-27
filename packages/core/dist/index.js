var at = Object.defineProperty;
var lt = (g, t, s) => t in g ? at(g, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : g[t] = s;
var me = (g, t, s) => lt(g, typeof t != "symbol" ? t + "" : t, s);
import { useState as oe, useRef as Ie, useCallback as V, useEffect as Ke, useMemo as Ct } from "react";
import { jsxs as J, jsx as v, Fragment as Ee } from "react/jsx-runtime";
function At(g, t, s, c) {
  const r = (C) => {
    const a = s.find(
      (b) => b.sourceId === t && b.sourcePortId === C || b.targetId === t && b.targetPortId === C
    );
    if (!a) return null;
    const l = a.sourceId === t ? a.targetId : a.sourceId, i = c[l];
    return i ? { x: i.x + i.width / 2, y: i.y + i.height / 2 } : null;
  };
  ["left", "right"].forEach((C) => {
    g[C].sort((a, l) => {
      var y, u;
      const i = ((y = r(a.id)) == null ? void 0 : y.y) ?? 0, b = ((u = r(l.id)) == null ? void 0 : u.y) ?? 0;
      return i - b;
    });
  }), ["top", "bottom"].forEach((C) => {
    g[C].sort((a, l) => {
      var y, u;
      const i = ((y = r(a.id)) == null ? void 0 : y.x) ?? 0, b = ((u = r(l.id)) == null ? void 0 : u.x) ?? 0;
      return i - b;
    });
  });
}
function ut(g, t, s, c, r, C) {
  if (!r || !C)
    return s ? "left" : "right";
  const a = c.find(
    (u) => s ? u.targetId === g && u.targetPortId === t : u.sourceId === g && u.sourcePortId === t
  );
  if (!a) return s ? "left" : "right";
  const l = s ? a.sourceId : a.targetId, i = r[l];
  if (!i) return s ? "left" : "right";
  const b = i.x + i.width / 2 - (C.x + C.width / 2), y = i.y + i.height / 2 - (C.y + C.height / 2);
  return Math.abs(b) > Math.abs(y) ? b > 0 ? "right" : "left" : y > 0 ? "bottom" : "top";
}
function Ze(g, t, s = "LR", c, r) {
  const C = /* @__PURE__ */ new Map();
  if (!g || !t || !g.ports || g.ports.length === 0)
    return C;
  const a = (r == null ? void 0 : r.direction) || s, l = a === "TB" || a === "BT", i = (r == null ? void 0 : r.mode) || (l ? "strict-flow" : "perimeter-optimized"), b = c ? Array.isArray(c) ? c : Object.values(c) : [], y = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, u = new Set(
    b.filter((p) => p.targetId === g.id).map((p) => p.targetPortId)
  );
  new Set(
    b.filter((p) => p.sourceId === g.id).map((p) => p.sourcePortId)
  ), g.ports.forEach((p) => {
    let E = p.side || "auto";
    if (E !== "auto") {
      y[E].push(p);
      return;
    }
    if (i === "strict-flow") {
      const x = u.has(p.id) || p.label.toLowerCase().includes("in");
      switch (a) {
        case "BT":
          E = x ? "bottom" : "top";
          break;
        case "TB":
          E = x ? "top" : "bottom";
          break;
        case "RL":
          E = x ? "right" : "left";
          break;
        case "LR":
        default:
          E = x ? "left" : "right";
          break;
      }
    } else
      E = ut(
        g.id,
        p.id,
        u.has(p.id),
        b,
        r == null ? void 0 : r.nodeLayouts,
        t
      );
    y[E].push(p);
  }), i === "perimeter-optimized" && (r != null && r.nodeLayouts) && At(y, g.id, b, r.nodeLayouts);
  const G = (p, E) => {
    const x = p.length;
    p.forEach((n, e) => {
      let o = 0, I = 0;
      E === "left" || E === "right" ? (I = t.height / (x + 1) * (e + 1), o = E === "left" ? 0 : t.width) : (o = t.width / (x + 1) * (e + 1), I = E === "top" ? 0 : t.height), C.set(n.id, {
        portId: n.id,
        side: E,
        localX: o,
        localY: I,
        worldX: t.x + o,
        worldY: t.y + I
      });
    });
  };
  return G(y.left, "left"), G(y.right, "right"), G(y.top, "top"), G(y.bottom, "bottom"), C;
}
function Ne(g) {
  const t = {}, s = (c) => {
    var C;
    const r = g.nodes[c];
    return new Set(((C = r == null ? void 0 : r.ports) == null ? void 0 : C.map((a) => a.id)) || []);
  };
  for (const [c, r] of Object.entries(g.edges)) {
    const C = s(r.sourceId), a = s(r.targetId), l = C.has(r.sourcePortId), i = a.has(r.targetPortId);
    l && i && (t[c] = r);
  }
  return {
    ...g,
    edges: t
  };
}
class ht {
  static assignDynamicPortSides(t, s, c) {
    var C, a;
    const r = (l) => s[l] || c[l];
    for (const l of Object.values(t.edges)) {
      const i = r(l.sourceId), b = r(l.targetId);
      if (!i || !b) continue;
      const y = t.nodes[l.sourceId] || t.containers[l.sourceId], u = t.nodes[l.targetId] || t.containers[l.targetId], G = b.x + b.width / 2 - (i.x + i.width / 2), p = b.y + b.height / 2 - (i.y + i.height / 2), E = Math.abs(G) > Math.abs(p) * 1.25, x = (C = y == null ? void 0 : y.ports) == null ? void 0 : C.find((e) => e.id === l.sourcePortId);
      x && (!x.side || x.side === "auto") && (E ? x.side = G >= 0 ? "right" : "left" : x.side = p >= 0 ? "bottom" : "top");
      const n = (a = u == null ? void 0 : u.ports) == null ? void 0 : a.find((e) => e.id === l.targetPortId);
      n && (!n.side || n.side === "auto") && (E ? n.side = G >= 0 ? "left" : "right" : n.side = p >= 0 ? "top" : "bottom");
    }
  }
}
const Ye = 22, We = 18, Me = 38, Le = 210, Re = 36, ft = 180, yt = 54, Xe = 260, Te = 160;
class ke {
  static execute(t, s, c) {
    var n;
    const r = {}, C = {}, a = (e) => {
      var d, h, Z, S, X;
      const o = !!t.containers[e], I = !!((d = t.containers[e]) != null && d.collapsed);
      return o && I ? { width: Le, height: Re } : o && !I ? {
        width: ((h = c.get(e)) == null ? void 0 : h.width) || Xe,
        height: ((Z = c.get(e)) == null ? void 0 : Z.height) || Te
      } : {
        width: ((S = c.get(e)) == null ? void 0 : S.width) || ft,
        height: ((X = c.get(e)) == null ? void 0 : X.height) || yt
      };
    }, l = /* @__PURE__ */ new Map();
    for (const [e, o] of Object.entries(t.nodes)) {
      const I = o.parentId ?? null;
      l.has(I) || l.set(I, []), l.get(I).push(e);
    }
    for (const [e, o] of Object.entries(t.containers)) {
      const I = o.parentId ?? null;
      l.has(I) || l.set(I, []), l.get(I).push(e);
    }
    const i = ke.getContainerDepths(t), b = Object.keys(t.containers).sort(
      (e, o) => (i.get(o) || 0) - (i.get(e) || 0)
    ), y = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), G = (e) => y.has(e) ? y.get(e) : a(e);
    for (const e of b) {
      if (!!((n = t.containers[e]) != null && n.collapsed)) {
        y.set(e, {
          width: Le,
          height: Re
        });
        continue;
      }
      const I = l.get(e) || [];
      if (I.length === 0) {
        y.set(e, {
          width: Xe,
          height: Te
        });
        continue;
      }
      const d = s.arrange(e, I, t, G);
      for (const S of d.boxes)
        u.set(S.id, S);
      const h = Math.max(d.width + Ye * 2, Le), Z = d.height + Me + We * 2;
      y.set(e, { width: h, height: Z });
    }
    const p = l.get(null) || [];
    let E = [];
    p.length > 0 && (E = s.arrange(null, p, t, G).boxes.map((o) => ({
      ...o,
      localX: o.localX + 60,
      localY: o.localY + 60
    })));
    const x = (e, o, I, d, h) => {
      var X;
      const Z = !!t.containers[e], S = { id: e, x: o, y: I, width: d, height: h };
      if (Z) {
        if (C[e] = S, (X = t.containers[e]) != null && X.collapsed) return;
        const Q = o + Ye, O = I + Me + We, w = l.get(e) || [];
        for (const A of w) {
          const B = u.get(A);
          B && x(
            A,
            Q + B.localX,
            O + B.localY,
            B.width,
            B.height
          );
        }
      } else
        r[e] = S;
    };
    for (const e of E)
      x(e.id, e.localX, e.localY, e.width, e.height);
    return ht.assignDynamicPortSides(t, r, C), { nodes: r, containers: C };
  }
  static getContainerDepths(t) {
    const s = /* @__PURE__ */ new Map(), c = (r) => {
      var l;
      if (s.has(r)) return s.get(r);
      const C = (l = t.containers[r]) == null ? void 0 : l.parentId;
      if (!C || !t.containers[C])
        return s.set(r, 0), 0;
      const a = 1 + c(C);
      return s.set(r, a), a;
    };
    for (const r of Object.keys(t.containers))
      c(r);
    return s;
  }
}
const wt = 70, Ge = 28;
class Bt {
  constructor(t = {}) {
    this.options = t;
  }
  arrange(t, s, c, r) {
    if (s.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = this.options.direction ?? "TB", a = C === "TB" || C === "BT", l = C === "BT" || C === "RL", i = new Set(s), b = [], y = /* @__PURE__ */ new Set();
    for (const A of Object.values(c.edges)) {
      const B = this.resolveToDirectChild(A.sourceId, i, c), L = this.resolveToDirectChild(A.targetId, i, c);
      if (B && L && B !== L) {
        const N = `${B}->${L}`;
        y.has(N) || (y.add(N), b.push({ sourceId: B, targetId: L }));
      }
    }
    const u = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
    for (const A of s)
      u.set(A, 0), G.set(A, []), p.set(A, []);
    for (const A of b)
      G.get(A.sourceId).push(A.targetId), p.get(A.targetId).push(A.sourceId), u.set(A.targetId, (u.get(A.targetId) || 0) + 1);
    const E = /* @__PURE__ */ new Map(), x = s.filter((A) => (u.get(A) || 0) === 0);
    for (const A of x) E.set(A, 0);
    const n = /* @__PURE__ */ new Set();
    for (; x.length > 0; ) {
      const A = x.shift();
      n.add(A);
      const B = E.get(A);
      for (const L of G.get(A)) {
        const N = Math.max(E.get(L) || 0, B + 1);
        E.set(L, N), u.set(L, u.get(L) - 1), u.get(L) === 0 && x.push(L);
      }
    }
    for (const A of s)
      n.has(A) || E.set(A, 0);
    const e = /* @__PURE__ */ new Map();
    for (const [A, B] of E.entries())
      e.has(B) || e.set(B, []), e.get(B).push(A);
    const o = Array.from(e.keys()).sort((A, B) => A - B), I = l ? [...o].reverse() : o, d = /* @__PURE__ */ new Map(), h = (A) => {
      const B = r(A);
      return a ? B.width : B.height;
    };
    for (const A of o) {
      const B = e.get(A) || [];
      let L = -1 / 0;
      for (const N of B) {
        const H = h(N), f = p.get(N) || [];
        let D = null;
        if (f.length > 0) {
          const M = f.map((R) => {
            const T = d.get(R);
            return T === void 0 ? null : T + h(R) / 2;
          }).filter((R) => R !== null);
          M.length > 0 && (D = M.reduce((R, T) => R + T, 0) / M.length);
        }
        let W = D !== null ? D - H / 2 : 0;
        W < L + Ge && (W = L === -1 / 0 ? 0 : L + Ge), d.set(N, W), L = W + H;
      }
    }
    for (let A = o.length - 1; A >= 0; A--) {
      const B = o[A], L = e.get(B) || [];
      for (const H of L) {
        const f = G.get(H) || [];
        if (f.length === 0) continue;
        const D = f.map((W) => {
          const M = d.get(W);
          return M === void 0 ? null : M + h(W) / 2;
        }).filter((W) => W !== null);
        if (D.length > 0) {
          const W = D.reduce((R, T) => R + T, 0) / D.length, M = h(H);
          d.set(H, W - M / 2);
        }
      }
      let N = -1 / 0;
      for (const H of L) {
        const f = h(H);
        let D = d.get(H) ?? 0;
        D < N + Ge && (D = N === -1 / 0 ? 0 : N + Ge, d.set(H, D)), N = D + f;
      }
    }
    let Z = 1 / 0;
    for (const A of d.values())
      Z = Math.min(Z, A);
    const S = Z < 0 ? -Z : 0, X = [];
    let Q = 0;
    for (const A of I) {
      const B = e.get(A);
      let L = 0;
      for (const N of B) {
        const H = r(N), f = a ? H.height : H.width, D = (d.get(N) ?? 0) + S, W = a ? D : Q, M = a ? Q : D;
        X.push({ id: N, localX: W, localY: M, width: H.width, height: H.height }), L = Math.max(L, f);
      }
      Q += L + wt;
    }
    const O = Math.max(...X.map((A) => A.localX + A.width), 0), w = Math.max(...X.map((A) => A.localY + A.height), 0);
    return { width: O, height: w, boxes: X };
  }
  resolveToDirectChild(t, s, c) {
    var C, a;
    let r = t;
    for (; r; ) {
      if (s.has(r)) return r;
      r = ((C = c.nodes[r]) == null ? void 0 : C.parentId) ?? ((a = c.containers[r]) == null ? void 0 : a.parentId) ?? null;
    }
    return null;
  }
}
const ue = 32, Oe = 24;
class bt {
  constructor(t = 1.55) {
    this.targetAspect = t;
  }
  arrange(t, s, c, r) {
    if (s.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = s.map((l) => {
      const i = r(l);
      return { id: l, width: i.width, height: i.height };
    }), a = this.findBestTightPacking(C, this.targetAspect);
    return { width: a.width, height: a.height, boxes: a.boxes };
  }
  findBestTightPacking(t, s) {
    if (t.length === 1)
      return {
        width: t[0].width,
        height: t[0].height,
        boxes: [{ id: t[0].id, localX: 0, localY: 0, width: t[0].width, height: t[0].height }],
        score: 0
      };
    const c = t.reduce((u, G) => u + G.width * G.height, 0), r = Math.max(...t.map((u) => u.width)), C = [...t].sort((u, G) => G.width - u.width), a = /* @__PURE__ */ new Set(), l = t.reduce((u, G) => u + G.width, 0) + (t.length - 1) * ue;
    a.add(l), a.add(r);
    const i = Math.max(r, Math.sqrt(c * s));
    a.add(i), a.add(i * 0.85), a.add(i * 1.15);
    const b = Math.min(t.length, 6);
    for (let u = 2; u <= b; u++) {
      let G = 0;
      for (let p = 0; p < u && p < C.length; p++)
        G += C[p].width;
      G += (u - 1) * ue, G >= r && a.add(G);
    }
    let y = null;
    for (const u of a) {
      const G = this.simulateSkylinePacking(t, u), p = G.width * G.height, E = Math.max(0, p - c), x = G.width / Math.max(1, G.height), n = Math.abs(Math.log(x / s)), e = E / c * 2 + n * 0.25;
      G.score = e, (!y || e < y.score) && (y = G);
    }
    return y;
  }
  simulateSkylinePacking(t, s) {
    const c = [...t].sort((i, b) => b.height - i.height), r = [{ x: 0, width: s, y: 0 }], C = [];
    for (const i of c) {
      let b = 1 / 0, y = -1;
      for (let e = 0; e < r.length; e++) {
        if (r[e].x + i.width > s) continue;
        let I = 0, d = 0;
        for (let h = e; h < r.length && d < i.width; h++)
          I = Math.max(I, r[h].y), d += r[h].width;
        I < b && (b = I, y = e);
      }
      if (y === -1) {
        const e = Math.max(...r.map((I) => I.y)), o = e === 0 ? 0 : e + Oe;
        C.push({ id: i.id, localX: 0, localY: o, width: i.width, height: i.height }), r.length = 0, r.push({ x: 0, width: i.width + ue, y: o + i.height }), s > i.width + ue && r.push({
          x: i.width + ue,
          width: s - (i.width + ue),
          y: 0
        });
        continue;
      }
      const u = r[y].x, G = b === 0 ? 0 : b + Oe;
      C.push({ id: i.id, localX: u, localY: G, width: i.width, height: i.height });
      const p = i.width + ue, E = G + i.height, x = { x: u, width: p, y: E }, n = [];
      for (const e of r)
        e.x + e.width <= u || e.x >= u + p ? n.push(e) : (e.x < u && n.push({ x: e.x, width: u - e.x, y: e.y }), e.x + e.width > u + p && n.push({
          x: u + p,
          width: e.x + e.width - (u + p),
          y: e.y
        }));
      n.push(x), n.sort((e, o) => e.x - o.x), r.length = 0, r.push(...n);
    }
    const a = Math.max(...C.map((i) => i.localX + i.width), 0), l = Math.max(...C.map((i) => i.localY + i.height), 0);
    return { width: a, height: l, boxes: C, score: 0 };
  }
}
function Ve(g, t, s) {
  var C, a;
  let c = g, r = null;
  for (; c; )
    s.has(c) && (r = c), c = ((C = t.nodes[c]) == null ? void 0 : C.parentId) ?? ((a = t.containers[c]) == null ? void 0 : a.parentId) ?? void 0;
  return r ?? g;
}
class mt {
  async execute(t, s, c) {
    const r = Object.values(t.containers), C = new Set(
      r.filter((u) => !!u.collapsed).map((u) => u.id)
    ), a = {};
    for (const [u, G] of Object.entries(t.edges)) {
      const p = Ve(G.sourceId, t, C), E = Ve(G.targetId, t, C);
      p !== E && (a[u] = {
        ...G,
        sourceId: p,
        targetId: E
      });
    }
    const l = {
      ...t,
      edges: a
    }, i = Object.keys(t.containers).length, y = (c != null && c.mode && c.mode !== "auto" ? c.mode : i > 0 ? "concurrent" : "flow") === "concurrent" ? new bt((c == null ? void 0 : c.aspectRatio) ?? 1.55) : new Bt(c);
    return ke.execute(l, y, s);
  }
}
const ze = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", xt = (g) => Uint8Array.from(atob(g), (t) => t.charCodeAt(0)), Qe = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", xt(ze)], { type: "text/javascript;charset=utf-8" });
function Gt(g) {
  let t;
  try {
    if (t = Qe && (self.URL || self.webkitURL).createObjectURL(Qe), !t) throw "";
    const s = new Worker(t, {
      type: "module",
      name: g == null ? void 0 : g.name
    });
    return s.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), s;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + ze,
      {
        type: "module",
        name: g == null ? void 0 : g.name
      }
    );
  }
}
class pt {
  constructor() {
    me(this, "worker", null);
    me(this, "pendingRequests", /* @__PURE__ */ new Map());
    me(this, "fallbackEngine", new mt());
    if (typeof Worker < "u")
      try {
        this.worker = new Gt(), this.worker.onmessage = (t) => {
          const { id: s, success: c, layout: r, error: C } = t.data, a = this.pendingRequests.get(s);
          a && (this.pendingRequests.delete(s), c ? a.resolve(r) : a.reject(new Error(C)));
        }, this.worker.onerror = (t) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", t);
        };
      } catch (t) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", t), this.worker = null;
      }
  }
  execute(t, s, c) {
    return this.worker ? new Promise((r, C) => {
      const a = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(a, { resolve: r, reject: C });
      const l = Array.from(s.entries());
      this.worker.postMessage({
        id: a,
        graph: t,
        measurements: l,
        options: c
      });
    }) : this.fallbackEngine.execute(t, s, c);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class St {
  canDrag() {
    return !0;
  }
  onDragMove(t) {
    return t.cursorWorld;
  }
  onDragEnd(t) {
    const { draggedEntity: s, hoveredEntity: c, graph: r } = t;
    return c && c.id === s.id ? null : c && r.containers[c.id] ? s.parentId === c.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: s.id,
        newParentId: c.id
      }
    } : !c && s.parentId !== null && s.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: s.id,
        newParentId: null
      }
    } : null;
  }
}
class Tt {
  constructor() {
    me(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(t) {
    return t.cursorWorld;
  }
  onDragEnd(t) {
    const { draggedEntity: s, hoveredEdge: c, hoveredEntity: r, cursorWorld: C, startWorldPos: a, graph: l } = t, i = Math.hypot(
      C.x - a.x,
      C.y - a.y
    );
    if (r && l.containers[r.id])
      return r.id !== s.id && s.parentId !== r.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: s.id,
          newParentId: r.id
        }
      } : null;
    if (!r && !c) {
      const y = Object.values(l.edges).filter(
        (G) => G.targetId === s.id
      ), u = Object.values(l.edges).filter(
        (G) => G.sourceId === s.id
      );
      return y.length === 1 && u.length === 1 && y[0].sourceId !== u[0].targetId && i >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: s.id,
          incomingEdgeId: y[0].id,
          outgoingEdgeId: u[0].id
        }
      } : i >= this.dragOffThreshold && s.parentId !== null && s.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: s.id,
          newParentId: null
        }
      } : null;
    }
    const b = (y) => {
      const u = l.nodes[y.id] || y;
      if (!u.ports || u.ports.length === 0) return "";
      const G = Object.values(l.edges).find((x) => x.targetId === y.id);
      if (G) {
        const x = u.ports.find((n) => n.id === G.targetPortId);
        if (x) return x.id;
      }
      const p = new Set(
        Object.values(l.edges).filter((x) => x.sourceId === y.id).map((x) => x.sourcePortId)
      ), E = u.ports.find((x) => !p.has(x.id));
      return E ? E.id : u.ports[0].id;
    };
    if (c)
      return c.sourceId === s.id || c.targetId === s.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: c.id,
          newSourceId: c.sourceId,
          newTargetId: s.id,
          newTargetPortId: b(s)
        }
      };
    if (r && r.id !== s.id && l.nodes[r.id]) {
      const y = Object.values(l.edges).find(
        (u) => u.targetId === r.id && u.sourceId !== s.id
      );
      if (y)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: y.id,
            newSourceId: y.sourceId,
            newTargetId: s.id,
            newTargetPortId: b(s)
          }
        };
    }
    return null;
  }
}
function Lt(g, t = { min: 0.15, max: 3 }) {
  const [s, c] = oe({ x: 80, y: 80, zoom: 1 }), r = Ie(!1), C = Ie({ x: 0, y: 0 }), a = V(
    (x, n) => {
      if (!g.current) return { x, y: n };
      const e = g.current.getBoundingClientRect();
      return {
        x: (x - e.left - s.x) / s.zoom,
        y: (n - e.top - s.y) / s.zoom
      };
    },
    [s, g]
  ), l = V(
    (x) => {
      if (!g.current) return;
      const n = [
        ...Object.values(x.nodes),
        ...Object.values(x.containers)
      ];
      if (n.length === 0) {
        c({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let e = 1 / 0, o = 1 / 0, I = -1 / 0, d = -1 / 0;
      for (const L of n)
        e = Math.min(e, L.x), o = Math.min(o, L.y), I = Math.max(I, L.x + L.width), d = Math.max(d, L.y + L.height);
      const h = g.current.getBoundingClientRect(), Z = 80, S = Math.max(I - e, 100), X = Math.max(d - o, 100), Q = (h.width - Z * 2) / S, O = (h.height - Z * 2) / X, w = Math.min(
        Math.max(Math.min(Q, O), t.min),
        Math.min(t.max, 1.25)
      ), A = (h.width - S * w) / 2 - e * w, B = (h.height - X * w) / 2 - o * w;
      c({
        x: A,
        y: B,
        zoom: w
      });
    },
    [g, t]
  ), i = V(
    (x) => {
      if (x.preventDefault(), !!g.current)
        if (x.ctrlKey || x.metaKey) {
          const n = g.current.getBoundingClientRect(), e = x.clientX - n.left, o = x.clientY - n.top, I = x.deltaY < 0 ? 1.08 : 0.92, d = Math.min(Math.max(s.zoom * I, t.min), t.max), h = e - (e - s.x) * (d / s.zoom), Z = o - (o - s.y) * (d / s.zoom);
          c({ x: h, y: Z, zoom: d });
        } else
          c((n) => ({
            ...n,
            x: n.x - x.deltaX,
            y: n.y - x.deltaY
          }));
    },
    [s, t, g]
  ), b = V(
    (x, n) => {
      r.current = !0, C.current = { x: x - s.x, y: n - s.y };
    },
    [s]
  ), y = V((x, n) => {
    r.current && c((e) => ({
      ...e,
      x: x - C.current.x,
      y: n - C.current.y
    }));
  }, []), u = V(() => {
    r.current = !1;
  }, []), G = V(() => {
    c({ x: 80, y: 80, zoom: 1 });
  }, []), p = V(() => {
    c((x) => ({
      ...x,
      zoom: Math.min(x.zoom * 1.2, t.max)
    }));
  }, [t]), E = V(() => {
    c((x) => ({
      ...x,
      zoom: Math.max(x.zoom / 1.2, t.min)
    }));
  }, [t]);
  return {
    transform: s,
    setTransform: c,
    screenToWorld: a,
    onWheel: i,
    startPan: b,
    updatePan: y,
    endPan: u,
    resetTransform: G,
    zoomIn: p,
    zoomOut: E,
    zoomToFit: l,
    isPanning: r
  };
}
function Kt(g) {
  const [t, s] = oe(
    /* @__PURE__ */ new Map()
  );
  Ie(/* @__PURE__ */ new Map());
  const c = Ie(/* @__PURE__ */ new Map()), r = V((C, a) => {
    a ? c.current.set(C, a) : c.current.delete(C);
  }, []);
  return Ke(() => {
    const C = new ResizeObserver((a) => {
      let l = !1;
      const i = new Map(t);
      for (const b of a) {
        const y = b.target.getAttribute("data-sysflow-measure-id");
        if (!y) continue;
        const u = Math.ceil(b.contentRect.width), G = Math.ceil(b.contentRect.height), p = i.get(y);
        (!p || p.width !== u || p.height !== G) && (i.set(y, { width: u, height: G }), l = !0);
      }
      l && s(i);
    });
    return c.current.forEach((a) => C.observe(a)), () => {
      C.disconnect();
    };
  }, [g]), { measurements: t, registerMeasureElement: r };
}
function Et(g, t, s, c, r) {
  const [C, a] = oe(null), [l, i] = oe(null), b = Ie(null), y = Ie(null), u = V(
    (n, e) => {
      let o = null, I = 1 / 0;
      for (const [d, h] of Object.entries(t.containers))
        if (d !== e && n.x >= h.x && n.x <= h.x + h.width && n.y >= h.y && n.y <= h.y + h.height) {
          const Z = h.width * h.height;
          Z < I && (I = Z, o = g.containers[d] || null);
        }
      if (o) return o;
      for (const [d, h] of Object.entries(t.nodes))
        if (d !== e && n.x >= h.x && n.x <= h.x + h.width && n.y >= h.y && n.y <= h.y + h.height)
          return g.nodes[d] || null;
      return null;
    },
    [t, g]
  ), G = V(
    (n, e) => {
      let o = null, I = 45;
      for (const d of Object.values(g.edges)) {
        if (d.sourceId === e || d.targetId === e) continue;
        const h = t.nodes[d.sourceId] || t.containers[d.sourceId], Z = t.nodes[d.targetId] || t.containers[d.targetId];
        if (!h || !Z) continue;
        const S = h.x + h.width, X = h.y + h.height / 2, Q = Z.x, O = Z.y + Z.height / 2;
        for (let w = 0; w <= 10; w++) {
          const A = w / 10, B = (1 - A) * S + A * Q, L = (1 - A) * X + A * O, N = Math.hypot(n.x - B, n.y - L);
          N < I && (I = N, o = d);
        }
      }
      return o;
    },
    [t, g]
  ), p = V(
    (n, e) => {
      if (e.stopPropagation(), s.canDrag && !s.canDrag(n, g))
        return;
      const o = c(e.clientX, e.clientY);
      a({
        draggedEntity: n,
        ghostPosition: o,
        startPosition: o
      });
    },
    [g, s, c]
  ), E = V(
    (n) => {
      if (!C) return;
      const e = c(n.clientX, n.clientY), o = u(e, C.draggedEntity.id), I = G(e, C.draggedEntity.id);
      b.current = o, y.current = I, o && g.containers[o.id] ? i(o.id) : i(null);
      const d = s.onDragMove ? s.onDragMove({
        draggedEntity: C.draggedEntity,
        cursorWorld: e,
        startWorldPos: C.startPosition,
        hoveredEntity: o,
        hoveredEdge: I,
        graph: g,
        layout: t
      }) : e;
      d && a((h) => h ? { ...h, ghostPosition: d } : null);
    },
    [C, c, s, g, t, u, G]
  ), x = V(
    (n) => {
      if (!C) return;
      const e = c(n.clientX, n.clientY), o = u(e, C.draggedEntity.id), I = G(e, C.draggedEntity.id), d = s.onDragEnd({
        draggedEntity: C.draggedEntity,
        cursorWorld: e,
        startWorldPos: C.startPosition,
        hoveredEntity: o,
        hoveredEdge: I,
        graph: g,
        layout: t
      });
      d && r(d), a(null), i(null), b.current = null, y.current = null;
    },
    [C, c, s, g, t, u, G, r]
  );
  return {
    dragState: C,
    hoveredContainerId: l,
    handlePointerDown: p,
    handlePointerMove: E,
    handlePointerUp: x
  };
}
function Zt(g, t) {
  const s = [], c = [], r = [], C = [], a = [];
  for (const [l, i] of Object.entries(t.nodes))
    g.nodes[l] ? g.nodes[l] !== i && c.push(i) : s.push(i);
  for (const l of Object.keys(g.nodes))
    t.nodes[l] || r.push(l);
  for (const [l, i] of Object.entries(t.edges))
    g.edges[l] || C.push(i);
  for (const [l, i] of Object.entries(g.edges))
    t.edges[l] || a.push(i);
  return { createdNodes: s, updatedNodes: c, deletedNodes: r, createdEdges: C, deletedEdges: a };
}
function kt(g) {
  return g.createdNodes.length > 0 || g.updatedNodes.length > 0 || g.deletedNodes.length > 0 || g.createdEdges.length > 0 || g.deletedEdges.length > 0;
}
function Ot(g, t) {
  const [s, c] = oe({
    history: [g],
    index: 0
  }), [r, C] = oe(null), a = Ie(t);
  a.current = t;
  const l = s.history[s.index] ?? s.history[0] ?? g, i = V((o) => {
    var d;
    const I = Ne(o);
    if ((d = a.current) != null && d.onMutate) {
      const h = Zt(l, I);
      kt(h) && a.current.onMutate(h);
    }
    c((h) => {
      const Z = h.history.slice(0, h.index + 1);
      return {
        history: [...Z, I],
        index: Z.length
      };
    });
  }, [l]), b = V((o) => {
    const I = Ne(o);
    c({
      history: [I],
      index: 0
    });
  }, []), y = V(() => {
    c((o) => ({
      ...o,
      index: Math.max(0, o.index - 1)
    }));
  }, []), u = V(() => {
    c((o) => ({
      ...o,
      index: Math.min(o.history.length - 1, o.index + 1)
    }));
  }, []), G = V(
    (o) => {
      var S;
      if (!o || o.length === 0) return;
      let I = o;
      if ((S = a.current) != null && S.canDelete) {
        const X = a.current.canDelete(o);
        if (typeof X == "boolean") {
          if (!X) return;
        } else Array.isArray(X) && (I = X);
      }
      if (I.length === 0) return;
      const d = { ...l.nodes }, h = { ...l.containers }, Z = { ...l.edges };
      for (const X of I)
        delete d[X], delete h[X], delete Z[X];
      i({
        ...l,
        nodes: d,
        containers: h,
        edges: Z
      });
    },
    [l, i]
  ), p = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (o) => {
    const I = Math.random() * 16 | 0;
    return (o === "x" ? I : I & 3 | 8).toString(16);
  }), E = V(
    (o) => {
      var h, Z, S, X, Q, O;
      const I = l, d = a.current;
      if (o.type === "ENTITY_REPARENT") {
        const { entityId: w, newParentId: A } = o.payload, B = {
          ...I,
          nodes: { ...I.nodes },
          containers: { ...I.containers }
        };
        B.nodes[w] ? B.nodes[w] = { ...B.nodes[w], parentId: A } : B.containers[w] && (B.containers[w] = { ...B.containers[w], parentId: A }), i(B);
      } else if (o.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: w, direction: A, suggestedNewNodeId: B, suggestedNewEdge1Id: L, suggestedNewEdge2Id: N } = o.payload, H = I.edges[w.id];
        if (!H) return;
        const f = I.nodes[H.sourceId];
        if (d != null && d.canConnect && (!d.canConnect(H.sourceId, B) || !d.canConnect(B, H.targetId)))
          return;
        const D = A === "BT", W = A === "TB", M = `p_in_${Date.now()}`, R = `p_out_${Date.now()}`;
        let T = "left", _ = "right";
        D ? (T = "bottom", _ = "top") : W ? (T = "top", _ = "bottom") : A === "RL" && (T = "right", _ = "left");
        const k = (h = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : h.call(d, {
          edge: H,
          direction: A,
          suggestedType: (f == null ? void 0 : f.type) || "FlowTask"
        }), ee = {
          id: (k == null ? void 0 : k.id) || B,
          label: (k == null ? void 0 : k.label) || `Node ${Object.keys(I.nodes).length + 1}`,
          type: (k == null ? void 0 : k.type) || (f == null ? void 0 : f.type) || "FlowTask",
          parentId: (k == null ? void 0 : k.parentId) ?? (f == null ? void 0 : f.parentId) ?? null,
          ports: (k == null ? void 0 : k.ports) || [
            { id: M, label: "in", side: T },
            { id: R, label: "out", side: _ }
          ],
          data: (k == null ? void 0 : k.data) || {},
          ...k
        }, z = {
          id: L,
          sourceId: H.sourceId,
          sourcePortId: H.sourcePortId,
          targetId: ee.id,
          targetPortId: M
        }, se = {
          id: N,
          sourceId: ee.id,
          sourcePortId: R,
          targetId: H.targetId,
          targetPortId: H.targetPortId
        }, re = { ...I.edges };
        delete re[H.id], re[L] = z, re[N] = se, i({
          ...I,
          nodes: { ...I.nodes, [ee.id]: ee },
          edges: re
        });
      } else if (o.type === "NODE_EXTRACT") {
        const { incomingEdgeId: w, outgoingEdgeId: A } = o.payload, B = I.edges[w], L = I.edges[A];
        if (!B || !L || d != null && d.canConnect && !d.canConnect(B.sourceId, L.targetId))
          return;
        const N = { ...I.edges };
        N[w] = {
          ...B,
          targetId: L.targetId,
          targetPortId: L.targetPortId
        }, delete N[A], i({
          ...I,
          edges: N
        });
      } else if (o.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: w, position: A, direction: B, suggestedNewNodeId: L, suggestedNewEdgeId: N } = o.payload, H = B === "BT", f = `p_in_${Date.now()}`, D = `p_out_${Date.now()}`, W = H && A === "bottom" || !H && A === "top", M = W ? L : w.id, R = W ? w.id : L;
        if (d != null && d.canConnect && !d.canConnect(M, R))
          return;
        const T = (Z = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : Z.call(d, {
          sourceNode: w,
          position: A,
          direction: B,
          suggestedType: w.type
        }), _ = {
          id: (T == null ? void 0 : T.id) || L,
          label: (T == null ? void 0 : T.label) || `Node ${Object.keys(I.nodes).length + 1}`,
          type: (T == null ? void 0 : T.type) || w.type,
          ports: (T == null ? void 0 : T.ports) || [
            { id: f, label: "in", side: H ? "bottom" : "top" },
            { id: D, label: "out", side: H ? "top" : "bottom" }
          ],
          data: (T == null ? void 0 : T.data) || {},
          parentId: (T == null ? void 0 : T.parentId) ?? (w == null ? void 0 : w.parentId) ?? null,
          ...T
        }, k = w.ports.find((se) => se.label === "in") || w.ports[0], ee = w.ports.find((se) => se.label === "out") || w.ports[w.ports.length - 1];
        let z;
        W ? z = {
          id: N,
          sourceId: _.id,
          sourcePortId: D,
          targetId: w.id,
          targetPortId: (k == null ? void 0 : k.id) || "in"
        } : z = {
          id: N,
          sourceId: w.id,
          sourcePortId: (ee == null ? void 0 : ee.id) || "out",
          targetId: _.id,
          targetPortId: f
        }, i({
          ...I,
          nodes: { ...I.nodes, [_.id]: _ },
          edges: { ...I.edges, [N]: z }
        });
      } else if (o.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: w, collapsed: A } = o.payload;
        I.containers[w] && i({
          ...I,
          containers: {
            ...I.containers,
            [w]: { ...I.containers[w], collapsed: A }
          }
        });
      } else if (o.type === "EDGE_CREATE") {
        const w = o.payload.edge, A = w.sourceId, B = w.targetId, L = w.sourcePortId, N = w.targetPortId;
        if (d != null && d.canConnect && !d.canConnect(A, B, L, N))
          return;
        const H = o.payload.id || w.id || p();
        i({
          ...I,
          edges: {
            ...I.edges,
            [H]: { id: H, ...w }
          }
        });
      } else if (o.type === "EDGE_DELETE") {
        const w = o.payload.edgeId || o.payload.id, A = { ...I.edges };
        delete A[w], i({ ...I, edges: A });
      } else if (o.type === "EDGE_REWIRE") {
        const { edgeId: w, newTargetId: A } = o.payload;
        if (!A || !I.edges[w]) return;
        const B = A, L = I.edges[w], N = L.sourceId, H = L.targetId;
        if (B === N || B === H) return;
        const f = Object.values(I.edges).find((k) => k.targetId === B), D = Object.values(I.edges).find((k) => k.sourceId === B), W = f && D && f.sourceId !== D.targetId;
        if (d != null && d.canConnect && (W && !d.canConnect(f.sourceId, D.targetId) || !d.canConnect(N, B) || !d.canConnect(B, H)))
          return;
        const M = { ...I.edges };
        W ? (M[f.id] = {
          ...f,
          targetId: D.targetId,
          targetPortId: D.targetPortId
        }, delete M[D.id]) : (f && delete M[f.id], D && delete M[D.id]);
        const R = ((X = (S = I.nodes[B]) == null ? void 0 : S.ports[0]) == null ? void 0 : X.id) || "p_in", T = ((O = (Q = I.nodes[B]) == null ? void 0 : Q.ports.find((k) => k.id !== R)) == null ? void 0 : O.id) || R;
        M[w] = {
          ...L,
          targetId: B,
          targetPortId: R
        };
        const _ = p();
        M[_] = {
          id: _,
          sourceId: B,
          sourcePortId: T,
          targetId: H,
          targetPortId: L.targetPortId
        }, i({ ...I, edges: M });
      } else {
        const w = o;
        if (w.type === "NODE_DELETE" || w.type === "DELETE_SELECTION" || w.type === "SELECTION_DELETE") {
          const A = w.payload || {}, B = [];
          A.nodeId && B.push(A.nodeId), A.id && B.push(A.id), Array.isArray(A.selectedIds) && B.push(...A.selectedIds), Array.isArray(A.ids) && B.push(...A.ids), G(B);
        }
      }
    },
    [l, i, G]
  ), x = V(
    (o) => {
      const I = l.nodes[o] || l.containers[o];
      I && C({ entity: JSON.parse(JSON.stringify(I)), isCut: !1 });
    },
    [l]
  ), n = V(
    (o) => {
      const I = l.nodes[o] || l.containers[o];
      if (I) {
        C({ entity: JSON.parse(JSON.stringify(I)), isCut: !0 });
        const d = { ...l.nodes }, h = { ...l.containers };
        delete d[o], delete h[o], i({ ...l, nodes: d, containers: h });
      }
    },
    [l, i]
  ), e = V(() => {
    if (!r) return;
    const o = r.entity, I = `${o.id}_copy_${Date.now().toString().slice(-4)}`, d = { ...o, id: I, label: `${o.label} (Copy)` };
    "collapsed" in d ? i({
      ...l,
      containers: { ...l.containers, [I]: d }
    }) : i({
      ...l,
      nodes: { ...l.nodes, [I]: d }
    });
  }, [r, l, i]);
  return {
    graph: l,
    setGraphDirect: b,
    applyAction: E,
    undo: y,
    redo: u,
    copyEntity: x,
    cutEntity: n,
    pasteEntity: e,
    deleteSelection: G,
    canUndo: s.index > 0,
    canRedo: s.index < s.history.length - 1
  };
}
const Dt = ({
  graph: g,
  registerMeasureElement: t,
  nodeTypes: s,
  containerTypes: c
}) => {
  const r = Object.values(g.nodes), C = Object.values(g.containers);
  return /* @__PURE__ */ J("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    r.map((a) => {
      const l = a.type ? s == null ? void 0 : s[a.type] : null;
      return /* @__PURE__ */ v(
        "div",
        {
          ref: (i) => t(a.id, i),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ v(l, { node: a, selected: !1 }) : /* @__PURE__ */ J("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ v("div", { style: { fontWeight: 600 }, children: a.label }),
            a.ports.length > 0 && /* @__PURE__ */ J("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              a.ports.map((i) => i.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${a.id}`
      );
    }),
    C.map((a) => {
      const l = a.type ? c == null ? void 0 : c[a.type] : null;
      return /* @__PURE__ */ v(
        "div",
        {
          ref: (i) => t(a.id, i),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ v(l, { container: a, selected: !1 }) : /* @__PURE__ */ v("div", { className: "sysflow-container-header", children: a.label })
        },
        `measure-container-${a.id}`
      );
    })
  ] });
}, Ht = ({
  graph: g,
  layout: t,
  selectedIds: s,
  direction: c = "TB",
  showArrows: r = !0,
  routing: C = "auto",
  portOptions: a,
  enableEdgeQuickAdd: l = !0,
  onEdgeClick: i,
  onInsertNodeOnEdge: b
}) => {
  const [y, u] = oe(null), G = C === "step" || C === "auto" && (c === "LR" || c === "RL"), p = (n, e, o) => {
    var B, L, N, H;
    let I = n, d = null;
    for ((B = g.containers[n]) != null && B.collapsed && (d = g.containers[n]); I; ) {
      const f = ((L = g.nodes[I]) == null ? void 0 : L.parentId) ?? ((N = g.containers[I]) == null ? void 0 : N.parentId) ?? null;
      f && ((H = g.containers[f]) != null && H.collapsed) && (d = g.containers[f]), I = f;
    }
    if (d) {
      const f = t.containers[d.id];
      if (!f)
        return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: d.id };
      let D, W, M;
      return c === "TB" ? (D = o ? "bottom" : "top", W = f.x + f.width / 2, M = o ? f.y + f.height : f.y) : c === "BT" ? (D = o ? "top" : "bottom", W = f.x + f.width / 2, M = o ? f.y : f.y + f.height) : c === "RL" ? (D = o ? "left" : "right", W = o ? f.x : f.x + f.width, M = f.y + f.height / 2) : (D = o ? "right" : "left", W = o ? f.x + f.width : f.x, M = f.y + f.height / 2), { x: W, y: M, side: D, valid: !0, entityId: d.id };
    }
    if (!!g.containers[n]) {
      const f = t.containers[n];
      if (!f) return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: n };
      let D, W, M;
      return c === "TB" ? (D = f.x + f.width / 2, W = o ? f.y + f.height : f.y, M = o ? "bottom" : "top") : c === "BT" ? (D = f.x + f.width / 2, W = o ? f.y : f.y + f.height, M = o ? "top" : "bottom") : c === "RL" ? (D = o ? f.x : f.x + f.width, W = f.y + f.height / 2, M = o ? "left" : "right") : (D = o ? f.x + f.width : f.x, W = f.y + f.height / 2, M = o ? "right" : "left"), { x: D, y: W, side: M, valid: !0, entityId: n };
    }
    const Z = g.nodes[n], S = t.nodes[n];
    if (!Z || !S)
      return { x: 0, y: 0, side: o ? "right" : "left", valid: !1, entityId: n };
    const Q = Ze(
      Z,
      S,
      c,
      g.edges,
      a
    ).get(e);
    if (Q)
      return { x: Q.worldX, y: Q.worldY, side: Q.side, valid: !0, entityId: n };
    let O, w, A;
    return c === "TB" ? (O = S.x + S.width / 2, w = o ? S.y + S.height : S.y, A = o ? "bottom" : "top") : c === "BT" ? (O = S.x + S.width / 2, w = o ? S.y : S.y + S.height, A = o ? "top" : "bottom") : c === "RL" ? (O = o ? S.x : S.x + S.width, w = S.y + S.height / 2, A = o ? "left" : "right") : (O = o ? S.x + S.width : S.x, w = S.y + S.height / 2, A = o ? "right" : "left"), { x: O, y: w, side: A, valid: !0, entityId: n };
  }, E = (n, e) => {
    const o = (n.x + e.x) / 2, I = (n.y + e.y) / 2;
    if (n.side === "right" && e.side === "left") {
      if (e.x >= n.x + 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${o} ${n.y} L ${o} ${e.y} L ${e.x} ${e.y}`,
          center: { x: o, y: I }
        };
      {
        const d = e.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x + 20} ${n.y} L ${n.x + 20} ${d} L ${e.x - 20} ${d} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: o, y: d }
        };
      }
    }
    if (n.side === "left" && e.side === "right") {
      if (e.x <= n.x - 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${o} ${n.y} L ${o} ${e.y} L ${e.x} ${e.y}`,
          center: { x: o, y: I }
        };
      {
        const d = e.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x - 20} ${n.y} L ${n.x - 20} ${d} L ${e.x + 20} ${d} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: o, y: d }
        };
      }
    }
    if (n.side === "bottom" && e.side === "top") {
      if (e.y >= n.y + 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${I} L ${e.x} ${I} L ${e.x} ${e.y}`,
          center: { x: o, y: I }
        };
      {
        const d = e.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y + 20} L ${d} ${n.y + 20} L ${d} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`,
          center: { x: d, y: I }
        };
      }
    }
    if (n.side === "top" && e.side === "bottom") {
      if (e.y <= n.y - 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${I} L ${e.x} ${I} L ${e.x} ${e.y}`,
          center: { x: o, y: I }
        };
      {
        const d = e.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y - 20} L ${d} ${n.y - 20} L ${d} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`,
          center: { x: d, y: I }
        };
      }
    }
    return {
      pathStr: `M ${n.x} ${n.y} L ${o} ${n.y} L ${o} ${e.y} L ${e.x} ${e.y}`,
      center: { x: o, y: I }
    };
  }, x = (n, e) => {
    const o = e.x - n.x, I = e.y - n.y;
    let d = n.x, h = n.y, Z = e.x, S = e.y;
    if (n.side === "bottom" && e.side === "top")
      if (I > 0) {
        const O = Math.min(28, I * 0.4);
        h = n.y + Math.max(O, I * 0.5), S = e.y - Math.max(O, I * 0.5);
      } else {
        const O = o >= 0 ? 1 : -1, w = Math.max(40, Math.abs(o) * 0.2);
        d = n.x + w * O, h = n.y + 40, Z = e.x + w * O, S = e.y - 40;
      }
    else if (n.side === "top" && e.side === "bottom")
      if (I < 0) {
        const O = Math.min(28, Math.abs(I) * 0.4);
        h = n.y - Math.max(O, Math.abs(I) * 0.5), S = e.y + Math.max(O, Math.abs(I) * 0.5);
      } else {
        const O = o >= 0 ? 1 : -1, w = Math.max(40, Math.abs(o) * 0.2);
        d = n.x + w * O, h = n.y - 40, Z = e.x + w * O, S = e.y + 40;
      }
    else if (n.side === "right" && e.side === "left")
      o > 0 ? (d = n.x + o * 0.5, Z = e.x - o * 0.5) : (d = n.x + 50, h = n.y - 50, Z = e.x - 50, S = e.y - 50);
    else if (n.side === "left" && e.side === "right")
      o < 0 ? (d = n.x + o * 0.5, Z = e.x - o * 0.5) : (d = n.x - 50, h = n.y - 50, Z = e.x + 50, S = e.y - 50);
    else {
      const O = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, w = O[n.side] || { x: 0, y: 1 }, A = O[e.side] || { x: 0, y: -1 }, B = Math.min(60, Math.hypot(o, I) * 0.35);
      d = n.x + w.x * B, h = n.y + w.y * B, Z = e.x + A.x * B, S = e.y + A.y * B;
    }
    const X = 0.125 * n.x + 0.375 * d + 0.375 * Z + 0.125 * e.x, Q = 0.125 * n.y + 0.375 * h + 0.375 * S + 0.125 * e.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${d} ${h} ${Z} ${S} ${e.x} ${e.y}`,
      center: { x: X, y: Q }
    };
  };
  return /* @__PURE__ */ J("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ J("defs", { children: [
      /* @__PURE__ */ v(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ v("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ v(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ v("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(g.edges).map((n) => {
      const e = p(n.sourceId, n.sourcePortId, !0), o = p(n.targetId, n.targetPortId, !1);
      if (!e.valid || !o.valid || e.entityId === o.entityId) return null;
      const I = s.includes(n.id), d = y === n.id, { pathStr: h, center: Z } = G ? E(e, o) : x(e, o);
      return /* @__PURE__ */ J(
        "g",
        {
          onMouseEnter: () => u(n.id),
          onMouseLeave: () => u(null),
          children: [
            /* @__PURE__ */ v(
              "path",
              {
                d: h,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (S) => {
                  S.stopPropagation(), i == null || i(n.id);
                }
              }
            ),
            /* @__PURE__ */ v(
              "path",
              {
                d: h,
                fill: "none",
                stroke: I ? "var(--sysflow-edge-selected)" : d ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: I ? 2.5 : d ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: r ? I ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            l && d && b && /* @__PURE__ */ v("g", { transform: `translate(${Z.x}, ${Z.y})`, children: /* @__PURE__ */ J(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (S) => {
                  S.preventDefault(), S.stopPropagation(), b(n);
                },
                children: [
                  /* @__PURE__ */ v("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ v(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ v(
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
        n.id
      );
    })
  ] });
}, Pt = ({
  entity: g,
  layout: t,
  direction: s = "LR",
  edges: c,
  portOptions: r,
  onPortPointerDown: C,
  onPortPointerUp: a
}) => {
  if (!g.ports || g.ports.length === 0)
    return null;
  const l = Ze(
    g,
    t,
    s,
    c,
    r
  );
  return /* @__PURE__ */ v(Ee, { children: g.ports.map((i) => {
    const b = l.get(i.id);
    return b ? /* @__PURE__ */ v(
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
        title: `${i.label} (${b.side})`,
        onPointerDown: (y) => {
          y.stopPropagation(), C == null || C(g.id, i.id, !0, y);
        },
        onPointerUp: (y) => {
          y.stopPropagation(), a == null || a(g.id, i.id, !1);
        }
      },
      i.id
    ) : null;
  }) });
}, vt = ({
  node: g,
  layout: t,
  selected: s = !1,
  direction: c = "LR",
  edges: r,
  portOptions: C,
  enableQuickAdd: a = !1,
  onAddConnectedNode: l,
  onPointerDown: i,
  onMouseEnter: b,
  onMouseLeave: y,
  onClick: u,
  onPortPointerDown: G,
  onPortPointerUp: p,
  customRenderer: E
}) => {
  const [x, n] = oe(!1);
  return /* @__PURE__ */ J(
    "div",
    {
      className: `sysflow-node ${s ? "sysflow-selected" : ""} ${g.className || ""}`,
      style: {
        transform: `translate(${t.x}px, ${t.y}px)`,
        width: `${t.width}px`,
        height: `${t.height}px`
      },
      onPointerDown: (e) => i == null ? void 0 : i(g, e),
      onMouseEnter: () => {
        n(!0), b == null || b(g.id);
      },
      onMouseLeave: () => {
        n(!1), y == null || y(g.id);
      },
      onClick: u,
      children: [
        a && x && /* @__PURE__ */ J(Ee, { children: [
          /* @__PURE__ */ v("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ v("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        a && x && l && /* @__PURE__ */ v(
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
              e.preventDefault(), e.stopPropagation(), l(g, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ v(
          Pt,
          {
            entity: g,
            layout: t,
            direction: c,
            edges: r,
            portOptions: C,
            onPortPointerDown: G,
            onPortPointerUp: p
          }
        ),
        E ? /* @__PURE__ */ v(E, { node: g, selected: s }) : /* @__PURE__ */ J("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ v("div", { style: { fontWeight: 600, fontSize: "13px" }, children: g.label }),
          g.ports.length > 0 && /* @__PURE__ */ J("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            g.ports.length,
            " Port",
            g.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        a && x && l && /* @__PURE__ */ v(
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
              e.preventDefault(), e.stopPropagation(), l(g, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Nt = ({
  container: g,
  layout: t,
  selected: s,
  isHovered: c = !1,
  hasChildren: r = !1,
  onToggleCollapse: C,
  onPointerDown: a,
  onMouseEnter: l,
  onMouseLeave: i,
  onClick: b,
  customRenderer: y
}) => /* @__PURE__ */ v(
  "div",
  {
    className: `sysflow-container ${s ? "sysflow-selected" : ""} ${c ? "sysflow-hovered" : ""} ${g.className || ""}`,
    style: {
      transform: `translate(${t.x}px, ${t.y}px)`,
      width: `${t.width}px`,
      height: `${t.height}px`
    },
    onPointerDown: (u) => a(g, u),
    onMouseEnter: l,
    onMouseLeave: i,
    onClick: b,
    children: y ? /* @__PURE__ */ v(y, { container: g, selected: s }) : /* @__PURE__ */ J(Ee, { children: [
      /* @__PURE__ */ J("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ v("span", { className: "sysflow-container-title", title: g.label, children: g.label }),
        /* @__PURE__ */ v(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (u) => u.stopPropagation(),
            onPointerUp: (u) => u.stopPropagation(),
            onClick: (u) => {
              u.stopPropagation(), C(g.id, !g.collapsed);
            },
            children: g.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !g.collapsed && !r && /* @__PURE__ */ v("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Yt = new St(), Vt = ({
  graph: g,
  onChange: t,
  history: s,
  enableShortcuts: c = !0,
  onNodeClick: r,
  onEdgeClick: C,
  layoutEngine: a,
  interactionStrategy: l = Yt,
  direction: i = "TB",
  layoutOptions: b,
  portPlacementMode: y,
  routing: u,
  showEdgeArrows: G = !0,
  nodeTypes: p,
  containerTypes: E,
  zoomBounds: x,
  className: n = "",
  selectedIds: e = [],
  theme: o = "dark",
  enableQuickAdd: I,
  enableEdgeQuickAdd: d
}) => {
  var He, Pe;
  const h = Ie(null), Z = Ie(null);
  !a && !Z.current && (Z.current = new pt());
  const S = a || Z.current, {
    transform: X,
    screenToWorld: Q,
    onWheel: O,
    startPan: w,
    updatePan: A,
    endPan: B,
    resetTransform: L,
    zoomIn: N,
    zoomOut: H,
    zoomToFit: f,
    isPanning: D
  } = Lt(h, x), { measurements: W, registerMeasureElement: M } = Kt(g), [R, T] = oe({ nodes: {}, containers: {} }), _ = Ct(() => ({
    direction: i,
    mode: y ?? (i === "TB" || i === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: R.nodes
  }), [i, y, R.nodes]), [k, ee] = oe(null), [z, se] = oe(null), re = Ie(!1), {
    dragState: ce,
    hoveredContainerId: Fe,
    handlePointerDown: De,
    handlePointerMove: je,
    handlePointerUp: $e
  } = Et(g, R, l, Q, t);
  Ke(() => {
    const m = (K) => {
      var ge, F, Ce, we;
      if (K.target instanceof HTMLInputElement || K.target instanceof HTMLTextAreaElement || K.target instanceof HTMLElement && K.target.isContentEditable)
        return;
      const Y = K.ctrlKey || K.metaKey, $ = K.key.toLowerCase();
      if (c !== !1 && s) {
        if (Y && $ === "z") {
          K.preventDefault(), K.shiftKey ? s.redo() : s.undo();
          return;
        }
        if (Y && $ === "y") {
          K.preventDefault(), s.redo();
          return;
        }
        if (Y && $ === "c" && e[0]) {
          K.preventDefault(), (ge = s.copyEntity) == null || ge.call(s, e[0]);
          return;
        }
        if (Y && $ === "x" && e[0]) {
          K.preventDefault(), (F = s.cutEntity) == null || F.call(s, e[0]);
          return;
        }
        if (Y && $ === "v") {
          K.preventDefault(), (Ce = s.pasteEntity) == null || Ce.call(s);
          return;
        }
        if (K.key === "Delete" || K.key === "Backspace") {
          K.preventDefault(), (we = s.deleteSelection) == null || we.call(s, e), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
          return;
        }
      }
      if (K.key === "Escape") {
        K.preventDefault(), se(null), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (K.code === "Space" && (re.current = !0), K.key.toLowerCase() === "f" && !Y) {
        K.preventDefault(), f(R);
        return;
      }
      if (Y && $ === "a") {
        K.preventDefault();
        const te = [
          ...Object.keys(g.nodes),
          ...Object.keys(g.containers)
        ];
        t({ type: "SELECTION_CHANGE", payload: { selectedIds: te } });
        return;
      }
      const j = Object.keys(g.nodes);
      if (j.length !== 0) {
        if (K.key === "Tab") {
          K.preventDefault();
          const te = e.length > 0 ? j.indexOf(e[0]) : -1;
          let ne;
          K.shiftKey ? ne = te <= 0 ? j.length - 1 : te - 1 : ne = (te + 1) % j.length, t({ type: "SELECTION_CHANGE", payload: { selectedIds: [j[ne]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(K.key)) {
          K.preventDefault();
          const te = e[0] || j[0], ne = R.nodes[te] || R.containers[te];
          if (!ne) return;
          const Be = {
            x: ne.x + ne.width / 2,
            y: ne.y + ne.height / 2
          };
          let Ae = null, he = 1 / 0;
          for (const q of j) {
            if (q === te) continue;
            const U = R.nodes[q];
            if (!U) continue;
            const ae = {
              x: U.x + U.width / 2,
              y: U.y + U.height / 2
            }, le = ae.x - Be.x, de = ae.y - Be.y;
            let ie = !1;
            if (K.key === "ArrowRight" && le > 20 && (ie = !0), K.key === "ArrowLeft" && le < -20 && (ie = !0), K.key === "ArrowDown" && de > 20 && (ie = !0), K.key === "ArrowUp" && de < -20 && (ie = !0), ie) {
              const xe = Math.hypot(le, de);
              xe < he && (he = xe, Ae = q);
            }
          }
          Ae && t({ type: "SELECTION_CHANGE", payload: { selectedIds: [Ae] } });
        }
      }
    }, P = (K) => {
      K.code === "Space" && (re.current = !1);
    };
    return window.addEventListener("keydown", m), window.addEventListener("keyup", P), () => {
      window.removeEventListener("keydown", m), window.removeEventListener("keyup", P);
    };
  }, [g, R, e, f, t]), Ke(() => {
    let m = !1, P = 16 / 9;
    if (h.current) {
      const Y = h.current.getBoundingClientRect();
      Y.width > 0 && Y.height > 0 && (P = Y.width / Y.height);
    }
    const K = {
      direction: i,
      aspectRatio: P,
      ...b
    };
    return S.execute(g, W, K).then((Y) => {
      m || T(Y);
    }), () => {
      m = !0;
    };
  }, [g, W, S, i, b]);
  const Ue = (m, P, K, Y) => {
    const $ = g.nodes[m] || g.containers[m], j = R.nodes[m] || R.containers[m];
    if (!$ || !j) return;
    const F = Ze(
      $,
      j,
      i,
      g.edges,
      _
    ).get(P), Ce = F ? { x: F.worldX, y: F.worldY } : { x: j.x + j.width, y: j.y + j.height / 2 };
    ee({
      sourceId: m,
      sourcePortId: P,
      startWorldPos: Ce,
      currentWorldPos: Q(Y.clientX, Y.clientY)
    });
  }, Je = (m, P, K) => {
    var Y, $, j, ge, F, Ce, we, te, ne, Be;
    if (k && k.sourceId !== m) {
      const Ae = g.nodes[k.sourceId] || g.containers[k.sourceId], he = g.nodes[m] || g.containers[m], q = (Y = Ae == null ? void 0 : Ae.ports) == null ? void 0 : Y.find((fe) => fe.id === k.sourcePortId), U = ($ = he == null ? void 0 : he.ports) == null ? void 0 : $.find((fe) => fe.id === P);
      let ae = k.sourceId, le = k.sourcePortId, de = m, ie = P;
      const xe = ((j = q == null ? void 0 : q.label) == null ? void 0 : j.toLowerCase().includes("in")) || (q == null ? void 0 : q.side) === (i === "BT" ? "bottom" : "top"), it = ((ge = q == null ? void 0 : q.label) == null ? void 0 : ge.toLowerCase().includes("out")) || (q == null ? void 0 : q.side) === (i === "BT" ? "top" : "bottom"), It = ((F = U == null ? void 0 : U.label) == null ? void 0 : F.toLowerCase().includes("in")) || (U == null ? void 0 : U.side) === (i === "BT" ? "bottom" : "top"), dt = ((Ce = U == null ? void 0 : U.label) == null ? void 0 : Ce.toLowerCase().includes("out")) || (U == null ? void 0 : U.side) === (i === "BT" ? "top" : "bottom");
      if (xe && dt)
        ae = m, le = P, de = k.sourceId, ie = k.sourcePortId;
      else if (it && It)
        ae = k.sourceId, le = k.sourcePortId, de = m, ie = P;
      else if (R.nodes[k.sourceId] && R.nodes[m]) {
        const fe = R.nodes[k.sourceId], ve = R.nodes[m], rt = i === "BT" && fe.y < ve.y, ct = i === "TB" && fe.y > ve.y;
        if (rt || ct) {
          ae = m, de = k.sourceId;
          const pe = g.nodes[ae], Se = g.nodes[de];
          le = ((te = (we = pe == null ? void 0 : pe.ports) == null ? void 0 : we.find((be) => be.label.includes("out") || be.side === (i === "BT" ? "top" : "bottom"))) == null ? void 0 : te.id) || P, ie = ((Be = (ne = Se == null ? void 0 : Se.ports) == null ? void 0 : ne.find((be) => be.label.includes("in") || be.side === (i === "BT" ? "bottom" : "top"))) == null ? void 0 : Be.id) || k.sourcePortId;
        }
      }
      t({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: ae,
            sourcePortId: le,
            targetId: de,
            targetPortId: ie
          }
        }
      });
    }
    ee(null);
  }, _e = (m) => {
    if (m.button === 1 || re.current) {
      w(m.clientX, m.clientY);
      return;
    }
    const P = m.target, K = P === h.current || P.classList.contains("sysflow-viewport") || P.classList.contains("sysflow-dom-layer") || P.tagName.toLowerCase() === "svg";
    if (m.button === 0 && K) {
      m.currentTarget.setPointerCapture(m.pointerId);
      const Y = Q(m.clientX, m.clientY);
      se({
        startX: Y.x,
        startY: Y.y,
        currentX: Y.x,
        currentY: Y.y
      }), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, qe = (m) => {
    if (D.current)
      A(m.clientX, m.clientY);
    else if (z) {
      const P = Q(m.clientX, m.clientY);
      se((K) => K ? { ...K, currentX: P.x, currentY: P.y } : null);
    } else ce ? je(m) : k && ee(
      (P) => P ? { ...P, currentWorldPos: Q(m.clientX, m.clientY) } : null
    );
  }, et = (m) => {
    if (m.currentTarget.hasPointerCapture(m.pointerId) && m.currentTarget.releasePointerCapture(m.pointerId), D.current && B(), z) {
      const P = Math.min(z.startX, z.currentX), K = Math.min(z.startY, z.currentY), Y = Math.max(z.startX, z.currentX), $ = Math.max(z.startY, z.currentY);
      if (Y - P > 4 || $ - K > 4) {
        const j = [];
        for (const [ge, F] of Object.entries(R.nodes))
          F.x < Y && F.x + F.width > P && F.y < $ && F.y + F.height > K && j.push(ge);
        for (const [ge, F] of Object.entries(R.containers))
          F.x < Y && F.x + F.width > P && F.y < $ && F.y + F.height > K && j.push(ge);
        t({ type: "SELECTION_CHANGE", payload: { selectedIds: j } });
      }
      se(null);
    }
    ce && $e(m), k && ee(null);
  }, tt = I ?? (b == null ? void 0 : b.mode) === "flow", ye = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (m) => {
    const P = Math.random() * 16 | 0;
    return (m === "x" ? P : P & 3 | 8).toString(16);
  }), nt = V(
    (m, P) => {
      const K = ye(), Y = ye();
      t({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: m,
          position: P,
          direction: i,
          suggestedNewNodeId: K,
          suggestedNewEdgeId: Y
        }
      });
    },
    [i, t]
  ), ot = d ?? I ?? (b == null ? void 0 : b.mode) === "flow", st = V(
    (m) => {
      const P = ye(), K = ye(), Y = ye();
      t({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: m,
          direction: i,
          suggestedNewNodeId: P,
          suggestedNewEdge1Id: K,
          suggestedNewEdge2Id: Y
        }
      }), t({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [P] }
      });
    },
    [i, t]
  ), gt = Object.values(g.containers);
  return /* @__PURE__ */ J(
    "div",
    {
      ref: h,
      className: `sysflow-canvas ${o === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${n}`,
      "data-theme": o,
      onWheel: O,
      onPointerDown: _e,
      onPointerMove: qe,
      onPointerUp: et,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ v(
          Dt,
          {
            graph: g,
            registerMeasureElement: M,
            nodeTypes: p,
            containerTypes: E
          }
        ),
        /* @__PURE__ */ J("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ v("button", { onClick: N, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ v("button", { onClick: H, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ J("button", { onClick: L, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(X.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ J(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${X.x}px, ${X.y}px) scale(${X.zoom})`
            },
            children: [
              z && /* @__PURE__ */ v(
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
              k && /* @__PURE__ */ v("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ v(
                "line",
                {
                  x1: k.startWorldPos.x,
                  y1: k.startWorldPos.y,
                  x2: k.currentWorldPos.x,
                  y2: k.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ v("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: gt.map((m) => {
                const P = R.containers[m.id];
                if (!P) return null;
                const K = Object.values(g.nodes).some((Y) => Y.parentId === m.id) || Object.values(g.containers).some((Y) => Y.parentId === m.id);
                return /* @__PURE__ */ v(
                  Nt,
                  {
                    container: m,
                    layout: P,
                    selected: e.includes(m.id),
                    isHovered: Fe === m.id,
                    hasChildren: K,
                    customRenderer: m.type ? E == null ? void 0 : E[m.type] : void 0,
                    onToggleCollapse: (Y, $) => t({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: Y, collapsed: $ }
                    }),
                    onPointerDown: De,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (Y) => {
                      Y.stopPropagation(), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [m.id] } });
                    }
                  },
                  m.id
                );
              }) }),
              /* @__PURE__ */ v(
                Ht,
                {
                  graph: g,
                  layout: R,
                  selectedIds: e,
                  direction: i,
                  showArrows: G,
                  routing: u,
                  portOptions: _,
                  enableEdgeQuickAdd: ot,
                  onInsertNodeOnEdge: st,
                  onEdgeClick: (m) => t({ type: "SELECTION_CHANGE", payload: { selectedIds: [m] } })
                }
              ),
              /* @__PURE__ */ v("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(g.nodes).map((m) => {
                const P = R.nodes[m.id];
                return P ? /* @__PURE__ */ v(
                  vt,
                  {
                    node: m,
                    layout: P,
                    direction: i,
                    edges: g.edges,
                    portOptions: _,
                    selected: e.includes(m.id),
                    customRenderer: m.type ? p == null ? void 0 : p[m.type] : void 0,
                    enableQuickAdd: tt,
                    onAddConnectedNode: nt,
                    onPointerDown: De,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (K) => {
                      K.stopPropagation(), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [m.id] } }), r == null || r(m.id, m);
                    },
                    onPortPointerDown: Ue,
                    onPortPointerUp: Je
                  },
                  m.id
                ) : null;
              }) }),
              ce && /* @__PURE__ */ v(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ce.ghostPosition.x}px, ${ce.ghostPosition.y}px)`,
                    width: `${((He = W.get(ce.draggedEntity.id)) == null ? void 0 : He.width) || 200}px`,
                    height: `${((Pe = W.get(ce.draggedEntity.id)) == null ? void 0 : Pe.height) || 64}px`
                  },
                  children: /* @__PURE__ */ v("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ce.draggedEntity.label })
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
  Tt as EdgeRewireStrategy,
  Nt as GraphContainer,
  Ht as GraphEdgeLayer,
  vt as GraphNode,
  Pt as GraphPortLayer,
  St as ReparentStrategy,
  mt as SugiyamaEngine,
  Vt as SysFlowCanvas,
  pt as WorkerBridge,
  Ze as computeEntityPortLocations,
  Ne as pruneDanglingEdges,
  Ve as resolveEffectiveEntityId,
  Lt as useCanvasTransform,
  Et as useDragGesture,
  Ot as useGraphHistory,
  Kt as useMeasurement
};
