import { useEffect, useRef } from 'react';

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  type: K,
  listener: (this: T, ev: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener(type, listener as EventListener, options);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return () => ref.current?.removeEventListener(type, listener as EventListener, options);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listener, options]);

  return ref;
}
