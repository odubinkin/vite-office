/** @fileoverview Original represented MediaDescriptor header constant and ComponentData functions; URL/password/locking orchestration remains unported rather than replaced by successful stubs. */
import { OUString, OUStringLiteral, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
/** Original constexpr Unicode property name, with native static RTL storage. */
export const PROP_COMPONENTDATA: OUStringConstReference = new OUString(
  new OUStringLiteral(
    Uint16Array.of(67, 111, 109, 112, 111, 110, 101, 110, 116, 68, 97, 116, 97, 0),
  ),
);
/** Compiler lowering of original constexpr inline ASCII property literals. @param name - Original property spelling. @returns Actual static RTL string. */
function property(name: string): OUStringConstReference {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        name + "\0",
        /** Original ASCII code unit. @param unit - Source character. @returns UTF16 unit. */ (
          unit,
        ) => unit.charCodeAt(0),
      ),
    ),
  );
}
/** Original input property name. */
export const PROP_INPUTSTREAM = property("InputStream");
/** Original post-data property name. */
export const PROP_POSTDATA = property("PostData");
/** Original readonly property name. */
export const PROP_READONLY = property("ReadOnly");
/** Original read/write stream property name. */
export const PROP_STREAM = property("Stream");
/** Original UCB content property name. */
export const PROP_UCBCONTENT = property("UCBContent");
/** Original URL property name. */
export const PROP_URL = property("URL");
export {
  addInputStream,
  isStreamReadOnly,
  getComponentDataEntry,
  setComponentDataEntry,
  clearComponentDataEntry,
} from "../source/misc/mediadescriptor";
