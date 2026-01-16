import React from "react";
import { GraphModel } from "../models/GraphModel";
import * as GraphLogic from "../utils/GraphLogic"; // Adjust path
import { getPortPosition } from "../utils/Geometry"; // Adjust path
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
    // Determine which ports to render
    const portsToRender = "nodeIds" in entity
      ? GraphLogic.getRenderablePorts(graph, entity)
      : (entity.ports || []);

    return portsToRender.map((port: any) => {
      // Geometry Calculation
      const absPos = getPortPosition(
        entity,
        port.id,
        graph,
        "nodeIds" in entity ? entity.size : { width: 100, height: 50 }
      );

      // Convert absolute to relative if needed (visual offset)
      let pos = { x: absPos.x, y: absPos.y };
      if ("nodeIds" in entity) {
        pos.x = absPos.x - entity.position.x;
        pos.y = absPos.y - entity.position.y;
      }

      return (
        <div
          key={port.id}
          title={port.label}
          style={{
            position: "absolute",
            left: pos.x - 6,
            top: pos.y - 6,
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#fff",
            border: "2px solid #333",
            zIndex: 10, // Ensure ports are above nodes
          }}
          onMouseEnter={() => onHoverPort({ nodeId: entity.id, portId: port.id })}
          onMouseLeave={() => onHoverPort(null)}
          onMouseDown={(e) => onPortMouseDown(e, entity.id, port.id, port.label, pos)}
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
