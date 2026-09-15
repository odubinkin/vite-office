/** @fileoverview Renders the pinned standard toolbar subset from declarative command placements. */
import {
  ClipboardPaste,
  Copy,
  FolderOpen,
  Link,
  Redo2,
  Save,
  Scissors,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerStandardBarItems } from "../../uiconfig/swriter/toolbar/standardbar";
import type { WriterCommandSurfaceProps } from "./command-source";

const icons = new Map<string, LucideIcon>([
  [WRITER_COMMAND_IDS.openOdt, FolderOpen],
  [WRITER_COMMAND_IDS.saveOdt, Save],
  [WRITER_COMMAND_IDS.cut, Scissors],
  [WRITER_COMMAND_IDS.copy, Copy],
  [WRITER_COMMAND_IDS.paste, ClipboardPaste],
  [WRITER_COMMAND_IDS.undo, Undo2],
  [WRITER_COMMAND_IDS.redo, Redo2],
  [WRITER_COMMAND_IDS.hyperlinkDialog, Link],
]);

/** Renders a standard toolbar from descriptor-backed resource items. @param props - Shared command surface. @returns Toolbar item fragment. */
export function WriterCommandToolbar({
  commandSource,
  resolveArguments,
}: WriterCommandSurfaceProps): React.JSX.Element {
  return (
    <>
      {writerStandardBarItems.map(
        /** Renders one standard-toolbar resource item. @param item - Resource item. @param index - Stable resource index. @returns Toolbar control or separator. */ (
          item,
          index,
        ) => {
          if (item.kind === "separator")
            return (
              <span
                aria-hidden="true"
                className="mx-1 h-6 border-l border-slate-200"
                key={`separator-${index}`}
              />
            );
          /* v8 ignore next -- The pinned standard resource contains only commands and separators. */
          if (item.kind !== "command") return null;
          const command = commandSource.QueryCommand(item.commandId);
          /* v8 ignore next -- Resource/registry consistency is validated before presentation. */
          if (command === undefined) return null;
          const state = commandSource.QueryState(item.commandId);
          const Icon = icons.get(item.commandId) as LucideIcon;
          return (
            <button
              aria-label={command.label}
              className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!state.enabled}
              key={item.commandId}
              onClick={
                /** Dispatches this toolbar command. @returns Command result discarded by React. */ () =>
                  commandSource.Execute(item.commandId, resolveArguments(item.commandId))
              }
              title={command.label}
              type="button"
            >
              <Icon aria-hidden="true" size={18} />
            </button>
          );
        },
      )}
    </>
  );
}
