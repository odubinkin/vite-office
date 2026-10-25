/** @fileoverview Writer RTF document serialization following sw/source/filter/ww8/rtfexport.cxx. */
import type { SwDoc } from "../../core/doc/doc";
import { getWriterNumFormatKind } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import {
  ConvertBorderWidthToWord,
  type SvxBorderLine,
} from "../../../../editeng/source/items/borderline";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { SwTableNode } from "../../core/docnode/node";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { projectWriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { WriterTextRun } from "../basflt/writer-transfer";
import { equalWriterHyperlinks, type WriterHyperlink } from "../../core/txtnode/fmtatr2";
import { RtfAttributeOutput } from "./rtfattributeoutput";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { RES_PAGEDESC } from "../../../inc/hintids";
import type { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import {
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
  type Color,
} from "../../../../tools/inc/color";

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
export class RtfExport {
  private readonly attributeOutput = new RtfAttributeOutput(
    (family) => this.IndexFont(family),
    (color) => this.IndexColor(color),
  );
  private readonly fonts = new Map<string, number>();
  private readonly colors = new Map<string, number>();
  private readonly lists = new Map<
    string,
    {
      id: number;
      levels: readonly Readonly<{
        kind: "bullet" | "numbered";
        start: number;
        bullet: number;
        numberingType: SvxNumType;
      }>[];
    }
  >();
  private readonly styles = new Map<string, { index: number; style: SwTextFormatColl }>();

  /** Exports a complete Writer document. @param document - Native model. @returns RTF bytes. */
  public ExportDocument(document: SwDoc): Uint8Array {
    this.fonts.clear();
    this.colors.clear();
    for (const color of RTF_DEFAULT_COLORS) this.IndexColor(rtfColorKey(color));
    this.lists.clear();
    this.styles.clear();
    const blocks = document.GetNodes().getBodyContent();
    for (const node of document.GetNodes().entries()) {
      if (!node.IsTextNode()) continue;
      for (const run of projectWriterTextRuns(node as SwTextNode)) {
        if (run.attributes.fontFamily !== undefined) this.IndexFont(run.attributes.fontFamily);
        if (run.attributes.color !== undefined && run.attributes.color !== "auto")
          this.IndexColor(run.attributes.color);
        if (run.attributes.underlineColor !== undefined && run.attributes.underlineColor !== "auto")
          this.IndexColor(run.attributes.underlineColor);
        if (run.attributes.highlight !== undefined && run.attributes.highlight !== "transparent")
          this.IndexColor(run.attributes.highlight);
      }
      const paragraph = node as SwTextNode;
      const style = paragraph.GetTextFormatColl();
      if (!this.styles.has(style.id)) this.styles.set(style.id, { index: this.styles.size, style });
      const rule = paragraph.GetNumRule();
      if (rule !== undefined && !this.lists.has(rule.GetName())) {
        const levels = Array.from(
          { length: 10 },
          /** Selects the native numbering kind at one level. @param _item - Array slot. @param level - List level. @returns Kind. */ (
            _item,
            level,
          ) => {
            const format = rule.Get(level);
            return {
              kind: getWriterNumFormatKind(format),
              start: format.GetStart(),
              bullet: format.GetBulletChar(),
              numberingType: format.GetNumberingType(),
            };
          },
        );
        this.lists.set(rule.GetName(), { id: this.lists.size + 1, levels });
      }
    }
    for (const { style } of this.styles.values()) {
      const attributes = projectWriterCharacterAttributes(style.GetAttrSet());
      if (attributes.fontFamily !== undefined) this.IndexFont(attributes.fontFamily);
      if (attributes.color !== undefined && attributes.color !== "auto")
        this.IndexColor(attributes.color);
      if (attributes.underlineColor !== undefined && attributes.underlineColor !== "auto")
        this.IndexColor(attributes.underlineColor);
      if (attributes.highlight !== undefined && attributes.highlight !== "transparent")
        this.IndexColor(attributes.highlight);
    }
    for (const block of blocks) {
      if (!(block instanceof SwTableNode)) continue;
      for (const row of block.GetTable().GetTabLines())
        for (const cell of row.GetTabBoxes()) {
          const box = cell.GetFormat().box;
          if (box === undefined) continue;
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
    }
    let output = "{\\rtf1\\ansi\\ansicpg1252\\deff0";
    if (this.fonts.size > 0) {
      output += "{\\fonttbl";
      for (const [family, index] of this.fonts) output += `{\\f${index} ${escapeRtf(family)};}`;
      output += "}";
    }
    if (this.colors.size > 0) {
      output += "{\\colortbl;";
      for (const color of this.colors.keys()) {
        const red = Number.parseInt(color.slice(1, 3), 16),
          green = Number.parseInt(color.slice(3, 5), 16),
          blue = Number.parseInt(color.slice(5, 7), 16);
        output += `\\red${red}\\green${green}\\blue${blue};`;
      }
      output += "}";
    }
    if (this.styles.size > 0) {
      output += "{\\stylesheet";
      for (const { index, style } of this.styles.values()) {
        const paragraph = this.attributeOutput.WriteStyleParagraphProperties(style),
          character = this.attributeOutput.WriteCharacter(
            projectWriterCharacterAttributes(style.GetAttrSet()),
          );
        output += `{\\s${index}${paragraph}${character} ${escapeRtf(style.GetName())};}`;
      }
      output += "}";
    }
    if (this.lists.size > 0) {
      output += "{\\*\\listtable";
      for (const list of this.lists.values()) {
        output += `{\\list\\listtemplateid${list.id}\\listsimple0`;
        for (const level of list.levels)
          output +=
            level.kind === "bullet"
              ? `{\\listlevel\\levelnfc23\\levelstartat${level.start}\\levelfollow0{\\leveltext \\'01${escapeRtf(String.fromCodePoint(level.bullet || 0x2022))};}{\\levelnumbers;}}`
              : `{\\listlevel\\levelnfc${toRtfNfc(level.numberingType)}\\levelstartat${level.start}\\levelfollow0{\\leveltext \\'02\\'00.;}{\\levelnumbers\\'01;}}`;
        output += `{\\listname ;}\\listid${list.id}}`;
      }
      output += "}{\\*\\listoverridetable";
      for (const list of this.lists.values())
        output += `{\\listoverride\\listid${list.id}\\listoverridecount0\\ls${list.id}}`;
      output += "}";
    }
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
          const nativeWidths = boxes.map((box) => box.GetFrameSize().GetWidth());
          const hasNativeWidths = nativeWidths.every((width) => width > 0);
          const baseWidth = nativeWidths.reduce((total, width) => total + width, 0);
          const tableWidth = block.GetTable().GetFrameFormat().GetFrameSize().GetWidth();
          const widthRatio = hasNativeWidths && tableWidth > 0 ? tableWidth / baseWidth : 1;
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
                output += this.WriteCellBorder(control, box.GetLine(edge));
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
    return new TextEncoder().encode(output);
  }

  /** Emits the first native page descriptor as global paper and first-section controls. */
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

  /** Mirrors OutPageDescription for the currently represented physical page fields. */
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

  /** Projects the represented physical tests in IsPlausableSingleWordSection. */
  private IsSingleWordSectionPageChain(page: SwPageDesc): boolean {
    const follow = page.GetFollow();
    if (follow === page || follow.GetFollow() !== follow) return false;
    return this.IsPlausibleSingleWordSection(page, follow);
  }

  /** Projects the physical fields tested by the pinned section plausibility helper. */
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

  /** Emits section properties through the shared later-page path. */
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

  /** Splits a native text node only for a real follow-style section transition. */
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
          .filter((position) => position.GetNode() === paragraph)
          .map((position) => position.GetContentIndex())
          .filter((offset) => offset > 0 && offset < paragraph.GetText().length),
      ),
    ].sort((a, b) => a - b);
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

  /** Reads the item set selected by upstream GetSwAttrSet for the initial page. */
  private GetPageDescriptionItem(block: SwTextNode | SwTableNode): SwFormatPageDesc | undefined {
    const set =
      block instanceof SwTableNode
        ? block.GetTable().GetFrameFormat().GetAttrSet()
        : block.GetSwAttrSet();
    return set.Get(RES_PAGEDESC) as SwFormatPageDesc;
  }

  /** Reads only a block's authored item, as OutputSectionBreaks receives GetpSwAttrSet. */
  private GetDirectPageDescriptionItem(
    block: SwTextNode | SwTableNode,
  ): SwFormatPageDesc | undefined {
    const set =
      block instanceof SwTableNode
        ? block.GetTable().GetFrameFormat().GetAttrSet()
        : block.GetpSwAttrSet();
    return set?.GetItemIfSet(RES_PAGEDESC, false) as SwFormatPageDesc | undefined;
  }

  /** Resolves the first layout descriptor through the represented document page table. */
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

  /** Serializes one paragraph's represented properties and text runs. @param paragraph - Native paragraph. @returns RTF body. */
  private WriteParagraph(
    paragraph: SwTextNode,
    start = 0,
    end = paragraph.GetText().length,
  ): string {
    let output = this.attributeOutput.WriteParagraphProperties(paragraph);
    const style = this.styles.get(paragraph.GetParagraphStyle());
    if (style !== undefined) output += `\\s${style.index}`;
    const rule = paragraph.GetNumRule();
    if (rule !== undefined && paragraph.IsCountedInList()) {
      const list = this.lists.get(rule.GetName());
      if (list !== undefined) {
        const level = paragraph.GetAttrListLevel();
        const format = rule.Get(level);
        const label =
          getWriterNumFormatKind(format) === "bullet"
            ? String.fromCodePoint(format.GetBulletChar())
            : paragraph.GetNumString();
        output += `{\\listtext\\pard\\plain ${escapeRtf(label)}\\tab}`;
        output += `\\ilvl${Math.min(level, 8)}\\ls${list.id}`;
      }
    }
    output += " ";
    const marks = paragraph
      .GetDoc()
      .GetIDocumentMarkAccess()
      .GetBookmarks()
      .filter((mark) => {
        if (mark.GetMarkPos().GetNode() !== paragraph) return false;
        const offset = mark.GetMarkPos().GetContentIndex();
        return (
          offset >= start &&
          (offset < end || (offset === end && end === paragraph.GetText().length))
        );
      });
    let offset = 0;
    let markIndex = 0;
    let activeLink: WriterHyperlink | undefined;
    const writeRun = (run: WriterTextRun): void => {
      if (run.text.length === 0) return;
      if (!equalWriterHyperlinks(activeLink, run.hyperlink)) {
        if (activeLink !== undefined) output += "}}";
        if (run.hyperlink !== undefined) output += this.StartURL(run.hyperlink);
        activeLink = run.hyperlink;
      }
      output += this.WriteRun(run);
    };
    for (const run of projectWriterTextRuns(paragraph)) {
      const runStart = offset;
      offset += run.text.length;
      const sliceStart = Math.max(start, runStart);
      const sliceEnd = Math.min(end, offset);
      if (sliceEnd <= sliceStart) continue;
      let cursor = sliceStart;
      while (markIndex < marks.length) {
        const mark = marks[markIndex];
        if (mark === undefined) break;
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
      output += this.WriteBookmark(marks[markIndex]?.GetName() ?? "");
    return output;
  }

  /** Emits one Writer point mark at its source text offset. */
  private WriteBookmark(name: string): string {
    return `{\\*\\bkmkstart ${escapeRtf(name)}}{\\*\\bkmkend ${escapeRtf(name)}}`;
  }

  /** Begins one hyperlink field around its complete native text-hint range. */
  private StartURL(hyperlink: WriterHyperlink): string {
    const url = escapeRtf(hyperlink.url.replaceAll("\\", "\\\\"));
    const target =
      hyperlink.targetFrame === undefined ? "" : ` \\\\t "${escapeRtf(hyperlink.targetFrame)}"`;
    return `{\\field{\\*\\fldinst HYPERLINK "${url}"${target} }{\\fldrslt `;
  }

  /** Emits one native text run without crossing a bookmark position. */
  private WriteRun(run: WriterTextRun): string {
    if (run.text.length === 0) return "";
    const controls = this.attributeOutput.WriteCharacter(run.attributes);
    return "{" + controls + (controls.length === 0 ? "" : " ") + escapeRtf(run.text) + "}";
  }

  /** Emits one native cell edge using the source RTF border style and width mapping. */
  private WriteCellBorder(control: string, line: SvxBorderLine | undefined): string {
    if (line === undefined || line.isEmpty()) return `\\${control}\\brdrnone`;
    const style = line.GetBorderLineStyle();
    const width = line.GetWidth();
    const converted = Math.trunc(ConvertBorderWidthToWord(style, width));
    const size =
      width <= 255 ? `\\brdrw${converted}` : `\\brdrth\\brdrw${Math.trunc(converted / 2)}`;
    return `\\${control}\\${rtfBorderStyle(style, width)}${size}\\brdrcf${this.IndexColor(borderColor(line))}`;
  }

  /** Assigns a stable RTF font index. @param family - Family name. @returns Index. */
  private IndexFont(family: string): number {
    const existing = this.fonts.get(family);
    if (existing !== undefined) return existing;
    const index = this.fonts.size;
    this.fonts.set(family, index);
    return index;
  }

  /** Assigns a stable one-based RTF color index. @param color - CSS RGB color. @returns Index. */
  private IndexColor(color: string): number {
    const key = color.toLowerCase();
    const existing = this.colors.get(key);
    if (existing !== undefined) return existing;
    const index = this.colors.size + 1;
    this.colors.set(key, index);
    return index;
  }
}

/** Converts the source Color channels to the existing RTF color-table key. */
function borderColor(line: SvxBorderLine): string {
  return rtfColorKey(line.GetColor());
}

/** Uses source RGB channels as the RTF table key; alpha has no RTF color-table field. */
function rtfColorKey(color: Readonly<Color>): string {
  return `#${[color.GetRed(), color.GetGreen(), color.GetBlue()]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Maps native cell-line styles exactly as OutTBLBorderLine. */
function rtfBorderStyle(style: BorderLineStyle, width: number): string {
  switch (style) {
    case BorderLineStyle.SOLID:
      return width === 1 ? "brdrhair" : "brdrs";
    case BorderLineStyle.DOTTED:
      return "brdrdot";
    case BorderLineStyle.DASHED:
      return "brdrdash";
    case BorderLineStyle.DOUBLE:
    case BorderLineStyle.DOUBLE_THIN:
      return "brdrdb";
    case BorderLineStyle.THINTHICK_SMALLGAP:
      return "brdrtnthsg";
    case BorderLineStyle.THINTHICK_MEDIUMGAP:
      return "brdrtnthmg";
    case BorderLineStyle.THINTHICK_LARGEGAP:
      return "brdrtnthlg";
    case BorderLineStyle.THICKTHIN_SMALLGAP:
      return "brdrthtnsg";
    case BorderLineStyle.THICKTHIN_MEDIUMGAP:
      return "brdrthtnmg";
    case BorderLineStyle.THICKTHIN_LARGEGAP:
      return "brdrthtnlg";
    case BorderLineStyle.EMBOSSED:
      return "brdremboss";
    case BorderLineStyle.ENGRAVED:
      return "brdrengrave";
    case BorderLineStyle.OUTSET:
      return "brdroutset";
    case BorderLineStyle.INSET:
      return "brdrinset";
    case BorderLineStyle.FINE_DASHED:
      return "brdrdashsm";
    case BorderLineStyle.DASH_DOT:
      return "brdrdashd";
    case BorderLineStyle.DASH_DOT_DOT:
      return "brdrdashdd";
    default:
      return "brdrnone";
  }
}

/** Escapes text according to RTF's ASCII plus signed UTF-16 Unicode form. @param value - Source text. @returns RTF text. */
function escapeRtf(value: string): string {
  let result = "";
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code === 0x5c || code === 0x7b || code === 0x7d) result += "\\" + value[index];
    else if (code === 0x0a) result += "\\line ";
    else if (code === 0x09) result += "\\tab ";
    else if (code >= 0x20 && code <= 0x7e) result += value[index];
    else result += `\\u${code > 0x7fff ? code - 0x10000 : code}?`;
  }
  return result;
}

/** Maps native numbering types to RTF levelnfc, retaining the source Arabic fallback. */
function toRtfNfc(type: SvxNumType): number {
  switch (type) {
    case SvxNumType.SVX_NUM_ROMAN_UPPER:
      return 1;
    case SvxNumType.SVX_NUM_ROMAN_LOWER:
      return 2;
    case SvxNumType.SVX_NUM_CHARS_UPPER_LETTER:
    case SvxNumType.SVX_NUM_CHARS_UPPER_LETTER_N:
      return 3;
    case SvxNumType.SVX_NUM_CHARS_LOWER_LETTER:
    case SvxNumType.SVX_NUM_CHARS_LOWER_LETTER_N:
      return 4;
    case SvxNumType.SVX_NUM_FULL_WIDTH_ARABIC:
      return 14;
    case SvxNumType.SVX_NUM_CIRCLE_NUMBER:
      return 18;
    case SvxNumType.SVX_NUM_NUMBER_LOWER_ZH:
      return 35;
    case SvxNumType.SVX_NUM_NUMBER_UPPER_ZH:
      return 38;
    case SvxNumType.SVX_NUM_NUMBER_UPPER_ZH_TW:
      return 34;
    case SvxNumType.SVX_NUM_TIAN_GAN_ZH:
      return 30;
    case SvxNumType.SVX_NUM_DI_ZI_ZH:
      return 31;
    case SvxNumType.SVX_NUM_NUMBER_TRADITIONAL_JA:
      return 16;
    case SvxNumType.SVX_NUM_AIU_FULLWIDTH_JA:
      return 20;
    case SvxNumType.SVX_NUM_AIU_HALFWIDTH_JA:
      return 12;
    case SvxNumType.SVX_NUM_IROHA_FULLWIDTH_JA:
      return 21;
    case SvxNumType.SVX_NUM_IROHA_HALFWIDTH_JA:
      return 13;
    case SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO:
    case SvxNumType.SVX_NUM_HANGUL_CIRCLED_SYLLABLE_KO:
      return 24;
    case SvxNumType.SVX_NUM_HANGUL_JAMO_KO:
    case SvxNumType.SVX_NUM_HANGUL_CIRCLED_JAMO_KO:
      return 25;
    case SvxNumType.SVX_NUM_NUMBER_HANGUL_KO:
      return 42;
    case NumberingType.NUMBER_DIGITAL_KO as SvxNumType:
      return 41;
    case NumberingType.NUMBER_DIGITAL2_KO as SvxNumType:
      return 44;
    case NumberingType.NUMBER_LEGAL_KO as SvxNumType:
      return 43;
    case SvxNumType.SVX_NUM_CHAR_SPECIAL:
    case SvxNumType.SVX_NUM_BITMAP:
      return 23;
    case SvxNumType.SVX_NUM_NUMBER_NONE:
      return 255;
    case SvxNumType.SVX_NUM_ARABIC_ZERO:
      return 22;
    default:
      return 0;
  }
}
