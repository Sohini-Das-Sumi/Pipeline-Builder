// core/Node.js - Simplified Node class hierarchy with reduced duplication

// Helper function to validate and sanitize position coordinates
const validatePosition = (position) => {
  if (!position || typeof position !== 'object') {
    return { x: 0, y: 0 };
  }
  const x = typeof position.x === 'number' && !isNaN(position.x) && isFinite(position.x) ? position.x : 0;
  const y = typeof position.y === 'number' && !isNaN(position.y) && isFinite(position.y) ? position.y : 0;
  return { x, y };
};

export class Node {
  constructor(id, type, position, data = {}, selected = false) {
    this.id = id;
    this.type = type;
    this.position = validatePosition(position);
    this.data = { ...data };
    this.selectable = true;
    this.selected = selected;
  }

  updateField(fieldName, fieldValue) {
    this.data[fieldName] = fieldValue;
  }

  getField(fieldName) {
    return this.data[fieldName];
  }

  setSelected(selected) {
    this.selected = selected;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      position: {
        x: Math.round(this.position.x),
        y: Math.round(this.position.y)
      },
      data: { ...this.data },
      selectable: this.selectable,
      selected: this.selected
    };
  }

  // Abstract method - must be implemented by subclasses
  async execute(inputs = {}) {
    throw new Error('Execute method must be implemented by subclass');
  }
}

// Base class for API-based nodes with common error handling
export class ApiNode extends Node {
  async handleApiError(response) {
    try {
      const errorText = await response.text();
      if (errorText.includes('<!DOCTYPE')) {
        return 'Backend server is not running or not reachable. Please start the backend server.';
      }
      try {
        const errorData = JSON.parse(errorText);
        return `Error: ${errorData.detail || errorText}`;
      } catch (e) {
        return `Error: ${errorText}`;
      }
    } catch (e) {
      return 'Unknown error';
    }
  }

  handleException(error) {
    if (error.name === 'AbortError') {
      return 'Error: Request timed out after 120 seconds';
    }
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      return 'Backend server is not running or not reachable. Please start the backend server.';
    }
    return `Error: ${error.message}`;
  }

  async makeApiCall(url, data, timeout = 60000) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true, data: await response.json() };
      } else {
        return { success: false, error: await this.handleApiError(response) };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      return { success: false, error: this.handleException(error) };
    }
  }
}


// Simplified Node Classes with minimal duplication
export class InputNode extends Node {
  async execute(inputs = {}) {
    let output = this.data.inputValue;
    if (this.data.isFilterEnabled && this.data.filterType !== 'none') {
      const operations = {
        contains: (data, filter) => data.includes(filter) ? data : '',
        equals: (data, filter) => data === filter ? data : '',
        startsWith: (data, filter) => data.startsWith(filter) ? data : '',
        endsWith: (data, filter) => data.endsWith(filter) ? data : '',
        greaterThan: (data, filter) => {
          const numData = parseFloat(data), numFilter = parseFloat(filter);
          return (!isNaN(numData) && !isNaN(numFilter) && numData > numFilter) ? data : '';
        },
        lessThan: (data, filter) => {
          const numData = parseFloat(data), numFilter = parseFloat(filter);
          return (!isNaN(numData) && !isNaN(numFilter) && numData < numFilter) ? data : '';
        },
        regex: (data, filter) => {
          try {
            return new RegExp(filter).test(data) ? data : '';
          } catch (e) {
            return `Error: Invalid regex - ${filter}`;
          }
        }
      };
      output = operations[this.data.filterType] ? operations[this.data.filterType](output, this.data.filterValue) : output;
    }
    this.updateField('output', output);
    return { output, inputValue: output };
  }
}

export class LLMNode extends ApiNode {
  async execute(inputs = {}) {
    console.log(`LLMNode execute called for node ${this.id}`);

    // Prioritize userPrompt from inputs, then fall back to node data
    const userPrompt = inputs.userPrompt || this.data.userPrompt || '';
    const systemPrompt = inputs.systemPrompt || this.data.systemPrompt || '';

    console.log(`LLMNode execute called with inputs:`, inputs);
    console.log(`LLMNode data:`, this.data);
    console.log(`LLMNode using userPrompt:`, userPrompt);

    // If no userPrompt, set a default one for testing
    const finalUserPrompt = userPrompt || 'Hello, can you respond with a simple greeting?';

    console.log(`LLMNode making API call to /api/llm with:`, {
      model: this.data.model || 'llama2',
      systemPrompt: systemPrompt,
      userPrompt: finalUserPrompt,
      inputs: inputs
    });

    let result;
    try {
      result = await this.makeApiCall('/api/llm', {
        model: this.data.model || 'llama2',
        systemPrompt: systemPrompt,
        userPrompt: finalUserPrompt,
        inputs: inputs
      }, 120000);
    } catch (error) {
      result = { success: false, error: this.handleException(error) };
    }

    console.log(`LLMNode API result:`, result);

    let output;
    if (result.success) {
      const response = result.data.response;
      const trimmedResponse = response ? String(response).trim() : '';
      output = trimmedResponse ? trimmedResponse : 'LLM returned an empty response';
      console.log(`LLMNode setting output to:`, output);
    } else {
      output = result.error;
      console.log(`LLMNode setting error output to:`, output);
    }

    console.log(`Before updateField - LLMNode data:`, this.data);
    this.updateField('output', output);
    this.updateField('_timestamp', Date.now());
    console.log(`After updateField - LLMNode data:`, this.data);
    console.log(`LLMNode execute completed, returning:`, { output });
    console.log(`LLMNode final output field:`, this.getField('output'));
    return { output };
  }
}

