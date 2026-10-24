/** @fileoverview Projects the original supported numbering object-bar resource over actual Writer frame bindings. */
import { IndentDecrease, IndentIncrease, ListRestart } from "lucide-react";
import {
  CommandToolbarItems,
  type CommandIcon,
} from "../../../framework/browser/presentation/CommandToolbar";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { officeToolbarButtonClassName } from "../../../framework/browser/presentation/office-control-styles";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { writerNumObjectBarItems } from "../../uiconfig/swriter/toolbar/numobjectbar";
import { selectWriterCommandResource } from "./writer-command-presentation";
const icons = new Map<string, CommandIcon>([
  [".uno:DecrementLevel", IndentIncrease],
  [".uno:IncrementLevel", IndentDecrease],
  [".uno:ContinueNumbering", ListRestart],
]);
/** Renders source-visible placements without retaining list state or creating commands. @param props - Actual frame command ports. @returns Contextual toolbar entries. */
export function WriterNumObjectBar(props: BrowserCommandSurfaceProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  return (
    <div
      className="contents"
      onMouseDown={
        /** Keeps pointer activation on the document caret;keyboard toolbar focus remains native browser behavior. @param event - Actual pointer admission. @returns Nothing. */ (
          event,
        ) => {
          if (event.button === 0) event.preventDefault();
        }
      }
    >
      <CommandToolbarItems
        {...props}
        items={writerNumObjectBarItems}
        icons={icons}
        buttonClassName={officeToolbarButtonClassName}
        getCommandResource={
          /** Localizes the actual generated resource. @param id - Native command URL. @returns Resource. */ (
            id,
          ) => selectWriterCommandResource(localization, id)
        }
      />
    </div>
  );
}
