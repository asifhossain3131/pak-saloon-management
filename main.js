import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { checkExistField, checkExistFile, createNewFile, generateDynamicId, parsedData, printReceipt, salesFilePath, saveNewData, servicesFilePath, stylishesFilePath } from './serverUtils.js';
import { fileURLToPath } from 'url';


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


  // sales related apis
  expressApp.post('/api/sales', async (req, res) => {
    let saleId = generateDynamicId();
    const reqBody = req.body;
    try {
        // Ensure file exists
        if (!checkExistFile(salesFilePath)) {
            createNewFile(salesFilePath);
        }

        // Parse existing data
        const parsingData = parsedData(salesFilePath);

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
            saveNewData(salesFilePath, parsingData, salesData);

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
      const isExistFile=checkExistFile(salesFilePath)
      if(!isExistFile){
        createNewFile(salesFilePath)
      }
      const salesData = parsedData(salesFilePath);
      res.status(200).json({ success: true, message: 'All data has been retrieved', data: salesData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load data' });
    }
  });

  // services related apis
  expressApp.get('/api/services', (req, res) => {
    try {
      const isExistFile=checkExistFile(servicesFilePath)
      if(!isExistFile){
        createNewFile(servicesFilePath)
      }
      const servicesData = parsedData(servicesFilePath)
      res.status(200).json({ success: true, message: 'All data has been retrieved', data: servicesData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load data' });
    }
  });

  expressApp.get('/api/services/:serviceId',(req,res)=>{
    const {serviceId}=req.params
    try {
        // Parse existing services data
        const servicesData = parsedData(servicesFilePath)
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

      const existFile = checkExistFile(servicesFilePath);
      if (!existFile) {
        createNewFile(servicesFilePath);
      }

      const servicesParsedData = parsedData(servicesFilePath);

      const existServiceId = checkExistField(servicesParsedData, 'id', dynamicId);
      const existServiceName = checkExistField(servicesParsedData, 'serviceName', reqData?.serviceName);

      if (existServiceId) {
        dynamicId = generateDynamicId();
      } else if (existServiceName) {
        throw new Error('Service already exists');
      }

      const timestamp = new Date().toISOString();

      serviceData = { ...reqData, id: dynamicId, createdAt: timestamp, updatedAt: timestamp };
      saveNewData(servicesFilePath, servicesParsedData, serviceData);

      res.status(200).json({ success: true, message: 'New service added' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  expressApp.post('/api/deleteService', (req, res) => {
    const{serviceId}=req.body
    try {
        // Parse existing services data
        const servicesData = parsedData(servicesFilePath);

        // Filter out the service with the matching serviceId
        const filteredServices = servicesData.filter(service => service.id !== serviceId);

        // Check if any service was actually removed
        if (filteredServices.length === servicesData.length) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Save the updated services data
        const jsonData = JSON.stringify(filteredServices, null, 2); // null and 2 are for formatting (indentation)

        // Write data to file
        fs.writeFileSync(servicesFilePath, jsonData);
    

        res.status(200).json({ success: true, message: `Service with ID ${serviceId} deleted successfully` });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Failed to delete service' });
    }
});


expressApp.put('/api/updateServices', (req, res) => {
  const { serviceId, serviceName, img, price } = req.body;
  try {
    // Parse existing services data
    const servicesData = parsedData(servicesFilePath);

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
    fs.writeFileSync(servicesFilePath, jsonData);

    res.status(200).json({ success: true, message: `Service with ID ${serviceId} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while updating the service' });
  }
});


// stylish related apis 
expressApp.get('/api/stylishes',(req,res)=>{
  try {
    const isExistFile=checkExistFile(stylishesFilePath)
    if(!isExistFile){
createNewFile(stylishesFilePath)
    }
    const parsedStylish=parsedData(stylishesFilePath)
    res.status(200).json({ success: true, message: 'all stylish retrived successfully',data:parsedStylish });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while retriving the stylishes' });
    console.error('the error is',error)
  }
})


expressApp.get('/api/stylishes/:stylishId',(req,res)=>{
  const {stylishId}=req.params
  try {
      // Parse existing services data
      const stylishData = parsedData(stylishesFilePath)
      const targetStylish=stylishData?.find(stylish=>stylish.id===stylishId)
      res.status(200).json({ success: true, message: ' single service has been retrieved', data: targetStylish });
  }catch(err){
    console.error('Error retriving single service:', err);
    res.status(500).json({ success: false, message: 'Failed to retrive single service' });
  }
})

expressApp.post('/api/stylishes',(req,res)=>{
 try {
  const reqData=req.body
  let dynamicId=generateDynamicId()
  const parsedStylises=parsedData(stylishesFilePath)
  while (checkExistField(parsedStylises, 'id', dynamicId)) {
    dynamicId = generateDynamicId();
}
const timestamp = new Date().toISOString();
const newStylishData={...reqData,id:dynamicId,createdAt:timestamp,updatedAt:timestamp}
saveNewData(stylishesFilePath,parsedStylises,newStylishData)
res.status(200).json({ success: true, message: 'a new stylish is added successfully' });
} catch (error) {
  res.status(500).json({ success: false, message: 'An error occurred while posting a stylishe' });
  console.error('the error is',error)
 }
})

expressApp.put('/api/updateStylish',(req,res)=>{
  const{id,stylishName,nationality,employeeId}=req.body
  try {
    const parsedStylishData=parsedData(stylishesFilePath)
    const stylishIndex = parsedStylishData.findIndex(stylish => stylish?.id === id);

    if (stylishIndex === -1) {
      return res.status(404).json({ success: false, message: `Service with ID ${id} not found` });
    }

    if (stylishName) parsedStylishData[stylishIndex].stylishName = stylishName;
    if (nationality) parsedStylishData[stylishIndex].nationality = nationality;
    if (employeeId) parsedStylishData[stylishIndex].employeeId = employeeId;

    const jsonData = JSON.stringify(parsedStylishData, null, 2); // null and 2 are for formatting (indentation)
    
    // Write data to file
    fs.writeFileSync(stylishesFilePath, jsonData);

    res.status(200).json({ success: true, message: `Stylish with ID ${id} updated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while updating the stylish' });
    console.error('the error is',error)
  }
})

expressApp.delete('/api/deleteStylish/:id',(req,res)=>{
  const{id}=req.params
try {
  const parsedStylishData=parsedData(stylishesFilePath)
  const updatedStylishData=parsedStylishData?.filter(stylish=>stylish?.id!==id)

        // Save the updated services data
        const jsonData = JSON.stringify(updatedStylishData, null, 2); // null and 2 are for formatting (indentation)

        // Write data to file
        fs.writeFileSync(stylishesFilePath, jsonData);
    
        res.status(200).json({ success: true, message: `stylish with ID ${id} deleted successfully` });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Failed to delete stylish' });
}
})


  expressApp.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
