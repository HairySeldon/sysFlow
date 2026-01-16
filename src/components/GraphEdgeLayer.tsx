import React from "react";
import { Vec2 } from "../models/Entity";
import  * as GraphLogic from "../utils/GraphLogic";
// 1. Define the shape of a Container so TypeScript knows it has position/size/id
interface Container {
  id: string;
  position: Vec2;
  size: { width: number; height: number };
  nodeIds: string[];
  childContainerIds?: string[];
}

interface GraphEdgeLayerProps {
  graph: any; 
  mode: string;
  creatingEdge: { sourceNodeId: string; position: Vec2 } | null;
}

export const GraphEdgeLayer: React.FC<GraphEdgeLayerProps> = ({
  graph,
  mode,
  creatingEdge,
}) => {
  
  const getVisualPosition = (entityId: string): Vec2 | null => {
    // 1. If visible, return position
    if (GraphLogic.isEntityVisible(graph, entityId)) {
      const node = graph.nodesById[entityId];
      const container = graph.containersById[entityId];
      return node?.position || container?.position || null;
    }

    // 2. Find parent
    // FIX: Explicitly cast the finding to the Container type
    const containers: Container[] = Object.values(graph.containersById);
    
    const parent = containers.find((c) =>
        c.nodeIds.includes(entityId) || c.childContainerIds?.includes(entityId)
    );

    // FIX: Now TypeScript knows 'parent' has .id, .position, and .size
    if (parent && GraphLogic.isEntityVisible(graph, parent.id)) {
      return {
        x: parent.position.x + parent.size.width / 2,
        y: parent.position.y + parent.size.height / 2,
      };
    }

    return null;
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 0, 
      }}
    >
      {/* 1. Render Existing Edges */}
      {Object.values(graph.edgesById).map((edge: any) => {
        const start = getVisualPosition(edge.sourceNodeId);
        const end = getVisualPosition(edge.targetNodeId);

        if (!start || !end) return null; 

        return (
          <line
            key={edge.id}
            x1={start.x + (graph.nodesById[edge.sourceNodeId] ? 50 : 0)}
            y1={start.y + (graph.nodesById[edge.sourceNodeId] ? 25 : 0)}
            x2={end.x + (graph.nodesById[edge.targetNodeId] ? 50 : 0)}
            y2={end.y + (graph.nodesById[edge.targetNodeId] ? 25 : 0)}
            stroke="black"
            strokeWidth="2"
          />
        );
      })}

      {/* 2. Render Temporary "Creating" Edge */}
      {mode === "edge-create" && creatingEdge && (
        <line
          x1={creatingEdge.position.x} 
          y1={creatingEdge.position.y}
          x2={(() => {
            const n = graph.nodesById[creatingEdge.sourceNodeId];
            return n ? n.position.x + 50 : 0;
          })()}
          y2={(() => {
            const n = graph.nodesById[creatingEdge.sourceNodeId];
            return n ? n.position.y + 25 : 0;
          })()}
          stroke="black"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
    </svg>
  );
};
