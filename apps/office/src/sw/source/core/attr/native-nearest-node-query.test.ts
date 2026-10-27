/** @fileoverview Pins native nearest-node selection and live Writer/page-format GetInfo traversal on actual document nodes and owners. */
import { expect, it } from "vitest";
import { SwClient, SwModify } from "../../../inc/calbck";
import { SwFindNearestNode } from "../../../inc/hints";
import { SwDoc } from "../doc/doc";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Test receiver exercising the original virtual WriterListener query contract. */
class QueryClient extends SwClient {
  /** Retains the test's virtual-query receiver. @param query - Information handler. @returns Nothing. */
  public constructor(private readonly query: (info: SwFindNearestNode) => boolean) {
    super();
  }
  /** Dispatches the virtual query without copying its state. @param info - Original query. @returns Receiver result. */
  public override GetInfo(info: SwFindNearestNode): boolean {
    return this.query(info);
  }
}

it("selects only same-array strictly preceding body nodes and keeps their original identities", /** Tests source guards independently of registration or page-name projection. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.nodes.getTextNodes()[0] as SwTextNode,
    second = doc.nodes.MakeTextNode("second"),
    third = doc.nodes.MakeTextNode("third"),
    fourth = doc.nodes.MakeTextNode("fourth"),
    foreign = new SwDoc().nodes.getTextNodes()[0] as SwTextNode,
    query = new SwFindNearestNode(third);
  expect(query.GetFoundNode()).toBeUndefined();
  query.CheckNode(foreign);
  query.CheckNode(doc.nodes.GetEndOfExtras());
  query.CheckNode(doc.nodes.GetEndOfExtras().StartOfSectionNode());
  query.CheckNode(third);
  query.CheckNode(fourth);
  expect(query.GetFoundNode()).toBeUndefined();
  query.CheckNode(first);
  expect(query.GetFoundNode()).toBe(first);
  query.CheckNode(second);
  query.CheckNode(first);
  query.CheckNode(second);
  expect(query.GetFoundNode()).toBe(second);
});

it("reads current node indices rather than capturing a positional candidate snapshot", /** Moves actual model nodes after a candidate has been retained. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.nodes.getTextNodes()[0] as SwTextNode,
    second = doc.nodes.MakeTextNode("second"),
    third = doc.nodes.MakeTextNode("third"),
    query = new SwFindNearestNode(third);
  query.CheckNode(second);
  doc.nodes.moveTextNode(first, 1);
  query.CheckNode(first);
  expect(query.GetFoundNode()).toBe(first);
  expect(first.GetIndex()).toBeGreaterThan(second.GetIndex());
});

it("keeps default and empty-owner GetInfo true and propagates the same query through real nested owners", /** Traverses native registrations without synthesizing a node/style index. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.nodes.getTextNodes()[0] as SwTextNode,
    target = doc.nodes.MakeTextNode("target"),
    query = new SwFindNearestNode(target),
    outer = new SwModify(),
    inner = new SwModify(),
    receiver = new QueryClient(
      /** Checks the borrowed query identity and contributes a real candidate. @param info - Original query. @returns Continue. */ (
        info,
      ) => {
        expect(info).toBe(query);
        info.CheckNode(node);
        return true;
      },
    );
  expect(new SwClient().GetInfo(query)).toBe(true);
  expect(outer.GetInfo(query)).toBe(true);
  inner.RegisterToModify(outer);
  receiver.RegisterToModify(inner);
  expect(outer.GetInfo(query)).toBe(true);
  expect(query.GetFoundNode()).toBe(node);
});

it("honors native anchor-right ordering, early termination, and live removal repair", /** A query removes the next receiver; no snapshot delivers the detached receiver. @returns Nothing. */ () => {
  const source = new SwModify(),
    query = new SwFindNearestNode(new SwDoc().nodes.getTextNodes()[0] as SwTextNode),
    calls: string[] = [],
    first = new QueryClient(
      /** Removes the next registered listener during native traversal. @returns Continue. */ () => {
        calls.push("first");
        removed.EndListeningAll();
        first.EndListeningAll();
        return true;
      },
    ),
    last = new QueryClient(
      /** Stops before later receivers. @returns Stop. */ () => {
        calls.push("last");
        return false;
      },
    ),
    removed = new QueryClient(
      /** Records an erroneously visited detached receiver. @returns Continue. */ () => {
        calls.push("removed");
        return true;
      },
    );
  first.RegisterToModify(source);
  last.RegisterToModify(source);
  removed.RegisterToModify(source);
  expect(source.GetInfo(query)).toBe(false);
  expect(calls).toEqual(["first", "last"]);
  last.EndListeningAll();
  expect(source.GetInfo(query)).toBe(true);
});

it.each([-1, 0, 1, 2, 3])(
  "queries the four page formats in source order with stop slot %s",
  /** Page descriptor queries formats rather than its own unrelated clients. @param stop - False-result owner, or all continue. @returns Nothing. */ (
    stop,
  ) => {
    const doc = new SwDoc(),
      page = doc.GetPageDesc(),
      node = doc.nodes.getTextNodes()[0] as SwTextNode,
      target = doc.nodes.MakeTextNode("target"),
      query = new SwFindNearestNode(target),
      calls: number[] = [];
    const formats = [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()];
    for (const [index, format] of formats.entries()) {
      new QueryClient(
        /** Contributes a real node from each original format. @param info - Borrowed query. @returns Whether the source traversal continues. */ (
          info,
        ) => {
          expect(info).toBe(query);
          calls.push(index);
          info.CheckNode(node);
          return index !== stop;
        },
      ).RegisterToModify(format);
    }
    new QueryClient(
      /** Rejects accidental querying of the page descriptor's own listener chain. @returns Never. */ () => {
        throw new Error("SwPageDesc.GetInfo must query its four formats");
      },
    ).RegisterToModify(page);
    expect(page.GetInfo(query)).toBe(stop === -1);
    expect(calls).toEqual(stop === -1 ? [0, 1, 2, 3] : [0, 1, 2, 3].slice(0, stop + 1));
    expect(query.GetFoundNode()).toBe(node);
  },
);
