// CustomNodeCreator.js - Component for creating custom nodes manually

import React, { useState } from 'react';
import { createCustomNode, getCustomNodes } from './CustomNodeLibrary';

export const CustomNodeCreator = ({ onNodeCreated, onClose }) => {
  const [nodeConfig, setNodeConfig] = useState({
    id: '',
    title: '',
    color: '#f97316', // Default orange color
    description: '',
    inputs: 1,
    outputs: 1,
    fields: []
  });

  const [currentField, setCurrentField] = useState({
    name: '',
    label: '',
    type: 'text',
    defaultValue: '',
    placeholder: '',
    options: [],
    required: false,
    helpText: '',
    validationRegex: '',
    visibleWhenField: '',
    visibleWhenValue: '',
    min: 0,
    max: 100,
    step: 1,
    rows: 3
  });

  const handleConfigChange = (field, value) => {
    setNodeConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldChange = (field, value) => {
    setCurrentField(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addField = () => {
    if (!currentField.name || !currentField.label) {
      alert('Field name and label are required');
      return;
    }

    // Check if field name already exists
    if (nodeConfig.fields.some(f => f.name === currentField.name)) {
      alert('Field name must be unique');
      return;
    }

    setNodeConfig(prev => ({
      ...prev,
      fields: [...prev.fields, { ...currentField }]
    }));

    // Reset current field
    setCurrentField({
      name: '',
      label: '',
      type: 'text',
      defaultValue: '',
      placeholder: '',
      options: [],
      required: false,
      helpText: '',
      validationRegex: '',
      visibleWhenField: '',
      visibleWhenValue: '',
      min: 0,
      max: 100,
      step: 1,
      rows: 3
    });
  };

  const removeField = (index) => {
    setNodeConfig(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const addOption = () => {
    setCurrentField(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }]
    }));
  };

  const updateOption = (index, field, value) => {
    setCurrentField(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeOption = (index) => {
    setCurrentField(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const createNode = () => {
    if (!nodeConfig.id || !nodeConfig.title) {
      alert('Node ID and Title are required');
      return;
    }

    // Check if node ID already exists
    const existingNodes = getCustomNodes();
    if (existingNodes.some(n => n.id === nodeConfig.id)) {
      alert('Node ID must be unique');
      return;
    }

    try {
      // Create the custom node
      const CustomNodeComponent = createCustomNode(nodeConfig);

      // Notify parent component
      if (onNodeCreated) {
        onNodeCreated({
          id: nodeConfig.id,
          component: CustomNodeComponent,
          config: nodeConfig
        });
      }

      // Reset form
      setNodeConfig({
        id: '',
        title: '',
        color: '#f97316',
        description: '',
        inputs: 1,
        outputs: 1,
        fields: []
      });

      alert(`Custom node "${nodeConfig.title}" created successfully!`);
      onClose();
    } catch (error) {
      alert('Error creating custom node: ' + error.message);
    }
  };

  const colorOptions = [
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Gray', value: '#6b7280' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Custom Node</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-white"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Basic Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Node ID *</label>
              <input
                type="text"
                value={nodeConfig.id}
                onChange={(e) => handleConfigChange('id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="unique-node-id"
              />
              <p className="text-xs text-slate-400 mt-1">Unique identifier for the node type</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Node Title *</label>
              <input
                type="text"
                value={nodeConfig.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="My Custom Node"
              />
              <p className="text-xs text-slate-400 mt-1">Display name shown on the node</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={nodeConfig.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Short description shown in the node panel"
                rows={2}
              />
              <p className="text-xs text-slate-400 mt-1">Optional description for the node</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Node Color</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleConfigChange('color', color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      nodeConfig.color === color.value ? 'border-white scale-110' : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Input Handles</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={nodeConfig.inputs}
                  onChange={(e) => handleConfigChange('inputs', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Output Handles</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={nodeConfig.outputs}
                  onChange={(e) => handleConfigChange('outputs', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Field Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Configuration Fields</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Field Name *</label>
                <input
                  type="text"
                  value={currentField.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="fieldName"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Field Label *</label>
                <input
                  type="text"
                  value={currentField.label}
                  onChange={(e) => handleFieldChange('label', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Field Label"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Required</label>
                  <input
                    type="checkbox"
                    checked={currentField.required}
                    onChange={(e) => handleFieldChange('required', e.target.checked)}
                    className="mr-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Help Text</label>
                  <input
                    type="text"
                    value={currentField.helpText}
                    onChange={(e) => handleFieldChange('helpText', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="A short hint shown under the field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Validation (Regex)</label>
                <input
                  type="text"
                  value={currentField.validationRegex}
                  onChange={(e) => handleFieldChange('validationRegex', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. ^[A-Za-z0-9_]+$"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visible When Field</label>
                  <input
                    type="text"
                    value={currentField.visibleWhenField}
                    onChange={(e) => handleFieldChange('visibleWhenField', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="otherFieldName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visible When Value</label>
                  <input
                    type="text"
                    value={currentField.visibleWhenValue}
                    onChange={(e) => handleFieldChange('visibleWhenValue', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="value to match"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Field Type</label>
                <select
                  value={currentField.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Select Dropdown</option>
                  <option value="number">Number Input</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Default Value</label>
                <input
                  type="text"
                  value={currentField.defaultValue}
                  onChange={(e) => handleFieldChange('defaultValue', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Default value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={currentField.placeholder}
                  onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Placeholder text"
                />
              </div>

              {/* Type-specific options */}
              {currentField.type === 'number' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Min</label>
                    <input
                      type="number"
                      value={currentField.min}
                      onChange={(e) => handleFieldChange('min', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Max</label>
                    <input
                      type="number"
                      value={currentField.max}
                      onChange={(e) => handleFieldChange('max', parseFloat(e.target.value) || 100)}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Step</label>
                    <input
                      type="number"
                      value={currentField.step}
                      onChange={(e) => handleFieldChange('step', parseFloat(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentField.type === 'textarea' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={currentField.rows}
                    onChange={(e) => handleFieldChange('rows', parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {currentField.type === 'select' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Options</label>
                  {currentField.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeOption(index)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded"
                  >
                    Add Option
                  </button>
                </div>
              )}

              <button
                onClick={addField}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>

        {/* Current Fields List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Current Fields</h3>
          {nodeConfig.fields.length === 0 ? (
            <p className="text-slate-400">No fields added yet</p>
          ) : (
            <div className="space-y-2">
              {nodeConfig.fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div>
                    <span className="text-white font-medium">{field.label}</span>
                    <span className="text-slate-400 text-sm ml-2">({field.type})</span>
                  </div>
                  <button
                    onClick={() => removeField(index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={createNode}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Create Node
          </button>
        </div>

      </div>
    </div>
  );

};
