/** @fileoverview Native RTF geometry boundaries for optional defaults and wide Word table coordinates. */
import { assert, expect, it } from "vitest";
import { SvxTabAdjust, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { Color } from "../../../../tools/inc/color";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { createWriterDocument } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfExport } from "./rtfexport";

it("omits zero margins and an absent default tab stop from the RTF header", /** Checks actual pool defaults and native page geometry at export. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  try {
    doc.ChgPageDesc({
      ...doc.GetPageDesc().GetValue(),
      leftMargin: 0,
      rightMargin: 0,
      topMargin: 0,
      bottomMargin: 0,
    });
    doc
      .GetAttrPool()
      .SetUserDefaultItem(new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP));
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(doc));
    expect(rtf).not.toMatch(/\\marg[lrbt]sxn/u);
    expect(rtf).not.toContain("\\deftab");
  } finally {
    doc.Dispose();
  }
});

it("falls back to the current native page when a paragraph names an absent descriptor", /** Checks the represented page-reference recovery boundary. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("Missing descriptor");
    paragraph.SetAttr(new SwFormatPageDesc("Absent descriptor"));
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(doc));
    expect(rtf).toContain(`\\pgwsxn${doc.GetPageDesc().GetValue().width}`);
    expect(rtf).toContain("Missing descriptor");
  } finally {
    doc.Dispose();
  }
});

it.each([
  [1, "\\brdrhair\\brdrw1"],
  [600, "\\brdrs\\brdrth\\brdrw300"],
] as const)(
  "exports wide native table coordinates and solid border width %i",
  /** Checks original relative-width admission, minimum row height and top cell orientation. @param borderWidth - Native twips. @param borderControl - Expected RTF controls. @returns Nothing. */ (
    borderWidth,
    borderControl,
  ) => {
    const doc = createWriterDocument();
    try {
      const paragraph = doc.paragraphs[0];
      assert(paragraph);
      doc.ChgPageDesc({
        ...doc.GetPageDesc().GetValue(),
        width: 15000,
        leftMargin: 1000,
        rightMargin: 1000,
      });
      const table = doc.nodes.MakeTableNode("Wide", {}, paragraph);
      const frame = table.GetFrameFormat();
      const size = frame.GetFrameSize().Clone();
      size.SetWidth(40000);
      size.SetWidthPercent(0);
      frame.SetFormatAttr(size);
      const orientation = frame.GetHoriOrient().Clone();
      orientation.SetHoriOrient(HoriOrientation.LEFT);
      frame.SetFormatAttr(orientation);
      const row = doc.nodes.AppendTableRow(table, 2);
      const height = row.GetFrameSize();
      height.SetHeight(720);
      height.SetHeightSizeType(SwFrameSize.Minimum);
      row.GetFrameFormat().SetFormatAttr(height);
      for (const [index, width] of [1800, 3000].entries()) {
        const box = row.GetTabBoxes()[index];
        assert(box);
        const cellSize = box.GetFrameSize();
        cellSize.SetWidth(width);
        box.SetFrameSize(cellSize);
      }
      const first = row.GetTabBoxes()[0];
      assert(first);
      const vertical = first.GetVertOrient();
      vertical.SetVertOrient(VertOrientation.TOP);
      first.ClaimFrameFormat().SetFormatAttr(vertical);
      const border = first.GetBox();
      border.SetLine(
        new SvxBorderLine(new Color(0x123456), borderWidth, BorderLineStyle.SOLID),
        SvxBoxItemLine.TOP,
      );
      first.ClaimFrameFormat().SetFormatAttr(border);
      const bytes = RtfExport.WriteDocument(doc);
      const rtf = new TextDecoder().decode(bytes);
      expect(rtf).toContain("\\trrh720");
      expect(rtf).toContain("\\clvertalt\\cellx585");
      expect(rtf).toContain("\\cellx1560");
      expect(rtf).toContain(borderControl);
      const imported = new RtfDocumentImpl().ResolveBytes(bytes);
      try {
        const restored = imported
          .GetNodes()
          .getBodyContent()
          .find(
            /** Finds the real imported table. @param node - Body owner. @returns Whether a table. */ (
              node,
            ) => node instanceof SwTableNode,
          );
        assert(restored instanceof SwTableNode);
        // Pinned import rounds hairline to two twips and ignores BRDRTH (WRITER120).
        expect(
          restored.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetBox().GetTop()?.GetWidth(),
        ).toBe(borderWidth === 1 ? 2 : borderWidth / 2);
      } finally {
        imported.Dispose();
      }
    } finally {
      doc.Dispose();
    }
  },
);
