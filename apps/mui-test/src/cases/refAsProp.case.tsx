// ref-as-prop 전환 검증 case (SC#2).
// Center(그룹 A, BoxProps 구조분해 ref → HTMLElement)와
// FileButton(그룹 D, useComposedRefs 합성 ref → HTMLInputElement)의
// ref가 실제 DOM 요소로 전달되어 document에 연결(isConnected)되는지 확인한다.
// 컴포넌트는 패키지 ROOT에서 import한다(/hooks 아님).
import { Center, FileButton } from '@cp949/mui-react19';
import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

// UI에 항상 렌더되는 미리보기. Center와 FileButton 트리거 버튼을 보여준다.
function Preview() {
  return (
    <Stack spacing={1}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        ref-as-prop: Center(HTMLElement) + FileButton(HTMLInputElement)
      </Typography>
      <Center sx={{ border: '1px dashed', p: 1 }}>centered content</Center>
      <FileButton onChange={() => {}}>
        {({ onClick }) => (
          <Button size='small' variant='outlined' onClick={onClick}>
            pick file
          </Button>
        )}
      </FileButton>
    </Stack>
  );
}

export const refAsPropCase: HookCase = {
  id: 'refAsProp/dom',
  name: 'ref-as-prop forwards Center/FileButton refs to real DOM',
  tags: ['component', 'ref', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        // Center는 HTMLElement, FileButton 내부 input은 HTMLInputElement로 연결되어야 한다.
        const centerRef = useRef<HTMLElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
          const center = centerRef.current;
          // SC#2: BoxProps 구조분해 ref가 실제 DOM에 전달되었는지.
          if (!(center instanceof HTMLElement) || !center.isConnected) {
            done({
              ok: false,
              error: `Center ref expected connected HTMLElement, got ${String(center)}`,
            });
            return;
          }

          const input = inputRef.current;
          // SC#2: 합성 ref(useComposedRefs)가 숨김 file input에 전달되었는지.
          if (!(input instanceof HTMLInputElement) || !input.isConnected) {
            done({
              ok: false,
              error: `FileButton ref expected connected HTMLInputElement, got ${String(input)}`,
            });
            return;
          }

          done({ ok: true });
        }, []);

        return (
          <>
            <Center ref={centerRef}>content</Center>
            <FileButton ref={inputRef} onChange={() => {}}>
              {({ onClick }) => (
                <button type='button' onClick={onClick}>
                  pick
                </button>
              )}
            </FileButton>
          </>
        );
      }

      return <Harness />;
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
