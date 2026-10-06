/** @fileoverview Outputs native text-node ASCII numbering and selected text from sw/source/filter/ascii/ascatr.cxx. */
import { GetBulletChar, SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwASCWriter } from "./wrtasc";

/** Writes one native text-node range and its source numbering prefix. @param writer - Native ASCII owner. @param node - Source text node. @param start - Selected UTF16 start. @param end - Selected UTF16 end. @param lastNode - Whether the original native endpoint is this node. @param singleParagraph - Whether the original selection is confined to one node. @returns Native paragraph output. */
export function OutASC_SwTextNode(
  writer: SwASCWriter,
  node: SwTextNode,
  start: number,
  end: number,
  lastNode: boolean,
  singleParagraph: boolean,
): string {
  let result = "";
  const rule = node.GetNumRule();
  if (rule !== undefined && start === 0 && writer.m_bExportParagraphNumbering && !singleParagraph) {
    const outline = rule === node.GetDoc().FindNumRulePtr(SwNumRule.GetOutlineRuleName());
    let indentation = "";
    if (!outline) {
      const skipHeadingIndentation =
        node.GetLeftMarginWithNum() === 0 &&
        node.GetAttrOutlineLevel() > 0 &&
        node.GetLeftMarginForTabCalculation() === 0;
      if (!skipHeadingIndentation)
        for (let level = 0; level <= node.GetActualListLevel(); level++) indentation += "    ";
    }
    let number = node.GetNumString();
    if (number.length === 0 && !outline) {
      if (node.HasBullet() && !node.HasVisibleNumberingOrBullet()) number = " ";
      else if (node.HasBullet())
        number = String.fromCharCode(GetBulletChar(node.GetActualListLevel()));
      else if (!node.HasVisibleNumberingOrBullet()) number = "  ";
    }
    if (indentation.length !== 0 || number.length !== 0) result += indentation + number + " ";
  }
  result += node.GetText().slice(start, end);
  if (
    !lastNode ||
    (!writer.m_bWriteClipboardDoc &&
      !writer.m_bASCII_NoLastLineEnd &&
      start === 0 &&
      end === node.Len())
  )
    result += writer.GetLineEnd();
  return result;
}

// Iteration187 removes serializeWriterClipboardPlainText and its synthetic
// complete-list count/fallback marker contract; historical provenance anchors
// identify that removed responsibility, not a retained compatibility adapter.
