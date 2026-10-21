/** @fileoverview Consumed native TableEditPanel toolbar composition from sidebartableedit.ui,using existing Writer table slots. */
import { useRef } from "react";
import {
  Ellipsis,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Square,
  Rows3,
  Columns3,
  Table2,
} from "lucide-react";
import { SidebarPanel } from "../../../sfx2/browser/presentation/SidebarPanel";
import { CommandButton } from "../../../framework/browser/presentation/CommandToolbar";
import type {
  BrowserCommandSurfaceProps,
  BrowserCommandPresentationResource,
} from "../../../framework/browser/presentation/command-surface";

const groups = [
  {
    label: "Insert",
    commands: [
      ".uno:InsertRowsBefore",
      ".uno:InsertRowsAfter",
      ".uno:InsertColumnsBefore",
      ".uno:InsertColumnsAfter",
    ],
  },
  {
    label: "Select",
    commands: [".uno:EntireCell", ".uno:EntireRow", ".uno:EntireColumn", ".uno:SelectTable"],
  },
] as const;

const icons = {
  ".uno:InsertRowsBefore": ArrowUpToLine,
  ".uno:InsertRowsAfter": ArrowDownToLine,
  ".uno:InsertColumnsBefore": ArrowLeftToLine,
  ".uno:InsertColumnsAfter": ArrowRightToLine,
  ".uno:EntireCell": Square,
  ".uno:EntireRow": Rows3,
  ".uno:EntireColumn": Columns3,
  ".uno:SelectTable": Table2,
} as const;

/** Renders the supported native table insertion/selection slice and actual properties command;row/column metric widgets and additional toolbar groups remain unported. @param props - Actual Writer frame and localization ports. @returns Contextual Table panel. */
export function TableEditPanel(
  props: BrowserCommandSurfaceProps &
    Readonly<{
      title: string;
      focusDocument?: () => void;
      getCommandResource: (url: string) => BrowserCommandPresentationResource;
    }>,
): React.JSX.Element {
  const content = useRef<HTMLDivElement>(null);
  return (
    <SidebarPanel
      title={props.title}
      focusDocument={props.focusDocument}
      focusContent={
        /** Enters the first eligible table command. @returns Nothing. */ () =>
          content.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus()
      }
      moreOptions={<CommandButton {...props} commandId=".uno:TableDialog" icon={Ellipsis} />}
    >
      <div ref={content} className="space-y-2 py-2">
        {groups.map(
          /** Projects ordered source toolbar groups. @param group - Native group. @returns Actual controls. */ (
            group,
          ) => (
            <div
              key={group.label}
              role="group"
              aria-label={group.label}
              className="flex flex-wrap gap-1"
            >
              {group.commands.map(
                /** Binds an existing native table command. @param command - Slot URL. @returns Command control. */ (
                  command,
                ) => (
                  <CommandButton
                    {...props}
                    commandId={command}
                    key={command}
                    icon={icons[command]}
                  />
                ),
              )}
            </div>
          ),
        )}
      </div>
    </SidebarPanel>
  );
}
