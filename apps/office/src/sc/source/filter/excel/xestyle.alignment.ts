/** @fileoverview XclExpCellAlign and original Excel rotation, indentation and direction projection. */
import type {
  SvxHorJustifyItem,
  SvxJustifyMethodItem,
  SvxVerJustifyItem,
} from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify as H,
  SvxCellJustifyMethod as J,
  SvxCellVerJustify as V,
} from "../../../../editeng/inc/svxenum";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import type { SvxFrameDirectionItem } from "../../../../editeng/source/items/frmitems.direction";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type {
  ScIndentItem,
  ScRotateValueItem,
  ScVerticalStackCell,
  ScLineBreakCell,
  ScShrinkToFitCell,
} from "../../../inc/attrib";
import type { ScPatternAttr } from "../../../inc/patattr";
import * as Which from "../../../inc/scitems";

const horizontal = ["general", "left", "center", "right", "justify", "fill"];
const vertical = ["bottom", "top", "center", "bottom", "justify"];

/** Converts the native hundredths-of-degree angle with the original unsigned-eight-bit result. @param angle - Calc angle. @returns SpreadsheetML angle. */
export function GetXclRotation(angle: number): number {
  const rotation = Math.trunc(angle / 100);
  if (rotation >= 0 && rotation <= 90) return rotation;
  if (rotation < 180) return (270 - rotation) & 0xff;
  if (rotation < 270) return rotation - 180;
  return rotation < 360 ? 450 - rotation : 0;
}

/** Original indexed XF alignment values. */
export class XclExpCellAlign {
  private readonly horizontal: string;
  private readonly vertical: string;
  private readonly rotation: number;
  private readonly wrap: boolean;
  private readonly indent: number;
  private readonly shrink: boolean;
  private readonly readingOrder: number;

  /** Projects actual Calc pool values against the export space metric. @param pattern - Effective format. @param space - Width of a space in reference-device twips. @returns Alignment. */
  constructor(pattern: ScPatternAttr, space: number) {
    const hori = (pattern.GetItem(Which.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue();
    const vert = (pattern.GetItem(Which.ATTR_VER_JUSTIFY) as SvxVerJustifyItem).GetValue();
    const horiMethod = (
      pattern.GetItem(Which.ATTR_HOR_JUSTIFY_METHOD) as SvxJustifyMethodItem
    ).GetValue();
    const vertMethod = (
      pattern.GetItem(Which.ATTR_VER_JUSTIFY_METHOD) as SvxJustifyMethodItem
    ).GetValue();
    this.horizontal =
      hori === H.Block && horiMethod === J.Distribute
        ? "distributed"
        : (horizontal[hori] ?? "general");
    this.vertical =
      vert === V.Block && vertMethod === J.Distribute
        ? "distributed"
        : (vertical[vert] ?? "bottom");
    const stacked = (pattern.GetItem(Which.ATTR_STACKED) as ScVerticalStackCell).GetValue();
    this.rotation = stacked
      ? 255
      : GetXclRotation((pattern.GetItem(Which.ATTR_ROTATE_VALUE) as ScRotateValueItem).GetValue());
    this.wrap = (pattern.GetItem(Which.ATTR_LINEBREAK) as ScLineBreakCell).GetValue();
    const indent = (pattern.GetItem(Which.ATTR_INDENT) as ScIndentItem).GetValue();
    this.indent = Math.max(0, Math.min(Math.trunc(indent / (3 * space) + 0.5), 15));
    this.shrink = (pattern.GetItem(Which.ATTR_SHRINKTOFIT) as ScShrinkToFitCell).GetValue();
    const direction = (pattern.GetItem(Which.ATTR_WRITINGDIR) as SvxFrameDirectionItem).GetValue();
    this.readingOrder =
      direction === D.Horizontal_LR_TB ? 1 : direction === D.Horizontal_RL_TB ? 2 : 0;
  }

  /** Detects the original default lexical representation. @returns Whether this equals a default Excel alignment. */
  isDefault(): boolean {
    return (
      this.horizontal === "general" &&
      this.vertical === "bottom" &&
      !this.rotation &&
      !this.wrap &&
      !this.indent &&
      !this.shrink &&
      !this.readingOrder
    );
  }

  /** Compares the original projected fields. @param other - Parent XF alignment. @returns Whether equal. */
  equals(other: XclExpCellAlign): boolean {
    return (
      this.horizontal === other.horizontal &&
      this.vertical === other.vertical &&
      this.rotation === other.rotation &&
      this.wrap === other.wrap &&
      this.indent === other.indent &&
      this.shrink === other.shrink &&
      this.readingOrder === other.readingOrder
    );
  }

  /** Writes the original SpreadsheetML projection for a used XF alignment. @param serializer - Style stream. @returns Nothing. */
  SaveXml(serializer: FastSerializerHelper): void {
    serializer.singleElement(
      token("alignment"),
      token("horizontal"),
      this.horizontal,
      token("vertical"),
      this.vertical,
      token("textRotation"),
      String(this.rotation),
      token("wrapText"),
      this.wrap ? "1" : "0",
      token("indent"),
      String(this.indent),
      token("shrinkToFit"),
      this.shrink ? "1" : "0",
      token("readingOrder"),
      this.readingOrder ? String(this.readingOrder) : null,
    );
  }
}
