/** @fileoverview Verifies the native Navigator configuration properties at the browser boundary. */
import { expect, it } from "vitest";
import { OutlineTrackingMode, SwNavigationConfig } from "../../source/uibase/utlui/navicfg";
import {
  WRITER_NAVIGATOR_CONFIGURATION_KEY,
  WriterNavigatorConfigurationStore,
} from "./writer-navigator-configuration-store";

it("keeps native defaults and round-trips tracking preferences while preserving unrelated settings", /** Exercises the represented Writer Navigator schema using the browser Storage surface. @returns Nothing. */ () => {
  localStorage.setItem(
    WRITER_NAVIGATOR_CONFIGURATION_KEY,
    JSON.stringify({ RootType: 1, OutlineLevel: 0, OutlineTracking: -1, TableTracking: "false" }),
  );
  try {
    const store = new WriterNavigatorConfigurationStore(localStorage);
    const config = new SwNavigationConfig(store);
    expect(config.GetOutlineLevel()).toBe(0);
    expect(config.GetRootType()).toBe("table");
    expect(config.IsAlphabeticSort("table")).toBe(false);
    expect(config.GetOutlineTracking()).toBe(OutlineTrackingMode.Default);
    expect(config.GetContentTypeTrack("table")).toBe(true);
    expect(config.GetContentTypeTrack("bookmark")).toBe(true);
    expect(config.GetContentTypeTrack("hyperlink")).toBe(true);
    expect(config.GetContentTypeTrack("comment")).toBe(true);
    config.SetOutlineLevel(3);
    config.SetOutlineTracking(OutlineTrackingMode.Focus);
    config.SetContentTypeTrack("table", false);
    config.SetContentTypeTrack("bookmark", false);
    expect(store.Load()).toEqual({
      RootType: 1,
      SortAlphabeticallyBlock: 0,
      OutlineLevel: 3,
      OutlineTracking: 2,
      TableTracking: false,
      BookmarkTracking: false,
      HyperlinkTracking: true,
      CommentTracking: true,
    });
    const reloaded = new SwNavigationConfig(store);
    expect(reloaded.GetOutlineLevel()).toBe(3);
    expect(reloaded.GetOutlineTracking()).toBe(OutlineTrackingMode.Focus);
    expect(reloaded.GetContentTypeTrack("table")).toBe(false);
    expect(reloaded.GetContentTypeTrack("bookmark")).toBe(false);
  } finally {
    localStorage.removeItem(WRITER_NAVIGATOR_CONFIGURATION_KEY);
  }
});

it("persists the native root ID and toggles sort bits independently", /** Checks that changing a visible category preserves bits and properties outside the represented tree. @returns Nothing. */ () => {
  const store = new WriterNavigatorConfigurationStore(localStorage);
  const key = WRITER_NAVIGATOR_CONFIGURATION_KEY;
  localStorage.setItem(
    key,
    JSON.stringify({
      RootType: 3,
      SortAlphabeticallyBlock: (1 << 3) | (1 << 5),
      SelectedPosition: 6,
    }),
  );
  try {
    const config = new SwNavigationConfig(store);
    expect(config.GetRootType()).toBeUndefined();
    expect(config.IsAlphabeticSort("bookmark")).toBe(true);
    config.SetAlphabeticSort("outline", true);
    expect(store.Load().RootType).toBe(3);
    config.SetAlphabeticSort("bookmark", false);
    config.SetRootType("hyperlink");
    expect(store.Load()).toMatchObject({
      RootType: 7,
      SortAlphabeticallyBlock: (1 << 3) | 1,
      SelectedPosition: 6,
    });
    const reloaded = new SwNavigationConfig(store);
    expect(reloaded.GetRootType()).toBe("hyperlink");
    expect(reloaded.IsAlphabeticSort("outline")).toBe(true);
    expect(reloaded.IsAlphabeticSort("bookmark")).toBe(false);
    reloaded.SetRootType();
    expect(store.Load().RootType).toBe(-1);
  } finally {
    localStorage.removeItem(key);
  }
});
