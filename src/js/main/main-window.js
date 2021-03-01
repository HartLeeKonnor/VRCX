const path = require('path');
const { EventEmitter } = require('events');
const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const native = require('vrcx-native');
const { APP_ICON } = require('./constants.js');
const interceptWebRequest = require('./intercept-web-request.js');

/** @type {?MainWindow} */
var mainWindow = null;

function nothing() {
    var overlayWindow = new BrowserWindow({
        width: 512,
        height: 512,
        show: false,
        webPreferences: {
            offscreen: true,
        },
    });
    overlayWindow.webContents.on('paint', function (event, dirtyRect, image) {
        var result = native.setFrameBuffer(0, image.getBitmap());
        if (result !== 0) {
            console.log('native.setFrameBuffer', result);
        }
        if (window_ !== null) {
            // window_.webContents.send('setOverlayImage', {
            //     image: image.toDataURL(),
            // });
        }
    });
    // overlayWindow.loadURL('https://testdrive-archive.azurewebsites.net/performance/fishbowl/');
    overlayWindow.loadURL('https://youtube.com/');
}

class MainWindow extends EventEmitter {
    constructor() {
        super();

        /** @type {?BrowserWindow} */
        this.browserWindow = null;
    }

    create() {
        if (this.browserWindow !== null) {
            return;
        }

        var browserWindow = new BrowserWindow({
            width: 800,
            height: 500,
            minWidth: 400,
            minHeight: 250,
            fullscreenable: false,
            title: 'VRCX',
            icon: APP_ICON,
            frame: false,
            webPreferences: {
                preload: path.join(app.getAppPath(), 'assets/preload.js'),
                // partition: 'persist:vrcx',
                defaultEncoding: 'utf-8',
                spellcheck: false,
            },
        });

        var { webContents } = browserWindow;
        var { session } = webContents;

        webContents.openDevTools();

        // hide fingerprints :p
        webContents.userAgent = webContents.userAgent.replace(/(vrcx|electron)\/.+? /gi, '');

        // bypass CORS
        interceptWebRequest(session.webRequest);

        browserWindow.on('close', function (event) {
            if (app.isForceQuit === true) {
                return;
            }

            event.preventDefault();
            this.hide();
        });

        browserWindow.on('move', function () {
            // var [x, y] = this.getPosition();
            // var [width, height] = this.getSize();
        });

        browserWindow.on('resize', function () {
            // var [x, y] = this.getPosition();
            // var [width, height] = this.getSize();
        });

        browserWindow.on('show', function () {
            var { x: winX, y: winY } = this.getBounds();

            for (var { bounds } of screen.getAllDisplays()) {
                var { height, width, x, y } = bounds;
                if (winX >= x && winX <= x + width && winY >= y && winY <= y + height) {
                    // okay, windows in a display
                    return;
                }
            }

            this.center();
        });

        webContents.on('did-finish-load', function (event) {
            // reset zoom
            this.setZoomFactor(1);
            this.setZoomLevel(0);
        });

        webContents.on('new-window', function (event, url) {
            console.log('new-window', event, url);
            event.preventDefault();

            shell.openExternal(url);
        });

        webContents.on('will-navigate', function (event, url) {
            console.log('will-navigate', event, url);
            event.preventDefault();
        });

        session.on('will-download', function (event) {
            console.log('will-download', event);
            event.preventDefault();
        });

        // webContents.session.cookies.flushStore();
        // webContents.session.cookies.set({
        //     url: 'https://api.vrchat.cloud/',
        //     name: 'auth',
        //     value: ''
        // });

        browserWindow.loadFile('assets/index.html');

        this.browserWindow = browserWindow;
    }

    destroy() {
        var { browserWindow } = this;

        if (browserWindow === null) {
            return;
        }

        this.browserWindow = null;

        browserWindow.destroy();
    }

    send(channel, ...args) {
        var { browserWindow } = this;

        if (browserWindow === null) {
            return;
        }

        var { webContents } = browserWindow;
        webContents.send.apply(webContents, arguments);
    }

    activate() {
        var { browserWindow } = this;

        if (browserWindow === null) {
            return;
        }

        if (browserWindow.isMinimized() === true) {
            browserWindow.restore();
        }

        browserWindow.show();
        browserWindow.focus();
    }

    close() {
        var { browserWindow } = this;

        if (browserWindow === null) {
            return;
        }

        browserWindow.close();
    }

    minimize() {
        var { browserWindow } = this;

        if (browserWindow === null) {
            return;
        }

        browserWindow.minimize();
    }

    maximize() {
        var { browserWindow } = this;

        if (browserWindow === null) {
            return;
        }

        if (browserWindow.isMaximized() === true) {
            browserWindow.restore();
            return;
        }

        browserWindow.maximize();
    }
}

ipcMain.on('main-window:close', function (event) {
    event.returnValue = null;
    mainWindow.close();
});

ipcMain.on('main-window:minimize', function (event) {
    event.returnValue = null;
    mainWindow.minimize();
});

ipcMain.on('main-window:maximize', function (event) {
    event.returnValue = null;
    mainWindow.maximize();
});

mainWindow = new MainWindow();
module.exports = mainWindow;
