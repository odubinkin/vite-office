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
  type CommandToolbarPlacement,
  CommandToolbarItems,
  type CommandIcon,
} from "../../../framework/browser/presentation/CommandToolbar";
import {
  type BrowserCommandSurfaceProps,
  useBrowserCommandPresentation,
} from "../../../framework/browser/presentation/command-surface";
import type { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { getWriterParagraphStyleCommandId } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterParagraphStyleOption } from "./writer-view-projection";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerTextObjectBarItems } from "../../uiconfig/swriter/toolbar/textobjectbar";
import { WriterLineSpacingControl } from "./WriterLineSpacingControl";
import { selectWriterCommandResource } from "./writer-command-presentation";
import type { WriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import type { WriterToolbarItemPlacement } from "../../uiconfig/swriter/ui-resource";

const icons = new Map<string, CommandIcon>([
  [WRITER_COMMAND_IDS.alignLeft, AlignLeft],
  [WRITER_COMMAND_IDS.alignCenter, AlignCenter],
  [WRITER_COMMAND_IDS.alignRight, AlignRight],
  [WRITER_COMMAND_IDS.alignJustify, AlignJustify],
  [WRITER_COMMAND_IDS.unorderedList, List],
  [WRITER_COMMAND_IDS.orderedList, ListOrdered],
  [WRITER_COMMAND_IDS.increaseIndent, IndentIncrease],
  [WRITER_COMMAND_IDS.decreaseIndent, Outdent],
]);

/** Inputs shared by the complete Writer text formatting toolbar. */
export interface WriterFormattingToolbarProps extends BrowserCommandSurfaceProps {
  readonly paragraphStyleOptions: readonly WriterParagraphStyleOption[];
  readonly advancedControls?: React.ReactNode;
  readonly embeddedFontFamilies?: readonly string[];
  readonly fontAvailability?: Readonly<Record<string, boolean>>;
}

/** Renders the complete Writer text toolbar. Its generic indent commands select list-level or paragraph-margin behavior in the text shell. @param props - Shared command surface and shell context. @returns Toolbar item fragment. */
export function WriterFormattingToolbar({
  commandSource,
  paragraphStyleOptions,
  resolveArguments,
  advancedControls,
  embeddedFontFamilies = [],
  fontAvailability = {},
}: WriterFormattingToolbarProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const getCommandResource =
    /** Localizes one generated formatting resource. @param commandUrl - Command URL. @returns Localized resource. */ (
      commandUrl: string,
    ) => {
      return selectWriterCommandResource(localization, commandUrl);
    };
  const lineSpacingIndex = writerTextObjectBarItems.findIndex(
    /** Finds the upstream spacing position. @param item - Toolbar placement. @returns Match. */ (
      item,
    ) => item.kind === "command" && item.commandId === WRITER_COMMAND_IDS.lineSpacing,
  );
  const beforeLineSpacing = writerTextObjectBarItems.slice(0, lineSpacingIndex);
  const afterLineSpacing = writerTextObjectBarItems.slice(lineSpacingIndex + 1);
  const items =
    /** Renders one toolbar segment. @param placements - Segment placements. @returns Toolbar items. */ (
      placements: typeof writerTextObjectBarItems,
    ) => (
      <CommandToolbarItems
        buttonClassName="grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:border-indigo-700 data-[active=true]:bg-indigo-700 data-[active=true]:text-white"
        commandSource={commandSource}
        getButtonContent={getWriterButtonContent}
        getCommandResource={getCommandResource}
        icons={icons}
        items={placements}
        renderSpecialItem={
          /** Renders Writer selector placements. @param item - Generic special placement. @returns Writer selector. */ (
            item,
          ) => {
            /* v8 ignore next -- Generated Writer resources call this hook only for the two special placement kinds. */
            if (!isWriterSpecialToolbarPlacement(item)) return null;
            return renderSpecialToolbarItem(
              item,
              commandSource,
              getCommandResource,
              localization,
              paragraphStyleOptions,
              resolveArguments,
              embeddedFontFamilies,
              fontAvailability,
            );
          }
        }
        resolveArguments={resolveArguments}
      />
    );
  return (
    <>
      {items(beforeLineSpacing)}
      <WriterLineSpacingControl
        commandSource={commandSource}
        getCommandResource={getCommandResource}
      />
      {items(afterLineSpacing)}
      {advancedControls}
    </>
  );
}

/** Narrows a generic special toolbar placement to its generated Writer resource. @param item - Generic placement. @returns Whether Writer metadata is present. */
function isWriterSpecialToolbarPlacement(
  item: CommandToolbarPlacement,
): item is Extract<
  WriterToolbarItemPlacement,
  { kind: "command-select" | "font-select" | "font-size-select" }
> {
  return item.kind === "font-select" || item.kind === "font-size-select"
    ? "commandId" in item && "label" in item
    : item.kind === "command-select" && "label" in item && "options" in item;
}

/** Returns compact glyphs for text-format commands without changing command metadata. @param commandUrl - Canonical command URL. @returns Visible glyph or undefined for icon-backed commands. */
function getWriterButtonContent(commandUrl: string): React.ReactNode {
  if (commandUrl === WRITER_COMMAND_IDS.bold) return "B";
  if (commandUrl === WRITER_COMMAND_IDS.italic) return <span className="font-serif italic">I</span>;
  if (commandUrl === WRITER_COMMAND_IDS.underline) return <span className="underline">U</span>;
  return undefined;
}

/** Renders one non-button toolbar placement. @param placement - Generic resource item. @param commandSource - Descriptor/state source. @param getCommandResource - Generated command lookup. @param localization - Browser localization service. @param paragraphStyleOptions - Binding-backed style selector options. @param resolveArguments - Browser argument adapter. @param embeddedFontFamilies - Package font families. @param fontAvailability - Browser load status. @returns Rendered special item. */
function renderSpecialToolbarItem(
  placement: Extract<
    WriterToolbarItemPlacement,
    { kind: "command-select" | "font-select" | "font-size-select" }
  >,
  commandSource: BrowserCommandSurfaceProps["commandSource"],
  getCommandResource: (commandUrl: string) => WriterCommandResource,
  localization: BrowserLocalizationService,
  paragraphStyleOptions: readonly WriterParagraphStyleOption[],
  resolveArguments: BrowserCommandSurfaceProps["resolveArguments"],
  embeddedFontFamilies: readonly string[],
  fontAvailability: Readonly<Record<string, boolean>>,
): React.ReactNode {
  const item = placement;
  if (item.kind === "font-select")
    return (
      <FontNameSelect
        commandId={item.commandId}
        commandSource={commandSource}
        getCommandResource={getCommandResource}
        key={item.commandId}
        label={getCommandResource(item.commandId).controlLabel}
        resolveArguments={resolveArguments}
        embeddedFontFamilies={embeddedFontFamilies}
        fontAvailability={fontAvailability}
      />
    );
  if (item.kind === "font-size-select")
    return (
      <FontSizeSelect
        commandId={item.commandId}
        commandSource={commandSource}
        getCommandResource={getCommandResource}
        key={item.commandId}
        label={getCommandResource(item.commandId).controlLabel}
        resolveArguments={resolveArguments}
      />
    );
  return (
    <ParagraphStyleSelect
      commandSource={commandSource}
      getCommandResource={getCommandResource}
      item={item}
      key={item.label}
      localization={localization}
      paragraphStyleOptions={paragraphStyleOptions}
      resolveArguments={resolveArguments}
    />
  );
}

/** Binding-backed paragraph-style selector. @param props - Generated resource and command state inputs. @returns Style selector. */
function ParagraphStyleSelect({
  commandSource,
  getCommandResource,
  item,
  localization,
  paragraphStyleOptions,
  resolveArguments,
}: Readonly<{
  commandSource: BrowserCommandSurfaceProps["commandSource"];
  getCommandResource: (commandUrl: string) => WriterCommandResource;
  item: Extract<WriterToolbarItemPlacement, { kind: "command-select" }>;
  localization: BrowserLocalizationService;
  paragraphStyleOptions: readonly WriterParagraphStyleOption[];
  resolveArguments: BrowserCommandSurfaceProps["resolveArguments"];
}>): React.JSX.Element {
  const selected = String(
    useBrowserCommandPresentation(commandSource, WRITER_COMMAND_IDS.styleApply, getCommandResource)
      .selectedValue,
  );
  const label = getCommandResource(WRITER_COMMAND_IDS.styleApply).controlLabel;
  return (
    <label className="contents">
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
        {renderParagraphStyleOptions(getCommandResource, localization, paragraphStyleOptions)}
      </select>
    </label>
  );
}

/** Renders upstream pool ranges with hierarchy. @param getCommandResource - Command resource lookup. @param localization - Browser localization service. @param paragraphStyleOptions - Binding-backed style selector options. @returns Options. */
function renderParagraphStyleOptions(
  getCommandResource: (commandUrl: string) => WriterCommandResource,
  localization: BrowserLocalizationService,
  paragraphStyleOptions: readonly WriterParagraphStyleOption[],
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
        {paragraphStyleOptions
          .filter(
            /** Selects precomputed group styles. @param style - Candidate. @returns Whether included. */ (
              style,
            ) => style.group === group,
          )
          .map(
            /** Renders one style. @param style - Precomputed pool style. @returns Option. */ (
              style,
            ) => {
              const id = getWriterParagraphStyleCommandId(style.id);
              const resource = getCommandResource(id);
              return (
                <option key={id} value={resource.selectionValue}>
                  {`${"\u00a0\u00a0".repeat(style.depth)}${resource.label}`}
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
  getCommandResource,
  label,
  resolveArguments,
  embeddedFontFamilies,
  fontAvailability,
}: {
  readonly commandId: string;
  readonly commandSource: BrowserCommandSurfaceProps["commandSource"];
  readonly getCommandResource: (commandUrl: string) => WriterCommandResource;
  readonly label: string;
  readonly resolveArguments: BrowserCommandSurfaceProps["resolveArguments"];
  readonly embeddedFontFamilies: readonly string[];
  readonly fontAvailability: Readonly<Record<string, boolean>>;
}): React.JSX.Element {
  const [fonts, setFonts] = useState<readonly string[]>(FALLBACK_FONT_FAMILIES);
  const selected = String(
    useBrowserCommandPresentation(commandSource, commandId, getCommandResource).selectedValue,
  );
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
  const options = [...new Set([selected, ...embeddedFontFamilies, ...fonts])];
  const unavailable =
    embeddedFontFamilies.includes(selected) && fontAvailability[selected] === false;
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
      {unavailable ? (
        <span role="status" className="text-xs text-amber-700">
          Embedded font unavailable; using Liberation Serif fallback
        </span>
      ) : null}
    </label>
  );
}

const STANDARD_FONT_SIZES_PT = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72] as const;

/** Point-size selector backed by Writer command state. @param props - Command surface properties. @returns Selector. */
function FontSizeSelect({
  commandId,
  commandSource,
  getCommandResource,
  label,
  resolveArguments,
}: {
  readonly commandId: string;
  readonly commandSource: BrowserCommandSurfaceProps["commandSource"];
  readonly getCommandResource: (commandUrl: string) => WriterCommandResource;
  readonly label: string;
  readonly resolveArguments: BrowserCommandSurfaceProps["resolveArguments"];
}): React.JSX.Element {
  const selected = Number(
    useBrowserCommandPresentation(commandSource, commandId, getCommandResource).selectedValue,
  );
  /* v8 ignore next -- Imported nonstandard point sizes are retained for round-trip fidelity. */
  const options = STANDARD_FONT_SIZES_PT.includes(
    selected as (typeof STANDARD_FONT_SIZES_PT)[number],
  )
    ? STANDARD_FONT_SIZES_PT
    : [selected, ...STANDARD_FONT_SIZES_PT];
  return (
    <label className="contents">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="h-8 min-w-20 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onChange={
          /** Applies the selected font height. @param event - Select change. @returns Nothing. */ (
            event,
          ) => {
            const base = resolveArguments(commandId);
            commandSource.Execute(commandId, {
              /* v8 ignore next -- The Writer view always resolves font arguments to a cursor object. */
              ...(typeof base === "object" && base !== null ? base : {}),
              fontSizePt: Number(event.target.value),
            });
          }
        }
        value={selected}
      >
        {options.map(
          /** Renders one point size. @param size - Point height. @returns Option. */ (size) => (
            <option key={size} value={size}>{`${size} pt`}</option>
          ),
        )}
      </select>
    </label>
  );
}
