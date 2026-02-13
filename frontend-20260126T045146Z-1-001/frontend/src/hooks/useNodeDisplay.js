import { useCallback, useEffect } from 'react';
import { useStore } from '../store';

export const useNodeDisplay = (id, isSelected, isDisplayOpen) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  // Removed automatic opening on selection - displays stay closed by default

  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    // Additional logic if needed for transitions
  }, []);

  const toggleDisplay = useCallback(() => {
    const currentDisplayState = useStore.getState().nodes.find(node => node.id === id)?.data?.isDisplayOpen || false;
    updateNodeField(id, 'isDisplayOpen', !currentDisplayState);
  }, [id, updateNodeField]);

  return {
    handleTransitionEnd,
    toggleDisplay
  };
};
