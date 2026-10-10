---
'@cp949/mui-react19': minor
---

`useDebouncedParams` 훅과 `SearchBoxDebouncer` 컴포넌트를 추가했습니다. 검색 조건 입력을 초안으로 보관하다가 입력이 멈추면(`delayMs`, 기본 200) 한 번만 `onChange`로 전달합니다. 자식에게 `flush`를 넘겨 Enter 같은 동작으로 즉시 발행할 수 있습니다. 부모의 `params` 갱신이 비동기여도, 발행한 값이 돌아오는 사이에 입력한 내용은 유지됩니다.
