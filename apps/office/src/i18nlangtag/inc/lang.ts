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

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_DUTCH = LanguageType(0x0413);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_DUTCH_BELGIAN = LanguageType(0x0813);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FRENCH = LanguageType(0x040c);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FRENCH_BELGIAN = LanguageType(0x080c);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FRENCH_CANADIAN = LanguageType(0x0c0c);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FRENCH_SWISS = LanguageType(0x100c);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FRENCH_LUXEMBOURG = LanguageType(0x140c);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FRENCH_MONACO = LanguageType(0x180c);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_FINNISH = LanguageType(0x040b);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_ITALIAN = LanguageType(0x0410);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_ITALIAN_SWISS = LanguageType(0x0810);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_DANISH = LanguageType(0x0406);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_NORWEGIAN = LanguageType(0x0014);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_NORWEGIAN_BOKMAL = LanguageType(0x0414);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_NORWEGIAN_NYNORSK = LanguageType(0x0814);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SWEDISH = LanguageType(0x041d);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SWEDISH_FINLAND = LanguageType(0x081d);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_PORTUGUESE = LanguageType(0x0816);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_PORTUGUESE_BRAZILIAN = LanguageType(0x0416);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_MODERN = LanguageType(0x0c0a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_DATED = LanguageType(0x040a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_MEXICAN = LanguageType(0x080a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_GUATEMALA = LanguageType(0x100a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_COSTARICA = LanguageType(0x140a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_PANAMA = LanguageType(0x180a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_DOMINICAN_REPUBLIC = LanguageType(0x1c0a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_VENEZUELA = LanguageType(0x200a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_COLOMBIA = LanguageType(0x240a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_PERU = LanguageType(0x280a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_ARGENTINA = LanguageType(0x2c0a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_ECUADOR = LanguageType(0x300a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_CHILE = LanguageType(0x340a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_URUGUAY = LanguageType(0x380a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_PARAGUAY = LanguageType(0x3c0a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_BOLIVIA = LanguageType(0x400a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_EL_SALVADOR = LanguageType(0x440a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_HONDURAS = LanguageType(0x480a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_NICARAGUA = LanguageType(0x4c0a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_SPANISH_PUERTO_RICO = LanguageType(0x500a);

/** Original lang.h identity consumed by localized number-format keywords. */
export const LANGUAGE_THAI = LanguageType(0x041e);
