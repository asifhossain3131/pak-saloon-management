import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@mui/joy';

const App = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales');
        setSalesData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch sales data', error);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div>
      <h1 className='text-red-600'>Sales Data</h1>
      <Button variant="plain">Hello world</Button>
    </div>
  );
};

export default App;
