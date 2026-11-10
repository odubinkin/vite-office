#!/usr/bin/env python3
"""Compare actual local native-number service with unchanged upstream scalar helpers.

Uses scalar OUString/Sequence/buffer transports, not a SAL/UNO ABI certificate.
No mode12, signed-overflow domain, raw allocator failures or native service
construction are certified. All generated evidence remains repository-local.
"""
import json
import subprocess
import sys
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("native_data", ROOT / "scripts/generate-native-number-data.py")
module = importlib.util.module_from_spec(spec)
sys.dont_write_bytecode = True
spec.loader.exec_module(module)
SOURCE = module.SOURCE
OUT = ROOT / "output/native/AQF9AG-native-number"
OUT.mkdir(parents=True, exist_ok=True)
assert subprocess.check_output(["git", "-C", str(module.VENDOR), "rev-parse", "HEAD"], text=True).strip() == module.PIN
source = SOURCE.read_text()
(OUT / "sal").mkdir(exist_ok=True)
(OUT / "sal/types.h").write_text("#pragma once\n#include <cstdint>\nusing sal_Int16=int16_t;using sal_uInt16=uint16_t;using sal_Unicode=char16_t;\n")
program = r'''
#include <cstdint>
#include <iostream>
#include <string>
#include <string_view>
#include <vector>
#include <memory>
#include <cassert>
#include <iterator>
#include <cstring>
using sal_Int16=int16_t; using sal_Int32=int32_t;using sal_Int64=int64_t;using sal_Unicode=char16_t;
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
namespace sal {template<class T,class U>T static_int_cast(U x){return static_cast<T>(x);}}
struct rtl_uString {std::vector<char16_t> buffer;explicit rtl_uString_alloc_dummy();};
'''.replace('explicit rtl_uString_alloc_dummy();','')
program += r'''
rtl_uString* rtl_uString_alloc(int n){auto p=new rtl_uString;p->buffer.resize(n);return p;}
const int SAL_NO_ACQUIRE=0;
class OUString {
public:std::u16string s;
OUString()=default;OUString(const char16_t*p,int n):s(p,n){}
OUString(rtl_uString*p,int):s(p->buffer.begin(),p->buffer.end()){delete p;}
const char16_t*getStr()const{return s.c_str();}int getLength()const{return s.size();}
int indexOf(char16_t c)const{auto p=s.find(c);return p==s.npos?-1:p;}
std::u16string_view subView(int i)const{return std::u16string_view(s).substr(i);}
};
template<class T>struct Sequence{std::vector<T>s;void realloc(int n){s.resize(n);}T*getArray(){return s.data();}};
class OUStringBuffer{
public:std::u16string s;explicit OUStringBuffer(int=16){}
void append(char16_t c){s+=c;}void append(const char*s0){while(*s0)s+=*s0++;}
void append(const char16_t*s0){s+=s0;}void append(std::u16string_view v){s+=v;}
int getLength()const{return s.size();}void insert(int i,char16_t c){s.insert(s.begin()+i,c);}
int indexOf(const char* v)const{std::u16string k;while(*v)k+=*v++;auto p=s.find(k);return p==s.npos?-1:p;}
OUString makeStringAndClear(){OUString r(s.data(),s.size());s.clear();return r;}
};
'''
program += f'#include "{module.VENDOR}/i18npool/source/nativenumber/data/numberchar.h"\nusing namespace i18npool;\nnamespace {{\n'
program += module.between(source, "struct Number {", "namespace i18npool {")
program += module.between(source, "/// @throws RuntimeException\nstatic OUString AsciiToNativeChar", "sal_Int16 getLanguageNumber(") + '\n}\n'
program += 'namespace {\n' + module.between(source, "struct HebrewNumberChar {", "constexpr OUString implementationName")
program += r'''
int main(){int mode,lang,n;while(std::cin>>mode>>lang>>n){std::vector<char16_t> input(n);for(auto&v:input){int x;std::cin>>x;v=x;}
OUString in(input.data(),n),out;Sequence<int> offsets;offsets.s={-77};
switch(mode){
case 0:out=NativeToAscii(in,n,&offsets);break;
case 1:case 2:{int row=mode==1?natnum1[lang]:natnum2[lang];
 if(row==NumberChar_he)out=getHebrewNativeNumberString(in,mode==2);
 else if(row==NumberChar_cu)out=getCyrillicNativeNumberString(in);
 else out=AsciiToNativeChar(in,n,&offsets,row);break;}
case 3:out=AsciiToNativeChar(in,n,&offsets,NumberChar_FullWidth);break;
case 4:out=AsciiToNative(in,n,&offsets,&natnum4[lang]);break;
case 5:out=AsciiToNative(in,n,&offsets,&natnum5[lang]);break;
case 6:out=AsciiToNative(in,n,&offsets,&natnum6[lang]);break;
case 7:out=AsciiToNative(in,n,&offsets,&natnum7[lang]);break;
case 8:out=AsciiToNative(in,n,&offsets,&natnum8[lang]);break;
case 9:out=AsciiToNativeChar(in,n,&offsets,NumberChar_Hangul_ko);break;
case 10:out=AsciiToNative(in,n,&offsets,&natnum10);break;
case 11:out=AsciiToNative(in,n,&offsets,&natnum11);break;
}
std::cout<<"[\"";const char*h="0123456789abcdef";for(auto ch:out.s){std::cout<<"\\u";for(int k=12;k>=0;k-=4)std::cout<<h[(ch>>k)&15];}
std::cout<<"\",[";for(int i=0;i<int(offsets.s.size());i++){if(i)std::cout<<',';std::cout<<offsets.s[i];}std::cout<<"]]\n";
}}
'''
(OUT / "probe.cpp").write_text(program)
subprocess.run(["clang++", "-std=c++17", "-O2", "-I", str(OUT), str(OUT / "probe.cpp"), "-o", str(OUT / "probe")], check=True)
locales = ["zh_CN", "zh_TW", "ja_JP", "ko_KR", "he_IL", "ar_SA", "th_TH", "hi_IN", "or_IN", "mr_IN", "bn_IN", "pa_IN", "gu_IN", "ta_IN", "te_IN", "kn_IN", "ml_IN", "lo_LA", "bo_CN", "my_MM", "km_KH", "mn_MN", "ne_NP", "dz_BT", "fa_IR", "cu_RU"]
# Use locales whose native decimal/group separators are ASCII dot/comma for
# this helper witness. Other locale service/cache behavior has separate tests.
locales_to_probe = [0,1,2,3,4,5,6,7,22,25]
values = ["", "0", "00", "1", "10", "11", "15", "16", "19", "20", "99", "100", "101", "110", "1000", "1001", "10001", "100000001", "1000000000000", "1234567890123456789", "9223372036854775807", "-12", "--0015suffix", "12,345.67", "0.001", "1.2.3", "text 123", "123 text 456", "１２．３", "一万零三"]
values += [str(v) for v in range(0,1000,37)]
rows=[];lines=[]
for lang in locales_to_probe:
    for mode in range(12):
        valid = mode in (0,1,3) or mode==2 and lang<=4 or 4<=mode<=8 and lang<4 or mode>=9 and lang==3
        if not valid: continue
        for value in values:
            units=list(value.encode("utf-16-le"));units=[units[i]+256*units[i+1] for i in range(0,len(units),2)]
            rows.append([locales[lang],mode,value]);lines.append(' '.join(map(str,[mode,lang,len(units),*units])))
