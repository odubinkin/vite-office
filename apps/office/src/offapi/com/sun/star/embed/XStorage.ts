/** @fileoverview Original XStorage IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XNameAccess } from "../../../../../cppu/inc/com/sun/star/container/XNameAccess";
import { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { XStream } from "../../../../../udkapi/com/sun/star/io/XStream";
/** All original declared methods and required bases; no storage component or implementation is synthesized. */
export interface XStorage extends XNameAccess, XComponent {
  /** Original copyToStorage contract. @param xDest - Original argument. @returns Nothing. */
  copyToStorage(xDest: Reference<XStorage>): void;
  /** Original openStreamElement contract. @param sStreamName - Original argument. @param nOpenMode - Original argument. @returns Original value or owned interface reference. */
  openStreamElement(sStreamName: OUStringConstReference, nOpenMode: number): Reference<XStream>;
  /** Original openEncryptedStreamElement contract. @param sStreamName - Original argument. @param nOpenMode - Original argument. @param sPassword - Original argument. @returns Original value or owned interface reference. */
  openEncryptedStreamElement(
    sStreamName: OUStringConstReference,
    nOpenMode: number,
    sPassword: OUStringConstReference,
  ): Reference<XStream>;
  /** Original openStorageElement contract. @param sStorName - Original argument. @param nOpenMode - Original argument. @returns Original value or owned interface reference. */
  openStorageElement(sStorName: OUStringConstReference, nOpenMode: number): Reference<XStorage>;
  /** Original cloneStreamElement contract. @param sStreamName - Original argument. @returns Original value or owned interface reference. */
  cloneStreamElement(sStreamName: OUStringConstReference): Reference<XStream>;
  /** Original cloneEncryptedStreamElement contract. @param sStreamName - Original argument. @param sPassword - Original argument. @returns Original value or owned interface reference. */
  cloneEncryptedStreamElement(
    sStreamName: OUStringConstReference,
    sPassword: OUStringConstReference,
  ): Reference<XStream>;
  /** Original copyLastCommitTo contract. @param xTargetStorage - Original argument. @returns Nothing. */
  copyLastCommitTo(xTargetStorage: Reference<XStorage>): void;
  /** Original copyStorageElementLastCommitTo contract. @param sStorName - Original argument. @param xTargetStorage - Original argument. @returns Nothing. */
  copyStorageElementLastCommitTo(
    sStorName: OUStringConstReference,
    xTargetStorage: Reference<XStorage>,
  ): void;
  /** Original isStreamElement contract. @param sElementName - Original argument. @returns Original value or owned interface reference. */
  isStreamElement(sElementName: OUStringConstReference): boolean;
  /** Original isStorageElement contract. @param sElementName - Original argument. @returns Original value or owned interface reference. */
  isStorageElement(sElementName: OUStringConstReference): boolean;
  /** Original removeElement contract. @param sElementName - Original argument. @returns Nothing. */
  removeElement(sElementName: OUStringConstReference): void;
  /** Original renameElement contract. @param sElementName - Original argument. @param sNewName - Original argument. @returns Nothing. */
  renameElement(sElementName: OUStringConstReference, sNewName: OUStringConstReference): void;
  /** Original copyElementTo contract. @param sElementName - Original argument. @param xDest - Original argument. @param sNewName - Original argument. @returns Nothing. */
  copyElementTo(
    sElementName: OUStringConstReference,
    xDest: Reference<XStorage>,
    sNewName: OUStringConstReference,
  ): void;
  /** Original moveElementTo contract. @param sElementName - Original argument. @param xDest - Original argument. @param sNewName - Original argument. @returns Nothing. */
  moveElementTo(
    sElementName: OUStringConstReference,
    xDest: Reference<XStorage>,
    sNewName: OUStringConstReference,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.embed.XStorage\0"),
      2,
      [
        XNameAccess.static_type().getTypeLibType() as R,
        XComponent.static_type().getTypeLibType() as R,
      ],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XStorage> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XStorage = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
