import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    const backgroundImageUrl = 'https://media.istockphoto.com/id/1423513079/photo/luxury-hairdressing-and-beauty-salon-interior-with-chairs-mirrors-and-spotlights.webp?b=1&s=170667a&w=0&k=20&c=GTjjLjO1c9SdAGLLJHL3n5sEDdP8dpVXXl3ZpysmxeM='; // Replace with your image URL

    return (
        <div 
            className='min-h-screen'
            style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <Sidebar />
            <div className='w-11/12 mt-8 p-4 mx-auto '>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
