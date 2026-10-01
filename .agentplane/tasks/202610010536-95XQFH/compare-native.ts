import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { SwDoc } from '../../../apps/office/src/sw/source/core/doc/doc';
import type { SwNodeNum } from '../../../apps/office/src/sw/source/core/SwNumberTree/SwNodeNum';
import { SwNodes } from '../../../apps/office/src/sw/source/core/docnode/nodes';
import { SwTextFormatColl } from '../../../apps/office/src/sw/source/core/doc/fmtcol';
import { SwNumRuleItem } from '../../../apps/office/src/sw/source/core/para/paratr';
import { SfxBoolItem } from '../../../apps/office/src/svl/source/items/cenumitm';
import { SfxInt16Item } from '../../../apps/office/src/svl/source/items/intitem';
import { SfxStringItem } from '../../../apps/office/src/svl/source/items/stritem';

const path = '.agentplane/tasks/202610010536-95XQFH/';
const cases = JSON.parse(readFileSync(path + 'native-results.json', 'utf8')) as {count:number; foreign?:boolean; ops:number[][]; expected:unknown[]}[];
let states = 0;
for (const [index, test] of cases.entries()) {
  const doc = new SwDoc(false);
  const rules = ['Counters','Bullets','Outline'].map((name,i) => doc.EnsureNumRule(name,i===1?'bullet':'numbered'));
  const styles = Array.from({length:16},(_,i) => new SwTextFormatColl(doc.GetAttrPool(),`audit-${i}`,`Audit ${i}`));
  styles[1]!.SetFormatAttr(new SwNumRuleItem('Counters'));
  styles[2]!.SetFormatAttr(new SwNumRuleItem('Bullets'));
  for(let level=0;level<10;level++){ styles[level+3]!.AssignToListLevelOfOutlineStyle(level);styles[level+3]!.SetFormatAttr(new SwNumRuleItem('Outline')); }
  styles[13]!.SetDerivedFrom(styles[1]);styles[14]!.SetDerivedFrom(styles[3]);styles[15]!.SetFormatAttr(new SwNumRuleItem());
  const nodes = test.foreign ? new SwNodes(doc) : doc.GetNodes();
  const texts = Array.from({length:test.count},() => {const node=nodes.MakeTextNode();node.ChgFormatColl(styles[0]!);return node;});
  const snapshots=[];
  for (const [step, op] of test.ops.entries()) {
    const [kind, at, value] = op as [number,number,number];const node=texts[at]!;
    if(kind===0)node.ChgFormatColl(styles[value]!);
    if(kind===1)node.SetAttr(new SwNumRuleItem(['','Counters','Bullets','Outline'][value]!));
    if(kind===2)node.SetAttrListLevel(value);
    if(kind===3)node.SetAttr(new SfxStringItem(83,value?'Retained':''));
    if(kind===4){node.SetAttr(new SfxBoolItem(85,true));node.SetAttr(new SfxInt16Item(86,value));}
    if(kind===5)node.SetAttr(new SfxBoolItem(87,!!value));
    if(kind===6)node.SetAttrOutlineLevel(value);
    if(kind===7)node.ResetAttr(value);
    if(kind===8)node.RemoveFromList();
    if(kind===9)node.ChgFormatColl(styles[value]!,false);
    if(kind===11)node.SetEmptyListStyleDueToSetOutlineLevelAttr();
    if(kind===12)node.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    const registry:SwNodeNum[]=[];doc.getIDocumentListItems().getNumItems(registry);
    const actual={nodes:texts.map(n=>({rule:n.GetNumRule()?.GetName()??'-',owned:n.GetNum()?.GetNumRule()?.GetName()??'-',level:n.GetAttrListLevel(),outline:n.GetAttrOutlineLevel(),empty:n.IsEmptyListStyleDueToSetOutlineLevelAttr(),id:n.GetListId()||'-',restart:n.IsListRestart(),counted:n.IsCountedInList(),start:n.GetActualListStartValue(),vector:[...n.GetNumberVector()],attrs:Object.fromEntries((n.GetpSwAttrSet()?.entries()??[]).map(i=>[String(i.Which()),i.QueryValue()===''?'-':typeof i.QueryValue()==='boolean'?String(Number(i.QueryValue())):String(i.QueryValue())]))})),rules:rules.map(r=>{const out:typeof texts=[];r.GetTextNodeList(out);return out.map(n=>texts.indexOf(n));}),registry:registry.map(n=>texts.indexOf(n.GetTextNode()!))};
    states += texts.length;snapshots.push(actual);
    if(!isDeepStrictEqual(actual,test.expected[step])){writeFileSync(path+'comparison-failure.json',JSON.stringify({index,step,ops:test.ops.slice(0,step+1),actual,expected:test.expected[step]},null,2)+'\n');throw new Error(`Native comparison mismatch at sequence ${index} step ${step}`);}
  }
}
writeFileSync(path+'comparison.json',JSON.stringify({sequences:cases.length,states,definitions:16,pass:true,profile:'Shown Arabic/bullet/Outline rules, real collection/item/node/list ownership, canonical and foreign arrays; explicit dependency adapters, no full native build or callback/history/footnote/layout/outline-index claim'},null,2)+'\n');
console.log(`Compared ${cases.length} sequences/${states} actual style/node/list/item states to unchanged native source.`);
