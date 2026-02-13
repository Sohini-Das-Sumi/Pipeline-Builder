// Simple standalone verifier for arrangeDisplays logic
// Updated to match the new 3x3 grid configuration in StoreContext.jsx
// Run with: node tools/arrange_test.js

function arrangePositions(numDisplays, windowWidth = 1200, windowHeight = 800) {
  // Configuration for 3x3 grid style with adjustable sizes (matching StoreContext.jsx)
  const gap = 20; // px gap between displays
  const topOffset = 60; // leave space for header/toolbars
  const minDisplayWidth = 250; // minimum width per display
  const minDisplayHeight = 200; // minimum height per display
  const maxDisplayWidth = 500; // maximum width per display
  const maxDisplayHeight = 450; // maximum height per display
  
  const canvasWidth = Math.max(600, windowWidth - 40);
  const canvasHeight = Math.max(400, windowHeight - 120);

  const numDisplaysVal = numDisplays;

  // Strict 3x3 grid style: exactly 3 columns max, up to 3 rows
  const maxCols = 3;
  const maxRows = 3;
  const cols = Math.min(numDisplaysVal, maxCols);
  const rows = Math.min(Math.ceil(numDisplaysVal / cols), maxRows);

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

  const positions = [];
  for (let i = 0; i < numDisplaysVal; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gap + col * (displayWidth + gap);
    const y = topOffset + gap + row * (displayHeight + gap);
    positions.push({ id: `node-${i+1}`, x, y, width: displayWidth, height: displayHeight, col, row });
  }
  return { cols, rows, displayWidth, displayHeight, positions };
}

function prettyPrint(n) {
  const r = arrangePositions(n, 1366, 768);
  console.log(`\n== ${n} displays — cols=${r.cols}, rows=${r.rows}, w=${r.displayWidth}, h=${r.displayHeight}`);
  r.positions.forEach(p => console.log(`  ${p.id}: col=${p.col}, row=${p.row}, x=${p.x}, y=${p.y}, w=${p.width}, h=${p.height}`));
}

console.log('=== NEW 3x3 Grid Layout Simulation with window 1366x768 ===');
console.log('Configuration: gap=20, topOffset=60, minDisplayWidth=250, minDisplayHeight=200, maxDisplayWidth=500, maxDisplayHeight=450');
[1,2,3,4,5,6,7,8,9].forEach(prettyPrint);

// Also test a narrow viewport
console.log('\n=== NEW 3x3 Grid Layout Simulation with narrow window 900x600 ===');
[1,2,3,4,5,6,7,8,9].forEach(n => {
  const r = arrangePositions(n, 900, 600);
  console.log(` ${n} displays -> cols=${r.cols}, rows=${r.rows}, w=${r.displayWidth}, h=${r.displayHeight}`);
});

// Test with very small window
console.log('\n=== NEW 3x3 Grid Layout Simulation with small window 600x400 ===');
[1,2,3,4,5].forEach(n => {
  const r = arrangePositions(n, 600, 400);
  console.log(` ${n} displays -> cols=${r.cols}, rows=${r.rows}, w=${r.displayWidth}, h=${r.displayHeight}`);
});

// Test edge case: 0 displays
console.log('\n=== Edge case: 0 displays ===');
const r0 = arrangePositions(0, 1366, 768);
console.log(` 0 displays -> cols=${r0.cols}, rows=${r0.rows}, w=${r0.displayWidth}, h=${r0.displayHeight}`);
