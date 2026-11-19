/** @fileoverview DOCX body traversal over Writer's actual text and table nodes and native run serializers. */
import { SdtBlockHelper } from "./docxattributeoutput.sdt";
import type { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import type { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import type { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS } from "../../../../sax/inc/fshelper";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_KERNING,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
} from "../../../inc/hintids";
import { SwTableNode } from "../../core/docnode/node";
import { CharFormat } from "../../core/text/atrstck";
import { SwAttrIter } from "../../core/text/itratr";
import { SwFormatCharFormat, SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  SectionProperties,
  type MSWordSections,
  type WW8SepInfo,
} from "./docxattributeoutput.section";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { EndURL, StartURL, type DocxBookmarks } from "./docxattributeoutput.hyperlink";
import { SwWW8AttrIter } from "./wrtw8nds";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import type { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import { ImplCellMargins, TableDefaultCellMargins, TableDefinition } from "./docxtableexport";

const w = token("w");
const runProperties = [
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_COLOR,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_KERNING,
];

/** Native AttributeOutputBase character item dispatch for the represented run properties. @param output - Actual attribute writer. @param item - Native effective item. @returns Nothing. */
export function OutputItem(output: DocxAttributeOutput, item: SfxPoolItem): void {
  switch (item.Which()) {
    case RES_CHRATR_FONT:
      output.CharFont(item as SvxFontItem);
      break;
    case RES_CHRATR_CJK_FONT:
      output.CharFontCJK(item as SvxFontItem);
      break;
    case RES_CHRATR_CTL_FONT:
      output.CharFontCTL(item as SvxFontItem);
      break;
    case RES_CHRATR_WEIGHT:
      output.CharWeight(item as SvxWeightItem);
      break;
    case RES_CHRATR_POSTURE:
      output.CharPosture(item as SvxPostureItem);
      break;
    case RES_CHRATR_GRABBAG:
      output.CharGrabBag(item as SfxGrabBagItem);
      break;
    case RES_CHRATR_COLOR:
      output.CharColor(item as SvxColorItem);
      break;
    case RES_CHRATR_FONTSIZE:
    case RES_CHRATR_CTL_FONTSIZE:
      output.CharFontSize(item as SvxFontHeightItem);
      break;
    case RES_CHRATR_LANGUAGE:
    case RES_CHRATR_CJK_LANGUAGE:
    case RES_CHRATR_CTL_LANGUAGE:
      output.CharLanguage(item as SvxLanguageItem);
      break;
    case RES_CHRATR_HIGHLIGHT:
      output.CharHighlight(item as SvxBrushItem);
      break;
    case RES_CHRATR_UNDERLINE:
      output.CharUnderline(item as SvxUnderlineItem);
      break;
    case RES_CHRATR_KERNING:
      output.CharKerning(item as SvxKerningItem);
      break;
  }
}

/** Visits text item and bookmark boundaries and writes schema-ordered runs. @param output - Actual writer. @param node - Paragraph. @param bookmarks - Body bookmark output. @param section - Section boundary. @returns Nothing. */
function Out_SwTextNode(
  output: DocxAttributeOutput,
  node: SwTextNode,
  bookmarks: DocxBookmarks,
  section?: WW8SepInfo,
): void {
  const serializer = output.GetSerializer();
  const paragraph = token("p");
  serializer.startElementNS(w, paragraph);
  output.OutputParagraphProperties(node, section);
  const text = node.GetText();
  const hints = node.GetpSwpHints()?.entries() ?? [];
  const boundaries = new Set([0, text.length, ...bookmarks.Offsets(node)]);
  for (const hint of hints) {
    boundaries.add(Math.min(text.length, hint.start));
    boundaries.add(Math.min(text.length, hint.end));
  }
  const offsets = [...boundaries].sort(
    /** Orders UTF16 offsets. @param first - Offset. @param second - Offset. @returns Difference. */ (
      first,
      second,
    ) => first - second,
  );
  const iterator = new SwAttrIter(node);
  const snippets = new SwWW8AttrIter();
  const styles = output.GetExport().m_pStyles;
  const inherit = styles === undefined || styles.GetSlot(node.GetTextFormatColl()) === 0x0fff;
  const paragraphItems = inherit ? node.GetSwAttrSet() : node.GetpSwAttrSet();
  let openLink: (typeof hints)[number] | undefined;
  let linkField = false;
  for (let index = 0; index + 1 < offsets.length; ++index) {
    const start = offsets[index] as number;
    const end = offsets[index + 1] as number;
    const snippet = snippets.GetSnippet(text, start, end - start);
    const active = hints.filter(
      /** Collects hints that cover the native run. @param hint - Actual hint. @returns Whether it applies. */ (
        hint,
      ) => hint.start <= start && end <= hint.end,
    );
    const link = active.find(
      /** Resolves the hyperlink range for this run. @param hint - Active hint. @returns Whether this is an Internet format. */
      (hint) => hint.format instanceof SwFormatINetFormat,
    );
    if (link !== openLink) {
      if (openLink) EndURL(output, linkField);
      openLink = link;
      if (link?.format instanceof SwFormatINetFormat)
        linkField = StartURL(output, link.format.GetHyperlink());
    }
    bookmarks.WriteAt(output, node, start);
    if (!snippet) continue;
    let charSlot = 0x0fff;
    if (styles) {
      for (const { format } of active) {
        if (format instanceof SwFormatCharFormat) {
          const character = format.GetCharFormat();
          if (character) charSlot = styles.GetSlot(character);
        }
      }
    }
    iterator.Seek(start);
    const items: SfxPoolItem[] = [];
    for (const which of runProperties) {
      const item = active.some(
        /** Resolves which items are represented by this hint. @param hint - Native hint. @returns Whether it supplies the item. */ (
          hint,
        ) => CharFormat.IsItemIncluded(which, hint),
      )
        ? iterator.GetAttrHandler().ReadItem(which)
        : paragraphItems?.GetItemIfSet(which, inherit);
      if (item) items.push(item);
    }
    output.StartRun(null, start);
    if (items.length || charSlot !== 0x0fff) {
      output.StartRunProperties();
      if (styles && charSlot !== 0x0fff)
        serializer.singleElementNS(
          w,
          token("rStyle"),
          FSNS(w, token("val")),
          styles.GetStyleId(charSlot),
        );
      for (const item of items) OutputItem(output, item);
      output.EndRunProperties();
    }
    output.RawText(snippet, RTL_TEXTENCODING_UTF8);
    output.EndRun(node, start, end - start, end === offsets.at(-1));
  }
  if (openLink) EndURL(output, linkField);
  bookmarks.WriteAt(output, node, text.length);
  serializer.endElementNS(w, paragraph);
}

/** Writes actual Writer table rows and cell sections. @param output - Actual writer. @param node - Source table node. @param bookmarks - Body bookmark output. @returns Nothing. */
function Out_SwTableNode(
  output: DocxAttributeOutput,
  node: SwTableNode,
  bookmarks: DocxBookmarks,
): void {
  const serializer = output.GetSerializer();
  const table = token("tbl"),
    row = token("tr"),
    cell = token("tc");
  const model = node.GetTable();
  const rows = model.GetTabLines();
  const defaultMargins = TableDefaultCellMargins(model);
  const grid = new Set([0]);
  for (const line of rows) {
    let right = 0;
    for (const box of line.GetTabBoxes()) {
      right += box.GetFrameFormat().GetFrameSize().GetWidth();
      grid.add(right);
    }
  }
  const edges = [...grid].sort(
    /** Orders cumulative grid positions. @param left - Edge. @param right - Edge. @returns Difference. */ (
      left,
      right,
    ) => left - right,
  );
  const slots = new Map(
    edges.map(
      /** Maps each boundary to its grid slot. @param edge - Twip offset. @param index - Column slot. @returns Lookup entry. */ (
        edge,
        index,
      ) => [edge, index],
    ),
  );
  serializer.startElementNS(w, table);
  TableDefinition(output, model);
  serializer.startElementNS(w, token("tblGrid"));
  for (let i = 1; i < edges.length; ++i) {
    const width = (edges[i] as number) - (edges[i - 1] as number);
    serializer.singleElementNS(w, token("gridCol"), FSNS(w, w), String(width));
  }
  serializer.endElementNS(w, token("tblGrid"));
  for (const line of rows) {
    serializer.startElementNS(w, row);
    const format = line.GetFrameFormat();
    const size = format.GetFrameSize();
    const height = size.GetHeight();
    const rule = size.GetHeightSizeType();
    const cantSplit = !format.GetRowSplit().GetValue();
    if (cantSplit || (height && rule !== SwFrameSize.Variable)) {
      const properties = token("trPr");
      serializer.startElementNS(w, properties);
      if (cantSplit) serializer.singleElementNS(w, token("cantSplit"));
      if (height && rule !== SwFrameSize.Variable)
        serializer.singleElementNS(
          w,
          token("trHeight"),
          FSNS(w, token("val")),
          String(height),
          FSNS(w, token("hRule")),
          rule === SwFrameSize.Fixed ? "exact" : "atLeast",
        );
      serializer.endElementNS(w, properties);
    }
    let edge = 0;
    for (const box of line.GetTabBoxes()) {
      serializer.startElementNS(w, cell);
      const width = box.GetFrameFormat().GetFrameSize().GetWidth();
      const next = edge + width;
      const columns = (slots.get(next) as number) - (slots.get(edge) as number);
      edge = next;
      const rowSpan = box.getRowSpan();
      const alignment = box.GetFrameFormat().GetVertOrient().GetVertOrient();
      const vertical =
        alignment === VertOrientation.CENTER
          ? "center"
          : alignment === VertOrientation.BOTTOM
            ? "bottom"
            : null;
      const properties = token("tcPr"),
        value = FSNS(w, token("val"));
      serializer.startElementNS(w, properties);
      serializer.singleElementNS(
        w,
        token("tcW"),
        FSNS(w, w),
        String(width),
        FSNS(w, token("type")),
        "dxa",
      );
      if (columns > 1) serializer.singleElementNS(w, token("gridSpan"), value, String(columns));
      if (rowSpan !== 1)
        serializer.singleElementNS(w, token("vMerge"), value, rowSpan > 1 ? "restart" : "continue");
      ImplCellMargins(output, box.GetFrameFormat().GetBox(), "tcMar", defaultMargins);
      if (vertical) serializer.singleElementNS(w, token("vAlign"), value, vertical);
      serializer.endElementNS(w, properties);
      const content = box.GetContentNodes();
      WriteText(output, content, bookmarks);
      if (!content.length || content.at(-1) instanceof SwTableNode)
        serializer.singleElementNS(w, token("p"));
      serializer.endElementNS(w, cell);
    }
    serializer.endElementNS(w, row);
  }
  serializer.endElementNS(w, table);
}

/** Original body traversal dispatches native node types. @param output - DOCX attributes. @param content - Writer body or cell section. @param bookmarks - Body bookmark output. @param sections - Native body section owner. @returns Nothing. */
export function WriteText(
  output: DocxAttributeOutput,
  content: readonly (SwTextNode | SwTableNode)[],
  bookmarks: DocxBookmarks,
  sections?: MSWordSections,
): void {
  const sdt = new SdtBlockHelper(output.GetSerializer());
  for (const [index, node] of content.entries()) {
    const section = sections?.Advance(content[index + 1]);
    if (node instanceof SwTableNode) {
      Out_SwTableNode(output, node, bookmarks);
      if (section) {
        sdt.EndSdtBlock();
        const serializer = output.GetSerializer();
        serializer.startElementNS(w, token("p"));
        serializer.startElementNS(w, token("pPr"));
        SectionProperties(output, section);
        serializer.endElementNS(w, token("pPr"));
        serializer.endElementNS(w, token("p"));
      }
    } else {
      sdt.StartParagraph(node);
      Out_SwTextNode(output, node, bookmarks, section);
      if (section) sdt.EndSdtBlock();
    }
  }
  sdt.EndSdtBlock();
}
