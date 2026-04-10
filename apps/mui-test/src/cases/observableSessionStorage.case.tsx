import { useObservableSessionStorage } from '@cp949/mui-react19/hooks';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

const KEY = 'mui-test/useObservableSessionStorage';

function Preview() {
  const [value, setValue] = useObservableSessionStorage<string>(KEY, 'init');

  return (
    <Stack spacing={1}>
      <Typography variant='body2'>key: {KEY}</Typography>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        value: {JSON.stringify(value)}
      </Typography>
      <Stack direction='row' spacing={1}>
        <Button size='small' variant='outlined' onClick={() => setValue('next')}>
          set next
        </Button>
        <Button size='small' variant='outlined' onClick={() => setValue(null)}>
          set null
        </Button>
      </Stack>
    </Stack>
  );
}

export const observableSessionStorageCase: HookCase = {
  id: 'useObservableSessionStorage/assert',
  name: 'useObservableSessionStorage: set/clear',
  tags: ['storage', 'assert'],
  Preview,
  run: async () => {
    const testKey = `${KEY}/${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.removeItem(testKey);

    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue] = useObservableSessionStorage<string>(testKey, 'init');
        const valueRef = useRef<string>(value);

        useEffect(() => {
          valueRef.current = value;
        }, [value]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            await delay(20);
            if (cancelled) return;

            const initial = valueRef.current;
            if (initial !== 'init') {
              done({ ok: false, error: `expected initial 'init', got ${JSON.stringify(initial)}` });
              return;
            }

            setValue('next');
            await delay(30);
            if (cancelled) return;

            const afterSet = valueRef.current;
            if (afterSet !== 'next') {
              done({ ok: false, error: `expected value 'next', got ${JSON.stringify(afterSet)}` });
              return;
            }

            if (sessionStorage.getItem(testKey) !== '"next"') {
              done({
                ok: false,
                error: `expected storage '"next"', got ${JSON.stringify(sessionStorage.getItem(testKey))}`,
              });
              return;
            }

            setValue(null);
            await delay(30);
            if (cancelled) return;

            const afterClear = valueRef.current;
            if (afterClear !== 'init') {
              done({
                ok: false,
                error: `expected fallback to default 'init', got ${JSON.stringify(afterClear)}`,
              });
              return;
            }

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
    }, 4000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
