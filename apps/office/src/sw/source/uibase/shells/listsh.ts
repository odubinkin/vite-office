/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterInterface } from "../../../sdi/swriter";
import type { SwEditShell, WriterListLevelCommand } from "../../core/edit/ednumber";

/** Native editing-shell surface used directly by the list context. */
export type SwListShellTarget = Pick<SwEditShell, "GetNumLevel" | "NumUpDown">;

/** Context-sensitive shell that owns list execution and state. */
export class SwListShell {
  private readonly commandShell: SfxShell;

  /** Creates the active list shell. @param wrtShell - Editing shell target. @returns Nothing. */
  public constructor(private readonly wrtShell: SwListShellTarget) {
    this.commandShell = createSfxShell(this, createListCommandRegistry(this));
  }

  /** Returns the Sfx dispatch shell. @returns Command shell. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }

  /** Executes a list-level operation. @param command - Promote or demote. @returns Whether changed. */
  public Execute(command: WriterListLevelCommand): boolean {
    if (command !== "demote" && command !== "promote")
      throw new Error("Unsupported Writer list-level command: " + command);
    return this.wrtShell.NumUpDown(command === "demote");
  }

  /** Reads native current-point level state independently of range execution preflight. @param command - Level direction. @returns Whether enabled. */
  public CanExecute(command: WriterListLevelCommand): boolean {
    return this.wrtShell.GetNumLevel() !== (command === "demote" ? WRITER_MAX_LIST_LEVEL : 0);
  }
}

/** Builds the bounded list toolbar registry using generated slot/resource identity. @param target - Active list shell. @returns Command registry. */
function createListCommandRegistry(target: SwListShell): SfxInterface<SwListShell> {
  return createWriterInterface([
    ...(["promote", "demote"] as const).map(
      /** Creates one list command descriptor. @param command - List-level operation. @returns Command descriptor. */ (
        command,
      ) => {
        const id = command === "promote" ? WRITER_COMMAND_IDS.promote : WRITER_COMMAND_IDS.demote;
        return {
          capabilityId: "CAP-0107" as const,
          execute: /** Executes the bound list command. @returns Whether changed. */ (): boolean =>
            target.Execute(command),
          id,
          isEnabled:
            /** Computes context-sensitive list enablement. @returns Whether enabled. */ (): boolean =>
              target.CanExecute(command),
        };
      },
    ),
  ]);
}
