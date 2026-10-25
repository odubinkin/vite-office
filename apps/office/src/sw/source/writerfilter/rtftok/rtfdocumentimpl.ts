/** @fileoverview Maps RTF tokenizer events into native Writer nodes following rtftok/rtfdocumentimpl.cxx. */
import type { WriterTextRun } from "../../filter/basflt/writer-transfer";
import { SwpHints } from "../../core/txtnode/ndhints";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import { getSvxAdjust } from "../../core/txtnode/ndtxt-hints";
import { equalWriterHyperlinks, type WriterHyperlink } from "../../core/txtnode/fmtatr2";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import {
  RES_BREAK,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_UL_SPACE,
  RES_KEEP,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_TABSTOP,
  RES_PARATR_LINESPACING,
} from "../../../inc/hintids";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import {
  getWriterMaterializedParagraphStyleDefinition,
  getWriterParagraphStyleId,
} from "../../../inc/poolfmt";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import {
  ConvertBorderWidthFromWord,
  SvxBorderLine,
} from "../../../../editeng/source/items/borderline";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { Color } from "../../../../tools/inc/color";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { WriterParagraphAlignment } from "../../core/txtnode/ndtxt";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { RtfSyntaxError, RtfTokenizer, type RtfToken } from "./rtftokenizer";
import { RTF_CHARSET_CODEPAGE, RTF_FONT_SUFFIX_CODEPAGE, rtfDecoderLabel } from "./rtfcharsets";
import { convertCharToUnicode } from "../../../../sal/textenc/convertsimple.hxx";
import { ImplSymbolToUnicode } from "../../../../sal/textenc/tcvtbyte";
import { rtl_getTextEncodingFromWindowsCodePage } from "../../../../sal/textenc/tencinfo";
import { getTextToUnicodeData } from "../../../../sal/textenc/tables";
import { ImplConvertUtf8ToUnicode } from "../../../../sal/textenc/tcvtutf8";
import { OSTRING_TO_OUSTRING_CVTFLAGS } from "../../../../sal/inc/rtl/ustring.h";
import { RTL_TEXTTOUNICODE_FLAGS_FLUSH } from "../../../../sal/inc/rtl/textcvt.h";
import type { WriterPageDescriptorValue } from "../../core/layout/pagedesc";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";

/** Paragraph properties represented by the current Writer model. */
interface RtfParagraphState {
  alignment: WriterParagraphAlignment;
  left: number;
  right: number;
  firstLine: number;
  before: number;
  after: number;
  contextual: boolean;
  keepNext: boolean;
  keepTogether: boolean;
  widowControl: boolean;
  tabStops: readonly SvxTabStop[];
  tabAdjustment: SvxTabAdjust;
  tabFill: string;
  pageBreakBefore: boolean;
  lineSpace: number;
  lineMulti: number;
  alignmentSet?: boolean;
  leftSet?: boolean;
  rightSet?: boolean;
  firstLineSet?: boolean;
  beforeSet?: boolean;
  afterSet?: boolean;
  contextualSet?: boolean;
  keepNextSet?: boolean;
  keepTogetherSet?: boolean;
  widowControlSet?: boolean;
  tabStopsSet?: boolean;
  pageBreakBeforeSet?: boolean;
  lineSpacingSet?: boolean;
  styleIndex?: number;
  listOverride?: number;
  listLevel: number;
}

/** Group-scoped RTF dispatch state. */
interface RtfState {
  destination:
    | "body"
    | "fonttbl"
    | "stylesheet"
    | "styleentry"
    | "bookmarkstart"
    | "bookmarkend"
    | "colortbl"
    | "listtable"
    | "list"
    | "listlevel"
    | "leveltext"
    | "listoverridetable"
    | "listoverride"
    | "field"
    | "fldinst"
    | "skip";
  starred: boolean;
  character: WriterCharacterAttributes;
  paragraph: RtfParagraphState;
  fontIndex: number;
  currentCodepage: number;
  fontCodepage?: number;
  colorIndex: number;
  field?: { instruction: string; hyperlink?: WriterHyperlink };
  hyperlink?: WriterHyperlink;
  styleIndex?: number;
  styleName?: string;
  styleControls: Set<string>;
  characterControls: Set<string>;
  bookmarkName?: string;
  levelText?: string;
}

/** Parsed paragraph before the source graph is applied atomically. */
interface RtfParagraph {
  readonly runs: readonly RtfRun[];
  readonly state: RtfParagraphState;
  readonly marks: readonly Readonly<{ name: string; offset: number }>[];
}

/** Parsed RTF text plus controls explicitly active at that span. */
interface RtfRun extends WriterTextRun {
  readonly controls: ReadonlySet<string>;
}

/** Ordered body content with native rows and cell paragraphs. */
type RtfBlock =
  | Readonly<{ kind: "paragraph"; paragraph: RtfParagraph; section: number }>
  | Readonly<{
      kind: "table";
      rows: readonly RtfTableRow[];
      section: number;
      pageBreakBefore: boolean;
    }>;

/** The represented physical subset of a tokenizer section-property group. */
type RtfSectionPage = Partial<{
  -readonly [K in Exclude<keyof WriterPageDescriptorValue, "name">]: WriterPageDescriptorValue[K];
}>;

/** One RTF table row with physical cell boundaries in twips. */
interface RtfTableRow {
  readonly cells: readonly (readonly RtfParagraph[])[];
  readonly header: boolean;
  readonly boundaries: readonly number[];
  readonly alignment: "left" | "center" | "right";
  readonly left: number;
  readonly height: number;
  readonly split: boolean;
  readonly verticals: readonly (VertOrientation | undefined)[];
  readonly borders: readonly ReadonlyMap<SvxBoxItemLine, RtfCellBorder>[];
  readonly paddings: readonly ReadonlyMap<SvxBoxItemLine, number>[];
  readonly defaultPaddings: ReadonlyMap<SvxBoxItemLine, number>;
}

/** One cell edge from RTF row definitions before native box materialization. */
interface RtfCellBorder {
  style: BorderLineStyle;
  width: number;
  colorIndex: number;
  wordStyle: number;
}

const DEFAULT_CHARACTER: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};
const DEFAULT_PARAGRAPH: RtfParagraphState = {
  alignment: "left",
  left: 0,
  right: 0,
  firstLine: 0,
  before: 0,
  after: 0,
  contextual: false,
  keepNext: false,
  keepTogether: false,
  widowControl: true,
  tabStops: [],
  tabAdjustment: SvxTabAdjust.Left,
  tabFill: " ",
  pageBreakBefore: false,
  lineSpace: 240,
  lineMulti: 0,
  listLevel: 0,
};
const SKIPPED_DESTINATIONS = new Set([
  "stylesheet",
  "info",
  "generator",
  "pict",
  "object",
  "header",
  "footer",
  "headerl",
  "headerr",
  "footerl",
  "footerr",
  "footnote",
  "annotation",
  "listtext",
  "filetbl",
  "datastore",
  "themedata",
  "colorschememapping",
  "xmlnstbl",
]);
const STYLE_PROPERTY_CONTROLS = new Set([
  "b",
  "i",
  "ul",
  "ulnone",
  "strike",
  "striked",
  "super",
  "sub",
  "up",
  "dn",
  "f",
  "fs",
  "cf",
  "highlight",
  "ql",
  "qc",
  "qr",
  "qj",
  "li",
  "ri",
  "fi",
  "sb",
  "sa",
  "contextualspace",
  "keepn",
  "keep",
  "widctlpar",
  "nowidctlpar",
  "tx",
  "sl",
  "slmult",
]);
const CHARACTER_PROPERTY_CONTROLS = new Set([
  "b",
  "i",
  "ul",
  "ulnone",
  "strike",
  "striked",
  "super",
  "sub",
  "up",
  "dn",
  "nosupersub",
  "f",
  "fs",
  "cf",
  "highlight",
]);

