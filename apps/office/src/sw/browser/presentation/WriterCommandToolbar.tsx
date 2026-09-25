/** @fileoverview Renders the pinned standard toolbar subset from declarative command placements. */
import {
  ClipboardPaste,
  Copy,
  FilePlus,
  FolderOpen,
  Link,
  Bookmark,
  Redo2,
  Scissors,
  Table2,
  Undo2,
} from "lucide-react";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerStandardBarItems } from "../../uiconfig/swriter/toolbar/standardbar";
import { selectWriterCommandResource } from "./writer-command-presentation";
import {
  CommandToolbarItems,
  type CommandIcon,
} from "../../../framework/browser/presentation/CommandToolbar";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";

const icons = new Map<string, CommandIcon>([
  [WRITER_COMMAND_IDS.newDocument, FilePlus],
  [WRITER_COMMAND_IDS.openOdt, FolderOpen],
  [WRITER_COMMAND_IDS.cut, Scissors],
  [WRITER_COMMAND_IDS.copy, Copy],
  [WRITER_COMMAND_IDS.paste, ClipboardPaste],
  [WRITER_COMMAND_IDS.undo, Undo2],
  [WRITER_COMMAND_IDS.redo, Redo2],
  [WRITER_COMMAND_IDS.hyperlinkDialog, Link],
  [WRITER_COMMAND_IDS.insertBookmark, Bookmark],
]);

const beforeTable = writerStandardBarItems.slice(
  0,
  writerStandardBarItems.findIndex(
    /** Finds the upstream point preceding hyperlink insertion. @param item - Toolbar placement. @returns Whether this is the hyperlink command. */
    (item) => item.kind === "command" && item.commandId === WRITER_COMMAND_IDS.hyperlinkDialog,
  ),
);
const afterTable = writerStandardBarItems.slice(beforeTable.length);

/** Browser-only insertion action occupying the native Insert Table placement. */
interface WriterCommandToolbarProps extends BrowserCommandSurfaceProps {
  readonly onInsertTable: () => void;
}

/** Renders a standard toolbar from descriptor-backed resource items. @param props - Shared command surface. @returns Toolbar item fragment. */
export function WriterCommandToolbar({
  commandSource,
  onInsertTable,
  resolveArguments,
}: WriterCommandToolbarProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  /** Localizes one generated toolbar resource. @param commandUrl - Command URL. @returns Localized resource. */
  function getCommandResource(commandUrl: string) {
    return selectWriterCommandResource(localization, commandUrl);
  }
  const common = { commandSource, getCommandResource, icons, resolveArguments };
  return (
    <>
      <CommandToolbarItems {...common} items={beforeTable} />
      <button
        aria-label="Insert Table"
        className="grid size-9 place-items-center rounded-lg hover:bg-indigo-50"
        onClick={onInsertTable}
        title="Insert Table"
        type="button"
      >
        <Table2 aria-hidden={true} size={18} />
      </button>
      <CommandToolbarItems {...common} items={afterTable} />
    </>
  );
}
