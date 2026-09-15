/** @fileoverview Provides browser localization to the React presentation tree. */

import type { ReactNode } from "react";

import type { BrowserLocalizationService } from "./browser-localization";
import { BrowserLocalizationContext } from "./browser-localization-context";

/** Provides one locale selection to the complete browser application. @param props - Service and presentation tree. @returns Localization provider. */
export function BrowserLocalizationProvider({
  children,
  service,
}: Readonly<{ children: ReactNode; service: BrowserLocalizationService }>): React.JSX.Element {
  return (
    <BrowserLocalizationContext.Provider value={service}>
      {children}
    </BrowserLocalizationContext.Provider>
  );
}
