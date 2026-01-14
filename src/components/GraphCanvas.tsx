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

// --- IMPORT THE LOGIC ---
import * as GraphLogic from "../utils/GraphLogic";

// Config
const ENABLE_EXPLICIT_PORTS = true;

type InteractionMode = "idle" | "drag" | "lasso" | "edge-create" | "resize";

interface GraphCanvasProps {
  graph: GraphModel;
  onGraphChange: (newGraph: GraphModel) => void;
  renderNode?: (node: Node, selected: boolean) => React.ReactNode;
  renderContainer?: (container: Container, collapsed: boolean) => React.ReactNode;
}

export const GraphCanvas = ({ graph, onGraphChange, renderNode, renderContainer }: GraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [selectedNodes, setSelectedNodes] = useState<Set<ID>>(new Set());
  const [selectedContainerIds, setSelectedContainerIds] = useState<Set<ID>>(new Set());
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [dragStartMouse, setDragStartMouse] = useState<Vec2 | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<ID, Vec2>>(new Map());
  const [lassoStart, setLassoStart] = useState<Vec2 | null>(null);
  const [lassoEnd, setLassoEnd] = useState<Vec2 | null>(null);
  const [creatingEdge, setCreatingEdge] = useState<{sourceNodeId: ID; sourcePortId?: ID; position: Vec2} | null>(null);
  const [canvasMenu, setCanvasMenu] = useState<{ targetId?: ID; type?: string; position: Vec2 } | null>(null);
  const [resizingState, setResizingState] = useState<{ id: ID; startMouse: Vec2; startSize: { width: number; height: number };} | null>(null);
  
  // Port State
  const [hoveredPort, setHoveredPort] = useState<{nodeId: ID, portId: ID } | null>(null);
  const [dragStartPortId, setDragStartPortId] = useState<ID | null>(null);
  const [pendingSourcePortLabel, setPendingSourcePortLabel] = useState<string | null>(null);

  // Editor State
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editorPosition, setEditorPosition] = useState<{x: number, y: number} | null>(null);

  const [clipboard, setClipboard] = useState<string | null>(null);

  const createPort = (eid: Entity) => {
    if(ENABLE_EXPLICIT_PORTS){
      // Prompt user to create port
      // Need to save first port until edge has been confirmed, then add source and taret ports
    }
  };

  const selectAll = () => {
    const allNodeIds = new Set(Object.keys(graph.nodesById));
    const allContainerIds = new Set(Object.keys(graph.containersById));
    setSelectedNodes(allNodeIds);
    setSelectedContainerIds(allContainerIds);
  };

  const copy = (e: KeyboardEvent) => {
      e.preventDefault();
      
      // 1. Gather data
      const nodesToCopy = Object.values(graph.nodesById).filter(n => selectedNodes.has(n.id));
      const containersToCopy = Object.values(graph.containersById).filter(c => selectedContainerIds.has(c.id));
      
      // 2. Gather edges (only if both source/target are being copied)
      const allSelectedIds = new Set([...selectedNodes, ...selectedContainerIds]);
      const edgesToCopy = Object.values(graph.edgesById).filter(edge => 
        allSelectedIds.has(edge.sourceNodeId) && allSelectedIds.has(edge.targetNodeId)
      );

      // 3. Save to internal clipboard state
      const clipboardData = {
        nodes: nodesToCopy,
        containers: containersToCopy,
        edges: edgesToCopy
      };
      
      setClipboard(JSON.stringify(clipboardData));
  }

  const deleteSelected = () => {
      if (selectedNodes.size === 0 && selectedContainerIds.size === 0) return;

      const newGraph = graph.clone();
      selectedNodes.forEach((id) => newGraph.removeNode(id));
      selectedContainerIds.forEach((id) => newGraph.removeContainer(id));

      onGraphChange(newGraph);

      clearAllStates();
  }

