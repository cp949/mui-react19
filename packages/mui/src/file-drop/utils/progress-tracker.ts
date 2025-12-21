import type { CallbackOptions, FileItem, ProgressInfo } from '../types.js';

/**
 * 진행 상황 추적기
 */
export class ProgressTracker {
  private startTime: number;
  private totalItems: number;
  private processedItems: number = 0;
  private currentItem?: FileItem;
  private onProgress?: (progress: ProgressInfo) => void;

  constructor(totalItems: number, callbacks?: CallbackOptions) {
    this.totalItems = totalItems;
    this.startTime = Date.now();
    this.onProgress = callbacks?.onProgress;
  }

  /**
   * 현재 처리 중인 아이템 설정
   */
  setCurrentItem(item: FileItem) {
    this.currentItem = item;
    this.notifyProgress();
  }

  /**
   * 아이템 처리 완료
   */
  completeItem() {
    this.processedItems++;
    this.currentItem = undefined;
    this.notifyProgress();
  }

  /**
   * 진행 상황 알림
   */
  private notifyProgress() {
    if (!this.onProgress) return;

    const elapsed = Date.now() - this.startTime;
    const percentage =
      this.totalItems > 0 ? Math.round((this.processedItems / this.totalItems) * 100) : 0;

    let estimatedTimeLeft: number | undefined;
    if (this.processedItems > 0 && percentage < 100) {
      const avgTimePerItem = elapsed / this.processedItems;
      const remainingItems = this.totalItems - this.processedItems;
      estimatedTimeLeft = Math.round(avgTimePerItem * remainingItems);
    }

    const progress: ProgressInfo = {
      totalItems: this.totalItems,
      processedItems: this.processedItems,
      currentItem: this.currentItem,
      percentage,
      estimatedTimeLeft,
    };

    this.onProgress(progress);
  }

  /**
   * 총 아이템 수 업데이트 (디렉토리 순회 중 발견될 때)
   */
  updateTotalItems(newTotal: number) {
    this.totalItems = newTotal;
    this.notifyProgress();
  }

  /**
   * 처리 완료 여부
   */
  get isComplete(): boolean {
    return this.processedItems >= this.totalItems;
  }

  /**
   * 처리 시간 (밀리초)
   */
  get elapsedTime(): number {
    return Date.now() - this.startTime;
  }
}
