---
'@cp949/mui-react19': minor
---

`ListPagination` 컴포넌트를 추가했습니다. MUI `Pagination`을 가운데 정렬하고 위아래 여백(`py: 1.5`)을 더하며, `count`가 1 이하이면 숨기고 페이지 이동 후 화면 상단으로 스크롤합니다(`disableAutoScroll`로 끌 수 있음). 기본은 MUI와 같은 1-based이며, `zeroBased`를 켜면 `page`와 `onChange`가 0-based가 됩니다.
