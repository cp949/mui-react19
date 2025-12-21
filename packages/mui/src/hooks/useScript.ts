import { useEffect, useRef, useState } from 'react';

type LoadingState = 'unknown' | 'loading' | 'ready' | 'error';

export function useScript(
  src: string,
  options: { removeOnUnmount?: boolean } = { removeOnUnmount: false },
): LoadingState {
  const [status, setStatus] = useState<LoadingState>('loading');
  const optionsRef = useRef(options);

  useEffect(() => {
    // Some test DOM implementations (e.g. happy-dom) throw when loading scripts via `src`,
    // including `data:` URIs. For data URIs, treat them as inline scripts to avoid file loading.
    const isDataJavaScript =
      src.startsWith('data:text/javascript,') ||
      src.startsWith('data:application/javascript,') ||
      src.startsWith('data:text/javascript;') ||
      src.startsWith('data:application/javascript;');

    // IMPORTANT: When `data:` URIs are converted to inline scripts, the created <script> has no `src`.
    // We tag our scripts with a stable attribute so subsequent renders can find and reuse them.
    const findExistingScript = (scriptSrc: string): HTMLScriptElement | null => {
      const scripts = document.getElementsByTagName('script');
      for (const s of Array.from(scripts)) {
        if (s.getAttribute('data-ocodelib-src') === scriptSrc) return s;
        // Back-compat for scripts that were created with a real `src` but without our tag.
        if (s.getAttribute('src') === scriptSrc) return s;
      }
      return null;
    };

    const prevScript = findExistingScript(src);

    const domStatus = prevScript?.getAttribute('data-status');
    if (domStatus) {
      queueMicrotask(() => setStatus(domStatus as LoadingState));
      return;
    }

    if (prevScript === null) {
      const script = document.createElement('script') as HTMLScriptElement;
      script.setAttribute('data-ocodelib-src', src);
      if (isDataJavaScript) {
        // Best-effort parse: take everything after the first comma as the JS payload.
        // If parsing fails, fall back to using `src` (which may error in limited DOM envs).
        const commaIndex = src.indexOf(',');
        if (commaIndex >= 0) {
          script.text = src.slice(commaIndex + 1);
        } else {
          script.src = src;
        }
      } else {
        script.src = src;
      }
      script.async = true;
      script.setAttribute('data-status', 'loading');
      try {
        document.body.appendChild(script);
      } catch {
        // Some DOM implementations (e.g. test environments) disable external/script loading.
        script.setAttribute('data-status', 'error');
        queueMicrotask(() => setStatus('error'));
        return;
      }

      if (isDataJavaScript && !script.src) {
        // Inline scripts don't reliably emit 'load' events; mark as ready.
        script.setAttribute('data-status', 'ready');
        queueMicrotask(() => setStatus('ready'));

        const removeOnUnmount = optionsRef.current.removeOnUnmount;
        return () => {
          if (removeOnUnmount === true) {
            script.remove();
          }
        };
      }

      const handleScriptLoad = () => {
        script.setAttribute('data-status', 'ready');
        setStatus('ready');
        removeEventListeners();
      };

      const handleScriptError = () => {
        script.setAttribute('data-status', 'error');
        setStatus('error');
        removeEventListeners();
      };

      const removeEventListeners = () => {
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);
      };

      script.addEventListener('load', handleScriptLoad);
      script.addEventListener('error', handleScriptError);

      const removeOnUnmount = optionsRef.current.removeOnUnmount;

      return () => {
        if (removeOnUnmount === true) {
          script.remove();
          removeEventListeners();
        }
      };
    } else {
      queueMicrotask(() => setStatus('unknown'));
    }
  }, [src]);

  return status;
}
