// CustomNodeLibrary.js - Utility for creating custom nodes dynamically

import React from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

// Registry to store custom node definitions
const customNodeRegistry = new Map();

// Function to create a custom node component
export const createCustomNode = (nodeConfig) => {
  const CustomNodeComponent = ({ id, data, selected }) => {
    const updateNodeField = useStore((state) => state.updateNodeField);
    const deleteNode = useStore((state) => state.deleteNode);
    const selectedNodesStore = useStore((state) => state.selectedNodes);

    const isSelected = selected || selectedNodesStore.includes(id);
    const isDisplayOpen = data?.isDisplayOpen || selected;

    // Generate handles based on configuration
    const handles = [];
    if (nodeConfig.inputs > 0) {
      for (let i = 0; i < nodeConfig.inputs; i++) {
        handles.push({ type: 'target', id: `input-${i}` });
      }
    }
    if (nodeConfig.outputs > 0) {
      for (let i = 0; i < nodeConfig.outputs; i++) {
        handles.push({ type: 'source', id: `output-${i}` });
      }
    }

    // Handle field changes
    const handleFieldChange = (fieldName, value) => {
      updateNodeField(id, fieldName, value);
    };

    // Render configuration fields
    const renderConfigFields = () => {
      if (!nodeConfig.fields || nodeConfig.fields.length === 0) {
        return <div className="text-slate-400 text-xs">No configuration fields</div>;
      }

      return nodeConfig.fields.map((field, index) => {
        const fieldId = `${id}-${field.name}`;
        const fieldValue = data?.[field.name] || field.defaultValue || '';

        switch (field.type) {
          case 'text':
            return (
              <div key={index}>
                <label htmlFor={fieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  {field.label}
                </label>
                <input
                  id={fieldId}
                  type="text"
                  value={fieldValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          case 'textarea':
            return (
              <div key={index}>
                <label htmlFor={fieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  {field.label}
                </label>
                <textarea
                  id={fieldId}
                  value={fieldValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  rows={field.rows || 3}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          case 'select':
            return (
              <div key={index}>
                <label htmlFor={fieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  {field.label}
                </label>
                <select
                  id={fieldId}
                  value={fieldValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {field.options?.map((option, optIndex) => (
                    <option key={optIndex} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          case 'number':
            return (
              <div key={index}>
                <label htmlFor={fieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  {field.label}
                </label>
                <input
                  id={fieldId}
                  type="number"
                  value={fieldValue}
                  onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                  min={field.min}
                  max={field.max}
                  step={field.step || 1}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          default:
            return null;
        }
      });
    };

    return (
      <BaseNode
        id={id}
        title={nodeConfig.title}
        handles={handles}
        typeColor={nodeConfig.color}
        onClose={() => deleteNode(id)}
        className={`transition-all duration-500 ${isSelected ? 'transform scale-105' : ''}`}
        isSelected={isSelected}
        isDisplayOpen={isDisplayOpen}
        updateNodeField={updateNodeField}
      >
        {isDisplayOpen ? (
          <div className="space-y-3 p-3 max-w-xl min-h-[300px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">{nodeConfig.title} Configuration</span>
              <button
                onClick={() => updateNodeField(id, 'isDisplayOpen', false)}
                className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-xs"
              >
                ×
              </button>
            </div>
            {renderConfigFields()}
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

  // Store the component in registry
  customNodeRegistry.set(nodeConfig.id, {
    component: CustomNodeComponent,
    config: nodeConfig
  });

  return CustomNodeComponent;
};

// Function to get all registered custom nodes
export const getCustomNodes = () => {
  return Array.from(customNodeRegistry.entries()).map(([id, { config }]) => ({
    id,
    ...config
  }));
};

// Function to get a specific custom node component
export const getCustomNodeComponent = (nodeId) => {
  return customNodeRegistry.get(nodeId)?.component;
};

// Function to remove a custom node
export const removeCustomNode = (nodeId) => {
  return customNodeRegistry.delete(nodeId);
};

// Function to generate default data for custom nodes
export const getCustomNodeDefaultData = (nodeConfig) => {
  const defaultData = {
    isDisplayOpen: false,
  };

  // Add default values for fields
  if (nodeConfig.fields) {
    nodeConfig.fields.forEach(field => {
      defaultData[field.name] = field.defaultValue || '';
    });
  }

  return defaultData;
};

// Example custom node: Calculator
const createExampleCalculatorNode = () => {
  const calculatorConfig = {
    id: 'calculator',
    title: 'Calculator',
    color: '#3b82f6', // Blue color
    inputs: 2,
    outputs: 1,
    fields: [
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        defaultValue: 'add',
        options: [
          { label: 'Add (+)', value: 'add' },
          { label: 'Subtract (-)', value: 'subtract' },
          { label: 'Multiply (×)', value: 'multiply' },
          { label: 'Divide (÷)', value: 'divide' }
        ]
      },
      {
        name: 'result',
        label: 'Result',
        type: 'number',
        defaultValue: 0,
        placeholder: 'Calculated result'
      }
    ]
  };

  // Create and register the calculator node
  createCustomNode(calculatorConfig);
};

// Initialize example node on module load
createExampleCalculatorNode();
