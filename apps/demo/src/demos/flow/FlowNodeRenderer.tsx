import React, { useState } from 'react';
import { NodeEntity } from '@sysflow/core';

interface FlowNodeRendererProps {
  node: NodeEntity;
  selected: boolean;
  onAddConnectedNode?: (currentNode: NodeEntity, position: 'top' | 'bottom') => void;
}

export const FlowNodeRenderer: React.FC<FlowNodeRendererProps> = ({
  node,
  selected,
  onAddConnectedNode
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    /* 
      1. OUTER HITBOX WRAPPER:
         Matches node dimensions, allows visible overflow for the buttons,
         and captures enter/leave events.
    */
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* 
        2. INVISIBLE HOVER BRIDGES (Hitbox Extenders):
           These transparent strips bridge the gap between the node edge and 
           the buttons so mouse leave is never triggered.
      */}
      {isHovered && (
        <>
          <div
            style={{
              position: 'absolute',
              top: -32,
              left: 0,
              right: 0,
              height: 32,
              pointerEvents: 'auto'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -32,
              left: 0,
              right: 0,
              height: 32,
              pointerEvents: 'auto'
            }}
          />
        </>
      )}

      {/* Top Quick-Add Shadow Button (Old Node -> New Node) */}
      {isHovered && onAddConnectedNode && (
        <button
          className="sysflow-shadow-btn"
          style={{
            ...shadowBtnStyle,
            top: -26,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          title="Add connected node above (Old → New)"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectedNode(node, 'top');
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          +
        </button>
      )}

      {/* Visible Node Interior Content */}
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: '10px 14px',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '13px' }}>{node.label}</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '6px'
          }}
        >
          <span
            style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '3px',
              background: node.data?.priority === 'P0' ? '#ef4444' : '#0284c7',
              color: '#fff',
              fontWeight: 700
            }}
          >
            {String(node.data?.priority || 'P1')}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.65 }}>
            {String(node.data?.duration || '10ms')}
          </span>
        </div>
      </div>

      {/* Bottom Quick-Add Shadow Button (New Node -> Old Node) */}
      {isHovered && onAddConnectedNode && (
        <button
          className="sysflow-shadow-btn"
          style={{
            ...shadowBtnStyle,
            bottom: -26,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          title="Add connected node below (New → Old)"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectedNode(node, 'bottom');
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          +
        </button>
      )}
    </div>
  );
};

const shadowBtnStyle: React.CSSProperties = {
  position: 'absolute',
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: '#0ea5e9',
  border: '1px solid #e0f2fe',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 'bold',
  cursor: 'pointer',
  zIndex: 40,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
  transition: 'transform 0.15s ease, background 0.15s ease'
};
