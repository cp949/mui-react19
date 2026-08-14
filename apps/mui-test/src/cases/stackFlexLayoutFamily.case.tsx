// stack/flex 통합 팩토리 전환 시각 회귀 확인 case.
// getComputedStyle 기반 유닛 테스트로는 justify/align 분포의 실제 배치와
// center 정책이 Stack/Flex에서 다르게 동작하는 모습을 눈으로 볼 수 없어 추가한
// 순수 시각 확인용 Preview. 자동 assertion(run)은 없다.
import { FlexColumn, FlexRow, StackColumn, StackRow } from '@cp949/mui-react19';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import type { HookCase } from './types';

const chipSx = {
  px: 1,
  py: 0.5,
  fontSize: 11,
  fontFamily: 'monospace',
  bgcolor: 'primary.light',
  color: 'primary.contrastText',
  borderRadius: 1,
} as const;

function Stage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack spacing={0.5} sx={{ width: 200 }}>
      <Box
        sx={{
          height: 90,
          border: '1px dashed',
          borderColor: 'divider',
          overflow: 'hidden',
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

function ThreeChips() {
  return (
    <>
      <Box sx={chipSx}>A</Box>
      <Box sx={chipSx}>B</Box>
      <Box sx={chipSx}>C</Box>
    </>
  );
}

function Preview() {
  return (
    <Stack spacing={3}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        stack/flex 통합 팩토리 28개 export 시각 확인
      </Typography>

      <Stack spacing={1}>
        <Typography variant='subtitle2'>StackColumn 서브변형 6종 (justifyContent 분포)</Typography>
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Stage label='Start'>
            <StackColumn.Start sx={{ height: '100%' }}>
              <ThreeChips />
            </StackColumn.Start>
          </Stage>
          <Stage label='Center'>
            <StackColumn.Center sx={{ height: '100%' }}>
              <ThreeChips />
            </StackColumn.Center>
          </Stage>
          <Stage label='End'>
            <StackColumn.End sx={{ height: '100%' }}>
              <ThreeChips />
            </StackColumn.End>
          </Stage>
          <Stage label='Between'>
            <StackColumn.Between sx={{ height: '100%' }}>
              <ThreeChips />
            </StackColumn.Between>
          </Stage>
          <Stage label='Around'>
            <StackColumn.Around sx={{ height: '100%' }}>
              <ThreeChips />
            </StackColumn.Around>
          </Stage>
          <Stage label='Evenly'>
            <StackColumn.Evenly sx={{ height: '100%' }}>
              <ThreeChips />
            </StackColumn.Evenly>
          </Stage>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant='subtitle2'>FlexRow 서브변형 6종 (justifyContent 분포)</Typography>
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Stage label='Start'>
            <FlexRow.Start sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow.Start>
          </Stage>
          <Stage label='Center'>
            <FlexRow.Center sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow.Center>
          </Stage>
          <Stage label='End'>
            <FlexRow.End sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow.End>
          </Stage>
          <Stage label='Between'>
            <FlexRow.Between sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow.Between>
          </Stage>
          <Stage label='Around'>
            <FlexRow.Around sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow.Around>
          </Stage>
          <Stage label='Evenly'>
            <FlexRow.Evenly sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow.Evenly>
          </Stage>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant='subtitle2'>
          center + 명시 justifyContent 동시 전달 — Stack과 Flex가 다르게 반응해야 정상
        </Typography>
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Stage label='StackRow center + justifyContent="flex-end" (center가 강제 승리해야 함)'>
            <StackRow center justifyContent='flex-end' sx={{ height: '100%' }}>
              <ThreeChips />
            </StackRow>
          </Stage>
          <Stage label='FlexRow center + justifyContent="flex-end" (명시 값이 이겨야 함)'>
            <FlexRow center justifyContent='flex-end' sx={{ height: '100%' }}>
              <ThreeChips />
            </FlexRow>
          </Stage>
          <Stage label='FlexColumn inlineFlex + flexWrap="wrap"'>
            <FlexColumn inlineFlex flexWrap='wrap' sx={{ height: '100%', gap: 0.5 }}>
              <ThreeChips />
              <ThreeChips />
            </FlexColumn>
          </Stage>
        </Stack>
      </Stack>
    </Stack>
  );
}

export const stackFlexLayoutFamilyCase: HookCase = {
  id: 'component/stack-flex-layout-family',
  name: 'stack/flex 통합 팩토리 28개 export 시각 미리보기',
  description:
    'StackColumn/StackRow/FlexColumn/FlexRow가 통합 팩토리 위임 전환 후에도 justify 분포와 패밀리별 center 정책 차이를 실제 브라우저에서 올바르게 재현하는지 시각 확인 (자동 assertion 없음, Preview만 존재)',
  tags: ['component', 'visual'],
  Preview,
};
