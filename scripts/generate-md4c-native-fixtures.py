"""Compile the pinned md4c 0.5.3 source with the host C compiler and capture primitive behavior.

No network or SDK is required. The native translation unit includes md4c.c so
static helpers can be compared directly. Generated files are ordinary portable
fixtures; browser source never loads or executes the host binary.
"""
from pathlib import Path
import json
import hashlib
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "test-results/md4c"
BUILD.mkdir(parents=True, exist_ok=True)
SOURCE = BUILD / "primitive-reference.c"
ARCHIVE = ROOT / "vendor/md4c-reference/md4c-release-0.5.3.tar.gz"
EXPECTED_ARCHIVE_SHA256 = "353c346f376b87c954a13f3415ede2d51264cc61dc5abcd38ff1d2aa0d059b9e"
if hashlib.sha256(ARCHIVE.read_bytes()).hexdigest() != EXPECTED_ARCHIVE_SHA256:
    raise RuntimeError("md4c archive differs from the LibreOffice download.lst pin")
NATIVE_SOURCE = ROOT / "vendor/md4c-reference/src/md4c.c"
native_text = NATIVE_SOURCE.read_text()
tables = {}
for name in ["WHITESPACE_MAP", "PUNCT_MAP", "FOLD_MAP_1", "FOLD_MAP_1_DATA", "FOLD_MAP_2", "FOLD_MAP_2_DATA", "FOLD_MAP_3", "FOLD_MAP_3_DATA"]:
    body = re.search(r"\b" + name + r"\[\]\s*=\s*\{(.*?)\};", native_text, re.S)[1]
    values = []
    if "_DATA" in name:
        values = [int(value, 16) for value in re.findall(r"0x[0-9a-fA-F]+", body)]
    else:
        for match in re.finditer(r"([RS])\((0x[0-9a-fA-F]+)(?:,\s*(0x[0-9a-fA-F]+))?\)", body):
            start = int(match[2], 16)
            values.extend([start | 0x40000000, int(match[3], 16) | 0x80000000] if match[1] == "R" else [start])
    tables[name] = values
