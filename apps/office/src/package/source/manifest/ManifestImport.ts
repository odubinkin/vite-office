/** @fileoverview Native plain ManifestImport namespace/validity stack and PropertyValue slots;JS strings/Map carry exact UTF16 values while existing Any/OUString preserve public value semantics. Encryption branches remain explicit unsupported-profile boundaries. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { XAttributeList } from "../../../udkapi/com/sun/star/xml/sax/XAttributeList";
import type { XDocumentHandler } from "../../../udkapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XLocator } from "../../../udkapi/com/sun/star/xml/sax/XLocator";
import {
  PKG_MNFST_FULLPATH,
  PKG_MNFST_VERSION,
  PKG_MNFST_MEDIATYPE,
  PKG_MNFST_UCOMPSIZE,
  PKG_SIZE_ENCR_MNFST,
} from "../../inc/PackageConstants";
/** Native recognized old/OASIS namespace literals. */ const namespaces = new Set([
  "http://openoffice.org/2001/manifest",
  "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
]);
/** Reads native UTF16 without changing embedded zeros. @param value - Native string. @returns Text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Creates an actual native value. @param value - Text. @returns Value. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Assigns actual original PropertyValue members. @param property - Slot. @param name - Native property name. @param value - String or signed64 payload. @returns Nothing. */
function assign(property: PropertyValue, name: string, value: string | bigint): void {
  const key = unicode(name);
  property.Name = key;
  key.dispose();
  if (typeof value === "bigint") property.Value.insert([value], "sal_Int64");
  else {
    const data = unicode(value);
    try {
      property.Value.insert([data.pData], "OUString");
    } finally {
      data.dispose();
    }
  }
}
/** Actual native manifest scope entry;namespace storage is moved by ordinary JS reference retention. */
export class ManifestScopeEntry {
  public m_bValid = true;
  /** Original converted-name/namespace constructor. @param m_aConvertedName - Name. @param m_aNamespaces - Owned namespace map. @returns Entry. */
  constructor(
    public m_aConvertedName: string,
    public m_aNamespaces: Map<string, string>,
  ) {}
}
/** Actual ordinary manifest import owner. Full encryption/service/UNO behavior is not fabricated. */
export class ManifestImport implements XDocumentHandler {
  private aSequence: PropertyValue[] = [];
  private aCurrentCharacters = "";
  private readonly aStack: ManifestScopeEntry[] = [];
  private m_PackageVersion = "";
  /** Original destination-vector borrowing;existing entries are retained. @param rManVector - Actual caller-owned output vector. @returns Importer. */
  constructor(private readonly rManVector: PropertyValue[][]) {}
  /** Native intentionally leaves existing state unchanged. @returns Nothing. */ public startDocument(): void {
    /* Original no-op. */
  }
  /** Native intentionally leaves existing state unchanged. @returns Nothing. */ public endDocument(): void {
    /* Original no-op. */
  }
  /** Original plain file metadata initializes the full native slot vector before filling fields. @param attributes - Converted native attribute map. @returns Nothing. */
  private doFileEntry(attributes: Map<string, string>): void {
    this.aSequence = Array.from(
      { length: PKG_SIZE_ENCR_MNFST },
      /** Constructs actual native default property values. @returns Property. */ () =>
        new PropertyValue(),
    );
    assign(
      this.aSequence[PKG_MNFST_FULLPATH] as PropertyValue,
      "FullPath",
      attributes.get("manifest:full-path") ?? "",
    );
    assign(
      this.aSequence[PKG_MNFST_MEDIATYPE] as PropertyValue,
      "MediaType",
      attributes.get("manifest:media-type") ?? "",
    );
    const version = attributes.get("manifest:version") ?? "",
      size = attributes.get("manifest:size") ?? "";
    if (version.length !== 0)
      assign(this.aSequence[PKG_MNFST_VERSION] as PropertyValue, "Version", version);
    if (size.length !== 0) {
      const data = unicode(size);
      try {
        assign(this.aSequence[PKG_MNFST_UCOMPSIZE] as PropertyValue, "Size", data.toInt64());
      } finally {
        data.dispose();
      }
    }
  }
  /** Original structural-level dispatch for ordinary entries. Recognized encryption branches fail explicitly until implemented. @param name - Raw SAX name. @param attributes - Actual raw SAX attributes. @returns Nothing. */
  public startElement(name: OUStringConstReference, attributes: XAttributeList | null): void {
    const convertedAttributes = new Map<string, string>(),
      converted = this.PushNameAndNamespaces(text(name), attributes, convertedAttributes),
      level = this.aStack.length,
      scope = this.aStack[level - 1] as ManifestScopeEntry;
    if (level === 1) {
      this.m_PackageVersion = convertedAttributes.get("manifest:version") ?? "";
      if (converted !== "manifest:manifest") scope.m_bValid = false;
    } else if (level === 2) {
      if (converted === "manifest:file-entry") this.doFileEntry(convertedAttributes);
      else if (converted === "loext:keyinfo" || converted === "manifest:encrypted-key")
        throw new Error("Encrypted manifest import is not implemented");
      else scope.m_bValid = false;
    } else {
      const parent = this.aStack[level - 2] as ManifestScopeEntry;
      if (
        parent.m_bValid &&
        level === 3 &&
        [
          "manifest:encryption-data",
          "loext:encrypted-key",
          "manifest:encryption-method",
          "manifest:keyinfo",
          "manifest:CipherData",
        ].includes(converted)
      )
        throw new Error("Encrypted manifest import is not implemented");
      scope.m_bValid = false;
    }
  }
  /** Original converted-end guard,first-entry package version fallback,empty-name removal and vector append. @param name - Raw end name. @returns Nothing. */
  public endElement(name: OUStringConstReference): void {
    const level = this.aStack.length;
    if (level === 0) throw new Error("Manifest endElement requires a scope");
    const converted = this.ConvertName(text(name)),
      scope = this.aStack[level - 1] as ManifestScopeEntry;
    if (scope.m_aConvertedName !== converted) return;
    if (converted === "manifest:file-entry" && scope.m_bValid) {
      const version = this.aSequence[PKG_MNFST_VERSION] as PropertyValue;
      if (this.rManVector.length === 0 && this.m_PackageVersion !== "" && !version.Value.hasValue())
        assign(version, "Version", this.m_PackageVersion);
      this.rManVector.push(
        this.aSequence.filter(
          /** Original isEmpty predicate removal. @param property - Slot. @returns Retained name. */ (
            property,
          ) => !property.Name.isEmpty(),
        ),
      );
      this.aSequence = [];
    }
    this.aStack.pop();
  }
  /** Original raw character accumulation;encryption consumers remain unimplemented. @param value - Native text. @returns Nothing. */ public characters(
    value: OUStringConstReference,
  ): void {
    this.aCurrentCharacters += text(value);
  }
  /** Original ignores ignorable whitespace. @param value - Unused native text. @returns Nothing. */ public ignorableWhitespace(
    value: OUStringConstReference,
  ): void {
    void value;
  }
  /** Original ignores processing instructions. @param target - Unused target. @param data - Unused data. @returns Nothing. */ public processingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): void {
    void target;
    void data;
  }
  /** Original ignores document origin. @param locator - Unused native locator. @returns Nothing. */ public setDocumentLocator(
    locator: XLocator | null,
  ): void {
    void locator;
  }
  /** Original namespace collection precedes name conversion and stack insertion;attributes convert against the newly pushed scope. @param name - Raw name. @param attributes - Raw SAX attributes. @param convertedAttributes - Destination map. @returns Converted name. */
  private PushNameAndNamespaces(
    name: string,
    attributes: XAttributeList | null,
    convertedAttributes: Map<string, string>,
  ): string {
    const local = new Map<string, string>(),
      raw: [string, string][] = [];
    if (attributes)
      for (let i = 0; i < attributes.getLength(); ++i) {
        const key = attributes.getNameByIndex(i),
          data = attributes.getValueByIndex(i);
        try {
          const name = text(key),
            value = text(data);
          if (
            name.length >= 5 &&
            name.startsWith("xmlns") &&
            (name.length === 5 || name[5] === ":")
          )
            local.set(name.length === 5 ? "" : name.slice(6), value);
          else raw.push([name, value]);
        } finally {
          key.dispose();
          data.dispose();
        }
      }
    const converted =
      ManifestImport.ConvertNameWithNamespace(name, local) || this.ConvertName(name);
    this.aStack.push(new ManifestScopeEntry(converted, local));
    for (const [key, value] of raw) convertedAttributes.set(this.ConvertName(key), value);
    return converted;
  }
  /** Original namespace conversion accepts both namespace generations and default aliases;colon position is necessarily less than string length when present. @param name - Raw name. @param local - One namespace map. @returns Manifest-prefixed name or empty. */
  private static ConvertNameWithNamespace(name: string, local: Map<string, string>): string {
    const colon = name.indexOf(":"),
      alias = colon === -1 ? "" : name.slice(0, colon),
      pure = colon === -1 ? name : name.slice(colon + 1),
      uri = local.get(alias);
    return uri !== undefined && namespaces.has(uri) ? "manifest:" + pure : "";
  }
  /** Original scans outward until conversion succeeds,even when an inner alias binds another namespace;raw names are the final fallback. @param name - Raw name. @returns Converted or unchanged name. */
  private ConvertName(name: string): string {
    let converted = "";
    for (let i = this.aStack.length - 1; converted === "" && i >= 0; --i) {
      const local = (this.aStack[i] as ManifestScopeEntry).m_aNamespaces;
      if (local.size !== 0) converted = ManifestImport.ConvertNameWithNamespace(name, local);
    }
    return converted || name;
  }
}
