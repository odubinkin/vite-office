/** @fileoverview Owns native Writer ASCII text-range iteration from sw/source/filter/ascii/wrtasc.cxx. */
import type { SwPaM } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import type { SwTable } from "../../core/table/swtable";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { OutASC_SwTextNode } from "./ascatr";

/** ASCII writer over connected native text nodes, independent of HTML transfer projections. */
export class SwASCWriter {
  public m_bExportParagraphNumbering = true;
  public m_bWriteClipboardDoc = false;
  public m_bASCII_NoLastLineEnd = false;
  private lineEnd = "\n";

  /** Returns the existing browser UTF8 clipboard paragraph separator. @returns Native LF separator. */
  public GetLineEnd(): string {
    return this.lineEnd;
  }

  /** Writes the full body in native block order, including table cells. @param document - Source model. @returns Filter text. */
  public WriteDocument(document: SwDoc): string {
    const blocks = document.GetNodes().getBodyContent();
    let result = "";
    for (const [index, block] of blocks.entries()) {
      if (block instanceof SwTableNode) {
        result += this.WriteTable(block.GetTable());
      } else {
        result += OutASC_SwTextNode(
          this,
          block,
          0,
          block.Len(),
          index === blocks.length - 1,
          blocks.length === 1,
        );
      }
    }
    return result;
  }

  /** Emits native tab-separated table rows and cell paragraph breaks. @param table - Connected table. @returns Filter text. */
  private WriteTable(table: SwTable): string {
    const previousLineEnd = this.lineEnd;
    this.lineEnd = "";
    try {
      let result = "";
      for (const line of table.GetTabLines()) {
        const boxes = line.GetTabBoxes();
        for (const [boxIndex, box] of boxes.entries()) {
          const paragraphs = box.GetParagraphs();
          for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
            if (paragraphIndex !== 0) result += previousLineEnd;
            result += OutASC_SwTextNode(this, paragraph, 0, paragraph.Len(), true, false);
          }
          if (boxIndex !== boxes.length - 1) result += "\t";
        }
        result += previousLineEnd;
      }
      return result;
    } finally {
      this.lineEnd = previousLineEnd;
    }
  }

  /** Writes the actual original PaM span without changing its persistent endpoints. @param pam - Source native range. @returns Selected ASCII text. */
  public Write(pam: SwPaM): string {
    const first = pam.Start(),
      last = pam.End(),
      firstNode = first.GetNode(),
      lastNode = last.GetNode();
    let result = "";
    for (const node of firstNode
      .GetNodes()
      .entries()
      .slice(first.GetNodeIndex(), last.GetNodeIndex() + 1)) {
      if (!node.IsTextNode()) continue;
      const text = node as SwTextNode;
      result += OutASC_SwTextNode(
        this,
        text,
        node === firstNode ? first.GetContentIndex() : 0,
        node === lastNode ? last.GetContentIndex() : text.Len(),
        node === lastNode,
        firstNode === lastNode,
      );
    }
    return result;
  }
}
