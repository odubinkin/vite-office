/** @fileoverview Original URI enum and C declaration boundary from rtl/uri.h. */
/** Original rtl_UriCharClass declaration. */
export enum rtl_UriCharClass {
  rtl_UriCharClassNone,

  rtl_UriCharClassUric,

  rtl_UriCharClassUricNoSlash,

  rtl_UriCharClassRelSegment,

  rtl_UriCharClassRegName,

  rtl_UriCharClassUserinfo,

  rtl_UriCharClassPchar,

  rtl_UriCharClassUnoParamValue,

  rtl_UriCharClass_FORCE_EQUAL_SIZE = 0x7fffffff,
}
/** Original rtl_UriEncodeMechanism declaration. */
export enum rtl_UriEncodeMechanism {
  rtl_UriEncodeIgnoreEscapes,

  rtl_UriEncodeKeepEscapes,

  rtl_UriEncodeCheckEscapes,

  rtl_UriEncodeStrict,

  rtl_UriEncodeStrictKeepEscapes,

  rtl_UriEncode_FORCE_EQUAL_SIZE = 0x7fffffff,
}
/** Original rtl_UriDecodeMechanism declaration. */
export enum rtl_UriDecodeMechanism {
  rtl_UriDecodeNone,

  rtl_UriDecodeToIuri,

  rtl_UriDecodeWithCharset,

  rtl_UriDecodeStrict,

  rtl_UriDecode_FORCE_EQUAL_SIZE = 0x7fffffff,
}
export { rtl_getUriCharClass, rtl_uriEncode, rtl_uriDecode } from "../../rtl/uri";
export { rtl_uriConvertRelToAbs } from "../../rtl/uri-relative";
