/** @fileoverview Owns the implemented Sidebar panel focus order and registration lifetime. */
import { createContext } from "react";

/** Supplies a mounted titled panel and its native expanded-title focus operation. */
export interface SidebarFocusPanel {
  readonly element: HTMLElement;
  readonly focusTitle: () => void;
}

/** Adapts Sfx2 panel registration and indexed traversal to owned DOM controls. */
export class SidebarFocusManager {
  private readonly panels = new Map<HTMLElement, SidebarFocusPanel>();
  private focusDeckTitle!: () => void;
  private focusButton!: () => void;
  private openDeck!: () => void;
  private showPanel: ((panel: HTMLElement) => void) | undefined;

  /** Binds this deck's toolbox, activation rail and ShowPanel operation.
   * @param focusDeckTitle - Focuses the existing deck toolbox without activation.
   * @param focusButton - Focuses the implemented activation button.
   * @param openDeck - Opens the owning deck before browser title focus.
   * @param showPanel - Adjusts the owned viewport after expansion and title focus.
   * @returns Nothing.
   */
  SetDeck(
    focusDeckTitle: () => void,
    focusButton: () => void,
    openDeck: () => void,
    showPanel?: (panel: HTMLElement) => void,
  ): void {
    this.focusDeckTitle = focusDeckTitle;
    this.focusButton = focusButton;
    this.openDeck = openDeck;
    this.showPanel = showPanel;
  }

  /** Focuses the mounted deck toolbox without activating it. @returns Nothing. */
  FocusDeckTitle(): void {
    this.focusDeckTitle();
  }

  /** Focuses the implemented activation button without dispatch. @returns Nothing. */
  FocusButton(): void {
    this.focusButton();
  }

  /** Registers one mounted panel and returns its listener-lifetime cleanup.
   * @param panel - Owned panel root and expanded-title operation.
   * @returns Unregistration callback.
   */
  RegisterPanel(panel: SidebarFocusPanel): () => void {
    this.panels.set(panel.element, panel);
    return /** Releases the mounted panel listener ownership. @returns Nothing. */ () => {
      this.panels.delete(panel.element);
    };
  }

  /** Resolves source panel order from the actual rendered deck.
   * @returns Mounted panels in display order.
   */
  private GetPanels(): SidebarFocusPanel[] {
    return [...this.panels.values()].sort(
      /** Compares owned sibling positions after keyed React reordering.
       * @param left - First panel.
       * @param right - Second panel.
       * @returns Display ordering.
       */
      (left, right) =>
        left.element.compareDocumentPosition(right.element) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
    );
  }

  /** Resolves a mounted panel's native focus-location index in actual display order.
   * @param element - Registered owning panel root.
   * @returns Display index.
   */
  GetPanelIndex(element: HTMLElement): number {
    return this.GetPanels().findIndex(
      /** Locates the owning registered panel. @param panel - Mounted panel. @returns Ownership match. */
      (panel) => panel.element === element,
    );
  }

  /** Enters an indexed expanded panel, with the native invalid-index fallback.
   * @param index - Panel display index.
   * @param fallbackToDeckTitle - Whether a missing index returns to the toolbox.
   * @returns Nothing.
   */
  FocusPanel(index: number, fallbackToDeckTitle: boolean): void {
    const panel = this.GetPanels()[index];
    if (panel === undefined) {
      if (fallbackToDeckTitle) this.FocusDeckTitle();
      return;
    }
    this.openDeck();
    panel.focusTitle();
    this.showPanel?.(panel.element);
  }

  /** Moves between panel titles and the existing deck/rail boundaries.
   * @param element - Registered panel receiving the title or toolbar key.
   * @param direction - Native backward or forward panel traversal.
   * @returns Nothing.
   */
  MovePanel(element: HTMLElement, direction: -1 | 1): void {
    const index = this.GetPanelIndex(element);
    if (direction < 0) {
      if (index > 0) this.FocusPanel(index - 1, true);
      else this.FocusDeckTitle();
    } else if (index < this.panels.size - 1) this.FocusPanel(index + 1, false);
    else this.FocusButton();
  }
}

/** Makes focus ownership available only within the current mounted deck. */
export const SidebarFocusContext = createContext<SidebarFocusManager | undefined>(undefined);
