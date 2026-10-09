/** @fileoverview Defines bounded typed Writer model hints from pinned `sw/inc/hints.hxx`. */

import type { LegacyModifyHint, ModifyChangedHint, SwModify } from "./calbck";
import type { SwAttrSet } from "../source/core/attr/swatrset";
import type { SfxHint } from "../../svl/source/notify/SfxBroadcaster";
import type { SwFrameFormat } from "../source/core/layout/atrfrm";
import type { SwFormat } from "../source/core/attr/format";
import type { SwTableLineFormat, SwTableBoxFormat } from "./swtblfmt";
import type { SwTableLine, SwTableBox } from "../source/core/table/swtable";

/** Native Writer death notification borrows the original dying modify. */
export class ObjectDyingHint implements SfxHint {
  public readonly kind = "object-dying";
  /** Borrows the dying native owner. @param m_pDying - Original modify being destroyed. @returns Nothing. */
  public constructor(public readonly m_pDying: SwModify) {}
}

/** Native inheritance notification borrows exact old and new format owners. */
export class SwFormatChangeHint implements SfxHint {
  public readonly kind = "format-change";
  /** Borrows original native format pointers. @param m_pOldFormat - Previous owner or absent. @param m_pNewFormat - New owner or absent. @returns Nothing. */
  public constructor(
    public readonly m_pOldFormat: SwFormat | undefined,
    public readonly m_pNewFormat: SwFormat | undefined,
  ) {}
}

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
  | LegacyModifyHint
  | ModifyChangedHint
  | ObjectDyingHint
  | AttrSetChangeHint
  | SwFormatChangeHint
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

/** Native change descriptor borrows an original attribute set and its delta; copies own only the delta. */
export class SwAttrSetChg {
  private readonly m_pTheChgdSet: SwAttrSet;
  private readonly m_pChgSet: SwAttrSet;
  /** Copies a native change descriptor. @param source - Original change. @returns Nothing. */
  public constructor(source: SwAttrSetChg);
  /** Borrows original and delta sets. @param source - Original changed set. @param changed - Exact delta. @returns Nothing. */
  public constructor(source: SwAttrSet, changed: SwAttrSet);
  /** Implements native borrowed and copied ownership. @param source - Changed set or descriptor. @param changed - Borrowed delta when constructing. @returns Nothing. */
  public constructor(source: SwAttrSet | SwAttrSetChg, changed?: SwAttrSet) {
    if (source instanceof SwAttrSetChg) {
      this.m_pTheChgdSet = source.GetTheChgdSet();
      this.m_pChgSet = source.GetChgSet().CloneAsValue();
    } else {
      this.m_pTheChgdSet = source;
      this.m_pChgSet = changed as SwAttrSet;
    }
  }
  /** Reads the exact changed items. @returns Borrowed or copy-owned delta. */
  public GetChgSet(): SwAttrSet {
    return this.m_pChgSet;
  }
  /** Reads the original changed set identity. @returns Original owner. */
  public GetTheChgdSet(): SwAttrSet {
    return this.m_pTheChgdSet;
  }
  /** Counts delta items. @returns Native count. */
  public Count(): number {
    return this.m_pChgSet.Count();
  }
  /** Clears one delta WhichId. @param which - Native identity. @returns Nothing. */
  public ClearItem(which: number): void {
    this.m_pChgSet.ClearItem(which);
  }
}
/** Native attribute change borrows old and new change descriptors. */
export class AttrSetChangeHint implements SfxHint {
  public readonly kind = "attr-set-change";
  /** Borrows exact old/new deltas. @param m_pOld - Previous change or absent. @param m_pNew - Accepted change or absent. @returns Nothing. */
  public constructor(
    public readonly m_pOld: SwAttrSetChg | undefined,
    public readonly m_pNew: SwAttrSetChg | undefined,
  ) {}
}
