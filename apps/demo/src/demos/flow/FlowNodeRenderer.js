import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const FlowNodeRenderer = ({ node, selected, onAddConnectedNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
    /*
      1. OUTER HITBOX WRAPPER:
         Matches node dimensions, allows visible overflow for the buttons,
         and captures enter/leave events.
    */
    _jsxs("div", { onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), style: {
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'visible'
        }, children: [isHovered && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                            position: 'absolute',
                            top: -32,
                            left: 0,
                            right: 0,
                            height: 32,
                            pointerEvents: 'auto'
                        } }), _jsx("div", { style: {
                            position: 'absolute',
                            bottom: -32,
                            left: 0,
                            right: 0,
                            height: 32,
                            pointerEvents: 'auto'
                        } })] })), isHovered && onAddConnectedNode && (_jsx("button", { className: "sysflow-shadow-btn", style: {
                    ...shadowBtnStyle,
                    top: -26,
                    left: '50%',
                    transform: 'translateX(-50%)'
                }, title: "Add connected node above (Old \u2192 New)", onClick: (e) => {
                    e.stopPropagation();
                    onAddConnectedNode(node, 'top');
                }, onPointerDown: (e) => e.stopPropagation(), children: "+" })), _jsxs("div", { style: {
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: '13px' }, children: node.label }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '6px'
                        }, children: [_jsx("span", { style: {
                                    fontSize: '10px',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    background: node.data?.priority === 'P0' ? '#ef4444' : '#0284c7',
                                    color: '#fff',
                                    fontWeight: 700
                                }, children: String(node.data?.priority || 'P1') }), _jsx("span", { style: { fontSize: '11px', opacity: 0.65 }, children: String(node.data?.duration || '10ms') })] })] }), isHovered && onAddConnectedNode && (_jsx("button", { className: "sysflow-shadow-btn", style: {
                    ...shadowBtnStyle,
                    bottom: -26,
                    left: '50%',
                    transform: 'translateX(-50%)'
                }, title: "Add connected node below (New \u2192 Old)", onClick: (e) => {
                    e.stopPropagation();
                    onAddConnectedNode(node, 'bottom');
                }, onPointerDown: (e) => e.stopPropagation(), children: "+" }))] }));
};
const shadowBtnStyle = {
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
