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
// Logic to calculate what is inside the Lasso box
type ViewState = { x: number; y: number; zoom: number};
const completeLasso = (view : ViewState) => {
  if (!lassoStart || !lassoEnd) return;

  // 1. Calculate the Lasso Box in SCREEN Coordinates (Pixels)
  const screenX1 = Math.min(lassoStart.x, lassoEnd.x);
  const screenX2 = Math.max(lassoStart.x, lassoEnd.x);
  const screenY1 = Math.min(lassoStart.y, lassoEnd.y);
  const screenY2 = Math.max(lassoStart.y, lassoEnd.y);

  // Ignore tiny accidental drags
  if (Math.abs(screenX2 - screenX1) < 5 && Math.abs(screenY2 - screenY1) < 5) {
      setLassoStart(null);
      setLassoEnd(null);
      return;
  }

  // 2. CONVERT to WORLD Coordinates (The Graph's Reality)
  // Formula: (Screen - Pan) / Zoom
  const worldX1 = (screenX1 - view.x) / view.zoom;
  const worldX2 = (screenX2 - view.x) / view.zoom;
  const worldY1 = (screenY1 - view.y) / view.zoom;
  const worldY2 = (screenY2 - view.y) / view.zoom;

  const newSelectedNodes = new Set<string>();
  const newSelectedContainers = new Set<string>();

  // 3. Check collisions against the WORLD Box
  Object.values(graph.nodesById).forEach(node => {
    if (GraphLogic.isEntityVisible(graph, node.id) &&
        node.position.x >= worldX1 && 
        node.position.x + 100 <= worldX2 && // Assuming fixed width 100
        node.position.y >= worldY1 && 
        node.position.y + 50 <= worldY2) {  // Assuming fixed height 50
        
        newSelectedNodes.add(node.id);
    }
  });

  Object.values(graph.containersById).forEach(c => {
    if (GraphLogic.isEntityVisible(graph, c.id) &&
        c.position.x >= worldX1 && 
        c.position.x + c.size.width <= worldX2 &&
        c.position.y >= worldY1 && 
        c.position.y + c.size.height <= worldY2) {
        
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
