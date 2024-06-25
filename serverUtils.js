import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrinterTypes,ThermalPrinter } from 'node-thermal-printer';
import { fileURLToPath } from 'url';


// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// file pathnames 
const salesFilePath=path.join(__dirname, 'saloon-system', 'data', 'sales.json');
const servicesFilePath=path.join(__dirname, 'saloon-system', 'data', 'services.json');
const stylishesFilePath=path.join(__dirname, 'saloon-system', 'data', 'stylish.json');

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


export{
    printReceipt,
    generateDynamicId,
    createNewFile,
    checkExistField,
    checkExistFile,
    parsedData,
    salesFilePath,
    servicesFilePath,
    stylishesFilePath,
    saveNewData
}