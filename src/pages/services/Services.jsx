import React, { useEffect, useState } from 'react';
import Table from '@mui/joy/Table';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import toast from 'react-hot-toast';
import axiosInstance from '../../../axios/axiosInstance';

const Services = () => {
    const [open, setOpen] = React.useState(false);
    const [allServices, setAllServices] = useState([]);
    const [serviceName, setServiceName] = useState('');
    const [price, setPrice] = useState('');
    const [img, setImg] = useState('');
    const [statusType,setStatusType]=useState('')
    const [currentSingleSeriveId,setCurrentSingleServiceId]=useState('')
    useEffect(() => {
        const fetchServices = async () => {
            const services = await axiosInstance.get('/services/getAllServices');
            if (services?.data?.success === true) {
                setAllServices(services?.data?.data);
            }
        }
        fetchServices();
    }, [allServices]);

    const handleAddNewForm = async (e) => {
        e.preventDefault();
        const newService = { serviceName, price, img };
        try {
           if(statusType==='add'){
            const response = await axiosInstance.post('/services/postNewService', newService);
            if (response?.data?.success) {
                toast.success('new service added')
                setAllServices([...allServices, newService]);
                setOpen(false);
            }
           }else if(statusType==='update'){
            const response = await axiosInstance.put('/services/updateService', {...newService,serviceId:currentSingleSeriveId});
            if (response?.data?.success) {
                toast.success('single service updated')
                setOpen(false);
            }
           }
        } catch (error) {
            toast.error(`failed to ${statusType}  service`)
            console.error(`Error ${statusType}ing  service`, error);
        }
    }

    const handleDeleteService=async(serviceId)=>{
        try {
            const response = await axiosInstance.post('/services/deleteService',{serviceId});
            if (response?.data?.success) {
                toast.success(' service deleted')
            }
        } catch (error) {
            toast.error('failed to remove  service')
            console.error('Error removing  service', error);
        }
    }

    const handleUpdateService=async(serviceId)=>{
        try {
            const response = await axiosInstance.get(`/services/getSingleService/${serviceId}`);
            if (response?.data?.success) {
               const singleService=response?.data?.data
               setServiceName(singleService?.serviceName)
               setCurrentSingleServiceId(serviceId)
               setImg(singleService?.img)
               setPrice(singleService?.price)
               setStatusType('update')
               setOpen(!open)
            }
        } catch (error) {
            toast.error('failed to retrive single  service')
            console.error('Error retriving single  service', error);
        }
    }

    return (
        <div>
           <h1 className='font-bold text-center  text-black bg-white opacity-70 text-xl mb-6'>All Services</h1>
            <div className='my-2'>
                <Button onClick={() =>{
                    setStatusType('add')
                     setOpen(true)
                }} startDecorator={<Add />}>Add new service</Button>
            </div>
            <Table aria-label="basic table" className='bg-white opacity-90 font-bold'>
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th style={{ width: '40%' }}>Service Name</th>
                        <th>Price(AED)</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {allServices?.map(({ serviceName, id, img, price }, i) =>
                        <tr key={id}>
                            <td><img className='w-[30px]' src={img} alt={serviceName} /></td>
                            <td>{serviceName}</td>
                            <td>{price}</td>
                            <td><button onClick={()=>handleUpdateService(id)}><EditIcon className='text-green-600'></EditIcon></button></td>
                            <td><button onClick={()=>handleDeleteService(id)}><DeleteIcon className='text-red-600'></DeleteIcon></button></td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal */}
            <Modal open={open} onClose={() => {
                setOpen(false)
                setImg('')
                setServiceName('')
                setPrice('')
                setCurrentSingleServiceId('')
                setStatusType('')
            }}>
                <ModalDialog>
                    <DialogTitle>Create new service</DialogTitle>
                    <DialogContent>Fill in the information of the service.</DialogContent>
                    <form onSubmit={handleAddNewForm}>
                        <Stack spacing={2}>
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Input
                                    name='serviceName'
                                    value={serviceName||''}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Price</FormLabel>
                                <Input
                                    name='price'
                                    value={price||''}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Image</FormLabel>
                                <Input
                                    name='img'
                                    value={img||''}
                                    onChange={(e) => setImg(e.target.value)}
                                    required
                                />
                            </FormControl>
                            <Button type="submit">Submit</Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>
        </div>
    );
};

export default Services;
