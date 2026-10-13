// packages/core/src/layout/sugiyama/ConcurrentArranger.ts

import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement, LocalBox } from '../CompoundArranger';

const COLUMN_GAP = 32;
const ROW_GAP = 24;

interface ItemDim {
  id: ID;
  width: number;
  height: number;
}

interface PackingCandidate {
  width: number;
  height: number;
  boxes: LocalBox[];
  score: number;
}

interface SkylineSegment {
  x: number;
  width: number;
  y: number;
}

export class ConcurrentArranger implements ChildArranger {
  constructor(private targetAspect: number = 1.55) {}

  public arrange(
    _containerId: ID | null,
    childIds: ID[],
    _graph: LogicalGraph,
    getItemDim: (id: ID) => { width: number; height: number }
  ): ContainerArrangement {
    if (childIds.length === 0) {
      return { width: 0, height: 0, boxes: [] };
    }

    const items: ItemDim[] = childIds.map((id) => {
      const dim = getItemDim(id);
      return { id, width: dim.width, height: dim.height };
    });

    const best = this.findBestTightPacking(items, this.targetAspect);
    return { width: best.width, height: best.height, boxes: best.boxes };
  }

  private findBestTightPacking(items: ItemDim[], targetAspect: number): PackingCandidate {
    if (items.length === 1) {
      return {
        width: items[0].width,
        height: items[0].height,
        boxes: [{ id: items[0].id, localX: 0, localY: 0, width: items[0].width, height: items[0].height }],
        score: 0
      };
    }

    const totalItemArea = items.reduce((acc, it) => acc + it.width * it.height, 0);
    const maxSingleW = Math.max(...items.map((it) => it.width));
    const sortedByWidth = [...items].sort((a, b) => b.width - a.width);

    const candidateWidths = new Set<number>();
    const singleRowW = items.reduce((acc, it) => acc + it.width, 0) + (items.length - 1) * COLUMN_GAP;
    candidateWidths.add(singleRowW);
    candidateWidths.add(maxSingleW);

    const idealAspectW = Math.max(maxSingleW, Math.sqrt(totalItemArea * targetAspect));
    candidateWidths.add(idealAspectW);
    candidateWidths.add(idealAspectW * 0.85);
    candidateWidths.add(idealAspectW * 1.15);

    const maxCols = Math.min(items.length, 6);
    for (let c = 2; c <= maxCols; c++) {
      let colWidthEstimate = 0;
      for (let i = 0; i < c && i < sortedByWidth.length; i++) {
        colWidthEstimate += sortedByWidth[i].width;
      }
      colWidthEstimate += (c - 1) * COLUMN_GAP;
      if (colWidthEstimate >= maxSingleW) {
        candidateWidths.add(colWidthEstimate);
      }
    }

    let bestCandidate: PackingCandidate | null = null;

    for (const maxRowWidth of candidateWidths) {
      const candidate = this.simulateSkylinePacking(items, maxRowWidth);
      const boundingArea = candidate.width * candidate.height;
      const wastedArea = Math.max(0, boundingArea - totalItemArea);
      const aspect = candidate.width / Math.max(1, candidate.height);
      const aspectDeviation = Math.abs(Math.log(aspect / targetAspect));

      const score = (wastedArea / totalItemArea) * 2.0 + aspectDeviation * 0.25;
      candidate.score = score;

      if (!bestCandidate || score < bestCandidate.score) {
        bestCandidate = candidate;
      }
    }

    return bestCandidate!;
  }

  private simulateSkylinePacking(items: ItemDim[], maxRowWidth: number): PackingCandidate {
    const sorted = [...items].sort((a, b) => b.height - a.height);
    const skyline: SkylineSegment[] = [{ x: 0, width: maxRowWidth, y: 0 }];
    const boxes: LocalBox[] = [];

    for (const item of sorted) {
      let bestY = Infinity;
      let bestIdx = -1;

      for (let i = 0; i < skyline.length; i++) {
        const seg = skyline[i];
        if (seg.x + item.width > maxRowWidth) continue;

        let maxH = 0;
        let wCovered = 0;
        for (let j = i; j < skyline.length && wCovered < item.width; j++) {
          maxH = Math.max(maxH, skyline[j].y);
          wCovered += skyline[j].width;
        }

        if (maxH < bestY) {
          bestY = maxH;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) {
        const maxY = Math.max(...skyline.map((s) => s.y));
        const posY = maxY === 0 ? 0 : maxY + ROW_GAP;
        boxes.push({ id: item.id, localX: 0, localY: posY, width: item.width, height: item.height });

        skyline.length = 0;
        skyline.push({ x: 0, width: item.width + COLUMN_GAP, y: posY + item.height });
        if (maxRowWidth > item.width + COLUMN_GAP) {
          skyline.push({
            x: item.width + COLUMN_GAP,
            width: maxRowWidth - (item.width + COLUMN_GAP),
            y: 0
          });
        }
        continue;
      }

      const startX = skyline[bestIdx].x;
      const startY = bestY === 0 ? 0 : bestY + ROW_GAP;

      boxes.push({ id: item.id, localX: startX, localY: startY, width: item.width, height: item.height });

      const itemSpanW = item.width + COLUMN_GAP;
      const newY = startY + item.height;
      const newSeg: SkylineSegment = { x: startX, width: itemSpanW, y: newY };

      const updatedSkyline: SkylineSegment[] = [];
      for (const seg of skyline) {
        if (seg.x + seg.width <= startX || seg.x >= startX + itemSpanW) {
          updatedSkyline.push(seg);
        } else {
          if (seg.x < startX) {
            updatedSkyline.push({ x: seg.x, width: startX - seg.x, y: seg.y });
          }
          if (seg.x + seg.width > startX + itemSpanW) {
            updatedSkyline.push({
              x: startX + itemSpanW,
              width: seg.x + seg.width - (startX + itemSpanW),
              y: seg.y
            });
          }
        }
      }
      updatedSkyline.push(newSeg);
      updatedSkyline.sort((a, b) => a.x - b.x);
      skyline.length = 0;
      skyline.push(...updatedSkyline);
    }

    const overallW = Math.max(...boxes.map((b) => b.localX + b.width), 0);
    const overallH = Math.max(...boxes.map((b) => b.localY + b.height), 0);

    return { width: overallW, height: overallH, boxes, score: 0 };
  }
}
