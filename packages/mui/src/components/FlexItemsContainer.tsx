import { Grid, type GridProps } from '@mui/material';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { isNil } from '../util/internal-util.js';

/**
 * `FlexItemsContainer`의 속성을 정의하는 인터페이스
 *
 * @template TItem - 리스트 아이템의 타입
 */
export type FlexItemsContainerProps<TItem> = Omit<GridProps, 'container' | 'children'> & {
  /** 렌더링할 아이템 배열 */
  items: readonly TItem[];

  /** 각 아이템의 고유 키를 반환하는 함수 */
  getItemKey: (item: TItem, index: number) => string | number;

  /** 각 아이템의 크기(size)를 결정하는 함수 (선택적) */
  getItemSize?: (item: TItem, index: number) => GridProps['size'] | undefined;

  /** 특정 아이템이 줄 바꿈 요소인지 확인하는 함수 (선택적) */
  isLineBreakItem?: (item: TItem, index: number) => boolean;

  /** 줄 바꿈을 그룹화하는 함수 (선택적) */
  lineBreakGroup?: (item: TItem, index: number) => unknown;

  /** 특정 아이템 전에 줄 바꿈을 적용할지 결정하는 함수 (선택적) */
  breakBefore?: (item: TItem, index: number) => boolean;

  /** 특정 아이템 후에 줄 바꿈을 적용할지 결정하는 함수 (선택적) */
  breakAfter?: (item: TItem, index: number) => boolean;

  /** 각 아이템을 렌더링하는 함수 */
  children: (item: TItem, index: number) => ReactNode;

  /** 줄 바꿈의 높이 (예: `16px`, `1.5rem`, 숫자 등) */
  lineBreakHeight?: number | string;
};

/**
 * `FlexItemsContainer`는 리스트 아이템을 유연하게 배치하는 컨테이너입니다.
 * forwardRef를 하면 items 타입 추론이 안되므로, 일반 함수 컴포넌트로 작성함
 * @template TItem - 리스트 아이템의 타입
 *
 * @example
 * ```tsx
 * <FlexItemsContainer
 *   items={["Apple", "Banana", "Cherry"]}
 *   getItemKey={(item) => item}
 *   getItemSize={() => "auto"}
 *   breakAfter={(item) => item === "Banana"}
 * >
 *   {(item) => <div>{item}</div>}
 * </FlexItemsContainer>
 * ```
 */
export function FlexItemsContainer<TItem>(
  props: FlexItemsContainerProps<TItem>,
): ReactElement | null {
  const {
    className,
    items,
    getItemKey,
    getItemSize,
    isLineBreakItem,
    breakBefore,
    breakAfter,
    children,
    lineBreakHeight,
    lineBreakGroup,
    ...restProps
  } = props;

  if (!Array.isArray(items)) {
    console.error('FlexItemsContainer: items must be an array');
    return null;
  }

  return (
    <Grid
      className={clsx('FlexItemsContainer-root', className)}
      container
      role='grid'
      {...restProps}
    >
      {createItems<TItem>({
        items,
        isLineBreakItem,
        lineBreakGroup,
        lineBreakHeight,
        breakBefore,
        breakAfter,
        getItemKey,
        getItemSize,
        renderItem: children,
      })}
    </Grid>
  );
}

FlexItemsContainer.displayName = 'FlexItemsContainer';

interface CreateItemsProps<TItem> {
  items: readonly TItem[];
  getItemKey: (item: TItem, index: number) => string | number;
  getItemSize?: (item: TItem, index: number) => GridProps['size'] | undefined;
  isLineBreakItem?: (item: TItem, index: number) => boolean;
  lineBreakGroup?: (item: TItem, index: number) => unknown;
  lineBreakHeight?: number | string;
  breakBefore?: (item: TItem, index: number) => boolean;
  breakAfter?: (item: TItem, index: number) => boolean;
  renderItem: (item: TItem, index: number) => ReactNode;
}

/**
 * 리스트 아이템을 렌더링하는 함수
 *
 * @template TItem - 리스트 아이템의 타입
 * @param props - 아이템과 렌더링 설정을 포함하는 객체
 * @returns 렌더링된 React 요소 배열
 */
function createItems<TItem>(props: CreateItemsProps<TItem>): ReactElement[] {
  const {
    items,
    getItemKey,
    getItemSize,
    isLineBreakItem,
    lineBreakHeight = 0,
    lineBreakGroup,
    breakBefore,
    breakAfter,
    renderItem,
  } = props;

  const elements: ReactElement[] = [];
  let lineStarting = true;
  let previousGroup: unknown;

  items.forEach((item, i) => {
    if (isLineBreakItem?.(item, i)) {
      if (!lineStarting) {
        lineStarting = true;
        elements.push(getLineBreakNode(i, 'break-item', lineBreakHeight));
      }
      return;
    }

    if (lineBreakGroup) {
      const currGrp = lineBreakGroup(item, i);
      if (isGroupChanged(previousGroup, currGrp)) {
        previousGroup = currGrp;
        if (!lineStarting) {
          lineStarting = true;
          elements.push(getLineBreakNode(i, 'group', lineBreakHeight));
        }
      }
    }

    if (!lineStarting && breakBefore?.(item, i)) {
      lineStarting = true;
      elements.push(getLineBreakNode(i, 'break-before', lineBreakHeight));
    }

    lineStarting = false;
    elements.push(
      <Grid key={getItemKey(item, i)} size={getItemSize?.(item, i)}>
        {renderItem(item, i)}
      </Grid>,
    );

    if (breakAfter?.(item, i)) {
      lineStarting = true;
      elements.push(getLineBreakNode(i, 'break-after', lineBreakHeight));
    }
  });

  if (lineStarting && elements.length > 0) {
    elements.pop();
  }

  return elements;
}

/**
 * 두 그룹이 변경되었는지 확인하는 함수
 *
 * @param prev - 이전 그룹
 * @param curr - 현재 그룹
 * @returns `true`이면 그룹이 변경된 것
 */
function isGroupChanged(prev: unknown, curr: unknown): boolean {
  if (isNil(prev) && isNil(curr)) {
    return false;
  }
  return prev !== curr;
}

/**
 * 줄 바꿈 요소를 생성하는 함수
 *
 * @param i - 요소의 인덱스
 * @param keyPrefix - 키 프리픽스
 * @param height - 줄 바꿈 높이
 * @returns 줄 바꿈을 위한 `Grid2` 요소
 */
function getLineBreakNode(i: number, keyPrefix: string, height: number | string): ReactElement {
  return (
    <Grid
      key={`FlexItemsContainer:${keyPrefix}:${i}`}
      className='FlexItemsContainer-emptyLine'
      size='auto'
      style={{
        flexBasis: '100%',
        width: 0,
        height,
      }}
    />
  );
}
