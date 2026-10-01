"""Manual developer oracle; project tests never import or invoke this generator."""

from pathlib import Path
import hashlib
import itertools
import json
import re
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json

out = Path('.agentplane/tasks/202610011627-W77K0Q')
reference = Path('vendor/libreoffice-reference')
pin = '9bc445578031fecf56086729d8e4940c77e14d65'
assert subprocess.check_output(['git', '-C', str(reference), 'rev-parse', 'HEAD'], text=True).strip() == pin
paths = ['sw/inc/SwNumberTree.hxx', 'sw/inc/SwNumberTreeTypes.hxx', 'sw/source/core/SwNumberTree/SwNumberTree.cxx']
texts = {path: (reference / path).read_text() for path in paths}
identities = [{'path': path, 'sha256': hashlib.sha256(text.encode()).hexdigest()} for path, text in texts.items()]
header = texts[paths[0]]
for signature in ['void ValidateHierarchical(const SwNumberTreeNode* pNode) const;', 'void ValidateContinuous(const SwNumberTreeNode* pNode) const;']:
    at = header.index(signature)
    assert header.rfind('protected:', 0, at) > header.rfind('public:', 0, at)
core = texts[paths[2]]
definitions = []
for signature in ['void SwNumberTreeNode::ValidateHierarchical(', 'void SwNumberTreeNode::ValidateContinuous(', 'void SwNumberTreeNode::Validate(', 'SwNumberTreeNode::GetIterator(', 'bool SwNumberTreeNodeLessThan(']:
    start = core.index(signature)
    index = core.index('{', start) + 1
    depth = 1
    while depth:
        depth += (core[index] == '{') - (core[index] == '}')
        index += 1
    definitions.append({'path': paths[2], 'signature': signature, 'sha256': hashlib.sha256(core[start:index].encode()).hexdigest()})
