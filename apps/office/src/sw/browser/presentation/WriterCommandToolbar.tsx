/** @fileoverview Renders the pinned standard toolbar subset from declarative command placements. */
import { WriterTableInsertControl } from "./WriterTableInsertControl";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerStandardBarItems } from "../../uiconfig/swriter/toolbar/standardbar";
import { selectWriterCommandResource } from "./writer-command-presentation";
import { CommandToolbarItems } from "../../../framework/browser/presentation/CommandToolbar";
import { officeCommandIcons } from "../../../framework/browser/presentation/office-command-icons";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";

const tableIndex = writerStandardBarItems.findIndex(
  /** Finds Insert Table in pinned order. @param item - Toolbar placement. @returns Match. */ (
    item,
  ) => item.kind === "command" && item.commandId === WRITER_COMMAND_IDS.insertTable,
);
const beforeTable = writerStandardBarItems.slice(0, tableIndex);
const afterTable = writerStandardBarItems.slice(tableIndex + 1);

/** Browser-only insertion action occupying the native Insert Table placement. */
interface WriterCommandToolbarProps extends BrowserCommandSurfaceProps {
  readonly onInsertTable: (columns: number, rows: number) => void;
  readonly onTableMoreOptions: () => void;
}

/** Renders a standard toolbar from descriptor-backed resource items. @param props - Shared command surface. @returns Toolbar item fragment. */
export function WriterCommandToolbar({
  commandSource,
  onInsertTable,
  onTableMoreOptions,
  resolveArguments,
}: WriterCommandToolbarProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  /** Localizes one generated toolbar resource. @param commandUrl - Command URL. @returns Localized resource. */
  function getCommandResource(commandUrl: string) {
    return selectWriterCommandResource(localization, commandUrl);
  }
  const common = { commandSource, getCommandResource, icons: officeCommandIcons, resolveArguments };
  return (
    <>
      <CommandToolbarItems {...common} items={beforeTable} />
      <WriterTableInsertControl onInsert={onInsertTable} onMoreOptions={onTableMoreOptions} />
      <CommandToolbarItems {...common} items={afterTable} />
    </>
  );
}
