import fs from 'node:fs';
import crypto from 'node:crypto';
import cp from 'node:child_process';
const root='vendor/libreoffice-reference/';
const pinned=['sc/source/core/data/column2.cxx','sc/source/core/data/table1.cxx','sc/source/core/data/table2.cxx','sc/source/core/data/global.cxx','sc/source/core/data/docpool.cxx','sc/source/core/data/rowheightcontext.cxx','sc/inc/rowheightcontext.hxx','sc/source/ui/view/viewfun2.cxx','sc/source/ui/inc/viewdata.hxx','sc/source/filter/xml/xmlstyle.cxx','sax/source/tools/converter.cxx'];
const files=pinned.map(path=>({path:root+path,sha256:crypto.createHash('sha256').update(fs.readFileSync(root+path)).digest('hex')}));
const assertions={
 standardLiteral:fs.readFileSync(root+pinned[0],'utf8').includes('nHeight *= 1.18;'),
 correction:/STD_ROWHEIGHT_DIFF\s+23/.test(fs.readFileSync(root+'sc/inc/global.hxx','utf8')),
 nativeHeightStorage:fs.readFileSync(root+pinned[1],'utf8').includes('new ScFlatUInt16RowSegments'),
 sharedContext:fs.readFileSync(root+'sc/source/ui/view/viewfun2.cxx','utf8').includes('sc::RowHeightContext aCxt(rDoc.MaxRow(), nPPTX, nPPTY, fZoomX, fZoomY, aProv.GetDevice());'),
 rowProperties:fs.readFileSync(root+'sc/source/filter/xml/xmlstyle.cxx','utf8').includes('XML_USE_OPTIMAL_ROW_HEIGHT'),
 boolLiterals:fs.readFileSync(root+'sax/source/tools/converter.cxx','utf8').includes('return rBool || (rString == u"false");'),
};
if(Object.values(assertions).some(v=>!v))throw Error(JSON.stringify(assertions));
const modified=JSON.parse(fs.readFileSync('.agentplane/tasks/202610191401-GKVVR7/evidence/application-paths.json'));
const result={baseline:'9bc445578031fecf56086729d8e4940c77e14d65',method:'Pinned source inspection plus actual managed model tests; no compiled native parity claim.',assertions,files,local:modified.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),limitations:['Device startup InitTextHeight and physical font metrics unported','Only plain unwrapped unrotated uniform script-height standard layout represented','Drawing,hidden rows,merged/rich/mixed-script text and script-dependent device layout and height dialogs unported','Extreme native float-to-UInt16 conversion not certified','Cross-selected-sheet accumulation preserved as CALC-196']};
fs.writeFileSync('.agentplane/tasks/202610191401-GKVVR7/evidence/source-audit.json',JSON.stringify(result,null,2)+'\n');
