/** @fileoverview Browser binding for the original host locale-ID query. Intl supplies a semantic language tag; ICU source normalization owns its interpretation. POSIX environment/category/charset behavior is not represented by the browser. */
let captured: string | null = null;
/** Original once-captured platform ID boundary using the actual browser locale. No independent POSIX default or invented fallback is supplied. Host API failure and native platform equivalence remain uncertified. @returns Semantic host ID. */
export function uprv_getDefaultLocaleID(): string {
  if (captured === null) captured = Intl.DateTimeFormat().resolvedOptions().locale;
  return captured;
}
