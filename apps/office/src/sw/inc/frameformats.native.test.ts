/** @fileoverview Real special-frame ownership, native identity/name ordering and HTML current-paragraph wrap queries; no substitute frame/registry providers. */
import { RTL_TEXTENCODING_UTF8 } from "../../sal/inc/rtl/textenc";
import { SwClient } from "./calbck";
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../source/core/doc/doc";
import { SwFrameFormat, SwFlyFrameFormat } from "../source/core/layout/atrfrm";
import { FrameFormats } from "./frameformats";
import { SwPosition, SwPaM } from "../source/core/crsr/pam";
import { SwHTMLParser } from "../source/filter/html/swhtml";
import { SvStream } from "../../tools/source/stream/stream";
import { SwFormatAnchor } from "./fmtanchr";
import { SwFormatSurround } from "./fmtsrnd";
import { RndStdIds as R } from "../../svx/inc/swframetypes";
import { WrapTextMode as W } from "../../offapi/com/sun/star/text/WrapTextMode";
import {
  RES_ANCHOR,
  RES_FRMFMT,
  RES_FLYFRMFMT,
  RES_CHRFMT,
  RES_TXTFMTCOLL,
  RES_GRFFMTCOLL,
} from "./hintids";
import { NameChanged } from "./hints";
/** Actual parser/doc/cursor ownership fixture. @returns Native objects and disposal. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  return {
    doc,
    node,
    position,
    parser,
    /** Releases owners in native parser/cursor/document order. @returns Nothing. */
    close() {
      parser.SourceDispose();
      pam.Dispose();
      position.Dispose();
      doc.Dispose();
    },
  };
}
/** Builds a real factory format and copies the native position into its actual item set. @param x - Live fixture. @param wrap - Real wrap. @param type - Real anchor. @param foreign - Use another real document paragraph. @returns Registered original format. */
function fly(x: ReturnType<typeof fixture>, wrap: W, type = R.FLY_AT_PARA, foreign = false) {
  const format = x.doc.MakeFlyFrameFormat("Fly", x.doc.GetDfltFrameFormat());
  const node = foreign ? x.doc.GetNodes().MakeTextNode("other") : x.node;
  const position = new SwPosition(node),
    anchor = new SwFormatAnchor(type);
  anchor.SetAnchor(position);
  format.SetFormatAttr(anchor);
  format.SetFormatAttr(new SwFormatSurround(wrap));
  anchor.Dispose();
  position.Dispose();
  return format;
}
it("preserves original concrete format identities", /** Actual inherited Which reads stored source discriminants. @returns Nothing. */ () => {
  const x = fixture();
  try {
    expect(x.doc.GetDfltFrameFormat().Which()).toBe(RES_FRMFMT);
    expect(x.node.GetTextFormatColl().Which()).toBe(RES_TXTFMTCOLL);
    expect(x.doc.GetDfltCharFormat().Which()).toBe(RES_CHRFMT);
    expect(x.doc.GetDfltGrfFormatColl().Which()).toBe(RES_GRFFMTCOLL);
    expect(x.doc.MakeFlyFrameFormat("Fly", x.doc.GetDfltFrameFormat()).Which()).toBe(RES_FLYFRMFMT);
  } finally {
    x.close();
  }
});
it("factory registers and inherits before native modified notification", /** Call-through notification observation does not supply any format result. @returns Nothing. */ () => {
  const x = fixture(),
    formats = x.doc.GetSpzFrameFormats();
  expect(formats.empty()).toBe(true);
  const seen: SwFrameFormat[] = [];
  const observer = new SwClient(
    /** Observes actual native notification after factory registration. @param source - State owner. @param hint - Actual hint. @returns Nothing. */
    (source, hint) => {
      if (hint.kind !== "document-modified") return;
      expect(source).toBe(x.doc.GetDocumentStateManager());
      const registered = formats.back();
      expect(formats.ContainsFormat(registered)).toBe(true);
      expect(registered.DerivedFrom()).toBe(x.doc.GetDfltFrameFormat());
      seen.push(registered);
    },
  );
  observer.RegisterToModify(x.doc.GetDocumentStateManager());
  const modified = vi.spyOn(x.doc.GetDocumentStateManager(), "SetModified");
  const format = x.doc.MakeFlyFrameFormat("Factory", x.doc.GetDfltFrameFormat());
  try {
    expect(format).toBeInstanceOf(SwFlyFrameFormat);
    expect(formats.GetFormatCount()).toBe(1);
    expect(formats.GetFormat(0)).toBe(format);
    expect(formats.ContainsFormat(format)).toBe(true);
    expect(format.DerivedFrom()).toBe(x.doc.GetDfltFrameFormat());
    expect(modified).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([format]);
    expect(x.doc.GetDocumentStateManager().GetModelRevision()).toBeGreaterThan(0);
  } finally {
    modified.mockRestore();
    observer.Dispose();
    x.close();
  }
});
it("registry keeps distinct same-name pointers and exact erase without destruction", /** Real original objects establish both positional and name/type order. @returns Nothing. */ () => {
  const x = fixture(),
    collection = new FrameFormats<SwFrameFormat>();
  const frame = new SwFrameFormat(x.doc.GetAttrPool(), "Same"),
    other = new SwFrameFormat(x.doc.GetAttrPool(), "Same");
  const special = new SwFlyFrameFormat(x.doc.GetAttrPool(), "Same", undefined);
  const death = vi.spyOn(frame, "DisposeModify");
  try {
    expect(collection.push_back(special)).toEqual([0, true]);
    expect(collection.push_back(frame)).toEqual([1, true]);
    expect(collection.push_back(other)).toEqual([2, true]);
    expect(collection.find(frame)).toBe(1);
    expect(collection.front()).toBe(special);
    expect(collection.back()).toBe(other);
    expect([...collection]).toEqual([special, frame, other]);
    expect(collection.FindFrameFormatByName("Same")).toBe(frame);
    expect(collection.FindFormatByName("Same")).toBe(special);
    expect(collection.findByTypeAndName(RES_FRMFMT, "Same")).toBe(0);
    expect(collection.findByTypeAndName(RES_FLYFRMFMT, "Same")).toBe(2);
    expect(collection.findRangeByName("Same")).toEqual([0, 3]);
    expect(collection.findRangeByName("Missing")).toEqual([0, 0]);
    expect(collection.findByTypeAndName(0, "Same")).toBe(collection.typeAndNameEnd());
    expect(
      /** Exercises the actual assigned-list precondition. @returns Native insertion result if admitted. */
      () => collection.push_back(frame),
    ).toThrow("assigned list");
    expect(collection.erase(frame)).toBe(true);
    expect(collection.ContainsFormat(frame)).toBe(false);
    expect(death).not.toHaveBeenCalled();
    expect(collection.erase(frame)).toBe(false);
    frame.DisposeModify();
  } finally {
    death.mockRestore();
    collection.Dispose();
    x.close();
  }
});
it("registered rename preserves positional order and sends actual old/new names on notifier only", /** Actual collection rename bypasses virtual recursion. @returns Nothing. */ () => {
  const x = fixture(),
    format = fly(x, W.PARALLEL),
    formats = x.doc.GetSpzFrameFormats();
  const notified = vi.spyOn(format.GetNotifier(), "Broadcast"),
    writerClients = vi.spyOn(format, "CallSwClientNotify");
  try {
    format.SetFormatName("Renamed", true);
    expect(formats.GetFormat(0)).toBe(format);
    expect(formats.FindFrameFormatByName("Fly")).toBeUndefined();
    expect(formats.FindFrameFormatByName("Renamed")).toBe(format);
    expect(notified).toHaveBeenCalledExactlyOnceWith(new NameChanged("Fly", "Renamed"));
    expect(writerClients).not.toHaveBeenCalled();
    format.SetFormatName("Silent");
    expect(notified).toHaveBeenCalledTimes(1);
  } finally {
    notified.mockRestore();
    writerClients.mockRestore();
    x.close();
  }
});
it("newDefault preserves original absent membership back-reference and relocates existing identities", /** WRITER346 source default insertion bypasses push_back's back-reference assignment. @returns Nothing. */ () => {
  const x = fixture(),
    collection = new FrameFormats<SwFrameFormat>();
  const first = new SwFrameFormat(x.doc.GetAttrPool(), "First"),
    second = new SwFrameFormat(x.doc.GetAttrPool(), "Second");
  try {
    collection.push_back(first);
    expect(collection.newDefault(second)).toBe(true);
    expect(collection.front()).toBe(second);
    expect(collection.IsAlive(second)).toBe(true);
    expect(collection.ContainsFormat(second)).toBe(false);
    expect(collection.newDefault(first)).toBe(false);
    expect(collection.front()).toBe(first);
    expect(collection.ContainsFormat(first)).toBe(true);
    collection.newDefault(1);
    expect(collection.front()).toBe(second);
  } finally {
    collection.Dispose();
    x.close();
  }
});
it("owning destruction preserves native deletion order, live membership during deletion and keepDefault", /** Call-through destruction spies observe actual ownership. @returns Nothing. */ () => {
  const x = fixture(),
    collection = new FrameFormats<SwFrameFormat>();
  const first = new SwFrameFormat(x.doc.GetAttrPool(), "First"),
    second = new SwFrameFormat(x.doc.GetAttrPool(), "Second");
  collection.push_back(first);
  collection.push_back(second);
  const a = vi.spyOn(first, "DisposeModify"),
    b = vi.spyOn(second, "DisposeModify");
  try {
    collection.DeleteAndDestroyAll(true);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    expect([...collection]).toEqual([first]);
    collection.DeleteAndDestroyAll();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b.mock.invocationCallOrder[0]).toBeLessThan(a.mock.invocationCallOrder[0] as number);
    expect(collection.empty()).toBe(true);
  } finally {
    a.mockRestore();
    b.mockRestore();
    collection.Dispose();
    x.close();
  }
});
it("document destroys factory-owned anchor positions before state teardown", /** Actual owning item-set disposal, not a serialized pointer replacement. @returns Nothing. */ () => {
  const x = fixture(),
    format = fly(x, W.NONE),
    anchor = format.GetAttrSet().Get(RES_ANCHOR) as SwFormatAnchor;
  const position = anchor.GetContentAnchor();
  assert(position);
  const positionDeath = vi.spyOn(position, "Dispose"),
    stateDeath = vi.spyOn(x.doc.GetDocumentStateManager(), "Dispose"),
    registryDeath = vi.spyOn(x.doc.GetSpzFrameFormats(), "DeleteAndDestroyAll");
  x.close();
  expect(positionDeath).toHaveBeenCalledTimes(1);
  expect(positionDeath.mock.invocationCallOrder[0]).toBeLessThan(
    stateDeath.mock.invocationCallOrder[0] as number,
  );
  expect(registryDeath).toHaveBeenCalledTimes(1);
  positionDeath.mockRestore();
  stateDeath.mockRestore();
  registryDeath.mockRestore();
});
it("empty special registry produces no current paragraph fly", /** No query/result provider stands in for actual collection. @returns Nothing. */ () => {
  const x = fixture();
  try {
    expect(x.parser.HasCurrentParaFlys()).toBe(false);
  } finally {
    x.close();
  }
});
it.each([R.FLY_AT_PARA, R.FLY_AT_CHAR])(
  "admits native paragraph/character anchor %s",
  /** Actual eligible anchors live in the document registry. @param type - Native anchor. @returns Nothing. */ (
    type,
  ) => {
    const x = fixture();
    try {
      fly(x, W.PARALLEL, type);
      expect(x.parser.HasCurrentParaFlys()).toBe(true);
    } finally {
      x.close();
    }
  },
);
it.each([R.FLY_AT_PAGE, R.FLY_AS_CHAR])(
  "ignores other source anchor kind %s",
  /** Registry presence alone is insufficient. @param type - Native anchor. @returns Nothing. */ (
    type,
  ) => {
    const x = fixture();
    try {
      fly(x, W.NONE, type);
      expect(x.parser.HasCurrentParaFlys()).toBe(false);
    } finally {
      x.close();
    }
  },
);
it("ignores an eligible anchor at another actual paragraph", /** Uses real separate text-node identity. @returns Nothing. */ () => {
  const x = fixture();
  try {
    fly(x, W.NONE, R.FLY_AT_PARA, true);
    expect(x.parser.HasCurrentParaFlys()).toBe(false);
  } finally {
    x.close();
  }
});
it.each([
  [W.NONE, true, false],
  [W.THROUGH, false, false],
  [W.PARALLEL, false, true],
  [W.LEFT, false, true],
  [W.RIGHT, false, true],
  [W.DYNAMIC, false, true],
])(
  "retains original independent NONE/surround-only semantics for mode %s",
  /** No wrap normalization is applied. @param wrap - Actual mode. @param noWrap - Original NONE result. @param surround - Original wrapping result. @returns Nothing. */ (
    wrap,
    noWrap,
    surround,
  ) => {
    const x = fixture();
    try {
      fly(x, wrap as W);
      expect(x.parser.HasCurrentParaFlys(true)).toBe(noWrap);
      expect(x.parser.HasCurrentParaFlys(false, true)).toBe(surround);
      expect(x.parser.HasCurrentParaFlys()).toBe(true);
    } finally {
      x.close();
    }
  },
);
it.each([
  [W.NONE, W.PARALLEL],
  [W.PARALLEL, W.NONE],
])(
  "NONE defeats surround-only irrespective of position %s/%s",
  /** Original scan continues after a wrapped frame and stops at NONE. @param first - First actual mode. @param second - Second actual mode. @returns Nothing. */ (
    first,
    second,
  ) => {
    const x = fixture();
    try {
      fly(x, first as W);
      fly(x, second as W);
      expect(x.parser.HasCurrentParaFlys(false, true)).toBe(false);
    } finally {
      x.close();
    }
  },
);
it.each([
  [W.PARALLEL, W.NONE, true],
  [W.NONE, W.PARALLEL, true],
  [W.PARALLEL, W.THROUGH, true],
  [W.THROUGH, W.THROUGH, false],
])(
  "preserves simultaneous-flag source order %s/%s",
  /** Both flags are evaluated in source order, without inferring a combined predicate. @param first - First wrap. @param second - Second wrap. @param result - Source result. @returns Nothing. */ (
    first,
    second,
    result,
  ) => {
    const x = fixture();
    try {
      fly(x, first as W);
      fly(x, second as W);
      expect(x.parser.HasCurrentParaFlys(true, true)).toBe(result);
    } finally {
      x.close();
    }
  },
);
