'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useLatest } from '../../hooks/useLatest.js';
import { useMutationObserver } from '../../hooks/useMutationObserver.js';
import { useTimeout } from '../../hooks/useTimeout.js';
import { isNotNil } from '../../util/internal-util.js';

/**
 * 문자열 값을 정수로 변환하는 유틸리티 함수입니다.
 * @param value 변환할 값
 * @returns 정수 값으로 변환된 숫자
 */
function toInt(value?: string) {
  return value ? parseInt(value, 10) : 0;
}

/**
 * 부모 요소가 자식 요소를 포함하는지 여부를 확인하는 함수입니다.
 * @param parentElement 부모 요소
 * @param childElement 자식 요소
 * @returns 부모가 자식을 포함하는 경우 true, 그렇지 않으면 false
 */
function isParent(
  parentElement: HTMLElement | EventTarget | null,
  childElement: HTMLElement | null,
) {
  if (!childElement || !parentElement) {
    return false;
  }

  let parent = childElement.parentNode;
  while (isNotNil(parent)) {
    if (parent === parentElement) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

interface UseFloatingIndicatorInput {
  /** 표시할 인디케이터의 대상 요소 */
  target: HTMLElement | null | undefined;

  /** 인디케이터가 위치할 부모 요소 */
  parent: HTMLElement | null | undefined;

  /** 인디케이터 DOM 참조 */
  indicatorRef: RefObject<HTMLDivElement>;

  /** 인디케이터 크기 계산 시 대상 요소의 보더 두께를 제외할지 여부 */
  excludeTargetBorderWidth?: boolean;

  /** 전환이 끝난 후에 인디케이터를 표시할지 여부 */
  displayAfterTransitionEnd?: boolean;
}

/**
 * `target` 요소의 위치와 크기를 기반으로 인디케이터를 위치시킵니다.
 * 인디케이터는 `parent` 요소를 기준으로 절대 위치가 지정되며, 보더 두께를 고려하여 계산됩니다.
 * @param target 대상 요소
 * @param parent 부모 요소
 * @param indicatorRef 인디케이터 DOM 참조
 * @param excludeTargetBorderWidth 대상 요소의 보더 두께를 제외할지 여부
 * @param displayAfterTransitionEnd 전환 종료 후에 인디케이터 표시 여부
 * @returns 초기화 여부와 숨김 상태 반환
 */
export function useFloatingIndicator({
  target,
  parent,
  indicatorRef,
  excludeTargetBorderWidth = false,
  displayAfterTransitionEnd = false,
}: UseFloatingIndicatorInput) {
  const transitionTimeout = useRef(-1);
  const [initialized, setInitialized] = useState(false);

  const [hidden, setHidden] = useState(displayAfterTransitionEnd);

  /**
   * 인디케이터의 위치를 업데이트하는 함수입니다.
   * target과 parent 요소의 크기 및 위치를 계산하여 인디케이터에 적용합니다.
   */
  const updatePosition = useLatest(() => {
    if (!target || !parent || !indicatorRef.current) {
      return;
    }

    // getBoundingClientRect()를 사용하여 대상과 부모 요소의 크기 및 위치를 가져옵니다
    // getBoundingClientRect()는 보더의 두께를 포함합니다
    const targetRect = target.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const targetComputedStyle = window.getComputedStyle(target);
    const parentComputedStyle = window.getComputedStyle(parent);

    const parentBorderWidth = {
      top: toInt(parentComputedStyle.borderTopWidth),
      left: toInt(parentComputedStyle.borderLeftWidth),
    };

    const targetBorderWidth = {
      top: toInt(targetComputedStyle.borderTopWidth),
      bottom: toInt(targetComputedStyle.borderBottomWidth),
      left: toInt(targetComputedStyle.borderLeftWidth),
      right: toInt(targetComputedStyle.borderRightWidth),
    };

    // 인디케이터의 위치 및 크기 계산
    const indicatorRect = {
      top: targetRect.top - parentRect.top - parentBorderWidth.top,
      left: targetRect.left - parentRect.left - parentBorderWidth.left,
      width: targetRect.width,
      height: targetRect.height,
    };

    // 보더 두께 제외 설정이 활성화되면 보더 두께를 제외한 크기로 설정
    if (excludeTargetBorderWidth) {
      indicatorRect.top += targetBorderWidth.top;
      indicatorRect.left += targetBorderWidth.left;
      indicatorRect.height -= targetBorderWidth.top + targetBorderWidth.bottom;
      indicatorRect.width -= targetBorderWidth.left + targetBorderWidth.right;
    }

    // 인디케이터 스타일 업데이트
    indicatorRef.current.style.transform = `translateX(${indicatorRect.left}px) translateY(${indicatorRect.top}px)`;
    indicatorRef.current.style.width = `${indicatorRect.width}px`;
    indicatorRef.current.style.height = `${indicatorRect.height}px`;
  });

  /**
   * 애니메이션 없이 인디케이터의 위치를 업데이트하는 함수입니다.
   * 애니메이션을 제거한 후 즉시 위치를 업데이트하고, 잠시 후 다시 전환 지속 시간을 원상 복구합니다.
   */
  const updatePositionWithoutAnimation = useLatest(() => {
    window.clearTimeout(transitionTimeout.current);
    if (indicatorRef.current) {
      indicatorRef.current.style.transitionDuration = '0ms';
    }
    updatePosition.current();
    transitionTimeout.current = window.setTimeout(() => {
      if (indicatorRef.current) {
        indicatorRef.current.style.transitionDuration = '';
      }
    }, 30);
  });

  const targetResizeObserver = useRef<ResizeObserver | null>(null);
  const parentResizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    updatePosition.current();

    // target과 parent 요소에 리사이즈 이벤트 리스너 설정
    if (target) {
      targetResizeObserver.current = new ResizeObserver(updatePositionWithoutAnimation.current);
      targetResizeObserver.current.observe(target);

      if (parent) {
        parentResizeObserver.current = new ResizeObserver(updatePositionWithoutAnimation.current);
        parentResizeObserver.current.observe(parent);
      }

      return () => {
        targetResizeObserver.current?.disconnect();
        parentResizeObserver.current?.disconnect();
      };
    }

    return undefined;
  }, [parent, target, updatePosition, updatePositionWithoutAnimation]);

  useEffect(() => {
    if (parent) {
      const handleTransitionEnd = (event: TransitionEvent) => {
        if (isParent(event.target, parent)) {
          updatePositionWithoutAnimation.current();
          setHidden(false);
        }
      };

      parent.addEventListener('transitionend', handleTransitionEnd);
      return () => {
        parent.removeEventListener('transitionend', handleTransitionEnd);
      };
    }

    return undefined;
  }, [parent, updatePositionWithoutAnimation]);

  // 초기화 타이머 설정
  useTimeout(
    () => {
      setInitialized(true);
    },
    20,
    { autoInvoke: true },
  );

  // DOM 변화 감지 및 처리
  useMutationObserver(
    (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'dir') {
          updatePositionWithoutAnimation.current();
        }
      });
    },
    { attributes: true, attributeFilter: ['dir'] },
    () => document.documentElement,
  );

  return { initialized, hidden };
}
