/** @fileoverview Original Hebrew and Cyrillic numeral producers from nativenumbersupplier.cxx; source limits, punctuation, prefix scanning and suffix retention are preserved. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { SeparatorChar, isNumber } from "./nativenumbersupplier.text";
import data from "./data/numberchar.json" with { type: "json" };
/** Original sal_Unicode append overload. @param output - Real buffer. @param ch - Code unit. @returns Nothing. */
function append(output: OUStringBuffer, ch: number): void {
  output.append(Uint16Array.of(ch));
}
/** Original makeHebrewNumber recursion and special 15/16 substitutions. @param value - Native signed64 number. @param output - Mutable buffer. @param last - Last group flag. @param geresh - Original mode2 flag. @returns Nothing. */
function makeHebrewNumber(
  value: bigint,
  output: OUStringBuffer,
  last: boolean,
  geresh: boolean,
): void {
  let num = Number(value % 1000n);
  if (value > 1000n) {
    makeHebrewNumber(value / 1000n, output, num !== 0, geresh);
    append(output, 32);
  }
  if (num === 0) {
    output.append(
      Uint16Array.from(
        value === 1000n
          ? [0x5d0, 0x5dc, 0x5e3]
          : last
            ? [0x5d0, 0x5dc, 0x5e4, 0x5d9, 0x5dd]
            : [0x5d0, 0x5dc, 0x5e4, 0x5d9],
      ),
    );
  } else {
    let count = 0;
    for (let j = 0; num > 0 && j < data.hebrew.length; j++) {
      if (num - (data.hebrew[j]?.[1] as number) >= 0) {
        count++;
        if (num === 15 || num === 16) j++;
        num -= data.hebrew[j]?.[1] as number;
        append(output, data.hebrew[j]?.[0] as number);
      }
    }
    if (geresh) {
      if (count > 1) output.insertChar(output.getLength() - 1, 0x5f4);
      else if (count === 1) append(output, 0x5f3);
    }
  }
}
/** Original makeCyrillicNumber grouping, teens and titlo insertion. @param value - Native signed64 number. @param output - Real buffer. @param titlo - Original titlo flag. @returns Nothing. */
function makeCyrillicNumber(value: bigint, output: OUStringBuffer, titlo: boolean): void {
  let num = Number(value % 1000n);
  if (value >= 1000n) {
    append(output, 0x482);
    makeCyrillicNumber(value / 1000n, output, false);
    if (value >= 10000n && (value - 10000n) % 1000n !== 0n) append(output, 32);
    if (value % 1000n === 0n) titlo = false;
  }
  for (let j = 0; num > 0 && j < data.cyrillic.length; j++) {
    if (num < 20 && num > 10) {
      num -= 10;
      makeCyrillicNumber(BigInt(num), output, false);
      append(output, 0x456);
      break;
    }
    if ((data.cyrillic[j]?.[1] as number) <= num) {
      append(output, data.cyrillic[j]?.[0] as number);
      num -= data.cyrillic[j]?.[1] as number;
    }
  }
  if (!titlo) return;
  if (output.getLength() === 1) append(output, 0x483);
  else if (output.getLength() === 2) {
    if (value > 800n && value < 900n) append(output, 0x483);
    else output.insertChar(1, 0x483);
  } else if (output.getLength() > 2) {
    if (output.indexOf(32) === output.getLength() - 2) append(output, 0x483);
    else output.insertChar(output.getLength() - 1, 0x483);
  }
}
/** Original shared prefix collection of the two source producers, retaining their distinct digit count limits and signed64 defined arithmetic domain; native signed overflow is not assigned wrap or saturation semantics. @param input - Original number/suffix. @param hebrew - Hebrew path. @param geresh - Hebrew mode2 flag. @returns Owned result. */
function alphabetic(input: OUStringConstReference, hebrew: boolean, geresh: boolean): OUString {
  const src = input.getStr(),
    len = input.getLength();
  let value = 0n,
    i = 0,
    count = 0;
  for (; i < len; i++) {
    const ch = src[i] as number;
    if (isNumber(ch)) {
      if (++count >= (hebrew ? 20 : 8)) return new OUString(input);
      value = value * 10n + BigInt(ch - 48);
    } else if (ch === SeparatorChar[0] && count > 0) continue;
    else if (ch === 45 && count === 0) continue;
    else break;
  }
  if (value <= 0n) return new OUString(input);
  const output = new OUStringBuffer(count * 2 + 2 + len - i);
  try {
    if (hebrew) makeHebrewNumber(value, output, true, geresh);
    else makeCyrillicNumber(value, output, true);
    if (i < len) output.append(src.subarray(i, len));
    return output.makeStringAndClear();
  } finally {
    output.dispose();
  }
}
/** Original Hebrew public producer. @param input - Original number. @param geresh - Mode2 flag. @returns Owned result. */
export function getHebrewNativeNumberString(
  input: OUStringConstReference,
  geresh: boolean,
): OUString {
  return alphabetic(input, true, geresh);
}
/** Original Cyrillic public producer. @param input - Original number. @returns Owned result. */
export function getCyrillicNativeNumberString(input: OUStringConstReference): OUString {
  return alphabetic(input, false, false);
}
