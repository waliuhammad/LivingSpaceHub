import { useEffect, useState } from 'react';

/**
 * Subscribe to a realtime Firestore query from src/lib/db.js.
 * `subscribe` must be a stable function: (onData, onError) => unsubscribe.
 */
export default function useLiveQuery(subscribe, initial = []) {
  const [state, setState] = useState({ data: initial, loading: true, error: null });

  useEffect(() => {
    return subscribe(
      (data) => setState({ data, loading: false, error: null }),
      (error) => {
        console.error(error);
        setState((s) => ({ ...s, loading: false, error }));
      }
    );
  }, [subscribe]);

  return state;
}
