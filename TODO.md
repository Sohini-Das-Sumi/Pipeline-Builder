# TODO - Toolbar Light Theme Text Color Fix

## Task
Make the nodes' text color dark in the toolbar only for the light theme.

## Plan
- [x] Understand the codebase and theme management
- [x] Implement the change in toolbar.jsx
  - [x] Use useStore hook to get the current theme
  - [x] Update text class to conditionally apply dark color for light theme

## Completed
The toolbar node text color now changes based on theme:
- Dark theme: text-white (white)
- Light theme: text-gray-800 (dark gray)
