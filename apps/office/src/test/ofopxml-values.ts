/** @fileoverview Test-only native StringPair sequence construction and observation through real SAL/CPPU owners; fixture records never act as production UNO values. */
import {
  Sequence,
  type SequenceElements,
  type SequenceReference,
} from "../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../cppu/inc/uno/sequence2";
import type { typelib_TypeDescriptionReference as R } from "../cppu/inc/typelib/typedescription";
import { uno_type_assignData } from "../cppu/inc/uno/data";
import { cpp_queryInterface, cpp_acquire, cpp_release } from "../cppu/inc/com/sun/star/uno/genfunc";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../udkapi/com/sun/star/beans/StringPair";
import { OUString, type OUStringConstReference } from "../sal/inc/rtl/ustring";
import { ReadContentTypeSequence } from "../comphelper/source/xml/ofopxmlhelper";
import type { InputSource } from "../offapi/com/sun/star/xml/sax/InputSource";
/** Pure caller fixture, never an initialized UNO aggregate. */
export interface PairInput {
  readonly First: string;
  readonly Second: string;
}
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
const Rows = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
/** Creates an actual exact UTF16 string. @param value - Fixture. @returns Owner. */
export function nativeString(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Exact UTF16 unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Observes borrowed exact UTF16. @param value - Actual native value. @returns Text. */
export function nativeText(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Builds real generated struct values and copies them through genuine compound assignment. @param values - Pure fixture inputs. @returns Owned sequence. */
export function createPairs(values: readonly PairInput[]): Sequence<StringPair> {
  const result = new Pairs(values.length);
  try {
    const fields = result.getArray() as SequenceElements;
    for (let i = 0; i < values.length; ++i) {
      const input = values[i] as PairInput,
        first = nativeString(input.First),
        second = nativeString(input.Second),
        pair = new StringPair(first, second);
      try {
        const type = pairType().getTypeLibType() as R;
        uno_type_assignData(
          fields.get(i * 16),
          type,
          pair,
          type,
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        );
      } finally {
        pair.dispose();
        second.dispose();
        first.dispose();
      }
    }
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  }
}
/** Initializes real nested sequence fields through the existing native assignment operation. @param values - Pure fixture rows. @returns Owned outer value. */
export function createPairRows(
  values: readonly (readonly PairInput[])[],
): Sequence<Sequence<StringPair>> {
  const result = new Rows(values.length);
  try {
    const fields = result.getArray() as SequenceElements;
    for (let i = 0; i < values.length; ++i) {
      const row = createPairs(values[i] as readonly PairInput[]);
      try {
        Sequence.unacquired(Pairs, fields.get(i * 8) as [uno_Sequence | null]).assign(row);
      } finally {
        row.dispose();
      }
    }
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  }
}
/** Observes native fields without a copy/acquire or mutable access. @param row - Borrowed actual row. @returns Assertion records. */
export function observePairs(row: SequenceReference<StringPair>): PairInput[] {
  const result: PairInput[] = [];
  for (let i = 0; i < row.getLength(); ++i) {
    const pair = StringPair.unacquired(
      (row.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
    );
    result.push({ First: nativeText(pair.First), Second: nativeText(pair.Second) });
  }
  return result;
}
/** Observes actual nested native rows. @param rows - Borrowed real result. @returns Assertion records. */
export function observePairRows(rows: SequenceReference<Sequence<StringPair>>): PairInput[][] {
  const result: PairInput[][] = [];
  for (let i = 0; i < rows.getLength(); ++i)
    result.push(
      observePairs(
        Sequence.unacquired(
          Pairs,
          (rows.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
        ),
      ),
    );
  return result;
}
/** Owns the actual returned content type result during observation. @param xml - Input. @returns Assertion records. */
export function readContentTypes(xml: string | InputSource): PairInput[][] {
  const result = ReadContentTypeSequence(xml);
  try {
    return observePairRows(result);
  } finally {
    result.dispose();
  }
}
