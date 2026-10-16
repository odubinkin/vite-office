/** @fileoverview Test-only observations of actual native JS locale APIs; no production LanguageTag substitute. */
/** Native API success or structural input rejection, without a repaired fallback string. */
export type IntlTagResult = { value: string } | { error: "RangeError" };
/** Independent measurements for one unmodified upstream QA input. */
export interface IntlTagObservation {
  input: string;
  locale: IntlTagResult;
  canonical: IntlTagResult;
  minimized: IntlTagResult;
}
/** Runs actual host APIs without repairing inputs or normalizing results. @param inputs - Upstream QA inputs. @returns Separate results for each API. */
export function observeIntlLanguageTags(inputs: readonly string[]): IntlTagObservation[] {
  /** Records unsupported input separately from a successful canonical string. @param read - Actual API call. @returns Value or rejection. */
  const attempt = /** Invokes a native API. @param read - Invocation. @returns Observation. */ (
    read: () => string,
  ): IntlTagResult => {
    try {
      return { value: read() };
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return { error: "RangeError" };
    }
  };
  return inputs.map(
    /** Observes all APIs independently. @param input - Unmodified native QA input. @returns Results. */ (
      input,
    ) => ({
      input,
      locale: attempt(
        /** Calls Locale. @returns Normalized tag. */ () => new Intl.Locale(input).toString(),
      ),
      canonical: attempt(
        /** Calls canonicalization. @returns Normalized tag. */ () =>
          Intl.getCanonicalLocales(input).join(),
      ),
      minimized: attempt(
        /** Calls minimization. @returns Minimized tag. */ () =>
          new Intl.Locale(input).minimize().toString(),
      ),
    }),
  );
}
