/** @fileoverview SAL's original shared Unicode-to-text streaming surrogate context. */

/** Pending native UTF-16 high-surrogate value. */
export interface ImplUnicodeToTextContext {
  m_nHighSurrogate: number;
}

/** Initializes the source context. @returns Independent context. */
export function ImplCreateUnicodeToTextContext(): ImplUnicodeToTextContext {
  return { m_nHighSurrogate: 0 };
}

/** Resets the original pending surrogate field. @param context - Native context or null. @returns Nothing. */
export function ImplResetUnicodeToTextContext(context: ImplUnicodeToTextContext | null): void {
  if (context) context.m_nHighSurrogate = 0;
}
