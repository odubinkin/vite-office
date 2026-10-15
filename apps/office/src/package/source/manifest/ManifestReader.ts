/** @fileoverview Native ManifestReader plain parse/result responsibility over a JS XML text carrier and actual ManifestImport;full UNO parser/stream/component services are omitted. */
import { SaxesParser } from "saxes";
import { AttributeList } from "../../../comphelper/inc/attributelist";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { ManifestImport } from "./ManifestImport";
/** Native SAX string carrier. @param text - XML value. @returns Native value. */
function unicode(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads the actual native property sequence;SAX parse failures discard all partial records. Existing declaration/depth admission and unsupported encryption failures remain explicit. @param xml - Decoded manifest stream. @returns Actual native property sequences or empty parse-failure result. */
export function readManifestSequence(xml: string): PropertyValue[][] {
  const result: PropertyValue[][] = [],
    handler = new ManifestImport(result),
    parser = new SaxesParser();
  let parseFailure = false,
    depth = 0;
  parser.on(
    "error",
    /** Marks actual parser errors independently from unsupported-profile exceptions. @param error - Parser failure. @returns Never. */ (
      error,
    ) => {
      parseFailure = true;
      throw error;
    },
  );
  parser.on(
    "doctype",
    /** Existing browser declaration admission bound. @returns Never. */ () => {
      throw new Error("ODF manifest declarations are unsupported.");
    },
  );
  parser.on(
    "opentag",
    /** Forwards real ordered raw SAX attributes. @param tag - Raw parser tag. @returns Nothing. */ (
      tag,
    ) => {
      if (depth >= 256) throw new Error("ODF manifest exceeds depth limit.");
      ++depth;
      const name = unicode(tag.name),
        attributes = new AttributeList();
      for (const [key, data] of Object.entries(tag.attributes)) {
        const a = unicode(key),
          b = unicode(data as string);
        try {
          attributes.AddAttribute(a, b);
        } finally {
          a.dispose();
          b.dispose();
        }
      }
      try {
        handler.startElement(name, attributes);
      } finally {
        name.dispose();
        attributes.Clear();
      }
    },
  );
  parser.on(
    "closetag",
    /** Forwards actual end events. @param tag - Raw tag. @returns Nothing. */ (tag) => {
      const name = unicode(tag.name);
      try {
        handler.endElement(name);
      } finally {
        name.dispose();
      }
      --depth;
    },
  );
  parser.on(
    "text",
    /** Forwards raw text data. @param data - Text. @returns Nothing. */ (data) => {
      const value = unicode(data);
      try {
        handler.characters(value);
      } finally {
        value.dispose();
      }
    },
  );
  parser.on(
    "cdata",
    /** Forwards original character-data channel. @param data - Text. @returns Nothing. */ (
      data,
    ) => {
      const value = unicode(data);
      try {
        handler.characters(value);
      } finally {
        value.dispose();
      }
    },
  );
  parser.on(
    "processinginstruction",
    /** Forwards the original ignored PI callback. @param value - PI. @returns Nothing. */ (
      value,
    ) => {
      const target = unicode(value.target),
        data = unicode(value.body);
      try {
        handler.processingInstruction(target, data);
      } finally {
        target.dispose();
        data.dispose();
      }
    },
  );
  handler.startDocument();
  try {
    parser.write(xml).close();
    handler.endDocument();
    return result;
  } catch (error) {
    if (parseFailure) return [];
    throw error;
  }
}
