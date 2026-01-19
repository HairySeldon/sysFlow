import React, { useState } from "react";
import { GraphCanvas } from "../components/GraphCanvas";
import { createInitialGraph } from "./initialGraph";
import { GraphModel } from "../models/GraphModel";
import { Node } from "../models/Node";
import { Container } from "../models/Container";
import { GraphToolbar } from "./GraphToolbar";

export const App = () => {
  const [graph, setGraph] = useState(() => new GraphModel()); //useState<GraphModel>(createInitialGraph());

  // Define Node Style
  const renderNode = (node: Node, selected: boolean) => (
    <div style={{
      width: 100,
      height: 50,
      border: `2px solid ${selected ? "blue" : "gray"}`,
      borderRadius: 4,
      background: selected ? "rgba(0,120,255,0.2)" : "#eee",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      userSelect: "none",
    }}>
      {node.label}
    </div>
  );

  // Define Container Style
  const renderContainer = (container: Container, collapsed: boolean) => (
    <div style={{
      padding: 8,
      background: "rgba(180,180,250,0.1)",
      height: collapsed ? 0 : "100%",
      overflow: "hidden",
      fontSize: 12,
      color: "#333",
    }}>
      {container.nodeIds.join(", ")}
    </div>
  );

return (
    <div style={{ width: "100vw",  height: "100vh", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", margin: 0, padding: 0, backgroundColor: "#f0f0f0" }}>
  
      {/* The Toolbar */}
      <GraphToolbar graph={graph} onGraphChange={setGraph} />

      {/* Main Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#fafafa" }}>
        <GraphCanvas
          graph={graph}
          onGraphChange={(newGraph) => {
             setGraph(newGraph);
          }}
          renderNode={renderNode}
          renderContainer={renderContainer}
          enablePorts={true}
          renderEditor={(node, updateNode) => {
            return (
              <div>
                <label style={{ display: "block", fontSize: "0.8em", marginBottom: "4px" }}>
                  Custom Description:
                </label>
                <textarea
                  style={{ width: "100%", height: "60px" }}
                  
                  // Read from the generic 'data' bucket
                  value={node.data?.description || ""} 
                  
                  // Write to the generic 'data' bucket
                  onChange={(e) => {
                    updateNode({
                      data: { ...node.data, description: e.target.value }
                    });
                  }}
                />
              </div>
            );
        }}
        />
      </div>
    </div>
  );
};

