---
"@cp949/mui-react19": major
---

React 19 전용 라이브러리로 전환했습니다(3.0.0 major).

- React 18 지원 종료(breaking): `peerDependencies.react`를 `^18 || ^19`에서 `^19`로 축소했습니다. React 18 트리에는 더 이상 설치되지 않습니다.
- forwardRef 전면 제거: 모든 공개 컴포넌트를 React 19 ref-as-prop 패턴으로 전환하고 `forwardRef`·`useImperativeHandle` 사용을 제거했습니다.
- 공개 컴포넌트의 ref 전달·id 생성 동작은 회귀 없이 유지됩니다.
- useId 출력 포맷도 변경되었습니다(breaking): 생성 id에서 `mantine-` prefix를 제거했습니다. 생성 id 문자열에 의존하던 코드는 영향을 받습니다. 상세는 별도 changeset `useid-native-react19.md`를 참고하세요.
