/** @fileoverview Consumed Character panel font/effects/color controls from sidebartextpanel.ui over actual Sfx bindings. */
import { useRef } from "react";
import {
  Bold,
  RemoveFormatting,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  AArrowUp,
  AArrowDown,
} from "lucide-react";
import { SidebarPanel } from "../../../../sfx2/browser/presentation/SidebarPanel";
import { CommandSelectControl } from "../../../../framework/browser/presentation/CommandSelectControl";
import { CommandButton } from "../../../../framework/browser/presentation/CommandToolbar";
import {
  useBrowserCommandState,
  type BrowserCommandSurfaceProps,
  type BrowserCommandPresentationResource,
} from "../../../../framework/browser/presentation/command-surface";
import { FontNameSelect, FontSizeSelect } from "../../tbxctrls/FontSelects";
import { ColorControl } from "../../tbxctrls/ColorControl";

/** Supplies actual frame bindings and document font availability. */
export interface TextPropertyPanelProps extends BrowserCommandSurfaceProps {
  readonly title: string;
  readonly focusDocument?: () => void;
  readonly getCommandResource: (url: string) => BrowserCommandPresentationResource;
  readonly embeddedFontFamilies: readonly string[];
  readonly fontAvailability: Readonly<Record<string, boolean>>;
}

/** Renders the supported native Character slice;unsupported native effects and advanced typography remain unported. @param props - Frame bindings,resource and focus ports. @returns Character panel. */
export function TextPropertyPanel(props: TextPropertyPanelProps): React.JSX.Element {
  const { commandSource, getCommandResource, resolveArguments } = props,
    content = useRef<HTMLDivElement>(null),
    color = useBrowserCommandState(commandSource, ".uno:Color"),
    highlight = useBrowserCommandState(commandSource, ".uno:CharBackColor");
  return (
    <SidebarPanel
      title={props.title}
      focusDocument={props.focusDocument}
      focusContent={
        /** Enters the first actual font widget. @returns Nothing. */ () =>
          content.current?.querySelector<HTMLInputElement>("input[role=combobox]")?.focus()
      }
    >
      <div ref={content} className="space-y-2 py-2 [&_select]:min-w-0 [&_select]:max-w-full">
        <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-1">
          <CommandSelectControl {...props} commandId=".uno:CharFontName" argumentName="fontFamily">
            {
              /** Connects the shared font widget to the actual binding. @param binding - Frame state and acceptance. @returns Font widget. */ (
                binding,
              ) => (
                <FontNameSelect
                  inSidebar
                  {...(props.focusDocument === undefined
                    ? {}
                    : { focusDocument: props.focusDocument })}
                  {...binding}
                  label={getCommandResource(".uno:CharFontName").controlLabel as string}
                  embeddedFontFamilies={props.embeddedFontFamilies}
                  fontAvailability={props.fontAvailability}
                  unavailableFontMessage="Embedded font unavailable; using Liberation Serif fallback"
                />
              )
            }
          </CommandSelectControl>
          <CommandSelectControl {...props} commandId=".uno:FontHeight" argumentName="fontSizePt">
            {
              /** Connects the point-size selector to the frame. @param binding - Frame state and acceptance. @returns Size widget. */ (
                binding,
              ) => (
                <FontSizeSelect
                  inSidebar
                  {...(props.focusDocument === undefined
                    ? {}
                    : { focusDocument: props.focusDocument })}
                  {...binding}
                  label={getCommandResource(".uno:FontHeight").controlLabel as string}
                />
              )
            }
          </CommandSelectControl>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Font Effects">
          {[
            [".uno:Bold", Bold],
            [".uno:Italic", Italic],
            [".uno:Underline", Underline],
            [".uno:Strikeout", Strikethrough],
          ].map(
            /** Projects source effect toolbar order. @param entry - Slot and icon. @returns Actual command button. */ ([
              commandId,
              icon,
            ]) => (
              <CommandButton
                key={commandId as string}
                commandId={commandId as string}
                icon={icon as typeof Bold}
                commandSource={commandSource}
                resolveArguments={resolveArguments}
                getCommandResource={getCommandResource}
              />
            ),
          )}
        </div>
        <div className="flex gap-1" role="group" aria-label="Character Position">
          {(
            [
              [".uno:SuperScript", Superscript],
              [".uno:SubScript", Subscript],
            ] as const
          ).map(
            /** Binds the original separate position toolbar in source order. @param entry - Native slot and icon. @returns Command. */
            ([commandId, icon]) => (
              <CommandButton
                key={commandId}
                commandId={commandId}
                icon={icon}
                commandSource={commandSource}
                resolveArguments={resolveArguments}
                getCommandResource={getCommandResource}
              />
            ),
          )}
        </div>
        <div className="flex gap-2">
          {(
            [
              { command: ".uno:Color", property: "color", state: color, fallback: "#000000" },
              {
                command: ".uno:CharBackColor",
                property: "highlight",
                state: highlight,
                fallback: "#ffff00",
              },
            ] as const
          ).map(
            /** Connects the native color toolbar placements. @param entry - Bound color slot. @returns Shared color widget. */ (
              entry,
            ) => (
              <ColorControl
                key={entry.command}
                label={getCommandResource(entry.command).controlLabel as string}
                property={entry.property}
                value={String(entry.state.value)}
                fallback={entry.fallback}
                disabled={!entry.state.enabled || entry.state.pending === true}
                onColor={
                  /** Dispatches the accepted color. @param property - Shared widget identity. @param value - Color token. @returns Nothing. */ (
                    property,
                    value,
                  ) => {
                    void property;
                    commandSource.Execute(entry.command, { color: value });
                  }
                }
              />
            ),
          )}
        </div>
        <div
          className="flex justify-between gap-1"
          role="group"
          aria-label="Direct Formatting and Font Size"
        >
          <CommandButton {...props} commandId=".uno:ResetAttributes" icon={RemoveFormatting} />
          <div className="flex gap-1">
            <CommandButton {...props} commandId=".uno:Grow" icon={AArrowUp} />
            <CommandButton {...props} commandId=".uno:Shrink" icon={AArrowDown} />
          </div>
        </div>
      </div>
    </SidebarPanel>
  );
}
