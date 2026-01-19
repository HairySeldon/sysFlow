import { useState, useCallback } from "react";
import { Vec2 } from "../models/Entity";

export const useGraphView = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartMouse, setPanStartMouse] = useState<Vec2 | null>(null);

  // Helper: Convert Screen (Mouse) coords to World (Graph) coords
  const getGlobPos = useCallback((e: React.MouseEvent | MouseEvent): Vec2 => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();

    // 2. Calculate coordinates relative to that container (0,0 is top-left of the canvas view)
    const globX = e.clientX - rect.left;
    const globY = e.clientY - rect.top;
    return { x: globX, y: globY};
  }, [view, containerRef]);

  const getMousePos = useCallback((e: React.MouseEvent | MouseEvent): Vec2 => {
    const glob = getGlobPos(e);
    return {
      x: (glob.x - view.x) / view.zoom,
      y: (glob.y - view.y) / view.zoom
    };
  }, [view, containerRef]);

  // Handle Zoom and Pan via Wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Ctrl+Scroll -> Zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // World position before zoom
      const worldX = (screenX - view.x) / view.zoom;
      const worldY = (screenY - view.y) / view.zoom;

      // Calc new zoom
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.min(Math.max(0.1, view.zoom * (1 + delta)), 5);

      // Adjust Pan to keep mouse over same world point
      const newX = screenX - (worldX * newZoom);
      const newY = screenY - (worldY * newZoom);

      setView({ x: newX, y: newY, zoom: newZoom });
    } else {
      // Standard Pan (Shift+Scroll or Trackpad)
      setView(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [view]);

  // Manual Panning Handlers (Middle Mouse / Spacebar)
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
    handleWheel,
    startPan,
    updatePan,
    endPan
  };
};
