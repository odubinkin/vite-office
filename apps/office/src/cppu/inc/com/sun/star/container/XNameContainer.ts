/** @fileoverview Original XNameContainer.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XNameReplace } from "./XNameReplace";
import type { Any } from "../uno/Any";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Original named insertion/removal contract;concrete services remain separate source owners. */
export interface XNameContainer extends XNameReplace {
  /** Original named insertion. @param aName - Exact borrowed name. @param aElement - Borrowed Any. @returns Nothing. @throws Native IllegalArgumentException,ElementExistException or WrappedTargetException. */
  insertByName(aName: OUStringConstReference, aElement: Any): void;
  /** Original named removal. @param Name - Exact borrowed name. @returns Nothing. @throws Native NoSuchElementException or WrappedTargetException. */
  removeByName(Name: OUStringConstReference): void;
}
