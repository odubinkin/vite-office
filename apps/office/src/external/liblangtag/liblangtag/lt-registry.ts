/** @fileoverview Functional registered-subtag lookup from liblangtag's seven DB owners.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import data from "../data/language-subtag-registry.json";

/** Original registry families, without XML storage or physical singleton ownership. */
export type RegistryKind = keyof typeof data;

/** Read-only parsing fields; absent native values are null and absent lists are empty. */
export interface RegistryEntry {
  readonly tag: string;
  readonly preferredTag: string | null;
  readonly suppressScript: string | null;
  readonly scope: string | null;
  readonly macroLanguage: string | null;
  readonly prefixes: readonly string[];
}

/** Immutable data indexes replace lt_trie storage; row order/replacement are preserved. */
const databases = new Map<RegistryKind, ReadonlyMap<string, RegistryEntry>>();
for (const kind of Object.keys(data) as RegistryKind[]) {
  const entries = new Map<string, RegistryEntry>();
  for (const row of data[kind]) {
    Object.freeze(row.prefixes);
    entries.set(row.tag.toLowerCase(), Object.freeze(row));
  }
  databases.set(kind, entries);
}

/** Looks up the exact native ASCII key. @param kind - Registry family. @param subtag - C-string value; bytes after first NUL are ignored. @returns Registered immutable value or native null; no wildcard fallback. */
export function lookupRegistry(kind: RegistryKind, subtag: string): RegistryEntry | null {
  const end = subtag.indexOf("\0"),
    key = (end < 0 ? subtag : subtag.slice(0, end)).replace(
      /[A-Z]/g,
      /** Folds only source ASCII capitals, not Unicode aliases. @param c - ASCII capital. @returns Lowercase ASCII. */
      (c) => c.toLowerCase(),
    );
  return (databases.get(kind) as ReadonlyMap<string, RegistryEntry>).get(key) ?? null;
}
