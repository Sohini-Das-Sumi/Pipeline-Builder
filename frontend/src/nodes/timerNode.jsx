import { useRef, useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext';

export const TimerNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);
  const timerRef = useRef(null);
  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;
  const nodeData = { ...data, nodeType: 'timer' };

  // Timer state for stopwatch
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Handle delay change
  const handleDelayChange = (e) => {
    const newDelay = parseInt(e.target.value, 10);
    updateNodeField(id, 'delay', newDelay);
  };

  // Handle unit change
  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    updateNodeField(id, 'unit', newUnit);
  };

  // Handle timer mode change
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    updateNodeField(id, 'timerMode', newMode);
  };

  // Handle repeat count change
  const handleRepeatCountChange = (e) => {
    const newCount = parseInt(e.target.value, 10);
    updateNodeField(id, 'repeatCount', newCount);
  };

  // Handle pass-through toggle
  const handlePassThroughChange = (e) => {
    updateNodeField(id, 'passThrough', e.target.checked);
  };

  // Handle output format change
  const handleOutputFormatChange = (e) => {
    const newFormat = e.target.value;
    updateNodeField(id, 'outputFormat', newFormat);
  };

  // Handle auto-start toggle
  const handleAutoStartChange = (e) => {
    updateNodeField(id, 'autoStart', e.target.checked);
  };

  // Handle custom label change
  const handleLabelChange = (e) => {
    const newLabel = e.target.value;
    updateNodeField(id, 'customLabel', newLabel);
  };

  // Handle custom message change
  const handleCustomMessageChange = (e) => {
    const newMessage = e.target.value;
    updateNodeField(id, 'customMessage', newMessage);
  };

  // Handle stopwatch controls
  const handleStartStopwatch = (e) => {
    e.stopPropagation();
    if (!timerRunning) {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 100);
      }, 100);
      updateNodeField(id, 'stopwatchRunning', true);
      updateNodeField(id, 'stopwatchStartTime', Date.now());
    }
  };

  const handleStopStopwatch = (e) => {
    e.stopPropagation();
    if (timerRunning) {
      setTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      updateNodeField(id, 'stopwatchRunning', false);
      updateNodeField(id, 'stopwatchElapsed', elapsedTime);
    }
  };

  const handleResetStopwatch = (e) => {
    e.stopPropagation();
    setTimerRunning(false);
    setElapsedTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    updateNodeField(id, 'stopwatchRunning', false);
    updateNodeField(id, 'stopwatchElapsed', 0);
    updateNodeField(id, 'stopwatchStartTime', null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Sync stopwatch state with data
  useEffect(() => {
    if (data?.stopwatchElapsed) {
      setElapsedTime(data.stopwatchElapsed);
    }
    if (data?.stopwatchRunning) {
      setTimerRunning(true);
    }
  }, [data?.stopwatchElapsed, data?.stopwatchRunning]);

  const handles = [
    { type: 'source', id: 'timeout' },
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  // Get display label
  const displayLabel = data?.customLabel || 'Timer';

  // Format elapsed time for display
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <BaseNode
      id={id}
      title={`⏱️ ${displayLabel}`}
      handles={handles}
      onClose={() => deleteNode(id)}
      className={`transition-all duration-500 ${isSelected ? 'transform scale-105' : ''}`}
      isSelected={isSelected}
      isDisplayOpen={isDisplayOpen}
      updateNodeField={updateNodeField}
      nodeKey={`${id}-${isDisplayOpen}`}
      data={nodeData}
    >
      {isDisplayOpen ? (
        <div className="space-y-3 p-3 min-h-[400px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Timer Configuration</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateNodeField(id, 'isDisplayOpen', false);
              }}
              className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-slate-600 transition-colors text-xs"
            >
              ×
            </button>
          </div>

          {/* Custom Label */}
          <div>
            <label htmlFor={`${id}-customLabel`} className="block text-xs font-medium text-slate-300 mb-1">Custom Label</label>
            <input
              id={`${id}-customLabel`}
              type="text"
              value={data?.customLabel || ''}
              onChange={handleLabelChange}
              className="node-input-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter custom label"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Timer Mode */}
          <div>
            <label htmlFor={`${id}-timerMode`} className="block text-xs font-medium text-slate-300 mb-1">Timer Mode</label>
            <select
              id={`${id}-timerMode`}
              value={data?.timerMode || 'timeout'}
              onChange={handleModeChange}
              className="node-select-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="timeout">⏰ Timeout (Once)</option>
              <option value="interval">🔄 Interval (Repeating)</option>
              <option value="stopwatch">⏱️ Stopwatch</option>
            </select>
          </div>

          {/* Stopwatch Controls */}
          {data?.timerMode === 'stopwatch' && (
            <div className="border border-slate-600 rounded-lg p-3 space-y-2">
              <div className="text-center">
                <div className="text-2xl font-mono text-green-400">{formatTime(elapsedTime)}</div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleStartStopwatch}
                  disabled={timerRunning}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    timerRunning 
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  ▶ Start
                </button>
                <button
                  onClick={handleStopStopwatch}
                  disabled={!timerRunning}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    !timerRunning 
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  ⏹ Stop
                </button>
                <button
                  onClick={handleResetStopwatch}
                  className="px-3 py-1 rounded text-xs font-medium bg-slate-600 hover:bg-slate-500 text-white"
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          )}

          {/* Delay and Unit (for timeout and interval modes) */}
          {data?.timerMode !== 'stopwatch' && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor={`${id}-delay`} className="block text-xs font-medium text-slate-300 mb-1">Delay</label>
                  <input
                    id={`${id}-delay`}
                    type="number"
                    value={data?.delay || 1000}
                    onChange={handleDelayChange}
                    className="node-input-style focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    placeholder="Enter delay"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="w-24">
                  <label htmlFor={`${id}-unit`} className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <select
                    id={`${id}-unit`}
                    value={data?.unit || 'ms'}
                    onChange={handleUnitChange}
                    className="node-select-style focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="ms">ms</option>
                    <option value="s">Seconds</option>
                    <option value="m">Minutes</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Repeat Count (for interval mode) */}
          {data?.timerMode === 'interval' && (
            <div>
              <label htmlFor={`${id}-repeatCount`} className="block text-xs font-medium text-slate-300 mb-1">Repeat Count</label>
              <input
                id={`${id}-repeatCount`}
                type="number"
                min="1"
                value={data?.repeatCount || 1}
                onChange={handleRepeatCountChange}
                className="node-input-style focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Number of repeats"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-xs text-slate-400">Set to 0 for infinite</span>
            </div>
          )}

          {/* Pass-through Input */}
          <div className="flex items-center gap-2">
            <input
              id={`${id}-passThrough`}
              type="checkbox"
              checked={data?.passThrough || false}
              onChange={handlePassThroughChange}
              className="w-4 h-4 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={`${id}-passThrough`} className="text-xs font-medium text-slate-300">
              🔗 Pass Input to Output
            </label>
          </div>

          {/* Output Format */}
          <div>
            <label htmlFor={`${id}-outputFormat`} className="block text-xs font-medium text-slate-300 mb-1">Output Format</label>
            <select
              id={`${id}-outputFormat`}
              value={data?.outputFormat || 'timestamp'}
              onChange={handleOutputFormatChange}
              className="node-select-style focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="timestamp">🕐 Timestamp</option>
              <option value="countdown">⏳ Countdown</option>
              <option value="passthrough">📤 Pass Input</option>
              <option value="message">💬 Custom Message</option>
              <option value="elapsed">⏱️ Elapsed Time (ms)</option>
            </select>
          </div>

          {/* Custom Message (when output format is message) */}
          {data?.outputFormat === 'message' && (
            <div>
              <label htmlFor={`${id}-customMessage`} className="block text-xs font-medium text-slate-300 mb-1">Custom Message</label>
              <input
                id={`${id}-customMessage`}
                type="text"
                value={data?.customMessage || 'Timer completed!'}
                onChange={handleCustomMessageChange}
                className="node-input-style focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter custom message"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Auto-start Toggle */}
          <div className="flex items-center gap-2">
            <input
              id={`${id}-autoStart`}
              type="checkbox"
              checked={data?.autoStart !== false}
              onChange={handleAutoStartChange}
              className="w-4 h-4 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={`${id}-autoStart`} className="text-xs font-medium text-slate-300">
              🚀 Auto-start on Pipeline Run
            </label>
          </div>

          {/* Preview */}
          <div className="border-t border-slate-600 pt-2 mt-2">
            <div className="text-xs text-slate-400">
              <span className="font-medium">Preview:</span> {data?.timerMode === 'stopwatch' 
                ? 'Stopwatch mode - manual control' 
                : `${data?.delay || 1000} ${data?.unit || 'ms'} ${data?.timerMode || 'timeout'}`
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="node-closed-text">
          {data?.timerMode === 'stopwatch' 
            ? `Stopwatch: ${formatTime(elapsedTime)}`
            : `${data?.delay || 1000}${data?.unit || 'ms'} ${data?.timerMode || 'timeout'}`
          }
        </div>
      )}
    </BaseNode>
  );
};
