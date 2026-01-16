import { useState, useEffect } from "react";
import { GraphModel } from "../models/GraphModel";

interface UseGraphClipboardProps {
  graph: GraphModel;
  selectedNodes: Set<string>;
  selectedContainerIds: Set<string>;
  onGraphChange: (newGraph: GraphModel) => void;
  clearSelection: () => void;
  setSelectedNodes: (ids: Set<string>) => void;
  setSelectedContainerIds: (ids: Set<string>) => void;
}

export const useGraphClipboard = ({
  graph,
  selectedNodes,
  selectedContainerIds,
  onGraphChange,
  clearSelection,
  setSelectedNodes,
  setSelectedContainerIds,
}: UseGraphClipboardProps) => {
  const [clipboard, setClipboard] = useState<string | null>(null);

  const selectAll = () => {
    const allNodesIds = new Set(Object.keys(graph.nodesById));
    const allContainerIds = new Set(Object.keys(graph.containersById));
    setSelectedNodes(allNodesIds);
    setSelectedContainerIds(allContainerIds);
  };

  const deleteSelected = () => {
    if (selectedNodes.size === 0 && selectedContainerIds.size === 0) return;
    const newGraph = graph.clone();
    selectedNodes.forEach((id) => newGraph.removeNode(id));
    selectedContainerIds.forEach((id) => newGraph.removeContainer(id));
    onGraphChange(newGraph);
    clearSelection();
  };

  const copy = (e: KeyboardEvent) => {
    e.preventDefault();
    const nodesToCopy = Object.values(graph.nodesById).filter(n => selectedNodes.has(n.id));
    const containersToCopy = Object.values(graph.containersById).filter(c => selectedContainerIds.has(c.id));
    
    // Only copy edges if both ends are selected
    const allSelectedIds = new Set([...selectedNodes, ...selectedContainerIds]);
    const edgesToCopy = Object.values(graph.edgesById).filter(edge =>
      allSelectedIds.has(edge.sourceNodeId) && allSelectedIds.has(edge.targetNodeId)
    );

    const clipboardData = { nodes: nodesToCopy, containers: containersToCopy, edges: edgesToCopy };
    setClipboard(JSON.stringify(clipboardData));
  };

  const paste = (e: KeyboardEvent) => {
    e.preventDefault();
    if (!clipboard) return;
    try {
      const data = JSON.parse(clipboard);
      const newGraph = graph.clone();
      const idMap = new Map<string, string>();
      const newSelectedNodes = new Set<string>();
      const newSelectedContainers = new Set<string>();

      // ... [Insert your existing Paste Logic here, reused exactly] ...
      // 1. Paste Containers
      data.containers.forEach((c: any) => {
          const newId = `c_${crypto.randomUUID().slice(0, 4)}`;
          idMap.set(c.id, newId);
          newGraph.containersById[newId] = { ...c, id: newId, position: { x: c.position.x + 20, y: c.position.y + 20 }, nodeIds: [], childContainerIds: [] };
          newSelectedContainers.add(newId);
      });

      // 2. Paste Nodes
      data.nodes.forEach((n: any) => {
        const newId = `n_${crypto.randomUUID().slice(0, 4)}`;
        idMap.set(n.id, newId);
        newGraph.nodesById[newId] = { ...n, id: newId, position: { x: n.position.x + 20, y: n.position.y + 20 }, parentId: n.parentId ? idMap.get(n.parentId) : undefined };
        newSelectedNodes.add(newId);
        if (n.parentId && idMap.has(n.parentId)) {
            newGraph.containersById[idMap.get(n.parentId)!]?.nodeIds.push(newId);
        }
      });

      // 3. Paste Edges
      data.edges.forEach((e: any) => {
        const newSource = idMap.get(e.sourceNodeId);
        const newTarget = idMap.get(e.targetNodeId);
        if (newSource && newTarget) {
            const newEdgeId = `e_${crypto.randomUUID().slice(0, 4)}`;
            newGraph.edgesById[newEdgeId] = { ...e, id: newEdgeId, sourceNodeId: newSource, targetNodeId: newTarget };
        }
      });

      onGraphChange(newGraph);
      setSelectedNodes(newSelectedNodes);
      setSelectedContainerIds(newSelectedContainers);
    } catch (err) { console.error("Paste failed", err); }
  };

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if (e.key === "Escape") clearSelection();
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "a") selectAll();
        if (e.key === "c") copy(e);
        if (e.key === "x") { copy(e); deleteSelected(); }
        if (e.key === "v") paste(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [graph, selectedNodes, selectedContainerIds, clipboard]); // Dependencies

  return { deleteSelected, copy, paste };

};
