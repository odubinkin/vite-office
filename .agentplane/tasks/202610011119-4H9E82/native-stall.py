from pathlib import Path
import subprocess,json
root=Path('.agentplane/tasks/202610011119-4H9E82');source=root.joinpath('native-none.cxx').read_text();source=source[:source.index('int main(){')]+'''int main(){SwNumRule rule;rule.formats[0].type=SVX_NUM_NUMBER_NONE;rule.formats[2].sListFormat=OUString("%1%");auto value=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);std::cout<<value.value;}'''
root.joinpath('native-stall.cxx').write_text(source);binary=root/'native-stall'
try:
 subprocess.run(['clang++','-std=c++20','-fsanitize=address,undefined',str(root/'native-stall.cxx'),'-o',str(binary)],check=True)
 try:
  result=subprocess.run([str(binary)],timeout=1,capture_output=True);print('Returned',result.returncode);raise RuntimeError('Expected actual source non-progress was not observed')
 except subprocess.TimeoutExpired:
  root.joinpath('native-stall-result.json').write_text(json.dumps({'result':'timeout','seconds':1,'profile':{'pattern':'%1%','types':[2,0,0],'values':[2,3,4],'level':2},'scope':'Complete unchanged MakeNumString; NONE reference without a following placeholder never advances. Browser rejects this unsupported non-progress input with an explicit error; no native parity claim for this malformed profile.'},indent=2)+'\n');print('OBSERVED native unchanged MakeNumString non-progress; timeout after 1 second')
finally:binary.unlink(missing_ok=True)
