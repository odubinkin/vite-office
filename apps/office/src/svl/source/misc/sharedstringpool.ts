/** @fileoverview Original private StringWithHash and std hash owners from svl/source/misc/sharedstringpool.cxx. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Original anonymous cached key struct, including the actual implicit memberwise value lifetime operations. */
export class StringWithHash {
  /** Original owned key string. */
  str: OUString;
  /** Original cached signed32 hash, computed after moving the by-value argument into str. */
  hashCode: number;
  /** Original by-value/copy construction; source-bound factories adapt rvalue special members. @param source - Const string argument or key copy source. @returns Original initialized key. */
  constructor(source: OUStringConstReference | StringWithHash) {
    if (source instanceof StringWithHash) {
      this.str = new OUString(source.str);
      this.hashCode = source.hashCode;
    } else {
      const parameter = new OUString(source);
      this.str = OUString.move(parameter);
      this.hashCode = this.str.hashCode();
      parameter.dispose();
    }
  }
  /** Original by-value construction from an rvalue OUString, followed by the original member move and parameter destruction. @param source - Rvalue string argument. @returns Initialized cached key. */
  static fromMovedString(source: OUString): StringWithHash {
    const parameter = OUString.move(source);
    const result = Object.create(StringWithHash.prototype) as StringWithHash;
    result.str = OUString.move(parameter);
    result.hashCode = result.str.hashCode();
    parameter.dispose();
    return result;
  }
  /** Original implicitly generated move construction moves str and copies its cached scalar. @param source - Original rvalue key. @returns Transferred key. */
  static move(source: StringWithHash): StringWithHash {
    const result = Object.create(StringWithHash.prototype) as StringWithHash;
    result.str = OUString.move(source.str);
    result.hashCode = source.hashCode;
    return result;
  }
  /** Original implicit destructor destroys the sole owned value member. @returns Nothing. */
  dispose(): void {
    this.str.dispose();
  }
  /** Original implicit copy assignment assigns str, then the cached scalar. @param source - Const source key. @returns This key. */
  assign(source: StringWithHash): this {
    this.str.assign(source.str);
    this.hashCode = source.hashCode;
    return this;
  }
  /** Original implicit move assignment uses OUString's pointer swap before copying the cache. @param source - Rvalue key. @returns This key. */
  moveAssign(source: StringWithHash): this {
    this.str.moveAssign(source.str);
    this.hashCode = source.hashCode;
    return this;
  }
  /** Original equality checks the cached hash before actual string equality. @param other - Const key. @returns Original cached-key equality. */
  equals(other: StringWithHash): boolean {
    if (this.hashCode !== other.hashCode) return false;
    return this.str.equals(other.str);
  }
}

/** Original std::hash<StringWithHash>::operator() on the verified64-bit target; does not recompute a mutable key's cache. @param key - Original key. @returns Unsigned64 size_t witness. */
export function hashStringWithHash(key: StringWithHash): bigint {
  return BigInt.asUintN(64, BigInt(key.hashCode));
}
