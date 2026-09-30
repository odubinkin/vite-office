import fs from 'node:fs';
import { Converter } from '../../../apps/office/src/sax/source/tools/converter.ts';
const rows=JSON.parse(fs.readFileSync(new URL('./native-results.json',import.meta.url),'utf8'));
for (const row of rows) {
 const actual=Converter.convertMeasure(row.value,row.target,row.min,row.max);
 if(actual!==row.native)throw new Error(JSON.stringify({...row,actual}));
}
console.log(`Native differential comparison passed: ${rows.length} source-derived parser/unit/rounding/clamping cases.`);
