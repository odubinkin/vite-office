/** @fileoverview Native table and paragraph range conversion into anchored text frames from unotext.cxx. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { aFrameFormatSetRange } from "../bastyp/init";
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import type { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFlySplit } from "../../../inc/formatflysplit";
import { SwFormatFollowTextFlow } from "../../../inc/fmtfollowtextflow";
import { SwFormatWrapInfluenceOnObjPos } from "../../../inc/fmtwrapinfluenceonobjpos";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { RES_BREAK, RES_BOX, RES_PAGEDESC, RES_UL_SPACE } from "../../../inc/hintids";
import { MID_ALLOW_OVERLAP } from "../../../inc/unomid";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwNodeRange } from "../../../inc/ndindex";
import { SwPosition } from "../crsr/pam";
import { MakeFlySection } from "../doc/doclay";
import type { SwFlyFrameFormat } from "../layout/atrfrm";
import type { SwTable } from "../table/swtable";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwXText } from "./unotext";
import { unicode } from "./unocrsrhelper";

/** Converts a complete connected Writer table through its enclosing text owner, keeping its original live nodes, cells and marks. @param text - Original text owner. @param table - Connected table selection. @param properties - Native floating table properties. @returns Original registered text frame. */
export function convertTableToSwTextFrame(
  text: SwXText,
  table: SwTable,
  properties: Sequence<PropertyValue>,
): SwFlyFrameFormat {
  const doc = text.GetDoc();
  const nodes = doc.GetNodes();
  const tableNode = table.GetTableNode();
  const section = tableNode.StartOfSectionNode();
  if (tableNode.GetDoc() !== doc || section !== text.GetStartNode())
    throw new Error("Writer table and frame text owners differ.");
  const end = nodes.at(tableNode.EndOfSectionNode().GetIndex() + 1);
  const following = end.GetTextNode();
  const anchor = following ?? nodes.MakeTextNode(end, doc.GetDfltTextFormatColl());
  const position = new SwPosition(anchor);
  const tableFormat = table.GetFrameFormat();
  const values = new SequenceAsHashMap(properties, "PropertyValue");
  const set = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  /** Reads one UNO scalar of the requested width from the original typed frame property map. @param name - Property name. @param type - UNO scalar type. @returns Original scalar or zero when absent. */
  function number(name: string, type: "sal_Int16" | "sal_Int32"): number {
    const key = unicode(name);
    const value = values.getValue(key);
    try {
      const result: [number] = [0];
      value.extract(result, type);
      return result[0];
    } finally {
      key.dispose();
      value.dispose();
    }
  }
  /** Converts a supplied frame measure from UNO units. @param name - Native measure property. @returns Twips. */
  function measure(name: string): number {
    return Number(toTwips(BigInt(number(name, "sal_Int32")), Length.mm100));
  }
  /** Copies one native item into the fly descriptor. @param item - Owned temporary. @returns Nothing. */
  function put(item: SfxPoolItem): void {
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }
  try {
    put(
      new SwFormatHoriOrient(
        measure("HoriOrientPosition"),
        number("HoriOrient", "sal_Int16"),
        number("HoriOrientRelation", "sal_Int16"),
      ),
    );
    put(
      new SwFormatVertOrient(
        measure("VertOrientPosition"),
        number("VertOrient", "sal_Int16"),
        number("VertOrientRelation", "sal_Int16"),
      ),
    );
    const margins = tableFormat.GetLRSpace().Clone();
    margins.SetLeft(SvxIndentValue.twips(measure("LeftMargin")));
    margins.SetRight(SvxIndentValue.twips(measure("RightMargin")));
    put(margins);
    put(new SvxULSpaceItem(measure("TopMargin"), measure("BottomMargin"), RES_UL_SPACE));

    put(new SvxBoxItem(RES_BOX));
    put(new XFillTransparenceItem(number("FillTransparence", "sal_Int32")));
    const size = tableFormat.GetFrameSize();
    const frameSize = new SwFormatFrameSize(SwFrameSize.Variable, size.GetWidth(), 23);
    frameSize.SetWidthPercent(size.GetWidthPercent());
    put(frameSize);
    put(new SwFormatFlySplit(true));
    if (tableNode.FindTableBoxStartNode()) put(new SwFormatFollowTextFlow(true));
    const overlapKey = unicode("AllowOverlap");
    const overlap = values.getValue(overlapKey);
    try {
      if (overlap.hasValue()) {
        const item = new SwFormatWrapInfluenceOnObjPos();
        item.PutValue(overlap, MID_ALLOW_OVERLAP);
        put(item);
      }
    } finally {
      overlapKey.dispose();
      overlap.dispose();
    }

    const fly = MakeFlySection(doc, RndStdIds.FLY_AT_PARA, position, set);
    const start = fly.GetContent().GetContentIdx()?.GetNode();
    if (!start?.IsStartNode()) throw new Error("assert(Writer text-frame start)");
    const bootstrap = nodes.at(start.GetIndex() + 1);
    const range = new SwNodeRange(tableNode, nodes.at(tableNode.EndOfSectionNode().GetIndex() + 1));
    try {
      if (!nodes.MoveNodes(range, bootstrap))
        throw new Error("Writer table could not move to its frame.");
    } finally {
      range.Dispose();
    }
    nodes.RemoveNode(bootstrap.GetIndex(), 1, true);
    const tableMargins = tableFormat.GetLRSpace().Clone();
    try {
      tableMargins.SetLeft(SvxIndentValue.twips(0));
      tableFormat.SetFormatAttr(tableMargins);
    } finally {
      tableMargins.Dispose();
    }
    if (size.GetWidthPercent() !== 0) {
      const tableSize = size.Clone();
      try {
        tableSize.SetWidthPercent(100);
        tableFormat.SetFormatAttr(tableSize);
      } finally {
        tableSize.Dispose();
      }
    }
    for (const which of [RES_BREAK, RES_PAGEDESC]) {
      const item = tableFormat.GetAttrSet().GetItemIfSet(which, false);
      if (item !== undefined) {
        anchor.SetAttr(item);
        tableFormat.ResetFormatAttr(which);
      }
    }
    return fly;
  } finally {
    set.Dispose();
    values.dispose();
    position.Dispose();
  }
}

