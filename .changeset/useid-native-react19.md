---
"@cp949/mui-react19": major
---

useId 훅을 React 19 네이티브 `useId`로 전환했습니다.

- 출력 포맷 변경(breaking): 생성 id에서 `mantine-` prefix를 제거했습니다. 콜론(`:`) 제거는 유지합니다.
- `staticId`를 전달하면 그대로 반환하는 override 동작은 보존합니다(non-breaking 계약 유지).
- 폴리필(Math.random, useState, useIsomorphicEffect 재할당, `React['useId']` 리플렉션 폴백)을 제거해 마운트 후 id가 변동하던 동작을 해소하고 SSR/CSR id를 안정화했습니다.
