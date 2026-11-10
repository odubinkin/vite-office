/** @fileoverview Owns native Writer ASCII text-range iteration from sw/source/filter/ascii/wrtasc.cxx. */
import { SwPosition, type SwPaM } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import type { SwNode } from "../../core/docnode/node";
import { SwNodes } from "../../core/docnode/nodes";
import { Point } from "../../../../tools/inc/gen";
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
    const nodes = document.GetNodes();
    const firstBody = nodes.getBodyContent()[0];
    if (!firstBody) return "";
    let first: SwNode = firstBody;
    let endIndex = nodes.GetEndOfContent().GetIndex();
    const formats = document.GetSpzFrameFormats();
    const frameOnly =
      !formats.empty() &&
      first.GetTextNode()?.Len() === 0 &&
      nodes.GetEndOfExtras().GetIndex() + 3 === endIndex &&
      first.GetIndex() === endIndex - 1;
    if (frameOnly) {
      const content = formats.GetFormat(0).GetContent().GetContentIdx()?.GetNode();
      if (!content) return "";
      first = content;
      endIndex = content.EndOfSectionIndex();
    }
    const position = new SwPosition(first);
    let node = first.GetTextNode() ?? this.NextText(position, endIndex);
    const firstText = node;
    let result = "";
    try {
      while (node) {
        const table = node.FindTableNode()?.GetTable();
        if (table && node.GetTableBox()) {
          const rowOutput = this.WriteTable(table, position, node, endIndex);
          result += rowOutput.text;
          node = rowOutput.next;
        } else {
          const current: SwTextNode = node;
          node = this.NextText(position, endIndex);
          result += OutASC_SwTextNode(
            this,
            current,
            0,
            current.Len(),
            !node && !frameOnly,
            current === firstText && !node && !frameOnly,
          );
        }
      }
    } finally {
      position.Dispose();
    }
    return result;
  }

  /** Advances the original text cursor within the selected native range. @param position - Actual cursor. @param endIndex - Selected section boundary. @returns Next selected text node. */
  private NextText(position: SwPosition, endIndex: number): SwTextNode | undefined {
    const next = SwNodes.GoNext(position);
    return next && next.GetIndex() < endIndex ? (next.GetTextNode() ?? undefined) : undefined;
  }

  /** Emits table rows by walking the actual text cursor and comparing original box coordinates. @param table - Connected table. @param position - Actual output cursor. @param first - Current native text. @param endIndex - Selected section boundary. @returns Filter text and the next node. */
  private WriteTable(
    table: SwTable,
    position: SwPosition,
    first: SwTextNode,
    endIndex: number,
  ): { text: string; next: SwTextNode | undefined } {
    const previousLineEnd = this.lineEnd;
    this.lineEnd = "";
    try {
      let text = "";
      let paragraph: SwTextNode | undefined = first;
      for (const line of table.GetTabLines()) {
        const boxes = line.GetTabBoxes();
        for (let index = 0; index < boxes.length && paragraph; ++index) {
          const previous = paragraph.GetTableBox()?.GetCoordinates() ?? new Point();
          text += OutASC_SwTextNode(this, paragraph, 0, paragraph.Len(), true, false);
          paragraph = this.NextText(position, endIndex);
          while (paragraph) {
            const coordinates = paragraph.GetTableBox()?.GetCoordinates();
            if (
              !coordinates ||
              coordinates.X() !== previous.X() ||
              coordinates.Y() !== previous.Y()
            )
              break;
            text +=
              previousLineEnd + OutASC_SwTextNode(this, paragraph, 0, paragraph.Len(), true, false);
            paragraph = this.NextText(position, endIndex);
          }
          if (index + 1 < boxes.length) text += "\t";
        }
        text += previousLineEnd;
      }
      return { text, next: paragraph };
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
