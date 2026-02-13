import React, { useState, useEffect } from 'react';

export const useFilterComponent = ({ id, data, updateNodeField }) => {
  const [filterType, setFilterType] = useState(data?.filterType || 'none');
  const [filterValue, setFilterValue] = useState(data?.filterValue || '');
  const [isFilterEnabled, setIsFilterEnabled] = useState(data?.isFilterEnabled || false);

  useEffect(() => {
    setFilterType(data?.filterType || 'none');
    setFilterValue(data?.filterValue || '');
    setIsFilterEnabled(data?.isFilterEnabled || false);
  }, [data?.filterType, data?.filterValue, data?.isFilterEnabled]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    updateNodeField(id, 'filterType', newType);
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setFilterValue(newValue);
    updateNodeField(id, 'filterValue', newValue);
  };

  const handleToggleFilter = (e) => {
    const enabled = e.target.checked;
    setIsFilterEnabled(enabled);
    updateNodeField(id, 'isFilterEnabled', enabled);
  };

  const applyFilter = (inputData) => {
    if (!isFilterEnabled || filterType === 'none' || !inputData) {
      return inputData;
    }

    let filteredOutput = '';

    switch (filterType) {
      case 'contains':
        filteredOutput = inputData.includes(filterValue) ? inputData : '';
        break;
      case 'equals':
        filteredOutput = inputData === filterValue ? inputData : '';
        break;
      case 'startsWith':
        filteredOutput = inputData.startsWith(filterValue) ? inputData : '';
        break;
      case 'endsWith':
        filteredOutput = inputData.endsWith(filterValue) ? inputData : '';
        break;
      case 'greaterThan':
        const numInput = parseFloat(inputData);
        const numFilter = parseFloat(filterValue);
        filteredOutput = !isNaN(numInput) && !isNaN(numFilter) && numInput > numFilter ? inputData : '';
        break;
      case 'lessThan':
        const numInput2 = parseFloat(inputData);
        const numFilter2 = parseFloat(filterValue);
        filteredOutput = !isNaN(numInput2) && !isNaN(numFilter2) && numInput2 < numFilter2 ? inputData : '';
        break;
      case 'regex':
        try {
          const regex = new RegExp(filterValue);
          filteredOutput = regex.test(inputData) ? inputData : '';
        } catch (e) {
          filteredOutput = `Error: Invalid regex - ${filterValue}`;
        }
        break;
      default:
        filteredOutput = inputData;
    }

    return filteredOutput;
  };

  return {
    filterUI: (
      <div className="flex flex-col gap-2 border-t border-slate-200 pt-2 mt-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFilterEnabled}
            onChange={handleToggleFilter}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-[10px] text-slate-400 font-bold">ENABLE FILTER</label>
        </div>

        {isFilterEnabled && (
          <>
            <label className="text-[10px] text-slate-400 font-bold">FILTER TYPE</label>
            <select
              value={filterType}
              onChange={handleTypeChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="none">No Filter</option>
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
              <option value="startsWith">Starts With</option>
              <option value="endsWith">Ends With</option>
              <option value="greaterThan">Greater Than</option>
              <option value="lessThan">Less Than</option>
              <option value="regex">Regex Match</option>
            </select>
            <label className="text-[10px] text-slate-400 font-bold">FILTER VALUE</label>
            <input
              type="text"
              value={filterValue}
              onChange={handleValueChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter filter value..."
            />
          </>
        )}
      </div>
    ),
    applyFilter
  };
};
