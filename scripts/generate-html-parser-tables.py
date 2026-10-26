#!/usr/bin/env python3
"""Extract pinned native HTML token/option/entity/color tables without a host HTML grammar."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
REFERENCE = ROOT / "vendor/libreoffice-reference"
TARGET = ROOT / "apps/office/src/svtools"
header = (REFERENCE / "include/svtools/htmltokn.h").read_text()
keywords = (REFERENCE / "include/svtools/htmlkywd.hxx").read_text().replace("\\\n", "")
source = (REFERENCE / "svtools/source/svhtml/htmlkywd.cxx").read_text()
macros = dict(re.findall(r'#define\s+(OOO_STRING_SVTOOLS_(?:HTML|XHTML)_\w+)\s+"([^"\n]*)"', keywords))


def enum_values(name):
    body = re.search(r'enum class ' + name + r'[^;{]*\{(.*?)\};', header, re.S).group(1)
    body = re.sub(r'/\*.*?\*/|//[^\n]*', '', body, flags=re.S)
    values = {}
    previous = -1
    for member in body.split(','):
        member = member.strip()
        if not member:
            continue
        parts = member.split('=', 1)
        key = parts[0].strip()
        if len(parts) == 2:
            expression = parts[1].strip()
            previous = values[expression] if expression in values else int(expression, 0)
        else:
            previous += 1
        values[key] = previous
    return values


def table(name, family=None):
    body = re.search(r'\b' + name + r'\[\]\s*=\s*\{(.*?)\n\};', source, re.S).group(1)
    result = []
    pattern = r'\{\s*std::u16string_view\(u"([^"\n]*)"\s*(OOO_STRING_SVTOOLS_(?:HTML|XHTML)_\w+)?\),\s*([^},]+)\s*\}'
    for literal, macro, value in re.findall(pattern, body):
        key = literal + (macros[macro] if macro else '')
        value = value.strip()
        result.append([key, enum_values(family)[value.split('::')[1]] if family else int(re.sub(r'[UL]+$', '', value), 0)])
    if len(result) != body.count('std::u16string_view('):
        raise ValueError('Unparsed native entries in ' + name)
    return result


(TARGET / 'inc').mkdir(parents=True, exist_ok=True)
(TARGET / 'source/svhtml').mkdir(parents=True, exist_ok=True)
text = '/** @fileoverview Generated native HTML token and option identities from pinned include/svtools/htmltokn.h. */\n'
for name in ['HtmlTokenId', 'HtmlOptionId']:
    text += '/** Original native enum values. */\nexport enum ' + name + ' {\n'
    seen = set()
    for key, value in enum_values(name).items():
        text += '  /** Native ' + key + ' identity. */\n'
        if value in seen:
            text += '  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.\n'
        seen.add(value)
        text += '  ' + key + ' = ' + str(value) + ',\n'
    text += '}\n'
(TARGET / 'inc/htmltokn.ts').write_text(text)
data = {'tokens': table('aHTMLTokenTab', 'HtmlTokenId'), 'entities': table('aHTMLCharNameTab'), 'options': table('aHTMLOptionTab', 'HtmlOptionId'), 'colors': table('aHTMLColorNameTab')}
parser_source = (REFERENCE / "svtools/source/svhtml/parhtml.cxx").read_text()
pre_cases = parser_source.split('// Keep those', 1)[1].split('// The remainder is treated', 1)[0]
data['preKeptTokens'] = [enum_values('HtmlTokenId')[name] for name in re.findall(r'case HtmlTokenId::(\w+):', pre_cases)]
(TARGET / 'source/svhtml/htmlkywd-data.json').write_text(json.dumps(data, indent=2) + '\n')
print({name: len(value) for name, value in data.items()})
