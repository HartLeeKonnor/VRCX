const mix = require('laravel-mix');
const HtmlWebpackPlugin = require('html-webpack-plugin');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-renderer',
});

mix.override(function(webpackConfig) {
    webpackConfig.module.rules.push({
        test: /\.pug$/,
        oneOf: [
            {
                resourceQuery: /^\?vue/,
                use: ['pug-plain-loader'],
            },
            {
                use: 'pug-loader',
            },
        ],
    });
    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            filename: 'assets/index.html',
            template: 'src/pug/index.pug',
            inject: false,
            minify: false,
        })
    );
});

mix.js('src/js/app.js', 'assets/').vue();
mix.sass('src/css/app.scss', 'assets/');

mix.dump();