module.exports = (api) => {
  api.cache(true);
  return {
    plugins: ["@babel/plugin-proposal-object-rest-spread"],
    presets: [
      [
        "@babel/preset-env",
        {
          targets: ["last 2 chrome versions"],
        },
      ],
      "@babel/preset-react",
    ],
  };
};
