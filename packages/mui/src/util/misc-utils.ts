const setCustomTimeout = (callback: () => void, timeout: number) => {
  setTimeout(
    () => {
      callback();
    },
    timeout < 0 ? 0 : timeout,
  );
};

const queryElement = (
  el: HTMLElement | Document | null | undefined,
  selector: string,
): Element | null => {
  if (!el) return null;
  return el.querySelector(selector);
};

export const requestFocusSelector = (
  parent: HTMLElement | Document | undefined | null,
  selector: string,
  delay = -1,
) => {
  if (!parent) return;
  setCustomTimeout(() => {
    const elem = parent.querySelector<HTMLInputElement>(selector);
    elem?.focus();
  }, delay);
};

export const requestSelector = (
  el: HTMLElement | Document | null | undefined,
  selector: string,
  callback: (elemnt: HTMLElement) => void,
  timeout = -1,
) => {
  setCustomTimeout(() => {
    const element = queryElement(el, selector);
    if (element) {
      callback(element as HTMLElement);
    }
  }, timeout);
};

export function isWebSerialSupportBrowser(): boolean {
  return window.navigator && 'serial' in window.navigator;
}

export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
}

export function matchesOrClosest<T extends HTMLElement>(
  target: Element,
  selector: string,
): T | undefined {
  const found = target.matches(selector) ? target : target.closest(selector);
  if (found) {
    return found as T;
  }
  return undefined;
}

export function getAbsolutePosition(element: HTMLElement): {
  x: number;
  y: number;
} {
  // 요소의 bounding rectangle을 가져옵니다.
  const rect = element.getBoundingClientRect();

  // 페이지의 스크롤 위치를 가져옵니다.
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  // 절대 위치를 계산합니다.
  const top = rect.top + scrollTop;
  const left = rect.left + scrollLeft;

  return { x: left, y: top };
}

export const isBrowser = typeof window !== 'undefined';

export const isNavigator = typeof navigator !== 'undefined';

export const noop = () => {};
