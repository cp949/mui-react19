import { useEffect, useRef } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useSessionStorageState } from '@cp949/mui-react19/hooks';
import type { HookCase } from './types';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';

const KEY = 'mui-test/useSessionStorageState';

function Preview() {
  const [value, setValue] = useSessionStorageState(KEY, 'init');

  return (
    <Stack spacing={1}>
      <Typography variant="body2">key: {KEY}</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        value: {JSON.stringify(value)}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => setValue('next')}>
          set next
        </Button>
        <Button size="small" variant="outlined" onClick={() => setValue(null)}>
          set null
        </Button>
      </Stack>
    </Stack>
  );
}

export const sessionStorageStateCase: HookCase = {
  id: 'useSessionStorageState/assert',
  name: 'useSessionStorageState: initial/set/clear',
  tags: ['storage', 'assert'],
  Preview,
  run: async () => {
    const testKey = `${KEY}/${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.removeItem(testKey);

    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue] = useSessionStorageState(testKey, 'init');
        const valueRef = useRef(value);

        useEffect(() => {
          valueRef.current = value;
        }, [value]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            await delay(30);
            if (cancelled) return;

            if (valueRef.current !== 'init') {
              done({
                ok: false,
                error: `expected initial 'init', got ${JSON.stringify(valueRef.current)}`,
              });
              return;
            }

            setValue('next');
            await delay(30);
            if (cancelled) return;

            if (sessionStorage.getItem(testKey) !== 'next') {
              done({
                ok: false,
                error: `expected storage 'next', got ${JSON.stringify(sessionStorage.getItem(testKey))}`,
              });
              return;
            }

            setValue(null);
            await delay(30);
            if (cancelled) return;

            if (sessionStorage.getItem(testKey) !== null) {
              done({
                ok: false,
                error: `expected key removed, got ${JSON.stringify(sessionStorage.getItem(testKey))}`,
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
