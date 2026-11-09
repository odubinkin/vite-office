/** @fileoverview Original ICU78.3 UCharsTrie traversal over borrowed UTF-16-serialized nodes. */
import { UStringTrieResult as Result, USTRINGTRIE_HAS_NEXT } from "./unicode/ustringtrie";

const kMaxBranchLinearSubNodeLength = 5;
const kMinLinearMatch = 0x30;
const kMinValueLead = 0x40;
const kNodeTypeMask = 0x3f;
const kValueIsFinal = 0x8000;
const kMinTwoUnitValueLead = 0x4000;
const kThreeUnitValueLead = 0x7fff;
const kMinTwoUnitNodeValueLead = 0x4040;
const kThreeUnitNodeValueLead = 0x7fc0;
const kMinTwoUnitDeltaLead = 0xfc00;
const kThreeUnitDeltaLead = 0xffff;

/** Original borrowed trie reader with a stopped state and linear-match cursor. */
export class UCharsTrie {
  private pos_: number | null = 0;
  private remainingMatchLength_ = -1;

  /** Original borrowed character-array constructor. @param uchars - Serialized trie units. @returns Reader. */
  constructor(private readonly uchars: Uint16Array) {}

  /** Original reset to the borrowed root. @returns This reader. */
  reset(): this {
    this.pos_ = 0;
    this.remainingMatchLength_ = -1;
    return this;
  }

  /** Reads the current lead unit. @param pos - Native offset in UTF-16 units. @returns Unit. */
  private at(pos: number): number {
    return this.uchars[pos] as number;
  }

  /** Original value state encoded in bit 15. @param node - Lead unit. @returns Match state. */
  private valueResult(node: number): Result {
    return Result.USTRINGTRIE_INTERMEDIATE_VALUE - (node >> 15);
  }

  /** Original stopped transition. @returns No match. */
  private stop(): Result {
    this.pos_ = null;
    return Result.USTRINGTRIE_NO_MATCH;
  }

  /** Original compact value decoding. @param pos - Position after the lead. @param lead - Lead with the final bit cleared. @returns Signed32 value. */
  private readValue(pos: number, lead: number): number {
    if (lead < kMinTwoUnitValueLead) return lead;
    if (lead < kThreeUnitValueLead) return ((lead - kMinTwoUnitValueLead) << 16) | this.at(pos);
    return (this.at(pos) << 16) | this.at(pos + 1);
  }

  /** Original compact value skip. @param pos - Position after the lead. @param lead - Lead with the final bit cleared. @returns Next node. */
  private skipValue(pos: number, lead: number): number {
    if (lead < kMinTwoUnitValueLead) return pos;
    return pos + (lead < kThreeUnitValueLead ? 1 : 2);
  }

  /** Original intermediate value skip. @param pos - Position after the lead. @param lead - Combined value and type unit. @returns Remaining node contents. */
  private skipNodeValue(pos: number, lead: number): number {
    if (lead < kMinTwoUnitNodeValueLead) return pos;
    return pos + (lead < kThreeUnitNodeValueLead ? 1 : 2);
  }

  /** Original binary-branch delta followed by the selected node. @param pos - Delta position. @returns Target. */
  private jumpByDelta(pos: number): number {
    let delta = this.at(pos++);
    if (delta >= kMinTwoUnitDeltaLead) {
      if (delta === kThreeUnitDeltaLead) {
        delta = (this.at(pos) << 16) | this.at(pos + 1);
        pos += 2;
      } else delta = ((delta - kMinTwoUnitDeltaLead) << 16) | this.at(pos++);
    }
    return pos + delta;
  }

  /** Original delta skip for the upper branch. @param pos - Delta position. @returns Following node. */
  private skipDelta(pos: number): number {
    const delta = this.at(pos++);
    if (delta >= kMinTwoUnitDeltaLead) pos += delta === kThreeUnitDeltaLead ? 2 : 1;
    return pos;
  }

