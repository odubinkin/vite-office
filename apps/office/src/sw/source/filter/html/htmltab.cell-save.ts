/** @fileoverview Original CellSaveStruct from htmltab.cxx consumes actual table, context, style, document number-formatter and no-break section owners. */
import { SectionSaveStruct } from "./htmltab.save";
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import type { HTMLTableCnts } from "./htmltab.contents";
import { HTMLAttrContext } from "./htmlctxt";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { Color } from "../../../../tools/inc/color";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { aHTMLPAlignTable } from "./swhtml.options";
import { aHTMLTableVAlignTable } from "./htmltab.options";
import { GetTableDataOptionsValNum } from "../../../../sfx2/source/bastyp/sfxhtml";
import { CreateBrushItem } from "./htmltab.brush";
import { RES_BOX, RES_PARATR_ADJUST } from "../../../inc/hintids";
import { SwNodeIndex, type SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
/** Original synchronous cell save value: source option defaults, actual nested content chain, no-break position and section-stack snapshot. */
export class CellSaveStruct extends SectionSaveStruct {
  private m_aStyle = "";
  private m_aId = "";
  private m_aClass = "";
  private m_aBGImage = "";
  private readonly m_aBGColor = new Color();
  private m_xBoxItem: SvxBoxItem | null = null;
  private m_xCnts: HTMLTableCnts | null = null;
  private m_pCurrCnts: HTMLTableCnts | null = null;
  private m_oNoBreakEndNodeIndex: SwNodeIndex | null = null;
  private m_nValue = 0;
  private m_nNumFormat = 0;
  private m_nRowSpan = 1;
  private m_nColSpan = 1;
  private m_nWidth = 0;
  private m_nHeight = 0;
  private m_nNoBreakEndContentPos = 0;
  private m_eVertOri: number;
  private readonly m_bHead: boolean;
  private m_bPercentWidth = false;
  private m_bHasNumFormat = false;
  private m_bHasValue = false;
  private m_bBGColor = false;
  private m_bNoWrap = false;
  private m_bNoBreak = false;
  /** Original reverse option parsing creates an actual default TD/TH context after freezing external stacks. Browser normal mode retains the source8192 row-span limit; no fuzzing mode is simulated. @param parser - Native importer/options owner. @param table - Actual current table. @param header - Header selector. @param readOptions - Read actual current tag options. @returns Native save value. */
  constructor(parser: SwHTMLParser, table: HTMLTable, header: boolean, readOptions: boolean) {
    super(parser);
    this.m_bHead = header;
    this.m_eVertOri = table.GetInheritedVertOri();
    let adjust = table.GetInheritedAdjust(),
      number = "",
      value = "",
      language = "",
      direction = "";
    if (readOptions) {
      const options = parser.GetOptions();
      for (let i = options.length; i;) {
        const option = options[--i];
        if (!option) throw new Error("assert(HTML cell option)");
        switch (option.GetToken()) {
          case O.ID:
            this.m_aId = option.GetString();
            break;
          case O.COLSPAN:
            this.m_nColSpan = option.GetNumber() & 65535;
            if (this.m_nColSpan > 256) this.m_nColSpan = 1;
            break;
          case O.ROWSPAN:
            this.m_nRowSpan = option.GetNumber() & 65535;
            if (this.m_nRowSpan > 8192) this.m_nRowSpan = 1;
            break;
          case O.ALIGN:
            adjust = option.GetEnum(aHTMLPAlignTable, adjust);
            break;
          case O.VALIGN:
            this.m_eVertOri = option.GetEnum(aHTMLTableVAlignTable, this.m_eVertOri);
            break;
          case O.WIDTH:
            this.m_nWidth = option.GetNumber() & 65535;
            this.m_bPercentWidth = option.GetString().includes("%");
            if (this.m_bPercentWidth && this.m_nWidth > 100) this.m_nWidth = 100;
            break;
          case O.HEIGHT:
            this.m_nHeight = option.GetNumber() & 65535;
            if (option.GetString().includes("%")) this.m_nHeight = 0;
            break;
          case O.BGCOLOR:
            if (option.GetString()) {
              option.GetColor(this.m_aBGColor);
              this.m_bBGColor = true;
            }
            break;
          case O.BACKGROUND:
            this.m_aBGImage = option.GetString();
            break;
          case O.STYLE:
            this.m_aStyle = option.GetString();
            break;
          case O.CLASS:
            this.m_aClass = option.GetString();
            break;
          case O.LANG:
            language = option.GetString();
            break;
          case O.DIR:
            direction = option.GetString();
            break;
          case O.SDNUM:
            number = option.GetString();
            this.m_bHasNumFormat = true;
            break;
          case O.SDVAL:
            value = option.GetString();
            this.m_bHasValue = true;
            break;
          case O.NOWRAP:
            this.m_bNoWrap = true;
            break;
        }
      }
      if (this.m_aId) parser.InsertBookmark(this.m_aId);
    }
    if (this.m_bHasNumFormat) {
      const format: [number] = [this.m_nNumFormat],
        locale: [number] = [0];
      this.m_nValue = GetTableDataOptionsValNum(
        format,
        locale,
        value,
        number,
        parser.m_xDoc.GetNumberFormatter(),
      );
      this.m_nNumFormat = format[0];
    }
    const context = new HTMLAttrContext(
      header ? T.TABLEHEADER_ON : T.TABLEDATA_ON,
      header ? P.COLL_TABLE_HDLN : P.COLL_TABLE,
      "",
      true,
    );
    if (adjust !== A.End) {
      const item = new SvxAdjustItem(adjust, RES_PARATR_ADJUST);
      try {
        parser.InsertAttr(parser.m_xAttrTab.pAdjust, item, context);
      } finally {
        item.Dispose();
      }
    }
    if (this.m_aStyle || this.m_aId || this.m_aClass || language || direction) {
      const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
      try {
        const info = new SvxCSS1PropertyInfo();
        if (
          parser.ParseStyleOptions(
            this.m_aStyle,
            this.m_aId,
            this.m_aClass,
            items,
            info,
            language,
            direction,
          )
        ) {
          const box = items.GetItemIfSet(RES_BOX, false);
          if (box instanceof SvxBoxItem) {
            this.m_xBoxItem = box.Clone();
            items.ClearItem(RES_BOX);
          }
          parser.InsertAttrs(items, info, context);
        }
      } finally {
        items.Dispose();
      }
    }
    parser.SplitPREListingXMP(context);
    parser.PushContext(context);
  }
  /** Appends the actual content chain and remembers the new chain's first node, as in source. @param contents - Native section or nested-table chain. @returns Nothing. */
  AddContents(contents: HTMLTableCnts): void {
    this.m_pCurrCnts = contents;
    if (this.m_xCnts) this.m_xCnts.Add(contents);
    else this.m_xCnts = contents;
  }
  /** Queries whether the actual first content exists. @returns Native presence. */
  HasFirstContents(): boolean {
    return this.m_xCnts !== null;
  }
  /** Clears only the source current-section marker. @returns Nothing. */
  ClearIsInSection(): void {
    this.m_pCurrCnts = null;
  }
  /** Queries the current-section marker independently from the first contents. @returns Native marker. */
  IsInSection(): boolean {
    return this.m_pCurrCnts !== null;
  }
  /** Queries the original header selector. @returns Header-cell flag. */
  IsHeaderCell(): boolean {
    return this.m_bHead;
  }
  /** Original grid publication retains shared content/brush/box references, then restores section counters after caller-owned context cleanup. @param parser - Actual importer. @param table - Actual current table. @returns Nothing. */
  InsertCell(parser: SwHTMLParser, table: HTMLTable): void {
    const brush = CreateBrushItem(
      parser,
      this.m_bBGColor ? this.m_aBGColor : null,
      this.m_aBGImage,
      this.m_aStyle,
      this.m_aId,
      this.m_aClass,
    );
    table.InsertCell(
      this.m_xCnts,
      this.m_nRowSpan,
      this.m_nColSpan,
      this.m_nWidth,
      this.m_bPercentWidth,
      this.m_nHeight,
      this.m_eVertOri,
      brush,
      this.m_xBoxItem,
      this.m_bHasNumFormat,
      this.m_nNumFormat,
      this.m_bHasValue,
      this.m_nValue,
      this.m_bNoWrap,
    );
    this.Restore(parser);
  }
  /** Original NOBR admission starts before contents or at the first section's first paragraph offset0 only. @param position - Actual document cursor. @returns Nothing. */
  StartNoBreak(position: SwPosition): void {
    const start = this.m_xCnts?.GetStartNode();
    if (
      !this.m_xCnts ||
      (!position.GetContentIndex() &&
        this.m_pCurrCnts === this.m_xCnts &&
        start &&
        start.GetIndex() + 1 === position.GetNodeIndex())
    )
      this.m_bNoBreak = true;
  }
  /** Stores a real node index and content offset for an admitted NOBR close. @param position - Actual cursor. @returns Nothing. */
  EndNoBreak(position: SwPosition): void {
    if (this.m_bNoBreak) {
      this.m_oNoBreakEndNodeIndex?.Dispose();
      this.m_oNoBreakEndNodeIndex = new SwNodeIndex(position.GetNode());
      this.m_nNoBreakEndContentPos = position.GetContentIndex();
      this.m_bNoBreak = false;
    }
  }
  /** Original whole-first-content NOBR test permits one final space or LF, with the actual tracked node identity. @param position - Actual cell-end cursor. @returns Nothing. */
  CheckNoBreak(position: SwPosition): void {
    if (!this.m_xCnts || this.m_pCurrCnts !== this.m_xCnts) return;
    if (this.m_bNoBreak) this.m_xCnts.SetNoBreak();
    else if (this.m_oNoBreakEndNodeIndex?.GetIndex() === position.GetNodeIndex()) {
      if (this.m_nNoBreakEndContentPos === position.GetContentIndex()) this.m_xCnts.SetNoBreak();
      else if (this.m_nNoBreakEndContentPos + 1 === position.GetContentIndex()) {
        const node = position.GetNode();
        if (
          node instanceof SwTextNode &&
          (node.GetText()[this.m_nNoBreakEndContentPos] === " " ||
            node.GetText()[this.m_nNoBreakEndContentPos] === "\n")
        )
          this.m_xCnts.SetNoBreak();
      }
    }
  }
  /** Releases the owned optional no-break endpoint at native cell-save destruction. @returns Nothing. */
  SourceDispose(): void {
    this.m_oNoBreakEndNodeIndex?.Dispose();
    this.m_oNoBreakEndNodeIndex = null;
  }
}
