import { serviceServices } from "./services.service.js";

const getAllServices=(req, res) => {
    try {
      const result=serviceServices.getAllServicesFromDb()
      res.status(200).json({ success: true, message: 'All data has been retrieved', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load data' });
    }
  };

  const getSingleServiceById=(req,res)=>{
    const {serviceId}=req.params
    try {
       const result=serviceServices.getSingleServiceFromDb(serviceId)
        res.status(200).json({ success: true, message: ' single service has been retrieved', data: result });
    }catch(err){
      console.error('Error retriving single service:', err);
      res.status(500).json({ success: false, message: 'Failed to retrive single service' });
    }
  }

 const postService= (req, res) => {
    const reqData = req.body;
    try {
     const result=serviceServices.postServiceIntoDb(reqData)
      res.status(200).json({ success: true, message: 'New service added',data:result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  const deleteService= (req, res) => {
    const{serviceId}=req.body
    try {
       const result=serviceServices.deleteServiceFromDb(serviceId)
        res.status(200).json({ success: true, message: `Service with ID ${serviceId} deleted successfully`,data:result });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Failed to delete service' });
    }
}


const updateService= (req, res) => {
  const reqData = req.body;
  try {
   const result=serviceServices.updateServiceIntoDb(reqData)
    res.status(200).json({ success: true, message: `Service with ID ${reqData?.serviceId} updated successfully` ,data:result});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while updating the service' });
  }
}


export const serviceControllers={
getAllServices,
getSingleServiceById,
postService,
updateService,
deleteService
}

