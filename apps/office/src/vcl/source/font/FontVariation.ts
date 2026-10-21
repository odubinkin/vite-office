/** @fileoverview Native Variation values and complete VariationsFromString from FontVariation.cxx,using actual o3tl/RTL input owners. */
import { getToken, trim, toDouble } from "../../../o3tl/inc/string_view";
import { isAsciiAlphanumeric } from "../../../sal/inc/rtl/character";
import { featureCode, featureCodeAsString } from "../../inc/font/Feature";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import type { OUString } from "../../../sal/inc/rtl/ustring";
/** Original aggregate default/copy/equality and public uint32/binary32 fields;JS accessors preserve native field assignment narrowing. */
export class Variation {
  private tag = 0;
  private value = 0;
  /** Original value initialization or aggregate pair. @param nTag - Native tag. @param fValue - Native float. @returns Value. */
  public constructor(nTag?: number, fValue?: number);
  /** Original implicit aggregate copy. @param source - Source value. @returns Value. */
  public constructor(source: Readonly<Variation>);
  /** Initializes actual narrowed scalar fields without font lookup or clamping. @param tag - Tag or copy source. @param value - Float when initialized as a pair. @returns Value. */
  public constructor(tag: number | Readonly<Variation> = 0, value = 0) {
    this.nTag = typeof tag === "number" ? tag : tag.nTag;
    this.fValue = typeof tag === "number" ? value : tag.fValue;
  }
  /** Original public tag read. @returns Unsigned32 tag. */
  public get nTag(): number {
    return this.tag;
  }
  /** Original public uint32 assignment. @param tag - Native field input. @returns Nothing. */
  public set nTag(tag: number) {
    this.tag = tag >>> 0;
  }
  /** Original public float read. @returns Binary32 value carried in a JS number. */
  public get fValue(): number {
    return this.value;
  }
  /** Original float field assignment,retaining signedzero,NaN and infinities. @param value - Native field input. @returns Nothing. */
  public set fValue(value: number) {
    this.value = Math.fround(value);
  }
  /** Original ordered tag/value equality,including IEEE NaN and signedzero semantics. @param other - Native compared value. @returns Equality. */
  public equals(other: Readonly<Variation>): boolean {
    return this.nTag === other.nTag && this.fValue === other.fValue;
  }
}

/** Parses the complete original comma-separated quoted four-char axis syntax without sorting,deduplication or numeric validation absent upstream. @param text - Borrowed original UTF16 view. @returns Original ordered binary32 axis values. */
export function VariationsFromString(text: Uint16Array): Variation[] {
  const variations: Variation[] = [];
  const position: [number] = [0];
  do {
    const token = trim(getToken(text, 44, position));
    if (token.length === 0) continue;
    if (token.length < 7) continue;
    const quote = token[0] as number;
    if (quote !== 34 && quote !== 39) continue;
    // The preceding seven-unit guard also entails the native redundant size<6 test.
    if (token[5] !== quote) continue;
    let validTag = true;
    for (let index = 1; index <= 4; index++) {
      if (!isAsciiAlphanumeric(token[index] as number) && token[index] !== 32) {
        validTag = false;
        break;
      }
    }
    if (!validTag) continue;
    const tag = featureCode(Int8Array.from(token.subarray(1, 5)));
    const value = trim(token.subarray(6));
    // Whole-token trim and the seven-unit guard already prove that this suffix is nonempty.
    variations.push(new Variation(tag, toDouble(value)));
  } while (position[0] !== -1);
  return variations;
}

/** Original ordered quoted-axis serialization through the actual native float overload;duplicates and nonfinite values are not normalized. @param variations - Original ordered vector. @returns Owned native Unicode string. */
export function VariationsToString(variations: readonly Readonly<Variation>[]): OUString {
  const buffer = new OUStringBuffer();
  try {
    for (let i = 0; i < variations.length; ++i) {
      if (i > 0) buffer.append(Uint8Array.of(44, 32, 0));
      const variation = variations[i] as Readonly<Variation>;
      const tag = featureCodeAsString(variation.nTag);
      try {
        buffer
          .append(Uint8Array.of(34, 0))
          .append(tag)
          .append(Uint8Array.of(34, 32, 0));
      } finally {
        tag.dispose();
      }
      buffer.appendFloat(variation.fValue);
    }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
