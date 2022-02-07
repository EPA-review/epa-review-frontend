const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const path = require("path");
module.exports = function override(config, env) {
  config.plugins = config.plugins.map((plugin) => {
    if (plugin.constructor.name === "GenerateSW") {
      return new WorkboxWebpackPlugin.InjectManifest({
        globPatterns: ["pyodide/*"],
        globDirectory: "build",
        swSrc: path.join("src", "custom-service-worker.js"),
        swDest: "service-worker.js",
      });
    }
    return plugin;
  });
  return config;
};
