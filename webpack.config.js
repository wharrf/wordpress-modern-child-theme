const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDevelopment = true // process.env.NODE_ENV === 'development'

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    entry: path.resolve(__dirname, 'src/js/index'),
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                loader: 'babel-loader',
                include : path.resolve(__dirname, 'src/js'),
                exclude: /node_modules/
            },
            {
                test: /\.s(a|c)ss$/i,
                loader: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                            sourceMap: isDevelopment,
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDevelopment
                        }
                    },
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', ".ts", ".tsx", '.scss']
    },
    plugins: [
        new MiniCssExtractPlugin({
          filename: isDevelopment ? '[name].css' : '[name].[hash].css',
          chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
        })
    ]
}