/** @fileoverview Tests native HTML lexical recovery, legacy text modes and namespace/consumer boundaries independently of browser DOM parsing. */
import { expect, it } from "vitest";
import { HTMLParser } from "./parhtml";
import { GetOptions } from "./parhtml.options";
import { HtmlTokenId as T } from "../../inc/htmltokn";
import { SvParserState as S } from "../../inc/svparser";
import { SvStream } from "../../../tools/source/stream/stream";
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UNICODE,
} from "../../../sal/inc/rtl/textenc";

/** Actual native token consumer records lexical callbacks without host HTML normalization. */
class Sink extends HTMLParser {
  readonly events: { token: T; text: string }[] = [];
  /** Captures actual token values before subsequent scanner mutation. @param token - Filtered native token. @returns Nothing. */
  protected override NextToken(token: T): void {
    this.events.push({ token, text: this.aToken });
  }
}
/** Creates a real byte/character parser for one source fixture. @param source - UTF-8 source. @returns Actual consumer. */
function make(source: string): Sink {
  return new Sink(new SvStream(new TextEncoder().encode(source), RTL_TEXTENCODING_UTF8));
}
/** Projects native text, explicit breaks and scalar marker tokens. @param sink - Parsed source. @returns Visible lexical text. */
function visible(sink: Sink): string {
  return sink.events
    .map(
      /** Reads source token semantics. @param event - Native event. @returns Text fragment. */ (
        event,
      ) =>
        event.token === T.TEXTTOKEN || event.token === T.CDATA
          ? event.text
          : event.token === T.NEWPARA || event.token === T.LINEBREAK
            ? "\n"
            : event.token === T.LINEFEEDCHAR
              ? "\f"
              : event.token === T.NONBREAKSPACE
                ? "\u00a0"
                : event.token === T.SOFTHYPH
                  ? "\u00ad"
                  : "",
    )
    .join("");
}

it.each([
  ["<listing>\nA<b>B</b>\r\nC</listing>", "AB\nC"],
  ["<xmp>\r\n<i title=x>X</i></xmp>", "<i title=x>X</i>"],
  ["<textarea><script>A</script></textarea>X", "AX"],
  ["<script></script>X", "X"],
  ["<script>a\r\nb\rc\n</script>X", "X"],
  ["<style></style>X", "X"],
  ["<style>a</body>X", ""],
  // Original STYLE recovery accepts an opening BODY, not a closing BODY.
  ["<style>a<body>X", "X"],
  ["<script>", ""],
  ["<script>unterminated", ""],
  ["<script><!--a--->b</script>X", "X"],
  ["A</9junk>B", "AB"],
  ["A<9>B", "A<9>B"],
  ["A</", "A</"],
  ["A<%source%>B", "AB"],
  ["A<%source", "A<%source"],
  ["<!-- x >y", "y"],
  ["<![CDATA[a>b]]>X", "a>bX"],
  ["a\fb", "a\fb"],
  ["<xmp>&amp; A\vB</xmp>", "&amp; AB"],
  ["<listing>A\vB</listing>", "AB"],
  ["<pre>A\vB</pre>", "AB"],
  ["<textarea>A\r\nB</textarea>", "A\nB"],
  [" ", ""],
  ["  \t", ""],
  ["a ", "a "],
  ["&ampersand!", "&ersand!"],
  ["&notit!", "¬it!"],
  ["&unknown!", "&unknown!"],
  ["a&nbspX!", "a\u00a0X!"],
  ["&shyZ!", "\u00adZ!"],
  ["&!", "&!"],
  ["abc&", "abc&"],
  ["&amp", ""],
  ["&#xFF;", "ÿ"],
  ["&#xAb;", "«"],
  ["&#13;&#10;&#9;", "\r\n\t"],
  ["&#x;", "?"],
  ["&#;", "?"],

  ["&#x1f600; &#xD800; &#x110000; &#0;", "😀 ? ? ?"],
] as const)(
  "retains native recovery and mode output for %j",
  /** Exact fixtures pin lexical behavior rather than forgiving DOM repairs. @param source - Native source fixture. @param expected - Independent expected text. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const sink = make(source);
    expect(sink.CallParser()).toBe(S.Accepted);
    expect(visible(sink)).toBe(expected);
  },
);

it("recognizes only the configured namespace and preserves raw unknown tag identity", /** Namespace stripping applies before native lookup, while other prefixes remain unknown controls. @returns Nothing. */ () => {
  const sink = make("<x:b>Y</x:b><z:i>Z</z:i></x:br>");
  sink.SetNamespace("x");
  expect(sink.CallParser()).toBe(S.Accepted);
  expect(visible(sink)).toBe("YZ");
  expect(
    sink.events.map(
      /** Reads exact native token identity. @param event - Event. @returns Token. */ (event) =>
        event.token,
    ),
  ).toEqual([
    T.BOLD_ON,
    T.TEXTTOKEN,
    T.BOLD_OFF,
    T.UNKNOWNCONTROL_ON,
    T.TEXTTOKEN,
    T.UNKNOWNCONTROL_OFF,
    T.UNKNOWNCONTROL_OFF,
  ]);
});

