"""Extract exact pinned Writer default Which/slot/flag metadata without generated build headers."""
import ast
import json
import re
import sys
from pathlib import Path
root = Path('vendor/libreoffice-reference')
paths = ['include/svl/solar.hrc', 'include/sfx2/sfxsids.hrc', 'include/svx/svxids.hrc', 'include/editeng/editids.hrc', 'sw/inc/cmdid.h', 'include/svl/itempool.hxx']
expressions = {}
for path in paths:
    text = (root/path).read_text()
    for line in text.splitlines():
        line = re.split(r'//|/\*', line)[0]
        match = re.match(r'^#define\s+([A-Z][A-Z0-9_]+)\s+(.+)', line)
        if match:
            expression = match[2].strip()
            expression = re.sub(r'^TypedWhichId<[^>]+>\s*\((.*)\)$', r'\1', expression)
            expressions[match[1]] = expression.strip()
hintids = (root/'sw/inc/hintids.hxx').read_text()
for match in re.finditer(r'^inline constexpr [^;]*?\b([A-Z][A-Z0-9_]+)\s*(?:=\s*([^;]+)|\(([^;]+)\));', hintids, re.M):
    expressions[match[1]] = ' '.join((match[2] or match[3]).split())
cache = {}
def resolve(name, resolving=()):
    if name in cache:
        return cache[name]
    assert name not in resolving, name
    expression = expressions[name]
    tree = ast.parse(expression, mode='eval')
    def evaluate(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, int): return node.value
        if isinstance(node, ast.Name): return resolve(node.id, (*resolving, name))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub): return -evaluate(node.operand)
        if isinstance(node, ast.BinOp):
            a,b=evaluate(node.left),evaluate(node.right)
            if isinstance(node.op, ast.Add):return a+b
            if isinstance(node.op, ast.Sub):return a-b
            if isinstance(node.op, ast.BitOr):return a|b
        raise ValueError((name, expression))
    cache[name] = evaluate(tree.body)
    return cache[name]
source = (root/'sw/source/core/bastyp/init.cxx').read_text()
a = source.index('ItemInfoArrayWriter maItemInfos {{')
b = source.index('        }};', a)
rows = []
for match in re.finditer(r'\{\s*(RES_[A-Z0-9_]+)\s*,(.*?)\}\s*(?:,|$)', source[a:b], re.S):
    name = match[1]
    tail = match[2]
    # Slot and flags are the final scalar fields; constructors may contain commas.
    item, slot, flags = tail.rsplit(',', 2)
    rows.append({'name':name,'which':resolve(name),'slot':resolve(slot.strip()) if slot.strip()!='0' else 0,'flags':resolve(flags.strip()),'itemExpression':' '.join(item.split())})
first,last=resolve('POOLATTR_BEGIN'),resolve('POOLATTR_END')
assert len(rows)==last-first, (len(rows),first,last)
assert [row['which'] for row in rows]==list(range(first,last))
path=Path('apps/office/src/sw/source/core/bastyp/default-metadata.json')
if '--check' in sys.argv: assert json.loads(path.read_text())==rows
else: path.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('Pinned Writer default metadata:',len(rows),'entries; range',first,last-1)
