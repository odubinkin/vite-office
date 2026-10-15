/** @fileoverview Test-only native PropertyValue/Any/OUString producers for actual manifest exporters; no spreadsheet or package-service facade. */
import { PropertyValue } from "../../udkapi/com/sun/star/beans/PropertyValue";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../sal/inc/rtl/ustring";
import { MIMETYPE_OASIS_OPENDOCUMENT_TEXT } from "../../comphelper/inc/documentconstants";
/** Produces native UTF16. @param value - Text. @returns Value. */
export function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Builds an actual typed property. @param name - Name. @param value - Data. @returns Property. */
export function property(name: string, value: string | bigint | Any): PropertyValue {
  const result = new PropertyValue(),
    key = unicode(name);
  result.Name = key;
  key.dispose();
  if (value instanceof Any) result.Value = value;
  else if (typeof value === "bigint") result.Value.insert([value], "sal_Int64");
  else {
    const data = unicode(value);
    result.Value.insert([data.pData], "OUString");
    data.dispose();
  }
  return result;
}
/** Creates ordinary OASIS root and independently enumerated streams. @param mime - Actual MIME. @param version - Actual version. @returns Sequence. */
export function sequence(
  mime: string = MIMETYPE_OASIS_OPENDOCUMENT_TEXT,
  version = "1.3",
): PropertyValue[][] {
  return [
    [property("FullPath", "/"), property("MediaType", mime), property("Version", version)],
    ...["content.xml", "styles.xml", "meta.xml"].map(
      /** Declares an actual XML stream. @param path - Entry. @returns Properties. */ (path) => [
        property("FullPath", path),
        property("MediaType", "text/xml"),
      ],
    ),
  ];
}
