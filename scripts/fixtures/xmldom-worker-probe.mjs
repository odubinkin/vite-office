/** @fileoverview Real browser Worker probe for the selected portable XML DOM backend; no host DOM globals are required. */
import { DOMParser, DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
const errors = [];
const source =
  '<?xml version="1.0"?><office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:v="urn:vendor"><?keep value?><office:meta><meta:generator>LibreOffice</meta:generator><v:unknown v:flag="a&amp;b"><![CDATA[<kept>]]><!--retained--></v:unknown></office:meta></office:document-meta>';
const document = new DOMParser({
  /** Records real parser diagnostics. @param level - Severity. @param message - Diagnostic. @returns Nothing. */ onError(
    level,
    message,
  ) {
    errors.push(level + ":" + message);
  },
}).parseFromString(source, "application/xml");
const generator = document
  .getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:meta:1.0", "generator")
  .item(0);
generator.textContent = "Changed 字 & < >";
const unknown = document.getElementsByTagNameNS("urn:vendor", "unknown").item(0);
const serialized = new XMLSerializer().serializeToString(document);
const reopened = new DOMParser().parseFromString(serialized, "application/xml");
const created = new DOMImplementation().createDocument("urn:new", "n:root", null);
created.documentElement.appendChild(created.importNode(unknown, true));
let rejected = false;
try {
  new DOMParser().parseFromString("<a><b></a>", "application/xml");
} catch {
  rejected = true;
}
const empty = new DOMImplementation().createDocument(null, "", null);
const initiallyEmpty = empty.documentElement === null;
const root = empty.createElementNS("urn:metadata", "m:meta");
empty.appendChild(root);
root.setAttributeNS("urn:vendor", "v:attribute", "changed & 字");
const copy = root.cloneNode(true);
empty.replaceChild(copy, root);
const result = {
  initiallyEmpty,
  replaced: empty.documentElement === copy,
  namespaceAttribute: copy.getAttributeNS("urn:vendor", "attribute"),
  errors,
  globals: {
    window: typeof window,
    document: typeof globalThis.document,
    DOMParser: typeof globalThis.DOMParser,
  },
  generator: reopened
    .getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:meta:1.0", "generator")
    .item(0).textContent,
  unknown: reopened.getElementsByTagNameNS("urn:vendor", "unknown").length,
  flag: unknown.getAttributeNS("urn:vendor", "flag"),
  cdata: unknown.firstChild.nodeType,
  comment: unknown.lastChild.nodeType,
  pi: serialized.includes("<?keep value?>"),
  imported: created.documentElement.firstChild.ownerDocument === created,
  rejected,
};
globalThis.postMessage(result);
