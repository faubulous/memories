import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { DatabaseChannel, IpcChannelInterface } from './app/ipc';

class Main {
    private mainWindow?: BrowserWindow;

    public init(ipcChannels: IpcChannelInterface[]) {
        app.on('ready', this.createWindow);
        app.on('window-all-closed', this.onWindowAllClosed);
        app.on('activate', this.onActivate);

        this.registerIpcChannels(ipcChannels);
    }

    private onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    private onActivate() {
        if (!this.mainWindow) {
            this.createWindow();
        }
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow({
            height: 600,
            width: 800,
            title: `Memories`,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });

        this.mainWindow.loadFile('../dist/app/index.html');

        ipcMain.handle('dark-mode:toggle', () => {
            if (nativeTheme.shouldUseDarkColors) {
                nativeTheme.themeSource = 'light'
            } else {
                nativeTheme.themeSource = 'dark'
            }
            return nativeTheme.shouldUseDarkColors
        });

        ipcMain.handle('dark-mode:system', () => {
            nativeTheme.themeSource = 'system'
        });
    }

    private registerIpcChannels(ipcChannels: IpcChannelInterface[]) {
        ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
    }
}

new Main().init([new DatabaseChannel()]);