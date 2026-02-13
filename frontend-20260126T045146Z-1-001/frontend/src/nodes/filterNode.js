// filterNode.js

import { useState, useEffect, useRef } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const FilterNode = ({ id, data, selected }) => {
  const [filterType, setFilterType] = useState(data?.filterType || 'contains');
  const [filterValue, setFilterValue] = useState(data?.filterValue || '');

  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = data?.selected || false;
  const isDisplayOpen = data?.isDisplayOpen || selected;

  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    updateNodeField(id, 'filterType', newType);
  };

  const handleFilterValueChange = (e) => {
    const newValue = e.target.value;
    setFilterValue(newValue);
    updateNodeField(id, 'filterValue', newValue);
  };




  // Sync state with data changes
  useEffect(() => {
    setFilterType(data?.filterType || 'contains');
    setFilterValue(data?.filterValue || '');
  }, [data?.filterType, data?.filterValue, id]);



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
    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[200px]">
          <div>
            <label htmlFor={`${id}-filterType`} className="block text-xs font-medium text-slate-300 mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={handleFilterTypeChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="contains">Contains</option>
              <option value="startsWith">Starts With</option>
              <option value="endsWith">Ends With</option>
              <option value="equals">Equals</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-filterValue`} className="block text-xs font-medium text-slate-300 mb-1">Filter Value</label>
            <input
              id={`${id}-filterValue`}
              type="text"
              value={filterValue}
              onChange={handleFilterValueChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter filter value"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '10px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          Click to configure
        </div>
      )}
    </BaseNode>
  );
};
