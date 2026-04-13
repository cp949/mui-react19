# @cp949/mui-react19

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
