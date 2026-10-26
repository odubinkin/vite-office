/** @fileoverview Original ICU78.3 BytesTrie reader from bytestrie.cpp and unicode/bytestrie.h. Borrowed Uint8Array storage and offsets represent native pointers; valid serialized data and source call preconditions are required. Builder, Iterator, native ownership/deallocation and invalid pointer arithmetic are outside this binding. */
import type { ByteStringSink } from "./unicode/bytestream";
import { UStringTrieResult as Result } from "./unicode/ustringtrie";
const kMaxBranchLinearSubNodeLength = 5;
const kMinLinearMatch = 0x10;
const kMinValueLead = 0x20;
const kValueIsFinal = 1;
const kMinOneByteValueLead = 0x10;
const kMinTwoByteValueLead = 0x51;
const kMinThreeByteValueLead = 0x6c;
const kFourByteValueLead = 0x7e;
const kMinTwoByteDeltaLead = 0xc0;
const kMinThreeByteDeltaLead = 0xf0;
const kFourByteDeltaLead = 0xfe;
const kState64RemainingShift = 59n;
const kState64PosMask = (1n << kState64RemainingShift) - 1n;
/** Module-private symbol models the original BytesTrie friendship without exposing State fields to callers. */
const statePayload = Symbol("BytesTrie::State");
/** Original nested State logical payload. Empty native State initializes only bytes; other projections remain unread until saved. */
export class BytesTrieState {
  /** Private-to-module friend payload; native pointer identity and stopped state are retained. */
  [statePayload]: { bytes: Uint8Array | null; pos: number | null; remainingMatchLength: number } = {
    bytes: null,
    pos: null,
    remainingMatchLength: -1,
  };
}
/** Original byte-serialized trie reader and complete non-Iterator query/state methods. */
export class BytesTrie {
  /** Original nested State owner. */
  static readonly State = BytesTrieState;
  private readonly bytes_: Uint8Array | null;
  private pos_: number | null;
  private remainingMatchLength_: number;
  /** Original borrowed-array and shallow-copy constructors. @param input - Actual serialized storage or reader to copy. @returns Reader. */
  constructor(input: Uint8Array | null | BytesTrie) {
    if (input instanceof BytesTrie) {
      this.bytes_ = input.bytes_;
      this.pos_ = input.pos_;
      this.remainingMatchLength_ = input.remainingMatchLength_;
    } else {
      this.bytes_ = input;
      this.pos_ = input === null ? null : 0;
      this.remainingMatchLength_ = -1;
    }
  }
  /** Dereferences a source-valid byte pointer. @param pos - Offset. @returns Unsigned byte. */
  private at(pos: number): number {
    return (this.bytes_ as Uint8Array)[pos] as number;
  }
  /** Original reset. @returns This owner. */
  reset(): this {
    this.pos_ = this.bytes_ === null ? null : 0;
    this.remainingMatchLength_ = -1;
    return this;
  }
  /** Original opaque uint64 state for source-valid pointer subtraction (not stopped/null states). @returns State bits. */
  getState64(): bigint {
    return BigInt.asUintN(
      64,
      (BigInt(this.remainingMatchLength_ + 2) << kState64RemainingShift) |
        BigInt(this.pos_ as number),
    );
  }
  /** Original unchecked restore; caller supplies a state from identically initialized storage. @param state - Saved bits. @returns This owner. */
  resetToState64(state: bigint): this {
    state = BigInt.asUintN(64, state);
    this.remainingMatchLength_ = Number(state >> kState64RemainingShift) - 2;
    this.pos_ = Number(state & kState64PosMask);
    return this;
  }
  /** Original state capture retains borrowed storage identity and stopped state. @param state - Output owner. @returns This reader. */
  saveState(state: BytesTrieState): this {
    state[statePayload].bytes = this.bytes_;
    state[statePayload].pos = this.pos_;
    state[statePayload].remainingMatchLength = this.remainingMatchLength_;
    return this;
  }
  /** Original restore ignores empty or different-pointer states; equal typed-array origins are the same source pointer. @param state - Saved owner. @returns This reader. */
  resetToState(state: BytesTrieState): this {
    if (
      this.bytes_ !== null &&
      state[statePayload].bytes !== null &&
      this.bytes_.buffer === state[statePayload].bytes.buffer &&
      this.bytes_.byteOffset === state[statePayload].bytes.byteOffset
    ) {
      this.pos_ = state[statePayload].pos;
      this.remainingMatchLength_ = state[statePayload].remainingMatchLength;
    }
    return this;
  }
  /** Original compact value decoder, with lead byte already shifted. @param pos - Payload offset. @param leadByte - Shifted lead. @returns Signed32 value. */
  private readValue(pos: number, leadByte: number): number {
    if (leadByte < kMinTwoByteValueLead) return leadByte - kMinOneByteValueLead;
    if (leadByte < kMinThreeByteValueLead)
      return ((leadByte - kMinTwoByteValueLead) << 8) | this.at(pos);
    if (leadByte < kFourByteValueLead)
      return ((leadByte - kMinThreeByteValueLead) << 16) | (this.at(pos) << 8) | this.at(pos + 1);
    if (leadByte === kFourByteValueLead)
      return (this.at(pos) << 16) | (this.at(pos + 1) << 8) | this.at(pos + 2);
    return (
      (this.at(pos) << 24) | (this.at(pos + 1) << 16) | (this.at(pos + 2) << 8) | this.at(pos + 3)
    );
  }
  /** Original skipValue overloads; optional lead is the unshifted node. @param pos - Node or payload pointer. @param leadByte - Optional consumed lead. @returns Next pointer. */
  private skipValue(pos: number, leadByte?: number): number {
    if (leadByte === undefined) leadByte = this.at(pos++);
    if (leadByte >= kMinTwoByteValueLead << 1) {
      if (leadByte < kMinThreeByteValueLead << 1) ++pos;
      else if (leadByte < kFourByteValueLead << 1) pos += 2;
      else pos += 3 + ((leadByte >> 1) & 1);
    }
    return pos;
  }
  /** Original compact jump decoder. @param pos - Delta pointer. @returns Jump target. */
  private jumpByDelta(pos: number): number {
    let delta = this.at(pos++);
    if (delta < kMinTwoByteDeltaLead) {
      /* One-byte delta. */
    } else if (delta < kMinThreeByteDeltaLead)
      delta = ((delta - kMinTwoByteDeltaLead) << 8) | this.at(pos++);
    else if (delta < kFourByteDeltaLead) {
      delta = ((delta - kMinThreeByteDeltaLead) << 16) | (this.at(pos) << 8) | this.at(pos + 1);
      pos += 2;
    } else if (delta === kFourByteDeltaLead) {
      delta = (this.at(pos) << 16) | (this.at(pos + 1) << 8) | this.at(pos + 2);
      pos += 3;
    } else {
      delta =
        (this.at(pos) << 24) |
        (this.at(pos + 1) << 16) |
        (this.at(pos + 2) << 8) |
        this.at(pos + 3);
      pos += 4;
    }
    return pos + delta;
  }
  /** Original compact jump skip. @param pos - Delta pointer. @returns Pointer after encoding. */
  private skipDelta(pos: number): number {
    const delta = this.at(pos++);
    if (delta >= kMinTwoByteDeltaLead) {
      if (delta < kMinThreeByteDeltaLead) ++pos;
      else if (delta < kFourByteDeltaLead) pos += 2;
      else pos += 3 + (delta & 1);
    }
    return pos;
  }
  /** Original result for a value node. @param node - Unshifted lead. @returns Final/intermediate result. */
  private valueResult(node: number): Result {
    return Result.USTRINGTRIE_INTERMEDIATE_VALUE - (node & kValueIsFinal);
  }
  /** Original logical stop changes only pos_. @returns Nothing. */
  private stop(): void {
    this.pos_ = null;
  }
  /** Original current-state classification. @returns Match state. */
  current(): Result {
    if (this.pos_ === null) return Result.USTRINGTRIE_NO_MATCH;
    const node = this.at(this.pos_);
    return this.remainingMatchLength_ < 0 && node >= kMinValueLead
      ? this.valueResult(node)
      : Result.USTRINGTRIE_NO_VALUE;
  }
  /** Original binary/linear branch traversal and delta-value jump. @param pos - Branch pointer. @param length - Encoded count. @param inByte - Input byte. @returns Match result. */
  private branchNext(pos: number, length: number, inByte: number): Result {
    if (length === 0) length = this.at(pos++);
    ++length;
    while (length > kMaxBranchLinearSubNodeLength) {
      if (inByte < this.at(pos++)) {
        length >>= 1;
        pos = this.jumpByDelta(pos);
      } else {
        length -= length >> 1;
        pos = this.skipDelta(pos);
      }
    }
    do {
      if (inByte === this.at(pos++)) {
        let node = this.at(pos),
          result: Result;
        if (node & kValueIsFinal) result = Result.USTRINGTRIE_FINAL_VALUE;
        else {
          ++pos;
          const delta = this.readValue(pos, node >> 1);
          pos = this.skipValue(pos, node) + delta;
          node = this.at(pos);
          result = node >= kMinValueLead ? this.valueResult(node) : Result.USTRINGTRIE_NO_VALUE;
        }
        this.pos_ = pos;
        return result;
      }
      --length;
      pos = this.skipValue(pos);
    } while (length > 1);
    if (inByte === this.at(pos++)) {
      this.pos_ = pos;
      const node = this.at(pos);
      return node >= kMinValueLead ? this.valueResult(node) : Result.USTRINGTRIE_NO_VALUE;
    }
    this.stop();
    return Result.USTRINGTRIE_NO_MATCH;
  }
  /** Original dispatch at a node boundary. @param pos - Node pointer. @param inByte - Input byte. @returns Result. */
  private nextImpl(pos: number, inByte: number): Result {
    for (;;) {
      const node = this.at(pos++);
      if (node < kMinLinearMatch) return this.branchNext(pos, node, inByte);
      if (node < kMinValueLead) {
        let length = node - kMinLinearMatch;
        if (inByte === this.at(pos++)) {
          this.remainingMatchLength_ = --length;
          this.pos_ = pos;
          const nextNode = this.at(pos);
          return length < 0 && nextNode >= kMinValueLead
            ? this.valueResult(nextNode)
            : Result.USTRINGTRIE_NO_VALUE;
        }
        break;
      }
      if (node & kValueIsFinal) break;
      pos = this.skipValue(pos, node);
    }
    this.stop();
    return Result.USTRINGTRIE_NO_MATCH;
  }
  /** Original first() resets the match counter and starts at the borrowed root. @param inByte - Signed32 byte; -256..-1 maps once. @returns Result. */
  first(inByte: number): Result {
    inByte |= 0;
    this.remainingMatchLength_ = -1;
    if (inByte < 0) inByte += 0x100;
    return this.nextImpl(0, inByte);
  }
  /** Original single-byte traversal. @param inByte - Source signed32 input. @returns Result. */
  next(inByte: number): Result;
  /** Original counted or NUL-terminated narrow-span traversal. @param s - Source byte span/null for count zero. @param length - Count or negative for C string. @returns Result. */
  next(s: Uint8Array | null, length: number): Result;
  /** Original overload dispatch. @param input - Byte or narrow span. @param count - Native count. @returns Result. */
  next(input: number | Uint8Array | null, count?: number): Result {
    if (typeof input !== "number") return this.nextString(input, count as number);
    let inByte = input | 0;
    let pos = this.pos_;
    if (pos === null) return Result.USTRINGTRIE_NO_MATCH;
    if (inByte < 0) inByte += 0x100;
    let length = this.remainingMatchLength_;
    if (length >= 0) {
      if (inByte === this.at(pos++)) {
        this.remainingMatchLength_ = --length;
        this.pos_ = pos;
        const node = this.at(pos);
        return length < 0 && node >= kMinValueLead
          ? this.valueResult(node)
          : Result.USTRINGTRIE_NO_VALUE;
      }
      this.stop();
      return Result.USTRINGTRIE_NO_MATCH;
    }
    return this.nextImpl(pos, inByte);
  }
  /** Original string-loop control flow retains distinct branch and linear completion paths, including signed-char promotion on the pinned native target (CALC-331). @param s - Source storage. @param sLength - Signed32 count. @returns Result. */
  private nextString(s: Uint8Array | null, sLength: number): Result {
    sLength |= 0;
    let inputPos = 0;
    if (sLength < 0 ? (s as Uint8Array)[0] === 0 : sLength === 0) return this.current();
    let pos = this.pos_;
    if (pos === null) return Result.USTRINGTRIE_NO_MATCH;
    let length = this.remainingMatchLength_;
    for (;;) {
      let inByte: number;
      if (sLength < 0) {
        for (;;) {
          inByte = (((s as Uint8Array)[inputPos++] as number) << 24) >> 24;
          if (inByte === 0) {
            this.remainingMatchLength_ = length;
            this.pos_ = pos;
            const node = this.at(pos);
            return length < 0 && node >= kMinValueLead
              ? this.valueResult(node)
              : Result.USTRINGTRIE_NO_VALUE;
          }
          if (length < 0) {
            this.remainingMatchLength_ = length;
            break;
          }
          if (inByte !== this.at(pos)) {
            this.stop();
            return Result.USTRINGTRIE_NO_MATCH;
          }
          ++pos;
          --length;
        }
      } else {
        for (;;) {
          if (sLength === 0) {
            this.remainingMatchLength_ = length;
            this.pos_ = pos;
            const node = this.at(pos);
            return length < 0 && node >= kMinValueLead
              ? this.valueResult(node)
              : Result.USTRINGTRIE_NO_VALUE;
          }
          inByte = (((s as Uint8Array)[inputPos++] as number) << 24) >> 24;
          --sLength;
          if (length < 0) {
            this.remainingMatchLength_ = length;
            break;
          }
          if (inByte !== this.at(pos)) {
            this.stop();
            return Result.USTRINGTRIE_NO_MATCH;
          }
          ++pos;
          --length;
        }
      }
      for (;;) {
        const node = this.at(pos++);
        if (node < kMinLinearMatch) {
          const result = this.branchNext(pos, node, inByte);
          if (result === Result.USTRINGTRIE_NO_MATCH) return result;
          if (sLength < 0) {
            inByte = (((s as Uint8Array)[inputPos++] as number) << 24) >> 24;
            if (inByte === 0) return result;
          } else {
            if (sLength === 0) return result;
            inByte = (((s as Uint8Array)[inputPos++] as number) << 24) >> 24;
            --sLength;
          }
          if (result === Result.USTRINGTRIE_FINAL_VALUE) {
            this.stop();
            return Result.USTRINGTRIE_NO_MATCH;
          }
          pos = this.pos_ as number;
        } else if (node < kMinValueLead) {
          length = node - kMinLinearMatch;
          if (inByte !== this.at(pos)) {
            this.stop();
            return Result.USTRINGTRIE_NO_MATCH;
          }
          ++pos;
          --length;
          break;
        } else if (node & kValueIsFinal) {
          this.stop();
          return Result.USTRINGTRIE_NO_MATCH;
        } else pos = this.skipValue(pos, node);
      }
    }
  }
  /** Original value read; requires a preceding value result. @returns Signed32 payload. */
  getValue(): number {
    const pos = this.pos_ as number;
    return this.readValue(pos + 1, this.at(pos) >> 1);
  }
  /** Original recursive unique-value branch helper. @param pos - Branch pointer. @param length - Count. @param haveUniqueValue - Existing candidate. @param uniqueValue - In/out candidate. @returns Next pointer/null. */
  private findUniqueValueFromBranch(
    pos: number,
    length: number,
    haveUniqueValue: boolean,
    uniqueValue: [number],
  ): number | null {
    while (length > kMaxBranchLinearSubNodeLength) {
      ++pos;
      if (
        this.findUniqueValueFromBranch(
          this.jumpByDelta(pos),
          length >> 1,
          haveUniqueValue,
          uniqueValue,
        ) === null
      )
        return null;
      length -= length >> 1;
      pos = this.skipDelta(pos);
    }
    do {
      ++pos;
      const node = this.at(pos++),
        isFinal = node & kValueIsFinal,
        value = this.readValue(pos, node >> 1);
      pos = this.skipValue(pos, node);
      if (isFinal) {
        if (haveUniqueValue) {
          if (value !== uniqueValue[0]) return null;
        } else {
          uniqueValue[0] = value;
          haveUniqueValue = true;
        }
      } else {
        if (!this.findUniqueValue(pos + value, haveUniqueValue, uniqueValue)) return null;
        haveUniqueValue = true;
      }
    } while (--length > 1);
    return pos + 1;
  }
  /** Original recursive unique-value traversal. @param pos - Node pointer. @param haveUniqueValue - Existing candidate. @param uniqueValue - In/out candidate. @returns All descendants agree. */
  private findUniqueValue(pos: number, haveUniqueValue: boolean, uniqueValue: [number]): boolean {
    for (;;) {
      let node = this.at(pos++);
      if (node < kMinLinearMatch) {
        if (node === 0) node = this.at(pos++);
        const next = this.findUniqueValueFromBranch(pos, node + 1, haveUniqueValue, uniqueValue);
        if (next === null) return false;
        pos = next;
        haveUniqueValue = true;
      } else if (node < kMinValueLead) pos += node - kMinLinearMatch + 1;
      else {
        const isFinal = node & kValueIsFinal,
          value = this.readValue(pos, node >> 1);
        if (haveUniqueValue) {
          if (value !== uniqueValue[0]) return false;
        } else {
          uniqueValue[0] = value;
          haveUniqueValue = true;
        }
        if (isFinal) return true;
        pos = this.skipValue(pos, node);
      }
    }
  }
  /** Original query can change output even when returning false. @param uniqueValue - Candidate/output. @returns Unique descendant value. */
  hasUniqueValue(uniqueValue: [number]): boolean {
    return (
      this.pos_ !== null &&
      this.findUniqueValue(this.pos_ + this.remainingMatchLength_ + 1, false, uniqueValue)
    );
  }
  /** Original next-byte enumeration without state changes. @param out - Append owner. @returns Number of continuations. */
  getNextBytes(out: ByteStringSink): number {
    let pos = this.pos_;
    if (pos === null) return 0;
    if (this.remainingMatchLength_ >= 0) {
      out.Append(String.fromCharCode(this.at(pos)));
      return 1;
    }
    let node = this.at(pos++);
    if (node >= kMinValueLead) {
      if (node & kValueIsFinal) return 0;
      pos = this.skipValue(pos, node);
      node = this.at(pos++);
    }
    if (node < kMinLinearMatch) {
      if (node === 0) node = this.at(pos++);
      this.getNextBranchBytes(pos, ++node, out);
      return node;
    }
    out.Append(String.fromCharCode(this.at(pos)));
    return 1;
  }
  /** Original recursive branch enumeration preserves serialized order. @param pos - Branch pointer. @param length - Count. @param out - Append owner. @returns Nothing. */
  private getNextBranchBytes(pos: number, length: number, out: ByteStringSink): void {
    while (length > kMaxBranchLinearSubNodeLength) {
      ++pos;
      this.getNextBranchBytes(this.jumpByDelta(pos), length >> 1, out);
      length -= length >> 1;
      pos = this.skipDelta(pos);
    }
    do {
      out.Append(String.fromCharCode(this.at(pos++)));
      pos = this.skipValue(pos);
    } while (--length > 1);
    out.Append(String.fromCharCode(this.at(pos)));
  }
}
