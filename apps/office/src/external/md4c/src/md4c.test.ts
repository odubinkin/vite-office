/** @fileoverview Complete compiled md4c 0.5.3 callback-stream differential corpus and public callback-abort contracts. */
import { expect, it } from "vitest";
import fixture from "./native-callbacks.json";
import * as D from "./md4c.h";
import { md_parse } from "./md4c";
/** Captures native callback values by copy, matching a consumer that retains callback data. */
interface Capture {
  events: unknown[];
  logs: string[];
  abortAt: number;
  abortCode: number;
}
/** Serializes source attribute text, byte size and exact substring arrays. @param value - Native attribute. @returns Portable callback data. */
function attr(value: D.MD_ATTRIBUTE): unknown[] {
  return [
    [...value.text.subarray(0, value.size)],
    value.size,
    [...value.substr_types],
    [...value.substr_offsets],
  ];
}
/** Serializes only the native detail fields defined for each block kind. @param type - Native kind. @param detail - Callback detail. @returns Native data. */
function blockDetail(type: D.MD_BLOCKTYPE, detail: D.MD_BLOCK_DETAIL | undefined): unknown[] {
  switch (type) {
    case D.MD_BLOCKTYPE.MD_BLOCK_UL: {
      const d = detail as D.MD_BLOCK_UL_DETAIL;
      return [d.is_tight, d.mark];
    }
    case D.MD_BLOCKTYPE.MD_BLOCK_OL: {
      const d = detail as D.MD_BLOCK_OL_DETAIL;
      return [d.start, d.is_tight, d.mark_delimiter];
    }
    case D.MD_BLOCKTYPE.MD_BLOCK_LI: {
      const d = detail as D.MD_BLOCK_LI_DETAIL;
      return [d.is_task, d.task_mark, d.task_mark_offset];
    }
    case D.MD_BLOCKTYPE.MD_BLOCK_H:
      return [(detail as D.MD_BLOCK_H_DETAIL).level];
    case D.MD_BLOCKTYPE.MD_BLOCK_CODE: {
      const d = detail as D.MD_BLOCK_CODE_DETAIL;
      return [attr(d.info), attr(d.lang), d.fence_char];
    }
    case D.MD_BLOCKTYPE.MD_BLOCK_TABLE: {
      const d = detail as D.MD_BLOCK_TABLE_DETAIL;
      return [d.col_count, d.head_row_count, d.body_row_count];
    }
    case D.MD_BLOCKTYPE.MD_BLOCK_TH:
    case D.MD_BLOCKTYPE.MD_BLOCK_TD:
      return [(detail as D.MD_BLOCK_TD_DETAIL).align];
    default:
      return [];
  }
}
/** Serializes native link/image/wiki callback details. @param type - Kind. @param detail - Source fields. @returns Native data. */
function spanDetail(type: D.MD_SPANTYPE, detail: D.MD_SPAN_DETAIL | undefined): unknown[] {
  if (type === D.MD_SPANTYPE.MD_SPAN_A) {
    const d = detail as D.MD_SPAN_A_DETAIL;
    return [attr(d.href), attr(d.title), d.is_autolink];
  }
  if (type === D.MD_SPANTYPE.MD_SPAN_IMG) {
    const d = detail as D.MD_SPAN_IMG_DETAIL;
    return [attr(d.src), attr(d.title)];
  }
  return type === D.MD_SPANTYPE.MD_SPAN_WIKILINK
    ? [attr((detail as D.MD_SPAN_WIKILINK_DETAIL).target)]
    : [];
}
/** Creates a recording native callback configuration. @param flags - Native parser flags. @returns Source parser. */
function parser(flags: number): D.MD_PARSER<Capture> {
  /** Records one native event and optionally aborts on that same event. @param data - Unchanged userdata. @param event - Portable data. @returns Native callback result. */
  function record(data: Capture, event: unknown): number {
    data.events.push(event);
    return data.events.length === data.abortAt ? data.abortCode : 0;
  }
  return {
    abi_version: 0,
    flags,
    enter_block: (type, detail, data) => record(data, [0, type, blockDetail(type, detail)]),
    leave_block: (type, detail, data) => record(data, [1, type, blockDetail(type, detail)]),
    enter_span: (type, detail, data) => record(data, [2, type, spanDetail(type, detail)]),
    leave_span: (type, detail, data) => record(data, [3, type, spanDetail(type, detail)]),
    text: (type, text, size, data) => record(data, [4, type, [...text.subarray(0, size)]]),
    debug_log: (message, data) => {
      data.logs.push(message);
    },
  };
}
it.each(fixture.cases)(
  "matches the complete compiled md_parse callback stream: $id",
  ({ text, flags, events, result }) => {
    const bytes = new TextEncoder().encode(text),
      capture: Capture = { events: [], logs: [], abortAt: -1, abortCode: 0 };
    expect(md_parse(bytes, bytes.length, parser(flags), capture)).toBe(result);
    expect(capture.events).toEqual(events);
    expect(capture.logs).toEqual([]);
  },
);
it("propagates each callback's original abort code and emits no synthetic closing callbacks", () => {
  const source = "**bold** [link](url)\n\n- [x] task",
    bytes = new TextEncoder().encode(source),
    full: Capture = { events: [], logs: [], abortAt: -1, abortCode: 0 };
  expect(md_parse(bytes, bytes.length, parser(0x2f0c), full)).toBe(0);
  for (let index = 1; index <= full.events.length; index++) {
    const data: Capture = { events: [], logs: [], abortAt: index, abortCode: -37 };
    expect(md_parse(bytes, bytes.length, parser(0x2f0c), data)).toBe(-37);
    expect(data.events).toEqual(full.events.slice(0, index));
    expect(data.logs).toHaveLength(1);
  }
});
it("rejects unsupported ABI before calling any rendering callback", () => {
  const data: Capture = { events: [], logs: [], abortAt: -1, abortCode: 0 },
    config = { ...parser(0), abi_version: 1 };
  expect(md_parse(new Uint8Array(), 0, config, data)).toBe(-1);
  expect(data.events).toEqual([]);
  expect(data.logs).toEqual(["Unsupported abi_version."]);
});
it("copies parser configuration while retaining the original userdata identity", () => {
  const data: Capture = { events: [], logs: [], abortAt: -1, abortCode: 0 },
    config = { ...parser(0) },
    original = config.enter_block;
  config.enter_block = (type, detail, user) => {
    expect(user).toBe(data);
    if (type === D.MD_BLOCKTYPE.MD_BLOCK_DOC) config.flags = D.MD_FLAG_NOHTML;
    return original(type, detail, user);
  };
  const bytes = new TextEncoder().encode("<b>inline</b>");
  expect(md_parse(bytes, bytes.length, config, data)).toBe(0);
  expect(data.events).toContainEqual([0, D.MD_BLOCKTYPE.MD_BLOCK_P, []]);
  expect(data.events).toContainEqual([4, D.MD_TEXTTYPE.MD_TEXT_HTML, [60, 98, 62]]);
});
