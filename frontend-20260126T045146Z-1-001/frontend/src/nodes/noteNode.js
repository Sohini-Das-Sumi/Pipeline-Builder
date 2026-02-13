import { useEffect } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NoteNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || selectedNodesStore.includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;

  // Removed auto-opening on selection - displays stay closed by default

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    updateNodeField(id, 'note', newNote);
  };

  const textareaStyle = {
    width: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#334155',
    fontSize: '12px',
    resize: 'vertical',
    minHeight: '60px',
  };



  const handles = [{ type: 'source', id: 'output' }];

  return (
    <BaseNode
      id={id}
      title="📔 Note"
      handles={handles}
      onClose={() => deleteNode(id)}
      className={`transition-all duration-500 ${isSelected ? 'transform scale-105' : ''}`}
      isSelected={isSelected}
      isDisplayOpen={isDisplayOpen}
    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 max-w-xl min-h-[300px]">
          <div>
            <label htmlFor={`${id}-note`} className="block text-xs font-medium text-slate-300 mb-1">Note Content</label>
            <textarea
              id={`${id}-note`}
              value={data?.note || ''}
              onChange={(e) => updateNodeField(id, 'note', e.target.value)}
              rows={3}
              className="node-textarea-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your note"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '10px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          Click to configure
        </div>
      )}
    </BaseNode>
  );
};
