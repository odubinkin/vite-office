/** @fileoverview Original Any.h/Any.hxx ownership and value metadata at one actual public Any owner; later typed comparison/get/string-expression/ostream families remain explicit source responsibilities. */
import { RuntimeException } from "./RuntimeException";
import { cppu_Any_extraction_failure_msg } from "../../../../../source/cppu/cppu_opt";
import { SAL_NO_ACQUIRE } from "../../../../../../sal/inc/types";
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
import { Reference, UNO_QUERY, UNO_QUERY_THROW } from "./Reference";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import {
  getTypeFromTypeDescriptionReference,
  getTypeFavourUnsigned,
  UnoType,
} from "../../../../unotype";
import type { UnoTypeArgument } from "../../../../unotype";
import { cpp_acquire, cpp_release, cpp_queryInterface } from "./genfunc";
import {
  uno_type_assignData,
  uno_type_equalData,
  uno_type_isAssignableFromData,
} from "../../../../uno/data";
import { assignNumeric } from "../../../../../source/uno/assign-numeric";
import type { rtl_uStringSlot } from "../../../../../../sal/inc/rtl/ustring.h";
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
  /** Original extractability predicate delegates to actual data/type/interface owners. @param type - Borrowed demanded type. @returns Original result. */
  isExtractableTo(type: Type): boolean {
    return uno_type_isAssignableFromData(
      type.getTypeLibType() as R,
      this.pData,
      this.pType as R,
      cpp_queryInterface,
      cpp_release,
    );
  }
  /** Original has<T> erased declared template selector; deleted Any instantiation remains a compile-time restriction. @param argument - Original non-Any type argument. @returns Original extractability predicate. */
  has(argument: Exclude<UnoTypeArgument, "Any">): boolean {
    return this.isExtractableTo(getTypeFavourUnsigned(argument));
  }
  /** Original Any-to-Any equality uses real shared data equality and C++ callbacks. @param value - Right side. @returns Original comparison. */
  operatorEquals(value: Any): boolean {
    return uno_type_equalData(
      this.pData,
      this.pType as R,
      value.pData,
      value.pType as R,
      cpp_queryInterface,
      cpp_release,
    );
  }
  /** Original negation of Any equality. @param value - Right side. @returns Original inequality. */
  operatorNotEquals(value: Any): boolean {
    return !this.operatorEquals(value);
  }
  /** Original insertion selects the declared C++ template type; bool delegates through a normalized sal_Bool temporary. Deleted Any instantiation is not available. @param source - Original lvalue address. @param argument - Declared non-Any type. @returns Nothing. */
  insert(source: unknown, argument: Exclude<UnoTypeArgument, "Any">): void {
    if (argument === "bool") this.insert([Number(Boolean((source as [boolean])[0]))], "sal_Bool");
    else this.setValue(source, getTypeFavourUnsigned(argument));
  }
  /** Original extraction specialization guards the direct source class before changing a destination; generic extraction alone delegates to real assignData, including its source Any unwrapping. Numeric conversions reuse the identical original source switches in the existing shared assignment owner. @param destination - Original initialized lvalue storage or actual specialized owned OUString/Type. @param argument - Declared non-Any destination type. @returns Original success; specialized failures leave the destination untouched, while generic assignment preserves any original partial writes. */
  extract(destination: unknown, argument: Exclude<UnoTypeArgument, "Any">): boolean {
    const sourceClass = (this.pType as R).eTypeClass;
    switch (argument) {
      case "bool":
      case "sal_Bool":
        if (sourceClass !== C.BOOLEAN) return false;
        (destination as [boolean | number])[0] =
          argument === "bool"
            ? Boolean((this.pData as [unknown])[0])
            : Number(Boolean((this.pData as [unknown])[0]));
        return true;
      case "sal_Int8":
        return assignNumeric(C.BYTE, destination as [number], sourceClass, this.pData as [number]);
      case "sal_Int16":
        return assignNumeric(C.SHORT, destination as [number], sourceClass, this.pData as [number]);
      case "sal_uInt16":
        return assignNumeric(
          C.UNSIGNED_SHORT,
          destination as [number],
          sourceClass,
          this.pData as [number],
        );
      case "sal_Int32":
        return assignNumeric(C.LONG, destination as [number], sourceClass, this.pData as [number]);
      case "sal_uInt32":
        return assignNumeric(
          C.UNSIGNED_LONG,
          destination as [number],
          sourceClass,
          this.pData as [number],
        );
      case "sal_Int64":
        return assignNumeric(C.HYPER, destination as [bigint], sourceClass, this.pData as [bigint]);
      case "sal_uInt64":
        return assignNumeric(
          C.UNSIGNED_HYPER,
          destination as [bigint],
          sourceClass,
          this.pData as [bigint],
        );
      case "float":
        return assignNumeric(C.FLOAT, destination as [number], sourceClass, this.pData as [number]);
      case "double":
        return assignNumeric(
          C.DOUBLE,
          destination as [number],
          sourceClass,
          this.pData as [number],
        );
      case "OUString":
        if (sourceClass !== C.STRING) return false;
        (destination as OUString).assign(OUString.unacquired(this.pData as rtl_uStringSlot));
        return true;
      case "Type":
        if (sourceClass !== C.TYPE) return false;
        (destination as Type).assign(getTypeFromTypeDescriptionReference(this.pData as [R]));
        return true;
      default:
        return uno_type_assignData(
          destination,
          getTypeFavourUnsigned(argument).getTypeLibType() as R,
          this.pData,
          this.pType as R,
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        );
    }
  }
  /** Original Any::get<T> consumed signed32 specialization uses default initialization, real extraction and the original failure diagnostic. @param argument - Compiler-erased declared type. @returns Extracted native signed32 value. */
  get(argument: "sal_Int32"): number {
    const value: [number] = [0];
    if (!this.extract(value, argument)) {
      const message = new OUString(
          cppu_Any_extraction_failure_msg(
            this,
            getTypeFavourUnsigned(argument).getTypeLibType() as R,
          ),
          SAL_NO_ACQUIRE,
        ),
        context = new Reference();
      try {
        throw new RuntimeException(message, context);
      } finally {
        message.dispose();
        context.dispose();
      }
    }
    return value[0];
  }
  /** Original internal Any::query<T> definition in Reference.hxx constructs the actual queried Reference. @param argument - Declared interface type. @returns Original owned reference. */
  query(argument: UnoTypeArgument = "XInterface"): Reference {
    return new Reference(this, UNO_QUERY, argument);
  }
  /** Original internal Any::queryThrow<T> constructs the actual throwing queried Reference. @param argument - Declared interface type. @returns Original owned reference or RuntimeException. */
  queryThrow(argument: UnoTypeArgument = "XInterface"): Reference {
    return new Reference(this, UNO_QUERY_THROW, argument);
  }
}
/** Original deprecated global Any type helper forwards to actual UnoType; no static copy or factory. @returns Original borrowed Type. */
export function getCppuType(): Type {
  return UnoType.get("Any");
}

/** Original toAny template/copy overload; declared source addresses are explicit and Any copy reuses its real owner. @param args - Actual source Any or lvalue address/type. @returns Original owned Any. */
export function toAny(
  ...args: [source: Any] | [sourceAddress: unknown, argument: Exclude<UnoTypeArgument, "Any">]
): Any {
  return args.length === 1 ? new Any(args[0]) : new Any(args[0], args[1]);
}
/** Original rvalue toAny overload delegates to the actual Any move constructor. @param source - Original rvalue. @returns Original moved value. */
export function toAnyMove(source: Any): Any {
  return Any.move(source);
}
/** Original fromAny specialization assigns an Any directly; generic form delegates to original extraction. C++ non-null assertion is a producer precondition, not a new conversion policy. @param source - Original Any. @param destination - Initialized addressed destination or actual Any. @param argument - Declared destination type. @returns Original success. */
export function fromAny(source: Any, destination: unknown, argument: UnoTypeArgument): boolean {
  if (argument === "Any") {
    (destination as Any).assign(source);
    return true;
  }
  return source.extract(destination, argument);
}
