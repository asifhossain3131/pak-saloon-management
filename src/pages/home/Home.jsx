import Select, { selectClasses } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Input } from '@mui/joy';
import toast from 'react-hot-toast';
import axiosInstance from '../../../axios/axiosInstance';

const Home = () => {
    const [allServices,setAllServices]=useState([])
    const [selectedStylish,setSelectedStylish]=useState('')
    const [cashAmount,setCashAmount]=useState('')
    const [tips,setTips]=useState('')
    const[allStylishes,setAllStylishes]=useState([])

    useEffect(()=>{
       const fetchServices=async()=>{
        const services=await axiosInstance.get('/services/getAllServices')
        if(services?.data?.success===true){
            setAllServices(services?.data?.data)
        }
       }
       const fetchStylishes=async()=>{
        const res=await axiosInstance.get('/stylishes/getAllStylishes')
        if(res?.data?.success===true){
            setAllStylishes(res?.data?.data)
        }
       }
       fetchServices()
       fetchStylishes()
    },[])

    const [selectedServices, setSelectedServices] = useState([]);

    // Function to toggle selection of a service
    const toggleServiceSelection = (service) => {
        const isSelected = selectedServices.some(selService => selService.serviceName === service.serviceName);
        if (isSelected) {
          setSelectedServices(prevSelected => prevSelected.filter(selService => selService.serviceName !== service.serviceName));
        } else {
          setSelectedServices(prevSelected => [...prevSelected, service]);
        }
    }

    // calculate total prices 
    const tipsValue = tips ? parseInt(tips) : 0
    const totalSelectedServicePrice = selectedServices.reduce((total, service) => total + parseInt(service.price), 0)
    const totalAmountWithTips=parseInt(totalSelectedServicePrice)+parseInt(tipsValue)

    // print functionality 
    const handlePrint=async()=>{
      const salesData={servicesTaken:selectedServices,stylish:selectedStylish,totalAmount:totalAmountWithTips,amountIncludingVat:totalSelectedServicePrice,cash:cashAmount,tips:tipsValue}
       const res=await axiosInstance.post('/sales/postSalesData',salesData)
       if(res.data.success===true){
        setSelectedServices([])
        setCashAmount('')
        setSelectedStylish('')
        setTips('')
        toast.success('new sales report added')
       }else{
        toast.error('something went wrong')
       }
    }
    return (
        <div>
           <h1 className='font-bold text-center  text-black bg-white opacity-70 text-xl'>Payments Book</h1>
          <div className='mt-8 flex justify-between items-center'>
          <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 w-9/12 justify-center items-center '>
                {
                    allServices?.map(({serviceName,price,img},i)=>
                      <div
                    key={i}
                    className={`rounded w-[180px] h-[150px] flex flex-col justify-center items-center cursor-pointer 
                        ${selectedServices.some(selService => selService.serviceName === serviceName) ? 'bg-red-500' : 'hover:bg-red-300'}`}
                    style={{
                        backgroundImage: `url(${img})`,
                        backgroundSize: 'contain', // Or 'cover' depending on the desired effect
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        width: '180px',
                        height: '150px'
                    }}
                    onClick={() => toggleServiceSelection({ serviceName, price })}
                >
                    <div className="bg-black bg-opacity-50 p-2 rounded flex flex-col justify-center items-center w-full h-full">
                        <p className='font-bold text-white'>{serviceName}</p>
                        <p className='font-semibold text-sm text-white'>AED {price}</p>
                    </div>
                </div>
                    )
                }
            </div>

            <div className='w-3/12 bg-blue-500 p-1 rounded'>
                <h3 className='text-center text-white font-semibold'>Services Taken: {selectedServices.length}</h3>
                <div className='my-4 border-b-2 border-black'>
                    {
                        selectedServices.length>0 && selectedServices?.map((service,i)=>
                        <div className='flex items-center justify-around font-bold text-sm text-gray-700'>
                            <span>{i+1}- {service?.serviceName}</span>
                            <span>{service?.price}</span>
                        </div>
                        )
                    }    
                </div>
                <Input className='mb-4' type='number' value={tips} size='sm' onChange={(e)=>setTips(e.target.value)} placeholder="Tips" />
                {totalSelectedServicePrice!==0 && <p className='text-center text-sm font-bold mt-3'>Amount including 5% VAT: {totalSelectedServicePrice}</p>}
                {totalSelectedServicePrice!==0 && <p className='text-center text-sm font-bold mb-2 mt-3'>Total amount(with tips): {totalAmountWithTips}</p>}
          <div className='lg:flex gap-4 justify-between space-y-2 lg:space-y-0 mb-4 '>
          <Select
          value={selectedStylish}
      placeholder="Stylish…"
      indicator={<KeyboardArrowDown />}
      sx={{
        width: 100,
        [`& .${selectClasses.indicator}`]: {
          transition: '0.2s',
          [`&.${selectClasses.expanded}`]: {
            transform: 'rotate(-180deg)',
          },
        },
      }}
    >
        {allStylishes?.map(stylish=>
<Option onClick={()=>setSelectedStylish(stylish?.stylishName)} key={stylish?.employeeId} value={stylish?.stylishName}>{stylish?.stylishName}</Option>
        )}
    </Select>
    <Input value={cashAmount} onChange={(e)=>setCashAmount(e.target.value)} placeholder="Cash" />
          </div>
{selectedServices.length===0 || <div className='flex justify-around gap-4 flex-col lg:flex-row'>
<Button onClick={()=>window.location.reload()} size="md" variant='solid' color="danger">
          Reset
        </Button>
<Button disabled={selectedStylish===''|| cashAmount===''||cashAmount>totalAmountWithTips||cashAmount<0} onClick={handlePrint} size="md" variant='solid' color="success">
          Print 
        </Button>
</div>}

            </div>
          </div>
        </div>
    );
};

export default Home;