"""Probe unchanged native insertion notification timing for the existing topology fixtures."""
from pathlib import Path
import subprocess,json,itertools
root=Path('.agentplane/tasks/202610010735-THRTCH')
base=(root/'native-attributes.cxx').read_text().split('int main(){',1)[0]
base+=r'''
int main(){int count;while(std::cin>>count){SwDoc doc;SwNodes nodes(&doc);sw::DocumentListItemsManager registry;ListAccess access;access.nodes=&nodes;doc.nodes=&nodes;doc.lists=&access;doc.items=&registry;SwNumRule rule;access.rules[rule.name]=&rule;for(auto& f:rule.formats)f.start=0;SwTextFormatColl style;std::vector<std::unique_ptr<SwTextNode>> texts;std::vector<int> levels;for(int i=0;i<count;i++){int level,counted;std::cin>>level>>counted;levels.push_back(level);auto p=std::make_unique<SwTextNode>();p->index=i;p->doc=&doc;p->nodes=&nodes;p->coll=&style;p->SetAttr(SwNumRuleItem("Counters"));p->SetAttrListLevel(level);if(!counted)p->SetAttr(BoolItem(87,false));texts.push_back(std::move(p));}int starts[]={7,5,3,2,4,6,8,9,10,11};for(int i=0;i<10;i++)rule.formats[i].start=starts[i];int orders;std::cin>>orders;std::vector<std::unique_ptr<SwNodeNum>> roots;for(int o=0;o<orders;o++){roots.push_back(std::make_unique<SwNodeNum>(&rule));auto& root=*roots.back();for(auto& p:texts)p->mpNodeNum->RemoveMe(doc);for(int i=0;i<count;i++){int at;std::cin>>at;root.AddChild(texts[at]->mpNodeNum.get(),levels[at],doc);}root.ValidateHierarchical(nullptr);for(auto& p:texts){auto v=p->GetNumberVector();std::cout<<v.size();for(auto x:v)std::cout<<' '<<x;std::cout<<'\n';}root.InvalidateTree();for(auto& p:texts){auto v=p->GetNumberVector();std::cout<<v.size();for(auto x:v)std::cout<<' '<<x;std::cout<<'\n';}}}}
'''
# ValidateHierarchical(nullptr) in the old fixture was a stand-in for group validation.
# Native takes a child target; use its actual last root child to match the existing TS full-group adapter.
base=base.replace('root.ValidateHierarchical(nullptr);','if(!root.mChildren.empty())root.ValidateHierarchical(*root.mChildren.rbegin());')
(root/'native-phantom-timing.cxx').write_text(base)
binary=root/'native-phantom-timing';subprocess.run(['clang++','-std=c++20',str(root/'native-phantom-timing.cxx'),'-o',str(binary)],check=True)
cases=json.loads((root/'phantom-cases.json').read_text());request='';ordersTotal=0
for c in cases:
 count=len(c['levels']);c['orders']=list(map(list,itertools.permutations(range(count))));ordersTotal+=len(c['orders']);request+=f'{count} '+' '.join(f'{a} {int(b)}'for a,b in zip(c['levels'],c['counted']))+f' {len(c["orders"])} '+' '.join(' '.join(map(str,o))for o in c['orders'])+'\n'
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink();at=0
for c in cases:
 c['expected']=[]
 for order in c['orders']:
  rows=[]
  for _ in range(2):
   vectors=[]
   for i in c['levels']:vectors.append(list(map(int,lines[at].split()))[1:]);at+=1
   rows.append(vectors)
  assert rows[1]==c['vectors'], (c,order,rows)
  c['expected'].append(rows[0])
assert at==len(lines)
(root/'native-phantom-timing.json').write_text(json.dumps(cases,separators=(',',':'))+'\n')
print(f'{ordersTotal} insertion orders;{len(lines)} before/after-invalidation native vectors. All fresh vectors retain the prior literal topology contract.')
