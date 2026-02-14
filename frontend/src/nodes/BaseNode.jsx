import { Handle, Position } from 'reactflow';
import { useState } from 'react';

export const BaseNode = ({ id, title, handles, typeColor, onClick, onClose, extraButton, className = '', onTransitionEnd, isSelected = false, visible = true, selectNode, isDisplayOpen = false, updateNodeField, nodeKey, children, data }) => {
  const [hoveredHandle, setHoveredHandle] = useState(null);

  if (!visible) {
    return null;
  }

  const handleNodeClick = (e) => {
    // Special handling for customNodeManager - never open display, only select
    if (data?.type === 'customNodeManager') {
      if (selectNode) {
        selectNode(id);
      }
      if (onClick) {
        onClick(e);
      }
      return;
    }

    // Allow all nodes to open their display when clicked
    if (!isDisplayOpen && updateNodeField) {
      updateNodeField(id, 'isDisplayOpen', true);
    } else if (selectNode) {
      selectNode(id);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      key={nodeKey || id}
      className={`node-container react-flow__node-default backdrop-blur-sm shadow-xl rounded-xl hover:shadow-2xl hover:border-indigo-300 ${isSelected ? 'node-selected' : ''} z-[100] ${className} node-container-base ${isDisplayOpen ? 'node-display-open' : 'node-display-closed'}`}
      style={{
        width: isDisplayOpen 
          ? (data?.displayWidth ? `${data.displayWidth}px` : '600px')
          : '400px',
        height: isDisplayOpen
          ? (data?.displayHeight ? `${data.displayHeight}px` : '350px')
          : '150px',
        maxWidth: '95vw',
        maxHeight: '90vh'
      }}
      onMouseEnter={() => {}}
      onClick={handleNodeClick}
      onTransitionEnd={(e) => {
        // Only trigger onTransitionEnd for transform transitions
        if (e.propertyName === 'transform' && onTransitionEnd) {
          onTransitionEnd(e);
        }
      }}
      data-display-open={isDisplayOpen}
      data-node-type={data?.nodeType}
    >
      {/* Colorful Accent Bar at the top */}
      <div className={`h-1.5 w-full ${typeColor || 'bg-indigo-500'}`} />

      <div className="px-4 py-2 flex items-center justify-between border-b node-header">
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          {extraButton}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-5 h-5 rounded-full flex items-center justify-center node-close-button"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {children}

      {handles.map((h, idx) => (
        <div key={`${id}-${h.id}-wrapper`} className="relative">
          <Handle
            type={h.type}
            position={h.position || (h.type === 'target' ? Position.Left : Position.Right)}
            id={`${id}-${h.id}`}
            className="connection-handle node-handle"
            onMouseEnter={() => setHoveredHandle(`${id}-${h.id}`)}
            onMouseLeave={() => setHoveredHandle(null)}
            style={h.style}
          />
          {hoveredHandle === `${id}-${h.id}` && (
            <div className={`node-handle-tooltip ${
              h.position === Position.Top ? 'node-handle-tooltip-top' : 
              h.position === Position.Bottom ? 'node-handle-tooltip-bottom' : 
              h.position === Position.Left ? 'node-handle-tooltip-left' : 
              'node-handle-tooltip-right'
            }`}>
              <div className="font-semibold mb-1">
                {h.type === 'target' ? '📥 Input Connection' : '📤 Output Connection'}
              </div>
              <div className="text-slate-300">
                {h.type === 'target'
                  ? '• Click and drag FROM this point to connect to an output'
                  : '• Click and drag TO this point from an input to connect'
                }
              </div>
              <div className="text-slate-400 text-[10px] mt-1">
                Creates a data flow between nodes
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
