import React from "react";
import { Vec2 } from "../models/Entity";
import * as GraphLogic from "../utils/GraphLogic";

interface EntityShape {
  id: string;
  position: Vec2;
  size?: { width: number; height: number };
  nodeIds?: string[];
  childContainerIds?: string[];
}

interface GraphEdgeLayerProps {
  graph: any;
  mode: string;
  creatingEdge: { sourceNodeId: string; position: Vec2 } | null;
  selectedEdgeId: string | null; // NEW
  onEdgeClick: (e: React.MouseEvent, edgeId: string) => void; // NEW
}

export const GraphEdgeLayer: React.FC<GraphEdgeLayerProps> = ({
  graph,
  mode,
  creatingEdge,
  selectedEdgeId,
  onEdgeClick
}) => {

  const getEntity = (id: string): EntityShape | undefined => {
    return graph.nodesById[id] || graph.containersById[id];
  };

  const getEntityCenter = (entity: EntityShape) => {
    const w = entity.size?.width ?? 100;
    const h = entity.size?.height ?? 50;
    return {
      x: entity.position.x + w / 2,
      y: entity.position.y + h / 2
    };
  };

  const getVisualAnchor = (entityId: string): Vec2 | null => {
    // 1. Visible Entity
    if (GraphLogic.isEntityVisible(graph, entityId)) {
      const entity = getEntity(entityId);
      return entity ? getEntityCenter(entity) : null;
    }
    // 2. Collapsed Parent
    const containers: EntityShape[] = Object.values(graph.containersById);
    const parent = containers.find((c) =>
      c.nodeIds?.includes(entityId) || c.childContainerIds?.includes(entityId)
    );
    if (parent && GraphLogic.isEntityVisible(graph, parent.id)) {
      return getEntityCenter(parent);
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
        pointerEvents: "none", // Let clicks pass through empty space
        overflow: "visible",
        zIndex: 0,
      }}
    >
      {/* 1. Render Existing Edges */}
      {Object.values(graph.edgesById).map((edge: any) => {
        const start = getVisualAnchor(edge.sourceNodeId);
        const end = getVisualAnchor(edge.targetNodeId);

        if (!start || !end) return null;

        const isSelected = selectedEdgeId === edge.id;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        return (
          <g key={edge.id} style={{ pointerEvents: "all" }}> 
            {/* A. Thick Invisible Hit Area (makes clicking easier) */}
            <line
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="transparent"
              strokeWidth="15"
              cursor="pointer"
              onClick={(e) => {
                 e.stopPropagation();
                 onEdgeClick(e, edge.id);
              }}
            />

            {/* B. Visible Line */}
            <line
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke={isSelected ? "#3366ff" : "black"}
              strokeWidth={isSelected ? "3" : "2"}
              pointerEvents="none" // Click goes through to the Hit Area
            />

            {/* C. Label (Background + Text) */}
            {edge.label && (
              <g transform={`translate(${midX}, ${midY})`}>
                 <rect 
                    x={-(edge.label.length * 4) - 4} 
                    y={-10} 
                    width={(edge.label.length * 8) + 8} 
                    height={20} 
                    fill="white" 
                    rx="4"
                    stroke={isSelected ? "#3366ff" : "#ccc"}
                 />
                 <text
                    x={0} y={4}
                    textAnchor="middle"
                    fontSize="12"
                    fill={isSelected ? "#3366ff" : "black"}
                    style={{ userSelect: "none" }}
                 >
                   {edge.label}
                 </text>
              </g>
            )}
          </g>
        );
      })}

      {/* 2. Creating Edge (No changes) */}
      {mode === "edge-create" && creatingEdge && (
        <line
          x1={creatingEdge.position.x}
          y1={creatingEdge.position.y}
          x2={(() => {
            const source = getEntity(creatingEdge.sourceNodeId);
            return source ? getEntityCenter(source).x : creatingEdge.position.x;
          })()}
          y2={(() => {
             const source = getEntity(creatingEdge.sourceNodeId);
             return source ? getEntityCenter(source).y : creatingEdge.position.y;
          })()}
          stroke="black"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
    </svg>
  );
};
