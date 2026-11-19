/** @fileoverview Original non-reference-counting ImplHelper1 template specialization from include/cppuhelper/implbase1.hxx. Multiple native base casts are compiler-erased; helper queries operate on the actual complete component, with no secondary object or reference registry. */
import {
  ImplHelper_query,
  ImplHelper_getTypes,
  ImplHelper_getImplementationId,
  type class_data,
} from "./implbase_ex";
import type { DeclaredInterface } from "./implbase";
import { XTypeProvider } from "../../udkapi/com/sun/star/lang/XTypeProvider";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
/** Source helper has no reference counter. Complete derived classes supply acquire/release. */
abstract class ImplHelper1Base implements XTypeProvider {
  /** Original pure reference-count acquisition, supplied by the complete derived class. @returns Nothing. */
  abstract acquire(): void;
  /** Original pure reference-count release. @returns Nothing. */
  abstract release(): void;
  /** Original pure interface query. @param type - Demanded interface. @returns Owned Any. */
  abstract queryInterface(type: Type): Any;
  /** Original type-provider declaration. @returns Owned declared type sequence. */
  abstract getTypes(): Sequence<Type>;
  /** Original obsolete ID declaration. @returns Owned bytes. */
  abstract getImplementationId(): Sequence<number>;
}
const specializations: { declaration: DeclaredInterface; constructor: typeof ImplHelper1Base }[] =
  [];
/** Compiler template argument binding, separate from WeakImplHelper. */
export const ImplHelper1 = {
  /** Original single interface plus XTypeProvider class_data1. @param declaration - Exact source interface. @returns Stable abstract helper base. */
  specialize(declaration: DeclaredInterface): typeof ImplHelper1Base {
    const previous = specializations.find(
      /** Compares actual compile-time interface identity. @param value - Existing specialization. @returns Match. */ (
        value,
      ) => value.declaration === declaration,
    );
    if (previous) return previous.constructor;
    const data: class_data = {
      m_nTypes: 2,
      m_storedTypeRefs: false,
      m_createdId: false,
      m_id: new Int8Array(16),
      m_typeEntries: [declaration, XTypeProvider].map(
        /** Erases native static interface offsets; actual complete object identity remains. @param type - Source interface. @returns Type entry. */ (
          type,
        ) => ({ m_type: { getCppuType: type.static_type }, m_offset: 0 }),
      ),
    };
    /** Native static helper base, never a separately allocated component. */
    abstract class Body extends ImplHelper1Base {
      /** Original helper query. @param type - Demanded interface. @returns Acquired Any. */
      override queryInterface(type: Type): Any {
        return ImplHelper_query(
          type,
          data,
          /** Native interface cast. @returns Actual complete object. */ () => this,
        );
      }
      /** Original two declared types. @returns Owned types. */
      override getTypes(): Sequence<Type> {
        return ImplHelper_getTypes(data);
      }
      /** Original obsolete identifier. @returns Empty bytes. */
      override getImplementationId(): Sequence<number> {
        return ImplHelper_getImplementationId(data);
      }
    }
    specializations.push({ declaration, constructor: Body });
    return Body;
  },
};
