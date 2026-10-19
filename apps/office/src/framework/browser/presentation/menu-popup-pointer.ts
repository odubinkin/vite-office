/** @fileoverview Browser binding of original MenuFloatingWindow pointer highlight/admission and submenu-close timers over actual owned popup DOM. */
/** Original ImplMouseData::mnMenuDelay default from vcl/source/app/settings.cxx;platform settings plumbing remains separate. */
export const DEFAULT_MENU_DELAY = 150;
/** Original popup resource admission and parent closure bound to React mounting. */
export interface MenuPopupPointerOwner {
  /** Admits the actual highlighted resource. */
  readonly commit: (entry: HTMLElement) => void;
  /** Requests parent-owned closure of the actual child popup. */
  readonly close: (popup: HTMLElement) => void;
}
/** Mounted popup windows,corresponding to actual active child window ownership. */
const popupWindows = new WeakMap<HTMLElement, MenuPopupPointer>();
/** Preserves original pointer-only MenuFloatingWindow state transitions;React continues to own resources,commands,focus and popup mounting. */
export class MenuPopupPointer {
  /** Original bIgnoreFirstMove initialization. */
  private bIgnoreFirstMove = true;
  /** Original one-shot highlight admission timer. */
  private aHighlightChangedTimer: ReturnType<typeof setTimeout> | undefined;
  /** Original one-shot timer requesting the parent to close this child. */
  private aSubmenuCloseTimer: ReturnType<typeof setTimeout> | undefined;
  /** Bound original motion listener. */
  private readonly onMove: (event: MouseEvent) => void;
  /** Bound original window leave listener. */
  private readonly onLeave: (event: MouseEvent) => void;
  /** Borrows actual popup and original resource/focus callbacks. @param popup - Mounted native popup projection. @param commit - Original HighlightChanged resource admission. @param close - Original parent KillActivePopup binding. @returns Popup lifetime owner. */
  constructor(
    private readonly popup: HTMLElement,
    private readonly commit: (entry: HTMLElement) => void,
    private readonly close: (popup: HTMLElement) => void,
  ) {
    this.onMove = this.MouseMove.bind(this);
    this.onLeave = this.MouseLeave.bind(this);
    popupWindows.set(popup, this);
    popup.addEventListener("mousemove", this.onMove);
    popup.addEventListener("mouseout", this.onLeave);
  }
  /** Finds the real active child window while excluding deeper descendants. @returns Mounted direct child popup,if any. */
  private activePopup(): HTMLElement | undefined {
    return [...this.popup.querySelectorAll<HTMLElement>('[role="menu"]')].find(
      /** Selects this original window's direct active popup. @param child - Mounted popup. @returns Whether directly owned. */
      (child) => (child.parentElement as HTMLElement).closest('[role="menu"]') === this.popup,
    );
  }
  /** Admits real movement only;browser enter events alone do not invoke this handler and child events belong to their own windows. @param event - Original window-relative movement. @returns Nothing. */
  private MouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('[role="menu"]') !== this.popup) return;
    clearTimeout(this.aSubmenuCloseTimer);
    if (this.bIgnoreFirstMove) {
      this.bIgnoreFirstMove = false;
      return;
    }
    const entry = target.closest<HTMLElement>('[role^="menuitem"]') ?? undefined;
    if (entry !== selectedMenuItem(this.popup)) this.ChangeHighlightItem(entry, true);
  }
  /** Binds separate native window leave to DOM mouseout,including crossing into a nested fixed popup. @param event - Original leave event. @returns Nothing. */
  private MouseLeave(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('[role="menu"]') !== this.popup) return;
    if (
      event.relatedTarget instanceof Element &&
      event.relatedTarget.closest('[role="menu"]') === this.popup
    )
      return;
    const active = this.activePopup(),
      selected = selectedMenuItem(this.popup);
    const differentChild =
      selected !== undefined && selected.dataset.submenuTrigger !== active?.dataset.submenu;
    if (active !== undefined && differentChild)
      (popupWindows.get(active) as MenuPopupPointer).StartSubmenuClose();
    if (active === undefined || differentChild) this.ChangeHighlightItem(undefined, false);
  }
  /** Preserves ChangeHighlightItem ordering:stop close timer,publish actual selection,and optionally start highlight admission. @param entry - Original selectable entry or invalid position. @param startTimer - Original bStartPopupTimer. @returns Nothing. */
  private ChangeHighlightItem(entry: HTMLElement | undefined, startTimer: boolean): void {
    clearTimeout(this.aSubmenuCloseTimer);
    if (entry === undefined) {
      selectedMenuItem(this.popup)?.removeAttribute("data-popup-highlighted");
      this.popup.removeAttribute("aria-activedescendant");
    } else markMenuItem(this.popup, entry);
    if (startTimer) {
      clearTimeout(this.aHighlightChangedTimer);
      this.aHighlightChangedTimer = setTimeout(
        /** Reads current selection at expiry,including invalid selection after leave. @returns Nothing. */
        () => this.HighlightChanged(),
        DEFAULT_MENU_DELAY,
      );
    }
  }
  /** Uses the current actual highlighted entry,retaining the original invalid-entry early return. @returns Nothing. */
  private HighlightChanged(): void {
    const entry = selectedMenuItem(this.popup);
    if (entry !== undefined) this.commit(entry);
  }
  /** Starts the child's original delayed parent-close request. @returns Nothing. */
  private StartSubmenuClose(): void {
    clearTimeout(this.aSubmenuCloseTimer);
    this.aSubmenuCloseTimer = setTimeout(
      /** Requests only the original parent-owned child closure. @returns Nothing. */
      () => {
        const parent = (this.popup.parentElement as HTMLElement).closest(
          '[role="menu"]',
        ) as HTMLElement;
        (popupWindows.get(parent) as MenuPopupPointer).close(this.popup);
      },
      DEFAULT_MENU_DELAY,
    );
  }
  /** Mirrors original timer destruction and releases browser listeners with window lifetime. @returns Nothing. */
  dispose(): void {
    clearTimeout(this.aHighlightChangedTimer);
    clearTimeout(this.aSubmenuCloseTimer);
    this.popup.removeEventListener("mousemove", this.onMove);
    this.popup.removeEventListener("mouseout", this.onLeave);
    popupWindows.delete(this.popup);
  }
}

/** Reads selected direct entries independently of HTML disabled focus. @param container - Actual popup owner. @returns Selected native entry, if present. */
export function selectedMenuItem(container: HTMLElement): HTMLElement | undefined {
  return [...container.querySelectorAll<HTMLElement>("[data-popup-highlighted]")].find(
    /** Retains this popup's original highlighted placement. @param item - Actual entry. @returns Whether owned here. */
    (item) => item.closest('[role="menu"]') === container,
  );
}

/** Publishes selection over the existing popup DOM without changing native command state. @param container - Actual popup. @param item - Original entry. @returns Nothing. */
export function markMenuItem(container: HTMLElement, item: HTMLElement): void {
  selectedMenuItem(container)?.removeAttribute("data-popup-highlighted");
  item.dataset.popupHighlighted = "true";
  if (item.id === "") {
    const entries = [...container.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(
      /** Reads direct original placement order. @param entry - Actual entry. @returns Whether owned here. */
      (entry) => entry.closest('[role="menu"]') === container,
    );
    item.id = `${container.id}-item-${entries.indexOf(item)}`;
  }
  container.setAttribute("aria-activedescendant", item.id);
}
