/** @fileoverview Original FormulaGrammar address-convention enum; remaining grammar operations belong to this shared owner. */
export const FormulaGrammar = {
  AddressConvention: {
    CONV_UNSPECIFIED: -1,
    CONV_OOO: 0,
    CONV_ODF: 1,
    CONV_XL_A1: 2,
    CONV_XL_R1C1: 3,
    CONV_XL_OOX: 4,
    CONV_LOTUS_A1: 5,
    CONV_LAST: 6,
    CONV_A1_XL_A1: 7,
  } as const,
} as const;
/** Original enum values for initialized address conventions. */
export type AddressConvention =
  (typeof FormulaGrammar.AddressConvention)[keyof typeof FormulaGrammar.AddressConvention];
