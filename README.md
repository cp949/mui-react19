# mui-react19

MUI 9 및 React 19 기반의 UI 라이브러리 모노레포 프로젝트입니다.

## 버전 정책

- `main` 브랜치는 MUI 9 지원 라인을 유지합니다.
- MUI 9 지원 라이브러리 버전은 `2.0.0`부터 시작하며, `2.x`는 React 19 전용입니다.
- 기존 MUI 7 지원 라인은 `mui7` 브랜치에서 유지합니다.
- MUI 7이 필요한 경우 `mui7` 브랜치를 사용하고, MUI 9를 사용하는 경우 `main` 브랜치를 기준으로 작업합니다.

## 기술 스택

- 패키지 매니저: pnpm
- 빌드 시스템: Turborepo
- 라이브러리: React 19, MUI 9
- 언어: TypeScript

## 프로젝트 구조

### apps
- mui-test: 컴포넌트 테스트 및 예제 애플리케이션입니다. Vite를 사용하여 구성되었습니다.

### packages
- mui: @cp949/mui-react19 핵심 라이브러리 패키지입니다.
- typescript-config: 워크스페이스 공용 TypeScript 설정 패키지입니다.

## 개발 명령어

루트 경로에서 다음 명령어를 실행할 수 있습니다.

### 의존성 설치
pnpm install

### 개발 모드 실행
pnpm dev

### 프로젝트 빌드
pnpm build

### 코드 스타일 검사
pnpm lint

### 테스트 실행
pnpm test

## 패키지 배포

배포 관련 설정은 각 패키지의 package.json 및 publishConfig 설정을 따릅니다.
메인 라이브러리는 @cp949/mui-react19 이름으로 npmjs에 배포됩니다.

npm 배포는 `v*` 태그 push로 실행되는 GitHub Actions(`.github/workflows/release.yml`)에서만 합니다. npm 토큰 대신 trusted publishing(OIDC)으로 인증하고 provenance를 붙입니다. 로컬 `npm publish`는 `prepublishOnly` 가드가 막습니다(`--dry-run`은 허용).

1. `packages/mui/package.json`의 `version`과 `packages/mui/CHANGELOG.md`를 갱신해 `main`에 커밋하고 push합니다.
2. 같은 버전의 태그를 push합니다.

```bash
git tag v2.3.2
git push origin v2.3.2
```

workflow는 다음을 모두 확인한 뒤에만 publish합니다. 태그 커밋이 `main`에 포함되는지, 태그 이름이 `v<package.json 버전>`과 같은지, `pnpm lint`·`pnpm check-types`·`pnpm test`가 통과하는지입니다. 결과는 `gh run list --workflow release.yml`로 확인합니다.

태그 push는 되돌릴 수 없는 공개 배포를 일으킵니다. npmjs.com 패키지 설정의 trusted publisher에는 저장소 `cp949/mui-react19`, workflow 파일명 `release.yml`이 등록돼 있어야 합니다.

현재 배포 정책은 다음과 같습니다.

- `1.x` 라인은 MUI 7 호환 버전입니다.
- `2.x` 라인은 MUI 9 + React 19 전용 버전입니다.
