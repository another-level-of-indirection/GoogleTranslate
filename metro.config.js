// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Custom resolver to handle platform-specific modules
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block SQLite web worker and WASM files on web platform
  if (platform === 'web' && (
    moduleName.includes('expo-sqlite/web/worker') ||
    moduleName.includes('wa-sqlite.wasm') ||
    moduleName.includes('expo-sqlite') && context.originModulePath.includes('web')
  )) {
    return {
      type: 'empty',
    };
  }

  // Use original resolver for everything else
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
