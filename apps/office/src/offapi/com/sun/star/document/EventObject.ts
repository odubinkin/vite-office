/** @fileoverview Original document EventObject IDL field contract only. Generated value construction/copy/destruction and struct metadata remain unported; no runtime event value is synthesized. */
import type { EventObject as LangEventObject } from "../../../../../udkapi/com/sun/star/lang/EventObject";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
/** Original document event derives from the actual language event field contract. */
export interface EventObject extends LangEventObject {
  /** Original owned event-name field contract. */
  EventName: OUString;
}
