"""Exercise the unmodified native item factory with its actual sal_Int16 counter.

Reuse the documented found-rule/platform/reference/helper adapters. This probes
Clang's signed16 narrowing at increment assignment, not general native UB policy.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import subprocess
import json

task = Path(__file__).resolve().parent
root = task.parents[2]
header = (root / 'vendor/libreoffice-reference/xmloff/source/text/XMLTextListItemContext.hxx').read_text()
assert 'sal_Int16 mnSubListCount;' in header
source = (probe_source(task / 'native-sublist.cxx')).read_text().split('int main(){')[0]
assert 'sal_Int16 mnSubListCount=0;' in source
source += '''int main(){Import imp;Attr attr;Attr*attrs=&attr;
XMLTextListBlockContext root(imp,imp,attrs);
XMLTextListItemContext item(imp,attrs,false);
for(int n=1;n<=65538;++n){auto*child=static_cast<XMLTextListBlockContext*>(item.createFastChildContext(TEXT_LIST,attrs));
if(n==1||n==2||n==32767||n==32768||n==32769||n==65535||n==65536||n==65537||n==65538)std::cout<<n<<","<<child->IsRestartNumbering()<<"\\n";
child->endFastElement(0);delete child;root.ResetRestartNumbering();}
item.endFastElement(0);root.endFastElement(0);}
'''
p = probe_source(task / 'native-count.cxx')
p.write_text(source)
binary = task / 'native-count'
subprocess.run(['clang++','-std=c++20','-O0',str(p),'-o',str(binary)],check=True)
output = subprocess.check_output([str(binary)],text=True)
binary.unlink()
rows = [[int(v) for v in line.split(',')] for line in output.splitlines()]
assert rows == [[1,0],[2,1],[32767,1],[32768,0],[32769,0],[65535,0],[65536,0],[65537,0],[65538,1]]
(task / 'native-count-results.json').write_text(identity_json(rows,indent=2)+'\n')
print('Native signed16 sublist increment matches9 boundary states over65538 child lists.')
