import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createWriterDocument } from '../../../apps/office/src/sw/source/core/doc/doc';
import { applyWriterParagraphList } from '../../../apps/office/src/sw/source/core/doc/list';
import type { SwNodeNum } from '../../../apps/office/src/sw/source/core/SwNumberTree/SwNodeNum';
const cases=JSON.parse(readFileSync('.agentplane/tasks/202610010418-7548FA/native-results.json','utf8'));
let states=0;
for(const [caseIndex,test] of cases.entries()) {
 const doc=createWriterDocument(); const rule=doc.EnsureNumRule('Counters','numbered');
 test.starts.forEach((start:number,level:number)=>rule.GetNumFormat(level).SetStart(start));
 const nodes=test.items.map((item:any,index:number)=>{
  const node=index===0?doc.paragraphs[0]!:doc.nodes.MakeTextNode();
  applyWriterParagraphList(node,{kind:'numbered',level:0,styleId:'Counters',listId:'native-list'});
  if(!item.counted)node.SetCountedInList(false);
  if(item.restart)node.SetListRestart(true,item.actualStart);
  return node;
 });
 const list=doc.GetDocumentListsManager().GetListByName('native-list')!;
 for(const node of nodes)list.RemoveListItem(node);
 for(const [opIndex,[kind,index,value]] of test.ops.entries()) {
  const node=nodes[index]!;
  if(kind===0){node.SetAttrListLevel(value);list.InsertListItem(node,value);}
  if(kind===1)list.RemoveListItem(node);
  if(kind===2)node.SetAttrListLevel(value);
  if(kind===3)node.SetCountedInList(Boolean(value));
  if(kind===4)node.SetListRestart(true,value);
  if(kind===5)list.ValidateListTree();
  const actual=Array(nodes.length).fill(null);
  for(let i=nodes.length-1;i>=0;i--){
   const item=list.GetListItem(nodes[i]!);if(item===undefined)continue;
   const vector=list.GetListItemNumberVector(nodes[i]!)!;
   const parent=item.GetParent() as SwNodeNum;
   const phantoms=[];for(let n=item;n.GetParent()!==undefined;n=n.GetParent() as SwNodeNum)phantoms.unshift(n.IsPhantom());
   actual[i]={number:list.GetListItemNumber(nodes[i]!),continuation:item.IsContinueingPreviousSubTree(),parent:parent.GetTextNode()!==undefined?nodes.indexOf(parent.GetTextNode()!):parent.IsPhantom()?-2:-1,vector,phantoms};
  }
  assert.deepEqual(actual,test.expected[opIndex],`case${caseIndex} op${opIndex}:${kind},${index},${value}`);states+=nodes.length;
 }
}
console.log(`Actual document/list/tree matches ${cases.length} native lifecycle sequences/${states} item states,including immediate reverse-order reads.`);
