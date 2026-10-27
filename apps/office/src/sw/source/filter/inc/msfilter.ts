/** @fileoverview Original sw::util::CharRunEntry and CharRuns declarations from msfilter.hxx; unrelated filter declarations remain unported. */
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
/** Native mutable value record, with one end offset rather than a browser text-run DTO. */
export class CharRunEntry {
  /** Original field constructor. @param mnEndPos - Signed32 UTF16 end. @param mnScript - Native script ID. @param meCharSet - Encoding ID. @param mbRTL - Original direction flag. @returns Run value. */
  constructor(
    public mnEndPos: number,
    public mnScript: number,
    public meCharSet: rtl_TextEncoding,
    public mbRTL: boolean,
  ) {
    this.mnEndPos |= 0;
    this.mnScript &= 0xffff;
    this.meCharSet &= 0xffff;
  }
}
/** Original std::vector value-result binding; native allocator/refcounts are not simulated. */
export type CharRuns = CharRunEntry[];
