#!/usr/bin/env python3
"""Extract the pinned Writer shipped bullet configuration and native constructor defaults."""
import json
import pathlib
import re
import xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = ROOT / 'vendor/libreoffice-reference'
OOR = '{http://openoffice.org/2001/registry}'
root = ET.parse(REF / 'officecfg/registry/schema/org/openoffice/Office/Writer.xcs').getroot()
group = next(node for node in root.iter('group') if node.get(OOR + 'name') == 'DefaultBulletList')
font = next(node for node in group.findall('group') if node.get(OOR + 'name') == 'BulletFont')
names = ['BulletFont/FontFamilyname', 'BulletFont/FontWeight', 'BulletFont/FontItalic'] + ['BulletCharLvl' + str(i) for i in range(1, 11)]
values = []
for name in names:
    parent = font if '/' in name else group
    prop = next(node for node in parent.findall('prop') if node.get(OOR + 'name') == name.split('/')[-1])
    value = prop.find('value')
    values.append(None if value is None else (value.text if prop.get(OOR + 'type') == 'xs:string' else int(value.text)))
source = (REF / 'sw/source/core/doc/number.cxx').read_text()
body = source.split('void SwDefBulletConfig::SetToDefault()', 1)[1].split('uno::Sequence<OUString>', 1)[0]
chars = [int(value, 16) for _, value in re.findall(r'mnLevelChars\[(\d+)\]\s*=\s*0x([0-9a-fA-F]+)', body)]
family = re.search(r'msFontname\s*=\s*"([^"]+)"', body).group(1)
height = int(re.search(r'mpFont.emplace\(.*?Size\(\s*0,\s*(\d+)\s*\)', source).group(1))
output = ROOT / 'apps/office/src/sw/source/core/doc/number-bullet-data.json'
output.write_text(json.dumps({'properties': names, 'values': values, 'family': family, 'height': height, 'characters': chars}, indent=2) + '\n')
print('Generated', output.relative_to(ROOT), 'from native defaults and', len(values), 'shipped properties')
