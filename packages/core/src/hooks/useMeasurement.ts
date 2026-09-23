import { useState, useRef, useEffect, useCallback } from 'react';
import { ID, LogicalGraph } from '../models';

export function useMeasurement(graph: LogicalGraph) {
  const [measurements, setMeasurements] = useState<Map<ID, { width: number; height: number }>>(
    new Map()
  );
  const cacheRef = useRef<Map<string, { width: number; height: number }>>(new Map());
  const elementsRef = useRef<Map<ID, HTMLElement>>(new Map());

  const registerMeasureElement = useCallback((id: ID, el: HTMLElement | null) => {
    if (el) {
      elementsRef.current.set(id, el);
    } else {
      elementsRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      let changed = false;
      const newMap = new Map(measurements);

      for (const entry of entries) {
        const id = entry.target.getAttribute('data-sysflow-measure-id');
        if (!id) continue;

        const width = Math.ceil(entry.contentRect.width);
        const height = Math.ceil(entry.contentRect.height);

        const current = newMap.get(id);
        if (!current || current.width !== width || current.height !== height) {
          newMap.set(id, { width, height });
          changed = true;
        }
      }

      if (changed) {
        setMeasurements(newMap);
      }
    });

    elementsRef.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [graph]);

  return { measurements, registerMeasureElement };
}
