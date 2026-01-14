// utils/Geometry.ts
import { Entity, Vec2, SIZE, Port, ID } from "../models/Entity";
import { Edge } from "../models/Edge";
import { GraphModel } from "../models/GraphModel"; // Assuming you have a Graph model export

/**
 * Calculates the exact (x,y) screen coordinate for a specific port on an entity.
 */
export const getPortPosition = (
  entity: Entity,
  portId: ID,
  graph: GraphModel,
  entitySize: SIZE
): Vec2 => {
  const center = getCenter(entity.position, entitySize);
  
  // 1. Find if this port is connected to an edge
  // We need to look for an edge where this port is either source or target
  const connectedEdge = Object.values(graph.edgesById).find(
    (e) => 
      (e.sourceNodeId === entity.id && e.sourcePortId === portId) || 
      (e.targetNodeId === entity.id && e.targetPortId === portId)
  );

  if (connectedEdge) {
    // --- CASE A: Connected (Dynamic Position) ---
    // The port should "slide" to face the other node.
    
    // Determine the ID of the *other* node
    const isSource = connectedEdge.sourceNodeId === entity.id;
    const targetNodeId = isSource ? connectedEdge.targetNodeId : connectedEdge.sourceNodeId;
    const targetEntity = graph.nodesById[targetNodeId] || graph.containersById[targetNodeId];

    if (!targetEntity) return center; // Fallback

    // Get the center of the target (approximate, since we don't have target size easily here. 
    // In a real app, you might pass a lookup or store size on Entity).
    // For now, let's assume target position + 50 offset if size unknown, 
    // or you can pass a full entity map with sizes.
    // simpler: Just use targetEntity.position for calculation direction
    const targetCenter = { x: targetEntity.position.x + 50, y: targetEntity.position.y + 20 };
    
    // Use the intersection logic to find the edge point
    return getRectIntersection(center, entitySize, targetCenter);
  } else {
    // --- CASE B: Unconnected (Static Distribution) ---
    // Distribute unconnected ports along the LEFT edge.
    
    // Find index of this port among ALL unconnected ports to space them out
    const unconnectedPorts = (entity.ports || []).filter(p => {
       return !Object.values(graph.edgesById).some(e => 
        (e.sourceNodeId === entity.id && e.sourcePortId === p.id) ||
        (e.targetNodeId === entity.id && e.targetPortId === p.id)
       );
    });

    const index = unconnectedPorts.findIndex(p => p.id === portId);
    if (index === -1) return center; // Should not happen

    // Space them evenly
    const step = entitySize.height / (unconnectedPorts.length + 1);
    return {
      x: entity.position.x, // Left edge
      y: entity.position.y + step * (index + 1)
    };
  }
};

/**
 * Calculates the intersection point between a line (from center to target)
 * and the bounding box of the source node.
 */
export const getRectIntersection = (
  center: Vec2,      // Center of the source node
  size: { width: number; height: number },
  target: Vec2,      // The point we are connecting TO
  padding: number = 0 // Offset for the port circle (e.g. half its radius)
): Vec2 => {
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  // Avoid division by zero
  if (dx === 0 && dy === 0) return { ...center };

  // Half dimensions
  const hw = size.width / 2;
  const hh = size.height / 2;

  // Calculate the "scale" needed to stretch the vector (dx, dy) 
  // until it hits the box wall.
  // We check both X and Y constraints and pick the smaller scale (the one hit first).
  const scaleX = hw / Math.abs(dx);
  const scaleY = hh / Math.abs(dy);
  
  const scale = Math.min(scaleX, scaleY);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
};

// Helper to get center of a node/container
export const getCenter = (pos: Vec2, size: { width: number; height: number }): Vec2 => ({
  x: pos.x + size.width / 2,
  y: pos.y + size.height / 2,
});
