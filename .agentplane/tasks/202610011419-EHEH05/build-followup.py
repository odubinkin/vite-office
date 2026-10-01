from pathlib import Path
import json,hashlib
out=Path('.agentplane/tasks/202610011419-EHEH05');src=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNodeNum.cxx').read_text();sig='bool SwNodeNum::IsCountPhantoms() const';a=src.index(sig);i=src.index('{',a)+1;depth=1
while depth:
 depth+=(src[i]=='{')-(src[i]=='}');i+=1
value=src[a:i]
profile=(out/'native-rule.cxx').read_text().split('void scalar(')[0]+'\n#define OSL_FAIL(m) ((void)0)\nstruct SwNodeNum {SwNumRule*mpNumRule;bool IsCountPhantoms()const;};\n'+value+r'''
int main(){std::cout<<"[";bool comma=false;for(bool continuous:{false,true})for(bool phantoms:{false,true}){SwNumRule r("probe",SvxNumberFormat::LABEL_ALIGNMENT);r.SetContinusNum(continuous);r.SetCountPhantoms(phantoms);SwNodeNum node{&r};if(comma)std::cout<<",";comma=true;std::cout<<"[";boolout(continuous);std::cout<<",";boolout(phantoms);std::cout<<",";boolout(node.IsCountPhantoms());std::cout<<"]";}SwNodeNum root{nullptr};std::cout<<",[null,null,";boolout(root.IsCountPhantoms());std::cout<<"]]";}
'''
(out/'followup-phantoms.cxx').write_text(profile)
(out/'followup-phantoms-identities.json').write_text(json.dumps({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','path':'sw/source/core/SwNumberTree/SwNodeNum.cxx','signature':sig,'sha256':hashlib.sha256(value.encode()).hexdigest(),'profileSha256':hashlib.sha256(profile.encode()).hexdigest(),'scope':'Read-only next-gap audit of complete unchanged native IsCountPhantoms against actual local SwNodeNum. Named bound-rule/no-rule diagnostic adapter reuses47 native rule profile. Does not certify full phantom/continuous counter/tree behavior.'},indent=2)+'\n')
