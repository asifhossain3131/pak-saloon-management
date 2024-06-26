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

const Stylishes = () => {
    const [open, setOpen] = React.useState(false);
    const [allStylish, setAllStylish] = useState([]);
    const [stylishName, setStylishName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [nationality, setNationality] = useState('');
    const [statusType,setStatusType]=useState('')
    const [currentSingleStylishId,setCurrentSingleStylishId]=useState('')
    useEffect(() => {
        const fetchStylishes = async () => {
            const stylishes = await axios.get('http://localhost:5000/api/stylishes');
            if (stylishes?.data?.success === true) {
                setAllStylish(stylishes?.data?.data);
            }
        }
        fetchStylishes();
    }, [allStylish]);

    const handleAddNewForm = async (e) => {
        e.preventDefault();
        const newStylish = { employeeId, stylishName, nationality };
        try {
           if(statusType==='add'){
            const response = await axios.post('http://localhost:5000/api/stylishes', newStylish);
            if (response?.data?.success) {
                toast.success('new stylish added')
                setAllStylish([...allStylish, newStylish]);
                setOpen(false);
            }
           }else if(statusType==='update'){
            const response = await axios.put('http://localhost:5000/api/updateStylish', {...newStylish,id:currentSingleStylishId});
            if (response?.data?.success) {
                toast.success('single stylish updated')
                setOpen(false);
            }
           }
        } catch (error) {
            toast.error(`failed to ${statusType}  stylish`)
            console.error(`Error ${statusType}ing  stylish`, error);
        }
    }

    const handleDeleteStylish=async(stylishId)=>{
        try {
            const response = await axios.delete(`http://localhost:5000/api/deleteStylish/${stylishId}`);
            if (response?.data?.success) {
                toast.success(' stylish deleted')
            }
        } catch (error) {
            toast.error('failed to remove  stylish')
            console.error('Error removing  stylish', error);
        }
    }

    const handleUpdateStylish=async(stylishId)=>{
        try {
            const response = await axios.get(`http://localhost:5000/api/stylishes/${stylishId}`);
            if (response?.data?.success) {
               const singleStylish=response?.data?.data
               setStylishName(singleStylish?.stylishName)
               setCurrentSingleStylishId(stylishId)
               setEmployeeId(singleStylish?.employeeId)
               setNationality(singleStylish?.nationality)
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
           <h1 className='font-bold text-center  text-black bg-white opacity-70 text-xl mb-6'>All Stylishes</h1>
            <div className='my-2'>
                <Button onClick={() =>{
                    setStatusType('add')
                     setOpen(true)
                }} startDecorator={<Add />}>Add new stylish</Button>
            </div>
            <Table aria-label="basic table" className='bg-white opacity-90 font-bold'>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th style={{ width: '40%' }}>Stylish Name</th>
                        <th>Nationality</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {allStylish?.map(({ stylishName, id, employeeId, nationality }, i) =>
                        <tr key={id}>
                            <td>{employeeId}</td>
                            <td>{stylishName}</td>
                            <td>{nationality}</td>
                            <td><button onClick={()=>handleUpdateStylish(id)}><EditIcon className='text-green-600'></EditIcon></button></td>
                            <td><button onClick={()=>handleDeleteStylish(id)}><DeleteIcon className='text-red-600'></DeleteIcon></button></td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal */}
            <Modal open={open} onClose={() => {
                setOpen(false)
                setStylishName('')
                setEmployeeId('')
                setNationality('')
                setCurrentSingleStylishId('')
                setStatusType('')
            }}>
                <ModalDialog>
                    <DialogTitle>Create new stylish</DialogTitle>
                    <DialogContent>Fill in the information of the service.</DialogContent>
                    <form onSubmit={handleAddNewForm}>
                        <Stack spacing={2}>
                            <FormControl>
                                <FormLabel>Employee ID</FormLabel>
                                <Input
                                    value={employeeId||''}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Stylish Name</FormLabel>
                                <Input
                                    value={stylishName||''}
                                    onChange={(e) => setStylishName(e.target.value)}
                                    required
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Nationality</FormLabel>
                                <Input
                                    value={nationality||''}
                                    onChange={(e) => setNationality(e.target.value)}
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

export default Stylishes;
