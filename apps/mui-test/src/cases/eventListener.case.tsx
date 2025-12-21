import { useEffect, useRef, type RefObject } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useEventListener } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

function Preview() {
  const countRef = useRef(0);
  const ref = useEventListener<'click', HTMLDivElement>('click', () => {
    countRef.current += 1;
  });

  return (
    <Stack spacing={1}>
      <Typography variant="body2">Click the box to trigger listener</Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={() => ref.current?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
      >
        dispatch
      </Button>
      <div
        ref={ref as unknown as RefObject<HTMLDivElement>}
        style={{ width: 80, height: 32, border: '1px solid #ccc', display: 'inline-block' }}
      />
    </Stack>
  );
}

export const eventListenerCase: HookCase = {
  id: 'useEventListener/assert',
  name: 'useEventListener: registers and handles element events',
  tags: ['dom', 'events', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const countRef = useRef<number>(0);
        const ref = useEventListener<'click', HTMLDivElement>('click', () => {
          countRef.current += 1;
        });

        useEffect(() => {
          let cancelled = false;

          async function run() {
            await delay(0);
            if (cancelled) return;

            ref.current?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await delay(0);
            if (cancelled) return;

            const count = countRef.current;
            if (count < 1) {
              done({ ok: false, error: `expected click handler called, got ${count}` });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        return <div ref={ref as unknown as RefObject<HTMLDivElement>} />;
      }

      return <Harness />;
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
