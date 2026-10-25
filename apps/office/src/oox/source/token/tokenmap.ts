/** @fileoverview Native TokenMap lexical lookup and complete token identities from the unchanged tokens.txt/generate-tokens.py input order; host maps replace generated gperf lookup and byte arrays bind UTF8 output. */
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
let bytes: Uint8Array[] | null = null;

/** Original TokenMap namespace exact/case-sensitive UTF8 lookup, including one-byte tokens and unknown spellings. @param token - UTF8 view or exact XML lexeme. @returns Original integer token or DONTKNOW. */
export function getTokenFromUtf8(token: string | Uint8Array): number {
  // Native std::string_view lookup does not discard a leading UTF8 BOM.
  const name =
    typeof token === "string" ? token : new TextDecoder("utf-8", { ignoreBOM: true }).decode(token);
  return byName.get(name) ?? XML_TOKEN_INVALID;
}
/** Original TokenMap namespace token-index bounds and empty invalid result; copy binds the public Sequence return value. @param token - Native token index. @returns Owned UTF8 bytes. */
export function getUtf8TokenName(token: number): Uint8Array {
  if (bytes === null) {
    const encoder = new TextEncoder();
    bytes = names.map(
      /** Original lazily initialized static UTF8 names. @param name - Lexeme. @returns Bytes. */ (
        name,
      ) => encoder.encode(name),
    );
  }
  return token >= 0 && token < XML_TOKEN_COUNT
    ? (bytes[token] as Uint8Array).slice()
    : new Uint8Array();
}
