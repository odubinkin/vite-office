"""Extract pinned font-name heuristic tables and complete shipped font substitution fields."""
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET
base = Path('vendor/libreoffice-reference')
source = (base / 'unotools/source/config/fontcfg.cxx').read_text()
header = (base / 'include/unotools/fontcfg.hxx').read_text()
font = (base / 'include/tools/fontenum.hxx').read_text()
def body(text, marker):
    start = text.index('{', text.index(marker)) + 1
    return re.sub(r'//[^\n]*|/\*.*?\*/', '', text[start:text.index('}', start)], flags=re.S)
def enum(text, marker):
    result = {}
    current = -1
    for part in body(text, marker).split(','):
        part = part.strip()
        if not part:
            continue
        if '=' in part:
            key, expr = map(str.strip, part.split('=', 1))
            if expr == 'SAL_MAX_ENUM':
                current = 2147483647
            else:
                current = 0
                for token in expr.split('|'):
                    token = token.strip()
                    current |= result[token] if token in result else int(token, 0)
        else:
            key = part
            current += 1
        result[key] = current
    return result
weights = enum(font, 'enum FontWeight')
widths = enum(font, 'enum FontWidth')
types = enum(header, 'enum class ImplFontAttrs')
def words(marker):
    return re.findall(r'"([^"]*)"|\b(nullptr)\b', body(source, marker))
def plain(marker):
    return [value if not null else None for value, null in words(marker)]
def rows(marker, symbols):
    start = source.index('{', source.index(marker))
    end = source.index('\n};', start)
    rows = []
    for key, expr in re.findall(r'\{\s*"([^"]*)"\s*,\s*([^}]+)\}', source[start:end]):
        value = 0
        for name in expr.strip().split('|'):
            value |= symbols[name.strip().removeprefix('ImplFontAttrs::')]
        rows.append([key, value])
    return rows
# Table structs contain nested braces, so use their actual array-definition marker.
data = {
    'leading': plain('const char* const aImplKillLeadingList[]'),
    'trailing': plain('const char* const aImplKillTrailingList[]'),
    'exceptions': plain('const char* const aImplKillTrailingWithExceptionsList[]'),
    'weight': rows('ImplFontAttrWeightSearchData const aImplWeightAttrSearchList[]', weights),
    'width': rows('ImplFontAttrWidthSearchData const aImplWidthAttrSearchList[]', widths),
    'type': rows('ImplFontAttrTypeSearchData const aImplTypeAttrSearchList[]', types),
    'weightNames': rows('const enum_convert pWeightNames[]', weights),
    'widthNames': rows('const enum_convert pWidthNames[]', widths),
    'typeNames': plain('const char* const pAttribNames[]'),
}
assert len(data['typeNames']) == 32
name = '{http://openoffice.org/2001/registry}name'
root = ET.parse(base / 'officecfg/registry/data/org/openoffice/VCL.xcu').getroot()
node = next(n for n in root.findall('node') if n.get(name) == 'FontSubstitutions')
records = {}
for locale in node.findall('node'):
    records[locale.get(name)] = {}
    for entry in locale.findall('node'):
        records[locale.get(name)][entry.get(name)] = {
            prop.get(name): prop.findtext('value', '')
            for prop in entry.findall('prop')
            if prop.get(name) in ['SubstFonts', 'SubstFontsMS', 'FontWeight', 'FontWidth', 'FontType']
        }
for path, value in [
    ('apps/office/src/unotools/source/config/data/font-name-map.json', data),
    ('apps/office/src/unotools/source/config/data/font-substitutions.json', records),
]:
    if '--check' in sys.argv:
        assert json.loads(Path(path).read_text()) == value, path
    else:
        Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
print('Pinned font configuration verified:', sum(map(len, records.values())), 'records;', len(data['type']), 'name-type rules')
