import ts from 'typescript';

// 생성 결과가 이 크기를 넘으면 빌드를 실패시킨다. LLM 컨텍스트에 통째로 읽히는 파일이므로
// 심볼이 늘어 조용히 비대해지는 것을 막는다. 한도를 올릴 때는 이유를 커밋 메시지에 남긴다.
export const MAX_LLM_TXT_BYTES = 80 * 1024;

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

// 함수형 컴포넌트에 붙는 정적 멤버 중 사용자에게 의미 없는 것들
const IGNORED_STATIC_MEMBERS = new Set(['displayName', 'propTypes', 'defaultProps', 'prototype']);

function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function printNode(node, sourceFile) {
  const printer = ts.createPrinter({ removeComments: true });
  return collapseWhitespace(printer.printNode(ts.EmitHint.Unspecified, node, sourceFile));
}

function normalizeDeclarationText(text) {
  return text
    .replace(/\s+private\s+[^;]+;/g, '')
    .replace(/\s*#private;/g, '')
    .replace(/^(declare\s+|export\s+)+/g, '')
    .replace(/\s*;\s*$/, '');
}

// 구조 분해된 매개변수(`{ a, b, ...props }: FooProps`)는 사용법 파악에 도움이 되지 않으므로
// `props: FooProps`로 바꾼다.
function normalizeSignatureText(text) {
  return text.replace(/\(\{[^}]*\}: /g, '(props: ');
}

// 반환 타입이 JSX의 `Element`이면 DOM `Element`와 구분되도록 `JSX.Element`로 표기한다.
function returnsJsxElement(signature) {
  const returnType = signature.getReturnType();
  const parts = returnType.isUnion() ? returnType.types : [returnType];
  return parts.some(
    (part) =>
      part.symbol?.name === 'Element' &&
      !part.symbol.declarations?.some((declaration) =>
        declaration.getSourceFile().fileName.includes('lib.dom'),
      ),
  );
}

function signatureLines(name, type, checker) {
  return type.getCallSignatures().map((signature) => {
    let text = normalizeSignatureText(
      checker.signatureToString(signature, undefined, TYPE_FORMAT_FLAGS),
    );
    if (returnsJsxElement(signature)) {
      text = text.replace(/: Element( \| null)?$/, ': JSX.Element$1');
    }
    return `${name}${text}`;
  });
}

function describeValueSymbol(name, symbol, location, checker) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, location);
  const lines = signatureLines(name, type, checker);

  // 원시 타입(boolean 등)의 내장 메서드(`valueOf` 등)가 정적 멤버로 노출되지 않도록 객체 타입만 본다.
  const isObjectType = Boolean(type.flags & ts.TypeFlags.Object);
  const staticMembers = (isObjectType ? type.getProperties() : []).filter(
    (property) => !IGNORED_STATIC_MEMBERS.has(property.name),
  );
  for (const member of staticMembers) {
    const memberType = checker.getTypeOfSymbolAtLocation(member, location);
    const memberLines = signatureLines(`${name}.${member.name}`, memberType, checker);
    if (memberLines.length > 0) {
      lines.push(...memberLines);
      continue;
    }
    lines.push(
      `${name}.${member.name}: ${checker.typeToString(memberType, undefined, TYPE_FORMAT_FLAGS)}`,
    );
  }

  if (lines.length === 0) {
    lines.push(`${name}: ${checker.typeToString(type, undefined, TYPE_FORMAT_FLAGS)}`);
  }

  return lines;
}

// `export * as cssVars` 처럼 네임스페이스로 노출된 모듈은 멤버를 `cssVars.color(...)` 형태로 펼친다.
function describeNamespaceSymbol(name, symbol, location, checker) {
  return checker.getExportsOfModule(symbol).flatMap((member) => {
    const resolved = resolveAlias(member, checker);
    if (resolved.flags & ts.SymbolFlags.Value) {
      return describeValueSymbol(`${name}.${member.name}`, resolved, location, checker);
    }
    return [];
  });
}

// 함수·변수·클래스와 병합된 네임스페이스(`displayName` 같은 정적 속성 선언용)는 값으로 취급한다.
function isPureNamespace(flags) {
  const mergedKinds = ts.SymbolFlags.Function | ts.SymbolFlags.Variable | ts.SymbolFlags.Class;
  return Boolean(flags & ts.SymbolFlags.ValueModule) && !(flags & mergedKinds);
}

