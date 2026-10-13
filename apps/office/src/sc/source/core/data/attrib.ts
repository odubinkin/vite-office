/** @fileoverview Original ScMF/ScMergeFlagAttr value and flag predicates; uses actual shared integer item, XML diagnostic hook remains unported. */

import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { ATTR_MERGE_FLAG } from "../../../inc/scitems";

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
