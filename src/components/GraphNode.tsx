import React from "react";
import { Node } from "../models/Node";

interface GraphNodeProps {
  node: Node;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({ 
  node, 
  selected, 
  onMouseDown, 
  onDoubleClick 
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
        backgroundColor: selected ? "#e8f0fe" : "white",
        border: selected ? "2px solid #1a73e8" : "1px solid #ccc",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        cursor: "grab",
        zIndex: 10
      }}
      // 3. Attach the event handler here
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick} 
    >
      <span style={{ fontSize: "14px", color: "#333" }}>{node.label}</span>
    </div>
  );
};
