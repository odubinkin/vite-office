/** @fileoverview Actual UCB environment/sink ownership, query contracts and qadevOOo _XActiveDataSink method bodies; no broker, context or stream service is substituted. */
import { afterEach, expect, it } from "vitest";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { XInteractionHandler } from "../../../udkapi/com/sun/star/task/XInteractionHandler";
import { XInteractionRequest } from "../../../udkapi/com/sun/star/task/XInteractionRequest";
import { XInteractionContinuation } from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import { XProgressHandler } from "../../../offapi/com/sun/star/ucb/XProgressHandler";
import {
  SAXParseException,
  cppu_detail_getUnoType as parseType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { XCommandEnvironment } from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import { XDocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/XDocumentBuilder";
import { own, api, releaseDomScope } from "../../../test/native-dom";
import {
  SimpleInteractionRequest,
  ContinuationFlags as F,
} from "../provider/simpleinteractionrequest";
import { CommandEnvironment } from "./commandenvironment";
import { ActiveDataSink } from "./activedatasink";
afterEach(releaseDomScope);

/** Complete user interaction observer on the original extension point; chooses a genuine offered continuation. */
class Interaction
  extends WeakImplHelper.specialize(XInteractionHandler)
  implements XInteractionHandler
{
  /** Holds only the external destruction trace. @param trace - Observer storage. @returns Actual user handler. */
  constructor(private readonly trace: string[]) {
    super();
  }
  /** Handles the actual request via its complete public interface. @param request - Actual request. @returns Nothing. */
  handle(request: Reference<XInteractionRequest>): void {
    const continuations = api(request).getContinuations();
    try {
      if (continuations.getLength()) {
        const address = (continuations.getConstArray() as SequenceElements).get(0) as [
            XInteractionContinuation | null,
          ],
          choice = new Reference(address[0]);
        try {
          choice.get()?.select();
        } finally {
          choice.dispose();
        }
      }
    } finally {
      continuations.dispose();
    }
  }
  /** Observes actual logical component destruction. @returns Nothing. */
  protected override destroy(): void {
    this.trace.push("interaction");
    super.destroy();
  }
}
/** Complete user progress component keeps a real Any activity stack. */
class Progress extends WeakImplHelper.specialize(XProgressHandler) implements XProgressHandler {
  private readonly activities: Any[] = [];
  /** Holds only the external destruction trace. @param trace - Observer storage. @returns Actual user handler. */
  constructor(private readonly trace: string[]) {
    super();
  }
  /** Original extension-point push with an independently owned status. @param status - Borrowed value. @returns Nothing. */
  push(status: Readonly<Any>): void {
    this.activities.push(new Any(status.pData, status.pType));
  }
  /** Updates the actual current activity. @param status - Borrowed value. @returns Nothing. */
  update(status: Readonly<Any>): void {
    const current = this.activities[this.activities.length - 1];
    if (current) current.setValue(status.pData, status.getValueType());
  }
  /** Finishes the current activity. @returns Nothing. */
  pop(): void {
    this.activities.pop()?.dispose();
  }
  /** Releases real member owners, then observes component destruction. @returns Nothing. */
  protected override destroy(): void {
    while (this.activities.length) this.pop();
    this.trace.push("progress");
    super.destroy();
  }
}

it("retains source empty environment defaults and advertises only its real interface", /** No handler/service fallback is manufactured. @returns Nothing. */ () => {
  const emptyI = own(new Reference<XInteractionHandler>()),
    emptyP = own(new Reference<XProgressHandler>()),
    ref = own(new Reference(new CommandEnvironment(emptyI, emptyP))),
    facet = own(
      new Reference<XCommandEnvironment>(ref, UNO_QUERY_THROW, XCommandEnvironment.static_type),
    );
  expect(own(api(facet).getInteractionHandler()).is()).toBe(false);
  expect(own(api(facet).getProgressHandler()).is()).toBe(false);
  expect(own(new Reference(ref, UNO_QUERY, XDocumentBuilder.static_type)).is()).toBe(false);
});

it("copies handlers and getter returns independently of the environment lifetime", /** Genuine callbacks operate on actual requests and payloads. @returns Nothing. */ () => {
  const trace: string[] = [],
    interaction = own(new Reference<XInteractionHandler>(new Interaction(trace))),
    progress = own(new Reference<XProgressHandler>(new Progress(trace))),
    iPointer = interaction.get(),
    pPointer = progress.get(),
    weakI = own(new WeakReferenceHelper(interaction)),
    weakP = own(new WeakReferenceHelper(progress)),
    environment = own(new Reference(new CommandEnvironment(interaction, progress)));
  interaction.clear();
  progress.clear();
  const returnedI = own(api(environment).getInteractionHandler()),
    returnedP = own(api(environment).getProgressHandler());
  expect(returnedI.get()).toBe(iPointer);
  expect(returnedP.get()).toBe(pPointer);
  const request = own(
    new Reference(
      new SimpleInteractionRequest(own(new Any(own(new SAXParseException()), parseType)), F.Retry),
    ),
  );
  api(returnedI).handle(request);
  expect(api(request).getResponse()).toBe(F.Retry);
  const status = own(new Any(true));
  api(returnedP).push(status);
  api(returnedP).update(status);
  api(returnedP).pop();
  environment.clear();
  expect(trace).toEqual([]);
  returnedP.clear();
  expect(trace).toEqual(["progress"]);
  expect(own(weakP.get()).is()).toBe(false);
  returnedI.clear();
  expect(trace).toEqual(["progress", "interaction"]);
  expect(own(weakI.get()).is()).toBe(false);
});

it("ports qadevOOo _XActiveDataSink setter/getter bodies with a genuine stream relation", /** The interface method checks retain their source order. @returns Nothing. */ () => {
  const bytes = new Uint8Array([1, 2]),
    input = own(new Reference<XInputStream>(new MemoryInputStream(bytes, bytes.length))),
    sink = own(new Reference(new ActiveDataSink())),
    facet = own(new Reference<XActiveDataSink>(sink, UNO_QUERY_THROW, XActiveDataSink.static_type));
  api(facet).setInputStream(input);
  const old = own(api(facet).getInputStream()),
    empty = own(new Reference<XInputStream>()),
    next = old.is() ? empty : input;
  api(facet).setInputStream(next);
  expect(own(api(facet).getInputStream()).get()).not.toBe(old.get());
  expect(api(old).available()).toBe(2);
});

it("keeps acquired sink outputs alive across replacement and sink destruction without closing them", /** Stream release follows actual Reference ownership rather than an implicit close policy. @returns Nothing. */ () => {
  const bytes = new Uint8Array([1]),
    input = own(new Reference<XInputStream>(new MemoryInputStream(bytes, 1))),
    weak = own(new WeakReferenceHelper(input)),
    sink = own(new Reference(new ActiveDataSink()));
  expect(own(api(sink).getInputStream()).is()).toBe(false);
  api(sink).setInputStream(input);
  input.clear();
  const output = own(api(sink).getInputStream());
  sink.clear();
  expect(api(output).available()).toBe(1);
  output.clear();
  expect(own(weak.get()).is()).toBe(false);
});

it("destroys the private progress reference before the interaction reference", /** Actual final component releases expose source member order without hidden getter copies. @returns Nothing. */ () => {
  const trace: string[] = [],
    interaction = own(new Reference<XInteractionHandler>(new Interaction(trace))),
    progress = own(new Reference<XProgressHandler>(new Progress(trace))),
    environment = own(new Reference(new CommandEnvironment(interaction, progress)));
  interaction.clear();
  progress.clear();
  environment.clear();
  expect(trace).toEqual(["progress", "interaction"]);
});
