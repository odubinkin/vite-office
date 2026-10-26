/** @fileoverview Original best-Windows-charset query over the pinned ImplTextEncodingData metadata. Full locale table metadata is bound without simulating converter functions or shared-library loading. */
import charsets from "./windows-charsets.json" with { type: "json" };
import type { rtl_TextEncoding } from "../inc/rtl/textenc";
const data: Readonly<Record<number, number>> = charsets;
/** Native metadata query returns charset1 when no encoding data exists. @param encoding - Original unsigned16 identifier. @returns Windows charset byte. */
export function rtl_getBestWindowsCharsetFromTextEncoding(encoding: rtl_TextEncoding): number {
  return data[encoding & 0xffff] ?? 1;
}
