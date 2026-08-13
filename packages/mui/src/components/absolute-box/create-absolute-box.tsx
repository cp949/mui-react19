import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';

type AbsoluteAxisProp = 'top' | 'left' | 'right' | 'bottom';

export interface AbsoluteBoxAxisConfig {
  cssProp: AbsoluteAxisProp;
  defaultValue?: CSSProperties[AbsoluteAxisProp];
}

export interface AbsoluteBoxConfig {
  displayName: string;
  axes: AbsoluteBoxAxisConfig[];
  fixedStyle?: Record<string, string | number>;
  supportsFullWidth: boolean;
}

export interface AbsoluteBoxRenderProps extends BoxProps {
  top?: CSSProperties['top'];
  left?: CSSProperties['left'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
  fullWidth?: boolean;
}

/**
 * position:absolute 배치 컴포넌트 12종(top/bottom/center-absolute 패밀리)의
 * 공통 sx 조립·ref 전달·props 스프레드 로직을 흡수하는 내부 전용 팩토리.
 * 각 파일의 공개 Props 타입은 이 팩토리와 무관하게 파일별로 직접 선언한다.
 *
 * sx 병합 우선순위(뒤로 갈수록 우선): position → axes(축별 계산값) →
 * config.fixedStyle → fullWidth에 의한 width:100% → 마지막으로 호출자가
 * 전달한 sx prop이 배열 끝에 스프레드되어 위 계산값을 모두 덮어쓴다.
 *
 * `domProps[axis.cssProp] ?? axis.defaultValue`는 nullish coalescing이므로
 * 원래 파일별 기본 매개변수 문법(`{ top = 0 }`)과 달리 명시적 `null`도
 * "기본값 사용"으로 취급한다. `CSSProperties`의 position 값은 타입상 `null`을
 * 허용하지 않아 타입 있는 호출자에는 영향 없음 — 회귀가 아닌 의도된 사소한 동작 확장.
 */
export function createAbsoluteBox(
  config: AbsoluteBoxConfig,
): FunctionComponent<AbsoluteBoxRenderProps> {
  const Component = ((allProps: AbsoluteBoxRenderProps) => {
    const { sx, ref, ...domProps } = allProps;

    let fullWidth: boolean | undefined;
    if (config.supportsFullWidth) {
      fullWidth = domProps.fullWidth;
      delete domProps.fullWidth;
    }

    const axisStyle: Record<string, unknown> = {};
    for (const axis of config.axes) {
      axisStyle[axis.cssProp] = domProps[axis.cssProp] ?? axis.defaultValue;
      delete domProps[axis.cssProp];
    }

    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            ...axisStyle,
            ...config.fixedStyle,
            ...(fullWidth ? { width: '100%' } : {}),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...domProps}
      />
    );
  }) as FunctionComponent<AbsoluteBoxRenderProps>;

  Component.displayName = config.displayName;
  return Component;
}
