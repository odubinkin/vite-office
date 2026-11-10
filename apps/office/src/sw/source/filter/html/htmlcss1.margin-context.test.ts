/** @fileoverview Original HTML context and numbering margin resolution uses actual parser, contexts and rule formats, preserving the source narrowing noted in WRITER339. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwHTMLParser } from "./swhtml";
import { HTMLAttrContext } from "./htmlctxt";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvStream } from "../../../../tools/source/stream/stream";
import { SwNumRule, SwNumFormat } from "../../core/doc/number";
/** Provides actual source owners without replacing token or result producers. @param run - Native observations. @returns Nothing. */
function inspect(run: (parser: SwHTMLParser) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const p = new SwPosition(node),
    pam = new SwPaM(p),
    parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  p.Dispose();
  try {
    run(parser);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it("preserves unchanged outputs, skipped top contexts and the actual attribute lower bound", /** Nearest changed context wins only above the source attribute boundary. @returns Nothing. */ () =>
  inspect(
    /** Observes real context stack. @param parser - Native parser. @returns Nothing. */ (
      parser,
    ) => {
      const left: [number] = [1],
        right: [number] = [2],
        indent: [number] = [-3];
      parser.GetMarginsFromContext(left, right, indent, true);
      expect([left[0], right[0], indent[0]]).toEqual([1, 2, -3]);
      const outer = new HTMLAttrContext(T.DIVISION_ON),
        inner = new HTMLAttrContext(T.PARABREAK_ON),
        unchanged = new HTMLAttrContext(T.SPAN_ON);
      outer.SetMargins(100, 200, -40);
      inner.SetMargins(300, 400, 50);
      parser.m_aContexts.push(outer, inner, unchanged);
      parser.GetMarginsFromContext(left, right, indent);
      expect([left[0], right[0], indent[0]]).toEqual([300, 400, 50]);
      parser.m_aContexts.pop();
      parser.GetMarginsFromContext(left, right, indent, true);
      expect([left[0], right[0], indent[0]]).toEqual([100, 200, -40]);
      parser.m_nContextStAttrMin = 2;
      parser.GetMarginsFromContext(left, right, indent);
      expect([left[0], right[0], indent[0]]).toEqual([100, 200, -40]);
    },
  ));
it.each([1, 10, 11, 65535])(
  "uses clamped actual numbering level and original overflow behavior at depth%s",
  /** Source TODO overflow is preserved rather than clamped or widened. @param depth - Original uint16 depth. @returns Nothing. */ (
    depth,
  ) =>
    inspect(
      /** Uses actual numbering rule ownership. @param parser - Native importer. @returns Nothing. */ (
        parser,
      ) => {
        const context = new HTMLAttrContext(T.DIVISION_ON);
        context.SetMargins(65530, 123, 77);
        parser.m_aContexts.push(context);
        const rule = new SwNumRule("margins", "label-width-and-position"),
          level = Math.min(depth, 10) - 1,
          format = new SwNumFormat(rule.Get(level));
        format.SetAbsLSpace(20);
        format.SetFirstLineOffset(-40000);
        rule.Set(level, format);
        format.Dispose();
        parser.GetNumInfo().SetNumRule(rule);
        parser.GetNumInfo().SetDepth(depth);
        const left: [number] = [0],
          right: [number] = [0],
          indent: [number] = [0];
        parser.GetMarginsFromContextWithNumberBullet(left, right, indent);
        expect([left[0], right[0], indent[0]]).toEqual([14, 123, 25536]);
        parser.GetNumInfo().Clear();
        rule.Dispose();
      },
    ),
);
