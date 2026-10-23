/** @fileoverview Original shared script discriminator from include/svl/languageoptions.hxx; language option services remain separate. */
/** Original scalar queries, without configuration/keyboard option services. */
export {
  FromI18NToSvtScriptType,
  FromSvtScriptTypeToI18N,
  GetScriptTypeOfLanguage,
  GetI18NScriptTypeOfLanguage,
} from "../source/config/languageoptions";
/** Original UInt8 script flags; these values differ from the i18n ScriptType constants. */
export enum SvtScriptType {
  NONE = 0x00,
  LATIN = 0x01,
  ASIAN = 0x02,
  COMPLEX = 0x04,
  UNKNOWN = 0x08,
}
