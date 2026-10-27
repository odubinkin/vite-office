/** @fileoverview ICU78.3 signed32 checked arithmetic and consumed UTC platform-clock boundary from putil.cpp. */
/** Original widened addition and output-store-before-overflow comparison. @param a - Signed32 input. @param b - Signed32 input. @param result - Signed32 output. @returns Overflow. */
export function uprv_add32_overflow(a: number, b: number, result: [number]): boolean {
  const wide = (a | 0) + (b | 0);
  result[0] = wide | 0;
  return wide !== result[0];
}
/** Original signed64 product and signed32 output narrowing. @param a - Signed32 input. @param b - Signed32 input. @param result - Signed32 output. @returns Overflow. */
export function uprv_mul32_overflow(a: number, b: number, result: [number]): boolean {
  const wide = BigInt(a | 0) * BigInt(b | 0);
  result[0] = Number(BigInt.asIntN(32, wide));
  return wide !== BigInt(result[0]);
}
/** Original platform UTC clock entrypoint. Date.now supplies the browser OS-clock boundary only; calendar/date parsing never uses host Date arithmetic. Debug fake-time hooks remain unported. @returns UTC milliseconds since 1970. */
export function uprv_getUTCtime(): number {
  return Date.now();
}
