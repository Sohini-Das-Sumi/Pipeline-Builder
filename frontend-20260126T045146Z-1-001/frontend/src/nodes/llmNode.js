// llmNode.js

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export default function LLMNode({ id, data, selected }) {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectNode = useStore((state) => state.selectNode);
  const deselectAllNodes = useStore((state) => state.deselectAllNodes);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const loadState = useStore((state) => state.loadState);
  const isSelected = selected || selectedNodesStore.includes(id);
  const isDisplayOpen = data?.isDisplayOpen || true; // Always open for LLM nodes

  const textareaRef = useRef(null);

  const [output, setOutput] = useState(data?.output || '');

  useEffect(() => {
    setOutput(data?.output || '');
  }, [data?.output]);

  useEffect(() => {
    if (isSelected && !isDisplayOpen) {
      updateNodeField(id, 'isDisplayOpen', true);
    }
    // Auto-open display when output is available
    if (output && !isDisplayOpen) {
      updateNodeField(id, 'isDisplayOpen', true);
    }
    // Don't close display when deselected - keep it open
  }, [isSelected, isDisplayOpen, id, updateNodeField, output]);

  // Force re-render when output changes
  useEffect(() => {
    if (output) {
      console.log('LLMNode output updated:', output);
    }
  }, [output]);

  const handleSystemPromptChange = (e) => {
    updateNodeField(id, 'systemPrompt', e.target.value);
  };

  const handleUserPromptChange = (e) => {
    updateNodeField(id, 'userPrompt', e.target.value);
  };

  const handleModelChange = (e) => {
    updateNodeField(id, 'model', e.target.value);
  };

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
    <div key={`${id}-${data?._timestamp || ''}`}>
      <BaseNode id={id} title="LLM" handles={handles} onClose={() => deleteNode(id)} selectNode={selectNode} className="transition-all duration-300" isSelected={isSelected} isDisplayOpen={isDisplayOpen}>
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
              className="node-textarea-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter user prompt or drag text/files here"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-output`} className="block text-xs font-medium text-slate-300 mb-1">Output</label>
            <textarea
              id={`${id}-output`}
              ref={textareaRef}
              readOnly
              rows={5}
              value={output}
              style={textareaStyle}
              placeholder="LLM response will appear here"
              onClick={(e) => e.stopPropagation()}
              className="focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
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
}
