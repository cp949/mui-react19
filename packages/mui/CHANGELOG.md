# @cp949/mui-react19

## 2.3.0

### Minor Changes

- 95eb695: `CopyButtonWrapper`와 `useClipboard`가 복사 실패를 알릴 수 있도록 했습니다.
  
  - `CopyButtonWrapper`에 `onCopyFailed(error, value)` prop을 추가했습니다. `navigator.clipboard`가 없거나 `writeText`가 거부되거나 던질 때, `value` 함수가 던질 때 호출합니다. `value` 함수가 던지면 `value` 인자는 `undefined`이고 복사는 시도하지 않습니다. 빈 `value`(`null`, `undefined`, 빈 문자열)는 기존처럼 아무 일도 하지 않으며 콜백도 호출하지 않습니다.
  - `CopyButtonWrapper`의 render prop 인자에 `failed`를 추가했습니다. 가장 최근 시도가 실패했는지 나타내며 `copied`와 동시에 켜지지 않습니다. 새 시도가 시작되면 둘 다 꺼지고, 둘 다 `timeout`(기본 1000ms) 뒤에 꺼집니다.
  - `useClipboard`에 `onError(error, value)` 옵션과 반환값 `failed`, `fail(cause)`를 추가했습니다. 기존 반환값 `copy`, `reset`, `error`, `copied`는 그대로입니다. `fail`은 클립보드를 거치지 않고 실패 상태를 기록하며 `onError`는 호출하지 않습니다.
  - 연속으로 복사하면 마지막 시도가 `copied`, `failed`, `error`를 정합니다. 먼저 시작한 시도가 나중에 끝나도 상태를 덮어쓰지 않습니다. 콜백은 시도마다 자기 `value`로 호출합니다.
  - `useClipboard`의 `error`는 새 시도가 시작될 때 `null`로 비워집니다. 이전에는 한 번 실패하면 이후 성공해도 `reset()` 전까지 남았습니다. `error`를 계속 표시하던 코드는 동작이 달라질 수 있습니다.
  - `useClipboard`는 언마운트 때 `copied`, `failed` 해제 타이머를 정리합니다.

## 2.2.0

### Minor Changes

- 6082ede: Next.js App Router 서버 컴포넌트에서 import해도 실패하지 않도록 빌드와 export를 보완했다.
  
  - 빌드를 파일별 출력(`unbundle`)으로 바꿔 모듈 단위 `'use client'` 지시어를 dist에 유지한다. 이전 단일 번들은 지시어를 제거해 서버에서 평가될 때 `unstable_createUseMediaQuery() from the server` 오류가 났다.
  - 훅과 React 클라이언트 API를 쓰는 소스, ListPagination, Portlet 계열에 `'use client'`를 추가했다.
  - `PortletContent`, `PortletFooter`, `PortletHeader`, `PortletLabel`, `PortletTitle`, `PortletToolbar`를 개별 export로 추가했다. 서버 컴포넌트에서는 `Portlet.Header` 같은 점 표기를 쓸 수 없다. 기존 점 표기는 유지한다.

## 2.1.0

### Minor Changes

