/** @fileoverview Shared resource-driven Sfx command controls for browser toolbars. */

import type { ComponentType, ReactNode } from "react";

import { type BrowserCommandSurfaceProps, useBrowserCommandState } from "./command-surface";

/** Minimal icon contract used by command buttons without coupling to an icon package. */
export type CommandIcon = ComponentType<Readonly<{ "aria-hidden"?: boolean; size?: number }>>;

/** Resource fields required by a toolbar control. */
export interface ToolbarCommandResource {
  readonly label: string;
  readonly semantics: "action" | "check" | "radio";
}

/** Resource placement rendered by the generic toolbar. */
export type CommandToolbarPlacement =
  | Readonly<{ commandId: string; kind: "command" }>
  | Readonly<{ kind: "separator" }>
  | Readonly<{ kind: "command-select" | "font-select" | "font-size-select" }>;

/** Inputs for one bindings-backed command button. */
export interface CommandButtonProps extends BrowserCommandSurfaceProps {
  readonly className?: string;
  readonly commandId: string;
  readonly content?: ReactNode;
  readonly getCommandResource: (commandUrl: string) => ToolbarCommandResource;
  readonly icon?: CommandIcon;
}

/** Renders one command whose execution and state both come from the active Sfx frame. @param props - Command control inputs. @returns Accessible command button or null for an inactive resource. */
export function CommandButton({
  commandId,
  commandSource,
  className,
  content,
  getCommandResource,
  icon: Icon,
  resolveArguments,
}: CommandButtonProps): React.JSX.Element | null {
  const state = useBrowserCommandState(commandSource, commandId);
  const command = commandSource.QueryCommand(commandId);
  if (command === undefined) return null;
  const resource = getCommandResource(commandId);
  const pressed = resource.semantics === "action" ? undefined : state.checked === true;
  return (
    <button
      aria-label={resource.label}
      aria-pressed={pressed}
      className={
        className ??
        "grid size-9 place-items-center rounded-lg text-sm font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-900"
      }
      data-active={pressed}
      disabled={!state.enabled || state.pending === true}
      onClick={
        /** Dispatches through the same Sfx source that supplied state. @returns Nothing. */ () =>
          commandSource.Execute(commandId, resolveArguments(commandId))
      }
      title={state.error ?? resource.label}
      type="button"
    >
      {content ?? (Icon === undefined ? resource.label : <Icon aria-hidden={true} size={18} />)}
    </button>
  );
}

/** Inputs for a sequence of generated toolbar placements. */
export interface CommandToolbarItemsProps extends BrowserCommandSurfaceProps {
  readonly buttonClassName?: string;
  readonly getCommandResource: (commandUrl: string) => ToolbarCommandResource;
  readonly getButtonContent?: (commandUrl: string) => ReactNode;
  readonly icons?: ReadonlyMap<string, CommandIcon>;
  readonly items: readonly CommandToolbarPlacement[];
  readonly renderSpecialItem?: (item: CommandToolbarPlacement, index: number) => ReactNode;
}

/** Renders commands and separators in generated resource order. @param props - Toolbar resource inputs. @returns Toolbar item fragment. */
export function CommandToolbarItems({
  commandSource,
  buttonClassName,
  getCommandResource,
  getButtonContent,
  icons,
  items,
  renderSpecialItem,
  resolveArguments,
}: CommandToolbarItemsProps): React.JSX.Element {
  return (
    <>
      {items.map(
        /** Projects one generated placement. @param item - Toolbar placement. @param index - Resource index. @returns Rendered toolbar node. */ (
          item,
          index,
        ) => {
          if (item.kind === "separator")
            return (
              <span
                aria-hidden="true"
                className="mx-1 h-6 border-l border-slate-200"
                key={`separator-${index}`}
              />
            );
          if (item.kind !== "command") return renderSpecialItem?.(item, index) ?? null;
          const content = getButtonContent?.(item.commandId);
          const icon = icons?.get(item.commandId);
          return (
            <CommandButton
              commandId={item.commandId}
              commandSource={commandSource}
              {...(buttonClassName === undefined ? {} : { className: buttonClassName })}
              {...(content === undefined ? {} : { content })}
              getCommandResource={getCommandResource}
              {...(icon === undefined ? {} : { icon })}
              key={item.commandId}
              resolveArguments={resolveArguments}
            />
          );
        },
      )}
    </>
  );
}
