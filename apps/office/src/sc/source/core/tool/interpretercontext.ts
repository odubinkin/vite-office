/** @fileoverview Actual nonthreaded document/formatter context forwarding. RNG,token/cache and read-only threaded preparation services remain unported;no substitute formatter or RO policy is installed. */
import type { ScDocument } from "../../../inc/document";
import type { ScInterpreter } from "../inc/interpre";
import type { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import type { OUString, OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Color } from "../../../../tools/inc/color";
import { ScGlobal } from "../../../inc/global";
/** Native context owns the document/formatter bindings;the actual formatter remains borrowed from its pool owner. */
export class ScInterpreterContext {
  pInterpreter: ScInterpreter | null = null;
  /** Retains actual native pointer fields. Threaded PrepForRoMode/currency/cache state is explicitly unrepresented in this nonthreaded slice. @param mpDoc - Actual document. @param mpFormatter - Actual borrowed formatter or native null. @returns Context. */
  constructor(
    readonly mpDoc: ScDocument,
    public mpFormatter: SvNumberFormatter | null,
  ) {}
  /** Original lazy pointer query for the admitted nonthreaded path. No read-only services are fabricated. @returns Actual borrowed formatter. */
  GetFormatTable(): SvNumberFormatter {
    if (ScGlobal.bThreadedGroupCalcInProgress)
      throw Error("Threaded formatter preparation is not implemented");
    this.mpFormatter ??= this.mpDoc.GetFormatTable();
    return this.mpFormatter;
  }
  /** Original numeric/string NFGetOutputString forwards through the actual native formatter on the nonthreaded path. @param value - Native scalar/string overload. @param key - Native format key. @param output - Owned mutable output. @param color - Native color output pointer. @param useStarFormat - Original defaultfalse flag. @returns Nothing. */
  NFGetOutputString(
    value: number | OUStringConstReference,
    key: number,
    output: OUString,
    color: [Color | null],
    useStarFormat = false,
  ): void {
    this.GetFormatTable().GetOutputString(value, key, output, color, useStarFormat);
  }
}
