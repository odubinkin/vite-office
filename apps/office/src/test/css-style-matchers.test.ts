/** @fileoverview Verifies computed CSS equivalence without accepting incorrect styles or ignoring the cascade. */
import { afterEach, expect, it } from "vitest";
import { copyStyleDeclaration, serializeStyleValue } from "./css-style-matchers";

afterEach(
  /** Removes test-owned reference markup. @returns Nothing. */ () => {
    document.body.replaceChildren();
  },
);

/** Mounts a styled element so jsdom computes its CSS values. @param css - Inline declarations. @returns Connected test element. */
function fixture(css: string): HTMLDivElement {
  const element = document.createElement("div");
  element.style.cssText = css;
  document.body.append(element);
  return element;
}

it("compares equivalent point sizes and logical margins using actual computed CSS", /** Checks the new CSSOM's pixel notation without changing native point declarations. @returns Nothing. */ () => {
  const element = fixture("font-size:10pt; margin-inline-start:18pt; line-height:14pt");
  expect(getComputedStyle(element).fontSize).toBe("13.3333px");
  expect(element).toHaveStyle({ fontSize: "10pt", marginInlineStart: "18pt", lineHeight: "14pt" });
  expect(element.style.fontSize).toBe("10pt");
  expect(element).not.toHaveStyle({ fontSize: "11pt" });
  expect(element).not.toHaveStyle({ marginInlineStart: "19pt" });
});

it("normalizes border widths, named colors and font-family serialization", /** Checks compound properties and rejects incorrect values. @returns Nothing. */ () => {
  const element = fixture("border-top:2pt solid red; color:red; font-family:Latin Face");
  expect(element).toHaveStyle({
    borderTop: "2pt solid red",
    color: "red",
    fontFamily: "Latin Face",
  });
  expect(element).not.toHaveStyle({ borderTop: "3pt solid red" });
  expect(element).not.toHaveStyle({ color: "blue" });
  const absent = fixture("border-top-style:none; border-top-width:0");
  expect(absent).not.toHaveStyle({ borderTopWidth: "2pt" });
});

it("retains stylesheet priority and does not leave reference elements in the document", /** Ensures normalization cannot make an overridden inline declaration pass. @returns Nothing. */ () => {
  const stylesheet = document.createElement("style");
  stylesheet.textContent = ".important-size { font-size:11pt !important; }";
  document.body.append(stylesheet);
  const element = fixture("font-size:10pt");
  element.className = "important-size";
  const before = document.body.innerHTML;
  expect(element).toHaveStyle({ fontSize: "11pt" });
  expect(element).not.toHaveStyle({ fontSize: "10pt" });
  expect(document.body.innerHTML).toBe(before);
});

it("retains invalid-subject errors and unchanged string and relative-value checks", /** Preserves the original matcher's validation and negative assertions. @returns Nothing. */ () => {
  const element = fixture("display:block; font-size:32px");
  const parent = document.createElement("div");
  parent.style.fontSize = "20px";
  parent.append(element);
  document.body.append(parent);
  expect(element).toHaveStyle("display: block");
  expect(element).not.toHaveStyle({ fontSize: "2em" });
  expect(element).not.toHaveStyle("display: none");
  expect(
    /** Triggers the original DOM subject validation. @returns Nothing. */ () => {
      expect(null).toHaveStyle({ fontSize: "10pt" });
    },
  ).toThrow();
});

it("compares font-relative spacing and unitless line heights without accepting wrong ratios", /** Resolves em against the actual current font and retains negative comparisons. @returns Nothing. */ () => {
  const element = fixture("font-size:20px; margin-inline-end:0.25em; line-height:1");
  expect(element).toHaveStyle({ marginInlineEnd: "0.25em", lineHeight: "1" });
  expect(element).not.toHaveStyle({ marginInlineEnd: "0.5em" });
  expect(element).not.toHaveStyle({ lineHeight: "2" });
});

it("preserves native numeric inputs while comparing CSSOM serialization", /** Keeps exact input numbers separate from the browser's presentation precision. @returns Nothing. */ () => {
  const element = fixture("left:143165696px; width:33.333333333333336%");
  expect(element.style.left).toBe(serializeStyleValue("left", "143165696px"));
  expect(element.style.width).toBe(serializeStyleValue("width", "33.333333333333336%"));
});

it("copies computed styles without mutating the read-only browser result", /** Supplies a mutable test font port while retaining genuine unrelated computed values. @returns Nothing. */ () => {
  const element = fixture("font-size:10pt; color:red");
  const computed = getComputedStyle(element);
  const copy = copyStyleDeclaration(computed);
  copy.fontSize = "32px";
  expect(copy.fontSize).toBe("32px");
  expect(copy.color).toBe(computed.color);
  expect(Number.parseFloat(computed.fontSize)).toBeCloseTo(40 / 3, 3);
});
