import React from "react";
import { Vec2 } from "../models/Entity";

interface LassoProps {
  start: Vec2;
  end: Vec2;
}

export const Lasso = ({ start, end }: LassoProps) => (
  <div style={{
    position: "absolute",
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
    border: "1px dashed #999",
    background: "rgba(180,180,180,0.15)",
    pointerEvents: "none"
  }} />
);
