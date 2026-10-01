import {SwDoc} from '../../../apps/office/src/sw/source/core/doc/doc';
import {SwAttrSet} from '../../../apps/office/src/sw/source/core/attr/swatrset';
import {SfxInt16Item} from '../../../apps/office/src/svl/source/items/intitem';
const results=[];
for(const reading of [false,true]){
 const doc=new SwDoc(),node=doc.paragraphs[0]!;doc.SetInReading(reading);
 const pool=doc.GetAttrPool(),set=new SwAttrSet(pool,[[84,87]]),old=new SwAttrSet(pool,[[84,87]]),next=new SwAttrSet(pool,[[84,87]]);
 set.Put(new SfxInt16Item(86,7));set.ClearItem_BC(86,old,next);
 results.push({reading,poolDefault:pool.GetUserOrPoolDefaultItem(86).QueryValue(),nodeDefault:node.GetAttr(86).QueryValue(),state:node.GetSwAttrSet().GetItemState(86,false),hasDirect:node.HasAttrListRestartValue(),restart:node.IsListRestart(),clearDelta:next.Get(86).QueryValue()});
}
console.log(JSON.stringify(results,null,2));