// --- Keyboard Handling ---
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a text input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      }

      if (e.key === "Escape") {
        clearAllStates();    
      }

      if (e.ctrlKey || e.metaKey){

        // Select All
        if (e.key === "a"){
          selectAll();
        }

//        // Undo
//        if (e.key === "z"){
//        }
//
//        // Redo
//        if (e.key === "y"){
//        }

        // --- COPY (Ctrl + C) ---
        if (e.key === "c") {
          copy(e);
        }

        // --- COPY (Ctrl + X) ---
        if (e.key === "x") {
          copy(e);
          deleteSelected();
        }

        // --- PASTE (Ctrl + V) ---
        if (e.key === "v") {
          e.preventDefault();
          if (!clipboard) return;

          try {
            const data = JSON.parse(clipboard);
            const newGraph = graph.clone();
            
            // Mappings to track Old ID -> New ID
            const idMap = new Map<string, string>();
            const newSelectedNodes = new Set<string>();
            const newSelectedContainers = new Set<string>();

            // 1. Paste Containers
            data.containers.forEach((c: any) => {
              const newId = `c_${crypto.randomUUID().slice(0, 4)}`;
              idMap.set(c.id, newId);
              newGraph.containersById[newId] = {
                ...c,
                id: newId,
                position: { x: c.position.x + 20, y: c.position.y + 20 }, // Offset slightly
                nodeIds: [], // Will rebuild these
                childContainerIds: []
              };
              newSelectedContainers.add(newId);
            });

            // 2. Paste Nodes
            data.nodes.forEach((n: any) => {
              const newId = `n_${crypto.randomUUID().slice(0, 4)}`;
              idMap.set(n.id, newId);
              
              newGraph.nodesById[newId] = {
                ...n,
                id: newId,
                position: { x: n.position.x + 20, y: n.position.y + 20 },
                parentId: n.parentId ? idMap.get(n.parentId) : undefined // Remap parent if it was also copied
              };
              newSelectedNodes.add(newId);

              // If this node belongs to a container we just pasted, register it there
              if (n.parentId && idMap.has(n.parentId)) {
                 const newParentId = idMap.get(n.parentId)!;
                 newGraph.containersById[newParentId]?.nodeIds.push(newId);
              }
            });

            // 3. Paste Edges (Only if start/end exist in the paste)
            data.edges.forEach((e: any) => {
              const newSource = idMap.get(e.sourceNodeId);
              const newTarget = idMap.get(e.targetNodeId);
              
              if (newSource && newTarget) {
                const newEdgeId = `e_${crypto.randomUUID().slice(0, 4)}`;
                newGraph.edgesById[newEdgeId] = {
                  ...e,
                  id: newEdgeId,
                  sourceNodeId: newSource,
                  targetNodeId: newTarget
                };
              }
            });

            // 4. Update State
            onGraphChange(newGraph);
            // Select the newly pasted items so user can immediately drag them
            setSelectedNodes(newSelectedNodes);
            setSelectedContainerIds(newSelectedContainers);

          } catch (err) {
            console.error("Paste failed", err);
          }
        }
      }
  };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [graph, selectedNodes, selectedContainerIds, onGraphChange]);

  const getMousePos = (e: React.MouseEvent): Vec2 => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clearAllStates = () => {
    setSelectedNodes(new Set());
    setSelectedContainerIds(new Set());
    setCanvasMenu(null);
  };

  const toggleContainer = (cid: ID) => { 
      const newGraph = graph.clone();
      newGraph.toggleContainerCollapsed(cid);
      onGraphChange(newGraph);
  };

  // --- Rendering Helpers ---

  const renderPorts = (entity: Node | Container) => {
    if (ENABLE_EXPLICIT_PORTS){
    // USE LOGIC: Calculate which ports to show (proxies or real)
    const portsToRender = "nodeIds" in entity 
      ? GraphLogic.getRenderablePorts(graph, entity as Container)
      : (entity.ports || []);

    return portsToRender.map((port) => {
      // Geometry Calculation
      // 1. Get Absolute Position from Geometry helper
       const absPos = getPortPosition(
         entity,
         port.id,
         graph,
         "nodeIds" in entity ? (entity as Container).size : { width: 100, height: 50 }
       );

       let pos = { x: absPos.x, y: absPos.y };
       if ("nodeIds" in entity) { // It is a container
           pos.x = absPos.x - entity.position.x;
           pos.y = absPos.y - entity.position.y;
       }
      return (
        <div
          key={port.id}
          title={port.label}
          style={{
            position: "absolute",
            left: pos.x - 6, top: pos.y - 6,
            width: 12, height: 12, borderRadius: "50%",
            backgroundColor: "#fff", border: "2px solid #333",
            zIndex: 100, cursor: "pointer",
          }}
          onMouseEnter={() => setHoveredPort({ nodeId: entity.id, portId: port.id })}
          onMouseLeave={() => setHoveredPort(null)}
          onMouseDown={(e) => {
            e.stopPropagation();
            setCreatingEdge({ sourceNodeId: entity.id, position: pos}); 
            setDragStartPortId(port.id);
            setPendingSourcePortLabel(port.label); 
            setMode("edge-create");
            createPort();
            setDragStartMouse(getMousePos(e));
          }}
        />
      );
    });
    }
  };

  // --- Event Handlers (on Canvas) ---

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    // 1. Port Interaction
    if (ENABLE_EXPLICIT_PORTS && hoveredPort) {
        // Logic handled in renderPorts onMouseDown
        return;
    }

    // 2. Right Click
    if (e.button === 2 && e.target === e.currentTarget) {
      const hitId = GraphLogic.hitTestEntity(graph, pos);
       
       if (!hitId) {
           e.preventDefault();
           setCanvasMenu({ 
               position: { x: pos.x, y: pos.y }, 
               targetId: undefined, 
               type: undefined 
           });
           return;
       }
        return;
    }

    // 3. Canvas Click (Clear)
    if (e.target === e.currentTarget) {
        clearAllStates();
        setMode("lasso");
        setLassoStart(pos);
        setLassoEnd(pos);
        setEditingEntityId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const mousePos = getMousePos(e);

    // 1. Handle Dragging Entities
    if (mode === "drag" && dragStartMouse) {
      const dx = mousePos.x - dragStartMouse.x;
      const dy = mousePos.y - dragStartMouse.y;

      const newGraph = graph.clone();
      let changed = false;

      dragStartPositions.forEach((startPos, id) => {
        // Update Node Positions
        const node = newGraph.nodesById[id];
        if (node) {
          node.position = { x: startPos.x + dx, y: startPos.y + dy };
          changed = true;
        }
        // Update Container Positions
        const container = newGraph.containersById[id];
        if (container) {
          container.position = { x: startPos.x + dx, y: startPos.y + dy };
          changed = true;
        }
      });

      if (changed) onGraphChange(newGraph);
    }

    // 2. Handle Edge Creation (Update the "rubber band" line)
    if (mode === "edge-create" && creatingEdge) {
      setCreatingEdge({ ...creatingEdge, position: mousePos });
    }

    // 3. Handle Lasso
    if (mode === "lasso") {
      setLassoEnd(mousePos);
    }

    if (mode === "resize" && resizingState) {
          const dx = mousePos.x - resizingState.startMouse.x;
        const dy = mousePos.y - resizingState.startMouse.y;

        // Update locally to avoid massive re-renders, or update graph directly
        const newGraph = graph.clone();
        const container = newGraph.containersById[resizingState.id];
        if (container) {
            container.size = {
                width: Math.max(100, resizingState.startSize.width + dx),
                height: Math.max(50, resizingState.startSize.height + dy)
            };
            onGraphChange(newGraph);
        }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (mode === "edge-create" && creatingEdge) {
        // USE LOGIC: Hit test via the helper
        let targetNodeId = hoveredPort ? hoveredPort.nodeId : GraphLogic.hitTestEntity(graph, pos);
        let targetPortId = hoveredPort ? hoveredPort.portId : null;

        if (targetNodeId && targetNodeId !== creatingEdge.sourceNodeId) {
             // ... Perform your edge creation logic here ...
             // (This is where you'd use graph.addEdge)
             // Check if explicit ports are enabled, create ports if missing, etc.
             const newGraph = graph.clone();
             
             // Example simple edge add for brevity (Replace with your robust logic):
             const edgeId = `e_${crypto.randomUUID()}`;
             newGraph.addEdge({
                 id: edgeId,
                 sourceNodeId: creatingEdge.sourceNodeId,    // <--- Fixed
                 sourcePortId: creatingEdge.sourcePortId,
                 targetNodeId: targetNodeId,                 // <--- Fixed
                 targetPortId: targetPortId || undefined
             });
             onGraphChange(newGraph);
        }
        setCreatingEdge(null);
        setMode("idle");
    }

    if (mode === "drag") {
        // USE LOGIC: When dropping, check containment
        const newGraph = graph.clone();
        
        // Check every node/container that was dragged
        // We only check the "roots" of the drag to avoid double processing
        dragStartPositions.forEach((_, id) => {
             GraphLogic.assignEntityToContainer(newGraph, id);
             // Also recompute sizes of parents that might have grown
             const parent = newGraph.nodesById[id]?.parentId || newGraph.containersById[id]?.parentId;
             if(parent) GraphLogic.recomputeContainerSize(newGraph, parent);
        });
        
        onGraphChange(newGraph);
        setMode("idle");
        setDragStartMouse(null);
        setDragStartPositions(new Map());
    }
    
  if (mode === "lasso" && lassoStart && lassoEnd) {
      // Calculate selection box
      const x1 = Math.min(lassoStart.x, lassoEnd.x);
      const x2 = Math.max(lassoStart.x, lassoEnd.x);
      const y1 = Math.min(lassoStart.y, lassoEnd.y);
      const y2 = Math.max(lassoStart.y, lassoEnd.y);

      // Don't select if the box is tiny (accidental click)
      if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
          const newSelectedNodes = new Set<string>();
          const newSelectedContainers = new Set<string>();

          // Find nodes inside
          Object.values(graph.nodesById).forEach(node => {
              if (GraphLogic.isEntityVisible(graph, node.id) &&
                  node.position.x >= x1 && node.position.x + 100 <= x2 && // Assuming width 100
                  node.position.y >= y1 && node.position.y + 50 <= y2) {  // Assuming height 50
                  newSelectedNodes.add(node.id);
              }
          });

          // Find containers inside
          Object.values(graph.containersById).forEach(container => {
              if (GraphLogic.isEntityVisible(graph, container.id) &&
                  container.position.x >= x1 && container.position.x + container.size.width <= x2 &&
                  container.position.y >= y1 && container.position.y + container.size.height <= y2) {
                  newSelectedContainers.add(container.id);
              }
          });

          setSelectedNodes(newSelectedNodes);
          setSelectedContainerIds(newSelectedContainers);
      }
      
      setLassoStart(null);
      setLassoEnd(null);
    }
    setMode("idle");
    
  };

  return (
    <div 
        ref={containerRef} 
        className="graph-canvas" 
        style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", userSelect: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
    >
{Object.values(graph.containersById).map(c => {
    if (!GraphLogic.isEntityVisible(graph, c.id)) return null;
    return (
        <React.Fragment key={c.id}>
            <GraphContainer 
                container={c}
                selected={selectedContainerIds.has(c.id)}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    // Select logic
                    if (!e.shiftKey) {
                        setSelectedNodes(new Set());
                        setSelectedContainerIds(new Set([c.id]));
                    } else {
                        const newSet = new Set(selectedContainerIds);
                        newSet.has(c.id) ? newSet.delete(c.id) : newSet.add(c.id);
                        setSelectedContainerIds(newSet);
                    }
                    // Start dragging
                    setMode("drag");
                    setDragStartMouse(getMousePos(e));
                    setDragStartPositions(GraphLogic.collectDragStartPositions([c.id], new Map(), graph));
                }}
                onDoubleClick={(e) => {
                    toggleContainer(c.id);
                }}
                onContextMenu={(e) => {}}
                onResizeMouseDown={(e: React.MouseEvent) => {
                  setResizingState({
                    id: c.id,
                    startMouse: getMousePos(e),
                    startSize: { ...c.size }
                  });
                  setMode("resize");
                }}
            >
                {renderPorts(c)}
            </GraphContainer>
        </React.Fragment>
    )
})}

        {Object.values(graph.nodesById).map(n => {
            if (!GraphLogic.isEntityVisible(graph, n.id)) return null;
            return (
                    <React.Fragment key={n.id}>
                    <GraphNode 
                        node={n}
                        selected={selectedNodes.has(n.id)}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            // Select logic
                            if (!e.shiftKey) {
                                setSelectedContainerIds(new Set());
                                setSelectedNodes(new Set([n.id]));
                            } else {
                                const newSet = new Set(selectedNodes);
                                newSet.has(n.id) ? newSet.delete(n.id) : newSet.add(n.id);
                                setSelectedNodes(newSet);
                            }
                            
                            // Right click check for menu
                            if (e.button === 2) {
                        //        setCanvasMenu({ targetId: n.id, type: "node", position: { x: e.clientX, y: e.clientY } });
                              e.preventDefault();
                              e.stopPropagation(); // Stop canvas from panning
                              
                              // Start Edge Creation Mode manually here
                              const mousePos = getMousePos(e);
                              setMode("edge-create");
                              setCreatingEdge({
                                  sourceNodeId: n.id,
                                  position: mousePos
                              });
                              createPort();
                              return;
                            }

                            // Start dragging
                            setMode("drag");
                            setDragStartMouse(getMousePos(e));
                            setDragStartPositions(GraphLogic.collectDragStartPositions([n.id], new Map(), graph));
                        }}
                        onDoubleClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setEditingEntityId(n.id);
                            const pos = getMousePos(e);
                            setEditorPosition({ x: pos.x, y: pos.y });
                        }}
                    />
                    {renderPorts(n)}
                    </React.Fragment>
            )
        })}

