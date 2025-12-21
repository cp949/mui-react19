import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useInterval } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

const INTERVAL_MS = 20;

function Preview() {
  const [count, setCount] = useState(0);
  const tick = useCallback(() => setCount((c) => c + 1), []);
  const { start, stop, active } = useInterval(tick, INTERVAL_MS, { autoInvoke: false });

  return (
    <Stack spacing={1}>
      <Typography variant="body2">interval: {INTERVAL_MS}ms</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        active: {String(active)} / count: {count}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => start()}>
          start
        </Button>
        <Button size="small" variant="outlined" onClick={() => stop()}>
          stop
        </Button>
      </Stack>
    </Stack>
  );
}

export const intervalCase: HookCase = {
  id: 'useInterval/assert',
  name: 'useInterval: ticks while active',
  tags: ['timers', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const ticksRef = useRef<number>(0);
        const tick = useCallback(() => {
          ticksRef.current += 1;
        }, []);

        const { start, stop } = useInterval(tick, INTERVAL_MS, { autoInvoke: false });

        useEffect(() => {
          let cancelled = false;

          async function run() {
            // let hook effects set up internal refs first
            await delay(0);
            if (cancelled) return;

            start();
            await delay(INTERVAL_MS * 3 + 40);
            if (cancelled) return;

            const ticks = ticksRef.current;
            if (ticks < 2) {
              done({ ok: false, error: `expected at least 2 ticks, got ${ticks}` });
              return;
            }

            stop();
            const afterStop = ticksRef.current;
            await delay(INTERVAL_MS * 2 + 40);
            if (cancelled) return;

            if (ticksRef.current !== afterStop) {
              done({
                ok: false,
                error: `expected no ticks after stop, got ${ticksRef.current - afterStop}`,
              });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        return null;
      }

      return <Harness />;
    }, 3000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
