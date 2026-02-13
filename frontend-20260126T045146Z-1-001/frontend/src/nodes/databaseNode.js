// databaseNode.js
import { useState, useEffect, useRef } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';
import { useFilterComponent } from './FilterComponent';

export const DatabaseNode = ({ id, data, selected }) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const isSelected = selected || selectedNodesStore.includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;

  // Removed auto-opening on selection - displays stay closed by default



  const { filterUI } = useFilterComponent({ id, data, updateNodeField });



  const handleConnectionChange = (e) => {
    updateNodeField(id, 'connectionString', e.target.value);
  };

  const handleQueryChange = (e) => {
    updateNodeField(id, 'query', e.target.value);
  };

  const handleExecuteQuery = async () => {
    const query = data?.query || '';
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_string: data?.connectionString || 'sqlite:///example.db',
          query: query,
        }),
      });
      if (response.ok) {
        const resData = await response.json();
        const formattedResults = JSON.stringify(resData.data, null, 2);
        updateNodeField(id, 'results', formattedResults);
      } else {
        let errorMessage;
        try {
          const errorText = await response.text();
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'Backend server is not running or not reachable. Please start the backend server.';
          } else {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = `Error: ${errorData.detail || errorText}`;
            } catch (e) {
              errorMessage = `Error: ${errorText}`;
            }
          }
        } catch (e) {
          errorMessage = 'Unknown error';
        }
        updateNodeField(id, 'results', errorMessage);
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        updateNodeField(id, 'results', 'Backend server is not running or not reachable. Please start the backend server.');
      } else {
        updateNodeField(id, 'results', `Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    marginLeft: 6,
    width: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  };

  const handles = [
    { type: 'target', id: 'query' },
    { type: 'source', id: 'result' },
  ];

  return (
    <BaseNode id={id} title="🗄️ Database" handles={handles} onClose={() => deleteNode(id)} className={`transition-transform duration-300 ${isSelected ? 'transform scale-105' : ''}`} isSelected={isSelected} isDisplayOpen={isDisplayOpen}>
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 max-w-xl min-h-[300px]">
          <div>
            <label htmlFor={`${id}-connectionString`} className="block text-xs font-medium text-slate-300 mb-1">Connection String</label>
            <input
              id={`${id}-connectionString`}
              type="text"
              value={data?.connectionString || ''}
              onChange={handleConnectionChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter connection string"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-query`} className="block text-xs font-medium text-slate-300 mb-1">Query</label>
            <textarea
              id={`${id}-query`}
              value={data?.query || ''}
              onChange={handleQueryChange}
              rows={2}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Enter SQL query"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleExecuteQuery(); }}
            disabled={isLoading}
            className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {isLoading ? 'Executing...' : 'Execute Query'}
          </button>
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
