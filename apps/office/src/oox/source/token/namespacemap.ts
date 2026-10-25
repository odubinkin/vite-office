/** @fileoverview Original NamespaceMap transitional/strict maps and generated namespace identities from unchanged native namespace inputs; UTF16 XML URI strings bind the SAX namespace boundary. */
import transitional from "./namespaces.txt?raw";
import strict from "./namespaces-strict.txt?raw";

/** Reads the original namespace generator's comment/blank/alias rules. @param text - Pinned namespace input. @returns Last declaration for each alias. */
function parse(text: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const line of text.split("\n")) {
    const meaningful = (line.split("#")[0] as string).trim();
    if (meaningful === "") continue;
    const [alias, uri] = meaningful.split(/\s+/);
    result.set(alias as string, uri as string);
  }
  return result;
}
const transitionalNames = parse(transitional),
  strictNames = parse(strict);
/** Exact NMSP constants assigned by namespaces.py: sorted aliases, one-based values shifted16. */
export const namespaceTokens: ReadonlyMap<string, number> = new Map(
  [...transitionalNames.keys()]
    .sort()
    .map(
      /** Assigns original native generator position. @param alias - Canonical alias. @param index - Sorted index. @returns Constant. */ (
        alias,
        index,
      ) => [alias, (index + 1) << 16],
    ),
);

/** Original public namespace maps; each instance owns its maps as in the native struct. */
export class NamespaceMap {
  readonly maTransitionalNamespaceMap = new Map<number, string>();
  readonly maStrictNamespaceMap = new Map<number, string>();
  /** Populates generated native namespace IDs and exact URI spellings. @returns Map owner. */
  constructor() {
    for (const [alias, id] of namespaceTokens) {
      this.maTransitionalNamespaceMap.set(id, transitionalNames.get(alias) as string);
      this.maStrictNamespaceMap.set(id, strictNames.get(alias) as string);
    }
  }
}
let singleton: NamespaceMap | null = null;
/** Original shared namespace singleton. @returns Native map owner. */
export function StaticNamespaceMap(): NamespaceMap {
  if (!singleton) singleton = new NamespaceMap();
  return singleton;
}
