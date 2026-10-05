/** @fileoverview Renders generated menu resources through one reusable command-driven state machine. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

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
  readonly focusDocument?: () => void;
  readonly getCommandResource: (commandUrl: string) => MenuCommandResource;
  readonly getMenuLabel?: (id: string, fallback: string) => string;
  readonly idPrefix: string;
  readonly isInputEnabled?: boolean;
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
  focusDocument,
  getCommandResource,
  getMenuLabel = useFallbackMenuLabel,
  idPrefix,
  isInputEnabled = false,
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
  const pendingMenuPreselection = useRef<boolean | undefined>(undefined);
  const preselectSubmenuFirst = useRef(false);
  const savedFocus = useRef<HTMLElement | undefined>(undefined);
  const menuActive = useRef(false);

  /** Retains one external owner for the active menu cycle. @param target - Previous focus target. @returns Nothing. */
  function saveFocus(target: EventTarget | null): void {
    if (
      savedFocus.current === undefined &&
      target instanceof HTMLElement &&
      target !== document.body &&
      target.isConnected &&
      rootRef.current?.contains(target) !== true
    )
      savedFocus.current = target;
  }

  /** Closes all popups before restoring the saved owner. @param restoreFocus - Whether focus still belongs to this menu cycle. @param defaultToDocument - Whether menubar deactivation permits frame-client fallback. @returns Nothing. */
  function closeMenu(restoreFocus = true, defaultToDocument = false): void {
    const index = openMenuIndex;
    const previousFocus = savedFocus.current;
    savedFocus.current = undefined;
    menuActive.current = false;
    pendingMenuPreselection.current = undefined;
    setOpenSubmenuId(undefined);
    setOpenMenuIndex(undefined);
    if (restoreFocus) {
      if (previousFocus?.isConnected === true) previousFocus.focus();
      else if (defaultToDocument && focusDocument !== undefined) focusDocument();
      else if (index !== undefined) triggerRefs.current[index]?.focus();
    }
  }

  /** Opens a child popup with origin-specific preselection. @param id - Submenu identity. @param preSelectFirst - Whether keyboard opening requests its first item. @returns Nothing. */
  function openSubmenu(id: string | undefined, preSelectFirst: boolean): void {
    preselectSubmenuFirst.current = preSelectFirst;
    setOpenSubmenuId(id);
  }

  /** Closes the current popup and restores its parent focus. @param menu - Current popup. @returns Nothing. */
  function closePopup(menu: HTMLElement): void {
    if (menu.dataset.submenu !== undefined) {
      setOpenSubmenuId(undefined);
      menu.parentElement?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
    } else closeMenu(true);
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
            : ((currentIndex < 0 ? 0 : currentIndex) - 1 + items.length) % items.length;
    items[index]?.focus();
  }

  /** Opens one popup with origin-specific preselection. @param index - Menu index. @param preSelectFirst - Whether keyboard opening requests its first item. @returns Nothing. */
  function openMenu(index: number, preSelectFirst = false): void {
    if (openMenuIndex === index) return;
    saveFocus(document.activeElement);
    menuActive.current = true;
    setActiveTriggerIndex(index);
    setOpenSubmenuId(undefined);
    pendingMenuPreselection.current = preSelectFirst;
    setOpenMenuIndex(index);
  }

  useEffect(
    /** Applies the requested initial focus after React mounts a popup. @returns Nothing. */
    function restoreRequestedMenuFocus(): void {
      if (openMenuIndex === undefined || pendingMenuPreselection.current === undefined) return;
      const menu = rootRef.current?.querySelector<HTMLElement>(
        `#${idPrefix}-${menus[openMenuIndex]?.id}-menu`,
      );
      if (menu !== null && menu !== undefined) {
        if (pendingMenuPreselection.current) focusMenuItem(menu, "first");
        else menu.focus();
      }
      pendingMenuPreselection.current = undefined;
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
    /** Focuses a mounted popup and preselects its first item only for keyboard opening. @returns Nothing. */
    function focusOpenedSubmenu(): void {
      if (openSubmenuId === undefined) return;
      const submenu = rootRef.current?.querySelector<HTMLElement>(
        `[data-submenu="${openSubmenuId}"]`,
      );
      if (submenu !== null && submenu !== undefined) {
        if (preselectSubmenuFirst.current) focusMenuItem(submenu, "first");
        else submenu.focus();
      }
    },
    [openSubmenuId],
  );

  useEffect(
    /** Routes an unmodified menu key only for the eligible frame. @returns Listener cleanup. */
    function installMenuKey(): () => void {
      /** Activates the first root or deactivates its current cycle. @param event - Browser key. @returns Nothing. */
      function handleMenuKey(event: KeyboardEvent): void {
        if (
          !isInputEnabled ||
          event.defaultPrevented ||
          event.key !== "F10" ||
          event.shiftKey ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey
        )
          return;
        const first = triggerRefs.current[0];
        if (!first) return;
        event.preventDefault();
        if (menuActive.current) closeMenu(true, openMenuIndex === undefined);
        else {
          saveFocus(document.activeElement);
          menuActive.current = true;
          setActiveTriggerIndex(0);
          first.focus();
        }
      }
      window.addEventListener("keydown", handleMenuKey);
      return /** Removes this frame's menu-key route. @returns Nothing. */ () =>
        window.removeEventListener("keydown", handleMenuKey);
    },
  );

  useEffect(
    /** Installs document-level outside-pointer dismissal. @returns Listener cleanup. */ function installOutsideDismissal(): () => void {
      /** Handles an outside pointer action. @param event - Document event. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        if (rootRef.current?.contains(event.target as Node) !== true)
          closeMenu(rootRef.current?.contains(document.activeElement) === true);
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
    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      menuActive.current = true;
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? menus.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + menus.length) % menus.length;
      setActiveTriggerIndex(next);
      triggerRefs.current[next]?.focus();
      if (openMenuIndex !== undefined) openMenu(next, true);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(index, true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (openMenuIndex === index) closeMenu(true);
      else openMenu(index, true);
    } else if (event.key === "Escape") closeMenu(true, openMenuIndex === undefined);
  }

  /** Applies popup keyboard navigation. @param event - Menu event. @param menuIndex - Owning menu index. @returns Nothing. */
  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLElement>, menuIndex: number): void {
    const target = event.target as HTMLElement;
    const menu = target.closest<HTMLElement>('[role="menu"]');
    /* v8 ignore next -- This handler is installed only on elements inside a rendered menu. */
    if (menu === null) return;
    if (menu !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (target === menu) closePopup(menu);
      else if (target.getAttribute("aria-haspopup") === "menu")
        openSubmenu(target.dataset.submenuTrigger, true);
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
      closePopup(menu);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (target.getAttribute("aria-haspopup") === "menu") {
        openSubmenu(target.dataset.submenuTrigger, true);
      } else openMenu((menuIndex + 1) % menus.length, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (menu.dataset.submenu !== undefined) closePopup(menu);
      else openMenu((menuIndex - 1 + menus.length) % menus.length, true);
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
                  openSubmenu(item.id, false)
              }
              onMouseLeave={
                /** Closes this submenu and restores parent focus after the pointer leaves. @param event - Submenu region event. @returns Nothing. */ (
                  event,
                ) => {
                  if (openSubmenuId === item.id)
                    closePopup(event.currentTarget.lastElementChild as HTMLElement);
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
                <CommandMenuPopup
                  aria-label={`${label} menu`}
                  data-submenu={item.id}
                  onKeyDown={
                    /** Routes submenu keyboard input. @param event - Menu keyboard event. @returns Nothing. */ (
                      event,
                    ) => handleMenuKeyDown(event, menuIndex)
                  }
                  role="menu"
                  submenu
                >
                  {renderItems(item.items, menuIndex)}
                </CommandMenuPopup>
              ) : null}
            </div>
          );
        }
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
    <div
      aria-label={ariaLabel}
      className="flex items-center gap-1"
      onBlurCapture={
        /** Cancels a cycle after focus transfers outside without restoring it. @param event - Focus transfer. @returns Nothing. */ (
          event,
        ) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeMenu(false);
        }
      }
      onFocusCapture={
        /** Saves the external owner before trigger focus activates the menubar. @param event - Focus entry. @returns Nothing. */ (
          event,
        ) => {
          saveFocus(event.relatedTarget);
          if (!event.currentTarget.contains(event.relatedTarget)) menuActive.current = true;
        }
      }
      ref={rootRef}
      role="menubar"
    >
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
                <CommandMenuPopup
                  aria-label={`${label} menu`}
                  id={`${idPrefix}-${menu.id}-menu`}
                  onKeyDown={
                    /** Routes popup keyboard input. @param event - Menu keyboard event. @returns Nothing. */ (
                      event,
                    ) => handleMenuKeyDown(event, index)
                  }
                  role="menu"
                >
                  {renderItems(menu.items, index)}
                </CommandMenuPopup>
              ) : null}
            </div>
          );
        },
      )}
    </div>
  );
}

