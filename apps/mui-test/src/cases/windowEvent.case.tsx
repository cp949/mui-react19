import { useWindowEvent } from '@cp949/mui-react19/hooks';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

function Preview() {
  const countRef = useRef(0);
  useWindowEvent('resize', () => {
    countRef.current += 1;
  });

  return (
    <Stack spacing={1}>
      <Typography variant='body2'>Dispatch window resize event</Typography>
      <Button
        size='small'
        variant='outlined'
        onClick={() => window.dispatchEvent(new Event('resize'))}
      >
        dispatch
      </Button>
    </Stack>
  );
}

export const windowEventCase: HookCase = {
  id: 'useWindowEvent/assert',
  name: 'useWindowEvent: registers and handles window events',
  tags: ['dom', 'events', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const countRef = useRef<number>(0);
        useWindowEvent('resize', () => {
          countRef.current += 1;
        });

        useEffect(() => {
          let cancelled = false;

          async function run() {
            window.dispatchEvent(new Event('resize'));
            await delay(0);
            if (cancelled) return;

            const count = countRef.current;
            if (count < 1) {
              done({ ok: false, error: `expected resize handler called, got ${count}` });
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
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
