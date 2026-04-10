import { useDebouncedValue } from '@cp949/mui-react19/hooks';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

const WAIT_MS = 120;

function Preview() {
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, WAIT_MS);

  return (
    <Stack spacing={1}>
      <TextField
        label='value'
        size='small'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Typography variant='body2'>debounced:</Typography>
        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(debounced)}
        </Typography>
      </Box>
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
        }}
      >
        Wait: {WAIT_MS}ms
      </Typography>
    </Stack>
  );
}

export const debouncedValueCase: HookCase = {
  id: 'useDebouncedValue/basic',
  name: 'useDebouncedValue: basic',
  description: '값 변경 후 wait(ms) 뒤에 debounced 값이 따라오는지 확인',
  tags: ['timers'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const [value, setValue] = useState('');
        const [debounced] = useDebouncedValue(value, WAIT_MS);
        const debouncedRef = useRef(debounced);

        useEffect(() => {
          debouncedRef.current = debounced;
        }, [debounced]);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            if (cancelled) return;
            setValue('A');

            // before debounce time, should still be old value
            await delay(Math.max(10, Math.floor(WAIT_MS / 2)));
            if (cancelled) return;

            if (debouncedRef.current === 'A') {
              done({
                ok: false,
                error: `debounced updated too early (got ${JSON.stringify(debouncedRef.current)})`,
              });
              return;
            }

            await delay(WAIT_MS + 30);
            if (cancelled) return;

            if (debouncedRef.current !== 'A') {
              done({
                ok: false,
                error: `debounced did not update (got ${JSON.stringify(debouncedRef.current)})`,
              });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, []);

        return null;
      }

      return <Harness />;
    }, 2500);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