{/* --- SVG LAYER FOR EDGES --- */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 1 // Below nodes (zIndex 10) but above background
          }}
        >
          {/* Helper to find where an edge should visually start/end */}
          {(() => {
            const getVisualPosition = (entityId: string): Vec2 | null => {
              // 1. If the entity is directly visible, return its position
              if (GraphLogic.isEntityVisible(graph, entityId)) {
                return graph.nodesById[entityId]?.position || graph.containersById[entityId]?.position;
              }
              // 2. If hidden, look for its parent container
              // (This is a simplified lookup; for deep nesting, you'd recurse)
              const parent = Object.values(graph.containersById).find(c => 
                 c.nodeIds.includes(entityId) || c.childContainerIds?.includes(entityId)
              );
              
              // If parent exists and is visible, snap to parent
              if (parent && GraphLogic.isEntityVisible(graph, parent.id)) {
                 return { 
                   x: parent.position.x + parent.size.width / 2, // Snap to center of container
                   y: parent.position.y + parent.size.height / 2 
                 };
              }
              return null;
            };

            return (
              <>
                {/* 1. Render Existing Edges */}
                {Object.values(graph.edgesById).map((edge) => {
                  const start = getVisualPosition(edge.sourceNodeId);
                  const end = getVisualPosition(edge.targetNodeId);

                  if (!start || !end) return null; // Both ends hidden deep inside collapsed structures

                  return (
                    <line
                      key={edge.id}
                      x1={start.x + (graph.nodesById[edge.sourceNodeId] ? 50 : 0)} // Offset center if it's a node
                      y1={start.y + (graph.nodesById[edge.sourceNodeId] ? 25 : 0)}
                      x2={end.x + (graph.nodesById[edge.targetNodeId] ? 50 : 0)}
                      y2={end.y + (graph.nodesById[edge.targetNodeId] ? 25 : 0)}
                      stroke="black"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* 2. Render Temporary "Creating" Edge */}
                {mode === "edge-create" && creatingEdge && (
                   <line
                     x1={creatingEdge.position.x} // Mouse Position
                     y1={creatingEdge.position.y}
                     // Calculate start from the source node center
                     x2={(() => {
                        const n = graph.nodesById[creatingEdge.sourceNodeId];
                        return n ? n.position.x + 50 : 0; 
                     })()}
                     y2={(() => {
                        const n = graph.nodesById[creatingEdge.sourceNodeId];
                        return n ? n.position.y + 25 : 0; 
                     })()}
                     stroke="black"
                     strokeWidth="2"
                     strokeDasharray="5,5"
                   />
                )}
              </>
            );
          })()}
        </svg>

        {/* Lasso Selection Box */}
        {mode === "lasso" && lassoStart && lassoEnd && 
          (Math.abs(lassoStart.x - lassoEnd.x) > 5 || Math.abs(lassoStart.y - lassoEnd.y) > 5) && (
             <Lasso start={lassoStart} end={lassoEnd} />
        )}

        {editingEntityId && editorPosition && (
             <EntityEditor 
                entityId={editingEntityId}
                graph={graph}
                position={editorPosition}
                onClose={() => setEditingEntityId(null)}
                onGraphChange={onGraphChange}
                enablePorts={ENABLE_EXPLICIT_PORTS}
             />
        )}

    {/* --- CONTEXT MENU --- */}
    {canvasMenu && (
      <ContextMenu
        position={canvasMenu.position}
        options={(() => {
          // 1. Menu for CANVAS (Background) -> Create New Items
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
                    position: canvasMenu.position,
                    ports: [],
                    size: { width: 100, height: 50}
                  });
                  onGraphChange(newGraph);
                  setCanvasMenu(null); // Close menu
                }
              },
              {
                label: "Add Container",
                onClick: () => {
                  const newGraph = graph.clone();
                  const id = `c_${crypto.randomUUID().slice(0, 4)}`;
                  newGraph.addContainer({
                    id,
                    label: "New Container",
                    position: canvasMenu.position,
                    size: { width: 300, height: 200 }, // Default size
                    nodeIds: [],
                    childContainerIds: [],
                    collapsed: false
                  });
                  onGraphChange(newGraph);
                  setCanvasMenu(null);
                }
              }
            ];
          }

          // 2. Menu for NODES
          if (canvasMenu.type === "node") {
            return [
              {
                label: "Rename",
                onClick: () => {
                  setEditingEntityId(canvasMenu.targetId || null);
                  setEditorPosition(canvasMenu.position);
                  setCanvasMenu(null);
                }
              },
              {
                label: "Delete Node",
                onClick: () => {
                  if (canvasMenu.targetId) {
                    const newGraph = graph.clone();
                    newGraph.removeNode(canvasMenu.targetId);
                    onGraphChange(newGraph);
                  }
                  setCanvasMenu(null);
                }
              }
            ];
          }

          // 3. Menu for CONTAINERS
          if (canvasMenu.type === "container") {
            return [
              {
                label: "Rename",
                onClick: () => {
                  setEditingEntityId(canvasMenu.targetId || null);
                  setEditorPosition(canvasMenu.position);
                  setCanvasMenu(null);
                }
              },
              {
                label: "Toggle Collapse",
                onClick: () => {
                  if (canvasMenu.targetId) {
                    toggleContainer(canvasMenu.targetId);
                  }
                  setCanvasMenu(null);
                }
              },
              {
                label: "Delete Container",
                onClick: () => {
                  if (canvasMenu.targetId) {
                    const newGraph = graph.clone();
                    newGraph.removeContainer(canvasMenu.targetId);
                    onGraphChange(newGraph);
                  }
                  setCanvasMenu(null);
                }
              }
            ];
          }

          return []; // Fallback
        })()}
      />
    )}

    {/* Close menu if clicking elsewhere */ }
    {canvasMenu && (
      <div 
         style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 999 }} 
         onMouseDown={() => setCanvasMenu(null)} 
         onContextMenu={(e) => { e.preventDefault(); setCanvasMenu(null); }} 
      />
    )}
    </div>
  );
};
