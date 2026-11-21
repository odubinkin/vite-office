/** @fileoverview Verifies real Writer annotation field anchors and model-text search. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPostItField, SwPostItFieldType } from "../fields/docufld";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwTextField } from "../../../inc/txtfld";
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_INWORD, RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { SwPaM, SwPosition } from "./pam";
import { FindTextImpl, ReplaceBackReferences } from "./findtxt";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TextSearch } from "../../../../unotools/inc/textsearch";
import { REGEXP } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { GetTextNodeExpandedText } from "../txtnode/ndtxt-hints";

/** Creates a real document point hint with a native annotation field. @param node - Anchor paragraph. @param offset - Native UTF-16 offset. @returns Inserted field hint. */
function annotate(node: SwTextNode, offset: number): SwTextField {
  const field = new SwPostItField(SwPostItFieldType.Get(node.GetDoc()), {
    author: "Ada",
    initials: "A",
    text: "A note",
    name: "comment1",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  const hint = new SwTextField(new SwFormatField(field), offset);
  field.Dispose();
  expect(node.InsertHint(hint)).toBe(true);
  return hint;
}

it("retains the annotation owner through text insertion, paragraph split, and join", /** Exercises actual point hint transfer and field metadata. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcd");
  const hint = annotate(node, 2);
  const item = hint.GetAttr();
  expect(hint.Which()).toBe(RES_TXTATR_ANNOTATION);
  expect(node.GetText()).toBe(`ab${CH_TXTATR_INWORD}cd`);
  expect(GetTextNodeExpandedText(node, 0, node.Len())).toBe("abcd");
  expect(item.GetTextField()).toBe(hint);
  expect(hint.GetTextNode()).toBe(node);
  expect(item.GetField().GetData()).toMatchObject({ name: "comment1", resolved: false });
  expect(item.GetField().GetPar2()).toBe("A note");

  node.InsertText("!", 0);
  expect(hint.GetStart()).toBe(3);
  const position = new SwPosition(node, 2);
  try {
    const tail = doc.GetDocumentContentOperationsManager().SplitNode(position);
    expect(hint.GetTextNode()).toBe(tail);
    expect(tail.GetpSwpHints()?.GetTextAttrForCharAt(1, RES_TXTATR_ANNOTATION)).toBe(hint);
    node.JoinNext();
    expect(hint.GetTextNode()).toBe(node);
    expect(node.GetpSwpHints()?.GetTextAttrForCharAt(3, RES_TXTATR_ANNOTATION)).toBe(hint);
  } finally {
    position.Dispose();
  }
});

it("copies an annotation into the destination document with independent owners", /** Verifies model cloning and marker binding. @returns Nothing. */ () => {
  const origin = new SwDoc();
  const node = origin.paragraphs[0] as SwTextNode;
  node.SetText("abc");
  const hint = annotate(node, 1);
  const target = new SwDoc();
  const copied = node.CloneTo(target.GetNodes());
  const clone = copied.GetpSwpHints()?.GetTextAttrForCharAt(1, RES_TXTATR_ANNOTATION);
  expect(clone?.GetTextNode()).toBe(copied);
  expect(clone?.GetAttr().GetField().GetTyp().GetDoc()).toBe(target);
  expect(clone?.GetAttr().GetField().GetData()).toEqual(hint.GetAttr().GetField().GetData());
  expect(clone?.GetAttr().GetField()).not.toBe(hint.GetAttr().GetField());
});

it.each([false, true])(
  "searches through a comment anchor and also finds an explicitly requested marker, backward=%s",
  /** Covers source marker removal and directional UTF-16 mapping. @param backward - Search direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = new SwDoc();
    const node = doc.paragraphs[0] as SwTextNode;
    node.SetText("abcd");
    annotate(node, 2);
    const start = new SwPosition(node, 0);
    const end = new SwPosition(node, node.Len());
    const region = new SwPaM(end, start);
    const cursor = new SwPaM(start);
    start.Dispose();
    end.Dispose();
    const options = new SearchOptions2();
    try {
      options.searchString.assign(unicode("bc"));
      expect(FindTextImpl(cursor, options, new TextSearch(options), backward, region)).toBe(true);
      expect(cursor.Start().GetContentIndex()).toBe(1);
      expect(cursor.End().GetContentIndex()).toBe(4);
      options.searchString.assign(unicode(CH_TXTATR_INWORD));
      expect(FindTextImpl(cursor, options, new TextSearch(options), backward, region)).toBe(true);
      expect(cursor.Start().GetContentIndex()).toBe(2);
      expect(cursor.End().GetContentIndex()).toBe(3);
    } finally {
      cursor.Dispose();
      region.Dispose();
    }
  },
);

it("keeps the comment marker on the source capture-expansion pass", /** Witnesses both native cleanup policies on the same actual annotation range. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcd");
  annotate(node, 2);
  const start = new SwPosition(node, 0);
  const end = new SwPosition(node, node.Len());
  const region = new SwPaM(end, start);
  const cursor = new SwPaM(start);
  start.Dispose();
  end.Dispose();
  const options = new SearchOptions2();
  options.AlgorithmType2 = REGEXP;
  options.searchString.assign(unicode("(bc)"));
  options.replaceString.assign(unicode("$1"));
  const engine = new TextSearch(options, createBrowserRegexMatcher);
  try {
    expect(FindTextImpl(cursor, options, engine, false, region)).toBe(true);
    expect(ReplaceBackReferences(options, cursor, engine)).toBeUndefined();
  } finally {
    cursor.Dispose();
    region.Dispose();
  }
});
