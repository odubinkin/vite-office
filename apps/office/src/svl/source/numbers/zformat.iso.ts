/** @fileoverview Original ImpIsIso8601 token-state recognition from zformat.cxx. */
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType as T } from "../../inc/zforlist";
import type { SvNumberformat } from "./zformat";
/** Original bounded subformat query and Y-M-D token-state machine; single-width and two-digit-year native acceptance is retained. @param format - Actual compiled entry. @param index - Source uint16 section. @returns Native ISO flag. */
export function IsIso8601(format: SvNumberformat, index: number): boolean {
  index &= 65535;
  if (index >= 4 || !(format.GetType() & T.DATE)) return false;
  const section = format["NumFor"][index] as NonNullable<(typeof format)["NumFor"][number]>,
    info = section.Info();
  let state = 0,
    iso = false;
  for (let part = 0; part < section.GetCount() && !iso && state !== 5; ++part) {
    switch (info.nTypeArray[part]) {
      case K.YY:
      case K.YYYY:
        state = state === 0 ? 1 : 5;
        break;
      case K.M:
      case K.MM:
        state = state === 2 ? 3 : 5;
        break;
      case K.D:
      case K.DD:
        if (state !== 4) state = 5;
        else iso = true;
        break;
      case S.STRING:
      case S.DATESEP:
        if (info.sStrArray[part]?.getLength() === 1 && info.sStrArray[part]?.charAt(0) === 45)
          state = state === 1 ? 2 : state === 3 ? 4 : 5;
        else state = 5;
        break;
      default:
        state = 5;
    }
  }
  return iso;
}
