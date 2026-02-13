import { useRef } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext';

export const TimerNode = ({ id, data, selected }) => {

  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const timerRef = useRef(null);
  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;

  const handleDelayChange = (e) => {
    const newDelay = parseInt(e.target.value, 10);
    updateNodeField(id, 'delay', newDelay);
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    updateNodeField(id, 'unit', newUnit);
  };





  const handles = [
    { type: 'source', id: 'timeout' },
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  return (
    <BaseNode
      id={id}
      title="⏱️ Timer"
      handles={handles}
      onClose={() => deleteNode(id)}
      className={`transition-all duration-500 ${isSelected ? 'transform scale-105' : ''}`}
      isSelected={isSelected}
      isDisplayOpen={isDisplayOpen}
      updateNodeField={updateNodeField}
      nodeKey={`${id}-${isDisplayOpen}`}
    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Timer Configuration</span>
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
            <label htmlFor={`${id}-delay`} className="block text-xs font-medium text-slate-300 mb-1">Delay</label>
            <input
              id={`${id}-delay`}
              type="number"
              value={data?.delay || 1000}
              onChange={handleDelayChange}
              className="node-input-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter delay in milliseconds"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-unit`} className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
            <select
              id={`${id}-unit`}
              value={data?.unit || 'ms'}
              onChange={handleUnitChange}
              className="node-select-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="ms">Milliseconds</option>
              <option value="s">Seconds</option>
              <option value="m">Minutes</option>
            </select>
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
