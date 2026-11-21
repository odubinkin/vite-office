#ifndef VITE_OFFICE_ICU_REGEX_SEARCH_H
#define VITE_OFFICE_ICU_REGEX_SEARCH_H

#include <cstdint>

struct LoRegexSearch;

struct LoRegexOffset {
    int32_t start;
    int32_t end;
};

extern "C" {

// The caller supplies the already prepared UTF-16 pattern. Invalid patterns return null.
LoRegexSearch* lo_regex_create(const char16_t* pattern, int32_t length, int32_t ignoreCase);
void lo_regex_destroy(LoRegexSearch* search);

// Bounds and group zero follow the native direction, including reversed backward pairs.
// The return value is the number of capture groups, including group zero, or zero on no match.
int32_t lo_regex_search(LoRegexSearch* search, const char16_t* text, int32_t length,
                        int32_t start, int32_t end, int32_t backward);

// Read the capture pairs before the next search or destruction of this handle.
const LoRegexOffset* lo_regex_offsets(const LoRegexSearch* search);

}

#endif
