/** @fileoverview Owns native Writer ASCII text-range iteration from sw/source/filter/ascii/wrtasc.cxx. */
import type { SwPaM } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { OutASC_SwTextNode } from "./ascatr";

/** ASCII writer over connected native text nodes, independent of HTML transfer projections. */
export class SwASCWriter {
  public m_bExportParagraphNumbering = true;
  public m_bWriteClipboardDoc = false;
  public m_bASCII_NoLastLineEnd = false;

  /** Returns the existing browser UTF8 clipboard paragraph separator. @returns Native LF separator. */
  public GetLineEnd(): string {
    return "\n";
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
