// CustomNodeManager.js - A versatile node for managing custom nodes with full configuration capabilities

import React, { useState } from 'react';
import { BaseNode } from './BaseNode';
import { CustomNodeCreator } from './CustomNodeCreator';
import { getCustomNodes, removeCustomNode, getCustomNodeDefaultData } from './CustomNodeLibrary';
import { useStore } from '../store';

export const CustomNodeManager = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);

  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;

  const [activeTab, setActiveTab] = useState('create'); // 'create', 'manage', 'export'
  const [showCreator, setShowCreator] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [importData, setImportData] = useState('');

  const customNodes = getCustomNodes();

  const handles = [
    { type: 'source', id: 'output' }
  ];

  // Create nodeData with nodeType for output node to identify source
  const nodeData = {
    ...data,
    nodeType: 'customNodeManager',
    displayWidth: 600,
    displayHeight: 350
  };

  const handleNodeCreated = (nodeInfo) => {
    // Refresh the list or notify user
    console.log('Custom node created:', nodeInfo);
  };

  const handleRemoveNode = (nodeId) => {
    if (window.confirm(`Are you sure you want to remove the custom node "${nodeId}"?`)) {
      removeCustomNode(nodeId);
      // Force re-render by updating some state if needed
    }
  };

  const handleDuplicateNode = (nodeConfig) => {
    const duplicatedConfig = {
      ...nodeConfig,
      id: `${nodeConfig.id}_copy_${Date.now()}`,
      title: `${nodeConfig.title} (Copy)`
    };
    // Note: Duplication would require creating a new node via CustomNodeLibrary
    // For now, we'll just show an alert
    alert(`Duplication feature not fully implemented yet. Config: ${JSON.stringify(duplicatedConfig, null, 2)}`);
  };

  const handleExportNode = (nodeConfig) => {
    const dataStr = JSON.stringify(nodeConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${nodeConfig.id}_config.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportNode = () => {
    try {
      const importedConfig = JSON.parse(importData);
      // Validate the config structure
      if (!importedConfig.id || !importedConfig.title) {
        throw new Error('Invalid config: missing id or title');
      }
      // Create the node using CustomNodeLibrary
      // This would require extending CustomNodeLibrary to accept pre-defined configs
      alert(`Import feature not fully implemented yet. Would create node with config: ${JSON.stringify(importedConfig, null, 2)}`);
      setImportData('');
    } catch (error) {
      alert('Error importing node: ' + error.message);
    }
  };

  const renderCreateTab = () => (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Create New Custom Node</h3>
      <p className="text-slate-400 text-sm">Click the button below to open the custom node creator.</p>
      <button
        onClick={() => setShowCreator(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
      >
        Open Node Creator
      </button>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Manage Custom Nodes</h3>
      {customNodes.length === 0 ? (
        <p className="text-slate-400 text-sm">No custom nodes created yet. Switch to the "Create" tab to add some.</p>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {customNodes.map((node) => (
            <div key={node.id} className="bg-slate-700 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-white font-medium text-sm">{node.title}</h4>
                  <p className="text-slate-400 text-xs">ID: {node.id}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDuplicateNode(node)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded"
                    title="Duplicate"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleExportNode(node)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] rounded"
                    title="Export"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleRemoveNode(node.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                <p>Inputs: {node.inputs}, Outputs: {node.outputs}</p>
                <p>Fields: {node.fields?.length || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Import/Export</h3>

      <div>
        <h4 className="text-white font-medium mb-1 text-sm">Import Configuration</h4>
        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste JSON here..."
          className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
        />
        <button
          onClick={handleImportNode}
          className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Import
        </button>
      </div>

      <div>
        <h4 className="text-white font-medium mb-1 text-sm">Export All</h4>
        <button
          onClick={() => {
            const allConfigs = customNodes;
            const dataStr = JSON.stringify(allConfigs, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'all_custom_nodes_config.json');
            linkElement.click();
          }}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          Export All
        </button>
      </div>
    </div>
  );

  return (
    <>
      <BaseNode
        id={id}
        title="Custom Node Manager"
        handles={handles}
        typeColor="#8b5cf6" // Purple color
        onClose={() => deleteNode(id)}
        className={`transition-all duration-500 ${isSelected ? 'transform scale-105' : ''}`}
        isSelected={isSelected}
        isDisplayOpen={isDisplayOpen}
        updateNodeField={updateNodeField}
        data={nodeData}
      >
        {isDisplayOpen ? (
          <div className="space-y-3 p-3 w-full h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-slate-300">Custom Node Manager</span>
              <button
                onClick={(e) => { e.stopPropagation(); updateNodeField(id, 'isDisplayOpen', false); }}
                className="w-6 h-6 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-xs"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-600 mb-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'create' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'manage' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
              >
                Manage ({customNodes.length})
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'export' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
              >
                Import/Export
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeTab === 'create' && renderCreateTab()}
              {activeTab === 'manage' && renderManageTab()}
              {activeTab === 'export' && renderExportTab()}
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateNodeField(id, 'isDisplayOpen', true);
            }}
            className="w-full text-center p-3 text-sm text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
          >
            Click to manage custom nodes
          </button>
        )}
      </BaseNode>

      {/* Custom Node Creator Modal */}
      {showCreator && (
        <CustomNodeCreator
          onNodeCreated={(nodeInfo) => {
            handleNodeCreated(nodeInfo);
            setShowCreator(false);
          }}
          onClose={() => setShowCreator(false)}
        />
      )}
    </>
  );
};
