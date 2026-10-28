/** @fileoverview Native URI host, prefix and protocol-path contracts required by Writer HTML link resolution. */
import { expect, it } from "vitest";
import { INetProtocol as Protocol, EncodeMechanism as E } from "../../inc/urlobj";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../sal/inc/rtl/textenc";
import { getPrefix, getSchemeInfo, PrefixKind } from "./urlobj.data";
import { parseHost, parseHostOrNetBiosName } from "./urlobj.host";
import { parsePath } from "./urlobj.path";
import type { UriCursor } from "./urlobj";
/** Creates a native UTF16 pointer range. @param text - Host source. @returns Cursor. */
function range(text: string): UriCursor {
  return { text, index: 0, end: text.length };
}

it.each([
  ["EXAMPLE.test", "EXAMPLE.test", 12],
  ["_host.a_", "_host.a_", 8],
  ["001.002.003.004", "1.2.3.4", 15],
  ["999.888.777.666", "999.888.777.666", 15],
  ["123", null, 0],
  ["1.2.3", null, 0],
  ["host.", "host.", 5],
  ["host-", null, 0],
  ["a.123", "a.123", 5],
  ["ü.example", null, 0],
  ["[ABCD:0001:2]", "[abcd:1:2]", 13],
  ["[a]", "[a]", 3],
  ["[1:2:3:4:5:6:7:8:9]", "[1:2:3:4:5:6:7:8:9]", 19],
  ["[:::001.002.003.004]", "[:::1.2.3.4]", 20],
  ["[]", null, 0],
  ["[:]", null, 0],
  ["[1::2::3]", null, 0],
  ["[00000]", null, 0],
  ["[::1%25zone]", null, 0],
  ["[::1]:80", "[::1]", 5],
  ["host/path", "host", 4],
])(
  "preserves native host canonicalization and cursor for %j",
  /** Checks the complete native host scan result. @param text - Source. @param output - Canonical host or failure. @param position - Committed offset. @returns Nothing. */ (
    text,
    output,
    position,
  ) => {
    const cursor = range(text);
    expect(parseHost(cursor)).toBe(output);
    expect(cursor.index).toBe(position);
  },
);
it("checks full host consumption before the original file-only NetBIOS fallback", /** Native host validation and fallback have distinct domains and never consume caller pointers. @returns Nothing. */ () => {
  for (const input of ["123", "Server$", "A%23B"]) {
    const cursor = range(input);
    expect(parseHostOrNetBiosName(cursor, E.WasEncoded, UTF8, false)).toBeNull();
    expect(parseHostOrNetBiosName(cursor, E.WasEncoded, UTF8, true)).toBe(input);
    expect(cursor.index).toBe(0);
  }
  for (const input of ["a/b", "a b", "a%2Fb", "a%20b", "ü", "a:b", "a|b"])
    expect(parseHostOrNetBiosName(range(input), E.WasEncoded, UTF8, true)).toBeNull();
  expect(parseHostOrNetBiosName(range(""), E.WasEncoded, UTF8, false)).toBe("");
  expect(parseHostOrNetBiosName(range("host/"), E.WasEncoded, UTF8, false)).toBeNull();
});
it.each([
  ["HtTp://EXAMPLE", "http:", "", Protocol.Http, PrefixKind.Official, 5],
  [
    "private:factory/swriter",
    "private:factory/",
    "staroffice.factory:",
    Protocol.PrivSoffice,
    PrefixKind.Internal,
    16,
  ],
  ["private:fact", "private:", "staroffice.private:", Protocol.PrivSoffice, PrefixKind.Internal, 8],
  [
    "STAROFFICE.Factory:swriter",
    "staroffice.factory:",
    "private:factory/",
    Protocol.PrivSoffice,
    PrefixKind.External,
    19,
  ],
  ["staroffice:abc", "staroffice:", "private:", Protocol.PrivSoffice, PrefixKind.External, 11],
  [
    "staroffice.component:writer",
    "staroffice.component:",
    ".component:",
    Protocol.Component,
    PrefixKind.External,
    21,
  ],
  [".UNO:Save", ".uno:", "staroffice.uno:", Protocol.Uno, PrefixKind.Internal, 5],
  [
    "vnd.sun.star.webdav://host",
    "vnd.sun.star.webdav:",
    "",
    Protocol.VndSunStarWebdav,
    PrefixKind.Official,
    20,
  ],
])(
  "selects the native prefix and longest fallback for %j",
  /** Source-prefix recognition preserves aliases and pointer offsets. @param text - Source. @param prefix - Matched prefix. @param translated - Translation. @param protocol - Protocol. @param kind - Prefix kind. @param position - Offset. @returns Nothing. */ (
    text,
    prefix,
    translated,
    protocol,
    kind,
    position,
  ) => {
    const cursor = range(text);
    expect(getPrefix(cursor)).toEqual({
      m_aPrefix: prefix,
      m_aTranslatedPrefix: translated,
      m_eScheme: protocol,
      m_eKind: kind,
    });
    expect(cursor.index).toBe(position);
  },
);
it("rolls back unmatched prefixes and honors the exclusive end pointer", /** Partial source names are not admitted as full schemes. @returns Nothing. */ () => {
  const cursor = { text: "!http:more", index: 1, end: 5 };
  expect(getPrefix(cursor)).toBeNull();
  expect(cursor.index).toBe(1);
  cursor.end = 6;
  expect(getPrefix(cursor)?.m_eScheme).toBe(Protocol.Http);
  expect(cursor.index).toBe(6);
  for (const input of ["", "https", "staroffic", "abc:"]) {
    const p = range(input);
    expect(getPrefix(p)).toBeNull();
    expect(p.index).toBe(0);
  }
});
it("keeps source authority and path flags distinct from browser URL defaults", /** Actual flags consumed by the pending absolute parser. @returns Nothing. */ () => {
  expect(getSchemeInfo(Protocol.Http)).toMatchObject({
    m_bUser: false,
    m_bHost: true,
    m_bPort: true,
    m_bQuery: true,
  });
  expect(getSchemeInfo(Protocol.Ftp)).toMatchObject({
    m_bUser: true,
    m_bPassword: true,
    m_bQuery: false,
  });
  expect(getSchemeInfo(Protocol.Sftp)).toMatchObject({ m_bUser: true, m_bQuery: true });
  expect(getSchemeInfo(Protocol.Generic)).toMatchObject({
    m_sScheme: "",
    m_bAuthority: false,
    m_bHost: true,
    m_bPort: true,
    m_bHierarchical: true,
    m_bQuery: false,
  });
  expect(getSchemeInfo(Protocol.VndSunStarHier).m_aPrefix).toBe("vnd.sun.star.hier:");
});
it.each([
  [Protocol.Http, "", "/", 0],
  [Protocol.Http, "?q#f", "/", 0],
  [Protocol.Http, "a", null, 0],
  [Protocol.Http, "/a%2fb?q#f", "/a%2Fb", 6],
  [Protocol.Https, "/a b", "/a%20b", 4],
  [Protocol.Ftp, "/a?q#f", "/a%3Fq", 4],
  [Protocol.Mailto, "a&b+c?subject=x", "a%26b+c", 5],
  [Protocol.Javascript, "a?b#f", "a?b", 3],
  [Protocol.Data, "a,b?c#d", "a,b?c", 5],
  [Protocol.Cid, "a@b#c", "a@b", 3],
  [Protocol.Db, "x?y#z", "x?y", 3],
  [Protocol.File, "/C|/a?b#c", "/C:/a%3Fb", 7],
  [Protocol.File, "/C%7C/a", "/C%7C/a", 7],
  [Protocol.File, "#f", null, 0],
  [Protocol.File, "", "/", 0],
  [Protocol.PrivSoffice, "factory/swriter?x", "factory/swriter", 15],
  [Protocol.VndSunStarHelp, "?q", "/", 0],
  [Protocol.VndSunStarHelp, "bad", null, 0],
  [Protocol.VndSunStarPkg, "/a%41%2f?q", "/aA%2F", 8],
  [Protocol.VndSunStarHier, "", "/", 0],
  [Protocol.VndSunStarCmd, "/a/b#f", "%2Fa/b", 4],
  [Protocol.VndSunStarExpand, "#f", null, 0],
  [Protocol.Telnet, "", "/", 0],
  [Protocol.Telnet, "/", "/", 1],
  [Protocol.Telnet, "/#f", null, 0],
  [Protocol.VndSunStarTdoc, "/a%41%2f#f", "/aA%2F", 8],
  [Protocol.VndSunStarTdoc, "", null, 0],
  [Protocol.Generic, "abc?x#f", "abc?x", 5],
  [Protocol.Sftp, "/a?q#f", "/a?q", 4],
])(
  "retains native path rules for protocol %i source %j",
  /** Verifies protocol admission, escaping and delimiter stop. @param protocol - Scheme. @param text - Source. @param output - Path or failure. @param position - Cursor offset. @returns Nothing. */ (
    protocol,
    text,
    output,
    position,
  ) => {
    const cursor = range(text),
      initial = "scheme:";
    const actual = parsePath(
      protocol,
      cursor,
      E.WasEncoded,
      UTF8,
      false,
      47,
      0x80000000,
      63,
      35,
      initial,
    );
    expect(actual).toBe(output === null ? null : initial + output);
    expect(cursor.index).toBe(position);
  },
);
it("retains original buffer-dependent generic empty-path admission", /** parsePath tests the whole buffer for Generic/Sftp rather than the appended path length. @returns Nothing. */ () => {
  expect(
    parsePath(
      Protocol.Generic,
      range(""),
      E.WasEncoded,
      UTF8,
      false,
      47,
      0x80000000,
      63,
      35,
      "scheme:",
    ),
  ).toBe("scheme:");
  expect(
    parsePath(Protocol.Generic, range(""), E.WasEncoded, UTF8, false, 47, 0x80000000, 63, 35, ""),
  ).toBeNull();
});
it("retains raw file delimiter conversion, escaped delimiter spelling and disabled fragment semantics", /** Native filesystem interpretation differs from URI interpretation. @returns Nothing. */ () => {
  const cursor = range("C:\\a%20b#x");
  expect(
    parsePath(Protocol.File, cursor, E.All, UTF8, true, 92, 47, 0x80000000, 0x80000000, "file://"),
  ).toBe("file:///C:/a%2520b%23x");
  expect(cursor.index).toBe(cursor.end);
  const escaped = range("/a%5cb");
  expect(
    parsePath(Protocol.File, escaped, E.WasEncoded, UTF8, false, 47, 92, 63, 35, "file://"),
  ).toBe("file:///a%5Cb");
});
