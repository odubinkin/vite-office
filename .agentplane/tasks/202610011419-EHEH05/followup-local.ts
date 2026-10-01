import {SwNumRule} from '../../../apps/office/src/sw/source/core/doc/number';
import {SwNodeNum} from '../../../apps/office/src/sw/source/core/SwNumberTree/SwNodeNum';
const rows:unknown[]=[];
for(const continuous of [false,true])for(const phantoms of [false,true]){const r=new SwNumRule('probe','label-alignment');r.SetContinusNum(continuous);r.SetCountPhantoms(phantoms);const node=new SwNodeNum(undefined,r);rows.push([continuous,phantoms,node.IsCountPhantoms()]);}
rows.push([null,null,new SwNodeNum().IsCountPhantoms()]);console.log(JSON.stringify(rows));
