/** @fileoverview Renders the pinned standard toolbar subset from declarative command placements. */
import {
  ClipboardPaste,
  Copy,
  FilePlus,
  FolderOpen,
  Link,
  Redo2,
  Scissors,
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
]);

/** Renders a standard toolbar from descriptor-backed resource items. @param props - Shared command surface. @returns Toolbar item fragment. */
export function WriterCommandToolbar({
  commandSource,
  resolveArguments,
}: BrowserCommandSurfaceProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  return (
    <CommandToolbarItems
      commandSource={commandSource}
      getCommandResource={
        /** Localizes one generated toolbar resource. @param commandUrl - Command URL. @returns Localized resource. */ (
          commandUrl,
        ) => {
          return selectWriterCommandResource(localization, commandUrl);
        }
      }
      icons={icons}
      items={writerStandardBarItems}
      resolveArguments={resolveArguments}
    />
  );
}
