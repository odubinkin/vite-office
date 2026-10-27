"""Extract pinned VCL MS substitution values and SAL charset metadata; --check is read-only."""
from pathlib import Path
import json
import re
import sys
import runpy

base = Path('vendor/libreoffice-reference')
# Keep the established extraction entry point while the complete VCL field/map extraction owns its resources.
substitutions = runpy.run_path('scripts/extract-font-config-map.py')['records']

textenc = base / 'sal/textenc'
lines, stack, accept = [], [], True
for line in (textenc / 'tables.cxx').read_text().splitlines():
    if line.startswith('#if WITH_LOCALE'):
        stack.append(accept)
    elif line.startswith('#else') and stack:
        accept = False
    elif line.startswith('#endif') and stack:
        accept = stack.pop()
    elif accept:
        lines.append(line)
text = '\n'.join(lines)
start = text.index('static ImplTextEncodingData const * const aData[]')
end = text.index('};', start)
body = re.sub(r'/\*.*?\*/', '', text[start:end], flags=re.S)
pointers = re.findall(r'&\w+|nullptr|NULL', body)
assert len(pointers) == 97
alltext = '\n'.join(p.read_text() for p in textenc.iterdir() if p.suffix in ['.tab', '.cxx', '.hxx'])
structs = {}
for match in re.finditer(r'ImplTextEncodingData\s+(?:const\s+)?(\w+)\s*=\s*\{', alltext):
    start, depth = match.end(), 1
    index = start
    while depth:
        if alltext[index] == '{':
            depth += 1
        elif alltext[index] == '}':
            depth -= 1
        index += 1
    value = re.sub(r'/\*.*?\*/|//[^\n]*', '', alltext[start:index-1], flags=re.S)
    depth, last, fields = 0, 0, []
    for index, char in enumerate(value):
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
        elif char == ',' and depth == 0:
            fields.append(value[last:index].strip())
            last = index + 1
    fields.append(value[last:].strip())
    assert len(fields) == 8
    structs[match[1]] = int(fields[6], 0)
charsets = {index: structs[pointer[1:]] for index, pointer in enumerate(pointers) if pointer.startswith('&')}
# Original Impl_getTextEncodingData handles these before the full table.
for index, symbol in [(11, 'aImplUSASCIITextEncodingData'), (1, 'aImplMS1252TextEncodingData'),
                      (76, 'aImplUTF8TextEncodingData'), (90, 'aImplJavaUtf8TextEncodingData'),
                      (12, 'aImplISO88591TextEncodingData')]:
    charsets[index] = structs[symbol]
# Check the core-dispatch IDs against the pinned declarations.
header = (base / 'include/rtl/textenc.h').read_text()
for label, index in [('ASCII_US', 11), ('MS_1252', 1), ('UTF8', 76), ('JAVA_UTF8', 90), ('ISO_8859_1', 12)]:
    assert re.search(r'#define\s+RTL_TEXTENCODING_' + label + r'\s+\(RTL_TEXTENC_CAST\(\s*' + str(index) + r'\s*\)\)', header)
for path, data in [('apps/office/src/sal/textenc/windows-charsets.json', charsets)]:
    value = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if '--check' in sys.argv:
        assert json.loads(Path(path).read_text()) == json.loads(value), path
    else:
        Path(path).write_text(value)
print(f'Pinned font data verified: {sum(map(len, substitutions.values()))} VCL records, {len(charsets)} SAL charset records, all97 full-table slots.')
