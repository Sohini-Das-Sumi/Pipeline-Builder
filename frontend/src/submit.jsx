// submit.js

import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';

export const SubmitButton = () => {
    const nodes = useStore(state => state.nodes);
    const edges = useStore(state => state.edges);
    const selectedNodes = useStore(state => state.selectedNodes);
    const executePipeline = useStore(state => state.executePipeline);
    const updateNodeField = useStore((state) => state.updateNodeField);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [isClicked, setIsClicked] = useState(false);

    const hasInputNodeSelected = selectedNodes.some(id => nodes.find(node => node.id === id && node.type === 'customInput'));

    const handleSubmit = async (e) => {
        console.log('SubmitButton handleSubmit called');
        e?.preventDefault?.();
        if (loading) return;
        setLoading(true);
        setResult(null);
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 150); // Reset animation after 150ms

        try {
            console.log('Calling executePipeline with inputValue:', inputValue);
            console.log('Available nodes:', nodes.map(n => ({ id: n.id, type: n.type })));
            console.log('Available edges:', edges);

            // Call the /pipelines/parse endpoint to get pipeline info
            try {
                const parseResponse = await fetch('/pipelines/parse', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nodes, edges }),
                });
                const parseData = await parseResponse.json();
                console.log('Pipeline parse response:', parseData);
                
                // Show alert with the pipeline info
                const isDagText = parseData.is_dag ? 'Yes' : 'No';
                alert(`Pipeline Analysis:\n\nNodes: ${parseData.num_nodes}\nEdges: ${parseData.num_edges}\nIs DAG: ${isDagText}`);
            } catch (parseError) {
                console.error('Error parsing pipeline:', parseError);
            }

            // Execute the pipeline locally
            const result = await executePipeline(inputValue);
            console.log('executePipeline completed with result:', result);
            setResult({ ok: true, message: 'Pipeline executed successfully' });
        } catch (err) {
            console.error('Pipeline execution error', err);
            setResult({ ok: false, error: err.message });
        } finally {
            setLoading(false);
        }
    };
    return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            {hasInputNodeSelected && (
                <input
                    type="text"
                    id="pipeline-input"
                    name="pipelineInput"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter input"
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
            )}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border border-white/20 text-white text-sm font-medium transition-all shadow-lg transform ${
                    isClicked ? 'scale-110 shadow-xl' : 'scale-100 hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {loading ? 'Executing…' : 'Execute Pipeline'}
            </button>
            {result && (
                <span className={`text-sm font-medium ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
                    {result.ok ? result.message : `Error: ${result.error}`}
                </span>
            )}
        </div>
    );
};
