/** @fileoverview Original include/rtl/locale.h locale record and C API boundary. */
import type { rtl_uString } from "./ustring.h";

/** Registered locale; fields are borrowed from the realm's original locale table. */
export interface rtl_Locale {
  /** Original language string. */
  Language: rtl_uString;
  /** Original country string. */
  Country: rtl_uString;
  /** Original variant string. */
  Variant: rtl_uString;
  /** Original XOR of the three signed32 string hashes. */
  HashCode: number;
}

export {
  rtl_locale_register,
  rtl_locale_getDefault,
  rtl_locale_setDefault,
  rtl_locale_getLanguage,
  rtl_locale_getCountry,
  rtl_locale_getVariant,
  rtl_locale_hashCode,
  rtl_locale_equals,
} from "../../rtl/locale";
