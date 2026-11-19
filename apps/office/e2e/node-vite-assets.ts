/** @fileoverview Loads the source assets used by application modules when Playwright imports them in Node. */
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";

registerHooks({
  /** Resolves an asset using Node's normal package exports before retaining its Vite query. @param specifier - Import request. @param context - Original resolver context. @param nextResolve - Node resolver. @returns Resolved module. */
  resolve(specifier, context, nextResolve) {
    const queryStart = specifier.indexOf("?");
    const query = queryStart === -1 ? "" : specifier.slice(queryStart);
    if (query !== "?raw" && query !== "?url&inline") return nextResolve(specifier, context);
    const resolved = nextResolve(specifier.slice(0, queryStart), context);
    const url = new URL(resolved.url);
    url.search = query;
    return { ...resolved, url: url.href };
  },
  /** Returns the exact file text or inline WASM URL consumed by the application. @param url - Resolved module URL. @param context - Original loader context. @param nextLoad - Node loader. @returns Loaded module. */
  load(url, context, nextLoad) {
    const asset = new URL(url);
    const raw = asset.search === "?raw";
    const wasm = asset.pathname.endsWith(".wasm") && asset.search === "?url&inline";
    if (asset.protocol !== "file:" || (!raw && !wasm)) return nextLoad(url, context);
    asset.search = "";
    const value = raw
      ? readFileSync(asset, "utf8")
      : `data:application/wasm;base64,${readFileSync(asset, "base64")}`;
    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${JSON.stringify(value)};`,
    };
  },
});
