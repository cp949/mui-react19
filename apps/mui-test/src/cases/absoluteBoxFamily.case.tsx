// absolute-box 팩토리 전환(top/bottom/center-absolute 12개 export) 시각 회귀 확인 case.
// getComputedStyle 기반 유닛 테스트로는 실제 브라우저 렌더링(transform, 겹침, 박스 크기)을
// 검증할 수 없어 추가한 순수 시각 확인용 Preview. 자동 assertion(run)은 없다 —
// 위치 계산 로직 자체는 이미 유닛 테스트로 커버되어 있으므로 여기서는 눈으로 보는 것이 목적.
import { BottomAbsolute, CenterAbsolute, TopAbsolute } from '@cp949/mui-react19';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import type { HookCase } from './types';

const STAGE_SIZE = 120;

const dotSx = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  bgcolor: 'primary.main',
} as const;

const barSx = {
  height: 8,
  bgcolor: 'primary.light',
} as const;

// 각 변형을 독립된 relative 컨테이너 안에 렌더해 서로 겹치지 않게 하고,
// 라벨로 어떤 export인지 표시한다.
function Stage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack spacing={0.5} sx={{ width: STAGE_SIZE + 24 }}>
      <Box
        sx={{
          position: 'relative',
          width: STAGE_SIZE,
          height: STAGE_SIZE,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        {children}
      </Box>
      <Typography
        variant='caption'
        sx={{ fontFamily: 'monospace', textAlign: 'center', display: 'block' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

function Preview() {
  return (
    <Stack spacing={2}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        absolute-box 팩토리 12개 export 시각 확인 — 점(●)은 앵커 위치, 막대는 stretch 결과
      </Typography>
      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
        <Stage label='TopAbsolute (top/left/right=0, 전체 폭)'>
          <TopAbsolute sx={barSx} />
        </Stage>
        <Stage label='TopAbsolute.Left'>
          <TopAbsolute.Left>
            <Box sx={dotSx} />
          </TopAbsolute.Left>
        </Stage>
        <Stage label='TopAbsolute.Right'>
          <TopAbsolute.Right>
            <Box sx={dotSx} />
          </TopAbsolute.Right>
        </Stage>
        <Stage label='TopAbsolute.Center (top 기본값 없음 → top="12px" 명시)'>
          <TopAbsolute.Center top='12px'>
            <Box sx={dotSx} />
          </TopAbsolute.Center>
        </Stage>

        <Stage label='BottomAbsolute (bottom/left/right=0, 전체 폭)'>
          <BottomAbsolute sx={barSx} />
        </Stage>
        <Stage label='BottomAbsolute.Left'>
          <BottomAbsolute.Left>
            <Box sx={dotSx} />
          </BottomAbsolute.Left>
        </Stage>
        <Stage label='BottomAbsolute.Right'>
          <BottomAbsolute.Right>
            <Box sx={dotSx} />
          </BottomAbsolute.Right>
        </Stage>
        <Stage label='BottomAbsolute.Center (bottom 기본값 0)'>
          <BottomAbsolute.Center>
            <Box sx={dotSx} />
          </BottomAbsolute.Center>
        </Stage>

        <Stage label='CenterAbsolute (left+right=0 동시 허용, 수직중앙)'>
          <CenterAbsolute sx={barSx} />
        </Stage>
        <Stage label='CenterAbsolute.Left'>
          <CenterAbsolute.Left>
            <Box sx={dotSx} />
          </CenterAbsolute.Left>
        </Stage>
        <Stage label='CenterAbsolute.Right'>
          <CenterAbsolute.Right>
            <Box sx={dotSx} />
          </CenterAbsolute.Right>
        </Stage>
        <Stage label='CenterAbsolute.Center'>
          <CenterAbsolute.Center>
            <Box sx={dotSx} />
          </CenterAbsolute.Center>
        </Stage>
      </Stack>
    </Stack>
  );
}

export const absoluteBoxFamilyCase: HookCase = {
  id: 'component/absolute-box-family',
  name: 'absolute-box 팩토리 12개 export 시각 미리보기',
  description:
    'top/bottom/center-absolute 패밀리가 팩토리 위임 전환 후에도 실제 브라우저에서 올바른 좌표에 렌더되는지 시각 확인 (자동 assertion 없음, Preview만 존재)',
  tags: ['component', 'visual'],
  Preview,
};
