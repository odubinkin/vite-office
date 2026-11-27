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
    JSON.stringify({ RootType: 1, OutlineTracking: -1, TableTracking: "false" }),
  );
  try {
    const store = new WriterNavigatorConfigurationStore(localStorage);
    const config = new SwNavigationConfig(store);
    expect(config.GetOutlineTracking()).toBe(OutlineTrackingMode.Default);
    expect(config.GetContentTypeTrack("table")).toBe(true);
    expect(config.GetContentTypeTrack("bookmark")).toBe(true);
    config.SetOutlineTracking(OutlineTrackingMode.Focus);
    config.SetContentTypeTrack("table", false);
    config.SetContentTypeTrack("bookmark", false);
    expect(store.Load()).toEqual({
      RootType: 1,
      OutlineTracking: 2,
      TableTracking: false,
      BookmarkTracking: false,
    });
    const reloaded = new SwNavigationConfig(store);
    expect(reloaded.GetOutlineTracking()).toBe(OutlineTrackingMode.Focus);
    expect(reloaded.GetContentTypeTrack("table")).toBe(false);
    expect(reloaded.GetContentTypeTrack("bookmark")).toBe(false);
  } finally {
    localStorage.removeItem(WRITER_NAVIGATOR_CONFIGURATION_KEY);
  }
});
