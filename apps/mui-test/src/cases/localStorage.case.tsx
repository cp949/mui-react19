import { useLocalStorage } from '@cp949/mui-react19/hooks';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

const KEY = 'mui-test/useLocalStorage';

function Preview() {
  const [value, setValue, remove] = useLocalStorage<string>(KEY, 'init');

  return (
    <Stack spacing={1}>
      <Typography variant='body2'>key: {KEY}</Typography>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        value: {JSON.stringify(value)}
      </Typography>
      <Stack direction='row' spacing={1}>
        <Button size='small' variant='outlined' onClick={() => setValue('hello')}>
          set hello
        </Button>
        <Button size='small' variant='outlined' onClick={() => remove()}>
          remove
        </Button>
      </Stack>
    </Stack>
  );
}

export const localStorageCase: HookCase = {
  id: 'useLocalStorage/basic',
  name: 'useLocalStorage: basic',
  description: 'set 시 localStorage에 값이 기록되고, remove 시 제거되는지 확인',
  tags: ['storage'],
  Preview,
  run: async () => {
    localStorage.removeItem(KEY);

    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue, remove] = useLocalStorage<string>(KEY, 'init');
        const [phase, setPhase] = useState<'init' | 'set' | 'remove'>('init');
        const valueRef = useRef(value);

        useEffect(() => {
          valueRef.current = value;
        }, [value]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            if (cancelled) return;

            // initializer should have written initial value
            await delay(20);
            if (cancelled) return;

            if (valueRef.current !== 'init') {
              done({
                ok: false,
                error: `expected initial value 'init', got ${JSON.stringify(valueRef.current)}`,
              });
              return;
            }

            setPhase('set');
            setValue('hello');
            await delay(20);
            if (cancelled) return;

            const raw = localStorage.getItem(KEY);
            if (!raw?.includes('hello')) {
              done({
                ok: false,
                error: `expected localStorage to include 'hello', got ${JSON.stringify(raw)}`,
              });
              return;
            }

            setPhase('remove');
            remove();
            await delay(20);
            if (cancelled) return;

            if (localStorage.getItem(KEY) !== null) {
              done({
                ok: false,
                error: `expected key removed, got ${JSON.stringify(localStorage.getItem(KEY))}`,
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

        return (
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
            }}
          >
            phase: {phase} / value: {String(value)}
          </Typography>
        );
      }

      return <Harness />;
    }, 2500);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
