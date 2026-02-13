
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { StateManager } from './core/StateManager.js';
import { MarkerType } from 'reactflow';

// Create the context
const StoreContext = createContext();

// Lazy initialize state manager to prevent initialization loops
let stateManagerInstance = null;
function getStateManager() {
  if (!stateManagerInstance) {
    stateManagerInstance = new StateManager();
  }
  return stateManagerInstance;
}

// ReactFlow instance for coordinate conversion
let reactFlowInstance = null;
export const setReactFlowInstance = (instance) => {
  reactFlowInstance = instance;
};

// Flag to prevent initialization loops
let isInitializing = false;

// Custom hook to use the store
export const useStore = (selector) => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  if (typeof selector === 'function') {
    try {
      return selector(context);
    } catch (e) {
      // Fallback: return whole context on selector error
      return context;
    }
  }
  return context;
};

// Provider component
export const StoreProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [backgroundVisible, setBackgroundVisible] = useState(true);
  const [hasExploded, setHasExploded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isInteractive, setIsInteractive] = useState(true);
  const [zoomOnScroll, setZoomOnScroll] = useState(true);
  const [zoomOnPinch, setZoomOnPinch] = useState(true);
  const [zoomOnDoubleClick, setZoomOnDoubleClick] = useState(true);
  const [persistenceTimeout, setPersistenceTimeout] = useState(null);
  const [onSelectionChangeCallback, setOnSelectionChangeCallback] = useState(null);
  const [isUpdatingSelection, setIsUpdatingSelection] = useState(false);
  const [skipArrangement, setSkipArrangement] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadTimestamp, setLoadTimestamp] = useState(null);
  const [canvasBounds, setCanvasBounds] = useState(null);
  
  // Use ref to track if state has been loaded - avoids stale closure issues
  const isLoadedRef = useRef(false);
  
  // Use ref to track current nodes - avoids stale closure issues in callbacks
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  
  // Function to update canvas bounds from the ReactFlow wrapper
  const updateCanvasBounds = useCallback((bounds) => {
    if (bounds) {
      setCanvasBounds({
        width: bounds.width,
        height: bounds.height,
        left: bounds.left,
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom
      });
      console.log('Canvas bounds updated:', bounds);
    }
  }, []);
  
  const persistState = useCallback(async () => {
    try {
      // Clean nodes to ensure no selection state is persisted
      const cleanedNodes = nodes.map(node => ({ ...node, selected: false, data: { ...node.data, selected: false } }));
      const currentState = { theme, backgroundVisible, hasExploded, nodes: cleanedNodes, edges, selectedNodes: [], selectedEdges: [] };
      console.log('Persisting state:', { nodeCount: nodes.length, edgeCount: edges.length });
      localStorage.setItem('pipelineState', JSON.stringify(currentState));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [theme, backgroundVisible, hasExploded, nodes, edges]);

  const schedulePersist = useCallback(() => {
    if (persistenceTimeout) {
      clearTimeout(persistenceTimeout);
    }
    const newTimeout = setTimeout(() => {
      persistState();
      setPersistenceTimeout(null);
    }, 500);
    setPersistenceTimeout(newTimeout);
  }, [persistenceTimeout, persistState]);

  const loadState = useCallback(() => {
    // Prevent recursive loadState calls using ref
    if (isLoadedRef.current || isInitializing) return;
    isInitializing = true;
    isLoadedRef.current = true;

    try {
      const savedState = localStorage.getItem('pipelineState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log('Loading persisted state from localStorage:', parsedState);
        // Prevent all nodes from auto-attaching on page refresh - start with empty canvas
        const filteredNodes = [];
        setNodes(filteredNodes);
        setEdges(parsedState.edges || []);
        // Clear selected nodes and edges to prevent auto-opening displays on refresh
        setSelectedNodes([]);
        setSelectedEdges([]);
        setTheme(parsedState.theme || 'dark');
        setBackgroundVisible(parsedState.backgroundVisible !== undefined ? parsedState.backgroundVisible : true);
        document.documentElement.setAttribute('data-theme', parsedState.theme || 'dark');
        setHasExploded(parsedState.hasExploded || false);
        setIsLoaded(true);
        console.log('State restored from localStorage');
        // Clear any potential selection after loading
        setTimeout(() => {
          if (onSelectionChangeCallback) {
            onSelectionChangeCallback({ nodes: [], edges: [] });
          }
        }, 100);
      } else {
        // Start with empty canvas - no default nodes
        setNodes([]);
        setEdges([]);
        setSelectedNodes([]);
        setSelectedEdges([]);
        setBackgroundVisible(true);
        setHasExploded(false);
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      // Fallback: start with empty state
      setNodes([]);
      setEdges([]);
      setSelectedNodes([]);
      setSelectedEdges([]);
      setBackgroundVisible(true);
      setHasExploded(false);
      setTheme('dark');
      setIsLoaded(true);
    }

    isInitializing = false;
  }, []);

  // Load state on mount - only run once
  useEffect(() => {
    const timestamp = Date.now();
    setLoadTimestamp(timestamp);
    loadState();
    // Allow arrangement and selection changes after initial load
    setTimeout(() => {
      setSkipArrangement(false);
      setIsInitialLoad(false);
    }, 1000);
  }, []);

  const executePipeline = useCallback(async (...args) => {
    console.log('Store executePipeline called with args:', args);
    const result = await getStateManager().executePipeline(...args);
    console.log('Store executePipeline result:', result);

    // Sync updated node data from stateManager after execution
    const updatedNodesFromStateManager = getStateManager().getNodes();

    console.log('Store syncing nodes from stateManager after execution');
    console.log('LLM node output from stateManager:', updatedNodesFromStateManager.find(n => n.id === 'llm-1')?.data?.output);

    // Sync execution results back to stateManager first
    getStateManager().syncExecutionResults(result.outputs);

    // Get updated nodes from stateManager after syncing execution results
    const finalUpdatedNodes = getStateManager().getNodes();

    // Create a map of current node display states to preserve them
    const currentDisplayStates = new Map();
    nodesRef.current.forEach(node => {
      if (node.id && node.data && node.data.hasOwnProperty('isDisplayOpen')) {
        currentDisplayStates.set(node.id, node.data.isDisplayOpen);
      }
    });

    // Use updated nodes from stateManager as base, preserve store-specific fields
    const syncedNodes = finalUpdatedNodes.map(updatedNode => {
      // Preserve existing isDisplayOpen state from current nodes in store
      // Default to false if not found, except for LLM nodes which should show output
      const preservedIsDisplayOpen = currentDisplayStates.has(updatedNode.id) 
        ? currentDisplayStates.get(updatedNode.id)
        : (updatedNode.type === 'llm');

      // Create completely new node object to force React re-render
      const newNode = {
        id: updatedNode.id,
        type: updatedNode.type,
        selectable: true,
        data: {
          ...updatedNode.data,
          selected: false,
          isDisplayOpen: preservedIsDisplayOpen,
          isVisible: true,
        },
        // Ensure position is valid to prevent SVG path NaN errors
        position: {
          x: typeof updatedNode.position?.x === 'number' && !isNaN(updatedNode.position.x) && isFinite(updatedNode.position.x) ? updatedNode.position.x : 0,
          y: typeof updatedNode.position?.y === 'number' && !isNaN(updatedNode.position.y) && isFinite(updatedNode.position.y) ? updatedNode.position.y : 0,
        },
      };
      return newNode;
    });

    console.log('Setting nodes in store with syncedNodes:', syncedNodes.map(n => ({ id: n.id, output: n.data?.output?.substring(0, 50) + '...' })));
    setNodes(syncedNodes);
    console.log('Store nodes after set:', syncedNodes.map(n => ({ id: n.id, output: n.data?.output?.substring(0, 50) + '...' })));
    console.log('LLM node output after set:', syncedNodes.find(n => n.id === 'llm-1')?.data?.output);
    console.log('LLM node output from syncedNodes:', syncedNodes.find(n => n.id === 'llm-1')?.data?.output);

    // Removed auto-selection of output node after execution to prevent automatic display opening

    // Sync stateManager's pipeline nodeMap with the updated nodes
    getStateManager().syncFromStore(syncedNodes);

    if (!result || !result.results) {
      return [];
    }

    return result.outputs;
  }, []);

  const setHasExplodedState = useCallback(async (value) => {
    getStateManager().setHasExploded(value);
    setHasExploded(getStateManager().getHasExploded());
  }, []);

  const toggleBackground = useCallback(async () => {
    getStateManager().toggleBackground();
    setBackgroundVisible(getStateManager().getBackgroundVisible());
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    console.log('Toggling theme from', currentTheme, 'to', newTheme);

    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    console.log('Theme after set:', newTheme);

    // Persist theme change
    try {
      const currentState = { theme: newTheme, backgroundVisible, hasExploded, nodes, edges, selectedNodes, selectedEdges };
      localStorage.setItem('pipelineState', JSON.stringify(currentState));
      console.log('Theme persisted to localStorage:', newTheme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme, backgroundVisible, hasExploded, nodes, edges, selectedNodes, selectedEdges]);

  const toggleInteractivity = useCallback(async () => {
    setIsInteractive(!isInteractive);
  }, [isInteractive]);

  const setIsInteractiveState = useCallback((value) => {
    setIsInteractive(value);
  }, []);

  const toggleZoomOnScroll = useCallback(() => {
    setZoomOnScroll(prev => !prev);
  }, []);

  const toggleZoomOnPinch = useCallback(() => {
    setZoomOnPinch(prev => !prev);
  }, []);

  const toggleZoomOnDoubleClick = useCallback(() => {
    setZoomOnDoubleClick(prev => !prev);
  }, []);

  

  

  const onNodesChange = useCallback(async (changes) => {
    const currentNodes = nodes;
    getStateManager().onNodesChange(changes);
    const newNodes = getStateManager().getNodes();
    if (JSON.stringify(currentNodes) !== JSON.stringify(newNodes)) {
      setNodes(newNodes);
      schedulePersist();
    }
  }, [nodes, schedulePersist]);

  const onEdgesChange = useCallback(async (changes) => {
    const currentEdges = edges;
    getStateManager().onEdgesChange(changes);
    const newEdges = getStateManager().getEdges();
    if (JSON.stringify(currentEdges) !== JSON.stringify(newEdges)) {
      setEdges(newEdges);
      schedulePersist();
    }
  }, [edges, schedulePersist]);

  const onConnect = useCallback(async (connection) => {
    // Generate a unique edge ID if not provided
    const edgeId = connection.id || getStateManager().getEdgeID();
    const newEdge = {
      ...connection,
      id: edgeId,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
    };
    console.log('onConnect: Adding edge', newEdge);
    getStateManager().addEdge(newEdge);
    const updatedEdges = getStateManager().getEdges();
    console.log('onConnect: Updated edges count:', updatedEdges.length);
    setEdges(updatedEdges);
    schedulePersist();
  }, [schedulePersist]);

  const addNode = useCallback(async (nodeData) => {
    getStateManager().addNode(nodeData);
    setNodes(getStateManager().getNodes());
    schedulePersist();
  }, [schedulePersist]);

  const getNodeID = useCallback(async (type) => {
    return getStateManager().getNodeID(type);
  }, []);

  const arrangeDisplays = useCallback((currentNodes) => {
    if (skipArrangement) return currentNodes;
    const openNodes = currentNodes.filter(n => n.data.isDisplayOpen);
    if (openNodes.length === 0) return currentNodes;

    // Configuration for 3x3 grid style with adjustable sizes
    const gap = 20; // px gap between displays
    const topOffset = 60; // leave space for header/toolbars
    const minDisplayWidth = 250; // minimum width per display
    const minDisplayHeight = 200; // minimum height per display
    const maxDisplayWidth = 500; // maximum width per display
    const maxDisplayHeight = 450; // maximum height per display
    
    // Use actual canvas bounds if available, otherwise fall back to window dimensions
    // This provides more precise dynamic sizing based on the actual ReactFlow container
    const canvasWidth = canvasBounds ? canvasBounds.width : Math.max(600, window.innerWidth - 10);
    const canvasHeight = canvasBounds ? canvasBounds.height : Math.max(400, window.innerHeight - 130);

    const numDisplays = openNodes.length;

    // Strict 3x3 grid style: exactly 3 columns max, up to 3 rows
    const maxCols = 3;
    const maxRows = 3;
    const cols = Math.min(numDisplays, maxCols);
    const rows = Math.min(Math.ceil(numDisplays / cols), maxRows);

    // Compute display sizes so that cols * width + gaps fit within canvasWidth
    const totalGapWidth = (cols + 1) * gap;
    let displayWidth = Math.floor((canvasWidth - totalGapWidth) / cols);
    
    // Apply min/max constraints for width
    displayWidth = Math.max(minDisplayWidth, Math.min(maxDisplayWidth, displayWidth));

    // Compute height with same strategy, allow reasonable min/max
    const totalGapHeight = (rows + 1) * gap + topOffset;
    let displayHeight = Math.floor((canvasHeight - totalGapHeight) / rows);
    
    // Apply min/max constraints for height
    displayHeight = Math.max(minDisplayHeight, Math.min(maxDisplayHeight, displayHeight));

    // If we have fewer nodes than grid cells, adjust to center them nicely
    const effectiveCols = numDisplays < cols ? numDisplays : cols;

    // Get viewport information for coordinate conversion
    let viewportRect = { left: 0, top: 0 };
    let scale = 1, tx = 0, ty = 0;
    const viewportEl = (typeof document !== 'undefined') ? document.querySelector('.react-flow__viewport') : null;
    if (viewportEl) {
      const r = viewportEl.getBoundingClientRect();
      viewportRect.left = r.left || 0;
      viewportRect.top = r.top || 0;

      if (reactFlowInstance) {
        const viewport = reactFlowInstance.getViewport();
        scale = viewport.zoom;
        tx = viewport.x;
        ty = viewport.y;
      } else {
        // Fallback: read viewport transform manually
        try {
          const st = window.getComputedStyle(viewportEl).transform || '';
          if (st && st !== 'none') {
            if (st.startsWith('matrix(')) {
              const vals = st.slice(7, -1).split(',').map(v => parseFloat(v));
              const a = vals[0] || 1;
              const b = vals[1] || 0;
              tx = vals[4] || 0;
              ty = vals[5] || 0;
              scale = Math.sqrt((a * a) + (b * b));
            } else if (st.startsWith('scale(')) {
              scale = parseFloat(st.match(/scale\(([^)]+)\)/)[1]) || 1;
            } else if (st.includes('translate') && st.includes('scale')) {
              const translateMatch = st.match(/translate\(([^,]+),\s*([^)]+)\)/);
              const scaleMatch = st.match(/scale\(([^)]+)\)/);
              if (translateMatch) {
                tx = parseFloat(translateMatch[1]) || 0;
                ty = parseFloat(translateMatch[2]) || 0;
              }
              if (scaleMatch) {
                scale = parseFloat(scaleMatch[1]) || 1;
              }
            } else if (st.startsWith('translate(')) {
              const translateMatch = st.match(/translate\(([^,]+),\s*([^)]+)\)/);
              if (translateMatch) {
                tx = parseFloat(translateMatch[1]) || 0;
                ty = parseFloat(translateMatch[2]) || 0;
              }
            }
          }
        } catch (e) {
          // ignore transform parsing errors
        }
      }
    }

    // Compute display size to store on node objects (compensate for viewport scale)
    const displayWidthNode = Math.max(80, Math.round(displayWidth / (scale || 1)));
    const displayHeightNode = Math.max(80, Math.round(displayHeight / (scale || 1)));

    const allChanges = currentNodes.map(node => {
      const isOpen = node.data.isDisplayOpen;
      if (isOpen) {
        const index = openNodes.findIndex(n => n.id === node.id);
        const col = index % cols;
        const row = Math.floor(index / cols);

        // Calculate flow coordinates directly for a grid layout
        // Start the grid at (0,0) in flow coordinates for simplicity
        const gapFlow = gap / (scale || 1);
        const topOffsetFlow = topOffset / (scale || 1);
        const displayWidthFlow = displayWidth / (scale || 1);
        const displayHeightFlow = displayHeight / (scale || 1);

        const flowX = col * (displayWidthFlow + gapFlow) + gapFlow;
        const flowY = row * (displayHeightFlow + gapFlow) + gapFlow + topOffsetFlow;

        console.log(`Arranging display for node ${node.id} at col ${col}, row ${row}, flow=(${Math.round(flowX)},${Math.round(flowY)}), width=${displayWidth}, height=${displayHeight}, scale=${scale}`);
        return {
          type: 'position',
          id: node.id,
          position: { x: flowX, y: flowY },
          data: { ...node.data, displayWidth: displayWidthNode, displayHeight: displayHeightNode, _timestamp: Date.now() }
        };
      } else {
        return {
          type: 'data',
          id: node.id,
          data: { ...node.data, displayWidth: undefined, displayHeight: undefined, style: undefined, _timestamp: Date.now() }
        };
      }
    });

    try {
      getStateManager().onNodesChange(allChanges);
      const updatedNodes = getStateManager().getNodes();
      // Commit to React state and schedule persistence
      setNodes(updatedNodes);
      schedulePersist();

      // Fit the viewport to show all arranged displays after a short delay to ensure nodes are updated
      if (reactFlowInstance && openNodes.length > 0) {
        setTimeout(() => {
          try {
            reactFlowInstance.fitView({
              padding: 0.1,
              includeHiddenNodes: false,
              nodes: openNodes.map(n => ({ id: n.id }))
            });
          } catch (e) {
            console.warn('arrangeDisplays: fitView failed', e);
          }
        }, 100);
      }

      // return early with updated result
      return updatedNodes;
    } catch (err) {
      console.warn('arrangeDisplays: failed to apply changes', err);
    }

    // Emit a concise summary for debugging (console + on-page overlay)
    try {
      const summary = {
        openNodeIds: openNodes.map(n => n.id),
        cols, rows, displayWidth, displayHeight, gap, topOffset,
        timestamp: Date.now()
      };
      // browser console history
      if (typeof window !== 'undefined') {
        window.__arrangeLogs = window.__arrangeLogs || [];
        window.__arrangeLogs.push(summary);

        // Ensure a small overlay element exists to display the latest summary
        try {
          let el = document.getElementById('arrange-debug-overlay');
          if (!el) {
            el = document.createElement('div');
            el.id = 'arrange-debug-overlay';
            el.style.position = 'fixed';
            el.style.right = '12px';
            el.style.bottom = '12px';
            el.style.zIndex = 99999;
            el.style.maxWidth = '420px';
            el.style.fontSize = '12px';
            el.style.lineHeight = '1.2';
            el.style.background = 'rgba(0,0,0,0.6)';
            el.style.color = '#fff';
            el.style.padding = '8px';
            el.style.borderRadius = '8px';
            el.style.pointerEvents = 'none';
            document.body.appendChild(el);
          }
          el.textContent = `Arrange: ${summary.openNodeIds.length} open • ${summary.cols}x${summary.rows} • ${summary.displayWidth}x${summary.displayHeight} @ ${new Date(summary.timestamp).toLocaleTimeString()}`;
        } catch (domErr) {
          // ignore DOM update failures
        }
      }
      console.log('arrangeDisplays summary', summary);
    } catch (summaryErr) {
      console.warn('arrangeDisplays: failed to emit summary', summaryErr);
    }

    // Fallback: if StateManager update failed, return currentNodes unchanged
    return currentNodes;
  }, [onNodesChange, reactFlowInstance, canvasBounds]);

  const onSelectionChange = useCallback(async (elements) => {
    if (isUpdatingSelection || isInitialLoad) return; // Prevent recursive calls and skip during initial load

    setIsUpdatingSelection(true);

    try {
      try {
        const nodeIds = elements?.nodes ? elements.nodes.map(n => n.id) : [];
        const edgeIds = elements?.edges ? elements.edges.map(e => e.id) : [];
        console.log('onSelectionChange called with nodes:', nodeIds, 'edges:', edgeIds);
      } catch (e) {
        console.log('onSelectionChange called', elements);
      }
      if (typeof window !== 'undefined') {
        window.__selectionLogs = window.__selectionLogs || [];
        window.__selectionLogs.push({ elements, timestamp: Date.now() });
        if (window.__selectionLogs.length > 50) window.__selectionLogs.shift();
      }
      const newSelectedNodes = elements.nodes ? elements.nodes.map(node => node.id) : [];
      const newSelectedEdges = elements.edges ? elements.edges.map(edge => edge.id) : [];

      // Only update if selection has actually changed
      if (JSON.stringify(selectedNodes) !== JSON.stringify(newSelectedNodes) ||
          JSON.stringify(selectedEdges) !== JSON.stringify(newSelectedEdges)) {
        getStateManager().onSelectionChange(elements);
        const updatedSelectedNodes = getStateManager().getSelectedNodes();
        const updatedSelectedEdges = getStateManager().getSelectedEdges();
        let newNodes = nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            selected: updatedSelectedNodes.includes(node.id)
          }
        }));

        // Keep displays closed for all nodes - no auto-opening on selection
        newNodes = newNodes.map(node => ({ ...node, data: { ...node.data, isDisplayOpen: false } }));

        // Arrange all open displays to prevent stacking
        const arranged = arrangeDisplays(newNodes);
        console.log('onSelectionChange arranged nodes for selection:', updatedSelectedNodes, '->', arranged.filter(n => n.data.isDisplayOpen).map(n => ({ id: n.id, position: n.position, displayWidth: n.data.displayWidth, displayHeight: n.data.displayHeight })) );
        if (typeof window !== 'undefined') {
          window.__arrangeResult = window.__arrangeResult || [];
          window.__arrangeResult.push({ selected: newSelectedNodes, arranged: arranged.map(n => ({ id: n.id, pos: n.position })), timestamp: Date.now() });
          if (window.__arrangeResult.length > 20) window.__arrangeResult.shift();
        }
        newNodes = arranged;

        setNodes(newNodes);
        setSelectedNodes(updatedSelectedNodes);
        setSelectedEdges(updatedSelectedEdges);
      }
    } finally {
      setIsUpdatingSelection(false);
    }
  }, [isUpdatingSelection, selectedNodes, selectedEdges, nodes, arrangeDisplays]);

  const selectNode = useCallback(async (nodeId) => {
    const currentSelected = getStateManager().getSelectedNodes();
    if (currentSelected.includes(nodeId)) {
      return; // Already selected, prevent double selection
    }
    console.log(`Selecting node ${nodeId}`);
    getStateManager().selectNode(nodeId);
    let updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, selected: true, isDisplayOpen: node.type === 'customInput' ? false : true } } : { ...node, data: { ...node.data, isDisplayOpen: false } }
    );
    console.log(`Updated nodes:`, updatedNodes.find(n => n.id === nodeId)?.data);

    // Keep displays closed - no arrangement needed

    setNodes(updatedNodes);
    setSelectedNodes(getStateManager().getSelectedNodes());
    setSelectedEdges(getStateManager().getSelectedEdges());
    // Sync with ReactFlow's selectedNodesIds
    if (onSelectionChangeCallback) {
      onSelectionChangeCallback({ nodes: nodeId ? [{ id: nodeId }] : [], edges: [] });
    }
  }, [nodes, onSelectionChangeCallback, arrangeDisplays]);

  const deselectAllNodes = useCallback(async () => {
    getStateManager().deselectAll();
    // Close all node displays and clear selection
    const updatedNodes = nodes.map(node => ({
      ...node,
      selected: false,
      data: {
        ...node.data,
        selected: false,
        isDisplayOpen: false
      }
    }));
    setNodes(updatedNodes);
    setSelectedNodes(getStateManager().getSelectedNodes());
    setSelectedEdges(getStateManager().getSelectedEdges());
    schedulePersist();
  }, [nodes, schedulePersist]);




  const updateNodeField = useCallback(async (nodeId, fieldName, fieldValue) => {
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;
    const currentFieldValue = nodes[nodeIndex].data[fieldName];
    if (currentFieldValue === fieldValue) return; // No change, prevent infinite loop

    getStateManager().updateNodeField(nodeId, fieldName, fieldValue);
    let updatedNodes = nodes.map(node =>
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

    if (fieldName === 'isDisplayOpen') {
      if (fieldValue) {
        // Opening display
        const node = updatedNodes.find(n => n.id === nodeId);
        if (!node.data.originalPosition) {
          updatedNodes = updatedNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, originalPosition: { ...nodes[nodeIndex].position } } } : n);
        }
      } else {
        // Closing display
        const node = updatedNodes.find(n => n.id === nodeId);
        if (node.data.originalPosition) {
          updatedNodes = updatedNodes.map(n => n.id === nodeId ? { ...n, position: { ...node.data.originalPosition }, data: { ...node.data, originalPosition: undefined } } : n);
        }
      }
      // Arrange all open displays
      updatedNodes = arrangeDisplays(updatedNodes);
    }

    setNodes(updatedNodes);
  }, [nodes, arrangeDisplays]);

  const deleteNode = useCallback(async (nodeId) => {
    const changes = [{ type: 'remove', id: nodeId }];
    onNodesChange(changes);
  }, [onNodesChange]);

  

  const setOnSelectionChangeCallbackFunc = useCallback((callback) => {
    setOnSelectionChangeCallback(callback);
  }, []);

  const value = {
    nodes,
    edges,
    selectedNodes,
    selectedEdges,
    backgroundVisible,
    hasExploded,
    isLoaded,
    theme,
    isInteractive,
    zoomOnScroll,
    zoomOnPinch,
    zoomOnDoubleClick,
    onSelectionChangeCallback,
    isUpdatingSelection,
    loadState,
    executePipeline,
    setHasExploded: setHasExplodedState,
    toggleBackground,
    toggleTheme,
    toggleInteractivity,
    setIsInteractiveState,
    toggleZoomOnScroll,
    toggleZoomOnPinch,
    toggleZoomOnDoubleClick,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    getNodeID,
    onSelectionChange,
    selectNode,
    deselectAllNodes,
    updateNodeField,
    deleteNode,
    arrangeAllDisplays: () => {
      try {
        const arranged = arrangeDisplays(nodes);
        setNodes(arranged);
        console.log('arrangeAllDisplays: arranged', arranged.filter(n => n.data.isDisplayOpen).map(n => ({ id: n.id, pos: n.position })));
      } catch (e) {
        console.error('arrangeAllDisplays failed', e);
      }
    },
    openSelectedDisplays: () => {
      try {
        // Open displays for nodes that are currently selected in the store
        const opened = nodes.map(n => (selectedNodes.includes(n.id)) ? { ...n, data: { ...n.data, isDisplayOpen: true } } : n);
        // Arrange after opening so positions are updated
        const arranged = arrangeDisplays(opened);
        setNodes(arranged);
        console.log('openSelectedDisplays: opened for', arranged.filter(n => n.data.isDisplayOpen).map(n => n.id));
      } catch (e) {
        console.error('openSelectedDisplays failed', e);
      }
    },
persistState,
    schedulePersist,
    setOnSelectionChangeCallback: setOnSelectionChangeCallbackFunc,
    updateCanvasBounds,
  };

  // Expose store to window for testing
  if (typeof window !== 'undefined') {
    window.store = value;
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
