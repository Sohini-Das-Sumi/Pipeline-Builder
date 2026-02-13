import { create } from 'zustand';
import { stateManager } from './core/StateManager.js';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  backgroundVisible: true,
  hasExploded: false,
  isLoaded: false,
  theme: 'dark', // 'dark' or 'light'
  isInteractive: true, // Controls whether nodes are interactive (draggable, selectable, connectable)
  persistenceTimeout: null,
  onSelectionChangeCallback: null,
  isUpdatingSelection: false,

  loadState: () => {
    if (get().isLoaded) return;
    try {
      const savedState = localStorage.getItem('pipelineState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.theme) {
          console.log('Loading theme from localStorage:', parsedState.theme);
          set({ theme: parsedState.theme });
        }
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }

    // Start with empty canvas - no default nodes
    const nodes = [];

    set({
      nodes,
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      backgroundVisible: true,
      hasExploded: false,
      isLoaded: true,
    });
  },

  executePipeline: async (...args) => {
    console.log('Store executePipeline called with args:', args);
    const result = await stateManager.executePipeline(...args);
    console.log('Store executePipeline result:', result);

    // Sync updated node data from stateManager after execution
    // This ensures data changes made during node.execute() (like LLMNode updating output) are reflected
    const updatedNodesFromStateManager = stateManager.getNodes();

    console.log('Store syncing nodes from stateManager after execution');
    console.log('LLM node output from stateManager:', updatedNodesFromStateManager.find(n => n.id === 'llm-1')?.data?.output);

    // Sync execution results back to stateManager first
    stateManager.syncExecutionResults(result.outputs);

    // Get updated nodes from stateManager after syncing execution results
    const finalUpdatedNodes = stateManager.getNodes();

    // Use updated nodes from stateManager as base, preserve store-specific fields
    const syncedNodes = finalUpdatedNodes.map(updatedNode => {
      // Create completely new node object to force React re-render
      const newNode = {
        id: updatedNode.id,
        type: updatedNode.type,
        selectable: true,
        data: {
          ...updatedNode.data,
          selected: false,
          isDisplayOpen: updatedNode.type === 'llm' ? true : false, // Keep LLM display open to show output
          isVisible: true,
      _timestamp: Date.now(), // Always update timestamp to force React re-renders
          _forceUpdate: Math.random(), // Force React re-render by changing object reference
        },
        // Ensure position is valid to prevent SVG path NaN errors
        position: {
          x: typeof updatedNode.position?.x === 'number' && !isNaN(updatedNode.position.x) && isFinite(updatedNode.position.x) ? updatedNode.position.x : 0,
          y: typeof updatedNode.position?.y === 'number' && !isNaN(updatedNode.position.y) && isFinite(updatedNode.position.y) ? updatedNode.position.y : 0,
        },
        _nodeForceUpdate: Math.random(), // Force node object reference change
      };
      return newNode;
    });

    console.log('Setting nodes in store with syncedNodes:', syncedNodes.map(n => ({ id: n.id, output: n.data?.output?.substring(0, 50) + '...' })));
    set({ nodes: syncedNodes });
    console.log('Store nodes after set:', get().nodes.map(n => ({ id: n.id, output: n.data?.output?.substring(0, 50) + '...' })));
    console.log('LLM node output after set:', syncedNodes.find(n => n.id === 'llm-1')?.data?.output);
    console.log('LLM node output from get().nodes:', get().nodes.find(n => n.id === 'llm-1')?.data?.output);

    // Removed auto-selection of output node after execution to prevent automatic display opening

    // Sync stateManager's pipeline nodeMap with the updated nodes
    stateManager.syncFromStore(syncedNodes);

    if (!result || !result.results) {
      return [];
    }

    return result.outputs;
  },

  setHasExploded: async (value) => {
    stateManager.setHasExploded(value);
    set({ hasExploded: stateManager.getHasExploded() });
  },

  toggleBackground: async () => {
    stateManager.toggleBackground();
    set({ backgroundVisible: stateManager.getBackgroundVisible() });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    console.log('Toggling theme from', currentTheme, 'to', newTheme);

    set({ theme: newTheme });

    console.log('Theme after set:', get().theme);

    // Persist theme change
    try {
      const currentState = get();
      const stateToSave = {
        theme: currentState.theme,
        backgroundVisible: currentState.backgroundVisible,
        hasExploded: currentState.hasExploded,
        nodes: currentState.nodes,
        edges: currentState.edges,
        selectedNodes: currentState.selectedNodes,
        selectedEdges: currentState.selectedEdges,
      };
      localStorage.setItem('pipelineState', JSON.stringify(stateToSave));
      console.log('Theme persisted to localStorage:', currentState.theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  },

  toggleInteractivity: async () => {
    const newIsInteractive = !get().isInteractive;
    set({ isInteractive: newIsInteractive });
  },

  onNodesChange: async (changes) => {
    const currentNodes = get().nodes;
    stateManager.onNodesChange(changes);
    const newNodes = stateManager.getNodes();
    if (JSON.stringify(currentNodes) !== JSON.stringify(newNodes)) {
      set({ nodes: newNodes });
    }
  },

  onEdgesChange: async (changes) => {
    const currentEdges = get().edges;
    stateManager.onEdgesChange(changes);
    const newEdges = stateManager.getEdges();
    if (JSON.stringify(currentEdges) !== JSON.stringify(newEdges)) {
      set({ edges: newEdges });
    }
  },

  onConnect: async (connection) => {
    stateManager.onConnect(connection);
    set({ edges: stateManager.getEdges() });
    // get().persistState(); // Temporarily disabled to isolate infinite loop issue
  },

  addNode: async (nodeData) => {
    stateManager.addNode(nodeData);
    set({ nodes: stateManager.getNodes() });
    // get().persistState(); // Temporarily disabled to isolate infinite loop issue
  },

  getNodeID: async (type) => {
    return stateManager.getNodeID(type);
  },

  onSelectionChange: async (elements) => {
    if (get().isUpdatingSelection) return; // Prevent recursive calls

    set({ isUpdatingSelection: true });

    try {
      const currentSelectedNodes = get().selectedNodes;
      const currentSelectedEdges = get().selectedEdges;
      const newSelectedNodes = elements.nodes ? elements.nodes.map(node => node.id) : [];
      const newSelectedEdges = elements.edges ? elements.edges.map(edge => edge.id) : [];

      // Only update if selection has actually changed
      if (JSON.stringify(currentSelectedNodes) !== JSON.stringify(newSelectedNodes) ||
          JSON.stringify(currentSelectedEdges) !== JSON.stringify(newSelectedEdges)) {
        stateManager.onSelectionChange(elements);
        const updatedSelectedNodes = stateManager.getSelectedNodes();
        const updatedSelectedEdges = stateManager.getSelectedEdges();
        const currentNodes = get().nodes;
        const newNodes = currentNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            selected: updatedSelectedNodes.includes(node.id)
          }
        }));
        set({
          nodes: newNodes,
          selectedNodes: updatedSelectedNodes,
          selectedEdges: updatedSelectedEdges
        });
      }
    } finally {
      set({ isUpdatingSelection: false });
    }
  },

  selectNode: async (nodeId) => {
    const currentSelected = stateManager.getSelectedNodes();
    if (currentSelected.includes(nodeId)) {
      return; // Already selected, prevent double selection
    }
    console.log(`Selecting node ${nodeId}`);
    stateManager.selectNode(nodeId);
    const updatedNodes = get().nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, selected: true, isDisplayOpen: node.data?.isDisplayOpen || false } } : node
    );
    console.log(`Updated nodes:`, updatedNodes.find(n => n.id === nodeId)?.data);
    set({
      nodes: updatedNodes,
      selectedNodes: stateManager.getSelectedNodes(),
      selectedEdges: stateManager.getSelectedEdges()
    });
    // Sync with ReactFlow's selectedNodesIds
    if (get().onSelectionChangeCallback) {
      get().onSelectionChangeCallback({ nodes: nodeId ? [{ id: nodeId }] : [], edges: [] });
    }
  },

  deselectAllNodes: async () => {
    stateManager.deselectAll();
    const updatedNodes = get().nodes.map(node => ({
      ...node,
      selected: false,
      data: {
        ...node.data,
        selected: false
      }
    }));
    set({
      nodes: updatedNodes,
      selectedNodes: stateManager.getSelectedNodes(),
      selectedEdges: stateManager.getSelectedEdges()
    });
    // get().persistState(); // Temporarily disabled to isolate infinite loop issue
  },

  updateNodeField: async (nodeId, fieldName, fieldValue) => {
    stateManager.updateNodeField(nodeId, fieldName, fieldValue);
    const updatedNodes = get().nodes.map(node =>
      node.id === nodeId ? {
        ...node,
        data: {
          ...node.data,
          [fieldName]: fieldValue,
          _lastUpdate: Date.now(), // Force object reference change
          _fieldUpdate: `${fieldName}-${Date.now()}` // Additional force update
        }
      } : node
    );
    set({ nodes: updatedNodes });
  },

  deleteNode: async (nodeId) => {
    const changes = [{ type: 'remove', id: nodeId }];
    await get().onNodesChange(changes);
  },

  persistState: async () => {
    try {
      const currentState = get();
      const stateToSave = {
        theme: currentState.theme,
        backgroundVisible: currentState.backgroundVisible,
        hasExploded: currentState.hasExploded,
        nodes: currentState.nodes,
        edges: currentState.edges,
        selectedNodes: currentState.selectedNodes,
        selectedEdges: currentState.selectedEdges,
      };
      console.log('Persisting state with theme:', currentState.theme);
      localStorage.setItem('pipelineState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  setOnSelectionChangeCallback: (callback) => {
    set({ onSelectionChangeCallback: callback });
  },


}));

// Temporarily disable persistence to isolate the infinite loop issue
// TODO: Re-enable persistence once the loop is fixed
