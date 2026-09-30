/** @fileoverview Owns the supported modern list label-alignment import attributes from pinned xmlnumi.cxx. */
import { FastAttributeList, SvXMLIgnoreContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { XMLListLevelImportProperties } from "../text/txtparai";

/** Parses one label-alignment leaf into native MM100 numbering properties. */
export class SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl extends SvXMLIgnoreContext {
  /** Retains native zero defaults and replaces only successfully parsed fields. @param attributes - Source attributes. @param save - Parent property sink. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    save: (properties: XMLListLevelImportProperties) => void,
  ) {
    super();
    const converter = new SvXMLUnitConverter("mm100");
    /** Reads one bounded property, preserving the constructor default on failure. @param token - Attribute token. @param min - Native lower bound. @returns MM100 integer. */
    function measure(token: XMLToken, min: number): number {
      const value = attributes.get(token);
      return value === null ? 0 : (converter.convertMeasureToCore(value, min, 32767) ?? 0);
    }
    const follow = attributes.get(XMLToken.TEXT_LABEL_FOLLOWED_BY);
    save({
      measureUnit: "mm100",
      values: {
        firstLineIndent: measure(XMLToken.FO_TEXT_INDENT, -32768),
        indentAt: measure(XMLToken.FO_MARGIN_LEFT, -32768),
        labelFollowedBy: follow === "space" || follow === "nothing" ? follow : "listtab",
        listTabPosition: measure(XMLToken.TEXT_LIST_TAB_STOP_POSITION, 0),
      },
    });
  }
}
