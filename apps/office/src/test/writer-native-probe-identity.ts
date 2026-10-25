/** @fileoverview Binds recorded attribute labels in existing extracted-native probe protocols to current real WhichIds. Golden operation/value/results remain unchanged; native numeric identity is independently checked against hintids.hxx. No core API accepts these probe labels. */
import {
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
} from "../sw/inc/hintids";

const labels = new Map<number, number>([
  [73, RES_PARATR_NUMRULE],
  [80, RES_PARATR_OUTLINELEVEL],
  [83, RES_PARATR_LIST_ID],
  [84, RES_PARATR_LIST_LEVEL],
  [85, RES_PARATR_LIST_ISRESTART],
  [86, RES_PARATR_LIST_RESTARTVALUE],
  [87, RES_PARATR_LIST_ISCOUNTED],
]);
const identities = new Map<number, number>(
  [...labels].map(
    /** Reverses the recorded label, without changing attribute values. @param entry - Label and identity. @returns Identity and label. */ ([
      label,
      identity,
    ]) => [identity, label],
  ),
);

/** Resolves an existing probe protocol label; other labels and sentinel0 are unchanged. @param label - Recorded label. @returns Actual native identity. */
export function nativeProbeWhich(label: number): number {
  return labels.get(label) ?? label;
}
/** Projects an actual native item into the existing probe result protocol. @param which - Native identity. @returns Recorded symbolic label. */
export function nativeProbeLabel(which: number): number {
  return identities.get(which) ?? which;
}
