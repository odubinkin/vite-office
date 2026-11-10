/** @fileoverview Original lt_variant_get_tag borrowed value operation over the existing registered subtag representation.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import type { RegistryEntry } from "./lt-registry";

/** Original null-owner guard and tag field return; no normalization or fallback is introduced. @param variant - Borrowed logical native subtag or null. @returns Original tag spelling or null. */
export function lt_variant_get_tag(variant: RegistryEntry | null): string | null {
  return variant?.tag ?? null;
}
