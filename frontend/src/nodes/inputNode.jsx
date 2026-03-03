// inputNode.js

import { useState, useEffect, useCallback } from 'react';

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext.jsx';
import { useFilterComponent } from './FilterComponent';

export const InputNode = ({ id, data, selected }) => {
  const [currName, setCurrName] = useState((data === null || data === void 0 ? void 0 : data.inputName) || 'Input');
  const [inputType, setInputType] = useState(data.inputType || 'Text');
  const [inputValue, setInputValue] = useState((data === null || data === void 0 ? void 0 : data.inputValue) || '');
  const updateNodeField = useStore(state => state.updateNodeField);
  const deleteNode = useStore(state => state.deleteNode);
  const selectNode = useStore(state => state.selectNode);
  const deselectAllNodes = useStore(state => state.deselectAllNodes);
  const selectedNodesStore = useStore(state => state.selectedNodes);


  const nodeData = { ...data, nodeType: 'input' };

  const { filterUI, applyFilter } = useFilterComponent({
    id,
    data,
    updateNodeField
  });

  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false; // Allow manual opening for configuration

  const handleNameChange = e => {
    const newName = e.target.value;
    setCurrName(newName);
    // Don't update store on every keystroke - only update on blur
    // This prevents the cursor from jumping due to re-renders
  };

  const handleNameBlur = () => {
    // Only update store when user leaves the field
    updateNodeField(id, 'inputName', currName);
  };

  const handleTypeChange = e => {
    const newType = e.target.value;
    setInputType(newType);
    updateNodeField(id, 'inputType', newType);
  };

  const handleValueChange = e => {
    const fileTypes = ['File', 'PDF', 'DOC', 'Image'];
    const newValue = fileTypes.includes(inputType) ? (e.target.files[0]?.name || '') : e.target.value;
    setInputValue(newValue);
    updateNodeField(id, 'inputValue', newValue);
  };

  // Sync state with data changes
  useEffect(() => {
    setCurrName((data === null || data === void 0 ? void 0 : data.inputName) || 'Input');
    setInputType(data.inputType || 'Text');
    const fileTypes = ['File', 'PDF', 'DOC', 'Image'];
    const storedValue = (data === null || data === void 0 ? void 0 : data.inputValue) || '';
    setInputValue(fileTypes.includes(data.inputType || 'Text') && storedValue instanceof File ? storedValue.name : storedValue);
  }, [data === null || data === void 0 ? void 0 : data.inputName, data === null || data === void 0 ? void 0 : data.inputType, data === null || data === void 0 ? void 0 : data.inputValue, id]);

  // Removed auto-opening on selection - displays stay closed by default

  const handles = [

    { type: 'source', id: 'value' },
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  if (data?.isVisible === false) {
    return null;
  }

  return (
    <BaseNode
      id={id}
      title="Input"
      handles={handles}
      onClose={() => deleteNode(id)}
      visible={data?.isVisible}
      isSelected={isSelected}
      isDisplayOpen={isDisplayOpen}
      updateNodeField={updateNodeField}
      selectNode={selectNode}
      className={`transition-transform duration-500`}
      nodeKey={id}
      data={nodeData}

    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Input Configuration</span>
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
            <label htmlFor={`${id}-inputName`} className="block text-xs font-medium node-label mb-1">Input Name</label>
            <input
              id={`${id}-inputName`}
              type="text"
              value={currName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter input name"
              onClick={(e) => e.stopPropagation()}
            />

          </div>
          <div>
            <label htmlFor={`${id}-inputType`} className="block text-xs font-medium node-label mb-1">Input Type</label>
            <select
              id={`${id}-inputType`}
              value={inputType}
              onChange={handleTypeChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >

              <option value="Text">Text</option>
              <option value="File">File</option>
              <option value="PDF">PDF</option>
              <option value="Image">Image</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-inputValue`} className="block text-xs font-medium text-slate-300 mb-1">Input Value</label>
            {['File', 'PDF', 'Image'].includes(inputType) ? (
              <div className="space-y-2">
                {/* Drag and Drop Zone */}
                <div
                  className="w-full min-h-[60px] border-2 border-dashed rounded-lg p-3 transition-colors cursor-pointer flex flex-col items-center justify-center text-center drag-drop-zone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('drag-hover');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('drag-hover');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('drag-hover');

                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      const file = files[0];
                      // Validate file type based on inputType
                      let isValidType = true;

                      if (inputType === 'PDF' && !file.type.includes('pdf')) {
                        isValidType = false;
                      } else if (inputType === 'Image' && !file.type.startsWith('image/')) {
                        isValidType = false;
                      }

                      if (isValidType) {
                        handleValueChange({ target: { files: [file] } });
                        // Removed auto-opening display on file drop
                      } else {
                        // Could add error handling here
                        console.warn(`Invalid file type for ${inputType}`);
                      }
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trigger file input click
                    document.getElementById(`${id}-inputValue`).click();
                  }}
                >
                  <div className="node-text-secondary text-xs mb-1">
                    {inputValue ? (
                      <span className="text-green-400">📎 {inputValue}</span>
                    ) : (
                      <>
                        <div className="text-sm mb-1">📂 Drop file here or click to browse</div>
                        <div className="text-xs node-text-secondary">
                          {inputType === 'PDF' && 'Accepts PDF files'}
                          {inputType === 'Image' && 'Accepts image files'}
                          {inputType === 'File' && 'Accepts any file type'}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  id={`${id}-inputValue`}
                  type="file"
                  onChange={handleValueChange}
                  className="hidden"
                  accept={
                    inputType === 'PDF' ? '.pdf' :
                    inputType === 'Image' ? 'image/*' :
                    '*'
                  }
                />
              </div>
            ) : (
              <textarea
                id={`${id}-inputValue`}
                value={inputValue}
                onChange={handleValueChange}
                rows={3}
                className="node-textarea-dark resize-vertical"
                placeholder="Enter input value"
                onClick={(e) => e.stopPropagation()}
              />

            )}
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
