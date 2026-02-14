import React, { useState } from 'react';
import { getCustomNodes } from './nodes/CustomNodeLibrary';
import { useStore } from './StoreContext.jsx';


// Function to get text color class based on theme
const getTextColorClass = (theme) => {
  return theme === 'light' ? 'text-gray-800' : 'text-white';
};

// Function to map hex color to Tailwind background class
const getTailwindBgClass = (color) => {
  const colorMap = {
    '#3b82f6': 'bg-blue-500', // Calculator blue
    '#10b981': 'bg-emerald-500',
    '#f59e0b': 'bg-amber-500',
    '#ef4444': 'bg-red-500',
    '#8b5cf6': 'bg-violet-500',
    '#06b6d4': 'bg-cyan-500',
    '#84cc16': 'bg-lime-500',
    '#f97316': 'bg-orange-500',
    '#ec4899': 'bg-pink-500',
    '#6b7280': 'bg-gray-500',
  };
  return colorMap[color] || 'bg-gray-500'; // Default fallback
};

export const PipelineToolbar = ({ onNodeSelect, onCustomNodeCreated }) => {
  const [customNodes, setCustomNodes] = useState(getCustomNodes());
  const theme = useStore((state) => state.theme);
  const clearAllNodes = useStore((state) => state.clearAllNodes);
  const textColorClass = getTextColorClass(theme);

  const handleCloseAll = () => {
    if (clearAllNodes) {
      clearAllNodes();
    }
  };



  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (event, nodeType) => {
    if (onNodeSelect) {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      onNodeSelect(nodeType, buttonRect);
    }
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4 p-3 backdrop-blur-md rounded-2xl shadow-2xl border z-60 toolbar-container">
      <div
        className="w-4 h-4 rounded-full bg-green-400 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'customInput')}
        onClick={(event) => handleNodeClick(event, 'customInput')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          Input
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-cyan-400 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'text')}
        onClick={(event) => handleNodeClick(event, 'text')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          Text
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'llm')}
        onClick={(event) => handleNodeClick(event, 'llm')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          LLM
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-red-500 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'customOutput')}
        onClick={(event) => handleNodeClick(event, 'customOutput')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          Output
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-yellow-400 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'note')}
        onClick={(event) => handleNodeClick(event, 'note')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          Note
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-pink-400 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'filter')}
        onClick={(event) => handleNodeClick(event, 'filter')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          Filter
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-teal-400 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'database')}
        onClick={(event) => handleNodeClick(event, 'database')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-teal-400"></div>
          Database
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'image')}
        onClick={(event) => handleNodeClick(event, 'image')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          Image
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-slate-400 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'timer')}
        onClick={(event) => handleNodeClick(event, 'timer')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          Timer
        </span>
      </div>

      <div
        className="w-4 h-4 rounded-full bg-purple-500 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300"
        onDragStart={(event) => onDragStart(event, 'customNodeManager')}
        onClick={(event) => handleNodeClick(event, 'customNodeManager')}
        draggable
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          Node Manager
        </span>
      </div>

      {/* Close All Button */}
      <div
        className="w-4 h-4 rounded-full bg-gray-500 ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-300"
        onClick={handleCloseAll}
        title="Close all nodes"
      >
        <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          Close All
        </span>
      </div>

      {/* Custom Nodes */}
      {customNodes.map((customNode) => (

        <div
          key={customNode.id}
          className={`w-4 h-4 rounded-full ring-2 ring-gray-400/20 ring-offset-2 ring-offset-transparent hover:w-auto hover:px-4 hover:py-2 hover:rounded-xl hover:bg-white/10 hover:border hover:border-white/10 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all duration-300 ${getTailwindBgClass(customNode.color)}`}
          onDragStart={(event) => onDragStart(event, customNode.id)}
          onClick={(event) => handleNodeClick(event, customNode.id)}
          draggable
        >
          <span className={`${textColorClass} text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${getTailwindBgClass(customNode.color)}`}></div>
            {customNode.title}
          </span>
        </div>
      ))}
    </div>
  );
};
