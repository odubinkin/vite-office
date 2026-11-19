/** @fileoverview Actual OOXML recursion guard and represented filter state in main/DOM-free Worker; full model/factory/media/storage/filter orchestration remains unqualified. */
import {
  DocumentOpenedGuard,
  FilterBaseImpl,
  FilterDirection,
} from "../../apps/office/src/oox/source/core/filterbase";
import { OoxmlVersion } from "../../apps/office/src/oox/inc/core/filterbase";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { unicode } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
/** Exercises public source state and original native lock-backed duplicate claims. @returns Observations. */
export function probeNativeFilterState() {
  const url = unicode("file:///filter-state-字😀"),
    state = new FilterBaseImpl(getProcessComponentContext()),
    owner = new DocumentOpenedGuard(url);
  let duplicateBlocked: boolean;
  try {
    const duplicate = new DocumentOpenedGuard(url);
    try {
      duplicateBlocked = owner.isValid() && !duplicate.isValid();
    } finally {
      duplicate.dispose();
    }
  } finally {
    owner.dispose();
  }
  const reopened = new DocumentOpenedGuard(url);
  try {
    return {
      duplicateBlocked,
      reopened: reopened.isValid(),
      defaults:
        state.meDirection === FilterDirection.Unknown &&
        state.meVersion === OoxmlVersion.ECMA_376_1ST_EDITION &&
        !state.mxModel.is() &&
        !state.mxModelFactory.is() &&
        !state.mbExportVBA &&
        !state.mbExportTemplate &&
        !state.mbExportSlideShow,
      context: state.mxComponentContext.get() === getProcessComponentContext().get(),
    };
  } finally {
    reopened.dispose();
    state.dispose();
    url.dispose();
  }
}
