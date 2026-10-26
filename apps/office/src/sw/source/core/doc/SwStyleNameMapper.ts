/** @fileoverview Implements English internet UI and paragraph pool-ID UI/programmatic names from pinned SwStyleNameMapper.cxx; localized and other-family mappings remain unimplemented. */
import {
  SwPoolFormatId,
  WRITER_PARAGRAPH_STYLE_POOL,
  WRITER_CHARACTER_STYLE_POOL,
} from "../../../inc/poolfmt";

/** Bounded pool-ID lookup used by the native internet item constructor. */
export const SwStyleNameMapper = {
  /** Returns the supported English UI resource or the supplied fallback. @param id - Native pool identity. @param name - Fallback name for an unsupported identity. @returns UI name. */
  GetUIName(id: SwPoolFormatId, name: string): string {
    if (id === SwPoolFormatId.CHR_INET_NORMAL) return "Internet Link";
    if (id === SwPoolFormatId.CHR_INET_VISIT) return "Visited Internet Link";
    const character = WRITER_CHARACTER_STYLE_POOL.find(
      /** Resolves native character style names. @param style - Native entry. @returns Identity match. */ (
        style,
      ) => style.poolId === id,
    );
    if (character !== undefined) return character.uiName;
    const definition = WRITER_PARAGRAPH_STYLE_POOL.find(
      /** Resolves the original paragraph pool identity. @param style - Native pool entry. @returns Whether matching. */
      (style) => style.poolId === id,
    );
    return definition
      ? definition.name === "Standard"
        ? "Default Paragraph Style"
        : definition.name
      : name;
  },
  /** Returns the original programmatic paragraph pool name or the supplied custom name. @param id - Native pool identity. @param name - Custom-name fallback. @returns Programmatic name. */
  GetProgName(id: SwPoolFormatId, name: string): string {
    return (
      WRITER_CHARACTER_STYLE_POOL.find(
        /** Resolves original character programmatic names. @param style - Native entry. @returns Identity match. */ (
          style,
        ) => style.poolId === id,
      )?.name ??
      WRITER_PARAGRAPH_STYLE_POOL.find(
        /** Resolves the original immutable pool entry. @param style - Native pool entry. @returns Whether matching. */
        (style) => style.poolId === id,
      )?.name ??
      name
    );
  },
};