export class OutputNode extends Node {
  async execute(inputs = {}) {
    const outputValue = inputs.inputData || inputs.outputValue || this.data.outputValue || '';
    this.updateField('output', outputValue);
    return { outputValue };
  }
}

export class FilterNode extends Node {
  async execute(inputs = {}) {
    const inputData = inputs.inputData || inputs.output || inputs.inputValue || '';
    const { filterType, filterValue, isFilterEnabled } = this.data;

    // If filter is not enabled or filter type is 'none', pass through the input data
    if (!isFilterEnabled || filterType === 'none' || !inputData) {
      this.updateField('output', inputData);
      return { output: inputData };
    }

    let filteredOutput = '';

    if (inputData) {
      const operations = {
        contains: (data, filter) => data.includes(filter) ? data : '',
        equals: (data, filter) => data === filter ? data : '',
        startsWith: (data, filter) => data.startsWith(filter) ? data : '',
        endsWith: (data, filter) => data.endsWith(filter) ? data : '',
        greaterThan: (data, filter) => {
          const numData = parseFloat(data), numFilter = parseFloat(filter);
          return (!isNaN(numData) && !isNaN(numFilter) && numData > numFilter) ? data : '';
        },
        lessThan: (data, filter) => {
          const numData = parseFloat(data), numFilter = parseFloat(filter);
          return (!isNaN(numData) && !isNaN(numFilter) && numData < numFilter) ? data : '';
        },
        regex: (data, filter) => {
          try {
            return new RegExp(filter).test(data) ? data : '';
          } catch (e) {
            return `Error: Invalid regex - ${filter}`;
          }
        }
      };

      filteredOutput = operations[filterType] ?
        operations[filterType](inputData, filterValue) : inputData;
    }

    this.updateField('output', filteredOutput);
    return { output: filteredOutput };
  }
}

export class ImageNode extends ApiNode {
  async execute(inputs = {}) {
    const imageUrl = inputs.imageUrl || this.data.imageUrl || '';

    if (!imageUrl && !this.data.imageFile) {
      const error = 'Error: No image provided';
      this.updateField('output', error);
      return { output: error };
    }

    if (this.data.imageFile) {
      const error = 'Error: File upload not implemented in pipeline';
      this.updateField('output', error);
      return { output: error };
    }

    // Mock response since backend is not available
    const mockOutput = `Mock Image Analysis: URL ${imageUrl}, Match Type: ${this.data.matchType}, Threshold: ${this.data.threshold}`;
    this.updateField('output', mockOutput);
    return { output: mockOutput };
  }
}

// Helper function to parse variables from text content
const parseVariablesFromText = (text) => {
  if (!text) return [];
  const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
  const variables = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1];
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  return variables;
};