- 602fa6e: `DelayedRender` 컴포넌트를 추가했습니다. 마운트 후 `delayMs`(기본 500)가 지나면 자식을 렌더링해 빈 목록 안내 같은 UI의 깜빡임을 줄입니다. `delayMs`가 0 이하이면 바로 렌더링하고, `delayMs`가 바뀌면 자식을 숨기고 다시 지연합니다.
- 0c4dc3a: `ListPagination` 컴포넌트를 추가했습니다. MUI `Pagination`을 가운데 정렬하고 위아래 여백(`py: 1.5`)을 더하며, `count`가 1 이하이면 숨기고 페이지 이동 후 화면 상단으로 스크롤합니다(`disableAutoScroll`로 끌 수 있음). 기본은 MUI와 같은 1-based이며, `zeroBased`를 켜면 `page`와 `onChange`가 0-based가 됩니다.
- ca63263: `PasswordTextField` 컴포넌트를 추가했습니다. 끝 장식의 버튼으로 비밀번호를 가림/표시 전환하며, 버튼 크기는 `size`를 따르고 `disabled`이면 함께 비활성화됩니다. 접근성 레이블은 `showLabel`/`hideLabel`(기본 `비밀번호 보기`/`비밀번호 숨기기`)로 바꿀 수 있고, `slotProps`는 `input` 슬롯을 병합해 그대로 전달합니다. `@mui/icons-material` 없이 동작합니다.
- 4d5fddf: `Portlet.Title` 컴포넌트를 추가했습니다. 제목, 건수, 새로고침 버튼(또는 로딩 표시)을 한 줄로 보여줍니다. `titleVariant`로 Typography variant를 지정하며 기본값은 `h5`입니다. 건수 문구는 `formatItemCount`로 지정합니다.
- 9759705: `useDebouncedParams` 훅과 `SearchBoxDebouncer` 컴포넌트를 추가했습니다. 검색 조건 입력을 초안으로 보관하다가 입력이 멈추면(`delayMs`, 기본 200) 한 번만 `onChange`로 전달합니다. 자식에게 `flush`를 넘겨 Enter 같은 동작으로 즉시 발행할 수 있습니다. 부모의 `params` 갱신이 비동기여도, 발행한 값이 돌아오는 사이에 입력한 내용은 유지됩니다.
- 4b6ef3d: `YmdTypography`, `YmTypography`, `YmdTextField` 컴포넌트와 `formatYmd`, `formatYm`, `formatNumericDateWhenComplete`, `normalizeNumericDate` 유틸을 추가했습니다. `YYYYMMDD`/`YYMMDD` 문자열 또는 숫자를 `format`(예: `YYYY.MM.DD`)에 맞춰 표시하고, 값이 없으면 `fallback`(기본 `-`)을 표시합니다. `YmTypography`는 `YYYYMM` 입력을 `YYYY-MM`(또는 `format`)으로 표시합니다. `number`는 epoch가 아니라 `YYYYMMDD`/`YYYYMM` 숫자로 해석합니다. `YmdTextField`는 `value`와 `onChange`가 항상 숫자만 담은 문자열이며, 입력 길이가 `format`이 요구하는 6/8자리에 도달했을 때만 화면 표시를 포맷합니다.

### Patch Changes

- 4c013ff: 배포 패키지에 `llm.txt`를 추가했습니다. 공개 API 시그니처와 사용 제약을 `dist/*.d.ts`에서 빌드 시 생성합니다.

## 2.0.3

### Patch Changes

- 8d0f35c: debounce 훅의 타이밍 엔진을 통합하고 `leading` 단일 호출이 trailing 시점에 중복 실행되는 문제를 수정합니다.

## 2.0.2

### Patch Changes

- Use React 19 native `useId` directly while preserving the `staticId` override behavior.
- Remove stale `useId` fallback and colon-normalization code paths.
- Resolve `pnpm audit` findings by pinning patched transitive dependency versions.

## 2.0.1

### Patch Changes

- Add the `useRefEffect` hook and a dedicated `mui-test` case for attach and cleanup behavior.

## 2.0.0

### Major Changes

- MUI 7 기반 패키지를 MUI 9 지원 라인으로 전환했습니다.
- 라이브러리 메이저 버전을 `1.x`에서 `2.0.0`으로 올렸습니다.
- `peerDependencies`의 `@mui/material`, `@mui/system` 범위를 `^9`로 정리했습니다.
- `./hooks`, `./helper`, `./file-drop` 서브패스 export와 타입 산출물을 MUI 9 기준 배포 구조로 정리했습니다.
- 저장소의 lint/format 체인을 `ESLint + Prettier`에서 `Biome`으로 전환했습니다.
- 테스트 앱을 MUI 9, Vite 8, `@vitejs/plugin-react` 6 기준으로 정리했습니다.
