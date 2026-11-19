#!/usr/bin/env python3
"""Extract literal expectations from pinned OStringBuffer basic CppUnit families."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'vendor/libreoffice-reference/sal/qa/OStringBuffer/rtl_OStringBuffer.cxx'
HEADER = SOURCE.with_name('rtl_String_Const.h')
OUTPUT = ROOT / 'apps/office/src/sal/rtl/upstream-ostringbuffer-basic-cases.json'


def number(expression, constants):
    """Evaluate only source integer literals/constants and addition/subtraction."""
    def visit(node):
        if isinstance(node, ast.Constant) and type(node.value) is int:
            return node.value
        if isinstance(node, ast.Name):
            return constants[node.id]
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
            return -visit(node.operand)
        if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Sub)):
            left, right = visit(node.left), visit(node.right)
            return left + right if isinstance(node.op, ast.Add) else left - right
        raise ValueError('Unsupported source integer expression: ' + expression)
    return visit(ast.parse(expression.strip(), mode='eval').body)


def generate():
    """Read source assertions, never the TypeScript implementation or test results."""
    raw, header = SOURCE.read_text(), HEADER.read_text()
    source = re.sub(r'/\*.*?\*/|//[^\n]*', '', raw, flags=re.S)
    constants = {name: int(value) for name, value in re.findall(
        r'const sal_Int32 (kTestStr\d+Len)\s*=\s*(\d+)\s*;', header)}
    strings = {}
    for name in ['kTestStr1', 'kTestStr2', 'kTestStr7']:
        literal = re.search(r'const char \* const ' + name + r'\s*=\s*("[^"\n]*")', header)
        if not literal:
            raise ValueError('Missing source fixture ' + name)
        strings[name] = list(ast.literal_eval(literal[1]).encode('ascii'))
    values = [strings['kTestStr1'], [49], [], [], [0], strings['kTestStr2'], strings['kTestStr7']]
    string_indices = {'kTestStr1': 0, 'kTestStr2': 5, 'kTestStr7': 6}
    pattern = r'void ((?:getLength|getCapacity|ensureCapacity|setLength)_\d+)\(\)\s*\{(.*?)\n        \}'
    cases = []
    for name, body in re.findall(pattern, source, re.S):
        constructor = re.search(r'OStringBuffer\s+aStrBuf(?:\(\s*(.*?)\s*\))?\s*;', body)
        if not constructor:
            raise ValueError('Missing source constructor ' + name)
        initial = constructor[1]
        if initial is None:
            kind, value = 'default', 0
        elif re.fullmatch(r'arrOUS\[\d\]', initial):
            kind, value = 'value', int(initial[-2])
        else:
            kind, value = 'capacity', number(initial, constants)
        variables = {key: number(expression, constants) for key, expression in re.findall(
            r'\bsal_Int32\s+(expVal\w*|input)\s*=\s*([^;]+);', body)}
        operation = re.search(r'aStrBuf\.(ensureCapacity|setLength)\(\s*input\s*\)', body)
        family = name.split('_')[0]
        length = variables.get('expVal') if family == 'getLength' else variables.get('expVal1')
        capacity = variables.get('expVal') if family in ['getCapacity', 'ensureCapacity'] else variables.get('expVal3')
        expected_string = None
        match = re.search(r'OString\s+expVal2\s*\(\s*([^)]*)\s*\)', body)
        if match:
            expression = match[1].strip()
            expected_string = int(expression[-2]) if expression.startswith('arrOUS[') else string_indices[expression]
            if not re.search(r'expVal2\s*,\s*OString\(aStrBuf.getStr\(\)\)', body):
                raise ValueError('Changed source string assertion ' + name)
        first = 0 if re.search(r"'\\0'\s*,\s*aStrBuf.getStr\(\)\[0\]", body) else None
        assertions = len(re.findall(r'CPPUNIT_ASSERT(?:_EQUAL)?_MESSAGE\s*\(', body))
        expected_assertions = sum(item is not None for item in [length, capacity, expected_string, first])
        if assertions != expected_assertions:
            raise ValueError('Unmapped assertion in ' + name)
        cases.append({'name': name, 'constructor': kind, 'initial': value,
                      'operation': operation[1] if operation else 'none',
                      'input': variables.get('input', 0), 'length': length,
                      'capacity': capacity, 'cString': expected_string, 'firstByte': first,
                      'assertions': assertions,
                      'bodySha256': hashlib.sha256(body.encode()).hexdigest()})
    expected_names = []
    for family, ids in [('getLength', range(1, 9)), ('getCapacity', [*range(1, 8), 10, 11, 12]),
                        ('ensureCapacity', range(1, 13)), ('setLength', range(1, 23))]:
        expected_names.extend(f'{family}_{index:03}' for index in ids)
    if [case['name'] for case in cases] != expected_names:
        raise ValueError('Source basic QA family set/order changed')
    for name in expected_names:
        if not re.search(r'CPPUNIT_TEST\(\s*' + name + r'\s*\)', source):
            raise ValueError('Case is not registered: ' + name)
    return {'source': str(SOURCE.relative_to(ROOT)),
            'sourceSha256': hashlib.sha256(raw.encode()).hexdigest(),
            'headerSha256': hashlib.sha256(header.encode()).hexdigest(),
            'qualification': 'Literal source expectations; not native runtime output. No implementation or coverage data is read.',
            'values': values, 'cases': cases}


def generate_append():
    """Extract every registered counted-pointer append case and its literal expected bytes."""
    raw, header = SOURCE.read_text(), HEADER.read_text()
    source = re.sub(r'/\*.*?\*/|//[^\n]*', '', raw, flags=re.S)
    names = ['kTestStr1', 'kTestStr2', 'kTestStr7', 'kTestStr17', 'kTestStr23',
             'kTestStr28', 'kTestStr29', 'kTestStr31', 'kTestStr36', 'kTestStr37',
             'kTestStr38', 'kTestStr39', 'kTestStr40']
    strings = {}
    for name in names:
        literal = re.search(r'const char \* const ' + name + r'\s*=\s*("[^"\n]*")', header)
        if not literal or not literal[1].isascii():
            raise ValueError('Unsupported source literal ' + name)
        strings[name] = list(ast.literal_eval(literal[1]).encode('latin1'))
    cases = []
    for name, body in re.findall(r'void (append_003_\d+)\(\)\s*\{(.*?)\n        \}', source, re.S):
        initial = int(re.search(r'OStringBuffer\s+aStrBuf\(\s*arrOUS\[(\d)\]\s*\)', body)[1])
        input_name = re.search(r'input1\s*=\s*(kTestStr\d+)\s*;', body)[1]
        count = int(re.search(r'input2\s*=\s*(\d+)\s*;', body)[1])
        expected = re.search(r'OString\s+expVal\(\s*(kTestStr\d+)\s*\)', body)
        if expected is None and not re.search(r'OString\s+expVal\s*;', body):
            raise ValueError('Unsupported source expected string ' + name)
        if not re.search(r'aStrBuf.append\(\s*input1\s*,\s*input2\s*\)', body):
            raise ValueError('Changed source operation ' + name)
        if len(re.findall(r'CPPUNIT_ASSERT_EQUAL_MESSAGE\s*\(', body)) != 2:
            raise ValueError('Changed source assertions ' + name)
        if not re.search(r'expVal\s*,\s*OString\(aStrBuf.getStr\(\)\)', body):
            raise ValueError('Changed source byte assertion ' + name)
        if not re.search(r'expVal.getLength\(\)\s*,\s*aStrBuf.getLength\(\)', body):
            raise ValueError('Changed source length assertion ' + name)
        cases.append({'name': name, 'initial': initial, 'input': input_name, 'count': count,
                      'expected': expected[1] if expected else None,
                      'bodySha256': hashlib.sha256(body.encode()).hexdigest()})
    expected_names = [f'append_003_{n:03}' for n in range(1, 25) if n % 5 != 0]
    if [case['name'] for case in cases] != expected_names:
        raise ValueError('Counted append source case set/order changed')
    for name in expected_names:
        if not re.search(r'CPPUNIT_TEST\(\s*' + name + r'\s*\)', source):
            raise ValueError('Unregistered source append case ' + name)
    return {'source': str(SOURCE.relative_to(ROOT)),
            'sourceSha256': hashlib.sha256(raw.encode()).hexdigest(),
            'headerSha256': hashlib.sha256(header.encode()).hexdigest(),
            'qualification': 'Literal source expectations; no implementation or runtime output is read.',
            'values': strings, 'initialValues': ['kTestStr7', None, None, None, 'kTestStr28'],
            'cases': cases}


def main():
    """Write or verify the exact pinned source fixture."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs = [(OUTPUT, generate()),
               (OUTPUT.with_name('upstream-ostringbuffer-counted-append-cases.json'), generate_append())]
    for path, result in outputs:
        if args.check:
            if json.loads(path.read_text()) != result:
                raise SystemExit('OStringBuffer upstream fixture is stale: ' + str(path))
        else:
            path.write_text(json.dumps(result, indent=2) + '\n')
        count = sum(case.get('assertions', 2) for case in result['cases'])
        print(f'Checked {len(result["cases"])} source cases and {count} original assertions: {path.name}')



if __name__ == '__main__':
    main()
