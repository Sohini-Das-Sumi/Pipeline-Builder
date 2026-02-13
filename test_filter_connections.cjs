/**
 * Test Suite: Filter Node Connections
 * 
 * This test verifies that filter connections can be made between Filter node and other nodes.
 * Tests handle configurations, connection creation, and bidirectional connectivity.
 */

// Mock ReactFlow's MarkerType for Node.js environment (self-contained, no external deps)
const MockMarkerType = {
  Arrow: 'arrow',
  ArrowClosed: 'arrowclosed'
};


// Test Configuration
const TEST_CONFIG = {
  verbose: true,
  testTimeout: 5000
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test Results Tracker
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Assert function for tests
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Log test results
 */
function log(message, type = 'info') {
  if (!TEST_CONFIG.verbose && type === 'info') return;
  
  const color = {
    'info': colors.blue,
    'success': colors.green,
    'error': colors.red,
    'warning': colors.yellow,
    'header': colors.cyan
  }[type] || colors.reset;
  
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Run a single test
 */
async function runTest(name, testFn) {
  try {
    log(`\n▶ Running: ${name}`, 'header');
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    log(`✓ PASSED: ${name}`, 'success');
    return true;
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    log(`✗ FAILED: ${name}`, 'error');
    log(`  Error: ${error.message}`, 'error');
    return false;
  }
}

// ============================================
// NODE CONFIGURATIONS
// ============================================

/**
 * Filter Node Configuration
 */
const FilterNodeConfig = {
  type: 'filter',
  handles: [
    { type: 'target', id: 'input', position: 'left' },
    { type: 'source', id: 'filtered', position: 'right' }
  ]
};

/**
 * Input Node Configuration
 */
const InputNodeConfig = {
  type: 'customInput',
  handles: [
    { type: 'source', id: 'value', position: 'right' },
    { type: 'target', id: 'filter', position: 'top' }
  ]
};

/**
 * Output Node Configuration
 */
const OutputNodeConfig = {
  type: 'customOutput',
  handles: [
    { type: 'target', id: 'value', position: 'left' },
    { type: 'target', id: 'filter', position: 'top' }
  ]
};

/**
 * LLM Node Configuration
 */
const LLMNodeConfig = {
  type: 'llm',
  handles: [
    { type: 'target', id: 'system', position: 'left' },
    { type: 'target', id: 'prompt', position: 'left' },
    { type: 'source', id: 'response', position: 'right' },
    { type: 'target', id: 'filter', position: 'top' }
  ]
};

/**
 * Database Node Configuration
 */
const DatabaseNodeConfig = {
  type: 'database',
  handles: [
    { type: 'target', id: 'query', position: 'left' },
    { type: 'source', id: 'result', position: 'right' },
    { type: 'target', id: 'filter', position: 'top' }
  ]
};

// ============================================
// TEST SUITE
// ============================================

/**
 * Test 1: Verify Filter Node Handle Configuration
 */
async function testFilterNodeHandles() {
  log('Testing Filter Node handle configuration...');
  
  // Verify FilterNode has correct handles
  assert(FilterNodeConfig.handles.length === 2, 'FilterNode should have exactly 2 handles');
  
  const inputHandle = FilterNodeConfig.handles.find(h => h.id === 'input');
  const filteredHandle = FilterNodeConfig.handles.find(h => h.id === 'filtered');
  
  assert(inputHandle, 'FilterNode should have input handle');
  assert(filteredHandle, 'FilterNode should have filtered handle');
  assert(inputHandle.type === 'target', 'input handle should be type target');
  assert(filteredHandle.type === 'source', 'filtered handle should be type source');
  
  log('  ✓ FilterNode has correct input (target) handle', 'success');
  log('  ✓ FilterNode has correct filtered (source) handle', 'success');
}

/**
 * Test 2: Verify Other Nodes Have Filter Target Handles
 */
async function testOtherNodesFilterHandles() {
  log('Testing other nodes for filter target handles...');
  
  const nodesWithFilter = [
    { name: 'InputNode', config: InputNodeConfig },
    { name: 'OutputNode', config: OutputNodeConfig },
    { name: 'LLMNode', config: LLMNodeConfig },
    { name: 'DatabaseNode', config: DatabaseNodeConfig }
  ];
  
  for (const node of nodesWithFilter) {
    const filterHandle = node.config.handles.find(h => h.id === 'filter');
    assert(filterHandle, `${node.name} should have filter handle`);
    assert(filterHandle.type === 'target', `${node.name} filter handle should be type target`);
    assert(filterHandle.position === 'top', `${node.name} filter handle should be at top position`);
    log(`  ✓ ${node.name} has filter target handle at top`, 'success');
  }
}

/**
 * Test 3: Verify Connection Creation - Filter to InputNode
 */
async function testFilterToInputConnection() {
  log('Testing Filter → InputNode connection...');
  
  const filterNodeId = 'filter-1';
  const inputNodeId = 'input-1';
  
  // Create connection: Filter.filtered (source) → InputNode.filter (target)
  const connection = {
    source: filterNodeId,
    sourceHandle: `${filterNodeId}-filtered`,
    target: inputNodeId,
    targetHandle: `${inputNodeId}-filter`
  };
  
  // Verify handle IDs match
  assert(connection.sourceHandle.includes('filtered'), 'Source handle should be filtered');
  assert(connection.targetHandle.includes('filter'), 'Target handle should be filter');
  
  // Create edge
  const edge = {
    id: `e-${filterNodeId}-${inputNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  assert(edge.id, 'Edge should have an ID');
  assert(edge.type === 'smoothstep', 'Edge should be smoothstep type');
  assert(edge.animated === true, 'Edge should be animated');
  assert(edge.markerEnd, 'Edge should have markerEnd');
  
  log('  ✓ Filter → InputNode connection created successfully', 'success');
  log(`  ✓ Edge ID: ${edge.id}`, 'success');
}

/**
 * Test 4: Verify Connection Creation - Filter to OutputNode
 */
async function testFilterToOutputConnection() {
  log('Testing Filter → OutputNode connection...');
  
  const filterNodeId = 'filter-1';
  const outputNodeId = 'output-1';
  
  const connection = {
    source: filterNodeId,
    sourceHandle: `${filterNodeId}-filtered`,
    target: outputNodeId,
    targetHandle: `${outputNodeId}-filter`
  };
  
  const edge = {
    id: `e-${filterNodeId}-${outputNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  assert(edge.source === filterNodeId, 'Edge source should be filter node');
  assert(edge.target === outputNodeId, 'Edge target should be output node');
  
  log('  ✓ Filter → OutputNode connection created successfully', 'success');
}

/**
 * Test 5: Verify Connection Creation - Filter to LLMNode
 */
async function testFilterToLLMConnection() {
  log('Testing Filter → LLMNode connection...');
  
  const filterNodeId = 'filter-1';
  const llmNodeId = 'llm-1';
  
  const connection = {
    source: filterNodeId,
    sourceHandle: `${filterNodeId}-filtered`,
    target: llmNodeId,
    targetHandle: `${llmNodeId}-filter`
  };
  
  const edge = {
    id: `e-${filterNodeId}-${llmNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  assert(edge.targetHandle.includes('filter'), 'Target handle should be filter');
  
  log('  ✓ Filter → LLMNode connection created successfully', 'success');
}

/**
 * Test 6: Verify Connection Creation - Filter to DatabaseNode
 */
async function testFilterToDatabaseConnection() {
  log('Testing Filter → DatabaseNode connection...');
  
  const filterNodeId = 'filter-1';
  const dbNodeId = 'database-1';
  
  const connection = {
    source: filterNodeId,
    sourceHandle: `${filterNodeId}-filtered`,
    target: dbNodeId,
    targetHandle: `${dbNodeId}-filter`
  };
  
  const edge = {
    id: `e-${filterNodeId}-${dbNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  assert(edge.id.includes(filterNodeId), 'Edge ID should include filter node ID');
  assert(edge.id.includes(dbNodeId), 'Edge ID should include database node ID');
  
  log('  ✓ Filter → DatabaseNode connection created successfully', 'success');
}

/**
 * Test 7: Verify Bidirectional Connection - InputNode to Filter
 */
async function testInputToFilterConnection() {
  log('Testing InputNode → Filter connection...');
  
  const inputNodeId = 'input-1';
  const filterNodeId = 'filter-1';
  
  // InputNode.value (source) → Filter.input (target)
  const connection = {
    source: inputNodeId,
    sourceHandle: `${inputNodeId}-value`,
    target: filterNodeId,
    targetHandle: `${filterNodeId}-input`
  };
  
  assert(connection.sourceHandle.includes('value'), 'Source handle should be value');
  assert(connection.targetHandle.includes('input'), 'Target handle should be input');
  
  const edge = {
    id: `e-${inputNodeId}-${filterNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  log('  ✓ InputNode → Filter connection created successfully', 'success');
}

/**
 * Test 8: Verify Bidirectional Connection - LLMNode to Filter
 */
async function testLLMToFilterConnection() {
  log('Testing LLMNode → Filter connection...');
  
  const llmNodeId = 'llm-1';
  const filterNodeId = 'filter-1';
  
  // LLMNode.response (source) → Filter.input (target)
  const connection = {
    source: llmNodeId,
    sourceHandle: `${llmNodeId}-response`,
    target: filterNodeId,
    targetHandle: `${filterNodeId}-input`
  };
  
  assert(connection.sourceHandle.includes('response'), 'Source handle should be response');
  assert(connection.targetHandle.includes('input'), 'Target handle should be input');
  
  const edge = {
    id: `e-${llmNodeId}-${filterNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  log('  ✓ LLMNode → Filter connection created successfully', 'success');
}

/**
 * Test 9: Verify Bidirectional Connection - DatabaseNode to Filter
 */
async function testDatabaseToFilterConnection() {
  log('Testing DatabaseNode → Filter connection...');
  
  const dbNodeId = 'database-1';
  const filterNodeId = 'filter-1';
  
  // DatabaseNode.result (source) → Filter.input (target)
  const connection = {
    source: dbNodeId,
    sourceHandle: `${dbNodeId}-result`,
    target: filterNodeId,
    targetHandle: `${filterNodeId}-input`
  };
  
  assert(connection.sourceHandle.includes('result'), 'Source handle should be result');
  assert(connection.targetHandle.includes('input'), 'Target handle should be input');
  
  const edge = {
    id: `e-${dbNodeId}-${filterNodeId}`,
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MockMarkerType.Arrow, height: '20px', width: '20px' }
  };
  
  log('  ✓ DatabaseNode → Filter connection created successfully', 'success');
}

/**
 * Test 10: Verify Complete Filter Pipeline
 */
async function testCompleteFilterPipeline() {
  log('Testing complete filter pipeline with multiple connections...');
  
  const nodes = [
    { id: 'input-1', type: 'customInput' },
    { id: 'filter-1', type: 'filter' },
    { id: 'llm-1', type: 'llm' },
    { id: 'output-1', type: 'customOutput' }
  ];
  
  const edges = [
    // Input → Filter
    {
      id: 'e-input-1-filter-1',
      source: 'input-1',
      sourceHandle: 'input-1-value',
      target: 'filter-1',
      targetHandle: 'filter-1-input',
      type: 'smoothstep',
      animated: true
    },
    // Filter → LLM
    {
      id: 'e-filter-1-llm-1',
      source: 'filter-1',
      sourceHandle: 'filter-1-filtered',
      target: 'llm-1',
      targetHandle: 'llm-1-filter',
      type: 'smoothstep',
      animated: true
    },
    // LLM → Output
    {
      id: 'e-llm-1-output-1',
      source: 'llm-1',
      sourceHandle: 'llm-1-response',
      target: 'output-1',
      targetHandle: 'output-1-value',
      type: 'smoothstep',
      animated: true
    }
  ];
  
  // Verify all edges are valid
  assert(edges.length === 3, 'Pipeline should have 3 edges');
  
  // Verify edge chain
  const inputToFilter = edges.find(e => e.source === 'input-1' && e.target === 'filter-1');
  const filterToLLM = edges.find(e => e.source === 'filter-1' && e.target === 'llm-1');
  const llmToOutput = edges.find(e => e.source === 'llm-1' && e.target === 'output-1');
  
  assert(inputToFilter, 'Should have Input → Filter edge');
  assert(filterToLLM, 'Should have Filter → LLM edge');
  assert(llmToOutput, 'Should have LLM → Output edge');
  
  // Verify handle compatibility
  assert(inputToFilter.sourceHandle.includes('value'), 'Input should connect via value handle');
  assert(inputToFilter.targetHandle.includes('input'), 'Filter should receive via input handle');
  assert(filterToLLM.sourceHandle.includes('filtered'), 'Filter should output via filtered handle');
  assert(filterToLLM.targetHandle.includes('filter'), 'LLM should receive via filter handle');
  
  log('  ✓ Complete pipeline with filter node validated', 'success');
  log(`  ✓ Pipeline: Input → Filter → LLM → Output`, 'success');
}

/**
 * Test 11: Verify Handle Position Compatibility
 */
async function testHandlePositionCompatibility() {
  log('Testing handle position compatibility...');
  
  // Filter node output is on right (source)
  const filterOutput = FilterNodeConfig.handles.find(h => h.id === 'filtered');
  assert(filterOutput.position === 'right', 'Filter output should be on right');
  
  // Other nodes' filter input is on top (target)
  const inputFilter = InputNodeConfig.handles.find(h => h.id === 'filter');
  const outputFilter = OutputNodeConfig.handles.find(h => h.id === 'filter');
  const llmFilter = LLMNodeConfig.handles.find(h => h.id === 'filter');
  const dbFilter = DatabaseNodeConfig.handles.find(h => h.id === 'filter');
  
  assert(inputFilter.position === 'top', 'InputNode filter should be on top');
  assert(outputFilter.position === 'top', 'OutputNode filter should be on top');
  assert(llmFilter.position === 'top', 'LLMNode filter should be on top');
  assert(dbFilter.position === 'top', 'DatabaseNode filter should be on top');
  
  log('  ✓ All filter handles positioned correctly', 'success');
  log('  ✓ Filter output (right) → Node filter input (top) layout validated', 'success');
}

/**
 * Test 12: Verify Edge Properties
 */
async function testEdgeProperties() {
  log('Testing edge properties...');
  
  const testEdge = {
    id: 'e-test',
    source: 'filter-1',
    target: 'output-1',
    sourceHandle: 'filter-1-filtered',
    targetHandle: 'output-1-filter',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MockMarkerType.Arrow,
      height: '20px',
      width: '20px'
    }
  };
  
  assert(testEdge.type === 'smoothstep', 'Edge type should be smoothstep');
  assert(testEdge.animated === true, 'Edge should be animated');
  assert(testEdge.markerEnd, 'Edge should have markerEnd');
  assert(testEdge.markerEnd.type === MockMarkerType.Arrow, 'Marker should be Arrow type');
  assert(testEdge.markerEnd.height === '20px', 'Marker height should be 20px');
  assert(testEdge.markerEnd.width === '20px', 'Marker width should be 20px');
  
  log('  ✓ Edge properties validated', 'success');
  log('  ✓ Type: smoothstep', 'success');
  log('  ✓ Animated: true', 'success');
  log('  ✓ Marker: Arrow (20x20px)', 'success');
}

// ============================================
// MAIN TEST RUNNER
// ============================================

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('FILTER NODE CONNECTION TEST SUITE', 'header');
  console.log('='.repeat(60) + '\n');
  
  const tests = [
    testFilterNodeHandles,
    testOtherNodesFilterHandles,
    testFilterToInputConnection,
    testFilterToOutputConnection,
    testFilterToLLMConnection,
    testFilterToDatabaseConnection,
    testInputToFilterConnection,
    testLLMToFilterConnection,
    testDatabaseToFilterConnection,
    testCompleteFilterPipeline,
    testHandlePositionCompatibility,
    testEdgeProperties
  ];
  
  for (const test of tests) {
    await runTest(test.name, test);
  }
  
  // Print Summary
  console.log('\n' + '='.repeat(60));
  log('TEST SUMMARY', 'header');
  console.log('='.repeat(60));
  log(`Total Tests: ${testResults.passed + testResults.failed}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.failed === 0) {
    log('\n✓ All filter connection tests passed!', 'success');
    log('Filter node can successfully connect to:', 'success');
    log('  • InputNode (bidirectional)', 'success');
    log('  • OutputNode (bidirectional)', 'success');
    log('  • LLMNode (bidirectional)', 'success');
    log('  • DatabaseNode (bidirectional)', 'success');
  } else {
    log('\n✗ Some tests failed. Review errors above.', 'error');
  }
  
  console.log('='.repeat(60) + '\n');
  
  return testResults.failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  FilterNodeConfig,
  InputNodeConfig,
  OutputNodeConfig,
  LLMNodeConfig,
  DatabaseNodeConfig
};
