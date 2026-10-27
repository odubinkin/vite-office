/** @fileoverview Exercises parser state callbacks and real encoding boundaries without replacing native converters. */
import { expect, it } from "vitest";
import { SvParser } from "./svparser";
import { SvParserState as S } from "../../inc/svparser";
import { SvStream } from "../../../tools/source/stream/stream";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_MS_932,
} from "../../../sal/inc/rtl/textenc";
/** Actual consumer specialization exposes the native state contract. */
class Parser extends SvParser<number> {
  public after = S.Working;
  /** Sets source entry state. @param state - State. @returns Nothing. */ start(
    state = S.Working,
  ): void {
    this.eState = state;
  }
  /** Native consumer controls completion state. @returns Token. */ protected override GetNextToken_(): number {
    this.eState = this.after;
    return 7;
  }
}
it("keeps pending and accepted scanner states distinct from invalid consumer completion", /** Verifies token admission. @returns Nothing. */ () => {
  const parser = new Parser(new SvStream(new Uint8Array(), RTL_TEXTENCODING_DONTKNOW));
  expect(parser.GetStatus()).toBe(S.NotStarted);
  parser.RestoreState();
  parser.start();
  parser.after = S.Pending;
  expect(parser.GetNextToken()).toBe(7);
  expect(parser.GetStatus()).toBe(S.Pending);
  parser.start();
  parser.after = S.Accepted;
  expect(parser.GetNextToken()).toBe(7);
  expect(parser.GetStatus()).toBe(S.Accepted);
  parser.start();
  parser.after = S.NotStarted;
  expect(parser.GetNextToken()).toBe(7);
  expect(parser.GetStatus()).toBe(S.Error);
});
it("rereads actual lookahead after an encoding change and preserves raw symbol bytes", /** Verifies unknown and symbol readers. @returns Nothing. */ () => {
  const parser = new Parser(new SvStream(Uint8Array.of(0xff, 0x41), RTL_TEXTENCODING_DONTKNOW));
  parser.start();
  parser.SetSrcEncoding(RTL_TEXTENCODING_DONTKNOW);
  expect(parser.GetNextChar()).toBe(255);
  parser.SetSrcEncoding(RTL_TEXTENCODING_SYMBOL);
  parser.RereadLookahead();
  expect(parser.nNextCh).toBe(255);
  expect(parser.GetNextChar()).toBe(65);
  parser.SetSrcEncoding(RTL_TEXTENCODING_SYMBOL);
});
it("detects the actual UTF8 BOM and rewinds malformed UTF16 surrogate lookahead", /** Verifies source BOM and scalar fallback. @returns Nothing. */ () => {
  const utf8 = new Parser(
    new SvStream(Uint8Array.of(0xef, 0xbb, 0xbf, 0x41), RTL_TEXTENCODING_DONTKNOW),
  );
  utf8.SetSwitchToUCS2(true);
  utf8.start();
  expect(utf8.GetNextChar()).toBe(65);
  expect(utf8.GetSrcEncoding()).toBe(RTL_TEXTENCODING_UTF8);
  for (const bytes of [
    Uint8Array.of(0xff, 0xfe, 0x00, 0xd8, 0x41, 0x00),
    Uint8Array.of(0xff, 0xfe, 0x00, 0xdc, 0x41, 0x00),
  ]) {
    const parser = new Parser(new SvStream(bytes, RTL_TEXTENCODING_DONTKNOW));
    parser.SetSwitchToUCS2(true);
    parser.start();
    expect(parser.GetNextChar()).toBe(63);
    expect(parser.GetNextChar()).toBe(65);
    expect(parser.GetNextChar()).toBe(65535);
  }
});
it("returns native byte fallback on invalid UTF8 and EOF on truncated stateless multibyte sequences", /** Verifies real conversion error handling. @returns Nothing. */ () => {
  const bad = new Parser(new SvStream(Uint8Array.of(0xff, 0x41), RTL_TEXTENCODING_DONTKNOW));
  bad.SetSrcEncoding(RTL_TEXTENCODING_UTF8);
  bad.start();
  expect(bad.GetNextChar()).toBe(255);
  expect(bad.GetNextChar()).toBe(65);
  const partial = new Parser(new SvStream(Uint8Array.of(0x82), RTL_TEXTENCODING_DONTKNOW));
  partial.SetSrcEncoding(RTL_TEXTENCODING_MS_932);
  partial.start();
  expect(partial.GetNextChar()).toBe(65535);
});
