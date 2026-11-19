/** @fileoverview Original standalone MalformedUriException value from rtl/malformeduriexception.hxx. */
import { OUString, type OUStringConstReference } from "./ustring";
/** Original non-UNO exception; assignment returns an independent copy by value. */
export class MalformedUriException {
  private readonly m_aMessage: OUString;
  /** Original message/copy constructor. @param source - Borrowed message or exception. @returns Owned exception value. */
  constructor(source: OUStringConstReference | MalformedUriException) {
    this.m_aMessage = new OUString(
      source instanceof MalformedUriException ? source.m_aMessage : source,
    );
  }
  /** Original field destructor. @returns Nothing. */
  dispose(): void {
    this.m_aMessage.dispose();
  }
  /** Original value-returning assignment. @param other - Borrowed right operand. @returns An owned copy of this exception. */
  assign(other: MalformedUriException): MalformedUriException {
    this.m_aMessage.assign(other.m_aMessage);
    return new MalformedUriException(this);
  }
  /** Original borrowed message reference. @returns Message valid for this value's lifetime. */
  getMessage(): OUStringConstReference {
    return this.m_aMessage;
  }
}
