/** @fileoverview Portable regressions against unchanged ICU78.3 BytesTrie native observations. */
import { describe as suite, expect, it } from "vitest";
import observations from "./bytestrie.native-observations.json";
import { BytesTrie } from "./unicode/bytestrie";
import { USTRINGTRIE_HAS_VALUE } from "./unicode/ustringtrie";
/** Encodes counted bytes in the native observation protocol. @param bytes - Narrow units. @returns Hex or empty sentinel. */
function hex(bytes: readonly number[]) {
  return (
    bytes
      .map(
        /** Encodes one unit. @param b - Byte. @returns Hex. */ (b) =>
          b.toString(16).padStart(2, "0"),
      )
      .join("") || "-"
  );
}
/** Observes source-valid public state without stopped-pointer subtraction. @param trie - Reader. @returns Native protocol scalars. */
function describe(trie: BytesTrie) {
  const r = trie.current(),
    value = USTRINGTRIE_HAS_VALUE(r) ? trie.getValue() : 77,
    unique: [number] = [999],
    has = trie.hasUniqueValue(unique);
  let next = "";
  const n = trie.getNextBytes({
    /** Appends source continuation bytes. @param s - Span. @returns Nothing. */
    Append(s) {
      next += s;
    },
  });
  return [
    r,
    value,
    Number(has),
    unique[0],
    n,
    hex(
      Array.from(
        next,
        /** Projects invariant/narrow bytes. @param c - Unit. @returns Byte. */ (c) =>
          c.charCodeAt(0),
      ),
    ),
    r === 0 ? "-" : String(trie.getState64()),
  ];
}
/** Replays original public overloads, copy and state protocol. @param data - Serialized native fixture. @param bytes - Query. @param mode - Operation. @param split - Prefix split. @param extra - Signed byte. @returns Nothing. */
function replay(data: Uint8Array, bytes: Uint8Array, mode: number, split = 0, extra = 0) {
  const t = new BytesTrie(data);
  let r = 1;
  const row = [];
  if (mode === 0) {
    for (const b of bytes) r = t.next(b);
  } else if (mode === 1) r = t.next(bytes, bytes.length);
  else if (mode === 2) r = t.next(Uint8Array.from([...bytes, 0]), -1);
  else if (mode === 3) {
    r = t.next(bytes, split);
    const saved = new BytesTrie.State();
    t.saveState(saved);
    const copy = new BytesTrie(t);
    if (r !== 0) {
      const state = t.getState64();
      t.first(extra);
      t.resetToState64(state);
    } else t.first(extra);
    t.resetToState(saved);
    r = t.next(bytes.subarray(split), bytes.length - split);
    row.push(copy.next(bytes.subarray(split), bytes.length - split));
  } else if (mode === 4) {
    t.next(bytes, bytes.length);
    r = t.next(extra);
  } else if (mode === 5) {
    t.next(bytes, bytes.length);
    r = t.first(extra);
  } else if (mode === 6) {
    t.next(bytes, bytes.length);
    t.resetToState(new BytesTrie.State());
    const other = new BytesTrie(data.subarray(1)),
      different = new BytesTrie.State();
    other.saveState(different);
    t.resetToState(different);
    r = t.current();
  } else {
    t.next(bytes, bytes.length);
    t.reset();
    r = t.current();
  }
  return [...row, r, ...describe(t)].join(" ");
}

suite(
  "native serialized trie observations",
  /** Checks unchanged native observations. @returns Nothing. */ () => {
    it("keeps a null-storage binding stopped across reset and saved-state attempts", /** Checks the binding's explicit null constructor without dereferencing serialized storage. @returns Nothing. */ () => {
      const empty = new BytesTrie(null),
        saved = new BytesTrie.State();
      expect(empty.current()).toBe(0);
      expect(empty.reset().current()).toBe(0);
      empty.saveState(saved);
      expect(new BytesTrie(empty).resetToState(saved).current()).toBe(0);
    });
    const fixtures = new Map(
      Object.entries(observations.fixtures).map(
        /** Decodes builder-owned bytes. @param entry - Fixture ID and hex. @returns Borrowed storage pair. */ ([
          id,
          value,
        ]) => [
          Number(id),
          Uint8Array.from(
            value.match(/../g) ?? [],
            /** Decodes one native unit. @param byte - Hex. @returns Byte. */ (byte) =>
              Number.parseInt(byte, 16),
          ),
        ],
      ),
    );
    it.each(observations.cases)(
      "matches original reader query %s",
      /** Replays an independently observed native result. @param query - Native wire operands. @param expected - Native output. @returns Nothing. */ (
        query,
        expected,
      ) => {
        const [id, mode, split, extra, encoded] = query.split(" ") as [
          string,
          string,
          string,
          string,
          string,
        ];
        const bytes =
          encoded === "-"
            ? new Uint8Array()
            : Uint8Array.from(
                encoded.match(/../g) ?? [],
                /** Decodes native input. @param byte - Hex. @returns Unit. */ (byte) =>
                  Number.parseInt(byte, 16),
              );
        const data = fixtures.get(Number(id));
        if (!data) throw new Error("Missing native builder fixture " + id);
        expect(replay(data, bytes, Number(mode), Number(split), Number(extra))).toBe(expected);
      },
    );
  },
);
