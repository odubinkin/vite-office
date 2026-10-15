/** @fileoverview Original ScriptHintType declaration from scriptchangescanner.hxx; actual scanner/range algorithms are unported. */
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
