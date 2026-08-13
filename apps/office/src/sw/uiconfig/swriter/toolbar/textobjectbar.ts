/**
 * @fileoverview Declares the initial browser Writer list controls at the pinned `sw/uiconfig/swriter/toolbar/textobjectbar` ownership boundary.
 */

/** Describes one default-list control placed after paragraph alignment in the Writer text-object toolbar. */
export interface WriterTextObjectBarListCommand {
  /** Supported list presentation selected by the toolbar control. */
  readonly listKind: "bullet" | "numbered";
  /** Stable accessible name shown in the browser toolbar. */
  readonly label: string;
  /** LibreOffice UNO command retained for parity evidence and later typed dispatch. */
  readonly unoCommand: ".uno:DefaultBullet" | ".uno:DefaultNumbering";
}

/** Lists default bullet and numbering controls in their pinned Writer toolbar order. */
export const writerTextObjectBarListCommands: readonly WriterTextObjectBarListCommand[] = [
  { label: "Unordered List", listKind: "bullet", unoCommand: ".uno:DefaultBullet" },
  { label: "Ordered List", listKind: "numbered", unoCommand: ".uno:DefaultNumbering" },
];
