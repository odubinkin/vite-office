/** @fileoverview Executes the actual INetURLObject host state machine against original native UTF16/range observations. */
import { parseHost } from "../tools/source/fsys/urlobj.host";
/** Encodes actual parser output without normalization. @param value - Canonical host. @returns Original native transport. */
function hex(value: string): string {
  let result = "";
  for (let index = 0; index < value.length; ++index)
    result += value.charCodeAt(index).toString(16).padStart(4, "0");
  return result || "-";
}
/** Invokes the original parser with valid bounded pointer-range inputs; no state is injected. @param query - Original input transport. @returns Success/cursor/output observation. */
export function observeUrlHost(query: string): string {
  const [word, begin, end] = query.split(" ");
  let text = "";
  if (word !== "-")
    for (let index = 0; index < (word as string).length; index += 4)
      text += String.fromCharCode(Number.parseInt((word as string).slice(index, index + 4), 16));
  const cursor = { text, index: Number(begin), end: Number(end) },
    result = parseHost(cursor);
  return [Number(result !== null), cursor.index, result === null ? "-" : hex(result)].join(" ");
}
