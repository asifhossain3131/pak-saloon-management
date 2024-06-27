import express from 'express'
import { stylishControllers } from './stylishes.controller.js'

const router=express.Router()

router.get('/getAllStylishes',stylishControllers.getAllStylishes)
router.get('/getSingleStylish/:stylishId',stylishControllers.getSingleStylish)
router.post('/postNewStylish',stylishControllers.postNewStylish)
router.put('/updateStylish',stylishControllers.updateStylish)
router.delete('/deleteStylish',stylishControllers.deleteStylish)

export const StylishRoutes=router