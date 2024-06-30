import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import Divider from '@mui/joy/Divider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const [open, setOpen] = React.useState(false);
    const location=useLocation()

    const toggleDrawer = (inOpen) => (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
  
      setOpen(inOpen);
    };
  
    const sidebarMainItems=[
        {path:'/',text:'Home'},
        {path:'/services',text:'Services'},
        {path:'/dailySales',text:'Daily Sales'},
        {path:'/stylish',text:'Stylishes'}
    ]
    return (
      <Box sx={{ display: 'flex' }}>
      <div className='bg-gray-200 w-full flex items-center justify-between px-12 py-4'> 
        <img className='w-[40px]' src="https://cdn-icons-png.flaticon.com/128/8583/8583104.png" alt="" />
        <p className='font-bold text-gray-800 text-md uppercase'>Mohammed Ahmed Saloon</p>
      <div className=' text-center cursor-pointer'>
      <Button variant="solid" color="primary" onClick={toggleDrawer(true)}>
          Sidebar
        </Button>
      </div>
      </div>
        <Drawer open={open} onClose={toggleDrawer(false)}>
          <Box
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              {sidebarMainItems?.map((item,i) => (
                <ListItem key={i}>
                 <Link to={item.path} className={`w-full p-1 ${location.pathname===item.path && 'bg-green-500 text-white font-semibold'}`}> <ListItemButton>{item.text}</ListItemButton></Link>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              {['Sales report', 'Personal Data', 'License'].map((text) => (
                <ListItem key={text}>
                  <ListItemButton>{text}</ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Box>
    );
  }

export default Sidebar;