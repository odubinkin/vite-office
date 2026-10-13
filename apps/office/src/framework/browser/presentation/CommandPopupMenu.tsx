/** @fileoverview Presents generated popup resources through the same original bindings clients as the menubar. */
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
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
  const activePath = useRef<readonly string[]>([]);
  /** Updates native active-window ownership before publishing the browser view. @param path - Original active popup chain. @returns Nothing. */ function setPath(
    path: readonly string[],
  ): void {
    activePath.current = path;
    setOpenPath(path);
  }
  const highlighted = useRef(new WeakMap<HTMLElement, HTMLElement>());
  const highlightTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const closeTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const cancelTimers = useCallback(
    /** Stops timer work for a popup and all descendants. @param depth - First affected popup. @returns Nothing. */ (
      depth = 0,
    ): void => {
      for (const timers of [highlightTimers.current, closeTimers.current])
        for (const owner of timers.keys()) if (owner >= depth) stopTimer(timers, owner);
    },
    [],
  );
  const entryId = useId();
  const mark = useCallback(
    /** Records native selection independently of DOM focus. @param menu - Actual popup owner. @param item - Selected native entry. @returns Nothing. */ (
      menu: HTMLElement,
      item: HTMLElement,
    ): void => {
      /** Paints one actual native highlighted entry without transferring focus. @param owner - Native popup. @param entry - Original placement. @returns Nothing. */ function record(
        owner: HTMLElement,
        entry: HTMLElement,
      ): void {
        highlighted.current.get(owner)?.removeAttribute("data-popup-highlighted");
        highlighted.current.set(owner, entry);
        entry.dataset.popupHighlighted = "true";
        if (entry.id === "") entry.id = `${owner.id}-item-${entries(owner).indexOf(entry)}`;
        owner.setAttribute("aria-activedescendant", entry.id);
      }
      stopTimer(closeTimers.current, Number(menu.dataset.popupDepth));
      record(menu, item);
      const parent = menu.previousElementSibling as HTMLElement | null;
      if (parent !== null)
        record(parent.closest<HTMLElement>('[role="menu"]') as HTMLElement, parent);
    },
    [],
  );
  const highlight = useCallback(
    /** Keeps popup focus for disabled selection while retaining the enabled browser focus convention. @param menu - Original popup. @param item - Native highlighted entry. @returns Nothing. */ (
      menu: HTMLElement,
      item: HTMLElement,
    ): void => {
      mark(menu, item);
      if (item.hasAttribute("disabled")) menu.focus();
      else item.focus();
    },
    [mark],
  );
  const pendingChildFocus = useRef(false);
  const closeMenu = useCallback(
    /** Dismisses before restoring the connected previous owner; outside focus retains its new owner. @param restore - Whether to restore menu-owned focus. @returns Nothing. */ (
      restore = true,
    ) => {
      cancelTimers();
      onClose();
      if (restore && savedFocus.current?.isConnected)
        savedFocus.current.focus({ preventScroll: true });
    },
    [onClose, cancelTimers],
  );
  useLayoutEffect(
    /** Owns native timer shutdown across window/resource lifetimes. @returns Cleanup. */ () =>
      /** Prevents obsolete callbacks after unmount or resource replacement. @returns Nothing. */ () =>
        cancelTimers(),
    [items, cancelTimers],
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
    /** Selects the first selectable child with native SkipDisabledInMenus=false. @returns Nothing. */ () => {
      if (pendingChildFocus.current) {
        pendingChildFocus.current = false;
        const menu = (root.current as HTMLDivElement).querySelector<HTMLElement>(
          `[data-popup-depth="${openPath.length}"]`,
        );
        menu?.focus();
        const first = entries(menu).at(0);
        if (preselect.current && menu !== null && first !== undefined) highlight(menu, first);
        preselect.current = false;
      }
    },
    [openPath, highlight],
  );
  const preselect = useRef(false);
  /** Applies native HighlightChanged admission before creating a child window. @param item - Actual child resource. @param depth - Parent depth. @param trigger - Original parent entry. @param keyboard - Whether to select first child. @returns Nothing. */ function open(
    item: Extract<CommandMenuItemPlacement, { kind: "submenu" }>,
    depth: number,
    trigger: HTMLElement,
    keyboard = false,
  ): void {
    mark(trigger.closest<HTMLElement>('[role="menu"]') as HTMLElement, trigger);
    if (activePath.current[depth] === item.id) return;
    cancelTimers(depth + 1);
    if (item.items.length === 0) {
      pendingChildFocus.current = false;
      preselect.current = false;
      setPath(activePath.current.slice(0, depth));
      trigger.focus();
      return;
    }
    pendingChildFocus.current = true;
    preselect.current = keyboard;
    setPath([...activePath.current.slice(0, depth), item.id]);
  }
  /** Queues native HighlightChanged for the current selection after150ms. @param values - Actual popup resources. @param depth - Current menu depth. @param trigger - Actual pointer entry. @returns Nothing. */ function pointerSelect(
    values: readonly CommandMenuItemPlacement[],
    depth: number,
    trigger: HTMLElement,
  ): void {
    stopTimer(highlightTimers.current, depth);
    const menu = trigger.closest<HTMLElement>('[role="menu"]') as HTMLElement;
    mark(menu, trigger);
    if (
      trigger.dataset.popupTrigger !== undefined &&
      activePath.current[depth] === trigger.dataset.popupTrigger
    )
      return;
    highlightTimers.current.set(
      depth,
      setTimeout(
        /** Applies current native pointer admission after its delay. @returns Nothing. */ () => {
          highlightTimers.current.delete(depth);
          const selected = highlighted.current.get(menu);
          if (selected === undefined) return;
          const id = selected.dataset.popupTrigger;
          if (id === undefined) {
            cancelTimers(depth + 1);
            setPath(activePath.current.slice(0, depth));
          } else {
            const item = childResource(values, id);
            if (item !== undefined) open(item, depth, selected);
          }
        },
        150,
      ),
    );
  }
  /** Cancels unaccepted entry work; active child remains while its owning parent stays highlighted. @param depth - Current popup depth. @param trigger - Actual parent entry. @returns Nothing. */ function pointerLeave(
    depth: number,
    trigger: HTMLElement,
  ): void {
    const menu = trigger.closest<HTMLElement>('[role="menu"]') as HTMLElement;
    const selected = highlighted.current.get(menu);
    const ownsChild =
      activePath.current[depth] !== undefined &&
      selected?.dataset.popupTrigger === activePath.current[depth];
    if (activePath.current[depth] !== undefined && selected !== undefined && !ownsChild) {
      stopTimer(closeTimers.current, depth + 1);
      closeTimers.current.set(
        depth + 1,
        setTimeout(
          /** Closes a child whose parent highlight belongs elsewhere. @returns Nothing. */ () => {
            closeTimers.current.delete(depth + 1);
            cancelTimers(depth + 1);
            setPath(activePath.current.slice(0, depth));
          },
          150,
        ),
      );
    }
    if (!ownsChild) {
      selected?.removeAttribute("data-popup-highlighted");
      highlighted.current.delete(menu);
      menu.removeAttribute("aria-activedescendant");
    }
  }
  /** Returns direct selectable entries in original resource order, including disabled commands by native default. @param menu - Actual menu owner. @returns Direct entries. */ function entries(
    menu: HTMLElement | null,
  ): HTMLElement[] {
    return menu === null
      ? []
      : [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(
          /** Retains native selectable entries at this level. @param item - Entry. @returns Whether admitted. */ (
            item,
          ) => item.closest('[role="menu"]') === menu,
        );
  }
  /** Returns focus to the actual parent trigger while closing descendants. @param depth - Child depth. @param trigger - Actual owning parent button. @returns Nothing. */ function closeChild(
    depth: number,
    trigger: HTMLElement,
  ): void {
    cancelTimers(depth);
    setPath(activePath.current.slice(0, depth - 1));
    trigger.focus();
  }
  /** Routes menu input without invoking document shortcuts. @param event - Current menu keyboard input. @param depth - Native popup depth. @param values - Current native resource entries. @returns Nothing. */ function key(
    event: React.KeyboardEvent<HTMLDivElement>,
    depth: number,
    values: readonly CommandMenuItemPlacement[],
  ): void {
    event.stopPropagation();
    const target = event.target as HTMLElement,
      menu = event.currentTarget,
      list = entries(menu),
      selected = list.includes(target) ? target : highlighted.current.get(menu),
      index = list.indexOf(selected as HTMLElement);
    if (event.key === "Escape" || (event.key === "F6" && event.ctrlKey)) {
      event.preventDefault();
      if (depth === 0) closeMenu();
      else closeChild(depth, event.currentTarget.previousElementSibling as HTMLElement);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (depth > 0) closeChild(depth, event.currentTarget.previousElementSibling as HTMLElement);
    } else if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault();
      const id = selected?.dataset.popupTrigger;
      if (id !== undefined) {
        const item = childResource(values, id);
        if (item !== undefined)
          flushSync(
            /** Applies original child admission before its keyboard preselection. @returns Nothing. */ () =>
              open(item, depth, selected as HTMLElement, true),
          );
      } else if (event.key === "Enter") {
        if (selected === undefined || selected.hasAttribute("disabled")) {
          if (depth === 0) closeMenu();
          else closeChild(depth, event.currentTarget.previousElementSibling as HTMLElement);
        } else selected.click();
      }
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
      const item = list[(next + list.length) % list.length];
      if (item !== undefined) highlight(menu, item);
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
            <div
              key={item.commandId}
              onMouseEnter={
                /** Updates actual pointer selection without executing the command. @param event - Original command region. @returns Nothing. */ (
                  event,
                ) =>
                  pointerSelect(values, depth, event.currentTarget.firstElementChild as HTMLElement)
              }
              onMouseLeave={
                /** Releases actual command-region selection. @param event - Original region. @returns Nothing. */ (
                  event,
                ) => pointerLeave(depth, event.currentTarget.firstElementChild as HTMLElement)
              }
            >
              <BindingsMenuCommand
                closeMenu={closeMenu}
                commandSource={commandSource}
                getCommandResource={getCommandResource}
                item={item}
                key={item.commandId}
                resolveArguments={resolveArguments}
              />
            </div>
          );
        const expanded = openPath[depth] === item.id,
          label = getMenuLabel?.(item.id, item.label) ?? item.label;
        return (
          <div
            className="relative"
            key={item.id}
            onMouseEnter={
              /** Applies original child admission for pointer entry. @param event - Native parent region. @returns Nothing. */ (
                event,
              ) =>
                pointerSelect(values, depth, event.currentTarget.firstElementChild as HTMLElement)
            }
            onMouseLeave={
              /** Releases this child's pointer ownership. @param event - Actual parent popup region. @returns Nothing. */ (
                event,
              ) => {
                pointerLeave(depth, event.currentTarget.firstElementChild as HTMLElement);
              }
            }
          >
            <button
              aria-expanded={expanded}
              aria-haspopup="menu"
              className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
              data-popup-trigger={item.id}
              role="menuitem"
              onMouseDown={
                /** Native direct activation bypasses delay and preselects first child. @param event - Actual button input. @returns Nothing. */ (
                  event,
                ) => {
                  if (event.button === 0) {
                    event.preventDefault();
                    open(item, depth, event.currentTarget, true);
                  }
                }
              }
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
                id={`${entryId}-${depth + 1}`}
                onKeyDown={
                  /** Routes child keyboard input. @param event - Keyboard input. @returns Nothing. */ (
                    event,
                  ) => key(event, depth + 1, item.items)
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
    <div
      className="relative z-[60] [&_[data-popup-highlighted]]:bg-slate-100"
      onFocusCapture={
        /** Synchronizes browser focus with the owning native popup highlight. @param event - Actual focus event. @returns Nothing. */ (
          event,
        ) => {
          const target = event.target,
            menu = target.closest<HTMLElement>('[role="menu"]');
          if (menu !== null && target.matches('[role^="menuitem"]')) mark(menu, target);
        }
      }
      ref={root}
    >
      <CommandMenuPopup
        anchorPoint={position}
        aria-label={ariaLabel}
        data-popup-depth={0}
        id={`${entryId}-0`}
        onKeyDown={
          /** Routes root keyboard input. @param event - Keyboard input. @returns Nothing. */ (
            event,
          ) => key(event, 0, items)
        }
        role="menu"
      >
        {renderItems(items, 0)}
      </CommandMenuPopup>
    </div>
  );
}
/** Stops only the timer owned by one native popup. @param timers - Native timer category. @param owner - Popup depth. @returns Nothing. */
function stopTimer(timers: Map<number, ReturnType<typeof setTimeout>>, owner: number): void {
  clearTimeout(timers.get(owner));
  timers.delete(owner);
}
/** Resolves a child from the actual resource list shared by key and timer input. @param values - Current menu resources. @param id - Actual selected entry identity. @returns Original child, if present. */
function childResource(
  values: readonly CommandMenuItemPlacement[],
  id: string,
): Extract<CommandMenuItemPlacement, { kind: "submenu" }> | undefined {
  return values.find(
    /** Retains original native placement ownership. @param value - Resource entry. @returns Whether it owns the selected child. */ (
      value,
    ): value is Extract<CommandMenuItemPlacement, { kind: "submenu" }> =>
      value.kind === "submenu" && value.id === id,
  );
}
