/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import {
  createCommandRegistry,
  createCommandShell,
  type CommandRegistry,
  type SfxShell,
} from "../../../../sfx2/source/control/dispatch";
import {
  isWriterParagraphListKind,
  WRITER_MAX_LIST_LEVEL,
  type WriterParagraphListKind,
} from "../../core/doc/list";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwUndoInsNum } from "../../core/undo/unnum";
import type { SwUndoCursorState } from "../../core/undo/undobj";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterSlotId } from "../../../sdi/swriter";
import { getWriterCommandResource } from "../../../uiconfig/swriter/writer-command-resources";
import { changeWriterParagraphListLevel } from "../wrtsh/wrtsh-indent";

/** Identifies the two executable Writer list-level commands. */
export type WriterListLevelCommand = "demote" | "promote";

/** Minimal SwWrtShell surface consumed by the active list context. */
export interface SwListShellTarget {
  readonly ApplyAction: (action: SwUndoInsNum) => boolean;
  readonly CaptureCursorState: () => SwUndoCursorState;
  readonly GetActiveParagraph: () => SwTextNode;
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
    return changeWriterParagraphListLevel(this.wrtShell, command);
  }

  /** Applies or removes the active paragraph's bounded list rule. @param kind - Next list kind. @returns Whether changed. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error(`Unsupported Writer paragraph list kind: ${kind}`);
    const paragraph = this.wrtShell.GetActiveParagraph();
    if (paragraph.list.kind === kind) return false;
    const cursor = this.wrtShell.CaptureCursorState();
    const before = paragraph.CaptureParagraphListState();
    return this.wrtShell.ApplyAction(
      new SwUndoInsNum(paragraph, before, { ...paragraph.list, kind }, cursor, cursor),
    );
  }

  /** Returns the active list level. @returns Zero-based level. */
  public GetLevel(): number {
    return this.wrtShell.GetActiveParagraph().list.level;
  }

  /** Returns the active paragraph list family. @returns Current list kind. */
  public GetKind(): WriterParagraphListKind {
    return this.wrtShell.GetActiveParagraph().list.kind;
  }

  /** Reports whether the active paragraph belongs to a list. @returns Whether in a list. */
  public IsInList(): boolean {
    return this.wrtShell.GetActiveParagraph().list.kind !== "none";
  }
}

/** Builds the bounded list toolbar registry using generated slot/resource identity. @param target - Active list shell. @returns Command registry. */
function createListCommandRegistry(target: SwListShell): CommandRegistry<SwListShell> {
  return createCommandRegistry([
    ...(["bullet", "numbered", "none"] as const).map(
      /** Creates one list-kind command owned by listsh. @param kind - Requested list kind. @returns Descriptor. */ (
        kind,
      ) => {
        const id = {
          bullet: WRITER_COMMAND_IDS.unorderedList,
          none: WRITER_COMMAND_IDS.removeBullets,
          numbered: WRITER_COMMAND_IDS.orderedList,
        }[kind];
        const resource = getWriterCommandResource(id);
        return {
          capabilityId: "CAP-0105" as const,
          execute:
            /** Applies or toggles the captured list kind. @returns Whether changed. */ (): boolean =>
              target.SetParagraphListKind(
                kind !== "none" && target.GetKind() === kind ? "none" : kind,
              ),
          id,
          isChecked: /** Reads active list kind. @returns Checked state. */ (): boolean =>
            target.GetKind() === kind,
          label: resource.label,
          slotId: getWriterSlotId(id),
        };
      },
    ),
    ...(["promote", "demote"] as const).map(
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
          isEnabled:
            /** Computes context-sensitive list enablement. @returns Whether enabled. */ (): boolean =>
              target.IsInList() &&
              (command === "promote"
                ? target.GetLevel() > 0
                : target.GetLevel() < WRITER_MAX_LIST_LEVEL),
          label: resource.label,
          slotId: getWriterSlotId(id),
        };
      },
    ),
  ]);
}
