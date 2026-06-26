// useId 컴포넌트 동작 검증 case (SC#3).
// useId(staticId) override가 staticId를 그대로 반환하고,
// 인자 없는 파생 id는 콜론(:)이 제거되며, 렌더된 DOM에 staticId가 일관 반영되는지 확인한다.
// useId는 hooks subpath에서 import한다.
import { useId } from '@cp949/mui-react19/hooks';
import { Stack, Typography } from '@mui/material';
import { useEffect } from 'react';

import { runReactTest } from '../test-utils/runReactTest';
import type { HookCase } from './types';

// UI에 항상 렌더되는 미리보기. useId가 생성한 id를 화면에 표시한다.
function Preview() {
  const staticId = useId('my-static-id');
  const derivedId = useId();

  return (
    <Stack spacing={1}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        static: {staticId}
      </Typography>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        derived: {derivedId}
      </Typography>
    </Stack>
  );
}

export const useIdComponentCase: HookCase = {
  id: 'useId/component',
  name: 'useId returns static override and colon-free derived id',
  tags: ['component', 'useId', 'assert'],
  Preview,
  run: async () => {
    const res = await runReactTest((done) => {
      function Harness() {
        // override 경로(staticId)와 파생 경로(인자 없음)를 동시에 검증한다.
        const staticId = useId('my-static-id');
        const derivedId = useId();

        useEffect(() => {
          // SC#3: staticId override는 입력값을 그대로 반환한다(USEID-02).
          if (staticId !== 'my-static-id') {
            done({
              ok: false,
              error: `staticId override expected 'my-static-id', got '${staticId}'`,
            });
            return;
          }

          // 파생 id는 비어있지 않은 문자열이어야 한다.
          if (typeof derivedId !== 'string' || derivedId.length === 0) {
            done({
              ok: false,
              error: `derivedId expected non-empty string, got '${String(derivedId)}'`,
            });
            return;
          }

          // Phase 2 D-03: 파생 id에서 콜론이 제거되어 querySelector 안전.
          if (derivedId.includes(':')) {
            done({ ok: false, error: `derivedId expected no colon, got '${derivedId}'` });
            return;
          }

          // 렌더된 DOM에 staticId가 일관 반영(CSR id 일관성).
          if (document.getElementById('my-static-id') === null) {
            done({ ok: false, error: 'element with id "my-static-id" not found in DOM' });
            return;
          }

          done({ ok: true });
        }, [staticId, derivedId]);

        return (
          <div>
            <div id={staticId}>static</div>
            <div id={derivedId}>derived</div>
          </div>
        );
      }

      return <Harness />;
    }, 2000);

    return res.ok ? { status: 'pass' } : { status: 'fail', error: res.error };
  },
};
