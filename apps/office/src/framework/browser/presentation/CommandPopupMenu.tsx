/** @fileoverview Presents generated popup resources through the same original bindings clients as the menubar. */
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  BindingsMenuCommand,
  CommandMenuPopup,
  type CommandMenuBarProps,
  type CommandMenuItemPlacement,
} from "./CommandMenuBar";
import type { BrowserCommandSurfaceProps } from "./command-surface";
/** Original resource and final device position selected by the owning native frame. */
export interface CommandPopupMenuProps extends BrowserCommandSurfaceProps {
  readonly ariaLabel: string;
  readonly getMenuLabel?: CommandMenuBarProps["getMenuLabel"];
  readonly items: readonly CommandMenuItemPlacement[];
  readonly position: Readonly<{ x: number; y: number }>;
  readonly getCommandResource: CommandMenuBarProps["getCommandResource"];
  readonly onClose: () => void;
}
/** Presents native resource order without inferring command admission or document selection. @param props - Actual frame resource and bindings. @returns Focus-owning popup. */
export function CommandPopupMenu({
  ariaLabel,
  getMenuLabel,
  items,
  position,
  commandSource,
  getCommandResource,
  resolveArguments,
  onClose,
}: CommandPopupMenuProps): React.JSX.Element {
  const root = useRef<HTMLDivElement>(null),
    savedFocus = useRef<HTMLElement | undefined>(undefined);
  const [openPath, setOpenPath] = useState<readonly string[]>([]);
  const pendingChildFocus = useRef(false);
  const closeMenu = useCallback(
    /** Dismisses before restoring the connected previous owner; outside focus retains its new owner. @param restore - Whether to restore menu-owned focus. @returns Nothing. */ (
      restore = true,
    ) => {
      onClose();
      if (restore && savedFocus.current?.isConnected)
        savedFocus.current.focus({ preventScroll: true });
    },
    [onClose],
  );
  useLayoutEffect(
    /** Grabs popup focus without preselecting an entry, as native standalone PopupMenu::Execute. @returns Nothing. */ () => {
      if (document.activeElement instanceof HTMLElement)
        savedFocus.current = document.activeElement;
      ((root.current as HTMLDivElement).firstElementChild as HTMLElement).focus();
    },
    [],
  );
  useLayoutEffect(
    /** Cancels when pointer or focus leaves the owned popup tree. @returns Listener cleanup. */ () => {
      /** Retains the newly selected outside focus owner. @param event - Actual pointer or focus transfer. @returns Nothing. */ function outside(
        event: Event,
      ): void {
        if (!(root.current as HTMLDivElement).contains(event.target as Node)) closeMenu(false);
      }
      document.addEventListener("mousedown", outside);
      document.addEventListener("focusin", outside);
      return /** Releases popup ownership listeners. @returns Nothing. */ () => {
        document.removeEventListener("mousedown", outside);
        document.removeEventListener("focusin", outside);
      };
    },
    [closeMenu],
  );
  useLayoutEffect(
    /** Selects the first enabled child only after a keyboard submenu request. @returns Nothing. */ () => {
      if (pendingChildFocus.current) {
        pendingChildFocus.current = false;
        const menu = (root.current as HTMLDivElement).querySelector<HTMLElement>(
          `[data-popup-depth="${openPath.length}"]`,
        );
        menu?.focus();
        if (preselect.current) entries(menu).at(0)?.focus();
        preselect.current = false;
      }
    },
    [openPath],
  );
  const preselect = useRef(false);
  /** Opens a child while discarding former sibling descendants. @param id - Original resource identity. @param depth - Parent depth. @param keyboard - Whether to select first child. @returns Nothing. */ function open(
    id: string,
    depth: number,
    keyboard = false,
  ): void {
    if (openPath[depth] === id) return;
    pendingChildFocus.current = true;
    preselect.current = keyboard;
    setOpenPath([...openPath.slice(0, depth), id]);
  }
  /** Returns enabled direct entries in resource order. @param menu - Actual menu owner. @returns Direct enabled entries. */ function entries(
    menu: HTMLElement | null,
  ): HTMLElement[] {
    return menu === null
      ? []
      : [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(
          /** Retains native selectable entries at this level. @param item - Entry. @returns Whether admitted. */ (
            item,
          ) => !item.hasAttribute("disabled") && item.closest('[role="menu"]') === menu,
        );
  }
  /** Returns focus to the actual parent trigger while closing descendants. @param depth - Child depth. @param trigger - Actual owning parent button. @returns Nothing. */ function closeChild(
    depth: number,
    trigger: HTMLElement,
  ): void {
    setOpenPath(openPath.slice(0, depth - 1));
    trigger.focus();
  }
  /** Routes menu input without invoking document shortcuts. @param event - Current menu keyboard input. @param depth - Native popup depth. @returns Nothing. */ function key(
    event: React.KeyboardEvent<HTMLDivElement>,
    depth: number,
  ): void {
    event.stopPropagation();
    const target = event.target as HTMLElement,
      menu = event.currentTarget,
      list = entries(menu),
      index = list.indexOf(target);
    if (event.key === "Escape" || (event.key === "F6" && event.ctrlKey)) {
      event.preventDefault();
      if (depth === 0) closeMenu();
      else closeChild(depth, event.currentTarget.previousElementSibling as HTMLElement);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (depth > 0) closeChild(depth, event.currentTarget.previousElementSibling as HTMLElement);
    } else if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault();
      const id = target.dataset.popupTrigger;
      if (id !== undefined)
        flushSync(
          /** Opens original child before its keyboard preselection. @returns Nothing. */ () =>
            open(id, depth, true),
        );
      else if (event.key === "Enter" && !list.includes(target)) closeMenu();
      else if (event.key !== "ArrowRight") target.click();
    } else if (event.key === " ") {
      event.preventDefault();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? list.length - 1
            : event.key === "ArrowDown"
              ? (index + 1) % list.length
              : (index < 0 ? list.length : index) - 1;
      list[(next + list.length) % list.length]?.focus();
    }
  }
  /** Renders original recursive resource placements using shared command controller items. @param values - Native placements. @param depth - Popup depth. @returns Menu items. */ function renderItems(
    values: readonly CommandMenuItemPlacement[],
    depth: number,
  ): React.ReactNode {
    return values.map(
      /** Renders one native placement. @param item - Resource entry. @param index - Original index. @returns Entry. */ (
        item,
        index,
      ) => {
        if (item.kind === "separator")
          return (
            <div
              aria-hidden="true"
              className="my-1 border-t border-slate-200"
              key={`separator-${index}`}
            />
          );
        if (item.kind === "command")
          return (
            <BindingsMenuCommand
              closeMenu={closeMenu}
              commandSource={commandSource}
              getCommandResource={getCommandResource}
              item={item}
              key={item.commandId}
              resolveArguments={resolveArguments}
            />
          );
        const expanded = openPath[depth] === item.id,
          label = getMenuLabel?.(item.id, item.label) ?? item.label;
        return (
          <div
            className="relative"
            key={item.id}
            onMouseEnter={
              /** Opens native child for pointer entry. @returns Nothing. */ () =>
                open(item.id, depth)
            }
            onMouseLeave={
              /** Releases this child's pointer ownership. @param event - Actual parent popup region. @returns Nothing. */ (
                event,
              ) => {
                if (expanded)
                  closeChild(depth + 1, event.currentTarget.firstElementChild as HTMLElement);
              }
            }
          >
            <button
              aria-expanded={expanded}
              aria-haspopup="menu"
              className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
              data-popup-trigger={item.id}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              <span>{label}</span>
              <span aria-hidden="true" className="ml-auto">
                ›
              </span>
            </button>
            {expanded ? (
              <CommandMenuPopup
                aria-label={`${label} menu`}
                data-popup-depth={depth + 1}
                onKeyDown={
                  /** Routes child keyboard input. @param event - Keyboard input. @returns Nothing. */ (
                    event,
                  ) => key(event, depth + 1)
                }
                role="menu"
                submenu
              >
                {renderItems(item.items, depth + 1)}
              </CommandMenuPopup>
            ) : null}
          </div>
        );
      },
    );
  }
  return (
    <div className="relative z-[60]" ref={root}>
      <CommandMenuPopup
        anchorPoint={position}
        aria-label={ariaLabel}
        data-popup-depth={0}
        onKeyDown={
          /** Routes root keyboard input. @param event - Keyboard input. @returns Nothing. */ (
            event,
          ) => key(event, 0)
        }
        role="menu"
      >
        {renderItems(items, 0)}
      </CommandMenuPopup>
    </div>
  );
}
