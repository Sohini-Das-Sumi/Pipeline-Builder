# Pipeline Builder Application - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Frontend Documentation](#frontend-documentation)
5. [Backend Documentation](#backend-documentation)
6. [Core Engine Documentation](#core-engine-documentation)
7. [Development Guide](#development-guide)
8. [Deployment Guide](#deployment-guide)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

The **Pipeline Builder** is a visual, node-based workflow construction application that allows users to create, configure, and execute data processing pipelines through an intuitive drag-and-drop interface.

### Key Features

- **Visual Pipeline Editor**: Drag-and-drop interface for building workflows
- **Multiple Node Types**: Input, LLM, Output, Text, Filter, Database, Image, Timer, Note, and Custom nodes
- **LLM Integration**: Support for Ollama (local), OpenAI, and Anthropic models
- **Database Connectivity**: SQLite, PostgreSQL, MySQL, and MongoDB support
- **Real-time Execution**: Execute pipelines with live feedback
- **Theme Support**: Dark and light mode themes
- **State Persistence**: Automatic saving to localStorage
- **3D Visual Effects**: Animated background using Three.js

### Technology Stack

**Frontend:**
- React 18.2.0 with Vite build tool
- ReactFlow for node-based UI
- Zustand-style state management via StoreContext
- Tailwind CSS for styling
- Three.js for 3D background effects
- GSAP for animations

**Backend:**
- Python FastAPI (Port 8003) - Primary API server
- Node.js Express (Port 5001) - Proxy/Legacy support
- SQLite/MongoDB for data persistence
- Integration with Ollama, OpenAI, and Anthropic APIs

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  React UI   │  │  ReactFlow  │  │   Three.js BG       │ │
│  │  Components │  │  Canvas     │  │   (Visual Effects)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │    StoreContext     │                        │
│              │  (State Management) │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                         │         Backend Layer              │
│              ┌──────────┴──────────┐                        │
│              │    Vite DevProxy    │                        │
│              │   (API Routing)     │                        │
│              └──────────┬──────────┘                        │
│        ┌────────────────┼────────────────┐                  │
│        │                │                │                  │
│   ┌────┴────┐     ┌────┴────┐     ┌────┴────┐            │
│   │ FastAPI │     │ Express │     │ Ollama  │            │
│   │ (8003)  │     │ (5001)  │     │(11434)  │            │
│   └────┬────┘     └─────────┘     └─────────┘            │
│        │                                                   │
│   ┌────┴────────────────────┐                             │
│   │    LLM Providers        │                             │
│   │  (OpenAI/Anthropic)    │                             │
│   └─────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Input → Input Node → [Processing Nodes] → Output Node
                ↓
         ┌──────┴──────┐
         │  LLM Node     │ ←→ Ollama/OpenAI/Anthropic
         │  Filter Node  │ ←→ Data transformation
         │  Database Node│ ←→ SQL/NoSQL queries
         │  Image Node   │ ←→ Image analysis
         └───────────────┘
```

---

## Project Structure

```
c:/FrontendUI/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # Application entry point
│   │   ├── ui.jsx              # Pipeline UI (ReactFlow canvas)
│   │   ├── store.js            # Zustand compatibility wrapper
│   │   ├── StoreContext.jsx    # React Context state management
│   │   ├── submit.jsx          # Pipeline execution button
│   │   ├── toolbar.jsx         # Node selection toolbar
│   │   ├── ThreeBackground.jsx # 3D background component
│   │   ├── core/
│   │   │   ├── Node.js         # Base node classes and factory
│   │   │   ├── Pipeline.js     # Pipeline execution engine
│   │   │   ├── StateManager.js # Central state management
│   │   │   └── TreeGraph.js    # Component registration system
│   │   ├── nodes/
│   │   │   ├── BaseNode.jsx    # Base node component
│   │   │   ├── inputNode.jsx   # Input node component
│   │   │   ├── llmNode.jsx     # LLM node component
│   │   │   ├── outputNode.jsx  # Output node component
│   │   │   ├── textNode.jsx    # Text node component
│   │   │   ├── filterNode.jsx  # Filter node component
│   │   │   ├── databaseNode.jsx # Database node component
│   │   │   ├── imageNode.jsx   # Image node component
│   │   │   ├── noteNode.jsx    # Note node component
│   │   │   ├── timerNode.jsx   # Timer node component
│   │   │   ├── CustomNodeLibrary.jsx  # Custom node registry
│   │   │   ├── CustomNodeManager.jsx   # Custom node manager
│   │   │   └── CustomNodeCreator.jsx   # Custom node creator
│   │   └── hooks/
│   │       └── useNodeDisplay.js # Node display hook
├── backend/                     # Python Backend
│   ├── main.py                  # FastAPI application
│   ├── main_simple.py           # Simplified FastAPI
│   ├── server.js                # Node.js Express proxy
│   └── requirements.txt         # Python dependencies
└── tools/                       # Development tools
    ├── arrange_test.js          # Layout testing
    ├── autoExecute.js           # Auto execution
    └── check_server.js          # Server health check
```

---

## Frontend Documentation

### Application Entry Point

The frontend application starts from `main.jsx`, which sets up React with the StoreProvider:

```jsx
// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './StoreContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
)
```

### Main App Component

The `App.jsx` component sets up the main layout with the 3D background and pipeline UI:

```jsx
// frontend/src/App.jsx
import { PipelineUI } from './ui.jsx';
import { SubmitButton } from './submit.jsx';
import ThreeBackground from './ThreeBackground.jsx';
import { useStore } from './store';

function App() {
  const theme = useStore((state) => state.theme);
  const backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
  
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: backgroundColor }}>
      <ThreeBackground theme={theme} />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;
```

### State Management

The application uses a custom React Context (`StoreContext.jsx`) with Zustand-style API for state management:

```jsx
// frontend/src/StoreContext.jsx - Key Concepts

// Creating the context
const StoreContext = createContext();

// Provider component manages all state
export const StoreProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [isInteractive, setIsInteractive] = useState(true);
  
  // ... extensive state management logic
};

// Custom hook to use the store
export const useStore = (selector) => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return typeof selector === 'function' ? selector(context) : context;
};
```

**Key Store Methods:**
- `nodes` / `setNodes` - Pipeline nodes state
- `edges` / `setEdges` - Pipeline connections
- `executePipeline(inputValue)` - Execute the pipeline
- `addNode(nodeData)` - Add new node
- `onConnect(connection)` - Connect nodes
- `onNodesChange(changes)` - Handle node changes
- `toggleTheme()` - Switch dark/light mode
- `updateNodeField(nodeId, field, value)` - Update node data

### Pipeline UI Component

The main canvas component using ReactFlow:

```jsx
// frontend/src/ui.jsx - Key Implementation
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';

