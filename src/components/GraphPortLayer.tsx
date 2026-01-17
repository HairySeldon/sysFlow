import React from "react";
import { GraphModel } from "../models/GraphModel";
import * as GraphLogic from "../utils/GraphLogic"; 
import { getPortPosition } from "../utils/Geometry"; 
import { ID, Vec2 } from "../models/Entity";

interface GraphPortLayerProps {
  graph: GraphModel;
  enablePorts: boolean;
  hoveredPort: { nodeId: ID; portId: ID } | null;
  onHoverPort: (info: { nodeId: ID; portId: ID } | null) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: ID, portId: ID, label: string, position: Vec2) => void;
}

export const GraphPortLayer: React.FC<GraphPortLayerProps> = ({
  graph,
  enablePorts,
  onHoverPort,
  onPortMouseDown,
}) => {
  if (!enablePorts) return null;

  const renderEntityPorts = (entity: any) => {
    // 1. UPDATED: Always use the entity's own ports (node OR container)
    // If you previously relied on getRenderablePorts for special logic, you can merge arrays here,
    // but for "Ports on Containers", we usually want the explicit ports from the model.
    const portsToRender = entity.ports || [];

    return portsToRender.map((port: any) => {
      // 2. UPDATED: Calculate Absolute Position for everything
      const absPos = getPortPosition(
        entity,
        port.id,
        graph
      );

      // 3. REMOVED: The logic that subtracted entity.position.
      // Since GraphPortLayer is an overlay on the canvas, we want Absolute positions for everyone.
      
      return (
        <div
          key={port.id}
          title={port.label}
          style={{
            position: "absolute",
            left: absPos.x - 6, // Center the 12px dot
            top: absPos.y - 6,
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#fff",
            border: "2px solid #333",
            zIndex: 10,
            cursor: "crosshair",
            // distinct color for container ports if you want visual debugging:
            // borderColor: "nodeIds" in entity ? "blue" : "#333" 
          }}
          onMouseEnter={() => onHoverPort({ nodeId: entity.id, portId: port.id })}
          onMouseLeave={() => onHoverPort(null)}
          onMouseDown={(e) => {
            e.stopPropagation(); // Good practice to stop canvas drag
            onPortMouseDown(e, entity.id, port.id, port.label, absPos);
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Container Ports */}
      {Object.values(graph.containersById).map((c) => {
         if (!GraphLogic.isEntityVisible(graph, c.id)) return null;
         return <React.Fragment key={`ports-${c.id}`}>{renderEntityPorts(c)}</React.Fragment>;
      })}

      {/* Node Ports */}
      {Object.values(graph.nodesById).map((n) => {
         if (!GraphLogic.isEntityVisible(graph, n.id)) return null;
         return <React.Fragment key={`ports-${n.id}`}>{renderEntityPorts(n)}</React.Fragment>;
      })}
    </>
  );
};
