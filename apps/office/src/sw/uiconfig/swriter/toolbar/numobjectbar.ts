/** @fileoverview Declares browser Writer list-level controls at the pinned LibreOffice `sw/uiconfig/swriter/toolbar/numobjectbar.xml` ownership boundary. */

/** Describes one Writer Promote or Demote control shown for an active list paragraph. */
export interface WriterNumObjectBarListLevelCommand {
  /** Semantic action applied to the active Writer list item. */
  readonly command: "demote" | "promote";
  /** Stable accessible browser label matching the Writer action. */
  readonly label: string;
  /** LibreOffice command retained for parity evidence and future dispatch expansion. */
  readonly unoCommand: ".uno:DecrementLevel" | ".uno:IncrementLevel";
}

/** Lists the Writer numbering-toolbar controls in their pinned command order. */
export const writerNumObjectBarListLevelCommands: readonly WriterNumObjectBarListLevelCommand[] = [
  { command: "demote", label: "Demote", unoCommand: ".uno:DecrementLevel" },
  { command: "promote", label: "Promote", unoCommand: ".uno:IncrementLevel" },
];
