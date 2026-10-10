# @cp949/mui-react19

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
