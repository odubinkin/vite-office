/** @fileoverview RTF document import through native Writer paragraph and text hint owners. */
import { expect, it } from "vitest";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

/** Imports one RTF fixture. @param input - RTF source. @returns Writer document. */
function read(input: string) {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
}

it("imports every pinned RTF underline value into the native line-style item", /** Checks keyword to native style dispatch. @returns Nothing. */ () => {
  const cases: readonly [string, FontLineStyle][] = [
    ["ul", FontLineStyle.LINESTYLE_SINGLE],
    ["ulw", FontLineStyle.LINESTYLE_SINGLE],
    ["ulw0", FontLineStyle.LINESTYLE_SINGLE],
    ["uldb", FontLineStyle.LINESTYLE_DOUBLE],
    ["uld", FontLineStyle.LINESTYLE_DOTTED],
    ["uld0", FontLineStyle.LINESTYLE_DOTTED],
    ["uldash", FontLineStyle.LINESTYLE_DASH],
    ["uldashd", FontLineStyle.LINESTYLE_DASHDOT],
    ["uldashdd", FontLineStyle.LINESTYLE_DASHDOTDOT],
    ["ulth", FontLineStyle.LINESTYLE_BOLD],
    ["ulwave", FontLineStyle.LINESTYLE_WAVE],
    ["ulthd", FontLineStyle.LINESTYLE_BOLDDOTTED],
    ["ulthdash", FontLineStyle.LINESTYLE_BOLDDASH],
    ["ulldash", FontLineStyle.LINESTYLE_LONGDASH],
    ["ulthldash", FontLineStyle.LINESTYLE_BOLDLONGDASH],
    ["ulthdashd", FontLineStyle.LINESTYLE_BOLDDASHDOT],
    ["ulthdashdd", FontLineStyle.LINESTYLE_BOLDDASHDOTDOT],
    ["ulhwave", FontLineStyle.LINESTYLE_BOLDWAVE],
    ["ululdbwave", FontLineStyle.LINESTYLE_DOUBLEWAVE],
    ["ulnone", FontLineStyle.LINESTYLE_NONE],
    ["ul0", FontLineStyle.LINESTYLE_NONE],
  ];
  for (const [control, style] of cases) {
    const document = read(`{\\rtf1 \\${control} text}`);
    try {
      const paragraph = document.paragraphs[0];
      if (paragraph === undefined) throw new Error("Missing paragraph.");
      expect(
        projectWriterTextRuns(paragraph)[0]?.attributes.underlineStyle ??
          (projectWriterTextRuns(paragraph)[0]?.attributes.underline
            ? FontLineStyle.LINESTYLE_SINGLE
            : FontLineStyle.LINESTYLE_NONE),
      ).toBe(style);
      if (control === "ulw" || control === "ulw0")
        expect(projectWriterTextRuns(paragraph)[0]?.attributes.underlineWordMode).toBe(true);
    } finally {
      document.Dispose();
    }
  }
});

it("inherits native underline style from the RTF stylesheet and applies direct override", /** Checks source character-style ancestry and group restoration. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1{\stylesheet{\s1\uldb Decorated;}}\s1 inherited {\uldash direct}{\ulnone off} inherited}`,
  );
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    const runs = projectWriterTextRuns(paragraph);
    expect(
      runs.map(
        /** Checks inherits native underline style from the RTF stylesheet and applies direct override. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => [run.text, run.attributes.underlineStyle],
      ),
    ).toEqual([
      ["inherited ", FontLineStyle.LINESTYLE_DOUBLE],
      ["direct", FontLineStyle.LINESTYLE_DASH],
      ["off", FontLineStyle.LINESTYLE_NONE],
      [" inherited", FontLineStyle.LINESTYLE_DOUBLE],
    ]);
    expect(new TextDecoder().decode(new RtfExport().ExportDocument(document))).toContain(
      "\\ulnone\\ulc0 off",
    );
  } finally {
    document.Dispose();
  }
});

it("ignores unknown control words even when they match object prototypes", /** Checks that unknown RTF keywords cannot become style values. @returns Nothing. */ () => {
  const document = read(String.raw`{\rtf1\constructor text}`);
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    expect(projectWriterTextRuns(paragraph)[0]?.attributes.underline).toBe(false);
  } finally {
    document.Dispose();
  }
});

it("retains the pinned RTF reader's unhandled ulhair toggle", /** Checks the registered but unimplemented source control. @returns Nothing. */ () => {
  const document = read(String.raw`{\rtf1\ulhair text}`);
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    expect(projectWriterTextRuns(paragraph)[0]?.attributes.underline).toBe(false);
  } finally {
    document.Dispose();
  }
});

