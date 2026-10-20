/** @fileoverview Original SvxNumRule/NodeNum and pooled rule value ownership from numitem.cxx/hxx. Stream serialization,number-string providers,graphic unlinking and UNO rule wrappers remain unported. */
import {
  SvxNumberFormat,
  type ConstSvxNumberFormat,
  type SvxNumPositionAndSpaceMode,
} from "./numitem";
import { SvxNumRuleFlags, SvxNumRuleType } from "../../inc/numitem";
import { SVX_MAX_NUM } from "../../inc/numdef";
import { SvxNumType } from "../../inc/svxenum";
import { toTwips, Length } from "../../../o3tl/inc/unit_conversion";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";

let standardNumberFormat: SvxNumberFormat | undefined;
let standardOutlineFormat: SvxNumberFormat | undefined;

/** Original ten-slot rule value. Native reference-counted static default cleanup is erased under GC;no renderer or numbering service is simulated. */
export class SvxNumRule {
  private readonly aFmts: (SvxNumberFormat | null)[] = Array<SvxNumberFormat | null>(
    SVX_MAX_NUM,
  ).fill(null);
  private readonly aFmtsSet: boolean[] = Array<boolean>(SVX_MAX_NUM).fill(false);
  private nLevelCount: number;
  private nFeatureFlags: SvxNumRuleFlags;
  private eNumberingType: SvxNumRuleType;
  private bContinuousNumbering: boolean;
  /** Original feature/level constructor and implicit value-copy constructor. @param args - Original constructor form. @returns Rule. */
  constructor(
    ...args:
      | [
          features: SvxNumRuleFlags,
          levels: number,
          continuous: boolean,
          type?: SvxNumRuleType,
          mode?: SvxNumPositionAndSpaceMode,
        ]
      | [source: SvxNumRule]
  ) {
    const first = args[0];
    if (typeof first !== "number") {
      this.nLevelCount = first.nLevelCount;
      this.nFeatureFlags = first.nFeatureFlags;
      this.eNumberingType = first.eNumberingType;
      this.bContinuousNumbering = first.bContinuousNumbering;
      this.copyLevels(first);
      return;
    }
    this.nLevelCount = args[1] & 0xffff;
    this.nFeatureFlags = first & 0xffff;
    this.bContinuousNumbering = args[2];
    this.eNumberingType = ((args[3] ?? SvxNumRuleType.NUMBERING) & 0xff) as SvxNumRuleType;
    const mode = args[4] ?? "label-width-and-position";
    for (let i = 0; i < SVX_MAX_NUM; i++) {
      if (i >= this.nLevelCount) continue;
      const format = new SvxNumberFormat(SvxNumType.SVX_NUM_CHARS_UPPER_LETTER);
      this.aFmts[i] = format;
      if ((first & SvxNumRuleFlags.CONTINUOUS) !== 0) {
        if (mode === "label-width-and-position") {
          format.SetAbsLSpace(Number(toTwips(BigInt(500 * (i + 1)), Length.mm100)));
          format.SetFirstLineOffset(Number(toTwips(-500n, Length.mm100)));
        } else if (mode === "label-alignment") {
          format.SetPositionAndSpaceMode("label-alignment");
          format.SetLabelFollowedBy("listtab");
          const indentAt = toTwips(0.25, Length.in);
          format.SetListtabPos(indentAt * (i + 2));
          format.SetFirstLineIndent(toTwips(-0.25, Length.in));
          format.SetIndentAt(indentAt * (i + 2));
        }
      } else format.SetAbsLSpace(800 * i);
    }
  }
  /** Original deep copy of all ten slots,including slots outside the active count. @param source - Native value. @returns Nothing. */
  private copyLevels(source: SvxNumRule): void {
    for (let i = 0; i < SVX_MAX_NUM; i++) {
      const format = source.aFmts[i] as SvxNumberFormat | null;
      this.aFmts[i] = format === null ? null : new SvxNumberFormat(format);
      this.aFmtsSet[i] = source.aFmtsSet[i] as boolean;
    }
  }
  /** Original copy assignment,with self-assignment guard. @param source - Const source. @returns Recipient. */
  Assign(source: SvxNumRule): this {
    if (source !== this) {
      this.nLevelCount = source.nLevelCount;
      this.nFeatureFlags = source.nFeatureFlags;
      this.eNumberingType = source.eNumberingType;
      this.bContinuousNumbering = source.bContinuousNumbering;
      this.copyLevels(source);
    }
    return this;
  }
  /** Original comparison only visits the declared active level count. @param source - Const source. @returns Equality. */
  Equals(source: SvxNumRule): boolean {
    if (
      this.nLevelCount !== source.nLevelCount ||
      this.nFeatureFlags !== source.nFeatureFlags ||
      this.eNumberingType !== source.eNumberingType ||
      this.bContinuousNumbering !== source.bContinuousNumbering
    )
      return false;
    for (let i = 0; i < this.nLevelCount; i++) {
      const left = this.aFmts[i] as SvxNumberFormat | null,
        right = source.aFmts[i] as SvxNumberFormat | null;
      if (
        this.aFmtsSet[i] !== source.aFmtsSet[i] ||
        (left === null ? right !== null : right === null || !left.Equals(right))
      )
        return false;
    }
    return true;
  }
  /** Original valid-level pointer lookup;debug assertions do not change release fallback. @param level - Unsigned16 index. @returns Borrowed const format or null. */
  Get(level: number): ConstSvxNumberFormat | null {
    level &= 0xffff;
    return level < SVX_MAX_NUM && this.aFmtsSet[level]
      ? (this.aFmts[level] as SvxNumberFormat | null)
      : null;
  }
  /** Original physical format lookup ignores validity flags and lazily initializes both shared fallback values. @param level - Unsigned16 index. @returns Borrowed const value. */
  GetLevel(level: number): ConstSvxNumberFormat {
    if (standardNumberFormat === undefined) {
      standardNumberFormat = new SvxNumberFormat(SvxNumType.SVX_NUM_ARABIC);
      standardOutlineFormat = new SvxNumberFormat(SvxNumType.SVX_NUM_NUMBER_NONE);
    }
    level &= 0xffff;
    return level < SVX_MAX_NUM && this.aFmts[level] !== null
      ? (this.aFmts[level] as SvxNumberFormat)
      : this.eNumberingType === SvxNumRuleType.NUMBERING
        ? standardNumberFormat
        : (standardOutlineFormat as SvxNumberFormat);
  }
  /** Original const-reference overload;equal already-valid formats leave the validity flag unchanged. @param level - Unsigned16 index. @param format - Actual const format. @param valid - Original default true. @returns Nothing. */
  SetLevel(level: number, format: ConstSvxNumberFormat, valid = true): void {
    level &= 0xffff;
    if (level >= SVX_MAX_NUM) return;
    let replace = !this.aFmtsSet[level];
    if (!replace) {
      const previous = this.Get(level);
      // Native operator!= on a const SvxNumberFormat reference is nonvirtual;
      // actual Writer subclasses must not dispatch their registration comparison.
      replace = previous === null || !SvxNumberFormat.prototype.Equals.call(format, previous);
    }
    if (replace) {
      this.aFmts[level] = new SvxNumberFormat(format);
      this.aFmtsSet[level] = valid;
    }
  }
  /** Explicit JS binding for the original pointer overload,whose flag-before-reference-call ordering differs from SetLevel. @param level - Unsigned16 index. @param format - Native nullable pointer. @returns Nothing. */
  SetLevelPointer(level: number, format: ConstSvxNumberFormat | null): void {
    level &= 0xffff;
    if (level < SVX_MAX_NUM) {
      this.aFmtsSet[level] = format !== null;
      if (format !== null) this.SetLevel(level, format);
      else this.aFmts[level] = null;
    }
  }
  /** Original sequential-numbering flag. @returns Stored value. */
  IsContinuousNumbering(): boolean {
    return this.bContinuousNumbering;
  }
  /** Original independent flag setter. @param value - New value. @returns Nothing. */
  SetContinuousNumbering(value: boolean): void {
    this.bContinuousNumbering = value;
  }
  /** Original unsigned16 level count. @returns Stored value. */
  GetLevelCount(): number {
    return this.nLevelCount;
  }
  /** Original feature intersection predicate. @param feature - Feature mask. @returns Any intersection. */
  IsFeatureSupported(feature: SvxNumRuleFlags): boolean {
    return (this.nFeatureFlags & feature) !== 0;
  }
  /** Original stored feature flags. @returns Flags. */
  GetFeatureFlags(): SvxNumRuleFlags {
    return this.nFeatureFlags;
  }
  /** Original set/clear of enum bits. @param flag - Feature mask. @param set - Original true default. @returns Nothing. */
  SetFeatureFlag(flag: SvxNumRuleFlags, set = true): void {
    this.nFeatureFlags = (set ? this.nFeatureFlags | flag : this.nFeatureFlags & ~flag) & 0xffff;
  }
  /** Original unsigned8 numbering kind. @returns Kind. */
  GetNumRuleType(): SvxNumRuleType {
    return this.eNumberingType;
  }
}

