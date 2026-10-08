/** @fileoverview Defines bounded typed Writer model hints from pinned `sw/inc/hints.hxx`. */

import type { SfxHint } from "../../svl/source/notify/SfxBroadcaster";
import type { SwFrameFormat } from "../source/core/layout/atrfrm";
import type { SwTableLineFormat, SwTableBoxFormat } from "./swtblfmt";
import type { SwTableLine, SwTableBox } from "../source/core/table/swtable";

/** Native history hint moves the original line frame clients to a reconstructed owner. */
export class MoveTableLineHint implements SfxHint {
  public readonly kind = "move-table-line";
  /** Borrows exact native owner and line references. @param m_rNewFormat - Restored frame format. @param m_rTableLine - Original row. @returns Nothing. */
  public constructor(
    public readonly m_rNewFormat: SwFrameFormat,
    public readonly m_rTableLine: SwTableLine,
  ) {}
}

/** Native row format change identifies precisely which original row frame clients move. */
export class TableLineFormatChanged implements SfxHint {
  public readonly kind = "table-line-format-changed";
  /** Borrows exact changed owner and original line references. @param m_rNewFormat - Replacement row format. @param m_rTabLine - Original row. @returns Nothing. */
  public constructor(
    public readonly m_rNewFormat: SwTableLineFormat,
    public readonly m_rTabLine: SwTableLine,
  ) {}
}

/** Native history notification borrows the original cell and reconstructed owner. */
export class MoveTableBoxHint implements SfxHint {
  public readonly kind = "move-table-box";
  /** Borrows original native references. @param m_rNewFormat - Restored owner. @param m_rTableBox - Original box. @returns Nothing. */
  public constructor(
    public readonly m_rNewFormat: SwFrameFormat,
    public readonly m_rTableBox: SwTableBox,
  ) {}
}
/** Native cell change identifies the original owner and box. */
export class TableBoxFormatChanged implements SfxHint {
  public readonly kind = "table-box-format-changed";
  /** Borrows original native references. @param m_rNewFormat - New box format. @param m_rTableBox - Original box. @returns Nothing. */
  public constructor(
    public readonly m_rNewFormat: SwTableBoxFormat,
    public readonly m_rTableBox: SwTableBox,
  ) {}
}
/** Atomic Writer notifications emitted by model and shell boundaries. */
export type SwAtomicModelHint =
  | MoveTableBoxHint
  | TableBoxFormatChanged
  | MoveTableLineHint
  | TableLineFormatChanged
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
