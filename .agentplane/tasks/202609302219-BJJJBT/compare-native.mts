/** Compares source-owned level contexts with the extracted C++ byte-string oracle. */
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { FastAttributeList } from "../../../apps/office/src/xmloff/source/core/xmlimp.ts";
import { XMLToken, ODF_NAMESPACES } from "../../../apps/office/src/xmloff/source/core/xmltoken.ts";
import { SvxXMLListLevelStyleContext_Impl } from "../../../apps/office/src/xmloff/source/style/xmlnumi.ts";
const fixtures = JSON.parse(readFileSync(new URL("native-results.json", import.meta.url), "utf8"));
for (const {value,level} of fixtures) for (const token of [XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER,XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET]) {
  const fields = new FastAttributeList(value === null ? [] : [{name:"level",prefix:"text",uri:ODF_NAMESPACES.text,local:"level",value}]);
  const context = new SvxXMLListLevelStyleContext_Impl(token, fields);
  assert.equal(context.GetLevel(),level,JSON.stringify({value,token}));
}
console.log(`${fixtures.length} native integer/normalization cases matched both existing level families (${fixtures.length*2} comparisons).`);
