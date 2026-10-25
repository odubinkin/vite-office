/** @fileoverview Ports consumed OFOPXMLHelper content-type and relationship sequence XML contracts; primitive StringPair fields bind UTF16 XML values, without claiming UNO service identity. */
import { parseFastXmlStream } from "../../../sax/source/fastparser/fastparser";
import { XmlStringDocumentHandler } from "../../../sax/source/expatwrap/saxwriter";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { AttributeList } from "./attributelist";

/** Native StringPair field contents at the XML boundary. */
export interface StringPair {
  readonly First: string;
  readonly Second: string;
}
/** Native ordered Defaults/Overrides sequence. */
export type ContentTypeSequence = readonly [readonly StringPair[], readonly StringPair[]];

/** Reads the native relationship sequence without the stricter oox::Relations admission rules. @param xml - Relationship XML. @returns Ordered attributes and entries. */
export function ReadRelationsInfoSequence(xml: string): readonly (readonly StringPair[])[] {
  const result: StringPair[][] = [];
  let depth = 0;
  parseFastXmlStream(xml, {
    /** Retains qualified names, depth and the sole required Id attribute. @param tag - Element. @param attributes - Attributes. @returns Nothing. */
    open(tag, attributes) {
      ++depth;
      if (tag.name === "Relationships" && depth === 1) return;
      if (tag.name !== "Relationship" || depth !== 2)
        throw new Error("Invalid OOXML relationship element.");
      const entry: StringPair[] = [];
      for (const name of ["Id", "Type", "Target", "TargetMode"]) {
        const value =
          attributes.find(
            /** Matches exact native attribute name. @param attribute - Attribute. @returns Match. */
            (attribute) => attribute.name === name,
          )?.value ?? "";
        if (name === "Id" && value === "") throw new Error("Missing OOXML relationship Id.");
        if (value !== "") entry.push({ First: name, Second: value });
      }
      result.push(entry);
    },
    /** Native handler ignores character content. @returns Nothing. */ characters() {},
    /** Pops one original element. @returns Nothing. */ close() {
      --depth;
    },
  });
  return result;
}

/** Creates an exact UTF16 value for the existing native SAX API. @param value - Text. @returns Owned string. */
function native(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads one UTF16 unit. @param c - Unit. @returns Code unit. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}

/** Reads the original qualified-name/depth/required-attribute content sequence contract. @param xml - Content types XML. @returns Defaults and overrides in source order. */
export function ReadContentTypeSequence(xml: string): ContentTypeSequence {
  const defaults: StringPair[] = [],
    overrides: StringPair[] = [];
  let depth = 0;
  parseFastXmlStream(xml, {
    /** Applies original SAX name matching; namespace prefixes are deliberately not normalized. @param tag - Tag. @param attributes - Attributes. @returns Nothing. */
    open(tag, attributes) {
      ++depth;
      if (depth === 1 && tag.name === "Types") return;
      if (depth !== 2 || (tag.name !== "Default" && tag.name !== "Override"))
        throw new Error("Invalid OOXML content type element.");
      const keyName = tag.name === "Default" ? "Extension" : "PartName";
      const key =
        attributes.find(
          /** Matches original exact attribute name. @param a - Attribute. @returns Match. */ (a) =>
            a.name === keyName,
        )?.value ?? "";
      const type =
        attributes.find(
          /** Matches original exact attribute name. @param a - Attribute. @returns Match. */ (a) =>
            a.name === "ContentType",
        )?.value ?? "";
      if (key === "" || type === "") throw new Error("Missing OOXML content type attribute.");
      (tag.name === "Default" ? defaults : overrides).push({ First: key, Second: type });
    },
    /** Native helper ignores text. @returns Nothing. */ characters() {},
    /** Closes one native SAX stack element. @returns Nothing. */ close() {
      --depth;
    },
  });
  return [defaults, overrides];
}

