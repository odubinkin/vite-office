/**
 * @fileoverview Declares Writer slot-like command descriptors and state handlers following
 * the pinned SfxShell/SfxDispatcher execution boundary.
 */

import {
  createCommandRegistry,
  type CommandDefinition,
  type CommandRegistry,
} from "../../../../sfx2/source/control/dispatch";
import type { WriterCharacterFormat } from "../../core/txtnode/ndtxt";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterSlotId } from "../../../sdi/swriter";
import { getWriterCommandResource } from "../../../uiconfig/swriter/writer-command-resources";
import type { WriterDialogController } from "../dialog/writer-dialog-controller";
import { SfxUnoAnyItem, type SfxPoolItem } from "../../../../svl/source/items/poolitem";

/** Writer shell handler before generated resource and slot metadata are attached. */
type WriterCommandHandlerDefinition<Context> = Omit<
  CommandDefinition<Context>,
  "label" | "shortcut" | "shortcuts" | "slotId"
>;

/** Reads the UNO Any item installed by the presentation/dispatch boundary. @param arguments_ - SfxRequest item arguments. @returns Typed boundary value when present. */
function getWriterCommandArguments<Value>(arguments_: unknown): Value | undefined {
  /* v8 ignore next -- SfxDispatcher always supplies the SfxRequest item array. */
  if (!Array.isArray(arguments_)) return undefined;
  const item = (arguments_ as readonly SfxPoolItem[]).find(
    /** Finds the Any item that carries a structured UNO argument. @param candidate - Request item. @returns Whether this is an Any item. */
    (candidate): candidate is SfxUnoAnyItem => candidate instanceof SfxUnoAnyItem,
  );
  return item?.GetValue() as Value | undefined;
}