(ROOT / "apps/office/src/external/md4c/src/md4c-unicode-data.json").write_text(json.dumps(tables, indent=2) + "\n")
SOURCE.write_text(r'''
#include "../../vendor/md4c-reference/src/md4c.c"
static unsigned digest = 2166136261U;
static void hash(unsigned value) {
    unsigned char bytes[4] = { value & 255, (value >> 8) & 255, (value >> 16) & 255, (value >> 24) & 255 };
    digest = md_fnv1a(digest, bytes, 4);
}
int main(void) {
    MD_UNICODE_FOLD_INFO info;
    for (unsigned cp = 0; cp <= 0x10ffff; cp++) {
        hash(md_is_unicode_whitespace__(cp)); hash(md_is_unicode_punct__(cp));
        md_get_unicode_fold_info(cp, &info); hash(info.n_codepoints);
        for (unsigned i = 0; i < info.n_codepoints; i++) hash(info.codepoints[i]);
    }
    printf("{\"unicodeDigest\":%u,\"utf8\":[", digest);
    int comma = 0;
    const unsigned char sequences[][4] = {
        {0}, {0x7f}, {0x80}, {0xff}, {0xc0,0x80}, {0xc2,0xa0}, {0xe0,0x80,0x80},
        {0xed,0xa0,0x80}, {0xf4,0x90,0x80,0x80}, {0xf7,0xbf,0xbf,0xbf},
        {0xf0,0x9f,0x92,0xa9}, {0xe2,0x82}, {0xe2,0x41,0xac}, {0xf0,0x9f,0x41,0x80}
    };
    const unsigned sizes[] = {1,1,1,1,2,2,3,3,4,4,4,2,3,4};
    for (unsigned i=0; i<sizeof(sizes)/sizeof(sizes[0]); i++) {
        SZ size = 0;
        unsigned cp = md_decode_utf8__((const char*)sequences[i], sizes[i], &size);
        MD_CTX ctx = {0}; ctx.text = (const char*)sequences[i]; ctx.size = sizes[i];
        if (comma++) printf(",");
        printf("{\"bytes\":[");
        for (unsigned j=0; j<sizes[i]; j++) printf("%s%u",j?",":"",sequences[i][j]);
        printf("],\"cp\":%u,\"width\":%u,\"before\":%u}",cp,size,md_decode_utf8_before__(&ctx,sizes[i]));
    }
    puts("]}"); return 0;
}
''')
SCANS = [
    ("tag", "<a x='>' data-foo=bar>"), ("tag", "</a x>"), ("tag", "</a/>"),
    ("tag", "<a:x>"), ("tag", "<a x=>"), ("tag", "<a x=one\n y='two'>"),
    ("html", "<!-->"), ("html", "<!--->"), ("html", "<!-- no closer"),
    ("html", "<?pi\nbody?>"), ("html", "<!DOCTYPE x>"),
    ("html", "<![CDATA[x\ny]]>"), ("html", "<a x='a\nb'>"),
    ("label", "[  Straße\n label  ]"), ("label", "[ ]"), ("label", r"[a\]b]"),
    ("label", "[a[b]]"), ("label", "[" + "é" * 999 + "]"),
    ("label", "[" + "é" * 1000 + "]"),
    ("destination", "<a b>"), ("destination", "<a\nb>"),
    ("destination", r"<a\>b>"), ("destination", "a(b(c)) x"),
    ("destination", "(" * 32 + "a" + ")" * 32),
    ("destination", "(" * 33 + "a" + ")" * 33),
    ("title", " \"title\nnext\""), ("title", " 'x' tail"),
    ("title", "(no leading space)"), ("title", " (a(b)c)"),
]
# Insert native calls into the same translation unit; all offset values are native byte offsets.
extra = ['printf(",\\\"scans\\\":[");']
for index, (operation, text) in enumerate(SCANS):
    raw = text.encode("utf-8")
    starts = [0] + [i + 1 for i, byte in enumerate(raw) if byte == 10]
    ends = [i for i, byte in enumerate(raw) if byte == 10] + [len(raw)]
    values = ",".join(str(byte) for byte in raw) or "0"
    lines = ",".join("{%d,%d}" % pair for pair in zip(starts, ends))
    extra.append("{ const char text[]={%s}; MD_LINE lines[]={%s}; MD_CTX ctx={0}; ctx.text=text; ctx.size=%d; OFF end=0,cb=0,ce=0; MD_SIZE bl=0,el=0; int ok=0;" % (values,lines,len(raw)))
    if operation in ("tag", "html"):
        function = "md_is_html_tag" if operation == "tag" else "md_is_html_any"
        extra.append("ok=%s(&ctx,lines,%d,0,%d,&end);" % (function,len(starts),len(raw)))
    elif operation == "label":
        extra.append("ok=md_is_link_label(&ctx,lines,%d,0,&end,&bl,&el,&cb,&ce);" % len(starts))
    elif operation == "destination":
        extra.append("ok=md_is_link_destination(&ctx,0,%d,&end,&cb,&ce);" % len(raw))
    else:
        extra.append("ok=md_is_link_title(&ctx,lines,%d,0,&end,&bl,&el,&cb,&ce);" % len(starts))
    extra.append('printf("%s[%%d,%%u,%%u,%%u,%%u,%%u]",ok,end,cb,ce,bl,el);}' % ("," if index else ""))
extra.append('printf("]");')
source = SOURCE.read_text().replace('puts("]}"); return 0;', 'printf("]");\n' + "\n".join(extra) + '\nputs("}"); return 0;')
SOURCE.write_text(source)
subprocess.run(["clang", "-std=c99", "-O2", str(SOURCE), "-o", str(BUILD / "primitive-reference")], check=True, cwd=ROOT)
result = subprocess.check_output([str(BUILD / "primitive-reference")], cwd=ROOT)
data = json.loads(result)
data["sourceSha256"] = hashlib.sha256(NATIVE_SOURCE.read_bytes()).hexdigest()
for case, value in zip(SCANS, data["scans"]):
    operation, text = case
    value[:] = value[:1] if value[0] == 0 else value
# Keep source inputs with the native result, without copying the native parser implementation.
data["scans"] = [dict(operation=case[0], text=case[1], result=value) for case, value in zip(SCANS,data["scans"])]
output = ROOT / "apps/office/src/external/md4c/src/native-primitives.json"
output.write_text(json.dumps(data, indent=2) + "\n")
print(f"Generated {output.relative_to(ROOT)}: Unicode digest {data['unicodeDigest']}, {len(data['utf8'])} UTF-8 and {len(data['scans'])} scanner cases")
