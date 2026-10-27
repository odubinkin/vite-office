/** @fileoverview Writer Markdown parser/document owner from pinned sw/source/filter/md/swmd.cxx. */
import { md_parse } from "../../../../external/md4c/src/md4c";
import {
  MD_DIALECT_GITHUB,
  MD_FLAG_WIKILINKS,
  MD_BLOCKTYPE,
  MD_ALIGN,
  type MD_BLOCK_LI_DETAIL,
} from "../../../../external/md4c/src/md4c.h";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { Color } from "../../../../tools/inc/color";
import {
  RES_UL_SPACE,
  RES_PARATR_NUMRULE,
  RES_PARATR_ADJUST,
  RES_BACKGROUND,
} from "../../../inc/hintids";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { IsDefBulletFontUserDefined, GetDefBulletFont } from "../../core/doc/number-bullet";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import { resetTextFormatCollAttributes, setTextFormatCollAtNode } from "../../core/doc/docfmt";
import { resetParagraphTextAttributes } from "../../core/txtnode/txtedt";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { DontExpandFormat } from "../../core/txtnode/ndtxt-format-change";
import { SwNumRule } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import { SwMdNumRuleInfo, MD_NUMBER_BULLET_INDENT, MD_NUMBER_BULLET_MARGINLEFT } from "./mdnum";
import { MDTable } from "./mdtab";
import * as callbacks from "./mdcallbcks";

const MD_PARSPACE = Math.round((5 * 1440) / 25.4);
/** Native append mode values retain explicit spacing versus soft state. */
export enum SwMdAppendMode {
  /** Preserve margins. */ AM_NORMAL,
  /** Explicitly zero the prior lower margin. */ AM_NOSPACE,
  /** Supply source paragraph spacing when missing. */ AM_SPACE,
  /** Remember no spacing without setting margins. */ AM_SOFTNOSPACE,
  /** No append mode value. */ AM_NONE,
}

