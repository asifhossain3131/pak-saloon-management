import express from 'express'
import { salesControllers } from './sales.controller.js'
const router=express.Router()

router.get('/getAllSales',salesControllers.getAllSalesData)
router.post('/postsalesData',salesControllers.printAndPostSalesData)

export const SalesRoutes=router