import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * characterization 테스트 전반에서 반복되던 "컨테이너 생성 → createRoot → act로 렌더 →
 * 언마운트/정리" 흐름을 공유하는 테스트 전용 하네스. 제네릭 TElement로 컴포넌트별 ref DOM
 * 타입을 지정한다(`Stack` 기반은 HTMLDivElement, `Box` 기반은 HTMLElement 등).
 *
 * @remarks
 * 이 하네스로 렌더한 뒤 `getComputedStyle()`로 미지정 값(예: `alignItems`/`justifyContent`/
 * `flexWrap`)을 조회하면 happy-dom 구현상 빈 문자열(`''`)로 직렬화된다. 이 관례에 의존하는
 * assertion이 다수 존재하므로, happy-dom을 업그레이드하면 그 assertion들이 한꺼번에 깨질 수
 * 있다는 점을 인지하고 있어야 한다.
 */
export function createDomHarness<TElement extends HTMLElement = HTMLElement>() {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  const mount = async (element: ReactElement) => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(element);
    });
  };

  const renderInto = async (renderNode: (ref: { current: TElement | null }) => ReactElement) => {
    const ref = { current: null as TElement | null };
    await mount(renderNode(ref));
    return ref.current as TElement;
  };

  const cleanup = () => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
  };

  return { mount, renderInto, cleanup };
}
