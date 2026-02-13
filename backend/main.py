from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from collections import defaultdict, deque
import httpx
import os
import base64
import json
from pydantic import BaseModel
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, Float, String, Boolean, DateTime, text
import pandas as pd
import plotly.express as px
import imagehash
from PIL import Image
import requests
from io import BytesIO
import openai
import anthropic

load_dotenv()

# Set API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# MongoDB connection (replace with your MongoDB Atlas connection string)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test the connection
    client.admin.command('ping')
    db = client.pipeline_db
    executions_collection = db.executions
    print("Connected to MongoDB successfully")
    executions_engine = None
    executions_table = None
except Exception as e:
    # Suppress MongoDB connection error
    client = None
    db = None
    executions_collection = None
    # Fallback to SQLite
    executions_engine = create_engine("sqlite:///executions.db")
    executions_table = Table('executions', MetaData(),
                             Column('id', Integer, primary_key=True),
                             Column('pipeline_data', String(1000)),
                             Column('input_value', String(500)),
                             Column('outputs', String(1000)),
                             Column('timestamp', DateTime))
    executions_table.metadata.create_all(executions_engine)

class LLMRequest(BaseModel):
    model: str
    system_prompt: str = ""
    user_prompt: str

class DatabaseRequest(BaseModel):
    connection_string: str
    query: str

class DatabaseConnectRequest(BaseModel):
    db_type: str  # 'sqlite', 'postgresql', 'mysql', 'mongodb'
    host: str = "localhost"
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None

class SchemaCreateRequest(BaseModel):
    connection_string: str
    table_name: str
    columns: List[Dict[str, Any]]  # [{"name": "id", "type": "INTEGER", "primary_key": true}, ...]

class ChartRequest(BaseModel):
    connection_string: str
    query: str
    chart_type: str  # 'bar', 'line', 'pie', 'scatter', 'histogram'
    x_column: str
    y_column: str
    title: str = "Database Chart"

class ExecutionRequest(BaseModel):
    pipeline_data: dict
    input_value: str
    outputs: list

class ImageRequest(BaseModel):
    image_url: Optional[str] = None
    image_data: Optional[str] = None  # base64 encoded image
    match_type: str = "similar"  # "similar" or "exact"
    threshold: float = 10.0  # hamming distance threshold for similarity

app = FastAPI()

# Global exception handler to return JSON instead of HTML
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print(f"Unhandled exception: {exc}")
    print(traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(exc)}"})

# Development CORS - allow local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for pipelines
stored_pipelines = []


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.get('/health')
def health_check():
    return {'status': 'healthy'}


@app.post('/run')
async def run_pipeline(request: Request):
    """Accept JSON payload from the frontend, store it, and return acknowledgement.

    Stores the pipeline data in memory for demonstration.
    """
    payload = await request.json()
    stored_pipelines.append(payload)
    return {'status': 'stored', 'id': len(stored_pipelines) - 1}


@app.get('/pipelines')
def get_stored_pipelines():
    """Retrieve all stored pipelines."""
    return {'pipelines': stored_pipelines}


