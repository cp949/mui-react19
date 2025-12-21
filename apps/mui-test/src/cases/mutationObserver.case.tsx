import { useEffect, useMemo, useRef } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useMutationObserver } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

function Preview() {
  const target = useMemo(() => document.createElement('div'), []);
  const countRef = useRef(0);

  useMutationObserver(
    () => {
      countRef.current += 1;
    },
    { attributes: true },
    target,
  );

  return (
    <Stack spacing={1}>
      <Typography variant="body2">MutationObserver (attributes)</Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={() => target.setAttribute('data-x', String(Date.now()))}
      >
        mutate
      </Button>
    </Stack>
  );
}

export const mutationObserverCase: HookCase = {
  id: 'useMutationObserver/assert',
  name: 'useMutationObserver: observes DOM mutations',
  tags: ['dom', 'events', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const target = useMemo(() => document.createElement('div'), []);
        const countRef = useRef<number>(0);

        useMutationObserver(
          () => {
            countRef.current += 1;
          },
          { attributes: true },
          target,
        );

        useEffect(() => {
          let cancelled = false;

          async function run() {
            target.setAttribute('data-x', '1');
            await delay(0);
            if (cancelled) return;

            const count = countRef.current;
            if (count < 1) {
              done({ ok: false, error: `expected mutation callback called, got ${count}` });
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
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