function resolveAlias(symbol, checker) {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function describeDeclaration(symbol) {
  const declaration = symbol.declarations?.[0];
  if (!declaration) {
    return null;
  }
  return normalizeDeclarationText(printNode(declaration, declaration.getSourceFile()));
}

/**
 * 하나의 진입점 `.d.ts`에서 공개 심볼을 뽑아 종류별로 분류한다.
 *
 * @param entryDtsPath 진입점 `.d.ts`의 절대 경로
 * @returns `values`(함수·컴포넌트·상수·클래스)와 `types`(interface·type alias) 문자열 목록. 이름순 정렬
 */
export function extractEntryApis(entryDtsPath) {
  const program = ts.createProgram([entryDtsPath], {
    skipLibCheck: true,
    noEmit: true,
    types: [],
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entryDtsPath);
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);

  if (!sourceFile || !moduleSymbol) {
    throw new Error(`진입점 선언 파일을 읽을 수 없습니다: ${entryDtsPath}`);
  }

  const values = [];
  const types = [];

  const exportedSymbols = [...checker.getExportsOfModule(moduleSymbol)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const exported of exportedSymbols) {
    const resolved = resolveAlias(exported, checker);
    const flags = resolved.flags;

    if (flags & ts.SymbolFlags.Class) {
      const text = describeDeclaration(resolved);
      if (text) {
        values.push(text);
      }
    } else if (isPureNamespace(flags)) {
      values.push(...describeNamespaceSymbol(exported.name, resolved, sourceFile, checker));
    } else if (flags & ts.SymbolFlags.Value) {
      values.push(...describeValueSymbol(exported.name, resolved, sourceFile, checker));
    } else if (flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
      const text = describeDeclaration(resolved);
      if (text) {
        types.push(text);
      }
    }
  }

  return { values, types };
}

function renderEntrySection(entry) {
  const lines = [`### \`${entry.specifier}\``, ''];

  if (entry.values.length > 0) {
    lines.push('Values:', ...entry.values.map((text) => `- \`${text}\``), '');
  }
  if (entry.types.length > 0) {
    lines.push('Types:', ...entry.types.map((text) => `- \`${text}\``), '');
  }

  return lines;
}

/**
 * llm.txt 본문을 만든다. API 시그니처는 `entries`에서 자동으로 채우고,
 * 사용 규칙과 금지 패턴은 이 함수의 고정 문구를 쓴다.
 */
export function renderLlmTxt({ packageName, entries }) {
  const sections = [
    `# Library: ${packageName}`,
    '',
    '## Overview',
    '- React component and hook library built on MUI (`@mui/material` v9).',
    '- Ships four entry points: the package root (components and utilities), `/hooks`, `/helper`, and `/file-drop`.',
    '- Requires React 19. React 18 is not supported.',
    '- Peer dependencies: `react` ^19, `@mui/material` ^9, `@mui/system` ^9, `rxjs` ^7.',
    '',
    '## Entry Points',
    `- \`${packageName}\`: layout and interaction components, \`Closables\`, event/sx utilities.`,
    `- \`${packageName}/hooks\`: state, timing, storage, DOM observer, and responsive hooks.`,
    `- \`${packageName}/helper\`: \`cssVars\` and \`mediaQueries\` helpers for MUI theme CSS variables and media queries.`,
    `- \`${packageName}/file-drop\`: drag-and-drop file and directory tree processing. See \`README.file-drop.md\` in this package for details.`,
    '',
    '## Key APIs',
    'Signatures are generated from the published type declarations. Props types list only their own members; inherited members come from the MUI type named in `extends`.',
    '',
    ...entries.flatMap(renderEntrySection),
    '## Usage Patterns',
    `- Import components from \`${packageName}\`, hooks from \`${packageName}/hooks\`, helpers from \`${packageName}/helper\`.`,
    '- Components accept `sx` and the props of the MUI component they wrap, including `ref` as a regular prop.',
    '- Compound components expose variants as static members, for example `FlexRow.Between`, `TopAbsolute.Right`, `Portlet.Title`.',
    "- In Next.js App Router, use components and hooks from files that start with `'use client'`.",
    '',
    '## Examples',
    "- `import { Center, FlexRow, Space } from '@cp949/mui-react19';`",
    "- `import { useElementSize, useDebouncedCallback } from '@cp949/mui-react19/hooks';`",
    "- `import { mediaQueries, cssVars } from '@cp949/mui-react19/helper';`",
    "- `import { processFileTreeDropSafe } from '@cp949/mui-react19/file-drop';`",
    '- `<CooldownButton cooldown={3000} onClick={save}>Save</CooldownButton>`',
    "- `<FlexRow.Between sx={{ width: '100%' }}><span>Left</span><span>Right</span></FlexRow.Between>`",
    '',
    '## Constraints',
    '- Use only exports from the package root or the subpaths listed above.',
    '- `react` must be ^19. Components rely on ref-as-prop and do not use `forwardRef`.',
    '- `@mui/material` and `@mui/system` must be ^9. For MUI 7, use the 1.x line of this package.',
    '- `rxjs` ^7 must be installed. `Closables`, `useAbsolutePosition`, and `useLoadingVisible` import it at runtime.',
    '',
    '## Anti-Patterns',
    '- Do not wrap these components in `forwardRef`. Pass `ref` as a prop.',
    '- Do not import from `dist/chunk-*` files or from `src/` paths.',
    '- Do not import hooks from the package root. Use the `/hooks` subpath.',
    '- Do not use this package with React 18 or with `@mui/material` below v9.',
  ];

  return `${sections.join('\n')}\n`;
}