/** Imports a represented RTF body without coupling the tokenizer to browser I/O. */
export class RtfDocumentImpl {
  private readonly states: RtfState[] = [];
  private readonly blocks: RtfBlock[] = [];
  private readonly runs: RtfRun[] = [];
  private readonly marks: { name: string; offset: number }[] = [];
  private readonly fonts = new Map<number, string>();
  private readonly fontCodepages = new Map<number, number>();
  private defaultCodepage = 1252;
  private defaultFontIndex = -1;
  private readonly colors: string[] = [];
  private readonly listFormats = new Map<
    number,
    readonly Readonly<{
      kind: "bullet" | "numbered";
      start: number;
      bullet?: number;
      numberingType: SvxNumType;
    }>[]
  >();
  private readonly styles = new Map<
    number,
    Readonly<{
      name: string;
      character: WriterCharacterAttributes;
      paragraph: RtfParagraphState;
      controls: ReadonlySet<string>;
    }>
  >();
  private readonly importedStyles = new Map<number, SwTextFormatColl>();
  private readonly listOverrides = new Map<number, number>();
  private currentListId = 0;
  private currentListLevels: {
    kind: "bullet" | "numbered";
    start: number;
    bullet?: number;
    numberingType: SvxNumType;
  }[] = [];
  private currentOverrideListId = 0;
  private currentOverrideIndex = 0;
  private fontName = "";
  private color = { red: 0, green: 0, blue: 0 };
  private sawHeader = false;
  private terminatedParagraph = false;
  private tableRows: RtfTableRow[] = [];
  private tableRow: RtfParagraph[][] = [];
  private tableCell: RtfParagraph[] = [];
  private rowBoundaries: number[] = [];
  private rowAlignment: "left" | "center" | "right" = "left";
  private rowLeft = 0;
  private rowHeight = 0;
  private rowSplit = true;
  private rowHeader = false;
  private rowVerticals: (VertOrientation | undefined)[] = [];
  private nextCellVertical: VertOrientation | undefined;
  private rowBorders: Map<SvxBoxItemLine, RtfCellBorder>[] = [];
  private nextCellBorders = new Map<SvxBoxItemLine, RtfCellBorder>();
  private activeBorder: RtfCellBorder | undefined;
  private rowPaddings: Map<SvxBoxItemLine, number>[] = [];
  private nextCellPaddings = new Map<SvxBoxItemLine, number>();
  private rowDefaultPaddings = new Map<SvxBoxItemLine, number>();
  private inTable = false;
  private pendingUpDn: { height: number; automatic: boolean } | undefined;
  private defaultTabStop = 720;
  private firstRun = true;
  private pendingPageBreak = false;
  private readonly defaultSectionPage: RtfSectionPage = {};
  private readonly sectionPages: RtfSectionPage[] = [{}];
  private readonly sectionPageRestarts = new Set<number>();
  private currentSection = 0;

  /** Resolves source bytes with live group/font encoding feedback to the tokenizer. */
  public ResolveBytes(bytes: Uint8Array, options: SwDocOptions = {}): SwDoc {
    new RtfTokenizer(bytes).Parse(
      (token) => this.Dispatch(token),
      () => this.states.at(-1)?.currentCodepage ?? this.defaultCodepage,
    );
    return this.Finish(options);
  }

  /** Resolves already-lexed events into a fresh Writer document. */
  public Resolve(tokens: readonly RtfToken[], options: SwDocOptions = {}): SwDoc {
    for (const token of tokens) this.Dispatch(token);
    return this.Finish(options);
  }

  /** Materializes the parsed blocks only after the complete stream is valid. */
  private Finish(options: SwDocOptions): SwDoc {
    if (!this.sawHeader) throw new RtfSyntaxError("RTF version control is missing.");
    if (
      this.runs.length > 0 ||
      (this.blocks.length === 0 && this.tableRows.length === 0) ||
      !this.terminatedParagraph ||
      (this.pendingPageBreak && this.tableRows.length === 0)
    )
      this.CommitParagraph();
    this.FlushTable();
    const document = new SwDoc(options);
    const defaultPage = { ...document.GetPageDesc().GetValue(), ...this.defaultSectionPage };
    document.ChgPageDesc({ ...defaultPage, ...this.sectionPages[0] });
    // DomainMapper sets this for a newly imported Word/RTF document: \tx is absolute.
    document.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", false);
    const defaultTabs = (
      document.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem
    ).Clone();
    if (defaultTabs.Count() > 0 && this.defaultTabStop > 0) {
      const first = defaultTabs.At(0);
      const replacement = new SvxTabStop(
        this.defaultTabStop,
        first.GetAdjustment(),
        first.GetDecimal(),
        first.GetFill(),
      );
      defaultTabs.Remove(0);
      defaultTabs.Insert(replacement);
      document.GetAttrPool().SetUserDefaultItem(defaultTabs);
    }
    this.importedStyles.clear();
    for (const [index, definition] of this.styles) {
      const { name } = definition;
      const id =
        name === "Default Paragraph Style" || name === "Standard"
          ? "default"
          : getWriterParagraphStyleId(name);
      let identity = id || name;
      let suffix = 1;
      while (document.FindTextFormatColl(identity) !== undefined)
        identity = `${id || name}:${index}:${suffix++}`;
      const collection =
        getWriterMaterializedParagraphStyleDefinition(id) === undefined
          ? document.MakeTextFormatColl(name, document.GetTextFormatColl("default"), identity)
          : document.GetTextFormatColl(id);
      this.importedStyles.set(index, collection);
      this.ApplyStyleDefinition(collection, definition);
    }
    let firstParagraph = true;
    const sectionStyles = new Map<number, string>();
    for (const block of this.blocks) {
      let sectionStyle = sectionStyles.get(block.section);
      const startsSection = block.section > 0 && sectionStyle === undefined;
      if (block.section > 0 && sectionStyle === undefined) {
        let number = block.section;
        while (document.FindPageDesc(`Converted${number}`) !== undefined) number++;
        sectionStyle = `Converted${number}`;
        const page = document.MakePageDesc(sectionStyle);
        document.ChgPageDesc(
          { ...defaultPage, ...this.sectionPages[block.section], name: sectionStyle },
          sectionStyle,
        );
        sectionStyles.set(block.section, page.GetName());
      }
      if (block.kind === "paragraph") {
        const node = firstParagraph ? document.paragraphs[0] : document.nodes.MakeTextNode();
        if (node === undefined) throw new Error("Writer body has no text node.");
        this.ApplyParagraph(node, block.paragraph);
        if (startsSection && sectionStyle !== undefined)
          node.SetAttr(
            new SwFormatPageDesc(
              sectionStyle,
              this.sectionPageRestarts.has(block.section) ? 1 : undefined,
            ),
          );
        firstParagraph = false;
      } else {
        const table = firstParagraph
          ? document.nodes.InsertTable(document.paragraphs[0] as SwTextNode, "RTF Table", {})
          : document.nodes.MakeTableNode("RTF Table");
        if (startsSection && sectionStyle !== undefined)
          table
            .GetFrameFormat()
            .SetFormatAttr(
              new SwFormatPageDesc(
                sectionStyle,
                this.sectionPageRestarts.has(block.section) ? 1 : undefined,
              ),
            );
        if (block.pageBreakBefore)
          table.GetFrameFormat().SetFormatAttr(new SfxInt16Item(RES_BREAK, 4));
        const firstRow = block.rows[0];
        if (firstRow !== undefined) {
          const format = table.GetFrameFormat();
          const orient = format.GetHoriOrient().Clone();
          orient.SetHoriOrient(
            firstRow.alignment === "center"
              ? HoriOrientation.CENTER
              : firstRow.alignment === "right"
                ? HoriOrientation.RIGHT
                : firstRow.left !== 0
                  ? HoriOrientation.NONE
                  : HoriOrientation.LEFT,
          );
          format.SetFormatAttr(orient);
          if (firstRow.left !== 0) {
            const lr = format.GetLRSpace().Clone();
            lr.SetLeft(SvxIndentValue.twips(firstRow.left));
            format.SetFormatAttr(lr);
          }
          if (firstRow.defaultPaddings.size > 0) {
            const item = format.GetBox().Clone();
            for (const [edge, value] of firstRow.defaultPaddings) item.SetDistance(value, edge);
            format.SetFormatAttr(item);
          }
        }
        const rightEdge = block.rows.reduce(
          (maximum, row) => Math.max(maximum, (row.boundaries.at(-1) ?? 0) - row.left),
          0,
        );
        if (rightEdge > 0) {
          const size = table.GetFrameFormat().GetFrameSize().Clone();
          size.SetWidth(rightEdge);
          table.GetFrameFormat().SetFormatAttr(size);
        }
        for (const row of block.rows) {
          const line = document.nodes.AppendTableRow(table, row.cells.length);
          if (row.height !== 0) {
            const size = line.GetFrameFormat().GetFrameSize().Clone();
            size.SetHeight(Math.abs(row.height));
            size.SetHeightSizeType(row.height < 0 ? SwFrameSize.Fixed : SwFrameSize.Minimum);
            line.GetFrameFormat().SetFormatAttr(size);
          }
          if (!row.split) line.GetFrameFormat().SetFormatAttr(new SwFormatRowSplit(false));
          for (const [index, cell] of row.cells.entries()) {
            const box = line.GetTabBoxes()[index];
            if (box === undefined) throw new Error("RTF table cell is missing.");
            const vertical = row.verticals[index];
            if (vertical !== undefined) {
              const item = box.GetVertOrient();
              item.SetVertOrient(vertical);
              box.ClaimFrameFormat().SetFormatAttr(item);
            }
            const borders = row.borders[index];
            if (borders !== undefined && borders.size > 0) {
              const item = box.GetBox();
              for (const [edge, border] of borders) {
                if (border.style === BorderLineStyle.NONE) {
                  item.SetLine(undefined, edge);
                  continue;
                }
                const color = this.colors[border.colorIndex] ?? "#000000";
                const wordWidth =
                  border.wordStyle === 2 && border.style !== BorderLineStyle.SOLID
                    ? border.width * 2
                    : border.width;
                item.SetLine(
                  new SvxBorderLine(
                    new Color(
                      Number.parseInt(color.slice(1, 3), 16),
                      Number.parseInt(color.slice(3, 5), 16),
                      Number.parseInt(color.slice(5, 7), 16),
                    ),
                    ConvertBorderWidthFromWord(border.style, wordWidth, border.wordStyle),
                    border.style,
                  ),
                  edge,
                );
              }
              box.ClaimFrameFormat().SetFormatAttr(item);
            }
            const paddings = row.paddings[index];
            if (row.defaultPaddings.size > 0 || (paddings !== undefined && paddings.size > 0)) {
              const item = box.GetBox();
              for (const [edge, value] of row.defaultPaddings) item.SetDistance(value, edge);
              for (const [edge, value] of paddings ?? []) item.SetDistance(value, edge);
              box.ClaimFrameFormat().SetFormatAttr(item);
            }
            const right = row.boundaries[index];
            const left = index === 0 ? row.left : row.boundaries[index - 1];
            if (right !== undefined && left !== undefined && right > left) {
              const size = box.GetFrameSize();
              size.SetWidth(right - left);
              box.SetFrameSize(size);
            }
            for (const [paragraphIndex, paragraph] of cell.entries()) {
              const node =
                paragraphIndex === 0
                  ? box.GetParagraphs()[0]
                  : document.nodes.AppendTableCellParagraph(box);
              if (node === undefined) throw new Error("RTF table paragraph is missing.");
              this.ApplyParagraph(node, paragraph);
            }
          }
        }
        let repeatedRows = 0;
        for (const row of block.rows) {
          if (!row.header) break;
          if (repeatedRows === 10) {
            repeatedRows = 0;
            break;
          }
          repeatedRows++;
        }
        table.SetRowsToRepeat(repeatedRows);
      }
    }
    return document;
  }

