/** @fileoverview Attaches generated Writer slot and presentation metadata to shell-owned handlers. */

import {
  createCommandRegistry,
  type CommandDefinition,
  type CommandRegistry,
} from "../../../../sfx2/source/control/dispatch";
import type { WriterCharacterFormat } from "../../core/txtnode/ndtxt";
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

/** Persistent Writer editing-shell surface used by text-shell handlers. */
export interface WriterTextCommandTarget {
  readonly CanRedo: () => boolean;
  readonly CanUndo: () => boolean;
  readonly CanChangeParagraphIndent: (increase: boolean) => boolean;
  readonly ChangeParagraphIndent: (increase: boolean) => boolean;
  readonly ChangeParagraphListLevel: (command: "demote" | "promote") => boolean;
  readonly GetActiveParagraph: () => Readonly<{
    alignment: "center" | "justify" | "left" | "right";
    list: Readonly<{ kind: "bullet" | "none" | "numbered"; level: number }>;
    style: string;
  }>;
  readonly GetCharacterFormatState: (format: WriterCharacterFormat) => "mixed" | "off" | "on";
  readonly GetDefaultFontFamily: () => string;
  readonly GetHyperlinkAtCursor: () => WriterHyperlink | undefined;
  readonly GetPendingCharacterAttributes: () => Readonly<{
    bold: boolean;
    fontFamily?: string;
    italic: boolean;
    underline: boolean;
  }>;
  readonly Redo: () => boolean;
  readonly SetParagraphAlignment: (alignment: "center" | "justify" | "left" | "right") => boolean;
  readonly SetParagraphListKind: (kind: "bullet" | "none" | "numbered") => boolean;
  readonly SetParagraphStyle: (style: string) => boolean;
  readonly SetFontFamily: (fontFamily: string) => boolean;
  readonly SetHyperlink: (hyperlink: WriterHyperlink | undefined, text?: string) => boolean;
  readonly ToggleCharacterFormat: (format: WriterCharacterFormat) => boolean;
  readonly Undo: () => boolean;
}

/** View-shell surface used by lifecycle, clipboard, and chrome handlers. */
export interface WriterViewCommandTarget {
  readonly Copy: (arguments_?: unknown) => Promise<void>;
  readonly Cut: (arguments_?: unknown) => Promise<void>;
  readonly ExportText: () => Promise<void>;
  readonly IsHorizontalRulerVisible: () => boolean;
  readonly IsSidebarVisible: () => boolean;
  readonly IsStatusBarVisible: () => boolean;
  readonly IsStoragePending: () => boolean;
  readonly LoadLocal: () => Promise<void>;
  readonly NewDocument: () => void;
  readonly OpenOdt: () => Promise<void>;
  readonly Paste: (arguments_?: unknown) => Promise<void>;
  readonly RequestSelectAll: () => void;
  readonly SaveLocal: () => Promise<void>;
  readonly SaveOdt: () => Promise<void>;
  readonly ToggleHorizontalRuler: () => void;
  readonly ToggleSidebar: () => void;
  readonly ToggleStatusBar: () => void;
}
