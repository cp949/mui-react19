import { useEffect, useRef } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import { useResizeObserver } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

function Preview() {
  const [ref, rect] = useResizeObserver<HTMLDivElement>();

  if (typeof ResizeObserver === 'undefined') {
    return <Alert severity="warning">ResizeObserver is not available in this environment</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        rect: {JSON.stringify({ width: rect.width, height: rect.height })}
      </Typography>
      <div ref={ref} style={{ width: 10, height: 10 }} />
    </Stack>
  );
}

export const resizeObserverCase: HookCase = {
  id: 'useResizeObserver/assert',
  name: 'useResizeObserver: basic availability',
  tags: ['dom', 'assert'],
  Preview,
  run: async () => {
    if (typeof ResizeObserver === 'undefined') {
      return { status: 'skipped', error: 'ResizeObserver not available' };
    }

    const res = await runReactTest((done) => {
      function Harness() {
        const [ref, rect] = useResizeObserver<HTMLDivElement>();
        const rectRef = useRef(rect);

        useEffect(() => {
          rectRef.current = rect;
        }, [rect]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            await delay(0);
            if (cancelled) return;

            const { width, height } = rectRef.current;
            if (Number.isNaN(width) || Number.isNaN(height)) {
              done({
                ok: false,
                error: `expected numeric rect, got ${JSON.stringify(rectRef.current)}`,
              });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, []);

        return <div ref={ref} />;
      }

      return <Harness />;
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
