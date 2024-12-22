import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'


const FinalShowCase = () => {
    const location = useLocation();
    const { code } = location.state;
    console.log(code,"machaney")
    const id = code;
    const [codes, setCodes] = useState('');

    const getCodeById = async()=>{
        try {
            const response = await axios.get(`http://localhost:3001/api/sendCodeById?id=${id}`);
            if (response.data && response.data.response) {
                setCodes(response.data.response[0].formattedCode);
            }
        } catch (error) {
            console.error("Error fetching code:", error);
        }
    }

    useEffect(()=>{
        getCodeById();

    },[])

  return (
    <div className='flex h-screen'>
        <iframe srcDoc={codes}  title="preview"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-modals">

        </iframe>
    </div>
  )
}

export default FinalShowCase
