import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
const results = [];
for (const reading of [false, true]) {
 const doc = new SwDoc(); doc.SetInReading(reading);
 const node = doc.paragraphs[0]!;
 let result: unknown;
 try { result = node.GetAttrListRestartValue(); }
 catch (error) { result = { throws: error instanceof Error ? error.message : String(error) }; }
 results.push({ reading, hasDirect: node.HasAttrListRestartValue(), effective: node.GetAttr(86).QueryValue(), allocated: node.HasSwAttrSet(), result });
}
console.log(JSON.stringify(results, null, 2));
