/** @fileoverview Complete original XSimpleFileAccess.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XInteractionHandler } from "../../../../../udkapi/com/sun/star/task/XInteractionHandler";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../../../sal/inc/rtl/ustring.h";
import type { DateTime } from "../util/DateTime";
import type { XInputStream } from "../../../../../udkapi/com/sun/star/io/XInputStream";
import type { XOutputStream } from "../../../../../udkapi/com/sun/star/io/XOutputStream";
import type { XStream } from "../../../../../udkapi/com/sun/star/io/XStream";
/** Original complete declared interface. */
export interface XSimpleFileAccess extends XInterface {
  /** Original XSimpleFileAccess::copy. @param SourceURL - Original borrowed argument. @param DestURL - Original borrowed argument. @returns Original result. */
  copy(SourceURL: OUStringConstReference, DestURL: OUStringConstReference): void;
  /** Original XSimpleFileAccess::move. @param SourceURL - Original borrowed argument. @param DestURL - Original borrowed argument. @returns Original result. */
  move(SourceURL: OUStringConstReference, DestURL: OUStringConstReference): void;
  /** Original XSimpleFileAccess::kill. @param FileURL - Original borrowed argument. @returns Original result. */
  kill(FileURL: OUStringConstReference): void;
  /** Original XSimpleFileAccess::isFolder. @param FileURL - Original borrowed argument. @returns Original result. */
  isFolder(FileURL: OUStringConstReference): boolean;
  /** Original XSimpleFileAccess::isReadOnly. @param FileURL - Original borrowed argument. @returns Original result. */
  isReadOnly(FileURL: OUStringConstReference): boolean;
  /** Original XSimpleFileAccess::setReadOnly. @param FileURL - Original borrowed argument. @param bReadOnly - Original borrowed argument. @returns Original result. */
  setReadOnly(FileURL: OUStringConstReference, bReadOnly: boolean): void;
  /** Original XSimpleFileAccess::createFolder. @param NewFolderURL - Original borrowed argument. @returns Original result. */
  createFolder(NewFolderURL: OUStringConstReference): void;
  /** Original XSimpleFileAccess::getSize. @param FileURL - Original borrowed argument. @returns Original result. */
  getSize(FileURL: OUStringConstReference): number;
  /** Original XSimpleFileAccess::getContentType. @param FileURL - Original borrowed argument. @returns Original result. */
  getContentType(FileURL: OUStringConstReference): OUString;
  /** Original XSimpleFileAccess::getDateTimeModified. @param FileURL - Original borrowed argument. @returns Original result. */
  getDateTimeModified(FileURL: OUStringConstReference): DateTime;
  /** Original XSimpleFileAccess::getFolderContents. @param FolderURL - Original borrowed argument. @param bIncludeFolders - Original borrowed argument. @returns Original result. */
  getFolderContents(
    FolderURL: OUStringConstReference,
    bIncludeFolders: boolean,
  ): Sequence<rtl_uStringSlot>;
  /** Original XSimpleFileAccess::exists. @param FileURL - Original borrowed argument. @returns Original result. */
  exists(FileURL: OUStringConstReference): boolean;
  /** Original XSimpleFileAccess::openFileRead. @param FileURL - Original borrowed argument. @returns Original result. */
  openFileRead(FileURL: OUStringConstReference): Reference<XInputStream>;
  /** Original XSimpleFileAccess::openFileWrite. @param FileURL - Original borrowed argument. @returns Original result. */
  openFileWrite(FileURL: OUStringConstReference): Reference<XOutputStream>;
  /** Original XSimpleFileAccess::openFileReadWrite. @param FileURL - Original borrowed argument. @returns Original result. */
  openFileReadWrite(FileURL: OUStringConstReference): Reference<XStream>;
  /** Original XSimpleFileAccess::setInteractionHandler. @param Handler - Original borrowed argument. @returns Original result. */
  setInteractionHandler(Handler: Reference<XInteractionHandler>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.XSimpleFileAccess\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XSimpleFileAccess> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XSimpleFileAccess = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
