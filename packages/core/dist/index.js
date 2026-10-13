var ge = Object.defineProperty;
var ie = (s, o, g) => o in s ? ge(s, o, { enumerable: !0, configurable: !0, writable: !0, value: g }) : s[o] = g;
var Ct = (s, o, g) => ie(s, typeof o != "symbol" ? o + "" : o, g);
import { useState as U, useRef as tt, useCallback as Y, useEffect as mt, useMemo as de } from "react";
import { jsxs as F, jsx as E, Fragment as Bt } from "react/jsx-runtime";
function re(s, o, g, I) {
  const n = (d) => {
    const r = g.find(
      (B) => B.sourceId === o && B.sourcePortId === d || B.targetId === o && B.targetPortId === d
    );
    if (!r) return null;
    const f = r.sourceId === o ? r.targetId : r.sourceId, a = I[f];
    return a ? { x: a.x + a.width / 2, y: a.y + a.height / 2 } : null;
  };
  ["left", "right"].forEach((d) => {
    s[d].sort((r, f) => {
      var A, C;
      const a = ((A = n(r.id)) == null ? void 0 : A.y) ?? 0, B = ((C = n(f.id)) == null ? void 0 : C.y) ?? 0;
      return a - B;
    });
  }), ["top", "bottom"].forEach((d) => {
    s[d].sort((r, f) => {
      var A, C;
      const a = ((A = n(r.id)) == null ? void 0 : A.x) ?? 0, B = ((C = n(f.id)) == null ? void 0 : C.x) ?? 0;
      return a - B;
    });
  });
}
function Ie(s, o, g, I, n, d) {
  if (!n || !d)
    return g ? "left" : "right";
  const r = I.find(
    (C) => g ? C.targetId === s && C.targetPortId === o : C.sourceId === s && C.sourcePortId === o
  );
  if (!r) return g ? "left" : "right";
  const f = g ? r.sourceId : r.targetId, a = n[f];
  if (!a) return g ? "left" : "right";
  const B = a.x + a.width / 2 - (d.x + d.width / 2), A = a.y + a.height / 2 - (d.y + d.height / 2);
  return Math.abs(B) > Math.abs(A) ? B > 0 ? "right" : "left" : A > 0 ? "bottom" : "top";
}
function Gt(s, o, g = "LR", I, n) {
  const d = /* @__PURE__ */ new Map();
  if (!s || !o || !s.ports || s.ports.length === 0)
    return d;
  const r = (n == null ? void 0 : n.direction) || g, f = r === "TB" || r === "BT", a = (n == null ? void 0 : n.mode) || (f ? "strict-flow" : "perimeter-optimized"), B = I ? Array.isArray(I) ? I : Object.values(I) : [], A = {
    left: [],
    right: [],
    top: [],
    bottom: []
  }, C = new Set(
    B.filter((m) => m.targetId === s.id).map((m) => m.targetPortId)
  );
  new Set(
    B.filter((m) => m.sourceId === s.id).map((m) => m.sourcePortId)
  ), s.ports.forEach((m) => {
    let S = m.side || "auto";
    if (S !== "auto") {
      A[S].push(m);
      return;
    }
    if (a === "strict-flow") {
      const c = C.has(m.id) || m.label.toLowerCase().includes("in");
      switch (r) {
        case "BT":
          S = c ? "bottom" : "top";
          break;
        case "TB":
          S = c ? "top" : "bottom";
          break;
        case "RL":
          S = c ? "right" : "left";
          break;
        case "LR":
        default:
          S = c ? "left" : "right";
          break;
      }
    } else
      S = Ie(
        s.id,
        m.id,
        C.has(m.id),
        B,
        n == null ? void 0 : n.nodeLayouts,
        o
      );
    A[S].push(m);
  }), a === "perimeter-optimized" && (n != null && n.nodeLayouts) && re(A, s.id, B, n.nodeLayouts);
  const x = (m, S) => {
    const c = m.length;
    m.forEach((t, e) => {
      let i = 0, u = 0;
      S === "left" || S === "right" ? (u = o.height / (c + 1) * (e + 1), i = S === "left" ? 0 : o.width) : (i = o.width / (c + 1) * (e + 1), u = S === "top" ? 0 : o.height), d.set(t.id, {
        portId: t.id,
        side: S,
        localX: i,
        localY: u,
        worldX: o.x + i,
        worldY: o.y + u
      });
    });
  };
  return x(A.left, "left"), x(A.right, "right"), x(A.top, "top"), x(A.bottom, "bottom"), d;
}
function Et(s) {
  const o = {}, g = (I) => {
    var d;
    const n = s.nodes[I];
    return new Set(((d = n == null ? void 0 : n.ports) == null ? void 0 : d.map((r) => r.id)) || []);
  };
  for (const [I, n] of Object.entries(s.edges)) {
    const d = g(n.sourceId), r = g(n.targetId), f = d.has(n.sourcePortId), a = r.has(n.targetPortId);
    f && a && (o[I] = n);
  }
  return {
    ...s,
    edges: o
  };
}
class ce {
  static assignDynamicPortSides(o, g, I) {
    var d, r;
    const n = (f) => g[f] || I[f];
    for (const f of Object.values(o.edges)) {
      const a = n(f.sourceId), B = n(f.targetId);
      if (!a || !B) continue;
      const A = o.nodes[f.sourceId] || o.containers[f.sourceId], C = o.nodes[f.targetId] || o.containers[f.targetId], x = B.x + B.width / 2 - (a.x + a.width / 2), m = B.y + B.height / 2 - (a.y + a.height / 2), S = Math.abs(x) > Math.abs(m) * 1.25, c = (d = A == null ? void 0 : A.ports) == null ? void 0 : d.find((e) => e.id === f.sourcePortId);
      c && (!c.side || c.side === "auto") && (S ? c.side = x >= 0 ? "right" : "left" : c.side = m >= 0 ? "bottom" : "top");
      const t = (r = C == null ? void 0 : C.ports) == null ? void 0 : r.find((e) => e.id === f.targetPortId);
      t && (!t.side || t.side === "auto") && (S ? t.side = x >= 0 ? "left" : "right" : t.side = m >= 0 ? "top" : "bottom");
    }
  }
}
const Zt = 22, Kt = 18, Dt = 38, bt = 210, vt = 36, ae = 180, le = 54, Ht = 260, Pt = 160;
class xt {
  static execute(o, g, I) {
    var t;
    const n = {}, d = {}, r = (e) => {
      var w, l, h, y, Z;
      const i = !!o.containers[e], u = !!((w = o.containers[e]) != null && w.collapsed);
      return i && u ? { width: bt, height: vt } : i && !u ? {
        width: ((l = I.get(e)) == null ? void 0 : l.width) || Ht,
        height: ((h = I.get(e)) == null ? void 0 : h.height) || Pt
      } : {
        width: ((y = I.get(e)) == null ? void 0 : y.width) || ae,
        height: ((Z = I.get(e)) == null ? void 0 : Z.height) || le
      };
    }, f = /* @__PURE__ */ new Map();
    for (const [e, i] of Object.entries(o.nodes)) {
      const u = i.parentId ?? null;
      f.has(u) || f.set(u, []), f.get(u).push(e);
    }
    for (const [e, i] of Object.entries(o.containers)) {
      const u = i.parentId ?? null;
      f.has(u) || f.set(u, []), f.get(u).push(e);
    }
    const a = xt.getContainerDepths(o), B = Object.keys(o.containers).sort(
      (e, i) => (a.get(i) || 0) - (a.get(e) || 0)
    ), A = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), x = (e) => A.has(e) ? A.get(e) : r(e);
    for (const e of B) {
      if (!!((t = o.containers[e]) != null && t.collapsed)) {
        A.set(e, {
          width: bt,
          height: vt
        });
        continue;
      }
      const u = f.get(e) || [];
      if (u.length === 0) {
        A.set(e, {
          width: Ht,
          height: Pt
        });
        continue;
      }
      const w = g.arrange(e, u, o, x);
      for (const y of w.boxes)
        C.set(y.id, y);
      const l = Math.max(w.width + Zt * 2, bt), h = w.height + Dt + Kt * 2;
      A.set(e, { width: l, height: h });
    }
    const m = f.get(null) || [];
    let S = [];
    m.length > 0 && (S = g.arrange(null, m, o, x).boxes.map((i) => ({
      ...i,
      localX: i.localX + 60,
      localY: i.localY + 60
    })));
    const c = (e, i, u, w, l) => {
      var Z;
      const h = !!o.containers[e], y = { id: e, x: i, y: u, width: w, height: l };
      if (h) {
        if (d[e] = y, (Z = o.containers[e]) != null && Z.collapsed) return;
        const H = i + Zt, p = u + Dt + Kt, L = f.get(e) || [];
        for (const P of L) {
          const N = C.get(P);
          N && c(
            P,
            H + N.localX,
            p + N.localY,
            N.width,
            N.height
          );
        }
      } else
        n[e] = y;
    };
    for (const e of S)
      c(e.id, e.localX, e.localY, e.width, e.height);
    return ce.assignDynamicPortSides(o, n, d), { nodes: n, containers: d };
  }
  static getContainerDepths(o) {
    const g = /* @__PURE__ */ new Map(), I = (n) => {
      var f;
      if (g.has(n)) return g.get(n);
      const d = (f = o.containers[n]) == null ? void 0 : f.parentId;
      if (!d || !o.containers[d])
        return g.set(n, 0), 0;
      const r = 1 + I(d);
      return g.set(n, r), r;
    };
    for (const n of Object.keys(o.containers))
      I(n);
    return g;
  }
}
const Ce = 36, ue = 28;
class he {
  constructor(o = {}) {
    this.options = o;
  }
  arrange(o, g, I, n) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const d = this.options.direction ?? "TB", r = d === "TB" || d === "BT", f = d === "BT" || d === "RL", a = new Set(g), B = Object.values(I.edges).filter(
      (h) => a.has(h.sourceId) && a.has(h.targetId)
    ), A = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
    for (const h of g)
      A.set(h, 0), C.set(h, []);
    for (const h of B)
      C.get(h.sourceId).push(h.targetId), A.set(h.targetId, (A.get(h.targetId) || 0) + 1);
    const x = /* @__PURE__ */ new Map(), m = g.filter((h) => (A.get(h) || 0) === 0);
    for (const h of m) x.set(h, 0);
    const S = /* @__PURE__ */ new Set();
    for (; m.length > 0; ) {
      const h = m.shift();
      S.add(h);
      const y = x.get(h);
      for (const Z of C.get(h)) {
        const H = Math.max(x.get(Z) || 0, y + 1);
        x.set(Z, H), A.set(Z, A.get(Z) - 1), A.get(Z) === 0 && m.push(Z);
      }
    }
    for (const h of g)
      S.has(h) || x.set(h, 0);
    const c = /* @__PURE__ */ new Map();
    for (const [h, y] of x.entries())
      c.has(y) || c.set(y, []), c.get(y).push(h);
    const t = Array.from(c.keys()).sort((h, y) => h - y), e = f ? [...t].reverse() : t, i = [];
    let u = 0;
    for (const h of e) {
      const y = c.get(h);
      let Z = 0, H = 0;
      for (const p of y) {
        const L = n(p), P = r ? L.height : L.width, N = r ? L.width : L.height, W = r ? H : u, M = r ? u : H;
        i.push({ id: p, localX: W, localY: M, width: L.width, height: L.height }), H += N + ue, Z = Math.max(Z, P);
      }
      u += Z + Ce;
    }
    const w = Math.max(...i.map((h) => h.localX + h.width), 0), l = Math.max(...i.map((h) => h.localY + h.height), 0);
    return { width: w, height: l, boxes: i };
  }
}
const gt = 32, Nt = 24;
class Ae {
  constructor(o = 1.55) {
    this.targetAspect = o;
  }
  arrange(o, g, I, n) {
    if (g.length === 0)
      return { width: 0, height: 0, boxes: [] };
    const d = g.map((f) => {
      const a = n(f);
      return { id: f, width: a.width, height: a.height };
    }), r = this.findBestTightPacking(d, this.targetAspect);
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
    const I = o.reduce((C, x) => C + x.width * x.height, 0), n = Math.max(...o.map((C) => C.width)), d = [...o].sort((C, x) => x.width - C.width), r = /* @__PURE__ */ new Set(), f = o.reduce((C, x) => C + x.width, 0) + (o.length - 1) * gt;
    r.add(f), r.add(n);
    const a = Math.max(n, Math.sqrt(I * g));
    r.add(a), r.add(a * 0.85), r.add(a * 1.15);
    const B = Math.min(o.length, 6);
    for (let C = 2; C <= B; C++) {
      let x = 0;
      for (let m = 0; m < C && m < d.length; m++)
        x += d[m].width;
      x += (C - 1) * gt, x >= n && r.add(x);
    }
    let A = null;
    for (const C of r) {
      const x = this.simulateSkylinePacking(o, C), m = x.width * x.height, S = Math.max(0, m - I), c = x.width / Math.max(1, x.height), t = Math.abs(Math.log(c / g)), e = S / I * 2 + t * 0.25;
      x.score = e, (!A || e < A.score) && (A = x);
    }
    return A;
  }
  simulateSkylinePacking(o, g) {
    const I = [...o].sort((a, B) => B.height - a.height), n = [{ x: 0, width: g, y: 0 }], d = [];
    for (const a of I) {
      let B = 1 / 0, A = -1;
      for (let e = 0; e < n.length; e++) {
        if (n[e].x + a.width > g) continue;
        let u = 0, w = 0;
        for (let l = e; l < n.length && w < a.width; l++)
          u = Math.max(u, n[l].y), w += n[l].width;
        u < B && (B = u, A = e);
      }
      if (A === -1) {
        const e = Math.max(...n.map((u) => u.y)), i = e === 0 ? 0 : e + Nt;
        d.push({ id: a.id, localX: 0, localY: i, width: a.width, height: a.height }), n.length = 0, n.push({ x: 0, width: a.width + gt, y: i + a.height }), g > a.width + gt && n.push({
          x: a.width + gt,
          width: g - (a.width + gt),
          y: 0
        });
        continue;
      }
      const C = n[A].x, x = B === 0 ? 0 : B + Nt;
      d.push({ id: a.id, localX: C, localY: x, width: a.width, height: a.height });
      const m = a.width + gt, S = x + a.height, c = { x: C, width: m, y: S }, t = [];
      for (const e of n)
        e.x + e.width <= C || e.x >= C + m ? t.push(e) : (e.x < C && t.push({ x: e.x, width: C - e.x, y: e.y }), e.x + e.width > C + m && t.push({
          x: C + m,
          width: e.x + e.width - (C + m),
          y: e.y
        }));
      t.push(c), t.sort((e, i) => e.x - i.x), n.length = 0, n.push(...t);
    }
    const r = Math.max(...d.map((a) => a.localX + a.width), 0), f = Math.max(...d.map((a) => a.localY + a.height), 0);
    return { width: r, height: f, boxes: d, score: 0 };
  }
}
function Yt(s, o, g) {
  var d, r;
  let I = s, n = null;
  for (; I; )
    g.has(I) && (n = I), I = ((d = o.nodes[I]) == null ? void 0 : d.parentId) ?? ((r = o.containers[I]) == null ? void 0 : r.parentId) ?? void 0;
  return n ?? s;
}
class ye {
  async execute(o, g, I) {
    const n = Object.values(o.containers), d = new Set(
      n.filter((C) => !!C.collapsed).map((C) => C.id)
    ), r = {};
    for (const [C, x] of Object.entries(o.edges)) {
      const m = Yt(x.sourceId, o, d), S = Yt(x.targetId, o, d);
      m !== S && (r[C] = {
        ...x,
        sourceId: m,
        targetId: S
      });
    }
    const f = {
      ...o,
      edges: r
    }, a = Object.keys(o.containers).length, A = (I != null && I.mode && I.mode !== "auto" ? I.mode : a > 0 ? "concurrent" : "flow") === "concurrent" ? new Ae((I == null ? void 0 : I.aspectRatio) ?? 1.55) : new he(I);
    return xt.execute(f, A, g);
  }
}
const Mt = "Y2xhc3MgTCB7CiAgc3RhdGljIGFzc2lnbkR5bmFtaWNQb3J0U2lkZXMoZSwgbCwgYSkgewogICAgdmFyIHIsIGQ7CiAgICBjb25zdCBuID0gKGgpID0+IGxbaF0gfHwgYVtoXTsKICAgIGZvciAoY29uc3QgaCBvZiBPYmplY3QudmFsdWVzKGUuZWRnZXMpKSB7CiAgICAgIGNvbnN0IG8gPSBuKGguc291cmNlSWQpLCBwID0gbihoLnRhcmdldElkKTsKICAgICAgaWYgKCFvIHx8ICFwKSBjb250aW51ZTsKICAgICAgY29uc3QgZyA9IGUubm9kZXNbaC5zb3VyY2VJZF0gfHwgZS5jb250YWluZXJzW2guc291cmNlSWRdLCBzID0gZS5ub2Rlc1toLnRhcmdldElkXSB8fCBlLmNvbnRhaW5lcnNbaC50YXJnZXRJZF0sIGkgPSBwLnggKyBwLndpZHRoIC8gMiAtIChvLnggKyBvLndpZHRoIC8gMiksIGYgPSBwLnkgKyBwLmhlaWdodCAvIDIgLSAoby55ICsgby5oZWlnaHQgLyAyKSwgTSA9IE1hdGguYWJzKGkpID4gTWF0aC5hYnMoZikgKiAxLjI1LCBtID0gKHIgPSBnID09IG51bGwgPyB2b2lkIDAgOiBnLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogci5maW5kKCh0KSA9PiB0LmlkID09PSBoLnNvdXJjZVBvcnRJZCk7CiAgICAgIG0gJiYgKCFtLnNpZGUgfHwgbS5zaWRlID09PSAiYXV0byIpICYmIChNID8gbS5zaWRlID0gaSA+PSAwID8gInJpZ2h0IiA6ICJsZWZ0IiA6IG0uc2lkZSA9IGYgPj0gMCA/ICJib3R0b20iIDogInRvcCIpOwogICAgICBjb25zdCB4ID0gKGQgPSBzID09IG51bGwgPyB2b2lkIDAgOiBzLnBvcnRzKSA9PSBudWxsID8gdm9pZCAwIDogZC5maW5kKCh0KSA9PiB0LmlkID09PSBoLnRhcmdldFBvcnRJZCk7CiAgICAgIHggJiYgKCF4LnNpZGUgfHwgeC5zaWRlID09PSAiYXV0byIpICYmIChNID8geC5zaWRlID0gaSA+PSAwID8gImxlZnQiIDogInJpZ2h0IiA6IHguc2lkZSA9IGYgPj0gMCA/ICJ0b3AiIDogImJvdHRvbSIpOwogICAgfQogIH0KfQpjb25zdCBTID0gMjIsIGsgPSAxOCwgTiA9IDM4LCBZID0gMjEwLCBCID0gMzYsIEYgPSAxODAsIFUgPSA1NCwgSCA9IDI2MCwgUiA9IDE2MDsKY2xhc3MgdiB7CiAgc3RhdGljIGV4ZWN1dGUoZSwgbCwgYSkgewogICAgdmFyIHg7CiAgICBjb25zdCBuID0ge30sIHIgPSB7fSwgZCA9ICh0KSA9PiB7CiAgICAgIHZhciBBLCBDLCBjLCBJLCB5OwogICAgICBjb25zdCB1ID0gISFlLmNvbnRhaW5lcnNbdF0sIHcgPSAhISgoQSA9IGUuY29udGFpbmVyc1t0XSkgIT0gbnVsbCAmJiBBLmNvbGxhcHNlZCk7CiAgICAgIHJldHVybiB1ICYmIHcgPyB7IHdpZHRoOiBZLCBoZWlnaHQ6IEIgfSA6IHUgJiYgIXcgPyB7CiAgICAgICAgd2lkdGg6ICgoQyA9IGEuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogQy53aWR0aCkgfHwgSCwKICAgICAgICBoZWlnaHQ6ICgoYyA9IGEuZ2V0KHQpKSA9PSBudWxsID8gdm9pZCAwIDogYy5oZWlnaHQpIHx8IFIKICAgICAgfSA6IHsKICAgICAgICB3aWR0aDogKChJID0gYS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiBJLndpZHRoKSB8fCBGLAogICAgICAgIGhlaWdodDogKCh5ID0gYS5nZXQodCkpID09IG51bGwgPyB2b2lkIDAgOiB5LmhlaWdodCkgfHwgVQogICAgICB9OwogICAgfSwgaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IFt0LCB1XSBvZiBPYmplY3QuZW50cmllcyhlLm5vZGVzKSkgewogICAgICBjb25zdCB3ID0gdS5wYXJlbnRJZCA/PyBudWxsOwogICAgICBoLmhhcyh3KSB8fCBoLnNldCh3LCBbXSksIGguZ2V0KHcpLnB1c2godCk7CiAgICB9CiAgICBmb3IgKGNvbnN0IFt0LCB1XSBvZiBPYmplY3QuZW50cmllcyhlLmNvbnRhaW5lcnMpKSB7CiAgICAgIGNvbnN0IHcgPSB1LnBhcmVudElkID8/IG51bGw7CiAgICAgIGguaGFzKHcpIHx8IGguc2V0KHcsIFtdKSwgaC5nZXQodykucHVzaCh0KTsKICAgIH0KICAgIGNvbnN0IG8gPSB2LmdldENvbnRhaW5lckRlcHRocyhlKSwgcCA9IE9iamVjdC5rZXlzKGUuY29udGFpbmVycykuc29ydCgKICAgICAgKHQsIHUpID0+IChvLmdldCh1KSB8fCAwKSAtIChvLmdldCh0KSB8fCAwKQogICAgKSwgZyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBpID0gKHQpID0+IGcuaGFzKHQpID8gZy5nZXQodCkgOiBkKHQpOwogICAgZm9yIChjb25zdCB0IG9mIHApIHsKICAgICAgaWYgKCEhKCh4ID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIHguY29sbGFwc2VkKSkgewogICAgICAgIGcuc2V0KHQsIHsKICAgICAgICAgIHdpZHRoOiBZLAogICAgICAgICAgaGVpZ2h0OiBCCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgdyA9IGguZ2V0KHQpIHx8IFtdOwogICAgICBpZiAody5sZW5ndGggPT09IDApIHsKICAgICAgICBnLnNldCh0LCB7CiAgICAgICAgICB3aWR0aDogSCwKICAgICAgICAgIGhlaWdodDogUgogICAgICAgIH0pOwogICAgICAgIGNvbnRpbnVlOwogICAgICB9CiAgICAgIGNvbnN0IEEgPSBsLmFycmFuZ2UodCwgdywgZSwgaSk7CiAgICAgIGZvciAoY29uc3QgSSBvZiBBLmJveGVzKQogICAgICAgIHMuc2V0KEkuaWQsIEkpOwogICAgICBjb25zdCBDID0gTWF0aC5tYXgoQS53aWR0aCArIFMgKiAyLCBZKSwgYyA9IEEuaGVpZ2h0ICsgTiArIGsgKiAyOwogICAgICBnLnNldCh0LCB7IHdpZHRoOiBDLCBoZWlnaHQ6IGMgfSk7CiAgICB9CiAgICBjb25zdCBmID0gaC5nZXQobnVsbCkgfHwgW107CiAgICBsZXQgTSA9IFtdOwogICAgZi5sZW5ndGggPiAwICYmIChNID0gbC5hcnJhbmdlKG51bGwsIGYsIGUsIGkpLmJveGVzLm1hcCgodSkgPT4gKHsKICAgICAgLi4udSwKICAgICAgbG9jYWxYOiB1LmxvY2FsWCArIDYwLAogICAgICBsb2NhbFk6IHUubG9jYWxZICsgNjAKICAgIH0pKSk7CiAgICBjb25zdCBtID0gKHQsIHUsIHcsIEEsIEMpID0+IHsKICAgICAgdmFyIHk7CiAgICAgIGNvbnN0IGMgPSAhIWUuY29udGFpbmVyc1t0XSwgSSA9IHsgaWQ6IHQsIHg6IHUsIHk6IHcsIHdpZHRoOiBBLCBoZWlnaHQ6IEMgfTsKICAgICAgaWYgKGMpIHsKICAgICAgICBpZiAoclt0XSA9IEksICh5ID0gZS5jb250YWluZXJzW3RdKSAhPSBudWxsICYmIHkuY29sbGFwc2VkKSByZXR1cm47CiAgICAgICAgY29uc3QgYiA9IHUgKyBTLCBUID0gdyArIE4gKyBrLCBEID0gaC5nZXQodCkgfHwgW107CiAgICAgICAgZm9yIChjb25zdCBfIG9mIEQpIHsKICAgICAgICAgIGNvbnN0IEUgPSBzLmdldChfKTsKICAgICAgICAgIEUgJiYgbSgKICAgICAgICAgICAgXywKICAgICAgICAgICAgYiArIEUubG9jYWxYLAogICAgICAgICAgICBUICsgRS5sb2NhbFksCiAgICAgICAgICAgIEUud2lkdGgsCiAgICAgICAgICAgIEUuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgIH0KICAgICAgfSBlbHNlCiAgICAgICAgblt0XSA9IEk7CiAgICB9OwogICAgZm9yIChjb25zdCB0IG9mIE0pCiAgICAgIG0odC5pZCwgdC5sb2NhbFgsIHQubG9jYWxZLCB0LndpZHRoLCB0LmhlaWdodCk7CiAgICByZXR1cm4gTC5hc3NpZ25EeW5hbWljUG9ydFNpZGVzKGUsIG4sIHIpLCB7IG5vZGVzOiBuLCBjb250YWluZXJzOiByIH07CiAgfQogIHN0YXRpYyBnZXRDb250YWluZXJEZXB0aHMoZSkgewogICAgY29uc3QgbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGEgPSAobikgPT4gewogICAgICB2YXIgaDsKICAgICAgaWYgKGwuaGFzKG4pKSByZXR1cm4gbC5nZXQobik7CiAgICAgIGNvbnN0IHIgPSAoaCA9IGUuY29udGFpbmVyc1tuXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGgucGFyZW50SWQ7CiAgICAgIGlmICghciB8fCAhZS5jb250YWluZXJzW3JdKQogICAgICAgIHJldHVybiBsLnNldChuLCAwKSwgMDsKICAgICAgY29uc3QgZCA9IDEgKyBhKHIpOwogICAgICByZXR1cm4gbC5zZXQobiwgZCksIGQ7CiAgICB9OwogICAgZm9yIChjb25zdCBuIG9mIE9iamVjdC5rZXlzKGUuY29udGFpbmVycykpCiAgICAgIGEobik7CiAgICByZXR1cm4gbDsKICB9Cn0KY29uc3QgcSA9IDM2LCB6ID0gMjg7CmNsYXNzIEsgewogIGNvbnN0cnVjdG9yKGUgPSB7fSkgewogICAgdGhpcy5vcHRpb25zID0gZTsKICB9CiAgYXJyYW5nZShlLCBsLCBhLCBuKSB7CiAgICBpZiAobC5sZW5ndGggPT09IDApCiAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIGJveGVzOiBbXSB9OwogICAgY29uc3QgciA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPz8gIlRCIiwgZCA9IHIgPT09ICJUQiIgfHwgciA9PT0gIkJUIiwgaCA9IHIgPT09ICJCVCIgfHwgciA9PT0gIlJMIiwgbyA9IG5ldyBTZXQobCksIHAgPSBPYmplY3QudmFsdWVzKGEuZWRnZXMpLmZpbHRlcigKICAgICAgKGMpID0+IG8uaGFzKGMuc291cmNlSWQpICYmIG8uaGFzKGMudGFyZ2V0SWQpCiAgICApLCBnID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICBmb3IgKGNvbnN0IGMgb2YgbCkKICAgICAgZy5zZXQoYywgMCksIHMuc2V0KGMsIFtdKTsKICAgIGZvciAoY29uc3QgYyBvZiBwKQogICAgICBzLmdldChjLnNvdXJjZUlkKS5wdXNoKGMudGFyZ2V0SWQpLCBnLnNldChjLnRhcmdldElkLCAoZy5nZXQoYy50YXJnZXRJZCkgfHwgMCkgKyAxKTsKICAgIGNvbnN0IGkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBmID0gbC5maWx0ZXIoKGMpID0+IChnLmdldChjKSB8fCAwKSA9PT0gMCk7CiAgICBmb3IgKGNvbnN0IGMgb2YgZikgaS5zZXQoYywgMCk7CiAgICBjb25zdCBNID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTsKICAgIGZvciAoOyBmLmxlbmd0aCA+IDA7ICkgewogICAgICBjb25zdCBjID0gZi5zaGlmdCgpOwogICAgICBNLmFkZChjKTsKICAgICAgY29uc3QgSSA9IGkuZ2V0KGMpOwogICAgICBmb3IgKGNvbnN0IHkgb2Ygcy5nZXQoYykpIHsKICAgICAgICBjb25zdCBiID0gTWF0aC5tYXgoaS5nZXQoeSkgfHwgMCwgSSArIDEpOwogICAgICAgIGkuc2V0KHksIGIpLCBnLnNldCh5LCBnLmdldCh5KSAtIDEpLCBnLmdldCh5KSA9PT0gMCAmJiBmLnB1c2goeSk7CiAgICAgIH0KICAgIH0KICAgIGZvciAoY29uc3QgYyBvZiBsKQogICAgICBNLmhhcyhjKSB8fCBpLnNldChjLCAwKTsKICAgIGNvbnN0IG0gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgZm9yIChjb25zdCBbYywgSV0gb2YgaS5lbnRyaWVzKCkpCiAgICAgIG0uaGFzKEkpIHx8IG0uc2V0KEksIFtdKSwgbS5nZXQoSSkucHVzaChjKTsKICAgIGNvbnN0IHggPSBBcnJheS5mcm9tKG0ua2V5cygpKS5zb3J0KChjLCBJKSA9PiBjIC0gSSksIHQgPSBoID8gWy4uLnhdLnJldmVyc2UoKSA6IHgsIHUgPSBbXTsKICAgIGxldCB3ID0gMDsKICAgIGZvciAoY29uc3QgYyBvZiB0KSB7CiAgICAgIGNvbnN0IEkgPSBtLmdldChjKTsKICAgICAgbGV0IHkgPSAwLCBiID0gMDsKICAgICAgZm9yIChjb25zdCBUIG9mIEkpIHsKICAgICAgICBjb25zdCBEID0gbihUKSwgXyA9IGQgPyBELmhlaWdodCA6IEQud2lkdGgsIEUgPSBkID8gRC53aWR0aCA6IEQuaGVpZ2h0LCBHID0gZCA/IGIgOiB3LCBqID0gZCA/IHcgOiBiOwogICAgICAgIHUucHVzaCh7IGlkOiBULCBsb2NhbFg6IEcsIGxvY2FsWTogaiwgd2lkdGg6IEQud2lkdGgsIGhlaWdodDogRC5oZWlnaHQgfSksIGIgKz0gRSArIHosIHkgPSBNYXRoLm1heCh5LCBfKTsKICAgICAgfQogICAgICB3ICs9IHkgKyBxOwogICAgfQogICAgY29uc3QgQSA9IE1hdGgubWF4KC4uLnUubWFwKChjKSA9PiBjLmxvY2FsWCArIGMud2lkdGgpLCAwKSwgQyA9IE1hdGgubWF4KC4uLnUubWFwKChjKSA9PiBjLmxvY2FsWSArIGMuaGVpZ2h0KSwgMCk7CiAgICByZXR1cm4geyB3aWR0aDogQSwgaGVpZ2h0OiBDLCBib3hlczogdSB9OwogIH0KfQpjb25zdCBPID0gMzIsIFcgPSAyNDsKY2xhc3MgViB7CiAgY29uc3RydWN0b3IoZSA9IDEuNTUpIHsKICAgIHRoaXMudGFyZ2V0QXNwZWN0ID0gZTsKICB9CiAgYXJyYW5nZShlLCBsLCBhLCBuKSB7CiAgICBpZiAobC5sZW5ndGggPT09IDApCiAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIGJveGVzOiBbXSB9OwogICAgY29uc3QgciA9IGwubWFwKChoKSA9PiB7CiAgICAgIGNvbnN0IG8gPSBuKGgpOwogICAgICByZXR1cm4geyBpZDogaCwgd2lkdGg6IG8ud2lkdGgsIGhlaWdodDogby5oZWlnaHQgfTsKICAgIH0pLCBkID0gdGhpcy5maW5kQmVzdFRpZ2h0UGFja2luZyhyLCB0aGlzLnRhcmdldEFzcGVjdCk7CiAgICByZXR1cm4geyB3aWR0aDogZC53aWR0aCwgaGVpZ2h0OiBkLmhlaWdodCwgYm94ZXM6IGQuYm94ZXMgfTsKICB9CiAgZmluZEJlc3RUaWdodFBhY2tpbmcoZSwgbCkgewogICAgaWYgKGUubGVuZ3RoID09PSAxKQogICAgICByZXR1cm4gewogICAgICAgIHdpZHRoOiBlWzBdLndpZHRoLAogICAgICAgIGhlaWdodDogZVswXS5oZWlnaHQsCiAgICAgICAgYm94ZXM6IFt7IGlkOiBlWzBdLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogMCwgd2lkdGg6IGVbMF0ud2lkdGgsIGhlaWdodDogZVswXS5oZWlnaHQgfV0sCiAgICAgICAgc2NvcmU6IDAKICAgICAgfTsKICAgIGNvbnN0IGEgPSBlLnJlZHVjZSgocywgaSkgPT4gcyArIGkud2lkdGggKiBpLmhlaWdodCwgMCksIG4gPSBNYXRoLm1heCguLi5lLm1hcCgocykgPT4gcy53aWR0aCkpLCByID0gWy4uLmVdLnNvcnQoKHMsIGkpID0+IGkud2lkdGggLSBzLndpZHRoKSwgZCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksIGggPSBlLnJlZHVjZSgocywgaSkgPT4gcyArIGkud2lkdGgsIDApICsgKGUubGVuZ3RoIC0gMSkgKiBPOwogICAgZC5hZGQoaCksIGQuYWRkKG4pOwogICAgY29uc3QgbyA9IE1hdGgubWF4KG4sIE1hdGguc3FydChhICogbCkpOwogICAgZC5hZGQobyksIGQuYWRkKG8gKiAwLjg1KSwgZC5hZGQobyAqIDEuMTUpOwogICAgY29uc3QgcCA9IE1hdGgubWluKGUubGVuZ3RoLCA2KTsKICAgIGZvciAobGV0IHMgPSAyOyBzIDw9IHA7IHMrKykgewogICAgICBsZXQgaSA9IDA7CiAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgcyAmJiBmIDwgci5sZW5ndGg7IGYrKykKICAgICAgICBpICs9IHJbZl0ud2lkdGg7CiAgICAgIGkgKz0gKHMgLSAxKSAqIE8sIGkgPj0gbiAmJiBkLmFkZChpKTsKICAgIH0KICAgIGxldCBnID0gbnVsbDsKICAgIGZvciAoY29uc3QgcyBvZiBkKSB7CiAgICAgIGNvbnN0IGkgPSB0aGlzLnNpbXVsYXRlU2t5bGluZVBhY2tpbmcoZSwgcyksIGYgPSBpLndpZHRoICogaS5oZWlnaHQsIE0gPSBNYXRoLm1heCgwLCBmIC0gYSksIG0gPSBpLndpZHRoIC8gTWF0aC5tYXgoMSwgaS5oZWlnaHQpLCB4ID0gTWF0aC5hYnMoTWF0aC5sb2cobSAvIGwpKSwgdCA9IE0gLyBhICogMiArIHggKiAwLjI1OwogICAgICBpLnNjb3JlID0gdCwgKCFnIHx8IHQgPCBnLnNjb3JlKSAmJiAoZyA9IGkpOwogICAgfQogICAgcmV0dXJuIGc7CiAgfQogIHNpbXVsYXRlU2t5bGluZVBhY2tpbmcoZSwgbCkgewogICAgY29uc3QgYSA9IFsuLi5lXS5zb3J0KChvLCBwKSA9PiBwLmhlaWdodCAtIG8uaGVpZ2h0KSwgbiA9IFt7IHg6IDAsIHdpZHRoOiBsLCB5OiAwIH1dLCByID0gW107CiAgICBmb3IgKGNvbnN0IG8gb2YgYSkgewogICAgICBsZXQgcCA9IDEgLyAwLCBnID0gLTE7CiAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgbi5sZW5ndGg7IHQrKykgewogICAgICAgIGlmIChuW3RdLnggKyBvLndpZHRoID4gbCkgY29udGludWU7CiAgICAgICAgbGV0IHcgPSAwLCBBID0gMDsKICAgICAgICBmb3IgKGxldCBDID0gdDsgQyA8IG4ubGVuZ3RoICYmIEEgPCBvLndpZHRoOyBDKyspCiAgICAgICAgICB3ID0gTWF0aC5tYXgodywgbltDXS55KSwgQSArPSBuW0NdLndpZHRoOwogICAgICAgIHcgPCBwICYmIChwID0gdywgZyA9IHQpOwogICAgICB9CiAgICAgIGlmIChnID09PSAtMSkgewogICAgICAgIGNvbnN0IHQgPSBNYXRoLm1heCguLi5uLm1hcCgodykgPT4gdy55KSksIHUgPSB0ID09PSAwID8gMCA6IHQgKyBXOwogICAgICAgIHIucHVzaCh7IGlkOiBvLmlkLCBsb2NhbFg6IDAsIGxvY2FsWTogdSwgd2lkdGg6IG8ud2lkdGgsIGhlaWdodDogby5oZWlnaHQgfSksIG4ubGVuZ3RoID0gMCwgbi5wdXNoKHsgeDogMCwgd2lkdGg6IG8ud2lkdGggKyBPLCB5OiB1ICsgby5oZWlnaHQgfSksIGwgPiBvLndpZHRoICsgTyAmJiBuLnB1c2goewogICAgICAgICAgeDogby53aWR0aCArIE8sCiAgICAgICAgICB3aWR0aDogbCAtIChvLndpZHRoICsgTyksCiAgICAgICAgICB5OiAwCiAgICAgICAgfSk7CiAgICAgICAgY29udGludWU7CiAgICAgIH0KICAgICAgY29uc3QgcyA9IG5bZ10ueCwgaSA9IHAgPT09IDAgPyAwIDogcCArIFc7CiAgICAgIHIucHVzaCh7IGlkOiBvLmlkLCBsb2NhbFg6IHMsIGxvY2FsWTogaSwgd2lkdGg6IG8ud2lkdGgsIGhlaWdodDogby5oZWlnaHQgfSk7CiAgICAgIGNvbnN0IGYgPSBvLndpZHRoICsgTywgTSA9IGkgKyBvLmhlaWdodCwgbSA9IHsgeDogcywgd2lkdGg6IGYsIHk6IE0gfSwgeCA9IFtdOwogICAgICBmb3IgKGNvbnN0IHQgb2YgbikKICAgICAgICB0LnggKyB0LndpZHRoIDw9IHMgfHwgdC54ID49IHMgKyBmID8geC5wdXNoKHQpIDogKHQueCA8IHMgJiYgeC5wdXNoKHsgeDogdC54LCB3aWR0aDogcyAtIHQueCwgeTogdC55IH0pLCB0LnggKyB0LndpZHRoID4gcyArIGYgJiYgeC5wdXNoKHsKICAgICAgICAgIHg6IHMgKyBmLAogICAgICAgICAgd2lkdGg6IHQueCArIHQud2lkdGggLSAocyArIGYpLAogICAgICAgICAgeTogdC55CiAgICAgICAgfSkpOwogICAgICB4LnB1c2gobSksIHguc29ydCgodCwgdSkgPT4gdC54IC0gdS54KSwgbi5sZW5ndGggPSAwLCBuLnB1c2goLi4ueCk7CiAgICB9CiAgICBjb25zdCBkID0gTWF0aC5tYXgoLi4uci5tYXAoKG8pID0+IG8ubG9jYWxYICsgby53aWR0aCksIDApLCBoID0gTWF0aC5tYXgoLi4uci5tYXAoKG8pID0+IG8ubG9jYWxZICsgby5oZWlnaHQpLCAwKTsKICAgIHJldHVybiB7IHdpZHRoOiBkLCBoZWlnaHQ6IGgsIGJveGVzOiByLCBzY29yZTogMCB9OwogIH0KfQpmdW5jdGlvbiBYKFAsIGUsIGwpIHsKICB2YXIgciwgZDsKICBsZXQgYSA9IFAsIG4gPSBudWxsOwogIGZvciAoOyBhOyApCiAgICBsLmhhcyhhKSAmJiAobiA9IGEpLCBhID0gKChyID0gZS5ub2Rlc1thXSkgPT0gbnVsbCA/IHZvaWQgMCA6IHIucGFyZW50SWQpID8/ICgoZCA9IGUuY29udGFpbmVyc1thXSkgPT0gbnVsbCA/IHZvaWQgMCA6IGQucGFyZW50SWQpID8/IHZvaWQgMDsKICByZXR1cm4gbiA/PyBQOwp9CmNsYXNzIEogewogIGFzeW5jIGV4ZWN1dGUoZSwgbCwgYSkgewogICAgY29uc3QgbiA9IE9iamVjdC52YWx1ZXMoZS5jb250YWluZXJzKSwgciA9IG5ldyBTZXQoCiAgICAgIG4uZmlsdGVyKChzKSA9PiAhIXMuY29sbGFwc2VkKS5tYXAoKHMpID0+IHMuaWQpCiAgICApLCBkID0ge307CiAgICBmb3IgKGNvbnN0IFtzLCBpXSBvZiBPYmplY3QuZW50cmllcyhlLmVkZ2VzKSkgewogICAgICBjb25zdCBmID0gWChpLnNvdXJjZUlkLCBlLCByKSwgTSA9IFgoaS50YXJnZXRJZCwgZSwgcik7CiAgICAgIGYgIT09IE0gJiYgKGRbc10gPSB7CiAgICAgICAgLi4uaSwKICAgICAgICBzb3VyY2VJZDogZiwKICAgICAgICB0YXJnZXRJZDogTQogICAgICB9KTsKICAgIH0KICAgIGNvbnN0IGggPSB7CiAgICAgIC4uLmUsCiAgICAgIGVkZ2VzOiBkCiAgICB9LCBvID0gT2JqZWN0LmtleXMoZS5jb250YWluZXJzKS5sZW5ndGgsIGcgPSAoYSAhPSBudWxsICYmIGEubW9kZSAmJiBhLm1vZGUgIT09ICJhdXRvIiA/IGEubW9kZSA6IG8gPiAwID8gImNvbmN1cnJlbnQiIDogImZsb3ciKSA9PT0gImNvbmN1cnJlbnQiID8gbmV3IFYoKGEgPT0gbnVsbCA/IHZvaWQgMCA6IGEuYXNwZWN0UmF0aW8pID8/IDEuNTUpIDogbmV3IEsoYSk7CiAgICByZXR1cm4gdi5leGVjdXRlKGgsIGcsIGwpOwogIH0KfQpjb25zdCBRID0gbmV3IEooKTsKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoUCkgPT4gewogIGNvbnN0IHsgaWQ6IGUsIGdyYXBoOiBsLCBtZWFzdXJlbWVudHM6IGEsIG9wdGlvbnM6IG4gfSA9IFAuZGF0YTsKICB0cnkgewogICAgY29uc3QgciA9IG5ldyBNYXAoYSksIGQgPSBhd2FpdCBRLmV4ZWN1dGUobCwgciwgbik7CiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgaWQ6IGUsIHN1Y2Nlc3M6ICEwLCBsYXlvdXQ6IGQgfSk7CiAgfSBjYXRjaCAocikgewogICAgc2VsZi5wb3N0TWVzc2FnZSh7IGlkOiBlLCBzdWNjZXNzOiAhMSwgZXJyb3I6IHIubWVzc2FnZSB9KTsKICB9Cn07Cg==", fe = (s) => Uint8Array.from(atob(s), (o) => o.charCodeAt(0)), Wt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", fe(Mt)], { type: "text/javascript;charset=utf-8" });
function we(s) {
  let o;
  try {
    if (o = Wt && (self.URL || self.webkitURL).createObjectURL(Wt), !o) throw "";
    const g = new Worker(o, {
      type: "module",
      name: s == null ? void 0 : s.name
    });
    return g.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(o);
    }), g;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + Mt,
      {
        type: "module",
        name: s == null ? void 0 : s.name
      }
    );
  }
}
class be {
  constructor() {
    Ct(this, "worker", null);
    Ct(this, "pendingRequests", /* @__PURE__ */ new Map());
    Ct(this, "fallbackEngine", new ye());
    if (typeof Worker < "u")
      try {
        this.worker = new we(), this.worker.onmessage = (o) => {
          const { id: g, success: I, layout: n, error: d } = o.data, r = this.pendingRequests.get(g);
          r && (this.pendingRequests.delete(g), I ? r.resolve(n) : r.reject(new Error(d)));
        }, this.worker.onerror = (o) => {
          console.warn("[SysFlow Worker] Error in worker, falling back to sync engine:", o);
        };
      } catch (o) {
        console.warn("[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:", o), this.worker = null;
      }
  }
  execute(o, g, I) {
    return this.worker ? new Promise((n, d) => {
      const r = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(r, { resolve: n, reject: d });
      const f = Array.from(g.entries());
      this.worker.postMessage({
        id: r,
        graph: o,
        measurements: f,
        options: I
      });
    }) : this.fallbackEngine.execute(o, g, I);
  }
  dispose() {
    this.worker && (this.worker.terminate(), this.worker = null), this.pendingRequests.clear();
  }
}
class me {
  canDrag() {
    return !0;
  }
  onDragMove(o) {
    return o.cursorWorld;
  }
  onDragEnd(o) {
    const { draggedEntity: g, hoveredEntity: I, graph: n } = o;
    return I && I.id === g.id ? null : I && n.containers[I.id] ? g.parentId === I.id ? null : {
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
class Pe {
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
    const { draggedEntity: g, hoveredEdge: I, hoveredEntity: n, cursorWorld: d, startWorldPos: r, graph: f } = o, a = Math.hypot(
      d.x - r.x,
      d.y - r.y
    );
    if (n && f.containers[n.id])
      return n.id !== g.id && g.parentId !== n.id ? {
        type: "ENTITY_REPARENT",
        payload: {
          entityId: g.id,
          newParentId: n.id
        }
      } : null;
    if (!n && !I) {
      const A = Object.values(f.edges).filter(
        (x) => x.targetId === g.id
      ), C = Object.values(f.edges).filter(
        (x) => x.sourceId === g.id
      );
      return A.length === 1 && C.length === 1 && A[0].sourceId !== C[0].targetId && a >= this.dragOffThreshold ? {
        type: "NODE_EXTRACT",
        payload: {
          nodeId: g.id,
          incomingEdgeId: A[0].id,
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
    const B = (A) => {
      const C = f.nodes[A.id] || A;
      if (!C.ports || C.ports.length === 0) return "";
      const x = Object.values(f.edges).find((c) => c.targetId === A.id);
      if (x) {
        const c = C.ports.find((t) => t.id === x.targetPortId);
        if (c) return c.id;
      }
      const m = new Set(
        Object.values(f.edges).filter((c) => c.sourceId === A.id).map((c) => c.sourcePortId)
      ), S = C.ports.find((c) => !m.has(c.id));
      return S ? S.id : C.ports[0].id;
    };
    if (I)
      return I.sourceId === g.id || I.targetId === g.id ? null : {
        type: "EDGE_REWIRE",
        payload: {
          edgeId: I.id,
          newSourceId: I.sourceId,
          newTargetId: g.id,
          newTargetPortId: B(g)
        }
      };
    if (n && n.id !== g.id && f.nodes[n.id]) {
      const A = Object.values(f.edges).find(
        (C) => C.targetId === n.id && C.sourceId !== g.id
      );
      if (A)
        return {
          type: "EDGE_REWIRE",
          payload: {
            edgeId: A.id,
            newSourceId: A.sourceId,
            newTargetId: g.id,
            newTargetPortId: B(g)
          }
        };
    }
    return null;
  }
}
function Be(s, o = { min: 0.15, max: 3 }) {
  const [g, I] = U({ x: 80, y: 80, zoom: 1 }), n = tt(!1), d = tt({ x: 0, y: 0 }), r = Y(
    (c, t) => {
      if (!s.current) return { x: c, y: t };
      const e = s.current.getBoundingClientRect();
      return {
        x: (c - e.left - g.x) / g.zoom,
        y: (t - e.top - g.y) / g.zoom
      };
    },
    [g, s]
  ), f = Y(
    (c) => {
      if (!s.current) return;
      const t = [
        ...Object.values(c.nodes),
        ...Object.values(c.containers)
      ];
      if (t.length === 0) {
        I({ x: 80, y: 80, zoom: 1 });
        return;
      }
      let e = 1 / 0, i = 1 / 0, u = -1 / 0, w = -1 / 0;
      for (const W of t)
        e = Math.min(e, W.x), i = Math.min(i, W.y), u = Math.max(u, W.x + W.width), w = Math.max(w, W.y + W.height);
      const l = s.current.getBoundingClientRect(), h = 80, y = Math.max(u - e, 100), Z = Math.max(w - i, 100), H = (l.width - h * 2) / y, p = (l.height - h * 2) / Z, L = Math.min(
        Math.max(Math.min(H, p), o.min),
        Math.min(o.max, 1.25)
      ), P = (l.width - y * L) / 2 - e * L, N = (l.height - Z * L) / 2 - i * L;
      I({
        x: P,
        y: N,
        zoom: L
      });
    },
    [s, o]
  ), a = Y(
    (c) => {
      if (c.preventDefault(), !!s.current)
        if (c.ctrlKey || c.metaKey) {
          const t = s.current.getBoundingClientRect(), e = c.clientX - t.left, i = c.clientY - t.top, u = c.deltaY < 0 ? 1.08 : 0.92, w = Math.min(Math.max(g.zoom * u, o.min), o.max), l = e - (e - g.x) * (w / g.zoom), h = i - (i - g.y) * (w / g.zoom);
          I({ x: l, y: h, zoom: w });
        } else
          I((t) => ({
            ...t,
            x: t.x - c.deltaX,
            y: t.y - c.deltaY
          }));
    },
    [g, o, s]
  ), B = Y(
    (c, t) => {
      n.current = !0, d.current = { x: c - g.x, y: t - g.y };
    },
    [g]
  ), A = Y((c, t) => {
    n.current && I((e) => ({
      ...e,
      x: c - d.current.x,
      y: t - d.current.y
    }));
  }, []), C = Y(() => {
    n.current = !1;
  }, []), x = Y(() => {
    I({ x: 80, y: 80, zoom: 1 });
  }, []), m = Y(() => {
    I((c) => ({
      ...c,
      zoom: Math.min(c.zoom * 1.2, o.max)
    }));
  }, [o]), S = Y(() => {
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
    startPan: B,
    updatePan: A,
    endPan: C,
    resetTransform: x,
    zoomIn: m,
    zoomOut: S,
    zoomToFit: f,
    isPanning: n
  };
}
function Ge(s) {
  const [o, g] = U(
    /* @__PURE__ */ new Map()
  );
  tt(/* @__PURE__ */ new Map());
  const I = tt(/* @__PURE__ */ new Map()), n = Y((d, r) => {
    r ? I.current.set(d, r) : I.current.delete(d);
  }, []);
  return mt(() => {
    const d = new ResizeObserver((r) => {
      let f = !1;
      const a = new Map(o);
      for (const B of r) {
        const A = B.target.getAttribute("data-sysflow-measure-id");
        if (!A) continue;
        const C = Math.ceil(B.contentRect.width), x = Math.ceil(B.contentRect.height), m = a.get(A);
        (!m || m.width !== C || m.height !== x) && (a.set(A, { width: C, height: x }), f = !0);
      }
      f && g(a);
    });
    return I.current.forEach((r) => d.observe(r)), () => {
      d.disconnect();
    };
  }, [s]), { measurements: o, registerMeasureElement: n };
}
function xe(s, o, g, I, n) {
  const [d, r] = U(null), [f, a] = U(null), B = tt(null), A = tt(null), C = Y(
    (t, e) => {
      let i = null, u = 1 / 0;
      for (const [w, l] of Object.entries(o.containers))
        if (w !== e && t.x >= l.x && t.x <= l.x + l.width && t.y >= l.y && t.y <= l.y + l.height) {
          const h = l.width * l.height;
          h < u && (u = h, i = s.containers[w] || null);
        }
      if (i) return i;
      for (const [w, l] of Object.entries(o.nodes))
        if (w !== e && t.x >= l.x && t.x <= l.x + l.width && t.y >= l.y && t.y <= l.y + l.height)
          return s.nodes[w] || null;
      return null;
    },
    [o, s]
  ), x = Y(
    (t, e) => {
      let i = null, u = 45;
      for (const w of Object.values(s.edges)) {
        if (w.sourceId === e || w.targetId === e) continue;
        const l = o.nodes[w.sourceId] || o.containers[w.sourceId], h = o.nodes[w.targetId] || o.containers[w.targetId];
        if (!l || !h) continue;
        const y = l.x + l.width, Z = l.y + l.height / 2, H = h.x, p = h.y + h.height / 2;
        for (let L = 0; L <= 10; L++) {
          const P = L / 10, N = (1 - P) * y + P * H, W = (1 - P) * Z + P * p, M = Math.hypot(t.x - N, t.y - W);
          M < u && (u = M, i = w);
        }
      }
      return i;
    },
    [o, s]
  ), m = Y(
    (t, e) => {
      if (e.stopPropagation(), g.canDrag && !g.canDrag(t, s))
        return;
      const i = I(e.clientX, e.clientY);
      r({
        draggedEntity: t,
        ghostPosition: i,
        startPosition: i
      });
    },
    [s, g, I]
  ), S = Y(
    (t) => {
      if (!d) return;
      const e = I(t.clientX, t.clientY), i = C(e, d.draggedEntity.id), u = x(e, d.draggedEntity.id);
      B.current = i, A.current = u, i && s.containers[i.id] ? a(i.id) : a(null);
      const w = g.onDragMove ? g.onDragMove({
        draggedEntity: d.draggedEntity,
        cursorWorld: e,
        startWorldPos: d.startPosition,
        hoveredEntity: i,
        hoveredEdge: u,
        graph: s,
        layout: o
      }) : e;
      w && r((l) => l ? { ...l, ghostPosition: w } : null);
    },
    [d, I, g, s, o, C, x]
  ), c = Y(
    (t) => {
      if (!d) return;
      const e = I(t.clientX, t.clientY), i = C(e, d.draggedEntity.id), u = x(e, d.draggedEntity.id), w = g.onDragEnd({
        draggedEntity: d.draggedEntity,
        cursorWorld: e,
        startWorldPos: d.startPosition,
        hoveredEntity: i,
        hoveredEdge: u,
        graph: s,
        layout: o
      });
      w && n(w), r(null), a(null), B.current = null, A.current = null;
    },
    [d, I, g, s, o, C, x, n]
  );
  return {
    dragState: d,
    hoveredContainerId: f,
    handlePointerDown: m,
    handlePointerMove: S,
    handlePointerUp: c
  };
}
function Ne(s) {
  const [o, g] = U({
    history: [s],
    index: 0
  }), [I, n] = U(null), d = o.history[o.index] ?? o.history[0] ?? s, r = Y((c) => {
    const t = Et(c);
    g((e) => {
      const i = e.history.slice(0, e.index + 1);
      return {
        history: [...i, t],
        index: i.length
      };
    });
  }, []), f = Y((c) => {
    const t = Et(c);
    g({
      history: [t],
      index: 0
    });
  }, []), a = Y(() => {
    g((c) => ({
      ...c,
      index: Math.max(0, c.index - 1)
    }));
  }, []), B = Y(() => {
    g((c) => ({
      ...c,
      index: Math.min(c.history.length - 1, c.index + 1)
    }));
  }, []), A = Y(
    (c) => {
      var e, i, u, w;
      const t = d;
      if (c.type === "ENTITY_REPARENT") {
        const { entityId: l, newParentId: h } = c.payload, y = {
          ...t,
          nodes: { ...t.nodes },
          containers: { ...t.containers }
        };
        y.nodes[l] ? y.nodes[l] = { ...y.nodes[l], parentId: h } : y.containers[l] && (y.containers[l] = { ...y.containers[l], parentId: h }), r(y);
      } else if (c.type === "EDGE_SPLIT_INSERT_NODE") {
        const { edge: l, direction: h, suggestedNewNodeId: y, suggestedNewEdge1Id: Z, suggestedNewEdge2Id: H } = c.payload, p = t.edges[l.id];
        if (!p) return;
        const L = h === "BT", P = h === "TB", N = `p_in_${Date.now()}`, W = `p_out_${Date.now()}`;
        let M = "left", O = "right";
        L ? (M = "bottom", O = "top") : P ? (M = "top", O = "bottom") : h === "RL" && (M = "right", O = "left");
        const b = t.nodes[p.sourceId], Q = {
          id: y,
          label: `Node ${Object.keys(t.nodes).length + 1}`,
          type: (b == null ? void 0 : b.type) || "FlowTask",
          parentId: (b == null ? void 0 : b.parentId) ?? null,
          ports: [
            { id: N, label: "in", side: M },
            { id: W, label: "out", side: O }
          ]
        }, V = {
          id: Z,
          sourceId: p.sourceId,
          sourcePortId: p.sourcePortId,
          targetId: y,
          targetPortId: N
        }, v = {
          id: H,
          sourceId: y,
          sourcePortId: W,
          targetId: p.targetId,
          targetPortId: p.targetPortId
        }, _ = { ...t.edges };
        delete _[p.id], _[Z] = V, _[H] = v, r({
          ...t,
          nodes: { ...t.nodes, [y]: Q },
          edges: _
        });
      } else if (c.type === "NODE_EXTRACT") {
        const { incomingEdgeId: l, outgoingEdgeId: h } = c.payload, y = t.edges[l], Z = t.edges[h];
        if (!y || !Z) return;
        const H = { ...t.edges };
        H[l] = {
          ...y,
          targetId: Z.targetId,
          targetPortId: Z.targetPortId
        }, delete H[h], r({
          ...t,
          edges: H
        });
      } else if (c.type === "NODE_ADD_CONNECTED") {
        const { sourceNode: l, position: h, direction: y, suggestedNewNodeId: Z, suggestedNewEdgeId: H } = c.payload, p = y === "BT", L = `p_in_${Date.now()}`, P = `p_out_${Date.now()}`, N = {
          id: Z,
          label: `Node ${Object.keys(t.nodes).length + 1}`,
          type: l.type,
          ports: [
            { id: L, label: "in", side: p ? "bottom" : "top" },
            { id: P, label: "out", side: p ? "top" : "bottom" }
          ]
        }, W = l.ports.find((Q) => Q.label === "in") || l.ports[0], M = l.ports.find((Q) => Q.label === "out") || l.ports[l.ports.length - 1];
        let O;
        p && h === "bottom" || !p && h === "top" ? O = {
          id: H,
          sourceId: Z,
          sourcePortId: P,
          targetId: l.id,
          targetPortId: (W == null ? void 0 : W.id) || "in"
        } : O = {
          id: H,
          sourceId: l.id,
          sourcePortId: (M == null ? void 0 : M.id) || "out",
          targetId: Z,
          targetPortId: L
        }, r({
          ...t,
          nodes: { ...t.nodes, [Z]: N },
          edges: { ...t.edges, [H]: O }
        });
      } else if (c.type === "CONTAINER_TOGGLE_COLLAPSE") {
        const { containerId: l, collapsed: h } = c.payload;
        t.containers[l] && r({
          ...t,
          containers: {
            ...t.containers,
            [l]: { ...t.containers[l], collapsed: h }
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
        const { edgeId: l, newTargetId: h } = c.payload;
        if (!h || !t.edges[l]) return;
        const y = h, Z = t.edges[l], H = Z.targetId, p = Object.values(t.edges).find((O) => O.targetId === y), L = Object.values(t.edges).find((O) => O.sourceId === y), P = { ...t.edges };
        p && L && (P[p.id] = {
          ...p,
          targetId: L.targetId,
          targetPortId: L.targetPortId
        }, delete P[L.id]);
        const N = ((i = (e = t.nodes[y]) == null ? void 0 : e.ports[0]) == null ? void 0 : i.id) || "p_in", W = ((w = (u = t.nodes[y]) == null ? void 0 : u.ports.find((O) => O.id !== N)) == null ? void 0 : w.id) || N;
        P[l] = {
          ...Z,
          targetId: y,
          targetPortId: N
        };
        const M = `REWIRE_${Date.now()}`;
        P[M] = {
          id: M,
          sourceId: y,
          sourcePortId: W,
          targetId: H,
          targetPortId: Z.targetPortId
        }, r({ ...t, edges: P });
      }
    },
    [d, r]
  ), C = Y(
    (c) => {
      const t = d.nodes[c] || d.containers[c];
      t && n({ entity: JSON.parse(JSON.stringify(t)), isCut: !1 });
    },
    [d]
  ), x = Y(
    (c) => {
      const t = d.nodes[c] || d.containers[c];
      if (t) {
        n({ entity: JSON.parse(JSON.stringify(t)), isCut: !0 });
        const e = { ...d.nodes }, i = { ...d.containers };
        delete e[c], delete i[c], r({ ...d, nodes: e, containers: i });
      }
    },
    [d, r]
  ), m = Y(() => {
    if (!I) return;
    const c = I.entity, t = `${c.id}_copy_${Date.now().toString().slice(-4)}`, e = { ...c, id: t, label: `${c.label} (Copy)` };
    "collapsed" in e ? r({
      ...d,
      containers: { ...d.containers, [t]: e }
    }) : r({
      ...d,
      nodes: { ...d.nodes, [t]: e }
    });
  }, [I, d, r]), S = Y(
    (c) => {
      if (c.length === 0) return;
      const t = { ...d.nodes }, e = { ...d.containers }, i = { ...d.edges };
      for (const u of c)
        delete t[u], delete e[u], delete i[u];
      r({
        ...d,
        nodes: t,
        containers: e,
        edges: i
      });
    },
    [d, r]
  );
  return {
    graph: d,
    setGraphDirect: f,
    applyAction: A,
    undo: a,
    redo: B,
    copyEntity: C,
    cutEntity: x,
    pasteEntity: m,
    deleteSelection: S,
    canUndo: o.index > 0,
    canRedo: o.index < o.history.length - 1
  };
}
const pe = ({
  graph: s,
  registerMeasureElement: o,
  nodeTypes: g,
  containerTypes: I
}) => {
  const n = Object.values(s.nodes), d = Object.values(s.containers);
  return /* @__PURE__ */ F("div", { className: "sysflow-measure-layer", "aria-hidden": "true", children: [
    n.map((r) => {
      const f = r.type ? g == null ? void 0 : g[r.type] : null;
      return /* @__PURE__ */ E(
        "div",
        {
          ref: (a) => o(r.id, a),
          "data-sysflow-measure-id": r.id,
          className: "sysflow-node",
          style: { display: "inline-block", position: "relative" },
          children: f ? /* @__PURE__ */ E(f, { node: r, selected: !1 }) : /* @__PURE__ */ F("div", { style: { padding: "12px 16px" }, children: [
            /* @__PURE__ */ E("div", { style: { fontWeight: 600 }, children: r.label }),
            r.ports.length > 0 && /* @__PURE__ */ F("div", { style: { fontSize: "11px", marginTop: 4, opacity: 0.7 }, children: [
              "Ports: ",
              r.ports.map((a) => a.label).join(", ")
            ] })
          ] })
        },
        `measure-node-${r.id}`
      );
    }),
    d.map((r) => {
      const f = r.type ? I == null ? void 0 : I[r.type] : null;
      return /* @__PURE__ */ E(
        "div",
        {
          ref: (a) => o(r.id, a),
          "data-sysflow-measure-id": r.id,
          className: "sysflow-container",
          style: { display: "inline-block", position: "relative" },
          children: f ? /* @__PURE__ */ E(f, { container: r, selected: !1 }) : /* @__PURE__ */ E("div", { className: "sysflow-container-header", children: r.label })
        },
        `measure-container-${r.id}`
      );
    })
  ] });
}, Se = ({
  graph: s,
  layout: o,
  selectedIds: g,
  direction: I = "TB",
  showArrows: n = !0,
  routing: d = "auto",
  portOptions: r,
  enableEdgeQuickAdd: f = !0,
  onEdgeClick: a,
  onInsertNodeOnEdge: B
}) => {
  const [A, C] = U(null), x = d === "step" || d === "auto" && (I === "LR" || I === "RL"), m = (t, e, i) => {
    var N, W, M, O;
    let u = t, w = null;
    for ((N = s.containers[t]) != null && N.collapsed && (w = s.containers[t]); u; ) {
      const b = ((W = s.nodes[u]) == null ? void 0 : W.parentId) ?? ((M = s.containers[u]) == null ? void 0 : M.parentId) ?? null;
      b && ((O = s.containers[b]) != null && O.collapsed) && (w = s.containers[b]), u = b;
    }
    if (w) {
      const b = o.containers[w.id];
      if (!b)
        return { x: 0, y: 0, side: i ? "right" : "left", valid: !1, entityId: w.id };
      let Q, V, v;
      return I === "TB" ? (Q = i ? "bottom" : "top", V = b.x + b.width / 2, v = i ? b.y + b.height : b.y) : I === "BT" ? (Q = i ? "top" : "bottom", V = b.x + b.width / 2, v = i ? b.y : b.y + b.height) : I === "RL" ? (Q = i ? "left" : "right", V = i ? b.x : b.x + b.width, v = b.y + b.height / 2) : (Q = i ? "right" : "left", V = i ? b.x + b.width : b.x, v = b.y + b.height / 2), { x: V, y: v, side: Q, valid: !0, entityId: w.id };
    }
    if (!!s.containers[t]) {
      const b = o.containers[t];
      if (!b) return { x: 0, y: 0, side: i ? "right" : "left", valid: !1, entityId: t };
      let Q, V, v;
      return I === "TB" ? (Q = b.x + b.width / 2, V = i ? b.y + b.height : b.y, v = i ? "bottom" : "top") : I === "BT" ? (Q = b.x + b.width / 2, V = i ? b.y : b.y + b.height, v = i ? "top" : "bottom") : I === "RL" ? (Q = i ? b.x : b.x + b.width, V = b.y + b.height / 2, v = i ? "left" : "right") : (Q = i ? b.x + b.width : b.x, V = b.y + b.height / 2, v = i ? "right" : "left"), { x: Q, y: V, side: v, valid: !0, entityId: t };
    }
    const h = s.nodes[t], y = o.nodes[t];
    if (!h || !y)
      return { x: 0, y: 0, side: i ? "right" : "left", valid: !1, entityId: t };
    const H = Gt(
      h,
      y,
      I,
      s.edges,
      r
    ).get(e);
    if (H)
      return { x: H.worldX, y: H.worldY, side: H.side, valid: !0, entityId: t };
    let p, L, P;
    return I === "TB" ? (p = y.x + y.width / 2, L = i ? y.y + y.height : y.y, P = i ? "bottom" : "top") : I === "BT" ? (p = y.x + y.width / 2, L = i ? y.y : y.y + y.height, P = i ? "top" : "bottom") : I === "RL" ? (p = i ? y.x : y.x + y.width, L = y.y + y.height / 2, P = i ? "left" : "right") : (p = i ? y.x + y.width : y.x, L = y.y + y.height / 2, P = i ? "right" : "left"), { x: p, y: L, side: P, valid: !0, entityId: t };
  }, S = (t, e) => {
    const i = (t.x + e.x) / 2, u = (t.y + e.y) / 2;
    if (t.side === "right" && e.side === "left") {
      if (e.x >= t.x + 20)
        return {
          pathStr: `M ${t.x} ${t.y} L ${i} ${t.y} L ${i} ${e.y} L ${e.x} ${e.y}`,
          center: { x: i, y: u }
        };
      {
        const w = e.y >= t.y ? t.y - 40 : t.y + 40;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x + 20} ${t.y} L ${t.x + 20} ${w} L ${e.x - 20} ${w} L ${e.x - 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: i, y: w }
        };
      }
    }
    if (t.side === "left" && e.side === "right") {
      if (e.x <= t.x - 20)
        return {
          pathStr: `M ${t.x} ${t.y} L ${i} ${t.y} L ${i} ${e.y} L ${e.x} ${e.y}`,
          center: { x: i, y: u }
        };
      {
        const w = e.y >= t.y ? t.y - 40 : t.y + 40;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x - 20} ${t.y} L ${t.x - 20} ${w} L ${e.x + 20} ${w} L ${e.x + 20} ${e.y} L ${e.x} ${e.y}`,
          center: { x: i, y: w }
        };
      }
    }
    if (t.side === "bottom" && e.side === "top") {
      if (e.y >= t.y + 16)
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${u} L ${e.x} ${u} L ${e.x} ${e.y}`,
          center: { x: i, y: u }
        };
      {
        const w = e.x >= t.x ? t.x + 50 : t.x - 50;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${t.y + 20} L ${w} ${t.y + 20} L ${w} ${e.y - 20} L ${e.x} ${e.y - 20} L ${e.x} ${e.y}`,
          center: { x: w, y: u }
        };
      }
    }
    if (t.side === "top" && e.side === "bottom") {
      if (e.y <= t.y - 16)
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${u} L ${e.x} ${u} L ${e.x} ${e.y}`,
          center: { x: i, y: u }
        };
      {
        const w = e.x >= t.x ? t.x + 50 : t.x - 50;
        return {
          pathStr: `M ${t.x} ${t.y} L ${t.x} ${t.y - 20} L ${w} ${t.y - 20} L ${w} ${e.y + 20} L ${e.x} ${e.y + 20} L ${e.x} ${e.y}`,
          center: { x: w, y: u }
        };
      }
    }
    return {
      pathStr: `M ${t.x} ${t.y} L ${i} ${t.y} L ${i} ${e.y} L ${e.x} ${e.y}`,
      center: { x: i, y: u }
    };
  }, c = (t, e) => {
    const i = e.x - t.x, u = e.y - t.y;
    let w = t.x, l = t.y, h = e.x, y = e.y;
    if (t.side === "bottom" && e.side === "top")
      if (u > 0) {
        const p = Math.min(28, u * 0.4);
        l = t.y + Math.max(p, u * 0.5), y = e.y - Math.max(p, u * 0.5);
      } else {
        const p = i >= 0 ? 1 : -1, L = Math.max(40, Math.abs(i) * 0.2);
        w = t.x + L * p, l = t.y + 40, h = e.x + L * p, y = e.y - 40;
      }
    else if (t.side === "top" && e.side === "bottom")
      if (u < 0) {
        const p = Math.min(28, Math.abs(u) * 0.4);
        l = t.y - Math.max(p, Math.abs(u) * 0.5), y = e.y + Math.max(p, Math.abs(u) * 0.5);
      } else {
        const p = i >= 0 ? 1 : -1, L = Math.max(40, Math.abs(i) * 0.2);
        w = t.x + L * p, l = t.y - 40, h = e.x + L * p, y = e.y + 40;
      }
    else if (t.side === "right" && e.side === "left")
      i > 0 ? (w = t.x + i * 0.5, h = e.x - i * 0.5) : (w = t.x + 50, l = t.y - 50, h = e.x - 50, y = e.y - 50);
    else if (t.side === "left" && e.side === "right")
      i < 0 ? (w = t.x + i * 0.5, h = e.x - i * 0.5) : (w = t.x - 50, l = t.y - 50, h = e.x + 50, y = e.y - 50);
    else {
      const p = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      }, L = p[t.side] || { x: 0, y: 1 }, P = p[e.side] || { x: 0, y: -1 }, N = Math.min(60, Math.hypot(i, u) * 0.35);
      w = t.x + L.x * N, l = t.y + L.y * N, h = e.x + P.x * N, y = e.y + P.y * N;
    }
    const Z = 0.125 * t.x + 0.375 * w + 0.375 * h + 0.125 * e.x, H = 0.125 * t.y + 0.375 * l + 0.375 * y + 0.125 * e.y;
    return {
      pathStr: `M ${t.x} ${t.y} C ${w} ${l} ${h} ${y} ${e.x} ${e.y}`,
      center: { x: Z, y: H }
    };
  };
  return /* @__PURE__ */ F("svg", { className: "sysflow-edge-layer", children: [
    /* @__PURE__ */ F("defs", { children: [
      /* @__PURE__ */ E(
        "marker",
        {
          id: "sysflow-arrow",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ E("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-stroke)" })
        }
      ),
      /* @__PURE__ */ E(
        "marker",
        {
          id: "sysflow-arrow-selected",
          viewBox: "0 0 10 10",
          refX: "6",
          refY: "5",
          markerWidth: "6",
          markerHeight: "6",
          orient: "auto-start-reverse",
          children: /* @__PURE__ */ E("path", { d: "M 0 1 L 10 5 L 0 9 z", fill: "var(--sysflow-edge-selected)" })
        }
      )
    ] }),
    Object.values(s.edges).map((t) => {
      const e = m(t.sourceId, t.sourcePortId, !0), i = m(t.targetId, t.targetPortId, !1);
      if (!e.valid || !i.valid || e.entityId === i.entityId) return null;
      const u = g.includes(t.id), w = A === t.id, { pathStr: l, center: h } = x ? S(e, i) : c(e, i);
      return /* @__PURE__ */ F(
        "g",
        {
          onMouseEnter: () => C(t.id),
          onMouseLeave: () => C(null),
          children: [
            /* @__PURE__ */ E(
              "path",
              {
                d: l,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 24,
                style: { cursor: "pointer", pointerEvents: "stroke" },
                onClick: (y) => {
                  y.stopPropagation(), a == null || a(t.id);
                }
              }
            ),
            /* @__PURE__ */ E(
              "path",
              {
                d: l,
                fill: "none",
                stroke: u ? "var(--sysflow-edge-selected)" : w ? "var(--sysflow-edge-hover, #38bdf8)" : "var(--sysflow-edge-stroke)",
                strokeWidth: u ? 2.5 : w ? 2.25 : 1.75,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                style: { pointerEvents: "none" },
                markerEnd: n ? u ? "url(#sysflow-arrow-selected)" : "url(#sysflow-arrow)" : void 0
              }
            ),
            f && w && B && /* @__PURE__ */ E("g", { transform: `translate(${h.x}, ${h.y})`, children: /* @__PURE__ */ F(
              "g",
              {
                className: "sysflow-edge-quick-add",
                style: { pointerEvents: "all", cursor: "pointer" },
                onClick: (y) => {
                  y.preventDefault(), y.stopPropagation(), B(t);
                },
                children: [
                  /* @__PURE__ */ E("circle", { r: 16, fill: "transparent" }),
                  /* @__PURE__ */ E(
                    "circle",
                    {
                      r: 10,
                      className: "sysflow-edge-add-circle",
                      fill: "#0ea5e9",
                      stroke: "#ffffff",
                      strokeWidth: 1.5
                    }
                  ),
                  /* @__PURE__ */ E(
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
}, Le = ({
  entity: s,
  layout: o,
  direction: g = "LR",
  edges: I,
  portOptions: n,
  onPortPointerDown: d,
  onPortPointerUp: r
}) => {
  if (!s.ports || s.ports.length === 0)
    return null;
  const f = Gt(
    s,
    o,
    g,
    I,
    n
  );
  return /* @__PURE__ */ E(Bt, { children: s.ports.map((a) => {
    const B = f.get(a.id);
    return B ? /* @__PURE__ */ E(
      "div",
      {
        className: `sysflow-port-anchor sysflow-port-${B.side}`,
        style: {
          position: "absolute",
          left: `${B.localX}px`,
          top: `${B.localY}px`,
          transform: "translate(-50%, -50%)",
          cursor: "crosshair",
          zIndex: 10
        },
        title: `${a.label} (${B.side})`,
        onPointerDown: (A) => {
          A.stopPropagation(), d == null || d(s.id, a.id, !0, A);
        },
        onPointerUp: (A) => {
          A.stopPropagation(), r == null || r(s.id, a.id, !1);
        }
      },
      a.id
    ) : null;
  }) });
}, ke = ({
  node: s,
  layout: o,
  selected: g = !1,
  direction: I = "LR",
  edges: n,
  portOptions: d,
  enableQuickAdd: r = !1,
  onAddConnectedNode: f,
  onPointerDown: a,
  onMouseEnter: B,
  onMouseLeave: A,
  onClick: C,
  onPortPointerDown: x,
  onPortPointerUp: m,
  customRenderer: S
}) => {
  const [c, t] = U(!1);
  return /* @__PURE__ */ F(
    "div",
    {
      className: `sysflow-node ${g ? "sysflow-selected" : ""} ${s.className || ""}`,
      style: {
        transform: `translate(${o.x}px, ${o.y}px)`,
        width: `${o.width}px`,
        height: `${o.height}px`
      },
      onPointerDown: (e) => a == null ? void 0 : a(s, e),
      onMouseEnter: () => {
        t(!0), B == null || B(s.id);
      },
      onMouseLeave: () => {
        t(!1), A == null || A(s.id);
      },
      onClick: C,
      children: [
        r && c && /* @__PURE__ */ F(Bt, { children: [
          /* @__PURE__ */ E("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-top" }),
          /* @__PURE__ */ E("div", { className: "sysflow-hover-bridge sysflow-hover-bridge-bottom" })
        ] }),
        r && c && f && /* @__PURE__ */ E(
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
              e.preventDefault(), e.stopPropagation(), f(s, "top");
            },
            children: "+"
          }
        ),
        /* @__PURE__ */ E(
          Le,
          {
            entity: s,
            layout: o,
            direction: I,
            edges: n,
            portOptions: d,
            onPortPointerDown: x,
            onPortPointerUp: m
          }
        ),
        S ? /* @__PURE__ */ E(S, { node: s, selected: g }) : /* @__PURE__ */ F("div", { style: { padding: "10px 14px" }, children: [
          /* @__PURE__ */ E("div", { style: { fontWeight: 600, fontSize: "13px" }, children: s.label }),
          s.ports.length > 0 && /* @__PURE__ */ F("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: [
            s.ports.length,
            " Port",
            s.ports.length > 1 ? "s" : ""
          ] })
        ] }),
        r && c && f && /* @__PURE__ */ E(
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
              e.preventDefault(), e.stopPropagation(), f(s, "bottom");
            },
            children: "+"
          }
        )
      ]
    }
  );
}, Ee = ({
  container: s,
  layout: o,
  selected: g,
  isHovered: I = !1,
  hasChildren: n = !1,
  onToggleCollapse: d,
  onPointerDown: r,
  onMouseEnter: f,
  onMouseLeave: a,
  onClick: B,
  customRenderer: A
}) => /* @__PURE__ */ E(
  "div",
  {
    className: `sysflow-container ${g ? "sysflow-selected" : ""} ${I ? "sysflow-hovered" : ""} ${s.className || ""}`,
    style: {
      transform: `translate(${o.x}px, ${o.y}px)`,
      width: `${o.width}px`,
      height: `${o.height}px`
    },
    onPointerDown: (C) => r(s, C),
    onMouseEnter: f,
    onMouseLeave: a,
    onClick: B,
    children: A ? /* @__PURE__ */ E(A, { container: s, selected: g }) : /* @__PURE__ */ F(Bt, { children: [
      /* @__PURE__ */ F("div", { className: "sysflow-container-header", children: [
        /* @__PURE__ */ E("span", { className: "sysflow-container-title", title: s.label, children: s.label }),
        /* @__PURE__ */ E(
          "button",
          {
            className: "sysflow-collapse-btn",
            onPointerDown: (C) => C.stopPropagation(),
            onPointerUp: (C) => C.stopPropagation(),
            onClick: (C) => {
              C.stopPropagation(), d(s.id, !s.collapsed);
            },
            children: s.collapsed ? "Expand ⊞" : "Collapse ⊟"
          }
        )
      ] }),
      !s.collapsed && !n && /* @__PURE__ */ E("div", { className: "sysflow-container-empty-hint", children: "Drop tasks here" })
    ] })
  }
), Ze = new me(), Ye = ({
  graph: s,
  onChange: o,
  layoutEngine: g,
  interactionStrategy: I = Ze,
  direction: n = "TB",
  layoutOptions: d,
  portPlacementMode: r,
  routing: f,
  showEdgeArrows: a = !0,
  nodeTypes: B,
  containerTypes: A,
  zoomBounds: C,
  className: x = "",
  selectedIds: m = [],
  theme: S = "dark",
  enableQuickAdd: c,
  enableEdgeQuickAdd: t
}) => {
  var St, Lt;
  const e = tt(null), i = tt(null);
  !g && !i.current && (i.current = new be());
  const u = g || i.current, {
    transform: w,
    screenToWorld: l,
    onWheel: h,
    startPan: y,
    updatePan: Z,
    endPan: H,
    resetTransform: p,
    zoomIn: L,
    zoomOut: P,
    zoomToFit: N,
    isPanning: W
  } = Be(e, C), { measurements: M, registerMeasureElement: O } = Ge(s), [b, Q] = U({ nodes: {}, containers: {} }), V = de(() => ({
    direction: n,
    mode: r ?? (n === "TB" || n === "BT" ? "strict-flow" : "perimeter-optimized"),
    nodeLayouts: b.nodes
  }), [n, r, b.nodes]), [v, _] = U(null), [$, ut] = U(null), yt = tt(!1), {
    dragState: et,
    hoveredContainerId: Xt,
    handlePointerDown: pt,
    handlePointerMove: Rt,
    handlePointerUp: Tt
  } = xe(s, b, I, l, o);
  mt(() => {
    const G = (k) => {
      if (k.target instanceof HTMLInputElement || k.target instanceof HTMLTextAreaElement)
        return;
      if (k.key === "Escape") {
        k.preventDefault(), ut(null), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
        return;
      }
      if (k.code === "Space" && (yt.current = !0), k.key.toLowerCase() === "f" && !k.ctrlKey && !k.metaKey) {
        k.preventDefault(), N(b);
        return;
      }
      if ((k.ctrlKey || k.metaKey) && k.key.toLowerCase() === "a") {
        k.preventDefault();
        const T = [
          ...Object.keys(s.nodes),
          ...Object.keys(s.containers)
        ];
        o({ type: "SELECTION_CHANGE", payload: { selectedIds: T } });
        return;
      }
      const K = Object.keys(s.nodes);
      if (K.length !== 0) {
        if (k.key === "Tab") {
          k.preventDefault();
          const T = m.length > 0 ? K.indexOf(m[0]) : -1;
          let R;
          k.shiftKey ? R = T <= 0 ? K.length - 1 : T - 1 : R = (T + 1) % K.length, o({ type: "SELECTION_CHANGE", payload: { selectedIds: [K[R]] } });
          return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k.key)) {
          k.preventDefault();
          const T = m[0] || K[0], R = b.nodes[T] || b.containers[T];
          if (!R) return;
          const J = {
            x: R.x + R.width / 2,
            y: R.y + R.height / 2
          };
          let X = null, st = 1 / 0;
          for (const it of K) {
            if (it === T) continue;
            const ot = b.nodes[it];
            if (!ot) continue;
            const It = {
              x: ot.x + ot.width / 2,
              y: ot.y + ot.height / 2
            }, dt = It.x - J.x, nt = It.y - J.y;
            let q = !1;
            if (k.key === "ArrowRight" && dt > 20 && (q = !0), k.key === "ArrowLeft" && dt < -20 && (q = !0), k.key === "ArrowDown" && nt > 20 && (q = !0), k.key === "ArrowUp" && nt < -20 && (q = !0), q) {
              const z = Math.hypot(dt, nt);
              z < st && (st = z, X = it);
            }
          }
          X && o({ type: "SELECTION_CHANGE", payload: { selectedIds: [X] } });
        }
      }
    }, D = (k) => {
      k.code === "Space" && (yt.current = !1);
    };
    return window.addEventListener("keydown", G), window.addEventListener("keyup", D), () => {
      window.removeEventListener("keydown", G), window.removeEventListener("keyup", D);
    };
  }, [s, b, m, N, o]), mt(() => {
    let G = !1, D = 16 / 9;
    if (e.current) {
      const K = e.current.getBoundingClientRect();
      K.width > 0 && K.height > 0 && (D = K.width / K.height);
    }
    const k = {
      direction: n,
      aspectRatio: D,
      ...d
    };
    return u.execute(s, M, k).then((K) => {
      G || Q(K);
    }), () => {
      G = !0;
    };
  }, [s, M, u, n, d]);
  const Ot = (G, D, k, K) => {
    const T = s.nodes[G] || s.containers[G], R = b.nodes[G] || b.containers[G];
    if (!T || !R) return;
    const X = Gt(
      T,
      R,
      n,
      s.edges,
      V
    ).get(D), st = X ? { x: X.worldX, y: X.worldY } : { x: R.x + R.width, y: R.y + R.height / 2 };
    _({
      sourceId: G,
      sourcePortId: D,
      startWorldPos: st,
      currentWorldPos: l(K.clientX, K.clientY)
    });
  }, Qt = (G, D, k) => {
    var K, T, R, J, X, st, it, ot, It, dt;
    if (v && v.sourceId !== G) {
      const nt = s.nodes[v.sourceId] || s.containers[v.sourceId], q = s.nodes[G] || s.containers[G], z = (K = nt == null ? void 0 : nt.ports) == null ? void 0 : K.find((rt) => rt.id === v.sourcePortId), j = (T = q == null ? void 0 : q.ports) == null ? void 0 : T.find((rt) => rt.id === D);
      let ct = v.sourceId, ht = v.sourcePortId, at = G, At = D;
      const qt = ((R = z == null ? void 0 : z.label) == null ? void 0 : R.toLowerCase().includes("in")) || (z == null ? void 0 : z.side) === (n === "BT" ? "bottom" : "top"), te = ((J = z == null ? void 0 : z.label) == null ? void 0 : J.toLowerCase().includes("out")) || (z == null ? void 0 : z.side) === (n === "BT" ? "top" : "bottom"), ee = ((X = j == null ? void 0 : j.label) == null ? void 0 : X.toLowerCase().includes("in")) || (j == null ? void 0 : j.side) === (n === "BT" ? "bottom" : "top"), oe = ((st = j == null ? void 0 : j.label) == null ? void 0 : st.toLowerCase().includes("out")) || (j == null ? void 0 : j.side) === (n === "BT" ? "top" : "bottom");
      if (qt && oe)
        ct = G, ht = D, at = v.sourceId, At = v.sourcePortId;
      else if (te && ee)
        ct = v.sourceId, ht = v.sourcePortId, at = G, At = D;
      else if (b.nodes[v.sourceId] && b.nodes[G]) {
        const rt = b.nodes[v.sourceId], kt = b.nodes[G], se = n === "BT" && rt.y < kt.y, ne = n === "TB" && rt.y > kt.y;
        if (se || ne) {
          ct = G, at = v.sourceId;
          const ft = s.nodes[ct], wt = s.nodes[at];
          ht = ((ot = (it = ft == null ? void 0 : ft.ports) == null ? void 0 : it.find((lt) => lt.label.includes("out") || lt.side === (n === "BT" ? "top" : "bottom"))) == null ? void 0 : ot.id) || D, At = ((dt = (It = wt == null ? void 0 : wt.ports) == null ? void 0 : It.find((lt) => lt.label.includes("in") || lt.side === (n === "BT" ? "bottom" : "top"))) == null ? void 0 : dt.id) || v.sourcePortId;
        }
      }
      o({
        type: "EDGE_CREATE",
        payload: {
          edge: {
            sourceId: ct,
            sourcePortId: ht,
            targetId: at,
            targetPortId: At
          }
        }
      });
    }
    _(null);
  }, $t = (G) => {
    if (G.button === 1 || yt.current) {
      y(G.clientX, G.clientY);
      return;
    }
    const D = G.target, k = D === e.current || D.classList.contains("sysflow-viewport") || D.classList.contains("sysflow-dom-layer") || D.tagName.toLowerCase() === "svg";
    if (G.button === 0 && k) {
      G.currentTarget.setPointerCapture(G.pointerId);
      const K = l(G.clientX, G.clientY);
      ut({
        startX: K.x,
        startY: K.y,
        currentX: K.x,
        currentY: K.y
      }), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [] } });
    }
  }, Vt = (G) => {
    if (W.current)
      Z(G.clientX, G.clientY);
    else if ($) {
      const D = l(G.clientX, G.clientY);
      ut((k) => k ? { ...k, currentX: D.x, currentY: D.y } : null);
    } else et ? Rt(G) : v && _(
      (D) => D ? { ...D, currentWorldPos: l(G.clientX, G.clientY) } : null
    );
  }, Ft = (G) => {
    if (G.currentTarget.hasPointerCapture(G.pointerId) && G.currentTarget.releasePointerCapture(G.pointerId), W.current && H(), $) {
      const D = Math.min($.startX, $.currentX), k = Math.min($.startY, $.currentY), K = Math.max($.startX, $.currentX), T = Math.max($.startY, $.currentY);
      if (K - D > 4 || T - k > 4) {
        const R = [];
        for (const [J, X] of Object.entries(b.nodes))
          X.x < K && X.x + X.width > D && X.y < T && X.y + X.height > k && R.push(J);
        for (const [J, X] of Object.entries(b.containers))
          X.x < K && X.x + X.width > D && X.y < T && X.y + X.height > k && R.push(J);
        o({ type: "SELECTION_CHANGE", payload: { selectedIds: R } });
      }
      ut(null);
    }
    et && Tt(G), v && _(null);
  }, zt = c ?? (d == null ? void 0 : d.mode) === "flow", jt = Y(
    (G, D) => {
      const k = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, K = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      o({
        type: "NODE_ADD_CONNECTED",
        payload: {
          sourceNode: G,
          position: D,
          direction: n,
          suggestedNewNodeId: k,
          suggestedNewEdgeId: K
        }
      });
    },
    [n, o]
  ), Ut = t ?? c ?? (d == null ? void 0 : d.mode) === "flow", Jt = Y(
    (G) => {
      const D = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, k = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, K = `edge_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;
      o({
        type: "EDGE_SPLIT_INSERT_NODE",
        payload: {
          edge: G,
          direction: n,
          suggestedNewNodeId: D,
          suggestedNewEdge1Id: k,
          suggestedNewEdge2Id: K
        }
      }), o({
        type: "SELECTION_CHANGE",
        payload: { selectedIds: [D] }
      });
    },
    [n, o]
  ), _t = Object.values(s.containers);
  return /* @__PURE__ */ F(
    "div",
    {
      ref: e,
      className: `sysflow-canvas ${S === "light" ? "sysflow-theme-light" : "sysflow-theme-dark"} ${x}`,
      "data-theme": S,
      onWheel: h,
      onPointerDown: $t,
      onPointerMove: Vt,
      onPointerUp: Ft,
      tabIndex: 0,
      style: { outline: "none" },
      children: [
        /* @__PURE__ */ E(
          pe,
          {
            graph: s,
            registerMeasureElement: O,
            nodeTypes: B,
            containerTypes: A
          }
        ),
        /* @__PURE__ */ F("div", { className: "sysflow-controls-panel", children: [
          /* @__PURE__ */ E("button", { onClick: L, className: "sysflow-control-btn", title: "Zoom In (+)", children: "+" }),
          /* @__PURE__ */ E("button", { onClick: P, className: "sysflow-control-btn", title: "Zoom Out (-)", children: "−" }),
          /* @__PURE__ */ F("button", { onClick: p, className: "sysflow-control-btn", title: "Reset Zoom (0)", children: [
            Math.round(w.zoom * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ F(
          "div",
          {
            className: "sysflow-viewport",
            style: {
              transform: `translate(${w.x}px, ${w.y}px) scale(${w.zoom})`
            },
            children: [
              $ && /* @__PURE__ */ E(
                "div",
                {
                  style: {
                    position: "absolute",
                    left: `${Math.min($.startX, $.currentX)}px`,
                    top: `${Math.min($.startY, $.currentY)}px`,
                    width: `${Math.abs($.currentX - $.startX)}px`,
                    height: `${Math.abs($.currentY - $.startY)}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px dashed #38bdf8",
                    borderRadius: "2px",
                    pointerEvents: "none",
                    zIndex: 90
                  }
                }
              ),
              v && /* @__PURE__ */ E("svg", { className: "sysflow-edge-layer", style: { pointerEvents: "none" }, children: /* @__PURE__ */ E(
                "line",
                {
                  x1: v.startWorldPos.x,
                  y1: v.startWorldPos.y,
                  x2: v.currentWorldPos.x,
                  y2: v.currentWorldPos.y,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  strokeDasharray: "4 4"
                }
              ) }),
              /* @__PURE__ */ E("div", { className: "sysflow-containers-layer", style: { position: "absolute", zIndex: 1, pointerEvents: "none" }, children: _t.map((G) => {
                const D = b.containers[G.id];
                if (!D) return null;
                const k = Object.values(s.nodes).some((K) => K.parentId === G.id) || Object.values(s.containers).some((K) => K.parentId === G.id);
                return /* @__PURE__ */ E(
                  Ee,
                  {
                    container: G,
                    layout: D,
                    selected: m.includes(G.id),
                    isHovered: Xt === G.id,
                    hasChildren: k,
                    customRenderer: G.type ? A == null ? void 0 : A[G.type] : void 0,
                    onToggleCollapse: (K, T) => o({
                      type: "CONTAINER_TOGGLE_COLLAPSE",
                      payload: { containerId: K, collapsed: T }
                    }),
                    onPointerDown: pt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (K) => {
                      K.stopPropagation(), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                    }
                  },
                  G.id
                );
              }) }),
              /* @__PURE__ */ E(
                Se,
                {
                  graph: s,
                  layout: b,
                  selectedIds: m,
                  direction: n,
                  showArrows: a,
                  routing: f,
                  portOptions: V,
                  enableEdgeQuickAdd: Ut,
                  onInsertNodeOnEdge: Jt,
                  onEdgeClick: (G) => o({ type: "SELECTION_CHANGE", payload: { selectedIds: [G] } })
                }
              ),
              /* @__PURE__ */ E("div", { className: "sysflow-nodes-layer", style: { position: "absolute", zIndex: 10, pointerEvents: "none" }, children: Object.values(s.nodes).map((G) => {
                const D = b.nodes[G.id];
                return D ? /* @__PURE__ */ E(
                  ke,
                  {
                    node: G,
                    layout: D,
                    direction: n,
                    edges: s.edges,
                    portOptions: V,
                    selected: m.includes(G.id),
                    customRenderer: G.type ? B == null ? void 0 : B[G.type] : void 0,
                    enableQuickAdd: zt,
                    onAddConnectedNode: jt,
                    onPointerDown: pt,
                    onMouseEnter: () => {
                    },
                    onMouseLeave: () => {
                    },
                    onClick: (k) => {
                      k.stopPropagation(), o({ type: "SELECTION_CHANGE", payload: { selectedIds: [G.id] } });
                    },
                    onPortPointerDown: Ot,
                    onPortPointerUp: Qt
                  },
                  G.id
                ) : null;
              }) }),
              et && /* @__PURE__ */ E(
                "div",
                {
                  className: "sysflow-node sysflow-ghost-node",
                  style: {
                    transform: `translate(${et.ghostPosition.x}px, ${et.ghostPosition.y}px)`,
                    width: `${((St = M.get(et.draggedEntity.id)) == null ? void 0 : St.width) || 200}px`,
                    height: `${((Lt = M.get(et.draggedEntity.id)) == null ? void 0 : Lt.height) || 64}px`
                  },
                  children: /* @__PURE__ */ E("div", { style: { padding: "8px 12px", fontWeight: 600 }, children: et.draggedEntity.label })
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
  Pe as EdgeRewireStrategy,
  Ee as GraphContainer,
  Se as GraphEdgeLayer,
  ke as GraphNode,
  Le as GraphPortLayer,
  me as ReparentStrategy,
  ye as SugiyamaEngine,
  Ye as SysFlowCanvas,
  be as WorkerBridge,
  Gt as computeEntityPortLocations,
  Et as pruneDanglingEdges,
  Yt as resolveEffectiveEntityId,
  Be as useCanvasTransform,
  xe as useDragGesture,
  Ne as useGraphHistory,
  Ge as useMeasurement
};
