/** @fileoverview Source-based native CSS1 callback, scanner-quirk and expression contract checks for Writer HTML import. */
import { assert, expect, it } from "vitest";
import type { ConstCSS1Selector, ConstCSS1Expression } from "./parcss1.h";
import { CSS1Parser } from "./parcss1";
import { CSS1Token as T, CSS1SelectorType as K, CSS1Selector, CSS1Expression } from "./parcss1.h";
import { Color } from "../../../../tools/inc/color";
/** Original parsed selector/term payloads, read without a CSS AST replacement. */
type Event =
  | Readonly<{ selector: readonly (readonly [K, string])[]; first: boolean }>
  | Readonly<{ property: string; terms: readonly (readonly [T, string, number, number])[] }>;
/** Observes the actual parser's native virtual callbacks. */
class Probe extends CSS1Parser {
  readonly events: Event[] = [];
  /** Runs the protected source style-sheet entry. @param input - Original style element. @returns Actual callbacks. */
  sheet(input: string): readonly Event[] {
    this.ParseStyleSheet(input);
    return this.events;
  }
  /** Runs the protected source inline entry. @param input - Original style option. @returns Actual callbacks. */
  option(input: string): readonly Event[] {
    this.ParseStyleOption(input);
    return this.events;
  }
  /** Records source linked selectors before declaration parsing. @param selector - Actual chain. @param first - Native group marker. @returns Nothing. */
  protected override SelectorParsed(selector: CSS1Selector, first: boolean): void {
    const values: [K, string][] = [];
    for (
      let next: ConstCSS1Selector | undefined = selector;
      next !== undefined;
      next = next.GetNext()
    )
      values.push([next.GetType(), next.GetString()]);
    this.events.push({ selector: values, first });
  }
  /** Records original linked expressions. @param property - Native name. @param expression - Actual term chain. @returns Nothing. */
  protected override DeclarationParsed(property: string, expression: CSS1Expression): void {
    const terms: [T, string, number, number][] = [];
    for (
      let next: ConstCSS1Expression | undefined = expression;
      next !== undefined;
      next = next.GetNext()
    )
      terms.push([next.GetType(), next.GetString(), next.GetNumber(), next.GetOp()]);
    this.events.push({ property, terms });
  }
}
/** Extracts the actual declaration callback. @param event - Original callback. @returns Declaration. */
function declaration(event: Event | undefined): Extract<Event, { property: string }> {
  assert(event && "property" in event);
  return event;
}
/** Returns the actual parsed single term used by color helpers. @param input - Source CSS value. @returns Native expression. */
function expression(input: string): CSS1Expression {
  const event = declaration(new Probe().option("color:" + input)[0]),
    term = event.terms[0];
  assert(term);
  return new CSS1Expression(term[0], term[1], term[2], term[3]);
}

