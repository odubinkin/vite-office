/** @fileoverview Original paragraph split, widow/orphan, grid and vertical-alignment item values/copies/defaults and native Any contracts. Localized EditResId presentation is outside this value binding. */
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SfxByteItem, SfxUInt16Item } from "../../../svl/source/items/intitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
/** Original concrete split item and constructor argument order. */
export class SvxFormatSplitItem extends SfxBoolItem {
  /** Original explicit value/Which or implicit-copy constructor forms. @param args - Selected original arguments. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxFormatSplitItem>]) {
    const value = args[0],
      which = args[1];
    if (typeof value === "boolean") super(which as number, value);
    else super(value);
  }
  /** Source factory deliberately differs from Writer's true pool default. @returns Zero/false item. */
  static override CreateDefault(): SvxFormatSplitItem {
    return new SvxFormatSplitItem(false, 0);
  }
  /** Original concrete copy. @param pool - Unused native pool. @returns Owned copy. */
  override Clone(pool?: SfxItemPool): SvxFormatSplitItem {
    void pool;
    return new SvxFormatSplitItem(this);
  }
}
/** Original unsigned-byte widow-line item. */
export class SvxWidowsItem extends SfxByteItem {
  /** Original explicit value/Which or implicit-copy constructor forms. @param args - Selected original arguments. @returns Item. */
  constructor(...args: [value: number, which: number] | [source: Readonly<SvxWidowsItem>]) {
    const value = args[0],
      which = args[1];
    if (typeof value === "number") super(which as number, value);
    else super(value);
  }
  /** Original zero/zero factory. @returns Item. */
  static override CreateDefault(): SvxWidowsItem {
    return new SvxWidowsItem(0, 0);
  }
  /** Original concrete copy. @param pool - Unused pool. @returns Copy. */
  override Clone(pool?: SfxItemPool): SvxWidowsItem {
    void pool;
    return new SvxWidowsItem(this);
  }
}
/** Original unsigned-byte orphan-line item. */
export class SvxOrphansItem extends SfxByteItem {
  /** Original explicit value/Which or implicit-copy constructor forms. @param args - Selected original arguments. @returns Item. */
  constructor(...args: [value: number, which: number] | [source: Readonly<SvxOrphansItem>]) {
    const value = args[0],
      which = args[1];
    if (typeof value === "number") super(which as number, value);
    else super(value);
  }
  /** Original zero/zero factory. @returns Item. */
  static override CreateDefault(): SvxOrphansItem {
    return new SvxOrphansItem(0, 0);
  }
  /** Original concrete copy. @param pool - Unused pool. @returns Copy. */
  override Clone(pool?: SfxItemPool): SvxOrphansItem {
    void pool;
    return new SvxOrphansItem(this);
  }
}
/** Original nested SvxParaVertAlignItem::Align values. */
export enum ParaVertAlign {
  Automatic,
  Baseline,
  Top,
  Center,
  Bottom,
}
/** Original ushort-backed alignment with signed16 UNO projection and checked PutValue. */
export class SvxParaVertAlignItem extends SfxUInt16Item {
  /** Original nested enum declaration binding. */
  static readonly Align = ParaVertAlign;
  /** Original explicit value/Which or implicit-copy constructor forms. @param args - Selected original arguments. @returns Item. */
  constructor(
    ...args: [value: ParaVertAlign, which: number] | [source: Readonly<SvxParaVertAlignItem>]
  ) {
    const value = args[0],
      which = args[1];
    if (typeof value === "number") super(which as number, value);
    else super(value);
  }
  /** Original automatic/Which0 factory. @returns Item. */
  static override CreateDefault(): SvxParaVertAlignItem {
    return new SvxParaVertAlignItem(ParaVertAlign.Automatic, 0);
  }
  /** Original concrete copy. @param pool - Unused pool. @returns Copy. */
  override Clone(pool?: SfxItemPool): SvxParaVertAlignItem {
    void pool;
    return new SvxParaVertAlignItem(this);
  }
  /** Existing scalar transport projection. @returns Stored enum value. */
  override QueryValue(): number;
  /** Original signed16 Any query, ignoring member. @param output - Actual destination. @param member - Ignored selector. @returns True. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Source native query and existing scalar transport. @param output - Optional actual destination. @param member - Ignored selector. @returns Success or scalar. */
  override QueryValue(output?: Any, member = 0): number | boolean {
    void member;
    if (output === undefined) return this.GetValue();
    output.insert([(this.GetValue() << 16) >> 16], "sal_Int16");
    return true;
  }
  /** Original exact signed16 extraction/range admission before mutation. @param value - Actual source Any. @param member - Ignored selector. @returns Acceptance. */
  override PutValue(value: unknown, member: number): boolean {
    void member;
    const result: [number] = [0];
    if (
      value instanceof Any &&
      value.extract(result, "sal_Int16") &&
      result[0] >= 0 &&
      result[0] <= ParaVertAlign.Bottom
    ) {
      this.SetValue(result[0]);
      return true;
    }
    return false;
  }
}
/** Original paragraph grid boolean item. */
export class SvxParaGridItem extends SfxBoolItem {
  /** Original explicit value/Which or implicit-copy constructor forms. @param args - Selected original arguments. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxParaGridItem>]) {
    const value = args[0],
      which = args[1];
    if (typeof value === "boolean") super(which as number, value);
    else super(value);
  }
  /** Original concrete copy. @param pool - Unused pool. @returns Copy. */
  override Clone(pool?: SfxItemPool): SvxParaGridItem {
    void pool;
    return new SvxParaGridItem(this);
  }
}
