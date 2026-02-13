// Debug script to test pipeline execution and check data flow
const { exec } = require('child_process');

console.log('=== Pipeline Debug Test ===');

// Test 1: Check if backend is responding
console.log('\n1. Testing backend API...');
exec('curl -X POST http://localhost:8003/api/llm -H "Content-Type: application/json" -d \'{"model":"llama2","systemPrompt":"","userPrompt":"Test message","inputs":[]}\'', (error, stdout, stderr) => {
  console.log('Backend response:', stdout);
  if (stdout.includes('response')) {
    console.log('✓ Backend API working');
  } else {
    console.log('✗ Backend API not responding properly');
  }

  // Test 2: Check if frontend is accessible
  console.log('\n2. Testing frontend accessibility...');
  exec('curl -s http://localhost:3000 | head -20', (error, stdout, stderr) => {
    if (stdout.includes('html') || stdout.includes('React')) {
      console.log('✓ Frontend appears to be running');
    } else {
      console.log('✗ Frontend may not be running properly');
    }

    console.log('\n=== Debug Instructions ===');
    console.log('1. Open browser to http://localhost:3000');
    console.log('2. Check if default nodes (Input, LLM, Output) are present');
    console.log('3. Connect Input -> LLM -> Output if not connected');
    console.log('4. Click "Execute Pipeline" button');
    console.log('5. Check browser console (F12) for any errors');
    console.log('6. Check if LLM node shows output in its display');
    console.log('7. Check if Output node shows the LLM response');
    console.log('\nLook for console logs starting with:');
    console.log('- "LLMNode execute called"');
    console.log('- "Store executePipeline called"');
    console.log('- "processOutputs called"');
    console.log('- "Setting outputValue for"');
  });
});
