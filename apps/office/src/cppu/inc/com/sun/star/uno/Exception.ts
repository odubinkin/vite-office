/** @fileoverview Original Exception.idl and cppumaker normal internal generated value class reuse real shared OUString/Reference owners; debug source-location append is a separate unverified configuration. */
import { OUString, type OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import { Reference } from "./Reference";
/** Original borrowed exception fields. */
export interface ExceptionConstReference {
  readonly Message: OUStringConstReference;
  readonly Context: Reference;
}
/** Actual generated Exception value, not a JavaScript Error or a type/provider stand-in. */
export class Exception implements ExceptionConstReference {
  protected fields: { Message: OUString; Context: Reference };
  /** Original default, two-field and implicit copy constructors. @param args - Original selected arguments in IDL field order. @returns New exception value. */
  constructor(
    ...args:
      [] | [source: ExceptionConstReference] | [Message: OUStringConstReference, Context: Reference]
  ) {
    if (args.length === 0) this.fields = { Message: new OUString(), Context: new Reference() };
    else if (args.length === 1)
      this.fields = {
        Message: new OUString(args[0].Message),
        Context: new Reference(args[0].Context),
      };
    else this.fields = { Message: new OUString(args[0]), Context: new Reference(args[1]) };
  }
  /** Original stable string member owner. @returns Message. */
  get Message(): OUString {
    return this.fields.Message;
  }
  /** Original string member assignment. @param value - Borrowed value. @returns Nothing. */
  set Message(value: OUStringConstReference) {
    this.fields.Message.assign(value);
  }
  /** Original stable interface-reference member owner. @returns Context. */
  get Context(): Reference {
    return this.fields.Context;
  }
  /** Original interface-reference member assignment. @param value - Borrowed value. @returns Nothing. */
  set Context(value: Reference) {
    this.fields.Context.assign(value);
  }
  /** Original implicit memberwise move construction; the class selected by the native allocation retains its actual prototype. @param source - Rvalue. @returns Transferred value. */
  static move(source: Exception): Exception {
    const result = Object.create(this.prototype) as Exception;
    result.fields = {
      Message: OUString.move(source.Message),
      Context: Reference.move(source.Context),
    };
    return result;
  }
  /** Original implicit ordered copy assignment. @param source - Borrowed right side. @returns This value. */
  assign(source: ExceptionConstReference): this {
    this.Message = source.Message;
    this.Context = source.Context;
    return this;
  }
  /** Original implicit ordered memberwise move assignment; Context releases/transfers rather than swapping. @param source - Rvalue right side. @returns This value. */
  moveAssign(source: Exception): this {
    this.Message.moveAssign(source.Message);
    this.Context.moveAssign(source.Context);
    return this;
  }
  /** Original implicit reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.Context.dispose();
    this.Message.dispose();
  }
}
