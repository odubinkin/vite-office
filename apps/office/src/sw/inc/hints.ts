/** @fileoverview Defines bounded typed Writer model hints from pinned `sw/inc/hints.hxx`. */

import type { SfxHint } from "../../svl/source/notify/SfxBroadcaster";

/** Atomic Writer notifications emitted by model and shell boundaries. */
export type SwAtomicModelHint =
  | Readonly<{
      formatId?: string;
      kind: "attribute-set-changed";
      nodeId?: string;
      nodeIndex?: number | undefined;
    }>
  | Readonly<{ kind: "cursor-selection-changed" }>
  | Readonly<{ kind: "document-disposed" }>
  | Readonly<{ kind: "document-modified"; modified: boolean }>
  | Readonly<{ kind: "document-replaced" }>
  | Readonly<{ kind: "document-state-changed" }>
  | Readonly<{ kind: "line-number-info-changed" }>
  | Readonly<{ kind: "mark-changed" }>
  | Readonly<{
      kind: "format-inheritance-changed";
      formatId: string;
      nodeId?: string;
      nodeIndex?: number | undefined;
    }>
  | Readonly<{ index: number; kind: "node-inserted"; nodeId?: string }>
  | Readonly<{ index: number; kind: "node-removed"; nodeId?: string }>
  | Readonly<{ kind: "node-content-changed"; nodeId?: string; nodeIndex?: number | undefined }>
  | Readonly<{ kind: "numbering-changed"; nodeIndex?: number; ruleName?: string }>
  | Readonly<{ kind: "page-descriptor-changed" }>
  | Readonly<{ kind: "medium-operation-changed" }>;

/** One bounded notification transaction, possibly containing several atomic model hints. */
export interface SwModelTransactionHint extends SfxHint {
  readonly hints: readonly SwAtomicModelHint[];
  readonly kind: "model-transaction";
}

/** Complete typed notification graph visible to model clients. */
export type SwModelHint = SwAtomicModelHint | SwModelTransactionHint;

/** Checks whether a hint or transaction contains one atomic kind. @param hint - Candidate notification. @param kind - Requested atomic kind. @returns True when present. */
export function hasSwModelHintKind(hint: SwModelHint, kind: SwAtomicModelHint["kind"]): boolean {
  return (
    hint.kind === kind ||
    (hint.kind === "model-transaction" &&
      hint.hints.some(
        /** Matches one nested atomic discriminator. @param nested - Atomic hint. @returns Whether its kind matches. */ (
          nested,
        ) => nested.kind === kind,
      ))
  );
}
