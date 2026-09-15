/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import {
  createCommandRegistry,
  createCommandShell,
  type CommandRegistry,
  type SfxShell,
} from "../../../../framework/source/dispatch/dispatchprovider";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterSlotId } from "../../../sdi/swriter";
import { getWriterCommandResource } from "../../../uiconfig/swriter/writer-command-resources";

/** Identifies the two executable Writer list-level commands. */
export type WriterListLevelCommand = "demote" | "promote";

/** Minimal SwWrtShell surface consumed by the active list context. */
export interface SwListShellTarget {
  readonly ChangeParagraphListLevel: (command: WriterListLevelCommand) => boolean;
  readonly GetActiveParagraph: () => Readonly<{
    list: Readonly<{ kind: "bullet" | "none" | "numbered"; level: number }>;
  }>;
}

/** Context-sensitive shell that owns list execution and state. */
export class SwListShell {
  private readonly commandShell: SfxShell;

  /** Creates the active list shell. @param wrtShell - Editing shell target. @returns Nothing. */
  public constructor(private readonly wrtShell: SwListShellTarget) {
    this.commandShell = createCommandShell(this, createListCommandRegistry(this));
  }

  /** Returns the Sfx dispatch shell. @returns Command shell. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }

  /** Executes a list-level operation. @param command - Promote or demote. @returns Whether changed. */
  public Execute(command: WriterListLevelCommand): boolean {
    return this.wrtShell.ChangeParagraphListLevel(command);
  }

  /** Returns the active list level. @returns Zero-based level. */
  public GetLevel(): number {
    return this.wrtShell.GetActiveParagraph().list.level;
  }

  /** Reports whether the active paragraph belongs to a list. @returns Whether in a list. */
  public IsInList(): boolean {
    return this.wrtShell.GetActiveParagraph().list.kind !== "none";
  }
}

/** Builds the bounded list toolbar registry using generated slot/resource identity. @param target - Active list shell. @returns Command registry. */
function createListCommandRegistry(target: SwListShell): CommandRegistry<SwListShell> {
  return createCommandRegistry(
    (["promote", "demote"] as const).map(
      /** Creates one list command descriptor. @param command - List-level operation. @returns Command descriptor. */ (
        command,
      ) => {
        const id = command === "promote" ? WRITER_COMMAND_IDS.promote : WRITER_COMMAND_IDS.demote;
        const resource = getWriterCommandResource(id);
        return {
          capabilityId: "CAP-0107" as const,
          execute: /** Executes the bound list command. @returns Whether changed. */ (): boolean =>
            target.Execute(command),
          id,
          invalidates: ["document", "history", "selection"],
          isEnabled:
            /** Computes context-sensitive list enablement. @returns Whether enabled. */ (): boolean =>
              target.IsInList() &&
              (command === "promote"
                ? target.GetLevel() > 0
                : target.GetLevel() < WRITER_MAX_LIST_LEVEL),
          label: resource.label,
          slotId: getWriterSlotId(id),
          target: "shell" as const,
          undoPolicy: "record" as const,
        };
      },
    ),
  );
}
