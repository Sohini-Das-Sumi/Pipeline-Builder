// Simple standalone verifier for arrangeDisplays logic
// Run with: node tools/arrange_test.js

function arrangePositions(numDisplays, windowWidth = 1200, windowHeight = 800) {
  const gap = 16;
  const topOffset = 48;
  const canvasWidth = Math.max(600, windowWidth - 40);
  const canvasHeight = Math.max(400, windowHeight - 120);
  const preferredMinWidth = 320;
  const preferredMaxWidth = 720;

  const maxCols = Math.max(1, Math.floor((canvasWidth + gap) / (preferredMinWidth + gap)));
  const cols = Math.min(numDisplays, maxCols);
  const rows = Math.ceil(numDisplays / cols);

  const totalGapWidth = (cols + 1) * gap;
  let displayWidth = Math.floor((canvasWidth - totalGapWidth) / cols);
  displayWidth = Math.min(preferredMaxWidth, Math.max(200, displayWidth));

  const totalGapHeight = (rows + 1) * gap;
  let displayHeight = Math.floor((canvasHeight - totalGapHeight - topOffset) / rows);
  displayHeight = Math.max(120, displayHeight);

  const positions = [];
  for (let i = 0; i < numDisplays; i++) {
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

console.log('Layout simulation with window 1366x768');
[1,2,3,4,5,6,7,8].forEach(prettyPrint);

// Also test a narrow viewport
console.log('\nLayout simulation with narrow window 900x600');
[1,2,3,4,5].forEach(n => {
  const r = arrangePositions(n, 900, 600);
  console.log(` ${n} displays -> cols=${r.cols}, rows=${r.rows}, w=${r.displayWidth}, h=${r.displayHeight}`);
});
