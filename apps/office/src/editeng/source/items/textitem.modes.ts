/** @fileoverview Original case-map/script-hint/optical-size pooled values from textitem.cxx; localized presentation and actual script/case engines are unported. */
import { SfxEnumItem, SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { SvxCaseMap } from "../../inc/svxenum";
import { ScriptHintType } from "../../../i18nutil/inc/scriptchangescanner";
import * as CaseMap from "../../../offapi/com/sun/star/style/CaseMap";
import { MID_SCRIPTHINT } from "../../inc/memberids";

/** Original case formatting mode, not a text-conversion engine. */
export class SvxCaseMapItem extends SfxEnumItem<SvxCaseMap> {
  /** Original mode/Which and implicit-copy constructors. @param args - Selected original form. @returns Item. */
  public constructor(
    ...args: [mode: SvxCaseMap, which: number] | [source: Readonly<SvxCaseMapItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original NotMapped/Which0 default factory. @returns Item. */
  public static CreateDefault(): SvxCaseMapItem {
    return new SvxCaseMapItem(SvxCaseMap.NotMapped, 0);
  }
  /** Original independent concrete copy. @param pool - Unused pool. @returns Copied item. */
  public override Clone(pool?: SfxItemPool): SvxCaseMapItem {
    void pool;
    return new SvxCaseMapItem(this);
  }
  /** Original full enum getter. @returns Stored mode. */
  public GetCaseMap(): SvxCaseMap {
    return this.GetValue();
  }
  /** Existing inherited scalar enum boundary. @returns Narrowed enum value. */
  public override QueryValue(): number;
  /** Original IDL short member query, selector ignored. @param output - Actual Any. @param member - Ignored selector. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original explicit mapping, with NONE for every other stored mode. @param output - Optional actual Any. @param member - Ignored selector. @returns Success or scalar. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    void member;
    if (output === undefined) return this.GetEnumValue();
    let value = CaseMap.NONE;
    switch (this.GetValue()) {
      case SvxCaseMap.Uppercase:
        value = CaseMap.UPPERCASE;
        break;
      case SvxCaseMap.Lowercase:
        value = CaseMap.LOWERCASE;
        break;
      case SvxCaseMap.Capitalize:
        value = CaseMap.TITLE;
        break;
      case SvxCaseMap.SmallCaps:
        value = CaseMap.SMALLCAPS;
        break;
    }
    output.insert([value], "sal_Int16");
    return true;
  }
  /** Original unsigned16 extraction and explicit admitted IDL mapping, selector ignored. @param input - Actual Any. @param member - Ignored selector. @returns Success with no mutation on failure. */
  public override PutValue(input: unknown, member: number): boolean {
    void member;
    const value: [number] = [0];
    if (!(input instanceof Any) || !input.extract(value, "sal_uInt16")) return false;
    let mode: SvxCaseMap;
    switch (value[0]) {
      case CaseMap.NONE:
        mode = SvxCaseMap.NotMapped;
        break;
      case CaseMap.UPPERCASE:
        mode = SvxCaseMap.Uppercase;
        break;
      case CaseMap.LOWERCASE:
        mode = SvxCaseMap.Lowercase;
        break;
      case CaseMap.TITLE:
        mode = SvxCaseMap.Capitalize;
        break;
      case CaseMap.SMALLCAPS:
        mode = SvxCaseMap.SmallCaps;
        break;
      default:
        return false;
    }
    this.SetValue(mode);
    return true;
  }
}

/** Original fixed-unsigned16 script classification hint, without a scanner service. */
export class SvxScriptHintItem extends SfxEnumItem<ScriptHintType> {
  /** Original Which-only Automatic, type/Which and implicit-copy forms. @param args - Original arguments. @returns Item. */
  public constructor(
    ...args:
      | [which: number]
      | [type: ScriptHintType, which: number]
      | [source: Readonly<SvxScriptHintItem>]
  ) {
    if (args.length === 2) super(args[1], (args[0] & 0xffff) as ScriptHintType);
    else if (typeof args[0] === "number") super(args[0], ScriptHintType.Automatic);
    else super(args[0]);
  }
  /** Original enum argument conversion to the fixed unsigned16 underlying type. @param value - Hint value. @returns Nothing. */
  public override SetValue(value: ScriptHintType): void {
    super.SetValue((value & 0xffff) as ScriptHintType);
  }
  /** Original independent copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxScriptHintItem {
    void pool;
    return new SvxScriptHintItem(this);
  }
  /** Existing inherited enum scalar boundary. @returns Unsigned16 hint. */
  public override QueryValue(): number;
  /** Original typed unsigned16 query. @param output - Actual Any. @param member - Native selector. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original byte selector/twips mask and unknown untouched success. @param output - Optional actual Any. @param member - Native selector. @returns Success or scalar. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    if (output === undefined) return this.GetEnumValue();
    if ((member & 0xff & ~CONVERT_TWIPS) === MID_SCRIPTHINT)
      output.insert([this.GetValue()], "sal_uInt16");
    return true;
  }
  /** Original unsigned16 extraction without declared-enum range validation. @param input - Actual Any. @param member - Native selector. @returns Success or unchanged numeric extraction failure. */
  public override PutValue(input: unknown, member: number): boolean {
    if ((member & 0xff & ~CONVERT_TWIPS) === MID_SCRIPTHINT) {
      const value: [number] = [0];
      if (!(input instanceof Any) || !input.extract(value, "sal_uInt16")) return false;
      this.SetValue(value[0] as ScriptHintType);
    }
    return true;
  }
}

/** Original optical-sizing bool attribute; no invented native factory or font-axis engine. */
export class SvxOpticalSizingItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy constructors. @param args - Original arguments. @returns Item. */
  public constructor(
    ...args: [enabled: boolean, which: number] | [source: Readonly<SvxOpticalSizingItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original independent concrete copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxOpticalSizingItem {
    void pool;
    return new SvxOpticalSizingItem(this);
  }
}
