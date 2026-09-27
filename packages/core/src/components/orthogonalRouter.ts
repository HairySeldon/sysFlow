// packages/core/src/components/orthogonalRouter.ts

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export type PortSide = 'left' | 'right' | 'top' | 'bottom';

const SIDE_NORMALS: Record<PortSide, Point> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 }
};

function pointInRect(p: Point, r: Rect, margin = 0): boolean {
  return (
    p.x > r.left + margin &&
    p.x < r.right - margin &&
    p.y > r.top + margin &&
    p.y < r.bottom - margin
  );
}

function segmentIntersectsRect(p1: Point, p2: Point, r: Rect): boolean {
  // If either point is strictly inside the obstacle
  if (pointInRect(p1, r, 2) || pointInRect(p2, r, 2)) return true;

  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  // Bounding box rejection
  if (maxX <= r.left || minX >= r.right || maxY <= r.top || minY >= r.bottom) {
    return false;
  }

  // Horizontal segment passing through rect
  if (p1.y === p2.y) {
    return p1.y > r.top && p1.y < r.bottom && minX < r.right && maxX > r.left;
  }

  // Vertical segment passing through rect
  if (p1.x === p2.x) {
    return p1.x > r.left && p1.x < r.right && minY < r.bottom && maxY > r.top;
  }

  return false;
}

export function routeOrthogonal(
  p0: Point,
  side0: PortSide,
  p1: Point,
  side1: PortSide,
  obstacles: Rect[],
  padding = 18
): Point[] {
  const n0 = SIDE_NORMALS[side0] || { x: 1, y: 0 };
  const n1 = SIDE_NORMALS[side1] || { x: -1, y: 0 };

  const stubLength = 24;
  const startStub: Point = { x: p0.x + n0.x * stubLength, y: p0.y + n0.y * stubLength };
  const endStub: Point = { x: p1.x + n1.x * stubLength, y: p1.y + n1.y * stubLength };

  // Expand obstacles with clearance padding
  const paddedObstacles: Rect[] = obstacles.map((o) => ({
    left: o.left - padding,
    top: o.top - padding,
    right: o.right + padding,
    bottom: o.bottom + padding
  }));

  // Direct line test between stubs
  const directConnectHorizontal =
    !segmentIntersectsAny(startStub, { x: endStub.x, y: startStub.y }, paddedObstacles) &&
    !segmentIntersectsAny({ x: endStub.x, y: startStub.y }, endStub, paddedObstacles);

  if (directConnectHorizontal) {
    return [p0, startStub, { x: endStub.x, y: startStub.y }, endStub, p1];
  }

  const directConnectVertical =
    !segmentIntersectsAny(startStub, { x: startStub.x, y: endStub.y }, paddedObstacles) &&
    !segmentIntersectsAny({ x: startStub.x, y: endStub.y }, endStub, paddedObstacles);

  if (directConnectVertical) {
    return [p0, startStub, { x: startStub.x, y: endStub.y }, endStub, p1];
  }

  // Channel Grid Pathfinding
  const xs = new Set<number>([p0.x, startStub.x, endStub.x, p1.x]);
  const ys = new Set<number>([p0.y, startStub.y, endStub.y, p1.y]);

  paddedObstacles.forEach((r) => {
    xs.add(r.left);
    xs.add(r.right);
    ys.add(r.top);
    ys.add(r.bottom);
  });

  const xList = Array.from(xs).sort((a, b) => a - b);
  const yList = Array.from(ys).sort((a, b) => a - b);

  // A* search over orthogonal grid
  const key = (p: Point) => `${Math.round(p.x)},${Math.round(p.y)}`;
  const openSet: Array<{ p: Point; cost: number; g: number; path: Point[]; dir?: string }> = [
    { p: startStub, cost: 0, g: 0, path: [p0, startStub] }
  ];
  const visited = new Set<string>();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.cost - b.cost);
    const curr = openSet.shift()!;
    const k = key(curr.p);

    if (Math.hypot(curr.p.x - endStub.x, curr.p.y - endStub.y) < 1) {
      return [...curr.path, p1];
    }

    if (visited.has(k)) continue;
    visited.add(k);

    const xi = xList.indexOf(curr.p.x);
    const yi = yList.indexOf(curr.p.y);

    const neighbors: Array<{ p: Point; dir: string }> = [];
    if (xi > 0) neighbors.push({ p: { x: xList[xi - 1], y: curr.p.y }, dir: 'H' });
    if (xi < xList.length - 1) neighbors.push({ p: { x: xList[xi + 1], y: curr.p.y }, dir: 'H' });
    if (yi > 0) neighbors.push({ p: { x: curr.p.x, y: yList[yi - 1] }, dir: 'V' });
    if (yi < yList.length - 1) neighbors.push({ p: { x: curr.p.x, y: yList[yi + 1] }, dir: 'V' });

    for (const next of neighbors) {
      if (segmentIntersectsAny(curr.p, next.p, paddedObstacles)) continue;

      const segLen = Math.hypot(next.p.x - curr.p.x, next.p.y - curr.p.y);
      const bendPenalty = curr.dir && curr.dir !== next.dir ? 50 : 0;
      const g = curr.g + segLen + bendPenalty;
      const h = Math.abs(endStub.x - next.p.x) + Math.abs(endStub.y - next.p.y);

      openSet.push({
        p: next.p,
        cost: g + h,
        g,
        path: [...curr.path, next.p],
        dir: next.dir
      });
    }
  }

  // Fallback: Default orthogonal Z-path
  return [p0, startStub, { x: endStub.x, y: startStub.y }, endStub, p1];
}

function segmentIntersectsAny(p1: Point, p2: Point, obstacles: Rect[]): boolean {
  for (const obs of obstacles) {
    if (segmentIntersectsRect(p1, p2, obs)) return true;
  }
  return false;
}

export function pointsToSvgPath(points: Point[], cornerRadius = 6): string {
  if (points.length < 2) return '';
  if (points.length === 2 || cornerRadius <= 0) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    const radius = Math.min(cornerRadius, d1 / 2, d2 / 2);

    const v1 = { x: (curr.x - prev.x) / d1, y: (curr.y - prev.y) / d1 };
    const v2 = { x: (next.x - curr.x) / d2, y: (next.y - curr.y) / d2 };

    const startCurve = { x: curr.x - v1.x * radius, y: curr.y - v1.y * radius };
    const endCurve = { x: curr.x + v2.x * radius, y: curr.y + v2.y * radius };

    d += ` L ${startCurve.x} ${startCurve.y} Q ${curr.x} ${curr.y} ${endCurve.x} ${endCurve.y}`;
  }

  d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
}
