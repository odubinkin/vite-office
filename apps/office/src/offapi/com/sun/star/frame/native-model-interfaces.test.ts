/** @fileoverview Original model/controller/frame/window SDK closure. Tests observe actual CPPU inheritance and cached type ownership, without constructing incomplete UI or model components. */
import { expect, expectTypeOf, it } from "vitest";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { PropertyValue } from "../../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import {
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
  type typelib_InterfaceTypeDescription as I,
} from "../../../../../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../../cppu/inc/typelib/typeclass";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";
import { FrameAction } from "./FrameAction";
import { XModel, getCppuType as getXModel } from "./XModel";
import { XController, getCppuType as getXController } from "./XController";
import { XFrame, getCppuType as getXFrame } from "./XFrame";
import {
  XFrameActionListener,
  getCppuType as getXFrameActionListener,
} from "./XFrameActionListener";
import { XWindow, getCppuType as getXWindow } from "../awt/XWindow";
import { XPaintListener, getCppuType as getXPaintListener } from "../awt/XPaintListener";
import {
  XMouseMotionListener,
  getCppuType as getXMouseMotionListener,
} from "../awt/XMouseMotionListener";
import { XMouseListener, getCppuType as getXMouseListener } from "../awt/XMouseListener";
import { XKeyListener, getCppuType as getXKeyListener } from "../awt/XKeyListener";
import { XFocusListener, getCppuType as getXFocusListener } from "../awt/XFocusListener";
import { XWindowListener, getCppuType as getXWindowListener } from "../awt/XWindowListener";
import { XFramesSupplier, getCppuType as getXFramesSupplier } from "./XFramesSupplier";
import { XFrames, getCppuType as getXFrames } from "./XFrames";
it.each([
  [XModel, getXModel, "com.sun.star.frame.XModel", "com.sun.star.lang.XComponent"],
  [XController, getXController, "com.sun.star.frame.XController", "com.sun.star.lang.XComponent"],
  [XFrame, getXFrame, "com.sun.star.frame.XFrame", "com.sun.star.lang.XComponent"],
  [
    XFrameActionListener,
    getXFrameActionListener,
    "com.sun.star.frame.XFrameActionListener",
    "com.sun.star.lang.XEventListener",
  ],
  [XWindow, getXWindow, "com.sun.star.awt.XWindow", "com.sun.star.lang.XComponent"],
  [
    XPaintListener,
    getXPaintListener,
    "com.sun.star.awt.XPaintListener",
    "com.sun.star.lang.XEventListener",
  ],
  [
    XMouseMotionListener,
    getXMouseMotionListener,
    "com.sun.star.awt.XMouseMotionListener",
    "com.sun.star.lang.XEventListener",
  ],
  [
    XMouseListener,
    getXMouseListener,
    "com.sun.star.awt.XMouseListener",
    "com.sun.star.lang.XEventListener",
  ],
  [
    XKeyListener,
    getXKeyListener,
    "com.sun.star.awt.XKeyListener",
    "com.sun.star.lang.XEventListener",
  ],
  [
    XFocusListener,
    getXFocusListener,
    "com.sun.star.awt.XFocusListener",
    "com.sun.star.lang.XEventListener",
  ],
  [
    XWindowListener,
    getXWindowListener,
    "com.sun.star.awt.XWindowListener",
    "com.sun.star.lang.XEventListener",
  ],
  [
    XFramesSupplier,
    getXFramesSupplier,
    "com.sun.star.frame.XFramesSupplier",
    "com.sun.star.frame.XFrame",
  ],
  [XFrames, getXFrames, "com.sun.star.frame.XFrames", "com.sun.star.container.XIndexAccess"],
] as const)(
  "preserves original normal SDK type and direct base for %s",
  /** Inspects actual acquired descriptors and releases their ownership. @param declaration - Native declaration. @param deprecated - Native Reference overload. @param name - Original fully qualified name. @param baseName - Original direct base. @returns Nothing. */ (
    declaration,
    deprecated,
    name,
    baseName,
  ) => {
    const type = declaration.static_type(),
      description: [D | null] = [null];
    expect(declaration.static_type(null)).toBe(type);
    expect(deprecated()).toBe(type);
    expect(deprecated(null)).toBe(type);
    expect(Number(type.getTypeClass())).toBe(C.INTERFACE);
    type.getDescription(description);
    const iface = description[0] as unknown as I,
      own = type.getTypeName();
    try {
      expect(text(own)).toBe(name);
      expect(iface.aBase.bComplete).toBe(false);
      expect(iface.nBaseTypes).toBe(1);
      const base = (iface.ppBaseTypes as I[])[0] as I,
        baseText = new OUString(base.aBase.pTypeName);
      try {
        expect(text(baseText)).toBe(baseName);
      } finally {
        baseText.dispose();
      }
    } finally {
      own.dispose();
      typelib_typedescription_release(description[0] as D);
    }
  },
);
it("retains complete XModel resource, controller and selection signatures", /** Type-level original method groups do not create an alternate model. @returns Nothing. */ () => {
  expectTypeOf<XModel>().toExtend<XComponent>();
  expectTypeOf<XModel["attachResource"]>().toEqualTypeOf<
    (URL: OUStringConstReference, Arguments: Sequence<PropertyValue>) => boolean
  >();
  expectTypeOf<XModel["getURL"]>().toEqualTypeOf<() => OUString>();
  expectTypeOf<XModel["getArgs"]>().toEqualTypeOf<() => Sequence<PropertyValue>>();
  expectTypeOf<XModel["connectController"]>().toEqualTypeOf<
    (Controller: Reference<XController>) => void
  >();
  expectTypeOf<XModel["disconnectController"]>().toEqualTypeOf<
    (Controller: Reference<XController>) => void
  >();
  expectTypeOf<XModel["lockControllers"]>().toEqualTypeOf<() => void>();
  expectTypeOf<XModel["unlockControllers"]>().toEqualTypeOf<() => void>();
  expectTypeOf<XModel["hasControllersLocked"]>().toEqualTypeOf<() => boolean>();
  expectTypeOf<XModel["getCurrentController"]>().toEqualTypeOf<() => Reference<XController>>();
  expectTypeOf<XModel["setCurrentController"]>().toEqualTypeOf<
    (Controller: Reference<XController>) => void
  >();
  expectTypeOf<XModel["getCurrentSelection"]>().toEqualTypeOf<() => Reference<XInterface>>();
  expectTypeOf<XController>().toExtend<XComponent>();
  expectTypeOf<XController["attachFrame"]>().toEqualTypeOf<(Frame: Reference<XFrame>) => void>();
  expectTypeOf<XController["attachModel"]>().toEqualTypeOf<(Model: Reference<XModel>) => boolean>();
  expectTypeOf<XController["suspend"]>().toEqualTypeOf<(Suspend: boolean) => boolean>();
  expectTypeOf<XController["getViewData"]>().toEqualTypeOf<() => Any>();
  expectTypeOf<XController["restoreViewData"]>().toEqualTypeOf<(Data: Any) => void>();
  expectTypeOf<XController["getModel"]>().toEqualTypeOf<() => Reference<XModel>>();
  expectTypeOf<XController["getFrame"]>().toEqualTypeOf<() => Reference<XFrame>>();
  expectTypeOf<XFrame["setComponent"]>().toEqualTypeOf<
    (window: Reference<XWindow>, controller: Reference<XController>) => boolean
  >();
  expectTypeOf<XFramesSupplier>().toExtend<XFrame>();
  expectTypeOf<XFrames["queryFrames"]>().toEqualTypeOf<
    (flags: number) => Sequence<Reference<XFrame>>
  >();
});
it("retains all native frame lifecycle enumerator values", /** Literal enum values are separate from unported generated enum metadata. @returns Nothing. */ () => {
  expect([
    FrameAction.COMPONENT_ATTACHED,
    FrameAction.COMPONENT_DETACHING,
    FrameAction.COMPONENT_REATTACHED,
    FrameAction.FRAME_ACTIVATED,
    FrameAction.FRAME_DEACTIVATING,
    FrameAction.CONTEXT_CHANGED,
    FrameAction.FRAME_UI_ACTIVATED,
    FrameAction.FRAME_UI_DEACTIVATING,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
});
