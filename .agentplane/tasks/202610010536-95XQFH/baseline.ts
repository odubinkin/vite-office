import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
import { SwNumRuleItem } from '../../../apps/office/src/sw/source/core/para/paratr';

const doc = new SwDoc();
doc.EnsureNumRule('Counters', 'numbered');
doc.EnsureNumRule('Bullets', 'bullet');
const first = doc.GetTextFormatColl('text-body');
const second = doc.GetTextFormatColl('heading');
first.SetFormatAttr(new SwNumRuleItem('Counters'));
second.SetFormatAttr(new SwNumRuleItem('Bullets'));
const node = doc.paragraphs[0]!;
node.ChgFormatColl(first);
const initial = { effective: node.GetNumRuleName(), owned: node.GetNum()?.GetNumRule()?.GetName() ?? null, inList: node.IsInList() };
node.AddToList();
node.ChgFormatColl(second);
const changed = { effective: node.GetNumRuleName(), owned: node.GetNum()?.GetNumRule()?.GetName() ?? null, label: node.GetListLabel() ?? null };
node.ChgFormatColl(doc.GetTextFormatColl('heading-3'));
console.log(JSON.stringify({ initial, changed, headingLevel: node.GetAttrListLevel() }, null, 2));
