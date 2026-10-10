import { defineConfig } from 'tsdown';

export default defineConfig((options) => {
  return {
    format: ['esm', 'cjs'],
    minify: !options.watch,
    // 파일별 출력으로 모듈 단위 'use client' 지시어를 보존한다. 단일 번들은 지시어를 제거해 RSC에서 실패한다
    unbundle: true,
    entry: {
      index: 'src/index.ts',
      'hooks/index': 'src/hooks/index.ts',
      'helper/index': 'src/helper/index.ts',
      'file-drop/index': 'src/file-drop/index.ts',
    },
    target: 'es2022',
    dts: true,
    sourcemap: true,
    // package.json exports가 .js(esm), .cjs(cjs) 확장자를 가리키므로 .mjs 자동 변환을 끈다
    fixedExtension: false,
    clean: true,
    inputOptions: {
      onLog(level, log, defaultHandler) {
        // tsup 때도 'use client'는 번들에서 제거됐다. 파일마다 반복되는 경고만 숨긴다
        if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
        defaultHandler(level, log);
      },
    },
  };
});
