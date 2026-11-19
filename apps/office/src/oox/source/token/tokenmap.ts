/** @fileoverview Native TokenMap lexical lookup and complete token identities from the unchanged tokens.txt/generate-tokens.py input order; the source hash lookup remains a host map, and native signed-byte sequences retain original static ownership and COW output. */
import {
  Sequence,
  type SequenceElements,
  type SequenceConstReference,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OString } from "../../../sal/inc/rtl/string";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import tokenText from "./tokens.txt?raw";

/** Exact native XML_TOKEN_INVALID (FastToken::DONTKNOW). */
export const XML_TOKEN_INVALID = -1;
const names = tokenText.trimEnd().split("\n");
/** Original generated count; neither selected factory definitions nor local consumers renumber it. */
export const XML_TOKEN_COUNT = names.length;
const byName = new Map(
  names.map(
    /** Retains native generator input order. @param name - Lexeme. @param id - Zero-based native token. @returns Pair. */ (
      name,
      id,
    ) => [name, id] as const,
  ),
);
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
let bytes: Sequence<number>[] | null = null;
let emptyBytes: Sequence<number> | null = null;

/** Original TokenMap namespace exact/case-sensitive UTF8 lookup, including one-byte tokens and unknown spellings. @param token - UTF8 view or exact XML lexeme. @returns Original integer token or DONTKNOW. */
export function getTokenFromUtf8(token: string | Uint8Array): number;
/** Original pointer/count lowering of a borrowed native string_view. @param token - Actual signed-byte sequence storage. @param length - Original bounded length. @returns Token or DONTKNOW. */
export function getTokenFromUtf8(
  token: SequenceElements | Int8Array | null,
  length: number,
): number;
/** Performs exact byte lookup; no UTF8 decoder normalizes malformed input or a BOM. @param token - Declared byte/string view. @param length - Explicit native pointer-view size. @returns Original token identity. */
export function getTokenFromUtf8(
  token: string | Uint8Array | Int8Array | SequenceElements | null,
  length?: number,
): number {
  if (typeof token === "string") return byName.get(token) ?? XML_TOKEN_INVALID;
  let name = "";
  if (ArrayBuffer.isView(token)) {
    for (let i = 0; i < (length ?? token.length); ++i)
      name += String.fromCharCode((token[i] as number) & 255);
  } else {
    for (let i = 0; i < (length as number); ++i)
      name += String.fromCharCode(((token as SequenceElements).get(i) as [number])[0] & 255);
  }
  return byName.get(name) ?? XML_TOKEN_INVALID;
}
/** Original function-local static table and borrowed const sequence result. @param token - Native index. @returns Actual static signed-byte sequence; callers copy its owner for a value return. */
export function getUtf8TokenName(token: number): SequenceConstReference<number> {
  if (bytes === null) {
    const encoder = new TextEncoder();
    bytes = names.map(
      /** Original static sequence initializer. @param name - Generated ASCII lexeme. @returns Native byte owner. */ (
        name,
      ) => {
        const input = encoder.encode(name),
          result = new Bytes(input.length),
          data = result.getArray() as SequenceElements;
        for (let i = 0; i < input.length; ++i)
          (data.get(i) as [number])[0] = ((input[i] as number) << 24) >> 24;
        return result;
      },
    );
  }
  if (token >= 0 && token < XML_TOKEN_COUNT) return bytes[token] as Sequence<number>;
  // Original SAL_WARN diagnostic is not replaced with a host logging policy.
  emptyBytes ??= new Bytes();
  return emptyBytes;
}

/** Original tokenmap.hxx inline Unicode name conversion; the counted byte-pointer boundary materializes only initialized logical units for the existing SAL converter. Physical pointer aliasing is unqualified. @param token - Native token. @returns Owned Unicode spelling. */
export function getUnicodeTokenName(token: number): OUString {
  const sequence = new Bytes(getUtf8TokenName(token));
  try {
    const source = sequence.getConstArray(),
      bytes = new Uint8Array(sequence.getLength());
    if (ArrayBuffer.isView(source)) bytes.set(source.subarray(0, bytes.length));
    else
      for (let i = 0; i < bytes.length; ++i)
        bytes[i] = ((source as SequenceElements).get(i) as [number])[0];
    return new OUString(bytes, bytes.length, RTL_TEXTENCODING_UTF8);
  } finally {
    sequence.dispose();
  }
}
/** Original tokenmap.hxx Unicode-to-UTF8 temporary and exact lexical lookup; native strings bind their implicit counted-view conversion. @param token - Borrowed native Unicode view or string. @returns Token or DONTKNOW. */
export function getTokenFromUnicode(token: Uint16Array | OUStringConstReference): number {
  const view = ArrayBuffer.isView(token) ? token : token.getStr().subarray(0, token.getLength());
  const bytes = new OString(view, view.length, RTL_TEXTENCODING_UTF8);
  try {
    return getTokenFromUtf8(bytes.getStr().subarray(0, bytes.getLength()));
  } finally {
    bytes.dispose();
  }
}
