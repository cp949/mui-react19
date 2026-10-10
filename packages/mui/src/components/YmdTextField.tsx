'use client';

import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import type { ChangeEvent } from 'react';
import { formatNumericDateWhenComplete, normalizeNumericDate } from '../util/ymd-date.js';

/**
 * 숫자 기반 생년월일 입력을 다루는 텍스트 필드 속성입니다.
 *
 * 핵심 계약:
 * - `value`는 "숫자만" 보관한다. (예: `19900101`)
 * - `onChange`는 항상 정규화된 숫자 문자열을 전달한다.
 * - `format`은 필수이며, 표시 포맷 기준(6자리/8자리)을 결정한다.
 */
export interface YmdTextFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  /**
   * 제어값(숫자만).
   *
   * @example
   * - `990101`
   * - `19900101`
   */
  value: string;

  /**
   * 값 변경 핸들러.
   * 사용자 입력 문자열은 내부에서 숫자만 남긴 뒤 이 콜백으로 전달된다.
   */
  onChange: (value: string) => void;

  /**
   * 화면 표시용 포맷 문자열.
   *
   * - `YYYY`가 포함되면 8자리 입력이 완성됐을 때 포맷이 적용된다.
   * - `YY`(without `YYYY`)가 포함되면 6자리 입력이 완성됐을 때 포맷이 적용된다.
   *
   * @example
   * - `YYYY-MM-DD`
   * - `YY/MM/DD`
   */
  format: string;
}

/**
 * YYMMDD / YYYYMMDD 날짜 입력 전용 `TextField`.
 *
 * 동작 규칙:
 * - 표시값은 `formatNumericDateWhenComplete`를 사용해 "완성 길이(6/8)"에서만 포맷 적용
 * - 입력값은 `normalizeNumericDate`로 숫자 외 문자를 제거한 뒤 부모 상태로 전달
 * - `placeholder` 미지정 시 `format` 문자열을 그대로 표시
 * - 모바일 숫자 키패드를 위해 `input`에 `inputMode='numeric'`을 적용 (`slotProps.htmlInput`으로 덮어쓸 수 있음)
 */
export function YmdTextField(props: YmdTextFieldProps) {
  const { value, onChange, format, placeholder, slotProps, ...textFieldProps } = props;

  // 사용자가 입력한 값을 숫자 문자열로 정규화해 부모 상태에 전달합니다.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value ?? '';

    onChange(normalizeNumericDate(next));
  };

  // inputMode는 TextField 루트 div가 아니라 실제 input에 적용해야 숫자 키패드가 뜬다.
  const userHtmlInput = slotProps?.htmlInput;
  const htmlInput =
    typeof userHtmlInput === 'function'
      ? (ownerState: Parameters<typeof userHtmlInput>[0]) => ({
          inputMode: 'numeric' as const,
          ...userHtmlInput(ownerState),
        })
      : { inputMode: 'numeric' as const, ...userHtmlInput };

  return (
    <TextField
      // 길이가 format 요구 길이와 일치할 때만 자동 포맷한다.
      value={formatNumericDateWhenComplete(value ?? '', { format })}
      onChange={handleChange}
      placeholder={placeholder ?? format}
      {...textFieldProps}
      slotProps={{ ...slotProps, htmlInput }}
    />
  );
}
