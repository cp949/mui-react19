import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CopyButtonWrapper } from './CopyButtonWrapper.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('CopyButtonWrapper', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  it('클립보드 복사가 성공하면 onCopySuccess를 호출한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopySuccess = vi.fn();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <CopyButtonWrapper value='copied text' onCopySuccess={onCopySuccess}>
          {({ copy }) => (
            <button type='button' onClick={copy}>
              copy
            </button>
          )}
        </CopyButtonWrapper>,
      );
    });

    await act(async () => {
      container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledWith('copied text');
    expect(onCopySuccess).toHaveBeenCalledTimes(1);
    expect(onCopySuccess).toHaveBeenCalledWith('copied text');
  });
});
