import { Node } from "./Node";
import { Container } from "./Container";
import { Edge } from "./Edge";
import { Port, ID, Vec2 } from "./Entity";

export class GraphModel {
  nodesById: Record<ID, Node> = {};
  containersById: Record<ID, Container> = {};
  edgesById: Record<ID, Edge> = {};

  addNode(node: Node) { this.nodesById[node.id] = node; }
  addContainer(container: Container) { this.containersById[container.id] = container; }
  addEdge(edge: Edge) { this.edgesById[edge.id] = edge; }

  getNode(id: ID) { return this.nodesById[id]; }
  getContainer(id: ID) { return this.containersById[id]; }

  moveNode(id: ID, pos: Vec2) { const n = this.getNode(id); if (n) n.position = pos; }
  moveContainer(id: ID, pos: Vec2) { const c = this.getContainer(id); if (c) c.position = pos; }

  // --- SAFE REMOVAL METHODS ---

  // UPDATED: Safely remove a node, its edges, and its reference from parents
  removeNode(id: ID) {
    const node = this.nodesById[id];
    if (!node) return;

    // 1. Remove all edges connected to this node
    Object.values(this.edgesById).forEach(edge => {
      if (edge.sourceNodeId === id || edge.targetNodeId === id) {
        delete this.edgesById[edge.id];
      }
    });

    // 2. Remove node from its parent container (if it has one)
    if (node.parentId) {
      const parent = this.containersById[node.parentId];
      if (parent) {
        parent.nodeIds = parent.nodeIds.filter(nid => nid !== id);
      }
    }

    // 3. Finally, delete the node
    delete this.nodesById[id];
  }

  removeEdge(id: ID) { delete this.edgesById[id]; }

  // ADDED: The missing method required by GraphCanvas
  removeContainer(id: ID) {
    const container = this.containersById[id];
    if (!container) return;

    // 1. Remove this container from its parent's list (if nested)
    if (container.parentId) {
      const parent = this.containersById[container.parentId];
      if (parent && parent.childContainerIds) {
        parent.childContainerIds = parent.childContainerIds.filter(cid => cid !== id);
      }
    }

    // 2. Recursively delete everything inside it
    this.removeContainerRecursive(id);
  }

  // Existing recursive helper (called by removeContainer)
  removeContainerRecursive(id: ID) {
    const c = this.containersById[id];
    if (!c) return;
    
    // Delete child nodes (this now calls the SAFE removeNode above)
    if (c.nodeIds) {
        [...c.nodeIds].forEach(nid => this.removeNode(nid));
    }
    
    // Delete child containers recursively
    if (c.childContainerIds) {
        [...c.childContainerIds].forEach(cid => this.removeContainerRecursive(cid));
    }
    
    // Delete container itself
    delete this.containersById[id];
  }

  // --- PORT MANAGEMENT ---

  addPortToEntity(entityId: string, port: Port): void {
    const node = this.nodesById[entityId];
    if (node) {
      if (!node.ports) node.ports = [];
      node.ports.push(port);
      return;
    }

    const container = this.containersById[entityId];
    if (container) {
      if (!container.ports) container.ports = [];
      container.ports.push(port);
      return;
    }
    console.warn(`Could not find entity with ID ${entityId} to add port.`);
  }

  removePortAndEdges(entityId: string, portId: string): void {
    const entity = this.nodesById[entityId] || this.containersById[entityId];
    if (!entity || !entity.ports) return;

    // Remove the Port from the Entity
    entity.ports = entity.ports.filter(p => p.id !== portId);

    // Remove all Edges connected to this Port
    const edgeIdsToRemove: string[] = [];
    Object.values(this.edgesById).forEach(edge => {
      if (
        (edge.sourceNodeId === entityId && edge.sourcePortId === portId) ||
        (edge.targetNodeId === entityId && edge.targetPortId === portId)
      ) {
        edgeIdsToRemove.push(edge.id);
      }
    });

    edgeIdsToRemove.forEach(id => delete this.edgesById[id]);
  }

  toggleContainerCollapsed(id: ID) {
    const c = this.getContainer(id);
    if (c) c.collapsed = !c.collapsed;
  }

  clone(): GraphModel {
    const copy = new GraphModel();
    // Deep copy is safer for objects, but spread is okay if you don't mutate nested arrays directly without cloning them first
    // ideally you might want structuredClone, but this works for basic levels
    copy.nodesById = JSON.parse(JSON.stringify(this.nodesById));
    copy.containersById = JSON.parse(JSON.stringify(this.containersById));
    copy.edgesById = JSON.parse(JSON.stringify(this.edgesById));
    return copy;
  }

  exportJSON() {
    return JSON.stringify({
      nodes: this.nodesById,
      containers: this.containersById,
      edges: this.edgesById
    }, null, 2); // Pretty print
  }

  static fromJSON(jsonStr: string): GraphModel {
    try {
      const raw = JSON.parse(jsonStr);
      
      const newGraph = new GraphModel();
      
      // Assign data, defaulting to empty objects if missing to prevent crashes
      newGraph.nodesById = raw.nodes || {};
      newGraph.containersById = raw.containers || {};
      newGraph.edgesById = raw.edges || {};
      
      return newGraph;
    } catch (e) {
      console.error("Failed to parse Graph JSON:", e);
      // Return an empty graph or re-throw depending on how you want to handle errors
      return new GraphModel(); 
    }
  }
}