  /** Installs represented RTF stylesheet properties on the document-owned collection. */
  private ApplyStyleDefinition(
    collection: SwTextFormatColl,
    definition: {
      character: WriterCharacterAttributes;
      paragraph: RtfParagraphState;
      controls: ReadonlySet<string>;
    },
  ): void {
    const controls = definition.controls;
    const current = projectWriterCharacterAttributes(collection.GetAttrSet());
    const target: WriterCharacterAttributes = {
      ...current,
      ...(controls.has("b") ? { bold: definition.character.bold } : {}),
      ...(controls.has("i") ? { italic: definition.character.italic } : {}),
      ...(controls.has("ul") || controls.has("ulnone")
        ? { underline: definition.character.underline }
        : {}),
      ...(controls.has("strike") || controls.has("striked")
        ? { strikeout: definition.character.strikeout }
        : {}),
      ...(controls.has("super") || controls.has("sub") || controls.has("up") || controls.has("dn")
        ? { escapement: definition.character.escapement }
        : {}),
      ...(controls.has("f") ? { fontFamily: definition.character.fontFamily } : {}),
      ...(controls.has("fs") ? { fontSizeTwips: definition.character.fontSizeTwips } : {}),
      ...(controls.has("cf") ? { color: definition.character.color } : {}),
      ...(controls.has("highlight") ? { highlight: definition.character.highlight } : {}),
    };
    const items = createSwFormatAutoFormat(
      collection.GetAttrSet().GetDoc().GetAttrPool(),
      target,
      current,
    ).GetStyleHandle();
    for (const item of items.entries()) collection.SetFormatAttr(item);
    const paragraph = definition.paragraph;
    if (["ql", "qc", "qr", "qj"].some((name) => controls.has(name)))
      collection.SetFormatAttr(
        new SvxAdjustItem(getSvxAdjust(paragraph.alignment), RES_PARATR_ADJUST),
      );
    if (controls.has("li"))
      collection.SetFormatAttr(
        new SvxTextLeftMarginItem(SvxIndentValue.twips(paragraph.left), RES_MARGIN_TEXTLEFT),
      );
    if (controls.has("ri"))
      collection.SetFormatAttr(
        new SvxRightMarginItem(SvxIndentValue.twips(paragraph.right), RES_MARGIN_RIGHT),
      );
    if (controls.has("fi"))
      collection.SetFormatAttr(
        new SvxFirstLineIndentItem(SvxIndentValue.twips(paragraph.firstLine), RES_MARGIN_FIRSTLINE),
      );
    if (controls.has("sb") || controls.has("sa") || controls.has("contextualspace")) {
      const spacing = (collection.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).Clone();
      if (controls.has("sb")) spacing.SetUpper(paragraph.before);
      if (controls.has("sa")) spacing.SetLower(paragraph.after);
      if (controls.has("contextualspace")) spacing.SetContextValue(paragraph.contextual);
      collection.SetFormatAttr(spacing);
    }
    if (controls.has("keepn"))
      collection.SetFormatAttr(new SfxBoolItem(RES_KEEP, paragraph.keepNext));
    if (controls.has("keep"))
      collection.SetFormatAttr(new SfxBoolItem(RES_PARATR_SPLIT, !paragraph.keepTogether));
    if (controls.has("widctlpar") || controls.has("nowidctlpar"))
      collection.SetFormatAttr(new SfxInt16Item(RES_PARATR_WIDOWS, paragraph.widowControl ? 2 : 0));
    if (controls.has("tx")) collection.SetFormatAttr(createRtfTabStops(paragraph.tabStops));
    if (controls.has("sl") || controls.has("slmult"))
      collection.SetFormatAttr(createRtfLineSpacing(paragraph));
  }

