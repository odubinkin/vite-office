/** @fileoverview Native sheet protection flags and imported password hash records. */
import {
  ScTableProtectionOption as Option,
  ScDocProtectionOption as DocOption,
  type ScOoxPasswordHash,
  ScPasswordHash as Hash,
  type ScStoredPasswordHash,
  type ScEnhancedProtection,
} from "../../../inc/tabprotection";
import { decodeBase64, encodeBase64 } from "../../../../comphelper/source/misc/base64";
import type { ScDocument } from "../../../inc/document";
import type { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";

/** Checks whether all protected sheets can supply a requested digest family. @param document - Workbook. @param primary - First digest. @param secondary - Optional second digest. @returns Whether retyping is required. */
export function needsPassHashRegen(
  document: ScDocument,
  primary: Hash,
  secondary = Hash.UNSPECIFIED,
): boolean {
  const workbook = document.GetDocProtection();
  if (workbook?.isProtected() && !workbook.hasPasswordHash(primary, secondary)) return true;
  for (let tab = 0; tab < document.GetTableCount(); ++tab) {
    const protection = document.GetTabProtection(tab);
    if (protection?.isProtected() && !protection.hasPasswordHash(primary, secondary)) return true;
  }
  return false;
}

/** Writes the source little-endian UTF-16 code units. @param password - Entered text. @returns Digest input. */
function passwordBytes(password: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(password.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < password.length; i++) view.setUint16(i * 2, password.charCodeAt(i), true);
  return bytes;
}

/** Computes the source legacy Excel verifier from signed UTF-8 bytes. @param password - Entered text. @returns Big-endian verifier bytes. */
function xlPasswordHash(password: string): Uint8Array<ArrayBuffer> {
  const bytes = new TextEncoder().encode(password);
  let value = 0;
  if (bytes.length && bytes.length <= 0xffff) {
    const signedBytes = new Int8Array(bytes.buffer);
    for (let i = signedBytes.length - 1; i >= 0; i--)
      value = ((value >>> 14) & 1) ^ ((value << 1) & 0x7fff) ^ (signedBytes[i] as number);
    value = ((value >>> 14) & 1) ^ ((value << 1) & 0x7fff) ^ 0xce4b ^ bytes.length;
  }
  return Uint8Array.of(value >>> 8, value & 0xff);
}

/** Computes a browser-native digest for a supported original verifier. @param algorithm - Digest name. @param input - Bytes. @returns Digest. */
async function digest(
  algorithm: string,
  input: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest(algorithm, input));
}

/** Selects the source byte encoding for a typed verifier. @param type - Source hash family. @param password - Entered text. @returns Verifier or undefined. */
async function hashPassword(
  type: Hash,
  password: string,
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  if (type === Hash.XL) return xlPasswordHash(password);
  if (type === Hash.SHA1) return digest("SHA-1", passwordBytes(password));
  if (type === Hash.SHA1_UTF8) return digest("SHA-1", new TextEncoder().encode(password));
  if (type === Hash.SHA256) return digest("SHA-256", new TextEncoder().encode(password));
  return undefined;
}

/** Tests exact verifier bytes. @param expected - Stored verifier. @param actual - Computed verifier. @returns Match. */
function matchesPasswordHash(expected: Uint8Array, actual: Uint8Array): boolean {
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++)
    difference |= (expected[i] as number) ^ (actual[i] as number);
  return difference === 0;
}

/** Verifies the OOXML salt, UTF-16 password hash and appended iteration counter. @param record - Imported metadata. @param password - Entered text. @returns Match. */
async function verifyOoxPassword(record: ScOoxPasswordHash, password: string): Promise<boolean> {
  const bits = /^(?:SHA-?)(1|256|384|512)$/u.exec(record.algorithmName)?.[1];
  if (!bits || !record.hashValue) return false;
  const algorithm = "SHA-" + bits;
  const salt = decodeBase64(record.saltValue);
  const encoded = passwordBytes(password);
  const initial = new Uint8Array(salt.length + encoded.length);
  initial.set(salt);
  initial.set(encoded, salt.length);
  let hash = await digest(algorithm, initial);
  const step = new Uint8Array(hash.length + 4);
  const view = new DataView(step.buffer);
  for (let i = 0; i < record.spinCount; i++) {
    step.set(hash);
    view.setUint32(hash.length, i, true);
    hash = await digest(algorithm, step);
  }
  return encodeBase64(hash) === record.hashValue;
}

/** Shared native protection options and password state. */
class ScTableProtectionImpl {
  private readonly options: boolean[];
  private protected: boolean;
  private ooxHash: Readonly<ScOoxPasswordHash> | undefined;
  private storedHash: ScStoredPasswordHash | undefined;

  /** Copies native state or builds the original false-initialized option vector. @param optionCount - Native option count. @param source - Optional protection state to copy. @returns The initialized ScTableProtectionImpl instance. */
  constructor(optionCount: number, source?: ScTableProtectionImpl) {
    this.options = source ? [...source.options] : Array<boolean>(optionCount).fill(false);
    this.protected = source?.protected ?? false;
    this.ooxHash = source?.ooxHash;
    this.storedHash = source?.storedHash;
  }

