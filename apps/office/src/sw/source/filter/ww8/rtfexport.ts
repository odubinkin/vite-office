/** @fileoverview Writer RTF document serialization following sw/source/filter/ww8/rtfexport.cxx. */
import { OutString } from "../../../../filter/source/msfilter/rtfutil";
import { RTL_TEXTENCODING_ASCII_US, type rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { rtl_getTextEncodingFromWindowsCharset } from "../../../../sal/textenc/tencinfo";
import { rtl_TextEncodingToWinCharset } from "./writerwordglue";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { RES_CHRATR_FONT } from "../../../inc/hintids";
import { CharFormat } from "../../core/text/atrstck";
import { SwAttrIter } from "../../core/text/itratr";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import {
  COL_AUTO,
  COL_BLACK,
  COL_BLUE,
  COL_BROWN,
  COL_CYAN,
  COL_GRAY,
  COL_GREEN,
  COL_LIGHTBLUE,
  COL_LIGHTCYAN,
  COL_LIGHTGRAY,
  COL_LIGHTGREEN,
  COL_LIGHTMAGENTA,
  COL_LIGHTRED,
  COL_MAGENTA,
  COL_RED,
  COL_WHITE,
  COL_YELLOW,
  type Color,
} from "../../../../tools/inc/color";
import { SwFrameSize } from "../../../inc/fmtfsize";
import {
  RES_BOX,
  RES_PAGEDESC,
  RES_PARATR_TABSTOP,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import type { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { SwDoc } from "../../core/doc/doc";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { type SwNumRule } from "../../core/doc/number";
import { SwTableNode } from "../../core/docnode/node";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import { equalWriterHyperlinks, type WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { projectWriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { WriterTextRun } from "../basflt/writer-transfer";
import { GetCharacterPropertiesMode, RtfAttributeOutput } from "./rtfattributeoutput";
import { SvStream } from "../../../../tools/source/stream/stream";
import { SwWW8AttrIter } from "./wrtw8nds";
import { MSWordStyles, type wwFont } from "./wrtw8sty";

/** Source `OutColorTable` seeds the 16 MS Word colors before document-owned colors. */
const RTF_DEFAULT_COLORS = [
  COL_BLACK,
  COL_LIGHTBLUE,
  COL_LIGHTCYAN,
  COL_LIGHTGREEN,
  COL_LIGHTMAGENTA,
  COL_LIGHTRED,
  COL_YELLOW,
  COL_WHITE,
  COL_BLUE,
  COL_CYAN,
  COL_GREEN,
  COL_MAGENTA,
  COL_RED,
  COL_BROWN,
  COL_GRAY,
  COL_LIGHTGRAY,
] as const;

/** Writes current-model Writer text, direct character attributes and tables as RTF. */
export class RtfExport extends MSWordExportBase {
  /** Original concrete export-kind identity. @returns Native format. */
  GetExportFormat(): MSWordExportFormat {
    return MSWordExportFormat.RTF;
  }
  private readonly attributeOutput = new RtfAttributeOutput(
    /** Computes the family result. @param family - Family. @returns The computed result. */ (
      family,
    ) => this.IndexFont(family),
    /** Computes the color result. @param color - Color. @returns The computed result. */ (color) =>
      this.IndexColor(color),
    this,
  );
  private readonly colors = new Map<string, number>();

  private readonly m_eDefaultEncoding = rtl_getTextEncodingFromWindowsCharset(
    rtl_TextEncodingToWinCharset(RTL_TEXTENCODING_ASCII_US),
  );
  private m_eCurrentEncoding = this.m_eDefaultEncoding;
  private stream = new SvStream(new Uint8Array(), this.m_eDefaultEncoding);

  /** Native consumed constructor uses the common document/range owners and original RTF font flags. @param document - Actual document. @param current - Current selection binding. @param original - Original selection. @returns RTF exporter. */
  constructor(document: SwDoc, current: SwPaM, original: SwPaM) {
    super(document, current, original);
    this.m_bSubstituteBullets = false;
    this.m_aFontHelper.m_bLoadAllFonts = true;
  }

  /** Existing browser full-document bridge owns and releases the actual temporary selections around the source exporter. @param document - Actual document. @returns RTF bytes. */
  static WriteDocument(document: SwDoc): Uint8Array {
    const nodes = document.GetNodes().getTextNodes();
    const first = nodes[0] ?? document.GetNodes().GetEndOfContent();
    const last = nodes.at(-1) ?? first;
    const point = new SwPosition(first);
    const mark = new SwPosition(last, last.IsTextNode() ? (last as SwTextNode).Len() : 0);
    const range = new SwPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    const exporter = new RtfExport(document, range, range);
    try {
      return exporter.ExportDocument();
    } finally {
      exporter.Dispose();
      range.Dispose();
    }
  }

  private readonly m_aStyTable = new Map<number, string>();
  /** Native insertion keeps the first style property string. @param id - Native slot. @param properties - Property controls without wrapper/name. @returns Nothing. */
  InsStyle(id: number, properties: string): void {
    if (!this.m_aStyTable.has(id & 0xffff)) this.m_aStyTable.set(id & 0xffff, properties);
  }
  /** Original borrowed property lookup. @param id - Native slot. @returns Cached controls or null binding. */
  GetStyle(id: number): string | undefined {
    return this.m_aStyTable.get(id & 0xffff);
  }
  /** Original color-table emission over this slice's pre-collected colors. Remaining native item collectors stay explicit in the capability audit. @returns Nothing. */
  OutColorTable(): void {
    this.Strm().WriteChar(";");
    for (const color of this.colors.keys())
      this.Strm().WriteOString(
        `\\red${Number.parseInt(color.slice(1, 3), 16)}\\green${Number.parseInt(color.slice(3, 5), 16)}\\blue${Number.parseInt(color.slice(5, 7), 16)};`,
      );
  }
  /** Actual RTF implementation of the native attribute-output virtual. @returns Output owner. */
  AttrOutput(): RtfAttributeOutput {
    return this.attributeOutput;
  }
  /** Original reverse used-rule registration pass; GetNumberingId does not insert or prune rules. @returns Nothing. */
  BuildNumbering(): void {
    const outline = this.m_rDoc.GetOutlineNumRule();
    if (IsExportNumRule(outline)) this.GetNumberingId(outline);
    const rules = this.m_rDoc.GetNumRuleTable();
    for (let index = rules.length; index;) {
      const rule = rules[--index] as SwNumRule;
      if (this.m_rDoc.IsUsed(rule) && IsExportNumRule(rule)) this.GetNumberingId(rule);
    }
  }
  /** Writes the native abstract and concrete tables. Picture brushes are outside the admitted core model. @returns Nothing. */
  WriteNumbering(): void {
    if (this.m_pUsedNumTable === undefined) return;
    this.Strm().WriteOString("{\\*\\listtable");
    AbstractNumberingDefinitions(this);
    this.Strm().WriteOString("}{\\listoverridetable");
    NumberingDefinitions(this);
    this.Strm().WriteChar("}");
  }
  /** Original export stream getter. @returns Actual memory stream. */
  public Strm(): SvStream {
    return this.stream;
  }

  /** Original default encoding getter. @returns Native default encoding. */
  public GetDefaultEncoding(): rtl_TextEncoding {
    return this.m_eDefaultEncoding;
  }
  /** Original current encoding getter. @returns Native current encoding. */
  public GetCurrentEncoding(): rtl_TextEncoding {
    return this.m_eCurrentEncoding;
  }
  /** Original current encoding setter. @param encoding - Native encoding ID. @returns Nothing. */
  public SetCurrentEncoding(encoding: rtl_TextEncoding): void {
    this.m_eCurrentEncoding = encoding & 0xffff;
  }

  /** Exports the complete represented document from the actual native owner. @returns RTF bytes. */
  public ExportDocument(): Uint8Array {
    const document = this.m_rDoc;
    this.SetCurrentEncoding(this.GetDefaultEncoding());
    this.m_aFontHelper.InitFontTable(this);
    this.stream = new SvStream(new Uint8Array(), this.GetDefaultEncoding());
    this.colors.clear();
    for (const color of RTF_DEFAULT_COLORS) this.IndexColor(rtfColorKey(color));
    const styleTable = new MSWordStyles(this);
    this.m_pStyles = styleTable;
    const blocks = document.GetNodes().getBodyContent();
    for (const node of document.GetNodes().entries()) {
      if (!node.IsTextNode()) continue;
      for (const run of this.GetTextRuns(node as SwTextNode)) {
        if (run.attributes.color !== undefined && run.attributes.color !== "auto")
          this.IndexColor(run.attributes.color);
        if (run.attributes.underlineColor !== undefined && run.attributes.underlineColor !== "auto")
          this.IndexColor(run.attributes.underlineColor);
      }
      const paragraph = node as SwTextNode;
      this.IndexBoxColors(paragraph.GetAttr(RES_BOX) as SvxBoxItem);
    }
    for (const style of styleTable.GetStyles()) {
      if (!(style instanceof SwTextFormatColl)) continue;
      this.IndexBoxColors(style.GetAttrSet().Get(RES_BOX) as SvxBoxItem);
      const attributes = projectWriterCharacterAttributes(style.GetAttrSet());
      if (attributes.color !== undefined && attributes.color !== "auto")
        this.IndexColor(attributes.color);
      if (attributes.underlineColor !== undefined && attributes.underlineColor !== "auto")
        this.IndexColor(attributes.underlineColor);
    }
    for (const block of blocks) {
      if (!(block instanceof SwTableNode)) continue;
      for (const row of block.GetTable().GetTabLines())
        for (const cell of row.GetTabBoxes()) {
          const box = cell.GetFormat().box;
          if (box !== undefined) this.IndexBoxColors(box);
        }
    }
    // Source OutColorTable visits native character items before attribute callbacks.
    document.ForEachCharacterColorItem(
      /** Registers native character colors before writing the header. @param item - Borrowed item. @returns Continue. */ (
        item,
      ) => {
        if (!item.GetValue().equals(COL_AUTO)) this.IndexColor(rtfColorKey(item.GetValue()));
        return true;
      },
    );
    document.ForEachCharacterUnderlineItem(
      /** Registers native underline colors before attribute output. @param item - Borrowed item. @returns Continue. */ (
        item,
      ) => {
        if (!item.GetColor().equals(COL_AUTO)) this.IndexColor(rtfColorKey(item.GetColor()));
        return true;
      },
    );
    const defaultFont = document
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(RES_CHRATR_FONT) as SvxFontItem;
    this.Strm().WriteOString(
      `{\\rtf1\\ansi\\deff${this.m_aFontHelper.GetId(defaultFont)}\\adeflang1025`,
    );
    this.Strm().WriteOString("{\\fonttbl");
    this.m_aFontHelper.WriteFontTable(this.attributeOutput);
    this.Strm().WriteChar("}");
    this.attributeOutput.StartStyles();
    for (const [index, style] of styleTable.GetStyles().entries()) {
      if (style === undefined) {
        this.attributeOutput.DefaultStyle();
        continue;
      }
      const paragraph = style instanceof SwTextFormatColl;
      const base =
        style.DerivedFrom() === undefined ? 0x0fff : styleTable.GetSlot(style.DerivedFrom());
      const next = styleTable.GetSlot(paragraph ? style.GetNextTextFormatColl() : style);
      this.attributeOutput.StartStyle(
        styleTable.GetWWName(style),
        paragraph ? StyleType.STYLE_TYPE_PARA : StyleType.STYLE_TYPE_CHAR,
        base,
        next,
        0x0fff,
        MSWordStyles.GetWWId(style),
        index,
        false,
      );
      const properties =
        (paragraph ? this.attributeOutput.WriteStyleParagraphProperties(style) : "") +
        this.attributeOutput.WriteNativeCharacter(style.GetAttrSet());
      this.attributeOutput.EndStyle(properties);
    }
    this.attributeOutput.EndStyles(styleTable.GetStyles().length);
    let output = "";
    this.BuildNumbering();
    this.WriteNumbering();
    const defaultTabs = document
      .GetTextFormatColl("default")
      .GetAttrSet()
      .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
    if (defaultTabs.Count() > 0) output += `\\deftab${defaultTabs.At(0).GetTabPos()}`;
    output += this.WriteInitialPageDescription(document, blocks[0]);
    output += "\n";
    let currentPage = this.ResolvePageDescription(document, blocks[0]);
    let previousPageDesc: SwPageDesc | undefined;
    for (const [blockIndex, block] of blocks.entries()) {
      if (blockIndex > 0) {
        const item = this.GetDirectPageDescriptionItem(block);
        if (item !== undefined) {
          const page = document.FindPageDesc(item.GetPageDescName()) ?? currentPage;
          if (currentPage.GetFollow() !== page) {
            const section = this.WriteLaterSection(page, item.GetNumOffset());
            output += section.output;
            currentPage = section.currentPage;
          } else currentPage = page;
        }
      }
      if (block instanceof SwTableNode) {
        for (const row of block.GetTable().GetTabLines()) {
          const boxes = row.GetTabBoxes();
          const tableFormat = block.GetTable().GetFrameFormat();
          const rowFormat = row.GetFrameFormat();
          const orientation = tableFormat.GetHoriOrient().GetHoriOrient();
          const tableLeft = tableFormat.GetLRSpace().ResolveLeft();
          output += "\\trowd";
          if (orientation === HoriOrientation.CENTER) output += "\\trqc";
          else if (orientation === HoriOrientation.RIGHT) output += "\\trqr";
          else {
            output += "\\trql";
            if (
              orientation === HoriOrientation.NONE ||
              orientation === HoriOrientation.LEFT_AND_WIDTH
            )
              output += `\\trleft${tableLeft}`;
          }
          // TableDefinition emits orientation, resolved frame direction, height,
          // then row splitting. The current table frame has no direction item.
          output += "\\ltrrow";
          const rowSize = rowFormat.GetFrameSize();
          if (rowSize.GetHeight() !== 0 && rowSize.GetHeightSizeType() !== SwFrameSize.Variable)
            output += `\\trrh${rowSize.GetHeightSizeType() === SwFrameSize.Fixed ? -rowSize.GetHeight() : rowSize.GetHeight()}`;
          if (!rowFormat.GetRowSplit().GetValue()) output += "\\trkeep";
          const tableBox = tableFormat.GetBox();
          for (const [edge, unitControl, valueControl] of [
            [SvxBoxItemLine.TOP, "trpaddft", "trpaddt"],
            [SvxBoxItemLine.LEFT, "trpaddfl", "trpaddl"],
            [SvxBoxItemLine.BOTTOM, "trpaddfb", "trpaddb"],
            [SvxBoxItemLine.RIGHT, "trpaddfr", "trpaddr"],
          ] as const)
            output += `\\${unitControl}3\\${valueControl}${tableBox.GetDistance(edge)}`;
          const nativeWidths = boxes.map(
            /** Computes the box result. @param box - Box. @returns The computed result. */ (box) =>
              box.GetFrameSize().GetWidth(),
          );
          const hasNativeWidths = nativeWidths.every(
            /** Computes the width result. @param width - Width. @returns The computed result. */ (
              width,
            ) => width > 0,
          );
          const tableSize = tableFormat.GetFrameSize();
          const tableWidth = tableSize.GetWidth();
          // GetTablePageSize supplies SwWriteTable's target width; its base is
          // the table frame width, not the sum of this row's cell widths.
          let widthPercent = tableSize.GetWidthPercent();
          if (orientation === HoriOrientation.FULL || orientation === HoriOrientation.NONE)
            widthPercent = 100;
          const relative = widthPercent !== 0 || (tableWidth > 32767 && widthPercent === 0);
          const page = this.ResolvePageDescription(document, block).GetValue();
          const pageWidth = page.width - page.leftMargin - page.rightMargin;
          const targetWidth = relative
            ? widthPercent === 0
              ? pageWidth
              : Math.trunc((pageWidth * widthPercent) / 100)
            : tableWidth;
          const widthRatio = hasNativeWidths && tableWidth > 0 ? targetWidth / tableWidth : 1;
          let right = 0;
          for (const [index, width] of nativeWidths.entries()) {
            const box = boxes[index]?.GetFormat().box;
            if (box !== undefined)
              for (const [edge, control] of [
                [SvxBoxItemLine.TOP, "clbrdrt"],
                [SvxBoxItemLine.LEFT, "clbrdrl"],
                [SvxBoxItemLine.BOTTOM, "clbrdrb"],
                [SvxBoxItemLine.RIGHT, "clbrdrr"],
              ] as const)
                output += this.attributeOutput.OutTBLBorderLine(control, box.GetLine(edge));
            if (box !== undefined)
              for (const [edge, unitControl, valueControl] of [
                [SvxBoxItemLine.TOP, "clpadfl", "clpadl"],
                [SvxBoxItemLine.LEFT, "clpadft", "clpadt"],
                [SvxBoxItemLine.BOTTOM, "clpadfb", "clpadb"],
                [SvxBoxItemLine.RIGHT, "clpadfr", "clpadr"],
              ] as const) {
                const distance = box.GetDistance(edge);
                if (distance > 0) output += `\\${unitControl}3\\${valueControl}${distance}`;
              }
            const vertical = boxes[index]?.GetFormat().vertOrient?.GetVertOrient();
            if (vertical !== undefined)
              output +=
                vertical === VertOrientation.CENTER
                  ? "\\clvertalc"
                  : vertical === VertOrientation.BOTTOM
                    ? "\\clvertalb"
                    : "\\clvertalt";
            right += hasNativeWidths ? width : 1440;
            output += `\\cellx${tableLeft + Math.round(right * widthRatio)}`;
          }
          for (const box of boxes) {
            for (const [paragraphIndex, paragraph] of box.GetParagraphs().entries()) {
              if (paragraphIndex > 0) output += "\\par ";
              output += `\\pard\\intbl ${this.WriteParagraph(paragraph)}`;
            }
            output += "\\cell ";
          }
          output += "\\row\n";
        }
      } else {
        const result = this.WriteTextNode(document, block, currentPage, previousPageDesc);
        output += result.output;
        currentPage = result.currentPage;
        const next = blocks[blockIndex + 1];
        if (next !== undefined && !(next instanceof SwTableNode))
          previousPageDesc = this.ResolvePageDescription(document, next);
      }
    }
    output += "}";
    this.Strm().WriteOString(output);
    return this.Strm().GetData();
  }

  /** Emits the first native page descriptor as global paper and first-section controls.  @param document - Document. @param firstBlock - First Block. @returns The string result. */
  private WriteInitialPageDescription(
    document: SwDoc,
    firstBlock: SwTextNode | SwTableNode | undefined,
  ): string {
    const pageItem = firstBlock === undefined ? undefined : this.GetPageDescriptionItem(firstBlock);
    const page = this.ResolvePageDescription(document, firstBlock);
    let output = "";
    if (pageItem !== undefined && pageItem.GetPageDescName().length > 0) {
      for (let index = 0; index < document.GetPageDescCnt(); index++)
        if (document.GetPageDesc(index) === page) {
          output += `{\\*\\pgdscno${index}}`;
          break;
        }
    }
    const value = page.GetValue();
    if (value.landscape) output += "\\landscape";
    output += `\\paperh${value.height}\\paperw${value.width}`;
    output += `\\margl${value.leftMargin}\\margr${value.rightMargin}`;
    output += `\\margt${value.topMargin}\\margb${value.bottomMargin}`;
    output += "\\sectd\\sbknone\\sectunlocked1";
    output += this.WriteSectionPageDescription(page);
    return output;
  }

  /** Mirrors OutPageDescription for the currently represented physical page fields.  @param page - Page. @param titlePage - Title Page. @returns The string result. */
  private WriteSectionPageDescription(page: SwPageDesc, titlePage = true): string {
    const follow = page.GetFollow();
    const value = titlePage ? follow.GetValue() : page.GetValue();
    let output = "";
    if (value.landscape) output += "\\lndscpsxn";
    output += `\\pgwsxn${value.width}\\pghsxn${value.height}`;
    if (value.leftMargin !== 0) output += `\\marglsxn${value.leftMargin}`;
    if (value.rightMargin !== 0) output += `\\margrsxn${value.rightMargin}`;
    if (value.topMargin !== 0) output += `\\margtsxn${value.topMargin}`;
    if (value.bottomMargin !== 0) output += `\\margbsxn${value.bottomMargin}`;
    if (titlePage && follow !== page) output += "\\titlepg";
    return output;
  }

  /** Projects the represented physical tests in IsPlausableSingleWordSection.  @param page - Page. @returns The boolean result. */
  private IsSingleWordSectionPageChain(page: SwPageDesc): boolean {
    const follow = page.GetFollow();
    if (follow === page || follow.GetFollow() !== follow) return false;
    return this.IsPlausibleSingleWordSection(page, follow);
  }

  /** Projects the physical fields tested by the pinned section plausibility helper.  @param page - Page. @param follow - Follow. @returns The boolean result. */
  private IsPlausibleSingleWordSection(page: SwPageDesc, follow: SwPageDesc): boolean {
    const first = page.GetValue(),
      next = follow.GetValue();
    return (
      first.width === next.width &&
      first.height === next.height &&
      first.leftMargin === next.leftMargin &&
      first.rightMargin === next.rightMargin &&
      first.topMargin === next.topMargin &&
      first.bottomMargin === next.bottomMargin
    );
  }

  /** Emits section properties through the shared later-page path.  @param page - Page. @param restart - Restart. @returns The { output: string; currentPage: SwPageDesc } result. */
  private WriteLaterSection(
    page: SwPageDesc,
    restart?: number,
  ): { output: string; currentPage: SwPageDesc } {
    const titlePage = this.IsSingleWordSectionPageChain(page);
    const currentPage = titlePage ? page.GetFollow() : page;
    let output = "\\sect\\sectd\\sectunlocked1";
    output += this.WriteSectionPageDescription(currentPage, false);
    if (restart !== undefined) output += `\\pgnstarts${restart}\\pgnrestart`;
    if (titlePage) output += "\\titlepg";
    output += "\\sbkpage\n";
    return { output, currentPage };
  }

  /** Splits a native text node only for a real follow-style section transition.  @param document - Document. @param paragraph - Paragraph. @param currentPage - Current Page. @param previousPageDesc - Previous Page Desc. @returns The { output: string; currentPage: SwPageDesc } result. */
  private WriteTextNode(
    document: SwDoc,
    paragraph: SwTextNode,
    currentPage: SwPageDesc,
    previousPageDesc: SwPageDesc | undefined,
  ): { output: string; currentPage: SwPageDesc } {
    const positions = [
      ...new Set(
        document
          .GetIDocumentMarkAccess()
          .GetSoftPageBreaks()
          .filter(
            /** Computes the position result. @param position - Position. @returns The computed result. */ (
              position,
            ) => position.GetNode() === paragraph,
          )
          .map(
            /** Computes the position result. @param position - Position. @returns The computed result. */ (
              position,
            ) => position.GetContentIndex(),
          )
          .filter(
            /** Computes the offset result. @param offset - Offset. @returns The computed result. */ (
              offset,
            ) => offset > 0 && offset < paragraph.GetText().length,
          ),
      ),
    ].sort(
      /** Computes the a result. @param a - A. @param b - B. @returns The computed result. */ (
        a,
        b,
      ) => a - b,
    );
    const follow = currentPage.GetFollow();
    if (
      positions.length === 0 ||
      follow === currentPage ||
      this.IsPlausibleSingleWordSection(currentPage, follow)
    )
      return { output: `\\pard${this.WriteParagraph(paragraph)}\\par\n`, currentPage };
    let output = "";
    let start = 0;
    for (const offset of positions) {
      const nextPage = currentPage.GetFollow();
      if (nextPage === currentPage) break;
      output += `\\pard${this.WriteParagraph(paragraph, start, offset)}\\par\n`;
      if (previousPageDesc?.GetFollow() !== nextPage)
        output += this.WriteLaterSection(nextPage).output;
      currentPage = nextPage;
      start = offset;
    }
    output += `\\pard${this.WriteParagraph(paragraph, start)}\\par\n`;
    return { output, currentPage };
  }

  /** Reads the item set selected by upstream GetSwAttrSet for the initial page.  @param block - Block. @returns The SwFormatPageDesc | undefined result. */
  private GetPageDescriptionItem(block: SwTextNode | SwTableNode): SwFormatPageDesc | undefined {
    const set =
      block instanceof SwTableNode
        ? block.GetTable().GetFrameFormat().GetAttrSet()
        : block.GetSwAttrSet();
    return set.Get(RES_PAGEDESC) as SwFormatPageDesc;
  }

  /** Reads only a block's authored item, as OutputSectionBreaks receives GetpSwAttrSet.  @param block - Block. @returns The SwFormatPageDesc | undefined result. */
  private GetDirectPageDescriptionItem(
    block: SwTextNode | SwTableNode,
  ): SwFormatPageDesc | undefined {
    const set =
      block instanceof SwTableNode
        ? block.GetTable().GetFrameFormat().GetAttrSet()
        : block.GetpSwAttrSet();
    return set?.GetItemIfSet(RES_PAGEDESC, false) as SwFormatPageDesc | undefined;
  }

  /** Resolves the first layout descriptor through the represented document page table.  @param document - Document. @param block - Block. @returns The SwPageDesc result. */
  private ResolvePageDescription(
    document: SwDoc,
    block: SwTextNode | SwTableNode | undefined,
  ): SwPageDesc {
    const pageItem = block === undefined ? undefined : this.GetPageDescriptionItem(block);
    return (
      (pageItem === undefined ? undefined : document.FindPageDesc(pageItem.GetPageDescName())) ??
      document.GetPageDesc()
    );
  }

  /** Serializes one paragraph's represented properties and text runs. @param paragraph - Native paragraph. @returns RTF body.  @param start - Start. @param end - End. */
  private WriteParagraph(
    paragraph: SwTextNode,
    start = 0,
    end = paragraph.GetText().length,
  ): string {
    let output = `\\s${this.GetId(paragraph.GetFormatColl() as SwTextFormatColl)}`;
    output += this.attributeOutput.WriteParagraphProperties(paragraph);
    output += " ";
    const marks = paragraph
      .GetDoc()
      .GetIDocumentMarkAccess()
      .GetBookmarks()
      .filter(
        /** Computes the mark result. @param mark - Mark. @returns The computed result. */ (
          mark,
        ) => {
          if (mark.GetMarkPos().GetNode() !== paragraph) return false;
          const offset = mark.GetMarkPos().GetContentIndex();
          return (
            offset >= start &&
            (offset < end || (offset === end && end === paragraph.GetText().length))
          );
        },
      );
    let offset = 0;
    let markIndex = 0;
    let activeLink: WriterHyperlink | undefined;
    const writeRun = /** Implements write Run. @param run - Run. @returns Nothing. */ (
      run: RtfTextRun,
    ): void => {
      if (run.text.length === 0) return;
      if (!equalWriterHyperlinks(activeLink, run.hyperlink)) {
        if (activeLink !== undefined) output += "}}";
        if (run.hyperlink !== undefined) output += this.StartURL(run.hyperlink);
        activeLink = run.hyperlink;
      }
      output += this.WriteRun(run);
    };
    for (const run of this.GetTextRuns(paragraph)) {
      const runStart = offset;
      offset += run.text.length;
      const sliceStart = Math.max(start, runStart);
      const sliceEnd = Math.min(end, offset);
      if (sliceEnd <= sliceStart) continue;
      let cursor = sliceStart;
      while (markIndex < marks.length) {
        // filter() produced a dense local array and this loop is bounded by its unchanged length.
        const mark = marks[markIndex] as (typeof marks)[number];
        const position = mark.GetMarkPos().GetContentIndex();
        if (position >= sliceEnd) break;
        writeRun({ ...run, text: run.text.slice(cursor - runStart, position - runStart) });
        output += this.WriteBookmark(mark.GetName());
        cursor = position;
        markIndex++;
      }
      writeRun({ ...run, text: run.text.slice(cursor - runStart, sliceEnd - runStart) });
    }
    if (activeLink !== undefined) output += "}}";
    for (; markIndex < marks.length; markIndex++)
      output += this.WriteBookmark((marks[markIndex] as (typeof marks)[number]).GetName());
    return output;
  }

  /** Emits one Writer point mark at its source text offset.  @param name - Name. @returns The string result. */
  private WriteBookmark(name: string): string {
    return `{\\*\\bkmkstart ${OutString(name, this.GetDefaultEncoding())}}{\\*\\bkmkend ${OutString(name, this.GetDefaultEncoding())}}`;
  }

  /** Begins one hyperlink field around its complete native text-hint range.  @param hyperlink - Hyperlink. @returns The string result. */
  private StartURL(hyperlink: WriterHyperlink): string {
    const url = OutString(hyperlink.url.replaceAll("\\", "\\\\"), this.GetCurrentEncoding());
    const target =
      hyperlink.targetFrame === undefined
        ? ""
        : ` \\\\t "${OutString(hyperlink.targetFrame, this.GetCurrentEncoding())}"`;
    return `{\\field{\\*\\fldinst HYPERLINK "${url}"${target} }{\\fldrslt `;
  }

  /** Visits native hint boundaries before any UI run coalescing. @param paragraph - Native text owner. @returns Effective item runs. */
  private *GetTextRuns(paragraph: SwTextNode): Generator<RtfTextRun> {
    const text = paragraph.GetText();
    const hints = paragraph.GetpSwpHints()?.entries() ?? [];
    const boundaries = new Set([0, text.length]);
    for (const hint of hints) {
      boundaries.add(Math.min(text.length, hint.start));
      boundaries.add(Math.min(text.length, hint.end));
    }
    const iterator = new SwAttrIter(paragraph);
    const ordered = [...boundaries].sort(
      /** Applies sort to left, right. @param left - left value. @param right - right value. @returns Callback result. */ (
        left,
        right,
      ) => left - right,
    );
    for (let index = 0; index + 1 < ordered.length; index++) {
      const start = ordered[index] as number;
      const end = ordered[index + 1] as number;
      const items = new SfxItemSet(paragraph.GetDoc().GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
      items.SetParent(paragraph.GetSwAttrSet());
      const active = hints.filter(
        /** Applies filter to hint. @param hint - hint value. @returns Callback result. */ (hint) =>
          hint.start <= start && end <= hint.end,
      );
      iterator.Seek(start);
      for (const [first, last] of WRITER_CHARACTER_WHICH_RANGES)
        for (let which: number = first; which <= last; ++which)
          if (
            active.some(
              /** Applies some to hint. @param hint - hint value. @returns Callback result. */ (
                hint,
              ) => CharFormat.IsItemIncluded(which, hint),
            )
          )
            items.Put(iterator.GetAttrHandler().ReadItem(which));
      const inet = [...active]
        .reverse()
        .find(
          /** Applies find to hint. @param hint - hint value. @returns Callback result. */ (hint) =>
            hint.format instanceof SwFormatINetFormat,
        );
      const named = [...active]
        .reverse()
        .find(
          /** Selects the active original character-format item. @param hint - Active native hint. @returns Whether it names a character style. */ (
            hint,
          ) => hint.format instanceof SwFormatCharFormat,
        );
      try {
        yield {
          ...(named?.format instanceof SwFormatCharFormat ? { charFormat: named.format } : {}),
          text: text.slice(start, end),
          items,
          attributes: projectWriterCharacterAttributes(items, items.GetParent()),
          ...(inet?.format instanceof SwFormatINetFormat
            ? { hyperlink: inet.format.GetHyperlink() }
            : {}),
        };
      } finally {
        items.Dispose();
      }
    }
  }

  /** Emits one native text run without crossing a bookmark position.  @param run - Run. @returns The string result. */
  private WriteRun(run: RtfTextRun): string {
    // The paragraph writer admits only nonempty slices before calling this private method.
    const controls =
      (run.charFormat === undefined
        ? ""
        : this.attributeOutput.OutputTextCharFormat(run.charFormat)) +
      this.attributeOutput.WriteNativeCharacter(run.items, GetCharacterPropertiesMode.ForRun);
    return (
      "{" +
      controls +
      (controls.length === 0 ? "" : " ") +
      this.attributeOutput.RunText(
        new SwWW8AttrIter().GetSnippet(run.text, 0, run.text.length),
        this.GetCurrentEncoding(),
        "",
      ) +
      "}"
    );
  }

  /** Registers every represented native border color before writing the table. @param box - Native border item. @returns Nothing. */
  private IndexBoxColors(box: SvxBoxItem): void {
    for (const edge of [
      SvxBoxItemLine.TOP,
      SvxBoxItemLine.LEFT,
      SvxBoxItemLine.BOTTOM,
      SvxBoxItemLine.RIGHT,
    ]) {
      const line = box.GetLine(edge);
      if (line !== undefined && !line.isEmpty()) this.IndexColor(borderColor(line));
    }
  }

  /** Registers the actual source font value, preserving FFN identity and metadata. @param font - Native font or font item. @returns Font ID. */
  private IndexFont(font: SvxFontItem | wwFont): number {
    return this.m_aFontHelper.GetId(font);
  }

  /** Assigns a stable one-based RTF color index. @param color - CSS RGB color. @returns Index. */
  private IndexColor(color: string): number {
    const key = rtfColorKey(writerColorFromPrimitive(color, "auto"));
    const existing = this.colors.get(key);
    if (existing !== undefined) return existing;
    const index = this.colors.size + 1;
    this.colors.set(key, index);
    return index;
  }
}

/** Converts the source Color channels to the existing RTF color-table key.  @param line - Line. @returns The string result. */
function borderColor(line: SvxBorderLine): string {
  return rtfColorKey(line.GetColor());
}

/** Uses source RGB channels as the RTF table key; alpha has no RTF color-table field.  @param color - Color. @returns The string result. */
function rtfColorKey(color: Readonly<Color>): string {
  return `#${[color.GetRed(), color.GetGreen(), color.GetBlue()]
    .map(
      /** Computes the channel result. @param channel - Channel. @returns The computed result. */ (
        channel,
      ) => channel.toString(16).padStart(2, "0"),
    )
    .join("")}`;
}

import { MSWordExportBase, MSWordExportFormat } from "./wrtww8";
import { SwPaM, SwPosition } from "../../core/crsr/pam";

/** Native exportability scan stops at the last explicitly owned level. @param rule - Original rule. @returns Original gate. */
function IsExportNumRule(rule: SwNumRule): boolean {
  let end = 10;
  while (end > 0 && rule.GetNumFormat(end - 1) === undefined) --end;
  for (let level = 0; level < end; ++level) {
    const format = rule.Get(level);
    if (
      format.GetNumberingType() !== SvxNumType.SVX_NUM_NUMBER_NONE ||
      format.GetPrefix() !== "" ||
      (format.GetSuffix() !== "" && format.GetSuffix() !== ".")
    )
      return true;
  }
  return false;
}

import { AbstractNumberingDefinitions, NumberingDefinitions } from "./wrtw8num";

import { StyleType } from "./attributeoutputbase";

import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
/** The real run items and optional borrowed native named-style item for the existing RTF string sink. */
type RtfTextRun = WriterTextRun & { items: SfxItemSet; charFormat?: SwFormatCharFormat };
