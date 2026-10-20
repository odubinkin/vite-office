/** Documentation evidence audit;it never executes or changes the referenced native/kernel implementations. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {format,resolveConfig} from 'prettier';
import assert from 'node:assert/strict';
const ledger='docs/program/calc-upstream-suspected-issues.md';
const data=readFileSync(ledger);
const before=execFileSync('git',['show','745b9fea6b5c:'+ledger]);
assert(data.subarray(0,before.length).equals(before),'Original ledger bytes changed');
const added=data.subarray(before.length).toString().trimStart();
assert.equal(await format(added,{...await resolveConfig(ledger),parser:'markdown'}),added,'New entries are not formatted');
const ids=[...data.toString().matchAll(/^## CALC-(\d+)/gm)].map(x=>Number(x[1]));
assert.equal(new Set(ids).size,ids.length,'Duplicate ledger IDs');
assert.deepEqual(ids.slice(-3),[189,190,191]);
let linkCount=0;
for(const match of added.matchAll(/\]\(([^)]+)\)/g)){
 const [target,fragment]=match[1].split('#');
 const path=resolve(dirname(ledger),target);
 assert(existsSync(path),'Missing local link:'+target);
 if(fragment){assert.match(fragment,/^L\d+$/);const line=Number(fragment.slice(1));assert(readFileSync(path,'utf8').split('\n').length>=line,'Invalid line anchor:'+match[1]);}
 linkCount++;
}
const anchors=[['sal/rtl/strtmpl.hxx',1562,'sal_Int32 nBuf'],['sal/rtl/strtmpl.hxx',1661,'if (!bHasDec'],['include/rtl/ustrbuf.hxx',447,'/**'],['sal/rtl/strtmpl.hxx',1218,'void stringbuffer_ensureCapacity'],['sal/textenc/tcvtbyte.cxx',122,'sal_Size ImplUpperCharToUnicode'],['sal/textenc/tcvtbyte.hxx',28,'sal_Size ImplUpperCharToUnicode'],['include/rtl/textcvt.h',109,'SAL_DLLPUBLIC sal_Size SAL_CALL rtl_convertTextToUnicode']];
for(const[path,line,marker]of anchors)assert(readFileSync('vendor/libreoffice-reference/'+path,'utf8').split('\n')[line-1].includes(marker),'Wrong source anchor:'+path+':'+line);
const hash=value=>createHash('sha256').update(value).digest('hex');
const sources={};
const records={};
for(const name of ['double-format','oustringbuffer']){
 const fixture=JSON.parse(readFileSync('apps/office/src/sal/rtl/native-'+name+'-cases.json','utf8'));
 assert.equal(fixture.pin,'9bc445578031fecf56086729d8e4940c77e14d65');
 const capture=fixture.captures.values;
 const bytes=gunzipSync(Buffer.from(capture.gzipBase64,'base64'));
 assert.equal(bytes.length,capture.byteLength);assert.equal(hash(bytes),capture.digest);
 records[name]={digest:capture.digest,byteLength:bytes.length,rowCount:bytes.toString().trimEnd().split('\n').length};
 for(const[path]of anchors){assert(fixture.sourceHashes[path],'Missing original source hash:'+path);const actual=hash(readFileSync('vendor/libreoffice-reference/'+path));assert.equal(actual,fixture.sourceHashes[path]);sources[path]=actual;}
 if(name==='double-format'){
  assert.equal(fixture.undefinedAllocation.signal,'SIGABRT');assert.equal(fixture.undefinedAllocation.source,'sal/rtl/strtmpl.hxx:1667');assert.equal(fixture.rowCount,122765);
  assert.equal(fixture.originalUnsafeAllocationDomain,'Excluded original unsafe allocation domain:1203');
  const log=readFileSync('.agentplane/tasks/202610182355-2WD4TX/native-isolated-stack-overflow.log','utf8');
  assert(log.includes('value=1e14,places=-15,groups={1,0}'));assert(log.includes('AddressSanitizer: dynamic-stack-buffer-overflow'));assert(log.includes('strtmpl.hxx:1667'));
 }else{
  const rows=bytes.toString().trimEnd().split('\n').map(x=>JSON.parse(x));
  assert.equal(rows.length,2119);assert(rows.some(row=>row[0]===40&&row[1][0]===8&&row[2][0][5].includes(0x4321)));
  assert(rows.some(row=>row[0]===41));assert.equal(fixture.assertions.length,11);
 }
}
const coverage=JSON.parse(readFileSync('.agentplane/tasks/202610190012-CMHQFZ/coverage-summary.json','utf8'));
for(const[path,expected]of Object.entries(coverage.currentSourceHashes))assert.equal(hash(readFileSync(path)),expected,'Kernel changed since verified task26:'+path);
const changed=execFileSync('git',['diff','--name-only','--','apps/office/src','scripts','vendor']).toString().trim();
const untracked=execFileSync('git',['ls-files','--others','--exclude-standard','--','apps/office/src','scripts','vendor']).toString().trim();assert.equal(changed,'');assert.equal(untracked,'');
const summary={result:'pass',ledgerPrefixBytes:before.length,ledgerPrefixSHA256:hash(before),newIDs:[189,190,191],newLocalLinks:linkCount,sourceHashes:sources,records,kernelUnchanged:true,sourceOnlyConcern:'CALC-191 has no claimed native execution',runtimeEvidence:'Existing committed task25/26 observations audited;no new runtime or unsafe native execution'};
writeFileSync('.agentplane/tasks/202610190727-BRPCJB/audit-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
