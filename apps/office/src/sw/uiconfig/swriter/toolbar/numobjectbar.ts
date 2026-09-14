/** @fileoverview Declares the supported subset of pinned Writer `numobjectbar.xml` placement data. */
import { WRITER_COMMAND_IDS } from "../menubar/menubar-commands";
import type { WriterToolbarItemPlacement } from "../ui-resource";

export const writerNumObjectBarItems: readonly WriterToolbarItemPlacement[] = [
  { commandId: WRITER_COMMAND_IDS.demote, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.promote, kind: "command" },
];
