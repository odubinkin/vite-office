/** @fileoverview Actual shared font control,source script selection,native attributes,history and ODS. */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { CalcFormattingToolbar } from "./CalcFormattingToolbar";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { ScAddress } from "../../inc/address";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScPatternAttr } from "../../inc/patattr";
import { ScInputMode } from "../../inc/global";
import { setConfiguredSystemUILanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";

it("dispatches the actual shared family selector through Calc and real attribute history", /** Dispatches the actual shared family selector through Calc and real attribute history. @returns Operation result. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  try {
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Font Name" });
    expect(select).toBeEnabled();
    act(
      /** Publishes the native UI operation inside React. @returns Operation result. */ () =>
        fireEvent.change(select, { target: { value: "Liberation Mono" } }),
    );
    fireEvent.keyDown(select, { key: "Enter" });
    expect(c.GetFontFamily()).toBe("Liberation Mono");
    expect(
      (doc.GetPattern(new ScAddress(0, 0, 0))?.GetItem(100) as SvxFontItem).GetFamilyName(),
    ).toBe("Liberation Mono");
    act(
      /** Publishes the native UI operation inside React. @returns Operation result. */ () => {
        c.Undo();
      },
    );
    expect(c.GetFontFamily()).not.toBe("Liberation Mono");
    act(
      /** Publishes the native UI operation inside React. @returns Operation result. */ () => {
        c.Redo();
      },
    );
    expect(c.GetFontFamily()).toBe("Liberation Mono");
    expect(c.SetFontFamily(new SvxFontItem(0, "Liberation Mono", "", 0, 0, 10007))).toBe(true);
    const loaded = await readOdsDocument(writeOdsDocument(doc));
    expect(
      (loaded.GetPattern(new ScAddress(0, 0, 0))?.GetItem(100) as SvxFontItem).GetFamilyName(),
    ).toBe("Liberation Mono");
  } finally {
    s.Close();
  }
});

it("paints independent script fonts for mixed UTF16 text", /** Paints independent script fonts for mixed UTF16 text. @returns Operation result. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  try {
    setConfiguredSystemUILanguage(0x409);
    const value = unicode("Latin漢عربي😀");
    doc.SetTextCell(new ScAddress(0, 0, 0), value);
    value.dispose();
    const weak = unicode("😀");
    doc.SetTextCell(new ScAddress(1, 0, 0), weak);
    weak.dispose();
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    for (const [which, name] of [
      [100, "Latin Face"],
      [111, "Asian Face"],
      [116, "Complex Face"],
    ] as const)
      pattern.ItemSetPut(new SvxFontItem(0, name, "", 0, 0, which));
    doc.ApplyPatternAreaTab(0, 0, 1, 0, 0, pattern);
    pattern.Dispose();
    const painted = render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    expect(screen.getByText("Latin")).toHaveStyle({ fontFamily: "Latin Face" });
    expect(screen.getByText("漢")).toHaveStyle({ fontFamily: "Asian Face" });
    expect(screen.getByText("عربي😀")).toHaveStyle({ fontFamily: "Complex Face" });
    expect(screen.getByText("😀")).toHaveStyle({ fontFamily: "Latin Face" });
    setConfiguredSystemUILanguage(0x411);
    painted.rerender(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    expect(screen.getByText("😀")).toHaveStyle({ fontFamily: "Asian Face" });
    expect(c.GetFontFamily()).toBeUndefined();
  } finally {
    setConfiguredSystemUILanguage(LANGUAGE_SYSTEM);
    s.Close();
  }
});

it("uses the office script for weak/empty cells and source range scripts for grouped full axes", /** Uses the office script for weak/empty cells and source range scripts for grouped full axes. @returns Operation result. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  const font = new SvxFontItem(0, "Selected Face", "", 0, 0, 10007);
  try {
    for (const [language, which] of [
      [0x411, 111],
      [0x401, 116],
      [0x409, 100],
    ]) {
      setConfiguredSystemUILanguage(language as number);
      c.Select(0, which as number);
      expect(c.SetFontFamily(font)).toBe(true);
      expect(
        (
          doc
            .GetPattern(new ScAddress(0, which as number, 0))
            ?.GetItem(which as number) as SvxFontItem
        ).GetFamilyName(),
      ).toBe("Selected Face");
    }
    c.Select(0, 0);
    c.StartInput(ScInputMode.SC_INPUT_TABLE, "漢");
    expect(c.SetFontFamily(font)).toBe(true);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    expect(c.SetFontFamily(font)).toBe(false);
    c.Cancel();
    expect(
      /** Exercises the invalid request boundary. @returns Operation result. */ () =>
        c.SetFontFamily("Bad" as unknown as SvxFontItem),
    ).toThrow(/SvxFontItem/);
    const dispatcher = s.frame.GetDispatcher();
    expect(dispatcher.Execute(".uno:CharFontName")).toMatchObject({
      status: "executed",
      value: false,
    });
    for (const args of [null, {}, { fontFamily: "Name" }])
      expect(
        /** Exercises the invalid request boundary. @returns Operation result. */ () =>
          dispatcher.Execute(".uno:CharFontName", args),
      ).toThrow(/SvxFontItem/);
    c.InsertSheet();
    c.SelectAllTables();
    c.Select(0, 0);
    c.MarkRows();
    expect(c.SetFontFamily(font)).toBe(true);
    for (const tab of [0, 1])
      expect(
        (
          doc.GetPattern(new ScAddress(doc.MaxCol(), 0, tab))?.GetItem(100) as SvxFontItem
        ).GetFamilyName(),
      ).toBe("Selected Face");
    c.Select(3, 0);
    c.MarkColumns();
    expect(c.SetFontFamily(font)).toBe(true);
    expect(
      (
        doc.GetPattern(new ScAddress(3, doc.MaxRow(), 0))?.GetItem(100) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Selected Face");
  } finally {
    setConfiguredSystemUILanguage(LANGUAGE_SYSTEM);
    s.Close();
  }
});

