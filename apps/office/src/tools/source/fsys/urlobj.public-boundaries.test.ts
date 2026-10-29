/** @fileoverview Source-backed URL authority, fragment and filesystem state-machine boundaries through actual public value APIs. These cases do not claim a compiled native full-object differential. */
import { expect, it } from "vitest";
import { INetURLObject } from "./urlobj.object";
import {
  DecodeMechanism as D,
  EncodeMechanism as E,
  FSysStyle as F,
  INetProtocol as P,
} from "../../inc/urlobj";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../sal/inc/rtl/textenc";

it.each([
  ["vnd.sun.star.help://module/topic?q#f", "vnd.sun.star.help://module/topic?q#f"],
  ["vnd.sun.star.hier://space name/path?q#f", "vnd.sun.star.hier://space%20name/path%3Fq#f"],
  ["vnd.sun.star.help:topic", ""],
  ["vnd.sun.star.pkg:/x", ""],
  ["vnd.libreoffice.cmis:/x", ""],
  ["ldap://:389/x", ""],
  ["smb://:445/x", ""],
] as const)(
  "keeps original special authority admission for %s",
  /** Source help/hierarchy authority differs from ordinary host validation; empty-host LDAP/SMB ports are rejected. @param source - Public URI. @param expected - Canonical spelling or complete invalidation. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const value = new INetURLObject(source);
    expect(value.GetMainURL(D.NONE)).toBe(expected);
    expect(value.HasError()).toBe(expected === "");
  },
);

it.each([
  ["http://host/base", "/a%20b", "http://host/a%20b"],
  ["http://host/dir/base", "//other#f", "http://other/#f"],
  ["http://host/dir/base", "/abs#f", "http://host/abs#f"],
  ["http://host/dir/base", "child#f", "http://host/dir/child#f"],
  ["http://host/dir/base", "../?q", "http://host/?q"],
  ["http://host/dir/base", "..#f", "http://host/#f"],
  ["http://host/dir/base", ".", "http://host/dir/"],
  ["http://host/base", "../../x", "http://host/x"],
  ["ftp://u:p@host:21/base", "child", "ftp://u:p@host:21/child"],
  ["custom:path", "/absolute#f", "custom:/absolute#f"],
  ["custom:path", "#f", "custom:path#f"],
  ["http://host/base", "", "http://host/base"],
] as const)(
  "resolves %s against %s with native authority and fragment timing",
  /** Original AUTH, ABS_PATH, REL_PATH and FRAGMENT transitions preserve the base owner. @param base - Stored reference. @param relative - New reference. @param expected - Source-defined spelling. @returns Nothing. */ (
    base,
    relative,
    expected,
  ) => {
    const owner = new INetURLObject(base),
      absolute: [boolean] = [true];
    const result = owner.smartRel2Abs(relative, absolute, false, E.WasEncoded, UTF8, false, F.Unix);
    expect(result.HasError()).toBe(false);
    expect(result.GetMainURL(D.NONE)).toBe(expected);
    expect(absolute[0]).toBe(false);
    expect(owner.GetMainURL(D.NONE)).toBe(base);
  },
);

it.each([
  ["C:\\x", false, "file:///C:/x", true],
  ["\\\\server", false, "file://server/", true],
  ["\\\\?\\bogus", false, "http://host/%5C%5C?%5Cbogus", false],
  ["folder\\x#f", true, "http://host/folder%5Cx%23f", false],
] as const)(
  "resolves actual DOS/non-URI input %s",
  /** Only admitted filesystem forms set wasAbsolute; non-URI mode encodes fragment delimiters as data. @param relative - Original path. @param nonUri - Filesystem-relative mode. @param expected - Canonical result. @param isAbsolute - Native out parameter. @returns Nothing. */ (
    relative,
    nonUri,
    expected,
    isAbsolute,
  ) => {
    const absolute: [boolean] = [false],
      base = new INetURLObject("http://host/base");
    const result = base.smartRel2Abs(relative, absolute, false, E.WasEncoded, UTF8, nonUri, F.Dos);
    expect(result.GetMainURL(D.NONE)).toBe(expected);
    expect(absolute[0]).toBe(isAbsolute);
    expect(result.HasError()).toBe(false);
  },
);

it.each([
  ["file:foo", F.Vos, P.Http, "file://foo/"],
  ["file://C:foo", F.Vos, P.Http, "file:///C:foo"],
  ["//host?x", F.Unix, P.Http, "http://host/?x"],
  ["\\\\server", F.Dos, P.Http, "file://server/"],
  ["\\\\?\\bogus", F.Dos, P.Http, ""],
  ["server:80", F.Unix, P.Mailto, "server:80"],
  ["file:foo\\bar", F.Unix, P.Http, "file:///foo%5Cbar"],
] as const)(
  "keeps smart inference boundaries for %s",
  /** Source scheme metadata controls whether a colon followed by digits is treated as a port. @param input - Original text. @param style - Filesystem mask. @param protocol - Configured smart scheme. @param expected - Canonical result or rejection. @returns Nothing. */ (
    input,
    style,
    protocol,
    expected,
  ) => {
    const value = new INetURLObject();
    value.SetSmartProtocol(protocol);
    expect(value.SetSmartURL(input, E.WasEncoded, UTF8, style)).toBe(expected !== "");
    expect(value.GetMainURL(D.NONE)).toBe(expected);
    expect(value.HasError()).toBe(expected === "");
  },
);

it.each(["//oth%65r/path", "//[bogus/path"])(
  "rejects relative authority %s after scalar copying",
  /** Native host admission rejects percent-escaped ordinary names and malformed IPv6 references after the relative state machine consumes the authority. @param relative - Invalid network-path reference. @returns Nothing. */ (
    relative,
  ) => {
    const base = new INetURLObject("http://host/base"),
      absolute: [boolean] = [true];
    const result = base.smartRel2Abs(relative, absolute, false, E.WasEncoded, UTF8, false, F.Unix);
    expect(result.HasError()).toBe(true);
    expect(result.GetMainURL(D.NONE)).toBe("");
    expect(absolute[0]).toBe(false);
    expect(base.GetMainURL(D.NONE)).toBe("http://host/base");
  },
);
