/** @fileoverview SpreadsheetML alignment model and original native Calc item projection. */
import type { SaxesAttributeNS } from "saxes";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import {
  ScIndentItem,
  ScLineBreakCell,
  ScRotateValueItem,
  ScShrinkToFitCell,
  ScVerticalStackCell,
} from "../../../inc/attrib";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/source/items/frmitems.direction";
import {
  SvxHorJustifyItem,
  SvxJustifyMethodItem,
  SvxVerJustifyItem,
} from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify as H,
  SvxCellJustifyMethod as J,
  SvxCellVerJustify as V,
} from "../../../../editeng/inc/svxenum";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SvxRotateMode as Mode, SvxRotateModeItem } from "../../../../svx/inc/rotmodit";
import * as Which from "../../../inc/scitems";
import { attribute } from "./workbookfragment";
import { readStyleBool } from "./stylesbuffer";

const horizontal: ReadonlyMap<string, H> = new Map([
  ["left", H.Left],
  ["center", H.Center],
  ["centerContinuous", H.Center],
  ["right", H.Right],
  ["justify", H.Block],
  ["distributed", H.Block],
  ["fill", H.Repeat],
]);
const vertical: ReadonlyMap<string, V> = new Map([
  ["top", V.Top],
  ["center", V.Center],
  ["bottom", V.Bottom],
  ["justify", V.Block],
  ["distributed", V.Block],
]);

/** Native source attributes stored before finalization against workbook metrics. */
export class Alignment {
  /** Original alignment defaults and XML scalar state. @param horizontal - Horizontal XML token. @param vertical - Vertical XML token. @param readingOrder - Native direction code. @param rotation - Excel rotation. @param indent - Excel indent units. @param wrap - Wrap flag. @param shrink - Shrink flag. @returns Model. */
  constructor(
    private readonly horizontal = "general",
    private readonly vertical = "bottom",
    private readonly readingOrder = 0,
    private readonly rotation = 0,
    private readonly indent = 0,
    private readonly wrap = false,
    private readonly shrink = false,
  ) {}

  /** Reads the native XML alignment element, including the rotation-based horizontal default. @param attributes - Source attributes. @returns Model. */
  static importAlignment(attributes: readonly SaxesAttributeNS[]): Alignment {
    const rotation = toInt32(attribute(attributes, "textRotation"));
    const horizontalDefault =
      rotation === 0 ? "general" : rotation < 90 || rotation === 180 ? "left" : "right";
    return new Alignment(
      attribute(attributes, "horizontal") || horizontalDefault,
      attribute(attributes, "vertical") || "bottom",
      toInt32(attribute(attributes, "readingOrder")),
      rotation,
      toInt32(attribute(attributes, "indent")),
      readStyleBool(attribute(attributes, "wrapText"), false),
      readStyleBool(attribute(attributes, "shrinkToFit"), false),
    );
  }

  /** Distinguishes the source default from a parent alignment which an implicit child resets. @returns Whether native defaults agree. */
  isDefault(): boolean {
    return (
      (horizontal.get(this.horizontal) ?? H.Standard) === H.Standard &&
      this.vertical === "bottom" &&
      this.readingOrder === 0 &&
      this.rotation === 0 &&
      this.indent === 0 &&
      !this.wrap &&
      !this.shrink
    );
  }

  /** Applies native angle and indent conversions and constructs the actual pool items. @param space - Width of one source space in twips. @param bordered - Whether an outer border exists. @returns Native cell items. */
  createItems(space: number, bordered: boolean): SfxPoolItem[] {
    const angle =
      this.rotation >= 0 && this.rotation <= 180
        ? 100 * (this.rotation <= 90 ? this.rotation : 450 - this.rotation)
        : 0;
    const indent = Math.trunc(3 * this.indent * space);
    const direction =
      this.readingOrder === 1
        ? D.Horizontal_LR_TB
        : this.readingOrder === 2
          ? D.Horizontal_RL_TB
          : D.Environment;
    return [
      new SvxHorJustifyItem(horizontal.get(this.horizontal) ?? H.Standard, Which.ATTR_HOR_JUSTIFY),
      new SvxVerJustifyItem(vertical.get(this.vertical) ?? V.Standard, Which.ATTR_VER_JUSTIFY),
      new SvxJustifyMethodItem(
        this.horizontal === "distributed" ? J.Distribute : J.Auto,
        Which.ATTR_HOR_JUSTIFY_METHOD,
      ),
      new SvxJustifyMethodItem(
        this.vertical === "distributed" ? J.Distribute : J.Auto,
        Which.ATTR_VER_JUSTIFY_METHOD,
      ),
      new SvxFrameDirectionItem(direction, Which.ATTR_WRITINGDIR),
      new ScRotateValueItem(angle),
      new SvxRotateModeItem(
        angle !== 0 && bordered ? Mode.SVX_ROTATE_MODE_BOTTOM : Mode.SVX_ROTATE_MODE_STANDARD,
        Which.ATTR_ROTATE_MODE,
      ),
      new ScVerticalStackCell(this.rotation === 255),
      new ScIndentItem(indent >= 0 && indent <= 32767 ? indent : 0),
      new ScLineBreakCell(
        this.wrap || this.vertical === "justify" || this.vertical === "distributed",
      ),
      new ScShrinkToFitCell(this.shrink),
    ];
  }
}
