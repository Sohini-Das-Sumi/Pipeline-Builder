// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, ControlButton } from 'reactflow';
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
import { getCustomNodeComponent } from './nodes/CustomNodeLibrary.jsx';
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
      loadState,
      onSelectionChange,
      arrangeAllDisplays,
      theme,
      toggleTheme
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

    // Load persisted state on component mount
    useEffect(() => {
      loadState();
      console.log('PipelineUI mounted - state loaded from localStorage');
    }, []); // Empty dependency array to prevent infinite re-renders

    // Apply theme class to body
    useEffect(() => {
      document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    }, [theme]);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
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

    return (
        <>
        <div ref={reactFlowWrapper} style={{position: 'absolute', top: '5px', left: '5px', right: '5px', bottom: '125px'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={(instance) => {
                  setReactFlowInstance(instance);
                  setStoreReactFlowInstance(instance);
                  // Clear any ReactFlow selection state on initialization
                  instance.setNodes(nodes => nodes.map(n => ({ ...n, selected: false })));
                  instance.setSelectedNodes([]);
                  instance.setSelectedEdges([]);
                }}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Controls>
                  <ControlButton onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </ControlButton>
                  <ControlButton onClick={() => arrangeAllDisplays && arrangeAllDisplays()} title="Arrange displays">
                    🗔
                  </ControlButton>
                </Controls>
                <MiniMap />
            </ReactFlow>
        </div>
        <PipelineToolbar onNodeSelect={handleNodeSelect} />
        </>
    )
}