  /** Applies parsed values through native text and item-set owners. @param node - Target paragraph. @param paragraph - Parsed values. */
  private ApplyParagraph(node: SwTextNode, paragraph: RtfParagraph): void {
    const style =
      paragraph.state.styleIndex === undefined
        ? undefined
        : this.importedStyles.get(paragraph.state.styleIndex);
    if (style !== undefined) node.ChgFormatColl(style);
    const inherited = projectWriterCharacterAttributes(node.GetSwAttrSet());
    const runs = paragraph.runs.map((run) => ({
      text: run.text,
      ...(run.hyperlink === undefined ? {} : { hyperlink: run.hyperlink }),
      attributes: resolveRtfRunAttributes(run, inherited),
    }));
    node.SetText(runs.map((run) => run.text).join(""));
    const hints = new SwpHints(node.GetDoc().GetAttrPool());
    hints.setTextRuns(runs, node.GetSwAttrSet());
    node.SetTextHints(hints);
    for (const mark of paragraph.marks)
      node.GetDoc().GetIDocumentMarkAccess().MakeMark(node, mark.offset, mark.name);
    if (paragraph.state.alignmentSet) node.SetParagraphAlignment(paragraph.state.alignment);
    if (paragraph.state.leftSet) node.SetParagraphTextLeftMargin(paragraph.state.left);
    if (paragraph.state.firstLineSet) node.SetParagraphFirstLineIndent(paragraph.state.firstLine);
    if (paragraph.state.rightSet) node.SetParagraphRightMargin(paragraph.state.right);
    if (paragraph.state.beforeSet || paragraph.state.afterSet || paragraph.state.contextualSet) {
      const spacing = (node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).Clone();
      if (paragraph.state.beforeSet) spacing.SetUpper(paragraph.state.before);
      if (paragraph.state.afterSet) spacing.SetLower(paragraph.state.after);
      if (paragraph.state.contextualSet) spacing.SetContextValue(paragraph.state.contextual);
      node.SetAttr(spacing);
    }
    if (paragraph.state.keepNextSet)
      node.SetAttr(new SfxBoolItem(RES_KEEP, paragraph.state.keepNext));
    if (paragraph.state.keepTogetherSet)
      node.SetAttr(new SfxBoolItem(RES_PARATR_SPLIT, !paragraph.state.keepTogether));
    if (paragraph.state.widowControlSet)
      node.SetAttr(new SfxInt16Item(RES_PARATR_WIDOWS, paragraph.state.widowControl ? 2 : 0));
    if (paragraph.state.tabStopsSet) node.SetAttr(createRtfTabStops(paragraph.state.tabStops));
    if (paragraph.state.pageBreakBeforeSet)
      node.SetAttr(new SfxInt16Item(RES_BREAK, paragraph.state.pageBreakBefore ? 4 : 0));
    if (paragraph.state.lineSpacingSet) node.SetAttr(createRtfLineSpacing(paragraph.state));
    const override = paragraph.state.listOverride;
    if (override !== undefined) {
      const sourceList = this.listOverrides.get(override),
        format =
          sourceList === undefined
            ? undefined
            : this.listFormats.get(sourceList)?.[paragraph.state.listLevel];
      if (format !== undefined) {
        applyWriterParagraphList(node, {
          kind: format.kind,
          level: paragraph.state.listLevel,
          listId: `RTF-list-${override}`,
        });
        const rule = node.GetNumRule();
        if (rule !== undefined) {
          const native = new SwNumFormat(rule.Get(paragraph.state.listLevel));
          native.SetNumberingType(format.numberingType);
          native.SetStart(format.start);
          if (format.kind === "bullet" && format.bullet !== undefined)
            native.SetBulletChar(format.bullet);
          rule.Set(paragraph.state.listLevel, native);
          node.GetDoc().GetDocumentListsManager().InvalidateAllLists();
        }
      }
    }
  }

  /** Dispatches one lexical event under the current group state. @param token - Source event. */
  private Dispatch(token: RtfToken): void {
    if (token.kind === "group-start") {
      const previous = this.states.at(-1);
      this.states.push({
        destination: previous?.destination ?? "body",
        starred: false,
        character: { ...(previous?.character ?? DEFAULT_CHARACTER) },
        paragraph: { ...(previous?.paragraph ?? DEFAULT_PARAGRAPH) },
        fontIndex: previous?.fontIndex ?? 0,
        currentCodepage: previous?.currentCodepage ?? this.defaultCodepage,
        ...(previous?.fontCodepage === undefined ? {} : { fontCodepage: previous.fontCodepage }),
        colorIndex: previous?.colorIndex ?? 0,
        ...(previous?.field === undefined ? {} : { field: previous.field }),
        ...(previous?.hyperlink === undefined ? {} : { hyperlink: previous.hyperlink }),
        ...(previous?.styleIndex === undefined ? {} : { styleIndex: previous.styleIndex }),
        styleControls: new Set(previous?.styleControls),
        characterControls: new Set(previous?.characterControls),
      });
      return;
    }
    if (token.kind === "group-end") {
      if (this.states.length === 1 && this.runs.length > 0) this.CommitParagraph(this.states[0]);
      const previous = this.states.pop();
      if (previous?.destination === "fonttbl" && previous.fontIndex >= 0) this.CommitFont(previous);
      if (previous?.destination === "styleentry" && previous.styleIndex !== undefined) {
        const name = previous.styleName?.split(";")[0]?.trim();
        if (name !== undefined && name.length > 0)
          this.styles.set(previous.styleIndex, {
            name,
            character: { ...previous.character },
            paragraph: { ...previous.paragraph },
            controls: new Set(previous.styleControls),
          });
      }
      if (previous?.destination === "bookmarkstart") {
        const name = previous.bookmarkName?.trim();
        if (name !== undefined && name.length > 0)
          this.marks.push({
            name,
            offset: this.runs.reduce((length, run) => length + run.text.length, 0),
          });
      }
      if (previous?.destination === "leveltext") {
        const glyph = [...(previous.levelText ?? "")].find(
          (value) => (value.codePointAt(0) ?? 0) > 0x20 && value !== ";",
        );
        if (glyph !== undefined) {
          const level = this.currentListLevels.at(-1);
          const bullet = glyph.codePointAt(0);
          if (level !== undefined && bullet !== undefined) level.bullet = bullet;
        }
      }
      if (previous?.destination === "list")
        this.listFormats.set(this.currentListId, [...this.currentListLevels]);
      if (previous?.destination === "listoverride")
        this.listOverrides.set(this.currentOverrideIndex, this.currentOverrideListId);
      if (previous?.destination === "fldinst" && previous.field !== undefined) {
        const hyperlink = parseRtfHyperlinkInstruction(previous.field.instruction);
        if (hyperlink !== undefined) previous.field.hyperlink = hyperlink;
      }
      return;
    }
    const state = this.states.at(-1);
    if (state === undefined) throw new RtfSyntaxError("RTF content is outside the root group.");
    if (token.kind === "hex-break") {
      // resolveChars converts hex CR and LF into separate PAR controls except
      // in destinations such as LEVELTEXT, where their bytes remain data.
      if (state.destination === "body") this.DispatchBodyControl("par", undefined, state);
      else if (state.destination === "leveltext")
        state.levelText = (state.levelText ?? "") + token.value;
      return;
    }
    if (token.kind === "text" || token.kind === "ansi-bytes") {
      const value = token.kind === "text" ? token.value : this.DecodeBytes(token.value, state);
      if (state.destination === "fonttbl") this.ReadFontText(value, state);
      else if (state.destination === "styleentry")
        state.styleName = (state.styleName ?? "") + value;
      else if (state.destination === "bookmarkstart" || state.destination === "bookmarkend")
        state.bookmarkName = (state.bookmarkName ?? "") + value;
      else if (state.destination === "leveltext") state.levelText = (state.levelText ?? "") + value;
      else if (state.destination === "colortbl") this.ReadColorText(value);
      else if (state.destination === "fldinst" && state.field !== undefined)
        state.field.instruction += value;
      else if (state.destination === "body") this.AppendText(value, state);
      return;
    }
    if (token.name === "*") {
      state.starred = true;
      return;
    }
    if (token.name === "rtf") {
      this.sawHeader = token.parameter === 1;
      return;
    }
    if (token.name === "deff" && token.parameter !== undefined) {
      this.defaultFontIndex = token.parameter;
      return;
    }
    if (token.name === "ansi") {
      state.currentCodepage = 1252;
      return;
    }
    if (token.name === "mac" || token.name === "pc" || token.name === "pca") {
      this.defaultCodepage = token.name === "mac" ? 10000 : token.name === "pc" ? 437 : 850;
      state.currentCodepage = this.defaultCodepage;
      return;
    }
    if (token.name === "ansicpg" && token.parameter !== undefined) {
      this.defaultCodepage = token.parameter === 0 ? 1252 : token.parameter;
      state.currentCodepage = this.defaultCodepage;
      return;
    }
    if (token.name === "cpg" && token.parameter !== undefined) {
      state.currentCodepage = token.parameter === 0 ? 1252 : token.parameter;
      if (state.destination === "fonttbl") state.fontCodepage = state.currentCodepage;
      return;
    }
    if (token.name === "fcharset" && token.parameter !== undefined) {
      const codepage = RTF_CHARSET_CODEPAGE.get(token.parameter);
      if (codepage !== undefined) {
        state.currentCodepage = codepage === 0 ? this.defaultCodepage : codepage;
        if (state.destination === "fonttbl") state.fontCodepage = state.currentCodepage;
      }
      return;
    }
    if (token.name === "field" && state.destination === "body") {
      state.destination = "field";
      state.field = { instruction: "" };
      return;
    }
    if (token.name === "fldinst" && state.destination === "field") {
      state.destination = "fldinst";
      state.starred = false;
      return;
    }
    if (token.name === "fldrslt" && state.destination === "field") {
      state.destination = "body";
      if (state.field?.hyperlink !== undefined) state.hyperlink = state.field.hyperlink;
      else Reflect.deleteProperty(state, "hyperlink");
      return;
    }
    if (token.name === "updnprop" && token.parameter !== undefined && state.starred) {
      this.pendingUpDn = {
        height: Math.floor(token.parameter / 100),
        automatic: token.parameter % 100 === 1,
      };
      state.starred = false;
      return;
    }
    if (state.destination === "body" && (token.name === "bkmkstart" || token.name === "bkmkend")) {
      state.destination = token.name === "bkmkstart" ? "bookmarkstart" : "bookmarkend";
      state.bookmarkName = "";
      state.starred = false;
      return;
    }
    if (
      token.name === "fonttbl" ||
      token.name === "colortbl" ||
      token.name === "stylesheet" ||
      token.name === "listtable" ||
      token.name === "listoverridetable"
    ) {
      state.destination = token.name;
      state.starred = false;
      return;
    }
    if (state.destination === "stylesheet" && token.name === "s") {
      state.destination = "styleentry";
      state.styleIndex = token.parameter ?? 0;
      state.styleName = "";
      state.styleControls = new Set();
      return;
    }
    if (state.destination === "styleentry") {
      if (STYLE_PROPERTY_CONTROLS.has(token.name)) {
        state.styleControls.add(token.name);
        this.DispatchBodyControl(token.name, token.parameter, state);
      }
      return;
    }
    if (state.destination === "stylesheet") return;
    if (state.destination === "listtable" && token.name === "list") {
      state.destination = "list";
      this.currentListId = 0;
      this.currentListLevels = [];
      return;
    }
    if (state.destination === "list" && token.name === "listlevel") {
      state.destination = "listlevel";
      this.currentListLevels.push({
        kind: "numbered",
        start: 1,
        numberingType: SvxNumType.SVX_NUM_ARABIC,
      });
      return;
    }
    if (state.destination === "listlevel" && token.name === "leveltext") {
      state.destination = "leveltext";
      state.levelText = "";
      return;
    }
    if (state.destination === "listoverridetable" && token.name === "listoverride") {
      state.destination = "listoverride";
      this.currentOverrideListId = 0;
      this.currentOverrideIndex = 0;
      return;
    }
    if (SKIPPED_DESTINATIONS.has(token.name) || state.starred) {
      state.destination = "skip";
      state.starred = false;
      return;
    }
    if (state.destination === "fonttbl") {
      if (token.name === "f" && token.parameter !== undefined) {
        this.CommitFont(state);
        state.fontIndex = token.parameter;
        Reflect.deleteProperty(state, "fontCodepage");
      }
      return;
    }
    if (state.destination === "colortbl") {
      if (token.name === "red") this.color.red = token.parameter ?? 0;
      else if (token.name === "green") this.color.green = token.parameter ?? 0;
      else if (token.name === "blue") this.color.blue = token.parameter ?? 0;
      return;
    }
    if (state.destination === "list" || state.destination === "listlevel") {
      if (token.name === "listid") this.currentListId = token.parameter ?? 0;
      else if (token.name === "levelnfc") {
        const level = this.currentListLevels.at(-1);
        if (level !== undefined) {
          level.kind = token.parameter === 23 ? "bullet" : "numbered";
          level.numberingType = fromRtfNfc(token.parameter ?? 0);
        }
      } else if (token.name === "levelstartat") {
        const level = this.currentListLevels.at(-1);
        if (level !== undefined && token.parameter !== undefined)
          level.start = Math.max(0, token.parameter);
      }
      return;
    }
    if (state.destination === "leveltext") return;
    if (state.destination === "listoverride") {
      if (token.name === "listid") this.currentOverrideListId = token.parameter ?? 0;
      else if (token.name === "ls") this.currentOverrideIndex = token.parameter ?? 0;
      return;
    }
    if (state.destination === "listtable" || state.destination === "listoverridetable") return;
    if (state.destination === "skip") return;
    this.DispatchBodyControl(token.name, token.parameter, state);
  }

