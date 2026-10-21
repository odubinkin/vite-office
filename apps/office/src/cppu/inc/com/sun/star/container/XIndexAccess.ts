/** @fileoverview Original XIndexAccess.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XElementAccess } from "./XElementAccess";
import type { Any } from "../uno/Any";
/** Original indexed collection access;runtime interface metadata remains unported. */
export interface XIndexAccess extends XElementAccess {
  /** Original signed32 count. @returns Element count. */
  getCount(): number;
  /** Original element access. @param Index - Signed32 index. @returns Owned Any. @throws Native IndexOutOfBoundsException or WrappedTargetException. */
  getByIndex(Index: number): Any;
}
