/** @fileoverview Owns Writer row frame item sets from swtblfmt.hxx and aTableLineSetRange. */
import { SwFrameFormat } from "../source/core/layout/atrfrm";
import type { SwAttrPool } from "../source/core/attr/swatrset";
/** Native row frame format shares a document-owned item set among registered clients. */
export class SwTableLineFormat extends SwFrameFormat {
  /** Creates the native row format with exact pinned row WhichId ranges. @param pool - Document pool. @param derivedFrom - Default frame parent. @returns Nothing. */
  public constructor(pool: SwAttrPool, derivedFrom?: SwFrameFormat) {
    super(
      pool,
      "",
      [
        [89, 90],
        [98, 99],
        [105, 105],
        [107, 107],
        [109, 109],
        [112, 114],
        [129, 129],
        [137, 137],
        [160, 160],
      ],
      derivedFrom,
    );
  }
  /** Assigns independent native attributes and inheritance without copying clients or name. @param source - Original frame format. @returns Nothing. */
  public CopyFormatFrom(source: SwTableLineFormat): void {
    this.ResetAllFormatAttr();
    this.SetFormatAttrSet(source.GetAttrSet());
    this.SetDerivedFrom(source.DerivedFrom());
    this.SetAuto(source.IsAuto());
  }
  /** Publishes native format attribute changes to its clients. @returns Nothing. */
  protected override NotifyAttributeSet(): void {
    this.CallSwClientNotify({ kind: "attribute-set-changed", formatId: this.GetName() });
  }
  /** Publishes row format inheritance changes to its clients. @returns Nothing. */
  protected override NotifyFormatInheritance(): void {
    this.CallSwClientNotify({ kind: "format-inheritance-changed", formatId: this.GetName() });
  }
}
