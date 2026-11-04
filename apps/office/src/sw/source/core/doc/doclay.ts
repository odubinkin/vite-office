/** @fileoverview Native frame-name allocation from doclay.cxx over the actual special-format collection. The current English resource binding matches existing table/style naming; other native fly-name families remain unported. */
import type { SwDoc } from "./doc";
import { RES_FLYFRMFMT } from "../../../inc/hintids";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { DateTimeToOUString } from "../../../../tools/source/datetime/datetimeutils";
/** Original frame branch of lcl_GetUniqueFlyName, including actual mail-merge state and first unused sorted numeric suffix. @param document - Actual document owner. @returns Original unique frame name in the current English resource environment. */
export function GetUniqueFrameName(document: SwDoc): string {
  const formats = document.GetSpzFrameFormats();
  if (document.IsInMailMerge())
    return (
      "MailMergeFly" +
      DateTimeToOUString(new DateTime(DateTime.SYSTEM)) +
      String(formats.size() + 1)
    );
  const name = "Frame",
    used: number[] = [];
  for (const format of formats) {
    if (format.Which() !== RES_FLYFRMFMT) continue;
    if (format.GetName().startsWith(name)) {
      const number = toInt32(format.GetName().slice(name.length)) - 1;
      if (number >= 0) used.push(number);
    }
  }
  used.sort(
    /** Original unsigned integer ordering. @param first - First source number. @param second - Second source number. @returns Numeric order. */ (
      first,
      second,
    ) => first - second,
  );
  const numbers = [...new Set(used)];
  let number = numbers.length;
  for (let index = 0; index < numbers.length; index++)
    if (numbers[index] !== index) {
      number = index;
      break;
    }
  return name + String(number + 1);
}
