/** @fileoverview Native ODF changed-region and change element import contexts. */
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLTextCursor, XMLTextRange } from "../../inc/txtimp";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLChangeInfoContext, type XMLChangeInfo } from "./XMLChangeInfoContext";
import type { XMLTextImportHelper } from "./txtimp";

/** Original supported change element identities. */
export type XMLRedlineKind = "insertion" | "deletion" | "format-change";

/** A native change definition after lexical date and identifier admission. */
export interface XMLRedlineInfo extends Omit<XMLChangeInfo, "date"> {
  readonly id: string;
  readonly type: XMLRedlineKind;
  readonly date: DateTime;
  readonly mergeLastParagraph: boolean;
  readonly styleName: string;
}

/** Writer target for the native redline import operations. */
export interface XMLRedlineImportTarget {
  SetRecordChanges(enabled: boolean): void;
  RedlineAdd(change: XMLRedlineInfo): void;
  RedlineCreateText(id: string): XMLTextCursor | undefined;
  RedlineFinishText(id: string): void;
  RedlineSetCursor(
    id: string,
    start: boolean,
    range: XMLTextRange,
    outside: boolean,
    collapsed?: boolean,
  ): void;
  RedlineAdjustStartNodeCursor(id: string): void;
}

/** Dispatches the native change-info child and the ordinary deleted text context. */
class XMLChangeElementImportContext extends SvXMLImportContext {
  /** Binds the owning changed region and change type. @param owner - Region. @param kind - Original change. */
  constructor(
    private readonly owner: XMLChangedRegionImportContext,
    private readonly kind: XMLRedlineKind,
  ) {
    super();
  }

  /** Preserves the original text context for deletion body content. @param element - Child token. @param attributes - Child properties. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.OFFICE_CHANGE_INFO)
      return new XMLChangeInfoContext(
        /** Completes the metadata for this change layer. @param info - Metadata. */ (info) =>
          this.owner.SetChangeInfo(this.kind, info),
      );
    return this.kind === "deletion" ? this.owner.UseRedlineText(element, attributes) : null;
  }
}

/** Imports one original changed-region, potentially composed of multiple changes. */
export class XMLChangedRegionImportContext extends SvXMLImportContext {
  private readonly id: string;
  private readonly mergeLastParagraph: boolean;
  private styleName = "";
  private hasDeletionText = false;

  /** Reads the original ID precedence and merge-last-paragraph property. @param helper - Paragraph and cursor importer. @param redlines - Model target. @param attributes - Original region attributes. */
  constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly redlines: XMLRedlineImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    this.id = attributes.get(XMLToken.XML_ID) ?? attributes.get(XMLToken.TEXT_ID) ?? "";
    const merge = attributes.get(XMLToken.TEXT_MERGE_LAST_PARAGRAPH);
    const value: [boolean] = [true];
    this.mergeLastParagraph = merge && Converter.convertBool(value, merge) ? value[0] : true;
  }

  /** Dispatches the original insertion, deletion and format change children. @param element - Original token. @param attributes - Child properties. @returns Change context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    const kind =
      element === XMLToken.TEXT_INSERTION
        ? "insertion"
        : element === XMLToken.TEXT_DELETION
          ? "deletion"
          : element === XMLToken.TEXT_FORMAT_CHANGE
            ? "format-change"
            : undefined;
    if (kind === undefined) return null;
    this.styleName = attributes.get(XMLToken.LOEXT_STYLE_NAME) ?? this.styleName;
    return new XMLChangeElementImportContext(this, kind);
  }

  /** Admits the native change only when its timestamp parses. @param type - Change element. @param info - Source metadata. */
  SetChangeInfo(type: XMLRedlineKind, info: XMLChangeInfo): void {
    const date = new DateTime();
    if (!Converter.parseDateTime(date, info.date)) return;
    this.redlines.RedlineAdd({
      ...info,
      id: this.id,
      type,
      date,
      mergeLastParagraph: this.mergeLastParagraph,
      styleName: this.styleName,
    });
  }

  /** Lazily installs the real deletion text cursor. @param element - Source child. @param attributes - Source child attributes. @returns Native text context. */
  UseRedlineText(element: XMLToken, attributes: FastAttributeList): SvXMLImportContext | null {
    if (!this.hasDeletionText) {
      const cursor = this.redlines.RedlineCreateText(this.id);
      if (cursor === undefined) return null;
      this.helper.PushTextFrameCursor(cursor);
      this.hasDeletionText = true;
    }
    return this.helper.CreateTextChildContext(element, attributes, "Redline");
  }

  /** Restores the original cursor after the redline text is complete. */
  override endFastElement(): void {
    if (!this.hasDeletionText) return;
    this.helper.PopTextFrameCursor();
    this.redlines.RedlineFinishText(this.id);
  }
}