export class TextNode extends Node {
  async execute(inputs = {}) {
    let output = this.data.text || '';
    
    // Get variables from node data, OR parse from text if not available
    let variables = this.data.variables || [];
    if (variables.length === 0 && output) {
      variables = parseVariablesFromText(output);
    }
    
    if (variables.length > 0) {
      // For each variable, replace {{variableName}} with the input value
      for (const varName of variables) {
        // First, try to get value from variable-specific handle (var-{variableName})
        let varValue = inputs[`var-${varName}`];
        
        // If not found, try to get from main inputData (for connections to regular input handle)
        if (varValue === undefined || varValue === null) {
          varValue = inputs.inputData;
        }
        
        // If still not found, try outputValue
        if (varValue === undefined || varValue === null) {
          varValue = inputs.outputValue;
        }
        
        // Also try the raw inputValue (used by InputNode)
        if (varValue === undefined || varValue === null) {
          varValue = inputs.inputValue;
        }
        
        if (varValue !== undefined && varValue !== null) {
          const varPattern = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g');
          output = output.replace(varPattern, String(varValue));
        }
      }
    }
    
    // Apply filter if enabled
    if (this.data.isFilterEnabled && this.data.filterType !== 'none') {
      const operations = {
        contains: (data, filter) => data.includes(filter) ? data : '',
        equals: (data, filter) => data === filter ? data : '',
        startsWith: (data, filter) => data.startsWith(filter) ? data : '',
        endsWith: (data, filter) => data.endsWith(filter) ? data : '',
        greaterThan: (data, filter) => {
          const numData = parseFloat(data), numFilter = parseFloat(filter);
          return (!isNaN(numData) && !isNaN(numFilter) && numData > numFilter) ? data : '';
        },
        lessThan: (data, filter) => {
          const numData = parseFloat(data), numFilter = parseFloat(filter);
          return (!isNaN(numData) && !isNaN(numFilter) && numData < numFilter) ? data : '';
        },
        regex: (data, filter) => {
          try {
            return new RegExp(filter).test(data) ? data : '';
          } catch (e) {
            return `Error: Invalid regex - ${filter}`;
          }
        }
      };
      output = operations[this.data.filterType] ? operations[this.data.filterType](output, this.data.filterValue) : output;
    }
    
    this.updateField('output', output);
    return { output };
  }
}

export class DatabaseNode extends ApiNode {
  async execute(inputs = {}) {
    console.log(`DatabaseNode execute called for node ${this.id}`);
    
    // Get query from node data or inputs
    const query = this.data.query || '';
    const connectionString = this.data.connectionString || 'sqlite:///example.db';
    
    if (!query.trim()) {
      const error = 'Error: No query provided';
      this.updateField('output', error);
      return { output: error };
    }

    console.log(`DatabaseNode executing query:`, { connectionString, query });

    let result;
    try {
      result = await this.makeApiCall('/database/query', {
        connection_string: connectionString,
        query: query,
      }, 60000);
    } catch (error) {
      result = { success: false, error: this.handleException(error) };
    }

    console.log(`DatabaseNode API result:`, result);

    let output;
    if (result.success) {
      const formattedResults = JSON.stringify(result.data.data, null, 2);
      output = formattedResults;
      // Also store the results in the node data for the UI to display
      this.updateField('results', formattedResults);
      console.log(`DatabaseNode setting output to:`, output);
    } else {
      output = result.error;
      console.log(`DatabaseNode setting error output to:`, output);
    }

    this.updateField('output', output);
    this.updateField('_timestamp', Date.now());
    console.log(`DatabaseNode execute completed, returning:`, { output });
    return { output };
  }
}

export class NoteNode extends Node {
  async execute(inputs = {}) {
    return { output: this.data.note };
  }
}

export class TimerNode extends Node {
  async execute(inputs = {}) {
    const timerMode = this.data.timerMode || 'timeout';
    const delay = parseInt(this.data.delay, 10) || 1000;
    const unit = this.data.unit || 'ms';
    const repeatCount = parseInt(this.data.repeatCount, 10) || 1;
    const passThrough = this.data.passThrough || false;
    const outputFormat = this.data.outputFormat || 'timestamp';
    const customMessage = this.data.customMessage || 'Timer completed!';
    const autoStart = this.data.autoStart !== false;

    // Get input data for pass-through
    const inputData = inputs.inputData || inputs.outputValue || '';

    // Convert delay to milliseconds based on unit
    const getDelayInMs = () => {
      switch (unit) {
        case 's':
          return delay * 1000;
        case 'm':
          return delay * 60000;
        case 'ms':
        default:
          return delay;
      }
    };

    const delayInMs = getDelayInMs();

    // Handle different timer modes
    switch (timerMode) {
      case 'stopwatch':
        return this.executeStopwatch(outputFormat, customMessage, inputData, passThrough);
      
      case 'interval':
        return this.executeInterval(delayInMs, repeatCount, outputFormat, customMessage, inputData, passThrough);
      
      case 'timeout':
      default:
        return this.executeTimeout(delayInMs, outputFormat, customMessage, inputData, passThrough);
    }
  }

