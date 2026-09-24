import { useState, useCallback, useRef, useEffect } from 'react';
import { LayoutResult } from '../layout/LayoutEngine';

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export function useCanvasTransform(
  containerRef: React.RefObject<HTMLDivElement | null>,
  zoomBounds = { min: 0.15, max: 3.0 }
) {
  const [transform, setTransform] = useState<ViewportTransform>({ x: 80, y: 80, zoom: 1 });
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      if (!containerRef.current) return { x: screenX, y: screenY };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (screenX - rect.left - transform.x) / transform.zoom,
        y: (screenY - rect.top - transform.y) / transform.zoom
      };
    },
    [transform, containerRef]
  );

  const zoomToFit = useCallback(
    (layout: LayoutResult) => {
      if (!containerRef.current) return;

      const allItems = [
        ...Object.values(layout.nodes),
        ...Object.values(layout.containers)
      ];

      if (allItems.length === 0) {
        setTransform({ x: 80, y: 80, zoom: 1 });
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const item of allItems) {
        minX = Math.min(minX, item.x);
        minY = Math.min(minY, item.y);
        maxX = Math.max(maxX, item.x + item.width);
        maxY = Math.max(maxY, item.y + item.height);
      }

      const rect = containerRef.current.getBoundingClientRect();
      const padding = 80;
      const graphWidth = Math.max(maxX - minX, 100);
      const graphHeight = Math.max(maxY - minY, 100);

      const scaleX = (rect.width - padding * 2) / graphWidth;
      const scaleY = (rect.height - padding * 2) / graphHeight;
      const fitZoom = Math.min(
        Math.max(Math.min(scaleX, scaleY), zoomBounds.min),
        Math.min(zoomBounds.max, 1.25)
      );

      const targetX = (rect.width - graphWidth * fitZoom) / 2 - minX * fitZoom;
      const targetY = (rect.height - graphHeight * fitZoom) / 2 - minY * fitZoom;

      setTransform({
        x: targetX,
        y: targetY,
        zoom: fitZoom
      });
    },
    [containerRef, zoomBounds]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      // Pinch-to-zoom or Ctrl+Wheel
      if (e.ctrlKey || e.metaKey) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const newZoom = Math.min(Math.max(transform.zoom * zoomFactor, zoomBounds.min), zoomBounds.max);

        const newX = mouseX - (mouseX - transform.x) * (newZoom / transform.zoom);
        const newY = mouseY - (mouseY - transform.y) * (newZoom / transform.zoom);

        setTransform({ x: newX, y: newY, zoom: newZoom });
      } else {
        // Standard two-finger pan / mouse scroll
        setTransform((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    },
    [transform, zoomBounds, containerRef]
  );

  const startPan = useCallback(
    (screenX: number, screenY: number) => {
      isPanningRef.current = true;
      startPanRef.current = { x: screenX - transform.x, y: screenY - transform.y };
    },
    [transform]
  );

  const updatePan = useCallback((screenX: number, screenY: number) => {
    if (!isPanningRef.current) return;
    setTransform((prev) => ({
      ...prev,
      x: screenX - startPanRef.current.x,
      y: screenY - startPanRef.current.y
    }));
  }, []);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const resetTransform = useCallback(() => {
    setTransform({ x: 80, y: 80, zoom: 1 });
  }, []);

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, zoomBounds.max)
    }));
  }, [zoomBounds]);

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, zoomBounds.min)
    }));
  }, [zoomBounds]);

  return {
    transform,
    setTransform,
    screenToWorld,
    onWheel,
    startPan,
    updatePan,
    endPan,
    resetTransform,
    zoomIn,
    zoomOut,
    zoomToFit,
    isPanning: isPanningRef
  };
}
