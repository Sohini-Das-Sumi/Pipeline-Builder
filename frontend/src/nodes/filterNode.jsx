// filterNode.js

import { useState, useEffect, useRef } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext.jsx';
import { useFilterComponent } from './FilterComponent';

export const FilterNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || (selectedNodesStore || []).includes(id);
  
  // Sync isDisplayOpen with selected state - this ensures arrangeDisplays can find the node
  // when it's selected (which is one way to open the filter display)
  const isDisplayOpen = data?.isDisplayOpen || selected;
  
  // Effect to sync isDisplayOpen with selected state in node data
  useEffect(() => {
    if (selected && !data?.isDisplayOpen) {
      updateNodeField(id, 'isDisplayOpen', true);
    }
  }, [selected, data?.isDisplayOpen, id, updateNodeField]);

  const { filterUI, applyFilter } = useFilterComponent({
    id,
    data,
    updateNodeField
  });



  const inputStyle = {
    marginLeft: 6,
    width: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
    background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  };

  const selectStyle = {
    ...inputStyle,
    height: '36px',
  };



  const handles = [
    { type: 'target', id: 'input' },
    { type: 'source', id: 'filtered' },
  ];

  return (
    <BaseNode
      id={id}
      title="🔍 Filter"
      handles={handles}
      onClose={() => deleteNode(id)}
      className={`transition-transform duration-300 ${isSelected ? 'transform scale-105' : ''}`}
      isSelected={isSelected}
      isDisplayOpen={isDisplayOpen}
      updateNodeField={updateNodeField}
      nodeKey={`${id}-${isDisplayOpen}`}
    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Filter Configuration</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateNodeField(id, 'isDisplayOpen', false);
              }}
              className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-xs"
            >
              ×
            </button>
          </div>
          {filterUI}
        </div>
      ) : (
        <button
          className="node-closed-text"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateNodeField(id, 'isDisplayOpen', true);
          }}
        >
          Click to configure
        </button>
      )}
    </BaseNode>
  );
};
