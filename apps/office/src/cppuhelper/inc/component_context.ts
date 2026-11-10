/** @fileoverview Original ContextEntry_Init value owner from component_context.hxx. Public context creation and its environment/bridge orchestration remain unported; no replacement context factory is supplied. */
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
/** Original input struct owns its real name/value fields and the false late-init default. */
export class ContextEntry_Init {
  m_bLateInitService: boolean;
  private readonly name: OUString;
  private readonly value: Any;
  /** Original mutable name member. @returns Stable actual member owner. */
  get m_sName(): OUString {
    return this.name;
  }
  /** Original name assignment retains member identity. @param source - Actual source value. @returns Nothing. */
  set m_sName(source: OUStringConstReference) {
    this.name.assign(source);
  }
  /** Original mutable Any member. @returns Stable actual member owner. */
  get m_aValue(): Any {
    return this.value;
  }
  /** Original Any assignment retains member identity. @param source - Actual source value. @returns Nothing. */
  set m_aValue(source: Any) {
    this.value.assign(source);
  }
  /** Original default/member and implicit-copy constructors. @param args - Actual declared form; member late-init defaults to false. @returns Owned input value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<ContextEntry_Init>]
      | [name: OUStringConstReference, value: Any, lateInit?: boolean]
  ) {
    let source: Any | undefined;
    if (args.length === 0) {
      this.m_bLateInitService = false;
      this.name = new OUString();
    } else if (args.length === 1) {
      this.m_bLateInitService = args[0].m_bLateInitService;
      this.name = new OUString(args[0].m_sName);
      source = args[0].m_aValue;
    } else {
      this.m_bLateInitService = args[2] === undefined ? false : args[2];
      this.name = new OUString(args[0]);
      source = args[1];
    }
    try {
      this.value = source === undefined ? new Any() : new Any(source);
    } catch (error) {
      this.name.dispose();
      throw error;
    }
  }
  /** Original implicit fieldwise assignment. @param source - Actual source value. @returns This value. */
  assign(source: Readonly<ContextEntry_Init>): this {
    this.m_bLateInitService = source.m_bLateInitService;
    this.m_sName.assign(source.m_sName);
    this.m_aValue.assign(source.m_aValue);
    return this;
  }
  /** Original member destruction in reverse order. @returns Nothing. */
  dispose(): void {
    this.m_aValue.dispose();
    this.m_sName.dispose();
  }
}
