/** @fileoverview Original XNameReplace.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XNameAccess } from "./XNameAccess";
import type { Any } from "../uno/Any";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Original name replacement contract. */
export interface XNameReplace extends XNameAccess {
  /** Original named replacement. @param aName - Exact borrowed name. @param aElement - Borrowed Any. @returns Nothing. @throws Native IllegalArgumentException,NoSuchElementException or WrappedTargetException. */
  replaceByName(aName: OUStringConstReference, aElement: Any): void;
}
