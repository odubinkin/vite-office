/** @fileoverview Original shared FormulaGrammar static operations from grammar.hxx/grammar.cxx using native JS signed32 bit operations. */
import { FormulaLanguage } from "../../../../offapi/com/sun/star/sheet/FormulaLanguage";
const AddressConvention = {
  CONV_UNSPECIFIED: -1,
  CONV_OOO: 0,
  CONV_ODF: 1,
  CONV_XL_A1: 2,
  CONV_XL_R1C1: 3,
  CONV_XL_OOX: 4,
  CONV_LOTUS_A1: 5,
  CONV_LAST: 6,
  CONV_A1_XL_A1: 7,
} as const;
const kConventionOffset = -AddressConvention.CONV_UNSPECIFIED + 1;
const kConventionShift = 16;
const kEnglishBit = 1 << (kConventionShift + 8);
const kFlagMask = ~((~0 >>> 0) << kConventionShift);
const Grammar = {
  GRAM_UNSPECIFIED: -1,
  GRAM_ODFF:
    FormulaLanguage.ODFF |
    ((AddressConvention.CONV_ODF + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_PODF:
    FormulaLanguage.ODF_11 |
    ((AddressConvention.CONV_ODF + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_ENGLISH:
    FormulaLanguage.ENGLISH |
    ((AddressConvention.CONV_OOO + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_NATIVE:
    FormulaLanguage.NATIVE | ((AddressConvention.CONV_OOO + kConventionOffset) << kConventionShift),
  GRAM_ODFF_UI:
    FormulaLanguage.ODFF |
    ((AddressConvention.CONV_UNSPECIFIED + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_ODFF_A1:
    FormulaLanguage.ODFF |
    ((AddressConvention.CONV_OOO + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_PODF_UI:
    FormulaLanguage.ODF_11 |
    ((AddressConvention.CONV_UNSPECIFIED + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_PODF_A1:
    FormulaLanguage.ODF_11 |
    ((AddressConvention.CONV_OOO + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_NATIVE_UI:
    FormulaLanguage.NATIVE |
    ((AddressConvention.CONV_UNSPECIFIED + kConventionOffset) << kConventionShift),
  GRAM_NATIVE_ODF:
    FormulaLanguage.NATIVE | ((AddressConvention.CONV_ODF + kConventionOffset) << kConventionShift),
  GRAM_NATIVE_XL_A1:
    FormulaLanguage.NATIVE |
    ((AddressConvention.CONV_XL_A1 + kConventionOffset) << kConventionShift),
  GRAM_NATIVE_XL_R1C1:
    FormulaLanguage.NATIVE |
    ((AddressConvention.CONV_XL_R1C1 + kConventionOffset) << kConventionShift),
  GRAM_ENGLISH_XL_A1:
    FormulaLanguage.XL_ENGLISH |
    ((AddressConvention.CONV_XL_A1 + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_ENGLISH_XL_R1C1:
    FormulaLanguage.XL_ENGLISH |
    ((AddressConvention.CONV_XL_R1C1 + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_ENGLISH_XL_OOX:
    FormulaLanguage.XL_ENGLISH |
    ((AddressConvention.CONV_XL_OOX + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_OOXML:
    FormulaLanguage.OOXML |
    ((AddressConvention.CONV_XL_OOX + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_API:
    FormulaLanguage.API |
    ((AddressConvention.CONV_OOO + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_DEFAULT:
    FormulaLanguage.NATIVE |
    ((AddressConvention.CONV_UNSPECIFIED + kConventionOffset) << kConventionShift),
  GRAM_STORAGE_DEFAULT:
    FormulaLanguage.ODFF |
    ((AddressConvention.CONV_ODF + kConventionOffset) << kConventionShift) |
    kEnglishBit,
  GRAM_EXTERNAL: 1 << (kConventionShift - 1),
} as const;
/** Original initialized packed grammar value, without native enum ABI emulation. */
export type Grammar = number;
/** Original named address-convention inputs; extraction returns the original signed decoded number. */
export type AddressConvention = (typeof AddressConvention)[keyof typeof AddressConvention];
/** Original static class namespace, retaining the header/core owner boundary and release assertion behavior. */
export const FormulaGrammar = {
  AddressConvention,
  Grammar,
  kConventionOffset,
  kConventionShift,
  kEnglishBit,
  kFlagMask,
  /** Original English flag query. @param grammar - Packed grammar. @returns Flag. */
  isEnglish(grammar: Grammar): boolean {
    return (grammar & kEnglishBit) !== 0;
  },
  /** Original compatibility API mapping. @param english - English flag. @param xml - XML flag. @returns Original grammar. */
  mapAPItoGrammar(english: boolean, xml: boolean): Grammar {
    if (english && xml) return Grammar.GRAM_PODF;
    else if (english && !xml) return Grammar.GRAM_API;
    else if (!english && xml) return Grammar.GRAM_NATIVE_ODF;
    return Grammar.GRAM_NATIVE;
  },
  /** Original named grammar support and external language exception. @param grammar - Packed grammar. @returns Supported flag. */
  isSupported(grammar: Grammar): boolean {
    switch (grammar | 0) {
      case Grammar.GRAM_ODFF:
      case Grammar.GRAM_PODF:
      case Grammar.GRAM_ENGLISH:
      case Grammar.GRAM_NATIVE:
      case Grammar.GRAM_ODFF_UI:
      case Grammar.GRAM_ODFF_A1:
      case Grammar.GRAM_PODF_UI:
      case Grammar.GRAM_PODF_A1:
      case Grammar.GRAM_NATIVE_UI:
      case Grammar.GRAM_NATIVE_ODF:
      case Grammar.GRAM_NATIVE_XL_A1:
      case Grammar.GRAM_NATIVE_XL_R1C1:
      case Grammar.GRAM_ENGLISH_XL_A1:
      case Grammar.GRAM_ENGLISH_XL_R1C1:
      case Grammar.GRAM_ENGLISH_XL_OOX:
      case Grammar.GRAM_OOXML:
      case Grammar.GRAM_API:
        return true;
      default:
        return FormulaGrammar.extractFormulaLanguage(grammar) === Grammar.GRAM_EXTERNAL;
    }
  },
  /** Original language mask. @param grammar - Packed grammar. @returns Language bits. */
  extractFormulaLanguage(grammar: Grammar): number {
    return grammar & kFlagMask;
  },
  /** Original signed convention decode; native invalid enum casts are not certified. @param grammar - Packed grammar. @returns Signed convention number. */
  extractRefConvention(grammar: Grammar): number {
    return ((grammar & ~kEnglishBit) >> kConventionShift) - kConventionOffset;
  },
  /** Original English flag update preserves all other bits. @param grammar - Packed grammar. @param english - Desired flag. @returns Updated grammar. */
  setEnglishBit(grammar: Grammar, english: boolean): Grammar {
    if (english) return grammar | kEnglishBit;
    return grammar & ~kEnglishBit;
  },
  /** Original convention merge preserves language and English flag; release does not execute the native support assertion. @param grammar - Input grammar. @param convention - Original address convention. @returns Merged grammar. */
  mergeToGrammar(grammar: Grammar, convention: AddressConvention): Grammar {
    const english = FormulaGrammar.isEnglish(grammar);
    const merged =
      FormulaGrammar.extractFormulaLanguage(grammar) |
      ((convention + kConventionOffset) << kConventionShift);
    return FormulaGrammar.setEnglishBit(merged, english);
  },
  /** Original ODF1.1 language query. @param grammar - Packed grammar. @returns Flag. */
  isPODF(grammar: Grammar): boolean {
    return FormulaGrammar.extractFormulaLanguage(grammar) === FormulaLanguage.ODF_11;
  },
  /** Original OpenFormula language query. @param grammar - Packed grammar. @returns Flag. */
  isODFF(grammar: Grammar): boolean {
    return FormulaGrammar.extractFormulaLanguage(grammar) === FormulaLanguage.ODFF;
  },
  /** Original OOXML language query. @param grammar - Packed grammar. @returns Flag. */
  isOOXML(grammar: Grammar): boolean {
    return FormulaGrammar.extractFormulaLanguage(grammar) === FormulaLanguage.OOXML;
  },
  /** Original OOXML reference convention query is independent of language. @param grammar - Packed grammar. @returns Flag. */
  isRefConventionOOXML(grammar: Grammar): boolean {
    return FormulaGrammar.extractRefConvention(grammar) === AddressConvention.CONV_XL_OOX;
  },
  /** Original Excel syntax classification by address convention. @param grammar - Packed grammar. @returns Flag. */
  isExcelSyntax(grammar: Grammar): boolean {
    switch (FormulaGrammar.extractRefConvention(grammar)) {
      case AddressConvention.CONV_XL_A1:
      case AddressConvention.CONV_XL_R1C1:
      case AddressConvention.CONV_XL_OOX:
        return true;
      default:
        return false;
    }
  },
} as const;
