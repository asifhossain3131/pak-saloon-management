const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const crypto = require('crypto');
const cors = require('cors');

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
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile('dist/index.html');
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

  expressApp.get('/', (req, res) => {
    res.send('server is running');
  });

  // ----------------------------------------------------------------------------------------------------------------

  // utils functions
  const generateDynamicId = () => {
    const dynamicId = crypto.randomBytes(16).toString('hex');
    return dynamicId;
  };

  const checkExistFile = (filePath) => {
    const existFile = fs.existsSync(filePath);
    return existFile;
  };

  const createNewFile = (filePath) => {
    fs.mkdirSync('./saloon-system/data', { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify([]));
  };

  const parsedData = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData;
  };

  const saveNewData = (filePath, parsedData, addedData) => {
    parsedData.push(addedData);
    fs.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
  };

  const checkExistField = (dataArray, fieldName, value) => {
    const existingField = dataArray?.find((data) => data[fieldName] === value);
    return !!existingField;
  };

  // ---------------------------------------------------------------------------------------------------------------------------

  // sales related
  expressApp.post('/api/sales', (req, res) => {
    const salesData = req.body;
    try {
      const filePath = './saloon-system/data/sales.json';
      const parsingData = parsedData(filePath);
      const existFile = checkExistFile(filePath);
      if (!existFile) {
        createNewFile(filePath);
      }
      saveNewData(filePath, parsingData, salesData);
      res.status(200).json({ success: true, message: 'New sales report added' });
    } catch (error) {
      console.error('error is seen', error);
    }
  });

  expressApp.get('/api/sales', (req, res) => {
    try {
      const filePath = './saloon-system/data/sales.json';
      const salesData = parsedData(filePath);
      res.status(200).json({ success: true, message: 'All data has been retrieved', data: salesData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load data' });
    }
  });

  // services related
  expressApp.get('/api/services', (req, res) => {
    try {
      const filePath = './saloon-system/data/services.json';
      const servicesData = parsedData(filePath);
      res.status(200).json({ success: true, message: 'All data has been retrieved', data: servicesData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load data' });
    }
  });

  expressApp.post('/api/services', (req, res) => {
    try {
      let dynamicId = generateDynamicId();
      const reqData = req.body;
      let serviceData;

      const filePath = './saloon-system/data/services.json';
      const existFile = checkExistFile(filePath);
      if (!existFile) {
        createNewFile(filePath);
      }

      const servicesParsedData = parsedData(filePath);

      const existServiceId = checkExistField(servicesParsedData, 'id', reqData?.id);
      const existServiceName = checkExistField(servicesParsedData, 'serviceName', reqData?.serviceName);

      if (existServiceId) {
        dynamicId = generateDynamicId();
      } else if (existServiceName) {
        throw new Error('Service already exists');
      }

      const timestamp = new Date().toISOString();

      serviceData = { ...reqData, id: dynamicId, createdAt: timestamp, updatedAt: timestamp };
      saveNewData(filePath, servicesParsedData, serviceData);

      res.status(200).json({ success: true, message: 'New service added' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  expressApp.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
