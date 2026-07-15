const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Avoid Metro resolving packages' ESM "import" export condition on web,
// which can pull in browser-tooling-only syntax (e.g. zustand's
// `import.meta.env` in its .mjs build) that Metro's non-module bundle
// output can't parse, silently breaking the whole web bundle.
config.resolver.unstable_conditionNames = ["require", "react-native", "browser"];

module.exports = withNativeWind(config, { input: "./global.css" });
