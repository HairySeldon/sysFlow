import React from "react";
import ReactDOM from "react-dom";
import { ContextMenu } from "./ContextMenu";

export interface CanvasMenuState {
  targetId?: string | null;
  position: { x: number; y: number };      // Screen Coords
  graphPosition?: { x: number; y: number }; // Graph Coords (Optional for backward compat)
}

interface GraphContextMenuProps {
  canvasMenu: CanvasMenuState | null;
  graph: any;
  onGraphChange: (newGraph: any) => void;
  onClose: () => void;
}

export const GraphContextMenu: React.FC<GraphContextMenuProps> = ({
  canvasMenu,
  graph,
  onGraphChange,
  onClose,
}) => {
  if (!canvasMenu) return null;

  // Fallback to position if graphPosition is missing
  const insertionPos = canvasMenu.graphPosition || canvasMenu.position;

  const getOptions = () => {
    // 1. CANVAS (Background)
    if (!canvasMenu.targetId) {
      return [
        {
          label: "Add Node",
          onClick: () => {
            const newGraph = graph.clone();
            const id = `n_${crypto.randomUUID().slice(0, 4)}`;
            newGraph.addNode({
              id,
              label: "New Node",
              position: insertionPos, // <--- USE INSERTION POS
              ports: [],
              size: { width: 100, height: 50 },
            });
            onGraphChange(newGraph);
            onClose();
          },
        },
        {
          label: "Add Container",
          onClick: () => {
            const newGraph = graph.clone();
            const id = `c_${crypto.randomUUID().slice(0, 4)}`;
            newGraph.addContainer({
              id,
              label: "New Container",
              position: insertionPos, // <--- USE INSERTION POS
              size: { width: 300, height: 200 },
              nodeIds: [],
              childContainerIds: [],
              collapsed: false,
            });
            onGraphChange(newGraph);
            onClose();
          },
        },
      ];
    }
    return [];
  };
// 2. Render via Portal
  return ReactDOM.createPortal(
    <>
      {/* Click Shield */}
      <div 
        style={{ position: "fixed", inset: 0, zIndex: 9998 }} 
        onMouseDown={(e) => { e.stopPropagation(); onClose(); }} 
      />

      {/* 3. THE WRAPPER: Handles the Real Positioning */}
      <div
        style={{
          position: "fixed",
          top: canvasMenu.position.y,
          left: canvasMenu.position.x,
          zIndex: 9999,
          // Ensure this div doesn't add extra size/margin
          margin: 0,
          padding: 0,
          transform: "none", 
        }}
      >
        {/* 4. THE FIX: Pass ZERO to the inner component 
            We force the inner component to render at 0,0 relative to this wrapper. 
        */}
        <ContextMenu 
            position={{ x: 0, y: 0 }} 
            options={getOptions()} 
        />
      </div>
    </>,
    document.body
  );
};
