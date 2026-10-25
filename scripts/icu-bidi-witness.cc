// Copyright Unicode, Inc. and others. Unicode License V3: https://www.unicode.org/license.txt
// Observation harness only: all property and bidi decisions come from unchanged ICU78.3.
#include <unicode/ubidi.h>
#include <unicode/uchar.h>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main(int argc, char** argv) {
    if (argc == 2 && std::string(argv[1]) == "--properties") {
        for (int32_t c = 0; c <= 0x10ffff; ++c) {
            const uint32_t values[] = {
                static_cast<uint32_t>(u_charDirection(c)),
                static_cast<uint32_t>(u_getIntPropertyValue(c, UCHAR_BIDI_PAIRED_BRACKET_TYPE)),
                static_cast<uint32_t>(u_getBidiPairedBracket(c))
            };
            for (uint32_t value : values)
                for (int shift = 0; shift < 32; shift += 8)
                    std::cout.put(static_cast<char>(value >> shift));
        }
        return std::cout.good() ? 0 : 1;
    }
    std::string line;
    while (std::getline(std::cin, line)) {
        std::istringstream stream(line);
        int initial;
        stream >> initial;
        if (initial != 0 && initial != 1) return 2;
        std::vector<UChar> text;
        unsigned value;
        while (stream >> std::hex >> value) text.push_back(static_cast<UChar>(value));
        UErrorCode error = U_ZERO_ERROR;
        UBiDi* bidi = ubidi_openSized(static_cast<int32_t>(text.size()), 0, &error);
        const UChar empty = 0;
        ubidi_setPara(bidi, text.empty() ? &empty : text.data(), static_cast<int32_t>(text.size()),
                      static_cast<UBiDiLevel>(initial), nullptr, &error);
        const int32_t count = ubidi_countRuns(bidi, &error);
        if (U_FAILURE(error)) { ubidi_close(bidi); return 3; }
        std::cout << count << '|';
        for (int32_t i = 0; i < static_cast<int32_t>(text.size()); ++i) {
            if (i) std::cout << ' ';
            std::cout << static_cast<unsigned>(ubidi_getLevelAt(bidi, i));
        }
        std::cout << '\n';
        ubidi_close(bidi);
    }
    return std::cout.good() ? 0 : 4;
}