  /** Original split search followed by linear branch traversal. @param pos - Branch contents. @param length - Lead count minus one, or zero for a following length. @param uchar - Input unit. @returns Match state. */
  private branchNext(pos: number, length: number, uchar: number): Result {
    if (length === 0) length = this.at(pos++);
    ++length;
    while (length > kMaxBranchLinearSubNodeLength) {
      if (uchar < this.at(pos++)) {
        length >>= 1;
        pos = this.jumpByDelta(pos);
      } else {
        length -= length >> 1;
        pos = this.skipDelta(pos);
      }
    }
    do {
      if (uchar === this.at(pos++)) {
        const node = this.at(pos);
        if (node & kValueIsFinal) {
          this.pos_ = pos;
          return Result.USTRINGTRIE_FINAL_VALUE;
        }
        ++pos;
        const delta = this.readValue(pos, node);
        this.pos_ = this.skipValue(pos, node) + delta;
        return this.current();
      }
      --length;
      const node = this.at(pos++);
      pos = this.skipValue(pos, node & 0x7fff);
    } while (length > 1);
    if (uchar !== this.at(pos++)) return this.stop();
    this.pos_ = pos;
    return this.current();
  }

  /** Original dispatch at a complete node. @param pos - Lead unit position. @param uchar - Input unit. @returns Match state. */
  private nextImpl(pos: number, uchar: number): Result {
    let node = this.at(pos++);
    for (;;) {
      if (node < kMinLinearMatch) return this.branchNext(pos, node, uchar);
      if (node < kMinValueLead) {
        if (uchar !== this.at(pos++)) return this.stop();
        this.remainingMatchLength_ = node - kMinLinearMatch - 1;
        this.pos_ = pos;
        return this.current();
      }
      if (node & kValueIsFinal) return this.stop();
      pos = this.skipNodeValue(pos, node);
      node &= kNodeTypeMask;
    }
  }

  /** Original nonadvancing match state. @returns Match state. */
  current(): Result {
    if (this.pos_ === null) return Result.USTRINGTRIE_NO_MATCH;
    const node = this.at(this.pos_);
    return this.remainingMatchLength_ < 0 && node >= kMinValueLead
      ? this.valueResult(node)
      : Result.USTRINGTRIE_NO_VALUE;
  }

  /** Original first-unit traversal. @param uchar - Input unit. @returns Match state. */
  first(uchar: number): Result {
    this.remainingMatchLength_ = -1;
    return this.nextImpl(0, uchar);
  }

  /** Original continuation from a branch or partially matched node. @param uchar - Input unit. @returns Match state. */
  next(uchar: number): Result {
    const pos = this.pos_;
    if (pos === null) return Result.USTRINGTRIE_NO_MATCH;
    if (this.remainingMatchLength_ < 0) return this.nextImpl(pos, uchar);
    if (uchar !== this.at(pos)) return this.stop();
    --this.remainingMatchLength_;
    this.pos_ = pos + 1;
    return this.current();
  }

  /** Original one- or two-unit first traversal. @param cp - Unicode codepoint. @returns Match state. */
  firstForCodePoint(cp: number): Result {
    if (cp <= 0xffff) return this.first(cp);
    return USTRINGTRIE_HAS_NEXT(this.first(((cp - 0x10000) >> 10) + 0xd800))
      ? this.next((cp & 0x3ff) + 0xdc00)
      : Result.USTRINGTRIE_NO_MATCH;
  }

  /** Original one- or two-unit continuation. @param cp - Unicode codepoint. @returns Match state. */
  nextForCodePoint(cp: number): Result {
    if (cp <= 0xffff) return this.next(cp);
    return USTRINGTRIE_HAS_NEXT(this.next(((cp - 0x10000) >> 10) + 0xd800))
      ? this.next((cp & 0x3ff) + 0xdc00)
      : Result.USTRINGTRIE_NO_MATCH;
  }

  /** Original final and shared intermediate-value formats. @returns Signed32 match value. */
  getValue(): number {
    const pos = this.pos_ as number;
    const lead = this.at(pos);
    if (lead & kValueIsFinal) return this.readValue(pos + 1, lead & 0x7fff);
    if (lead < kMinTwoUnitNodeValueLead) return (lead >> 6) - 1;
    if (lead < kThreeUnitNodeValueLead) {
      return (((lead & 0x7fc0) - kMinTwoUnitNodeValueLead) << 10) | this.at(pos + 1);
    }
    return (this.at(pos + 1) << 16) | this.at(pos + 2);
  }
}
