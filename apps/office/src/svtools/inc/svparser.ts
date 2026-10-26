/** @fileoverview Native parser-state values from include/svtools/svparser.hxx. */
/** Original parser lifecycle values. */
export enum SvParserState {
  /** Completed input. */ Accepted = 0,
  /** Before CallParser. */ NotStarted = 1,
  /** Active parsing. */ Working = 2,
  /** Device input pending. */ Pending = 3,
  /** Parser error. */ Error = 4,
}