prefix = r'''
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <memory>
#include <set>
#include <vector>
#define SAL_DLLPUBLIC_RTTI
#define OSL_ENSURE(condition, message) ((void)(condition))
#define OSL_FAIL(message) ((void)0)
#define SAL_WARN_IF(condition, area, message) ((void)(condition))
using sal_uIntPtr = uintptr_t;
namespace tools { using Long = long; }
namespace o3tl { template<class T, class Compare> class sorted_vector : public std::set<T, Compare> { using Base = std::set<T, Compare>; public: using Base::insert; void insert(const sorted_vector& other) { Base::insert(other.begin(), other.end()); } }; }
class SwDoc { public: bool reading = true; std::vector<int> events; };
'''
types = '\n'.join(line for line in texts[paths[1]].splitlines() if not line.startswith('#include') and not line.startswith('#pragma'))
declaration = header[header.index('class SwDoc;'):]
implementation = '\n'.join(line for line in core.splitlines() if not line.startswith('#include'))
adapter = r'''
struct Policy { bool phantoms; int start, mask; bool restart; SwDoc* doc; };
class ProbeNode : public SwNumberTreeNode {
public:
    int index; bool real; Policy* policy;
    ProbeNode(int i, bool text, Policy* input): index(i), real(text), policy(input) {}
    bool IsCounted() const override { return real ? bool(policy->mask & (1 << index)) : SwNumberTreeNode::IsCounted(); }
    bool IsContinuous() const override { return false; }
    bool IsCountPhantoms() const override { return policy->phantoms; }
    bool IsRestart() const override { return real && index == 0 && policy->restart; }
    SwNumberTree::tSwNumTreeNumber GetStartValue() const override { return IsRestart() ? 11 : policy->start + (GetParent() ? GetLevelInListTree() : 0); }
    bool LessThan(const SwNumberTreeNode& other) const override { auto& b = static_cast<const ProbeNode&>(other); return !real ? b.real : b.real && index < b.index; }
    bool HasCountedChildren() const override { for(auto* child: mChildren) { auto* p=static_cast<const ProbeNode*>(child); if(p->IsCountedForNumbering() || p->HasCountedChildren()) return true; } return false; }
    bool IsCountedForNumbering() const override { return IsCounted(); }
    bool IsNotificationEnabled(const SwDoc& doc) const override { return !doc.reading; }
    bool IsNotifiable(const SwDoc& doc) const override { return !doc.reading; }
    void PreAdd() override {}
    void PostRemove() override {}
    void NotifyNode() override { ValidateMe(); if(real) policy->doc->events.push_back(index); }
    SwNumberTreeNode* Create() const override { return new ProbeNode(-1,false,policy); }
    void hierarchical(const SwNumberTreeNode* child) { ValidateHierarchical(child); }
    const auto& children() const { return mChildren; }
    const auto* valid() const { return mpLastValid; }
#ifdef BAD_ARG_H
    void missingHierarchyArgument() { ValidateHierarchical(); }
#endif
#ifdef BAD_ARG_C
    void missingContinuousArgument() { ValidateContinuous(); }
#endif
};
int nodeid(const SwNumberTreeNode* node) { auto* p=static_cast<const ProbeNode*>(node); return p->real ? p->index : -100-p->GetLevelInListTree(); }
void state(const SwNumberTreeNode* node) {
    auto* p=static_cast<const ProbeNode*>(node);
    std::cout<<"["<<nodeid(p)<<","<<p->GetNumber(false)<<",";
    if(p->valid()) std::cout<<nodeid(p->valid()); else std::cout<<"null";
    std::cout<<","<<(p->IsContinueingPreviousSubTree()?"true":"false")<<","<<(p->IsPhantom()?"true":"false")<<",[";
    bool comma=false; for(auto* child:p->children()){if(comma)std::cout<<",";comma=true;state(child);} std::cout<<"]]";
}
void snapshot(ProbeNode& root, std::vector<std::unique_ptr<ProbeNode>>& nodes, SwDoc& doc, const SwNumberTree::tNumberVector* read) {
    std::cout<<"{\"tree\":";state(&root);std::cout<<",\"raw\":[";bool comma=false;
    for(auto& p:nodes){if(comma)std::cout<<",";comma=true;std::cout<<p->GetNumber(false);} std::cout<<"],\"events\":[";comma=false;
    for(int event:doc.events){if(comma)std::cout<<",";comma=true;std::cout<<event;} std::cout<<"],\"read\":";
    if(!read)std::cout<<"null";else{std::cout<<"[";comma=false;for(auto v:*read){if(comma)std::cout<<",";comma=true;std::cout<<v;}std::cout<<"]";}std::cout<<"}";
}
int main() {
    std::cout<<"["; bool outer=false; int phantoms,start,mask,restart;
    while(std::cin>>phantoms>>start>>mask>>restart) {
        SwDoc doc; Policy policy{bool(phantoms),start,mask,bool(restart),&doc}; ProbeNode root(-1,false,&policy), foreign(123,true,&policy);
#ifdef BAD_PUBLIC_H
        root.ValidateHierarchical(nullptr);
#endif
#ifdef BAD_PUBLIC_C
        root.ValidateContinuous(nullptr);
#endif
        std::vector<std::unique_ptr<ProbeNode>> nodes;
        for(int i=0;i<4;i++){int level;std::cin>>level;nodes.push_back(std::make_unique<ProbeNode>(i,true,&policy));root.AddChild(nodes.back().get(),level,doc);}
        if(outer)std::cout<<",";outer=true;std::cout<<"[";
        for(int step=0;step<13;step++) {
            doc.events.clear(); SwNumberTree::tNumberVector read; bool hasRead=false;
            if(step==1 || step==11) root.hierarchical(nullptr);
            if(step==2 || step==12) root.hierarchical(&foreign);
            if(step==3) root.hierarchical(*root.children().begin());
            if(step==4) root.hierarchical(*root.children().rbegin());
            if(step==5) for(auto& node:nodes) if(!node->children().empty()) node->hierarchical(*node->children().rbegin());
            if(step==6 || step==7){read=nodes[step==6?0:3]->GetNumberVector();hasRead=true;}
            if(step==8) root.InvalidateTree();
            if(step==9) root.NotifyInvalidChildren(doc);
            if(step==10){doc.reading=false;root.NotifyInvalidChildren(doc);}
            if(step)std::cout<<",";snapshot(root,nodes,doc,hasRead?&read:nullptr);
        }
        std::cout<<"]";doc.reading=true;for(auto i=nodes.rbegin();i!=nodes.rend();++i)(*i)->RemoveMe(doc);
    }
    std::cout<<"]";
}
'''
source = prefix + types + declaration + implementation + adapter
native_source = probe_source(out / 'contract-probe.cxx')
native_source.write_text(source)
binary = native_source.with_suffix('')
command = ['c++', '-std=c++17', '-O0', '-g', '-fsanitize=address,undefined', str(native_source), '-o', str(binary)]
with (out / 'native-build.log').open('w') as log:
    build = subprocess.run(command, stdout=log, stderr=subprocess.STDOUT)
