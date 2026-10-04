/** @fileoverview Projects native SvxStyleToolBoxControl FillStyleBox population and Common.xcs defaults. */

/** Detached style identity and native display name for a browser selector. */
export interface StyleToolboxEntry {
  readonly id: string;
  readonly name: string;
  readonly resourceId?: string;
}

/** Native Common StyleToolBoxControl population switches. */
export interface StyleToolboxSettings {
  readonly ShowDefaultStyles: boolean;
  readonly ShowUsedStyles: boolean;
  readonly ShowFavouriteStyles: boolean;
  readonly ShowUserDefinedStyles: boolean;
}

/** Native configuration defaults; favourite storage is supplied by the caller. */
export const DEFAULT_STYLE_TOOLBOX_SETTINGS: Readonly<StyleToolboxSettings> = Object.freeze({
  ShowDefaultStyles: true,
  ShowUsedStyles: true,
  ShowFavouriteStyles: true,
  ShowUserDefinedStyles: true,
});

/** Family-specific style vectors in their pool iteration order. */
export interface StyleToolboxSources {
  readonly defaults: readonly StyleToolboxEntry[];
  readonly used: readonly StyleToolboxEntry[];
  readonly favourites: readonly StyleToolboxEntry[];
  readonly userDefined: readonly StyleToolboxEntry[];
}

/** Copies default-first then used/favourite/user-defined entries with native exact-name deduplication. @param sources - Family population. @param settings - Common configuration switches. @returns Immutable detached entries. */
export function populateStyleToolbox(
  sources: StyleToolboxSources,
  settings: StyleToolboxSettings = DEFAULT_STYLE_TOOLBOX_SETTINGS,
): readonly StyleToolboxEntry[] {
  const names = new Set<string>();
  const entries: StyleToolboxEntry[] = [];
  const groups = [
    [settings.ShowDefaultStyles, sources.defaults],
    [settings.ShowUsedStyles, sources.used],
    [settings.ShowFavouriteStyles, sources.favourites],
    [settings.ShowUserDefinedStyles, sources.userDefined],
  ] as const;
  for (const [show, styles] of groups) {
    if (!show) continue;
    for (const style of styles) {
      if (names.has(style.name)) continue;
      names.add(style.name);
      entries.push(Object.freeze({ ...style }));
    }
  }
  return Object.freeze(entries);
}
