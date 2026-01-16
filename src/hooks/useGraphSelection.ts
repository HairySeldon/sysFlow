import { useState } from "react";
import { GraphModel } from "../models/GraphModel";
import * as GraphLogic from "../utils/GraphLogic"; // Adjust path
import { ID, Vec2 } from "../models/Entity";

export const useGraphSelection = (graph: GraphModel) => {
  const [selectedNodes, setSelectedNodes] = useState<Set<ID>>(new Set());
  const [selectedContainerIds, setSelectedContainerIds] = useState<Set<ID>>(new Set());
  
  // Lasso State
  const [lassoStart, setLassoStart] = useState<Vec2 | null>(null);
  const [lassoEnd, setLassoEnd] = useState<Vec2 | null>(null);

  const clearSelection = () => {
    setSelectedNodes(new Set());
    setSelectedContainerIds(new Set());
  };

  const selectAll = () => {
    setSelectedNodes(new Set(Object.keys(graph.nodesById)));
    setSelectedContainerIds(new Set(Object.keys(graph.containersById)));
  };

  // Handle clicking a Node or Container
  const handleEntityClick = (e: React.MouseEvent, entityId: ID, type: "node" | "container") => {
    const isNode = type === "node";
    const currentSet = isNode ? selectedNodes : selectedContainerIds;
    const setSelected = isNode ? setSelectedNodes : setSelectedContainerIds;
    const setOther = isNode ? setSelectedContainerIds : setSelectedNodes;

    if (e.shiftKey) {
      // Toggle
      const newSet = new Set(currentSet);
      if (newSet.has(entityId)) newSet.delete(entityId);
      else newSet.add(entityId);
      setSelected(newSet);
    } else {
      // Replace (unless already selected, to allow dragging group)
      if (!currentSet.has(entityId)) {
        setOther(new Set());
        setSelected(new Set([entityId]));
      }
    }
  };

  // Logic to calculate what is inside the Lasso box
  const completeLasso = () => {
    if (!lassoStart || !lassoEnd) return;
    
    const x1 = Math.min(lassoStart.x, lassoEnd.x);
    const x2 = Math.max(lassoStart.x, lassoEnd.x);
    const y1 = Math.min(lassoStart.y, lassoEnd.y);
    const y2 = Math.max(lassoStart.y, lassoEnd.y);

    // Ignore tiny accidental drags
    if (Math.abs(x2 - x1) < 5 && Math.abs(y2 - y1) < 5) {
        setLassoStart(null);
        setLassoEnd(null);
        return;
    }

    const newSelectedNodes = new Set<string>();
    const newSelectedContainers = new Set<string>();

    Object.values(graph.nodesById).forEach(node => {
      if (GraphLogic.isEntityVisible(graph, node.id) &&
          node.position.x >= x1 && node.position.x + 100 <= x2 &&
          node.position.y >= y1 && node.position.y + 50 <= y2) {
        newSelectedNodes.add(node.id);
      }
    });

    Object.values(graph.containersById).forEach(c => {
      if (GraphLogic.isEntityVisible(graph, c.id) &&
          c.position.x >= x1 && c.position.x + c.size.width <= x2 &&
          c.position.y >= y1 && c.position.y + c.size.height <= y2) {
        newSelectedContainers.add(c.id);
      }
    });

    setSelectedNodes(newSelectedNodes);
    setSelectedContainerIds(newSelectedContainers);
    setLassoStart(null);
    setLassoEnd(null);
  };

  return {
    selectedNodes,
    selectedContainerIds,
    setSelectedNodes,
    setSelectedContainerIds,
    clearSelection,
    selectAll,
    handleEntityClick,
    lassoStart, setLassoStart,
    lassoEnd, setLassoEnd,
    completeLasso
  };
};
