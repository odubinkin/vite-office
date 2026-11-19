/** @fileoverview Source-derived UCB restricted Regexp/RegexpMap assertions and actual pinned provider configuration templates; no host regexp or URL parser supplies core matching. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SaxesParser } from "saxes";
import { afterEach, expect, it } from "vitest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Regexp, Kind } from "../inc/regexp";
import { RegexpMap, RegexpMapConstIter, RegexpMapIter, RegexpMapEntry } from "../inc/regexpmap";
afterEach(releaseDomScope);
/** Real native value specialization, not a fake provider or inferred default factory. */
const strings = {
  /** Original OUString copy constructor. @param value - Native input. @returns Owned copy. */
  copy(value: OUString): OUString {
    return new OUString(value);
  },
  /** Original OUString destructor. @param value - Owned element. @returns Nothing. */
  destroy(value: OUString): void {
    value.dispose();
  },
};
/** Parses a pattern over actual RTL owners. @param value - Source syntax. @returns Scoped expression. */
function parse(value: string): Regexp {
  return own(Regexp.parse(u(value)));
}
/** Checks and releases the actual original parse exception. @param value - Unsupported syntax. @returns Nothing. */
function invalid(value: string): void {
  let caught = false;
  try {
    const result = Regexp.parse(u(value));
    result.dispose();
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught, value).toBe(true);
}
it.each([
  ["file", "FiLe:///tmp/document.docx", true],
  ["file", "files:///tmp", false],
  ['"a\\"b\\\\c".*', 'A"B\\cx', true],
  ['"a\0b".*', "a\0bc", true],
  ['"Ä".*', "äx", false],
  ['"http://example"([/?#].*)?', "HTTP://EXAMPLE", true],
  ['"http://example"([/?#].*)?', "http://example/path", true],
  ['"http://example"([/?#].*)?', "http://example?query", true],
  ['"http://example"([/?#].*)?', "http://example#fragment", true],
  ['"http://example"([/?#].*)?', "http://example.net", false],
  ['"long-prefix".*', "long", false],
  ['"http://"[^/?#]+".example"([/?#].*)?', "http://x.EXAMPLE/path", true],
  ['"http://"[^/?#]+".example"([/?#].*)?', "http://.example", false],
  ['"http://"[^/?#]*".example"([/?#].*)?', "http://.example", true],
  ['"http://"[^/?#]+([/?#].*)?', "http://", false],
  ['"http://"[^/?#]+([/?#].*)?', "http:///x", false],
  ['"http://"[^/?#]*([/?#].*)?', "http://", true],
  ['"http://"[^/?#]*([/?#].*)?', "http://?q", true],
  ['"http://"[^/?#]+".example"([/?#].*)?', "http://x.example.bad/x", false],
  ['"http://"[^/?#]+".example"([/?#].*)?', "http://bad/path.example", false],
  ['"x"(.*)->"y"\\1', "Xabc", true],
  ['"x"(([/?#].*)?)->"y"\\1', "x?query", true],
  ['"x"([^/?#]+".z"([/?#].*)?)->"y"\\1', "xa.z#b", true],
] as [string, string, boolean][])(
  "matches source grammar %s against %s",
  /** Source decisions use exact counted UTF16 and ASCII comparison. @param syntax - Source pattern. @param candidate - Candidate URL/text. @param expected - Source decision. @returns Nothing. */ (
    syntax,
    candidate,
    expected,
  ) => {
    expect(parse(syntax).matches(u(candidate))).toBe(expected);
  },
);
it.each([
  "",
  "1http",
  '"literal"',
  '"unterminated',
  '"trailing\\',
  '"bad\\q".*',
  ".*x",
  "(.*)->",
  "(.*)->\\1x",
  "([/?#].*)?x",
  "(([/?#].*)?)->\\1",
  '(([/?#].*)?)->"r"x',
  "[^/?#]",
  "[^/?#]?([/?#].*)?",
  "[^/?#]+",
  "[^/?#]+([/?#].*)?x",
  "([^/?#]+([/?#].*)?)",
  "([^/?#]+([/?#].*)?)->\\1",
  '([^/?#]+([/?#].*)?)->"r"\\1x',
  "(bogus)",
])(
  "rejects original unsupported syntax %s",
  /** Original IllegalArgumentException is retained. @param syntax - Unsupported syntax. @returns Nothing. */ (
    syntax,
  ) => invalid(syntax),
);
it("retains original canonical forms and memberwise copy", /** Serialization uses actual OUStringBuffer/RTL values. @returns Nothing. */ () => {
  for (const syntax of [
    "file",
    '"http:".*',
    ".*",
    '"x".*',
    '"x"([/?#].*)?',
    '"x"[^/?#]+".z"([/?#].*)?',
    '"x"[^/?#]*([/?#].*)?',
    '"x"(.*)->"y"\\1',
    '"x"(([/?#].*)?)->"y"\\1',
    '"x"([^/?#]+".z"([/?#].*)?)->"y"\\1',
  ]) {
    const pattern = parse(syntax),
      canonical = read(pattern.getRegexp()),
      copy = own(pattern.copy());
    expect(copy.equals(pattern)).toBe(true);
    expect(read(copy.getRegexp())).toBe(canonical);
    expect(parse(canonical).equals(pattern)).toBe(true);
  }
  expect(read(parse('"http:".*').getRegexp())).toBe("http");
  expect(parse(".*").isDefault()).toBe(true);
  expect(parse("file").getKind()).toBe(Kind.KIND_PREFIX);
});
it("preserves source equality omissions and asymmetric empty reverse-prefix serialization", /** Suspected source defects are preserved rather than normalized. @returns Nothing. */ () => {
  const a = parse("[^/?#]*([/?#].*)?"),
    b = parse("[^/?#]+([/?#].*)?");
  expect(a.equals(b)).toBe(true);
  expect(a.matches(u(""))).toBe(true);
  expect(b.matches(u(""))).toBe(false);
  expect(parse('"x".*').equals(parse('"x"(.*)->"y"\\1'))).toBe(true);
  for (const syntax of ['(([/?#].*)?)->""\\1', '([^/?#]*([/?#].*)?)->""\\1']) {
    const value = parse(syntax),
      canonical = read(value.getRegexp());
    invalid(canonical);
  }
  expect(read(parse("(.*)->\\1").getRegexp())).toBe("(.*)->\\1");
  expect(parse('(.*)->""\\1').isDefault()).toBe(true);
});
it("maps by source kind priority and insertion order while keeping native value copies", /** RegexpMap owns actual native strings as its declared Val. @returns Nothing. */ () => {
  const map = own(new RegexpMap(strings));
  map.add(u(".*"), u("default"));
  map.add(u("http"), u("scheme"));
  map.add(u('"http://example.org"([/?#].*)?'), u("authority"));
  map.add(u('"http://"[^/?#]+".org"([/?#].*)?'), u("domain"));
  expect(map.size()).toBe(4);
  expect(read(new OUString(map.map(u("other")) as OUString))).toBe("default");
  expect(read(new OUString(map.map(u("HTTP://example.org/x")) as OUString))).toBe("domain");
  const authority = own(map.find(u('"http://example.org"([/?#].*)?'))),
    end = own(map.end());
  expect(authority.equals(end)).toBe(false);
  expect(read(new OUString(authority.operatorArrow().getValue()))).toBe("authority");
  const domain = own(map.find(u('"http://"[^/?#]+".org"([/?#].*)?')));
  map.erase(domain);
  expect(read(new OUString(map.map(u("http://example.org/x")) as OUString))).toBe("authority");
  map.add(u('"http://example.org"([/?#].*)?'), u("ignored"));
  expect(map.size()).toBe(3);
  expect(read(new OUString(map.map(u("http://elsewhere")) as OUString))).toBe("scheme");
  map.add(u('"http:".*'), u("duplicate"));
  expect(map.size()).toBe(3);
  map.add(u("HTTP"), u("case-distinct"));
  expect(map.size()).toBe(4);
  expect(read(new OUString(map.map(u("http://elsewhere")) as OUString))).toBe("scheme");
  map.add(u('"http://long".*'), u("longer"));
  expect(read(new OUString(map.map(u("http://long/path")) as OUString))).toBe("scheme");
  const cursor = own(map.find(u(".*")));
  map.erase(cursor);
  expect(map.map(u("other"))).toBeNull();
});
it("preserves duplicate domain and translation keys and borrowed native value mutation", /** Equality is exact case-sensitive kind/prefix/infix only. @returns Nothing. */ () => {
  const map = own(new RegexpMap(strings));
  map.add(u("[^/?#]+([/?#].*)?"), u("plus"));
  map.add(u("[^/?#]*([/?#].*)?"), u("star"));
  expect(map.size()).toBe(1);
  expect(map.map(u(""))).toBeNull();
  const cursor = own(map.find(u("[^/?#]*([/?#].*)?")));
  cursor.operatorArrow().getValue().assign(u("changed"));
  expect(read(new OUString(map.map(u("a")) as OUString))).toBe("changed");
  map.add(u('"x"(.*)->"r"\\1'), u("translated"));
  map.add(u('"x".*'), u("ignored"));
  expect(map.size()).toBe(2);
  const missing = own(map.find(u('"none".*'))),
    end = own(map.end());
  expect(missing.equals(end)).toBe(true);
  expect(own(map.find(u(".*"))).equals(end)).toBe(true);
});
it("retains source iterator ordering, cache, copy, assignment and end behavior", /** All observations use public iterators and native values. @returns Nothing. */ () => {
  const map = own(new RegexpMap(strings)),
    empty = own(map.begin()),
    end = own(map.end());
  expect(empty.equals(end)).toBe(true);
  end.increment();
  expect(empty.equals(end)).toBe(true);
  map.add(u('"a"[^/?#]*([/?#].*)?'), u("domain"));
  map.add(u('"a"([/?#].*)?'), u("authority"));
  map.add(u("file"), u("prefix"));
  map.add(u(".*"), u("default"));
  const iterator = own(map.begin()),
    constant = own(map.cbegin()),
    finish = own(map.cend()),
    defaultA = own(new RegexpMapConstIter<OUString>()),
    defaultB = own(new RegexpMapConstIter<OUString>());
  expect(defaultA.equals(defaultB)).toBe(true);
  expect(defaultA.equals(iterator)).toBe(false);
  const first = iterator.operatorArrow();
  expect(iterator.operatorArrow()).toBe(first);
  const projection = own(first.copy());
  projection.assign(projection);
  const secondProjection = own(new RegexpMapEntry<OUString>(new OUString(), null));
  secondProjection.assign(projection);
  expect(read(new OUString(secondProjection.getValue()))).toBe("default");
  const copy = own(new RegexpMapIter(iterator));
  expect(copy.equals(iterator)).toBe(true);
  const labels: string[] = [];
  while (!iterator.equals(finish)) {
    expect(iterator.operatorArrow()).toBe(first);
    labels.push(read(new OUString(iterator.operatorArrow().getValue())));
    expect(constant.equals(iterator)).toBe(true);
    constant.increment();
    iterator.increment();
  }
  expect(labels).toEqual(["default", "prefix", "authority", "domain"]);
  expect(constant.equals(finish)).toBe(true);
  expect(read(new OUString(projection.getValue()))).toBe("default");
  copy.assign(iterator);
  expect(copy.equals(finish)).toBe(true);
  copy.assign(copy);
  copy.assign(own(map.begin()));
  expect(read(new OUString(copy.operatorArrow().getValue()))).toBe("default");
  const withoutDefault = own(map.find(u(".*")));
  map.erase(withoutDefault);
  const begin = own(map.begin());
  expect(read(new OUString(begin.operatorArrow().getValue()))).toBe("prefix");
  const authority = own(map.find(u('"a"([/?#].*)?')));
  copy.assign(authority);
  const indexedCopy = own(new RegexpMapConstIter(copy));
  expect(read(new OUString(indexedCopy.operatorArrow().getValue()))).toBe("authority");
  map.erase(authority);
  expect(map.size()).toBe(2);
});
it("accepts every actual pinned UCB provider URL template", /** Saxes only extracts configuration fixture text; actual Regexp owns all pattern parsing. @returns Nothing. */ () => {
  const xml = readFileSync(
      resolve(
        "../../vendor/libreoffice-reference/officecfg/registry/data/org/openoffice/ucb/Configuration.xcu",
      ),
      "utf8",
    ),
    parser = new SaxesParser(),
    patterns: string[] = [];
  let inTemplate = false,
    inValue = false,
    text = "";
  parser.on(
    "opentag",
    /** Collects source configuration value boundaries. @param tag - Parsed fixture tag. @returns Nothing. */ (
      tag,
    ) => {
      if (tag.name === "prop" && tag.attributes["oor:name"] === "URLTemplate") inTemplate = true;
      if (inTemplate && tag.name === "value") {
        inValue = true;
        text = "";
      }
    },
  );
  parser.on(
    "text",
    /** Collects actual literal text. @param value - Fixture characters. @returns Nothing. */ (
      value,
    ) => {
      if (inValue) text += value;
    },
  );
  parser.on(
    "closetag",
    /** Retains provider pattern text. @param tag - Closing fixture tag. @returns Nothing. */ (
      tag,
    ) => {
      if (tag.name === "value" && inValue) {
        patterns.push(text);
        inValue = false;
      }
      if (tag.name === "prop") inTemplate = false;
    },
  );
  parser.write(xml).close();
  expect(patterns.length).toBe(18);
  expect(patterns).toContain("file");
  for (const syntax of patterns) {
    const value = parse(syntax);
    expect(parse(read(value.getRegexp())).equals(value), syntax).toBe(true);
  }
});
