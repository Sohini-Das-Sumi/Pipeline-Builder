// core/Pipeline.js - Manages the flow of nodes and edges in the pipeline
export class Pipeline {
  constructor(nodes = [], edges = []) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeMap = new Map();
    this.buildNodeMap();
  }

  // Build a map of node IDs to node objects for quick lookup
  buildNodeMap() {
    this.nodeMap.clear();
    this.nodes.forEach(node => {
      this.nodeMap.set(node.id, node);
    });
  }

  // Add a node to the pipeline
  addNode(node) {
    this.nodes.push(node);
    this.nodeMap.set(node.id, node);
  }

  // Remove a node from the pipeline
  removeNode(nodeId) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    this.nodeMap.delete(nodeId);
    // Remove edges connected to this node
    this.edges = this.edges.filter(edge =>
      edge.source !== nodeId && edge.target !== nodeId
    );
  }

  // Add an edge to the pipeline
  addEdge(edge) {
    this.edges.push(edge);
  }

  // Update a field on a specific node
  updateNodeField(nodeId, fieldName, fieldValue) {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      node.updateField(fieldName, fieldValue);
    }
  }

  // Get a node by its ID
  getNodeById(nodeId) {
    return this.nodeMap.get(nodeId);
  }

  // Get all nodes of a specific type
  getNodesByType(type) {
    return this.nodes.filter(node => node.type === type);
  }

  // Execute the pipeline with given input
  async execute(inputValue = '') {
    const results = [];

    // Build maps for quick lookup
    const nodeById = new Map();
    this.nodes.forEach(n => nodeById.set(n.id, n));

    const incoming = new Map();
    this.nodes.forEach(n => incoming.set(n.id, []));
    this.edges.forEach(e => {
      if (!incoming.has(e.target)) incoming.set(e.target, []);
      incoming.get(e.target).push(e);
    });

    const processed = new Set();
    const outputsByNode = new Map();

    // If there are no nodes, return immediately
    if (!this.nodes || this.nodes.length === 0) {
      return { outputs: [], success: true };
    }

    // We'll try to process nodes in passes. If a node has all its sources processed
    // (or has no incoming edges) it will be executed. This is a simple topological
    // execution that will stop if circular dependencies exist.
    let progress = true;
    while (processed.size < this.nodes.length && progress) {
      progress = false;
      for (const node of this.nodes) {
        if (processed.has(node.id)) continue;

        const inc = incoming.get(node.id) || [];

        // Determine if all source nodes for incoming edges have been processed
        const ready = inc.every(edge => processed.has(edge.source) || !nodeById.has(edge.source));

        if (ready) {
          // Build inputs object from incoming edges and fallback to pipeline inputValue
          const inputs = {};

          // If there are incoming edges, map their source outputs to target handles
          if (inc.length > 0) {
            for (const edge of inc) {
              const srcOut = outputsByNode.get(edge.source) || {};
              // Prefer source.output, then outputValue, then inputValue
              const srcVal = srcOut.output !== undefined ? srcOut.output : (srcOut.outputValue !== undefined ? srcOut.outputValue : srcOut.inputValue);
              const key = edge.targetHandle || edge.targetHandle === null ? edge.targetHandle : (edge.target || 'inputData');
              // If handle is falsy, default to 'inputData'
              const inputKey = key || 'inputData';
              inputs[inputKey] = srcVal;
            }
          } else {
            // No incoming edges - provide top-level inputValue under common keys
            inputs.inputData = inputValue;
            inputs.userPrompt = inputValue;
          }

          try {
            // Execute the node (may be async)
            // Some node implementations will ignore inputs if they use internal data
            // so passing the constructed inputs is safe.
            // eslint-disable-next-line no-await-in-loop
            const result = await node.execute(inputs || {});
            const normalized = result || {};
            outputsByNode.set(node.id, normalized);
            results.push({ nodeId: node.id, output: normalized.output, outputValue: normalized.outputValue });
          } catch (err) {
            // On error, store the error message as output so it surfaces in the UI
            const msg = err && err.message ? `Error: ${err.message}` : 'Execution error';
            outputsByNode.set(node.id, { output: msg });
            results.push({ nodeId: node.id, output: msg });
          }

          processed.add(node.id);
          progress = true;
        }
      }
    }

    // If we couldn't process all nodes (circular deps), mark remaining nodes with an error
    if (processed.size < this.nodes.length) {
      for (const node of this.nodes) {
        if (!processed.has(node.id)) {
          const errMsg = 'Error: Circular dependency or missing inputs';
          outputsByNode.set(node.id, { output: errMsg });
          results.push({ nodeId: node.id, output: errMsg });
        }
      }
    }

    return { outputs: results, success: true };
  }

  // Get all nodes as JSON
  getNodesJSON() {
    return this.nodes.map(node => node.toJSON ? node.toJSON() : node);
  }

  // Get all edges
  getEdges() {
    return [...this.edges];
  }
}
