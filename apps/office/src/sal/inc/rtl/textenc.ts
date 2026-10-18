/** @fileoverview Original rtl/textenc.h numeric encoding declarations, without an encoding library, native allocation or conversion engine. */
/** Original sal_uInt16 encoding identifier; valid values are preserved as ordinary JS numbers. */
export type rtl_TextEncoding = number;
/** Original RTL_TEXTENCODING_DONTKNOW declaration. */
export const RTL_TEXTENCODING_DONTKNOW: rtl_TextEncoding = 0;
/** Original RTL_TEXTENCODING_MS_1252 declaration. */
export const RTL_TEXTENCODING_MS_1252: rtl_TextEncoding = 1;
/** Original RTL_TEXTENCODING_APPLE_ROMAN declaration. */
export const RTL_TEXTENCODING_APPLE_ROMAN: rtl_TextEncoding = 2;
/** Original RTL_TEXTENCODING_IBM_437 declaration. */
export const RTL_TEXTENCODING_IBM_437: rtl_TextEncoding = 3;
/** Original RTL_TEXTENCODING_IBM_850 declaration. */
export const RTL_TEXTENCODING_IBM_850: rtl_TextEncoding = 4;
/** Original RTL_TEXTENCODING_IBM_860 declaration. */
export const RTL_TEXTENCODING_IBM_860: rtl_TextEncoding = 5;
/** Original RTL_TEXTENCODING_IBM_861 declaration. */
export const RTL_TEXTENCODING_IBM_861: rtl_TextEncoding = 6;
/** Original RTL_TEXTENCODING_IBM_863 declaration. */
export const RTL_TEXTENCODING_IBM_863: rtl_TextEncoding = 7;
/** Original RTL_TEXTENCODING_IBM_865 declaration. */
export const RTL_TEXTENCODING_IBM_865: rtl_TextEncoding = 8;
/** Original RTL_TEXTENCODING_SYMBOL declaration. */
export const RTL_TEXTENCODING_SYMBOL: rtl_TextEncoding = 10;
/** Original RTL_TEXTENCODING_ASCII_US declaration. */
export const RTL_TEXTENCODING_ASCII_US: rtl_TextEncoding = 11;
/** Original RTL_TEXTENCODING_ISO_8859_1 declaration. */
export const RTL_TEXTENCODING_ISO_8859_1: rtl_TextEncoding = 12;
/** Original RTL_TEXTENCODING_ISO_8859_2 declaration. */
export const RTL_TEXTENCODING_ISO_8859_2: rtl_TextEncoding = 13;
/** Original RTL_TEXTENCODING_ISO_8859_3 declaration. */
export const RTL_TEXTENCODING_ISO_8859_3: rtl_TextEncoding = 14;
/** Original RTL_TEXTENCODING_ISO_8859_4 declaration. */
export const RTL_TEXTENCODING_ISO_8859_4: rtl_TextEncoding = 15;
/** Original RTL_TEXTENCODING_ISO_8859_5 declaration. */
export const RTL_TEXTENCODING_ISO_8859_5: rtl_TextEncoding = 16;
/** Original RTL_TEXTENCODING_ISO_8859_6 declaration. */
export const RTL_TEXTENCODING_ISO_8859_6: rtl_TextEncoding = 17;
/** Original RTL_TEXTENCODING_ISO_8859_7 declaration. */
export const RTL_TEXTENCODING_ISO_8859_7: rtl_TextEncoding = 18;
/** Original RTL_TEXTENCODING_ISO_8859_8 declaration. */
export const RTL_TEXTENCODING_ISO_8859_8: rtl_TextEncoding = 19;
/** Original RTL_TEXTENCODING_ISO_8859_9 declaration. */
export const RTL_TEXTENCODING_ISO_8859_9: rtl_TextEncoding = 20;
/** Original RTL_TEXTENCODING_ISO_8859_14 declaration. */
export const RTL_TEXTENCODING_ISO_8859_14: rtl_TextEncoding = 21;
/** Original RTL_TEXTENCODING_ISO_8859_15 declaration. */
export const RTL_TEXTENCODING_ISO_8859_15: rtl_TextEncoding = 22;
/** Original RTL_TEXTENCODING_IBM_737 declaration. */
export const RTL_TEXTENCODING_IBM_737: rtl_TextEncoding = 23;
/** Original RTL_TEXTENCODING_IBM_775 declaration. */
export const RTL_TEXTENCODING_IBM_775: rtl_TextEncoding = 24;
/** Original RTL_TEXTENCODING_IBM_852 declaration. */
export const RTL_TEXTENCODING_IBM_852: rtl_TextEncoding = 25;
/** Original RTL_TEXTENCODING_IBM_855 declaration. */
export const RTL_TEXTENCODING_IBM_855: rtl_TextEncoding = 26;
/** Original RTL_TEXTENCODING_IBM_857 declaration. */
export const RTL_TEXTENCODING_IBM_857: rtl_TextEncoding = 27;
/** Original RTL_TEXTENCODING_IBM_862 declaration. */
export const RTL_TEXTENCODING_IBM_862: rtl_TextEncoding = 28;
/** Original RTL_TEXTENCODING_IBM_864 declaration. */
export const RTL_TEXTENCODING_IBM_864: rtl_TextEncoding = 29;
/** Original RTL_TEXTENCODING_IBM_866 declaration. */
export const RTL_TEXTENCODING_IBM_866: rtl_TextEncoding = 30;
/** Original RTL_TEXTENCODING_IBM_869 declaration. */
export const RTL_TEXTENCODING_IBM_869: rtl_TextEncoding = 31;
/** Original RTL_TEXTENCODING_MS_874 declaration. */
export const RTL_TEXTENCODING_MS_874: rtl_TextEncoding = 32;
/** Original RTL_TEXTENCODING_MS_1250 declaration. */
export const RTL_TEXTENCODING_MS_1250: rtl_TextEncoding = 33;
/** Original RTL_TEXTENCODING_MS_1251 declaration. */
export const RTL_TEXTENCODING_MS_1251: rtl_TextEncoding = 34;
/** Original RTL_TEXTENCODING_MS_1253 declaration. */
export const RTL_TEXTENCODING_MS_1253: rtl_TextEncoding = 35;
/** Original RTL_TEXTENCODING_MS_1254 declaration. */
export const RTL_TEXTENCODING_MS_1254: rtl_TextEncoding = 36;
/** Original RTL_TEXTENCODING_MS_1255 declaration. */
export const RTL_TEXTENCODING_MS_1255: rtl_TextEncoding = 37;
/** Original RTL_TEXTENCODING_MS_1256 declaration. */
export const RTL_TEXTENCODING_MS_1256: rtl_TextEncoding = 38;
/** Original RTL_TEXTENCODING_MS_1257 declaration. */
export const RTL_TEXTENCODING_MS_1257: rtl_TextEncoding = 39;
/** Original RTL_TEXTENCODING_MS_1258 declaration. */
export const RTL_TEXTENCODING_MS_1258: rtl_TextEncoding = 40;
/** Original RTL_TEXTENCODING_APPLE_ARABIC declaration. */
export const RTL_TEXTENCODING_APPLE_ARABIC: rtl_TextEncoding = 41;
/** Original RTL_TEXTENCODING_APPLE_CENTEURO declaration. */
export const RTL_TEXTENCODING_APPLE_CENTEURO: rtl_TextEncoding = 42;
/** Original RTL_TEXTENCODING_APPLE_CROATIAN declaration. */
export const RTL_TEXTENCODING_APPLE_CROATIAN: rtl_TextEncoding = 43;
/** Original RTL_TEXTENCODING_APPLE_CYRILLIC declaration. */
export const RTL_TEXTENCODING_APPLE_CYRILLIC: rtl_TextEncoding = 44;
/** Original RTL_TEXTENCODING_APPLE_DEVANAGARI declaration. */
export const RTL_TEXTENCODING_APPLE_DEVANAGARI: rtl_TextEncoding = 45;
/** Original RTL_TEXTENCODING_APPLE_FARSI declaration. */
export const RTL_TEXTENCODING_APPLE_FARSI: rtl_TextEncoding = 46;
/** Original RTL_TEXTENCODING_APPLE_GREEK declaration. */
export const RTL_TEXTENCODING_APPLE_GREEK: rtl_TextEncoding = 47;
/** Original RTL_TEXTENCODING_APPLE_GUJARATI declaration. */
export const RTL_TEXTENCODING_APPLE_GUJARATI: rtl_TextEncoding = 48;
/** Original RTL_TEXTENCODING_APPLE_GURMUKHI declaration. */
export const RTL_TEXTENCODING_APPLE_GURMUKHI: rtl_TextEncoding = 49;
/** Original RTL_TEXTENCODING_APPLE_HEBREW declaration. */
export const RTL_TEXTENCODING_APPLE_HEBREW: rtl_TextEncoding = 50;
/** Original RTL_TEXTENCODING_APPLE_ICELAND declaration. */
export const RTL_TEXTENCODING_APPLE_ICELAND: rtl_TextEncoding = 51;
/** Original RTL_TEXTENCODING_APPLE_ROMANIAN declaration. */
export const RTL_TEXTENCODING_APPLE_ROMANIAN: rtl_TextEncoding = 52;
/** Original RTL_TEXTENCODING_APPLE_THAI declaration. */
export const RTL_TEXTENCODING_APPLE_THAI: rtl_TextEncoding = 53;
/** Original RTL_TEXTENCODING_APPLE_TURKISH declaration. */
export const RTL_TEXTENCODING_APPLE_TURKISH: rtl_TextEncoding = 54;
/** Original RTL_TEXTENCODING_APPLE_UKRAINIAN declaration. */
export const RTL_TEXTENCODING_APPLE_UKRAINIAN: rtl_TextEncoding = 55;
/** Original RTL_TEXTENCODING_APPLE_CHINSIMP declaration. */
export const RTL_TEXTENCODING_APPLE_CHINSIMP: rtl_TextEncoding = 56;
/** Original RTL_TEXTENCODING_APPLE_CHINTRAD declaration. */
export const RTL_TEXTENCODING_APPLE_CHINTRAD: rtl_TextEncoding = 57;
/** Original RTL_TEXTENCODING_APPLE_JAPANESE declaration. */
export const RTL_TEXTENCODING_APPLE_JAPANESE: rtl_TextEncoding = 58;
/** Original RTL_TEXTENCODING_APPLE_KOREAN declaration. */
export const RTL_TEXTENCODING_APPLE_KOREAN: rtl_TextEncoding = 59;
/** Original RTL_TEXTENCODING_MS_932 declaration. */
export const RTL_TEXTENCODING_MS_932: rtl_TextEncoding = 60;
/** Original RTL_TEXTENCODING_MS_936 declaration. */
export const RTL_TEXTENCODING_MS_936: rtl_TextEncoding = 61;
/** Original RTL_TEXTENCODING_MS_949 declaration. */
export const RTL_TEXTENCODING_MS_949: rtl_TextEncoding = 62;
/** Original RTL_TEXTENCODING_MS_950 declaration. */
export const RTL_TEXTENCODING_MS_950: rtl_TextEncoding = 63;
/** Original RTL_TEXTENCODING_SHIFT_JIS declaration. */
export const RTL_TEXTENCODING_SHIFT_JIS: rtl_TextEncoding = 64;
/** Original RTL_TEXTENCODING_GB_2312 declaration. */
export const RTL_TEXTENCODING_GB_2312: rtl_TextEncoding = 65;
/** Original RTL_TEXTENCODING_GBT_12345 declaration. */
export const RTL_TEXTENCODING_GBT_12345: rtl_TextEncoding = 66;
/** Original RTL_TEXTENCODING_GBK declaration. */
export const RTL_TEXTENCODING_GBK: rtl_TextEncoding = 67;
/** Original RTL_TEXTENCODING_BIG5 declaration. */
export const RTL_TEXTENCODING_BIG5: rtl_TextEncoding = 68;
/** Original RTL_TEXTENCODING_EUC_JP declaration. */
export const RTL_TEXTENCODING_EUC_JP: rtl_TextEncoding = 69;
/** Original RTL_TEXTENCODING_EUC_CN declaration. */
export const RTL_TEXTENCODING_EUC_CN: rtl_TextEncoding = 70;
/** Original RTL_TEXTENCODING_EUC_TW declaration. */
export const RTL_TEXTENCODING_EUC_TW: rtl_TextEncoding = 71;
/** Original RTL_TEXTENCODING_ISO_2022_JP declaration. */
export const RTL_TEXTENCODING_ISO_2022_JP: rtl_TextEncoding = 72;
/** Original RTL_TEXTENCODING_ISO_2022_CN declaration. */
export const RTL_TEXTENCODING_ISO_2022_CN: rtl_TextEncoding = 73;
/** Original RTL_TEXTENCODING_KOI8_R declaration. */
export const RTL_TEXTENCODING_KOI8_R: rtl_TextEncoding = 74;
/** Original RTL_TEXTENCODING_UTF7 declaration. */
export const RTL_TEXTENCODING_UTF7: rtl_TextEncoding = 75;
/** Original RTL_TEXTENCODING_UTF8 declaration. */
export const RTL_TEXTENCODING_UTF8: rtl_TextEncoding = 76;
/** Original RTL_TEXTENCODING_ISO_8859_10 declaration. */
export const RTL_TEXTENCODING_ISO_8859_10: rtl_TextEncoding = 77;
/** Original RTL_TEXTENCODING_ISO_8859_13 declaration. */
export const RTL_TEXTENCODING_ISO_8859_13: rtl_TextEncoding = 78;
/** Original RTL_TEXTENCODING_EUC_KR declaration. */
export const RTL_TEXTENCODING_EUC_KR: rtl_TextEncoding = 79;
/** Original RTL_TEXTENCODING_ISO_2022_KR declaration. */
export const RTL_TEXTENCODING_ISO_2022_KR: rtl_TextEncoding = 80;
/** Original RTL_TEXTENCODING_JIS_X_0201 declaration. */
export const RTL_TEXTENCODING_JIS_X_0201: rtl_TextEncoding = 81;
/** Original RTL_TEXTENCODING_JIS_X_0208 declaration. */
export const RTL_TEXTENCODING_JIS_X_0208: rtl_TextEncoding = 82;
/** Original RTL_TEXTENCODING_JIS_X_0212 declaration. */
export const RTL_TEXTENCODING_JIS_X_0212: rtl_TextEncoding = 83;
/** Original RTL_TEXTENCODING_MS_1361 declaration. */
export const RTL_TEXTENCODING_MS_1361: rtl_TextEncoding = 84;
/** Original RTL_TEXTENCODING_GB_18030 declaration. */
export const RTL_TEXTENCODING_GB_18030: rtl_TextEncoding = 85;
/** Original RTL_TEXTENCODING_BIG5_HKSCS declaration. */
export const RTL_TEXTENCODING_BIG5_HKSCS: rtl_TextEncoding = 86;
/** Original RTL_TEXTENCODING_TIS_620 declaration. */
export const RTL_TEXTENCODING_TIS_620: rtl_TextEncoding = 87;
/** Original RTL_TEXTENCODING_KOI8_U declaration. */
export const RTL_TEXTENCODING_KOI8_U: rtl_TextEncoding = 88;
/** Original RTL_TEXTENCODING_ISCII_DEVANAGARI declaration. */
export const RTL_TEXTENCODING_ISCII_DEVANAGARI: rtl_TextEncoding = 89;
/** Original RTL_TEXTENCODING_JAVA_UTF8 declaration. */
export const RTL_TEXTENCODING_JAVA_UTF8: rtl_TextEncoding = 90;
/** Original RTL_TEXTENCODING_ADOBE_STANDARD declaration. */
export const RTL_TEXTENCODING_ADOBE_STANDARD: rtl_TextEncoding = 91;
/** Original RTL_TEXTENCODING_ADOBE_SYMBOL declaration. */
export const RTL_TEXTENCODING_ADOBE_SYMBOL: rtl_TextEncoding = 92;
/** Original RTL_TEXTENCODING_PT154 declaration. */
export const RTL_TEXTENCODING_PT154: rtl_TextEncoding = 93;
/** Original RTL_TEXTENCODING_ADOBE_DINGBATS declaration. */
export const RTL_TEXTENCODING_ADOBE_DINGBATS: rtl_TextEncoding = 94;
/** Original RTL_TEXTENCODING_KAMENICKY declaration. */
export const RTL_TEXTENCODING_KAMENICKY: rtl_TextEncoding = 95;
/** Original RTL_TEXTENCODING_MAZOVIA declaration. */
export const RTL_TEXTENCODING_MAZOVIA: rtl_TextEncoding = 96;
/** Original RTL_TEXTENCODING_USER_START declaration. */
export const RTL_TEXTENCODING_USER_START: rtl_TextEncoding = 0x8000;
/** Original RTL_TEXTENCODING_USER_DETECTED declaration. */
export const RTL_TEXTENCODING_USER_DETECTED: rtl_TextEncoding = RTL_TEXTENCODING_USER_START + 0;
/** Original RTL_TEXTENCODING_USER_END declaration. */
export const RTL_TEXTENCODING_USER_END: rtl_TextEncoding = 0xefff;
/** Original RTL_TEXTENCODING_UCS4 declaration. */
export const RTL_TEXTENCODING_UCS4: rtl_TextEncoding = 0xfffe;
/** Original RTL_TEXTENCODING_UCS2 declaration. */
export const RTL_TEXTENCODING_UCS2: rtl_TextEncoding = 0xffff;
/** Original RTL_TEXTENCODING_UNICODE declaration. */
export const RTL_TEXTENCODING_UNICODE: rtl_TextEncoding = RTL_TEXTENCODING_UCS2;