/** Preserves the original extension-first, overrides-before-defaults search at each key. @param contentTypes - Native sequence. @param filename - Package path without leading slash. @returns MIME or empty. */
export function GetContentTypeByName(
  contentTypes: readonly (readonly StringPair[])[],
  filename: string,
): string {
  if (contentTypes.length < 2) return "";
  const defaults = contentTypes[0] as readonly StringPair[],
    overrides = contentTypes[1] as readonly StringPair[];
  const dot = filename.lastIndexOf(".");
  for (const name of [dot >= 0 ? filename.slice(dot + 1) : filename, "/" + filename]) {
    const match =
      overrides.find(
        /** Native exact first match. @param pair - Candidate. @returns Match. */ (pair) =>
          pair.First === name,
      ) ??
      defaults.find(
        /** Native exact first match. @param pair - Candidate. @returns Match. */ (pair) =>
          pair.First === name,
      );
    if (match) return match.Second;
  }
  return "";
}

/** Serializes original metadata element events through the existing native SAX writer. @param root - Root element. @param namespace - Namespace. @param children - Ordered child elements and attributes. @returns XML. */
function writeSequence(
  root: string,
  namespace: string,
  children: readonly (readonly [string, readonly StringPair[]])[],
): string {
  const writer = new XmlStringDocumentHandler();
  const rootName = native(root),
    space = native(" ");
  /** Emits a native SAX start element and releases copied attributes. @param name - Name. @param values - Attributes. @returns Nothing. */
  function start(name: OUString, values: readonly StringPair[]): void {
    const attributes = new AttributeList();
    try {
      for (const pair of values) {
        const key = native(pair.First),
          value = native(pair.Second);
        try {
          attributes.AddAttribute(key, value);
        } finally {
          key.dispose();
          value.dispose();
        }
      }
      writer.startElement(name, attributes);
    } finally {
      attributes.Clear();
    }
  }
  try {
    writer.startDocument();
    start(rootName, [{ First: "xmlns", Second: namespace }]);
    for (const [name, attributes] of children) {
      const child = native(name);
      try {
        start(child, attributes);
        writer.ignorableWhitespace(space);
        writer.endElement(child);
      } finally {
        child.dispose();
      }
    }
    writer.ignorableWhitespace(space);
    writer.endElement(rootName);
    writer.endDocument();
    return writer.getXml();
  } finally {
    rootName.dispose();
    space.dispose();
  }
}

/** Original WriteContentSequence event order, whitespace and attribute names. @param defaults - Default pairs. @param overrides - Override pairs. @returns XML. */
export function WriteContentSequence(
  defaults: readonly StringPair[],
  overrides: readonly StringPair[],
): string {
  const children: [string, readonly StringPair[]][] = [];
  for (const pair of defaults)
    children.push([
      "Default",
      [
        { First: "Extension", Second: pair.First },
        { First: "ContentType", Second: pair.Second },
      ],
    ]);
  for (const pair of overrides)
    children.push([
      "Override",
      [
        { First: "PartName", Second: pair.First },
        { First: "ContentType", Second: pair.Second },
      ],
    ]);
  return writeSequence(
    "Types",
    "http://schemas.openxmlformats.org/package/2006/content-types",
    children,
  );
}

/** Original relation writer admits only the four relationship attribute names. @param sequence - Ordered relationship attributes. @returns XML. */
export function WriteRelationsInfoSequence(sequence: readonly (readonly StringPair[])[]): string {
  for (const entry of sequence)
    for (const pair of entry)
      if (!["Id", "Type", "TargetMode", "Target"].includes(pair.First))
        throw new Error("Invalid OOXML relationship attribute.");
  return writeSequence(
    "Relationships",
    "http://schemas.openxmlformats.org/package/2006/relationships",
    sequence.map(
      /** Emits one native entry. @param entry - Attribute pairs. @returns Element. */ (entry) => [
        "Relationship",
        entry,
      ],
    ),
  );
}
