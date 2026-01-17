import { GraphModel } from "../models/GraphModel";
import { Container } from "../models/Container";
import { Node } from "../models/Node";
import { Entity, ID, Vec2, Port } from "../models/Entity";
import { getPortPosition } from "./Geometry"; // Assuming you have this from before

// Constants
export const CONTAINER_HEADER_HEIGHT = 32;
export const CONTAINER_PADDING = 24;
export const MIN_CONTAINER_WIDTH = 160;
export const MIN_CONTAINER_HEIGHT = 120;

// --- Visibility & Traversal ---

export const isEntityVisible = (graph: GraphModel, id: ID): boolean => {
  // 1. Resolve Entity
  const node = graph.nodesById[id];
  const container = graph.containersById[id];
  let currentParentId = node ? node.parentId : container?.parentId;

  // 2. Walk up ancestor chain
  while (currentParentId) {
    const parent = graph.containersById[currentParentId];
    if (!parent) break;
    if (parent.collapsed) return false; // Hidden!
    currentParentId = parent.parentId;
  }
  return true;
};

// --- Hit Testing ---

export const hitTestEntity = (graph: GraphModel, pos: Vec2): ID | null => {
  const nodes = Object.values(graph.nodesById);
  const containers = Object.values(graph.containersById);

  // 1. Check Nodes
  for (const n of nodes) {
    if (!isEntityVisible(graph, n.id)) continue;
    if (pos.x >= n.position.x && pos.x <= n.position.x + 100 &&
        pos.y >= n.position.y && pos.y <= n.position.y + 50) return n.id;
  }

  // 2. Check Containers (Variable size)
  // We reverse to click the "topmost" container first if they overlap
  for (const c of containers.reverse()) {
    if (!isEntityVisible(graph, c.id)) continue;
    if (pos.x >= c.position.x && pos.x <= c.position.x + c.size.width &&
        pos.y >= c.position.y && pos.y <= c.position.y + c.size.height) return c.id;
  }
  return null;
};

// --- Container Logic ---

const isContainerEntity = (entity: any): boolean => {
  return (
    entity &&
    (Array.isArray(entity.nodeIds) || Array.isArray(entity.childContainerIds))
  );
};

export const recomputeContainerSize = (graph: GraphModel, id: ID) => {
  const c = graph.containersById[id];
  if (!c || c.collapsed) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasChildren = false;

  // Check Nodes
  c.nodeIds.forEach(nId => {
      const n = graph.getNode(nId);
      if (!n) return;
      hasChildren = true;
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + 100);
      maxY = Math.max(maxY, n.position.y + 50); 
  });

  // Check Child Containers
  (c.childContainerIds || []).forEach(childId => {
      const ch = graph.containersById[childId];
      if (!ch) return;
      hasChildren = true;
      minX = Math.min(minX, ch.position.x);
      minY = Math.min(minY, ch.position.y);
      maxX = Math.max(maxX, ch.position.x + ch.size.width);
      maxY = Math.max(maxY, ch.position.y + ch.size.height);
  });

  if (!hasChildren) return; 

  const requiredWidth = (maxX - minX) + CONTAINER_PADDING * 2;
  const requiredHeight = (maxY - minY) + CONTAINER_PADDING * 2 + CONTAINER_HEADER_HEIGHT;

  c.size.width = Math.max(c.size.width, requiredWidth, MIN_CONTAINER_WIDTH);
  c.size.height = Math.max(c.size.height, requiredHeight, MIN_CONTAINER_HEIGHT);
};