/** Moves complete converted frame paragraphs while retaining their native nodes, positions and marks. @param first - First paragraph. @param last - Last paragraph. @param items - Original frame properties. @returns Connected text frame. */
export function convertParagraphsToSwTextFrame(
  first: SwTextNode,
  last: SwTextNode,
  items: SfxItemSet,
): SwFlyFrameFormat {
  const doc = first.GetDoc();
  const nodes = first.GetNodes();
  const boundary = nodes.at(last.GetIndex() + 1);
  const anchor =
    boundary.GetTextNode() ?? nodes.MakeTextNode(boundary, doc.GetDfltTextFormatColl());
  const position = new SwPosition(anchor);
  const range = new SwNodeRange(first, anchor);
  const type = RndStdIds.FLY_AT_PARA;
  try {
    for (const format of doc.GetSpzFrameFormats()) {
      const existing = format.GetAnchor();
      const owner = existing.GetAnchorNode();
      const offset = existing.GetAnchorContentOffset();
      if (
        (existing.GetAnchorId() === RndStdIds.FLY_AT_PARA && owner === first) ||
        (existing.GetAnchorId() === RndStdIds.FLY_AT_CHAR &&
          ((owner === first && offset === 0) || (owner === last && offset === last.Len())))
      ) {
        const moved = new SwFormatAnchor(existing);
        try {
          moved.SetAnchor(position);
          format.SetFormatAttr(moved);
        } finally {
          moved.Dispose();
        }
      }
    }
    const page = first.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false);
    if (page) {
      anchor.SetAttr(page);
      first.ResetAttr(RES_PAGEDESC);
    }
    const format = MakeFlySection(doc, type, position, items);
    const section = format.GetContent().GetContentIdx()?.GetNode();
    if (!section?.IsStartNode()) throw new Error("assert(converted Writer paragraph frame)");
    const initial = nodes.at(section.GetIndex() + 1);
    if (!nodes.MoveNodes(range, initial))
      throw new Error("assert(complete Writer frame paragraphs)");
    nodes.RemoveNode(initial.GetIndex(), 1, true);
    return format;
  } finally {
    range.Dispose();
    position.Dispose();
  }
}