it("ignores complete and unterminated comments while retaining following declarations", /** Verifies native CSS comment scanning. @returns Nothing. */ () => {
  expect(
    new Probe().option("/* * not / yet **/\ncolor:red; width:2PX; height:3IN; margin:4invalid"),
  ).toEqual([
    { property: "color", terms: [[T.IDENT, "red", 0, 0]] },
    { property: "width", terms: [[T.PIXLENGTH, "2", 2, 0]] },
    { property: "height", terms: [[T.LENGTH, "3", 4320, 0]] },
    {
      property: "margin",
      terms: [
        [T.NUMBER, "4", 4, 0],
        [T.IDENT, "invalid", 0, 0],
      ],
    },
  ]);
  expect(new Probe().option("/*unterminated")).toEqual([]);
  expect(new Probe().sheet(" \n<!-- --> \n")).toEqual([]);
  expect(new Probe().sheet("")).toEqual([]);
  expect(new Probe().option("")).toEqual([]);
});
it("preserves ID and descendant class selectors and rejects incomplete selector groups", /** Verifies native linked selectors. @returns Nothing. */ () => {
  expect(new Probe().sheet("#note .child P:before { color:red } ")).toEqual([
    {
      selector: [
        [K.ID, "note"],
        [K.CLASS, "child"],
        [K.ELEMENT, "P"],
        [K.PSEUDO, "before"],
      ],
      first: true,
    },
    { property: "color", terms: [[T.IDENT, "red", 0, 0]] },
  ]);
  for (const text of [
    "#12345 {color:red}",
    "p. {color:red}",
    "p, {color:red}",
    "p {color red}",
    "p {color:}",
    "p: {color:red}",
  ]) {
    const callbacks = new Probe().sheet(text);
    expect(
      callbacks.filter(
        /** Selects declarations with no valid value. @param event - Callback. @returns Whether declaration. */ (
          event,
        ) => "property" in event,
      ),
    ).toHaveLength(text.startsWith("p:") ? 1 : 0);
  }
});
it("skips unknown at-rule strings, escaped quotes and nested groups before valid rules", /** Verifies unknown-rule source lexical protection. @returns Nothing. */ () => {
  for (const rule of [
    "@unknown;",
    '@unknown "{;}";',
    "@unknown 'a\\'b';",
    '@unknown "a\\"b";',
    "@unknown {x:'{';nested:{v:'}'};}",
    "@unknown {v:\\{;}",
  ]) {
    expect(new Probe().sheet(rule + " p {color:red}")).toContainEqual({
      property: "color",
      terms: [[T.IDENT, "red", 0, 0]],
    });
  }
});
it("handles invalid priorities, nested URL parentheses and source-end numeric tokens", /** Verifies declaration lexical boundaries. @returns Nothing. */ () => {
  expect(declaration(new Probe().option("background:url(nested(a)b)")[0]).terms).toEqual([
    [T.URL, "url(nested(a)b)", 0, 0],
  ]);
  expect(declaration(new Probe().option("width:2")[0]).terms).toEqual([[T.NUMBER, "2", 2, 0]]);
  expect(declaration(new Probe().option("width:2 ! ignored")[0]).terms).toEqual([
    [T.NUMBER, "2", 2, 0],
    [T.IDENT, "ignored", 0, 0],
  ]);
  expect(declaration(new Probe().option("width:2 !  \tother")[0]).terms).toEqual([
    [T.NUMBER, "2", 2, 0],
    [T.IDENT, "other", 0, 0],
  ]);
  expect(declaration(new Probe().option("width:2 !interesting")[0]).terms).toEqual([
    [T.NUMBER, "2", 2, 0],
    [T.IDENT, "interesting", 0, 0],
  ]);
});
it("retains native empty virtual callbacks for consumers that only scan styles", /** Verifies base callback implementations. @returns Nothing. */ () => {
  /** Exposes only protected parse entry points. */
  class ScanOnly extends CSS1Parser {
    /** Runs native sheet. @param value - CSS. @returns Nothing. */ run(value: string): void {
      this.ParseStyleSheet(value);
      this.ParseStyleSheet();
    }
    /** Runs native declaration. @param value - CSS. @returns Nothing. */ inline(
      value: string,
    ): void {
      this.ParseStyleOption(value);
    }
  }
  const scan = new ScanOnly();
  scan.run("p{color:red}");
  scan.inline("color:blue");
  expect(expression("#123").GetSLength()).toBe(0);
});
it("retains invalid RGB sentinels and expression replacement ownership", /** Verifies malformed color grammar and reset semantics. @returns Nothing. */ () => {
  const color = new Color(1, 2, 3);
  for (const value of ["xyz(1)", "rgb()", "rgb[1]", "rgba[1]", "rgb(1"]) {
    expect(new CSS1Expression(T.RGB, value, 0).GetColor(color)).toBe(false);
  }
  expect([color.GetRed(), color.GetGreen(), color.GetBlue()]).toEqual([1, 2, 3]);
  const root = new CSS1Expression(T.NUMBER, "old", 2, 47),
    next = new CSS1Expression(T.IDENT, "tail", 0);
  root.SetNext(next);
  root.Set(T.STRING, "#z0", -1.5);
  expect(root.GetNext()).toBeUndefined();
  expect(root.GetOp()).toBe(0);
  expect(root.GetULength()).toBe(0);
  expect(root.GetSLength()).toBe(-2);
  expect(root.GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue()]).toEqual([0, 0, 0]);
  expect(new CSS1Expression(T.HEXCOLOR, "z00", 0).GetColor(color)).toBe(true);
  expect(new CSS1Expression(T.NUMBER, "2", 2).GetColor(color)).toBe(false);
});

it("handles unsupported at-keywords and failed declaration values before subsequent valid properties", /** Verifies parser recovery consumes actual malformed input. @returns Nothing. */ () => {
  expect(new Probe().sheet("@; % p{color:red}")).toContainEqual({
    property: "color",
    terms: [[T.IDENT, "red", 0, 0]],
  });
  expect(new Probe().option("color:red;broken; height:2px")).toEqual([
    { property: "color", terms: [[T.IDENT, "red", 0, 0]] },
    { property: "height", terms: [[T.PIXLENGTH, "2", 2, 0]] },
  ]);
  expect(new Probe().sheet("p{color:red;broken; height:2px")).toContainEqual({
    property: "height",
    terms: [[T.PIXLENGTH, "2", 2, 0]],
  });
  for (const rule of ['@x "a\'b";', String.raw`@x "a\\b";`])
    expect(new Probe().sheet(rule + "p{color:red}")).toContainEqual({
      property: "color",
      terms: [[T.IDENT, "red", 0, 0]],
    });
});
it("clamps integral RGB channels and consumes the distinct RGBA prefix", /** Verifies actual native color bounds. @returns Nothing. */ () => {
  const color = new Color();
  expect(new CSS1Expression(T.RGB, "rgba(-1,999,3,0.5)", 0).GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue(), color.GetAlpha()]).toEqual([
    0, 255, 3, 127,
  ]);
});
