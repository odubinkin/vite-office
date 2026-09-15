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
import { useEffect, useState } from "react";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../vcl/browser/font-list";
import { WRITER_PARAGRAPH_STYLE_POOL } from "../../inc/poolfmt";
import { getWriterParagraphStyleCommandId } from "../../uiconfig/swriter/menubar/menubar-commands";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerNumObjectBarItems } from "../../uiconfig/swriter/toolbar/numobjectbar";
import { writerTextObjectBarItems } from "../../uiconfig/swriter/toolbar/textobjectbar";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import type { WriterToolbarItemPlacement } from "../../uiconfig/swriter/ui-resource";
import type { WriterCommandSurfaceProps } from "./command-surface";

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
  if (item.kind === "font-select")
    return (
      <FontNameSelect
        commandId={item.commandId}
        commandSource={commandSource}
        key={item.commandId}
        label={item.label}
        resolveArguments={resolveArguments}
      />
    );
  if (item.kind === "command-select") {
    const selectedCommandId = item.options.find(
      /** Finds the active radio-style command. @param id - Candidate command identity. @returns Whether the command is checked. */ (
        id,
      ) => commandSource.QueryState(id).checked === true,
    ) as string;
    const selected = getWriterCommandResource(selectedCommandId).selectionValue as string;
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
                ) => getWriterCommandResource(candidate).selectionValue === event.target.value,
              );
              /* v8 ignore next -- Native select values are constrained to rendered options. */
              if (id !== undefined) commandSource.Execute(id, resolveArguments(id));
            }
          }
          value={selected}
        >
          {renderParagraphStyleOptions()}
        </select>
      </label>
    );
  }
  const command = commandSource.QueryCommand(item.commandId);
  /* v8 ignore next -- Resource/registry consistency is validated before presentation. */
  if (command === undefined) return null;
  const state = commandSource.QueryState(item.commandId);
  const resource = getWriterCommandResource(item.commandId);
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
      aria-label={resource.label}
      aria-pressed={resource.semantics !== "action" ? state.checked === true : undefined}
      className={`grid size-8 place-items-center rounded-md border transition ${state.checked === true ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-800"} ${item.commandId === WRITER_COMMAND_IDS.bold ? "font-black" : item.commandId === WRITER_COMMAND_IDS.italic ? "font-serif italic" : item.commandId === WRITER_COMMAND_IDS.underline ? "underline" : ""}`}
      disabled={!state.enabled}
      key={item.commandId}
      onClick={
        /** Dispatches this toolbar command. @returns Command result discarded by React. */ () =>
          commandSource.Execute(item.commandId, resolveArguments(item.commandId))
      }
      title={resource.label}
      type="button"
    >
      {Icon === undefined ? (shortLabel as string) : <Icon aria-hidden="true" size={17} />}
    </button>
  );
}

/** Renders upstream pool ranges with hierarchy. @param commandSource - Command lookup. @returns Options. */
function renderParagraphStyleOptions(): React.ReactNode {
  const labels = {
    text: "Text styles",
    lists: "List styles",
    extra: "Special styles",
    index: "Index styles",
    document: "Chapter and document",
    html: "HTML styles",
  } as const;
  return Object.entries(labels).map(
    /** Renders one group. @param entry - Group and label. @returns Option group. */ ([
      group,
      label,
    ]) => (
      <optgroup key={group} label={label}>
        {WRITER_PARAGRAPH_STYLE_POOL.filter(
          /** Selects group styles. @param style - Candidate. @returns Whether included. */ (
            style,
          ) => style.group === group,
        ).map(
          /** Renders one style. @param style - Pool style. @returns Option. */ (style) => {
            let depth = 0;
            let parentId = style.parentId;
            while (parentId !== undefined && depth < 8) {
              depth += 1;
              parentId = WRITER_PARAGRAPH_STYLE_POOL.find(
                /** Finds the current parent. @param candidate - Candidate. @returns Whether matching. */ (
                  candidate,
                ) => candidate.id === parentId,
              )?.parentId;
            }
            const id = getWriterParagraphStyleCommandId(style.id);
            const resource = getWriterCommandResource(id);
            return (
              <option key={id} value={resource.selectionValue}>
                {`${"\u00a0\u00a0".repeat(depth)}${resource.label}`}
              </option>
            );
          },
        )}
      </optgroup>
    ),
  );
}

/** Device-backed font selector. @param props - Command surface properties. @returns Selector. */
function FontNameSelect({
  commandId,
  commandSource,
  label,
  resolveArguments,
}: {
  readonly commandId: string;
  readonly commandSource: WriterCommandSurfaceProps["commandSource"];
  readonly label: string;
  readonly resolveArguments: WriterCommandSurfaceProps["resolveArguments"];
}): React.JSX.Element {
  const [fonts, setFonts] = useState<readonly string[]>(FALLBACK_FONT_FAMILIES);
  const selected = String(commandSource.QueryState(commandId).value);
  useEffect(
    /** Loads device fonts after mount. @returns Cleanup. */ () => {
      let active = true;
      void FontList.FromBrowser().then(
        /** Publishes the font list. @param fontList - Loaded fonts. @returns Nothing. */ (
          fontList,
        ) => {
          if (active) setFonts(fontList.GetFontNames());
        },
      );
      return /** Prevents stale publication. @returns Nothing. */ () => {
        active = false;
      };
    },
    [],
  );
  /* v8 ignore next -- Imported fonts outside the device list are retained for round-trip fidelity. */
  const options = fonts.includes(selected) ? fonts : [selected, ...fonts];
  return (
    <label className="contents">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="h-8 min-w-40 max-w-52 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onChange={
          /** Applies the selected font. @param event - Select change. @returns Nothing. */ (
            event,
          ) => {
            const base = resolveArguments(commandId);
            commandSource.Execute(commandId, {
              /* v8 ignore next -- The Writer view always resolves font arguments to a cursor object. */
              ...(typeof base === "object" && base !== null ? base : {}),
              fontFamily: event.target.value,
            });
          }
        }
        style={{ fontFamily: selected }}
        value={selected}
      >
        {options.map(
          /** Renders one font family. @param font - Family. @returns Option. */ (font) => (
            <option key={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
