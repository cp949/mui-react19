import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { FileButton } from './FileButton.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('FileButton', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  it('RefObject가 내부 file input 요소로 연결된다', async () => {
    const ref = { current: null as HTMLInputElement | null };

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <FileButton ref={ref} onChange={() => {}}>
          {({ onClick }) => (
            <button type='button' onClick={onClick}>
              파일
            </button>
          )}
        </FileButton>,
      );
    });

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('file');
  });

  it('callback ref가 내부 file input 요소 인자로 호출된다', async () => {
    const ref = vi.fn();

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <FileButton ref={ref} onChange={() => {}}>
          {({ onClick }) => (
            <button type='button' onClick={onClick}>
              파일
            </button>
          )}
        </FileButton>,
      );
    });

    const input = ref.mock.calls
      .map((call) => call[0])
      .find((arg) => arg instanceof HTMLInputElement);
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).type).toBe('file');
  });
});
