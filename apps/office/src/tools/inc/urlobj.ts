/** @fileoverview Native URI filesystem, escape and character-admission declarations from tools/urlobj.hxx. */
/** Original filesystem detection bits. */
export enum FSysStyle {
  Vos = 1,
  Unix = 2,
  Dos = 4,
  Detect = 7,
}
/** Original input escape interpretation. */
export enum EncodeMechanism {
  All,
  WasEncoded,
  NotCanonical,
}
/** Original URI presentation modes. */
export enum DecodeMechanism {
  NONE,
  ToIUri,
  WithCharset,
  Unambiguous,
}
/** Original getUTF32 escape classification. */
export enum EscapeType {
  NONE,
  Octet,
  Utf32,
}
/** Original character-admission masks. */
export enum Part {
  PART_USER_PASSWORD = 0x00001,
  PART_FPATH = 0x00008,
  PART_AUTHORITY = 0x00010,
  PART_REL_SEGMENT_EXTRA = 0x00020,
  PART_URIC = 0x00040,
  PART_HTTP_PATH = 0x00080,
  PART_MESSAGE_ID_PATH = 0x00100,
  PART_MAILTO = 0x00200,
  PART_PATH_BEFORE_QUERY = 0x00400,
  PART_PCHAR = 0x00800,
  PART_VISIBLE = 0x01000,
  PART_VISIBLE_NONSPECIAL = 0x02000,
  PART_UNO_PARAM_VALUE = 0x04000,
  PART_UNAMBIGUOUS = 0x08000,
  PART_URIC_NO_SLASH = 0x10000,
  PART_HTTP_QUERY = 0x20000,
}
