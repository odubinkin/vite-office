/** @fileoverview Actual UCB restricted RegexpMap/RTL values in browser main and DOM-free Worker; no URL parser, regex engine or provider is substituted. */
import { Regexp } from "../../apps/office/src/ucb/source/inc/regexp";
import { RegexpMap } from "../../apps/office/src/ucb/source/inc/regexpmap";
import { OUString, OUStringLiteral } from "../../apps/office/src/sal/inc/rtl/ustring";
/** Executes actual value owners and source map precedence. @returns Public scalar observations. */
export function probeNativeUcbRegexp(): {
  size: number;
  file: boolean;
  domain: boolean;
  defaultMatch: boolean;
  defaultFirst: boolean;
  equalityCollision: boolean;
} {
  const owners: { dispose(): void }[] = [];
  /** Retains actual native owners. @param value - Original owner. @returns Same value. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Binds a source UTF16 literal. @param text - Literal text. @returns Owned RTL string. */
  function literal(text: string): OUString {
    return own(
      new OUString(
        new OUStringLiteral(
          Uint16Array.from(
            text.split("").concat("\0"),
            /** Literal code unit. @param unit - Source character. @returns Code unit. */ (unit) =>
              unit.charCodeAt(0),
          ),
        ),
      ),
    );
  }
  const traits = {
    /** Original declared value copy. @param value - Native string. @returns Owned copy. */ copy(
      value: OUString,
    ): OUString {
      return new OUString(value);
    },
    /** Original declared value destruction. @param value - Owned string. @returns Nothing. */ destroy(
      value: OUString,
    ): void {
      value.dispose();
    },
  };
  try {
    const map = own(new RegexpMap(traits));
    map.add(literal(".*"), literal("default"));
    map.add(literal("file"), literal("file"));
    map.add(literal('"http://example.org"([/?#].*)?'), literal("authority"));
    map.add(literal('"http://"[^/?#]+".org"([/?#].*)?'), literal("domain"));
    const first = own(map.begin()),
      a = own(Regexp.parse(literal("[^/?#]*([/?#].*)?"))),
      b = own(Regexp.parse(literal("[^/?#]+([/?#].*)?")));
    const result = {
      size: map.size(),
      file: map.map(literal("FILE:///tmp/document.docx"))?.equals(literal("file")) === true,
      domain: map.map(literal("HTTP://EXAMPLE.org/path"))?.equals(literal("domain")) === true,
      defaultMatch: map.map(literal("unknown"))?.equals(literal("default")) === true,
      defaultFirst: first.operatorArrow().getValue().equals(literal("default")),
      equalityCollision: a.equals(b) && a.matches(literal("")) && !b.matches(literal("")),
    };
    if (
      result.size !== 4 ||
      !result.file ||
      !result.domain ||
      !result.defaultMatch ||
      !result.defaultFirst ||
      !result.equalityCollision
    )
      throw new Error("Native UCB regexp contract failed");
    return result;
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