export const assignEntityToContainer = (graph: GraphModel, entityId: ID, skipContainerId?: ID) => {
  const entity = graph.nodesById[entityId] || graph.containersById[entityId];
  if (!entity) return;

  const isContainer = isContainerEntity(entity);
  const containers = Object.values(graph.containersById);

  for (const c of containers) {
    if (c.id === entityId || (skipContainerId && c.id === skipContainerId)) continue;
    if (!isEntityVisible(graph, c.id)) continue; // Can't drop into a hidden container

    const inside =
      entity.position.x >= c.position.x &&
      entity.position.y >= c.position.y &&
      entity.position.x + (isContainer ? entity.size.width : 100) <= c.position.x + c.size.width &&
      entity.position.y + (isContainer ? entity.size.height : 50) <= c.position.y + c.size.height;

    if (inside) {
      if (entity.parentId !== c.id) {
        // Remove from old parent
        if (entity.parentId) {
             const oldParent = graph.containersById[entity.parentId];
             if (oldParent) {
                 if(isContainer) oldParent.childContainerIds = oldParent.childContainerIds?.filter(id => id !== entityId);
                 else oldParent.nodeIds = oldParent.nodeIds.filter(id => id !== entityId);
             }
        }
        
        // Add to new parent
        entity.parentId = c.id;
        if (isContainer) {
          if (!c.childContainerIds) c.childContainerIds = [];
          if (!c.childContainerIds.includes(entityId)) c.childContainerIds.push(entityId);
        } else {
          if (!c.nodeIds.includes(entityId)) c.nodeIds.push(entityId);
        }
      }
      return;
    }
  }

  // If we get here, it's not inside any container. Clear parent.
  if (entity.parentId) {
      const prev = graph.containersById[entity.parentId];
      if (prev) {
        if (isContainer) prev.childContainerIds = prev.childContainerIds?.filter(id => id !== entityId);
        else prev.nodeIds = prev.nodeIds.filter(id => id !== entityId);
      }
      entity.parentId = undefined;
  }
};

// --- Port Proxy Logic ---

export const getRenderablePorts = (graph: GraphModel, container: Container): Port[] => {
    const containerPorts = container.ports || [];
    if (!container.collapsed) return containerPorts;

    const proxyPorts: Port[] = [];
    const childNodeIds = new Set(container.nodeIds || []); 

    Object.values(graph.edgesById).forEach(edge => {
      const isSourceInside = childNodeIds.has(edge.sourceNodeId);
      const isTargetInside = childNodeIds.has(edge.targetNodeId);

      // Edge goes OUT
      if (isSourceInside && !isTargetInside) {
        const sourceNode = graph.nodesById[edge.sourceNodeId];
        const internalPort = sourceNode?.ports?.find(p => p.id === edge.sourcePortId);
        proxyPorts.push({
          id: edge.sourcePortId || `proxy-src-${edge.id}`, 
          label: internalPort ? `${sourceNode?.label}.${internalPort.label}` : "out"
        });
      } 
      // Edge comes IN
      else if (!isSourceInside && isTargetInside) {
        const targetNode = graph.nodesById[edge.targetNodeId];
        const internalPort = targetNode?.ports?.find(p => p.id === edge.targetPortId);
        proxyPorts.push({
          id: edge.targetPortId || `proxy-tgt-${edge.id}`, 
          label: internalPort ? `${targetNode?.label}.${internalPort.label}` : "in"
        });
      }
    });

    return [...containerPorts, ...proxyPorts];
};

export const collectDragStartPositions = (
  rootIds: ID[],
  map: Map<ID, Vec2>,
  graph: GraphModel
): Map<ID, Vec2> => {
  for (const id of rootIds) {
    // 1. Try finding a Node
    const n = graph.nodesById[id];
    if (n) {
      if (!map.has(id)) {
        map.set(id, { ...n.position });
      }
      continue;
    }

    // 2. Try finding a Container
    const c = graph.containersById[id];
    if (c) {
      if (!map.has(id)) {
        map.set(id, { ...c.position });
      }

      // Recursively add children nodes
      if (c.nodeIds) {
          c.nodeIds.forEach(nid => {
              const child = graph.nodesById[nid];
              if(child && !map.has(nid)) map.set(nid, {...child.position});
          });
      }
      // Recursively add child containers
      if (c.childContainerIds) {
        collectDragStartPositions(c.childContainerIds, map, graph);
      }
    }
  }
  return map;
};
