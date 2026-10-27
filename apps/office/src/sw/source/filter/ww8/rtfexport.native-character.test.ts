/** @fileoverview Native RTF character items, source value reduction and invisible hint boundaries. */
import { assert, expect, it } from "vitest";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
} from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { SwpHints } from "../../core/txtnode/ndhints";
import { projectWriterTextRuns, type SwTextNode } from "../../core/txtnode/ndtxt";
import { createSwFormatAutoFormat, SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { MakeTextAttr } from "../../core/txtnode/thints";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfAttributeOutput } from "./rtfattributeoutput";
import { RtfExport } from "./rtfexport";

/** Imports native RTF without a UI conversion. @param text - Source fixture. @returns Owned native document. */
function read(text: string): SwDoc {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(text));
}
/** Reads effective auto-kerning at a text offset. @param node - Native owner. @param offset - Character offset. @returns Effective native value. */
function kernAt(node: SwTextNode, offset: number): boolean {
  const auto = node
    .GetpSwpHints()
    ?.entries()
    .find(
      /** Applies find to hint. @param hint - hint value. @returns Callback result. */ (hint) =>
        hint.start <= offset && offset < hint.end && hint.format instanceof SwFormatAutoFormat,
    );
  const items =
    auto?.format instanceof SwFormatAutoFormat ? auto.format.GetStyleHandle() : undefined;
  return (
    (items?.GetItemIfSet(RES_CHRATR_AUTOKERN, false) ??
      node.GetAttr(RES_CHRATR_AUTOKERN)) as SvxAutoKernItem
  ).GetValue();
}

it.each([
  FontWeight.WEIGHT_NORMAL,
  FontWeight.WEIGHT_SEMIBOLD,
  FontWeight.WEIGHT_BOLD,
  FontWeight.WEIGHT_BLACK,
])(
  "uses exact source weight comparison for native weight %s",
  /** Verifies uses exact source weight comparison for native weight %s. @param weight - weight value. @returns Nothing. */ (
    weight,
  ) => {
    const doc = createWriterDocument();
    try {
      const node = doc.paragraphs[0];
      assert(node);
      node.SetAttr(new SvxWeightItem(weight, RES_CHRATR_WEIGHT));
      const output = new RtfAttributeOutput(
        /** Verifies uses exact source weight comparison for native weight %s. @returns Callback result. */ () =>
          0,
        /** Verifies uses exact source weight comparison for native weight %s. @returns Callback result. */ () =>
          0,
        new RtfExport(),
      ).WriteNativeCharacter(node.GetSwAttrSet());
      expect(output).toMatch(weight === FontWeight.WEIGHT_BOLD ? /\\b(?!0)/ : /\\b0/);
    } finally {
      doc.Dispose();
    }
  },
);

it.each([
  FontItalic.ITALIC_NONE,
  FontItalic.ITALIC_NORMAL,
  FontItalic.ITALIC_OBLIQUE,
  FontItalic.ITALIC_DONTKNOW,
])(
  "uses source non-NONE posture comparison for native posture %s",
  /** Verifies uses source non-NONE posture comparison for native posture %s. @param posture - posture value. @returns Nothing. */ (
    posture,
  ) => {
    const doc = createWriterDocument();
    try {
      const node = doc.paragraphs[0];
      assert(node);
      node.SetAttr(new SvxPostureItem(posture, RES_CHRATR_POSTURE));
      const output = new RtfAttributeOutput(
        /** Verifies uses source non-NONE posture comparison for native posture %s. @returns Callback result. */ () =>
          0,
        /** Verifies uses source non-NONE posture comparison for native posture %s. @returns Callback result. */ () =>
          0,
        new RtfExport(),
      ).WriteNativeCharacter(node.GetSwAttrSet());
      expect(output).toMatch(posture === FontItalic.ITALIC_NONE ? /\\i0/ : /\\i(?!0)/);
    } finally {
      doc.Dispose();
    }
  },
);

