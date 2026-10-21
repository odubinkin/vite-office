/** @fileoverview Original XNameAccess.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XElementAccess } from "./XElementAccess";
import type { Any } from "../uno/Any";
import type { Sequence } from "../uno/Sequence";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Original name access over actual native values;no map/order policy is introduced here. */
export interface XNameAccess extends XElementAccess {
  /** Original named lookup. @param aName - Borrowed exact UTF16 name. @returns Owned Any. @throws Native NoSuchElementException or WrappedTargetException. */
  getByName(aName: OUStringConstReference): Any;
  /** Original owned sequence of names. @returns Actual native string sequence. */
  getElementNames(): Sequence<OUString>;
  /** Original exact-name membership. @param aName - Borrowed name. @returns Present. */
  hasByName(aName: OUStringConstReference): boolean;
}
