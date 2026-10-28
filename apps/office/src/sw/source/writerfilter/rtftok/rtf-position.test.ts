/** @fileoverview Native RTF position/vertAlign independence, raw style normalization and final-font mapper resolution on real Writer owners. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import {
  SvxEscapementItem,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_PROP,
} from "../../../../editeng/inc/escapementitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { RES_CHRATR_ESCAPEMENT, RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual document/item owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports through real native property containers and mapper. @param source - RTF bytes as ASCII. @returns Actual model. */
function read(source: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
/** Reads the effective represented native item at the first run. @param doc - Real model. @returns Item projection. */
function position(doc: SwDoc) {
  const paragraph = doc.paragraphs[0];
  assert(paragraph);
  return projectWriterTextRuns(paragraph)[0]?.attributes.escapement;
}
it.each([
  ["up10", DFLT_ESC_AUTO_SUPER],
  ["dn10", DFLT_ESC_AUTO_SUB],
])(
  "deduplicates equal raw character-style and run %s before resolving displacement",
  /** Identical raw values stay inherited even though the style's model value is automatic. @param control - Native position. @param offset - Native automatic value. @returns Nothing. */ (
    control,
    offset,
  ) => {
    const doc = read(
      "{\\rtf1{\\stylesheet{\\s0 Normal;}{\\*\\cs21\\fs40\\" +
        control +
        " Raised;}}\\cs21\\" +
        control +
        "\\fs40 A}",
    );
    expect(position(doc)).toEqual({ offset, height: DFLT_ESC_PROP });
    const style = doc.FindCharFormatByName("Raised");
    assert(style);
    style.SetFormatAttr(new SvxEscapementItem(7, 90, RES_CHRATR_ESCAPEMENT));
    expect(position(doc)).toEqual({ offset: 7, height: 90 });
  },
);
it.each([
  String.raw`\super\up10`,
  String.raw`\up10\super`,
  String.raw`\up10\super\nosupersub`,
  String.raw`\sub\up10`,
])(
  "defers numeric position after the independent vertical alignment: %s",
  /** A later super/sub control never deletes raw position. @param controls - Source order. @returns Nothing. */ (
    controls,
  ) => {
    const doc = read("{\\rtf1\\fs40" + controls + " A}");
    expect(position(doc)).toEqual({ offset: 25, height: 100 });
  },
);
it.each([
  [String.raw`\super\up0`, DFLT_ESC_AUTO_SUPER],
  [String.raw`\up0\sub`, DFLT_ESC_AUTO_SUB],
  [String.raw`\up10\sub\up0`, DFLT_ESC_AUTO_SUB],
])(
  "keeps vertical alignment when the final raw position is zero: %s",
  /** Zero replaces the old raw value but the mapper ignores it; the separate vertAlign survives. @param controls - Source order. @param offset - Expected automatic value. @returns Nothing. */ (
    controls,
    offset,
  ) => {
    expect(position(read("{\\rtf1\\fs40" + controls + " A}"))).toEqual({
      offset,
      height: DFLT_ESC_PROP,
    });
  },
);
it("does not leak a deferred position into the next plain group or paragraph", /** Source stream properties flush once at a nonempty text insertion. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\fs40{\up10 A}B\par C}`);
  expect(
    doc.paragraphs.map(
      /** Reads real text and effective items. @param paragraph - Node. @returns Native run projections. */ (
        paragraph,
      ) =>
        projectWriterTextRuns(paragraph).map(
          /** Exposes actual position by range. @param run - Native run. @returns Text/offset. */ (
            run,
          ) => [run.text, run.attributes.escapement?.offset ?? 0],
        ),
    ),
  ).toEqual([
    [
      ["A", 25],
      ["B", 0],
    ],
    [["C", 0]],
  ]);
});
it("resolves a direct position using the selected character-style font inherited from its parent", /** Repeated raw font values deduplicate away; GetAnyProperty traverses retained parent entries before defaults. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\fs40 Parent;}{\*\cs22\sbasedon21\fs40 Child;}}\cs22\fs40\up6 A}`,
  );
  expect(position(doc)).toEqual({ offset: 15, height: 100 });
  const child = doc.FindCharFormatByName("Child");
  assert(child);
  child.SetFormatAttr(new SvxFontHeightItem(800, 100, RES_CHRATR_FONTSIZE));
  expect(position(doc)).toEqual({ offset: 15, height: 100 });
});
it("resolves a negative paragraph-style position after its inherited font size", /** Negative paragraph position is deferred; positive paragraph position deliberately remains automatic. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0\fs40 Normal;}{\s1\sbasedon0\dn10 Lower;}}\s1 A}`,
  );
  expect(position(doc)).toEqual({ offset: -25, height: 100 });
});
it("ignores the exporter's starred updnprop extension as the pinned writerfilter reader does", /** The writer emits the legacy extension, but the current native reader has no keyword entry for it. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\fs40{\*\updnprop5801}\up10 A}`);
  expect(position(doc)).toEqual({ offset: 25, height: 100 });
});

it.each([
  ["up", 15],
  ["dn", -15],
])(
  "uses the native six-half-point default for an unparameterized %s",
  /** Keyword defaults originate in rtftokenizer.cxx rather than parser font state. @param control - Bare keyword. @param offset - Expected numeric percentage. @returns Nothing. */ (
    control,
    offset,
  ) => {
    expect(position(read("{\\rtf1\\fs40\\" + control + " A}"))).toEqual({ offset, height: 100 });
  },
);
