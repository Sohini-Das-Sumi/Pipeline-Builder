from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv
import argparse

load_dotenv()

app = FastAPI()

# Global exception handler to return JSON instead of HTML
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# Development CORS - allow local frontend dev servers
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

@app.get('/health')
def health_check():
    return {'status': 'healthy'}

@app.post('/api/llm')
async def api_llm_generate(request: Request):
    try:
        payload = await request.json()
        model = payload.get('model')
        systemPrompt = payload.get('systemPrompt', '')
        userPrompt = payload.get('userPrompt', '')
        inputs = payload.get('inputs', [])

        async with httpx.AsyncClient(timeout=120.0) as client:
            ollama_payload = {
                "model": model,
                "prompt": userPrompt,
                "system": systemPrompt,
                "stream": False
            }

            print(f"Sending request to Ollama: {ollama_payload}")
            response = await client.post("http://localhost:11434/api/generate", json=ollama_payload)
            print(f"Ollama response status: {response.status_code}")
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

if __name__ == "__main__":
    import uvicorn
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8003, help='Port to bind to')
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port)
