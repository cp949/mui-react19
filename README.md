# mui-react19

MUI 7 및 React 19 기반의 UI 라이브러리 모노레포 프로젝트입니다.

## 기술 스택

- 패키지 매니저: pnpm
- 빌드 시스템: Turborepo
- 라이브러리: React 19, MUI 7
- 언어: TypeScript

## 프로젝트 구조

### apps
- mui-test: 컴포넌트 테스트 및 예제 애플리케이션입니다. Vite를 사용하여 구성되었습니다.

### packages
- mui: @cp949/mui-react19 핵심 라이브러리 패키지입니다.
- eslint-config: 워크스페이스 공용 ESLint 설정 패키지입니다.
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

