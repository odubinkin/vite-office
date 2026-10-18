/**
 * @fileoverview Reimplements bounded paragraph-alignment, tab-stop, and line-spacing values from pinned `editeng/source/items/paraitem.cxx`.
 */

import { getSystemDecimalSeparator } from "../../../unotools/source/misc/syslocale";
import { SvxTabAdjust } from "../../inc/svxenum";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";

/** Original const borrowed tab value; mutable-reference overloads are intentionally absent. */
export interface SvxTabStopConstReference {
  /** Original const position. @returns Twips. */
  GetTabPos(): number;
  /** Original const adjustment. @returns Adjustment. */
  GetAdjustment(): SvxTabAdjust;
  /** Original const decimal unit. @returns One UTF16 unit. */
  GetDecimal(): string;
  /** Original const fill unit. @returns One UTF16 unit. */
  GetFill(): string;
  /** Original const equality. @param other - Other value. @returns Equality. */
  equals(other: SvxTabStopConstReference): boolean;
  /** Original const inequality. @param other - Other value. @returns Difference. */
  notEquals(other: SvxTabStopConstReference): boolean;
  /** Original const ordering. @param other - Other value. @returns Position order. */
  lessThan(other: SvxTabStopConstReference): boolean;
}
/** Original tab value with independent copied fields; JS char values are single UTF16-unit strings. */
export class SvxTabStop implements SvxTabStopConstReference {
  private readonly position: [number] = [0];
  private readonly adjustment: [SvxTabAdjust] = [SvxTabAdjust.Left];
  private readonly decimal: [string] = ["\0"];
  private readonly fill: [string] = [" "];
  /** Original default/position/copy forms. Copy preserves a previously resolved decimal without querying the host again. @param args - Native arguments. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: SvxTabStopConstReference]
      | [position: number, adjustment?: SvxTabAdjust, decimal?: string, fill?: string]
  ) {
    if (typeof args[0] === "object") {
      const source = args[0] as SvxTabStop;
      this.position[0] = source.position[0];
      this.adjustment[0] = source.adjustment[0];
      this.decimal[0] = source.decimal[0];
      this.fill[0] = source.fill[0];
    } else {
      const [position = 0, adjustment = SvxTabAdjust.Left, decimal = "\0", fill = " "] = args as [
        number?,
        SvxTabAdjust?,
        string?,
        string?,
      ];
      if (!Number.isInteger(position) || position < -2147483648 || position > 2147483647)
        throw new Error("SvxTabStop position is invalid.");
      if (!Number.isInteger(adjustment)) throw new Error("SvxTabStop adjustment is invalid.");
      if (decimal.length !== 1 || fill.length !== 1)
        throw new Error("SvxTabStop characters must contain one character.");
      this.position[0] = position;
      this.adjustment[0] = adjustment;
      this.decimal[0] = decimal;
      this.fill[0] = fill;
      this.fillDecimal();
    }
  }
  /** Original const position. @returns Twips. */
  GetTabPos(): number;
  /** Native nonconst-reference syntax binding, sharing the existing field. @param mutable - Selects the nonconst form. @returns Stable field cell. */
  GetTabPos(mutable: true): [number];
  /** Selects the original const/nonconst getter. @param mutable - Optional reference form. @returns Scalar or original field cell. */
  GetTabPos(mutable?: true): number | [number] {
    return mutable === true ? this.position : this.position[0];
  }
  /** Original const adjustment. @returns Adjustment. */
  GetAdjustment(): SvxTabAdjust;
  /** Original mutable adjustment reference. @param mutable - Nonconst form. @returns Field cell. */
  GetAdjustment(mutable: true): [SvxTabAdjust];
  /** Original const/nonconst adjustment binding. @param mutable - Optional reference form. @returns Value or field. */
  GetAdjustment(mutable?: true): SvxTabAdjust | [SvxTabAdjust] {
    return mutable === true ? this.adjustment : this.adjustment[0];
  }
  /** Original const decimal char. @returns Unit. */
  GetDecimal(): string;
  /** Original mutable decimal reference. @param mutable - Nonconst form. @returns Field cell. */
  GetDecimal(mutable: true): [string];
  /** Original const/nonconst decimal binding; writing nul does not rerun fillDecimal. @param mutable - Optional reference form. @returns Unit or field. */
  GetDecimal(mutable?: true): string | [string] {
    return mutable === true ? this.decimal : this.decimal[0];
  }
  /** Original const fill char. @returns Unit. */
  GetFill(): string;
  /** Original mutable fill reference. @param mutable - Nonconst form. @returns Field cell. */
  GetFill(mutable: true): [string];
  /** Original const/nonconst fill binding. @param mutable - Optional reference form. @returns Unit or field. */
  GetFill(mutable?: true): string | [string] {
    return mutable === true ? this.fill : this.fill[0];
  }
  /** Original full field comparison. @param other - Other tab. @returns Equal value. */
  equals(other: SvxTabStopConstReference): boolean {
    const source = other as SvxTabStop;
    return (
      this.position[0] === source.position[0] &&
      this.adjustment[0] === source.adjustment[0] &&
      this.decimal[0] === source.decimal[0] &&
      this.fill[0] === source.fill[0]
    );
  }
  /** Original implicit memberwise assignment, preserving existing field identities and nonvirtual base-value copying. @param other - Actual const borrowed source. @returns Recipient. */
  assign(other: SvxTabStopConstReference): this {
    const source = other as SvxTabStop;
    this.position[0] = source.position[0];
    this.adjustment[0] = source.adjustment[0];
    this.decimal[0] = source.decimal[0];
    this.fill[0] = source.fill[0];
    return this;
  }
  /** Original inequality. @param other - Other tab. @returns Different fields. */
  notEquals(other: SvxTabStopConstReference): boolean {
    return !SvxTabStop.prototype.equals.call(this, other);
  }
  /** Original position-only strict order over actual fields, without virtual getter dispatch. @param other - Other tab. @returns Ordered positions. */
  lessThan(other: SvxTabStopConstReference): boolean {
    return this.position[0] < (other as SvxTabStop).position[0];
  }
  /** Original constructor-only default decimal resolution. @returns Nothing. */
  private fillDecimal(): void {
    if (this.decimal[0] === "\0") this.decimal[0] = getSystemDecimalSeparator();
  }
}

/** Original Asian paragraph boolean value owner. */
export class SvxScriptSpaceItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxScriptSpaceItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxScriptSpaceItem {
    void pool;
    return new SvxScriptSpaceItem(this);
  }
}

/** Original Asian paragraph boolean value owner. */
export class SvxHangingPunctuationItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(
    ...args: [value: boolean, which: number] | [source: Readonly<SvxHangingPunctuationItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxHangingPunctuationItem {
    void pool;
    return new SvxHangingPunctuationItem(this);
  }
}

/** Original Asian paragraph boolean value owner. */
export class SvxForbiddenRuleItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxForbiddenRuleItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxForbiddenRuleItem {
    void pool;
    return new SvxForbiddenRuleItem(this);
  }
}

/** Original automatic paragraph writing-direction bool attribute. */
export class SvxAutoFrameDirectionItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy constructors. @param args - Original arguments. @returns Item. */
  public constructor(
    ...args: [enabled: boolean, which: number] | [source: Readonly<SvxAutoFrameDirectionItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original independent concrete copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxAutoFrameDirectionItem {
    void pool;
    return new SvxAutoFrameDirectionItem(this);
  }
}
