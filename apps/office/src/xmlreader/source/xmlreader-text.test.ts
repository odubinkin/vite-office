/** @fileoverview Source-backed public reader histories over actual input bytes. */
import { expect, it } from "vitest";
import { XmlReader, Text, Result } from "../inc/xmlreader";
import { Span } from "../inc/span";
import { OUString } from "../../sal/inc/rtl/ustring";
/** Actual string. @param value - Text. @returns Value. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value,
    /** Converts an ASCII fixture character. @param c - Character. @returns UTF16 unit. */ (c) =>
      c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Actual byte span. @param value - Text. @returns Value. */
function s(value: string): Span {
  const bytes = new TextEncoder().encode(value);
  return new Span(bytes, bytes.length);
}
/** Decodes actual shared UTF8 conversion. @param value - Span. @returns Text. */
function t(value: Span): string {
  const str = value.convertFromUtf8();
  let out = "";
  for (let i = 0; i < str.getLength(); i++) out += String.fromCharCode(str.getStr()[i] as number);
  return out;
}

/** Parses one root text item. @param input - Content. @param mode - Text mode. @returns Text. */
function content(input: string, mode: Text): string {
  const r = new XmlReader(u("text"), new TextEncoder().encode("<r>" + input + "</r>")),
    d = new Span(),
    id: [number] = [77];
  expect(r.nextItem(Text.NONE, d, id)).toBe(Result.Begin);
  expect(r.nextItem(mode, d, id)).toBe(Result.Text);
  const output = t(d);
  expect(id[0]).toBe(-2);
  expect(r.nextItem(mode, d, id)).toBe(Result.End);
  expect(r.nextItem(mode, d, id)).toBe(Result.Done);
  return output;
}
it("preserves raw line ends entities CDATA PI DTD and empty text before start tags", /** Raw sequences. @returns Nothing. */ () => {
  expect(
    content(
      "a\rb\r\nc\n&amp;&lt;&gt;&apos;&quot;<![CDATA[x\ry\r\nz\r]]><!--c--><?p?><!d>",
      Text.Raw,
    ),
  ).toBe("a\nb\nc\n&<>'\"x\ny\nz\n");
  expect(content("", Text.Raw)).toBe("");
  for (const mode of [Text.Raw, Text.Normalized]) {
    const r = new XmlReader(u("initial"), new TextEncoder().encode("<r><c/></r>")),
      d = s("initial"),
      id: [number] = [88];
    expect(r.nextItem(mode, d, id)).toBe(Result.Text);
    expect([t(d), id[0]]).toEqual(["", 88]);
    expect(r.nextItem(mode, d, id)).toBe(Result.Begin);
    expect(t(d)).toBe("r");
    expect(r.nextItem(mode, d, id)).toBe(Result.Text);
    expect(t(d)).toBe("");
    expect(r.nextItem(mode, d, id)).toBe(Result.Begin);
    expect(t(d)).toBe("c");
  }
});
it("normalizes literal flow but retains reference whitespace and CDATA prefix behavior", /** Normalized source examples. @returns Nothing. */ () => {
  for (const [input, output] of [
    [" \t\r\n a b  c \t d\r e\n f ", "a b c d e f"],
    ["\t ", ""],
    ["a &amp;b", "a &b"],
    ["a  &amp;b", "a &b"],
    ["&#9;x", "\tx"],
    ["a<!--c-->b<?p?>c", "a b c"],
    ["<!d>x", "x"],
    ["<![CDATA[ a\rb\r\nc ]]>", " a\nb\nc "],
    ["a<![CDATA[b]]>", "a<![CDATA[b]]>b"],
    ["a <![CDATA[b]]>", "a <![CDATA[b]]>b"],
    ["a  <![CDATA[b]]>", "a b"],
    ["a\t\t b", "a b"],
    ["a \t b", "a b"],
    ["a  b", "a b"],
    ["a &amp;", "a &"],
    ["a&amp;", "a&"],
    ["a\t&amp;", "a &"],
  ] as const)
    expect(content(input, Text.Normalized)).toBe(output);
});
it("normalizes attributes with original CR global peek and preserves reference whitespace", /** Actual attribute access. @returns Nothing. */ () => {
  for (const [value, tail, full, output] of [
    [" \t a  b\t\r\n c ", "", true, "a b c"],
    ["a b", "", true, "a b"],
    ["a \t b", "", true, "a b"],
    ["a\t\t b", "", true, "a b"],
    ["a  \t b", "", true, "a b"],
    [" \t\r\n ", "", true, ""],
    ["a&amp;&#9;b", "", true, "a&\tb"],
    ["a\tb\nc", "", false, "a b c"],
    ["X\r\nY", "", false, "X  Y"],
    ["X\r\nY", "\n", false, "X Y"],
    ["X\rY", "\n", false, "X "],
  ] as const) {
    const r = new XmlReader(
        u("attr"),
        new TextEncoder().encode('<r a="' + value + '">' + tail + "</r>"),
      ),
      d = new Span(),
      id: [number] = [0];
    expect(r.nextItem(Text.NONE, d, id)).toBe(Result.Begin);
    expect(r.nextAttribute(id, d)).toBe(true);
    expect(t(r.getAttributeValue(full))).toBe(output);
  }
});
