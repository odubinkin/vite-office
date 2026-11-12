/** @fileoverview Original published PropertyAttribute.idl short constants, including the deprecated spelling alias. */
/** The property value may be void. */
export const MAYBEVOID = 1;
/** Changes notify bound-property listeners. */
export const BOUND = 2;
/** Changes notify vetoable listeners and imply bound behavior. */
export const CONSTRAINED = 4;
/** The property value is not persistent. */
export const TRANSIENT = 8;
/** The property may be read but cannot be changed. */
export const READONLY = 16;
/** The property value may be ambiguous. */
export const MAYBEAMBIGUOUS = 32;
/** The property may be reset to default. */
export const MAYBEDEFAULT = 64;
/** The property may be removed. */
export const REMOVABLE = 128;
/** Original deprecated spelling alias; retain its exact public identity. */
export const REMOVEABLE = 128;
/** The property is optional in its service specification. */
export const OPTIONAL = 256;
