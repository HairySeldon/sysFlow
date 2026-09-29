import { LayoutResult } from '../layout/LayoutEngine';

export interface ViewportTransform {
    x: number;
    y: number;
    zoom: number;
}
export declare function useCanvasTransform(containerRef: React.RefObject<HTMLDivElement | null>, zoomBounds?: {
    min: number;
    max: number;
}): {
    transform: ViewportTransform;
    setTransform: import('react').Dispatch<import('react').SetStateAction<ViewportTransform>>;
    screenToWorld: (screenX: number, screenY: number) => {
        x: number;
        y: number;
    };
    onWheel: (e: React.WheelEvent) => void;
    startPan: (screenX: number, screenY: number) => void;
    updatePan: (screenX: number, screenY: number) => void;
    endPan: () => void;
    resetTransform: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    zoomToFit: (layout: LayoutResult) => void;
    isPanning: import('react').MutableRefObject<boolean>;
};
//# sourceMappingURL=useCanvasTransform.d.ts.map