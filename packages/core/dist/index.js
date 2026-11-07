var Be = Object.defineProperty;
var be = (o, e, g) => e in o ? Be(o, e, { enumerable: !0, configurable: !0, writable: !0, value: g }) : o[e] = g;
var bt = (o, e, g) => be(o, typeof e != "symbol" ? e + "" : e, g);
import { useState as it, useRef as It, useCallback as Q, useEffect as kt, useMemo as Tt } from "react";
import { jsxs as et, jsx as Y, Fragment as Ht } from "react/jsx-runtime";
function me(o, e, g, r) {
  const c = (C) => {
    const a = g.find(
      (m) => m.sourceId === e && m.sourcePortId === C || m.targetId === e && m.targetPortId === C
    );
    if (!a) return null;
    const l = a.sourceId === e ? a.targetId : a.sourceId, i = r[l];
    return i ? { x: i.x + i.width / 2, y: i.y + i.height / 2 } : null;
  };
  ["left", "right"].forEach((C) => {
    o[C].sort((a, l) => {
      var y, u;
      const i = ((y = c(a.id)) == null ? void 0 : y.y) ?? 0, m = ((u = c(l.id)) == null ? void 0 : u.y) ?? 0;
      return i - m;
    });
  }), ["top", "bottom"].forEach((C) => {
    o[C].sort((a, l) => {
      var y, u;
      const i = ((y = c(a.id)) == null ? void 0 : y.x) ?? 0, m = ((u = c(l.id)) == null ? void 0 : u.x) ?? 0;
      return i - m;
    });
  });
}
function pe(o, e, g, r, c, C) {
  if (!c || !C)
    return g ? "left" : "right";
  const a = r.find(
    (u) => g ? u.targetId === o && u.targetPortId === e : u.sourceId === o && u.sourcePortId === e
  );
  if (!a) return g ? "left" : "right";
  const l = g ? a.sourceId : a.targetId, i = c[l];
  if (!i) return g ? "left" : "right";
  const m = i.x + i.width / 2 - (C.x + C.width / 2), y = i.y + i.height / 2 - (C.y + C.height / 2);
  return Math.abs(m) > Math.abs(y) ? m > 0 ? "right" : "left" : y > 0 ? "bottom" : "top";
}
function Dt(o, e, g = "LR", r, c) {
  const C = /* @__PURE__ */ new Map();
  if (!o || !e || !o.ports || o.ports.length === 0)
    return C;
  const a = (c == null ? void 0 : c.direction) || g, l = a === "TB" || a === "BT", i = (c == null ? void 0 : c.mode) || (l ? "strict-flow" : "perimeter-optimized"), m = r ? Array.isArray(r) ? r : Object.values(r) : [], y = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, u = new Set(
    m.filter((G) => G.targetId === o.id).map((G) => G.targetPortId)
  );
  new Set(
    m.filter((G) => G.sourceId === o.id).map((G) => G.sourcePortId)
  ), o.ports.forEach((G) => {
    let E = G.side || "auto";
    if (E !== "auto") {
      y[E].push(G);
      return;
    }
    if (i === "strict-flow") {
      const p = u.has(G.id) || G.label.toLowerCase().includes("in");
      switch (a) {
        case "BT":
          E = p ? "bottom" : "top";
          break;
        case "TB":
          E = p ? "top" : "bottom";
          break;
        case "RL":
          E = p ? "right" : "left";
          break;
        case "LR":
        default:
          E = p ? "left" : "right";
          break;
      }
    } else
      E = pe(
        o.id,
        G.id,
        u.has(G.id),
        m,
        c == null ? void 0 : c.nodeLayouts,
        e
      );
    y[E].push(G);
  }), i === "perimeter-optimized" && (c != null && c.nodeLayouts) && me(y, o.id, m, c.nodeLayouts);
  const x = (G, E) => {
    const p = G.length;
    G.forEach((n, t) => {
      let s = 0, d = 0;
      E === "left" || E === "right" ? (d = e.height / (p + 1) * (t + 1), s = E === "left" ? 0 : e.width) : (s = e.width / (p + 1) * (t + 1), d = E === "top" ? 0 : e.height), C.set(n.id, {
        portId: n.id,
        side: E,
        localX: s,
        localY: d,
        worldX: e.x + s,
        worldY: e.y + d
      });
    });
  };
  return x(y.left, "left"), x(y.right, "right"), x(y.top, "top"), x(y.bottom, "bottom"), C;
}
function Xt(o) {
  const e = {}, g = (r) => {
    var C;
    const c = o.nodes[r];
    return new Set(((C = c == null ? void 0 : c.ports) == null ? void 0 : C.map((a) => a.id)) || []);
  };
  for (const [r, c] of Object.entries(o.edges)) {
    const C = g(c.sourceId), a = g(c.targetId), l = C.has(c.sourcePortId), i = a.has(c.targetPortId);
    l && i && (e[r] = c);
  }
  return {
    ...o,
    edges: e
  };
}
class xe {
  static assignDynamicPortSides(e, g, r) {
    var C, a;
    const c = (l) => g[l] || r[l];
    for (const l of Object.values(e.edges)) {
      const i = c(l.sourceId), m = c(l.targetId);
      if (!i || !m) continue;
      const y = e.nodes[l.sourceId] || e.containers[l.sourceId], u = e.nodes[l.targetId] || e.containers[l.targetId], x = m.x + m.width / 2 - (i.x + i.width / 2), G = m.y + m.height / 2 - (i.y + i.height / 2), E = Math.abs(x) > Math.abs(G) * 1.25, p = (C = y == null ? void 0 : y.ports) == null ? void 0 : C.find((t) => t.id === l.sourcePortId);
      p && (!p.side || p.side === "auto") && (E ? p.side = x >= 0 ? "right" : "left" : p.side = G >= 0 ? "bottom" : "top");
      const n = (a = u == null ? void 0 : u.ports) == null ? void 0 : a.find((t) => t.id === l.targetPortId);
      n && (!n.side || n.side === "auto") && (E ? n.side = x >= 0 ? "left" : "right" : n.side = G >= 0 ? "top" : "bottom");
    }
  }
}
const Ot = 22, Vt = 18, Qt = 38, Zt = 210, zt = 36, Ge = 180, Se = 54, Ft = 260, jt = 160;
class Pt {
  static execute(e, g, r) {
    var n;
    const c = {}, C = {}, a = (t) => {
      var I, w, Z, S, W;
      const s = !!e.containers[t], d = !!((I = e.containers[t]) != null && I.collapsed);
      return s && d ? { width: Zt, height: zt } : s && !d ? {
        width: ((w = r.get(t)) == null ? void 0 : w.width) || Ft,
        height: ((Z = r.get(t)) == null ? void 0 : Z.height) || jt
      } : {
        width: ((S = r.get(t)) == null ? void 0 : S.width) || Ge,
        height: ((W = r.get(t)) == null ? void 0 : W.height) || Se
      };
    }, l = /* @__PURE__ */ new Map();
    for (const [t, s] of Object.entries(e.nodes)) {
      const d = s.parentId ?? null;
      l.has(d) || l.set(d, []), l.get(d).push(t);
    }
    for (const [t, s] of Object.entries(e.containers)) {
      const d = s.parentId ?? null;
      l.has(d) || l.set(d, []), l.get(d).push(t);
    }
    const i = Pt.getContainerDepths(e), m = Object.keys(e.containers).sort(
      (t, s) => (i.get(s) || 0) - (i.get(t) || 0)
    ), y = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), x = (t) => y.has(t) ? y.get(t) : a(t);
    for (const t of m) {
      if (!!((n = e.containers[t]) != null && n.collapsed)) {
        y.set(t, {
          width: Zt,
          height: zt
        });
        continue;
      }
      const d = l.get(t) || [];
      if (d.length === 0) {
        y.set(t, {
          width: Ft,
          height: jt
        });
        continue;
      }
      const I = g.arrange(t, d, e, x);
      for (const S of I.boxes)
        u.set(S.id, S);
      const w = Math.max(I.width + Ot * 2, Zt), Z = I.height + Qt + Vt * 2;
      y.set(t, { width: w, height: Z });
    }
    const G = l.get(null) || [];
    let E = [];
    G.length > 0 && (E = g.arrange(null, G, e, x).boxes.map((s) => ({
      ...s,
      localX: s.localX + 60,
      localY: s.localY + 60
    })));
    const p = (t, s, d, I, w) => {
      var W;
      const Z = !!e.containers[t], S = { id: t, x: s, y: d, width: I, height: w };
      if (Z) {
        if (C[t] = S, (W = e.containers[t]) != null && W.collapsed) return;
        const z = s + Ot, N = d + Qt + Vt, h = l.get(t) || [];
        for (const A of h) {
          const b = u.get(A);
          b && p(
            A,
            z + b.localX,
            N + b.localY,
            b.width,
            b.height
          );
        }
      } else
        c[t] = S;
    };
    for (const t of E)
      p(t.id, t.localX, t.localY, t.width, t.height);
    return xe.assignDynamicPortSides(e, c, C), { nodes: c, containers: C };
  }
  static getContainerDepths(e) {
    const g = /* @__PURE__ */ new Map(), r = (c) => {
      var l;
      if (g.has(c)) return g.get(c);
      const C = (l = e.containers[c]) == null ? void 0 : l.parentId;
      if (!C || !e.containers[C])
        return g.set(c, 0), 0;
      const a = 1 + r(C);
      return g.set(c, a), a;
    };
    for (const c of Object.keys(e.containers))
      r(c);
    return g;
  }
}
const Le = 70, xt = 28;
class Ke {
  constructor(e = {}) {
    this.options = e;
  }
  arrange(e, g, r, c) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = this.options.direction ?? "TB", a = C === "TB" || C === "BT", l = C === "BT" || C === "RL", i = new Set(g), m = [], y = /* @__PURE__ */ new Set();
    for (const A of Object.values(r.edges)) {
      const b = this.resolveToDirectChild(A.sourceId, i, r), L = this.resolveToDirectChild(A.targetId, i, r);
      if (b && L && b !== L) {
        const H = `${b}->${L}`;
        y.has(H) || (y.add(H), m.push({ sourceId: b, targetId: L }));
      }
    }
    const u = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
    for (const A of g)
      u.set(A, 0), x.set(A, []), G.set(A, []);
    for (const A of m)
      x.get(A.sourceId).push(A.targetId), G.get(A.targetId).push(A.sourceId), u.set(A.targetId, (u.get(A.targetId) || 0) + 1);
    const E = /* @__PURE__ */ new Map(), p = g.filter((A) => (u.get(A) || 0) === 0);
    for (const A of p) E.set(A, 0);
    const n = /* @__PURE__ */ new Set();
    for (; p.length > 0; ) {
      const A = p.shift();
      n.add(A);
      const b = E.get(A);
      for (const L of x.get(A)) {
        const H = Math.max(E.get(L) || 0, b + 1);
        E.set(L, H), u.set(L, u.get(L) - 1), u.get(L) === 0 && p.push(L);
      }
    }
    for (const A of g)
      n.has(A) || E.set(A, 0);
    const t = /* @__PURE__ */ new Map();
    for (const [A, b] of E.entries())
      t.has(b) || t.set(b, []), t.get(b).push(A);
    const s = Array.from(t.keys()).sort((A, b) => A - b), d = l ? [...s].reverse() : s, I = /* @__PURE__ */ new Map(), w = (A) => {
      const b = c(A);
      return a ? b.width : b.height;
    };
    for (const A of s) {
      const b = t.get(A) || [];
      let L = -1 / 0;
      for (const H of b) {
        const D = w(H), B = G.get(H) || [];
        let P = null;
        if (B.length > 0) {
          const M = B.map((_) => {
            const T = I.get(_);
            return T === void 0 ? null : T + w(_) / 2;
          }).filter((_) => _ !== null);
          M.length > 0 && (P = M.reduce((_, T) => _ + T, 0) / M.length);
        }
        let R = P !== null ? P - D / 2 : 0;
        R < L + xt && (R = L === -1 / 0 ? 0 : L + xt), I.set(H, R), L = R + D;
      }
    }
    for (let A = s.length - 1; A >= 0; A--) {
      const b = s[A], L = t.get(b) || [];
      for (const D of L) {
        const B = x.get(D) || [];
        if (B.length === 0) continue;
        const P = B.map((R) => {
          const M = I.get(R);
          return M === void 0 ? null : M + w(R) / 2;
        }).filter((R) => R !== null);
        if (P.length > 0) {
          const R = P.reduce((_, T) => _ + T, 0) / P.length, M = w(D);
          I.set(D, R - M / 2);
        }
      }
      let H = -1 / 0;
      for (const D of L) {
        const B = w(D);
        let P = I.get(D) ?? 0;
        P < H + xt && (P = H === -1 / 0 ? 0 : H + xt, I.set(D, P)), H = P + B;
      }
    }
    let Z = 1 / 0;
    for (const A of I.values())
      Z = Math.min(Z, A);
    const S = Z < 0 ? -Z : 0, W = [];
    let z = 0;
    for (const A of d) {
      const b = t.get(A);
      let L = 0;
      for (const H of b) {
        const D = c(H), B = a ? D.height : D.width, P = (I.get(H) ?? 0) + S, R = a ? P : z, M = a ? z : P;
        W.push({ id: H, localX: R, localY: M, width: D.width, height: D.height }), L = Math.max(L, B);
      }
      z += L + Le;
    }
    const N = Math.max(...W.map((A) => A.localX + A.width), 0), h = Math.max(...W.map((A) => A.localY + A.height), 0);
    return { width: N, height: h, boxes: W };
  }
  resolveToDirectChild(e, g, r) {
    var C, a;
    let c = e;
    for (; c; ) {
      if (g.has(c)) return c;
      c = ((C = r.nodes[c]) == null ? void 0 : C.parentId) ?? ((a = r.containers[c]) == null ? void 0 : a.parentId) ?? null;
    }
    return null;
  }
}
const Ct = 32, $t = 24;
class Ee {
  constructor(e = 1.55) {
    this.targetAspect = e;
  }
  arrange(e, g, r, c) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const C = g.map((l) => {
      const i = c(l);
      return { id: l, width: i.width, height: i.height };
    }), a = this.findBestTightPacking(C, this.targetAspect);
    return { width: a.width, height: a.height, boxes: a.boxes };
  }
  findBestTightPacking(e, g) {
    if (e.length === 1)
      return {
        width: e[0].width,
        height: e[0].height,
        boxes: [{ id: e[0].id, localX: 0, localY: 0, width: e[0].width, height: e[0].height }],
        score: 0
      };
    const r = e.reduce((u, x) => u + x.width * x.height, 0), c = Math.max(...e.map((u) => u.width)), C = [...e].sort((u, x) => x.width - u.width), a = /* @__PURE__ */ new Set(), l = e.reduce((u, x) => u + x.width, 0) + (e.length - 1) * Ct;
    a.add(l), a.add(c);
    const i = Math.max(c, Math.sqrt(r * g));
    a.add(i), a.add(i * 0.85), a.add(i * 1.15);
    const m = Math.min(e.length, 6);
    for (let u = 2; u <= m; u++) {
      let x = 0;
      for (let G = 0; G < u && G < C.length; G++)
        x += C[G].width;
      x += (u - 1) * Ct, x >= c && a.add(x);
    }
    let y = null;
    for (const u of a) {
      const x = this.simulateSkylinePacking(e, u), G = x.width * x.height, E = Math.max(0, G - r), p = x.width / Math.max(1, x.height), n = Math.abs(Math.log(p / g)), t = E / r * 2 + n * 0.25;
      x.score = t, (!y || t < y.score) && (y = x);
    }
    return y;
  }
  simulateSkylinePacking(e, g) {
    const r = [...e].sort((i, m) => m.height - i.height), c = [{ x: 0, width: g, y: 0 }], C = [];
    for (const i of r) {
      let m = 1 / 0, y = -1;
      for (let t = 0; t < c.length; t++) {
        if (c[t].x + i.width > g) continue;
        let d = 0, I = 0;
        for (let w = t; w < c.length && I < i.width; w++)
          d = Math.max(d, c[w].y), I += c[w].width;
        d < m && (m = d, y = t);
      }
      if (y === -1) {
        const t = Math.max(...c.map((d) => d.y)), s = t === 0 ? 0 : t + $t;
        C.push({ id: i.id, localX: 0, localY: s, width: i.width, height: i.height }), c.length = 0, c.push({ x: 0, width: i.width + Ct, y: s + i.height }), g > i.width + Ct && c.push({
          x: i.width + Ct,
          width: g - (i.width + Ct),
          y: 0
        });
        continue;
      }
      const u = c[y].x, x = m === 0 ? 0 : m + $t;
      C.push({ id: i.id, localX: u, localY: x, width: i.width, height: i.height });
      const G = i.width + Ct, E = x + i.height, p = { x: u, width: G, y: E }, n = [];
      for (const t of c)
        t.x + t.width <= u || t.x >= u + G ? n.push(t) : (t.x < u && n.push({ x: t.x, width: u - t.x, y: t.y }), t.x + t.width > u + G && n.push({
          x: u + G,
          width: t.x + t.width - (u + G),
          y: t.y
        }));
      n.push(p), n.sort((t, s) => t.x - s.x), c.length = 0, c.push(...n);
    }
    const a = Math.max(...C.map((i) => i.localX + i.width), 0), l = Math.max(...C.map((i) => i.localY + i.height), 0);
    return { width: a, height: l, boxes: C, score: 0 };
  }
}
function Ut(o, e, g) {
  var C, a;
  let r = o, c = null;
  for (; r; )
    g.has(r) && (c = r), r = ((C = e.nodes[r]) == null ? void 0 : C.parentId) ?? ((a = e.containers[r]) == null ? void 0 : a.parentId) ?? void 0;
  return c ?? o;
}
class Ze {
  async execute(e, g, r) {
    const c = Object.values(e.containers), C = new Set(
      c.filter((u) => !!u.collapsed).map((u) => u.id)
    ), a = {};
    for (const [u, x] of Object.entries(e.edges)) {
      const G = Ut(x.sourceId, e, C), E = Ut(x.targetId, e, C);
      G !== E && (a[u] = {
        ...x,
        sourceId: G,
        targetId: E
      });
    }
    const l = {
      ...e,
      edges: a
    }, i = Object.keys(e.containers).length, y = (r != null && r.mode && r.mode !== "auto" ? r.mode : i > 0 ? "concurrent" : "flow") === "concurrent" ? new Ee((r == null ? void 0 : r.aspectRatio) ?? 1.55) : new Ke(r);
    return Pt.execute(l, y, g);
  }
}
const _t = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", ke = (o) => Uint8Array.from(atob(o), (e) => e.charCodeAt(0)), Jt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", ke(_t)], { type: "text/javascript;charset=utf-8" });
function He(o) {
  let e;
  try {
    if (e = Jt && (self.URL || self.webkitURL).createObjectURL(Jt), !e) throw "";
    const g = new Worker(e, {
      type: "module",
      name: o == null ? void 0 : o.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + _t,
      {
        type: "module",
        name: o == null ? void 0 : o.name
      }
    );
  }
}
class De {
  constructor() {
    bt(this, "worker", null);
    bt(this, "pendingRequests", /* @__PURE__ */ new Map());
    bt(this, "fallbackEngine", new Ze());
    if (typeof Worker < "u")
      try {
        this.worker = new He(), this.worker.onmessage = (e) => {
          const { id: g, success: r, layout: c, error: C } = e.data, a = this.pendingRequests.get(g);
          a && (this.pendingRequests.delete(g), r ? a.resolve(c) : a.reject(new Error(C)));
        }, this.worker.onerror = (e) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", e);
        };
      } catch (e) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", e), this.worker = null;
      }
  }
  execute(e, g, r) {
    return this.worker ? new Promise((c, C) => {
      const a = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(a, { resolve: c, reject: C });
      const l = Array.from(g.entries());
      this.worker.postMessage({
        id: a,
        graph: e,
        measurements: l,
        options: r
      });
    }) : this.fallbackEngine.execute(e, g, r);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class Pe {
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: g, hoveredEntity: r, graph: c } = e;
    return r && r.id === g.id ? null : r && c.containers[r.id] ? g.parentId === r.id ? null : {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: r.id
      }
    } : !r && g.parentId !== null && g.parentId !== void 0 ? {
      type: "ENTITY_REPARENT",
      payload: {
        entityId: g.id,
        newParentId: null
      }
    } : null;
  }
}
class Je {
  constructor() {
    bt(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(e) {
    return e.cursorWorld;
  }
  onDragEnd(e) {
    const { draggedEntity: g, hoveredEdge: r, hoveredEntity: c, cursorWorld: C, startWorldPos: a, graph: l } = e, i = Math.hypot(
      C.x - a.x,
      C.y - a.y
    );
    if (c && l.containers[c.id])
      return c.id !== g.id && g.parentId !== c.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: c.id
        }
      } : null;
    if (!c && !r) {
      const y = Object.values(l.edges).filter(
        (x) => x.targetId === g.id
      ), u = Object.values(l.edges).filter(
        (x) => x.sourceId === g.id
      );
      return y.length === 1 && u.length === 1 && y[0].sourceId !== u[0].targetId && i >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: y[0].id,
          outgoingEdgeId: u[0].id
        }
      } : i >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const m = (y) => {
      const u = l.nodes[y.id] || y;
      if (!u.ports || u.ports.length === 0) return "";
      const x = Object.values(l.edges).find((p) => p.targetId === y.id);
      if (x) {
        const p = u.ports.find((n) => n.id === x.targetPortId);
        if (p) return p.id;
      }
      const G = new Set(
        Object.values(l.edges).filter((p) => p.sourceId === y.id).map((p) => p.sourcePortId)
      ), E = u.ports.find((p) => !G.has(p.id));
      return E ? E.id : u.ports[0].id;
    };
    if (r)
      return r.sourceId === g.id || r.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: r.id,
          newSourceId: r.sourceId,
          newTargetId: g.id,
          newTargetPortId: m(g)
        }
      };
    if (c && c.id !== g.id && l.nodes[c.id]) {
      const y = Object.values(l.edges).find(
        (u) => u.targetId === c.id && u.sourceId !== g.id
      );
      if (y)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: y.id,
            newSourceId: y.sourceId,
            newTargetId: g.id,
            newTargetPortId: m(g)
          }
        };
    }
    return null;
  }
}
function ve(o, e = { min: 0.15, max: 3 }) {
  const [g, r] = it({ x: 80, y: 80, zoom: 1 }), c = It(!1), C = It({ x: 0, y: 0 }), a = Q(
    (p, n) => {
      if (!o.current) return { x: p, y: n };
      const t = o.current.getBoundingClientRect();
      return {
        x: (p - t.left - g.x) / g.zoom,
        y: (n - t.top - g.y) / g.zoom
      };
    },
    [g, o]
  ), l = Q(
    (p) => {
      if (!o.current) return;
      const n = [
        ...Object.values(p.nodes),
        ...Object.values(p.containers)
      ];
      if (n.length === 0) {
        r({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let t = 1 / 0, s = 1 / 0, d = -1 / 0, I = -1 / 0;
      for (const L of n)
        t = Math.min(t, L.x), s = Math.min(s, L.y), d = Math.max(d, L.x + L.width), I = Math.max(I, L.y + L.height);
      const w = o.current.getBoundingClientRect(), Z = 80, S = Math.max(d - t, 100), W = Math.max(I - s, 100), z = (w.width - Z * 2) / S, N = (w.height - Z * 2) / W, h = Math.min(
        Math.max(Math.min(z, N), e.min),
        Math.min(e.max, 1.25)
      ), A = (w.width - S * h) / 2 - t * h, b = (w.height - W * h) / 2 - s * h;
      r({
        x: A,
        y: b,
        zoom: h
      });
    },
    [o, e]
  ), i = Q(
    (p) => {
      if (p.preventDefault(), !!o.current)
        if (p.ctrlKey || p.metaKey) {
          const n = o.current.getBoundingClientRect(), t = p.clientX - n.left, s = p.clientY - n.top, d = p.deltaY < 0 ? 1.08 : 0.92, I = Math.min(Math.max(g.zoom * d, e.min), e.max), w = t - (t - g.x) * (I / g.zoom), Z = s - (s - g.y) * (I / g.zoom);
          r({ x: w, y: Z, zoom: I });
        } else
          r((n) => ({
            ...n,
            x: n.x - p.deltaX,
            y: n.y - p.deltaY
          }));
    },
    [g, e, o]
  ), m = Q(
    (p, n) => {
      c.current = !0, C.current = { x: p - g.x, y: n - g.y };
    },
    [g]
  ), y = Q((p, n) => {
    c.current && r((t) => ({
      ...t,
      x: p - C.current.x,
      y: n - C.current.y
    }));
  }, []), u = Q(() => {
    c.current = !1;
  }, []), x = Q(() => {
    r({ x: 80, y: 80, zoom: 1 });
  }, []), G = Q(() => {
    r((p) => ({
      ...p,
      zoom: Math.min(p.zoom * 1.2, e.max)
    }));
  }, [e]), E = Q(() => {
    r((p) => ({
      ...p,
      zoom: Math.max(p.zoom / 1.2, e.min)
    }));
  }, [e]);
  return {
    transform: g,
    setTransform: r,
    screenToWorld: a,
    onWheel: i,
    startPan: m,
    updatePan: y,
    endPan: u,
    resetTransform: x,
    zoomIn: G,
    zoomOut: E,
    zoomToFit: l,
    isPanning: c
  };
}
function Ye(o) {
  const [e, g] = it(
    /* @__PURE__ */ new Map()
  );
  It(/* @__PURE__ */ new Map());
  const r = It(/* @__PURE__ */ new Map()), c = Q((C, a) => {
    a ? r.current.set(C, a) : r.current.delete(C);
  }, []);
  return kt(() => {
    const C = new ResizeObserver((a) => {
      let l = !1;
      const i = new Map(e);
      for (const m of a) {
        const y = m.target.getAttribute("data-sysflow-measure-id");
        if (!y) continue;
        const u = Math.ceil(m.contentRect.width), x = Math.ceil(m.contentRect.height), G = i.get(y);
        (!G || G.width !== u || G.height !== x) && (i.set(y, { width: u, height: x }), l = !0);
      }
      l && g(i);
    });
    return r.current.forEach((a) => C.observe(a)), () => {
      C.disconnect();
    };
  }, [o]), { measurements: e, registerMeasureElement: c };
}
function Ne(o, e, g, r, c) {
  const [C, a] = it(null), [l, i] = it(null), m = It(null), y = It(null), u = Q(
    (n, t) => {
      let s = null, d = 1 / 0;
      for (const [I, w] of Object.entries(e.containers))
        if (I !== t && n.x >= w.x && n.x <= w.x + w.width && n.y >= w.y && n.y <= w.y + w.height) {
          const Z = w.width * w.height;
          Z < d && (d = Z, s = o.containers[I] || null);
        }
      if (s) return s;
      for (const [I, w] of Object.entries(e.nodes))
        if (I !== t && n.x >= w.x && n.x <= w.x + w.width && n.y >= w.y && n.y <= w.y + w.height)
          return o.nodes[I] || null;
      return null;
    },
    [e, o]
  ), x = Q(
    (n, t) => {
      let s = null, d = 45;
      for (const I of Object.values(o.edges)) {
        if (I.sourceId === t || I.targetId === t) continue;
        const w = e.nodes[I.sourceId] || e.containers[I.sourceId], Z = e.nodes[I.targetId] || e.containers[I.targetId];
        if (!w || !Z) continue;
        const S = w.x + w.width, W = w.y + w.height / 2, z = Z.x, N = Z.y + Z.height / 2;
        for (let h = 0; h <= 10; h++) {
          const A = h / 10, b = (1 - A) * S + A * z, L = (1 - A) * W + A * N, H = Math.hypot(n.x - b, n.y - L);
          H < d && (d = H, s = I);
        }
      }
      return s;
    },
    [e, o]
  ), G = Q(
    (n, t) => {
      if (t.stopPropagation(), g.canDrag && !g.canDrag(n, o))
        return;
      const s = r(t.clientX, t.clientY);
      a({
        draggedEntity: n,
        ghostPosition: s,
        startPosition: s
      });
    },
    [o, g, r]
  ), E = Q(
    (n) => {
      if (!C) return;
      const t = r(n.clientX, n.clientY), s = u(t, C.draggedEntity.id), d = x(t, C.draggedEntity.id);
      m.current = s, y.current = d, s && o.containers[s.id] ? i(s.id) : i(null);
      const I = g.onDragMove ? g.onDragMove({
        draggedEntity: C.draggedEntity,
        cursorWorld: t,
        startWorldPos: C.startPosition,
        hoveredEntity: s,
        hoveredEdge: d,
        graph: o,
        layout: e
      }) : t;
      I && a((w) => w ? { ...w, ghostPosition: I } : null);
    },
    [C, r, g, o, e, u, x]
  ), p = Q(
    (n) => {
      if (!C) return;
      const t = r(n.clientX, n.clientY), s = u(t, C.draggedEntity.id), d = x(t, C.draggedEntity.id), I = g.onDragEnd({
        draggedEntity: C.draggedEntity,
        cursorWorld: t,
        startWorldPos: C.startPosition,
        hoveredEntity: s,
        hoveredEdge: d,
        graph: o,
        layout: e
      });
      I && c(I), a(null), i(null), m.current = null, y.current = null;
    },
    [C, r, g, o, e, u, x, c]
  );
  return {
    dragState: C,
    hoveredContainerId: l,
    handlePointerDown: G,
    handlePointerMove: E,
    handlePointerUp: p
  };
}
function We(o, e) {
  const g = [], r = [], c = [], C = [], a = [];
  for (const [l, i] of Object.entries(e.nodes))
    o.nodes[l] ? o.nodes[l] !== i && r.push(i) : g.push(i);
  for (const l of Object.keys(o.nodes))
    e.nodes[l] || c.push(l);
  for (const [l, i] of Object.entries(e.edges))
    o.edges[l] || C.push(i);
  for (const [l, i] of Object.entries(o.edges))
    e.edges[l] || a.push(i);
  return { createdNodes: g, updatedNodes: r, deletedNodes: c, createdEdges: C, deletedEdges: a };
}
function Me(o) {
  return o.createdNodes.length > 0 || o.updatedNodes.length > 0 || o.deletedNodes.length > 0 || o.createdEdges.length > 0 || o.deletedEdges.length > 0;
}
function _e(o, e) {
  const [g, r] = it({
    history: [o],
    index: 0
  }), [c, C] = it(null), a = It(e);
  a.current = e;
  const l = g.history[g.index] ?? g.history[0] ?? o, i = Q((s) => {
    var I;
    const d = Xt(s);
    if ((I = a.current) != null && I.onMutate) {
      const w = We(l, d);
      Me(w) && a.current.onMutate(w);
    }
    r((w) => {
      const Z = w.history.slice(0, w.index + 1);
      return {
        history: [...Z, d],
        index: Z.length
      };
    });
  }, [l]), m = Q((s) => {
    const d = Xt(s);
    r({
      history: [d],
      index: 0
    });
  }, []), y = Q(() => {
    r((s) => ({
      ...s,
      index: Math.max(0, s.index - 1)
    }));
  }, []), u = Q(() => {
    r((s) => ({
      ...s,
      index: Math.min(s.history.length - 1, s.index + 1)
    }));
  }, []), x = Q(
    (s) => {
      var S;
      if (!s || s.length === 0) return;
      let d = s;
      if ((S = a.current) != null && S.canDelete) {
        const W = a.current.canDelete(s);
        if (typeof W == "boolean") {
          if (!W) return;
        } else Array.isArray(W) && (d = W);
      }
      if (d.length === 0) return;
      const I = { ...l.nodes }, w = { ...l.containers }, Z = { ...l.edges };
      for (const W of d)
        delete I[W], delete w[W], delete Z[W];
      i({
        ...l,
        nodes: I,
        containers: w,
        edges: Z
      });
    },
    [l, i]
  ), G = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (s) => {
    const d = Math.random() * 16 | 0;
    return (s === "x" ? d : d & 3 | 8).toString(16);
  }), E = Q(
    (s) => {
      var w, Z, S, W, z, N;
      const d = l, I = a.current;
      if (s.type === "ENTITY_REPARENT") {
        const { entityId: h, newParentId: A } = s.payload, b = {
          ...d,
          nodes: { ...d.nodes },
          containers: { ...d.containers }
        };
        b.nodes[h] ? b.nodes[h] = { ...b.nodes[h], parentId: A } : b.containers[h] && (b.containers[h] = { ...b.containers[h], parentId: A }), i(b);
      } else if (s.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: h, direction: A, suggestedNewNodeId: b, suggestedNewEdge1Id: L, suggestedNewEdge2Id: H } = s.payload, D = d.edges[h.id];
        if (!D) return;
        const B = d.nodes[D.sourceId];
        if (I != null && I.canConnect && (!I.canConnect(D.sourceId, b) || !I.canConnect(b, D.targetId)))
          return;
        const P = A === "BT", R = A === "TB", M = `p_in_${Date.now()}`, _ = `p_out_${Date.now() + 1}`;
        let T = "left", U = "right";
        P ? (T = "bottom", U = "top") : R ? (T = "top", U = "bottom") : A === "RL" && (T = "right", U = "left");
        const X = (w = I == null ? void 0 : I.createNodeEntity) == null ? void 0 : w.call(I, {
          edge: D,
          direction: A,
          suggestedType: (B == null ? void 0 : B.type) || "FlowTask"
        }), q = {
          id: (X == null ? void 0 : X.id) || b,
          label: (X == null ? void 0 : X.label) || `Node ${Object.keys(d.nodes).length + 1}`,
          type: (X == null ? void 0 : X.type) || (B == null ? void 0 : B.type) || "FlowTask",
          parentId: (X == null ? void 0 : X.parentId) ?? (B == null ? void 0 : B.parentId) ?? null,
          ports: (X == null ? void 0 : X.ports) || [
            { id: M, label: "in", side: T },
            { id: _, label: "out", side: U }
          ],
          data: (X == null ? void 0 : X.data) || {},
          ...X
        }, At = q.ports.find((st) => st.label.toLowerCase().includes("in")) || q.ports.find((st) => st.side === (P ? "bottom" : "top")) || q.ports[0], J = q.ports.find((st) => st.label.toLowerCase().includes("out")) || q.ports.find((st) => st.side === (P ? "top" : "bottom")) || q.ports[q.ports.length - 1], at = At ? At.id : M, rt = J ? J.id : _, O = {
          id: L,
          sourceId: D.sourceId,
          sourcePortId: D.sourcePortId,
          targetId: q.id,
          targetPortId: at
        }, tt = {
          id: H,
          sourceId: q.id,
          sourcePortId: rt,
          targetId: D.targetId,
          targetPortId: D.targetPortId
        }, F = { ...d.edges };
        delete F[D.id], F[L] = O, F[H] = tt, i({
          ...d,
          nodes: { ...d.nodes, [q.id]: q },
          edges: F
        });
      } else if (s.type === "NODE_EXTRACT") {
        const { incomingEdgeId: h, outgoingEdgeId: A } = s.payload, b = d.edges[h], L = d.edges[A];
        if (!b || !L || I != null && I.canConnect && !I.canConnect(b.sourceId, L.targetId))
          return;
        const H = { ...d.edges };
        H[h] = {
          ...b,
          targetId: L.targetId,
          targetPortId: L.targetPortId
        }, delete H[A], i({
          ...d,
          edges: H
        });
      } else if (s.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: h, position: A, direction: b, suggestedNewNodeId: L, suggestedNewEdgeId: H } = s.payload, D = b === "BT", B = `p_in_${Date.now()}`, P = `p_out_${Date.now() + 1}`, R = D && A === "bottom" || !D && A === "top", M = R ? L : h.id, _ = R ? h.id : L;
        if (I != null && I.canConnect && !I.canConnect(M, _))
          return;
        const T = (Z = I == null ? void 0 : I.createNodeEntity) == null ? void 0 : Z.call(I, {
          sourceNode: h,
          position: A,
          direction: b,
          suggestedType: h.type
        }), U = {
          id: (T == null ? void 0 : T.id) || L,
          label: (T == null ? void 0 : T.label) || `Node ${Object.keys(d.nodes).length + 1}`,
          type: (T == null ? void 0 : T.type) || h.type,
          ports: (T == null ? void 0 : T.ports) || [
            { id: B, label: "in", side: D ? "bottom" : "top" },
            { id: P, label: "out", side: D ? "top" : "bottom" }
          ],
          data: (T == null ? void 0 : T.data) || {},
          parentId: (T == null ? void 0 : T.parentId) ?? (h == null ? void 0 : h.parentId) ?? null,
          ...T
        }, X = U.ports.find((tt) => tt.label.toLowerCase().includes("in")) || U.ports.find((tt) => tt.side === (D ? "bottom" : "top")) || U.ports[0], q = U.ports.find((tt) => tt.label.toLowerCase().includes("out")) || U.ports.find((tt) => tt.side === (D ? "top" : "bottom")) || U.ports[U.ports.length - 1], At = X ? X.id : B, J = q ? q.id : P, at = h.ports.find((tt) => tt.label === "in") || h.ports[0], rt = h.ports.find((tt) => tt.label === "out") || h.ports[h.ports.length - 1];
        let O;
        R ? O = {
          id: H,
          sourceId: U.id,
          sourcePortId: J,
          targetId: h.id,
          targetPortId: (at == null ? void 0 : at.id) || "in"
        } : O = {
          id: H,
          sourceId: h.id,
          sourcePortId: (rt == null ? void 0 : rt.id) || "out",
          targetId: U.id,
          targetPortId: At
        }, i({
          ...d,
          nodes: { ...d.nodes, [U.id]: U },
          edges: { ...d.edges, [H]: O }
        });
      } else if (s.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: h, collapsed: A } = s.payload;
        d.containers[h] && i({
          ...d,
          containers: {
            ...d.containers,
            [h]: { ...d.containers[h], collapsed: A }
          }
        });
      } else if (s.type === "NODE_UPDATE") {
        const { id: h, updates: A } = s.payload;
        d.nodes[h] && i({
          ...d,
          nodes: {
            ...d.nodes,
            [h]: { ...d.nodes[h], ...A }
          }
        });
      } else if (s.type === "EDGE_CREATE") {
        const h = s.payload.edge, A = h.sourceId, b = h.targetId, L = h.sourcePortId, H = h.targetPortId;
        if (I != null && I.canConnect && !I.canConnect(A, b, L, H))
          return;
        const D = s.payload.id || h.id || G();
        i({
          ...d,
          edges: {
            ...d.edges,
            [D]: { id: D, ...h }
          }
        });
      } else if (s.type === "EDGE_DELETE") {
        const h = s.payload.edgeId || s.payload.id, A = { ...d.edges };
        delete A[h], i({ ...d, edges: A });
      } else if (s.type === "EDGE_REWIRE") {
        const { edgeId: h, newTargetId: A } = s.payload;
        if (!A || !d.edges[h]) return;
        const b = A, L = d.edges[h], H = L.sourceId, D = L.targetId;
        if (b === H || b === D) return;
        const B = Object.values(d.edges).find((X) => X.targetId === b), P = Object.values(d.edges).find((X) => X.sourceId === b), R = B && P && B.sourceId !== P.targetId;
        if (I != null && I.canConnect && (R && !I.canConnect(B.sourceId, P.targetId) || !I.canConnect(H, b) || !I.canConnect(b, D)))
          return;
        const M = { ...d.edges };
        R ? (M[B.id] = {
          ...B,
          targetId: P.targetId,
          targetPortId: P.targetPortId
        }, delete M[P.id]) : (B && delete M[B.id], P && delete M[P.id]);
        const _ = ((W = (S = d.nodes[b]) == null ? void 0 : S.ports[0]) == null ? void 0 : W.id) || "p_in", T = ((N = (z = d.nodes[b]) == null ? void 0 : z.ports.find((X) => X.id !== _)) == null ? void 0 : N.id) || _;
        M[h] = {
          ...L,
          targetId: b,
          targetPortId: _
        };
        const U = G();
        M[U] = {
          id: U,
          sourceId: b,
          sourcePortId: T,
          targetId: D,
          targetPortId: L.targetPortId
        }, i({ ...d, edges: M });
      } else {
        const h = s;
        if (h.type === "NODE_DELETE" || h.type === "DELETE_SELECTION" || h.type === "SELECTION_DELETE") {
          const A = h.payload || {}, b = [];
          A.nodeId && b.push(A.nodeId), A.id && b.push(A.id), Array.isArray(A.selectedIds) && b.push(...A.selectedIds), Array.isArray(A.ids) && b.push(...A.ids), x(b);
        }
      }
    },
    [l, i, x]
  ), p = Q(
    (s) => {
      const d = l.nodes[s] || l.containers[s];
      d && C({ entity: JSON.parse(JSON.stringify(d)), isCut: !1 });
    },
    [l]
  ), n = Q(
    (s) => {
      const d = l.nodes[s] || l.containers[s];
      if (d) {
        C({ entity: JSON.parse(JSON.stringify(d)), isCut: !0 });
        const I = { ...l.nodes }, w = { ...l.containers };
        delete I[s], delete w[s], i({ ...l, nodes: I, containers: w });
      }
    },
    [l, i]
  ), t = Q(() => {
    if (!c) return;
    const s = c.entity, d = `${s.id}_copy_${Date.now().toString().slice(-4)}`, I = { ...s, id: d, label: `${s.label} (Copy)` };
    "collapsed" in I ? i({
      ...l,
      containers: { ...l.containers, [d]: I }
    }) : i({
      ...l,
      nodes: { ...l.nodes, [d]: I }
    });
  }, [c, l, i]);
  return {
    graph: l,
    setGraphDirect: m,
    applyAction: E,
    undo: y,
    redo: u,
    copyEntity: p,
    cutEntity: n,
    pasteEntity: t,
    deleteSelection: x,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Re = ({
  graph: o,
  registerMeasureElement: e,
  nodeTypes: g,
  containerTypes: r
}) => {
  const c = Object.values(o.nodes), C = Object.values(o.containers);
  return /* @__PURE__ */ et("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    c.map((a) => {
      const l = a.type ? g == null ? void 0 : g[a.type] : null;
      return /* @__PURE__ */ Y(
        "div",
        {
          ref: (i) => e(a.id, i),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ Y(l, { node: a, selected: !1 }) : /* @__PURE__ */ et("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ Y("div", { style: { fontWeight: 600 }, children: a.label }),
            a.ports.length > 0 && /* @__PURE__ */ et("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              a.ports.map((i) => i.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${a.id}`
      );
    }),
    C.map((a) => {
      const l = a.type ? r == null ? void 0 : r[a.type] : null;
      return /* @__PURE__ */ Y(
        "div",
        {
          ref: (i) => e(a.id, i),
          "data-sysflow-measure-id": a.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: l ? /* @__PURE__ */ Y(l, { container: a, selected: !1 }) : /* @__PURE__ */ Y("div", { className: "sysflow-container-header", children: a.label })
        },
        `measure-container-${a.id}`
      );
    })
  ] });
}, Te = ({
  graph: o,
  layout: e,
  selectedIds: g,
  direction: r = "TB",
  showArrows: c = !0,
  routing: C = "auto",
  portOptions: a,
  enableEdgeQuickAdd: l = !0,
  onEdgeClick: i,
  onInsertNodeOnEdge: m
}) => {
  const [y, u] = it(null), x = C === "step" || C === "auto" && (r === "LR" || r === "RL"), G = (n, t, s) => {
    var b, L, H, D;
    let d = n, I = null;
    for ((b = o.containers[n]) != null && b.collapsed && (I = o.containers[n]); d; ) {
      const B = ((L = o.nodes[d]) == null ? void 0 : L.parentId) ?? ((H = o.containers[d]) == null ? void 0 : H.parentId) ?? null;
      B && ((D = o.containers[B]) != null && D.collapsed) && (I = o.containers[B]), d = B;
    }
    if (I) {
      const B = e.containers[I.id];
      if (!B)
        return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: I.id };
      let P, R, M;
      return r === "TB" ? (P = s ? "bottom" : "top", R = B.x + B.width / 2, M = s ? B.y + B.height : B.y) : r === "BT" ? (P = s ? "top" : "bottom", R = B.x + B.width / 2, M = s ? B.y : B.y + B.height) : r === "RL" ? (P = s ? "left" : "right", R = s ? B.x : B.x + B.width, M = B.y + B.height / 2) : (P = s ? "right" : "left", R = s ? B.x + B.width : B.x, M = B.y + B.height / 2), { x: R, y: M, side: P, valid: !0, entityId: I.id };
    }
    if (!!o.containers[n]) {
      const B = e.containers[n];
      if (!B) return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
      let P, R, M;
      return r === "TB" ? (P = B.x + B.width / 2, R = s ? B.y + B.height : B.y, M = s ? "bottom" : "top") : r === "BT" ? (P = B.x + B.width / 2, R = s ? B.y : B.y + B.height, M = s ? "top" : "bottom") : r === "RL" ? (P = s ? B.x : B.x + B.width, R = B.y + B.height / 2, M = s ? "left" : "right") : (P = s ? B.x + B.width : B.x, R = B.y + B.height / 2, M = s ? "right" : "left"), { x: P, y: R, side: M, valid: !0, entityId: n };
    }
    const Z = o.nodes[n], S = e.nodes[n];
    if (!Z || !S)
      return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
    const z = Dt(
      Z,
      S,
      r,
      o.edges,
      a
    ).get(t);
    if (z)
      return { x: z.worldX, y: z.worldY, side: z.side, valid: !0, entityId: n };
    let N, h, A;
    return r === "TB" ? (N = S.x + S.width / 2, h = s ? S.y + S.height : S.y, A = s ? "bottom" : "top") : r === "BT" ? (N = S.x + S.width / 2, h = s ? S.y : S.y + S.height, A = s ? "top" : "bottom") : r === "RL" ? (N = s ? S.x : S.x + S.width, h = S.y + S.height / 2, A = s ? "left" : "right") : (N = s ? S.x + S.width : S.x, h = S.y + S.height / 2, A = s ? "right" : "left"), { x: N, y: h, side: A, valid: !0, entityId: n };
  }, E = (n, t) => {
    const s = (n.x + t.x) / 2, d = (n.y + t.y) / 2;
    if (n.side === "right" && t.side === "left") {
      if (t.x >= n.x + 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x + 20} ${n.y} L ${n.x + 20} ${I} L ${t.x - 20} ${I} L ${t.x - 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: I }
        };
      }
    }
    if (n.side === "left" && t.side === "right") {
      if (t.x <= n.x - 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x - 20} ${n.y} L ${n.x - 20} ${I} L ${t.x + 20} ${I} L ${t.x + 20} ${t.y} L ${t.x} ${t.y}`,
          center: { x: s, y: I }
        };
      }
    }
    if (n.side === "bottom" && t.side === "top") {
      if (t.y >= n.y + 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${d} L ${t.x} ${d} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y + 20} L ${I} ${n.y + 20} L ${I} ${t.y - 20} L ${t.x} ${t.y - 20} L ${t.x} ${t.y}`,
          center: { x: I, y: d }
        };
      }
    }
    if (n.side === "top" && t.side === "bottom") {
      if (t.y <= n.y - 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${d} L ${t.x} ${d} L ${t.x} ${t.y}`,
          center: { x: s, y: d }
        };
      {
        const I = t.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y - 20} L ${I} ${n.y - 20} L ${I} ${t.y + 20} L ${t.x} ${t.y + 20} L ${t.x} ${t.y}`,
          center: { x: I, y: d }
        };
      }
    }
    return {
      pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${t.y} L ${t.x} ${t.y}`,
      center: { x: s, y: d }
    };
  }, p = (n, t) => {
    const s = t.x - n.x, d = t.y - n.y;
    let I = n.x, w = n.y, Z = t.x, S = t.y;
    if (n.side === "bottom" && t.side === "top")
      if (d > 0) {
        const N = Math.min(28, d * 0.4);
        w = n.y + Math.max(N, d * 0.5), S = t.y - Math.max(N, d * 0.5);
      } else {
        const N = s >= 0 ? 1 : -1, h = Math.max(40, Math.abs(s) * 0.2);
        I = n.x + h * N, w = n.y + 40, Z = t.x + h * N, S = t.y - 40;
      }
    else if (n.side === "top" && t.side === "bottom")
      if (d < 0) {
        const N = Math.min(28, Math.abs(d) * 0.4);
        w = n.y - Math.max(N, Math.abs(d) * 0.5), S = t.y + Math.max(N, Math.abs(d) * 0.5);
      } else {
        const N = s >= 0 ? 1 : -1, h = Math.max(40, Math.abs(s) * 0.2);
        I = n.x + h * N, w = n.y - 40, Z = t.x + h * N, S = t.y + 40;
      }
    else if (n.side === "right" && t.side === "left")
      s > 0 ? (I = n.x + s * 0.5, Z = t.x - s * 0.5) : (I = n.x + 50, w = n.y - 50, Z = t.x - 50, S = t.y - 50);
    else if (n.side === "left" && t.side === "right")
      s < 0 ? (I = n.x + s * 0.5, Z = t.x - s * 0.5) : (I = n.x - 50, w = n.y - 50, Z = t.x + 50, S = t.y - 50);
    else {
      const N = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, h = N[n.side] || { x: 0, y: 1 }, A = N[t.side] || { x: 0, y: -1 }, b = Math.min(60, Math.hypot(s, d) * 0.35);
      I = n.x + h.x * b, w = n.y + h.y * b, Z = t.x + A.x * b, S = t.y + A.y * b;
    }
    const W = 0.125 * n.x + 0.375 * I + 0.375 * Z + 0.125 * t.x, z = 0.125 * n.y + 0.375 * w + 0.375 * S + 0.125 * t.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${I} ${w} ${Z} ${S} ${t.x} ${t.y}`,
      center: { x: W, y: z }
    };
  };
  return /* @__PURE__ */ et("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ et("defs", { children: [
      /* @__PURE__ */ Y(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ Y("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ Y(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ Y("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(o.edges).map((n) => {
      const t = G(n.sourceId, n.sourcePortId, !0), s = G(n.targetId, n.targetPortId, !1);
      if (!t.valid || !s.valid || t.entityId === s.entityId) return null;
      const d = g.includes(n.id), I = y === n.id, { pathStr: w, center: Z } = x ? E(t, s) : p(t, s);
      return /* @__PURE__ */ et(
        "g",
        {
          onMouseEnter: () => u(n.id),
          onMouseLeave: () => u(null),
          children: [
            /* @__PURE__ */ Y(
              "path",
              {
                d: w,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (S) => {
                  S.stopPropagation(), i == null || i(n.id);
                }
              }
            ),
            /* @__PURE__ */ Y(
              "path",
              {
                d: w,
                fill: "none",
                stroke: d ? "var(--sysflow-edge-selected)" : I ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: d ? 2.5 : I ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: c ? d ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            l && I && m && /* @__PURE__ */ Y("g", { transform: `translate(${Z.x}, ${Z.y})`, children: /* @__PURE__ */ et(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (S) => {
                  S.preventDefault(), S.stopPropagation(), m(n);
                },
                children: [
                  /* @__PURE__ */ Y("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ Y(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ Y(
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
}, Xe = ({
  entity: o,
  layout: e,
  direction: g = "LR",
  edges: r,
  portOptions: c,
  onPortPointerDown: C,
  onPortPointerUp: a
}) => {
  if (!o.ports || o.ports.length === 0)
    return null;
  const l = Dt(
    o,
    e,
    g,
    r,
    c
  );
  return /* @__PURE__ */ Y(Ht, { children: o.ports.map((i) => {
    const m = l.get(i.id);
    return m ? /* @__PURE__ */ Y(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${m.side}`,
        style: {
          position: "absolute",
          left: `${m.localX}px`,
          top: `${m.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${i.label} (${m.side})`,
        onPointerDown: (y) => {
          y.stopPropagation(), C == null || C(o.id, i.id, !0, y);
        },
        onPointerUp: (y) => {
          y.stopPropagation(), a == null || a(o.id, i.id, !1);
        }
      },
      i.id
    ) : null;
  }) });
}, Oe = ({
  node: o,
  layout: e,
  selected: g = !1,
  direction: r = "LR",
  edges: c,
  portOptions: C,
  enableQuickAdd: a = !1,
  onAddConnectedNode: l,
  onPointerDown: i,
  onMouseEnter: m,
  onMouseLeave: y,
  onClick: u,
  onPortPointerDown: x,
  onPortPointerUp: G,
  customRenderer: E
}) => {
  const [p, n] = it(!1);
  return /* @__PURE__ */ et(
    "div",
    {
      className: `sysflow-node ${g ? "sysflow-selected" : ""} ${o.className || ""}`,
      style: {
        transform: `translate(${e.x}px, ${e.y}px)`,
        width: `${e.width}px`,
        height: `${e.height}px`
      },
      onPointerDown: (t) => i == null ? void 0 : i(o, t),
      onMouseEnter: () => {
        n(!0), m == null || m(o.id);
      },
      onMouseLeave: () => {
        n(!1), y == null || y(o.id);
      },
      onClick: u,
      children: [
        a && p && /* @__PURE__ */ et(Ht, { children: [
          /* @__PURE__ */ Y("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ Y("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        a && p && l && /* @__PURE__ */ Y(
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
              t.preventDefault(), t.stopPropagation(), l(o, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ Y(
          Xe,
          {
            entity: o,
            layout: e,
            direction: r,
            edges: c,
            portOptions: C,
            onPortPointerDown: x,
            onPortPointerUp: G
          }
        ),
        E ? /* @__PURE__ */ Y(E, { node: o, selected: g }) : /* @__PURE__ */ et("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ Y("div", { style: { fontWeight: 600, fontSize: "13px" }, children: o.label }),
          o.ports.length > 0 && /* @__PURE__ */ et("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            o.ports.length,
            " Port",
            o.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        a && p && l && /* @__PURE__ */ Y(
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
              t.preventDefault(), t.stopPropagation(), l(o, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Ve = ({
  container: o,
  layout: e,
  selected: g,
  isHovered: r = !1,
  hasChildren: c = !1,
  onToggleCollapse: C,
  onPointerDown: a,
  onMouseEnter: l,
  onMouseLeave: i,
  onClick: m,
  customRenderer: y
}) => /* @__PURE__ */ Y(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${r ? "sysflow-hovered" : ""} ${o.className || ""}`,
    style: {
      transform: `translate(${e.x}px, ${e.y}px)`,
      width: `${e.width}px`,
      height: `${e.height}px`
    },
    onPointerDown: (u) => a(o, u),
    onMouseEnter: l,
    onMouseLeave: i,
    onClick: m,
    children: y ? /* @__PURE__ */ Y(y, { container: o, selected: g }) : /* @__PURE__ */ et(Ht, { children: [
      /* @__PURE__ */ et("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ Y("span", { className: "sysflow-container-title", title: o.label, children: o.label }),
        /* @__PURE__ */ Y(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (u) => u.stopPropagation(),
            onPointerUp: (u) => u.stopPropagation(),
            onClick: (u) => {
              u.stopPropagation(), C(o.id, !o.collapsed);
            },
            children: o.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !o.collapsed && !c && /* @__PURE__ */ Y("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Qe = {
  bg: "--sysflow-bg",
  grid: "--sysflow-grid",
  nodeBg: "--sysflow-node-bg",
  nodeBorder: "--sysflow-node-border",
  nodeSelected: "--sysflow-node-selected",
  nodeText: "--sysflow-node-text",
  nodeSubtext: "--sysflow-node-subtext",
  containerBg: "--sysflow-container-bg",
  containerHeaderBg: "--sysflow-container-header-bg",
  containerBorder: "--sysflow-container-border",
  containerHover: "--sysflow-container-hover",
  edgeStroke: "--sysflow-edge-stroke",
  edgeSelected: "--sysflow-edge-selected",
  portBg: "--sysflow-port-bg",
  portHover: "--sysflow-port-hover",
  panelBg: "--sysflow-panel-bg",
  panelBorder: "--sysflow-panel-border",
  panelBtnBg: "--sysflow-panel-btn-bg",
  panelBtnHover: "--sysflow-panel-btn-hover",
  panelBtnText: "--sysflow-panel-btn-text",
  shadow: "--sysflow-shadow"
};
function ze(o) {
  if (!o) return {};
  const e = {};
  for (const [g, r] of Object.entries(o))
    if (r !== void 0) {
      const c = Qe[g] || `--sysflow-${g.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      e[c] = r;
    }
  return e;
}
const Fe = new Pe(), qe = ({
  graph: o,
  onChange: e,
  history: g,
  enableShortcuts: r = !0,
  onNodeClick: c,
  onEdgeClick: C,
  layoutEngine: a,
  interactionStrategy: l = Fe,
  direction: i = "TB",
  layoutOptions: m,
  portPlacementMode: y,
  routing: u,
  showEdgeArrows: x = !0,
  nodeTypes: G,
  containerTypes: E,
  zoomBounds: p,
  className: n = "",
  selectedIds: t = [],
  theme: s = "dark",
  themeTokens: d,
  style: I,
  enableQuickAdd: w,
  enableEdgeQuickAdd: Z,
  onNodeCreate: S,
  onEdgeCreate: W,
  onNodeDelete: z,
  onEdgeDelete: N
}) => {
  var Yt, Nt;
  const h = It(null), A = It(null);
  !a && !A.current && (A.current = new De());
  const b = a || A.current, {
    transform: L,
    screenToWorld: H,
    onWheel: D,
    startPan: B,
    updatePan: P,
    endPan: R,
    resetTransform: M,
    zoomIn: _,
    zoomOut: T,
    zoomToFit: U,
    isPanning: X
  } = ve(h, p), { measurements: q, registerMeasureElement: At } = Ye(o), [J, at] = it({ nodes: {}, containers: {} }), rt = Tt(() => ({
    direction: i,
    mode: y ?? (i === "TB" || i === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: J.nodes
  }), [i, y, J.nodes]), [O, tt] = it(null), [F, st] = it(null), Gt = It(!1), {
    dragState: ct,
    hoveredContainerId: qt,
    handlePointerDown: vt,
    handlePointerMove: te,
    handlePointerUp: ee
  } = Ne(o, J, l, H, e);
  kt(() => {
    const f = (K) => {
      var dt, $, lt;
      if (K.target instanceof HTMLInputElement || K.target instanceof HTMLTextAreaElement || K.target instanceof HTMLElement && K.target.isContentEditable)
        return;
      const v = K.ctrlKey || K.metaKey, V = K.key.toLowerCase();
      if (K.key === "Delete" || K.key === "Backspace") {
        if (K.preventDefault(), t.length > 0) {
          if (z || N)
            for (const nt of t)
              o.nodes[nt] ? z == null || z(nt) : o.edges[nt] && (N == null || N(nt));
          g != null && g.deleteSelection && g.deleteSelection(t), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        }
        return;
      }
      if (r !== !1 && g) {
        if (v && V === "z") {
          K.preventDefault(), K.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (v && V === "y") {
          K.preventDefault(), g.redo();
          return;
        }
        if (v && V === "c" && t[0]) {
          K.preventDefault(), (dt = g.copyEntity) == null || dt.call(g, t[0]);
          return;
        }
        if (v && V === "x" && t[0]) {
          K.preventDefault(), ($ = g.cutEntity) == null || $.call(g, t[0]);
          return;
        }
        if (v && V === "v") {
          K.preventDefault(), (lt = g.pasteEntity) == null || lt.call(g);
          return;
        }
      }
      if (K.key === "Escape") {
        K.preventDefault(), st(null), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (K.code === "Space" && (Gt.current = !0), K.key.toLowerCase() === "f" && !v) {
        K.preventDefault(), U(J);
        return;
      }
      if (v && V === "a") {
        K.preventDefault();
        const nt = [
          ...Object.keys(o.nodes),
          ...Object.keys(o.containers)
        ];
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: nt } });
        return;
      }
      const j = Object.keys(o.nodes);
      if (j.length !== 0 && K.key === "Tab") {
        K.preventDefault();
        const nt = t.length > 0 ? j.indexOf(t[0]) : -1;
        let ut;
        K.shiftKey ? ut = nt <= 0 ? j.length - 1 : nt - 1 : ut = (nt + 1) % j.length, e({ type: "SELECTION_CHANGE", payload: { selectedIds: [j[ut]] } });
        return;
      }
    }, k = (K) => {
      K.code === "Space" && (Gt.current = !1);
    };
    return window.addEventListener("keydown", f), window.addEventListener("keyup", k), () => {
      window.removeEventListener("keydown", f), window.removeEventListener("keyup", k);
    };
  }, [o, J, t, U, e, g, r, z, N]);
  const ne = Q(
    (f, k) => {
      const K = ft(), v = ft(), V = i === "BT", j = V && k === "bottom" || !V && k === "top";
      S && W ? (S({
        id: K,
        type: f.type || "FlowTask",
        label: `New ${f.type || "Task"}`,
        parentId: f.parentId ?? null
      }), j ? W(K, f.id, v) : W(f.id, K, v)) : e({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: f,
          position: k,
          direction: i,
          suggestedNewNodeId: K,
          suggestedNewEdgeId: v
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [K] }
      });
    },
    [i, e, S, W]
  ), se = Q(
    (f) => {
      const k = ft(), K = ft(), v = ft(), V = o.nodes[f.sourceId], j = (V == null ? void 0 : V.type) || "FlowTask";
      S && W && N ? (N(f.id), S({
        id: k,
        type: j,
        label: `New ${j}`,
        parentId: (V == null ? void 0 : V.parentId) ?? null
      }), W(f.sourceId, k, K), W(k, f.targetId, v)) : e({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: f,
          direction: i,
          suggestedNewNodeId: k,
          suggestedNewEdge1Id: K,
          suggestedNewEdge2Id: v
        }
      }), e({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [k] }
      });
    },
    [i, o.nodes, e, S, W, N]
  );
  kt(() => {
    let f = !1, k = 16 / 9;
    if (h.current) {
      const v = h.current.getBoundingClientRect();
      v.width > 0 && v.height > 0 && (k = v.width / v.height);
    }
    const K = {
      direction: i,
      aspectRatio: k,
      ...m
    };
    return b.execute(o, q, K).then((v) => {
      f || at(v);
    }), () => {
      f = !0;
    };
  }, [o, q, b, i, m]);
  const oe = (f, k, K, v) => {
    const V = o.nodes[f] || o.containers[f], j = J.nodes[f] || J.containers[f];
    if (!V || !j) return;
    const $ = Dt(
      V,
      j,
      i,
      o.edges,
      rt
    ).get(k), lt = $ ? { x: $.worldX, y: $.worldY } : { x: j.x + j.width, y: j.y + j.height / 2 };
    tt({
      sourceId: f,
      sourcePortId: k,
      startWorldPos: lt,
      currentWorldPos: H(v.clientX, v.clientY)
    });
  }, ge = (f, k, K) => {
    var v, V, j, dt, $, lt, nt, ut, Wt, Mt;
    if (O && O.sourceId !== f) {
      const St = o.nodes[O.sourceId] || o.containers[O.sourceId], Lt = o.nodes[f] || o.containers[f], ot = (v = St == null ? void 0 : St.ports) == null ? void 0 : v.find((ht) => ht.id === O.sourcePortId), gt = (V = Lt == null ? void 0 : Lt.ports) == null ? void 0 : V.find((ht) => ht.id === k);
      let yt = O.sourceId, mt = O.sourcePortId, wt = f, pt = k;
      const Ae = ((j = ot == null ? void 0 : ot.label) == null ? void 0 : j.toLowerCase().includes("in")) || (ot == null ? void 0 : ot.side) === (i === "BT" ? "bottom" : "top"), ue = ((dt = ot == null ? void 0 : ot.label) == null ? void 0 : dt.toLowerCase().includes("out")) || (ot == null ? void 0 : ot.side) === (i === "BT" ? "top" : "bottom"), he = (($ = gt == null ? void 0 : gt.label) == null ? void 0 : $.toLowerCase().includes("in")) || (gt == null ? void 0 : gt.side) === (i === "BT" ? "bottom" : "top"), fe = ((lt = gt == null ? void 0 : gt.label) == null ? void 0 : lt.toLowerCase().includes("out")) || (gt == null ? void 0 : gt.side) === (i === "BT" ? "top" : "bottom");
      if (Ae && fe)
        yt = f, mt = k, wt = O.sourceId, pt = O.sourcePortId;
      else if (ue && he)
        yt = O.sourceId, mt = O.sourcePortId, wt = f, pt = k;
      else if (J.nodes[O.sourceId] && J.nodes[f]) {
        const ht = J.nodes[O.sourceId], Rt = J.nodes[f], ye = i === "BT" && ht.y < Rt.y, we = i === "TB" && ht.y > Rt.y;
        if (ye || we) {
          yt = f, wt = O.sourceId;
          const Kt = o.nodes[yt], Et = o.nodes[wt];
          mt = ((ut = (nt = Kt == null ? void 0 : Kt.ports) == null ? void 0 : nt.find((Bt) => Bt.label.includes("out") || Bt.side === (i === "BT" ? "top" : "bottom"))) == null ? void 0 : ut.id) || k, pt = ((Mt = (Wt = Et == null ? void 0 : Et.ports) == null ? void 0 : Wt.find((Bt) => Bt.label.includes("in") || Bt.side === (i === "BT" ? "bottom" : "top"))) == null ? void 0 : Mt.id) || O.sourcePortId;
        }
      }
      e({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: yt,
            sourcePortId: mt,
            targetId: wt,
            targetPortId: pt
          }
        }
      });
    }
    tt(null);
  }, ie = (f) => {
    if (f.button === 1 || Gt.current) {
      B(f.clientX, f.clientY);
      return;
    }
    const k = f.target, K = k === h.current || k.classList.contains("sysflow-viewport") || k.classList.contains("sysflow-dom-layer") || k.tagName.toLowerCase() === "svg";
    if (f.button === 0 && K) {
      f.currentTarget.setPointerCapture(f.pointerId);
      const v = H(f.clientX, f.clientY);
      st({
        startX: v.x,
        startY: v.y,
        currentX: v.x,
        currentY: v.y
      }), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, de = (f) => {
    if (X.current)
      P(f.clientX, f.clientY);
    else if (F) {
      const k = H(f.clientX, f.clientY);
      st((K) => K ? { ...K, currentX: k.x, currentY: k.y } : null);
    } else ct ? te(f) : O && tt(
      (k) => k ? { ...k, currentWorldPos: H(f.clientX, f.clientY) } : null
    );
  }, Ie = (f) => {
    if (f.currentTarget.hasPointerCapture(f.pointerId) && f.currentTarget.releasePointerCapture(f.pointerId), X.current && R(), F) {
      const k = Math.min(F.startX, F.currentX), K = Math.min(F.startY, F.currentY), v = Math.max(F.startX, F.currentX), V = Math.max(F.startY, F.currentY);
      if (v - k > 4 || V - K > 4) {
        const j = [];
        for (const [dt, $] of Object.entries(J.nodes))
          $.x < v && $.x + $.width > k && $.y < V && $.y + $.height > K && j.push(dt);
        for (const [dt, $] of Object.entries(J.containers))
          $.x < v && $.x + $.width > k && $.y < V && $.y + $.height > K && j.push(dt);
        e({ type: "SELECTION_CHANGE", payload: { selectedIds: j } });
      }
      st(null);
    }
    ct && ee(f), O && tt(null);
  }, re = w ?? (m == null ? void 0 : m.mode) === "flow", ft = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (f) => {
    const k = Math.random() * 16 | 0;
    return (f === "x" ? k : k & 3 | 8).toString(16);
  }), ce = Z ?? w ?? (m == null ? void 0 : m.mode) === "flow", ae = Object.values(o.containers), le = s === "light" ? "sysflow-theme-light" : "sysflow-theme-dark", Ce = Tt(() => ({
    outline: "none",
    ...ze(d),
    ...I
  }), [d, I]);
  return /* @__PURE__ */ et(
    "div",
    {
      ref: h,
      className: `sysflow-canvas ${le} ${n}`,
      "data-theme": s,
      style: Ce,
      onWheel: D,
      onPointerDown: ie,
      onPointerMove: de,
      onPointerUp: Ie,
      tabIndex: 0,
      children: [
        /* @__PURE__ */ Y(
          Re,
          {
            graph: o,
            registerMeasureElement: At,
            nodeTypes: G,
            containerTypes: E
          }
        ),
        /* @__PURE__ */ et("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ Y("button", { onClick: _, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ Y("button", { onClick: T, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ et("button", { onClick: M, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(L.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ et(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${L.x}px, ${L.y}px) scale(${L.zoom})`
            },
            children: [
              F && /* @__PURE__ */ Y(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(F.startX, F.currentX)}px`,
                    top: `${Math.min(F.startY, F.currentY)}px`,
                    width: `${Math.abs(F.currentX - F.startX)}px`,
                    height: `${Math.abs(F.currentY - F.startY)}px`,
                    backgroundColor: "color-mix(in srgb, var(--sysflow-node-selected, #aa9460) 15%, transparent)",
                    border: "1px dashed var(--sysflow-node-selected, #aa9460)",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              O && /* @__PURE__ */ Y("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ Y(
                "line",
                {
                  x1: O.startWorldPos.x,
                  y1: O.startWorldPos.y,
                  x2: O.currentWorldPos.x,
                  y2: O.currentWorldPos.y,
                  stroke: "var(--sysflow-edge-selected, #aa9460)",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ Y("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: ae.map((f) => {
                const k = J.containers[f.id];
                if (!k) return null;
                const K = Object.values(o.nodes).some((v) => v.parentId === f.id) || Object.values(o.containers).some((v) => v.parentId === f.id);
                return /* @__PURE__ */ Y(
                  Ve,
                  {
                    container: f,
                    layout: k,
                    selected: t.includes(f.id),
                    isHovered: qt === f.id,
                    hasChildren: K,
                    customRenderer: f.type ? E == null ? void 0 : E[f.type] : void 0,
                    onToggleCollapse: (v, V) => e({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: v, collapsed: V }
                    }),
                    onPointerDown: vt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (v) => {
                      v.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [f.id] } });
                    }
                  },
                  f.id
                );
              }) }),
              /* @__PURE__ */ Y(
                Te,
                {
                  graph: o,
                  layout: J,
                  selectedIds: t,
                  direction: i,
                  showArrows: x,
                  routing: u,
                  portOptions: rt,
                  enableEdgeQuickAdd: ce,
                  onInsertNodeOnEdge: se,
                  onEdgeClick: (f) => e({ type: "SELECTION_CHANGE", payload: { selectedIds: [f] } })
                }
              ),
              /* @__PURE__ */ Y("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(o.nodes).map((f) => {
                const k = J.nodes[f.id];
                return k ? /* @__PURE__ */ Y(
                  Oe,
                  {
                    node: f,
                    layout: k,
                    direction: i,
                    edges: o.edges,
                    portOptions: rt,
                    selected: t.includes(f.id),
                    customRenderer: f.type ? G == null ? void 0 : G[f.type] : void 0,
                    enableQuickAdd: re,
                    onAddConnectedNode: ne,
                    onPointerDown: vt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (K) => {
                      K.stopPropagation(), e({ type: "SELECTION_CHANGE", payload: { selectedIds: [f.id] } }), c == null || c(f.id, f);
                    },
                    onPortPointerDown: oe,
                    onPortPointerUp: ge
                  },
                  f.id
                ) : null;
              }) }),
              ct && /* @__PURE__ */ Y(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ct.ghostPosition.x}px, ${ct.ghostPosition.y}px)`,
                    width: `${((Yt = q.get(ct.draggedEntity.id)) == null ? void 0 : Yt.width) || 200}px`,
                    height: `${((Nt = q.get(ct.draggedEntity.id)) == null ? void 0 : Nt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ Y("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ct.draggedEntity.label })
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
  Je as EdgeRewireStrategy,
  Ve as GraphContainer,
  Te as GraphEdgeLayer,
  Oe as GraphNode,
  Xe as GraphPortLayer,
  Pe as ReparentStrategy,
  Ze as SugiyamaEngine,
  qe as SysFlowCanvas,
  De as WorkerBridge,
  Dt as computeEntityPortLocations,
  Xt as pruneDanglingEdges,
  Ut as resolveEffectiveEntityId,
  ze as themeTokensToStyle,
  ve as useCanvasTransform,
  Ne as useDragGesture,
  _e as useGraphHistory,
  Ye as useMeasurement
};
