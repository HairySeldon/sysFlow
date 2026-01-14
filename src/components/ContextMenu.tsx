import React from "react";
import { Vec2 } from "../models/Entity";

interface ContextMenuProps {
  position: Vec2;
  options: { label: string; onClick: () => void }[];
}

export const ContextMenu = ({ position, options }: ContextMenuProps) => (
  <div style={{
     position: "absolute",
     left: position.x,
     top: position.y,
     background: "#fff",
     border: "1px solid #ccc",
     padding: 4,
     zIndex: 1000 
    }}
    onMouseDown={e => e.stopPropagation()}>
    {options.map(opt => (
      <div 
        key={opt.label} 
        style={{ 
            cursor: "pointer",
            padding: 4
        }}
        onClick={opt.onClick}>{opt.label}
      </div>
    ))}
  </div>
);

