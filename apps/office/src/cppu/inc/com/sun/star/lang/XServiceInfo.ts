/** @fileoverview Complete original XServiceInfo.idl structural method contract; generates no service implementation, static type/default provider or interface identity. */
import type { XInterface } from "../uno/XInterface";
import type { Sequence } from "../uno/Sequence";
import type { OUString } from "../../../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../../../sal/inc/rtl/ustring.h";
/** Original generated interface extends actual XInterface. Logical sequence E references are existing addressed OUString pData fields, not copied JS string values or physical ABI. */
export interface XServiceInfo extends XInterface {
  /** Original implementation-name owned string result. @returns Original unique implementation name. */
  getImplementationName(): OUString;
  /** Original service predicate, supplied by the actual implementation. @param ServiceName - Borrowed original string. @returns Original result. */
  supportsService(ServiceName: OUString): boolean;
  /** Original owned sequence<string> result; actual native logical element addresses retain existing string ownership. @returns Original service names, including indirect names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot>;
}
