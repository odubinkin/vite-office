/** @fileoverview Original NamespaceMap transitional/strict maps and generated namespace identities from unchanged native namespace inputs; actual owned OUString map values bind the native SAX namespace boundary. */
import { getTokenFromUtf8, XML_TOKEN_INVALID } from "./tokenmap";
import { OUString } from "../../../sal/inc/rtl/ustring";
import transitional from "./namespaces.txt?raw";
import strict from "./namespaces-strict.txt?raw";

/** Original compiler-known namespace literal byte. @param character - Source ASCII unit. @returns Byte. */
function ascii(character: string): number {
  return character.charCodeAt(0);
}
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

/** Binds generated C++ NMSP/XML constants, including the exact numeric TOKEN_COUNT sentinel. @param qname - Canonical QName or generated native sentinel. @returns Native token, or DONTKNOW for invalid expressions. */
export function getNamespacedToken(qname: string | number): number {
  if (typeof qname === "number") return qname;
  const colon = qname.indexOf(":"),
    prefix = qname.slice(0, colon);
  const namespace = prefix === "" ? 0 : namespaceTokens.get(prefix),
    local = getTokenFromUtf8(qname.slice(colon + 1));
  return namespace === undefined || local === XML_TOKEN_INVALID
    ? XML_TOKEN_INVALID
    : namespace | local;
}

/** Original public namespace maps; each instance owns its maps as in the native struct. */
export class NamespaceMap {
  readonly maTransitionalNamespaceMap = new Map<number, OUString>();
  readonly maStrictNamespaceMap = new Map<number, OUString>();
  /** Populates generated native namespace IDs and exact URI spellings. @returns Map owner. */
  constructor() {
    for (const [alias, id] of namespaceTokens) {
      this.maTransitionalNamespaceMap.set(
        id,
        new OUString(Uint8Array.from((transitionalNames.get(alias) as string) + "\0", ascii)),
      );
      this.maStrictNamespaceMap.set(
        id,
        new OUString(Uint8Array.from((strictNames.get(alias) as string) + "\0", ascii)),
      );
    }
  }
  /** Original implicit map value destruction; static instance remains realm-owned. @returns Nothing. */
  dispose(): void {
    for (const value of this.maStrictNamespaceMap.values()) value.dispose();
    for (const value of this.maTransitionalNamespaceMap.values()) value.dispose();
  }
}
let singleton: NamespaceMap | null = null;
/** Original shared namespace singleton. @returns Native map owner. */
export function StaticNamespaceMap(): NamespaceMap {
  if (!singleton) singleton = new NamespaceMap();
  return singleton;
}
