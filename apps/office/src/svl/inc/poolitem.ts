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

/** Original degree of textual item presentation. */
export enum SfxItemPresentation {
  Nameless,
  Complete,
}

import type { SfxPoolItem } from "../source/items/poolitem";
/** Original nullable static-default predicate. @param item - Actual native item pointer. @returns Source classification, false for null. */
export function IsStaticDefaultItem(item: SfxPoolItem | null): boolean {
  return item !== null && item.isStaticDefault();
}
/** Original nullable pool-dependent default predicate. @param item - Actual native item pointer. @returns Source classification, false for null. */
export function IsDynamicDefaultItem(item: SfxPoolItem | null): boolean {
  return item !== null && item.isDynamicDefault();
}
/** Original static-or-dynamic classification, distinct from a user-default override. @param item - Actual native item pointer. @returns Source classification, false for null. */
export function IsDefaultItem(item: SfxPoolItem | null): boolean {
  return item !== null && (item.isStaticDefault() || item.isDynamicDefault());
}
