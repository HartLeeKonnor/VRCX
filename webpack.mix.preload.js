var mix = require('laravel-mix');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-preload',
});

mix.js('src/js/preload.js', 'assets/');

mix.dump();
