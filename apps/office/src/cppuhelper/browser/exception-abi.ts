/** @fileoverview JavaScript exception ABI binding for cppuhelper/exc_hlp.hxx. Actual generated classes and shared UNO storage own all values; C++ machine-code/environment mapping is a distinct platform ABI. */
import { bindExceptionAbi } from "../inc/exc_hlp";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../cppu/inc/com/sun/star/uno/Exception";
import { activeException } from "../../cppu/inc/uno/exception-context";
export { withCaughtException } from "../../cppu/inc/uno/exception-context";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { Sequence, type SequenceConstructor } from "../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../cppu/inc/uno/sequence2";
import { TypeDescription } from "../../cppu/inc/typelib/typedescription.hxx";
import { getTypeFromTypeDescriptionReference } from "../../cppu/inc/unotype";
import {
  type typelib_TypeDescriptionReference as R,
  type typelib_TypeDescription as D,
  type typelib_CompoundTypeDescription as P,
  type typelib_StructTypeDescription as S,
  type typelib_IndirectTypeDescription as I,
} from "../../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../cppu/inc/typelib/typeclass";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { rtl_uString, rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import { exceptionBindingByName, exceptionBindingFor } from "../../cppu/inc/uno/exception-bindings";

/** Exact counted UTF16 type/member name. @param value - Existing string data. @returns Native spelling. */
function name(value: rtl_uString): string {
  let result = "";
  for (let i = 0; i < value.length; ++i) result += String.fromCharCode(value.buffer[i] as number);
  return result;
}
/** Original RuntimeException diagnostics with default empty Context. @param message - Source literal. @returns Never. */
function fail(message: string): never {
  const units = new Uint16Array(message.length);
  for (let i = 0; i < message.length; ++i) units[i] = message.charCodeAt(i);
  const text = new OUString(units, units.length),
    context = new Reference();
  try {
    throw new RuntimeException(text, context);
  } finally {
    context.dispose();
    text.dispose();
  }
}
/** Actual native compound-address protocol; the interface is a borrowed memory view, not a record/value factory. */
interface Address {
  get(offset: number): unknown;
}
const sequences = new WeakMap<R, SequenceConstructor<unknown>>();
/** Temporary ABI views keep only acquired type descriptions alive while an actual generated copy constructor reads the source. */
class BorrowedFields {
  private readonly descriptions: TypeDescription[] = [];
  /** Releases metadata owners; no borrowed field or source Any is destroyed. @returns Nothing. */
  dispose(): void {
    while (this.descriptions.length) (this.descriptions.pop() as TypeDescription).dispose();
  }
  /** Borrows the existing complete declaration for a field. @param type - Declared native type. @returns Actual description. */
  private description(type: R): D {
    const owner = new TypeDescription(type);
    this.descriptions.push(owner);
    owner.makeComplete();
    return owner.get() as D;
  }
  /** Reads the existing field according to its actual declaration; there is no inference from values or alternate type/default provider. @param type - Declared native type. @param address - Actual initialized lvalue. @returns Borrowed source field. */
  value(type: R, address: unknown): unknown {
    switch (type.eTypeClass) {
      case C.STRING:
        return OUString.unacquired(address as rtl_uStringSlot);
      case C.INTERFACE:
        return Reference.unacquired(address as [XInterface | null]);
      case C.TYPE:
        return getTypeFromTypeDescriptionReference(address as [R | null]);
      case C.ANY:
        return address;
      case C.STRUCT:
      case C.EXCEPTION:
        return this.compound(this.description(type), address as Address);
      case C.SEQUENCE: {
        const description = this.description(type),
          element = (description.pSelf as unknown as I).pType as R;
        let binding = sequences.get(element);
        if (binding === undefined) {
          const item = this.description(element);
          binding = Sequence.specialize(
            /** Actual declared element type; no synthesized UNO metadata. @returns Borrowed Type. */ () =>
              getTypeFromTypeDescriptionReference([element]),
            item.nSize,
          );
          sequences.set(element, binding);
        }
        return Sequence.unacquired(binding, address as [uno_Sequence | null]);
      }
      default:
        return (address as [unknown])[0];
    }
  }
  /** Creates only a const member-name view over the original compound address. The linked generated copy constructor remains the value allocator. @param description - Actual native description. @param address - Existing source compound. @returns Borrowed member projection. */
  compound(description: D, address: Address): object {
    const result = Object.create(null) as object;
    const fields =
      description.eTypeClass === C.STRUCT
        ? (description.pSelf as unknown as S).aBase
        : (description.pSelf as unknown as P);
    this.members(result, fields, address);
    return result;
  }
  /** Binds base and declared members at their actual offsets, in source order. @param result - Borrowed projection. @param fields - Original declaration. @param address - Existing compound source. @returns Nothing. */
  private members(result: object, fields: P, address: Address): void {
    if (fields.pBaseTypeDescription) this.members(result, fields.pBaseTypeDescription, address);
    for (let i = 0; i < fields.nMembers; ++i) {
      const offset = (fields.pMemberOffsets as Int32Array)[i] as number,
        type = (fields.ppTypeRefs as R[])[i] as R;
      Object.defineProperty(
        result,
        name((fields.ppMemberNames as rtl_uString[])[i] as rtl_uString),
        {
          get: /** Reads one actual declared source lvalue, without acquisition of its value. @returns Borrowed field. */ () =>
            this.value(type, address.get(offset)),
        },
      );
    }
  }
}

/** JavaScript binding of the original generic throw operation; generated class linkage supplies this host's RTTI/copy construction. @param exception - Original borrowed exception Any. @returns Never. */
export function throwException(exception: Any): never {
  if ((exception.getValueTypeRef() as R).eTypeClass !== C.EXCEPTION)
    fail("no UNO exception given (must be derived from com::sun::star::uno::Exception)!");
  const type = exception.getValueTypeRef() as R,
    binding = exceptionBindingByName(name(type.pTypeName));
  if (!binding) fail("cannot get binary UNO to C++ mapping!");
  const description = new TypeDescription(type),
    fields = new BorrowedFields();
  try {
    description.makeComplete();
    throw new binding.Constructor(
      fields.compound(description.get() as D, exception.getValue() as Address) as never,
    );
  } finally {
    fields.dispose();
    description.dispose();
  }
}
/** JavaScript binding of the original caught-exception-to-Any operation. The source requires an active UNO catch scope. @returns Independent owned Any. */
export function getCaughtException(): Any {
  const exception = activeException() as Exception,
    binding = exceptionBindingFor(exception);
  if (!binding) fail("cannot get C++ to binary UNO mapping!");
  return new Any(exception, binding.type);
}

/** Installs the JavaScript execution ABI through the platform-neutral public contract. @returns Nothing. */
export function initializeExceptionAbi(): void {
  bindExceptionAbi({ throwException, getCaughtException });
}
