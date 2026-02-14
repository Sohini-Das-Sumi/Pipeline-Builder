// imageNode.js

import { useEffect, useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../StoreContext.jsx';
import { createWorker } from 'tesseract.js';

export const ImageNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const selectedNodesStore = useStore((state) => state.selectedNodes);

  const isSelected = selected || (selectedNodesStore || []).includes(id);
  const isDisplayOpen = data?.isDisplayOpen || false;
  const [recognitionResult, setRecognitionResult] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  const nodeData = { ...data, nodeType: 'image' };

  // Removed auto-opening on selection - displays stay closed by default

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        console.log('Data URL generated:', dataUrl.substring(0, 50) + '...');
        updateNodeField(id, 'imageUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('Invalid file type:', file?.type);
    }
  };

  const handleImageUrlChange = (e) => {
    const newImageUrl = e.target.value;
    updateNodeField(id, 'imageUrl', newImageUrl);
  };

  const handleAltTextChange = (e) => {
    const newAltText = e.target.value;
    updateNodeField(id, 'altText', newAltText);
  };

  const handleRecognizeImage = async () => {
    if (!data?.imageUrl) return;

    setIsRecognizing(true);
    try {
      // First, perform OCR
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(data.imageUrl);
      await worker.terminate();

      let combinedResult = {
        ocr_text: text,
        image_analysis: null,
        matches: [],
        analysis_summary: 'OCR completed successfully'
      };

      // Try to send to backend for analysis (optional)
      try {
        const response = await fetch('/image/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_data: data.imageUrl, // dataUrl from file or URL
            match_type: 'similar',
            threshold: 10.0
          }),
        });

        if (response.ok) {
          const analysisResult = await response.json();
          combinedResult.image_analysis = analysisResult.image_info;
          combinedResult.matches = analysisResult.matches || [];
          combinedResult.analysis_summary = analysisResult.analysis;
        }
      } catch (backendError) {
        console.warn('Backend analysis not available, using OCR only:', backendError.message);
      }

      const resultString = JSON.stringify(combinedResult, null, 2);
      setRecognitionResult(resultString);
      updateNodeField(id, 'recognitionResult', resultString);
    } catch (error) {
      console.error('Recognition failed:', error);
      setRecognitionResult(`Recognition failed: ${error.message}`);
    } finally {
      setIsRecognizing(false);
    }
  };

  const inputStyle = {
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
    { type: 'target', id: 'filter', position: Position.Top }
  ];

  return (
    <BaseNode
      id={id}
      title="🖼️ Image"
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
        <div className="space-y-3 p-3">
          <div>
            <label htmlFor={`${id}-imageFile`} className="block text-xs font-medium text-slate-300 mb-1">Upload Image File</label>
            <input
              id={`${id}-imageFile`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-imageUrl`} className="block text-xs font-medium text-slate-300 mb-1">Or Enter Image URL</label>
            <input
              id={`${id}-imageUrl`}
              type="url"
              value={data?.imageUrl || ''}
              onChange={handleImageUrlChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter image URL"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`${id}-altText`} className="block text-xs font-medium text-slate-300 mb-1">Alt Text</label>
            <input
              id={`${id}-altText`}
              type="text"
              value={data?.altText || ''}
              onChange={handleAltTextChange}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter alt text"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {data?.imageUrl && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Image Preview</label>
              <img
                src={data.imageUrl}
                alt={data?.altText || 'Image preview'}
                className="w-full h-32 object-cover rounded border border-slate-600"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <button
              onClick={handleRecognizeImage}
              disabled={!data?.imageUrl || isRecognizing}
              className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isRecognizing ? 'Recognizing...' : 'Recognize'}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Recognition Result</label>
            <textarea
              value={recognitionResult || data?.recognitionResult || ''}
              readOnly
              rows={4}
              className="node-textarea-dark resize-vertical"
              placeholder={data?.imageUrl ? "Click 'Recognize Text' to extract text from the image" : "Enter an image URL above to enable text recognition"}
              onClick={(e) => e.stopPropagation()}
            />

          </div>
        </div>
      ) : (
        <div className="node-closed-text">
          Click to configure
        </div>
      )}
    </BaseNode>
  );
};
