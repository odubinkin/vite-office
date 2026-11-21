/*
 * Search policies based on LibreOffice i18npool/source/search/textsearch.cxx.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

#include "regex-search.h"

#include <memory>
#include <vector>

#include <unicode/regex.h>
#include <unicode/unistr.h>

static_assert(sizeof(LoRegexOffset) == 2 * sizeof(int32_t));

struct LoRegexSearch {
    icu::UnicodeString input;
    std::unique_ptr<icu::RegexMatcher> matcher;
    std::vector<LoRegexOffset> offsets;
};

namespace {

void replaceChevron(icu::UnicodeString& pattern, const char16_t* from, const char16_t* to,
                    UErrorCode& status)
{
    icu::RegexMatcher matcher(icu::UnicodeString(from), 0, status);
    matcher.reset(pattern);
    pattern = matcher.replaceAll(icu::UnicodeString(to), status);
}

bool findRegex(icu::RegexMatcher& matcher, int32_t start, int32_t end, UErrorCode& status)
{
    matcher.region(start, end, status);
    matcher.useAnchoringBounds(false);
    matcher.useTransparentBounds(true);
    return matcher.find(status);
}

bool searchForward(icu::RegexMatcher& matcher, int32_t start, int32_t end, UErrorCode& status)
{
    for (;;) {
        if (!findRegex(matcher, start, end, status))
            return false;

        const int32_t matchStart = matcher.start(status);
        const int32_t matchEnd = matcher.end(status);
        if (matchStart < matchEnd || matchStart == end)
            return true;

        if (++start >= end)
            return false;
    }
}

bool searchBackward(icu::RegexMatcher& matcher, int32_t start, int32_t end, UErrorCode& status)
{
    if (!findRegex(matcher, end, start, status))
        return false;

    int32_t lastStart;
    int32_t lastEnd;
    int32_t winningStart = 0;
    int32_t winningEnd = 0;
    bool first = true;
    do {
        lastStart = matcher.start(status);
        lastEnd = matcher.end(status);
        if (lastStart < lastEnd) {
            winningStart = lastStart;
            winningEnd = lastEnd;
        }
        if (lastEnd >= start)
            break;
        first = false;
        if (lastEnd == lastStart)
            ++lastEnd;
    } while (findRegex(matcher, lastEnd, start, status));

    if (winningStart == winningEnd) {
        if (!(first && lastStart == start))
            return false;
        winningStart = lastStart;
    }

    // The native search repositions the matcher to recover every capture pair.
    findRegex(matcher, winningStart, start, status);
    return true;
}

}

LoRegexSearch* lo_regex_create(const char16_t* pattern, int32_t length, int32_t ignoreCase)
{
    if (length < 0 || (!pattern && length != 0))
        return nullptr;
    auto search = std::make_unique<LoRegexSearch>();
    UErrorCode status = U_ZERO_ERROR;
    icu::UnicodeString expression(pattern, length);
    replaceChevron(expression, u"\\\\<", u"\\\\b(?=\\\\w)", status);
    replaceChevron(expression, u"\\\\>", u"(?<=\\\\w)\\\\b", status);
    uint32_t flags = UREGEX_UWORD;
    if (ignoreCase != 0)
        flags |= UREGEX_CASE_INSENSITIVE;

    search->matcher = std::make_unique<icu::RegexMatcher>(expression, flags, status);
    if (status != U_ZERO_ERROR)
        return nullptr;
    search->matcher->setTimeLimit(23 * 1000, status);
    return search.release();
}

void lo_regex_destroy(LoRegexSearch* search)
{
    delete search;
}

int32_t lo_regex_search(LoRegexSearch* search, const char16_t* text, int32_t length,
                        int32_t start, int32_t end, int32_t backward)
{
    if (!search)
        return 0;
    search->offsets.clear();
    if (length < 0 || (!text && length != 0))
        return 0;
    search->input.setTo(text, length);
    auto& matcher = *search->matcher;
    matcher.reset(search->input);
    UErrorCode status = U_ZERO_ERROR;

    const bool reversed = backward != 0;
    const bool found = reversed
        ? searchBackward(matcher, start > length ? length : start, end, status)
        : searchForward(matcher, start, end > length ? length : end, status);
    if (!found)
        return 0;

    const int32_t groups = matcher.groupCount() + 1;
    search->offsets.reserve(groups);
    for (int32_t index = 0; index < groups; ++index) {
        const int32_t groupStart = matcher.start(index, status);
        const int32_t groupEnd = matcher.end(index, status);
        search->offsets.push_back(reversed ? LoRegexOffset{groupEnd, groupStart}
                                           : LoRegexOffset{groupStart, groupEnd});
    }
    return groups;
}

const LoRegexOffset* lo_regex_offsets(const LoRegexSearch* search)
{
    return search && !search->offsets.empty() ? search->offsets.data() : nullptr;
}
