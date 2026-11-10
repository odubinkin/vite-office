/** @fileoverview ICU78.3 UCharsTrie scalar traversal over the original serialized UTF16 units. */
import { UStringTrieResult as Result } from "./unicode/ustringtrie";

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

/** Native borrowed trie reader used by UCharsDictionaryMatcher. */
export class UCharsTrie {
  private pos: number | null = 0;
  private remainingMatchLength = -1;

  /** Borrows initialized native storage. @param chars - Serialized UTF16 units. @returns Reader. */
  constructor(private readonly chars: Uint16Array) {}

  /** Native scalar lookup at the root. @param unit - Original int32 input unit. @returns Result. */
  first(unit: number): Result {
    this.remainingMatchLength = -1;
    return this.nextImpl(0, unit);
  }

  /** Advances one native input unit. @param unit - Original int32 input unit. @returns Result. */
  next(unit: number): Result {
    let pos = this.pos;
    if (pos === null) return Result.USTRINGTRIE_NO_MATCH;
    if (this.remainingMatchLength < 0) return this.nextImpl(pos, unit);
    if (unit !== this.at(pos++)) return this.stop();
    --this.remainingMatchLength;
    this.pos = pos;
    return this.remainingMatchLength < 0 ? this.nodeResult(pos) : Result.USTRINGTRIE_NO_VALUE;
  }

  /** Reads a valid matching node's signed32 value. @returns Native value. */
  getValue(): number {
    const pos = this.pos as number,
      lead = this.at(pos);
    if (lead & kValueIsFinal) return this.readValue(pos + 1, lead & 0x7fff);
    if (lead < kMinTwoUnitNodeValueLead) return (lead >> 6) - 1;
    if (lead < kThreeUnitNodeValueLead)
      return (((lead & 0x7fc0) - kMinTwoUnitNodeValueLead) << 10) | this.at(pos + 1);
    return (this.at(pos + 1) << 16) | this.at(pos + 2);
  }

  /** Traverses an original non-linear-node position. @param pos - Native node offset. @param unit - Input. @returns Result. */
  private nextImpl(pos: number, unit: number): Result {
    let node = this.at(pos++);
    for (;;) {
      if (node < kMinLinearMatch) return this.branchNext(pos, node, unit);
      if (node < kMinValueLead) {
        if (unit !== this.at(pos++)) break;
        this.remainingMatchLength = node - kMinLinearMatch - 1;
        this.pos = pos;
        return this.remainingMatchLength < 0 ? this.nodeResult(pos) : Result.USTRINGTRIE_NO_VALUE;
      }
      if (node & kValueIsFinal) break;
      if (node >= kMinTwoUnitNodeValueLead) pos += node < kThreeUnitNodeValueLead ? 1 : 2;
      node &= kNodeTypeMask;
    }
    return this.stop();
  }

  /** Traverses the original binary split and short linear branch. @param pos - Native branch offset. @param length - Encoded branch length. @param unit - Input. @returns Result. */
  private branchNext(pos: number, length: number, unit: number): Result {
    if (!length) length = this.at(pos++);
    ++length;
    while (length > kMaxBranchLinearSubNodeLength) {
      const less = unit < this.at(pos++),
        half = length >> 1,
        lead = this.at(pos++),
        extra = lead < kMinTwoUnitDeltaLead ? 0 : lead === kThreeUnitDeltaLead ? 2 : 1;
      if (less) {
        const delta =
          extra === 0
            ? lead
            : extra === 1
              ? ((lead - kMinTwoUnitDeltaLead) << 16) | this.at(pos)
              : (this.at(pos) << 16) | this.at(pos + 1);
        pos += delta;
        length = half;
      } else length -= half;
      pos += extra;
    }
    do {
      const matches = unit === this.at(pos++),
        lead = this.at(pos),
        value = lead & 0x7fff;
      if (matches && lead & kValueIsFinal) {
        this.pos = pos;
        return Result.USTRINGTRIE_FINAL_VALUE;
      }
      ++pos;
      const extra = value < kMinTwoUnitValueLead ? 0 : value < kThreeUnitValueLead ? 1 : 2;
      if (matches) {
        this.pos = pos + extra + this.readValue(pos, value);
        return this.nodeResult(this.pos);
      }
      pos += extra;
    } while (--length > 1);
    if (unit !== this.at(pos++)) return this.stop();
    this.pos = pos;
    return this.nodeResult(pos);
  }

  /** Reads original compact integer payload. @param pos - Payload offset. @param lead - Lead with final bit removed. @returns Signed32 value. */
  private readValue(pos: number, lead: number): number {
    if (lead < kMinTwoUnitValueLead) return lead;
    if (lead < kThreeUnitValueLead) return ((lead - kMinTwoUnitValueLead) << 16) | this.at(pos);
    return (this.at(pos) << 16) | this.at(pos + 1);
  }

  /** Interprets the stored value bits at a node boundary. @param pos - Node offset. @returns Match result. */
  private nodeResult(pos: number): Result {
    const node = this.at(pos);
    if (node < kMinValueLead) return Result.USTRINGTRIE_NO_VALUE;
    return node & kValueIsFinal
      ? Result.USTRINGTRIE_FINAL_VALUE
      : Result.USTRINGTRIE_INTERMEDIATE_VALUE;
  }

  /** Marks the iterator stopped. @returns No match. */
  private stop(): Result {
    this.pos = null;
    return Result.USTRINGTRIE_NO_MATCH;
  }

  /** Borrows a source-valid char16_t unit. @param pos - Native offset. @returns Code unit. */
  private at(pos: number): number {
    return this.chars[pos] as number;
  }
}
