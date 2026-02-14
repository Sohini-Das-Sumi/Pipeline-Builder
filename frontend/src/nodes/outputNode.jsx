import { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';
import { useFilterComponent } from './FilterComponent';


export const OutputNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodes);
  const isSelected = selected || (selectedNodesStore || []).includes(id);

  // Find the source node connected to this output node's "value" handle
  const connectedEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'value');
  const sourceNode = connectedEdge ? nodes.find(n => n.id === connectedEdge.source) : null;
  
  // First try to get the type from the connected source node
  // Then fall back to sourceType which is set during pipeline execution
  // Finally, try the node's type property
  const outputType = sourceNode?.data?.nodeType || sourceNode?.type || data?.sourceType || 'Unknown';

  const hasOutput = data?.outputValue && data.outputValue.trim() !== '';
  const isDisplayOpen = data?.isDisplayOpen || false;

  const { filterUI, applyFilter } = useFilterComponent({
    id,
    data,
    updateNodeField
  });

  // Apply filter to output value if it exists
  const filteredOutput = data?.outputValue ? applyFilter(data.outputValue) : '';

  // Removed auto-opening on selection - displays stay closed by default


  const handleNameChange = (e) => {
    const newName = e.target.value;
    updateNodeField(id, 'outputName', newName);
  };

  const handles = [
    { type: 'target', id: 'value' },
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  // Create nodeData with nodeType for output node to identify source
  const nodeData = {
    ...data,
    nodeType: 'output'
  };

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
        data={nodeData}

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
            <label htmlFor={`${id}-outputType`} className="block text-xs font-medium text-slate-300 mb-1">Output Type</label>
            <input
              id={`${id}-outputType`}
              type="text"
              value={outputType}
              readOnly
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="No source connected"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-outputValue`} className="block text-xs font-medium text-slate-300 mb-1">Output Value</label>
            <textarea
              id={`${id}-outputValue`}
              value={filteredOutput || data?.outputValue || data?.output || ''}
              readOnly

              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-vertical"
              rows={3}
              placeholder="Output value will appear here"
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
    </div>
  );
}
