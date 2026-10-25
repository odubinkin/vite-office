/** @fileoverview Invalid native text domains, property batch recovery and service lifetime contracts at Writer import boundaries. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXText } from "./unotext";
import { SwXTextCursor } from "./unoobj";
import { SwXTextRange } from "./unoobj2";
import { SwXBookmark } from "./unobkm";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT, RES_PARATR_ORPHANS } from "../../../inc/hintids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { unicode, text, stringValue } from "./unocrsrhelper";

/** Builds canonical text and owns every native argument of one failure scenario. @returns Actual document fixture. */
function fixture() {
  const document = new SwDoc(),
    model = new SwXTextDocument(document),
    body = model.getText(),
    cursor = body.createTextCursor();
  const keys = new Map<string, ReturnType<typeof unicode>>();
  const value = unicode("AB\rCD");
  body.setString(value);
  value.dispose();
  cursor.gotoStart(false);
  return {
    document,
    model,
    body,
    cursor,
    /** Owns one reused native name. @param name - Native name. @returns Native string. */
    key(name: string) {
      let key = keys.get(name);
      if (!key) {
        key = unicode(name);
        keys.set(name, key);
      }
      return key;
    },
    /** Releases scenario arguments and real model owners. @returns Nothing. */
    close() {
      for (const key of keys.values()) key.dispose();
      cursor.dispose();
      model.dispose();
      document.Dispose();
    },
  };
}
/** Captures generated UNO exceptions rather than relying on JavaScript Error inheritance. @param operation - Native call. @returns Thrown value or unexpected result. */
function failure(operation: () => unknown): unknown {
  try {
    return operation();
  } catch (error) {
    return error;
  }
}

