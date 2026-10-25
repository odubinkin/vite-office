/** @fileoverview Renders Writer text and numbering toolbar resources through shared command descriptors. */
import type { SwDocShell } from "../../source/uibase/app/docsh";
import { useWriterStylePreviews } from "./use-writer-style-previews";
import { CommandSelectControl } from "../../../framework/browser/presentation/CommandSelectControl";
import { FontNameSelect, FontSizeSelect } from "../../../svx/browser/tbxctrls/FontSelects";
import { getOfficeFormattingButtonContent as getWriterButtonContent } from "../../../framework/browser/presentation/office-formatting-content";
import { officeCommandIcons as icons } from "../../../framework/browser/presentation/office-command-icons";
import { officeToolbarButtonClassName } from "../../../framework/browser/presentation/office-control-styles";
import {
  type CommandToolbarPlacement,
  CommandToolbarItems,
} from "../../../framework/browser/presentation/CommandToolbar";
import {
  type BrowserCommandSurfaceProps,
  useBrowserCommandPresentation,
} from "../../../framework/browser/presentation/command-surface";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { StyleToolboxSelect } from "../../../svx/browser/tbxctrls/StyleToolboxSelect";
import type { WriterParagraphStyleOption } from "./writer-view-projection";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerTextObjectBarItems } from "../../uiconfig/swriter/toolbar/textobjectbar";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterLineSpacingControl } from "./WriterLineSpacingControl";
import { selectWriterCommandResource } from "./writer-command-presentation";
import type { WriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import type { WriterToolbarItemPlacement } from "../../uiconfig/swriter/ui-resource";

/** Inputs shared by the complete Writer text formatting toolbar. */
export interface WriterFormattingToolbarProps extends BrowserCommandSurfaceProps {
  readonly unit: FieldUnit;
  readonly objectShell?: SwDocShell;
  readonly paragraphStyleNames?: readonly string[];
  readonly paragraphStyleOptions: readonly WriterParagraphStyleOption[];
  readonly focusDocument?: () => void;
  readonly isInputEnabled?: boolean;
  readonly advancedControls?: React.ReactNode;
  readonly embeddedFontFamilies?: readonly string[];
  readonly fontAvailability?: Readonly<Record<string, boolean>>;
}

/** Renders the complete Writer text toolbar. Its generic indent commands select list-level or paragraph-margin behavior in the text shell. @param props - Shared command surface and shell context. @returns Toolbar item fragment. */
export function WriterFormattingToolbar({
  commandSource,
  objectShell,
  unit,
  paragraphStyleOptions,
  paragraphStyleNames = [],
  focusDocument,
  isInputEnabled = true,
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
        buttonClassName={officeToolbarButtonClassName}
        commandSource={commandSource}
        getButtonContent={getWriterButtonContent}
        getCommandResource={getCommandResource}
        icons={icons}
        items={placements}
        renderSpecialItem={
          /** Renders Writer selector placements. @param item - Generic special placement. @returns Writer selector. */ (
            item,
          ) => {
            /* istanbul ignore next -- Generated Writer resources call this hook only for the two special placement kinds. */
            if (!isWriterSpecialToolbarPlacement(item)) return null;
            return renderSpecialToolbarItem(
              item,
              commandSource,
              getCommandResource,
              paragraphStyleOptions,
              focusDocument,
              isInputEnabled,
              resolveArguments,
              embeddedFontFamilies,
              fontAvailability,
              paragraphStyleNames,
              objectShell,
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
        unit={unit}
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

/** Renders one non-button toolbar placement. @param placement - Generic resource item. @param commandSource - Descriptor/state source. @param getCommandResource - Generated command lookup. @param paragraphStyleOptions - Binding-backed style selector options. @param focusDocument - Owning document client port. @param isInputEnabled - Active frame eligibility. @param resolveArguments - Browser argument adapter. @param embeddedFontFamilies - Package font families. @param fontAvailability - Browser load status. @param paragraphStyleNames - Full source pool names beyond visible rows. @param objectShell - Actual owning Writer shell. @returns Rendered special item. */
function renderSpecialToolbarItem(
  placement: Extract<
    WriterToolbarItemPlacement,
    { kind: "command-select" | "font-select" | "font-size-select" }
  >,
  commandSource: BrowserCommandSurfaceProps["commandSource"],
  getCommandResource: (commandUrl: string) => WriterCommandResource,
  paragraphStyleOptions: readonly WriterParagraphStyleOption[],
  focusDocument: (() => void) | undefined,
  isInputEnabled: boolean,
  resolveArguments: BrowserCommandSurfaceProps["resolveArguments"],
  embeddedFontFamilies: readonly string[],
  fontAvailability: Readonly<Record<string, boolean>>,
  paragraphStyleNames: readonly string[],
  objectShell: SwDocShell | undefined,
): React.ReactNode {
  const item = placement;
  if (item.kind === "font-select" || item.kind === "font-size-select")
    return (
      <CommandSelectControl
        commandId={item.commandId}
        commandSource={commandSource}
        getCommandResource={getCommandResource}
        resolveArguments={resolveArguments}
        argumentName={item.kind === "font-select" ? "fontFamily" : "fontSizePt"}
        key={item.commandId}
      >
        {
          /** Injects the actual shared widget into the Sfx binding controller. @param binding - Current state and execution port. @returns Font widget. */ (
            binding,
          ) =>
            item.kind === "font-select" ? (
              <FontNameSelect
                {...(focusDocument === undefined ? {} : { focusDocument })}
                {...binding}
                label={getCommandResource(item.commandId).controlLabel}
                embeddedFontFamilies={embeddedFontFamilies}
                fontAvailability={fontAvailability}
                unavailableFontMessage="Embedded font unavailable; using Liberation Serif fallback"
              />
            ) : (
              <FontSizeSelect
                {...(focusDocument === undefined ? {} : { focusDocument })}
                {...binding}
                label={getCommandResource(item.commandId).controlLabel}
              />
            )
        }
      </CommandSelectControl>
    );
  return (
    <ParagraphStyleSelect
      commandSource={commandSource}
      getCommandResource={getCommandResource}
      key={item.label}
      paragraphStyleNames={paragraphStyleNames}
      paragraphStyleOptions={paragraphStyleOptions}
      {...(objectShell === undefined ? {} : { objectShell })}
      {...(focusDocument === undefined ? {} : { focusDocument })}
      isInputEnabled={isInputEnabled}
    />
  );
}

/** Binding-backed paragraph-style selector. @param props - Generated resource and command state inputs. @returns Style selector. */
function ParagraphStyleSelect({
  commandSource,
  objectShell,
  getCommandResource,
  paragraphStyleOptions,
  paragraphStyleNames,
  focusDocument,
  isInputEnabled,
}: Readonly<{
  commandSource: BrowserCommandSurfaceProps["commandSource"];
  objectShell?: SwDocShell;
  getCommandResource: (commandUrl: string) => WriterCommandResource;
  paragraphStyleNames: readonly string[];
  paragraphStyleOptions: readonly WriterParagraphStyleOption[];
  focusDocument?: () => void;
  isInputEnabled: boolean;
}>): React.JSX.Element {
  const presentation = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.styleApply,
    getCommandResource,
  );
  const preview = useWriterStylePreviews(objectShell, paragraphStyleOptions, getCommandResource);
  return (
    <StyleToolboxSelect
      {...preview}
      acceptName={
        /** Uses the entire native pool, not just visible rows, to choose Apply or NewByExample. @param name - Exact accepted name. @returns Nothing. */
        (name) => {
          commandSource.Execute(
            paragraphStyleNames.includes(name)
              ? WRITER_COMMAND_IDS.styleApply
              : WRITER_COMMAND_IDS.styleNewByExample,
            paragraphStyleNames.includes(name)
              ? { Template: name, Family: 2 }
              : { Param: name, Family: 2 },
          );
        }
      }
      options={paragraphStyleOptions}
      value={String(presentation.selectedValue ?? "")}
      enabled={presentation.enabled && isInputEnabled}
      label={getCommandResource(WRITER_COMMAND_IDS.styleApply).controlLabel}
      {...(focusDocument === undefined ? {} : { focusDocument })}
      getLabel={
        /** Localizes unchanged pool entries while retaining actual native names. @param style - Detached entry. @returns Label. */ (
          style,
        ) =>
          style.resourceId === undefined ? style.name : getCommandResource(style.resourceId).label
      }
      applyStyle={
        /** Dispatches the accepted native name through the owning Sfx frame. @param style - Accepted entry. @returns Nothing. */ (
          style,
        ) => {
          commandSource.Execute(WRITER_COMMAND_IDS.styleApply, {
            Style: style.name,
            FamilyName: "ParagraphStyles",
          });
        }
      }
    />
  );
}
