var wt = Object.defineProperty;
var Bt = (o, t, g) => t in o ? wt(o, t, { enumerable: !0, configurable: !0, writable: !0, value: g }) : o[t] = g;
var Ge = (o, t, g) => Bt(o, typeof t != "symbol" ? t + "" : t, g);
import { useState as ie, useRef as Ie, useCallback as z, useEffect as Pe, useMemo as Ye } from "react";
import { jsxs as q, jsx as Y, Fragment as Me } from "react/jsx-runtime";
function bt(o, t, g, I) {
  const c = (u) => {
    const A = g.find(
      (G) => G.sourceId === t && G.sourcePortId === u || G.targetId === t && G.targetPortId === u
    );
    if (!A) return null;
    const r = A.sourceId === t ? A.targetId : A.sourceId, l = I[r];
    return l ? { x: l.x + l.width / 2, y: l.y + l.height / 2 } : null;
  };
  ["left", "right"].forEach((u) => {
    o[u].sort((A, r) => {
      var f, C;
      const l = ((f = c(A.id)) == null ? void 0 : f.y) ?? 0, G = ((C = c(r.id)) == null ? void 0 : C.y) ?? 0;
      return l - G;
    });
  }), ["top", "bottom"].forEach((u) => {
    o[u].sort((A, r) => {
      var f, C;
      const l = ((f = c(A.id)) == null ? void 0 : f.x) ?? 0, G = ((C = c(r.id)) == null ? void 0 : C.x) ?? 0;
      return l - G;
    });
  });
}
function mt(o, t, g, I, c, u) {
  if (!c || !u)
    return g ? "left" : "right";
  const A = I.find(
    (C) => g ? C.targetId === o && C.targetPortId === t : C.sourceId === o && C.sourcePortId === t
  );
  if (!A) return g ? "left" : "right";
  const r = g ? A.sourceId : A.targetId, l = c[r];
  if (!l) return g ? "left" : "right";
  const G = l.x + l.width / 2 - (u.x + u.width / 2), f = l.y + l.height / 2 - (u.y + u.height / 2);
  return Math.abs(G) > Math.abs(f) ? G > 0 ? "right" : "left" : f > 0 ? "bottom" : "top";
}
function Le(o, t, g = "LR", I, c) {
  const u = /* @__PURE__ */ new Map();
  if (!o || !t || !o.ports || o.ports.length === 0)
    return u;
  const A = (c == null ? void 0 : c.direction) || g, r = A === "TB" || A === "BT", l = (c == null ? void 0 : c.mode) || (r ? "strict-flow" : "perimeter-optimized"), G = I ? Array.isArray(I) ? I : Object.values(I) : [], f = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, C = new Set(
    G.filter((w) => w.targetId === o.id).map((w) => w.targetPortId)
  );
  new Set(
    G.filter((w) => w.sourceId === o.id).map((w) => w.sourcePortId)
  ), o.ports.forEach((w) => {
    let N = w.side || "auto";
    if (N !== "auto") {
      f[N].push(w);
      return;
    }
    if (l === "strict-flow") {
      const x = C.has(w.id) || w.label.toLowerCase().includes("in");
      switch (A) {
        case "BT":
          N = x ? "bottom" : "top";
          break;
        case "TB":
          N = x ? "top" : "bottom";
          break;
        case "RL":
          N = x ? "right" : "left";
          break;
        case "LR":
        default:
          N = x ? "left" : "right";
          break;
      }
    } else
      N = mt(
        o.id,
        w.id,
        C.has(w.id),
        G,
        c == null ? void 0 : c.nodeLayouts,
        t
      );
    f[N].push(w);
  }), l === "perimeter-optimized" && (c != null && c.nodeLayouts) && bt(f, o.id, G, c.nodeLayouts);
  const b = (w, N) => {
    const x = w.length;
    w.forEach((n, e) => {
      let s = 0, i = 0;
      N === "left" || N === "right" ? (i = t.height / (x + 1) * (e + 1), s = N === "left" ? 0 : t.width) : (s = t.width / (x + 1) * (e + 1), i = N === "top" ? 0 : t.height), u.set(n.id, {
        portId: n.id,
        side: N,
        localX: s,
        localY: i,
        worldX: t.x + s,
        worldY: t.y + i
      });
    });
  };
  return b(f.left, "left"), b(f.right, "right"), b(f.top, "top"), b(f.bottom, "bottom"), u;
}
function ze(o) {
  const t = {}, g = (I) => {
    var u;
    const c = o.nodes[I];
    return new Set(((u = c == null ? void 0 : c.ports) == null ? void 0 : u.map((A) => A.id)) || []);
  };
  for (const [I, c] of Object.entries(o.edges)) {
    const u = g(c.sourceId), A = g(c.targetId), r = u.has(c.sourcePortId), l = A.has(c.targetPortId);
    r && l && (t[I] = c);
  }
  return {
    ...o,
    edges: t
  };
}
class pt {
  static assignDynamicPortSides(t, g, I) {
    var u, A;
    const c = (r) => g[r] || I[r];
    for (const r of Object.values(t.edges)) {
      const l = c(r.sourceId), G = c(r.targetId);
      if (!l || !G) continue;
      const f = t.nodes[r.sourceId] || t.containers[r.sourceId], C = t.nodes[r.targetId] || t.containers[r.targetId], b = G.x + G.width / 2 - (l.x + l.width / 2), w = G.y + G.height / 2 - (l.y + l.height / 2), N = Math.abs(b) > Math.abs(w) * 1.25, x = (u = f == null ? void 0 : f.ports) == null ? void 0 : u.find((e) => e.id === r.sourcePortId);
      x && (!x.side || x.side === "auto") && (N ? x.side = b >= 0 ? "right" : "left" : x.side = w >= 0 ? "bottom" : "top");
      const n = (A = C == null ? void 0 : C.ports) == null ? void 0 : A.find((e) => e.id === r.targetPortId);
      n && (!n.side || n.side === "auto") && (N ? n.side = b >= 0 ? "left" : "right" : n.side = w >= 0 ? "top" : "bottom");
    }
  }
}
const je = 22, Fe = 18, $e = 38, We = 210, Ue = 36, xt = 180, St = 54, Je = 260, _e = 160;
class Re {
  static execute(t, g, I) {
    var n;
    const c = {}, u = {}, A = (e) => {
      var d, B, v, K, y;
      const s = !!t.containers[e], i = !!((d = t.containers[e]) != null && d.collapsed);
      return s && i ? { width: We, height: Ue } : s && !i ? {
        width: ((B = I.get(e)) == null ? void 0 : B.width) || Je,
        height: ((v = I.get(e)) == null ? void 0 : v.height) || _e
      } : {
        width: ((K = I.get(e)) == null ? void 0 : K.width) || xt,
        height: ((y = I.get(e)) == null ? void 0 : y.height) || St
      };
    }, r = /* @__PURE__ */ new Map();
    for (const [e, s] of Object.entries(t.nodes)) {
      const i = s.parentId ?? null;
      r.has(i) || r.set(i, []), r.get(i).push(e);
    }
    for (const [e, s] of Object.entries(t.containers)) {
      const i = s.parentId ?? null;
      r.has(i) || r.set(i, []), r.get(i).push(e);
    }
    const l = Re.getContainerDepths(t), G = Object.keys(t.containers).sort(
      (e, s) => (l.get(s) || 0) - (l.get(e) || 0)
    ), f = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), b = (e) => f.has(e) ? f.get(e) : A(e);
    for (const e of G) {
      if (!!((n = t.containers[e]) != null && n.collapsed)) {
        f.set(e, {
          width: We,
          height: Ue
        });
        continue;
      }
      const i = r.get(e) || [];
      if (i.length === 0) {
        f.set(e, {
          width: Je,
          height: _e
        });
        continue;
      }
      const d = g.arrange(e, i, t, b);
      for (const K of d.boxes)
        C.set(K.id, K);
      const B = Math.max(d.width + je * 2, We), v = d.height + $e + Fe * 2;
      f.set(e, { width: B, height: v });
    }
    const w = r.get(null) || [];
    let N = [];
    w.length > 0 && (N = g.arrange(null, w, t, b).boxes.map((s) => ({
      ...s,
      localX: s.localX + 60,
      localY: s.localY + 60
    })));
    const x = (e, s, i, d, B) => {
      var y;
      const v = !!t.containers[e], K = { id: e, x: s, y: i, width: d, height: B };
      if (v) {
        if (u[e] = K, (y = t.containers[e]) != null && y.collapsed) return;
        const Z = s + je, L = i + $e + Fe, D = r.get(e) || [];
        for (const h of D) {
          const S = C.get(h);
          S && x(
            h,
            Z + S.localX,
            L + S.localY,
            S.width,
            S.height
          );
        }
      } else
        c[e] = K;
    };
    for (const e of N)
      x(e.id, e.localX, e.localY, e.width, e.height);
    return pt.assignDynamicPortSides(t, c, u), { nodes: c, containers: u };
  }
  static getContainerDepths(t) {
    const g = /* @__PURE__ */ new Map(), I = (c) => {
      var r;
      if (g.has(c)) return g.get(c);
      const u = (r = t.containers[c]) == null ? void 0 : r.parentId;
      if (!u || !t.containers[u])
        return g.set(c, 0), 0;
      const A = 1 + I(u);
      return g.set(c, A), A;
    };
    for (const c of Object.keys(t.containers))
      I(c);
    return g;
  }
}
const Gt = 70, De = 28;
class Lt {
  constructor(t = {}) {
    this.options = t;
  }
  arrange(t, g, I, c) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const u = this.options.direction ?? "TB", A = u === "TB" || u === "BT", r = u === "BT" || u === "RL", l = new Set(g), G = [], f = /* @__PURE__ */ new Set();
    for (const h of Object.values(I.edges)) {
      const S = this.resolveToDirectChild(h.sourceId, l, I), H = this.resolveToDirectChild(h.targetId, l, I);
      if (S && H && S !== H) {
        const X = `${S}->${H}`;
        f.has(X) || (f.add(X), G.push({ sourceId: S, targetId: H }));
      }
    }
    const C = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map();
    for (const h of g)
      C.set(h, 0), b.set(h, []), w.set(h, []);
    for (const h of G)
      b.get(h.sourceId).push(h.targetId), w.get(h.targetId).push(h.sourceId), C.set(h.targetId, (C.get(h.targetId) || 0) + 1);
    const N = /* @__PURE__ */ new Map(), x = g.filter((h) => (C.get(h) || 0) === 0);
    for (const h of x) N.set(h, 0);
    const n = /* @__PURE__ */ new Set();
    for (; x.length > 0; ) {
      const h = x.shift();
      n.add(h);
      const S = N.get(h);
      for (const H of b.get(h)) {
        const X = Math.max(N.get(H) || 0, S + 1);
        N.set(H, X), C.set(H, C.get(H) - 1), C.get(H) === 0 && x.push(H);
      }
    }
    for (const h of g)
      n.has(h) || N.set(h, 0);
    const e = /* @__PURE__ */ new Map();
    for (const [h, S] of N.entries())
      e.has(S) || e.set(S, []), e.get(S).push(h);
    const s = Array.from(e.keys()).sort((h, S) => h - S), i = r ? [...s].reverse() : s, d = /* @__PURE__ */ new Map(), B = (h) => {
      const S = c(h);
      return A ? S.width : S.height;
    };
    for (const h of s) {
      const S = e.get(h) || [];
      let H = -1 / 0;
      for (const X of S) {
        const V = B(X), m = w.get(X) || [];
        let M = null;
        if (m.length > 0) {
          const W = m.map((O) => {
            const j = d.get(O);
            return j === void 0 ? null : j + B(O) / 2;
          }).filter((O) => O !== null);
          W.length > 0 && (M = W.reduce((O, j) => O + j, 0) / W.length);
        }
        let P = M !== null ? M - V / 2 : 0;
        P < H + De && (P = H === -1 / 0 ? 0 : H + De), d.set(X, P), H = P + V;
      }
    }
    for (let h = s.length - 1; h >= 0; h--) {
      const S = s[h], H = e.get(S) || [];
      for (const V of H) {
        const m = b.get(V) || [];
        if (m.length === 0) continue;
        const M = m.map((P) => {
          const W = d.get(P);
          return W === void 0 ? null : W + B(P) / 2;
        }).filter((P) => P !== null);
        if (M.length > 0) {
          const P = M.reduce((O, j) => O + j, 0) / M.length, W = B(V);
          d.set(V, P - W / 2);
        }
      }
      let X = -1 / 0;
      for (const V of H) {
        const m = B(V);
        let M = d.get(V) ?? 0;
        M < X + De && (M = X === -1 / 0 ? 0 : X + De, d.set(V, M)), X = M + m;
      }
    }
    let v = 1 / 0;
    for (const h of d.values())
      v = Math.min(v, h);
    const K = v < 0 ? -v : 0, y = [];
    let Z = 0;
    for (const h of i) {
      const S = e.get(h);
      let H = 0;
      for (const X of S) {
        const V = c(X), m = A ? V.height : V.width, M = (d.get(X) ?? 0) + K, P = A ? M : Z, W = A ? Z : M;
        y.push({ id: X, localX: P, localY: W, width: V.width, height: V.height }), H = Math.max(H, m);
      }
      Z += H + Gt;
    }
    const L = Math.max(...y.map((h) => h.localX + h.width), 0), D = Math.max(...y.map((h) => h.localY + h.height), 0);
    return { width: L, height: D, boxes: y };
  }
  resolveToDirectChild(t, g, I) {
    var u, A;
    let c = t;
    for (; c; ) {
      if (g.has(c)) return c;
      c = ((u = I.nodes[c]) == null ? void 0 : u.parentId) ?? ((A = I.containers[c]) == null ? void 0 : A.parentId) ?? null;
    }
    return null;
  }
}
const ye = 32, qe = 24;
class Et {
  constructor(t = 1.55) {
    this.targetAspect = t;
  }
  arrange(t, g, I, c) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const u = g.map((r) => {
      const l = c(r);
      return { id: r, width: l.width, height: l.height };
    }), A = this.findBestTightPacking(u, this.targetAspect);
    return { width: A.width, height: A.height, boxes: A.boxes };
  }
  findBestTightPacking(t, g) {
    if (t.length === 1)
      return {
        width: t[0].width,
        height: t[0].height,
        boxes: [{ id: t[0].id, localX: 0, localY: 0, width: t[0].width, height: t[0].height }],
        score: 0
      };
    const I = t.reduce((C, b) => C + b.width * b.height, 0), c = Math.max(...t.map((C) => C.width)), u = [...t].sort((C, b) => b.width - C.width), A = /* @__PURE__ */ new Set(), r = t.reduce((C, b) => C + b.width, 0) + (t.length - 1) * ye;
    A.add(r), A.add(c);
    const l = Math.max(c, Math.sqrt(I * g));
    A.add(l), A.add(l * 0.85), A.add(l * 1.15);
    const G = Math.min(t.length, 6);
    for (let C = 2; C <= G; C++) {
      let b = 0;
      for (let w = 0; w < C && w < u.length; w++)
        b += u[w].width;
      b += (C - 1) * ye, b >= c && A.add(b);
    }
    let f = null;
    for (const C of A) {
      const b = this.simulateSkylinePacking(t, C), w = b.width * b.height, N = Math.max(0, w - I), x = b.width / Math.max(1, b.height), n = Math.abs(Math.log(x / g)), e = N / I * 2 + n * 0.25;
      b.score = e, (!f || e < f.score) && (f = b);
    }
    return f;
  }
  simulateSkylinePacking(t, g) {
    const I = [...t].sort((l, G) => G.height - l.height), c = [{ x: 0, width: g, y: 0 }], u = [];
    for (const l of I) {
      let G = 1 / 0, f = -1;
      for (let e = 0; e < c.length; e++) {
        if (c[e].x + l.width > g) continue;
        let i = 0, d = 0;
        for (let B = e; B < c.length && d < l.width; B++)
          i = Math.max(i, c[B].y), d += c[B].width;
        i < G && (G = i, f = e);
      }
      if (f === -1) {
        const e = Math.max(...c.map((i) => i.y)), s = e === 0 ? 0 : e + qe;
        u.push({ id: l.id, localX: 0, localY: s, width: l.width, height: l.height }), c.length = 0, c.push({ x: 0, width: l.width + ye, y: s + l.height }), g > l.width + ye && c.push({
          x: l.width + ye,
          width: g - (l.width + ye),
          y: 0
        });
        continue;
      }
      const C = c[f].x, b = G === 0 ? 0 : G + qe;
      u.push({ id: l.id, localX: C, localY: b, width: l.width, height: l.height });
      const w = l.width + ye, N = b + l.height, x = { x: C, width: w, y: N }, n = [];
      for (const e of c)
        e.x + e.width <= C || e.x >= C + w ? n.push(e) : (e.x < C && n.push({ x: e.x, width: C - e.x, y: e.y }), e.x + e.width > C + w && n.push({
          x: C + w,
          width: e.x + e.width - (C + w),
          y: e.y
        }));
      n.push(x), n.sort((e, s) => e.x - s.x), c.length = 0, c.push(...n);
    }
    const A = Math.max(...u.map((l) => l.localX + l.width), 0), r = Math.max(...u.map((l) => l.localY + l.height), 0);
    return { width: A, height: r, boxes: u, score: 0 };
  }
}
function et(o, t, g) {
  var u, A;
  let I = o, c = null;
  for (; I; )
    g.has(I) && (c = I), I = ((u = t.nodes[I]) == null ? void 0 : u.parentId) ?? ((A = t.containers[I]) == null ? void 0 : A.parentId) ?? void 0;
  return c ?? o;
}
class Kt {
  async execute(t, g, I) {
    const c = Object.values(t.containers), u = new Set(
      c.filter((C) => !!C.collapsed).map((C) => C.id)
    ), A = {};
    for (const [C, b] of Object.entries(t.edges)) {
      const w = et(b.sourceId, t, u), N = et(b.targetId, t, u);
      w !== N && (A[C] = {
        ...b,
        sourceId: w,
        targetId: N
      });
    }
    const r = {
      ...t,
      edges: A
    }, l = Object.keys(t.containers).length, f = (I != null && I.mode && I.mode !== "auto" ? I.mode : l > 0 ? "concurrent" : "flow") === "concurrent" ? new Et((I == null ? void 0 : I.aspectRatio) ?? 1.55) : new Lt(I);
    return Re.execute(r, f, g);
  }
}
const nt = "Y2xhc3MgSiB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBjb25zdCBuID0gKGwpID0+IGRbbF0gfHwgaVtsXTsKICAgIGZvciAoY29uc3QgbCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGMgPSBuKGwuc291cmNlSWQpLCBJID0gbihsLnRhcmdldElkKTsKICAgICAgaWYgKCFjIHx8ICFJKSBjb250aW51ZTsKICAgICAgY29uc3QgcCA9IGUubm9kZXNbbC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2wuc291cmNlSWRdLCBzID0gZS5ub2Rlc1tsLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbbC50YXJnZXRJZF0sIGggPSBJLnggKyBJLndpZHRoIC8gMiAtIChjLnggKyBjLndpZHRoIC8gMiksIHUgPSBJLnkgKyBJLmhlaWdodCAvIDIgLSAoYy55ICsgYy5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGgpID4gTWF0aC5hYnModSkgKiAxLjI1LCBDID0gKHIgPSBwID09IG51bGwgPyB2b2lkIDAgOiBwLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBsLnNvdXJjZVBvcnRJZCk7CiAgICAgIEMgJiYgKCFDLnNpZGUgfHwgQy5zaWRlID09PSAiYXV0byIpICYmIChNID8gQy5zaWRlID0gaCA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IEMuc2lkZSA9IHUgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCBtID0gKGEgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogYS5maW5kKCh0KSA9PiB0LmlkID09PSBsLnRhcmdldFBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaCA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IG0uc2lkZSA9IHUgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBMID0gMjIsIEYgPSAxOCwgVSA9IDM4LCBHID0gMjEwLCBxID0gMzYsIFEgPSAxODAsIFogPSA1NCwgSyA9IDI2MCwgJCA9IDE2MDsKY2xhc3MgaiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgZCwgaSkgewogICAgdmFyIG07CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgYSA9ICh0KSA9PiB7CiAgICAgIHZhciB5LCBQLCBULCBiLCBPOwogICAgICBjb25zdCBnID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoeSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiB5LmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiBnICYmIHcgPyB7IHdpZHRoOiBHLCBoZWlnaHQ6IHEgfSA6IGcgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoUCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogUC53aWR0aCkgfHwgSywKICAgICAgICBoZWlnaHQ6ICgoVCA9IGkuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogVC5oZWlnaHQpIHx8ICQKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChiID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBiLndpZHRoKSB8fCBRLAogICAgICAgIGhlaWdodDogKChPID0gaS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBPLmhlaWdodCkgfHwgWgogICAgICB9OwogICAgfSwgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gZy5wYXJlbnRJZCA/PyBudWxsOwogICAgICBsLmhhcyh3KSB8fCBsLnNldCh3LCBbXSksIGwuZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCBnXSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSBnLnBhcmVudElkID8/IG51bGw7CiAgICAgIGwuaGFzKHcpIHx8IGwuc2V0KHcsIFtdKSwgbC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IGMgPSBqLmdldENvbnRhaW5lckRlcHRocyhlKSwgSSA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIGcpID0+IChjLmdldChnKSB8fCAwKSAtIChjLmdldCh0KSB8fCAwKQogICAgKSwgcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gKHQpID0+IHAuaGFzKHQpID8gcC5nZXQodCkgOiBhKHQpOwogICAgZm9yIChjb25zdCB0IG9mIEkpIHsKICAgICAgaWYgKCEhKChtID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIG0uY29sbGFwc2VkKSkgewogICAgICAgIHAuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBHLAogICAgICAgICAgaGVpZ2h0OiBxCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGwuZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBwLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSywKICAgICAgICAgIGhlaWdodDogJAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHkgPSBkLmFycmFuZ2UodCwgdywgZSwgaCk7CiAgICAgIGZvciAoY29uc3QgYiBvZiB5LmJveGVzKQogICAgICAgIHMuc2V0KGIuaWQsIGIpOwogICAgICBjb25zdCBQID0gTWF0aC5tYXgoeS53aWR0aCArIEwgKiAyLCBHKSwgVCA9IHkuaGVpZ2h0ICsgVSArIEYgKiAyOwogICAgICBwLnNldCh0LCB7IHdpZHRoOiBQLCBoZWlnaHQ6IFQgfSk7CiAgICB9CiAgICBjb25zdCB1ID0gbC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgdS5sZW5ndGggPiAwICYmIChNID0gZC5hcnJhbmdlKG51bGwsIHUsIGUsIGgpLmJveGVzLm1hcCgoZykgPT4gKHsKICAgICAgLi4uZywKICAgICAgbG9jYWxYOiBnLmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IGcubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBDID0gKHQsIGcsIHcsIHksIFApID0+IHsKICAgICAgdmFyIE87CiAgICAgIGNvbnN0IFQgPSAhIWUuY29udGFpbmVyc1t0XSwgYiA9IHsgaWQ6IHQsIHg6IGcsIHk6IHcsIHdpZHRoOiB5LCBoZWlnaHQ6IFAgfTsKICAgICAgaWYgKFQpIHsKICAgICAgICBpZiAoclt0XSA9IGIsIChPID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIE8uY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgSCA9IGcgKyBMLCBXID0gdyArIFUgKyBGLCBYID0gbC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBvIG9mIFgpIHsKICAgICAgICAgIGNvbnN0IGYgPSBzLmdldChvKTsKICAgICAgICAgIGYgJiYgQygKICAgICAgICAgICAgbywKICAgICAgICAgICAgSCArIGYubG9jYWxYLAogICAgICAgICAgICBXICsgZi5sb2NhbFksCiAgICAgICAgICAgIGYud2lkdGgsCiAgICAgICAgICAgIGYuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IGI7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIEModC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gSi5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGkgPSAobikgPT4gewogICAgICB2YXIgbDsKICAgICAgaWYgKGQuaGFzKG4pKSByZXR1cm4gZC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAobCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGwucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBkLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgYSA9IDEgKyBpKHIpOwogICAgICByZXR1cm4gZC5zZXQobiwgYSksIGE7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGkobik7CiAgICByZXR1cm4gZDsKICB9Cn0KY29uc3QgdHQgPSA3MCwgUiA9IDI4OwpjbGFzcyBldCB7CiAgY29uc3RydWN0b3IoZSA9IHt9KSB7CiAgICB0aGlzLm9wdGlvbnMgPSBlOwogIH0KICBhcnJhbmdlKGUsIGQsIGksIG4pIHsKICAgIGlmIChkLmxlbmd0aCA9PT0gMCkKICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgYm94ZXM6IFtdIH07CiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA/PyAiVEIiLCBhID0gciA9PT0gIlRCIiB8fCByID09PSAiQlQiLCBsID0gciA9PT0gIkJUIiB8fCByID09PSAiUkwiLCBjID0gbmV3IFNldChkKSwgSSA9IFtdLCBwID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoY29uc3QgbyBvZiBPYmplY3QudmFsdWVzKGkuZWRnZXMpKSB7CiAgICAgIGNvbnN0IGYgPSB0aGlzLnJlc29sdmVUb0RpcmVjdENoaWxkKG8uc291cmNlSWQsIGMsIGkpLCB4ID0gdGhpcy5yZXNvbHZlVG9EaXJlY3RDaGlsZChvLnRhcmdldElkLCBjLCBpKTsKICAgICAgaWYgKGYgJiYgeCAmJiBmICE9PSB4KSB7CiAgICAgICAgY29uc3QgdiA9IGAke2Z9LT4ke3h9YDsKICAgICAgICBwLmhhcyh2KSB8fCAocC5hZGQodiksIEkucHVzaCh7IHNvdXJjZUlkOiBmLCB0YXJnZXRJZDogeCB9KSk7CiAgICAgIH0KICAgIH0KICAgIGNvbnN0IHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBoID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgdSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IG8gb2YgZCkKICAgICAgcy5zZXQobywgMCksIGguc2V0KG8sIFtdKSwgdS5zZXQobywgW10pOwogICAgZm9yIChjb25zdCBvIG9mIEkpCiAgICAgIGguZ2V0KG8uc291cmNlSWQpLnB1c2goby50YXJnZXRJZCksIHUuZ2V0KG8udGFyZ2V0SWQpLnB1c2goby5zb3VyY2VJZCksIHMuc2V0KG8udGFyZ2V0SWQsIChzLmdldChvLnRhcmdldElkKSB8fCAwKSArIDEpOwogICAgY29uc3QgTSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSBkLmZpbHRlcigobykgPT4gKHMuZ2V0KG8pIHx8IDApID09PSAwKTsKICAgIGZvciAoY29uc3QgbyBvZiBDKSBNLnNldChvLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgZm9yICg7IEMubGVuZ3RoID4gMDsgKSB7CiAgICAgIGNvbnN0IG8gPSBDLnNoaWZ0KCk7CiAgICAgIG0uYWRkKG8pOwogICAgICBjb25zdCBmID0gTS5nZXQobyk7CiAgICAgIGZvciAoY29uc3QgeCBvZiBoLmdldChvKSkgewogICAgICAgIGNvbnN0IHYgPSBNYXRoLm1heChNLmdldCh4KSB8fCAwLCBmICsgMSk7CiAgICAgICAgTS5zZXQoeCwgdiksIHMuc2V0KHgsIHMuZ2V0KHgpIC0gMSksIHMuZ2V0KHgpID09PSAwICYmIEMucHVzaCh4KTsKICAgICAgfQogICAgfQogICAgZm9yIChjb25zdCBvIG9mIGQpCiAgICAgIG0uaGFzKG8pIHx8IE0uc2V0KG8sIDApOwogICAgY29uc3QgdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFtvLCBmXSBvZiBNLmVudHJpZXMoKSkKICAgICAgdC5oYXMoZikgfHwgdC5zZXQoZiwgW10pLCB0LmdldChmKS5wdXNoKG8pOwogICAgY29uc3QgZyA9IEFycmF5LmZyb20odC5rZXlzKCkpLnNvcnQoKG8sIGYpID0+IG8gLSBmKSwgdyA9IGwgPyBbLi4uZ10ucmV2ZXJzZSgpIDogZywgeSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIFAgPSAobykgPT4gewogICAgICBjb25zdCBmID0gbihvKTsKICAgICAgcmV0dXJuIGEgPyBmLndpZHRoIDogZi5oZWlnaHQ7CiAgICB9OwogICAgZm9yIChjb25zdCBvIG9mIGcpIHsKICAgICAgY29uc3QgZiA9IHQuZ2V0KG8pIHx8IFtdOwogICAgICBsZXQgeCA9IC0xIC8gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gUCh2KSwgUyA9IHUuZ2V0KHYpIHx8IFtdOwogICAgICAgIGxldCBEID0gbnVsbDsKICAgICAgICBpZiAoUy5sZW5ndGggPiAwKSB7CiAgICAgICAgICBjb25zdCBfID0gUy5tYXAoKFkpID0+IHsKICAgICAgICAgICAgY29uc3QgTiA9IHkuZ2V0KFkpOwogICAgICAgICAgICByZXR1cm4gTiA9PT0gdm9pZCAwID8gbnVsbCA6IE4gKyBQKFkpIC8gMjsKICAgICAgICAgIH0pLmZpbHRlcigoWSkgPT4gWSAhPT0gbnVsbCk7CiAgICAgICAgICBfLmxlbmd0aCA+IDAgJiYgKEQgPSBfLnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gXy5sZW5ndGgpOwogICAgICAgIH0KICAgICAgICBsZXQgRSA9IEQgIT09IG51bGwgPyBEIC0gQSAvIDIgOiAwOwogICAgICAgIEUgPCB4ICsgUiAmJiAoRSA9IHggPT09IC0xIC8gMCA/IDAgOiB4ICsgUiksIHkuc2V0KHYsIEUpLCB4ID0gRSArIEE7CiAgICAgIH0KICAgIH0KICAgIGZvciAobGV0IG8gPSBnLmxlbmd0aCAtIDE7IG8gPj0gMDsgby0tKSB7CiAgICAgIGNvbnN0IGYgPSBnW29dLCB4ID0gdC5nZXQoZikgfHwgW107CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IGguZ2V0KEEpIHx8IFtdOwogICAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgY29udGludWU7CiAgICAgICAgY29uc3QgRCA9IFMubWFwKChFKSA9PiB7CiAgICAgICAgICBjb25zdCBfID0geS5nZXQoRSk7CiAgICAgICAgICByZXR1cm4gXyA9PT0gdm9pZCAwID8gbnVsbCA6IF8gKyBQKEUpIC8gMjsKICAgICAgICB9KS5maWx0ZXIoKEUpID0+IEUgIT09IG51bGwpOwogICAgICAgIGlmIChELmxlbmd0aCA+IDApIHsKICAgICAgICAgIGNvbnN0IEUgPSBELnJlZHVjZSgoWSwgTikgPT4gWSArIE4sIDApIC8gRC5sZW5ndGgsIF8gPSBQKEEpOwogICAgICAgICAgeS5zZXQoQSwgRSAtIF8gLyAyKTsKICAgICAgICB9CiAgICAgIH0KICAgICAgbGV0IHYgPSAtMSAvIDA7CiAgICAgIGZvciAoY29uc3QgQSBvZiB4KSB7CiAgICAgICAgY29uc3QgUyA9IFAoQSk7CiAgICAgICAgbGV0IEQgPSB5LmdldChBKSA/PyAwOwogICAgICAgIEQgPCB2ICsgUiAmJiAoRCA9IHYgPT09IC0xIC8gMCA/IDAgOiB2ICsgUiwgeS5zZXQoQSwgRCkpLCB2ID0gRCArIFM7CiAgICAgIH0KICAgIH0KICAgIGxldCBUID0gMSAvIDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgeS52YWx1ZXMoKSkKICAgICAgVCA9IE1hdGgubWluKFQsIG8pOwogICAgY29uc3QgYiA9IFQgPCAwID8gLVQgOiAwLCBPID0gW107CiAgICBsZXQgSCA9IDA7CiAgICBmb3IgKGNvbnN0IG8gb2YgdykgewogICAgICBjb25zdCBmID0gdC5nZXQobyk7CiAgICAgIGxldCB4ID0gMDsKICAgICAgZm9yIChjb25zdCB2IG9mIGYpIHsKICAgICAgICBjb25zdCBBID0gbih2KSwgUyA9IGEgPyBBLmhlaWdodCA6IEEud2lkdGgsIEQgPSAoeS5nZXQodikgPz8gMCkgKyBiLCBFID0gYSA/IEQgOiBILCBfID0gYSA/IEggOiBEOwogICAgICAgIE8ucHVzaCh7IGlkOiB2LCBsb2NhbFg6IEUsIGxvY2FsWTogXywgd2lkdGg6IEEud2lkdGgsIGhlaWdodDogQS5oZWlnaHQgfSksIHggPSBNYXRoLm1heCh4LCBTKTsKICAgICAgfQogICAgICBIICs9IHggKyB0dDsKICAgIH0KICAgIGNvbnN0IFcgPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFggKyBvLndpZHRoKSwgMCksIFggPSBNYXRoLm1heCguLi5PLm1hcCgobykgPT4gby5sb2NhbFkgKyBvLmhlaWdodCksIDApOwogICAgcmV0dXJuIHsgd2lkdGg6IFcsIGhlaWdodDogWCwgYm94ZXM6IE8gfTsKICB9CiAgcmVzb2x2ZVRvRGlyZWN0Q2hpbGQoZSwgZCwgaSkgewogICAgdmFyIHIsIGE7CiAgICBsZXQgbiA9IGU7CiAgICBmb3IgKDsgbjsgKSB7CiAgICAgIGlmIChkLmhhcyhuKSkgcmV0dXJuIG47CiAgICAgIG4gPSAoKHIgPSBpLm5vZGVzW25dKSA9PSBudWxsID8gdm9pZCAwIDogci5wYXJlbnRJZCkgPz8gKChhID0gaS5jb250YWluZXJzW25dKSA9PSBudWxsID8gdm9pZCAwIDogYS5wYXJlbnRJZCkgPz8gbnVsbDsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KfQpjb25zdCBCID0gMzIsIHogPSAyNDsKY2xhc3MgbnQgewogIGNvbnN0cnVjdG9yKGUgPSAxLjU1KSB7CiAgICB0aGlzLnRhcmdldEFzcGVjdCA9IGU7CiAgfQogIGFycmFuZ2UoZSwgZCwgaSwgbikgewogICAgaWYgKGQubGVuZ3RoID09PSAwKQogICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCBib3hlczogW10gfTsKICAgIGNvbnN0IHIgPSBkLm1hcCgobCkgPT4gewogICAgICBjb25zdCBjID0gbihsKTsKICAgICAgcmV0dXJuIHsgaWQ6IGwsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH07CiAgICB9KSwgYSA9IHRoaXMuZmluZEJlc3RUaWdodFBhY2tpbmcociwgdGhpcy50YXJnZXRBc3BlY3QpOwogICAgcmV0dXJuIHsgd2lkdGg6IGEud2lkdGgsIGhlaWdodDogYS5oZWlnaHQsIGJveGVzOiBhLmJveGVzIH07CiAgfQogIGZpbmRCZXN0VGlnaHRQYWNraW5nKGUsIGQpIHsKICAgIGlmIChlLmxlbmd0aCA9PT0gMSkKICAgICAgcmV0dXJuIHsKICAgICAgICB3aWR0aDogZVswXS53aWR0aCwKICAgICAgICBoZWlnaHQ6IGVbMF0uaGVpZ2h0LAogICAgICAgIGJveGVzOiBbeyBpZDogZVswXS5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IDAsIHdpZHRoOiBlWzBdLndpZHRoLCBoZWlnaHQ6IGVbMF0uaGVpZ2h0IH1dLAogICAgICAgIHNjb3JlOiAwCiAgICAgIH07CiAgICBjb25zdCBpID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoICogaC5oZWlnaHQsIDApLCBuID0gTWF0aC5tYXgoLi4uZS5tYXAoKHMpID0+IHMud2lkdGgpKSwgciA9IFsuLi5lXS5zb3J0KChzLCBoKSA9PiBoLndpZHRoIC0gcy53aWR0aCksIGEgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpLCBsID0gZS5yZWR1Y2UoKHMsIGgpID0+IHMgKyBoLndpZHRoLCAwKSArIChlLmxlbmd0aCAtIDEpICogQjsKICAgIGEuYWRkKGwpLCBhLmFkZChuKTsKICAgIGNvbnN0IGMgPSBNYXRoLm1heChuLCBNYXRoLnNxcnQoaSAqIGQpKTsKICAgIGEuYWRkKGMpLCBhLmFkZChjICogMC44NSksIGEuYWRkKGMgKiAxLjE1KTsKICAgIGNvbnN0IEkgPSBNYXRoLm1pbihlLmxlbmd0aCwgNik7CiAgICBmb3IgKGxldCBzID0gMjsgcyA8PSBJOyBzKyspIHsKICAgICAgbGV0IGggPSAwOwogICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHMgJiYgdSA8IHIubGVuZ3RoOyB1KyspCiAgICAgICAgaCArPSByW3VdLndpZHRoOwogICAgICBoICs9IChzIC0gMSkgKiBCLCBoID49IG4gJiYgYS5hZGQoaCk7CiAgICB9CiAgICBsZXQgcCA9IG51bGw7CiAgICBmb3IgKGNvbnN0IHMgb2YgYSkgewogICAgICBjb25zdCBoID0gdGhpcy5zaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIHMpLCB1ID0gaC53aWR0aCAqIGguaGVpZ2h0LCBNID0gTWF0aC5tYXgoMCwgdSAtIGkpLCBDID0gaC53aWR0aCAvIE1hdGgubWF4KDEsIGguaGVpZ2h0KSwgbSA9IE1hdGguYWJzKE1hdGgubG9nKEMgLyBkKSksIHQgPSBNIC8gaSAqIDIgKyBtICogMC4yNTsKICAgICAgaC5zY29yZSA9IHQsICghcCB8fCB0IDwgcC5zY29yZSkgJiYgKHAgPSBoKTsKICAgIH0KICAgIHJldHVybiBwOwogIH0KICBzaW11bGF0ZVNreWxpbmVQYWNraW5nKGUsIGQpIHsKICAgIGNvbnN0IGkgPSBbLi4uZV0uc29ydCgoYywgSSkgPT4gSS5oZWlnaHQgLSBjLmhlaWdodCksIG4gPSBbeyB4OiAwLCB3aWR0aDogZCwgeTogMCB9XSwgciA9IFtdOwogICAgZm9yIChjb25zdCBjIG9mIGkpIHsKICAgICAgbGV0IEkgPSAxIC8gMCwgcCA9IC0xOwogICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IG4ubGVuZ3RoOyB0KyspIHsKICAgICAgICBpZiAoblt0XS54ICsgYy53aWR0aCA+IGQpIGNvbnRpbnVlOwogICAgICAgIGxldCB3ID0gMCwgeSA9IDA7CiAgICAgICAgZm9yIChsZXQgUCA9IHQ7IFAgPCBuLmxlbmd0aCAmJiB5IDwgYy53aWR0aDsgUCsrKQogICAgICAgICAgdyA9IE1hdGgubWF4KHcsIG5bUF0ueSksIHkgKz0gbltQXS53aWR0aDsKICAgICAgICB3IDwgSSAmJiAoSSA9IHcsIHAgPSB0KTsKICAgICAgfQogICAgICBpZiAocCA9PT0gLTEpIHsKICAgICAgICBjb25zdCB0ID0gTWF0aC5tYXgoLi4ubi5tYXAoKHcpID0+IHcueSkpLCBnID0gdCA9PT0gMCA/IDAgOiB0ICsgejsKICAgICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiAwLCBsb2NhbFk6IGcsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pLCBuLmxlbmd0aCA9IDAsIG4ucHVzaCh7IHg6IDAsIHdpZHRoOiBjLndpZHRoICsgQiwgeTogZyArIGMuaGVpZ2h0IH0pLCBkID4gYy53aWR0aCArIEIgJiYgbi5wdXNoKHsKICAgICAgICAgIHg6IGMud2lkdGggKyBCLAogICAgICAgICAgd2lkdGg6IGQgLSAoYy53aWR0aCArIEIpLAogICAgICAgICAgeTogMAogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IHMgPSBuW3BdLngsIGggPSBJID09PSAwID8gMCA6IEkgKyB6OwogICAgICByLnB1c2goeyBpZDogYy5pZCwgbG9jYWxYOiBzLCBsb2NhbFk6IGgsIHdpZHRoOiBjLndpZHRoLCBoZWlnaHQ6IGMuaGVpZ2h0IH0pOwogICAgICBjb25zdCB1ID0gYy53aWR0aCArIEIsIE0gPSBoICsgYy5oZWlnaHQsIEMgPSB7IHg6IHMsIHdpZHRoOiB1LCB5OiBNIH0sIG0gPSBbXTsKICAgICAgZm9yIChjb25zdCB0IG9mIG4pCiAgICAgICAgdC54ICsgdC53aWR0aCA8PSBzIHx8IHQueCA+PSBzICsgdSA/IG0ucHVzaCh0KSA6ICh0LnggPCBzICYmIG0ucHVzaCh7IHg6IHQueCwgd2lkdGg6IHMgLSB0LngsIHk6IHQueSB9KSwgdC54ICsgdC53aWR0aCA+IHMgKyB1ICYmIG0ucHVzaCh7CiAgICAgICAgICB4OiBzICsgdSwKICAgICAgICAgIHdpZHRoOiB0LnggKyB0LndpZHRoIC0gKHMgKyB1KSwKICAgICAgICAgIHk6IHQueQogICAgICAgIH0pKTsKICAgICAgbS5wdXNoKEMpLCBtLnNvcnQoKHQsIGcpID0+IHQueCAtIGcueCksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKC4uLm0pOwogICAgfQogICAgY29uc3QgYSA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgbCA9IE1hdGgubWF4KC4uLnIubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogYSwgaGVpZ2h0OiBsLCBib3hlczogciwgc2NvcmU6IDAgfTsKICB9Cn0KZnVuY3Rpb24gVihrLCBlLCBkKSB7CiAgdmFyIHIsIGE7CiAgbGV0IGkgPSBrLCBuID0gbnVsbDsKICBmb3IgKDsgaTsgKQogICAgZC5oYXMoaSkgJiYgKG4gPSBpKSwgaSA9ICgociA9IGUubm9kZXNbaV0pID09IG51bGwgPyB2b2lkIDAgOiByLnBhcmVudElkKSA/PyAoKGEgPSBlLmNvbnRhaW5lcnNbaV0pID09IG51bGwgPyB2b2lkIDAgOiBhLnBhcmVudElkKSA/PyB2b2lkIDA7CiAgcmV0dXJuIG4gPz8gazsKfQpjbGFzcyBvdCB7CiAgYXN5bmMgZXhlY3V0ZShlLCBkLCBpKSB7CiAgICBjb25zdCBuID0gT2JqZWN0LnZhbHVlcyhlLmNvbnRhaW5lcnMpLCByID0gbmV3IFNldCgKICAgICAgbi5maWx0ZXIoKHMpID0+ICEhcy5jb2xsYXBzZWQpLm1hcCgocykgPT4gcy5pZCkKICAgICksIGEgPSB7fTsKICAgIGZvciAoY29uc3QgW3MsIGhdIG9mIE9iamVjdC5lbnRyaWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IHUgPSBWKGguc291cmNlSWQsIGUsIHIpLCBNID0gVihoLnRhcmdldElkLCBlLCByKTsKICAgICAgdSAhPT0gTSAmJiAoYVtzXSA9IHsKICAgICAgICAuLi5oLAogICAgICAgIHNvdXJjZUlkOiB1LAogICAgICAgIHRhcmdldElkOiBNCiAgICAgIH0pOwogICAgfQogICAgY29uc3QgbCA9IHsKICAgICAgLi4uZSwKICAgICAgZWRnZXM6IGEKICAgIH0sIGMgPSBPYmplY3Qua2V5cyhlLmNvbnRhaW5lcnMpLmxlbmd0aCwgcCA9IChpICE9IG51bGwgJiYgaS5tb2RlICYmIGkubW9kZSAhPT0gImF1dG8iID8gaS5tb2RlIDogYyA+IDAgPyAiY29uY3VycmVudCIgOiAiZmxvdyIpID09PSAiY29uY3VycmVudCIgPyBuZXcgbnQoKGkgPT0gbnVsbCA/IHZvaWQgMCA6IGkuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IGV0KGkpOwogICAgcmV0dXJuIGouZXhlY3V0ZShsLCBwLCBkKTsKICB9Cn0KY29uc3Qgc3QgPSBuZXcgb3QoKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoaykgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBkLCBtZWFzdXJlbWVudHM6IGksIG9wdGlvbnM6IG4gfSA9IGsuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoaSksIGEgPSBhd2FpdCBzdC5leGVjdXRlKGQsIHIsIG4pOwogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMCwgbGF5b3V0OiBhIH0pOwogIH0gY2F0Y2ggKHIpIHsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBpZDogZSwgc3VjY2VzczogITEsIGVycm9yOiByLm1lc3NhZ2UgfSk7CiAgfQp9Owo=", kt = (o) => Uint8Array.from(atob(o), (t) => t.charCodeAt(0)), tt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", kt(nt)], { type: "text/javascript;charset=utf-8" });
function Zt(o) {
  let t;
  try {
    if (t = tt && (self.URL || self.webkitURL).createObjectURL(tt), !t) throw "";
    const g = new Worker(t, {
      type: "module",
      name: o == null ? void 0 : o.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + nt,
      {
        type: "module",
        name: o == null ? void 0 : o.name
      }
    );
  }
}
class Ht {
  constructor() {
    Ge(this, "worker", null);
    Ge(this, "pendingRequests", /* @__PURE__ */ new Map());
    Ge(this, "fallbackEngine", new Kt());
    if (typeof Worker < "u")
      try {
        this.worker = new Zt(), this.worker.onmessage = (t) => {
          const { id: g, success: I, layout: c, error: u } = t.data, A = this.pendingRequests.get(g);
          A && (this.pendingRequests.delete(g), I ? A.resolve(c) : A.reject(new Error(u)));
        }, this.worker.onerror = (t) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", t);
        };
      } catch (t) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", t), this.worker = null;
      }
  }
  execute(t, g, I) {
    return this.worker ? new Promise((c, u) => {
      const A = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(A, { resolve: c, reject: u });
      const r = Array.from(g.entries());
      this.worker.postMessage({
        id: A,
        graph: t,
        measurements: r,
        options: I
      });
    }) : this.fallbackEngine.execute(t, g, I);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class Dt {
  canDrag() {
    return !0;
  }
  onDragMove(t) {
    return t.cursorWorld;
  }
  onDragEnd(t) {
    const { draggedEntity: g, hoveredEntity: I, graph: c } = t;
    return I && I.id === g.id ? null : I && c.containers[I.id] ? g.parentId === I.id ? null : {
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
class Ut {
  constructor() {
    Ge(this, "dragOffThreshold", 60);
  }
  canDrag() {
    return !0;
  }
  onDragMove(t) {
    return t.cursorWorld;
  }
  onDragEnd(t) {
    const { draggedEntity: g, hoveredEdge: I, hoveredEntity: c, cursorWorld: u, startWorldPos: A, graph: r } = t, l = Math.hypot(
      u.x - A.x,
      u.y - A.y
    );
    if (c && r.containers[c.id])
      return c.id !== g.id && g.parentId !== c.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: c.id
        }
      } : null;
    if (!c && !I) {
      const f = Object.values(r.edges).filter(
        (b) => b.targetId === g.id
      ), C = Object.values(r.edges).filter(
        (b) => b.sourceId === g.id
      );
      return f.length === 1 && C.length === 1 && f[0].sourceId !== C[0].targetId && l >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: f[0].id,
          outgoingEdgeId: C[0].id
        }
      } : l >= this.dragOffThreshold && g.parentId !== null && g.parentId !== void 0 ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: null
        }
      } : null;
    }
    const G = (f) => {
      const C = r.nodes[f.id] || f;
      if (!C.ports || C.ports.length === 0) return "";
      const b = Object.values(r.edges).find((x) => x.targetId === f.id);
      if (b) {
        const x = C.ports.find((n) => n.id === b.targetPortId);
        if (x) return x.id;
      }
      const w = new Set(
        Object.values(r.edges).filter((x) => x.sourceId === f.id).map((x) => x.sourcePortId)
      ), N = C.ports.find((x) => !w.has(x.id));
      return N ? N.id : C.ports[0].id;
    };
    if (I)
      return I.sourceId === g.id || I.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: I.id,
          newSourceId: I.sourceId,
          newTargetId: g.id,
          newTargetPortId: G(g)
        }
      };
    if (c && c.id !== g.id && r.nodes[c.id]) {
      const f = Object.values(r.edges).find(
        (C) => C.targetId === c.id && C.sourceId !== g.id
      );
      if (f)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: f.id,
            newSourceId: f.sourceId,
            newTargetId: g.id,
            newTargetPortId: G(g)
          }
        };
    }
    return null;
  }
}
function Pt(o, t = { min: 0.15, max: 3 }) {
  const [g, I] = ie({ x: 80, y: 80, zoom: 1 }), c = Ie(!1), u = Ie({ x: 0, y: 0 }), A = z(
    (x, n) => {
      if (!o.current) return { x, y: n };
      const e = o.current.getBoundingClientRect();
      return {
        x: (x - e.left - g.x) / g.zoom,
        y: (n - e.top - g.y) / g.zoom
      };
    },
    [g, o]
  ), r = z(
    (x) => {
      if (!o.current) return;
      const n = [
        ...Object.values(x.nodes),
        ...Object.values(x.containers)
      ];
      if (n.length === 0) {
        I({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let e = 1 / 0, s = 1 / 0, i = -1 / 0, d = -1 / 0;
      for (const H of n)
        e = Math.min(e, H.x), s = Math.min(s, H.y), i = Math.max(i, H.x + H.width), d = Math.max(d, H.y + H.height);
      const B = o.current.getBoundingClientRect(), v = 80, K = Math.max(i - e, 100), y = Math.max(d - s, 100), Z = (B.width - v * 2) / K, L = (B.height - v * 2) / y, D = Math.min(
        Math.max(Math.min(Z, L), t.min),
        Math.min(t.max, 1.25)
      ), h = (B.width - K * D) / 2 - e * D, S = (B.height - y * D) / 2 - s * D;
      I({
        x: h,
        y: S,
        zoom: D
      });
    },
    [o, t]
  ), l = z(
    (x) => {
      if (x.preventDefault(), !!o.current)
        if (x.ctrlKey || x.metaKey) {
          const n = o.current.getBoundingClientRect(), e = x.clientX - n.left, s = x.clientY - n.top, i = x.deltaY < 0 ? 1.08 : 0.92, d = Math.min(Math.max(g.zoom * i, t.min), t.max), B = e - (e - g.x) * (d / g.zoom), v = s - (s - g.y) * (d / g.zoom);
          I({ x: B, y: v, zoom: d });
        } else
          I((n) => ({
            ...n,
            x: n.x - x.deltaX,
            y: n.y - x.deltaY
          }));
    },
    [g, t, o]
  ), G = z(
    (x, n) => {
      c.current = !0, u.current = { x: x - g.x, y: n - g.y };
    },
    [g]
  ), f = z((x, n) => {
    c.current && I((e) => ({
      ...e,
      x: x - u.current.x,
      y: n - u.current.y
    }));
  }, []), C = z(() => {
    c.current = !1;
  }, []), b = z(() => {
    I({ x: 80, y: 80, zoom: 1 });
  }, []), w = z(() => {
    I((x) => ({
      ...x,
      zoom: Math.min(x.zoom * 1.2, t.max)
    }));
  }, [t]), N = z(() => {
    I((x) => ({
      ...x,
      zoom: Math.max(x.zoom / 1.2, t.min)
    }));
  }, [t]);
  return {
    transform: g,
    setTransform: I,
    screenToWorld: A,
    onWheel: l,
    startPan: G,
    updatePan: f,
    endPan: C,
    resetTransform: b,
    zoomIn: w,
    zoomOut: N,
    zoomToFit: r,
    isPanning: c
  };
}
function vt(o) {
  const [t, g] = ie(
    /* @__PURE__ */ new Map()
  );
  Ie(/* @__PURE__ */ new Map());
  const I = Ie(/* @__PURE__ */ new Map()), c = z((u, A) => {
    A ? I.current.set(u, A) : I.current.delete(u);
  }, []);
  return Pe(() => {
    const u = new ResizeObserver((A) => {
      let r = !1;
      const l = new Map(t);
      for (const G of A) {
        const f = G.target.getAttribute("data-sysflow-measure-id");
        if (!f) continue;
        const C = Math.ceil(G.contentRect.width), b = Math.ceil(G.contentRect.height), w = l.get(f);
        (!w || w.width !== C || w.height !== b) && (l.set(f, { width: C, height: b }), r = !0);
      }
      r && g(l);
    });
    return I.current.forEach((A) => u.observe(A)), () => {
      u.disconnect();
    };
  }, [o]), { measurements: t, registerMeasureElement: c };
}
function Nt(o, t, g, I, c) {
  const [u, A] = ie(null), [r, l] = ie(null), G = Ie(null), f = Ie(null), C = z(
    (n, e) => {
      let s = null, i = 1 / 0;
      for (const [d, B] of Object.entries(t.containers))
        if (d !== e && n.x >= B.x && n.x <= B.x + B.width && n.y >= B.y && n.y <= B.y + B.height) {
          const v = B.width * B.height;
          v < i && (i = v, s = o.containers[d] || null);
        }
      if (s) return s;
      for (const [d, B] of Object.entries(t.nodes))
        if (d !== e && n.x >= B.x && n.x <= B.x + B.width && n.y >= B.y && n.y <= B.y + B.height)
          return o.nodes[d] || null;
      return null;
    },
    [t, o]
  ), b = z(
    (n, e) => {
      let s = null, i = 45;
      for (const d of Object.values(o.edges)) {
        if (d.sourceId === e || d.targetId === e) continue;
        const B = t.nodes[d.sourceId] || t.containers[d.sourceId], v = t.nodes[d.targetId] || t.containers[d.targetId];
        if (!B || !v) continue;
        const K = B.x + B.width, y = B.y + B.height / 2, Z = v.x, L = v.y + v.height / 2;
        for (let D = 0; D <= 10; D++) {
          const h = D / 10, S = (1 - h) * K + h * Z, H = (1 - h) * y + h * L, X = Math.hypot(n.x - S, n.y - H);
          X < i && (i = X, s = d);
        }
      }
      return s;
    },
    [t, o]
  ), w = z(
    (n, e) => {
      if (e.stopPropagation(), g.canDrag && !g.canDrag(n, o))
        return;
      const s = I(e.clientX, e.clientY);
      A({
        draggedEntity: n,
        ghostPosition: s,
        startPosition: s
      });
    },
    [o, g, I]
  ), N = z(
    (n) => {
      if (!u) return;
      const e = I(n.clientX, n.clientY), s = C(e, u.draggedEntity.id), i = b(e, u.draggedEntity.id);
      G.current = s, f.current = i, s && o.containers[s.id] ? l(s.id) : l(null);
      const d = g.onDragMove ? g.onDragMove({
        draggedEntity: u.draggedEntity,
        cursorWorld: e,
        startWorldPos: u.startPosition,
        hoveredEntity: s,
        hoveredEdge: i,
        graph: o,
        layout: t
      }) : e;
      d && A((B) => B ? { ...B, ghostPosition: d } : null);
    },
    [u, I, g, o, t, C, b]
  ), x = z(
    (n) => {
      if (!u) return;
      const e = I(n.clientX, n.clientY), s = C(e, u.draggedEntity.id), i = b(e, u.draggedEntity.id), d = g.onDragEnd({
        draggedEntity: u.draggedEntity,
        cursorWorld: e,
        startWorldPos: u.startPosition,
        hoveredEntity: s,
        hoveredEdge: i,
        graph: o,
        layout: t
      });
      d && c(d), A(null), l(null), G.current = null, f.current = null;
    },
    [u, I, g, o, t, C, b, c]
  );
  return {
    dragState: u,
    hoveredContainerId: r,
    handlePointerDown: w,
    handlePointerMove: N,
    handlePointerUp: x
  };
}
function Yt(o, t) {
  const g = [], I = [], c = [], u = [], A = [], r = [], l = [], G = [];
  for (const [f, C] of Object.entries(t.nodes))
    o.nodes[f] ? o.nodes[f] !== C && I.push(C) : g.push(C);
  for (const f of Object.keys(o.nodes))
    t.nodes[f] || c.push(f);
  for (const [f, C] of Object.entries(t.containers))
    o.containers[f] ? o.containers[f] !== C && A.push(C) : u.push(C);
  for (const f of Object.keys(o.containers))
    t.containers[f] || r.push(f);
  for (const [f, C] of Object.entries(t.edges))
    o.edges[f] || l.push(C);
  for (const [f, C] of Object.entries(o.edges))
    t.edges[f] || G.push(C);
  return {
    createdNodes: g,
    updatedNodes: I,
    deletedNodes: c,
    createdContainers: u,
    updatedContainers: A,
    deletedContainers: r,
    createdEdges: l,
    deletedEdges: G
  };
}
function Wt(o) {
  return o.createdNodes.length > 0 || o.updatedNodes.length > 0 || o.deletedNodes.length > 0 || o.deletedContainers && o.deletedContainers.length > 0 || o.createdEdges.length > 0 || o.deletedEdges.length > 0;
}
function Jt(o, t) {
  const [g, I] = ie({
    history: [o],
    index: 0
  }), [c, u] = ie(null), A = Ie(t);
  A.current = t;
  const r = g.history[g.index] ?? g.history[0] ?? o, l = z((s) => {
    var d;
    const i = ze(s);
    if ((d = A.current) != null && d.onMutate) {
      const B = Yt(r, i);
      Wt(B) && A.current.onMutate(B);
    }
    I((B) => {
      const v = B.history.slice(0, B.index + 1);
      return {
        history: [...v, i],
        index: v.length
      };
    });
  }, [r]), G = z((s) => {
    const i = ze(s);
    I({
      history: [i],
      index: 0
    });
  }, []), f = z(() => {
    I((s) => ({
      ...s,
      index: Math.max(0, s.index - 1)
    }));
  }, []), C = z(() => {
    I((s) => ({
      ...s,
      index: Math.min(s.history.length - 1, s.index + 1)
    }));
  }, []), b = z(
    (s) => {
      var K;
      if (!s || s.length === 0) return;
      let i = s;
      if ((K = A.current) != null && K.canDelete) {
        const y = A.current.canDelete(s);
        if (typeof y == "boolean") {
          if (!y) return;
        } else Array.isArray(y) && (i = y);
      }
      if (i.length === 0) return;
      const d = { ...r.nodes }, B = { ...r.containers }, v = { ...r.edges };
      for (const y of i)
        delete d[y], delete B[y], delete v[y];
      l({
        ...r,
        nodes: d,
        containers: B,
        edges: v
      });
    },
    [r, l]
  ), w = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (s) => {
    const i = Math.random() * 16 | 0;
    return (s === "x" ? i : i & 3 | 8).toString(16);
  }), N = z(
    (s) => {
      var B, v, K;
      const i = r, d = A.current;
      if (s.type === "ENTITY_REPARENT") {
        const { entityId: y, newParentId: Z } = s.payload, L = {
          ...i,
          nodes: { ...i.nodes },
          containers: { ...i.containers }
        };
        L.nodes[y] ? L.nodes[y] = { ...L.nodes[y], parentId: Z } : L.containers[y] && (L.containers[y] = { ...L.containers[y], parentId: Z }), l(L);
      } else if (s.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: y, direction: Z, suggestedNewNodeId: L, suggestedNewEdge1Id: D, suggestedNewEdge2Id: h } = s.payload, S = i.edges[y.id];
        if (!S) return;
        const H = i.nodes[S.sourceId];
        if (d != null && d.canConnect && (!d.canConnect(S.sourceId, L) || !d.canConnect(L, S.targetId)))
          return;
        const X = Z === "BT", V = Z === "TB", m = `p_in_${Date.now()}`, M = `p_out_${Date.now() + 1}`;
        let P = "left", W = "right";
        X ? (P = "bottom", W = "top") : V ? (P = "top", W = "bottom") : Z === "RL" && (P = "right", W = "left");
        const O = (B = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : B.call(d, {
          edge: S,
          direction: Z,
          suggestedType: (H == null ? void 0 : H.type) || "FlowTask"
        }), j = {
          id: (O == null ? void 0 : O.id) || L,
          label: (O == null ? void 0 : O.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (O == null ? void 0 : O.type) || (H == null ? void 0 : H.type) || "FlowTask",
          parentId: (O == null ? void 0 : O.parentId) ?? (H == null ? void 0 : H.parentId) ?? null,
          ports: (O == null ? void 0 : O.ports) || [
            { id: m, label: "in", side: P },
            { id: M, label: "out", side: W }
          ],
          data: (O == null ? void 0 : O.data) || {},
          ...O
        }, ae = j.ports.find((ee) => ee.label.toLowerCase().includes("in")) || j.ports.find((ee) => ee.side === (X ? "bottom" : "top")) || j.ports[0], ce = j.ports.find((ee) => ee.label.toLowerCase().includes("out")) || j.ports.find((ee) => ee.side === (X ? "top" : "bottom")) || j.ports[j.ports.length - 1], Ce = ae ? ae.id : m, F = ce ? ce.id : M, ge = {
          id: D,
          sourceId: S.sourceId,
          sourcePortId: S.sourcePortId,
          targetId: j.id,
          targetPortId: Ce
        }, be = {
          id: h,
          sourceId: j.id,
          sourcePortId: F,
          targetId: S.targetId,
          targetPortId: S.targetPortId
        }, T = { ...i.edges };
        delete T[S.id], T[D] = ge, T[h] = be, l({
          ...i,
          nodes: { ...i.nodes, [j.id]: j },
          edges: T
        });
      } else if (s.type === "NODE_EXTRACT") {
        const { incomingEdgeId: y, outgoingEdgeId: Z } = s.payload, L = i.edges[y], D = i.edges[Z];
        if (!L || !D || d != null && d.canConnect && !d.canConnect(L.sourceId, D.targetId))
          return;
        const h = { ...i.edges };
        delete h[y], delete h[Z];
        const S = w();
        h[S] = {
          id: S,
          sourceId: L.sourceId,
          sourcePortId: L.sourcePortId,
          targetId: D.targetId,
          targetPortId: D.targetPortId
        }, l({
          ...i,
          edges: h
        });
      } else if (s.type === "NODE_ADD_CONNECTED") {
        const {
          sourceNode: y,
          position: Z,
          portId: L,
          direction: D,
          suggestedNewNodeId: h,
          suggestedNewEdgeId: S
        } = s.payload, H = D === "BT", X = D === "TB", V = D === "RL", m = H ? "bottom" : X ? "top" : V ? "right" : "left", M = H ? "top" : X ? "bottom" : V ? "left" : "right", P = `p_in_${Date.now()}`, W = `p_out_${Date.now() + 1}`, O = L ? y.ports.find((ne) => ne.id === L) : void 0, j = ((v = O == null ? void 0 : O.label) == null ? void 0 : v.toLowerCase()) || "", ae = j === "in" || j.startsWith("in_") || j.endsWith("_in"), ce = j === "out" || j.startsWith("out_") || j.endsWith("_out"), F = ae ? !0 : ce ? !1 : H && Z === "bottom" || X && Z === "top" || !H && !X && !V && Z === "left" || V && Z === "right", ge = F ? h : y.id, be = F ? y.id : h;
        if (d != null && d.canConnect && !d.canConnect(ge, be))
          return;
        const T = (K = d == null ? void 0 : d.createNodeEntity) == null ? void 0 : K.call(d, {
          sourceNode: y,
          position: Z,
          direction: D,
          suggestedType: y.type
        }), ee = {
          id: (T == null ? void 0 : T.id) || h,
          label: (T == null ? void 0 : T.label) || `Node ${Object.keys(i.nodes).length + 1}`,
          type: (T == null ? void 0 : T.type) || y.type,
          ports: (T == null ? void 0 : T.ports) || [
            { id: P, label: "in", side: m },
            { id: W, label: "out", side: M }
          ],
          data: (T == null ? void 0 : T.data) || {},
          parentId: (T == null ? void 0 : T.parentId) ?? (y == null ? void 0 : y.parentId) ?? null,
          ...T
        }, Ee = ee.ports.find((ne) => ne.label.toLowerCase().includes("in")) || ee.ports.find((ne) => ne.side === m) || ee.ports[0], Ke = ee.ports.find((ne) => ne.label.toLowerCase().includes("out")) || ee.ports.find((ne) => ne.side === M) || ee.ports[ee.ports.length - 1], U = Ee ? Ee.id : P, we = Ke ? Ke.id : W, _ = O || y.ports.find((ne) => ne.label.toLowerCase() === "in") || y.ports[0], Ae = O || y.ports.find((ne) => ne.label.toLowerCase() === "out") || y.ports[y.ports.length - 1], me = F ? {
          id: S,
          sourceId: ee.id,
          sourcePortId: we,
          targetId: y.id,
          targetPortId: (_ == null ? void 0 : _.id) || "in"
        } : {
          id: S,
          sourceId: y.id,
          sourcePortId: (Ae == null ? void 0 : Ae.id) || "out",
          targetId: ee.id,
          targetPortId: U
        };
        l({
          ...i,
          nodes: { ...i.nodes, [ee.id]: ee },
          edges: { ...i.edges, [S]: me }
        });
      } else if (s.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: y, collapsed: Z } = s.payload;
        i.containers[y] && l({
          ...i,
          containers: {
            ...i.containers,
            [y]: { ...i.containers[y], collapsed: Z }
          }
        });
      } else if (s.type === "NODE_UPDATE") {
        const { id: y, updates: Z } = s.payload;
        i.nodes[y] && l({
          ...i,
          nodes: {
            ...i.nodes,
            [y]: { ...i.nodes[y], ...Z }
          }
        });
      } else if (s.type === "EDGE_CREATE") {
        const y = s.payload.edge, Z = y.sourceId, L = y.targetId, D = y.sourcePortId, h = y.targetPortId;
        if (d != null && d.canConnect && !d.canConnect(Z, L, D, h))
          return;
        const S = s.payload.id || y.id || w();
        l({
          ...i,
          edges: {
            ...i.edges,
            [S]: { id: S, ...y }
          }
        });
      } else if (s.type === "EDGE_DELETE") {
        const y = s.payload.edgeId || s.payload.id, Z = { ...i.edges };
        delete Z[y], l({ ...i, edges: Z });
      } else if (s.type === "EDGE_REWIRE") {
        const { edgeId: y, newTargetId: Z, newTargetPortId: L } = s.payload;
        if (!Z || !i.edges[y]) return;
        const D = Z, h = i.edges[y], S = h.sourceId, H = h.targetId;
        if (D === S || D === H) return;
        const X = Object.values(i.edges).find((F) => F.targetId === D), V = Object.values(i.edges).find((F) => F.sourceId === D), m = X && V && X.sourceId !== V.targetId;
        if (d != null && d.canConnect && (m && !d.canConnect(X.sourceId, V.targetId) || !d.canConnect(S, D) || !d.canConnect(D, H)))
          return;
        const M = { ...i.edges };
        if (m) {
          delete M[X.id], delete M[V.id];
          const F = w();
          M[F] = {
            id: F,
            sourceId: X.sourceId,
            sourcePortId: X.sourcePortId,
            targetId: V.targetId,
            targetPortId: V.targetPortId
          };
        } else
          X && delete M[X.id], V && delete M[V.id];
        const P = i.nodes[D], W = L && (P == null ? void 0 : P.ports.find((F) => F.id === L)) || (P == null ? void 0 : P.ports.find((F) => {
          var ge;
          return (ge = F.label) == null ? void 0 : ge.toLowerCase().includes("in");
        })) || (P == null ? void 0 : P.ports.find((F) => F.side === "bottom")) || (P == null ? void 0 : P.ports[0]), O = (P == null ? void 0 : P.ports.find((F) => {
          var ge;
          return F.id !== (W == null ? void 0 : W.id) && ((ge = F.label) == null ? void 0 : ge.toLowerCase().includes("out"));
        })) || (P == null ? void 0 : P.ports.find((F) => F.id !== (W == null ? void 0 : W.id) && F.side === "top")) || (P == null ? void 0 : P.ports.find((F) => F.id !== (W == null ? void 0 : W.id))) || W, j = (W == null ? void 0 : W.id) || "p_in", ae = (O == null ? void 0 : O.id) || "p_out";
        delete M[y];
        const ce = w();
        M[ce] = {
          id: ce,
          sourceId: S,
          sourcePortId: h.sourcePortId,
          targetId: D,
          targetPortId: j
        };
        const Ce = w();
        M[Ce] = {
          id: Ce,
          sourceId: D,
          sourcePortId: ae,
          targetId: H,
          targetPortId: h.targetPortId
        }, l({ ...i, edges: M });
      } else {
        const y = s;
        if (y.type === "NODE_DELETE" || y.type === "DELETE_SELECTION" || y.type === "SELECTION_DELETE") {
          const Z = y.payload || {}, L = [];
          Z.nodeId && L.push(Z.nodeId), Z.id && L.push(Z.id), Array.isArray(Z.selectedIds) && L.push(...Z.selectedIds), Array.isArray(Z.ids) && L.push(...Z.ids), b(L);
        }
      }
    },
    [r, l, b]
  ), x = z(
    (s) => {
      const i = r.nodes[s] || r.containers[s];
      i && u({ entity: JSON.parse(JSON.stringify(i)), isCut: !1 });
    },
    [r]
  ), n = z(
    (s) => {
      const i = r.nodes[s] || r.containers[s];
      if (i) {
        u({ entity: JSON.parse(JSON.stringify(i)), isCut: !0 });
        const d = { ...r.nodes }, B = { ...r.containers };
        delete d[s], delete B[s], l({ ...r, nodes: d, containers: B });
      }
    },
    [r, l]
  ), e = z(() => {
    if (!c) return;
    const s = c.entity, i = `${s.id}_copy_${Date.now().toString().slice(-4)}`, d = { ...s, id: i, label: `${s.label} (Copy)` };
    "collapsed" in d ? l({
      ...r,
      containers: { ...r.containers, [i]: d }
    }) : l({
      ...r,
      nodes: { ...r.nodes, [i]: d }
    });
  }, [c, r, l]);
  return {
    graph: r,
    setGraphDirect: G,
    applyAction: N,
    undo: f,
    redo: C,
    copyEntity: x,
    cutEntity: n,
    pasteEntity: e,
    deleteSelection: b,
    canUndo: g.index > 0,
    canRedo: g.index < g.history.length - 1
  };
}
const Mt = ({
  graph: o,
  registerMeasureElement: t,
  nodeTypes: g,
  containerTypes: I
}) => {
  const c = Object.values(o.nodes), u = Object.values(o.containers);
  return /* @__PURE__ */ q("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    c.map((A) => {
      const r = A.type ? g == null ? void 0 : g[A.type] : null;
      return /* @__PURE__ */ Y(
        "div",
        {
          ref: (l) => t(A.id, l),
          "data-sysflow-measure-id": A.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: r ? /* @__PURE__ */ Y(r, { node: A, selected: !1 }) : /* @__PURE__ */ q("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ Y("div", { style: { fontWeight: 600 }, children: A.label }),
            A.ports.length > 0 && /* @__PURE__ */ q("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              A.ports.map((l) => l.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${A.id}`
      );
    }),
    u.map((A) => {
      const r = A.type ? I == null ? void 0 : I[A.type] : null;
      return /* @__PURE__ */ Y(
        "div",
        {
          ref: (l) => t(A.id, l),
          "data-sysflow-measure-id": A.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: r ? /* @__PURE__ */ Y(r, { container: A, selected: !1 }) : /* @__PURE__ */ Y("div", { className: "sysflow-container-header", children: A.label })
        },
        `measure-container-${A.id}`
      );
    })
  ] });
}, Rt = ({
  graph: o,
  layout: t,
  selectedIds: g,
  direction: I = "TB",
  showArrows: c = !0,
  routing: u = "auto",
  portOptions: A,
  enableEdgeQuickAdd: r = !0,
  onEdgeClick: l,
  onInsertNodeOnEdge: G
}) => {
  const [f, C] = ie(null), b = u === "step" || u === "auto" && (I === "LR" || I === "RL"), w = (n, e, s) => {
    var S, H, X, V;
    let i = n, d = null;
    for ((S = o.containers[n]) != null && S.collapsed && (d = o.containers[n]); i; ) {
      const m = ((H = o.nodes[i]) == null ? void 0 : H.parentId) ?? ((X = o.containers[i]) == null ? void 0 : X.parentId) ?? null;
      m && ((V = o.containers[m]) != null && V.collapsed) && (d = o.containers[m]), i = m;
    }
    if (d) {
      const m = t.containers[d.id];
      if (!m)
        return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: d.id };
      let M, P, W;
      return I === "TB" ? (M = s ? "bottom" : "top", P = m.x + m.width / 2, W = s ? m.y + m.height : m.y) : I === "BT" ? (M = s ? "top" : "bottom", P = m.x + m.width / 2, W = s ? m.y : m.y + m.height) : I === "RL" ? (M = s ? "left" : "right", P = s ? m.x : m.x + m.width, W = m.y + m.height / 2) : (M = s ? "right" : "left", P = s ? m.x + m.width : m.x, W = m.y + m.height / 2), { x: P, y: W, side: M, valid: !0, entityId: d.id };
    }
    if (!!o.containers[n]) {
      const m = t.containers[n];
      if (!m) return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
      let M, P, W;
      return I === "TB" ? (M = m.x + m.width / 2, P = s ? m.y + m.height : m.y, W = s ? "bottom" : "top") : I === "BT" ? (M = m.x + m.width / 2, P = s ? m.y : m.y + m.height, W = s ? "top" : "bottom") : I === "RL" ? (M = s ? m.x : m.x + m.width, P = m.y + m.height / 2, W = s ? "left" : "right") : (M = s ? m.x + m.width : m.x, P = m.y + m.height / 2, W = s ? "right" : "left"), { x: M, y: P, side: W, valid: !0, entityId: n };
    }
    const v = o.nodes[n], K = t.nodes[n];
    if (!v || !K)
      return { x: 0, y: 0, side: s ? "right" : "left", valid: !1, entityId: n };
    const Z = Le(
      v,
      K,
      I,
      o.edges,
      A
    ).get(e);
    if (Z)
      return { x: Z.worldX, y: Z.worldY, side: Z.side, valid: !0, entityId: n };
    let L, D, h;
    return I === "TB" ? (L = K.x + K.width / 2, D = s ? K.y + K.height : K.y, h = s ? "bottom" : "top") : I === "BT" ? (L = K.x + K.width / 2, D = s ? K.y : K.y + K.height, h = s ? "top" : "bottom") : I === "RL" ? (L = s ? K.x : K.x + K.width, D = K.y + K.height / 2, h = s ? "left" : "right") : (L = s ? K.x + K.width : K.x, D = K.y + K.height / 2, h = s ? "right" : "left"), { x: L, y: D, side: h, valid: !0, entityId: n };
  }, N = (n, e) => {
    const s = (n.x + e.x) / 2, i = (n.y + e.y) / 2;
    if (n.side === "right" && e.side === "left") {
      if (e.x >= n.x + 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: i }
        };
      {
        const d = e.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x + 20} ${n.y} L ${n.x + 20} ${d} L ${e.x - 20} ${d} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: d }
        };
      }
    }
    if (n.side === "left" && e.side === "right") {
      if (e.x <= n.x - 20)
        return {
          pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: i }
        };
      {
        const d = e.y >= n.y ? n.y - 40 : n.y + 40;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x - 20} ${n.y} L ${n.x - 20} ${d} L ${e.x + 20} ${d} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: s, y: d }
        };
      }
    }
    if (n.side === "bottom" && e.side === "top") {
      if (e.y >= n.y + 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${i} L ${e.x} ${i} L ${e.x} ${e.y}`,
          center: { x: s, y: i }
        };
      {
        const d = e.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y + 20} L ${d} ${n.y + 20} L ${d} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`,
          center: { x: d, y: i }
        };
      }
    }
    if (n.side === "top" && e.side === "bottom") {
      if (e.y <= n.y - 16)
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${i} L ${e.x} ${i} L ${e.x} ${e.y}`,
          center: { x: s, y: i }
        };
      {
        const d = e.x >= n.x ? n.x + 50 : n.x - 50;
        return {
          pathStr: `M ${n.x} ${n.y} L ${n.x} ${n.y - 20} L ${d} ${n.y - 20} L ${d} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`,
          center: { x: d, y: i }
        };
      }
    }
    return {
      pathStr: `M ${n.x} ${n.y} L ${s} ${n.y} L ${s} ${e.y} L ${e.x} ${e.y}`,
      center: { x: s, y: i }
    };
  }, x = (n, e) => {
    const s = e.x - n.x, i = e.y - n.y;
    let d = n.x, B = n.y, v = e.x, K = e.y;
    if (n.side === "bottom" && e.side === "top")
      if (i > 0) {
        const L = Math.min(28, i * 0.4);
        B = n.y + Math.max(L, i * 0.5), K = e.y - Math.max(L, i * 0.5);
      } else {
        const L = s >= 0 ? 1 : -1, D = Math.max(40, Math.abs(s) * 0.2);
        d = n.x + D * L, B = n.y + 40, v = e.x + D * L, K = e.y - 40;
      }
    else if (n.side === "top" && e.side === "bottom")
      if (i < 0) {
        const L = Math.min(28, Math.abs(i) * 0.4);
        B = n.y - Math.max(L, Math.abs(i) * 0.5), K = e.y + Math.max(L, Math.abs(i) * 0.5);
      } else {
        const L = s >= 0 ? 1 : -1, D = Math.max(40, Math.abs(s) * 0.2);
        d = n.x + D * L, B = n.y - 40, v = e.x + D * L, K = e.y + 40;
      }
    else if (n.side === "right" && e.side === "left")
      s > 0 ? (d = n.x + s * 0.5, v = e.x - s * 0.5) : (d = n.x + 50, B = n.y - 50, v = e.x - 50, K = e.y - 50);
    else if (n.side === "left" && e.side === "right")
      s < 0 ? (d = n.x + s * 0.5, v = e.x - s * 0.5) : (d = n.x - 50, B = n.y - 50, v = e.x + 50, K = e.y - 50);
    else {
      const L = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, D = L[n.side] || { x: 0, y: 1 }, h = L[e.side] || { x: 0, y: -1 }, S = Math.min(60, Math.hypot(s, i) * 0.35);
      d = n.x + D.x * S, B = n.y + D.y * S, v = e.x + h.x * S, K = e.y + h.y * S;
    }
    const y = 0.125 * n.x + 0.375 * d + 0.375 * v + 0.125 * e.x, Z = 0.125 * n.y + 0.375 * B + 0.375 * K + 0.125 * e.y;
    return {
      pathStr: `M ${n.x} ${n.y} C ${d} ${B} ${v} ${K} ${e.x} ${e.y}`,
      center: { x: y, y: Z }
    };
  };
  return /* @__PURE__ */ q("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ q("defs", { children: [
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
      const e = w(n.sourceId, n.sourcePortId, !0), s = w(n.targetId, n.targetPortId, !1);
      if (!e.valid || !s.valid || e.entityId === s.entityId) return null;
      const i = g.includes(n.id), d = f === n.id, { pathStr: B, center: v } = b ? N(e, s) : x(e, s);
      return /* @__PURE__ */ q(
        "g",
        {
          onMouseEnter: () => C(n.id),
          onMouseLeave: () => C(null),
          children: [
            /* @__PURE__ */ Y(
              "path",
              {
                d: B,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (K) => {
                  K.stopPropagation(), l == null || l(n.id);
                }
              }
            ),
            /* @__PURE__ */ Y(
              "path",
              {
                d: B,
                fill: "none",
                stroke: i ? "var(--sysflow-edge-selected)" : d ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: i ? 2.5 : d ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: c ? i ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            r && d && G && /* @__PURE__ */ Y("g", { transform: `translate(${v.x}, ${v.y})`, children: /* @__PURE__ */ q(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (K) => {
                  K.preventDefault(), K.stopPropagation(), G(n);
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
}, Xt = ({
  entity: o,
  layout: t,
  direction: g = "LR",
  edges: I,
  portOptions: c,
  enableQuickAdd: u = !1,
  onAddConnectedNode: A
}) => {
  const [r, l] = ie(null);
  if (!o.ports || o.ports.length === 0)
    return null;
  const G = Le(
    o,
    t,
    g,
    I,
    c
  );
  return /* @__PURE__ */ Y(Me, { children: o.ports.map((f) => {
    const C = G.get(f.id);
    if (!C) return null;
    const b = r === f.id;
    return /* @__PURE__ */ q(
      "div",
      {
        className: "sysflow-port-hit-area",
        style: {
          left: `${C.localX}px`,
          top: `${C.localY}px`
        },
        title: `${f.label} (${C.side})`,
        onMouseEnter: () => l(f.id),
        onMouseLeave: () => l((w) => w === f.id ? null : w),
        children: [
          /* @__PURE__ */ Y("div", { className: `sysflow-port-anchor sysflow-port-${C.side}` }),
          u && b && A && /* @__PURE__ */ Y(
            "button",
            {
              type: "button",
              className: "sysflow-port-quick-add-btn",
              title: `Add connected node on "${f.label}"`,
              onPointerDown: (w) => w.stopPropagation(),
              onPointerUp: (w) => w.stopPropagation(),
              onClick: (w) => {
                w.preventDefault(), w.stopPropagation(), A(o, f.id, C.side);
              },
              children: "+"
            }
          )
        ]
      },
      f.id
    );
  }) });
}, Tt = ({
  node: o,
  layout: t,
  selected: g = !1,
  isDrawingEdge: I = !1,
  isDrawingSource: c = !1,
  direction: u = "LR",
  edges: A,
  portOptions: r,
  enableQuickAdd: l = !1,
  onAddConnectedNode: G,
  onPointerDown: f,
  onMouseEnter: C,
  onMouseLeave: b,
  onClick: w,
  customRenderer: N
}) => /* @__PURE__ */ q(
  "div",
  {
    className: `sysflow-node ${g ? "sysflow-selected" : ""} ${c ? "sysflow-drawing-source" : ""} ${o.className || ""}`,
    style: {
      transform: `translate(${t.x}px, ${t.y}px)`,
      width: `${t.width}px`,
      height: `${t.height}px`
    },
    onPointerDown: (x) => {
      if (I) {
        x.stopPropagation();
        return;
      }
      f == null || f(o, x);
    },
    onMouseEnter: () => C == null ? void 0 : C(o.id),
    onMouseLeave: () => b == null ? void 0 : b(o.id),
    onClick: w,
    children: [
      /* @__PURE__ */ Y(
        Xt,
        {
          entity: o,
          layout: t,
          direction: u,
          edges: A,
          portOptions: r,
          enableQuickAdd: l && !I,
          onAddConnectedNode: G
        }
      ),
      N ? /* @__PURE__ */ Y(N, { node: o, selected: g }) : /* @__PURE__ */ q("div", { style: { padding: "10px 14px" }, children: [
        /* @__PURE__ */ Y("div", { style: { fontWeight: 600, fontSize: "13px" }, children: o.label }),
        o.ports.length > 0 && /* @__PURE__ */ q("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
          o.ports.length,
          " Port",
          o.ports.length > 1 ? "s" : ""
        ] })
      ] })
    ]
  }
), Ot = ({
  container: o,
  layout: t,
  selected: g,
  isHovered: I = !1,
  hasChildren: c = !1,
  onToggleCollapse: u,
  onPointerDown: A,
  onMouseEnter: r,
  onMouseLeave: l,
  onClick: G,
  customRenderer: f
}) => /* @__PURE__ */ Y(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${I ? "sysflow-hovered" : ""} ${o.className || ""}`,
    style: {
      transform: `translate(${t.x}px, ${t.y}px)`,
      width: `${t.width}px`,
      height: `${t.height}px`
    },
    onPointerDown: (C) => A(o, C),
    onMouseEnter: r,
    onMouseLeave: l,
    onClick: G,
    children: f ? /* @__PURE__ */ Y(
      f,
      {
        container: o,
        selected: g,
        hasChildren: c,
        onToggleCollapse: u
      }
    ) : /* @__PURE__ */ q(Me, { children: [
      /* @__PURE__ */ q("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ Y("span", { className: "sysflow-container-title", title: o.label, children: o.label }),
        /* @__PURE__ */ Y(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (C) => C.stopPropagation(),
            onPointerUp: (C) => C.stopPropagation(),
            onClick: (C) => {
              C.stopPropagation(), u(o.id, !o.collapsed);
            },
            children: o.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !o.collapsed && !c && /* @__PURE__ */ Y("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Vt = {
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
function Qt(o) {
  if (!o) return {};
  const t = {};
  for (const [g, I] of Object.entries(o))
    if (I !== void 0) {
      const c = Vt[g] || `--sysflow-${g.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      t[c] = I;
    }
  return t;
}
const zt = new Dt(), _t = ({
  graph: o,
  onChange: t,
  history: g,
  enableShortcuts: I = !0,
  onNodeClick: c,
  layoutEngine: u,
  interactionStrategy: A = zt,
  direction: r = "TB",
  layoutOptions: l,
  portPlacementMode: G,
  routing: f,
  showEdgeArrows: C = !0,
  nodeTypes: b,
  containerTypes: w,
  zoomBounds: N,
  className: x = "",
  selectedIds: n = [],
  theme: e = "dark",
  themeTokens: s,
  style: i,
  enableQuickAdd: d,
  enableEdgeQuickAdd: B,
  isDrawingEdge: v,
  onDrawingEdgeChange: K,
  onNodeCreate: y,
  onEdgeCreate: Z,
  onNodeDelete: L,
  onContainerDelete: D,
  onEdgeDelete: h
}) => {
  var Oe, Ve, Qe;
  const S = Ie(null), H = Ie(null);
  !u && !H.current && (H.current = new Ht());
  const X = u || H.current, {
    transform: V,
    screenToWorld: m,
    onWheel: M,
    startPan: P,
    updatePan: W,
    endPan: O,
    resetTransform: j,
    zoomIn: ae,
    zoomOut: ce,
    zoomToFit: Ce,
    isPanning: F
  } = Pt(S, N), { measurements: ge, registerMeasureElement: be } = vt(o), [T, ee] = ie({ nodes: {}, containers: {} }), [Ee, Ke] = ie(!1), U = v ?? Ee, we = z(
    (a) => {
      v === void 0 && Ke(a), K == null || K(a);
    },
    [v, K]
  ), [_, Ae] = ie(null), [me, ne] = ie(null), [J, le] = ie(null);
  Pe(() => {
    U || (Ae(null), ne(null), le(null));
  }, [U]);
  const fe = Ye(
    () => ({
      direction: r,
      mode: G ?? (r === "TB" || r === "BT" ? "strict-flow" : "perimeter-optimized"),
      nodeLayouts: T.nodes
    }),
    [r, G, T.nodes]
  ), Xe = (l == null ? void 0 : l.mode) === "flow" || G === "strict-flow", [se, ke] = ie(null), Ze = Ie(null), ve = Ie(!1), {
    dragState: ue,
    hoveredContainerId: st,
    handlePointerDown: Te,
    handlePointerMove: ot,
    handlePointerUp: gt
  } = Nt(o, T, A, m, t), pe = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (a) => {
    const E = Math.random() * 16 | 0;
    return (a === "x" ? E : E & 3 | 8).toString(16);
  }), He = z(
    (a, E) => {
      if (!a.ports || a.ports.length === 0) return [];
      if (!Xe)
        return a.ports;
      const R = E === "source" ? r === "BT" ? "top" : r === "TB" ? "bottom" : r === "LR" ? "right" : "left" : r === "BT" ? "bottom" : r === "TB" ? "top" : r === "LR" ? "left" : "right", $ = T.nodes[a.id], te = $ ? Le(
        a,
        $,
        r,
        o.edges,
        fe
      ) : null;
      return a.ports.filter((oe) => {
        var re;
        return (((re = te == null ? void 0 : te.get(oe.id)) == null ? void 0 : re.side) ?? oe.side) === R;
      });
    },
    [Xe, r, T.nodes, o.edges, fe]
  ), Ne = z(
    (a, E, p, k, R) => {
      if (a === p) return;
      const $ = `${a}:${E}->${p}:${k}`;
      R != null && R.has($) || Object.values(o.edges).some(
        (oe) => oe.sourceId === a && oe.sourcePortId === E && oe.targetId === p && oe.targetPortId === k
      ) || (R == null || R.add($), t({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: a,
            sourcePortId: E,
            targetId: p,
            targetPortId: k
          }
        }
      }));
    },
    [o.edges, t]
  ), he = z(() => {
    Ae(null), ne(null), le(null), we(!1);
  }, [we]), xe = z(
    (a, E, p = /* @__PURE__ */ new Set()) => {
      for (let k = 0; k < E.length; k++) {
        const R = E[k];
        if (R === a.nodeId) continue;
        const $ = o.nodes[R];
        if (!$) continue;
        const te = He($, "destination");
        if (te.length !== 0)
          if (te.length === 1)
            Ne(
              a.nodeId,
              a.portId,
              $.id,
              te[0].id,
              p
            );
          else {
            le({
              role: "destination",
              node: $,
              candidatePorts: te,
              source: a,
              remainingDestNodeIds: E.slice(k + 1)
            });
            return;
          }
      }
      he();
    },
    [o.nodes, He, Ne, he]
  ), Se = Ye(() => {
    if (!_) return null;
    const a = o.nodes[_.nodeId], E = T.nodes[_.nodeId];
    if (!a || !E) return null;
    const k = Le(
      a,
      E,
      r,
      o.edges,
      fe
    ).get(_.portId);
    return k ? { x: k.worldX, y: k.worldY } : {
      x: E.x + E.width / 2,
      y: E.y + E.height / 2
    };
  }, [_, o.nodes, o.edges, T.nodes, r, fe]), it = z(
    (a, E, p) => {
      if (!J) {
        if (!_) {
          const k = He(a, "source");
          if (k.length === 0) return;
          k.length === 1 ? (Ae({ nodeId: a.id, portId: k[0].id }), ne(m(E, p))) : le({
            role: "source",
            node: a,
            candidatePorts: k
          });
          return;
        }
        a.id !== _.nodeId && xe(_, [a.id]);
      }
    },
    [
      J,
      _,
      He,
      m,
      xe
    ]
  ), dt = (a) => {
    if (J) {
      if (J.role === "source") {
        const E = {
          nodeId: J.node.id,
          portId: a.id
        }, p = T.nodes[J.node.id];
        if (p) {
          const R = Le(
            J.node,
            p,
            r,
            o.edges,
            fe
          ).get(a.id);
          R && ne({ x: R.worldX, y: R.worldY });
        }
        Ae(E), le(null);
      } else if (J.role === "destination" && J.source) {
        const E = J.source, p = J.remainingDestNodeIds || [];
        Ne(E.nodeId, E.portId, J.node.id, a.id), le(null), p.length > 0 ? xe(E, p) : he();
      }
    }
  };
  Pe(() => {
    const a = (p) => {
      var te, oe, de, re;
      if (p.target instanceof HTMLInputElement || p.target instanceof HTMLTextAreaElement || p.target instanceof HTMLSelectElement || p.target instanceof HTMLElement && p.target.isContentEditable)
        return;
      const k = p.ctrlKey || p.metaKey, R = p.key.toLowerCase();
      if (p.key === "Escape") {
        p.preventDefault(), ke(null), Ze.current = null, (U || J || _) && he(), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (I !== !1 && !k && !p.altKey && R === "e") {
        p.preventDefault(), U ? he() : we(!0);
        return;
      }
      if (p.key === "Delete" || p.key === "Backspace") {
        if (U) return;
        if (p.preventDefault(), n.length > 0) {
          if (L || h || D)
            for (const Q of n)
              o.nodes[Q] ? L == null || L(Q) : o.containers[Q] ? (te = D || L) == null || te(Q) : o.edges[Q] && (h == null || h(Q));
          g != null && g.deleteSelection && g.deleteSelection(n), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        }
        return;
      }
      if (I !== !1 && g) {
        if (k && R === "z") {
          p.preventDefault(), p.shiftKey ? g.redo() : g.undo();
          return;
        }
        if (k && R === "y") {
          p.preventDefault(), g.redo();
          return;
        }
        if (k && R === "c" && n[0]) {
          p.preventDefault(), (oe = g.copyEntity) == null || oe.call(g, n[0]);
          return;
        }
        if (k && R === "x" && n[0]) {
          p.preventDefault(), (de = g.cutEntity) == null || de.call(g, n[0]);
          return;
        }
        if (k && R === "v") {
          p.preventDefault(), (re = g.pasteEntity) == null || re.call(g);
          return;
        }
      }
      if (p.code === "Space" && (ve.current = !0), R === "f" && !k) {
        p.preventDefault(), Ce(T);
        return;
      }
      if (k && R === "a" && !U) {
        p.preventDefault();
        const Q = [
          ...Object.keys(o.nodes),
          ...Object.keys(o.containers)
        ];
        t({ type: "SELECTION_CHANGE", payload: { selectedIds: Q } });
        return;
      }
      const $ = Object.keys(o.nodes);
      if (!($.length === 0 || U) && p.key === "Tab") {
        p.preventDefault();
        const Q = n.length > 0 ? $.indexOf(n[0]) : -1;
        let Be;
        p.shiftKey ? Be = Q <= 0 ? $.length - 1 : Q - 1 : Be = (Q + 1) % $.length, t({ type: "SELECTION_CHANGE", payload: { selectedIds: [$[Be]] } });
      }
    }, E = (p) => {
      p.code === "Space" && (ve.current = !1);
    };
    return window.addEventListener("keydown", a), window.addEventListener("keyup", E), () => {
      window.removeEventListener("keydown", a), window.removeEventListener("keyup", E);
    };
  }, [
    o,
    T,
    n,
    Ce,
    t,
    g,
    I,
    L,
    D,
    h,
    U,
    J,
    _,
    we,
    he
  ]);
  const rt = z(
    (a, E, p) => {
      var Be;
      const k = pe(), R = pe(), $ = a.ports.find((yt) => yt.id === E), te = ((Be = $ == null ? void 0 : $.label) == null ? void 0 : Be.toLowerCase()) || "", oe = te === "in" || te.startsWith("in_") || te.endsWith("_in"), de = te === "out" || te.startsWith("out_") || te.endsWith("_out"), Q = oe ? !0 : de ? !1 : r === "BT" && p === "bottom" || r === "TB" && p === "top" || r === "LR" && p === "left" || r === "RL" && p === "right";
      y && Z ? (y({
        id: k,
        type: a.type || "FlowTask",
        label: `New ${a.type || "Task"}`,
        parentId: a.parentId ?? null
      }), Q ? Z(k, a.id, R) : Z(a.id, k, R)) : t({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: a,
          position: p,
          portId: E,
          direction: r,
          suggestedNewNodeId: k,
          suggestedNewEdgeId: R
        }
      }), t({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [k] }
      });
    },
    [r, t, y, Z]
  ), It = z(
    (a) => {
      const E = pe(), p = pe(), k = pe(), R = o.nodes[a.sourceId], $ = (R == null ? void 0 : R.type) || "FlowTask";
      y && Z && h ? (h(a.id), y({
        id: E,
        type: $,
        label: `New ${$}`,
        parentId: (R == null ? void 0 : R.parentId) ?? null
      }), Z(a.sourceId, E, p), Z(E, a.targetId, k)) : t({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: a,
          direction: r,
          suggestedNewNodeId: E,
          suggestedNewEdge1Id: p,
          suggestedNewEdge2Id: k
        }
      }), t({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [E] }
      });
    },
    [r, o.nodes, t, y, Z, h]
  );
  Pe(() => {
    let a = !1, E = 16 / 9;
    if (S.current) {
      const k = S.current.getBoundingClientRect();
      k.width > 0 && k.height > 0 && (E = k.width / k.height);
    }
    const p = {
      direction: r,
      aspectRatio: E,
      ...l
    };
    return X.execute(o, ge, p).then((k) => {
      a || ee(k);
    }), () => {
      a = !0;
    };
  }, [o, ge, X, r, l]);
  const ct = (a) => {
    if (a.button === 1 || ve.current) {
      P(a.clientX, a.clientY);
      return;
    }
    const E = a.target, p = E === S.current || E.classList.contains("sysflow-viewport") || E.classList.contains("sysflow-dom-layer") || E.tagName.toLowerCase() === "svg";
    if (a.button === 0 && p) {
      a.currentTarget.setPointerCapture(a.pointerId);
      const k = m(a.clientX, a.clientY);
      Ze.current = { x: a.clientX, y: a.clientY }, ke({
        startX: k.x,
        startY: k.y,
        currentX: k.x,
        currentY: k.y
      }), U || t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, lt = (a) => {
    if (U && _ && ne(m(a.clientX, a.clientY)), F.current)
      W(a.clientX, a.clientY);
    else if (se) {
      const E = m(a.clientX, a.clientY);
      ke(
        (p) => p ? { ...p, currentX: E.x, currentY: E.y } : null
      );
    } else !U && ue && ot(a);
  }, at = (a) => {
    if (a.currentTarget.hasPointerCapture(a.pointerId) && a.currentTarget.releasePointerCapture(a.pointerId), F.current && O(), se) {
      const E = Math.min(se.startX, se.currentX), p = Math.min(se.startY, se.currentY), k = Math.max(se.startX, se.currentX), R = Math.max(se.startY, se.currentY), $ = Ze.current, oe = ($ ? Math.hypot(a.clientX - $.x, a.clientY - $.y) : 0) > 5 || k - E > 4 || R - p > 4;
      if (U) {
        if (!oe)
          he(), t({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        else if (_) {
          const de = [];
          for (const [re, Q] of Object.entries(T.nodes))
            re !== _.nodeId && Q.x < k && Q.x + Q.width > E && Q.y < R && Q.y + Q.height > p && de.push(re);
          de.length > 0 && xe(_, de);
        }
      } else if (oe) {
        const de = [];
        for (const [re, Q] of Object.entries(T.nodes))
          Q.x < k && Q.x + Q.width > E && Q.y < R && Q.y + Q.height > p && de.push(re);
        for (const [re, Q] of Object.entries(T.containers))
          Q.x < k && Q.x + Q.width > E && Q.y < R && Q.y + Q.height > p && de.push(re);
        t({ type: "SELECTION_CHANGE", payload: { selectedIds: de } });
      }
      ke(null), Ze.current = null;
    }
    !U && ue && gt(a);
  }, Ct = d ?? (l == null ? void 0 : l.mode) === "flow", At = (B ?? d ?? (l == null ? void 0 : l.mode) === "flow") && !U, ut = Object.values(o.containers), ft = e === "light" ? "sysflow-theme-light" : "sysflow-theme-dark", ht = Ye(() => ({
    outline: "none",
    ...Qt(s),
    ...i
  }), [s, i]);
  return /* @__PURE__ */ q(
    "div",
    {
      ref: S,
      className: `sysflow-canvas ${ft} ${U ? "sysflow-drawing-edge" : ""} ${x}`,
      "data-theme": e,
      style: ht,
      onWheel: M,
      onPointerDown: ct,
      onPointerMove: lt,
      onPointerUp: at,
      tabIndex: 0,
      children: [
        /* @__PURE__ */ Y(
          Mt,
          {
            graph: o,
            registerMeasureElement: be,
            nodeTypes: b,
            containerTypes: w
          }
        ),
        U && /* @__PURE__ */ Y(
          "div",
          {
            className: "sysflow-drawing-banner",
            onPointerDown: (a) => a.stopPropagation(),
            children: /* @__PURE__ */ Y("span", { children: _ ? `Source: "${((Oe = o.nodes[_.nodeId]) == null ? void 0 : Oe.label) || _.nodeId}" — Click destination node or drag marquee to connect (Esc to cancel)` : "Edge Drawing Mode — Click a source node (Esc or click background to exit)" })
          }
        ),
        /* @__PURE__ */ q(
          "div",
          {
            className: "sysflow-controls-panel",
            onPointerDown: (a) => a.stopPropagation(),
            children: [
              /* @__PURE__ */ Y("button", { onClick: ae, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
              /* @__PURE__ */ Y("button", { onClick: ce, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
              /* @__PURE__ */ q(
                "button",
                {
                  onClick: j,
                  className: "sysflow-control-btn",
                  title: "Reset Zoom (0)",
                  children: [
                    Math.round(V.zoom * 100),
                    "%"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ q(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${V.x}px, ${V.y}px) scale(${V.zoom})`
            },
            children: [
              se && /* @__PURE__ */ Y(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min(se.startX, se.currentX)}px`,
                    top: `${Math.min(se.startY, se.currentY)}px`,
                    width: `${Math.abs(se.currentX - se.startX)}px`,
                    height: `${Math.abs(se.currentY - se.startY)}px`,
                    backgroundColor: "color-mix(in srgb, var(--sysflow-node-selected, #aa9460) 15%, transparent)",
                    border: "1px dashed var(--sysflow-node-selected, #aa9460)",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              U && Se && me && /* @__PURE__ */ q("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none", zIndex: 80 }, children: [
                /* @__PURE__ */ Y(
                  "line",
                  {
                    x1: Se.x,
                    y1: Se.y,
                    x2: me.x,
                    y2: me.y,
                    stroke: "var(--sysflow-edge-selected, #38bdf8)",
                    strokeWidth: 2,
                    strokeDasharray: "6 4"
                  }
                ),
                /* @__PURE__ */ Y(
                  "circle",
                  {
                    cx: Se.x,
                    cy: Se.y,
                    r: 4,
                    fill: "var(--sysflow-edge-selected, #38bdf8)"
                  }
                )
              ] }),
              /* @__PURE__ */ Y(
                "div",
                {
                  className: "sysflow-containers-layer",
                  style: { position: "absolute", zIndex: 1, pointerEvents: "none" },
                  children: ut.map((a) => {
                    const E = T.containers[a.id];
                    if (!E) return null;
                    const p = Object.values(o.nodes).some((k) => k.parentId === a.id) || Object.values(o.containers).some((k) => k.parentId === a.id);
                    return /* @__PURE__ */ Y(
                      Ot,
                      {
                        container: a,
                        layout: E,
                        selected: n.includes(a.id),
                        isHovered: st === a.id,
                        hasChildren: p,
                        customRenderer: a.type ? w == null ? void 0 : w[a.type] : void 0,
                        onToggleCollapse: (k, R) => {
                          U || t({
                            type: "CONTAINER_TOGGLE_COLLAPSE",
                            payload: { containerId: k, collapsed: R }
                          });
                        },
                        onPointerDown: (k, R) => {
                          if (U) {
                            R.stopPropagation();
                            return;
                          }
                          Te(k, R);
                        },
                        onMouseEnter: () => {
                        },
                        onMouseLeave: () => {
                        },
                        onClick: (k) => {
                          k.stopPropagation(), !U && t({
                            type: "SELECTION_CHANGE",
                            payload: { selectedIds: [a.id] }
                          });
                        }
                      },
                      a.id
                    );
                  })
                }
              ),
              /* @__PURE__ */ Y(
                Rt,
                {
                  graph: o,
                  layout: T,
                  selectedIds: n,
                  direction: r,
                  showArrows: C,
                  routing: f,
                  portOptions: fe,
                  enableEdgeQuickAdd: At,
                  onInsertNodeOnEdge: It,
                  onEdgeClick: (a) => {
                    U || t({ type: "SELECTION_CHANGE", payload: { selectedIds: [a] } });
                  }
                }
              ),
              /* @__PURE__ */ Y(
                "div",
                {
                  className: "sysflow-nodes-layer",
                  style: { position: "absolute", zIndex: 10, pointerEvents: "none" },
                  children: Object.values(o.nodes).map((a) => {
                    const E = T.nodes[a.id];
                    return E ? /* @__PURE__ */ Y(
                      Tt,
                      {
                        node: a,
                        layout: E,
                        direction: r,
                        edges: o.edges,
                        portOptions: fe,
                        selected: n.includes(a.id),
                        isDrawingEdge: U,
                        isDrawingSource: (_ == null ? void 0 : _.nodeId) === a.id,
                        customRenderer: a.type ? b == null ? void 0 : b[a.type] : void 0,
                        enableQuickAdd: Ct,
                        onAddConnectedNode: rt,
                        onPointerDown: Te,
                        onMouseEnter: () => {
                        },
                        onMouseLeave: () => {
                        },
                        onClick: (p) => {
                          if (p.stopPropagation(), U) {
                            it(a, p.clientX, p.clientY);
                            return;
                          }
                          t({
                            type: "SELECTION_CHANGE",
                            payload: { selectedIds: [a.id] }
                          }), c == null || c(a.id, a);
                        }
                      },
                      a.id
                    ) : null;
                  })
                }
              ),
              !U && ue && /* @__PURE__ */ Y(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${ue.ghostPosition.x}px, ${ue.ghostPosition.y}px)`,
                    width: `${((Ve = ge.get(ue.draggedEntity.id)) == null ? void 0 : Ve.width) || 200}px`,
                    height: `${((Qe = ge.get(ue.draggedEntity.id)) == null ? void 0 : Qe.height) || 64}px`
                  },
                  children: /* @__PURE__ */ Y("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: ue.draggedEntity.label })
                }
              )
            ]
          }
        ),
        J && /* @__PURE__ */ Y(
          "div",
          {
            className: "sysflow-port-modal-backdrop",
            onPointerDown: (a) => a.stopPropagation(),
            onClick: (a) => {
              a.stopPropagation(), le(null);
            },
            children: /* @__PURE__ */ q(
              "div",
              {
                className: "sysflow-port-modal",
                onClick: (a) => a.stopPropagation(),
                children: [
                  /* @__PURE__ */ q("div", { className: "sysflow-port-modal-header", children: [
                    /* @__PURE__ */ Y("h4", { style: { margin: 0, fontSize: 15 }, children: J.role === "source" ? "Select Source Port" : "Select Destination Port" }),
                    /* @__PURE__ */ q("span", { style: { fontSize: 12, color: "var(--sysflow-node-subtext)" }, children: [
                      "Node: ",
                      /* @__PURE__ */ Y("strong", { children: J.node.label }),
                      J.remainingDestNodeIds && J.remainingDestNodeIds.length > 0 && /* @__PURE__ */ q(Me, { children: [
                        " (",
                        J.remainingDestNodeIds.length,
                        " more queued)"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ Y("div", { className: "sysflow-port-modal-list", children: J.candidatePorts.map((a) => {
                    var E;
                    return /* @__PURE__ */ q(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-port-modal-option",
                        onClick: () => dt(a),
                        children: [
                          /* @__PURE__ */ Y("span", { style: { fontWeight: 600 }, children: a.label }),
                          /* @__PURE__ */ q("span", { style: { fontSize: 11, opacity: 0.7 }, children: [
                            a.side ? `side: ${a.side}` : a.id,
                            (E = a.data) != null && E.busWidth ? ` • ${String(a.data.busWidth)}` : ""
                          ] })
                        ]
                      },
                      a.id
                    );
                  }) }),
                  /* @__PURE__ */ q("div", { className: "sysflow-port-modal-footer", children: [
                    J.role === "destination" && J.remainingDestNodeIds && J.remainingDestNodeIds.length > 0 && /* @__PURE__ */ Y(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-control-btn",
                        onClick: () => {
                          const a = J.source, E = J.remainingDestNodeIds;
                          le(null), xe(a, E);
                        },
                        children: "Skip Node"
                      }
                    ),
                    /* @__PURE__ */ Y(
                      "button",
                      {
                        type: "button",
                        className: "sysflow-control-btn",
                        onClick: () => le(null),
                        children: "Cancel"
                      }
                    )
                  ] })
                ]
              }
            )
          }
        )
      ]
    }
  );
};
export {
  Ut as EdgeRewireStrategy,
  Ot as GraphContainer,
  Rt as GraphEdgeLayer,
  Tt as GraphNode,
  Xt as GraphPortLayer,
  Dt as ReparentStrategy,
  Kt as SugiyamaEngine,
  _t as SysFlowCanvas,
  Ht as WorkerBridge,
  Le as computeEntityPortLocations,
  ze as pruneDanglingEdges,
  et as resolveEffectiveEntityId,
  Qt as themeTokensToStyle,
  Pt as useCanvasTransform,
  Nt as useDragGesture,
  Jt as useGraphHistory,
  vt as useMeasurement
};
