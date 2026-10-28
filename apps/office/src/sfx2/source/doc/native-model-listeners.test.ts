/** @fileoverview Native model listener registrations and disposing priority through real Reference/container/SDK owners. Full UNO close/dispose and native synchronization remain unverified. */
import { expect, it } from "vitest";
import { SfxBaseModel } from "./sfxbasemodel";
import { ScModelObj } from "../../../sc/inc/docuno";
import { ScDocument } from "../../../sc/inc/document";
import { ScDocShell } from "../../../sc/source/ui/docshell/docsh";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import {
  XEventListener as DocumentListener,
  getCppuType as documentType,
} from "../../../offapi/com/sun/star/document/XEventListener";
import type { EventObject as DocumentEvent } from "../../../offapi/com/sun/star/document/EventObject";
import {
  XModifyListener,
  getCppuType as modifyType,
} from "../../../offapi/com/sun/star/util/XModifyListener";
import { NotInitializedException } from "../../../cppu/inc/com/sun/star/lang/NotInitializedException";
/** Actual caller document listener uses genuine inherited component query/refcount/type machinery. */
class DocumentObserver
  extends WeakImplHelper.specialize(DocumentListener)
  implements DocumentListener
{
  /** Original declared disposing callback. @param event - Borrowed event. @returns Nothing. */ disposing(
    event: Readonly<EventObject>,
  ): void {
    void event;
  }
  /** Original declared document callback. @param event - Borrowed event. @returns Nothing. */ notifyEvent(
    event: Readonly<DocumentEvent>,
  ): void {
    void event;
  }
  /** Native caller observes its actual protected refcount. @returns Count. */ count(): number {
    return this.m_refCount[0] as number;
  }
}
/** Actual caller modify listener retains genuine language-event inheritance. */
class ModifyObserver extends WeakImplHelper.specialize(XModifyListener) implements XModifyListener {
  /** Original declared disposing callback. @param event - Borrowed event. @returns Nothing. */ disposing(
    event: Readonly<EventObject>,
  ): void {
    void event;
  }
  /** Original declared modify callback. @param event - Borrowed event. @returns Nothing. */ modified(
    event: Readonly<EventObject>,
  ): void {
    void event;
  }
  /** Native caller observes its actual protected refcount. @returns Count. */ count(): number {
    return this.m_refCount[0] as number;
  }
}
it("retains real listener registrations and the original three-query disposing priority", /** Conforming document listener's language base prevents the original document removal arm, which must remain unchanged. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    document = new DocumentObserver(),
    dr = new Reference(document),
    modify = new ModifyObserver(),
    mr = new Reference(modify),
    language = new SfxBaseModel(null),
    lr = new Reference(language),
    outsider = new OWeakObject(),
    other = new Reference(outsider),
    de = new EventObject(dr),
    me = new EventObject(mr),
    le = new EventObject(lr),
    oe = new EventObject(other);
  try {
    expect(documentType()).toBe(DocumentListener.static_type());
    expect(documentType(null)).toBe(DocumentListener.static_type(null));
    expect(modifyType()).toBe(XModifyListener.static_type());
    expect(modifyType(null)).toBe(XModifyListener.static_type(null));
    const queried = Reference.query(owner, XEventListener.static_type);
    expect(queried.get()).toBe(model);
    queried.dispose();
    model.addEventListener(dr, DocumentListener);
    expect(document.count()).toBe(3);
    model.disposing(de);
    expect(document.count()).toBe(3);
    model.removeEventListener(dr, DocumentListener);
    expect(document.count()).toBe(2);
    model.addModifyListener(mr);
    expect(modify.count()).toBe(3);
    model.disposing(me);
    expect(modify.count()).toBe(2);
    model.addModifyListener(mr);
    model.removeModifyListener(mr);
    expect(modify.count()).toBe(2);
    model.addEventListener(lr);
    model.addEventListener(lr);
    model.disposing(le);
    model.removeEventListener(lr);
    model.disposing(oe);
    model.Dispose();
    model.disposing(de);
  } finally {
    oe.dispose();
    le.dispose();
    me.dispose();
    de.dispose();
    other.dispose();
    lr.dispose();
    mr.dispose();
    dr.dispose();
    owner.dispose();
    doc.Dispose();
    shell.Dispose();
  }
});
it("preserves original initialization asymmetry between registration and removal", /** Actual options-only model remains uninitialized; no surrogate shell or model provider is installed. @returns Nothing. */ () => {
  const model = new SfxBaseModel(null),
    owner = new Reference(model),
    modify = new ModifyObserver(),
    mr = new Reference(modify),
    document = new DocumentObserver(),
    dr = new Reference(document),
    language = new SfxBaseModel(null),
    lr = new Reference(language);
  try {
    model.addModifyListener(mr);
    model.addEventListener(dr, DocumentListener);
    model.addEventListener(lr);
    model.removeEventListener(lr);
    for (const remove of [
      /** Original fully-alive modify removal. @returns Nothing. */ () =>
        model.removeModifyListener(mr),
      /** Original fully-alive document removal. @returns Nothing. */ () =>
        model.removeEventListener(dr, DocumentListener),
    ]) {
      let caught = false;
      try {
        remove();
      } catch (error) {
        caught = true;
        expect(error).toBeInstanceOf(NotInitializedException);
        (error as NotInitializedException).dispose();
      }
      expect(caught).toBe(true);
    }
    expect(modify.count()).toBe(2);
    expect(document.count()).toBe(2);
    model.Dispose();
    expect(modify.count()).toBe(1);
    expect(document.count()).toBe(1);
  } finally {
    lr.dispose();
    dr.dispose();
    mr.dispose();
    owner.dispose();
  }
});
