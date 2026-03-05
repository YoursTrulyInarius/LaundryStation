import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 480, // strict mobile width
        height: 800,
        resizable: false, // enforce mobile size
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // In development, load the Vite dev server URL
    // We use localhost:5173 which is Vite's default port
    mainWindow.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