def is_dag(nodes, edges):
    # Build adjacency list
    graph = defaultdict(list)
    in_degree = {node['id']: 0 for node in nodes}
    for edge in edges:
        graph[edge['source']].append(edge['target'])
        in_degree[edge['target']] += 1

    # Kahn's algorithm for topological sort
    queue = deque([node for node in in_degree if in_degree[node] == 0])
    visited_count = 0

    while queue:
        current = queue.popleft()
        visited_count += 1
        for neighbor in graph[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited_count == len(nodes)


@app.post('/pipelines/parse')
async def parse_pipeline(request: Request):
    payload = await request.json()
    nodes = payload.get('nodes', [])
    edges = payload.get('edges', [])
    num_nodes = len(nodes)
    dag = is_dag(nodes, edges)
    return {'num_nodes': num_nodes, 'is_dag': dag}

@app.post('/api/llm')
async def api_llm_generate(request: Request):
    try:
        payload = await request.json()
        model = payload.get('model')
        systemPrompt = payload.get('systemPrompt', '')
        userPrompt = payload.get('userPrompt', '')
        inputs = payload.get('inputs', [])

        # Determine provider based on model
        if model.startswith('gpt-'):
            # OpenAI
            if not openai.api_key:
                return {"response": "OpenAI API key not configured."}
            messages = []
            if systemPrompt:
                messages.append({"role": "system", "content": systemPrompt})
            messages.append({"role": "user", "content": userPrompt})
            try:
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=messages,
                    max_tokens=1000,
                    temperature=0.7
                )
                return {"response": response.choices[0].message.content.strip()}
            except Exception as e:
                print(f"OpenAI error: {e}")
                return {"response": f"OpenAI error: {str(e)}"}
        elif model.startswith('claude-'):
            # Anthropic
            if not anthropic_client:
                return {"response": "Anthropic API key not configured."}
            try:
                response = anthropic_client.messages.create(
                    model=model,
                    max_tokens=1000,
                    temperature=0.7,
                    system=systemPrompt if systemPrompt else "",
                    messages=[
                        {"role": "user", "content": userPrompt}
                    ]
                )
                return {"response": response.content[0].text.strip()}
            except Exception as e:
                print(f"Anthropic error: {e}")
                return {"response": f"Anthropic error: {str(e)}"}
        else:
            # Ollama
            async with httpx.AsyncClient(timeout=120.0) as client:
                ollama_payload = {
                    "model": model,
                    "prompt": userPrompt,
                    "stream": False
                }
                if systemPrompt and systemPrompt.strip():
                    ollama_payload["system"] = systemPrompt

                print(f"Sending request to Ollama: {ollama_payload}")
                try:
                    response = await client.post("http://localhost:11434/api/generate", json=ollama_payload)
                except Exception as e:
                    print(f"Error sending request to Ollama: {e}")
                    return {"response": "Hello! This is a mock response since there was an error communicating with Ollama. Please check Ollama's status and try again."}

                print(f"Ollama response status: {response.status_code}")

                if response.status_code == 500:
                    print(f"Ollama returned 500 error: {response.text}")
                    # Return mock response when Ollama has internal errors
                    return {"response": "Hello! This is a mock response since Ollama encountered an internal error. Please check Ollama's status and try again."}

                response.raise_for_status()

                result = response.json()
                print(f"Ollama response: {result}")
                return {"response": result.get("response", "").strip()}
    except httpx.ConnectError as e:
        print(f"Connection error to Ollama: {e}")
        # Return mock response when Ollama is not available
        return {"response": "Hello! This is a mock response since Ollama is not running. Please start Ollama to get real LLM responses."}
    except httpx.TimeoutException as e:
        print(f"Timeout error: {e}")
        return JSONResponse(status_code=504, content={"detail": "Request to Ollama timed out."})
    except Exception as e:
        print(f"General error: {e}")
        return JSONResponse(status_code=500, content={"detail": f"LLM generation failed: {str(e)}"})

@app.post('/llm')
async def llm_generate(request: Request):
    return await api_llm_generate(request)

@app.post('/llm/generate')
async def generate_llm_response(request: LLMRequest):
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "model": request.model,
                "prompt": request.user_prompt,
                "system": request.system_prompt if request.system_prompt else "",
                "stream": False
            }

            print(f"Sending request to Ollama: {payload}")
            response = await client.post("http://localhost:11434/api/generate", json=payload)
            print(f"Ollama response status: {response.status_code}")
            response.raise_for_status()

            result = response.json()
            print(f"Ollama response: {result}")
            return {"response": result.get("response", "").strip()}
    except httpx.ConnectError as e:
        print(f"Connection error to Ollama: {e}")
        return JSONResponse(status_code=503, content={"detail": "Ollama service is not available. Please ensure Ollama is running."})
    except httpx.TimeoutException as e:
        print(f"Timeout error: {e}")
        return JSONResponse(status_code=504, content={"detail": "Request to Ollama timed out."})
    except Exception as e:
        print(f"General error: {e}")
        return JSONResponse(status_code=500, content={"detail": f"LLM generation failed: {str(e)}"})