it("updates only source-selected scripts and retains every field through ODS and undo", /** Updates only source-selected scripts and retains every field through ODS and undo. @returns Operation result. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  const font = new SvxFontItem(
    FontFamily.FAMILY_DECORATIVE,
    "Native Symbols",
    "Display",
    FontPitch.PITCH_FIXED,
    RTL_TEXTENCODING_SYMBOL,
    10007,
  );
  try {
    for (const [text, which] of [
      ["Latin", 100],
      ["漢字", 111],
      ["العربية", 116],
    ] as const) {
      const value = unicode(text);
      doc.SetTextCell(new ScAddress(0, 0, 0), value);
      value.dispose();
      const old = [100, 111, 116].map(
        /** Projects the represented native value. @param id - Original callback input. @returns Operation result. */ (
          id,
        ) => (doc.GetPattern(new ScAddress(0, 0, 0))?.GetItem(id) as SvxFontItem).Clone(),
      );
      expect(c.SetFontFamily(font)).toBe(true);
      for (const id of [100, 111, 116]) {
        const actual = doc.GetPattern(new ScAddress(0, 0, 0))?.GetItem(id) as SvxFontItem;
        expect(actual.QueryValue()).toEqual(
          (id === which ? font : (old[[100, 111, 116].indexOf(id)] as SvxFontItem)).QueryValue(),
        );
      }
      const loaded = await readOdsDocument(writeOdsDocument(doc));
      expect(
        (loaded.GetPattern(new ScAddress(0, 0, 0))?.GetItem(which) as SvxFontItem).QueryValue(),
      ).toEqual(font.QueryValue());
      c.Undo();
      expect(
        (doc.GetPattern(new ScAddress(0, 0, 0))?.GetItem(which) as SvxFontItem).QueryValue(),
      ).toEqual((old[[100, 111, 116].indexOf(which)] as SvxFontItem).QueryValue());
    }
  } finally {
    s.Close();
  }
});

it("accepts a font from the standalone formatting surface without a grid focus callback", /** The optional focus port must preserve native dispatch when embedded independently. @returns Nothing. */ () => {
  const session = createCalcSession();
  const mounted = render(
    <CalcFormattingToolbar
      objectShell={session.controller.shell}
      commandSource={createBrowserCommandSource(session.frame)}
      resolveArguments={
        /** Uses the same empty base arguments as the production workbench. @returns No base arguments. */ () =>
          undefined
      }
    />,
  );
  try {
    const font = screen.getByRole("combobox", { name: "Font Name" });
    fireEvent.change(font, { target: { value: "Liberation Mono" } });
    fireEvent.keyDown(font, { key: "Enter" });
    expect(session.controller.GetFontFamily()).toBe("Liberation Mono");
  } finally {
    mounted.unmount();
    session.Close();
  }
});
