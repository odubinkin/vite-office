/**
 * @fileoverview Verifies that Vite emits a self-contained relative-path frontend bundle without backend endpoints.
 */

import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distributionRoot = path.join(repositoryRoot, "apps", "office", "dist");
const indexPath = path.join(distributionRoot, "index.html");

/**
 * Recursively collects JavaScript bundles from the generated static distribution.
 *
 * @param directoryPath - Absolute generated directory to inspect without mutation.
 * @returns A promise resolving to absolute JavaScript bundle paths.
 */
async function collectJavaScriptBundles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const bundles = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      bundles.push(...(await collectJavaScriptBundles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      bundles.push(entryPath);
    }
  }

  return bundles;
}

/**
 * Rejects absolute or remote asset references and proves every relative reference exists.
 *
 * @param html - Complete generated index document.
 * @returns A promise resolving after all referenced static assets are accessible.
 */
async function validateAssetReferences(html) {
  const referencePattern = /(?:href|src)="([^"]+)"/gu;
  let match = referencePattern.exec(html);
  let checkedReferences = 0;

  while (match !== null) {
    const reference = match[1];
    if (!reference.startsWith("#")) {
      if (reference.startsWith("/") || /^https?:/u.test(reference)) {
        throw new Error(`Static index contains a non-relative asset reference: ${reference}`);
      }

      await access(path.resolve(distributionRoot, reference));
      checkedReferences += 1;
    }

    match = referencePattern.exec(html);
  }

  if (checkedReferences === 0) {
    throw new Error("Static index did not reference any generated assets.");
  }
}

/**
 * Rejects application-backend URLs embedded in generated JavaScript bundles.
 *
 * @param bundlePaths - Absolute generated JavaScript bundle paths to inspect.
 * @returns A promise resolving after every bundle passes backend-endpoint checks.
 */
async function validateNoBackendEndpoints(bundlePaths) {
  for (const bundlePath of bundlePaths) {
    const bundleText = await readFile(bundlePath, "utf8");
    if (/https?:\/\/(?:localhost|127\.0\.0\.1)|\/api\//u.test(bundleText)) {
      throw new Error(`Generated bundle contains an application-backend endpoint: ${bundlePath}`);
    }
  }
}

/**
 * Runs all deterministic static-distribution checks and reports the verified boundary.
 *
 * @returns A promise resolving after the generated frontend is proven self-contained.
 */
async function main() {
  const indexHtml = await readFile(indexPath, "utf8");
  await validateAssetReferences(indexHtml);
  const bundles = await collectJavaScriptBundles(distributionRoot);
  await validateNoBackendEndpoints(bundles);
  console.log(
    `Static build smoke passed: relative assets, ${bundles.length} JavaScript bundle(s), no backend endpoints.`,
  );
}

await main();
