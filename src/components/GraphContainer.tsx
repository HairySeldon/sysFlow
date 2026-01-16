import React from "react";
import { Container } from "../models/Container";

interface GraphContainerProps {
  container: Container;
  selected: boolean;
  renderContainerContent?: (c: Container, collapsed: boolean) => React.ReactNode;
  onMouseDown: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  onResizeMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export const GraphContainer = ({
  container,
  selected,
  renderContainerContent,
  onMouseDown,
  children,
  onResizeMouseDown,
  onDoubleClick
}: GraphContainerProps) => (
  <div
    style={{
      position: "absolute",
      left: container.position.x,
      top: container.position.y,
      width: container.size.width,
      height: container.collapsed ? 32 : container.size.height,
      border: selected ? "2px solid #3366ff" : "2px solid #666",
      background: "rgba(200,200,255,0.2)",
      cursor: "move",
      overflow: "hidden",
    }}
    onMouseDown={onMouseDown}
  >
    <div style={{
           height: 32,
           display: "flex",
           alignItems: "center",
           padding: "0 8px",
           fontWeight: 600,
           background: "rgba(120,120,200,0.15)",
           cursor: "default", // Changed from 'pointer' to avoid confusion
           userSelect: "none" }}>
      
      <span 
        onMouseDown={(e) => { e.stopPropagation()}}
        onMouseUp={(e) => { e.stopPropagation(); }}
        onDoubleClick={(e) => {
          e.stopPropagation(); // Stop propagation to canvas
          onDoubleClick?.(e);
        }}
        style={{ 
          cursor: "pointer", 
          padding: "4px 8px 4px 0", // Bigger hit area
          fontSize: "1.1em",
          color: "#333"
        }}
        title="Double-click to Toggle"
      >
        {container.collapsed ? "▶" : "▼"}
      </span>

      {container.label}
    </div>

    {!container.collapsed && renderContainerContent?.(container, container.collapsed)}
    {children}

    {/* RESIZE HANDLE */}
    {!container.collapsed && (
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          cursor: "nwse-resize",
          background: "linear-gradient(135deg, transparent 50%, #666 50%)",
          zIndex: 10
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeMouseDown(e);
        }}
      />
    )}
  </div>
);
