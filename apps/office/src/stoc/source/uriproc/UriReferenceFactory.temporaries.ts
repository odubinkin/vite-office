/** @fileoverview Compiler lifetime lowering for the actual OUString full-expression temporaries in original UriReferenceFactory.cxx; no URI state or provider is introduced. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { equalIgnoreEscapeCase } from "./UriReferenceFactory.generic";
/** Borrows exact native UTF16 units. @param value - Actual string. @returns Native view. */
export function view(value: OUStringConstReference): Uint16Array {
  return value.getStr().subarray(0, value.getLength());
}
/** Original known ASCII source literal binding. @param value - Source ASCII literal. @returns Terminated const-char array. */
export function ascii(value: string): Uint8Array {
  return Uint8Array.from(
    value + "\0",
    /** Binds one known source ASCII literal unit. @param unit - Source character. @returns Exact const-char byte. */ (
      unit,
    ) => unit.charCodeAt(0),
  );
}
/** Original known ASCII literal as an actual string value. @param value - Source literal. @returns Owned native text. */
export function literal(value: string): OUString {
  return OUString.createFromAscii(ascii(value));
}
/** Reads a value-returning getter and destroys its temporary at the full-expression boundary. @param value - Actual getter result. @returns Source empty predicate. */
export function empty(value: OUString): boolean {
  try {
    return value.isEmpty();
  } finally {
    value.dispose();
  }
}
/** Compares an actual temporary to its source ASCII literal. @param value - Actual getter result. @param expected - Source literal. @returns Source comparison. */
export function is(value: OUString, expected: string): boolean {
  try {
    const units = view(value);
    if (units.length !== expected.length) return false;
    for (let i = 0; i < units.length; ++i) if (units[i] !== expected.charCodeAt(i)) return false;
    return true;
  } finally {
    value.dispose();
  }
}
/** Original startsWith full-expression. @param value - Actual getter result. @param prefix - Source literal. @returns Source prefix predicate. */
export function starts(value: OUString, prefix: string): boolean {
  try {
    if (value.getLength() < prefix.length) return false;
    for (let i = 0; i < prefix.length; ++i)
      if (value.getStr()[i] !== prefix.charCodeAt(i)) return false;
    return true;
  } finally {
    value.dispose();
  }
}
/** Original two value-returning comparison operands, destroyed in reverse order. @param first - Actual left operand. @param second - Actual right operand. @returns Escape-aware equality. */
export function equal(first: OUString, second: OUString): boolean {
  try {
    return equalIgnoreEscapeCase(view(first), view(second));
  } finally {
    second.dispose();
    first.dispose();
  }
}
/** Original scheme comparison operands. @param first - Actual left operand. @param second - Actual right operand. @returns ASCII-insensitive equality. */
export function sameScheme(first: OUString, second: OUString): boolean {
  try {
    return first.equalsIgnoreAsciiCase(second);
  } finally {
    second.dispose();
    first.dispose();
  }
}
/** Appends one original value-returning expression and consumes its actual temporary. @param buffer - Actual source buffer. @param value - Actual getter result. @param prefix - Optional original literal concat prefix. @returns Nothing. */
export function append(buffer: OUStringBuffer, value: OUString, prefix?: string): void {
  try {
    buffer.append(prefix === undefined ? value : new StringConcat(ascii(prefix), value));
  } finally {
    value.dispose();
  }
}

/** Original OUStringBuffer(scheme + ":") full-expression. @param value - Actual scheme getter temporary. @returns Native initialized buffer. */
export function schemeBuffer(value: OUString): OUStringBuffer {
  try {
    return new OUStringBuffer(new StringConcat(value, ascii(":")));
  } finally {
    value.dispose();
  }
}
/** Original append(scheme + ":") full-expression. @param buffer - Actual native buffer. @param value - Actual scheme getter temporary. @returns Nothing. */
export function appendScheme(buffer: OUStringBuffer, value: OUString): void {
  try {
    buffer.append(new StringConcat(value, ascii(":")));
  } finally {
    value.dispose();
  }
}

/** Original native string/literal comparison without destroying its borrowed operand. @param value - Actual borrowed string. @param expected - Source ASCII literal. @returns Equality. */
export function matches(value: OUStringConstReference, expected: string): boolean {
  if (value.getLength() !== expected.length) return false;
  for (let i = 0; i < expected.length; ++i)
    if (value.getStr()[i] !== expected.charCodeAt(i)) return false;
  return true;
}
/** Compiler lowering of one complete C++ boolean full-expression: its actual string temporaries survive every short-circuit operand and are then destroyed in reverse order. @param body - Original expression over retained native temporaries. @returns Original boolean result. */
export function expression(body: (keep: (value: OUString) => OUString) => boolean): boolean {
  const values: OUString[] = [];
  try {
    return body(
      /** Retains the actual getter result until this expression ends. @param value - Native temporary. @returns Same native value. */ (
        value,
      ) => {
        values.push(value);
        return value;
      },
    );
  } finally {
    for (let i = values.length - 1; i >= 0; --i) (values[i] as OUString).dispose();
  }
}
