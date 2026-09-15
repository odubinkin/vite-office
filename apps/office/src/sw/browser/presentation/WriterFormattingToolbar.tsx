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
} from "lucide-react";
import { useEffect, useState } from "react";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../vcl/browser/font-list";
import {
  CommandToolbarItems,
  type CommandIcon,
} from "../../../framework/browser/presentation/CommandToolbar";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import type { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WRITER_PARAGRAPH_STYLE_POOL } from "../../inc/poolfmt";
import { getWriterParagraphStyleCommandId } from "../../uiconfig/swriter/menubar/menubar-commands";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerNumObjectBarItems } from "../../uiconfig/swriter/toolbar/numobjectbar";
import { writerTextObjectBarItems } from "../../uiconfig/swriter/toolbar/textobjectbar";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import type { WriterToolbarItemPlacement } from "../../uiconfig/swriter/ui-resource";

const icons = new Map<string, CommandIcon>([
  [WRITER_COMMAND_IDS.alignLeft, AlignLeft],
  [WRITER_COMMAND_IDS.alignCenter, AlignCenter],
  [WRITER_COMMAND_IDS.alignRight, AlignRight],
  [WRITER_COMMAND_IDS.alignJustify, AlignJustify],
  [WRITER_COMMAND_IDS.unorderedList, List],
  [WRITER_COMMAND_IDS.orderedList, ListOrdered],
  [WRITER_COMMAND_IDS.demote, IndentIncrease],
  [WRITER_COMMAND_IDS.promote, Outdent],
]);

/** Inputs selecting the active upstream object bar. */
export interface WriterFormattingToolbarProps extends BrowserCommandSurfaceProps {
  readonly objectBar: "numbering" | "text";
}

/** Renders the active text or numbering object bar without merging their resources. @param props - Shared command surface and shell context. @returns Toolbar item fragment. */
export function WriterFormattingToolbar({
  commandSource,
  objectBar,
  resolveArguments,
}: WriterFormattingToolbarProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const items = objectBar === "numbering" ? writerNumObjectBarItems : writerTextObjectBarItems;
  const getCommandResource =
    /** Localizes one generated formatting resource. @param commandUrl - Command URL. @returns Localized resource. */ (
      commandUrl: string,
    ) => {
      const resource = getWriterCommandResource(commandUrl);
      return {
        ...resource,
        controlLabel: localization.GetText(
          `writer.command.${commandUrl}.control-label`,
          resource.controlLabel,
        ),
        label: localization.GetText(`writer.command.${commandUrl}.label`, resource.label),
      };
    };
  return (
    <CommandToolbarItems
      buttonClassName="grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:border-indigo-700 data-[active=true]:bg-indigo-700 data-[active=true]:text-white"
      commandSource={commandSource}
      getButtonContent={getWriterButtonContent}
      getCommandResource={getCommandResource}
      icons={icons}
      items={items}
      renderSpecialItem={
        /** Renders Writer selector placements. @param item - Generic special placement. @returns Writer selector. */ (
          item,
        ) =>
          renderSpecialToolbarItem(
            item as Extract<WriterToolbarItemPlacement, { kind: "command-select" | "font-select" }>,
            commandSource,
            getCommandResource,
            localization,
            resolveArguments,
          )
      }
      resolveArguments={resolveArguments}
    />
  );
}

/** Returns compact glyphs for text-format commands without changing command metadata. @param commandUrl - Canonical command URL. @returns Visible glyph or undefined for icon-backed commands. */
function getWriterButtonContent(commandUrl: string): React.ReactNode {
  if (commandUrl === WRITER_COMMAND_IDS.bold) return "B";
  if (commandUrl === WRITER_COMMAND_IDS.italic) return <span className="font-serif italic">I</span>;
  if (commandUrl === WRITER_COMMAND_IDS.underline) return <span className="underline">U</span>;
  return undefined;
}

/** Renders one non-button toolbar placement. @param placement - Generic resource item. @param commandSource - Descriptor/state source. @param getCommandResource - Generated command lookup. @param localization - Browser localization service. @param resolveArguments - Browser argument adapter. @returns Rendered special item. */
function renderSpecialToolbarItem(
  placement: Extract<WriterToolbarItemPlacement, { kind: "command-select" | "font-select" }>,
  commandSource: BrowserCommandSurfaceProps["commandSource"],
  getCommandResource: typeof getWriterCommandResource,
  localization: BrowserLocalizationService,
  resolveArguments: BrowserCommandSurfaceProps["resolveArguments"],
): React.ReactNode {
  const item = placement;
  if (item.kind === "font-select")
    return (
      <FontNameSelect
        commandId={item.commandId}
        commandSource={commandSource}
        key={item.commandId}
        label={localization.GetText(`writer.command.${item.commandId}.control-label`, item.label)}
        resolveArguments={resolveArguments}
      />
    );
  const selectedCommandId = item.options.find(
    /** Finds the active radio-style command. @param id - Candidate command identity. @returns Whether the command is checked. */ (
      id,
    ) => commandSource.QueryState(id).checked === true,
  ) as string;
  const selected = getCommandResource(selectedCommandId).selectionValue as string;
  const label = localization.GetText("writer.toolbar.paragraph-style", item.label);
  return (
    <label className="contents" key={item.label}>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="h-8 min-w-44 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onChange={
          /** Dispatches the command represented by a selected value. @param event - Native select change. @returns Nothing. */ (
            event,
          ) => {
            const id = item.options.find(
              /** Finds the command descriptor matching the selected value. @param candidate - Candidate command identity. @returns Whether its selection value matches. */ (
                candidate,
              ) => getCommandResource(candidate).selectionValue === event.target.value,
            );
            /* v8 ignore next -- Native select values are constrained to rendered options. */
            if (id !== undefined) commandSource.Execute(id, resolveArguments(id));
          }
        }
        value={selected}
      >
        {renderParagraphStyleOptions(getCommandResource, localization)}
      </select>
    </label>
  );
}

/** Renders upstream pool ranges with hierarchy. @param getCommandResource - Command resource lookup. @param localization - Browser localization service. @returns Options. */
function renderParagraphStyleOptions(
  getCommandResource: typeof getWriterCommandResource,
  localization: BrowserLocalizationService,
): React.ReactNode {
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
      <optgroup key={group} label={localization.GetText(`writer.style-group.${group}`, label)}>
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
            const resource = getCommandResource(id);
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
  readonly commandSource: BrowserCommandSurfaceProps["commandSource"];
  readonly label: string;
  readonly resolveArguments: BrowserCommandSurfaceProps["resolveArguments"];
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
