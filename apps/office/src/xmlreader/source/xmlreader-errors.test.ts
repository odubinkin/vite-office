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

import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
it("reports original lexical tag and reference errors", /** Real public state transitions. @returns Nothing. */ () => {
  for (const [xml, prefix, mode] of [
    ["", "premature end of ", Text.NONE],
    ["<", "bad tag name in ", Text.NONE],
    ["<r=", "missing whitespace before attribute in ", Text.NONE],
    ["<r =", "bad attribute name in ", Text.NONE],
    ["<r a >", "missing '=' in ", Text.NONE],
    ["<r a=x>", "bad attribute value in ", Text.NONE],
    [`<r a="x`, "unterminated attribute value in ", Text.NONE],
    ["<r/x", "missing '>' in ", Text.NONE],
    ["</r>", "spurious end tag in ", Text.NONE],
    ["<r></c>", "tag mismatch in ", Text.NONE],
    ["<r></>", "tag mismatch in ", Text.NONE],
    ["<r></r x>", "missing '>' in ", Text.NONE],
    ["<!--x", "premature end (within comment) of ", Text.NONE],
    ["<!--x--x>", 'illegal "--" within comment in ', Text.NONE],
    ["<?x", "bad '<?' in ", Text.NONE],
    ["<!x", "premature end (within DTD) of ", Text.NONE],
    [`<!x "q`, "premature end (within DTD) of ", Text.NONE],
    ["<!x [", "premature end (within DTD) of ", Text.NONE],
    [`<!x ["q`, "premature end (within DTD) of ", Text.NONE],
    ["<!x [<", "premature end (within DTD) of ", Text.NONE],
    ["<!x [] x>", 'missing ">" of DTD in ', Text.NONE],
    ["<![CDATA[x", "premature end (within CDATA section) of ", Text.NONE],
    ["<r>", "premature end of ", Text.Raw],
    ["<r>", "premature end of ", Text.Normalized],
    ["<r>&unknown;</r>", "unknown entity reference in ", Text.Raw],
    ["<r>&am</r>", "unknown entity reference in ", Text.Raw],
    ["<r>&#;</r>", "'&#...' missing ';' in ", Text.Raw],
    ["<r>&#x;</r>", "'&#...' missing ';' in ", Text.Raw],
    ["<r>&#65x</r>", "'&#...' missing ';' in ", Text.Raw],
    ["<r>&#1114112;</r>", "'&#...' too large in ", Text.Raw],
  ] as const) {
    const r = new XmlReader(u("test-url"), new TextEncoder().encode(xml)),
      d = s("initial"),
      id: [number] = [0];
    try {
      for (let i = 0; i < 6; i++) r.nextItem(mode, d, id);
      throw Error("Expected parser failure");
    } catch (error) {
      expect(error).toBeInstanceOf(RuntimeException);
      const msg = (error as RuntimeException).Message;
      let actual = "";
      for (let i = 0; i < msg.getLength(); i++)
        actual += String.fromCharCode(msg.getStr()[i] as number);
      expect(actual).toBe(prefix + "test-url");
    }
  }
});
it("encodes every numeric UTF8 width and rejects invalid XML scalar classes", /** Scalar source classes. @returns Nothing. */ () => {
  for (const cp of [9, 10, 13, 32, 65, 127, 128, 2047, 2048, 55295, 57344, 65533, 65536, 1114111]) {
    const r = new XmlReader(u("numeric"), new TextEncoder().encode("<r>&#" + cp + ";</r>")),
      d = new Span(),
      id: [number] = [0];
    r.nextItem(Text.NONE, d, id);
    expect(r.nextItem(Text.Raw, d, id)).toBe(Result.Text);
    expect(t(d)).toBe(String.fromCodePoint(cp));
  }
  for (const cp of [0, 1, 8, 11, 12, 14, 31, 55296, 56320, 57343, 65534, 65535]) {
    const r = new XmlReader(u("invalid"), new TextEncoder().encode("<r>&#" + cp + ";</r>")),
      d = new Span(),
      id: [number] = [0];
    r.nextItem(Text.NONE, d, id);
    expect(
      /** Reaches the actual reference failure. @returns Event or throws. */ () =>
        r.nextItem(Text.Raw, d, id),
    ).toThrow(RuntimeException);
  }
});
it("preserves native release hex sentinel output and verifies native JS hex classification over all bytes", /** No native debug or undefined-memory outcome claim. @returns Nothing. */ () => {
  for (const digits of ["0", "a", "F", "0123456789abcdefABCDEF", "10ffff"]) {
    const r = new XmlReader(u("hex"), new TextEncoder().encode("<r>&#x" + digits + ";</r>")),
      d = new Span(),
      id: [number] = [0];
    r.nextItem(Text.NONE, d, id);
    expect(r.nextItem(Text.Raw, d, id)).toBe(Result.Text);
    expect(Array.from(d.begin as ArrayLike<number>).slice(0, d.length)).toEqual([
      255, 191, 191, 191,
    ]);
    expect(
      /** Converts the actual invalid reference bytes. @returns Value or throws. */ () =>
        d.convertFromUtf8(),
    ).toThrow(RuntimeException);
  }
  for (let c = 0; c < 256; c++) {
    const actual = Number.parseInt(String.fromCharCode(c), 16);
    const source =
      c >= 48 && c <= 57
        ? c - 48
        : c >= 97 && c <= 102
          ? c - 97 + 10
          : c >= 65 && c <= 70
            ? c - 65 + 10
            : 0xffffffff;
    expect(Number.isNaN(actual) ? 0xffffffff : actual).toBe(source);
  }
});
