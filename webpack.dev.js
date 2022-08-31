const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    devServer: {
        port: "8000",
        static: ["./public"],
        open: true,
        hot: true,
        historyApiFallback: true,
        liveReload: true
    },
});