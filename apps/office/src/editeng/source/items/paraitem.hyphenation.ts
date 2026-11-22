/** @fileoverview SvxHyphenZoneItem storage and native UNO members from paraitem.cxx. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { any2bool } from "../../../comphelper/inc/extract";
import { COLUMN } from "../../../offapi/com/sun/star/text/ParagraphHyphenationKeepType";
import { CONVERT_TWIPS, SfxPoolItem } from "../../../svl/inc/poolitem";
import * as Member from "../../inc/memberids";

/** Complete hyphenation item state for Worker reconstruction. */
export interface HyphenZoneState {
  hyphenate: boolean;
  keep: boolean;
  noCaps: boolean;
  noLastWord: boolean;
  minLead: number;
  minTrail: number;
  maxHyphens: number;
  minWordLength: number;
  zone: number;
  zoneAlways: number;
  zoneColumn: number;
  zonePage: number;
  zoneSpread: number;
  keepType: number;
  keepLine: boolean;
  compoundMinLead: number;
  compoundMinTrail: number;
}

const boolMembers = new Map<number, "hyphenate" | "keep" | "noCaps" | "noLastWord" | "keepLine">([
  [Member.MID_IS_HYPHEN, "hyphenate"],
  [Member.MID_HYPHEN_KEEP, "keep"],
  [Member.MID_HYPHEN_NO_CAPS, "noCaps"],
  [Member.MID_HYPHEN_NO_LAST_WORD, "noLastWord"],
  [Member.MID_HYPHEN_KEEP_LINE, "keepLine"],
]);
/** Fields stored as native unsigned byte or word values. */
type NumberKey = Exclude<
  keyof HyphenZoneState,
  "hyphenate" | "keep" | "noCaps" | "noLastWord" | "keepLine"
>;
const numberMembers = new Map<number, readonly [NumberKey, number]>([
  [Member.MID_HYPHEN_MIN_LEAD, ["minLead", 0xff]],
  [Member.MID_HYPHEN_MIN_TRAIL, ["minTrail", 0xff]],
  [Member.MID_HYPHEN_MAX_HYPHENS, ["maxHyphens", 0xff]],
  [Member.MID_HYPHEN_MIN_WORD_LENGTH, ["minWordLength", 0xff]],
  [Member.MID_HYPHEN_ZONE, ["zone", 0xffff]],
  [Member.MID_HYPHEN_ZONE_ALWAYS, ["zoneAlways", 0xffff]],
  [Member.MID_HYPHEN_ZONE_COLUMN, ["zoneColumn", 0xffff]],
  [Member.MID_HYPHEN_ZONE_PAGE, ["zonePage", 0xffff]],
  [Member.MID_HYPHEN_ZONE_SPREAD, ["zoneSpread", 0xffff]],
  [Member.MID_HYPHEN_KEEP_TYPE, ["keepType", 0xff]],
  [Member.MID_HYPHEN_COMPOUND_MIN_LEAD, ["compoundMinLead", 0xff]],
  [Member.MID_HYPHEN_COMPOUND_MIN_TRAIL, ["compoundMinTrail", 0xff]],
]);

/** Original pooled paragraph hyphenation item. */
export class SvxHyphenZoneItem extends SfxPoolItem {
  private values: HyphenZoneState;

  /** Initializes the original standalone item defaults. @param hyphenate - Initial enablement. @param which - Item identifier. @returns Item. */
  public constructor(hyphenate: boolean, which: number) {
    super(which);
    this.values = {
      hyphenate,
      keep: false,
      noCaps: false,
      noLastWord: false,
      minLead: 0,
      minTrail: 0,
      maxHyphens: 255,
      minWordLength: 0,
      zone: 0,
      zoneAlways: 0,
      zoneColumn: 0,
      zonePage: 0,
      zoneSpread: 0,
      keepType: COLUMN,
      keepLine: false,
      compoundMinLead: 2,
      compoundMinTrail: 2,
    };
  }

  /** Rebuilds an item from complete unsigned Worker storage. @param source - Stored payload. @param which - Native Which. @returns Item. */
  public static fromState(source: unknown, which: number): SvxHyphenZoneItem {
    if (typeof source !== "object" || source === null)
      throw new Error("Invalid paragraph hyphenation item.");
    const fields = source as Readonly<Record<string, unknown>>;
    const item = new SvxHyphenZoneItem(false, which);
    for (const key of boolMembers.values()) {
      const value = fields[key];
      if (typeof value !== "boolean") throw new Error(`Invalid hyphenation field ${key}.`);
      item.values[key] = value;
    }
    for (const [key, max] of numberMembers.values()) {
      const value = fields[key];
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max)
        throw new Error(`Invalid hyphenation field ${key}.`);
      item.values[key] = value;
    }
    return item;
  }

  /** Returns the native factory item. @returns Default item. */
  public static CreateDefault(): SvxHyphenZoneItem {
    return new SvxHyphenZoneItem(false, 0);
  }

  /** Updates the native consecutive hyphen count. @param value - Unsigned byte. @returns Nothing. */
  public SetMaxHyphens(value: number): void {
    this.values.maxHyphens = value & 0xff;
  }

  /** Makes the native independent copy. @returns Cloned item. */
  public override Clone(): SvxHyphenZoneItem {
    const clone = new SvxHyphenZoneItem(this.values.hyphenate, this.Which());
    clone.values = { ...this.values };
    return clone;
  }

  /** Compares all native member values. @param other - Compared item. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    if (!(other instanceof SvxHyphenZoneItem)) return false;
    for (const key of boolMembers.values())
      if (this.values[key] !== other.values[key]) return false;
    for (const [key] of numberMembers.values())
      if (this.values[key] !== other.values[key]) return false;
    return true;
  }

  /** Copies the full state for Worker transport. @returns Complete item state. */
  public override QueryValue(): Readonly<HyphenZoneState>;
  /** Projects the selected native member. @param output - UNO Any. @param member - Native selector. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Queries the complete state or one typed member. @param output - Optional UNO Any. @param member - Native selector. @returns State or success. */
  public override QueryValue(output?: Any, member = 0): Readonly<HyphenZoneState> | boolean {
    if (output === undefined) return { ...this.values };
    const id = member & 0xff & ~CONVERT_TWIPS;
    const flag = boolMembers.get(id);
    if (flag !== undefined) output.insert([this.values[flag]], "bool");
    const value = numberMembers.get(id);
    if (value !== undefined) output.insert([(this.values[value[0]] << 16) >> 16], "sal_Int16");
    return true;
  }

  /** Uses the native Any2Bool or Int32 extraction and narrows to native storage. @param input - UNO Any. @param member - Native selector. @returns Success. */
  public override PutValue(input: unknown, member: number): boolean {
    if (!(input instanceof Any)) return false;
    const id = member & 0xff & ~CONVERT_TWIPS;
    const flag = boolMembers.get(id);
    if (flag !== undefined) {
      this.values[flag] = any2bool(input);
      return true;
    }
    const value: [number] = [0];
    if (!input.extract(value, "sal_Int32")) return false;
    const field = numberMembers.get(id);
    if (field !== undefined) this.values[field[0]] = value[0] & field[1];
    return true;
  }
}
