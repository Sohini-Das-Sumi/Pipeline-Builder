// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, ControlButton, MarkerType } from 'reactflow';
import { useStore, setReactFlowInstance as setStoreReactFlowInstance } from './StoreContext.jsx';
import { InputNode } from './nodes/inputNode.jsx';
import LLMNode from './nodes/llmNode.jsx';
import { OutputNode } from './nodes/outputNode.jsx';
import { TextNode } from './nodes/textNode.jsx';
import { NoteNode } from './nodes/noteNode.jsx';
import { FilterNode } from './nodes/filterNode.jsx';
import { DatabaseNode } from './nodes/databaseNode.jsx';
import { ImageNode } from './nodes/imageNode.jsx';
import { CustomNodeManager } from './nodes/CustomNodeManager.jsx';
import { TimerNode } from './nodes/timerNode.jsx';
import { getCustomNodeComponent, getCustomNodes, getCustomNodeDefaultData } from './nodes/CustomNodeLibrary.jsx';

import { PipelineToolbar } from './toolbar';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { account: 'paid-pro', hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  note: NoteNode,
  filter: FilterNode,
  database: DatabaseNode,
  image: ImageNode,
  timer: TimerNode,
  customNodeManager: CustomNodeManager,
  calculator: getCustomNodeComponent('calculator'),
};

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onSelectionChange,
      arrangeAllDisplays,
      theme,
      toggleTheme,
      isInteractive,
      toggleInteractivity,
      setIsInteractiveState,
      setEdges
    } = useStore();
    

    const handleNodeSelect = useCallback((nodeType, buttonRect) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      // Calculate position based on canvas center
      const canvasBounds = reactFlowWrapper.current.getBoundingClientRect();
      const centerX = canvasBounds.left + canvasBounds.width / 2;
      const centerY = canvasBounds.top + canvasBounds.height / 2;

      const position = reactFlowInstance.project({
        x: centerX,
        y: centerY,
      });

      const nodeID = getNodeID(nodeType);
      const newNode = {
        id: nodeID,
        type: nodeType,
        position,
        data: { id: nodeID, nodeType },
      };

      addNode(newNode);
    }, [reactFlowInstance, reactFlowWrapper, getNodeID, addNode]);

    // Load persisted state is handled by StoreContext.jsx - removed duplicate call here

    // Apply theme class to body
    useEffect(() => {
      document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    }, [theme]);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      
      // For custom nodes, merge default data from the custom node registry
      const customNodeComponent = getCustomNodeComponent(type);
      if (customNodeComponent) {
        const customNodes = getCustomNodes();
        const customNodeConfig = customNodes.find(node => node.id === type);
        if (customNodeConfig) {
          const defaultData = getCustomNodeDefaultData(customNodeConfig);
          nodeData = { ...nodeData, ...defaultData };
        }
      }
      
      return nodeData;
    }


    const onDrop = useCallback(
        (event) => {
          event.preventDefault();

          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }

            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };

            addNode(newNode);
          }
        },
        [reactFlowInstance, addNode, getNodeID]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Custom onConnect handler that uses reactFlowInstance.addEdges() directly
    // This ensures ReactFlow gets the edge properly
    const handleConnect = useCallback(async (connection) => {
        if (!reactFlowInstance) {
            console.warn('handleConnect: reactFlowInstance not available');
            return;
        }

        // Generate a unique edge ID
        const edgeId = connection.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newEdge = {
            ...connection,
            id: edgeId,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
        };

        console.log('handleConnect: Adding edge directly to ReactFlow', newEdge);
        
        // Add edge directly to ReactFlow's internal state
        reactFlowInstance.addEdges([newEdge]);
        
        // Also call the store's onConnect to keep StateManager in sync
        if (onConnect) {
            await onConnect(connection);
        }
        
        console.log('handleConnect: Edge added successfully');
    }, [reactFlowInstance, onConnect]);

    return (
        <>
        <div ref={reactFlowWrapper} style={{position: 'absolute', top: '5px', left: '5px', right: '5px', bottom: '125px'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={(instance) => {
                  setReactFlowInstance(instance);
                  setStoreReactFlowInstance(instance);
                  // Clear any ReactFlow selection state on initialization
                  instance.setNodes(nodes => nodes.map(n => ({ ...n, selected: false })));
                  instance.setEdges(edges => edges.map(e => ({ ...e, selected: false })));
                }}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}


                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                nodesDraggable={isInteractive}
                nodesConnectable={isInteractive}
                zoomOnScroll={isInteractive}
                panOnScroll={isInteractive}
                panOnDrag={isInteractive}
                selectionOnDrag={isInteractive}
                zoomOnPinch={isInteractive}
                zoomOnDoubleClick={isInteractive}
            >
                <Controls showInteractiveButton={true}>
                  <ControlButton onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                    )}
                  </ControlButton>
                  <ControlButton onClick={() => arrangeAllDisplays && arrangeAllDisplays()} title="Arrange displays">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </ControlButton>
                </Controls>
                <MiniMap />
            </ReactFlow>
        </div>
        <PipelineToolbar onNodeSelect={handleNodeSelect} />
        </>
    )
}
