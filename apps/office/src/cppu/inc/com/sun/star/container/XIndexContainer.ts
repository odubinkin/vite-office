/** @fileoverview Original XIndexContainer.idl complete structural declaration;normal generated runtime type metadata and concrete service implementation remain explicitly unported. */
import type { XIndexReplace } from "./XIndexReplace";
import type { Any } from "../uno/Any";
/** Original insertion/removal access inherits indexed replacement. */
export interface XIndexContainer extends XIndexReplace {
  /** Original insertion includes the append position. @param Index - Signed32 position. @param Element - Borrowed native Any. @returns Nothing. @throws Native IllegalArgumentException,IndexOutOfBoundsException or WrappedTargetException. */
  insertByIndex(Index: number, Element: Any): void;
  /** Original removal. @param Index - Signed32 position. @returns Nothing. @throws Native IndexOutOfBoundsException or WrappedTargetException. */
  removeByIndex(Index: number): void;
}
