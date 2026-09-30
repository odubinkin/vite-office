import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SvxNumberFormat } from '../../../apps/office/src/editeng/source/items/numitem.ts';
import { SwNumFormat, SwNumRule } from '../../../apps/office/src/sw/source/core/doc/number.ts';
const cases = JSON.parse(readFileSync(new URL('./native-results.json', import.meta.url), 'utf8'));
for (const [index, test] of cases.entries()) {
  if (test.kind === 'marker') {
    const formats = Array.from({ length: 10 }, (_, level) => new SwNumFormat(test.types[level] === 1 ? 'bullet' : 'numbered'));
    const current = formats[test.level]!;
    current.SetIncludeUpperLevels(test.count);
    current.SetPrefix(test.prefix);
    current.SetSuffix(test.suffix);
    if (test.pattern !== null) current.SetListFormat(test.pattern);
    const rule = new SwNumRule('native', formats);
    assert.equal(rule.MakeNumString(test.values, test.level), test.expected, `native marker ${index}`);
    assert.equal(rule.clone().MakeNumString(test.values, test.level), test.expected, `clone marker ${index}`);
  } else {
    const format = new SvxNumberFormat();
    if (test.kind === 'generate') {
      format.SetIncludeUpperLevels(test.count);
      format.SetListFormat(test.prefix, test.suffix, test.level);
    } else {
      format.SetListFormat(test.pattern === null ? undefined : test.pattern);
      if (test.action === 'prefix') format.SetPrefix('P');
      if (test.action === 'suffix') format.SetSuffix('S');
      if (test.action === 'count') format.SetIncludeUpperLevels(7);
      if (test.action === 'clear') format.SetListFormat();
    }
    assert.deepEqual([format.GetPrefix(), format.GetSuffix(), format.GetIncludeUpperLevels(), format.HasListFormat() ? format.GetListFormat() : null], test.expected, `native state ${index}`);
  }
}
console.log(`${cases.length} native states/labels match; all 83 marker cases also match after owned rule clone.`);
