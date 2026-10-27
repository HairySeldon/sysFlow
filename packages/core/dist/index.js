var ct = Object.defineProperty;
var at = (g, t, o) => t in g ? ct(g, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : g[t] = o;
var Be = (g, t, o) => at(g, typeof t != "symbol" ? t + "" : t, o);
import { useState as ne, useRef as ie, useCallback as V, useEffect as Le, useMemo as lt } from "react";
import { jsxs as _, jsx as v, Fragment as Ke } from "react/jsx-runtime";
function Ct(g, t, o, r) {
  const I = (l) => {
    const c = o.find(
      (w) => w.sourceId === t && w.sourcePortId === l || w.targetId === t && w.targetPortId === l
    );
    if (!c) return null;
    const a = c.sourceId === t ? c.targetId : c.sourceId, i = r[a];
    return i ? { x: i.x + i.width / 2, y: i.y + i.height / 2 } : null;
  };
  ["left", "right"].forEach((l) => {
    g[l].sort((c, a) => {
      var h, u;
      const i = ((h = I(c.id)) == null ? void 0 : h.y) ?? 0, w = ((u = I(a.id)) == null ? void 0 : u.y) ?? 0;
      return i - w;
    });
  }), ["top", "bottom"].forEach((l) => {
    g[l].sort((c, a) => {
      var h, u;
      const i = ((h = I(c.id)) == null ? void 0 : h.x) ?? 0, w = ((u = I(a.id)) == null ? void 0 : u.x) ?? 0;
      return i - w;
    });
  });
}
function At(g, t, o, r, I, l) {
  if (!I || !l)
    return o ? "left" : "right";
  const c = r.find(
    (u) => o ? u.targetId === g && u.targetPortId === t : u.sourceId === g && u.sourcePortId === t
  );
  if (!c) return o ? "left" : "right";
  const a = o ? c.sourceId : c.targetId, i = I[a];
  if (!i) return o ? "left" : "right";
  const w = i.x + i.width / 2 - (l.x + l.width / 2), h = i.y + i.height / 2 - (l.y + l.height / 2);
  return Math.abs(w) > Math.abs(h) ? w > 0 ? "right" : "left" : h > 0 ? "bottom" : "top";
}
function Ee(g, t, o = "LR", r, I) {
  const l = /* @__PURE__ */ new Map();
  if (!g || !t || !g.ports || g.ports.length === 0)
    return l;
  const c = (I == null ? void 0 : I.direction) || o, a = c === "TB" || c === "BT", i = (I == null ? void 0 : I.mode) || (a ? "strict-flow" : "perimeter-optimized"), w = r ? Array.isArray(r) ? r : Object.values(r) : [], h = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, u = new Set(
    w.filter((S) => S.targetId === g.id).map((S) => S.targetPortId)
  );
  new Set(
    w.filter((S) => S.sourceId === g.id).map((S) => S.sourcePortId)
  ), g.ports.forEach((S) => {
    let Z = S.side || "auto";
    if (Z !== "auto") {
      h[Z].push(S);
      return;
    }
    if (i === "strict-flow") {
      const b = u.has(S.id) || S.label.toLowerCase().includes("in");
      switch (c) {
        case "BT":
          Z = b ? "bottom" : "top";
          break;
        case "TB":
          Z = b ? "top" : "bottom";
          break;
        case "RL":
          Z = b ? "right" : "left";
          break;
        case "LR":
        default:
          Z = b ? "left" : "right";
          break;
      }
    } else
      Z = At(
        g.id,
        S.id,
        u.has(S.id),
        w,
        I == null ? void 0 : I.nodeLayouts,
        t
      );
    h[Z].push(S);
  }), i === "perimeter-optimized" && (I != null && I.nodeLayouts) && Ct(h, g.id, w, I.nodeLayouts);
  const G = (S, Z) => {
    const b = S.length;
    S.forEach((n, e) => {
      let s = 0, d = 0;
      Z === "left" || Z === "right" ? (d = t.height / (b + 1) * (e + 1), s = Z === "left" ? 0 : t.width) : (s = t.width / (b + 1) * (e + 1), d = Z === "top" ? 0 : t.height), l.set(n.id, {
        portId: n.id,
        side: Z,
        localX: s,
        localY: d,
        worldX: t.x + s,
        worldY: t.y + d
      });
    });
  };
  return G(h.left, "left"), G(h.right, "right"), G(h.top, "top"), G(h.bottom, "bottom"), l;
}
function ve(g) {
  const t = {}, o = (r) => {
    var l;
    const I = g.nodes[r];
    return new Set(((l = I == null ? void 0 : I.ports) == null ? void 0 : l.map((c) => c.id)) || []);
  };
  for (const [r, I] of Object.entries(g.edges)) {
    const l = o(I.sourceId), c = o(I.targetId), a = l.has(I.sourcePortId), i = c.has(I.targetPortId);
    a && i && (t[r] = I);
  }
  return {
    ...g,
    edges: t
  };
}
class ut {
  static assignDynamicPortSides(t, o, r) {
    var l, c;
    const I = (a) => o[a] || r[a];
    for (const a of Object.values(t.edges)) {
      const i = I(a.sourceId), w = I(a.targetId);
      if (!i || !w) continue;
      const h = t.nodes[a.sourceId] || t.containers[a.sourceId], u = t.nodes[a.targetId] || t.containers[a.targetId], G = w.x + w.width / 2 - (i.x + i.width / 2), S = w.y + w.height / 2 - (i.y + i.height / 2), Z = Math.abs(G) > Math.abs(S) * 1.25, b = (l = h == null ? void 0 : h.ports) == null ? void 0 : l.find((e) => e.id === a.sourcePortId);
      b && (!b.side || b.side === "auto") && (Z ? b.side = G >= 0 ? "right" : "left" : b.side = S >= 0 ? "bottom" : "top");
      const n = (c = u == null ? void 0 : u.ports) == null ? void 0 : c.find((e) => e.id === a.targetPortId);
      n && (!n.side || n.side === "auto") && (Z ? n.side = G >= 0 ? "left" : "right" : n.side = S >= 0 ? "top" : "bottom");
    }
  }
}
const Ne = 22, Ye = 18, We = 38, xe = 210, Me = 36, ht = 180, ft = 54, Re = 260, Xe = 160;
class Ze {
  static execute(t, o, r) {
    var n;
    const I = {}, l = {}, c = (e) => {
      var A, y, D, p, O;
      const s = !!t.containers[e], d = !!((A = t.containers[e]) != null && A.collapsed);
      return s && d ? { width: xe, height: Me } : s && !d ? {
        width: ((y = r.get(e)) == null ? void 0 : y.width) || Re,
        height: ((D = r.get(e)) == null ? void 0 : D.height) || Xe
      } : {
        width: ((p = r.get(e)) == null ? void 0 : p.width) || ht,
        height: ((O = r.get(e)) == null ? void 0 : O.height) || ft
      };
    }, a = /* @__PURE__ */ new Map();
    for (const [e, s] of Object.entries(t.nodes)) {
      const d = s.parentId ?? null;
      a.has(d) || a.set(d, []), a.get(d).push(e);
    }
    for (const [e, s] of Object.entries(t.containers)) {
      const d = s.parentId ?? null;
      a.has(d) || a.set(d, []), a.get(d).push(e);
    }
    const i = Ze.getContainerDepths(t), w = Object.keys(t.containers).sort(
      (e, s) => (i.get(s) || 0) - (i.get(e) || 0)
    ), h = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), G = (e) => h.has(e) ? h.get(e) : c(e);
    for (const e of w) {
      if (!!((n = t.containers[e]) != null && n.collapsed)) {
        h.set(e, {
          width: xe,
          height: Me
        });
        continue;
      }
      const d = a.get(e) || [];
      if (d.length === 0) {
        h.set(e, {
          width: Re,
          height: Xe
        });
        continue;
      }
      const A = o.arrange(e, d, t, G);
      for (const p of A.boxes)
        u.set(p.id, p);
      const y = Math.max(A.width + Ne * 2, xe), D = A.height + We + Ye * 2;
      h.set(e, { width: y, height: D });
    }
    const S = a.get(null) || [];
    let Z = [];
    S.length > 0 && (Z = o.arrange(null, S, t, G).boxes.map((s) => ({
      ...s,
      localX: s.localX + 60,
      localY: s.localY + 60
    })));
    const b = (e, s, d, A, y) => {
      var O;
      const D = !!t.containers[e], p = { id: e, x: s, y: d, width: A, height: y };
      if (D) {
        if (l[e] = p, (O = t.containers[e]) != null && O.collapsed) return;
        const Q = s + Ne, f = d + We + Ye, x = a.get(e) || [];
        for (const C of x) {
          const L = u.get(C);
          L && b(
            C,
            Q + L.localX,
            f + L.localY,
            L.width,
            L.height
          );
        }
      } else
        I[e] = p;
    };
    for (const e of Z)
      b(e.id, e.localX, e.localY, e.width, e.height);
    return ut.assignDynamicPortSides(t, I, l), { nodes: I, containers: l };
  }
  static getContainerDepths(t) {
    const o = /* @__PURE__ */ new Map(), r = (I) => {
      var a;
      if (o.has(I)) return o.get(I);
      const l = (a = t.containers[I]) == null ? void 0 : a.parentId;
      if (!l || !t.containers[l])
        return o.set(I, 0), 0;
      const c = 1 + r(l);
      return o.set(I, c), c;
    };
    for (const I of Object.keys(t.containers))
      r(I);
    return o;
  }
}
const yt = 70, me = 28;
class wt {
  constructor(t = {}) {
    this.options = t;
  }
  arrange(t, o, r, I) {
    if (o.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const l = this.options.direction ?? "TB", c = l === "TB" || l === "BT", a = l === "BT" || l === "RL", i = new Set(o), w = [], h = /* @__PURE__ */ new Set();
    for (const C of Object.values(r.edges)) {
      const L = this.resolveToDirectChild(C.sourceId, i, r), k = this.resolveToDirectChild(C.targetId, i, r);
      if (L && k && L !== k) {
        const H = `${L}->${k}`;
        h.has(H) || (h.add(H), w.push({ sourceId: L, targetId: k }));
      }
    }
    const u = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map();
    for (const C of o)
      u.set(C, 0), G.set(C, []), S.set(C, []);
    for (const C of w)
      G.get(C.sourceId).push(C.targetId), S.get(C.targetId).push(C.sourceId), u.set(C.targetId, (u.get(C.targetId) || 0) + 1);
    const Z = /* @__PURE__ */ new Map(), b = o.filter((C) => (u.get(C) || 0) === 0);
    for (const C of b) Z.set(C, 0);
    const n = /* @__PURE__ */ new Set();
    for (; b.length > 0; ) {
      const C = b.shift();
      n.add(C);
      const L = Z.get(C);
      for (const k of G.get(C)) {
        const H = Math.max(Z.get(k) || 0, L + 1);
        Z.set(k, H), u.set(k, u.get(k) - 1), u.get(k) === 0 && b.push(k);
      }
    }
    for (const C of o)
      n.has(C) || Z.set(C, 0);
    const e = /* @__PURE__ */ new Map();
    for (const [C, L] of Z.entries())
      e.has(L) || e.set(L, []), e.get(L).push(C);
    const s = Array.from(e.keys()).sort((C, L) => C - L), d = a ? [...s].reverse() : s, A = /* @__PURE__ */ new Map(), y = (C) => {
      const L = I(C);
      return c ? L.width : L.height;
    };
    for (const C of s) {
      const L = e.get(C) || [];
      let k = -1 / 0;
      for (const H of L) {
        const N = y(H), B = S.get(H) || [];
        let M = null;
        if (B.length > 0) {
          const R = B.map((K) => {
            const j = A.get(K);
            return j === void 0 ? null : j + y(K) / 2;
          }).filter((K) => K !== null);
          R.length > 0 && (M = R.reduce((K, j) => K + j, 0) / R.length);
        }
        let P = M !== null ? M - N / 2 : 0;
        P < k + me && (P = k === -1 / 0 ? 0 : k + me), A.set(H, P), k = P + N;
      }
    }
    for (let C = s.length - 1; C >= 0; C--) {
      const L = s[C], k = e.get(L) || [];
      for (const N of k) {
        const B = G.get(N) || [];
        if (B.length === 0) continue;
        const M = B.map((P) => {
          const R = A.get(P);
          return R === void 0 ? null : R + y(P) / 2;
        }).filter((P) => P !== null);
        if (M.length > 0) {
          const P = M.reduce((K, j) => K + j, 0) / M.length, R = y(N);
          A.set(N, P - R / 2);
        }
      }
      let H = -1 / 0;
      for (const N of k) {
        const B = y(N);
        let M = A.get(N) ?? 0;
        M < H + me && (M = H === -1 / 0 ? 0 : H + me, A.set(N, M)), H = M + B;
      }
    }
    let D = 1 / 0;
    for (const C of A.values())
      D = Math.min(D, C);
    const p = D < 0 ? -D : 0, O = [];
    let Q = 0;
    for (const C of d) {
      const L = e.get(C);
      let k = 0;
      for (const H of L) {
        const N = I(H), B = c ? N.height : N.width, M = (A.get(H) ?? 0) + p, P = c ? M : Q, R = c ? Q : M;
        O.push({ id: H, localX: P, localY: R, width: N.width, height: N.height }), k = Math.max(k, B);
      }
      Q += k + yt;
    }
    const f = Math.max(...O.map((C) => C.localX + C.width), 0), x = Math.max(...O.map((C) => C.localY + C.height), 0);
    return { width: f, height: x, boxes: O };
  }
  resolveToDirectChild(t, o, r) {
    var l, c;
    let I = t;
    for (; I; ) {
      if (o.has(I)) return I;
      I = ((l = r.nodes[I]) == null ? void 0 : l.parentId) ?? ((c = r.containers[I]) == null ? void 0 : c.parentId) ?? null;
    }
    return null;
  }
}
const Ae = 32, Te = 24;
class Bt {
  constructor(t = 1.55) {
    this.targetAspect = t;
  }
  arrange(t, o, r, I) {
    if (o.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const l = o.map((a) => {
      const i = I(a);
      return { id: a, width: i.width, height: i.height };
    }), c = this.findBestTightPacking(l, this.targetAspect);
    return { width: c.width, height: c.height, boxes: c.boxes };
  }
  findBestTightPacking(t, o) {
    if (t.length === 1)
      return {
        width: t[0].width,
        height: t[0].height,
        boxes: [{ id: t[0].id, localX: 0, localY: 0, width: t[0].width, height: t[0].height }],
        score: 0
      };
    const r = t.reduce((u, G) => u + G.width * G.height, 0), I = Math.max(...t.map((u) => u.width)), l = [...t].sort((u, G) => G.width - u.width), c = /* @__PURE__ */ new Set(), a = t.reduce((u, G) => u + G.width, 0) + (t.length - 1) * Ae;
    c.add(a), c.add(I);
    const i = Math.max(I, Math.sqrt(r * o));
    c.add(i), c.add(i * 0.85), c.add(i * 1.15);
    const w = Math.min(t.length, 6);
    for (let u = 2; u <= w; u++) {
      let G = 0;
      for (let S = 0; S < u && S < l.length; S++)
        G += l[S].width;
      G += (u - 1) * Ae, G >= I && c.add(G);
    }
    let h = null;
    for (const u of c) {
      const G = this.simulateSkylinePacking(t, u), S = G.width * G.height, Z = Math.max(0, S - r), b = G.width / Math.max(1, G.height), n = Math.abs(Math.log(b / o)), e = Z / r * 2 + n * 0.25;
      G.score = e, (!h || e < h.score) && (h = G);
    }
    return h;
  }
  simulateSkylinePacking(t, o) {
    const r = [...t].sort((i, w) => w.height - i.height), I = [{ x: 0, width: o, y: 0 }], l = [];
    for (const i of r) {
      let w = 1 / 0, h = -1;
      for (let e = 0; e < I.length; e++) {
        if (I[e].x + i.width > o) continue;
        let d = 0, A = 0;
        for (let y = e; y < I.length && A < i.width; y++)
          d = Math.max(d, I[y].y), A += I[y].width;
        d < w && (w = d, h = e);
      }
      if (h === -1) {
        const e = Math.max(...I.map((d) => d.y)), s = e === 0 ? 0 : e + Te;
        l.push({ id: i.id, localX: 0, localY: s, width: i.width, height: i.height }), I.length = 0, I.push({ x: 0, width: i.width + Ae, y: s + i.height }), o > i.width + Ae && I.push({
          x: i.width + Ae,
          width: o - (i.width + Ae),
          y: 0
        });
        continue;
      }
      const u = I[h].x, G = w === 0 ? 0 : w + Te;
      l.push({ id: i.id, localX: u, localY: G, width: i.width, height: i.height });
      const S = i.width + Ae, Z = G + i.height, b = { x: u, width: S, y: Z }, n = [];
      for (const e of I)
        e.x + e.width <= u || e.x >= u + S ? n.push(e) : (e.x < u && n.push({ x: e.x, width: u - e.x, y: e.y }), e.x + e.width > u + S && n.push({
          x: u + S,
          width: e.x + e.width - (u + S),
          y: e.y
        }));
      n.push(b), n.sort((e, s) => e.x - s.x), I.length = 0, I.push(...n);
    }
    const c = Math.max(...l.map((i) => i.localX + i.width), 0), a = Math.max(...l.map((i) => i.localY + i.height), 0);
    return { width: c, height: a, boxes: l, score: 0 };
  }
}
function Oe(g, t, o) {
  var l, c;
  let r = g, I = null;
  for (; r; )
    o.has(r) && (I = r), r = ((l = t.nodes[r]) == null ? void 0 : l.parentId) ?? ((c = t.containers[r]) == null ? void 0 : c.parentId) ?? void 0;
  return I ?? g;
}
class bt {
  async execute(t, o, r) {
    const I = Object.values(t.containers), l = new Set(
      I.filter((u) => !!u.collapsed).map((u) => u.id)
    ), c = {};
    for (const [u, G] of Object.entries(t.edges)) {
      const S = Oe(G.sourceId, t, l), Z = Oe(G.targetId, t, l);
      S !== Z && (c[u] = {
        ...G,
        sourceId: S,
        targetId: Z
      });
    }
    const a = {
      ...t,
      edges: c
    }, i = Object.keys(t.containers).length, h = (r != null && r.mode && r.mode !== "auto" ? r.mode : i > 0 ? "concurrent" : "flow") === "concurrent" ? new Bt((r == null ? void 0 : r.aspectRatio) ?? 1.55) : new wt(r);
    return Ze.execute(a, h, o);
  }
}
const Qe = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", mt = (g) => Uint8Array.from(atob(g), (t) => t.charCodeAt(0)), Ve = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", mt(Qe)], { type: "text/javascript;charset=utf-8" });
function Gt(g) {
  let t;
  try {
    if (t = Ve && (self.URL || self.webkitURL).createObjectURL(Ve), !t) throw "";
    const o = new Worker(t, {
      type: "module",
      name: g == null ? void 0 : g.name
    });
    return o.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), o;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Qe,
      {
        type: "module",
        name: g == null ? void 0 : g.name
      }
    );
  }
}
class pt {
  constructor() {
    Be(this, "worker", null);
    Be(this, "pendingRequests", /* @__PURE__ */ new Map());
    Be(this, "fallbackEngine", new bt());
    if (typeof Worker < "u")
      try {
        this.worker = new Gt(), this.worker.onmessage = (t) => {
          const { id: o, success: r, layout: I, error: l } = t.data, c = this.pendingRequests.get(o);
          c && (this.pendingRequests.delete(o), r ? c.resolve(I) : c.reject(new Error(l)));
        }, this.worker.onerror = (t) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", t);
        };
      } catch (t) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", t), this.worker = null;
      }
  }
  execute(t, o, r) {
    return this.worker ? new Promise((I, l) => {
      const c = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(c, { resolve: I, reject: l });
      const a = Array.from(o.entries());
      this.worker.postMessage({
        id: c,
        graph: t,
        measurements: a,
        options: r
      });
    }) : this.fallbackEngine.execute(t, o, r);
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
    const { draggedEntity: o, hoveredEntity: r, graph: I } = t;
    return r && r.id === o.id ? null : r && I.containers[r.id] ? o.parentId === r.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: o.id,
        newParentId: r.id
      }
    } : !r && o.parentId !== null && o.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: o.id,
        newParentId: null
      }
    } : null;
  }
}
class Xt {
  constructor() {
    Be(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(t) {
    return t.cursorWorld;
  }
  onDragEnd(t) {
    const { draggedEntity: o, hoveredEdge: r, hoveredEntity: I, cursorWorld: l, startWorldPos: c, graph: a } = t, i = Math.hypot(
      l.x - c.x,
      l.y - c.y
    );
    if (I && a.containers[I.id])
      return I.id !== o.id && o.parentId !== I.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: o.id,
          newParentId: I.id
        }
      } : null;
    if (!I && !r) {
      const h = Object.values(a.edges).filter(
        (G) => G.targetId === o.id
      ), u = Object.values(a.edges).filter(
        (G) => G.sourceId === o.id
      );
      return h.length === 1 && u.length === 1 && h[0].sourceId !== u[0].targetId && i >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: o.id,
          incomingEdgeId: h[0].id,
          outgoingEdgeId: u[0].id
        }
      } : i >= this.dragOffThreshold && o.parentId !== null && o.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: o.id,
          newParentId: null
        }
      } : null;
    }
    const w = (h) => {
      const u = a.nodes[h.id] || h;
      if (!u.ports || u.ports.length === 0) return "";
      const G = Object.values(a.edges).find((b) => b.targetId === h.id);
      if (G) {
        const b = u.ports.find((n) => n.id === G.targetPortId);
        if (b) return b.id;
      }
      const S = new Set(
        Object.values(a.edges).filter((b) => b.sourceId === h.id).map((b) => b.sourcePortId)
      ), Z = u.ports.find((b) => !S.has(b.id));
      return Z ? Z.id : u.ports[0].id;
    };
    if (r)
      return r.sourceId === o.id || r.targetId === o.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: r.id,
          newSourceId: r.sourceId,
          newTargetId: o.id,
          newTargetPortId: w(o)
        }
      };
    if (I && I.id !== o.id && a.nodes[I.id]) {
      const h = Object.values(a.edges).find(
        (u) => u.targetId === I.id && u.sourceId !== o.id
      );
      if (h)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: h.id,
            newSourceId: h.sourceId,
            newTargetId: o.id,
            newTargetPortId: w(o)
          }
        };
    }
    return null;
  }
}
function xt(g, t = { min: 0.15, max: 3 }) {
  const [o, r] = ne({ x: 80, y: 80, zoom: 1 }), I = ie(!1), l = ie({ x: 0, y: 0 }), c = V(
    (b, n) => {
      if (!g.current) return { x: b, y: n };
      const e = g.current.getBoundingClientRect();
      return {
        x: (b - e.left - o.x) / o.zoom,
        y: (n - e.top - o.y) / o.zoom
      };
    },
    [o, g]
  ), a = V(
    (b) => {
      if (!g.current) return;
      const n = [
        ...Object.values(b.nodes),
        ...Object.values(b.containers)
      ];
      if (n.length === 0) {
        r({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let e = 1 / 0, s = 1 / 0, d = -1 / 0, A = -1 / 0;
      for (const k of n)
        e = Math.min(e, k.x), s = Math.min(s, k.y), d = Math.max(d, k.x + k.width), A = Math.max(A, k.y + k.height);
      const y = g.current.getBoundingClientRect(), D = 80, p = Math.max(d - e, 100), O = Math.max(A - s, 100), Q = (y.width - D * 2) / p, f = (y.height - D * 2) / O, x = Math.min(
        Math.max(Math.min(Q, f), t.min),
        Math.min(t.max, 1.25)
      ), C = (y.width - p * x) / 2 - e * x, L = (y.height - O * x) / 2 - s * x;
      r({
        x: C,
        y: L,
        zoom: x
      });
    },
    [g, t]
  ), i = V(
    (b) => {
      if (b.preventDefault(), !!g.current)
        if (b.ctrlKey || b.metaKey) {
          const n = g.current.getBoundingClientRect(), e = b.clientX - n.left, s = b.clientY - n.top, d = b.deltaY < 0 ? 1.08 : 0.92, A = Math.min(Math.max(o.zoom * d, t.min), t.max), y = e - (e - o.x) * (A / o.zoom), D = s - (s - o.y) * (A / o.zoom);
          r({ x: y, y: D, zoom: A });
        } else
          r((n) => ({
            ...n,
            x: n.x - b.deltaX,
            y: n.y - b.deltaY
          }));
    },
    [o, t, g]
  ), w = V(
    (b, n) => {
      I.current = !0, l.current = { x: b - o.x, y: n - o.y };
    },
    [o]
  ), h = V((b, n) => {
    I.current && r((e) => ({
      ...e,
      x: b - l.current.x,
      y: n - l.current.y
    }));
  }, []), u = V(() => {
    I.current = !1;
  }, []), G = V(() => {
    r({ x: 80, y: 80, zoom: 1 });
  }, []), S = V(() => {
    r((b) => ({
      ...b,
      zoom: Math.min(b.zoom * 1.2, t.max)
    }));
  }, [t]), Z = V(() => {
    r((b) => ({
      ...b,
      zoom: Math.max(b.zoom / 1.2, t.min)
    }));
  }, [t]);
  return {
    transform: o,
    setTransform: r,
    screenToWorld: c,
    onWheel: i,
    startPan: w,
    updatePan: h,
    endPan: u,
    resetTransform: G,
    zoomIn: S,
    zoomOut: Z,
    zoomToFit: a,
    isPanning: I
  };
}
function Lt(g) {
  const [t, o] = ne(
    /* @__PURE__ */ new Map()
  );
  ie(/* @__PURE__ */ new Map());
  const r = ie(/* @__PURE__ */ new Map()), I = V((l, c) => {
    c ? r.current.set(l, c) : r.current.delete(l);
  }, []);
  return Le(() => {
    const l = new ResizeObserver((c) => {
      let a = !1;
      const i = new Map(t);
      for (const w of c) {
        const h = w.target.getAttribute("data-sysflow-measure-id");
        if (!h) continue;
        const u = Math.ceil(w.contentRect.width), G = Math.ceil(w.contentRect.height), S = i.get(h);
        (!S || S.width !== u || S.height !== G) && (i.set(h, { width: u, height: G }), a = !0);
      }
      a && o(i);
    });
    return r.current.forEach((c) => l.observe(c)), () => {
      l.disconnect();
    };
  }, [g]), { measurements: t, registerMeasureElement: I };
}
function Kt(g, t, o, r, I) {
  const [l, c] = ne(null), [a, i] = ne(null), w = ie(null), h = ie(null), u = V(
    (n, e) => {
      let s = null, d = 1 / 0;
      for (const [A, y] of Object.entries(t.containers))
        if (A !== e && n.x >= y.x && n.x <= y.x + y.width && n.y >= y.y && n.y <= y.y + y.height) {
          const D = y.width * y.height;
          D < d && (d = D, s = g.containers[A] || null);
        }
      if (s) return s;
      for (const [A, y] of Object.entries(t.nodes))
        if (A !== e && n.x >= y.x && n.x <= y.x + y.width && n.y >= y.y && n.y <= y.y + y.height)
          return g.nodes[A] || null;
      return null;
    },
    [t, g]
  ), G = V(
    (n, e) => {
      let s = null, d = 45;
      for (const A of Object.values(g.edges)) {
        if (A.sourceId === e || A.targetId === e) continue;
        const y = t.nodes[A.sourceId] || t.containers[A.sourceId], D = t.nodes[A.targetId] || t.containers[A.targetId];
        if (!y || !D) continue;
        const p = y.x + y.width, O = y.y + y.height / 2, Q = D.x, f = D.y + D.height / 2;
        for (let x = 0; x <= 10; x++) {
          const C = x / 10, L = (1 - C) * p + C * Q, k = (1 - C) * O + C * f, H = Math.hypot(n.x - L, n.y - k);
          H < d && (d = H, s = A);
        }
      }
      return s;
    },
    [t, g]
  ), S = V(
    (n, e) => {
      if (e.stopPropagation(), o.canDrag && !o.canDrag(n, g))
        return;
      const s = r(e.clientX, e.clientY);
      c({
        draggedEntity: n,
        ghostPosition: s,
        startPosition: s
      });
    },
    [g, o, r]
  ), Z = V(
    (n) => {
      if (!l) return;
      const e = r(n.clientX, n.clientY), s = u(e, l.draggedEntity.id), d = G(e, l.draggedEntity.id);
      w.current = s, h.current = d, s && g.containers[s.id] ? i(s.id) : i(null);
      const A = o.onDragMove ? o.onDragMove({
        draggedEntity: l.draggedEntity,
        cursorWorld: e,
        startWorldPos: l.startPosition,
        hoveredEntity: s,
        hoveredEdge: d,
        graph: g,
        layout: t
      }) : e;
      A && c((y) => y ? { ...y, ghostPosition: A } : null);
    },
    [l, r, o, g, t, u, G]
  ), b = V(
    (n) => {
      if (!l) return;
      const e = r(n.clientX, n.clientY), s = u(e, l.draggedEntity.id), d = G(e, l.draggedEntity.id), A = o.onDragEnd({
        draggedEntity: l.draggedEntity,
        cursorWorld: e,
        startWorldPos: l.startPosition,
        hoveredEntity: s,
        hoveredEdge: d,
        graph: g,
        layout: t
      });
      A && I(A), c(null), i(null), w.current = null, h.current = null;
    },
    [l, r, o, g, t, u, G, I]
  );
  return {
    dragState: l,
    hoveredContainerId: a,
    handlePointerDown: S,
    handlePointerMove: Z,
    handlePointerUp: b
  };
}
function Et(g, t) {
  const o = [], r = [], I = [], l = [], c = [];
  for (const [a, i] of Object.entries(t.nodes))
    g.nodes[a] ? g.nodes[a] !== i && r.push(i) : o.push(i);
  for (const a of Object.keys(g.nodes))
    t.nodes[a] || I.push(a);
  for (const [a, i] of Object.entries(t.edges))
    g.edges[a] || l.push(i);
  for (const [a, i] of Object.entries(g.edges))
    t.edges[a] || c.push(i);
  return { createdNodes: o, updatedNodes: r, deletedNodes: I, createdEdges: l, deletedEdges: c };
}
function Zt(g) {
  return g.createdNodes.length > 0 || g.updatedNodes.length > 0 || g.deletedNodes.length > 0 || g.createdEdges.length > 0 || g.deletedEdges.length > 0;
}
function Tt(g, t) {
  const [o, r] = ne({
    history: [g],
    index: 0
  }), [I, l] = ne(null), c = ie(t);
  c.current = t;
  const a = o.history[o.index] ?? o.history[0] ?? g, i = V((e) => {
    var d;
    const s = ve(e);
    if ((d = c.current) != null && d.onMutate) {
      const A = Et(a, s);
      Zt(A) && c.current.onMutate(A);
    }
    r((A) => {
      const y = A.history.slice(0, A.index + 1);
      return {
        history: [...y, s],
        index: y.length
      };
    });
  }, [a]), w = V((e) => {
    const s = ve(e);
    r({
      history: [s],
      index: 0
    });
  }, []), h = V(() => {
    r((e) => ({
      ...e,
      index: Math.max(0, e.index - 1)
    }));
  }, []), u = V(() => {
    r((e) => ({
      ...e,
      index: Math.min(e.history.length - 1, e.index + 1)
    }));
  }, []), G = V(
    (e) => {
      var D;
      if (!e || e.length === 0) return;
      let s = e;
      if ((D = c.current) != null && D.canDelete) {
        const p = c.current.canDelete(e);
        if (typeof p == "boolean") {
          if (!p) return;
        } else Array.isArray(p) && (s = p);
      }
      if (s.length === 0) return;
      const d = { ...a.nodes }, A = { ...a.containers }, y = { ...a.edges };
      for (const p of s)
        delete d[p], delete A[p], delete y[p];
      i({
        ...a,
        nodes: d,
        containers: A,
        edges: y
      });
    },
    [a, i]
  ), S = V(
    (e) => {
      var A, y, D, p, O, Q;
      const s = a, d = c.current;
      if (e.type === "ENTITY_REPARENT") {
        const { entityId: f, newParentId: x } = e.payload, C = {
          ...s,
          nodes: { ...s.nodes },
          containers: { ...s.containers }
        };
        C.nodes[f] ? C.nodes[f] = { ...C.nodes[f], parentId: x } : C.containers[f] && (C.containers[f] = { ...C.containers[f], parentId: x }), i(C);
      } else if (e.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: f, direction: x, suggestedNewNodeId: C, suggestedNewEdge1Id: L, suggestedNewEdge2Id: k } = e.payload, H = s.edges[f.id];
        if (!H) return;
        const N = s.nodes[H.sourceId];
        if (d != null && d.canConnect && (!d.canConnect(H.sourceId, C) || !d.canConnect(C, H.targetId)))
          return;
        const B = x === "BT", M = x === "TB", P = `p_in_${Date.now()}`, R = `p_out_${Date.now()}`;
        let K = "left", j = "right";
        B ? (K = "bottom", j = "top") : M ? (K = "top", j = "bottom") : x === "RL" && (K = "right", j = "left");
        const X = (A = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : A.call(d, {
          edge: H,
          direction: x,
          suggestedType: (N == null ? void 0 : N.type) || "FlowTask"
        }), T = {
          id: (X == null ? void 0 : X.id) || C,
          label: (X == null ? void 0 : X.label) || `Node ${Object.keys(s.nodes).length + 1}`,
          type: (X == null ? void 0 : X.type) || (N == null ? void 0 : N.type) || "FlowTask",
          parentId: (X == null ? void 0 : X.parentId) ?? (N == null ? void 0 : N.parentId) ?? null,
          ports: (X == null ? void 0 : X.ports) || [
            { id: P, label: "in", side: K },
            { id: R, label: "out", side: j }
          ],
          data: (X == null ? void 0 : X.data) || {},
          ...X
        }, se = {
          id: L,
          sourceId: H.sourceId,
          sourcePortId: H.sourcePortId,
          targetId: T.id,
          targetPortId: P
        }, z = {
          id: k,
          sourceId: T.id,
          sourcePortId: R,
          targetId: H.targetId,
          targetPortId: H.targetPortId
        }, Ie = { ...s.edges };
        delete Ie[H.id], Ie[L] = se, Ie[k] = z, i({
          ...s,
          nodes: { ...s.nodes, [T.id]: T },
          edges: Ie
        });
      } else if (e.type === "NODE_EXTRACT") {
        const { incomingEdgeId: f, outgoingEdgeId: x } = e.payload, C = s.edges[f], L = s.edges[x];
        if (!C || !L || d != null && d.canConnect && !d.canConnect(C.sourceId, L.targetId))
          return;
        const k = { ...s.edges };
        k[f] = {
          ...C,
          targetId: L.targetId,
          targetPortId: L.targetPortId
        }, delete k[x], i({
          ...s,
          edges: k
        });
      } else if (e.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: f, position: x, direction: C, suggestedNewNodeId: L, suggestedNewEdgeId: k } = e.payload, H = C === "BT", N = `p_in_${Date.now()}`, B = `p_out_${Date.now()}`, M = H && x === "bottom" || !H && x === "top", P = M ? L : f.id, R = M ? f.id : L;
        if (d != null && d.canConnect && !d.canConnect(P, R))
          return;
        const K = (y = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : y.call(d, {
          sourceNode: f,
          position: x,
          direction: C,
          suggestedType: f.type
        }), j = {
          id: (K == null ? void 0 : K.id) || L,
          label: (K == null ? void 0 : K.label) || `Node ${Object.keys(s.nodes).length + 1}`,
          type: (K == null ? void 0 : K.type) || f.type,
          ports: (K == null ? void 0 : K.ports) || [
            { id: N, label: "in", side: H ? "bottom" : "top" },
            { id: B, label: "out", side: H ? "top" : "bottom" }
          ],
          data: (K == null ? void 0 : K.data) || {},
          parentId: (K == null ? void 0 : K.parentId) ?? (f == null ? void 0 : f.parentId) ?? null,
          ...K
        }, X = f.ports.find((z) => z.label === "in") || f.ports[0], T = f.ports.find((z) => z.label === "out") || f.ports[f.ports.length - 1];
        let se;
        M ? se = {
          id: k,
          sourceId: j.id,
          sourcePortId: B,
          targetId: f.id,
          targetPortId: (X == null ? void 0 : X.id) || "in"
        } : se = {
          id: k,
          sourceId: f.id,
          sourcePortId: (T == null ? void 0 : T.id) || "out",
          targetId: j.id,
          targetPortId: N
        }, i({
          ...s,
          nodes: { ...s.nodes, [j.id]: j },
          edges: { ...s.edges, [k]: se }
        });
      } else if (e.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: f, collapsed: x } = e.payload;
        s.containers[f] && i({
          ...s,
          containers: {
            ...s.containers,
            [f]: { ...s.containers[f], collapsed: x }
          }
        });
      } else if (e.type === "EDGE_CREATE") {
        const f = e.payload.edge, x = f.sourceId, C = f.targetId, L = f.sourcePortId, k = f.targetPortId;
        if (d != null && d.canConnect && !d.canConnect(x, C, L, k))
          return;
        const H = e.payload.id || f.id || `E_${Date.now()}`;
        i({
          ...s,
          edges: {
            ...s.edges,
            [H]: { id: H, ...f }
          }
        });
      } else if (e.type === "EDGE_DELETE") {
        const f = e.payload.edgeId || e.payload.id, x = { ...s.edges };
        delete x[f], i({ ...s, edges: x });
      } else if (e.type === "EDGE_REWIRE") {
        const { edgeId: f, newTargetId: x } = e.payload;
        if (!x || !s.edges[f]) return;
        const C = x, L = s.edges[f], k = L.sourceId, H = L.targetId;
        if (C === k || C === H) return;
        const N = Object.values(s.edges).find((X) => X.targetId === C), B = Object.values(s.edges).find((X) => X.sourceId === C), M = N && B && N.sourceId !== B.targetId;
        if (d != null && d.canConnect && (M && !d.canConnect(N.sourceId, B.targetId) || !d.canConnect(k, C) || !d.canConnect(C, H)))
          return;
        const P = { ...s.edges };
        M ? (P[N.id] = {
          ...N,
          targetId: B.targetId,
          targetPortId: B.targetPortId
        }, delete P[B.id]) : (N && delete P[N.id], B && delete P[B.id]);
        const R = ((p = (D = s.nodes[C]) == null ? void 0 : D.ports[0]) == null ? void 0 : p.id) || "p_in", K = ((Q = (O = s.nodes[C]) == null ? void 0 : O.ports.find((X) => X.id !== R)) == null ? void 0 : Q.id) || R;
        P[f] = {
          ...L,
          targetId: C,
          targetPortId: R
        };
        const j = `REWIRE_${Date.now()}`;
        P[j] = {
          id: j,
          sourceId: C,
          sourcePortId: K,
          targetId: H,
          targetPortId: L.targetPortId
        }, i({ ...s, edges: P });
      } else {
        const f = e;
        if (f.type === "NODE_DELETE" || f.type === "DELETE_SELECTION" || f.type === "SELECTION_DELETE") {
          const x = f.payload || {}, C = [];
          x.nodeId && C.push(x.nodeId), x.id && C.push(x.id), Array.isArray(x.selectedIds) && C.push(...x.selectedIds), Array.isArray(x.ids) && C.push(...x.ids), G(C);
        }
      }
    },
    [a, i, G]
  ), Z = V(
    (e) => {
      const s = a.nodes[e] || a.containers[e];
      s && l({ entity: JSON.parse(JSON.stringify(s)), isCut: !1 });
    },
    [a]
  ), b = V(
    (e) => {
      const s = a.nodes[e] || a.containers[e];
      if (s) {
        l({ entity: JSON.parse(JSON.stringify(s)), isCut: !0 });
        const d = { ...a.nodes }, A = { ...a.containers };
        delete d[e], delete A[e], i({ ...a, nodes: d, containers: A });
      }
    },
    [a, i]
  ), n = V(() => {
    if (!I) return;
    const e = I.entity, s = `${e.id}_copy_${Date.now().toString().slice(-4)}`, d = { ...e, id: s, label: `${e.label} (Copy)` };
    "collapsed" in d ? i({
      ...a,
      containers: { ...a.containers, [s]: d }
    }) : i({
      ...a,
      nodes: { ...a.nodes, [s]: d }
    });
  }, [I, a, i]);
  return {
    graph: a,
    setGraphDirect: w,
    applyAction: S,
    undo: h,
    redo: u,
    copyEntity: Z,
    cutEntity: b,
    pasteEntity: n,
    deleteSelection: G,
    canUndo: o.index > 0,
    canRedo: o.index < o.history.length - 1
  };
}
const kt = ({
  graph: g,
  registerMeasureElement: t,
  nodeTypes: o,
  containerTypes: r
}) => {
  const I = Object.values(g.nodes), l = Object.values(g.containers);
  return /* @__PURE__ */ _("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    I.map((c) => {
      const a = c.type ? o == null ? void 0 : o[c.type] : null;
      return /* @__PURE__ */ v(
        "div",
        {
          ref: (i) => t(c.id, i),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: a ? /* @__PURE__ */ v(a, { node: c, selected: !1 }) : /* @__PURE__ */ _("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ v("div", { style: { fontWeight: 600 }, children: c.label }),
            c.ports.length > 0 && /* @__PURE__ */ _("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              c.ports.map((i) => i.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${c.id}`
      );
    }),
    l.map((c) => {
      const a = c.type ? r == null ? void 0 : r[c.type] : null;
      return /* @__PURE__ */ v(
        "div",
        {
          ref: (i) => t(c.id, i),
          "data-sysflow-measure-id": c.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: a ? /* @__PURE__ */ v(a, { container: c, selected: !1 }) : /* @__PURE__ */ v("div", { className: "sysflow-container-header", children: c.label })
        },
        `measure-container-${c.id}`
      );
    })
  ] });
}, Dt = ({
  graph: g,
  layout: t,
  selectedIds: o,
  direction: r = "TB",
  showArrows: I = !0,
  routing: l = "auto",
  portOptions: c,
  enableEdgeQuickAdd: a = !0,
  onEdgeClick: i,
  onInsertNodeOnEdge: w
}) => {
  const [h, u] = ne(null), G = l === "step" || l === "auto" && (r === "LR" || r === "RL"), S = (n, e, s) => {
    var L, k, H, N;
    let d = n, A = null;
    for ((L = g.containers[n]) != null && L.collapsed && (A = g.containers[n]); d; ) {
      const B = ((k = g.nodes[d]) == null ? void 0 : k.parentId) ?? ((H = g.containers[d]) == null ? void 0 : H.parentId) ?? null;
      B && ((N = g.containers[B]) != null && N.collapsed) && (A = g.containers[B]), d = B;
    }
    if (A) {
      const B = t.containers[A.id];
      if (!B)
        return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: A.id };
      let M, P, R;
      return r === "TB" ? (M = s ? "bottom" : "top", P = B.x + B.width / 2, R = s ? B.y + B.height : B.y) : r === "BT" ? (M = s ? "top" : "bottom", P = B.x + B.width / 2, R = s ? B.y : B.y + B.height) : r === "RL" ? (M = s ? "left" : "right", P = s ? B.x : B.x + B.width, R = B.y + B.height / 2) : (M = s ? "right" : "left", P = s ? B.x + B.width : B.x, R = B.y + B.height / 2), { x: P, y: R, side: M, valid: !0, entityId: A.id };
    }
    if (!!g.containers[n]) {
      const B = t.containers[n];
      if (!B) return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
      let M, P, R;
      return r === "TB" ? (M = B.x + B.width / 2, P = s ? B.y + B.height : B.y, R = s ? "bottom" : "top") : r === "BT" ? (M = B.x + B.width / 2, P = s ? B.y : B.y + B.height, R = s ? "top" : "bottom") : r === "RL" ? (M = s ? B.x : B.x + B.width, P = B.y + B.height / 2, R = s ? "left" : "right") : (M = s ? B.x + B.width : B.x, P = B.y + B.height / 2, R = s ? "right" : "left"), { x: M, y: P, side: R, valid: !0, entityId: n };
    }
    const D = g.nodes[n], p = t.nodes[n];
    if (!D || !p)
      return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
    const Q = Ee(
      D,
      p,
      r,
      g.edges,
      c
    ).get(e);
    if (Q)
      return { x: Q.worldX, y: Q.worldY, side: Q.side, valid: !0, entityId: n };
    let f, x, C;
    return r === "TB" ? (f = p.x + p.width / 2, x = s ? p.y + p.height : p.y, C = s ? "bottom" : "top") : r === "BT" ? (f = p.x + p.width / 2, x = s ? p.y : p.y + p.height, C = s ? "top" : "bottom") : r === "RL" ? (f = s ? p.x : p.x + p.width, x = p.y + p.height / 2, C = s ? "left" : "right") : (f = s ? p.x + p.width : p.x, x = p.y + p.height / 2, C = s ? "right" : "left"), { x: f, y: x, side: C, valid: !0, entityId: n };
  }, Z = (n, e) => {
    const s = (n.x + e.x) / 2, d = (n.y + e.y) / 2;
    if (n.side === "right" && e.side === "left") {
      if (e.x >= n.x + 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: d }
        };
      {
        const A = e.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x + 20} ${n.y} L ${n.x + 20} ${A} L ${e.x - 20} ${A} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: A }
        };
      }
    }
    if (n.side === "left" && e.side === "right") {
      if (e.x <= n.x - 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: d }
        };
      {
        const A = e.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x - 20} ${n.y} L ${n.x - 20} ${A} L ${e.x + 20} ${A} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: A }
        };
      }
    }
    if (n.side === "bottom" && e.side === "top") {
      if (e.y >= n.y + 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${d} L ${e.x} ${d} L ${e.x} ${e.y}`,
          center: { x: s, y: d }
        };
      {
        const A = e.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y + 20} L ${A} ${n.y + 20} L ${A} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`,
          center: { x: A, y: d }
        };
      }
    }
    if (n.side === "top" && e.side === "bottom") {
      if (e.y <= n.y - 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${d} L ${e.x} ${d} L ${e.x} ${e.y}`,
          center: { x: s, y: d }
        };
      {
        const A = e.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y - 20} L ${A} ${n.y - 20} L ${A} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`,
          center: { x: A, y: d }
        };
      }
    }
    return {
      pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${e.y} L ${e.x} ${e.y}`,
      center: { x: s, y: d }
    };
  }, b = (n, e) => {
    const s = e.x - n.x, d = e.y - n.y;
    let A = n.x, y = n.y, D = e.x, p = e.y;
    if (n.side === "bottom" && e.side === "top")
      if (d > 0) {
        const f = Math.min(28, d * 0.4);
        y = n.y + Math.max(f, d * 0.5), p = e.y - Math.max(f, d * 0.5);
      } else {
        const f = s >= 0 ? 1 : -1, x = Math.max(40, Math.abs(s) * 0.2);
        A = n.x + x * f, y = n.y + 40, D = e.x + x * f, p = e.y - 40;
      }
    else if (n.side === "top" && e.side === "bottom")
      if (d < 0) {
        const f = Math.min(28, Math.abs(d) * 0.4);
        y = n.y - Math.max(f, Math.abs(d) * 0.5), p = e.y + Math.max(f, Math.abs(d) * 0.5);
      } else {
        const f = s >= 0 ? 1 : -1, x = Math.max(40, Math.abs(s) * 0.2);
        A = n.x + x * f, y = n.y - 40, D = e.x + x * f, p = e.y + 40;
      }
    else if (n.side === "right" && e.side === "left")
      s > 0 ? (A = n.x + s * 0.5, D = e.x - s * 0.5) : (A = n.x + 50, y = n.y - 50, D = e.x - 50, p = e.y - 50);
    else if (n.side === "left" && e.side === "right")
      s < 0 ? (A = n.x + s * 0.5, D = e.x - s * 0.5) : (A = n.x - 50, y = n.y - 50, D = e.x + 50, p = e.y - 50);
    else {
      const f = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, x = f[n.side] || { x: 0, y: 1 }, C = f[e.side] || { x: 0, y: -1 }, L = Math.min(60, Math.hypot(s, d) * 0.35);
      A = n.x + x.x * L, y = n.y + x.y * L, D = e.x + C.x * L, p = e.y + C.y * L;
    }
    const O = 0.125 * n.x + 0.375 * A + 0.375 * D + 0.125 * e.x, Q = 0.125 * n.y + 0.375 * y + 0.375 * p + 0.125 * e.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${A} ${y} ${D} ${p} ${e.x} ${e.y}`,
      center: { x: O, y: Q }
    };
  };
  return /* @__PURE__ */ _("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ _("defs", { children: [
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
      const e = S(n.sourceId, n.sourcePortId, !0), s = S(n.targetId, n.targetPortId, !1);
      if (!e.valid || !s.valid || e.entityId === s.entityId) return null;
      const d = o.includes(n.id), A = h === n.id, { pathStr: y, center: D } = G ? Z(e, s) : b(e, s);
      return /* @__PURE__ */ _(
        "g",
        {
          onMouseEnter: () => u(n.id),
          onMouseLeave: () => u(null),
          children: [
            /* @__PURE__ */ v(
              "path",
              {
                d: y,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (p) => {
                  p.stopPropagation(), i == null || i(n.id);
                }
              }
            ),
            /* @__PURE__ */ v(
              "path",
              {
                d: y,
                fill: "none",
                stroke: d ? "var(--sysflow-edge-selected)" : A ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: d ? 2.5 : A ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: I ? d ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            a && A && w && /* @__PURE__ */ v("g", { transform: `translate(${D.x}, ${D.y})`, children: /* @__PURE__ */ _(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (p) => {
                  p.preventDefault(), p.stopPropagation(), w(n);
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
}, Ht = ({
  entity: g,
  layout: t,
  direction: o = "LR",
  edges: r,
  portOptions: I,
  onPortPointerDown: l,
  onPortPointerUp: c
}) => {
  if (!g.ports || g.ports.length === 0)
    return null;
  const a = Ee(
    g,
    t,
    o,
    r,
    I
  );
  return /* @__PURE__ */ v(Ke, { children: g.ports.map((i) => {
    const w = a.get(i.id);
    return w ? /* @__PURE__ */ v(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${w.side}`,
        style: {
          position: "absolute",
          left: `${w.localX}px`,
          top: `${w.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${i.label} (${w.side})`,
        onPointerDown: (h) => {
          h.stopPropagation(), l == null || l(g.id, i.id, !0, h);
        },
        onPointerUp: (h) => {
          h.stopPropagation(), c == null || c(g.id, i.id, !1);
        }
      },
      i.id
    ) : null;
  }) });
}, Pt = ({
  node: g,
  layout: t,
  selected: o = !1,
  direction: r = "LR",
  edges: I,
  portOptions: l,
  enableQuickAdd: c = !1,
  onAddConnectedNode: a,
  onPointerDown: i,
  onMouseEnter: w,
  onMouseLeave: h,
  onClick: u,
  onPortPointerDown: G,
  onPortPointerUp: S,
  customRenderer: Z
}) => {
  const [b, n] = ne(!1);
  return /* @__PURE__ */ _(
    "div",
    {
      className: `sysflow-node ${o ? "sysflow-selected" : ""} ${g.className || ""}`,
      style: {
        transform: `translate(${t.x}px, ${t.y}px)`,
        width: `${t.width}px`,
        height: `${t.height}px`
      },
      onPointerDown: (e) => i == null ? void 0 : i(g, e),
      onMouseEnter: () => {
        n(!0), w == null || w(g.id);
      },
      onMouseLeave: () => {
        n(!1), h == null || h(g.id);
      },
      onClick: u,
      children: [
        c && b && /* @__PURE__ */ _(Ke, { children: [
          /* @__PURE__ */ v("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ v("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        c && b && a && /* @__PURE__ */ v(
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
              e.preventDefault(), e.stopPropagation(), a(g, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ v(
          Ht,
          {
            entity: g,
            layout: t,
            direction: r,
            edges: I,
            portOptions: l,
            onPortPointerDown: G,
            onPortPointerUp: S
          }
        ),
        Z ? /* @__PURE__ */ v(Z, { node: g, selected: o }) : /* @__PURE__ */ _("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ v("div", { style: { fontWeight: 600, fontSize: "13px" }, children: g.label }),
          g.ports.length > 0 && /* @__PURE__ */ _("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            g.ports.length,
            " Port",
            g.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        c && b && a && /* @__PURE__ */ v(
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
              e.preventDefault(), e.stopPropagation(), a(g, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, vt = ({
  container: g,
  layout: t,
  selected: o,
  isHovered: r = !1,
  hasChildren: I = !1,
  onToggleCollapse: l,
  onPointerDown: c,
  onMouseEnter: a,
  onMouseLeave: i,
  onClick: w,
  customRenderer: h
}) => /* @__PURE__ */ v(
  "div",
  {
    className: `sysflow-container ${o ? "sysflow-selected" : ""} ${r ? "sysflow-hovered" : ""} ${g.className || ""}`,
    style: {
      transform: `translate(${t.x}px, ${t.y}px)`,
      width: `${t.width}px`,
      height: `${t.height}px`
    },
    onPointerDown: (u) => c(g, u),
    onMouseEnter: a,
    onMouseLeave: i,
    onClick: w,
    children: h ? /* @__PURE__ */ v(h, { container: g, selected: o }) : /* @__PURE__ */ _(Ke, { children: [
      /* @__PURE__ */ _("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ v("span", { className: "sysflow-container-title", title: g.label, children: g.label }),
        /* @__PURE__ */ v(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (u) => u.stopPropagation(),
            onPointerUp: (u) => u.stopPropagation(),
            onClick: (u) => {
              u.stopPropagation(), l(g.id, !g.collapsed);
            },
            children: g.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !g.collapsed && !I && /* @__PURE__ */ v("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Nt = new St(), Ot = ({
  graph: g,
  onChange: t,
  history: o,
  enableShortcuts: r = !0,
  onNodeClick: I,
  onEdgeClick: l,
  layoutEngine: c,
  interactionStrategy: a = Nt,
  direction: i = "TB",
  layoutOptions: w,
  portPlacementMode: h,
  routing: u,
  showEdgeArrows: G = !0,
  nodeTypes: S,
  containerTypes: Z,
  zoomBounds: b,
  className: n = "",
  selectedIds: e = [],
  theme: s = "dark",
  enableQuickAdd: d,
  enableEdgeQuickAdd: A
}) => {
  var De, He;
  const y = ie(null), D = ie(null);
  !c && !D.current && (D.current = new pt());
  const p = c || D.current, {
    transform: O,
    screenToWorld: Q,
    onWheel: f,
    startPan: x,
    updatePan: C,
    endPan: L,
    resetTransform: k,
    zoomIn: H,
    zoomOut: N,
    zoomToFit: B,
    isPanning: M
  } = xt(y, b), { measurements: P, registerMeasureElement: R } = Lt(g), [K, j] = ne({ nodes: {}, containers: {} }), X = lt(() => ({
    direction: i,
    mode: h ?? (i === "TB" || i === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: K.nodes
  }), [i, h, K.nodes]), [T, se] = ne(null), [z, Ie] = ne(null), Ge = ie(!1), {
    dragState: re,
    hoveredContainerId: ze,
    handlePointerDown: ke,
    handlePointerMove: Fe,
    handlePointerUp: je
  } = Kt(g, K, a, Q, t);
  Le(() => {
    const m = (E) => {
      var oe, F, le, fe;
      if (E.target instanceof HTMLInputElement || E.target instanceof HTMLTextAreaElement || E.target instanceof HTMLElement && E.target.isContentEditable)
        return;
      const Y = E.ctrlKey || E.metaKey, U = E.key.toLowerCase();
      if (r !== !1 && o) {
        if (Y && U === "z") {
          E.preventDefault(), E.shiftKey ? o.redo() : o.undo();
          return;
        }
        if (Y && U === "y") {
          E.preventDefault(), o.redo();
          return;
        }
        if (Y && U === "c" && e[0]) {
          E.preventDefault(), (oe = o.copyEntity) == null || oe.call(o, e[0]);
          return;
        }
        if (Y && U === "x" && e[0]) {
          E.preventDefault(), (F = o.cutEntity) == null || F.call(o, e[0]);
          return;
        }
        if (Y && U === "v") {
          E.preventDefault(), (le = o.pasteEntity) == null || le.call(o);
          return;
        }
        if (E.key === "Delete" || E.key === "Backspace") {
          E.preventDefault(), (fe = o.deleteSelection) == null || fe.call(o, e), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
          return;
        }
      }
      if (E.key === "Escape") {
        E.preventDefault(), Ie(null), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (E.code === "Space" && (Ge.current = !0), E.key.toLowerCase() === "f" && !Y) {
        E.preventDefault(), B(K);
        return;
      }
      if (Y && U === "a") {
        E.preventDefault();
        const ee = [
          ...Object.keys(g.nodes),
          ...Object.keys(g.containers)
        ];
        t({ type: "SELECTION_CHANGE", payload: { selectedIds: ee } });
        return;
      }
      const $ = Object.keys(g.nodes);
      if ($.length !== 0) {
        if (E.key === "Tab") {
          E.preventDefault();
          const ee = e.length > 0 ? $.indexOf(e[0]) : -1;
          let te;
          E.shiftKey ? te = ee <= 0 ? $.length - 1 : ee - 1 : te = (ee + 1) % $.length, t({ type: "SELECTION_CHANGE", payload: { selectedIds: [$[te]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(E.key)) {
          E.preventDefault();
          const ee = e[0] || $[0], te = K.nodes[ee] || K.containers[ee];
          if (!te) return;
          const ye = {
            x: te.x + te.width / 2,
            y: te.y + te.height / 2
          };
          let Ce = null, ue = 1 / 0;
          for (const q of $) {
            if (q === ee) continue;
            const J = K.nodes[q];
            if (!J) continue;
            const ce = {
              x: J.x + J.width / 2,
              y: J.y + J.height / 2
            }, ae = ce.x - ye.x, de = ce.y - ye.y;
            let ge = !1;
            if (E.key === "ArrowRight" && ae > 20 && (ge = !0), E.key === "ArrowLeft" && ae < -20 && (ge = !0), E.key === "ArrowDown" && de > 20 && (ge = !0), E.key === "ArrowUp" && de < -20 && (ge = !0), ge) {
              const be = Math.hypot(ae, de);
              be < ue && (ue = be, Ce = q);
            }
          }
          Ce && t({ type: "SELECTION_CHANGE", payload: { selectedIds: [Ce] } });
        }
      }
    }, W = (E) => {
      E.code === "Space" && (Ge.current = !1);
    };
    return window.addEventListener("keydown", m), window.addEventListener("keyup", W), () => {
      window.removeEventListener("keydown", m), window.removeEventListener("keyup", W);
    };
  }, [g, K, e, B, t]), Le(() => {
    let m = !1, W = 16 / 9;
    if (y.current) {
      const Y = y.current.getBoundingClientRect();
      Y.width > 0 && Y.height > 0 && (W = Y.width / Y.height);
    }
    const E = {
      direction: i,
      aspectRatio: W,
      ...w
    };
    return p.execute(g, P, E).then((Y) => {
      m || j(Y);
    }), () => {
      m = !0;
    };
  }, [g, P, p, i, w]);
  const $e = (m, W, E, Y) => {
    const U = g.nodes[m] || g.containers[m], $ = K.nodes[m] || K.containers[m];
    if (!U || !$) return;
    const F = Ee(
      U,
      $,
      i,
      g.edges,
      X
    ).get(W), le = F ? { x: F.worldX, y: F.worldY } : { x: $.x + $.width, y: $.y + $.height / 2 };
    se({
      sourceId: m,
      sourcePortId: W,
      startWorldPos: le,
      currentWorldPos: Q(Y.clientX, Y.clientY)
    });
  }, Ue = (m, W, E) => {
    var Y, U, $, oe, F, le, fe, ee, te, ye;
    if (T && T.sourceId !== m) {
      const Ce = g.nodes[T.sourceId] || g.containers[T.sourceId], ue = g.nodes[m] || g.containers[m], q = (Y = Ce == null ? void 0 : Ce.ports) == null ? void 0 : Y.find((he) => he.id === T.sourcePortId), J = (U = ue == null ? void 0 : ue.ports) == null ? void 0 : U.find((he) => he.id === W);
      let ce = T.sourceId, ae = T.sourcePortId, de = m, ge = W;
      const be = (($ = q == null ? void 0 : q.label) == null ? void 0 : $.toLowerCase().includes("in")) || (q == null ? void 0 : q.side) === (i === "BT" ? "bottom" : "top"), gt = ((oe = q == null ? void 0 : q.label) == null ? void 0 : oe.toLowerCase().includes("out")) || (q == null ? void 0 : q.side) === (i === "BT" ? "top" : "bottom"), it = ((F = J == null ? void 0 : J.label) == null ? void 0 : F.toLowerCase().includes("in")) || (J == null ? void 0 : J.side) === (i === "BT" ? "bottom" : "top"), It = ((le = J == null ? void 0 : J.label) == null ? void 0 : le.toLowerCase().includes("out")) || (J == null ? void 0 : J.side) === (i === "BT" ? "top" : "bottom");
      if (be && It)
        ce = m, ae = W, de = T.sourceId, ge = T.sourcePortId;
      else if (gt && it)
        ce = T.sourceId, ae = T.sourcePortId, de = m, ge = W;
      else if (K.nodes[T.sourceId] && K.nodes[m]) {
        const he = K.nodes[T.sourceId], Pe = K.nodes[m], dt = i === "BT" && he.y < Pe.y, rt = i === "TB" && he.y > Pe.y;
        if (dt || rt) {
          ce = m, de = T.sourceId;
          const pe = g.nodes[ce], Se = g.nodes[de];
          ae = ((ee = (fe = pe == null ? void 0 : pe.ports) == null ? void 0 : fe.find((we) => we.label.includes("out") || we.side === (i === "BT" ? "top" : "bottom"))) == null ? void 0 : ee.id) || W, ge = ((ye = (te = Se == null ? void 0 : Se.ports) == null ? void 0 : te.find((we) => we.label.includes("in") || we.side === (i === "BT" ? "bottom" : "top"))) == null ? void 0 : ye.id) || T.sourcePortId;
        }
      }
      t({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: ce,
            sourcePortId: ae,
            targetId: de,
            targetPortId: ge
          }
        }
      });
    }
    se(null);
  }, Je = (m) => {
    if (m.button === 1 || Ge.current) {
      x(m.clientX, m.clientY);
      return;
    }
    const W = m.target, E = W === y.current || W.classList.contains("sysflow-viewport") || W.classList.contains("sysflow-dom-layer") || W.tagName.toLowerCase() === "svg";
    if (m.button === 0 && E) {
      m.currentTarget.setPointerCapture(m.pointerId);
      const Y = Q(m.clientX, m.clientY);
      Ie({
        startX: Y.x,
        startY: Y.y,
        currentX: Y.x,
        currentY: Y.y
      }), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, _e = (m) => {
    if (M.current)
      C(m.clientX, m.clientY);
    else if (z) {
      const W = Q(m.clientX, m.clientY);
      Ie((E) => E ? { ...E, currentX: W.x, currentY: W.y } : null);
    } else re ? Fe(m) : T && se(
      (W) => W ? { ...W, currentWorldPos: Q(m.clientX, m.clientY) } : null
    );
  }, qe = (m) => {
    if (m.currentTarget.hasPointerCapture(m.pointerId) && m.currentTarget.releasePointerCapture(m.pointerId), M.current && L(), z) {
      const W = Math.min(z.startX, z.currentX), E = Math.min(z.startY, z.currentY), Y = Math.max(z.startX, z.currentX), U = Math.max(z.startY, z.currentY);
      if (Y - W > 4 || U - E > 4) {
        const $ = [];
        for (const [oe, F] of Object.entries(K.nodes))
          F.x < Y && F.x + F.width > W && F.y < U && F.y + F.height > E && $.push(oe);
        for (const [oe, F] of Object.entries(K.containers))
          F.x < Y && F.x + F.width > W && F.y < U && F.y + F.height > E && $.push(oe);
        t({ type: "SELECTION_CHANGE", payload: { selectedIds: $ } });
      }
      Ie(null);
    }
    re && je(m), T && se(null);
  }, et = d ?? (w == null ? void 0 : w.mode) === "flow", tt = V(
    (m, W) => {
      const E = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, Y = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      t({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: m,
          position: W,
          direction: i,
          suggestedNewNodeId: E,
          suggestedNewEdgeId: Y
        }
      });
    },
    [i, t]
  ), nt = A ?? d ?? (w == null ? void 0 : w.mode) === "flow", st = V(
    (m) => {
      const W = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, E = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, Y = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      t({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: m,
          direction: i,
          suggestedNewNodeId: W,
          suggestedNewEdge1Id: E,
          suggestedNewEdge2Id: Y
        }
      }), t({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [W] }
      });
    },
    [i, t]
  ), ot = Object.values(g.containers);
  return /* @__PURE__ */ _(
    "div",
    {
      ref: y,
      className: `sysflow-canvas ${s === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${n}`,
      "data-theme": s,
      onWheel: f,
      onPointerDown: Je,
      onPointerMove: _e,
      onPointerUp: qe,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ v(
          kt,
          {
            graph: g,
            registerMeasureElement: R,
            nodeTypes: S,
            containerTypes: Z
          }
        ),
        /* @__PURE__ */ _("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ v("button", { onClick: H, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ v("button", { onClick: N, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ _("button", { onClick: k, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(O.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ _(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${O.x}px, ${O.y}px) scale(${O.zoom})`
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
              T && /* @__PURE__ */ v("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ v(
                "line",
                {
                  x1: T.startWorldPos.x,
                  y1: T.startWorldPos.y,
                  x2: T.currentWorldPos.x,
                  y2: T.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ v("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: ot.map((m) => {
                const W = K.containers[m.id];
                if (!W) return null;
                const E = Object.values(g.nodes).some((Y) => Y.parentId === m.id) || Object.values(g.containers).some((Y) => Y.parentId === m.id);
                return /* @__PURE__ */ v(
                  vt,
                  {
                    container: m,
                    layout: W,
                    selected: e.includes(m.id),
                    isHovered: ze === m.id,
                    hasChildren: E,
                    customRenderer: m.type ? Z == null ? void 0 : Z[m.type] : void 0,
                    onToggleCollapse: (Y, U) => t({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: Y, collapsed: U }
                    }),
                    onPointerDown: ke,
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
                Dt,
                {
                  graph: g,
                  layout: K,
                  selectedIds: e,
                  direction: i,
                  showArrows: G,
                  routing: u,
                  portOptions: X,
                  enableEdgeQuickAdd: nt,
                  onInsertNodeOnEdge: st,
                  onEdgeClick: (m) => t({ type: "SELECTION_CHANGE", payload: { selectedIds: [m] } })
                }
              ),
              /* @__PURE__ */ v("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(g.nodes).map((m) => {
                const W = K.nodes[m.id];
                return W ? /* @__PURE__ */ v(
                  Pt,
                  {
                    node: m,
                    layout: W,
                    direction: i,
                    edges: g.edges,
                    portOptions: X,
                    selected: e.includes(m.id),
                    customRenderer: m.type ? S == null ? void 0 : S[m.type] : void 0,
                    enableQuickAdd: et,
                    onAddConnectedNode: tt,
                    onPointerDown: ke,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (E) => {
                      E.stopPropagation(), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [m.id] } }), I == null || I(m.id, m);
                    },
                    onPortPointerDown: $e,
                    onPortPointerUp: Ue
                  },
                  m.id
                ) : null;
              }) }),
              re && /* @__PURE__ */ v(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${re.ghostPosition.x}px, ${re.ghostPosition.y}px)`,
                    width: `${((De = P.get(re.draggedEntity.id)) == null ? void 0 : De.width) || 200}px`,
                    height: `${((He = P.get(re.draggedEntity.id)) == null ? void 0 : He.height) || 64}px`
                  },
                  children: /* @__PURE__ */ v("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: re.draggedEntity.label })
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
  Xt as EdgeRewireStrategy,
  vt as GraphContainer,
  Dt as GraphEdgeLayer,
  Pt as GraphNode,
  Ht as GraphPortLayer,
  St as ReparentStrategy,
  bt as SugiyamaEngine,
  Ot as SysFlowCanvas,
  pt as WorkerBridge,
  Ee as computeEntityPortLocations,
  ve as pruneDanglingEdges,
  Oe as resolveEffectiveEntityId,
  xt as useCanvasTransform,
  Kt as useDragGesture,
  Tt as useGraphHistory,
  Lt as useMeasurement
};
