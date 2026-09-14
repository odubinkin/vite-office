/**
 * @fileoverview Declares Writer slot-like command descriptors and state handlers following
 * the pinned SfxShell/SfxDispatcher execution boundary.
 */

import {
  createCommandRegistry,
  type CommandPresentation,
  type CommandRegistry,
} from "../../../../framework/source/dispatch/dispatchprovider";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import type { WriterCharacterFormat } from "../../core/doc/writer";
import type { WriterParagraphTextRange } from "../wrtsh/wrtsh";
import {
  WRITER_COMMAND_IDS,
  writerMenuPlacements,
} from "../../../uiconfig/swriter/menubar/menubar-commands";
import { writerNumObjectBarItems } from "../../../uiconfig/swriter/toolbar/numobjectbar";
import { writerStandardBarItems } from "../../../uiconfig/swriter/toolbar/standardbar";
import { writerTextObjectBarItems } from "../../../uiconfig/swriter/toolbar/textobjectbar";
import type {
  WriterMenuItemPlacement,
  WriterToolbarItemPlacement,
} from "../../../uiconfig/swriter/ui-resource";

/** Arguments supplied by the DOM selection adapter to a character-format command. */
export interface WriterCharacterCommandArguments {
  /** Same-paragraph model range, omitted for pending collapsed-caret formatting. */
  readonly range?: WriterParagraphTextRange;
}

/** Persistent Writer editing-shell surface used by command descriptors. */
export interface WriterTextCommandTarget {
  readonly CanRedo: () => boolean;
  readonly CanUndo: () => boolean;
  readonly ChangeParagraphListLevel: (command: "demote" | "promote") => boolean;
  readonly GetActiveParagraph: () => Readonly<{
    alignment: "center" | "justify" | "left" | "right";
    list: Readonly<{ kind: "bullet" | "none" | "numbered"; level: number }>;
    style: "default" | "heading-1";
  }>;
  readonly GetCharacterFormatState: (format: WriterCharacterFormat) => "mixed" | "off" | "on";
  readonly GetPendingCharacterAttributes: () => Readonly<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
  }>;
  readonly Redo: () => boolean;
  readonly SetParagraphAlignment: (alignment: "center" | "justify" | "left" | "right") => boolean;
  readonly SetParagraphListKind: (kind: "bullet" | "none" | "numbered") => boolean;
  readonly SetParagraphStyle: (style: "default" | "heading-1") => boolean;
  readonly ToggleCharacterFormat: (
    format: WriterCharacterFormat,
    range?: WriterParagraphTextRange,
  ) => boolean;
  readonly Undo: () => boolean;
}

