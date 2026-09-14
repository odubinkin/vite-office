/** @fileoverview Renders Writer text and numbering toolbar resources through shared command descriptors. */
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  IndentIncrease,
  List,
  ListOrdered,
  Outdent,
  type LucideIcon,
} from "lucide-react";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerNumObjectBarItems } from "../../uiconfig/swriter/toolbar/numobjectbar";
import { writerTextObjectBarItems } from "../../uiconfig/swriter/toolbar/textobjectbar";
import type { WriterToolbarItemPlacement } from "../../uiconfig/swriter/ui-resource";
import type { WriterCommandSurfaceProps } from "./command-source";

const icons = new Map<string, LucideIcon>([
  [WRITER_COMMAND_IDS.alignLeft, AlignLeft],
  [WRITER_COMMAND_IDS.alignCenter, AlignCenter],
  [WRITER_COMMAND_IDS.alignRight, AlignRight],
  [WRITER_COMMAND_IDS.alignJustify, AlignJustify],
  [WRITER_COMMAND_IDS.unorderedList, List],
  [WRITER_COMMAND_IDS.orderedList, ListOrdered],
  [WRITER_COMMAND_IDS.demote, IndentIncrease],
  [WRITER_COMMAND_IDS.promote, Outdent],
]);

/** Renders text and numbering toolbar resources. @param props - Shared command surface. @returns Toolbar item fragment. */
export function WriterFormattingToolbar({
  commandSource,
  resolveArguments,
}: WriterCommandSurfaceProps): React.JSX.Element {
  const items = [...writerTextObjectBarItems, ...writerNumObjectBarItems];
  return (
    <>
      {items.map(
        /** Projects one declarative item. @param item - Resource item. @param index - Stable resource index. @returns Rendered toolbar item. */ (
          item,
          index,
        ) => renderToolbarItem(item, index, commandSource, resolveArguments),
      )}
    </>
  );
}

/** Renders one declarative toolbar item. @param item - Resource item. @param index - Stable resource index. @param commandSource - Descriptor/state source. @param resolveArguments - Browser argument adapter. @returns Rendered item. */
function renderToolbarItem(
  item: WriterToolbarItemPlacement,
  index: number,
  commandSource: WriterCommandSurfaceProps["commandSource"],
  resolveArguments: WriterCommandSurfaceProps["resolveArguments"],
): React.ReactNode {
  if (item.kind === "separator")
    return (
      <span
        aria-hidden="true"
        className="h-6 border-l border-slate-300"
        key={`separator-${index}`}
      />
    );
  if (item.kind === "unavailable-control")
    return (
      <label className="contents" key={item.label}>
        <span className="sr-only">{item.label}</span>
        <select
          aria-label={item.label}
          className="h-8 min-w-36 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-600"
          disabled
          value={item.value}
        >
          <option>{item.value}</option>
        </select>
      </label>
    );
  if (item.kind === "command-select") {
    const selectedCommandId = item.options.find(
      /** Finds the active radio-style command. @param id - Candidate command identity. @returns Whether the command is checked. */ (
        id,
      ) => commandSource.QueryState(id).checked === true,
    ) as string;
    const selected = commandSource.QueryCommand(selectedCommandId)?.presentation
      ?.selectionValue as string;
    return (
      <label className="contents" key={item.label}>
        <span className="sr-only">{item.label}</span>
        <select
          aria-label={item.label}
          className="h-8 min-w-44 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
          onChange={
            /** Dispatches the command represented by a selected value. @param event - Native select change. @returns Nothing. */ (
              event,
            ) => {
              const id = item.options.find(
                /** Finds the command descriptor matching the selected value. @param candidate - Candidate command identity. @returns Whether its selection value matches. */ (
                  candidate,
                ) =>
                  commandSource.QueryCommand(candidate)?.presentation?.selectionValue ===
                  event.target.value,
              );
              /* v8 ignore next -- Native select values are constrained to rendered options. */
              if (id !== undefined) commandSource.Execute(id, resolveArguments(id));
            }
          }
          value={selected}
        >
          {item.options.map(
            /** Renders one command-backed select option. @param id - Command identity. @returns Select option or null. */ (
              id,
            ) => {
              const command = commandSource.QueryCommand(id);
              /* v8 ignore next -- Resource/registry consistency is validated before presentation. */
              return command === undefined ? null : (
                <option key={id} value={command.presentation?.selectionValue ?? id}>
                  {command.label}
                </option>
              );
            },
          )}
        </select>
      </label>
    );
  }
  const command = commandSource.QueryCommand(item.commandId);
  /* v8 ignore next -- Resource/registry consistency is validated before presentation. */
  if (command === undefined) return null;
  const state = commandSource.QueryState(item.commandId);
  const Icon = icons.get(item.commandId);
  const shortLabel =
    item.commandId === WRITER_COMMAND_IDS.bold
      ? "B"
      : item.commandId === WRITER_COMMAND_IDS.italic
        ? "I"
        : item.commandId === WRITER_COMMAND_IDS.underline
          ? "U"
          : undefined;
  return (
    <button
      aria-label={command.label}
      aria-pressed={
        command.presentation?.semantics !== "action" ? state.checked === true : undefined
      }
      className={`grid size-8 place-items-center rounded-md border transition ${state.checked === true ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-800"} ${item.commandId === WRITER_COMMAND_IDS.bold ? "font-black" : item.commandId === WRITER_COMMAND_IDS.italic ? "font-serif italic" : item.commandId === WRITER_COMMAND_IDS.underline ? "underline" : ""}`}
      disabled={!state.enabled}
      key={item.commandId}
      onClick={
        /** Dispatches this toolbar command. @returns Command result discarded by React. */ () =>
          commandSource.Execute(item.commandId, resolveArguments(item.commandId))
      }
      title={command.label}
      type="button"
    >
      {Icon === undefined ? (shortLabel as string) : <Icon aria-hidden="true" size={17} />}
    </button>
  );
}
