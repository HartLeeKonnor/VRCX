const { app, ipcMain } = require('electron');
const native = require('vrcx-native');
const trayMenu = require('./tray-menu.js');
const mainWindow = require('./main-window.js');

(function () {
    app.setName('VRCX');
    app.setAppUserModelId('moe.pypy.vrcx');

    if (app.requestSingleInstanceLock() === false) {
        app.exit();
        return;
    }

    console.log('sample', native.sample());
    console.log('sum', native.sum(1, 2, 3, 4, 5, '6'));

    // for better performance to offscreen rendering
    app.disableHardwareAcceleration();

    app.isForceQuit = false;

    app.on('ready', function () {
        trayMenu.create();
        mainWindow.create();
    });

    app.on('second-instance', function () {
        mainWindow.activate();
    });

    app.on('activate', function () {
        mainWindow.activate();
    });

    app.on('will-quit', function () {
        trayMenu.destroy();
    });

    trayMenu.on('double-click', function () {
        mainWindow.activate();
    });

    trayMenu.on('menu:open', function () {
        mainWindow.activate();
    });

    trayMenu.on('menu:quit', function () {
        app.isForceQuit = true;
        app.quit();

        // ensure exit
        setTimeout(function () {
            app.exit();
        }, 5000);
    });

    ipcMain.handle('vrcx', function (event, ...args) {
        console.log('ipcMain.handle(vrcx)', event, args);
        return args;
    });

    ipcMain.on('vrcx', function (event, ...args) {
        console.log('ipcMain.on(vrcx)', event, args);
        event.returnValue = args;

        switch (args[0]) {
            case 'close-main-window':
                mainWindow.close();
                break;

            case 'minimize-main-window':
                mainWindow.minimize();
                break;

            case 'maximize-main-window':
                mainWindow.maximize();
                break;
        }
    });
})();
