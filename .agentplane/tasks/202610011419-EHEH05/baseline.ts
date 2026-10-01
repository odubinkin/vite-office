import {SwNumRule} from '../../../apps/office/src/sw/source/core/doc/number';
const rule=new SwNumRule('baseline','label-alignment');
console.log(JSON.stringify({methods:['Assign','Reset','Equals','GetPoolFormatId','IsContinusNum','IsCountPhantoms'].map(name=>[name,name in rule]),clone:rule.clone().GetName()}));
