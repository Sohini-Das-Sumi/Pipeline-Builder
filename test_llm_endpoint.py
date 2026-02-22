import requests
import json

# Test the LLM endpoint
url = 'http://127.0.0.1:8003/api/llm'
payload = {
    "model": "llama2",
    "systemPrompt": "",
    "userPrompt": "Hello, respond with a simple greeting.",
    "inputs": {}
}

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
