import { SwNumRule } from '../../../apps/office/src/sw/source/core/doc/number';
const rule = new SwNumRule('Native format ownership audit');
const result = {
 effectiveAccessorExists: typeof (rule as unknown as { Get?: unknown }).Get === 'function',
 rawGetterReturnsOwnedDefault: rule.GetNumFormat(0) !== undefined,
 firstStart: rule.GetNumFormat(0).GetStart(),
 eagerLevels: Array.from({length:10}, (_, level) => rule.GetNumFormat(level) !== undefined),
 cloneLevels: Array.from({length:10}, (_, level) => rule.clone().GetNumFormat(level) !== undefined),
};
console.log(JSON.stringify(result, null, 2));
