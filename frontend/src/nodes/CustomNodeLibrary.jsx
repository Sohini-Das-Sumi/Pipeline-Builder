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
    // Respect an explicit `isDisplayOpen` value (allow false to close even when selected)
    const isDisplayOpen = data?.isDisplayOpen ?? false;

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

    // Calculator logic: automatically compute result when inputs change
    React.useEffect(() => {
      if (nodeConfig.id === 'calculator') {
        const num1 = parseFloat(data?.num1 ?? 0);
        const num2 = parseFloat(data?.num2 ?? 0);
        const operation = data?.operation ?? 'add';

        let result = 0;
        switch (operation) {
          case 'add':
            result = num1 + num2;
            break;
          case 'subtract':
            result = num1 - num2;
            break;
          case 'multiply':
            result = num1 * num2;
            break;
          case 'divide':
            result = num2 !== 0 ? num1 / num2 : 0; // Avoid division by zero
            break;
          default:
            result = 0;
        }

        // Update result field
        updateNodeField(id, 'result', result);
      }
    }, [data?.num1, data?.num2, data?.operation, id, nodeConfig.id, updateNodeField]);

    // local validation state for this node instance
    const [errors, setErrors] = React.useState({});

    const validateField = (field, value) => {
      if (field.required && (value === '' || value === undefined || value === null)) {
        return `${field.label} is required`;
      }
      if (field.validationRegex) {
        try {
          const re = new RegExp(field.validationRegex);
          if (!re.test(String(value))) {
            return `Invalid ${field.label}`;
          }
        } catch (e) {
          // invalid regex -- ignore validation
        }
      }
      return null;
    };

    const onChangeAndValidate = (field, value) => {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field.name]: err }));
      handleFieldChange(field.name, value);
    };

    // Render configuration fields with extra no-code options
    const renderConfigFields = () => {
      if (!nodeConfig.fields || nodeConfig.fields.length === 0) {
        return <div className="text-slate-400 text-xs">No configuration fields</div>;
      }

      return nodeConfig.fields.map((field, index) => {
        const fieldId = `${id}-${field.name}`;
        const fieldValue = data?.[field.name] ?? (field.defaultValue ?? '');

        // evaluate simple visibility rule
        let visible = true;
        if (field.visibleWhenField) {
          const otherVal = data?.[field.visibleWhenField];
          visible = String(otherVal) === String(field.visibleWhenValue);
        }

        if (!visible) return null;

        // using top-level onChangeAndValidate so we can validate and update

        switch (field.type) {
          case 'text':
            return (
              <div key={index}>
                <label htmlFor={fieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  {field.label}{field.required ? ' *' : ''}
                </label>
                <input
                  id={fieldId}
                  type="text"
                  value={fieldValue}
                  onChange={(e) => onChangeAndValidate(field, e.target.value)}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                  title={field.helpText || ''}
                />
                {field.helpText && <div className="text-xs text-slate-400 mt-1">{field.helpText}</div>}
                {errors[field.name] && <div className="text-xs text-red-400 mt-1">{errors[field.name]}</div>}
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
                  onChange={(e) => onChangeAndValidate(field, e.target.value)}
                  rows={field.rows || 3}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {field.helpText && <div className="text-xs text-slate-400 mt-1">{field.helpText}</div>}
                {errors[field.name] && <div className="text-xs text-red-400 mt-1">{errors[field.name]}</div>}
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
                  onChange={(e) => onChangeAndValidate(field, e.target.value)}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {field.options?.map((option, optIndex) => (
                    <option key={optIndex} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {field.helpText && <div className="text-xs text-slate-400 mt-1">{field.helpText}</div>}
                {errors[field.name] && <div className="text-xs text-red-400 mt-1">{errors[field.name]}</div>}
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
                  onChange={(e) => onChangeAndValidate(field, parseFloat(e.target.value) || 0)}
                  min={field.min}
                  max={field.max}
                  step={field.step || 1}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {field.helpText && <div className="text-xs text-slate-400 mt-1">{field.helpText}</div>}
                {errors[field.name] && <div className="text-xs text-red-400 mt-1">{errors[field.name]}</div>}
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
        data={data}
      >
        {isDisplayOpen ? (
          <div className="space-y-3 p-3 max-w-xl min-h-[300px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">{nodeConfig.title} Configuration</span>
              <button
                onClick={(e) => { e.stopPropagation(); updateNodeField(id, 'isDisplayOpen', false); }}
                className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-xs"
              >
                ×
              </button>
            </div>
            {renderConfigFields()}
          </div>
        ) : (
          <button
            className="node-closed-text"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateNodeField(id, 'isDisplayOpen', true);
            }}
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit' }}
          >
            Click to configure
          </button>
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
        name: 'num1',
        label: 'First Number',
        type: 'number',
        defaultValue: 0,
        placeholder: 'Enter first number'
      },
      {
        name: 'num2',
        label: 'Second Number',
        type: 'number',
        defaultValue: 0,
        placeholder: 'Enter second number'
      },
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
        placeholder: 'Calculated result',
        readOnly: true
      }
    ]
  };

  // Create and register the calculator node
  createCustomNode(calculatorConfig);
};

// Initialize example node on module load
createExampleCalculatorNode();
