import { checkExistField, checkExistFile, createNewFile, generateDynamicId, parsedData, saveNewData, stylishesFilePath } from "../../serverUtils.js"
import fs from 'fs';

const getAllStylishesFromDb=()=>{
    const isExistFile=checkExistFile(stylishesFilePath)
    if(!isExistFile){
createNewFile(stylishesFilePath)
    }
    const parsedStylish=parsedData(stylishesFilePath)
    return parsedStylish
}

const getSingleStylishFromDb=(stylishId)=>{
      // Parse existing services data
      const stylishData = parsedData(stylishesFilePath)
      const targetStylish=stylishData?.find(stylish=>stylish.id===stylishId)
      return targetStylish
}

const postNewStylishIntoDb=(reqData)=>{
    let dynamicId=generateDynamicId()
    const parsedStylises=parsedData(stylishesFilePath)
    while (checkExistField(parsedStylises, 'id', dynamicId)) {
      dynamicId = generateDynamicId();
  }
  const timestamp = new Date().toISOString();
  const newStylishData={...reqData,id:dynamicId,createdAt:timestamp,updatedAt:timestamp}
  saveNewData(stylishesFilePath,parsedStylises,newStylishData)

  return parsedStylises
}

const updateStylishDataIntoDb=(reqData)=>{
    const{id,stylishName,nationality,employeeId}=reqData
    const parsedStylishData=parsedData(stylishesFilePath)
    const stylishIndex = parsedStylishData.findIndex(stylish => stylish?.id === id);

    if (stylishIndex === -1) {
     throw new Error( `Service with ID ${id} not found` );
    }

    if (stylishName) parsedStylishData[stylishIndex].stylishName = stylishName;
    if (nationality) parsedStylishData[stylishIndex].nationality = nationality;
    if (employeeId) parsedStylishData[stylishIndex].employeeId = employeeId;

    const jsonData = JSON.stringify(parsedStylishData, null, 2); // null and 2 are for formatting (indentation)
    
    // Write data to file
    fs.writeFileSync(stylishesFilePath, jsonData);

    return parsedStylishData
}


const deleteStylishFromDb=(id)=>{
    const parsedStylishData=parsedData(stylishesFilePath)
    const updatedStylishData=parsedStylishData?.filter(stylish=>stylish?.id!==id)
  
          // Save the updated services data
          const jsonData = JSON.stringify(updatedStylishData, null, 2); // null and 2 are for formatting (indentation)
  
          // Write data to file
          fs.writeFileSync(stylishesFilePath, jsonData);
          return parsedStylishData
}

export const stylishServices={
    getAllStylishesFromDb,
    getSingleStylishFromDb,
    postNewStylishIntoDb,
    updateStylishDataIntoDb,
    deleteStylishFromDb
}