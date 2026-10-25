/** @fileoverview Native XML dispatcher cancellation, service acquisition and style/rule failure contracts on actual Writer owners. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXStyle } from "./unostyle";
import { SwXNumberingRules } from "./unosett";
import { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import type {
  XMLTextImportTarget,
  XMLTextListRule,
  XMLListLevelImport,
} from "../../../../xmloff/source/text/txtparai";
import { FillUnoNumRule } from "../../../../xmloff/source/style/xmlnumi";
import { applyNamedParagraphStyles } from "../../../../xmloff/source/style/prstylei";
import { SwXMLTableImport } from "../../filter/xml/xmltbli";
import { importWriterXml } from "../../filter/xml/xmlimp";
import { exportContentXml, exportStylesXml } from "../../filter/xml/xmlexp";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { text } from "./unocrsrhelper";
/** Captures generated native exception values. @param operation - Native call. @returns Thrown value or unexpected result. */
function failure(operation: () => unknown): unknown {
  try {
    return operation();
  } catch (error) {
    return error;
  }
}
/** Constructs an actual dispatcher whose structural declaration lookup is empty. @returns Owned native fixture. */
function fixture() {
  const document = new SwDoc(),
    model = new SwXTextDocument(document),
    cursor = model.getText().createTextCursor();
  const target: XMLTextImportTarget = {
    /** Borrows the actual helper. @returns Helper. */ GetTextImport: () => helper,
    /** Has no list declaration. @returns Undefined. */ getListRule: () => undefined,
    /** Has no common style declaration. @returns Undefined. */ getStyle: () => undefined,
    /** Has no automatic style declaration. @returns Undefined. */ getAutoStyle: () => undefined,
  };
  const helper = new XMLTextImportHelper(target, model);
  return {
    document,
    model,
    cursor,
    helper,
    /** Releases the real dispatcher and model owners. @returns Nothing. */ close() {
      helper.ResetCursor();
      cursor.dispose();
      model.dispose();
      document.Dispose();
    },
  };
}
it("releases pending hint ranges on cancellation and rejects incomplete paragraph or list state", /** Uses the real text model throughout native dispatcher failure handling. @returns Nothing. */ () => {
  const f = fixture();
  try {
    expect(
      failure(/** No cursor has been acquired yet. @returns Cursor. */ () => f.helper.GetCursor()),
    ).toBeInstanceOf(RuntimeException);
    f.helper.SetCursor(f.cursor);
    expect(
      failure(
        /** An unstarted paragraph has no saved start range. @returns Nothing. */ () =>
          f.helper.EndParagraph(),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.helper.InsertString("");
    f.helper.InsertString("plain");
    expect(
      failure(
        /** A list declaration without its native rule service cannot be applied. @returns Nothing. */ () =>
          f.helper.SetStyleAndAttrs(f.cursor, "Standard", {
            level: 0,
            listId: "missing",
            ruleName: "Missing",
          }),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.helper.BeginParagraph(
      "Standard",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );
    f.helper.InsertString("bold", { fontWeight: 150 });
    f.helper.ResetCursor();
    expect(text(f.model.getText().getString())).toBe("plainbold");
  } finally {
    f.close();
  }
});
it("propagates actual insertion host failures after releasing temporary import ranges", /** Observes unexpected service failures without replacing canonical document state. @returns Nothing. */ () => {
  const f = fixture(),
    host = new Error("SAX insertion host failure");
  f.helper.SetCursor(f.cursor);
  const spy = vi.spyOn(f.model.getText(), "insertString").mockImplementationOnce(
    /** Injects one host error. @returns Never. */ () => {
      throw host;
    },
  );
  try {
    expect(
      /** Uses the actual dispatcher. @returns Nothing. */ () => f.helper.InsertString("x"),
    ).toThrow(host);
  } finally {
    spy.mockRestore();
    f.close();
  }
});
it("skips invalid list levels and preserves optional native rule property defaults", /** Covers source fallbacks for adapters that do not publish an explicit numbering type or geometry. @returns Nothing. */ () => {
  const f = fixture(),
    rules = new SwXNumberingRules(f.document);
  const base: XMLListLevelImport = {
    level: 0,
    kind: "numbered",
    prefix: "",
    suffix: ".",
    listFormat: "%1%",
    position: { measureUnit: "mm100", values: {} },
  };
  try {
    FillUnoNumRule(rules, {
      name: "Native",
      levelCount: 10,
      levels: [
        { ...base, level: -1 },
        { ...base, level: 10 },
        base,
        { ...base, level: 1, kind: "bullet" },
      ],
    });
    expect(rules.GetNumRule().Get(0).GetNumberingType()).toBe(4);
    expect(rules.GetNumRule().Get(1).GetNumberingType()).toBe(6);
  } finally {
    rules.release();
    f.close();
  }
});
it("propagates unexpected native parent-link failures rather than swallowing them as UNO conversion errors", /** Exercises common style materialization on actual named format owners. @returns Nothing. */ () => {
  const f = fixture(),
    host = new Error("style host failure"),
    original = SwXStyle.prototype.setParentStyle;
  let calls = 0;
  const spy = vi.spyOn(SwXStyle.prototype, "setParentStyle").mockImplementation(
    /** Observes parent-link stages on the actual style. @param this - Native style. @param name - Native name. @returns Nothing. */ function (
      this: SwXStyle,
      name,
    ) {
      if (++calls === 2) throw host;
      original.call(this, name);
    },
  );
  try {
    expect(
      /** Applies one actual common style declaration. @returns Nothing. */ () =>
        applyNamedParagraphStyles(
          f.model,
          new Map([["Native", { family: "paragraph" }]]),
          undefined,
          /** Has no list alias. @returns Undefined. */ () => undefined,
          /** Has no built-in alias. @returns Undefined. */ () => undefined,
        ),
    ).toThrow(host);
  } finally {
    spy.mockRestore();
    f.close();
  }
});
it("supplies the real import model and default common-list registration during an empty-cell stream", /** Observes public coordinator services through the actual native table SAX callback. @returns Nothing. */ () => {
  const source = new SwDoc(),
    original = SwXMLTableImport.prototype.endTableCell;
  let supplied: SwDoc | undefined;
  const spy = vi.spyOn(SwXMLTableImport.prototype, "endTableCell").mockImplementation(
    /** Borrows the real derived coordinator service without replacing its table owner. @param this - Import coordinator. @returns Nothing. */ function (
      this: SwXMLTableImport,
    ) {
      const services = this as SwXMLTableImport & {
        GetModel(): SwXTextDocument;
        registerListStyle(name: string, rule: XMLTextListRule): void;
      };
      supplied = services.GetModel().GetDoc();
      services.registerListStyle("Extra common", {
        name: "Extra common",
        levelCount: 10,
        levels: [],
      });
      original.call(this);
    },
  );
  try {
    const content = exportContentXml(source).replace(
      /<office:text>[\s\S]*?<\/office:text>/u,
      '<office:text><table:table table:name="Empty"><table:table-column/><table:table-row><table:table-cell/></table:table-row></table:table><text:p>tail</text:p></office:text>',
    );
    const imported = importWriterXml(exportStylesXml(source), content, {
      title: "Empty native cell",
    }).document;
    assert(supplied);
    expect(supplied).toBe(imported);
    expect(imported.FindNumRulePtr("Extra common")).toBeDefined();
    imported.Dispose();
  } finally {
    spy.mockRestore();
    source.Dispose();
  }
});
