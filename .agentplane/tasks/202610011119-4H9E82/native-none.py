from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json,subprocess,hashlib
root=Path('.agentplane/tasks/202610011119-4H9E82');sw=Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text()
previous=probe_source(Path('.agentplane/tasks/202609302319-9KTM99/native-marker-oracle.cxx')).read_text();cpp=previous[:previous.index('int main(){')]
cases=[]
for pattern in [None,'%1%.%2%.%3%']:
 for types in [[2,0,0],[0,2,0],[2,2,0],[0,0,2]]:
  for values in [[2,3,4],[0,0,4]]:cases.append(dict(pattern=pattern,types=types,values=values))
main=['int main(){std::cout<<"[";']
for index,c in enumerate(cases):
 main+=['{SwNumRule rule;']+[f'rule.formats[{n}].type={t};' for n,t in enumerate(c['types'])]
 main+=['rule.formats[2].nInclUpperLevels=3;rule.formats[2].sPrefix="(";rule.formats[2].sSuffix=")";']
 if c['pattern'] is not None:main += [f'rule.formats[2].sListFormat=OUString({identity_json(c["pattern"])});']
 if index:main+=['std::cout<<",";']
 main += [f'std::cout<<std::quoted(rule.MakeNumString({{{",".join(map(str,c["values"]))}}},true,2,false,nullptr,0).value);', '}']
main+=['std::cout<<"]\\n";}']
probe_source(root.joinpath('native-none.cxx')).write_text(cpp+'\n'.join(main))
records=[]
for marker in ['void StripNonDelimiter(','OUString SwNumRule::MakeNumString( const SwNumberTree::tNumberVector']:
 a=sw.index(marker);b=sw.index('\n}\n',a)+3;value=sw[a:b];assert value in cpp
 records.append(dict(source='sw/source/core/doc/number.cxx',marker=marker,sha256=hashlib.sha256(value.encode()).hexdigest(),text=value))
root.joinpath('native-none-identity.json').write_text(identity_json(dict(definitions=records,adapters='Reuses named ASCII OUString/Arabic formatting/locale/field aliases from immutable iteration33. Complete unchanged source methods. Valid NONE patterns with following numbered placeholders only; native non-progress malformed NONE trailing-reference profile is not normalized or certified.'),indent=2)+'\n')
binary=root/'native-none'
try:
 subprocess.run(['clang++','-std=c++20','-fsanitize=address,undefined',str(probe_source(root/'native-none.cxx')),'-o',str(binary)],check=True)
 output=json.loads(subprocess.check_output([str(binary)],text=True,timeout=10))
 for c,v in zip(cases,output):c['expected']=v
 Path('apps/office/src/sw/source/core/doc/number-none-native.json').write_text(identity_json(cases,indent=2)+'\n');root.joinpath('native-none-results.json').write_text(identity_json(cases,indent=2)+'\n');print('PASS 2 unchanged complete methods;',len(cases),'NONE states; ASan/UBSan')
finally:binary.unlink(missing_ok=True)
