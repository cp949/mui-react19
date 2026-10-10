import Pagination, { type PaginationProps } from '@mui/material/Pagination';
import clsx from 'clsx';
import { Center } from './Center.js';

export interface ListPaginationProps
  extends Omit<PaginationProps, 'page' | 'count' | 'onChange' | 'hidden' | 'ref'> {
  /**
   * 현재 페이지 번호입니다.
   * 기본은 MUI `Pagination`과 같은 1-based이며, `zeroBased`가 true이면 첫 페이지가 `0`입니다.
   */
  page: number;

  /** 전체 페이지 수입니다. */
  count: number;

  /**
   * 사용자가 페이지를 바꿨을 때 호출합니다.
   * 전달되는 번호의 기준은 `page`와 같습니다.
   */
  onChange?: (pageNumber: number) => void;

  /**
   * `page`와 `onChange`의 페이지 번호를 0-based로 다룰지 여부입니다.
   * 서버가 0-based 페이지 번호를 쓸 때 변환 코드를 반복하지 않도록 제공합니다.
   * @default false
   */
  zeroBased?: boolean;

  /**
   * 컴포넌트를 강제로 숨길지 여부입니다.
   * @default false
   */
  hidden?: boolean;

  /**
   * 페이지 이동 후 화면 상단으로 스크롤하는 동작을 막을지 여부입니다.
   * @default false
   */
  disableAutoScroll?: boolean;
}

/**
 * 목록 화면 하단에 쓰는 페이지네이션입니다.
 * MUI `Pagination`을 가운데 정렬하고 위아래 여백(`py: 1.5`)을 더합니다.
 *
 * @remarks
 * - `count`가 1 이하이면 아무것도 렌더링하지 않습니다.
 * - 페이지를 바꾸면 기본으로 `window.scrollTo`로 화면 상단으로 이동합니다.
 * - `className`과 `sx`는 바깥 래퍼에 적용되고, 나머지 props는 MUI `Pagination`에 전달됩니다.
 *
 * @example
 * ```tsx
 * <ListPagination page={page} count={totalPages} onChange={setPage} />
 *
 * // 서버가 0-based 페이지 번호를 쓸 때
 * <ListPagination zeroBased page={pageNumber} count={totalPages} onChange={setPageNumber} />
 * ```
 */
export const ListPagination = ({
  page,
  count,
  onChange,
  zeroBased = false,
  hidden = false,
  disableAutoScroll = false,
  className,
  sx,
  ...paginationProps
}: ListPaginationProps) => {
  if (hidden) return null;

  // 페이지가 하나뿐이면 보여줄 필요가 없다
  if (count <= 1) return null;

  // MUI는 1-based이므로 0-based 입력은 렌더링 직전에 보정한다
  const offset = zeroBased ? 1 : 0;

  const handleChange = (_: React.ChangeEvent<unknown>, muiPage: number) => {
    onChange?.(muiPage - offset);

    // 목록 문맥을 유지하기 위해 이동 후 상단으로 스크롤한다
    if (!disableAutoScroll) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <Center
      className={clsx(className, 'ListPagination-root')}
      sx={[{ py: 1.5 }, ...(Array.isArray(sx) ? sx : [sx ?? false])]}
    >
      <Pagination
        {...paginationProps}
        page={page + offset}
        count={count}
        onChange={onChange ? handleChange : undefined}
      />
    </Center>
  );
};

ListPagination.displayName = 'ListPagination';
