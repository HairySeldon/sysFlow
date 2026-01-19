import React, { useState, useEffect, useRef } from "react";
import { Entity, ID, Port } from "../models/Entity";
import { GraphModel } from "../models/GraphModel";

const editorWidth = 500;

interface EntityEditorProps {
  entityId: ID;
  graph: GraphModel;
  position: { x: number; y: number };
  onClose: () => void;
  onGraphChange: (newGraph: GraphModel) => void;
  enablePorts: boolean;
  renderCustomContent?: (entity: Entity, updateEntity: (updates: Partial<Entity>) => void) => React.ReactNode;
}

export const EntityEditor: React.FC<EntityEditorProps> = ({
  entityId,
  graph,
  position,
  onClose,
  onGraphChange,
  enablePorts,
  renderCustomContent
}) => {
  // 1. Resolve Entity (Check Nodes, Containers, OR Edges)
  const entity =
    graph.nodesById[entityId] ||
    graph.containersById[entityId] ||
    graph.edgesById[entityId];

  // Helper to distinguish types (optional, useful for UI tweaks)
  const isEdge = !!graph.edgesById[entityId];

  // Local state for the label so input is smooth
  const [label, setLabel] = useState(entity?.label || "");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!entity) return null;

  // --- Unified Update Helper ---
  // This replaces both handleUpdate and handleCustomUpdate logic
  const handleUpdate = (updater: (e: Entity) => void) => {
    // 1. Clone Graph
    const newGraph = graph.clone();

    // 2. Find entity in new graph (Check all types)
    const target =
      newGraph.nodesById[entityId] ||
      newGraph.containersById[entityId] ||
      newGraph.edgesById[entityId];

    // 3. Apply update & Propagate
    if (target) {
      updater(target);
      onGraphChange(newGraph);
    }
  };

  // Wrapper for the custom content renderer
  const handleCustomUpdate = (updates: Partial<Entity>) => {
    handleUpdate((e) => Object.assign(e, updates));
  };

  // --- Port Actions ---
  const addPort = () => {
    const newPort: Port = {
      id: `p_${crypto.randomUUID()}`,
      label: `Port ${(entity.ports?.length || 0) + 1}`,
    };
    
    const newGraph = graph.clone();
    
    // Use library method if available, otherwise manual fallback
    if (newGraph.addPortToEntity) {
        newGraph.addPortToEntity(entityId, newPort);
    } else {
        // Manual Fallback for Nodes/Containers
        const target = newGraph.nodesById[entityId] || newGraph.containersById[entityId];
        if (target) {
            target.ports = [...(target.ports || []), newPort];
        }
    }
    onGraphChange(newGraph);
  };

  const deletePort = (portId: string) => {
    const newGraph = graph.clone();
    // Use library method to ensure edges connected to this port are also removed
    if (newGraph.removePortAndEdges) {
      newGraph.removePortAndEdges(entityId, portId);
      onGraphChange(newGraph);
    }
  };

  const updatePortLabel = (portId: string, newLabel: string) => {
    handleUpdate((e) => {
      const p = e.ports?.find((p) => p.id === portId);
      if (p) p.label = newLabel;
    });
  };

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        //left: Math.min(position.x, window.innerWidth - 320),
        //top: Math.min(position.y, window.innerHeight - 400),
        left: (window.innerWidth-editorWidth)/2,
        top: (window.innerHeight-800)/2,
        width: editorWidth,
        backgroundColor: "white",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        animation: "fadeIn 0.15s ease-out",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 8px 16px", background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
        <input
          value={label}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onClose();
            }
          }}
          onChange={(e) => {
            setLabel(e.target.value);
            handleUpdate((ent) => (ent.label = e.target.value));
          }}
          placeholder="Add title"
          style={{
            display: "block",
            width: "100%",
            border: "none",
            background: "transparent",
            fontWeight: 400,
            fontSize: "22px",
            outline: "none",
            marginTop: "8px",
            color: "#202124",
          }}
        />
        {/* Optional: Label identifying type */}
        <div style={{fontSize: "11px", color: "#888", marginTop: "4px", textTransform:"uppercase"}}>
            {isEdge ? "Edge" : (graph.containersById[entityId] ? "Container" : "Node")}
        </div>
      </div>

      <div style={{ padding: "0", maxHeight: "400px", overflowY: "auto" }}>
        
        {/* Port Manager - (Hidden for Edges) */}
        {enablePorts && !isEdge && (
          <>
            <div
              style={{
                padding: "12px 16px 8px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#5f6368" }}>Ports</span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {(entity.ports || []).map((port) => (
                  <tr key={port.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                    <td style={{ padding: "4px 16px" }}>
                      <input
                        value={port.label}
                        onChange={(e) => updatePortLabel(port.id, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 0",
                          border: "none",
                          fontSize: "14px",
                          color: "#3c4043",
                          outline: "none",
                          background: "transparent",
                        }}
                        placeholder="Port name"
                      />
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "12px", width: "40px" }}>
                      <button
                        onClick={() => deletePort(port.id)}
                        title="Delete Port"
                        style={{
                          color: "#5f6368",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#fce8e6";
                          e.currentTarget.style.color = "#c5221f";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#5f6368";
                        }}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add Port Row */}
                <tr
                  onClick={addPort}
                  style={{ cursor: "pointer" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td
                    colSpan={2}
                    style={{ padding: "10px 16px", color: "#1a73e8", fontSize: "13px", fontWeight: 500 }}
                  >
                    + Add a port
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Custom Content from App */}
      {renderCustomContent && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 10, marginTop: 10 }}>
            {/* FIX: Pass 'entity' (resolved above) instead of 'node' */}
            {renderCustomContent(entity, handleCustomUpdate)}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "12px 16px", background: "#fff", borderTop: "1px solid #f1f3f4", textAlign: "right" }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 24px",
            borderRadius: "4px",
            border: "none",
            background: "#1a73e8",
            color: "white",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};
