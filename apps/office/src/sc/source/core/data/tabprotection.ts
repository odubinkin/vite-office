/** @fileoverview Native sheet protection flags and imported password hash records. */
import {
  ScTableProtectionOption as Option,
  type ScOoxPasswordHash,
  ScPasswordHash as Hash,
  type ScStoredPasswordHash,
  type ScEnhancedProtection,
} from "../../../inc/tabprotection";
import type { ScDocument } from "../../../inc/document";
import type { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";

/** Checks whether all protected sheets can supply a requested digest family. @param document - Workbook. @param primary - First digest. @param secondary - Optional second digest. @returns Whether retyping is required. */
export function needsPassHashRegen(
  document: ScDocument,
  primary: Hash,
  secondary = Hash.UNSPECIFIED,
): boolean {
  for (let tab = 0; tab < document.GetTableCount(); ++tab) {
    const protection = document.GetTabProtection(tab);
    if (protection?.isProtected() && !protection.hasPasswordHash(primary, secondary)) return true;
  }
  return false;
}

/** Native sheet protection state stored by ScTable. */
export class ScTableProtection {
  private readonly options: boolean[];
  private protected: boolean;
  private ooxHash: Readonly<ScOoxPasswordHash> | undefined;
  private storedHash: ScStoredPasswordHash | undefined;
  private enhancedProtection: readonly ScEnhancedProtection[];

  /** Copies the native state or constructs the default options. @param source - Optional state to copy. @returns Sheet protection. */
  constructor(source?: ScTableProtection) {
    this.options = source ? [...source.options] : Array<boolean>(Option.NONE).fill(false);
    this.protected = source?.protected ?? false;
    this.ooxHash = source?.ooxHash;
    this.storedHash = source?.storedHash;
    this.enhancedProtection = source?.enhancedProtection ?? [];
    if (!source) {
      this.setOption(Option.SELECT_LOCKED_CELLS, true);
      this.setOption(Option.SELECT_UNLOCKED_CELLS, true);
    }
  }

  /** Borrows the ordered native enhanced protection records. @returns Enhanced protection records. */
  getEnhancedProtection(): readonly ScEnhancedProtection[] {
    return this.enhancedProtection;
  }

  /** Installs independent native enhanced protection records. @param records - Imported records. @returns Nothing. */
  setEnhancedProtection(records: readonly ScEnhancedProtection[]): void {
    this.enhancedProtection = records.map(
      /** Makes independent values for the native table. @param record - Source. @returns Sheet-owned record. */
      (record) => ({
        ...record,
        ranges: new ScRangeList(record.ranges),
        passwordHash: { ...record.passwordHash },
      }),
    );
  }

  /** Tests the enhanced exception ranges for one block of otherwise protected cells. @param range - Native block. @returns Whether the full block is unlocked by an exception. */
  isBlockEditable(range: ScRange): boolean {
    if (!this.enhancedProtection.length) return false;
    const allowed = this.enhancedProtection.filter(
      /** Excludes exceptions that require an unavailable descriptor or credential. @param entry - Native exception. @returns Unconditional access. */
      (entry) =>
        !entry.securityDescriptor && !entry.passwordVerifier && !entry.passwordHash.hashValue,
    );
    for (const entry of allowed) if (entry.ranges.Contains(range)) return true;
    if (range.aStart.equals(range.aEnd)) return false;
    const combined = new ScRangeList();
    for (const entry of allowed) {
      const intersected = entry.ranges.GetIntersectedRange(range);
      if (intersected.size() === 1 && intersected.at(0).equals(range)) return true;
      for (const rectangle of entry.ranges) combined.push_back(rectangle);
    }
    const result = combined.GetIntersectedRange(range);
    return result.size() === 1 && result.at(0).equals(range);
  }

  /** Gets the original sheet flag. @returns Protection state. */
  isProtected(): boolean {
    return this.protected;
  }

  /** Updates the protection flag while retaining options and hashes. @param enabled - Sheet protection state. @returns Nothing. */
  setProtected(enabled: boolean): void {
    this.protected = enabled;
  }

  /** Gets a native permission. @param option - Permission to look up. @returns Whether the operation is enabled. */
  isOptionEnabled(option: Option): boolean {
    return this.options[option] ?? false;
  }

  /** Sets a native permission. @param option - Permission to update. @param enabled - Whether the operation is enabled. @returns Nothing. */
  setOption(option: Option, enabled: boolean): void {
    if (option >= 0 && option < Option.NONE) this.options[option] = enabled;
  }

  /** Gets the stored OOXML hash record. @returns OOXML hash or absence. */
  getOoxPasswordHash(): Readonly<ScOoxPasswordHash> | undefined {
    return this.ooxHash;
  }

  /** Sets the OOXML record and clears the prior simple hash when the new hash is present. @param hash - Source OOXML hash. @returns Nothing. */
  setOoxPasswordHash(hash: ScOoxPasswordHash): void {
    this.ooxHash = Object.freeze({ ...hash });
    if (hash.hashValue) this.storedHash = undefined;
  }

  /** Tests every marked range against the original edit exceptions. @param ranges - Marked ranges. @returns Whether each range is explicitly editable. */
  isSelectionEditable(ranges: ScRangeList): boolean {
    if (ranges.empty()) return false;
    for (const range of ranges) if (!this.isBlockEditable(range)) return false;
    return true;
  }

  /** Tests whether a stored verifier is present. @returns Whether there is a verifier of either family. */
  hasPassword(): boolean {
    return Boolean(this.storedHash?.bytes.length || this.ooxHash?.hashValue);
  }

  /** Checks whether the stored password can supply the requested digest family. @param primary - First digest. @param secondary - Optional second digest. @returns Compatibility. */
  hasPasswordHash(primary: Hash, secondary = Hash.UNSPECIFIED): boolean {
    const stored = this.storedHash;
    return (
      !this.hasPassword() ||
      (stored?.primary === primary &&
        (stored.secondary === Hash.UNSPECIFIED || stored.secondary === secondary))
    );
  }

  /** Copies the original stored verifier and digest metadata. @returns Independent verifier or absence. */
  getStoredPasswordHash(): ScStoredPasswordHash | undefined {
    const hash = this.storedHash;
    return hash && { ...hash, bytes: hash.bytes.slice() };
  }

  /** Installs the stored native verifier. @param hash - Digest and algorithms or absence. @returns Nothing. */
  setStoredPasswordHash(hash?: ScStoredPasswordHash): void {
    this.storedHash = hash && { ...hash, bytes: hash.bytes.slice() };
  }

  /** Gets the stored little Excel protection verifier as a 16-bit value. @returns Verifier or zero. */
  getXlPasswordHash(): number {
    const hash = this.storedHash;
    if (hash?.primary !== Hash.XL || hash.secondary !== Hash.UNSPECIFIED || hash.bytes.length < 2)
      return 0;
    return ((hash.bytes[0] as number) << 8) | (hash.bytes[1] as number);
  }

  /** Stores the legacy Excel verifier alongside the OOXML hash. @param hash - 16-bit verifier. @returns Nothing. */
  setXlPasswordHash(hash: number): void {
    this.setStoredPasswordHash(
      hash
        ? {
            bytes: Uint8Array.of(hash >>> 8, hash & 0xff),
            primary: Hash.XL,
            secondary: Hash.UNSPECIFIED,
          }
        : undefined,
    );
  }
}
