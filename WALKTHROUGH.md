# Pipeline Builder - Complete Walkthrough

Welcome to **Pipeline Builder**, a visual, node-based workflow construction application that enables you to create, configure, and execute data processing pipelines through an intuitive drag-and-drop interface.

---

## Table of Contents

1. [What is Pipeline Builder?](#what-is-pipeline-builder)
2. [Getting Started](#getting-started)
3. [The Interface](#the-interface)
4. [Working with Nodes](#working-with-nodes)
5. [Node Reference Guide](#node-reference-guide)
6. [Connecting Nodes](#connecting-nodes)
7. [Executing Your Pipeline](#executing-your-pipeline)
8. [Theme Customization](#theme-customization)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)

---

## What is Pipeline Builder?

Pipeline Builder is a visual programming tool that lets you create data processing workflows by connecting different types of nodes together. Think of it like a flowchart where each box (node) performs a specific task, and the connections (edges) pass data from one task to the next.

### Key Capabilities:

- **Visual Design**: Drag-and-drop interface for building workflows
- **Multiple Node Types**: 10+ different node types for various tasks
- **AI Integration**: Built-in support for LLM models (Ollama, OpenAI, Anthropic)
- **Database Support**: Connect to SQLite, PostgreSQL, MySQL, and MongoDB
- **Real-time Execution**: Run your pipeline and see results instantly
- **State Persistence**: Your work is automatically saved

---

## Getting Started

### Prerequisites

Before running the application, ensure you have:

- **Node.js** (version 18 or higher)
- **Python** (version 3.8 or higher)
- **Ports 3000 and 8003** available on your system

### Starting the Application

#### Step 1: Start the Backend

The backend handles all the heavy processing, including LLM calls and database operations.

```
bash
# Navigate to the backend directory
cd c:/FrontendUI/backend

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

The backend will start on **http://localhost:8003**

#### Step 2: Start the Frontend

Open a new terminal window and run:

```
bash
# Navigate to the frontend directory
cd c:/FrontendUI/frontend

# Install Node.js dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The frontend will open at **http://localhost:3000**

### Quick Verification

Once both servers are running:

1. Open your browser to **http://localhost:3000**
2. You should see the Pipeline Builder interface with a dark background and animated 3D waves
3. The interface should load without errors in the console

---

## The Interface

When you first open Pipeline Builder, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│  [Controls] [Theme Toggle] [Minimap]          ← Top Bar    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                    EMPTY CANVAS                             │
│              (Drag nodes here to start)                    │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Input] [LLM] [Output] [Text] [Filter] ...    ← Toolbar  │
└─────────────────────────────────────────────────────────────┘
```

### Interface Components

#### 1. **Top Control Bar**

- **Controls Panel**: Zoom in/out, fit view, lock/unlock interactivity
- **Theme Toggle**: Switch between dark and light modes (sun/moon icon)
- **Arrange Button**: Automatically arrange all nodes in a grid layout
- **MiniMap**: Small overview of your entire pipeline in the corner

#### 2. **Canvas Area**

The main workspace where you:
- Drop nodes from the toolbar
- Connect nodes by dragging between handles
- Move nodes around to organize your pipeline
- Select nodes to view/edit their properties

#### 3. **Bottom Toolbar**

Contains all available node types. Each button represents a different type of processing node.

---

## Working with Nodes

### Adding Nodes

There are two ways to add nodes to your pipeline:

#### Method 1: Drag and Drop

1. Click and hold on a node type in the bottom toolbar
2. Drag it onto the canvas
3. Release to place the node

#### Method 2: Quick Add

1. Click on a node type in the toolbar
2. The node will automatically appear in the center of the canvas

### Selecting Nodes

- **Single Click**: Select a node (shows selection border)
- **Ctrl/Cmd + Click**: Add to selection
- **Click + Drag**: Select multiple nodes
- **Double Click**: Edit node name (if supported)

### Moving Nodes

- Click and drag any node to reposition it
- Selected nodes move together

### Deleting Nodes

1. Select the node(s) you want to delete
2. Press **Delete** or **Backspace** on your keyboard
3. Or right-click and select "Delete"

### Editing Node Properties

Each node type has different configuration options. Click on a node to select it, then:

- Edit text fields directly in the node
- Use dropdown menus for selections
- Toggle switches for boolean options

---

## Node Reference Guide

### 1. Input Node

**Purpose**: Entry point for text data into your pipeline

**Configuration**:
- `Input Value`: The text content to pass to connected nodes

**Usage**:
```
┌─────────────────┐
│     INPUT       │
│ [_____________] │
│        ○───────→│ (output handle)
└─────────────────┘
```

**Example**: Type "Hello, how are you?" to send this text to the next node.

---

### 2. LLM Node (Large Language Model)

**Purpose**: AI-powered text processing using LLM models

**Configuration**:
- `Model`: Choose from available models (llama2, gpt-4, claude-3, etc.)
- `System Prompt`: Instructions that define the AI's behavior
- `User Prompt`: Input text or reference to previous node's output
- `Temperature`: Controls randomness (0.0 = focused, 1.0 = creative)

**Usage**:
```
┌─────────────────────────┐
│         LLM             │
│ Model: [llama2      ▼]  │
│ System: [___________]   │
│ Prompt: [___________]   │
│ ○──────→│ (input)       │
│         │(output)───→   │
└─────────────────────────┘
```

**Supported Models**:
- **Ollama (Local)**: llama2, codellama, mistral (requires Ollama installed)
- **OpenAI**: gpt-4, gpt-3.5-turbo (requires API key)
- **Anthropic**: claude-3-opus, claude-3-sonnet (requires API key)

---

### 3. Output Node

**Purpose**: Displays the final result of your pipeline

**Configuration**:
- `Label`: Custom label for the output display

**Usage**:
```
┌─────────────────┐
│ (input)───→│ OUTPUT    │
│            │ Result:   │
│            │ [______]  │
└─────────────────┘
```

**Tip**: Place this as the final node to see your pipeline's result.

---

### 4. Text Node

**Purpose**: Static text that can serve as templates or constants

**Configuration**:
- `Text Value`: The static text content

**Usage**:
```
┌─────────────────┐
│      TEXT       │
│ "Your static   │
│  text here"    │
│        ○───────→│
└─────────────────┘
```

**Example**: Use as a system prompt template or constant value.

---

### 5. Filter Node

**Purpose**: Transform or filter data passing through

**Configuration**:
- `Filter Type`: Type of transformation (uppercase, lowercase, trim, etc.)
- `Filter Value`: Additional parameters for the filter

**Usage**:
```
┌─────────────────┐
│ (input)───→│  FILTER   │
│            │ Type:     │
│            │ [uppercase]│
│            │    ○──────→│
└─────────────────┘
```

**Filter Types**:
- `uppercase`: Convert to UPPERCASE
- `lowercase`: Convert to lowercase
- `trim`: Remove leading/trailing whitespace
- `replace`: Find and replace text
- `regex`: Apply regex transformation

---

### 6. Database Node

**Purpose**: Execute SQL queries and retrieve database data

**Configuration**:
- `DB Type`: SQLite, PostgreSQL, MySQL, or MongoDB
- `Connection`: Connection string or file path
- `Query`: SQL query to execute

**Usage**:
```
┌─────────────────────────┐
│      DATABASE           │
│ Type: [SQLite       ▼] │
│ Path: [mydb.sqlite  ]  │
│ Query: [SELECT *    ]  │
│        FROM users      │
│        ○──────────────→│
└─────────────────────────┘
```

**Supported Databases**:
- **SQLite**: File-based, no server required
- **PostgreSQL**: Requires running PostgreSQL server
- **MySQL**: Requires running MySQL server
- **MongoDB**: NoSQL database (uses connection URI)

---

### 7. Image Node

**Purpose**: Analyze images using AI vision models

**Configuration**:
- `Image URL`: URL or path to the image
- `Analysis Type`: Type of analysis (describe, detect objects, read text)

**Usage**:
```
┌─────────────────────────┐
│       IMAGE             │
│ URL: [https://...   ]  │
│ Type: [describe     ▼] │
│        ○──────────────→│
└─────────────────────────┘
```

---

### 8. Note Node

**Purpose**: Add annotations and documentation to your pipeline

**Configuration**:
- `Note Text`: The content of your note

**Usage**:
```
┌─────────────────┐
│      NOTE       │
│ 📝 Your notes   │
│    here         │
└─────────────────┘
```

**Tip**: Use these to document complex pipelines or leave reminders.

---

### 9. Timer Node

**Purpose**: Trigger events at specific intervals

**Configuration**:
- `Interval`: Time in milliseconds between triggers
- `Repeat`: Number of times to repeat (0 = infinite)

**Usage**:
```
┌─────────────────┐
│      TIMER      │
│ Interval: 1000ms│
│ Repeat: 5      │
│        ○───────→│
└─────────────────┘
```

---

### 10. Custom Nodes

**Purpose**: User-defined node types for specialized processing

The application supports creating custom nodes through the Custom Node Manager. See the Advanced Features section for details.

---

## Connecting Nodes

### Understanding Handles

Nodes have **handles** (connection points) on their sides:

- **Input Handles** (Left side): Receive data from previous nodes
- **Output Handles** (Right side): Send data to next nodes

```
    ┌──────────────┐
───→│  (input)     │───→ (output)
    └──────────────┘
```

### Creating Connections

1. **Hover** over an output handle (right side of a node)
2. **Click and drag** from the handle
3. **Release** on an input handle (left side) of another node
4. A connection line will appear

### Connection Rules

- A node can connect to multiple other nodes
- A node can receive inputs from multiple sources
- Circular dependencies are detected and prevented
- Invalid connections (output to output) are not allowed

### Deleting Connections

1. **Click** on the connection line (it will highlight)
2. Press **Delete** or **Backspace**
3. Or right-click and select "Delete Edge"

---

## Executing Your Pipeline

### Running the Pipeline

1. **Ensure you have an Input node** with text content
2. **Ensure your pipeline ends with an Output node** (or has output-capable nodes)
3. **Click the "Execute Pipeline" button** in the bottom-center

The button will show "Executing..." while running, then display the result.

### Pipeline Execution Order

The pipeline executes nodes in topological order:
1. Nodes with no inputs execute first
2. Nodes only execute when all their inputs are ready
3. Data flows through connections from left to right

**Example Pipeline**:
```
Input → LLM → Filter → Output
```

Execution:
1. Input node provides the text
2. LLM node processes the text (waits for Input)
3. Filter node transforms the response (waits for LLM)
4. Output node displays final result (waits for Filter)

### Viewing Results

Results appear in:
- **Output Node**: Displays the final output text
- **Browser Console**: Detailed logs with `console.log()`
- **Network Tab**: API request/response details

---

## Theme Customization

### Switching Themes

Click the **sun/moon icon** in the controls panel (top-right):

- **Dark Mode** (default): Black background with colored particles
- **Light Mode**: White background with subtle grid

### Theme Features

- Dark mode: Easier on the eyes, recommended for long sessions
- Light mode: Better visibility in bright environments
- Theme preference is saved automatically

---

## Advanced Features

### Automatic Node Arrangement

Click the **grid icon** in the controls panel to automatically arrange all nodes in a clean grid layout.

### Locking/Unlocking the Canvas

The **lock icon** in the controls panel toggles canvas interactivity:

- **Unlocked** (default): You can add, move, and connect nodes
- **Locked**: Canvas is read-only, useful for viewing completed pipelines

### State Persistence

Your pipeline is automatically saved to:
- **localStorage**: Survives browser refresh
- **Backend**: Optional - saves executions to SQLite database

To clear saved state:
1. Open browser developer tools (F12)
2. Go to Application → Local Storage
3. Clear the pipeline-builder key

### Custom Node Creation

Advanced users can create custom node types:

1. Click the **Custom Node Manager** in the toolbar
2. Define node properties and behavior
3. The node becomes available in your toolbar

---

## Troubleshooting

### Common Issues

#### 1. Frontend Won't Start

**Symptoms**: Error message about port 3000 in use

**Solution**:
```
powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 2. Backend Won't Start

**Symptoms**: Error about port 8003 or missing Python packages

**Solution**:
```
bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt
```

#### 3. Nodes Not Connecting

**Symptoms**: Can't drag connection line between nodes

**Possible Causes**:
- Canvas is locked (click unlock icon)
- Trying to connect output to output (not allowed)
- Node handle is not visible (zoom in/out)

#### 4. LLM Node Not Working

**Symptoms**: LLM returns error or "Mock response"

**Solutions**:
- **Ollama not running**: Start with `ollama serve`
- **No API key**: Add OpenAI/Anthropic key to backend/.env
- **Model not available**: Check model name spelling

#### 5. Database Connection Fails

**Symptoms**: Database node shows connection error

**Check**:
- Database server is running (for PostgreSQL/MySQL)
- Connection string is correct
- User has permissions to access the database

#### 6. Results Not Appearing

**Symptoms**: Execute runs but no output

**Check**:
- Pipeline has an Output node
- All connections are valid (no broken links)
- Check browser console for errors
- Verify input nodes have values

### Getting Help

If you encounter issues:

1. **Check the Console**: Open browser DevTools (F12) → Console tab
2. **Check Network**: DevTools → Network tab to see API calls
3. **Review Logs**: Backend terminal shows request logs
4. **Restart Services**: Stop and restart both frontend and backend

### Debug Mode

Access the store directly in the browser console:

```
javascript
// In browser console
window.store.getNodes()    // Get all nodes
window.store.getEdges()    // Get all connections
window.store.executePipeline('test input')  // Run pipeline
```

---

## Quick Reference Card

| Action | How To |
|--------|--------|
| Add node | Drag from toolbar or click |
| Connect nodes | Drag from output to input handle |
| Delete node | Select + Delete key |
| Move node | Click and drag |
| Select multiple | Ctrl/Cmd + Click |
| Zoom in/out | Mouse wheel or controls |
| Toggle theme | Click sun/moon icon |
| Arrange nodes | Click grid icon |
| Run pipeline | Click "Execute Pipeline" button |

---

## Example Pipelines

### Example 1: Simple Text Processing

```
[Input: "hello world"] → [Filter: uppercase] → [Output]
```

**Result**: "HELLO WORLD"

### Example 2: AI Chat

```
[Input: "What is Python?"] → [LLM: llama2] → [Output]
```

**Result**: AI-generated response about Python

### Example 3: Multi-Step Processing

```
[Input: "  some text  "] → [Filter: trim] → [LLM: summarize] → [Filter: uppercase] → [Output]
```

**Result**: Processed and summarized text in uppercase

---

## API Reference (For Developers)

### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/api/llm` | POST | LLM text generation |
| `/run` | POST | Execute pipeline |
| `/database/query` | POST | Run SQL query |
| `/database/connect` | POST | Test database connection |
| `/executions` | GET/POST | Store/retrieve executions |

### Frontend Store API

```
javascript
// Access store in console
window.store

// Key methods
window.store.getNodes()
window.store.getEdges()
window.store.executePipeline(input)
window.store.addNode(nodeData)
window.store.deleteNode(nodeId)
```

---

## Conclusion

You're now ready to use Pipeline Builder! Start with simple pipelines and gradually explore more advanced features like AI integration and database connectivity.

**Happy Building!** 🚀

---

*Walkthrough Version: 1.0*
*Last Updated: 2024*
*For more details, see PROJECT_DOCUMENTATION.md*
