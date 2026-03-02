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
  
  // Use local state for output to ensure it displays correctly
  const [output, setOutput] = useState(data?.output || '');
  
  // Sync isDisplayOpen with selected state - this ensures arrangeDisplays can find the node
  // when it's selected (which is one way to open the filter display)
  const isDisplayOpen = data?.isDisplayOpen || selected;
  
  // Effect to sync isDisplayOpen with selected state in node data
  useEffect(() => {
    if (selected && !data?.isDisplayOpen) {
      updateNodeField(id, 'isDisplayOpen', true);
    }
  }, [selected, data?.isDisplayOpen, id, updateNodeField]);

  // Sync output with store data - this ensures the output displays after pipeline execution
  useEffect(() => {
    if (data?.output !== undefined && data?.output !== output) {
      setOutput(data.output);
    }
  }, [data?.output]);

  const { filterUI, applyFilter } = useFilterComponent({
    id,
    data,
    updateNodeField
  });

  // Apply filter to output if it exists (for display in the UI)
  const filteredOutput = output ? applyFilter(output) : '';

  const handles = [
    { type: 'target', id: 'input' },
    { type: 'source', id: 'filtered' },
  ];

  // Create nodeData with nodeType for output node to identify source
  const nodeData = {
    ...data,
    nodeType: 'filter'
  };

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
      data={nodeData}
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
          {/* Output Area - This displays the filter result after pipeline execution */}
          <div>
            <label htmlFor={`${id}-output`} className="block text-xs font-medium text-slate-300 mb-1">Output</label>
            <textarea
              id={`${id}-output`}
              readOnly
              rows={3}
              value={filteredOutput || output}
              className="node-textarea-dark resize-vertical"
              placeholder="Filtered output will appear here"
              onClick={(e) => e.stopPropagation()}
            />
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
