/** @fileoverview Native URIHelper::SmartRel2Abs resolution and optional maybe-file callback selection; no filesystem or browser URL resolver substitutes the original INetURLObject path. */
import {
  DecodeMechanism,
  EncodeMechanism,
  FSysStyle,
  INetProtocol,
} from "../../../tools/inc/urlobj";
import { INetURLObject } from "../../../tools/source/fsys/urlobj.object";
import { RTL_TEXTENCODING_UTF8, type rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
/** Original Link<OUString *, bool> callable binding; the slot retains native local-string mutation semantics. */
export type MaybeFileHdl = ((path: [string]) => boolean) | null;
/** Original SmartRel2Abs, including leading-fragment compatibility and the source optional non-file preference. @param base - Original base URI value. @param relative - Source relative reference. @param maybeFile - Original optional callback. @param checkFileExists - Enable native callback/non-file preference. @param ignoreFragment - Discard resolved fragment except the original leading-fragment compatibility shortcut. @param encodeMechanism - Input escapes. @param decodeMechanism - Output presentation. @param charset - Native charset. @param style - Filesystem styles. @returns Original resolved reference or empty string on native parse failure. */
export function SmartRel2Abs(
  base: INetURLObject,
  relative: string,
  maybeFile: MaybeFileHdl = null,
  checkFileExists = true,
  ignoreFragment = false,
  encodeMechanism = EncodeMechanism.WasEncoded,
  decodeMechanism = DecodeMechanism.ToIUri,
  charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  style = FSysStyle.Detect,
): string {
  if (relative.startsWith("#")) return relative;
  let absolute = new INetURLObject();
  if (base.HasError()) absolute.SetSmartURL(relative, encodeMechanism, charset, style);
  else {
    const wasAbsolute: [boolean] = [false];
    absolute = base.smartRel2Abs(
      relative,
      wasAbsolute,
      ignoreFragment,
      encodeMechanism,
      charset,
      false,
      style,
    );
    if (checkFileExists && !wasAbsolute[0] && absolute.GetProtocol() === INetProtocol.File) {
      const nonFile = new INetURLObject();
      nonFile.SetSmartURL(relative, encodeMechanism, charset, style);
      if (!nonFile.HasError() && nonFile.GetProtocol() !== INetProtocol.File) {
        let isMaybeFile = false;
        if (maybeFile !== null) isMaybeFile = maybeFile([relative]);
        if (!isMaybeFile) absolute = nonFile;
      }
    }
  }
  return absolute.GetMainURL(decodeMechanism, charset);
}
