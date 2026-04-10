# \_works 작업 폴더 규칙

작업은 파일 단위가 아니라 폴더 단위로 관리한다.

## 구조

- `_works/<yyyyMMdd-{seq}-작업명>/`

`{seq}`는 `01`, `02` 같은 두 자리 일련번호를 사용한다.

예시:

- `_works/20260221-01-gradle-improvement/`
- `_works/20260225-02-pass-integration/`

## 폴더 내 권장 사항

- 파일명 형태: `01-*.md`, `02-*.md`
- 파일의 내용을 한글로 작성할 것
- (중요) README.md 외에는 모두 git ignore 입니다. 강제로 커밋하지마세요.
