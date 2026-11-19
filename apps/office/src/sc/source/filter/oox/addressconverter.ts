/** @fileoverview Original AddressConverter XML-address, view cursor and API-sequence responsibilities. Workbook overflow tracking and XLSB overloads remain unported. */
import { MAXTAB, ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScRangeList } from "../../../inc/rangelst";
import { ScRangeStringConverter } from "../../../inc/rangeutl";
import { ScUnoConversion } from "../../../inc/convuno";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { Sequence, type SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { cppu_detail_getUnoType_CellRangeAddress as rangeType } from "../../../../offapi/com/sun/star/table/CellRangeAddress";
const Ranges = Sequence.specialize<SequenceElements>(rangeType, 20);
/** Represented native cell/range conversion using the owning document's coordinate limits. */
export const AddressConverter = {
  /** Original reset-before-parse and native OOXML grammar dispatch. Unchecked still inherits parser admission. @param address - Actual output owner. @param source - Native Unicode input. @param sheet - Native signed16 sheet. @param document - Actual Calc document. @returns Parser VALID flag. */
  convertToCellAddressUnchecked(
    address: ScAddress,
    source: OUStringConstReference,
    sheet: number,
    document: ScDocument,
  ): boolean {
    address.SetTab(sheet);
    address.SetRow(0);
    address.SetCol(0);
    if (source.isEmpty()) return false;
    return (
      (address.Parse(
        source,
        document,
        new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_XL_OOX),
      ) &
        ScRefFlags.VALID) ===
      ScRefFlags.VALID
    );
  },
  /** Creates a view address using the worksheet defaults and maximum Calc coordinates, without tracking overflow. @param source - OOXML coordinate. @param sheet - Worksheet index. @param document - Destination workbook. @returns Native address. */
  createValidCellAddress(
    source: OUStringConstReference,
    sheet: number,
    document: ScDocument,
  ): ScAddress {
    const address = new ScAddress();
    if (
      !AddressConverter.convertToCellAddressUnchecked(address, source, sheet, document) ||
      address.Tab() < 0 ||
      address.Tab() > MAXTAB ||
      !document.ValidColRow(address.Col(), address.Row())
    )
      address.Set(
        Math.min(address.Col(), document.MaxCol()),
        Math.min(address.Row(), document.MaxRow()),
        Math.max(0, Math.min(sheet, MAXTAB)),
      );
    return address;
  },
  /** Original sheet assignment and complete-consumption guard over the actual range string converter. @param range - Actual output owner. @param source - Native UTF16 view. @param sheet - Native signed16 sheet. @param document - Actual Calc document. @returns Parsed exactly one complete range. */
  convertToCellRangeUnchecked(
    range: ScRange,
    source: string,
    sheet: number,
    document: ScDocument,
  ): boolean {
    range.aStart.SetTab(sheet);
    range.aEnd.SetTab(sheet);
    if (source.length === 0) return false;
    const offset: [number] = [0];
    const result = ScRangeStringConverter.GetRangeFromString(
      range,
      source,
      document,
      FormulaGrammar.AddressConvention.CONV_XL_OOX,
      offset,
    );
    return result && offset[0] > 0 && offset[0] >>> 0 === source.length;
  },
  /** Original ordered typed Sequence construction and FillApiRange, without validation, sorting or deduplication. @param ranges - Actual native list. @returns Owned published UNO sequence. */
  toApiSequence(ranges: ScRangeList): Sequence<SequenceElements> {
    const size = ranges.size(),
      sequence = new Ranges(size);
    try {
      const output = sequence.getArray() as SequenceElements;
      for (let index = 0; index < size; ++index)
        ScUnoConversion.FillApiRange(output.get(index * 20) as SequenceElements, ranges.at(index));
      return sequence;
    } catch (error) {
      sequence.dispose();
      throw error;
    }
  },
};
