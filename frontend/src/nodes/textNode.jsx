// textNode.js

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext.jsx';
import { useFilterComponent } from './FilterComponent';
import { useMemo, useEffect } from 'react';

// Function to parse variables from text content
// Matches {{variableName}} pattern where variableName is a valid JS identifier
const parseVariables = (text) => {
  if (!text) return [];
  // Regex to match {{variableName}} - allows spaces inside braces
  const regex = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/g;
  const variables = [];
  let match;
  // Use lastIndex to handle multiple matches in the same string
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1];
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  return variables;
};

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

  // Apply filter to text content if enabled
  const filteredText = data?.text ? applyFilter(data.text) : '';

  // Parse variables from text content - memoized for performance
  const variables = useMemo(() => {
    return parseVariables(data?.text || '');
  }, [data?.text]);

  // Update node data with variables whenever text changes
  // This ensures variables are stored and persist in the node data
  useEffect(() => {
    const currentVariables = data?.variables || [];
    // Only update if variables have changed
    if (JSON.stringify(currentVariables) !== JSON.stringify(variables)) {
      updateNodeField(id, 'variables', variables);
    }
  }, [variables, id, data?.variables, updateNodeField]);

  // Generate dynamic handles for each variable found in text
  // These handles appear on the LEFT side of the node (target handles)
  // allowing other nodes to connect and provide data for each variable
  const variableHandles = useMemo(() => {
    return variables.map(varName => ({
      type: 'target',
      id: `var-${varName}`,
      position: Position.Left,
      style: {
        background: '#10b981', // Green color for variable handles
        border: '2px solid #059669',
        width: '12px',
        height: '12px',
      },
      // Custom property to store the variable name
      varName: varName
    }));
  }, [variables]);

  // Combine base handles with variable handles
  // Base handles: input (target), output (source), filter (target on top)
  // Variable handles: dynamically created target handles on the left for each {{variable}}
  const handles = useMemo(() => {
    const baseHandles = [
      { type: 'target', id: 'input' },
      { type: 'source', id: 'output' },
      { type: 'target', id: 'filter', position: Position.Top }
    ];
    return [...variableHandles, ...baseHandles];
  }, [variableHandles]);

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
              placeholder="Enter text content. Use {{variableName}} to create variable handles for connecting other nodes."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Display detected variables info */}
          {variables.length > 0 && (
            <div className="text-xs text-slate-400 bg-slate-800 p-2 rounded border border-slate-700">
              <div className="font-medium text-slate-300 mb-1">Detected Variables:</div>
              <div className="flex flex-wrap gap-1">
                {variables.map(varName => (
                  <span key={varName} className="inline-flex items-center px-2 py-0.5 rounded bg-green-900 text-green-300 border border-green-700">
                    {`{{${varName}}}`}
                  </span>
                ))}
              </div>
              <div className="text-slate-500 mt-1 text-[10px]">
                Connect other nodes to the green handles on the left to provide values for these variables.
              </div>
            </div>
          )}
          
          {data?.isFilterEnabled && filteredText !== data?.text && (
            <div>
              <label htmlFor={`${id}-filteredText`} className="block text-xs font-medium text-slate-300 mb-1">Filtered Output</label>
              <textarea
                id={`${id}-filteredText`}
                value={filteredText}
                readOnly
                rows={3}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-green-400 text-xs resize-vertical"
                placeholder="Filtered text will appear here"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
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
