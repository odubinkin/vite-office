/** @fileoverview Original SvxLanguageItem initialized value/copy/int Any behavior. Native LanguageTag locale conversion and SvtLanguageTable presentation remain unported; no fake Locale or Intl mapping. The MSVC-only intermediate base and native instance manager are erased under JS primitives/GC. */
import { SfxEnumItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { LanguageType, LANGUAGE_GERMAN } from "../../../i18nlangtag/inc/lang";
import { MID_LANG_INT, MID_LANG_LOCALE } from "../../inc/memberids";
/** Original language pooled value, directly inheriting the logical enum base. */
export class SvxLanguageItem extends SfxEnumItem<LanguageType> {
  /** Original language/Which and implicit-copy constructors. @param args - Selected original form. @returns Language item. */
  constructor(
    ...args: [language: LanguageType, which: number] | [source: Readonly<SvxLanguageItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], LanguageType(args[0]));
  }
  /** Original factory selects German and Which0, independently of Calc defaults. @returns Default item. */
  public static CreateDefault(): SvxLanguageItem {
    return new SvxLanguageItem(LANGUAGE_GERMAN, 0);
  }
  /** Original independent copy clone. @param pool - Unused pool argument. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxLanguageItem {
    void pool;
    return new SvxLanguageItem(this);
  }
  /** Original LanguageType enum getter. @returns Unsigned16 language. */
  public GetLanguage(): LanguageType {
    return this.GetValue();
  }
  /** Original LanguageType argument conversion before enum assignment. @param value - Language value. @returns Nothing. */
  public override SetValue(value: LanguageType): void {
    super.SetValue(LanguageType(value));
  }
  /** Existing unwrapped enum value boundary, with no native struct claim. @returns Language ID. */
  public override QueryValue(): LanguageType;
  /** Original integer Any query. Real LanguageTag-dependent locale member is explicitly unsupported. @param output - Actual Any. @param member - Native member. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original int16 projection and unknown-member untouched success. @param output - Optional actual Any. @param member - Native unsigned8 selector. @returns Scalar value or success. */
  public override QueryValue(output?: Any, member = 0): LanguageType | boolean {
    if (output === undefined) return this.GetLanguage();
    switch (member & 0xff & ~0x80) {
      case MID_LANG_INT:
        output.insert([(this.GetLanguage() << 16) >> 16], "sal_Int16");
        break;
      case MID_LANG_LOCALE:
        return false;
    }
    return true;
  }
  /** Original int32 extraction followed by unsigned16 LanguageType construction. Locale conversion is explicitly unsupported until the real provider exists. @param input - Actual Any or established scalar binding. @param member - Native member. @returns Success. */
  public override PutValue(input: unknown, member: number): boolean {
    switch (member & 0xff & ~0x80) {
      case MID_LANG_INT: {
        const value: [number] = [0];
        if (input instanceof Any) {
          if (!input.extract(value, "sal_Int32")) return false;
        } else {
          if (
            typeof input !== "number" ||
            !Number.isInteger(input) ||
            input < -2147483648 ||
            input > 2147483647
          )
            return false;
          value[0] = input;
        }
        this.SetValue(LanguageType(value[0]));
        break;
      }
      case MID_LANG_LOCALE:
        return false;
    }
    return true;
  }
}
