import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import type { FunctionComponent } from 'react';
import { overrideProps } from '../../util/override-props.js';

export interface CreateComponentProps extends StackProps {
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

export function createComponent(
  displayName: string,
  direction: StackProps['direction'],
  defaultProps: object,
) {
  // ref-as-prop: CreateComponentProps가 StackProps를 extends하므로 ref는 자동 포함된다(D-02a).
  // FunctionComponent 캐스트로 Component.displayName 동적 할당을 타입 에러 없이 유지한다(D-02).
  const Component = (({ alignItems, justifyContent, ref, ...props }: CreateComponentProps) => {
    const sxOverride = overrideProps(defaultProps, {
      alignItems,
      justifyContent,
    });
    return (
      <Stack
        direction={direction}
        {...props}
        ref={ref}
        sx={[sxOverride, ...(Array.isArray(props.sx) ? props.sx : [props.sx ?? false])]}
      />
    );
  }) as FunctionComponent<CreateComponentProps>;
  Component.displayName = displayName;
  return Component;
}
