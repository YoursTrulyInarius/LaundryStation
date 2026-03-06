import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs';

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

    ipcMain.handle('print-to-pdf', async (event, { transactionId, receiptHtml }) => {
        const win = BrowserWindow.getFocusedWindow();
        if (!win) return { success: false, error: 'No window found' };

        try {
            const { canceled, filePath } = await dialog.showSaveDialog(win, {
                title: 'Save Receipt as PDF',
                defaultPath: `receipt-${transactionId || 'receipt'}.pdf`,
                filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
            });

            if (canceled || !filePath) return { success: false, error: 'Cancelled' };

            // Create a hidden window to render the receipt
            const hiddenWin = new BrowserWindow({
                width: 420,
                height: 900,
                show: false,
                webPreferences: { nodeIntegration: false, contextIsolation: true }
            });

            // Build a standalone HTML page with the receipt content
            const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; font-family: 'Courier New', Courier, monospace; padding: 24px; color: black; }
  @page { margin: 0; }
</style>
</head>
<body>
${receiptHtml}
</body>
</html>`;

            await hiddenWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

            const pdfData = await hiddenWin.webContents.printToPDF({
                printBackground: true,
                pageSize: 'A5',
                margins: { top: 0.3, bottom: 0.3, left: 0.3, right: 0.3 }
            });

            hiddenWin.close();

            writeFile(filePath, pdfData, (err) => {
                if (err) console.error('Failed to save PDF:', err);
            });

            return { success: true };
        } catch (err) {
            console.error('printToPDF error:', err);
            return { success: false, error: err.message };
        }
    });

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
