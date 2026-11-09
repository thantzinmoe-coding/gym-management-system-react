import { useCallback, useRef, useState } from 'react';

/**
 * Tracks which actions are running, by key (an id, or a name like "save").
 * run() ignores a second call for the same key while the first is still going,
 * so a double click cannot send the same request twice.
 */
export function usePending() {
  const active = useRef(new Set<string | number>());
  const [keys, setKeys] = useState<(string | number)[]>([]);

  const run = useCallback(async <T,>(key: string | number, action: () => Promise<T>): Promise<T | undefined> => {
    if (active.current.has(key)) return undefined;
    active.current.add(key);
    setKeys([...active.current]);
    try {
      return await action();
    } finally {
      active.current.delete(key);
      setKeys([...active.current]);
    }
  }, []);

  return {
    run,
    isPending: (key: string | number) => keys.includes(key),
    anyPending: keys.length > 0,
  };
}
