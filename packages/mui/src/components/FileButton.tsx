'use client';

import type { ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useComposedRefs } from '../hooks/useComposedRefs.js';

export interface FileButtonProps<Multiple extends boolean = false> {
  /**
   * 파일이 선택되었을 때 호출되는 콜백 함수입니다.
   *
   * @param payload - 선택된 파일 또는 파일 배열 (다중 파일 선택 여부에 따라 달라짐)
   */
  onChange: (payload: Multiple extends true ? File[] : File) => void;

  /**
   * 버튼 렌더링에 필요한 속성을 제공하는 콜백 함수입니다.
   *
   * @param props - 렌더링할 버튼의 속성
   * @param props.onClick - 파일 선택 다이얼로그를 여는 함수
   *
   * @returns React 노드
   */
  children: (props: { onClick: () => void }) => ReactNode;

  /**
   * 사용자가 여러 파일을 선택할 수 있는지 여부를 결정합니다.
   *
   * @default false
   */
  multiple?: Multiple;

  /**
   * 파일 입력의 `accept` 속성입니다.
   * 선택할 수 있는 파일 유형을 지정합니다.
   *
   * @example "image/png,image/jpeg"
   */
  accept?: string;

  /**
   * 파일 입력의 `name` 속성입니다.
   */
  name?: string;

  /**
   * 파일 입력의 `form` 속성입니다.
   */
  form?: string;

  /**
   * 값이 `null` 또는 빈 배열로 변경될 때 호출되는 함수의 참조입니다.
   */
  resetRef?: React.ForwardedRef<() => void>;

  /**
   * 파일 선택기를 비활성화합니다.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * 새 파일을 캡처할 때 사용할 장치를 지정합니다.
   *
   * @example "user" (사용자 측 카메라), "environment" (환경 카메라)
   */
  capture?: boolean | 'user' | 'environment';

  /**
   * 파일 입력 요소에 전달할 추가 속성입니다.
   */
  inputProps?: React.ComponentPropsWithoutRef<'input'>;
}

/**
 * 주어진 참조(ref)에 값을 할당합니다.
 *
 * @param ref - React 참조
 * @param value - 할당할 값
 */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (typeof ref === 'object' && ref !== null && 'current' in ref) {
    (ref as React.RefObject<T>).current = value;
  }
}

type FileButtonComponent = (<Multiple extends boolean = false>(
  props: FileButtonProps<Multiple>,
) => React.ReactElement) & { displayName?: string };

/**
 * 파일 선택 버튼 컴포넌트입니다.
 *
 * 사용자가 파일을 선택하거나 새로 캡처할 수 있는 버튼을 렌더링합니다.
 *
 * @param props - `FileButtonProps` 속성
 * @returns 파일 선택 버튼을 렌더링합니다.
 *
 * @example
 * ```tsx
 * <FileButton onChange={(file) => console.log(file)} accept="image/png,image/jpeg">
 *   {({ onClick }) => <button onClick={onClick}>파일 선택</button>}
 * </FileButton>
 * ```
 */
export const FileButton: FileButtonComponent = forwardRef<HTMLInputElement, FileButtonProps>(
  (props, ref) => {
    const {
      onChange,
      children,
      multiple,
      accept,
      name,
      form,
      resetRef,
      disabled,
      capture,
      inputProps,
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);
    const [openRequest, setOpenRequest] = useState(0);

    /**
     * 파일 선택 다이얼로그를 엽니다.
     */
    const onClick = useCallback(() => {
      if (disabled) return;
      setOpenRequest((v) => v + 1);
    }, [disabled]);

    useEffect(() => {
      if (openRequest === 0) return;
      inputRef.current?.click();
    }, [openRequest]);

    /**
     * 파일 선택 후 호출됩니다.
     * @param event - 파일 입력 변경 이벤트
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget?.files;
      if (!files) return;
      if (multiple) {
        onChange(Array.from(files) as Multiple extends true ? File[] : File);
      } else {
        const file = files[0];
        if (file) {
          onChange(file);
        }
      }
    };

    // 파일 선택 상태를 초기화합니다.
    const reset = useCallback(() => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }, []);

    useEffect(() => {
      if (!resetRef) return;
      assignRef(resetRef, reset);
      return () => {
        assignRef(resetRef, () => {});
      };
    }, [resetRef, reset]);
    return (
      <>
        {children({ onClick })}
        <input
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          ref={useComposedRefs(ref, inputRef)}
          name={name}
          form={form}
          capture={capture}
          {...inputProps}
        />
      </>
    );
  },
) as FileButtonComponent;

FileButton.displayName = 'FileButton';
