# TODO: Improve arrangeDisplays with Actual ReactFlow Container Bounds

## Task
Improve the arrangeDisplays function to use actual ReactFlow container bounds for more precise dynamic sizing in 3x3 grid layout.

## Steps

- [ ] 1. Add canvasBounds state and setCanvasBounds function to StoreContext.jsx
- [ ] 2. Update ui.jsx to call setCanvasBounds on mount and resize
- [ ] 3. Modify arrangeDisplays to use canvasBounds when available

## Details

### Step 1: StoreContext.jsx
- Add `canvasBounds` state: { width, height, left, right, top, bottom }
- Add `setCanvasBounds` function to update bounds
- Modify arrangeDisplays to use canvasBounds.width/height instead of window.innerWidth/Height

### Step 2: ui.jsx
- Import setCanvasBounds from store
- Call setCanvasBounds on mount using reactFlowWrapper.getBoundingClientRect()
- Add resize event listener to update bounds on window resize
- Cleanup listener on unmount

### Step 3: arrangeDisplays Function
- Use canvasBounds when available
- Fall back to window dimensions if canvasBounds not set
- Keep the existing 3x3 grid logic with dynamic sizing based on actual container
