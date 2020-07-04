const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");


module.exports = {
    devtool: 'source-map',
    entry: "./src/index.js",
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "index_bundle.js"
    },
    module: {
        rules: [{
            test: /\.worker\.js$/,
            resolve: {
              extensions: [".js", ".jsx"]
            },
            use: { loader: 'worker-loader' },
        }, {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            resolve: {
              extensions: [".js", ".jsx"]
            },
            use: {
                loader: 'babel-loader',
            }
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract(
                {
                    fallback: 'style-loader',
                    use: ['css-loader']
                }
            )
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: [
                {
                    loader: 'file-loader'
                }
            ]
        }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            hash: true,
            filename: "index.html",  //target html
            template: "./public/index.html" //source html
        }),
        new ExtractTextPlugin({ filename: 'css/style.css' })
    ]
}
