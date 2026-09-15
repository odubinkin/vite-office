/** @fileoverview React context adapter for the browser localization service. */

import { createContext, useContext } from "react";

import { BrowserLocalizationService } from "./browser-localization";

/** Application-wide browser localization context. */
export const BrowserLocalizationContext = createContext(new BrowserLocalizationService("en-US"));

/** Returns the application-wide browser localization service. @returns Current service. */
export function useBrowserLocalization(): BrowserLocalizationService {
  return useContext(BrowserLocalizationContext);
}
