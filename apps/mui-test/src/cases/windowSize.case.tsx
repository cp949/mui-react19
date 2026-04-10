import { useWindowSize } from '@cp949/mui-react19/hooks';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';
import { canMockWindowSize, setMockWindowSize } from './window-size-env';

function setWindowSize(width: number, height: number) {
  setMockWindowSize(window, width, height);
}

function nextRaf() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForWindowSize(
  getValue: () => { width: number; height: number },
  width: number,
  height: number,
  timeoutMs = 500,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const current = getValue();
    if (current.width === width && current.height === height) {
      return current;
    }

    await nextRaf();
    await delay(10);
  }

  return getValue();
}

function Preview() {
  const { width, height } = useWindowSize();

  return (
    <Stack spacing={1}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        {JSON.stringify({ width, height })}
      </Typography>
      <Button
        size='small'
        variant='outlined'
        onClick={() => {
          setWindowSize(777, 333);
          window.dispatchEvent(new Event('resize'));
        }}
      >
        resize
      </Button>
    </Stack>
  );
}

export const windowSizeCase: HookCase = {
  id: 'useWindowSize/assert',
  name: 'useWindowSize: updates on resize',
  tags: ['dom', 'events', 'assert'],
  Preview,
  run: async () => {
    if (!canMockWindowSize(window)) {
      return {
        status: 'skipped',
        error: 'This environment does not allow overriding window.innerWidth/innerHeight.',
      };
    }

    const res = await runReactTest((done) => {
      function Harness() {
        const onChangeCount = useRef<number>(0);
        const stateRef = useRef<{ width: number; height: number }>({ width: -1, height: -1 });

        const state = useWindowSize({
          initialWidth: 1,
          initialHeight: 1,
          onChange: () => {
            onChangeCount.current += 1;
          },
        });

        useEffect(() => {
          stateRef.current = state;
        }, [state]);

        useEffect(() => {
          let cancelled = false;
          const prevWidthDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth');
          const prevHeightDesc = Object.getOwnPropertyDescriptor(window, 'innerHeight');

          async function run() {
            await nextRaf();
            await delay(0);
            if (cancelled) return;

            setWindowSize(100, 200);
            window.dispatchEvent(new Event('resize'));

            const first = await waitForWindowSize(() => stateRef.current, 100, 200);
            if (cancelled) return;

            if (first.width !== 100 || first.height !== 200) {
              done({ ok: false, error: `expected {100,200}, got ${JSON.stringify(first)}` });
              return;
            }

            setWindowSize(300, 400);
            window.dispatchEvent(new Event('resize'));
            const second = await waitForWindowSize(() => stateRef.current, 300, 400);
            if (cancelled) return;

            if (second.width !== 300 || second.height !== 400) {
              done({ ok: false, error: `expected {300,400}, got ${JSON.stringify(second)}` });
              return;
            }

            if (onChangeCount.current < 2) {
              done({
                ok: false,
                error: `expected onChange called >=2, got ${onChangeCount.current}`,
              });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
            if (prevWidthDesc) Object.defineProperty(window, 'innerWidth', prevWidthDesc);
            if (prevHeightDesc) Object.defineProperty(window, 'innerHeight', prevHeightDesc);
          };
        }, []);

        return null;
      }

      return <Harness />;
    }, 5000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
