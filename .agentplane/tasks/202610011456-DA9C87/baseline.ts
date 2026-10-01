import {SwNumRule} from '../../../apps/office/src/sw/source/core/doc/number';
import {SwNodeNum} from '../../../apps/office/src/sw/source/core/SwNumberTree/SwNodeNum';
const output:unknown[]=[];
for(const continuous of [false,true])for(const phantoms of [false,true]){const rule=new SwNumRule('baseline','label-alignment');rule.SetContinusNum(continuous);rule.SetCountPhantoms(phantoms);const node=new SwNodeNum(undefined,rule);output.push({continuous,phantoms,count:node.IsCountPhantoms(),methods:['IsContinuous','ValidateContinuous','GetPred','GetLastDescendant'].map(name=>[name,name in node])});}
console.log(JSON.stringify(output));
