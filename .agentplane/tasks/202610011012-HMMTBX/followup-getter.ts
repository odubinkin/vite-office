import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
const results = [];
for (const reading of [false, true]) {
  const doc = new SwDoc(); doc.SetInReading(reading);
  const node = doc.paragraphs[0]!;
  let getter: unknown;
  try { getter = node.GetAttrListRestartValue(); }
  catch (error) { getter = { throws: error instanceof Error ? error.message : String(error) }; }
  results.push({ reading, hasDirect: node.HasAttrListRestartValue(), effective: node.GetAttr(86).QueryValue(), getter });
}
console.log(JSON.stringify(results, null, 2));
