/** @fileoverview Owns Writer row frame item sets from swtblfmt.hxx and aTableLineSetRange. */
import { SwFrameFormat } from "../source/core/layout/atrfrm";
import type { SwAttrPool } from "../source/core/attr/swatrset";
import { SwTableBox } from "../source/core/table/swtable";
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
  /** Publishes row format inheritance changes to its clients. @returns Nothing. */
  protected override NotifyFormatInheritance(): void {
    this.CallSwClientNotify({ kind: "format-inheritance-changed", formatId: this.GetName() });
  }
}

/** Native cell frame format shares item sets among original registered box clients. */
export class SwTableBoxFormat extends SwFrameFormat {
  /** Creates exact native box ranges and inheritance. @param pool - Document pool. @param derivedFrom - Native default parent. @returns Nothing. */
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
        [127, 127],
        [137, 137],
        [157, 159],
        [160, 160],
      ],
      derivedFrom,
    );
  }
  /** Copies native items and inheritance without copying clients or name. @param source - Original native owner. @returns Nothing. */
  public CopyFormatFrom(source: SwTableBoxFormat): void {
    this.ResetAllFormatAttr();
    this.SetFormatAttrSet(source.GetAttrSet());
    this.SetDerivedFrom(source.DerivedFrom());
    this.SetAuto(source.IsAuto());
  }
  /** Reads the first original box client as the native iterator does. @returns Original box or absent. */
  public GetTableBox(): SwTableBox | undefined {
    let box: SwTableBox | undefined;
    this.ForAllListeners(
      /** Finds original box clients. @param client - Native listener. @returns Whether found. */ (
        client,
      ) => {
        if (client instanceof SwTableBox) {
          box = client;
          return true;
        }
        return false;
      },
    );
    return box;
  }
  /** Publishes native inheritance changes to registered clients. @returns Nothing. */
  protected override NotifyFormatInheritance(): void {
    this.CallSwClientNotify({ kind: "format-inheritance-changed", formatId: this.GetName() });
  }
}
