/** @fileoverview Original internal WeakImplHelper variadic template over source-owned class_data/query and OWeakObject. Static specialization binding erases compiler inheritance casts; there is no per-instance type cache or alternate UNO provider. */
import { OWeakObject } from "./weak";
import {
  WeakImplHelper_query,
  WeakImplHelper_getTypes,
  ImplHelper_queryNoXInterface,
  ImplInhHelper_getTypes,
  type class_data,
} from "./implbase_ex";
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
  new (source?: Readonly<OWeakObject>): OWeakObject & XTypeProvider;
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
    const body = /** Original compiler-emitted specialization retains its own cd even under qualified base calls from inheritance helpers. */ class extends WeakImplHelper {
      /** Original specialization-qualified query. @param type - Demanded interface. @returns Owned Any. */
      override queryInterface(type: Type): Any {
        return WeakImplHelper_query(
          type,
          ClassData,
          /** Compiler cast to the actual object. @returns Same identity. */ () => this,
          this,
        );
      }
      /** Original specialization-qualified declared types. @returns Owned sequence. */
      override getTypes(): Sequence<Type> {
        return WeakImplHelper_getTypes(ClassData);
      }
    };
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
  /** Implemented by each compiler specialization with its own lexical cd. @returns Owned declared types. */
  abstract getTypes(): Sequence<Type>;
  /** Original obsolete identifier is always empty. @returns Actual empty byte sequence. */
  getImplementationId(): Sequence<number> {
    return new (Sequence.specialize<number>("sal_Int8", 1))();
  }
}

/** Erased complete native BaseClass constructor; actual argument tuples are retained by specialize. */
type InheritanceBase = new (...args: never[]) => OWeakObject & XTypeProvider;
/** Exact native BaseClass and ordered interface template arguments. */
interface InheritanceSpecialization {
  readonly base: InheritanceBase;
  readonly interfaces: readonly DeclaredInterface[];
  readonly constructor: InheritanceBase;
}
const inheritanceSpecializations: InheritanceSpecialization[] = [];
/** Original ImplInheritanceHelper compiler specializations; no additional component or UNO provider. */
export const ImplInheritanceHelper = {
  /** Extends the actual complete base and adds only declared interfaces. @param Base - Actual native base constructor. @param interfaces - Ordered additional interfaces. @returns Same constructor argument/result contract, with native inherited virtual methods. */
  specialize<B extends InheritanceBase>(Base: B, ...interfaces: readonly DeclaredInterface[]): B {
    const previous = inheritanceSpecializations.find(
      /** Exact template identity. @param entry - Existing specialization. @returns Match. */ (
        entry,
      ) =>
        entry.base === Base &&
        entry.interfaces.length === interfaces.length &&
        entry.interfaces.every(
          /** Exact interface argument identity. @param value - Declaration. @param index - Position. @returns Match. */ (
            value,
            index,
          ) => value === interfaces[index],
        ),
    );
    if (previous) return previous.constructor as B;
    const data: class_data = {
      m_nTypes: interfaces.length + 1,
      m_storedTypeRefs: false,
      m_createdId: false,
      m_id: new Int8Array(16),
      m_typeEntries: [...interfaces, XTypeProvider].map(
        /** Original ImplClassData adds XTypeProvider. @param value - Declaration. @returns Entry. */ (
          value,
        ) => ({ m_type: { getCppuType: value.static_type }, m_offset: 0 }),
      ),
    };
    const Parent = Base as unknown as new (...args: unknown[]) => OWeakObject & XTypeProvider;
    /** Compiler-erased variadic inheritance; all base calls remain statically qualified. */
    class Body extends Parent {
      /** Original additional-interface query then qualified base fallback. @param type - Demanded interface. @returns Owned Any. */
      override queryInterface(type: Type): Any {
        const result = ImplHelper_queryNoXInterface(
          type,
          data,
          /** Compiler cast. @returns Same identity. */ () => this,
        );
        if (result.hasValue()) return result;
        result.dispose();
        return Parent.prototype.queryInterface.call(this, type);
      }
      /** Original qualified base acquire. @returns Nothing. */
      override acquire(): void {
        Parent.prototype.acquire.call(this);
      }
      /** Original qualified base release. @returns Nothing. */
      override release(): void {
        Parent.prototype.release.call(this);
      }
      /** Original additional types precede all base types without deduplication. @returns Owned sequence. */
      override getTypes(): Sequence<Type> {
        const additional = Parent.prototype.getTypes.call(this);
        try {
          return ImplInhHelper_getTypes(data, additional);
        } finally {
          additional.dispose();
        }
      }
      /** Original obsolete identifier is empty. @returns Owned empty bytes. */
      override getImplementationId(): Sequence<number> {
        return new (Sequence.specialize<number>("sal_Int8", 1))();
      }
    }
    const result = Body as unknown as B;
    inheritanceSpecializations.push({
      base: Base,
      interfaces: [...interfaces],
      constructor: result,
    });
    return result;
  },
};
