/** @fileoverview Original XML rich-string text ownership and attribute conversion into actual Calc model values; full shared-string filter/context/font/phonetic acceptance remains pending. */
import { assert, expect, it } from "vitest";
import { RichString, RichStringPortion } from "../inc/richstring";
import { AttributeList } from "../../../../oox/source/helper/attributelist";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 } from "../../../../oox/source/token/tokenmap";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
it("owns decoded portion values independently of inputs and borrowed output references", /** Uses real SAL owners and retained COW member identity. @returns Nothing. */ () => {
  const portion = new RichStringPortion(),
    input = unicode("A_x0000__xD83D__xDE00_");
  try {
    const borrowed = portion.getText();
    expect(text(borrowed)).toBe("");
    portion.setText(input);
    input.clear();
    expect(portion.getText()).toBe(borrowed);
    expect(text(borrowed)).toBe("A\0😀");
    portion.setText(borrowed);
    expect(text(borrowed)).toBe("A\0😀");
  } finally {
    input.dispose();
    portion.dispose();
  }
});
it("retains ordered text/run portions, empty content and native preserve-space attributes", /** The real model stores concatenated native content; no whole XLSX filter claim. @returns Nothing. */ () => {
  const rich = new RichString(),
    fast = new FastAttributeList(),
    attrs = new AttributeList(fast),
    space = (namespaceTokens.get("xml") as number) | getTokenFromUtf8("space"),
    doc = new ScDocument(),
    sheet = unicode("Sheet1");
  let result = rich.getStringContent();
  try {
    expect(text(result)).toBe("");
    result.dispose();
    const first = rich.importText(attrs);
    expect(first).toBe(0);
    fast.add(space, "preserve");
    const second = rich.importText(attrs);
    expect(second).toBe(1);
    rich.setAttributes(attrs);
    fast.clear();
    fast.add(space, "default");
    rich.setAttributes(attrs);
    fast.clear();
    rich.setAttributes(attrs);
    const third = rich.importRun();
    expect(third).toBe(2);
    const values = [unicode("  A_x0020_"), unicode("B_x0000_"), unicode("_xD83D__xDE00_\n")];
    try {
      for (const [i, value] of values.entries()) rich.getPortion(i).setText(value);
    } finally {
      for (const value of values) value.dispose();
    }
    result = rich.getStringContent();
    expect(text(result)).toBe("  A B\0😀\n");
    doc.InsertTab(0, sheet);
    doc.SetTextCell(new ScAddress(0, 0, 0), result);
    const edit = doc.GetRefCellValue(new ScAddress(0, 0, 0)).getEditText();
    assert(edit !== null);
    expect(edit.GetParagraphCount()).toBe(2);
    const firstText = edit.GetText(0),
      lastText = edit.GetText(1);
    try {
      expect(text(firstText)).toBe("  A B\0😀");
      expect(text(lastText)).toBe("");
    } finally {
      firstText.dispose();
      lastText.dispose();
    }
  } finally {
    result.dispose();
    sheet.dispose();
    rich.dispose();
    doc.Dispose();
  }
});
