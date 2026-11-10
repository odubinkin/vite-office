/** @fileoverview Exact RTFKeyword declaration values from the pinned rtfcontrolwords.hxx; literal source data is shared with the native tokenizer symbol table. */
import data from "./rtftokenizer.controlwords.json";
/** Original numeric enum values, including invalid=-1 and all source aliases. */
export const RTFKeyword = Object.freeze(data.keywords);
/** Original enum's numeric representation at the existing lexical callback boundary. */
export type RTFKeyword = (typeof RTFKeyword)[keyof typeof RTFKeyword];
