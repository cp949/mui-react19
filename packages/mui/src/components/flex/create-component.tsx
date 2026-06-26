import { Box } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { overrideProps } from '../../util/override-props.js';
import type { FlexBaseProps } from './types.js';

export function createFlexComponent(
  displayName: string,
  flexDirection: CSSProperties['flexDirection'],
  defaultProps: object,
) {
  // ref-as-prop: FlexBaseProps가 BoxProps를 extends하므로 ref는 자동 포함된다(D-02a).
  // FunctionComponent 캐스트로 Component.displayName 동적 할당을 타입 에러 없이 유지한다(D-02).
  const Component = (({
    inlineFlex,
    justifyContent,
    alignItems,
    flexWrap,
    sx,
    ref,
    ...props
  }: FlexBaseProps) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            display: inlineFlex ? 'inline-flex' : 'flex',
            flexDirection,
            ...overrideProps(defaultProps, {
              justifyContent,
              alignItems,
              flexWrap,
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  }) as FunctionComponent<FlexBaseProps>;
  Component.displayName = displayName;
  return Component;
}
