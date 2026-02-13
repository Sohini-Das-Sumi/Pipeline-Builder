import { useEffect } from 'react';

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || (selectedNodesStore || []).includes(id);

  const hasOutput = data?.outputValue && data.outputValue.trim() !== '';
  const isDisplayOpen = data?.isDisplayOpen || false;

  // Removed auto-opening on selection - displays stay closed by default

  const handleNameChange = (e) => {
    const newName = e.target.value;
    updateNodeField(id, 'outputName', newName);
  };

  const handles = [{ type: 'target', id: 'value' }];


  return (
    <div key={`${id}-${data?._timestamp || ''}-${data?.output || data?.outputValue || ''}-${isDisplayOpen}`}>
      <BaseNode
        id={id}
        title="Output"
        handles={handles}
        onClose={() => deleteNode(id)}
        className={`transition-transform duration-500 ${isSelected ? 'transform scale-105' : ''}`}
        isSelected={isSelected}
        isDisplayOpen={isDisplayOpen}
        updateNodeField={updateNodeField}
        nodeKey={`${id}-${isDisplayOpen}`}

      >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[200px]">
          <div>
            <label htmlFor={`${id}-outputName`} className="block text-xs font-medium text-slate-300 mb-1">Output Name</label>
            <input
              id={`${id}-outputName`}
              type="text"
              value={data?.outputName || `output_${parseInt(id.split('-')[1], 10) || 1}`}
              onChange={handleNameChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter output name"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-outputValue`} className="block text-xs font-medium text-slate-300 mb-1">Output Value</label>
            <textarea
              id={`${id}-outputValue`}
              value={data?.outputValue || data?.output || ''}
              readOnly
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-vertical"
              rows={3}
              placeholder="Output value will appear here"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
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
    </div>
  );
}
