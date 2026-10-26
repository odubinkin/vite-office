/** @fileoverview Source-contract tests for native HTML lexical state, independent from browser DOM parsing. */
import { expect, it } from "vitest";
import { SvStream } from "../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../inc/htmltokn";
import { SvParserState } from "../../inc/svparser";
import { HTMLParser } from "./parhtml";
import { GetHTMLCharName, GetHTMLToken, GetHTMLColor, GetHTMLOption } from "./htmlkywd";
import { Color } from "../../../tools/inc/color";
import { HTMLOption } from "./parhtml.options";

/** Test sink records actual filtered tokens and mutable option values at dispatch. */
class Sink extends HTMLParser {
  public readonly events: {
    token: T;
    text: string;
    options: readonly (readonly [O, string, string])[];
  }[] = [];
  /** Preserves exact native options only for actual tag tokens. @param token - Filtered kind. @returns Nothing. */
  protected override NextToken(token: T): void {
    this.events.push({
      token,
      text: this.aToken,
      options:
        token >= T.AREA && token !== T.NONBREAKSPACE && token !== T.SOFTHYPH
          ? this.GetOptions().map(
              /** Captures original spelling and interpreted value. @param option - Native option. @returns Fields. */ (
                option,
              ) => [option.GetToken(), option.GetTokenString(), option.GetString()] as const,
            )
          : [],
    });
  }
}
/** Parses UTF-8 bytes through the native lexical and character owners. @param input - Source. @returns Token sink. */
function parse(input: string | Uint8Array): Sink {
  const sink = new Sink(
    new SvStream(
      typeof input === "string" ? new TextEncoder().encode(input) : input,
      RTL_TEXTENCODING_UTF8,
    ),
    false,
  );
  expect(sink.CallParser()).toBe(SvParserState.Accepted);
  return sink;
}
/** Projects visible text and scalar special tokens. @param sink - Original events. @returns Text. */
function text(sink: Sink): string {
  return sink.events
    .map(
      /** Reads source text events only. @param event - Token. @returns Text. */ (event) =>
        event.token === T.TEXTTOKEN || event.token === T.CDATA
          ? event.text
          : event.token === T.NONBREAKSPACE
            ? "\u00a0"
            : event.token === T.SOFTHYPH
              ? "\u00ad"
              : event.token === T.NEWPARA
                ? "\n"
                : "",
    )
    .join("");
}
it("retains native lookup sentinels, entity case and comment prefixes", /** Checks original table contracts. @returns Nothing. */ () => {
  expect(GetHTMLToken("b")).toBe(T.BOLD_ON);
  expect(GetHTMLToken("B")).toBe(T.NONE);
  expect(GetHTMLToken("!--anything")).toBe(T.COMMENT);
  expect(GetHTMLCharName("nbsp")).toBe(1);
  expect(GetHTMLCharName("shy")).toBe(2);
  expect(GetHTMLCharName("AMP")).toBe(0);
  expect(GetHTMLOption("href")).toBe(O.HREF);
  expect(GetHTMLColor("ReD")).toBe(0xff0000);
  expect(GetHTMLColor(" red")).toBe(0xffffffff);
});
it("collapses ordinary whitespace but retains native entity and NULL control decisions", /** Covers the byte stream and ScanText automaton. @returns Nothing. */ () => {
  expect(text(parse("a \t\r\n b &amp; &nbsp; &shy; &#65; &#x41; &#X41; &unknown;\0Z"))).toBe(
    "a b & \u00a0 \u00ad A A ?41; &unknown;Z",
  );
});
it("emits paired callbacks for source self-closing tags and treats closing BR as a break", /** Pins native pending-off and singleton branches. @returns Nothing. */ () => {
  expect(
    parse("<b/>x</br>").events.map(
      /** Projects native kind. @param event - Event. @returns Kind. */ (event) => event.token,
    ),
  ).toEqual([T.BOLD_ON, T.BOLD_OFF, T.TEXTTOKEN, T.LINEBREAK]);
});
it("keeps native case, escaping, duplicate options and unquoted value parsing", /** Verifies mutable option storage rather than host attribute normalization. @returns Nothing. */ () => {
  const event = parse("<a HREF='first' href=second title='a&#32;b &quot;c&quot;' x-unknown=ok>")
    .events[0];
  expect(event?.options).toEqual([
    [O.HREF, "HREF", "first"],
    [O.HREF, "href", "second"],
    [O.TITLE, "title", 'a b "c"'],
    [O.UNKNOWN, "x-unknown", "ok"],
  ]);
});
it("retains raw script comment state and style's alternate closing tags", /** Checks original raw-token boundaries and resumption. @returns Nothing. */ () => {
  const events = parse("<script><!--\n</script>\n--></script>X<style>a</head>Y").events;
  expect(
    events
      .filter(
        /** Selects ordinary source text. @param event - Event. @returns Text flag. */ (event) =>
          event.token === T.TEXTTOKEN,
      )
      .map(
        /** Reads body fragments. @param event - Text token. @returns Text. */ (event) =>
          event.text,
      ),
  ).toEqual(["X", "Y"]);
  expect(
    events.some(
      /** Finds ignored closing script text inside a comment. @param event - Raw event. @returns Whether retained as raw. */ (
        event,
      ) => event.token === T.RAWDATA && event.text === "</script>",
    ),
  ).toBe(true);
});
it("uses source PRE first-newline suppression, tab stops and paired mode exit", /** Verifies native filter order. @returns Nothing. */ () => {
  expect(text(parse("<pre>\nA\tB\nC</pre>"))).toBe("A       B\nC");
  expect(text(parse("<xmp>\n<b>literal</b></xmp>"))).toBe("<b>literal</b>");
});
it("restores an unterminated tag as source text and accepts CDATA through its native branch", /** Checks EOF rewind and raw content. @returns Nothing. */ () => {
  expect(text(parse("a <broken title='x"))).toBe("a <broken title='x");
  expect(text(parse("<![CDATA[a<b>\nc]]>"))).toBe("a<b>c");
});
it("retains signed32 option overflow, unsigned numeral wrap and Netscape color conversion", /** Checks native non-CSS value semantics. @returns Nothing. */ () => {
  expect(new HTMLOption(O.WIDTH, "width", "2147483648").GetNumber()).toBe(0);
  expect(new HTMLOption(O.WIDTH, "width", "-3").GetNumber()).toBe(0);
  expect(new HTMLOption(O.WIDTH, "width", " -2147483648suffix").GetSNumber()).toBe(-2147483648);
  const numbers: number[] = [9];
  new HTMLOption(O.COORDS, "coords", "-1,4294967296;2").GetNumbers(numbers);
  expect(numbers).toEqual([1, 0, 2]);
  const color = new Color();
  new HTMLOption(O.COLOR, "color", "#12ABef").GetColor(color);
  expect(color.toUInt32()).toBe(0x12abef);
});
it("preserves the source control predicate's DEL/C1 and truncated-scalar behavior", /** Checks the native sal_Unicode predicate boundary. @returns Nothing. */ () => {
  expect(text(parse("A\u007f\u0080B\u{10000}C&#65536;D"))).toBe("A\u007f\u0080BC?D");
});
it("uses native incremental UTF-8 fallback rather than whole-stream replacement", /** Verifies actual SvParser conversion status handling. @returns Nothing. */ () => {
  expect(text(parse(Uint8Array.of(0xc2, 0x41)))).toBe("?");
  expect(text(parse(Uint8Array.of(0x41, 0xe2, 0x82)))).toBe("A");
  expect(text(parse("русский 😀"))).toBe("русский 😀");
});
