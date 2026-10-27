"""Capture the pinned md4c block-analysis phase for its bundled specification corpus.

The unchanged source performs all parsing. Only the final internal block queue
and reference definitions are serialized. Unused/uninitialized native data
fields are normalized rather than inventing a portable value for them.
"""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/"test-results/md4c"
BUILD.mkdir(parents=True,exist_ok=True)
archive=ROOT/"vendor/md4c-reference/md4c-release-0.5.3.tar.gz"
assert hashlib.sha256(archive.read_bytes()).hexdigest()=="353c346f376b87c954a13f3415ede2d51264cc61dc5abcd38ff1d2aa0d059b9e"
source=BUILD/"block-reference.c"
source.write_text(r'''
#include "../../vendor/md4c-reference/src/md4c.c"
static void bytes(const char* data,unsigned n) { printf("["); for(unsigned i=0;i<n;i++)printf("%s%u",i?",":"",(unsigned char)data[i]);printf("]"); }
int main(void) {
 unsigned flags,size;
 while(fread(&flags,4,1,stdin)==1 && fread(&size,4,1,stdin)==1) {
  char* text=malloc(size+1); if(fread(text,1,size,stdin)!=size)return 2; text[size]=0;
  MD_CTX ctx={0}; ctx.text=text;ctx.size=size;ctx.parser.flags=flags;
  ctx.code_indent_offset=(flags&MD_FLAG_NOINDENTEDCODEBLOCKS)?(OFF)-1:4;
  ctx.max_ref_def_output=16*MIN(size,(MD_SIZE)(1024*1024/16));
  const MD_LINE_ANALYSIS* pivot=&md_dummy_blank_line;
  MD_LINE_ANALYSIS buffers[2]={{0},{0}},*line=&buffers[0];OFF off=0;
  while(off<size) {
   if(line==pivot)line=(line==&buffers[0]?&buffers[1]:&buffers[0]);
   if(md_analyze_line(&ctx,off,&off,pivot,line)!=0)return 3;
   if(md_process_line(&ctx,&pivot,line)!=0)return 4;
  }
  md_end_current_block(&ctx);md_build_ref_def_hashtable(&ctx);md_leave_child_containers(&ctx,0);
  printf("{\"blocks\":["); int comma=0;unsigned cursor=0;
  while(cursor<(unsigned)ctx.n_block_bytes) {
   MD_BLOCK* b=(MD_BLOCK*)((char*)ctx.block_bytes+cursor);cursor+=sizeof(MD_BLOCK);
   unsigned data=(b->type==MD_BLOCK_P || b->type==MD_BLOCK_HTML || b->type==MD_BLOCK_HR)?0:b->data;
   printf("%s[%u,%u,%u,%u,[",comma++?",":"",b->type,b->flags,data,b->n_lines);
   if(!(b->flags&MD_BLOCK_CONTAINER))for(unsigned i=0;i<b->n_lines;i++) {
    if(b->type==MD_BLOCK_CODE || b->type==MD_BLOCK_HTML) {
     MD_VERBATIMLINE* l=(MD_VERBATIMLINE*)((char*)ctx.block_bytes+cursor);cursor+=sizeof(MD_VERBATIMLINE);
     printf("%s[%u,%u,%u]",i?",":"",l->beg,l->end,l->indent);
    } else {
     MD_LINE* l=(MD_LINE*)((char*)ctx.block_bytes+cursor);cursor+=sizeof(MD_LINE);
     printf("%s[%u,%u,0]",i?",":"",l->beg,l->end);
    }
   }
   printf("]]");
  }
  printf("],\"definitions\":[");
  for(int i=0;i<ctx.n_ref_defs;i++) {
   MD_REF_DEF* d=&ctx.ref_defs[i]; printf("%s[%u,%u,",i?",":"",d->dest_beg,d->dest_end);
   bytes(d->label,d->label_size);printf(",");bytes(d->title,d->title_size);printf("]");
  }
  printf("]}\n");
  md_free_ref_def_hashtable(&ctx);md_free_ref_defs(&ctx);free(ctx.block_bytes);free(ctx.containers);free(text);
 }
 return 0;
}
''')
subprocess.run(["clang","-std=c99","-O2",str(source),"-o",str(BUILD/"block-reference")],check=True,cwd=ROOT)
cases=[]
# The dependency corpus retains CommonMark's visible-tab U+2192 convention.
for path in sorted((ROOT/"vendor/md4c-reference/test").glob("spec*.txt")):
    content=path.read_text()
    pattern=r"^(`{4,}) example[^\n]*\n(.*?)^\.\n.*?^\1\s*$"
    for index,match in enumerate(re.finditer(pattern,content,re.M|re.S),1):
        cases.append(dict(id=f"{path.name}:{index}",text=match[2].replace("→","\t"),flags=0x2f0c))
# Include standalone EOF and container combinations that do not depend on inline rendering.
for index,text in enumerate(["", "-\n\n\n  text", "[x]: /url\n---", "<![CDATA[x]]>\nafter", "<prefix>\nx\n</pre>", "a\r\nb\rc", "- [x] a\n- [ ] b", "|a|b|\n|-|-|\n|c|d|", "```` bad`\nx\n````", "- x\n\n    code\n\n- y"]):
    cases.append(dict(id=f"local:{index}",text=text,flags=0x2f0c))
encoded=b"".join(struct.pack("<II",case["flags"],len(case["text"].encode()))+case["text"].encode() for case in cases)
output=subprocess.check_output([str(BUILD/"block-reference")],input=encoded,cwd=ROOT)
results=[json.loads(line) for line in output.splitlines()]
assert len(results)==len(cases)
for case,result in zip(cases,results):case["result"]=result
path=ROOT/"apps/office/src/external/md4c/src/native-blocks.json"
path.write_text(json.dumps({"md4cVersion":"0.5.3","sourceSha256":hashlib.sha256((ROOT/"vendor/md4c-reference/src/md4c.c").read_bytes()).hexdigest(),"corpus":"Bundled CommonMark 0.31.2 and md4c extension examples; see README for attribution.","cases":cases},indent=2)+"\n")
print(f"Generated {path.relative_to(ROOT)}: {len(cases)} compiled native block-analysis cases")
