/** @fileoverview Original merge dialog choices and application-wide last accepted choice. */

/** Source covered-cell choices in the original radio order. */
export enum ScMergeCellsOption {
  MoveContentHiddenCells,
  KeepContentHiddenCells,
  EmptyContentHiddenCells,
}

let lastUsedMergeCellsOption = ScMergeCellsOption.KeepContentHiddenCells;

/** Seeds the source dialog from the last confirmed radio selection. */
export class ScMergeCellsDialog {
  readonly initialOption = lastUsedMergeCellsOption;

  /** Returns and remembers the radio response on acceptance. @param option - Accepted radio button. @returns Native choice. */
  GetMergeCellsOption(option: ScMergeCellsOption): ScMergeCellsOption {
    lastUsedMergeCellsOption = option;
    return option;
  }
}
