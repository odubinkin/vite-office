/** @fileoverview Verifies native border joining with adjacent projected paragraphs. */
import { expect, it } from "vitest";
import { SvxBoxItem, SvxBoxItemLine } from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { Color } from "../../../tools/inc/color";
import { RES_BOX } from "../../inc/hintids";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwParaConnectBorderItem } from "../../source/core/para/paratr";
import { projectWriterParagraphBorders } from "./writer-paragraph-border-projection";

it("removes the common top and bottom border only when the preceding paragraph joins", /** Adapts the adjacent border suppression in testTdf134463. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const first = document.paragraphs[0];
    if (!first) throw new Error("Missing body paragraph");
    const second = document.nodes.MakeTextNode();
    const box = new SvxBoxItem(RES_BOX);
    const border = new SvxBorderLine(new Color(0x034793), 10);
    for (const edge of [
      SvxBoxItemLine.TOP,
      SvxBoxItemLine.BOTTOM,
      SvxBoxItemLine.LEFT,
      SvxBoxItemLine.RIGHT,
    ]) {
      box.SetLine(border, edge);
      box.SetDistance(28, edge);
    }
    first.SetAttr(box);
    second.SetAttr(box);
    expect(projectWriterParagraphBorders(first)?.borderBottom).toBeUndefined();
    expect(projectWriterParagraphBorders(second)?.borderTop).toBeUndefined();
    expect(projectWriterParagraphBorders(second)?.borderLeft).toContain("solid");

    first.SetAttr(new SwParaConnectBorderItem(false));
    expect(projectWriterParagraphBorders(first)?.borderBottom).toContain("solid");
    expect(projectWriterParagraphBorders(second)?.borderTop).toContain("solid");
  } finally {
    document.Dispose();
  }
});
