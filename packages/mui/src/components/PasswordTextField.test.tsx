import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PasswordTextField, type PasswordTextFieldProps } from './PasswordTextField.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('PasswordTextField', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (props: PasswordTextFieldProps = {}) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<PasswordTextField {...props} />);
    });
    return {
      input: container.querySelector('input') as HTMLInputElement,
      button: container.querySelector('button') as HTMLButtonElement | null,
    };
  };

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
  });

  it('처음에는 비밀번호를 가린 상태로 표시한다', () => {
    const { input } = render();
    expect(input.type).toBe('password');
  });

  it('토글 버튼을 누르면 평문으로 바뀌고 다시 누르면 가린다', () => {
    const { input, button } = render();

    act(() => {
      button?.click();
    });
    expect(input.type).toBe('text');

    act(() => {
      button?.click();
    });
    expect(input.type).toBe('password');
  });

  it('기본 접근성 레이블이 상태에 따라 바뀐다', () => {
    const { button } = render();
    expect(button?.getAttribute('aria-label')).toBe('비밀번호 보기');

    act(() => {
      button?.click();
    });
    expect(button?.getAttribute('aria-label')).toBe('비밀번호 숨기기');
  });

  it('showLabel과 hideLabel로 접근성 레이블을 바꾼다', () => {
    const { button } = render({ showLabel: 'Show password', hideLabel: 'Hide password' });
    expect(button?.getAttribute('aria-label')).toBe('Show password');

    act(() => {
      button?.click();
    });
    expect(button?.getAttribute('aria-label')).toBe('Hide password');
  });

  it('버튼의 mousedown 기본 동작을 막아 입력 포커스를 유지한다', () => {
    const { button } = render();
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    act(() => {
      button?.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
  });

  it('disabled이면 토글 버튼도 비활성화한다', () => {
    const { input, button } = render({ disabled: true });
    expect(input.disabled).toBe(true);
    expect(button?.disabled).toBe(true);
  });

  it('size가 small이면 버튼도 small이다', () => {
    const { button } = render({ size: 'small' });
    expect(button?.classList.contains('MuiIconButton-sizeSmall')).toBe(true);
  });

  it('size를 생략하면 버튼은 medium이다', () => {
    const { button } = render();
    expect(button?.classList.contains('MuiIconButton-sizeMedium')).toBe(true);
  });

  it('slotProps.htmlInput을 입력 요소에 전달한다', () => {
    const { input, button } = render({ slotProps: { htmlInput: { maxLength: 20 } } });
    expect(input.getAttribute('maxlength')).toBe('20');
    expect(button).not.toBeNull();
  });

  it('slotProps.input이 함수여도 토글 버튼을 유지한다', () => {
    const { button } = render({ slotProps: { input: () => ({ className: 'custom' }) } });
    expect(button).not.toBeNull();
  });

  it('slotProps.input.endAdornment를 지정하면 기본 토글 버튼 대신 쓴다', () => {
    const { button } = render({ slotProps: { input: { endAdornment: <span>끝</span> } } });
    expect(button).toBeNull();
    expect(container.textContent).toContain('끝');
  });

  it('ref를 루트 요소로 전달한다', () => {
    let ref: HTMLDivElement | null = null;
    render({
      ref: (node: HTMLDivElement | null) => {
        ref = node;
      },
    });
    expect(ref).toBe(container.querySelector('.MuiTextField-root'));
  });
});
