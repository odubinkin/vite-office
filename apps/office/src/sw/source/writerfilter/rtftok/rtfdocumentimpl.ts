/** @fileoverview Maps RTF tokenizer events into native Writer nodes following rtftok/rtfdocumentimpl.cxx. */
import type { WriterTextRun } from "../../filter/basflt/writer-transfer";
import { SwpHints } from "../../core/txtnode/ndhints";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
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
  listOverride?: number;
  listLevel: number;
}

/** Group-scoped RTF dispatch state. */
interface RtfState {
  destination:
    | "body"
    | "fonttbl"
    | "colortbl"
    | "listtable"
    | "list"
    | "listlevel"
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
}

/** Parsed paragraph before the source graph is applied atomically. */
interface RtfParagraph {
  readonly runs: readonly WriterTextRun[];
  readonly state: RtfParagraphState;
}

/** Ordered body content with native rows and cell paragraphs. */
type RtfBlock =
  | Readonly<{ kind: "paragraph"; paragraph: RtfParagraph }>
  | Readonly<{ kind: "table"; rows: readonly (readonly (readonly RtfParagraph[])[])[] }>;

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
  "filetbl",
  "datastore",
  "themedata",
  "colorschememapping",
  "xmlnstbl",
]);

/** Imports a represented RTF body without coupling the tokenizer to browser I/O. */
export class RtfDocumentImpl {
  private readonly states: RtfState[] = [];
  private readonly blocks: RtfBlock[] = [];
  private readonly runs: WriterTextRun[] = [];
  private readonly fonts = new Map<number, string>();
  private readonly colors: string[] = [];
  private readonly listFormats = new Map<number, readonly ("bullet" | "numbered")[]>();
  private readonly listOverrides = new Map<number, number>();
  private currentListId = 0;
  private currentListLevels: ("bullet" | "numbered")[] = [];
  private currentOverrideListId = 0;
  private currentOverrideIndex = 0;
  private fontName = "";
  private color = { red: 0, green: 0, blue: 0 };
  private sawHeader = false;
  private terminatedParagraph = false;
  private tableRows: RtfParagraph[][][] = [];
  private tableRow: RtfParagraph[][] = [];
  private tableCell: RtfParagraph[] = [];
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
        for (const row of block.rows) {
          const line = document.nodes.AppendTableRow(table, row.length);
          for (const [index, cell] of row.entries()) {
            const box = line.GetTabBoxes()[index];
            if (box === undefined) throw new Error("RTF table cell is missing.");
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

  /** Applies parsed values through native text and item-set owners. @param node - Target paragraph. @param paragraph - Parsed values. */
  private ApplyParagraph(node: SwTextNode, paragraph: RtfParagraph): void {
    node.SetText(paragraph.runs.map((run) => run.text).join(""));
    const hints = new SwpHints(node.GetDoc().GetAttrPool());
    hints.setTextRuns(paragraph.runs, node.GetSwAttrSet());
    node.SetTextHints(hints);
    node.SetParagraphAlignment(paragraph.state.alignment);
    node.SetParagraphTextLeftMargin(paragraph.state.left);
    node.SetParagraphFirstLineIndent(paragraph.state.firstLine);
    node.SetParagraphRightMargin(paragraph.state.right);
    const override = paragraph.state.listOverride;
    if (override !== undefined) {
      const sourceList = this.listOverrides.get(override),
        kind =
          sourceList === undefined
            ? undefined
            : this.listFormats.get(sourceList)?.[paragraph.state.listLevel];
      if (kind !== undefined)
        applyWriterParagraphList(node, {
          kind,
          level: paragraph.state.listLevel,
          listId: `RTF-list-${override}`,
        });
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
      });
      return;
    }
    if (token.kind === "group-end") {
      if (this.states.length === 1 && this.runs.length > 0) this.CommitParagraph(this.states[0]);
      const previous = this.states.pop();
      if (previous?.destination === "fonttbl" && previous.fontIndex >= 0) this.CommitFont(previous);
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
    if (
      token.name === "fonttbl" ||
      token.name === "colortbl" ||
      token.name === "listtable" ||
      token.name === "listoverridetable"
    ) {
      state.destination = token.name;
      state.starred = false;
      return;
    }
    if (state.destination === "listtable" && token.name === "list") {
      state.destination = "list";
      this.currentListId = 0;
      this.currentListLevels = [];
      return;
    }
    if (state.destination === "list" && token.name === "listlevel") {
      state.destination = "listlevel";
      this.currentListLevels.push("numbered");
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
      else if (token.name === "levelnfc")
        this.currentListLevels[this.currentListLevels.length - 1] =
          token.parameter === 23 ? "bullet" : "numbered";
      return;
    }
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
    if (name === "trowd") {
      this.inTable = true;
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
      if (this.tableRow.length > 0) this.tableRows.push(this.tableRow.splice(0));
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
        alignment:
          name === "ql" ? "left" : name === "qc" ? "center" : name === "qr" ? "right" : "justify",
      };
    else if (name === "li" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, left: Math.max(0, parameter) };
    else if (name === "ri" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, right: Math.max(0, parameter) };
    else if (name === "fi" && parameter !== undefined)
      state.paragraph = { ...state.paragraph, firstLine: parameter };
  }

  /** Appends text with group-scoped character state. @param value - Visible text. @param state - Current group. */
  private AppendText(value: string, state: RtfState): void {
    if (value.length === 0) return;
    if (!this.inTable && this.tableRows.length > 0) this.FlushTable();
    const previous = this.runs.at(-1);
    if (
      previous !== undefined &&
      previous.hyperlink?.url === state.hyperlink &&
      equalCharacter(previous.attributes, state.character)
    )
      this.runs[this.runs.length - 1] = { ...previous, text: previous.text + value };
    else
      this.runs.push({
        text: value,
        attributes: { ...state.character },
        ...(state.hyperlink === undefined ? {} : { hyperlink: { url: state.hyperlink } }),
      });
    this.terminatedParagraph = false;
  }

  /** Completes a paragraph at native \par or document end. @param state - Current group. */
  private CommitParagraph(state = this.states.at(-1)): void {
    const paragraph: RtfParagraph = {
      runs: this.runs.splice(0),
      state: { ...(state?.paragraph ?? DEFAULT_PARAGRAPH) },
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
