// Test script to execute pipeline and check LLM output display
const { exec } = require('child_process');

console.log('Testing pipeline execution...');

// Simulate clicking the execute button by making a request to the backend
exec('curl -X POST http://localhost:8003/api/llm -H "Content-Type: application/json" -d \'{"model":"llama2","systemPrompt":"","userPrompt":"Hello, test message","inputs":[]}\'', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log('Backend LLM API response:');
  console.log(stdout);

  // Check if response contains expected output
  if (stdout.includes('response')) {
    console.log('✓ Backend API is working correctly');
  } else {
    console.log('✗ Backend API response unexpected');
  }
});

console.log('Test completed. Check frontend at http://localhost:3000 to verify output node displays LLM response.');
