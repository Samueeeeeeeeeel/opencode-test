import { useCallback, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CallbackFn = (...args: any[]) => void;

export function useDebouncedCallback<T extends CallbackFn>(
  callback: T,
  delay: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as unknown as T;
}
