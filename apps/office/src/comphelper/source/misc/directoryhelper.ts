/** @fileoverview Original DirectoryHelper splitAtLastToken over a borrowed UTF16 string_view and an actual OUString output owner; filesystem operations are unported. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_uString_newFromStr_WithLength } from "../../../sal/inc/rtl/ustring.h";
/** Original reverse token search, including unchanged output at leading/trailing token boundaries. Returned units borrow source storage; callers retain its owner. @param source - Native nonowning UTF16 view. @param token - Original sal_Unicode unit. @param right - Existing native output string. @returns Borrowed left view, possibly empty. */
export function splitAtLastToken(source: Uint16Array, token: number, right: OUString): Uint16Array {
  const index = source.lastIndexOf(token);
  let result = source.subarray(0, 0);
  if (index === -1) {
    result = source;
    right.clear();
  } else if (index > 0) {
    result = source.subarray(0, index);
    if (source.length > index + 1) {
      const suffix = source.subarray(index + 1);
      rtl_uString_newFromStr_WithLength(right.getDataAddress(), suffix, suffix.length);
    }
  }
  return result;
}
