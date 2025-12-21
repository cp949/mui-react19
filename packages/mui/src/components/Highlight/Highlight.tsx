import type { SxProps, Theme, TypographyProps } from '@mui/material';
import { Typography } from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useMemo, type CSSProperties } from 'react';
import { Mark } from '../Mark.js';
import { highlighter } from './highlighter/highlighter.js';

/**
 * 특정 텍스트의 부분 문자열을 강조 표시하는 컴포넌트입니다.
 *
 * - `highlight` 속성을 사용해 강조 표시할 문자열 또는 문자열 배열을 지정할 수 있습니다.
 * - 강조 표시된 텍스트는 `Mark` 컴포넌트를 사용하여 스타일링됩니다.
 * - 다양한 사용자 정의 스타일과 속성을 지원합니다.
 */
export interface HighlightProps {
  /**
   * `sx` 속성을 사용해 스타일을 추가로 설정할 수 있습니다.
   */
  sx?: SxProps<Theme>;

  /**
   * 추가로 적용할 CSS 클래스 이름입니다.
   */
  className?: string;

  /**
   * 인라인 스타일을 적용할 수 있습니다.
   */
  style?: CSSProperties;

  /**
   * MUI `Typography` 컴포넌트의 `variant` 속성입니다.
   */
  variant?: TypographyProps['variant'];

  /**
   * 강조 표시할 부분 문자열 또는 문자열 배열입니다.
   *
   * @example
   * ```tsx
   * <Highlight highlight="React">React is amazing!</Highlight>
   * <Highlight highlight={["React", "amazing"]}>React is amazing!</Highlight>
   * ```
   */
  highlight: string | string[];

  /**
   * 강조 표시된 텍스트의 색상을 지정합니다.
   * `theme.colors` 키 또는 유효한 CSS 색상 값을 사용할 수 있습니다.
   * 기본값은 `yellow`입니다.
   */
  color?: string;

  /**
   * 강조 표시된 텍스트에 적용할 추가 스타일입니다.
   */
  highlightSx?: SxProps;

  /**
   * 강조 표시 작업을 수행할 문자열입니다.
   */
  children: string;

  /**
   * 대소문자를 무시하고 강조 표시할지 여부를 설정합니다.
   *
   * @default false
   */
  ignorecase?: boolean;

  /**
   * 강조 표시된 텍스트에 `data-highlight` 속성을 추가할지 여부를 설정합니다.
   *
   * @default false
   */
  includeDataAttribute?: boolean;
}

/**
 * `Highlight` 컴포넌트는 주어진 텍스트에서 특정 문자열을 강조 표시합니다.
 *
 * - 강조 표시된 텍스트는 `Mark` 컴포넌트를 사용하여 스타일링됩니다.
 * - 대소문자 무시, 사용자 정의 색상 및 스타일 등 다양한 옵션을 제공합니다.
 *
 * @param props - `HighlightProps` 속성
 * @returns 강조 표시된 텍스트를 포함한 `Typography` 컴포넌트를 렌더링합니다.
 *
 * @example
 * ```tsx
 * <Highlight
 *   highlight="highlight"
 *   color="red"
 *   ignorecase
 *   includeDataAttribute
 * >
 *   This is a highlight example.
 * </Highlight>
 * ```
 */
export const Highlight = forwardRef<HTMLElement, HighlightProps>((props, ref) => {
  const {
    sx,
    className,
    style,
    variant,
    highlight,
    color,
    highlightSx,
    ignorecase = false,
    includeDataAttribute = false,
    children,
    ...restProps
  } = props;

  const highlightChunks = useMemo<{ chunk: string; highlighted: boolean }[]>(
    () => highlighter(children, highlight, { ignorecase }),
    [children, highlight, ignorecase],
  );

  return (
    <Typography
      ref={ref}
      variant={variant}
      className={clsx('Highlight-root', className)}
      sx={sx}
      style={style}
      {...restProps}
    >
      {highlightChunks.map(({ chunk, highlighted }, i) =>
        highlighted ? (
          includeDataAttribute ? (
            <Mark key={i} color={color} sx={highlightSx} data-highlight={chunk}>
              {chunk}
            </Mark>
          ) : (
            <Mark key={i} color={color} sx={highlightSx}>
              {chunk}
            </Mark>
          )
        ) : (
          <span key={i}>{chunk}</span>
        ),
      )}
    </Typography>
  );
});

Highlight.displayName = 'Highlight';
