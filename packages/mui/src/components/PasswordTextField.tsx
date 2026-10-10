'use client';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { createSvgIcon } from '@mui/material/utils';
import type { MouseEvent } from 'react';
import { useState } from 'react';

// @mui/icons-material을 peer로 요구하지 않기 위해 Material Icons의 경로를 직접 정의한다.
const VisibilityIcon = createSvgIcon(
  <path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3' />,
  'Visibility',
);

const VisibilityOffIcon = createSvgIcon(
  <path d='M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z' />,
  'VisibilityOff',
);

/**
 * 비밀번호 표시 상태를 전환할 수 있는 입력 컴포넌트의 속성입니다.
 *
 * `type`은 내부에서 `password`/`text`로 전환하므로 받지 않습니다.
 */
export type PasswordTextFieldProps = Omit<TextFieldProps, 'type'> & {
  /** 비밀번호가 가려져 있을 때 토글 버튼의 접근성 레이블입니다. 기본값: `비밀번호 보기` */
  showLabel?: string;

  /** 비밀번호가 표시되어 있을 때 토글 버튼의 접근성 레이블입니다. 기본값: `비밀번호 숨기기` */
  hideLabel?: string;
};

/**
 * 비밀번호를 마스킹 상태와 평문 상태로 전환해 표시하는 `TextField`.
 *
 * 동작 규칙:
 * - 끝 장식(endAdornment)에 보기/숨기기 토글 버튼을 둔다.
 * - 버튼 크기는 `size`를 따르고, `disabled`이면 버튼도 비활성화한다.
 * - `slotProps.input.endAdornment`를 지정하면 기본 토글 버튼 대신 그 값을 쓴다.
 * - `slotProps.input` 외 슬롯(`htmlInput` 등)은 그대로 전달한다.
 */
export function PasswordTextField(props: PasswordTextFieldProps) {
  const {
    slotProps,
    size,
    disabled,
    showLabel = '비밀번호 보기',
    hideLabel = '비밀번호 숨기기',
    ...rest
  } = props;
  const [visible, setVisible] = useState(false);

  // 비밀번호 표시 상태를 토글합니다.
  const handleToggleVisibility = () => {
    setVisible((previousVisible) => !previousVisible);
  };

  // 마우스 다운 시 입력 포커스가 불필요하게 바뀌지 않도록 막습니다.
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const toggleAdornment = (
    <InputAdornment position='end'>
      <IconButton
        aria-label={visible ? hideLabel : showLabel}
        edge='end'
        disabled={disabled}
        onClick={handleToggleVisibility}
        onMouseDown={handleMouseDown}
        size={size === 'small' ? 'small' : 'medium'}
      >
        {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </IconButton>
    </InputAdornment>
  );

  // 사용자가 넘긴 input 슬롯(객체 또는 함수)과 병합한다. 사용자 값이 우선한다.
  const userInput = slotProps?.input;
  const input =
    typeof userInput === 'function'
      ? (ownerState: Parameters<typeof userInput>[0]) => ({
          endAdornment: toggleAdornment,
          ...userInput(ownerState),
        })
      : { endAdornment: toggleAdornment, ...userInput };

  return (
    <TextField
      type={visible ? 'text' : 'password'}
      size={size}
      disabled={disabled}
      {...rest}
      slotProps={{ ...slotProps, input }}
    />
  );
}
