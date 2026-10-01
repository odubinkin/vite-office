import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
import { SfxItemSet } from '../../../apps/office/src/svl/source/items/itemset';
import { SfxInt16Item } from '../../../apps/office/src/svl/source/items/intitem';
import { WRITER_TEXT_NODE_WHICH_RANGES } from '../../../apps/office/src/sw/inc/hintids';
const cases: unknown[] = [];
for (const mode of ['single', 'reversed', 'vector', 'all']) {
  const doc = new SwDoc(), node = doc.paragraphs[0]!;
  node.SetAttr(new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES));
  const before = node.GetpSwAttrSet();
  const result = mode === 'single' ? node.ResetAttr(84) : mode === 'reversed' ? node.ResetAttr(84, 83) : mode === 'vector' ? node.ResetAttr([]) : node.ResetAllAttr();
  cases.push({ mode, result, retained: node.GetpSwAttrSet() === before, allocated: node.HasSwAttrSet() });
}
for (const mode of ['set', 'single', 'all', 'nested']) {
  const doc = new SwDoc(), node = doc.paragraphs[0]!;
  node.SetAttr(new SfxInt16Item(84, 4));
  const before = node.GetpSwAttrSet()!;
  const events: unknown[] = [];
  let pending = mode === 'nested';
  const notify = doc.NotifyModelChange.bind(doc);
  doc.NotifyModelChange = hint => {
    if (hint.kind === 'attribute-set-changed') {
      events.push({ allocated: node.HasSwAttrSet(), count: node.GetpSwAttrSet()?.Count() ?? -1, same: node.GetpSwAttrSet() === before, old: before.entries().map(item => item.QueryValue()) });
      if (pending) { pending = false; node.SetAttr(new SfxInt16Item(84, 2)); }
    }
    notify(hint);
  };
  const result = mode === 'set' ? node.SetAttr(new SfxInt16Item(84, 2)) : mode === 'all' ? node.ResetAllAttr() : node.ResetAttr(84);
  cases.push({ mode, result, events, oldAfter: before.entries().map(item => item.QueryValue()), current: node.GetpSwAttrSet()?.entries().map(item => item.QueryValue()) });
}
{
  const doc = new SwDoc(), node = doc.paragraphs[0]!;
  node.SetAttr(new SfxInt16Item(84, 4));
  node.GetpSwAttrSet()!.InvalidateItem(85);
  node.GetpSwAttrSet()!.DisableItem(87);
  cases.push({ mode: 'sentinel-count', result: node.ResetAllAttr() });
}
console.log(JSON.stringify(cases, null, 2));