const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  database: DatabaseNode,
  image: ImageNode,
  timer: TimerNode,
};

export const PipelineUI = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      snapGrid={[gridSize, gridSize]}
      connectionLineType='smoothstep'
    >
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};
```

### Toolbar Component

The node selection toolbar with drag-and-drop support:

```jsx
// frontend/src/toolbar.jsx - Adding a Node
const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
  event.dataTransfer.effectAllowed = 'move';
};

// Toolbar button for Input node
<div
  onDragStart={(event) => onDragStart(event, 'customInput')}
  onClick={(event) => handleNodeClick(event, 'customInput')}
  draggable
>
  Input
</div>
```

### Node Components

Each node type has a corresponding React component. Here's an example of the Input Node:

```jsx
// frontend/src/nodes/inputNode.jsx
import { Handle, Position } from 'reactflow';

export const InputNode = ({ data, id }) => {
  return (
    <div className="node input-node">
      <Handle type="source" position={Position.Right} />
      <div className="node-header">Input</div>
      <div className="node-content">
        <input
          type="text"
          value={data.inputValue || ''}
          onChange={(e) => updateNodeField(id, 'inputValue', e.target.value)}
          placeholder="Enter text..."
        />
      </div>
    </div>
  );
};
```

### Submit Button & Pipeline Execution

The execution button triggers the pipeline:

```jsx
// frontend/src/submit.jsx
export const SubmitButton = () => {
  const executePipeline = useStore(state => state.executePipeline);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await executePipeline(inputValue);
      console.log('Pipeline result:', result);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Executing...' : 'Execute Pipeline'}
    </button>
  );
};
```

---

## Backend Documentation

### Python FastAPI Server (Port 8003)

The main backend is built with FastAPI and provides LLM integration, database operations, and pipeline execution storage.

```python
# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import anthropic

