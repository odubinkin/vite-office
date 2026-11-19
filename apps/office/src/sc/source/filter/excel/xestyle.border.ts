/** @fileoverview Original Excel cell-border width and style projection, indexed buffer and SpreadsheetML output. */
import {
  SvxBorderLineStyle as Line,
  type SvxBorderLine,
} from "../../../../editeng/source/items/borderline";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { Color, COL_BLACK } from "../../../../tools/inc/color";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import {
  convertColorTransformsToTintOrShade,
  convertThemeColorTypeToExcelThemeNumber,
} from "../../../../oox/inc/export/ColorExportUtils";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_BORDER, ATTR_BORDER_TLBR, ATTR_BORDER_BLTR } from "../../../inc/scitems";
import { ScHasPriority } from "../../core/data/attrib";
import { XclXmlUtils } from "./xestream";

const EXC_BORDER_THICK = 50;
const EXC_BORDER_MEDIUM = 35;
const EXC_BORDER_THIN = 15;
const EXC_BORDER_HAIR = 1;

const excelLines = new Map<Line, readonly [string, string, string, string]>([
  [Line.NONE, ["", "", "", ""]],
  [Line.SOLID, ["hair", "thin", "medium", "thick"]],
  [Line.DOTTED, ["dotted", "dotted", "slantDashDot", "slantDashDot"]],
  [Line.DASHED, ["dotted", "dashed", "mediumDashed", "mediumDashed"]],
  [Line.FINE_DASHED, ["dashed", "dashed", "slantDashDot", "slantDashDot"]],
  [Line.DASH_DOT, ["dashed", "dashDot", "mediumDashDot", "mediumDashDot"]],
  [Line.DASH_DOT_DOT, ["dashed", "dashDotDot", "mediumDashDotDot", "mediumDashDotDot"]],
  [Line.DOUBLE_THIN, ["double", "double", "double", "double"]],
]);
const sides = ["left", "right", "top", "bottom", "diagonal"] as const;

/** Frozen OOXML attributes derived from a native border line. */
interface XclBorderLine {
  readonly style: string;
  readonly rgb?: string;
  readonly theme?: string;
  readonly tint?: string;
}
const none: XclBorderLine = { style: "" };

/** Native XLSX style projection uses the scaled outer width and the original Excel width classes. @param line - Effective native line. @param saveComplexColor - Whether the native caller assigns theme data to the output field. @returns Line attributes. */
function getBorderLine(
  line: Readonly<SvxBorderLine> | null | undefined,
  saveComplexColor = true,
): XclBorderLine {
  if (!line) return none;
  const width = line.GetOutWidth();
  const index =
    width >= EXC_BORDER_THICK
      ? 3
      : width >= EXC_BORDER_MEDIUM
        ? 2
        : width >= EXC_BORDER_THIN
          ? 1
          : width >= EXC_BORDER_HAIR
            ? 0
            : 1;
  const style = (excelLines.get(line.GetBorderLineStyle()) ?? excelLines.get(Line.SOLID))?.[index];
  if (!style) return none;
  const color = line.GetColor();
  const complex = saveComplexColor ? line.getComplexColor() : undefined;
  if (complex?.isValidThemeType()) {
    const tint = convertColorTransformsToTintOrShade(complex);
    return {
      style,
      theme: String(convertThemeColorTypeToExcelThemeNumber(complex.getThemeColorType())),
      ...(tint === 0 ? {} : { tint: String(tint) }),
    };
  }
  return color.equals(COL_BLACK)
    ? { style }
    : {
        style,
        rgb: new TextDecoder().decode(XclXmlUtils.ToOString(new Color(color))),
      };
}

/** Original serialized Excel border after resolving the existing Calc item set. */
class XclExpCellBorder {
  private readonly lines: readonly XclBorderLine[];
  private readonly up: boolean;
  private readonly down: boolean;

  /** Applies the source diagonal priority and actual outer box attributes. @param pattern - Effective workbook pattern. @returns Indexed Excel border. */
  constructor(pattern: ScPatternAttr) {
    const box = pattern.GetItem(ATTR_BORDER) as SvxBoxItem;
    const tlbr = (pattern.GetItem(ATTR_BORDER_TLBR) as SvxLineItem).GetLine();
    const bltr = (pattern.GetItem(ATTR_BORDER_BLTR) as SvxLineItem).GetLine();
    const down = getBorderLine(tlbr, false);
    const up = getBorderLine(bltr, false);
    this.down = down.style !== "";
    this.up = up.style !== "";
    this.lines = [
      getBorderLine(box.GetLeft()),
      getBorderLine(box.GetRight()),
      getBorderLine(box.GetTop()),
      getBorderLine(box.GetBottom()),
      ScHasPriority(tlbr, bltr) ? down : up,
    ];
  }

  /** Produces a comparable Excel border with its already projected format values. @returns Stable equality key. */
  key(): string {
    return JSON.stringify([this.up, this.down, this.lines]);
  }

  /** Writes original border order and omits literal black color elements. @param serializer - Styles part serializer. @returns Nothing. */
  SaveXml(serializer: FastSerializerHelper): void {
    serializer.startElement(
      token("border"),
      token("diagonalUp"),
      this.up ? "1" : "0",
      token("diagonalDown"),
      this.down ? "1" : "0",
    );
    for (const [index, side] of sides.entries()) {
      const line = this.lines[index] as XclBorderLine;
      const edge = token(side);
      if (line.theme === undefined && line.rgb === undefined) {
        serializer.singleElement(edge, token("style"), line.style || null);
      } else {
        serializer.startElement(edge, token("style"), line.style);
        serializer.singleElement(
          token("color"),
          token("rgb"),
          line.rgb ?? null,
          token("theme"),
          line.theme ?? null,
          token("tint"),
          line.tint ?? null,
        );
        serializer.endElement(edge);
      }
    }
    serializer.endElement(token("border"));
  }
}

/** Workbook-wide deduplication of original XLSX cell borders. */
export class XclExpBorderBuffer {
  private readonly borders: XclExpCellBorder[] = [];
  private readonly indices = new Map<string, number>();

  /** Appends a distinct native border and returns its style part index. @param pattern - Actual workbook cell format. @returns Excel index. */
  Insert(pattern: ScPatternAttr): number {
    const border = new XclExpCellBorder(pattern);
    const key = border.key();
    const index = this.indices.get(key);
    if (index !== undefined) return index;
    const next = this.borders.push(border) - 1;
    this.indices.set(key, next);
    return next;
  }

  /** Writes the actual indexed border records used by the workbook XFs. @param serializer - Styles part serializer. @returns Nothing. */
  SaveXml(serializer: FastSerializerHelper): void {
    const borders = token("borders");
    serializer.startElement(borders, token("count"), String(this.borders.length));
    for (const border of this.borders) border.SaveXml(serializer);
    serializer.endElement(borders);
  }
}
