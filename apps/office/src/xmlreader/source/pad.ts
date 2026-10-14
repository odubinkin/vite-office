/** @fileoverview Original xmlreader Pad borrowed/ephemeral accumulation using ordinary JS byte arrays rather than a native buffer allocation engine. */
import { Span } from "../inc/span";
import type { ByteView } from "../inc/span";

/** Original static empty string literal, including its terminator. */
const emptyLiteral = new Uint8Array([0]);

/** Actual Pad logical state; borrowed views are certified only until the next mutation, without native allocation/address parity. */
export class Pad {
  private readonly span_ = new Span();
  private readonly buffer_: number[] = [0];
  /** Original stable-input/literal append. Native literal arrays include the final excluded element. @param args - Actual selected form. @returns Nothing. */
  public add(...args: [literal: ByteView] | [begin: ByteView, length: number]): void {
    const begin = args[0];
    const length = (args.length === 1 ? begin.length - 1 : args[1]) | 0;
    if (length !== 0) {
      this.flushSpan();
      if (this.buffer_.length === 1) {
        this.span_.begin = begin;
        this.span_.length = length;
      } else this.append(begin, length);
    }
  }
  /** Original ephemeral input is immediately copied; zero input does not flush a borrowed span. @param begin - Actual byte view. @param length - Signed32 count. @returns Nothing. */
  public addEphemeral(begin: ByteView, length: number): void {
    length |= 0;
    if (length !== 0) {
      this.flushSpan();
      this.append(begin, length);
    }
  }
  /** Original logical clear retains this Pad and makes its buffer empty/terminated. @returns Nothing. */
  public clear(): void {
    this.span_.clear();
    this.buffer_.length = 1;
    this.buffer_[0] = 0;
  }
  /** Original by-value span over borrowed/empty/owned bytes. @returns New span sharing the current backing. */
  public get(): Span {
    if (this.span_.is()) return new Span(this.span_);
    if (this.buffer_.length === 1) return new Span(emptyLiteral);
    return new Span(this.buffer_, this.buffer_.length - 1);
  }
  /** Original flush copies pending borrowed data before clearing only its pointer. @returns Nothing. */
  private flushSpan(): void {
    if (this.span_.is()) {
      this.append(this.span_.begin as ByteView, this.span_.length);
      this.span_.clear();
    }
  }
  /** Erases OStringBuffer append syntax into native arrays, preserving the final zero without a capacity/allocator library. @param begin - Actual source bytes. @param length - Valid count. @returns Nothing. */
  private append(begin: ByteView, length: number): void {
    this.buffer_.pop();
    for (let i = 0; i < length; i++) this.buffer_.push((begin[i] as number) & 0xff);
    this.buffer_.push(0);
  }
}
