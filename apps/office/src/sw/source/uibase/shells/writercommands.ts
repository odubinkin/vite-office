/** @fileoverview Attaches generated Writer slot and presentation metadata to shell-owned handlers. */

import {
  createCommandRegistry,
  type CommandDefinition,
  type CommandRegistry,
} from "../../../../sfx2/source/control/dispatch";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";
import { getWriterSlotId } from "../../../sdi/swriter";
import { getWriterCommandResource } from "../../../uiconfig/swriter/writer-command-resources";
import { SfxUnoAnyItem, type SfxPoolItem } from "../../../../svl/source/items/poolitem";

/** Writer shell handler before generated resource and slot metadata are attached. */
type WriterCommandHandlerDefinition<Context> = Omit<
  CommandDefinition<Context>,
  "label" | "shortcut" | "shortcuts" | "slotId"
>;

/** Reads the UNO Any item installed by the presentation/dispatch boundary. @param arguments_ - SfxRequest item arguments. @returns Typed boundary value when present. */
export function getWriterCommandArguments<Value>(arguments_: unknown): Value | undefined {
  /* v8 ignore next -- SfxDispatcher always supplies the SfxRequest item array. */
  if (!Array.isArray(arguments_)) return undefined;
  const item = (arguments_ as readonly SfxPoolItem[]).find(
    /** Finds the Any item that carries a structured UNO argument. @param candidate - Request item. @returns Whether this is an Any item. */
    (candidate): candidate is SfxUnoAnyItem => candidate instanceof SfxUnoAnyItem,
  );
  return item?.GetValue() as Value | undefined;
}

/** Adds generated numeric slot and presentation identity to handlers owned by a concrete shell. @param commands - Handler descriptors. @returns Validated command registry. */
export function createWriterCommandRegistry<Context>(
  commands: readonly WriterCommandHandlerDefinition<Context>[],
): CommandRegistry<Context> {
  return createCommandRegistry(
    commands.map(
      /** Attaches generated command presentation and slot metadata. @param command - Writer handler. @returns Complete command definition. */
      (command) => {
        const resource = getWriterCommandResource(command.id);
        const [shortcut, ...shortcuts] = resource.shortcuts;
        return {
          ...command,
          label: resource.label,
          ...(shortcut === undefined ? {} : { shortcut }),
          ...(shortcuts.length === 0 ? {} : { shortcuts }),
          slotId: getWriterSlotId(command.id),
        };
      },
    ),
  );
}

/** Arguments supplied by the DOM selection adapter to a character-format command. */
export interface WriterCharacterCommandArguments {
  readonly fontFamily?: string;
}
/** Arguments submitted by the browser hyperlink dialog. */
export interface WriterHyperlinkCommandArguments {
  readonly hyperlink?: WriterHyperlink;
  readonly text?: string;
}

/** View-shell surface used by Writer view and chrome handlers. */
export interface WriterViewCommandTarget {
  readonly IsHorizontalRulerVisible: () => boolean;
  readonly IsSidebarVisible: () => boolean;
  readonly IsStatusBarVisible: () => boolean;
  readonly IsStoragePending: () => boolean;
  readonly NewDocument: () => void;
  readonly RequestSelectAll: () => void;
  readonly ToggleHorizontalRuler: () => void;
  readonly ToggleSidebar: () => void;
  readonly ToggleStatusBar: () => void;
}
