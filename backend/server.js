const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());

// Mock data
let users = [];
let projects = [
  { id: 1, name: 'Project 1', description: 'Description 1' },
  { id: 2, name: 'Project 2', description: 'Description 2' }
];
let tasks = [
  { id: 1, projectId: 1, title: 'Task 1', status: 'pending' },
  { id: 2, projectId: 1, title: 'Task 2', status: 'completed' }
];

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Data from backend', data: [1, 2, 3] });
});

app.post('/api/llm', (req, res) => {
  // Forward request to local Ollama HTTP API if available
  (async () => {
    try {
      const { model = 'llama2', systemPrompt = '', userPrompt = '', inputs = {} } = req.body || {};
      // Build a simple prompt combining system and user prompts
      const prompt = `${systemPrompt ? systemPrompt + '\n\n' : ''}${userPrompt || ''}`;

      // Ollama HTTP generate endpoint
      const ollamaUrl = 'http://localhost:11434/api/generate';

      const fetchRes = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt })
      });

      if (!fetchRes.ok) {
        // Fallback to mock response if Ollama returns an error
        const text = await fetchRes.text().catch(() => '');
        console.error('Ollama responded with non-OK status:', fetchRes.status, text);
        return res.json({ response: `Ollama error: ${fetchRes.status}` });
      }

      // Ollama may stream multiple JSON objects. Read full text and try to parse each
      const raw = await fetchRes.text().catch(() => '');
      let responseText = '';
      const partsParsed = [];
      const meta = {};
      if (raw) {
        const parts = raw.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
        for (const part of parts) {
          try {
            const obj = JSON.parse(part);
            partsParsed.push(obj);
            if (obj.response) responseText += obj.response;
            else if (obj.completion) responseText += obj.completion;
            else if (obj.text) responseText += obj.text;
            else if (typeof obj === 'string') responseText += obj;

            // collect metadata fields if present
            if (obj.done !== undefined) meta.done = obj.done;
            if (obj.done_reason) meta.done_reason = obj.done_reason;
            if (obj.total_duration !== undefined) meta.total_duration = obj.total_duration;
            if (obj.prompt_eval_count !== undefined) meta.prompt_eval_count = obj.prompt_eval_count;
            if (obj.eval_count !== undefined) meta.eval_count = obj.eval_count;
          } catch (e) {
            // ignore unparseable chunks
          }
        }
      }

      if (!responseText) responseText = 'Ollama returned an empty response';
      return res.json({
        response: responseText,
        done: meta.done ?? false,
        done_reason: meta.done_reason ?? null,
        total_duration: meta.total_duration ?? null,
        prompt_eval_count: meta.prompt_eval_count ?? null,
        eval_count: meta.eval_count ?? null,
        parts: partsParsed,
      });
    } catch (err) {
      console.error('Error forwarding to Ollama:', err && err.message ? err.message : err);
      // If any error occurs, fall back to the previous mock reply
      return res.json({ response: 'Hello! This is a mock response since Ollama is not running.' });
    }
  })();
});

// Support legacy or proxied routes that may strip the /api prefix
// Support legacy or proxied routes that may strip the /api prefix - forward to Ollama as well
app.post('/llm', (req, res) => {
  (async () => {
    try {
      const { model = 'llama2', systemPrompt = '', userPrompt = '', inputs = {} } = req.body || {};
      const prompt = `${systemPrompt ? systemPrompt + '\n\n' : ''}${userPrompt || ''}`;
      const ollamaUrl = 'http://localhost:11434/api/generate';

      const fetchRes = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt })
      });

      if (!fetchRes.ok) {
        const text = await fetchRes.text().catch(() => '');
        console.error('Ollama responded with non-OK status (legacy /llm):', fetchRes.status, text);
        return res.json({ response: `Ollama error: ${fetchRes.status}` });
      }

      const raw = await fetchRes.text().catch(() => '');
      let responseText = '';
      const partsParsed = [];
      const meta = {};
      if (raw) {
        const parts = raw.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
        for (const part of parts) {
          try {
            const obj = JSON.parse(part);
            partsParsed.push(obj);
            if (obj.response) responseText += obj.response;
            else if (obj.completion) responseText += obj.completion;
            else if (obj.text) responseText += obj.text;

            if (obj.done !== undefined) meta.done = obj.done;
            if (obj.done_reason) meta.done_reason = obj.done_reason;
            if (obj.total_duration !== undefined) meta.total_duration = obj.total_duration;
            if (obj.prompt_eval_count !== undefined) meta.prompt_eval_count = obj.prompt_eval_count;
            if (obj.eval_count !== undefined) meta.eval_count = obj.eval_count;
          } catch (e) {
            // ignore
          }
        }
      }

      if (!responseText) responseText = 'Ollama returned an empty response';
      return res.json({
        response: responseText,
        done: meta.done ?? false,
        done_reason: meta.done_reason ?? null,
        total_duration: meta.total_duration ?? null,
        prompt_eval_count: meta.prompt_eval_count ?? null,
        eval_count: meta.eval_count ?? null,
        parts: partsParsed,
      });
    } catch (err) {
      console.error('Error forwarding legacy /llm to Ollama:', err && err.message ? err.message : err);
      return res.json({ response: 'Hello! This is a mock response since Ollama is not running.' });
    }
  })();
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  const user = { id: users.length + 1, email, password };
  users.push(user);
  res.json({ user: { id: user.id, email: user.email }, accessToken: 'mock-token', refreshToken: 'mock-refresh' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ user: { id: user.id, email: user.email }, accessToken: 'mock-token', refreshToken: 'mock-refresh' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({ accessToken: 'mock-token' });
});

app.get('/api/auth/me', (req, res) => {
  // Mock user
  res.json({ user: { id: 1, email: 'user@example.com' } });
});

// Projects routes
app.get('/api/projects', (req, res) => {
  res.json({ projects });
});

app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;
  const project = { id: projects.length + 1, name, description };
  projects.push(project);
  res.json(project);
});

// Tasks routes
app.get('/api/tasks', (req, res) => {
  res.json({ tasks });
});

app.post('/api/tasks', (req, res) => {
  const { projectId, title } = req.body;
  const task = { id: tasks.length + 1, projectId, title, status: 'pending' };
  tasks.push(task);
  res.json(task);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
