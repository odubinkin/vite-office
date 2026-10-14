/** @fileoverview Original merge spans and ScMF/ScMergeFlagAttr predicates over actual shared pool/integer items; XML diagnostic hooks remain unported. */

import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { ATTR_MERGE, ATTR_MERGE_FLAG } from "../../../inc/scitems";
import type { SCCOL, SCROW } from "../../../inc/types";

/** Original merged-cell span attribute; native copy resets Which and assignment copies only payload. */
export class ScMergeAttr extends SfxPoolItem {
  private nColMerge: SCCOL;
  private nRowMerge: SCROW;
  /** Original coordinate constructor. @param columns - Signed16 span. @param rows - Signed32 span. @returns Attribute. */
  constructor(columns: SCCOL, rows: SCROW);
  /** Original zero-span default or explicit copy construction resets the base identity. @param source - Optional actual initialized copy source. @returns Attribute. */
  constructor(source?: Readonly<ScMergeAttr>);
  /** Implements original overloads without a document or substitute provider. @param columnsOrSource - Span or source. @param rows - Signed32 span. @returns Attribute. */
  constructor(columnsOrSource: SCCOL | Readonly<ScMergeAttr> = 0, rows: SCROW = 0) {
    super(ATTR_MERGE);
    this.nColMerge =
      typeof columnsOrSource === "number"
        ? (columnsOrSource << 16) >> 16
        : columnsOrSource.GetColMerge();
    this.nRowMerge = typeof columnsOrSource === "number" ? rows | 0 : columnsOrSource.GetRowMerge();
  }
  /** Original column span query. @returns Stored span. */
  public GetColMerge(): SCCOL {
    return this.nColMerge;
  }
  /** Original row span query. @returns Stored span. */
  public GetRowMerge(): SCROW {
    return this.nRowMerge;
  }
  /** Original predicate accepts either axis greater than one. @returns Whether merged. */
  public IsMerged(): boolean {
    return this.nColMerge > 1 || this.nRowMerge > 1;
  }
  /** Original assignment leaves the destination base identity unchanged. @param source - Actual initialized source. @returns Recipient. */
  public copy_assign(source: Readonly<ScMergeAttr>): this {
    this.nColMerge = source.GetColMerge();
    this.nRowMerge = source.GetRowMerge();
    return this;
  }
  /** Original same-type payload equality ignores Which; foreign type lies outside the native assertion contract. @param other - Candidate item. @returns Whether equal. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof ScMergeAttr &&
      this.nColMerge === other.nColMerge &&
      this.nRowMerge === other.nRowMerge
    );
  }
  /** Original clone uses the explicit copy constructor and resets Which. @param pool - Original unused optional pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): ScMergeAttr {
    void pool;
    return new ScMergeAttr(this);
  }
}

/** Original flags for merge overlap, filter arrows, scenario and pivot controls. */
export enum ScMF {
  NONE = 0x0000,
  Hor = 0x0001,
  Ver = 0x0002,
  Auto = 0x0004,
  Button = 0x0008,
  Scenario = 0x0010,
  ButtonPopup = 0x0020,
  HiddenMember = 0x0040,
  DpTable = 0x0080,
  DpCollapse = 0x0100,
  DpExpand = 0x0200,
  ButtonPopup2 = 0x0400,
  All = 0x07ff,
}

/** Original signed integer attribute owner; ordinary JS references reuse the existing shared pool contract. */
export class ScMergeFlagAttr extends SfxInt16Item {
  /** Original default, flag and implicit copy construction. @param flags - Original enum value or const copy source. @returns Attribute. */
  constructor(flags: ScMF | Readonly<ScMergeFlagAttr> = ScMF.NONE) {
    super(
      typeof flags === "number" ? ATTR_MERGE_FLAG : flags.Which(),
      ((typeof flags === "number" ? flags : flags.GetValue()) << 16) >> 16,
    );
  }
  /** Original cast from signed integer item to ScMF. @returns Stored flag bits. */
  public override GetValue(): ScMF {
    return super.GetValue() as ScMF;
  }
  /** Original clone copies the actual attribute and base identity. @param pool - Original optional pool, unused by this owner. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): ScMergeFlagAttr {
    void pool;
    return new ScMergeFlagAttr(this);
  }
  /** Original horizontal overlap test. @returns Whether set. */
  public IsHorOverlapped(): boolean {
    return Boolean(this.GetValue() & ScMF.Hor);
  }
  /** Original vertical overlap test. @returns Whether set. */
  public IsVerOverlapped(): boolean {
    return Boolean(this.GetValue() & ScMF.Ver);
  }
  /** Original combined overlap test. @returns Whether either set. */
  public IsOverlapped(): boolean {
    return Boolean(this.GetValue() & (ScMF.Hor | ScMF.Ver));
  }
  /** Original filter arrow test. @returns Whether set. */
  public HasAutoFilter(): boolean {
    return Boolean(this.GetValue() & ScMF.Auto);
  }
  /** Original scenario test. @returns Whether set. */
  public IsScenario(): boolean {
    return Boolean(this.GetValue() & ScMF.Scenario);
  }
  /** Original pivot field button test. @returns Whether set. */
  public HasPivotButton(): boolean {
    return Boolean(this.GetValue() & ScMF.Button);
  }
  /** Original pivot popup arrow test. @returns Whether set. */
  public HasPivotPopupButton(): boolean {
    return Boolean(this.GetValue() & ScMF.ButtonPopup);
  }
  /** Original compact pivot collapse or expand test. @returns Whether either set. */
  public HasPivotToggle(): boolean {
    const flags = this.GetValue();
    return Boolean(flags & ScMF.DpCollapse || flags & ScMF.DpExpand);
  }
  /** Original multi-field popup arrow test. @returns Whether set. */
  public HasPivotMultiFieldPopupButton(): boolean {
    return Boolean(this.GetValue() & ScMF.ButtonPopup2);
  }
}
