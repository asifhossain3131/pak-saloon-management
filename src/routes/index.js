import express from 'express'
import { SalesRoutes } from '../../server/sales/sales.route.js'
import { ServiceRoutes } from '../../server/services/services.route.js'
import { StylishRoutes } from '../../server/stylishes/stylishes.route.js'

const router=express.Router()

const moduleRoutes=[
    {
        path:'/sales',
        route:SalesRoutes
    },
    {
        path:'/services',
        route:ServiceRoutes
    },
    {
        path:'/stylishes',
        route:StylishRoutes
    }
]

moduleRoutes.forEach(route=>router.use(route.path,route.route))

export default router