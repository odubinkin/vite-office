/** @fileoverview Original ICU78.3 CacheKey and LocaleCacheKey template responsibilities. Explicit value-type descriptors represent native template identity and createObject specialization; physical C++ RTTI spelling/ABI is not a browser contract. */
import { Locale, type LocaleConstReference } from "./locid";
import { SharedObject } from "./sharedobject";
/** Original ustring.cpp narrow counted STRING_HASH used by key and locale hashes. @param value - Narrow bytes. @returns Native signed32 hash. */
export function ustr_hashCharsN(value: string): number {
  let hash = 0;
  const increment = Math.trunc((value.length - 32) / 32) + 1;
  for (let i = 0; i < value.length; i += increment)
    hash = (Math.imul(hash, 37) + (value.charCodeAt(i) & 255)) | 0;
  return hash;
}
/** Original virtual key interface and creation-status/primary bookkeeping. */
export abstract class CacheKeyBase {
  private fCreationStatus = 0;
  protected fIsPrimary = false;
  /** Original base copy resets primary even when source is primary. @param source - Source/null. @returns Key. */
  constructor(source: CacheKeyBase | null = null) {
    if (source !== null) this.fCreationStatus = source.fCreationStatus;
  }
  /** Original virtual hash. @returns Hash. */
  abstract hashCode(): number;
  /** Original polymorphic key copy. @returns Owned key. */
  abstract clone(): CacheKeyBase;
  /** Original equality callback. @param other - Key. @returns Equality. */
  abstract equals(other: CacheKeyBase): boolean;
  /** Original creation callback must return an owned hard reference. @param context - Opaque creation context. @param status - Creation status. @returns Owned shared value/null. */
  abstract createObject(context: unknown, status: [number]): SharedObject | null;
  /** Original diagnostic C string write. @param buffer - Output. @param capacity - Positive native capacity. @returns Output. */
  abstract writeDescription(buffer: Uint8Array, capacity: number): Uint8Array;
  /** Native key destructor projection. @returns Nothing. */
  dispose(): void {}
}
/** Runtime template argument and native specialization hook, without an alternate cache or Calendar owner. */
export interface CacheValueType<T extends SharedObject> {
  readonly name: string;
  readonly identity: object;
  createObject(locale: LocaleConstReference, context: unknown, status: [number]): T | null;
}
/** Original key equality compares the instantiated key type, not its value. */
export abstract class CacheKey<T extends SharedObject> extends CacheKeyBase {
  /** Retains explicit template binding. @param type - Type binding. @param source - Source/null. @returns Key. */
  constructor(
    protected readonly type: CacheValueType<T>,
    source: CacheKeyBase | null = null,
  ) {
    super(source);
  }
  /** Original native type-name hash. @returns Signed32 hash. */
  hashCode(): number {
    return ustr_hashCharsN(this.type.name);
  }
  /** Original instantiated-type equality; the descriptor is the host template identity. @param other - Key. @returns Equality. */
  equals(other: CacheKeyBase): boolean {
    return (
      this === other ||
      (other instanceof CacheKey &&
        this.constructor === other.constructor &&
        this.type.identity === other.type.identity)
    );
  }
  /** Original bounded type description. @param buffer - Output. @param capacity - Native positive capacity. @returns Output. */
  writeDescription(buffer: Uint8Array, capacity: number): Uint8Array {
    return writeDescription(this.type.name, buffer, capacity);
  }
}
/** Original strncpy and final-byte terminator for key diagnostics. @param value - Narrow C string. @param buffer - Output. @param capacity - Native positive capacity. @returns Output. */
function writeDescription(value: string, buffer: Uint8Array, capacity: number): Uint8Array {
  const end = value.indexOf("\0");
  if (end >= 0) value = value.slice(0, end);
  for (let i = 0; i < capacity; ++i) buffer[i] = i < value.length ? value.charCodeAt(i) & 255 : 0;
  buffer[capacity - 1] = 0;
  return buffer;
}
/** Original LocaleCacheKey owns a copied Locale and dispatches its value-type specialization. */
export class LocaleCacheKey<T extends SharedObject> extends CacheKey<T> {
  protected readonly fLoc: Locale;
  /** Original locale or copy constructor; descriptor supplies only the erased C++ template parameter. @param type - Native value specialization. @param locale - Locale/source key. @returns Owned key. */
  constructor(type: CacheValueType<T>, locale: LocaleConstReference | LocaleCacheKey<T>) {
    super(type, locale instanceof LocaleCacheKey ? locale : null);
    this.fLoc = new Locale(locale instanceof LocaleCacheKey ? locale.fLoc : locale);
  }
  /** Original type hash times37 plus locale hash, modulo signed32. @returns Hash. */
  override hashCode(): number {
    return (Math.imul(super.hashCode(), 37) + ustr_hashCharsN(this.fLoc.getName())) | 0;
  }
  /** Original instantiated type then Locale equality. @param other - Key. @returns Equality. */
  override equals(other: CacheKeyBase): boolean {
    return super.equals(other) && this.fLoc.equals((other as LocaleCacheKey<T>).fLoc);
  }
  /** Original polymorphic locale-key copy. @returns Owned key. */
  clone(): LocaleCacheKey<T> {
    return new LocaleCacheKey(this.type, this);
  }
  /** Original per-value createObject specialization. @param context - Opaque context. @param status - Creation status. @returns Retained value/null. */
  createObject(context: unknown, status: [number]): T | null {
    return this.type.createObject(this.fLoc, context, status);
  }
  /** Original locale-name diagnostic. @param buffer - Output. @param capacity - Positive capacity. @returns Output. */
  override writeDescription(buffer: Uint8Array, capacity: number): Uint8Array {
    return writeDescription(this.fLoc.getName(), buffer, capacity);
  }
}
