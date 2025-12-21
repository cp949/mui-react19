import { useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useSessionStorage } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

const KEY = 'mui-test/useSessionStorage';

function Preview() {
  const [value, setValue, remove] = useSessionStorage<string>(KEY, 'init');

  return (
    <Stack spacing={1}>
      <Typography variant="body2">key: {KEY}</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        value: {JSON.stringify(value)}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => setValue('hello')}>
          set hello
        </Button>
        <Button size="small" variant="outlined" onClick={() => remove()}>
          remove
        </Button>
      </Stack>
    </Stack>
  );
}

export const sessionStorageCase: HookCase = {
  id: 'useSessionStorage/assert',
  name: 'useSessionStorage: set/remove',
  tags: ['storage', 'assert'],
  Preview,
  run: async () => {
    sessionStorage.removeItem(KEY);

    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue, remove] = useSessionStorage<string>(KEY, 'init');
        const valueRef = useRef(value);

        useEffect(() => {
          valueRef.current = value;
        }, [value]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            await delay(20);
            if (cancelled) return;

            if (valueRef.current !== 'init') {
              done({
                ok: false,
                error: `expected initial 'init', got ${JSON.stringify(valueRef.current)}`,
              });
              return;
            }

            setValue('hello');
            await delay(20);
            if (cancelled) return;

            if (sessionStorage.getItem(KEY) !== '"hello"') {
              done({
                ok: false,
                error: `expected storage '"hello"', got ${JSON.stringify(sessionStorage.getItem(KEY))}`,
              });
              return;
            }

            remove();
            await delay(20);
            if (cancelled) return;

            if (sessionStorage.getItem(KEY) !== null) {
              done({
                ok: false,
                error: `expected key removed, got ${JSON.stringify(sessionStorage.getItem(KEY))}`,
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