/** Keeps an owned popup anchored and scrollable within the available viewport. @param props - Menu attributes and placement direction. @returns Floating menu. */
function CommandMenuPopup({
  submenu = false,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement> & { submenu?: boolean }>): React.JSX.Element {
  const popupRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    /** Tracks viewport and ancestor scrolling while the popup is mounted. @returns Listener cleanup. */ () => {
      const popup = popupRef.current as HTMLDivElement;
      const anchor = popup.previousElementSibling as HTMLElement;
      /** Places the popup without scrolling or resizing the document. @returns Nothing. */
      function updatePosition(): void {
        const rect = anchor.getBoundingClientRect();
        const margin = 8;
        const gap = 4;
        popup.style.maxWidth = `${Math.max(0, window.innerWidth - 2 * margin)}px`;
        const below = window.innerHeight - rect.bottom - gap - margin;
        const above = rect.top - gap - margin;
        const placeAbove = !submenu && popup.scrollHeight > below && above > below;
        const maxHeight = Math.max(
          0,
          submenu ? window.innerHeight - 2 * margin : placeAbove ? above : below,
        );
        const height = Math.min(popup.scrollHeight + 2, maxHeight);
        const top = submenu
          ? Math.max(margin, Math.min(rect.top, window.innerHeight - margin - height))
          : placeAbove
            ? rect.top - gap - height
            : rect.bottom + gap;
        let left = submenu ? rect.right + gap : rect.left;
        if (submenu && left + popup.offsetWidth > window.innerWidth - margin)
          left = rect.left - gap - popup.offsetWidth;
        popup.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - margin - popup.offsetWidth))}px`;
        popup.style.top = `${top}px`;
        popup.style.maxHeight = `${maxHeight}px`;
      }
      updatePosition();
      window.addEventListener("resize", updatePosition);
      document.addEventListener("scroll", updatePosition, true);
      return /** Releases geometry listeners after dismissal. @returns Nothing. */ () => {
        window.removeEventListener("resize", updatePosition);
        document.removeEventListener("scroll", updatePosition, true);
      };
    },
    [submenu],
  );
  return (
    <div
      {...props}
      className={`fixed ${submenu ? "z-30" : "z-20"} w-56 overscroll-contain overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg`}
      ref={popupRef}
      tabIndex={-1}
    />
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
        /** Unmounts the popup and restores focus before dispatching this command. @returns Nothing. */ () => {
          flushSync(closeMenu);
          commandSource.Execute(item.commandId, resolveArguments(item.commandId));
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
