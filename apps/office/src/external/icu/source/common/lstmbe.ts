/** @fileoverview Original ICU LSTM model discovery for the pinned break resource tree. */
import { CharString } from "./charstr.h";
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { UScriptCode, uscript_getShortName } from "./unicode/uscript";
import { U_FAILURE } from "./unicode/utypes";
import {
  type UResourceBundle,
  ures_close,
  ures_getByKeyWithFallback,
  ures_getStringByKey,
  ures_open,
  ures_openDirect,
} from "./uresbund";

/** Original defaultLSTM script lookup and model bundle open. @param script - ICU script. @param status - Sticky source status. @returns Owning resource handle or null. */
export function openLSTMModel(script: UScriptCode, status: [number]): UResourceBundle | null {
  if (
    script !== UScriptCode.USCRIPT_KHMER &&
    script !== UScriptCode.USCRIPT_LAO &&
    script !== UScriptCode.USCRIPT_MYANMAR &&
    script !== UScriptCode.USCRIPT_THAI
  )
    return null;
  let bundle = ures_open(U_ICUDATA_BRKITR, "", status);
  bundle = ures_getByKeyWithFallback(bundle, "lstm", bundle, status);
  const length: [number] = [0];
  const filename = ures_getStringByKey(
    bundle,
    uscript_getShortName(script) as string,
    length,
    status,
  );
  ures_close(bundle);
  if (U_FAILURE(status[0])) return null;
  const name = new CharString();
  name.appendInvariantChars(filename, length[0], status).truncate(name.lastIndexOf(0x2e));
  return ures_openDirect(
    U_ICUDATA_BRKITR,
    String.fromCharCode(...name.data().subarray(0, name.length())),
    status,
  );
}
