/** @fileoverview Implements the bounded Writer view-option owner from `sw/inc/viewopt.hxx`. */

/** View-local visibility flags consumed by SwView and browser presentation. */
export class SwViewOption {
  private horizontalRulerVisible = true;
  private verticalRulerVisible = true;
  private sidebarVisible = true;
  private statusBarVisible = true;

  /** Creates view options with one bindings invalidation callback. @param changed - State-change callback. @returns Nothing. */
  public constructor(private readonly changed: () => void) {}

  /** Returns horizontal-ruler visibility. @returns Whether visible. */
  public IsHorizontalRulerVisible(): boolean {
    return this.horizontalRulerVisible;
  }
  /** Returns vertical-ruler visibility. @returns Whether visible. */
  public IsVerticalRulerVisible(): boolean {
    return this.verticalRulerVisible;
  }

  /** Returns sidebar visibility. @returns Whether visible. */
  public IsSidebarVisible(): boolean {
    return this.sidebarVisible;
  }

  /** Returns status-bar visibility. @returns Whether visible. */
  public IsStatusBarVisible(): boolean {
    return this.statusBarVisible;
  }

  /** Toggles horizontal-ruler visibility. @returns Nothing. */
  public ToggleHorizontalRuler(): void {
    this.horizontalRulerVisible = !this.horizontalRulerVisible;
    this.changed();
  }
  /** Toggles vertical-ruler visibility. @returns Nothing. */
  public ToggleVerticalRuler(): void {
    this.verticalRulerVisible = !this.verticalRulerVisible;
    this.changed();
  }

  /** Toggles sidebar visibility. @returns Nothing. */
  public ToggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    this.changed();
  }

  /** Toggles status-bar visibility. @returns Nothing. */
  public ToggleStatusBar(): void {
    this.statusBarVisible = !this.statusBarVisible;
    this.changed();
  }
}
