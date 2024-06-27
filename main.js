import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import router from './src/routes/index.js';


// Load environment variables from .env file
dotenv.config();


process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
  });
  // Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  startExpressServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Express Server Setup
const startExpressServer = () => {
  const expressApp = express();
  const PORT = 5000 || process.env.PORT;

  expressApp.use(cors());
  expressApp.use(bodyParser.json());
expressApp.use('/api/v1',router)

expressApp.get('/', (req, res) => {
    res.send('server is running')
  });



  expressApp.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
