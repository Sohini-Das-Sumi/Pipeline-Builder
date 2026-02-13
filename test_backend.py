import httpx

# Test the backend directly
try:
    response = httpx.get('http://127.0.0.1:8001/')
    print(f"Backend response: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Error connecting to backend: {e}")

# Test LLM endpoint
try:
    payload = {
        "model": "llama2",
        "systemPrompt": "",
        "userPrompt": "Hello, respond with a simple greeting.",
        "inputs": {}
    }
    response = httpx.post('http://127.0.0.1:8000/api/llm', json=payload, timeout=30)
    print(f"LLM response: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Error connecting to LLM endpoint: {e}")
