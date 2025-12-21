import { useCallback, useRef, useState } from 'react';
import { useDebounceEffect } from './useDebounceEffect.js';

/**
 * 파일 업로드의 결과를 나타내는 데이터 구조.
 *
 * 파일 업로드가 성공적으로 완료된 후 반환되는 정보를 정의합니다.
 */
export interface FileUploadResult {
  /**
   * 업로드된 파일의 고유 ID.
   * 서버 또는 데이터베이스에서 파일을 식별하는 데 사용됩니다.
   */
  id: string;

  /**
   * 업로드된 파일의 URL.
   * 업로드된 파일에 접근하거나 다운로드할 수 있는 경로를 제공합니다.
   */
  url: string;

  /**
   * 업로드된 파일의 총 크기(바이트 단위).
   * 선택적 속성으로, 서버가 파일 크기를 반환하지 않는 경우 undefined일 수 있습니다.
   */
  totalBytes?: number;

  /**
   * 업로드된 파일의 이름.
   * 파일의 원래 이름 또는 서버에서 생성한 이름일 수 있습니다.
   */
  fileName?: string;

  /**
   * 업로드된 파일의 MIME 타입.
   * 예: `image/jpeg`, `application/pdf` 등 파일의 유형을 나타냅니다.
   */
  contentType?: string;
}

/**
 * React 커스텀 훅으로 이미지를 업로드하고 업로드 상태를 관리합니다.
 *
 * 이 훅은 Blob 파일을 업로드하는 비동기 작업을 처리하며, 업로드 완료 시 결과를 콜백으로 반환합니다.
 * 또한, 업로드 상태(loading)를 관리합니다.
 *
 * @param file - 업로드할 파일(Blob). null 또는 undefined인 경우 업로드를 중단합니다.
 * @param handleFileUpload - 파일 업로드를 처리하는 비동기 함수. Blob 파일을 받아 서버에 업로드하고 업로드 결과를 반환해야 합니다.
 * @param callback - 업로드 완료 또는 실패 시 호출되는 콜백. 업로드 성공 시 결과(`FileUploadResult` 객체)를, 실패 또는 취소 시 null을 전달합니다.
 *
 * @returns 업로드가 진행 중인 상태를 나타내는 boolean 값. `true`면 업로드 중이고, `false`면 업로드가 완료되었거나 중단된 상태입니다.
 *
 * @example
 * ```tsx
 * import { useImageUpload } from './useImageUpload';
 *
 * function FileUploader() {
 *   const [file, setFile] = useState<Blob | null>(null);
 *   const loading = useImageUpload(
 *     file,
 *     async (file) => {
 *       // 서버에 파일 업로드 로직
 *       const response = await uploadFileToServer(file);
 *       return {
 *         id: response.id,
 *         url: response.url,
 *         totalBytes: response.size,
 *         fileName: response.name,
 *         contentType: response.type,
 *       };
 *     },
 *     (result) => {
 *       if (result) {
 *         console.log('Upload success:', result.url);
 *       } else {
 *         console.log('Upload canceled or failed');
 *       }
 *     }
 *   );
 *
 *   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0];
 *     if (file) {
 *       setFile(file);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleChange} />
 *       {loading && <p>Uploading...</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useImageUpload(
  file: Blob | null | undefined,
  handleFileUpload: (file: Blob) => Promise<FileUploadResult>,
  callback: (imageUrl: FileUploadResult | null) => void,
): boolean {
  const targetFile = file ?? null;
  const [loading, setLoading] = useState(false);

  const handleFileUploadRef = useRef(handleFileUpload);
  handleFileUploadRef.current = handleFileUpload;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const doUploadImageFile = useCallback(
    async (ctx: { canceled: boolean }, src: Blob): Promise<FileUploadResult | null> => {
      setLoading(true);
      try {
        const result = await handleFileUploadRef.current(src);
        if (ctx.canceled) return null;
        return result;
      } catch (err) {
        console.log('image load failed', err);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [],
  );

  useDebounceEffect(
    () => {
      if (!targetFile) return;
      const ctx = { canceled: false };
      doUploadImageFile(ctx, targetFile).then((result) => {
        if (ctx.canceled) return;
        callbackRef.current(result);
      });
      return () => {
        ctx.canceled = true;
      };
    },
    [doUploadImageFile, targetFile],
    { wait: 100 },
  );

  return loading;
}
