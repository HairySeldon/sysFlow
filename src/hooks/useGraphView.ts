import { useState, useCallback, useEffect, useRef } from "react";
import { Vec2 } from "../models/Entity";

export const useGraphView = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartMouse, setPanStartMouse] = useState<Vec2 | null>(null);

  // 1. Keep a Ref of the view so our non-React event listener can read it
  //    without needing to re-bind the listener on every render.
  const viewRef = useRef(view);
  
  // Sync the Ref whenever state changes
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // 2. The Native Wheel Listener (Non-Passive)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Access the *current* view from the ref, not the stale closure
      const currentView = viewRef.current;

      // Ctrl+Scroll -> Zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // STOP the browser from zooming the whole page

        const rect = el.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // World position before zoom
        const worldX = (screenX - currentView.x) / currentView.zoom;
        const worldY = (screenY - currentView.y) / currentView.zoom;

        // Calc new zoom
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.min(Math.max(0.1, currentView.zoom * (1 + delta)), 5);

        // Adjust Pan to keep mouse over same world point
        const newX = screenX - (worldX * newZoom);
        const newY = screenY - (worldY * newZoom);

        setView({ x: newX, y: newY, zoom: newZoom });
      } else {
        // Standard Pan (Shift+Scroll or Trackpad)
        // Only prevent default if we are actually panning to avoid blocking normal page scroll
        // (Optional: remove e.preventDefault() here if you want normal scroll behavior when not zooming)
        e.preventDefault(); 
        
        setView(prev => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    // 3. Attach with { passive: false }
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [containerRef]); // Only run once on mount (or if ref changes)


  // --- Helper: Convert Screen (Mouse) coords to World (Graph) coords ---
  const getGlobPos = useCallback((e: React.MouseEvent | MouseEvent): Vec2 => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top
    };
  }, [containerRef]); // removed 'view' dependency to prevent unnecessary recalcs

  const getMousePos = useCallback((e: React.MouseEvent | MouseEvent): Vec2 => {
    const glob = getGlobPos(e);
    return {
      x: (glob.x - view.x) / view.zoom,
      y: (glob.y - view.y) / view.zoom
    };
  }, [view, getGlobPos]);


  // --- Manual Panning Handlers (Middle Mouse / Spacebar) ---
  const startPan = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStartMouse({ x: e.clientX, y: e.clientY });
  };

  const updatePan = (e: React.MouseEvent) => {
    if (!isPanning || !panStartMouse) return;
    const dx = e.clientX - panStartMouse.x;
    const dy = e.clientY - panStartMouse.y;
    setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setPanStartMouse({ x: e.clientX, y: e.clientY });
  };

  const endPan = () => {
    setIsPanning(false);
    setPanStartMouse(null);
  };

  return {
    view,
    setView,
    isPanning,
    getMousePos,
    getGlobPos,
    // handleWheel, <-- REMOVED (Handled internally now)
    startPan,
    updatePan,
    endPan
  };
};