result=subprocess.run([str(OUT / "probe")], input='\n'.join(lines)+'\n', text=True, capture_output=True, check=True)
answers=[json.loads(line) for line in result.stdout.splitlines()]
assert len(answers)==len(rows)
# Keep the expected native punctuation for the actual queried locale: the
# witness above fixed helper arrays; choose only the matching locale inputs
# at comparison time, rather than substituting the local locale service.
for row,answer in zip(rows,answers):row.extend(answer)
(OUT / "cases.json").write_text(json.dumps(rows,ensure_ascii=False))
runner=r'''import { readFileSync } from "node:fs";
import { NativeNumberSupplierService, type NativeNumberMode } from "../../../apps/office/src/i18npool/source/nativenumber/nativenumbersupplier";
import { getLocaleDecimalSeparator, getLocaleThousandSeparator } from "../../../apps/office/src/i18npool/source/localedata/localedata";
import { Locale } from "../../../apps/office/src/udkapi/com/sun/star/lang/Locale";
import { unicode,text } from "../../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
const rows=JSON.parse(readFileSync(new URL("./cases.json",import.meta.url),"utf8")) as [string,NativeNumberMode,string,string,number[]][];
let checked=0,skipped=0;const mismatches:unknown[]=[];
for(const [name,mode,input,expected,offsets] of rows){
 const [language,country]=name.split("_"),l=unicode(language!),c=unicode(country!),v=unicode(""),locale=new Locale(l,c,v),service=new NativeNumberSupplierService(),source=unicode(input);
 try{
  if(getLocaleDecimalSeparator(locale)!=="." || getLocaleThousandSeparator(locale)!==","){skipped++;continue;}
  // Original service refreshes static punctuation only on nonzero conversions.
  const warm=service.getNativeNumberString(source,locale,1);warm.dispose();
  const actualOffsets=[-77],actual=service.getNativeNumberString(source,locale,mode,actualOffsets);
  try{checked++;if(text(actual)!==expected || JSON.stringify(actualOffsets)!==JSON.stringify(offsets))mismatches.push({name,mode,input,expected,actual:text(actual),offsets,actualOffsets});}finally{actual.dispose();}
 }finally{source.dispose();service.dispose();locale.dispose();v.dispose();c.dispose();l.dispose();}
}
console.log(JSON.stringify({checked,skipped,mismatchCount:mismatches.length,first:mismatches.slice(0,20)},null,2));if(mismatches.length)process.exitCode=1;
'''
(OUT / "compare.ts").write_text(runner)
subprocess.run(["npx", "tsx", str(OUT / "compare.ts")], cwd=ROOT, check=True)
