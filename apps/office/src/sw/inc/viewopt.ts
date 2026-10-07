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

/** Represented native color configuration values; the raw source constructor has no appearance bits. */
export class SwViewColors {
  public m_nAppearanceFlags = ViewOptFlags.NONE;
  public m_aFieldShadingsColor = "#c0c0c0";

  /** Copies represented native value members. @param source - Optional existing colors. @returns Nothing. */
  public constructor(source?: Readonly<SwViewColors>) {
    if (source !== undefined) Object.assign(this, source);
  }
}

/** View-local visibility flags consumed by SwView and browser presentation. */
export class SwViewOption {
  // The browser's configured desktop defaults correspond to Office/UI.xcs;
  // raw SwViewColors defaults remain distinct from configured view defaults.
  private static readonly s_aInitialColorConfig = Object.assign(new SwViewColors(), {
    m_nAppearanceFlags:
      ViewOptFlags.IndexShadings | ViewOptFlags.FieldShadings | ViewOptFlags.Shadow,
  });
  private readonly m_aColorConfig = new SwViewColors(SwViewOption.s_aInitialColorConfig);
  private m_bReadonly = false;
  private m_bIsPagePreview = false;
  private horizontalRulerVisible = true;
  private verticalRulerVisible = true;
  private sidebarVisible = true;
  private statusBarVisible = true;

  /** Creates view options with one bindings invalidation callback. @param changed - State-change callback. @returns Nothing. */
  public constructor(private readonly changed: () => void) {}

  /** Copies the initial color configuration for subsequently created views. @param colors - Native color values. @returns Nothing. */
  public static SetInitialColorConfig(colors: Readonly<SwViewColors>): void {
    Object.assign(SwViewOption.s_aInitialColorConfig, colors);
  }
  /** Borrows the stable view-owned color member. @returns Read-only native colors. */
  public GetColorConfig(): Readonly<SwViewColors> {
    return this.m_aColorConfig;
  }
  /** Copies color values without replacing the borrowed member or implicitly repainting. @param colors - Native color values. @returns Nothing. */
  public SetColorConfig(colors: Readonly<SwViewColors>): void {
    Object.assign(this.m_aColorConfig, colors);
  }
  /** Returns the configured field background color. @returns Native color. */
  public GetFieldShadingsColor(): string {
    return this.m_aColorConfig.m_aFieldShadingsColor;
  }
  /** Reads native read-only view state. @returns Whether read-only. */
  public IsReadonly(): boolean {
    return this.m_bReadonly;
  }
  /** Sets native read-only view state without an implicit redraw. @param value - New state. @returns Nothing. */
  public SetReadonly(value: boolean): void {
    this.m_bReadonly = value;
  }
  /** Reads native page-preview state. @returns Whether previewing. */
  public IsPagePreview(): boolean {
    return this.m_bIsPagePreview;
  }
  /** Sets native page-preview state without an implicit redraw. @param value - New state. @returns Nothing. */
  public SetPagePreview(value: boolean): void {
    this.m_bIsPagePreview = value;
  }

  /** Tests configured native appearance bits. @param flag - Requested bits. @returns Whether any requested bit is set. */
  public IsAppearanceFlag(flag: ViewOptFlags): boolean {
    return (this.m_aColorConfig.m_nAppearanceFlags & flag) !== 0;
  }
  /** Reads native field-shading visibility. @returns Whether field shadings are enabled. */
  public IsFieldShadings(): boolean {
    return this.IsAppearanceFlag(ViewOptFlags.FieldShadings);
  }
  /** Sets or clears native appearance bits without implicit redraw or configuration persistence. @param flag - Native bits. @param set - Enable or disable. @returns Nothing. */
  public SetAppearanceFlag(flag: ViewOptFlags, set: boolean): void {
    if (set) this.m_aColorConfig.m_nAppearanceFlags |= flag;
    else this.m_aColorConfig.m_nAppearanceFlags &= ~flag;
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
