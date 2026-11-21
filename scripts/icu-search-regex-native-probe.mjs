/** @fileoverview Compares the portable regex boundary with the pinned LibreOffice bodies using original ICU. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const icuBuild = process.argv[2];
if (!icuBuild) throw new Error("Pass the repository-local ICU build directory.");
const bridge = resolve("third_party/icu-search-wasm");
const work = resolve("output/playwright/writer-icu-regex");
const icu = resolve("vendor/icu-reference/source");
const pin = JSON.parse(readFileSync(`${bridge}/source.json`, "utf8"));
const lo = readFileSync(resolve("vendor/libreoffice-reference", pin.referencePath), "utf8");

if (createHash("sha256").update(lo).digest("hex") !== pin.referenceSha256)
  throw new Error("LibreOffice regex reference pin differs.");
if (
  createHash("sha256")
    .update(readFileSync(`${icu}/data/in/icudt78l.dat`))
    .digest("hex") !== pin.icuDataSha256
)
  throw new Error("ICU data pin differs.");

const prepare = lo.indexOf("void TextSearch::RESrchPrepare(");
const find = lo.indexOf("static bool lcl_findRegex(", prepare);
const init = lo.indexOf("    UErrorCode nIcuErr = U_ZERO_ERROR;", prepare);
const approximate = lo.indexOf("SearchResult TextSearch::ApproxSrchFrwrd(", find);
if (!(prepare >= 0 && prepare < init && init < find && find < approximate))
  throw new Error("Cannot locate the pinned native regex bodies.");

const originalBodies = lo.slice(init, approximate);
mkdirSync(work, { recursive: true });
const fixture = `${work}/probe.cxx`;
const executable = `${work}/probe`;
writeFileSync(
  fixture,
  String.raw`#include "regex-search.h"
#include <unicode/regex.h>
#include <unicode/uversion.h>
#include <array>
#include <cstdio>
#include <cstdlib>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

using sal_Int32 = int32_t;
using sal_uInt32 = uint32_t;
#define SAL_INFO(...) ((void)0)

// These value adapters only supply the original LibreOffice body with UTF-16 and list storage.
struct OUString : std::u16string {
    using std::u16string::u16string;
    const char16_t* getStr() const { return data(); }
    int32_t getLength() const { return static_cast<int32_t>(size()); }
};

struct Offsets : std::vector<int32_t> {
    void realloc(int32_t count) { resize(count); }
    int32_t* getArray() { return data(); }
};

struct SearchResult {
    int32_t subRegExpressions;
    Offsets startOffset;
    Offsets endOffset;
};

struct TextSearch {
    std::unique_ptr<icu::RegexMatcher> pRegexMatcher;
    void prepare(const OUString& rPatternStr, bool ignoreCase);
    SearchResult RESrchFrwrd(std::unique_lock<std::mutex>&, const OUString&, int32_t, int32_t);
    SearchResult RESrchBkwrd(std::unique_lock<std::mutex>&, const OUString&, int32_t, int32_t);
};

void TextSearch::prepare(const OUString& rPatternStr, bool ignoreCase)
{
    const sal_uInt32 nIcuSearchFlags = UREGEX_UWORD | (ignoreCase ? UREGEX_CASE_INSENSITIVE : 0);
` +
    originalBodies +
    String.raw`
void require(bool condition, const char* message)
{
    if (!condition) {
        std::fprintf(stderr, "%s\n", message);
        std::exit(1);
    }
}

void checkGroups(LoRegexSearch* search, const OUString& text, int32_t start, int32_t end,
                 bool backward, std::initializer_list<LoRegexOffset> expected)
{
    const int32_t count = lo_regex_search(search, text.data(), text.size(), start, end, backward);
    require(count == expected.size(), "unexpected capture count in native regression");
    const auto* actual = lo_regex_offsets(search);
    require(count ? actual != nullptr : actual == nullptr, "unexpected capture pointer");
    for (const auto& pair : expected) {
        require(actual->start == pair.start && actual->end == pair.end,
                "unexpected capture pair in native regression");
        ++actual;
    }
}

int main()
{
    UVersionInfo icuVersion;
    u_getVersion(icuVersion);
    require(icuVersion[0] == 78 && icuVersion[1] == 3, "host ICU version differs from the pin");

    auto engine = [](const OUString& pattern, bool ignoreCase = false) {
        return std::unique_ptr<LoRegexSearch, decltype(&lo_regex_destroy)>(
            lo_regex_create(pattern.data(), pattern.size(), ignoreCase), &lo_regex_destroy);
    };

    // Native testSearches endpoints and the capture pairs returned by that ICU match.
    auto nativeQA = engine(u"(ab)*a(c|d)+", true);
    checkGroups(nativeQA.get(), u"acababaabcababadcdaa", 2, 20, false,
                {{10, 18}, {12, 14}, {17, 18}});
    checkGroups(nativeQA.get(), u"acababaabcababadcdaa", 20, 2, true,
                {{18, 10}, {14, 12}, {18, 17}});
    auto captureQA = engine(u"([^ ]*)[ ]*([^ ]*)", true);
    checkGroups(captureQA.get(), u"11 22 33", 2, 7, false, {{2, 5}, {2, 2}, {3, 5}});

    auto lookaround = engine(u"(?<=x)(a)(?=y)");
    checkGroups(lookaround.get(), u"xay", 1, 2, false, {{1, 2}, {1, 2}});
    checkGroups(lookaround.get(), u"xay", 2, 1, true, {{2, 1}, {2, 1}});
    checkGroups(engine(u"^a$").get(), u"xay", 1, 2, false, {});
    checkGroups(engine(u"(😀)(z)?").get(), u"x😀y", 0, 5, false, {{1, 3}, {1, 3}, {-1, -1}});
    checkGroups(engine(u"$").get(), u"abc", 0, 3, false, {{3, 3}});
    checkGroups(engine(u"$").get(), u"abc", 3, 0, true, {{3, 3}});
    checkGroups(engine(u"(?=y)").get(), u"xy", 0, 1, false, {{1, 1}});
    checkGroups(engine(u"(?=y)").get(), u"xy", 1, 0, true, {{1, 1}});
    checkGroups(engine(u"a*").get(), u"bc", 0, 2, false, {});
    checkGroups(engine(u"a*").get(), u"bc", 2, 0, true, {});
    checkGroups(engine(u"\\<a\\>").get(), u"ha a aa", 0, 7, false, {{3, 4}});
    require(!engine(u"("), "invalid ICU regex must not produce a matcher");
    require(!lo_regex_create(nullptr, 1, false), "invalid pattern buffer");
    require(lo_regex_search(nativeQA.get(), nullptr, 1, 0, 1, false) == 0,
            "invalid text buffer");
    require(!lo_regex_offsets(nativeQA.get()), "invalid search must clear old capture ranges");

    const std::vector<OUString> patterns = {
        u"a", u"A", u"^", u"$", u".", u"a*", u".*?", u"(ab|a)", u"(?=a)", u"(?<=a)b",
        u"(?<=x)a(?=y)", u"\\<a\\>", u"\\b", u"(a)?(b)", u"([[:alpha:]]+)",
        u"([[:Nd:]]+)", u"\\G.", u"😀(a)?", u"é", u"(.)\\1", u"ss", u"(?m:^b)",
        u"a.$", u"^a", u"\\X", u"(?=.)", u"(x)|(b)", u"[", u"(", u"", u"\\\\<",
    };
    const std::vector<OUString> texts = {
        u"", u"a", u"bc", u"ababa", u"aAa", u"xay", u"x a, A.", u"a\r\nb",
        u"😀a😀b", u"aéß", u"1١９z", u"e\u0301", OUString(u"a\0b", 3),
        OUString{char16_t(0xd83d), u'b', char16_t(0xde00)}, u"abc\n",
    };

    std::size_t cases = 0;
    for (bool ignoreCase : {false, true}) {
        for (const auto& pattern : patterns) {
            TextSearch reference;
            reference.prepare(pattern, ignoreCase);
            auto actual = engine(pattern, ignoreCase);
            require(bool(reference.pRegexMatcher) == bool(actual), "unexpected pattern admission");
            for (const auto& text : texts) {
                for (int32_t begin = 0; begin <= text.getLength(); ++begin) {
                    for (int32_t finish = begin; finish <= text.getLength() + 1; ++finish) {
                        for (bool backward : {false, true}) {
                            const int32_t start = backward ? finish : begin;
                            const int32_t end = backward ? begin : finish;
                            std::unique_lock<std::mutex> unused;
                            const auto expected = backward
                                ? reference.RESrchBkwrd(unused, text, start, end)
                                : reference.RESrchFrwrd(unused, text, start, end);
                            const auto count = lo_regex_search(actual.get(), text.data(), text.size(),
                                                               start, end, backward);
                            require(count == expected.subRegExpressions, "differential capture count mismatch");
                            const auto* offsets = lo_regex_offsets(actual.get());
                            require(count ? offsets != nullptr : offsets == nullptr, "stale capture pointer");
                            for (int index = 0; index < count; ++index)
                                require(offsets[index].start == expected.startOffset.at(index)
                                        && offsets[index].end == expected.endOffset.at(index),
                                        "differential capture offset mismatch");
                            ++cases;
                        }
                    }
                }
            }
        }
    }
    std::printf("Pinned ICU and LibreOffice regex differential passed: %zu cases.\n", cases);
}
`,
);
execFileSync(
  "c++",
  [
    "-std=c++17",
    "-O2",
    "-I",
    `${icu}/common`,
    "-I",
    `${icu}/i18n`,
    "-I",
    bridge,
    fixture,
    `${bridge}/regex-search.cxx`,
    ...["libicui18n.a", "libicuuc.a", "libicudata.a"].map(
      /** Resolves a pinned ICU archive. @param library - Static archive name. @returns Local link input. */
      (library) => resolve(icuBuild, "lib", library),
    ),
    "-lpthread",
    "-ldl",
    "-o",
    executable,
  ],
  { stdio: "inherit" },
);
execFileSync(executable, { stdio: "inherit" });
