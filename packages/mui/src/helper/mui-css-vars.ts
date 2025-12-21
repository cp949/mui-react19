import { alpha as muiAlpha } from '@mui/material';

function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    return clamp(value, max, min);
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * 특정 MUI 팔레트 색상의 CSS 변수 문자열을 생성합니다.
 *
 * @param paletteName - MUI 팔레트 이름 ('primary', 'secondary', 'error', 'success', 'warning' 등)
 * @param shade - 색상 계층 ('main', 'light', 'dark') (기본값: 'main')
 * @returns CSS 변수 문자열 (예: `var(--mui-palette-primary-mainChannel)`)
 *
 * @example
 * // 기본 사용 예시
 * colorChannelVar('primary', 'dark'); => "var(--mui-palette-primary-darkChannel)"
 *
 *
 * @example
 * // 기본값 사용 예시
 * colorChannelVar('secondary'); => "var(--mui-palette-secondary-mainChannel)"
 */
export function colorChannel(
  paletteName: 'primary' | 'secondary' | 'warning' | 'info' | 'error' | 'success' | 'warning',
  shade: 'main' | 'light' | 'dark' | 'contrastText' = 'main',
): string {
  return `var(--mui-palette-${paletteName}-${shade}Channel)`;
}

/**
 * 특정 MUI 팔레트 색상의 CSS 변수 문자열을 생성합니다.
 *
 * @param paletteName - MUI 팔레트 이름 ('primary', 'secondary', 'warning', 'error', 'success')
 * @param shade - 색상 계층 ('main', 'light', 'dark') (기본값: 'main')
 * @returns CSS 변수 문자열 (예: `var(--mui-palette-primary-main)`)
 *
 * @example
 * // 기본 사용 예시
 * const cssVar = colorVar('primary', 'light');
 * // 결과: "var(--mui-palette-primary-light)"
 *
 * @example
 * // 기본값 사용 예시
 * const cssVar = colorVar('secondary');
 * // 결과: "var(--mui-palette-secondary-main)"
 */
export function color(
  paletteName: 'primary' | 'secondary' | 'warning' | 'info' | 'error' | 'success' | 'warning',
  shade: 'main' | 'light' | 'dark' | 'contrastText' = 'main',
) {
  return `var(--mui-palette-${paletteName}-${shade})`;
}

/**
 * 특정 MUI 팔레트 색상의 RGBA CSS 변수 문자열을 생성합니다.
 *
 * @param paletteName - MUI 팔레트 이름 ('primary', 'secondary', 'warning', 'error', 'success')
 * @param shade - 색상 계층 ('main', 'light', 'dark') (예: main 색상, 밝은 색상, 어두운 색상)
 * @param alpha - 투명도 값 (0과 1 사이의 숫자, 예: 0.1은 10% 투명)
 * @returns RGBA CSS 변수 문자열 (예: `rgba(var(--mui-palette-primary-mainChannel)/0.5)`)
 *
 * @example
 * // 기본 사용 예시
 * const rgbaVar = rgba('primary', 'main', 0.5);
 * // 결과: "rgba(var(--mui-palette-primary-mainChannel)/0.5)"
 *
 * @example
 * // 다른 팔레트와 밝기 사용 예시
 * const rgbaVar = rgba('secondary', 'light', 0.8);
 * // 결과: "rgba(var(--mui-palette-secondary-lightChannel)/0.8)"
 */
export function rgba(
  paletteName: 'primary' | 'secondary' | 'warning' | 'info' | 'error' | 'success' | 'warning',
  shade: 'main' | 'light' | 'dark' | 'contrastText',
  alpha: number,
) {
  return `rgba(var(--mui-palette-${paletteName}-${shade}Channel)/${alpha})`;
}

type ApplyAlphaFn = (color: string, opacity: number) => string;
// const sss = (c: string, alpha: ApplyAlphaFn) => `0px 2px 1px -1px ${alpha(c, 0.2)},0px 1px 1px 0px ${alpha(c, 0.14)},0px 1px 3px 0px ${alpha(c, 0.12)}`;