  /** Applies one represented body control. @param name - RTF control. @param parameter - Optional value. @param state - Current group. */
  private DispatchBodyControl(name: string, parameter: number | undefined, state: RtfState): void {
    if (CHARACTER_PROPERTY_CONTROLS.has(name)) state.characterControls.add(name);
    if (name === "sect") {
      if (this.runs.length > 0) this.CommitParagraph(state);
      this.FlushTable();
      this.currentSection++;
      this.sectionPages.push({ ...this.defaultSectionPage });
      this.terminatedParagraph = true;
      return;
    }
    if (name === "sectd") {
      this.sectionPages[this.currentSection] = { ...this.defaultSectionPage };
      this.sectionPageRestarts.delete(this.currentSection);
      return;
    }
    if (name === "pgnrestart") {
      this.sectionPageRestarts.add(this.currentSection);
      return;
    }
    {
      const page = this.sectionPages[this.currentSection] as RtfSectionPage;
      if (name === "landscape" || name === "lndscpsxn") {
        page.landscape = true;
        if (name === "landscape") this.defaultSectionPage.landscape = true;
      } else if (parameter !== undefined) {
        switch (name) {
          case "paperw":
            this.defaultSectionPage.width = parameter;
            page.width = parameter;
            break;
          case "pgwsxn":
            page.width = parameter;
            break;
          case "paperh":
            this.defaultSectionPage.height = parameter;
            page.height = parameter;
            break;
          case "pghsxn":
            page.height = parameter;
            break;
          case "margl":
            this.defaultSectionPage.leftMargin = parameter;
            page.leftMargin = parameter;
            break;
          case "marglsxn":
            page.leftMargin = parameter;
            break;
          case "margr":
            this.defaultSectionPage.rightMargin = parameter;
            page.rightMargin = parameter;
            break;
          case "margrsxn":
            page.rightMargin = parameter;
            break;
          case "margt":
            this.defaultSectionPage.topMargin = parameter;
            page.topMargin = parameter;
            break;
          case "margtsxn":
            page.topMargin = parameter;
            break;
          case "margb":
            this.defaultSectionPage.bottomMargin = parameter;
            page.bottomMargin = parameter;
            break;
          case "margbsxn":
            page.bottomMargin = parameter;
            break;
        }
      }
    }
    if (name === "deftab" && parameter !== undefined) {
      this.defaultTabStop = parameter;
      return;
    }
    if (name === "pagebb") {
      if (!this.firstRun)
        state.paragraph = {
          ...state.paragraph,
          pageBreakBefore: true,
          pageBreakBeforeSet: true,
        };
      return;
    }
    if (name === "page" || name === "column") {
      // The represented document has one column: pinned COLUMN dispatches PAGE.
      // PAGE is ignored while the RTF table buffer owns the current row.
      if (this.inTable) return;
      if (this.runs.length > 0 || (this.pendingPageBreak && this.tableRows.length === 0))
        this.CommitParagraph(state);
      if (this.tableRows.length > 0) this.FlushTable();
      this.pendingPageBreak = true;
      return;
    }
    if (name === "trowd") {
      this.inTable = true;
      this.rowBoundaries = [];
      this.rowAlignment = "left";
      this.rowLeft = 0;
      this.rowHeight = 0;
      this.rowSplit = true;
      this.rowHeader = false;
      this.rowVerticals = [];
      this.nextCellVertical = undefined;
      this.rowBorders = [];
      this.nextCellBorders = new Map();
      this.activeBorder = undefined;
      this.rowPaddings = [];
      this.nextCellPaddings = new Map();
      this.rowDefaultPaddings = new Map();
      return;
    }
    if (name === "trpaddt" || name === "trpaddl" || name === "trpaddb" || name === "trpaddr") {
      const edge =
        name === "trpaddt"
          ? SvxBoxItemLine.TOP
          : name === "trpaddl"
            ? SvxBoxItemLine.LEFT
            : name === "trpaddb"
              ? SvxBoxItemLine.BOTTOM
              : SvxBoxItemLine.RIGHT;
      this.rowDefaultPaddings.set(edge, parameter ?? 0);
      return;
    }
    if (name === "clpadl" || name === "clpadt" || name === "clpadb" || name === "clpadr") {
      const edge =
        name === "clpadl"
          ? SvxBoxItemLine.TOP
          : name === "clpadt"
            ? SvxBoxItemLine.LEFT
            : name === "clpadb"
              ? SvxBoxItemLine.BOTTOM
              : SvxBoxItemLine.RIGHT;
      this.nextCellPaddings.set(edge, parameter ?? 0);
      return;
    }
    if (name === "clbrdrt" || name === "clbrdrl" || name === "clbrdrb" || name === "clbrdrr") {
      const edge =
        name === "clbrdrt"
          ? SvxBoxItemLine.TOP
          : name === "clbrdrl"
            ? SvxBoxItemLine.LEFT
            : name === "clbrdrb"
              ? SvxBoxItemLine.BOTTOM
              : SvxBoxItemLine.RIGHT;
      const border: RtfCellBorder = {
        style: BorderLineStyle.SOLID,
        width: 0,
        colorIndex: 0,
        wordStyle: 0,
      };
      this.nextCellBorders.set(edge, border);
      this.activeBorder = border;
      return;
    }
    if (this.activeBorder !== undefined && name.startsWith("brdr")) {
      if (name === "brdrw") this.activeBorder.width = parameter ?? 0;
      else if (name === "brdrcf") this.activeBorder.colorIndex = parameter ?? 0;
      else if (name === "brdrth") this.activeBorder.wordStyle = 2;
      else if (name === "brdrhair") {
        this.activeBorder.style = BorderLineStyle.SOLID;
        this.activeBorder.wordStyle = 5;
      } else this.activeBorder.style = fromRtfBorderStyle(name);
      return;
    }
    if (name === "clvertalt" || name === "clvertalc" || name === "clvertalb") {
      this.nextCellVertical =
        name === "clvertalc"
          ? VertOrientation.CENTER
          : name === "clvertalb"
            ? VertOrientation.BOTTOM
            : VertOrientation.TOP;
      return;
    }
    if (name === "trrh") {
      this.rowHeight = parameter ?? 0;
      return;
    }
    if (name === "trkeep") {
      this.rowSplit = false;
      return;
    }
    if (name === "trhdr") {
      this.rowHeader = true;
      return;
    }
    if (name === "trql" || name === "trqc" || name === "trqr") {
      this.rowAlignment = name === "trqc" ? "center" : name === "trqr" ? "right" : "left";
      return;
    }
    if (name === "trleft") {
      this.rowLeft = parameter ?? 0;
      return;
    }
    if (name === "cellx") {
      if (parameter !== undefined) {
        this.rowBoundaries.push(parameter);
        this.rowVerticals.push(this.nextCellVertical);
        this.nextCellVertical = undefined;
        this.rowBorders.push(this.nextCellBorders);
        this.nextCellBorders = new Map();
        this.rowPaddings.push(this.nextCellPaddings);
        this.nextCellPaddings = new Map();
        this.activeBorder = undefined;
      }
      return;
    }
    if (name === "intbl") {
      this.inTable = true;
      return;
    }
    if (name === "cell") {
      if (this.runs.length > 0 || this.tableCell.length === 0) this.CommitParagraph(state);
      this.tableRow.push(this.tableCell.splice(0));
      this.terminatedParagraph = true;
      return;
    }
    if (name === "row") {
      if (this.tableCell.length > 0 || this.runs.length > 0) {
        if (this.runs.length > 0) this.CommitParagraph(state);
        this.tableRow.push(this.tableCell.splice(0));
      }
      if (this.tableRow.length > 0)
        this.tableRows.push({
          cells: this.tableRow.splice(0),
          header: this.rowHeader,
          boundaries: this.rowBoundaries.splice(0),
          alignment: this.rowAlignment,
          left: this.rowLeft,
          height: this.rowHeight,
          split: this.rowSplit,
          verticals: this.rowVerticals.splice(0),
          borders: this.rowBorders.splice(0),
          paddings: this.rowPaddings.splice(0),
          defaultPaddings: this.rowDefaultPaddings,
        });
      this.inTable = false;
      this.terminatedParagraph = true;
      return;
    }
    if (name === "par") {
      this.CommitParagraph(state);
      return;
    }
    if (name === "line" || name === "tab" || name === "~" || name === "-") {
      this.AppendText(
        name === "line" ? "\n" : name === "tab" ? "\t" : name === "~" ? "\u00a0" : "\u00ad",
        state,
      );
      return;
    }
    if (name === "plain") {
      state.character = { ...DEFAULT_CHARACTER };
      state.characterControls.clear();
      state.currentCodepage = this.fontCodepages.get(this.defaultFontIndex) ?? this.defaultCodepage;
      return;
    }
    if (name === "pard") {
      if (!this.inTable && this.tableRows.length > 0) this.FlushTable();
      state.paragraph = { ...DEFAULT_PARAGRAPH };
      return;
    }
    if (name === "b" || name === "i" || name === "ul") {
      state.character = {
        ...state.character,
        [name === "b" ? "bold" : name === "i" ? "italic" : "underline"]: parameter !== 0,
      };
      return;
    }
    if (name === "ulnone") state.character = { ...state.character, underline: false };
    else if (name === "strike" || name === "striked")
      state.character = {
        ...state.character,
        strikeout:
          parameter === 0
            ? FontStrikeout.STRIKEOUT_NONE
            : name === "striked"
              ? FontStrikeout.STRIKEOUT_DOUBLE
              : FontStrikeout.STRIKEOUT_SINGLE,
      };
    else if (name === "super" || name === "sub")
      state.character = {
        ...state.character,
        escapement: {
          offset: name === "super" ? DFLT_ESC_SUPER : DFLT_ESC_SUB,
          height: DFLT_ESC_PROP,
        },
      };
    else if (name === "nosupersub") {
      const character = { ...state.character };
      Reflect.deleteProperty(character, "escapement");
      state.character = character;
    } else if ((name === "up" || name === "dn") && parameter !== undefined) {
      const up = name === "up",
        fontHeight = state.character.fontSizeTwips ?? 240;
      const offset = this.pendingUpDn?.automatic
        ? up
          ? DFLT_ESC_AUTO_SUPER
          : DFLT_ESC_AUTO_SUB
        : Math.round(((parameter * 1000) / fontHeight) * (up ? 1 : -1));
      state.character = {
        ...state.character,
        escapement: { offset, height: this.pendingUpDn?.height ?? 100 },
      };
      this.pendingUpDn = undefined;
    } else if (name === "ls" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, listOverride: parameter };
    else if (name === "s" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, styleIndex: parameter };
    else if (name === "ilvl" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, listLevel: Math.max(0, Math.min(9, parameter)) };
    else if (name === "fs" && parameter !== undefined && parameter > 0)
      state.character = { ...state.character, fontSizeTwips: parameter * 10 };
    else if (name === "f" && parameter !== undefined) {
      state.fontIndex = parameter;
      state.currentCodepage = this.fontCodepages.get(parameter) ?? this.defaultCodepage;
      const character = { ...state.character };
      Reflect.deleteProperty(character, "fontFamily");
      const fontFamily = this.fonts.get(parameter);
      state.character = { ...character, ...(fontFamily === undefined ? {} : { fontFamily }) };
    } else if (name === "cf" && parameter !== undefined) {
      state.colorIndex = parameter;
      const character = { ...state.character };
      Reflect.deleteProperty(character, "color");
      const color = parameter === 0 ? undefined : this.colors[parameter];
      state.character = { ...character, ...(color === undefined ? {} : { color }) };
    } else if (name === "highlight" && parameter !== undefined) {
      const character = { ...state.character };
      Reflect.deleteProperty(character, "highlight");
      const highlight = parameter === 0 ? undefined : this.colors[parameter];
      state.character = { ...character, ...(highlight === undefined ? {} : { highlight }) };
    } else if (name === "ql" || name === "qc" || name === "qr" || name === "qj")
      state.paragraph = {
        ...state.paragraph,
        alignmentSet: true,
        alignment:
          name === "ql" ? "left" : name === "qc" ? "center" : name === "qr" ? "right" : "justify",
      };
    else if (name === "li" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, left: Math.max(0, parameter), leftSet: true };
    else if (name === "ri" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, right: Math.max(0, parameter), rightSet: true };
    else if (name === "fi" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, firstLine: parameter, firstLineSet: true };
    else if (name === "sb" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, before: Math.max(0, parameter), beforeSet: true };
    else if (name === "sa" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, after: Math.max(0, parameter), afterSet: true };
    else if (name === "contextualspace")
      state.paragraph = { ...state.paragraph, contextual: true, contextualSet: true };
    else if (name === "keepn")
      state.paragraph = { ...state.paragraph, keepNext: true, keepNextSet: true };
    else if (name === "keep")
      state.paragraph = {
        ...state.paragraph,
        keepTogether: true,
        keepTogetherSet: true,
      };
    else if (name === "widctlpar" || name === "nowidctlpar")
      state.paragraph = {
        ...state.paragraph,
        widowControl: name === "widctlpar",
        widowControlSet: true,
      };
    else if (name === "tqr" || name === "tqc" || name === "tqdec")
      state.paragraph = {
        ...state.paragraph,
        tabAdjustment:
          name === "tqr"
            ? SvxTabAdjust.Right
            : name === "tqc"
              ? SvxTabAdjust.Center
              : SvxTabAdjust.Decimal,
      };
    else if (name === "tldot" || name === "tlul" || name === "tlth")
      state.paragraph = {
        ...state.paragraph,
        // Pinned rtftok maps both tlul and tlth to the underscore leader.
        tabFill: name === "tldot" ? "." : "_",
      };
    else if (name === "tx" && parameter !== undefined)
      state.paragraph = {
        ...state.paragraph,
        tabStops: [
          ...state.paragraph.tabStops,
          new SvxTabStop(parameter, state.paragraph.tabAdjustment, "\0", state.paragraph.tabFill),
        ],
        tabStopsSet: true,
        tabAdjustment: SvxTabAdjust.Left,
        tabFill: " ",
      };
    else if (name === "sl" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, lineSpace: parameter, lineSpacingSet: true };
    else if (name === "slmult" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, lineMulti: parameter, lineSpacingSet: true };
  }

