module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated/plugin ДОЛЖЕН быть последним
    plugins: ['react-native-reanimated/plugin'],
  };
};