  /** Gets the original protection flag. @returns Protection state. */
  isProtected(): boolean {
    return this.protected;
  }

  /** Updates the protection flag while retaining options and hashes. @param enabled - Protection state. @returns Nothing. */
  setProtected(enabled: boolean): void {
    this.protected = enabled;
  }

  /** Gets a native permission. @param option - Permission to look up. @returns Whether the operation is enabled. */
  isOptionEnabled(option: number): boolean {
    return this.options[option] ?? false;
  }

  /** Sets a native permission. @param option - Permission to update. @param enabled - Whether the operation is enabled. @returns Nothing. */
  setOption(option: number, enabled: boolean): void {
    if (option >= 0 && option < this.options.length) this.options[option] = enabled;
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

  /** Tests whether a stored verifier is present. @returns Whether there is a verifier of either family. */
  hasPassword(): boolean {
    return Boolean(this.storedHash?.bytes.length || this.ooxHash?.hashValue);
  }

  /** Tests the current lock and password presence. @returns Whether the original prompt is needed. */
  isProtectedWithPass(): boolean {
    return this.isProtected() && this.hasPassword();
  }

  /** Sets an entered password in the native preferred ODF verifier format. @param password - Entered text. @returns Completion. */
  async setPassword(password: string): Promise<void> {
    const bytes = password ? await digest("SHA-1", passwordBytes(password)) : undefined;
    this.ooxHash = undefined;
    this.setStoredPasswordHash(bytes && { bytes, primary: Hash.SHA1, secondary: Hash.UNSPECIFIED });
  }

  /** Verifies only the entered value against the stored protection record. @param password - Entered text. @returns Match. */
  async verifyPassword(password: string): Promise<boolean> {
    if (!this.hasPassword()) return password.length === 0;
    const stored = this.storedHash;
    if (stored?.bytes.length) {
      const computed = await hashPassword(stored.primary, password);
      if (computed) {
        const actual = stored.secondary === Hash.SHA1 ? await digest("SHA-1", computed) : computed;
        if (matchesPasswordHash(stored.bytes, actual)) return true;
      }
      if (stored.primary === Hash.SHA1 && stored.secondary === Hash.UNSPECIFIED)
        return matchesPasswordHash(
          stored.bytes,
          await digest("SHA-1", new TextEncoder().encode(password)),
        );
    }
    return this.ooxHash ? verifyOoxPassword(this.ooxHash, password) : false;
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

  /** Reads the original stored digest or applies the supported second digest. @param primary - Primary digest type. @param secondary - Optional second digest type. @returns Requested verifier bytes. */
  async getPasswordHash(primary: Hash, secondary = Hash.UNSPECIFIED): Promise<Uint8Array> {
    const stored = this.storedHash;
    if (
      !stored ||
      stored.primary !== primary ||
      (stored.secondary !== Hash.UNSPECIFIED && stored.secondary !== secondary)
    )
      return new Uint8Array();
    const bytes = new Uint8Array(stored.bytes);
    if (bytes.length && stored.secondary !== secondary && secondary === Hash.SHA1)
      return digest("SHA-1", bytes);
    return bytes;
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

/** Native workbook protection state stored by ScDocument. */
export class ScDocProtection extends ScTableProtectionImpl {
  /** Initializes or copies the original document options. @param source - State to copy. @returns The initialized ScDocProtection instance. */
  constructor(source?: ScDocProtection) {
    super(DocOption.NONE, source);
  }

  /** Copies the state before adopting it into the document. @returns Independent protection state. */
  Clone(): ScDocProtection {
    return new ScDocProtection(this);
  }

  /** Updates workbook protection and its original linked structure option. @param enabled - Protection state. @returns Nothing. */
  override setProtected(enabled: boolean): void {
    super.setProtected(enabled);
    this.setOption(DocOption.STRUCTURE, enabled);
  }
}

/** Native sheet protection state stored by ScTable. */
export class ScTableProtection extends ScTableProtectionImpl {
  private enhancedProtection: readonly ScEnhancedProtection[];

  /** Copies the native state or constructs the default permissions. @param source - Optional state to copy. @returns The initialized ScTableProtection instance. */
  constructor(source?: ScTableProtection) {
    super(Option.NONE, source);
    this.enhancedProtection = source?.enhancedProtection ?? [];
    if (!source) {
      this.setOption(Option.SELECT_LOCKED_CELLS, true);
      this.setOption(Option.SELECT_UNLOCKED_CELLS, true);
    }
  }

  /** Produces an independent native protection snapshot. @returns Sheet protection copy. */
  Clone(): ScTableProtection {
    return new ScTableProtection(this);
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

  /** Tests every marked range against the original edit exceptions. @param ranges - Marked ranges. @returns Whether each range is explicitly editable. */
  isSelectionEditable(ranges: ScRangeList): boolean {
    if (ranges.empty()) return false;
    for (const range of ranges) if (!this.isBlockEditable(range)) return false;
    return true;
  }
}
