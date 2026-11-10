#!/usr/bin/env python3
"""Compile pinned LibreOffice native-number tables and project their scalar values.

The small scalar-type transport is not a native SAL/UNO ABI certificate. Table
initializers, Number flags and language ordering are compiled without rewriting.
All temporary compiler inputs and outputs stay inside the repository.
"""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / "vendor/libreoffice-reference"
SOURCE = VENDOR / "i18npool/source/nativenumber/nativenumbersupplier.cxx"
TARGET = ROOT / "apps/office/src/i18npool/source/nativenumber/data/numberchar.json"
PIN = "9bc445578031fecf56086729d8e4940c77e14d65"


def between(source: str, first: str, last: str) -> str:
    """Take an unchanged source responsibility bounded by exact markers."""
    return source[source.index(first):source.index(last, source.index(first))]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    actual = subprocess.check_output(["git", "-C", str(VENDOR), "rev-parse", "HEAD"], text=True).strip()
    if actual != PIN:
        raise SystemExit(f"Unexpected LibreOffice reference: {actual}")
    source = SOURCE.read_text()
    declarations = between(source, "struct Number {", "namespace i18npool {")
    # The enclosing anonymous namespace ends after Number; reopen one for the
    # extracted declarations so the original closing brace remains unchanged.
    specs = between(source, "const Number natnum4[4]", "sal_Int16 getLanguageNumber(")
    hebrew = between(source, "struct HebrewNumberChar {", "static void makeHebrewNumber(")
    cyrillic = between(source, "struct CyrillicNumberChar {", "static void makeCyrillicNumber(")
    header = VENDOR / "i18npool/source/nativenumber/data/numberchar.h"
    program = r'''
#include <cstdint>
#include <iterator>
#include <iostream>
using sal_Int16=int16_t; using sal_Int32=int32_t; using sal_Unicode=char16_t;
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
'''
    program += f'#include "{header}"\nnamespace {{\n' + declarations
    program += '\nusing namespace i18npool;\n' + specs + '\nnamespace {\n' + hebrew + '\nnamespace {\n' + cyrillic
    program += r'''
template<class T> void array(const T& a) {
  std::cout<<'['; bool sep=false;
  for(auto v:a){if(sep) std::cout<<','; sep=true; std::cout<<static_cast<int>(v);}
  std::cout<<']';
}
template<class T> void rows(const T& a) {
  std::cout<<'['; bool sep=false;
  for(const auto& v:a){if(sep) std::cout<<',';sep=true;array(v);}std::cout<<']';
}
void spec(const Number& n) {
  std::cout<<"{\"number\":"<<n.number<<",\"numberFlag\":"<<n.numberFlag<<",\"multiplierChar\":[";
  for(int i=0;i<n.exponentCount;++i){if(i)std::cout<<',';std::cout<<int(n.multiplierChar[i]);}
  std::cout<<"],\"multiplierExponent\":[";
  for(int i=0;i<n.exponentCount;++i){if(i)std::cout<<',';std::cout<<n.multiplierExponent[i];}
  std::cout<<"]}";
}
int main(){std::cout<<'{';
'''
    fields = [("numberChar", "NumberChar", True), ("decimalChar", "DecimalChar", False),
              ("minusChar", "MinusChar", False), ("separatorChar", "SeparatorChar", False)]
    for count in (7, 6, 2):
        fields += [(f"multiplierChar{count}Cjk", f"MultiplierChar_{count}_CJK", True),
                   (f"multiplierExponent{count}Cjk", f"MultiplierExponent_{count}_CJK", False)]
    fields += [("natnum1", "natnum1", False), ("natnum2", "natnum2", False)]
    for i, (key, name, nested) in enumerate(fields):
        program += f'std::cout<<"{"," if i else ""}\\\"{key}\\\":"; {"rows" if nested else "array"}({name});\n'
    program += 'std::cout<<",\\\"natnum1Locales\\\":[";for(int i=0;i<nbOfLocale;++i){if(i)std::cout<<\',\';std::cout<<\'"\'<<natnum1Locales[i]<<\'"\';}std::cout<<"],\\\"numberSpecs\\\":{";\n'
    for i, mode in enumerate((4, 5, 6, 7, 8, 10, 11)):
        program += f'std::cout<<"{"," if i else ""}\\\"{mode}\\\":[";'
        program += (f'for(int i=0;i<4;++i){{if(i)std::cout<<\',\';spec(natnum{mode}[i]);}}' if mode < 9 else f'spec(natnum{mode});')
        program += 'std::cout<<"]";\n'
    program += 'std::cout<<"}";\n'
    for key, name in (("hebrew", "HebrewNumberCharArray"), ("cyrillic", "CyrillicNumberCharArray")):
        program += f'std::cout<<",\\\"{key}\\\":[";bool {key}Sep=false;for(auto v:{name}){{if({key}Sep)std::cout<<\',\';{key}Sep=true;std::cout<<\'[\'<<int(v.code)<<\',\'<<v.value<<\']\';}}std::cout<<"]";\n'
    program += "std::cout<<'}';}\n"
    # Declarations have their native closing anonymous-namespace braces, so
    # they are intentionally preceded by matching namespace openings above.
    base = ROOT / "output/native"
    base.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="natnum-data-", dir=base) as temp:
        path = Path(temp)
        (path / "sal").mkdir()
        (path / "sal/types.h").write_text("#pragma once\n#include <cstdint>\nusing sal_Int16=int16_t;using sal_uInt16=uint16_t;using sal_Unicode=char16_t;\n")
        (path / "tables.cpp").write_text(program)
        subprocess.run(["clang++", "-std=c++17", "-I", str(path), str(path / "tables.cpp"), "-o", str(path / "tables")], check=True)
        data = json.loads(subprocess.check_output([str(path / "tables")], text=True))
    rendered = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not TARGET.exists() or json.loads(TARGET.read_text()) != data:
            raise SystemExit(f"Outdated generated source table: {TARGET}")
    else:
        TARGET.write_text(rendered)


if __name__ == "__main__":
    main()
