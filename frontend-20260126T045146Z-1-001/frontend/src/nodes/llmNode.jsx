// llmNode.js

import React, { useEffect } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

function LLMNode({ id, data, selected }) {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectNode = useStore((state) => state.selectNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || selectedNodesStore.includes(id);

  // Use data prop from ReactFlow - gets updated when store changes
  const nodeOutput = data?.output;
  const nodeTimestamp = data?._timestamp;

  console.log(`LLMNode ${id} render - data output:`, nodeOutput, 'timestamp:', nodeTimestamp);

  // Use data prop directly - ReactFlow passes updated data when store changes
  const isDisplayOpen = data?.isDisplayOpen || false;

  // Auto-open display on selection
  useEffect(() => {
    if (isSelected && !isDisplayOpen) {
      updateNodeField(id, 'isDisplayOpen', true);
    }
  }, [isSelected, isDisplayOpen, updateNodeField, id]);

  const handleSystemPromptChange = (e) => {
    updateNodeField(id, 'systemPrompt', e.target.value);
  };

  const handleUserPromptChange = (e) => {
    updateNodeField(id, 'userPrompt', e.target.value);
  };

  const handleModelChange = (e) => {
    try {
      if (e.target && e.target.value) {
        updateNodeField(id, 'model', e.target.value);
      }
    } catch (error) {
      console.error(`Error handling model change in LLM node ${id}: ${error}`);
    }
  };

  // Removed unused executePipeline function

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();

    // Try multiple data types for text content
    const dataTypes = ['text/plain', 'text/html', 'text/uri-list', 'text'];
    let text = '';
    for (const type of dataTypes) {
      text = e.dataTransfer.getData(type);
      if (text) break;
    }

    if (text) {
      const currentValue = data?.[field] || '';
      const newValue = currentValue ? currentValue + '\n' + text : text;
      updateNodeField(id, field, newValue);
    }

    // Handle file drops
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        const currentValue = data?.[field] || '';
        const newValue = currentValue ? currentValue + '\n' + fileContent : fileContent;
        updateNodeField(id, field, newValue);
      };
      reader.readAsText(file);
    }
  };

  const textareaStyle = {
    width: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
    background: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    resize: 'vertical',
    minHeight: '60px',
  };

  const handles = [
    { type: 'target', id: 'system' },
    { type: 'target', id: 'prompt' },
    { type: 'source', id: 'response' },
  ];

  return (
    <>
      <BaseNode
        nodeKey={`${id}-${data?._timestamp || ''}`}
        id={id}
        title="LLM"
        handles={handles}
        onClose={() => deleteNode(id)}
        selectNode={selectNode}
        className="transition-all duration-300"
        isSelected={isSelected}
        isDisplayOpen={isDisplayOpen}
        updateNodeField={updateNodeField}
      >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">LLM Configuration</span>
            <button
              onClick={() => updateNodeField(id, 'isDisplayOpen', false)}
              className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-xs"
            >
              ×
            </button>
          </div>
            <div>
              <label htmlFor={`${id}-model`} className="block text-xs font-medium text-slate-300 mb-1">Model</label>
              <select
                id={`${id}-model`}
                value={data?.model || 'llama2'}
                onChange={handleModelChange}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="llama2">Llama 2</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-systemPrompt`} className="block text-xs font-medium text-slate-300 mb-1">System Prompt</label>
              <textarea
                id={`${id}-systemPrompt`}
                value={data?.systemPrompt || ''}
                onChange={handleSystemPromptChange}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'systemPrompt')}
                rows={3}
                style={textareaStyle}
                placeholder="Enter system prompt or drag text/files here"
                onClick={(e) => e.stopPropagation()}
                className="focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`${id}-userPrompt`} className="block text-xs font-medium text-slate-300 mb-1">User Prompt</label>
              <textarea
                id={`${id}-userPrompt`}
                value={data?.userPrompt || ''}
                onChange={handleUserPromptChange}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'userPrompt')}
                rows={5}
                style={textareaStyle}
                placeholder="Enter user prompt or drag text/files here"
                onClick={(e) => e.stopPropagation()}
                className="focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`${id}-output`} className="block text-xs font-medium text-slate-300 mb-1">Output</label>
              <textarea
                key={`${id}-output-${nodeTimestamp || ''}-${nodeOutput || ''}`}
                id={`${id}-output`}
                readOnly
                rows={5}
                value={nodeOutput?.trim() ? nodeOutput : 'No output generated'}
                style={textareaStyle}
                placeholder="LLM response will appear here"
                onClick={(e) => e.stopPropagation()}
                className="focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
        </div>
      ) : (
        <div className="node-closed-text">
          Click to configure
        </div>
      )}
    </BaseNode>
    </>
  );
}

export default LLMNode;
