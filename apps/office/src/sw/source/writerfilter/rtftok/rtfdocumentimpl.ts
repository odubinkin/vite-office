/** @fileoverview Maps RTF tokenizer events into native Writer nodes following rtftok/rtfdocumentimpl.cxx. */
import type { WriterTextRun } from "../../filter/basflt/writer-transfer";
import { SwpHints } from "../../core/txtnode/ndhints";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import { getSvxAdjust } from "../../core/txtnode/ndtxt-hints";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
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
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { WriterParagraphAlignment } from "../../core/txtnode/ndtxt";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { RtfSyntaxError, type RtfToken } from "./rtftokenizer";

/** Paragraph properties represented by the current Writer model. */
interface RtfParagraphState {
  alignment: WriterParagraphAlignment;
  left: number;
  right: number;
  firstLine: number;
  alignmentSet?: boolean;
  leftSet?: boolean;
  rightSet?: boolean;
  firstLineSet?: boolean;
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
  colorIndex: number;
  field?: { instruction: string; url?: string };
  hyperlink?: string;
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
  | Readonly<{ kind: "paragraph"; paragraph: RtfParagraph }>
  | Readonly<{ kind: "table"; rows: readonly RtfTableRow[] }>;

/** One RTF table row with physical cell boundaries in twips. */
interface RtfTableRow {
  readonly cells: readonly (readonly RtfParagraph[])[];
  readonly boundaries: readonly number[];
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
  private inTable = false;
  private pendingUpDn: { height: number; automatic: boolean } | undefined;

  /** Resolves complete lexical input into a fresh Writer document. @param tokens - Valid RTF events. @returns Imported model. */
  public Resolve(tokens: readonly RtfToken[], options: SwDocOptions = {}): SwDoc {
    for (const token of tokens) this.Dispatch(token);
    if (!this.sawHeader) throw new RtfSyntaxError("RTF version control is missing.");
    if (
      this.runs.length > 0 ||
      (this.blocks.length === 0 && this.tableRows.length === 0) ||
      !this.terminatedParagraph
    )
      this.CommitParagraph();
    this.FlushTable();
    const document = new SwDoc(options);
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
    for (const block of this.blocks) {
      if (block.kind === "paragraph") {
        const node = firstParagraph ? document.paragraphs[0] : document.nodes.MakeTextNode();
        if (node === undefined) throw new Error("Writer body has no text node.");
        this.ApplyParagraph(node, block.paragraph);
        firstParagraph = false;
      } else {
        const table = firstParagraph
          ? document.nodes.InsertTable(document.paragraphs[0] as SwTextNode, "RTF Table", {})
          : document.nodes.MakeTableNode("RTF Table");
        const rightEdge = Math.max(0, ...block.rows.flatMap((row) => row.boundaries));
        if (rightEdge > 0) {
          const size = table.GetFrameFormat().GetFrameSize().Clone();
          size.SetWidth(rightEdge);
          table.GetFrameFormat().SetFormatAttr(size);
        }
        for (const row of block.rows) {
          const line = document.nodes.AppendTableRow(table, row.cells.length);
          for (const [index, cell] of row.cells.entries()) {
            const box = line.GetTabBoxes()[index];
            if (box === undefined) throw new Error("RTF table cell is missing.");
            const right = row.boundaries[index];
            const left = index === 0 ? 0 : row.boundaries[index - 1];
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
        const match = /\bHYPERLINK\s+(?:"([^"]+)"|([^\s]+))/iu.exec(previous.field.instruction);
        const url = match?.[1] ?? match?.[2];
        if (url !== undefined) previous.field.url = url;
      }
      return;
    }
    const state = this.states.at(-1);
    if (state === undefined) throw new RtfSyntaxError("RTF content is outside the root group.");
    if (token.kind === "text") {
      if (state.destination === "fonttbl") this.ReadFontText(token.value, state);
      else if (state.destination === "styleentry")
        state.styleName = (state.styleName ?? "") + token.value;
      else if (state.destination === "bookmarkstart" || state.destination === "bookmarkend")
        state.bookmarkName = (state.bookmarkName ?? "") + token.value;
      else if (state.destination === "leveltext")
        state.levelText = (state.levelText ?? "") + token.value;
      else if (state.destination === "colortbl") this.ReadColorText(token.value);
      else if (state.destination === "fldinst" && state.field !== undefined)
        state.field.instruction += token.value;
      else if (state.destination === "body") this.AppendText(token.value, state);
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
      if (state.field?.url !== undefined) state.hyperlink = state.field.url;
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
    if (name === "trowd") {
      this.inTable = true;
      this.rowBoundaries = [];
      return;
    }
    if (name === "cellx") {
      if (parameter !== undefined) this.rowBoundaries.push(parameter);
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
          boundaries: this.rowBoundaries.splice(0),
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
  }

  /** Appends text with group-scoped character state. @param value - Visible text. @param state - Current group. */
  private AppendText(value: string, state: RtfState): void {
    if (value.length === 0) return;
    if (!this.inTable && this.tableRows.length > 0) this.FlushTable();
    const previous = this.runs.at(-1);
    if (
      previous !== undefined &&
      previous.hyperlink?.url === state.hyperlink &&
      equalControls(previous.controls, state.characterControls) &&
      equalCharacter(previous.attributes, state.character)
    )
      this.runs[this.runs.length - 1] = { ...previous, text: previous.text + value };
    else
      this.runs.push({
        text: value,
        attributes: { ...state.character },
        controls: new Set(state.characterControls),
        ...(state.hyperlink === undefined ? {} : { hyperlink: { url: state.hyperlink } }),
      });
    this.terminatedParagraph = false;
  }

  /** Completes a paragraph at native \par or document end. @param state - Current group. */
  private CommitParagraph(state = this.states.at(-1)): void {
    const paragraph: RtfParagraph = {
      runs: this.runs.splice(0),
      state: { ...(state?.paragraph ?? DEFAULT_PARAGRAPH) },
      marks: this.marks.splice(0),
    };
    if (this.inTable) this.tableCell.push(paragraph);
    else this.blocks.push({ kind: "paragraph", paragraph });
    this.terminatedParagraph = true;
  }

  /** Completes rows as one native table block. */
  private FlushTable(): void {
    if (this.tableRows.length === 0) return;
    this.blocks.push({ kind: "table", rows: this.tableRows.splice(0) });
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
    if (name.length > 0) this.fonts.set(state.fontIndex, name);
    this.fontName = "";
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