it("maintains native header and independent legacy-mode transitions through complete source", /** Closing BODY/HTML resets all three legacy formatting modes. @returns Nothing. */ () => {
  for (const source of [
    "<head></head><body><listing>A</listing></body></html>",
    "<head><frameset><xmp>A</xmp></frameset></html>",
    "<body><pre>A</pre></body>",
  ]) {
    const sink = make(source);
    expect(sink.CallParser()).toBe(S.Accepted);
    expect(sink.bIsInHeader).toBe(false);
    expect([sink.bReadPRE, sink.bReadListing, sink.bReadXMP]).toEqual([false, false, false]);
    const events = [...sink.events];
    sink.Continue(T.TEXTTOKEN);
    expect(sink.events).toEqual(events);
  }
});

it("retains PRE tab-column and first-break contracts at the public filter boundary", /** Tests actual mode entry and successive input tokens rather than constructing scanner internals. @returns Nothing. */ () => {
  const sink = make("");
  expect(sink.FilterToken(T.INVALID)).toBe(T.NONE);
  sink.StartPRE();
  expect(sink.FilterPRE(T.NEWPARA)).toBe(T.NONE);
  sink.aToken = "abc";
  expect(sink.FilterPRE(T.TEXTTOKEN)).toBe(T.TEXTTOKEN);
  sink.aToken = "";
  expect(sink.FilterPRE(T.TABCHAR)).toBe(T.TEXTTOKEN);
  expect(sink.aToken).toBe("     ");
  expect(sink.FilterPRE(T.PARABREAK_ON)).toBe(T.LINEBREAK);
  expect(sink.FilterPRE(T.NONE)).toBe(T.NONE);
  // Original DBG_ASSERT only logs (tools/debug.hxx); the release guard preserves an existing token.
  sink.aToken = "already expanded";
  expect(sink.FilterPRE(T.TABCHAR)).toBe(T.TEXTTOKEN);
  expect(sink.aToken).toBe("already expanded");
  expect(sink.FilterPRE(T.FOOTNOTE_ON)).toBe(T.UNKNOWNCONTROL_ON);
  expect(sink.FilterPRE(T.FOOTNOTE_OFF)).toBe(T.UNKNOWNCONTROL_OFF);
});

it("retains explicit whitespace policy and native numeric-entity encoding selection", /** The source public entity helper preserves Unicode/default values and converts single-byte legacy entities. @returns Nothing. */ () => {
  const sink = make("");
  expect(sink.GetPreserveSpaces()).toBe(false);
  sink.SetPreserveSpaces(true);
  expect(sink.GetPreserveSpaces()).toBe(true);
  for (const encoding of [
    RTL_TEXTENCODING_DONTKNOW,
    RTL_TEXTENCODING_UNICODE,
    RTL_TEXTENCODING_UTF8,
  ]) {
    sink.SetSrcEncoding(encoding);
    expect(sink.ConvertEntityCharacter(0x80)).toBe(0x80);
  }
  sink.SetSrcEncoding(RTL_TEXTENCODING_MS_1252);
  expect(sink.ConvertEntityCharacter(0x80)).toBe(0x20ac);
  expect(sink.ConvertEntityCharacter(0x100)).toBe(0x100);
  sink.SetSrcEncoding(RTL_TEXTENCODING_ASCII_US);
  expect(sink.ConvertEntityCharacter(0)).toBe(0);
});

it("retains a configured raw end marker and long unknown raw tags without losing text", /** Source raw mode returns to the ordinary scanner at its exact end marker. @returns Nothing. */ () => {
  const sink = make("raw</STOP>X");
  sink.aEndToken = "stop";
  expect(sink.CallParser()).toBe(S.Accepted);
  expect(visible(sink)).toBe("X");
  expect(
    sink.events.find(
      /** Selects actual raw content. @param event - Event. @returns Raw flag. */ (event) =>
        event.token === T.RAWDATA,
    )?.text,
  ).toBe("raw");
  const tag = "a".repeat(1025),
    source = `<script><${tag}>raw</script>X`,
    long = make(source);
  expect(long.CallParser()).toBe(S.Accepted);
  expect(visible(long)).toBe("X");
  expect(
    long.events
      .filter(
        /** Selects source raw events. @param event - Event. @returns Raw flag. */ (event) =>
          event.token === T.RAWDATA,
      )
      .map(/** Borrows each raw span. @param event - Event. @returns Span. */ (event) => event.text)
      .join(""),
  ).toBe(`<${tag}>raw`);
});

it("preserves whitespace only when the native XML policy requests it", /** Ordinary text mode must distinguish preserved literal spacing from HTML collapse. @returns Nothing. */ () => {
  const source = "a\t \r\n b",
    sink = make(source);
  sink.SetPreserveSpaces(true);
  expect(sink.CallParser()).toBe(S.Accepted);
  expect(visible(sink)).toBe(source);
});

it("hands escaped entity and quote markers to the actual native option scanner", /** Lexical text and option decoding share the same mutable token format. @returns Nothing. */ () => {
  const sink = make('<a title="a&nbsp;b&shy;c&#9;d&#13;e&#10;f\\g">X</a>');
  expect(sink.CallParser()).toBe(S.Accepted);
  expect(visible(sink)).toBe("X");
  const token = sink.events.find(
    /** Finds the opening anchor. @param event - Native event. @returns Match. */ (event) =>
      event.token === T.ANCHOR_ON,
  )?.text;
  expect(token).toBeDefined();
  const options = GetOptions({ aToken: token as string, maOptions: [] });
  expect(options[0]?.GetString()).toBe("a b-c\tdef\\g");
});