/** Adds the generated numeric slot identity to Writer shell descriptors. @param commands - Handler descriptors. @returns Validated command registry. */
function createWriterCommandRegistry<Context>(
  commands: readonly WriterCommandHandlerDefinition<Context>[],
): CommandRegistry<Context> {
  return createCommandRegistry(
    commands.map(
      /** Attaches generated command presentation and slot metadata. @param command - Writer handler. @returns Complete command definition. */ (
        command,
      ) => {
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

/** Persistent Writer editing-shell surface used by command descriptors. */
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

/** View-shell surface used by lifecycle, clipboard, and chrome command descriptors. */
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

/** Creates the active SwWrtShell command registry. @param target - Persistent Writer editing shell. @param dialogController - Writer-owned dialog lifecycle. @returns Validated immutable descriptors. */
export function createWriterTextCommandRegistry(
  target: WriterTextCommandTarget,
  dialogController: WriterDialogController,
): CommandRegistry<WriterTextCommandTarget> {
  const active =
    /** Reads the currently targeted paragraph. @returns Active paragraph projection. */ (): ReturnType<
      WriterTextCommandTarget["GetActiveParagraph"]
    > => target.GetActiveParagraph();
  const characterCommand =
    /** Creates one direct-character command descriptor. @param id - Stable ID. @param format - Character attribute. @returns Command descriptor. */
    (id: string, format: WriterCharacterFormat) => ({
      capabilityId: "CAP-0109" as const,
      /** Toggles direct formatting through the editing shell. @returns Whether content changed. */
      execute: (): boolean => target.ToggleCharacterFormat(format),
      id,
      /** Reads the selection-aware toggle value. @returns Current checked state. */
      isChecked: (): boolean => target.GetCharacterFormatState(format) === "on",
      /** Reports a mixed direct-format selection. @returns True when selected text has both values. */
      isMixed: (): boolean => target.GetCharacterFormatState(format) === "mixed",
    });
  return createWriterCommandRegistry([
    {
      capabilityId: "CAP-0102",
      /** Restores the previous history state. @returns Whether navigation occurred. */
      execute: (): boolean => target.Undo(),
      id: WRITER_COMMAND_IDS.undo,
      /** Reads Undo availability. @returns Whether Undo is enabled. */
      isEnabled: (): boolean => target.CanUndo(),
    },
    {
      capabilityId: "CAP-0102",
      /** Restores the following history state. @returns Whether navigation occurred. */
      execute: (): boolean => target.Redo(),
      id: WRITER_COMMAND_IDS.redo,
      /** Reads Redo availability. @returns Whether Redo is enabled. */
      isEnabled: (): boolean => target.CanRedo(),
    },
    characterCommand(WRITER_COMMAND_IDS.bold, "bold"),
    characterCommand(WRITER_COMMAND_IDS.italic, "italic"),
    characterCommand(WRITER_COMMAND_IDS.underline, "underline"),
    {
      capabilityId: "CAP-0135",
      /** Applies dialog hyperlink data to the current selection or caret. @param _context - Bound shell. @param arguments_ - Dialog payload. @returns Whether content changed. */
      execute: (_context, arguments_: unknown): boolean | Promise<boolean> => {
        const args = getWriterCommandArguments<WriterHyperlinkCommandArguments>(arguments_);
        if (args?.hyperlink !== undefined) return target.SetHyperlink(args.hyperlink, args.text);
        return dialogController
          .RequestHyperlinkDialog(WRITER_COMMAND_IDS.hyperlinkDialog, target.GetHyperlinkAtCursor())
          .then(
            /** Applies only an accepted controller result. @param result - Typed dialog fields or cancellation. @returns Whether Writer changed. */ (
              result,
            ) =>
              result === undefined ? false : target.SetHyperlink(result.hyperlink, result.text),
          );
      },
      /** Exposes current hyperlink metadata to the dialog presenter. @returns Hyperlink or undefined. */
      getStateValue: (): WriterHyperlink | undefined => target.GetHyperlinkAtCursor(),
      id: WRITER_COMMAND_IDS.hyperlinkDialog,
    },
    {
      capabilityId: "CAP-0135",
      /** Replaces the current hyperlink using dialog data. @param _context - Bound shell. @param arguments_ - Dialog payload. @returns Whether changed. */
      execute: (_context, arguments_: unknown): boolean | Promise<boolean> => {
        const args = getWriterCommandArguments<WriterHyperlinkCommandArguments>(arguments_);
        if (args?.hyperlink !== undefined) return target.SetHyperlink(args.hyperlink);
        return dialogController
          .RequestHyperlinkDialog(WRITER_COMMAND_IDS.editHyperlink, target.GetHyperlinkAtCursor())
          .then(
            /** Applies only an accepted controller result. @param result - Typed dialog fields or cancellation. @returns Whether Writer changed. */ (
              result,
            ) => (result === undefined ? false : target.SetHyperlink(result.hyperlink)),
          );
      },
      /** Reads current hyperlink metadata for dialog initialization. @returns Hyperlink or undefined. */
      getStateValue: (): WriterHyperlink | undefined => target.GetHyperlinkAtCursor(),
      id: WRITER_COMMAND_IDS.editHyperlink,
      /** Enables editing only for a uniform selected or caret link. @returns Whether enabled. */
      isEnabled: (): boolean => target.GetHyperlinkAtCursor() !== undefined,
    },
    {
      capabilityId: "CAP-0135",
      /** Removes hyperlink metadata from the current selected link. @returns Whether changed. */
      execute: (): boolean => target.SetHyperlink(undefined),
      id: WRITER_COMMAND_IDS.removeHyperlink,
      /** Enables removal only for a uniform selected or caret link. @returns Whether enabled. */
      isEnabled: (): boolean => target.GetHyperlinkAtCursor() !== undefined,
    },
    {
      capabilityId: "CAP-0109",
      /** Applies a selected font. @param _context - Bound shell. @param arguments_ - Font arguments. @returns Whether changed. */
      execute: (_context, arguments_: unknown): boolean => {
        const args = getWriterCommandArguments<WriterCharacterCommandArguments>(arguments_);
        return args?.fontFamily === undefined ? false : target.SetFontFamily(args.fontFamily);
      },
      /** Reads the caret font. @returns Current family. */
      getStateValue: (): string =>
        target.GetPendingCharacterAttributes().fontFamily ?? target.GetDefaultFontFamily(),
      id: WRITER_COMMAND_IDS.fontName,
    },
    ...(["left", "center", "right", "justify"] as const).map(
      /** Creates one paragraph-alignment descriptor. @param alignment - Supported alignment. @returns Command descriptor. */
      (alignment) => ({
        capabilityId: "CAP-0112" as const,
        /** Applies the captured alignment. @returns Whether content changed. */
        execute: (): boolean => target.SetParagraphAlignment(alignment),
        id: {
          center: WRITER_COMMAND_IDS.alignCenter,
          justify: WRITER_COMMAND_IDS.alignJustify,
          left: WRITER_COMMAND_IDS.alignLeft,
          right: WRITER_COMMAND_IDS.alignRight,
        }[alignment],
        /** Compares the active alignment with this command. @returns Checked state. */
        isChecked: (): boolean => active().alignment === alignment,
      }),
    ),
    ...([true, false] as const).map(
      /** Creates one context-sensitive text-shell indent descriptor. @param increase - Whether indentation increases. @returns Command descriptor. */ (
        increase,
      ) => ({
        capabilityId: "CAP-0107" as const,
        /** Routes list paragraphs to NumUpDown and ordinary paragraphs to MoveLeftMargin semantics. @returns Whether content changed. */
        execute: (): boolean => target.ChangeParagraphIndent(increase),
        id: increase ? WRITER_COMMAND_IDS.increaseIndent : WRITER_COMMAND_IDS.decreaseIndent,
        /** Mirrors the upstream text-shell availability query for the active paragraph context. @returns Whether enabled. */
        isEnabled: (): boolean => target.CanChangeParagraphIndent(increase),
      }),
    ),
    {
      capabilityId: "CAP-0112",
      /** Applies the Style argument carried by the numeric StyleApply request. @param _context - Bound shell. @param arguments_ - Parsed UNO arguments. @returns Whether content changed. */
      execute: (_context, arguments_: unknown): boolean => {
        const name = getWriterCommandArguments<Readonly<{ Style?: string }>>(arguments_)?.Style;
        const style = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
          /** Matches a supported programmatic style name. @param candidate - Available style. @returns Whether matching. */ (
            candidate,
          ) =>
            (candidate.name === "Standard" ? "Default Paragraph Style" : candidate.name) === name,
        );
        if (style === undefined)
          throw new Error(`Unsupported Writer paragraph style: ${name ?? ""}`);
        return target.SetParagraphStyle(style.id);
      },
      /** Reads the active paragraph style value. @returns Stable style ID. */
      getStateValue: (): string => active().style,
      id: WRITER_COMMAND_IDS.styleApply,
    },
    ...(["bullet", "numbered", "none"] as const).map(
      /** Creates one paragraph-list descriptor. @param kind - Supported list kind. @returns Command descriptor. */
      (kind) => ({
        capabilityId: "CAP-0105" as const,
        /** Applies the captured list kind. @returns Whether content changed. */
        execute: (): boolean =>
          target.SetParagraphListKind(
            kind !== "none" && active().list.kind === kind ? "none" : kind,
          ),
        id: {
          bullet: WRITER_COMMAND_IDS.unorderedList,
          none: WRITER_COMMAND_IDS.removeBullets,
          numbered: WRITER_COMMAND_IDS.orderedList,
        }[kind],
        /** Compares the active list kind with this command. @returns Checked state. */
        isChecked: (): boolean => active().list.kind === kind,
      }),
    ),
  ]);
}

/** Creates SwView-owned lifecycle, browser-adapter, and chrome commands. @param target - Persistent Writer view. @returns Validated immutable descriptors. */
export function createWriterViewCommandRegistry(
  target: WriterViewCommandTarget,
): CommandRegistry<WriterViewCommandTarget> {
  const lifecycleEnabled =
    /** Reads lifecycle command availability. @returns True outside a pending medium operation. */ (): boolean =>
      !target.IsStoragePending();
  return createWriterCommandRegistry([
    {
      capabilityId: "CAP-0114",
      /** Creates a new document in the persistent shell. @returns Nothing. */
      execute: (): void => target.NewDocument(),
      id: WRITER_COMMAND_IDS.newDocument,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0113",
      /** Opens an ODT through the view medium adapter. @returns Completion after selection and import. */
      execute: (): Promise<void> => target.OpenOdt(),
      id: WRITER_COMMAND_IDS.openOdt,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0113",
      /** Starts an ODT Save As operation. @returns Completion after worker export. */
      execute: (): Promise<void> => target.SaveOdt(),
      id: WRITER_COMMAND_IDS.saveOdt,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0114",
      /** Opens the browser-local primary medium. @returns Completion after lookup. */
      execute: (): Promise<void> => target.LoadLocal(),
      id: WRITER_COMMAND_IDS.openLocal,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0114",
      /** Saves to the browser-local primary medium. @returns Completion after acknowledgement. */
      execute: (): Promise<void> => target.SaveLocal(),
      id: WRITER_COMMAND_IDS.saveLocal,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0101",
      /** Starts plain-text export. @returns Nothing. */
      execute: (): Promise<void> => target.ExportText(),
      id: WRITER_COMMAND_IDS.exportText,
    },
    {
      capabilityId: "CAP-0106",
      /** Copies DOM-adapted selection data. @param _context - Bound view context. @param arguments_ - Selection arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> =>
        target.Copy(getWriterCommandArguments<unknown>(arguments_)),
      id: WRITER_COMMAND_IDS.copy,
    },
    {
      capabilityId: "CAP-0110",
      /** Cuts DOM-adapted selection data. @param _context - Bound view context. @param arguments_ - Cut arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> =>
        target.Cut(getWriterCommandArguments<unknown>(arguments_)),
      id: WRITER_COMMAND_IDS.cut,
    },
    {
      capabilityId: "CAP-0110",
      /** Pastes DOM-adapted clipboard data. @param _context - Bound view context. @param arguments_ - Paste arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> =>
        target.Paste(getWriterCommandArguments<unknown>(arguments_)),
      id: WRITER_COMMAND_IDS.paste,
    },
    {
      capabilityId: "CAP-0103",
      /** Requests browser Select All projection. @returns Nothing. */
      execute: (): void => target.RequestSelectAll(),
      id: WRITER_COMMAND_IDS.selectAll,
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles status-bar visibility. @returns Nothing. */
      execute: (): void => target.ToggleStatusBar(),
      id: WRITER_COMMAND_IDS.toggleStatusBar,
      /** Reads status-bar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsStatusBarVisible(),
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles horizontal-ruler visibility. @returns Nothing. */
      execute: (): void => target.ToggleHorizontalRuler(),
      id: WRITER_COMMAND_IDS.toggleHorizontalRuler,
      /** Reads horizontal-ruler visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsHorizontalRulerVisible(),
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles sidebar visibility. @returns Nothing. */
      execute: (): void => target.ToggleSidebar(),
      id: WRITER_COMMAND_IDS.toggleSidebar,
      /** Reads sidebar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsSidebarVisible(),
    },
  ]);
}
