/** @fileoverview Original Tools twip-to-mm100 template helper delegating to the actual common o3tl owner; other header helpers remain pending. */
import { convert, Length } from "../../o3tl/inc/unit_conversion";
/** Original integral helper. @param n - Native integer. @returns Rounded mm100. */
export function convertTwipToMm100(n: bigint): bigint;
/** Original floating helper. @param n - Native floating value. @returns Floating mm100. */
export function convertTwipToMm100(n: number): number;
/** Native template identity is erased only at the delegated call, without changing the scalar. @param n - Original scalar. @returns Converted value. */
export function convertTwipToMm100(n: number | bigint): number | bigint {
  return convert(n as bigint, Length.twip, Length.mm100);
}
