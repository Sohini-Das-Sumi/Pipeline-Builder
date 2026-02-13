// Provide a small compatibility wrapper so components written for the
// Zustand `useStore(selector)` API continue to work while the app uses
// `StoreContext` as the single source of truth.
import { useStore as useContextStore } from './StoreContext';

export function useStore(selector, equalityFn) {
	const store = useContextStore();

	// If caller passed a selector function (Zustand-style), return the selected slice.
	if (typeof selector === 'function') {
		// Note: equalityFn is ignored for simplicity; selector is re-run each render.
		return selector(store);
	}

	// No selector -> return whole store
	return store;
}

export default useStore;
