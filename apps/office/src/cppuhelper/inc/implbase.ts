/** @fileoverview Original internal WeakImplHelper variadic template over source-owned class_data/query and OWeakObject. Static specialization binding erases compiler inheritance casts; there is no per-instance type cache or alternate UNO provider. */
import { OWeakObject } from "./weak";
import { WeakImplHelper_query, WeakImplHelper_getTypes, type class_data } from "./implbase_ex";
import { XTypeProvider } from "../../udkapi/com/sun/star/lang/XTypeProvider";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";

/** Erased actual Interface::static_type compile-time argument. */
export interface DeclaredInterface {
  readonly static_type: () => Type;
}
/** Original compiler-emitted specialization constructor. */
export interface WeakImplHelperConstructor {
  /** Constructs the genuine weak/type-provider base. @param source - Optional copy/move source. @returns Actual base. */
  new (source?: Readonly<OWeakObject>): WeakImplHelper;
  readonly ClassData: class_data;
}
/** Exact ordered template argument identity, with no instantiated value or UNO type registry. */
interface Specialization {
  readonly interfaces: readonly DeclaredInterface[];
  readonly constructor: WeakImplHelperConstructor;
}
const specializations: Specialization[] = [];
/** Original OWeakObject/XTypeProvider base shared by all compiler-emitted interface specializations. */
export abstract class WeakImplHelper extends OWeakObject implements XTypeProvider {
  /** Erases native compile-time variadic inheritance. TypeScript structural interface casts share this object's identity; numeric physical C++ layouts are not claimed. @param interfaces - Exact ordered source-declared interfaces. @returns Stable specialization constructor. */
  static specialize(...interfaces: readonly DeclaredInterface[]): WeakImplHelperConstructor {
    const previous = specializations.find(
      /** Compares exact template arguments, without looking up UNO names. @param entry - Compiler cache entry. @returns Same exact specialization. */ (
        entry,
      ) =>
        entry.interfaces.length === interfaces.length &&
        entry.interfaces.every(
          /** Original ordered template argument identity. @param value - Declared interface. @param index - Argument position. @returns Same declaration. */ (
            value,
            index,
          ) => value === interfaces[index],
        ),
    );
    if (previous) return previous.constructor;
    const ClassData: class_data = {
      m_nTypes: interfaces.length + 1,
      m_storedTypeRefs: false,
      m_createdId: false,
      m_id: new Int8Array(16),
      m_typeEntries: [...interfaces, XTypeProvider].map(
        /** Original ImplClassData initializer emits getters and compiler offsets without evaluating types. @param value - Declared source interface. @returns Type entry. */ (
          value,
        ) => ({ m_type: { getCppuType: value.static_type }, m_offset: 0 }),
      ),
    };
    const body = /** Original compiler-emitted template specialization, with shared source-owned methods. */ class extends WeakImplHelper {};
    Object.defineProperty(body, "ClassData", { value: ClassData });
    const result = body as unknown as WeakImplHelperConstructor;
    specializations.push({ interfaces: [...interfaces], constructor: result });
    return result;
  }
  /** Original qualified weak base controls lifetime. @returns Nothing. */
  override acquire(): void {
    super.acquire();
  }
  /** Original qualified weak base controls lifetime. @returns Nothing. */
  override release(): void {
    super.release();
  }
  /** Original weak query body uses specialization-static class data and the qualified weak root. @param type - Demanded type. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    return WeakImplHelper_query(
      type,
      (this.constructor as WeakImplHelperConstructor).ClassData,
      /** Erased structural static_cast to this actual object; no interface is manufactured. @returns Borrowed same object. */ () =>
        this,
      this,
    );
  }
  /** Original class-data sequence includes the final XWeak entry. @returns Owned declared Type sequence. */
  getTypes(): Sequence<Type> {
    return WeakImplHelper_getTypes((this.constructor as WeakImplHelperConstructor).ClassData);
  }
  /** Original obsolete identifier is always empty. @returns Actual empty byte sequence. */
  getImplementationId(): Sequence<number> {
    return new (Sequence.specialize<number>("sal_Int8", 1))();
  }
}