/** Original fixed ten-value node-number aggregate. */
export class SvxNodeNum {
  private readonly nLevelVal = new Uint16Array(SVX_MAX_NUM);
  private nMyLevel = 0;
  /** Original default and implicit aggregate copy construction. @param source - Optional actual const source. @returns Value. */
  constructor(source?: Readonly<SvxNodeNum>) {
    if (source !== undefined) {
      this.nMyLevel = source.GetLevel();
      this.nLevelVal.set(source.GetLevelVal());
    }
  }
  /** Original current unsigned8 level. @returns Level. */
  GetLevel(): number {
    return this.nMyLevel;
  }
  /** Original unsigned8 assignment. @param level - Native input. @returns Nothing. */
  SetLevel(level: number): void {
    this.nMyLevel = level & 0xff;
  }
  /** Original mutable/const array reference. @returns Actual fixed storage. */
  GetLevelVal(): Uint16Array {
    return this.nLevelVal;
  }
  /** Original assignment with independent array storage. @param source - Native source. @returns Recipient. */
  Assign(source: Readonly<SvxNodeNum>): this {
    if (source !== this) {
      this.nMyLevel = source.GetLevel();
      this.nLevelVal.set(source.GetLevelVal());
    }
    return this;
  }
}

/** Original Sfx pooled numbering-rule value;actual UNO rule wrapper remains unported. */
export class SvxNumBulletItem extends SfxPoolItem {
  private readonly maNumRule: SvxNumRule;
  /** Original rule/Which and implicit-copy constructors;native rvalue syntax is erased into the same owned value. @param source - Actual rule or copy source. @param which - Native default SID_ATTR_NUMBERING_RULE10855. @returns Item. */
  constructor(source: SvxNumRule | Readonly<SvxNumBulletItem>, which = 10855) {
    super(source instanceof SvxNumRule ? which : source.Which());
    this.maNumRule = new SvxNumRule(source instanceof SvxNumRule ? source : source.GetNumRule());
  }
  /** Original mutable/const member reference. @returns Actual rule. */
  GetNumRule(): SvxNumRule {
    return this.maNumRule;
  }
  /** Original same-type/payload comparison;Which is outside base equality. @param other - Actual pool value. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return other instanceof SvxNumBulletItem && this.maNumRule.Equals(other.maNumRule);
  }
  /** Original concrete owned copy. @param pool - Unused native pool. @returns Clone. */
  override Clone(pool?: SfxItemPool): SvxNumBulletItem {
    void pool;
    return new SvxNumBulletItem(this);
  }
}

/** Original type/count adaptation materializes overlapping physical levels as valid;new trailing levels retain constructor defaults. @param source - Actual source rule. @param levels - Original unsigned16 destination count. @param type - Destination rule kind. @returns Independent native rule. */
export function SvxConvertNumRule(
  source: SvxNumRule,
  levels: number,
  type: SvxNumRuleType,
): SvxNumRule {
  levels &= 0xffff;
  const sourceLevels = source.GetLevelCount();
  const result = new SvxNumRule(
    source.GetFeatureFlags(),
    levels,
    source.IsContinuousNumbering(),
    type,
  );
  for (let level = 0; level < levels && level < sourceLevels; ++level)
    result.SetLevel(level, source.GetLevel(level));
  return result;
}
