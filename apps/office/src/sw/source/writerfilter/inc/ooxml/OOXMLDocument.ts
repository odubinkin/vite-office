/** @fileoverview Original OOXMLStream stream selector identity; asynchronous stream opening is the host ZIP input binding. */

/** Original declaration order from OOXMLDocument.hxx. */
export enum StreamType_t {
  UNKNOWN,
  DOCUMENT,
  STYLES,
  WEBSETTINGS,
  FONTTABLE,
  NUMBERING,
  FOOTNOTES,
  ENDNOTES,
  COMMENTS,
  COMMENTS_EXTENDED,
  THEME,
  CUSTOMXML,
  CUSTOMXMLPROPS,
  GLOSSARY,
  CHARTS,
  EMBEDDINGS,
  SETTINGS,
  VBAPROJECT,
  FOOTER,
  HEADER,
  VBADATA,
}

/** Native document callbacks consumed by shared parser state; UTF16 fields bind immutable host XML strings. */
export interface OOXMLDocument {
  setXNoteId(id: number): void;
  getXNoteId(): number;
  getTarget(): string;
  /** Native progress callback consumed by paragraph-end context actions. */
  incrementProgress(): void;
}