app = FastAPI()

# CORS setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/api/llm')
async def api_llm_generate(request: Request):
    payload = await request.json()
    model = payload.get('model')
    systemPrompt = payload.get('systemPrompt', '')
    userPrompt = payload.get('userPrompt', '')
    
    # Ollama integration
    if model.startswith('gpt-'):
        # OpenAI API call
        response = openai.ChatCompletion.create(
            model=model,
            messages=[{"role": "system", "content": systemPrompt},
                     {"role": "user", "content": userPrompt}]
        )
        return {"response": response.choices[0].message.content}
    elif model.startswith('claude-'):
        # Anthropic API call
        response = anthropic_client.messages.create(
            model=model,
            messages=[{"role": "user", "content": userPrompt}]
        )
        return {"response": response.content[0].text}
    else:
        # Ollama (local) - default fallback
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": model, "prompt": userPrompt}
            )
            return {"response": response.json().get("response", "")}
```

### Database Operations

```python
# backend/main.py - Database endpoints
from sqlalchemy import create_engine, text

@app.post('/database/query')
async def query_database(request: DatabaseRequest):
    """Execute SQL query on connected database"""
    engine = create_engine(request.connection_string)
    with engine.connect() as conn:
        result = conn.execute(text(request.query))
        columns = result.keys()
        rows = result.fetchall()
        data = [dict(zip(columns, row)) for row in rows]
    return {"data": data, "columns": list(columns)}

@app.post('/database/connect')
async def connect_database(request: DatabaseConnectRequest):
    """Connect to various database types"""
    if request.db_type.lower() == 'sqlite':
        connection_string = f"sqlite:///{request.database}"
    elif request.db_type.lower() == 'postgresql':
        connection_string = f"postgresql://{request.username}:{request.password}@{request.host}:{request.port}/{request.database}"
    # ... test connection and return status
```

### Node.js Express Server (Port 5001)

The Express server provides proxy functionality and forwards requests to Ollama:

```javascript
// backend/server.js
const express = require('express');
const app = express();
const port = 5001;

app.post('/api/llm', async (req, res) => {
  const { model = 'llama2', systemPrompt = '', userPrompt = '' } = req.body;
  
  try {
    const fetchRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: `${systemPrompt}\n\n${userPrompt}` })
    });
    
    const raw = await fetchRes.text();
    // Parse streaming response...
    return res.json({ response: parsedResponse });
  } catch (err) {
    return res.json({ response: 'Mock response - Ollama not available' });
  }
});

app.listen(port, () => console.log(`Server on port ${port}`));
```

---

## Core Engine Documentation

### Node Class Hierarchy

```javascript
// frontend/src/core/Node.js
export class Node {
  constructor(id, type, position, data = {}) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.data = data;
    this.selected = false;
  }
  
  updateField(fieldName, fieldValue) {
    this.data[fieldName] = fieldValue;
  }
  
  async execute(inputs = {}) {
    throw new Error('Execute must be implemented by subclass');
  }
}

// API Node with error handling
export class ApiNode extends Node {
  async makeApiCall(url, data, timeout = 60000) {
    // Built-in API call with timeout and error handling
  }
}

// Example: Input Node
export class InputNode extends Node {
  async execute(inputs = {}) {
    let output = this.data.inputValue;
    // Apply filters if enabled
    if (this.data.isFilterEnabled) {
      output = applyFilter(output, this.data.filterType, this.data.filterValue);
    }
    this.updateField('output', output);
    return { output };
  }
}

