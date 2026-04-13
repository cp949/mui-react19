import { useRefEffect } from '@cp949/mui-react19/hooks';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { delay } from '../test-utils/delay';
import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

function Preview() {
  const [useFirst, setUseFirst] = useState(true);
  const [attachedCount, setAttachedCount] = useState(0);
  const [cleanupCount, setCleanupCount] = useState(0);

  const ref = useRefEffect<HTMLElement>(() => {
    setAttachedCount((count) => count + 1);

    return () => {
      setCleanupCount((count) => count + 1);
    };
  }, []);

  return (
    <Stack spacing={1}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        attached: {attachedCount}, cleanup: {cleanupCount}
      </Typography>
      <Button size='small' variant='outlined' onClick={() => setUseFirst((prev) => !prev)}>
        swap element
      </Button>
      {useFirst ? <div ref={ref}>first</div> : <span ref={ref}>second</span>}
    </Stack>
  );
}

export const useRefEffectCase: HookCase = {
  id: 'useRefEffect/assert',
  name: 'useRefEffect: attaches and cleans up on ref changes',
  tags: ['dom', 'ref', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        const [useFirst, setUseFirst] = useState(true);
        const [attachedCount, setAttachedCount] = useState(0);
        const [cleanupCount, setCleanupCount] = useState(0);

        const ref = useRefEffect<HTMLElement>(() => {
          setAttachedCount((count) => count + 1);

          return () => {
            setCleanupCount((count) => count + 1);
          };
        }, []);

        useEffect(() => {
          let cancelled = false;

          async function run() {
            await delay(0);
            if (cancelled) return;

            setUseFirst(false);

            await delay(0);
            if (cancelled) return;

            if (attachedCount < 2) {
              done({
                ok: false,
                error: `expected attach callback at least twice, got ${attachedCount}`,
              });
              return;
            }

            if (cleanupCount < 1) {
              done({
                ok: false,
                error: `expected cleanup callback at least once, got ${cleanupCount}`,
              });
              return;
            }

            done({ ok: true });
          }

          void run();
          return () => {
            cancelled = true;
          };
        }, [attachedCount, cleanupCount]);

        return useFirst ? <div ref={ref}>first</div> : <span ref={ref}>second</span>;
      }

      return <Harness />;
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
