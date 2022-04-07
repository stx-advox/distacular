const webpack = require("webpack");

module.exports = function override(config, env) {
    console.log("override");
    let loaders = config.resolve;
    loaders.fallback = {
        // fs: false,
        // tls: false,
        // net: false,
        // http: require.resolve("stream-http"),
        // https: false,
        // zlib: require.resolve("browserify-zlib"),
        // path: require.resolve("path-browserify"),
        stream: require.resolve("readable-stream"),
        util: require.resolve("util/"),
        crypto: require.resolve("crypto-browserify"),
        Buffer: require.resolve("buffer/"),
    };
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.DefinePlugin({
            "process.browser": true,
            "process.env": env,
        }),
    ];

    return config;
};
