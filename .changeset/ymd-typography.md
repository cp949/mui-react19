---
'@cp949/mui-react19': minor
---

`YmdTypography`, `YmTypography`, `YmdTextField` 컴포넌트와 `formatYmd`, `formatYm`, `formatNumericDateWhenComplete`, `normalizeNumericDate` 유틸을 추가했습니다. `YYYYMMDD`/`YYMMDD` 문자열 또는 숫자를 `format`(예: `YYYY.MM.DD`)에 맞춰 표시하고, 값이 없으면 `fallback`(기본 `-`)을 표시합니다. `YmTypography`는 `YYYYMM` 입력을 `YYYY-MM`(또는 `format`)으로 표시합니다. `number`는 epoch가 아니라 `YYYYMMDD`/`YYYYMM` 숫자로 해석합니다. `YmdTextField`는 `value`와 `onChange`가 항상 숫자만 담은 문자열이며, 입력 길이가 `format`이 요구하는 6/8자리에 도달했을 때만 화면 표시를 포맷합니다.
