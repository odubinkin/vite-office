/** @fileoverview Shared pinned XCU command label and accelerator projection used by Writer and Calc generators. */

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

/** Finds default shortcuts for one command. @param commandUrl - UNO command URL. @param catalog - Accelerator XCU. @returns Browser-normalized shortcuts. */
export function findShortcuts(commandUrl: string, catalog: string): readonly string[] {
  const shortcuts = new Set<string>();
  for (const match of catalog.matchAll(
    /<node oor:name="([^"]+)"[^>]*>\s*<prop oor:name="Command">([\s\S]*?)<\/prop>\s*<\/node>/g,
  )) {
    if (!match[2]?.includes(`<value xml:lang="en-US">${commandUrl}</value>`)) continue;
    const shortcut = convertShortcut(match[1] as string);
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
    key === "RETURN" ? "Enter" : key,
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
