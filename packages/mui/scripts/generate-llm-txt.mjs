import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractEntryApis, MAX_LLM_TXT_BYTES, renderLlmTxt } from './llm-txt-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');

// package.json의 exports 순서와 맞춘다. 진입점이 늘면 여기에도 추가한다.
const ENTRY_POINTS = [
  { subpath: '', dts: 'dist/index.d.ts' },
  { subpath: '/hooks', dts: 'dist/hooks/index.d.ts' },
  { subpath: '/helper', dts: 'dist/helper/index.d.ts' },
  { subpath: '/file-drop', dts: 'dist/file-drop/index.d.ts' },
];

async function main() {
  const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));

  const entries = [];
  for (const entryPoint of ENTRY_POINTS) {
    const dtsPath = path.join(packageRoot, entryPoint.dts);
    // 빌드 산출물이 없으면 오래된 llm.txt를 남기지 않도록 여기서 실패시킨다.
    await stat(dtsPath);
    entries.push({
      specifier: `${packageJson.name}${entryPoint.subpath}`,
      ...extractEntryApis(dtsPath),
    });
  }

  const output = renderLlmTxt({ packageName: packageJson.name, entries });
  const byteLength = Buffer.byteLength(output, 'utf8');
  if (byteLength > MAX_LLM_TXT_BYTES) {
    throw new Error(`llm.txt가 한도를 초과했습니다: ${byteLength} > ${MAX_LLM_TXT_BYTES} bytes`);
  }

  await writeFile(path.join(packageRoot, 'llm.txt'), output, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
