/** @fileoverview Original Excel error-code bytes consumed by XML cached formula results; other BIFF constants remain unported. */
/** Original NULL intersection error. */
export const EXC_ERR_NULL = 0x00;
/** Original division-by-zero error. */
export const EXC_ERR_DIV0 = 0x07;
/** Original value/type error. */
export const EXC_ERR_VALUE = 0x0f;
/** Original invalid reference error. */
export const EXC_ERR_REF = 0x17;
/** Original name error. */
export const EXC_ERR_NAME = 0x1d;
/** Original numerical error. */
export const EXC_ERR_NUM = 0x24;
/** Original unavailable result. */
export const EXC_ERR_NA = 0x2a;
/** Original spill result byte; XML later maps it to VALUE. */
export const EXC_ERR_SPILL = 0x2b;
