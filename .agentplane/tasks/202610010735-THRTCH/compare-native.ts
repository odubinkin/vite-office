import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
import type { SwNodeNum } from '../../../apps/office/src/sw/source/core/SwNumberTree/SwNodeNum';
import { SwNodes } from '../../../apps/office/src/sw/source/core/docnode/nodes';
import { SwTextFormatColl } from '../../../apps/office/src/sw/source/core/doc/fmtcol';
import { SwNumRuleItem } from '../../../apps/office/src/sw/source/core/para/paratr';
import { SwNumRuleType } from '../../../apps/office/src/sw/source/core/doc/number';
import { SfxItemSet } from '../../../apps/office/src/svl/source/items/itemset';
import { SfxBoolItem } from '../../../apps/office/src/svl/source/items/cenumitm';
import { SfxInt16Item, SfxUInt16Item } from '../../../apps/office/src/svl/source/items/intitem';
import { SfxStringItem } from '../../../apps/office/src/svl/source/items/stritem';

const path = '.agentplane/tasks/202610010735-THRTCH/';
const cases = JSON.parse(readFileSync(path + 'native-results.json', 'utf8')) as {count:number; foreign?:boolean; ops:number[][]; expected:unknown[]}[];
let states = 0;
for (const [index, test] of cases.entries()) {
  const doc = new SwDoc(false);
  const rules = ['Counters','Bullets','Outline'].map((name,i) => doc.EnsureNumRule(name,i===1?'bullet':'numbered'));
  rules[2]!.SetRuleType(SwNumRuleType.OUTLINE_RULE);
  const styles = Array.from({length:3},(_,i) => new SwTextFormatColl(doc.GetAttrPool(),`audit-${i}`,`Audit ${i}`));
  styles[1]!.SetFormatAttr(new SwNumRuleItem('Counters'));
  styles[2]!.AssignToListLevelOfOutlineStyle(2);styles[2]!.SetFormatAttr(new SwNumRuleItem('Outline'));
  const nodes=doc.GetNodes();
  const texts = Array.from({length:test.count},() => {const node=nodes.MakeTextNode();node.ChgFormatColl(styles[0]!);return node;});
  const events:number[]=[];
  const notify=doc.NotifyModelChange.bind(doc);
  doc.NotifyModelChange=(hint)=>{if(hint.kind==='numbering-changed')events.push(texts.findIndex(n=>n.GetIndex()===hint.nodeIndex));notify(hint);};
  const snapshots=[];
  for (const [step, op] of test.ops.entries()) {
    const [kind, at, value] = op as [number,number,number];const node=texts[at]!;events.splice(0);
    if(kind===0)node.ChgFormatColl(styles[value]!);
    if(kind===1)node.SetAttr(new SwNumRuleItem(['','Counters','Bullets','Outline'][value]!));
    if(kind===2)node.SetAttrListLevel(value);
    if(kind===3)node.SetAttr(new SfxStringItem(83,value?'Retained':''));
    if(kind===4)node.SetAttr(new SfxBoolItem(85,!!value));
    if(kind===5)node.SetAttr(new SfxBoolItem(87,!!value));
    if(kind===6)node.SetAttrOutlineLevel(value);
    if(kind===7)node.ResetAttr(value);
    if(kind===8)node.SetAttr(new SfxInt16Item(86,value));
    if(kind===9)node.ResetAllAttr();
    if(kind===10){const set=new SfxItemSet(doc.GetAttrPool(),[[1,87]]);set.Put(new SfxInt16Item(84,value));set.Put(new SfxBoolItem(85,true));set.Put(new SfxInt16Item(86,7));set.Put(new SfxBoolItem(87,false));node.SetAttr(set);}
    if(kind===11)node.ResetAttr([84,86,85,87]);
    if(kind===12)node.ResetAttr(84,87);
    if(kind===13)node.SetEmptyListStyleDueToSetOutlineLevelAttr();
    if(kind===14)node.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    if(kind===15){const set=new SfxItemSet(doc.GetAttrPool(),[[1,87]]);set.Put(new SwNumRuleItem(value?'Counters':''));set.Put(new SfxStringItem(83,'Retained'));set.Put(new SfxUInt16Item(80,4));set.Put(new SfxInt16Item(84,2));node.SetAttr(set);}
    const registry:SwNodeNum[]=[];doc.getIDocumentListItems().getNumItems(registry);
    const actual={nodes:texts.map(n=>({rule:n.GetNumRule()?.GetName()??'-',owned:n.GetNum()?.GetNumRule()?.GetName()??'-',level:n.GetAttrListLevel(),outline:n.GetAttrOutlineLevel(),empty:n.IsEmptyListStyleDueToSetOutlineLevelAttr(),id:n.GetListId()||'-',restart:n.IsListRestart(),counted:n.IsCountedInList(),start:n.GetActualListStartValue(),cached:n.GetNum()?.GetNumber(false)??-999,attrs:Object.fromEntries((n.GetpSwAttrSet()?.entries()??[]).map(i=>[String(i.Which()),i.QueryValue()===''?'-':typeof i.QueryValue()==='boolean'?String(Number(i.QueryValue())):String(i.QueryValue())]))})),events:[...events],outline:nodes.GetOutLineNds().entries().map(n=>texts.indexOf(n)),rules:rules.map(r=>{const out:typeof texts=[];r.GetTextNodeList(out);return out.map(n=>texts.indexOf(n));}),registry:registry.map(n=>texts.indexOf(n.GetTextNode()!))};
    for(const [i,n] of texts.entries()) Object.assign(actual.nodes[i]!,{vector:[...n.GetNumberVector()]});
    states += texts.length;snapshots.push(actual);
    if(!isDeepStrictEqual(actual,test.expected[step])){writeFileSync(path+'comparison-failure.json',JSON.stringify({index,step,ops:test.ops.slice(0,step+1),actual,expected:test.expected[step]},null,2)+'\n');throw new Error(`Native comparison mismatch at sequence ${index} step ${step}`);}
  }
}
writeFileSync(path+'comparison.json',JSON.stringify({sequences:cases.length,states,definitions:35,pass:true,profile:'Shown Arabic/bullet/Outline rules, real collection/item/node/list ownership, canonical and foreign arrays; explicit dependency adapters, no full native build or callback/history/footnote/layout/outline-index claim'},null,2)+'\n');
console.log(`Compared ${cases.length} sequences/${states} actual pre-read cache/notification/outline/rule/node/list/item states to unchanged native source.`);
