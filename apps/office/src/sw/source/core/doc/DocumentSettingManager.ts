/** @fileoverview Implements the bounded settings ownership boundary from pinned LibreOffice `sw/source/core/doc/DocumentSettingManager.cxx`. */

/** Setting identities consumed by the currently implemented paragraph, list, style and line paths. */
export type DocumentSettingId =
  | "ADD_EXT_LEADING"
  | "AUTO_FIRST_LINE_INDENT_DISREGARD_LINE_SPACE"
  | "DO_NOT_JUSTIFY_LINES_WITH_MANUAL_BREAK"
  | "HTML_MODE"
  | "IGNORE_FIRST_LINE_INDENT_IN_NUMBERING"
  | "IGNORE_TABS_AND_BLANKS_FOR_LINE_CALCULATION"
  | "OLD_LINE_SPACING"
  | "OLD_NUMBERING"
  | "PARA_SPACE_MAX"
  | "PARA_SPACE_MAX_AT_PAGES"
  | "PROP_LINE_SPACING_SHRINKS_FIRST_LINE"
  | "STYLES_NODEFAULT"
  | "TAB_AT_LEFT_INDENT_FOR_PARA_IN_LIST"
  | "TAB_COMPAT"
  | "TAB_OVERFLOW"
  | "TABS_RELATIVE_TO_INDENT";

/** Pinned upstream defaults independent of host configuration. */
const DEFAULT_DOCUMENT_SETTINGS: Readonly<Record<DocumentSettingId, boolean>> = Object.freeze({
  ADD_EXT_LEADING: true,
  AUTO_FIRST_LINE_INDENT_DISREGARD_LINE_SPACE: true,
  DO_NOT_JUSTIFY_LINES_WITH_MANUAL_BREAK: false,
  HTML_MODE: false,
  IGNORE_FIRST_LINE_INDENT_IN_NUMBERING: false,
  IGNORE_TABS_AND_BLANKS_FOR_LINE_CALCULATION: false,
  OLD_LINE_SPACING: false,
  OLD_NUMBERING: false,
  PARA_SPACE_MAX: true,
  PARA_SPACE_MAX_AT_PAGES: true,
  PROP_LINE_SPACING_SHRINKS_FIRST_LINE: true,
  STYLES_NODEFAULT: false,
  TAB_AT_LEFT_INDENT_FOR_PARA_IN_LIST: false,
  TAB_COMPAT: true,
  TAB_OVERFLOW: true,
  TABS_RELATIVE_TO_INDENT: true,
});

/** Settings used by the current browser Writer slice. */
export class DocumentSettingManager {
  private readonly values: Record<DocumentSettingId, boolean> = { ...DEFAULT_DOCUMENT_SETTINGS };

  /** Reports whether the model is operating in HTML mode. @param documentSettingId - Setting identity. @returns HTML mode flag. */
  public get(documentSettingId: DocumentSettingId): boolean {
    return this.values[documentSettingId];
  }

  /** Changes one supported document setting. @param documentSettingId - Setting identity. @param value - New value. @returns Nothing. */
  public set(documentSettingId: DocumentSettingId, value: boolean): void {
    this.values[documentSettingId] = value;
  }

  /** Returns a primitive copy for document-boundary persistence. @returns Every supported setting. */
  public GetValues(): Readonly<Record<DocumentSettingId, boolean>> {
    return Object.freeze({ ...this.values });
  }

  /** Restores a complete current-schema settings record. @param values - Stored values. @returns Nothing. */
  public SetValues(values: Readonly<Record<DocumentSettingId, boolean>>): void {
    for (const id of Object.keys(DEFAULT_DOCUMENT_SETTINGS) as DocumentSettingId[]) {
      if (typeof values[id] !== "boolean")
        throw new Error(`Stored Writer document setting is invalid: ${id}`);
      this.values[id] = values[id];
    }
  }
}

/** Returns the complete pinned default record for focused differential tests. @returns Settings defaults. */
export function getDefaultDocumentSettings(): Readonly<Record<DocumentSettingId, boolean>> {
  return DEFAULT_DOCUMENT_SETTINGS;
}