/** View-shell surface used by lifecycle, clipboard, and chrome command descriptors. */
export interface WriterViewCommandTarget {
  readonly Copy: (arguments_?: unknown) => Promise<void>;
  readonly Cut: (arguments_?: unknown) => Promise<void>;
  readonly ExportText: () => void;
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

/** Creates the active SwWrtShell command registry. @param target - Persistent Writer editing shell. @returns Validated immutable descriptors. */
export function createWriterTextCommandRegistry(
  target: WriterTextCommandTarget,
): CommandRegistry<WriterTextCommandTarget> {
  const active =
    /** Reads the currently targeted paragraph. @returns Active paragraph projection. */ (): ReturnType<
      WriterTextCommandTarget["GetActiveParagraph"]
    > => target.GetActiveParagraph();
  const characterCommand =
    /** Creates one direct-character command descriptor. @param id - Stable ID. @param label - Accessible label. @param format - Character attribute. @param shortcuts - Platform shortcuts. @returns Command descriptor. */
    (id: string, label: string, format: WriterCharacterFormat, shortcuts: readonly string[]) => ({
      capabilityId: "CAP-0109" as const,
      /** Toggles direct formatting through the editing shell. @param _context - Bound shell context. @param arguments_ - Optional selection range. @returns Whether content changed. */
      execute: (_context: WriterTextCommandTarget, arguments_: unknown): boolean =>
        target.ToggleCharacterFormat(
          format,
          (arguments_ as WriterCharacterCommandArguments | undefined)?.range,
        ),
      id,
      invalidates: ["document", "history", "selection"],
      /** Reads the selection-aware toggle value. @returns Current checked state. */
      isChecked: (): boolean => target.GetCharacterFormatState(format) === "on",
      /** Reports a mixed direct-format selection. @returns True when selected text has both values. */
      isMixed: (): boolean => target.GetCharacterFormatState(format) === "mixed",
      label,
      presentation: createWriterCommandPresentation(id, "boolean", "check", true),
      shortcuts,
      target: "shell" as const,
      undoPolicy: "record" as const,
    });
  return createCommandRegistry([
    {
      capabilityId: "CAP-0102",
      /** Restores the previous history state. @returns Whether navigation occurred. */
      execute: (): boolean => target.Undo(),
      id: WRITER_COMMAND_IDS.undo,
      invalidates: ["document", "history", "selection"],
      /** Reads Undo availability. @returns Whether Undo is enabled. */
      isEnabled: (): boolean => target.CanUndo(),
      label: "Undo",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.undo),
      shortcuts: ["Ctrl+Z", "Meta+Z"],
      target: "shell",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0102",
      /** Restores the following history state. @returns Whether navigation occurred. */
      execute: (): boolean => target.Redo(),
      id: WRITER_COMMAND_IDS.redo,
      invalidates: ["document", "history", "selection"],
      /** Reads Redo availability. @returns Whether Redo is enabled. */
      isEnabled: (): boolean => target.CanRedo(),
      label: "Redo",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.redo),
      shortcuts: ["Ctrl+Shift+Z", "Meta+Shift+Z"],
      target: "shell",
      undoPolicy: "none",
    },
    characterCommand(WRITER_COMMAND_IDS.bold, "Bold", "bold", ["Ctrl+B", "Meta+B"]),
    characterCommand(WRITER_COMMAND_IDS.italic, "Italic", "italic", ["Ctrl+I", "Meta+I"]),
    characterCommand(WRITER_COMMAND_IDS.underline, "Underline", "underline", ["Ctrl+U", "Meta+U"]),
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
        invalidates: ["document", "history", "selection"],
        /** Compares the active alignment with this command. @returns Checked state. */
        isChecked: (): boolean => active().alignment === alignment,
        label: {
          center: "Align center",
          justify: "Justify paragraph",
          left: "Align left",
          right: "Align right",
        }[alignment],
        presentation: createWriterCommandPresentation(
          {
            center: WRITER_COMMAND_IDS.alignCenter,
            justify: WRITER_COMMAND_IDS.alignJustify,
            left: WRITER_COMMAND_IDS.alignLeft,
            right: WRITER_COMMAND_IDS.alignRight,
          }[alignment],
          "boolean",
          "radio",
        ),
        target: "shell" as const,
        undoPolicy: "record" as const,
      }),
    ),
    ...(["default", "heading-1"] as const).map(
      /** Creates one paragraph-style descriptor. @param style - Supported style. @returns Command descriptor. */
      (style) => ({
        capabilityId: "CAP-0112" as const,
        /** Applies the captured style. @returns Whether content changed. */
        execute: (): boolean => target.SetParagraphStyle(style),
        /** Reads the active paragraph style value. @returns Stable style ID. */
        getStateValue: (): string => active().style,
        id:
          style === "default"
            ? WRITER_COMMAND_IDS.defaultParagraphStyle
            : WRITER_COMMAND_IDS.headingOne,
        invalidates: ["document", "history", "selection"],
        /** Compares the active style with this command. @returns Checked state. */
        isChecked: (): boolean => active().style === style,
        label: style === "default" ? "Default Paragraph Style" : "Heading 1",
        presentation: createWriterCommandPresentation(
          style === "default"
            ? WRITER_COMMAND_IDS.defaultParagraphStyle
            : WRITER_COMMAND_IDS.headingOne,
          "value",
          "radio",
          false,
          style,
        ),
        target: "shell" as const,
        undoPolicy: "record" as const,
      }),
    ),
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
        invalidates: ["document", "history", "selection"],
        /** Compares the active list kind with this command. @returns Checked state. */
        isChecked: (): boolean => active().list.kind === kind,
        label: {
          bullet: "Unordered List",
          none: "Remove Bullets",
          numbered: "Ordered List",
        }[kind],
        presentation: createWriterCommandPresentation(
          {
            bullet: WRITER_COMMAND_IDS.unorderedList,
            none: WRITER_COMMAND_IDS.removeBullets,
            numbered: WRITER_COMMAND_IDS.orderedList,
          }[kind],
          "boolean",
          "radio",
        ),
        target: "shell" as const,
        undoPolicy: "record" as const,
      }),
    ),
    {
      capabilityId: "CAP-0107",
      /** Demotes the active list paragraph. @returns Whether content changed. */
      execute: (): boolean => target.ChangeParagraphListLevel("demote"),
      id: WRITER_COMMAND_IDS.demote,
      invalidates: ["document", "history", "selection"],
      /** Reads whether another demotion is valid. @returns Enabled state. */
      isEnabled: (): boolean =>
        active().list.kind !== "none" && active().list.level < WRITER_MAX_LIST_LEVEL,
      label: "Demote",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.demote),
      target: "shell",
      undoPolicy: "record",
    },
    {
      capabilityId: "CAP-0107",
      /** Promotes the active list paragraph. @returns Whether content changed. */
      execute: (): boolean => target.ChangeParagraphListLevel("promote"),
      id: WRITER_COMMAND_IDS.promote,
      invalidates: ["document", "history", "selection"],
      /** Reads whether another promotion is valid. @returns Enabled state. */
      isEnabled: (): boolean => active().list.kind !== "none" && active().list.level > 0,
      label: "Promote",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.promote),
      target: "shell",
      undoPolicy: "record",
    },
  ]);
}

