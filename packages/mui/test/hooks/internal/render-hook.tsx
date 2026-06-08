import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

type HookResult<Result> = {
  current: Result;
};

type RenderHookReturn<Props, Result> = {
  result: HookResult<Result>;
  rerender: (nextProps: Props) => void;
  unmount: () => void;
};

export function renderHook<Props, Result>(
  callback: (props: Props) => Result,
  initialProps: Props,
): RenderHookReturn<Props, Result> {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const result = { current: undefined as Result };
  let root: Root | null = createRoot(container);

  const TestComponent = ({ hookProps }: { hookProps: Props }) => {
    result.current = callback(hookProps);
    return null;
  };

  const render = (props: Props) => {
    act(() => {
      root?.render(<TestComponent hookProps={props} />);
    });
  };

  render(initialProps);

  return {
    result,
    rerender: render,
    unmount: () => {
      act(() => {
        root?.unmount();
      });
      root = null;
      container.remove();
    },
  };
}