  /** Appends text with group-scoped character state. @param value - Visible text. @param state - Current group. */
  private AppendText(value: string, state: RtfState): void {
    if (value.length === 0) return;
    this.firstRun = false;
    if (!this.inTable && this.tableRows.length > 0) this.FlushTable();
    const previous = this.runs.at(-1);
    if (
      previous !== undefined &&
      equalWriterHyperlinks(previous.hyperlink, state.hyperlink) &&
      equalControls(previous.controls, state.characterControls) &&
      equalCharacter(previous.attributes, state.character)
    )
      this.runs[this.runs.length - 1] = { ...previous, text: previous.text + value };
    else
      this.runs.push({
        text: value,
        attributes: { ...state.character },
        controls: new Set(state.characterControls),
        ...(state.hyperlink === undefined ? {} : { hyperlink: state.hyperlink }),
      });
    this.terminatedParagraph = false;
  }

  /** Completes a paragraph at native \par or document end. @param state - Current group. */
  private CommitParagraph(state = this.states.at(-1)): void {
    this.firstRun = false;
    const paragraph: RtfParagraph = {
      runs: this.runs.splice(0),
      state: {
        ...(state?.paragraph ?? DEFAULT_PARAGRAPH),
        ...(this.pendingPageBreak && !this.inTable
          ? { pageBreakBefore: true, pageBreakBeforeSet: true }
          : {}),
      },
      marks: this.marks.splice(0),
    };
    if (this.inTable) this.tableCell.push(paragraph);
    else {
      this.blocks.push({ kind: "paragraph", paragraph, section: this.currentSection });
      this.pendingPageBreak = false;
    }
    this.terminatedParagraph = true;
  }

