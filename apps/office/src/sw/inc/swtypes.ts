/** @fileoverview Defines the implemented native text-attribute query modes from sw/inc/swtypes.hxx. */

/** Selects the native containment contract at one text offset. */
export enum GetTextAttrMode {
  /** Includes the start and excludes the end. */
  Default,
  /** Excludes the start and includes the end. */
  Expand,
  /** Excludes both endpoints. */
  Parent,
}

/** Native text-attribute insertion flags; supported modes are enforced by InsertItem. */
export enum SetAttrMode {
  DEFAULT = 0,
  DONTEXPAND = 1,
  DONTREPLACE = 2,
  NOTXTATRCHR = 4,
  NOHINTADJUST = 8,
  NOFORMATATTR = 16,
  APICALL = 32,
  FORCEHINTEXPAND = 64,
  IS_COPY = 128,
  NOHINTEXPAND = 256,
  NO_CURSOR_CHANGE = 512,
  REMOVE_ALL_ATTR = 1024,
}

/** Represented native frame preparation discriminators from swtypes.hxx. */
export enum PrepareHint {
  Clear = 0,
  FixSizeChanged = 2,
}
