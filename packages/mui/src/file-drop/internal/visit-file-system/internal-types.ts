import type { PathHolder } from '../path-util.js';

export type PathAndEntry =
  | {
      type: 'dir';
      path: PathHolder;
    }
  | {
      type: 'file';
      path: PathHolder;
      file: File;
    };
