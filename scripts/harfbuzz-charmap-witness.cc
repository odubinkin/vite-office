// Original pinned HarfBuzz differential witness, not an application dependency.
// Build inside Writer after verifying the LibreOffice download.lst archive hash:
// c++ -std=c++17 -O1 -Ivendor/harfbuzz-reference/src \
//   scripts/harfbuzz-charmap-witness.cc vendor/harfbuzz-reference/src/harfbuzz.cc \
//   -o output/playwright/harfbuzz-charmap-witness
// Pass actual font paths; output is path, glyph population and inclusive ranges.
#include "hb.h"
#include <cstdio>
int main(int argc,char**argv) {
  for(int i=1;i<argc;i++) {
    hb_blob_t*blob=hb_blob_create_from_file_or_fail(argv[i]);
    if(!blob)return 2;
    hb_face_t*face=hb_face_create(blob,0);
    hb_set_t*set=hb_set_create();hb_face_collect_unicodes(face,set);
    std::printf("%s\t%u\t",argv[i],hb_face_get_glyph_count(face));
    hb_codepoint_t first,last=HB_SET_VALUE_INVALID;
    while(hb_set_next_range(set,&first,&last))std::printf("%u,%u;",first,last);
    std::puts("");hb_set_destroy(set);hb_face_destroy(face);hb_blob_destroy(blob);
  }
}
