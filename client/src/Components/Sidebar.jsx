import React, { useState } from 'react';
import { FaTools, FaProjectDiagram, FaRegLightbulb, FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`
        fixed md:static top-0 left-0 h-full w-64 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out 
        bg-gray-900 shadow-lg border-r border-gray-800 z-40
      `}>
        <div className="p-4 border-b border-gray-800 mt-14 md:mt-0">
          <h1 className="text-xl font-bold text-white">Codegen</h1>
        </div>
        <nav className="py-6">
          <ul className="flex flex-col items-start space-y-3 px-4">
            <li className="w-full">
              <Link 
                to="/input" 
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group"
              >
                <FaTools className="mr-3 text-gray-400 group-hover:text-blue-400" />
                <span className="text-lg font-medium">Build</span>
              </Link>
            </li>
            <li className="w-full">
              <Link 
                to="/projects"
                onClick={() => setIsOpen(false)} 
                className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group"
              >
                <FaProjectDiagram className="mr-3 text-gray-400 group-hover:text-blue-400" />
                <span className="text-lg font-medium">Projects</span>
              </Link>
            </li>
            <li className="w-full">
              <Link 
                to="/show"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group"
              >
                <FaRegLightbulb className="mr-3 text-gray-400 group-hover:text-blue-400" />
                <span className="text-lg font-medium">Showcase</span>
              </Link>
            </li>
            <li className="w-full">
              <Link 
                to="/"
                onClick={() => {
                  sessionStorage.clear();
                  setIsOpen(false);
                }}
                className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group"
              >
                <FaRegLightbulb className="mr-3 text-gray-400 group-hover:text-blue-400" />
                <span className="text-lg font-medium">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;