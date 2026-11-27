/** @fileoverview Native ODF collapsed and ranged redline markers. */
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLRedlineImportTarget } from "./XMLChangedRegionImportContext";
import type { XMLTextImportHelper } from "./txtimp";

/** Forwards a source redline marker to the original cursor owner. */
export class XMLChangeImportContext extends SvXMLImportContext {
  /** Binds the original text cursor and outside-paragraph state. @param helper - Active XML text importer. @param redlines - Native range owner. @param outside - Marker occurs outside a paragraph. */
  constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly redlines: XMLRedlineImportTarget,
    private readonly outside: boolean,
  ) {
    super();
  }

  /** Recognizes the original collapsed and ranged change markers. @param element - Source token. @returns Whether the element marks a redline position. */
  static IsChange(element: XMLToken): boolean {
    return (
      element === XMLToken.TEXT_CHANGE ||
      element === XMLToken.TEXT_CHANGE_START ||
      element === XMLToken.TEXT_CHANGE_END
    );
  }

  /** Applies the source anchor at the active text cursor. @param element - Source marker kind. @param attributes - Marker ID. */
  override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    const id = attributes.get(XMLToken.TEXT_CHANGE_ID);
    if (!id) return;
    if (this.outside) this.helper.SetOpenRedlineId(id);
    const range = this.helper.GetCursor().getStart();
    const collapsed = element === XMLToken.TEXT_CHANGE;
    try {
      if (element !== XMLToken.TEXT_CHANGE_END)
        this.redlines.RedlineSetCursor(id, true, range, this.outside, collapsed);
      if (element !== XMLToken.TEXT_CHANGE_START)
        this.redlines.RedlineSetCursor(id, false, range, this.outside, collapsed);
    } finally {
      range.dispose();
    }
  }
}
