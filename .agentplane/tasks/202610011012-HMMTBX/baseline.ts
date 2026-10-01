import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
const results = [];
for (const reading of [false, true]) {
  const doc = new SwDoc(); doc.SetInReading(reading);
  const node = doc.paragraphs[0]!;
  node.SetListRestart(true, 7);
  const before = [node.IsListRestart(), node.HasAttrListRestartValue(), node.GetAttr(86).QueryValue()];
  node.SetListRestart(false);
  const after = [node.IsListRestart(), node.HasAttrListRestartValue(), node.GetAttr(86).QueryValue()];
  node.SetListRestart(true, 7); node.SetListRestart(true);
  const repeated = [node.IsListRestart(), node.HasAttrListRestartValue(), node.GetAttr(86).QueryValue()];
  results.push({ reading, before, after, repeated });
}
console.log(JSON.stringify(results, null, 2));