  /** Completes rows as one native table block. */
  private FlushTable(): void {
    if (this.tableRows.length === 0) return;
    this.blocks.push({
      kind: "table",
      rows: this.tableRows.splice(0),
      section: this.currentSection,
      pageBreakBefore: this.pendingPageBreak,
    });
    this.pendingPageBreak = false;
  }

  /** Adds one font-family table token. @param value - Font text. @param state - Current group. */
  private ReadFontText(value: string, state: RtfState): void {
    for (const character of value) {
      if (character === ";") this.CommitFont(state);
      else this.fontName += character;
    }
  }

  /** Completes the current font table entry. @param state - Current group. */
  private CommitFont(state: RtfState): void {
    const name = this.fontName.trim();
    if (name.length > 0) {
      const lastSpace = name.lastIndexOf(" ");
      const suffix =
        lastSpace < 0 ? undefined : RTF_FONT_SUFFIX_CODEPAGE.get(name.slice(lastSpace + 1));
      this.fonts.set(state.fontIndex, suffix === undefined ? name : name.slice(0, lastSpace));
      if (suffix !== undefined || state.fontCodepage !== undefined)
        this.fontCodepages.set(
          state.fontIndex,
          suffix ?? state.fontCodepage ?? this.defaultCodepage,
        );
    }
    this.fontName = "";
  }

  /** Converts ANSI bytes only after the current group and selected font are known. */
  private DecodeBytes(bytes: Uint8Array, state: RtfState): string {
    const encoding = getTextToUnicodeData(
      rtl_getTextEncodingFromWindowsCodePage(state.currentCodepage),
    );
    if (encoding !== undefined) {
      const destination = new Uint16Array(bytes.length);
      const flags = OSTRING_TO_OUSTRING_CVTFLAGS | RTL_TEXTTOUNICODE_FLAGS_FLUSH;
      const written =
        encoding.kind === "symbol"
          ? ImplSymbolToUnicode(
              null,
              null,
              bytes,
              bytes.length,
              destination,
              destination.length,
              flags,
              [0],
              [0],
            )
          : encoding.kind === "utf8"
            ? ImplConvertUtf8ToUnicode(
                null,
                null,
                bytes,
                bytes.length,
                destination,
                destination.length,
                flags,
                [0],
                [0],
              )
            : convertCharToUnicode(
                encoding.data,
                null,
                bytes,
                bytes.length,
                destination,
                destination.length,
                flags,
                [0],
                [0],
              );
      let text = "";
      for (let offset = 0; offset < written; offset += 8192)
        text += String.fromCharCode(
          ...destination.subarray(offset, Math.min(offset + 8192, written)),
        );
      return text;
    }
    try {
      return new TextDecoder(rtfDecoderLabel(state.currentCodepage)).decode(bytes);
    } catch {
      throw new RtfSyntaxError(`Unsupported RTF code page: ${state.currentCodepage}.`);
    }
  }

  /** Adds color table entries separated by semicolons. @param value - Color table text. */
  private ReadColorText(value: string): void {
    for (const character of value)
      if (character === ";") {
        const { red, green, blue } = this.color;
        this.colors.push(
          `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`,
        );
        this.color = { red: 0, green: 0, blue: 0 };
      }
  }
}

/** Materializes absolute RTF tab positions through the native sorted item. */
function createRtfTabStops(stops: readonly SvxTabStop[]): SvxTabStopItem {
  const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  for (const stop of stops) item.Insert(stop);
  return item;
}

/** Maps Word line height modes through the native Writer spacing item. */
function createRtfLineSpacing(paragraph: RtfParagraphState): SvxLineSpacingItem {
  const item = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
  const space = paragraph.lineSpace;
  if (space < 0) {
    item.SetLineHeight(-space);
    item.SetLineSpaceRule(SvxLineSpaceRule.Fix);
  } else if (paragraph.lineMulti > 0) item.SetPropLineSpace(Math.round((space * 100) / 240));
  else item.SetLineHeight(space);
  return item;
}

/** Compares complete direct character state. @param a - First. @param b - Second. @returns Equality. */
function equalCharacter(a: WriterCharacterAttributes, b: WriterCharacterAttributes): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.fontFamily === b.fontFamily &&
    a.fontSizeTwips === b.fontSizeTwips &&
    a.color === b.color &&
    a.highlight === b.highlight &&
    a.strikeout === b.strikeout &&
    a.escapement?.offset === b.escapement?.offset &&
    a.escapement?.height === b.escapement?.height
  );
}

