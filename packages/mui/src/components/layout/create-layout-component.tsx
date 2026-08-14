import { Box, type BoxProps, Stack, type StackProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { overrideProps } from '../../util/override-props.js';

export type LayoutBase = 'stack' | 'box';

export interface LayoutComponentConfig {
  displayName: string;
  base: LayoutBase;
  direction: 'row' | 'column';
  defaultProps?: {
    justifyContent?: CSSProperties['justifyContent'];
    alignItems?: CSSProperties['alignItems'];
  };
  supportsCenterProp?: boolean;
}

export interface LayoutComponentRenderProps extends BoxProps {
  center?: boolean;
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  flexWrap?: CSSProperties['flexWrap'];
  inlineFlex?: boolean;
}

/**
 * Stack 계열(justify/align 변형)과 Flex 계열(justify/align + flexWrap/inlineFlex 변형)의
 * 서브변형·메인 컴포넌트 sx 조립·ref 전달·props 스프레드 로직을 흡수하는 내부 전용 팩토리.
 * 각 파일의 공개 Props 타입은 이 팩토리와 무관하게 파일별로 직접 선언하고, 팩토리 반환값을
 * 해당 타입으로 캐스트해 사용한다.
 *
 * center 정책은 base에 암묵적으로 연동된다: base==='stack'이면 center가 명시
 * alignItems/justifyContent를 무시하고 강제 override, base==='box'면 center는 기본값일
 * 뿐이고 명시 prop이 있으면 그게 우선한다(기존 StackColumn/StackRow vs FlexColumn/FlexRow
 * 동작 차이를 그대로 보존).
 *
 * @remarks
 * 반환 타입은 `base` 값과 무관하게 항상 `LayoutComponentRenderProps`(= `BoxProps` +
 * `flexWrap`/`inlineFlex`)이지만, `base:'stack'` 렌더 경로는 `flexWrap`/`inlineFlex`를
 * 내부적으로 무시한다(MUI `Stack`이 지원하지 않으므로). 따라서 이 함수를 호출하는 쪽은
 * Stack 계열에 한해 반드시 `flexWrap`/`inlineFlex`/`center`가 없는 좁은 타입으로 캐스트해야
 * 공개 타입 표면이 실제 동작과 어긋나지 않는다(`components/stack/StackColumn.tsx`의
 * `StackColumnSubVariantProps` 캐스트 참고).
 */
export function createLayoutComponent(
  config: LayoutComponentConfig,
): FunctionComponent<LayoutComponentRenderProps> {
  const staticDefaults = config.defaultProps ?? {};

  const Component = ((allProps: LayoutComponentRenderProps) => {
    const { center, alignItems, justifyContent, flexWrap, inlineFlex, sx, ref, ...domProps } =
      allProps;

    const centerActive = Boolean(config.supportsCenterProp && center);
    const centerDefaults = { alignItems: 'center' as const, justifyContent: 'center' as const };

    let resolvedStyle: {
      alignItems?: CSSProperties['alignItems'];
      justifyContent?: CSSProperties['justifyContent'];
      flexWrap?: CSSProperties['flexWrap'];
    };
    if (config.base === 'stack') {
      resolvedStyle = centerActive
        ? centerDefaults
        : overrideProps(staticDefaults, { alignItems, justifyContent });
    } else {
      resolvedStyle = overrideProps(centerActive ? centerDefaults : staticDefaults, {
        alignItems,
        justifyContent,
        flexWrap,
      });
    }

    const sxArray = Array.isArray(sx) ? sx : [sx];

    if (config.base === 'stack') {
      return (
        <Stack
          direction={config.direction}
          {...(domProps as StackProps)}
          ref={ref as React.Ref<HTMLDivElement>}
          sx={[resolvedStyle, ...sxArray]}
        />
      );
    }

    return (
      <Box
        ref={ref}
        sx={[
          {
            display: inlineFlex ? 'inline-flex' : 'flex',
            flexDirection: config.direction,
            ...resolvedStyle,
          },
          ...sxArray,
        ]}
        {...domProps}
      />
    );
  }) as FunctionComponent<LayoutComponentRenderProps>;

  Component.displayName = config.displayName;
  return Component;
}
