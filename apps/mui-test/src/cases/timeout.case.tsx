import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useTimeout } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

const DELAY_MS = 30;

function Preview() {
  const [count, setCount] = useState(0);
  const onFire = useCallback(() => setCount((c) => c + 1), []);
  const { start, clear } = useTimeout(onFire, DELAY_MS, { autoInvoke: false });

  return (
    <Stack spacing={1}>
      <Typography variant="body2">delay: {DELAY_MS}ms</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        fired: {count}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => start()}>
          start
        </Button>
        <Button size="small" variant="outlined" onClick={() => clear()}>
          clear
        </Button>
      </Stack>
    </Stack>
  );
}

export const timeoutCase: HookCase = {
  id: 'useTimeout/assert',
  name: 'useTimeout: calls callback after delay',
  tags: ['timers', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const firedRef = useRef<number>(0);

        const onFire = useCallback(() => {
          firedRef.current += 1;
        }, []);

        const { start } = useTimeout(onFire, DELAY_MS, { autoInvoke: false });

        useEffect(() => {
          let cancelled = false;

          async function run() {
            start();

            await delay(10);
            if (cancelled) return;
            const before = firedRef.current;
            if (before !== 0) {
              done({ ok: false, error: `expected 0 fires before delay, got ${before}` });
              return;
            }

            await delay(DELAY_MS + 30);
            if (cancelled) return;
            const after = firedRef.current;
            if (after !== 1) {
              done({ ok: false, error: `expected 1 fire after delay, got ${after}` });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, [start]);

        return null;
      }

      return <Harness />;
    }, 2500);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
