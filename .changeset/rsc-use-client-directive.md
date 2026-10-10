---
"@cp949/mui-react19": minor
---

Next.js App Router 서버 컴포넌트에서 import해도 실패하지 않도록 빌드와 export를 보완했다.

- 빌드를 파일별 출력(`unbundle`)으로 바꿔 모듈 단위 `'use client'` 지시어를 dist에 유지한다. 이전 단일 번들은 지시어를 제거해 서버에서 평가될 때 `unstable_createUseMediaQuery() from the server` 오류가 났다.
- 훅과 React 클라이언트 API를 쓰는 소스, ListPagination, Portlet 계열에 `'use client'`를 추가했다.
- `PortletContent`, `PortletFooter`, `PortletHeader`, `PortletLabel`, `PortletTitle`, `PortletToolbar`를 개별 export로 추가했다. 서버 컴포넌트에서는 `Portlet.Header` 같은 점 표기를 쓸 수 없다. 기존 점 표기는 유지한다.
