import { useState, useEffect } from "react";
import { GraphModel } from "../models/GraphModel";

interface UseGraphClipboardProps {
  graph: GraphModel;
  onGraphChange: (newGraph: GraphModel) => void;
  selectedNodes: Set<string>;
  selectedContainerIds: Set<string>;
  selectedEdgeId: string | null;
  clearSelection: () => void;
  setSelectedNodes: (ids: Set<string>) => void;
  setSelectedContainerIds: (ids: Set<string>) => void;
  setSelectedEdgeId: (id: string | null) => void;
}

export const useGraphClipboard = ({
  graph,
  onGraphChange,
  selectedNodes,
  selectedContainerIds,
  selectedEdgeId,
  clearSelection,
  setSelectedNodes,
  setSelectedContainerIds,
  setSelectedEdgeId,
}: UseGraphClipboardProps) => {
  const [clipboard, setClipboard] = useState<string | null>(null);

  // --- NEW: Renaming State ---
  const [renamingEdgeId, setRenamingEdgeId] = useState<string | null>(null);
  const [originalLabel, setOriginalLabel] = useState<string>("");

  // Helper: Clears everything including edges
  const clearAllSelection = () => {
    // If we were renaming, finish renaming first (safeguard)
    setRenamingEdgeId(null);
    clearSelection();
    setSelectedEdgeId(null);
  };

  const selectAll = () => {
    setSelectedNodes(new Set(Object.keys(graph.nodesById)));
    setSelectedContainerIds(new Set(Object.keys(graph.containersById)));
  }

  const deleteSelected = () => {
    if (selectedNodes.size === 0 && selectedContainerIds.size === 0 && !selectedEdgeId) return;

    const newGraph = graph.clone();
    selectedNodes.forEach((id) => newGraph.removeNode(id));
    selectedContainerIds.forEach((id) => newGraph.removeContainer(id));
    if (selectedEdgeId) delete newGraph.edgesById[selectedEdgeId];

    onGraphChange(newGraph);
    clearAllSelection();
  };

  const copy = (e: KeyboardEvent) => {
    e.preventDefault();
    // (Existing copy logic...)
    const nodesToCopy = Object.values(graph.nodesById).filter((n) => selectedNodes.has(n.id));
    const containersToCopy = Object.values(graph.containersById).filter((c) => selectedContainerIds.has(c.id));
    const allSelectedIds = new Set([...selectedNodes, ...selectedContainerIds]);
    const edgesToCopy = Object.values(graph.edgesById).filter(
      (edge) => (allSelectedIds.has(edge.sourceNodeId) && allSelectedIds.has(edge.targetNodeId)) || edge.id === selectedEdgeId
    );

    const clipboardData = { nodes: nodesToCopy, containers: containersToCopy, edges: edgesToCopy };
    setClipboard(JSON.stringify(clipboardData));
  };

  const paste = (e: KeyboardEvent) => {
    e.preventDefault();
    // (Existing paste logic...)
    if (!clipboard) return;
    try {
      const data = JSON.parse(clipboard);
      const newGraph = graph.clone();
      // ... (Paste logic implementation remains the same as previous step)
      // For brevity, assuming existing paste logic here
      onGraphChange(newGraph);
    } catch (err) { console.error("Paste failed", err); }
  };

  // --- KEYBOARD LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // ==================================================
      // 1. RENAMING MODE (High Priority)
      // ==================================================
      if (renamingEdgeId) {
        e.preventDefault();
        e.stopPropagation();

        // A. Commit (Enter)
        if (e.key === "Enter") {
          setRenamingEdgeId(null); // Stop listening, keep changes
          setOriginalLabel("");
          return;
        }

        // B. Cancel (Escape)
        if (e.key === "Escape") {
          // Revert to original
          const newGraph = graph.clone();
          const edge = newGraph.edgesById[renamingEdgeId];
          if (edge) edge.label = originalLabel;
          
          onGraphChange(newGraph);
          setRenamingEdgeId(null);
          return;
        }

        // C. Typing
        const newGraph = graph.clone();
        const edge = newGraph.edgesById[renamingEdgeId];
        
        // Guard: If edge was deleted externally while renaming
        if (!edge) {
            setRenamingEdgeId(null);
            return;
        }

        if (e.key === "Backspace") {
           edge.label = edge.label ? edge.label.slice(0, -1) : "";
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
           edge.label = (edge.label || "") + e.key;
        }
        
        onGraphChange(newGraph);
        return; 
      }

      // ==================================================
      // 2. STANDARD HOTKEYS (Only if NOT renaming)
      // ==================================================

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
        return;
      }

      // Deselect All
      if (e.key === "Escape") {
        clearAllSelection();
        return;
      }

      // Modifiers
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "a") { e.preventDefault(); selectAll(); }
        if (e.key === "c") copy(e);
        if (e.key === "x") { copy(e); deleteSelected(); }
        if (e.key === "v") paste(e);
        return;
      }

      // ==================================================
      // 3. ENTER RENAMING MODE
      // ==================================================
      // If a single char is typed while ONLY an edge is selected
      if (
        e.key.length === 1 && 
        selectedEdgeId && 
        selectedNodes.size === 0 && 
        selectedContainerIds.size === 0 &&
        !e.ctrlKey && !e.metaKey
      ) {
         const edge = graph.edgesById[selectedEdgeId];
         if (edge) {
             e.preventDefault(); // Stop page scroll on Space
             
             // Initialize State
             setRenamingEdgeId(selectedEdgeId);
             setOriginalLabel(edge.label || "");

             // Apply the First Character immediately
             const newGraph = graph.clone();
             newGraph.edgesById[selectedEdgeId].label = e.key;
             onGraphChange(newGraph);
         }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [graph, selectedNodes, selectedContainerIds, selectedEdgeId, renamingEdgeId, clipboard, originalLabel]);

  return { deleteSelected, copy, paste, isRenaming: !!renamingEdgeId };
};
