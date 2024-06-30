import express from 'express'
import { salesControllers } from './sales.controller.js'
const router=express.Router()

router.post('/getAllSales',salesControllers.getAllSalesData)
router.post('/postSalesData',salesControllers.printAndPostSalesData)

export const SalesRoutes=router