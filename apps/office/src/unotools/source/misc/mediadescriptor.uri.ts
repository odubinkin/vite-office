/** @fileoverview Original mediadescriptor.cxx removeFragment helper through the real registered URI factory. URL trust, authentication and stream selection remain separate source responsibilities. */
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original private source helper, visible for its compiler responsibility split. @param uri - Actual native URI. @returns Source URI without fragment, or original text if parsing returns empty. */
export function removeFragment(uri: OUStringConstReference): OUString {
  const factory = UriReferenceFactory.create(getProcessComponentContext());
  try {
    const reference = factory.operatorStar().parse(uri);
    try {
      if (reference.is()) {
        reference.operatorStar().clearFragment();
        return reference.operatorStar().getUriReference();
      }
      return new OUString(uri);
    } finally {
      reference.dispose();
    }
  } finally {
    factory.dispose();
  }
}
