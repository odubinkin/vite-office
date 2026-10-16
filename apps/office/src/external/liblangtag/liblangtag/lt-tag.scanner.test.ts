/** @fileoverview Source-derived byte/token/error contracts of liblangtag's actual private scanner. */
import { expect, it } from "vitest";
import { ScannerErrorCode as Code, TagScanner, type ScannerErrorSlot } from "./lt-tag.scanner";

for (const [input, tokens] of [
  ["en-US", ["en", "-", "US"]],
  ["abc123", ["abc123"]],
  ["*foo", ["*", "foo"]],
  ["--*--", ["-", "-", "*", "-", "-"]],
  ["en\0-INVALID", ["en"]],
  ["", []],
] as const)
  it(`scans original token boundaries ${JSON.stringify(input)}`, /** Replays source-derived token literals, not grammar validation. @returns Nothing. */ () => {
    const scanner = new TagScanner(new TextEncoder().encode(input)),
      output = { token: "seed" as string | null, length: 9 },
      error: ScannerErrorSlot = { error: { code: Code.LT_ERR_EOT, message: "seed" } },
      before = error.error;
    for (const token of tokens) {
      expect(scanner.isEof()).toBe(false);
      expect(scanner.getToken(output, error)).toBe(true);
      expect(output).toEqual({ token, length: token.length });
      expect(error.error).toBe(before);
    }
    expect(scanner.isEof()).toBe(true);
    expect(scanner.getToken(output, error)).toBe(false);
    expect(output).toEqual({ token: null, length: 0 });
    expect(error.error).toEqual({ code: 3, message: "No more tokens in buffer" });
    expect(scanner.getToken(output)).toBe(false);
  });

it("preserves consumed error position and resumes after a failed token", /** The source consumes invalid bytes before reporting failure. @returns Nothing. */ () => {
  const scanner = new TagScanner(new TextEncoder().encode("en*US-foo_bar")),
    output = { token: "seed" as string | null, length: 9 },
    error: ScannerErrorSlot = { error: null };
  expect(scanner.getToken(output, error)).toBe(false);
  expect(error.error).toEqual({ code: 4, message: "Invalid wildcard: position = 2" });
  expect(output).toEqual({ token: null, length: 0 });
  expect(scanner.getToken(output, error)).toBe(true);
  expect(output).toEqual({ token: "US", length: 2 });
  expect(error.error?.message).toBe("Invalid wildcard: position = 2");
  expect(scanner.getToken(output)).toBe(true);
  expect(output.token).toBe("-");
  expect(scanner.getToken(output, error)).toBe(false);
  expect(error.error).toEqual({ code: 4, message: "Invalid character for tag: '_'" });
  expect(scanner.getToken(output)).toBe(true);
  expect(output.token).toBe("bar");
});

it("copies the C-string prefix independently of later caller buffer mutation", /** Preserves strdup value semantics under JS GC. @returns Nothing. */ () => {
  const input = new Uint8Array([65, 0, 66]),
    scanner = new TagScanner(input),
    output = { token: null as string | null, length: 0 };
  input.fill(90);
  expect(scanner.getToken(output)).toBe(true);
  expect(output).toEqual({ token: "A", length: 1 });
  expect(scanner.isEof()).toBe(true);
});

it("uses the complete ASCII alnum domain and rejects every other non-NUL byte", /** Exhausts byte input; non-ASCII BCP47 bytes are invalid in the source C-locale domain. @returns Nothing. */ () => {
  const accepted = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-*";
  for (let byte = 0; byte < 256; byte++) {
    const scanner = new TagScanner(new Uint8Array([byte])),
      output = { token: "seed" as string | null, length: 1 },
      error: ScannerErrorSlot = { error: null },
      c = String.fromCharCode(byte),
      valid = accepted.includes(c);
    expect(scanner.getToken(output, error)).toBe(valid);
    expect(output).toEqual(valid ? { token: c, length: 1 } : { token: null, length: 0 });
    if (!valid)
      expect(error.error).toEqual(
        byte === 0
          ? { code: 3, message: "No more tokens in buffer" }
          : { code: 4, message: `Invalid character for tag: '${c}'` },
      );
  }
});
