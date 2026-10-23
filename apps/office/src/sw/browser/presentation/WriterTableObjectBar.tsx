/** @fileoverview Renders the consumed contextual Writer table toolbar through actual Sfx bindings. */
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Square,
  Table2,
  TableProperties,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";
import {
  CommandToolbarItems,
  type CommandIcon,
} from "../../../framework/browser/presentation/CommandToolbar";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { officeCommandIcons } from "../../../framework/browser/presentation/office-command-icons";
import { officeToolbarButtonClassName } from "../../../framework/browser/presentation/office-control-styles";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { writerTableObjectBarItems } from "../../uiconfig/swriter/toolbar/tableobjectbar";
import { selectWriterCommandResource } from "./writer-command-presentation";

const icons = new Map<string, CommandIcon>([
  ...officeCommandIcons,
  [".uno:InsertRowsBefore", ArrowUpToLine],
  [".uno:InsertRowsAfter", ArrowDownToLine],
  [".uno:InsertColumnsBefore", ArrowLeftToLine],
  [".uno:InsertColumnsAfter", ArrowRightToLine],
  [".uno:EntireCell", Square],
  [".uno:SelectTable", Table2],
  [".uno:TableDialog", TableProperties],
  [".uno:CellVertTop", AlignStartVertical],
  [".uno:CellVertCenter", AlignCenterVertical],
  [".uno:CellVertBottom", AlignEndVertical],
]);

/** Projects source placements without retaining document state in React. @param props - Actual frame command ports. @returns Contextual toolbar items. */
export function WriterTableObjectBar(props: BrowserCommandSurfaceProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  return (
    <CommandToolbarItems
      {...props}
      items={writerTableObjectBarItems}
      buttonClassName={officeToolbarButtonClassName}
      icons={icons}
      getCommandResource={
        /** Localizes original generated resources. @param id - Slot URL. @returns Resource. */
        (id) => selectWriterCommandResource(localization, id)
      }
    />
  );
}
