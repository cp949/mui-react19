import { useClipboard } from '@cp949/mui-react19/hooks';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

const TIMEOUT_MS = 40;

function Preview() {
  const { copy, reset, copied, error } = useClipboard({ timeout: TIMEOUT_MS });

  return (
    <Stack spacing={1}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        copied: {String(copied)} / error: {error ? error.message : 'null'}
      </Typography>
      <Stack direction='row' spacing={1}>
        <Button size='small' variant='outlined' onClick={() => copy('hello')}>
          copy
        </Button>
        <Button size='small' variant='outlined' onClick={() => reset()}>
          reset
        </Button>
      </Stack>
    </Stack>
  );
}

export const clipboardCase: HookCase = {
  id: 'useClipboard/assert',
  name: 'useClipboard: sets copied and clears after timeout',
  tags: ['dom', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const lastTextRef = useRef<string | null>(null);

        const { copy, copied } = useClipboard({ timeout: TIMEOUT_MS });
        const copiedRef = useRef(copied);

        // Install clipboard mock (must happen in an effect, not during render)
        useEffect(() => {
          const originalClipboard = (navigator as unknown as { clipboard?: unknown }).clipboard;

          const clipboardMock = {
            writeText: async (value: string) => {
              lastTextRef.current = value;
            },
          };

          Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: clipboardMock,
          });

          return () => {
            Object.defineProperty(navigator, 'clipboard', {
              configurable: true,
              value: originalClipboard,
            });
          };
        }, []);

        useEffect(() => {
          copiedRef.current = copied;
        }, [copied]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            copy('hello');
            await delay(0);
            if (cancelled) return;

            if (lastTextRef.current !== 'hello') {
              done({
                ok: false,
                error: `expected writeText('hello'), got ${JSON.stringify(lastTextRef.current)}`,
              });
              return;
            }

            // copied should become true shortly
            await delay(10);
            if (cancelled) return;
            const copiedSoon: boolean = copiedRef.current;
            if (copiedSoon !== true) {
              done({ ok: false, error: `expected copied true, got ${String(copiedSoon)}` });
              return;
            }

            // and then reset to false after timeout
            await delay(TIMEOUT_MS + 50);
            if (cancelled) return;
            const copiedAfterTimeout: boolean = copiedRef.current;
            if (copiedAfterTimeout !== false) {
              done({
                ok: false,
                error: `expected copied false after timeout, got ${String(copiedAfterTimeout)}`,
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
    }, 5000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
