// Test script for MiniMap bounds validation
const getValidNodeBounds = (nodes) => {
  if (!nodes || nodes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  nodes.forEach(node => {
    if (node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number' &&
        !isNaN(node.position.x) && !isNaN(node.position.y)) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 200); // Approximate node width
      maxY = Math.max(maxY, node.position.y + 100); // Approximate node height
    }
  });

  const width = maxX - minX;
  const height = maxY - minY;

  // Check if bounds are valid (non-zero dimensions and finite values)
  if (width > 0 && height > 0 && isFinite(width) && isFinite(height)) {
    return { minX, minY, width, height };
  }

  return null;
};

// Test cases
console.log('Test 1 - Valid nodes with spread:');
const validNodes = [
  { position: { x: 100, y: 100 } },
  { position: { x: 400, y: 300 } }
];
console.log('Result:', getValidNodeBounds(validNodes)); // Should return bounds object

console.log('\nTest 2 - All nodes at same position (invalid bounds):');
const samePositionNodes = [
  { position: { x: 100, y: 100 } },
  { position: { x: 100, y: 100 } }
];
console.log('Result:', getValidNodeBounds(samePositionNodes)); // Should return null

console.log('\nTest 3 - Nodes with NaN positions:');
const nanNodes = [
  { position: { x: NaN, y: 100 } },
  { position: { x: 200, y: NaN } }
];
console.log('Result:', getValidNodeBounds(nanNodes)); // Should return null

console.log('\nTest 4 - Empty nodes array:');
console.log('Result:', getValidNodeBounds([])); // Should return null

console.log('\nTest 5 - Single valid node:');
const singleNode = [{ position: { x: 100, y: 100 } }];
console.log('Result:', getValidNodeBounds(singleNode)); // Should return bounds object
