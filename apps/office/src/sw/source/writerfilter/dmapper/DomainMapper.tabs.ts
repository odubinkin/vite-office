/** @fileoverview Original DomainMapper paragraph tab SPRMs and style inheritance. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { TabAlign } from "../../../../offapi/com/sun/star/style/TabAlign";
import {
  TabStop,
  cppu_detail_getUnoType_TabStop as stopType,
} from "../../../../offapi/com/sun/star/style/TabStop";
import {
  resolveReturnedReference,
  type Id,
  type Properties,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { PropertyIds as P } from "./PropertyIds";
import type { PropertyMap } from "./PropertyMap";

const Stops = Sequence.specialize<Pick<TabStop, "get">>(stopType, 12);
const alignments = new Map<number, TabAlign>([
  [N.LN_Value_ST_TabJc_center, TabAlign.CENTER],
  [N.LN_Value_ST_TabJc_end, TabAlign.RIGHT],
  [N.LN_Value_ST_TabJc_right, TabAlign.RIGHT],
  [N.LN_Value_ST_TabJc_decimal, TabAlign.DECIMAL],
]);
const leaders = new Map<number, number>([
  [N.LN_Value_ST_TabTlc_dot, 46],
  [N.LN_Value_ST_TabTlc_hyphen, 45],
  [N.LN_Value_ST_TabTlc_underscore, 95],
  [N.LN_Value_ST_TabTlc_heavy, 95],
  [N.LN_Value_ST_TabTlc_middleDot, 183],
]);

/** Original DeletableTabStop with the same fill default as ODF. */
class DeletableTabStop extends TabStop {
  bDeleted = false;
  /** Initializes an empty tab mutation with the source blank fill. @returns Tab stop. */
  constructor() {
    super(0, TabAlign.LEFT, 0, 32);
  }
}

/** Owns the inherited and direct stop vectors for one tab list. */
class ParagraphTabs implements Properties {
  private current = new DeletableTabStop();
  private readonly stops: TabStop[] = [];

  /** Copies the inherited native sequence before applying direct mutations. @param inherited - Borrowed style property. @returns Receiver. */
  constructor(inherited: Any) {
    const sequence = new Stops();
    try {
      if (!inherited.extract(sequence.getAddress(), ["Sequence", stopType])) return;
      for (let i = 0; i < sequence.getLength(); i++) {
        const fields = sequence.operatorIndex(i);
        this.stops.push(
          new TabStop(fields.get(0)[0], fields.get(4)[0], fields.get(8)[0], fields.get(10)[0]),
        );
      }
    } finally {
      sequence.dispose();
    }
  }

  /** Receives one of the native tab-stop attributes. @param id - Resource ID. @param value - Parsed value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const token = value.getInt();
    if (id === N.LN_CT_TabStop_val) {
      this.current.bDeleted = token === N.LN_Value_ST_TabJc_clear;
      if (!this.current.bDeleted) this.current.Alignment = alignments.get(token) ?? TabAlign.LEFT;
    } else if (id === N.LN_CT_TabStop_leader) this.current.FillChar = leaders.get(token) ?? 32;
    else if (id === N.LN_CT_TabStop_pos) this.current.Position = convertTwipToMm100_Limited(token);
  }

  /** Incorporates a direct stop by position and resets the original per-stop state. @param modifier - Tab child. @returns Nothing. */
  sprm(modifier: Sprm): void {
    if (modifier.getId() !== N.LN_CT_Tabs_tab) return;
    resolveReturnedReference(modifier.getProps(), this);
    const stop = this.current;
    const index = this.stops.findIndex(
      /** Matches inherited and direct positions in their native UNO units. @param previous - Existing stop. @returns Whether the position matches. */
      (previous) => previous.Position === stop.Position,
    );
    if (index < 0) {
      if (!stop.bDeleted) this.stops.push(stop);
    } else if (stop.bDeleted) this.stops.splice(index, 1);
    else this.stops[index] = stop;
    this.current = new DeletableTabStop();
  }

  /** Stores the original ordered UNO sequence in the paragraph property context. @param context - Actual property map. @returns Nothing. */
  Insert(context: PropertyMap): void {
    const sequence = new Stops(this.stops.length);
    try {
      for (let i = 0; i < this.stops.length; i++) {
        const source = this.stops[i] as TabStop;
        const target = sequence.operatorIndex(i);
        for (const offset of [0, 4, 8, 10] as const) target.get(offset)[0] = source.get(offset)[0];
      }
      const value = new Any(sequence.getAddress(), ["Sequence", stopType]);
      try {
        context.Insert(P.PROP_PARA_TAB_STOPS, value);
      } finally {
        value.dispose();
      }
    } finally {
      sequence.dispose();
    }
  }
}

/** Resolves one native paragraph tab list through the active style and context. @param mapper - Original mapper state. @param context - Target paragraph properties. @param modifier - Tabs resource. @param isRtf - Original RTF mode. @returns Nothing. */
export function ResolveParagraphTabs(
  mapper: DomainMapper_Impl,
  context: PropertyMap,
  modifier: Sprm,
  isRtf: boolean,
): void {
  const inherited = isRtf ? new Any() : mapper.GetPropertyFromParaStyleSheet(P.PROP_PARA_TAB_STOPS);
  try {
    const tabs = new ParagraphTabs(inherited);
    resolveReturnedReference(modifier.getProps(), tabs);
    tabs.Insert(context);
  } finally {
    inherited.dispose();
  }
}
