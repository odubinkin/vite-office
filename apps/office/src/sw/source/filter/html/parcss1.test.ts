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

it("preserves the original selector groups, expression fields, signed units and predecessor operators", () => {
  const events = new Probe().sheet(
    "H1, P.note:first-letter { margin: -1cm +2em / 3px, -50%; color:#123; }",
  );
  expect(events.slice(0, 2)).toEqual([
    { selector: [[K.ELEMENT, "H1"]], first: true },
    {
      selector: [
        [K.ELEM_CLASS, "P.note"],
        [K.PSEUDO, "first-letter"],
      ],
      first: false,
    },
  ]);
  const margin = declaration(events[2]);
  expect(margin.property).toBe("margin");
  expect(margin.terms).toEqual([
    [T.LENGTH, "1", -72000 / 127, 0],
    [T.EMS, "2", 2, 0],
    [T.PIXLENGTH, "3", 3, 47],
    [T.PERCENTAGE, "50", 50, 44],
  ]);
  expect(declaration(events[3])).toEqual({ property: "color", terms: [[T.HEXCOLOR, "123", 0, 0]] });
});
it("retains import skipping, page pseudo selectors, SGML wrappers and unknown at-rule nesting", () => {
  const events = new Probe().sheet(
    " <!-- @import 'old.css'; @unknown { x:'}'; { x:y } } @page:left { margin:1pt } --> ",
  );
  expect(events).toEqual([
    {
      selector: [
        [K.PAGE, "page"],
        [K.PSEUDO, "left"],
      ],
      first: true,
    },
    { property: "margin", terms: [[T.LENGTH, "1", 20, 0]] },
  ]);
});
it("recovers subsequent vendor-prefixed declarations but returns on an invalid initial property", () => {
  expect(new Probe().option(";;;font-weight:bold; -vendor-x:1px; color:blue")).toEqual([
    { property: "font-weight", terms: [[T.IDENT, "bold", 0, 0]] },
    { property: "color", terms: [[T.IDENT, "blue", 1, 0]] },
  ]);
  expect(new Probe().option("-vendor-x:1px; color:blue")).toEqual([]);
  expect(new Probe().option("width:.5em; color:blue")).toEqual([]);
});
it("retains callback-before-brace timing and source unescaped empty-string scanning", () => {
  expect(new Probe().sheet("h1")).toEqual([{ selector: [[K.ELEMENT, "h1"]], first: true }]);
  expect(new Probe().option('content:""; color:red')).toEqual([
    { property: "content", terms: [[T.STRING, '"; color:red', 0, 0]] },
  ]);
  expect(new Probe().option('content:"')).toEqual([
    { property: "content", terms: [[T.STRING, "\uffff", 0, 0]] },
  ]);
});
it("preserves global six-hex color recognition even where selectors expect identifiers", () => {
  expect(new Probe().sheet(".abcdef { color:red }")).toEqual([
    {
      selector: [
        [K.ELEMENT, "color"],
        [K.PSEUDO, "red"],
      ],
      first: true,
    },
  ]);
  expect(expression("abcdef").GetType()).toBe(T.HEXCOLOR);
  expect(expression("123456").GetType()).toBe(T.HEXCOLOR);
  expect(new Probe().option("color:#abcd")).toEqual([]);
});
it("keeps source numeric/unit whitespace, sign and priority behavior", () => {
  const events = new Probe().option(
    "width:2 cm!important;height:3unknown; padding: 4em 5ex 6in 7mm 8pt 9pc",
  );
  expect(declaration(events[0]).terms).toEqual([[T.LENGTH, "2", 144000 / 127, 0]]);
  expect(declaration(events[1]).terms).toEqual([
    [T.NUMBER, "3", 3, 0],
    [T.IDENT, "unknown", 0, 0],
  ]);
  expect(declaration(events[2]).terms).toEqual([
    [T.EMS, "4", 4, 0],
    [T.EMX, "5", 5, 0],
    [T.LENGTH, "6", 8640, 0],
    [T.LENGTH, "7", 50400 / 127, 0],
    [T.LENGTH, "8", 160, 0],
    [T.LENGTH, "9", 2160, 0],
  ]);
});
it("preserves source URL output and single-quote-only stripping", () => {
  const output = { value: "old" };
  expression("url( ' image.png ' )").GetURL(output);
  expect(output.value).toBe("image.png");
  expression('url( "image.png" )').GetURL(output);
  expect(output.value).toBe('"image.png"');
  output.value = "old";
  expression("url()").GetURL(output);
  expect(output.value).toBe("old");
});
it("uses actual native color fields including source fractional RGB conversion and alpha", () => {
  const color = new Color();
  expect(expression("rgb(-0.5,12.5,0.5)").GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue(), color.GetAlpha()]).toEqual([
    129, 115, 127, 255,
  ]);
  expect(expression("rgb(255 0 0 / 50%)").GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue(), color.GetAlpha()]).toEqual([
    255, 0, 0, 127,
  ]);
  expect(expression("#123").GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue(), color.GetAlpha()]).toEqual([
    17, 34, 51, 127,
  ]);
  expect(expression("unknown-color").GetColor(color)).toBe(false);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue(), color.GetAlpha()]).toEqual([
    17, 34, 51, 127,
  ]);
});
it("retains unpadded eight-hex white blending and subsequent source right padding", () => {
  const color = new Color();
  const value = expression("#0000ffff");
  expect(value.GetString()).toBe("ff");
  expect(value.GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue()]).toEqual([255, 0, 0]);
  expect(expression("#11223344").GetColor(color)).toBe(true);
  expect([color.GetRed(), color.GetGreen(), color.GetBlue()]).toEqual([191, 196, 200]);
});
it("owns and resets native expression fields and length rounding independently of successors", () => {
  const first = new CSS1Expression(T.LENGTH, "1", -1.5, 47),
    second = new CSS1Expression(T.IDENT, "next", 0);
  first.SetNext(second);
  expect(first.GetNext()).toBe(second);
  expect(first.GetULength()).toBe(0);
  expect(first.GetSLength()).toBe(-2);
  first.Set(T.NUMBER, "2", 2.5);
  expect(first.GetNext()).toBeUndefined();
  expect(first.GetOp()).toBe(0);
  expect(first.GetULength()).toBe(3);
  expect(first.GetSLength()).toBe(3);
});
