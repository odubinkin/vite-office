/** @fileoverview Original Any.h/Any.hxx ownership and value metadata at one actual public Any owner; later extraction/comparison/query/ostream families remain explicit source responsibilities. */
import type { uno_Any } from "../../../../uno/any2";
import {
  uno_any_construct,
  uno_type_any_construct,
  uno_any_destruct,
  uno_any_clear,
  uno_any_assign,
  uno_type_any_assign,
} from "../../../../uno/any2";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
import { typelib_typedescriptionreference_getDescription } from "../../../../typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
import { Type } from "./Type";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import {
  getTypeFromTypeDescriptionReference,
  getTypeFavourUnsigned,
  UnoType,
} from "../../../../unotype";
import type { UnoTypeArgument } from "../../../../unotype";
import { cpp_acquire, cpp_release } from "./genfunc";
import { reservedDataAddress } from "../../../../../source/uno/copy";
/** Original Any derives from its actual C record. Native C++ overload/type/lvalue syntax is explicit; no type is inferred from an untyped JS value and all construction remains in the existing C owner. */
export class Any implements uno_Any {
  /** Nonowning native address of this original pType field; contents are written only by the actual constructor, not initialized to an invented type/default. */
  private readonly typeAddress = [] as unknown as [R | null];
  /** Original source-initialized value address; declared fields do not supply native defaults. */
  declare pData: unknown;
  /** Original reserved field remains uninitialized until the selected original operation writes it. */
  declare pReserved: unknown;
  /** Original pType field read, sharing one live address with its borrowed Type view. @returns Actual reference. */
  get pType(): R | null {
    return this.typeAddress[0];
  }
  /** Original field write through the same actual address. @param value - Original assigned pointer. @returns Nothing. */
  set pType(value: R | null) {
    this.typeAddress[0] = value;
  }
  /** Original default/bool/copy/reference/description/Type constructors. The template form accepts the actual logical source lvalue address plus its erased declared C++ type argument; this selects the original favourUnsigned body without a value inference/factory. @param args - Original selected constructor inputs. @returns Actual owned Any. */
  constructor(
    ...args:
      | []
      | [value: boolean | Any]
      | [sourceAddress: unknown, type: Type | R | D | null | UnoTypeArgument]
  ) {
    if (args.length === 0) uno_any_construct(this, null, null, cpp_acquire);
    else if (args.length === 1) {
      const value = args[0];
      if (typeof value === "boolean")
        uno_type_any_construct(this, [value], UnoType.get("bool").getTypeLibType(), cpp_acquire);
      else uno_type_any_construct(this, value.pData, value.pType, cpp_acquire);
    } else {
      const [source, type] = args;
      if (typeof type === "string" || typeof type === "function" || Array.isArray(type))
        uno_type_any_construct(
          this,
          source,
          getTypeFavourUnsigned(type as UnoTypeArgument).getTypeLibType(),
          cpp_acquire,
        );
      else if (type instanceof Type)
        uno_type_any_construct(this, source, type.getTypeLibType(), cpp_acquire);
      else if (type !== null && "pSelf" in type)
        uno_any_construct(this, source, type as D, cpp_acquire);
      else uno_type_any_construct(this, source, type as R | null, cpp_acquire);
    }
  }
  /** Original destructor releases exactly once through actual C ownership; no field reset is added. @returns Nothing. */
  dispose(): void {
    uno_any_destruct(this, cpp_release);
  }
  /** Original copy assignment skips identical object addresses and returns this value. @param source - Original right side. @returns This same Any. */
  assign(source: Any): this {
    if (this !== source) this.setValue(source.pData, source.pType);
    return this;
  }
  /** Original internal move constructor first constructs an empty Any, swaps all fields, repairs only its own reserved address and leaves the source VOID data pointer non-null, potentially dangling to the new object. @param source - Rvalue source. @returns New actual Any. */
  static move(source: Any): Any {
    const result = new Any();
    result.swapFields(source);
    if (result.pData === reservedDataAddress(source)) result.pData = reservedDataAddress(result);
    return result;
  }
  /** Original internal move assignment swaps ownership rather than destroying/resetting the source, repairing both inline data aliases. @param source - Rvalue source. @returns This same Any. */
  moveAssign(source: Any): this {
    this.swapFields(source);
    if (this.pData === reservedDataAddress(source)) this.pData = reservedDataAddress(this);
    if (source.pData === reservedDataAddress(this)) source.pData = reservedDataAddress(source);
    return this;
  }
  /** Exact three std::swap operations in original field order; creates no new value/owner. @param source - Other actual record. @returns Nothing. */
  private swapFields(source: Any): void {
    const type = this.pType;
    this.pType = source.pType;
    source.pType = type;
    const data = this.pData;
    this.pData = source.pData;
    source.pData = data;
    const reserved = this.pReserved;
    this.pReserved = source.pReserved;
    source.pReserved = reserved;
  }
  /** Original const Type common-prefix view of this actual pType address, with no acquire/copy/ownership. @returns Stable live borrowed view. */
  getValueType(): Type {
    return getTypeFromTypeDescriptionReference(this.typeAddress);
  }
  /** Original borrowed reference pointer. @returns Actual pType. */
  getValueTypeRef(): R | null {
    return this.pType;
  }
  /** Original acquired description output replacement. @param output - Actual inout slot. @returns Nothing. */
  getValueTypeDescription(output: [D | null]): void {
    typelib_typedescriptionreference_getDescription(output, this.pType as R);
  }
  /** Original cast of reference class to the IDL enumeration. @returns Value type class. */
  getValueTypeClass(): TypeClass {
    return (this.pType as R).eTypeClass as unknown as TypeClass;
  }
  /** Original acquired type-name string owner. @returns Owned source name. */
  getValueTypeName(): OUString {
    return new OUString((this.pType as R).pTypeName);
  }
  /** Original non-VOID predicate. @returns Whether this Any has a value. */
  hasValue(): boolean {
    return (this.pType as R).eTypeClass !== C.VOID;
  }
  /** Original borrowed logical source address. @returns Actual pData, with no conversion or copy. */
  getValue(): unknown {
    return this.pData;
  }
  /** Original Type/reference/description value assignment delegates to the actual C owner. @param source - Actual source address or null default. @param type - Original selected borrowed type. @returns Nothing. */
  setValue(source: unknown, type: Type | R | D | null): void {
    if (type instanceof Type) this.setValue(source, type.getTypeLibType());
    else if (type !== null && "pSelf" in type)
      uno_any_assign(this, source, type, cpp_acquire, cpp_release);
    else uno_type_any_assign(this, source, type, cpp_acquire, cpp_release);
  }
  /** Original content destruction and empty construction. @returns Nothing. */
  clear(): void {
    uno_any_clear(this, cpp_release);
  }
}
/** Original deprecated global Any type helper forwards to actual UnoType; no static copy or factory. @returns Original borrowed Type. */
export function getCppuType(): Type {
  return UnoType.get("Any");
}
