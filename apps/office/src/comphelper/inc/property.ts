/** @fileoverview Original PropertyCompareByName declaration from property.hxx. Unconsumed property-copy/attribute/template helper functions are not advertised by this consumed header responsibility. */
import type { PropertyConstReference } from "../../udkapi/com/sun/star/beans/Property";
/** Original strict UTF16 name comparator. */
export class PropertyCompareByName {
  /** Original operator() body. @param first - Borrowed first value. @param second - Borrowed second value. @returns Strict name order. */
  operatorCall(first: PropertyConstReference, second: PropertyConstReference): boolean {
    return first.Name.compareTo(second.Name) < 0;
  }
}