it("invalidates model suppliers exactly once and rejects unknown native services", /** Exercises native model acquisition and disposal error boundaries. @returns Nothing. */ () => {
  const f = fixture();
  try {
    expect(
      failure(
        /** Rejects an unsupported service. @returns Service. */ () =>
          f.model.createInstance(f.key("Missing service")),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.model.dispose();
    f.model.dispose();
    expect(
      failure(/** Cannot borrow a disposed model. @returns Document. */ () => f.model.GetDoc()),
    ).toBeInstanceOf(RuntimeException);
  } finally {
    f.close();
  }
});

it("rejects empty text domains and foreign cursor positions while retaining valid native movement", /** Tests actual cursor construction and range-domain guards with two canonical documents. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture();
  const table = f.document.GetNodes().MakeTableNode("Empty domain");
  const empty = new SwXText(f.document, table.GetTableNode());
  const cursor = new SwXTextCursor(f.cursor.GetPaM(), empty);
  const saved = new SwPaM(f.cursor.GetPaM().GetPoint());
  try {
    expect(
      failure(
        /** An empty native text domain has no start node. @returns Range. */ () =>
          empty.getStart(),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** An empty text cannot supply a cursor boundary. @returns Nothing. */ () =>
          cursor.gotoStart(false),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** A cursor outside its text cannot advance. @returns Result. */ () =>
          cursor.goRight(1, false),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** Even a zero-length movement requires a valid text owner. @returns Result. */ () =>
          cursor.goRight(0, false),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.cursor.SetPositions(other.cursor.GetPaM());
    expect(
      failure(
        /** Foreign positions cannot escape through an existing owner. @returns Positions. */ () =>
          f.cursor.GetPaM(),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.cursor.SetPositions(saved);
    const unmarked = new SwXTextRange(saved, f.body, false);
    f.cursor.gotoRange(unmarked, false);
    f.cursor.gotoRange(unmarked, true);
    unmarked.dispose();
    f.cursor.goRight(1, true);
    const expanded = new SwXTextRange(f.cursor.GetPaM(), f.body, false);
    f.cursor.gotoRange(expanded, false);
    const copied = new SwPaM(saved.GetPoint());
    f.cursor.GetPositions(copied);
    expect(copied.HasMark()).toBe(true);
    copied.Dispose();
    expanded.dispose();
    f.cursor.goRight(1, true);
    const right = f.body.getEnd();
    f.cursor.gotoRange(right, true);
    right.dispose();
    f.cursor.gotoStart(false);
    f.cursor.goRight(1, false);
    const left = f.body.getStart();
    f.cursor.gotoRange(left, true);
    left.dispose();
    expect(text(f.cursor.getString())).toBe("A");
    const first = f.document.paragraphs[0];
    assert(first);
    first.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    expect(f.cursor.getPropertyState(f.key("CharWeight"))).toBe(PropertyState.DIRECT_VALUE);
    const tablePosition = new SwPosition(table.GetTableNode(), 0),
      tableRange = new SwPaM(tablePosition);
    f.cursor.SetPositions(tableRange);
    expect(f.cursor.getPropertyState(f.key("CharWeight"))).toBe(PropertyState.DEFAULT_VALUE);
    f.cursor.SetPositions(saved);
    tableRange.Dispose();
    tablePosition.Dispose();
    const line = f.document.GetNodes().AppendTableRow(table, 1),
      box = line.GetTabBoxes()[0];
    assert(box);
    const cell = new SwXText(f.document, box.GetStartNode()),
      cellCursor = cell.createTextCursor();
    const crossing = new SwPaM(saved.GetPoint(), cellCursor.GetPaM().GetPoint());
    const crossRange = new SwXTextRange(crossing, f.body, false);
    try {
      for (const range of [cellCursor, crossRange])
        expect(
          failure(
            /** Rejects a range crossing the body's text domain. @returns Nothing. */ () =>
              f.cursor.gotoRange(range, false),
          ),
        ).toBeInstanceOf(RuntimeException);
    } finally {
      crossRange.dispose();
      crossing.Dispose();
      cellCursor.dispose();
      cell.dispose();
    }
  } finally {
    saved.Dispose();
    cursor.dispose();
    empty.dispose();
    other.close();
    f.close();
  }
});

it("restores direct paragraph items after rejected finish batches and converts unknown paragraph properties to native runtime failure", /** Verifies rollback of the appended node and preservation of the original paragraph owner. @returns Nothing. */ () => {
  const f = fixture();
  const bad = new Any([true], "bool");
  const invalid = new PropertyValue(f.key("CharFontName"), -1, bad, 0),
    unknown = new PropertyValue(f.key("Missing"), -1, bad, 0);
  try {
    const node = f.document.paragraphs[0];
    assert(node);
    node.SetAttr(new SfxInt16Item(RES_PARATR_ORPHANS, 3));
    expect(
      failure(
        /** Rejects a wrongly typed represented paragraph property. @returns Paragraph. */ () =>
          f.body.finishParagraphInsert([invalid], f.cursor),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(f.document.paragraphs).toHaveLength(2);
    for (const input of ["X", ""]) {
      expect(
        failure(
          /** Restores existing direct items after failed portion properties. @returns Range. */ () =>
            f.body.insertTextPortion(f.key(input), [invalid], f.cursor),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
      expect((node.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue()).toBe(3);
    }
    expect((node.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue()).toBe(3);
    expect(
      failure(
        /** Rejects an unknown paragraph property through the native public exception. @returns Paragraph. */ () =>
          f.body.finishParagraphInsert([unknown], f.cursor),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(f.document.paragraphs).toHaveLength(2);
  } finally {
    invalid.Name.dispose();
    invalid.Value.dispose();
    unknown.Name.dispose();
    unknown.Value.dispose();
    bad.dispose();
    f.close();
  }
});

it("propagates unexpected insertion and automatic-style pool failures without replacing their native owners", /** Injects host failures at real service boundaries rather than synthesizing document state. @returns Nothing. */ () => {
  const f = fixture();
  const host = new Error("native host failure");
  const ops = f.document.GetDocumentContentOperationsManager();
  const insertion = vi.spyOn(ops, "InsertString").mockImplementationOnce(
    /** Injects one host failure. @returns Never. */ () => {
      throw host;
    },
  );
  const bold = new Any([150], "float"),
    property = new PropertyValue(f.key("CharWeight"), -1, bold, 0);
  try {
    expect(
      /** Calls the actual public insertion boundary. @returns Range. */ () =>
        f.body.insertTextPortion(f.key("X"), [], f.cursor),
    ).toThrow(host);
    insertion.mockRestore();
    const family = f.model.getAutoStyles().getByName(f.key("CharacterStyles"));
    const put = vi.spyOn(SfxItemSet.prototype, "Put").mockImplementationOnce(
      /** Injects a pool failure. @returns Never. */ () => {
        throw host;
      },
    );
    try {
      expect(
        /** Native automatic style insertion must retain host failure identity. @returns Style. */ () =>
          family.insertStyle([property]),
      ).toThrow(host);
    } finally {
      put.mockRestore();
    }
    expect(text(f.body.getString())).toBe("AB\nCD");
  } finally {
    insertion.mockRestore();
    property.Name.dispose();
    property.Value.dispose();
    bold.dispose();
    f.close();
  }
});

it("rejects rename and anchor queries after the core bookmark owner is deleted", /** Checks descriptor references after canonical mark-manager deletion. @returns Nothing. */ () => {
  const f = fixture(),
    bookmark = new SwXBookmark();
  try {
    f.cursor.goRight(1, true);
    expect(
      failure(
        /** The bounded collapsed-mark owner rejects unported ranged marks. @returns Nothing. */ () =>
          bookmark.attach(f.cursor),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    f.cursor.collapseToStart();
    bookmark.attach(f.cursor);
    f.document.GetIDocumentMarkAccess().DeleteMark("Bookmark");
    expect(
      failure(
        /** A deleted core mark cannot be renamed through a stale descriptor. @returns Nothing. */ () =>
          bookmark.setName(f.key("Renamed")),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** A deleted core mark has no live anchor. @returns Anchor. */ () => bookmark.getAnchor(),
      ),
    ).toBeInstanceOf(RuntimeException);
  } finally {
    bookmark.dispose();
    f.close();
  }
});

it("rejects unknown getters and invalid semantic property batches while ignoring absent native numbering suppliers", /** Exercises original typed property failure boundaries using real cursor owners. @returns Nothing. */ () => {
  const f = fixture();
  const invalid = new Any([10], "sal_Int16"),
    empty = new Any();
  try {
    expect(
      failure(
        /** Unknown properties cannot manufacture values. @returns Value. */ () =>
          f.cursor.getPropertyValue(f.key("Missing")),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** The batch propagates a typed semantic-level failure. @returns Nothing. */ () =>
          f.cursor.setPropertyValues([f.key("NumberingLevel")], [invalid]),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    f.cursor.setPropertyValue(f.key("NumberingRules"), empty);
    const absent = f.cursor.getPropertyValue(f.key("NumberingRules"));
    expect(absent.hasValue()).toBe(false);
    absent.dispose();
    const auto = f.cursor.getPropertyValue(f.key("CharAutoStyleName"));
    expect(stringValue(auto)).toBe("");
    auto.dispose();
  } finally {
    invalid.dispose();
    empty.dispose();
    f.close();
  }
});