/** Source reader creates a document and lets callbacks operate on its actual PaM. */
export class MarkdownReader {
  /** Imports source bytes without fatal validation or newline normalization. @param bytes - Source bytes. @param options - Document environment. @param baseURL - Medium URL. @returns Document. */
  public Read(bytes: Uint8Array, options: SwDocOptions = {}, baseURL = ""): SwDoc {
    if (bytes.length === 0) throw new Error("Invalid Markdown byte stream.");
    const document = new SwDoc(options),
      first = document.paragraphs[0];
    if (first === undefined) throw new Error("Writer body has no text node.");
    const position = new SwPosition(first),
      pam = new SwPaM(position);
    position.Dispose();
    try {
      new SwMarkdownParser(document, pam, baseURL).CallParser(bytes);
      return document;
    } catch (error) {
      document.Dispose();
      throw error;
    } finally {
      pam.Dispose();
    }
  }
}
/** Direct callback owner; there is no intermediary block tree or browser formatting projection. */
export class SwMarkdownParser {
  public readonly m_aAttrStack: (SfxPoolItem | undefined)[] = [];
  public readonly m_aImg = { url: "", title: "", desc: "", link: "" };
  public m_bInsideImage = false;
  public m_htmlData = "";
  private readonly numInfo = new SwMdNumRuleInfo();
  private blockQuoteDepth = 0;
  private noParSpace = false;
  private table: MDTable | undefined;
  /** Binds the native document, registered cursor and source medium. @param m_xDoc - Document. @param m_pPam - Cursor. @param m_sBaseURL - Medium URL. @returns Parser. */
  public constructor(
    public readonly m_xDoc: SwDoc,
    public readonly m_pPam: SwPaM,
    public readonly m_sBaseURL = "",
  ) {}
  /** Calls the actual pinned md4c port with Writer's source flags. @param source - Native UTF-8 byte stream. @returns Nothing on success. */
  public CallParser(source: Uint8Array): void {
    if (source.length === 0) throw new Error("Invalid Markdown byte stream.");
    this.SetStyle("text-body");
    const result = md_parse(
      source,
      source.length,
      {
        abi_version: 0,
        flags: MD_DIALECT_GITHUB | MD_FLAG_WIKILINKS,
        enter_block: callbacks.enter_block_callback,
        leave_block: callbacks.leave_block_callback,
        enter_span: callbacks.enter_span_callback,
        leave_span: callbacks.leave_span_callback,
        text: callbacks.text_callback,
      },
      this,
    );
    if (result !== 0) throw new Error("Markdown parser failed.");
  }
  /** Reads the current native text owner. @returns Text node. */
  public GetTextNode(): SwTextNode {
    const node = this.m_pPam.GetPoint().GetNode();
    if (!(node instanceof SwTextNode)) throw new Error("Markdown callback has no text node.");
    return node;
  }
  /** Changes the actual paragraph collection. @param id - Native pool style identity. @returns Nothing. */
  private SetStyle(id: Parameters<SwDoc["GetTextFormatColl"]>[0]): void {
    setTextFormatCollAtNode(this.GetTextNode(), this.m_xDoc.GetTextFormatColl(id), false);
  }
  /** Erases at most two trailing line feeds from the actual cursor. @returns Erased count. */
  public StripTrailingLF(): number {
    const node = this.GetTextNode(),
      end = this.m_pPam.GetPoint().GetContentIndex();
    let count = 0;
    while (count < end && node.GetText()[end - count - 1] === "\n") count++;
    count = Math.min(count, 2);
    if (count !== 0) node.EraseText(end - count, count);
    return count;
  }
  /** Appends via the native content owner and updates source spacing/list state. @param mode - Margin policy. @param updateNum - Whether to set continuation numbering. @returns Success. */
  public AppendTextNode(mode: SwMdAppendMode, updateNum = true): boolean {
    const stripped = this.StripTrailingLF();
    if (
      (mode === SwMdAppendMode.AM_NOSPACE || mode === SwMdAppendMode.AM_SOFTNOSPACE) &&
      stripped > 1
    )
      mode = SwMdAppendMode.AM_SPACE;
    const node = this.GetTextNode();
    if (mode === SwMdAppendMode.AM_SPACE || mode === SwMdAppendMode.AM_NOSPACE) {
      const space = node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem,
        noSpace = mode === SwMdAppendMode.AM_NOSPACE;
      if (noSpace ? space.GetLower() > 0 : space.GetLower() === 0) {
        const inherited = node.GetTextFormatColl().GetULSpace();
        if (
          (noSpace ? inherited.GetLower() === 0 : inherited.GetLower() > 0) &&
          inherited.GetUpper() === space.GetUpper()
        )
          node.ResetAttr(RES_UL_SPACE);
        else
          node.SetAttr(
            new SvxULSpaceItem(space.GetUpper(), noSpace ? 0 : MD_PARSPACE, RES_UL_SPACE),
          );
      }
    }
    this.noParSpace = mode === SwMdAppendMode.AM_NOSPACE || mode === SwMdAppendMode.AM_SOFTNOSPACE;
    const result = this.m_xDoc
      .GetDocumentContentOperationsManager()
      .AppendTextNode(this.m_pPam.GetPoint());
    if (updateNum) {
      if (this.numInfo.GetDepth() !== 0) this.SetNodeNum(this.numInfo.GetLevel());
      else this.GetTextNode().ResetAttr(RES_PARATR_NUMRULE);
    }
    return result;
  }
  /** Restores paragraph spacing only after a remembered no-space append. @returns Nothing. */
  public AddParSpace(): void {
    if (!this.noParSpace) return;
    this.noParSpace = false;
    const node = this.m_xDoc.GetNodes().at(this.GetTextNode().GetIndex() - 1);
    if (!(node instanceof SwTextNode)) return;
    const space = node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
    if (space.GetLower() !== 0) return;
    const inherited = node.GetTextFormatColl().GetULSpace();
    if (inherited.GetLower() !== 0 && inherited.GetUpper() === space.GetUpper())
      node.ResetAttr(RES_UL_SPACE);
    node.SetAttr(new SvxULSpaceItem(space.GetUpper(), MD_PARSPACE, RES_UL_SPACE));
  }
  /** Starts or ends an ordinary paragraph using the same source transition. @returns Nothing. */
  public StartPara(): void {
    if (this.m_pPam.GetPoint().GetContentIndex() !== 0)
      this.AppendTextNode(SwMdAppendMode.AM_SPACE);
    else this.AddParSpace();
  }
  /** Ends an ordinary paragraph. @returns Nothing. */
  public EndPara(): void {
    this.StartPara();
  }
  /** Starts a quoted block. @returns Nothing. */
  public AddBlockQuote(): void {
    this.StartPara();
    this.blockQuoteDepth++;
    this.SetStyle("quotations");
  }
  /** Preserves the source zero-before-decrement quotation test. @returns Nothing. */
  public EndBlockQuote(): void {
    this.StartPara();
    if (this.blockQuoteDepth === 0) this.SetStyle("text-body");
    this.blockQuoteDepth--;
  }
  /** Selects the native horizontal-line style. @returns Nothing. */
  public AddHR(): void {
    if (this.m_pPam.GetPoint().GetContentIndex() !== 0)
      this.AppendTextNode(SwMdAppendMode.AM_SPACE);
    this.SetStyle("horizontal-line");
  }
  /** Leaves a horizontal line with a body paragraph. @returns Nothing. */
  public EndHR(): void {
    this.AppendTextNode(SwMdAppendMode.AM_SPACE);
    this.SetStyle("text-body");
  }
  /** Selects the requested native heading. @param level - md4c heading level. @returns Nothing. */
  public StartHeading(level: number): void {
    this.StartPara();
    this.SetStyle(`heading-${level}`);
  }
  /** Ends a heading and restores body style. @returns Nothing. */
  public EndHeading(): void {
    this.StartPara();
    this.SetStyle("text-body");
  }
  /** Begins a code block using its native paragraph brush. @returns Nothing. */
  public BeginCodeBlock(): void {
    this.StartPara();
    this.SetStyle("preformatted-text");
    this.m_xDoc.InsertPoolItem(
      this.m_pPam,
      new SvxBrushItem(new Color(225, 225, 225), RES_BACKGROUND),
    );
  }
  /** Ends code, then clears the new paragraph's direct attributes. @returns Nothing. */
  public EndCodeBlock(): void {
    this.StartPara();
    this.SetStyle("text-body");
    this.ClearAttrs();
  }
  /** Inserts actual text, then applies each active source pool item to its range. @param value - SAL-decoded callback text. @returns Nothing. */
  public InsertText(value: string): void {
    const node = this.GetTextNode(),
      start = this.m_pPam.GetPoint().GetContentIndex();
    this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, value);
    if (this.m_aAttrStack.length !== 0) {
      const first = new SwPosition(node, start),
        last = this.m_pPam.GetPoint().clone();
      const range = new SwPaM(last, first);
      first.Dispose();
      last.Dispose();
      try {
        this.SetAttrs(range);
      } finally {
        range.Dispose();
      }
      this.ClearAttrs();
    }
  }
  /** Applies the source stack in nesting order through the native item owner. @param range - Inserted text. @returns Nothing. */
  public SetAttrs(range: SwPaM): void {
    if (range.Start().compare(range.End()) === 0) return;
    for (const item of this.m_aAttrStack)
      if (item !== undefined) this.m_xDoc.InsertPoolItem(range, item);
  }
  /** Implements the importer's EOF-only ResetAttrs branch, preserving paragraph/list ownership. @returns Nothing. */
  public ClearAttrs(): void {
    const node = this.GetTextNode(),
      offset = this.m_pPam.GetPoint().GetContentIndex();
    DontExpandFormat(node, offset);
    if (offset !== 0) return;
    resetTextFormatCollAttributes(node);
    resetParagraphTextAttributes(node);
  }
  /** Marks the current native list paragraph as an uncounted continuation. @param level - Native level. @returns Nothing. */
  public SetNodeNum(level: number): void {
    const rule = this.numInfo.GetNumRule();
    if (rule === undefined) return;
    const node = this.GetTextNode();
    node.SetAttr(new SwNumRuleItem(rule.GetName()));
    node.SetAttrListLevel(level);
    node.SetCountedInList(false);
    rule.Invalidate();
  }
  /** Opens one source list, sharing a rule across nested kinds. The ordered-start detail is intentionally not consumed by upstream. @param type - UL/OL. @returns Nothing. */
  public StartNumberedBulletList(type: MD_BLOCKTYPE): void {
    const info = this.numInfo,
      space = info.GetDepth() === 0;
    if (this.m_pPam.GetPoint().GetContentIndex() !== 0)
      this.AppendTextNode(space ? SwMdAppendMode.AM_SPACE : SwMdAppendMode.AM_NOSPACE, false);
    else if (space) this.AddParSpace();
    info.IncDepth();
    if (info.GetNumRule() === undefined)
      info.SetNumRule(
        this.m_xDoc.AddNumRule(
          new SwNumRule(this.m_xDoc.GetUniqueNumRuleName(), "label-width-and-position"),
        ),
      );
    const rule = info.GetNumRule() as SwNumRule,
      level = info.GetLevel();
    const fresh = rule.GetNumFormat(level) === undefined,
      format = rule.Get(level).clone();
    info.SetNodeStartValue(level);
    if (fresh) {
      format.SetNumberingType(
        type === MD_BLOCKTYPE.MD_BLOCK_OL
          ? SvxNumType.SVX_NUM_ARABIC
          : SvxNumType.SVX_NUM_CHAR_SPECIAL,
      );
      if (type !== MD_BLOCKTYPE.MD_BLOCK_OL) {
        if (IsDefBulletFontUserDefined()) format.SetBulletFont(GetDefBulletFont());
        format.SetBulletChar(0x2022);
      }
      format.SetCharFormat(
        this.m_xDoc.GetCharFormatFromPool(
          type === MD_BLOCKTYPE.MD_BLOCK_OL
            ? SwPoolFormatId.CHR_NUM_LEVEL
            : SwPoolFormatId.CHR_BULLET_LEVEL,
        ),
      );
      const previous = level > 0 ? rule.Get(level - 1) : undefined;
      format.SetAbsLSpace(MD_NUMBER_BULLET_MARGINLEFT + (previous?.GetAbsLSpace() ?? 0));
      format.SetFirstLineOffset(previous?.GetFirstLineOffset() ?? MD_NUMBER_BULLET_INDENT);
    } else if (format.GetStart() !== 1) info.SetNodeStartValue(level, 1);
    this.SetNodeNum(level);
    if (fresh) rule.Set(level, format);
  }
  /** Starts a source list item and consumes its pending restart sentinel. @param detail - Native item detail. @returns Nothing. */
  public StartNumberedBulletListItem(detail: MD_BLOCK_LI_DETAIL): void {
    const info = this.numInfo,
      level = info.GetLevel(),
      start = info.GetNodeStartValue(level);
    info.SetNodeStartValue(level);
    if (this.m_pPam.GetPoint().GetContentIndex() !== 0)
      this.AppendTextNode(SwMdAppendMode.AM_NOSPACE, false);
    this.noParSpace = false;
    const node = this.GetTextNode(),
      rule = info.GetNumRule();
    if (rule === undefined) throw new Error("Markdown item callback has no list rule.");
    if (detail.is_task)
      this.m_xDoc
        .GetDocumentContentOperationsManager()
        .InsertString(
          this.m_pPam,
          (detail.task_mark === 120 || detail.task_mark === 88 ? "☒" : "☐") + " ",
        );
    node.SetAttr(new SwNumRuleItem(rule.GetName()));
    node.SetAttrListLevel(level);
    node.SetCountedInList(true);
    if (start !== 0xffff) {
      node.SetListRestart(true);
      node.SetAttrListRestartValue(start);
    }
    rule.Invalidate();
  }
  /** Ends an item, retaining its native uncounted continuation paragraph. @returns Nothing. */
  public EndNumberedBulletListItem(): void {
    if (this.m_pPam.GetPoint().GetContentIndex() !== 0)
      this.AppendTextNode(SwMdAppendMode.AM_SPACE);
  }
  /** Closes one list and completes uninitialized formats at outer depth zero. @returns Nothing. */
  public EndNumberedBulletList(): void {
    const info = this.numInfo,
      node = this.GetTextNode(),
      space = info.GetDepth() === 1;
    if (
      this.m_pPam.GetPoint().GetContentIndex() !== 0 ||
      (!node.IsOutline() && node.IsCountedInList())
    )
      this.AppendTextNode(space ? SwMdAppendMode.AM_SPACE : SwMdAppendMode.AM_NOSPACE, false);
    else if (space) this.AddParSpace();
    if (info.GetDepth() === 0) return;
    info.DecDepth();
    if (info.GetDepth() !== 0) {
      this.SetNodeNum(info.GetLevel());
      return;
    }
    const rule = info.GetNumRule();
    if (rule !== undefined) {
      let previous: ReturnType<SwNumRule["GetNumFormat"]>;
      for (let level = 0; level < 10; level++) {
        const existing = rule.GetNumFormat(level);
        if (existing !== undefined) previous = existing;
        else if (previous !== undefined) {
          const format = rule.Get(level).clone();
          format.SetNumberingType(
            previous.GetNumberingType() === SvxNumType.SVX_NUM_BITMAP
              ? SvxNumType.SVX_NUM_CHAR_SPECIAL
              : previous.GetNumberingType(),
          );
          if (format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL) {
            if (IsDefBulletFontUserDefined()) format.SetBulletFont(GetDefBulletFont());
            format.SetBulletChar(0x2022);
          }
          format.SetCharFormat(previous.GetCharFormat());
          format.SetAbsLSpace((level + 1) * MD_NUMBER_BULLET_MARGINLEFT);
          format.SetFirstLineOffset(MD_NUMBER_BULLET_INDENT);
          rule.Set(level, format);
        }
      }
    }
    this.GetTextNode().ResetAttr(RES_PARATR_NUMRULE);
    info.Clear();
  }
  /** Starts a real native table with source header/repetition/border defaults. @param rows - Rows. @param columns - Columns. @returns Nothing. */
  public StartTable(rows: number, columns: number): void {
    this.StartPara();
    this.table = new MDTable();
    this.table.SetTable(
      this.m_xDoc.InsertTable(
        { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 },
        this.m_pPam.GetPoint(),
        rows,
        columns,
      ),
    );
  }
  /** Advances the actual row cursor. @returns Nothing. */
  public StartRow(): void {
    this.table?.IncCurRow();
  }
  /** Selects the actual cell paragraph and assigns native alignment. @param align - md4c alignment. @returns Nothing. */
  public StartCell(align: MD_ALIGN): void {
    const state = this.table;
    if (state === undefined) return;
    state.IncCurCol();
    const row = state.GetTable().GetTabLines()[state.GetCurRow()];
    const box = row?.GetTabBoxes()[state.GetCurCol()];
    const node = box?.GetParagraphs()[0];
    if (node === undefined) return;
    node.SetAttr(
      new SvxAdjustItem(
        align === MD_ALIGN.MD_ALIGN_CENTER
          ? SvxAdjust.Center
          : align === MD_ALIGN.MD_ALIGN_RIGHT
            ? SvxAdjust.Right
            : SvxAdjust.Left,
        RES_PARATR_ADJUST,
      ),
    );
    this.m_pPam.GetPoint().Assign(node, 0);
  }
  /** Moves after the completed table using the existing body paragraph. @returns Nothing. */
  public EndTable(): void {
    const table = this.table?.GetTable().GetTableNode();
    if (table !== undefined) {
      const after = this.m_xDoc.GetNodes().at(table.EndOfSectionNode().GetIndex() + 1);
      if (!(after instanceof SwTextNode))
        throw new Error("Markdown table has no trailing paragraph.");
      this.m_pPam.GetPoint().Assign(after, 0);
    }
    this.table = undefined;
  }
  /** Starts a raw HTML block at a paragraph boundary. @returns Nothing. */
  public BeginHtmlBlock(): void {
    this.StartPara();
  }
  /** Imports accumulated raw HTML through the native HTML filter owner. @returns Nothing. */
  public EndHtmlBlock(): void {
    this.InsertHtmlData();
    this.m_htmlData = "";
  }
  /** Native HTML filter insertion is supplied by its represented owner. @returns Nothing. */
  public InsertHtmlData(): void {
    throw new Error("Native Writer HTML reader is not yet implemented.");
  }
  /** Clears unsupported graphic-node state without inserting image alt text into body text; graphics are outside the current model. @returns Nothing. */
  public InsertCurImage(): void {
    this.m_aImg.url = "";
    this.m_aImg.title = "";
    this.m_aImg.desc = "";
    this.m_aImg.link = "";
  }
}
