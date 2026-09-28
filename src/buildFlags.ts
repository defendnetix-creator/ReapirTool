declare const __AKSHIGO_TEST_BUILD__: boolean;
// Explicit compiler flag for the owner's local test package; never issues a license.
export const isTestBuild = typeof __AKSHIGO_TEST_BUILD__ !== 'undefined' && __AKSHIGO_TEST_BUILD__;
