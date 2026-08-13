import type { BoxProps } from '@mui/material';
import type { CSSProperties, FunctionComponent } from 'react';
import { createAbsoluteBox } from '../absolute-box/create-absolute-box.js';

/**
 * `TopAbsoluteRight` 컴포넌트의 속성을 정의합니다.
 */
export interface TopAbsoluteRightProps extends BoxProps {
  /**
   * 컴포넌트가 부모 컨테이너의 전체 너비를 차지하도록 설정합니다.
   *
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 상단 위치를 설정합니다. CSS의 `top` 속성과 동일합니다.
   *
   * @default 0
   */
  top?: CSSProperties['top'];

  /**
   * 우측 위치를 설정합니다. CSS의 `right` 속성과 동일합니다.
   *
   * @default 0
   */
  right?: CSSProperties['right'];
}

/**
 * `TopAbsoluteRight` 컴포넌트는 요소를 상단 우측에 배치하는 데 사용됩니다.
 *
 * - `position: "absolute"`를 기본으로 설정합니다.
 * - `top`과 `right` 속성을 사용하여 요소의 위치를 조정할 수 있습니다.
 * - `fullWidth` 속성을 사용하여 너비를 100%로 설정할 수 있습니다.
 *
 * @param props - `TopAbsoluteRightProps` 속성
 * @returns 상단 우측에 배치된 스타일의 박스를 렌더링합니다.
 *
 * @example
 * ```tsx
 * <TopAbsolute.Right top="10px" right="20px" fullWidth>
 *   상단 우측에 위치한 요소
 * </TopAbsolute.Right>
 * ```
 */
export const TopAbsoluteRight = createAbsoluteBox({
  displayName: 'TopAbsolute.Right',
  axes: [
    { cssProp: 'right', defaultValue: 0 },
    { cssProp: 'top', defaultValue: 0 },
  ],
  supportsFullWidth: true,
}) as FunctionComponent<TopAbsoluteRightProps>;
