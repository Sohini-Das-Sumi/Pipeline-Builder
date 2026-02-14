// core/StateManager.js - Streamlined state management with reduced duplication
import { Pipeline } from './Pipeline.js';
import { NodeFactory } from './Node.js';
import { applicationTree } from './TreeGraph.js';
import { applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';

// Helper function to validate and sanitize position coordinates
const validatePosition = (position) => {
  if (!position || typeof position !== 'object') {
    return { x: 0, y: 0 };
  }
  const x = typeof position.x === 'number' && !isNaN(position.x) && isFinite(position.x) ? position.x : 0;
  const y = typeof position.y === 'number' && !isNaN(position.y) && isFinite(position.y) ? position.y : 0;
  return { x, y };
};

export class StateManager {
  constructor() {
    this.state = {
      backgroundVisible: true,
      hasExploded: false,
      selectedNodes: [],
      selectedEdges: [],
      nodeIDs: {},
      edgeIDs: {}
    };

    this.pipeline = new Pipeline();
    this.nodesCache = null;
    this.nodesCacheInvalidated = false;
    this.lastNodesHash = null;
    this.edgesCache = null;
    this.lastEdgesHash = null;
    this.selectedNodesCache = null;
    this.lastSelectedNodesHash = null;
    this.selectedEdgesCache = null;
    this.lastSelectedEdgesHash = null;
    this.registerWithTree();
    this.loadFromStorage();
  }

  // Unified state accessors
  getBackgroundVisible() { return this.state.backgroundVisible; }
  getHasExploded() { return this.state.hasExploded; }
  getSelectedNodes() {
    return [...this.state.selectedNodes];
  }
  getSelectedEdges() {
    return [...this.state.selectedEdges];
  }

  // Recursive state updaters
  toggleBackground() {
    this.state.backgroundVisible = !this.state.backgroundVisible;
  }

  setHasExploded(value) {
    this.state.hasExploded = value;
  }

  // Node management with recursive operations
  getNodes() {
    return this.pipeline.nodes.map(node => (node && typeof node.toJSON === 'function') ? node.toJSON() : node);
  }
  getEdges() {
    return [...this.pipeline.edges];
  }

  addNode(nodeData) {
    if (!nodeData.id || typeof nodeData.id !== 'string') {
      nodeData.id = this.getNodeID(nodeData.type);
    }
    const newNode = NodeFactory.createNode(nodeData.type, nodeData.id, nodeData.position, nodeData.data);
    newNode.setSelected(nodeData.selected || false);
    newNode.selectable = nodeData.selectable || true;
    this.pipeline.addNode(newNode);
  }

  onNodesChange(changes) {
    if (changes.length === 0) return;
    const currentNodesForApply = this.pipeline.nodes.map(node => (node && typeof node.toJSON === 'function') ? node.toJSON() : node);
    const updatedNodes = applyNodeChanges(changes, currentNodesForApply);
    // Validate positions in updated nodes to prevent NaN values
    const validatedNodes = updatedNodes.map(node => ({
      ...node,
      position: validatePosition(node.position)
    }));
    this.pipeline.nodes = validatedNodes.map(node => {
      const newNode = NodeFactory.createNode(node.type, node.id, node.position, node.data);
      newNode.setSelected(node.selected);
      newNode.selectable = node.selectable;
      return newNode;
    });
    this.pipeline.buildNodeMap();
    this.nodesCacheInvalidated = true; // Invalidate cache
  }

  onEdgesChange(changes) {
    this.pipeline.edges = applyEdgeChanges(changes, this.pipeline.edges);
  }

  onConnect(connection) {
    // Generate a unique edge ID if not provided
    const edgeId = connection.id || this.getEdgeID();
    const newEdge = {
      ...connection,
      id: edgeId,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
    };
    this.pipeline.addEdge(newEdge);
  }

  // Recursive field updates
  updateNodeField(nodeId, fieldName, fieldValue) {
    this.pipeline.updateNodeField(nodeId, fieldName, fieldValue);
    this.nodesCache = null; // Invalidate cache
  }

  // Unified selection management
  onSelectionChange(elements) {
    const newSelectedNodes = elements.nodes ? elements.nodes.map(node => node.id) : [];
    const newSelectedEdges = elements.edges ? elements.edges.map(edge => edge.id) : [];

    // Only update if selection actually changed
    if (JSON.stringify(this.state.selectedNodes) !== JSON.stringify(newSelectedNodes) ||
        JSON.stringify(this.state.selectedEdges) !== JSON.stringify(newSelectedEdges)) {
      this.state.selectedNodes = newSelectedNodes;
      this.state.selectedEdges = newSelectedEdges;
    }
  }

  selectNode(nodeId) {
    if (nodeId === null) {
      this.deselectAll();
    } else {
      if (JSON.stringify(this.state.selectedNodes) !== JSON.stringify([nodeId])) {
        this.state.selectedNodes = [nodeId];
        this.state.selectedEdges = [];
        // Update node instances' selected property
        this.pipeline.nodes.forEach(node => {
          node.setSelected(node.id === nodeId);
        });
      }
    }
  }

  deselectAll() {
    this.state.selectedNodes = [];
    this.state.selectedEdges = [];
    // Update node instances' selected property and close all displays
    this.pipeline.nodes.forEach(node => {
      node.setSelected(false);
      // Close any open displays by updating node data
      if (node.data) {
        node.data.isDisplayOpen = false;
        node.data.selected = false;
      }
    });
  }

  closeAllDisplays() {
    // Close all node displays
    this.pipeline.nodes.forEach(node => {
      if (node.data) {
        node.data.isDisplayOpen = false;
      }
    });
  }


  deleteNode(nodeId) {
    this.pipeline.removeNode(nodeId);
    this.state.selectedNodes = this.state.selectedNodes.filter(id => id !== nodeId);
    this.state.selectedEdges = this.state.selectedEdges.filter(edgeId => {
      const edge = this.pipeline.edges.find(e => e.id === edgeId);
      return edge && edge.source !== nodeId && edge.target !== nodeId;
    });
  }

  // Recursive ID generation
  getNodeID(type) {
    this.state.nodeIDs[type] = (parseInt(this.state.nodeIDs[type], 10) || 0) + 1;
    return `${type}-${this.state.nodeIDs[type]}`;
  }

  getEdgeID() {
    this.state.edgeIDs['edge'] = (this.state.edgeIDs['edge'] || 0) + 1;
    return `edge-${this.state.edgeIDs['edge']}`;
  }

  // Unified pipeline execution
  async executePipeline(inputValue = '') {
    try {
      const results = await this.pipeline.execute(inputValue);

      // Store execution data recursively
      this.storeExecutionData(results, inputValue);
      this.setHasExploded(true);

      return results;
    } catch (error) {
      console.error('Pipeline execution failed:', error);
      throw error;
    }
  }

  // Recursive execution data storage
  async storeExecutionData(results, inputValue) {
    // Removed fetch call to avoid backend dependency
    console.log('Execution data stored locally:', { inputValue, outputs: results.outputs });
  }

  // Unified persistence with recursive state saving
  persistState() {
    try {
      const stateToSave = {
        backgroundVisible: this.state.backgroundVisible,
        hasExploded: this.state.hasExploded,
        nodes: this.getNodes().filter(node => node.type !== 'llm'),
        edges: this.getEdges(),
        nodeIDs: this.state.nodeIDs,
        edgeIDs: this.state.edgeIDs,
        selectedNodes: this.state.selectedNodes,
        selectedEdges: this.state.selectedEdges,
      };
      localStorage.setItem('pipelineState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Recursive state loading
  loadFromStorage() {
    // NOTE: previously this code cleared localStorage on load which prevented
    // tests or external scripts from seeding `pipelineState`. Leave existing
    // persisted state intact so automated verification can seed state when needed.

    let saved = null;
    try {
      saved = localStorage.getItem('pipelineState');
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }

    if (saved) {
      try {
        const loadedState = JSON.parse(saved);
        Object.assign(this.state, {
          backgroundVisible: loadedState.backgroundVisible ?? true,
          hasExploded: loadedState.hasExploded ?? false,
          nodeIDs: loadedState.nodeIDs ? Object.keys(loadedState.nodeIDs).reduce((acc, key) => {
            acc[key] = parseInt(loadedState.nodeIDs[key], 10) || 0;
            return acc;
          }, {}) : {},
          selectedNodes: loadedState.selectedNodes ?? [],
          selectedEdges: loadedState.selectedEdges ?? [],
        });

        if (loadedState.nodes && loadedState.edges) {
          // Filter out default edges to ensure connections are manual
          const filteredEdges = loadedState.edges.filter(edge =>
            !(edge.source === 'customInput-1' && edge.target === 'llm-1') &&
            !(edge.source === 'llm-1' && edge.target === 'customOutput-1')
          );

          // Validate positions in loaded nodes to prevent NaN values
          const validatedNodes = loadedState.nodes.map(node => {
            const validatedNode = {
              ...node,
              selected: false,
              position: validatePosition(node.position),
              data: {
                ...node.data,
                isDisplayOpen: false, // Force all displays closed on load to prevent auto-opening
                selected: false,
              }
            };
            // Keep the existing outputName as-is - do not overwrite with generated name
            // This allows users to set custom output names that persist across sessions
            // Clear old output for LLM nodes to prevent auto-opening displays on page refresh
            if (node.type === 'llm') {
              validatedNode.data = {
                ...validatedNode.data,
                output: '',
                isDisplayOpen: false, // Keep LLM display closed by default
              };
            }
            return validatedNode;
          });
          // Prevent all nodes from auto-attaching on page refresh - start with empty canvas
          const filteredNodes = [];
          this.pipeline = new Pipeline(filteredNodes, filteredEdges);
          // Invalidate caches to ensure fresh data
          this.lastNodesHash = null;
          this.lastEdgesHash = null;
          this.lastSelectedNodesHash = null;
          this.lastSelectedEdgesHash = null;
        }
      } catch (parseError) {
        console.error('Error parsing saved state:', parseError);
        this.initializeDefaults();
      }
    } else {
      this.initializeDefaults();
    }
  }

  // Recursive default initialization - start with empty canvas
  initializeDefaults() {
    const defaultNodes = [];
    const defaultEdges = [];

    this.pipeline = new Pipeline(defaultNodes, defaultEdges);
  }

  // Utility methods
  getNodeById(nodeId) { return this.pipeline.getNodeById(nodeId); }
  getNodesByType(type) { return this.pipeline.getNodesByType(type); }
  getPipeline() { return this.pipeline; }

  // Tree graph integration
  registerWithTree() {
    applicationTree.registerComponent('state', 'stateManager', 'manager', {
      description: 'Centralized state management',
      dependencies: ['Pipeline', 'TreeGraph']
    });
  }

  getComponentTree() { return applicationTree; }
  getComponentPath(componentId) { return applicationTree.getComponentPath(componentId); }
  getComponentsByCategory(category) { return applicationTree.getComponentsByCategory(category); }

  // Recursive reset
  reset() {
    this.initializeDefaults();
    Object.assign(this.state, {
      backgroundVisible: true,
      hasExploded: false,
      selectedNodes: [],
      selectedEdges: [],
      nodeIDs: {},
      edgeIDs: {}
    });
  }

  // Sync from store after execution to ensure pipeline nodeMap is updated with synced data
  syncFromStore(storeNodes) {
    this.pipeline.nodes = storeNodes.map(node => NodeFactory.createNode(node.type, node.id, node.position, node.data));
    this.pipeline.buildNodeMap();
  }

  // Sync execution results back to stateManager nodes
  syncExecutionResults(executionResults) {
    executionResults.forEach(result => {
      const node = this.pipeline.nodeMap.get(result.nodeId);
      if (node && result.output !== undefined) {
        // For output nodes, set outputValue field; for other nodes, set output field
        if (node.type === 'customOutput' || node.type === 'output') {
          node.updateField('outputValue', result.output);
          // Set the sourceType if provided from pipeline execution
          if (result.sourceType) {
            node.updateField('sourceType', result.sourceType);
          }
        } else {
          node.updateField('output', result.output);
        }
        if (result.outputValue !== undefined) {
          node.updateField('outputValue', result.outputValue);
        }
        node.updateField('_timestamp', Date.now());
      }
    });
  }
}

// Singleton instance
export const stateManager = new StateManager();
