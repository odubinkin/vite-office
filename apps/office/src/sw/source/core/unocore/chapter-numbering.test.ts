/** @fileoverview Verifies chapter services against literal native assignment, outline identity and history contracts. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwNumRule, SwNumRuleType, SvxNumType } from "../doc/number";
import { SwNumRuleItem } from "../para/paratr";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXNumberingRules } from "./unosett";

it("commits chapter formats into the persistent outline owner and replays native outline undo", /** Verifies identity, propagation, protected explicit numbering and repeated history. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    outline = doc.GetOutlineNumRule(),
    model = new SwXTextDocument(doc);
  try {
    const heading = doc.MakeTextFormatColl("Custom Heading", doc.GetDfltTextFormatColl()),
      protectedStyle = doc.MakeTextFormatColl("Protected", doc.GetDfltTextFormatColl());
    heading.AssignToListLevelOfOutlineStyle(2);
    protectedStyle.AssignToListLevelOfOutlineStyle(4);
    protectedStyle.SetFormatAttr(new SwNumRuleItem("Other"));
    const copy = new SwNumRule(outline),
      format = copy.Get(2).clone();
    format.SetNumberingType(SvxNumType.SVX_NUM_ROMAN_UPPER);
    copy.Set(2, format);
    format.Dispose();
    copy.SetAutoRule(false);
    copy.SetRuleType(SwNumRuleType.NUM_RULE);
    const emptyStyle = doc.MakeTextFormatColl("Empty Outline", doc.GetDfltTextFormatColl());
    emptyStyle.AssignToListLevelOfOutlineStyle(6);
    heading.SetFormatAttr(new SwNumRuleItem("Outline"));
    const node = doc.paragraphs[0];
    node?.ChgFormatColl(heading);
    node?.SetAttrListLevel(5);
    doc.GetUndoManager().Clear();
    doc.SetOutlineNumRule(copy);
    copy.Dispose();
    expect(doc.GetOutlineNumRule()).toBe(outline);
    expect(outline.GetRuleType()).toBe(SwNumRuleType.OUTLINE_RULE);
    expect(outline.IsAutoRule()).toBe(true);
    expect(node?.GetAttrListLevel()).toBe(2);
    expect(heading.GetNumRule().GetValue()).toBe("Outline");
    expect(emptyStyle.GetNumRule().GetValue()).toBe("Outline");
    expect(protectedStyle.GetNumRule().GetValue()).toBe("Other");
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(outline.Get(2).GetNumberingType()).toBe(SvxNumType.SVX_NUM_NUMBER_NONE);
      expect(shell.Redo()).toBe(true);
      expect(outline.Get(2).GetNumberingType()).toBe(SvxNumType.SVX_NUM_ROMAN_UPPER);
      expect(doc.GetOutlineNumRule()).toBe(outline);
    }
    expect(model.getChapterNumberingRules()).toBe(model.getChapterNumberingRules());
  } finally {
    model.dispose();
    session.view.GetWrtShell().Close();
  }
});

it("keeps heading assignment exclusive, clears it for an unknown name and rejects heading properties on ordinary rules", /** Exercises actual style owners rather than a projected heading-name record. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    model = new SwXTextDocument(doc);
  try {
    const first = doc.MakeTextFormatColl("First", doc.GetDfltTextFormatColl()),
      second = doc.MakeTextFormatColl("Second", doc.GetDfltTextFormatColl()),
      child = doc.MakeTextFormatColl("Child", first),
      chapter = model.getChapterNumberingRules();
    first.AssignToListLevelOfOutlineStyle(1);
    chapter.replaceByIndex(1, {
      kind: "numbered",
      suffix: "",
      headingStyleName: "Second",
      numberingType: SvxNumType.SVX_NUM_ARABIC,
    });
    expect(first.IsAssignedToListLevelOfOutlineStyle()).toBe(false);
    expect(second.GetAssignedOutlineStyleLevel()).toBe(1);
    expect(chapter.GetPropertiesByIndex(1).headingStyleName).toBe("Second");
    expect(child.GetAttrOutlineLevel()).toBe(0);
    chapter.replaceByIndex(1, { kind: "numbered", suffix: "", headingStyleName: "Unknown" });
    expect(second.IsAssignedToListLevelOfOutlineStyle()).toBe(false);
    expect(chapter.GetPropertiesByIndex(1).headingStyleName).toBe("Heading 2");
    const rule = new SwNumRule(doc.GetOutlineNumRule()),
      ordinary = new SwXNumberingRules(rule);
    try {
      expect(
        /** Attempts a chapter-only property on an ordinary service. @returns Nothing. */ () =>
          ordinary.replaceByIndex(0, { kind: "numbered", suffix: "", headingStyleName: "First" }),
      ).toThrow();
    } finally {
      ordinary.release();
      rule.Dispose();
    }
  } finally {
    model.dispose();
    session.view.GetWrtShell().Close();
  }
});

it("copies foreign chapter character formats into the destination document", /** Tests source CheckCharFormats ownership without aliasing the donor style. @returns Nothing. */ () => {
  const donor = createWriterDocumentSession(),
    recipient = createWriterDocumentSession(),
    source = donor.docShell.GetDoc(),
    target = recipient.docShell.GetDoc();
  try {
    const style = source.MakeCharFormat("Foreign Label", source.GetDfltCharFormat()),
      rule = new SwNumRule(source.GetOutlineNumRule()),
      format = rule.Get(0).clone();
    format.SetCharFormat(style);
    rule.Set(0, format);
    format.Dispose();
    target.SetOutlineNumRule(rule);
    rule.Dispose();
    const copied = target.GetOutlineNumRule().Get(0).GetCharFormat();
    expect(copied).not.toBe(style);
    expect(copied?.GetDoc()).toBe(target);
    expect(copied?.GetName()).toBe("Foreign Label");
    expect(source.FindCharFormatByName("Foreign Label")).toBe(style);
  } finally {
    recipient.view.GetWrtShell().Close();
    donor.view.GetWrtShell().Close();
  }
});

it("retains upstream outline rename map erasure when assigned from another registered rule", /** Literal Assign then SetName removes the donor-name map entry while its table owner remains. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const donor = doc.EnsureNumRule("Donor", "numbered"),
      outline = doc.GetOutlineNumRule();
    doc.SetOutlineNumRule(donor);
    expect(doc.GetOutlineNumRule()).toBe(outline);
    expect(doc.FindNumRulePtr("Outline")).toBe(outline);
    expect(doc.FindNumRulePtr("Donor")).toBeUndefined();
    expect(doc.GetNumRuleTable()).toContain(donor);
    expect(donor.GetName()).toBe("Donor");
  } finally {
    session.view.GetWrtShell().Close();
  }
});
