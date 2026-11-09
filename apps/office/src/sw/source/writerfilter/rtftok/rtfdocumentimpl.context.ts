/** @fileoverview Internal declaration view of RtfDocumentImpl; all fragments operate on the original owner and retain its state. */
import type { RTFFrame } from "./rtfdocumentimpl.frame";
import type { RTFShape, RtfShapeAnchor } from "./rtfdocumentimpl.shape";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { COL_AUTO, COL_BLACK, Color } from "../../../../tools/inc/color";
import { RES_PARATR_LINESPACING, RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { type WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type { WriterParagraphAlignment } from "../../core/txtnode/ndtxt";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { WriterTextRun } from "../../filter/basflt/writer-transfer";
import type { RtfDocumentImpl } from "./rtfdocumentimpl";
import type { TableRowBuffer } from "./rtfdocumentimpl.tablerowbuffer";
import { RTF_BORDER_STYLES, type RtfCellBorder } from "./rtfdocumentimpl.border";
export type { RtfCellBorder } from "./rtfdocumentimpl.border";
/** Paragraph properties represented by the current Writer model. */
export interface RtfParagraphState {
  borders?: ReadonlyMap<SvxBoxItemLine | "between", Readonly<RtfCellBorder>>;
  alignment: WriterParagraphAlignment;
  distributeLastLine: boolean;
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
}
/** Original RTFParserState run-type order, saved/restored with the group. */
export enum RunType {
  NONE,
  LOCH,
  HICH,
  DBCH,
  LTRCH_RTLCH_1,
  LTRCH_RTLCH_2,
  RTLCH_LTRCH_1,
  RTLCH_LTRCH_2,
}

/** Original color table entry remains automatic until the first component is set. */
export class RTFColorTableEntry {
  private m_bAuto: boolean;
  private readonly color: Color;

  /** Copies the saved group color entry or starts the original automatic entry. @param source - Optional copied entry. @returns Color entry. */
  constructor(source?: RTFColorTableEntry) {
    this.m_bAuto = source?.m_bAuto ?? true;
    this.color = new Color(source?.color ?? COL_BLACK);
  }

  /** Sets the native red component and marks the entry explicit. @param value - Original byte input. @returns Nothing. */
  SetRed(value: number): void {
    this.m_bAuto = false;
    this.color.SetRed(value);
  }

  /** Sets the native green component and marks the entry explicit. @param value - Original byte input. @returns Nothing. */
  SetGreen(value: number): void {
    this.m_bAuto = false;
    this.color.SetGreen(value);
  }

  /** Sets the native blue component and marks the entry explicit. @param value - Original byte input. @returns Nothing. */
  SetBlue(value: number): void {
    this.m_bAuto = false;
    this.color.SetBlue(value);
  }

  /** Returns the original automatic sentinel or authored RGB color. @returns Native color. */
  GetColor(): Readonly<Color> {
    return this.m_bAuto ? COL_AUTO : this.color;
  }
}

/** Group-scoped RTF dispatch state. */
export interface RtfState {
  frame: RTFFrame;
  shape: RTFShape | undefined;
  shapeRoot?: boolean;
  shapeTextRoot?: boolean;
  characterSprms: RTFSprms;
  paragraphSprms: RTFSprms;
  sectionSprms: RTFSprms;
  tableRowSprms: RTFSprms;
  tableCellSprms: RTFSprms;
  tableBuffer: TableRowBuffer | undefined;
  tableRowWidthAfter: number;
  currentColor: RTFColorTableEntry;
  tableSprms: RTFSprms;
  tableAttributes: RTFSprms;
  listLevelEntries: RTFSprms;
  runType: RunType;
  destination:
    | "body"
    | "shape"
    | "flymaincontent"
    | "shapeinstruction"
    | "shapeproperty"
    | "shapepropertyname"
    | "shapepropertyvalue"
    | "nestedtableproperties"
    | "fonttbl"
    | "stylesheet"
    | "styleentry"
    | "bookmarkstart"
    | "bookmarkend"
    | "colortbl"
    | "pn"
    | "pntxta"
    | "pntxtb"
    | "listtable"
    | "list"
    | "listlevel"
    | "listname"
    | "leveltext"
    | "levelnumbers"
    | "listoverridetable"
    | "listoverride"
    | "lfolevel"
    | "field"
    | "fldinst"
    | "skip";
  starred: boolean;
  character: WriterCharacterAttributes;
  autoKerning?: boolean;

  paragraph: RtfParagraphState;
  fontIndex: number;
  currentCodepage: number;
  fontCodepage?: number;
  colorIndex: number;
  paragraphBorder?: SvxBoxItemLine | "between" | "box";
  field?: { instruction: string; hyperlink?: WriterHyperlink };
  hyperlink?: WriterHyperlink;
  styleIndex?: number;
  styleType?: "paragraph" | "character";
  characterStyleIndex?: number;
  currentCharacterStyleIndex?: number;
  styleName: string;
  basedOnStyleIndex?: number;
  nextStyleIndex?: number;
  basedOnStyleName?: string;
  nextStyleName?: string;
  styleControls: Set<string>;
  characterControls: Set<string>;
  bookmarkName: string;
  levelText: string;
  levelNumbers: number[];
  levelNumbersValid: boolean;
  listLevelNum: number;
  currentListIndex: number;
  currentListOverrideIndex: number;
  destinationText: OUStringBuffer;
  currentDestinationText: OUStringBuffer | null;
}
/** Parsed paragraph before the source graph is applied atomically. */
export interface RtfParagraph {
  readonly paragraphSprms?: RTFSprms;
  readonly frames?: readonly RtfShapeAnchor[];
  readonly marker?: RtfRun;
  readonly runs: readonly RtfRun[];
  readonly state: RtfParagraphState;
  readonly marks: readonly Readonly<{ name: string; offset: number }>[];
}
/** Parsed RTF text plus controls explicitly active at that span. */
export interface RtfRun extends WriterTextRun {
  readonly characterSprms: RTFSprms;
  readonly paragraphStyleIndex?: number;
  readonly characterStyleIndex?: number;
  readonly currentCharacterStyleIndex?: number;
  readonly controls: ReadonlySet<string>;
  readonly autoKerning?: boolean;
}
/** Ordered body content with native rows and cell paragraphs. */
export type RtfBlock =
  | Readonly<{ kind: "paragraph"; paragraph: RtfParagraph; section: number }>
  | Readonly<{
      kind: "table";
      rows: readonly RtfTableRow[];
      section: number;
      pageBreakBefore: boolean;
    }>;
/** One native nested-table sequence in the surrounding cell's buffer. */
export interface RtfNestedTable {
  readonly rows: RtfTableRow[];
}

/** Paragraph and nested-row events retain their relative cell order. */
export type RtfTableCellContent = RtfParagraph | RtfNestedTable;

/** Original buffered row definition with physical cell boundaries in twips. */
export interface RtfTableRowDefinition {
  readonly rowSprms: RTFSprms;
  readonly cellSprms: readonly RTFSprms[];
  readonly boundaries: readonly number[];
  readonly left: number;
  readonly borders: readonly ReadonlyMap<SvxBoxItemLine, RtfCellBorder>[];
}
/** One replayable row with its definition and ordered cell content. */
export interface RtfTableRow extends RtfTableRowDefinition {
  readonly cells: readonly (readonly RtfTableCellContent[])[];
}
export const DEFAULT_CHARACTER: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};
/** RTF underline keywords dispatched as OOXML underline values by the pinned rtftok reader. */
export const RTF_UNDERLINE_STYLES: Readonly<Record<string, FontLineStyle>> = {
  ul: FontLineStyle.LINESTYLE_SINGLE,
  uld: FontLineStyle.LINESTYLE_DOTTED,
  uldash: FontLineStyle.LINESTYLE_DASH,
  uldashd: FontLineStyle.LINESTYLE_DASHDOT,
  uldashdd: FontLineStyle.LINESTYLE_DASHDOTDOT,
  uldb: FontLineStyle.LINESTYLE_DOUBLE,
  ulhwave: FontLineStyle.LINESTYLE_BOLDWAVE,
  ulldash: FontLineStyle.LINESTYLE_LONGDASH,
  ulth: FontLineStyle.LINESTYLE_BOLD,
  ulthd: FontLineStyle.LINESTYLE_BOLDDOTTED,
  ulthdash: FontLineStyle.LINESTYLE_BOLDDASH,
  ulthdashd: FontLineStyle.LINESTYLE_BOLDDASHDOT,
  ulthdashdd: FontLineStyle.LINESTYLE_BOLDDASHDOTDOT,
  ulthldash: FontLineStyle.LINESTYLE_BOLDLONGDASH,
  ululdbwave: FontLineStyle.LINESTYLE_DOUBLEWAVE,
  ulwave: FontLineStyle.LINESTYLE_WAVE,
  ulw: FontLineStyle.LINESTYLE_SINGLE,
  ulnone: FontLineStyle.LINESTYLE_NONE,
};
/** Tests direct underline state across all RTF style controls. @param controls - Direct keyword set. @returns Whether one is an underline control. */
export function hasRtfUnderlineControl(controls: ReadonlySet<string>): boolean {
  return [...controls].some(
    /** Computes the name result. @param name - Name. @returns The computed result. */ (name) =>
      Object.hasOwn(RTF_UNDERLINE_STYLES, name),
  );
}
export const DEFAULT_PARAGRAPH: RtfParagraphState = {
  alignment: "left",
  distributeLastLine: false,
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
};
export const SKIPPED_DESTINATIONS = new Set([
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
export const STYLE_PROPERTY_CONTROLS = new Set([
  "ltrpar",
  "rtlpar",
  "outlinelevel",
  "ls",
  "ilvl",
  "lang",
  "alang",
  "langfe",
  "loch",
  "hich",
  "dbch",
  "rtlch",
  "ltrch",
  "deflang",
  "adeflang",
  "kerning",
  "cbpat",
  "box",
  "brdrt",
  "brdrl",
  "brdrb",
  "brdrr",
  "brdrbtw",
  "brdrw",
  "brdrcf",
  "brsp",
  ...Object.keys(RTF_BORDER_STYLES),
  "b",
  "i",
  "ul",
  "ulnone",
  "ulc",
  ...Object.keys(RTF_UNDERLINE_STYLES),
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
  "qd",
  "li",
  "lin",
  "ri",
  "rin",
  "fi",
  "sb",
  "sa",
  "contextualspace",
  "keepn",
  "keep",
  "widctlpar",
  "nowidctlpar",
  "tqr",
  "tqc",
  "tqdec",
  "tldot",
  "tlul",
  "tlth",
  "tx",
  "sl",
  "slmult",
]);
export const CHARACTER_PROPERTY_CONTROLS = new Set([
  "lang",
  "alang",
  "langfe",
  "kerning",
  "b",
  "i",
  "ul",
  "ulnone",
  "ulc",
  ...Object.keys(RTF_UNDERLINE_STYLES),
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
/** Materializes absolute RTF tab positions through the native sorted item.  @param stops - Stops. @returns The SvxTabStopItem result. */
export function createRtfTabStops(stops: readonly SvxTabStop[]): SvxTabStopItem {
  const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  for (const stop of stops) item.Insert(stop);
  return item;
}
/** Maps Word line height modes through the native Writer spacing item.  @param paragraph - Paragraph. @returns The SvxLineSpacingItem result. */
export function createRtfLineSpacing(paragraph: RtfParagraphState): SvxLineSpacingItem {
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
export function equalCharacter(
  a: WriterCharacterAttributes,
  b: WriterCharacterAttributes,
): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.underlineStyle === b.underlineStyle &&
    a.underlineColor === b.underlineColor &&
    a.underlineWordMode === b.underlineWordMode &&
    a.fontFamily === b.fontFamily &&
    a.fontSizeTwips === b.fontSizeTwips &&
    a.color === b.color &&
    a.highlight === b.highlight &&
    a.strikeout === b.strikeout &&
    a.escapement?.offset === b.escapement?.offset &&
    a.escapement?.height === b.escapement?.height
  );
}
/** Compares explicit-control sets before adjacent RTF runs are coalesced.  @param left - Left. @param right - Right. @returns The boolean result. */
export function equalControls(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  return (
    left.size === right.size &&
    [...left].every(
      /** Computes the name result. @param name - Name. @returns The computed result. */ (name) =>
        right.has(name),
    )
  );
}
/** Extracts Word field command parts with the quoted-space and screen-tip rules of FieldContext.  @param command - Command. @returns The string[] result. */
export function getRtfFieldCommandParts(command: string): string[] {
  const parts: string[] = [];
  let inString = false;
  let screenTip = false;
  let part = "";
  const tokens = command
    .split(" ")
    .filter(
      /** Computes the token result. @param token - Token. @returns The computed result. */ (
        token,
      ) => token.length > 0,
    );
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
/** Applies the pinned DomainMapper HYPERLINK switches to one represented Writer link.  @param instruction - Instruction. @returns The WriterHyperlink | undefined result. */
export function parseRtfHyperlinkInstruction(instruction: string): WriterHyperlink | undefined {
  const parts = getRtfFieldCommandParts(instruction);
  if (parts[0]?.toUpperCase() !== "HYPERLINK") return undefined;
  let url = "";
  let targetFrame = "";
  let name = "";
  for (let index = 1; index < parts.length; index++) {
    // Command tokenization returns a dense local array; this loop admits only existing entries.
    const part = parts[index] as string;
    if (part === "\\l") url += `#${parts[++index] ?? ""}`;
    else if (part === "\\t") targetFrame = parts[++index] ?? "";
    else if (part === "\\o") name = parts[++index] ?? "";
    else if (part !== "\\m" && part !== "\\n" && part !== "\\h")
      url = part.replaceAll("\\\\", "\\");
  }
  if (url.length === 0) return undefined;
  if (url.startsWith("file:///")) url = url.replaceAll("\\", "/");
  return {
    url,
    ...(targetFrame.length === 0 ? {} : { targetFrame }),
    ...(name.length === 0 ? {} : { name }),
  };
}
/** Original native owner used by its out-of-class implementation fragments; no state is copied. */
export type RtfDocumentImplContext = RtfDocumentImpl;

/** Existing style materialization boundary retains the source-captured names and remaining represented callbacks; native character-reference properties live in the original raw style table. */
export interface RtfStyleDefinition {
  readonly name: string;
  readonly styleType: "paragraph" | "character";
  readonly character: WriterCharacterAttributes;
  readonly autoKerning?: boolean;

  readonly paragraph: RtfParagraphState;
  readonly controls: ReadonlySet<string>;
  readonly basedOnStyleIndex?: number;
  readonly nextStyleIndex?: number;
  readonly basedOnStyleName?: string;
  readonly nextStyleName?: string;
}

import type { RTFSprms } from "./rtfsprm";

import type { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
