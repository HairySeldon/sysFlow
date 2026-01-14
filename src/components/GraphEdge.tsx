import React from "react";
import { ID, Vec2 } from "../models/Entity";

interface GraphEdgeProps {
  from: Vec2;
  to: Vec2;
  selected: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({ from, to, selected, onClick, onContextMenu }) => {
  return (
    <g>
      {/* 1. HIT AREA (Thick, Invisible Line) */}
      <line
        x1={from.x} 
        y1={from.y} 
        x2={to.x} 
        y2={to.y}
        // Use rgba(0,0,0,0) instead of "transparent" for better hit-testing in some browsers
        stroke="rgba(0,0,0,0)" 
        strokeWidth={20}       
        style={{ 
          cursor: 'pointer', 
          // CRITICAL: 'all' forces this element to capture clicks 
          // even though the parent SVG has pointer-events: none
          pointerEvents: 'all' 
        }} 
        onClick={onClick} 
        onContextMenu={onContextMenu}
      />

      {/* 2. VISIBLE LINE */}
      <line
        x1={from.x} 
        y1={from.y} 
        x2={to.x} 
        y2={to.y}
        stroke={selected ? "red" : "blue"}
        strokeWidth={2}
        style={{ pointerEvents: 'none' }} // Pass clicks through to the hit area
      />
    </g>
  );
};
