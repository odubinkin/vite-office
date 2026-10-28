/** @fileoverview Consumed ICU cstring.h uprv_strtol base-ten binding on the pinned long64 platform. End pointer, C whitespace/sign, no-conversion position and saturation are retained; other bases and errno/ABI are outside this binding. */
/** Original decimal strtol long64 result before callers narrow to int32. @param text - Narrow C input. @param end - Mutable end-pointer offset. @param _base - Original consumed literal base10. @returns Saturated signed64 value. */
export function uprv_strtol(text: string, end: [number], _base: 10): bigint {
  void _base;
  let p = 0;
  while (p < text.length && " \t\n\v\f\r".includes(text[p] as string)) ++p;
  let negative = false;
  if (text[p] === "-" || text[p] === "+") {
    negative = text[p] === "-";
    ++p;
  }
  const first = p;
  let value = 0n;
  while (p < text.length && (text[p] as string) >= "0" && (text[p] as string) <= "9") {
    value = value * 10n + BigInt(text.charCodeAt(p) - 48);
    ++p;
  }
  if (p === first) {
    end[0] = 0;
    return 0n;
  }
  if (negative) value = -value;
  const min = -(1n << 63n),
    max = (1n << 63n) - 1n;
  end[0] = p;
  return value < min ? min : value > max ? max : value;
}
