import express from 'express'
import { serviceControllers } from './services.controller.js'

const router=express.Router()

router.get('/getAllServices',serviceControllers.getAllServices)
router.get('/getSingleService/:serviceId',serviceControllers.getSingleServiceById)
router.post('/postNewService',serviceControllers.postService)
router.post('/deleteService',serviceControllers.deleteService)
router.put('/getAllServices',serviceControllers.updateService)

export const ServiceRoutes=router