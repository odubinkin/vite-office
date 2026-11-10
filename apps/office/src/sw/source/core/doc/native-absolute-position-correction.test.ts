/** @fileoverview Actual native physical PaM bounds, point/mark aliases and structural/text correction positions exercise original doccorr/section-deletion prerequisites without fake global cursor providers. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { lcl_PosCorrAbs, lcl_PaMCorrAbs } from "./doccorr";
import { GetCorrPosition } from "./DocumentContentOperationsManager";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwTextNode } from "../txtnode/ndtxt";
/** Creates real document and position operands. @param check - Native observations. @returns Nothing. */
function inspect(check: (doc: SwDoc, node: SwTextNode) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  try {
    check(doc, node);
  } finally {
    doc.Dispose();
  }
}
it("retains both physical bounds while SetMark, Exchange and DeleteMark change only native aliases", /** Unused physical bounds are real positions, parked at node0 by original constructors/DeleteMark. @returns Nothing. */ () => {
  inspect(
    /** Observes actual owned position references. @param doc - Document. @param node - Content. @returns Nothing. */ (
      doc,
      node,
    ) => {
      const input = new SwPosition(node, 2),
        pam = new SwPaM(input);
      input.Dispose();
      const one = pam.GetBound(),
        two = pam.GetBound(false);
      try {
        expect(pam.GetPoint()).toBe(one);
        expect(pam.GetMark()).toBe(one);
        expect(two.GetNode()).toBe(doc.nodes.at(0));
        expect(two.nContent.GetContentNode()).toBeUndefined();
        pam.SetMark();
        expect(pam.GetMark()).toBe(two);
        expect(two.GetContentIndex()).toBe(2);
        pam.GetPoint().SetContent(4);
        pam.Exchange();
        expect(pam.GetPoint()).toBe(two);
        expect(pam.GetMark()).toBe(one);
        pam.DeleteMark();
        expect(pam.HasMark()).toBe(false);
        expect(pam.GetMark()).toBe(two);
        expect(one.GetNode()).toBe(doc.nodes.at(0));
        pam.SetMark();
        expect(pam.GetMark()).toBe(one);
        expect(one.GetNode()).toBe(node);
        expect(one.GetContentIndex()).toBe(2);
        expect(pam.GetBound()).toBe(one);
        expect(pam.GetBound(false)).toBe(two);
      } finally {
        pam.Dispose();
      }
    },
  );
});
it("keeps native physical position identity and alias-safe assignment through actual range movement", /** Existing point-first binding copies values rather than replacing owned endpoints. @returns Nothing. */ () => {
  inspect(
    /** Uses actual input positions and range references. @param doc - Document. @param node - Content. @returns Nothing. */ (
      doc,
      node,
    ) => {
      const point = new SwPosition(node, 5),
        mark = new SwPosition(node, 1),
        pam = new SwPaM(point, mark);
      point.Dispose();
      mark.Dispose();
      const one = pam.GetBound(),
        two = pam.GetBound(false);
      try {
        expect(pam.GetPoint()).toBe(two);
        expect(pam.GetMark()).toBe(one);
        expect(pam.Assign(pam.GetMark(), pam.GetPoint())).toBe(pam);
        expect(pam.GetPoint()).toBe(two);
        expect(pam.GetPoint().GetContentIndex()).toBe(1);
        expect(pam.GetMark()).toBe(one);
        expect(pam.GetMark().GetContentIndex()).toBe(5);
        pam.Assign(pam.GetMark());
        expect(pam.GetPoint()).toBe(two);
        expect(two.GetContentIndex()).toBe(5);
        expect(pam.GetMark()).toBe(two);
        expect(one.GetNode()).toBe(doc.nodes.at(0));
      } finally {
        pam.Dispose();
      }
    },
  );
});
it("selects Point as Start and Mark as End on an equal-coordinate native selection", /** Equal coordinates do not remove pointer-distinct selection ownership. @returns Nothing. */ () => {
  inspect(
    /** Compares original endpoint references, not derived coordinates alone. @param doc - Document. @param node - Content. @returns Nothing. */ (
      _doc,
      node,
    ) => {
      const position = new SwPosition(node, 3),
        pam = new SwPaM(position, position);
      position.Dispose();
      try {
        expect(pam.HasMark()).toBe(true);
        expect(pam.GetPoint()).not.toBe(pam.GetMark());
        expect(pam.Start()).toBe(pam.GetPoint());
        expect(pam.End()).toBe(pam.GetMark());
        const pair = pam.StartEnd();
        expect(pair[0]).toBe(pam.GetPoint());
        expect(pair[1]).toBe(pam.GetMark());
        pam.Exchange();
        expect(pam.Start()).toBe(pam.GetPoint());
        expect(pam.End()).toBe(pam.GetMark());
      } finally {
        pam.Dispose();
      }
    },
  );
});
it("normalizes pointer aliases with the original default ordering while retaining physical bounds", /** Source default true is independent of the point-first TypeScript constructor spelling. @returns Nothing. */ () => {
  inspect(
    /** Observes actual bound and alias owners. @param doc - Document. @param node - Content. @returns Nothing. */ (
      _doc,
      node,
    ) => {
      const p = new SwPosition(node, 5),
        q = new SwPosition(node, 1),
        pam = new SwPaM(p, q);
      p.Dispose();
      q.Dispose();
      const one = pam.GetBound(),
        two = pam.GetBound(false);
      try {
        pam.Normalize();
        expect(pam.GetPoint()).toBe(one);
        expect(pam.GetMark()).toBe(two);
        pam.Normalize(false);
        expect(pam.GetPoint()).toBe(two);
        expect(pam.GetMark()).toBe(one);
      } finally {
        pam.Dispose();
      }
    },
  );
});
it.each([0, 1, 2, 3, 4, 5, 6])(
  "uses original inclusive absolute-position bounds at offset%s",
  /** Native position correction differs from mark deletion's content-end predicate. @param offset - Actual position. @returns Nothing. */ (
    offset,
  ) => {
    inspect(
      /** Reads real registry and structural position values. @param doc - Document. @param node - Content. @returns Nothing. */ (
        doc,
        node,
      ) => {
        const position = new SwPosition(node, offset),
          start = new SwPosition(node, 2),
          end = new SwPosition(node, 4),
          target = new SwPosition(doc.nodes.GetEndOfExtras());
        try {
          const changed = lcl_PosCorrAbs(position, start, end, target);
          expect(changed).toBe(offset >= 2 && offset <= 4);
          expect(position.GetNode()).toBe(changed ? target.GetNode() : node);
          expect(position.GetContentIndex()).toBe(changed ? 0 : offset);
          if (changed) expect(position.nContent.GetContentNode()).toBeUndefined();
        } finally {
          position.Dispose();
          start.Dispose();
          end.Dispose();
          target.Dispose();
        }
      },
    );
  },
);
it("corrects both physical bounds even after the first correction succeeds", /** Original bitwise-OR accumulation must not become boolean short circuit. @returns Nothing. */ () => {
  inspect(
    /** Uses actual independently owned endpoint snapshots. @param doc - Document. @param node - Content. @returns Nothing. */ (
      doc,
      node,
    ) => {
      const p = new SwPosition(node, 2),
        q = new SwPosition(node, 4),
        start = new SwPosition(node, 1),
        end = new SwPosition(node, 5),
        target = new SwPosition(doc.nodes.GetEndOfExtras()),
        pam = new SwPaM(p, q);
      p.Dispose();
      q.Dispose();
      try {
        expect(lcl_PaMCorrAbs(pam, start, end, target)).toBe(true);
        for (const bound of [pam.GetBound(), pam.GetBound(false)]) {
          expect(bound.GetNode()).toBe(target.GetNode());
          expect(bound.GetContentIndex()).toBe(0);
        }
        expect(pam.HasMark()).toBe(true);
      } finally {
        pam.Dispose();
        start.Dispose();
        end.Dispose();
        target.Dispose();
      }
    },
  );
});
it("corrects an inactive physical bound without altering the unmarked Point alias", /** Public native GetBound exposes the inactive owner; replacing it by GetMark would lose this source branch. @returns Nothing. */ () => {
  inspect(
    /** Authors positions through original public operations only. @param doc - Document. @param node - Content. @returns Nothing. */ (
      doc,
      node,
    ) => {
      const p = new SwPosition(node, 6),
        pam = new SwPaM(p),
        start = new SwPosition(node, 2),
        end = new SwPosition(node, 4),
        target = new SwPosition(doc.nodes.GetEndOfExtras());
      p.Dispose();
      pam.GetBound(false).Assign(node, 3);
      try {
        expect(lcl_PaMCorrAbs(pam, start, end, target)).toBe(true);
        expect(pam.GetPoint().GetNode()).toBe(node);
        expect(pam.GetPoint().GetContentIndex()).toBe(6);
        expect(pam.GetMark()).toBe(pam.GetPoint());
        expect(pam.HasMark()).toBe(false);
        expect(pam.GetBound(false).GetNode()).toBe(target.GetNode());
      } finally {
        pam.Dispose();
        start.Dispose();
        end.Dispose();
        target.Dispose();
      }
    },
  );
});
it("keeps an already inactive bound unchanged during ordinary unmarked value assignment", /** Source DeleteMark only parks a formerly active mark; it does not reset both bounds unconditionally. @returns Nothing. */ () => {
  inspect(
    /** Exercises the native inactive-bound value contract. @param doc - Document. @param node - Content. @returns Nothing. */ (
      _doc,
      node,
    ) => {
      const first = new SwPosition(node, 1),
        next = new SwPosition(node, 5),
        pam = new SwPaM(first);
      first.Dispose();
      pam.GetBound(false).Assign(node, 3);
      try {
        pam.Assign(next);
        expect(pam.GetPoint().GetContentIndex()).toBe(5);
        expect(pam.GetBound(false).GetContentIndex()).toBe(3);
        expect(pam.HasMark()).toBe(false);
      } finally {
        next.Dispose();
        pam.Dispose();
      }
    },
  );
});
it("chooses the real structural successor of a temporary-caption section without a paragraph search", /** Original GetCorrPosition is required to survive the upcoming section removal. @returns Nothing. */ () => {
  inspect(
    /** Uses actual caption start/end and fixed extras sentinel. @param doc - Document. @param node - Existing body. @returns Nothing. */ (
      doc,
      node,
    ) => {
      const caption = doc.nodes.MakeTextSection(
          doc.nodes.GetEndOfExtras(),
          K.SwNormalStartNode,
          doc.GetDfltTextFormatColl(),
        ),
        p = new SwPosition(caption),
        q = new SwPosition(caption.EndOfSectionNode()),
        range = new SwPaM(p, q);
      p.Dispose();
      q.Dispose();
      const correction = GetCorrPosition(range);
      try {
        expect(correction.GetNode()).toBe(doc.nodes.GetEndOfExtras());
        expect(correction.GetNode()).not.toBe(node);
        expect(correction.GetContentIndex()).toBe(0);
        expect(correction.nContent.GetContentNode()).toBeUndefined();
      } finally {
        correction.Dispose();
        range.Dispose();
      }
    },
  );
});
it.each([false, true])(
  "prefers the actual available content endpoint for GetCorrPosition markOnly=%s",
  /** Original Point-first branch wins when both endpoints contain text. @param markOnly - Point is structural. @returns Nothing. */ (
    markOnly,
  ) => {
    inspect(
      /** Observes original value-copy lifetime. @param doc - Document. @param node - Content. @returns Nothing. */ (
        doc,
        node,
      ) => {
        const p = new SwPosition(markOnly ? doc.nodes.GetEndOfExtras() : node, markOnly ? 0 : 2),
          q = new SwPosition(node, 4),
          range = new SwPaM(p, q);
        p.Dispose();
        q.Dispose();
        const correction = GetCorrPosition(range);
        try {
          expect(correction.GetNode()).toBe(node);
          expect(correction.GetContentIndex()).toBe(markOnly ? 4 : 2);
          expect(correction).not.toBe(markOnly ? range.GetMark() : range.GetPoint());
          range.GetPoint().Assign(doc.nodes.at(0));
          expect(correction.GetNode()).toBe(node);
        } finally {
          correction.Dispose();
          range.Dispose();
        }
      },
    );
  },
);
