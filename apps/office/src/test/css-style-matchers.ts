/** @fileoverview Compares absolute CSS values using the computed serialization provided by jsdom. */
import { toHaveStyle as jestDomToHaveStyle } from "@testing-library/jest-dom/matchers";
import { expect, type MatcherState, type SyncMatcherResult } from "vitest";

/** CSS input accepted by the existing DOM style matcher. */
type StyleExpectation = string | Record<string, unknown>;
/** Runtime matcher signature; jest-dom's public declarations describe the bound assertion instead. */
type StyleMatcher = (
  this: MatcherState,
  element: unknown,
  css: StyleExpectation,
) => SyncMatcherResult;
const originalStyleMatcher = jestDomToHaveStyle as unknown as StyleMatcher;

/** Converts a JavaScript style key to its CSS property spelling. @param property - Style key. @returns CSS property name. */
function cssPropertyName(property: string): string {
  return property.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

/** Selects CSS serialization with an absolute value or a known current-font context. @param property - CSS property name. @param value - Expected CSS value. @returns Whether a computed reference value is safe to compare. */
function needsComputedValue(property: string, value: string): boolean {
  if (property.startsWith("--")) return false;
  if (property !== "font-size" && /^[-+]?(?:\d*\.)?\d+em$/iu.test(value)) return true;
  if (property === "line-height" && /^[-+]?(?:\d*\.)?\d+$/u.test(value)) return true;
  if (
    /(?:inherit|unset|initial|revert|currentcolor|var\(|calc\(|\d(?:em|rem|ex|ch|lh|rlh|vw|vh|vmin|vmax|%))/iu.test(
      value,
    )
  ) {
    return false;
  }
  return (
    /[\d.](?:px|pt|pc|in|cm|mm|q)\b/iu.test(value) ||
    property.endsWith("color") ||
    property === "font-family"
  );
}

/** Resolves absolute expected values in a hidden reference element without altering the tested element or its cascade. @param element - Validated DOM element. @param css - Expected style properties. @returns Equivalent expected declarations in the browser's computed notation. */
function computedStyleExpectation(
  element: Element,
  css: Record<string, unknown>,
): Record<string, unknown> {
  const document = element.ownerDocument;
  const reference = document.createElement("div");
  reference.style.setProperty("display", "none", "important");
  const actualFont = document.defaultView?.getComputedStyle(element).fontSize;
  if (actualFont) reference.style.setProperty("font-size", actualFont, "important");
  // A missing border must not normalize a positive expected width to zero.
  reference.style.setProperty("border-style", "solid", "important");
  reference.style.setProperty("outline-style", "solid", "important");
  reference.style.setProperty("column-rule-style", "solid", "important");
  const normalized = { ...css };
  const properties: [string, string][] = [];
  for (const [key, value] of Object.entries(css)) {
    const property = cssPropertyName(key);
    if (typeof value !== "string" || !needsComputedValue(property, value)) continue;
    reference.style.setProperty(property, value, "important");
    if (reference.style.getPropertyValue(property) !== "") properties.push([key, property]);
  }
  if (properties.length === 0) return normalized;
  document.body.append(reference);
  try {
    const computed = document.defaultView?.getComputedStyle(reference);
    for (const [key, property] of properties) {
      const value = computed?.getPropertyValue(property);
      if (value !== undefined && value !== "") normalized[key] = value;
    }
  } finally {
    reference.remove();
  }
  return normalized;
}

/** Keeps DOM validation, negation, cascade checks and diagnostics from jest-dom while normalizing equivalent absolute CSS values. @param element - Assertion subject. @param css - Expected declarations. @returns Original matcher result for the computed expectation. */
function toHaveStyle(
  this: MatcherState,
  element: unknown,
  css: StyleExpectation,
): SyncMatcherResult {
  const result = originalStyleMatcher.call(this, element, css);
  if (result.pass || typeof css === "string") return result;
  // The original matcher has validated the element before this DOM-only normalization.
  const normalized = computedStyleExpectation(element as Element, css);
  return originalStyleMatcher.call(this, element, normalized);
}

expect.extend({ toHaveStyle });

/** Serializes a declared CSS value using the browser boundary without changing native numeric expectations. @param property - CSS property name. @param value - Expected declaration. @returns Canonical inline CSS value. */
export function serializeStyleValue(property: string, value: string): string {
  const style = document.createElement("div").style;
  style.setProperty(property, value);
  return style.getPropertyValue(property);
}

/** Copies read-only computed values for a test-owned platform-font override. @param source - Actual computed style. @returns Independent mutable declaration with all computed properties retained. */
export function copyStyleDeclaration(source: CSSStyleDeclaration): CSSStyleDeclaration {
  const style = document.createElement("div").style;
  for (const property of source) {
    style.setProperty(
      property,
      source.getPropertyValue(property),
      source.getPropertyPriority(property),
    );
  }
  return style;
}
