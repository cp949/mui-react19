import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BehaviorSubject, skip, throttleTime } from 'rxjs';
import { useIsomorphicEffect } from './useIsomorphicEffect.js';
import { useWindowSize } from './useWindowSize.js';

/**
 * 주어진 요소의 좌측,상단 위치를 리턴한다.
 */
export function useAbsolutePosition<E extends Element = Element>(
  deps: React.DependencyList,
  options?: {
    intervalMs?: number;
  },
): [(element: E | null) => void, { x: number; y: number }] {
  const [element, ref] = useState<E | null>(null);
  const { intervalMs = 0 } = options || {};
  const [refreshToken, setRefreshToken] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pendingPosition$ = useMemo(
    () => new BehaviorSubject<{ x: number; y: number } | null>(null),
    [],
  );
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const observer = useMemo(
    () =>
      typeof window === 'undefined'
        ? null
        : new window.ResizeObserver((entries) => {
            if (entries[0]) {
              // const { x, y, width, height, top, left, bottom, right } = entries[0].contentRect;
              // setRect({ x, y, width, height, top, left, bottom, right });
              setRefreshToken((v) => v + 1);
            }
          }),
    [],
  );

  useIsomorphicEffect(() => {
    if (!observer) return;
    if (!element) return;
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, observer]);

  const updatePosition = useCallback((newPos: { x: number; y: number }) => {
    setPosition((prev) => {
      if (fuzzyEquals(prev.x, newPos.x) && fuzzyEquals(prev.y, newPos.y)) {
        return prev;
      }
      return newPos;
    });
  }, []);

  useIsomorphicEffect(() => {
    if (!element) {
      updatePosition({ x: 0, y: 0 });
      return;
    }
    pendingPosition$.next(getAbsolutePosition(element));
  }, [pendingPosition$, refreshToken, element, windowWidth, windowHeight, updatePosition, ...deps]);

  useEffect(() => {
    const s1 = pendingPosition$
      .pipe(skip(1), throttleTime(intervalMs))
      .subscribe((pendingPosition) => {
        if (pendingPosition) {
          updatePosition(pendingPosition);
        }
      });
    return () => {
      s1.unsubscribe();
    };
  }, [pendingPosition$, intervalMs, updatePosition]);

  return [ref, position];
}

function fuzzyEquals(a: number, b: number, epsilon = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

function getAbsolutePosition(element: Element): { x: number; y: number } {
  if (typeof window === 'undefined') {
    // ssr
    return { x: 0, y: 0 };
  }
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
