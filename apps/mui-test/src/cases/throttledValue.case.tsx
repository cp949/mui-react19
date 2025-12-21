import { useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useThrottledValue } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

const WAIT_MS = 40;

function Preview() {
  const [value, setValue] = useState('A');
  const throttled = useThrottledValue(value, WAIT_MS);

  return (
    <Stack spacing={1}>
      <Typography variant="body2">wait: {WAIT_MS}ms</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        value: {value} / throttled: {throttled}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => setValue('B')}>
          set B
        </Button>
        <Button size="small" variant="outlined" onClick={() => setValue('C')}>
          set C
        </Button>
      </Stack>
    </Stack>
  );
}

export const throttledValueCase: HookCase = {
  id: 'useThrottledValue/assert',
  name: 'useThrottledValue: updates after wait',
  tags: ['timers', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue] = useState('A');
        const throttled = useThrottledValue(value, WAIT_MS);

        const throttledRef = useRef(throttled);
        useEffect(() => {
          throttledRef.current = throttled;
        }, [throttled]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            // first update is leading (applies immediately)
            setValue('B');
            await delay(10);
            if (cancelled) return;

            const afterFirst = throttledRef.current;
            if (afterFirst !== 'B') {
              done({ ok: false, error: `expected immediate update to 'B', got ${afterFirst}` });
              return;
            }

            // second update within wait should be delayed
            setValue('C');
            await delay(Math.max(10, Math.floor(WAIT_MS / 2)));
            if (cancelled) return;

            const beforeWait = throttledRef.current;
            if (beforeWait !== 'B') {
              done({
                ok: false,
                error: `expected throttled to remain 'B' before wait, got ${beforeWait}`,
              });
              return;
            }

            await delay(WAIT_MS + 50);
            if (cancelled) return;

            const afterWait = throttledRef.current;
            if (afterWait !== 'C') {
              done({ ok: false, error: `expected throttled to update to 'C', got ${afterWait}` });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, []);

        return null;
      }

      return <Harness />;
    }, 2500);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
