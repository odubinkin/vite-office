/** @fileoverview Original number-format scanner's standard-name extraction responsibility;full symbol/type/final scanning and scanner service ownership remain separate unported responsibilities. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Original lcl_extractStandardGeneralName pointer walk,including malformed/nested modifier behavior and the first unbracketed semicolon terminator. No regular-expression normalization or synthetic parsed format is introduced. @param code - Actual locale format-code value. @returns Owned standard name. */
export function extractStandardGeneralName(code: OUStringConstReference): OUString {
  let position = 0,
    begin = 0,
    modifier = false,
    done = false;
  const units = code.getStr();
  while (position < code.getLength() && !done) {
    switch (units[position]) {
      case 91:
        modifier = true;
        break;
      case 93:
        if (modifier) {
          modifier = false;
          begin = position + 1;
        }
        break;
      case 59:
        if (!modifier) {
          done = true;
          --position;
        }
        break;
    }
    ++position;
    if (modifier) begin = position;
  }
  return begin < position
    ? new OUString(units.subarray(begin, position), position - begin)
    : new OUString();
}
