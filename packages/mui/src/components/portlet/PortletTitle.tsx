import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack, { type StackProps } from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { clsx } from 'clsx';
import type { MouseEventHandler, ReactNode } from 'react';

export interface PortletTitleProps extends Omit<StackProps, 'title' | 'direction' | 'children'> {
  /** 문자열이면 Typography로 감싸 표시하고, 그 외 노드는 그대로 렌더링합니다. */
  title: ReactNode;
  /** 제목 Typography의 variant입니다. 기본값은 `h5`입니다. 문자열 제목에만 적용됩니다. */
  titleVariant?: TypographyProps['variant'];
  /** 0보다 클 때만 제목 옆에 표시합니다. */
  itemCount?: number;
  /** 건수 표시 형식입니다. 기본값은 천 단위 구분자를 넣은 숫자입니다. 단위나 번역은 여기서 붙입니다. */
  formatItemCount?: (count: number) => ReactNode;
  /** true이면 새로고침 버튼 대신 로딩 표시를 보여줍니다. */
  loading?: boolean;
  /** true이면 제목의 `nowrap` 처리를 해제합니다. */
  disableNowrapTitle?: boolean;
  /** 새로고침 버튼의 접근성 이름(aria-label)입니다. 기본값은 `새로고침`입니다. */
  refreshLabel?: string;
  /** 지정했을 때만 새로고침 버튼을 표시합니다. */
  onClickRefresh?: MouseEventHandler<HTMLButtonElement>;
}

const defaultFormatItemCount = (count: number): ReactNode => count.toLocaleString();

/**
 * Portlet Header에 제목, 건수, 새로고침 버튼(또는 로딩 표시)을 한 줄로 표시합니다.
 *
 * @param props Stack 속성과 제목·건수·새로고침 설정
 * @returns 제목과 새로고침 영역을 가로로 배치한 Stack
 * @remarks 새로고침 영역은 버튼과 로딩 표시가 번갈아 나타나도 제목 위치가 흔들리지 않도록 최소 너비 40px을 유지합니다.
 * @example
 * ```tsx
 * <Portlet.Header>
 *   <Portlet.Title
 *     title='사용자 목록'
 *     titleVariant='h6'
 *     itemCount={120}
 *     formatItemCount={(n) => `${n.toLocaleString()}건`}
 *     loading={loading}
 *     onClickRefresh={reload}
 *   />
 * </Portlet.Header>
 * ```
 */
export const PortletTitle = (props: PortletTitleProps) => {
  const {
    title,
    titleVariant = 'h5',
    itemCount = 0,
    formatItemCount = defaultFormatItemCount,
    loading,
    disableNowrapTitle = false,
    refreshLabel = '새로고침',
    onClickRefresh,
    className,
    sx,
    ref,
    ...rest
  } = props;

  return (
    <Stack
      direction='row'
      spacing={0.5}
      {...rest}
      ref={ref}
      className={clsx('PortletTitle-root', className)}
      sx={[{ alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx ?? false])]}
    >
      {typeof title === 'string' ? (
        <Typography
          variant={titleVariant}
          className='PortletTitle-title'
          sx={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: disableNowrapTitle ? 'inherit' : 'nowrap',
            '& small': {
              display: 'inline-block',
              ml: 1,
              color: 'text.secondary',
              fontSize: '0.7rem',
            },
          }}
        >
          {title}
          {itemCount > 0 && <small>{formatItemCount(itemCount)}</small>}
        </Typography>
      ) : (
        title
      )}

      <Box
        className='PortletTitle-reloadBtnBox'
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}
      >
        {!loading && onClickRefresh ? (
          <IconButton
            color='primary'
            size='small'
            aria-label={refreshLabel}
            className='PortletTitle-reloadBtn'
            onClick={onClickRefresh}
          >
            <SvgIcon>
              <path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z' />
            </SvgIcon>
          </IconButton>
        ) : null}

        {loading ? <CircularProgress color='primary' size='1rem' /> : null}
      </Box>
    </Stack>
  );
};

PortletTitle.displayName = 'PortletTitle';
