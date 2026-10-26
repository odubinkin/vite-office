/** @fileoverview Internal declaration view of RtfDocumentImpl; all fragments operate on the original owner and retain its state. */
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule, SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { FontLineStyle, FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_PARATR_LINESPACING, RES_PARATR_TABSTOP } from "../../../inc/hintids";
import type { WriterPageDescriptorValue } from "../../core/layout/pagedesc";
import { type WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type { WriterParagraphAlignment } from "../../core/txtnode/ndtxt";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { WriterTextRun } from "../../filter/basflt/writer-transfer";
import type { RtfDocumentImpl } from "./rtfdocumentimpl";
/** Paragraph properties represented by the current Writer model. */
export interface RtfParagraphState {
  alignment: WriterParagraphAlignment;
  distributeLastLine: boolean;
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
export interface RtfState {
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
  styleName: string;
  basedOnStyleIndex?: number;
  nextStyleIndex?: number;
  styleControls: Set<string>;
  characterControls: Set<string>;
  bookmarkName: string;
  levelText: string;
}
/** Parsed paragraph before the source graph is applied atomically. */
export interface RtfParagraph {
  readonly runs: readonly RtfRun[];
  readonly state: RtfParagraphState;
  readonly marks: readonly Readonly<{ name: string; offset: number }>[];
}
/** Parsed RTF text plus controls explicitly active at that span. */
export interface RtfRun extends WriterTextRun {
  readonly controls: ReadonlySet<string>;
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
/** The represented physical subset of a tokenizer section-property group. */
export type RtfSectionPage = Partial<{
  -readonly [K in Exclude<keyof WriterPageDescriptorValue, "name">]: WriterPageDescriptorValue[K];
}>;
/** One RTF table row with physical cell boundaries in twips. */
export interface RtfTableRow {
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
export interface RtfCellBorder {
  style: BorderLineStyle;
  width: number;
  colorIndex: number;
  wordStyle: number;
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
  "tx",
  "sl",
  "slmult",
]);
export const CHARACTER_PROPERTY_CONTROLS = new Set([
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
/** Keeps absent RTF direct controls inherited from the selected paragraph style.  @param run - Run. @param inherited - Inherited. @returns The WriterCharacterAttributes result. */
export function resolveRtfRunAttributes(
  run: RtfRun,
  inherited: WriterCharacterAttributes,
): WriterCharacterAttributes {
  const controls = run.controls;
  const has = /** Implements has. @param names - Names. @returns The computed result. */ (
    ...names: string[]
  ) =>
    names.some(
      /** Tests one original RTF control name. @param name - Control keyword. @returns Whether the run declares it. */ (
        name,
      ) => controls.has(name),
    );
  return {
    bold: has("b") ? run.attributes.bold : inherited.bold,
    italic: has("i") ? run.attributes.italic : inherited.italic,
    underline: hasRtfUnderlineControl(controls) ? run.attributes.underline : inherited.underline,
    ...(hasRtfUnderlineControl(controls)
      ? { underlineStyle: run.attributes.underlineStyle }
      : inherited.underlineStyle === undefined
        ? {}
        : { underlineStyle: inherited.underlineStyle }),
    ...(controls.has("ulc")
      ? { underlineColor: run.attributes.underlineColor ?? "auto" }
      : inherited.underlineColor === undefined
        ? {}
        : { underlineColor: inherited.underlineColor }),
    ...((run.attributes.underlineWordMode ?? inherited.underlineWordMode) === undefined
      ? {}
      : { underlineWordMode: run.attributes.underlineWordMode ?? inherited.underlineWordMode }),
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
/** Resolves RTF list level formats accepted by the current native numbering model.  @param value - Value. @returns The SvxNumType result. */
export function fromRtfNfc(value: number): SvxNumType {
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
/** Resolves source RTF cell border keywords to native border styles.  @param name - Name. @returns The BorderLineStyle result. */
export function fromRtfBorderStyle(name: string): BorderLineStyle {
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
/** Original native owner used by its out-of-class implementation fragments; no state is copied. */
export type RtfDocumentImplContext = RtfDocumentImpl;
