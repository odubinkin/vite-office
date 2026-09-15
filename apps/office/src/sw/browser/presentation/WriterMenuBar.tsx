/** @fileoverview Renders upstream-derived Writer menu resources through one command-driven state machine. */
import { useEffect, useRef, useState } from "react";

import { writerMenuPlacements } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterMenuItemPlacement } from "../../uiconfig/swriter/ui-resource";
import type { WriterCommandSurfaceProps } from "./command-source";

/** Renders the supported menu resource. @param props - Shared command surface. @returns Accessible menu bar. */
export function WriterMenuBar({
  commandSource,
  resolveArguments,
}: WriterCommandSurfaceProps): React.JSX.Element {
  const [openMenuIndex, setOpenMenuIndex] = useState<number>();
  const [openSubmenuId, setOpenSubmenuId] = useState<string>();
  const [activeTriggerIndex, setActiveTriggerIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const typeahead = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingMenuFocus = useRef<"first" | "last" | "none">("none");
  const restoreTriggerFocus = useRef<number | undefined>(undefined);

  /** Closes all popups. @param restoreFocus - Whether to focus the trigger. @returns Nothing. */
  function closeMenu(restoreFocus = false): void {
    const index = openMenuIndex;
    setOpenSubmenuId(undefined);
    setOpenMenuIndex(undefined);
    if (restoreFocus && index !== undefined) restoreTriggerFocus.current = index;
  }

  /** Moves focus among enabled direct children. @param container - Active menu. @param direction - Requested move. @param current - Current item. @returns Nothing. */
  function focusMenuItem(
    container: HTMLElement,
    direction: "first" | "last" | "next" | "previous",
    current?: HTMLElement,
  ): void {
    const items = [...container.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(
      /** Retains enabled direct menu children. @param item - Menu item candidate. @returns Whether it belongs to this menu. */ (
        item,
      ) => !item.hasAttribute("disabled") && item.closest('[role="menu"]') === container,
    );
    /* v8 ignore next -- Every declared Writer menu contains an enabled or focusable item. */
    if (items.length === 0) return;
    const currentIndex = current === undefined ? -1 : items.indexOf(current);
    const index =
      direction === "first"
        ? 0
        : direction === "last"
          ? items.length - 1
          : direction === "next"
            ? (currentIndex + 1 + items.length) % items.length
            : (currentIndex - 1 + items.length) % items.length;
    items[index]?.focus();
  }

  /** Opens one popup. @param index - Menu index. @param focus - Initial focus. @returns Nothing. */
  function openMenu(index: number, focus: "first" | "last" | "none" = "none"): void {
    setActiveTriggerIndex(index);
    setOpenSubmenuId(undefined);
    pendingMenuFocus.current = focus;
    setOpenMenuIndex(index);
  }

  useEffect(
    /** Applies the requested initial focus after React mounts a popup. @returns Nothing. */
    function restoreRequestedMenuFocus(): void {
      if (openMenuIndex === undefined || pendingMenuFocus.current === "none") return;
      const menu = rootRef.current?.querySelector<HTMLElement>(
        `#writer-${writerMenuPlacements[openMenuIndex]?.id}-menu`,
      );
      if (menu !== null && menu !== undefined) focusMenuItem(menu, pendingMenuFocus.current);
      pendingMenuFocus.current = "none";
    },
    [openMenuIndex],
  );

  useEffect(
    /** Restores focus after React unmounts a closed popup. @returns Nothing. */
    function focusClosedMenuTrigger(): void {
      if (openMenuIndex !== undefined || restoreTriggerFocus.current === undefined) return;
      triggerRefs.current[restoreTriggerFocus.current]?.focus();
      restoreTriggerFocus.current = undefined;
    },
    [openMenuIndex],
  );

  useEffect(
    /** Focuses the first enabled item after a submenu mounts. @returns Nothing. */
    function focusOpenedSubmenu(): void {
      if (openSubmenuId === undefined) return;
      const submenu = rootRef.current?.querySelector<HTMLElement>(
        `[data-submenu="${openSubmenuId}"]`,
      );
      if (submenu !== null && submenu !== undefined) focusMenuItem(submenu, "first");
    },
    [openSubmenuId],
  );

  useEffect(
    /** Installs document-level outside-pointer dismissal. @returns Listener cleanup. */ function installOutsideDismissal(): () => void {
      /** Handles an outside pointer action. @param event - Document event. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        if (rootRef.current?.contains(event.target as Node) !== true) closeMenu();
      }
      document.addEventListener("pointerdown", dismiss);
      return /** Removes the outside-pointer listener. @returns Nothing. */ () =>
        document.removeEventListener("pointerdown", dismiss);
    },
  );

  /** Applies menubar keyboard navigation. @param event - Trigger event. @param index - Trigger index. @returns Nothing. */
  function handleTriggerKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + delta + writerMenuPlacements.length) % writerMenuPlacements.length;
      setActiveTriggerIndex(next);
      triggerRefs.current[next]?.focus();
      if (openMenuIndex !== undefined) openMenu(next, "first");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(index, event.key === "ArrowDown" ? "first" : "last");
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : writerMenuPlacements.length - 1;
      setActiveTriggerIndex(next);
      triggerRefs.current[next]?.focus();
    } else if (event.key === "Escape") closeMenu(true);
  }

  /** Applies popup keyboard navigation. @param event - Menu event. @param menuIndex - Owning menu index. @returns Nothing. */
  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLElement>, menuIndex: number): void {
    const target = event.target as HTMLElement;
    const menu = target.closest<HTMLElement>('[role="menu"]');
    /* v8 ignore next -- This handler is installed only on elements inside a rendered menu. */
    if (menu === null) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      target.click();
    } else if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      focusMenuItem(
        menu,
        event.key === "ArrowDown"
          ? "next"
          : event.key === "ArrowUp"
            ? "previous"
            : event.key === "Home"
              ? "first"
              : "last",
        target,
      );
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (menu.dataset.submenu !== undefined) {
        setOpenSubmenuId(undefined);
        menu.parentElement?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
      } else closeMenu(true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (target.getAttribute("aria-haspopup") === "menu") {
        target.click();
      } else openMenu((menuIndex + 1) % writerMenuPlacements.length, "first");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (menu.dataset.submenu !== undefined) {
        setOpenSubmenuId(undefined);
        menu.parentElement?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
      } else
        openMenu(
          (menuIndex - 1 + writerMenuPlacements.length) % writerMenuPlacements.length,
          "first",
        );
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      typeahead.current += event.key.toLocaleLowerCase();
      if (typeaheadTimer.current !== undefined) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(
        /** Clears the accumulated typeahead prefix. @returns Nothing. */ () => {
          typeahead.current = "";
        },
        500,
      );
      const candidates = [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(
        /** Retains enabled direct menu children for typeahead. @param item - Menu item candidate. @returns Whether it belongs to this menu. */ (
          item,
        ) => !item.hasAttribute("disabled") && item.closest('[role="menu"]') === menu,
      );
      const match = candidates.find(
        /** Matches the accumulated typeahead prefix. @param item - Menu item candidate. @returns Whether its label starts with the prefix. */ (
          item,
        ) => item.textContent?.trim().toLocaleLowerCase().startsWith(typeahead.current),
      );
      match?.focus();
    }
  }

  /** Renders resource items recursively. @param items - Resource items. @param menuIndex - Owning menu index. @returns Rendered items. */
  function renderItems(
    items: readonly WriterMenuItemPlacement[],
    menuIndex: number,
  ): React.ReactNode {
    return items.map(
      /** Renders one recursive menu resource item. @param item - Resource item. @param index - Stable resource index. @returns Menu element or null. */ (
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
        if (item.kind === "unavailable")
          return (
            <span className="block px-3 py-2 text-sm text-slate-400" key={`unavailable-${index}`}>
              {item.label}
            </span>
          );
        if (item.kind === "submenu") {
          const isOpen = openSubmenuId === item.id;
          return (
            <div className="relative" key={item.id}>
              <button
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                onClick={
                  /** Toggles this submenu. @returns Nothing. */ () =>
                    setOpenSubmenuId(isOpen ? undefined : item.id)
                }
                role="menuitem"
                tabIndex={-1}
                type="button"
              >
                {item.label}
                <span aria-hidden="true">›</span>
              </button>
              {isOpen ? (
                <div
                  aria-label={`${item.label} menu`}
                  className="absolute left-full top-0 z-30 ml-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                  data-submenu={item.id}
                  onKeyDown={
                    /** Routes submenu keyboard input. @param event - Menu keyboard event. @returns Nothing. */ (
                      event,
                    ) => handleMenuKeyDown(event, menuIndex)
                  }
                  role="menu"
                >
                  {renderItems(item.items, menuIndex)}
                </div>
              ) : null}
            </div>
          );
        }
        const command = commandSource.QueryCommand(item.commandId);
        /* v8 ignore next -- Resource/registry consistency is validated before presentation. */
        if (command === undefined) return null;
        const state = commandSource.QueryState(item.commandId);
        const role = command.presentation?.semantics === "check" ? "menuitemcheckbox" : "menuitem";
        const label = `${command.label}${item.showsDialog === true ? "…" : ""}`;
        return (
          <button
            aria-checked={role === "menuitemcheckbox" ? state.checked === true : undefined}
            aria-current={
              command.presentation?.semantics === "radio" && state.checked === true
                ? "true"
                : undefined
            }
            aria-keyshortcuts={command.shortcut}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!state.enabled}
            key={item.commandId}
            onClick={
              /** Dispatches this command and dismisses the popup. @returns Nothing. */ () => {
                commandSource.Execute(item.commandId, resolveArguments(item.commandId));
                closeMenu();
              }
            }
            role={role}
            tabIndex={-1}
            title={state.error}
            type="button"
          >
            {label}
          </button>
        );
      },
    );
  }

  return (
    <div
      aria-label="Writer menu bar"
      className="flex items-center gap-1"
      ref={rootRef}
      role="menubar"
    >
      {writerMenuPlacements.map(
        /** Renders one top-level menu resource. @param menu - Menu placement. @param index - Menu index. @returns Menubar entry. */ (
          menu,
          index,
        ) => (
          <div className="relative" key={menu.id}>
            <button
              aria-controls={`writer-${menu.id}-menu`}
              aria-expanded={openMenuIndex === index}
              aria-haspopup="menu"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={
                /** Toggles this top-level menu. @returns Nothing. */ () =>
                  openMenuIndex === index ? closeMenu() : openMenu(index)
              }
              onFocus={
                /** Activates this trigger for roving tabindex. @returns Nothing. */ () =>
                  setActiveTriggerIndex(index)
              }
              onKeyDown={
                /** Routes top-level keyboard input. @param event - Trigger keyboard event. @returns Nothing. */ (
                  event,
                ) => handleTriggerKeyDown(event, index)
              }
              ref={
                /** Retains a trigger for focus movement. @param element - Mounted trigger or null. @returns Nothing. */ (
                  element,
                ) => {
                  triggerRefs.current[index] = element;
                }
              }
              tabIndex={index === activeTriggerIndex ? 0 : -1}
              type="button"
            >
              {menu.label}
            </button>
            {openMenuIndex === index ? (
              <div
                aria-label={`${menu.label} menu`}
                className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                id={`writer-${menu.id}-menu`}
                onKeyDown={
                  /** Routes popup keyboard input. @param event - Menu keyboard event. @returns Nothing. */ (
                    event,
                  ) => handleMenuKeyDown(event, index)
                }
                role="menu"
              >
                {renderItems(menu.items, index)}
              </div>
            ) : null}
          </div>
        ),
      )}
    </div>
  );
}
