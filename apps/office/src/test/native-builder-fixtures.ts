/** @fileoverview Original domtest.cxx validTestFile, warningTestFile and errorTestFile byte content, decoded from its C literals without changing XML whitespace or declaration positions. */
/** Original validTestFile parser fixture. */
export const validTestFile =
  '<?xml version="1.0" encoding="UTF-8"?>  <office:document-content    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"    xmlns:xlink="http://www.w3.org/1999/xlink"    office:version="1.0">    <office:scripts/>    <xlink:test/>    <office:automatic-styles teststyle="test"/>    <moretest/>     some text öäü  </office:document-content> ';
/** Original warningTestFile parser fixture. */
export const warningTestFile =
  '<?xml version="1.0" encoding="UTF-8"?>  <office:document-content    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"    xml:space="blah"    xmlns:xlink="http://www.w3.org/1999/xlink"    office:version="1.0">    <office:scripts/>    <xlink:test/>    <office:automatic-styles teststyle="test"/>    <moretest/>     some text öäü  </office:document-content> ';
/** Original errorTestFile parser fixture. */
export const errorTestFile =
  ' <?xml version="1.0" encoding="UTF-8"?>  <office:document-content    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"    office:version="1.0">    <office:scripts/>    <office:automatic-styles/>  </office:document-content> ';
