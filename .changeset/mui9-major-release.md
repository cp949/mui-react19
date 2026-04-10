---
'@cp949/mui-react19': major
---

MUI 9 지원 라인으로 전환했습니다.

- `@mui/material`, `@mui/system` peer dependency를 `^9`로 업데이트했습니다.
- 라이브러리 메이저 버전을 `1.x`에서 `2.0.0`으로 올렸습니다.
- `./hooks`, `./helper`, `./file-drop` 서브패스 export와 타입 산출물을 현재 배포 구조에 맞게 정리했습니다.
- 저장소의 lint/format 체인을 `ESLint + Prettier`에서 `Biome`으로 전환했습니다.
- 테스트 앱을 MUI 9, Vite 8, `@vitejs/plugin-react` 6 기준으로 정리했습니다.
