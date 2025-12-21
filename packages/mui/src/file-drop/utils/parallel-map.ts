/**
 * 간단한 p-map 구현
 * GitHub: https://github.com/sindresorhus/p-map에서 영감을 받은 구현
 *
 * 프로미스들을 동시에 실행하되 concurrency 제한을 둘 수 있는 유틸리티
 */

export interface ParallelMapOptions {
  /**
   * 동시 실행할 최대 프로미스 수
   * @default Infinity
   */
  concurrency?: number;

  /**
   * 첫 번째 에러에서 중단할지 여부
   * @default true
   */
  stopOnError?: boolean;
}

/**
 * 배열의 각 요소에 대해 비동기 함수를 병렬 실행하되 동시 실행 수를 제한
 *
 * @param input 입력 배열
 * @param mapper 각 요소에 적용할 비동기 함수
 * @param options 옵션
 * @returns 결과 배열의 프로미스
 */
export async function parallelMap<T, R>(
  input: readonly T[],
  mapper: (item: T, index: number) => Promise<R> | R,
  options: ParallelMapOptions = {},
): Promise<R[]> {
  const { concurrency = Infinity, stopOnError = true } = options;

  if (concurrency <= 0) {
    throw new Error('concurrency must be a positive number');
  }

  const results: R[] = new Array(input.length);
  const executing: Promise<void>[] = [];
  let index = 0;
  let rejected = false;

  const processItem = async (inputIndex: number): Promise<void> => {
    try {
      const item = input[inputIndex];
      const result = await mapper(item, inputIndex);
      results[inputIndex] = result;
    } catch (error) {
      if (stopOnError) {
        rejected = true;
      }
      throw error;
    }
  };

  // 동시 실행 수만큼 프로미스를 시작
  while (index < input.length && executing.length < concurrency && !rejected) {
    const promise = processItem(index++).finally(() => {
      // 완료된 프로미스를 executing 배열에서 제거
      const executingIndex = executing.indexOf(promise);
      if (executingIndex >= 0) {
        executing.splice(executingIndex, 1);
      }
    });

    executing.push(promise);
  }

  // 남은 작업들을 순차적으로 처리
  while (index < input.length && !rejected) {
    // 하나가 완료될 때까지 대기
    await Promise.race(executing);

    // 새로운 작업 시작
    if (!rejected) {
      const promise = processItem(index++).finally(() => {
        const executingIndex = executing.indexOf(promise);
        if (executingIndex >= 0) {
          executing.splice(executingIndex, 1);
        }
      });

      executing.push(promise);
    }
  }

  // 모든 실행 중인 프로미스가 완료될 때까지 대기
  await Promise.all(executing);

  return results;
}

/**
 * 간단한 버전의 병렬 맵 - 기본적인 동시 실행 제어만 제공
 *
 * parallelMap보다 단순하고 빠르지만, 고급 에러 처리 기능은 없습니다.
 * 파일 시스템 순회에 최적화되어 청크 단위로 처리합니다.
 *
 * @example
 * ```ts
 * // 파일 배열을 병렬로 처리 (최대 4개씩)
 * const results = await simpleParallelMap(
 *   files,
 *   async (file) => {
 *     const content = await file.text();
 *     return content.length;
 *   },
 *   4
 * );
 * ```
 *
 * @template T 입력 배열의 요소 타입
 * @template R 출력 배열의 요소 타입
 *
 * @param input - 처리할 입력 배열
 * @param mapper - 각 요소에 적용할 함수 (동기 또는 비동기)
 * @param concurrency - 동시 실행할 최대 개수 (기본: 4)
 *
 * @returns 모든 결과가 포함된 배열의 Promise
 *
 * @since 1.0.0
 */
export async function simpleParallelMap<T, R>(
  input: readonly T[],
  mapper: (item: T, index: number) => Promise<R> | R,
  concurrency = 4,
): Promise<R[]> {
  const results: R[] = [];

  // concurrency가 input 길이보다 크면 모든 항목을 한 번에 처리
  if (concurrency >= input.length) {
    return Promise.all(input.map(mapper));
  }

  // 청크 단위로 처리
  for (let i = 0; i < input.length; i += concurrency) {
    const chunk = input.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((item, chunkIndex) => mapper(item, i + chunkIndex)),
    );
    results.push(...chunkResults);
  }

  return results;
}

/**
 * 기본 export로 parallelMap을 제공
 */
export default parallelMap;