// Example: LLM Node
export class LLMNode extends ApiNode {
  async execute(inputs = {}) {
    const userPrompt = inputs.userPrompt || this.data.userPrompt;
    const result = await this.makeApiCall('/api/llm', {
      model: this.data.model || 'llama2',
      userPrompt: userPrompt
    });
    this.updateField('output', result.data.response);
    return { output: result.data.response };
  }
}
```

### Pipeline Execution Engine

```javascript
// frontend/src/core/Pipeline.js
export class Pipeline {
  constructor(nodes = [], edges = []) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeMap = new Map();
    this.buildNodeMap();
  }
  
  async execute(inputValue = '') {
    const results = [];
    const nodeById = new Map();
    this.nodes.forEach(n => nodeById.set(n.id, n));
    
    // Build incoming edges map
    const incoming = new Map();
    this.nodes.forEach(n => incoming.set(n.id, []));
    this.edges.forEach(e => {
      if (!incoming.has(e.target)) incoming.set(e.target, []);
      incoming.get(e.target).push(e);
    });
    
    const processed = new Set();
    
    // Topological execution
    while (processed.size < this.nodes.length) {
      for (const node of this.nodes) {
        if (processed.has(node.id)) continue;
        
        const inc = incoming.get(node.id) || [];
        const ready = inc.every(edge => processed.has(edge.source));
        
        if (ready) {
          // Collect inputs from connected nodes
          const inputs = {};
          for (const edge of inc) {
            const srcOutput = this.getNodeOutput(edge.source);
            inputs[edge.targetHandle || 'inputData'] = srcOutput;
          }
          
          // Execute node
          const result = await node.execute(inputs);
          results.push({ nodeId: node.id, output: result.output });
          processed.add(node.id);
        }
      }
    }
    
    return { outputs: results };
  }
}
```

### StateManager

The StateManager coordinates between React state and the Pipeline engine:

```javascript
// frontend/src/core/StateManager.js
export class StateManager {
  constructor() {
    this.state = {
      backgroundVisible: true,
      hasExploded: false,
      selectedNodes: [],
      nodeIDs: {}
    };
    this.pipeline = new Pipeline();
  }
  
  getNodes() {
    return this.pipeline.nodes.map(node => node.toJSON());
  }
  
  addNode(nodeData) {
    const newNode = NodeFactory.createNode(nodeData.type, nodeData.id, nodeData.position, nodeData.data);
    this.pipeline.addNode(newNode);
  }
  
  async executePipeline(inputValue = '') {
    return await this.pipeline.execute(inputValue);
  }
  
  onNodesChange(changes) {
    // Apply ReactFlow changes to pipeline
  }
}
```

---

## Development Guide

### Environment Setup

**Prerequisites:**
- Node.js 18+ 
- Python 3.9+
- npm or yarn

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev    # Development server on port 3000
npm run build  # Production build
```

**Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
python main.py  # FastAPI server on port 8003
```

**Optional - Node.js Proxy:**
```bash
cd backend
npm install
node server.js  # Express server on port 5001
```

### Running the Application

1. Start the Python FastAPI backend:
```bash
cd backend
python main.py
# Server runs on http://localhost:8003
```

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
# App opens on http://localhost:3000
```

3. (Optional) Start Ollama for local LLM:
```bash
ollama serve
ollama pull llama2
```

### Adding a New Node Type

**Step 1: Create the Node Class**
```javascript
// frontend/src/core/Node.js
export class CustomNode extends Node {
  async execute(inputs = {}) {
    // Custom logic here
    const output = processData(inputs.inputData, this.data.config);
    this.updateField('output', output);
    return { output };
  }
}
```

**Step 2: Register in NodeFactory**
```javascript
// In NodeFactory.nodeConfigs:
'custom': {
  class: CustomNode,
  defaults: { config: 'default', output: '' }
}
```

**Step 3: Create the React Component**
```jsx
// frontend/src/nodes/customNode.jsx
export const CustomNode = ({ data, id }) => {
  const updateNodeField = useStore(state => state.updateNodeField);
  
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <input 
          value={data.config}
          onChange={(e) => updateNodeField(id, 'config', e.target.value)}
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
```

