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
BLOCK_SCANS = [
    ("hr", "* * *", 0), ("hr", "- - x", 0), ("atx", "### title", 0),
    ("atx", "####### title", 0), ("atx", "#title", 0), ("atx", "#title", 2),
    ("setext", "=\t", 0), ("setext", "--- x", 0),
    ("table", "|:-|-:|", 0), ("table", "---", 0),
    ("table", "|" + "-|" * 128, 0), ("table", "|" + "-|" * 129, 0),
    ("fence", "``` lang`bad", 0), ("fence", "~~~~ lang`ok", 0),
    ("closing", "`` x", 3), ("closing", "`````  \t", 3), ("closing", "```x", 3),
    ("html_start", "<prefix>", 0), ("html_start", "<![CDATA[x]]>", 0),
    ("html_start", "<!lowercase>", 0), ("html_start", "<basefont>", 0),
    ("html_start", "<div/>", 0), ("html_start", "<my-tag>", 0),
    ("html_end", "x-->", 2), ("html_end", "x-->\n", 2),
    ("html_end", "</PRE>", 1), ("html_end", "text", 6), ("html_end", "\n", 6),
    ("container", "123456789. item", 0), ("container", "1234567890. item", 0),
    ("container", "* item", 3), ("container", "* item", 4),
    ("container", ">item", 0), ("indent", "\t \tfoo", 1),
]
extra.append('printf(",\\\"blockScans\\\":[");')
for index, (operation, text, argument) in enumerate(BLOCK_SCANS):
    raw = text.encode("utf-8")
    values = ",".join(str(byte) for byte in raw) or "0"
    extra.append("{ const char text[]={%s}; MD_CTX ctx={0}; ctx.text=text; ctx.size=%d; ctx.parser.flags=%d; ctx.code_indent_offset=4; ctx.code_fence_length=3; ctx.html_block_type=%d; MD_CONTAINER c={0}; OFF end=0,beg=0,killer=0; unsigned level=0,cols=0,indent=0; int ok=0;" % (values,len(raw),argument,argument))
    calls = {
        "hr":"ok=md_is_hr_line(&ctx,0,&end,&killer);",
        "atx":"ok=md_is_atxheader_line(&ctx,0,&beg,&end,&level);",
        "setext":"ok=md_is_setext_underline(&ctx,0,&end,&level);",
        "table":"ok=md_is_table_underline(&ctx,0,&end,&cols);",
        "fence":"ok=md_is_opening_code_fence(&ctx,0,&end);",
        "closing":"ok=md_is_closing_code_fence(&ctx,text[0],0,&end);",
        "html_start":"ok=md_is_html_block_start_condition(&ctx,0);",
        "html_end":"ok=md_is_html_block_end_condition(&ctx,0,&end);",
        "container":"ok=md_is_container_mark(&ctx,%d,0,&end,&c);" % argument,
        "indent":"indent=md_line_indentation(&ctx,%d,0,&end); ok=1;" % argument,
    }
    extra.append(calls[operation])
    extra.append('printf("%s[%%d,%%u,%%u,%%u,%%u,%%u,%%u,%%u,%%u,%%u,%%u,%%u]",ok,end,beg,level,killer,cols,ctx.code_fence_length,(unsigned char)c.ch,c.start,c.mark_indent,c.contents_indent,indent);}' % ("," if index else ""))
