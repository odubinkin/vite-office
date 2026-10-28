/** @fileoverview Source-backed native URI value, strict/smart parsing and relative resolution, including original tools CppUnit regressions. */
import { expect, it } from "vitest";
import { INetURLObject } from "./urlobj.object";
import {
  DecodeMechanism as D,
  EncodeMechanism as E,
  FSysStyle,
  INetProtocol as P,
} from "../../inc/urlobj";
import {
  RTL_TEXTENCODING_UTF8 as UTF8,
  RTL_TEXTENCODING_ISO_8859_1 as LATIN1,
} from "../../../sal/inc/rtl/textenc";
import { decode } from "./urlobj";
import { SmartRel2Abs } from "../../../svl/source/misc/urihelper";

it.each([
  ["http://EXAMPLE.test:00080", "http://EXAMPLE.test:00080/", P.Http],
  ["http://a:", "http://a:/", P.Http],
  ["http://a:9999999999", "http://a:9999999999/", P.Http],
  ["http://001.002.003.004/a/../b", "http://1.2.3.4/a/../b", P.Http],
  ["http://[ABCD:0001:2]/", "http://[abcd:1:2]/", P.Http],
  ["http://999.888.777.666", "http://999.888.777.666/", P.Http],
  ["file:/tmp/a b", "file:///tmp/a%20b", P.File],
  ["file://LOCALHOST/C|/a", "file:///C:/a", P.File],
  [
    "file://share.allotropia.de@SSL/DavWWWRoot/remote.php",
    "file://share.allotropia.de@SSL/DavWWWRoot/remote.php",
    P.File,
  ],
  ["ftp://user:p:a@EXAMPLE.test/a?q", "ftp://user:p%3Aa@EXAMPLE.test/a%3Fq", P.Ftp],
  ["ftp://user%3Ap@host", "ftp://user%3Ap@host/", P.Ftp],
  ["sftp://user:p@host/a?q#f", "sftp://user:p@host/a?q#f", P.Sftp],
  ["smb://", "smb:///", P.Smb],
  ["ldap://", "ldap://", P.Ldap],
  ["STAROFFICE.Factory:swriter", "private:factory/swriter", P.PrivSoffice],
  ["xx:some path?q#f", "xx:some%20path?q#f", P.Generic],
  ["vnd.sun.star.hier:/path", "vnd.sun.star.hier:/path", P.VndSunStarHier],
  ["vnd.sun.star.cmd:/a/b", "vnd.sun.star.cmd:%2Fa/b", P.VndSunStarCmd],
  ["mailto:a&b+c@example.test?subject=a b", "mailto:a%26b+c@example.test?subject=a%20b", P.Mailto],
  ["data:", "data:", P.Data],
  ["javascript:a?b#c", "javascript:a?b#c", P.Javascript],
])(
  "keeps native absolute reference %j",
  /** Checks native canonical spelling and protocol. @param source - Input. @param output - Original output. @param protocol - Original enum. @returns Nothing. */ (
    source,
    output,
    protocol,
  ) => {
    const value = new INetURLObject(source);
    expect(value.HasError()).toBe(false);
    expect(value.GetMainURL(D.NONE)).toBe(output);
    expect(value.GetProtocol()).toBe(protocol);
  },
);
it.each([
  "",
  "relative/path",
  "http:host/path",
  "http:///a",
  "http://user@host/",
  "http://ü.example/",
  "http://123/",
  "file:#f",
  "xx:",
  "xx:#f",
  "c:foo",
  "telnet://host/#f",
  "vnd.sun.star.pkg://",
  "vnd.sun.star.hier://",
])(
  "invalidates the complete URI for rejected absolute input %j",
  /** Source failure must not retain a previously valid value. @param source - Rejected reference. @returns Nothing. */ (
    source,
  ) => {
    const value = new INetURLObject("https://host/a?q#f");
    expect(value.SetURL(source)).toBe(false);
    expect(value.HasError()).toBe(true);
    expect(value.GetMainURL(D.NONE)).toBe("");
    expect(value.GetHost()).toBe("");
    expect(value.GetURLPath()).toBe("");
    expect(value.HasParam()).toBe(false);
  },
);
it.each([
  ["example.com:8080/foo", "http://example.com:8080/foo", P.Http],
  ["example.com:80a0/foo", "example.com:80a0/foo", P.Generic],
  ["www.example.test/path", "http://www.example.test/path", P.Http],
  ["FTP.example.test/path", "ftp://FTP.example.test/path", P.Ftp],
  ["user@example.test", "mailto:user@example.test", P.Mailto],
  ["/tmp/a%20b#c", "file:///tmp/a%2520b%23c", P.File],
  ["C:\\a%20b#c", "file:///C:/a%2520b%23c", P.File],
  ["\\\\?\\D:\\bar\\baz.ext", "file:///D:/bar/baz.ext", P.File],
  ["\\\\?\\UNC\\ServerBar\\barShare\\baz.ext", "file://ServerBar/barShare/baz.ext", P.File],
  ["//Server/a", "file://Server/a", P.File],
  ["file://C:\\a", "file:///C:/a", P.File],
  ["file:relative\\a", "file:///relative/a", P.File],
])(
  "keeps original smart parsing for %j",
  /** Includes native testParseSmart fixtures without ambiguous numeric constructor-overload guessing. @param source - Input. @param output - Native output. @param protocol - Native protocol. @returns Nothing. */ (
    source,
    output,
    protocol,
  ) => {
    const value = new INetURLObject();
    expect(value.SetSmartURL(source)).toBe(true);
    expect(value.GetMainURL(D.NONE)).toBe(output);
    expect(value.GetProtocol()).toBe(protocol);
  },
);
it("retains source URL path/query coordinates and escaped query getter", /** SFTP and HTTP have different internal query boundaries. @returns Nothing. */ () => {
  const http = new INetURLObject("http://host/a?q=%41#f");
  expect(http.GetURLPath(D.NONE)).toBe("/a");
  expect(http.HasParam()).toBe(true);
  expect(http.GetParam()).toBe("q=%41");
  const sftp = new INetURLObject("sftp://host/a?q=%41#f");
  expect(sftp.GetURLPath(D.NONE)).toBe("/a?q=%41");
  expect(sftp.HasParam()).toBe(false);
  expect(sftp.GetParam()).toBe("");
  expect(new INetURLObject("private:factory/swriter").GetURLPath(D.NONE)).toBe("swriter");
  const empty = new INetURLObject("http://host?");
  expect(empty.HasParam()).toBe(true);
  expect(empty.GetParam()).toBe("");
});
it("retains the native CMIS host/authority field and UTF8 presentation", /** Adapts consumed assertions from original urlobjCmisTest. @returns Nothing. */ () => {
  for (const user of ["username@", ""]) {
    const value = new INetURLObject(
      "vnd.libreoffice.cmis://" +
        user +
        "http:%2F%2Ffoo.bar.com:8080%2Fmy%2Fcmis%2Fatom%23repo-id-encoded/path/to/content",
    );
    expect(value.GetProtocol()).toBe(P.Cmis);
    expect(value.GetHost(D.WithCharset)).toBe(
      "http://foo.bar.com:8080/my/cmis/atom#repo-id-encoded",
    );
    expect(value.GetURLPath(D.NONE)).toBe("/path/to/content");
  }
  expect(new INetURLObject("http://host/é%20%F0%9F%98%80").GetMainURL(D.ToIUri)).toBe(
    "http://host/é%20😀",
  );
});
it("copies native coordinates independently and preserves smart protocol through failure", /** Native copy and setInvalid have distinct effects on smart-scheme state. @returns Nothing. */ () => {
  const source = new INetURLObject("http://host/a?q#f"),
    copy = new INetURLObject(source);
  source.SetURL("");
  expect(copy.GetMainURL(D.NONE)).toBe("http://host/a?q#f");
  expect(copy.GetParam()).toBe("q");
  copy.SetSmartProtocol(P.Ftp);
  copy.SetURL("");
  expect(copy.SetSmartURL("host/path")).toBe(true);
  expect(copy.GetMainURL(D.NONE)).toBe("ftp://host/path");
});
it.each([
  ["http://host/dir/file?q#old", "child", "http://host/dir/child", false],
  ["http://host/dir/file?q", "../child", "http://host/child", false],
  ["http://host/dir/file", "./a/../b", "http://host/dir/b", false],
  ["http://host/dir/file", "/a/../b", "http://host/a/../b", false],
  ["http://host/dir/file?q#old", "", "http://host/dir/file?q", false],
  ["http://host/dir/file?q#old", "#new", "http://host/dir/file?q#new", false],
  ["http://host/dir/file", "http:child", "http://host/dir/child", false],
  ["http://host/dir/file", "https://OTHER/path", "https://OTHER/path", true],
  ["http://host/dir/file", "//OTHER/path", "http://OTHER/path", false],
  ["http://host/dir/file", "?q", "http://host/dir/?q", false],
  ["file:///C:/foo", "\\\\?\\D:\\bar\\baz.ext", "file:///D:/bar/baz.ext", true],
  [
    "file://ServerFoo/fooShare",
    "\\\\?\\UNC\\ServerBar\\barShare\\baz.ext",
    "file://ServerBar/barShare/baz.ext",
    true,
  ],
  ["file:///dir/file", "a\\b#c%20", "file:///dir/a/b%23c%2520", false],
])(
  "retains native relative resolution from %j with %j",
  /** Source state machine, dot segments and bool out parameter. @param base - Base input. @param relative - Reference. @param output - Native output. @param absolute - Expected out parameter. @returns Nothing. */ (
    base,
    relative,
    output,
    absolute,
  ) => {
    const wasAbsolute: [boolean] = [false];
    const value = new INetURLObject(base).smartRel2Abs(relative, wasAbsolute);
    expect(value.GetMainURL(D.NONE)).toBe(output);
    expect(wasAbsolute[0]).toBe(absolute);
  },
);
it("retains native nonhierarchical failures and fragment suppression", /** Failed conversion returns a default invalid URI value. @returns Nothing. */ () => {
  const flag: [boolean] = [true];
  expect(new INetURLObject("mailto:a@b").smartRel2Abs("relative", flag).HasError()).toBe(true);
  expect(flag[0]).toBe(false);
  expect(
    new INetURLObject("http://host/a?q#old").smartRel2Abs("#new", flag, true).GetMainURL(D.NONE),
  ).toBe("http://host/a?q");
  expect(
    new INetURLObject("http://host/a")
      .smartRel2Abs("https://other/b#f", flag, true)
      .GetMainURL(D.NONE),
  ).toBe("https://other/b");
});
it.each([
  ["http://host/dir/file?q#f", "http://host/dir/"],
  ["http://host/dir/", "http://host/dir/"],
  ["http://host/", "http://host/"],
  ["file:///C:/dir/file", "file:///C:/dir/"],
  ["sftp://host", "sftp://host/"],
  ["mailto:a@b", ""],
  ["", ""],
])(
  "keeps original parent extraction for %j",
  /** Consumes the original LAST_SEGMENT,false path behavior, not a browser directory resolver. @param source - Input. @param output - Parent. @returns Nothing. */ (
    source,
    output,
  ) => {
    const value = new INetURLObject(source);
    expect(value.GetPartBeforeLastName()).toBe(output);
    expect(value.GetMainURL(D.NONE)).toBe(source);
  },
);
it("retains URIHelper fragment compatibility and file-preference callback semantics", /** Leading fragments bypass the resolver even with ignoreFragment enabled. @returns Nothing. */ () => {
  expect(SmartRel2Abs(new INetURLObject(), "#raw%41", null, false, true)).toBe("#raw%41");
  expect(SmartRel2Abs(new INetURLObject(), "example.test/a", null, false)).toBe(
    "http://example.test/a",
  );
  expect(SmartRel2Abs(new INetURLObject(), "http://user@host", null, false)).toBe("");
  const base = new INetURLObject("file:///dir/file");
  expect(SmartRel2Abs(base, "www.example.test/a", null, false)).toBe(
    "file:///dir/www.example.test/a",
  );
  expect(SmartRel2Abs(base, "www.example.test/a")).toBe("http://www.example.test/a");
  let calls = 0;
  expect(
    SmartRel2Abs(
      base,
      "www.example.test/a",
      /** Native callback binds a mutable local string and its boolean result. @param path - Native local path slot. @returns Admit file. */ (
        path,
      ) => {
        calls++;
        expect(path[0]).toBe("www.example.test/a");
        path[0] = "changed";
        return true;
      },
    ),
  ).toBe("file:///dir/www.example.test/a");
  expect(calls).toBe(1);
});
it("retains source decode modes and explicit filesystem-style constraints", /** ToIUri forces UTF8; strict NONE preserves byte spelling and other modes retain charset. @returns Nothing. */ () => {
  expect(decode("%E9%41", D.NONE, LATIN1)).toBe("%E9%41");
  expect(decode("%E9%41", D.WithCharset, LATIN1)).toBe("éA");
  expect(decode("%E9%41", D.ToIUri, LATIN1)).toBe("%E9%41");
  const value = new INetURLObject();
  expect(value.SetSmartURL("C:\\foo", E.WasEncoded, UTF8, FSysStyle.Unix)).toBe(false);
});
it("keeps GetAbsURL default failure fallback separate from SmartRel2Abs", /** Markdown's original strict-relative API has its own failure and fragment contract. @returns Nothing. */ () => {
  expect(INetURLObject.GetAbsURL("", "relative path")).toBe("relative path");
  expect(INetURLObject.GetAbsURL("", "http://user@host")).toBe("http://user@host");
  expect(INetURLObject.GetAbsURL("", "relative path", E.WasEncoded, D.NONE)).toBe("");
  expect(INetURLObject.GetAbsURL("http://host/dir/file", "../%41")).toBe("http://host/%41");
  expect(INetURLObject.GetAbsURL("http://host/dir/file", "?q")).toBe("http://host/dir/?q");
  expect(INetURLObject.GetAbsURL("http://host/dir/file", "#raw%41", E.All, D.NONE)).toBe("#raw%41");
});
