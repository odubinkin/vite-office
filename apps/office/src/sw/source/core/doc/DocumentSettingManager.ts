/** @fileoverview Implements the bounded settings ownership boundary from pinned LibreOffice `sw/source/core/doc/DocumentSettingManager.cxx`. */

/** Settings used by the current browser Writer slice. */
export class DocumentSettingManager {
  private htmlMode = false;

  /** Reports whether the model is operating in HTML mode. @param documentSettingId - Setting identity. @returns HTML mode flag. */
  public get(documentSettingId: "HTML_MODE"): boolean {
    void documentSettingId;
    return this.htmlMode;
  }

  /** Changes one supported document setting. @param documentSettingId - Setting identity. @param value - New value. @returns Nothing. */
  public set(documentSettingId: "HTML_MODE", value: boolean): void {
    void documentSettingId;
    this.htmlMode = value;
  }
}
