import React, { useState, useRef } from "react";
import { GraphModel } from "../models/GraphModel";
import { Node } from "../models/Node";
import { Container } from "../models/Container";
import { Entity, ID, Vec2, Port } from "../models/Entity";
import { GraphNode } from "./GraphNode";
import { GraphContainer } from "./GraphContainer";
import { GraphEdge } from "./GraphEdge";
import { Lasso } from "./Lasso";
import { ContextMenu } from "./ContextMenu";
import { EntityEditor } from "./EntityEditor";
import { getPortPosition } from "../utils/Geometry";
import { GraphContextMenu } from "./GraphContextMenu";
import { GraphEdgeLayer } from "./GraphEdgeLayer";
import { GraphPortLayer } from "./GraphPortLayer";

// --- HOOKS ---
import { useGraphView } from "../hooks/useGraphView";
import { useGraphSelection } from "../hooks/useGraphSelection";
import { useGraphClipboard } from "../hooks/useGraphClipboard";

// --- IMPORT THE LOGIC ---
import * as GraphLogic from "../utils/GraphLogic";

type InteractionMode = "idle" | "drag" | "lasso" | "edge-create" | "resize";

interface GraphCanvasProps {
  graph: GraphModel;
  onGraphChange: (newGraph: GraphModel) => void;
  renderNode?: (node: Node, selected: boolean) => React.ReactNode;
  renderContainer?: (container: Container, collapsed: boolean) => React.ReactNode;
  enablePorts: boolean;
  renderEditor: (entity: Entity, update: (u: Partial<Entity>) => void) => React.ReactNode;
}

