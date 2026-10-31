/** @fileoverview Actual RTF direction flags retain native SPRMs, run-state reset, typed DomainMapper/UNO transport, group/style behavior and Worker document attributes. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RunType, type RtfState } from "./rtfdocumentimpl.context";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { SwDoc } from "../../core/doc/doc";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { RES_FRAMEDIR, RES_PARATR_ADJUST } from "../../../inc/hintids";
import { SvxAdjustItem, SvxAdjust } from "../../../../editeng/inc/adjustitem";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual imported document owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Decodes genuine RTF bytes through the real tokenizer, state, mapper and document pipeline. @param input - Actual RTF source. @returns Canonical imported document. */
function read(input: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
  docs.push(doc);
  return doc;
}
/** Reads actual effective paragraph direction for nonempty source paragraphs. @param doc - Imported model. @returns Effective original item values. */
function modes(doc: SwDoc): number[] {
  return doc.paragraphs
    .filter(
      /** Selects actual text. @param node - Native paragraph. @returns Nonempty. */ (node) =>
        node.Len() > 0,
    )
    .map(
      /** Reads the original item through its real owner. @param node - Native paragraph. @returns Effective direction. */ (
        node,
      ) => {
        const item = node.GetSwAttrSet().Get(RES_FRAMEDIR);
        assert(item instanceof SvxFrameDirectionItem);
        return item.GetValue();
      },
    );
}
it.each([
  ["ltrpar", 0],
  ["rtlpar", 1],
  ["rtlpar0", 1],
  ["ltrpar0", 0],
] as const)(
  "imports native flag %s and ignores a flag's numeric spelling",
  /** RTF flag parameters do not turn rtlpar0 into a toggle. @param flag - Actual lexical control. @param value - Source direction. @returns Nothing. */ (
    flag,
    value,
  ) => {
    expect(modes(read(`{\\rtf1\\ansi\\${flag} text}`))).toEqual([value]);
  },
);
it("resets the actual associated run type and publishes the original paragraph SPRM", /** Observes real AppendText state; no private field or token output is injected. @returns Nothing. */ () => {
  const observations: [RunType, number | undefined][] = [];
  /** Test observer borrows actual parser state and always forwards the native consumer. */
  class Reader extends RtfDocumentImpl {
    /** Borrows the actual lexical state before forwarding unchanged text. @param value - Native decoded text. @param state - Actual group state. @returns Nothing. */
    protected override AppendText(value: string, state: RtfState): void {
      const valueRef = state.paragraphSprms.find(N.LN_CT_PPrBase_bidi);
      try {
        observations.push([state.runType, valueRef.get()?.getInt()]);
      } finally {
        valueRef.dispose();
      }
      super.AppendText(value, state);
    }
  }
  const doc = new Reader().ResolveBytes(new TextEncoder().encode("{\\rtf1\\rtlch\\rtlpar text}"));
  docs.push(doc);
  expect(observations).toContainEqual([RunType.NONE, 1]);
  expect(modes(doc)).toEqual([1]);
});
it("retains independent paragraph flags and source pard reset", /** Paragraph defaults and explicit overrides are supplied by original token/state operations. @returns Nothing. */ () => {
  const doc = read("{\\rtf1\\rtlpar one\\par\\ltrpar two\\par\\pard three}");
  expect(modes(doc)).toEqual([1, 0, 4]);
});
it("restores the actual outer group direction for following paragraphs", /** Scoped source groups must not replace the parent paragraph-SPRM map. @returns Nothing. */ () => {
  const doc = read("{\\rtf1\\rtlpar outer{\\ltrpar inner}tail\\par next}");
  expect(modes(doc).at(-1)).toBe(1);
});
it("inherits native RTL paragraph-style properties and permits explicit LTR override", /** Stylesheet and direct paragraph properties consume the same actual signed-short UNO item. @returns Nothing. */ () => {
  const doc = read(
    "{\\rtf1{\\stylesheet{\\s0 Normal;}{\\s1\\rtlpar RightToLeft;}}\\s1 styled\\par\\ltrpar direct}",
  );
  expect(modes(doc)).toEqual([1, 0]);
});
it("retains source RTF justification instead of applying OOXML BiDi swapping", /** Native DomainMapper excludes its justification rewrite for RTF import. @returns Nothing. */ () => {
  const doc = read("{\\rtf1\\ql\\rtlpar left\\par\\qr\\ltrpar right}");
  expect(modes(doc)).toEqual([1, 0]);
  expect(
    doc.paragraphs
      .filter(
        /** Selects actual text paragraphs. @param node - Native node. @returns Nonempty. */ (
          node,
        ) => node.Len() > 0,
      )
      .map(
        /** Reads effective source adjustment. @param node - Native paragraph. @returns Native enum. */ (
          node,
        ) => (node.GetSwAttrSet().Get(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust(),
      ),
  ).toEqual([SvxAdjust.Left, SvxAdjust.Right]);
});
it("preserves the original direction item through the existing Worker document codec", /** Existing UI transport must retain the real item rather than a parallel style field. @returns Nothing. */ () => {
  const source = read("{\\rtf1\\rtlpar original}");
  const restored = decodeWriterDocument(encodeWriterDocument(source));
  docs.push(restored);
  expect(modes(restored)).toEqual([1]);
});

it.each([
  ["{\\s2\\sbasedon1 Child;}", "\\s2 child", 1],
  ["{\\s2\\sbasedon1\\ltrpar Child;}", "\\s2 child", 0],
  ["{\\s2\\sbasedon1\\ltrpar Child;}", "\\s2\\rtlpar child", 1],
] as const)(
  "retains actual paragraph style inheritance and direct BiDi override for %s/%s",
  /** Original style lookup runs before native RTF insertion even though its justification rewrite is excluded. @param child - Native child style. @param body - Native body controls. @param expected - Source effective mode. @returns Nothing. */ (
    child,
    body,
    expected,
  ) => {
    expect(
      modes(read(`{\\rtf1{\\stylesheet{\\s0 Normal;}{\\s1\\rtlpar Parent;}${child}}${body}}`)),
    ).toEqual([expected]);
  },
);
