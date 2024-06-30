import { checkExistField, checkExistFile, createNewFile, generateDynamicId, parsedData, printReceipt, salesFilePath, saveNewData } from "../../serverUtils.js";
import fs from 'fs';

const postAndPrintSalesDataIntoDb=async(reqBody)=>{
    let saleId = generateDynamicId();
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
const salesData = { ...reqBody, id: saleId, date: new Date().toLocaleDateString(),time: new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }) };

// Print receipt
try {
    // await printReceipt(salesData);

    // After successful printing, save sales data
     saveNewData(salesFilePath, parsingData, salesData)
    return parsingData
} catch (printError) {
    console.error('Error printing receipt:', printError);
    throw new Error('failed to print')
}
}


const getAllSalesDataFromDb=(salesDate)=>{
    const isExistFile=checkExistFile(salesFilePath)
    if(!isExistFile){
      createNewFile(salesFilePath)
    }
    const salesData = parsedData(salesFilePath);
    const specificDateSales=salesData?.filter(data=>data?.date===salesDate)
    return specificDateSales
}

export const salesServices={
    postAndPrintSalesDataIntoDb,
    getAllSalesDataFromDb
}