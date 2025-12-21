import type React from 'react';
import ReactDOM from 'react-dom/client';

type TestResult = { ok: true } | { ok: false; error: string };

type Done = (result: TestResult) => void;

export async function runReactTest(
  build: (done: Done) => React.ReactElement,
  timeoutMs = 2000,
): Promise<TestResult> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  return await new Promise<TestResult>((resolve) => {
    let finished = false;
    let capturedError: string | null = null;

    function cleanup() {
      queueMicrotask(() => {
        try {
          root.unmount();
        } finally {
          container.remove();
        }
      });
    }

    const onError = (event: ErrorEvent) => {
      capturedError =
        event.error instanceof Error
          ? `${event.error.name}: ${event.error.message}`
          : event.message;
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      capturedError =
        reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    const timer = window.setTimeout(() => {
      if (finished) return;
      finished = true;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      cleanup();
      resolve({ ok: false, error: capturedError ? capturedError : `Timeout after ${timeoutMs}ms` });
    }, timeoutMs);

    const done: Done = (result) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      cleanup();
      resolve(capturedError ? { ok: false, error: capturedError } : result);
    };

    try {
      root.render(build(done));
    } catch (e) {
      done({ ok: false, error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) });
    }
  });
}
