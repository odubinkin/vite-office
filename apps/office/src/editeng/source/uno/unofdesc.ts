/** @fileoverview Owns the represented family-Name conversion from SvxUnoFontDescriptor::ConvertToFont. */
import { Font } from "../../../vcl/source/font/font";

/** Converts the represented descriptor Name into the actual native Font value; full descriptor attributes remain unimplemented. @param name - Native family Name. @returns Owned Font using the existing default and copy-on-write contracts. */
export function fontFromUnoDescriptorName(name: string): Font {
  const font = new Font();
  font.SetFamilyName(name);
  return font;
}
