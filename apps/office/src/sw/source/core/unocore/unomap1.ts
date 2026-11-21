/** @fileoverview Native Writer page, paragraph, and character box property members from unomap1.cxx. */
import { cppu_detail_getUnoType_BorderLine as borderLineType } from "../../../../offapi/com/sun/star/table/BorderLine";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import { RES_BOX, RES_CHRATR_BOX } from "../../../inc/hintids";
import type { SwUnoPropertyEntry } from "./unomap";

/** Source box property descriptors for the four physical sides. @param attributes - Original property flags. @param which - Native box item identity. @param prefix - Original character property prefix. @returns Original UNO descriptors. */
export function boxMembers(
  attributes: number,
  which: number = RES_BOX,
  prefix = "",
): [string, SwUnoPropertyEntry][] {
  return (["Left", "Right", "Top", "Bottom"] as const).flatMap(
    /** Binds each original box member. @param side - Physical side. @param index - Native member order. @returns UNO property entries. */
    (side, index): [string, SwUnoPropertyEntry][] => [
      [
        `${prefix}${side}Border`,
        {
          which,
          member: (index + 1) | CONVERT_TWIPS,
          kind: "border",
          type: borderLineType,
          attributes,
        },
      ],
      [
        `${prefix}${side}BorderDistance`,
        { which, member: (index + 6) | CONVERT_TWIPS, kind: "long", type: "sal_Int32", attributes },
      ],
    ],
  );
}

/** Real Writer character box property rows. */
export const charBoxMembers: readonly [string, SwUnoPropertyEntry][] = boxMembers(
  0,
  RES_CHRATR_BOX,
  "Char",
);

/** Character box names admitted to the original style and default property maps. */
export const charBoxNames: readonly string[] = charBoxMembers.map(
  /** Projects each original UNO property name. @param entry - Native descriptor. @returns Name. */
  ([name]) => name,
);
