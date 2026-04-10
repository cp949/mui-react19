import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    dts: {
      compilerOptions: {
        // tsup 8.5.1 injects `baseUrl: "."` during DTS bundling under TS 6.
        ignoreDeprecations: '6.0',
      },
    },
    format: ['esm', 'cjs'],
    minify: !options.watch,
    entry: {
      index: 'src/index.ts',
      'hooks/index': 'src/hooks/index.ts',
      'helper/index': 'src/helper/index.ts',
      'file-drop/index': 'src/file-drop/index.ts',
    },
    target: 'es2022',
    splitting: true,
    sourcemap: true,
    clean: false,
    // external: ["react", "react/jsx-runtime"],
  };
});