**Step 4: Register in UI**
```jsx
// frontend/src/ui.jsx
import { CustomNode } from './nodes/customNode';

const nodeTypes = {
  // ... existing nodes
  custom: CustomNode,
};
```

---

## Deployment Guide

### Production Build

**Frontend Build:**
```bash
cd frontend
npm run build
# Output in frontend/build/
```

**Backend Deployment:**
```bash
cd backend
pip install -r requirements.txt
# Use gunicorn for production
pip install gunicorn uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Environment Variables

Create `.env` file in backend:
```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
MONGO_URI=mongodb://localhost:27017
```

### Docker Deployment (Optional)

```dockerfile
# Dockerfile for backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8003
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

---

## API Reference

### Frontend Store API

| Method | Parameters | Description |
|--------|------------|-------------|
| `executePipeline(inputValue)` | string | Execute the pipeline |
| `addNode(nodeData)` | object | Add a new node |
| `onConnect(connection)` | object | Connect two nodes |
| `onNodesChange(changes)` | array | Handle node changes |
| `updateNodeField(id, field, value)` | string, string, any | Update node data |
| `toggleTheme()` | - | Switch dark/light mode |
| `deleteNode(nodeId)` | string | Remove a node |

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Health status |
| `/api/llm` | POST | LLM generation |
| `/run` | POST | Store pipeline |
| `/pipelines/parse` | POST | Validate pipeline |
| `/database/query` | POST | Execute SQL query |
| `/database/connect` | POST | Connect to database |
| `/database/chart` | POST | Generate chart |
| `/executions` | GET/POST | Store/retrieve executions |
| `/image/analyze` | POST | Analyze image |

### LLM API Payload

```javascript
// POST /api/llm
{
  "model": "llama2",        // or "gpt-4", "claude-3-opus"
  "systemPrompt": "You are a helpful assistant.",
  "userPrompt": "Hello, how are you?",
  "inputs": {}              // Optional: additional context
}
```

### Database Query Payload

```javascript
// POST /database/query
{
  "connection_string": "sqlite:///mydb.sqlite",
  "query": "SELECT * FROM users WHERE active = 1"
}
```

---

## Troubleshooting

### Common Issues

**1. Backend Not Starting**
```bash
# Check Python version
python --version  # Should be 3.9+

# Install dependencies
pip install -r requirements.txt

# Check port availability
netstat -an | findstr 8003
```

**2. Frontend Not Connecting to Backend**
- Verify Vite proxy settings in `vite.config.js`
- Check CORS settings in FastAPI
- Ensure backend is running on correct port

**3. LLM API Errors**
```python
# Check API keys
import os
print(os.getenv("OPENAI_API_KEY"))

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

**4. Nodes Not Executing**
- Check for circular dependencies in pipeline
- Verify all required nodes are connected
- Check browser console for errors
- Ensure input values are provided

**5. State Not Persisting**
- Check localStorage is not full
- Verify browser supports localStorage
- Check for JavaScript errors in console

### Debug Mode

Enable detailed logging:
```javascript
// In browser console
window.store.executePipeline('test')
console.log('Nodes:', window.store.nodes)
console.log('Edges:', window.store.edges)
```

### Getting Help

1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure ports 3000, 8003, and 11434 are available
4. Check network/firewall settings
5. Review the test files in the project for usage examples

---

## Appendix: Node Types Reference

| Node Type | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| Input | Text input for pipeline | - | text |
| LLM | AI language model | text | text (AI response) |
| Output | Pipeline output | text | - |
| Text | Static text | - | text |
| Filter | Data filtering | text | filtered text |
| Database | SQL query execution | - | query results |
| Image | Image analysis | image URL | analysis |
| Note | Annotation node | - | note text |
| Timer | Interval trigger | - | interval value |
| Calculator | Math operations | numbers | result |

---

*Documentation Version: 1.0*
*Last Updated: 2024*
