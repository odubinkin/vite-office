/** @fileoverview Renders generated menu resources through one reusable command-driven state machine. */
import { useEffect, useRef, useState } from "react";

import { type BrowserCommandSurfaceProps, useBrowserCommandPresentation } from "./command-surface";

/** Command resource fields consumed by an accessible menu item. */
export interface MenuCommandResource {
  readonly label: string;
  readonly semantics: "action" | "check" | "radio";
  readonly shortcuts: readonly string[];
}

/** Generic recursive generated menu placement. */
export type CommandMenuItemPlacement =
  | Readonly<{ commandId: string; kind: "command"; showsDialog?: boolean }>
  | Readonly<{ kind: "separator" }>
  | Readonly<{
      id: string;
      items: readonly CommandMenuItemPlacement[];
      kind: "submenu";
      label: string;
    }>;

/** Generic generated top-level menu placement. */
export interface CommandMenuPlacement {
  readonly id: string;
  readonly items: readonly CommandMenuItemPlacement[];
  readonly label: string;
}

/** Inputs for one shared generated-resource menubar presenter. */
export interface CommandMenuBarProps extends BrowserCommandSurfaceProps {
  readonly ariaLabel: string;
  readonly getCommandResource: (commandUrl: string) => MenuCommandResource;
  readonly getMenuLabel?: (id: string, fallback: string) => string;
  readonly idPrefix: string;
  readonly menus: readonly CommandMenuPlacement[];
}

/** Returns a generated fallback menu label unchanged. @param _id - Stable menu identity. @param fallback - Generated label. @returns Generated label. */
function useFallbackMenuLabel(_id: string, fallback: string): string {
  return fallback;
}

/** Renders the supported menu resource. @param props - Shared command surface. @returns Accessible menu bar. */
export function CommandMenuBar({
  ariaLabel,
  commandSource,
  getCommandResource,
  getMenuLabel = useFallbackMenuLabel,
  idPrefix,
  menus,
  resolveArguments,
}: CommandMenuBarProps): React.JSX.Element {
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
        `#${idPrefix}-${menus[openMenuIndex]?.id}-menu`,
      );
      if (menu !== null && menu !== undefined) focusMenuItem(menu, pendingMenuFocus.current);
      pendingMenuFocus.current = "none";
    },
    [idPrefix, menus, openMenuIndex],
  );

  useEffect(
    /** Clears the typeahead timer when the menubar unmounts. @returns Timer cleanup. */ function clearTypeaheadOnUnmount(): () => void {
      return /** Clears the retained timeout. @returns Nothing. */ () => {
        if (typeaheadTimer.current !== undefined) clearTimeout(typeaheadTimer.current);
      };
    },
    [],
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
      const next = (index + delta + menus.length) % menus.length;
      setActiveTriggerIndex(next);
      triggerRefs.current[next]?.focus();
      if (openMenuIndex !== undefined) openMenu(next, "first");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(index, event.key === "ArrowDown" ? "first" : "last");
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : menus.length - 1;
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
      if (target.getAttribute("aria-haspopup") === "menu")
        setOpenSubmenuId(target.dataset.submenuTrigger);
      else target.click();
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
        setOpenSubmenuId(target.dataset.submenuTrigger);
      } else openMenu((menuIndex + 1) % menus.length, "first");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (menu.dataset.submenu !== undefined) {
        setOpenSubmenuId(undefined);
        menu.parentElement?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
      } else openMenu((menuIndex - 1 + menus.length) % menus.length, "first");
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
    items: readonly CommandMenuItemPlacement[],
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
        if (item.kind === "submenu") {
          const isOpen = openSubmenuId === item.id;
          const label = getMenuLabel(item.id, item.label);
          return (
            <div
              className="relative"
              key={item.id}
              onMouseEnter={
                /** Opens this submenu while the pointer is inside its trigger region. @returns Nothing. */ () =>
                  setOpenSubmenuId(item.id)
              }
              onMouseLeave={
                /** Closes this submenu after the pointer leaves its trigger and popup region. @returns Nothing. */ () => {
                  if (openSubmenuId === item.id) setOpenSubmenuId(undefined);
                }
              }
            >
              <button
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                data-submenu-trigger={item.id}
                role="menuitem"
                tabIndex={-1}
                type="button"
              >
                <span aria-hidden="true" className="w-2.5 shrink-0" />
                <span>{label}</span>
                <span aria-hidden="true" className="ml-auto">
                  ›
                </span>
              </button>
              {isOpen ? (
                <div
                  aria-label={`${label} menu`}
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
      },
    );
  }

  return (
    <div aria-label={ariaLabel} className="flex items-center gap-1" ref={rootRef} role="menubar">
      {menus.map(
        /** Renders one top-level menu resource. @param menu - Menu placement. @param index - Menu index. @returns Menubar entry. */ (
          menu,
          index,
        ) => {
          const label = getMenuLabel(menu.id, menu.label);
          return (
            <div className="relative" key={menu.id}>
              <button
                aria-controls={`${idPrefix}-${menu.id}-menu`}
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
                onMouseEnter={
                  /** Switches to a neighboring menu after the menubar has been opened. @returns Nothing. */ () => {
                    if (openMenuIndex !== undefined && openMenuIndex !== index) openMenu(index);
                  }
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
                {label}
              </button>
              {openMenuIndex === index ? (
                <div
                  aria-label={`${label} menu`}
                  className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                  id={`${idPrefix}-${menu.id}-menu`}
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
          );
        },
      )}
    </div>
  );
}

/** Renders one menu command through a persistent slot controller item. @param props - Command/menu inputs. @returns Bindings-backed menu item. */
function BindingsMenuCommand({
  closeMenu,
  commandSource,
  getCommandResource,
  item,
  resolveArguments,
}: Readonly<{
  closeMenu: () => void;
  commandSource: BrowserCommandSurfaceProps["commandSource"];
  getCommandResource: CommandMenuBarProps["getCommandResource"];
  item: Extract<CommandMenuItemPlacement, { kind: "command" }>;
  resolveArguments: BrowserCommandSurfaceProps["resolveArguments"];
}>): React.JSX.Element {
  const presentation = useBrowserCommandPresentation(
    commandSource,
    item.commandId,
    getCommandResource,
  );
  const resource = presentation.resource;
  const role =
    resource.semantics === "check"
      ? "menuitemcheckbox"
      : resource.semantics === "radio"
        ? "menuitemradio"
        : "menuitem";
  const isCheckable = role !== "menuitem";
  const isChecked = presentation.checked;
  const label = `${resource.label}${item.showsDialog === true ? "…" : ""}`;
  return (
    <button
      aria-checked={isCheckable ? isChecked : undefined}
      aria-keyshortcuts={resource.shortcuts[0]}
      className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
      disabled={!presentation.enabled}
      onClick={
        /** Dispatches this command and dismisses the popup. @returns Nothing. */ () => {
          commandSource.Execute(item.commandId, resolveArguments(item.commandId));
          closeMenu();
        }
      }
      role={role}
      tabIndex={-1}
      title={presentation.error}
      type="button"
    >
      <span
        aria-hidden="true"
        className="flex w-2.5 shrink-0 justify-center font-semibold"
        data-menu-checkmark="true"
      >
        {isCheckable && isChecked ? "✓" : null}
      </span>
      <span>{label}</span>
      {resource.shortcuts[0] === undefined ? null : (
        <span aria-hidden="true" className="ml-auto pl-4 text-xs text-slate-500">
          {resource.shortcuts[0]}
        </span>
      )}
    </button>
  );
}
