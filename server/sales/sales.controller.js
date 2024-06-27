import { salesServices } from "./sales.service.js";

  // sales related apis
  const printAndPostSalesData=(req, res) => {
    const reqBody = req.body;
    try {
     const result=salesServices.postAndPrintSalesDataIntoDb(reqBody)
     res.status(200).json({ success: true, message: 'New sales report added and receipt printed' , data:result});
    } catch (error) {
        console.error('Error processing sales:', error);
        res.status(500).json({ success: false, message: 'Error processing sales' });
    }
};

 const getAllSalesData= (req, res) => {
    try {
     const result=salesServices.getAllSalesDataFromDb()
      res.status(200).json({ success: true, message: 'All data has been retrieved', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load data' });
    }
  };


  export const salesControllers={
printAndPostSalesData,
getAllSalesData
  }