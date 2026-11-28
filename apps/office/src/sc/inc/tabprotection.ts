/** @fileoverview Calc sheet protection types from sc/inc/tabprotection.hxx. */
import type { ScRangeList } from "./rangelst";

/** Original ScDocProtection option order. */
export enum ScDocProtectionOption {
  STRUCTURE,
  WINDOWS,
  NONE,
}

/** Original ScTableProtection option order. */
export enum ScTableProtectionOption {
  AUTOFILTER,
  DELETE_COLUMNS,
  DELETE_ROWS,
  FORMAT_CELLS,
  FORMAT_COLUMNS,
  FORMAT_ROWS,
  INSERT_COLUMNS,
  INSERT_HYPERLINKS,
  INSERT_ROWS,
  OBJECTS,
  PIVOT_TABLES,
  SCENARIOS,
  SELECT_LOCKED_CELLS,
  SELECT_UNLOCKED_CELLS,
  SORT,
  NONE,
}

/** Stored OOXML password hash attributes. */
export interface ScOoxPasswordHash {
  readonly algorithmName: string;
  readonly hashValue: string;
  readonly saltValue: string;
  readonly spinCount: number;
}

/** Original Calc protection hash formats. */
export enum ScPasswordHash {
  SHA1,
  SHA1_UTF8,
  SHA256,
  XL,
  UNSPECIFIED,
}

/** Stored native verifier bytes and their first and second digest algorithms. */
export interface ScStoredPasswordHash {
  readonly bytes: Uint8Array;
  readonly primary: ScPasswordHash;
  readonly secondary: ScPasswordHash;
}

/** Native enhanced sheet protection imported from an OOXML range record. */
export interface ScEnhancedProtection {
  readonly ranges: ScRangeList;
  readonly title: string;
  readonly securityDescriptor: string;
  readonly passwordVerifier: number;
  readonly passwordHash: ScOoxPasswordHash;
}
