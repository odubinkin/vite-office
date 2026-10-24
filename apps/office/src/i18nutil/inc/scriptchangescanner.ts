/** @fileoverview Original script change scanner declarations; the concrete direction factory uses the pinned default ICU bidi resolver. */
import * as Published from "../../offapi/com/sun/star/text/ScriptHintType";
/* eslint-disable @typescript-eslint/prefer-literal-enum-member -- Original native enum aliases actual IDL short constants. */
/** Original fixed-unsigned16 script-hint enum. */
export enum ScriptHintType {
  Automatic = Published.AUTOMATIC,
  Ignore = Published.IGNORE,
  Latin = Published.LATIN,
  Asian = Published.ASIAN,
  Complex = Published.COMPLEX,
}
export {
  ScriptHintProvider,
  ScriptChangeScanner,
  DirectionChangeScanner,
  MakeScriptChangeScanner,
  MakeDirectionChangeScanner,
  type ScriptChange,
  type DirectionChange,
} from "../source/utility/scriptchangescanner";
