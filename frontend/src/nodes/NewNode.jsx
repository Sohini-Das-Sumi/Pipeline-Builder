// NewNode.js

import { useState, useEffect } from 'react';
import { BaseNode } from 'nodes/BaseNode';
import { useStore } from 'store';
import { useFilterComponent } from 'nodes/FilterComponent';

export const NewNode = ({ id, data, selected }) => {
  const [content, setContent] = useState(data?.content || '');
  const [isAnimating, setIsAnimating] = useState(data?.isAnimating || false);
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectNode = useStore((state) => state.selectNode);
  const isSelected = data?.selected || false;

  const { filterUI } = useFilterComponent({ id, data, updateNodeField });

  // Handle animation end
  useEffect(() => {
    if (data?.isAnimating) {
      setTimeout(() => {
        setIsAnimating(false);
        updateNodeField(id, 'isAnimating', false);
        updateNodeField(id, 'isVisible', true);
      }, 600);
    }
  }, [data?.isAnimating, id, updateNodeField]);

  const handleNodeClick = () => {
    selectNode(id);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateNodeField(id, 'content', newContent);
  };

  // Sync state with data changes
  useEffect(() => {
    setContent(data?.content || '');
  }, [data?.content, id]);

  const textareaStyle = {
    marginLeft: 6,
    width: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
    background: 'linear-gradient(45deg, #ffecd2, #fcb69f)',
    border: 'none',
    borderRadius: '8px',
    color: '#333',
    fontSize: '12px',
    resize: 'vertical',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  };

  const handles = [
    { type: 'target', id: 'input' },
    { type: 'source', id: 'output' },
  ];

  if (!data?.isVisible) {
    return null;
  }

  return (
    <BaseNode id={id} title="🆕 New" handles={handles} onClick={handleNodeClick} onClose={() => deleteNode(id)} className={`${isSelected ? 'transform scale-105 transition-all duration-500' : ''}`} data={data}>
      <div className={`node-font-size-12 ${(data?.isVisible && !data?.isAnimating) ? 'transform scale-y-100 opacity-100 transition-all duration-500 origin-top' : 'transform scale-y-0 opacity-0 transition-all duration-500 origin-top'}`}>
        <label className="node-display-block">
          <label htmlFor={`${id}-content`}>Content:</label>
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Enter your content here..."
            className="node-textarea-style"
            rows={4}
            onClick={(e) => e.stopPropagation()}
          />
        </label>
        {filterUI}
      </div>
      {!isSelected && (
        <div className="node-text-center-padding">
          Click to edit content
        </div>
      )}
    </BaseNode>
  );
};
