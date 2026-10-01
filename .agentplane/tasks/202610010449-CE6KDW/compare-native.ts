import {readFileSync,writeFileSync} from 'node:fs';
import {deepStrictEqual} from 'node:assert';
import {createWriterDocument} from '../../../apps/office/src/sw/source/core/doc/doc';
import {applyWriterParagraphList} from '../../../apps/office/src/sw/source/core/doc/list';
import {SwNumFormat} from '../../../apps/office/src/sw/source/core/doc/number';
import type {SwNodeNum} from '../../../apps/office/src/sw/source/core/SwNumberTree/SwNodeNum';
import type {SwTextNode} from '../../../apps/office/src/sw/source/core/txtnode/ndtxt';
const dir='.agentplane/tasks/202610010449-CE6KDW';
const cases=JSON.parse(readFileSync(`${dir}/native-results.json`,'utf8'));let states=0;
for(const [sequence,c] of cases.entries()) {
 const doc=createWriterDocument();const rules=['Counters','Other'].map(name=>doc.EnsureNumRule(name,'numbered'));
 rules.forEach((rule,ri)=>c.starts.forEach((start:number,level:number)=>rule.GetNumFormat(level).SetStart(start+ri*10)));
 const nodes=c.items.map((item:any,i:number)=>{const n=i===0?doc.paragraphs[0]!:doc.nodes.MakeTextNode();applyWriterParagraphList(n,{kind:'numbered',styleId:'Counters',listId:'A',level:item.level});return n;});
 nodes.forEach((n:SwTextNode)=>n.RemoveFromList());
 for(const [step,[kind,index,value]] of c.ops.entries()) {
  const n=nodes[index];
  if(kind===0)n.AddToList();
  if(kind===1)n.RemoveFromList();
  if(kind===2)n.SetAttrListLevel(value);
  if(kind===3)n.SetCountedInList(Boolean(value));
  if(kind===4)n.SetListRestart(true,value);
  if(kind===5)n.SetNumRule(value?'Other':'Counters');
  if(kind===6)n.SetListId(value?'B':'A');
  if(kind===7)rules.forEach(rule=>{const old=rule.GetNumFormat(0);rule.Set(0,new SwNumFormat(value?'bullet':'numbered','•',{...old.GetPositionProperties(),...old.GetMarkerProperties()}));});
  if(kind===8){const record=n.GetNum()!;record.RemoveMe();doc.GetDocumentListsManager().GetListByName(n.GetListId())!.InsertListItem(record,n.GetAttrListLevel());}
  if(kind===9)rules[0]!.Validate();
  if(kind===10)n.GetNum()?.GetNumber();
  nodes[0].GetNumberVector();
  const raw=nodes.map((node:SwTextNode)=>node.GetNum()?.GetNumber(false)??0);
  const result:Array<any>=Array(nodes.length);
  for(let i=nodes.length-1;i>=0;i--){const node=nodes[i];const record=node.GetNum();result[i]=record===undefined?null:{vector:node.GetNumberVector(),number:record.GetNumber(),rule:record.GetNumRule()!.GetName()};}
  const memberships=rules.map(rule=>{const clients:SwTextNode[]=[];rule.GetTextNodeList(clients);return clients.map(node=>nodes.indexOf(node));});
  const registered:SwNodeNum[]=[];doc.getIDocumentListItems().getNumItems(registered);
  const actual={raw,nodes:result,rules:memberships,registry:registered.map(record=>nodes.indexOf(record.GetTextNode()))};
  try{deepStrictEqual(actual,c.expected[step]);}catch(error){writeFileSync(`${dir}/comparison-failure.json`,JSON.stringify({sequence,step,operation:c.ops[step],actual,expected:c.expected[step]},null,2)+'\n');throw error;}
  states+=nodes.length;
 }
 doc.Dispose();
}
const result={sequences:cases.length,states,match:true,scope:'Actual shown node ownership, rule binding/membership, sorted registry, lazy raw prefix, reverse vectors and lifecycle operations; native adapters documented in native-oracle.py.'};
writeFileSync(`${dir}/comparison.json`,JSON.stringify(result,null,2)+'\n');console.log(result);