extra.append('printf("]");')
REF_CASES = [
    ("[x]: /one\n[x]", 100),
    ("[x]: /one\n[X]: /two\n[x]", 100),
    ("[Straße]: <a b> \"title\"\n[STRASSE]", 100),
    ("[a\n b]: /target\n[a b]", 100),
    ("[x]: /one \"title\" trailing\n[x]", 100),
    ("[x]: /one\n  \"title\" trailing\n[x]", 100),
    ("[x]: /t\n[x]", 3), ("[x]: /t\n[x]", 4),
    ("[x]: /one\n[x]", 100),
    ("".join("[key%d]: /target%d\n" % (i,i) for i in range(12)) + "[KEY0]: /later\n[key0]", 1000),
]
extra.append('printf(",\\\"referenceCases\\\":[");')
for index,(text,budget) in enumerate(REF_CASES):
    raw=text.encode("utf-8"); values=",".join(str(byte) for byte in raw)
    starts=[0]+[i+1 for i,byte in enumerate(raw) if byte==10]
    ends=[i for i,byte in enumerate(raw) if byte==10]+[len(raw)]
    lines=",".join("{%d,%d}" % pair for pair in zip(starts,ends))
    extra.append("{ const char text[]={%s}; MD_LINE lines[]={%s}; MD_CTX ctx={0}; ctx.text=text; ctx.size=%d; ctx.max_ref_def_output=%d; unsigned consumed=0; int n; while(consumed<%d && (n=md_is_link_reference_definition(&ctx,lines+consumed,%d-consumed))>0) consumed+=n; md_build_ref_def_hashtable(&ctx);" % (values,lines,len(raw),budget,len(starts),len(starts)))
    extra.append('printf("%s[%%u,%%d,[",consumed,ctx.n_ref_defs);' % ("," if index else ""))
    extra.append('for(int i=0;i<ctx.n_ref_defs;i++){ MD_REF_DEF* d=&ctx.ref_defs[i]; printf("%s[%u,%u,[",i?",":"",d->dest_beg,d->dest_end); for(unsigned j=0;j<d->label_size;j++) printf("%s%u",j?",":"",(unsigned char)d->label[j]); printf("],["); for(unsigned j=0;j<d->title_size;j++) printf("%s%u",j?",":"",(unsigned char)d->title[j]); printf("]]"); } printf("],[");')
    extra.append('const char* queries[]={"x","X","strasse","a b","key0","KEY0","key9","missing"}; for(unsigned i=0;i<8;i++){ const MD_REF_DEF* d=md_lookup_ref_def(&ctx,queries[i],strlen(queries[i])); printf("%s%d",i?",":"",d?(int)d->dest_beg:-1); } printf("],[");')
    extra.append("MD_LINK_ATTR attr={0}; for(int i=0;i<2;i++){int ok=md_is_link_reference(&ctx,lines,%d,%d,%d,&attr); printf(\"%%s[%%d,%%u]\",i?\",\":\"\",ok,ctx.max_ref_def_output);} printf(\"]]\"); md_free_ref_def_hashtable(&ctx); md_free_ref_defs(&ctx);}" % (len(starts),starts[-1],ends[-1]))
extra.append('printf("]");')
source = SOURCE.read_text().replace('puts("]}"); return 0;', 'printf("]");\n' + "\n".join(extra) + '\nputs("}"); return 0;')
SOURCE.write_text(source)
subprocess.run(["clang", "-std=c99", "-O2", str(SOURCE), "-o", str(BUILD / "primitive-reference")], check=True, cwd=ROOT)
result = subprocess.check_output([str(BUILD / "primitive-reference")], cwd=ROOT)
data = json.loads(result)
data["blockScans"] = [dict(operation=case[0], text=case[1], argument=case[2], result=value) for case, value in zip(BLOCK_SCANS, data["blockScans"])]
data["referenceCases"] = [dict(text=case[0], budget=case[1], result=value) for case,value in zip(REF_CASES,data["referenceCases"])]
data["sourceSha256"] = hashlib.sha256(NATIVE_SOURCE.read_bytes()).hexdigest()
for case, value in zip(SCANS, data["scans"]):
    operation, text = case
    value[:] = value[:1] if value[0] == 0 else value
# Keep source inputs with the native result, without copying the native parser implementation.
data["scans"] = [dict(operation=case[0], text=case[1], result=value) for case, value in zip(SCANS,data["scans"])]
output = ROOT / "apps/office/src/external/md4c/src/native-primitives.json"
output.write_text(json.dumps(data, indent=2) + "\n")
print(f"Generated {output.relative_to(ROOT)}: Unicode digest {data['unicodeDigest']}, {len(data['utf8'])} UTF-8 and {len(data['scans'])} scanner cases")
