// textNode.js

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext.jsx';
import { useFilterComponent } from './FilterComponent';

export const TextNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;

  const { filterUI, applyFilter } = useFilterComponent({
    id,
    data,
    updateNodeField
  });

  const handleTextChange = (e) => {
    const newText = e.target.value;
    updateNodeField(id, 'text', newText);
  };

  const textareaStyle = {
    marginLeft: 6,
    width: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
    background: 'linear-gradient(45deg, #ffecd2, #fcb69f)',
    border: 'none',
    borderRadius: '8px',
    color: '#333',
    fontSize: '12px',
    resize: 'vertical',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  };

  const handles = [
    { type: 'target', id: 'input' },
    { type: 'source', id: 'output' },
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  return (
    <BaseNode
      id={id}
      title="📄 Text"
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
            <span className="text-xs font-medium text-slate-300">Text Configuration</span>
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
            <label htmlFor={`${id}-text`} className="block text-xs font-medium text-slate-300 mb-1">Text Content</label>
            <textarea
              id={`${id}-text`}
              value={data?.text || ''}
              onChange={handleTextChange}
              rows={3}
              style={textareaStyle}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-vertical"
              placeholder="Enter text content"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filterUI}
        </div>
      ) : (
        <div className="node-closed-text">
          Click to configure
        </div>
      )}
    </BaseNode>
  );
};
