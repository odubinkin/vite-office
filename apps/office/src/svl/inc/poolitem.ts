/** @fileoverview Original poolitem.hxx header boundary for actual shared pool owner and represented member conversion flag. */

import { Any } from "../../cppu/inc/com/sun/star/uno/Any";

export { SfxPoolItem } from "../source/items/poolitem";

/** Original UNO member measurement-conversion bit; individual item owners decide whether to convert or ignore it. */
export const CONVERT_TWIPS = 0x80;

/** Original Any2Bool bool-then-signed32 extraction and false fallback, with explicit existing browser scalar transport. @param input - Actual Any or browser scalar. @returns Bool value. */
export function Any2Bool(input: unknown): boolean {
  if (input instanceof Any) {
    const value: [boolean] = [false];
    if (input.extract(value, "bool")) return value[0];
    const number: [number] = [0];
    if (input.extract(number, "sal_Int32")) return number[0] !== 0;
    return false;
  }
  if (typeof input === "boolean") return input;
  return (
    typeof input === "number" &&
    Number.isInteger(input) &&
    input >= -2147483648 &&
    input <= 2147483647 &&
    input !== 0
  );
}
