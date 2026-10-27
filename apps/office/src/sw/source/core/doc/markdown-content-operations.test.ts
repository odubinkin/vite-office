/** @fileoverview Verifies native content primitives consumed by the Markdown callback owner. */
import { assert, expect, it } from "vitest";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { Color } from "../../../../tools/inc/color";
import { FontWeight } from "../../../../tools/inc/fontenum";
import {
  RES_BACKGROUND,
  RES_CHRATR_WEIGHT,
  RES_KEEP,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SwPaM, SwPosition } from "../crsr/pam";
import { DontExpandFormat } from "../txtnode/ndtxt-format-change";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { projectWriterTextRuns } from "../txtnode/ndtxt";
import { SwNumRule } from "./number";
import { SwNumRuleItem } from "../para/paratr";
import { SwDoc } from "./doc";

it("appends with the same collection, copied paragraph items and reset break/list continuation defaults", /** Checks the source successor operation rather than text splitting. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node);
  try {
    node.ChgFormatColl(doc.GetTextFormatColl("heading-2"));
    node.SetText("retained");
    node.SetAttr(new SfxBoolItem(RES_KEEP, true));
    const rule = doc.AddNumRule(new SwNumRule("Markdown", "label-width-and-position"));
    node.SetAttr(new SwNumRuleItem(rule.GetName()));
    node.SetAttrListLevel(2);
    node.SetListRestart(true);
    node.SetAttrListRestartValue(4);
    node.SetCountedInList(false);
    doc.GetDocumentContentOperationsManager().AppendTextNode(position);
    const next = doc.paragraphs[1];
    assert(next);
    expect(node.GetText()).toBe("retained");
    expect(next.GetText()).toBe("");
    expect(next.GetTextFormatColl()).toBe(node.GetTextFormatColl());
    expect(next.GetpSwAttrSet()?.GetItemIfSet(RES_KEEP, false)).toBeUndefined();
    // Outline paragraphs deliberately drop their directly assigned rule on append.
    expect(next.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
    expect(next.IsListRestart()).toBe(false);
    expect(next.IsCountedInList()).toBe(true);
    expect(position.GetNode()).toBe(next);
    expect(position.GetContentIndex()).toBe(0);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});

it("stops expansion of an imported whole-paragraph character item at EOF", /** Checks conversion into owned text hints before subsequent insertion. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const pam = new SwPaM(new SwPosition(node));
  try {
    doc.GetDocumentContentOperationsManager().InsertString(pam, "bold");
    node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    expect(DontExpandFormat(node, 4)).toBe(true);
    doc.GetDocumentContentOperationsManager().InsertString(pam, " plain");
    expect(
      projectWriterTextRuns(node).map(
        /** Projects visible callback portions. @param run - Native run. @returns Text/bold. */ (
          run,
        ) => [run.text, run.attributes.bold],
      ),
    ).toEqual([
      ["bold", true],
      [" plain", false],
    ]);
  } finally {
    pam.Dispose();
    doc.Dispose();
  }
});

it("retains a solid native paragraph background through the existing Worker codec", /** Checks actual Which115 brush ownership rather than character highlighting. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  let restored: SwDoc | undefined;
  try {
    node.SetAttr(new SvxBrushItem(new Color(225, 225, 225), RES_BACKGROUND));
    restored = decodeWriterDocument(encodeWriterDocument(doc));
    const item = restored.paragraphs[0]?.GetAttr(RES_BACKGROUND);
    assert(item instanceof SvxBrushItem);
    expect(item.GetColor().toUInt32()).toBe(new Color(225, 225, 225).toUInt32());
  } finally {
    restored?.Dispose();
    doc.Dispose();
  }
});
