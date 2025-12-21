import { useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLocalStorageState } from '@cp949/mui-react19/hooks';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

const KEY = 'mui-test/useLocalStorageState';

function Preview() {
  const [value, setValue] = useLocalStorageState(KEY, 'init');

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

export const localStorageStateCase: HookCase = {
  id: 'useLocalStorageState/basic',
  name: 'useLocalStorageState: basic',
  description: 'useStorageState 기반(localStorage) 동작: 초기값/업데이트/삭제 확인',
  tags: ['storage'],
  Preview,
  run: async () => {
    const testKey = `${KEY}/${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.removeItem(testKey);

    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue] = useLocalStorageState(testKey, 'init');
        const [phase, setPhase] = useState<'init' | 'set' | 'clear'>('init');
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
                error: `expected initial value 'init', got ${JSON.stringify(valueRef.current)}`,
              });
              return;
            }

            setPhase('set');
            setValue('next');
            await delay(30);
            if (cancelled) return;

            if (localStorage.getItem(testKey) !== 'next') {
              done({
                ok: false,
                error: `expected storage 'next', got ${JSON.stringify(localStorage.getItem(testKey))}`,
              });
              return;
            }

            setPhase('clear');
            setValue(null);
            await delay(30);
            if (cancelled) return;

            if (localStorage.getItem(testKey) !== null) {
              done({
                ok: false,
                error: `expected key removed, got ${JSON.stringify(localStorage.getItem(testKey))}`,
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
          <Typography variant="caption" color="text.secondary">
            phase: {phase} / value: {JSON.stringify(value)}
          </Typography>
        );
      }

      return <Harness />;
    }, 2500);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