it("imports underline color independently of its line-style keyword", /** Checks ulc table indexing before a native style value. @returns Nothing. */ () => {
  const document = read(String.raw`{\rtf1{\colortbl;\red18\green52\blue86;}\ulc1\uldb colored}`);
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    expect(projectWriterTextRuns(paragraph)[0]?.attributes).toMatchObject({
      underlineStyle: FontLineStyle.LINESTYLE_DOUBLE,
      underlineColor: "#123456",
    });
  } finally {
    document.Dispose();
  }
});

it("inherits RTF underline color from a paragraph style and overrides it locally", /** Checks independent style and direct color-table properties. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1{\colortbl;\red18\green52\blue86;\red51\green34\blue17;}{\stylesheet{\s1\uldb\ulc1 Decorated;}}\s1 inherited {\ulc2 direct} inherited}`,
  );
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    expect(
      projectWriterTextRuns(paragraph).map(
        /** Checks inherits RTF underline color from a paragraph style and overrides it locally. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.attributes.underlineColor,
      ),
    ).toEqual(["#123456", "#332211", "#123456"]);
  } finally {
    document.Dispose();
  }
});

it("decodes ANSI bytes after group and font encoding selection", /** Checks decodes ANSI bytes after group and font encoding selection. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\ansicpg1252{\fonttbl{\f0\fnil Arial;}{\f1\fnil\fcharset204 Times New Roman;}}\f0\'c6{\f1\'c6}\'c6}`,
  );
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("ÆЖÆ");
  } finally {
    document.Dispose();
  }
});

it("uses font code page and Word font-name suffix precedence", /** Checks uses font code page and Word font-name suffix precedence. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\ansicpg1252{\fonttbl{\f0\fnil\cpg1252 Arial Cyr;}{\f1\fnil\cpg1251 Times;}}\f0\'c6\f1\'c6}`,
  );
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("ЖЖ");
    const firstParagraph = document.paragraphs[0];
    expect(firstParagraph).toBeDefined();
    if (firstParagraph !== undefined)
      expect(projectWriterTextRuns(firstParagraph)[0]?.attributes.fontFamily).toBe("Arial");
  } finally {
    document.Dispose();
  }
});

it("restores group code page after local cpg control", /** Checks restores group code page after local cpg control. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi\ansicpg1252\'c6{\cpg1251\'c6}\'c6}`);
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("ÆЖÆ");
  } finally {
    document.Dispose();
  }
});

it("plain restores the default font's encoded text state", /** Checks plain restores the default font's encoded text state. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\ansicpg1252\deff1{\fonttbl{\f0 Arial;}{\f1\fcharset204 Times;}}\f0\'c6\plain\'c6}`,
  );
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("ÆЖ");
  } finally {
    document.Dispose();
  }
});

it("uses pinned SAL IBM 437 and 850 tables for PC and font charsets", /** Checks uses pinned SAL IBM 437 and 850 tables for PC and font charsets. @returns Test completion or assertion result. */ () => {
  const pc = read(String.raw`{\rtf1\pc\'9b}`);
  const pca = read(String.raw`{\rtf1\pca\'9b\'d5}`);
  const fonts = read(
    String.raw`{\rtf1\ansi{\fonttbl{\f0\fcharset254 PC;}{\f1\fcharset255 OEM;}}\f0\'9b\f1\'9b\'d5}`,
  );
  try {
    expect(pc.paragraphs[0]?.GetText()).toBe("¢");
    expect(pca.paragraphs[0]?.GetText()).toBe("ø€");
    expect(fonts.paragraphs[0]?.GetText()).toBe("¢ø€");
  } finally {
    pc.Dispose();
    pca.Dispose();
    fonts.Dispose();
  }
});

it.each([
  [737, "80", "\u0391\u2588\u038F"],
  [775, "80", "\u0106\u2588\u00AD"],
  [852, "80", "\u00C7\u2588\u00AD"],
  [855, "80", "\u0452\u2588\u00AD"],
  [857, "80", "\u00C7\u2588\u00AD"],
  [860, "80", "\u00C7\u2588\u2261"],
  [861, "80", "\u00C7\u2588\u2261"],
  [862, "80", "\u05D0\u2588\u2261"],
  [863, "80", "\u00C7\u2588\u2261"],
  [864, "80", "\u00B0\u00A6\uFE7D"],
  [865, "80", "\u00C7\u2588\u2261"],
  [866, "80", "\u0410\u2588\u0401"],
  [869, "86", "\u0386\u2588\u00AD"],
])(
  "decodes pinned SAL IBM code page %i in RTF text",
  /** Checks decodes pinned SAL IBM code page %i in RTF text. @param codepage - Codepage. @param firstByte - First Byte. @param expected - Expected. @returns Test completion or assertion result. */ (
    codepage,
    firstByte,
    expected,
  ) => {
    const document = read(String.raw`{\rtf1\ansi\ansicpg${codepage}\'${firstByte}\'db\'f0}`);
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      document.Dispose();
    }
  },
);

