import { Entity, Vec2, ID } from "../models/Entity";
import { GraphModel } from "../models/GraphModel";

/**
 * Helper to safely resolve entity size.
 * Defaults to a standard node size (150x60) if width/height are missing.
 */
const getEntitySize = (entity: Entity): { width: number; height: number } => {
  // Use explicit properties if they exist, otherwise fallback defaults
  return {
    width: entity.size.width ?? 150,
    height: entity.size.height ?? 60
  };
};

/**
 * Calculates the exact (x,y) screen coordinate for a specific port on an entity.
 * Now self-contained: determines entity sizes internally.
 */
export const getPortPosition = (
  entity: Entity,
  portId: ID,
  graph: GraphModel
): Vec2 => {
  // 1. Resolve geometry for the source entity
  const entitySize = getEntitySize(entity);
  const center = getCenter(entity.position, entitySize);

  // 2. Find if this port is connected to an edge
  const connectedEdge = Object.values(graph.edgesById).find(
    (e) =>
      (e.sourceNodeId === entity.id && e.sourcePortId === portId) ||
      (e.targetNodeId === entity.id && e.targetPortId === portId)
  );

  if (connectedEdge) {
    // --- CASE A: Connected (Dynamic Position) ---
    // The port should "slide" to face the other node.

    const isSource = connectedEdge.sourceNodeId === entity.id;
    const targetNodeId = isSource ? connectedEdge.targetNodeId : connectedEdge.sourceNodeId;
    const targetEntity = graph.nodesById[targetNodeId] || graph.containersById[targetNodeId];

    if (!targetEntity) return center; // Fallback

    // Resolve geometry for the target entity
    const targetSize = getEntitySize(targetEntity);
    const targetCenter = getCenter(targetEntity.position, targetSize);

    // Use intersection logic to find the point on the source entity's bounding box
    // that faces the target center.
    return getRectIntersection(center, entitySize, targetCenter);
  } else {
    // --- CASE B: Unconnected (Static Distribution) ---
    // Distribute unconnected ports along the LEFT edge.

    const unconnectedPorts = (entity.ports || []).filter((p) => {
      return !Object.values(graph.edgesById).some(
        (e) =>
          (e.sourceNodeId === entity.id && e.sourcePortId === p.id) ||
          (e.targetNodeId === entity.id && e.targetPortId === p.id)
      );
    });

    const index = unconnectedPorts.findIndex((p) => p.id === portId);
    if (index === -1) return center; 

    // Space them evenly based on the entity's actual height
    const step = entitySize.height / (unconnectedPorts.length + 1);
    return {
      x: entity.position.x, // Left edge
      y: entity.position.y + step * (index + 1),
    };
  }
};

/**
 * Calculates the intersection point between a line (from center to target)
 * and the bounding box of the source node.
 */
export const getRectIntersection = (
  center: Vec2,
  size: { width: number; height: number },
  target: Vec2
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
  const scaleX = hw / Math.abs(dx);
  const scaleY = hh / Math.abs(dy);

  const scale = Math.min(scaleX, scaleY);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
};

// Helper to get center of a node/container
export const getCenter = (
  pos: Vec2,
  size: { width: number; height: number }
): Vec2 => ({
  x: pos.x + size.width / 2,
  y: pos.y + size.height / 2,
});
