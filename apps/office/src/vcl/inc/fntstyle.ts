/** @fileoverview Original font relief and kerning flags. */
/** Native FontRelief values and enum-size sentinel. */
export enum FontRelief {
  NONE = 0,
  Embossed = 1,
  Engraved = 2,
  FontRelief_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original independent font-specific and Asian kerning flags. */
export enum FontKerning {
  NONE = 0x00,
  FontSpecific = 0x01,
  Asian = 0x02,
}
