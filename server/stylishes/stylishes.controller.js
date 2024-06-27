import { stylishServices } from "./stylishes.service.js";

const getAllStylishes=(req,res)=>{
    try {
      const result=stylishServices.getAllStylishesFromDb()
      res.status(200).json({ success: true, message: 'all stylish retrived successfully',data:result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while retriving the stylishes' });
      console.error('the error is',error)
    }
  }
  
  
  const getSingleStylish=(req,res)=>{
    const {stylishId}=req.params
    try {
        const result=stylishServices.getSingleStylishFromDb(stylishId)
        res.status(200).json({ success: true, message: ' single service has been retrieved', data: result });
    }catch(err){
      console.error('Error retriving single service:', err);
      res.status(500).json({ success: false, message: 'Failed to retrive single service' });
    }
  }
  
 const postNewStylish=(req,res)=>{
   try {
    const reqData=req.body
    const result=stylishServices.postNewStylishIntoDb(reqData)
  res.status(200).json({ success: true, message: 'a new stylish is added successfully',data:result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while posting a stylishe' });
    console.error('the error is',error)
   }
  }
  
  const updateStylish=(req,res)=>{
     const reqData=req.body
    try {
      const result=stylishServices.updateStylishDataIntoDb(reqData)
      res.status(200).json({ success: true, message: `Stylish with ID ${reqData?.id} updated successfully`,data:result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while updating the stylish' });
      console.error('the error is',error)
    }
  }
  
  const deleteStylish=(req,res)=>{
    const{id}=req.params
  try {  
      const result=stylishServices.deleteStylishFromDb(id)
          res.status(200).json({ success: true, message: `stylish with ID ${id} deleted successfully`,data:result });
      } catch (error) {
          console.error('Error deleting service:', error);
          res.status(500).json({ success: false, message: 'Failed to delete stylish' });
  }
  }


  export const stylishControllers={
getAllStylishes,
getSingleStylish,
postNewStylish,
updateStylish,
deleteStylish
  }