it.each([
  [20127, "80", "\u20AC"],
  [20866, "a4", "\u2553"],
  [21866, "a4", "\u0454"],
  [28591, "80", "\u0080"],
  [28592, "a1", "\u0104"],
  [28593, "a1", "\u0126"],
  [28594, "c0", "\u0100"],
  [28595, "a1", "\u0401"],
  [28596, "d0", "\u0630"],
  [708, "e1", "\u0641"],
  [28597, "e1", "\u03B1"],
  [28598, "e1", "\u05D1"],
  [28599, "d0", "\u011E"],
  [28605, "a4", "\u20AC"],
])(
  "decodes pinned SAL ASCII, ISO-8859, and KOI8 code page %i",
  /** Checks decodes pinned SAL ASCII, ISO-8859, and KOI8 code page %i. @param codepage - Codepage. @param byte - Byte. @param expected - Expected. @returns Test completion or assertion result. */ (
    codepage,
    byte,
    expected,
  ) => {
    const document = read(String.raw`{\rtf1\ansi\ansicpg${codepage}\'${byte}}`);
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      document.Dispose();
    }
  },
);

it("uses pinned SAL Windows-1252 undefined-byte handling", /** Checks uses pinned SAL Windows-1252 undefined-byte handling. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi A\'81\'80\'8dB}`);
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("A\uF181\u20AC\uF18DB");
  } finally {
    document.Dispose();
  }
});

it("uses native SAL UTF-8 conversion for RTF code page 65001", /** Checks uses native SAL UTF-8 conversion for RTF code page 65001. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\ansicpg65001\'ef\'bb\'bf\'f0\'9f\'98\'80\'e0\'80\'80\'e2}`,
  );
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("\uFEFF😀\uFFFD\uFFFD");
  } finally {
    document.Dispose();
  }
});

it("uses native SAL UTF-7 conversion for RTF code page 65000", /** Checks uses native SAL UTF-7 conversion for RTF code page 65000. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi\ansicpg65000\'41\'2b\'2d\'2b\'41\'4f\'6b\'2d\'5a}`);
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("A+éZ");
  } finally {
    document.Dispose();
  }
});

it("uses pinned ISO-2022-JP and ISO-2022-KR RTF decoders", /** Checks uses pinned ISO-2022-JP and ISO-2022-KR RTF decoders. @returns Test completion or assertion result. */ () => {
  const cases: readonly (readonly [number, string, string])[] = [
    [50220, String.raw`\'1b\'24\'42\'24\'22\'1b\'28\'42`, "あ"],
    [50225, String.raw`\'1b\'24\'29\'43\'0e\'30\'21\'0f`, "가"],
  ];
  for (const [codepage, bytes, expected] of cases) {
    const document = read(String.raw`{\rtf1\ansi\ansicpg${codepage}${bytes}}`);
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      document.Dispose();
    }
  }
});

it("uses the SAL dummy converter for code pages with no registered converter", /** Checks uses the SAL dummy converter for code pages with no registered converter. @returns Test completion or assertion result. */ () => {
  for (const codepage of [10004, 10005, 99999]) {
    const document = read(String.raw`{\rtf1\ansi\ansicpg${codepage}\'41\'db}`);
    try {
      expect(document.paragraphs[0]?.GetText()).toBe("AÛ");
    } finally {
      document.Dispose();
    }
  }
  const fonts = read(
    String.raw`{\rtf1\ansi{\fonttbl{\f0\fcharset84 Arabic;}{\f1\fcharset83 Hebrew;}}\f0\'db\f1\'ff}`,
  );
  try {
    expect(fonts.paragraphs[0]?.GetText()).toBe("Ûÿ");
  } finally {
    fonts.Dispose();
  }
});

it("uses pinned SAL tables for Windows-1250 through 1258 code pages", /** Checks uses pinned SAL tables for Windows-1250 through 1258 code pages. @returns Test completion or assertion result. */ () => {
  const cases: readonly (readonly [number, string, string])[] = [
    [1250, "8c", "Ś"],
    [1251, "c6", "Ж"],
    [1253, "c1", "Α"],
    [1254, "d0", "Ğ"],
    [1255, "e0", "א"],
    [1256, "c7", "ا"],
    [1257, "c0", "Ą"],
    [1258, "d5", "Ơ"],
  ];
  for (const [codepage, byte, expected] of cases) {
    const document = read(`{\\rtf1\\ansi\\ansicpg${codepage}\\'${byte}}`);
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      document.Dispose();
    }
  }
  const undefinedByte = read(String.raw`{\rtf1\ansi\ansicpg1251\'98}`);
  try {
    expect(undefinedByte.paragraphs[0]?.GetText()).toBe("\uF198");
  } finally {
    undefinedByte.Dispose();
  }
});

