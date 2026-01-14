import React, { useState, useEffect, useRef } from "react";
import { Entity, ID, Port } from "../models/Entity";
import { GraphModel } from "../models/GraphModel";

interface EntityEditorProps {
  entityId: ID;
  graph: GraphModel;
  position: { x: number; y: number }; // Screen position to anchor popup
  onClose: () => void;
  onGraphChange: (newGraph: GraphModel) => void;
  enablePorts: Boolean;
}

export const EntityEditor: React.FC<EntityEditorProps> = ({ 
  entityId, graph, position, onClose, onGraphChange, enablePorts 
}) => {
  // 1. Resolve Entity
  const entity = graph.nodesById[entityId] || graph.containersById[entityId];
  
  // Local state for the label so input is smooth
  const [label, setLabel] = useState(entity?.label || "");
  
  // Ref to detect clicking outside
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click is outside the editor AND outside any potential portals (like dropdowns)
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Delay adding the listener slightly to avoid closing immediately upon opening
    const timeout = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    
    return () => {
        clearTimeout(timeout);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!entity) return null;

  // --- Helper to update Graph safely ---
  const handleUpdate = (updater: (e: Entity) => void) => {
    // 1. Clone Graph (using your clone method or shallow copy)
    const newGraph = graph.clone ? graph.clone() : Object.assign(Object.create(Object.getPrototypeOf(graph)), graph);
    
    // 2. Find entity in new graph
    const target = newGraph.nodesById[entityId] || newGraph.containersById[entityId];
    
    // 3. Apply update
    if (target) updater(target);
    
    // 4. Propagate change
    onGraphChange(newGraph);
  };

  // --- Port Actions ---
  const addPort = () => {
    const newPort: Port = { 
        id: `p_${crypto.randomUUID()}`, 
        label: `Port ${(entity.ports?.length || 0) + 1}` 
    };
    
    // Use the model helper if available, or manual update
    //if (graph.addPortToEntity) {
        // We can't use graph.addPortToEntity directly on 'graph' prop because we need to trigger change
        // So we do it via handleUpdate or a cloned graph method
        const newGraph = graph.clone ? graph.clone() : Object.assign(Object.create(Object.getPrototypeOf(graph)), graph);
        newGraph.addPortToEntity(entityId, newPort);
        onGraphChange(newGraph);
//    } else {
//        // Fallback manual update
//        handleUpdate(e => {
//            if (!e.ports) e.ports = [];
//            e.ports.push(newPort);
//        });
//    }
  };

  const deletePort = (portId: string) => {
    // Crucial: Use the helper that deletes connected edges too
    const newGraph = graph.clone ? graph.clone() : Object.assign(Object.create(Object.getPrototypeOf(graph)), graph);
    if (newGraph.removePortAndEdges) {
        newGraph.removePortAndEdges(entityId, portId);
        onGraphChange(newGraph);
    }
  };

  const updatePortLabel = (portId: string, newLabel: string) => {
    handleUpdate(e => {
        const p = e.ports?.find(p => p.id === portId);
        if (p) p.label = newLabel;
    });
  };

  return (
    <div 
      ref={ref}
      style={{
        position: "fixed", 
        left: Math.min(position.x, window.innerWidth - 320), // Prevent going off-screen right
        top: Math.min(position.y, window.innerHeight - 400), // Prevent going off-screen bottom
        width: "300px",
        backgroundColor: "white",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        animation: "fadeIn 0.15s ease-out"
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 8px 16px", background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
        <input 
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            // Debounce or direct update? Direct for responsiveness, but could be optimized.
            handleUpdate(ent => ent.label = e.target.value);
          }}
          placeholder="Add title"
          style={{ 
            display: "block", width: "100%", border: "none", background: "transparent", 
            fontWeight: 400, fontSize: "22px", outline: "none", marginTop: "8px", color: "#202124"
          }}
        />
      </div>

      <div style={{ padding: "0", maxHeight: "400px", overflowY: "auto" }}>
        
        {/* Container Specific: Collapse Toggle */}
        {'collapsed' in entity && (
           <div style={{padding: "12px 16px", borderBottom: "1px solid #f1f3f4"}}>
              <label style={{display:"flex", alignItems:"center", gap: 12, fontSize: "14px", cursor: "pointer", color: "#3c4043"}}>
                <input 
                  type="checkbox" 
                  checked={(entity as any).collapsed} 
                  onChange={() => {
                     const newGraph = graph.clone ? graph.clone() : Object.assign(Object.create(Object.getPrototypeOf(graph)), graph);
                     newGraph.toggleContainerCollapsed(entity.id);
                     onGraphChange(newGraph);
                  }}
                  style={{width: 16, height: 16}}
                />
                Collapse Container Content
              </label>
           </div>
        )}

        {/* Port Manager Header */}
        {enablePorts && (
        <>
        <div style={{
            padding: "12px 16px 8px 16px", 
            display:"flex", justifyContent:"space-between", alignItems:"center"
        }}>
            <span style={{fontSize: "13px", fontWeight: 600, color: "#5f6368"}}>Ports</span>
        </div>

        {/* Port List */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {(entity.ports || []).map((port) => (
              <tr key={port.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                <td style={{ padding: "4px 16px" }}>
                  <input
                    value={port.label}
                    onChange={(e) => updatePortLabel(port.id, e.target.value)}
                    style={{ 
                        width: "100%", padding: "6px 0", border: "none", 
                        fontSize: "14px", color: "#3c4043", outline: "none",
                        background: "transparent"
                    }}
                    placeholder="Port name"
                  />
                </td>
                <td style={{ textAlign: "right", paddingRight: "12px", width: "40px" }}>
                  <button 
                    onClick={() => deletePort(port.id)}
                    title="Delete Port"
                    style={{ 
                        color: "#5f6368", border: "none", background: "none", 
                        cursor: "pointer", fontSize: "18px", padding: "4px 8px", borderRadius: "4px"
                    }}
                    onMouseOver={(e) => {e.currentTarget.style.backgroundColor = "#fce8e6"; e.currentTarget.style.color = "#c5221f"}}
                    onMouseOut={(e) => {e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#5f6368"}}
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
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
                <td colSpan={2} style={{ padding: "10px 16px", color: "#1a73e8", fontSize: "13px", fontWeight: 500 }}>
                    + Add a port
                </td>
            </tr>
          </tbody>
        </table>
      </>
      )}
      </div>
      
      {/* Footer */}
      <div style={{padding: "12px 16px", background: "#fff", borderTop: "1px solid #f1f3f4", textAlign: "right"}}>
          <button 
            onClick={onClose} 
            style={{
                padding: "8px 24px", borderRadius: "4px", border: "none", 
                background: "#1a73e8", color: "white", fontWeight: 500, cursor: "pointer", fontSize: "14px"
            }}
          >
            Done
          </button>
      </div>
    </div>
  );
};
