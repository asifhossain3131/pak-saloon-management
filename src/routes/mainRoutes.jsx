import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/home/Home";
import Services from "../pages/services/Services";
import Stylishes from "../pages/stylish/Stylishes";
import DailySales from "../pages/daily sales/DailySales";
const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout></MainLayout>,
      children:[
        {
            path:'/',
            element:<Home></Home>
        },
        {
            path:'/services',
            element:<Services></Services>
        },
        {
            path:'/stylish',
            element:<Stylishes></Stylishes>
        },
        {
          path:'/dailySales',
          element:<DailySales></DailySales>
        }
      ]
    },
  ]);

  export default router