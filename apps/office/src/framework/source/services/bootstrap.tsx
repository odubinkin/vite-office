/**
 * @fileoverview Mounts the React application into a caller-provided browser root with an explicit missing-root failure.
 */

import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

import { Desktop } from "./desktop";

/**
 * Mounts the office foundation into an existing DOM element.
 *
 * @param rootElement - Existing root element owned by the application HTML document, or null when missing.
 * @returns The React root so tests and future lifecycle adapters can unmount it deterministically.
 * @throws {Error} When the static HTML document does not provide the required root element.
 */
export function mountApplication(rootElement: HTMLElement | null): Root {
  if (rootElement === null) {
    throw new Error("Vite Office could not find its #root mount element.");
  }

  const root = createRoot(rootElement);
  root.render(<Desktop />);
  return root;
}
