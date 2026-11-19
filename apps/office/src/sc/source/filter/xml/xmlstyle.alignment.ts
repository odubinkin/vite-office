/** @fileoverview Native ODF Calc style property projection for orientation, rotation and justification methods. */
import { Converter } from "../../../../sax/source/tools/converter";
import { SvxJustifyMethodItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellJustifyMethod as J } from "../../../../editeng/inc/svxenum";
import { SvxRotateMode as M, SvxRotateModeItem } from "../../../../svx/inc/rotmodit";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken as T } from "../../../../xmloff/source/core/xmltoken";
import { ScRotateValueItem, ScShrinkToFitCell, ScVerticalStackCell } from "../../../inc/attrib";
import type { ScPatternAttr } from "../../../inc/patattr";
import * as Which from "../../../inc/scitems";

/** Supported native table-cell property names. */
export const alignmentCellTokens = [
  T.STYLE_DIRECTION,
  T.STYLE_ROTATION_ANGLE,
  T.STYLE_ROTATION_ALIGN,
  T.STYLE_SHRINK_TO_FIT,
  T.STYLE_VERTICAL_JUSTIFY,
  T.LOEXT_VERTICAL_JUSTIFY,
] as const;

const rotationReferences = ["none", "top", "center", "bottom"] as const;

/** Handles the original justify-method spelling; unknown values leave the destination unchanged. @param pattern - Cell pattern. @param source - Lexical method. @param which - Native method item ID. @returns Nothing. */
export function importJustifyMethod(pattern: ScPatternAttr, source: string, which: number): void {
  if (source === "auto" || source === "distribute")
    pattern.ItemSetPut(new SvxJustifyMethodItem(source === "auto" ? J.Auto : J.Distribute, which));
}

/** Imports original scalar cell style properties. @param pattern - Cell pattern. @param attributes - Source attributes. @param unsupported - Existing diagnostic sink. @returns Nothing. */
export function importCellAlignment(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  for (const [key, source] of attributes) {
    switch (key) {
      case T.STYLE_DIRECTION:
        if (source === "ttb" || source === "ltr")
          pattern.ItemSetPut(new ScVerticalStackCell(source === "ttb"));
        else unsupported("invalid cell orientation");
        break;
      case T.STYLE_ROTATION_ANGLE: {
        const angle: [number] = [0];
        if (Converter.convertAngle(angle, source))
          pattern.ItemSetPut(new ScRotateValueItem(Math.round(angle[0] * 100)));
        else unsupported("invalid cell rotation angle");
        break;
      }
      case T.STYLE_ROTATION_ALIGN: {
        const mode = (rotationReferences as readonly string[]).indexOf(source);
        if (mode >= 0) pattern.ItemSetPut(new SvxRotateModeItem(mode as M, Which.ATTR_ROTATE_MODE));
        else unsupported("invalid cell rotation reference");
        break;
      }
      case T.STYLE_SHRINK_TO_FIT: {
        const shrink: [boolean] = [false];
        if (Converter.convertBool(shrink, source))
          pattern.ItemSetPut(new ScShrinkToFitCell(shrink[0]));
        else unsupported("invalid cell shrink flag");
        break;
      }
      case T.STYLE_VERTICAL_JUSTIFY:
      case T.LOEXT_VERTICAL_JUSTIFY:
        importJustifyMethod(pattern, source, Which.ATTR_VER_JUSTIFY_METHOD);
        break;
    }
  }
}

/** Writes source justification-method XML when the native item is set. @param pattern - Effective cell style. @param which - Horizontal or vertical method ID. @param name - ODF attribute name. @returns Attribute. */
export function exportJustifyMethod(pattern: ScPatternAttr, which: number, name: string): string {
  const item = pattern.GetItemSet().GetItemIfSet(which, false) as SvxJustifyMethodItem | undefined;
  return item === undefined
    ? ""
    : ` ${name}="${item.GetValue() === J.Distribute ? "distribute" : "auto"}"`;
}

/** Writes direct native table-cell style attributes. @param pattern - Cell style. @returns ODF attributes. */
export function exportCellAlignment(pattern: ScPatternAttr): string {
  const set = pattern.GetItemSet();
  const orientation = set.GetItemIfSet(Which.ATTR_STACKED, false) as
    ScVerticalStackCell | undefined;
  const angle = set.GetItemIfSet(Which.ATTR_ROTATE_VALUE, false) as ScRotateValueItem | undefined;
  const reference = set.GetItemIfSet(Which.ATTR_ROTATE_MODE, false) as
    SvxRotateModeItem | undefined;
  const shrink = set.GetItemIfSet(Which.ATTR_SHRINKTOFIT, false) as ScShrinkToFitCell | undefined;
  return (
    (orientation === undefined
      ? ""
      : ` style:direction="${orientation.GetValue() ? "ttb" : "ltr"}"`) +
    (angle === undefined ? "" : ` style:rotation-angle="${Math.trunc(angle.GetValue() / 100)}"`) +
    (reference === undefined
      ? ""
      : ` style:rotation-align="${rotationReferences[reference.GetValue()]}"`) +
    (shrink === undefined ? "" : ` style:shrink-to-fit="${shrink.GetValue()}"`) +
    exportJustifyMethod(pattern, Which.ATTR_VER_JUSTIFY_METHOD, "loext:vertical-justify")
  );
}
