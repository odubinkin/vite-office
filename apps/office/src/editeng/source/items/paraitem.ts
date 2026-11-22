/**
 * @fileoverview Reimplements bounded paragraph-alignment, tab-stop, and line-spacing values from pinned `editeng/source/items/paraitem.cxx`.
 */

import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Any2Bool, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import {
  MID_IS_HYPHEN,
  MID_HYPHEN_MIN_LEAD,
  MID_HYPHEN_MIN_TRAIL,
  MID_HYPHEN_MAX_HYPHENS,
  MID_HYPHEN_NO_CAPS,
  MID_HYPHEN_NO_LAST_WORD,
  MID_HYPHEN_MIN_WORD_LENGTH,
  MID_HYPHEN_ZONE,
  MID_HYPHEN_ZONE_ALWAYS,
  MID_HYPHEN_ZONE_COLUMN,
  MID_HYPHEN_ZONE_PAGE,
  MID_HYPHEN_ZONE_SPREAD,
  MID_HYPHEN_KEEP,
  MID_HYPHEN_KEEP_TYPE,
  MID_HYPHEN_COMPOUND_MIN_LEAD,
  MID_HYPHEN_COMPOUND_MIN_TRAIL,
  MID_HYPHEN_KEEP_LINE,
} from "../../inc/memberids";
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

/** Values from com.sun.star.text.ParagraphHyphenationKeepType. */
export enum ParagraphHyphenationKeepType {
  AUTO = 0,
  SPREAD = 1,
  PAGE = 2,
  COLUMN = 3,
  ALWAYS = 4,
}

/** Original SvxHyphenZoneItem constructor defaults in member order. */
const hyphenZoneDefaults = {
  hyphen: false,
  minLead: 0,
  minTrail: 0,
  maxHyphens: 255,
  noCaps: false,
  noLastWord: false,
  minWordLength: 0,
  zone: 0,
  paragraphEndZone: 0,
  columnEndZone: 0,
  pageEndZone: 0,
  spreadEndZone: 0,
  keep: false,
  keepType: Number(ParagraphHyphenationKeepType.COLUMN),
  compoundMinLead: 2,
  compoundMinTrail: 2,
  keepLine: false,
};

/** Borrowed copy of the concrete native hyphenation payload. */
export type HyphenZoneSettings = Readonly<typeof hyphenZoneDefaults>;
/** Recognized native payload field. */
type HyphenZoneField = keyof HyphenZoneSettings;

const hyphenZoneMembers: Readonly<Partial<Record<number, HyphenZoneField>>> = {
  [MID_IS_HYPHEN]: "hyphen",
  [MID_HYPHEN_MIN_LEAD]: "minLead",
  [MID_HYPHEN_MIN_TRAIL]: "minTrail",
  [MID_HYPHEN_MAX_HYPHENS]: "maxHyphens",
  [MID_HYPHEN_NO_CAPS]: "noCaps",
  [MID_HYPHEN_NO_LAST_WORD]: "noLastWord",
  [MID_HYPHEN_MIN_WORD_LENGTH]: "minWordLength",
  [MID_HYPHEN_ZONE]: "zone",
  [MID_HYPHEN_ZONE_ALWAYS]: "paragraphEndZone",
  [MID_HYPHEN_ZONE_COLUMN]: "columnEndZone",
  [MID_HYPHEN_ZONE_PAGE]: "pageEndZone",
  [MID_HYPHEN_ZONE_SPREAD]: "spreadEndZone",
  [MID_HYPHEN_KEEP]: "keep",
  [MID_HYPHEN_KEEP_TYPE]: "keepType",
  [MID_HYPHEN_COMPOUND_MIN_LEAD]: "compoundMinLead",
  [MID_HYPHEN_COMPOUND_MIN_TRAIL]: "compoundMinTrail",
  [MID_HYPHEN_KEEP_LINE]: "keepLine",
};

/** Original paragraph hyphenation item with width-preserving UNO members. */
export class SvxHyphenZoneItem extends SfxPoolItem {
  private settings: HyphenZoneSettings;

  /** Constructs an item with source defaults or copied settings. @param hyphen - Automatic hyphenation. @param which - Native item identity. @param settings - Copied preset values. @returns Item. */
  public constructor(hyphen: boolean, which: number, settings?: Partial<HyphenZoneSettings>) {
    super(which);
    this.settings = Object.freeze({ ...hyphenZoneDefaults, ...settings, hyphen });
  }

  /** Creates the original EditEngine default. @returns Default item. */
  public static CreateDefault(): SvxHyphenZoneItem {
    return new SvxHyphenZoneItem(false, 0);
  }

  /** Copies the complete native slot value. @returns Detached item. */
  public override Clone(): SvxHyphenZoneItem {
    return new SvxHyphenZoneItem(this.settings.hyphen, this.Which(), this.settings);
  }

  /** Compares the complete native hyphenation value. @param other - Candidate item. @returns Payload equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxHyphenZoneItem &&
      (Object.keys(hyphenZoneDefaults) as HyphenZoneField[]).every(
        /** Compares one original field. @param field - Native payload key. @returns Field equality. */
        (field) => this.settings[field] === other.settings[field],
      )
    );
  }

  /** Returns the structured browser transfer payload. @returns Current value. */
  public override QueryValue(): HyphenZoneSettings;
  /** Reads an original UNO member. @param output - Result Any. @param member - Member identity. @returns Native success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Reads a UNO member or the immutable structured transfer value. @param output - Optional existing Any. @param member - Native member identity. @returns Success or current settings. */
  public override QueryValue(output?: Any, member = 0): HyphenZoneSettings | boolean {
    if (output === undefined) return this.settings;
    const field = hyphenZoneMembers[member & ~CONVERT_TWIPS];
    if (field === undefined) return true;
    const value = this.settings[field];
    if (typeof value === "boolean") output.insert([value], "bool");
    else output.insert([(value << 16) >> 16], "sal_Int16");
    return true;
  }

  /** Applies the source Any2Bool conversion or signed-long extraction followed by unsigned narrowing. @param input - UNO value. @param member - Native member identity. @returns Whether native conversion succeeded. */
  public override PutValue(input: unknown, member: number): boolean {
    const id = member & ~CONVERT_TWIPS;
    const field = hyphenZoneMembers[id];
    if (field !== undefined && typeof hyphenZoneDefaults[field] === "boolean") {
      this.settings = Object.freeze({ ...this.settings, [field]: Any2Bool(input) });
      return true;
    }
    const number: [number] = [0];
    if (!(input instanceof Any) || !input.extract(number, "sal_Int32")) return false;
    if (field !== undefined) {
      const mask = id >= MID_HYPHEN_ZONE && id <= MID_HYPHEN_ZONE_SPREAD ? 0xffff : 0xff;
      this.settings = Object.freeze({ ...this.settings, [field]: number[0] & mask });
    }
    return true;
  }
}
