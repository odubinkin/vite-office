/** @fileoverview Actual shared Writer formatting controls over native Calc formatobjectbar and Sfx bindings. */
import { useCallback } from "react";
import { BorderSelect, BorderLineStyleSelect } from "../../../svx/browser/tbxctrls/BorderSelect";
import type { BorderDispatch } from "../../../svx/source/tbxctrls/tbcontrl";
import { useBrowserCommandPresentation } from "../../../framework/browser/presentation/command-surface";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { COL_DEFAULT_FRAMELINE } from "../../../svx/inc/xdef";
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
const BorderPresetIcon = officeCommandIcons.get(".uno:SetBorderStyle");
const BorderStyleIcon = officeCommandIcons.get(".uno:LineStyle");
const BorderColorIcon = officeCommandIcons.get(".uno:FrameLineColor");
/** Renders original visible placements without fabricating unported formatting state or execution. @param props - Real command source. @returns Toolbar content. */
export function CalcFormattingToolbar({
  commandSource,
  resolveArguments,
  objectShell,
  focusDocument,
}: BrowserCommandSurfaceProps & {
  readonly objectShell: SfxObjectShell;
  readonly focusDocument?: () => void;
}): React.JSX.Element {
  return (
    <CommandToolbarItems
      commandSource={commandSource}
      resolveArguments={resolveArguments}
      items={calcFormatObjectBarItems}
      icons={officeCommandIcons}
      getButtonContent={getOfficeFormattingButtonContent}
      getCommandResource={getCalcCommandResource}
      buttonClassName={officeToolbarButtonClassName}
      renderCommandItem={
        /** Reuses the actual common toolbar with native border toolbox controls in original resource positions. @param item - Source command placement. @returns Specialized native toolbox or the ordinary shared button. */ (
          item,
        ) =>
          [".uno:SetBorderStyle", ".uno:LineStyle", ".uno:FrameLineColor"].includes(
            item.commandId,
          ) ? (
            <CalcBorderToolbarItem
              key={item.commandId}
              commandId={item.commandId}
              commandSource={commandSource}
              resolveArguments={resolveArguments}
              objectShell={objectShell}
            />
          ) : undefined
      }
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
                    <FontNameSelect
                      {...(focusDocument === undefined ? {} : { focusDocument })}
                      {...binding}
                      label={item.label}
                    />
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

/** Binds the three native border toolbar controllers to actual shared Writer/SVX widgets. @param props - Actual active Sfx source and document owner. @returns Bound toolbox. */
function CalcBorderToolbarItem({
  commandId,
  commandSource,
  resolveArguments,
  objectShell,
}: BrowserCommandSurfaceProps & {
  readonly commandId: string;
  readonly objectShell: SfxObjectShell;
}): React.JSX.Element {
  const state = useBrowserCommandPresentation(commandSource, commandId, getCalcCommandResource),
    icon =
      commandId === ".uno:SetBorderStyle" && BorderPresetIcon ? (
        <BorderPresetIcon aria-hidden={true} size={18} />
      ) : commandId === ".uno:LineStyle" && BorderStyleIcon ? (
        <BorderStyleIcon aria-hidden={true} size={18} />
      ) : BorderColorIcon ? (
        <BorderColorIcon aria-hidden={true} size={18} />
      ) : null;
  const dispatch = useCallback<BorderDispatch>(
    /** Forwards original typed item arrays through the actual dispatcher. @param command - Source command URL. @param items - Real source items. @returns Nothing. */ (
      command,
      items,
    ) => {
      commandSource.Execute(command, items);
    },
    [commandSource],
  );
  if (commandId === ".uno:SetBorderStyle")
    return (
      <BorderSelect
        dispatch={dispatch}
        enabled={state.enabled}
        label={state.resource.label}
        className={officeToolbarButtonClassName}
        icon={icon}
      />
    );
  return (
    <CommandSelectControl
      commandId={commandId}
      commandSource={commandSource}
      resolveArguments={resolveArguments}
      getCommandResource={getCalcCommandResource}
      argumentName={commandId === ".uno:LineStyle" ? "LineStyle" : "color"}
    >
      {
        /** Supplies actual original style/color state to the shared widget. @param binding - Native Sfx binding. @returns Shared toolbox. */ (
          binding,
        ) =>
          commandId === ".uno:LineStyle" ? (
            <BorderLineStyleSelect
              {...binding}
              label={state.resource.label}
              className={officeToolbarButtonClassName}
              icon={icon}
            />
          ) : (
            <ColorSelect
              {...binding}
              icon={icon}
              objectShell={objectShell}
              slotId={10202}
              label={state.resource.label}
              onApply={
                /** Uses the actual toolbox recent color,including its native Blue default. @returns Nothing. */ () => {
                  const recent = objectShell.GetRecentColor(10202);
                  try {
                    commandSource.Execute(commandId, {
                      color: new SvxColorItem(recent?.m_aColor ?? COL_DEFAULT_FRAMELINE, 10202),
                    });
                  } finally {
                    recent?.Dispose();
                  }
                }
              }
            />
          )
      }
    </CommandSelectControl>
  );
}
