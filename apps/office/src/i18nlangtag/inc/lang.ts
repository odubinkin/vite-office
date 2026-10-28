/** @fileoverview Original lang.h unsigned16 LanguageType and required language identities. A native JS number/coercion replaces the C++ strong_int compiler tag, with no object/lifetime layer; the wider locale table is not fabricated. */
/** Erased native unsigned16 strong integer value. */
export type LanguageType = number;
/** Original explicit unsigned16 value construction. @param value - Integral native source. @returns Language ID. */
export function LanguageType(value: number): LanguageType {
  return value & 0xffff;
}
/** Original primary-language mask. */
export const LANGUAGE_MASK_PRIMARY = 0x03ff;
/** Original primary-language extraction. @param value - Language ID. @returns Primary ID. */
export function primary(value: LanguageType): LanguageType {
  return value & LANGUAGE_MASK_PRIMARY;
}
/** Original unknown ID, equal to the primary mask. */
export const LANGUAGE_DONTKNOW = LanguageType(0x03ff);
/** Original no-language ID. */
export const LANGUAGE_NONE = LanguageType(0x00ff);
/** Original human-interface-device ID. */
export const LANGUAGE_HID_HUMAN_INTERFACE_DEVICE = LanguageType(0x04ff);
/** Original application/system selection ID. */
export const LANGUAGE_SYSTEM = LanguageType(0x0000);
/** Original invariant locale ID; declared but explicitly unsupported by native locale tables. */
export const LANGUAGE_INVARIANT = LanguageType(0x007f);
/** Original German ID used by SvxLanguageItem factory. */
export const LANGUAGE_GERMAN = LanguageType(0x0407);
/** Original German regional language IDs used by number-format keyword localization. */
export const LANGUAGE_GERMAN_SWISS = LanguageType(0x0807);
export const LANGUAGE_GERMAN_AUSTRIAN = LanguageType(0x0c07);
export const LANGUAGE_GERMAN_LUXEMBOURG = LanguageType(0x1007);
export const LANGUAGE_GERMAN_LIECHTENSTEIN = LanguageType(0x1407);

/** Original US English fallback/fast-path identity. */
export const LANGUAGE_ENGLISH_US = LanguageType(0x0409);
/** Original Saudi Arabic identity consumed by EditEngine's complex-script defaults. */
export const LANGUAGE_ARABIC_SAUDI_ARABIA = LanguageType(0x0401);

/** Original process/user preferred-language alias. */
export const LANGUAGE_PROCESS_OR_USER_DEFAULT = LanguageType(0x0400);
/** Original system-default language alias. */
export const LANGUAGE_SYSTEM_DEFAULT = LanguageType(0x0800);

/** Original simplified Chinese language identity used by Word numbering export. */
export const LANGUAGE_CHINESE_SIMPLIFIED = LanguageType(0x0804);