it("uses pinned SAL Windows-874 Thai and undefined-byte mapping", /** Checks uses pinned SAL Windows-874 Thai and undefined-byte mapping. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi\ansicpg874\'a1\'81}`);
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("ก\uF181");
  } finally {
    document.Dispose();
  }
});

it("uses SAL Symbol and Apple Roman encodings in RTF text", /** Checks uses SAL Symbol and Apple Roman encodings in RTF text. @returns Test completion or assertion result. */ () => {
  const symbol = read(String.raw`{\rtf1\ansi\ansicpg42\'41}`);
  const mac = read(String.raw`{\rtf1\mac\'80\'db\'f0}`);
  const font = read(String.raw`{\rtf1\ansi{\fonttbl{\f0\fcharset77 Geneva;}}\f0\'80}`);
  const symbolFont = read(String.raw`{\rtf1\ansi{\fonttbl{\f0\fcharset2 Symbol;}}\f0\'41}`);
  try {
    expect(symbol.paragraphs[0]?.GetText()).toBe("\uF041");
    expect(mac.paragraphs[0]?.GetText()).toBe("Ä€\uF8FF");
    expect(font.paragraphs[0]?.GetText()).toBe("Ä");
    expect(symbolFont.paragraphs[0]?.GetText()).toBe("\uF041");
  } finally {
    symbol.Dispose();
    mac.Dispose();
    font.Dispose();
    symbolFont.Dispose();
  }
});

it.each([
  [10079, "\u00C4\u00A4\uF8FF"],
  [10029, "\u00C4\u0158\u016B"],
  [10007, "\u0410\u045F\u0440"],
  [10006, "\u00C4\u03AD\u03C0"],
  [10082, "\u00C4\u00A4\u0111"],
  [10010, "\u00C4\u00A4\uF8FF"],
  [10081, "\u00C4\u011F\uF8FF"],
  [10017, "\u0410\u045F\u0440"],
])(
  "decodes pinned SAL Apple code page %i in RTF text",
  /** Checks decodes pinned SAL Apple code page %i in RTF text. @param codepage - Codepage. @param expected - Expected. @returns Test completion or assertion result. */ (
    codepage,
    expected,
  ) => {
    const doc = read(String.raw`{\rtf1\ansi\ansicpg${codepage}\'80\'db\'f0}`);
    try {
      expect(doc.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      doc.Dispose();
    }
  },
);

it("keeps Shift-JIS trailing RTF delimiters inside one encoded character", /** Checks keeps Shift-JIS trailing RTF delimiters inside one encoded character. @returns Test completion or assertion result. */ () => {
  const prefix = new TextEncoder().encode(
    String.raw`{\rtf1\ansi\ansicpg1252{\fonttbl{\f0 Arial;}{\f1\fcharset128 MS Gothic;}}\f1 `,
  );
  const suffix = new TextEncoder().encode("}");
  const document = new RtfDocumentImpl().ResolveBytes(
    Uint8Array.from([...prefix, 0x83, 0x5c, 0x83, 0x7b, 0x83, 0x7d, ...suffix]),
  );
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("ソボマ");
  } finally {
    document.Dispose();
  }
});

it("decodes MS-932 vendor and EUDC bytes through the pinned SAL DBCS tables", /** Checks decodes MS-932 vendor and EUDC bytes through the pinned SAL DBCS tables. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi\ansicpg932\'81\'40\'81\'91\'81\'ad\'f0\'40}`);
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("\u3000\uFFE0\uFFFD\uE000");
  } finally {
    document.Dispose();
  }
});

it.each([
  [936, "81", "40", "f8", "a1", "\u4E02\uE001"],
  [949, "81", "41", "c9", "a1", "\uAC02\uE000"],
  [950, "a1", "40", "fa", "40", "\u3000\uE000"],
  [1361, "84", "44", "d8", "31", "\u3133\uE000"],
])(
  "decodes pinned SAL MS-%i normal and EUDC bytes",
  /** Checks decodes pinned SAL MS-%i normal and EUDC bytes. @param codepage - Codepage. @param lead - Lead. @param trail - Trail. @param eudcLead - Eudc Lead. @param eudcTrail - Eudc Trail. @param expected - Expected. @returns Test completion or assertion result. */ (
    codepage,
    lead,
    trail,
    eudcLead,
    eudcTrail,
    expected,
  ) => {
    const document = read(
      String.raw`{\rtf1\ansi\ansicpg${codepage}\'${lead}\'${trail}\'${eudcLead}\'${eudcTrail}}`,
    );
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      document.Dispose();
    }
  },
);
