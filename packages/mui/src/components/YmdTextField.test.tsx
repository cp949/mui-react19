import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { YmdTextField, type YmdTextFieldProps } from './YmdTextField.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('YmdTextField', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (props: YmdTextFieldProps) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<YmdTextField {...props} />);
    });
    return container.querySelector('input') as HTMLInputElement;
  };

  // React 제어 입력은 네이티브 setter로 값을 바꾼 뒤 input 이벤트를 보내야 onChange가 호출된다.
  const type = (input: HTMLInputElement, text: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    act(() => {
      setter?.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
  });

  it('8자리가 완성되면 format을 적용해 표시한다', () => {
    const input = render({ value: '19900101', format: 'YYYY-MM-DD', onChange: vi.fn() });
    expect(input.value).toBe('1990-01-01');
  });

  it('6자리가 완성되면 YY 포맷을 적용해 표시한다', () => {
    const input = render({ value: '990101', format: 'YY/MM/DD', onChange: vi.fn() });
    expect(input.value).toBe('99/01/01');
  });

  it('입력 중인 값은 숫자 원문 그대로 표시한다', () => {
    const input = render({ value: '199001', format: 'YYYY-MM-DD', onChange: vi.fn() });
    expect(input.value).toBe('199001');
  });

  it('placeholder를 생략하면 format을 표시한다', () => {
    const input = render({ value: '', format: 'YYYY-MM-DD', onChange: vi.fn() });
    expect(input.placeholder).toBe('YYYY-MM-DD');
  });

  it('placeholder를 지정하면 그 값을 표시한다', () => {
    const input = render({
      value: '',
      format: 'YYYY-MM-DD',
      placeholder: '생년월일',
      onChange: vi.fn(),
    });
    expect(input.placeholder).toBe('생년월일');
  });

  it('input 요소에 inputMode numeric을 적용한다', () => {
    const input = render({ value: '', format: 'YYYY-MM-DD', onChange: vi.fn() });
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });

  it('slotProps.htmlInput의 다른 속성을 유지하고 inputMode는 덮어쓸 수 있다', () => {
    const input = render({
      value: '',
      format: 'YYYY-MM-DD',
      onChange: vi.fn(),
      slotProps: { htmlInput: { maxLength: 10, inputMode: 'text' } },
    });
    expect(input.getAttribute('maxlength')).toBe('10');
    expect(input.getAttribute('inputmode')).toBe('text');
  });

  it('slotProps.htmlInput이 함수여도 inputMode numeric을 유지한다', () => {
    const input = render({
      value: '',
      format: 'YYYY-MM-DD',
      onChange: vi.fn(),
      slotProps: { htmlInput: () => ({ maxLength: 10 }) },
    });
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('maxlength')).toBe('10');
  });

  it('입력값에서 숫자만 남겨 onChange로 전달한다', () => {
    const onChange = vi.fn();
    const input = render({ value: '', format: 'YYYY-MM-DD', onChange });

    type(input, '1990-01-01');

    expect(onChange).toHaveBeenCalledWith('19900101');
  });

  it('8자리를 넘는 입력은 잘라서 전달한다', () => {
    const onChange = vi.fn();
    const input = render({ value: '', format: 'YYYY-MM-DD', onChange });

    type(input, '199001019999');

    expect(onChange).toHaveBeenCalledWith('19900101');
  });
});
