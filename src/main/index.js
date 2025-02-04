import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, Menu, safeStorage, shell, Tray } from 'electron';
import { join } from 'path';
import iconWhite from '../../resources/icon-white.png?asset';
import icon from '../../resources/icon.png?asset';

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 450,
    height: 900,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.removeMenu();

  const tray = new Tray(iconWhite);
  tray.setIgnoreDoubleClickEvents(true);
  tray.setTitle(`${app.getName()} v${app.getVersion()}`);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: function () {
          mainWindow.show();
        }
      },
      {
        label: 'Quit',
        click: function () {
          app.isQuiting = true;
          app.quit();
        }
      }
    ])
  );
  tray.on('click', function () {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('net.fionix');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('encrypt', (event, value) => {
    const encrypted = safeStorage.encryptString(value);
    event.returnValue = encrypted.toString('base64');
  });

  ipcMain.on('decrypt', (event, value) => {
    const buffer = Buffer.from(value, 'base64');
    event.returnValue = safeStorage.decryptString(buffer);
  });

  ipcMain.on('getVersion', (event) => {
    event.returnValue = app.getVersion();
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/** Check if single instance, if not, simply quit new instance */
let isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
}

// Behaviour on second instance for parent process- Pretty much optional
app.on('second-instance', () => {
  if (mainWindow) {
    mainWindow.restore();
    mainWindow.focus();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
