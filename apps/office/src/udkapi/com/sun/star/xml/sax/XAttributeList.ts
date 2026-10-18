/** @fileoverview Original XAttributeList IDL method contract; TypeScript borrowing erases UNO reference/ABI machinery. */
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Actual SAX attribute-list surface. */
export interface XAttributeList {
  /** Original signed16 count. @returns Count. */ getLength(): number;
  /** Original by-value name. @param index - Position. @returns Name. */ getNameByIndex(
    index: number,
  ): OUString;
  /** Original type query. @param index - Position. @returns Type. */ getTypeByIndex(
    index: number,
  ): OUString;
  /** Original named type query. @param name - Name. @returns Type. */ getTypeByName(
    name: OUStringConstReference,
  ): OUString;
  /** Original by-value data. @param index - Position. @returns Data. */ getValueByIndex(
    index: number,
  ): OUString;
  /** Original named data query. @param name - Name. @returns Data or empty value. */ getValueByName(
    name: OUStringConstReference,
  ): OUString;
}
