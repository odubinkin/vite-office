/** @fileoverview Native HTML table first-pass cell content traversal from htmltbl.cxx. */
import { SwPoolFormatId, USER_FMT } from "../../../inc/poolfmt";
import { SwTableNode } from "../docnode/node";
import type { SwMinMaxSize } from "../text/itratr.minmax";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwHTMLTableLayout } from "./htmltbl";
import type { SwHTMLTableLayoutCnts } from "./htmltbl.values";

/** Measures a real paragraph, then preserves the source PRE/NOBR rule. @param node - Actual Writer text node. @param index - Actual anchor index. @param noBreak - Whether the content was entirely enclosed in NOBR. @returns Native metrics. */
function lcl_GetMinMaxSize(node: SwTextNode, index: number, noBreak: boolean): SwMinMaxSize {
  const widths = node.GetMinMaxSize(index);
  let style = node.GetFormatColl();
  while ((style.GetPoolFormatId() & USER_FMT) !== 0) {
    const parent = style.DerivedFrom();
    if (parent === undefined) break;
    style = parent;
  }
  return noBreak || style.GetPoolFormatId() === SwPoolFormatId.COLL_HTML_PRE
    ? { minimum: widths.maximum, maximum: widths.maximum, absoluteMinimum: widths.maximum }
    : widths;
}

/** Recalculates the linked content of one cell in document order. @param contents - First shared layout content. @param reference - Original uint8 pass counter. @returns Cell metrics before width options, borders or spacing. */
export function MeasurePass1Contents(
  contents: SwHTMLTableLayoutCnts | null,
  reference: number,
): SwMinMaxSize {
  let minimum = 0;
  let maximum = 0;
  let absoluteMinimum = 0;
  let tableMaximum = 0;
  let tableAbsoluteMinimum = 0;

  /** Recalculates an actual nested table and applies its fixed width policy. @param child - Nested layout owner. @returns Nothing. */
  function measureTable(child: SwHTMLTableLayout): void {
    child.AutoLayoutPass1();
    let max = child.GetMax();
    let absolute = child.GetMin();
    const width = child.GetWidthOption();
    if (!child.HasPercentWidthOption() && width) {
      max = absolute = Math.max(width, absolute);
    }
    tableMaximum = Math.max(tableMaximum, max);
    tableAbsoluteMinimum = Math.max(tableAbsoluteMinimum, absolute);
  }

  for (let content = contents; content !== null; content = content.GetNext()) {
    const start = content.GetStartNode();
    if (start !== null) {
      const nodes = start.GetDoc().GetNodes();
      for (let index = start.GetIndex(); !nodes.at(index).IsEndNode(); ++index) {
        const node = nodes.at(index);
        const text = node.GetTextNode();
        if (text !== null) {
          const widths = lcl_GetMinMaxSize(text, index, content.HasNoBreakTag());
          minimum = Math.max(minimum, widths.minimum);
          maximum = Math.max(maximum, widths.maximum);
          absoluteMinimum = Math.max(absoluteMinimum, widths.absoluteMinimum);
        } else if (node instanceof SwTableNode) {
          const child = node.GetTable().GetHTMLTableLayout();
          if (child !== null) measureTable(child);
          index = node.EndOfSectionIndex();
        }
      }
    } else {
      const child = content.GetTable();
      if (child !== null) measureTable(child);
    }
    content.SetPass1Done(reference);
  }

  maximum = Math.max(maximum, tableMaximum);
  if (tableAbsoluteMinimum > absoluteMinimum) {
    absoluteMinimum = tableAbsoluteMinimum;
    minimum = Math.max(minimum, absoluteMinimum);
    maximum = Math.max(maximum, minimum);
  }
  return { minimum, maximum, absoluteMinimum };
}