export const GraphCanvas = ({ graph, onGraphChange, renderNode, renderContainer, enablePorts, renderEditor }: GraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // 1. Hooks
  const view = useGraphView(containerRef);
  const selection = useGraphSelection(graph);
  const clipboard = useGraphClipboard({
    graph,
    onGraphChange,
    selectedNodes: selection.selectedNodes,
    selectedContainerIds: selection.selectedContainerIds,
    selectedEdgeId: selectedEdgeId,
    clearSelection: selection.clearSelection,
    setSelectedNodes: selection.setSelectedNodes,
    setSelectedContainerIds: selection.setSelectedContainerIds,
    setSelectedEdgeId: setSelectedEdgeId // Move to selection
  });

  // 3. Local Interaction State (Things that are too transient for their own hooks yet)
  const [mode, setMode] = useState<InteractionMode>("idle");
  
  // Dragging Entities
  const [dragStartMouse, setDragStartMouse] = useState<Vec2 | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<ID, Vec2>>(new Map());
  
  // Creating Edges
  const [creatingEdge, setCreatingEdge] = useState<{ sourceNodeId: ID; sourcePortId?: ID; position: Vec2 } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: ID, portId: ID } | null>(null);

  // Resize
  const [resizingState, setResizingState] = useState<{ id: ID; startMouse: Vec2; startSize: any } | null>(null);
  
  // Menus
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editorPosition, setEditorPosition] = useState<{ x: number, y: number } | null>(null);
  const [canvasMenu, setCanvasMenu] = useState<{ 
    position: { x: number, y: number },      // For the HTML Menu (Screen UI)
    graphPosition: { x: number, y: number }  // For the Node Logic (World Coords)
  } | null>(null);


  // --- Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    // 0. Pan Start (Middle Mouse or Space)
    if (e.button === 1 || (e.button === 0 && e.nativeEvent.getModifierState("Space"))) {
      e.preventDefault();
      view.startPan(e);
      return;
    }

    // 1. Context Menu (Right Click)
    if (e.button === 2) {
      const screenPos = { x: e.clientX, y: e.clientY };
      const graphPos = view.getMousePos(e); // The "world" coordinates

      // Set the state with BOTH
      setCanvasMenu({ 
        position: screenPos, 
        graphPosition: graphPos 
      });
      return;
    }

    const pos = view.getMousePos(e);

    // 2. Canvas Click (Left) -> Start Lasso
    if (e.button === 0) {
      selection.clearSelection();
      setEditingEntityId(null);
      setCanvasMenu(null);
      
      setMode("lasso");
      selection.setLassoStart(pos);
      selection.setLassoEnd(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 0. Panning
    if (view.isPanning) {
      view.updatePan(e);
      return;
    }

    const mousePos = view.getMousePos(e);

    // 1. Dragging Entities
    if (mode === "drag" && dragStartMouse) {
      const dx = mousePos.x - dragStartMouse.x;
      const dy = mousePos.y - dragStartMouse.y;
      const newGraph = graph.clone();
      let changed = false;

      dragStartPositions.forEach((startPos, id) => {
        const node = newGraph.nodesById[id];
        const container = newGraph.containersById[id];
        if (node) { node.position = { x: startPos.x + dx, y: startPos.y + dy }; changed = true; }
        if (container) { container.position = { x: startPos.x + dx, y: startPos.y + dy }; changed = true; }
      });

      if (changed) onGraphChange(newGraph);
    }

    // 2. Lasso
    if (mode === "lasso") {
      selection.setLassoEnd(mousePos);
    }

    // 3. Edge Create
    if (mode === "edge-create" && creatingEdge) {
      setCreatingEdge({ ...creatingEdge, position: mousePos });
    }

    // 4. Resize
    if (mode === "resize" && resizingState) {
       const dx = mousePos.x - resizingState.startMouse.x;
       const dy = mousePos.y - resizingState.startMouse.y;
       const newGraph = graph.clone();
       const c = newGraph.containersById[resizingState.id];
       if (c) {
         c.size = { width: Math.max(100, resizingState.startSize.width + dx), height: Math.max(50, resizingState.startSize.height + dy) };
         onGraphChange(newGraph);
       }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (view.isPanning) {
      view.endPan();
      return;
    }

    const pos = view.getMousePos(e);

    const isClick = dragStartMouse && 
      Math.abs(pos.x - dragStartMouse.x) < 5 && 
      Math.abs(pos.y - dragStartMouse.y) < 5;

    // 1. Open Editor (Click without drag)
    if (mode === "idle" || (mode === "drag" && isClick)) {
       const targetId = GraphLogic.hitTestEntity(graph, pos);
       if (targetId) {
          setEditingEntityId(targetId);
          setEditorPosition({ x: pos.x, y: pos.y });
          setMode("idle");
          return;
       }
    }

    // 2. Lasso Finish
    if (mode === "lasso") {
      selection.completeLasso();
    }

    // 3. Drag Finish
    if (mode === "drag" && dragStartMouse) {
      // Re-parenting logic here (Drag Drop into Container)
      const newGraph = graph.clone();
      dragStartPositions.forEach((_, id) => {
          GraphLogic.assignEntityToContainer(newGraph, id);
          const parent = newGraph.nodesById[id]?.parentId || newGraph.containersById[id]?.parentId;
          if (parent) GraphLogic.recomputeContainerSize(newGraph, parent);
      });
      onGraphChange(newGraph);
      setDragStartMouse(null);
      setDragStartPositions(new Map());
    }

    // 4. Edge Create Finish
    if (mode === "edge-create" && creatingEdge) {
        const targetNodeId = hoveredPort ? hoveredPort.nodeId : GraphLogic.hitTestEntity(graph, pos);

        // Only proceed if we hit a valid target different from source
        if (targetNodeId && targetNodeId !== creatingEdge.sourceNodeId) {

            // START TRANSACTION (We might need to modify the graph multiple times)
            let finalGraph = graph.clone();
            let finalSourcePortId = creatingEdge.sourcePortId;
            let finalTargetPortId = hoveredPort ? hoveredPort.portId : undefined;

            // --- STEP 1: Handle Missing SOURCE Port ---
            if (!finalSourcePortId && enablePorts) {
                const label = window.prompt("Name the New Source Port:", "out-1");
                if (label) {
                    const newPortId = `p_${crypto.randomUUID().slice(0, 4)}`;
                    const sourceNode = finalGraph.nodesById[creatingEdge.sourceNodeId] || finalGraph.containersById[creatingEdge.sourceNodeId];

                    if (!sourceNode.ports) sourceNode.ports = [];
                    sourceNode.ports.push({ id: newPortId, label });

                    finalSourcePortId = newPortId;
                } else {
                    setCreatingEdge(null);
                    setMode("idle");
                    return;
                }
            }

            // --- STEP 2: Handle Missing TARGET Port ---
            if (!finalTargetPortId && enablePorts) {
                const label = window.prompt("Name the New Target Port:", "in-1");
                if (label) {
                    const newPortId = `p_${crypto.randomUUID().slice(0, 4)}`;
                    const targetNode = finalGraph.nodesById[targetNodeId] || finalGraph.containersById[targetNodeId];

                    if (!targetNode.ports) targetNode.ports = [];
                    targetNode.ports.push({ id: newPortId, label });

                    finalTargetPortId = newPortId;
                } else {
                    setCreatingEdge(null);
                    setMode("idle");
                    return;
                }
            }

            // --- STEP 3: Create the Edge ---
            if ((!enablePorts) || (finalSourcePortId && finalTargetPortId)) {
                const edgeId = `e_${crypto.randomUUID()}`;
                finalGraph.edgesById[edgeId] = {
                    id: edgeId,
                    sourceNodeId: creatingEdge.sourceNodeId,
                    sourcePortId: finalSourcePortId,
                    targetNodeId: targetNodeId,
                    targetPortId: finalTargetPortId
                };

                onGraphChange(finalGraph);
            }
        }

        // Cleanup
        setCreatingEdge(null);
        setMode("idle");
    }

    setMode("idle");
  };

  const createPortAndStartDrag = (entityId: ID) => {
    if (!enablePorts) return;

    // 1. Prompt for Port Name
    const label = window.prompt("Enter Source Port Name:", "out-1");
    if (!label) {
      // User cancelled, cancel the edge creation
      setCreatingEdge(null);
      setMode("idle");
      return;
    }

    // 2. Create the Port in the Model
    const newPortId = `p_${crypto.randomUUID().slice(0, 4)}`;
    const newGraph = graph.clone();
    
    // Find the entity (Node or Container)
    const target = newGraph.nodesById[entityId] || newGraph.containersById[entityId];
    
    if (target) {
      if (!target.ports) target.ports = [];
      target.ports.push({ id: newPortId, label });
      onGraphChange(newGraph);

      // 3. Link the currently creating edge to this new specific port
      setCreatingEdge(prev => prev ? { ...prev, sourcePortId: newPortId } : null);
    }
  };

  // --- Entity Event Wrappers ---
  const handleEntityMouseDown = (e: React.MouseEvent, id: ID, type: "node" | "container") => {
    e.stopPropagation();

    // 1. Right Click -> Create Edge
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();

      // Logic from your snippet: Start creating an edge
      const mousePos = view.getMousePos(e);
      
      setMode("edge-create");
      setCreatingEdge({
        sourceNodeId: id, // Assuming containers can also be sources if passed here
        position: mousePos
      });
      
      // Initialize the drag ghost/port
      // Ensure this function exists in your scope and handles the entity type passed
      createPortAndStartDrag(id); 
      
      return;
    }

    // 2. Left Click -> Select & Prepare Drag
    selection.handleEntityClick(e, id, type);
    
    if (e.button === 0) {
      setMode("drag");
      setDragStartMouse(view.getMousePos(e));
      
      // Calculate Drag Origins
      const activeNodes = new Set(selection.selectedNodes);
      const activeContainers = new Set(selection.selectedContainerIds);
      if (type === "node") activeNodes.add(id); else activeContainers.add(id);
      
      setDragStartPositions(
        GraphLogic.collectDragStartPositions([...activeNodes, ...activeContainers], new Map(), graph)
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="graph-canvas"
      style={{
        position: "relative", width: "100%", height: "100%", overflow: "hidden",
        userSelect: "none", cursor: view.isPanning ? "grabbing" : "default"
      }}
      onWheel={view.handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={{
          transform: `translate(${view.view.x}px, ${view.view.y}px) scale(${view.view.zoom})`,
          transformOrigin: "0 0", width: "100%", height: "100%", position: "absolute", top: 0, left: 0
      }}>

        {/* Edges */}
        <GraphEdgeLayer 
          graph={graph} 
          mode={mode} 
          creatingEdge={creatingEdge} 
          selectedEdgeId={selectedEdgeId}
          onEdgeClick={(e, edgeId) => {
            setSelectedEdgeId(edgeId);
            selection.clearSelection();
            
            // Optional: Detect Double Click for Editing
            if (e.detail === 2) {
               setEditingEntityId(edgeId);
               setEditorPosition(view.getMousePos(e));
            }
          }}
        />
        
        {/* Render Containers */}
        {Object.values(graph.containersById).map(c => GraphLogic.isEntityVisible(graph, c.id) && (
           <GraphContainer
             key={c.id}
             container={c}
             selected={selection.selectedContainerIds.has(c.id)}
             onMouseDown={(e) => handleEntityMouseDown(e, c.id, "container")}
             onResizeMouseDown={(e) => {
               e.stopPropagation();
               setMode("resize");
               setResizingState({ id: c.id, startMouse: view.getMousePos(e), startSize: {...c.size} });
             }}
            onDoubleClick={(e) => {
              e.stopPropagation();
                // 1. Clone the graph
                const newGraph = graph.clone();
                
                // 2. Find and toggle the container
                const container = newGraph.containersById[c.id];
                if (container) {
                  container.collapsed = !container.collapsed;
                  onGraphChange(newGraph);
                }
            }}
           />
        ))}

        {/* Render Nodes */}
        {Object.values(graph.nodesById).map(n => GraphLogic.isEntityVisible(graph, n.id) && (
           <GraphNode
             key={n.id}
             node={n}
             selected={selection.selectedNodes.has(n.id)}
             onMouseDown={(e) => handleEntityMouseDown(e, n.id, "node")}
           />
        ))}


        {/* Ports */}
        <GraphPortLayer 
           graph={graph} 
           enablePorts={enablePorts} 
           hoveredPort={hoveredPort}
           onHoverPort={setHoveredPort}
           onPortMouseDown={(e, nodeId, portId, label, pos) => {
              e.stopPropagation();
              setCreatingEdge({ sourceNodeId: nodeId, sourcePortId: portId, position: pos });
              setMode("edge-create");
           }}
        />

      </div>

      {/* Lasso */}
      {mode === "lasso" && selection.lassoStart && selection.lassoEnd && (
        <Lasso start={selection.lassoStart} end={selection.lassoEnd} />
      )}

      {/* Popups */}
      {editingEntityId && editorPosition && (
        <EntityEditor 
          entityId={editingEntityId} 
          graph={graph} 
          position={editorPosition} 
          onClose={() => setEditingEntityId(null)} 
          onGraphChange={onGraphChange} 
          enablePorts={enablePorts} 
          renderCustomContent={renderEditor}
        />
      )}
      
      {/* CanvasMenu */}
      {canvasMenu && (
        <GraphContextMenu 
           canvasMenu={{...canvasMenu, targetId: undefined}}
           graph={graph}
           onGraphChange={onGraphChange}
           onClose={() => setCanvasMenu(null)}
        />
      )}
    </div>
  );
};
