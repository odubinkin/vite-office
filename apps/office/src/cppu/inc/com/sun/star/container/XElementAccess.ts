/** @fileoverview Original XElementAccess.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XInterface } from "../uno/XInterface";
import type { Type } from "../uno/Type";
/** Original collection base;type-only contract,not a service or interface implementation. */
export interface XElementAccess extends XInterface {
  /** Original element type;void denotes heterogeneous values. @returns Owned native type value. */
  getElementType(): Type;
  /** Original nonempty query. @returns Has elements. */
  hasElements(): boolean;
}
