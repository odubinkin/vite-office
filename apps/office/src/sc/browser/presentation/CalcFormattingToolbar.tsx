/** @fileoverview Actual shared Writer formatting controls over native Calc formatobjectbar and Sfx bindings. */
import { CommandSelectControl } from "../../../framework/browser/presentation/CommandSelectControl";
import { CommandToolbarItems } from "../../../framework/browser/presentation/CommandToolbar";
import { FontNameSelect, FontSizeSelect } from "../../../svx/browser/tbxctrls/FontSelects";
import { ColorSelect } from "../../../svx/browser/tbxctrls/ColorSelect";
import type { SfxObjectShell } from "../../../sfx2/source/doc/objsh";
import { officeToolbarButtonClassName } from "../../../framework/browser/presentation/office-control-styles";
import { officeCommandIcons } from "../../../framework/browser/presentation/office-command-icons";
import { getOfficeFormattingButtonContent } from "../../../framework/browser/presentation/office-formatting-content";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { calcFormatObjectBarItems } from "../../uiconfig/scalc/toolbar/formatobjectbar";
/** Renders original visible placements without fabricating unported formatting state or execution. @param props - Real command source. @returns Toolbar content. */
export function CalcFormattingToolbar({
  commandSource,
  resolveArguments,
  objectShell,
}: BrowserCommandSurfaceProps & { readonly objectShell: SfxObjectShell }): React.JSX.Element {
  return (
    <CommandToolbarItems
      commandSource={commandSource}
      resolveArguments={resolveArguments}
      items={calcFormatObjectBarItems}
      icons={officeCommandIcons}
      getButtonContent={getOfficeFormattingButtonContent}
      getCommandResource={getCalcCommandResource}
      buttonClassName={officeToolbarButtonClassName}
      renderSpecialItem={
        /** Uses the exact shared Writer font controls for source font placements. @param item - Generated special placement. @returns Bound selector. */ (
          item,
        ) => {
          if (item.kind === "color-select")
            return (
              <CommandSelectControl
                commandId={item.commandId}
                commandSource={commandSource}
                getCommandResource={getCalcCommandResource}
                resolveArguments={resolveArguments}
                argumentName="color"
                key={item.commandId}
              >
                {
                  /** Supplies actual native color state and dispatch ports. @param binding - Sfx binding. @returns Shared palette. */ (
                    binding,
                  ) => (
                    <ColorSelect
                      {...binding}
                      objectShell={objectShell}
                      slotId={item.commandId === ".uno:Color" ? 10017 : 10186}
                      label={item.label}
                      onApply={
                        /** Dispatches the original no-argument recent-color branch. @returns Nothing. */ () => {
                          commandSource.Execute(item.commandId);
                        }
                      }
                    />
                  )
                }
              </CommandSelectControl>
            );
          return (
            <CommandSelectControl
              commandId={item.commandId}
              commandSource={commandSource}
              getCommandResource={getCalcCommandResource}
              resolveArguments={resolveArguments}
              argumentName={item.kind === "font-select" ? "fontFamily" : "fontSizePt"}
              key={item.commandId}
            >
              {
                /** Supplies actual frame state to the shared SVX font widget. @param binding - Current native binding. @returns Widget. */ (
                  binding,
                ) =>
                  item.kind === "font-select" ? (
                    <FontNameSelect {...binding} label={item.label} />
                  ) : (
                    <FontSizeSelect {...binding} label={item.label} />
                  )
              }
            </CommandSelectControl>
          );
        }
      }
    />
  );
}
