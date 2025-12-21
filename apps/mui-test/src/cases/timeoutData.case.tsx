import { useEffect, useRef } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useTimeoutData } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

const WAIT_MS = 40;

function Preview() {
  const [msg, setMsg] = useTimeoutData<string>(WAIT_MS);

  return (
    <Stack spacing={1}>
      <Typography variant="body2">timeout: {WAIT_MS}ms</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        msg: {JSON.stringify(msg)}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => setMsg('hello')}>
          set
        </Button>
        <Button size="small" variant="outlined" onClick={() => setMsg(null)}>
          clear
        </Button>
      </Stack>
    </Stack>
  );
}

export const timeoutDataCase: HookCase = {
  id: 'useTimeoutData/assert',
  name: 'useTimeoutData: clears after timeout',
  tags: ['timers', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const [msg, setMsg] = useTimeoutData<string>(WAIT_MS);
        const msgRef = useRef(msg);

        useEffect(() => {
          msgRef.current = msg;
        }, [msg]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            setMsg('hello');
            await delay(10);
            if (cancelled) return;

            if (msgRef.current !== 'hello') {
              done({
                ok: false,
                error: `expected msg to be 'hello', got ${JSON.stringify(msgRef.current)}`,
              });
              return;
            }

            await delay(WAIT_MS + 50);
            if (cancelled) return;

            if (msgRef.current !== null) {
              done({
                ok: false,
                error: `expected msg cleared, got ${JSON.stringify(msgRef.current)}`,
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
    }, 2500);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
