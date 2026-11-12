/** @fileoverview Real source interaction requests, native Any/Sequence copies and actual continuation queries/selection lifetimes. */
import { afterEach, expect, it } from "vitest";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { XInteractionRequest } from "../../../udkapi/com/sun/star/task/XInteractionRequest";
import { XInteractionContinuation } from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import { XInteractionAbort } from "../../../udkapi/com/sun/star/task/XInteractionAbort";
import { XInteractionRetry } from "../../../udkapi/com/sun/star/task/XInteractionRetry";
import { XInteractionApprove } from "../../../offapi/com/sun/star/task/XInteractionApprove";
import { XInteractionDisapprove } from "../../../offapi/com/sun/star/task/XInteractionDisapprove";
import { own, api, releaseDomScope, u } from "../../../test/native-dom";
import {
  SAXParseException,
  cppu_detail_getUnoType as parseType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { InteractionRequest, InteractionContinuation } from "./interactionrequest";
import { SimpleInteractionRequest, ContinuationFlags as F } from "./simpleinteractionrequest";
afterEach(releaseDomScope);
/** Actual request exception envelope required by the original interaction contract. @returns Owned native Any. */
function requestPayload(): Any {
  return own(new Any(own(new SAXParseException()), parseType));
}

it("copies real typed exception payloads and retains empty selection and continuation defaults", /** No host error or fabricated request payload provider is used. @returns Nothing. */ () => {
  const defaultRef = own(new Reference(new InteractionRequest(requestPayload())));
  expect(own(api(defaultRef).getRequest()).hasValue()).toBe(true);
  expect(own(api(defaultRef).getContinuations()).getLength()).toBe(0);
  expect(api(defaultRef).getSelection().is()).toBe(false);
  const error = own(
      new SAXParseException(
        u("message"),
        own(new Reference()),
        own(new Any()),
        u("public"),
        u("system"),
        2,
        3,
      ),
    ),
    value = own(new Any(error, parseType)),
    request = own(new Reference(new InteractionRequest(value))),
    facet = own(
      new Reference<XInteractionRequest>(request, UNO_QUERY_THROW, XInteractionRequest.static_type),
    );
  value.clear();
  error.Message = u("changed");
  const payload = own(api(facet).getRequest()),
    copied = own(new SAXParseException());
  expect(payload.extract(copied, parseType)).toBe(true);
  expect(copied.Message.equals(u("message"))).toBe(true);
  expect([copied.LineNumber, copied.ColumnNumber]).toEqual([2, 3]);
});

it.each([
  [F.Abort, XInteractionAbort],
  [F.Retry, XInteractionRetry],
  [F.Approve, XInteractionApprove],
  [F.Disapprove, XInteractionDisapprove],
] as const)(
  "retains genuine continuation selection for flag %s",
  /** Source response classification uses actual queried facets. @param flag - Original flag. @param declaration - Original marker interface. @returns Nothing. */ (
    flag,
    declaration,
  ) => {
    const request = own(new Reference(new SimpleInteractionRequest(requestPayload(), flag))),
      sequence = own(api(request).getContinuations());
    expect(sequence.getLength()).toBe(1);
    expect(api(request).getResponse()).toBe(F.NONE);
    const cell = (sequence.getConstArray() as SequenceElements).get(0) as [
        XInteractionContinuation | null,
      ],
      choice = own(
        new Reference<XInteractionContinuation>(cell[0], UNO_QUERY_THROW, declaration.static_type),
      );
    api(choice).select();
    expect(api(request).getResponse()).toBe(flag);
    api(request).setSelection(own(new Reference<InteractionContinuation>()));
    expect(api(request).getResponse()).toBe(F.NONE);
  },
);

it("retains source combined ordering and the continuation base interface surface", /** Diagnostics in source do not become invented validation exceptions. @returns Nothing. */ () => {
  const request = own(
      new Reference(
        new SimpleInteractionRequest(
          requestPayload(),
          F.Abort | F.Retry | F.Approve | F.Disapprove,
        ),
      ),
    ),
    sequence = own(api(request).getContinuations());
  expect(sequence.getLength()).toBe(4);
  for (const [index, declaration] of [
    XInteractionAbort,
    XInteractionRetry,
    XInteractionApprove,
    XInteractionDisapprove,
  ].entries()) {
    const cell = (sequence.getConstArray() as SequenceElements).get(index * 8) as [
      XInteractionContinuation | null,
    ];
    expect(own(new Reference(cell[0], UNO_QUERY, declaration.static_type)).is()).toBe(true);
  }
  const base = own(new Reference(new InteractionContinuation(api(request))));
  expect(own(new Reference(base, UNO_QUERY, XInteractionContinuation.static_type)).is()).toBe(
    false,
  );
});

it("keeps continuation sequence copies alive without acquiring their borrowed parent", /** No selection is attempted after the source parent lifetime ends. @returns Nothing. */ () => {
  const request = own(new Reference(new SimpleInteractionRequest(requestPayload(), F.Abort))),
    parentWeak = own(new WeakReferenceHelper(request)),
    sequence = own(api(request).getContinuations()),
    cell = (sequence.getConstArray() as SequenceElements).get(0) as [
      XInteractionContinuation | null,
    ],
    choice = own(new Reference(cell[0])),
    continuationWeak = own(new WeakReferenceHelper(choice));
  choice.clear();
  request.clear();
  expect(own(parentWeak.get()).is()).toBe(false);
  expect(own(continuationWeak.get()).is()).toBe(true);
  // The owned sequence is released by scope cleanup; no dangling parent callback is invoked.
});
