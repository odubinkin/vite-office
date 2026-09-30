/** @fileoverview Proves why two pinned fixtures lose exactly ten unknown-attribute diagnostics. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ZipFile } from "../../../apps/office/src/package/source/zipapi/ZipFile.ts";
import { readOdtDocument } from "../../../apps/office/src/sw/source/filter/xml/swxml.ts";
import { getXMLToken, XMLToken } from "../../../apps/office/src/xmloff/source/core/xmltoken.ts";
const mode = "text:list-level-position-and-space-mode";
assert.equal(getXMLToken("urn:oasis:names:tc:opendocument:xmlns:text:1.0", "list-level-position-and-space-mode"), XMLToken.TEXT_LIST_LEVEL_POSITION_AND_SPACE_MODE);
for (const [path, expected] of [
  ["sw/qa/extras/uiwriter/data/collapsed_bookmark.odt", 80],
  ["sw/qa/extras/odfimport/data/tdf94882.odt", 91],
]) {
  const bytes = new Uint8Array(readFileSync(`apps/office/src/${path}`));
  const zip = new ZipFile(bytes);
  let count = 0;
  for (const entry of ["content.xml", "styles.xml"])
    count += (await zip.readTextEntry(entry)).split(`${mode}=`).length - 1;
  assert.equal(count, 10);
  const diagnostics = [];
  await readOdtDocument(bytes, { title: path }, undefined, { onDiagnostic: (item) => diagnostics.push(item) });
  assert.equal(diagnostics.length, expected);
  assert.equal(diagnostics.some((item) => item.name === mode), false);
  console.log(`${path}: ${count} native mode attributes are recognized; ${diagnostics.length} remaining structural diagnostics retained.`);
}
