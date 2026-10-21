/** @fileoverview Original XIndexReplace.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XIndexAccess } from "./XIndexAccess";
import type { Any } from "../uno/Any";
/** Original replacement access inherits the complete indexed contract. */
export interface XIndexReplace extends XIndexAccess {
  /** Original indexed replacement. @param Index - Signed32 position. @param Element - Borrowed native Any. @returns Nothing. @throws Native IllegalArgumentException,IndexOutOfBoundsException or WrappedTargetException. */
  replaceByIndex(Index: number, Element: Any): void;
}
