import React, { useRef } from "react";
import { GraphModel } from "../models/GraphModel";

interface ToolbarProps {
  graph: GraphModel;
  onGraphChange: (newGraph: GraphModel) => void;
}

export const GraphToolbar = ({ graph, onGraphChange }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SAVE (EXPORT) ---
  const handleSave = async () => {
    const jsonString = graph.exportJSON();
    
    // Fix: Cast window to 'any' so TypeScript allows the new API
    const targetWindow = window as any;

    // Check if the browser supports the modern "Save As" picker
    if (targetWindow.showSaveFilePicker) {
      try {
        const handle = await targetWindow.showSaveFilePicker({
          suggestedName: `graph-${new Date().toISOString().slice(0, 10)}.json`,
          types: [{
            description: 'JSON Graph File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        
        // We also need to await the writable stream creation
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return; // Success!
      } catch (err) {
        // User cancelled the dialog or an error occurred
        console.warn("Save cancelled or failed:", err);
        return; 
      }
    }

    // --- FALLBACK (Old Method) ---
    // ... existing fallback code ...
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `graph-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- LOAD (IMPORT) ---
  const handleLoadClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        try {
          // 1. Parse JSON into GraphModel
          const newGraph = GraphModel.fromJSON(content);
          
          // 2. Update State
          onGraphChange(newGraph);
          
          // 3. Reset input so selecting the same file again works
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
          alert("Failed to load graph. Invalid JSON file.");
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ padding: 10, borderBottom: "1px solid #ccc", background: "#f5f5f5", display: "flex", gap: "10px" }}>
      <button onClick={handleSave}>Save</button>
      
      <button onClick={handleLoadClick}>Open</button>
      
      {/* Hidden Input for File Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="*"
        onChange={handleFileChange}
      />
    </div>
  );
};
