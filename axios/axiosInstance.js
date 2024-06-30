import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1', 
//   timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  }
});


export default axiosInstance;