/** Creates SwView-owned lifecycle, browser-adapter, and chrome commands. @param target - Persistent Writer view. @returns Validated immutable descriptors. */
export function createWriterViewCommandRegistry(
  target: WriterViewCommandTarget,
): CommandRegistry<WriterViewCommandTarget> {
  const lifecycleEnabled =
    /** Reads lifecycle command availability. @returns True outside a pending medium operation. */ (): boolean =>
      !target.IsStoragePending();
  return createCommandRegistry([
    {
      capabilityId: "CAP-0114",
      /** Creates a new document in the persistent shell. @returns Nothing. */
      execute: (): void => target.NewDocument(),
      id: WRITER_COMMAND_IDS.newDocument,
      invalidates: ["document", "history", "lifecycle", "selection"],
      isEnabled: lifecycleEnabled,
      label: "New",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.newDocument),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0113",
      /** Opens an ODT through the view medium adapter. @returns Completion after selection and import. */
      execute: (): Promise<void> => target.OpenOdt(),
      id: WRITER_COMMAND_IDS.openOdt,
      invalidates: ["document", "history", "lifecycle", "selection"],
      isEnabled: lifecycleEnabled,
      label: "Open ODT",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.openOdt),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0113",
      /** Starts an ODT Save As operation. @returns Completion after worker export. */
      execute: (): Promise<void> => target.SaveOdt(),
      id: WRITER_COMMAND_IDS.saveOdt,
      invalidates: ["lifecycle"],
      isEnabled: lifecycleEnabled,
      label: "Save as ODT",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.saveOdt),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0114",
      /** Opens the browser-local primary medium. @returns Completion after lookup. */
      execute: (): Promise<void> => target.LoadLocal(),
      id: WRITER_COMMAND_IDS.openLocal,
      invalidates: ["document", "history", "lifecycle", "selection"],
      isEnabled: lifecycleEnabled,
      label: "Open local copy",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.openLocal),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0114",
      /** Saves to the browser-local primary medium. @returns Completion after acknowledgement. */
      execute: (): Promise<void> => target.SaveLocal(),
      id: WRITER_COMMAND_IDS.saveLocal,
      invalidates: ["document", "lifecycle"],
      isEnabled: lifecycleEnabled,
      label: "Save local copy",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.saveLocal),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0101",
      /** Starts plain-text export. @returns Nothing. */
      execute: (): void => target.ExportText(),
      id: WRITER_COMMAND_IDS.exportText,
      invalidates: ["lifecycle"],
      label: "Save as text",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.exportText),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0106",
      /** Copies DOM-adapted selection data. @param _context - Bound view context. @param arguments_ - Selection arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> => target.Copy(arguments_),
      id: WRITER_COMMAND_IDS.copy,
      invalidates: ["lifecycle"],
      label: "Copy",
      presentation: createWriterCommandPresentation(
        WRITER_COMMAND_IDS.copy,
        "none",
        "action",
        true,
      ),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0110",
      /** Cuts DOM-adapted selection data. @param _context - Bound view context. @param arguments_ - Cut arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> => target.Cut(arguments_),
      id: WRITER_COMMAND_IDS.cut,
      invalidates: ["document", "history", "selection", "lifecycle"],
      label: "Cut",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.cut, "none", "action", true),
      target: "view",
      undoPolicy: "record",
    },
    {
      capabilityId: "CAP-0110",
      /** Pastes DOM-adapted clipboard data. @param _context - Bound view context. @param arguments_ - Paste arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> => target.Paste(arguments_),
      id: WRITER_COMMAND_IDS.paste,
      invalidates: ["document", "history", "selection", "lifecycle"],
      label: "Paste",
      presentation: createWriterCommandPresentation(
        WRITER_COMMAND_IDS.paste,
        "none",
        "action",
        true,
      ),
      target: "view",
      undoPolicy: "record",
    },
    {
      capabilityId: "CAP-0103",
      /** Requests browser Select All projection. @returns Nothing. */
      execute: (): void => target.RequestSelectAll(),
      id: WRITER_COMMAND_IDS.selectAll,
      invalidates: ["selection"],
      label: "Select All",
      presentation: createWriterCommandPresentation(WRITER_COMMAND_IDS.selectAll),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles status-bar visibility. @returns Nothing. */
      execute: (): void => target.ToggleStatusBar(),
      id: WRITER_COMMAND_IDS.toggleStatusBar,
      invalidates: ["view"],
      /** Reads status-bar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsStatusBarVisible(),
      label: "Status Bar",
      presentation: createWriterCommandPresentation(
        WRITER_COMMAND_IDS.toggleStatusBar,
        "boolean",
        "check",
      ),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles horizontal-ruler visibility. @returns Nothing. */
      execute: (): void => target.ToggleHorizontalRuler(),
      id: WRITER_COMMAND_IDS.toggleHorizontalRuler,
      invalidates: ["view"],
      /** Reads horizontal-ruler visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsHorizontalRulerVisible(),
      label: "Horizontal ruler",
      presentation: createWriterCommandPresentation(
        WRITER_COMMAND_IDS.toggleHorizontalRuler,
        "boolean",
        "check",
      ),
      target: "view",
      undoPolicy: "none",
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles sidebar visibility. @returns Nothing. */
      execute: (): void => target.ToggleSidebar(),
      id: WRITER_COMMAND_IDS.toggleSidebar,
      invalidates: ["view"],
      /** Reads sidebar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsSidebarVisible(),
      label: "Sidebar",
      presentation: createWriterCommandPresentation(
        WRITER_COMMAND_IDS.toggleSidebar,
        "boolean",
        "check",
      ),
      target: "view",
      undoPolicy: "none",
    },
  ]);
}

/** Builds one descriptor's presentation contract from upstream-derived resource placements. @param commandId - Stable Writer command identity. @param stateType - Published state shape. @param semantics - Interaction semantics. @param acceptsArguments - Whether browser adapters may supply arguments. @param selectionValue - Optional select-control value. @returns Complete presentation contract. */
function createWriterCommandPresentation(
  commandId: string,
  stateType: CommandPresentation["stateType"] = "none",
  semantics: CommandPresentation["semantics"] = "action",
  acceptsArguments = false,
  selectionValue?: string,
): CommandPresentation {
  return {
    ...(acceptsArguments
      ? { argumentSchema: { description: "Browser adapter arguments for the active selection." } }
      : {}),
    labelKey: `commands.${commandId}`,
    placements: getWriterCommandPlacements(commandId),
    ...(selectionValue === undefined ? {} : { selectionValue }),
    semantics,
    stateType,
  };
}

