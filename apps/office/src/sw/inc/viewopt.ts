/** @fileoverview Implements the bounded Writer view-option owner from `sw/inc/viewopt.hxx`. */

/** Native appearance-bit identities from viewopt.hxx. */
export enum ViewOptFlags {
  NONE = 0x0000,
  IndexShadings = 0x0001,
  Links = 0x0002,
  VisitedLinks = 0x0004,
  FieldShadings = 0x0008,
  Shadow = 0x0010,
}

/** View-local visibility flags consumed by SwView and browser presentation. */
export class SwViewOption {
  private appearanceFlags =
    ViewOptFlags.IndexShadings | ViewOptFlags.FieldShadings | ViewOptFlags.Shadow;
  private horizontalRulerVisible = true;
  private verticalRulerVisible = true;
  private sidebarVisible = true;
  private statusBarVisible = true;

  /** Creates view options with one bindings invalidation callback. @param changed - State-change callback. @returns Nothing. */
  public constructor(private readonly changed: () => void) {}

  /** Tests configured native appearance bits. @param flag - Requested bits. @returns Whether any requested bit is set. */
  public IsAppearanceFlag(flag: ViewOptFlags): boolean {
    return (this.appearanceFlags & flag) !== 0;
  }
  /** Reads native field-shading visibility. @returns Whether field shadings are enabled. */
  public IsFieldShadings(): boolean {
    return this.IsAppearanceFlag(ViewOptFlags.FieldShadings);
  }
  /** Sets or clears native appearance bits without implicit redraw or configuration persistence. @param flag - Native bits. @param set - Enable or disable. @returns Nothing. */
  public SetAppearanceFlag(flag: ViewOptFlags, set: boolean): void {
    if (set) this.appearanceFlags |= flag;
    else this.appearanceFlags &= ~flag;
  }

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
