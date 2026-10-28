/** @fileoverview Original INetURLObject host observations cover IPv4/IPv6 and DNS state transitions, bounded UTF16 ranges and cursor preservation on failure. */
import { expect, it } from "vitest";
import observations from "./host.native-observations.json";
import { observeUrlHost } from "../../../test/url-host-observer";

it.each([0, 1])(
  "matches independently compiled original host parser with initial pointer offset %i",
  /** Both complete and internally bounded buffers retain actual pointer/output semantics; expected values are only native output. @param offset - Native pointer start. @returns Nothing. */ (
    offset,
  ) => {
    const rows = observations.cases.filter(
      /** Selects the original range variant without dropping grammar inputs. @param row - Input/output pair. @returns Whether selected. */ (
        row,
      ) => Number((row[0] as string).split(" ")[1]) === offset,
    );
    expect(rows.length).toBe(3055);
    for (const [query, expected] of rows)
      expect(observeUrlHost(query as string), query).toBe(expected);
  },
);