  // Execute timeout (single delay)
  executeTimeout(delayInMs, outputFormat, customMessage, inputData, passThrough) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const output = this.formatOutput(outputFormat, customMessage, delayInMs, inputData, passThrough);
        this.updateField('output', output);
        this.updateField('_timestamp', Date.now());
        resolve({ output, delay: delayInMs });
      }, delayInMs);
    });
  }

  // Execute interval (repeating)
  executeInterval(delayInMs, repeatCount, outputFormat, customMessage, inputData, passThrough) {
    return new Promise((resolve) => {
      let count = 0;
      const maxCount = repeatCount === 0 ? Infinity : repeatCount;
      const outputs = [];

      const executeTick = () => {
        count++;
        const output = this.formatOutput(outputFormat, customMessage, delayInMs, inputData, passThrough, count);
        outputs.push(output);
        this.updateField('output', output);
        this.updateField('_timestamp', Date.now());

        if (count < maxCount) {
          setTimeout(executeTick, delayInMs);
        } else {
          resolve({ output: outputs.join('\n'), outputs, count, delay: delayInMs });
        }
      };

      // Start first interval
      setTimeout(executeTick, delayInMs);
    });
  }

  // Execute stopwatch mode
  executeStopwatch(outputFormat, customMessage, inputData, passThrough) {
    // For stopwatch, we return the elapsed time from node data or current timestamp
    const elapsed = this.data.stopwatchElapsed || 0;
    const startTime = this.data.stopwatchStartTime || Date.now();
    const isRunning = this.data.stopwatchRunning || false;

    let output;
    if (isRunning) {
      // If stopwatch is running, calculate current elapsed time
      const currentElapsed = Date.now() - startTime;
      output = this.formatOutput(outputFormat, customMessage, currentElapsed, inputData, passThrough);
    } else {
      output = this.formatOutput(outputFormat, customMessage, elapsed, inputData, passThrough);
    }

    this.updateField('output', output);
    this.updateField('_timestamp', Date.now());
    return { output, elapsed: isRunning ? (Date.now() - startTime) : elapsed, isRunning };
  }

  // Format output based on selected format
  formatOutput(outputFormat, customMessage, timeValue, inputData, passThrough, count = null) {
    switch (outputFormat) {
      case 'countdown':
        return `Countdown: ${timeValue}ms${count ? ` (${count})` : ''}`;
      
      case 'passthrough':
        return passThrough ? inputData : 'No input to pass through';
      
      case 'message':
        return count 
          ? `${customMessage} (${count})` 
          : customMessage;
      
      case 'elapsed':
        return String(timeValue);
      
      case 'timestamp':
      default:
        return `Timestamp: ${Date.now()}, Delay: ${timeValue}ms${count ? `, Count: ${count}` : ''}`;
    }
  }
}

export class CalculatorNode extends Node {
  async execute(inputs = {}) {
    const input1 = parseFloat(inputs['input-0']) || 0;
    const input2 = parseFloat(inputs['input-1']) || 0;
    const operation = this.data.operation || 'add';

    let result;
    switch (operation) {
      case 'add':
        result = input1 + input2;
        break;
      case 'subtract':
        result = input1 - input2;
        break;
      case 'multiply':
        result = input1 * input2;
        break;
      case 'divide':
        result = input2 !== 0 ? input1 / input2 : 'Error: Division by zero';
        break;
      default:
        result = 'Error: Invalid operation';
    }

    this.updateField('result', result);
    return { output: result };
  }
}

// Node Factory - simplified with recursive instantiation
export class NodeFactory {
  static nodeConfigs = {
    'customInput': {
      class: InputNode,
      defaults: { inputName: 'input_', inputType: 'Text', inputValue: '', isAnimating: true, isVisible: true }
    },
    'llm': {
      class: LLMNode,
      defaults: { model: 'llama2', systemPrompt: '', userPrompt: '', output: '', isVisible: true }
    },
    'customOutput': {
      class: OutputNode,
      defaults: { outputName: 'output_', outputType: 'Text', outputValue: '', isVisible: true }
    },
    'filter': {
      class: FilterNode,
      defaults: { filterType: 'contains', filterValue: '', output: '', isVisible: true }
    },
    'image': {
      class: ImageNode,
      defaults: { imageUrl: '', imageFile: null, matchType: 'similar', threshold: 10, output: '', isVisible: true }
    },
    'text': {
      class: TextNode,
      defaults: { text: '', isVisible: true }
    },
    'database': {
      class: DatabaseNode,
      defaults: { query: '', results: '', isVisible: true }
    },
    'note': {
      class: NoteNode,
      defaults: { note: '', isVisible: true }
    },
    'timer': {
      class: TimerNode,
      defaults: { interval: '1000', isVisible: true }
    },
    'calculator': {
      class: CalculatorNode,
      defaults: { operation: 'add', result: 0, isVisible: true }
    }
  };

  static createNode(type, id, position, data = {}) {
    const typeStr = typeof type === 'string' ? type : 'default';
    const idStr = typeof id === 'string' ? id : String(id || 'default-1');
    const config = this.nodeConfigs[typeStr];
    if (config) {
      // Merge defaults with provided data
      const mergedData = { ...config.defaults, ...data };
      // Apply naming patterns recursively
      if (typeStr.includes('Output')) {
        mergedData.outputName = 'output_' + (parseInt(idStr.split('-')[1], 10) || 1);
      }
      return new config.class(idStr, typeStr, position, mergedData);
    }
    return new Node(idStr, typeStr, position, data);
  }
}
