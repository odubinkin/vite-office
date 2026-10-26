/** @fileoverview Original implbase_ex.hxx class data and selected non-aggregating helper declarations; original C++ pointer addition is an explicit caller-supplied compiler cast, not a UNO service/type provider. */
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import type { typelib_TypeDescriptionReference } from "../../cppu/inc/typelib/typedescription";

/** Original union is initialized with a static getter, then overwritten by its unacquired reference. */
export type TypeEntryType =
  { getCppuType: (unused?: unknown) => Type } | { typeRef: typelib_TypeDescriptionReference };
/** Original type_entry declaration. */
export interface type_entry {
  m_type: TypeEntryType;
  /** Original object offset in the selected caller's compiler layout. */
  m_offset: number;
}
/** Original common prefix shared by class_dataN specializations. */
export interface class_data {
  m_nTypes: number;
  m_storedTypeRefs: boolean;
  m_createdId: boolean;
  m_id: Int8Array;
  m_typeEntries: type_entry[];
}
/** Erased static_cast<char*>(that)+offset operation. Concrete caller binds actual interface facets; no runtime interface inference occurs here. */
export type ImplementationPointer = (offset: number) => XInterface;
export { WeakImplHelper_query, WeakImplHelper_getTypes } from "../source/implbase_ex";
