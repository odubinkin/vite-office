"""Compile pinned md4c and capture complete callback streams for the block corpus.

No replacement parser or HTML renderer participates. Strings, attributes and
text callbacks are serialized as byte arrays so chunk boundaries and embedded
NUL bytes remain visible to differential tests.
"""
from pathlib import Path
import hashlib
import json
import struct
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/"test-results/md4c"
BUILD.mkdir(parents=True,exist_ok=True)
assert hashlib.sha256((ROOT/"vendor/md4c-reference/md4c-release-0.5.3.tar.gz").read_bytes()).hexdigest()=="353c346f376b87c954a13f3415ede2d51264cc61dc5abcd38ff1d2aa0d059b9e"
source=BUILD/"callback-reference.c"
source.write_text(r'''
#include "../../vendor/md4c-reference/src/md4c.c"
static int comma;
static void bytes(const char* text,unsigned size){printf("[");for(unsigned i=0;i<size;i++)printf("%s%u",i?",":"",(unsigned char)text[i]);printf("]");}
static void attr(const MD_ATTRIBUTE* a){
 printf("[");bytes(a->text,a->size);printf(",%u,[",a->size);unsigned count=0;
 if(a->substr_offsets){do{printf("%s%u",count?",":"",a->substr_types[count]);count++;}while(a->substr_offsets[count]<a->size);}
 printf("],[");if(a->substr_offsets)for(unsigned i=0;i<=count;i++)printf("%s%u",i?",":"",a->substr_offsets[i]);printf("]]");
}
static void block(int enter,MD_BLOCKTYPE type,void* detail){
 printf("%s[%d,%u,[",comma++?",":"",enter?0:1,type);
 switch(type){
 case MD_BLOCK_UL:{MD_BLOCK_UL_DETAIL*d=detail;printf("%d,%u",d->is_tight,(unsigned char)d->mark);break;}
 case MD_BLOCK_OL:{MD_BLOCK_OL_DETAIL*d=detail;printf("%u,%d,%u",d->start,d->is_tight,(unsigned char)d->mark_delimiter);break;}
 case MD_BLOCK_LI:{MD_BLOCK_LI_DETAIL*d=detail;printf("%d,%u,%u",d->is_task,(unsigned char)d->task_mark,d->task_mark_offset);break;}
 case MD_BLOCK_H:{MD_BLOCK_H_DETAIL*d=detail;printf("%u",d->level);break;}
 case MD_BLOCK_CODE:{MD_BLOCK_CODE_DETAIL*d=detail;attr(&d->info);printf(",");attr(&d->lang);printf(",%u",(unsigned char)d->fence_char);break;}
 case MD_BLOCK_TABLE:{MD_BLOCK_TABLE_DETAIL*d=detail;printf("%u,%u,%u",d->col_count,d->head_row_count,d->body_row_count);break;}
 case MD_BLOCK_TH:case MD_BLOCK_TD:{MD_BLOCK_TD_DETAIL*d=detail;printf("%u",d->align);break;}
 default:break;
 }printf("]]");
}
static int eb(MD_BLOCKTYPE type,void* detail,void* data){block(1,type,detail);return 0;}
static int lb(MD_BLOCKTYPE type,void* detail,void* data){block(0,type,detail);return 0;}
static void span(int enter,MD_SPANTYPE type,void* detail){
 printf("%s[%d,%u,[",comma++?",":"",enter?2:3,type);
 switch(type){
 case MD_SPAN_A:{MD_SPAN_A_DETAIL*d=detail;attr(&d->href);printf(",");attr(&d->title);printf(",%d",d->is_autolink);break;}
 case MD_SPAN_IMG:{MD_SPAN_IMG_DETAIL*d=detail;attr(&d->src);printf(",");attr(&d->title);break;}
 case MD_SPAN_WIKILINK:{MD_SPAN_WIKILINK_DETAIL*d=detail;attr(&d->target);break;}
 default:break;
 }printf("]]");
}
static int es(MD_SPANTYPE type,void* detail,void* data){span(1,type,detail);return 0;}
static int ls(MD_SPANTYPE type,void* detail,void* data){span(0,type,detail);return 0;}
static int tx(MD_TEXTTYPE type,const char* text,MD_SIZE size,void*data){printf("%s[4,%u,",comma++?",":"",type);bytes(text,size);printf("]");return 0;}
int main(void){unsigned flags,size;while(fread(&flags,4,1,stdin)==1&&fread(&size,4,1,stdin)==1){
 char*text=malloc(size+1);if(fread(text,1,size,stdin)!=size)return 2;text[size]=0;
 MD_PARSER parser={0};parser.flags=flags;parser.enter_block=eb;parser.leave_block=lb;parser.enter_span=es;parser.leave_span=ls;parser.text=tx;
 comma=0;printf("{\"events\":[");int result=md_parse(text,size,&parser,NULL);printf("],\"result\":%d}\n",result);free(text);
}return 0;}
''')
subprocess.run(["clang","-std=c99","-O2",str(source),"-o",str(BUILD/"callback-reference")],check=True,cwd=ROOT)
corpus=json.loads((ROOT/"apps/office/src/external/md4c/src/native-blocks.json").read_text())
cases=[dict(id=case["id"],text=case["text"],flags=case["flags"]) for case in corpus["cases"]]
for flag in [0,1,0x10,0x20,0x40,0x60,0x1000,0x4000,0x8000,0x1000|0x4000|1]:
 for index,text in enumerate(["a\t b\nnext", "_u_ **s** ~d~ $x$ $$y$$", "<prefix>\nx\n</pre>", "[[target|**label**]] [www.example.org](target)", "`a\x00b`\n\n``` x &aa;\na\x00b\n```", "[x]: <a b> 'title'\n\n[X] ![alt](u)", "|a||c|\n|-|-|-|\n|x||z|", "<1a:x> <a@b.co> http://a.co/?x=(y)"]):
  cases.append(dict(id=f"flags-{flag}:{index}",text=text,flags=0x2f0c|flag))
integration_edges="--integration-edges" in sys.argv
if integration_edges:
 edge_fixture=json.loads((ROOT/"apps/office/src/external/md4c/src/native-edge-callbacks.json").read_text())
 cases=[dict(id=case["id"],text=case["text"],flags=case["flags"]) for case in edge_fixture["cases"]]
encoded=b"".join(struct.pack("<II",case["flags"],len(case["text"].encode()))+case["text"].encode() for case in cases)
output=subprocess.check_output([str(BUILD/"callback-reference")],input=encoded,cwd=ROOT)
results=[json.loads(line) for line in output.splitlines()]
assert len(results)==len(cases)
for case,result in zip(cases,results):case.update(result)
path=ROOT/"apps/office/src/external/md4c/src"/("native-edge-callbacks.json" if integration_edges else "native-callbacks.json")
path.write_text(json.dumps({"md4cVersion":"0.5.3","sourceSha256":corpus["sourceSha256"],"corpus":edge_fixture["corpus"] if integration_edges else "Bundled CommonMark 0.31.2 and md4c extension examples; see README for attribution.","cases":cases},indent=2)+"\n")
print(f"Generated {path.relative_to(ROOT)}: {len(cases)} compiled full md_parse callback streams")