/** Resolves all menu and toolbar resources that reference one command identity. @param commandId - Stable Writer command identity. @returns Referencing resource paths. */
function getWriterCommandPlacements(commandId: string): string[] {
  const placements: string[] = [];
  /** Recursively checks a menu resource. @param items - Menu resource items. @returns Whether an item references the command. */
  function containsMenuCommand(items: readonly WriterMenuItemPlacement[]): boolean {
    return items.some(
      /** Checks one recursive resource item. @param item - Menu item candidate. @returns Whether the item references the command. */ (
        item,
      ) =>
        item.kind === "command"
          ? item.commandId === commandId
          : item.kind === "submenu" && containsMenuCommand(item.items),
    );
  }
  for (const menu of writerMenuPlacements)
    if (containsMenuCommand(menu.items)) placements.push(`menubar/${menu.id}`);
  const toolbars: readonly (readonly [string, readonly WriterToolbarItemPlacement[]])[] = [
    ["toolbar/standardbar", writerStandardBarItems],
    ["toolbar/textobjectbar", writerTextObjectBarItems],
    ["toolbar/numobjectbar", writerNumObjectBarItems],
  ];
  for (const [resource, items] of toolbars)
    if (
      items.some(
        /** Checks one toolbar resource item. @param item - Toolbar item candidate. @returns Whether the item references the command. */ (
          item,
        ) =>
          item.kind === "command"
            ? item.commandId === commandId
            : item.kind === "command-select" && item.options.includes(commandId),
      )
    )
      placements.push(resource);
  return placements;
}