/** Keeps absent RTF direct controls inherited from the selected paragraph style. */
function resolveRtfRunAttributes(
  run: RtfRun,
  inherited: WriterCharacterAttributes,
): WriterCharacterAttributes {
  const controls = run.controls;
  const has = (...names: string[]) => names.some((name) => controls.has(name));
  return {
    bold: has("b") ? run.attributes.bold : inherited.bold,
    italic: has("i") ? run.attributes.italic : inherited.italic,
    underline: has("ul", "ulnone") ? run.attributes.underline : inherited.underline,
    ...(has("f")
      ? run.attributes.fontFamily === undefined
        ? {}
        : { fontFamily: run.attributes.fontFamily }
      : inherited.fontFamily === undefined
        ? {}
        : { fontFamily: inherited.fontFamily }),
    ...(has("fs")
      ? run.attributes.fontSizeTwips === undefined
        ? {}
        : { fontSizeTwips: run.attributes.fontSizeTwips }
      : inherited.fontSizeTwips === undefined
        ? {}
        : { fontSizeTwips: inherited.fontSizeTwips }),
    ...(has("cf")
      ? { color: run.attributes.color ?? "auto" }
      : inherited.color === undefined
        ? {}
        : { color: inherited.color }),
    ...(has("highlight")
      ? { highlight: run.attributes.highlight ?? "transparent" }
      : inherited.highlight === undefined
        ? {}
        : { highlight: inherited.highlight }),
    ...(has("strike", "striked")
      ? { strikeout: run.attributes.strikeout ?? FontStrikeout.STRIKEOUT_NONE }
      : inherited.strikeout === undefined
        ? {}
        : { strikeout: inherited.strikeout }),
    ...(has("super", "sub", "up", "dn", "nosupersub")
      ? { escapement: run.attributes.escapement ?? { offset: 0, height: 100 } }
      : inherited.escapement === undefined
        ? {}
        : { escapement: inherited.escapement }),
  };
}

/** Compares explicit-control sets before adjacent RTF runs are coalesced. */
function equalControls(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  return left.size === right.size && [...left].every((name) => right.has(name));
}

/** Extracts Word field command parts with the quoted-space and screen-tip rules of FieldContext. */
function getRtfFieldCommandParts(command: string): string[] {
  const parts: string[] = [];
  let inString = false;
  let screenTip = false;
  let part = "";
  const tokens = command.split(" ").filter((token) => token.length > 0);
  for (const [index, sourceToken] of tokens.entries()) {
    let token = sourceToken;
    let inStringNext: boolean = inString;
    if (screenTip) {
      let removeQuotation = true;
      inStringNext = index < tokens.length - 1;
      if (token.startsWith('"') && !inString) token = token.slice(1);
      if (token.startsWith("\\")) {
        removeQuotation = false;
        token = token.replaceAll("\\", "");
      }
      if (!inStringNext && removeQuotation) token = token.slice(0, -1);
    } else {
      if (token.startsWith('"')) {
        inStringNext = true;
        token = token.slice(1);
      }
      if (token.endsWith('"')) {
        inStringNext = false;
        token = token.slice(0, -1);
      }
    }
    if (token === "\\o") screenTip = true;
    if (inString) {
      part += ` ${token}`;
      if (!inStringNext) parts.push(part);
    } else if (inStringNext) part = token;
    else parts.push(token);
    inString = inStringNext;
  }
  return parts;
}

/** Applies the pinned DomainMapper HYPERLINK switches to one represented Writer link. */
function parseRtfHyperlinkInstruction(instruction: string): WriterHyperlink | undefined {
  const parts = getRtfFieldCommandParts(instruction);
  if (parts[0]?.toUpperCase() !== "HYPERLINK") return undefined;
  let url = "";
  let targetFrame = "";
  let name = "";
  for (let index = 1; index < parts.length; index++) {
    const part = parts[index];
    if (part === "\\l") url += `#${parts[++index] ?? ""}`;
    else if (part === "\\t") targetFrame = parts[++index] ?? "";
    else if (part === "\\o") name = parts[++index] ?? "";
    else if (part !== "\\m" && part !== "\\n" && part !== "\\h")
      url = part?.replaceAll("\\\\", "\\") ?? "";
  }
  if (url.length === 0) return undefined;
  if (url.startsWith("file:///")) url = url.replaceAll("\\", "/");
  return {
    url,
    ...(targetFrame.length === 0 ? {} : { targetFrame }),
    ...(name.length === 0 ? {} : { name }),
  };
}

/** Resolves RTF list level formats accepted by the current native numbering model. */
function fromRtfNfc(value: number): SvxNumType {
  switch (value) {
    case 1:
      return SvxNumType.SVX_NUM_ROMAN_UPPER;
    case 2:
      return SvxNumType.SVX_NUM_ROMAN_LOWER;
    case 3:
      return SvxNumType.SVX_NUM_CHARS_UPPER_LETTER;
    case 4:
      return SvxNumType.SVX_NUM_CHARS_LOWER_LETTER;
    case 14:
      return SvxNumType.SVX_NUM_FULL_WIDTH_ARABIC;
    case 18:
      return SvxNumType.SVX_NUM_CIRCLE_NUMBER;
    case 35:
      return SvxNumType.SVX_NUM_NUMBER_LOWER_ZH;
    case 38:
      return SvxNumType.SVX_NUM_NUMBER_UPPER_ZH;
    case 34:
      return SvxNumType.SVX_NUM_NUMBER_UPPER_ZH_TW;
    case 30:
      return SvxNumType.SVX_NUM_TIAN_GAN_ZH;
    case 31:
      return SvxNumType.SVX_NUM_DI_ZI_ZH;
    case 16:
      return SvxNumType.SVX_NUM_NUMBER_TRADITIONAL_JA;
    case 20:
      return SvxNumType.SVX_NUM_AIU_FULLWIDTH_JA;
    case 12:
      return SvxNumType.SVX_NUM_AIU_HALFWIDTH_JA;
    case 21:
      return SvxNumType.SVX_NUM_IROHA_FULLWIDTH_JA;
    case 13:
      return SvxNumType.SVX_NUM_IROHA_HALFWIDTH_JA;
    case 24:
      return SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO;
    case 25:
      return SvxNumType.SVX_NUM_HANGUL_JAMO_KO;
    case 42:
      return SvxNumType.SVX_NUM_NUMBER_HANGUL_KO;
    case 41:
      return NumberingType.NUMBER_DIGITAL_KO as SvxNumType;
    case 44:
      return NumberingType.NUMBER_DIGITAL2_KO as SvxNumType;
    case 43:
      return NumberingType.NUMBER_LEGAL_KO as SvxNumType;
    case 23:
      return SvxNumType.SVX_NUM_CHAR_SPECIAL;
    case 255:
      return SvxNumType.SVX_NUM_NUMBER_NONE;
    case 22:
      return SvxNumType.SVX_NUM_ARABIC_ZERO;
    default:
      return SvxNumType.SVX_NUM_ARABIC;
  }
}

/** Resolves source RTF cell border keywords to native border styles. */
function fromRtfBorderStyle(name: string): BorderLineStyle {
  switch (name) {
    case "brdrdot":
      return BorderLineStyle.DOTTED;
    case "brdrdash":
      return BorderLineStyle.DASHED;
    case "brdrdb":
      return BorderLineStyle.DOUBLE;
    case "brdrtnthsg":
      return BorderLineStyle.THINTHICK_SMALLGAP;
    case "brdrtnthmg":
      return BorderLineStyle.THINTHICK_MEDIUMGAP;
    case "brdrtnthlg":
      return BorderLineStyle.THINTHICK_LARGEGAP;
    case "brdrthtnsg":
      return BorderLineStyle.THICKTHIN_SMALLGAP;
    case "brdrthtnmg":
      return BorderLineStyle.THICKTHIN_MEDIUMGAP;
    case "brdrthtnlg":
      return BorderLineStyle.THICKTHIN_LARGEGAP;
    case "brdremboss":
      return BorderLineStyle.EMBOSSED;
    case "brdrengrave":
      return BorderLineStyle.ENGRAVED;
    case "brdroutset":
      return BorderLineStyle.OUTSET;
    case "brdrinset":
      return BorderLineStyle.INSET;
    case "brdrdashsm":
      return BorderLineStyle.FINE_DASHED;
    case "brdrdashd":
      return BorderLineStyle.DASH_DOT;
    case "brdrdashdd":
      return BorderLineStyle.DASH_DOT_DOT;
    case "brdrnone":
      return BorderLineStyle.NONE;
    default:
      return BorderLineStyle.SOLID;
  }
}
