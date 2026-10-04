/** @fileoverview Implements the two English internet pool-name lookups from pinned `sw/source/core/doc/SwStyleNameMapper.cxx` and `sw/inc/strings.hrc`; other families and localization remain unimplemented. */
import { SwPoolFormatId } from "../../../inc/poolfmt";

/** Bounded pool-ID lookup used by the native internet item constructor. */
export const SwStyleNameMapper = {
  /** Returns the supported English UI resource or the supplied fallback. @param id - Native pool identity. @param name - Fallback name for an unsupported identity. @returns UI name. */
  GetUIName(id: SwPoolFormatId, name: string): string {
    if (id === SwPoolFormatId.CHR_INET_NORMAL) return "Internet Link";
    if (id === SwPoolFormatId.CHR_INET_VISIT) return "Visited Internet Link";
    return name;
  },
};
