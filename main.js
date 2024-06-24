import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { PrinterTypes,ThermalPrinter } from 'node-thermal-printer';
import crypto from 'crypto';
import cors from 'cors';
import * as dotenv from 'dotenv';

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
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
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

  async function printReceipt(salesData) {
    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
        interface: 'tcp://192.168.0.100', // Printer interface (Replace with your printer's IP)
        options: {
          timeout: 5000 // Increase timeout to 5 seconds
        }
    });

    printer.alignCenter();
    printer.bold(true);
    printer.setTextDoubleHeight();
    printer.setTextDoubleWidth();
    printer.println('TAX INVOICE');
    printer.bold(false);
    printer.setTextNormal();
    printer.println('ABC LLC');
    printer.println('Street, Emirate, UAE');
    printer.println(`TRN 101234567890003`);
    printer.drawLine();

    printer.alignLeft();
    salesData?.servicesTaken?.forEach(item => {
        printer.tableCustom([
            { text: item?.serviceName, align: 'LEFT', width: 0.5 },
            { text: item?.price, align: 'RIGHT', width: 0.5 },
        ]);
    });

    printer.drawLine();

    printer.tableCustom([
        { text: 'Total before VAT', align: 'LEFT', width: 0.5 },
        // { text: salesData.amountExcludingVat, align: 'RIGHT', width: 0.5 },
    ]);

    printer.tableCustom([
        { text: 'VAT incl.', align: 'LEFT', width: 0.5 },
        { text: '5%', align: 'RIGHT', width: 0.5 },
    ]);

    printer.tableCustom([
        { text: 'Total', align: 'LEFT', width: 0.5 },
        { text: salesData?.totalAmount, align: 'RIGHT', width: 0.5 },
    ]);

    printer.drawLine();
    printer.println(`Date: ${new Date(salesData?.time).toLocaleDateString()}`);

    printer.cut();
    await printer.execute(function(err) {
      if (err) {
        return console.error("Error printing receipt: ", err);
      }
  })
}


  // ---------------------------------------------------------------------------------------------------------------------------

  // sales related
  expressApp.post('/api/sales', async (req, res) => {
    let saleId = generateDynamicId();
    const reqBody = req.body;
    try {
        const filePath = path.join(__dirname, 'saloon-system', 'data', 'sales.json');

        // Ensure file exists
        if (!checkExistFile(filePath)) {
            createNewFile(filePath);
        }

        // Parse existing data
        const parsingData = parsedData(filePath);

        // Ensure unique saleId
        while (checkExistField(parsingData, 'id', saleId)) {
            saleId = generateDynamicId();
        }

        // Add new sales data
        const salesData = { ...reqBody, id: saleId, time: new Date().toISOString() };

        // Print receipt
        try {
            await printReceipt(salesData);

            // After successful printing, save sales data
            saveNewData(filePath, parsingData, salesData);

            res.status(200).json({ success: true, message: 'New sales report added and receipt printed' });
        } catch (printError) {
            console.error('Error printing receipt:', printError);
            res.status(500).json({ success: false, message: 'Error printing receipt' });
        }
    } catch (error) {
        console.error('Error processing sales:', error);
        res.status(500).json({ success: false, message: 'Error processing sales' });
    }
});

  expressApp.get('/api/sales', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'saloon-system', 'data', 'sales.json');
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

  expressApp.get('/api/services/:serviceId',(req,res)=>{
    const {serviceId}=req.params
    const filePath = path.join(__dirname, 'saloon-system', 'data', 'services.json');

    try {
        // Parse existing services data
        const servicesData = parsedData(filePath)
        const targetService=servicesData?.find(service=>service.id===serviceId)
        res.status(200).json({ success: true, message: ' single service has been retrieved', data: targetService });
    }catch(err){
      console.error('Error retriving single service:', err);
      res.status(500).json({ success: false, message: 'Failed to retrive single service' });
    }
  })

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

      const existServiceId = checkExistField(servicesParsedData, 'id', dynamicId);
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

  expressApp.post('/api/deleteService', (req, res) => {
    const{serviceId}=req.body
    const filePath = path.join(__dirname, 'saloon-system', 'data', 'services.json');

    try {
        // Parse existing services data
        const servicesData = parsedData(filePath);

        // Filter out the service with the matching serviceId
        const filteredServices = servicesData.filter(service => service.id !== serviceId);

        // Check if any service was actually removed
        if (filteredServices.length === servicesData.length) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Save the updated services data
        const jsonData = JSON.stringify(filteredServices, null, 2); // null and 2 are for formatting (indentation)

        // Write data to file
        fs.writeFileSync(filePath, jsonData);
    

        res.status(200).json({ success: true, message: `Service with ID ${serviceId} deleted successfully` });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Failed to delete service' });
    }
});


expressApp.put('/api/updateServices', (req, res) => {
  const { serviceId, serviceName, img, price } = req.body;
  const filePath = path.join(__dirname, 'saloon-system', 'data', 'services.json');

  try {
    // Parse existing services data
    const servicesData = parsedData(filePath);

    // Find the index of the service with the matching serviceId
    const serviceIndex = servicesData.findIndex(service => service?.id === serviceId);

    // If the service is not found, return an error
    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: `Service with ID ${serviceId} not found` });
    }

    // Update service properties
    if (serviceName) servicesData[serviceIndex].serviceName = serviceName;
    if (img) servicesData[serviceIndex].img = img;
    if (price) servicesData[serviceIndex].price = price;

    // Save the updated services data
    const jsonData = JSON.stringify(servicesData, null, 2); // null and 2 are for formatting (indentation)
    
    // Write data to file
    fs.writeFileSync(filePath, jsonData);

    res.status(200).json({ success: true, message: `Service with ID ${serviceId} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while updating the service' });
  }
});


  expressApp.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