// copy from https://mui.com/material-ui/customization/default-theme/
// shadow 23개
const PREDEFINED_SHADOWS = [
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 2px 1px -1px ${alpha(c, 0.2)},0px 1px 1px 0px ${alpha(c, 0.14)},0px 1px 3px 0px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 3px 1px -2px ${alpha(c, 0.2)},0px 2px 2px 0px ${alpha(c, 0.14)},0px 1px 5px 0px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 3px 3px -2px ${alpha(c, 0.2)},0px 3px 4px 0px ${alpha(c, 0.14)},0px 1px 8px 0px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 2px 4px -1px ${alpha(c, 0.2)},0px 4px 5px 0px ${alpha(c, 0.14)},0px 1px 10px 0px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 3px 5px -1px ${alpha(c, 0.2)},0px 5px 8px 0px ${alpha(c, 0.14)},0px 1px 14px 0px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 3px 5px -1px ${alpha(c, 0.2)},0px 6px 10px 0px ${alpha(c, 0.14)},0px 1px 18px 0px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 4px 5px -2px ${alpha(c, 0.2)},0px 7px 10px 1px ${alpha(c, 0.14)},0px 2px 16px 1px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 5px 5px -3px ${alpha(c, 0.2)},0px 8px 10px 1px ${alpha(c, 0.14)},0px 3px 14px 2px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 5px 6px -3px ${alpha(c, 0.2)},0px 9px 12px 1px ${alpha(c, 0.14)},0px 3px 16px 2px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 6px 6px -3px ${alpha(c, 0.2)},0px 10px 14px 1px ${alpha(c, 0.14)},0px 4px 18px 3px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 6px 7px -4px ${alpha(c, 0.2)},0px 11px 15px 1px ${alpha(c, 0.14)},0px 4px 20px 3px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 7px 8px -4px ${alpha(c, 0.2)},0px 12px 17px 2px ${alpha(c, 0.14)},0px 5px 22px 4px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 7px 8px -4px ${alpha(c, 0.2)},0px 13px 19px 2px ${alpha(c, 0.14)},0px 5px 24px 4px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 7px 9px -4px ${alpha(c, 0.2)},0px 14px 21px 2px ${alpha(c, 0.14)},0px 5px 26px 4px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 8px 9px -5px ${alpha(c, 0.2)},0px 15px 22px 2px ${alpha(c, 0.14)},0px 6px 28px 5px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 8px 10px -5px ${alpha(c, 0.2)},0px 16px 24px 2px ${alpha(c, 0.14)},0px 6px 30px 5px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 8px 11px -5px ${alpha(c, 0.2)},0px 17px 26px 2px ${alpha(c, 0.14)},0px 6px 32px 5px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 9px 11px -5px ${alpha(c, 0.2)},0px 18px 28px 2px ${alpha(c, 0.14)},0px 7px 34px 6px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 9px 12px -6px ${alpha(c, 0.2)},0px 19px 29px 2px ${alpha(c, 0.14)},0px 7px 36px 6px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 10px 13px -6px ${alpha(c, 0.2)},0px 20px 31px 3px ${alpha(c, 0.14)},0px 8px 38px 7px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 10px 13px -6px ${alpha(c, 0.2)},0px 21px 33px 3px ${alpha(c, 0.14)},0px 8px 40px 7px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 10px 14px -6px ${alpha(c, 0.2)},0px 22px 35px 3px ${alpha(c, 0.14)},0px 8px 42px 7px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 11px 14px -7px ${alpha(c, 0.2)},0px 23px 36px 3px ${alpha(c, 0.14)},0px 9px 44px 8px ${alpha(c, 0.12)}`,
  (c: string, alpha: ApplyAlphaFn) =>
    `0px 11px 15px -7px ${alpha(c, 0.2)},0px 24px 38px 3px ${alpha(c, 0.14)},0px 9px 46px 8px ${alpha(c, 0.12)}`,
];

export function shadowValue(index: number, hexColor = '#000'): string {
  const idx = clamp(index, 0, PREDEFINED_SHADOWS.length - 1);
  if (idx === 0) {
    return 'none';
  }
  return PREDEFINED_SHADOWS[idx - 1]?.(hexColor, muiAlpha) || 'none';
}

export function shadow(
  paletteName: 'primary' | 'secondary' | 'warning' | 'info' | 'error' | 'success' | 'warning',
  shade: 'main' | 'light' | 'dark' | 'contrastText',
  index: number,
): string {
  //ex: --mui-palette-primary-mainChannel
  const cssVar = `var(--mui-palette-${paletteName}-${shade}Channel)`;

  const idx = clamp(index, 0, PREDEFINED_SHADOWS.length - 1);
  if (idx === 0) {
    return 'none';
  }

  // ex: channelVar: 244 24 23, opacity: 0.2
  const alphaFn = (channelVar: string, opacity: number) => `rgba(${channelVar}/${opacity})`;

  return PREDEFINED_SHADOWS[idx - 1]?.(cssVar, alphaFn) || 'none';
}
