# TODO: Fix Node Auto-Opening and Position/Size Changes on Page Refresh

## Steps to Complete

1. **Edit StoreContext.jsx loadState function**
   - Modify the node loading logic to clear display properties (isDisplayOpen, displayWidth, displayHeight, style, originalPosition) for ALL nodes when loading from localStorage
   - Ensure nodes load with displays closed and no display metadata

2. **Test the changes**
   - Refresh the page to verify nodes don't auto-open displays
   - Check that node positions and sizes remain stable on refresh
   - Confirm no random position/size changes occur

3. **Verify persistence**
   - Ensure that when nodes are manually opened/arranged, the changes are properly saved and restored without auto-opening on refresh
