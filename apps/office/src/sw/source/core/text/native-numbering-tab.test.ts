/** @fileoverview Checks native strict-after-label tab vectors without upstream execution. */
import { expect, it } from "vitest";
import { SvxTabAdjust } from "../../../../editeng/source/items/paraitem";
import { resolveSwNumberingTabPosition, type SwNumberingTabSettings } from "./txttab";
const base: SwNumberingTabSettings = {
  defaultDistance: 1134,
  relativeToIndent: true,
  tabCompat: true,
  tabAtLeftIndent: false,
  stops: [],
};
const vectors = [
  {
    name: "normal hanging bullet retains authored list tab",
    end: 470,
    indent: 720,
    tab: 720,
    expected: 720,
  },
  { name: "occupied bullet passes collapsed tab", end: 850, indent: 720, tab: 720, expected: 1854 },
  { name: "equal edge exhausts tab strictly", end: 720, indent: 720, tab: 720, expected: 1854 },
  {
    name: "next explicit left stop precedes default",
    end: 850,
    indent: 720,
    tab: 720,
    expected: 1080,
    stops: [{ position: 360, adjustment: SvxTabAdjust.Left }],
  },
  {
    name: "authored explicit stop in hanging indent remains",
    end: 470,
    indent: 720,
    tab: 720,
    expected: 620,
    stops: [{ position: -100, adjustment: SvxTabAdjust.Left }],
  },
  {
    name: "earlier default removed by native list-tab insertion",
    end: 470,
    indent: 720,
    tab: 1080,
    expected: 1080,
    stops: [{ position: 0, adjustment: SvxTabAdjust.Default }],
  },
  {
    name: "native hanging fallback applies before another explicit tab",
    end: 470,
    indent: 720,
    tab: 1080,
    expected: 720,
    stops: [{ position: 100, adjustment: SvxTabAdjust.Left }],
  },
  {
    name: "compatibility permits hanging margin before list tab",
    end: 470,
    indent: 720,
    tab: 1080,
    expected: 720,
    tabAtLeftIndent: true,
  },
  {
    name: "default stop beyond exhausted list tab retained",
    end: 850,
    indent: 720,
    tab: 720,
    expected: 1080,
    stops: [{ position: 360, adjustment: SvxTabAdjust.Default }],
  },
  {
    name: "absolute origin defaults from frame rather than indent",
    end: 850,
    indent: 720,
    tab: 720,
    expected: 1134,
    relativeToIndent: false,
  },
  {
    name: "noncompat default minimum is 51 twips",
    end: 1090,
    indent: 0,
    tab: 0,
    expected: 2268,
    tabCompat: false,
  },
  {
    name: "noncompat exact 50 twips advances again",
    end: 1084,
    indent: 0,
    tab: 0,
    expected: 2268,
    tabCompat: false,
  },
  {
    name: "noncompat 51 twips keeps next stop",
    end: 1083,
    indent: 0,
    tab: 0,
    expected: 1134,
    tabCompat: false,
  },
  { name: "compat allows narrow default gap", end: 1090, indent: 0, tab: 0, expected: 1134 },
  {
    name: "zero spacing uses native one-twip floor",
    end: 850,
    indent: 0,
    tab: 0,
    expected: 851,
    defaultDistance: 0,
  },
  {
    name: "negative spacing uses native one-twip floor",
    end: 850,
    indent: 0,
    tab: 0,
    expected: 851,
    defaultDistance: -1,
  },
  {
    name: "negative search truncates towards zero",
    end: -500,
    indent: -1000,
    tab: -720,
    expected: 0,
    relativeToIndent: false,
  },
  {
    name: "negative default quotient remains negative",
    end: -1500,
    indent: -2000,
    tab: -1600,
    expected: -1134,
    relativeToIndent: false,
  },
  {
    name: "absolute default stop handles negative search",
    end: -500,
    indent: -1000,
    tab: -720,
    expected: 0,
    relativeToIndent: false,
    stops: [{ position: 1134, adjustment: SvxTabAdjust.Default }],
  },
  {
    name: "absolute zero default removed",
    end: -500,
    indent: -1000,
    tab: -720,
    expected: 360,
    relativeToIndent: false,
    stops: [
      { position: 0, adjustment: SvxTabAdjust.Default },
      { position: 360, adjustment: SvxTabAdjust.Left },
    ],
  },
  {
    name: "same-position stop replaced by native list tab",
    end: 470,
    indent: 720,
    tab: 720,
    expected: 720,
    stops: [{ position: 0, adjustment: SvxTabAdjust.Right }],
  },
  {
    name: "zero current position still advances default",
    end: 0,
    indent: 0,
    tab: -720,
    expected: 1134,
  },
  {
    name: "absolute default hanging fallback reaches left margin",
    end: -500,
    indent: 720,
    tab: -720,
    expected: 720,
    relativeToIndent: false,
    stops: [{ position: 1134, adjustment: SvxTabAdjust.Default }],
  },
];
for (const vector of vectors)
  it(
    vector.name,
    /** Checks independent literal source-contract vectors and immutable inputs. @returns Nothing. */ () => {
      const settings = Object.freeze({
        ...base,
        ...vector,
        stops: Object.freeze(vector.stops ?? []),
      });
      const before = JSON.stringify(settings);
      expect(resolveSwNumberingTabPosition(vector.end, vector.indent, vector.tab, settings)).toBe(
        vector.expected,
      );
      expect(JSON.stringify(settings)).toBe(before);
    },
  );
