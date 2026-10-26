/** @fileoverview Consumed original ICU78.3 propname.cpp uscript_getShortName boundary. The complete script short-name property-alias data is decoded from the pinned native data/API; this immutable table projects that property's packed alias lookup, without claiming other property-name services or native pointer layout. */
import data from "../data/misc/scriptShortNames.json";
import type { UScriptCode } from "./unicode/uscript";
/** Original USCRIPT short-name property value lookup, including null for any undefined signed32 script code. @param scriptCode - Native code. @returns Borrowed invariant alias/null. */
export function uscript_getShortName(scriptCode: UScriptCode): string | null {
  scriptCode |= 0;
  return data.value[scriptCode] ?? null;
}
