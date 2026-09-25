/** @fileoverview Writer-style color palettes and paragraph formatting controls. */
import type { WriterParagraphComputedStyle } from "./writer-view-projection";
import type {
  WriterParagraphDialogRequest,
  WriterParagraphDialogResult,
} from "../../source/uibase/dialog/writer-dialog-controller";
import {
  useBrowserCommandPresentation,
  type BrowserCommandSource,
} from "../../../framework/browser/presentation/command-surface";
import { WriterColorControl } from "./WriterColorControl";
import { WriterParagraphDialog } from "./WriterParagraphDialog";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";

/** Renders Writer color palettes, line spacing, and the tabbed paragraph dialog. @param props - Current formatting and callbacks. @returns Formatting controls. */
export function WriterAdvancedFormattingControls({
  commandSource,
  getCommandResource,
  paragraph,
  dialogRequest,
  onDialogCancel,
  onDialogSubmit,
}: Readonly<{
  commandSource: BrowserCommandSource;
  getCommandResource: (commandUrl: string) => WriterCommandResource;
  paragraph: WriterParagraphComputedStyle;
  dialogRequest?: Readonly<{ id: number; request: WriterParagraphDialogRequest }>;
  onDialogCancel: (id: number) => void;
  onDialogSubmit: (id: number, value: WriterParagraphDialogResult) => void;
}>): React.JSX.Element {
  const colorCommand = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.color,
    getCommandResource,
  );
  const highlightCommand = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.charBackColor,
    getCommandResource,
  );
  const onColor =
    /** Dispatches the selected character color. @param property - Target color slot. @param value - Selected color. @returns Nothing. */
    (property: "color" | "highlight", value: string): void => {
      commandSource.Execute(
        property === "color" ? WRITER_COMMAND_IDS.color : WRITER_COMMAND_IDS.charBackColor,
        { color: value },
      );
    };
  return (
    <>
      <div
        className="flex items-center gap-1 border-l border-slate-300 pl-2"
        aria-label="Character colors"
      >
        <WriterColorControl
          label={colorCommand.resource.controlLabel}
          property="color"
          value={
            typeof colorCommand.selectedValue === "string" ? colorCommand.selectedValue : "auto"
          }
          fallback="#000000"
          disabled={!colorCommand.enabled}
          onColor={onColor}
        />
        <WriterColorControl
          label={highlightCommand.resource.controlLabel}
          property="highlight"
          value={
            typeof highlightCommand.selectedValue === "string"
              ? highlightCommand.selectedValue
              : "transparent"
          }
          fallback="#ffff00"
          disabled={!highlightCommand.enabled}
          onColor={onColor}
        />
      </div>
      {dialogRequest !== undefined ? (
        <WriterParagraphDialog
          dialogRequest={dialogRequest}
          fontSizePt={paragraph.fontSizePt}
          onDialogCancel={onDialogCancel}
          onDialogSubmit={onDialogSubmit}
        />
      ) : null}
    </>
  );
}
