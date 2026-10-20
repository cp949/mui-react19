---
"@cp949/mui-react19": minor
---

`CopyButtonWrapper`와 `useClipboard`가 복사 실패를 알릴 수 있도록 했습니다.

- `CopyButtonWrapper`에 `onCopyFailed(error, value)` prop을 추가했습니다. `navigator.clipboard`가 없거나 `writeText`가 거부되거나 던질 때, `value` 함수가 던질 때 호출합니다. `value` 함수가 던지면 `value` 인자는 `undefined`이고 복사는 시도하지 않습니다. 빈 `value`(`null`, `undefined`, 빈 문자열)는 기존처럼 아무 일도 하지 않으며 콜백도 호출하지 않습니다.
- `CopyButtonWrapper`의 render prop 인자에 `failed`를 추가했습니다. 가장 최근 시도가 실패했는지 나타내며 `copied`와 동시에 켜지지 않습니다. 새 시도가 시작되면 둘 다 꺼지고, 둘 다 `timeout`(기본 1000ms) 뒤에 꺼집니다.
- `useClipboard`에 `onError(error, value)` 옵션과 반환값 `failed`, `fail(cause)`를 추가했습니다. 기존 반환값 `copy`, `reset`, `error`, `copied`는 그대로입니다. `fail`은 클립보드를 거치지 않고 실패 상태를 기록하며 `onError`는 호출하지 않습니다.
- 연속으로 복사하면 마지막 시도가 `copied`, `failed`, `error`를 정합니다. 먼저 시작한 시도가 나중에 끝나도 상태를 덮어쓰지 않습니다. 콜백은 시도마다 자기 `value`로 호출합니다.
- `useClipboard`의 `error`는 새 시도가 시작될 때 `null`로 비워집니다. 이전에는 한 번 실패하면 이후 성공해도 `reset()` 전까지 남았습니다. `error`를 계속 표시하던 코드는 동작이 달라질 수 있습니다.
- `useClipboard`는 언마운트 때 `copied`, `failed` 해제 타이머를 정리합니다.
