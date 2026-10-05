/** @fileoverview Owns shared Writer body/cell text child dispatch and stream list state from native txtimp.cxx. */
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLTableContext, type XMLTableImportTarget } from "../table/XMLTableImport";
import { XMLParaContext, type XMLTextImportTarget } from "./txtparai";
import { XMLTextListsHelper } from "./txtlists";
import { XMLTextListBlockContext } from "./XMLTextListBlockContext";

/** Native text import locations represented by the current body/table slice. */
export type XMLTextType = "Body" | "Cell";

/** One native text import owner keeps processed list roots across body and every cell. */
export class XMLTextImportHelper {
  private readonly lists = new XMLTextListsHelper();

  /** Binds the common dispatcher to actual Writer paragraph/table operations. @param target - Canonical import target. @returns Nothing. */
  public constructor(private readonly target: XMLTextImportTarget) {}

  /** Creates the supported native paragraph/list/table context for this text location. @param element - Child token. @param attributes - Child values. @param type - Native text location. @returns Context or native inert-child fallback. */
  public CreateTextChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
    type: XMLTextType,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H)
      return new XMLParaContext(this.target, element, attributes);
    if (element === XMLToken.TEXT_LIST)
      return new XMLTextListBlockContext(this.target, attributes, this.lists);
    if (element === XMLToken.TABLE_TABLE) {
      if (type === "Cell") throw new Error("Unsupported ODF table cell section or nested table.");
      if ("beginTable" in this.target)
        return new XMLTableContext(this.target as XMLTableImportTarget, attributes, this);
      return null;
    }
    if (element === XMLToken.TEXT_SEQUENCE_DECLS && type === "Body")
      return new SvXMLIgnoreContext(true);
    if (element === XMLToken.TEXT_SECTION)
      throw new Error(
        type === "Cell"
          ? "Unsupported ODF table cell section or nested table."
          : "Unsupported ODF text section.",
      );
    return null;
  }
}
