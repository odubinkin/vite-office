/** @fileoverview Verifies centralized browser locale selection and pinned-resource fallback. */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrowserLocalizationProvider } from "./BrowserLocalizationProvider";
import {
  BrowserLocalizationService,
  createBrowserLocalizationService,
} from "./browser-localization";
import { useBrowserLocalization } from "./browser-localization-context";

describe("BrowserLocalizationService", /** Groups browser localization behavior. @returns Nothing. */ function defineBrowserLocalizationTests(): void {
  it("uses exact locale catalogs and pinned fallback text", /** Verifies translated and generated fallback messages. @returns Nothing. */ function resolvesCatalogText(): void {
    const service = new BrowserLocalizationService("th-TH", {
      "th-TH": { greeting: "สวัสดี {name}" },
    });
    expect(service.GetText("greeting", "Hello {name}", { name: "Writer" })).toBe("สวัสดี Writer");
    expect(service.GetText("missing", "Pinned label")).toBe("Pinned label");
  });

  it("provides one service to the complete presentation subtree", /** Verifies React context ownership. @returns Nothing. */ function providesLocalizationContext(): void {
    const service = new BrowserLocalizationService("en-US");
    const wrapper =
      /** Wraps the tested hook in the provider. @param children - Hook test tree. @returns Provider tree. */ ({
        children,
      }: React.PropsWithChildren) => (
        <BrowserLocalizationProvider service={service}>{children}</BrowserLocalizationProvider>
      );
    expect(renderHook(useBrowserLocalization, { wrapper }).result.current).toBe(service);
  });

  it("selects the browser locale and falls back when the platform has none", /** Verifies platform locale selection and deterministic fallback. @returns Nothing. */ function selectsBrowserLocale(): void {
    expect(createBrowserLocalizationService().locale).toBe(navigator.language);
    vi.stubGlobal("navigator", undefined);
    expect(createBrowserLocalizationService().locale).toBe("en-US");
    vi.unstubAllGlobals();
  });
});
