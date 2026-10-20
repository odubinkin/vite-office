/** @fileoverview Consumed script-query methods of the original XBreakIterator IDL;remaining break methods are unported. */
export interface XBreakIterator {
  /** Queries a codepoint at a UTF16 position. @param text - Logical UTF16 string view. @param position - Code-unit index. @returns ScriptType. */
  getScriptType(text: Uint16Array, position: number): number;
  /** Finds the end of a script run. @param text - Logical UTF16 string view. @param position - Initial code-unit offset. @param scriptType - Expected initial class. @returns Code-unit boundary or minus one. */
  endOfScript(text: Uint16Array, position: number, scriptType: number): number;
}