@app.post('/database/query')
async def query_database(request: DatabaseRequest):
    try:
        # Create database engine based on connection string
        engine = create_engine(request.connection_string)

        # Execute query
        with engine.connect() as conn:
            result = conn.execute(text(request.query))
            columns = result.keys()
            rows = result.fetchall()

            # Convert to list of dicts
            data = [dict(zip(columns, row)) for row in rows]

        return {
            "data": data,
            "columns": list(columns),
            "row_count": len(data),
            "query": request.query
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Database query failed: {str(e)}"})

@app.post('/database/connect')
async def connect_database(request: DatabaseConnectRequest):
    try:
        if request.db_type.lower() == 'sqlite':
            connection_string = f"sqlite:///{request.database}"
        elif request.db_type.lower() == 'postgresql':
            connection_string = f"postgresql://{request.username}:{request.password}@{request.host}:{request.port or 5432}/{request.database}"
        elif request.db_type.lower() == 'mysql':
            connection_string = f"mysql+pymysql://{request.username}:{request.password}@{request.host}:{request.port or 3306}/{request.database}"
        elif request.db_type.lower() == 'mongodb':
            # For MongoDB, we'll use a different approach
            return {"status": "connected", "connection_string": f"mongodb://{request.username}:{request.password}@{request.host}:{request.port or 27017}/{request.database}"}
        else:
            return JSONResponse(status_code=400, content={"detail": f"Unsupported database type: {request.db_type}"})

        # Test connection
        engine = create_engine(connection_string)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {"status": "connected", "connection_string": connection_string}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Database connection failed: {str(e)}"})

@app.post('/database/schema/create')
async def create_schema(request: SchemaCreateRequest):
    try:
        engine = create_engine(request.connection_string)
        metadata = MetaData()

        # Create table dynamically
        columns = []
        for col in request.columns:
            col_type = col.get('type', 'String').upper()
            if col_type == 'INTEGER':
                column_type = Integer
            elif col_type == 'FLOAT':
                column_type = Float
            elif col_type == 'BOOLEAN':
                column_type = Boolean
            elif col_type == 'DATETIME':
                column_type = DateTime
            else:
                column_type = String(255)

            column = Column(col['name'], column_type,
                          primary_key=col.get('primary_key', False),
                          nullable=col.get('nullable', True))
            columns.append(column)

        table = Table(request.table_name, metadata, *columns)

        # Create table
        metadata.create_all(engine)

        return {"status": "created", "table": request.table_name, "columns": len(request.columns)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Schema creation failed: {str(e)}"})

@app.post('/database/chart')
async def generate_chart(request: ChartRequest):
    try:
        engine = create_engine(request.connection_string)

        # Execute query and get data
        df = pd.read_sql(request.query, engine)

        # Generate chart based on type
        if request.chart_type.lower() == 'bar':
            fig = px.bar(df, x=request.x_column, y=request.y_column, title=request.title)
        elif request.chart_type.lower() == 'line':
            fig = px.line(df, x=request.x_column, y=request.y_column, title=request.title)
        elif request.chart_type.lower() == 'pie':
            fig = px.pie(df, names=request.x_column, values=request.y_column, title=request.title)
        elif request.chart_type.lower() == 'scatter':
            fig = px.scatter(df, x=request.x_column, y=request.y_column, title=request.title)
        elif request.chart_type.lower() == 'histogram':
            fig = px.histogram(df, x=request.x_column, title=request.title)
        else:
            return JSONResponse(status_code=400, content={"detail": f"Unsupported chart type: {request.chart_type}"})

        # Convert to HTML
        chart_html = fig.to_html(full_html=False, include_plotlyjs='cdn')

        return {"chart_html": chart_html, "chart_type": request.chart_type}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Chart generation failed: {str(e)}"})

@app.get('/database/dashboard')
async def get_dashboard():
    """Generate an admin dashboard HTML page"""
    try:
        dashboard_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Database Admin Dashboard</title>
            <script src="https://cdn.plotly.com/plotly-latest.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
                .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: white; }
                .metric { text-align: center; font-size: 2em; font-weight: bold; color: #007bff; }
                .metric-label { font-size: 0.8em; color: #666; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>Database Admin Dashboard</h1>
            <div class="dashboard">
                <div class="card">
                    <div class="metric" id="total-tables">-</div>
                    <div class="metric-label">Total Tables</div>
                </div>
                <div class="card">
                    <div class="metric" id="total-records">-</div>
                    <div class="metric-label">Total Records</div>
                </div>
                <div class="card">
                    <div id="chart-container">Loading chart...</div>
                </div>
            </div>
            <script>
                // This would be populated with real data from your database
                document.getElementById('total-tables').textContent = '12';
                document.getElementById('total-records').textContent = '1,234';

                // Sample chart
                const data = [{
                    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    y: [20, 14, 25, 16, 18],
                    type: 'bar'
                }];

                Plotly.newPlot('chart-container', data);
            </script>
        </body>
        </html>
        """
        return HTMLResponse(content=dashboard_html)
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Dashboard generation failed: {str(e)}"})

# Image analysis endpoint
@app.post('/image/analyze')
async def analyze_image(request: ImageRequest):
    try:
        if not request.image_url and not request.image_data:
            return JSONResponse(status_code=400, content={"detail": "Either image_url or image_data must be provided"})

        # Load image
        if request.image_url:
            response = requests.get(request.image_url)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
        elif request.image_data:
            image_data = base64.b64decode(request.image_data.split(',')[1] if ',' in request.image_data else request.image_data)
            image = Image.open(BytesIO(image_data))

        # Get image info
        width, height = image.size
        format = image.format
        mode = image.mode

        # Compute image hash
        hash_value = str(imagehash.average_hash(image))

        # For now, return image info and hash
        result = {
            "analysis": "Image analyzed successfully",
            "image_info": {
                "width": width,
                "height": height,
                "format": format,
                "mode": mode,
                "hash": hash_value
            },
            "match_type": request.match_type,
            "threshold": request.threshold,
            "matches": []  # No database to match against
        }
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Image analysis failed: {str(e)}"})

@app.post('/executions')
async def store_execution(request: ExecutionRequest):
    try:
        if executions_collection:
            execution_data = {
                "pipeline_data": request.pipeline_data,
                "input_value": request.input_value,
                "outputs": request.outputs,
                "timestamp": datetime.utcnow()
            }
            result = executions_collection.insert_one(execution_data)
            return {"message": "Execution stored successfully", "id": str(result.inserted_id)}
        else:
            # Use SQLite
            with executions_engine.connect() as conn:
                result = conn.execute(executions_table.insert().values(
                    pipeline_data=json.dumps(request.pipeline_data),
                    input_value=request.input_value,
                    outputs=json.dumps(request.outputs),
                    timestamp=datetime.utcnow()
                ))
                conn.commit()
            return {"message": "Execution stored successfully", "id": result.inserted_primary_key[0]}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Failed to store execution: {str(e)}"})

@app.get('/executions')
async def get_executions():
    try:
        if executions_collection:
            executions = list(executions_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
            return {"executions": executions}
        else:
            # Use SQLite
            with executions_engine.connect() as conn:
                result = conn.execute(executions_table.select().order_by(executions_table.c.timestamp.desc()).limit(50))
                executions = []
                for row in result:
                    executions.append({
                        "pipeline_data": json.loads(row.pipeline_data),
                        "input_value": row.input_value,
                        "outputs": json.loads(row.outputs),
                        "timestamp": row.timestamp.isoformat() if row.timestamp else None
                    })
            return {"executions": executions}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Failed to retrieve executions: {str(e)}"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)
