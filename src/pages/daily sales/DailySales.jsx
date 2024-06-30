import axiosInstance from '../../../axios/axiosInstance';
import React, { useEffect, useState } from 'react';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';

const DailySales = () => {
    const [salesData,setSalesData]=useState([])
    const[currentDate,setCurrentDate]=useState(new Date().toLocaleDateString())
    useEffect(()=>{
        const fetchSalesData=async()=>{
          try {
            const res=await axiosInstance.post(`/sales/getAllSales`,{salesDate:currentDate})
            if(res?.data?.success===true){
                setSalesData(res?.data?.data)
            }
          } catch (error) {
            throw new Error('something went wrong')
          }
        }
        fetchSalesData()
    },[currentDate])

    const handleDateChange = (event) => {
        const date = new Date(event.target.value);
        setCurrentDate(date.toLocaleDateString());
      };
    return (
        <div>
            <h1 className='font-bold text-center  text-black bg-white opacity-70 text-xl'>Sales Data - {currentDate}</h1>
            <div className='my-2'>
          <input type="date" onChange={handleDateChange} />
    </div>
            <Table aria-label="basic table" className='bg-white opacity-90 font-bold'>
                <thead>
                    <tr>
                        <th className='w-3/12'>Transaction ID</th>
                        <th>Services Taken</th>
                        <th>Stylish</th>
                        <th>Tips</th>
                        <th>Including Vat</th>
                        <th>Total amount</th>
                        <th>Cash</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {salesData?.map(({ servicesTaken, stylish, totalAmount, amountIncludingVat,cash,tips,id,time,date }, i) =>
                        <tr key={id}  className='text-xs'>
                            <td>{id}</td>
                            <td>{
                            servicesTaken?.map((service,i)=>
                              <div>
                                <p>{i+1}-{service?.serviceName}</p>
                              </div>
                            )
                            }</td>
                            <td>{stylish}</td>
                            <td>{tips}</td>
                            <td>{amountIncludingVat}</td>
                            <td>{totalAmount}</td>
                            <td>{cash}</td>
                            <td>{time}, {date}</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default DailySales;