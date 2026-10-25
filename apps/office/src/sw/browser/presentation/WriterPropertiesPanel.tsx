/** @fileoverview Composes the consumed native Writer Style,Character and Paragraph Properties panels over the active frame. */
import type { SwDocShell } from "../../source/uibase/app/docsh";
import { useWriterStylePreviews } from "./use-writer-style-previews";
import { TableEditPanel } from "../sidebar/TableEditPanel";
import { Ellipsis, Paintbrush, RefreshCw, FilePlus } from "lucide-react";
import { StylesPropertyPanel } from "../../../svx/browser/sidebar/styles/StylesPropertyPanel";
import { TextPropertyPanel } from "../../../svx/browser/sidebar/text/TextPropertyPanel";
import { ParaPropertyPanel } from "../../../svx/browser/sidebar/paragraph/ParaPropertyPanel";
import { CommandButton } from "../../../framework/browser/presentation/CommandToolbar";
import {
  useBrowserCommandPresentation,
  type BrowserCommandSurfaceProps,
} from "../../../framework/browser/presentation/command-surface";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import type { WriterParagraphStyleOption } from "./writer-view-projection";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { selectWriterCommandResource } from "./writer-command-presentation";
import { WriterLineSpacingControl } from "./WriterLineSpacingControl";

/** Supplies the actual frame and module unit to the Paragraph panel. */
export interface WriterParagraphPropertiesProps extends BrowserCommandSurfaceProps {
  readonly focusDocument?: () => void;
  readonly unit: FieldUnit;
}

/** Renders Writer's consumed Paragraph panel without presentation-owned formatting state. @param props - Active frame and actual unit. @returns Native panel projection. */
export function WriterParagraphProperties(
  props: WriterParagraphPropertiesProps,
): React.JSX.Element {
  const localization = useBrowserLocalization();
  /** Resolves the actual localized command resource. @param url - Native slot URL. @returns Resource. */
  function resource(url: string) {
    return selectWriterCommandResource(localization, url);
  }
  return (
    <ParaPropertyPanel
      {...props}
      title={localization.GetText("writer.properties.paragraph", "Paragraph")}
      getCommandResource={resource}
      lineSpacing={
        <WriterLineSpacingControl
          unit={props.unit}
          commandSource={props.commandSource}
          getCommandResource={resource}
        />
      }
      moreOptions={
        <CommandButton
          {...props}
          commandId={WRITER_COMMAND_IDS.paragraphDialog}
          icon={Ellipsis}
          getCommandResource={
            /** Applies the native panel toolbar label. @param url - Actual paragraph dialog slot. @returns Localized resource. */ (
              url,
            ) => ({
              ...resource(url),
              label: localization.GetText("sidebar.panel.more-options", "More Options"),
            })
          }
        />
      }
    />
  );
}

/** Composes native Sidebar.xcu order100/120/200 with actual selection and font ports. @param props - Persistent frame projections. @returns Supported Writer Properties deck content. */
export function WriterPropertiesPanel(
  props: WriterParagraphPropertiesProps &
    Readonly<{
      objectShell?: SwDocShell;
      paragraphStyleNames?: readonly string[];
      paragraphStyleOptions: readonly WriterParagraphStyleOption[];
      isTable: boolean;
      embeddedFontFamilies: readonly string[];
      fontAvailability: Readonly<Record<string, boolean>>;
    }>,
): React.JSX.Element {
  const localization = useBrowserLocalization();
  /** Resolves the actual localized command resource. @param url - Native slot URL. @returns Resource. */
  function resource(url: string) {
    return selectWriterCommandResource(localization, url);
  }
  const preview = useWriterStylePreviews(props.objectShell, props.paragraphStyleOptions, resource);
  const style = useBrowserCommandPresentation(
    props.commandSource,
    WRITER_COMMAND_IDS.styleApply,
    resource,
  );
  return (
    <>
      <StylesPropertyPanel
        {...preview}
        title={localization.GetText("writer.properties.style", "Style")}
        inSidebar
        tools={
          <>
            {[
              [WRITER_COMMAND_IDS.formatPaintbrush, Paintbrush],
              [WRITER_COMMAND_IDS.styleUpdateByExample, RefreshCw],
              [WRITER_COMMAND_IDS.styleNewByExample, FilePlus],
            ].map(
              /** Retains original sidebarstylespanel command order and actual availability. @param entry - Native command and icon. @returns Bound control. */
              ([commandId, icon]) => (
                <CommandButton
                  {...props}
                  key={commandId as string}
                  commandId={commandId as string}
                  icon={icon as typeof Paintbrush}
                  getCommandResource={resource}
                />
              ),
            )}
          </>
        }
        acceptName={
          /** Selects existing styles against the full pool; new names use the source command. @param name - Exact raw accepted name. @returns Nothing. */
          (name) => {
            const exists = props.paragraphStyleNames?.includes(name) === true;
            props.commandSource.Execute(
              exists ? WRITER_COMMAND_IDS.styleApply : WRITER_COMMAND_IDS.styleNewByExample,
              exists ? { Template: name, Family: 2 } : { Param: name, Family: 2 },
            );
          }
        }
        label={resource(WRITER_COMMAND_IDS.styleApply).controlLabel}
        options={props.paragraphStyleOptions}
        value={String(style.selectedValue ?? "")}
        enabled={style.enabled}
        {...(props.focusDocument === undefined ? {} : { focusDocument: props.focusDocument })}
        getLabel={
          /** Localizes original pool styles while retaining custom names. @param entry - Actual style entry. @returns Display label. */ (
            entry,
          ) => (entry.resourceId === undefined ? entry.name : resource(entry.resourceId).label)
        }
        applyStyle={
          /** Applies through the actual Sfx style slot. @param entry - Accepted native name. @returns Nothing. */ (
            entry,
          ) => {
            props.commandSource.Execute(WRITER_COMMAND_IDS.styleApply, {
              Style: entry.name,
              FamilyName: "ParagraphStyles",
            });
          }
        }
      />
      <TextPropertyPanel
        {...props}
        title={localization.GetText("writer.properties.character", "Character")}
        getCommandResource={resource}
      />
      <WriterParagraphProperties {...props} />
      {props.isTable && (
        <TableEditPanel
          {...props}
          title={localization.GetText("writer.properties.table", "Table")}
          getCommandResource={resource}
        />
      )}
    </>
  );
}