it("truncates native font height to half points in paragraphs and style definitions", /** Verifies truncates native font height to half points in paragraphs and style definitions. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  let imported: SwDoc | undefined;
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("Odd");
    node.GetTextFormatColl().SetFormatAttr(new SvxFontHeightItem(245, 100, RES_CHRATR_FONTSIZE));
    const bytes = new RtfExport().ExportDocument(doc);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("\\fs24");
    expect(text).not.toContain("\\fs25");
    imported = new RtfDocumentImpl().ResolveBytes(bytes);
    const restored = imported.paragraphs[0];
    assert(restored);
    expect(projectWriterTextRuns(restored)[0]?.attributes.fontSizeTwips).toBe(240);
  } finally {
    imported?.Dispose();
    doc.Dispose();
  }
});

it("retains adjacent native hints that differ only in auto-kerning through RTF and Worker codecs", /** Verifies retains adjacent native hints that differ only in auto-kerning through RTF and Worker codecs. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  let imported: SwDoc | undefined;
  let worker: SwDoc | undefined;
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("AB");
    const hints = new SwpHints(doc.GetAttrPool());
    for (const [start, value] of [
      [0, true],
      [1, false],
    ] as const) {
      const format = createSwFormatAutoFormat(doc.GetAttrPool(), {
        bold: false,
        italic: false,
        underline: false,
      });
      const items = format.GetStyleHandle().Clone();
      items.Put(new SvxAutoKernItem(value, RES_CHRATR_AUTOKERN));
      hints.Insert(MakeTextAttr(doc, items, start, start + 1));
    }
    node.SetTextHints(hints);
    expect(projectWriterTextRuns(node)).toHaveLength(1);
    const bytes = new RtfExport().ExportDocument(doc);
    expect(new TextDecoder().decode(bytes)).toMatch(
      /\\kerning1[^{}]* A\}\{[^{}]*\\kerning0[^{}]* B/,
    );
    imported = new RtfDocumentImpl().ResolveBytes(bytes);
    worker = decodeWriterDocument(encodeWriterDocument(imported));
    for (const restored of [imported, worker]) {
      const paragraph = restored.paragraphs[0];
      assert(paragraph);
      expect(paragraph.GetText()).toBe("AB");
      expect([kernAt(paragraph, 0), kernAt(paragraph, 1)]).toEqual([true, false]);
    }
  } finally {
    worker?.Dispose();
    imported?.Dispose();
    doc.Dispose();
  }
});

it("inherits style auto-kerning and restores group state including plain reset", /** Verifies inherits style auto-kerning and restores group state including plain reset. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0\kerning1 Normal;}}\s0 A{\kerning0 B}C\kerning-12 D{\plain E}F}`,
  );
  let roundtrip: SwDoc | undefined;
  try {
    roundtrip = new RtfDocumentImpl().ResolveBytes(new RtfExport().ExportDocument(doc));
    for (const document of [doc, roundtrip]) {
      const node = document.paragraphs[0];
      assert(node);
      expect(node.GetText()).toBe("ABCDEF");
      expect(
        [...node.GetText()].map(
          /** Verifies inherits style auto-kerning and restores group state including plain reset. @param _ - _ value. @param offset - offset value. @returns Callback result. */ (
            _,
            offset,
          ) => kernAt(node, offset),
        ),
      ).toEqual([true, false, true, true, false, true]);
    }
  } finally {
    roundtrip?.Dispose();
    doc.Dispose();
  }
});

it.each([
  String.raw`{\rtf1\up10\fs40 A}`,
  String.raw`{\rtf1\fs40\up10 A}`,
  String.raw`{\rtf1{\stylesheet{\s0\fs40 Normal;}}\s0\up10 A}`,
])(
  "resolves baseline half points against the final font height: %s",
  /** Verifies resolves baseline half points against the final font height: %s. @param fixture - fixture value. @returns Nothing. */ (
    fixture,
  ) => {
    const doc = read(fixture);
    try {
      const node = doc.paragraphs[0];
      assert(node);
      expect(projectWriterTextRuns(node)[0]?.attributes.escapement?.offset).toBe(25);
    } finally {
      doc.Dispose();
    }
  },
);

it("restores raw baseline position across font-size groups and clears it for superscript", /** Verifies restores raw baseline position across font-size groups and clears it for superscript. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\up10\fs40 A{\fs20 B}C\super D\nosupersub E}`);
  try {
    const node = doc.paragraphs[0];
    assert(node);
    const runs = projectWriterTextRuns(node);
    expect(
      runs.map(
        /** Verifies restores raw baseline position across font-size groups and clears it for superscript. @param run - run value. @returns Callback result. */ (
          run,
        ) => [run.text, run.attributes.escapement?.offset ?? 0],
      ),
    ).toEqual([
      ["A", 25],
      ["B", 50],
      ["C", 25],
      ["D", 33],
      ["E", 0],
    ]);
  } finally {
    doc.Dispose();
  }
});

it("preserves upstream positive paragraph-style position substitution", /** Verifies preserves upstream positive paragraph-style position substitution. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0\up10\fs40 Normal;}}\s0 A}`);
  try {
    const node = doc.paragraphs[0];
    assert(node);
    expect(projectWriterTextRuns(node)[0]?.attributes.escapement).toEqual({
      offset: 14000,
      height: 58,
    });
  } finally {
    doc.Dispose();
  }
});
it("defers negative paragraph-style positions and clamps native baseline offsets", /** Verifies defers negative paragraph-style positions and clamps native baseline offsets. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0\dn10\fs40 Normal;}}\s0 A\up999999 B}`);
  try {
    const node = doc.paragraphs[0];
    assert(node);
    expect(
      projectWriterTextRuns(node).map(
        /** Verifies defers negative paragraph-style positions and clamps native baseline offsets. @param run - run value. @returns Callback result. */ (
          run,
        ) => run.attributes.escapement?.offset,
      ),
    ).toEqual([-25, 13999]);
  } finally {
    doc.Dispose();
  }
});

it.each([
  ["up", 13],
  ["dn", -13],
] as const)(
  "rounds deferred %s half ties away from zero",
  /** Verifies rounds deferred %s half ties away from zero. @param control - control value. @param expected - expected value. @returns Nothing. */ (
    control,
    expected,
  ) => {
    const doc = read(`{\\rtf1\\${control}5\\fs40 A}`);
    try {
      const node = doc.paragraphs[0];
      assert(node);
      expect(projectWriterTextRuns(node)[0]?.attributes.escapement?.offset).toBe(expected);
    } finally {
      doc.Dispose();
    }
  },
);
it("ignores a zero baseline value as the pinned DomainMapper does", /** Verifies ignores a zero baseline value as the pinned DomainMapper does. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\up10\fs40 A\up0 B}`);
  try {
    const node = doc.paragraphs[0];
    assert(node);
    expect(
      projectWriterTextRuns(node).map(
        /** Verifies ignores a zero baseline value as the pinned DomainMapper does. @param run - run value. @returns Callback result. */ (
          run,
        ) => run.attributes.escapement?.offset,
      ),
    ).toEqual([25]);
  } finally {
    doc.Dispose();
  }
});
