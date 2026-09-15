/**
 * @fileoverview Mounts React through the explicit framework browser adapter.
 */

import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

import { Desktop } from "./desktop";
import type { OfficeModuleDescriptor } from "./modulemanager";
import { BrowserLocalizationProvider } from "../localization/BrowserLocalizationProvider";
import { createBrowserLocalizationService } from "../localization/browser-localization";

/**
 * Mounts the office foundation into an existing DOM element.
 *
 * @param rootElement - Existing root element owned by the application HTML document, or null when missing.
 * @param modules - Complete ordered module descriptors created by the composition root.
 * @returns The React root so tests and future lifecycle adapters can unmount it deterministically.
 * @throws {Error} When the static HTML document does not provide the required root element.
 */
export function mountApplication(
  rootElement: HTMLElement | null,
  modules: readonly OfficeModuleDescriptor[],
): Root {
  if (rootElement === null) {
    throw new Error("Vite Office could not find its #root mount element.");
  }

  const root = createRoot(rootElement);
  root.render(
    <BrowserLocalizationProvider service={createBrowserLocalizationService()}>
      <Desktop modules={modules} />
    </BrowserLocalizationProvider>,
  );
  return root;
}
