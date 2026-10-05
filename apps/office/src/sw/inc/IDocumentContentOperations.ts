/** @fileoverview Defines native text insertion modes from pinned sw/inc/IDocumentContentOperations.hxx. */

/** Native bit flags controlling insertion-boundary hint expansion. */
export enum SwInsertFlags {
  /** No additional expansion policy. */
  DEFAULT = 0x00,
  /** Expands eligible empty hints at the insertion position. */
  EMPTYEXPAND = 0x01,
  /** Prevents insertion-boundary hint expansion. */
  NOHINTEXPAND = 0x02,
  /** Overrides DontExpand during insertion. */
  FORCEHINTEXPAND = 0x04,
}
