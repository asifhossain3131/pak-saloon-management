import { checkExistField, checkExistFile, createNewFile, generateDynamicId, parsedData, saveNewData, servicesFilePath } from "../../serverUtils.js"
import fs from 'fs';

const getAllServicesFromDb=()=>{
    const isExistFile=checkExistFile(servicesFilePath)
      if(!isExistFile){
        createNewFile(servicesFilePath)
      }
      const servicesData = parsedData(servicesFilePath)
      return servicesData
}

const getSingleServiceFromDb=(serviceId)=>{
     // Parse existing services data
     const servicesData = parsedData(servicesFilePath)
     const targetService=servicesData?.find(service=>service.id===serviceId)
     return targetService
}

const postServiceIntoDb=(reqData)=>{
    let dynamicId = generateDynamicId();
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
    return serviceData
}

const deleteServiceFromDb=(serviceId)=>{
      // Parse existing services data
      const servicesData = parsedData(servicesFilePath);

      // Filter out the service with the matching serviceId
      const filteredServices = servicesData.filter(service => service.id !== serviceId);

      // Check if any service was actually removed
      if (filteredServices.length === servicesData.length) {
          throw new Error('service already exists')
      }

      // Save the updated services data
      const jsonData = JSON.stringify(filteredServices, null, 2); // null and 2 are for formatting (indentation)

      // Write data to file
      fs.writeFileSync(servicesFilePath, jsonData);
      return servicesData
}

const updateServiceIntoDb=(reqData)=>{
    const { serviceId, serviceName, img, price } = reqData;
 // Parse existing services data
 const servicesData = parsedData(servicesFilePath);

 // Find the index of the service with the matching serviceId
 const serviceIndex = servicesData.findIndex(service => service?.id === serviceId);

 // If the service is not found, return an error
 if (serviceIndex === -1) {
   throw new Error( `Service with ID ${serviceId} not found`);
 }

 // Update service properties
 if (serviceName) servicesData[serviceIndex].serviceName = serviceName;
 if (img) servicesData[serviceIndex].img = img;
 if (price) servicesData[serviceIndex].price = price;

 // Save the updated services data
 const jsonData = JSON.stringify(servicesData, null, 2); // null and 2 are for formatting (indentation)
 
 // Write data to file
 fs.writeFileSync(servicesFilePath, jsonData);

 return servicesData
}

export const serviceServices={
    getAllServicesFromDb,
    getSingleServiceFromDb,
    postServiceIntoDb,
    deleteServiceFromDb,
    updateServiceIntoDb
}