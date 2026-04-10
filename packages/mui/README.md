# @cp949/mui-react19

MUI 기반의 React 컴포넌트와 훅 라이브러리입니다. MUI의 강력한 기능을 더 편리하게 사용할 수 있도록 설계되었습니다.

## 버전 및 브랜치 정책

- 현재 `main` 브랜치는 MUI 9 지원 버전입니다.
- MUI 9 지원 버전은 라이브러리 버전 `2.0.0`부터 시작합니다.
- 기존 MUI 7 지원 버전은 `mui7` 브랜치에서 유지합니다.
- MUI 7 환경에서는 `1.x` 버전 또는 `mui7` 브랜치를 사용하세요.
- MUI 9 환경에서는 `2.x` 버전 또는 `main` 브랜치를 사용하세요.

## 주요 특징

- MUI 9.x 기반: 최신 MUI와 완전 호환
- sx prop 통합: MUI의 sx prop과 완벽하게 통합되어 스타일 커스터마이징 용이
- 유용한 레이아웃 컴포넌트: Center, Flex, Absolute 등 자주 쓰이는 레이아웃을 선언적으로 제공
- 확장된 Hooks: 클립보드, 로컬 스토리지, 세션 스토리지 등을 관찰 가능한 형태로 제공
- 완전한 TypeScript 지원: 모든 컴포넌트와 훅이 타입 안전성 보장
- 모듈러 설계: 필요한 컴포넌트만 선택적으로 import 가능

## 설치

```bash
pnpm add @cp949/mui-react19
```

## 사용법

모든 컴포넌트는 MUI 기반이므로, App Router 환경에서는 'use client' 지시어가 있는 클라이언트 컴포넌트 내에서 사용해야 합니다.

### 레이아웃 컴포넌트 사용

```tsx
'use client';

import { Center, FlexRow, Space, TopAbsolute } from '@cp949/mui-react19';

export default function LayoutExample() {
  return (
    <Center sx={{ height: 200, position: 'relative' }}>
      <FlexRow.Between sx={{ width: '100%' }}>
        <span>왼쪽</span>
        <Space width={20} />
        <span>오른쪽</span>
      </FlexRow.Between>

      <TopAbsolute.Right top={10}>상단 오른쪽 요소</TopAbsolute.Right>
    </Center>
  );
}
```

### 상호작용 컴포넌트 사용

```tsx
'use client';

import { Spoiler, FileButton, CooldownButton } from '@cp949/mui-react19';

export default function ClientComponent() {
  return (
    <div>
      <CooldownButton cooldownMs={3000} onClick={() => console.log('clicked')}>
        쿨다운 버튼
      </CooldownButton>

      <Spoiler maxHeight={100} showLabel="더보기" hideLabel="숨기기">
        긴 내용이 여기에...
      </Spoiler>
    </div>
  );
}
```

## 컴포넌트 목록

### 레이아웃 컴포넌트

- `Center` - 중앙 정렬 컨테이너
- `Space` - 여백 생성
- `FlexRow` / `FlexColumn` - Flex 레이아웃
  - `.Start`, `.End`, `.Center`, `.Between`, `.Around`, `.Evenly`
- `TopAbsolute` 계열 (4개) - `TopAbsolute`, `.Left`, `.Right`, `.Center`
- `CenterAbsolute` 계열 (4개) - `CenterAbsolute`, `.Left`, `.Right`, `.Center`
- `BottomAbsolute` 계열 (4개) - `BottomAbsolute`, `.Left`, `.Right`, `.Center`

### 상호작용 및 유틸리티 컴포넌트

- `CooldownButton`, `DebouncedButton` - 쿨다운/디바운스 버튼
- `FileButton` - 파일 업로드 버튼
- `CopyButtonWrapper` - 복사 기능 래퍼
- `Spoiler` - 스포일러/더보기 컴포넌트
- `Hide`, `Show` - 조건부 렌더링 유틸리티
- `Paper` - MUI Paper 래퍼
- `Mark` - 하이라이트 마크
- `SmOrUp`, `MdOrDown`, `LgOrUp` 등 - 반응형 조건부 렌더링

### 고급 기능 컴포넌트

- `FloatingIndicator` - 플로팅 인디케이터
- `DebouncedRender` - 디바운스된 렌더링
- `SegmentedControl` - 세그먼트 컨트롤

## 훅 (Hooks)

### Export 경로

```tsx
import { useElementSize, useCenterInView } from '@cp949/mui-react19/hooks';
```

### 주요 훅들 (66개)

- `useCenterInView` - 뷰포트 중앙 감지
- `useElementSize` - 요소 크기 감지
- `useLocalStorage`, `useSessionStorage` - 웹 스토리지
- `useDebouncedCallback`, `useThrottledCallback` - 성능 최적화
- `useSmOrUp`, `useMdOrDown` 등 - 반응형 훅들
- 기타 다수 (총 66개)

## 헬퍼 유틸리티

```tsx
import { mediaQueries, cssVars } from '@cp949/mui-react19/helper';
```

- `mediaQueries` - MUI 미디어 쿼리 헬퍼
- `cssVars` - MUI CSS 변수 헬퍼

## 파일 드롭 핸들러

```tsx
import { processFileTreeDrop, processFileTreeDropSafe } from '@cp949/mui-react19/file-drop';
```

React에서 파일과 폴더를 드래그앤드롭으로 처리하는 모듈입니다.

주요 기능:

- 폴더 구조 완전 탐색
- 파일 필터링 (크기, 타입, 개수)
- 실시간 진행률 추적
- 병렬 처리
- 에러 처리 및 복구
- 트리 구조 제공

상세한 사용법과 예제는 [README.file-drop.md](./README.file-drop.md)를 참고하세요.

## API 예시

### FlexRow/FlexColumn 사용법

```tsx
// 기본 사용
<FlexRow center>
  <span>중앙 정렬</span>
</FlexRow>

// 네임스페이스 API
<FlexRow.Between sx={{ padding: 2 }}>
  <button>왼쪽</button>
  <button>오른쪽</button>
</FlexRow.Between>

// 세로 레이아웃
<FlexColumn.Center sx={{ height: 200 }}>
  <div>세로 중앙</div>
</FlexColumn.Center>
```

### Absolute 위치 컴포넌트

```tsx
<div style={{ position: 'relative', height: 300 }}>
  <TopAbsolute.Center top={20}>상단 중앙</TopAbsolute.Center>

  <CenterAbsolute.Left left={20}>세로 중앙, 왼쪽 고정</CenterAbsolute.Left>

  <BottomAbsolute.Right bottom={20} right={20}>
    하단 오른쪽
  </BottomAbsolute.Right>
</div>
```

### sx prop 활용

```tsx
<Center
  vertical
  sx={{
    height: 400,
    backgroundColor: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  }}
>
  커스텀 스타일 적용
</Center>
```

## 기술 스택

- React 19.x
- MUI 9.x
- TypeScript 5.x
- RxJS 7.x (일부 훅)

## 추가 정보

- 모든 컴포넌트는 `forwardRef`를 지원하여 ref 전달 가능
- MUI의 `sx` prop과 완벽 호환
- ESM과 CommonJS 모두 지원 (dual package)
- Tree-shaking 최적화로 번들 크기 최소화

## 라이센스

MIT
