/** @fileoverview Original inline coordinate conversion, intersection and containment from convuno.hxx; locale/language methods in convuno.cxx remain unported. */
import { ScAddress, ScRange } from "./address";
import type { CellAddress } from "../../offapi/com/sun/star/table/CellAddress";
import type { CellRangeAddress } from "../../offapi/com/sun/star/table/CellRangeAddress";
import type { SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
/** Existing compound pointer binding also admits actual Sequence<CellAddress> element lvalues. */
type AddressReference = CellAddress | SequenceElements;
/** Existing compound pointer binding also admits actual Sequence<CellRangeAddress> element lvalues. */
type RangeReference = CellRangeAddress | SequenceElements;
/** Reads one original scalar member through its real compound address. @param value - Initialized native struct reference. @param offset - Original member offset. @returns Scalar. */
function field(value: AddressReference | RangeReference, offset: number): number {
  return (value.get(offset) as [number])[0];
}
/** Original static-only conversion members; ESM qualification erases class lookup without inventing a constructed helper owner. */
export const ScUnoConversion = {
  /** Original casts to signed16 column/sheet and signed32 row; no dimension validation. @param address - Native output. @param api - Actual IDL value or compound lvalue. @returns Nothing. */
  FillScAddress(address: ScAddress, api: AddressReference): void {
    address.Set(field(api, 4), field(api, 8), field(api, 0));
  },
  /** Original field assignment order, retaining independent native widths. @param api - Actual output value or compound lvalue. @param address - Native source. @returns Nothing. */
  FillApiAddress(api: AddressReference, address: ScAddress): void {
    (api.get(4) as [number])[0] = address.Col();
    (api.get(8) as [number])[0] = address.Row();
    (api.get(0) as [number])[0] = address.Tab();
  },
  /** Original both endpoints receive the same API sheet without sorting coordinates. @param range - Native output. @param api - Actual IDL value or compound lvalue. @returns Nothing. */
  FillScRange(range: ScRange, api: RangeReference): void {
    range.aStart.Set(field(api, 4), field(api, 8), field(api, 0));
    range.aEnd.Set(field(api, 12), field(api, 16), field(api, 0));
  },
  /** Original API range takes only the start sheet, including for a native 3D range. @param api - Actual output value or compound lvalue. @param range - Native source. @returns Nothing. */
  FillApiRange(api: RangeReference, range: ScRange): void {
    (api.get(4) as [number])[0] = range.aStart.Col();
    (api.get(8) as [number])[0] = range.aStart.Row();
    (api.get(0) as [number])[0] = range.aStart.Tab();
    (api.get(12) as [number])[0] = range.aEnd.Col();
    (api.get(16) as [number])[0] = range.aEnd.Row();
  },
  /** Original inclusive intersection, without normalizing reversed endpoints. @param first - First API range. @param second - Second API range. @returns Any common cell. */
  Intersects(first: RangeReference, second: RangeReference): boolean {
    return (
      field(first, 0) === field(second, 0) &&
      Math.max(field(first, 4), field(second, 4)) <=
        Math.min(field(first, 12), field(second, 12)) &&
      Math.max(field(first, 8), field(second, 8)) <= Math.min(field(first, 16), field(second, 16))
    );
  },
  /** Original inclusive containment compares stored coordinates literally. @param outer - Containing API range. @param inner - Candidate API range. @returns Containment. */
  Contains(outer: RangeReference, inner: RangeReference): boolean {
    return (
      field(outer, 0) === field(inner, 0) &&
      field(outer, 4) <= field(inner, 4) &&
      field(inner, 12) <= field(outer, 12) &&
      field(outer, 8) <= field(inner, 8) &&
      field(inner, 16) <= field(outer, 16)
    );
  },
};
