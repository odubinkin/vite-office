/** @fileoverview Shared pinned XCU command label and accelerator projection used by Writer and Calc generators. */

import { SaxesParser } from "saxes";

/** Finds the pinned English command label. @param commandUrl - UNO command URL. @param catalogs - XCU command catalogs. @returns Localized label. */
export function findEnglishLabel(commandUrl: string, ...catalogs: readonly string[]): string {
  const label = findEnglishLabelProperty(commandUrl, "Label", ...catalogs);
  if (label !== undefined) return label;
  throw new Error(`Missing upstream English label: ${commandUrl}`);
}

/** Reads an original native label property without fabricating a popup override when absent. @param commandUrl - Native URL. @param property - Original XCU property. @param catalogs - Pinned catalogs. @returns Original English property, or absent. */
export function findEnglishLabelProperty(
  commandUrl: string,
  property: "Label" | "PopupLabel",
  ...catalogs: readonly string[]
): string | undefined {
  for (const catalog of catalogs) {
    const marker = `<node oor:name="${commandUrl}"`;
    const start = catalog.indexOf(marker);
    if (start < 0) continue;
    const next = catalog.indexOf("\n      <node oor:name=", start + marker.length);
    const block = catalog.slice(start, next < 0 ? undefined : next);
    const label = block.match(
      new RegExp(
        `<prop oor:name="${property}"[\\s\\S]*?<value xml:lang="en-US">([\\s\\S]*?)<\\/value>`,
      ),
    )?.[1];
    if (label !== undefined) return decodeXml(label.trim());
  }
  return undefined;
}

/** Parsed default accelerator scopes, shared by all commands in one generator run. */
const acceleratorCatalogs = new Map<string, Map<string, Map<string, string>>>();
/** Reads XCU hierarchy and localized command values without mixing module scopes. @param catalog - Pinned XML. @returns Scope/key/command maps in source order. */
function acceleratorScopes(catalog: string): Map<string, Map<string, string>> {
  const cached = acceleratorCatalogs.get(catalog);
  if (cached) return cached;
  const scopes = new Map<string, Map<string, string>>();
  const stack: {
    name: string;
    identity: string | undefined;
    language: string | undefined;
    installation: string | undefined;
    text: string;
  }[] = [];
  const parser = new SaxesParser({ xmlns: false });
  parser.on(
    "opentag",
    /** Tracks the actual XCU hierarchy. @param tag - XML start. @returns Nothing. */ (tag) => {
      stack.push({
        name: tag.name,
        identity: tag.attributes["oor:name"],
        language: tag.attributes["xml:lang"],
        installation: tag.attributes["install:module"],
        text: "",
      });
    },
  );
  parser.on(
    "text",
    /** Retains decoded value text. @param text - XML text. @returns Nothing. */ (text) => {
      const current = stack.at(-1);
      if (current) current.text += text;
    },
  );
  parser.on(
    "closetag",
    /** Projects only English Command values under source key nodes. @returns Nothing. */ () => {
      const current = stack.pop();
      if (
        current?.name !== "value" ||
        current.language !== "en-US" ||
        (current.installation !== undefined && current.installation !== "unxwnt") ||
        stack.at(-1)?.identity !== "Command"
      )
        return;
      const path = stack
        .filter(
          /** Selects native configuration nodes. @param node - Element. @returns Whether node. */ (
            node,
          ) => node.name === "node",
        )
        .map(
          /** Reads source identity. @param node - Element. @returns Name. */ (node) =>
            node.identity as string,
        );
      const key = path.pop() as string,
        scope = path.join("/");
      let entries = scopes.get(scope);
      if (!entries) {
        entries = new Map();
        scopes.set(scope, entries);
      }
      const command = current.text.trim();
      if (command.length > 0) entries.set(key, command);
      else entries.delete(key);
    },
  );
  parser.write(catalog).close();
  acceleratorCatalogs.set(catalog, scopes);
  return scopes;
}
/** Finds effective module/global default bindings with native module-first and primary-before-secondary key precedence. @param commandUrl - UNO command URL. @param catalog - Accelerator XCU. @param module - Native module identity. @returns Browser-normalized shortcuts from the unxwnt installation with the shared Writer Meta alias, preserving source order within each scope. */
export function findShortcuts(
  commandUrl: string,
  catalog: string,
  module: string,
): readonly string[] {
  const scopes = acceleratorScopes(catalog),
    bindings = new Map<string, string>();
  for (const scope of [`Modules/${module}`, "Global"])
    for (const layer of ["PrimaryKeys", "SecondaryKeys"])
      for (const [key, command] of scopes.get(`${layer}/${scope}`) ?? [])
        if (!bindings.has(key)) bindings.set(key, command);
  const shortcuts = new Set<string>();
  for (const [key, command] of bindings) {
    if (command !== commandUrl) continue;
    const shortcut = convertShortcut(key);
    shortcuts.add(shortcut);
    if (shortcut.startsWith("Ctrl+")) shortcuts.add(`Meta+${shortcut.slice(5)}`);
  }
  return [...shortcuts];
}

/** Escapes literal text for a regular expression. @param value - Literal value. @returns Escaped pattern text. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Converts a LibreOffice accelerator key name. @param value - XCU accelerator identity. @returns Browser shortcut. */
export function convertShortcut(value: string): string {
  const [key, ...modifiers] = value.split("_");
  return [
    ...(modifiers.includes("MOD1") ? ["Ctrl"] : []),
    ...(modifiers.includes("MOD2") ? ["Alt"] : []),
    ...(modifiers.includes("SHIFT") ? ["Shift"] : []),
    key === "RETURN" ? "Enter" : key === "QUOTELEFT" ? "`" : key,
  ].join("+");
}

/** Removes desktop mnemonic and dialog suffix syntax. @param value - Upstream label. @returns Browser label base. */
export function stripMnemonic(value: string): string {
  return value.replaceAll("~", "").replace(/\.\.\.$/, "");
}

/** Decodes XML entities used by labels. @param value - XML text. @returns Plain text. */
export function decodeXml(value: string): string {
  return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

/** Reads native Commands.xcs Properties flags,falling back to inherited catalogs or native zero. @param commandUrl - Source command. @param catalogs - Module then generic catalogs. @returns Original flags. */
export function findCommandPropertyBits(
  commandUrl: string,
  ...catalogs: readonly string[]
): number {
  for (const catalog of catalogs) {
    const marker = `<node oor:name="${commandUrl}"`,
      start = catalog.indexOf(marker);
    if (start < 0) continue;
    const next = catalog.indexOf("\n      <node oor:name=", start + marker.length),
      block = catalog.slice(start, next < 0 ? undefined : next);
    const flags = block.match(/<prop oor:name="Properties"[^>]*>\s*<value>(\d+)<\/value>/)?.[1];
    if (flags !== undefined) return Number(flags);
  }
  return 0;
}
