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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
  
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
        />
      </div>
    </div>
  );
};

