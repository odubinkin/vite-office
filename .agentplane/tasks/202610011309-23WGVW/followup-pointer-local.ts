import { SwNumFormat, SwNumRule, SvxNumType, type ConstSwNumFormat } from '../../../apps/office/src/sw/source/core/doc/number';
const rule = new SwNumRule('profile','label-alignment');
const format = new SwNumFormat();format.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);rule.Set(2,format);
const owned = rule.GetNumFormat(2);
const output: Record<string,unknown> = {scope:'Actual existing reference Set path; pointer overload is absent. Reference replacement is correct and must remain distinct.',ownedFrozen:Object.isFrozen(owned)};
format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);rule.Set(2,format);
output.changedReference = {same:rule.GetNumFormat(2)===owned,type:rule.Get(2).GetNumberingType()};
try {rule.Set(2,undefined as unknown as ConstSwNumFormat);output.unsupportedNull='returned';}
catch(error){output.unsupportedNull=error instanceof Error ? {name:error.name,message:error.message} : String(error);}
output.afterUnsupportedNull={owned:rule.GetNumFormat(2)!==undefined,type:rule.Get(2).GetNumberingType()};
console.log(JSON.stringify(output,null,2));
