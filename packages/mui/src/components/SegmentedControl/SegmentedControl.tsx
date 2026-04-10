import type { SxProps, Theme, TypographyProps } from '@mui/material';
import { Box } from '@mui/material';
import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { useComposedRefs } from '../../hooks/useComposedRefs.js';
import { useId } from '../../hooks/useId.js';
import { useUncontrolled } from '../../hooks/useUncontrolled.js';
import FloatingIndicator from '../FloatingIndicator/index.js';
import {
  SegmentedControlInput,
  SegmentedControlItem,
  SegmentedControlLabel,
  SegmentedControlRoot,
} from './components.js';

/**
 * 불리언 값이 true인 경우 true를 반환하고, 그렇지 않으면 undefined를 반환하는 함수입니다.
 * @param value true, false, 또는 undefined일 수 있는 값
 * @returns true 또는 undefined
 */
function trueOrUndef(value: boolean | null | undefined): true | undefined {
  return value ? true : undefined;
}

export interface SegmentedControlItem {
  /** 항목의 값 */
  value: string;

  /** 항목의 레이블 (내용) */
  label: ReactNode;

  /** 항목이 비활성화되었는지 여부 */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  sx?: SxProps<Theme>;

  className?: string;

  style?: CSSProperties;

  disabled?: boolean;

  /** 렌더링할 데이터를 기반으로 컨트롤 항목이 생성됩니다. */
  data: (string | SegmentedControlItem)[];

  /** 컨트롤된 컴포넌트의 값 */
  value?: string;

  /** 비제어 컴포넌트의 기본값 */
  defaultValue?: string;

  /** 값이 변경될 때 호출되는 함수 */
  onChange?: (value: string) => void;

  /** 부모의 100% 너비를 사용할지 여부, 기본값은 false */
  fullWidth?: boolean;

  /** 인디케이터의 전환 시간(ms), 기본값은 200 */
  transitionDuration?: number;

  /** 인디케이터의 transition-timing-function 속성, 기본값은 'ease' */
  transitionTimingFunction?: string;

  /** 컴포넌트가 수직 방향으로 표시될지 여부, 기본값은 'horizontal' */
  vertical?: boolean;

  /** 값이 변경될 수 있는지 여부, 읽기 전용 모드일 경우 변경 불가 */
  readOnly?: boolean;

  /** 항목의 경계를 표시할지 여부 */
  withItemBorder?: boolean;

  /** 항목 레이블의 기본 색상 */
  primaryColor?: TypographyProps['color'];

  /** 항목 레이블의 보조 색상 */
  secondaryColor?: TypographyProps['color'];

  /** 인디케이터로 표시할 ReactNode */
  indicator?: ReactNode;

  /** 컴포넌트 크기, 'small', 'medium', 'large' 중 하나 */
  size?: 'small' | 'medium' | 'large';
}

/**
 * 세그먼트 컨트롤 컴포넌트는 여러 항목 중 하나를 선택하는 UI 컴포넌트입니다.
 * 각 항목은 라디오 버튼처럼 동작하며, 선택 시 인디케이터가 항목에 맞춰 이동합니다.
 * @param props 세그먼트 컨트롤의 다양한 설정을 정의하는 props
 * @returns 세그먼트 컨트롤 컴포넌트
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>((props, ref) => {
  const {
    sx,
    className,
    style,
    disabled,
    data,
    value,
    defaultValue,
    onChange,
    fullWidth,
    withItemBorder,
    primaryColor = 'primary',
    secondaryColor = 'textSecondary',
    transitionDuration,
    transitionTimingFunction,
    vertical,
    readOnly,
    size = 'medium',
    indicator,
  } = props;

  // data 항목이 문자열이면 객체로 변환하여 처리
  const _data = data.map((item) =>
    typeof item === 'string' ? { label: item, value: item } : item,
  );
  const [parent, setParent] = useState<HTMLElement | null>(null); // 부모 요소 상태
  const [refs, setRefs] = useState<Record<string, HTMLElement | null>>({}); // 항목 참조 상태

  // 각 항목에 대한 참조를 설정하는 함수
  const setElementRef = (val: string) => (element: HTMLElement | null) => {
    refs[val] = element;
    setRefs(refs);
  };

  // 비제어 컴포넌트 값 상태 관리
  const [_value, handleValueChange] = useUncontrolled({
    value,
    defaultValue,
    finalValue: Array.isArray(data)
      ? (_data.find((item) => !item.disabled)?.value ?? _data[0]?.value ?? undefined)
      : undefined,
    onChange,
  });

  const uuid = useId(); // 고유 ID 생성
  const mergedRef = useComposedRefs(ref, setParent); // ref 결합

  // 데이터가 비어있으면 렌더링하지 않음
  if (data.length === 0) {
    return null;
  }

  return (
    <SegmentedControlRoot
      className={clsx('SegmentedControl-root', className, {
        x_readOnly: readOnly,
        x_fullWidth: fullWidth,
        'Mui-disabled': disabled,
        'Mui-readOnly': readOnly,
      })}
      sx={sx}
      style={style}
      ref={mergedRef}
      role='radiogroup'
      data-vertical={trueOrUndef(vertical)} // 수직 여부
      data-fullwidth={trueOrUndef(fullWidth)} // 100% 너비 여부
      data-with-item-border={trueOrUndef(withItemBorder)} // 항목 경계 표시 여부
      data-size={size} // 크기 설정
    >
      {typeof _value === 'string' && (
        <FloatingIndicator
          className='SegmentedControl-indicator'
          component='span'
          target={refs[_value]} // 인디케이터 대상
          parent={parent} // 부모 요소
          transitionDuration={transitionDuration} // 전환 시간
          sx={{
            display: 'block',
            zIndex: 1,
            borderRadius: 1,
            bgcolor: '#fff',
            // boxShadow는 mantine에서 복사
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
          }}
        >
          {indicator}
        </FloatingIndicator>
      )}
      {_data.map((item) => (
        <SegmentedControlItem
          key={item.value}
          className={clsx('SegmentedControl-item', {
            'Mui-active': _value === item.value,
            'Mui-disabled': item.disabled || disabled,
            'Mui-readOnly': readOnly,
          })}
          transitionDuration={transitionDuration}
          transitionTimingFunction={transitionTimingFunction}
        >
          <SegmentedControlInput
            component='input'
            className='SegmentedControl-input'
            key={`${item.value}-input`}
            type='radio'
            name={uuid}
            value={item.value}
            checked={_value === item.value}
            id={`${uuid}-${item.value}`}
            onChange={() => {
              if (!readOnly && !item.disabled && !disabled) {
                handleValueChange(item.value);
              }
            }}
          />
          <SegmentedControlLabel
            component='label'
            key={`${item.value}-label`}
            className='SegmentedControl-label'
            ref={setElementRef(item.value)}
            htmlFor={`${uuid}-${item.value}`}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            transitionDuration={transitionDuration}
            transitionTimingFunction={transitionTimingFunction}
          >
            <Box
              component='span'
              sx={{
                position: 'relative',
                zIndex: 2,
              }}
            >
              {item.label}
            </Box>
          </SegmentedControlLabel>
        </SegmentedControlItem>
      ))}
    </SegmentedControlRoot>
  );
});

SegmentedControl.displayName = 'SegmentedControl';
