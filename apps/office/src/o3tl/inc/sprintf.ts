/** @fileoverview Original o3tl::sprintf char-buffer wrapper's consumed %.f binding for finite integral doubles. */
/** Binds snprintf(buffer,N,"%.f",value) for the integral double supplied by original fraction output, then applies the source assertion. Exact binary64 integers use their exact decimal digits; negative zero retains the C printf sign. Broader printf formats/nonintegral input are unconsumed. @param buffer - Actual fixed char buffer. @param value - Finite integral double. @returns C snprintf's required character count. */
export function sprintfIntegral(buffer: Uint8Array, value: number): number {
  const digits = Object.is(value, -0) ? "-0" : BigInt(value).toString(10),
    count = digits.length;
  if (buffer.length > 0) {
    const written = Math.min(count, buffer.length - 1);
    for (let index = 0; index < written; ++index) buffer[index] = digits.charCodeAt(index);
    buffer[written] = 0;
  }
  if (!(count < buffer.length)) throw new Error("assert(n < 0 || o3tl::make_unsigned(n) < N)");
  return count;
}
