/** @fileoverview Verifies native parser character, token-ring and saved-state contracts. */
import { expect, it } from "vitest";
import { SvParser } from "./svparser";
import { SvParserState as S } from "../../inc/svparser";
import { SvStream } from "../../../tools/source/stream/stream";
import {
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_MS_932,
} from "../../../sal/inc/rtl/textenc";
/** Exposes the genuine base operations without document consumer behavior. */
class Probe extends SvParser<number> {
  private nextToken = 0;
  /** Activates the native scan state for isolated operations. @returns Nothing. */
  public Start(): void {
    this.eState = S.Working;
  }
  /** Retains source token/value fields before ring insertion. @returns Sequential kind. */
  protected override GetNextToken_(): number {
    this.aToken = "token" + ++this.nextToken;
    this.nTokenValue = this.nextToken * 10;
    this.bTokenHasValue = true;
    return this.nextToken;
  }
}
it("reads UTF-8 scalars and source line/column positions with EOF after unsuccessful read", /** Checks native incremental converter ownership. @returns Nothing. */ () => {
  const stream = new SvStream(new TextEncoder().encode("😀\nA"), RTL_TEXTENCODING_UTF8),
    parser = new Probe(stream);
  parser.SetSrcEncoding(RTL_TEXTENCODING_UTF8);
  parser.Start();
  expect(parser.GetNextChar()).toBe(0x1f600);
  expect([stream.Tell(), parser.GetLineNr(), parser.GetLinePos(), stream.eof()]).toEqual([
    4,
    1,
    2,
    false,
  ]);
  expect(parser.GetNextChar()).toBe(10);
  expect([parser.GetLineNr(), parser.GetLinePos()]).toEqual([2, 1]);
  expect(parser.GetNextChar()).toBe(65);
  expect(stream.eof()).toBe(false);
  expect(parser.GetNextChar()).toBe(65535);
  expect(stream.eof()).toBe(true);
});
it("uses native stateless double-byte lookahead and rewinds an invalid trailing byte", /** Checks the pointer-one branch and source byte fallback. @returns Nothing. */ () => {
  const stream = new SvStream(Uint8Array.of(0x82, 0xa0, 0x82, 0x20, 0x41), RTL_TEXTENCODING_MS_932),
    parser = new Probe(stream);
  parser.SetSrcEncoding(RTL_TEXTENCODING_MS_932);
  parser.Start();
  expect(parser.GetNextChar()).toBe(0x3042);
  expect(stream.Tell()).toBe(2);
  expect(parser.GetNextChar()).toBe(0x82);
  expect(stream.Tell()).toBe(3);
  expect(parser.GetNextChar()).toBe(0x20);
  expect(parser.GetNextChar()).toBe(65);
});
it("keeps direct UCS2 converter rejection distinct from BOM-selected UTF16 stream reading", /** Pins source explicit setter versus DetectEncoding branch. @returns Nothing. */ () => {
  const stream = new SvStream(
      Uint8Array.of(0xff, 0xfe, 0x3d, 0xd8, 0x00, 0xde),
      RTL_TEXTENCODING_DONTKNOW,
    ),
    parser = new Probe(stream);
  parser.SetSrcEncoding(RTL_TEXTENCODING_UNICODE);
  expect(parser.GetSrcEncoding()).toBe(RTL_TEXTENCODING_DONTKNOW);
  parser.SetSrcEncoding(RTL_TEXTENCODING_UTF8);
  parser.SetSwitchToUCS2(true);
  parser.Start();
  expect(parser.GetNextChar()).toBe(0x1f600);
  expect(parser.GetSrcEncoding()).toBe(RTL_TEXTENCODING_UNICODE);
  expect(parser.GetCharSize()).toBe(2);
});
it("replays bounded source token-ring entries without rescanning and restores saved token only on RestoreState", /** Exercises original ring indices and saved-state discriminator. @returns Nothing. */ () => {
  const parser = new Probe(new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  parser.Start();
  expect(parser.GetNextToken()).toBe(1);
  expect(parser.GetNextToken()).toBe(2);
  expect(parser.GetNextToken()).toBe(3);
  expect(parser.SkipToken(-2)).toBe(1);
  expect(parser.aToken).toBe("token1");
  expect(parser.GetNextToken()).toBe(2);
  expect(parser.GetNextToken()).toBe(3);
  expect(parser.GetNextToken()).toBe(4);
  parser.nNextCh = 65;
  parser.SaveState(7);
  expect(parser.GetSaveToken()).toBe(0);
  parser.aToken = "changed";
  parser.nNextCh = 66;
  parser.RestoreState();
  expect([parser.aToken, parser.nNextCh, parser.GetSaveToken()]).toEqual(["token4", 65, 7]);
});
