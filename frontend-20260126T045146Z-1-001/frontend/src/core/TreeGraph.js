// core/TreeGraph.js - Hierarchical organization of application components
export class TreeNode {
  constructor(id, type, data = {}) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.children = new Map();
    this.parent = null;
  }

  addChild(child) {
    if (child instanceof TreeNode) {
      child.parent = this;
      this.children.set(child.id, child);
    }
    return this;
  }

  removeChild(childId) {
    const child = this.children.get(childId);
    if (child) {
      child.parent = null;
      this.children.delete(childId);
    }
    return this;
  }

  getChild(childId) {
    return this.children.get(childId);
  }

  getChildren() {
    return Array.from(this.children.values());
  }

  getPath() {
    const path = [];
    let current = this;
    while (current) {
      path.unshift(current.id);
      current = current.parent;
    }
    return path;
  }

  find(predicate) {
    if (predicate(this)) {
      return this;
    }
    for (const child of this.children.values()) {
      const found = child.find(predicate);
      if (found) return found;
    }
    return null;
  }

  traverse(callback) {
    callback(this);
    for (const child of this.children.values()) {
      child.traverse(callback);
    }
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      children: Array.from(this.children.values()).map(child => child.toJSON())
    };
  }
}

export class TreeGraph {
  constructor(rootId = 'root') {
    this.root = new TreeNode(rootId, 'root');
    this.nodeMap = new Map();
    this.nodeMap.set(rootId, this.root);
  }

  addNode(parentId, node) {
    const parent = this.nodeMap.get(parentId);
    if (parent && node instanceof TreeNode) {
      parent.addChild(node);
      this.nodeMap.set(node.id, node);
      this._updateHierarchy(node);
    }
    return this;
  }

  removeNode(nodeId) {
    const node = this.nodeMap.get(nodeId);
    if (node && node.parent) {
      node.parent.removeChild(nodeId);
      this.nodeMap.delete(nodeId);
      // Remove all descendants
      node.traverse(descendant => {
        this.nodeMap.delete(descendant.id);
      });
    }
    return this;
  }

  getNode(nodeId) {
    return this.nodeMap.get(nodeId);
  }

  findNode(predicate) {
    return this.root.find(predicate);
  }

  getNodesByType(type) {
    const nodes = [];
    this.root.traverse(node => {
      if (node.type === type) {
        nodes.push(node);
      }
    });
    return nodes;
  }

  getPathToNode(nodeId) {
    const node = this.nodeMap.get(nodeId);
    return node ? node.getPath() : [];
  }

  moveNode(nodeId, newParentId) {
    const node = this.nodeMap.get(nodeId);
    const newParent = this.nodeMap.get(newParentId);

    if (node && newParent && node.parent) {
      node.parent.removeChild(nodeId);
      newParent.addChild(node);
      this._updateHierarchy(node);
    }
    return this;
  }

  _updateHierarchy(node) {
    // Update hierarchy levels and paths
    node.traverse(descendant => {
      descendant.data.level = descendant.getPath().length - 1;
      descendant.data.path = descendant.getPath();
    });
  }

  traverse(callback) {
    this.root.traverse(callback);
  }

  toJSON() {
    return this.root.toJSON();
  }

  static fromJSON(data) {
    const graph = new TreeGraph(data.id);
    graph.root.data = data.data || {};

    const buildTree = (parent, childrenData) => {
      childrenData.forEach(childData => {
        const child = new TreeNode(childData.id, childData.type, childData.data);
        parent.addChild(child);
        graph.nodeMap.set(child.id, child);
        if (childData.children && childData.children.length > 0) {
          buildTree(child, childData.children);
        }
      });
    };

    if (data.children && data.children.length > 0) {
      buildTree(graph.root, data.children);
    }

    return graph;
  }
}

// Application Component Tree
export class ApplicationTree extends TreeGraph {
  constructor() {
    super('application');
    this.initializeComponentTree();
  }

  initializeComponentTree() {
    // Core systems
    const coreNode = new TreeNode('core', 'system', { description: 'Core application systems' });
    this.addNode('application', coreNode);

    // State management
    const stateNode = new TreeNode('state', 'system', { description: 'State management system' });
    this.addNode('core', stateNode);

    // Pipeline system
    const pipelineNode = new TreeNode('pipeline', 'system', { description: 'Pipeline execution engine' });
    this.addNode('core', pipelineNode);

    // Node system
    const nodeSystemNode = new TreeNode('nodes', 'system', { description: 'Node management system' });
    this.addNode('core', nodeSystemNode);

    // UI Components
    const uiNode = new TreeNode('ui', 'system', { description: 'User interface components' });
    this.addNode('application', uiNode);

    // Node types
    const nodeTypes = ['input', 'llm', 'output', 'filter', 'image', 'text', 'database', 'note', 'timer'];
    nodeTypes.forEach(type => {
      const nodeTypeNode = new TreeNode(`${type}Node`, 'component', {
        description: `${type} node component`,
        category: 'node'
      });
      this.addNode('nodes', nodeTypeNode);
    });

    // Utility components
    const utilsNode = new TreeNode('utils', 'system', { description: 'Utility functions and helpers' });
    this.addNode('application', utilsNode);
  }

  getComponentPath(componentId) {
    return this.getPathToNode(componentId);
  }

  getComponentsByCategory(category) {
    return this.getNodesByType('component').filter(node => node.data.category === category);
  }

  getSystems() {
    return this.getNodesByType('system');
  }

  registerComponent(parentId, componentId, componentType, metadata = {}) {
    const componentNode = new TreeNode(componentId, componentType, metadata);
    this.addNode(parentId, componentNode);
    return componentNode;
  }

  getDependencies(componentId) {
    const component = this.getNode(componentId);
    if (!component) return [];

    const dependencies = [];
    component.traverse(node => {
      if (node.data.dependencies) {
        dependencies.push(...node.data.dependencies);
      }
    });

    return [...new Set(dependencies)]; // Remove duplicates
  }
}

// Create singleton instance
export const applicationTree = new ApplicationTree();