assert build.returncode == 0, 'Native compilation failed; see native-build.log'
negative = []
for flag, expected in [('BAD_PUBLIC_H','protected member'),('BAD_PUBLIC_C','protected member'),('BAD_ARG_H','too few arguments'),('BAD_ARG_C','too few arguments')]:
    result = subprocess.run(['c++','-std=c++17','-fsyntax-only','-D'+flag,str(native_source)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    (out / (flag.lower()+'.log')).write_text(result.stdout)
    assert result.returncode != 0 and expected in result.stdout, (flag,result.stdout)
    negative.append({'flag':flag,'exit':result.returncode,'expectedDiagnostic':expected})
profiles = []
for levels, phantoms, start, mask, restart in itertools.product([[0,1,1,0],[2,2,0,2],[0,3,1,3],[9,9,0,9]],[False,True],[0,7],[0,5,10,15],[False,True]):
    profiles.append({'levels':levels,'phantoms':phantoms,'start':start,'mask':mask,'restart':restart})
request = ''.join(f'{int(p["phantoms"])} {p["start"]} {p["mask"]} {int(p["restart"])} '+' '.join(map(str,p['levels']))+'\n' for p in profiles)
(out / 'native-request.txt').write_text(request)
with (out / 'native-run.log').open('w') as log:
    run = subprocess.run([str(binary.resolve())], input=request, stdout=subprocess.PIPE, stderr=log, text=True)
assert run.returncode == 0, 'Native execution failed; see native-run.log'
observations = json.loads(run.stdout)
assert len(observations) == len(profiles) and all(len(p)==13 for p in observations)
for profile, expected in zip(profiles,observations): profile['expected'] = expected
(out / 'native-output.json').write_text(identity_json(profiles,separators=(',',':'))+'\n')
(out / 'native-identities.json').write_text(identity_json({'pin':pin,'files':identities,'definitions':definitions,'sourceProfileSha256':hashlib.sha256(source.encode()).hexdigest(),'profileCount':len(profiles),'snapshots':len(profiles)*13,'recordStates':len(profiles)*13*4,'compileContracts':negative,'adapters':'Complete native header/type declarations and all core implementation bodies; include dependencies are replaced by std::set ordered-child adapter, tools::Long=long, sal pointer-width alias, nonfatal diagnostic/logging macros and fixture policy hooks. Policy input supplies Arabic numbering presence, explicit owned level starts/count/restart/phantom flags, numeric document ordering, reading suppression and validating notification event capture. PreAdd/PostRemove omit owner registration; native SwNodeNum/doc/style/layout/service/global lifetime is not certified by this core-only probe. Existing complete owner/lifecycle fixtures are unchanged and remain separate evidence.'},indent=2)+'\n')
print(len(profiles),'profiles',len(profiles)*13,'snapshots',len(profiles)*13*4,'record states; four native compile contract failures confirmed')
