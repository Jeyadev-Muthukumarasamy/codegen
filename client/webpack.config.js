const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Import the plugin

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true, // Clean the dist folder before each build
        publicPath: '/', // Important for React Router
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ // Use the plugin
            template: './public/index.html', // Path to your HTML template
            filename: 'index.html' // Output filename
        }),
    ],
    devServer: {
        static: path.join(__dirname, 'dist'),
        port: 3000,
        hot: true,
        historyApiFallback: true, // Required for React Router to work correctly
    },
    mode: 'development',
};