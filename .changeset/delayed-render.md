---
'@cp949/mui-react19': minor
---

`DelayedRender` 컴포넌트를 추가했습니다. 마운트 후 `delayMs`(기본 500)가 지나면 자식을 렌더링해 빈 목록 안내 같은 UI의 깜빡임을 줄입니다. `delayMs`가 0 이하이면 바로 렌더링하고, `delayMs`가 바뀌면 자식을 숨기고 다시 지연합니다.
