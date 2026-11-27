/** @fileoverview Native tracking mode and changed-region dispatch for ODF content. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLChangedRegionImportContext,
  type XMLRedlineImportTarget,
} from "./XMLChangedRegionImportContext";
import type { XMLTextImportHelper } from "./txtimp";

/** The original tracked-change definitions attached to a text stream. */
export class XMLTrackedChangesImportContext extends SvXMLImportContext {
  /** Binds the application's redline and shared XML text import owners. @param helper - Shared text filter. @param redlines - Native model target. */
  constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly redlines: XMLRedlineImportTarget,
  ) {
    super();
  }

  /** Applies the original in-container recording default. @param _element - Container token. @param attributes - Source attributes. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    const track = attributes.get(XMLToken.TEXT_TRACK_CHANGES);
    const enabled: [boolean] = [true];
    this.redlines.SetRecordChanges(
      track && Converter.convertBool(enabled, track) ? enabled[0] : true,
    );
  }

  /** Reads an individual changed region. @param element - Source child token. @param attributes - Region attributes. @returns Changed-region context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return element === XMLToken.TEXT_CHANGED_REGION
      ? new XMLChangedRegionImportContext(this.helper, this.redlines, attributes)
      : null;
  }
}
