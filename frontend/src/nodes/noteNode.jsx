import { useEffect, useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext.jsx';

export const NoteNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;







  const handles = [
    { type: 'source', id: 'output' },
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  return (
    <BaseNode
      id={id}
      title="📔 Note"
      handles={handles}
      onClose={() => deleteNode(id)}
      className={`transition-all duration-500 ${isSelected ? 'transform scale-105' : ''}`}
      isSelected={isSelected}
      isDisplayOpen={isDisplayOpen}
      updateNodeField={updateNodeField}
      nodeKey={`${id}-${isDisplayOpen}`}
    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 max-w-xl min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Note Configuration</span>
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
          <div>
            <label htmlFor={`${id}-note`} className="block text-xs font-medium text-slate-300 mb-1">Note Content</label>
            <textarea
              id={`${id}-note`}
              value={data?.note || ''}
              onChange={(e) => updateNodeField(id, 'note', e.target.value)}
              rows={3}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-vertical"
              placeholder="Enter your note"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : (
        <div className="node-closed-text">
          Click to configure
        </div>
      )}
    </BaseNode>
  );
};
