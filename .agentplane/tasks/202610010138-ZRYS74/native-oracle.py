"""Compile unmodified pinned integer bodies and the list-item range branch.

Adapters: platform integer aliases, unsigned char projection, UTF-8/std::string
input, a FastAttributeIter integer port, no token container/UNO construction.
No full native build or other radix/UTF-16/attribute ownership claim.
"""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[3]
task = Path(__file__).resolve().parent
up = root / 'vendor/libreoffice-reference'

def body(file, marker):
    text = (up / file).read_text()
    start = text.index(marker)
    brace = text.index('{', start)
    depth = 1
    end = brace + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[start:end]

tmpl = 'sal/rtl/strtmpl.hxx'
view = 'include/o3tl/string_view.hxx'
pieces = [
    body(tmpl, 'template <typename C> struct with_length') + ';',
    body(tmpl, 'inline sal_Int16 implGetDigit'),
    body(tmpl, 'template <typename T, class Iter> inline bool HandleSignChar'),
    body(tmpl, 'template <typename T> std::pair<T, sal_Int16> DivMod'),
    body(tmpl, 'template <typename T, class S> T toInt'),
]
item = (up / 'xmloff/source/text/XMLTextListItemContext.cxx').read_text()
start = item.index('            sal_Int32 nTmp = aIter.toInt32();')
end = item.index('\n        }', start)
range_branch = item[start:end]
values = [
    '', '+', '-', 'garbage', '0', '-0', '+0', '1', '+1', '-1', '32767',
    '32768', '40000', '-32768', '0002', '1e2', '2.5', '12tail',
    '+12tail', '-12tail', '0x10', '  +12', ' + 12', '++1', '--1',
    '2147483647', '2147483648', '-2147483648', '-2147483649',
    '9223372036854775807', '9223372036854775808',
    '-9223372036854775808', '-9223372036854775809',
    '999999999999999999999999999999999', '0' * 1000 + '12', '9' * 1000,
    '\0' + '12', '12\0' + '34', 'é12', '\u00a012', '\u200012',
    '１２', '١٢', '12\u2000' + '34', '12 34', '  -0', '\x7f12',
]
values += [chr(code) + '12' for code in range(1, 33)]
values += [' '+sign+str(number)+tail for sign in ['', '+', '-']
           for number in [0, 1, 32767, 32768, 2147483647, 2147483648]
           for tail in ['', 'tail']]
values = list(dict.fromkeys(values))
strings = ',\n'.join('std::string{' + ','.join(f'char({b})' for b in v.encode()) + '}' for v in values)
source = '''#include <cassert>
#include <climits>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <string_view>
#include <type_traits>
#include <utility>
#include <vector>
using sal_Int16=int16_t; using sal_Int32=int32_t; using sal_Int64=int64_t;
using sal_Unicode=char16_t;
constexpr int RTL_STR_MIN_RADIX=2, RTL_STR_MAX_RADIX=36;
constexpr auto SAL_MIN_INT32=INT32_MIN, SAL_MAX_INT32=INT32_MAX;
template<class C> auto UChar(C c) {return static_cast<std::make_unsigned_t<C>>(c);}
namespace o3tl { namespace internal {
''' + body(view, 'inline bool implIsWhitespace') + '\n}}\nnamespace rtl::str {\n' + '\n'.join(pieces) + ';\n}\n'
source += body('sal/rtl/string.cxx', 'sal_Int64 SAL_CALL rtl_str_toInt64_WithLength').replace('SAL_CALL ', '')
source += '\nnamespace o3tl {\n' + body(view, 'inline sal_Int32 toInt32(std::string_view') + '\n}\n'
source += 'struct FastAttributeIter {sal_Int32 value; sal_Int32 toInt32(){return value;}};\nsal_Int16 itemStart(sal_Int32 value,bool bIsHeader){sal_Int16 nStartValue=-1; FastAttributeIter aIter{value};if(!bIsHeader){\n' + range_branch + '\n}return nStartValue;}\n'
source += 'int main(){std::vector<std::string> inputs={\n' + strings + '\n};for(auto &input:inputs){auto n=o3tl::toInt32(std::string_view(input));std::cout<<n<<","<<itemStart(n,false)<<","<<itemStart(n,true)<<"\\n";}}\n'
file = task / 'native-start.cxx'
file.write_text(source)
binary = task / 'native-start'
subprocess.run(['clang++', '-std=c++20', '-O0', str(file), '-o', str(binary)], check=True)
output = subprocess.check_output([str(binary)], text=True).splitlines()
binary.unlink()
rows = []
for value, line in zip(values, output, strict=True):
    number, start, header = map(int, line.split(','))
    rows.append(dict(value=value, number=number, start=start, header=header))
(task / 'native-results.json').write_text(json.dumps(rows, ensure_ascii=True, indent=2)+'\n')
print(f'Compiled unmodified rtl/o3tl integer and native item range bodies for {len(rows)} byte-view cases.')
