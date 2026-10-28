"""Extract the pinned conservative/aggressive StarSymbol export tables without changing their order."""
import ast
import json
import re
import sys
from pathlib import Path

source = Path('vendor/libreoffice-reference/unotools/source/misc/fontcvt.cxx').read_text()
text = re.sub(r'/\*.*?\*/|//[^\n]*', '', source, flags=re.S)

def body(name):
    match = re.search(r'\b' + name + r'\[\s*(?:224)?\s*\]\s*=\s*\{(.*?)\n\};', text, re.S)
    if not match:
        raise ValueError(name)
    return match.group(1)

def value(token):
    token = token.strip()
    return ord(ast.literal_eval(token)) if token.startswith("'") else int(token, 0)

symbols = dict((name, int(number)) for name, number in re.findall(r'(\w+)\s*=\s*(\d+)', re.search(r'enum SymbolFont\s*\{(.*?)\}', text, re.S).group(1)))
names = re.findall(r'u"([^"]*)"_ustr', body('aSymbolNames'))
conservative = []
for font, table in [('Symbol','aAdobeSymbolTab'),('Wingdings','aWingDingsTab'),('MonotypeSorts','aMonotypeSortsTab'),('Webdings','aWebDingsTab'),('Wingdings2','aWingDings2Tab'),('Wingdings3','aWingDings3Tab'),('MTExtra','aMTExtraTab')]:
    values = [value(token) for token in body(table).split(',') if token.strip()]
    assert len(values) == 224, (table,len(values))
    conservative.append({'font': symbols[font], 'table': table, 'values': values})
aggressive = []
for font, table in [('Symbol','aSymbolExtraTab2'),('Symbol','aSymbolExtraTab'),('Wingdings','aWingDingsExtraTab'),('TimesNewRoman','aTNRExtraTab')]:
    values = [[value(a), value(b)] for a,b in re.findall(r'\{\s*([^,{}]+),\s*([^{}]+)\}', body(table))]
    assert values
    aggressive.append({'font': symbols[font], 'table': table, 'values': values})
result={'symbols':symbols,'names':names,'conservative':conservative,'aggressive':aggressive}
path=Path('apps/office/src/unotools/source/misc/fontcvt-export-data.json')
if '--check' in sys.argv:
    assert json.loads(path.read_text()) == result
else:
    path.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'conservative':len(conservative),'aggressive':len(aggressive),'names':len(names)}))
