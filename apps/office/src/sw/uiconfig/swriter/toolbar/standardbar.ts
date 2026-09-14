/** @fileoverview Declares the supported subset of pinned Writer `standardbar.xml` placement data. */
import { WRITER_COMMAND_IDS } from "../menubar/menubar-commands";
import type { WriterToolbarItemPlacement } from "../ui-resource";

export const writerStandardBarItems: readonly WriterToolbarItemPlacement[] = [
  { commandId: WRITER_COMMAND_IDS.openOdt, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.saveOdt, kind: "command" },
  { kind: "separator" },
  { commandId: WRITER_COMMAND_IDS.cut, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.copy, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.paste, kind: "command" },
  { kind: "separator" },
  { commandId: WRITER_COMMAND_IDS.undo, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.redo, kind: "command" },
];
