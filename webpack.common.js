const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        clean: true,
        publicPath: "/"
    },
    resolve: {
        extensions: ['.tsx', '.js', '.jsx', '.json']
    },
    target: "web",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }, 
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.svg$/,
                use: [{
                    loader: 'svg-url-loader',
                    options: {
                        limit: 10000,
                    }
                }],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader'
                }]
            }
        ]
    }, 
    plugins: [
        new NodePolyfillPlugin(), 
        new Dotenv()
    ]
}