import type { SxProps, Theme } from '@mui/material';

/**
 * SxProps를 flatten 한 배열로 만든다.
 * @param sxArray - SxProps의 배열
 * @returns SxProps
 */
export function flatSx<T extends Theme = Theme>(
  ...sxArray: (SxProps<T> | undefined | false | null)[]
): SxProps<T> {
  const result: SxProps<T>[] = [];
  sxArray.forEach((item) => {
    if (item) {
      if (Array.isArray(item)) {
        item.forEach((it) => {
          if (it) {
            result.push(it);
          }
        });
      } else {
        result.push(item);
      }
    }
  });
  return result as SxProps<T>;
}

export function firstSx<T extends Theme = Theme>(...sxArray: (SxProps<T> | undefined)[]) {
  const arr = flatSx(...sxArray) as SxProps<T>[];
  return arr.length > 0 ? (arr[0] as SxProps<T>) : undefined;
}

/**
 * 다이얼로그 높이 SxProps
 * @param key - key of height
 * @param heightInPercent - height in percent [0~100]
 * @returns Mui Dialog의 높이 설정 SxProps
 */
export const sxDialogHeight = (
  key: 'height' | 'minHeight' | 'maxHeight' = 'height',
  heightInPercent = 100,
) => {
  return {
    '& .MuiDialog-scrollPaper > .MuiDialog-paper': {
      [key]: `calc(${heightInPercent}% - 64px)`,
    },
  };
};
