import React from 'react';
import { FaTools, FaProjectDiagram, FaRegLightbulb } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className='bg-gray-900 w-64 min-h-screen shadow-lg border-r border-gray-800'>
            <div className='p-4 border-b border-gray-800'>
                <h1 className='text-xl font-bold text-white'>Codegen</h1>
            </div>
            <nav className='py-6'>
                <ul className='flex flex-col items-start space-y-3 px-4'>
                    <li className='w-full'>
                        <Link 
                            to="/input" 
                            className='flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group'
                        >
                            <FaTools className='mr-3 text-gray-400 group-hover:text-blue-400' />
                            <span className='text-lg font-medium'>Build</span>
                        </Link>
                    </li>
                    <li className='w-full'>
                        <Link 
                            to="/projects" 
                            className='flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group'
                        >
                            <FaProjectDiagram className='mr-3 text-gray-400 group-hover:text-blue-400' />
                            <span className='text-lg font-medium'>Projects</span>
                        </Link>
                    </li>
                    <li className='w-full'>
                        <Link 
                            to="/show" 
                            className='flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group'
                        >
                            <FaRegLightbulb className='mr-3 text-gray-400 group-hover:text-blue-400' />
                            <span className='text-lg font-medium'>Showcase</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;