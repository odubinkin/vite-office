/** @fileoverview Native synchronous BuildTable, section, row, cell and caption token loops from htmltab.cxx. */
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { Color } from "../../../../tools/inc/color";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { HtmlOptionId as O, HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import * as H from "../../../inc/hintids";
import { SwNodeRange } from "../../../inc/ndindex";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { aHTMLPAlignTable } from "./swhtml.options";
import { DeleteAttr } from "./swhtml.attr";
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import { HTMLTableCnts } from "./htmltab.contents";
import { CreateHTMLTable } from "./htmltab.read";
import { BeginTableCellContext } from "./htmltab.first";
import { BuildTableColGroup } from "./htmltab.colgroup";
import { BeginTableCaption, EndTableCaption } from "./htmltab.caption";
import { CellSaveStruct } from "./htmltab.cell-save";
import { InsertTableContents, InsertTableSection } from "./htmltab.sections";
import { aHTMLTableVAlignTable } from "./htmltab.options";

/** Borrowed original virtual token consumer. */
type ConsumeToken = (token: T) => void;

const rowGroupStarts = new Set([T.THEAD_ON, T.TBODY_ON, T.TFOOT_ON]);
const rowGroupEnds = new Set([T.THEAD_OFF, T.TBODY_OFF, T.TFOOT_OFF]);
const cellStarts = new Set([T.TABLEHEADER_ON, T.TABLEDATA_ON]);
const cellEnds = new Set([T.TABLEHEADER_OFF, T.TABLEDATA_OFF]);

/** Source alignment from the currently open deferred adjustment item. @param parser - Actual importer. @returns Current native adjustment. */
function CurrentAdjust(parser: SwHTMLParser): A {
  const item = parser.m_xAttrTab.pAdjust[0]?.GetItem();
  return item instanceof SvxAdjustItem ? item.GetAdjust() : A.End;
}

/** Applies the source fallback for text/formatting outside any table cell. @param parser - Actual importer. @param table - Actual current grid. @param token - Filtered lexer token. @param consume - Original virtual consumer. @returns Nothing. */
function TableParentToken(
  parser: SwHTMLParser,
  table: HTMLTable,
  token: T,
  consume: ConsumeToken,
): void {
  // The source handles these through the independent HTML form producer.
  if (token === T.FORM_ON || token === T.FORM_OFF) return;
  if (
    token === T.TEXTTOKEN &&
    (table.GetContext() || !table.HasParentSection()) &&
    parser.aToken === " "
  )
    return;
  const current = parser.m_xTable;
  if (!current) throw new Error("assert(current HTML table)");
  table.MakeParentContents(current);
  consume(token);
}

/** Clears table-local contexts without closing their open attributes into unrelated text. @param parser - Actual importer. @returns Nothing. */
function ClearCellContexts(parser: SwHTMLParser): void {
  while (parser.m_aContexts.length > parser.m_nContextStAttrMin) {
    const context = parser.PopContext();
    if (!context) break;
    for (const attr of context.GetAttrs()) DeleteAttr(parser, attr);
    context.GetAttrs().length = 0;
  }
}

/** Reads and closes the original caption at its own token boundary. @param parser - Actual importer. @param table - Grid owning the caption. @param consume - Original virtual consumer. @param depth - Original table nesting depth. @returns Nothing. */
function BuildTableCaption(
  parser: SwHTMLParser,
  table: HTMLTable,
  consume: ConsumeToken,
  depth: number,
): void {
  const saved = BeginTableCaption(parser, table);
  if (!saved) return;
  try {
    for (let raw = parser.GetNextToken(); parser.IsParserWorking(); raw = parser.GetNextToken()) {
      parser.SaveState(raw);
      const token = parser.FilterToken(raw);
      if (token === T.CAPTION_OFF) break;
      if (
        token === T.TABLE_OFF ||
        token === T.COLGROUP_ON ||
        rowGroupStarts.has(token) ||
        token === T.TABLEROW_ON
      ) {
        parser.SkipToken(-1);
        break;
      }
      if (token === T.TABLE_ON)
        BuildTable(
          parser,
          consume,
          table.GetTableAdjust(true),
          false,
          true,
          parser.m_xTable !== table,
          depth + 1,
        );
      else consume(token);
      if (parser.IsParserWorking()) parser.SaveState(T.NONE);
    }
    EndTableCaption(parser, table, saved);
  } finally {
    saved.SourceDispose();
  }
}

/** Uses the actual nested table result and original parent section chain. @param parser - Actual importer. @param saved - Native cell save. @param consume - Original virtual consumer. @param depth - Original table nesting depth. @returns Nothing. */
function ReadCellSubTable(
  parser: SwHTMLParser,
  saved: CellSaveStruct,
  consume: ConsumeToken,
  depth: number,
): void {
  const outer = parser.m_xTable;
  if (!outer) throw new Error("assert(outer HTML table)");
  const header = saved.IsHeaderCell();
  let force = false;
  if (!saved.IsInSection()) {
    for (const option of parser.GetOptions()) {
      if (option.GetToken() !== O.ALIGN) continue;
      const adjust = option.GetEnum(aHTMLPAlignTable, A.End);
      if (adjust === A.Left || adjust === A.Right)
        saved.AddContents(InsertTableContents(parser, outer, header));
      break;
    }
  } else force = parser.HasCurrentParaFlys(false, true);
  const child = BuildTable(
    parser,
    consume,
    CurrentAdjust(parser),
    header,
    saved.IsInSection(),
    force,
    depth + 1,
  );
  if (!child) return;
  const parentContents = child.GetParentContents();
  if (parentContents) {
    saved.AddContents(parentContents);
    child.SetParentContents(null);
  }
  const caption = child.GetCaptionStartNode();
  if (child.GetContext()) {
    if (caption && child.IsTopCaption()) saved.AddContents(new HTMLTableCnts(caption));
    saved.AddContents(new HTMLTableCnts(child));
    if (caption && !child.IsTopCaption()) saved.AddContents(new HTMLTableCnts(caption));
    saved.ClearIsInSection();
  } else if (caption) {
    saved.AddContents(new HTMLTableCnts(caption));
    saved.ClearIsInSection();
  }
}

/** Reads TD/TH options and body with the original cell-local scopes and unconsumed group boundaries. @param parser - Actual importer. @param table - Actual grid. @param header - TH selector. @param consume - Original virtual consumer. @param depth - Original table nesting depth. @returns Nothing. */
function BuildTableCell(
  parser: SwHTMLParser,
  table: HTMLTable,
  header: boolean,
  consume: ConsumeToken,
  depth: number,
): void {
  const outer = parser.m_xTable;
  if (!outer || outer.IsOverflowing()) return;
  if (!table.GetContext()) BeginTableCellContext(parser, table);
  const saved = new CellSaveStruct(parser, table, header, true);
  try {
    parser.SaveState(T.NONE);
    const point = parser.m_pPam.GetPoint();
    for (let raw = parser.GetNextToken(); parser.IsParserWorking(); raw = parser.GetNextToken()) {
      parser.SaveState(raw);
      const token = parser.FilterToken(raw);
      if (
        cellStarts.has(token) ||
        rowGroupStarts.has(token) ||
        rowGroupEnds.has(token) ||
        token === T.TABLEROW_ON ||
        token === T.TABLEROW_OFF ||
        token === T.TABLE_OFF
      ) {
        parser.SkipToken(-1);
        break;
      }
      if (cellEnds.has(token)) break;
      switch (token) {
        case T.TABLE_ON:
          ReadCellSubTable(parser, saved, consume, depth);
          break;
        case T.NOBR_ON:
          saved.StartNoBreak(point);
          break;
        case T.NOBR_OFF:
          saved.EndNoBreak(point);
          break;
        case T.COMMENT:
          consume(token);
          break;
        default:
          if (!saved.IsInSection()) {
            if (token === T.TEXTTOKEN && parser.aToken === " ") break;
            saved.AddContents(InsertTableContents(parser, outer, header));
          }
          if (parser.IsParserWorking()) consume(token);
          break;
      }
      if (parser.IsParserWorking()) parser.SaveState(T.NONE);
    }
    if (!saved.HasFirstContents()) {
      const start = InsertTableSection(parser, outer, header ? P.COLL_TABLE_HDLN : P.COLL_TABLE);
      const text = start
        ?.GetNodes()
        .at(start.EndOfSectionIndex() - 1)
        .GetTextNode();
      if (!start || !text) parser.eState = S.Error;
      else
        for (const which of [
          H.RES_CHRATR_FONTSIZE,
          H.RES_CHRATR_CJK_FONTSIZE,
          H.RES_CHRATR_CTL_FONTSIZE,
        ])
          text.SetAttr(new SvxFontHeightItem(40, 100, which));
      saved.AddContents(new HTMLTableCnts(start));
      saved.ClearIsInSection();
    }
    if (saved.IsInSection()) {
      saved.CheckNoBreak(point);
      while (parser.m_aContexts.length > parser.m_nContextStAttrMin + 1) {
        const context = parser.PopContext();
        if (!context) break;
        parser.EndContext(context);
      }
      if (
        !parser.StripTrailingLF() &&
        !point.GetContentIndex() &&
        table.GetContext()?.GetPos()?.GetNode() !== point.GetNode()
      )
        parser.StripTrailingPara(outer);
      const context = parser.PopContext();
      if (context) parser.EndContext(context);
    } else ClearCellContexts(parser);
    parser.GetNumInfo().Clear();
    parser.SetAttr(false);
    saved.InsertCell(parser, table);
  } finally {
    saved.SourceDispose();
  }
}

/** Reads one row or the original implied row at a TD/TH boundary. @param parser - Actual importer. @param table - Actual grid. @param readOptions - TR options were consumed. @param adjust - Inherited row-group adjustment. @param vertical - Inherited vertical orientation. @param consume - Original virtual consumer. @param depth - Original table nesting depth. @returns Nothing. */
function BuildTableRow(
  parser: SwHTMLParser,
  table: HTMLTable,
  readOptions: boolean,
  adjust: A,
  vertical: number,
  consume: ConsumeToken,
  depth: number,
): void {
  let id = "",
    image = "",
    style = "",
    className = "";
  let hasColor = false;
  const color = new Color();
  const options = readOptions ? parser.GetOptions() : [];
  for (let index = options.length; index;) {
    const option = options[--index];
    if (!option) throw new Error("assert(HTML row option)");
    switch (option.GetToken()) {
      case O.ID:
        id = option.GetString();
        break;
      case O.ALIGN:
        adjust = option.GetEnum(aHTMLPAlignTable, adjust);
        break;
      case O.VALIGN:
        vertical = option.GetEnum(aHTMLTableVAlignTable, vertical);
        break;
      case O.BGCOLOR:
        if (option.GetString()) {
          option.GetColor(color);
          hasColor = true;
        }
        break;
      case O.BACKGROUND:
        image = option.GetString();
        break;
      case O.STYLE:
        style = option.GetString();
        break;
      case O.CLASS:
        className = option.GetString();
        break;
    }
  }
  if (id) parser.InsertBookmark(id);
  table.OpenRow(adjust, vertical, [
    parser.CreateBrushItem(hasColor ? color : null, image, style, id, className),
  ]);
  let hasCells = false;
  parser.SaveState(T.NONE);
  for (let raw = parser.GetNextToken(); parser.IsParserWorking(); raw = parser.GetNextToken()) {
    parser.SaveState(raw);
    const token = parser.FilterToken(raw);
    if (
      token === T.TABLEROW_ON ||
      token === T.TABLE_OFF ||
      rowGroupStarts.has(token) ||
      rowGroupEnds.has(token) ||
      (token === T.TABLE_ON && !table.GetContext())
    ) {
      parser.SkipToken(-1);
      break;
    }
    if (token === T.TABLEROW_OFF) break;
    if (cellStarts.has(token)) {
      BuildTableCell(parser, table, token === T.TABLEHEADER_ON, consume, depth);
      hasCells = true;
    } else if (token === T.CAPTION_ON) BuildTableCaption(parser, table, consume, depth);
    else if (token === T.COMMENT || token === T.MAP_ON) consume(token);
    else if (
      token !== T.TABLE_ON &&
      !cellEnds.has(token) &&
      token !== T.CAPTION_OFF &&
      token !== T.COLGROUP_ON &&
      token !== T.COLGROUP_OFF &&
      token !== T.COL_ON &&
      token !== T.COL_OFF &&
      token !== T.MULTICOL_ON
    )
      TableParentToken(parser, table, token, consume);
    if (parser.m_xTable?.IsOverflowing()) break;
    if (parser.IsParserWorking()) parser.SaveState(T.NONE);
  }
  table.CloseRow(!hasCells);
}

/** Reads a THEAD/TBODY/TFOOT or the implied original table section. @param parser - Actual importer. @param table - Actual grid. @param readOptions - Group options were consumed. @param header - Repeated-header selector. @param consume - Original virtual consumer. @param depth - Original table nesting depth. @returns Nothing. */
function BuildTableSection(
  parser: SwHTMLParser,
  table: HTMLTable,
  readOptions: boolean,
  header: boolean,
  consume: ConsumeToken,
  depth: number,
): void {
  let adjust = A.End,
    vertical: number = V.TOP;
  const options = readOptions ? parser.GetOptions() : [];
  for (let index = options.length; index;) {
    const option = options[--index];
    if (!option) throw new Error("assert(HTML table section option)");
    switch (option.GetToken()) {
      case O.ID:
        parser.InsertBookmark(option.GetString());
        break;
      case O.ALIGN:
        adjust = option.GetEnum(aHTMLPAlignTable, adjust);
        break;
      case O.VALIGN:
        vertical = option.GetEnum(aHTMLTableVAlignTable, vertical);
        break;
    }
  }
  parser.SaveState(T.NONE);
  for (let raw = parser.GetNextToken(); parser.IsParserWorking(); raw = parser.GetNextToken()) {
    parser.SaveState(raw);
    const token = parser.FilterToken(raw);
    if (
      token === T.TABLE_OFF ||
      rowGroupStarts.has(token) ||
      (token === T.TABLE_ON && !table.GetContext())
    ) {
      parser.SkipToken(-1);
      break;
    }
    if (rowGroupEnds.has(token)) break;
    if (token === T.CAPTION_ON) BuildTableCaption(parser, table, consume, depth);
    else if (token === T.TABLEROW_ON || cellStarts.has(token)) {
      const explicitRow = token === T.TABLEROW_ON;
      if (!explicitRow) parser.SkipToken(-1);
      BuildTableRow(parser, table, explicitRow, adjust, vertical, consume, depth);
    } else if (token !== T.TABLE_ON && token !== T.CAPTION_OFF && token !== T.MULTICOL_ON)
      TableParentToken(parser, table, token, consume);
    if (parser.m_xTable?.IsOverflowing()) break;
    if (parser.IsParserWorking()) parser.SaveState(T.NONE);
  }
  table.CloseSection(header);
}

/** Relocates the actual caption paragraphs and removes the source temporary section. @param parser - Actual importer. @param table - Actual grid. @returns Nothing. */
function FinishCaption(parser: SwHTMLParser, table: HTMLTable): void {
  const caption = table.GetCaptionStartNode();
  if (!caption) return;
  const root = table.GetContext()?.GetTableNode();
  if (root && caption.EndOfSectionIndex() - caption.GetIndex() > 2) {
    const nodes = caption.GetNodes();
    const top = table.IsTopCaption();
    const destination = top ? root : nodes.at(root.EndOfSectionIndex() + 1);
    const range = new SwNodeRange(caption, 1, caption.EndOfSectionNode(), -1);
    try {
      if (!parser.m_xDoc.GetDocumentContentOperationsManager().MoveNodeRange(range, destination))
        throw new Error("assert(HTML caption move)");
      if (top) {
        const format = root.GetTable().GetFrameFormat();
        const page = format.GetAttrSet().GetItemIfSet(H.RES_PAGEDESC, false);
        if (page) {
          range.aStart.GetNode().GetTextNode()?.SetAttr(page);
          format.ResetFormatAttr(H.RES_PAGEDESC);
        }
      }
    } finally {
      range.Dispose();
    }
  }
  parser.m_pPam.SetMark();
  parser.m_pPam.DeleteMark();
  parser.DeleteSection(caption);
  table.SetCaption(null, false);
}

/** Reads the existing page print area or original HTML master-page fallback. @param parser - Actual importer. @returns Original page content width in twips. */
function GetCurrentBrowseWidth(parser: SwHTMLParser): number {
  const page = parser.m_xDoc.getIDocumentLayoutAccess().GetCurrentLayout()?.Lower();
  const actual = page?.getFramePrintArea().Width();
  if (actual) return actual & 65535;
  if (!parser.m_nHTMLPageWidth) {
    const master = parser.m_pCSS1Parser.GetMasterPageDesc().GetMaster();
    const margins = master.GetLRSpace();
    parser.m_nHTMLPageWidth =
      master.GetFrameSize().GetWidth() - margins.ResolveLeft() - margins.ResolveRight();
  }
  return parser.m_nHTMLPageWidth & 65535;
}

/** Original BuildTable drives the inherited lexer and publishes the real model only after grid close. @param parser - Actual importer. @param consume - Original virtual consumer. @param adjust - Inherited adjustment. @param parentHead - Parent heading selector. @param parentSection - Parent section presence. @param force - Native fly admission. @param depth - Source recursion depth. @returns Owned intermediate nested table or null after root materialization. */
function BuildTable(
  parser: SwHTMLParser,
  consume: ConsumeToken,
  adjust: A,
  parentHead: boolean,
  parentSection: boolean,
  force: boolean,
  depth: number,
): HTMLTable | null {
  if (depth > 1024) parser.eState = S.Error;
  if (!parser.IsParserWorking()) return null;
  const previous = parser.m_xTable;
  const table = CreateHTMLTable(parser, adjust, parentHead, parentSection, force);
  let retained = false;
  try {
    for (let raw = parser.GetNextToken(); parser.IsParserWorking(); raw = parser.GetNextToken()) {
      parser.SaveState(raw);
      const token = parser.FilterToken(raw);
      if (token === T.TABLE_OFF) break;
      if (token === T.TABLE_ON && !table.GetContext()) {
        parser.SkipToken(-1);
        break;
      }
      if (token === T.CAPTION_ON) BuildTableCaption(parser, table, consume, depth);
      else if (token === T.COL_ON || token === T.COLGROUP_ON) {
        if (token === T.COL_ON) parser.SkipToken(-1);
        BuildTableColGroup(parser, table, table, token === T.COLGROUP_ON, consume);
      } else if (token === T.TABLEROW_ON || cellStarts.has(token)) {
        parser.SkipToken(-1);
        BuildTableSection(parser, table, false, false, consume, depth);
      } else if (rowGroupStarts.has(token))
        BuildTableSection(parser, table, true, token === T.THEAD_ON, consume, depth);
      else if (token !== T.TABLE_ON && token !== T.MULTICOL_ON)
        TableParentToken(parser, table, token, consume);
      if (parser.m_xTable?.IsOverflowing()) break;
      if (parser.IsParserWorking()) parser.SaveState(T.NONE);
    }
    const context = table.GetContext();
    if (context) {
      table.CloseTable();
      ClearCellContexts(parser);
      parser.m_nContextStMin = context.GetContextStMin();
      parser.m_nContextStAttrMin = context.GetContextStAttrMin();
      if (parser.m_xTable === table) {
        FinishCaption(parser, table);
        table.MakeTable(null, GetCurrentBrowseWidth(parser));
        const saved = context.GetPos();
        if (!saved) throw new Error("assert(HTML table continuation position)");
        parser.m_pPam.GetPoint().Assign(saved);
      }
      parser.GetNumInfo().Set(context.GetNumInfo());
      context.RestorePREListingXMP(parser);
      parser.RestoreAttrTab(context.m_xAttrTab);
      if (parser.m_xTable === table) parser.SetTextCollAttrs();
    } else if (parser.m_xTable === table) FinishCaption(parser, table);
    if (parser.m_xTable === table) return null;
    retained = true;
    return table;
  } finally {
    parser.m_xTable = previous;
    if (!retained) table.SourceDispose();
  }
}

/** Dispatches the original top-level TABLE_ON from SwHTMLParser::NextToken. @param parser - Actual importer. @param consume - Original virtual consumer. @returns Nothing. */
export function ReadHTMLTable(parser: SwHTMLParser, consume: ConsumeToken): void {
  if (parser.m_nOpenParaToken !== T.NONE) parser.EndPara();
  const point = parser.m_pPam.GetPoint();
  if (parser.m_xTable || (!parser.IsNewDoc() && point.GetNode().FindTableNode())) return;
  BuildTable(parser, consume, CurrentAdjust(parser), false, true, false, 1);
}
