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
      className={`node-container react-flow__node-default backdrop-blur-sm shadow-xl rounded-xl hover:shadow-2xl hover:border-indigo-300 ${isSelected ? 'node-selected' : ''} z-[100] ${className}`}
      style={{
        visibility: 'visible',
        boxSizing: 'border-box',
        overflow: 'hidden',
        // Use dynamic sizing from arrangeDisplays function when available
        // Otherwise fall back to default sizes
        ...(isDisplayOpen ? {
          width: data?.displayWidth ? `${data.displayWidth}px` : '400px',
          height: data?.displayHeight ? `${data.displayHeight}px` : '580px',
          minWidth: '200px',
          minHeight: '150px',
          maxWidth: '100%',
          maxHeight: '100%',
          transition: 'width 0.3s ease, height 0.3s ease'
        } : {
          width: '400px',
          height: '150px'
        })
      }}
      onMouseEnter={() => {
        if (isDisplayOpen) console.log('BaseNode render open', id, 'displayWidth=', data?.displayWidth, 'displayHeight=', data?.displayHeight);
      }}
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

      {/* Header */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b"
        style={{
          backgroundColor: 'var(--node-header-bg)',
          borderColor: 'var(--node-header-border)',
          color: 'var(--node-header-color)'
        }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          {extraButton}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'var(--node-button-bg)',
                border: '1px solid var(--node-button-border)',
                color: 'var(--node-header-color)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--node-button-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--node-button-bg)'}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {children}

      {/* Handles */}
      {handles.map((h, idx) => (
        <div key={`${id}-${h.id}-wrapper`} className="relative">
          <Handle
            type={h.type}
            position={h.position || (h.type === 'target' ? Position.Left : Position.Right)}
            id={`${id}-${h.id}`}
            className="connection-handle"
            onMouseEnter={() => setHoveredHandle(`${id}-${h.id}`)}
            onMouseLeave={() => setHoveredHandle(null)}
            style={{
              background: '#000',
              border: '2px solid #6366f1',
              width: '10px',
              height: '10px',
              ...h.style
            }}
          />
          {hoveredHandle === `${id}-${h.id}` && (
            <div className="absolute z-50 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-slate-600 whitespace-nowrap pointer-events-none"
                 style={{
                   top: h.position === Position.Top ? '20px' : h.position === Position.Bottom ? '-30px' : '50%',
                   left: h.position === Position.Left ? '20px' : h.position === Position.Right ? '-150px' : '50%',
                   transform: h.position === Position.Top || h.position === Position.Bottom ? 'translateX(-50%)' : 'translateY(-50%)',
                   minWidth: '140px'
                 }}>
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
