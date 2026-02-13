// Test script to verify the store syncing logic for LLM execution
// Simulates the executePipeline syncing behavior

// Mock current store nodes (before execution)
const currentNodes = [
  {
    id: 'customInput-1',
    type: 'customInput',
    position: { x: 200, y: 100 },
    data: {
      inputName: 'input_1',
      inputType: 'Text',
      inputValue: 'Hello world',
      isAnimating: true,
      isVisible: true,
      selected: false,
      isDisplayOpen: false
    }
  },
  {
    id: 'llm-1',
    type: 'llm',
    position: { x: 600, y: 100 },
    data: {
      model: 'llama2',
      systemPrompt: 'You are a helpful assistant',
      userPrompt: 'Say hello',
      output: '', // Empty before execution
      isVisible: true,
      selected: false,
      isDisplayOpen: false
    }
  },
  {
    id: 'customOutput-1',
    type: 'customOutput',
    position: { x: 1000, y: 100 },
    data: {
      outputName: 'output_1',
      outputType: 'Text',
      outputValue: '',
      isVisible: true,
      selected: false,
      isDisplayOpen: false
    }
  }
];

// Mock updated nodes from stateManager (after execution)
const updatedNodesFromStateManager = [
  {
    id: 'customInput-1',
    type: 'customInput',
    position: { x: 200, y: 100 },
    data: {
      inputName: 'input_1',
      inputType: 'Text',
      inputValue: 'Hello world',
      isAnimating: true,
      isVisible: true
    }
  },
  {
    id: 'llm-1',
    type: 'llm',
    position: { x: 600, y: 100 },
    data: {
      model: 'llama2',
      systemPrompt: 'You are a helpful assistant',
      userPrompt: 'Say hello',
      output: 'Hello! How can I help you today?', // Updated after execution
      isVisible: true
    }
  },
  {
    id: 'customOutput-1',
    type: 'customOutput',
    position: { x: 1000, y: 100 },
    data: {
      outputName: 'output_1',
      outputType: 'Text',
      outputValue: 'Hello! How can I help you today?',
      isVisible: true
    }
  }
];

// Simulate the new syncing logic
const syncedNodes = updatedNodesFromStateManager.map(updatedNode => {
  const currentNode = currentNodes.find(n => n.id === updatedNode.id);
  return {
    ...updatedNode,
    selected: currentNode?.selected || false,
    data: {
      ...updatedNode.data,
      selected: currentNode?.data?.selected || false,
      isDisplayOpen: currentNode?.data?.isDisplayOpen || false,
      isVisible: currentNode?.data?.isVisible || true,
      _timestamp: Date.now(), // Force re-render by adding timestamp
      _forceUpdate: Math.random(), // Force ReactFlow to detect change
    },
    // Ensure position is valid to prevent SVG path NaN errors
    position: {
      x: typeof updatedNode.position?.x === 'number' && !isNaN(updatedNode.position.x) && isFinite(updatedNode.position.x) ? updatedNode.position.x : 0,
      y: typeof updatedNode.position?.y === 'number' && !isNaN(updatedNode.position.y) && isFinite(updatedNode.position.y) ? updatedNode.position.y : 0,
    },
  };
});

// Test results
console.log('=== Store Sync Test Results ===');
console.log('Original LLM output (before sync):', currentNodes.find(n => n.id === 'llm-1')?.data?.output);
console.log('Updated LLM output (from stateManager):', updatedNodesFromStateManager.find(n => n.id === 'llm-1')?.data?.output);
console.log('Synced LLM output (after sync):', syncedNodes.find(n => n.id === 'llm-1')?.data?.output);
console.log('LLM display open after sync:', syncedNodes.find(n => n.id === 'llm-1')?.data?.isDisplayOpen);
console.log('Input node selected preserved:', syncedNodes.find(n => n.id === 'customInput-1')?.data?.selected);

// Verify the sync worked correctly
const llmNode = syncedNodes.find(n => n.id === 'llm-1');
const inputNode = syncedNodes.find(n => n.id === 'customInput-1');

const tests = [
  {
    name: 'LLM output synced correctly',
    passed: llmNode?.data?.output === 'Hello! How can I help you today?',
    expected: 'Hello! How can I help you today?',
    actual: llmNode?.data?.output
  },
  {
    name: 'LLM display state preserved (not forced open)',
    passed: llmNode?.data?.isDisplayOpen === false,
    expected: false,
    actual: llmNode?.data?.isDisplayOpen
  },
  {
    name: 'Store-specific fields preserved (selected)',
    passed: inputNode?.data?.selected === false,
    expected: false,
    actual: inputNode?.data?.selected
  },
  {
    name: 'Store-specific fields preserved (isVisible)',
    passed: inputNode?.data?.isVisible === true,
    expected: true,
    actual: inputNode?.data?.isVisible
  },
  {
    name: 'Timestamp added for re-render',
    passed: typeof llmNode?.data?._timestamp === 'number',
    expected: 'number',
    actual: typeof llmNode?.data?._timestamp
  },
  {
    name: 'Force update added for re-render',
    passed: typeof llmNode?.data?._forceUpdate === 'number',
    expected: 'number',
    actual: typeof llmNode?.data?._forceUpdate
  }
];

console.log('\n=== Test Results ===');
let allPassed = true;
tests.forEach(test => {
  const status = test.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${test.name}`);
  if (!test.passed) {
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Actual: ${test.actual}`);
    allPassed = false;
  }
});

console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
